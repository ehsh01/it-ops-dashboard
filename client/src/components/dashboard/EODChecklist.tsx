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
  const allDone = progress === 100;

  return (
    <Card className={cn("transition-colors duration-500", allDone ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className={cn(allDone ? "text-green-800" : "text-slate-900")}>Daily Close Progress</span>
            <span className={cn("text-xs font-mono", allDone ? "text-green-600 font-bold" : "text-slate-500")}>
                {Math.round(progress)}%
            </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className={cn("h-2", allDone && "bg-green-200")} />
        
        {allDone ? (
             <div className="py-4 text-center animate-in zoom-in duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-green-800">You are all set!</p>
                <p className="text-xs text-green-600">See you tomorrow.</p>
             </div>
        ) : (
            <div className="space-y-2">
                {steps.map((step, i) => (
                    <div 
                        key={i} 
                        className="flex items-center gap-3 text-sm group cursor-pointer"
                        onClick={() => toggleStep(i)}
                    >
                        {step.done ? (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-none transition-transform active:scale-90" />
                        ) : (
                            <Circle className="w-4 h-4 text-slate-300 group-hover:text-primary flex-none transition-transform active:scale-90" />
                        )}
                        <span className={cn(
                            "transition-colors select-none",
                            step.done ? "text-slate-500 line-through decoration-slate-300" : "text-slate-700 font-medium"
                        )}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        )}

        {!allDone && (
            <Button variant="outline" className="w-full text-xs gap-2 bg-white mt-2">
                View Handoff Report <ArrowRight className="w-3 h-3" />
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
