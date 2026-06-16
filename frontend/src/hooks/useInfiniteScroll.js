// Hook to trigger loading more content when a sentinel element enters the viewport.
import { useEffect, useRef, useCallback } from "react";

const useInfiniteScroll = ({
  hasMore,
  onLoadMore,
  loading = false,
  threshold = 0.1,
}) => {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const stableOnLoadMore = useCallback(() => {
    onLoadMore();
  }, [onLoadMore]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    if (!hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          stableOnLoadMore();
        }
      },
      { threshold },
    );

    const el = sentinelRef.current;
    if (el) observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, stableOnLoadMore, threshold]);

  return sentinelRef;
};

export default useInfiniteScroll;
