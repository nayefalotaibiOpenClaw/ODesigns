"use client";
import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  onLoadMore: () => void;
  canLoadMore: boolean;
  isLoading: boolean;
}

export default function InfiniteScrollSentinel({ onLoadMore, canLoadMore, isLoading }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const stableLoadMore = useRef(onLoadMore);
  stableLoadMore.current = onLoadMore;
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const handleIntersect = useCallback(([entry]: IntersectionObserverEntry[]) => {
    if (entry.isIntersecting && !isLoadingRef.current) {
      isLoadingRef.current = true; // prevent duplicate calls before React re-renders
      stableLoadMore.current();
    }
  }, []);

  useEffect(() => {
    if (!canLoadMore || isLoading) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: "400px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [canLoadMore, isLoading, handleIntersect]);

  if (!canLoadMore && !isLoading) return null;

  return (
    <div ref={ref} className="col-span-full flex items-center justify-center py-6">
      {isLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
    </div>
  );
}
