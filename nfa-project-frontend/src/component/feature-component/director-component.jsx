import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useInputRestriction } from "../../hooks/useInputRestriction";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getRequestById, postRequest } from "../../common/services/requestService";
import { showErrorToast, showSuccessToast } from "../../common/services/toastService";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const fileTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const fileValidation = z
  .instanceof(File, { message: "File is required" })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "File must be less than 2MB",
  })
  .refine((file) => fileTypes.includes(file.type), {
    message: "Only PNG, JPEG, WEBP, or PDF files are allowed",
  });

const filmSchema = z.object({
  indianNationality: z.enum(["Yes", "No"], {
    required_error: "This field is required",
  }),
  directorName: z.string().trim().min(1, "This field is required"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
  email: z.string().trim().email("Invalid email address"),

  address: z.string().trim().min(1, "This field is required"),
  pinCode: z
    .string()
    .trim()
    .length(6, "Pin Code must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "Pin Code must be numeric"),
  idProofFile: z.union([
    fileValidation,
    z.string().min(1, "Existing file missing"),
  ]),

  // idProofFile: z
  //   .any()
  //   .refine((file) => file instanceof File || typeof file === "string", {
  //     message: "Id Proof is required",
  //   })
  //   .refine(
  //     (file) =>
  //       typeof file === "string" ||
  //       (file instanceof File && file.size <= MAX_FILE_SIZE),
  //     {
  //       message: "File must be less than 2MB",
  //     }
  //   )
  //   .refine(
  //     (file) =>
  //       typeof file === "string" ||
  //       (file instanceof File && fileTypes.includes(file.type)),
  //     {
  //       message: "Only PNG, JPEG, or PDF files are allowed",
  //     }
  //   ),
});

const DirectorDetailsSection = ({ setActiveSection, filmType }) => {
  const [directors, setDirectors] = useState([]);
  const [showForm, setShowForm] = useState(directors.length === 0);
  const numberRestriction = useInputRestriction("number");
  const [editingIndex, setEditingIndex] = useState(null);
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(filmSchema),
    defaultValues: {},
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() => {
    getDirector();
  }, [id]);

  const getDirector = async () => {
    try {
      const response = await postRequest("film/director-list", { id, film_type: filmType });
      if (response.statusCode === 200) {
        setDirectors(response.data);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  // useEffect(() => {
  //   if (data?.directors?.length > 0) {
  //     const updatedDirectors = data.directors.map((item, index) => {
  //       // const idProofDoc = item.documents?.find((doc) => doc.document_type === 5 && doc.form_type === 1);
  //       const idProofDoc = item.documents[index];
  //       return {
  //         indianNationality: item?.indian_national == 1 ? "Yes" : "No",
  //         directorName: item?.name,
  //         phone: item?.contact_nom,
  //         email: item?.email,
  //         address: item?.address,
  //         pinCode: item?.pincode,
  //         idProofFile: idProofDoc?.file || null,
  //       };
  //     });

  //     setDirectors(updatedDirectors);
  //   }
  // }, [data?.directors]);

  useEffect(() => {
    setShowForm(directors.length === 0);
  }, [directors.length]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("indian_national", data.indianNationality === "Yes" ? 1 : 0);
    formData.append("name", data.directorName);
    formData.append("contact_nom", data.phone);
    formData.append("email", data.email);
    formData.append("address", data.address);
    formData.append("pincode", data.pinCode);
    if (data.idProofFile instanceof File) {
      formData.append("idProofFile", data.idProofFile);
    } else {
      formData.append("idProofFile", data.idProofFile.split("/").pop()); // Extract filename if it's a string
    }
    formData.append("nfa_feature_id", id);
    formData.append("film_type", filmType);

    if (editingIndex !== null) {
      // const updated = [...producers];
      // updated[editingIndex] = data;
      // setProducers(updated);
      formData.append("id", editingIndex);
    }

    try {
      const response = await postRequest("film/store-director", formData);
      if (response.statusCode === 200) {
        showSuccessToast(response.message);
        await getDirector();
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
    //  const data = directors[index];
    const data = directors.find((item) => item._id === index);
    reset({
      indianNationality: data.indian_national === 1 ? "Yes" : "No",
      directorName: data.name,
      phone: data.contact_nom,
      email: data.email,
      address: data.address,
      pinCode: data.pincode,
      idProofFile: data?.director_self_attested_doc ?? null,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete this director?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // const updated = [...directors];
        // updated.splice(index, 1);
        // setDirectors(updated);
        // if (directors.length === 1) setShowForm(true);
        const formData = new FormData();
        formData.append("producerId", index);
        formData.append("nfa_feature_id", id);
        try {
          const response = await postRequest("film/delete-director", formData);
          if (response.statusCode === 200) {
            showSuccessToast(response.message);
            await getDirector();
            setEditingIndex(null);
            Swal.fire("Deleted!", "director has been deleted.", "success");
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
    let url = filmType == 'feature' ? "film/feature-update" : "film/non-feature-update";
    if ((isValid || !showForm) && directors.length > 0) {
      const formData = new FormData();
      formData.append("step", "5");
      formData.append("id", id);
      formData.append("film_type", filmType);
      const response = await postRequest(url, formData);
      if (response.statusCode == 200) {
        setActiveSection(6);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
      directors.length === 0 ? showErrorToast("Atleast one director is required") : showErrorToast("Please fill all required fields");
    }
  };

  return (
    <>
      <div className="producer-container">
        <div className="header-section d-flex justify-content-between align-items-center">
          <p className="header-text">
            5 Directors can be added, out of which one must be an Indian
            Director
          </p>
          <button
            className="add-producer-btn"
            onClick={() => {
              reset();
              setEditingIndex(null);
              setShowForm((prev) => !prev);
            }}
          >
            ADD DIRECTOR
          </button>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Nationality</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Award Recipient</th>
                  <th>ID Proof</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {directors.map((director, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="nationality-badge">
                        {director.indian_national == 1 ? "Indian" : "Foreign"}
                      </span>
                    </td>
                    <td>{director.name}</td>
                    <td>{director.email}</td>
                    <td>{director.contact_nom}</td>
                    <td>
                      <input
                        type="checkbox"
                        className="award-checkbox"
                        disabled
                      />
                    </td>
                    <td>
                      {director.director_self_attested_doc ? (
                        <>
                          <a
                          href= {`${import.meta.env.VITE_API_URL}/${director.director_self_attested_doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary ms-2"
                          >
                            View
                          </a>
                        </>
                      ) : (
                        <span className="id-proof-status text-muted">Not Provided</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => handleDelete(director?._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => handleEdit(director?._id)}
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
                Whether Indian Nationality{" "}
                <span className="text-danger">*</span>
              </label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    value="Yes"
                    {...register("indianNationality")}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    value="No"
                    {...register("indianNationality")}
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
              {errors.indianNationality && (
                <div className="text-danger">
                  {errors.indianNationality.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Directors Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.directorName ? "is-invalid" : ""
                  }`}
                placeholder="Director Name"
                {...register("directorName")}
              />
              {errors.directorName && (
                <div className="invalid-feedback">
                  {errors.directorName.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...numberRestriction}
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                placeholder="Phone Number"
                {...register("phone")}
                maxLength={10}
              />
              {errors.phone && (
                <div className="invalid-feedback">{errors.phone.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Email Id <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="Email Id"
                {...register("email")}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Address<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                placeholder="Address"
                {...register("address")}
              />
              {errors.address && (
                <div className="invalid-feedback">{errors.address.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Pin Code<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...numberRestriction}
                className={`form-control ${errors.pinCode ? "is-invalid" : ""}`}
                placeholder="Pin Code"
                {...register("pinCode")}
                maxLength={6}
              />
              {errors.pinCode && (
                <div className="invalid-feedback">{errors.pinCode.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Id Proof
                <span className="text-danger">*</span>
              </label>
              <Controller
                name="idProofFile"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className={`form-control ${errors.idProofFile ? "is-invalid" : ""
                        }`}
                      onChange={(e) =>
                        field.onChange(e.target.files?.[0] || null)
                      }
                    />
                    {typeof field.value === "string" && field.value !== "" && (
                      <a
                        href= {`${import.meta.env.VITE_API_URL}/${field.value}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 d-block"
                      >
                        View uploaded file
                      </a>
                    )}
                  </>
                )}
              />

              {errors.idProofFile && (
                <div className="invalid-feedback">
                  {errors.idProofFile.message}
                </div>
              )}
            </div>

            <div className="col-12 text-center mt-3">
              <button type="submit" className="btn btn-primary">
                {editingIndex ? "Update Director" : "Create Director"}
              </button>
            </div>
          </div>
        </form>
      )}
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(4)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Prev
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNext()}>
          Next <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default DirectorDetailsSection;
