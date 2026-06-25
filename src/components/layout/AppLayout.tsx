import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Heart, LayoutDashboard, Users, UserCog, Calendar,
  FileText, LogOut, Menu, X, Bell, ChevronRight, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge } from '../ui';
import { notificationStorage } from '../../utils/storage';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const adminNav: NavItem[] = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/doctors', icon: <UserCog size={18} />, label: 'Doctors' },
  { to: '/admin/patients', icon: <Users size={18} />, label: 'Patients' },
  { to: '/admin/appointments', icon: <Calendar size={18} />, label: 'Appointments' },
  { to: '/admin/records', icon: <FileText size={18} />, label: 'Medical Records' },
];

const doctorNav: NavItem[] = [
  { to: '/doctor', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/doctor/appointments', icon: <Calendar size={18} />, label: 'Appointments' },
  { to: '/doctor/patients', icon: <Users size={18} />, label: 'My Patients' },
  { to: '/doctor/records', icon: <FileText size={18} />, label: 'Medical Records' },
];

const patientNav: NavItem[] = [
  { to: '/patient', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/patient/appointments', icon: <Calendar size={18} />, label: 'My Appointments' },
  { to: '/patient/doctors', icon: <UserCog size={18} />, label: 'Find Doctors' },
  { to: '/patient/records', icon: <FileText size={18} />, label: 'My Records' },
  { to: '/patient/profile', icon: <Users size={18} />, label: 'My Profile' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'admin' ? adminNav : role === 'doctor' ? doctorNav : patientNav;
  const roleLabel = role === 'admin' ? 'Administrator' : role === 'doctor' ? 'Physician' : 'Patient';
  const unread = user ? notificationStorage.getByUser(user.id).filter(n => !n.read).length : 0;

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'flex' : 'hidden lg:flex'}
      flex-col h-full w-64 bg-navy-900 text-white
    `}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Heart size={17} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">GH Bomadi</p>
            <p className="text-teal-400 text-xs">Medical System</p>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role tag */}
      <div className="px-5 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-teal-400" />
          <span className="text-teal-400 text-xs font-medium uppercase tracking-widest">{roleLabel} Portal</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/doctor' || item.to === '/patient'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 group
              ${isActive
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/8'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-teal-400 transition-colors'}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-teal-200" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
          <Avatar name={user?.name ?? 'User'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 mt-0.5"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-10 animate-slide-in">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 h-14 flex items-center justify-between flex-shrink-0 shadow-[0_1px_3px_0_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="hidden lg:block">
              <p className="text-xs text-gray-400 font-medium">
                {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative">
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>
            </div>
            <div className="h-7 w-px bg-gray-200 mx-1" />
            <div className="flex items-center gap-2.5 pl-1">
              <Avatar name={user?.name ?? 'User'} size="sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-navy-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-400">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
