import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import api from '../lib/api/client';
import { ChatSession, ChatMessage } from '../types';

export function useChatSessions(notebookId?: string | null) {
  return useQuery<ChatSession[]>({
    queryKey: ['chat-sessions', notebookId],
    queryFn: async () => {
      const url = notebookId ? `/chat/sessions?notebook_id=${notebookId}` : '/chat/sessions';
      const response = await api.get(url);
      return response.data;
    },
    // No longer dependent on notebookId existence
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ notebookId, title }: { notebookId?: string | null; title?: string }) => {
      const response = await api.post('/chat/sessions', {
        notebook_id: notebookId,
        title: title || 'New Chat',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, title }: { sessionId: string; title: string }) => {
      const response = await api.put(`/chat/sessions/${sessionId}`, { title });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['chat-session', data.id] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      await api.delete(`/chat/sessions/${sessionId}`);
      return sessionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

export function useChat(notebookId: string | null) {
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Fetch current session messages
  const { data: sessionData } = useQuery<ChatSession>({
    queryKey: ['chat-session', currentSessionId],
    queryFn: async () => {
      const response = await api.get(`/chat/sessions/${currentSessionId}`);
      return response.data;
    },
    enabled: !!currentSessionId,
  });

  useEffect(() => {
    // When session data changes (including messages from backend)
    // We would ideally have a separate messages endpoint but for now we use session data
    // Assuming the backend returns messages in the session response
    if (sessionData && (sessionData as any).messages) {
      setMessages((sessionData as any).messages);
    }
  }, [sessionData]);

  const createSession = useMutation({
    mutationFn: async (title?: string) => {
      const response = await api.post('/chat/sessions', {
        notebook_id: notebookId,
        title: title || 'New Chat',
      });
      return response.data;
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setCurrentSessionId(newSession.id);
    },
  });

  const sendMessage = useCallback(async (message: string, modelOverride?: string, contextConfig?: any) => {
    let sessionId = currentSessionId;

    if (!sessionId) {
      const newSession = await createSession.mutateAsync(message.substring(0, 30));
      sessionId = newSession.id;
    }

    // Optimistic update
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      type: 'human',
      content: message,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      // 1. Build context
      let contextConfigPayload: any = { sources: {}, notes: {} };
      if (contextConfig) {
        contextConfigPayload = contextConfig;
      }

      // 2. Execute chat
      const response = await api.post('/chat/execute', {
        session_id: sessionId,
        message,
        context: contextConfigPayload,
        model_override: modelOverride,
      });

      // 3. Update messages
      if (response.data.messages) {
        setMessages(response.data.messages);
      }
      
      queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId] });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Rollback optimistic update or show error
    } finally {
      setIsSending(false);
    }
  }, [currentSessionId, notebookId, createSession, queryClient]);

  return {
    currentSessionId,
    setCurrentSessionId,
    messages,
    isSending,
    sendMessage,
    createSession: createSession.mutate,
  };
}
