import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useGenUISessions() {
  return useQuery({
    queryKey: ['genuiSessions'],
    queryFn: async () => {
      const res = await fetch('/api/genui/sessions');
      if (!res.ok) throw new Error('Failed to fetch genui sessions');
      return res.json();
    },
  });
}

export function useCreateGenUISession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/genui/sessions', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create genui session');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genuiSessions'] });
    },
  });
}

export function useDeleteGenUISession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/genui/sessions/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete genui session');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genuiSessions'] });
    },
  });
}
