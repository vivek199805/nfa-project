import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const filmSchema = z.object({
  songTitle: z.string().trim().min(1, "This field is required"),
  musicDirector: z.string().trim().min(1, "This field is required"),
  backgroundMusic: z.string().trim().min(1, "This field is required"),
  lyricist: z.string().trim().min(1, "This field is required"),
  singerMale: z.string().trim().min(1, "This field is required"),
  singerFemale: z.string().trim().min(1, "This field is required"),
});

const SongsFormSection = ({ setActiveSection, data }) => {
  const [songsData, setSongsData] = useState([]); // your producer list
  const [showForm, setShowForm] = useState(songsData.length === 0);
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
      songTitle: "",
      musicDirector: "",
      backgroundMusic: "",
      lyricist: "",
      singerMale: "",
      singerFemale: "",
    },
    mode: "onTouched",
    // shouldFocusError: false,
  });
  useEffect(() => {
    if (data?.songs?.length > 0) {
      const updatedSongs = data.songs.map((item) => ({
        songTitle: item?.song_title,
        musicDirector: item?.music_director,
        backgroundMusic: item?.music_director_bkgd_music,
        lyricist: item?.lyricist,
        singerMale: item?.playback_singer_male,
        singerFemale: item?.playback_singer_female,
      }));

      setSongsData(updatedSongs);
    }
  }, [data?.songs]);
  useEffect(() => {
    setShowForm(songsData.length === 0);
  }, [songsData.length]);

  const onSubmit = (data) => {
    if (editingIndex !== null) {
      const updated = [...songsData];
      updated[editingIndex] = data;
      setSongsData(updated);
      setEditingIndex(null);
    } else {
      setSongsData([...songsData, data]);
    }

    reset();
    setShowForm(false);
  };
  const handleEdit = (index) => {
    const data = songsData[index];
    Object.entries(data).forEach(([key, value]) => {
      setValue(key, value);
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updated = [...songsData];
    updated.splice(index, 1);
    setSongsData(updated);
    if (songsData.length === 1) setShowForm(true); // Show form if all deleted
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
                  <th>Song Title</th>
                  <th>Music Director</th>
                  <th>Background Music Director</th>
                  <th>Lyricist</th>
                  <th>Playback Singer Male</th>
                  <th>Playback Singer Female</th>
                  <th>
                    <button
                      className="add-producer-btn"
                      onClick={() => {
                        reset();
                        setEditingIndex(null);
                        setShowForm(true);
                      }}
                    >
                      ADD SONG
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {songsData.length > 0 &&
                  songsData.map((song, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{song.songTitle}</td>
                      <td>{song.musicDirector}</td>
                      <td>{song.backgroundMusic}</td>
                      <td> {song.lyricist}</td>
                      <td>{song.singerMale}</td>
                      <td> {song.singerFemale}</td>

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
              <label className="form-label">
                Song Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.songTitle ? "is-invalid" : ""
                }`}
                placeholder="Enter Song Title"
                {...register("songTitle")}
                maxLength={10}
              />
              {errors.songTitle && (
                <div className="invalid-feedback">
                  {errors.songTitle.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Music Director <span className="text-danger">*</span>
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

            <div className="col-md-6">
              <label className="form-label">
                Background Music Director <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.backgroundMusic ? "is-invalid" : ""
                }`}
                placeholder=" Enter Background Music Director"
                {...register("backgroundMusic")}
              />
              {errors.backgroundMusic && (
                <div className="invalid-feedback">
                  {errors.backgroundMusic.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Lyricist<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.lyricist ? "is-invalid" : ""
                }`}
                placeholder=" Enter Lyricist"
                {...register("lyricist")}
              />
              {errors.lyricist && (
                <div className="invalid-feedback">
                  {errors.lyricist.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Singer Male<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.singerMale ? "is-invalid" : ""
                }`}
                placeholder=" Enter Singer Male"
                {...register("singerMale")}
              />
              {errors.singerMale && (
                <div className="invalid-feedback">
                  {errors.singerMale.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Singer Female<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.singerFemale ? "is-invalid" : ""
                }`}
                placeholder=" Enter singer Female"
                {...register("singerFemale")}
              />
              {errors.singerFemale && (
                <div className="invalid-feedback">
                  {errors.singerFemale.message}
                </div>
              )}
            </div>

            <div className="col-12 text-center mt-3">
              <button type="submit" className="btn btn-primary">
                {editingIndex ? "Update Song" : "Create Song"}
              </button>
            </div>
          </div>
        </form>
      )}
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(6)}
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
              setActiveSection(8);
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

export default SongsFormSection;
