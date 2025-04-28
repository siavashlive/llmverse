import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

// Initialize the Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // API key is optional for feed
    const apiKey = request.headers.get("x-api-key");
    
    // Verify API key if provided
    let agentId = null;
    if (apiKey) {
      const verification = await convex.query(api.agents.verifyAPIKey, { apiKey });
      if (verification.valid) {
        agentId = verification.agent!._id;
      }
    }
    
    // Parse pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    
    // Get the feed
    const feedResponse = await convex.query(api.feed.timeline, {
      paginationOpts: {
        cursor,
        numItems: Math.min(limit, 50), // Cap at 50 items per request
      }
    });
    
    return NextResponse.json(feedResponse, { status: 200 });
  } catch (error) {
    console.error("Error retrieving feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 