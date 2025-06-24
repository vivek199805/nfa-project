import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  postRequest,
} from "../../common/services/requestService";
import { useFetchById } from "../../hooks/useFetchById";
const fileTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const filmSchema = z.object({
  originalScreenplay: z.string().min(1, "This field is required"),
  adaptedScreenplay: z.string().min(1, "This field is required"),
  storyWriter: z.string().min(1, "This field is required"),
  isPublicDomain: z.enum(["Yes", "No"], {
    required_error: "This field is required",
  }),
  originalCopy: z
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

  dialogues: z.string().optional(),
  effectsCreater: z.string().optional(),
  cinemetographer: z.string().optional(),
  isDigitalVideo: z.enum(["Yes", "No"]).optional(),
  editor: z.string().optional(),
  productionDesigner: z.string().optional(),
  costumeDesigner: z.string().optional(),
  makeup: z.string().optional(),
  animator: z.string().optional(),
  choreographer: z.string().optional(),
  stuntChoreographer: z.string().optional(),
  musicDirector: z.string().optional(),
});

const ScreenPlaySection = ({ setActiveSection, filmType }) => {
  const { id } = useParams();
    const { data: formData } = useFetchById("film/feature-entry-by", id);


  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(filmSchema),
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() => {
    if (formData) {
      reset({
        originalScreenplay: formData?.data.original_screenplay_name,
        adaptedScreenplay: formData?.data.adapted_screenplay_name,
        storyWriter: formData?.data.story_writer_name,
        isPublicDomain:
          formData?.data.work_under_public_domain == 1 ? "Yes" : "No",
        originalCopy: formData?.data.original_work_copy,
        dialogues: formData?.data.dialogue,
        effectsCreater: formData?.data.effectsCreater,
        cinemetographer: formData?.data.cinemetographer,
        isDigitalVideo:
          formData?.data.shot_digital_video_format == 1 ? "Yes" : "No",
        editor: formData?.data.editor,
        productionDesigner: formData?.data.production_designer,
        costumeDesigner: formData?.data.costume_designer,
        makeup: formData?.data.make_up_director,
        animator: formData?.data.animator,
        choreographer: formData?.data.choreographer,
        stuntChoreographer: formData?.data.stunt_choreographer,
        musicDirector: formData?.data.music_director,
      });
    }
  }, [formData, reset]);

  const onSubmit = async (data) => {
    console.log("Form submitted:", data);
    // Call API to submit form data
    const formData = new FormData();
    formData.append("original_screenplay_name", data.originalScreenplay);
    formData.append("adapted_screenplay_name", data.adaptedScreenplay);
    formData.append("story_writer_name", data.storyWriter);
    formData.append(
      "work_under_public_domain",
      data.isPublicDomain == "Yes" ? 1 : 0
    );
    formData.append("original_work_copy", data.originalCopy);
    formData.append("dialogue", data.dialogues);
    formData.append("effectsCreater", data.effectsCreater);
    formData.append("cinemetographer", data.cinemetographer);
    formData.append(
      "shot_digital_video_format",
      data.isDigitalVideo == "Yes" ? 1 : 0
    );
    formData.append("editor", data.editor);
    formData.append("production_designer", data.productionDesigner);
    formData.append("costume_designer", data.costumeDesigner);
    formData.append("make_up_director", data.makeup);
    formData.append("animator", data.animator);
    formData.append("choreographer", data.choreographer);
    formData.append("stunt_choreographer", data.stuntChoreographer);
    formData.append("music_director", data.musicDirector);
    formData.append("step", "9");
    formData.append("id", id);
    formData.append("film_type", filmType);
    const response = await postRequest("film/feature-update", formData);
    if (response.statusCode == 200) {
      setActiveSection(10);
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
            Name of Original Screenplay <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${
              errors.originalScreenplay ? "is-invalid" : ""
            }`}
            placeholder=" Enter Original Screenplay"
            {...register("originalScreenplay")}
          />
          {errors.originalScreenplay && (
            <div className="invalid-feedback">
              {errors.originalScreenplay.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Name of Adapted Screenplay<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${
              errors.adaptedScreenplay ? "is-invalid" : ""
            }`}
            placeholder=" Enter Adapted Screenplay"
            {...register("adaptedScreenplay")}
          />
          {errors.adaptedScreenplay && (
            <div className="invalid-feedback">
              {errors.adaptedScreenplay.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Name of Story Writer
            <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.storyWriter ? "is-invalid" : ""}`}
            placeholder=" Enter Story Writer"
            {...register("storyWriter")}
          />
          {errors.storyWriter && (
            <div className="invalid-feedback">{errors.storyWriter.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            (ii)Whether the work is under public domain{" "}
            <span className="text-danger">*</span>
          </label>
          <div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                value="Yes"
                {...register("isPublicDomain")}
              />
              <label className="form-check-label">Yes</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                value="No"
                {...register("isPublicDomain")}
              />
              <label className="form-check-label">No</label>
            </div>
          </div>
          {errors.isPublicDomain && (
            <div className="text-danger">{errors.isPublicDomain.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">A Copy of the Original Work</label>
          <Controller
            name="originalCopy"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className={`form-control ${
                  errors.originalCopy ? "is-invalid" : ""
                }`}
                onChange={(e) => field.onChange(e.target.files?.[0] || null)}
              />
            )}
          />
          {errors.originalCopy && (
            <div className="invalid-feedback">
              {errors.originalCopy.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Dialogues</label>
          <input
            type="text"
            className={`form-control ${errors.dialogues ? "is-invalid" : ""}`}
            placeholder=" Enter dialogues"
            {...register("dialogues")}
          />
          {errors.dialogues && (
            <div className="invalid-feedback">{errors.dialogues.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label"> Special Effects Creater </label>
          <input
            type="text"
            className={`form-control ${
              errors.effectsCreater ? "is-invalid" : ""
            }`}
            placeholder=" Enter Effects Creater"
            {...register("effectsCreater")}
          />
          {errors.effectsCreater && (
            <div className="invalid-feedback">
              {errors.effectsCreater.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label"> Cinemetographer(s)</label>
          <input
            type="text"
            className={`form-control ${
              errors.cinemetographer ? "is-invalid" : ""
            }`}
            placeholder=" Enter Effects Creater"
            {...register("cinemetographer")}
          />
          {errors.cinemetographer && (
            <div className="invalid-feedback">
              {errors.cinemetographer.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Whether the film was on a short digital/video format
          </label>
          <div>
            {["Yes", "No"].map((option) => (
              <div key={option} className="form-check form-check-inline">
                <input
                  type="radio"
                  className="form-check-input"
                  value={option}
                  {...register("isDigitalVideo")}
                />
                <label className="form-check-label">{option}</label>
              </div>
            ))}
          </div>
          {errors.isDigitalVideo && (
            <div className="text-danger">{errors.isDigitalVideo.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Editor</label>
          <input
            type="text"
            className={`form-control ${errors.editor ? "is-invalid" : ""}`}
            placeholder=" Enter Effects Creater"
            {...register("editor")}
          />
          {errors.editor && (
            <div className="invalid-feedback">{errors.editor.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label"> Production Designer</label>
          <input
            type="text"
            className={`form-control ${
              errors.productionDesigner ? "is-invalid" : ""
            }`}
            placeholder=" Enter Production Designer"
            {...register("productionDesigner")}
          />
          {errors.productionDesigner && (
            <div className="invalid-feedback">
              {errors.productionDesigner.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label"> Costume Designer</label>
          <input
            type="text"
            className={`form-control ${
              errors.costumeDesigner ? "is-invalid" : ""
            }`}
            placeholder=" Enter Costume Designer"
            {...register("costumeDesigner")}
          />
          {errors.costumeDesigner && (
            <div className="invalid-feedback">
              {errors.costumeDesigner.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Make-Up Director</label>
          <input
            type="text"
            className={`form-control ${errors.makeup ? "is-invalid" : ""}`}
            placeholder=" Enter Make-Up Director"
            {...register("makeup")}
          />
          {errors.makeup && (
            <div className="invalid-feedback">{errors.makeup.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Animator(In case of an animation film)
          </label>
          <input
            type="text"
            className={`form-control ${errors.animator ? "is-invalid" : ""}`}
            placeholder=" Enter Animator"
            {...register("animator")}
          />
          {errors.animator && (
            <div className="invalid-feedback">{errors.animator.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Choreographer</label>
          <input
            type="text"
            className={`form-control ${
              errors.choreographer ? "is-invalid" : ""
            }`}
            placeholder=" Enter Choreographer"
            {...register("choreographer")}
          />
          {errors.choreographer && (
            <div className="invalid-feedback">
              {errors.choreographer.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Stunt Choreographer</label>
          <input
            type="text"
            className={`form-control ${
              errors.stuntChoreographer ? "is-invalid" : ""
            }`}
            placeholder=" Enter Stunt Choreographe"
            {...register("stuntChoreographer")}
          />
          {errors.stuntChoreographer && (
            <div className="invalid-feedback">
              {errors.stuntChoreographer.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Music Director (Background score)
          </label>
          <input
            type="text"
            className={`form-control ${
              errors.musicDirector ? "is-invalid" : ""
            }`}
            placeholder=" Enter Music Director"
            {...register("musicDirector")}
          />
          {errors.musicDirector && (
            <div className="invalid-feedback">
              {errors.musicDirector.message}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActiveSection(8)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Prev
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            // onClick={() => setActiveSection(10)}
          >
            Next <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ScreenPlaySection;
