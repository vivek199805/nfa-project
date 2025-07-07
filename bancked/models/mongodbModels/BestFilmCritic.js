import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    context_id: Number,
    form_type: Number,
    document_type: Number,
    website_type: Number,
    file: String,
    name: String,
    created_by: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

const bestFilmCriticSchema = new mongoose.Schema(
  {
    step: { type: Number, default: 1 },
    active_step: { type: Number, default: 1 },
    payment_status: { type: String, default: null },
    status: { type: Number, default: 1 },

    client_id: { type: String, default: null },

    writer_name: {type: String, default: null},
    article_title: {type: String, default: null},
    article_language_id: {
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
    publication_date: { type: Date, default: null },
    publication_name: {type: String, default: null},
    rni: Number,
    rni_registration_no: { type: String, default: null },

    critic_name: {type: String, default: null},
    critic_address: {type: String, default: null},
    critic_contact: {type: String, default: null},
    critic_indian_nationality: { type: Number, default: 1 },
    critic_profile: {type: String, default: null},
    critic_aadhaar_card: { type: String, default: null },

    payment_date: { type: Date, default: null },
    amount: { type: String, default: null },
    reference_number: { type: String, default: null },
    receipt: { type: String, default: null },

    declaration_one: { type: Boolean, default: false },
    declaration_two: { type: Boolean, default: false },
    declaration_three: { type: Boolean, default: false },
    declaration_four: { type: Boolean, default: false },

    // editors: [editorSchema],
    // documents: [documentSchema],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],

    payment_response: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("BestFilmCritic", bestFilmCriticSchema);
