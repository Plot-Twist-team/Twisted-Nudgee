import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ADMIN_CARD, ADMIN_BORDER } from '@/components/AdminLayout';

interface AdminManageProps {
  table: string;
  title: string;
  description: string;
  columns: { key: string; label: string; type?: 'text' | 'number' | 'boolean' | 'select'; options?: string[] }[];
  // fields to show in list view
  displayFields: string[];
  // fields to include in create form (subset of columns)
  createFields: string[];
}

export function AdminManage({ table, title, description, columns, displayFields, createFields }: AdminManageProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const { data, error: err } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (err) setError(err.message);
    setRows((data || []) as Record<string, unknown>[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [table]);

  const handleCreate = async () => {
    setSubmitting(true);
    setError('');
    const insertData: Record<string, unknown> = {};
    for (const field of createFields) {
      const col = columns.find(c => c.key === field);
      if (!col) continue;
      if (col.type === 'number') {
        insertData[field] = Number(formData[field]) || 0;
      } else if (col.type === 'boolean') {
        insertData[field] = Boolean(formData[field]);
      } else if (col.type === 'select') {
        insertData[field] = formData[field] || col.options?.[0] || '';
      } else {
        insertData[field] = formData[field] || '';
      }
    }
    const { error: err } = await supabase.from(table).insert(insertData);
    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else {
      setShowForm(false);
      setFormData({});
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from(table).delete().eq('id', id);
    if (err) {
      setError(err.message);
    } else {
      fetchData();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-5 w-5 text-slate-500 animate-spin" /></div>;
  }

  return (
    <div className="px-4 md:px-6 py-5 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-200 mb-0.5">{title}</h1>
          <p className="text-slate-500 text-xs">{description}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
          style={{ background: 'rgba(74,158,255,0.15)', color: '#7ec8ff' }}
        >
          <Plus className="h-3.5 w-3.5" /> Add New
        </button>
      </motion.div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {/* Data table */}
      <div className="rounded-xl overflow-x-auto" style={{ background: ADMIN_CARD, border: `1px solid ${ADMIN_BORDER}` }}>
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${ADMIN_BORDER}` }}>
              {displayFields.map(field => {
                const col = columns.find(c => c.key === field);
                return (
                  <th key={field} className="text-left px-3 py-2 text-slate-400 font-medium uppercase tracking-wide text-[10px]">
                    {col?.label || field}
                  </th>
                );
              })}
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={displayFields.length + 1} className="text-center py-8 text-slate-500">
                  No entries yet. Click "Add New" to create one.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id as string} style={{ borderBottom: `1px solid ${ADMIN_BORDER}` }}>
                  {displayFields.map(field => (
                    <td key={field} className="px-3 py-2.5 text-slate-300">
                      {field === 'is_featured' || field === 'active' ? (
                        <span style={{ color: row[field] ? '#10b981' : '#64748b' }}>
                          {row[field] ? 'Yes' : 'No'}
                        </span>
                      ) : field === 'event_date' ? (
                        new Date(row[field] as string).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                      ) : (
                        String(row[field] ?? '—')
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    <button onClick={() => handleDelete(row.id as string)}
                      className="text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowForm(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-md rounded-2xl p-5"
            style={{ background: '#1e293b', border: `1px solid ${ADMIN_BORDER}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-200">Add {title}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {createFields.map(field => {
                const col = columns.find(c => c.key === field);
                if (!col) return null;
                return (
                  <div key={field}>
                    <label className="text-xs text-slate-400 mb-1 block">{col.label}</label>
                    {col.type === 'select' ? (
                      <select
                        value={String(formData[field] ?? col.options?.[0] ?? '')}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                        className="w-full rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${ADMIN_BORDER}` }}
                      >
                        {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : col.type === 'boolean' ? (
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, [field]: !prev[field] }))}
                        className="w-full rounded-lg px-3 py-2 text-sm text-left"
                        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${ADMIN_BORDER}`, color: formData[field] ? '#10b981' : '#64748b' }}
                      >
                        {formData[field] ? 'Yes' : 'No'}
                      </button>
                    ) : (
                      <input
                        type={col.type === 'number' ? 'number' : 'text'}
                        value={String(formData[field] ?? '')}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field]: col.type === 'number' ? Number(e.target.value) : e.target.value }))}
                        className="w-full rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${ADMIN_BORDER}` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'rgba(74,158,255,0.2)', color: '#7ec8ff' }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Create</>}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
