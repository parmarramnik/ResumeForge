import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TemplateEditorView } from '@/components/admin/template-editor-view';

export default function NewTemplatePage() {
  return (
    <DashboardLayout>
      <TemplateEditorView isNew={true} />
    </DashboardLayout>
  );
}
