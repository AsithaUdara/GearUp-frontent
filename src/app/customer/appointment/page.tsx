'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, Car, CheckCircle, AlertCircle, Loader2, ArrowLeft, Check, Mail, MessageSquare } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  getServices, 
  getAvailableTimeSlots, 
  createAppointment, 
  checkBackendHealth,
  type Service,
  type TimeSlot,
  type AppointmentData
} from '@/services/appointmentService';

// Updated interfaces to match backend Service entity
interface BookingForm {
  serviceId: number;        // Changed from service string to serviceId number
  date: string;
  startTime: string;        // Changed from timeSlot to startTime
  customerName: string;
  phone: string;
  email: string;
  vehicleModel: string;
  vehicleYear: string;
  specialRequests: string;
}

export default function AppointmentBooking() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    serviceId: 0,
    date: '',
    startTime: '',
    customerName: user?.displayName || '',
    phone: '',
    email: user?.email || '',
    vehicleModel: '',
    vehicleYear: '',
    specialRequests: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  
  // Backend data states
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setBookingForm(prev => ({
        ...prev,
        customerName: user.displayName || prev.customerName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  
   useEffect(() => {
     if (!authLoading && !user) {
       router.push('/customer/appointment');
     }
  }, [user, authLoading, router]);

  // Check backend connection and load initial data
  useEffect(() => {
    const initializeData = async () => {
      // Allow loading services without authentication for testing
       if (!user) return;
      
      setLoading(true);
      setError(null);

      try {
        // Check backend health
        const healthCheck = await checkBackendHealth();
        setBackendConnected(healthCheck);

        if (!healthCheck) {
          setError('Unable to connect to the appointment service. Please try again later.');
          return;
        }

        // Load services
        const servicesResponse = await getServices();
        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data);
        } else {
          setError(servicesResponse.error || 'Failed to load services');
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('An unexpected error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  // Load time slots when date is selected
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (selectedDate && selectedService && backendConnected) {
        try {
          const timeSlotsResponse = await getAvailableTimeSlots(selectedDate, selectedService.id);
          if (timeSlotsResponse.success && timeSlotsResponse.data) {
            // Use backend time slots directly
            setTimeSlots(timeSlotsResponse.data);
          } else {
            setError(timeSlotsResponse.error || 'Failed to load time slots');
            setTimeSlots([]);
          }
        } catch (error) {
          console.error('Error loading time slots:', error);
          setError('Failed to load available time slots');
          setTimeSlots([]);
        }
      }
    };

    loadTimeSlots();
  }, [selectedDate, selectedService, backendConnected]);

  const getTimeSlotCategory = (startTime: string): string => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingForm(prev => ({ ...prev, serviceId: service.id }));
    setSelectedDate(''); // Reset date when service changes
    setSelectedTimeSlot(null); // Reset time slot when service changes
    setTimeSlots([]); // Clear time slots
    setCurrentStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingForm(prev => ({ ...prev, date }));
    setSelectedTimeSlot(null); // Reset time slot when date changes
    setCurrentStep(3);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setBookingForm(prev => ({ ...prev, startTime: timeSlot.startTime }));
    setCurrentStep(4);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For testing, allow submission even without user authentication
    if (!selectedService || !selectedTimeSlot) {
      setError('Missing required information');
      return;
    }

    setIsBooking(true);
    setError(null);
    
    try {
      const appointmentData: AppointmentData = {
        serviceId: selectedService.id,
        timeSlotId: selectedTimeSlot.id,
        userId: user?.uid || 'test-user-001',
        customerName: bookingForm.customerName || 'Test User',
        customerEmail: bookingForm.email || 'test@example.com',
        customerPhone: bookingForm.phone,
        notes: bookingForm.specialRequests || undefined
      };

      const response = await createAppointment(appointmentData);
      
      if (response.success && response.data) {
        setCreatedBooking(response.data);
        setBookingSuccess(true);
      } else {
        setError(response.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTimeSlot(null);
    setBookingForm({
      serviceId: 0,
      date: '',
      startTime: '',
      customerName: user?.displayName || '',
      phone: '',
      email: user?.email || '',
      vehicleModel: '',
      vehicleYear: '',
      specialRequests: ''
    });
    setBookingSuccess(false);
    setCreatedBooking(null);
    setError(null);
  };

  
   if (loading) {
     return (
       <div className="flex items-center justify-center h-screen">
         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
       </div>
     );
   }

   if (!user) {
     return null;
   }

  // Show error state if backend is not connected
  if (!backendConnected && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
              <h1 className="text-4xl font-bold font-heading text-foreground mb-4">
                Service Temporarily Unavailable
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {error || 'We are unable to connect to our appointment service. Please try again later.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-primary text-white font-heading font-bold uppercase rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="mb-8">
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
                <h1 className="text-4xl font-bold font-heading text-foreground mb-4">
                  Booking Confirmed!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your appointment has been successfully booked. You will receive a confirmation email shortly.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold font-heading text-foreground mb-6">Booking Details</h2>
                <div className="space-y-4 text-left">
                  <div className="flex justify-between">
                    <span className="font-semibold">Service:</span>
                    <span>{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Date:</span>
                    <span>{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Time:</span>
                    <span>{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Duration:</span>
                    <span>{selectedService?.durationMinutes} minutes</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/customer/dashboard')}
                  className="px-8 py-3 bg-primary text-white font-heading font-bold uppercase rounded-md hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    setBookingSuccess(false);
                    setCurrentStep(1);
                    setSelectedService(null);
                    setSelectedDate('');
                    setSelectedTimeSlot(null);
                  }}
                  className="px-8 py-3 border border-primary text-primary font-heading font-bold uppercase rounded-md hover:bg-primary/5 transition-colors"
                >
                  Book Another
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mx-6 mt-24" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        </div>
      )}
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold font-heading text-foreground mb-4">
              Book Your Service
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Schedule your vehicle service with our expert technicians. Choose your preferred time slot and we'll take care of the rest.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center space-x-8">
              {[
                { step: 1, title: 'Select Service', icon: Car },
                { step: 2, title: 'Choose Date', icon: Calendar },
                { step: 3, title: 'Pick Time', icon: Clock },
                { step: 4, title: 'Confirm Details', icon: User }
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-primary border-primary text-white' 
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="font-heading font-semibold text-sm">Step {step}</p>
                    <p className="text-xs text-muted-foreground">{title}</p>
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      currentStep > step ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-lg shadow-lg p-6 border border-border hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-bold font-heading text-foreground mb-2">
                          {service.name}
                        </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {service.description}
                      </p>
                      <div className="flex justify-end items-center">
                        <span className="text-sm text-muted-foreground">
                          {service.durationMinutes} min
                        </span>
                      </div>
                    </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Step 2: Date Selection */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <h2 className="text-2xl font-bold font-heading text-foreground mb-6 text-center">
                    Select Your Preferred Date
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getAvailableDates().map((date) => (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                      >
                        <div className="text-sm text-muted-foreground">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(date).getDate()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Time Slot Selection */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <h2 className="text-2xl font-bold font-heading text-foreground mb-6 text-center">
                    Choose Your Time Slot
                  </h2>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => slot.isAvailable && handleTimeSlotSelect(slot)}
                        disabled={!slot.isAvailable}
                        className={`p-4 rounded-lg border transition-all ${
                          slot.isAvailable
                            ? 'border-border hover:border-primary hover:bg-primary/5 cursor-pointer'
                            : 'border-muted-foreground bg-muted-foreground/10 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-semibold">{slot.startTime}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {slot.isAvailable ? 'Available' : 'Booked'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Booking Form */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                  <h2 className="text-2xl font-bold font-heading text-foreground mb-6 text-center">
                    Confirm Your Booking
                  </h2>
                  
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={bookingForm.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          className="w-full p-3 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={bookingForm.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full p-3 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={bookingForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full p-3 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Vehicle Model *
                        </label>
                        <input
                          type="text"
                          value={bookingForm.vehicleModel}
                          onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                          className="w-full p-3 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Vehicle Year *
                        </label>
                        <input
                          type="text"
                          value={bookingForm.vehicleYear}
                          onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                          className="w-full p-3 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={bookingForm.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Any specific requirements or notes for our technicians..."
                      />
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold font-heading text-foreground mb-4">Booking Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="font-semibold">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span className="font-semibold">{selectedTimeSlot?.startTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Duration:</span>
                          <span className="font-semibold">{selectedService?.durationMinutes} minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-8 py-3 border border-primary text-primary font-heading font-bold uppercase rounded-md hover:bg-primary/5 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isBooking}
                        className="px-8 py-3 bg-primary text-white font-heading font-bold uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBooking ? 'Processing...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
