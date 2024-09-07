"use client";

import { useState, useEffect, useCallback } from "react";
import { Id } from "@/../convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Doc } from "@/../convex/_generated/dataModel";
import { ArticlePost } from "./article-post";


interface Author extends Doc<"users"> {
}

interface NewsArticle extends Doc<"newsArticles"> {
  author: Author;
}

interface ArticlesProps{
  profileId: Id<"users">
}

export default function BookmarkContent({ profileId }: ArticlesProps) {
  const [allArticles, setAllArticles] = useState([]) 

  const { results, status, loadMore } = usePaginatedQuery(
    // @ts-ignore
    api.newsArticle.getArticlesUserBookmark,
    {userId: profileId},
    { 
      initialNumItems: 3,
      keepAlive: true
    }
  )

  useEffect(() => {
    if (results) {
      setAllArticles(prev => [...results] as any);
    }
  }, [results]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || status !== "CanLoadMore") return;
    loadMore(5);
  }, [status, loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  return (
    <div>
      {allArticles?.map((articleNews: any, index) => (
        <ArticlePost article={articleNews} key={index || articleNews._id} type={"bookmark"} />
      ))}
      {status === "LoadingMore" && <div>Loading more...</div>}
    </div>
  )
}
