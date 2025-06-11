import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const filmSchema = z.object({
  // category: z
  //   .object({
  //     label: z.string(),
  //     value: z.string(),
  //   })
  //   .refine((val) => val.value !== "", {
  //     message: "Please select a category",
  //   }),
  category: z.number().min(1, "This field is required"),
  actorName: z.string().trim().min(1, "This field is required"),
  screenName: z.string().trim().min(1, "This field is required"),
  isVoiceDubbed: z.boolean().refine((val) => val === true, {
    message: "Please confirm if voice is dubbed",
  }),
});

const options = [
  { label: "Actress in Leading Role", value: 1 },
  { label: "Actor in Leading Role", value: 2 },
  { label: "Actress in Supporting Role", value: 3 },
  { label: "Actor in Supporting Role", value: 4 },
  { label: "Child Artist", value: 5 },
];

const ActorSection = ({ setActiveSection, data }) => {
  const [actorData, setActorData] = useState([]); // your producer list
  const [showForm, setShowForm] = useState(actorData.length === 0);
  const [editingIndex, setEditingIndex] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(filmSchema),
    defaultValues: {
      category: null,
      actorName: "",
      screenName: "",
      isVoiceDubbed: false,
    },
    mode: "onTouched",
    // shouldFocusError: false,
  });
  useEffect(() => {
    if (data?.actors?.length > 0) {
      const updatedSongs = data.actors.map((item) => ({
        category: item?.actor_category_id,
        actorName: item?.name,
        screenName: item?.screen_name,
        isVoiceDubbed: item?.if_voice_dubbed == 1 ? true : false,
      }));

      setActorData(updatedSongs);
    }
  }, [data?.actors]);
  useEffect(() => {
    setShowForm(actorData.length === 0);
  }, [actorData.length]);

  useEffect(() => {
    if (data) {
      reset({
        category: data?.censor_certificate_nom || "",
        actorName: data?.censor_certificate_date || "",
        screenName: data?.censor_certificate_file || "", // Files can't be pre-filled
        isVoiceDubbed: data?.censor_certificate_file || false, // Files can't b
      });
    }
  }, [data, reset]);

  const onSubmit = (data) => {
    if (editingIndex !== null) {
      const updated = [...actorData];
      updated[editingIndex] = data;
      setActorData(updated);
      setEditingIndex(null);
    } else {
      setActorData([...actorData, data]);
    }

    reset();
    setShowForm(false);
  };
  const handleEdit = (index) => {
    const data = actorData[index];
    Object.entries(data).forEach(([key, value]) => {
      setValue(key, value);
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updated = [...actorData];
    updated.splice(index, 1);
    setActorData(updated);
    if (actorData.length === 1) setShowForm(true); // Show form if all deleted
  };

  return (
    <>
      <div className="producer-container">
        <div className="header-section d-flex justify-content-end align-items-center">
          <button
            className="add-producer-btn"
            onClick={() => {
              reset();
              setEditingIndex(null);
              setShowForm(true);
            }}
          >
            ADD ACTOR
          </button>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Screen Name</th>
                  <th>Voice Dubbed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {actorData.length > 0 &&
                  actorData.map((actor, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{actor.category}</td>
                      <td>{actor.actorName}</td>
                      <td>{actor.screenName}</td>
                      <td>{actor.screenName ? "Yes" : "No"}</td>
                      <td>
                        <button
                          className="action-btn delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          title="Edit"
                          onClick={() => handleEdit(index)}
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ padding: 20, maxWidth: 900, margin: "auto" }}
        >
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">
                Category<span className="text-danger">*</span>
              </label>
              <select
                className={`form-control ${
                  errors.category ? "is-invalid" : ""
                }`}
                {...register("category")}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Category
                </option>
                {options.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <div className="text-danger">{errors.category.message}</div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Actor Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.actorName ? "is-invalid" : ""
                }`}
                placeholder="Actor Name"
                {...register("actorName")}
                maxLength={10}
              />
              {errors.actorName && (
                <div className="invalid-feedback">
                  {errors.actorName.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Screen Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.screenName ? "is-invalid" : ""
                }`}
                placeholder="Screen Name"
                {...register("screenName")}
              />
              {errors.screenName && (
                <div className="invalid-feedback">
                  {errors.screenName.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isVoiceDubbed"
                  {...register("isVoiceDubbed")}
                />
                <label className="form-check-label" htmlFor="isVoiceDubbed">
                  Select if voice is dubbed{" "}
                  <span className="text-danger">*</span>
                </label>
              </div>
              {errors.isVoiceDubbed && (
                <div className="text-danger">
                  {errors.isVoiceDubbed.message}
                </div>
              )}
            </div>

            <div className="col-12 text-center mt-3">
              <button type="submit" className="btn btn-primary">
                {editingIndex != null ? "Update Actor" : "Create Actor"}
              </button>
            </div>
          </div>
        </form>
      )}
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
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            const isValid = await trigger(); // validate the form
            if (isValid || !showForm) {
              setActiveSection(7);
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
            }
          }}
        >
          Next <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default ActorSection;
