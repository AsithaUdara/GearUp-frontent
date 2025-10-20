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
  Bell,
  Plus,
  Edit,
  Trash2,
  Send,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  XCircle
} from 'lucide-react';
import Header from '@/app/components/landing/Header';
import Footer from '@/app/components/landing/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ModificationRequest {
  id: string;
  serviceId: string;
  type: 'add_service' | 'remove_service' | 'change_service' | 'urgent_repair';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  estimatedDuration: number;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  technician?: string;
  notes?: string;
  attachments?: string[];
}

interface ServiceModification {
  id: string;
  serviceName: string;
  vehicleModel: string;
  vehicleYear: string;
  customerName: string;
  phone: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  currentStatus: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  originalServices: string[];
  currentServices: string[];
  totalCost: number;
  estimatedCompletion: string;
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
  modificationRequests: ModificationRequest[];
  lastUpdate: string;
}

const mockServiceModification: ServiceModification = {
  id: 'SRV-2024-001',
  serviceName: 'Full Service',
  vehicleModel: 'Toyota Camry',
  vehicleYear: '2020',
  customerName: 'John Doe',
  phone: '+94 77 123 4567',
  email: 'john.doe@email.com',
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00 AM',
  currentStatus: 'in-progress',
  originalServices: ['Oil Change', 'Brake Inspection', 'Engine Check'],
  currentServices: ['Oil Change', 'Brake Inspection', 'Engine Check', 'Brake Pad Replacement'],
  totalCost: 53000,
  estimatedCompletion: '3:00 PM',
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
  modificationRequests: [
    {
      id: 'MOD-001',
      serviceId: 'SRV-2024-001',
      type: 'add_service',
      title: 'Brake Pad Replacement',
      description: 'Customer requested brake pad replacement after inspection revealed 20% wear',
      priority: 'high',
      estimatedCost: 8500,
      estimatedDuration: 45,
      status: 'approved',
      requestedBy: 'John Doe',
      requestedAt: '2024-01-15 10:30 AM',
      approvedBy: 'Mike Johnson',
      approvedAt: '2024-01-15 10:35 AM',
      technician: 'Sarah Wilson',
      notes: 'Approved for safety reasons. Customer informed of additional cost.'
    },
    {
      id: 'MOD-002',
      serviceId: 'SRV-2024-001',
      type: 'add_service',
      title: 'Air Filter Replacement',
      description: 'Air filter is dirty and affecting engine performance',
      priority: 'medium',
      estimatedCost: 2500,
      estimatedDuration: 15,
      status: 'pending',
      requestedBy: 'John Doe',
      requestedAt: '2024-01-15 11:00 AM'
    }
  ],
  lastUpdate: '2024-01-15 11:00 AM'
};

export default function ServiceModification() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [serviceModification, setServiceModification] = useState<ServiceModification>(mockServiceModification);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'add_service' as const,
    title: '',
    description: '',
    priority: 'medium' as const,
    estimatedCost: 0,
    estimatedDuration: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleSubmitRequest = () => {
    const request: ModificationRequest = {
      id: `MOD-${Date.now()}`,
      serviceId: serviceModification.id,
      type: newRequest.type,
      title: newRequest.title,
      description: newRequest.description,
      priority: newRequest.priority,
      estimatedCost: newRequest.estimatedCost,
      estimatedDuration: newRequest.estimatedDuration,
      status: 'pending',
      requestedBy: user?.displayName || 'Customer',
      requestedAt: new Date().toLocaleString()
    };

    setServiceModification(prev => ({
      ...prev,
      modificationRequests: [...prev.modificationRequests, request]
    }));

    setNewRequest({
      type: 'add_service',
      title: '',
      description: '',
      priority: 'medium',
      estimatedCost: 0,
      estimatedDuration: 0
    });
    setShowNewRequest(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5" />;
      case 'rejected':
        return <XCircle className="h-5 w-5" />;
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 animate-spin" />;
      case 'completed':
        return <CheckSquare className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
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
      <Header onLoginClick={() => {}} />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold font-heading text-foreground mb-4">
              Service Modifications
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Request changes to your ongoing service. Add, remove, or modify services as needed.
            </p>
          </motion.div>

          {/* Service Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold font-heading text-foreground mb-2">
                  Service #{serviceModification.id}
                </h2>
                <p className="text-lg text-muted-foreground">{serviceModification.serviceName}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                  serviceModification.currentStatus === 'in-progress' ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  <Clock className="h-5 w-5" />
                  {serviceModification.currentStatus.toUpperCase()}
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
                  <p className="font-semibold">{serviceModification.vehicleModel} {serviceModification.vehicleYear}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Appointment</p>
                  <p className="font-semibold">{serviceModification.appointmentDate} at {serviceModification.appointmentTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="font-semibold">LKR {serviceModification.totalCost.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Completion</p>
                  <p className="font-semibold">{serviceModification.estimatedCompletion}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Services */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-8 mb-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-heading text-foreground">Current Services</h3>
                  <button
                    onClick={() => setShowNewRequest(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Request Modification
                  </button>
                </div>

                <div className="space-y-4">
                  {serviceModification.currentServices.map((service, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Wrench className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-semibold text-foreground">{service}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {serviceModification.originalServices.includes(service) ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">Original</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">Added</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Modification Requests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <h3 className="text-xl font-bold font-heading text-foreground mb-6">Modification Requests</h3>
                
                <div className="space-y-6">
                  {serviceModification.modificationRequests.map((request) => (
                    <div key={request.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{request.title}</h4>
                          <p className="text-sm text-muted-foreground">{request.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Cost</p>
                          <p className="font-semibold">LKR {request.estimatedCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-semibold">{request.estimatedDuration} minutes</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Requested</p>
                          <p className="font-semibold">{request.requestedAt}</p>
                        </div>
                      </div>

                      {request.approvedBy && (
                        <div className="p-3 bg-green-50 rounded-lg mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">Approved by {request.approvedBy}</span>
                          </div>
                          <p className="text-sm text-green-700">Approved at {request.approvedAt}</p>
                          {request.technician && (
                            <p className="text-sm text-green-700">Assigned to: {request.technician}</p>
                          )}
                        </div>
                      )}

                      {request.rejectionReason && (
                        <div className="p-3 bg-red-50 rounded-lg mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-800">Rejected</span>
                          </div>
                          <p className="text-sm text-red-700">Reason: {request.rejectionReason}</p>
                        </div>
                      )}

                      {request.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {request.notes}
                          </p>
                        </div>
                      )}
                    </div>
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
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-bold font-heading text-foreground mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{serviceModification.technician.name}</p>
                      <p className="text-sm text-muted-foreground">Lead Technician</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <a href={`tel:${serviceModification.technician.phone}`} className="text-primary hover:underline">
                      {serviceModification.technician.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{serviceModification.location.name}</p>
                      <p className="text-sm text-muted-foreground">{serviceModification.location.address}</p>
                      <p className="text-sm text-muted-foreground">{serviceModification.location.phone}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-bold font-heading text-foreground mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowNewRequest(true)}
                    className="w-full flex items-center gap-3 p-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Service</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/progress')}
                    className="w-full flex items-center gap-3 p-3 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="h-5 w-5" />
                    <span>View Progress</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/appointment')}
                    className="w-full flex items-center gap-3 p-3 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Book New Service</span>
                  </button>
                </div>
              </motion.div>

              {/* Service Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-bold font-heading text-foreground mb-4">Service Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service ID:</span>
                    <span className="font-semibold">{serviceModification.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-semibold">{serviceModification.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Services:</span>
                    <span className="font-semibold">{serviceModification.currentServices.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Requests:</span>
                    <span className="font-semibold">
                      {serviceModification.modificationRequests.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Update:</span>
                    <span className="font-semibold">{serviceModification.lastUpdate}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl"
            >
              <h3 className="text-2xl font-bold font-heading text-foreground mb-6">Request Service Modification</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Modification Type</label>
                  <select
                    value={newRequest.type}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="add_service">Add Service</option>
                    <option value="remove_service">Remove Service</option>
                    <option value="change_service">Change Service</option>
                    <option value="urgent_repair">Urgent Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Brief title for your request"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Detailed description of your modification request"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Priority</label>
                    <select
                      value={newRequest.priority}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Estimated Cost (LKR)</label>
                    <input
                      type="number"
                      value={newRequest.estimatedCost}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={newRequest.estimatedDuration}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-8">
                <button
                  onClick={() => setShowNewRequest(false)}
                  className="px-6 py-3 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}

