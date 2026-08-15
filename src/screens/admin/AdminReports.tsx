import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ADMIN_CARD, ADMIN_BORDER } from '@/components/AdminLayout';

interface ReportRow {
  id: string;
  hostel: string;
  category: string;
  created_at: string;
}

export function AdminReports() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('pressure_reports')
        .select('id, hostel, category, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      setReports(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-5 w-5 text-slate-500 animate-spin" /></div>;
  }

  const categoryColors: Record<string, string> = {
    substance: '#ef4444',
    academic: '#f59e0b',
    social: '#8b5cf6',
    bullying: '#ec4899',
    hazing: '#f97316',
    other: '#64748b',
  };

  return (
    <div className="px-4 md:px-6 py-5 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-lg font-bold text-slate-200 mb-0.5">Pressure Reports</h1>
        <p className="text-slate-500 text-xs">All reports are anonymous. Report text is not shown to protect students.</p>
      </motion.div>

      <div className="rounded-xl overflow-x-auto" style={{ background: ADMIN_CARD, border: `1px solid ${ADMIN_BORDER}` }}>
        <table className="w-full text-xs min-w-[400px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${ADMIN_BORDER}` }}>
              <th className="text-left px-3 py-2 text-slate-400 font-medium uppercase tracking-wide text-[10px]">Date</th>
              <th className="text-left px-3 py-2 text-slate-400 font-medium uppercase tracking-wide text-[10px]">Category</th>
              <th className="text-left px-3 py-2 text-slate-400 font-medium uppercase tracking-wide text-[10px]">Location</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-slate-500">No reports filed yet.</td></tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${ADMIN_BORDER}` }}>
                  <td className="px-3 py-2.5 text-slate-400">
                    {new Date(r.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase"
                      style={{ background: `${categoryColors[r.category] || '#64748b'}20`, color: categoryColors[r.category] || '#64748b' }}>
                      {r.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-500" /> {r.hostel}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[10px] text-slate-600">
        Note: Report descriptions are intentionally hidden from admin view to protect student anonymity. Only category and location are visible.
      </p>
    </div>
  );
}
