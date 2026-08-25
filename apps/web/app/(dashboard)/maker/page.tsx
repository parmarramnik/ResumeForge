import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MakerView } from '@/components/maker/maker-view';

export default function MakerPage() {
  return (
    <DashboardLayout noPadding>
      <MakerView />
    </DashboardLayout>
  );
}
