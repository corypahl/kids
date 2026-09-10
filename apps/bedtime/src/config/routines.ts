import { Task } from '../types';

export interface KidRoutineConfig {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  storagePrefix: string;
  bgColor: string;
  defaultTasks: Task[];
}

/**
 * Common default tasks shared across routines.
 * Edit, remove, or add tasks here or in the specific kid configs below.
 */
export const BASE_BEDTIME_TASKS: Task[] = [
  { id: 'bathroom', text: 'Go to the Bathroom', color: '#FF6B6B', emoji: '🚽' },
  { id: 'pajamas', text: 'Pajamas', color: '#4ECDC4', emoji: '👕' },
  { id: 'brush-hair', text: 'Brush Hair', color: '#45B7D1', emoji: '🪮' },
  { id: 'brush-teeth', text: 'Brush Teeth', color: '#96CEB4', emoji: '🪥' },
  { id: 'nose-spray', text: 'Nose Spray', color: '#FFEEAD', emoji: '👃' },
];

/**
 * Routine configurations for Emma and Sophie.
 * Modify defaultTasks to add or delete default tasks for each child.
 */
export const ROUTINE_CONFIGS: Record<string, KidRoutineConfig> = {
  emma: {
    id: 'emma',
    name: 'Emma',
    avatar: '👱🏼‍♀️',
    avatarColor: '#38BDF8', // Baby Blue
    storagePrefix: 'emma_v3',
    bgColor: 'bg-gradient-to-br from-[#0c243c] via-[#12365c] to-[#1a4a7e]', // Baby Blue Night theme
    defaultTasks: [
      ...BASE_BEDTIME_TASKS,
      { id: 'clean-ears', text: 'Clean Ears', color: '#D4A5A5', emoji: '👂' },
    ],
  },
  sophie: {
    id: 'sophie',
    name: 'Sophie',
    avatar: '👧🏻',
    avatarColor: '#C084FC', // Purple
    storagePrefix: 'sophie_v3',
    bgColor: 'bg-gradient-to-br from-[#2E0854] via-[#3b0764] to-[#4C1D95]', // Purple theme
    defaultTasks: [
      ...BASE_BEDTIME_TASKS,
      { id: 'lotion', text: 'Lotion', color: '#D4A5A5', emoji: '🧴' },
    ],
  },
};
