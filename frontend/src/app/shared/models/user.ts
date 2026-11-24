export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  tags?: string[];
  memberSince?: string;
  projectsCount?: number;
  likesCount?: number;
}