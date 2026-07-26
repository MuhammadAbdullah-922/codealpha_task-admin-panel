import { useEffect, useState } from 'react';
import { MdAttachMoney, MdShoppingBag, MdPeople, MdInventory2, MdTrendingUp, MdReceiptLong } from 'react-icons/md';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Topbar } from '../components/layout/Sidebar';
import { StatCard, Loader, EmptyState } from '../components/ui/UI';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports({ setSidebarOpen }) {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, salesRes, topRes] = await Promise.all([
        api.get('/admin/reports/summary'),
        api.get('/admin/reports/sales', { params: { period: 'monthly' } }),
        api.get('/admin/reports/top-products'),
      ]);
      setSummary(summaryRes.data.summary);
      setSales(salesRes.data.sales || []);
      setTopProducts(topRes.data.products || []);
    } catch (err) {
      toast.error('Reports load nahi ho sakay');
    } finally {
      setLoading(false);
    }
  };

  const chartData = sales.map((s) => ({ name: monthNames[s.month - 1], total: parseFloat(s.total), orders: s.orders }));

  return (
    <>
      <Topbar title="Reports" subtitle="Sales performance and business insights" onMenuClick={() => setSidebarOpen(true)} />

      <div className="bz-content">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3">
                <StatCard icon={<MdAttachMoney />} label="Total Revenue" value={`Rs. ${Number(summary?.total_revenue || 0).toLocaleString()}`} bg="#FDF6E3" color="#A8893E" />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard icon={<MdReceiptLong />} label="Today's Sales" value={`Rs. ${Number(summary?.today_sales || 0).toLocaleString()}`} bg="#EDFBF4" color="#2ECC71" />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard icon={<MdShoppingBag />} label="Monthly Orders" value={summary?.monthly_orders || 0} bg="#EFF6FF" color="#3B82F6" />
              </div>
              <div className="col-6 col-lg-3">
                <StatCard icon={<MdPeople />} label="Total Customers" value={summary?.total_customers || 0} bg="#F3E8FF" color="#7c3aed" />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-lg-8">
                <div className="bz-card h-100">
                  <div className="bz-card-header">
                    <h6>Revenue Trend</h6>
                    <span style={{ fontSize: 11.5, color: '#ABABAB' }}>Monthly — {new Date().getFullYear()}</span>
                  </div>
                  <div className="bz-card-body">
                    {chartData.length === 0 ? (
                      <EmptyState icon={<MdTrendingUp />} title="No sales data yet" subtitle="" />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E8E8E8' }} />
                          <Line type="monotone" dataKey="total" stroke="#C9A84C" strokeWidth={3} dot={{ fill: '#C9A84C', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="bz-card h-100">
                  <div className="bz-card-header">
                    <h6>Top Selling Products</h6>
                  </div>
                  <div className="bz-card-body p-0">
                    {topProducts.length === 0 ? (
                      <div className="p-3">
                        <EmptyState icon={<MdInventory2 />} title="No data yet" subtitle="" />
                      </div>
                    ) : (
                      topProducts.map((p, i) => (
                        <div key={p.id} className="d-flex align-items-center justify-content-between px-3 py-2" style={{ borderBottom: i !== topProducts.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                          <div className="d-flex align-items-center gap-2 overflow-hidden">
                            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#FDF6E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#A8893E', flexShrink: 0 }}>
                              {i + 1}
                            </div>
                            <span className="text-truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name}</span>
                          </div>
                          <span style={{ fontSize: 11.5, color: '#A8893E', fontWeight: 700, flexShrink: 0 }}>
                            Rs. {Number(p.order_items_sum_total || 0).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
