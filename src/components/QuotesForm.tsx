import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { useCurrency } from './CurrencyContext.tsx';
import { Sparkles, ArrowRight, Plane, Ship, Truck, CheckCircle2, DollarSign } from 'lucide-react';

export default function QuotesForm() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Quote form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState(10);
  const [volume, setVolume] = useState('0.5'); // m3
  const [method, setMethod] = useState<'Air' | 'Sea' | 'Road'>('Air');
  const [speed, setSpeed] = useState<'Express' | 'Regular'>('Regular');
  
  const [liveCost, setLiveCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Live instant pricing
  const calculateLiveQuote = () => {
    let baseRate = 4.5; // Road
    if (method === 'Air') baseRate = 11.5;
    else if (method === 'Sea') baseRate = 2.0;

    let speedMultiplier = speed === 'Express' ? 1.4 : 1.0;
    let costEstimate = Math.round(weight * baseRate * speedMultiplier + Number(volume) * 45);
    
    setLiveCost(costEstimate < 25 ? 25 : costEstimate);
  };

  useEffect(() => {
    calculateLiveQuote();
  }, [weight, volume, method, speed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !origin || !destination) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderEmail,
          senderPhone,
          origin,
          destination,
          weight,
          shippingMethod: method,
          shippingSpeed: speed,
          estimatedCost: liveCost
        })
      });

      if (response.ok) {
        setSuccess(true);
        setSenderName('');
        setSenderEmail('');
        setSenderPhone('');
        setOrigin('');
        setDestination('');
      }
    } catch (err) {
      console.error('Error submitting quote:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Get an Instant Cargo Quote
        </h2>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Obtain professional maritime container tariffs, land fleet corridors, and air express logistics pricing estimates instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: interactive form */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0B1220] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 text-[#00A86B] mx-auto flex items-center justify-center text-3xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quote Request Registered!</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Your professional tariff sheet has been computed and sent to your email. Guulwade cargo dispatch agents will contact you directly to schedule pickup.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-[#0057B8] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Request Another Quote
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white border-b border-gray-50 dark:border-gray-850 pb-3">Cargo Spec details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Company / Contact Name *</label>
                  <input
                    type="text" required value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="e.g. Berbera Food Import LLC"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email" required value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="consignee@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Origin City/Port *</label>
                  <input
                    type="text" required value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Mogadishu Port, Somalia"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Destination City/Port *</label>
                  <input
                    type="text" required value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Bole Airport, Addis Ababa"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
              </div>

              {/* Mode of Freight */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">Logistics Transport Mode</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'Air', label: t('serviceAirCargo'), icon: <Plane size={18} />, color: 'border-[#0057B8]' },
                    { id: 'Sea', label: t('serviceSeaFreight'), icon: <Ship size={18} />, color: 'border-[#00A86B]' },
                    { id: 'Road', label: t('serviceLocalTrans'), icon: <Truck size={18} />, color: 'border-[#FFB000]' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-xs font-bold transition-all ${
                        method === m.id 
                          ? `${m.color} border-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800` 
                          : 'border-gray-200 dark:border-gray-700 text-gray-400'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Weight (kg)</label>
                  <input
                    type="number" min="1" value={weight} onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Volume (m³)</label>
                  <input
                    type="number" step="0.1" min="0.1" value={volume} onChange={(e) => setVolume(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Shipping Speed</label>
                  <select
                    value={speed} onChange={(e) => setSpeed(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    <option value="Regular">Regular Speed</option>
                    <option value="Express">Express Speed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#0057B8] hover:bg-[#00479b] text-white font-bold rounded-xl cursor-pointer"
              >
                {submitting ? 'Registering request...' : 'Submit Quote Request'}
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Bento pricing calculation panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0B1220] p-6 md:p-8 rounded-2xl text-white space-y-6 text-left border border-white/5 sticky top-24">
            <span className="text-[10px] font-bold text-[#FFB000] uppercase tracking-widest block">Instant tariff calculator</span>
            
            <div className="space-y-1">
              <span className="text-xs text-gray-400 block">Calculated Quote Estimate</span>
              <h3 className="text-4xl font-black text-white">
                {formatPrice(liveCost)}
              </h3>
              <p className="text-[10px] text-gray-500">Tariff is computed dynamically from Horn ports customs fees and transport parameters.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Freight Weight:</span>
                <strong className="text-white">{weight} kg</strong>
              </div>
              <div className="flex justify-between">
                <span>Cargo Volume:</span>
                <strong className="text-white">{volume} m³</strong>
              </div>
              <div className="flex justify-between">
                <span>Transport Mode:</span>
                <strong className="text-[#FFB000] font-bold capitalize">{method} ({speed})</strong>
              </div>
              <div className="flex justify-between">
                <span>Regional Port Tax:</span>
                <strong className="text-green-500 font-bold">Included</strong>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl text-xs space-y-2 border border-white/5">
              <span className="text-white font-bold flex items-center gap-1">
                <Sparkles size={14} className="text-[#FFB000]" />
                <span>Customs Clearance Agent</span>
              </span>
              <p className="text-gray-400 text-[11px]">Guulwade acts as your full-service broker, handling import customs declaration papers for Somalia, Ethiopia, Kenya, and Egypt automatically!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
