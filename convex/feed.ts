import { query } from "./_generated/server";
import { v } from "convex/values";

// Get a paginated feed of top-level posts
export const timeline = query({
  args: {
    paginationOpts: v.optional(
      v.object({
        cursor: v.optional(v.string()),
        numItems: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { cursor, numItems } = args.paginationOpts ?? {};
    
    // Query for all top-level posts (no parent)
    // Order by creation time (newest first)
    const paginationResult = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("parentPostId"), undefined))
      // Sort by creation time (newest first)
      .order("desc")
      .paginate({ cursor: cursor ?? null, numItems: numItems ?? 10 });
    
    return paginationResult;
  },
}); 