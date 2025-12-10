export interface Menu {
  id: number;
  name: string;
  label: string;
  icon?: string; // <--- Tambah field icon (optional biar gak error data lama)
}

export interface MenuPayload {
  name: string;
  label: string;
  icon: string; // <--- Tambah disini juga
}