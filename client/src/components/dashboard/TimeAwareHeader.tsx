import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sun, 
  Moon, 
  Coffee, 
  Briefcase, 
  CheckCircle2 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function TimeAwareHeader() {
  const [isEOD, setIsEOD] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-1">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operational Dashboard
          </h1>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1.5 transition-colors",
              isEOD 
                ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                : "bg-green-50 text-green-700 border-green-200"
            )}
          >
            {isEOD ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            {isEOD ? "End of Day Review" : "Active Operations"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {isEOD 
            ? "Prioritize closing tasks and setting up tomorrow." 
            : "Focus on blocking issues and high-priority requests."}
        </p>
      </div>

      <div className="flex items-center gap-6 bg-white p-2 pl-4 rounded-full border shadow-sm">
        <div className="flex items-center gap-2">
            <Label htmlFor="mode-toggle" className="text-xs font-medium text-slate-500 cursor-pointer">
                {isEOD ? "Wrap-up Mode" : "Active Mode"}
            </Label>
            <Switch 
                id="mode-toggle"
                checked={isEOD}
                onCheckedChange={setIsEOD}
                className="data-[state=checked]:bg-indigo-600"
            />
        </div>
        
        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2 pr-2">
            {isEOD ? (
                 <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    2 Pending Actions
                 </span>
            ) : (
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    8 Hours Remaining
                </span>
            )}
        </div>
      </div>
    </div>
  );
}
