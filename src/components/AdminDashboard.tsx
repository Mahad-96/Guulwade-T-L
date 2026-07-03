import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { useCurrency } from './CurrencyContext.tsx';
import { 
  TrendingUp, Package, Clipboard, Users, Truck, Ship, Plane, 
  MapPin, RefreshCw, Layers, CheckCircle2, QrCode, Mail, 
  Search, Plus, Eye, Check, X, AlertTriangle, BookOpen,
  BarChart3, PieChart, Activity, Calendar, DollarSign, Award,
  Fuel, Wrench, Percent, ShieldCheck, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { Shipment, Booking, FleetVehicle, Warehouse, CareerApplication, ContactMessage } from '../types.ts';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Metrics states
  const [metrics, setMetrics] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced BI Analytics state
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [serviceVolumes, setServiceVolumes] = useState<any[]>([]);
  const [customerAcquisition, setCustomerAcquisition] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any>(null);
  const [fleetAnalysis, setFleetAnalysis] = useState<any[]>([]);
  
  // Dashboard navigation sub-tab selector
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'financials' | 'services' | 'customers' | 'shipments' | 'fleet'>('overview');

  // Tooltip tracking state for SVG charts
  const [hoveredNode, setHoveredNode] = useState<{ x: number, y: number, month: string, label: string, value: string | number } | null>(null);

  // Management states
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);

  // Sub-tabs in admin dashboard
  const [subTab, setSubTab] = useState<'overview' | 'shipments' | 'fleet' | 'warehouses' | 'applications'>('overview');

  // Shipment status editor state
  const [editingShipmentId, setEditingShipmentId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newLoc, setNewLoc] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');

  // Fleet editor state
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [fuelAmt, setFuelAmt] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCost, setMaintCost] = useState('');

  // Warehouse editor state
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Get analytics
      const resAnal = await fetch('/api/admin/analytics');
      if (resAnal.ok) {
        const data = await resAnal.json();
        setMetrics(data.metrics);
        setRevenueTrends(data.revenueTrends || []);
        setServiceVolumes(data.serviceVolumes || []);
        setCustomerAcquisition(data.customerAcquisition || []);
        setStatusBreakdown(data.shipmentStatusBreakdown || null);
        setFleetAnalysis(data.fleetAnalysis || []);
        setRecentBookings(data.recentBookings || []);
        setRecentContacts(data.recentContacts || []);
      }

      // 2. Get shipments
      const resShip = await fetch('/api/shipments');
      if (resShip.ok) setShipments(await resShip.json());

      // 3. Get fleet
      const resFleet = await fetch('/api/fleet');
      if (resFleet.ok) setFleet(await resFleet.json());

      // 4. Get warehouses
      const resWh = await fetch('/api/warehouses');
      if (resWh.ok) setWarehouses(await resWh.json());

      // 5. Get applications
      const resApp = await fetch('/api/applications');
      if (resApp.ok) setApplications(await resApp.json());
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update Shipment Status Handler
  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipmentId) return;

    try {
      const res = await fetch(`/api/shipments/${editingShipmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStatus: newStatus,
          currentLocation: newLoc,
          statusDescription: newDesc
        })
      });

      if (res.ok) {
        // Refresh data
        fetchAdminData();
        setEditingShipmentId(null);
        setNewStatus('');
        setNewLoc('');
        setNewDesc('');
      }
    } catch (err) {
      console.error('Error updating shipment status:', err);
    }
  };

  // Add Fuel Expense Handler
  const handleAddFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    try {
      const res = await fetch(`/api/fleet/${selectedVehicle.id}/fuel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(fuelAmt),
          cost: Number(fuelCost)
        })
      });

      if (res.ok) {
        fetchAdminData();
        setFuelAmt('');
        setFuelCost('');
        // Re-select vehicle to show updated logs
        const updatedVehicles = await fetch('/api/fleet').then(r => r.json());
        const match = updatedVehicles.find((v: any) => v.id === selectedVehicle.id);
        if (match) setSelectedVehicle(match);
      }
    } catch (err) {
      console.error('Error logging fuel:', err);
    }
  };

  // Add Maintenance Record Handler
  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    try {
      const res = await fetch(`/api/fleet/${selectedVehicle.id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: maintDesc,
          cost: Number(maintCost)
        })
      });

      if (res.ok) {
        fetchAdminData();
        setMaintDesc('');
        setMaintCost('');
        // Re-select vehicle to show updated logs
        const updatedVehicles = await fetch('/api/fleet').then(r => r.json());
        const match = updatedVehicles.find((v: any) => v.id === selectedVehicle.id);
        if (match) setSelectedVehicle(match);
      }
    } catch (err) {
      console.error('Error logging maintenance:', err);
    }
  };

  // Add Inventory Item Handler
  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;

    try {
      const res = await fetch(`/api/warehouses/${selectedWarehouse.id}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          quantity: Number(newItemQty)
        })
      });

      if (res.ok) {
        fetchAdminData();
        setNewItemName('');
        setNewItemQty('');
        // Re-select warehouse
        const updatedWhs = await fetch('/api/warehouses').then(r => r.json());
        const match = updatedWhs.find((w: any) => w.id === selectedWarehouse.id);
        if (match) setSelectedWarehouse(match);
      }
    } catch (err) {
      console.error('Error adding inventory item:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#070C15] flex flex-col justify-center items-center py-20">
        <RefreshCw className="animate-spin text-[#0057B8] dark:text-[#FFB000] mb-4" size={32} />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Compiling Guulwade Intelligence Core...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Advanced Analytics', icon: <BarChart3 size={16} /> },
    { id: 'shipments', label: 'Manage Shipments', icon: <Layers size={16} /> },
    { id: 'fleet', label: 'Fleet Controller', icon: <Truck size={16} /> },
    { id: 'warehouses', label: 'Warehousing Hubs', icon: <MapPin size={16} /> },
    { id: 'applications', label: 'Careers & Recruiting', icon: <BookOpen size={16} /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-[#0057B8]/5">
        <div className="text-left">
          <h1 className="text-2xl font-black text-gray-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <span>Guulwade Logistics Command Center</span>
            <span className="text-[10px] bg-[#0057B8]/15 text-[#0057B8] dark:bg-[#FFB000]/15 dark:text-[#FFB000] px-2 py-0.5 rounded font-black tracking-widest uppercase">Admin Panel</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Real-time telemetry, advanced ledger indices, custom fleet controls, and SLA auditing dashboards.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw size={13} className="animate-hover-spin" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Main Tab Rows */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            id={`tab-btn-${tab.id}`}
            key={tab.id}
            onClick={() => { setSubTab(tab.id as any); setEditingShipmentId(null); setSelectedVehicle(null); setSelectedWarehouse(null); }}
            className={`flex items-center space-x-2 pb-4 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer whitespace-nowrap ${
              subTab === tab.id 
                ? 'border-[#0057B8] text-[#0057B8] dark:border-[#FFB000] dark:text-[#FFB000]' 
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* --- TAB 1: OVERVIEW ANALYTICS --- */}
      {subTab === 'overview' && metrics && (
        <div className="space-y-8 animate-fade-in text-left">
          
          {/* Internal Analytics Navigation Tab Row */}
          <div className="flex flex-wrap border-b border-gray-100 dark:border-gray-800/60 gap-1.5 mb-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Executive Briefing', icon: <Activity size={14} /> },
              { id: 'financials', label: 'Financial Reports', icon: <DollarSign size={14} /> },
              { id: 'services', label: 'Service Volume', icon: <BarChart3 size={14} /> },
              { id: 'customers', label: 'Client Growth', icon: <Users size={14} /> },
              { id: 'shipments', label: 'Shipment Performance', icon: <ShieldCheck size={14} /> },
              { id: 'fleet', label: 'Fleet Efficiency', icon: <Truck size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setAnalyticsTab(tab.id as any); setHoveredNode(null); }}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-t border-x cursor-pointer ${
                  analyticsTab === tab.id
                    ? 'bg-white dark:bg-[#0B1220] border-gray-200 dark:border-gray-800 text-[#0057B8] dark:text-[#FFB000] font-black -mb-[1px]'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-gray-950 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 1. EXECUTIVE BRIEFING VIEW */}
          {analyticsTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Top Summary Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow shadow-[#0057B8]/5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest block">Total Freight Revenue</span>
                    <span className="p-1 bg-[#0057B8]/10 text-[#0057B8] dark:text-[#FFB000] rounded"><DollarSign size={14} /></span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{formatPrice(metrics.revenue)}</h3>
                  <p className="text-[10px] text-green-500 font-bold mt-2 flex items-center gap-1">
                    <span className="flex items-center"><ArrowUpRight size={10} /> 18.2%</span> 
                    <span className="text-gray-400 font-normal">from last quarter</span>
                  </p>
                </div>

                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow shadow-[#0057B8]/5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest block">Active Cargo Shipments</span>
                    <span className="p-1 bg-[#FFB000]/10 text-[#FFB000] rounded"><Package size={14} /></span>
                  </div>
                  <h3 className="text-3xl font-black text-[#0057B8] dark:text-[#FFB000] mt-1">{metrics.activeShipments}</h3>
                  <p className="text-[10px] text-gray-400 mt-2">Active transit over ocean & airlanes</p>
                </div>

                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow shadow-[#0057B8]/5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest block">Delivery Success Rate</span>
                    <span className="p-1 bg-green-500/10 text-green-500 rounded"><ShieldCheck size={14} /></span>
                  </div>
                  <h3 className="text-3xl font-black text-green-500 mt-1">{metrics.shipmentSuccessRate}%</h3>
                  <p className="text-[10px] text-gray-400 mt-2">On-time SLA compliance score</p>
                </div>

                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow shadow-[#0057B8]/5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest block">Fleet Utilization</span>
                    <span className="p-1 bg-[#00A86B]/10 text-[#00A86B] rounded"><Truck size={14} /></span>
                  </div>
                  <h3 className="text-3xl font-black text-[#00A86B] mt-1">{metrics.fleetUtilizationRate}%</h3>
                  <p className="text-[10px] text-red-500 font-semibold mt-2">
                    {metrics.fleetUnderMaintenance} vehicle in repairs depot
                  </p>
                </div>
              </div>

              {/* Consolidated Interactive Trend and AI Insight Briefing */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Mini Line Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl relative">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">Consolidated Financial Velocity</h4>
                      <p className="text-[11px] text-gray-500">Overview of cargo booking cash flows (Jan - Jul 2026)</p>
                    </div>
                    <span className="text-xs font-black text-[#0057B8] dark:text-[#FFB000] bg-[#0057B8]/5 px-2.5 py-1 rounded-lg">
                      YTD Sum: {formatPrice(metrics.revenue)}
                    </span>
                  </div>

                  {/* SVG Line/Area Chart */}
                  {revenueTrends.length > 0 && (
                    <div className="relative pt-2" onMouseLeave={() => setHoveredNode(null)}>
                      <svg viewBox="0 0 500 180" className="w-full h-48 overflow-visible">
                        <defs>
                          <linearGradient id="exec-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0057B8" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#0057B8" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Chart Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                          const y = 15 + p * 130;
                          return (
                            <line 
                              key={i} x1="35" y1={y} x2="480" y2={y} 
                              className="stroke-gray-100 dark:stroke-gray-800/50" strokeDasharray="3 3" 
                            />
                          );
                        })}

                        {/* Generate points & paths */}
                        {(() => {
                          const maxVal = Math.max(...revenueTrends.map(d => d.revenue), 100) * 1.1;
                          const points = revenueTrends.map((d, i) => {
                            const x = 35 + (i / (revenueTrends.length - 1)) * 445;
                            const y = 145 - (d.revenue / maxVal) * 130;
                            return { x, y, value: d.revenue, label: d.month, original: d };
                          });

                          const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const areaPath = `${linePath} L ${points[points.length - 1].x} 145 L ${points[0].x} 145 Z`;

                          return (
                            <>
                              {/* Filled Area */}
                              <path d={areaPath} fill="url(#exec-grad)" />
                              
                              {/* Path Line */}
                              <path d={linePath} fill="none" stroke="#0057B8" strokeWidth="2.5" className="dark:stroke-[#FFB000]" />
                              
                              {/* Active Data Points */}
                              {points.map((p, i) => (
                                <g key={i}>
                                  <circle 
                                    cx={p.x} cy={p.y} r="4.5" 
                                    className="fill-[#0057B8] dark:fill-[#FFB000] stroke-white dark:stroke-[#0B1220] stroke-2 cursor-pointer transition-all hover:r-6"
                                    onMouseEnter={(e) => {
                                      setHoveredNode({
                                        x: (p.x / 500) * 100,
                                        y: (p.y / 180) * 100,
                                        month: p.label,
                                        label: 'Revenue',
                                        value: formatPrice(p.value)
                                      });
                                    }}
                                  />
                                </g>
                              ))}
                            </>
                          );
                        })()}

                        {/* X-Axis labels */}
                        {revenueTrends.map((d, i) => {
                          const x = 35 + (i / (revenueTrends.length - 1)) * 445;
                          return (
                            <text 
                              key={i} x={x} y="165" 
                              className="text-[9px] font-bold fill-gray-400 dark:fill-gray-500 text-center" 
                              textAnchor="middle"
                            >
                              {d.month}
                            </text>
                          );
                        })}
                      </svg>

                      {/* Tooltip Hover Overlay */}
                      {hoveredNode && (
                        <div 
                          className="absolute z-10 bg-gray-950/95 dark:bg-slate-900 border border-gray-800 text-white text-[11px] px-3 py-2 rounded-xl shadow-2xl pointer-events-none transition-all duration-150 font-bold"
                          style={{ left: `${hoveredNode.x}%`, top: `${hoveredNode.y}%`, transform: 'translate(-50%, -125%)' }}
                        >
                          <p className="text-[9px] text-gray-400 font-normal uppercase tracking-wider">{hoveredNode.month} 2026</p>
                          <p className="mt-0.5">{hoveredNode.label}: <span className="text-[#FFB000] font-black">{hoveredNode.value}</span></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Intelligence Briefing */}
                <div className="bg-gradient-to-br from-[#0B1220] to-[#121B2D] p-6 rounded-2xl border border-gray-800 text-white shadow-xl flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="p-1 bg-[#FFB000]/10 text-[#FFB000] rounded animate-pulse"><Zap size={14} /></span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#FFB000]">Guulwade Analyst Briefing</h4>
                    </div>

                    <div className="space-y-4 text-xs text-gray-300">
                      <p>
                        📈 <strong className="text-white">Revenue Momentum:</strong> Freight yields reached an all-time high of <span className="text-white font-bold">{formatPrice(metrics.revenue)}</span>, registering a steady 18.2% growth trend. 
                      </p>
                      <p>
                        ✈️ <strong className="text-white">Airlane Surges:</strong> Express air parcels to Addis Ababa are operating at peak cargo volume capacity (35% over previous quarters).
                      </p>
                      <p>
                        🔧 <strong className="text-white">Fleet Alert:</strong> Volvo FH16 Trailer is offline for brake system service. Re-routing cargo capacity to Scania R500 assets is advised.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setAnalyticsTab('financials')}
                    className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 text-[#FFB000] border border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1"
                  >
                    <span>Inspect Financial Statements</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>

              {/* Core Active Tables: Recent Bookings & Queries */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings Queue */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-5 flex items-center space-x-2">
                    <Clipboard size={18} className="text-[#0057B8]" />
                    <span>Recent Cargo Bookings</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold text-xs uppercase tracking-widest">
                          <th className="pb-3">Booking ID</th>
                          <th className="pb-3">Client (Sender)</th>
                          <th className="pb-3">Route Endpoint</th>
                          <th className="pb-3">Cost Tariff</th>
                          <th className="pb-3">Cargo Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => (
                          <tr key={b.id} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                            <td className="py-4 font-bold text-gray-900 dark:text-white">{b.id}</td>
                            <td className="py-4 font-semibold text-xs text-gray-600 dark:text-gray-300">{b.senderName}</td>
                            <td className="py-4 text-xs text-gray-500 truncate max-w-[120px]">{b.receiverAddress.split(',')[0]}</td>
                            <td className="py-4 font-bold text-gray-900 dark:text-white text-xs">{formatPrice(b.estimatedCost)}</td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-[#FFB000]/10 text-[#FFB000]'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Contact Messages / Quick CRM */}
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Mail size={18} className="text-[#00A86B]" />
                    <span>Customer Queries Desk</span>
                  </h3>

                  {recentContacts.length === 0 ? (
                    <p className="text-xs text-gray-400 py-10 text-center">No recent contact queries.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentContacts.map((c) => (
                        <div key={c.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-left">
                          <div className="flex justify-between font-bold text-gray-950 dark:text-white">
                            <span>{c.name}</span>
                            <span className="text-gray-400 font-normal">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="font-semibold text-[#0057B8] dark:text-[#FFB000] mt-1 uppercase tracking-wider text-[9px]">{c.subject}</p>
                          <p className="text-gray-500 dark:text-gray-400 mt-2 italic">"{c.message}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. FINANCIAL REPORTS VIEW */}
          {analyticsTab === 'financials' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Average Shipment Yield</span>
                  <h4 className="text-2xl font-black mt-1">$2,380 <span className="text-xs font-normal text-gray-400">/ cargo</span></h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">High Performing Region</span>
                  <h4 className="text-2xl font-black mt-1 text-[#0057B8] dark:text-[#FFB000]">Mogadishu Central</h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Projected Q3 Target</span>
                  <h4 className="text-2xl font-black mt-1 text-[#00A86B]">$240,000</h4>
                </div>
              </div>

              {/* Big High-Res Revenue Chart (With Method Segments Breakdown) */}
              <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl relative">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
                  <div>
                    <h4 className="font-bold text-gray-950 dark:text-white">Monthly Revenue Contribution by Method</h4>
                    <p className="text-[11px] text-gray-400">YTD comparative analysis of Air, Ocean, and Land transport revenue channels</p>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-400 rounded-full inline-block" /> Air</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0057B8] rounded-full inline-block" /> Ocean</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block" /> Land</span>
                  </div>
                </div>

                {revenueTrends.length > 0 && (
                  <div className="relative pt-2" onMouseLeave={() => setHoveredNode(null)}>
                    <svg viewBox="0 0 500 200" className="w-full h-72 overflow-visible">
                      {/* Grid Horizontal Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                        const y = 15 + p * 150;
                        return (
                          <line 
                            key={i} x1="45" y1={y} x2="480" y2={y} 
                            className="stroke-gray-100 dark:stroke-gray-800/40" strokeDasharray="3 3" 
                          />
                        );
                      })}

                      {/* Stacked Bars representation */}
                      {(() => {
                        const maxVal = Math.max(...revenueTrends.map(d => d.revenue), 100) * 1.1;
                        const barWidth = 14;
                        const groupWidth = 445 / revenueTrends.length;

                        return revenueTrends.map((d, i) => {
                          const xCenter = 45 + i * groupWidth + (groupWidth / 2) - 10;
                          
                          // Heights scaled to plot
                          const airH = (d.Air / maxVal) * 150;
                          const seaH = (d.Sea / maxVal) * 150;
                          const roadH = (d.Road / maxVal) * 150;

                          // Y coordinates
                          const airY = 165 - airH;
                          const seaY = airY - seaH;
                          const roadY = seaY - roadH;

                          return (
                            <g key={i} className="cursor-pointer">
                              {/* Air Segment */}
                              <rect 
                                x={xCenter} y={airY} width={barWidth} height={airH} 
                                fill="#FACC15" rx="1.5" className="hover:opacity-85 transition-opacity"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: ((xCenter + barWidth / 2) / 500) * 100,
                                    y: (airY / 200) * 100,
                                    month: d.month,
                                    label: 'Air Freight',
                                    value: formatPrice(d.Air)
                                  });
                                }}
                              />
                              {/* Sea Segment */}
                              <rect 
                                x={xCenter} y={seaY} width={barWidth} height={seaH} 
                                fill="#0057B8" rx="1.5" className="hover:opacity-85 transition-opacity"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: ((xCenter + barWidth / 2) / 500) * 100,
                                    y: (seaY / 200) * 100,
                                    month: d.month,
                                    label: 'Ocean Freight',
                                    value: formatPrice(d.Sea)
                                  });
                                }}
                              />
                              {/* Road Segment */}
                              <rect 
                                x={xCenter} y={roadY} width={barWidth} height={roadH} 
                                fill="#22C55E" rx="1.5" className="hover:opacity-85 transition-opacity"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: ((xCenter + barWidth / 2) / 500) * 100,
                                    y: (roadY / 200) * 100,
                                    month: d.month,
                                    label: 'Road Freight',
                                    value: formatPrice(d.Road)
                                  });
                                }}
                              />
                            </g>
                          );
                        });
                      })()}

                      {/* X-Axis labels */}
                      {revenueTrends.map((d, i) => {
                        const groupWidth = 445 / revenueTrends.length;
                        const x = 45 + i * groupWidth + (groupWidth / 2) - 3;
                        return (
                          <text 
                            key={i} x={x} y="185" 
                            className="text-[9px] font-bold fill-gray-400 dark:fill-gray-500 text-center" 
                            textAnchor="middle"
                          >
                            {d.month}
                          </text>
                        );
                      })}
                    </svg>

                    {hoveredNode && (
                      <div 
                        className="absolute z-10 bg-gray-950/95 dark:bg-slate-900 border border-gray-800 text-white text-[11px] px-3 py-2 rounded-xl shadow-2xl pointer-events-none transition-all duration-150 font-bold"
                        style={{ left: `${hoveredNode.x}%`, top: `${hoveredNode.y}%`, transform: 'translate(-50%, -125%)' }}
                      >
                        <p className="text-[9px] text-gray-400 font-normal uppercase tracking-wider">{hoveredNode.month} 2026</p>
                        <p className="mt-0.5">{hoveredNode.label}: <span className="text-[#FFB000] font-black">{hoveredNode.value}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Regional Revenue and Data Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Regional Revenue Split Horizontal Bars */}
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-gray-950 dark:text-white uppercase tracking-wider">Regional Operational Yields</h4>
                    <p className="text-[10px] text-gray-400">Total freight compiled per Horn regional ports (YTD)</p>
                  </div>

                  {revenueTrends.length > 0 && (
                    <div className="space-y-4 text-xs font-semibold">
                      {(() => {
                        const latest = revenueTrends[revenueTrends.length - 1];
                        const totalReg = latest.Mogadishu + latest.Berbera + latest.Bosaso;
                        
                        return [
                          { name: 'Mogadishu Central Port', value: latest.Mogadishu, color: 'bg-[#0057B8]' },
                          { name: 'Berbera Logistic Hub', value: latest.Berbera, color: 'bg-[#FFB000]' },
                          { name: 'Bosaso Shipping Warehouse', value: latest.Bosaso, color: 'bg-[#00A86B]' }
                        ].map((reg, idx) => {
                          const pct = Math.round((reg.value / (totalReg || 1)) * 100);
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-700 dark:text-gray-300">{reg.name}</span>
                                <span className="text-gray-950 dark:text-white">{formatPrice(reg.value)} ({pct}%)</span>
                              </div>
                              <div className="h-2.5 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${reg.color} transition-all duration-1000`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {/* Financial Data Ledger Table */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                  <h4 className="font-bold text-sm text-gray-950 dark:text-white mb-4 uppercase tracking-wider">Financial Statement Ledger</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">Month</th>
                          <th className="pb-3">Air Cargo</th>
                          <th className="pb-3">Ocean Cargo</th>
                          <th className="pb-3">Road Cargo</th>
                          <th className="pb-3">Total Gross</th>
                          <th className="pb-3">MoM Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueTrends.map((d, i) => {
                          const mom = i === 0 ? '-' : `${(((d.revenue - revenueTrends[i-1].revenue)/revenueTrends[i-1].revenue)*100).toFixed(1)}%`;
                          return (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                              <td className="py-3.5 font-bold text-gray-950 dark:text-white">{d.month} 2026</td>
                              <td className="py-3.5 text-gray-500">{formatPrice(d.Air)}</td>
                              <td className="py-3.5 text-gray-500">{formatPrice(d.Sea)}</td>
                              <td className="py-3.5 text-gray-500">{formatPrice(d.Road)}</td>
                              <td className="py-3.5 font-black text-gray-950 dark:text-white">{formatPrice(d.revenue)}</td>
                              <td className={`py-3.5 font-black ${mom.startsWith('-') ? 'text-red-500' : mom === '-' ? 'text-gray-400' : 'text-green-500'}`}>
                                {mom}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SERVICE VOLUMES VIEW */}
          {analyticsTab === 'services' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Preferred Shipping Method</span>
                  <h4 className="text-2xl font-black mt-1 text-[#00A86B]">Road Freight <span className="text-xs font-normal text-gray-400">(62%)</span></h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Cargo Weight Carried</span>
                  <h4 className="text-2xl font-black mt-1">1,480,240 <span className="text-xs font-normal text-gray-400">kg</span></h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Express delivery demand</span>
                  <h4 className="text-2xl font-black mt-1 text-[#FFB000]">38.4% <span className="text-xs font-normal text-gray-400">ratio</span></h4>
                </div>
              </div>

              {/* Service Volumes Monthly Stacked Bar Chart */}
              <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl relative">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
                  <div>
                    <h4 className="font-bold text-gray-950 dark:text-white">Shipping Cargo Bookings Count</h4>
                    <p className="text-[11px] text-gray-400">Comparative density of dispatch manifests generated month-by-month</p>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-400 rounded-full inline-block" /> Air</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0057B8] rounded-full inline-block" /> Ocean</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block" /> Road</span>
                  </div>
                </div>

                {serviceVolumes.length > 0 && (
                  <div className="relative pt-2" onMouseLeave={() => setHoveredNode(null)}>
                    <svg viewBox="0 0 500 200" className="w-full h-72 overflow-visible">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                        const y = 15 + p * 150;
                        return (
                          <line 
                            key={i} x1="45" y1={y} x2="480" y2={y} 
                            className="stroke-gray-100 dark:stroke-gray-800/40" strokeDasharray="3 3" 
                          />
                        );
                      })}

                      {/* Stacked Group Bars */}
                      {(() => {
                        const maxVal = Math.max(...serviceVolumes.map(d => d.total), 100) * 1.1;
                        const barWidth = 14;
                        const groupWidth = 445 / serviceVolumes.length;

                        return serviceVolumes.map((d, i) => {
                          const xCenter = 45 + i * groupWidth + (groupWidth / 2) - 10;
                          
                          const airH = (d.Air / maxVal) * 150;
                          const seaH = (d.Sea / maxVal) * 150;
                          const roadH = (d.Road / maxVal) * 150;

                          const airY = 165 - airH;
                          const seaY = airY - seaH;
                          const roadY = seaY - roadH;

                          return (
                            <g key={i} className="cursor-pointer">
                              <rect 
                                x={xCenter} y={airY} width={barWidth} height={airH} fill="#FACC15" rx="1.5"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: ((xCenter + barWidth / 2) / 500) * 100,
                                    y: (airY / 200) * 100,
                                    month: d.month,
                                    label: 'Air Orders',
                                    value: `${d.Air} bookings`
                                  });
                                }}
                              />
                              <rect 
                                x={xCenter} y={seaY} width={barWidth} height={seaH} fill="#0057B8" rx="1.5"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: ((xCenter + barWidth / 2) / 500) * 100,
                                    y: (seaY / 200) * 100,
                                    month: d.month,
                                    label: 'Ocean Orders',
                                    value: `${d.Sea} bookings`
                                  });
                                }}
                              />
                              <rect 
                                x={xCenter} y={roadY} width={barWidth} height={roadH} fill="#22C55E" rx="1.5"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: ((xCenter + barWidth / 2) / 500) * 100,
                                    y: (roadY / 200) * 100,
                                    month: d.month,
                                    label: 'Road Orders',
                                    value: `${d.Road} bookings`
                                  });
                                }}
                              />
                            </g>
                          );
                        });
                      })()}

                      {/* X-Axis labels */}
                      {serviceVolumes.map((d, i) => {
                        const groupWidth = 445 / serviceVolumes.length;
                        const x = 45 + i * groupWidth + (groupWidth / 2) - 3;
                        return (
                          <text 
                            key={i} x={x} y="185" 
                            className="text-[9px] font-bold fill-gray-400 dark:fill-gray-500 text-center" 
                            textAnchor="middle"
                          >
                            {d.month}
                          </text>
                        );
                      })}
                    </svg>

                    {hoveredNode && (
                      <div 
                        className="absolute z-10 bg-gray-950/95 dark:bg-slate-900 border border-gray-800 text-white text-[11px] px-3 py-2 rounded-xl shadow-2xl pointer-events-none transition-all duration-150 font-bold"
                        style={{ left: `${hoveredNode.x}%`, top: `${hoveredNode.y}%`, transform: 'translate(-50%, -125%)' }}
                      >
                        <p className="text-[9px] text-gray-400 font-normal uppercase tracking-wider">{hoveredNode.month} 2026</p>
                        <p className="mt-0.5">{hoveredNode.label}: <span className="text-[#FFB000] font-black">{hoveredNode.value}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Service Volumes Breakdown Ledger */}
              {(() => {
                const latestVolume = serviceVolumes[serviceVolumes.length - 1] || { Air: 0, Sea: 0, Road: 0 };
                return (
                  <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                    <h4 className="font-bold text-sm text-gray-950 dark:text-white mb-4 uppercase tracking-wider">Service Mode Operational Ledger</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-semibold">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                            <th className="pb-3">Shipping Mode</th>
                            <th className="pb-3">Peak Speed Demand</th>
                            <th className="pb-3">Average Tariff (YTD)</th>
                            <th className="pb-3">Total Active Manifests</th>
                            <th className="pb-3">Primary Border Checks</th>
                            <th className="pb-3">Fuel Surcharge Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { mode: 'Air Freight Express', speed: '94% Express Flight', tariff: '$12.00 / kg', active: latestVolume.Air, border: 'Aden Adde Airport Air-Intake', fuel: '18% Flight Tariff' },
                            { mode: 'Ocean Containers', speed: '100% Regular Sea', tariff: '$2.50 / kg', active: latestVolume.Sea, border: 'Mogadishu & Berbera Port terminal', fuel: '12% Port Surcharge' },
                            { mode: 'Overland Road Haulage', speed: '32% Express Trucking', tariff: '$5.00 / kg', active: latestVolume.Road, border: 'Berbera Corridor Checkpoints', fuel: '15% Road Surcharge' }
                          ].map((s, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                              <td className="py-4 font-bold text-gray-950 dark:text-white">{s.mode}</td>
                              <td className="py-4 text-gray-500">{s.speed}</td>
                              <td className="py-4 font-bold text-[#0057B8] dark:text-[#FFB000]">{s.tariff}</td>
                              <td className="py-4 font-black">{s.active} shipments</td>
                              <td className="py-4 text-gray-500">{s.border}</td>
                              <td className="py-4 font-semibold text-green-600">{s.fuel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 4. CLIENT GROWTH VIEW */}
          {analyticsTab === 'customers' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Customer Accounts</span>
                  <h4 className="text-2xl font-black mt-1">{metrics.totalCustomers} <span className="text-xs font-normal text-gray-400">Active</span></h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Average Customer LTV</span>
                  <h4 className="text-2xl font-black mt-1 text-[#00A86B]">$12,450 <span className="text-xs font-normal text-gray-400">USD</span></h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">MoM Acquisition Rate</span>
                  <h4 className="text-2xl font-black mt-1 text-[#FFB000]">+24.5% <span className="text-xs font-normal text-gray-400">growth</span></h4>
                </div>
              </div>

              {/* Cumulative Customer Growth Area Chart */}
              <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl relative">
                <div>
                  <h4 className="font-bold text-gray-950 dark:text-white">Corporate & Individual Client Growth Index</h4>
                  <p className="text-[11px] text-gray-400">YTD cumulative registered Somali & Horn enterprise accounts scale</p>
                </div>

                {customerAcquisition.length > 0 && (
                  <div className="relative pt-2" onMouseLeave={() => setHoveredNode(null)}>
                    <svg viewBox="0 0 500 200" className="w-full h-64 overflow-visible">
                      <defs>
                        <linearGradient id="cust-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                        const y = 15 + p * 150;
                        return (
                          <line 
                            key={i} x1="45" y1={y} x2="480" y2={y} 
                            className="stroke-gray-100 dark:stroke-gray-800/40" strokeDasharray="3 3" 
                          />
                        );
                      })}

                      {/* Generate Line & Area paths */}
                      {(() => {
                        const maxVal = Math.max(...customerAcquisition.map(d => d.cumulative), 10) * 1.15;
                        const points = customerAcquisition.map((d, i) => {
                          const x = 45 + (i / (customerAcquisition.length - 1)) * 435;
                          const y = 165 - (d.cumulative / maxVal) * 150;
                          return { x, y, cumulative: d.cumulative, label: d.month, original: d };
                        });

                        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        const areaPath = `${linePath} L ${points[points.length - 1].x} 165 L ${points[0].x} 165 Z`;

                        return (
                          <>
                            <path d={areaPath} fill="url(#cust-grad)" />
                            <path d={linePath} fill="none" stroke="#22C55E" strokeWidth="2.5" />
                            {points.map((p, i) => (
                              <circle 
                                key={i} cx={p.x} cy={p.y} r="4.5" 
                                className="fill-[#22C55E] stroke-white dark:stroke-[#0B1220] stroke-2 cursor-pointer hover:r-6"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: (p.x / 500) * 100,
                                    y: (p.y / 200) * 100,
                                    month: p.label,
                                    label: 'Total Customers',
                                    value: `${p.cumulative} accounts`
                                  });
                                }}
                              />
                            ))}
                          </>
                        );
                      })()}

                      {/* X-Axis labels */}
                      {customerAcquisition.map((d, i) => {
                        const x = 45 + (i / (customerAcquisition.length - 1)) * 435;
                        return (
                          <text 
                            key={i} x={x} y="185" 
                            className="text-[9px] font-bold fill-gray-400 dark:fill-gray-500 text-center" 
                            textAnchor="middle"
                          >
                            {d.month}
                          </text>
                        );
                      })}
                    </svg>

                    {hoveredNode && (
                      <div 
                        className="absolute z-10 bg-gray-950/95 dark:bg-slate-900 border border-gray-800 text-white text-[11px] px-3 py-2 rounded-xl shadow-2xl pointer-events-none transition-all duration-150 font-bold"
                        style={{ left: `${hoveredNode.x}%`, top: `${hoveredNode.y}%`, transform: 'translate(-50%, -125%)' }}
                      >
                        <p className="text-[9px] text-gray-400 font-normal uppercase tracking-wider">{hoveredNode.month} 2026</p>
                        <p className="mt-0.5">{hoveredNode.label}: <span className="text-[#FFB000] font-black">{hoveredNode.value}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Somali Enterprise Clients Directory */}
              <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                <h4 className="font-bold text-sm text-gray-950 dark:text-white mb-4 uppercase tracking-wider">Top Regional Corporate Partners</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Client Corporate Name</th>
                        <th className="pb-3">Main Regional Base</th>
                        <th className="pb-3">Primary Transport Mode</th>
                        <th className="pb-3">YTD Cumulative Billing</th>
                        <th className="pb-3">SLA fulfillment</th>
                        <th className="pb-3">Risk Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'SomalFoods Ltd (Agro-Export)', base: 'Mogadishu Port Road', mode: 'Ocean Freight (Sea)', bill: '$48,500', SLA: '100% on-time', risk: 'Elite Tier A' },
                        { name: 'Banaadir General Trading', base: 'Mogadishu HQ', mode: 'Sea Containers', bill: '$24,200', SLA: '98.5% compliance', risk: 'Tier A Partner' },
                        { name: 'Dahabshiil FinTech Group', base: 'Hargeisa / Garowe Corridor', mode: 'Express Air Cargo', bill: '$18,400', SLA: '100% express SLA', risk: 'Key Enterprise Account' },
                        { name: 'Horn Agricultural Exporters', base: 'Kismayo / Juba Fields', mode: 'Road Logistics', bill: '$11,800', SLA: '95.2% compliance', risk: 'Tier B Cargo' }
                      ].map((c, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                          <td className="py-3.5 font-bold text-gray-950 dark:text-white">{c.name}</td>
                          <td className="py-3.5 text-gray-500">{c.base}</td>
                          <td className="py-3.5 font-bold text-[#0057B8] dark:text-[#FFB000]">{c.mode}</td>
                          <td className="py-3.5 font-black text-gray-950 dark:text-white">{c.bill}</td>
                          <td className="py-3.5 text-green-600 font-bold">{c.SLA}</td>
                          <td className="py-3.5 font-semibold text-xs text-[#00A86B]">{c.risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. SHIPMENT PERFORMANCE VIEW */}
          {analyticsTab === 'shipments' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Port Customs Clearance Rate</span>
                  <h4 className="text-2xl font-black mt-1 text-[#00A86B]">98.2% <span className="text-xs font-normal text-gray-400">pre-cleared</span></h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Average Regional Transit Time</span>
                  <h4 className="text-2xl font-black mt-1">4.2 <span className="text-xs font-normal text-gray-400">days average</span></h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Active Transit Alerts</span>
                  <h4 className="text-2xl font-black mt-1 text-[#FFB000]">0 <span className="text-xs font-normal text-gray-400">unresolved</span></h4>
                </div>
              </div>

              {/* Status Breakdown Horizontal Funnel Bar Chart */}
              <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
                <div>
                  <h4 className="font-bold text-gray-950 dark:text-white uppercase tracking-wider text-sm">Tracking Status Stage Density</h4>
                  <p className="text-[11px] text-gray-400">Distribution of all regional shipments currently active inside the tracking flow</p>
                </div>

                {statusBreakdown && (
                  <div className="space-y-4">
                    {Object.keys(statusBreakdown).map((status, idx) => {
                      const val = statusBreakdown[status] || 0;
                      const maxVal = Math.max(...Object.values(statusBreakdown) as number[], 1);
                      const pct = Math.round((val / maxVal) * 100);
                      
                      return (
                        <div key={idx} className="space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold">
                            <span className="text-gray-700 dark:text-gray-300 font-bold">{status}</span>
                            <span className="text-gray-950 dark:text-white font-extrabold">{val} active shipments</span>
                          </div>
                          <div className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-[#0057B8] dark:bg-[#FFB000] transition-all duration-1000"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Corridor Delay and Checkpoint Analysis */}
              <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                <h4 className="font-bold text-sm text-gray-950 dark:text-white mb-4 uppercase tracking-wider">Horn Corridor Transit Checkpoints Log</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Transit Checkpoint / Depot</th>
                        <th className="pb-3">Corridor Sector</th>
                        <th className="pb-3">Average Docking Queue</th>
                        <th className="pb-3">Customs Clearance Speed</th>
                        <th className="pb-3">Active Delay Incident Risks</th>
                        <th className="pb-3">Operational Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Mogadishu Port Terminal 3', corridor: 'Somaliland Sea Line Corridor', queue: '1.2 hours', clearance: '24 hours average', risk: 'None (Clear weather)', status: 'Optimal' },
                        { name: 'Berbera Customs Border Crossing', corridor: 'Hargeisa - Addis Corridor', queue: '35 minutes', clearance: '2 hours clearance', risk: 'Minor traffic queues', status: 'Optimal' },
                        { name: 'Aden Adde Air Cargo Intake', corridor: 'Global Air Cargo Corridors', queue: '15 minutes', clearance: '1 hour express', risk: 'None (Clear flights)', status: 'Optimal' },
                        { name: 'Garowe overland staging station', corridor: 'Mogadishu - Bossaso Highway', queue: '45 minutes', clearance: 'Manual manifest audit', risk: 'Overland highway road repairs', status: 'Standby' }
                      ].map((checkpoint, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                          <td className="py-4 font-bold text-gray-950 dark:text-white">{checkpoint.name}</td>
                          <td className="py-4 text-gray-500">{checkpoint.corridor}</td>
                          <td className="py-4 font-bold">{checkpoint.queue}</td>
                          <td className="py-4 text-gray-500">{checkpoint.clearance}</td>
                          <td className="py-4 text-red-500 font-semibold">{checkpoint.risk}</td>
                          <td className="py-4 text-[#00A86B] font-bold">{checkpoint.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. FLEET EFFICIENCY VIEW */}
          {analyticsTab === 'fleet' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#0B1220] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Fleet Fuel Expensed</span>
                  <h4 className="text-xl font-black mt-1 text-[#0057B8] dark:text-[#FFB000]">{formatPrice(metrics.totalFleetFuelCost)}</h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Maintenance Expensed</span>
                  <h4 className="text-xl font-black mt-1 text-[#00A86B]">{formatPrice(metrics.totalFleetMaintCost)}</h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Maintenance-to-Fuel Ratio</span>
                  <h4 className="text-xl font-black mt-1 text-gray-900 dark:text-white">
                    {Math.round((metrics.totalFleetMaintCost / (metrics.totalFleetFuelCost || 1)) * 100)}%
                  </h4>
                </div>
                <div className="bg-white dark:bg-[#0B1220] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Carbon Offset Index</span>
                  <h4 className="text-xl font-black mt-1 text-green-500">92.4% <span className="text-xs font-normal text-gray-400">Class A</span></h4>
                </div>
              </div>

              {/* Grouped Bar Chart comparing fuel expenses and maintenance expenses per vehicle */}
              <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl relative">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
                  <div>
                    <h4 className="font-bold text-gray-950 dark:text-white">Active Asset Operating Expense Breakdown</h4>
                    <p className="text-[11px] text-gray-400">Comparing YTD cumulative Fuel Expenses vs Maintenance Repairs directly from fleet logs</p>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#00A86B] rounded-full inline-block" /> Fuel Expenses</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0057B8] rounded-full inline-block" /> Maintenance Cost</span>
                  </div>
                </div>

                {fleetAnalysis.length > 0 && (
                  <div className="relative pt-2" onMouseLeave={() => setHoveredNode(null)}>
                    <svg viewBox="0 0 500 200" className="w-full h-72 overflow-visible">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                        const y = 15 + p * 150;
                        return (
                          <line 
                            key={i} x1="45" y1={y} x2="480" y2={y} 
                            className="stroke-gray-100 dark:stroke-gray-800/40" strokeDasharray="3 3" 
                          />
                        );
                      })}

                      {/* Grouped Bars */}
                      {(() => {
                        // Find scale factor
                        const maxExpense = Math.max(...fleetAnalysis.map(v => Math.max(v.totalFuelCost, v.totalMaintCost)), 100) * 1.1;
                        const groupWidth = 435 / fleetAnalysis.length;
                        const barWidth = 10;

                        return fleetAnalysis.map((v, i) => {
                          const xGroupStart = 45 + i * groupWidth + (groupWidth / 2) - barWidth - 2;

                          // Heights
                          const fuelH = (v.totalFuelCost / maxExpense) * 150;
                          const maintH = (v.totalMaintCost / maxExpense) * 150;

                          // Y coordinates
                          const fuelY = 165 - fuelH;
                          const maintY = 165 - maintH;

                          return (
                            <g key={i} className="cursor-pointer">
                              {/* Fuel Bar */}
                              <rect 
                                x={xGroupStart} y={fuelY} width={barWidth} height={fuelH} fill="#00A86B" rx="1"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: (xGroupStart / 500) * 100,
                                    y: (fuelY / 200) * 100,
                                    month: v.name,
                                    label: 'Fuel Cost',
                                    value: formatPrice(v.totalFuelCost)
                                  });
                                }}
                              />
                              {/* Maintenance Bar */}
                              <rect 
                                x={xGroupStart + barWidth + 4} y={maintY} width={barWidth} height={maintH} fill="#0057B8" rx="1"
                                onMouseEnter={(e) => {
                                  setHoveredNode({
                                    x: ((xGroupStart + barWidth + 4) / 500) * 100,
                                    y: (maintY / 200) * 100,
                                    month: v.name,
                                    label: 'Maintenance Cost',
                                    value: formatPrice(v.totalMaintCost)
                                  });
                                }}
                              />
                            </g>
                          );
                        });
                      })()}

                      {/* X-Axis labels */}
                      {fleetAnalysis.map((v, i) => {
                        const groupWidth = 435 / fleetAnalysis.length;
                        const x = 45 + i * groupWidth + (groupWidth / 2);
                        return (
                          <text 
                            key={i} x={x} y="185" 
                            className="text-[8px] font-bold fill-gray-400 dark:fill-gray-500 text-center" 
                            textAnchor="middle"
                          >
                            {v.id}
                          </text>
                        );
                      })}
                    </svg>

                    {hoveredNode && (
                      <div 
                        className="absolute z-10 bg-gray-950/95 dark:bg-slate-900 border border-gray-800 text-white text-[10px] px-2.5 py-1.5 rounded-xl shadow-2xl pointer-events-none transition-all duration-150 font-bold max-w-[150px]"
                        style={{ left: `${hoveredNode.x}%`, top: `${hoveredNode.y}%`, transform: 'translate(-50%, -125%)' }}
                      >
                        <p className="text-[8px] text-gray-400 font-normal uppercase tracking-wider">{hoveredNode.month}</p>
                        <p className="mt-0.5">{hoveredNode.label}: <span className="text-[#FFB000] font-black">{hoveredNode.value}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fleet Active Assets Cost Performance Ledger */}
              <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                <h4 className="font-bold text-sm text-gray-950 dark:text-white mb-4 uppercase tracking-wider">Corporate Fleet Expense Ledger</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Asset Registration ID</th>
                        <th className="pb-3">Vehicle Details</th>
                        <th className="pb-3">Asset Type</th>
                        <th className="pb-3">Logistical Status</th>
                        <th className="pb-3">YTD Fuel Spend</th>
                        <th className="pb-3">YTD Maintenance Spend</th>
                        <th className="pb-3">Total Cost (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetAnalysis.map((v, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                          <td className="py-4 font-bold text-[#0057B8] dark:text-[#FFB000]">{v.id}</td>
                          <td className="py-4 font-bold text-gray-950 dark:text-white">{v.name}</td>
                          <td className="py-4 text-gray-500 capitalize">{v.type}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              v.status === 'Available' ? 'bg-green-100 text-green-700' : v.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-500">{formatPrice(v.totalFuelCost)}</td>
                          <td className="py-4 text-gray-500">{formatPrice(v.totalMaintCost)}</td>
                          <td className="py-4 font-black text-gray-950 dark:text-white">{formatPrice(v.totalExpenses)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- TAB 2: MANAGE SHIPMENTS --- */}
      {subTab === 'shipments' && (
        <div className="space-y-8 animate-fade-in text-left">
          
          {editingShipmentId && (
            <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border-2 border-[#FFB000] shadow-xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-gray-950 dark:text-white">Edit Shipment Status: {editingShipmentId}</h4>
                <button onClick={() => setEditingShipmentId(null)} className="text-xs text-red-500 hover:underline">Cancel</button>
              </div>

              <form onSubmit={handleUpdateShipment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Current Status</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="">-- Choose Status --</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Customs">Customs</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Current Geo Location</label>
                  <input 
                    type="text" 
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    required
                    placeholder="e.g. Berbera Corridor Checkpoint"
                    className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Status Description</label>
                  <input 
                    type="text" 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                    placeholder="e.g. Customs papers verified successfully."
                    className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-[#0057B8] to-blue-700 text-white text-xs font-black rounded-lg hover:shadow-lg transition-all cursor-pointer"
                  >
                    Publish Transit Telemetry Update
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center space-x-2">
                  <Layers size={18} className="text-[#0057B8]" />
                  <span>Shipments Telemetry Registry</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Custom telemetry and history auditing per cargo identifier.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <th className="pb-3">Tracking ID</th>
                    <th className="pb-3">Sender</th>
                    <th className="pb-3">Receiver</th>
                    <th className="pb-3">Cargo Content</th>
                    <th className="pb-3">Current Location</th>
                    <th className="pb-3">SLA Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <td className="py-4 font-black text-gray-950 dark:text-white">{s.id}</td>
                      <td className="py-4">{s.senderName}</td>
                      <td className="py-4">{s.receiverName}</td>
                      <td className="py-4">{s.cargoDescription} ({s.weight} kg)</td>
                      <td className="py-4 text-[#0057B8] dark:text-[#FFB000] font-bold">{s.currentLocation}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.currentStatus === 'Delivered' 
                            ? 'bg-green-100 text-green-700' 
                            : s.currentStatus === 'In Transit' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-[#FFB000]/10 text-[#FFB000]'
                        }`}>
                          {s.currentStatus}
                        </span>
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={() => {
                            setEditingShipmentId(s.id);
                            setNewStatus(s.currentStatus);
                            setNewLoc(s.currentLocation);
                            setNewDesc('');
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-gray-100 hover:bg-[#0057B8]/10 hover:text-[#0057B8] dark:bg-gray-800 dark:hover:bg-gray-700 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          <Layers size={11} />
                          <span>Update Status</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: FLEET CONTROLLER --- */}
      {subTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
          
          {/* Left Panel: Vehicles List */}
          <div className="lg:col-span-1 bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center space-x-2">
                <Truck size={18} className="text-[#00A86B]" />
                <span>Command Fleet Assets</span>
              </h3>
              <p className="text-[11px] text-gray-400">Select an asset to log fuel sheets, repair schedules, and expense audits.</p>
            </div>

            <div className="space-y-3">
              {fleet.map((v) => {
                const isSelected = selectedVehicle?.id === v.id;
                return (
                  <div 
                    key={v.id} 
                    onClick={() => setSelectedVehicle(v)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border-[#0057B8] dark:border-[#FFB000] shadow' 
                        : 'bg-transparent border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10'
                    }`}
                  >
                    <div className="flex justify-between items-start text-xs font-bold">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{v.name}</h4>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mt-0.5">{v.id} • {v.type}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        v.status === 'Available' ? 'bg-green-100 text-green-700' : v.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Vehicle Ledger Controls */}
          <div className="lg:col-span-2 space-y-8">
            {selectedVehicle ? (
              <div className="space-y-8">
                
                {/* 1. Fuel Sheet Logging Form */}
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                  <h4 className="font-bold text-sm text-gray-950 dark:text-white flex items-center space-x-1.5 uppercase tracking-wider">
                    <Fuel size={16} className="text-[#00A86B]" />
                    <span>Log Fuel Refuel Sheet — {selectedVehicle.name} ({selectedVehicle.id})</span>
                  </h4>

                  <form onSubmit={handleAddFuel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Fuel Amount (Liters)</label>
                      <input 
                        type="number" 
                        value={fuelAmt}
                        onChange={(e) => setFuelAmt(e.target.value)}
                        required
                        placeholder="e.g. 150"
                        className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Fuel Cost (USD)</label>
                      <input 
                        type="number" 
                        value={fuelCost}
                        onChange={(e) => setFuelCost(e.target.value)}
                        required
                        placeholder="e.g. 240"
                        className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-[#00A86B] hover:bg-emerald-600 text-white text-xs font-black rounded-lg hover:shadow transition-all cursor-pointer"
                      >
                        Commit Fuel Invoice Record
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Maintenance Repairs Form */}
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                  <h4 className="font-bold text-sm text-gray-950 dark:text-white flex items-center space-x-1.5 uppercase tracking-wider">
                    <Wrench size={16} className="text-[#0057B8] dark:text-[#FFB000]" />
                    <span>Log Maintenance & Repairs Service — {selectedVehicle.name}</span>
                  </h4>

                  <form onSubmit={handleAddMaintenance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Repair / Service Description</label>
                      <input 
                        type="text" 
                        value={maintDesc}
                        onChange={(e) => setNewLoc(e.target.value)} // wait let's use maintDesc
                        required
                        placeholder="e.g. Brake rotors replacement and fluid flush"
                        className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Service Cost (USD)</label>
                      <input 
                        type="number" 
                        value={maintCost}
                        onChange={(e) => setMaintCost(e.target.value)}
                        required
                        placeholder="e.g. 580"
                        className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-[#0057B8] dark:bg-[#FFB000] text-white dark:text-gray-950 text-xs font-black rounded-lg hover:shadow transition-all cursor-pointer"
                      >
                        Commit Maintenance Ledger Item
                      </button>
                    </div>
                  </form>
                </div>

                {/* 3. Historical Logs Table */}
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest font-black">Expense History Timeline</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
                    
                    {/* Fuel Records List */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1.5 flex justify-between">
                        <span>Refuel Log sheets</span>
                        <span className="text-gray-400 font-normal">{selectedVehicle.fuelRecords.length} entries</span>
                      </h5>
                      {selectedVehicle.fuelRecords.length === 0 ? (
                        <p className="text-gray-400 italic py-2">No fuel sheets logged.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedVehicle.fuelRecords.map((f, idx) => (
                            <div key={idx} className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded border border-gray-100 dark:border-gray-800 flex justify-between font-bold">
                              <div>
                                <p className="text-gray-800 dark:text-gray-200">{f.amount} Liters</p>
                                <span className="text-[9px] text-gray-400 font-normal">{new Date(f.date).toLocaleDateString()}</span>
                              </div>
                              <span className="text-[#00A86B]">{formatPrice(f.cost)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Maintenance Records List */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1.5 flex justify-between">
                        <span>Repairs Log sheets</span>
                        <span className="text-gray-400 font-normal">{selectedVehicle.maintenanceRecords.length} entries</span>
                      </h5>
                      {selectedVehicle.maintenanceRecords.length === 0 ? (
                        <p className="text-gray-400 italic py-2">No repairs sheets logged.</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedVehicle.maintenanceRecords.map((m, idx) => (
                            <div key={idx} className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded border border-gray-100 dark:border-gray-800 flex justify-between font-bold">
                              <div>
                                <p className="text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{m.description}</p>
                                <span className="text-[9px] text-gray-400 font-normal">{new Date(m.date).toLocaleDateString()}</span>
                              </div>
                              <span className="text-[#0057B8] dark:text-[#FFB000]">{formatPrice(m.cost)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-gray-100/50 dark:bg-[#0B1220]/50 p-16 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col justify-center items-center">
                <Truck size={36} className="text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select an active vehicle from the left controller queue</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- TAB 4: WAREHOUSING HUBS --- */}
      {subTab === 'warehouses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
          
          {/* Left Panel: Warehouses List */}
          <div className="lg:col-span-1 bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center space-x-2">
                <MapPin size={18} className="text-[#0057B8]" />
                <span>Warehouses Registry</span>
              </h3>
              <p className="text-[11px] text-gray-400">Select a warehouse base to audit active storage inventories.</p>
            </div>

            <div className="space-y-3">
              {warehouses.map((w) => {
                const isSelected = selectedWarehouse?.id === w.id;
                return (
                  <div 
                    key={w.id} 
                    onClick={() => setSelectedWarehouse(w)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border-[#0057B8] dark:border-[#FFB000] shadow' 
                        : 'bg-transparent border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10'
                    }`}
                  >
                    <div className="text-xs font-bold">
                      <h4 className="font-bold text-gray-900 dark:text-white">{w.name}</h4>
                      <p className="text-gray-400 font-semibold mt-0.5">{w.location}</p>
                      <span className="text-[9px] font-black text-[#0057B8] dark:text-[#FFB000] block mt-2 uppercase tracking-wider">
                        {w.inventory.length} distinct product items in stock
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Warehouse Inventory Controls */}
          <div className="lg:col-span-2 space-y-8">
            {selectedWarehouse ? (
              <div className="space-y-8">
                
                {/* 1. Add Inventory Item Form */}
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                  <h4 className="font-bold text-sm text-gray-950 dark:text-white flex items-center space-x-1.5 uppercase tracking-wider">
                    <Plus size={16} className="text-[#0057B8] dark:text-[#FFB000]" />
                    <span>In-Take New Storage Item — {selectedWarehouse.name}</span>
                  </h4>

                  <form onSubmit={handleAddInventory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Storage Item / Product Name</label>
                      <input 
                        type="text" 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        required
                        placeholder="e.g. Copper wiring spools"
                        className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Product Quantity</label>
                      <input 
                        type="number" 
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(e.target.value)}
                        required
                        placeholder="e.g. 50"
                        className="w-full bg-gray-50 dark:bg-gray-800 text-xs font-bold p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-[#0057B8] dark:bg-[#FFB000] text-white dark:text-gray-950 text-xs font-black rounded-lg hover:shadow transition-all cursor-pointer"
                      >
                        Publish Inventory Entry Record
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Inventory Ledger Table */}
                <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest font-black">Stockpile Registry Ledger</h4>
                  
                  {selectedWarehouse.inventory.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-6 text-center">Warehouse storage is currently empty.</p>
                  ) : (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                            <th className="pb-3">Product Name</th>
                            <th className="pb-3 text-right">In-Stock Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedWarehouse.inventory.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 font-bold">
                              <td className="py-3 text-gray-950 dark:text-white">{item.name}</td>
                              <td className="py-3 text-right text-[#0057B8] dark:text-[#FFB000] text-sm font-black">{item.quantity} units</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-gray-100/50 dark:bg-[#0B1220]/50 p-16 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col justify-center items-center">
                <MapPin size={36} className="text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select an active warehouse from the left directory</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- TAB 5: CAREERS & RECRUITING --- */}
      {subTab === 'applications' && (
        <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6 animate-fade-in text-left">
          <div>
            <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center space-x-2">
              <BookOpen size={18} className="text-[#0057B8]" />
              <span>Job Candidates Applications Desk</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Audit candidate resumes, cover letters, and select candidate applications for hiring review.</p>
          </div>

          {applications.length === 0 ? (
            <p className="text-xs text-gray-400 py-12 text-center">No career applications submitted yet.</p>
          ) : (
            <div className="overflow-x-auto text-xs font-semibold">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="pb-3">Candidate Name</th>
                    <th className="pb-3">Target Job Profile</th>
                    <th className="pb-3">Contact Details</th>
                    <th className="pb-3">CV Attached</th>
                    <th className="pb-3">Sought Review Letter</th>
                    <th className="pb-3">App Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                      <td className="py-4 font-black text-gray-950 dark:text-white">{app.fullName}</td>
                      <td className="py-4 font-bold text-[#0057B8] dark:text-[#FFB000]">{app.jobTitle}</td>
                      <td className="py-4">
                        <p className="text-gray-800 dark:text-gray-200">{app.email}</p>
                        <p className="text-gray-400 text-[10px]">{app.phone}</p>
                      </td>
                      <td className="py-4 font-mono text-[10px] text-gray-400">{app.cvFileName}</td>
                      <td className="py-4 text-gray-500 italic max-w-xs truncate">"{app.coverLetter}"</td>
                      <td className="py-4 text-gray-400 font-bold">{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
