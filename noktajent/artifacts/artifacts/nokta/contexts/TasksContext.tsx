import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useListTasks, useCreateTask, useUpdateTask, useDeleteTask, Task, TaskStatus, TaskPriority } from "@/api";

export type { TaskStatus, TaskPriority };
}

interface TasksContextValue {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  moveTask: (id: number, status: TaskStatus) => Promise<void>;
  toggleChecklistItem: (taskId: number, itemId: string) => Promise<void>;
  addChecklistItem: (taskId: number, text: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextValue>({
  tasks: [],
  loading: false,
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  moveTask: async () => {},
  toggleChecklistItem: async () => {},
  addChecklistItem: async () => {},
  refreshTasks: async () => {},
});

const KEY = "nokta_tasks_v3";

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [userId] = useState("default-user"); // TODO: Get from auth

  const { data: tasks = [], isLoading: loading, refetch } = useListTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Load from local storage for offline support
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v) {
        try { setLocalTasks(JSON.parse(v)); } catch {}
      }
    });
  }, []);

  const refreshTasks = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const addTask = useCallback(async (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    try {
      await createTaskMutation.mutateAsync({
        data: {
          ...data,
          userId,
          progress: 0,
          checklist: [],
        }
      });
      await refreshTasks();
    } catch (error) {
      // Fallback to local storage
      const now = new Date().toISOString();
      const task: Task = {
        ...data,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
        progress: 0,
        checklist: [],
      };
      const next = [task, ...localTasks];
      setLocalTasks(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
    }
  }, [createTaskMutation, refreshTasks, localTasks, userId]);

  const updateTask = useCallback(async (id: number, updates: Partial<Task>) => {
    try {
      await updateTaskMutation.mutateAsync({
        id,
        data: updates
      });
      await refreshTasks();
    } catch (error) {
      // Fallback to local
      const next = localTasks.map((t) => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
      setLocalTasks(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
    }
  }, [updateTaskMutation, refreshTasks, localTasks]);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await deleteTaskMutation.mutateAsync({ id });
      await refreshTasks();
    } catch (error) {
      // Fallback to local
      const next = localTasks.filter((t) => t.id !== id);
      setLocalTasks(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
    }
  }, [deleteTaskMutation, refreshTasks, localTasks]);

  const moveTask = useCallback(async (id: number, status: TaskStatus) => {
    await updateTask(id, { status });
  }, [updateTask]);

  const toggleChecklistItem = useCallback(async (taskId: number, itemId: string) => {
    const task = [...tasks, ...localTasks].find(t => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    await updateTask(taskId, { checklist: updatedChecklist });
  }, [tasks, localTasks, updateTask]);

  const addChecklistItem = useCallback(async (taskId: number, text: string) => {
    const task = [...tasks, ...localTasks].find(t => t.id === taskId);
    if (!task) return;

    const newItem = { id: Date.now().toString(), text, completed: false };
    const updatedChecklist = [...task.checklist, newItem];

    await updateTask(taskId, { checklist: updatedChecklist });
  }, [tasks, localTasks, updateTask]);

  // Combine API and local tasks
  const allTasks = [...tasks, ...localTasks.filter(local =>
    !tasks.some(api => api.id === local.id)
  )];

  return (
    <TasksContext.Provider value={{
      tasks: allTasks,
      loading,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      toggleChecklistItem,
      addChecklistItem,
      refreshTasks
    }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  return useContext(TasksContext);
}
