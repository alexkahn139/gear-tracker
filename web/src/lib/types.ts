export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

export type GearCategory =
  | 'tent'
  | 'sleep'
  | 'cook'
  | 'safety'
  | 'clothing'
  | 'navigation'
  | 'other';

export type GearCondition = 'new' | 'good' | 'worn' | 'damaged' | 'broken';

export type GearItem = {
  id: number;
  name: string;
  category: GearCategory;
  description?: string;
  photoUrl?: string;
  weightG?: number;
  qtyOwned: number;
  condition: GearCondition;
  location?: string;
  serialId?: string;
  notes?: string;
  createdAt: string;
};

export type Loan = {
  id: number;
  gearItemId: number;
  borrowerId: number;
  borrowerName?: string;
  checkedOutAt: string;
  dueDate?: string;
  returnedAt?: string;
  conditionOnReturn?: string;
  notes?: string;
};

export type GearWithLoans = { item: GearItem; loans: Loan[] };

export type GearList = { items: GearItem[]; activeLoans: Loan[] };

export type Trip = {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  notes?: string;
  shareToken: string;
  createdAt: string;
};

export type PackItem = {
  id: number;
  tripId: number;
  gearItemId?: number;
  gearItemName?: string;
  adHocName?: string;
  qtyNeeded: number;
  qtyChecked: number;
  notes?: string;
  sortOrder: number;
};

export type TripWithPackList = { trip: Trip; packList: PackItem[] };

export type PackListResponse = { items: PackItem[]; totalWeightG: number };

export type ApiError = { error: string; details?: unknown };
