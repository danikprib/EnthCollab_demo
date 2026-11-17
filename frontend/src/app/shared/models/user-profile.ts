export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  memberSince?: string;
  projectsCount?: number;
  likesCount?: number;
}