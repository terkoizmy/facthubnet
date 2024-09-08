"use client"

import React from 'react'
import { NewsCard } from './news-card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Doc } from "@/../convex/_generated/dataModel"

interface RecommendationCarouselProps {
  articles: Array<Doc<"newsArticles"> & { 
    author: Doc<"users">; 
    commentCount: number 
  }>
}

export const RecommendationCarousel = ({ articles }: RecommendationCarouselProps) => {
  return (
    <div className=" w-full px-4">
      <h2 className="text-2xl font-bold mb-4">Recommended for you</h2>
      <Carousel className="relative">
        <CarouselContent>
          {articles.map((article) => (
            <CarouselItem key={article._id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5 3xl:basis-1/6">
              <NewsCard article={article} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}