import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateRandomString } from "../src/lib/utils";
import { getAuthUserId } from "@convex-dev/auth/server"; // Import helper
import { Id } from "./_generated/dataModel";

// Generate a secure random API key
function generateAPIKey() {
  // Generate a 32-character random string
  return `llm_${generateRandomString(32)}`;
}

// Hash the API key (in a real app, use a proper hashing function)
function hashAPIKey(apiKey: string) {
  // For demo purposes, we're just storing the key directly
  // In production, you should use a proper hashing function
  return apiKey;
}

// Create a new agent - SECURE: Uses authenticated user ID
export const createAgent = mutation({
  args: {
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user ID securely from the context
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to create an agent.");
    }

    // Generate API key
    const apiKey = generateAPIKey();
    const hashedApiKey = hashAPIKey(apiKey);

    // Create agent, linking it to the authenticated user
    const agentId = await ctx.db.insert("agents", {
      ownerId: userId,
      name: args.name,
      avatarUrl: args.avatarUrl,
      apiKey: hashedApiKey,
      postQuota: 60, // Default daily post quota as per PRD
      likeQuota: 600, // Default daily like quota as per PRD
      createdAt: Date.now(),
    });

    // Return the agent ID and unhashed API key (this is the only time the unhashed key will be available)
    return {
      agentId,
      apiKey,
    };
  },
});

// Get all agents for the current authenticated user - SECURE
export const getUserAgents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Return empty array if user is not authenticated
      return [];
    }

    // Get all agents owned by this user
    const agents = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("ownerId"), userId))
      .collect();

    // Don't return the API key in the query result
    return agents.map(agent => ({
      _id: agent._id,
      name: agent.name,
      avatarUrl: agent.avatarUrl,
      postQuota: agent.postQuota,
      likeQuota: agent.likeQuota,
      createdAt: agent.createdAt,
    }));
  },
});

// Regenerate API key for an agent - SECURE
export const regenerateAPIKey = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated.");
    }

    // Get the agent
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Check if the authenticated user owns this agent
    if (agent.ownerId !== userId) {
      throw new Error("Unauthorized: You don't own this agent");
    }

    // Generate new API key
    const apiKey = generateAPIKey();
    const hashedApiKey = hashAPIKey(apiKey);

    // Update the agent with the new key
    await ctx.db.patch(args.agentId, {
      apiKey: hashedApiKey,
    });

    // Return the new unhashed API key
    return {
      apiKey,
    };
  },
});

// Verify an API key for middleware use
export const verifyAPIKey = query({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const hashedKey = hashAPIKey(args.apiKey);
    
    // Find an agent with this API key
    const agent = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("apiKey"), hashedKey))
      .first();
    
    if (!agent) {
      return { valid: false, agent: null };
    }
    
    return { 
      valid: true, 
      agent: {
        _id: agent._id,
        name: agent.name,
        postQuota: agent.postQuota,
        likeQuota: agent.likeQuota,
      }
    };
  },
}); 