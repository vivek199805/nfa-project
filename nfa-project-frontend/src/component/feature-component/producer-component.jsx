import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useInputRestriction } from "../../hooks/useInputRestriction";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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

const ProducerDetailsSection = ({ setActiveSection, data }) => {
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
    if (data?.producers?.length > 0) {
    const updatedProducers = data.producers.map(item => ({
      producerName: item?.name, 
      phone: item?.contact_nom,
      indianNationality: item?.nationality == 1? 'Yes' : 'No',
      pinCode: item?.pincode,
      producerCompany: item?.production_company,
      ...item,
    }));    

    setProducers(updatedProducers);
    }
  }, [data?.producers]);
  useEffect(() => {
    setShowForm(producers.length === 0);
  }, [producers.length]);

  const onSubmit = (data) => {
    if (editingIndex !== null) {
      const updated = [...producers];
      updated[editingIndex] = data;
      setProducers(updated);
      setEditingIndex(null);
    } else {
      setProducers([...producers, data]);
    }

    reset();
    setShowForm(false);
  };
  const handleEdit = (index) => {
    const data = producers[index];
    Object.entries(data).forEach(([key, value]) => {
      setValue(key, value);
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updated = [...producers];
    updated.splice(index, 1);
    setProducers(updated);
    if (producers.length === 1) setShowForm(true); // Show form if all deleted
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
              setShowForm(true);
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
                    <td>{producer.producerName}</td>
                    <td>{producer.email}</td>
                    <td>{producer.phone}</td>
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
                        onClick={() => handleDelete(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => handleEdit(index)}
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

            <div className="col-md-6">
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
                {editingIndex ? "Update Producer" : "Create Producer"}
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
          onClick={async () => {
            const isValid = await trigger(); // validate the form
            if (isValid || !showForm) {
              setActiveSection(5);
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
            }
          }}
        >
          Next <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default ProducerDetailsSection;
