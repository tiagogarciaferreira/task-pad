export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  photo: string | null;
  initials: string | undefined;
}
