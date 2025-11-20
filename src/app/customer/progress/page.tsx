'use client';
import { useState, useEffect } from 'react';
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
  FileText,
  Camera,
  MessageSquare,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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
  type: 'photo' | 'document' | 'note';
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

interface ServiceMessage {
  id: string;
  sender: 'customer' | 'employee' | 'system';
  message: string;
  timestamp: string;
  senderName: string;
  isRead: boolean;
}

interface PaymentInfo {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  paidAt?: string;
  receiptUrl?: string;
}

interface ServiceRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost: number;
  estimatedDuration: number;
  basedOnHistory: boolean;
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
  payment: PaymentInfo;
  recommendations: ServiceRecommendation[];
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
      type: 'photo',
      name: 'Before Service - Engine Bay',
      url: '/service-photos/engine-before.jpg',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-15 10:05 AM',
      description: 'Engine bay condition before service'
    },
    {
      id: '2',
      type: 'document',
      name: 'Service Checklist',
      url: '/documents/service-checklist.pdf',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-15 10:12 AM',
      description: 'Completed service checklist'
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
  payment: {
    status: 'paid',
    amount: 45000,
    currency: 'LKR',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-2024-001',
    paidAt: '2024-01-15 09:45 AM',
    receiptUrl: '/receipts/SRV-2024-001.pdf'
  },
  recommendations: [
    {
      id: '1',
      title: 'Brake Pad Replacement',
      description: 'Your brake pads are at 20% wear. We recommend replacement for safety.',
      priority: 'high',
      estimatedCost: 8500,
      estimatedDuration: 30,
      basedOnHistory: true
    },
    {
      id: '2',
      title: 'Air Filter Replacement',
      description: 'Air filter is dirty and affecting engine performance.',
      priority: 'medium',
      estimatedCost: 2500,
      estimatedDuration: 15,
      basedOnHistory: false
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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [serviceProgress, setServiceProgress] = useState<ServiceProgress>(mockServiceProgress);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      message: 'Vehicle inspection completed successfully',
      time: '10:12 AM',
      type: 'success'
    },
    {
      id: '2',
      message: 'Oil change completed, moving to brake service',
      time: '10:33 AM',
      type: 'info'
    },
    {
      id: '3',
      message: 'Brake service in progress - estimated completion in 30 minutes',
      time: '10:35 AM',
      type: 'info'
    }
  ]);
  // Add floating chat toggle button at bottom right
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
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

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'delayed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold font-heading text-foreground">Live Updates</h3>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {notification.type === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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

              {/* Payment Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-bold font-heading text-foreground mb-4">Payment Status</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-semibold ${
                      serviceProgress.payment.status === 'paid' ? 'text-green-600' : 
                      serviceProgress.payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {serviceProgress.payment.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">{serviceProgress.payment.currency} {serviceProgress.payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-semibold">{serviceProgress.payment.paymentMethod}</span>
                  </div>
                  {serviceProgress.payment.receiptUrl && (
                    <button className="w-full mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                      Download Receipt
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Additional Features Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Service Documentation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold font-heading text-foreground">Service Documentation</h3>
                <button
                  onClick={() => setShowDocuments(!showDocuments)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <FileText className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {serviceProgress.documents.map((doc) => (
                  <div key={doc.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {doc.type === 'photo' ? <Camera className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        <p className="text-xs text-muted-foreground">Uploaded by {doc.uploadedBy} at {doc.uploadedAt}</p>
                      </div>
                      <button className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

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

              <div className="space-y-4 max-h-80 overflow-y-auto">
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

              <div className="mt-4 flex gap-2">
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
      </div>
    </div>
  );
}
