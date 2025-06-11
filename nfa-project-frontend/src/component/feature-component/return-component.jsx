import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useInputRestriction } from "../../hooks/useInputRestriction";
import { useEffect } from "react";
const filmSchema = z.object({
  name: z.string().trim().min(1, "This field is required"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
  email: z.string().trim().email("Invalid email address"),
  website: z.string().trim().optional(),
  address: z.string().trim().min(1, "This field is required"),
  pinCode: z
    .string()
    .trim()
    .length(6, "Pin Code must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "Pin Code must be numeric"),
});

const ReturnSection = ({ setActiveSection, data }) => {
  const numberRestriction = useInputRestriction("number");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(filmSchema),
    defaultValues: {},
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() =>{
    if(data){
      reset({
         name: data?.return_name,
         phone: data?.return_mobile,
         email: data?.return_email,
         website: data?.return_website,
         address: data?.return_address,
         pinCode: data.return_pincode       
      });
    }

  }, [data, reset]);

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    // Call API to submit form data
    setActiveSection(11);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ padding: 20, maxWidth: 900, margin: "auto" }}
    >
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">
            Name<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Name"
            {...register("name")}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
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
          <label className="form-label"> Website</label>
          <input
            type="text"
            className={`form-control ${errors.website ? "is-invalid" : ""}`}
            placeholder=" Website"
            {...register("website")}
          />
          {errors.website && (
            <div className="invalid-feedback">{errors.website.message}</div>
          )}
        </div>

        <div className="col-md-12">
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

        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActiveSection(9)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Prev
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Next <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReturnSection;
