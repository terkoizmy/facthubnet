"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Newspaper, Tag, TrendingUp } from 'lucide-react';
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
  const trendingTopics = useQuery(api.search.getTrendingTopics);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className='text-4xl md:text-6xl font-bold text-center mb-8 text-gradient'>
        Explore the Words
      </h1>
      <div className="relative mb-8">
        <Input
          type="text"
          placeholder="Search for articles, topics, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
          {searchResults?.length || 0} results
        </span>
      </div>

      {searchTerm ? (
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center"><Tag className="mr-2" /> Matching Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())).map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
                    <span dangerouslySetInnerHTML={{ __html: highlightMatches(tag, searchTerm) }} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center"><Newspaper className="mr-2" /> Search Results</h3>
              {searchResults === undefined ? (
                <p>Loading...</p>
              ) : searchResults.length === 0 ? (
                <p>No results found.</p>
              ) : (
                <ul className="space-y-6">
                  {searchResults.map((article) => (
                    <li key={article._id} className="border-b pb-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 ease-in-out rounded-lg p-3">
                      <Link href={`/article/${article._id}`}>
                        <div className="flex justify-between items-start">
                          <h4 
                            className="text-xl font-semibold mb-2" 
                            dangerouslySetInnerHTML={{ __html: article.highlights.title }}
                          />
                          <Badge variant="secondary" className="ml-2">
                            {article.matchCount} matches
                          </Badge>
                        </div>
                        <p 
                          className="text-sm text-gray-600 dark:text-gray-300 mb-2" 
                          dangerouslySetInnerHTML={{ __html: article.highlights.content }}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {article.highlights.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
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
      ) : (
        <div className='mt-12'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center"><TrendingUp className="mr-2" /> Trending Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {trendingTopics?.map((topic, index) => (
              <Card key={index} className="hover:shadow-lg transition duration-300 ease-in-out">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{topic.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};