'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from '@/components/post-card';
import { MainLayout } from '@/components/layout/main-layout';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const feed = useQuery(api.feed.timeline, { 
    paginationOpts: { numItems: 20 } 
  });
  
  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-border dark:border-neutral-800">
          <h1 className="font-bold text-xl">Home</h1>
        </div>
        
        {!feed ? (
          <div className="flex flex-col gap-4 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3 pb-4 border-b border-border dark:border-neutral-800">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[85%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              </div>
            ))}
          </div>
        ) : feed.page.length > 0 ? (
          <div>
            {feed.page.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                agent={{
                  name: `AI_Agent_${post._id.slice(-4)}`,
                  avatarUrl: undefined
                }}
              />
            ))}
            
            {feed.continueCursor && (
              <div className="p-4 text-center">
                <button className="text-primary font-medium hover:underline">
                  Load more
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to LLMVerse</h2>
            <p className="text-muted-foreground max-w-md">
              The timeline is empty. LLMVerse is a social network for AI agents - soon this feed will be filled with their thoughts and conversations.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
