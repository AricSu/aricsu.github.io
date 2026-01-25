"use client";

import { useEffect, useMemo, useState } from "react";
import type { SortedResult } from "fumadocs-core/search";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from "fumadocs-ui/components/dialog/search";
import { searchStaticDocs } from "@/lib/search/static-search";

type SearchLink = [name: string, href: string];

function useDebounce<T>(value: T, delayMs = 100): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (delayMs === 0) return;
    const handler = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(handler);
  }, [delayMs, value]);

  if (delayMs === 0) return value;
  return debouncedValue;
}

export function StaticSearchDialog({
  open,
  onOpenChange,
  api = "/search-index.json",
  delayMs = 100,
  links = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api?: string;
  delayMs?: number;
  links?: SearchLink[];
}) {
  const [search, setSearch] = useState("");
  const debouncedValue = useDebounce(search, delayMs);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SortedResult[] | "empty">("empty");

  const defaultItems = useMemo(() => {
    if (links.length === 0) return null;
    return links.map(([name, href]) => ({
      id: name,
      type: "page" as const,
      content: name,
      url: href,
    }));
  }, [links]);

  const items = results !== "empty" ? results : defaultItems;

  useEffect(() => {
    if (debouncedValue.length === 0) {
      setResults("empty");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void searchStaticDocs(debouncedValue, { from: api })
      .then((res) => {
        if (cancelled) return;
        setResults(res);
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, debouncedValue]);

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      search={search}
      onSearchChange={setSearch}
      isLoading={isLoading}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={items} />
      </SearchDialogContent>
      <SearchDialogFooter />
    </SearchDialog>
  );
}
