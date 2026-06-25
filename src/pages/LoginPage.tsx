import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  Eye, EyeOff, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/ui';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@ghbomadi.ng', password: 'admin123', color: 'bg-navy-800 text-white' },
  { role: 'Doctor', email: 'dr.okonkwo@ghbomadi.ng', password: 'doctor123', color: 'bg-teal-500 text-white' },
  { role: 'Patient', email: 'emeka.nwosu@email.com', password: 'patient123', color: 'bg-sage-500 text-white' },
];

export default function LoginPage() {
  const { login, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(email, password);
    setLoading(false);
    if (!result.success) { setError(result.message); return; }
    // redirect based on role
    const r = result;
    // We need to read role from context after login - use a small trick
    const storedUser = JSON.parse(localStorage.getItem('ghb_current_user') ?? '{}');
    const dest = storedUser.role === 'admin' ? '/admin' : storedUser.role === 'doctor' ? '/doctor' : '/patient';
    navigate(dest, { replace: true });
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full translate-y-32 -translate-x-20" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-navy-700/40 rounded-full -translate-x-32 -translate-y-32" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">GH Bomadi</p>
              <p className="text-teal-300 text-xs">Healthcare Management</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Modern healthcare<br />
            <span className="text-teal-400">starts here.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            A unified platform for patients, doctors, and administrators at General Hospital Bomadi Delta State, Nigeria.
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { icon: '', title: 'Role-Based Access', desc: 'Secure login for all users' },
            { icon: '', title: 'Digital Records', desc: 'EMR for every patient' },
            { icon: '', title: 'Appointments', desc: 'Book and manage online' },
            { icon: '', title: 'Reports', desc: 'Real-time analytics' },
          ].map(f => (
            <div key={f.title} className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl mb-2">{f.icon}</p>
              <p className="text-white text-sm font-semibold">{f.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© 2025 General Hospital Bomadi · Delta State Government</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-navy-900 font-bold text-lg">GH Bomadi</p>
              <p className="text-gray-500 text-xs">Healthcare Management</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_-4px_rgb(0,0,0,0.08)] border border-gray-100">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-navy-900">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
            </div>

            {error && <Alert type="error" ><p>{error}</p></Alert>}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
               // icon={<Mail size={15} />}
                required
                autoComplete="email"
              />
              <div>
                <Input
                  label="Password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                 // icon={<Lock size={15} />}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 mt-[-34px] ml-[calc(100%-44px)] text-gray-400 hover:text-gray-600"
                  style={{ position: 'relative', float: 'right', marginTop: '-34px', marginRight: '4px' }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
               {/* <Shield size={16} /> */}
                Sign In Securely
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-7 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">Quick Demo Access</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.role}
                    onClick={() => fillDemo(acc)}
                    className={`${acc.color} text-xs font-semibold py-2 px-3 rounded-xl transition-all duration-150 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    {acc.role}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Click a role to auto-fill credentials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
