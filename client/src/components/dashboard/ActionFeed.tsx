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
  Ticket,
  Plus,
  AlertTriangle,
  Zap
} from "lucide-react";
import { ActionItem, mockActionItems, Source } from "./mockData";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ActionFeed() {
  const activeItems = mockActionItems.filter(i => i.state === "action_required");
  const waitingItems = mockActionItems.filter(i => i.state === "waiting");
  const infoItems = mockActionItems.filter(i => i.state === "info");

  return (
    <Card className="border-none shadow-sm h-full flex flex-col bg-white rounded-xl overflow-hidden ring-1 ring-slate-100">
      <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-50 flex-none bg-white">
        <div className="flex items-center justify-between mb-6">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Unified Action Feed
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="focus" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100/50 p-1 rounded-lg h-10 w-auto inline-flex gap-1">
              <TabsTrigger 
                value="focus" 
                className="rounded-md px-4 data-[state=active]:bg-[#F47321] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 font-bold text-xs transition-all tracking-wide ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Zap className="w-3.5 h-3.5 mr-2 fill-current animate-pulse" />
                FOCUS <span className="hidden sm:inline ml-1 opacity-90">— Act Now</span>
              </TabsTrigger>
              <TabsTrigger value="waiting" className="rounded-md px-4 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 font-medium text-xs text-slate-500">
                Waiting <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px] data-[state=active]:bg-amber-200/50 data-[state=active]:text-amber-700">{waitingItems.length}</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="rounded-md px-4 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-700 font-medium text-xs text-slate-500">
                FYI / Done <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px]">{infoItems.length}</span>
              </TabsTrigger>
            </TabsList>
            
            <Button variant="ghost" size="sm" className="text-xs text-green-700 hover:text-green-800 hover:bg-green-50 h-8 px-2">
                <Ticket className="w-3 h-3 mr-1 bg-green-600 text-white rounded-[2px] p-[1px]" /> View All
            </Button>
          </div>
          
          <div className="mt-2">
             <TabsContent value="focus" className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <FeedList items={activeItems} type="focus" />
             </TabsContent>
             <TabsContent value="waiting" className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <FeedList items={waitingItems} type="waiting" />
             </TabsContent>
             <TabsContent value="info" className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <FeedList items={infoItems} type="info" />
             </TabsContent>
          </div>
        </Tabs>
      </CardHeader>
      
      {/* Floating Action Button area at bottom */}
      <div className="mt-auto p-4 border-t border-slate-50 flex justify-center">
        <Button variant="outline" className="rounded-full px-6 py-5 shadow-sm border-slate-200 text-green-700 hover:text-green-800 hover:border-green-200 hover:bg-green-50 group transition-all font-semibold">
             <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> New Ticket
        </Button>
      </div>
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
    <div className="space-y-3 pt-4">
      {items.map((item, index) => (
        <FeedItem key={item.id} item={item} type={type} index={index} />
      ))}
    </div>
  );
}

function FeedItem({ item, type, index }: { item: ActionItem, type: string, index: number }) {
  const { toast } = useToast();
  const isTopItem = type === "focus" && index === 0;

  const handleAction = (action: string) => {
    toast({
      title: `${action} applied`,
      description: `Item ${item.id} has been updated.`,
    });
  };

  const getIcon = (source: Source) => {
    switch (source) {
      case "email": return <Mail className="w-3 h-3" />;
      case "teams": return <MessageSquare className="w-3 h-3" />;
      case "ticket": return <Ticket className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getSourceConfig = (source: Source) => {
    switch (source) {
      case "ticket": 
        return { 
          border: "border-l-orange-500", 
          badge: "text-orange-700 bg-orange-50 border-orange-100", 
        };
      case "teams": 
        return { 
          border: "border-l-purple-500", 
          badge: "text-purple-700 bg-purple-50 border-purple-100", 
        };
      case "email": 
        return { 
          border: "border-l-blue-500", 
          badge: "text-blue-700 bg-blue-50 border-blue-100", 
        };
      default: 
        return { 
          border: "border-l-slate-400", 
          badge: "text-slate-700 bg-slate-100 border-slate-200", 
        };
    }
  };

  const config = getSourceConfig(item.source);

  return (
    <div className={cn(
      "p-4 rounded-lg bg-slate-50/50 hover:bg-white border hover:shadow-md transition-all group relative border-l-[3px]",
      config.border,
      "border-y-transparent border-r-transparent hover:border-y-slate-100 hover:border-r-slate-100",
      isTopItem && "bg-orange-50/30 border-l-[4px] shadow-sm ring-1 ring-orange-100/50"
    )}>
      {/* Top Row: Meta */}
      <div className="flex justify-between items-start mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 h-5 gap-1.5 font-medium border opacity-75", config.badge)}>
            {getIcon(item.source)}
            {item.id}
          </Badge>
          
          {item.sender && (
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 opacity-90">
               <span className="text-slate-300">•</span> {item.sender}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap opacity-75">{item.timestamp}</span>
      </div>

      {/* Main Content */}
      <div className="pr-12">
        <h3 className={cn("text-sm font-bold text-slate-900 mb-1 leading-tight", item.priority === "critical" && "text-destructive text-base")}>
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
          {item.summary}
        </p>
        
        {/* Next Action Hint */}
        {item.nextAction && (
             <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100/80 px-2 py-1.5 rounded w-fit border border-slate-200/50">
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mr-1">Next:</span>
                {item.nextAction}
             </div>
        )}
        
        {/* Context / Reason / Impact */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.impact && (
             <Badge className="text-[10px] px-2 py-0.5 h-auto bg-destructive/10 text-destructive border border-destructive/20 font-bold rounded-md hover:bg-destructive/20 shadow-sm">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {item.impact}
             </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto bg-slate-200/50 text-slate-600 font-medium rounded-md hover:bg-slate-200">
             {item.reason}
          </Badge>
          {item.waitingOn && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-auto text-amber-700 bg-amber-50 border-amber-200 font-medium rounded-md">
               ⏳ Waiting on {item.waitingOn}
            </Badge>
          )}
        </div>
      </div>

      {/* Hover Actions (Floating) */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {type === "focus" && (
            <>
                <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50" title="Mark Done / Acknowledge" onClick={() => handleAction("Completed")}>
                    <CheckCircle2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50" title="Reply / Open" onClick={() => handleAction("Reply started")}>
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </>
        )}
      </div>
    </div>
  );
}
