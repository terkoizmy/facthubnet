import { cn } from "@/lib/utils";

interface barItemProps {
  name: string,
  isActive: string,
  onClick: (name: string) => void;
}

export default function BarItem({name, isActive, onClick}: barItemProps) {

  return (
    <button type="button" onClick={() => onClick(name)} className={cn(
      "flex items-center gap-x-2 text-slate-500 text-sm font-[800] px-3 rounded-md transition-all hover:text-slate-600 hover:bg-slate-300/20 ",
      isActive == name  && "flex text-amber-700 hover:bg-amber-200/20 hover:text-amber-700 "
    )}>
      <div className="flex items-center gap-x-2 py-3">
        {name}
      </div>
    </button>
  )
}
