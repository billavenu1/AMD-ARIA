import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PanelRightClose, 
  FileText, 
  ToggleRight, 
  ToggleLeft, 
  AudioLines, 
  Network,
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  Loader2,
  CloudUpload,
  File as FileIcon,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useSources, useUploadSource, useUploadMultipleSources, useAddLinkSource, useDeleteSource } from '../../hooks/useSources';
import { Source } from '../../types';
import { AudioOverviewModal } from '../podcast/AudioOverviewModal';

interface RightPanelProps {
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
  activeProjectId: string | null;
  selectedDocIds: string[];
  setSelectedDocIds: React.Dispatch<React.SetStateAction<string[]>>;
}

/** Small status badge for sources that are still processing */
const StatusBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  if (!status || status === 'completed') return null;

  const map: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    new:      { icon: <Loader2 className="w-2.5 h-2.5 animate-spin" />, color: 'text-blue-400',    label: 'Queued' },
    queued:   { icon: <Loader2 className="w-2.5 h-2.5 animate-spin" />, color: 'text-blue-400',    label: 'Queued' },
    running:  { icon: <Loader2 className="w-2.5 h-2.5 animate-spin" />, color: 'text-amber-400',   label: 'Processing' },
    failed:   { icon: <AlertCircle className="w-2.5 h-2.5" />,         color: 'text-red-400',      label: 'Failed' },
  };
  const info = map[status] ?? map['new'];
  return (
    <span className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider ${info.color}`}>
      {info.icon}
    </span>
  );
};

export const RightPanel: React.FC<RightPanelProps> = ({
  isRightPanelOpen,
  setIsRightPanelOpen,
  activeProjectId,
  selectedDocIds,
  setSelectedDocIds,
}) => {
  const { data: sources = [], isLoading } = useSources(activeProjectId);
  const uploadMutation = useUploadSource(activeProjectId);
  const multiUploadMutation = useUploadMultipleSources(activeProjectId);
  const addLinkMutation = useAddLinkSource(activeProjectId);
  const deleteMutation = useDeleteSource(activeProjectId);

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // ---- Sync selectedDocIds with available sources ----
  React.useEffect(() => {
    if (sources.length > 0) {
      const ids = new Set(sources.map(s => s.id));
      setSelectedDocIds(prev => prev.filter(id => ids.has(id)));
    }
  }, [sources, setSelectedDocIds]);

  // ---- Selection helpers ----
  const toggleDocSelection = (id: string) =>
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );

  const toggleAll = () => {
    if (selectedDocIds.length === sources.length) setSelectedDocIds([]);
    else setSelectedDocIds(sources.map(s => s.id));
  };

  // ---- File upload helpers ----
  const handleFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    if (list.length === 1) {
      uploadMutation.mutate(list[0]);
    } else {
      multiUploadMutation.mutate(list);
    }
  }, [uploadMutation, multiUploadMutation]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      setIsAddMenuOpen(false);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleAddLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      addLinkMutation.mutate(url);
      setIsAddMenuOpen(false);
    }
  };

  // ---- Drag & Drop ----
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const isUploading = uploadMutation.isPending || multiUploadMutation.isPending;

  return (
    <AnimatePresence>
      {isRightPanelOpen && activeProjectId && (
        <motion.aside 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="flex flex-col bg-[#0F0F0F] border-l border-[#1F1F1F] h-full overflow-visible"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          <AnimatePresence>
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0F0F0F]/90 border-2 border-dashed border-[#8B5CF6] rounded-xl m-2 pointer-events-none"
              >
                <CloudUpload className="w-10 h-10 text-[#8B5CF6] mb-2" />
                <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-widest">Drop files here</span>
                <span className="text-[10px] text-gray-500 mt-1">PDF, DOCX, TXT, and more</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 flex flex-col h-full space-y-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                 <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Sources</span>
              </div>
              <button 
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 text-gray-600 hover:text-white transition-colors"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Files list */}
            <div className="flex-1 flex flex-col space-y-3 overflow-visible">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                  Files ({isLoading ? '...' : sources.length})
                </span>
                <div className="flex items-center gap-2">
                  {sources.length > 0 && (
                    <button 
                      onClick={toggleAll}
                      className="text-[9px] text-[#8B5CF6] hover:underline font-bold uppercase"
                    >
                      {selectedDocIds.length === sources.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  <div className="relative">
                    <button 
                      onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                      className="p-1 text-gray-400 hover:text-white bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    {isAddMenuOpen && (
                      <div className="absolute right-0 mt-1 w-36 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl z-50 overflow-hidden py-1">
                        <label className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#2A2A2A] flex items-center gap-2 text-gray-300 cursor-pointer">
                          <Upload className="w-3 h-3" /> Upload Files
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            multiple
                            onChange={handleFileInputChange} 
                          />
                        </label>
                        <button onClick={handleAddLink} className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#2A2A2A] flex items-center gap-2 text-gray-300">
                          <LinkIcon className="w-3 h-3" /> Add Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Upload progress indicator */}
              {isUploading && (
                <div className="flex items-center gap-2 px-2 py-2 bg-[#1A1A1A] border border-[#333] rounded-xl animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 text-[#8B5CF6] animate-spin flex-shrink-0" />
                  <span className="text-[10px] text-gray-400 font-medium">Uploading...</span>
                </div>
              )}

              {/* Sources list */}
              <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1 custom-scrollbar">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                  </div>
                ) : sources.length === 0 ? (
                  <div 
                    className="flex flex-col items-center justify-center py-10 text-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-dashed border-[#333] group-hover:border-[#8B5CF6] flex items-center justify-center mb-3 transition-colors">
                      <CloudUpload className="w-5 h-5 text-gray-600 group-hover:text-[#8B5CF6] transition-colors" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">No sources yet</span>
                    <span className="text-[9px] text-gray-600 mt-0.5">Drag & drop or click to upload</span>
                  </div>
                ) : (
                  sources.map((doc) => (
                    <div 
                      key={doc.id}
                      className={`group w-full flex items-center justify-between p-2 rounded-xl transition-all border ${
                        selectedDocIds.includes(doc.id) 
                          ? 'bg-[#1A1A1A] border-[#333]' 
                          : 'bg-transparent border-transparent opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <FileText className={`w-3.5 h-3.5 ${selectedDocIds.includes(doc.id) ? 'text-blue-400' : 'text-gray-600'}`} />
                          {doc.status && doc.status !== 'completed' && (
                            <div className="absolute -top-0.5 -right-0.5">
                              <StatusBadge status={doc.status} />
                            </div>
                          )}
                        </div>
                        <span 
                          className={`text-[10px] truncate ${
                            selectedDocIds.includes(doc.id) ? 'text-gray-200 font-medium' : 'text-gray-500'
                          }`}
                          title={doc.title || 'Processing...'}
                        >
                          {doc.title || 'Processing...'}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button 
                          onClick={() => toggleDocSelection(doc.id)}
                          className={`flex items-center transition-all ${
                            selectedDocIds.includes(doc.id) ? 'text-[#8B5CF6]' : 'text-gray-700 hover:text-gray-500'
                          }`}
                        >
                          {selectedDocIds.includes(doc.id) 
                            ? <ToggleRight className="w-5 h-5" /> 
                            : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => {
                             if(confirm('Delete this source?')) {
                               deleteMutation.mutate(doc.id);
                             }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-red-500 hover:bg-red-500/10 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="space-y-4 mt-auto">

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setIsAudioModalOpen(true)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#131313] border border-[#1F1F1F] hover:bg-[#1A1A1A] hover:border-[#333] transition-all text-center group"
                >
                  <AudioLines className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Audio Overview</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#131313] border border-[#1F1F1F] hover:bg-[#1A1A1A] hover:border-[#333] transition-all text-center group">
                  <FileText className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Reports</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#131313] border border-[#1F1F1F] hover:bg-[#1A1A1A] hover:border-[#333] transition-all text-center group">
                  <Network className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Mind Map</span>
                </button>
              </div>
            </div>
          </div>

          <AudioOverviewModal 
            isOpen={isAudioModalOpen} 
            onClose={() => setIsAudioModalOpen(false)}
            selectedDocIds={selectedDocIds}
            activeProjectId={activeProjectId}
            sources={sources}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
