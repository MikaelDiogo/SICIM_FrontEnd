import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveProperty,
  deactivateProperty,
  getProperty,
  listProperties,
  recalculateDepreciation,
  registerProperty,
  updateProperty,
} from './property.api';
import type { ListPropertiesFilters, Property, RegisterPropertyInput, UpdatePropertyInput } from './property.types';

export const propertyKeys = {
  all: ['properties'] as const,
  list: (filters: ListPropertiesFilters) => ['properties', 'list', filters] as const,
  allUnpaged: (filters: Omit<ListPropertiesFilters, 'page' | 'pageSize'>) =>
    ['properties', 'all', filters] as const,
  detail: (id: string) => ['properties', 'detail', id] as const,
};

const MAX_PAGE_SIZE = 100;

export function useProperties(filters: ListPropertiesFilters) {
  return useQuery({
    queryKey: propertyKeys.list(filters),
    queryFn: () => listProperties(filters),
    placeholderData: (previous) => previous,
  });
}

/**
 * Não existe endpoint de agregação/KPIs no backend — dashboard, mapa e relatórios
 * precisam do conjunto completo de imóveis para calcular estatísticas no cliente.
 * Pagina internamente respeitando o limite de pageSize=100 do ListPropertiesDto.
 */
export function useAllProperties(filters: Omit<ListPropertiesFilters, 'page' | 'pageSize'> = {}) {
  return useQuery({
    queryKey: propertyKeys.allUnpaged(filters),
    queryFn: async (): Promise<Property[]> => {
      const first = await listProperties({ ...filters, page: 1, pageSize: MAX_PAGE_SIZE });
      const totalPages = Math.ceil(first.total / first.pageSize);
      if (totalPages <= 1) return first.data;

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          listProperties({ ...filters, page: index + 2, pageSize: MAX_PAGE_SIZE }),
        ),
      );
      return [first, ...remainingPages].flatMap((page) => page.data);
    },
    staleTime: 60 * 1000,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: propertyKeys.detail(id ?? ''),
    queryFn: () => getProperty(id!),
    enabled: Boolean(id),
  });
}

function useInvalidatePropertyQueries() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
    }
  };
}

export function useRegisterProperty() {
  const invalidate = useInvalidatePropertyQueries();
  return useMutation({
    mutationFn: (input: RegisterPropertyInput) => registerProperty(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateProperty() {
  const invalidate = useInvalidatePropertyQueries();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePropertyInput }) => updateProperty(id, input),
    onSuccess: (property) => invalidate(property.id),
  });
}

export function useApproveProperty() {
  const invalidate = useInvalidatePropertyQueries();
  return useMutation({
    mutationFn: (id: string) => approveProperty(id),
    onSuccess: (property) => invalidate(property.id),
  });
}

export function useDeactivateProperty() {
  const invalidate = useInvalidatePropertyQueries();
  return useMutation({
    mutationFn: (id: string) => deactivateProperty(id),
    onSuccess: (property) => invalidate(property.id),
  });
}

export function useRecalculateDepreciation() {
  const invalidate = useInvalidatePropertyQueries();
  return useMutation({
    mutationFn: (id: string) => recalculateDepreciation(id),
    onSuccess: (property) => invalidate(property.id),
  });
}
