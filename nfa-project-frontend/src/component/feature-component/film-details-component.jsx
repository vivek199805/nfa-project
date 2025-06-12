import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
// import "./../styles/FeatureFilmForm.css";
import Select from "react-dropdown-select";
import { useEffect, useState } from "react";
import { countWords } from "../../common/common-function";
import { getRequest } from "../../common/services/requestService";

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

const FilmDetailsSection = ({ setActiveSection, data }) => {
  const [synopsisWordCount, setSynopsisWordCount] = useState(0);
    const [languageOptions, setLanguageOptions] = useState([]);
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

 useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await getRequest('get-languages');
        const options = response.data.map((lang) => ({
          label: lang.name,
          value: String(lang.id),
        }));
        setLanguageOptions(options);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    }

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (data) {
      const synopsis = data.film_synopsis || "";
      reset({
        titleRoman: data.film_title_roman,
        titleDevanagari: data.film_title_devnagri,
        titleEnglish: data.film_title_english,
        languages: languageOptions.filter((opt) =>
          data.language_id.includes(opt.value)
        ),
        englishSubtitle: data.english_subtitle == 1 ? "Yes" : "No",
        colorFormat: data.color_bw == 1 ? "Color" : "Black and White",
        aspectRatio: data.aspect_ratio,
        runningTime: data.running_time,
        format:
          data?.format == 1 ? "35mm" : data?.format == 2 ? "DCP" : "Blu Ray",
        directorDebut: data?.director_debut == 1 ? "Yes" : "No",
        soundSystem:
          data?.sound_system == 1
            ? "Optional Mono"
            : data?.sound_system == 2
              ? "Dolby"
              : data?.sound_system == 3
                ? "DTS"
                : "Other",
        synopsis: data.film_synopsis,
      });
      setSynopsisWordCount(countWords(synopsis));

    }
  }, [data, reset, languageOptions]);

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    // Call API to submit form data
    setActiveSection(2);
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
