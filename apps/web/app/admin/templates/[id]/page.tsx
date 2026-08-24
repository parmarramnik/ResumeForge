import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TemplateEditorView } from '@/components/admin/template-editor-view';
import { INITIAL_TEMPLATES } from '@/lib/supabase/mock-data';

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = INITIAL_TEMPLATES.find((t) => t.id === id) || INITIAL_TEMPLATES[0];

  return (
    <DashboardLayout>
      <TemplateEditorView initialTemplate={template} isNew={false} />
    </DashboardLayout>
  );
}
