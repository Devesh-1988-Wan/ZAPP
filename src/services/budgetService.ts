import { supabase } from '@/lib/supabase';
import { Budget, Expense } from '@/integrations/supabase/types';

export class BudgetService {
  static async getBudgetsForProject(projectId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
      
    if (error) {
        console.error("Error fetching budgets:", error);
        throw error;
    }
    return data || [];
  }

  static async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data, error } = await supabase
        .from('budgets')
        .insert(budget)
        .select()
        .single();

    if (error) {
        console.error("Error creating budget:", error);
        throw error;
    }
    return data;
  }

  static async getExpensesForProject(projectId: string): Promise<Expense[]> {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('incurred_on', { ascending: false });

    if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
    }
    return data || [];
  }

  static async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();
    
    if (error) {
        console.error("Error creating expense:", error);
        throw error;
    }
    return data;
  }
}