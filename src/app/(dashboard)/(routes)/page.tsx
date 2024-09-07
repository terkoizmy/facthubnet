"use client"

import { NewsCard } from "@/components/news-card"
import { usePaginatedQuery } from "convex/react"
import { api } from "@/../../convex/_generated/api"
import { useState, useEffect, useCallback } from "react"

export default function Home() {
  const [allArticles, setAllArticles] = useState([]);

  const { results, status, loadMore } = usePaginatedQuery(
    // @ts-ignore
    api.newsArticle.getArticlesWithAuthors,
    {},
    { 
      initialNumItems: 10,
      keepAlive: true
    }
  );

  useEffect(() => {
    if (results) {
      setAllArticles(prev => [...results] as any);
    }
  }, [results]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight || status !== "CanLoadMore") return;
    loadMore(5);
  }, [status, loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <main className="custom-grid w-full p-4" >
      {allArticles.map((articleNews, index) => (
        // @ts-ignore
        <NewsCard key={articleNews._id || index} article={articleNews} />
      ))}
      {status === "LoadingMore" && <div>Loading more...</div>}
    </main>
  )
}