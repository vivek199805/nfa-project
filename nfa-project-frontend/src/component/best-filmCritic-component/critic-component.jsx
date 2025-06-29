import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchById } from "../../hooks/useFetchById";
import { postRequest } from "../../common/services/requestService";

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
  critic_name: z.string().min(1, "This field is required"),
  critic_address: z.string().min(1, "This field is required"),
  critic_contact: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),

  critic_indian_nationality: z.enum(["Yes", "No"], {
    required_error: "This field is required",
  }),

  critic_profile: z.string().min(1, "This field is required"),
  critic_aadhaar_card: z.union([
    fileValidation,
    z.string().min(1, "Existing file missing"),
  ]),
});

const CriticSection = ({ setActiveSection, filmType }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: formData } = useFetchById(
    filmType === "feature"
      ? "film/feature-entry-by"
      : "film/non-feature-entry-by",
    id
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(filmSchema),
    defaultValues: {},
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() => {
    if (!id || !formData?.data) return;

    reset({
      critic_name: formData?.data.writer_name,
      critic_address: formData?.data.critic_address,
      critic_contact: formData?.data.critic_contact,
      critic_indian_nationality:
        formData?.data.critic_indian_nationality == 1 ? "Yes" : "No",
      critic_profile: formData?.data.critic_profile,
      critic_aadhaar_card: formData?.data?.critic_aadhaar_card
        ? formData?.data?.critic_aadhaar_card.split("/").pop()
        : "", // Files can't be pre-filled
    });
  }, [formData, reset, id]);

  const onSubmit = async (data) => {
    // Call API to submit form data
    console.log("Form submitted:", data);
    let url = "";
    const formData = new FormData();
    formData.append("critic_name", data.critic_name);
    formData.append("critic_address", data.critic_address);
    formData.append("critic_contact", data.critic_contact);
    formData.append(
      "critic_indian_nationality",
      data.critic_indian_nationality == "Yes" ? 1 : 0
    );
    formData.append("critic_profile", data.critic_profile);
    if (data.critic_aadhaar_card instanceof File) {
      formData.append("critic_aadhaar_card", data.critic_aadhaar_card);
    } else {
      formData.append(
        "critic_aadhaar_card",
        data.critic_aadhaar_card.split("/").pop()
      ); // Extract filename if it's a string
    }
    formData.append("step", "1");
    formData.append("film_type", filmType);
    if (id) {
      formData.append("id", id);
      filmType == "feature"
        ? (url = "film/feature-update")
        : (url = "film/non-feature-update");
    } else {
      filmType == "feature"
        ? (url = "film/feature-create")
        : (url = "film/non-feature-create");
    }

    const response = await postRequest(url, formData);
    if (response.statusCode == 200) {
      if (!id) navigate(`/${filmType}/${response.data.id}`);
      setActiveSection(2);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ padding: 20, maxWidth: 900, margin: "auto" }}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">
              Critic Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.critic_name ? "is-invalid" : ""
              }`}
              placeholder=""
              {...register("critic_name")}
            />
            {errors.critic_name && (
              <div className="invalid-feedback">
                {errors.critic_name.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Critic Address <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.critic_address ? "is-invalid" : ""
              }`}
              placeholder=""
              {...register("critic_address")}
            />
            {errors.critic_address && (
              <div className="invalid-feedback">
                {errors.critic_address.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Critic Contact NO. <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.critic_contact ? "is-invalid" : ""
              }`}
              placeholder="Film Title (Roman Script)"
              {...register("critic_contact")}
            />
            {errors.critic_contact && (
              <div className="invalid-feedback">
                {errors.critic_contact.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Critic Indian Nationality <span className="text-danger">*</span>
            </label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="Yes"
                  {...register("critic_indian_nationality")}
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="No"
                  {...register("critic_indian_nationality")}
                />
                <label className="form-check-label">No</label>
              </div>
            </div>
            {errors.critic_indian_nationality && (
              <div className="text-danger">{errors.critic_indian_nationality.message}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Critic Profile <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.critic_profile ? "is-invalid" : ""
              }`}
              placeholder=""
              {...register("critic_profile")}
            />
            {errors.critic_profile && (
              <div className="invalid-feedback">
                {errors.critic_profile.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Critic Aadhaar Card <span className="text-danger">*</span>
            </label>
            <Controller
              name="critic_aadhaar_card"
              control={control}
              render={({ field }) => (
                <>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className={`form-control ${
                      errors.critic_aadhaar_card ? "is-invalid" : ""
                    }`}
                    onChange={(e) =>
                      field.onChange(e.target.files?.[0] || null)
                    }
                  />
                  {typeof formData?.data?.censor_certificate_file ===
                    "string" &&
                    formData?.data?.censor_certificate_file && (
                      <a
                        href={`${
                          import.meta.env.VITE_API_URL
                        }/${formData?.data?.censor_certificate_file.trim()}`} // Adjust path based on backend storage
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary mt-2"
                      >
                        View Uploaded File
                      </a>
                    )}
                </>
              )}
            />
            {errors.critic_aadhaar_card && (
              <div className="invalid-feedback">
                {errors.critic_aadhaar_card.message}
              </div>
            )}
          </div>

          <div className="col-12 text-end mt-3">
            <button type="submit" className="btn btn-primary">
              Next <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default CriticSection;
