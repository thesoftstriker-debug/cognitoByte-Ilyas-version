"use client";
import { useRouter, usePathname } from "next/navigation";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

export default function BlogSortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (sort: string) => {
    const params = new URLSearchParams();
    if (sort !== "new") params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
      {value === "old" ? (
        <ArrowUpAZ className="w-4 h-4 text-brand-500" />
      ) : (
        <ArrowDownAZ className="w-4 h-4 text-brand-500" />
      )}
      <select
        aria-label="Sort blog posts"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent outline-none cursor-pointer text-sm font-medium text-gray-700"
      >
        <option value="new">Newest first</option>
        <option value="old">Oldest first</option>
      </select>
    </div>
  );
}
