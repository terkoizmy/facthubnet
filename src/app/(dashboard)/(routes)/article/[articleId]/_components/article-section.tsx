"use client";


import ReactMarkdown from "react-markdown";
import { useState } from "react";
import remarkGfm from 'remark-gfm'
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card";
import { Doc } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThumbsUp,ThumbsDown, MessageSquare, Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { cn } from "@/lib/utils";

interface Author extends Doc<"users"> {
}

interface Article extends Doc<"newsArticles"> {
  author: Author;
}

interface ArticleSectionProps {
  article: Article;
}

function formatTimestamp(timestamp: any) {
  const date = new Date(timestamp);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  // @ts-ignore
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export default function ArticleSection( { article } : ArticleSectionProps)  {
  const { user } = useUser()
  const pathname = usePathname()
  const upvote = useMutation(api.votes.upvote);
  const downvote = useMutation(api.votes.downvote);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const isBookmarked = useQuery(api.bookmarks.isBookmarked, { articleId: article._id });
  const toggleFollow = useMutation(api.follow.toogleFollow);
  const isFollowed = useQuery(api.follow.isFollowed, { userId: article.author._id });
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(0);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(0);
  const [optimisticBookmark, setOptimisticBookmark] = useState(false);
  const [optimisticFollow, setOptimisticFollow] = useState(false);
  

  const handleUpvote = async (articleId: any) => {
    setOptimisticUpvotes(prev => prev + 1);
    await upvote({ articleId });
  };

  const handleDownvote = async (articleId: any) => {
    setOptimisticDownvotes(prev => prev + 1);
    await downvote({ articleId });
  };

  const handleToggleBookmark = async (articleId: any) => {
    setOptimisticBookmark(prev => !prev);
    const result = await toggleBookmark({ articleId });
    setOptimisticBookmark(result);
  };

  return (
    <>

      <Card className="flex flex-col">
        <div className="flex items-center space-x-4 mx-4 my-4 justify-between">
          <div className="flex items-center">
            <Avatar className="w-10 h-10">
              <AvatarImage src={article?.author?.imageUrl} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="mx-5">
              <h3 className="font-bold text-lg flex flex-row">
                <Link href={`/profile/${article?.author?._id}`} >
                  <div className="hover:border-black dark:hover:border-gray-600 hover:cursor-pointer hover:text-slate-500"> 
                    {` ${article?.author?.name}`}  
                  </div>
                </Link>
                <div className="hover:border-black dark:hover:border-gray-600 hover:cursor-pointer hover:text-slate-500">
                  {user?.id !== article.author.clerkId } 
                  <div className="text-amber-500 hover:text-amber-700" onClick={() => {toggleFollow({userId: article.authorId})}}>
                    {isFollowed ? 
                    <div>
                      &nbsp;•  Following
                    </div>
                    :
                    <div>
                      &nbsp;•  Follow
                    </div>
                    }
                   
                  </div>
                </div>
                </h3>
              <div>
                {formatTimestamp(article?.createdAt)}
              </div>
            </div>
          </div>
          {article?.author?.clerkId == user?.id &&
            <div>
              <Link href={`${pathname}/edit`} >
                <Button>
                  Edit your Article
                </Button>
              </Link>
          </div>
          }
        </div>
        <div className="flex ml-4 items-center text-zinc-400 w-full mt-2">
          <Button variant="ghost" size="sm" onClick={() => {handleUpvote(article._id)}}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            {article.upvotes}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {handleDownvote(article._id)}}>
            <ThumbsDown className="mr-2 h-4 w-4" />
            {article.downvotes}
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
        <div>
          <h1 className="text-3xl font-bold my-4 mx-4 flex flex-wrap  ">{article?.title}</h1>
          <CardContent className="px-2 py-0 pb-2 mb-20 ">
            <div className="mt-2 mx-0 px-0 relative w-full aspect-video rounded-3xl overflow-hidden  ">
              <Image 
                src={article?.thumbnailUrl}
                alt={"dummy alt"}
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
          <div className="prose prose-lg flex flex-col ml-10 ">
            <ReactMarkdown remarkPlugins={[remarkGfm]} >{article?.content}</ReactMarkdown>
          </div>
        </div>
      </Card>
    </>
  );
}
