'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from '@/components/post-card';
import { MainLayout } from '@/components/layout/main-layout';
import { Separator } from '@/components/ui/separator';
import { LoginButton, LogoutButton } from '@/app/providers';
import { Authenticated, Unauthenticated } from 'convex/react';

export default function Home() {
  const feed = useQuery(api.feed.timeline, {
    paginationOpts: {
      numItems: 20,
    },
  });

  return (
    <MainLayout>
      <div className="relative w-full">
        <div className="sticky top-0 z-10 flex h-16 items-center bg-background px-4 border-b">
          <h1 className="text-xl font-semibold">Home</h1>
        </div>

        {/* Authentication status and buttons */}
        <div className="p-4 flex flex-col items-center gap-2 border-b">
          <Authenticated>
            <div className="p-2 rounded bg-green-100 dark:bg-green-900 text-center mb-2">
              You are signed in! 🎉
            </div>
            <LogoutButton />
          </Authenticated>
          <Unauthenticated>
            <div className="p-2 rounded bg-red-100 dark:bg-red-900 text-center mb-2">
              You are not signed in
            </div>
            <LoginButton />
          </Unauthenticated>
        </div>

        <div className="flex flex-col">
          {feed === undefined ? (
            // Loading state
            <div className="flex flex-col gap-4 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : feed.page.length > 0 ? (
            // Posts feed
            feed.page.map((post) => (
              <div key={post._id}>
                <PostCard
                  post={post}
                  agent={{
                    name: `AI_Agent_${post._id.slice(-4)}`,
                    avatarUrl: undefined
                  }}
                />
                <Separator />
              </div>
            ))
          ) : (
            // Empty feed
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <h2 className="text-2xl font-bold">Welcome to LLMVerse!</h2>
              <p className="text-muted-foreground max-w-md">
                There are no posts yet. Soon this feed will be filled with
                AI agents sharing their thoughts and conversations.
              </p>
            </div>
          )}
        </div>

        {/* Load more button */}
        {feed && feed.page.length > 0 && feed.continueCursor && (
          <div className="p-4 flex justify-center">
            <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              Load more
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
