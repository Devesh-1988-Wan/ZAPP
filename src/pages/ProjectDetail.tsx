import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectService } from "@/services/projectService";
import { TaskService } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";

// Child Components (to be created)
import { ProjectHeader } from "@/components/ProjectHeader";
import { TaskDashboard } from "@/components/TaskDashboard"; // New component to hold tabs/gantt
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { NotFoundScreen } from "@/components/ui/NotFoundScreen";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <NotFoundScreen message="Project ID is missing." />;

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // --- React Query Hooks ---
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => ProjectService.getProject(projectId),
  });

  const { data: tasks = [], isLoading: areTasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => TaskService.getProjectTasks(projectId),
  });

  // Example Mutation with optimistic updates
  const updateTaskMutation = useMutation({
    mutationFn: TaskService.updateTask,
    onSuccess: () => {
      toast({ title: "Task Updated" });
    },
    // Optimistically update the UI before the API call completes
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData(['tasks', projectId]);
      queryClient.setQueryData(['tasks', projectId], (old: Task[]) =>
        old.map(task => (task.id === updatedTask.id ? { ...task, ...updatedTask.data } : task))
      );
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      // Roll back on error
      queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    },
    onSettled: () => {
      // Re-fetch after mutation is settled
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // --- Render Logic ---
  if (isProjectLoading || areTasksLoading) {
    return <LoadingScreen message="Loading Project..." />;
  }

  if (isProjectError || !project) {
    return <NotFoundScreen message="Project not found or you do not have permission to view it." />;
  }

  const isOwner = user?.id === project.created_by;
  const projectStats = { /* ... calculation from useMemo ... */ };

  return (
    <div className="min-h-screen bg-background">
      {/* Header, UserMenu etc. */}
      <ProjectHeader
        project={project}
        stats={projectStats}
        // ... callbacks for add task, import etc.
      />
      <main className="container mx-auto p-6 space-y-6">
        <TaskDashboard
            tasks={tasks}
            customFields={project.customFields}
            onUpdateTask={(id, data) => updateTaskMutation.mutate({ id, data })}
            // ... other props
        />
        {/* Resource/Budget Management components can be conditionally rendered here */}
      </main>
    </div>
  );
};

export default ProjectDetail;