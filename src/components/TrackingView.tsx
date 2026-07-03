import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { useCurrency } from './CurrencyContext.tsx';
import { 
  Search, Package, Calendar, Clock, MapPin, 
  User, Truck, Ship, Plane, Phone, CheckCircle2, 
  Map, Navigation, ArrowRight, Printer, RefreshCw 
} from 'lucide-react';
import { Shipment, ShipmentStatus } from '../types.ts';

interface TrackingViewProps {
  initialTrackingId?: string;
}

export default function TrackingView({ initialTrackingId = '' }: TrackingViewProps) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusSteps: ShipmentStatus[] = [
    'Ordered',
    'Picked Up',
    'Warehouse',
    'In Transit',
    'Customs',
    'Out for Delivery',
    'Delivered'
  ];

  const fetchTrackingDetails = async (idToFetch: string) => {
    if (!idToFetch.trim()) return;
    setLoading(true);
    setError('');
    setShipment(null);
    try {
      const response = await fetch(`/api/shipments/${idToFetch.trim()}`);
      if (!response.ok) {
        throw new Error('No shipment found with this tracking number.');
      }
      const data = await response.json();
      setShipment(data);
    } catch (err: any) {
      setError(err.message || 'Error searching tracking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      fetchTrackingDetails(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackingDetails(trackingId);
  };

  const getStatusIndex = (current: ShipmentStatus) => {
    return statusSteps.indexOf(current);
  };

  const getVehicleIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'aircraft': return <Plane className="text-[#0057B8]" size={20} />;
      case 'ship': return <Ship className="text-[#0057B8]" size={20} />;
      default: return <Truck className="text-[#0057B8]" size={20} />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          {t('tracking')}
        </h2>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Track and monitor your global ocean containers, air express parcels, and overland logistics shipments in real-time.
        </p>
      </div>

      {/* Track Search Box */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="GTL-2026-000154"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8] dark:focus:ring-[#FFB000] focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-[#0057B8] hover:bg-[#00479b] dark:bg-[#FFB000] dark:hover:bg-[#e09b00] text-white dark:text-[#0B1220] font-bold rounded-xl shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : t('track')}
          </button>
        </form>

        {/* Info hints */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>Demo Tracking: <strong className="cursor-pointer text-[#0057B8] dark:text-[#FFB000]" onClick={() => { setTrackingId('GTL-2026-000154'); fetchTrackingDetails('GTL-2026-000154'); }}>GTL-2026-000154</strong> (Sea Container)</span>
          <span>•</span>
          <span><strong className="cursor-pointer text-[#0057B8] dark:text-[#FFB000]" onClick={() => { setTrackingId('GTL-2026-000155'); fetchTrackingDetails('GTL-2026-000155'); }}>GTL-2026-000155</strong> (Air Cargo)</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-xl mx-auto p-4 mb-10 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-800 flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Shipment Details Results */}
      {shipment && (
        <div className="space-y-8 animate-fade-in print:block">
          {/* Main Card with status bar */}
          <div className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tracking Number</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {shipment.id}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-[#0057B8]/10 text-[#0057B8] dark:text-[#FFB000] dark:bg-[#FFB000]/10 px-4 py-2 rounded-xl text-sm font-extrabold flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A86B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A86B]"></span>
                  </span>
                  <span>{shipment.currentStatus}</span>
                </div>
                
                <button 
                  onClick={handlePrint}
                  className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer print:hidden"
                  title="Print Shipment Summary"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-100 dark:border-gray-800 text-left">
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500 block">Estimated Delivery</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white mt-1 block">
                  {new Date(shipment.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500 block">Current Location</span>
                <span className="text-sm font-bold text-[#0057B8] dark:text-[#FFB000] mt-1 block">
                  {shipment.currentLocation}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500 block">Shipping Method</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white mt-1 block capitalize flex items-center space-x-1.5">
                  {getVehicleIcon(shipment.vehicleType)}
                  <span>{shipment.shippingMethod} ({shipment.shippingSpeed})</span>
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500 block">Cargo Weight</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white mt-1 block">
                  {shipment.weight.toLocaleString()} kg
                </span>
              </div>
            </div>

            {/* Shipment Route Map Simulator - SVG Map representation */}
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2 mb-4">
                <Map size={18} className="text-gray-400 dark:text-gray-500" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Route Map Simulator</h4>
              </div>

              {/* simulated map drawing */}
              <div className="relative h-64 bg-slate-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-900 overflow-hidden flex items-center justify-center">
                {/* SVG Route Line */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid background */}
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" className="text-gray-200/50 dark:text-gray-800/40" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Route Pathway */}
                  <path 
                    d="M 150,180 Q 300,80 650,100" 
                    fill="none" 
                    stroke="#D1D5DB" 
                    strokeWidth="3" 
                    strokeDasharray="6,6"
                    className="dark:stroke-gray-800"
                  />
                  
                  {/* Progress Line */}
                  <path 
                    d="M 150,180 Q 300,80 650,100" 
                    fill="none" 
                    stroke="#0057B8" 
                    strokeWidth="3" 
                    strokeDasharray="300"
                    strokeDashoffset={shipment.currentStatus === 'Delivered' ? '0' : '150'}
                    className="transition-all duration-1000 dark:stroke-[#FFB000]"
                  />

                  {/* Origin City */}
                  <circle cx="150" cy="180" r="7" fill="#0057B8" className="dark:fill-[#FFB000]" />
                  {/* Destination City */}
                  <circle cx="650" cy="100" r="7" fill="#00A86B" />
                </svg>

                {/* Simulated Nodes Names labels */}
                <div className="absolute left-[12%] bottom-[20%] text-left bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block">Origin</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px] block">{shipment.senderAddress.split(',')[0]}</span>
                </div>

                <div className="absolute right-[12%] top-[20%] text-left bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block">Destination</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px] block">{shipment.receiverAddress.split(',')[0]}</span>
                </div>

                {/* Simulated Courier Node (Bouncing vehicle representing actual position) */}
                <div 
                  className="absolute animate-bounce bg-[#FFB000] dark:bg-[#0057B8] text-[#0B1220] dark:text-white p-2.5 rounded-full shadow-lg border-2 border-white dark:border-[#0B1220]"
                  style={{
                    left: shipment.currentStatus === 'Delivered' ? '82%' : shipment.currentStatus === 'In Transit' ? '48%' : '24%',
                    top: shipment.currentStatus === 'Delivered' ? '18%' : shipment.currentStatus === 'In Transit' ? '14%' : '28%'
                  }}
                >
                  {getVehicleIcon(shipment.vehicleType)}
                </div>
              </div>
            </div>

            {/* Shipment Status Progress Bar */}
            <div className="p-6 md:p-8 bg-gray-50/30 dark:bg-gray-800/10">
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Horizontal timeline track (for large screens) */}
                <div className="hidden md:block absolute left-10 right-10 top-5.5 h-1 bg-gray-200 dark:bg-gray-800 -z-10">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0057B8] to-[#00A86B] transition-all duration-1000"
                    style={{ width: `${(getStatusIndex(shipment.currentStatus) / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Status Steps */}
                {statusSteps.map((step, idx) => {
                  const isCompleted = getStatusIndex(shipment.currentStatus) >= idx;
                  const isActive = shipment.currentStatus === step;

                  return (
                    <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center md:flex-1 relative">
                      <div 
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow transition-all duration-500 ${
                          isActive 
                            ? 'bg-[#FFB000] text-[#0B1220] ring-4 ring-[#FFB000]/30 scale-110 z-10'
                            : isCompleted 
                              ? 'bg-[#00A86B] text-white z-10' 
                              : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {isCompleted && !isActive ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>

                      <div className="flex flex-col md:items-center">
                        <span className={`text-sm font-bold ${isActive ? 'text-[#0057B8] dark:text-[#FFB000]' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                          {step}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-widest font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>

          {/* Details & Driver Side Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipment Route Logs */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0B1220] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl text-left">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <Clock size={18} className="text-[#0057B8] dark:text-[#FFB000]" />
                <span>Detailed Status Timeline</span>
              </h4>

              <div className="relative border-l border-gray-200 dark:border-gray-800 pl-6 ml-3 space-y-8">
                {shipment.history.slice().reverse().map((log, index) => (
                  <div key={index} className="relative text-left">
                    {/* Bullet marker */}
                    <div className={`absolute -left-9.5 top-1.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-[#0B1220] ${
                      index === 0 ? 'border-[#FFB000] ring-4 ring-[#FFB000]/20' : 'border-[#0057B8]'
                    }`} />
                    
                    <span className="text-xs font-bold text-[#0057B8] dark:text-[#FFB000] uppercase tracking-wider block">
                      {log.status}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
                      {new Date(log.timestamp).toLocaleString()} • {log.location}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                      {log.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier, Vehicle & Addresses Info */}
            <div className="space-y-8 text-left">
              {/* Driver & vehicle */}
              <div className="bg-white dark:bg-[#0B1220] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
                  Transport Fleet Details
                </h4>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
                    <User size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block">Assigned Transport Captain</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white block">{shipment.driverName}</span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-500">Driver Phone</span>
                    <span className="text-gray-900 dark:text-white font-bold">{shipment.driverPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-500">Vehicle Assigned</span>
                    <span className="text-gray-900 dark:text-white font-bold">{shipment.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-500">Vehicle Type</span>
                    <span className="text-gray-900 dark:text-white font-bold capitalize">{shipment.vehicleType}</span>
                  </div>
                </div>
              </div>

              {/* Transit endpoints address details */}
              <div className="bg-white dark:bg-[#0B1220] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Sender (Origin Address)</span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {shipment.senderName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {shipment.senderAddress}
                  </p>
                </div>

                <div className="flex items-center justify-center py-1">
                  <ArrowRight size={18} className="text-gray-300 rotate-90 lg:rotate-0" />
                </div>

                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Receiver (Destination Address)</span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {shipment.receiverName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {shipment.receiverAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
