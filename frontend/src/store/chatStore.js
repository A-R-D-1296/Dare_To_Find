import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  activeChatId: null,
  chats: [], // Each chat has { id, title, created_at, messages: [] }
  isGenerating: false,
  
  setActiveChat: (id) => set({ activeChatId: id }),
  
  setChats: (chats) => set({ chats }),
  
  addMessage: (chatId, message) => set((state) => {
    const updatedChats = state.chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, message]
        };
      }
      return chat;
    });
    // If chat doesn't exist in the list yet, we don't handle it here.
    return { chats: updatedChats };
  }),

  createNewSession: () => {
    const newId = `session_${Date.now()}`;
    const newChat = {
      id: newId,
      title: 'New Legal Query',
      created_at: new Date().toISOString(),
      messages: []
    };
    
    set((state) => ({
      chats: [newChat, ...state.chats],
      activeChatId: newId
    }));
    
    return newId;
  },

  setIsGenerating: (status) => set({ isGenerating: status }),
}));
