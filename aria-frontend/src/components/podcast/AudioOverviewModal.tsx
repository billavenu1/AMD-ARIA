import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AudioLines, Loader2, Play, Pause, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEpisodeProfiles, useSpeakerProfiles, useGeneratePodcast, usePodcastJobStatus } from '../../hooks/usePodcast';

interface AudioOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocIds: string[];
  activeProjectId: string | null;
  sources?: any[]; // kept for compatibility but unused now
}

export const AudioOverviewModal: React.FC<AudioOverviewModalProps> = ({
  isOpen,
  onClose,
  selectedDocIds,
  activeProjectId,
  sources
}) => {
  const { data: episodeProfiles = [] } = useEpisodeProfiles();
  const { data: speakerProfiles = [] } = useSpeakerProfiles();
  const generateMutation = useGeneratePodcast();
  
  const [selectedEpisodeProfile, setSelectedEpisodeProfile] = useState('');
  const [selectedSpeakerProfile, setSelectedSpeakerProfile] = useState('');
  const [episodeName, setEpisodeName] = useState('New Audio Overview');
  const [jobId, setJobId] = useState<string | null>(null);
  const [isFetchingContent, setIsFetchingContent] = useState(false);

  const { data: jobStatus } = usePodcastJobStatus(jobId);

  // Auto-select first profiles if available
  React.useEffect(() => {
    if (episodeProfiles.length > 0 && !selectedEpisodeProfile) {
      setSelectedEpisodeProfile(episodeProfiles[0].name);
    }
    if (speakerProfiles.length > 0 && !selectedSpeakerProfile) {
      setSelectedSpeakerProfile(speakerProfiles[0].name);
    }
  }, [episodeProfiles, speakerProfiles]);

  const handleGenerate = async () => {
    if (!activeProjectId || selectedDocIds.length === 0) return;

    setIsFetchingContent(true);
    try {
      // Fetch full text for each selected source individually
      // (The list endpoint omits full_text for performance)
      const contentParts: string[] = [];
      for (const sourceId of selectedDocIds) {
        try {
          const res = await import('../../lib/api/client').then(m => m.default.get(`/sources/${sourceId}`));
          const fullText = res.data?.full_text || '';
          if (fullText) contentParts.push(fullText);
        } catch (e) {
          console.warn(`Could not fetch content for source ${sourceId}:`, e);
        }
      }

      const content = contentParts.join('\n\n---\n\n');

      if (!content.trim()) {
        alert("Sources are selected but have no text content yet. They may still be processing — please wait a moment and try again.");
        return;
      }

      const result = await generateMutation.mutateAsync({
        episode_profile: selectedEpisodeProfile,
        speaker_profile: selectedSpeakerProfile,
        episode_name: episodeName,
        content: content,
        notebook_id: activeProjectId
      });
      setJobId(result.job_id);
    } catch (err) {
      console.error("Failed to start podcast generation:", err);
    } finally {
      setIsFetchingContent(false);
    }
  };

  const isProcessing = jobStatus?.status === 'running' || jobStatus?.status === 'submitted';
  const isCompleted = jobStatus?.status === 'completed';
  const isFailed = jobStatus?.status === 'failed' || jobStatus?.status === 'error';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-[#111] border border-[#222] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <AudioLines className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Audio Overview</h3>
                  <p className="text-xs text-gray-500">Generate a conversational podcast from your sources</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {!jobId ? (
                /* Setup Form */
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Episode Name</label>
                    <input 
                      type="text" 
                      value={episodeName}
                      onChange={(e) => setEpisodeName(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Format</label>
                      <select 
                        value={selectedEpisodeProfile}
                        onChange={(e) => setSelectedEpisodeProfile(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                      >
                        {episodeProfiles.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voices</label>
                      <select 
                        value={selectedSpeakerProfile}
                        onChange={(e) => setSelectedSpeakerProfile(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                      >
                        {speakerProfiles.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending || isFetchingContent || selectedDocIds.length === 0}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                    >
                      {(generateMutation.isPending || isFetchingContent) ? <Loader2 className="w-5 h-5 animate-spin" /> : <AudioLines className="w-5 h-5" />}
                      {isFetchingContent ? 'Loading Sources...' : 'Generate Overview'}
                    </button>
                    {selectedDocIds.length === 0 && (
                      <p className="text-[10px] text-center text-red-400 mt-2 font-medium">Select at least one source in the side panel first</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Status / Player */
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                  {isProcessing ? (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 blur-3xl animate-pulse" />
                        <Loader2 className="w-16 h-16 text-purple-500 animate-spin relative z-10" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white">Generating Audio...</h4>
                        <p className="text-sm text-gray-500">Gemini 3.1 Flash is crafting your conversational overview. This usually takes ~30-60 seconds.</p>
                      </div>
                    </>
                  ) : isCompleted ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white">Your Overview is Ready!</h4>
                        <p className="text-sm text-gray-500">You can listen to it below or download the file.</p>
                      </div>
                      
                      {jobStatus.result?.audio_file_path && (
                        <div className="w-full pt-6 space-y-4">
                          <audio controls className="w-full accent-purple-500">
                            <source src={`http://localhost:5055/api/podcasts/episodes/${jobStatus.result.episode_id}/audio`} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => window.open(`http://localhost:5055/api/podcasts/episodes/${jobStatus.result.episode_id}/audio`, '_blank')}
                              className="flex-1 bg-[#1A1A1A] border border-[#333] hover:bg-[#222] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                              <Download className="w-4 h-4" /> Download MP3
                            </button>
                            <button 
                              onClick={() => setJobId(null)}
                              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                               Create Another
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white">Generation Failed</h4>
                        <p className="text-sm text-gray-500">{jobStatus?.error_message || "An unexpected error occurred during audio generation."}</p>
                      </div>
                      <button 
                        onClick={() => setJobId(null)}
                        className="bg-[#1A1A1A] border border-[#333] px-6 py-3 rounded-xl text-white font-bold"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
