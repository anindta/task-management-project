export interface User {
  id: number;
  username: string;
  email: string;
  role: string; // "Admin", "ProjectManager", etc
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password?: string; // Optional saat edit
  role: string;
}