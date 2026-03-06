"use client";

import { useState } from "react";

import { FilterBar, type FilterState } from "@/components/filters/FilterBar";
import { CallAccordion } from "@/components/calls/CallAccordion";
import { useCalls } from "@/hooks/useCalls";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_FILTERS: FilterState = {
  dateRange: undefined,
  agentId: "all",
  sentiment: "all",
  minScore: "0",
};

export default function CallsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const { data, loading, error } = useCalls(filters, page, 10);

  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  return (
    <div className="flex flex-col flex-1">

      <main className="flex-1 p-6 space-y-4">
        <FilterBar
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />

        {error && (
          <p className="text-sm text-destructive">Error loading calls: {error}</p>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {data?.total ?? 0} calls found
            </p>
            <CallAccordion calls={data?.calls ?? []} />
            {data && data.total > 10 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
