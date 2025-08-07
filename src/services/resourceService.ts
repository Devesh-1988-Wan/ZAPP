import { supabase } from '@/lib/supabase';
import { Resource } from '@/integrations/supabase/types';

export class ResourceService {
  static async getResourcesForProject(projectId: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');

    if (error) {
      console.error("Error fetching resources:", error);
      throw error;
    }
    return data || [];
  }

  static async createResource(resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Promise<Resource> {
    const { data, error } = await supabase
      .from('resources')
      .insert(resource)
      .select()
      .single();

    if (error) {
      console.error("Error creating resource:", error);
      throw error;
    }
    return data;
  }

  static async deleteResource(id: string): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting resource:", error);
      throw error;
    }
  }
}