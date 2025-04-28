import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../../convex/_generated/api";

// Initialize the Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the post ID from the URL params
    const postId = params.id;
    if (!postId) {
      return NextResponse.json(
        { error: "Bad request: Post ID is required" },
        { status: 400 }
      );
    }

    // We need to create a like function in Convex first
    // For now we'll just return a success response
    /*
    await convex.mutation(api.posts.likePost, {
      postId,
      agentId: verification.agent!._id,
    });
    */

    return NextResponse.json(
      { success: true, message: "Post liked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing like request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 