'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: string;
  unit: string;
  sku: string;
  stockQty: number;
  category: { name: string };
  branch: { name: string };
}

interface Category { id: string; name: string; }
interface Branch { id: string; name: string; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', price: '', unit: '', sku: '', stockQty: '0', categoryId: '', branchId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [productsData, categoriesData, branchesData] = await Promise.all([
        apiFetch('/products'),
        apiFetch('/categories'),
        apiFetch('/branches'),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setBranches(branchesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stockQty: Number(form.stockQty),
        }),
      });
      setForm({ name: '', price: '', unit: '', sku: '', stockQty: '0', categoryId: '', branchId: '' });
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <h1 className="mb-6 text-2xl font-bold">Products</h1>

        <form onSubmit={handleCreate} className="mb-8 grid grid-cols-2 gap-4 rounded-lg bg-white p-6 shadow">
          <input
            placeholder="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border px-3 py-2" required
          />
          <input
            placeholder="SKU" value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="rounded border px-3 py-2" required
          />
          <input
            placeholder="Price" type="number" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded border px-3 py-2" required
          />
          <input
            placeholder="Unit (e.g. kg, each)" value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="rounded border px-3 py-2" required
          />
          <input
            placeholder="Stock Qty" type="number" value={form.stockQty}
            onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
            className="rounded border px-3 py-2"
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="rounded border px-3 py-2" required
          >
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={form.branchId}
            onChange={(e) => setForm({ ...form, branchId: e.target.value })}
            className="rounded border px-3 py-2" required
          >
            <option value="">Select branch</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button
            type="submit" disabled={submitting}
            className="col-span-2 rounded bg-black py-2 text-white disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : (
          <table className="w-full rounded-lg bg-white shadow">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="p-4">Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Category</th>
                <th className="p-4">Branch</th>
              </tr>
            </thead>
            <tbody> 
              {products.map((p) => (
                <tr key={p.id} className="border-b text-sm">
                  <td className="p-4">{p.name}</td>
                  <td className="p-4">{p.sku}</td>
                  <td className="p-4">MWK {p.price}</td>
                  <td className="p-4">{p.stockQty} {p.unit}</td>
                  <td className="p-4">{p.category.name}</td>
                  <td className="p-4">{p.branch.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}