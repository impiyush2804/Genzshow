
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import {
  Play,
  Clapperboard,
  Flame,
  Film,
  ExternalLink,
  Sparkles,
  Youtube,
  ChevronRight,
} from "lucide-react";

import BlurCircle from "./BlurCircle";
import { useAppContext } from "../context/AppContext";

const TrailersSection = () => {
  const { axios } = useAppContext();

  const [activeTab, setActiveTab] = useState("trending");
  const [trendingTrailers, setTrendingTrailers] = useState([]);
  const [nowShowingTrailers, setNowShowingTrailers] = useState([]);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTrailers = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get("/api/show/trailer-collections");

        if (!data?.success) {
          throw new Error(data?.message || "Unable to load trailers.");
        }

        if (!isMounted) return;

        const trending = Array.isArray(data.trending) ? data.trending : [];
        const nowShowing = Array.isArray(data.nowShowing)
          ? data.nowShowing
          : [];

        setTrendingTrailers(trending);
        setNowShowingTrailers(nowShowing);

        const initialTab = trending.length > 0 ? "trending" : "nowShowing";
        const initialTrailer = trending[0] || nowShowing[0] || null;

        setActiveTab(initialTab);
        setSelectedTrailer(initialTrailer);
      } catch (err) {
        console.error("TRAILER SECTION ERROR:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Could not load trailers."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTrailers();

    return () => {
      isMounted = false;
    };
  }, [axios]);

  const currentTrailers =
    activeTab === "trending" ? trendingTrailers : nowShowingTrailers;

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    const trailers =
      tab === "trending" ? trendingTrailers : nowShowingTrailers;

    setSelectedTrailer(trailers[0] || null);
  };

  const handleTrailerSelect = (trailer) => {
    setSelectedTrailer(trailer);
  };

  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-16 lg:px-24 xl:px-44">
      <BlurCircle top="-100px" right="-100px" />

      <div className="relative z-10 mx-auto max-w-[1200px]">

        {/* SECTION HEADER */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                <Clapperboard size={17} className="text-primary" />
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                GENZSHOW ORIGINAL EXPERIENCE
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              The Big Screen
              <span className="text-primary"> Preview.</span>
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400 md:text-base">
              Discover the stories, explore the excitement, and watch the
              trailers before you experience them in theatres.
            </p>
          </div>

          {/* CATEGORY TABS */}
          <div className="flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-xl">
            <button
              onClick={() => handleTabChange("trending")}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                activeTab === "trending"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Flame size={15} />
              Trending
            </button>

            <button
              onClick={() => handleTabChange("nowShowing")}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                activeTab === "nowShowing"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Film size={15} />
              Now Showing
            </button>
          </div>
        </div>

        {/* FEATURED TRAILER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111119] shadow-2xl shadow-black/30">
          <div className="relative aspect-video w-full bg-black">

            {loading ? (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
                <p className="text-sm text-gray-400">
                  Preparing your cinematic experience...
                </p>
              </div>
            ) : selectedTrailer ? (
              <ReactPlayer
                key={selectedTrailer.videoKey || selectedTrailer.id}
                url={selectedTrailer.videoUrl}
                controls
                playing={false}
                width="100%"
                height="100%"
                playsinline
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Clapperboard size={30} className="text-gray-500" />
                </div>

                <h3 className="text-xl font-bold text-white">
                  No trailers available
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
                  {error ||
                    "We couldn't find a trailer for this category yet. Please check again later."}
                </p>

                {!error && (
                  <button
                    onClick={() => handleTabChange(
                      activeTab === "trending" ? "nowShowing" : "trending"
                    )}
                    className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dull"
                  >
                    Explore other trailers
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SELECTED TRAILER INFORMATION */}
          {selectedTrailer && !loading && (
            <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {activeTab === "trending"
                      ? "Trending Trailer"
                      : "Now Showing"}
                  </span>
                </div>

                <h3 className="truncate text-xl font-bold text-white md:text-2xl">
                  {selectedTrailer.title}
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  {selectedTrailer.trailerName || "Official movie trailer"}
                </p>
              </div>

              <a
                href={selectedTrailer.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <Youtube size={17} />
                Watch on YouTube
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        {/* TRAILER COLLECTION */}
        {!loading && currentTrailers.length > 0 && (
          <div className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Sparkles size={15} className="text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Explore Collection
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white md:text-2xl">
                  {activeTab === "trending"
                    ? "Trending Movies"
                    : "Now Playing in Theatres"}
                </h3>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-400">
                {currentTrailers.length} trailers
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {currentTrailers.map((trailer) => {
                const isSelected =
                  selectedTrailer?.id === trailer.id;

                return (
                  <button
                    key={trailer.id || trailer.videoKey}
                    type="button"
                    onClick={() => handleTrailerSelect(trailer)}
                    aria-pressed={isSelected}
                    className={`group overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1.5 ${
                      isSelected
                        ? "border-primary shadow-lg shadow-primary/10"
                        : "border-white/[0.08] bg-[#15151f] hover:border-white/25"
                    }`}
                  >
                    <div className="relative aspect-video overflow-hidden bg-[#171717]">
                      {trailer.thumbnail ? (
                        <img
                          src={trailer.thumbnail}
                          alt={`${trailer.title} trailer`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          <Film size={25} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/10" />

                      <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:bg-primary">
                        <Play size={17} fill="currentColor" />
                      </div>

                      {isSelected && (
                        <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-[9px] font-bold tracking-wider text-white">
                          PLAYING
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {trailer.title}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-gray-500">
                        {trailer.official
                          ? "Official Trailer"
                          : "Movie Trailer"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* EMPTY COLLECTION */}
        {!loading && currentTrailers.length === 0 && selectedTrailer && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <p className="text-sm text-gray-400">
              No more trailers in this collection.
            </p>
          </div>
        )}

        {/* BOTTOM MESSAGE */}
        {!loading && (trendingTrailers.length > 0 || nowShowingTrailers.length > 0) && (
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>Made for movie lovers</span>
            <span className="text-primary">•</span>
            <span>Powered by GENZSHOW</span>
            <ChevronRight size={13} className="text-primary" />
          </div>
        )}
      </div>
    </section>
  );
};

export default TrailersSection;
