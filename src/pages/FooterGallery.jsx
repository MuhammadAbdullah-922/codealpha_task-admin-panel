import React, { useState, useEffect } from "react";
import {
  getFooterGallery,
  createFooterGallery,
  updateFooterGallery,
  deleteFooterGallery,
} from "../services/api";
import Swal from "sweetalert2";
import toast from "react-hot-toast";


// Backend base URL (bina /api ke) — image preview ke liye
const STORAGE_BASE_URL = "http://localhost/Laravel/bzack-backend/public/";

const FooterGalleryAdmin = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
 const [sortOrder, setSortOrder] = useState(1);
  

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await getFooterGallery();
      const sorted = [...(res.data || [])].sort(
        (a, b) => a.sort_order - b.sort_order
      );
      setGallery(sorted);
      setSortOrder(sorted.length + 1);
    } catch (err) {
      console.error(err);
      Swal.fire({
  icon: "error",
  title: "Failed to Load Gallery",
  text: "Unable to load footer gallery images.",
});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
  e.preventDefault();

  if (!selectedFile) {
    Swal.fire({
      icon: "warning",
      title: "No Image Selected",
      text: "Please select an image before uploading.",
    });
    return;
  }

  const formData = new FormData();
  formData.append("image", selectedFile);
  formData.append("status", 1);
  formData.append("sort_order", sortOrder || gallery.length);

  setUploading(true);

  try {
    await createFooterGallery(formData);

    Swal.fire({
      icon: "success",
      title: "Image Added Successfully",
      text: "Footer gallery image has been added successfully.",
      timer: 1500,
      showConfirmButton: false,
    });

    setSelectedFile(null);
    setPreviewUrl(null);
    setSortOrder(gallery.length + 2);

    fetchGallery();

  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Upload Failed",
      text:
        err.response?.data?.message ||
        "Unable to upload image. Please try again.",
    });

  } finally {
    setUploading(false);
  }
};
  
  const handleToggleStatus = async (item) => {
    try {
      await updateFooterGallery(item.id, { status: item.status ? 0 : 1 });
      fetchGallery();
    } catch (err) {
      console.error(err);
     Swal.fire({
  icon: "error",
  title: "Status Update Failed",
  text: "Unable to update image status.",
});
    }
  };
const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Delete Image?",
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
    await deleteFooterGallery(id);

    toast.success("Image deleted successfully.");

    fetchGallery();
  } catch (err) {
    console.error(err);

    toast.error(
      err.response?.data?.message || "Failed to delete image."
    );
  }
};
  return (
    <div className="p-4">
      <h4 className="mb-4">Footer Gallery Management</h4>

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="mb-4 p-3 border rounded d-flex flex-wrap align-items-end gap-3"
      >
        <div>
          <label className="form-label d-block">Select Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div>
          <label className="form-label d-block">Sort Order</label>
          <input
            type="number"
            className="form-control"
            style={{ width: "100px" }}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>

        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            style={{ height: "60px", width: "60px", objectFit: "cover" }}
          />
        )}

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? "Uploading..." : "Add Image"}
        </button>
      </form>

      {/* Gallery list */}
      {loading ? (
        <p>Loading...</p>
      ) : gallery.length === 0 ? (
        <p>Abhi tak koi image nahi hai.</p>
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="border rounded p-2 text-center"
              style={{ width: "140px" }}
            >
              <img
                src={`${STORAGE_BASE_URL}${item.image}`}
                alt={`gallery-${item.id}`}
                style={{
                  width: "100%",
                  height: "100px",
                  objectFit: "cover",
                  marginBottom: "8px",
                  opacity: item.status ? 1 : 0.4,
                }}
              />
              <div className="small mb-2">Order: {item.sort_order}</div>
              <button
                className={`btn btn-sm w-100 mb-1 ${
                  item.status ? "btn-outline-secondary" : "btn-outline-success"
                }`}
                onClick={() => handleToggleStatus(item)}
              >
                {item.status ? "Hide" : "Show"}
              </button>
             <button
  className="btn btn-sm btn-outline-danger w-100"
  onClick={() => handleDelete(item.id)}
>
  Delete
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FooterGalleryAdmin;