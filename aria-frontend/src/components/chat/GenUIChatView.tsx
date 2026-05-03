import React, { useState, useEffect } from 'react';
import { FullScreen } from '@openuidev/react-ui';

interface GenUIChatViewProps {
  activeChatId: string | null;
}

export function GenUIChatView({ activeChatId }: GenUIChatViewProps) {
  // Use a unique key to force remount when activeChatId changes so OpenUI resets
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [activeChatId]);

  return (
    <div className="flex-1 h-full w-full bg-[#0A0A0A] relative" key={key}>
      <FullScreen
        apiUrl="/api/genui/chat"
        threadApiUrl="/api/genui/sessions"
      />
    </div>
  );
}
