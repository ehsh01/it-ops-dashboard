import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ActionItem, EodTask } from "@shared/schema";

// Action Items API
export function useActionItems() {
  return useQuery<ActionItem[]>({
    queryKey: ["/api/action-items"],
    queryFn: async () => {
      const response = await fetch("/api/action-items");
      if (!response.ok) throw new Error("Failed to fetch action items");
      return response.json();
    },
  });
}

export function useUpdateActionItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ActionItem> }) => {
      const response = await fetch(`/api/action-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update action item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
    },
  });
}

export function useDeleteActionItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/action-items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete action item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
    },
  });
}

export function useCreateActionItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<ActionItem, "id" | "createdAt" | "updatedAt" | "userId">) => {
      const response = await fetch("/api/action-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error("Failed to create action item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
    },
  });
}

// EOD Tasks API
export function useEodTasks(date?: string) {
  const today = date || new Date().toISOString().split('T')[0];
  
  return useQuery<EodTask[]>({
    queryKey: ["/api/eod-tasks", today],
    queryFn: async () => {
      const response = await fetch(`/api/eod-tasks?date=${today}`);
      if (!response.ok) throw new Error("Failed to fetch EOD tasks");
      return response.json();
    },
  });
}

export function useUpdateEodTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EodTask> }) => {
      const response = await fetch(`/api/eod-tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update EOD task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eod-tasks"] });
    },
  });
}

// Demo data initialization
export function useInitDemoData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/init-demo-data", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to initialize demo data");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
    },
  });
}
