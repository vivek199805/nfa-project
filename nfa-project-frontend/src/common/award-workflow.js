
export const bestBookWorkflow = {
  paymentFormType: "BEST_BOOK",
  paymentDescription: "Best Book on Cinema Registration Payment",
  previewPreviousSection: 4,
};

export const filmCriticWorkflow = {
  paymentFormType: "BEST_FILM_CRITIC",
  paymentDescription: "Best Film Critic Registration Payment",
  previewPreviousSection: 4,
};

const awardWorkflowSteps = {
  first: { current: 1, next: 2 },
  detail: { current: 2, previous: 1, next: 3 },
  publisher: { current: "3", previous: 2, next: 4 },
  declaration: { current: 4, previous: 3, next: 5 },
};

export const getAwardSectionStep = (section) =>
  awardWorkflowSteps[section]?.current;

export const getAwardPreviousSection = (section) =>
  awardWorkflowSteps[section]?.previous;

export const getAwardNextSection = (section) =>
  awardWorkflowSteps[section]?.next;
