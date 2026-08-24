import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MakerView } from '@/components/maker/maker-view';

export default async function MakerWithIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <MakerView />
    </DashboardLayout>
  );
}
