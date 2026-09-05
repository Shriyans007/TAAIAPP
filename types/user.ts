export interface UserProfile { id: number; username: string; email: string; firstName: string; lastName: string; displayName: string; phone?: string; billing?: { address1?: string; city?: string; postcode?: string; state?: string; country?: string } }

