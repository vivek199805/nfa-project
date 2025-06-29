import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useInputRestriction } from "../../hooks/useInputRestriction";
import "../../styles/ProducerTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getRequest, postRequest } from "../../common/services/requestService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/services/toastService";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const filmSchema = z.object({
  book_title_original: z.string().trim().min(1, "This field is required"),
  book_title_english: z.string().trim().min(1, "This field is required"),
  english_translation_book: z.string().trim().min(1, "This field is required"),

  language_id: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(1, "Please select at least one language")
    .transform((val) => val.map((item) => item.value)),

  author_name: z.string().trim().min(1, "This field is required"),
  page_count: z.string().trim().min(1, "This field is required"),

  date_of_publication: z.any().refine((val) => val && dayjs(val).isValid(), {
    message: "Valid date is required",
  }),

  book_price: z.string().trim().min(1, "This field is required"),
});

const BestBookCinemaSection = ({ setActiveSection, filmType }) => {
  const [languageOptions, setLanguageOptions] = useState([]);
  const [bookList, setBookList] = useState([]);
  const [showForm, setShowForm] = useState(bookList.length === 0);
  const numberRestriction = useInputRestriction("number");
  const [editingIndex, setEditingIndex] = useState(null);
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(filmSchema),
    defaultValues: {},
    mode: "onTouched",
  });

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
        console.error(error);
      }
    }

    fetchLanguages();
  }, []);

  useEffect(() => {
    getPublisher();
  }, [id]);

  const getPublisher = async () => {
    try {
      const response = await postRequest("film/publisher-list", {
        id,
        film_type: filmType,
      });
      if (response.statusCode === 200) {
        setBookList(response.data);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    setShowForm(bookList.length === 0);
  }, [bookList.length]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append(
      "indian_national",
      data.indianNationality === "Yes" ? 1 : 0
    );
    formData.append("book_title_original", data.book_title_original);
    formData.append("book_title_english", data.book_title_english);
    formData.append("english_translation_book", data.english_translation_book);
    formData.append("language_id", data.language_id);
    formData.append("author_name", data.author_name);
    formData.append("page_count", data.page_count);
    formData.append("date_of_publication", data.date_of_publication);
    formData.append("book_price", data.book_price);
    formData.append("nfa_feature_id", id);
    formData.append("film_type", filmType);

    if (editingIndex !== null) {
      // const updated = [...producers];
      // updated[editingIndex] = data;
      // setProducers(updated);
      formData.append("id", editingIndex);
    }

    try {
      const response = await postRequest("film/store-publisher", formData);
      if (response.statusCode === 200) {
        showSuccessToast(response.message);
        await getPublisher();
        setEditingIndex(null);
      } else {
        showErrorToast(response.message);
      }
    } catch (error) {
      showErrorToast(error);
    }

    reset();
    setShowForm(false);
  };

  const handleEdit = (index) => {
    console.log("hhfhh", index);
    const data = bookList.find((item) => item._id === index);
    reset({
      book_title_original: data.book_title_original,
      book_title_english: data.book_title_english,
      english_translation_book: data.english_translation_book,
      language_id: languageOptions.filter((opt) =>
        data.language_id?.includes(opt.value.toString())
      ),
      author_name: data.author_name,
      page_count: data.page_count,
      date_of_publication: data.date_of_publication,
      book_price: data.book_price,
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete this director?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // const updated = [...bookList];
        // updated.splice(index, 1);
        // setBookList(updated);
        // if (bookList.length === 1) setShowForm(true);
        const formData = new FormData();
        formData.append("producerId", index);
        formData.append("nfa_feature_id", id);
        try {
          const response = await postRequest("film/delete-director", formData);
          if (response.statusCode === 200) {
            showSuccessToast(response.message);
            await getPublisher();
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
    let url =
      filmType == "feature" ? "film/feature-update" : "film/non-feature-update";
    if ((isValid || !showForm) && bookList.length > 0) {
      const formData = new FormData();
      formData.append("step", "5");
      formData.append("id", id);
      formData.append("film_type", filmType);
      const response = await postRequest(url, formData);
      if (response.statusCode == 200) {
        setActiveSection(6);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to errors
      bookList.length === 0
        ? showErrorToast("Atleast one director is required")
        : showErrorToast("Please fill all required fields");
    }
  };

  return (
    <>
      <div className="producer-container">
        <div className="header-section d-flex justify-content-between align-items-center">
          <p className="header-text">
            Add at least 1 book detail and up to 5 book details.
          </p>
          <button
            className="add-producer-btn"
            onClick={() => {
              reset();
              setEditingIndex(null);
              setShowForm((prev) => !prev);
            }}
          >
            ADD BOOK
          </button>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Book Title</th>
                  <th>English Title</th>
                  <th>Author Name</th>
                  <th>Censor Date</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookList.map((book, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{book.book_title_original}</td>
                    <td>{book.book_title_english}</td>
                    <td>{book.author_name}</td>
                    <td>{book.date_of_publication}</td>
                    <td>{book.book_price}</td>
                    <td>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => handleDelete(book?._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => handleEdit(book?._id)}
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
                Title of the Book (Original Language)
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.book_title_original ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("book_title_original")}
              />
              {errors.book_title_original && (
                <div className="invalid-feedback">
                  {errors.book_title_original.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Title of the Book (English Language){" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.book_title_english ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("book_title_english")}
              />
              {errors.book_title_english && (
                <div className="invalid-feedback">
                  {errors.book_title_english.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                English Translation of the Book Title
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.english_translation_book ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("english_translation_book")}
                maxLength={10}
              />
              {errors.english_translation_book && (
                <div className="invalid-feedback">
                  {errors.english_translation_book.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Please mention Languages of the Book{" "}
                <span className="text-danger">*</span>
              </label>
              <Controller
                name="language_id"
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
              {errors.language_id && (
                <div className="invalid-feedback">
                  {errors.language_id.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Name of the Author<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  errors.author_name ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("author_name")}
              />
              {errors.author_name && (
                <div className="invalid-feedback">
                  {errors.author_name.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Number of Pages <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...numberRestriction}
                className={`form-control ${
                  errors.page_count ? "is-invalid" : ""
                }`}
                placeholder=""
                {...register("page_count")}
                maxLength={10}
              />
              {errors.page_count && (
                <div className="invalid-feedback">
                  {errors.page_count.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Censor Certification Date<span className="text-danger">*</span>
              </label>
              <Controller
                name="date_of_publication"
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                    type="single"
                    // label="Censor Certification Date"
                    value={field.value}
                    onChange={(date) => field.onChange(date ?? null)}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                  />
                )}
              />
              {errors.date_of_publication && (
                <div className="invalid-feedback">
                  {errors.date_of_publication.message}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Price(In Indian Rs.)<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                {...numberRestriction}
                className={`form-control ${
                  errors.book_price ? "is-invalid" : ""
                }`}
                placeholder="Pin Code"
                {...register("book_price")}
              />
              {errors.book_price && (
                <div className="invalid-feedback">
                  {errors.book_price.message}
                </div>
              )}
            </div>

            <div className="col-12 text-center mt-3">
              <button type="submit" className="btn btn-primary">
                {editingIndex ? "Update Publisher" : "Create Publisher"}
              </button>
            </div>
          </div>
        </form>
      )}
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(4)}
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

export default BestBookCinemaSection;
