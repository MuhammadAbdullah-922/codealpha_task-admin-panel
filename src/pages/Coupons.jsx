import { useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdLocalOffer } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Topbar } from '../components/layout/Sidebar';
import { Loader, EmptyState, Modal, Pagination, StatusBadge } from '../components/ui/UI';

const emptyForm = {
  code: '', type: 'percentage', value: '', minimum_order: '', usage_limit: '', expires_at: '', is_active: true,
};

export default function Coupons({ setSidebarOpen }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons', { params: { page } });
      setCoupons(res.data.coupons.data || []);
      setLastPage(res.data.coupons.last_page || 1);
    } catch (err) {
      toast.error('Coupons load nahi ho sakay');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minimum_order: c.minimum_order || '',
      usage_limit: c.usage_limit || '',
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
      is_active: c.is_active,
    });
    setEditId(c.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      value: parseFloat(form.value),
      minimum_order: form.minimum_order ? parseFloat(form.minimum_order) : 0,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
      expires_at: form.expires_at || null,
    };
    try {
      if (editId) {
        await api.put(`/admin/coupons/${editId}`, payload);
        toast.success('Coupon update ho gaya');
      } else {
        await api.post('/admin/coupons', payload);
        toast.success('Coupon create ho gaya');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Kuch ghalat ho gaya';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/coupons/${deleteTarget.id}`);
      toast.success('Coupon delete ho gaya');
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err) {
      toast.error('Delete nahi ho saka');
    }
  };

  return (
    <>
      <Topbar
        title="Coupons"
        subtitle="Create and manage discount codes"
        onMenuClick={() => setSidebarOpen(true)}
        action={
          <button className="bz-btn bz-btn-gold" onClick={openAdd}>
            <MdAdd /> New Coupon
          </button>
        }
      />

      <div className="bz-content">
        <div className="bz-card">
          {loading ? (
            <Loader />
          ) : coupons.length === 0 ? (
            <EmptyState icon={<MdLocalOffer />} title="No coupons created" subtitle="Create your first discount code." />
          ) : (
            <div className="table-responsive">
              <table className="bz-table mb-0">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Order</th>
                    <th>Usage</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td data-label="Code">
                        <span style={{ fontWeight: 700, letterSpacing: 0.5, background: '#FDF6E3', color: '#A8893E', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>
                          {c.code}
                        </span>
                      </td>
                      <td data-label="Type" style={{ textTransform: 'capitalize' }}>{c.type}</td>
                      <td data-label="Value">{c.type === 'percentage' ? `${c.value}%` : `Rs. ${Number(c.value).toLocaleString()}`}</td>
                      <td data-label="Min Order">Rs. {Number(c.minimum_order).toLocaleString()}</td>
                      <td data-label="Usage">{c.used_count} / {c.usage_limit || '∞'}</td>
                      <td data-label="Expires" style={{ fontSize: 12, color: '#ABABAB' }}>
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'No expiry'}
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={c.is_active ? 'Active' : 'Inactive'} />
                      </td>
                      <td data-label="Actions">
                        <div className="d-flex gap-2">
                          <button className="bz-btn bz-btn-outline bz-btn-sm" onClick={() => openEdit(c)}>
                            <MdEdit size={14} />
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

          {!loading && coupons.length > 0 && (
            <div className="p-3">
              <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editId ? 'Edit Coupon' : 'Create New Coupon'}
          onClose={() => setShowModal(false)}
          maxWidth={480}
          footer={
            <>
              <button className="bz-btn bz-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="bz-btn bz-btn-gold" form="coupon-form" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </>
          }
        >
          <form id="coupon-form" onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-12">
                <label className="bz-label">Coupon Code</label>
                <input className="bz-input" required style={{ textTransform: 'uppercase' }} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BZACK20" />
              </div>
              <div className="col-6">
                <label className="bz-label">Discount Type</label>
                <select className="bz-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Rs.)</option>
                </select>
              </div>
              <div className="col-6">
                <label className="bz-label">Value</label>
                <input type="number" className="bz-input" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
              <div className="col-6">
                <label className="bz-label">Minimum Order (Rs.)</label>
                <input type="number" className="bz-input" value={form.minimum_order} onChange={(e) => setForm({ ...form, minimum_order: e.target.value })} />
              </div>
              <div className="col-6">
                <label className="bz-label">Usage Limit</label>
                <input type="number" className="bz-input" placeholder="Unlimited" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />
              </div>
              <div className="col-6">
                <label className="bz-label">Expiry Date</label>
                <input type="date" className="bz-input" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
              <div className="col-6 d-flex align-items-end">
                <label className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
                </label>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete Coupon?"
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
            Are you sure you want to delete coupon <strong>{deleteTarget.code}</strong>?
          </p>
        </Modal>
      )}
    </>
  );
}
