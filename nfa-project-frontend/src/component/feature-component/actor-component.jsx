import { zodResolver } from "@hookform/resolvers/zod";
import {useForm } from "react-hook-form";
import { z } from "zod";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  postRequest,
} from "../../common/services/requestService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/services/toastService";
// import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";

const filmSchema = z.object({
  // category: z
  //   .object({
  //     label: z.string(),
  //     value: z.string(),
  //   })
  //   .refine((val) => val.value !== "", {
  //     message: "Please select a category",
  //   }),
  category: z.string().min(1, "This field is required"),
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

const ActorSection = ({ setActiveSection, filmType }) => {
  const [actorData, setActorData] = useState([]); // your producer list
  const [showForm, setShowForm] = useState(actorData.length === 0);
  const [editingIndex, setEditingIndex] = useState(null);
  const { id } = useParams();

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
      actorName: null,
      screenName: null,
      isVoiceDubbed: false,
    },
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() => {
    getActorList();
  }, [id]);

  const getActorList = async () => {
    try {
      const response = await postRequest("film/actor-list", { id });
      if (response.statusCode === 200) {
        setActorData(response.data);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  // useEffect(() => {
  //   if (data?.actors?.length > 0) {
  //     const updatedSongs = data.actors.map((item) => ({
  //       category: item?.actor_category_id,
  //       actorName: item?.name,
  //       screenName: item?.screen_name,
  //       isVoiceDubbed: item?.if_voice_dubbed == 1 ? true : false,
  //     }));

  //     setActorData(updatedSongs);
  //   }
  // }, [data?.actors]);

  useEffect(() => {
    setShowForm(actorData.length === 0);
  }, [actorData.length]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("actor_category_id", data.category);
    formData.append("name", data.actorName);
    formData.append("screen_name", data.screenName);
    formData.append("if_voice_dubbed", data.isVoiceDubbed == true ? 1 : 0);
    formData.append("nfa_feature_id", id);
    formData.append("film_type", filmType);
    if (editingIndex !== null) {
      // const updated = [...actorData];
      // updated[editingIndex] = data;
      // setProducers(updated);
      formData.append("actorId", editingIndex);
    }

    try {
      const response = await postRequest("film/store-actor", formData);
      if (response.statusCode === 200) {
        showSuccessToast(response.message);
        await getActorList();
        setEditingIndex(null);
        reset();
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast(error);
    }

    setShowForm(false);
  };

  const handleEdit = (index) => {
    //  const data = actorData[index];
    const data = actorData.find((item) => item._id === index);
    reset({
      category: data.actor_category_id.toString(),
      actorName: data.name,
      screenName: data.screen_name,
      isVoiceDubbed: data.if_voice_dubbed == 1 ? true : false,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete producer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // const updated = [...actorData];
        // updated.splice(index, 1);
        // setActorData(updated);
        // if (actorData.length === 1) setShowForm(true); // Show form if all deleted

        const formData = new FormData();
        formData.append("actorId", index);
        formData.append("nfa_feature_id", id);
        try {
          const response = await postRequest("film/delete-actor", formData);
          if (response.statusCode === 200) {
            showSuccessToast(response.message);
            await getActorList();
            setEditingIndex(null);
            Swal.fire("Deleted!", "director has been deleted.", "success");
          } else {
            showErrorToast(response.message);
          }
        } catch (error) {
          showErrorToast(error);
        }
      }
    });
  };

  const onNext = async () => {
    const isValid = await trigger(); // validate the form
    if ((isValid || !showForm) && actorData.length > 0) {
      const formData = new FormData();
      formData.append("step", "6");
      formData.append("id", id);
      formData.append("film_type", filmType);
      const response = await postRequest("film/feature-update", formData);
      if (response.statusCode == 200) {
        setActiveSection(7);
      }else{
        showErrorToast(response.message);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
      actorData.length === 0 ? showErrorToast("Atleast one actor is required") : showErrorToast("Please fill all required fields");
    }
  };

  return (
    <>
      <div className="producer-container">
        <div className="header-section d-flex justify-content-end align-items-center">
          <button
            className="add-producer-btn"
            onClick={() => {
              reset({
                category: null,
                actorName: null,
                screenName: null,
                isVoiceDubbed: false,
              });
              setEditingIndex(null);
             setShowForm((prev) => !prev);
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
                      <td>
                        {
                          options.find(
                            (item) => item.value == actor.actor_category_id
                          ).label
                        }
                      </td>
                      <td>{actor.name}</td>
                      <td>{actor.screen_name}</td>
                      <td>{actor.if_voice_dubbed == true ? "Yes" : "No"}</td>
                      <td>
                        <button
                          className="action-btn delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(actor._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          title="Edit"
                          onClick={() => handleEdit(actor._id)}
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
          onClick={() => onNext()}
        >
          Next <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default ActorSection;
