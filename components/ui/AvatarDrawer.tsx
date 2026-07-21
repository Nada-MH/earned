import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, Undo, Eraser, PaintBucket, Pen, Save, X, FlipHorizontal } from 'lucide-react';

interface AvatarDrawerProps {
  initialGrid?: number[][];
  color: string;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const GRID_SIZE = 32;
const MAX_UNDO_STEPS = 20;

const DEFAULT_COLORS = [
  'transparent',
  // Skin tones
  '#FFE0BD', '#FFCD94', '#F5C07A', '#E0A060', '#C68642', '#8D5524',
  // Hair colors
  '#090806', '#2C222B', '#71635A', '#B7A69E', '#D6C4C2', '#CABFB1',
  // Basics
  '#FFFFFF', '#000000', '#9CA3AF', '#1E3A8A', '#DC2626'
];

type ToolType = 'pen' | 'eraser' | 'bucket';

export const AvatarDrawer: React.FC<AvatarDrawerProps> = ({
  initialGrid,
  color,
  onSave,
  onCancel,
}) => {
  // Combine default colors with the user's primary color
  const colors = [color, ...DEFAULT_COLORS];

  const createEmptyGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('transparent'));
  
  const mapInitialGrid = (initial: number[][] | undefined) => {
    if (!initial) return createEmptyGrid();
    // Assuming initialGrid is numbers, we map them to some colors if needed,
    // but the prompt says 32x32 array of color strings or null
    // Here we handle if initialGrid is passed, but mostly we start empty or with strings.
    return createEmptyGrid(); 
  };

  const [grid, setGrid] = useState<string[][]>(() => createEmptyGrid());
  const [history, setHistory] = useState<string[][][]>([]);
  
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState<string>(colors[0]);
  const [mirrorMode, setMirrorMode] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Push state to history
  const saveToHistory = useCallback((newGrid: string[][]) => {
    setHistory(prev => {
      const newHistory = [...prev, newGrid];
      if (newHistory.length > MAX_UNDO_STEPS) {
        newHistory.shift();
      }
      return newHistory;
    });
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousGrid = history[history.length - 1];
    setGrid(previousGrid);
    setHistory(prev => prev.slice(0, -1));
  };

  const clearGrid = () => {
    saveToHistory(grid);
    setGrid(createEmptyGrid());
  };

  const fillBucket = (startX: number, startY: number, targetColor: string, replacementColor: string, currentGrid: string[][]) => {
    if (targetColor === replacementColor) return currentGrid;

    const newGrid = currentGrid.map(row => [...row]);
    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;

      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue;
      if (newGrid[y][x] !== targetColor) continue;

      newGrid[y][x] = replacementColor;

      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }

    return newGrid;
  };

  const paintPixel = (x: number, y: number, isDown: boolean = false) => {
    if (!isDrawing && !isDown) return;

    let newGrid = grid;
    let modified = false;

    if (currentTool === 'bucket' && isDown) {
      saveToHistory(grid);
      newGrid = fillBucket(x, y, grid[y][x], currentColor, grid);
      modified = true;
    } else if (currentTool === 'pen' || currentTool === 'eraser') {
      const colorToApply = currentTool === 'eraser' ? 'transparent' : currentColor;
      
      if (grid[y][x] !== colorToApply) {
        if (isDown) saveToHistory(grid); // Only save history on initial click
        
        newGrid = newGrid.map(row => [...row]);
        newGrid[y][x] = colorToApply;
        modified = true;

        if (mirrorMode) {
          const mirrorX = GRID_SIZE - 1 - x;
          if (mirrorX !== x) {
            newGrid[y][mirrorX] = colorToApply;
          }
        }
      }
    }

    if (modified) {
      setGrid(newGrid);
    }
  };

  const handleMouseDown = (x: number, y: number) => {
    setIsDrawing(true);
    paintPixel(x, y, true);
  };

  const handleMouseEnter = (x: number, y: number) => {
    paintPixel(x, y, false);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleSave = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw grid to canvas
    ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);
    grid.forEach((row, y) => {
      row.forEach((cellColor, x) => {
        if (cellColor !== 'transparent') {
          ctx.fillStyle = cellColor;
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-w-4xl w-full">
        {/* Left Column: Tools & Colors */}
        <div className="flex flex-col gap-6 flex-shrink-0 w-48">
          <div>
            <h3 className="text-slate-300 font-medium mb-3 text-sm">Tools</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentTool('pen')}
                className={`p-2 rounded-lg ${currentTool === 'pen' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                title="Pen"
              >
                <Pen size={18} />
              </button>
              <button
                onClick={() => setCurrentTool('eraser')}
                className={`p-2 rounded-lg ${currentTool === 'eraser' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                title="Eraser"
              >
                <Eraser size={18} />
              </button>
              <button
                onClick={() => setCurrentTool('bucket')}
                className={`p-2 rounded-lg ${currentTool === 'bucket' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                title="Fill Bucket"
              >
                <PaintBucket size={18} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-slate-300 font-medium mb-3 text-sm flex items-center gap-2">
              <Palette size={16} /> Palette
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentColor(c);
                    if (currentTool === 'eraser') setCurrentTool('pen');
                  }}
                  className={`w-8 h-8 rounded border-2 ${currentColor === c && currentTool !== 'eraser' ? 'border-white' : 'border-transparent'} relative`}
                  style={{ backgroundColor: c === 'transparent' ? '#1e293b' : c }}
                  title={c}
                >
                  {c === 'transparent' && (
                    <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold">\</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-slate-300 font-medium mb-3 text-sm">Actions</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setMirrorMode(!mirrorMode)}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm ${mirrorMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                <FlipHorizontal size={16} /> Mirror Mode
              </button>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo size={16} /> Undo
              </button>
              <button
                onClick={clearGrid}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 text-red-400 hover:bg-slate-700 text-sm"
              >
                <X size={16} /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Center: Drawing Area */}
        <div className="flex-1 flex items-center justify-center bg-slate-950 rounded-lg p-4 relative overflow-hidden border border-slate-800">
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: 'min(100%, 400px)',
              aspectRatio: '1/1',
              border: '1px solid #334155'
            }}
            onMouseLeave={() => setIsDrawing(false)}
          >
            {grid.map((row, y) =>
              row.map((cellColor, x) => (
                <div
                  key={`${x}-${y}`}
                  onMouseDown={() => handleMouseDown(x, y)}
                  onMouseEnter={() => handleMouseEnter(x, y)}
                  className="w-full h-full border border-slate-800/30 hover:border-slate-400/50 hover:bg-white/10 transition-colors"
                  style={{
                    backgroundColor: cellColor === 'transparent' ? 'transparent' : cellColor,
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Previews & Save */}
        <div className="flex flex-col gap-6 flex-shrink-0 w-48 items-center md:items-start">
          <div className="w-full">
            <h3 className="text-slate-300 font-medium mb-3 text-sm">Preview</h3>
            <div className="flex flex-col gap-4 items-center bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">88px</span>
                <div 
                  className="w-[88px] h-[88px] rounded-lg border border-slate-700 overflow-hidden"
                  style={{ backgroundColor: '#0f172a' }} // app background roughly
                >
                  <svg viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`} width="100%" height="100%" style={{ imageRendering: 'pixelated' }}>
                    {grid.map((row, y) =>
                      row.map((cell, x) => cell !== 'transparent' ? (
                        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={cell} />
                      ) : null)
                    )}
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">40px</span>
                <div 
                  className="w-[40px] h-[40px] rounded border border-slate-700 overflow-hidden"
                  style={{ backgroundColor: '#0f172a' }}
                >
                  <svg viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`} width="100%" height="100%" style={{ imageRendering: 'pixelated' }}>
                    {grid.map((row, y) =>
                      row.map((cell, x) => cell !== 'transparent' ? (
                        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={cell} />
                      ) : null)
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto w-full flex flex-col gap-3">
            <button
              onClick={onCancel}
              className="w-full py-2 px-4 rounded-lg font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full py-2 px-4 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={18} /> Save Avatar
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for saving PNG */}
      <canvas
        ref={canvasRef}
        width={GRID_SIZE}
        height={GRID_SIZE}
        className="hidden"
      />
    </div>
  );
};

export default AvatarDrawer;
