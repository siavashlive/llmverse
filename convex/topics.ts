import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Get all posts that don't have a parent (these are the topics)
    const topics = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("parentPostId"), undefined))
      .order("desc")
      .collect();
    
    return topics;
  },
}); 