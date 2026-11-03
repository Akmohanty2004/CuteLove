import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export const useMoods = (hours = 24) => {
  const queryClient = useQueryClient();
  const { emitMoodUpdate } = useSocket();
  const { updateCurrentUserMood } = useAuth();

  // Mood timeline query for Recharts
  const timelineQuery = useQuery({
    queryKey: ['moodTimeline', hours],
    queryFn: async () => {
      const res = await api.get(`/moods/timeline?hours=${hours}`);
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // Current mood pair query
  const currentMoodsQuery = useQuery({
    queryKey: ['currentMoods'],
    queryFn: async () => {
      const res = await api.get('/moods/current');
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  // Update mood mutation
  const updateMoodMutation = useMutation({
    mutationFn: async ({ mood, note }) => {
      const res = await api.post('/moods/update', { mood, note });
      return res.data;
    },
    onSuccess: (data, variables) => {
      updateCurrentUserMood(variables.mood);
      emitMoodUpdate(variables.mood, variables.note);
      queryClient.invalidateQueries({ queryKey: ['moodTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['currentMoods'] });
    },
  });

  return {
    timelineData: timelineQuery.data?.chartData || [],
    isTimelineLoading: timelineQuery.isLoading,
    currentMoods: currentMoodsQuery.data || {},
    updateMood: updateMoodMutation.mutateAsync,
    isUpdatingMood: updateMoodMutation.isPending,
  };
};
