export interface User {
  id: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  creditBalance: number;
  location: {
    lat: number;
    lng: number;
  };
  openToVolunteering: boolean;
  email?: string; 
  reputationScore?: number;
}

export interface Skill {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  creditsPerHour: number;
  user?: User; // populated by joins
}

export enum SwapStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Swap {
  id: string;
  skill: Skill;
  learner: User;
  teacher: User;
  status: SwapStatus;
  googleMeetLink?: string;
  latestMessage?: Message;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender?: User; // Populated for chat UI
  readAt?: Date; // For read receipts
}

export interface AISuggestion {
  description: string;
  category: string;
  credits: number;
}

export interface Review {
  id: string;
  swapId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
  reviewer?: User; // populated by joins
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}