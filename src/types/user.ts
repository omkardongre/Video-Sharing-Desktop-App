export type UserSubscription = {
  plan: 'PRO' | 'FREE';
};

export type UserStudio = {
  id: string;
  screen: string | null;
  mic: string | null;
  preset: 'HD' | 'SD';
  camera: string | null;
  userId: string;
  plan: 'PRO' | 'FREE';
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  clerkId: string;
  subscription: UserSubscription | null;
  studio: UserStudio | null;
};

export type ProfileState = {
  status: number;
  user: UserProfile | null;
} | null;
