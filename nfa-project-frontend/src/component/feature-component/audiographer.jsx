import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getRequestById,
  postRequest,
} from "../../common/services/requestService";
import { showErrorToast, showSuccessToast } from "../../common/services/toastService";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const filmSchema = z.object({
  soundRecordist: z.string().trim().optional(),
  soundDesigner: z.string().trim().min(1, "This field is required"),
  reRecordist: z.string().trim().optional(),
});

const AudiographerSection = ({ setActiveSection, data }) => {
  const [audioGrapherData, setAudioGrapherData] = useState([]); // your producer list
  const [showForm, setShowForm] = useState(audioGrapherData.length === 0);
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
      soundRecordist: "",
      soundDesigner: "",
      reRecordist: "",
    },
    mode: "onTouched",
    // shouldFocusError: false,
  });

  useEffect(() => {
    getAudiographerList();
  }, [id]);

  const getAudiographerList = async () => {
    try {
      const response = await postRequest("film/audiographer-list", { id });
      if (response.statusCode === 200) {
        setAudioGrapherData(response.data);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const { data: formData } = useQuery({
    queryKey: ["userForm", id],
    queryFn: () => getRequestById("film/feature-entry-by", id),
    enabled: !!id, // Only run query if id exists
    refetchOnMount: true,
    staleTime: 0,
  });

  // useEffect(() => {
  //   if (data?.audiographer?.length > 0) {
  //     const updatedAudiographer = data.audiographer.map((item) => ({
  //       soundRecordist: item?.production_sound_recordist,
  //       soundDesigner: item?.sound_designer,
  //       reRecordist: item?.re_recordist_filnal,
  //     }));

  //     setAudioGrapherData(updatedAudiographer);
  //   }
  // }, [data?.audiographer]);

  useEffect(() => {
    setShowForm(audioGrapherData.length === 0);
  }, [audioGrapherData.length]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("production_sound_recordist", data.soundRecordist);
    formData.append("sound_designer", data.soundDesigner);
    formData.append("re_recordist_filnal", data.reRecordist);
    formData.append("nfa_feature_id", id);
    if (editingIndex !== null) {
      formData.append("audiographerId", editingIndex);
    }

    try {
      const response = await postRequest("film/store-audiographer", formData);
      if (response.statusCode === 200) {
        showSuccessToast(response.message);
        await getAudiographerList();
        setEditingIndex(null);
        reset({
          soundRecordist: "",
          soundDesigner: "",
          reRecordist: "",
        });
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast(error);
    }

    setShowForm(false);
  };

  const handleEdit = (index) => {
    //  const data = audioGrapherData[index];
    const data = audioGrapherData.find((item) => item._id === index);
    reset({
      soundRecordist: data.production_sound_recordist,
      soundDesigner: data.sound_designer,
      reRecordist: data.re_recordist_filnal,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete audiographer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // if (audioGrapherData.length === 1) setShowForm(true);

        const formData = new FormData();
        formData.append("audiographerId", index);
        formData.append("nfa_feature_id", id);
        try {
          const response = await postRequest(
            "film/delete-audiographer",
            formData
          );
          if (response.statusCode === 200) {
            showSuccessToast(response.message);
            await getAudiographerList();
            setEditingIndex(null);
            Swal.fire("Deleted!", "audiographer has been deleted.", "success");
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
    if (isValid || !showForm) {
      const formData = new FormData();
      formData.append("step", "8");
      formData.append("id", id);
      const response = await postRequest("film/feature-update", formData);
      if (response.statusCode == 200) {
        setActiveSection(9);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
      showSuccessToast("Atleast one audiographer is required");
    }
  };

  return (
    <>
      <div className="producer-container">
        <div className="table-container">
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Audiographer Title</th>
                  <th>Music Director</th>
                  <th>Lyricist</th>
                  <th>
                    <button
                      className="add-producer-btn"
                      onClick={() => {
                        reset();
                        setEditingIndex(null);
                        setShowForm((prev) => !prev);
                      }}
                    >
                      ADD AUDIOGRAPHER
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {audioGrapherData.length > 0 &&
                  audioGrapherData.map((audiographer, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{audiographer.production_sound_recordist}</td>
                      <td>{audiographer.sound_designer}</td>
                      <td>{audiographer.re_recordist_filnal}</td>
                      <td>
                        <button
                          className="action-btn delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(audiographer._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          title="Edit"
                          onClick={() => handleEdit(audiographer._id)}
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
            <div className="col-md-6">
              <label className="form-label">Production Sound Recordist</label>
              <input
                type="text"
                className={`form-control ${
                  errors.soundRecordist ? "is-invalid" : ""
                }`}
                placeholder="Enter Production Sound Recordist"
                {...register("soundRecordist")}
                maxLength={10}
              />
              {errors.soundRecordist && (
                <div className="invalid-feedback">
                  {errors.soundRecordist.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Sound Designer <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.soundDesigner ? "is-invalid" : ""
                }`}
                placeholder=" Enter Sound Designer"
                {...register("soundDesigner")}
              />
              {errors.soundDesigner && (
                <div className="invalid-feedback">
                  {errors.soundDesigner.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Re - Recordist Track</label>
              <input
                type="text"
                className={`form-control ${
                  errors.reRecordist ? "is-invalid" : ""
                }`}
                placeholder=" Enter Re - Recordist Track"
                {...register("reRecordist")}
              />
              {errors.reRecordist && (
                <div className="invalid-feedback">
                  {errors.reRecordist.message}
                </div>
              )}
            </div>

            <div className="col-12 text-center mt-3">
              <button type="submit" className="btn btn-primary">
                {editingIndex != null
                  ? "Update Audiographer"
                  : "Create Audiographer"}
              </button>
            </div>
          </div>
        </form>
      )}
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(7)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Prev
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => onNext()}
        >
          Next <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default AudiographerSection;
