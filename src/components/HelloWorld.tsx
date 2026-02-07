import { Tv } from 'lucide-react';

export default function HelloWorld() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3">
        <Tv className="w-10 h-10 text-blue-400" />
        <h1 className="text-4xl font-bold">CTV Attribution Path Visualizer</h1>
      </div>
      <p className="text-gray-400 text-lg">
        Project setup complete — Tailwind, Plotly, and Lucide are ready.
      </p>
      <div className="flex gap-4 mt-4">
        <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 text-sm">React + Vite</span>
        <span className="px-3 py-1 rounded-full bg-green-900/50 text-green-300 text-sm">Tailwind CSS</span>
        <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-300 text-sm">Plotly.js</span>
        <span className="px-3 py-1 rounded-full bg-orange-900/50 text-orange-300 text-sm">Lucide Icons</span>
      </div>
    </div>
  );
}
