import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getManagingUnit, listManagingUnits, registerManagingUnit } from './managing-unit.api';

export const managingUnitKeys = {
  all: ['managing-units'] as const,
  detail: (id: string) => ['managing-units', id] as const,
};

export function useManagingUnits() {
  return useQuery({
    queryKey: managingUnitKeys.all,
    queryFn: listManagingUnits,
    staleTime: 5 * 60 * 1000,
  });
}

export function useManagingUnit(id: string | undefined) {
  return useQuery({
    queryKey: managingUnitKeys.detail(id ?? ''),
    queryFn: () => getManagingUnit(id!),
    enabled: Boolean(id),
  });
}

export function useRegisterManagingUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerManagingUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managingUnitKeys.all });
    },
  });
}
