import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { GeneratorView } from '@/components/generator/generator-view';

export default async function GeneratorWithIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <GeneratorView />
    </DashboardLayout>
  );
}
