import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export function usePeriods(companyId?: string) {
  return useQuery({
    queryKey: ['periods', companyId],
    queryFn: async () => {
      const { data } = await api.get('/pnl/periods', { params: { companyId } });
      return data.data;
    }
  });
}

export function usePeriodTree(companyId: string | undefined, periodStart: string | undefined) {
  return useQuery({
    enabled: !!companyId && !!periodStart,
    queryKey: ['tree', companyId, periodStart],
    queryFn: async () => {
      const { data } = await api.get('/pnl/tree', { params: { companyId, periodStart } });
      return data.data;
    }
  });
}

export function useSummary(companyId?: string) {
  return useQuery({
    queryKey: ['summary', companyId],
    queryFn: async () => {
      const { data } = await api.get('/pnl/summary', { params: { companyId } });
      return data.data;
    }
  });
}

export function useIngest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { source: 'json1' | 'json2'; payload: any }) => {
      const path = params.source === 'json1' ? '/integrations/json1' : '/integrations/json2';
      const { data } = await api.post(path, params.payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries();
    }
  });
}
