import { create } from 'zustand';

export interface CopilotAction {
  label: string;
  url: string;
  icon?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'data' | 'action' | 'suggestion';
  data?: Record<string, unknown> | null;
  suggestions?: string[];
  actions?: CopilotAction[];
  timestamp: Date;
}

interface CopilotState {
  isOpen: boolean;
  messages: CopilotMessage[];
  isLoading: boolean;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  addMessage: (msg: Omit<CopilotMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

let messageCounter = 0;

export const useCopilotStore = create<CopilotState>()((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: `msg-${Date.now()}-${++messageCounter}`,
          timestamp: new Date(),
        },
      ],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),
}));
