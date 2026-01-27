import { 
  AlertTriangle, 
  Clock, 
  User, 
  ShieldAlert, 
  MessageSquare, 
  Mail, 
  Ticket,
  Calendar
} from "lucide-react";

export type Priority = "critical" | "high" | "medium" | "low";
export type Source = "ticket" | "email" | "teams" | "calendar";
export type State = "action_required" | "waiting" | "snoozed" | "info";

export interface ActionItem {
  id: string;
  title: string;
  summary: string;
  source: Source;
  priority: Priority;
  state: State;
  timestamp: string;
  sender?: string;
  reason: string; // "Why it matters"
  slaStatus?: "breaching" | "warning" | "safe";
  waitingOn?: string;
}

export const mockActionItems: ActionItem[] = [
  {
    id: "INC-001",
    title: "VPN Gateway Latency - Health Science Campus",
    summary: "Multiple users reporting slow connection speeds. Network logs showing high packet loss on Gateway-02.",
    source: "ticket",
    priority: "critical",
    state: "action_required",
    timestamp: "10m ago",
    reason: "Service Degradation (Major)",
    slaStatus: "breaching"
  },
  {
    id: "MSG-042",
    title: "Mentioned by Mike Ross (Security Lead)",
    summary: "@J.Doe Can you verify the firewall logs for the new radiometry server? Need this for the audit report by 2pm.",
    source: "teams",
    priority: "high",
    state: "action_required",
    timestamp: "25m ago",
    sender: "Mike Ross",
    reason: "Direct Mention • Compliance Deadline"
  },
  {
    id: "EMAIL-892",
    title: "Re: Access Request for Cardiology Dataset",
    summary: "I've attached the IRB approval. Please expedite access for Dr. Chen.",
    source: "email",
    priority: "high",
    state: "action_required",
    timestamp: "45m ago",
    sender: "Dr. Sarah Chen",
    reason: "VIP Sender • Access Blocking"
  },
  {
    id: "REQ-102",
    title: "New Hire Provisioning - Radiology",
    summary: "Waiting for HR to confirm start date before creating AD account.",
    source: "ticket",
    priority: "medium",
    state: "waiting",
    timestamp: "2h ago",
    reason: "Routine Task",
    waitingOn: "HR Dept"
  },
  {
    id: "EMAIL-331",
    title: "Scheduled Maintenance: This Weekend",
    summary: "FYI: The storage array firmware update is scheduled for Saturday 2am.",
    source: "email",
    priority: "low",
    state: "info",
    timestamp: "3h ago",
    sender: "Infra Team",
    reason: "FYI Only"
  }
];

export const metrics = {
  breachRisk: 2,
  waitingOnYou: 5,
  vipRequests: 3,
  slaCompliance: "98.2%"
};
