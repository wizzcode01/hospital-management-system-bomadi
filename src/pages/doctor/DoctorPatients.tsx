import { useState, useMemo } from 'react';
import { Search, Users, FileText, Phone, Mail, Droplets } from 'lucide-react';
import { Card, Input, SectionHeader, Avatar, EmptyState, statusBadge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { appointmentStorage, patientStorage, recordStorage } from '../../utils/storage';
import type { Patient } from '../../types';

export default function DoctorPatients() {
  const { profileId } = useAuth();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);

  const patients = useMemo(() => {
    if (!profileId) return [];
    const apts = appointmentStorage.getByDoctor(profileId);
    const patientIds = [...new Set(apts.map(a => a.patientId))];
    return patientIds.map(id => patientStorage.getById(id)).filter(Boolean) as Patient[];
  }, [profileId]);

  const filtered = useMemo(() => patients.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  }), [patients, search]);

  const selectedRecords = useMemo(() =>
    selected ? recordStorage.getByPatient(selected.id).filter(r => r.doctorId === profileId).sort((a, b) => b.date.localeCompare(a.date)) : [],
  [selected, profileId]);

  const selectedApts = useMemo(() =>
    selected ? appointmentStorage.getByPatient(selected.id).filter(a => a.doctorId === profileId).sort((a, b) => b.date.localeCompare(a.date)) : [],
  [selected, profileId]);

  const age = (dob: string) => new Date().getFullYear() - new Date(dob).getFullYear();

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="My Patients" subtitle={`${patients.length} patients under your care`} />

      <Card className="p-4">
        <Input icon={<Search size={15} />} placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No patients yet" description="Patients who have booked appointments with you will appear here." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Patient List */}
          <div className="lg:col-span-1 space-y-2">
            {filtered.map(p => (
              <Card key={p.id} hover onClick={() => setSelected(p)}
                className={`p-4 transition-all ${selected?.id === p.id ? 'border-teal-300 ring-2 ring-teal-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.gender} · {age(p.dateOfBirth)} yrs</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-semibold text-red-600">{p.bloodGroup}</span>
                      {p.allergies.length > 0 && <span className="text-xs text-amber-600">⚠️ allergies</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-4 animate-fade-in">
                {/* Patient Info */}
                <Card className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar name={selected.name} size="lg" />
                    <div>
                      <h2 className="font-bold text-navy-800 text-lg">{selected.name}</h2>
                      <p className="text-sm text-gray-500">{selected.gender} · {age(selected.dateOfBirth)} years · {selected.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { icon: <Mail size={11} />, value: selected.email },
                      { icon: <Phone size={11} />, value: selected.phone },
                      { icon: <span></span>, value: selected.address },
                      { icon: <span></span>, value: selected.dateOfBirth },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 text-gray-600">
                        <span className="text-gray-400 flex-shrink-0">{item.icon}</span>
                        <span className="truncate">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {selected.allergies.length > 0 && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1.5">⚠️ Known Allergies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.allergies.map(a => (
                          <span key={a} className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Emergency Contact</p>
                    <p className="text-xs text-gray-700">{selected.emergencyContact.name} <span className="text-gray-400">({selected.emergencyContact.relationship})</span></p>
                    <p className="text-xs text-gray-500">{selected.emergencyContact.phone}</p>
                  </div>
                </Card>

                {/* Appointment History */}
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50">
                    <h3 className="text-sm font-semibold text-navy-800">Appointment History</h3>
                  </div>
                  {selectedApts.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No appointments</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {selectedApts.slice(0, 4).map(apt => (
                        <div key={apt.id} className="flex items-center justify-between px-5 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{apt.date} at {apt.time}</p>
                            <p className="text-xs text-gray-400 truncate max-w-xs">{apt.reason}</p>
                          </div>
                          {statusBadge(apt.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* My Medical Records for this patient */}
                <Card className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                    <FileText size={15} className="text-teal-500" />
                    <h3 className="text-sm font-semibold text-navy-800">My Records for this Patient</h3>
                  </div>
                  {selectedRecords.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No records written yet</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {selectedRecords.map(rec => (
                        <div key={rec.id} className="px-5 py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-teal-600">{rec.diagnosis}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{rec.chiefComplaint}</p>
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{rec.date}</span>
                          </div>
                          {rec.prescription.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {rec.prescription.map(rx => (
                                <span key={rx.id} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">💊 {rx.medication}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              <Card className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-teal-400">
                    <Users size={22} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Select a patient</p>
                  <p className="text-xs text-gray-400 mt-1">View full details, history & records</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
