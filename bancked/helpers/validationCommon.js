export const isNumeric = (val) =>
  !Number.isNaN(Number(val)) && Number(val).toString() === val.toString();

export const isObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(String(val));

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
