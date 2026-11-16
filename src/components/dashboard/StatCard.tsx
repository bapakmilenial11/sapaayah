import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'warning' | 'success' | 'info';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
}: StatCardProps) {
  const variantColors = {
    primary: 'text-[#547F9F]',
    warning: 'text-amber-600',
    success: 'text-emerald-600',
    info: 'text-[#385A75]',
  };

  return (
    <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#547F9F]">
        <span>{title}</span>
        <Icon className={`h-4 w-4 ${variantColors[variant]}`} />
      </div>
      <div className="text-2xl font-extrabold text-[#385A75]">{value}</div>
      {subtitle && <div className="text-[11px] text-[#252D35]/65">{subtitle}</div>}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionText,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[#E8F0F5] bg-[#F5F7F8]/60 p-8 text-center flex flex-col items-center justify-center space-y-3">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F0F5] text-[#547F9F]">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-[#385A75]">{title}</h4>
        <p className="text-xs text-[#252D35]/70">{description}</p>
      </div>
      {actionText && actionHref && (
        <a
          href={actionHref}
          className="rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition"
        >
          {actionText}
        </a>
      )}
    </div>
  );
}

