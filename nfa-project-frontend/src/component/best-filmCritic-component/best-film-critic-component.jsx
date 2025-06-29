import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Select from "react-dropdown-select";
import { useEffect, useState } from "react";
import { getRequest, postRequest } from "../../common/services/requestService";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchById } from "../../hooks/useFetchById";
import dayjs from "dayjs";
import CustomDatePicker from "../../common/CustomDatePicker";
import { formatDate } from "../../common/common-function";

const filmSchema = z.object({
  writer_name: z.string().min(1, "This field is required"),
  article_title: z.string().min(1, "This field is required"),
  article_language_id: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(1, "Please select at least one language")
    .transform((val) => val.map((item) => item.value)),
  publication_date: z.any().refine((val) => val && dayjs(val).isValid(), {
    message: "Valid date is required",
  }),
  publication_name: z.string().min(1, "This field is required"),
  rni: z.enum(["Yes", "No"], {
    required_error: "This field is required",
  }),
});

const BestFilmSection = ({ setActiveSection, filmType }) => {
  const [languageOptions, setLanguageOptions] = useState([]);
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
    async function fetchLanguages() {
      try {
        const response = await getRequest("get-languages");
        const options = response.data.map((lang) => ({
          label: lang.name,
          value: String(lang.id),
        }));
        setLanguageOptions(options);
      } catch (error) {
        console.error(error);
      }
    }

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (!id || !formData?.data) return;

    reset({
      writer_name: formData?.data.writer_name,
      article_title: formData?.data.article_title,
      article_language_id: languageOptions.filter((opt) =>
        formData?.data.article_language_id?.includes(opt.value.toString())
      ),
      publication_date: formatDate(formData?.data?.publication_date) || "",
      publication_name: formData?.data.publication_name,
      rni: formData?.data.rni == 1 ? "Yes" : "No",
    });
  }, [formData, reset, id, languageOptions]);

  const onSubmit = async (data) => {
    // Call API to submit form data
    console.log("Form submitted:", data);
    let url = "";
    const formData = new FormData();
    formData.append("writer_name", data.writer_name);
    formData.append("article_title", data.article_title);
    formData.append("article_language_id", data.article_language_id);
    formData.append("publication_date", data.publication_date);
    formData.append("publication_name", data.publication_name);
    formData.append("rni", data.rni == "Yes" ? 1 : 0);
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
              Name of the Writer/Critic <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.writer_name ? "is-invalid" : ""
              }`}
              placeholder=""
              {...register("writer_name")}
            />
            {errors.writer_name && (
              <div className="invalid-feedback">
                {errors.writer_name.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Title of the Article<span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.article_title ? "is-invalid" : ""
              }`}
              placeholder=""
              {...register("article_title")}
            />
            {errors.article_title && (
              <div className="invalid-feedback">
                {errors.article_title.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Please mention Languages of the Article{" "}
              <span className="text-danger">*</span>
            </label>
            <Controller
              name="article_language_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={languageOptions}
                  multi
                  values={field.value}
                  onChange={field.onChange}
                  placeholder="Select language(s)"
                  itemRenderer={({ item, methods }) => (
                    <div
                      key={`${item.value}-${item.label}`}
                      onClick={() => methods.addItem(item)}
                      style={{
                        padding: "6px 10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={methods.isSelected(item)}
                        onChange={() => methods.addItem(item)}
                        style={{ marginRight: 10 }}
                      />
                      <span>{item.label}</span>
                    </div>
                  )}
                  dropdownHeight="auto"
                  style={{ borderColor: "#ced4da" }}
                />
              )}
            />
            {errors.article_language_id && (
              <div className="invalid-feedback">{errors.article_language_id.message}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Publisher Date<span className="text-danger">*</span>
            </label>
            <Controller
              name="publication_date"
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
            {errors.publication_date && (
              <div className="invalid-feedback">
                {errors.publication_date.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Name of the Publication/Newspaper{" "}
              <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${
                errors.publication_name ? "is-invalid" : ""
              }`}
              placeholder="Film Title (Roman Script)"
              {...register("publication_name")}
            />
            {errors.publication_name && (
              <div className="invalid-feedback">
                {errors.publication_name.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              RNI <span className="text-danger">*</span>
            </label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="Yes"
                  {...register("rni")}
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="No"
                  {...register("rni")}
                />
                <label className="form-check-label">No</label>
              </div>
            </div>
            {errors.rni && (
              <div className="text-danger">
                {errors.rni.message}
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

export default BestFilmSection;
