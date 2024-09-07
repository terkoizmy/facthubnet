import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upvote = mutation({
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

    const existingVote = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("articleId"), args.articleId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    if (existingVote) {
      if (existingVote.voteType === "upvote") {
        await ctx.db.delete(existingVote._id);
        await ctx.db.patch(args.articleId, { upvotes: article.upvotes - 1 });
      } else {
        await ctx.db.patch(existingVote._id, { voteType: "upvote" });
        await ctx.db.patch(args.articleId, {
          upvotes: article.upvotes + 1,
          downvotes: article.downvotes - 1,
        });
      }
    } else {
      await ctx.db.insert("votes", {
        articleId: args.articleId,
        userId: user._id,
        voteType: "upvote",
      });
      await ctx.db.patch(args.articleId, { upvotes: article.upvotes + 1 });
    }
  },
});

export const downvote = mutation({
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

    const existingVote = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("articleId"), args.articleId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    if (existingVote) {
      if (existingVote.voteType === "downvote") {
        await ctx.db.delete(existingVote._id);
        await ctx.db.patch(args.articleId, { downvotes: article.downvotes - 1 });
      } else {
        await ctx.db.patch(existingVote._id, { voteType: "downvote" });
        await ctx.db.patch(args.articleId, {
          upvotes: article.upvotes - 1,
          downvotes: article.downvotes + 1,
        });
      }
    } else {
      await ctx.db.insert("votes", {
        articleId: args.articleId,
        userId: user._id,
        voteType: "downvote",
      });
      await ctx.db.patch(args.articleId, { downvotes: article.downvotes + 1 });
    }
  },
});