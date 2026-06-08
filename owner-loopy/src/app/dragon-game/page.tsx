"use client";
import { Gamepad2 } from "lucide-react";

export default function DragonGamePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dragon Game</h1>
        <p className="text-sm text-slate-500 mt-1">Dragon game configuration and management</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Dragon Game</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          The Dragon Game is a fun interactive feature for customers. Configuration and game management options will be available here.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-xl">
          Coming Soon
        </div>
      </div>
    </div>
  );
}
