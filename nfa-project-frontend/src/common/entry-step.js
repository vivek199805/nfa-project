export const getResumeStep = (activeStep, totalSteps) => {
  const step = +activeStep;
  return step < totalSteps ? step + 1 : totalSteps;
};
