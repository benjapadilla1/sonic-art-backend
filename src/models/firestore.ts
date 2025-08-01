export interface Module {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
  order: number; // orden del módulo en el curso
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
  modules: Module[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export interface SamplePack {
  id?: string;
  name: string;
  description?: string;
  price: number;
  downloadUrl: string;
  category?: string;
  createdAt: FirebaseFirestore.Timestamp;
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
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}
