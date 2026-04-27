// Mobile-First Responsive Design Utilities
import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
  width: number;
  height: number;
}

export const breakpoints: Record<Breakpoint, number> = {
  xs: 0,      // 0px and up
  sm: 640,    // 640px and up
  md: 768,    // 768px and up
  lg: 1024,   // 1024px and up
  xl: 1280,   // 1280px and up
  '2xl': 1536, // 1536px and up
};

export function useResponsive(): UseResponsiveReturn {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      // Determine current breakpoint
      let currentBreakpoint: Breakpoint = '2xl';
      for (const [bp, bpWidth] of Object.entries(breakpoints)) {
        if (width >= bpWidth) {
          currentBreakpoint = bp as Breakpoint;
        } else {
          break;
        }
      }
      setBreakpoint(currentBreakpoint);
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    width: windowSize.width,
    height: windowSize.height,
  };
}

// Touch gesture utilities
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setSwipeDirection(null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    setTouchEnd({ x: endX, y: endY });
    
    // Detect swipe direction
    const deltaX = endX - touchStart.x;
    const deltaY = endY - touchStart.y;
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        setSwipeDirection(deltaY > 0 ? 'down' : 'up');
      }
    }
  };

  return {
    touchStart,
    touchEnd,
    swipeDirection,
    handleTouchStart,
    handleTouchEnd,
  };
}

// Mobile layout utilities
export const getMobileSpacing = (breakpoint: Breakpoint) => {
  switch (breakpoint) {
    case 'xs':
      return {
        container: 'px-4 py-3',
        card: 'p-3',
        button: 'px-4 py-3 text-sm',
        input: 'px-3 py-2 text-sm',
        gap: 'gap-2',
        text: 'text-sm',
      };
    case 'sm':
      return {
        container: 'px-6 py-4',
        card: 'p-4',
        button: 'px-6 py-3 text-sm',
        input: 'px-4 py-2.5',
        gap: 'gap-3',
        text: 'text-sm',
      };
    default:
      return {
        container: 'px-8 py-6',
        card: 'p-6',
        button: 'px-6 py-2.5',
        input: 'px-4 py-3',
        gap: 'gap-4',
        text: 'text-base',
      };
  }
};

export const getMobileChartHeight = (breakpoint: Breakpoint) => {
  switch (breakpoint) {
    case 'xs': return 200;
    case 'sm': return 250;
    case 'md': return 300;
    default: return 400;
  }
};

export const getMobileGridCols = (breakpoint: Breakpoint) => {
  switch (breakpoint) {
    case 'xs': return 1;
    case 'sm': return 2;
    case 'md': return 3;
    default: return 4;
  }
};

// Touch-friendly component props
export interface TouchFriendlyProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export function TouchButton({ 
  children, 
  className = '', 
  onClick, 
  onTouchStart, 
  onTouchEnd, 
  size = 'md',
  variant = 'primary' 
}: TouchFriendlyProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]', // Minimum touch target
    md: 'px-4 py-2.5 min-h-[48px]',
    lg: 'px-6 py-3 min-h-[52px]',
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-500',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500',
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button
      className={combinedClasses}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'manipulation' }} // Improves touch responsiveness
    >
      {children}
    </button>
  );
}

// Mobile navigation component
export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileNav({ isOpen, onClose, children }: MobileNavProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          style={{ touchAction: 'manipulation' }}
        />
      )}
      
      {/* Slide-out menu */}
      <div className={`
        fixed top-0 left-0 h-full w-80 max-w-[80vw] bg-white dark:bg-slate-900 shadow-xl
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:hidden
      `}>
        <div className="h-full overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}

// Responsive grid component
export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: string;
}

export function ResponsiveGrid({ 
  children, 
  className = '', 
  cols = {}, 
  gap = 'gap-4' 
}: ResponsiveGridProps) {
  const { breakpoint } = useResponsive();
  
  const getGridCols = () => {
    switch (breakpoint) {
      case 'xs': return cols.xs || 1;
      case 'sm': return cols.sm || 2;
      case 'md': return cols.md || 3;
      case 'lg': return cols.lg || 4;
      case 'xl': return cols.xl || 4;
      case '2xl': return cols['2xl'] || 4;
      default: return 4;
    }
  };

  return (
    <div className={`grid grid-cols-${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  );
}
