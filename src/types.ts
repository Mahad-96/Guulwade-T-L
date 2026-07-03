export type Role = 'Super Admin' | 'Admin' | 'Staff' | 'Customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export type ShippingMethod = 'Air' | 'Sea' | 'Road';
export type ShippingSpeed = 'Express' | 'Regular';
export type ShipmentStatus = 'Ordered' | 'Picked Up' | 'Warehouse' | 'In Transit' | 'Customs' | 'Out for Delivery' | 'Delivered';

export interface ShipmentHistory {
  status: ShipmentStatus;
  timestamp: string;
  location: string;
  description: string;
}

export interface Shipment {
  id: string; // e.g. GTL-2026-000154
  bookingId?: string;
  senderName: string;
  receiverName: string;
  senderAddress: string;
  receiverAddress: string;
  weight: number; // in kg
  dimensions: string; // e.g. 50x40x30 cm
  shippingMethod: ShippingMethod;
  shippingSpeed: ShippingSpeed;
  estimatedDelivery: string;
  currentStatus: ShipmentStatus;
  currentLocation: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleType: string;
  history: ShipmentHistory[];
  latitude: number; // for interactive map simulator
  longitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  originLatitude: number;
  originLongitude: number;
  price: number;
  currency: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number;
  dimensions: string;
  shippingMethod: ShippingMethod;
  shippingSpeed: ShippingSpeed;
  insurance: boolean;
  specialInstructions?: string;
  pickupDate: string;
  estimatedCost: number;
  currency: string;
  status: 'Pending' | 'Approved' | 'In Transit' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface FleetVehicle {
  id: string;
  name: string; // e.g., "Volvo FH16 Truck", "Boeing 747-8F Cargo"
  type: 'Truck' | 'Container' | 'Ship' | 'Aircraft';
  plateNumber: string;
  status: 'Available' | 'In Transit' | 'Maintenance';
  fuelRecords: { date: string; amount: number; cost: number }[];
  maintenanceRecords: { date: string; description: string; cost: number }[];
  currentDriver?: string;
  capacity: string;
  gpsLocation: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  totalCapacity: number; // in cubic meters
  usedCapacity: number;
  inventory: { id: string; name: string; quantity: number; qrCode: string }[];
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  image: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: { author: string; content: string; createdAt: string }[];
}

export interface QuoteRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  weight: number;
  dimensions: string;
  shippingMethod: ShippingMethod;
  specialRequirements?: string;
  status: 'Pending' | 'Quoted' | 'Expired';
  quotedAmount?: number;
  createdAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  requirements: string[];
  createdAt: string;
}

export interface CareerApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  cvFileName: string;
  status: 'Pending' | 'Reviewing' | 'Accepted' | 'Declined';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Read' | 'Replied';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
