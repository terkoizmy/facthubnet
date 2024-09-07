// In /convex/bookmarks.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleBookmark = mutation({
  args: { articleId: v.id("newsArticles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const existingBookmark = await ctx.db
      .query("bookmarks")
      .filter((q) => q.eq(q.field("articleId"), args.articleId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (existingBookmark) {
      await ctx.db.delete(existingBookmark._id);
      return false; // Bookmark removed
    } else {
      await ctx.db.insert("bookmarks", {
        userId: user._id,
        articleId: args.articleId,
        createdAt: Date.now(),
      });
      return true; // Bookmark added
    }
  },
});

export const isBookmarked = query({
  args: { articleId: v.id("newsArticles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    const bookmark = await ctx.db
      .query("bookmarks")
      .filter((q) => q.eq(q.field("articleId"), args.articleId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    return !!bookmark;
  },
});