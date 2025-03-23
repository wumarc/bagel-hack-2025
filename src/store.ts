import { create } from 'zustand';
import { Interest, Event, User } from './types';

interface AppState {
  interests: Interest[];
  selectedInterests: string[];
  events: Event[];
  recommendedUsers: User[];
  setSelectedInterests: (interests: string[]) => void;
  setEvents: (events: Event[]) => void;
  setRecommendedUsers: (users: User[]) => void;
}

export const useStore = create<AppState>((set) => ({
  interests: [
    { id: '1', name: 'Technology' },
    { id: '2', name: 'Music' },
    { id: '3', name: 'Sports' },
    { id: '4', name: 'Art' },
    { id: '5', name: 'Food' },
    { id: '6', name: 'Travel' },
  ],
  selectedInterests: [],
  events: [],
  recommendedUsers: [],
  setSelectedInterests: (interests) => set({ selectedInterests: interests }),
  setEvents: (events) => set({ events }),
  setRecommendedUsers: (users) => set({ recommendedUsers: users }),
}));