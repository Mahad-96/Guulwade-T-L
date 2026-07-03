import React, { useState } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { useCurrency } from './CurrencyContext.tsx';
import { 
  Plane, Ship, Truck, Layers, ShieldCheck, 
  MapPin, Clock, ArrowRight, Anchor, Globe, 
  Sparkles, Award, Star, Compass 
} from 'lucide-react';
import HeroSlider from './HeroSlider.tsx';

interface HomePageProps {
  onTabSelected: (tab: string) => void;
  onTrackIdSubmit: (id: string) => void;
}

export default function HomePage({ onTabSelected, onTrackIdSubmit }: HomePageProps) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [cargoWeight, setCargoWeight] = useState(15);

  const calculateQuickPrice = () => {
    return Math.round(cargoWeight * 5); // Simple local rate $5/kg
  };

  const services = [
    {
      icon: <Plane size={24} className="text-[#0057B8] dark:text-[#FFB000]" />,
      title: t('serviceAirCargo'),
      desc: "Priority air courier connections linking Aden Adde (Somalia) with Bole (Addis Ababa), Suez Canal Airports, and global hubs within 48 hours."
    },
    {
      icon: <Ship size={24} className="text-[#0057B8] dark:text-[#FFB000]" />,
      title: t('serviceSeaFreight'),
      desc: "Full Container Load (FCL) & Less than Container Load (LCL) dry port shipments navigating Indian Ocean, Gulf of Aden, and Bab el-Mandeb corridors."
    },
    {
      icon: <Truck size={24} className="text-[#0057B8] dark:text-[#FFB000]" />,
      title: t('serviceLocalTrans'),
      desc: "Heavy-duty logistics land carrier fleets delivering secure multi-axle freight containers along regional highways and dry ports safely."
    },
    {
      icon: <Layers size={24} className="text-[#0057B8] dark:text-[#FFB000]" />,
      title: t('serviceWarehousing'),
      desc: "State-of-the-art secure temperature-regulated dry port storages in Mogadishu and Berbera, integrated with QR barcode inventory trackers."
    },
    {
      icon: <ShieldCheck size={24} className="text-[#0057B8] dark:text-[#FFB000]" />,
      title: t('serviceCustoms'),
      desc: "Rapid customs broker clearance and trade certification dispatch services for trans-border Horn of Africa land ports and sea borders."
    },
    {
      icon: <Compass size={24} className="text-[#0057B8] dark:text-[#FFB000]" />,
      title: "Import & Export Logistics",
      desc: "Complete end-to-end global trade management solutions representing international manufacturers and local agriculture exports."
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Image Slider with integrated tracking input box */}
      <HeroSlider 
        onSearchTracking={onTrackIdSubmit} 
        onBookNow={() => onTabSelected('booking')}
        onRequestQuote={() => onTabSelected('quotes')}
      />

      {/* 2. Key Capabilities Bento Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-3xl mx-auto mb-16 border-l-4 border-[#0057B8] dark:border-[#FFB000] pl-6 md:mx-auto md:border-l-0 md:pl-0">
          <span className="text-xs font-bold text-[#0057B8] dark:text-[#FFB000] uppercase tracking-[0.2em] block">World-Class Maritime & Land Carrier</span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl mt-1 uppercase">
            Our Logistics Solutions
          </h2>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            Guulwade orchestrates seamless multi-modal logistics linking East African trading partners with key global shipping hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
          {services.map((s, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#0B1220] p-8 rounded-none border-b border-r border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-none border-2 border-[#0057B8] dark:border-[#FFB000] bg-white dark:bg-[#0B1220] flex items-center justify-center transition-colors">
                  {s.icon}
                </div>
                <h4 className="text-base font-black uppercase text-gray-900 dark:text-white">{s.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{s.desc}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#0057B8] dark:text-[#FFB000] cursor-pointer" onClick={() => onTabSelected('booking')}>
                <span>Book Service</span>
                <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive Regional Dry Port Network Map Representation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1220] text-white p-8 md:p-12 rounded-none border border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          
          <div className="lg:col-span-5 space-y-6 z-10">
            <span className="text-xs font-bold text-[#FFB000] uppercase tracking-[0.25em] block">Regional Supremacy</span>
            <h3 className="text-3xl font-black text-white leading-tight uppercase">East Africa Port & Corridor Dominance</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Guulwade is strategically anchored in the Somali peninsula, facilitating critical maritime transit lanes, dry port warehousing, and express logistics connecting Mogadishu, Berbera, Djibouti, Addis Ababa, and Egypt.
            </p>

            <div className="space-y-4 border-t border-white/5 pt-6 text-xs text-gray-300 font-bold uppercase tracking-wider">
              <p className="flex items-center gap-2"><Anchor className="text-[#FFB000]" size={16} /> <span>Mogadishu Deep Port Base</span></p>
              <p className="flex items-center gap-2"><Globe className="text-[#FFB000]" size={16} /> <span>Addis Ababa & Berbera Corridor</span></p>
              <p className="flex items-center gap-2"><Clock className="text-[#FFB000]" size={16} /> <span>24/7 Live GPS Control Center</span></p>
            </div>
          </div>

          {/* Interactive SVG Network Map Illustration */}
          <div className="lg:col-span-7 bg-[#070C15] rounded-none border border-gray-800 h-80 flex items-center justify-center relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="map-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0057B8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0B1220" stopOpacity="0.0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grad)" />

              {/* Connected pathways */}
              <path d="M 150,180 Q 250,90 400,100" fill="none" stroke="#FFB000" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
              <path d="M 150,180 Q 300,240 500,220" fill="none" stroke="#0057B8" strokeWidth="2" strokeDasharray="3,3" />
              <path d="M 400,100 L 500,220" fill="none" stroke="#00A86B" strokeWidth="2" strokeDasharray="5,5" />

              {/* Mogadishu Port Hub node (Geometric Square) */}
              <rect x="494" y="214" width="12" height="12" fill="#FFB000" />
              {/* Addis Ababa Dry Port node */}
              <rect x="144" y="174" width="12" height="12" fill="#0057B8" />
              {/* Berbera Port Hub node */}
              <rect x="394" y="94" width="12" height="12" fill="#00A86B" />
            </svg>

            {/* Simulated Node labels (Square Boxes) */}
            <div className="absolute left-[15%] bottom-[30%] bg-[#0B1220] px-3 py-1.5 rounded-none border border-gray-800 text-left">
              <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">Dry Port Terminal</span>
              <strong className="text-[11px] text-white font-black uppercase">Addis Ababa</strong>
            </div>

            <div className="absolute right-[15%] bottom-[15%] bg-[#0B1220] px-3 py-1.5 rounded-none border border-gray-800 text-left">
              <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">Deep Water Terminal</span>
              <strong className="text-[11px] text-white font-black uppercase">Mogadishu Port HQ</strong>
            </div>

            <div className="absolute right-[25%] top-[15%] bg-[#0B1220] px-3 py-1.5 rounded-none border border-gray-800 text-left">
              <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">Economic corridor Hub</span>
              <strong className="text-[11px] text-white font-black uppercase">Berbera Terminal</strong>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Quick slider cost estimator and testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Testimonials */}
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs font-bold text-[#0057B8] dark:text-[#FFB000] uppercase tracking-[0.2em] block">Client Satisfaction</span>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase">What East African Traders Say</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 dark:border-gray-800">
            <div className="bg-white dark:bg-[#0B1220] p-6 rounded-none border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex text-[#FFB000] gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed font-medium">"Guulwade cleared our medical diagnostics equipment container at Mogadishu Port within 48 hours. Absolute lifesavers in terms of customs clearance!"</p>
              <div className="text-xs">
                <strong className="text-gray-950 dark:text-white block font-black uppercase tracking-wider">Dr. Warsame Elmi</strong>
                <span className="text-gray-400 block mt-0.5 uppercase text-[9px] font-semibold">Mogadishu Health Clinic</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1220] p-6 rounded-none space-y-4">
              <div className="flex text-[#FFB000] gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed font-medium">"Sourcing raw incense materials from the Horn region of Somaliland is perfectly secure. We have tracked our overland caravans directly to Berbera."</p>
              <div className="text-xs">
                <strong className="text-gray-950 dark:text-white block font-black uppercase tracking-wider">Khadar Haji</strong>
                <span className="text-gray-400 block mt-0.5 uppercase text-[9px] font-semibold">Incense Export Corp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Calculator (Sharp Grid style) */}
        <div className="lg:col-span-5 bg-gray-100/50 dark:bg-gray-900/50 p-8 rounded-none border border-gray-200 dark:border-gray-800 space-y-6">
          <span className="text-xs font-bold text-[#0057B8] dark:text-[#FFB000] uppercase tracking-[0.2em] block">Interactive Estimator</span>
          <h4 className="text-lg font-black uppercase text-gray-900 dark:text-white">Quick Highway Freight Estimator</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Drag the slider to preview the overland heavy logistics delivery tariff immediately.</p>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-950 dark:text-white">
              <span>Cargo Weight (kg)</span>
              <span>{cargoWeight} kg</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="500" 
              value={cargoWeight} 
              onChange={(e) => setCargoWeight(Number(e.target.value))}
              className="w-full accent-[#0057B8] rounded-none cursor-pointer h-2 bg-gray-200 dark:bg-gray-800 appearance-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="text-left">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest block font-bold">Overland Highway Tariff</span>
              <strong className="text-2xl font-black text-[#0057B8] dark:text-[#FFB000] block mt-0.5">{formatPrice(calculateQuickPrice())}</strong>
            </div>

            <button 
              onClick={() => onTabSelected('booking')}
              className="px-5 py-3 bg-[#0057B8] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest rounded-none flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Book Courier</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
