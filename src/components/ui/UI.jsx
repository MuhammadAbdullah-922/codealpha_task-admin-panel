import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

export function StatCard({ icon, label, value, trend, trendUp, bg, color }) {
  return (
    <div className="bz-stat-card">
      <div>
        <div className="bz-stat-label">{label}</div>
        <div className="bz-stat-value">{value}</div>
        {trend && (
          <div className={`bz-stat-trend ${trendUp ? 'up' : 'down'}`}>
            {trendUp ? <MdArrowUpward size={11} /> : <MdArrowDownward size={11} />} {trend}
          </div>
        )}
      </div>
      <div className="bz-stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
    </div>
  );
}

const statusMap = {
  pending: 'bz-badge-pending',
  processing: 'bz-badge-processing',
  shipped: 'bz-badge-shipped',
  delivered: 'bz-badge-delivered',
  cancelled: 'bz-badge-cancelled',
  active: 'bz-badge-active',
  inactive: 'bz-badge-inactive',
  paid: 'bz-badge-delivered',
  failed: 'bz-badge-cancelled',
  normal: 'bz-badge-active',
  'low stock': 'bz-badge-low',
  critical: 'bz-badge-critical',
};

export function StatusBadge({ status }) {
  const key = (status || '').toLowerCase();
  const cls = statusMap[key] || 'bz-badge-inactive';
  return <span className={`bz-badge ${cls}`}>{status}</span>;
}

export function Loader() {
  return (
    <div className="bz-center-loader">
      <div className="bz-spinner" />
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="bz-empty">
      <div className="bz-empty-icon">{icon}</div>
      <h6 className="fw-bold mb-1">{title}</h6>
      <p style={{ fontSize: 12.5 }}>{subtitle}</p>
    </div>
  );
}

export function Modal({ title, onClose, children, footer, maxWidth = 560 }) {
  return (
    <div className="bz-modal-backdrop" onClick={onClose}>
      <div className="bz-modal" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="bz-modal-header">
          <h6 className="fw-bold mb-0">{title}</h6>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="bz-modal-body">{children}</div>
        {footer && <div className="bz-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Pagination({ currentPage, lastPage, onChange }) {
  if (lastPage <= 1) return null;
  const pages = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return (
    <div className="d-flex justify-content-center gap-1 mt-3 flex-wrap">
      <button
        className="bz-btn bz-btn-outline bz-btn-sm"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={i} className="px-2 d-flex align-items-center" style={{ fontSize: 12, color: '#ABABAB' }}>
            ...
          </span>
        ) : (
          <button
            key={i}
            className={`bz-btn bz-btn-sm ${p === currentPage ? 'bz-btn-gold' : 'bz-btn-outline'}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="bz-btn bz-btn-outline bz-btn-sm"
        disabled={currentPage === lastPage}
        onClick={() => onChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
