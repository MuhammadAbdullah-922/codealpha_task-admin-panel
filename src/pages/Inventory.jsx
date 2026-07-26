import { useEffect, useState } from 'react';
import { MdStorage, MdWarning, MdSave } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Topbar } from '../components/layout/Sidebar';
import { Loader, EmptyState, Pagination } from '../components/ui/UI';

export default function Inventory({ setSidebarOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [editing, setEditing] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, lowStockOnly]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/inventory', { params: { low_stock: lowStockOnly ? 1 : '', page } });
      setItems(res.data.inventory.data || []);
      setLastPage(res.data.inventory.last_page || 1);
    } catch (err) {
      toast.error('Inventory load nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (item) => {
    if (item.quantity === 0) return { label: 'Out of Stock', cls: 'bz-badge-critical' };
    if (item.quantity <= item.low_stock_alert) return { label: 'Low Stock', cls: 'bz-badge-low' };
    return { label: 'In Stock', cls: 'bz-badge-active' };
  };

  const handleUpdate = async (id) => {
    setSavingId(id);
    try {
      await api.put(`/admin/inventory/${id}`, { quantity: parseInt(editing[id], 10) });
      toast.success('Stock update ho gaya');
      setEditing((prev) => { const c = { ...prev }; delete c[id]; return c; });
      fetchInventory();
    } catch (err) {
      toast.error('Update nahi ho saka');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <Topbar title="Inventory" subtitle="Track stock levels across all product variants" onMenuClick={() => setSidebarOpen(true)} />

      <div className="bz-content">
        <div className="bz-card">
          <div className="bz-card-header">
            <label className="d-flex align-items-center gap-2" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
              />
              <MdWarning color="#A8893E" /> Show low stock only
            </label>
          </div>

          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <EmptyState icon={<MdStorage />} title="No inventory records" subtitle="Stock entries will appear here." />
          ) : (
            <div className="table-responsive">
              <table className="bz-table mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Variant</th>
                    <th>Stock Qty</th>
                    <th>Alert Threshold</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const status = getStatus(item);
                    const editValue = editing[item.id] !== undefined ? editing[item.id] : item.quantity;
                    return (
                      <tr key={item.id}>
                        <td data-label="Product" style={{ fontWeight: 600 }}>{item.product?.name || '—'}</td>
                        <td data-label="Variant">{item.color} / {item.size}</td>
                        <td data-label="Stock Qty">
                          <input
                            type="number"
                            className="bz-input"
                            style={{ width: 90, padding: '6px 10px' }}
                            value={editValue}
                            onChange={(e) => setEditing((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          />
                        </td>
                        <td data-label="Alert Threshold">{item.low_stock_alert}</td>
                        <td data-label="Status">
                          <span className={`bz-badge ${status.cls}`}>{status.label}</span>
                        </td>
                        <td data-label="Update">
                          <button
                            className="bz-btn bz-btn-gold bz-btn-sm"
                            disabled={savingId === item.id || editing[item.id] === undefined}
                            onClick={() => handleUpdate(item.id)}
                          >
                            <MdSave size={13} /> Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="p-3">
              <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
