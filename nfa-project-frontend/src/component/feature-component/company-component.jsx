import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const fileTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const companySchema = z.object({
  CompanyRegistration: z
    .string()
    .min(1, "Company Registration Details is required"),
  CompanyRegistrationFile: z
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

const CompanyRegistrationSection = ({ setActiveSection, data }) => {
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

    useEffect(() => {
  if (data) {
    reset({
      CompanyRegistration: data?.company_reg_details || "",
      CompanyRegistrationFile: data?.company_reg_doc || "", // Files can't be pre-filled
    });
  }
}, [data, reset]);

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    // Call API to submit form data
    setActiveSection(4);
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
            className={`form-control ${
              errors.CompanyRegistration ? "is-invalid" : ""
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
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className={`form-control ${
                  errors.CompanyRegistrationFile ? "is-invalid" : ""
                }`}
                onChange={(e) => field.onChange(e.target.files?.[0] || null)}
              />
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
