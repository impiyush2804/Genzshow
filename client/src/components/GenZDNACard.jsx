
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  Clapperboard,
  Heart,
  Sparkles,
  Star,
  Ticket,
  Fingerprint,
  Orbit,
  WandSparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function GenZDNACard() {
  const navigate = useNavigate();

  const { axios, isSignedIn, isAuthLoaded } = useAppContext();

  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoaded) return;

    if (!isSignedIn) {
      setDna(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDNA = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get("/api/movie-dna");

        if (isMounted && data?.success) {
          setDna(data.dna);
        }
      } catch (error) {
        console.error(
          "HOME GENZ DNA ERROR:",
          error?.response?.data || error
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDNA();

    return () => {
      isMounted = false;
    };
  }, [axios, isSignedIn, isAuthLoaded]);

  if (!isAuthLoaded || loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse overflow-hidden rounded-[28px] border border-white/10 bg-[#111119] p-7">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="mt-5 h-9 w-64 rounded bg-white/10" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/10" />

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 rounded-2xl bg-white/5"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!isSignedIn) return null;

  const openDNA = () => navigate("/genz-dna");

  if (!dna) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111119] p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-primary/10 blur-[80px]" />

          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10">
                  <Fingerprint className="h-5 w-5 text-fuchsia-400" />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-400">
                  Your movie identity
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Your taste.
                <span className="text-fuchsia-400"> Your DNA.</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-gray-400 md:text-base">
                Every movie tells us something about you. Discover your
                cinematic personality through your watches, favorites,
                ratings and bookings.
              </p>
            </div>

            <button
              type="button"
              onClick={openDNA}
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-fuchsia-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 transition hover:-translate-y-1 hover:bg-fuchsia-400"
            >
              Discover My DNA
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const genres = Array.isArray(dna.genres)
    ? [...dna.genres]
        .sort(
          (a, b) =>
            Number(b.score || 0) - Number(a.score || 0)
        )
        .slice(0, 3)
    : [];

  const totalGenreScore = genres.reduce(
    (sum, item) => sum + Math.max(0, Number(item.score || 0)),
    0
  );

  const getGenrePercentage = (score) => {
    if (!totalGenreScore) return 0;

    return Math.round(
      (Math.max(0, Number(score || 0)) / totalGenreScore) * 100
    );
  };

  const personality = dna.personality || "The Explorer";
  const description =
    dna.personalityDescription ||
    "Your cinematic personality is constantly evolving.";

  const topGenre = genres[0]?.name || "Explorer";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="group relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#111119] shadow-2xl shadow-black/20">

        {/* BACKGROUND EFFECTS */}
        <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-fuchsia-500/[0.13] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-500/[0.10] blur-[100px]" />

        <div className="relative p-5 sm:p-8 lg:p-10">

          {/* TOP HEADER */}
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-start">

            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 shadow-lg shadow-fuchsia-500/5">
                <Brain className="h-7 w-7 text-fuchsia-400" />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-400">
                    GENZ DNA
                  </span>

                  <span className="flex items-center gap-1 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-2.5 py-1 text-[9px] font-bold tracking-wider text-fuchsia-300">
                    <Sparkles size={11} />
                    AI PERSONALIZED
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {personality}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                  {description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openDNA}
              className="group/button flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10"
            >
              Explore Full DNA
              <ArrowRight
                size={16}
                className="transition-transform group-hover/button:translate-x-1"
              />
            </button>
          </div>

          {/* MAIN GRID */}
          <div className="mt-9 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

            {/* GENRE PROFILE */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">

              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">
                    Cinematic preferences
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-white">
                    Your genre profile
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10">
                  <Orbit className="h-5 w-5 text-fuchsia-400" />
                </div>
              </div>

              {genres.length > 0 ? (
                <div className="space-y-6">
                  {genres.map((genre, index) => {
                    const percentage = getGenrePercentage(genre.score);

                    return (
                      <div key={`${genre.name}-${index}`}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-gray-400">
                              0{index + 1}
                            </span>

                            <span className="text-sm font-semibold text-gray-200">
                              {genre.name}
                            </span>
                          </div>

                          <span className="text-sm font-bold text-fuchsia-300">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-400 transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-36 items-center justify-center text-center text-sm text-gray-500">
                  Keep exploring movies to build your genre profile.
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-5">
                <Clapperboard size={15} className="text-fuchsia-400" />

                <span className="text-xs text-gray-500">
                  Dominant genre:
                </span>

                <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-300">
                  {topGenre}
                </span>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-3">

              <StatCard
                icon={<Clapperboard size={18} />}
                label="Movies Viewed"
                value={dna.totalMovieViews ?? 0}
              />

              <StatCard
                icon={<Heart size={18} />}
                label="Favorites"
                value={dna.totalFavorites ?? 0}
              />

              <StatCard
                icon={<Ticket size={18} />}
                label="Bookings"
                value={dna.totalBookings ?? 0}
              />

              <StatCard
                icon={<Star size={18} />}
                label="Average Rating"
                value={Number(dna.averageRating || 0).toFixed(1)}
              />
            </div>
          </div>

          {/* AI FOOTER */}
          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-fuchsia-500/15 bg-gradient-to-r from-fuchsia-500/[0.07] to-purple-500/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10">
                <WandSparkles size={18} className="text-fuchsia-400" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Your movie identity keeps evolving.
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Explore movies that match your cinematic personality.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/genz-ai")}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-fuchsia-400"
            >
              <Sparkles size={15} />
              Discover with GENZ AI
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="group flex min-h-[125px] flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.04] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-400">
          {label}
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400 transition group-hover:bg-fuchsia-500/20">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {value}
      </p>
    </div>
  );
}
