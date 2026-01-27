import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/lib/context";
import { useEodTasks, useUpdateEodTask } from "@/lib/api/queries";

export function EODChecklist() {
  const { toast } = useToast();
  const { setEodComplete, setEodProgress } = useAppState();
  const today = new Date().toISOString().split('T')[0];
  
  const { data: tasks = [], isLoading } = useEodTasks(today);
  const updateTask = useUpdateEodTask();

  const toggleStep = (id: string, currentDone: boolean) => {
    updateTask.mutate(
      { id, updates: { done: !currentDone } },
      {
        onSuccess: () => {
          // Calculate progress after update
          const newDone = !currentDone;
          const updatedTasks = tasks.map(t => t.id === id ? { ...t, done: newDone } : t);
          const newProgress = (updatedTasks.filter(t => t.done).length / updatedTasks.length) * 100;
          setEodProgress(newProgress);

          if (updatedTasks.every(t => t.done)) {
            setEodComplete(true);
            toast({
              title: "Ready to leave!",
              description: "All EOD tasks are complete. Sidebar status updated.",
              variant: "default",
            });
          } else {
            setEodComplete(false);
          }
        },
      }
    );
  };

  // Update global state when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const newProgress = (tasks.filter(t => t.done).length / tasks.length) * 100;
      setEodProgress(newProgress);
      setEodComplete(newProgress === 100);
    }
  }, [tasks, setEodProgress, setEodComplete]);

  const progress = tasks.length > 0 ? (tasks.filter(t => t.done).length / tasks.length) * 100 : 0;
  const remainingCount = tasks.filter(t => !t.done).length;
  const allDone = progress === 100;

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    );
  }

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
                <div 
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600 shadow-sm cursor-pointer hover:bg-green-200 transition-colors"
                  onClick={() => {
                     // Toggle last item to undo for demo purposes
                     if (tasks.length > 0) {
                       const lastTask = tasks[tasks.length - 1];
                       toggleStep(lastTask.id, lastTask.done);
                     }
                  }}
                  title="Click to undo (Demo)"
                >
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-green-800">You are all set!</p>
                <p className="text-xs text-green-600">See you tomorrow.</p>
             </div>
        ) : (
            <div className="space-y-3">
                {tasks.map((task) => (
                    <div 
                        key={task.id} 
                        className="flex items-center gap-3 text-sm group cursor-pointer"
                        onClick={() => toggleStep(task.id, task.done)}
                    >
                        {task.done ? (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-none transition-transform active:scale-90" />
                        ) : (
                            <Circle className="w-4 h-4 text-slate-300 group-hover:text-orange-500 flex-none transition-transform active:scale-90" />
                        )}
                        <span className={cn(
                            "transition-colors select-none",
                            task.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-600 font-medium group-hover:text-slate-900"
                        )}>
                            {task.label}
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
