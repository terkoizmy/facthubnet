import { mutation } from "./_generated/server.js";
import { query } from "./_generated/server";
import { action } from "./_generated/server"; 
// import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
// import { Configuration, OpenAIApi } from "openai";
import { httpAction } from "./_generated/server.js";


export const getArticle = query({
  args: {
    articleId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { db } = ctx;
    if (!args.articleId) {
      throw new Error("Article not found in database");
    }

    const article = await db
    .query("newsArticles")
    .filter((q) => q.eq(q.field("_id"), args.articleId))
    .unique()

    return {
      ...article
    }
  },
})

export const createNewsArticle = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    htmlContent: v.string(),
    thumbnailUrl: v.string(),
    authorId: v.id("users"),
    tags: v.array(v.string()),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const newsArticleId = await ctx.db.insert("newsArticles", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
    });
    return newsArticleId;
  },
});

export const getArticlesWithAuthors = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { db } = ctx;

    // Fetch articles
    const paginatedArticles = await db.query("newsArticles")
      .order("desc")
      .paginate(args.paginationOpts);

    // Fetch author data and comment count for each article
    const articlesWithAuthorsAndCommentCount = await Promise.all(
      paginatedArticles.page.map(async (article) => {
        const [author, commentCount] = await Promise.all([
          db.get(article.authorId),
          db.query("comments")
            .filter((q) => q.eq(q.field("articleId"), article._id))
            .collect()
            .then((comments) => comments.length)
        ]);

        return {
          ...article,
          author: author,
          commentCount: commentCount,
        };
      })
    );

    return {
      page: articlesWithAuthorsAndCommentCount,
      continueCursor: paginatedArticles.continueCursor,
    };
  },
});

export const getArticlesUser = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const { db } = ctx;
    const { paginationOpts, userId } = args

    // Fetch articles
    const paginatedArticles = await db.query("newsArticles")
      .filter((q) => q.eq(q.field("authorId"), userId))
      .order("desc")
      .paginate(paginationOpts);

    // Fetch author data and comment count for each article
    const articlesWithAuthorsAndCommentCount = await Promise.all(
      paginatedArticles.page.map(async (article) => {
        const [author, commentCount] = await Promise.all([
          db.get(article.authorId),
          db.query("comments")
            .filter((q) => q.eq(q.field("articleId"), article._id))
            .collect()
            .then((comments) => comments.length)
        ]);

        return {
          ...article,
          author: author,
          commentCount: commentCount,
        };
      })
    );

    return {
      page: articlesWithAuthorsAndCommentCount,
      continueCursor: paginatedArticles.continueCursor,
    };
  },
});

export const getArticlesUserBookmark = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const { db } = ctx;
    const { paginationOpts, userId } = args

    // Fetch articles
    const paginatedBookmark = await db.query("bookmarks")
      .filter((q) =>  q.eq(q.field("userId"), userId))
      .order("desc")
      .paginate(paginationOpts);

    // Fetch author data and comment count for each article
    const bookmarkWithArticlesWithAuthorsAndCommentCount = await Promise.all(
      paginatedBookmark.page.map(async (bookmark) => {
        const [article ,author, commentCount] = await Promise.all([
          db.get(bookmark.articleId),
          db.get(bookmark.userId),
          db.query("comments")
            .filter((q) => q.eq(q.field("articleId"), bookmark.articleId))
            .collect()
            .then((comments) => comments.length)
        ]);

        return {
          ...article,
          author: author,
          commentCount: commentCount,
        };
      })
    );

    return {
      page: bookmarkWithArticlesWithAuthorsAndCommentCount,
      continueCursor: paginatedBookmark.continueCursor,
    };
  },
});

export const getArticleWithAuthor = query({
  args: {
    articleId: v.id("newsArticles"),
  },
  handler: async (ctx, args) => {
    const { db } = ctx;
    const { articleId } = args;

    const article = await db.get(articleId);

    if (!article) {
      return { article: null };
    }
    const author = await db.get(article.authorId);
    return {
      ...article,
      author
    };
  },
});

export const editArticle = mutation({
  args: {
    articleId: v.id("newsArticles"),
    // @ts-ignore
    articleData: v.object({
      title: v.string(),
      content: v.string(),
      htmlContent: v.string(),
      thumbnailUrl: v.string(),
      authorId: v.id("users"),
      tags: v.array(v.string()),
      categoryId: v.id("categories"),
    }) ,
  },
  handler: async (ctx, args) => {
    const { db } = ctx
    const { articleId, articleData } = args

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    const checkUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .unique();

    if(checkUser?._id != articleData.authorId){
      throw new Error("You are not the author on this article");
    }
    
    await db.patch(articleId, {
      ...articleData,
    })

    return {
      msg: "Article success update"
    } 
  },
})

export const deleteArticle = mutation({
  args: {
    articleId: v.id("newsArticles"),
    clerkId: v.string(),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { db } = ctx
    const { articleId, clerkId, authorId } = args

    const checkUser = await db
    .query("users")
    .filter((q) => q.eq(q.field("clerkId"), clerkId))
    .unique();

    if(checkUser?._id != authorId){
      throw new Error("You are not the author on this article");
    }
    
    await db.delete(articleId)

    return {
      msg: "Article success delete"
    } 
  },
})

export const getStaticProps = action({ 
  args: {  
  },
  handler: async (ctx, args) => {  
  const res = await fetch(`${process.env.SUMMERIZE_API_URL}/`)
  const repo = await res.json()
  return repo
  }
})

export const generateAndStoreSummary = action({
  args: { 
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {

    const response = await fetch(
      `${process.env.SUMMERIZE_API_URL}/summarize`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'api-key': `${process.env.SUMMERIZE_AI_KEY}`,
         },
        body: JSON.stringify({
          title: args.title,
          content: args.content
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.summary;

    // await ctx.db.patch(args.articleId, { aiSummary: summary });

    return summary;
  },
});