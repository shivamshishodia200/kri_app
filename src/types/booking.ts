export type ServiceCategory = 
  | 'Packers & Movers'
  | 'Deep Cleaning'
  | 'Home Painting'
  | 'Rent Agreement & Legal'
  | 'Electrician & Plumber'
  | 'Pest Control'
  | 'Home Inspection';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  title: string;
  description: string;
  priceStartingAt: number;
  duration: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  features: string[];
}

export type BookingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  category: ServiceCategory;
  scheduledDate: string;
  scheduledTimeSlot: string;
  address: string;
  city: string;
  amount: number;
  convenienceFee: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: 'paid' | 'pending' | 'mock_completed';
  bookedAt: string;
  assignedProfessional?: {
    name: string;
    phone: string;
    rating: number;
  };
}

export interface RentPayment {
  id: string;
  propertyTitle: string;
  landlordName: string;
  landlordUpi: string;
  rentAmount: number;
  maintenanceAmount: number;
  convenienceFee: number;
  totalPaid: number;
  paymentDate: string;
  monthYear: string;
  transactionRef: string;
  status: 'success' | 'processing' | 'failed';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annually';
  listingLimit: number;
  isPopular?: boolean;
  features: string[];
}
