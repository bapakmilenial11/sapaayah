import React from 'react';
import { PositionDetailItem, OrganizationalUnitItem } from '@/features/organization/queries';
import { PersonnelAssignmentModal } from './PersonnelAssignmentModal';
import { JobDescriptionModal } from './JobDescriptionModal';
import { formatDateIndonesia } from '@/lib/utils';
import { Building2, User, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';

interface OrganizationalChartProps {
  positions: PositionDetailItem[];
  units: OrganizationalUnitItem[];
  staffList: { id: string; full_name: string }[];
  canManage: boolean;
}

export function OrganizationalChart({
  positions,
  units,
  staffList,
  canManage,
}: OrganizationalChartProps) {
  // Kelompokkan posisi berdasarkan unit organisasi
  const unitMap = new Map<string, PositionDetailItem[]>();
  positions.forEach((p) => {
    const list = unitMap.get(p.unit_id) || [];
    list.push(p);
    unitMap.set(p.unit_id, list);
  });

  if (positions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E8F0F5] bg-white p-8 text-center text-xs text-[#252D35]/60">
        Belum ada jabatan struktural yang terdaftar dalam organisasi.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {units.map((unit) => {
        const unitPositions = unitMap.get(unit.id) || [];
        if (unitPositions.length === 0) return null;

        return (
          <div
            key={unit.id}
            className="rounded-xl border border-[#E8F0F5] bg-white shadow-sm overflow-hidden space-y-3"
          >
            {/* Header Unit Kerja */}
            <div className="bg-[#F5F7F8] p-4 border-b border-[#E8F0F5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#547F9F]" />
                <h3 className="text-sm font-bold text-[#385A75]">{unit.name}</h3>
              </div>
              <span className="text-[11px] text-[#252D35]/60 font-medium">
                {unitPositions.length} Posisi Jabatan
              </span>
            </div>

            {/* Daftar Posisi dalam Unit */}
            <div className="p-4 divide-y divide-[#E8F0F5]">
              {unitPositions.map((pos) => (
                <div key={pos.id} className="py-4 space-y-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#385A75]">{pos.title}</h4>
                        {pos.parent_position && (
                          <span className="text-[10px] text-[#252D35]/50 flex items-center gap-0.5">
                            <ChevronRight className="h-3 w-3" />
                            Atasan: {pos.parent_position.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <PersonnelAssignmentModal
                          positionId={pos.id}
                          positionTitle={pos.title}
                          staffList={staffList}
                        />
                        <JobDescriptionModal
                          positionId={pos.id}
                          positionTitle={pos.title}
                        />
                      </div>
                    )}
                  </div>

                  {/* Personel Pemegang Jabatan Saat Ini */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#252D35]">
                    <span className="text-[11px] text-[#252D35]/50 font-medium">Pemegang Jabatan:</span>
                    {pos.current_assignees.length === 0 ? (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium">
                        Posisi Kosong (Belum Ditugaskan)
                      </span>
                    ) : (
                      pos.current_assignees.map((assignee) => (
                        <div
                          key={assignee.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800"
                        >
                          <User className="h-3.5 w-3.5" />
                          <span>{assignee.profile.full_name}</span>
                          <span className="text-[10px] text-emerald-600 font-normal">
                            (sejak {formatDateIndonesia(assignee.start_date)})
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Rincian Jobdesk / Tanggung Jawab */}
                  {pos.job_descriptions.length > 0 && (
                    <div className="rounded-lg bg-[#F5F7F8] p-3 text-xs space-y-2 border border-[#E8F0F5]">
                      <div className="text-[11px] font-bold text-[#385A75] uppercase tracking-wide">
                        Rincian Tanggung Jawab (Jobdesk):
                      </div>
                      <ul className="space-y-1.5 list-disc list-inside text-[#252D35]/80">
                        {pos.job_descriptions.map((jd) => (
                          <li key={jd.id} className="leading-relaxed">
                            <span>{jd.responsibility}</span>
                            {jd.performance_indicator && (
                              <span className="text-[#547F9F] font-medium ml-1">
                                [Target: {jd.performance_indicator}]
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

