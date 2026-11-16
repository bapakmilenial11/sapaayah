import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { createClient } from '@/lib/supabase/server';
import { ShieldAlert, History, User, Clock, AlertCircle } from 'lucide-react';
import { formatDateTimeIndonesia } from '@/lib/utils';

export default async function AuditLogsPage() {
  await assertPermission('audit_logs.view');
  const user = await getCurrentUser();

  const supabase = await createClient();

  // Query log audit
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const auditItems = logs || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Log Audit & Integritas Keamanan</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Catatan permanen (immutable audit trail) aktivitas administratif, koreksi presensi, dan mutasi data sensitif yayasan.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#547F9F]" />
            <h3 className="text-sm font-bold text-gray-900">Riwayat Peristiwa Audit (50 Terakhir)</h3>
          </div>
          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-medium">
            {auditItems.length} Catatan
          </span>
        </div>

        {auditItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p>Belum ada peristiwa audit tercatat di database.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {auditItems.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                      {item.action || item.event_type || 'SYSTEM_ACTION'}
                    </span>
                    <span className="text-gray-500">Tabel: {item.table_name || 'System'}</span>
                  </div>
                  {item.notes && <p className="text-gray-600 text-[11px]">{item.notes}</p>}
                </div>
                <div className="text-right text-[11px] text-gray-400 shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTimeIndonesia(item.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

