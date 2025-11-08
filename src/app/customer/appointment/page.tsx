'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, Car, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/app/components/landing/Header';
import Footer from '@/app/components/landing/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getAvailableTimeSlotsForCustomer, getAllServices, ServiceDTO, TimeSlotDTO } from '@/app/services/appointmentService';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  serviceType: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

interface BookingForm {
  service: string;
  date: string;
  timeSlot: string;
  customerName: string;
  phone: string;
  email: string;
  vehicleModel: string;
  vehicleYear: string;
  specialRequests: string;
}

const services: Service[] = [
  {
    id: '1',
    name: 'Oil Change & Filter',
    duration: 30,
    price: 15000,
    description: 'Complete oil change with premium filter replacement'
  },
  {
    id: '2',
    name: 'Full Service',
    duration: 120,
    price: 45000,
    description: 'Comprehensive vehicle inspection and maintenance'
  },
  {
    id: '3',
    name: 'Brake Service',
    duration: 90,
    price: 35000,
    description: 'Brake pad replacement and brake fluid check'
  },
  {
    id: '4',
    name: 'Engine Diagnostic',
    duration: 60,
    price: 25000,
    description: 'Complete engine health check and diagnostics'
  },
  {
    id: '5',
    name: 'Tire Service',
    duration: 45,
    price: 20000,
    description: 'Tire rotation, balancing, and alignment check'
  },
  {
    id: '6',
    name: 'AC Service',
    duration: 75,
    price: 30000,
    description: 'Air conditioning system cleaning and gas refill'
  }
];

// Removed mock timeSlots - will be fetched from API based on selected service and date

export default function AppointmentBooking() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotDTO[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    service: '',
    date: '',
    timeSlot: '',
    customerName: user?.displayName || '',
    phone: '',
    email: user?.email || '',
    vehicleModel: '',
    vehicleYear: '',
    specialRequests: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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

  // Fetch available time slots when service and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (selectedService && selectedDate) {
        setLoadingSlots(true);
        try {
          const slots = await getAvailableTimeSlotsForCustomer(selectedDate, Number(selectedService.id));
          setAvailableTimeSlots(slots);
        } catch (error) {
          console.error('Error fetching time slots:', error);
          setAvailableTimeSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      }
    };

    fetchTimeSlots();
  }, [selectedService, selectedDate]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingForm(prev => ({ ...prev, service: service.id }));
    setCurrentStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingForm(prev => ({ ...prev, date }));
    setCurrentStep(3);
  };

  const handleTimeSlotSelect = (timeSlotId: number, timeString: string) => {
    setSelectedTimeSlot(timeString);
    setBookingForm(prev => ({ ...prev, timeSlot: timeString }));
    setCurrentStep(4);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsBooking(false);
    setBookingSuccess(true);
  };

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
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

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLoginClick={() => {}} showDefaultActions={false} preserveActionSpace={true} />
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
                    <span>{selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Duration:</span>
                    <span>{selectedService?.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Price:</span>
                    <span className="text-primary font-bold">LKR {selectedService?.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
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
                    setSelectedTimeSlot('');
                  }}
                  className="px-8 py-3 border border-primary text-primary font-heading font-bold uppercase rounded-md hover:bg-primary/5 transition-colors"
                >
                  Book Another
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={() => {}} showDefaultActions={false} preserveActionSpace={true} />
      
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
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-primary">
                            LKR {service.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {service.duration} min
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
                  
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading available time slots...</p>
                    </div>
                  ) : availableTimeSlots.length === 0 ? (
                    <div className="text-center py-8 bg-muted/20 rounded-lg">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">No available time slots for this date</p>
                      <p className="text-sm text-muted-foreground mt-2">Please select a different date</p>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        Choose Another Date
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {availableTimeSlots.map((slot) => {
                        const formatTime = (time: string) => {
                          const [hours, minutes] = time.split(':');
                          const h = parseInt(hours);
                          const ampm = h >= 12 ? 'PM' : 'AM';
                          const hour12 = h % 12 || 12;
                          return `${hour12}:${minutes} ${ampm}`;
                        };

                        return (
                          <button
                            key={slot.id}
                            onClick={() => handleTimeSlotSelect(slot.id, `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`)}
                            className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                          >
                            <div className="text-center">
                              <div className="text-sm font-semibold">{formatTime(slot.startTime)}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTime(slot.endTime)}
                              </div>
                              <div className="text-xs text-green-600 mt-1 font-medium">
                                Available
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
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
                          <span className="font-semibold">{selectedTimeSlot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Duration:</span>
                          <span className="font-semibold">{selectedService?.duration} minutes</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-primary">
                          <span>Total:</span>
                          <span>LKR {selectedService?.price.toLocaleString()}</span>
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
      
      <Footer />
    </div>
  );
}
