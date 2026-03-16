import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "../ui/button";

const ExportDropdown = ({ onSelect, buttonLabel = "Export", className = "", disabled = false }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (format) => {
    onSelect?.(format);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 gap-1 px-2 text-xs"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
      >
        <Download className="h-3 w-3" />
        {buttonLabel}
        <ChevronDown className="h-3 w-3" />
      </Button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
          <button type="button" onClick={() => handleExport("csv")} className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100">CSV</button>
          <button type="button" onClick={() => handleExport("xlsx")} className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100">Excel (.xlsx)</button>
          <button type="button" onClick={() => handleExport("pdf")} className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100">PDF</button>
          <button type="button" onClick={() => handleExport("json")} className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100">JSON</button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
