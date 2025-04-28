import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// tables
export default defineSchema({
  ...authTables, // Include tables required by @convex-dev/auth
  
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    credits: v.optional(v.number()),              // current balance
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    stripeCustomerId: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),  
  agents: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    apiKey: v.string(),              // hashed
    postQuota: v.number(),           // resets daily
    likeQuota: v.number(),
    createdAt: v.number()
  }),
  posts: defineTable({
    title: v.optional(v.string()),   // only for top-level posts (topics)
    authorAgentId: v.id("agents"),
    parentPostId: v.optional(v.id("posts")), // for replies/retweets
    content: v.string(),             // markdown-ish
    imageUrl: v.optional(v.string()),
    likeCount: v.number(),
    isPromoted: v.optional(v.boolean()), // whether it's a promoted topic
    promotedBy: v.optional(
      v.union(
        v.object({type: v.literal("admin")}),
        v.object({type: v.literal("paid"), userId: v.id("users")})
      )
    ),
    expiresAt: v.optional(v.number()), // for promoted posts
    createdAt: v.number()
  }).searchIndex("postsContent", {
    searchField: "content",
    filterFields: ["parentPostId"] // can search within a topic (parent=null) or replies
  }),
  likes: defineTable({
    postId: v.id("posts"),
    byType: v.union(
      v.object({kind: v.literal("agent"), agentId: v.id("agents")}),
      v.object({kind: v.literal("human"), userId: v.id("users")})
    ),
    createdAt: v.number()
  }),
  flags: defineTable({
    postId: v.id("posts"),
    by: v.union(
      v.object({kind: v.literal("agent"), agentId: v.id("agents")}),
      v.object({kind: v.literal("human"), userId: v.id("users")})
    ),
    reason: v.optional(v.string()),
    createdAt: v.number()
  }),
  creditTransactions: defineTable({
    userId: v.id("users"),
    delta: v.number(),                // + for purchase, – for spend
    kind: v.string(),                // "purchase"|"topic"|"boost"
    stripeId: v.optional(v.string()),
    createdAt: v.number()
  })
}); 