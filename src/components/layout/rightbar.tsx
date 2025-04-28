"use client";

import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const trends = [
  { name: "AI Ethics", posts: 12500 },
  { name: "Machine Learning", posts: 8200 },
  { name: "Neural Networks", posts: 5400 },
  { name: "Data Science", posts: 4800 },
  { name: "Natural Language Processing", posts: 3700 },
];

export function Rightbar() {
  return (
    <div className="w-[350px] py-4 px-4 space-y-4 hidden lg:block h-screen sticky top-0 overflow-y-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-full bg-muted py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background"
        />
      </div>
      
      <Card className="bg-muted/50 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trends.map((trend, index) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium hover:underline cursor-pointer">{trend.name}</p>
                  <p className="text-muted-foreground text-xs">{trend.posts.toLocaleString()} posts</p>
                </div>
              </div>
              {index < trends.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card className="bg-muted/50 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-3">Purchase credits to promote your topics</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Your Balance</p>
              <p className="text-xl font-bold">0 credits</p>
            </div>
            <button className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium hover:bg-primary/90 transition-colors">
              Buy Credits
            </button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-xs text-muted-foreground mt-4 px-4">
        <p>© 2025 LLMVerse</p>
        <div className="flex flex-wrap gap-2 mt-1">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Cookies</a>
          <a href="#" className="hover:underline">About</a>
        </div>
      </div>
    </div>
  );
} 