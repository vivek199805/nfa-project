import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { postRequest } from "../../common/services/requestService";
import { useFetchById } from "../../hooks/useFetchById";
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

const companySchema = z.object({
  CompanyRegistration: z
    .string()
    .min(1, "Company Registration Details is required"),
  CompanyRegistrationFile: z.union([
    fileValidation,
    z.string().min(1, "Existing file missing"),
  ]),

  // CompanyRegistrationFile: z
  //   .any()
  //   .refine((file) => file instanceof File, {
  //     message: "Certificate file is required",
  //   })
  //   .refine((file) => file?.size <= MAX_FILE_SIZE, {
  //     message: "File must be less than 2MB",
  //   })
  //   .refine((file) => fileTypes.includes(file?.type), {
  //     message: "Only PNG, JPEG, or PDF files are allowed",
  //   }),
});

const CompanyRegistrationSection = ({ setActiveSection, filmType }) => {
  const { id } = useParams();

  const { data: formData } = useFetchById(filmType === "feature" ? "film/feature-entry-by" : "film/non-feature-entry-by", id);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
    },
    mode: "onTouched",
    // shouldFocusError: false,
  });

  // const { data: formData, } = useQuery({
  //   queryKey: ["userForm", id],
  //   queryFn: () => getRequestById(filmType === "feature" ? "film/feature-entry-by" : "film/non-feature-entry-by", id),
  //   enabled: !!id, // Only run query if id exists
  //   refetchOnMount: true,
  //   staleTime: 0,
  // });

  useEffect(() => {
    if (formData) {
      reset({
        CompanyRegistration: formData?.data?.company_reg_details || "",
        CompanyRegistrationFile: formData?.data?.company_reg_doc ? formData?.data?.company_reg_doc.split("/").pop() : "", // Files can't be pre-filled
      });
    }
  }, [formData, reset]);

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    // Call API to submit form data
    let url = filmType == 'feature' ? "film/feature-update" : "film/non-feature-update";
    const formData = new FormData();
    formData.append("company_reg_details", data.CompanyRegistration);
    formData.append("company_reg_doc", data.CompanyRegistrationFile);
    formData.append('step', '3');
    formData.append('id', id);
    formData.append("film_type", filmType);

    const response = await postRequest(url, formData);
    if (response.statusCode == 200) {
      setActiveSection(4);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ padding: 20, maxWidth: 900, margin: "auto" }}
    >
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">
            CompanyRegistration Details<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.CompanyRegistration ? "is-invalid" : ""
              }`}
            placeholder="Censor Certificate Number"
            {...register("CompanyRegistration")}
          />
          {errors.CompanyRegistration && (
            <div className="invalid-feedback">
              {errors.CompanyRegistration.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Company Registration File
            <span className="text-danger">*</span>
          </label>
          <Controller
            name="CompanyRegistrationFile"
            control={control}
            render={({ field }) => (
              <>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className={`form-control ${errors.CompanyRegistrationFile ? "is-invalid" : ""
                    }`}
                  onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                />
                  {typeof  formData?.data?.company_reg_doc === "string" &&  formData?.data?.company_reg_doc && (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/${ formData?.data?.company_reg_doc.trim()}`} // Adjust path based on backend storage
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
          {errors.CompanyRegistrationFile && (
            <div className="invalid-feedback">
              {errors.CompanyRegistrationFile.message}
            </div>
          )}
        </div>
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActiveSection(2)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Prev
          </button>
          <button type="submit" className="btn btn-primary">
            Next <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </form>
  );
};

export default CompanyRegistrationSection;
