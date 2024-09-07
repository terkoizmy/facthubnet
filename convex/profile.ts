import { mutation, query } from "./_generated/server.js";
// import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getUserProfile =  query({
  args: { profileId: v.id("users")},
  handler: async (ctx, args) => {
    const { db, storage} = ctx
    const { profileId } = args

    if (!profileId) return {};
    const user = await db
    .query("users")
    .filter((q) => q.eq(q.field("_id"), profileId), )
    .unique();

    if (!user) throw new Error("User not found in Convex database"); 

    const articlesUser = await db
    .query("newsArticles")
    .withIndex("by_author", (q) => q.eq("authorId", user._id))
    .order("desc")
    .collect()

    const countFollowers = await db
    .query("follows")
    .filter((q) => q.eq(q.field('followedId'), user._id))
    .collect()

    const votes = await db
    .query("votes")
    .filter((q) => q.eq(q.field('userId'), user._id))
    .collect()

    return {
      user,
      countArticle: articlesUser.length,
      countFollowers: countFollowers.length,
      upvotes: votes.length,
    };
  },
});

export const getRecentActivities = query({
  args: {
    limit: v.optional(v.number()),
    profileId: v.id("users")
  },
  handler: async (ctx, args) => {
    const { db } = ctx;
    const limit = args.limit ?? 10; // Default to 10 if not specified

    // Fetch recent comments
    const comments = await db
      .query("comments")
      .filter((q) => q.eq(q.field('authorId'), args.profileId))
      .order("desc")
      .take(limit);

    // Fetch recent votes
    const votes = await db
      .query("votes")
      .filter((q) => q.eq(q.field('userId'), args.profileId))
      .order("desc")
      .take(limit);

    // Combine and sort activities
    const activities = [...comments, ...votes].sort((a, b) => 
      b._creationTime - a._creationTime
    ).slice(0, limit);

    // Fetch additional data for each activity
    const activitiesWithDetails = await Promise.all(activities.map(async (activity) => {
      // @ts-ignore
      const user = await db.get(args.profileId);
      const article = await db.get(activity.articleId);
      return {
        ...activity,
        user,
        article,
        type: 'content' in activity ? 'comment' : 'vote'
      };
    }));

    return activitiesWithDetails;
  },
});