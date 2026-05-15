export const delegateNames = [
  "user",
  "twoAuth",
  "featureForm",
  "featureProducer",
  "featureDirector",
  "featureActor",
  "featureSong",
  "featureAudiographer",
  "bestBookCinema",
  "bestFilmCritic",
  "book",
  "editor",
  "document",
  "payment",
];

export const collectionByDelegate = {
  user: "users",
  twoAuth: "twoauths",
  featureForm: "featureforms",
  featureProducer: "featureproducers",
  featureDirector: "featuredirectors",
  featureActor: "featureactors",
  featureSong: "featuresongs",
  featureAudiographer: "featureaudiographers",
  bestBookCinema: "bestbookcinemas",
  bestFilmCritic: "bestfilmcritics",
  book: "books",
  editor: "editors",
  document: "documents",
  payment: "payments",
};

export const featureContributorRelations = {
  producers: "featureProducer",
  directors: "featureDirector",
  actors: "featureActor",
  songs: "featureSong",
  audiographer: "featureAudiographer",
};

export const featureContributorRelationFields = Object.keys(featureContributorRelations);
