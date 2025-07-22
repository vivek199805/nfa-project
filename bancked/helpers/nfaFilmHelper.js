import { z } from "zod";

const isNumeric = (val) =>
  !isNaN(Number(val)) && Number(val).toString() === val.toString();

const isObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);

const lastIdSchema = z.object({
  id: z.union([z.string(), z.number()]).refine((val) => {
    if (typeof val === "number") return true;
    if (typeof val === "string") {
      return isNumeric(val) || isObjectId(val);
    }
    return false;
  }, {
    message: "ID must be a number or a valid MongoDB ObjectId.",
  }),
});

const baseStepSchema = z.object({
  step: z.string().refine((val) => !isNaN(val), {
    message: "Step is required and must be a number.",
  }),
});

const finalSubmitStep = (payload) => {
  const schema = lastIdSchema;
  const result = schema.safeParse(payload);
  // return {
  //   isValid: parsed.success,
  //   errors: parsed.success
  //     ? {}
  //     : Object.fromEntries(
  //         Object.entries(parsed.error.flatten().fieldErrors).filter(
  //           ([_, messages]) => messages?.length
  //         )
  //       ),
  // };

    return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce((acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }), {}),
  };
};

export default {
  finalSubmitStep,
};