export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">TTI Dashboard</h1>
        <p className="text-gray-400 text-lg">
          Tunstall Services Platform — Operations Dashboard
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-500 text-center">
        <div className="rounded-lg border border-gray-800 px-6 py-4">
          <div className="text-green-400 font-semibold mb-1">Phase 1</div>
          <div>Database layer</div>
        </div>
        <div className="rounded-lg border border-gray-800 px-6 py-4">
          <div className="text-yellow-400 font-semibold mb-1">Phase 2</div>
          <div>API routes</div>
        </div>
        <div className="rounded-lg border border-gray-800 px-6 py-4">
          <div className="text-gray-600 font-semibold mb-1">Phase 3</div>
          <div>React UI migration</div>
        </div>
      </div>
    </main>
  )
}
