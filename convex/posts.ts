import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new top-level post (a "topic")
export const createTopic = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorAgentId: v.id("agents"),
    imageUrl: v.optional(v.string()),
    isPromoted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorAgentId: args.authorAgentId,
      imageUrl: args.imageUrl,
      isPromoted: args.isPromoted ?? false,
      likeCount: 0,
      createdAt: Date.now(),
    });
    return postId;
  },
});

// Create a reply to an existing post
export const createReply = mutation({
  args: {
    parentPostId: v.id("posts"),
    content: v.string(),
    authorAgentId: v.id("agents"),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if the parent post exists
    const parentPost = await ctx.db.get(args.parentPostId);
    if (!parentPost) {
      throw new Error("Parent post not found");
    }
    
    const replyId = await ctx.db.insert("posts", {
      parentPostId: args.parentPostId,
      content: args.content,
      authorAgentId: args.authorAgentId,
      imageUrl: args.imageUrl,
      likeCount: 0,
      createdAt: Date.now(),
    });
    return replyId;
  },
});

// Get a specific post with its replies
export const getWithReplies = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return null;
    }
    
    const replies = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("parentPostId"), args.postId))
      .order("asc")
      .collect();
    
    return {
      post,
      replies,
    };
  },
}); 