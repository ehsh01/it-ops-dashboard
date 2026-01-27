import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Clock, 
  Mail, 
  MessageSquare, 
  MoreHorizontal, 
  ArrowRight,
  Filter,
  Search,
  ArrowDownAZ,
  Ticket
} from "lucide-react";
import { ActionItem, mockActionItems, Source } from "./mockData";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function ActionFeed() {
  const activeItems = mockActionItems.filter(i => i.state === "action_required");
  const waitingItems = mockActionItems.filter(i => i.state === "waiting");
  const infoItems = mockActionItems.filter(i => i.state === "info");

  return (
    <Card className="border-slate-200 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-0 border-b border-slate-100 flex-none bg-white rounded-t-lg z-10">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Unified Action Feed
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="focus" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100/80 p-1">
            <TabsTrigger value="focus" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium">
              Focus <span className="ml-2 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">{activeItems.length}</span>
            </TabsTrigger>
            <TabsTrigger value="waiting" className="font-medium">
              Waiting <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">{waitingItems.length}</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="font-medium">
              FYI / Done
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
             <TabsContent value="focus" className="mt-0">
               <FeedList items={activeItems} type="focus" />
             </TabsContent>
             <TabsContent value="waiting" className="mt-0">
               <FeedList items={waitingItems} type="waiting" />
             </TabsContent>
             <TabsContent value="info" className="mt-0">
               <FeedList items={infoItems} type="info" />
             </TabsContent>
          </div>
        </Tabs>
      </CardHeader>
    </Card>
  );
}

function FeedList({ items, type }: { items: ActionItem[], type: "focus" | "waiting" | "info" }) {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>All caught up!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} type={type} />
      ))}
    </div>
  );
}

function FeedItem({ item, type }: { item: ActionItem, type: string }) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `${action} applied`,
      description: `Item ${item.id} has been updated.`,
    });
  };

  const getIcon = (source: Source) => {
    switch (source) {
      case "email": return <Mail className="w-3.5 h-3.5" />;
      case "teams": return <MessageSquare className="w-3.5 h-3.5" />;
      case "ticket": return <Ticket className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getSourceColor = (source: Source) => {
    switch (source) {
      case "email": return "text-blue-600 bg-blue-50 border-blue-200";
      case "teams": return "text-purple-600 bg-purple-50 border-purple-200";
      case "ticket": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-slate-600 bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className={cn(
      "p-4 hover:bg-slate-50 transition-all group relative border-l-4",
      item.priority === "critical" ? "border-l-destructive" :
      item.priority === "high" ? "border-l-orange-500" :
      "border-l-transparent pl-[calc(1rem+4px)]"
    )}>
      {/* Top Row: Meta */}
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 gap-1", getSourceColor(item.source))}>
            {getIcon(item.source)}
            {item.source}
          </Badge>
          <span className="text-xs font-mono text-slate-400">{item.id}</span>
          {item.sender && (
            <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              {item.sender}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">{item.timestamp}</span>
      </div>

      {/* Main Content */}
      <div className="pr-12">
        <h3 className={cn("text-sm font-semibold text-slate-900 mb-1 leading-tight", item.priority === "critical" && "text-destructive")}>
          {item.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
        
        {/* Context / Reason */}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] h-5 bg-slate-100 text-slate-600 font-normal border-slate-200">
             {item.reason}
          </Badge>
          {item.waitingOn && (
            <Badge variant="outline" className="text-[10px] h-5 text-amber-600 bg-amber-50 border-amber-200">
               ⏳ Waiting on {item.waitingOn}
            </Badge>
          )}
        </div>
      </div>

      {/* Hover Actions (Floating) */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {type === "focus" && (
            <>
                <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm border-primary/20 hover:bg-primary hover:text-white" title="Mark Done / Acknowledge" onClick={() => handleAction("Completed")}>
                    <CheckCircle2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm hover:text-blue-600" title="Reply / Open" onClick={() => handleAction("Reply started")}>
                    <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm hover:text-slate-600" title="Snooze" onClick={() => handleAction("Snoozed")}>
                    <ArrowDownAZ className="w-4 h-4" />
                </Button>
            </>
        )}
        {type === "waiting" && (
            <Button size="sm" variant="outline" className="h-7 text-xs bg-white shadow-sm" onClick={() => handleAction("Nudge sent")}>
                Nudge
            </Button>
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-slate-600">
            <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
