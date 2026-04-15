export interface Worker {
  id: string; // ✅ FIXED (important)
  name: string;
  skills: string[];
  wage: number;
  availability: boolean;
  rating: number;
  totalReviews: number;
}