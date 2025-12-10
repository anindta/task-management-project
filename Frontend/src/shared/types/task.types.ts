export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: number;
  projectId: number;
  assignedUserId?: number | null;
  assignedUser?: {
    id: number;
    username: string;
  };
  // Tambahan info Project dari backend
  project?: {
    id: number;
    name: string;
  };
  completionNote?: string;
}