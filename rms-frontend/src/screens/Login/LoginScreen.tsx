import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../hooks/useToast';
import {
  UtensilsCrossed,
  ShieldCheck,
  UserCheck,
  MapPin,
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Delete,
} from 'lucide-react';
import { gsap } from 'gsap';

type LoginRole = 'admin' | 'employee';

export const LoginScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<LoginRole>('admin');
  const [pin, setPin] = useState('');
  const [adminEmail, setAdminEmail] = useState('safullahzafar@gmail.com');
  const [adminPassword, setAdminPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const setUserRole = useAppStore((state) => state.setUserRole);
  const { login, isLoggingIn } = useAuthStore();
  const toast = useToast();

  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (cardRef.current) {
      tl.fromTo(cardRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
    }
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) setPin((prev) => prev + num);
  };
  const handleBackspace = () => setPin((prev) => prev.slice(0, -1));

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedRole === 'employee' && pin.length < 4) {
      toast.error('Please enter your 4-digit shift PIN.');
      return;
    }
    if (selectedRole === 'admin' && (!adminEmail || !adminPassword)) {
      toast.error('Please enter admin email and password.');
      return;
    }

    const response = await login(
      selectedRole,
      selectedRole === 'admin' ? { email: adminEmail, password: adminPassword } : { pin }
    );

    if (response) {
      setUserRole(selectedRole, response.permissions, response.token, response.name, response.role_name);
      toast.success(`${selectedRole === 'admin' ? 'Administrator' : 'Staff'} Signed In Successfully!`);
      const finalScreen = response.screen === 'staff' ? 'tables' : response.screen;
      navigate('/' + finalScreen);
    } else {
      toast.error(selectedRole === 'admin' ? 'Invalid admin email or password.' : 'Invalid shift PIN.');
      setPin('');
    }
  };

  // Quick 1-click Demo Fill
  const fillDemoAdmin = () => {
    setSelectedRole('admin');
    setAdminEmail('admin@restopos.com');
    setAdminPassword('admin123');
    toast.info('Loaded Demo Admin credentials.');
  };

  const fillDemoEmployee = () => {
    setSelectedRole('employee');
    setPin('1234');
    toast.info('Loaded Demo Staff PIN (1234).');
  };

  return (
    <div className="flex min-h-screen bg-[#F7F5F2] w-full overflow-hidden font-sans select-none">
      {/* LEFT HERO BRANDING PANEL */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative bg-cover bg-center p-12 flex-col justify-between overflow-hidden"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2000&auto=format&fit=crop)',
        }}
      >
        {/* Dark Warm Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F221D]/90 via-[#1F221D]/60 to-[#1F221D]/40" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF7A10] to-[#E86000] text-white flex items-center justify-center shadow-lg border border-white/20">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-2xl text-white tracking-tight">
                Pixora<span className="text-[#FF7A10]">RIMS</span>
              </span>
              <span className="block text-[10px] font-bold text-white/70 uppercase tracking-widest -mt-1">
                Enterprise Restaurant System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs text-white font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            System Online • v2.4
          </div>
        </div>

        {/* Center Hero Copy & Highlights */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 bg-[#FF7A10]/20 border border-[#FF7A10]/40 text-[#FF7A10] px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Next-Gen Enterprise POS
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Streamline Orders, Inventory & Staff Operations.
          </h1>

          <p className="text-base text-white/80 leading-relaxed">
            Real-time floor map sync, automated kitchen display queues, geofenced staff attendance, and instant sales analytics built for modern dining hospitality.
          </p>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-white">
              <CheckCircle2 className="w-5 h-5 text-[#FF7A10] mb-1" />
              <p className="text-xs font-bold">Real-Time POS</p>
              <p className="text-[10px] text-white/60">Floor map sync</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-white">
              <MapPin className="w-5 h-5 text-[#FF7A10] mb-1" />
              <p className="text-xs font-bold">Geofence Clock</p>
              <p className="text-[10px] text-white/60">Shift perimeter</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-white">
              <UserCheck className="w-5 h-5 text-[#FF7A10] mb-1" />
              <p className="text-xs font-bold">Smart Roles</p>
              <p className="text-[10px] text-white/60">Permission matrix</p>
            </div>
          </div>
        </div>

        {/* Hero Footer Branding */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/70">
          <span>Pixora RIMS Enterprise Suite</span>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Powered by</span>
            <span className="font-extrabold text-[#FF7A10] tracking-wide text-sm">Pixorasofttech</span>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-white flex flex-col justify-between items-center p-6 sm:p-10 md:p-12 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7A10] to-[#E86000] text-white flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-xl text-[#1F221D]">
              Pixora<span className="text-[#FF7A10]">RIMS</span>
            </span>
            <span className="block text-[9px] font-bold text-[#666A64] uppercase tracking-wider">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Main Card Wrapper */}
        <div ref={cardRef} className="w-full max-w-md my-auto flex flex-col items-center">
          {/* Header Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-[#1F221D] tracking-tight">
              {selectedRole === 'admin' ? 'Administrator Login' : 'Staff Shift Check-In'}
            </h2>
            <p className="text-xs text-[#666A64] mt-1 font-medium">
              {selectedRole === 'admin'
                ? 'Sign in to access management control center'
                : 'Enter your 4-digit PIN to begin your shift'}
            </p>
          </div>

          {/* Role Toggle Switch */}
          <div className="w-full bg-[#F7F5F2] border border-[#E9E5E1] p-1 rounded-2xl flex gap-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setPin('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-[#FF7A10] shadow-xs border border-[#FF7A10]/20'
                  : 'text-[#666A64] hover:text-[#1F221D]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Admin Access
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('employee');
                setPin('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'employee'
                  ? 'bg-white text-[#FF7A10] shadow-xs border border-[#FF7A10]/20'
                  : 'text-[#666A64] hover:text-[#1F221D]'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Employee PIN
            </button>
          </div>

          {/* FORM */}
          <form ref={formRef} onSubmit={handleSignIn} className="w-full space-y-4">
            {selectedRole === 'admin' ? (
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Admin Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3.5 text-[#666A64]" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      placeholder="admin@restopos.com"
                      className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#666A64] uppercase tracking-wider mb-1 block">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 text-[#666A64]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#F7F5F2] border border-[#E9E5E1] rounded-xl pl-10 pr-10 py-3 text-xs text-[#1F221D] outline-none focus:border-[#FF7A10] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 text-[#666A64] hover:text-[#1F221D]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2">
                {/* PIN Display Dots */}
                <div className="flex items-center gap-4 mb-5">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                        idx < pin.length
                          ? 'border-[#FF7A10] bg-[#FFF2E8]'
                          : 'border-[#E9E5E1] bg-[#F7F5F2]'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${
                          idx < pin.length ? 'bg-[#FF7A10]' : 'bg-[#E9E5E1]'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeyPress(num)}
                      className="h-11 rounded-xl bg-[#F7F5F2] hover:bg-[#E9E5E1] border border-[#E9E5E1] text-base font-extrabold text-[#1F221D] transition-all active:scale-95 cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <div />
                  <button
                    type="button"
                    onClick={() => handleKeyPress('0')}
                    className="h-11 rounded-xl bg-[#F7F5F2] hover:bg-[#E9E5E1] border border-[#E9E5E1] text-base font-extrabold text-[#1F221D] transition-all active:scale-95 cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="h-11 rounded-xl bg-[#F7F5F2] hover:bg-[#C62828]/10 border border-[#E9E5E1] hover:border-[#C62828]/30 text-[#C62828] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-[#FF7A10] hover:bg-[#E86000] text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoggingIn ? 'Authenticating…' : selectedRole === 'admin' ? 'Sign In as Admin' : 'Clock-In Shift'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="w-full mt-6 pt-4 border-t border-[#E9E5E1] flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-[#666A64] uppercase tracking-wider text-center">
              Fast Demo Testing
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="flex-1 py-2 px-3 rounded-xl bg-[#F7F5F2] hover:bg-[#FFF2E8] border border-[#E9E5E1] hover:border-[#FF7A10]/30 text-[11px] font-bold text-[#1F221D] transition-all cursor-pointer"
              >
                ⚡ Fill Demo Admin
              </button>
              <button
                type="button"
                onClick={fillDemoEmployee}
                className="flex-1 py-2 px-3 rounded-xl bg-[#F7F5F2] hover:bg-[#FFF2E8] border border-[#E9E5E1] hover:border-[#FF7A10]/30 text-[11px] font-bold text-[#1F221D] transition-all cursor-pointer"
              >
                🔑 Fill Demo PIN (1234)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Powered By Branding */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[#666A64] font-medium">
          <span>Powered by</span>
          <span className="font-extrabold text-[#FF7A10] tracking-wide text-sm">Pixorasofttech</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
