import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">IssueFlow Dashboard</h1>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-status-bug">Critical Bugs</h2>
          {/* Bento grid item */}
        </div>
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-status-feature">Latest Suggestions</h2>
          {/* Bento grid item */}
        </div>
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-status-resolved">Project Health</h2>
          {/* Bento grid item */}
        </div>
      </main>
    </div>
  )
}

export default App
