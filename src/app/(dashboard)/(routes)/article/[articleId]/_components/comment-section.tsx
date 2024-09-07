"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@clerk/clerk-react';


function formatTimeAgo(date: any) {
  const dateNow = new Date(date)
  return formatDistanceToNow(dateNow, { addSuffix: true });
}


function Comment({ comment, onReply, depth = 0 }: any) {
  const dateTime = new Date(comment._creationTime);
  const user = useUser()
  const [commentTrigger, setCommentTrigger] = useState(false)
  const [newReply, setNewReply] = useState("");
  const addReplyMutation = useMutation(api.comments.addComment);

  const handleReplySubmit = async () => {
    if (newReply.trim()) {
      await addReplyMutation({
        articleId: comment.articleId,
        content: newReply,
        parentId: comment._id,
      });
      setNewReply("");
      onReply(); // Trigger a refetch of comments
      setCommentTrigger(false)
    }
  };

  return (
    <div className="mb-4">
      <div className="pt-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author.imageUrl} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-bold">{comment.author.name}</h4>
            <p>{comment.content}</p>
            <div className='flex flex-row'>
              <div className='text-sm text-zinc-500 flex-nowrap'>{`${formatTimeAgo(dateTime)} · `}</div>
              
              {depth < 1 && !commentTrigger && (
                <div 
                  className='felx text-sm text-slate-400 hover:text-zinc-700 dark:hover:border-gray-600 hover:cursor-pointer' 
                  onClick={() => setCommentTrigger(true)}
                > 
                  Reply
                </div>
              )}
            </div>
            
            {commentTrigger &&
              <div className="flex items-center space-x-4 mt-2">
                <Input
                  placeholder="Write a reply..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleReplySubmit();
                    }
                  }}
                />
                <Button onClick={handleReplySubmit}>Reply</Button>
              </div>
            }
          </div>
        </div>
        {comment.replies && comment.replies.map((reply: any) => (
          <div key={reply._id} className="ml-12 mt-4">
            <Comment comment={reply} onReply={onReply} depth={depth + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface commentSectionProps {
  articleId: string
}

export default function CommentSection({ articleId }: commentSectionProps) {
  const [newComment, setNewComment] = useState("");
  // @ts-ignore
  const comments = useQuery(api.comments.getArticleComments, { articleId });
  const convexUser = useQuery(api.user.getUser);
  const addCommentMutation = useMutation(api.comments.addComment);
  
  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      // @ts-ignore
      await addCommentMutation({ articleId, content: newComment });
      setNewComment("");
    }
  };

  if (comments === undefined) {
    return (
      <div className="mt-8">
        <Skeleton className="w-full max-w-3xl h-10" />
        <Skeleton className="w-full max-w-3xl h-10 mt-4" />
        <Skeleton className="w-full max-w-3xl h-10 mt-4" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <div className="flex items-center space-x-4 mb-4 mt-2">
          <Avatar className="w-8 h-8">
            {/* <AvatarImage src={convexUser?.imageUrl} /> */}
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCommentSubmit();
              }
            }}
          />
          <Button onClick={handleCommentSubmit}>Submit</Button>
        </div>
        {comments.map((comment: any, index: any) => (
          <Comment 
            key={comment._id} 
            comment={comment} 
            onReply={() => {}} // You can implement a refetch function if needed
            index={index}
          />
        ))}
    </div>
  );
}