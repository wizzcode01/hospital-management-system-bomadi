import { useState, useMemo } from 'react';
import { Search, FileText, ChevronDown, ChevronUp, Pill, FlaskConical } from 'lucide-react';
import { Card, Input, SectionHeader, Avatar, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { recordStorage } from '../../utils/storage';

export default function DoctorRecords() {
  const { profileId } = useAuth();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const records = useMemo(() =>
    profileId ? recordStorage.getByDoctor(profileId).sort((a, b) => b.date.localeCompare(a.date)) : [],
  [profileId]);

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase();
    return !q || r.patientName.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q);
  }), [records, search]);

  const toggle = (id: string) => setExpanded(e => e === id ? null : id);

  const labColor = (s: string) => s === 'normal' ? 'text-sage-600 bg-sage-50' : s === 'abnormal' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Medical Records" subtitle={`${records.length} records written by you`} />

      <Card className="p-4">
        <Input icon={<Search size={15} />} placeholder="Search by patient or diagnosis…" value={search} onChange={e => setSearch(e.target.value)} />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText size={28} />} title="No records yet" description="Records you write after completing appointments will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map(rec => (
            <Card key={rec.id} className="overflow-hidden">
              <button className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/60 transition-colors text-left" onClick={() => toggle(rec.id)}>
                <Avatar name={rec.patientName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-800 text-sm">{rec.patientName}</p>
                  <p className="text-xs text-teal-600 font-medium mt-0.5">{rec.diagnosis}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{rec.chiefComplaint}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-gray-700">{rec.date}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{rec.prescription.length} rx</p>
                </div>
                <span className="text-gray-400 ml-2">{expanded === rec.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
              </button>

              {expanded === rec.id && (
                <div className="border-t border-gray-100 p-5 space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Chief Complaint', val: rec.chiefComplaint },
                      { label: 'Diagnosis', val: rec.diagnosis, highlight: true },
                      { label: 'Treatment Plan', val: rec.treatment },
                      ...(rec.notes ? [{ label: "Notes", val: rec.notes }] : []),
                      ...(rec.followUpDate ? [{ label: "Follow-Up", val: rec.followUpDate }] : []),
                    ].map(b => (
                      <div key={b.label} className={`rounded-xl p-3.5 ${b.highlight ? 'bg-navy-800' : 'bg-gray-50'}`}>
                        <p className={`text-xs font-medium mb-1 ${b.highlight ? 'text-teal-300' : 'text-gray-400'}`}>{b.label}</p>
                        <p className={`text-sm ${b.highlight ? 'text-white font-semibold' : 'text-gray-700'}`}>{b.val}</p>
                      </div>
                    ))}
                  </div>

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
                            {rx.instructions && <p className="text-xs text-gray-500 mt-0.5 italic">{rx.instructions}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.labResults && rec.labResults.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical size={14} className="text-sage-500" />
                        <p className="text-sm font-semibold text-navy-800">Lab Results</p>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>{['Test', 'Result', 'Normal Range', 'Status'].map(h => (
                              <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide text-[11px]">{h}</th>
                            ))}</tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {rec.labResults.map(lr => (
                              <tr key={lr.id} className="bg-white">
                                <td className="px-4 py-2.5 font-medium text-gray-700">{lr.testName}</td>
                                <td className="px-4 py-2.5 font-semibold text-gray-900">{lr.result}</td>
                                <td className="px-4 py-2.5 text-gray-500">{lr.normalRange}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full font-medium ${labColor(lr.status)}`}>{lr.status}</span>
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
