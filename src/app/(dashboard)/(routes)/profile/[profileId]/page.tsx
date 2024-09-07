/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useUser } from "@clerk/clerk-react"
import ItemSection from "./_components/item-section";
import { Plus, Copy} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { api } from "@/../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {  useParams } from 'next/navigation';
import { useState } from "react";


function formatTimestamp(timestamp: any) {
  const date = new Date(timestamp);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  // @ts-ignore
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export default function ProfilePage () {
  const { user } = useUser()
  const { profileId } = useParams() 

  if (!user) {
    return <div>Loading...</div>; // Or handle this case however you like
  }

  //@ts-ignore
  const userProfile = useQuery(api.profile.getUserProfile, { profileId: profileId })
  const updateUser = useMutation(api.user.editUser)

  const [bio, setBio] = useState(userProfile?.user?.bio || "");

  const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(event.target.value);
  };

  const handleSaveBio = async ({ clerkId, userData, bio}: any) => {
    try {
      // Here you would typically call an API to update the bio
      // For now, let's just update the local state

      await updateUser({
        clerkId: clerkId,
        userCurrentData: {
          clerkId: userData.clerkId,
          name: userData.name,
          email: userData.email,
          imageUrl: userData.imageUrl,
          bio: bio,
          joinedAt: userData.joinedAt,
        }})

      if (userProfile && userProfile.user) {
        userProfile.user.bio = bio;
      }
      // Close the dialog
      // You'll need to implement a way to close the dialog, possibly using a state
    } catch (error) {
      console.log(error)
    }


    
  };

  return (
    
    <div className="h-full w-full flex flex-row  ">
      <AlertDialog>
        <div className="flex flex-col h-full w-7/12 border-r-2">
          <ItemSection  />
        </div>
        <div className="flex flex-col w-5/12 ">
          <div className="flex font-bold text-xl items-center h-[52px] ml-3">
            Profile
          </div>
          <div className="border-t-2 w-full " />
          {!userProfile ? <div>Loading...</div> :
          <div className="w-full p-3 flex flex-col ">
          {/* <Card className="w-full p-3 flex flex-col " > */}
            <div className="flex flex-row">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userProfile?.user?.imageUrl} />
              </Avatar>
              <div className="flex flex-col ml-5 mt-2 ">
                <div className="font-bold text-xl flex items-center">
                  {userProfile?.user?.name}
                </div>
                <div className="flex flex-wrap">
                  @{ userProfile?.user?.name?.toLowerCase().replace(/\s+/g, '')} 
                  <div className="text-slate-500"> 
                  &nbsp; • Joined {formatTimestamp(userProfile?.user?._creationTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="font-bold flex mt-6">
              {userProfile?.countArticle} <div className="text-slate-500"> Posts </div> &nbsp;
              {userProfile?.countFollowers}  <div className="text-slate-500"> Followers </div> &nbsp;
              {userProfile?.upvotes}<div className="text-slate-500"> Upvotes </div> &nbsp;
            </div>
              
            <div className="flex flex-col w-full h-full justify-center items-center">
              {!userProfile.user?.bio ? 
                <div className="px-5 flex justify-start mt-5 mb-3 text-slate-500">
                  Not yet have a bio, write your bio for introduce you to public 
                </div>
              : 
                <div className="px-5 flex mt-5 mb-3">
                  {userProfile.user?.bio }
                </div>
              }
            

              <AlertDialogTrigger asChild>
                <Button variant="outline"> <Plus /> Edit your bio</Button>
              </AlertDialogTrigger>
            </div>

            <div className="flex flex-col w-full h-full mt-7">
              <div className="font-bold text-xl flex items-center">
                Invite friends
              </div>
              <div className=" flex mt-5 text-slate-500">
                Invite other journalist to discover how easy it is to stay updated with daily news 
              </div>
              <div className="flex mt-5">
                <Input
                  id="link"
                  defaultValue="https://ui.shadcn.com/docs/installation"
                  readOnly
                />
                <Button type="submit" size="sm" className="px-3 mx-3">
                  <span className="sr-only">Copy</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          {/* </Card> */}
          </div>
          }

        </div>
          <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Bio profile</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to your bio profile here. Click save when you're done.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea placeholder="Type your bio here." value={bio} onChange={handleBioChange} />
          </div>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" onClick={() => handleSaveBio({clerkId: user.id, userData: userProfile?.user, bio: bio })} >Save changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}