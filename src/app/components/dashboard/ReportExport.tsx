import { useState, useCallback, useRef, useEffect } from 'react';
import { Download, FileText, Printer, Loader2 } from 'lucide-react';

interface ReportExportProps {
  targetId: string;
  fileName?: string;
}

export function ReportExportButton({ targetId, fileName = 'FinanceOS-Report' }: ReportExportProps) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowMenu(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showMenu]);

  const exportPDF = useCallback(async () => {
    setExporting(true);
    setShowMenu(false);
    try {
      const element = document.getElementById(targetId);
      if (!element) throw new Error('Report section not found');

      // Use a dedicated print window targeting only the report content
      // This avoids heavy dependencies (html2canvas, jspdf) that cause build issues
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        // Fallback: print the current page
        window.print();
        return;
      }

      // Grab computed styles for faithful reproduction
      const isDark = document.documentElement.classList.contains('dark');
      const bgColor = isDark ? '#0f172a' : '#ffffff';
      const textColor = isDark ? '#e2e8f0' : '#1e293b';

      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${fileName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${bgColor};
      color: ${textColor};
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #1E40AF;
    }
    .header h1 {
      color: #1E40AF;
      font-size: 20px;
      font-weight: 700;
    }
    .header .meta {
      font-size: 11px;
      color: #475569;
    }
    .content { margin-bottom: 24px; }
    .content img { max-width: 100%; height: auto; }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 12px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FinanceOS</h1>
    <div class="meta">
      Financial Report · Generated ${dateStr}
    </div>
  </div>
  <div class="content">${element.innerHTML}</div>
  <div class="footer">
    <span>FinanceOS Enterprise</span>
    <span>Confidential</span>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); window.close(); }, 400);
    };
  </script>
</body>
</html>`);
      printWindow.document.close();
    } catch (err) {
      console.error('PDF export failed:', err);
      // Ultimate fallback
      window.print();
    } finally {
      setExporting(false);
    }
  }, [targetId, fileName]);

  const handlePrint = useCallback(() => {
    setShowMenu(false);
    window.print();
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(v => !v)}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        aria-label="Export report options"
        aria-expanded={showMenu}
        aria-haspopup="menu"
      >
        {exporting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            <span aria-live="polite">Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export
          </>
        )}
      </button>

      {showMenu && !exporting && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} aria-hidden="true" />
          <div
            className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg elevation-3 z-50 overflow-hidden"
            role="menu"
            aria-label="Export options"
          >
            <button
              onClick={exportPDF}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {/* Icon is decorative; text conveys meaning */}
              <FileText className="w-3.5 h-3.5 text-red-700 dark:text-red-300" aria-hidden="true" />
              Download as PDF
            </button>
            <button
              onClick={handlePrint}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" aria-hidden="true" />
              Print Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}