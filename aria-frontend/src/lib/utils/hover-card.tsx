import React, { useState, useEffect } from 'react';

interface ChunkData {
  text_content: string;
  image_paths: string[];
}

export function ChunkHoverCard({ chunkId, children }: { chunkId: string, children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [chunkData, setChunkData] = useState<ChunkData | null>(null);

  useEffect(() => {
    if (isHovered && !chunkData) {
      // Fetch chunk data when hovered
      fetch(`http://localhost:8000/api/sources/chunks/${chunkId}`)
        .then(res => res.json())
        .then(data => setChunkData(data))
        .catch(err => console.error("Error fetching chunk:", err));
    }
  }, [isHovered, chunkId, chunkData]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && chunkData && (
        <div className="absolute z-50 w-96 p-4 mt-2 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 text-sm transform -translate-x-1/2 left-1/2">
          <p className="mb-2 line-clamp-4">{chunkData.text_content}</p>
          {chunkData.image_paths && chunkData.image_paths.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mt-2">
              {chunkData.image_paths.map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:8000${img}`}
                  alt="Extracted"
                  className="h-24 w-auto object-cover rounded border border-gray-600"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
