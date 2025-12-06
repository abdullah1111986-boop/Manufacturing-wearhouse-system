export enum ItemStatus {
  AVAILABLE = 'متاح',
  CHECKED_OUT = 'معار',
  MAINTENANCE = 'صيانة',
  PENDING_RETURN = 'بانتظار الموافقة (إرجاع)'
}

export enum TransactionType {
  CHECKOUT = 'استلام (خروج)',
  RETURN = 'تسليم (رجوع)',
  ADD_ITEM = 'إضافة صنف جديد',
  RETURN_REQUEST = 'طلب إرجاع'
}

export interface Instructor {
  id: string;
  name: string;
  password: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  status: ItemStatus;
  currentHolder?: string; // Name of the instructor who has it
  lastUpdated: string;
  addedBy?: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  instructorName: string;
  type: TransactionType;
  timestamp: string;
}

export interface DashboardStats {
  totalItems: number;
  availableItems: number;
  checkedOutItems: number;
}