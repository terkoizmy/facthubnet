import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRecommendations = query({
  args: { clerkId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { clerkId, limit = 5 } = args;
    const { db } = ctx

    // Get user from Clerk ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), clerkId))
      .first();

    if (!user) {
      return [];
    }

    // Get user's recent interactions
    const recentInteractions = await ctx.db
      .query("userInteractions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);

    // Count interactions by category
    const categoryInteractions: Record<string, number> = {};
    for (const interaction of recentInteractions) {
      const article = await ctx.db.get(interaction.articleId);
      if (article) {
        categoryInteractions[article.categoryId] = (categoryInteractions[article.categoryId] || 0) + 1;
      }
    }

    // Sort categories by interaction count
    const sortedCategories = Object.entries(categoryInteractions)
      .sort(([, a], [, b]) => b - a)
      .map(([categoryId]) => categoryId)
      .slice(0, 3); // Top 3 categories

    // Get recent articles from top categories
    const recommendedArticles = await ctx.db
    .query("newsArticles")
    .filter((q) => 
      q.or(
        ...sortedCategories.map(categoryId => 
          q.eq(q.field("categoryId"), categoryId)
        )
      )
    )
    .order("desc")
    .take(limit);

    // Fetch author information for each article
    const articlesWithAuthors = await Promise.all(
      recommendedArticles.map(async (article) => {
        const [author, commentCount] = await Promise.all([
          db.get(article.authorId),
          db.query("comments")
            .filter((q) => q.eq(q.field("articleId"), article._id))
            .collect()
            .then((comments) => comments.length)
        ]);
        return { ...article, author, commentCount: commentCount, };
      })
    );

    return articlesWithAuthors;
  },
});

export const trackInteraction = mutation({
  args: { 
    articleId: v.id("newsArticles"),
    interactionType: v.string(),
  },
  handler: async (ctx, args) => {
    const { articleId, interactionType } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    // Get user from Clerk ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.insert("userInteractions", {
      userId: user._id,
      articleId,
      interactionType,
      timestamp: Date.now(),
    });
  },
});