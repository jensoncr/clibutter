interface WindowPosition {
  x: number;
  y: number;
}

// Calculate window position in a more natural, staggered layout
export function calculateWindowPosition(index: number, totalWindows: number): WindowPosition {
  // Standard window dimensions
  const WINDOW_WIDTH = 1280;
  const WINDOW_HEIGHT = 800;
  
  // Screen dimensions (assuming standard HD screen, adjust if needed)
  const SCREEN_WIDTH = 1920;
  const SCREEN_HEIGHT = 1080;
  
  // Add some randomness to the positioning
  const staggerX = (index * 50) % (SCREEN_WIDTH - WINDOW_WIDTH);
  const staggerY = (index * 40) % (SCREEN_HEIGHT - WINDOW_HEIGHT);
  
  return {
    x: Math.min(staggerX, SCREEN_WIDTH - WINDOW_WIDTH),
    y: Math.min(staggerY, SCREEN_HEIGHT - WINDOW_HEIGHT)
  };
}

const SCREEN_WIDTH = 1920;  // Default screen width
const SCREEN_HEIGHT = 1080; // Default screen height
const WINDOW_WIDTH = 800;   // Width of each browser window
const WINDOW_HEIGHT = 600;  // Height of each browser window
const WINDOW_PADDING = 10;  // Padding between windows

export function getOptimizedLaunchArgs(windowIndex: number, totalWindows: number): string[] {
  // Calculate grid dimensions
  const columns = Math.ceil(Math.sqrt(totalWindows));
  const rows = Math.ceil(totalWindows / columns);

  // Calculate position in grid
  const row = Math.floor(windowIndex / columns);
  const col = windowIndex % columns;

  // Calculate window position
  const x = col * (WINDOW_WIDTH + WINDOW_PADDING);
  const y = row * (WINDOW_HEIGHT + WINDOW_PADDING);

  const baseArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-position=${x},${y}',
    `--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`
  ];

  // Add position and size arguments
  return [
    ...baseArgs,
    `--window-position=${x},${y}`,
    `--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`
  ];
} 