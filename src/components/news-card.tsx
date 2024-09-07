"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Doc } from "@/../convex/_generated/dataModel"
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/../convex/_generated/api"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookmarkPlus, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "./ui/badge"

interface CardNewsProps {
  article: Doc<"newsArticles"> & {
    author: any & {
      id: string
      name: string
      email: string

      imageUrl: string
    }
    commentCount: number
  }
}

export const NewsCard = ({ article }: CardNewsProps) => {
  const upvote = useMutation(api.votes.upvote)
  const downvote = useMutation(api.votes.downvote)
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark)
  const isBookmarked = useQuery(api.bookmarks.isBookmarked, {
    articleId: article._id,
  })
  const [optimisticBookmark, setOptimisticBookmark] = useState(false)

  const handleUpvote = async (articleId: any) => {
    await upvote({ articleId })
  }

  const handleDownvote = async (articleId: any) => {
    await downvote({ articleId })
  }

  const handleToggleBookmark = async (articleId: any) => {
    setOptimisticBookmark((prev) => !prev)
    const result = await toggleBookmark({ articleId })
    setOptimisticBookmark(result)
  }

  return (
    <>
      <Link
        href={`/article/${article._id}`}
        target="_blank"
        className="hover:border-black dark:hover:border-gray-600 hover:cursor-pointer"
      >
        <Card
          id="card-article"
          className="rounded-lg h-[420px] flex flex-col justify-between"
        >
          <CardHeader className="pb-1 mb-1 px-4 ">
            <div className="flex justify-between">
              <div className="flex flex-row">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={article.author.imageUrl} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex justify-center items-center mx-2">
                  <Label htmlFor="email" className="font-bold">{article.author.name}</Label>
                </div>
              </div>

              {/* <div id="article-read" className="gap-2 hidden">
                <Button
                  className="h-8 px-2 rounded-xl bg-black dark:bg-white"
                  // onClick={handleOnClick}
                >
                  <BookmarkPlus className="w-5 h-5 mr-1" />
                  Bookmark
                </Button>
              </div> */}
            </div>
          </CardHeader>

          <CardContent className="px-2 py-0 pb-2 h-1/4 flex flex-col ">
            <div className="mt-2 font-extrabold text-lg flex overflow-hidden h-auto ">
              {article.title}
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
          <CardFooter className="px-0 flex flex-col mx-2 py-0 my-2">
            <Image
              src={article.thumbnailUrl}
              alt={"dummy alt"}
              width={400}
              height={200}
              className="h-44 rounded-2xl"
            />
            <div className="flex justify-between items-center text-zinc-400 w-full mt-2 h-fit">
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
      </Link>
    </>
  )
}
