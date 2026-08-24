import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { INITIAL_TEMPLATES } from '@/lib/supabase/mock-data';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !templates || templates.length === 0) {
      return NextResponse.json({
        success: true,
        data: INITIAL_TEMPLATES.filter((t) => t.is_active),
      });
    }

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: INITIAL_TEMPLATES.filter((t) => t.is_active),
    });
  }
}
