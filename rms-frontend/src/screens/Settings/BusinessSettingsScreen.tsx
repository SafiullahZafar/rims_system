import React, { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { PageHeader } from '../../components/shared/PageHeader';
import { useToast } from '../../hooks/useToast';
import {
  Settings,
  Building2,
  Receipt,
  Clock,
  Save,
} from 'lucide-react';

export const BusinessSettingsScreen: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'pos' | 'notifications'>('profile');

  // Form State
  const [restoName, setRestoName] = useState('Pixora Gourmet Bistro');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4');
  const [address, setAddress] = useState('124 Culinary Boulevard, Downtown Metro');
  const [phone, setPhone] = useState('+1 (555) 382-9100');
  const [email, setEmail] = useState('contact@pixora-gourmet.com');
  const [currency, setCurrency] = useState('$');
  const [taxRate, setTaxRate] = useState('8.5');

  // POS Defaults
  const [receiptHeader, setReceiptHeader] = useState('Thank you for dining with Pixora RIMS!');
  const [receiptFooter, setReceiptFooter] = useState('Please visit us again. Feedback: info@pixora-gourmet.com');
  const [autoPrint, setAutoPrint] = useState(true);
  const [orderPrefix, setOrderPrefix] = useState('ORD-');

  // Operational Hours & Alerts
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('23:00');
  const [lowStockAlert, setLowStockAlert] = useState('10');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Business settings saved successfully.');
  };

  return (
    <PageWrapper className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-[1200px] mx-auto pb-24 md:pb-8">
        <PageHeader
          title="Business Settings"
          subtitle="Configure operational defaults, receipt templates, and restaurant branding"
          breadcrumb="Administration / Business Settings"
          icon={Settings}
        />

        {/* Settings Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#E9E5E1] mb-6">
          {[
            { id: 'profile', label: 'Business Profile', icon: Building2 },
            { id: 'pos', label: 'POS & Receipts', icon: Receipt },
            { id: 'notifications', label: 'Hours & Alerts', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all relative cursor-pointer ${
                  isActive ? 'text-[#FF7A10]' : 'text-[#666A64] hover:text-[#1F221D]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF7A10] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          {activeTab === 'profile' && (
            <div className="bg-white border border-[#E9E5E1] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1F221D] uppercase tracking-wider mb-4 pb-2 border-b border-[#E9E5E1]">
                Restaurant Branding & Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={restoName}
                    onChange={(e) => setRestoName(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Standard Tax Rate (%)
                  </label>
                  <input
                    type="text"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pos' && (
            <div className="bg-white border border-[#E9E5E1] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1F221D] uppercase tracking-wider mb-4 pb-2 border-b border-[#E9E5E1]">
                POS Order & Receipt Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Order Code Prefix
                  </label>
                  <input
                    type="text"
                    value={orderPrefix}
                    onChange={(e) => setOrderPrefix(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-[#1F221D]">Auto-Print Receipt</p>
                    <p className="text-[11px] text-[#666A64]">Automatically trigger bill print after checkout.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoPrint(!autoPrint)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      autoPrint ? 'bg-[#FF7A10]' : 'bg-[#666A64]/30'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        autoPrint ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Receipt Top Greeting / Header
                  </label>
                  <input
                    type="text"
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Receipt Footer Note
                  </label>
                  <input
                    type="text"
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white border border-[#E9E5E1] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1F221D] uppercase tracking-wider mb-4 pb-2 border-b border-[#E9E5E1]">
                Operating Hours & Inventory Thresholds
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Daily Opening Time
                  </label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Daily Closing Time
                  </label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1.5 block">
                    Low Stock Alert Threshold (Qty)
                  </label>
                  <input
                    type="number"
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.value)}
                    className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl px-4 py-2.5 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#FF7A10] hover:bg-[#E86000] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" /> Save Business Settings
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default BusinessSettingsScreen;
