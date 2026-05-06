export const apiConfig = {
  // auth endpoints
  auth: {
    login: "user/login",
    register: "user/register",
    verifyEmail: "user/verify-email",
    forgotPassword: "user/forgot-password",
    verifyOtp: "user/verify-otp",
    resendOtp: "user/resend-otp",
    resetPassword: "user/reset-password",
    changePassword: "user/change-password",
  },

  // common endpoints
  common: {
    languages: "get-languages",
  },

  // dashboard endpoints
  dashboard: {
    entryList: "/entry-list",
  },

  // payment endpoints
  payment: {
    order: "payment/order",
    verify: "payment/verify",
  },

  // award child endpoints
  awardChild: {
    book: {
      list: "list-book",
      store: "store-book",
      update: "update-book",
      delete: "delete-book",
    },
    editor: {
      list: "list-editor",
      store: "store-editor",
      update: "update-editor",
      delete: "delete-editor",
    },
  },

  // award entry endpoints
  filmCritic: {
    entryBy: "best-film-critic-entry-by",
    create: "create-entry",
    update: "update-entry",
    finalSubmit: "best-film-critic-final-submit",
  },

  bestBook: {
    entryBy: "best-book-cinema-entry-by",
    create: "best-book-cinema-entry",
    update: "best-book-cinema-update",
    finalSubmit: "best-book-cinema-final-submit",
  },

  // film child endpoints
  filmChild: {
    producer: {
      list: "film/producer-list",
      store: "film/store-producer",
      delete: "film/delete-producer",
    },
    director: {
      list: "film/director-list",
      store: "film/store-director",
      delete: "film/delete-director",
    },
    actor: {
      list: "film/actor-list",
      store: "film/store-actor",
      delete: "film/delete-actor",
    },
    song: {
      list: "film/song-list",
      store: "film/store-song",
      delete: "film/delete-song",
    },
    audiographer: {
      list: "film/audiographer-list",
      store: "film/store-audiographer",
      delete: "film/delete-audiographer",
    },
  },
};

export const publicAuthEndpointSuffixes = [
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
];

export const isPublicApiEndpoint = (url = "") =>
  publicAuthEndpointSuffixes.some((endpoint) => url.endsWith(endpoint));
