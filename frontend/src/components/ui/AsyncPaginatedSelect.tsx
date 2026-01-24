import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from './Input';
import { ScrollArea } from './ScrollArea';
import { cn } from '../../utils/cn';

export type IdLabelOption = { id: string; label: string };

type FetchPageResult = {
  items: IdLabelOption[];
  hasMore: boolean;
};

export interface AsyncPaginatedSelectProps {
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  value: IdLabelOption | null;
  onChange: (value: IdLabelOption | null) => void;
  disabled?: boolean;
  pageSize?: number;
  debounceMs?: number;
  fetchPage: (args: { search: string; page: number; limit: number }) => Promise<FetchPageResult>;
}

export const AsyncPaginatedSelect: React.FC<AsyncPaginatedSelectProps> = ({
  label,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  value,
  onChange,
  disabled,
  pageSize = 10,
  debounceMs = 300,
  fetchPage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  const [items, setItems] = useState<IdLabelOption[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLabel = value?.label ?? '';

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), debounceMs);
    return () => clearTimeout(t);
  }, [search, debounceMs]);

  const loadPage = async (nextPage: number, replace: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPage({ search: debounced, page: nextPage, limit: pageSize });
      setHasMore(res.hasMore);
      setPage(nextPage);
      setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load options');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load / search change (only when open)
  useEffect(() => {
    if (!isOpen) return;
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, debounced]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (!nearBottom) return;
    if (isLoading || !hasMore) return;
    loadPage(page + 1, false);
  };

  const renderValue = useMemo(() => {
    if (selectedLabel) return selectedLabel;
    return placeholder;
  }, [selectedLabel, placeholder]);

  return (
    <div ref={containerRef} className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-left text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
          disabled && 'cursor-not-allowed opacity-50',
          !selectedLabel && 'text-gray-500'
        )}
      >
        <span className="truncate">{renderValue}</span>
        <span className="ml-3 text-gray-500">
          <svg className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} viewBox="0 0 20 20">
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              fill="currentColor"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="relative">
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="p-2 border-b border-gray-100">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
                disabled={disabled}
              />
            </div>

            <ScrollArea onScroll={onScroll} className="max-h-64">
              <div className="py-1">
                {error && (
                  <div className="px-3 py-2 text-sm text-red-600">{error}</div>
                )}

                {!error && items.length === 0 && !isLoading && (
                  <div className="px-3 py-2 text-sm text-gray-500">No results</div>
                )}

                {items.map((opt) => {
                  const active = value?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm hover:bg-gray-50',
                        active && 'bg-primary-50 text-primary-700'
                      )}
                    >
                      <div className="truncate">{opt.label}</div>
                    </button>
                  );
                })}

                {isLoading && (
                  <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
                )}

                {!isLoading && hasMore && items.length > 0 && (
                  <div className="px-3 py-2 text-xs text-gray-400">
                    Scroll to load more…
                  </div>
                )}
              </div>
            </ScrollArea>

            {value && (
              <div className="border-t border-gray-100 p-2">
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

