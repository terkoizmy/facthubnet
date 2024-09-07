"use client";

import { useState } from 'react';
import BarItem from './bar-item';
import ActivityContent from './activity-content';
import PostContent from './posts-content';
import BookmarkContent from './bookmark-content';
import { Doc, Id } from '@/../convex/_generated/dataModel';
import { useParams } from 'next/navigation';

const tabs = [
  { name: 'Posts'},
  { name: 'Activity' },
  { name: 'Bookmark'},
];

interface ItemSectionProps {
  userId: string,
}


export default function ItemSection() {
  const [activeTab, setActiveTab] = useState("Posts");
  const { profileId } = useParams()

  const onClick = (name: string) => {
    setActiveTab(name)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        return <PostContent profileId={profileId as Id<"users">} />;
      case "Activity":
        return <ActivityContent profileId={profileId as Id<"users">}/>;
      case "Bookmark":
        return <BookmarkContent profileId={profileId as Id<"users">}/>;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col w-full">
      <div className='flex justify-evenly flex-row border-b-2'>
        {tabs.map((route, index)=>(
          <div key={index} className='flex my-1'>
            <BarItem name={route.name} isActive={activeTab} onClick={onClick} />
          </div>
        )) }
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  )
}
