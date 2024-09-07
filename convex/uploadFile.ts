// In your Convex function file (e.g., uploadFile.ts)
import { v } from "convex/values";
import { mutation, action } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    // Here you can process the file if needed
    // For now, we'll just return the storageId
    return args.storageId;
  },
});

export const deleteImageFromStorage = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const { storageId } = args;

    try {
      await ctx.storage.delete(storageId);
      return { success: true, message: "Image deleted successfully" };
    } catch (error) {
      console.error("Failed to delete image:", error);
      return { success: false, message: "Failed to delete image" };
    }
  },
});