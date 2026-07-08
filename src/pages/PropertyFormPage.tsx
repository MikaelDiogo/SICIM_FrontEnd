import { Alert, Center, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProperty, useRegisterProperty, useUpdateProperty } from '@/entities/property/property.hooks';
import type { RegisterPropertyInput } from '@/entities/property/property.types';
import { emptyPropertyFormValues, type PropertyFormValues } from '@/features/property-form/property-form-schema';
import { PropertyForm } from '@/features/property-form/PropertyForm';
import { PAGE_GUTTER_X } from '@/shared/ui/layout-constants';
import { PageHeader } from '@/shared/ui/PageHeader';

function propertyToFormValues(property: NonNullable<ReturnType<typeof useProperty>['data']>): PropertyFormValues {
  return {
    registrationNumber: property.registrationNumber,
    notaryOffice: property.notaryOffice,
    notarialDescription: property.notarialDescription,
    address: { ...property.address, reference: property.address.reference ?? '' },
    totalArea: property.totalArea,
    builtArea: property.builtArea,
    latitude: property.latitude,
    longitude: property.longitude,
    managingUnitId: property.managingUnitId,
    budgetUnit: property.budgetUnit ?? '',
    usageCategory: property.usageCategory,
    possessionType: property.possessionType,
    possessionContract: property.possessionContract
      ? {
          ...property.possessionContract,
          startDate: new Date(property.possessionContract.startDate),
          endDate: property.possessionContract.endDate ? new Date(property.possessionContract.endDate) : undefined,
        }
      : undefined,
    acquisitionYear: property.acquisitionYear,
    originalValue: property.originalValue,
    publicPurpose: property.publicPurpose,
  };
}

export function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: property, isLoading: isLoadingProperty, isError } = useProperty(id);
  const registerMutation = useRegisterProperty();
  const updateMutation = useUpdateProperty();

  const initialValues = useMemo(
    () => (property ? propertyToFormValues(property) : emptyPropertyFormValues),
    [property],
  );

  if (isEditing && isLoadingProperty) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (isEditing && isError) {
    return (
      <Alert color="red" icon={<IconAlertCircle size={16} />} m="xl" title="Imóvel não encontrado">
        Não foi possível carregar os dados deste imóvel para edição.
      </Alert>
    );
  }

  const handleSubmit = async (input: RegisterPropertyInput) => {
    const result = isEditing && id ? await updateMutation.mutateAsync({ id, input }) : await registerMutation.mutateAsync(input);
    navigate('/', { replace: true });
    return result;
  };

  return (
    <>
      <PageHeader
        eyebrow={isEditing ? 'Cadastro / Edição de Registro' : 'Cadastro / Novo Registro'}
        title={
          <>
            {isEditing ? 'Editar' : 'Registrar novo'}{' '}
            <span style={{ color: "#1A5C2A", fontWeight: 600 }}>
              bem imóvel
            </span>
          </>
        }
        subtitle={
          <>
            Preencha as informações abaixo para {isEditing ? 'atualizar o registro' : 'inclusão de um novo imóvel'} no
            patrimônio municipal. Campos marcados com * são obrigatórios.
          </>
        }
      />
      <div style={{ padding: `32px ${PAGE_GUTTER_X}px 60px` }}>
        <PropertyForm
          initialValues={initialValues}
          submitLabel={isEditing ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
          isSubmitting={registerMutation.isPending || updateMutation.isPending}
        />
      </div>
    </>
  );
}
