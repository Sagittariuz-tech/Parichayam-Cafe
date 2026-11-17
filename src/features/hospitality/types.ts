export interface OrderReceipt {
  id: string;
  dish: string;
  table_number: number;
  quantity: number;
  status: 'queued' | 'preparing' | 'served' | 'cancelled';
}

export interface ReservationReceipt {
  id: string;
  starts_at: number;
  party_size: number;
  status: 'pending' | 'confirmed' | 'declined';
  table_number: number | null;
}

export interface StaffOrder extends OrderReceipt {
  note: string;
  unit_price: number;
  starting_price: number;
  created_at: string;
}

export interface StaffReservation extends ReservationReceipt {
  guest_name: string;
  phone: string;
  note: string;
}

export interface StaffQueue {
  orders: StaffOrder[];
  reservations: StaffReservation[];
}
