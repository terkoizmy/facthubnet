"use client";

import { usePathname, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import EditNews from './_components/edit-news';
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditArticle()  {
  const router = useRouter()
  const { articleId } = useParams()
  const { user } = useUser()
  const getArticle = useQuery(api.newsArticle.getArticle,{ articleId: articleId as string })
  const author = useQuery(api.user.getUser)

  if (!getArticle || !author){
    return <div>Loading....</div>
  }

  // @ts-ignore
  if ( author?._id !== getArticle?.authorId){
    router.push(`/`)
  }

  return (
    <main className="flex flex-col ">
      {user && getArticle && 
      // @ts-ignore
      <EditNews userId={user?.id} article={getArticle} /> }
      
    </main>
  );
}
