import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient';

export const useMemories = (filters = {}) => {
  const queryClient = useQueryClient();

  // Dashboard Feed (Only visible memories)
  const dashboardQuery = useQuery({
    queryKey: ['dashboardFeed'],
    queryFn: async () => {
      const res = await api.get('/memories/feed');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // Vault memories (All memories, private & visible)
  const vaultQuery = useQuery({
    queryKey: ['vaultMemories', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.mediaType) params.append('mediaType', filters.mediaType);
      if (filters.uploader) params.append('uploader', filters.uploader);
      if (filters.search) params.append('search', filters.search);
      const res = await api.get(`/memories/vault?${params.toString()}`);
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // Memories of the Day / Flashback
  const flashbackQuery = useQuery({
    queryKey: ['flashbacks'],
    queryFn: async () => {
      const res = await api.get('/memories/flashback');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/memories/upload', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardFeed'] });
      queryClient.invalidateQueries({ queryKey: ['vaultMemories'] });
      queryClient.invalidateQueries({ queryKey: ['flashbacks'] });
    },
  });

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/memories/${id}/toggle-visibility`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardFeed'] });
      queryClient.invalidateQueries({ queryKey: ['vaultMemories'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/memories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardFeed'] });
      queryClient.invalidateQueries({ queryKey: ['vaultMemories'] });
    },
  });

  // Like reaction mutation
  const likeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/memories/${id}/like`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardFeed'] });
    },
  });

  return {
    dashboardFeed: dashboardQuery.data?.memories || [],
    isDashboardLoading: dashboardQuery.isLoading,
    vaultMemories: vaultQuery.data?.memories || [],
    isVaultLoading: vaultQuery.isLoading,
    flashbackMemories: flashbackQuery.data?.flashbacks || [],
    uploadMemory: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    toggleVisibility: toggleVisibilityMutation.mutateAsync,
    deleteMemory: deleteMutation.mutateAsync,
    likeMemory: likeMutation.mutateAsync,
    refetchDashboard: dashboardQuery.refetch,
    refetchVault: vaultQuery.refetch,
  };
};
