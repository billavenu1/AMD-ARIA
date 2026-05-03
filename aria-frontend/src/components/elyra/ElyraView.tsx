import React, { useMemo, useState } from 'react';
import { ExternalLink, RefreshCw, Workflow } from 'lucide-react';

export const ElyraView: React.FC = () => {
  const [frameKey, setFrameKey] = useState(0);
  const [hasFrameError, setHasFrameError] = useState(false);
  const elyraUrl = useMemo(() => {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    return env?.VITE_ELYRA_BASE_URL || '/elyra/lab';
  }, []);

  return (
    <main className="flex-1 min-w-0 bg-[#0A0A0A] text-gray-300 flex flex-col overflow-hidden">
      <header className="h-14 border-b border-[#1F1F1F] flex items-center justify-between px-4 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center">
            <Workflow className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-none">Elyra</h1>
            <p className="text-[10px] text-gray-500 mt-1 truncate">{elyraUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setHasFrameError(false);
              setFrameKey((key) => key + 1);
            }}
            className="w-8 h-8 rounded-lg text-gray-500 hover:text-white hover:bg-[#1A1A1A] flex items-center justify-center transition-colors"
            title="Reload Elyra"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.open(elyraUrl, '_blank', 'noopener,noreferrer')}
            className="w-8 h-8 rounded-lg text-gray-500 hover:text-white hover:bg-[#1A1A1A] flex items-center justify-center transition-colors"
            title="Open Elyra in a new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </header>

      <section className="relative flex-1 bg-[#050505]">
        {hasFrameError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050505]">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#333] flex items-center justify-center">
                <Workflow className="w-5 h-5 text-gray-500" />
              </div>
              <h2 className="text-sm font-bold text-white">Elyra is not reachable</h2>
              <p className="mt-2 text-xs text-gray-500 leading-5">
                Start the Elyra Docker service and reload this panel.
              </p>
            </div>
          </div>
        )}
        <iframe
          key={frameKey}
          title="Elyra JupyterLab"
          src={elyraUrl}
          className="h-full w-full border-0 bg-white"
          sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          allow="clipboard-read; clipboard-write"
          onError={() => setHasFrameError(true)}
        />
      </section>
    </main>
  );
};
