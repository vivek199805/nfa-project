import { apiConfig } from "../services/apiEndpoints";
import { getFilmEntryByEndpoint } from "./film-workflow";

export const entryWorkflowTypes = [
  "feature",
  "non-feature",
  "bestBooks",
  "bestFilmCritic",
];

export const entryWorkflowMeta = {
  feature: {
    label: "Feature",
    route: "feature",
    viewType: "feature",
    entryBy: getFilmEntryByEndpoint("feature"),
    viewPath: "/feature/view/",
  },
  "non-feature": {
    label: "Non-Feature",
    route: "non-feature",
    viewType: "non-feature",
    entryBy: getFilmEntryByEndpoint("non-feature"),
    viewPath: "/non-feature/view/",
  },
  bestBooks: {
    label: "Best Book on Cinema",
    route: "best-book",
    viewType: "best-book",
    entryBy: apiConfig.bestBook.entryBy,
    viewPath: "/best-book/view/",
  },
  bestFilmCritic: {
    label: "Best Critic on Cinema",
    route: "film-critic",
    viewType: "film-critic",
    entryBy: apiConfig.filmCritic.entryBy,
    viewPath: "/film-critic/view/",
  },
};

export const getEntryWorkflowMeta = (type) => entryWorkflowMeta[type];

export const getDashboardEntryPath = (type, id, isPaid) => {
  const meta = getEntryWorkflowMeta(type);
  if (!meta) return "";

  return isPaid ? `/${meta.route}/view/${id}` : `/${meta.route}/${id}`;
};

export const resolveViewWorkflowFromPath = (pathname = "") => {
  const match = Object.values(entryWorkflowMeta).find((meta) =>
    pathname.includes(meta.viewPath),
  );

  return match || entryWorkflowMeta.feature;
};
