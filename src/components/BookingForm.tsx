import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { useCurrency } from './CurrencyContext.tsx';
import { 
  Plus, Plane, Ship, Truck, Calendar, ShieldCheck, 
  Sparkles, DollarSign, ArrowRight, CheckCircle2, 
  Printer, QrCode, Clipboard, AlertCircle 
} from 'lucide-react';

interface BookingFormProps {
  currentUser: any;
  onBookingSuccess: (newBooking: any, newShipment: any) => void;
}

export default function BookingForm({ currentUser, onBookingSuccess }: BookingFormProps) {
  const { t } = useLanguage();
  const { currency, formatPrice } = useCurrency();

  // Form Fields
  const [senderName, setSenderName] = useState(currentUser?.name || '');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [weight, setWeight] = useState(1);
  const [dimensions, setDimensions] = useState('30x30x30 cm');
  const [shippingMethod, setShippingMethod] = useState<'Air' | 'Sea' | 'Road'>('Air');
  const [shippingSpeed, setShippingSpeed] = useState<'Express' | 'Regular'>('Regular');
  const [insurance, setInsurance] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Coupon State
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');

  // Cost estimate & tracking
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // Multi-step layout

  // Result state
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [createdShipment, setCreatedShipment] = useState<any>(null);

  // Live price calculations
  const calculateCost = () => {
    let baseRate = 5; // Road
    if (shippingMethod === 'Air') baseRate = 12;
    else if (shippingMethod === 'Sea') baseRate = 2.5;

    let multiplier = shippingSpeed === 'Express' ? 1.5 : 1.0;
    let baseCost = Math.round(Number(weight) * baseRate * multiplier);
    
    // Insurance
    if (insurance) {
      baseCost += 50;
    }

    // Coupon Discount
    if (discountPercent > 0) {
      baseCost = Math.round(baseCost * (1 - discountPercent / 100));
    }

    setEstimatedCost(baseCost < 20 ? 20 : baseCost);
  };

  useEffect(() => {
    calculateCost();
  }, [weight, shippingMethod, shippingSpeed, insurance, discountPercent]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const c = coupon.trim().toUpperCase();
    if (c === 'GUULWADE10') {
      setDiscountPercent(10);
      setAppliedCoupon('GUULWADE10');
      setCoupon('');
    } else if (c === 'SOMALIA2026') {
      setDiscountPercent(15);
      setAppliedCoupon('SOMALIA2026');
      setCoupon('');
    } else if (c === 'HORNFREE') {
      setDiscountPercent(100); // Admin free testing coupon
      setAppliedCoupon('HORNFREE');
      setCoupon('');
    } else {
      setCouponError('Invalid coupon code. Try "GUULWADE10" or "SOMALIA2026"');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderPhone,
          senderAddress,
          receiverName,
          receiverPhone,
          receiverAddress,
          weight,
          dimensions,
          shippingMethod,
          shippingSpeed,
          insurance,
          specialInstructions,
          pickupDate,
          currency: 'USD'
        })
      });

      if (!response.ok) throw new Error('Booking registration failed.');

      const data = await response.json();
      setCreatedBooking(data.booking);
      setCreatedShipment(data.shipment);
      onBookingSuccess(data.booking, data.shipment);
      setStep(4); // Show success invoice page
    } catch (err: any) {
      alert(err.message || 'Error creating booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Steps Indicator */}
      {step < 4 && (
        <div className="flex justify-between items-center mb-10 max-w-lg mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center space-x-2">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === s 
                    ? 'bg-[#0057B8] text-white ring-4 ring-[#0057B8]/20' 
                    : step > s 
                      ? 'bg-[#00A86B] text-white' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              <span className={`text-xs font-semibold ${step === s ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {s === 1 ? 'Sender & Receiver' : s === 2 ? 'Cargo Specs' : 'Confirm Order'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden text-left">
        
        {step < 4 && (
          <form onSubmit={handleBookingSubmit}>
            {/* STEP 1: Sender & Receiver Details */}
            {step === 1 && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Sender & Receiver Addresses</h3>
                  <p className="text-xs text-gray-500">Provide sender contact details and full destination shipping address.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Sender */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#0057B8] dark:text-[#FFB000]">Sender details (Origin)</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Sender Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={senderName} 
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Dr. Warsame Elmi"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required 
                        value={senderPhone} 
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="+252 61..."
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Pickup Facility Address *</label>
                      <input 
                        type="text" 
                        required 
                        value={senderAddress} 
                        onChange={(e) => setSenderAddress(e.target.value)}
                        placeholder="Mogadishu, Somalia (e.g., Wadajir, Hodan, Port Rd)"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                      />
                    </div>
                  </div>

                  {/* Receiver */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#00A86B]">Receiver details (Destination)</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Receiver Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={receiverName} 
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="e.g. Suez Trading Co."
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required 
                        value={receiverPhone} 
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="+251 11..."
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Destination Shipping Address *</label>
                      <input 
                        type="text" 
                        required 
                        value={receiverAddress} 
                        onChange={(e) => setReceiverAddress(e.target.value)}
                        placeholder="e.g. Bole, Addis Ababa, Ethiopia / Suez Egypt"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (senderName && senderPhone && senderAddress && receiverName && receiverPhone && receiverAddress) {
                        setStep(2);
                      } else {
                        alert('Please fill out all required fields marked with *');
                      }
                    }}
                    className="px-6 py-3 bg-[#0057B8] text-white font-bold rounded-xl flex items-center space-x-2 hover:bg-[#00479b] cursor-pointer"
                  >
                    <span>Continue to Cargo specs</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Cargo Specs & Mode */}
            {step === 2 && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Cargo Weight & Logistics Selection</h3>
                  <p className="text-xs text-gray-500">Pick transit modes and cargo volume. Live estimated pricing updates below.</p>
                </div>

                {/* Shipping Method Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">Shipping Mode</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'Air', label: t('serviceAirCargo'), icon: <Plane size={20} />, activeColor: 'border-[#0057B8] bg-[#0057B8]/5' },
                      { id: 'Sea', label: t('serviceSeaFreight'), icon: <Ship size={20} />, activeColor: 'border-[#00A86B] bg-[#00A86B]/5' },
                      { id: 'Road', label: t('serviceLocalTrans'), icon: <Truck size={20} />, activeColor: 'border-[#FFB000] bg-[#FFB000]/5' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setShippingMethod(m.id as any)}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                          shippingMethod === m.id 
                            ? `${m.activeColor} border-2 text-gray-900 dark:text-white scale-[1.02] shadow` 
                            : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {m.icon}
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Specs */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Cargo Weight (kg) *</label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      value={weight} 
                      onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Box Dimensions (L x W x H) *</label>
                    <input 
                      type="text" 
                      required 
                      value={dimensions} 
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. 50x40x30 cm"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Speed */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Shipping Speed</label>
                    <select 
                      value={shippingSpeed} 
                      onChange={(e) => setShippingSpeed(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      <option value="Regular">Regular Corridor Transit</option>
                      <option value="Express">Express Speed (1.5x Multiplier)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Pickup Date</label>
                    <input 
                      type="date" 
                      value={pickupDate} 
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Insurance toggle */}
                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="insurance" 
                    checked={insurance} 
                    onChange={(e) => setInsurance(e.target.checked)}
                    className="w-5 h-5 accent-[#0057B8]"
                  />
                  <label htmlFor="insurance" className="flex-1 text-xs text-gray-600 dark:text-gray-300 text-left">
                    <strong className="text-gray-900 dark:text-white block font-bold">Add Safe-Transit Cargo Insurance (+$50)</strong>
                    Protects the shipment package up to $10,000 for loss, customs damage, or freight delay compensation.
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-[#0057B8] text-white font-bold rounded-xl hover:bg-[#00479b] cursor-pointer"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirm & Checkout */}
            {step === 3 && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Confirm Booking Request</h3>
                  <p className="text-xs text-gray-500">Verify details and check cost before submitting cargo order.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  {/* Route Specs */}
                  <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl">
                    <h4 className="font-extrabold text-gray-900 dark:text-white">Shipment Summary</h4>
                    <p className="flex justify-between"><span className="text-gray-400">Sender:</span> <strong>{senderName} ({senderPhone})</strong></p>
                    <p className="flex justify-between"><span className="text-gray-400">Origin:</span> <strong className="max-w-[200px] truncate">{senderAddress}</strong></p>
                    <p className="flex justify-between"><span className="text-gray-400">Receiver:</span> <strong>{receiverName} ({receiverPhone})</strong></p>
                    <p className="flex justify-between"><span className="text-gray-400">Destination:</span> <strong className="max-w-[200px] truncate">{receiverAddress}</strong></p>
                  </div>

                  {/* Volume specs */}
                  <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl">
                    <h4 className="font-extrabold text-gray-900 dark:text-white">Logistics & Handling</h4>
                    <p className="flex justify-between"><span className="text-gray-400">Mode:</span> <strong>{shippingMethod} ({shippingSpeed})</strong></p>
                    <p className="flex justify-between"><span className="text-gray-400">Specs:</span> <strong>{weight} kg • {dimensions}</strong></p>
                    <p className="flex justify-between"><span className="text-gray-400">Pickup Date:</span> <strong>{pickupDate}</strong></p>
                    <p className="flex justify-between"><span className="text-gray-400">Insurance:</span> <strong className={insurance ? "text-green-600" : "text-gray-400"}>{insurance ? 'Safe Protected' : 'None'}</strong></p>
                  </div>
                </div>

                {/* Special instructions */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Special Handling Instructions</label>
                  <textarea 
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Keep upright, fragile medical glassware consignments, require forklift loading..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                  />
                </div>

                {/* Coupon form box */}
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 text-left">
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center space-x-1">
                      <Sparkles size={14} className="text-[#FFB000]" />
                      <span>Have a Promotion Coupon?</span>
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">Apply "GUULWADE10" to get immediate 10% discount on entire cargo booking!</p>
                  </div>

                  <div className="w-full md:w-auto">
                    {appliedCoupon ? (
                      <span className="bg-[#00A86B]/15 text-[#00A86B] font-extrabold px-3 py-1.5 rounded-lg text-xs block">
                        Applied Coupon: {appliedCoupon} ({discountPercent}% Off)
                      </span>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="GUULWADE10" 
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold bg-white dark:bg-gray-950 text-gray-900 dark:text-white w-28 uppercase"
                        />
                        <button type="submit" className="bg-[#FFB000] text-[#0B1220] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                          Apply
                        </button>
                      </form>
                    )}
                    {couponError && <p className="text-[10px] text-red-500 mt-1">{couponError}</p>}
                  </div>
                </div>

                {/* Cost checkout action box */}
                <div className="bg-gradient-to-br from-[#0B1220] to-[#121c2e] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-left">
                    <span className="text-xs font-bold text-gray-400 block uppercase tracking-widest">Total Estimated Shipping Cost</span>
                    <h3 className="text-3xl font-black text-[#FFB000] mt-1">
                      {formatPrice(estimatedCost)}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-1">Includes all customs agency handling fees and dynamic terminal tariffs.</p>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 md:flex-initial px-6 py-3.5 bg-gray-800 text-gray-300 font-bold rounded-xl border border-white/5 hover:bg-gray-700 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 md:flex-initial px-8 py-3.5 bg-[#0057B8] hover:bg-[#00479b] text-white font-bold rounded-xl shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Register Booking'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </form>
        )}

        {/* STEP 4: Success & Printable Invoice PDF view */}
        {step === 4 && createdBooking && (
          <div className="p-6 md:p-10 space-y-8 animate-fade-in print:p-0 print:border-none">
            {/* Header Success box (Hidden in print) */}
            <div className="bg-[#00A86B]/10 border border-[#00A86B]/20 p-6 rounded-2xl flex items-center space-x-4 text-left print:hidden">
              <div className="w-12 h-12 rounded-full bg-[#00A86B] text-white flex items-center justify-center font-bold text-xl shadow">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Booking Registered Successfully!</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your tracking record <strong className="text-[#0057B8] dark:text-[#FFB000]">{createdShipment?.id}</strong> is now live. We have generated your official invoice below.
                </p>
              </div>
            </div>

            {/* Official Invoice Sheet */}
            <div className="p-8 bg-white dark:bg-[#0B1220] border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm text-left relative">
              
              {/* Watermark Logo backdrop */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.015] pointer-events-none">
                <span className="text-[120px] font-black">GTL</span>
              </div>

              {/* Invoice Top section */}
              <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#0057B8] text-white font-black text-lg px-2 py-1 rounded">GTL</span>
                    <span className="text-lg font-black tracking-wider text-gray-900 dark:text-white">GUULWADE LOGISTICS</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Mogadishu Port Terminal Road, Mogadishu, Somalia<br />
                    Bole International Trade Area, Addis Ababa, Ethiopia<br />
                    support@guulwade.com • www.guulwade.com
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">OFFICIAL INVOICE</h2>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mt-1">Invoice Number</span>
                  <span className="text-base font-bold text-[#0057B8] dark:text-[#FFB000] block mt-0.5">{createdBooking.id}</span>
                  <span className="text-xs text-gray-400 block mt-2">Date: {new Date(createdBooking.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Addresses section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block">Sender Billing</span>
                  <strong className="text-sm text-gray-900 dark:text-white block mt-1">{createdBooking.senderName}</strong>
                  <span className="text-xs text-gray-500 block mt-1">{createdBooking.senderAddress}</span>
                  <span className="text-xs text-gray-500 block">Phone: {createdBooking.senderPhone}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block">Receiver Consignee</span>
                  <strong className="text-sm text-gray-900 dark:text-white block mt-1">{createdBooking.receiverName}</strong>
                  <span className="text-xs text-gray-500 block mt-1">{createdBooking.receiverAddress}</span>
                  <span className="text-xs text-gray-500 block">Phone: {createdBooking.receiverPhone}</span>
                </div>
              </div>

              {/* Item details */}
              <div className="py-8 border-b border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 text-xs uppercase tracking-widest">
                      <th className="py-3 text-left">Logistics Specification</th>
                      <th className="py-3 text-center">Qty / Weight</th>
                      <th className="py-3 text-right">Estimated Tariff</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-white">
                      <td className="py-4">
                        <span>{createdBooking.shippingMethod} Cargo Shipping ({createdBooking.shippingSpeed})</span>
                        <p className="text-[11px] text-gray-500 font-normal mt-1">Package dimensions: {createdBooking.dimensions} • Special handling instructions apply.</p>
                      </td>
                      <td className="py-4 text-center">{createdBooking.weight} kg</td>
                      <td className="py-4 text-right">{formatPrice(createdBooking.estimatedCost)}</td>
                    </tr>
                    {createdBooking.insurance && (
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white">
                        <td className="py-3 font-semibold text-xs">Safe-Transit Cargo Liability Insurance</td>
                        <td className="py-3 text-center text-xs">Full Protect</td>
                        <td className="py-3 text-right text-xs">Included</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* QR and print totals */}
              <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-6">
                
                {/* Barcode representation */}
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex space-x-0.5 h-10 w-44 bg-gray-900 dark:bg-white p-1 rounded">
                    {/* Simulated bars */}
                    {[1,2,1,3,1,2,4,1,2,1,3,2,1,1,2,3,1,2,1].map((bar, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 h-full" style={{ width: `${bar * 2}px` }} />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-gray-500 mt-1 uppercase">TRACKING: {createdShipment?.id}</span>
                </div>

                {/* Sub-Invoice Stamp & Total pricing */}
                <div className="text-right">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block">GRAND TOTAL DUE</span>
                  <h3 className="text-3xl font-black text-[#0057B8] dark:text-[#FFB000] mt-1">
                    {formatPrice(createdBooking.estimatedCost)}
                  </h3>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider block mt-1">✓ INVOICE PAYABLE ON CARGO DEPARTURE</span>
                </div>
              </div>
            </div>

            {/* Print actions (Hidden in print) */}
            <div className="flex justify-center gap-4 print:hidden">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl cursor-pointer"
              >
                Book Another Shipment
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-3.5 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-xl flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <Printer size={16} />
                <span>Print Invoice Receipt</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
