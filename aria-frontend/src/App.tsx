import React, { useState } from 'react';
import { NavBar } from './components/layout/NavBar';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { ChatView } from './components/chat/ChatView';
import { DeployAgentsView } from './components/deploy/DeployAgentsView';
import { View, RetrievalMode } from './types';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<View>('chat');
  const [isNavHovered, setIsNavHovered] = useState(false);
  
  // Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  
  // Right Panel / Context State
  const [retrievalMode, setRetrievalMode] = useState<RetrievalMode>('Hybrid');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  return (
    <div className="flex h-screen bg-[#0A0A0A] font-sans text-gray-300 overflow-hidden">
      {/* LEFTMOST ICON NAVIGATION BAR */}
      <NavBar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isNavHovered={isNavHovered}
        setIsNavHovered={setIsNavHovered}
      />

      {currentView === 'chat' ? (
        <>
          {/* LEFT SIDEBAR (PROJECTS & CHATS) */}
          <Sidebar 
            isSidebarCollapsed={isSidebarCollapsed}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            isRightPanelOpen={isRightPanelOpen}
            setIsRightPanelOpen={setIsRightPanelOpen}
          />

          {/* CENTER - CHAT CANVAS */}
          <ChatView 
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            activeProjectId={activeProjectId}
            activeChatId={activeChatId}
            selectedDocIds={selectedDocIds}
          />

          {/* RIGHT PANEL - CONTEXT DRAWER */}
          <RightPanel 
            isRightPanelOpen={isRightPanelOpen}
            setIsRightPanelOpen={setIsRightPanelOpen}
            activeProjectId={activeProjectId}
            retrievalMode={retrievalMode}
            setRetrievalMode={setRetrievalMode}
            selectedDocIds={selectedDocIds}
            setSelectedDocIds={setSelectedDocIds}
          />
        </>
      ) : currentView === 'deploy' ? (
        <DeployAgentsView />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] text-gray-700 text-sm italic font-medium uppercase tracking-[0.2em]">
          Coming Soon: {currentView}
        </div>
      )}
    </div>
  );
}
