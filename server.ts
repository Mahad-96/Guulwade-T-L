import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { loadDB, saveDB } from './src/server/db.js';
import { Shipment, Booking, FleetVehicle, Warehouse, BlogPost, QuoteRequest, CareerApplication, ContactMessage, User } from './src/types.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parser
app.use(express.json());

// Initialize Gemini SDK safely
let ai: GoogleGenAI | null = null;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (GEMINI_KEY && GEMINI_KEY !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: GEMINI_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  console.log('Gemini AI initialized successfully.');
} else {
  console.log('Gemini API Key missing or default placeholder. AI Assistant will run in fallback simulation mode.');
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. Auth API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = loadDB();
  
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Simple static password matches based on requested credentials
  let isValid = false;
  if (email === 'admin@guulwade.com' && password === 'Admin@12345') isValid = true;
  else if (email === 'customer@test.com' && password === 'Customer@123') isValid = true;
  else if (email === 'staff@guulwade.com' && password === 'Staff@123') isValid = true;
  else if (password === 'Customer@123' || password === 'User@123') isValid = true; // allow easier testing for dynamic registers

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Return user info and simulated token
  res.json({
    user,
    token: `simulated-jwt-for-${user.id}-${Date.now()}`
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, password } = req.body;
  const db = loadDB();

  if (db.users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    email,
    name,
    role: 'Customer',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  res.json({
    user: newUser,
    token: `simulated-jwt-for-${newUser.id}-${Date.now()}`
  });
});

app.post('/api/auth/change-password', (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  // Dynamic mock success
  res.json({ message: 'Password updated successfully' });
});

// 2. Shipment & Tracking API
app.get('/api/shipments', (req, res) => {
  const db = loadDB();
  res.json(db.shipments);
});

app.get('/api/shipments/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const db = loadDB();
  const shipment = db.shipments.find(s => s.id.toUpperCase() === trackingId.toUpperCase());
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment tracking number not found' });
  }
  res.json(shipment);
});

app.post('/api/shipments', (req, res) => {
  const shipmentData = req.body;
  const db = loadDB();

  const newShipment: Shipment = {
    id: `GTL-2026-${String(db.shipments.length + 156).padStart(6, '0')}`,
    ...shipmentData,
    createdAt: new Date().toISOString(),
    history: [
      {
        status: 'Ordered',
        timestamp: new Date().toISOString(),
        location: shipmentData.currentLocation || 'Guulwade Logistics Office',
        description: 'Shipment package has been booked and label generated.'
      }
    ]
  };

  db.shipments.push(newShipment);
  saveDB(db);
  res.status(201).json(newShipment);
});

// Update shipment status / GPS (Admin utility)
app.patch('/api/shipments/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const updates = req.body;
  const db = loadDB();
  
  const index = db.shipments.findIndex(s => s.id.toUpperCase() === trackingId.toUpperCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const shipment = db.shipments[index];
  
  if (updates.currentStatus && updates.currentStatus !== shipment.currentStatus) {
    // Add history step
    shipment.history.push({
      status: updates.currentStatus,
      timestamp: new Date().toISOString(),
      location: updates.currentLocation || shipment.currentLocation,
      description: updates.statusDescription || `Shipment marked as ${updates.currentStatus}.`
    });
    shipment.currentStatus = updates.currentStatus;
  }

  db.shipments[index] = { ...shipment, ...updates };
  saveDB(db);
  res.json(db.shipments[index]);
});

// 3. Booking API
app.get('/api/bookings', (req, res) => {
  const db = loadDB();
  res.json(db.bookings);
});

app.post('/api/bookings', (req, res) => {
  const bookingData = req.body;
  const db = loadDB();

  const bookingId = `BKG-2026-${String(db.bookings.length + 14).padStart(4, '0')}`;
  
  const cost = calculateEstimatedCost(
    bookingData.weight,
    bookingData.shippingMethod,
    bookingData.shippingSpeed,
    bookingData.insurance
  );

  const newBooking: Booking = {
    id: bookingId,
    senderName: bookingData.senderName,
    senderPhone: bookingData.senderPhone,
    senderAddress: bookingData.senderAddress,
    receiverName: bookingData.receiverName,
    receiverPhone: bookingData.receiverPhone,
    receiverAddress: bookingData.receiverAddress,
    weight: Number(bookingData.weight),
    dimensions: bookingData.dimensions,
    shippingMethod: bookingData.shippingMethod,
    shippingSpeed: bookingData.shippingSpeed,
    insurance: !!bookingData.insurance,
    specialInstructions: bookingData.specialInstructions || '',
    pickupDate: bookingData.pickupDate,
    estimatedCost: cost,
    currency: bookingData.currency || 'USD',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);

  // Auto-generate matching Shipment tracking record for interactive demo loop
  const trackingId = `GTL-2026-${String(db.shipments.length + 156).padStart(6, '0')}`;
  
  // Set up random latitude/longitudes for routes based on method
  let originLat = 2.033, originLng = 45.333; // Mogadishu default
  let destLat = 9.019, destLng = 38.746; // Addis default

  if (bookingData.senderAddress.toLowerCase().includes('berbera')) {
    originLat = 10.439; originLng = 45.014;
  }
  if (bookingData.receiverAddress.toLowerCase().includes('egypt') || bookingData.receiverAddress.toLowerCase().includes('suez')) {
    destLat = 29.933; destLng = 32.549;
  } else if (bookingData.receiverAddress.toLowerCase().includes('nairobi')) {
    destLat = -1.292; destLng = 36.821;
  }

  const newShipment: Shipment = {
    id: trackingId,
    bookingId: bookingId,
    senderName: bookingData.senderName,
    receiverName: bookingData.receiverName,
    senderAddress: bookingData.senderAddress,
    receiverAddress: bookingData.receiverAddress,
    weight: Number(bookingData.weight),
    dimensions: bookingData.dimensions,
    shippingMethod: bookingData.shippingMethod,
    shippingSpeed: bookingData.shippingSpeed,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    currentStatus: 'Ordered',
    currentLocation: bookingData.senderAddress,
    driverName: 'Abdirahman Cali',
    driverPhone: '+252 61 888 1111',
    vehiclePlate: bookingData.shippingMethod === 'Air' ? 'FL-2026-AIR4' : bookingData.shippingMethod === 'Sea' ? 'IMO-9428512' : 'SL-834-BB',
    vehicleType: bookingData.shippingMethod === 'Air' ? 'Aircraft' : bookingData.shippingMethod === 'Sea' ? 'Ship' : 'Truck',
    price: cost,
    currency: bookingData.currency || 'USD',
    latitude: originLat,
    longitude: originLng,
    originLatitude: originLat,
    originLongitude: originLng,
    destinationLatitude: destLat,
    destinationLongitude: destLng,
    history: [
      {
        status: 'Ordered',
        timestamp: new Date().toISOString(),
        location: bookingData.senderAddress,
        description: `Order successfully booked through Online Portal. Estimated Cost: ${bookingData.currency || 'USD'} ${cost}.`
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.shipments.push(newShipment);

  // Trigger simulated notification
  db.notifications.push({
    id: `ntf-${Date.now()}`,
    userId: 'usr-2', // Customer demo
    title: 'Booking Confirmed!',
    message: `Your booking ${bookingId} has been successfully registered. Tracking Number: ${trackingId}`,
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB(db);
  res.status(201).json({ booking: newBooking, shipment: newShipment });
});

// Calculate Estimated Cost Utility Function
function calculateEstimatedCost(weight: number, method: 'Air' | 'Sea' | 'Road', speed: 'Express' | 'Regular', insurance: boolean): number {
  let baseRate = 5; // per kg default (Road)
  if (method === 'Air') baseRate = 12;
  else if (method === 'Sea') baseRate = 2.5;

  let multiplier = speed === 'Express' ? 1.5 : 1.0;
  let insuranceAdd = insurance ? 50 : 0;

  let calculated = Math.round((weight * baseRate * multiplier) + insuranceAdd);
  return calculated < 20 ? 20 : calculated; // minimum cost is $20
}

// Cost calculation endpoint
app.post('/api/bookings/calculate-cost', (req, res) => {
  const { weight, shippingMethod, shippingSpeed, insurance } = req.body;
  const cost = calculateEstimatedCost(
    Number(weight || 1),
    shippingMethod || 'Road',
    shippingSpeed || 'Regular',
    !!insurance
  );
  res.json({ cost });
});

// 4. Fleet Management API
app.get('/api/fleet', (req, res) => {
  const db = loadDB();
  res.json(db.fleet);
});

app.patch('/api/fleet/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = loadDB();
  
  const idx = db.fleet.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Vehicle not found' });

  db.fleet[idx] = { ...db.fleet[idx], ...updates };
  saveDB(db);
  res.json(db.fleet[idx]);
});

app.post('/api/fleet/:id/fuel', (req, res) => {
  const { id } = req.params;
  const { amount, cost } = req.body;
  const db = loadDB();

  const idx = db.fleet.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Vehicle not found' });

  db.fleet[idx].fuelRecords.push({
    date: new Date().toISOString().split('T')[0],
    amount: Number(amount),
    cost: Number(cost)
  });

  saveDB(db);
  res.json(db.fleet[idx]);
});

app.post('/api/fleet/:id/maintenance', (req, res) => {
  const { id } = req.params;
  const { description, cost } = req.body;
  const db = loadDB();

  const idx = db.fleet.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Vehicle not found' });

  db.fleet[idx].maintenanceRecords.push({
    date: new Date().toISOString().split('T')[0],
    description,
    cost: Number(cost)
  });

  saveDB(db);
  res.json(db.fleet[idx]);
});

// 5. Warehouse Management API
app.get('/api/warehouses', (req, res) => {
  const db = loadDB();
  res.json(db.warehouses);
});

app.post('/api/warehouses/:id/inventory', (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;
  const db = loadDB();

  const idx = db.warehouses.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Warehouse not found' });

  const itemId = `INV-${Date.now().toString().slice(-3)}`;
  db.warehouses[idx].inventory.push({
    id: itemId,
    name,
    quantity: Number(quantity),
    qrCode: `QR_${itemId}`
  });

  // Calculate simulated used capacity
  db.warehouses[idx].usedCapacity = Math.min(
    db.warehouses[idx].totalCapacity,
    db.warehouses[idx].usedCapacity + (Number(quantity) * 2.5) // approx 2.5 m3 per item unit
  );

  saveDB(db);
  res.json(db.warehouses[idx]);
});

// 6. Blog CMS API
app.get('/api/blog', (req, res) => {
  const db = loadDB();
  res.json(db.blog);
});

app.post('/api/blog', (req, res) => {
  const { title, category, content, tags, image, author } = req.body;
  const db = loadDB();

  const newPost: BlogPost = {
    id: `BLG-${String(db.blog.length + 1).padStart(3, '0')}`,
    title,
    category,
    content,
    tags: tags || [],
    image: image || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
    author: author || 'Admin',
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: []
  };

  db.blog.push(newPost);
  saveDB(db);
  res.status(201).json(newPost);
});

app.post('/api/blog/:id/comments', (req, res) => {
  const { id } = req.params;
  const { author, content } = req.body;
  const db = loadDB();

  const idx = db.blog.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Blog post not found' });

  db.blog[idx].comments.push({
    author: author || 'Anonymous',
    content,
    createdAt: new Date().toISOString()
  });

  saveDB(db);
  res.json(db.blog[idx]);
});

// 7. Quote requests
app.get('/api/quotes', (req, res) => {
  const db = loadDB();
  res.json(db.quotes);
});

app.post('/api/quotes', (req, res) => {
  const quoteData = req.body;
  const db = loadDB();

  const newQuote: QuoteRequest = {
    id: `QTE-${String(db.quotes.length + 2).padStart(3, '0')}`,
    companyName: quoteData.companyName,
    contactName: quoteData.contactName,
    email: quoteData.email,
    phone: quoteData.phone,
    origin: quoteData.origin,
    destination: quoteData.destination,
    weight: Number(quoteData.weight || 1),
    dimensions: quoteData.dimensions || '',
    shippingMethod: quoteData.shippingMethod || 'Sea',
    specialRequirements: quoteData.specialRequirements || '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.quotes.push(newQuote);
  saveDB(db);
  res.status(201).json(newQuote);
});

app.patch('/api/quotes/:id', (req, res) => {
  const { id } = req.params;
  const { status, quotedAmount } = req.body;
  const db = loadDB();

  const idx = db.quotes.findIndex(q => q.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Quote request not found' });

  if (status) db.quotes[idx].status = status;
  if (quotedAmount) db.quotes[idx].quotedAmount = Number(quotedAmount);

  saveDB(db);
  res.json(db.quotes[idx]);
});

// 8. Careers & Applications
app.get('/api/careers', (req, res) => {
  const db = loadDB();
  res.json(db.careers);
});

app.get('/api/applications', (req, res) => {
  const db = loadDB();
  res.json(db.applications);
});

app.post('/api/applications', (req, res) => {
  const appData = req.body;
  const db = loadDB();

  const newApplication: CareerApplication = {
    id: `APP-${Date.now()}`,
    jobId: appData.jobId,
    jobTitle: appData.jobTitle,
    fullName: appData.fullName,
    email: appData.email,
    phone: appData.phone,
    coverLetter: appData.coverLetter || '',
    cvFileName: appData.cvFileName || 'Resume.pdf',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.applications.push(newApplication);
  saveDB(db);
  res.status(201).json(newApplication);
});

// 9. Contacts
app.get('/api/contacts', (req, res) => {
  const db = loadDB();
  res.json(db.contacts);
});

app.post('/api/contacts', (req, res) => {
  const contactData = req.body;
  const db = loadDB();

  const newMessage: ContactMessage = {
    id: `MSG-${Date.now()}`,
    name: contactData.name,
    email: contactData.email,
    subject: contactData.subject,
    message: contactData.message,
    status: 'Unread',
    createdAt: new Date().toISOString()
  };

  db.contacts.push(newMessage);
  saveDB(db);
  res.status(201).json(newMessage);
});

// 10. Dashboard Analytics
app.get('/api/admin/analytics', (req, res) => {
  const db = loadDB();
  
  // A. CALCULATE GENERAL METRICS
  const completedOrInTransitBookings = db.bookings.filter(b => b.status === 'Completed' || b.status === 'In Transit');
  const currentBookingRevenue = completedOrInTransitBookings.reduce((sum, b) => sum + b.estimatedCost, 0);
  const revenue = currentBookingRevenue + 124500; // Base historical offset

  const activeShipments = db.shipments.filter(s => s.currentStatus !== 'Delivered').length;
  const totalShipments = db.shipments.length;
  const totalBookings = db.bookings.length;
  const totalCustomers = db.users.filter(u => u.role === 'Customer').length;
  const fleetCount = db.fleet.length;
  const fleetUnderMaintenance = db.fleet.filter(v => v.status === 'Maintenance').length;

  // B. REVENUE TRENDS (Detailed reports: Monthly growth, split by method & region)
  // Let's compute actual month-by-month revenue from bookings where possible, combined with stable base historical data
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 48500, Air: 19400, Sea: 21825, Road: 7275, Mogadishu: 24250, Berbera: 16975, Bosaso: 7275 },
    { month: 'Feb', revenue: 55200, Air: 22080, Sea: 24840, Road: 8280, Mogadishu: 27600, Berbera: 19320, Bosaso: 8280 },
    { month: 'Mar', revenue: 63100, Air: 25240, Sea: 28395, Road: 9465, Mogadishu: 31550, Berbera: 22085, Bosaso: 9465 },
    { month: 'Apr', revenue: 59000, Air: 23600, Sea: 26550, Road: 8850, Mogadishu: 29500, Berbera: 20650, Bosaso: 8850 },
    { month: 'May', revenue: 78300, Air: 31320, Sea: 35235, Road: 11745, Mogadishu: 39150, Berbera: 27405, Bosaso: 11745 },
    { month: 'Jun', revenue: 82500, Air: 33000, Sea: 37125, Road: 12375, Mogadishu: 41250, Berbera: 28875, Bosaso: 12375 },
    { month: 'Jul', revenue: 0, Air: 0, Sea: 0, Road: 0, Mogadishu: 0, Berbera: 0, Bosaso: 0 } // Computed dynamically below
  ];

  // Calculate actual July figures from active bookings
  let julAirRev = 0;
  let julSeaRev = 0;
  let julRoadRev = 0;
  let julMogRev = 0;
  let julBerRev = 0;
  let julBosRev = 0;

  db.bookings.forEach(b => {
    const cost = b.estimatedCost;
    // Method split
    if (b.shippingMethod === 'Air') julAirRev += cost;
    else if (b.shippingMethod === 'Sea') julSeaRev += cost;
    else julRoadRev += cost;

    // Regional split
    const sender = b.senderAddress.toLowerCase();
    if (sender.includes('berbera')) julBerRev += cost;
    else if (sender.includes('bosaso')) julBosRev += cost;
    else julMogRev += cost; // Mogadishu Port Default
  });

  // Combine with July base baseline offset for realistic full operational scales
  const julBase = 42000;
  monthlyRevenueData[6].Air = Math.round(julAirRev + (julBase * 0.35));
  monthlyRevenueData[6].Sea = Math.round(julSeaRev + (julBase * 0.45));
  monthlyRevenueData[6].Road = Math.round(julRoadRev + (julBase * 0.20));
  monthlyRevenueData[6].Mogadishu = Math.round(julMogRev + (julBase * 0.50));
  monthlyRevenueData[6].Berbera = Math.round(julBerRev + (julBase * 0.35));
  monthlyRevenueData[6].Bosaso = Math.round(julBosRev + (julBase * 0.15));
  monthlyRevenueData[6].revenue = monthlyRevenueData[6].Air + monthlyRevenueData[6].Sea + monthlyRevenueData[6].Road;

  // C. BOOKING VOLUMES BY SERVICE TYPE
  const serviceVolumes = [
    { month: 'Jan', Air: 48, Sea: 16, Road: 72, total: 136 },
    { month: 'Feb', Air: 52, Sea: 22, Road: 78, total: 152 },
    { month: 'Mar', Air: 61, Sea: 24, Road: 92, total: 177 },
    { month: 'Apr', Air: 55, Sea: 19, Road: 84, total: 158 },
    { month: 'May', Air: 74, Sea: 32, Road: 104, total: 210 },
    { month: 'Jun', Air: 80, Sea: 35, Road: 112, total: 227 },
    { month: 'Jul', Air: 0, Sea: 0, Road: 0, total: 0 }
  ];

  let julAirCount = 0;
  let julSeaCount = 0;
  let julRoadCount = 0;
  db.bookings.forEach(b => {
    if (b.shippingMethod === 'Air') julAirCount++;
    else if (b.shippingMethod === 'Sea') julSeaCount++;
    else julRoadCount++;
  });

  serviceVolumes[6].Air = julAirCount + 28;
  serviceVolumes[6].Sea = julSeaCount + 10;
  serviceVolumes[6].Road = julRoadCount + 38;
  serviceVolumes[6].total = serviceVolumes[6].Air + serviceVolumes[6].Sea + serviceVolumes[6].Road;

  // D. CUSTOMER ACQUISITION RATES
  const customerAcquisition = [
    { month: 'Jan', newCustomers: 12, cumulative: 42 },
    { month: 'Feb', newCustomers: 15, cumulative: 57 },
    { month: 'Mar', newCustomers: 22, cumulative: 79 },
    { month: 'Apr', newCustomers: 18, cumulative: 97 },
    { month: 'May', newCustomers: 26, cumulative: 123 },
    { month: 'Jun', newCustomers: 34, cumulative: 157 },
    { month: 'Jul', newCustomers: 0, cumulative: 0 }
  ];

  // Calculate actual July customer count
  let julCustomers = 0;
  db.users.forEach(u => {
    if (u.role === 'Customer' && u.createdAt && u.createdAt.includes('2026-07')) {
      julCustomers++;
    }
  });

  customerAcquisition[6].newCustomers = julCustomers + 14; // added baseline walk-in or manual accounts
  customerAcquisition[6].cumulative = customerAcquisition[5].cumulative + customerAcquisition[6].newCustomers;

  // E. SHIPMENT SUCCESS RATES & TIMELINES
  // Calculate shipment statuses
  const statusCounts = db.shipments.reduce((acc: any, s) => {
    acc[s.currentStatus] = (acc[s.currentStatus] || 0) + 1;
    return acc;
  }, {});

  // Add all statuses if missing so UI doesn't crash
  const allStatuses = ['Ordered', 'Picked Up', 'Warehouse', 'In Transit', 'Customs', 'Out for Delivery', 'Delivered'];
  allStatuses.forEach(st => {
    if (!statusCounts[st]) statusCounts[st] = 0;
  });

  // Calculate actual success rates
  // Historically: 382 delivered successfully, 12 delayed, 6 customs delays
  const deliveredCount = statusCounts['Delivered'] || 0;
  const activeCount = totalShipments - deliveredCount;
  
  // Calculate success rate as Delivered on time percentage (Simulated high-fidelity score)
  const shipmentSuccessRate = 96.4; // 96.4% on-time delivery metric
  const customsSuccessRate = 98.2; // customs clearance success
  
  // F. FLEET UTILIZATION & FINANCIAL PERFORMANCE (Expenses per asset)
  // Calculate real metrics from db.fleet fuel and maintenance records
  const fleetAnalysis = db.fleet.map(v => {
    const totalFuelLitters = v.fuelRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalFuelCost = v.fuelRecords.reduce((sum, r) => sum + r.cost, 0);
    const totalMaintCost = v.maintenanceRecords.reduce((sum, r) => sum + r.cost, 0);
    
    // Calculate utilization rate based on status
    let utilizationScore = 0;
    if (v.status === 'In Transit') utilizationScore = 100;
    else if (v.status === 'Available') utilizationScore = 65; // standby rate
    else if (v.status === 'Maintenance') utilizationScore = 0;

    return {
      id: v.id,
      name: v.name,
      type: v.type,
      status: v.status,
      utilizationScore,
      totalFuelLitters,
      totalFuelCost,
      totalMaintCost,
      totalExpenses: totalFuelCost + totalMaintCost
    };
  });

  const fleetUtilizationRate = Math.round(
    fleetAnalysis.reduce((sum, v) => sum + v.utilizationScore, 0) / fleetAnalysis.length
  );

  const totalFleetFuelCost = fleetAnalysis.reduce((sum, v) => sum + v.totalFuelCost, 0);
  const totalFleetMaintCost = fleetAnalysis.reduce((sum, v) => sum + v.totalMaintCost, 0);

  res.json({
    metrics: {
      revenue,
      activeShipments,
      totalShipments,
      totalBookings,
      totalCustomers,
      fleetCount,
      fleetUnderMaintenance,
      shipmentSuccessRate,
      fleetUtilizationRate,
      totalFleetFuelCost,
      totalFleetMaintCost
    },
    revenueTrends: monthlyRevenueData,
    serviceVolumes,
    customerAcquisition,
    shipmentStatusBreakdown: statusCounts,
    fleetAnalysis,
    recentBookings: db.bookings.slice(-5).reverse(),
    recentContacts: db.contacts.slice(-5).reverse()
  });
});

// 11. Smart AI Assistant (Gemini API Integration)
app.post('/api/gemini/assistant', async (req, res) => {
  const { prompt, chatHistory } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    if (ai) {
      console.log('Generating AI answer from Gemini...');
      
      // Let's bundle some context of Guulwade for the model
      const systemPrompt = `
You are the "Guulwade Smart Assistant", an expert, helpful, and premium logistics advisor for Guulwade Transportation & Logistics.
Guulwade is based in East Africa (Somalia, Somaliland, Puntland, Ethiopia, Kenya) and operates worldwide.
We provide air cargo, ocean freight, warehousing, local tracking, customs clearance, and business logistics.

Here is the context of our key shipment tracking in the system:
- Tracking GTL-2026-000154 is currently "In Transit" on the "Guulwade Explorer" (Cargo Vessel) in the Indian Ocean en route to Egypt from Mogadishu. Estimated delivery is July 15, 2026.
- Tracking GTL-2026-000155 is currently "Warehouse" at Aden Adde International Airport Warehouse, Mogadishu, heading to Addis Ababa via Air Express. Estimated delivery is July 5, 2026.

We have main warehouses at:
- Mogadishu Port Central Warehouse (Terminal 3)
- Berbera Logistic Hub & Dry Port
- Bosaso Port Shipping Warehouse

Please answer the user's question clearly. We support English, Somali, and Arabic. Translate and reply in the same language the user prompted. Keep answers professional, supportive, and premium.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      const responseText = response.text || 'I am processing your cargo details. Let me assist you with pricing, transit lines, or customs regulations.';
      return res.json({ answer: responseText });
    } else {
      // Fallback response generator if Gemini key is not set
      console.log('Using simulated chatbot responses (Gemini Key missing).');
      const lower = prompt.toLowerCase();
      let answer = '';

      if (lower.includes('english')) {
        answer = "Welcome to Guulwade logistics! I am your AI assistant. You can ask me about tracking GTL-2026-000154, our Mogadishu and Berbera warehouses, air and sea freight calculations, or East African customs clearance procedures.";
      } else if (lower.includes('somali') || lower.includes('maal') || lower.includes('halkee') || lower.includes('isgaadhsiin') || lower.includes('gargaar') || lower.includes('guulwade')) {
        answer = "Ku soo dhowow Guulwade Transportation & Logistics. Waxaan ahay caawiyahaaga casriga ah ee AI. Waxaad i weydiin kartaa ku saabsan lambarka dabagalka GTL-2026-000154, bakhaarada Muqdisho iyo Berbera, xisaabinta qiimaha rarida diyaaradda ama markabka, iyo hawlaha kastamka.";
      } else if (lower.includes('arabic') || lower.includes('مرحبا') || lower.includes('تتبع') || lower.includes('شحن')) {
        answer = "مرحباً بكم في جولوادي للنقل والخدمات اللوجستية. أنا مساعدك الذكي. يمكنك الاستفسار عن تتبع الشحنة GTL-2026-000154، ومستودعاتنا في مقديشو وبربرا، وتكاليف الشحن الجوي والبحري، وتخليص الجمارك.";
      } else if (lower.includes('154')) {
        answer = "Shipment GTL-2026-000154 is currently 'In Transit' onboard our cargo vessel 'Guulwade Explorer' in the Indian Ocean. It departed Mogadishu Port on July 1st and is en route to Suez Canal Terminal, Egypt. Estimated delivery is July 15, 2026.";
      } else if (lower.includes('155')) {
        answer = "Shipment GTL-2026-000155 is currently at 'Aden Adde Intl Airport Warehouse' in Mogadishu, Somalia. It is an Express Air Cargo package heading to Bole District, Addis Ababa, Ethiopia. Estimated arrival is July 5, 2026.";
      } else if (lower.includes('custom') || lower.includes('tax') || lower.includes('kastam') || lower.includes('kastamka')) {
        answer = "We provide comprehensive customs clearance services in Mogadishu, Berbera, and Bosaso ports. Import tariff clearances usually take 24-48 hours. Our staff handles all documentation with the Ministry of Finance, ensuring legal, fast clearance for sesame seeds, construction steel, and solar equipment.";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('qiima') || lower.includes('qiimaha')) {
        answer = "Our standard pricing is based on weight, mode, and urgency. Sea Freight is estimated at $2.5 per kg, Air Freight is $12 per kg, and Road Freight is $5 per kg. Express handling applies a 1.5x speed multiplier. Use our booking form for an exact calculated cost with custom coupon discounts!";
      } else {
        answer = "Guulwade Logistics Smart Assistant: I can help you track active cargo containers (like GTL-2026-000154), plan heavy air shipments to Addis Ababa, manage storage in Berbera dry ports, or understand customs fees. How can I help you today?";
      }

      return res.json({ answer });
    }
  } catch (error: any) {
    console.error('Error generating Gemini response:', error);
    res.status(500).json({ error: 'AI processing failed. Please try again or use standard support.' });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER & PRODUCTION SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Guulwade Logistics Server running on http://localhost:${PORT}`);
  });
}

startServer();
