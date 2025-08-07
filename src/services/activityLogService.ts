import { supabase } from '@/lib/supabase';

export interface ActivityLog {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  action: string;
  changes?: Record<string, any>;
  created_at: string;
}

export class ActivityLogService {
  static async getProjectActivity(projectId: string): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        profiles ( display_name, email )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }
    return data || [];
  }
}