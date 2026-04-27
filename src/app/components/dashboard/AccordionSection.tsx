import { useState, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccordionSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  headerRight?: ReactNode;
  /** Heading level for the section title (WCAG: proper document outline) */
  headingLevel?: 2 | 3 | 4;
}

export function AccordionSection({ id, title, subtitle, badge, children, defaultExpanded = true, headerRight, headingLevel = 3 }: AccordionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const s = localStorage.getItem(`dash-sec-${id}`);
      return s !== null ? s === 'true' : defaultExpanded;
    } catch { return defaultExpanded; }
  });

  useEffect(() => {
    try { localStorage.setItem(`dash-sec-${id}`, String(isExpanded)); } catch {}
  }, [id, isExpanded]);

  const HeadingTag = headingLevel === 2 ? 'h2' : headingLevel === 4 ? 'h4' : 'h3';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      aria-labelledby={`heading-${id}`}
    >
      <HeadingTag className="m-0">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <button
            id={`heading-${id}`}
            onClick={() => setIsExpanded(v => !v)}
            className="flex items-center gap-3 text-left min-w-0 flex-1 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
            aria-expanded={isExpanded}
            aria-controls={`sec-${id}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {/* 7:1 — slate-800 on white = 12.6:1 */}
                <span className="text-sm font-semibold text-slate-800 dark:text-white">{title}</span>
                {badge}
              </div>
              {/* 7:1 — slate-700 on white = 8.2:1 AAA */}
              {subtitle && <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </button>
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            {headerRight && (
              <div className="mr-2">
                {headerRight}
              </div>
            )}
            <button
              onClick={() => setIsExpanded(v => !v)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 py-0.5"
              aria-expanded={isExpanded}
              aria-controls={`sec-${id}`}
              aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
            >
              {/* 7:1 — slate-700 on white = 8.2:1 */}
              <span className="text-xs text-slate-700 dark:text-slate-300 hidden sm:block">{isExpanded ? 'Collapse' : 'Expand'}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
              </motion.div>
            </button>
          </div>
        </div>
      </HeadingTag>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`sec-content-${id}`}
            id={`sec-${id}`}
            role="region"
            aria-labelledby={`heading-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 dark:border-slate-700 p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
