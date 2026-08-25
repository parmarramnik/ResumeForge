import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { GeneratorView } from '@/components/generator/generator-view';

export default function GeneratorPage() {
  return (
    <DashboardLayout noPadding>
      <GeneratorView />
    </DashboardLayout>
  );
}
