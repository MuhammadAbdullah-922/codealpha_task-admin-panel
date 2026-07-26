import React, { useEffect, useState } from "react";
import {
  getMessages,
  deleteMessage,
  getMessage,
} from "../services/api";

import { Topbar } from "../components/layout/Sidebar";
import toast from "react-hot-toast";
import Swal from "sweetalert2"; // 👈 naya import

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await getMessages();
      setMessages(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await getMessage(id);
      setSelected(res.data);
      fetchMessages();
    } catch {
      toast.error("Unable to load message");
    }
  };

  // 👇 Yahan window.confirm ki jagah SweetAlert use kiya
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return; // agar user ne cancel kiya to yahin ruk jayega

    try {
      await deleteMessage(id);
      toast.success("Message deleted");
      fetchMessages();

      Swal.fire({
        title: "Deleted!",
        text: "The message has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      toast.error("Delete failed");
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  return (
    <>
      <Topbar title="Messages" subtitle="Customer Contact Messages" />

      <div className="container-fluid mt-4">
        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <h5>Loading...</h5>
            ) : (
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th width="180">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {messages.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No messages found.
                      </td>
                    </tr>
                  )}

                  {messages.map((msg) => (
                    <tr key={msg.id}>
                      <td>{msg.name}</td>
                      <td>{msg.email}</td>
                      <td>{msg.subject}</td>
                      <td>
                        {msg.is_read ? (
                          <span className="badge bg-success">Read</span>
                        ) : (
                          <span className="badge bg-danger">Unread</span>
                        )}
                      </td>
                      <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleView(msg.id)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(msg.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selected && (
          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h5>Message Details</h5>
            </div>
            <div className="card-body">
              <p><strong>Name:</strong> {selected.name}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Subject:</strong> {selected.subject}</p>
              <p><strong>Message:</strong></p>
              <div className="border rounded p-3 bg-light">
                {selected.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}