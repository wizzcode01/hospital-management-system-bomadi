import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { StatCard, Card, SectionHeader, Avatar, statusBadge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { doctorStorage, appointmentStorage, recordStorage } from '../../utils/storage';

export default function DoctorDashboard() {
  const { user, profileId } = useAuth();
  const navigate = useNavigate();

  const doctor = useMemo(() => profileId ? doctorStorage.getById(profileId) : null, [profileId]);
  const today = new Date().toISOString().split('T')[0];

  const data = useMemo(() => {
    if (!profileId) return null;
    const all = appointmentStorage.getByDoctor(profileId);
    const records = recordStorage.getByDoctor(profileId);
    const uniquePatients = new Set(all.map(a => a.patientId)).size;
    return {
      all,
      todayApts: all.filter(a => a.date === today),
      pending: all.filter(a => a.status === 'pending').length,
      completed: all.filter(a => a.status === 'completed').length,
      uniquePatients,
      recentRecords: [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    };
  }, [profileId, today]);

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full -translate-y-20 translate-x-20" />
        </div>
        <div className="relative z-10">
          <p className="text-teal-300 text-sm font-medium">{timeOfDay()},</p>
          <h1 className="text-2xl font-bold mt-1">{doctor?.name ?? user?.name}</h1>
          <p className="text-gray-300 text-sm mt-1">{doctor?.specialization} · {doctor?.department}</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-white/10 rounded-xl px-3 py-1.5"> {data?.todayApts.length ?? 0} appointments today</span>
            {doctor?.availableHours && <span className="bg-white/10 rounded-xl px-3 py-1.5"> {doctor.availableHours}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Today's Appointments" value={data?.todayApts.length ?? 0} icon={<Calendar size={20} />} color="teal" />
        <StatCard label="My Patients" value={data?.uniquePatients ?? 0} icon={<Users size={20} />} color="navy" />
        <StatCard label="Completed" value={data?.completed ?? 0} icon={<CheckCircle size={20} />} color="sage" />
        <StatCard label="Pending" value={data?.pending ?? 0} icon={<Clock size={20} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-base font-semibold text-navy-800">Today's Schedule</h2>
              <p className="text-xs text-gray-400">{today}</p>
            </div>
            <button onClick={() => navigate('/doctor/appointments')} className="text-xs text-teal-600 hover:underline font-medium">View all</button>
          </div>
          {!data?.todayApts.length ? (
            <div className="py-12 text-center">
              <Sparkles size={32} className="text-teal-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">No appointments today</p>
              <p className="text-xs text-gray-400 mt-1">Enjoy your day!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.todayApts.map((apt, i) => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center text-xs font-bold text-teal-600 flex-shrink-0">{i + 1}</div>
                  <Avatar name={apt.patientName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-800">{apt.patientName}</p>
                    <p className="text-xs text-gray-400 truncate">{apt.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-700">{apt.time}</p>
                    <div className="mt-0.5">{statusBadge(apt.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Records */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-navy-800">Recent Records</h2>
          </div>
          {!data?.recentRecords.length ? (
            <div className="py-10 text-center text-sm text-gray-400">No records yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentRecords.map(rec => (
                <div key={rec.id} className="px-5 py-4">
                  <p className="text-sm font-semibold text-navy-800">{rec.patientName}</p>
                  <p className="text-xs text-teal-600 font-medium mt-0.5 line-clamp-1">{rec.diagnosis}</p>
                  <p className="text-xs text-gray-400 mt-1">{rec.date}</p>
                </div>
              ))}
            </div>
          )}
          <div className="px-5 py-3 border-t border-gray-50">
            <button onClick={() => navigate('/doctor/records')} className="text-xs text-teal-600 hover:underline font-medium">View all records</button>
          </div>
        </Card>
      </div>

      {/* Quick info */}
      {doctor && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-navy-800 mb-4">My Schedule</h3>
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day} className={`px-3 py-2 rounded-xl text-xs font-medium ${doctor.availableDays.includes(day) ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {day.slice(0, 3)}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">Working hours: <strong className="text-gray-700">{doctor.availableHours}</strong></p>
        </Card>
      )}
    </div>
  );
}
