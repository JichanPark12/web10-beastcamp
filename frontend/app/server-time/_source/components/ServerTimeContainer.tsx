"use client";

import { useState } from "react";
import { TICKETING_SITES } from "@/constants/ticketingSites";
import { ServerTimeCard } from "./ServerTimeCard";

export function ServerTimeContainer() {
  const [selectedSiteId, setSelectedSiteId] = useState(TICKETING_SITES[0].id);
  const selectedSite =
    TICKETING_SITES.find((s) => s.id === selectedSiteId) || TICKETING_SITES[0];

  return (
    <>
      <div className="flex p-1 gap-1 bg-white rounded-2xl border border-gray-200 shadow-sm mx-auto max-w-lg mb-8">
        {TICKETING_SITES.map((site) => {
          const isSelected = selectedSiteId === site.id;
          return (
            <button
              type="button"
              key={site.id}
              onClick={() => setSelectedSiteId(site.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                isSelected
                  ? "bg-purple-600 text-white shadow-md transform scale-[1.02]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {site.name}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <ServerTimeCard key={selectedSite.id} site={selectedSite} />
      </div>
    </>
  );
}
