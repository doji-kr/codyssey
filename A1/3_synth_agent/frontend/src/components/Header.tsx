import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Device } from '@/data/mockData';

interface Props {
  devices: Device[];
  selectedDevice: Device;
  onDeviceChange: (d: Device) => void;
  onMasteryClick: () => void;
  onAiClick: () => void;
}

export default function Header({ devices, selectedDevice, onDeviceChange, onMasteryClick, onAiClick }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-11 border-b border-border flex items-center px-5 shrink-0 relative z-20 bg-white">
      {/* Left: device selector */}
      <div className="flex-1 relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
        >
          <span className="hidden sm:inline text-xs text-muted-foreground uppercase tracking-wide">
            {selectedDevice.name}
          </span>
          <span className="font-semibold">{selectedDevice.displayName}</span>
          <span className="text-muted-foreground/30 mx-0.5">·</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-30">
              {devices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { onDeviceChange(d); setOpen(false); }}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors flex items-center justify-between',
                    d.id === selectedDevice.id && 'bg-accent'
                  )}
                >
                  <div>
                    <span className="font-semibold block">{d.displayName}</span>
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                  </div>
                  {d.id === selectedDevice.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Center: brand */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="hidden sm:inline text-sm font-semibold tracking-tight">synth agent v1</span>
        <span className="sm:hidden text-sm font-semibold tracking-tight">SA</span>
      </div>

      {/* Right: nav */}
      <nav className="flex-1 flex items-center justify-end gap-4">
        <button
          onClick={onAiClick}
          className="text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
        >
          AI 모드
        </button>
        <button
          onClick={onMasteryClick}
          className="hidden sm:inline text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
        >
          마스터리
        </button>
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
          ✦
        </div>
      </nav>
    </header>
  );
}
