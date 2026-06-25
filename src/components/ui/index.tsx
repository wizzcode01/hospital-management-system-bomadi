import React, { forwardRef } from 'react';
import { X } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type BtnSize = 'sm' | 'md' | 'lg';

const btnVariants: Record<BtnVariant, string> = {
  primary:   'bg-teal-500 hover:bg-teal-400 text-white shadow-sm hover:shadow-md border border-teal-600',
  secondary: 'bg-white hover:bg-gray-50 text-navy-800 border border-gray-200 shadow-sm hover:border-teal-300',
  ghost:     'bg-transparent hover:bg-teal-50 text-teal-600 border border-transparent hover:border-teal-200',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm border border-red-600',
  success:   'bg-sage-500 hover:bg-sage-600 text-white shadow-sm border border-sage-600',
};
const btnSizes: Record<BtnSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-sm gap-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-[10px]
        transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${btnVariants[variant]} ${btnSizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

// ── Badge ─────────────────────────────────────────────────────────────────
type BadgeVariant = 'teal' | 'navy' | 'green' | 'amber' | 'red' | 'gray' | 'sky';

const badgeVariants: Record<BadgeVariant, string> = {
  teal:  'bg-teal-100 text-teal-700 border border-teal-200',
  navy:  'bg-navy-800 text-white',
  green: 'bg-sage-100 text-sage-700 border border-sage-200',
  amber: 'bg-amber-100 text-amber-700 border border-amber-200',
  red:   'bg-red-100 text-red-700 border border-red-200',
  gray:  'bg-gray-100 text-gray-600 border border-gray-200',
  sky:   'bg-sky-100 text-sky-700 border border-sky-200',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = 'gray', children, className = '', dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    confirmed: { variant: 'teal', label: 'Confirmed' },
    pending:   { variant: 'amber', label: 'Pending' },
    completed: { variant: 'green', label: 'Completed' },
    cancelled: { variant: 'red', label: 'Cancelled' },
    active:    { variant: 'green', label: 'Active' },
    inactive:  { variant: 'gray', label: 'Inactive' },
    normal:    { variant: 'green', label: 'Normal' },
    abnormal:  { variant: 'red', label: 'Abnormal' },
  };
  const cfg = map[status] ?? { variant: 'gray' as BadgeVariant, label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

// ── Card ──────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}
export function Card({ children, className = '', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_0_rgb(0,0,0,0.06)]
        ${hover ? 'hover:shadow-[0_4px_16px_-2px_rgb(13,115,119,0.12)] hover:border-teal-100 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-10 rounded-xl border bg-white text-sm text-gray-900
              placeholder:text-gray-400 transition-all duration-150
              ${icon ? 'pl-9 pr-3' : 'px-3'}
              ${error
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-50'
              }
              focus:outline-none
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ── Select ────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full h-10 rounded-xl border bg-white text-sm text-gray-900 px-3
            transition-all duration-150 cursor-pointer
            ${error
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-50'
            }
            focus:outline-none appearance-none
            ${className}
          `}
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ── Textarea ──────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const taId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={taId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={taId}
          className={`
            w-full rounded-xl border bg-white text-sm text-gray-900 px-3 py-2.5 resize-none
            placeholder:text-gray-400 transition-all duration-150
            ${error
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-50'
            }
            focus:outline-none ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ── Modal ─────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
const modalSizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${modalSizes[size]} bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgb(10,15,30,0.4)] animate-fade-in max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-navy-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'teal' | 'navy' | 'sage' | 'sky' | 'amber' | 'red';
  className?: string;
}
const statColors = {
  teal:  { bg: 'bg-teal-50', icon: 'bg-teal-500 text-white', text: 'text-teal-600' },
  navy:  { bg: 'bg-navy-800', icon: 'bg-navy-600 text-white', text: 'text-teal-300' },
  sage:  { bg: 'bg-sage-50', icon: 'bg-sage-500 text-white', text: 'text-sage-600' },
  sky:   { bg: 'bg-sky-50', icon: 'bg-sky-500 text-white', text: 'text-sky-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-500 text-white', text: 'text-amber-600' },
  red:   { bg: 'bg-red-50', icon: 'bg-red-500 text-white', text: 'text-red-600' },
};

export function StatCard({ label, value, icon, trend, color = 'teal', className = '' }: StatCardProps) {
  const c = statColors[color];
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-bold text-navy-900">{value}</p>
          {trend && (
            <p className={`text-xs mt-1.5 font-medium ${trend.value >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-400 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md', className = '' }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };
  // Pick a color based on first letter
  const colors = ['bg-teal-500', 'bg-navy-700', 'bg-sage-500', 'bg-sky-500', 'bg-amber-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-gray-100 ${className}`} />;
}

// ── Alert ─────────────────────────────────────────────────────────────────
type AlertType = 'info' | 'success' | 'warning' | 'error';
const alertStyles: Record<AlertType, string> = {
  info:    'bg-sky-50 border-sky-200 text-sky-800',
  success: 'bg-sage-50 border-sage-200 text-sage-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error:   'bg-red-50 border-red-200 text-red-800',
};
export function Alert({ type = 'info', children }: { type?: AlertType; children: React.ReactNode }) {
  return (
    <div className={`px-4 py-3 rounded-xl border text-sm ${alertStyles[type]}`}>
      {children}
    </div>
  );
}

// ── Loading Spinner ───────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-3' };
  return <div className={`${s[size]} border-teal-500 border-t-transparent rounded-full animate-spin`} />;
}
