export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem extends Product {
  sugar: 'Σκέτος' | 'Μέτριος' | 'Γλυκός';
  notes?: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  arrivalTime: string;
  targetTimestamp: number;
  notes?: string;
  createdAt: number;
  status: 'pending_grace_period' | 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
}

export const PRODUCTS: Product[] = [
  { id: '1', name: 'Espresso', price: 1.50 },
  { id: '2', name: 'Freddo Espresso', price: 2.20 },
  { id: '3', name: 'Cappuccino', price: 2.00 },
  { id: '4', name: 'Freddo Cappuccino', price: 2.40 },
  { id: '5', name: 'Nescafe Frappe', price: 1.80 },
  { id: '6', name: 'Ελληνικός Καφές', price: 1.20 },
  { id: '7', name: 'Φίλτρου', price: 1.90 },
  { id: '8', name: 'Latte', price: 2.50 },
];

export const THEME = {
  brown: '#C2A382',
  matteBlack: '#1A1A1A',
  white: '#FFFFFF',
};

export const TEXT = {
  header: 'Παράγγειλε τον καφέ σου',
  category: 'Κατάλογος Καφέ',
  add: 'Προσθήκη',
  timeTitle: 'Σε πόση ώρα θα είστε εδώ;',
  notes: 'Σημειώσεις',
  total: 'Σύνολο:',
  cta: 'Ολοκλήρωση Παραγγελίας',
  selectionTitle: 'Επιλέξτε ζάχαρη:',
  sugarOptions: ['Σκέτος', 'Μέτριος', 'Γλυκός'] as const,
  submit: 'Υποβολή',
  dashboard: 'Νέες Παραγγελίες',
  location: 'Σολομός Κορινθίας, 20150',
  phone: '2741031370',
  businessName: 'AVIN - ΞΥΛΟΥΡΗΣ ΚΑΥΣΙΜΑ Ο.Ε.'
};
