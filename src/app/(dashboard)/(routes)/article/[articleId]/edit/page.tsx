"use client";

import { usePathname, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import EditNews from './_components/edit-news';
import { useUser } from "@clerk/clerk-react";


export default function EditArticle()  {
  const { articleId } = useParams()
  const { user } = useUser()
  const getArticle = useQuery(api.newsArticle.getArticle,{ articleId: articleId as string })


  return (
    <main className="flex flex-col ">
      {user && getArticle && 
      // @ts-ignore
      <EditNews userId={user?.id} article={getArticle} /> }
      
    </main>
  );
}
