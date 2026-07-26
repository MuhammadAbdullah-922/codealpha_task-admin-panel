import { useEffect, useState } from 'react';
import { MdSearch, MdReceiptLong, MdVisibility } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Topbar } from '../components/layout/Sidebar';
import { Loader, EmptyState, Modal, Pagination, StatusBadge } from '../components/ui/UI';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// NEW: payment verification states, separate from the order-fulfilment
// status above.
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const PAYMENT_METHOD_LABELS = {
  cod: 'Cash On Delivery',
  online: 'Online',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank: 'Bank Transfer',
};

export default function Orders({ setSidebarOpen }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, paymentStatusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', {
        params: { search, status: statusFilter, payment_status: paymentStatusFilter, page },
      });
      setOrders(res.data.orders.data || []);
      setLastPage(res.data.orders.last_page || 1);
    } catch (err) {
      toast.error('Orders load nahi ho sakay');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    setDetailLoading(true);
    setSelectedOrder({ loading: true });
    try {
      const res = await api.get(`/admin/orders/${id}`);
      setSelectedOrder(res.data.order);
    } catch (err) {
      toast.error('Order detail load nahi hua');
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${selectedOrder.id}/status`, { status: newStatus });
      toast.success('Order status update ho gaya');
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      fetchOrders();
    } catch (err) {
      toast.error('Status update nahi ho saka');
    } finally {
      setUpdating(false);
    }
  };

  // NEW: verify/reject a prepaid payment (JazzCash / EasyPaisa / Bank)
  // after checking the transaction ID + sender number against the store's
  // own wallet/bank records.
  const handlePaymentStatusUpdate = async (newStatus) => {
    setUpdatingPayment(true);
    try {
      const res = await api.put(`/admin/orders/${selectedOrder.id}/payment-status`, {
        payment_status: newStatus,
      });
      toast.success('Payment status update ho gaya');
      setSelectedOrder(res.data.order);
      fetchOrders();
    } catch (err) {
      toast.error('Payment status update nahi ho saka');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const isPrepaid = (method) => method && method !== 'cod';
  const canVerifyPayment = () => true; // manual override allowed for every method, including COD

  return (
    <>
      <Topbar
        title="Orders"
        subtitle="Track and manage all customer orders"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="bz-content">
        <div className="bz-card">
          <div className="bz-card-header flex-wrap gap-2">
            <div className="d-flex gap-2 flex-wrap">
              <div className="position-relative" style={{ width: 220 }}>
                <MdSearch className="position-absolute" style={{ left: 10, top: 9, color: '#ABABAB' }} />
                <input
                  className="bz-input"
                  style={{ paddingLeft: 32 }}
                  placeholder="Search order number..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <select
                className="bz-select"
                style={{ width: 160 }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {/* NEW: filter by payment verification status */}
              <select
                className="bz-select"
                style={{ width: 170 }}
                value={paymentStatusFilter}
                onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Payment Status</option>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <EmptyState icon={<MdReceiptLong />} title="No orders found" subtitle="Orders placed by customers will appear here." />
          ) : (
            <div className="table-responsive">
              <table className="bz-table mb-0">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Payment Status</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td data-label="Order #" style={{ fontWeight: 600 }}>{o.order_number}</td>
                      <td data-label="Customer">{o.user?.name || '—'}</td>
                      <td data-label="Items">{o.items?.length || 0} items</td>
                      <td data-label="Total"><strong>Rs. {Number(o.total).toLocaleString()}</strong></td>
                      <td data-label="Payment" style={{ textTransform: 'uppercase', fontSize: 11 }}>
                        {PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method}
                      </td>
                      {/* NEW: payment_status column was missing entirely */}
                      <td data-label="Payment Status">
                        <StatusBadge status={o.payment_status || 'pending'} />
                      </td>
                      <td data-label="Status"><StatusBadge status={o.status} /></td>
                      <td data-label="Date" style={{ color: '#ABABAB', fontSize: 12 }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td data-label="">
                        <button className="bz-btn bz-btn-outline bz-btn-sm" onClick={() => openDetail(o.id)}>
                          <MdVisibility size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="p-3">
              <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <Modal title={`Order ${selectedOrder.order_number || ''}`} onClose={() => setSelectedOrder(null)} maxWidth={620}>
          {detailLoading ? (
            <Loader />
          ) : (
            <>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600 }}>CUSTOMER</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedOrder.user?.name}</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B' }}>{selectedOrder.user?.email}</div>
                </div>
                <div className="col-6">
                  <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600 }}>SHIPPING ADDRESS</div>
                  <div style={{ fontSize: 13 }}>{selectedOrder.shipping_address}</div>
                  <div style={{ fontSize: 13 }}>{selectedOrder.shipping_city} — {selectedOrder.shipping_phone}</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600, marginBottom: 8 }}>ITEMS</div>
              <div className="bz-card mb-3" style={{ boxShadow: 'none' }}>
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center px-3 py-2" style={{ borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                    <div>
                      <strong>{item.product_name}</strong>
                      <div style={{ fontSize: 11.5, color: '#ABABAB' }}>{item.color} / {item.size} × {item.quantity}</div>
                    </div>
                    <strong>Rs. {Number(item.total).toLocaleString()}</strong>
                  </div>
                ))}
              </div>

              <div className="row g-2 mb-3" style={{ fontSize: 13 }}>
                <div className="col-6 text-muted">Subtotal</div>
                <div className="col-6 text-end">Rs. {Number(selectedOrder.subtotal).toLocaleString()}</div>
                <div className="col-6 text-muted">Discount</div>
                <div className="col-6 text-end">- Rs. {Number(selectedOrder.discount).toLocaleString()}</div>
                <div className="col-6 text-muted">Shipping</div>
                <div className="col-6 text-end">Rs. {Number(selectedOrder.shipping).toLocaleString()}</div>
                <div className="col-6 fw-bold">Total</div>
                <div className="col-6 text-end fw-bold" style={{ color: '#A8893E' }}>Rs. {Number(selectedOrder.total).toLocaleString()}</div>
              </div>

              {/* NEW: PAYMENT DETAILS — this whole block did not exist before.
                  Admin had no way to see method, transaction ID, sender
                  number, or verify/reject a prepaid order. */}
              <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600, marginBottom: 8 }}>PAYMENT DETAILS</div>
              <div className="bz-card mb-3" style={{ boxShadow: 'none', padding: 14 }}>
                <div className="row g-2" style={{ fontSize: 13 }}>
                  <div className="col-6 text-muted">Method</div>
                  <div className="col-6 text-end" style={{ fontWeight: 600 }}>
                    {PAYMENT_METHOD_LABELS[selectedOrder.payment_method] || selectedOrder.payment_method}
                  </div>

                  <div className="col-6 text-muted">Payment Status</div>
                  <div className="col-6 text-end">
                    <StatusBadge status={selectedOrder.payment_status || 'pending'} />
                  </div>

                  {selectedOrder.payment?.transaction_id && (
                    <>
                      <div className="col-6 text-muted">Transaction ID</div>
                      <div className="col-6 text-end">{selectedOrder.payment.transaction_id}</div>
                    </>
                  )}

                  {selectedOrder.payment?.sender_number && (
                    <>
                      <div className="col-6 text-muted">Sender Number</div>
                      <div className="col-6 text-end">{selectedOrder.payment.sender_number}</div>
                    </>
                  )}

                  {selectedOrder.payment?.bank_reference && (
                    <>
                      <div className="col-6 text-muted">Bank Reference</div>
                      <div className="col-6 text-end">{selectedOrder.payment.bank_reference}</div>
                    </>
                  )}

                  {selectedOrder.payment?.verified_at && (
                    <>
                      <div className="col-6 text-muted">Verified At</div>
                      <div className="col-6 text-end">
                        {new Date(selectedOrder.payment.verified_at).toLocaleString()}
                      </div>
                    </>
                  )}
                </div>

                {/* NEW: payment screenshot — click to open full-size in a
                    new tab. Falls back to nothing if the customer hasn't
                    uploaded one yet (e.g. upload failed silently). */}
                {selectedOrder.payment?.proof_image_url && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600, marginBottom: 8 }}>
                      PAYMENT SCREENSHOT
                    </div>
                    <a href={selectedOrder.payment.proof_image_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedOrder.payment.proof_image_url}
                        alt="Payment proof"
                        style={{ maxWidth: 220, borderRadius: 8, border: '1px solid #E5E7EB', cursor: 'zoom-in' }}
                      />
                    </a>
                  </div>
                )}

                {isPrepaid(selectedOrder.payment_method) && !selectedOrder.payment?.proof_image_url && (
                  <p style={{ fontSize: 12, color: '#DC2626', marginTop: 10 }}>
                    No screenshot uploaded for this order — verify carefully before marking as Completed.
                  </p>
                )}

                {/* Every method can be manually verified — COD included,
                    in case the admin already collected cash before the
                    order was marked "delivered" (which also auto-completes
                    it on the backend). */}
                {canVerifyPayment() && (
                  <>
                    <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600, margin: '14px 0 8px' }}>
                      VERIFY PAYMENT
                    </div>
                    {selectedOrder.payment_method === 'cod' && (
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>
                        Cash on Delivery — this is auto-marked "Completed" when the order status is set to Delivered. Use these buttons only to override manually.
                      </p>
                    )}
                    <div className="d-flex gap-2 flex-wrap">
                      {PAYMENT_STATUSES.map((s) => (
                        <button
                          key={s}
                          className={`bz-btn bz-btn-sm ${selectedOrder.payment_status === s ? 'bz-btn-gold' : 'bz-btn-outline'}`}
                          disabled={updatingPayment}
                          onClick={() => handlePaymentStatusUpdate(s)}
                        >
                          {s[0].toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600, marginBottom: 8 }}>UPDATE STATUS</div>
              <div className="d-flex gap-2 flex-wrap">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    className={`bz-btn bz-btn-sm ${selectedOrder.status === s ? 'bz-btn-gold' : 'bz-btn-outline'}`}
                    disabled={updating}
                    onClick={() => handleStatusUpdate(s)}
                  >
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}