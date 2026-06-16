/**
 * useInfiniteScroll — attaches an IntersectionObserver to a sentinel element.
 * When the sentinel enters the viewport, calls `onLoadMore` if `hasMore` is true.
 *
 * Usage:
 *   const sentinelRef = useInfiniteScroll({ hasMore, onLoadMore, loading });
 *   <div ref={sentinelRef} />
 *
 * For upward scroll (chat history), place the sentinel at the TOP of the list.
 * For downward scroll (feed), place it at the BOTTOM.
 */
import { useEffect, useRef, useCallback } from "react";

const useInfiniteScroll = ({ hasMore, onLoadMore, loading = false, threshold = 0.1 }) => {
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const stableOnLoadMore = useCallback(onLoadMore, []);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    if (!hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          stableOnLoadMore();
        }
      },
      { threshold }
    );

    const el = sentinelRef.current;
    if (el) observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, stableOnLoadMore, threshold]);

  return sentinelRef;
};

export default useInfiniteScroll;
