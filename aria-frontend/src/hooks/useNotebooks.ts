import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api/client';
import { Project } from '../types';

export function useNotebooks() {
  return useQuery<Project[]>({
    queryKey: ['notebooks'],
    queryFn: async () => {
      const response = await api.get('/notebooks');
      return response.data;
    },
  });
}

export function useNotebook(id: string | null) {
  return useQuery<Project>({
    queryKey: ['notebooks', id],
    queryFn: async () => {
      const response = await api.get(`/notebooks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await api.post('/notebooks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notebooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
}

export function useUpdateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; description?: string } }) => {
      const response = await api.put(`/notebooks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
}

