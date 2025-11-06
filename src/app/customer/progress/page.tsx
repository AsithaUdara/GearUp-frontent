'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Car, 
  Wrench, 
  User, 
  Phone, 
  MapPin,
  Calendar,
  Timer,
  Camera,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import Header from '@/app/components/landing/Header';
import Footer from '@/app/components/landing/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getServiceProgress } from '@/lib/trackingApi';

interface ServiceStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  estimatedDuration: number;
  actualDuration?: number;
  startTime?: string;
  endTime?: string;
  technician?: string;
  notes?: string;
  images?: string[];
  documents?: string[];
  qualityCheckPassed?: boolean;
  qualityCheckNotes?: string;
}

interface ServiceDocument {
  id: string;
  type: 'part' | 'labor' | 'additional';
  name: string;
  quantity: number;
  unitPrice: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  addedBy: string;
  addedAt: string;
}

interface ServiceMessage {
  id: string;
  sender: 'customer' | 'employee' | 'system';
  message: string;
  timestamp: string;
  senderName: string;
  isRead: boolean;
}


interface ServiceProgress {
  id: string;
  serviceName: string;
  vehicleModel: string;
  vehicleYear: string;
  customerName: string;
  phone: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  estimatedCompletion: string;
  currentStep: number;
  totalSteps: number;
  overallStatus: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  steps: ServiceStep[];
  technician: {
    name: string;
    phone: string;
    photo: string;
  };
  location: {
    name: string;
    address: string;
    phone: string;
  };
  lastUpdate: string;
  documents: ServiceDocument[];
  messages: ServiceMessage[];
  serviceHistory: {
    id: string;
    serviceName: string;
    date: string;
    status: string;
    cost: number;
  }[];
}

const mockServiceProgress: ServiceProgress = {
  id: 'SRV-2024-001',
  serviceName: 'Full Service',
  vehicleModel: 'Toyota Camry',
  vehicleYear: '2020',
  customerName: 'John Doe',
  phone: '+94 77 123 4567',
  email: 'john.doe@email.com',
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00 AM',
  estimatedCompletion: '2:30 PM',
  currentStep: 3,
  totalSteps: 6,
  overallStatus: 'in-progress',
  steps: [
    {
      id: '1',
      name: 'Vehicle Inspection',
      status: 'completed',
      estimatedDuration: 15,
      actualDuration: 12,
      startTime: '10:00 AM',
      endTime: '10:12 AM',
      technician: 'Mike Johnson',
      notes: 'Vehicle in good condition, minor wear on brake pads',
      qualityCheckPassed: true,
      qualityCheckNotes: 'All systems checked and functioning properly'
    },
    {
      id: '2',
      name: 'Oil Change',
      status: 'completed',
      estimatedDuration: 20,
      actualDuration: 18,
      startTime: '10:15 AM',
      endTime: '10:33 AM',
      technician: 'Mike Johnson',
      notes: 'Used premium synthetic oil, filter replaced',
      qualityCheckPassed: true,
      qualityCheckNotes: 'Oil level and quality verified'
    },
    {
      id: '3',
      name: 'Brake Service',
      status: 'in-progress',
      estimatedDuration: 45,
      startTime: '10:35 AM',
      technician: 'Sarah Wilson',
      notes: 'Replacing front brake pads, checking brake fluid'
    },
    {
      id: '4',
      name: 'Engine Diagnostic',
      status: 'pending',
      estimatedDuration: 30,
      technician: 'Mike Johnson'
    },
    {
      id: '5',
      name: 'Tire Service',
      status: 'pending',
      estimatedDuration: 25,
      technician: 'Sarah Wilson'
    },
    {
      id: '6',
      name: 'Final Inspection & Cleaning',
      status: 'pending',
      estimatedDuration: 20,
      technician: 'Mike Johnson'
    }
  ],
  technician: {
    name: 'Mike Johnson',
    phone: '+94 77 987 6543',
    photo: '/team-workshop.jpg'
  },
  location: {
    name: 'GearUp Service Center - Colombo',
    address: '123 Galle Road, Colombo 03',
    phone: '+94 11 234 5678'
  },
  lastUpdate: '2024-01-15 10:35 AM',
  documents: [
    {
      id: '1',
      type: 'part',
      name: 'Oil Filter',
      quantity: 1,
      unitPrice: 2500,
      description: 'Premium oil filter replacement',
      status: 'approved',
      addedBy: 'Mike Johnson',
      addedAt: '2024-01-15 10:05 AM'
    },
    {
      id: '2',
      type: 'part',
      name: 'Engine Oil (4L)',
      quantity: 1,
      unitPrice: 12500,
      description: 'Synthetic engine oil',
      status: 'approved',
      addedBy: 'Mike Johnson',
      addedAt: '2024-01-15 10:05 AM'
    },
    {
      id: '3',
      type: 'labor',
      name: 'Oil Change Service',
      quantity: 1,
      unitPrice: 5000,
      description: 'Labor charge for oil change service',
      status: 'approved',
      addedBy: 'Mike Johnson',
      addedAt: '2024-01-15 10:05 AM'
    },
    {
      id: '4',
      type: 'additional',
      name: 'Brake Pad Set',
      quantity: 1,
      unitPrice: 8500,
      description: 'Front brake pad replacement (recommended)',
      status: 'pending',
      addedBy: 'Sarah Wilson',
      addedAt: '2024-01-15 10:35 AM'
    }
  ],
  messages: [
    {
      id: '1',
      sender: 'employee',
      message: 'Good morning! We\'ve started the service on your Toyota Camry. Initial inspection shows everything looks good.',
      timestamp: '2024-01-15 10:05 AM',
      senderName: 'Mike Johnson',
      isRead: true
    },
    {
      id: '2',
      sender: 'system',
      message: 'Oil change completed successfully. Moving to brake service.',
      timestamp: '2024-01-15 10:33 AM',
      senderName: 'System',
      isRead: true
    },
    {
      id: '3',
      sender: 'employee',
      message: 'We found some wear on your brake pads. Would you like us to replace them? The cost would be LKR 8,500.',
      timestamp: '2024-01-15 10:40 AM',
      senderName: 'Sarah Wilson',
      isRead: false
    }
  ],
  serviceHistory: [
    {
      id: 'SRV-2023-045',
      serviceName: 'Oil Change',
      date: '2023-10-15',
      status: 'completed',
      cost: 15000
    },
    {
      id: 'SRV-2023-032',
      serviceName: 'Brake Inspection',
      date: '2023-07-20',
      status: 'completed',
      cost: 5000
    },
    {
      id: 'SRV-2023-018',
      serviceName: 'Full Service',
      date: '2023-04-10',
      status: 'completed',
      cost: 45000
    }
  ]
};

export default function ServiceProgress() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <ServiceProgressContent />
    </Suspense>
  );
}

function ServiceProgressContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId') || 'SRV-2024-001'; // Default for demo, should come from URL or user's active service
  
  const [serviceProgress, setServiceProgress] = useState<ServiceProgress>(mockServiceProgress);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Add floating chat toggle button at bottom right
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch service progress from backend
  useEffect(() => {
    if (!user || !serviceId) return;
    
    const fetchProgress = async () => {
      try {
        setIsRefreshing(true);
        setError(null);
        const progressData = await getServiceProgress(serviceId, user as { getIdToken?: () => Promise<string> } | null);
        
        // Map backend ProgressResponse to frontend ServiceProgress
        const mappedProgress: ServiceProgress = {
          id: progressData.serviceId,
          serviceName: 'Service', // This might need to come from another endpoint
          vehicleModel: progressData.vehicleModel,
          vehicleYear: progressData.vehicleYear,
          customerName: progressData.customerName,
          phone: progressData.customerPhone || '',
          email: progressData.customerEmail || '',
          appointmentDate: progressData.appointmentDate || '',
          appointmentTime: progressData.appointmentTime || '',
          estimatedCompletion: progressData.estimatedCompletion || '',
          currentStep: progressData.currentStep || 0,
          totalSteps: progressData.totalSteps || 6,
          overallStatus: progressData.overallStatus === 'in_progress' ? 'in-progress' : 
                         progressData.overallStatus === 'completed' ? 'completed' :
                         progressData.overallStatus === 'delayed' ? 'delayed' : 'scheduled',
          steps: [], // Steps might need to come from a different endpoint
          technician: {
            name: progressData.technicianName || 'Technician',
            phone: '', // Might need to fetch from user service
            photo: '/team-workshop.jpg'
          },
          location: {
            name: progressData.locationName || 'GearUp Service Center',
            address: '', // Might need to fetch from config
            phone: ''
          },
          lastUpdate: progressData.lastUpdate || new Date().toISOString(),
          documents: [], // Documents might need to come from a different endpoint
          messages: [], // Messages might need to come from a different endpoint
          serviceHistory: [] // Service history might need to come from a different endpoint
        };
        
        setServiceProgress(mappedProgress);
      } catch (err) {
        console.error('Failed to fetch service progress:', err);
        setError('Failed to load service progress. Please try again later.');
        // Keep mock data as fallback for now
      } finally {
        setIsRefreshing(false);
      }
    };
    
    fetchProgress();
  }, [user, serviceId]);

  const handleRefresh = async () => {
    if (!user || !serviceId) return;
    
    setIsRefreshing(true);
    try {
      const progressData = await getServiceProgress(serviceId, user as { getIdToken?: () => Promise<string> } | null);
      
      // Map backend ProgressResponse to frontend ServiceProgress (same as above)
      const mappedProgress: ServiceProgress = {
        id: progressData.serviceId,
        serviceName: 'Service',
        vehicleModel: progressData.vehicleModel,
        vehicleYear: progressData.vehicleYear,
        customerName: progressData.customerName,
        phone: progressData.customerPhone || '',
        email: progressData.customerEmail || '',
        appointmentDate: progressData.appointmentDate || '',
        appointmentTime: progressData.appointmentTime || '',
        estimatedCompletion: progressData.estimatedCompletion || '',
        currentStep: progressData.currentStep || 0,
        totalSteps: progressData.totalSteps || 6,
        overallStatus: progressData.overallStatus === 'in_progress' ? 'in-progress' : 
                       progressData.overallStatus === 'completed' ? 'completed' :
                       progressData.overallStatus === 'delayed' ? 'delayed' : 'scheduled',
        steps: [],
        technician: {
          name: progressData.technicianName || 'Technician',
          phone: '',
          photo: '/team-workshop.jpg'
        },
        location: {
          name: progressData.locationName || 'GearUp Service Center',
          address: '',
          phone: ''
        },
        lastUpdate: progressData.lastUpdate || new Date().toISOString(),
        documents: [],
        messages: [],
        serviceHistory: []
      };
      
      setServiceProgress(mappedProgress);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh service progress:', err);
      setError('Failed to refresh service progress. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'delayed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'in-progress':
        return <RefreshCw className="h-5 w-5 animate-spin" />;
      case 'delayed':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
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
              Service Progress
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track your vehicle service in real-time. Get live updates on every step of the process.
            </p>
          </motion.div>

          {/* Service Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold font-heading text-foreground mb-2">
                  Service #{serviceProgress.id}
                </h2>
                <p className="text-lg text-muted-foreground">{serviceProgress.serviceName}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getStatusColor(serviceProgress.overallStatus)}`}>
                  {getStatusIcon(serviceProgress.overallStatus)}
                  {serviceProgress.overallStatus.replace('-', ' ').toUpperCase()}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mt-2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-semibold">{serviceProgress.vehicleModel} {serviceProgress.vehicleYear}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Appointment</p>
                  <p className="font-semibold">{serviceProgress.appointmentDate} at {serviceProgress.appointmentTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Completion</p>
                  <p className="font-semibold">{serviceProgress.estimatedCompletion}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Technician</p>
                  <p className="font-semibold">{serviceProgress.technician.name}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Steps */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-heading text-foreground">Service Steps</h3>
                  <div className="text-sm text-muted-foreground">
                    Step {serviceProgress.currentStep} of {serviceProgress.totalSteps}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>{Math.round((serviceProgress.currentStep / serviceProgress.totalSteps) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-primary h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(serviceProgress.currentStep / serviceProgress.totalSteps) * 100}%` }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                  {serviceProgress.steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        step.status === 'completed' 
                          ? 'border-green-200 bg-green-50' 
                          : step.status === 'in-progress'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getStatusColor(step.status)}`}>
                            {getStatusIcon(step.status)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{step.name}</h4>
                            {step.technician && (
                              <p className="text-sm text-muted-foreground">Technician: {step.technician}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {step.startTime && (
                            <p className="text-sm text-muted-foreground">Started: {step.startTime}</p>
                          )}
                          {step.endTime && (
                            <p className="text-sm text-muted-foreground">Completed: {step.endTime}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Duration: {step.actualDuration || step.estimatedDuration} min
                          </p>
                        </div>
                      </div>
                      
                      {step.notes && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <p className="text-sm text-muted-foreground">{step.notes}</p>
                        </div>
                      )}

                      {step.qualityCheckPassed !== undefined && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1 rounded-full ${step.qualityCheckPassed ? 'bg-green-100' : 'bg-red-100'}`}>
                              {step.qualityCheckPassed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <span className="text-sm font-semibold">
                              Quality Check: {step.qualityCheckPassed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          {step.qualityCheckNotes && (
                            <p className="text-sm text-muted-foreground">{step.qualityCheckNotes}</p>
                          )}
                        </div>
                      )}

                      {step.images && step.images.length > 0 && (
                        <div className="mt-3">
                          <div className="flex gap-2">
                            {step.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Camera className="h-6 w-6 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-bold font-heading text-foreground mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{serviceProgress.technician.name}</p>
                      <p className="text-sm text-muted-foreground">Lead Technician</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <a href={`tel:${serviceProgress.technician.phone}`} className="text-primary hover:underline">
                      {serviceProgress.technician.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{serviceProgress.location.name}</p>
                      <p className="text-sm text-muted-foreground">{serviceProgress.location.address}</p>
                      <p className="text-sm text-muted-foreground">{serviceProgress.location.phone}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Service Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-bold font-heading text-foreground mb-4">Service Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service ID:</span>
                    <span className="font-semibold">{serviceProgress.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-semibold">{serviceProgress.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Update:</span>
                    <span className="font-semibold">{serviceProgress.lastUpdate}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={() => router.push('/customer/modification')}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Wrench className="h-5 w-5" />
                      Request Modifications
                    </button>
                  </div>
                </div>
              </motion.div>


            </div>
          </div>

          {/* Additional Features Section */}
          <div className="grid grid-cols-1 gap-8 mt-8">

            {/* Customer Communication */}
            {/* The always-visible Messages card is removed as per request. */}

          </div>

          {/* Service History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-lg shadow-lg p-8 mt-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-heading text-foreground">Service History</h3>
              <button
                onClick={() => setShowServiceHistory(!showServiceHistory)}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Car className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Show each service history as: service name, date, vehicle model, and vehicle year. */}
              {serviceProgress.serviceHistory.map((history) => (
                <div key={history.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h4 className="font-semibold text-foreground">{history.serviceName}</h4>
                      <p className="text-sm text-muted-foreground">{history.date}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="text-sm text-foreground">{serviceProgress.vehicleModel} {serviceProgress.vehicleYear}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Floating Chat Icon */}
      <button
        onClick={() => setChatOpen(true)}
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }}
        className="shadow-lg rounded-full bg-primary text-white p-4 hover:bg-primary/90 transition-colors flex items-center justify-center"
        aria-label="Open Chat"
      >
        <MessageSquare className="h-7 w-7" />
      </button>

      {/* Chat Modal Popup */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 right-8 z-50 w-full max-w-md"
            style={{ maxWidth: '360px' }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col h-96 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold font-heading text-foreground">Messages</h3>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span className="sr-only">Close Chat</span>
                  ×
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                {serviceProgress.messages.map((message) => (
                  <div key={message.id} className={`p-4 rounded-lg ${
                    message.sender === 'customer' ? 'bg-blue-50 ml-8' : 
                    message.sender === 'employee' ? 'bg-gray-50 mr-8' : 'bg-yellow-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">{message.senderName}</span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground">{message.message}</p>
                    {!message.isRead && message.sender !== 'customer' && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
