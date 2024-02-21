import {create} from 'zustand';
type Settings={
  isOpen:boolean;
  onOpen:()=>void;
  onClose:()=>void;
}

export const useSettings = create<Settings>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));