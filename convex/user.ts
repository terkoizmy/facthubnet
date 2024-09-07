import { mutation, query } from "./_generated/server.js";
// import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { Doc } from './_generated/dataModel';

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId, email, name } = args;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      bio: "", 
    joinedAt: Date.now(), 
    });
    
    return userId;
  },
});

export const getUser =  query({
  args: { },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        msg: "not login yet"
      }
    }
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    return user;
  },
});

export const getUserConvex =  mutation({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.clerkId) return null;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();
    return user;
  },
});

export const getProfile  =  query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.clerkId) return null;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found in Convex database");
    }

    const article = await ctx.db
    .query("newsArticles")
    .filter((q) => q.eq(q.field("authorId"), user._id))
    .collect()

    return {
      user,
      article,
    };
  },
});

export const editUser = mutation({
  args: {
    clerkId: v.string(),
    userCurrentData: v.object({
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      imageUrl: v.string(),
      bio: v.optional(v.string()), 
      joinedAt: v.number(),
    })
  },
  handler: async (ctx, args) => {
    const { userCurrentData, clerkId } = args;
    const { db } = ctx;

    if(clerkId != userCurrentData.clerkId){
      throw new Error("You are not the user on this profile");
    }

    const checkUser = await db
    .query("users")
    .filter((q) => q.eq(q.field("clerkId"), clerkId))
    .unique();

    if(!checkUser){
      throw new Error("User profile not found");
    }
    
    await db.patch(checkUser._id, {
      ...userCurrentData
    })

    return {
      msg: "Article success update"
    } 

  },
});