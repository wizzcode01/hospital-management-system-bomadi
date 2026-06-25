import { useState, useMemo } from 'react';
import { Plus, Calendar, XCircle, Search, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, SectionHeader, Avatar, statusBadge, EmptyState, Modal, Alert } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { appointmentStorage, doctorStorage, patientStorage, generateId } from '../../utils/storage';
import type { Appointment } from '../../types';

const TIMES = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM'];

export default function PatientAppointments() {
  const { profileId, user } = useAuth();
  const [appointments, setAppointments] = useState(() =>
    profileId ? appointmentStorage.getByPatient(profileId) : []
  );
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [bookModal, setBookModal] = useState(false);
  const [cancelModal, setCancelModal] = useState<Appointment | null>(null);
  const [formError, setFormError] = useState('');

  const doctors = useMemo(() => doctorStorage.getAll().filter(d => d.status === 'active'), []);
  const patient = useMemo(() => profileId ? patientStorage.getById(profileId) : null, [profileId]);

  // Form state
  const [selDoctor, setSelDoctor] = useState('');
  const [selDate, setSelDate] = useState('');
  const [selTime, setSelTime] = useState('');
  const [reason, setReason] = useState('');

  const refresh = () => setAppointments(profileId ? appointmentStorage.getByPatient(profileId) : []);

  const filtered = useMemo(() => appointments.filter(a => {
    const q = search.toLowerCase();
    const mS = !q || a.doctorName.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q);
    const mSt = !filterStatus || a.status === filterStatus;
    return mS && mSt;
  }).sort((a, b) => b.date.localeCompare(a.date)), [appointments, search, filterStatus]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selDoctor || !selDate || !selTime || !reason.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (selDate < todayStr) { setFormError('Please select a future date.'); return; }
    if (!patient || !profileId) return;

    const doctor = doctors.find(d => d.id === selDoctor);
    if (!doctor) return;

    // Check clash
    const doctorApts = appointmentStorage.getByDoctor(selDoctor);
    const clash = doctorApts.find(a => a.date === selDate && a.time === selTime && (a.status === 'pending' || a.status === 'confirmed'));
    if (clash) { setFormError('This time slot is already booked. Please choose another.'); return; }

    const apt: Appointment = {
      id: generateId('apt'),
      patientId: profileId,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      date: selDate,
      time: selTime,
      reason: reason.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    appointmentStorage.add(apt);
    refresh();
    setBookModal(false);
    setSelDoctor(''); setSelDate(''); setSelTime(''); setReason('');
  };

  const handleCancel = () => {
    if (!cancelModal) return;
    appointmentStorage.update({ ...cancelModal, status: 'cancelled' });
    refresh();
    setCancelModal(null);
  };

  const selectedDoctor = doctors.find(d => d.id === selDoctor);

  const upcoming = filtered.filter(a => a.date >= todayStr && (a.status === 'pending' || a.status === 'confirmed'));
  const past = filtered.filter(a => !(a.date >= todayStr && (a.status === 'pending' || a.status === 'confirmed')));

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="My Appointments"
        subtitle={`${appointments.filter(a => a.status !== 'cancelled').length} appointments`}
        action={<Button icon={<Plus size={16} />} onClick={() => setBookModal(true)}>Book Appointment</Button>}
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input icon={<Search size={15} />} placeholder="Search doctor, reason…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
          <Select
            options={[{ value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]}
            placeholder="All Statuses"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="sm:w-44"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title="No appointments yet"
          description="Book your first appointment to get started."
          action={<Button icon={<Plus size={16} />} onClick={() => setBookModal(true)}>Book Appointment</Button>}
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map(apt => (
                  <Card key={apt.id} className="p-5 border-l-4 border-l-teal-400">
                    <div className="flex items-start gap-4">
                      <Avatar name={apt.doctorName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-navy-800">{apt.doctorName}</p>
                            <p className="text-xs text-teal-600 font-medium">{apt.department}</p>
                          </div>
                          {statusBadge(apt.status)}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={12} />{apt.date}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{apt.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2">{apt.reason}</p>
                      </div>
                    </div>
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        <Button variant="danger" size="sm" icon={<XCircle size={13} />} onClick={() => setCancelModal(apt)}>
                          Cancel Appointment
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past</h2>
              <div className="space-y-3">
                {past.map(apt => (
                  <Card key={apt.id} className="p-5 opacity-80">
                    <div className="flex items-center gap-4">
                      <Avatar name={apt.doctorName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-800 text-sm">{apt.doctorName}</p>
                        <p className="text-xs text-gray-400 truncate">{apt.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">{apt.date} · {apt.time}</p>
                        <div className="mt-1">{statusBadge(apt.status)}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Book Modal */}
      <Modal open={bookModal} onClose={() => { setBookModal(false); setFormError(''); }} title="Book Appointment" size="lg">
        {formError && <div className="mb-4"><Alert type="error"><p>{formError}</p></Alert></div>}
        <form onSubmit={handleBook} className="space-y-4">
          <Select
            label="Select Doctor"
            value={selDoctor}
            onChange={e => setSelDoctor(e.target.value)}
            options={doctors.map(d => ({ value: d.id, label: `${d.name} — ${d.specialization}` }))}
            placeholder="Choose a doctor"
            required
          />

          {selectedDoctor && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center gap-3">
              <Avatar name={selectedDoctor.name} size="md" />
              <div>
                <p className="text-sm font-semibold text-teal-800">{selectedDoctor.name}</p>
                <p className="text-xs text-teal-600">{selectedDoctor.specialization} · {selectedDoctor.department}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Available: {selectedDoctor.availableDays.join(', ')} · {selectedDoctor.availableHours}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Appointment Date"
              type="date"
              value={selDate}
              onChange={e => setSelDate(e.target.value)}
              min={todayStr}
              required
            />
            <Select
              label="Preferred Time"
              value={selTime}
              onChange={e => setSelTime(e.target.value)}
              options={TIMES.map(t => ({ value: t, label: t }))}
              placeholder="Select time"
              required
            />
          </div>

          <Textarea
            label="Reason for Visit"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Briefly describe your symptoms or reason for the appointment…"
            rows={3}
            required
          />

          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-700">
            ℹ️ Your appointment will be pending confirmation from the hospital. You'll see the status update here.
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setBookModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" icon={<Calendar size={15} />}>Book Appointment</Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirm */}
      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Appointment" size="sm">
        <p className="text-sm text-gray-600 mb-2">Are you sure you want to cancel your appointment with</p>
        <p className="font-semibold text-navy-800 mb-1">{cancelModal?.doctorName}</p>
        <p className="text-sm text-gray-500 mb-5">{cancelModal?.date} at {cancelModal?.time}</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setCancelModal(null)}>Keep It</Button>
          <Button variant="danger" className="flex-1" onClick={handleCancel}>Yes, Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
