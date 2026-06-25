import { useState, useMemo } from 'react';
import { Search, Calendar, Filter, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, Button, Input, Select, SectionHeader, Avatar, statusBadge, EmptyState } from '../../components/ui';
import { appointmentStorage, doctorStorage } from '../../utils/storage';
import type { Appointment } from '../../types';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState(() => appointmentStorage.getAll());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const doctors = useMemo(() => doctorStorage.getAll(), []);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => {
        const q = search.toLowerCase();
        const matchSearch = !q || a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
        const matchStatus = !filterStatus || a.status === filterStatus;
        const matchDoc = !filterDoctor || a.doctorId === filterDoctor;
        return matchSearch && matchStatus && matchDoc;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [appointments, search, filterStatus, filterDoctor]);

  const refresh = () => setAppointments(appointmentStorage.getAll());

  const updateStatus = (id: string, status: Appointment['status']) => {
    const apt = appointmentStorage.getById(id);
    if (!apt) return;
    appointmentStorage.update({ ...apt, status });
    refresh();
  };
  const deleteApt = (id: string) => { appointmentStorage.delete(id); refresh(); };

  const counts = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }), [appointments]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Appointments" subtitle={`${counts.total} total · ${counts.pending} pending review`} />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'bg-gray-100 text-gray-700', onClick: () => setFilterStatus('') },
          { label: 'Pending', value: counts.pending, color: 'bg-amber-100 text-amber-700', onClick: () => setFilterStatus('pending') },
          { label: 'Confirmed', value: counts.confirmed, color: 'bg-teal-100 text-teal-700', onClick: () => setFilterStatus('confirmed') },
          { label: 'Completed', value: counts.completed, color: 'bg-sage-100 text-sage-700', onClick: () => setFilterStatus('completed') },
        ].map(c => (
          <button key={c.label} onClick={c.onClick} className={`${c.color} px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80`}>
            {c.value} {c.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input icon={<Search size={15} />} placeholder="Search patient, doctor, department…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
          <Select options={STATUS_OPTIONS} placeholder="All Statuses" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="sm:w-40" />
          <Select
            options={doctors.map(d => ({ value: d.id, label: d.name }))}
            placeholder="All Doctors"
            value={filterDoctor}
            onChange={e => setFilterDoctor(e.target.value)}
            className="sm:w-48"
          />
        </div>
      </Card>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Calendar size={28} />} title="No appointments found" description="Try adjusting your filters." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Patient', 'Doctor', 'Date & Time', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(apt => (
                  <tr key={apt.id} className={`hover:bg-gray-50/60 transition-colors ${apt.date === today ? 'bg-teal-50/30' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={apt.patientName} size="sm" />
                        <span className="text-sm font-medium text-navy-800">{apt.patientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-700">{apt.doctorName}</p>
                      <p className="text-xs text-gray-400">{apt.department}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {apt.date === today && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse-soft" />}
                        <div>
                          <p className="text-sm font-medium text-gray-700">{apt.date}</p>
                          <p className="text-xs text-gray-400">{apt.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[180px]">
                      <p className="text-xs text-gray-600 line-clamp-2">{apt.reason}</p>
                    </td>
                    <td className="px-5 py-4">{statusBadge(apt.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {apt.status === 'pending' && (
                          <button onClick={() => updateStatus(apt.id, 'confirmed')} title="Confirm" className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors">
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <>
                            <button onClick={() => updateStatus(apt.id, 'completed')} title="Mark complete" className="p-1.5 rounded-lg text-sage-600 hover:bg-sage-50 transition-colors">
                              <Clock size={15} />
                            </button>
                            <button onClick={() => updateStatus(apt.id, 'cancelled')} title="Cancel" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteApt(apt.id)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
            Showing {filtered.length} of {appointments.length} appointments
          </div>
        </Card>
      )}
    </div>
  );
}
