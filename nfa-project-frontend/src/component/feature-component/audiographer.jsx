import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const filmSchema = z.object({
  soundRecordist: z.string().trim().optional(),
  soundDesigner: z.string().trim().min(1, "This field is required"),
  reRecordist: z.string().trim().optional(),
});

const AudiographerSection = ({ setActiveSection, data }) => {
  const [audioGrapherData, setAudioGrapherData] = useState([]); // your producer list
  const [showForm, setShowForm] = useState(audioGrapherData.length === 0);
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
      soundRecordist: "",
      soundDesigner: "",
      reRecordist: "",
    },
    mode: "onTouched",
    // shouldFocusError: false,
  });

    useEffect(() => {
    if (data?.audiographer?.length > 0) {
    const updatedAudiographer = data.audiographer.map(item => ({
      soundRecordist: item?.production_sound_recordist, 
      soundDesigner: item?.sound_designer,
      reRecordist: item?.re_recordist_filnal
    }));    

    setAudioGrapherData(updatedAudiographer);
    }
  }, [data?.audiographer]);
  useEffect(() => {
    setShowForm(audioGrapherData.length === 0);
  }, [audioGrapherData.length]);

  const onSubmit = (data) => {
    if (editingIndex !== null) {
      const updated = [...audioGrapherData];
      updated[editingIndex] = data;
      setAudioGrapherData(updated);
      setEditingIndex(null);
    } else {
      setAudioGrapherData([...audioGrapherData, data]);
    }

    reset();
    setShowForm(false);
  };
  const handleEdit = (index) => {
    const data = audioGrapherData[index];
    Object.entries(data).forEach(([key, value]) => {
      setValue(key, value);
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updated = [...audioGrapherData];
    updated.splice(index, 1);
    setAudioGrapherData(updated);
    if (audioGrapherData.length === 1) setShowForm(true); // Show form if all deleted
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
                        setShowForm(true);
                      }}
                    >
                      ADD AUDIOGRAPHER
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {audioGrapherData.length > 0 &&
                  audioGrapherData.map((song, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{song.soundRecordist}</td>
                      <td>{song.soundDesigner}</td>
                      <td>{song.reRecordist}</td>
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
          onClick={async () => {
            const isValid = await trigger(); // validate the form
            if (isValid || !showForm) {
              setActiveSection(9);
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

export default AudiographerSection;
