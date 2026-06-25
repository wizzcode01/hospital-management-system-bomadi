import { useState, useMemo } from 'react';
import { Search, FileText, ChevronDown, ChevronUp, Pill, FlaskConical } from 'lucide-react';
import { Card, Input, SectionHeader, Avatar, Badge, EmptyState } from '../../components/ui';
import { recordStorage } from '../../utils/storage';
import type { MedicalRecord } from '../../types';

export default function AdminRecords() {
  const [records] = useState(() => recordStorage.getAll());
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase();
    return !q || r.patientName.toLowerCase().includes(q) || r.doctorName.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q);
  }).sort((a, b) => b.date.localeCompare(a.date)), [records, search]);

  const toggle = (id: string) => setExpanded(e => e === id ? null : id);

  const labStatusColor = (s: string) => s === 'normal' ? 'text-sage-600 bg-sage-50' : s === 'abnormal' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Medical Records" subtitle={`${records.length} records on file`} />

      <Card className="p-4">
        <Input icon={<Search size={15} />} placeholder="Search by patient, doctor, diagnosis…" value={search} onChange={e => setSearch(e.target.value)} />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText size={28} />} title="No medical records found" description="Records will appear here once doctors complete consultations." />
      ) : (
        <div className="space-y-3">
          {filtered.map(rec => (
            <Card key={rec.id} className="overflow-hidden">
              {/* Header row */}
              <button className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/60 transition-colors text-left" onClick={() => toggle(rec.id)}>
                <Avatar name={rec.patientName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-navy-800 text-sm">{rec.patientName}</p>
                    <span className="text-gray-300">·</span>
                    <p className="text-xs text-gray-500">by {rec.doctorName}</p>
                  </div>
                  <p className="text-xs text-teal-600 font-medium mt-0.5 truncate">{rec.diagnosis}</p>
                </div>
                <div className="text-right hidden sm:block flex-shrink-0">
                  <p className="text-xs font-medium text-gray-700">{rec.date}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{rec.prescription.length} medication{rec.prescription.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-gray-400 ml-2">
                  {expanded === rec.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === rec.id && (
                <div className="border-t border-gray-100 p-5 space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoBlock label="Chief Complaint" value={rec.chiefComplaint} />
                    <InfoBlock label="Diagnosis" value={rec.diagnosis} highlight />
                    <InfoBlock label="Treatment Plan" value={rec.treatment} />
                    {rec.notes && <InfoBlock label="Doctor's Notes" value={rec.notes} />}
                    {rec.followUpDate && <InfoBlock label="Follow-Up Date" value={rec.followUpDate} />}
                  </div>

                  {/* Prescriptions */}
                  {rec.prescription.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Pill size={14} className="text-teal-500" />
                        <p className="text-sm font-semibold text-navy-800">Prescriptions</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rec.prescription.map(rx => (
                          <div key={rx.id} className="bg-teal-50 border border-teal-100 rounded-xl p-3">
                            <p className="text-sm font-semibold text-teal-800">{rx.medication} <span className="font-normal text-teal-600">{rx.dosage}</span></p>
                            <p className="text-xs text-teal-600 mt-0.5">{rx.frequency} · {rx.duration}</p>
                            <p className="text-xs text-gray-500 mt-0.5 italic">{rx.instructions}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Results */}
                  {rec.labResults && rec.labResults.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical size={14} className="text-sage-500" />
                        <p className="text-sm font-semibold text-navy-800">Lab Results</p>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>{['Test', 'Result', 'Normal Range', 'Status'].map(h => <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide text-[11px]">{h}</th>)}</tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {rec.labResults.map(lr => (
                              <tr key={lr.id} className="bg-white">
                                <td className="px-4 py-2.5 font-medium text-gray-700">{lr.testName}</td>
                                <td className="px-4 py-2.5 font-semibold text-gray-900">{lr.result}</td>
                                <td className="px-4 py-2.5 text-gray-500">{lr.normalRange}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full font-medium ${labStatusColor(lr.status)}`}>
                                    {lr.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3.5 ${highlight ? 'bg-navy-800 text-white' : 'bg-gray-50'}`}>
      <p className={`text-xs font-medium mb-1 ${highlight ? 'text-teal-300' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-sm ${highlight ? 'text-white font-semibold' : 'text-gray-700'}`}>{value}</p>
    </div>
  );
}
