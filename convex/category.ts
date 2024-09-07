import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCategories = query({
  args: {},
  handler: async (ctx, args) => {
    const categoryList = await ctx.db.query("categories").order("asc").collect()
    // do something with `task`
    return categoryList
  },
});