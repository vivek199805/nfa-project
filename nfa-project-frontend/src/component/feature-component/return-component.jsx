import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useInputRestriction } from "../../hooks/useInputRestriction";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getRequestById, postRequest } from "../../common/services/requestService";
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
  const {id} = useParams();
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

    const { data: formData } = useQuery({
    queryKey: ["userForm", id],
    queryFn: () => getRequestById("film/feature-entry-by", id),
    enabled: !!id, // Only run query if id exists
    // staleTime: 1000 * 60 * 5, // 5 minutes - consider this data fresh for 5 mins
    // initialData: () => queryClient.getQueryData(["userForm", id]), // optional
    refetchOnMount: true,
    staleTime: 0,
  });

  useEffect(() =>{
    if(formData){
      reset({
         name: formData?.data?.return_name,
         phone: formData?.data?.return_mobile,
         email: formData?.data?.return_email,
         website: formData?.data?.return_website,
         address: formData?.data?.return_address,
         pinCode: formData?.data.return_pincode       
      });
    }

  }, [formData, reset]);

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    // Call API to submit form data
       const formData = new FormData();
       formData.append("return_name", data.name);
       formData.append("return_mobile", data.phone);
       formData.append("return_email", data.email);
       formData.append("return_website", data.website);
       formData.append("return_address", data.address);
       formData.append("return_pincode", data.pinCode);
       formData.append("step", "10");
       formData.append("id", id);
       const response = await postRequest("film/feature-update", formData);
       if (response.statusCode == 200) {
         setActiveSection(11);
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
