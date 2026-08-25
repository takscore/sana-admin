'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { apiFetch } from '@/lib/api';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  product: { name: string };
}

interface Order {
  id: string;
  status: string;
  deliveryType: string;
  deliveryAddress: string | null;
  total: string;
  createdAt: string;
  user: { name: string; phone: string };
  items: OrderItem[];
}

const STATUSES = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await apiFetch('/orders/admin/all');
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      await apiFetch(`/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await loadOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <h1 className="mb-6 text-2xl font-bold">Orders</h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg bg-white p-4 shadow">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{order.user.name} — {order.user.phone}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <ul className="mb-2 text-sm text-gray-700">
                  {order.items.map((item) => (
                    <li key={item.id}>{item.quantity} × {item.product.name} (MWK {item.unitPrice} each)</li>
                  ))}
                </ul>
                <p className="text-sm">
                  {order.deliveryType === 'delivery' ? `Delivery to: ${order.deliveryAddress}` : 'Pickup'}
                </p>
                <p className="mt-1 font-semibold">Total: MWK {order.total}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}