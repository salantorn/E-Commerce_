"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "./index";

interface ClientPaginationProps {
  page: number;
  totalPages: number;
}

export function ClientPagination({ page, totalPages }: ClientPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Pagination 
      page={page} 
      totalPages={totalPages} 
      onPageChange={handlePageChange} 
    />
  );
}
