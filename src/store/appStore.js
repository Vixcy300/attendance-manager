import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      darkMode: true, // Default to dark mode
      showCalculator: false,
      showFeedbackForm: false,
      calculatorData: {
        totalClasses: '',
        classesAttended: '',
        targetPercentage: 80,
      },

      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newMode };
      }),

      setShowCalculator: (show) => set({ showCalculator: show }),
      setShowFeedbackForm: (show) => set({ showFeedbackForm: show }),
      
      setCalculatorData: (data) => set((state) => ({
        calculatorData: { ...state.calculatorData, ...data }
      })),

      resetCalculator: () => set({
        calculatorData: {
          totalClasses: '',
          classesAttended: '',
          targetPercentage: 80,
        }
      }),
    }),
    {
      name: 'app-storage',
      onRehydrateStorage: () => (state) => {
        // Apply dark mode on initial load (default to dark)
        if (state?.darkMode !== false) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
