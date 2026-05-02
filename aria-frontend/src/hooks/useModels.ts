import { useQuery } from '@tanstack/react-query';
import api from '../lib/api/client';
import { Model } from '../types';

export function useModels(type: string = 'language') {
  return useQuery<Model[]>({
    queryKey: ['models', type],
    queryFn: async () => {
      const response = await api.get(`/models?type=${type}`);
      return response.data;
    },
  });
}

export function useDefaultModels() {
  return useQuery({
    queryKey: ['models', 'defaults'],
    queryFn: async () => {
      // Assuming there's an endpoint or we get it from config
      const response = await api.get('/models/defaults');
      return response.data;
    },
  });
}
