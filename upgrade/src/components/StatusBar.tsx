import { Editor } from '@tiptap/react';
import { Minus, Plus, Maximize } from 'lucide-react';

interface StatusBarProps {
  editor: Editor | null;
  zoom: number;
  setZoom: (zoom: number) => void;
}

export function StatusBar({ editor, zoom, setZoom }: StatusBarProps) {
  if (!editor) return <div className="h-6 bg-gray-200"></div>;

  const characters = editor.storage.characterCount?.characters() || 0;
  const words = editor.storage.characterCount?.words() || 0;

  const handleZoomOut = () => {
    setZoom(Math.max(25, zoom - 10));
  };

  const handleZoomIn = () => {
    setZoom(Math.min(200, zoom + 10));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  return (
    <div className="h-8 bg-gray-200 border-t border-gray-300 flex items-center justify-between px-4 text-xs text-gray-700">
      <div className="flex items-center space-x-4">
        <span>Page 1 of 1</span>
        <span>{words} words</span>
        <span>{characters} characters</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button onClick={handleZoomReset} className="hover:text-blue-600 px-1" title="Fit to screen">
          <Maximize className="w-3 h-3" />
        </button>
        <span className="w-12 text-right">{zoom}%</span>
        <button onClick={handleZoomOut} className="hover:bg-gray-300 p-0.5 rounded">
          <Minus className="w-3 h-3" />
        </button>
        <input 
          type="range" 
          min="25" 
          max="200" 
          value={zoom} 
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <button onClick={handleZoomIn} className="hover:bg-gray-300 p-0.5 rounded">
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
