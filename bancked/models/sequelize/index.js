import { collectionByDelegate, delegateNames } from "../../adapters/shared/modelRegistry.js";

const scalarFieldsByDelegate = {
  user: ["id", "firstName", "lastName", "email", "phone", "address", "pinCode", "aadharNumber", "usertype", "password", "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt"],
  twoAuth: ["id", "userId", "email", "phone", "otp", "isVerified", "otpExpiry", "createdAt", "updatedAt"],
  featureForm: ["id", "step", "film_type", "active_step", "payment_status", "status", "client_id", "film_title_roman", "film_title_devnagri", "film_title_english", "language_id", "english_subtitle", "director_debut", "nom_reels_tapes", "aspect_ratio", "format", "sound_system", "running_time", "color_bw", "film_synopsis", "censor_certificate_nom", "censor_certificate_date", "censor_certificate_file", "title_registratin_detils", "payment_date", "amount", "reference_number", "receipt", "company_reg_details", "company_reg_doc", "original_screenplay_name", "adapted_screenplay_name", "story_writer_name", "work_under_public_domain", "original_work_copy", "dialogue", "cinemetographer", "editor", "costume_designer", "animator", "vfx_supervisor", "stunt_choreographer", "music_director", "special_effect_creator", "shot_digital_video_format", "production_designer", "make_up_director", "choreographer", "return_name", "return_mobile", "return_address", "return_fax", "return_email", "return_pincode", "return_website", "declaration_one", "declaration_two", "declaration_three", "declaration_four", "declaration_five", "declaration_six", "declaration_seven", "declaration_eight", "declaration_nine", "declaration_ten", "declaration_eleven", "declaration_twelve", "non_audiographer", "payment_response", "createdAt", "updatedAt"],
  featureProducer: ["id", "featureFormId", "client_id", "address", "contact_nom", "country_of_nationality", "name", "email", "pincode", "nfa_feature_id", "producer_self_attested_doc", "indian_national", "receive_producer_award", "production_company", "createdAt", "updatedAt"],
  featureDirector: ["id", "featureFormId", "client_id", "nfa_feature_id", "name", "email", "contact_nom", "address", "pincode", "director_self_attested_doc", "receive_director_award", "indian_national", "country_of_nationality", "production_company", "createdAt", "updatedAt"],
  featureActor: ["id", "featureFormId", "client_id", "nfa_feature_id", "actor_category_id", "name", "screen_name", "if_voice_dubbed", "createdAt", "updatedAt"],
  featureSong: ["id", "featureFormId", "client_id", "nfa_feature_id", "song_title", "music_director", "music_director_bkgd_music", "lyricist", "playback_singer_male", "playback_singer_female", "createdAt", "updatedAt"],
  featureAudiographer: ["id", "featureFormId", "client_id", "nfa_feature_id", "production_sound_recordist", "sound_designer", "re_recordist_filnal", "createdAt", "updatedAt"],
  bestBookCinema: ["id", "step", "active_step", "payment_status", "status", "client_id", "author_name", "author_contact", "author_address", "author_nationality_indian", "author_profile", "author_aadhaar_card", "payment_date", "amount", "reference_number", "receipt", "declaration_one", "declaration_two", "declaration_three", "declaration_four", "payment_response", "documents", "createdAt", "updatedAt"],
  bestFilmCritic: ["id", "step", "active_step", "payment_status", "status", "client_id", "writer_name", "article_title", "article_language_id", "publication_date", "publication_name", "rni", "rni_registration_no", "critic_name", "critic_address", "critic_contact", "critic_indian_nationality", "critic_profile", "critic_aadhaar_card", "payment_date", "amount", "reference_number", "receipt", "declaration_one", "declaration_two", "declaration_three", "declaration_four", "documents", "payment_response", "createdAt", "updatedAt"],
  book: ["id", "client_id", "best_book_cinemas_id", "book_title_original", "book_title_english", "english_translation_book", "receive_producer_award", "language_id", "author_name", "page_count", "date_of_publication", "book_price", "createdAt", "updatedAt"],
  editor: ["id", "client_id", "best_book_cinema_id", "best_film_critic_id", "editor_name", "editor_email", "editor_mobile", "editor_landline", "editor_fax", "editor_address", "editor_citizenship", "createdAt", "updatedAt"],
  document: ["id", "context_id", "form_type", "document_type", "website_type", "file", "name", "created_by", "createdAt", "updatedAt"],
  payment: ["id", "client_id", "website_type", "form_type", "context_id", "request_payload", "response_payload", "amount", "gateway", "gateway_order_id", "gateway_payment_id", "gateway_signature", "receipt", "payment_date", "bank_ref_no", "payment_method_type", "currency", "bank_id", "bank_merchant_id", "item_code", "security_type", "security_id", "security_password", "auth_status", "settlement_type", "error_status", "transaction_error_desc", "status", "createdAt", "updatedAt"],
};

const intFields = new Set(["step", "active_step", "status", "website_type", "form_type", "document_type", "isVerified", "indian_national", "receive_producer_award", "actor_category_id", "author_nationality_indian", "rni", "critic_indian_nationality", "bank_id", "bank_merchant_id", "security_id"]);
const boolFields = new Set(["work_under_public_domain", "shot_digital_video_format", "declaration_one", "declaration_two", "declaration_three", "declaration_four", "declaration_five", "declaration_six", "declaration_seven", "declaration_eight", "declaration_nine", "declaration_ten", "declaration_eleven", "declaration_twelve", "receive_director_award", "if_voice_dubbed"]);
const dateFields = new Set(["resetPasswordExpires", "otpExpiry", "censor_certificate_date", "payment_date", "createdAt", "updatedAt", "publication_date", "date_of_publication"]);
const jsonFields = new Set(["language_id", "article_language_id", "documents", "payment_response"]);
const longTextFields = new Set(["request_payload", "response_payload"]);

// Function to return Sequelize column definition
// based on the given field name.
//
// field:
// Name of the database/model field.
//
// DataTypes:
// Sequelize data types object.
const fieldType = (field, DataTypes) => {
  // If field is "id", define it as primary key.
  //
  // Type: STRING
  // Default value: UUID v4
  if (field === "id") return { type: DataTypes.STRING, primaryKey: true, defaultValue: DataTypes.UUIDV4 };
  if (intFields.has(field)) return { type: DataTypes.INTEGER, allowNull: true };
  if (boolFields.has(field)) return { type: DataTypes.BOOLEAN, allowNull: true };
  if (dateFields.has(field)) return { type: DataTypes.DATE, allowNull: true };
  if (jsonFields.has(field)) return { type: DataTypes.JSON, allowNull: true };
  if (longTextFields.has(field)) return { type: DataTypes.TEXT("long"), allowNull: true };
  return { type: DataTypes.STRING, allowNull: true };
};

// Function to create Sequelize models for all registered delegates.
export const createSequelizeModels = (sequelizeClient, DataTypes) =>
  Object.fromEntries(
    delegateNames.map((delegateName) => [
      delegateName,
      sequelizeClient.define(
        delegateName,
        Object.fromEntries(scalarFieldsByDelegate[delegateName].map((field) => [field, fieldType(field, DataTypes)])),
        {
          tableName: collectionByDelegate[delegateName],
          timestamps: true,
        }
      ),
    ])
  );
