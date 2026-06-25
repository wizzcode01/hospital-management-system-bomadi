import { useState, useMemo } from 'react';
import { FileText, ChevronDown, ChevronUp, Pill, FlaskConical } from 'lucide-react';
import { Card, SectionHeader, Avatar, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { recordStorage } from '../../utils/storage';

export default function PatientRecords() {
  const { profileId } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  const records = useMemo(() =>
    profileId ? recordStorage.getByPatient(profileId).sort((a, b) => b.date.localeCompare(a.date)) : [],
  [profileId]);

  const toggle = (id: string) => setExpanded(e => e === id ? null : id);
  const labColor = (s: string) => s === 'normal' ? 'text-sage-600 bg-sage-50 border-sage-100' : s === 'abnormal' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100';

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="My Medical Records" subtitle={`${records.length} records from your visits`} />

      {records.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No medical records yet"
          description="Your medical records will appear here after doctor consultations."
        />
      ) : (
        <div className="space-y-3">
          {records.map(rec => (
            <Card key={rec.id} className="overflow-hidden">
              <button className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/60 transition-colors text-left" onClick={() => toggle(rec.id)}>
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-800 text-sm">{rec.diagnosis}</p>
                  <p className="text-xs text-gray-400 mt-0.5">by {rec.doctorName} · {rec.date}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {rec.prescription.length > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                      <Pill size={10} /> {rec.prescription.length} rx
                    </span>
                  )}
                  <span className="text-gray-400">{expanded === rec.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </div>
              </button>

              {expanded === rec.id && (
                <div className="border-t border-gray-100 p-5 space-y-5 animate-fade-in">
                  {/* Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoBox label="Chief Complaint" value={rec.chiefComplaint} />
                    <InfoBox label="Diagnosis" value={rec.diagnosis} highlight />
                    <InfoBox label="Treatment Plan" value={rec.treatment} />
                    {rec.notes && <InfoBox label="Doctor's Notes" value={rec.notes} />}
                    {rec.followUpDate && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                        <p className="text-xs font-medium text-amber-500 mb-1">Follow-Up Date</p>
                        <p className="text-sm font-semibold text-amber-800">📅 {rec.followUpDate}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Please attend this follow-up appointment</p>
                      </div>
                    )}
                  </div>

                  {/* Prescriptions */}
                  {rec.prescription.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Pill size={14} className="text-teal-500" />
                        <p className="text-sm font-semibold text-navy-800">Your Medications</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rec.prescription.map(rx => (
                          <div key={rx.id} className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-bold text-teal-800">{rx.medication}</p>
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">{rx.dosage}</span>
                            </div>
                            <p className="text-xs text-teal-600 mt-1">{rx.frequency} for {rx.duration}</p>
                            {rx.instructions && (
                              <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
                                <span className="text-amber-500 flex-shrink-0">ℹ️</span> {rx.instructions}
                              </p>
                            )}
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
                      <div className="space-y-2">
                        {rec.labResults.map(lr => (
                          <div key={lr.id} className={`rounded-xl p-3.5 border flex items-center justify-between ${labColor(lr.status)}`}>
                            <div>
                              <p className="text-sm font-semibold">{lr.testName}</p>
                              <p className="text-xs mt-0.5 opacity-70">Normal: {lr.normalRange}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{lr.result}</p>
                              <p className="text-xs mt-0.5 capitalize font-medium">{lr.status}</p>
                            </div>
                          </div>
                        ))}
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

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3.5 ${highlight ? 'bg-navy-800' : 'bg-gray-50'}`}>
      <p className={`text-xs font-medium mb-1 ${highlight ? 'text-teal-300' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-sm ${highlight ? 'text-white font-semibold' : 'text-gray-700'}`}>{value}</p>
    </div>
  );
}
