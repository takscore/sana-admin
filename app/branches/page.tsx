'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  operatingHours: string | null;
  pickupInstructions: string | null;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Branch>>({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', address: '', phone: '', operatingHours: '', pickupInstructions: '',
  });

  async function loadBranches() {
    setLoading(true);
    try {
      const data = await apiFetch('/branches');
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBranches();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch('/branches', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', address: '', phone: '', operatingHours: '', pickupInstructions: '' });
      await loadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(branch: Branch) {
    setEditingId(branch.id);
    setEditForm({
      name: branch.name, address: branch.address, phone: branch.phone || '',
      operatingHours: branch.operatingHours || '', pickupInstructions: branch.pickupInstructions || '',
    });
  }

  async function handleSaveEdit(id: string) {
    setSubmitting(true);
    setError('');
    try {
      await apiFetch(`/branches/${id}`, { method: 'PATCH', body: JSON.stringify(editForm) });
      setEditingId(null);
      await loadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update branch');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <h1 className="mb-6 text-2xl font-bold">Branches</h1>

        <form onSubmit={handleCreate} className="mb-8 grid grid-cols-2 gap-4 rounded-lg bg-white p-6 shadow">
          <input placeholder="Branch name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded border px-3 py-2" required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded border px-3 py-2" />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="col-span-2 rounded border px-3 py-2" required />
          <input placeholder="Operating hours (e.g. Mon-Sat 8am-6pm)" value={form.operatingHours} onChange={(e) => setForm({ ...form, operatingHours: e.target.value })} className="col-span-2 rounded border px-3 py-2" />
          <textarea placeholder="Pickup instructions" value={form.pickupInstructions} onChange={(e) => setForm({ ...form, pickupInstructions: e.target.value })} className="col-span-2 rounded border px-3 py-2" rows={2} />
          <button type="submit" disabled={submitting} className="col-span-2 rounded bg-black py-2 text-white disabled:opacity-50">
            {submitting ? 'Adding...' : 'Add Branch'}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading branches...</p>
        ) : (
          <div className="space-y-4">
            {branches.map((b) => (
              <div key={b.id} className="rounded-lg bg-white p-4 shadow">
                {editingId === b.id ? (
                  <div className="space-y-2">
                    <input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="Name" />
                    <input value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="Address" />
                    <input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="Phone" />
                    <input value={editForm.operatingHours || ''} onChange={(e) => setEditForm({ ...editForm, operatingHours: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="Operating hours" />
                    <textarea value={editForm.pickupInstructions || ''} onChange={(e) => setEditForm({ ...editForm, pickupInstructions: e.target.value })} className="w-full rounded border px-3 py-2" placeholder="Pickup instructions" rows={2} />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(b.id)} disabled={submitting} className="rounded bg-black px-4 py-1.5 text-sm text-white disabled:opacity-50">Save</button>
                      <button onClick={() => setEditingId(null)} className="rounded border px-4 py-1.5 text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{b.name}</p>
                      <p className="text-sm text-gray-500">{b.address}</p>
                      {b.phone && <p className="text-sm text-gray-500">{b.phone}</p>}
                      {b.operatingHours && <p className="text-sm text-gray-500">Hours: {b.operatingHours}</p>}
                      {b.pickupInstructions && <p className="text-sm text-gray-500">Pickup: {b.pickupInstructions}</p>}
                    </div>
                    <button onClick={() => startEdit(b)} className="text-sm font-semibold text-blue-600 hover:underline">Edit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}