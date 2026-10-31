function GeneralTierList() {
  return (
    <section
      aria-labelledby="general-tier-list-title"
      className="rounded-2xl border border-white/10 bg-[#17211b]/90 p-5 shadow-2xl shadow-black/10 sm:p-7"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="general-tier-list-title" className="text-xl font-semibold">
            General spirit tier list
          </h2>
          <p className="mt-1 text-sm text-[#aeb9ad]">
            Browse the tier list with the original spirit and aspect artwork.
          </p>
        </div>
        <a
          href="https://www.youtube.com/watch?v=LoP2T4GO4xo&list=PL7VhWAfBC-gD1kC48ciT0srwRwWJb4bqA&index=3"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-emerald-200 underline decoration-emerald-200/40 underline-offset-2 hover:text-emerald-100"
        >
          Source video
        </a>
      </div>

      <div
        className="mt-5 overflow-auto rounded-xl border border-white/10"
        tabIndex={0}
        role="region"
        aria-label="Scrollable general spirit tier list"
      >
        <img
          src="/general-tier-list.png"
          alt="General Spirit Island tier list, with spirit and aspect artwork arranged in tiers X, S, A, B, C, D, and F."
          width={640}
          height={416}
          className="block h-auto w-[640px] max-w-none"
        />
      </div>
      <p className="mt-2 text-xs text-[#95a294]">
        Scroll horizontally on small screens, or{' '}
        <a
          href="/general-tier-list.png"
          target="_blank"
          rel="noreferrer"
          className="text-emerald-200 underline decoration-emerald-200/40 underline-offset-2 hover:text-emerald-100"
        >
          open the image full-size
        </a>{' '}
        to zoom in.
      </p>
    </section>
  )
}

export default GeneralTierList
