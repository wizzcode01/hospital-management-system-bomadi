import { useState, useMemo } from 'react';
import { Search, Phone, Mail, Calendar, Star } from 'lucide-react';
import { Card, Input, Select, SectionHeader, Avatar, Button, Modal } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { doctorStorage } from '../../utils/storage';
import type { Doctor } from '../../types';

const SPECIALIZATIONS = [
  'General Medicine', 'Obstetrics & Gynaecology', 'Paediatrics', 'Surgery',
  'Internal Medicine', 'Emergency Medicine', 'Psychiatry', 'Dermatology',
  'Cardiology', 'Neurology', 'Ophthalmology', 'ENT',
];

export default function PatientDoctors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [selected, setSelected] = useState<Doctor | null>(null);

  const doctors = useMemo(() => doctorStorage.getAll().filter(d => d.status === 'active'), []);

  const filtered = useMemo(() => doctors.filter(d => {
    const q = search.toLowerCase();
    const mS = !q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.department.toLowerCase().includes(q);
    const mSpec = !filterSpec || d.specialization === filterSpec;
    return mS && mSpec;
  }), [doctors, search, filterSpec]);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Find a Doctor" subtitle={`${doctors.length} doctors available at GH Bomadi`} />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input icon={<Search size={15} />} placeholder="Search by name or specialization…" value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
          <Select
            options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))}
            placeholder="All Specializations"
            value={filterSpec}
            onChange={e => setFilterSpec(e.target.value)}
            className="sm:w-56"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
        {filtered.map(doc => (
          <Card key={doc.id} hover onClick={() => setSelected(doc)} className="p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Avatar name={doc.name} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-800 text-sm leading-tight">{doc.name}</p>
                <p className="text-xs text-teal-600 font-medium mt-0.5">{doc.specialization}</p>
                <p className="text-xs text-gray-400">{doc.department}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{doc.yearsExperience} yrs exp.</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{doc.bio}</p>

            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={11} className="text-teal-400 flex-shrink-0" />
                <span>{doc.availableDays.slice(0, 3).join(', ')}{doc.availableDays.length > 3 ? ` +${doc.availableDays.length - 3}` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300">🕐</span>
                <span>{doc.availableHours}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-50 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={e => { e.stopPropagation(); setSelected(doc); }}>View Profile</Button>
              <Button size="sm" className="flex-1" icon={<Calendar size={13} />}
                onClick={e => { e.stopPropagation(); navigate('/patient/appointments'); }}>
                Book
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Doctor Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Doctor Profile" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-navy-800">{selected.name}</h2>
                <p className="text-sm text-teal-600 font-medium">{selected.specialization}</p>
                <p className="text-sm text-gray-400">{selected.department}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{selected.bio}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3.5">
                <p className="text-xs text-gray-400 mb-1">Contact</p>
                <p className="text-xs text-gray-700 flex items-center gap-1.5"><Mail size={11} />{selected.email}</p>
                <p className="text-xs text-gray-700 flex items-center gap-1.5 mt-1"><Phone size={11} />{selected.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3.5">
                <p className="text-xs text-gray-400 mb-1">Experience</p>
                <p className="text-sm font-bold text-navy-800">{selected.yearsExperience} years</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Qualifications</p>
              <ul className="space-y-1">
                {selected.qualifications.map((q, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-teal-700 mb-2">Availability</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                  <span key={day} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${selected.availableDays.includes(day) ? 'bg-teal-500 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                    {day.slice(0, 3)}
                  </span>
                ))}
              </div>
              <p className="text-xs text-teal-600">Hours: {selected.availableHours}</p>
            </div>

            <Button className="w-full" icon={<Calendar size={15} />} onClick={() => { setSelected(null); navigate('/patient/appointments'); }}>
              Book Appointment with {selected.name.split(' ')[1]}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
