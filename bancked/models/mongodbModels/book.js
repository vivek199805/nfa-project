import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    client_id: { type: String, default: null },
    best_book_cinemas_id: { type: String, default: null },
    book_title_original: { type: String, default: null },
    book_title_english: { type: String, default: null },
    english_translation_book: { type: String, default: null },
    language_id: {
      type: [String],
      default: [],
      set: (val) => {
        if (typeof val === "string") {
          return val.split(",").map((item) => item.trim());
        }
        if (Array.isArray(val)) {
          return val.flatMap((v) =>
            typeof v === "string" && v.includes(",")
              ? v.split(",").map((i) => i.trim())
              : [v]
          );
        }
        return [];
      },
    },
    author_name: { type: String, default: null },
    page_count: { type: Number, default: null },
    date_of_publication: { type: Date, default: null },
    book_price: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
