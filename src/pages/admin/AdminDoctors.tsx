import { useState, useMemo } from 'react';
import { Plus, Search, Phone, Mail, Trash2, Edit3, Stethoscope } from 'lucide-react';
import { Card, Button, Input, Select, Textarea, SectionHeader, Avatar, Badge, statusBadge, EmptyState, Modal } from '../../components/ui';
import { doctorStorage, userStorage, generateId } from '../../utils/storage';
import type { Doctor, User } from '../../types';

const SPECIALIZATIONS = [
  'General Medicine', 'Obstetrics & Gynaecology', 'Paediatrics', 'Surgery',
  'Internal Medicine', 'Emergency Medicine', 'Psychiatry', 'Dermatology',
  'Cardiology', 'Neurology', 'Ophthalmology', 'ENT',
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BLANK: Omit<Doctor, 'id' | 'userId' | 'createdAt' | 'status'> = {
  name: '', email: '', specialization: '', department: '', phone: '',
  availableDays: [], availableHours: '', yearsExperience: 1, qualifications: [], bio: '',
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState(() => doctorStorage.getAll());
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Doctor | null>(null);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState(BLANK);
  const [qualInput, setQualInput] = useState('');

  const filtered = useMemo(() => doctors.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.department.toLowerCase().includes(q);
    const matchSpec = !filterSpec || d.specialization === filterSpec;
    return matchSearch && matchSpec;
  }), [doctors, search, filterSpec]);

  const refresh = () => setDoctors(doctorStorage.getAll());

  const openAdd = () => { setEditDoctor(null); setForm(BLANK); setQualInput(''); setModalOpen(true); };
  const openEdit = (d: Doctor) => {
    setEditDoctor(d);
    setForm({ name: d.name, email: d.email, specialization: d.specialization, department: d.department, phone: d.phone, availableDays: d.availableDays, availableHours: d.availableHours, yearsExperience: d.yearsExperience, qualifications: d.qualifications, bio: d.bio });
    setQualInput(d.qualifications.join('\n'));
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quals = qualInput.split('\n').map(q => q.trim()).filter(Boolean);
    if (editDoctor) {
      const updated = { ...editDoctor, ...form, qualifications: quals };
      doctorStorage.update(updated);
    } else {
      const userId = generateId('u-doc');
      const newUser: User = { id: userId, email: form.email, password: 'doctor123', role: 'doctor', name: form.name, createdAt: new Date().toISOString() };
      userStorage.add(newUser);
      const doc: Doctor = { id: generateId('d'), userId, ...form, qualifications: quals, status: 'active', createdAt: new Date().toISOString() };
      doctorStorage.add(doc);
    }
    refresh(); setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    doctorStorage.delete(deleteModal.id);
    refresh(); setDeleteModal(null);
  };

  const toggleDay = (day: string) =>
    setForm(f => ({ ...f, availableDays: f.availableDays.includes(day) ? f.availableDays.filter(d => d !== day) : [...f.availableDays, day] }));

  const toggleStatus = (doc: Doctor) => {
    const updated = { ...doc, status: doc.status === 'active' ? 'inactive' as const : 'active' as const };
    doctorStorage.update(updated); refresh();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader
        title="Doctors"
        subtitle={`${doctors.filter(d => d.status === 'active').length} active physicians`}
        action={<Button icon={<Plus size={16} />} onClick={openAdd}>Add Doctor</Button>}
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input icon={<Search size={15} />} placeholder="Search by name, specialization…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
          <Select
            options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))}
            placeholder="All Specializations"
            value={filterSpec}
            onChange={e => setFilterSpec(e.target.value)}
            className="sm:w-56"
          />
        </div>
      </Card>

      {/* Doctors Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Stethoscope size={28} />} title="No doctors found" description="Try adjusting your search or add a new doctor." action={<Button onClick={openAdd} icon={<Plus size={16} />}>Add Doctor</Button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {filtered.map(doc => (
            <Card key={doc.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={doc.name} size="lg" />
                  <div>
                    <p className="font-semibold text-navy-800 text-sm">{doc.name}</p>
                    <p className="text-xs text-teal-600 font-medium">{doc.specialization}</p>
                    <p className="text-xs text-gray-400">{doc.department}</p>
                  </div>
                </div>
                {statusBadge(doc.status)}
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Mail size={12} className="text-gray-400" />{doc.email}</div>
                <div className="flex items-center gap-2"><Phone size={12} className="text-gray-400" />{doc.phone}</div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400"></span>
                  {doc.availableDays.slice(0, 3).join(', ')}{doc.availableDays.length > 3 ? ` +${doc.availableDays.length - 3}` : ''} · {doc.availableHours}
                </div>
                <div className="flex items-center gap-2"><span className="text-gray-400"></span>{doc.yearsExperience} years experience</div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <Button variant="ghost" size="sm" icon={<Edit3 size={13} />} onClick={() => openEdit(doc)} className="flex-1">Edit</Button>
                <Button
                  variant={doc.status === 'active' ? 'secondary' : 'success'}
                  size="sm"
                  onClick={() => toggleStatus(doc)}
                  className="flex-1"
                >
                  {doc.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setDeleteModal(doc)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editDoctor ? 'Edit Doctor' : 'Add New Doctor'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Dr. First Last" />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="dr.name@ghbomadi.ng" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Specialization" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))} placeholder="Select specialization" required />
            <Input label="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required placeholder="e.g. Internal Medicine" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234 800 000 0000" />
            <Input label="Years of Experience" type="number" min={0} max={50} value={form.yearsExperience} onChange={e => setForm(f => ({ ...f, yearsExperience: Number(e.target.value) }))} />
          </div>
          <Input label="Available Hours" value={form.availableHours} onChange={e => setForm(f => ({ ...f, availableHours: e.target.value }))} placeholder="e.g. 8:00 AM – 4:00 PM" />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Days</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.availableDays.includes(day) ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <Textarea label="Qualifications (one per line)" value={qualInput} onChange={e => setQualInput(e.target.value)} placeholder="MBBS (University of Lagos)&#10;FMCP (Internal Medicine)" rows={3} />
          <Textarea label="Bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Brief professional biography…" rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editDoctor ? 'Save Changes' : 'Add Doctor'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Remove Doctor" size="sm">
        <p className="text-sm text-gray-600 mb-5">Are you sure you want to remove <strong>{deleteModal?.name}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>Remove Doctor</Button>
        </div>
      </Modal>
    </div>
  );
}
