"use client"

import { FlameIcon } from 'lucide-react';
import { ChessBoard } from './components/ChessBoard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-slate-900 text-slate-50 p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlameIcon className="w-8 h-8" />
            AI Chess
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto py-8 flex justify-center">
        <ChessBoard />
      </main>
      
    </div>
  );
}

export default App;