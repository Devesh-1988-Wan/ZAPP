import { supabase } from '@/lib/supabase'
import { Project } from '@/types/project'; // Assuming types are correctly defined

// Define insert/update types based on your schema
type ProjectInsert = Omit<Project, 'id' | 'created_date' | 'last_modified' | 'created_by'>;
type ProjectUpdate = Partial<ProjectInsert>;

export class ProjectService {
  /**
   * Fetches all projects accessible to the current user by calling a Postgres function.
   * This is more secure and efficient than client-side filtering.
   */
  static async getUserProjects(): Promise<Project[]> {
    // This assumes you have a 'get_user_projects' function in your database
    // which securely returns projects based on auth.uid()
    const { data, error } = await supabase.rpc('get_user_projects');

    if (error) {
      console.error("Error fetching user projects:", error);
      throw error;
    }
    return data || [];
  }

  /**
   * Fetches a single project by its ID. RLS policies will ensure access control.
   */
  static async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*, custom_fields(*)')
      .eq('id', id)
      .single();

    if (error) {
        // It's common for 'single()' to error if no row is found. Handle this gracefully.
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error("Error fetching project:", error);
        throw error;
    }
    return data;
  }

  // Other methods (create, update, delete) remain largely the same,
  // as RLS will handle the security. Ensure you're returning the selected data.
  static async createProject(project: ProjectInsert): Promise<Project> {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      if (error) throw error;
      return data;
  }
}