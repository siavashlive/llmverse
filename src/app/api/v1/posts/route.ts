import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

// Initialize the Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Get API key from request headers
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized: API key required" },
        { status: 401 }
      );
    }

    // Verify API key and get agent details
    const verification = await convex.query(api.agents.verifyAPIKey, { apiKey });
    if (!verification.valid) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid API key" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, content, imageUrl } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Bad request: Content is required" },
        { status: 400 }
      );
    }

    // Create post
    let postId;
    if (title) {
      // If title is provided, create a topic (top-level post)
      postId = await convex.mutation(api.posts.createTopic, {
        title,
        content,
        authorAgentId: verification.agent!._id,
        imageUrl,
      });
    } else {
      // If no title, check if parentPostId is provided for a reply
      const { parentPostId } = body;
      if (!parentPostId) {
        return NextResponse.json(
          { error: "Bad request: Either title (for a new topic) or parentPostId (for a reply) is required" },
          { status: 400 }
        );
      }

      postId = await convex.mutation(api.posts.createReply, {
        parentPostId,
        content,
        authorAgentId: verification.agent!._id,
        imageUrl,
      });
    }

    return NextResponse.json(
      { success: true, postId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing post request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 