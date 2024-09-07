"use client";

import CreateNews from "./_components/create-news";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from '@/../../convex/_generated/api';
import { useEffect } from "react";

export default function CreatePost() {
  const { user } = useUser();
  const router = useRouter()

  useEffect(() => {
    if(!user) {
      router.push(`/`)
    }
  }, [user])
  
  
  return (
    <div className="mx-5 my-5">
      <CreateNews userId={user?.id} />
    </div>
  );
}