import type { User, Doctor, Patient, Appointment, MedicalRecord, Notification } from '../types';
import { SEED_USERS, SEED_DOCTORS, SEED_PATIENTS, SEED_APPOINTMENTS, SEED_MEDICAL_RECORDS } from '../data/seed';

const KEYS = {
  USERS: 'ghb_users',
  DOCTORS: 'ghb_doctors',
  PATIENTS: 'ghb_patients',
  APPOINTMENTS: 'ghb_appointments',
  MEDICAL_RECORDS: 'ghb_medical_records',
  NOTIFICATIONS: 'ghb_notifications',
  CURRENT_USER: 'ghb_current_user',
  SEEDED: 'ghb_seeded',
};

function get<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function initStorage(): void {
  if (localStorage.getItem(KEYS.SEEDED)) return;
  set(KEYS.USERS, SEED_USERS);
  set(KEYS.DOCTORS, SEED_DOCTORS);
  set(KEYS.PATIENTS, SEED_PATIENTS);
  set(KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
  set(KEYS.MEDICAL_RECORDS, SEED_MEDICAL_RECORDS);
  set(KEYS.NOTIFICATIONS, []);
  localStorage.setItem(KEYS.SEEDED, '1');
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authStorage = {
  login(email: string, password: string): User | null {
    const users = get<User>(KEYS.USERS);
    return users.find(u => u.email === email && u.password === password) ?? null;
  },
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(KEYS.CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setCurrentUser(user: User | null): void {
    if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(KEYS.CURRENT_USER);
  },
  logout(): void {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },
};

// ── Users ─────────────────────────────────────────────────────────────────
export const userStorage = {
  getAll: () => get<User>(KEYS.USERS),
  add(user: User): void { set(KEYS.USERS, [...get<User>(KEYS.USERS), user]); },
  update(user: User): void {
    set(KEYS.USERS, get<User>(KEYS.USERS).map(u => u.id === user.id ? user : u));
  },
};

// ── Doctors ───────────────────────────────────────────────────────────────
export const doctorStorage = {
  getAll: () => get<Doctor>(KEYS.DOCTORS),
  getById: (id: string) => get<Doctor>(KEYS.DOCTORS).find(d => d.id === id) ?? null,
  getByUserId: (uid: string) => get<Doctor>(KEYS.DOCTORS).find(d => d.userId === uid) ?? null,
  add(doc: Doctor): void { set(KEYS.DOCTORS, [...get<Doctor>(KEYS.DOCTORS), doc]); },
  update(doc: Doctor): void {
    set(KEYS.DOCTORS, get<Doctor>(KEYS.DOCTORS).map(d => d.id === doc.id ? doc : d));
  },
  delete(id: string): void {
    set(KEYS.DOCTORS, get<Doctor>(KEYS.DOCTORS).filter(d => d.id !== id));
  },
};

// ── Patients ──────────────────────────────────────────────────────────────
export const patientStorage = {
  getAll: () => get<Patient>(KEYS.PATIENTS),
  getById: (id: string) => get<Patient>(KEYS.PATIENTS).find(p => p.id === id) ?? null,
  getByUserId: (uid: string) => get<Patient>(KEYS.PATIENTS).find(p => p.userId === uid) ?? null,
  add(pat: Patient): void { set(KEYS.PATIENTS, [...get<Patient>(KEYS.PATIENTS), pat]); },
  update(pat: Patient): void {
    set(KEYS.PATIENTS, get<Patient>(KEYS.PATIENTS).map(p => p.id === pat.id ? pat : p));
  },
};

// ── Appointments ──────────────────────────────────────────────────────────
export const appointmentStorage = {
  getAll: () => get<Appointment>(KEYS.APPOINTMENTS),
  getById: (id: string) => get<Appointment>(KEYS.APPOINTMENTS).find(a => a.id === id) ?? null,
  getByPatient: (pid: string) => get<Appointment>(KEYS.APPOINTMENTS).filter(a => a.patientId === pid),
  getByDoctor: (did: string) => get<Appointment>(KEYS.APPOINTMENTS).filter(a => a.doctorId === did),
  add(apt: Appointment): void { set(KEYS.APPOINTMENTS, [...get<Appointment>(KEYS.APPOINTMENTS), apt]); },
  update(apt: Appointment): void {
    set(KEYS.APPOINTMENTS, get<Appointment>(KEYS.APPOINTMENTS).map(a => a.id === apt.id ? apt : a));
  },
  delete(id: string): void {
    set(KEYS.APPOINTMENTS, get<Appointment>(KEYS.APPOINTMENTS).filter(a => a.id !== id));
  },
};

// ── Medical Records ───────────────────────────────────────────────────────
export const recordStorage = {
  getAll: () => get<MedicalRecord>(KEYS.MEDICAL_RECORDS),
  getByPatient: (pid: string) => get<MedicalRecord>(KEYS.MEDICAL_RECORDS).filter(r => r.patientId === pid),
  getByDoctor: (did: string) => get<MedicalRecord>(KEYS.MEDICAL_RECORDS).filter(r => r.doctorId === did),
  add(rec: MedicalRecord): void { set(KEYS.MEDICAL_RECORDS, [...get<MedicalRecord>(KEYS.MEDICAL_RECORDS), rec]); },
  update(rec: MedicalRecord): void {
    set(KEYS.MEDICAL_RECORDS, get<MedicalRecord>(KEYS.MEDICAL_RECORDS).map(r => r.id === rec.id ? rec : r));
  },
};

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationStorage = {
  getByUser: (uid: string) => get<Notification>(KEYS.NOTIFICATIONS).filter(n => n.userId === uid),
  add(notif: Notification): void { set(KEYS.NOTIFICATIONS, [...get<Notification>(KEYS.NOTIFICATIONS), notif]); },
  markRead(id: string): void {
    set(KEYS.NOTIFICATIONS, get<Notification>(KEYS.NOTIFICATIONS).map(n => n.id === id ? { ...n, read: true } : n));
  },
  markAllRead(uid: string): void {
    set(KEYS.NOTIFICATIONS, get<Notification>(KEYS.NOTIFICATIONS).map(n => n.userId === uid ? { ...n, read: true } : n));
  },
};

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
