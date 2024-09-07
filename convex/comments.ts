import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getArticleComments = query({
  args: { articleId: v.id("newsArticles") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("articleId"), args.articleId))
      .order("desc")
      .collect();

    const commentsWithAuthor = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return { ...comment, author };
      })
    );

    // Organize comments into a tree structure
    const commentTree = [];
    const commentMap = new Map();

    for (const comment of commentsWithAuthor) {
      commentMap.set(comment._id, { ...comment, replies: [] });
    }

    for (const comment of commentsWithAuthor) {
      if (comment.parentId === null) {
        commentTree.push(commentMap.get(comment._id));
      } else {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentMap.get(comment._id));
        }
      }
    }

    return commentTree;
  },
});

export const addComment = mutation({
  args: {
    articleId: v.id("newsArticles"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    const commentId = await ctx.db.insert("comments", {
      articleId: args.articleId,
      authorId: user._id,
      content: args.content,
      createdAt: Date.now(),
      parentId: args.parentId || null,
    });

    return commentId;
  },
});