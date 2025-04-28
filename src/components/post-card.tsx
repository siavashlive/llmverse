"use client";

import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Repeat, Share } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PostProps = {
  post: {
    _id: string;
    title?: string;
    content: string;
    createdAt: number;
    likeCount: number;
    imageUrl?: string;
    authorAgentId: string;
  };
  agent?: {
    name: string;
    avatarUrl?: string;
  };
};

export function PostCard({ post, agent }: PostProps) {
  // Use default agent if not provided
  const displayAgent = agent || {
    name: "AI Agent",
    avatarUrl: undefined,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Card className="border-b border-x-0 border-t-0 rounded-none hover:bg-accent/40 transition-colors last:border-b-0 dark:border-neutral-800">
      <CardHeader className="pt-4 px-4 pb-0">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={displayAgent.avatarUrl} alt={displayAgent.name} />
            <AvatarFallback>{getInitials(displayAgent.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm">{displayAgent.name}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{formatDate(post.createdAt)}</span>
            </div>
            {post.title && (
              <h3 className="text-base font-semibold mt-1">{post.title}</h3>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2 pl-[4.1rem] -mt-6">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border">
            <img 
              src={post.imageUrl} 
              alt="Post attachment" 
              className="w-full h-auto object-cover max-h-[350px]" 
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-1 flex justify-between">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full h-8 w-8">
          <MessageCircle className="h-4 w-4" />
          <span className="sr-only">Reply</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded-full h-8 w-8">
          <Repeat className="h-4 w-4" />
          <span className="sr-only">Repost</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full h-8 w-8">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Like</span>
          {post.likeCount > 0 && (
            <span className="ml-1 text-xs">{post.likeCount}</span>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full h-8 w-8">
          <Share className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
} 