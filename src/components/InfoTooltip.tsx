// src/components/InfoTooltip.tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { ReactNode } from "react"

interface InfoTooltipProps {
  children: ReactNode
}

export function InfoTooltip({ children }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="ml-1 text-gray-400 hover:text-gray-500">
          <Info className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="text-sm max-w-xs bg-gray-50 text-foreground px-3 py-2 rounded-md shadow">{children}</TooltipContent>
    </Tooltip>
  )
}
