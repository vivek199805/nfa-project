import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Select from "react-dropdown-select";
import { useEffect, useState } from "react";
import { countWords } from "../../common/common-function";
import {
  getRequest,
  getRequestById,
  postRequest,
} from "../../common/services/requestService";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../../lib/queryClient";

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
    .min(100, "Minimum 100 words required")
    .refine(
      (val) => {
        const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
        return wordCount >= 100 && wordCount <= 200;
      },
      {
        message: "Synopsis must be between 100 and 200 words",
      }
    ),
});

let options = [
  { id: 1, name: "Assamese" },
  { id: 2, name: "Bengali" },
  { id: 3, name: "Bodo" },
  {
    id: 4,
    name: "Dogri",
  },
  {
    id: 5,
    name: "English",
  },
  {
    id: 6,
    name: "Gujarati",
  },
  {
    id: 7,
    name: "Hindi",
  },
  {
    id: 8,
    name: "Kannada",
  },
  {
    id: 9,
    name: "Kashmiri",
  },
  {
    id: 10,
    name: "Konkani",
  },
  {
    id: 11,
    name: "Malayalam",
  },
  {
    id: 12,
    name: "Manipuri",
  },
  {
    id: 13,
    name: "Marathi",
  },
  {
    id: 14,
    name: "Maithili",
  },
  {
    id: 15,
    name: "Nepali",
  },
  {
    id: 16,
    name: "Oriya",
  },
  {
    id: 17,
    name: "Punjabi",
  },
  {
    id: 18,
    name: "Sanskrit",
  },
  {
    id: 19,
    name: "Sindhi",
  },
  {
    id: 20,
    name: "Other",
  },
  {
    id: 21,
    name: "Tamil",
  },
  {
    id: 22,
    name: "Telugu",
  },
  {
    id: 23,
    name: "Urdu",
  },
  {
    id: 24,
    name: "Santhali",
  },
];

const FilmDetailsSection = ({ setActiveSection, filmType }) => {
  const [synopsisWordCount, setSynopsisWordCount] = useState(0);
  const [languageOptions, setLanguageOptions] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate()
  // const languageOptions = options.map((lang) => ({
  //   label: lang.name,
  //   value: String(lang.id),
  // }));

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

  const { data: formData, refetch } = useQuery({
    queryKey: ["userForm", id],
    queryFn: () => getRequestById(filmType === "feature" ? "film/feature-entry-by" : "film/non-feature-entry-by", id),
    enabled: !!id,  // Only run query if id exists
    // staleTime: 1000 * 60 * 5, // 5 minutes - consider this data fresh for 5 mins
    // initialData: staticForms, // sets mock data
    // initialData: () => queryClient.getQueryData(["userForm", id]), // optional
    refetchOnMount: true,
    staleTime: 0,
  });

  // Call refetch manually on mount
  // useEffect(() => {
  //   if (id) {
  //     refetch();
  //   }
  // }, [id, refetch]);

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
      englishSubtitle: formData?.data.english_subtitle == 1 ? "Yes" : "No",
      colorFormat: formData?.data.color_bw == 1 ? "Color" : "Black and White",
      aspectRatio: formData?.data.aspect_ratio,
      runningTime: formData?.data.running_time,
      format:
        formData?.data?.format == 1
          ? "35mm"
          : formData?.data?.format == 2
            ? "DCP"
            : "Blu Ray",
      directorDebut: formData?.data?.director_debut == 1 ? "Yes" : "No",
      soundSystem:
        formData?.data?.sound_system == 1
          ? "Optional Mono"
          : formData?.data?.sound_system == 2
            ? "Dolby"
            : formData?.data?.sound_system == 3
              ? "DTS"
              : "Other",
      synopsis: formData?.data?.film_synopsis,
    });
    setSynopsisWordCount(countWords(synopsis));

  }, [formData, reset, id, languageOptions]);

  const onSubmit = async (data) => {
    // Call API to submit form data
    console.log("Form submitted:", data);
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
    formData.append("step", "1");
    if (id) {
      formData.append("id", id);
      filmType == 'feature' ? url = "film/feature-update" : url = "film/non-feature-update";
    } else {
      filmType == 'feature' ? url = "film/feature-create" : url = "film/non-feature-create";
    }

    const response = await postRequest(url, formData);
    if (response.statusCode == 200) {
      if(!id) navigate(`/${filmType}/${response.data.id}`)
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
            values={field.value}
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
              Film Synopsis (100-200 words){" "}
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

export default FilmDetailsSection;
