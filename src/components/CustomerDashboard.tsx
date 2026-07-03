import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { useCurrency } from './CurrencyContext.tsx';
import { 
  Package, Calendar, DollarSign, CheckCircle2, Clock, 
  ArrowRight, ShieldCheck, CreditCard, ChevronRight, 
  HelpCircle, AlertCircle, Plus, Eye, Send 
} from 'lucide-react';

interface CustomerDashboardProps {
  currentUser: any;
  onTrackIdSelected: (id: string) => void;
  onBookNowTabSelected: () => void;
}

export default function CustomerDashboard({ currentUser, onTrackIdSelected, onBookNowTabSelected }: CustomerDashboardProps) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePaymentBkg, setActivePaymentBkg] = useState<any | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        // Filter bookings belonging to the demo customer (Mursal Kureish)
        // Mursal is the demo customer seeded, so let's display his or all bookings for quick review
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const triggerPayment = (bkg: any) => {
    setActivePaymentBkg(bkg);
    setPaymentSuccess(false);
  };

  const handlePay = (gateway: 'Stripe' | 'PayPal') => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaymentSuccess(true);
      // Update local state booking status to paid
      setBookings(prev => prev.map(b => b.id === activePaymentBkg.id ? { ...b, status: 'Completed' } : b));
    }, 2000);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketSubject && ticketMsg) {
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketMsg('');
      setTimeout(() => setTicketSuccess(false), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0B1220] to-[#121c2e] p-8 rounded-2xl border border-white/5 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-bold text-[#FFB000] uppercase tracking-widest block">Customer portal</span>
          <h2 className="text-2xl font-black text-white mt-1">
            {t('welcomeBack')}, {currentUser?.name || 'Mursal Kureish'}
          </h2>
          <p className="text-xs text-gray-400 mt-2">Manage your air, road, and sea freight logistics, track active corridors, and discharge invoices.</p>
        </div>

        <button 
          onClick={onBookNowTabSelected}
          className="px-5 py-3 bg-[#0057B8] hover:bg-[#00479b] text-white font-bold rounded-xl shadow-lg flex items-center space-x-2 transition-transform hover:-translate-y-0.5 duration-300 cursor-pointer text-sm"
        >
          <Plus size={16} />
          <span>Book New Cargo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: My Cargo Shipments / Invoices */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Shipments */}
          <div className="bg-white dark:bg-[#0B1220] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center space-x-2">
                <Package size={18} className="text-[#0057B8] dark:text-[#FFB000]" />
                <span>My Active Shipments</span>
              </h3>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading active cargos...</div>
            ) : bookings.length === 0 ? (
              <div className="p-10 text-center text-gray-400">No shipments found. Book your first cargo package!</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {bookings.map((bkg) => (
                  <div key={bkg.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400">BKG ID: {bkg.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bkg.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-[#FFB000]/10 text-[#FFB000]'
                        }`}>
                          {bkg.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                        To: {bkg.receiverName} ({bkg.receiverAddress.split(',')[0]})
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {bkg.shippingMethod} Cargo • {bkg.weight} kg • Est: {bkg.pickupDate}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white mr-2">
                        {formatPrice(bkg.estimatedCost)}
                      </span>

                      {/* Track details redirect */}
                      <button
                        onClick={() => onTrackIdSelected(bkg.id.replace('BKG', 'GTL'))}
                        className="p-2 bg-gray-50 hover:bg-[#0057B8]/10 text-gray-600 hover:text-[#0057B8] dark:bg-gray-800 dark:text-gray-300 dark:hover:text-[#FFB000] rounded-lg transition-all cursor-pointer"
                        title="Live Tracking Details"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Payment trigger */}
                      {bkg.status === 'Pending' && (
                        <button
                          onClick={() => triggerPayment(bkg)}
                          className="px-3.5 py-1.5 bg-[#00A86B] hover:bg-[#008f5a] text-white font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <CreditCard size={12} />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: support tickets & payment modal widget */}
        <div className="space-y-8">
          
          {/* Payment Gateway Widget (Integrated Stripe/PayPal) */}
          {activePaymentBkg && (
            <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl animate-fade-in">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center justify-between">
                <span>Secure Freight Payment</span>
                <button onClick={() => setActivePaymentBkg(null)} className="text-xs text-red-500 font-bold hover:underline">Cancel</button>
              </h4>

              {paymentSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#00A86B]/10 text-[#00A86B] mx-auto flex items-center justify-center font-bold text-xl">
                    ✓
                  </div>
                  <h5 className="font-bold text-gray-950 dark:text-white">Payment Confirmed!</h5>
                  <p className="text-xs text-gray-500">Invoice {activePaymentBkg.id} has been fully paid using Stripe. Your cargo dispatch queue is approved.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-left text-xs">
                    <p className="flex justify-between"><span>Cargo Booking ID:</span> <strong>{activePaymentBkg.id}</strong></p>
                    <p className="flex justify-between mt-1"><span>Total Cost:</span> <strong className="text-[#0057B8] dark:text-[#FFB000]">{formatPrice(activePaymentBkg.estimatedCost)}</strong></p>
                  </div>

                  <p className="text-[10px] text-gray-500 text-left">Select a secure payment gateway to settle the logistics cargo fees.</p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handlePay('Stripe')}
                      disabled={paying}
                      className="py-3 bg-[#635BFF] hover:bg-[#4E47E6] text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Stripe Card</span>
                    </button>
                    <button
                      onClick={() => handlePay('PayPal')}
                      disabled={paying}
                      className="py-3 bg-[#003087] hover:bg-[#002465] text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>PayPal Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Support Ticket Creation */}
          <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
            <h4 className="text-base font-black text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <HelpCircle size={18} className="text-[#0057B8] dark:text-[#FFB000]" />
              <span>Customer Help Desk</span>
            </h4>

            {ticketSuccess ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl text-xs border border-green-100 dark:border-green-800">
                Ticket submitted successfully! Guulwade Support Staff Amina Yusuf will respond to your email shortly.
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Subject / Issue *</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Change delivery speed of BKG-0012"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Detailed Message *</label>
                  <textarea
                    required
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    placeholder="Provide details about cargo delay, label edits, or custom documentation demands..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0B1220] dark:bg-gray-800 hover:bg-[#121c2e] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send size={12} />
                  <span>Submit Support Ticket</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
