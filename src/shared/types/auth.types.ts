export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Menu {
  id: number;
  name: string;
  label: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  menus: Menu[];
  loading: boolean;
}