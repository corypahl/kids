/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Moon } from 'lucide-react';
import Routine from './components/Routine';
import { Task } from './types';

const BASE_TASKS: Task[] = [
  { id: '1', text: 'Go to the Bathroom', color: '#FF6B6B', emoji: '🚽' },
  { id: '2', text: 'Pajamas', color: '#4ECDC4', emoji: '👕' },
  { id: '3', text: 'Brush Hair', color: '#45B7D1', emoji: '🪮' },
  { id: '4', text: 'Brush Teeth', color: '#96CEB4', emoji: '🪥' },
  { id: '5', text: 'Nose Spray', color: '#FFEEAD', emoji: '👃' },
];

const EMMA_TASKS: Task[] = [
  ...BASE_TASKS,
  { id: '6', text: 'Clean Ears', color: '#D4A5A5', emoji: '👂' },
];

const SOPHIE_TASKS: Task[] = [
  ...BASE_TASKS,
  { id: '6', text: 'Lotion', color: '#D4A5A5', emoji: '🧴' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0914] text-white font-sans p-2 md:p-4 flex flex-col items-center">
      <main className="w-full max-w-[1400px] grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 items-stretch flex-1">
        <Routine 
          name="Emma" 
          avatar="👱🏼‍♀️" 
          avatarColor="#A29BFE" 
          storagePrefix="emma_v2" 
          bgColor="bg-gradient-to-br from-[#2E0854] to-[#4C1D95]"
          initialTasks={EMMA_TASKS}
        />
        <Routine 
          name="Sophie" 
          avatar="👧🏻" 
          avatarColor="#FF9FF3" 
          storagePrefix="sophie_v2" 
          bgColor="bg-gradient-to-br from-[#4A0424] to-[#9D174D]"
          initialTasks={SOPHIE_TASKS}
        />
      </main>

      {/* Footer */}
      <footer className="mt-8 text-white/30 text-sm font-medium">
        Sweet dreams! ✨
      </footer>
    </div>
  );
}

