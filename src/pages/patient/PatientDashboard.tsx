import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, User, Stethoscope, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { StatCard, Card, SectionHeader, Avatar, statusBadge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { patientStorage, appointmentStorage, recordStorage } from '../../utils/storage';

export default function PatientDashboard() {
  const { user, profileId } = useAuth();
  const navigate = useNavigate();

  const patient = useMemo(() => profileId ? patientStorage.getById(profileId) : null, [profileId]);
  const today = new Date().toISOString().split('T')[0];

  const data = useMemo(() => {
    if (!profileId) return null;
    const apts = appointmentStorage.getByPatient(profileId);
    const records = recordStorage.getByPatient(profileId);
    const upcoming = apts.filter(a => a.date >= today && (a.status === 'pending' || a.status === 'confirmed'))
      .sort((a, b) => a.date.localeCompare(b.date));
    return {
      total: apts.length,
      upcoming: upcoming.length,
      completed: apts.filter(a => a.status === 'completed').length,
      records: records.length,
      nextApt: upcoming[0] ?? null,
      recentApts: [...apts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
      recentRecords: [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    };
  }, [profileId, today]);

  const age = (dob: string) => new Date().getFullYear() - new Date(dob).getFullYear();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero welcome */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white rounded-full" />
          <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-teal-300 rounded-full" />
        </div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-teal-100 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold mt-0.5">{patient?.name ?? user?.name}</h1>
            {patient && (
              <p className="text-teal-100 text-sm mt-1">
                {patient.gender} · {age(patient.dateOfBirth)} yrs · Blood Group: <strong className="text-white">{patient.bloodGroup}</strong>
              </p>
            )}
          </div>
          <Avatar name={patient?.name ?? user?.name ?? 'P'} size="lg" className="ring-2 ring-white/30" />
        </div>
        {data?.nextApt && (
          <div className="relative z-10 mt-5 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-teal-100 text-xs font-medium mb-1">Next Appointment</p>
            <p className="text-white font-semibold">{data.nextApt.doctorName}</p>
            <p className="text-teal-100 text-sm">{data.nextApt.date} at {data.nextApt.time} · {data.nextApt.department}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Upcoming" value={data?.upcoming ?? 0} icon={<Clock size={20} />} color="teal" />
        <StatCard label="Completed" value={data?.completed ?? 0} icon={<CheckCircle size={20} />} color="sage" />
        <StatCard label="Total Appointments" value={data?.total ?? 0} icon={<Calendar size={20} />} color="sky" />
        <StatCard label="Medical Records" value={data?.records ?? 0} icon={<FileText size={20} />} color="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Appointments */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-navy-800">My Appointments</h2>
            <button onClick={() => navigate('/patient/appointments')} className="text-xs text-teal-600 hover:underline font-medium">View all</button>
          </div>
          {!data?.recentApts.length ? (
            <div className="py-12 text-center">
              <Calendar size={40} className="text-teal-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">No appointments yet</p>
              <button onClick={() => navigate('/patient/appointments')} className="text-xs text-teal-600 mt-1.5 hover:underline">Book your first appointment</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentApts.map(apt => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-4">
                  <Avatar name={apt.doctorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-800">{apt.doctorName}</p>
                    <p className="text-xs text-gray-400 truncate">{apt.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-700">{apt.date}</p>
                    <div className="mt-0.5">{statusBadge(apt.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Allergies */}
          {patient?.allergies && patient.allergies.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={15} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-navy-800">My Allergies</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map(a => (
                  <span key={a} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full font-medium">{a}</span>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Records */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy-800">Recent Records</h3>
              <button onClick={() => navigate('/patient/records')} className="text-xs text-teal-600 hover:underline">View all</button>
            </div>
            {!data?.recentRecords.length ? (
              <p className="text-xs text-gray-400 text-center py-6">No records yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.recentRecords.map(rec => (
                  <div key={rec.id} className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-teal-600">{rec.diagnosis}</p>
                    <p className="text-xs text-gray-500 mt-0.5">by {rec.doctorName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{rec.date}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Quick Actions</h3>
            {[
              { label: 'Book Appointment', icon: <Calendar size={16} className="text-teal-500" />, path: '/patient/appointments' },
              { label: 'Find a Doctor', icon: <Stethoscope size={16} className="text-teal-500" />, path: '/patient/doctors' },
              { label: 'View My Records', icon: <FileText size={16} className="text-teal-500" />, path: '/patient/records' },
              { label: 'My Profile', icon: <User size={16} className="text-teal-500" />, path: '/patient/profile' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all text-left font-medium">
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
