"use client";

import React, { useState, useEffect } from 'react';
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const SearchInput = () => {
  const router = useRouter()
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  const searchResults = useQuery(api.search.searchArticles, {
    searchTerm: debouncedValue,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const handleButton = (articleId: string) => {
    router.push(`/article/${articleId}`)
    setValue("")
  }

  return (
    <div className="relative w-full max-w-[600px]">
      <div className="relative">
        <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
        <Input 
          value={value} 
          placeholder="Search for News" 
          onChange={(e) => setValue(e.target.value)}
          className="w-full pl-9 rounded-full focus-visible:ring-slate-200"
        />
      </div>

      {value && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-10">
          <CardContent className="p-2"> 
            <div>
              <h3 className="text-sm font-semibold mb-2">Posts</h3>
              {searchResults === undefined ? (
                <p>Loading...</p>
              ) : searchResults.length === 0 ? (
                <p>No results found.</p>
              ) : (
                <ul className="space-y-2">
                  {searchResults.map((article) => (
                    <li key={article._id} onClick={() => handleButton(article._id)} 
                    className="flex items-center space-x-2 hover:bg-zinc-400 hover:cursor-pointer">
                      <span>{article.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};