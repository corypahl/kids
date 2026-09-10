/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Routine from './components/Routine';
import { ROUTINE_CONFIGS } from './config/routines';

export default function App() {
  const { emma, sophie } = ROUTINE_CONFIGS;

  return (
    <div className="min-h-screen bg-[#0B0914] text-white font-sans p-2 md:p-4 flex flex-col items-center">
      <main className="w-full max-w-[1400px] grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 items-stretch flex-1">
        <Routine 
          name={emma.name} 
          avatar={emma.avatar} 
          avatarColor={emma.avatarColor} 
          storagePrefix={emma.storagePrefix} 
          bgColor={emma.bgColor}
          initialTasks={emma.defaultTasks}
        />
        <Routine 
          name={sophie.name} 
          avatar={sophie.avatar} 
          avatarColor={sophie.avatarColor} 
          storagePrefix={sophie.storagePrefix} 
          bgColor={sophie.bgColor}
          initialTasks={sophie.defaultTasks}
        />
      </main>

      {/* Footer */}
      <footer className="mt-8 text-white/40 text-sm font-medium flex items-center gap-3">
        <a href="/" className="hover:text-white/80 transition-colors">← Kids Hub</a>
        <span>•</span>
        <span>Sweet dreams! ✨</span>
      </footer>
    </div>
  );
}
