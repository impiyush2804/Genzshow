
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  ArrowRight,
  Film,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";

import BlurCircle from "./BlurCircle";

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);

  // --------------------------------------------------
  // AVAILABLE DATES
  // --------------------------------------------------

  const availableDates = useMemo(() => {
    if (!dateTime || typeof dateTime !== "object") {
      return [];
    }

    return Object.keys(dateTime).sort(
      (a, b) => new Date(a) - new Date(b)
    );
  }, [dateTime]);

  // --------------------------------------------------
  // SELECTED SHOWS
  // --------------------------------------------------

  const selectedShows = selected
    ? Array.isArray(dateTime?.[selected])
      ? dateTime[selected]
      : []
    : [];

  // --------------------------------------------------
  // DATE FORMATTING
  // --------------------------------------------------

  const getDateDetails = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return {
        day: "--",
        month: "N/A",
        weekday: "Unknown",
      };
    }

    return {
      day: parsedDate.getDate(),
      month: parsedDate.toLocaleDateString("en-IN", {
        month: "short",
      }),
      weekday: parsedDate.toLocaleDateString("en-IN", {
        weekday: "short",
      }),
    };
  };

  // --------------------------------------------------
  // TIME FORMATTING
  // --------------------------------------------------

  const getShowTime = (time) => {
    if (!time) return "Time unavailable";

    const parsedTime = new Date(time);

    if (Number.isNaN(parsedTime.getTime())) {
      return "Time unavailable";
    }

    return parsedTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --------------------------------------------------
  // LOCATION FORMATTING
  // --------------------------------------------------

  const getTheatreLocation = (theatre) => {
    const location = theatre?.location;

    // Location is already a readable string
    if (typeof location === "string" && location.trim()) {
      return location;
    }

    // Handle coordinate objects without rendering them
    return (
      theatre?.address ||
      theatre?.city ||
      theatre?.area ||
      ""
    );
  };

  // --------------------------------------------------
  // BOOKING HANDLER
  // --------------------------------------------------

  const handleBook = (show) => {
    const showId =
      show?.showId ||
      show?._id ||
      show?.id;

    const theatreId =
      show?.theatre?._id ||
      show?.theatre?.id ||
      show?.theatreId;

    if (!showId) {
      console.error("Missing show ID:", show);
      toast.error("Show information is missing. Please try again.");
      return;
    }

    if (!theatreId) {
      console.error("Missing theatre ID:", show);
      toast.error("Theatre information is missing. Please try again.");
      return;
    }

    if (!selected || !id) {
      toast.error("Please select a valid date.");
      return;
    }

    const params = new URLSearchParams({
      showId: String(showId),
      theatreId: String(theatreId),
    });

    navigate(
      `/movies/${id}/${encodeURIComponent(selected)}?${params.toString()}`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------

  if (availableDates.length === 0) {
    return (
      <div className="relative overflow-hidden glass-panel rounded-3xl p-8 md:p-12 text-center">
        <BlurCircle top="-100px" left="-100px" />

        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>

          <h3 className="text-xl font-bold mb-2">
            No shows available yet
          </h3>

          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Show timings for this movie haven't been added yet.
            Please check again later.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="relative overflow-hidden">
      <BlurCircle top="-100px" left="-120px" />

      <div className="relative z-10">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <CalendarDays size={16} />

              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Select your schedule
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold">
              Choose a date
            </h3>

            <p className="text-gray-400 text-sm mt-2">
              Pick a date to explore available cinema shows.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 w-fit">
            <Film size={17} className="text-primary" />

            <span className="text-sm text-gray-300">
              {availableDates.length} days available
            </span>
          </div>
        </div>

        {/* DATE SELECTOR */}

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
          {availableDates.map((date) => {
            const details = getDateDetails(date);
            const isSelected = selected === date;

            const numberOfShows = Array.isArray(dateTime?.[date])
              ? dateTime[date].length
              : 0;

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(date)}
                aria-pressed={isSelected}
                className={`relative shrink-0 min-w-[90px] rounded-2xl border p-4 text-center transition-all duration-300 ${
                  isSelected
                    ? "bg-primary border-primary shadow-[0_8px_30px_rgba(229,9,20,0.25)] -translate-y-1"
                    : "bg-white/[0.035] border-white/10 hover:border-primary/50 hover:bg-primary/[0.07]"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isSelected ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {details.weekday}
                </p>

                <p className="text-3xl font-bold mt-2">
                  {details.day}
                </p>

                <p
                  className={`text-xs mt-1 ${
                    isSelected ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {details.month}
                </p>

                <div
                  className={`mt-3 text-[10px] ${
                    isSelected ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {numberOfShows}{" "}
                  {numberOfShows === 1 ? "show" : "shows"}
                </div>

                {isSelected && (
                  <CheckCircle2
                    size={16}
                    className="absolute -top-2 -right-2 bg-white text-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* SHOW LIST */}

        {selected && (
          <div className="mt-8">

            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h4 className="text-xl font-bold">
                  Available shows
                </h4>

                <p className="text-sm text-gray-400 mt-1">
                  Select your preferred cinema and timing.
                </p>
              </div>

              <span className="text-xs px-3 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
                {selectedShows.length} available
              </span>
            </div>

            {selectedShows.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center">
                <Clock3 className="w-8 h-8 text-gray-500 mx-auto mb-3" />

                <h4 className="font-semibold">
                  No shows on this date
                </h4>

                <p className="text-sm text-gray-400 mt-2">
                  Please select another date to see available screenings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {selectedShows.map((show, index) => {
                  const theatreName =
                    show?.theatre?.name ||
                    show?.theatre?.theatre_name ||
                    "Cinema";

                  const theatreLocation =
                    getTheatreLocation(show?.theatre);

                  const showPrice = Number(show?.showPrice);

                  const showId =
                    show?.showId ||
                    show?._id ||
                    show?.id;

                  const theatreId =
                    show?.theatre?._id ||
                    show?.theatre?.id ||
                    show?.theatreId;

                  const canBook = Boolean(showId && theatreId);

                  return (
                    <div
                      key={showId || `${selected}-${index}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] hover:bg-primary/[0.06] hover:border-primary/40 transition-all duration-300"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition" />

                      <div className="p-5 md:p-6">

                        {/* THEATRE INFORMATION */}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3 min-w-0">
                            <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <Film className="w-5 h-5 text-primary" />
                            </div>

                            <div className="min-w-0">
                              <h5 className="font-bold text-base truncate">
                                {theatreName}
                              </h5>

                              {theatreLocation && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <MapPin size={12} />

                                  <span className="truncate">
                                    {theatreLocation}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="shrink-0 text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                            Available
                          </span>
                        </div>

                        {/* SHOW TIMING AND PRICE */}

                        <div className="flex flex-wrap items-center gap-5 mt-6">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                              Show time
                            </p>

                            <div className="flex items-center gap-2 text-primary font-bold">
                              <Clock3 size={16} />
                              {getShowTime(show?.time)}
                            </div>
                          </div>

                          <div className="h-9 w-px bg-white/10" />

                          <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                              Ticket price
                            </p>

                            <div className="flex items-center gap-1 font-bold text-white">
                              <IndianRupee size={15} />

                              {Number.isFinite(showPrice)
                                ? showPrice
                                : "N/A"}

                              <span className="text-xs font-normal text-gray-500">
                                / person
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BOOK BUTTON */}

                        <button
                          type="button"
                          disabled={!canBook}
                          onClick={() => handleBook(show)}
                          className="premium-button w-full mt-6 rounded-xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Ticket size={17} />

                          {canBook
                            ? "Select this show"
                            : "Show information unavailable"}

                          <ArrowRight size={16} />
                        </button>

                        {!canBook && (
                          <p className="text-xs text-red-400 mt-3">
                            Missing show or theatre ID. This screening cannot be booked.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SELECT DATE HINT */}

        {!selected && (
          <div className="mt-7 rounded-2xl border border-dashed border-white/10 p-7 text-center">
            <CalendarDays className="w-8 h-8 text-gray-500 mx-auto mb-3" />

            <p className="text-sm text-gray-400">
              Select a date above to see cinema timings and ticket prices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateSelect;
