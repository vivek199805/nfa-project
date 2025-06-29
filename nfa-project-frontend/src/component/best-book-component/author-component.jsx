import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { postRequest } from "../../common/services/requestService";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchById } from "../../hooks/useFetchById";
import { countWords } from "../../common/common-function";
import { useInputRestriction } from "../../hooks/useInputRestriction";

const filmSchema = z.object({
  author_name: z.string().min(1, "This field is required"),
  author_contact: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),

  author_nationality_indian: z.enum(["Yes", "No"], {
    required_error: "This field is required",
  }),
  author_address: z.string().min(1, "This field is required"),
  author_profile: z
    .string()
    .min(10, "Minimum 10 words required")
    .refine(
      (val) => {
        const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
        return wordCount >= 10 && wordCount <= 200;
      },
      {
        message: "Synopsis must be between 10 and 200 words",
      }
    ),
});

const AuthorSection = ({ setActiveSection, filmType }) => {
  const [synopsisWordCount, setSynopsisWordCount] = useState(0);
   const numberRestriction = useInputRestriction("number");
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
    const synopsis = formData?.data?.author_profile || "";

    reset({
      author_name: formData?.data.author_name,
      author_contact: formData?.data.author_contact,
      author_nationality_indian:
        formData?.data.author_nationality_indian == 1 ? "Yes" : "No",
      author_address: formData?.data.author_address,
      author_profile: formData?.data.author_profile,
    });

    setSynopsisWordCount(countWords(synopsis));
  }, [formData, reset, id]);

  const onSubmit = async (data) => {
    // Call API to submit form data
    console.log("Form submitted:", data);
    let url = "";
    const formData = new FormData();
    formData.append("author_name", data.author_name);
    formData.append("author_contact", data.author_contact);
    formData.append(
      "author_nationality_indian",
      data.author_nationality_indian == "Yes" ? 1 : 0
    );
    formData.append("author_address", data.author_address);
    formData.append("author_profile", data.author_profile);
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
              Name of the Author <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.author_name ? "is-invalid" : ""
              }`}
              placeholder=""
              {...register("author_name")}
            />
            {errors.author_name && (
              <div className="invalid-feedback">
                {errors.author_name.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Author Contact NO.<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              {...numberRestriction}
              className={`form-control ${
                errors.author_contact ? "is-invalid" : ""
              }`}
              placeholder=""
              {...register("author_contact")}
            />
            {errors.author_contact && (
              <div className="invalid-feedback">
                {errors.author_contact.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Author Indian Nationality <span className="text-danger">*</span>
            </label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="Yes"
                  {...register("author_nationality_indian")}
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="No"
                  {...register("author_nationality_indian")}
                />
                <label className="form-check-label">No</label>
              </div>
            </div>
            {errors.author_nationality_indian && (
              <div className="text-danger">{errors.author_nationality_indian.message}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Author Address <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.author_address ? "is-invalid" : ""
              }`}
              placeholder=""
              {...register("author_address")}
            />
            {errors.author_address && (
              <div className="invalid-feedback">
                {errors.author_address.message}
              </div>
            )}
          </div>

          <div className="col-md-12">
            <label className="form-label">
              Author Profile (10-200 words){" "}
              <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.author_profile ? "is-invalid" : ""}`}
              rows={4}
              placeholder=""
              {...register("author_profile", {
                onChange: (e) => {
                  setSynopsisWordCount(countWords(e.target.value));
                },
              })}
            />
            <p className="text-muted mt-1">{synopsisWordCount} word(s)</p>
            {errors.author_profile && (
              <div className="invalid-feedback">{errors.author_profile.message}</div>
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

export default AuthorSection;
