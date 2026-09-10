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
 * Common default bedtime tasks for Emma and Sophie.
 */
export const BASE_BEDTIME_TASKS: Task[] = [
  { id: 'medicine', text: 'Take Medicine', color: '#FF7675', emoji: '💊' },
  { id: 'potty', text: 'Go Potty', color: '#4ECDC4', emoji: '🚽' },
  { id: 'pajamas', text: 'Get Pajamas On', color: '#45B7D1', emoji: '👕' },
  { id: 'brush-hair', text: 'Brush Hair', color: '#96CEB4', emoji: '🪮' },
  { id: 'brush-teeth', text: 'Brush Teeth', color: '#FDCB6E', emoji: '🪥' },
];

/**
 * Routine configurations for Emma and Sophie.
 */
export const ROUTINE_CONFIGS: Record<string, KidRoutineConfig> = {
  emma: {
    id: 'emma',
    name: 'Emma',
    avatar: '👱🏼‍♀️',
    avatarColor: '#38BDF8', // Baby Blue
    storagePrefix: 'emma_v4',
    bgColor: 'bg-gradient-to-br from-[#0c243c] via-[#12365c] to-[#1a4a7e]', // Baby Blue Night theme
    defaultTasks: [...BASE_BEDTIME_TASKS],
  },
  sophie: {
    id: 'sophie',
    name: 'Sophie',
    avatar: '👧🏻',
    avatarColor: '#C084FC', // Purple
    storagePrefix: 'sophie_v4',
    bgColor: 'bg-gradient-to-br from-[#2E0854] via-[#3b0764] to-[#4C1D95]', // Purple theme
    defaultTasks: [...BASE_BEDTIME_TASKS],
  },
};
