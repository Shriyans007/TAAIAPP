export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string | null;
  googleLinked?: boolean;
  phone?: string;
  billing?: {
    address1?: string;
    city?: string;
    postcode?: string;
    state?: string;
    country?: string;
  };
}
