function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          SupportDesk Pro
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Frontend rebuild started
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Tailwind, Vite, React, and the API proxy are now ready. Next we will build
          the app shell: routing, layouts, sidebar, and protected pages.
        </p>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Current step</p>
          <p className="mt-2 text-xl font-semibold">Project foundation</p>
        </div>
      </section>
    </main>
  );
}

export default App;