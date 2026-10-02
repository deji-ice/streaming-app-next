export {
  USER_DATA_STALE_TIME,
  idSet,
  mediaKey,
  normalizeMediaType,
  resetUserDataCache,
  useUserId,
  userDataKeys,
} from "./shared";
export type { AnyMediaType, UserMediaType } from "./shared";

export {
  useIsInWatchlist,
  useWatchlistActions,
  useWatchlistItems,
  watchlistQueryOptions,
} from "./watchlist";
export type { AddToWatchlistInput, WatchlistItem, WatchlistMediaType } from "./watchlist";

export {
  favoritesQueryOptions,
  useFavoriteActions,
  useFavoriteItems,
  useIsFavorite,
} from "./favorites";
export type { AddToFavoritesInput, Favorite } from "./favorites";

export {
  ACCOUNT_HISTORY_LIMIT,
  historyQueryOptions,
  localEntryToItem,
  mergeHistory,
  syncLocalHistoryToAccount,
  useHistoryActions,
  useMergedHistory,
  useSyncLocalHistory,
  writeWatchToAccount,
} from "./history";
export type { HistoryMediaType, LogWatchInput, WatchHistoryItem } from "./history";

export {
  countsQueryOptions,
  profileQueryOptions,
  useAccountProfile,
  useUpdateProfile,
  useUserDataCounts,
} from "./profile";
export type { AccountProfile, ProfileUpdate, UserDataCounts } from "./profile";

export {
  MAX_RECOMMENDATION_SEEDS,
  fetchRecommendations,
  recommendationsQueryOptions,
  useRecommendationSeeds,
} from "./recommendations";
export type {
  RecommendationResult,
  RecommendationSeed,
  RecommendationSeedSource,
} from "./recommendations";
