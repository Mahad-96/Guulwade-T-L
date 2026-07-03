import fs from 'fs';
import path from 'path';
import { 
  User, Shipment, Booking, FleetVehicle, Warehouse, 
  BlogPost, QuoteRequest, JobListing, CareerApplication, 
  ContactMessage, AppNotification 
} from '../types.js';

const DB_FILE = path.join(process.cwd(), 'database.json');

export interface DatabaseSchema {
  users: User[];
  shipments: Shipment[];
  bookings: Booking[];
  fleet: FleetVehicle[];
  warehouses: Warehouse[];
  blog: BlogPost[];
  quotes: QuoteRequest[];
  careers: JobListing[];
  applications: CareerApplication[];
  contacts: ContactMessage[];
  notifications: AppNotification[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    {
      id: 'usr-1',
      email: 'admin@guulwade.com',
      name: 'Dr. Warsame Elmi',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: '2026-01-01T08:00:00Z'
    },
    {
      id: 'usr-2',
      email: 'customer@test.com',
      name: 'Mursal Kureish',
      role: 'Customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: '2026-02-15T10:30:00Z'
    },
    {
      id: 'usr-3',
      email: 'staff@guulwade.com',
      name: 'Amina Yusuf',
      role: 'Staff',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: '2026-03-01T09:15:00Z'
    }
  ],
  shipments: [
    {
      id: 'GTL-2026-000154',
      bookingId: 'BKG-2026-0012',
      senderName: 'SomalFoods Ltd',
      receiverName: 'Suez Trading Co.',
      senderAddress: 'Sector 4, Mogadishu Port Road, Mogadishu, Somalia',
      receiverAddress: 'Suez Canal Terminal, Port Said, Egypt',
      weight: 12450,
      dimensions: '12m x 2.4m x 2.6m Standard Container',
      shippingMethod: 'Sea',
      shippingSpeed: 'Regular',
      estimatedDelivery: '2026-07-15T18:00:00Z',
      currentStatus: 'In Transit',
      currentLocation: 'Indian Ocean (En Route to Suez Canal)',
      driverName: 'Captain Ahmed Gurey',
      driverPhone: '+252 61 555 1234',
      vehiclePlate: 'IMO 9821453 (Cargo Vessel "Guulwade Explorer")',
      vehicleType: 'Ship',
      price: 4500,
      currency: 'USD',
      latitude: 8.5, // Between Mogadishu (2.0) and Suez Canal (29.9)
      longitude: 51.5,
      originLatitude: 2.033,
      originLongitude: 45.333,
      destinationLatitude: 29.933,
      destinationLongitude: 32.549,
      history: [
        {
          status: 'Ordered',
          timestamp: '2026-06-28T09:00:00Z',
          location: 'Mogadishu Office',
          description: 'Shipment booking was confirmed and cargo order compiled.'
        },
        {
          status: 'Picked Up',
          timestamp: '2026-06-29T14:30:00Z',
          location: 'SomalFoods Facility, Mogadishu',
          description: 'Cargo successfully packed, inspected, and loaded onto trucks.'
        },
        {
          status: 'Warehouse',
          timestamp: '2026-06-30T11:00:00Z',
          location: 'Guulwade Mogadishu Port Warehouse B',
          description: 'Shipment arrived at port warehouse, underwent customs verification, and received clearance.'
        },
        {
          status: 'In Transit',
          timestamp: '2026-07-01T17:00:00Z',
          location: 'Mogadishu Port Terminal 3',
          description: 'Cargo loaded onto vessel Guulwade Explorer. Container locked. Ship departed Mogadishu Port.'
        }
      ],
      createdAt: '2026-06-28T09:00:00Z'
    },
    {
      id: 'GTL-2026-000155',
      bookingId: 'BKG-2026-0013',
      senderName: 'Mursal Kureish',
      receiverName: 'Hodan Yusuf',
      senderAddress: 'Wadajir District, Mogadishu, Somalia',
      receiverAddress: 'Bole District, Addis Ababa, Ethiopia',
      weight: 25,
      dimensions: '40cm x 30cm x 30cm Box',
      shippingMethod: 'Air',
      shippingSpeed: 'Express',
      estimatedDelivery: '2026-07-05T14:00:00Z',
      currentStatus: 'Warehouse',
      currentLocation: 'Aden Adde Intl Airport Warehouse, Mogadishu',
      driverName: 'Abdiwahab Farah',
      driverPhone: '+252 61 777 9999',
      vehiclePlate: 'FL-2026-AIR2',
      vehicleType: 'Aircraft',
      price: 280,
      currency: 'USD',
      latitude: 2.013,
      longitude: 45.312,
      originLatitude: 2.013,
      originLongitude: 45.312,
      destinationLatitude: 9.019,
      destinationLongitude: 38.746,
      history: [
        {
          status: 'Ordered',
          timestamp: '2026-07-02T10:15:00Z',
          location: 'Guulwade Mogadishu HQ',
          description: 'Express Air package registered and label generated.'
        },
        {
          status: 'Picked Up',
          timestamp: '2026-07-02T16:00:00Z',
          location: 'Wadajir, Mogadishu',
          description: 'Package picked up from residence by local courier Abdiwahab Farah.'
        },
        {
          status: 'Warehouse',
          timestamp: '2026-07-03T09:30:00Z',
          location: 'Aden Adde Airport Warehouse',
          description: 'Package received, weighed, X-ray scanned, and queued for flight cargo loading.'
        }
      ],
      createdAt: '2026-07-02T10:15:00Z'
    }
  ],
  bookings: [
    {
      id: 'BKG-2026-0012',
      senderName: 'SomalFoods Ltd',
      senderPhone: '+252 61 222 3333',
      senderAddress: 'Sector 4, Mogadishu Port Road, Mogadishu, Somalia',
      receiverName: 'Suez Trading Co.',
      receiverPhone: '+20 2 2456 7890',
      receiverAddress: 'Suez Canal Terminal, Port Said, Egypt',
      weight: 12450,
      dimensions: '12m x 2.4m x 2.6m Standard Container',
      shippingMethod: 'Sea',
      shippingSpeed: 'Regular',
      insurance: true,
      specialInstructions: 'Temperature controlled ventilation requested.',
      pickupDate: '2026-06-29',
      estimatedCost: 4500,
      currency: 'USD',
      status: 'In Transit',
      createdAt: '2026-06-28T09:00:00Z'
    },
    {
      id: 'BKG-2026-0013',
      senderName: 'Mursal Kureish',
      senderPhone: '+252 61 444 5555',
      senderAddress: 'Wadajir District, Mogadishu, Somalia',
      receiverName: 'Hodan Yusuf',
      receiverPhone: '+251 11 654 3210',
      receiverAddress: 'Bole District, Addis Ababa, Ethiopia',
      weight: 25,
      dimensions: '40cm x 30cm x 30cm Box',
      shippingMethod: 'Air',
      shippingSpeed: 'Express',
      insurance: false,
      specialInstructions: 'Fragile: Electronics.',
      pickupDate: '2026-07-02',
      estimatedCost: 280,
      currency: 'USD',
      status: 'In Transit',
      createdAt: '2026-07-02T10:15:00Z'
    }
  ],
  fleet: [
    {
      id: 'FLT-001',
      name: 'Scania R500 Heavy Cargo Truck',
      type: 'Truck',
      plateNumber: 'SL-543-AA',
      status: 'Available',
      capacity: '40 Tons',
      gpsLocation: 'Berbera Port Depot, Somaliland',
      fuelRecords: [
        { date: '2026-06-15', amount: 350, cost: 525 },
        { date: '2026-06-28', amount: 400, cost: 600 }
      ],
      maintenanceRecords: [
        { date: '2026-05-10', description: 'Engine oil and air filter replacement', cost: 450 }
      ],
      currentDriver: 'Mustafa Ghedi'
    },
    {
      id: 'FLT-002',
      name: 'Cargo Vessel "Guulwade Explorer"',
      type: 'Ship',
      plateNumber: 'IMO 9821453',
      status: 'In Transit',
      capacity: '5000 TEU Containers',
      gpsLocation: 'Gulf of Aden',
      fuelRecords: [
        { date: '2026-06-20', amount: 45000, cost: 67500 }
      ],
      maintenanceRecords: [
        { date: '2026-01-15', description: 'Dry dock inspection and hull cleanup', cost: 75000 }
      ],
      currentDriver: 'Captain Ahmed Gurey'
    },
    {
      id: 'FLT-003',
      name: 'Boeing 747-8F Air Freighter',
      type: 'Aircraft',
      plateNumber: 'GTL-747F',
      status: 'Available',
      capacity: '140 Tons',
      gpsLocation: 'Aden Adde Airport, Mogadishu',
      fuelRecords: [
        { date: '2026-06-30', amount: 15000, cost: 22500 }
      ],
      maintenanceRecords: [
        { date: '2026-04-20', description: 'Turbine C-Check and landing gear lube', cost: 35000 }
      ],
      currentDriver: 'Pilot Abdisalam Barre'
    },
    {
      id: 'FLT-004',
      name: 'Volvo FH16 Multi-Axle Trailer',
      type: 'Truck',
      plateNumber: 'PL-981-XX',
      status: 'Maintenance',
      capacity: '50 Tons',
      gpsLocation: 'Garowe Service Depot',
      fuelRecords: [
        { date: '2026-06-12', amount: 300, cost: 450 }
      ],
      maintenanceRecords: [
        { date: '2026-07-01', description: 'Brake booster system repair', cost: 1200 }
      ],
      currentDriver: 'Guled Ali'
    }
  ],
  warehouses: [
    {
      id: 'WH-001',
      name: 'Mogadishu Port Central Warehouse',
      location: 'Mogadishu Port, Terminal 3, Mogadishu, Somalia',
      totalCapacity: 50000, // m3
      usedCapacity: 34200,
      inventory: [
        { id: 'INV-101', name: 'Premium Sesame Seed Bags', quantity: 1500, qrCode: 'QR_INV_101' },
        { id: 'INV-102', name: 'Fresh Banana Pallets (Cold Stg)', quantity: 800, qrCode: 'QR_INV_102' },
        { id: 'INV-103', name: 'Electronics Consignments', quantity: 240, qrCode: 'QR_INV_103' }
      ]
    },
    {
      id: 'WH-002',
      name: 'Berbera Logistic Hub & Dry Port',
      location: 'Customs Zone Road, Berbera, Somaliland',
      totalCapacity: 80000,
      usedCapacity: 41000,
      inventory: [
        { id: 'INV-201', name: 'Imported Construction Steel Bars', quantity: 3500, qrCode: 'QR_INV_201' },
        { id: 'INV-202', name: 'Solar Panels Packets', quantity: 1200, qrCode: 'QR_INV_202' }
      ]
    },
    {
      id: 'WH-003',
      name: 'Bosaso Port Shipping Warehouse',
      location: 'Main Sea Road, Bosaso, Puntland',
      totalCapacity: 30000,
      usedCapacity: 12000,
      inventory: [
        { id: 'INV-301', name: 'Frankincense Gum Bags', quantity: 450, qrCode: 'QR_INV_301' }
      ]
    }
  ],
  blog: [
    {
      id: 'BLG-001',
      title: 'Connecting Somalia to the World: The Rise of Horn of Africa Blue Economy',
      category: 'International Shipping',
      content: 'Somalia has the longest coastline in mainland Africa, stretching over 3,333 kilometers. This unique geographical asset provides a golden opportunity for maritime shipping and ocean logistics. Guulwade Transportation & Logistics is at the forefront of this revolution, establishing direct shipping lanes and logistics agreements across the Red Sea, the Indian Ocean, and beyond. This article explores how modern port improvements in Mogadishu, Berbera, and Bosaso are boosting Somali trade on a global scale.',
      tags: ['Maritime', 'Trade', 'Somalia', 'Guulwade'],
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600',
      author: 'Dr. Warsame Elmi',
      createdAt: '2026-06-15T09:00:00Z',
      likes: 42,
      comments: [
        { author: 'Abdi Farah', content: 'Incredible analysis! The maritime sector indeed holds the future for our country\'s economic prosperity.', createdAt: '2026-06-16T12:00:00Z' }
      ]
    },
    {
      id: 'BLG-002',
      title: 'How Air Freight Express is Transforming Horn Business Distribution',
      category: 'Air Cargo',
      content: 'For businesses dealing with high-value goods, electronics, and medicine, speed is the key. Traditional land routes between East African cities are slow and unpredictable. Guulwade Air Express provides a 24-hour delivery solution bridging Mogadishu, Hargeisa, Garowe, Nairobi, and Addis Ababa. Through dedicated freighter airliners, we ensure seamless customs pre-clearance and express home delivery.',
      tags: ['Air Cargo', 'Express', 'Business Logistics'],
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
      author: 'Amina Yusuf',
      createdAt: '2026-06-25T14:20:00Z',
      likes: 29,
      comments: []
    }
  ],
  quotes: [
    {
      id: 'QTE-001',
      companyName: 'Banaadir General Trading',
      contactName: 'Mohamed Sheikh',
      email: 'm.sheikh@banaadir.com',
      phone: '+252 61 999 0001',
      origin: 'Guangzhou Port, China',
      destination: 'Mogadishu Port, Somalia',
      weight: 18000,
      dimensions: '20ft FCL Container',
      shippingMethod: 'Sea',
      specialRequirements: 'Customs clearance service requested at Mogadishu Port.',
      status: 'Quoted',
      quotedAmount: 3850,
      createdAt: '2026-07-01T10:00:00Z'
    }
  ],
  careers: [
    {
      id: 'JOB-001',
      title: 'Logistics Control Specialist',
      department: 'Operations',
      location: 'Mogadishu HQ',
      type: 'Full-time',
      description: 'We are seeking an experienced Logistics Specialist to coordinate vessel docking, cargo offloading, and vehicle transport scheduling across our national Horn of Africa network.',
      requirements: [
        'Bachelor\'s degree in Logistics, Supply Chain Management, or Business Admin.',
        '3+ years experience in port logistics or trucking operations.',
        'Fluent in Somali and English. Arabic is a strong plus.',
        'Knowledge of customs processes in Mogadishu or Berbera ports.'
      ],
      createdAt: '2026-06-10T12:00:00Z'
    },
    {
      id: 'JOB-002',
      title: 'Heavy Truck Driver (Scania & Volvo Class)',
      department: 'Transportation',
      location: 'Berbera - Hargeisa - Garowe Corridor',
      type: 'Full-time',
      description: 'Guulwade is expanding its overland heavy truck fleet. We are hiring professional drivers for long-distance regional container shipping.',
      requirements: [
        'Valid heavy-duty vehicle driving license.',
        '5+ years clean record driving trucks with multi-axle trailers.',
        'Strong knowledge of regional safety corridors and borders.',
        'Basic mechanical skills for road checks.'
      ],
      createdAt: '2026-06-15T08:30:00Z'
    }
  ],
  applications: [],
  contacts: [],
  notifications: []
};

export function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading database file, loading seed defaults.', err);
  }
  
  // Seed file immediately if not exists
  saveDB(DEFAULT_DB);
  return DEFAULT_DB;
}

export function saveDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file.', err);
  }
}
