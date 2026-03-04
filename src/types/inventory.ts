export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}
