import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { postRequest } from "../../common/services/requestService";
import { useParams } from "react-router-dom";
import { formatDate } from "../../common/common-function";
import { useFetchById } from "../../hooks/useFetchById";
import CustomDatePicker from "../../common/CustomDatePicker";
import dayjs from "dayjs";
const fileTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const fileValidation = z
  .instanceof(File, { message: "Certificate file is required" })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "File must be less than 2MB",
  })
  .refine((file) => fileTypes.includes(file.type), {
    message: "Only PNG, JPEG, WEBP, or PDF files are allowed",
  });

const censorSchema = z.object({
  certificateNumber: z.string().min(1, "Censor Certificate Number is required"),
  // certificateDate: z.string().optional(),
  certificateDate: z
    .any()
    .refine((val) => val && dayjs(val).isValid(), {
      message: "Valid date is required",
    }),
  certificateFile: z.union([
    fileValidation,
    z.string().min(1, "Existing file missing"),
  ]),
  // certificateFile: z
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

const CensorSection = ({ setActiveSection, filmType }) => {
  // const dispatch = useDispatch();
  const storedFilmData = useSelector((state) => state.featureFilm.data);
  const { id } = useParams();
  const { data: formData } = useFetchById(filmType === "feature" ? "film/feature-entry-by" : "film/non-feature-entry-by", id);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(censorSchema),
    defaultValues: {
      certificateNumber: "",
      certificateDate: null,
      certificateFile: null, // this will typically be a File object when uploaded
    },
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() => {
    if (formData || storedFilmData) {
      reset({
        certificateNumber: formData?.data?.censor_certificate_nom || "",
        certificateDate: formatDate(formData?.data?.censor_certificate_date) || "",
        certificateFile: formData?.data?.censor_certificate_file ? formData?.data?.censor_certificate_file.split("/").pop() : "", // Files can't be pre-filled
      });
    }
  }, [formData, reset, storedFilmData]);

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    //  dispatch(setFormData(data));
    // Call API to submit form data

    let url = ""
    const formData = new FormData();
    formData.append("censor_certificate_nom", data.certificateNumber);
    formData.append("censor_certificate_date", data.certificateDate);
    formData.append("censor_certificate_file", data.certificateFile);
    formData.append('step', '2');
    formData.append('id', id);
    formData.append("film_type", filmType);
    filmType == 'feature' ? url = "film/feature-update" : url = "film/non-feature-update";
    const response = await postRequest(url, formData);
    if (response.statusCode == 200) {
      setActiveSection(3);
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
              Censor Certificate Number<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.certificateNumber ? "is-invalid" : ""
                }`}
              placeholder="Censor Certificate Number"
              {...register("certificateNumber")}
            />
            {errors.certificateNumber && (
              <div className="invalid-feedback">
                {errors.certificateNumber.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Censor Certification Date<span className="text-danger">*</span>
            </label>
            {/* <input
              type="date"
              className={`form-control ${errors.certificateDate ? "is-invalid" : ""
                }`}
              placeholder="Censor Certification Date"
              {...register("certificateDate")}
            /> */}
            <Controller
              name="certificateDate"
              control={control}
              render={({ field }) => (
                <CustomDatePicker
                  type="single"
                  // label="Censor Certification Date"
                  value={field.value}
                  onChange={(date) => field.onChange(date ?? null)}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                />
              )}
            />
            {errors.certificateDate && (
              <div className="invalid-feedback">
                {errors.certificateDate.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Censor Certificate File
              <span className="text-danger">*</span>
            </label>
            <Controller
              name="certificateFile"
              control={control}
              render={({ field }) => (
                <>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className={`form-control ${errors.certificateFile ? "is-invalid" : ""
                      }`}
                    onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                  />
                  {typeof formData?.data?.censor_certificate_file === "string" && formData?.data?.censor_certificate_file && (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/${formData?.data?.censor_certificate_file.trim()}`} // Adjust path based on backend storage
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
            {errors.certificateFile && (
              <div className="invalid-feedback">
                {errors.certificateFile.message}
              </div>
            )}
          </div>
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveSection(1)}
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
    </>
  );
};

export default CensorSection;
