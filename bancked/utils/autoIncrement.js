
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory;

export const addAutoIncrementId = (schema, mongoose, options) => {
  const { fieldName = "seq", prefix = "", counterId, virtualName = "customId" } = options;

  // Auto-increment plugin
  schema.plugin(AutoIncrement(mongoose), {
    id: counterId,
    inc_field: fieldName,
  });

  // Virtual field for formatted ID
  schema.virtual(virtualName).get(function () {
    return prefix + this[fieldName].toString().padStart(3, "0");
  });

  // Ensure virtuals included in API responses
  schema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret[fieldName]; // hide raw sequence
      delete ret?.password;   // hide password if exists
      return ret;
    },
  });
};
