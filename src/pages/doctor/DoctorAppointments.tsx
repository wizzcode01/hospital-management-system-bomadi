import { useState, useMemo } from 'react';
import { Search, CheckCircle, XCircle, FileText, Plus, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, SectionHeader, Avatar, statusBadge, EmptyState, Modal, Alert } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { appointmentStorage, recordStorage, generateId } from '../../utils/storage';
import type { Appointment, MedicalRecord, Prescription } from '../../types';

const BLANK_RX = (): Prescription => ({
  id: generateId('rx'), medication: '', dosage: '', frequency: '', duration: '', instructions: '',
});

export default function DoctorAppointments() {
  const { profileId, user } = useAuth();
  const [appointments, setAppointments] = useState(() =>
    profileId ? appointmentStorage.getByDoctor(profileId) : []
  );
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [recordModal, setRecordModal] = useState<Appointment | null>(null);
  const [formError, setFormError] = useState('');

  // Record form state
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([BLANK_RX()]);

  const refresh = () => setAppointments(profileId ? appointmentStorage.getByDoctor(profileId) : []);

  const filtered = useMemo(() => appointments.filter(a => {
    const q = search.toLowerCase();
    const matchS = !q || a.patientName.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q);
    const matchSt = !filterStatus || a.status === filterStatus;
    return matchS && matchSt;
  }).sort((a, b) => b.date.localeCompare(a.date)), [appointments, search, filterStatus]);

  const today = new Date().toISOString().split('T')[0];

  const updateStatus = (id: string, status: Appointment['status']) => {
    const apt = appointmentStorage.getById(id);
    if (!apt) return;
    appointmentStorage.update({ ...apt, status });
    refresh();
  };

  const openRecord = (apt: Appointment) => {
    setRecordModal(apt);
    setComplaint(''); setDiagnosis(''); setTreatment(''); setNotes(''); setFollowUp('');
    setPrescriptions([BLANK_RX()]);
    setFormError('');
  };

  const addRx = () => setPrescriptions(p => [...p, BLANK_RX()]);
  const removeRx = (id: string) => setPrescriptions(p => p.filter(r => r.id !== id));
  const updateRx = (id: string, field: keyof Prescription, value: string) =>
    setPrescriptions(p => p.map(r => r.id === id ? { ...r, [field]: value } : r));

  const submitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordModal || !profileId) return;
    if (!complaint || !diagnosis || !treatment) { setFormError('Chief complaint, diagnosis, and treatment are required.'); return; }
    const rec: MedicalRecord = {
      id: generateId('mr'),
      patientId: recordModal.patientId,
      patientName: recordModal.patientName,
      doctorId: profileId,
      doctorName: user?.name ?? '',
      appointmentId: recordModal.id,
      date: today,
      chiefComplaint: complaint,
      diagnosis,
      treatment,
      prescription: prescriptions.filter(r => r.medication.trim()),
      notes: notes || undefined,
      followUpDate: followUp || undefined,
      createdAt: new Date().toISOString(),
    };
    recordStorage.add(rec);
    updateStatus(recordModal.id, 'completed');
    setRecordModal(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="My Appointments" subtitle={`${appointments.length} total appointments`} />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input icon={<Search size={15} />} placeholder="Search patient name, reason…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
          <Select
            options={[{ value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]}
            placeholder="All Statuses"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="sm:w-40"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText size={28} />} title="No appointments" description="Your appointments will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <Card key={apt.id} className={`p-5 ${apt.date === today ? 'border-teal-200' : ''}`}>
              <div className="flex items-start gap-4">
                <Avatar name={apt.patientName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy-800">{apt.patientName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{apt.date} at {apt.time}</p>
                    </div>
                    {statusBadge(apt.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2">{apt.reason}</p>
                  {apt.notes && <p className="text-xs text-gray-500 italic mt-1.5 px-3">Note: {apt.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 border-t border-gray-50 pt-3">
                {apt.status === 'pending' && (
                  <Button variant="secondary" size="sm" icon={<CheckCircle size={13} />} onClick={() => updateStatus(apt.id, 'confirmed')}>Confirm</Button>
                )}
                {(apt.status === 'confirmed' || apt.status === 'pending') && (
                  <Button size="sm" icon={<FileText size={13} />} onClick={() => openRecord(apt)}>Write Record & Complete</Button>
                )}
                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <Button variant="danger" size="sm" icon={<XCircle size={13} />} onClick={() => updateStatus(apt.id, 'cancelled')}>Cancel</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Write Medical Record Modal */}
      <Modal open={!!recordModal} onClose={() => setRecordModal(null)} title={`Medical Record — ${recordModal?.patientName}`} size="xl">
        {formError && <Alert type="error"><p className="mb-3">{formError}</p></Alert>}
        <form onSubmit={submitRecord} className="space-y-4">
          <Textarea label="Chief Complaint" value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="Patient's primary complaint…" rows={2} required />
          <Textarea label="Diagnosis" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Clinical diagnosis…" rows={2} required />
          <Textarea label="Treatment Plan" value={treatment} onChange={e => setTreatment(e.target.value)} placeholder="Prescribed treatment and instructions…" rows={3} required />

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Prescriptions</label>
              <Button type="button" variant="ghost" size="sm" icon={<Plus size={13} />} onClick={addRx}>Add Medication</Button>
            </div>
            <div className="space-y-3">
              {prescriptions.map((rx, i) => (
                <div key={rx.id} className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-teal-700">Medication {i + 1}</p>
                    {prescriptions.length > 1 && (
                      <button type="button" onClick={() => removeRx(rx.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Medication name" value={rx.medication} onChange={e => updateRx(rx.id, 'medication', e.target.value)} />
                    <Input placeholder="Dosage e.g. 500mg" value={rx.dosage} onChange={e => updateRx(rx.id, 'dosage', e.target.value)} />
                    <Input placeholder="Frequency e.g. Twice daily" value={rx.frequency} onChange={e => updateRx(rx.id, 'frequency', e.target.value)} />
                    <Input placeholder="Duration e.g. 7 days" value={rx.duration} onChange={e => updateRx(rx.id, 'duration', e.target.value)} />
                  </div>
                  <Input placeholder="Special instructions" value={rx.instructions} onChange={e => updateRx(rx.id, 'instructions', e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Textarea label="Doctor's Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional observations…" />
            <Input label="Follow-Up Date (optional)" type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setRecordModal(null)}>Cancel</Button>
            <Button type="submit" className="flex-1" icon={<CheckCircle size={15} />}>Save Record & Complete</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
