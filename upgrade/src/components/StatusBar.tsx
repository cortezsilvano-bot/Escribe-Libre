import { Editor } from '@tiptap/react';
import { Minus, Plus, Maximize } from 'lucide-react';

interface StatusBarProps {
  editor: Editor | null;
  zoom: number;
  setZoom: (zoom: number) => void;
}

export function StatusBar({ editor, zoom, setZoom }: StatusBarProps) {
  if (!editor) return <div className="h-8 bg-gray-200 dark:bg-gray-800"></div>;

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
    <div className="h-8 bg-gray-200/90 dark:bg-gray-800/90 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between gap-2 px-2 sm:px-4 text-xs text-gray-700 dark:text-gray-300 print:hidden shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <span className="whitespace-nowrap">{words} words</span>
        {/* Character count is secondary information; it yields first when the
            window is too narrow to show both counts. */}
        <span className="whitespace-nowrap hidden sm:inline">{characters} characters</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={handleZoomReset}
          className="hover:text-blue-600 dark:hover:text-blue-400 px-1"
          title="Reset zoom to 100%"
          aria-label="Reset zoom to 100%"
        >
          <Maximize className="w-3 h-3" />
        </button>
        <span className="w-10 text-right tabular-nums">{zoom}%</span>
        <button
          onClick={handleZoomOut}
          className="hover:bg-gray-300 dark:hover:bg-gray-700 p-0.5 rounded"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-3 h-3" />
        </button>
        <label htmlFor="zoom-slider" className="sr-only">
          Zoom
        </label>
        <input
          id="zoom-slider"
          type="range"
          min="25"
          max="200"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-16 sm:w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        <button
          onClick={handleZoomIn}
          className="hover:bg-gray-300 dark:hover:bg-gray-700 p-0.5 rounded"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
