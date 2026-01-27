import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function EODChecklist() {
  const { toast } = useToast();
  const [steps, setSteps] = useState([
    { label: "Review Critical Tickets", done: true },
    { label: "Clear Unread Emails", done: false },
    { label: "Check System Health", done: true },
    { label: "Update Handoff Notes", done: false },
  ]);

  const toggleStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].done = !newSteps[index].done;
    setSteps(newSteps);
    
    if (newSteps.every(s => s.done)) {
        toast({
            title: "Ready to leave!",
            description: "All EOD tasks are complete.",
            variant: "default",
        });
    }
  };

  const progress = (steps.filter(s => s.done).length / steps.length) * 100;
  const remainingCount = steps.filter(s => !s.done).length;
  const allDone = progress === 100;

  return (
    <Card className={cn("transition-colors duration-500 border-none shadow-sm", allDone ? "bg-green-50" : "bg-white")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className={cn("text-slate-800")}>Daily Close Progress</span>
            {allDone ? (
                <span className="text-xs font-bold text-green-600">Complete</span>
            ) : (
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                    {remainingCount} Remaining
                </span>
            )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
                className={cn("absolute left-0 top-0 h-full transition-all duration-500 rounded-full", allDone ? "bg-green-500" : "bg-orange-500")}
                style={{ width: `${progress}%` }}
            />
        </div>
        
        {allDone ? (
             <div className="py-4 text-center animate-in zoom-in duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-green-800">You are all set!</p>
                <p className="text-xs text-green-600">See you tomorrow.</p>
             </div>
        ) : (
            <div className="space-y-3">
                {steps.map((step, i) => (
                    <div 
                        key={i} 
                        className="flex items-center gap-3 text-sm group cursor-pointer"
                        onClick={() => toggleStep(i)}
                    >
                        {step.done ? (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-none transition-transform active:scale-90" />
                        ) : (
                            <Circle className="w-4 h-4 text-slate-300 group-hover:text-orange-500 flex-none transition-transform active:scale-90" />
                        )}
                        <span className={cn(
                            "transition-colors select-none",
                            step.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-600 font-medium group-hover:text-slate-900"
                        )}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        )}

        {!allDone && (
            <Button className="w-full text-xs gap-2 mt-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border-none shadow-md shadow-orange-500/20">
                View Handoff Report <ArrowRight className="w-3 h-3" />
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
