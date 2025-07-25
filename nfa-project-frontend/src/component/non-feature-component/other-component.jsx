import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { postRequest } from "../../common/services/requestService";
import { useFetchById } from "../../hooks/useFetchById";

const filmSchema = z.object({
  cinemetographer: z.string().optional(),
  editor: z.string().optional(),
  audiographer: z.string().optional(),
  music_director: z.string().optional(),
  shot_digital_video_format: z.enum(["Yes", "No"]).optional(),
  production_designer: z.string().optional(),
  choreographer: z.string().optional(),
  voice_over_artist: z.string().optional(),
  sound_recordist: z.string().optional(),
});

const OtherSection = ({ setActiveSection, filmType }) => {
  const { id } = useParams();
    const { data: formData } = useFetchById("film/non-feature-entry-by", id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(filmSchema),
    // defaultValues: {
    // },
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() => {
    if (formData) {
      reset({
        cinemetographer: formData?.data?.cinemetographer,
        editor: formData?.data?.editor,
        audiographer: formData?.data?.non_audiographer,
        music_director: formData?.data?.music_director,
        shot_digital_video_format: formData?.data?.shot_digital_video_format == 1 ? "Yes" : "No",
        production_designer: formData?.data?.production_designer,
        choreographer: formData?.data?.choreographer,
        voice_over_artist: formData?.data?.voice_over_artist,
        sound_recordist: formData?.data?.sound_recordist,
      });
    }
  }, [formData, reset]);

  const onSubmit =  async (data) => {
    console.log("Form submitted:", data);
    // Call API to submit form data
    const formData = new FormData();
    formData.append("cinemetographer", data.cinemetographer);
    formData.append("editor", data.editor);
    formData.append("non_audiographer", data.audiographer);
    formData.append("music_director", data.music_director);
    formData.append("shot_digital_video_format", data.shot_digital_video_format == 'Yes' ? true : false);
    formData.append("production_designer", data.production_designer);
    formData.append("choreographer", data.choreographer);
    formData.append("voice_over_artist", data.voice_over_artist);
    formData.append("sound_recordist", data.sound_recordist);
    formData.append("step", "6");
    formData.append("id", id);
    formData.append("film_type", filmType);

    const response = await postRequest("film/non-feature-update", formData);
    if (response.statusCode == 200) {
      setActiveSection(7);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ padding: 20, maxWidth: 900, margin: "auto" }}
    >
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label"> Cinemetographer(s)</label>
          <input
            type="text"
            className={`form-control ${errors.cinemetographer ? "is-invalid" : ""
              }`}
            placeholder=" Enter Cinemetographer"
            {...register("cinemetographer")}
          />
          {errors.cinemetographer && (
            <div className="invalid-feedback">
              {errors.cinemetographer.message}
            </div>
          )}
        </div>
        <div className="col-md-6">
          <label className="form-label">Editor</label>
          <input
            type="text"
            className={`form-control ${errors.editor ? "is-invalid" : ""}`}
            placeholder=" Enter Editor"
            {...register("editor")}
          />
          {errors.editor && (
            <div className="invalid-feedback">{errors.editor.message}</div>
          )}
        </div>
        <div className="col-md-6">
          <label className="form-label">
            Audiographer (Re-recordistof the final mixed track)
          </label>
          <input
            type="text"
            className={`form-control ${errors.audiographer ? "is-invalid" : ""
              }`}
            placeholder=" Enter Audiographer"
            {...register("audiographer")}
          />
          {errors.audiographer && (
            <div className="invalid-feedback">
              {errors.audiographer.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Music Directors (Plese state the musical score is original)
          </label>
          <input
            type="text"
            className={`form-control ${errors.music_director ? "is-invalid" : ""
              }`}
            placeholder="Enter Music Director"
            {...register("music_director")}
          />
          {errors.music_director && (
            <div className="invalid-feedback">
              {errors.music_director.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Whether the film was on a short digital/video format
          </label>
          <div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                value="Yes"
                {...register("shot_digital_video_format")}
              />
              <label className="form-check-label">Yes</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                value="No"
                {...register("shot_digital_video_format")}
              />
              <label className="form-check-label">No</label>
            </div>
          </div>
          {errors.shot_digital_video_format && (
            <div className="text-danger">{errors.shot_digital_video_format.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Production Designer</label>
          <input
            type="text"
            className={`form-control ${errors.production_designer ? "is-invalid" : ""}`}
            placeholder=" Enter production Designer"
            {...register("production_designer")}
          />
          {errors.production_designer && (
            <div className="invalid-feedback">{errors.production_designer.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label"> Choreographers</label>
          <input
            type="text"
            className={`form-control ${errors.choreographer ? "is-invalid" : ""
              }`}
            placeholder=" Enter choreographer"
            {...register("choreographer")}
          />
          {errors.choreographer && (
            <div className="invalid-feedback">
              {errors.choreographer.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label"> Narrator/Voice Over artist</label>
          <input
            type="text"
            className={`form-control ${errors.voice_over_artist ? "is-invalid" : ""
              }`}
            placeholder=" Enter Narrator/Voice Over artist"
            {...register("voice_over_artist")}
          />
          {errors.voice_over_artist && (
            <div className="invalid-feedback">
              {errors.voice_over_artist.message}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">On Location Sound artist</label>
          <input
            type="text"
            className={`form-control ${errors.sound_recordist ? "is-invalid" : ""}`}
            placeholder=" Enter On Location Sound artist"
            {...register("sound_recordist")}
          />
          {errors.sound_recordist && (
            <div className="invalid-feedback">{errors.sound_recordist.message}</div>
          )}
        </div>

        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActiveSection(5)}
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

export default OtherSection;
