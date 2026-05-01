import { useEntryByIdQuery } from "./queries/useEntryQueries";

export function useFetchById(endpoint, id, options = {}) {
  return useEntryByIdQuery(endpoint, id, options);
}
