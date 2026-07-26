import { useEffect, useState, useCallback } from 'react';
import { MdSearch, MdPeople, MdDelete, MdVisibility } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Topbar } from '../components/layout/Sidebar';
import { Loader, EmptyState, Modal, Pagination } from '../components/ui/UI';

export default function Customers({ setSidebarOpen }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/customers', { params: { search, page } });
      setCustomers(res.data.customers.data || []);
      setLastPage(res.data.customers.last_page || 1);
    } catch (err) {
      toast.error('Customers load nahi ho sakay');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setSelected({});
    try {
      const res = await api.get(`/admin/customers/${id}`);
      setSelected(res.data.customer);
    } catch (err) {
      toast.error('Customer detail load nahi hua');
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/customers/${deleteTarget.id}`);
      toast.success('Customer delete ho gaya');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      toast.error('Delete nahi ho saka');
    }
  };

  return (
    <>
      <Topbar title="Customers" subtitle="View and manage your registered customers" onMenuClick={() => setSidebarOpen(true)} />

      <div className="bz-content">
        <div className="bz-card">
          <div className="bz-card-header">
            <div className="position-relative" style={{ width: 260, maxWidth: '100%' }}>
              <MdSearch className="position-absolute" style={{ left: 10, top: 9, color: '#ABABAB' }} />
              <input
                className="bz-input"
                style={{ paddingLeft: 32 }}
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : customers.length === 0 ? (
            <EmptyState icon={<MdPeople />} title="No customers found" subtitle="Registered customers will appear here." />
          ) : (
            <div className="table-responsive">
              <table className="bz-table mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td data-label="Name" style={{ fontWeight: 600 }}>{c.name}</td>
                      <td data-label="Email">{c.email}</td>
                      <td data-label="Phone">{c.phone || '—'}</td>
                      <td data-label="Orders">{c.orders_count || 0}</td>
                      <td data-label="Total Spent">Rs. {Number(c.orders_sum_total || 0).toLocaleString()}</td>
                      <td data-label="Joined" style={{ color: '#ABABAB', fontSize: 12 }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td data-label="">
                        <div className="d-flex gap-2">
                          <button className="bz-btn bz-btn-outline bz-btn-sm" onClick={() => openDetail(c.id)}>
                            <MdVisibility size={14} />
                          </button>
                          <button className="bz-btn bz-btn-danger bz-btn-sm" onClick={() => setDeleteTarget(c)}>
                            <MdDelete size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && customers.length > 0 && (
            <div className="p-3">
              <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {selected && (
        <Modal title="Customer Details" onClose={() => setSelected(null)} maxWidth={560}>
          {detailLoading ? (
            <Loader />
          ) : (
            <>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bz-avatar" style={{ width: 48, height: 48, fontSize: 16 }}>
                  {selected.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B' }}>{selected.email} • {selected.phone}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600, marginBottom: 8 }}>RECENT ORDERS</div>
              {(selected.orders || []).length === 0 ? (
                <p style={{ fontSize: 13, color: '#ABABAB' }}>No orders placed yet.</p>
              ) : (
                selected.orders.map((o) => (
                  <div key={o.id} className="d-flex justify-content-between px-3 py-2" style={{ borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                    <span>{o.order_number}</span>
                    <strong>Rs. {Number(o.total).toLocaleString()}</strong>
                  </div>
                ))
              )}
            </>
          )}
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete Customer?"
          onClose={() => setDeleteTarget(null)}
          maxWidth={420}
          footer={
            <>
              <button className="bz-btn bz-btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="bz-btn bz-btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </>
          }
        >
          <p style={{ fontSize: 14 }}>
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>'s account?
          </p>
        </Modal>
      )}
    </>
  );
}