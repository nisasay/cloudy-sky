import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WatercolorBackground } from './components/WatercolorBackground';
import { PanelA } from './components/PanelA';
import { PanelB } from './components/PanelB';
import { PanelC } from './components/PanelC';
import { BottomNavBar } from './components/BottomNavBar';
import { HesitationAssistantModal } from './components/HesitationAssistantModal';
import { BudgetConfigModal } from './components/BudgetConfigModal';
import { GlobalProfileModal } from './components/GlobalProfileModal';
import { RainbowIncomeModal } from './components/RainbowIncomeModal';
import { AddWishModal } from './components/AddWishModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { ShakeUndoListener } from './components/ShakeUndoListener';

const AppContent: React.FC = () => {
  const { activePanel } = useApp();

  return (
    <div className="relative min-h-screen text-indigo-950 font-sans antialiased selection:bg-indigo-200 selection:text-indigo-950 overflow-x-hidden">
      {/* Blue-purple watercolor gradient background */}
      <WatercolorBackground />

      {/* Main Canvas Panels */}
      <main className="relative z-10">
        {activePanel === 'A' && <PanelA />}
        {activePanel === 'B' && <PanelB />}
        {activePanel === 'C' && <PanelC />}
      </main>

      {/* Navigation & Modals */}
      <BottomNavBar />
      <HesitationAssistantModal />
      <BudgetConfigModal />
      <GlobalProfileModal />
      <RainbowIncomeModal />
      <AddWishModal />
      <EditTransactionModal />
      <ShakeUndoListener />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
