/**
 * Optimistic write helper shared by the watchlist and favorites tables.
 *
 * 1. cancel any in-flight fetch of the table's query,
 * 2. apply the optimistic change to the cached rows,
 * 3. send the request; on failure apply the inverse change and rethrow,
 * 4. when the last concurrent write for that table settles, invalidate the
 *    table (and the profile counts) once, so rapid toggles never flicker.
 */
import type { QueryClient } from "@tanstack/react-query";
import { userDataKeys } from "./shared";

export type LibraryTable = "watchlist" | "favorites";

const inflight = new Map<string, number>();

export async function runLibraryWrite<Row>(options: {
  queryClient: QueryClient;
  table: LibraryTable;
  userId: string;
  optimistic: (rows: Row[]) => Row[];
  revert: (rows: Row[]) => Row[];
  request: () => Promise<void>;
}): Promise<void> {
  const { queryClient, table, userId, optimistic, revert, request } = options;
  const queryKey = userDataKeys[table](userId);
  const tag = queryKey.join("|");

  inflight.set(tag, (inflight.get(tag) ?? 0) + 1);
  try {
    await queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData<Row[]>(queryKey, (rows) => (rows ? optimistic(rows) : rows));
    try {
      await request();
    } catch (error) {
      queryClient.setQueryData<Row[]>(queryKey, (rows) => (rows ? revert(rows) : rows));
      throw error;
    }
  } finally {
    const remaining = (inflight.get(tag) ?? 1) - 1;
    if (remaining <= 0) {
      inflight.delete(tag);
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: userDataKeys.counts(userId) });
    } else {
      inflight.set(tag, remaining);
    }
  }
}
