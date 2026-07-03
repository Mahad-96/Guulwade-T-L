import React, { useState } from 'react';
import { useLanguage } from './LanguageContext.tsx';
import { 
  Phone, Mail, Clock, MapPin, Send, HelpCircle, 
  MessageSquare, Sparkles, RefreshCw, User 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function ContactForm() {
  const { t } = useLanguage();

  // Standard Contact Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Chatbot fields
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: "Ascoom! Welcome to Guulwade Logistics Smart Assistant. Ask me anything about Berbera Port customs tariffs, air express speeds, or sea container scheduling in Mogadishu!",
      timestamp: new Date()
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting contact query:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg]);
    const promptToSend = chatInput;
    setChatInput('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: data.reply || "I am currently calculating maritime routes. Please try again soon.",
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error in chatbot query:', err);
      setChatHistory(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: "I encountered a minor radio frequency cargo disconnect. Feel free to ask me again!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      {/* Page header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Get in Touch
        </h2>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Have an inquiry about active land cargo corridors, sea container clearance times, or custom carrier routes? Reach our global headquarters or chat with our AI Smart assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Contact Information Cards (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Corporate Offices</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3.5">
                <MapPin className="text-[#0057B8] dark:text-[#FFB000] shrink-0 mt-1" size={18} />
                <div className="text-sm">
                  <strong className="text-gray-900 dark:text-white block font-bold">Mogadishu Headquarters</strong>
                  <p className="text-gray-500 mt-1">Mogadishu Port Terminal Road, Wadajir District, Mogadishu, Somalia</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Phone className="text-[#0057B8] dark:text-[#FFB000] shrink-0 mt-1" size={18} />
                <div className="text-sm">
                  <strong className="text-gray-900 dark:text-white block font-bold">Hotlines & Telephones</strong>
                  <p className="text-gray-500 mt-1">+252 61 777 5050 (HQ Office)<br />+251 11 444 8080 (Addis Dry Port)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Mail className="text-[#0057B8] dark:text-[#FFB000] shrink-0 mt-1" size={18} />
                <div className="text-sm">
                  <strong className="text-gray-900 dark:text-white block font-bold">Inquiries Emails</strong>
                  <p className="text-gray-500 mt-1">logistics@guulwade.com<br />support@guulwade.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Clock className="text-[#0057B8] dark:text-[#FFB000] shrink-0 mt-1" size={18} />
                <div className="text-sm">
                  <strong className="text-gray-900 dark:text-white block font-bold">Dispatch Operations Hours</strong>
                  <p className="text-gray-500 mt-1">Saturday – Thursday: 8:00 AM – 6:00 PM<br />Emergency Cargo Port Hotline: 24/7 Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map mockup representation */}
          <div className="relative h-48 rounded-2xl bg-slate-100 dark:bg-gray-950 border border-gray-150 dark:border-gray-900 overflow-hidden flex items-center justify-center">
            {/* SVG custom styled mockup of horn of Africa ports */}
            <svg className="absolute inset-0 w-full h-full opacity-40 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="none" />
              {/* Coast contours */}
              <path d="M 50,40 Q 120,60 180,100 T 260,120 T 320,80" fill="none" stroke="#0057B8" strokeWidth="2" />
              <circle cx="180" cy="100" r="5" fill="#FFB000" />
              <circle cx="260" cy="120" r="5" fill="#FFB000" />
            </svg>
            <div className="bg-white/95 dark:bg-[#0B1220]/95 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 text-center max-w-[240px] z-10">
              <span className="text-xs font-bold text-gray-950 dark:text-white block">Regional Maritime Hub</span>
              <p className="text-[10px] text-gray-500 mt-1">Direct shipping connections through Mogadishu, Berbera, Kismayo & Djibouti.</p>
            </div>
          </div>
        </div>

        {/* Center: Standard inquiry form (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1220] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Submit Inquiry</h3>
          
          {success ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800 rounded-xl text-xs">
              Thank you! Your message was received successfully. We will follow up with you on your email shortly.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Your Full Name *</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cali Warsame"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Your Email Address *</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cali@test.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Subject</label>
                <input
                  type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Warehouse space Berbera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">Detailed Message *</label>
                <textarea
                  required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Provide specifications of cargo volume, timing, or route details..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#0057B8] hover:bg-[#00479b] text-white font-bold rounded-xl text-xs cursor-pointer flex justify-center items-center gap-1.5"
              >
                <span>Submit Inquiry Message</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: AI smart assistant chatbot thread (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-[#0B1220] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4 text-white flex flex-col h-[460px] sticky top-24">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-[#FFB000] text-[#0B1220] rounded-lg">
                <Sparkles size={16} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-white">Guulwade Logistics AI</h4>
                <span className="text-[8px] text-green-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping" />
                  <span>Real-time Chat Live</span>
                </span>
              </div>
            </div>
          </div>

          {/* Chat thread box */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex gap-2 text-left ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender !== 'user' && (
                  <div className="w-6 h-6 bg-[#0057B8] rounded-full flex items-center justify-center shrink-0">
                    🤖
                  </div>
                )}
                
                <div className={`p-3 rounded-xl max-w-[80%] ${
                  msg.sender === 'user' 
                    ? 'bg-[#0057B8] text-white rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}>
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex gap-2 justify-start text-left items-center text-gray-400">
                <div className="w-6 h-6 bg-[#0057B8] rounded-full flex items-center justify-center shrink-0">
                  🤖
                </div>
                <div className="bg-gray-850 p-2.5 rounded-xl flex items-center gap-1">
                  <RefreshCw className="animate-spin" size={10} />
                  <span>Calculating routes...</span>
                </div>
              </div>
            )}
          </div>

          {/* Send Box */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              required
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask: What is air cargo speed?"
              className="flex-1 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#FFB000] placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="p-2.5 bg-[#FFB000] hover:bg-[#e09b00] text-[#0B1220] font-bold rounded-xl cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
