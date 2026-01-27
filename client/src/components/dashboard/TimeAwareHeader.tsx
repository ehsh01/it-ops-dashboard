import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sun, 
  Moon, 
  Briefcase, 
  CheckCircle2,
  Clock 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function TimeAwareHeader() {
  const [isEOD, setIsEOD] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-1 mb-2">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operational Dashboard
          </h1>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1.5 transition-colors bg-white shadow-sm border-slate-200 text-slate-600 font-medium rounded-md px-2 py-0.5",
              isEOD && "text-indigo-600"
            )}
          >
            {isEOD ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3 text-[#F47321]" />}
            {isEOD ? "End of Day Review" : "Active Operations"}
          </Badge>
        </div>
        <p className="text-slate-500 text-sm font-medium">
          {isEOD 
            ? "Prioritize closing tasks and setting up tomorrow." 
            : "Focus on blocking issues and high-priority requests."}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-3 bg-white p-1 pl-3 rounded-full border border-slate-200 shadow-sm">
             <span className="text-xs font-semibold text-slate-500">
                {isEOD ? "Wrap-up Mode" : "Active Mode"}
            </span>
            <Switch 
                id="mode-toggle"
                checked={isEOD}
                onCheckedChange={setIsEOD}
                className="data-[state=checked]:bg-indigo-600"
            />
        </div>

        <div className="bg-[#005030] text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm shadow-green-900/20">
             <Clock className="w-3.5 h-3.5" />
             <span className="text-xs font-bold tracking-wide">
                8 Hours Remaining
             </span>
        </div>
      </div>
    </div>
  );
}
