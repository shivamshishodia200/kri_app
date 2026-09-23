import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ServiceItem, ServiceBooking, RentPayment, SubscriptionPlan } from '../types/booking';
import { SERVICES_DATA, INITIAL_BOOKINGS, SUBSCRIPTION_PLANS } from '../mock/servicesData';

interface BookingContextType {
  services: ServiceItem[];
  bookings: ServiceBooking[];
  activeSubscription: SubscriptionPlan;
  rentPayments: RentPayment[];
  createBooking: (
    service: ServiceItem,
    date: string,
    timeSlot: string,
    address: string,
    city: string
  ) => Promise<ServiceBooking>;
  cancelBooking: (bookingId: string) => void;
  payRent: (
    propertyTitle: string,
    landlordName: string,
    landlordUpi: string,
    rentAmount: number,
    maintenanceAmount: number
  ) => Promise<RentPayment>;
  changeSubscription: (plan: SubscriptionPlan) => void;
}

const INITIAL_RENT_PAYMENTS: RentPayment[] = [
  {
    id: 'pay-801',
    propertyTitle: 'Luxury 3 BHK Penthouse Indiranagar',
    landlordName: 'Vikram Malhotra',
    landlordUpi: 'vikram.malhotra@okaxis',
    rentAmount: 68000,
    maintenanceAmount: 4500,
    convenienceFee: 149,
    totalPaid: 72649,
    paymentDate: '2026-09-05',
    monthYear: 'September 2026',
    transactionRef: 'UPI/260905118920/KIR24',
    status: 'success',
  },
  {
    id: 'pay-802',
    propertyTitle: 'Luxury 3 BHK Penthouse Indiranagar',
    landlordName: 'Vikram Malhotra',
    landlordUpi: 'vikram.malhotra@okaxis',
    rentAmount: 68000,
    maintenanceAmount: 4500,
    convenienceFee: 149,
    totalPaid: 72649,
    paymentDate: '2026-08-05',
    monthYear: 'August 2026',
    transactionRef: 'UPI/260805904812/KIR24',
    status: 'success',
  },
];

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services] = useState<ServiceItem[]>(SERVICES_DATA);
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]); // Gold Pro
  const [rentPayments, setRentPayments] = useState<RentPayment[]>(INITIAL_RENT_PAYMENTS);

  const createBooking = async (
    service: ServiceItem,
    date: string,
    timeSlot: string,
    address: string,
    city: string
  ): Promise<ServiceBooking> => {
    const fee = 99;
    const newBooking: ServiceBooking = {
      id: `bk-${Date.now()}`,
      serviceId: service.id,
      serviceTitle: service.title,
      category: service.category,
      scheduledDate: date,
      scheduledTimeSlot: timeSlot,
      address,
      city,
      amount: service.priceStartingAt,
      convenienceFee: fee,
      totalAmount: service.priceStartingAt + fee,
      status: 'scheduled',
      paymentStatus: 'mock_completed',
      bookedAt: new Date().toISOString(),
      assignedProfessional: {
        name: 'Sunil Kumar (Verified Pro)',
        phone: '+91 99881 22334',
        rating: 4.9,
      },
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  const payRent = async (
    propertyTitle: string,
    landlordName: string,
    landlordUpi: string,
    rentAmount: number,
    maintenanceAmount: number
  ): Promise<RentPayment> => {
    const fee = 149;
    const newPayment: RentPayment = {
      id: `pay-${Date.now()}`,
      propertyTitle,
      landlordName,
      landlordUpi,
      rentAmount,
      maintenanceAmount,
      convenienceFee: fee,
      totalPaid: rentAmount + maintenanceAmount + fee,
      paymentDate: new Date().toISOString().split('T')[0],
      monthYear: 'October 2026',
      transactionRef: `UPI/${Date.now().toString().slice(-8)}/KIR24`,
      status: 'success',
    };

    setRentPayments((prev) => [newPayment, ...prev]);
    return newPayment;
  };

  const changeSubscription = (plan: SubscriptionPlan) => {
    setActiveSubscription(plan);
  };

  return (
    <BookingContext.Provider
      value={{
        services,
        bookings,
        activeSubscription,
        rentPayments,
        createBooking,
        cancelBooking,
        payRent,
        changeSubscription,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
