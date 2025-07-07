import mongoose from "mongoose";

const bestBookCinemaSchema = new mongoose.Schema(
  {
    step: { type: Number, default: 1 },
    active_step: { type: Number, default: 1 },
    payment_status: { type: String, default: null },
    status: { type: Number, default: 1 },
    client_id: { type: String, default: null },
    author_name: { type: String, default: null },
    author_contact: { type: String, default: null },
    author_address: { type: String, default: null },
    author_nationality_indian: { type: Number, default: 0 },
    author_profile: { type: String, default: null },
    author_aadhaar_card: { type: String, default: null },
    payment_date: { type: Date, default: null },
    amount: { type: String, default: null },
    reference_number: { type: String, default: null },
    receipt: { type: String, default: null },
    declaration_one: { type: Boolean, default: false },
    declaration_two: { type: Boolean, default: false },
    declaration_three: { type: Boolean, default: false },
    declaration_four: { type: Boolean, default: false },
    // books: [bookSchema],
    // editors: [editorSchema],
    payment_response: { type: mongoose.Schema.Types.Mixed, default: null },
    // documents: { type: Array, default: [] },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  },
  { timestamps: true }
);

export default mongoose.model("BestBookCinema", bestBookCinemaSchema);
