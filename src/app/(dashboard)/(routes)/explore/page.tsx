"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';
import Link from 'next/link';

function highlightMatches(text: string, searchTerm: string): string {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  const searchResults = useQuery(api.search.exploreArticles, { searchTerm: debouncedTerm });
  const tags = useQuery(api.search.getTags) || [];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className='w-full flex justify-center mt-3 text-5xl font-semibold'>
        Explore the world
      </div>
      <div className="relative mt-3">
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-10 py-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute right-3 top-2 text-gray-400">
          {searchResults?.length || 0} results
        </span>
      </div>

      {searchTerm ? (
        <Card className="mt-2">
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <span dangerouslySetInnerHTML={{ __html: highlightMatches(tag, searchTerm) }} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Search Results</h3>
              {searchResults === undefined ? (
                <p>Loading...</p>
              ) : searchResults.length === 0 ? (
                <p>No results found.</p>
              ) : (
                <ul className="space-y-4">
                  {searchResults.map((article) => (
                    <li key={article._id} className="border-b pb-4 dark:hover:bg-slate-900 hover:bg-slate-100">
                      <Link href={`/article/${article._id}`}>
                        <div className="flex justify-between items-start">
                          <h4 
                            className="text-lg font-semibold" 
                            dangerouslySetInnerHTML={{ __html: article.highlights.title }}
                          />
                          <Badge variant="secondary" className="ml-2">
                            {article.matchCount} matches
                          </Badge>
                        </div>
                        <p 
                          className="text-sm text-gray-600 mt-1" 
                          dangerouslySetInnerHTML={{ __html: article.highlights.content }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {}
                          {article.highlights.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              <span dangerouslySetInnerHTML={{ __html: tag }} />
                            </Badge>
                          ))}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )
      : 
      <div className='flex justify-center items-center  text-7xl text-zinc-300 mt-[150px]'> 
        
      </div>
      }
    </div>
  );
};

