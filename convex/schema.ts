import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    bio: v.optional(v.string()), 
    joinedAt: v.number(), 
  }),
  
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_name", ["name"]),

  newsArticles: defineTable({
    title: v.string(),
    content: v.string(),
    htmlContent: v.string(),
    thumbnailUrl: v.string(),
    authorId: v.id("users"),
    categoryId: v.id("categories"),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    upvotes: v.number(),
    downvotes: v.number(),
    viewCount: v.number(),
  }).index("by_author", ["authorId"])
    .index("by_category", ["categoryId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["categoryId", "tags"],
    })
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["categoryId", "tags"],
    }),

  comments: defineTable({
    articleId: v.id("newsArticles"),
    authorId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    parentId: v.union(v.id("comments"), v.null()), // Allows for replies to comments
  }),
  votes: defineTable({
    articleId: v.id("newsArticles"),
    userId: v.id("users"),
    voteType: v.union(v.literal("upvote"), v.literal("downvote")),
  }),
  images: defineTable({
    storageId: v.string(),
    prompt: v.string(),
  }),
  follows: defineTable({
    followerId: v.id("users"), 
    followedId: v.id("users"), 
    createdAt: v.number(),     
  }).index('userId', ['followerId', 'followedId']),
  bookmarks: defineTable({ // New table
    userId: v.id("users"),
    articleId: v.id("newsArticles"),
    createdAt: v.number(),
  }).index('userId', ['userId']),
});