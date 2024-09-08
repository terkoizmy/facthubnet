"use client"

import { NewsCard } from "@/components/news-card"
import { usePaginatedQuery, useQuery, useMutation } from "convex/react"
import { api } from "@/../convex/_generated/api"
import { useState, useEffect, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { RecommendationCarousel } from "@/components/recommendation-carousel "
import { useUser } from "@clerk/clerk-react"

export default function Home() {
  const [allArticles, setAllArticles] = useState([]);
  const { user } = useUser()
  const { results, status, loadMore } = usePaginatedQuery(
    // @ts-ignore
    api.newsArticle.getArticlesWithAuthors,
    {},
    { 
      initialNumItems: 10,
      keepAlive: true
    }
  );

  const recommendations = useQuery(api.recommendations.getRecommendations, 
    user ? { limit: 5 } : "skip"
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
    <main className="flex w-full flex-col" >

      {recommendations && recommendations.length > 0 && (
        // @ts-ignore
        <RecommendationCarousel articles={recommendations} />
      )}
      <h2 className="text-2xl font-bold mb-4 mt-2 px-4">Latest news</h2>
      <div className="custom-grid w-full p-4">
        {allArticles.map((articleNews, index) => (
          // @ts-ignore
          <NewsCard key={articleNews._id || index} article={articleNews} />
        ))}
        {status === "LoadingMore" && 
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        </div>
        }
      </div>
      
      
    </main>
  )
}