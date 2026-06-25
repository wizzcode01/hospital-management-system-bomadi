import { useState, useMemo } from 'react';
import { Search, Users, Phone, Mail, Calendar, Droplets } from 'lucide-react';
import { Card, Input, Select, SectionHeader, Avatar, EmptyState, statusBadge } from '../../components/ui';
import { patientStorage, appointmentStorage } from '../../utils/storage';
import type { Patient } from '../../types';

export default function AdminPatients() {
  const [patients] = useState(() => patientStorage.getAll());
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);

  const filtered = useMemo(() => patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone.includes(q);
    const matchGender = !filterGender || p.gender === filterGender;
    return matchSearch && matchGender;
  }), [patients, search, filterGender]);

  const patientAppointments = useMemo(() =>
    selected ? appointmentStorage.getByPatient(selected.id) : [],
  [selected]);

  const age = (dob: string) => {
    const d = new Date(dob);
    const now = new Date();
    return now.getFullYear() - d.getFullYear();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Patients" subtitle={`${patients.length} registered patients`} />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input icon={<Search size={15} />} placeholder="Search by name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
          <Select
            options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]}
            placeholder="All Genders"
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="sm:w-40"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState icon={<Users size={28} />} title="No patients found" description="Try adjusting your search filters." />
          ) : (
            filtered.map(p => (
              <Card key={p.id} hover onClick={() => setSelected(p)}
                className={`p-4 transition-all ${selected?.id === p.id ? 'border-teal-200 ring-2 ring-teal-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <Avatar name={p.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-800 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.gender} · {age(p.dateOfBirth)} years old</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Droplets size={12} className="text-red-400" />
                      <span className="font-semibold text-red-600">{p.bloodGroup}</span>
                    </div>
                    {p.allergies.length > 0 && (
                      <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                        ⚠️ {p.allergies.length} allerg{p.allergies.length === 1 ? 'y' : 'ies'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1.5"><Mail size={11} />{p.email}</div>
                  <div className="flex items-center gap-1.5"><Phone size={11} />{p.phone}</div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <Card className="p-5 sticky top-0 space-y-5">
              <div className="text-center">
                <Avatar name={selected.name} size="lg" className="mx-auto mb-3" />
                <h3 className="font-bold text-navy-800">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.gender} · {age(selected.dateOfBirth)} yrs · {selected.bloodGroup}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between"><span className="text-gray-400">Date of Birth</span><span className="font-medium">{selected.dateOfBirth}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="font-medium">{selected.phone}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="font-medium truncate ml-4 text-right">{selected.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Address</span><span className="font-medium truncate ml-4 text-right">{selected.address}</span></div>
                </div>

                {selected.allergies.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-amber-700 mb-2">⚠️ Allergies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.allergies.map(a => (
                        <span key={a} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Emergency Contact</p>
                  <p className="text-xs text-gray-700 font-medium">{selected.emergencyContact.name}</p>
                  <p className="text-xs text-gray-400">{selected.emergencyContact.relationship} · {selected.emergencyContact.phone}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Recent Appointments</p>
                  {patientAppointments.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No appointments yet</p>
                  ) : (
                    <div className="space-y-2">
                      {patientAppointments.slice(0, 3).map(apt => (
                        <div key={apt.id} className="flex items-center justify-between text-xs p-2.5 bg-white border border-gray-100 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-700">{apt.doctorName}</p>
                            <p className="text-gray-400">{apt.date} · {apt.time}</p>
                          </div>
                          {statusBadge(apt.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 flex items-center justify-center text-center h-64">
              <div>
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-teal-400">
                  <Users size={22} />
                </div>
                <p className="text-sm font-medium text-gray-600">Select a patient</p>
                <p className="text-xs text-gray-400 mt-1">Click any patient to view full details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
