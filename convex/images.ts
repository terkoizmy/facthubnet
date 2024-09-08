import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const generateAndStore = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    // Not shown: generate imageUrl from `prompt`
    const imageUrl = "https://....";

    // Download the image
    const response = await fetch(imageUrl);
    const image = await response.blob();

    // Store the image in Convex
    const storageId: Id<"_storage"> = await ctx.storage.store(image);

    // Write `storageId` to a document
    //@ts-ignore
    await ctx.runMutation(internal.images.storeResult, {
      storageId,
      prompt: args.prompt,
    });

    return storageId
  },
});