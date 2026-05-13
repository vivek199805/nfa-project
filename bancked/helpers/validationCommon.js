export const isNumeric = (val) =>
  !Number.isNaN(Number(val)) && Number(val).toString() === val.toString();

export const isObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(String(val));

export const isUuid = (val) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(val));

export const isRecordId = (val) => isObjectId(val) || isUuid(val);

export const formatZodErrors = (issues) =>
  issues.reduce(
    (errors, issue) => ({
      ...errors,
      [issue.path[0]]: issue.message,
    }),
    {}
  );

export const parseZodResult = (result) => ({
  isValid: result.success,
  errors: result.success ? {} : formatZodErrors(result.error.issues),
});

export const parseZodResultWithData = (result) => ({
  ...parseZodResult(result),
  data: result.success ? result.data : null,
});
