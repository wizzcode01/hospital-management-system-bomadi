import { useState, useMemo } from 'react';
import { Edit3, Save, X, Phone, Mail, MapPin, Droplets, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, SectionHeader, Avatar, Alert } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { patientStorage, userStorage } from '../../utils/storage';
import type { Patient } from '../../types';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const COMMON_ALLERGIES = ['Penicillin','Aspirin','Ibuprofen','Sulfa drugs','Codeine','Latex','Peanuts','Shellfish'];

export default function PatientProfile() {
  const { user, profileId, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allergyInput, setAllergyInput] = useState('');

  const patient = useMemo(() => profileId ? patientStorage.getById(profileId) : null, [profileId, saved]);

  const [form, setForm] = useState<Partial<Patient>>({});

  const startEdit = () => {
    if (!patient) return;
    setForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      bloodGroup: patient.bloodGroup,
      allergies: [...patient.allergies],
      emergencyContact: { ...patient.emergencyContact },
    });
    setEditing(true);
    setSaved(false);
  };

  const cancelEdit = () => { setEditing(false); setForm({}); };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !user) return;
    const updated: Patient = { ...patient, ...form } as Patient;
    patientStorage.update(updated);
    if (form.name && form.name !== user.name) {
      const updatedUser = { ...user, name: form.name, email: form.email ?? user.email };
      userStorage.update(updatedUser);
      updateUser(updatedUser);
    }
    setSaved(true);
    setEditing(false);
  };

  const toggleAllergy = (a: string) => {
    setForm(f => {
      const current = f.allergies ?? [];
      return { ...f, allergies: current.includes(a) ? current.filter(x => x !== a) : [...current, a] };
    });
  };

  const addCustomAllergy = () => {
    const a = allergyInput.trim();
    if (!a) return;
    setForm(f => ({ ...f, allergies: [...(f.allergies ?? []), a] }));
    setAllergyInput('');
  };

  if (!patient) return <div className="text-center py-20 text-gray-400">No profile found.</div>;

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <SectionHeader
        title="My Profile"
        subtitle="Manage your personal and medical information"
        action={
          !editing
            ? <Button variant="secondary" icon={<Edit3 size={15} />} onClick={startEdit}>Edit Profile</Button>
            : <div className="flex gap-2">
                <Button variant="secondary" icon={<X size={15} />} onClick={cancelEdit}>Cancel</Button>
                <Button form="profile-form" type="submit" icon={<Save size={15} />}>Save Changes</Button>
              </div>
        }
      />

      {saved && <Alert type="success"><p>Profile updated successfully!</p></Alert>}

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center gap-5">
          <Avatar name={patient.name} size="lg" className="w-20 h-20 text-xl" />
          <div>
            <h2 className="text-xl font-bold text-navy-800">{patient.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{patient.gender} · {age} years old</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                <Droplets size={13} /> {patient.bloodGroup}
              </span>
              <span className="text-sm text-gray-400">Patient ID: {patient.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </Card>

      <form id="profile-form" onSubmit={saveEdit} className="space-y-4">
        {/* Personal Info */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-navy-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 text-xs">👤</span>
            Personal Information
          </h3>
          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Email" type="email" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <Input label="Phone" type="tel" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <Input label="Date of Birth" type="date" value={form.dateOfBirth ?? ''} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
              <Select label="Gender" value={form.gender ?? ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value as any }))}
                options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
              <Select label="Blood Group" value={form.bloodGroup ?? ''} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
                options={BLOOD_GROUPS.map(b => ({ value: b, label: b }))} />
              <Input label="Address" value={form.address ?? ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="col-span-2" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Mail size={13} />, label: 'Email', value: patient.email },
                { icon: <Phone size={13} />, label: 'Phone', value: patient.phone },
                { icon: <span className="text-xs">🎂</span>, label: 'Date of Birth', value: patient.dateOfBirth },
                { icon: <span className="text-xs">👤</span>, label: 'Gender', value: patient.gender },
                { icon: <Droplets size={13} />, label: 'Blood Group', value: patient.bloodGroup },
                { icon: <MapPin size={13} />, label: 'Address', value: patient.address },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3.5">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">{item.icon}{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Allergies */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-navy-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 text-xs">⚠️</span>
            Allergies
          </h3>
          {editing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map(a => {
                  const selected = (form.allergies ?? []).includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleAllergy(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selected ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
                      {a}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add custom allergy…" value={allergyInput} onChange={e => setAllergyInput(e.target.value)} className="flex-1" />
                <Button type="button" variant="secondary" size="sm" onClick={addCustomAllergy}>Add</Button>
              </div>
              {(form.allergies ?? []).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Selected:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(form.allergies ?? []).map(a => (
                      <span key={a} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
                        {a}
                        <button type="button" onClick={() => toggleAllergy(a)} className="text-amber-400 hover:text-amber-700 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : patient.allergies.length === 0 ? (
            <p className="text-sm text-gray-400">No known allergies</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map(a => (
                <span key={a} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-full font-medium">{a}</span>
              ))}
            </div>
          )}
        </Card>

        {/* Emergency Contact */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-navy-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-500 text-xs">🚨</span>
            Emergency Contact
          </h3>
          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Name" value={form.emergencyContact?.name ?? ''} onChange={e => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact!, name: e.target.value } }))} />
              <Input label="Relationship" value={form.emergencyContact?.relationship ?? ''} onChange={e => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact!, relationship: e.target.value } }))} />
              <Input label="Phone" type="tel" value={form.emergencyContact?.phone ?? ''} onChange={e => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact!, phone: e.target.value } }))} className="col-span-2" />
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="font-semibold text-red-800">{patient.emergencyContact.name}</p>
              <p className="text-sm text-red-600 mt-0.5">{patient.emergencyContact.relationship}</p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5"><Phone size={13} />{patient.emergencyContact.phone}</p>
            </div>
          )}
        </Card>
      </form>
    </div>
  );
}
