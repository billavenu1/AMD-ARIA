import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronDown, 
  Folder, 
  ChevronRight, 
  FileStack, 
  SquarePen, 
  MoreVertical, 
  Pin, 
  Edit2, 
  Trash2, 
  MessageSquare,
  Plus,
  Settings
} from 'lucide-react';
import { useNotebooks, useCreateNotebook, useUpdateNotebook, useDeleteNotebook } from '../../hooks/useNotebooks';
import { useChatSessions, useCreateSession, useUpdateSession, useDeleteSession } from '../../hooks/useChat';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { InlineEdit } from '../ui/InlineEdit';

interface SidebarProps {
  isSidebarCollapsed: boolean;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarCollapsed,
  activeProjectId,
  setActiveProjectId,
  activeChatId,
  setActiveChatId,
  isRightPanelOpen,
  setIsRightPanelOpen,
}) => {
  const { data: projects = [], isLoading: loadingProjects } = useNotebooks();
  const createNotebookMutation = useCreateNotebook();
  const updateNotebookMutation = useUpdateNotebook();
  const deleteNotebookMutation = useDeleteNotebook();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [projectOptionsOpen, setProjectOptionsOpen] = useState<string | null>(null);

  // Rename / Delete state for Projects
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const toggleProjectExpansion = (id: string) => {
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleProjectSelect = (id: string) => {
    setActiveProjectId(id);
    setActiveChatId(null);
  };

  const handleCreateProject = () => {
    const name = prompt("Enter project name:", "New Project");
    if (name) {
      createNotebookMutation.mutate({ name });
    }
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarCollapsed ? 0 : 260, opacity: isSidebarCollapsed ? 0 : 1 }}
      className="flex flex-col bg-[#0F0F0F] border-r border-[#1F1F1F] h-full overflow-visible relative"
    >
      <div className="p-4 flex flex-col gap-6 h-full">
        {/* Logo & Search Area */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-extrabold text-xl uppercase italic">A</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">ARIA</h1>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-[#8B5CF6] transition-colors" />
            <input 
              type="text" 
              placeholder="Search projects & chats"
              className="w-full pl-9 pr-10 py-2 bg-[#1A1A1A] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#333] transition-all placeholder:text-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-2.5 flex items-center justify-center w-4 h-4 border border-[#333] rounded text-[10px] text-gray-600 font-medium font-mono">K</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-visible -mx-2 px-2 space-y-6 pb-32 custom-scrollbar">
          {/* PROJECTS SECTION */}
          <div className="space-y-1">
            <div 
              className="flex items-center justify-between px-2 mb-2 cursor-pointer group"
              onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
            >
              <div className="flex items-center gap-1.5">
                <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isProjectsExpanded ? '' : '-rotate-90'}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Projects</span>
              </div>
            </div>
            
            <AnimatePresence>
              {isProjectsExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  {filteredProjects.map((project) => (
                    <ProjectItem 
                      key={project.id}
                      project={project}
                      activeProjectId={activeProjectId}
                      expandedProjects={expandedProjects}
                      toggleProjectExpansion={toggleProjectExpansion}
                      handleProjectSelect={handleProjectSelect}
                      isRightPanelOpen={isRightPanelOpen}
                      setIsRightPanelOpen={setIsRightPanelOpen}
                      projectOptionsOpen={projectOptionsOpen}
                      setProjectOptionsOpen={setProjectOptionsOpen}
                      activeChatId={activeChatId}
                      setActiveChatId={setActiveChatId}
                      setActiveProjectId={setActiveProjectId}
                      editingProjectId={editingProjectId}
                      setEditingProjectId={setEditingProjectId}
                      setDeletingProjectId={setDeletingProjectId}
                      updateNotebook={(id, data) => updateNotebookMutation.mutate({ id, data })}
                      searchQuery={searchQuery}
                    />
                  ))}
                  <button onClick={handleCreateProject} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-gray-500 hover:text-white hover:bg-[#1A1A1A]/30 rounded-lg transition-all mt-1">
                    <Plus className="w-3 h-3" /> New Project
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* BOTTOM SIDEBAR (User & Settings) */}
        <div className="pt-4 border-t border-[#1F1F1F] flex flex-col gap-3">
          <div className="flex items-center justify-between px-2 mt-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                VG
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white">Venu Gopal</span>
                <span className="text-[10px] text-gray-500 truncate w-24">Pro Member</span>
              </div>
            </div>
            <button className="p-1.5 text-gray-500 hover:text-gray-200 hover:bg-[#1A1A1A] rounded-md transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deletingProjectId}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated chats and data will be permanently removed. This action cannot be undone."
        confirmLabel="Delete Project"
        onConfirm={() => {
          if (deletingProjectId) {
            deleteNotebookMutation.mutate(deletingProjectId);
            if (activeProjectId === deletingProjectId) {
              setActiveProjectId(null);
              setActiveChatId(null);
            }
          }
          setDeletingProjectId(null);
        }}
        onCancel={() => setDeletingProjectId(null)}
      />
    </motion.aside>
  );
};

const ProjectItem = ({ 
  project, 
  activeProjectId, 
  expandedProjects, 
  toggleProjectExpansion, 
  handleProjectSelect,
  isRightPanelOpen,
  setIsRightPanelOpen,
  projectOptionsOpen,
  setProjectOptionsOpen,
  activeChatId,
  setActiveChatId,
  setActiveProjectId,
  editingProjectId,
  setEditingProjectId,
  setDeletingProjectId,
  updateNotebook,
  searchQuery
}) => {
  const { data: projectChats = [] } = useChatSessions(project.id);
  const createSessionMutation = useCreateSession();
  const updateSessionMutation = useUpdateSession();
  const deleteSessionMutation = useDeleteSession();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [chatOptionsOpen, setChatOptionsOpen] = useState<string | null>(null);

  const filteredChats = projectChats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateChat = () => {
    createSessionMutation.mutate({ notebookId: project.id });
    if (!expandedProjects.includes(project.id)) {
      toggleProjectExpansion(project.id);
    }
  };

  return (
    <div className="space-y-0.5">
      <div 
        className={`w-full group flex items-center justify-between px-2 py-1.5 rounded-lg transition-all relative ${
          activeProjectId === project.id 
          ? 'bg-[#1A1A1A] text-white shadow-sm border border-[#333]' 
          : 'text-gray-400 hover:bg-[#1A1A1A]/50 hover:text-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer" onClick={() => handleProjectSelect(project.id)}>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleProjectExpansion(project.id); }}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
          >
            <ChevronRight className={`w-3 h-3 text-gray-500 transition-transform ${expandedProjects.includes(project.id) ? 'rotate-90' : ''}`} />
          </button>
          <Folder className={`w-3.5 h-3.5 flex-shrink-0 ${activeProjectId === project.id ? 'text-[#8B5CF6]' : 'text-gray-500'}`} />
          
          {editingProjectId === project.id ? (
            <InlineEdit
              value={project.name}
              onSave={(newName) => {
                updateNotebook(project.id, { name: newName });
                setEditingProjectId(null);
              }}
              onCancel={() => setEditingProjectId(null)}
              className="flex-1"
            />
          ) : (
            <span className="truncate text-[12px]">{project.name}</span>
          )}
        </div>
        
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsRightPanelOpen(!isRightPanelOpen); if(activeProjectId !== project.id) handleProjectSelect(project.id); }}
            className={`p-1 rounded hover:bg-[#2A2A2A] transition-all ${isRightPanelOpen && activeProjectId === project.id ? 'text-[#8B5CF6]' : 'text-gray-600 hover:text-gray-300'}`}
          >
            <FileStack className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleCreateChat(); }} className="p-1 rounded hover:bg-[#2A2A2A] text-gray-600 hover:text-[#8B5CF6] transition-colors">
            <SquarePen className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setProjectOptionsOpen(projectOptionsOpen === project.id ? null : project.id); }}
              className="p-1 rounded hover:bg-[#2A2A2A] text-gray-600 hover:text-white transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            
            {projectOptionsOpen === project.id && (
              <div className="absolute right-0 mt-1 w-28 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl z-50 overflow-hidden py-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingProjectId(project.id); setProjectOptionsOpen(null); }}
                  className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#2A2A2A] flex items-center gap-2 text-gray-300"
                >
                  <Edit2 className="w-3 h-3" /> Rename
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeletingProjectId(project.id); setProjectOptionsOpen(null); }}
                  className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#2A2A2A] text-red-500 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expandedProjects.includes(project.id) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-8 space-y-0.5 overflow-visible"
          >
             {filteredChats.map(chat => (
               <div key={chat.id} className="relative group/chat flex items-center">
                 <button 
                   onClick={() => { setActiveChatId(chat.id); setActiveProjectId(project.id); }}
                   className={`flex-1 text-left px-2 py-1.5 rounded-md text-[11px] truncate transition-all ${
                     activeChatId === chat.id ? 'bg-[#1A1A1A]/60 text-[#8B5CF6] font-medium' : 'text-gray-500 hover:bg-[#1A1A1A]/30 hover:text-gray-300'
                   }`}
                 >
                   {editingChatId === chat.id ? (
                     <InlineEdit
                       value={chat.title}
                       onSave={(newTitle) => {
                         updateSessionMutation.mutate({ sessionId: chat.id, title: newTitle });
                         setEditingChatId(null);
                       }}
                       onCancel={() => setEditingChatId(null)}
                     />
                   ) : (
                     chat.title
                   )}
                 </button>
                 
                 <div className="absolute right-1 opacity-0 group-hover/chat:opacity-100 transition-opacity">
                   <button 
                     onClick={(e) => { e.stopPropagation(); setChatOptionsOpen(chatOptionsOpen === chat.id ? null : chat.id); }}
                     className="p-1 rounded hover:bg-[#2A2A2A] text-gray-600 hover:text-white transition-colors"
                   >
                     <MoreVertical className="w-3 h-3" />
                   </button>
                   
                   {chatOptionsOpen === chat.id && (
                     <div className="absolute right-0 mt-1 w-24 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl z-50 overflow-hidden py-1">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setEditingChatId(chat.id); setChatOptionsOpen(null); }}
                         className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#2A2A2A] flex items-center gap-2 text-gray-300"
                       >
                         <Edit2 className="w-3 h-3" /> Rename
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setDeletingChatId(chat.id); setChatOptionsOpen(null); }}
                         className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#2A2A2A] text-red-500 flex items-center gap-2"
                       >
                         <Trash2 className="w-3 h-3" /> Delete
                       </button>
                     </div>
                   )}
                 </div>
               </div>
             ))}
             {filteredChats.length === 0 && (
               <div className="px-2 py-1.5 text-[10px] text-gray-600 italic">No chats</div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deletingChatId}
        title="Delete Chat"
        message="Are you sure you want to delete this chat session?"
        confirmLabel="Delete Chat"
        onConfirm={() => {
          if (deletingChatId) {
            deleteSessionMutation.mutate({ sessionId: deletingChatId });
            if (activeChatId === deletingChatId) {
              setActiveChatId(null);
            }
          }
          setDeletingChatId(null);
        }}
        onCancel={() => setDeletingChatId(null)}
      />
    </div>
  );
};
