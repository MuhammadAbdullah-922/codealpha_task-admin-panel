import { useEffect, useState, useCallback } from "react";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdCategory,
} from "react-icons/md";
import toast from "react-hot-toast";
import api from "../services/api";
import { Topbar } from "../components/layout/Sidebar";
import {
  Loader,
  EmptyState,
  Modal,
  Pagination,
  StatusBadge,
} from "../components/ui/UI";


const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${base}/storage/${path}`;
};

const emptyForm = {
  name: "",
  description: "",
  image: null,
  is_active: true,
};

export default function Categories({ setSidebarOpen }) {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);

  const [editId, setEditId] = useState(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [preview, setPreview] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
  fetchCategories();
}, [fetchCategories]);

const fetchCategories = useCallback(async () => {
  setLoading(true);

  try {
    const res = await api.get("/admin/categories", {
      params: {
        page,
        search,
      },
    });

    const data = res.data.categories;

    if (data.data) {
      setCategories(data.data);
      setLastPage(data.last_page);
    } else {
      setCategories(data || []);
      setLastPage(1);
    }
  } catch (err) {
    toast.error("Categories load nahi ho sakin");
  } finally {
    setLoading(false);
  }
}, [page, search]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setPreview("");
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditId(category.id);

    setForm({
      name: category.name || "",
      description: category.description || "",
      image: null,
      is_active: category.is_active,
    });

    setPreview(getImageUrl(category.image));

    setShowModal(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setForm({
      ...form,
      image: file,
    });

    setPreview(URL.createObjectURL(file));
  };
    const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description || "");
    formData.append("is_active", form.is_active ? 1 : 0);

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editId) {
        formData.append("_method", "PUT");

        await api.post(`/admin/categories/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Category updated successfully");
      } else {
        await api.post("/admin/categories", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Category created successfully");
      }

      setShowModal(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors)
            .flat()
            .join(", ")
        : "Something went wrong";

      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);

      toast.success("Category deleted successfully");

      setDeleteTarget(null);

      fetchCategories();
    } catch (err) {
      toast.error("Delete failed");
    }
  };
    return (
    <>
      <Topbar
        title="Categories"
        subtitle="Manage your product categories"
        onMenuClick={() => setSidebarOpen(true)}
        action={
          <button className="bz-btn bz-btn-gold" onClick={openAdd}>
            <MdAdd /> Add Category
          </button>
        }
      />

      <div className="bz-content">
        <div className="bz-card">

          <div className="bz-card-header">
            <div
              className="position-relative"
              style={{ width: 260, maxWidth: "100%" }}
            >
              <MdSearch
                className="position-absolute"
                style={{
                  left: 10,
                  top: 9,
                  color: "#ABABAB",
                }}
              />

              <input
                className="bz-input"
                style={{ paddingLeft: 32 }}
                placeholder="Search categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <span
              style={{
                fontSize: 12,
                color: "#ABABAB",
              }}
            >
              {categories.length} shown
            </span>
          </div>

          {loading ? (
            <Loader />
          ) : categories.length === 0 ? (

            <EmptyState
              icon={<MdCategory />}
              title="No categories found"
              subtitle="Create your first category."
            />

          ) : (

            <div className="table-responsive">

              <table className="bz-table mb-0">

                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {categories.map((category) => (

                    <tr key={category.id}>

                      <td>

                        <div
                          style={{
                            width: 45,
                            height: 45,
                            borderRadius: 6,
                            overflow: "hidden",
                            background: "#F5F5F5",
                          }}
                        >
                          {category.image && (
                            <img
                              src={getImageUrl(category.image)}
                              alt={category.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>

                      </td>

                      <td>

                        <strong>{category.name}</strong>

                        <div
                          style={{
                            fontSize: 12,
                            color: "#888",
                          }}
                        >
                          {category.description}
                        </div>

                      </td>

                      <td>

                        {category.products_count}

                      </td>

                      <td>

                        <StatusBadge
                          status={
                            category.is_active
                              ? "Active"
                              : "Inactive"
                          }
                        />

                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            className="bz-btn bz-btn-outline bz-btn-sm"
                            onClick={() => openEdit(category)}
                          >
                            <MdEdit size={14} />
                          </button>

                          <button
                            className="bz-btn bz-btn-danger bz-btn-sm"
                            onClick={() =>
                              setDeleteTarget(category)
                            }
                          >
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

          {!loading && categories.length > 0 && (

            <div className="p-3">

              <Pagination
                currentPage={page}
                lastPage={lastPage}
                onChange={setPage}
              />

            </div>

          )}

        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <Modal
          title={editId ? "Edit Category" : "Add Category"}
          onClose={() => setShowModal(false)}
          maxWidth={520}
          footer={
            <>
              <button
                className="bz-btn bz-btn-outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="bz-btn bz-btn-gold"
                form="category-form"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editId
                  ? "Update Category"
                  : "Save Category"}
              </button>
            </>
          }
        >
          <form id="category-form" onSubmit={handleSave}>
            <div className="row g-3">

              <div className="col-12">
                <label className="bz-label">
                  Category Name
                </label>

                <input
                  className="bz-input"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-12">
                <label className="bz-label">
                  Description
                </label>

                <textarea
                  rows={3}
                  className="bz-input"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-12">
                <label className="bz-label">
                  Category Image
                </label>

                <input
                  type="file"
                  className="bz-input"
                  accept="image/*"
                  onChange={handleImage}
                />

                {preview && (
                  <div className="mt-3">
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="col-12">
                <label
                  className="d-flex align-items-center gap-2"
                  style={{ fontSize: 14 }}
                >
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_active: e.target.checked,
                      })
                    }
                  />

                  Active Category
                </label>
              </div>

            </div>
          </form>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <Modal
          title="Delete Category?"
          onClose={() => setDeleteTarget(null)}
          maxWidth={420}
          footer={
            <>
              <button
                className="bz-btn bz-btn-outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                className="bz-btn bz-btn-danger"
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
            </>
          }
        >
          <p style={{ fontSize: 14 }}>
            Are you sure you want to delete
            <strong> {deleteTarget.name}</strong>?
            <br />
            This action cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
}


