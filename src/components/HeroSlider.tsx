import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { Ship, Plane, Truck, Search, ArrowRight, ShieldCheck, Clock, TrendingUp } from 'lucide-react';

interface HeroSliderProps {
  onSearchTracking: (code: string) => void;
  onBookNow: () => void;
  onRequestQuote: () => void;
}

export default function HeroSlider({ onSearchTracking, onBookNow, onRequestQuote }: HeroSliderProps) {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trackingInput, setTrackingInput] = useState('');

  const slides = [
    {
      title: 'Global Freight Forwarding & Sea Cargo',
      subtitle: 'Premium vessel container shipping linking Mogadishu, Berbera, Suez, & global ports with certified, reliable logistics.',
      badge: 'Maritime Logistics',
      icon: <Ship size={36} className="text-[#FFB000]" />,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600'
    },
    {
      title: 'Express East Africa Air Cargo',
      subtitle: 'Guaranteed 24-hour deliveries across Somalia, Somaliland, Puntland, Ethiopia, and Kenya using specialized air cargo freighters.',
      badge: 'Air Transport',
      icon: <Plane size={36} className="text-[#00A86B]" />,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600'
    },
    {
      title: 'Overland Heavy Truck Networks',
      subtitle: 'Safe, multi-axle cargo trailers traversing national supply corridors to move heavy cargo and warehousing distributions.',
      badge: 'Land Transport',
      icon: <Truck size={36} className="text-[#0057B8]" />,
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      onSearchTracking(trackingInput.trim());
    }
  };

  return (
    <div className="relative bg-gray-950 overflow-hidden">
      {/* Decorative Grid Patterns & Borders (Geometric Balance) */}
      <div className="absolute inset-0 opacity-30 z-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-12 right-12 w-48 h-48 border-[16px] border-[#FFB000]/10 pointer-events-none z-10 hidden lg:block" />
      <div className="absolute bottom-24 left-12 w-64 h-64 border-[24px] border-[#0057B8]/20 pointer-events-none z-10 hidden lg:block" />

      {/* Slide Images & Content */}
      <div className="relative h-[650px] md:h-[700px] w-full flex items-center transition-all duration-1000 ease-in-out">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={slides[currentSlide].image} 
            alt="Guulwade Logistics" 
            className="w-full h-full object-cover brightness-[0.22] transition-all duration-1000 transform scale-105"
          />
          {/* Decorative colored lights in overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent opacity-90" />
        </div>

        {/* Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left">
          <div className="max-w-3xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-none border border-white/20 mb-6">
              {slides[currentSlide].icon}
              <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">
                {slides[currentSlide].badge}
              </span>
            </div>

            {/* Slide Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.15] uppercase">
              {slides[currentSlide].title.split('&')[0]}<br/>
              <span className="text-[#FFB000]">{slides[currentSlide].title.split('&')[1] || ''}</span>
            </h1>

            {/* Slide Subtitle */}
            <p className="text-base text-gray-300 mb-8 leading-relaxed max-w-2xl font-medium">
              {slides[currentSlide].subtitle}
            </p>

            {/* Slide Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <button 
                onClick={onBookNow}
                className="px-6 py-3.5 bg-[#0057B8] hover:bg-blue-700 text-white font-bold rounded-none shadow-none transition-transform hover:-translate-y-0.5 duration-300 flex items-center space-x-2 cursor-pointer uppercase tracking-widest text-xs"
              >
                <span>{t('booking')}</span>
                <ArrowRight size={14} />
              </button>
              <button 
                onClick={onRequestQuote}
                className="px-6 py-3.5 bg-transparent border border-white text-white hover:bg-white/10 font-bold rounded-none transition-colors duration-300 cursor-pointer uppercase tracking-widest text-xs"
              >
                {t('quote')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Shipment Tracking Box */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-20">
        <div className="bg-white dark:bg-[#0B1220] rounded-none shadow-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left border-l-4 border-[#0057B8] dark:border-[#FFB000] pl-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{t('trackShipment')}</span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                {t('enterTrackingNum')}
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="flex-1 flex gap-2 max-w-2xl w-full">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="e.g. GTL-2026-000154"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0057B8] dark:focus:ring-[#FFB000] focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-[#FFB000] hover:bg-yellow-500 text-[#0B1220] font-black rounded-none shadow-none transition-all duration-300 cursor-pointer flex items-center space-x-1 uppercase tracking-widest text-xs"
              >
                <span>{t('track')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3.5 h-3.5 rounded-none border transition-all duration-300 cursor-pointer ${
              currentSlide === index ? 'bg-[#FFB000] border-[#FFB000] rotate-45' : 'bg-white/20 border-transparent hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
