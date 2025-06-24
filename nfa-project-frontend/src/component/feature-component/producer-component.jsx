import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useInputRestriction } from "../../hooks/useInputRestriction";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getRequestById,
  postRequest,
} from "../../common/services/requestService";
import { useParams } from "react-router-dom";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/services/toastService";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const fileTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const filmSchema = z.object({
  indianNationality: z.enum(["Yes", "No"], {
    required_error: "This field is required",
  }),
  producerName: z.string().trim().min(1, "This field is required"),
  producerCompany: z.string().trim().min(1, "This field is required"),
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

  idProofFile: z
    .any()
    .refine((file) => file instanceof File, {
      message: "Certificate file is required",
    })
    .refine((file) => file?.size <= MAX_FILE_SIZE, {
      message: "File must be less than 2MB",
    })
    .refine((file) => fileTypes.includes(file?.type), {
      message: "Only PNG, JPEG, or PDF files are allowed",
    }),
});

const ProducerDetailsSection = ({ setActiveSection, filmType }) => {
  const { id } = useParams();
  const [producers, setProducers] = useState([]); // your producer list
  const [showForm, setShowForm] = useState(producers.length === 0);
  const numberRestriction = useInputRestriction("number");
  const [editingIndex, setEditingIndex] = useState(null);

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
    defaultValues: {
      ProducerName: "",
      ProducerCompany: "",
      phone: "",
      email: "",
      address: "",
      pinCode: "",
      idProofFile: null,
    },
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() => {
    getProducer();
  }, [id]);

  const getProducer = async () => {
    try {
      const response = await postRequest("film/producer-list", { id, film_type: filmType });
      if (response.statusCode === 200) {
        setProducers(response.data);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    setShowForm(producers.length === 0);
  }, [producers.length]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append(
      "indian_national",
      data.indianNationality === "Yes" ? 1 : 0
    );
    formData.append("name", data.producerName);
    formData.append("production_company", data.producerCompany);
    formData.append("contact_nom", data.phone);
    formData.append("email", data.email);
    formData.append("address", data.address);
    formData.append("pincode", data.pinCode);
    formData.append("producer_self_attested_doc", data.idProofFile);
    formData.append("nfa_feature_id", id);
    formData.append("film_type", filmType);

    if (editingIndex !== null) {
      // const updated = [...producers];
      // updated[editingIndex] = data;
      // setProducers(updated);
      formData.append("id", editingIndex);
    }

    try {
      const response = await postRequest("film/store-producer", formData);
      if (response.statusCode === 200) {
        showSuccessToast(response.message);
        await getProducer();
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
    //  const data = producers[index];
    const data = producers.find((item) => item._id === index);
    // Object.entries(data).forEach(([key, value]) => {
    //   setValue(key, value);
    // });
    reset({
      producerName: data.name,
      producerCompany: data.production_company,
      phone: data.contact_nom,
      email: data.email,
      address: data.address,
      pinCode: data.pincode,
      idProofFile: data.producer_self_attested_doc,
      indianNationality: data.indian_national === 1 ? "Yes" : "No",
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete producer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // const updated = [...producers];
        // updated.splice(index, 1);
        // setProducers(updated);

        // if (updated.length === 0) {
        //   setShowForm(true);
        // }
        const formData = new FormData();
        formData.append("producerId", index);
        formData.append("nfa_feature_id", id);
        try {
          const response = await postRequest("film/delete-producer", formData);
          if (response.statusCode === 200) {
            showSuccessToast(response.message);
            await getProducer();
            setEditingIndex(null);
            Swal.fire("Deleted!", "Producer has been deleted.", "success");
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
    let url = filmType == 'feature' ? "film/feature-update" :"film/non-feature-update";
    const isValid = await trigger(); // validate the form
    if (isValid || !showForm) {
      const formData = new FormData();
      formData.append("step", "4");
      formData.append("id", id);
       formData.append("film_type", filmType);
      const response = await postRequest(url, formData);
      if (response.statusCode == 200) {
        setActiveSection(5);
      }

    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
       showSuccessToast('Atleast one producer is required');
    }
  };

  return (
    <>
      <div className="producer-container">
        <div className="header-section d-flex justify-content-between align-items-center">
          <p className="header-text">
            5 Producers can be added, out of which one must be an Indian
            producer
          </p>
          <button
            className="add-producer-btn"
            onClick={() => {
              reset();
              setEditingIndex(null);
              setShowForm((prev) => !prev);
            }}
          >
            ADD PRODUCER
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
                {producers.map((producer, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="nationality-badge">
                        {producer.indianNationality === "Yes"
                          ? "Indian"
                          : "Foreign"}
                      </span>
                    </td>
                    <td>{producer.name}</td>
                    <td>{producer.email}</td>
                    <td>{producer.contact_nom}</td>
                    <td>
                      <input
                        type="checkbox"
                        className="award-checkbox"
                        disabled
                        checked={producer.receive_producer_award}
                      />
                    </td>
                    <td>
                      <span className="id-proof-status">
                        {producer.idProofFile?.name || "Not Provided"}
                      </span>{" "}
                    </td>
                    <td>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => handleDelete(producer?._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => handleEdit(producer?._id)}
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
                Producer Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.producerName ? "is-invalid" : ""
                }`}
                placeholder="Producer Name"
                {...register("producerName")}
              />
              {errors.producerName && (
                <div className="invalid-feedback">
                  {errors.producerName.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Producer Company <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.producerCompany ? "is-invalid" : ""
                }`}
                placeholder="Producer Company "
                {...register("producerCompany")}
              />
              {errors.producerCompany && (
                <div className="invalid-feedback">
                  {errors.producerCompany.message}
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

            <div className="col-md-12">
              <p>For Indian nationality, self attested copy of producer adhar card is mandatory & for foreign nationality, self attested copy of producer passport is mandatory.</p>
              <label className="form-label">
                Id Proof
                <span className="text-danger">*</span>
              </label>
              <Controller
                name="idProofFile"
                control={control}
                render={({ field }) => (
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className={`form-control ${
                      errors.idProofFile ? "is-invalid" : ""
                    }`}
                    onChange={(e) =>
                      field.onChange(e.target.files?.[0] || null)
                    }
                  />
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
                {editingIndex != undefined
                  ? "Update Producer"
                  : "Create Producer"}
              </button>
            </div>
          </div>
        </form>
      )}
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(3)}
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

export default ProducerDetailsSection;
