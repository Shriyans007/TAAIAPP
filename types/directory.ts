export interface DirectoryBusiness {
  id: number;
  name: string;
  category: string;
  description: string;
  discount: string;
  address?: string;
  phone?: string;
  website?: string;
  directionsUrl?: string;
  image?: string;
}

export interface DirectoryResponse {
  eligibility: 'eligible';
  instructions: string;
  businesses: DirectoryBusiness[];
}
