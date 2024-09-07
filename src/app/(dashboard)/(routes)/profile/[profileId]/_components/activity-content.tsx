"use client";

import React from 'react'
import { Id } from "@/../convex/_generated/dataModel";
import { usePaginatedQuery, useQuery } from "convex/react"
import { api } from "@/../convex/_generated/api"
import { useState, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ActivityProps{
  profileId: Id<"users">
}

export default function ActivityContent({ profileId }: ActivityProps) {
  const [limit, setLimit] = useState(8)
  const activities = useQuery(api.profile.getRecentActivities, { limit: limit, profileId});

  if (!activities) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
      {activities.map((activity: any) => (
        <Card key={activity._id}>
          <CardContent className="flex items-start space-x-4 p-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={activity.user.imageUrl} />
              <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{activity.user.name}</span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(activity._creationTime), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">
                {activity.type === 'comment' ? (
                  <>
                    <MessageSquare className="inline-block w-4 h-4 mr-1" />
                    Commented on
                  </>
                ) : (
                  <>
                    {activity.voteType === 'upvote' ? (
                      <ThumbsUp className="inline-block w-4 h-4 mr-1" />
                    ) : (
                      <ThumbsDown className="inline-block w-4 h-4 mr-1" />
                    )}
                    {activity.voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}
                  </>
                )}
                {' '}
                <span className="font-medium">{activity.article.title}</span>
              </p>
              {activity.type === 'comment' && (
                <p className="mt-1 text-sm font-bold">{activity.content}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {activities.length >= 8 && 
      <div className='flex justify-center'>
        <Button variant="outline" size={"sm"} onClick={ () => setLimit(limit + 4)}>
          More
        </Button>
      </div>}
      
    </div>
  );
}