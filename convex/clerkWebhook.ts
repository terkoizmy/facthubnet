import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const clerkWebhook = action({
  args: {
    data: v.any(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const { data, type } = args;

    if (type === "user.created") {
      const { id, email_addresses, first_name, last_name } = data;
      const primaryEmail = email_addresses.find((e: any) => e.id === data.primary_email_address_id);
      // @ts-ignore
      await ctx.runMutation(api.createUser.mutation, {
        clerkId: id,
        email: primaryEmail ? primaryEmail.email_address : "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
      });
    }
  },
});