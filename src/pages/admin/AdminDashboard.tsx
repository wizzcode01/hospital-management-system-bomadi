import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCog, Calendar, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { StatCard, Card, SectionHeader, Avatar, statusBadge } from '../../components/ui';
import { doctorStorage, patientStorage, appointmentStorage } from '../../utils/storage';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const doctors = doctorStorage.getAll();
    const patients = patientStorage.getAll();
    const appointments = appointmentStorage.getAll();
    const today = new Date().toISOString().split('T')[0];
    return {
      totalDoctors: doctors.length,
      activeDoctors: doctors.filter(d => d.status === 'active').length,
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      todayAppointments: appointments.filter(a => a.date === today).length,
      pending: appointments.filter(a => a.status === 'pending').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      recent: [...appointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    };
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Dashboard Overview"
        subtitle="General Hospital Bomadi Administrative Portal"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Patients" value={stats.totalPatients} icon={<Users size={20} />} color="teal" trend={{ value: 12, label: 'this month' }} />
        <StatCard label="Active Doctors" value={stats.activeDoctors} icon={<UserCog size={20} />} color="navy" />
        <StatCard label="Today's Appointments" value={stats.todayAppointments} icon={<Calendar size={20} />} color="sky" />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle size={20} />} color="sage" trend={{ value: 8, label: 'this week' }} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: stats.pending, color: 'bg-amber-50 border-amber-100', textColor: 'text-amber-700', iconColor: 'text-amber-500', icon: <Clock size={20} /> },
          { label: 'Confirmed Today', value: stats.confirmed, color: 'bg-teal-50 border-teal-100', textColor: 'text-teal-700', iconColor: 'text-teal-500', icon: <Activity size={20} /> },
          { label: 'Total Appointments', value: stats.totalAppointments, color: 'bg-sky-50 border-sky-100', textColor: 'text-sky-700', iconColor: 'text-sky-500', icon: <TrendingUp size={20} /> },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 flex items-center gap-4 ${s.color}`}>
            <div className={`${s.iconColor}`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div>
            <h2 className="text-base font-semibold text-navy-800">Recent Appointments</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest booking activity</p>
          </div>
          <button
            onClick={() => navigate('/admin/appointments')}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline"
          >
            View all →
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recent.map(apt => (
            <div key={apt.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors">
              <Avatar name={apt.patientName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-800 truncate">{apt.patientName}</p>
                <p className="text-xs text-gray-400 truncate">{apt.doctorName} · {apt.department}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-700">{apt.date}</p>
                <p className="text-xs text-gray-400">{apt.time}</p>
              </div>
              <div className="flex-shrink-0">{statusBadge(apt.status)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Add Doctor', icon: '', path: '/admin/doctors', color: 'hover:border-teal-200 hover:bg-teal-50' },
          { label: 'View Patients', icon: '', path: '/admin/patients', color: 'hover:border-sky-200 hover:bg-sky-50' },
          { label: 'All Appointments', icon: '', path: '/admin/appointments', color: 'hover:border-amber-200 hover:bg-amber-50' },
          { label: 'Medical Records', icon: '', path: '/admin/records', color: 'hover:border-sage-200 hover:bg-sage-50' },
        ].map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`bg-white border border-gray-100 rounded-2xl p-5 text-center transition-all duration-150 ${action.color} cursor-pointer`}
          >
            <p className="text-3xl mb-2">{action.icon}</p>
            <p className="text-sm font-semibold text-gray-700">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
