import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api/client';

export interface EpisodeProfile {
  id: string;
  name: string;
  description: string;
}

export interface SpeakerProfile {
  id: string;
  name: string;
  description: string;
}

export interface PodcastEpisode {
  id: string;
  name: string;
  audio_url?: string;
  job_status: string;
  error_message?: string;
}

export function useEpisodeProfiles() {
  return useQuery<EpisodeProfile[]>({
    queryKey: ['episode-profiles'],
    queryFn: async () => {
      const response = await api.get('/episode-profiles');
      return response.data;
    }
  });
}

export function useSpeakerProfiles() {
  return useQuery<SpeakerProfile[]>({
    queryKey: ['speaker-profiles'],
    queryFn: async () => {
      const response = await api.get('/speaker-profiles');
      return response.data;
    }
  });
}

export function usePodcastEpisodes() {
  return useQuery<PodcastEpisode[]>({
    queryKey: ['podcast-episodes'],
    queryFn: async () => {
      const response = await api.get('/podcasts/episodes');
      return response.data;
    }
  });
}

export function useGeneratePodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      episode_profile: string;
      speaker_profile: string;
      episode_name: string;
      content: string;
      notebook_id: string;
    }) => {
      const response = await api.post('/podcasts/generate', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcast-episodes'] });
    }
  });
}

export function usePodcastJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['podcast-job', jobId],
    queryFn: async () => {
      const response = await api.get(`/podcasts/jobs/${jobId}`);
      return response.data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      return 3000;
    }
  });
}
