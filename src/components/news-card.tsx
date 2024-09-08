"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Doc, Id } from "@/../convex/_generated/dataModel"
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/../convex/_generated/api"
import { useUser } from "@clerk/clerk-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "./ui/badge"
import { useRouter } from "next/navigation"

interface CardNewsProps {
  article: Doc<"newsArticles"> & {
    author: Doc<"users">
    commentCount: number
  }
}

export const NewsCard = ({ article }: CardNewsProps) => {
  const { user } = useUser();
  const router = useRouter()
  const upvote = useMutation(api.votes.upvote)
  const downvote = useMutation(api.votes.downvote)
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark)
  const trackInteraction = useMutation(api.recommendations.trackInteraction)
  const isBookmarked = useQuery(api.bookmarks.isBookmarked, {
    articleId: article._id,
  })
  const [optimisticBookmark, setOptimisticBookmark] = useState(false)

  const handleUpvote = async (articleId: any) => {
    if (user) {
      await upvote({ articleId })
      await trackInteraction({ articleId, interactionType: "upvote" })
    }
  }

  const handleDownvote = async (articleId: any) => {
    if (user) {
      await downvote({ articleId })
      await trackInteraction({ articleId, interactionType: "downvote" })
    }
  }

  const handleToggleBookmark = async (articleId: any) => {
    if (user) {
      setOptimisticBookmark((prev) => !prev)
      const result = await toggleBookmark({ articleId })
      setOptimisticBookmark(result)
      await trackInteraction({ articleId, interactionType: "bookmark" })
    }
  }

  const toArticle = async (articleId: any ) => {
    await trackInteraction({ articleId, interactionType: "view" })
  }

  return (
    <>
      <Card
        id="card-article"
        className="rounded-lg h-[420px] flex flex-col justify-between"
      >
        <CardHeader className="pb-1 mb-1 px-4 ">
          <div className="flex justify-between">
            <div className="flex flex-row">
              <Avatar className="w-8 h-8">
                <AvatarFallback>CN</AvatarFallback>
                <AvatarImage src={article.author.imageUrl} />
              </Avatar>
              <div className="flex justify-center items-center mx-2 ">
                <Link
                  href={`/profile/${article.author._id}`}
                  className="hover:border-black dark:hover:border-gray-600 hover:cursor-pointer"
                  >
                  <Label htmlFor="email" className="font-bold hover:cursor-pointer">{article.author.name}</Label>
                </Link>
              </div>
            </div>
          </div>
        </CardHeader>
        <Link
          onClick={() => {toArticle(article._id)}}
          href={`/article/${article._id}`}
          target="_blank"
          className="hover:border-black dark:hover:border-gray-600 hover:cursor-pointer"
        >
          <CardContent className="px-2 py-0 pb-2 h-1/4 flex flex-col ">
            <div className=" font-extrabold text-lg flex ">
              <div className="line-clamp-2">{article.title}</div>
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-[0.3rem] mt-2 text-xs ">
              {article.tags.map((_, index) =>
                index < 2 ? (
                  <Badge key={index} className="rounded-lg  dark:border-slate-700  dark:text-slate-300 dark:bg-slate-950">
                    {`#${_.toLocaleLowerCase()}`}
                  </Badge>
                ) : (
                  index === article.tags.length - 1 && (
                    <Badge key={index} className="rounded-lg dark:border-slate-700 dark:text-slate-300 dark:bg-slate-950">{`+${index - 1}`}</Badge>
                  )
                )
              )}
            </div>
          </CardContent>
        </Link>
        <CardFooter className="px-0 flex flex-col mx-2 py-0 my-2">
          <Link
            onClick={() => {toArticle(article._id)}}
            href={`/article/${article._id}`}
            target="_blank"
            className="hover:border-black dark:hover:border-gray-600 hover:cursor-pointer"
          >
            <Image
              src={article.thumbnailUrl}
              alt={"dummy alt"}
              width={400}
              height={200}
              className="h-44 rounded-2xl"
            />
          </Link>

          <div className="flex justify-between items-center text-zinc-400 w-full mt-1 h-fit">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleUpvote(article._id)
              }}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {article.upvotes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleDownvote(article._id)
              }}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              {article.downvotes}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              {article?.commentCount}
            </Button>
            <Button
              variant={optimisticBookmark ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleToggleBookmark(article._id)}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
