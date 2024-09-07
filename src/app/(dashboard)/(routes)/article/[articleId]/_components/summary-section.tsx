"use client";
import React, { useState, useEffect } from 'react'
import { Doc } from "@/../convex/_generated/dataModel";
import { useAction } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Article extends Doc<"newsArticles"> {
}

interface ArticleSectionProps {
  article: Article;
}

export default function SummarySection({ article } : ArticleSectionProps) {
  const [summary, setSummary] = useState("")
  const generateSummary = useAction(api.newsArticle.generateAndStoreSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  if (!article) return null;

  useEffect(() => {
    // @ts-ignore
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setTimer(0);
    }
    // @ts-ignore
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerateSummary = async (title: string, content: string) => {
    setIsLoading(true);
    let getSummary = await generateSummary({ 
      title: title,
      content: content
     });
    setSummary(getSummary)
    setIsLoading(false);
  };

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className='w-full flex items-center'>
        <CardTitle>AI Summary</CardTitle>
      </CardHeader>
      <CardContent className='w-full flex items-center justify-center'>
        {summary ? (
          <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br>') }} />
        ) : (
          <>
            <Button disabled={isLoading} onClick={() => {handleGenerateSummary(article.title, article.content)}}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating... ({timer}s)
                </>
              ) : 'Generate Summary'}
            </Button>
            {isLoading && timer >= 30 && (
              <p className="text-yellow-500 mt-2">
                This is taking longer than usual. Please be patient...
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
