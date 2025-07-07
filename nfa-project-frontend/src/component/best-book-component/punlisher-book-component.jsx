import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useInputRestriction } from "../../hooks/useInputRestriction";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getRequestById,
  postRequest,
} from "../../common/services/requestService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/services/toastService";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const filmSchema = z.object({
  editor_name: z.string().trim().min(1, "This field is required"),
  editor_email: z.string().trim().email("Invalid email address"),
  editor_landline: z
    .string()
    .trim()
    .min(10, "Landline number must be at least 10 digits")
    .max(15, "Landline number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid Landline number"),

  editor_mobile: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),

  editor_address: z.string().trim().min(1, "This field is required"),
  editor_citizenship: z.string().trim().min(1, "This field is required"),
});

const PublisherBookSection = ({ setActiveSection }) => {
  const [publishers, setPublishers] = useState([]);
  const [showForm, setShowForm] = useState(publishers.length === 0);
  const numberRestriction = useInputRestriction("number");
  const [editingIndex, setEditingIndex] = useState(null);
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(filmSchema),
    defaultValues: {
      editor_name: "",
      editor_email: "",
      editor_landline: "",
      editor_mobile: "",
      editor_address: "",
      editor_citizenship: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    getPublisher();
  }, [id]);

  const getPublisher = async () => {
    try {
      const response = await postRequest("list-editor", {
        best_book_cinema_id: id,
      });
      if (response.statusCode === 200) {
        setPublishers(response.data);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    setShowForm(publishers.length === 0);
  }, [publishers.length]);

  const onSubmit = async (data) => {
    let url;
    const formData = new FormData();
    formData.append("editor_name", data.editor_name);
    formData.append("editor_email", data.editor_email);
    formData.append("editor_landline", data.editor_landline);
    formData.append("editor_mobile", data.editor_mobile);
    formData.append("editor_address", data.editor_address);
    formData.append("editor_citizenship", data.editor_citizenship);
    formData.append("best_book_cinema_id", id);

    if (editingIndex !== null) {
      // const updated = [...producers];
      // updated[editingIndex] = data;
      // setProducers(updated);
      formData.append("id", editingIndex);
      url = "update-editor";
    } else {
      url = "store-editor";
    }

    try {
      const response = await postRequest(url, formData);
      if (response.statusCode === 200) {
        showSuccessToast(response.message);
        await getPublisher();
        setEditingIndex(null);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast(error);
    }

    reset();
    setShowForm(false);
  };

  const handleEdit = (index) => {
    console.log("hhfhh", index);
    const data = publishers.find((item) => item._id === index);
    reset({
      editor_name: data.editor_name,
      editor_email: data.editor_email,
      editor_landline: data.editor_landline,
      editor_mobile: data.editor_mobile,
      editor_address: data.editor_address,
      editor_citizenship: data.editor_citizenship,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete this Editor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await getRequestById("delete-editor", index);
          if (response.statusCode === 200) {
            showSuccessToast(response.message);
            await getPublisher();
            setEditingIndex(null);
            Swal.fire("Deleted!", "Editor has been deleted.", "success");
          } else {
            showErrorToast(response.message);
          }
        } catch (error) {
          showErrorToast(error);
        }
      }
    });
  };

  const onNext = async () => {
    const isValid = await trigger(); // validate the form
    if ((isValid || !showForm) && publishers.length > 0) {
      const formData = new FormData();
      formData.append("step", "3");
      formData.append("id", id);
      const response = await postRequest("best-book-cinema-update", formData);
      if (response.statusCode == 200) {
        setActiveSection(4);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
      publishers.length === 0
        ? showErrorToast("Atleast one Editor is required")
        : showErrorToast("Please fill all required fields");
    }
  };

  return (
    <>
      <div className="producer-container">
        <div className="header-section d-flex justify-content-between align-items-center">
          <p className="header-text">
            Add at least 1 publisher detail and up to 5 publisher details.
          </p>
          <button
            className="add-producer-btn"
            onClick={() => {
              reset({
                editor_name: "",
                editor_email: "",
                editor_landline: "",
                editor_mobile: "",
                editor_address: "",
                editor_citizenship: "",
              });
              setEditingIndex(null);
              setShowForm((prev) => !prev);
            }}
          >
            ADD PUBLISHER
          </button>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Citizenship</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {publishers.map((publisher, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{publisher.editor_name}</td>
                    <td>{publisher.editor_email}</td>
                    <td>{publisher.editor_mobile}</td>
                    <td>{publisher.editor_address}</td>
                    <td>{publisher.editor_citizenship}</td>
                    <td>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => handleDelete(publisher?._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => handleEdit(publisher?._id)}
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ padding: 20, maxWidth: 900, margin: "auto" }}
        >
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Editor Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.editor_name ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("editor_name")}
              />
              {errors.editor_name && (
                <div className="invalid-feedback">
                  {errors.editor_name.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Email ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.editor_email ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("editor_email")}
              />
              {errors.editor_email && (
                <div className="invalid-feedback">
                  {errors.editor_email.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Landline NO. <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...numberRestriction}
                className={`form-control ${
                  errors.editor_landline ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("editor_landline")}
                maxLength={10}
              />
              {errors.editor_landline && (
                <div className="invalid-feedback">
                  {errors.editor_landline.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Mobile Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...numberRestriction}
                className={`form-control ${
                  errors.editor_mobile ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("editor_mobile")}
                maxLength={10}
              />
              {errors.editor_mobile && (
                <div className="invalid-feedback">
                  {errors.editor_mobile.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Address<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.editor_address ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("editor_address")}
              />
              {errors.editor_address && (
                <div className="invalid-feedback">
                  {errors.editor_address.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Citizenship<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.editor_citizenship ? "is-invalid" : ""
                }`}
                placeholder=" "
                {...register("editor_citizenship")}
              />
              {errors.editor_citizenship && (
                <div className="invalid-feedback">
                  {errors.editor_citizenship.message}
                </div>
              )}
            </div>

            <div className="col-12 text-center mt-3">
              <button type="submit" className="btn btn-primary">
                {editingIndex ? "Update Publisher" : "Create Publisher"}
              </button>
            </div>
          </div>
        </form>
      )}
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(2)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Prev
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNext()}
        >
          Next <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default PublisherBookSection;
