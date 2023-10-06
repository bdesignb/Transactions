export interface Transaction {
  id: number;
  userId: number;
  purchasedItem: string;
  category: string;
  date: any;
  amountSpent: number;
}

export enum Category {
  Accessories = 'Accessories',
  Clothing = 'Clothing',
  Electronics = 'Electronics',
  Sport = 'Sport'
}
