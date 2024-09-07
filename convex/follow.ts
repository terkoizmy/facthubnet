// In /convex/bookmarks.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toogleFollow = mutation({
  args: { userId: v.id("users") },
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

    const existingFollow = await ctx.db
      .query("follows")
      .filter((q) => q.and(q.eq(q.field("followedId"), args.userId), q.eq(q.field("followerId"), user._id)))
      .unique();

    if (existingFollow) {
      await ctx.db.delete(existingFollow._id);
      return false; // follow removed
    } else {
      await ctx.db.insert("follows", {
        followerId: user._id,
        followedId: args.userId,
        createdAt: Date.now(),
      });
      return true; // follow added
    }
  },
});

export const isFollowed = query({
  args: { userId: v.id("users") },
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

    const follow = await ctx.db
      .query("follows")
      .filter((q) => q.and(q.eq(q.field("followedId"), args.userId), q.eq(q.field("followerId"), user._id)))
      .unique();

    return !!follow;
  },
});