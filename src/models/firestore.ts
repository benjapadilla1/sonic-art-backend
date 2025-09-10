export interface Module {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  order: number;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  comments?: Comment[];
  order: number;
  videoUrl: string;
}

export interface Course {
  id?: string;
  title: string;
  introVideoUrl?: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
  coverImageUrl?: string;
  modules: Module[];
  createdAt: FirebaseFirestore.Timestamp | string;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface SamplePack {
  id?: string;
  title: string;
  description?: string;
  coverImageUrl: string;
  previewTracks: string[];
  price: number;
  downloadUrl: string;
  category?: string;
  createdAt: FirebaseFirestore.Timestamp | string;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface ClassOption {
  id?: string;
  quantity: number; // Cantidad de clases (1, 3, 5, etc)
  price: number; // Precio total por esa cantidad
}

export interface Booking {
  id?: string;
  userId: string;
  classOptionId: string; // referencia a la opción comprada
  date: string; // ISO string para fecha/hora reservada
  status: "pending" | "confirmed" | "cancelled";
  paymentId?: string; // referencia a pago en Stripe u otro
}

export interface UserProfile {
  uid?: string;
  displayName?: string;
  email: string;
  purchaseHistory?: string[]; // array de IDs de cursos o sample packs comprados
  isAdmin: boolean;
  provider?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface Order {
  id?: string;
  userId: string;
  items: any[];
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}
