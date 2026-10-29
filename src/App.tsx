function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#101814] text-[#f2f4ed]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-48 size-[28rem] rounded-full bg-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-56 -right-32 size-[32rem] rounded-full bg-[#536b48]/10 blur-3xl" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-6 sm:px-8">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full border border-emerald-100/15"
        >
          <span className="size-2 rounded-full bg-emerald-300" />
        </span>
        <p className="text-sm font-medium tracking-wide text-[#d9e1d5]">
          Spirit Island Companion
        </p>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100svh-81px)] w-full max-w-6xl items-center px-6 pb-20 pt-10 sm:px-8">
        <section aria-labelledby="page-title" className="max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
            A field guide for your next game
          </p>
          <h1
            id="page-title"
            className="text-5xl font-semibold leading-[1.05] tracking-tight text-[#f2f4ed] sm:text-6xl md:text-7xl"
          >
            Spirit Island
            <br />
            Companion
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#b8c2b7] sm:text-xl">
            Your companion for choosing your next spirit.
          </p>
          <div className="mt-9 inline-flex items-center gap-2.5 rounded-full border border-emerald-200/15 bg-emerald-950/40 px-4 py-2 text-sm text-[#dce8da]">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-emerald-300"
            />
            <span>Setup complete</span>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
