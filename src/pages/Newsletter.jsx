import { useEffect, useState } from "react";
import { MdSearch, MdDelete, MdEmail } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../services/api";
import { Topbar } from "../components/layout/Sidebar";
import {
  Loader,
  EmptyState,
  Pagination,
} from "../components/ui/UI";
import Swal from "sweetalert2";

export default function Newsletter({ setSidebarOpen }) {
  const [subscribers, setSubscribers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    const data = subscribers.filter((s) =>
      s.email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
    setPage(1);
  }, [search, subscribers]);

  const fetchSubscribers = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/newsletter");
      setSubscribers(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Subscribers load nahi huye");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id) => {
  const result = await Swal.fire({
    title: "Delete Subscriber?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  try {
    await api.delete(`/admin/newsletter/${id}`);

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Subscriber deleted successfully.",
      timer: 1500,
      showConfirmButton: false,
    });

    fetchSubscribers();
  } catch {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Delete failed.",
    });
  }
};
  const lastPage = Math.ceil(filtered.length / perPage);

  const currentData = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );
const highlightText = (text, keyword) => {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark
        key={index}
        style={{
          background: "#ffe58f",
          color: "#000",
          padding: "1px 3px",
          borderRadius: "3px",
          fontWeight: 600,
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};
  return (
    <>
      <Topbar
        title="Newsletter"
        subtitle="Manage newsletter subscribers"
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="bz-content">
        <div className="bz-card">

          <div className="bz-card-header">

            <div
              className="position-relative"
              style={{ width: 260 }}
            >
              <MdSearch
                className="position-absolute"
                style={{
                  left: 10,
                  top: 10,
                  color: "#999",
                }}
              />

              <input
                className="bz-input"
                style={{ paddingLeft: 35 }}
                placeholder="Search email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

          </div>

          {loading ? (
            <Loader />
          ) : currentData.length === 0 ? (
            <EmptyState
              icon={<MdEmail />}
              title="No Subscribers"
              subtitle="Newsletter subscribers will appear here."
            />
          ) : (
            <div className="table-responsive">

              <table className="bz-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Subscribed At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {currentData.map((item, index) => (

                    <tr key={item.id}>

                      <td>
                        {(page - 1) * perPage + index + 1}
                      </td>

                     <td>{highlightText(item.email, search)}</td>

                      <td>
                        {new Date(
                          item.created_at
                        ).toLocaleString()}
                      </td>

                      <td>

                        <button
                          className="bz-btn bz-btn-danger bz-btn-sm"
                          onClick={() =>
                            deleteSubscriber(item.id)
                          }
                        >
                          <MdDelete /> Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

          {!loading && filtered.length > 0 && (
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
    </>
  );
}