import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory;

export const addAutoIncrementId = (schema, mongoose, options) => {
  const { fieldName = "seq", prefix = "", counterId, virtualName = "customId" } = options;

  schema.plugin(AutoIncrement(mongoose), {
    id: counterId,
    inc_field: fieldName,
  });

  schema.virtual(virtualName).get(function () {
    const seqValue = this[fieldName] ?? 0;
    return prefix + String(seqValue).padStart(3, "0");
  });

  schema.set("toJSON", {
    virtuals: true,
    transform: function (_, ret) {
      delete ret[fieldName];
      delete ret?.password;
      return ret;
    },
  });
};
