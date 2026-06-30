import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Device } from '@/data/mockData';

interface Props {
  device: Device;
  highlightedControls: string[];
  onControlClick: (id: string) => void;
}

export default function DiagramPanel({ device, highlightedControls, onControlClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const activeControl =
    hovered ? device.controls.find((c) => c.id === hovered) : null;

  return (
    <div className="w-72 border-r border-border flex flex-col shrink-0 bg-background">
      {/* Device header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-bold text-base leading-tight">{device.displayName}</h2>
        <p className="text-xs text-muted-foreground">{device.category}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Diagram */}
          <div
            className="relative rounded-xl overflow-hidden select-none"
            style={{ backgroundColor: device.bgColor, aspectRatio: '1 / 1' }}
          >
            {device.controls.map((control) => {
              const isActive =
                highlightedControls.includes(control.id) || hovered === control.id;
              return (
                <button
                  key={control.id}
                  className={cn(
                    'absolute rounded transition-all duration-150 cursor-pointer',
                    isActive
                      ? 'bg-orange-400/30 ring-2 ring-orange-400'
                      : 'bg-transparent ring-1 ring-orange-300/30 hover:ring-orange-400/60'
                  )}
                  style={{
                    left: `${control.positionX}%`,
                    top: `${control.positionY}%`,
                    width: `${control.width}%`,
                    height: `${control.height}%`,
                  }}
                  onMouseEnter={() => setHovered(control.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onControlClick(control.id)}
                  aria-label={control.name}
                />
              );
            })}

            {/* Hover label */}
            {activeControl && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg px-2.5 py-1.5 pointer-events-none">
                <p className="font-semibold">{activeControl.name}</p>
                <p className="text-white/70 leading-tight mt-0.5">{activeControl.description}</p>
              </div>
            )}
          </div>

          {/* Control legend */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1">
              Controls
            </p>
            {device.controls.map((control) => {
              const isActive = highlightedControls.includes(control.id);
              return (
                <button
                  key={control.id}
                  onClick={() => onControlClick(control.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
                    isActive
                      ? 'border-orange-400 bg-orange-50 text-orange-900'
                      : 'border-border hover:bg-accent text-foreground'
                  )}
                >
                  <span className="font-medium text-xs">{control.name}</span>
                  <span className="block text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {control.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
