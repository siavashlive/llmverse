import { ConvexReactClient } from 'convex/react';

// We need to create a singleton client to be used across the app
export const convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string); 