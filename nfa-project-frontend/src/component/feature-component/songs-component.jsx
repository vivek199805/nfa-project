import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import Swal from "sweetalert2";

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
    getSongList();
  }, [id]);

  const getSongList = async () => {
    try {
      const response = await postRequest("film/song-list", { id });
      if (response.statusCode === 200) {
        setSongsData(response.data);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    setShowForm(songsData.length === 0);
  }, [songsData.length]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("song_title", data.songTitle);
    formData.append("music_director", data.musicDirector);
    formData.append("music_director_bkgd_music", data.backgroundMusic);
    formData.append("lyricist", data.lyricist);
    formData.append("playback_singer_male", data.singerMale);
    formData.append("playback_singer_female", data.singerFemale);
    formData.append("nfa_feature_id", id);
    if (editingIndex !== null) {
      formData.append("songId", editingIndex);
    }

    try {
      const response = await postRequest("film/store-song", formData);
      if (response.statusCode === 200) {
        showSuccessToast(response.message);
        await getSongList();
        setEditingIndex(null);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast(error);
    }

    reset({
      songTitle: "",
      musicDirector: "",
      backgroundMusic: "",
      lyricist: "",
      singerMale: "",
      singerFemale: "",
    });
    setShowForm(false);
  };

  const handleEdit = (index) => {
    const data = songsData.find((item) => item._id === index);
    reset({
      songTitle: data.song_title,
      musicDirector: data.music_director,
      backgroundMusic: data.music_director_bkgd_music,
      lyricist: data.lyricist,
      singerMale: data.playback_singer_male,
      singerFemale: data.playback_singer_female,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete Song?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        //  const updated = [...songsData];
        //   updated.splice(index, 1);
        //   setSongsData(updated);
        //   if (songsData.length === 1) setShowForm(true);

        const formData = new FormData();
        formData.append("songId", index);
        formData.append("nfa_feature_id", id);
        try {
          const response = await postRequest("film/delete-song", formData);
          if (response.statusCode === 200) {
            showSuccessToast(response.message);
            await getSongList();
            setEditingIndex(null);
            Swal.fire("Deleted!", "song has been deleted.", "success");
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
      formData.append("step", "7");
      formData.append("id", id);
      const response = await postRequest("film/feature-update", formData);
      if (response.statusCode == 200) {
         setActiveSection(8);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
      showSuccessToast("Atleast one diector is required");
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
                       setShowForm((prev) => !prev);
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
                      <td>{song.song_title}</td>
                      <td>{song.music_director}</td>
                      <td>{song.music_director_bkgd_music}</td>
                      <td> {song.lyricist}</td>
                      <td>{song.playback_singer_male}</td>
                      <td> {song.playback_singer_female}</td>

                      <td>
                        <button
                          className="action-btn delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(song._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          title="Edit"
                          onClick={() => handleEdit(song._id)}
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
          onClick={ () => onNext()}
        >
          Next <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default SongsFormSection;
