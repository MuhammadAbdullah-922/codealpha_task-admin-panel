import { useEffect, useState } from 'react';
import {
  MdAttachMoney, MdShoppingBag, MdPeople, MdInventory2, MdPendingActions, MdRateReview,
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import api from '../services/api';
import { Topbar } from '../components/layout/Sidebar';
import { StatCard, StatusBadge, Loader, EmptyState } from '../components/ui/UI';
import { MdReceiptLong } from 'react-icons/md';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard({ setSidebarOpen }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
      setError('');
    } catch (err) {
      setError('Dashboard data load nahi ho saka. Backend check karo.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = (data?.monthly_sales || []).map((m) => ({
    name: monthNames[m.month - 1],
    total: parseFloat(m.total),
  }));

  return (
    <>
      <Topbar
        title="Dashboard Overview"
        subtitle="Welcome back! Here's what's happening with Bzack today."
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="bz-content">
        {loading && <Loader />}

        {!loading && error && (
          <div className="bz-card">
            <EmptyState icon={<MdShoppingBag />} title="Could not load dashboard" subtitle={error} />
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* STAT CARDS */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-4 col-xl-2">
                <StatCard
                  icon={<MdAttachMoney />}
                  label="Total Sales"
                  value={`Rs. ${Number(data.stats.total_sales).toLocaleString()}`}
                  bg="#FDF6E3" color="#A8893E"
                />
              </div>
              <div className="col-6 col-lg-4 col-xl-2">
                <StatCard
                  icon={<MdShoppingBag />}
                  label="Total Orders"
                  value={data.stats.total_orders}
                  bg="#EFF6FF" color="#3B82F6"
                />
              </div>
              <div className="col-6 col-lg-4 col-xl-2">
                <StatCard
                  icon={<MdPeople />}
                  label="Customers"
                  value={data.stats.total_customers}
                  bg="#EDFBF4" color="#2ECC71"
                />
              </div>
              <div className="col-6 col-lg-4 col-xl-2">
                <StatCard
                  icon={<MdInventory2 />}
                  label="Products"
                  value={data.stats.total_products}
                  bg="#F3E8FF" color="#7c3aed"
                />
              </div>
              <div className="col-6 col-lg-4 col-xl-2">
                <StatCard
                  icon={<MdPendingActions />}
                  label="Pending Orders"
                  value={data.stats.pending_orders}
                  bg="#FFF0F0" color="#E84040"
                />
              </div>
              <div className="col-6 col-lg-4 col-xl-2">
                <StatCard
                  icon={<MdRateReview />}
                  label="Pending Reviews"
                  value={data.stats.pending_reviews}
                  bg="#FFF7ED" color="#F97316"
                />
              </div>
            </div>

            <div className="row g-3">
              {/* SALES CHART */}
              <div className="col-lg-7">
                <div className="bz-card h-100">
                  <div className="bz-card-header">
                    <h6>Sales Overview</h6>
                    <span style={{ fontSize: 11.5, color: '#ABABAB' }}>This Year</span>
                  </div>
                  <div className="bz-card-body">
                    {chartData.length === 0 ? (
                      <EmptyState icon={<MdAttachMoney />} title="No sales data yet" subtitle="Sales will appear here once orders come in." />
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Sales']}
                            contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E8E8E8' }}
                          />
                          <Bar dataKey="total" fill="#C9A84C" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* TOP PRODUCTS */}
              <div className="col-lg-5">
                <div className="bz-card h-100">
                  <div className="bz-card-header">
                    <h6>Top Products</h6>
                  </div>
                  <div className="bz-card-body p-0">
                    {(data.top_products || []).length === 0 ? (
                      <div className="p-3">
                        <EmptyState icon={<MdInventory2 />} title="No product sales yet" subtitle="" />
                      </div>
                    ) : (
                      data.top_products.map((p, i) => (
                        <div
                          key={p.id}
                          className="d-flex align-items-center justify-content-between px-3 py-2"
                          style={{ borderBottom: i !== data.top_products.length - 1 ? '1px solid #F5F5F5' : 'none' }}
                        >
                          <div className="d-flex align-items-center gap-2 overflow-hidden">
                            <div
                              style={{
                                width: 30, height: 30, borderRadius: 8, background: '#FDF6E3',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, color: '#A8893E', flexShrink: 0,
                              }}
                            >
                              {i + 1}
                            </div>
                            <span className="text-truncate" style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                          </div>
                          <span style={{ fontSize: 12, color: '#6B6B6B', flexShrink: 0 }}>
                            {p.order_items_count || 0} sold
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="bz-card mt-3">
              <div className="bz-card-header">
                <h6>Recent Orders</h6>
              </div>
              <div className="table-responsive">
                <table className="bz-table mb-0">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.recent_orders || []).length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState icon={<MdReceiptLong />} title="No orders yet" subtitle="New orders will show up here." />
                        </td>
                      </tr>
                    ) : (
                      data.recent_orders.map((o) => (
                        <tr key={o.id}>
                          <td data-label="Order #" style={{ fontWeight: 600 }}>{o.order_number}</td>
                          <td data-label="Customer">{o.user?.name || '—'}</td>
                          <td data-label="Total">Rs. {Number(o.total).toLocaleString()}</td>
                          <td data-label="Payment" style={{ textTransform: 'uppercase', fontSize: 11 }}>{o.payment_method}</td>
                          <td data-label="Status"><StatusBadge status={o.status} /></td>
                          <td data-label="Date" style={{ color: '#ABABAB', fontSize: 12 }}>
                            {new Date(o.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
