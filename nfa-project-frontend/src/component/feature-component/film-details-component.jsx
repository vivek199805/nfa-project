import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Select from "react-dropdown-select";
import { useEffect, useState } from "react";
import { countWords } from "../../common/common-function";
import {
  getRequest,
  postRequest,
} from "../../services/requestService";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchById } from "../../hooks/useFetchById";
import { useAuth } from "../../hooks/use-auth";
import {
  getFilmCreateEndpoint,
  getFilmEntryByEndpoint,
  getFilmNextSection,
  getFilmSectionStep,
  getFilmUpdateEndpoint,
} from "../../common/film-workflow";
import { apiConfig } from "../../services/apiEndpoints";

const filmSchema = z.object({
  titleRoman: z.string().min(1, "This field is required"),
  titleDevanagari: z.string().min(1, "This field is required"),
  titleEnglish: z.string().min(1, "This field is required"),
  languages: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(1, "Please select at least one language")
    .transform((val) => val.map((item) => item.value)),
  englishSubtitle: z.enum(["Yes", "No"], {
    required_error: "This field is required",
  }),
  colorFormat: z.enum(["Color", "Black & White"], {
    required_error: "This field is required",
  }),
  aspectRatio: z.string().min(1, "This field is required"),
  runningTime: z.string().min(1, "This field is required"),
  format: z.enum(["35mm", "DCP", "Blu Ray"], {
    required_error: "This field is required",
  }),
  directorDebut: z.enum(["Yes", "No"], {
    required_error: "This field is required",
  }),
  soundSystem: z.enum(["Optional Mono", "Dolby", "DTS", "Other"], {
    required_error: "This field is required",
  }),

  synopsis: z
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

const FilmDetailsSection = ({ setActiveSection, filmType }) => {
  const [synopsisWordCount, setSynopsisWordCount] = useState(0);
  const { user } = useAuth();

  const [languageOptions, setLanguageOptions] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate()
  const { data: formData } = useFetchById(getFilmEntryByEndpoint(filmType), id);


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
        const response = await getRequest(apiConfig.common.languages);
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
    //     const cachedData = queryClient.getQueryData(["userForm", id]) || formData;
    // if (!cachedData) return;

    const synopsis = formData?.data?.film_synopsis || "";
    reset({
      titleRoman: formData?.data.film_title_roman,
      titleDevanagari: formData?.data.film_title_devnagri,
      titleEnglish: formData?.data.film_title_english,
      languages: languageOptions.filter((opt) =>
        formData?.data.language_id?.includes(opt.value.toString())
      ),
      englishSubtitle:
        Number(formData?.data.english_subtitle) === 1 ? "Yes" : "No",
      colorFormat:
        Number(formData?.data.color_bw) === 1 ? "Color" : "Black & White",
      aspectRatio: formData?.data.aspect_ratio,
      runningTime: formData?.data.running_time,
      format:
        Number(formData?.data?.format) === 1
          ? "35mm"
          : Number(formData?.data?.format) === 2
            ? "DCP"
            : "Blu Ray",
      directorDebut:
        Number(formData?.data?.director_debut) === 1 ? "Yes" : "No",
      soundSystem:
        Number(formData?.data?.sound_system) === 1
          ? "Optional Mono"
          : Number(formData?.data?.sound_system) === 2
            ? "Dolby"
            : Number(formData?.data?.sound_system) === 3
              ? "DTS"
              : "Other",
      synopsis: formData?.data?.film_synopsis,
    });
    setSynopsisWordCount(countWords(synopsis));

  }, [formData, reset, id, languageOptions]);

  const onSubmit = async (data) => {
    // Call API to submit form data
    let url = "";
    const formData = new FormData();
    formData.append("film_title_roman", data.titleRoman);
    formData.append("film_title_devnagri", data.titleDevanagari);
    formData.append("film_title_english", data.titleEnglish);
    formData.append("language_id", data.languages);
    formData.append("english_subtitle", data.englishSubtitle == "Yes" ? 1 : 0);
    formData.append("color_bw", data.colorFormat == "Color" ? 1 : 0);
    formData.append("aspect_ratio", data.aspectRatio);
    formData.append("running_time", data.runningTime.toString());
    formData.append(
      "format",
      data.format == "35mm" ? 1 : data.format == "DCP" ? 2 : 3
    );
    formData.append("director_debut", data.directorDebut == "Yes" ? 1 : 0);
    formData.append(
      "sound_system",
      data.soundSystem == "Optional Mono"
        ? 1
        : data.soundSystem == "Dolby"
          ? 2
          : data.soundSystem == "DTS"
            ? 3
            : 4
    );
    formData.append("film_synopsis", data.synopsis);
    formData.append("step", getFilmSectionStep(filmType, "details"));
    formData.append("film_type", filmType);
    formData.append("client_id", user?.id);
    if (id) {
      formData.append("id", id);
      url = getFilmUpdateEndpoint(filmType);
    } else {
      url = getFilmCreateEndpoint(filmType);
    }

    const response = await postRequest(url, formData);
    if (Number(response.statusCode) === 200) {
      if (!id) navigate(`/${filmType}/${response.data.id}`)
      setActiveSection(getFilmNextSection(filmType, "details"));

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
              Film Title (Roman Script) <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.titleRoman ? "is-invalid" : ""
                }`}
              placeholder="Film Title (Roman Script)"
              {...register("titleRoman")}
            />
            {errors.titleRoman && (
              <div className="invalid-feedback">
                {errors.titleRoman.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Film Title (Devnagri) <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.titleDevanagari ? "is-invalid" : ""
                }`}
              placeholder="Film Title (Devanagri)"
              {...register("titleDevanagari")}
            />
            {errors.titleDevanagari && (
              <div className="invalid-feedback">
                {errors.titleDevanagari.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Film Title (English translation){" "}
              <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.titleEnglish ? "is-invalid" : ""
                }`}
              placeholder="English Title"
              {...register("titleEnglish")}
            />
            {errors.titleEnglish && (
              <div className="invalid-feedback">
                {errors.titleEnglish.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Languages (if no dialogues) <span className="text-danger">*</span>
            </label>
            {/* <select
    className={`form-control ${errors.languages ? 'is-invalid' : ''}`}
    {...register('languages')}
    defaultValue=""
  >
    <option value="" disabled>Select Language</option>
    <option value="Hindi">Hindi</option>
    <option value="English">English</option>
    <option value="Tamil">Tamil</option>
  </select> */}
            {/* <Controller
        control={control}
        name="languages"
        defaultValue={[]}
        render={({ field }) => (
          <Select
            {...field}
            options={options}
            multi
            onChange={field.onChange}
                  values={field.value ?? []}
            placeholder="Select languages"
            dropdownHandle={true}
          />
        )}
      /> */}

            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={languageOptions}
                  multi
                  values={field.value ?? []}
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
            {errors.languages && (
              <div className="invalid-feedback">{errors.languages.message}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              English Subtitle <span className="text-danger">*</span>
            </label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="Yes"
                  {...register("englishSubtitle")}
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="No"
                  {...register("englishSubtitle")}
                />
                <label className="form-check-label">No</label>
              </div>
            </div>
            {errors.englishSubtitle && (
              <div className="text-danger">
                {errors.englishSubtitle.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Color/Black & White <span className="text-danger">*</span>
            </label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="Color"
                  {...register("colorFormat")}
                />
                <label className="form-check-label">Color</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value="Black & White"
                  {...register("colorFormat")}
                />
                <label className="form-check-label">Black & White</label>
              </div>
            </div>
            {errors.colorFormat && (
              <div className="text-danger">{errors.colorFormat.message}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Aspect Ratio <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.aspectRatio ? "is-invalid" : ""
                }`}
              placeholder="Aspect Ratio"
              {...register("aspectRatio")}
            />
            {errors.aspectRatio && (
              <div className="invalid-feedback">
                {errors.aspectRatio.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Running Time (mins) <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.runningTime ? "is-invalid" : ""
                }`}
              placeholder="Running Time"
              {...register("runningTime")}
            />
            {errors.runningTime && (
              <div className="invalid-feedback">
                {errors.runningTime.message}
              </div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Format<span className="text-danger">*</span>{" "}
            </label>
            <div>
              {["35mm", "DCP", "Blu Ray"].map((option) => (
                <div key={option} className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    value={option}
                    {...register("format")}
                  />
                  <label className="form-check-label">{option}</label>
                </div>
              ))}
            </div>
            {errors.format && (
              <div className="text-danger">{errors.format.message}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Director’s Debut <span className="text-danger">*</span>
            </label>
            <div>
              {["Yes", "No"].map((option) => (
                <div key={option} className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    value={option}
                    {...register("directorDebut")}
                  />
                  <label className="form-check-label">{option}</label>
                </div>
              ))}
            </div>
            {errors.directorDebut && (
              <div className="text-danger">{errors.directorDebut.message}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Sound System <span className="text-danger">*</span>
            </label>
            <div>
              {["Optional Mono", "Dolby", "DTS", "Other"].map((option) => (
                <div key={option} className="form-check form-check-inline">
                  <input
                    type="radio"
                    className="form-check-input"
                    value={option}
                    {...register("soundSystem")}
                  />
                  <label className="form-check-label">{option}</label>
                </div>
              ))}
            </div>
            {errors.soundSystem && (
              <div className="text-danger">{errors.soundSystem.message}</div>
            )}
          </div>

          <div className="col-md-12">
            <label className="form-label">
              Film Synopsis (10-200 words){" "}
              <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.synopsis ? "is-invalid" : ""}`}
              rows={4}
              placeholder="Film Synopsis"
              {...register("synopsis", {
                onChange: (e) => {
                  setSynopsisWordCount(countWords(e.target.value));
                },
              })}
            />
            <p className="text-muted mt-1">{synopsisWordCount} word(s)</p>
            {errors.synopsis && (
              <div className="invalid-feedback">{errors.synopsis.message}</div>
            )}
          </div>

          <div className="col-12 workflow-nav workflow-nav-end">
            <button type="submit" className="btn btn-primary">
              Next <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default FilmDetailsSection;
