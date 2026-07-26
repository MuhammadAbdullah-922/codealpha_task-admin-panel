import { useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdInventory2, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Topbar } from '../components/layout/Sidebar';
import { Loader, EmptyState, Modal, Pagination, StatusBadge } from '../components/ui/UI';

// Builds a full URL for an image path returned by the backend (e.g. "products/xyz.jpg")
// using the same base URL your axios instance is already configured with.
const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // already a full URL
  const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${base}/storage/${path}`;
};

const emptyForm = {
  category_id: '', name: '', sku: '', price: '', sale_price: '',
  short_description: '', description: '', sizes: '', colors: '',
  is_active: true, is_featured: false, is_new: false,
};

export default function Products({ setSidebarOpen }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // --- image handling state ---
  const [existingImages, setExistingImages] = useState([]); // image paths already on the product (edit mode)
  const [removeImages, setRemoveImages] = useState([]); // paths marked for removal
  const [newImages, setNewImages] = useState([]); // newly selected File objects

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      // categories optional for filter; fail silently
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products', { params: { search, page } });
      setProducts(res.data.products.data || []);
      setLastPage(res.data.products.last_page || 1);
    } catch (err) {
      toast.error('Products load nahi ho sakay');
    } finally {
      setLoading(false);
    }
  };

  const resetImageState = () => {
    setExistingImages([]);
    setRemoveImages([]);
    setNewImages([]);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    resetImageState();
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      category_id: p.category_id || '',
      name: p.name || '',
      sku: p.sku || '',
      price: p.price || '',
      sale_price: p.sale_price || '',
      short_description: p.short_description || '',
      description: p.description || '',
      sizes: (p.sizes || []).join(', '),
      colors: (p.colors || []).join(', '),
      is_active: p.is_active ?? true,
      is_featured: p.is_featured ?? false,
      is_new: p.is_new ?? false,
    });
    setEditId(p.id);
    setExistingImages(p.images || []);
    setRemoveImages([]);
    setNewImages([]);
    setShowModal(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = ''; // allow re-selecting the same file again if removed
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const markExistingImageForRemoval = (path) => {
    setExistingImages((prev) => prev.filter((p) => p !== path));
    setRemoveImages((prev) => [...prev, path]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const sizesArr = form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const colorsArr = form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const formData = new FormData();
    formData.append('category_id', form.category_id);
    formData.append('name', form.name);
    formData.append('sku', form.sku);
    formData.append('price', parseFloat(form.price));
    if (form.sale_price) formData.append('sale_price', parseFloat(form.sale_price));
    formData.append('short_description', form.short_description || '');
    formData.append('description', form.description || '');
    sizesArr.forEach((s) => formData.append('sizes[]', s));
    colorsArr.forEach((c) => formData.append('colors[]', c));
    formData.append('is_active', form.is_active ? 1 : 0);
    formData.append('is_featured', form.is_featured ? 1 : 0);
    formData.append('is_new', form.is_new ? 1 : 0);

    newImages.forEach((file) => formData.append('images[]', file));

    try {
      if (editId) {
        removeImages.forEach((path) => formData.append('remove_images[]', path));
        formData.append('_method', 'PUT'); // Laravel method spoofing, needed for multipart updates
        await api.post(`/admin/products/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product update ho gaya');
      } else {
        await api.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product add ho gaya');
      }
      setShowModal(false);
      fetchProducts();
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
      await api.delete(`/admin/products/${deleteTarget.id}`);
      toast.success('Product delete ho gaya');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error('Delete nahi ho saka');
    }
  };

  return (
    <>
      <Topbar
        title="Products"
        subtitle="Manage your store's clothing catalog"
        onMenuClick={() => setSidebarOpen(true)}
        action={
          <button className="bz-btn bz-btn-gold" onClick={openAdd}>
            <MdAdd /> Add Product
          </button>
        }
      />

      <div className="bz-content">
        <div className="bz-card">
          <div className="bz-card-header">
            <div className="position-relative" style={{ width: 260, maxWidth: '100%' }}>
              <MdSearch className="position-absolute" style={{ left: 10, top: 9, color: '#ABABAB' }} />
              <input
                className="bz-input"
                style={{ paddingLeft: 32 }}
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <span style={{ fontSize: 12, color: '#ABABAB' }}>{products.length} shown</span>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <EmptyState icon={<MdInventory2 />} title="No products found" subtitle="Add your first product to get started." />
          ) : (
            <div className="table-responsive">
              <table className="bz-table mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Product">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: 36, height: 36, borderRadius: 6, overflow: 'hidden',
                              background: '#F2F2F2', flexShrink: 0,
                            }}
                          >
                            {p.images?.[0] && (
                              <img
                                src={getImageUrl(p.images[0])}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td data-label="SKU" style={{ color: '#6B6B6B', fontSize: 12 }}>{p.sku}</td>
                      <td data-label="Category">{p.category?.name || '—'}</td>
                      <td data-label="Price">
                        <strong>Rs. {Number(p.sale_price || p.price).toLocaleString()}</strong>
                        {p.sale_price && (
                          <span style={{ textDecoration: 'line-through', color: '#ABABAB', fontSize: 11, marginLeft: 6 }}>
                            Rs. {Number(p.price).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={p.is_active ? 'Active' : 'Inactive'} />
                      </td>
                      <td data-label="Tags">
                        {p.is_new && <span className="bz-badge bz-badge-processing me-1">New</span>}
                        {p.is_featured && <span className="bz-badge bz-badge-low">Featured</span>}
                      </td>
                      <td data-label="Actions">
                        <div className="d-flex gap-2">
                          <button className="bz-btn bz-btn-outline bz-btn-sm" onClick={() => openEdit(p)}>
                            <MdEdit size={14} />
                          </button>
                          <button className="bz-btn bz-btn-danger bz-btn-sm" onClick={() => setDeleteTarget(p)}>
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

          {!loading && products.length > 0 && (
            <div className="p-3">
              <Pagination currentPage={page} lastPage={lastPage} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <Modal
          title={editId ? 'Edit Product' : 'Add New Product'}
          onClose={() => setShowModal(false)}
          maxWidth={620}
          footer={
            <>
              <button className="bz-btn bz-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="bz-btn bz-btn-gold" form="product-form" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update Product' : 'Save Product'}
              </button>
            </>
          }
        >
          <form id="product-form" onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="bz-label">Product Name</label>
                <input className="bz-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="bz-label">SKU (optional)</label>
                <input
                  className="bz-input"
                  placeholder="Blank chorein, khud generate ho jayega"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="bz-label">Category</label>
                <select className="bz-select" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="bz-label">Price (Rs.)</label>
                <input type="number" className="bz-input" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="bz-label">Sale Price</label>
                <input type="number" className="bz-input" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
              </div>

              {/* --- Product Images --- */}
              <div className="col-12">
                <label className="bz-label">Product Images</label>
                <input
                  type="file"
                  className="bz-input"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />

                {(existingImages.length > 0 || newImages.length > 0) && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {existingImages.map((path) => (
                      <div key={path} style={{ position: 'relative', width: 70, height: 70 }}>
                        <img
                          src={getImageUrl(path)}
                          alt="Product"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                        />
                        <button
                          type="button"
                          onClick={() => markExistingImageForRemoval(path)}
                          style={{
                            position: 'absolute', top: -6, right: -6, background: '#dc3545',
                            color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}
                          aria-label="Remove image"
                        >
                          <MdClose size={12} />
                        </button>
                      </div>
                    ))}
                    {newImages.map((file, i) => (
                      <div key={i} style={{ position: 'relative', width: 70, height: 70 }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt="New upload"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          style={{
                            position: 'absolute', top: -6, right: -6, background: '#dc3545',
                            color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}
                          aria-label="Remove image"
                        >
                          <MdClose size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="bz-label">Sizes (comma separated)</label>
                <input className="bz-input" placeholder="S, M, L, XL" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="bz-label">Colors (comma separated)</label>
                <input className="bz-input" placeholder="Black, White, Navy" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="bz-label">Short Description</label>
                <input className="bz-input" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="bz-label">Full Description</label>
                <textarea className="bz-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-12 d-flex gap-4">
                <label className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
                </label>
                <label className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured
                </label>
                <label className="d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                  <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} /> New Arrival
                </label>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <Modal
          title="Delete Product?"
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
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
}