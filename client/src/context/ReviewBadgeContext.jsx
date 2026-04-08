import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getTrainerStats } from "../api/dashboard";

const ReviewBadgeContext = createContext();

export function ReviewBadgeProvider({ children }) {
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState(0);
  const [loadingPendingReviews, setLoadingPendingReviews] = useState(false);

  const refreshPendingReviews = useCallback(async () => {
    if (user?.role !== "trainer" && user?.role !== "admin") {
      setPendingReviews(0);
      return;
    }

    try {
      setLoadingPendingReviews(true);
      const { data } = await getTrainerStats();

      if (data?.success) {
        setPendingReviews(data?.data?.pendingReviews || 0);
      }
    } catch (err) {
      console.error("REFRESH PENDING REVIEWS ERROR:", err);
    } finally {
      setLoadingPendingReviews(false);
    }
  }, [user]);

  useEffect(() => {
    refreshPendingReviews();
  }, [refreshPendingReviews]);

  const value = useMemo(
    () => ({
      pendingReviews,
      loadingPendingReviews,
      refreshPendingReviews,
      setPendingReviews,
    }),
    [pendingReviews, loadingPendingReviews, refreshPendingReviews]
  );

  return (
    <ReviewBadgeContext.Provider value={value}>
      {children}
    </ReviewBadgeContext.Provider>
  );
}

export function useReviewBadge() {
  return useContext(ReviewBadgeContext);
}