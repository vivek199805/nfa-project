export const getFilmEntryByEndpoint = (filmType) =>
  filmType === "feature" ? "film/feature-entry-by" : "film/non-feature-entry-by";

export const getFilmUpdateEndpoint = (filmType) =>
  filmType === "feature" ? "film/feature-update" : "film/non-feature-update";

export const getFilmCreateEndpoint = (filmType) =>
  filmType === "feature" ? "film/feature-create" : "film/non-feature-create";

export const filmFinalSubmitEndpoint = "film/final-submit";

const filmWorkflowSteps = {
  feature: {
    details: { current: "1", next: 2 },
    censor: { current: "2", previous: 1, next: 3 },
    company: { current: "3", previous: 2, next: 4 },
    producer: { current: "4", previous: 3, next: 5 },
    director: { current: "5", previous: 4, next: 6 },
    actor: { current: "6", previous: 5, next: 7 },
    songs: { current: "7", previous: 6, next: 8 },
    audiographer: { current: "8", previous: 7, next: 9 },
    screenplay: { current: "9", previous: 8, next: 10 },
    return: { current: "10", previous: 9, next: 11 },
    declaration: { current: "11", previous: 10, next: 12 },
    payment: { previous: 11 },
  },
  "non-feature": {
    details: { current: "1", next: 2 },
    censor: { current: "2", previous: 1, next: 3 },
    company: { current: "3", previous: 2, next: 4 },
    producer: { current: "4", previous: 3, next: 5 },
    director: { current: "5", previous: 4, next: 6 },
    other: { current: "6", previous: 5, next: 7 },
    return: { current: "7", previous: 6, next: 8 },
    view: { previous: 7, next: 9 },
    declaration: { current: "9", previous: 8, next: 10 },
    payment: { previous: 9 },
  },
};

const getFilmWorkflowSteps = (filmType) =>
  filmWorkflowSteps[filmType] || filmWorkflowSteps["non-feature"];

export const getFilmSectionStep = (filmType, section) =>
  getFilmWorkflowSteps(filmType)[section]?.current;

export const getFilmPreviousSection = (filmType, section) =>
  getFilmWorkflowSteps(filmType)[section]?.previous;

export const getFilmNextSection = (filmType, section) =>
  getFilmWorkflowSteps(filmType)[section]?.next;

export const getFilmPaymentFormType = (filmType) =>
  filmType === "feature" ? "FEATURE" : "NON_FEATURE";

export const getFilmPaymentDescription = (filmType) =>
  filmType === "feature"
    ? "Feature Film Registration Payment"
    : "Non Feature Film Registration Payment";
