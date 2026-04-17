export const authStorage = {
  get: () => JSON.parse(localStorage.getItem("userData") || "null"),
  set: (value) => localStorage.setItem("userData", JSON.stringify(value)),
  clear: () => localStorage.removeItem("userData"),
};
