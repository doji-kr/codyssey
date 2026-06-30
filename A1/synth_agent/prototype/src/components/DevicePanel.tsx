import { useState } from 'react';
import { cn } from '@/lib/utils';
import DeviceIllustration from '@/components/DeviceIllustration';
import type { Device } from '@/data/mockData';

interface Props {
  device: Device;
  highlighted: string[];
  onControlClick: (id: string) => void;
}

export default function DevicePanel({ device, highlighted, onControlClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredCtrl = device.controls.find((c) => c.id === hovered);

  return (
    <div
      className="w-1/2 relative flex flex-col shrink-0 overflow-hidden select-none"
      style={{ backgroundColor: '#e5e1da' }}
    >
      {/* Corner labels */}
      <div className="absolute top-5 left-6 text-[10px] text-black/30 uppercase tracking-[0.2em]">
        {device.category}
      </div>
      <div className="absolute top-5 right-6 text-[10px] text-black/30 uppercase tracking-[0.2em]">
        {device.name}
      </div>

      {/* Device illustration + control overlays */}
      <div className="flex-1 flex items-center justify-center px-12 py-10">
        <div className="relative" style={{ width: 'min(260px, 55%)', aspectRatio: '388/530' }}>
          <DeviceIllustration device={device} />

          {/* Clickable control overlays */}
          {device.controls.map((ctrl) => {
            const isActive = highlighted.includes(ctrl.id) || hovered === ctrl.id;
            return (
              <button
                key={ctrl.id}
                className={cn(
                  'absolute rounded transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-orange-400/25 ring-2 ring-orange-400'
                    : 'bg-transparent ring-1 ring-orange-300/0 hover:ring-orange-400/50 hover:bg-orange-300/10'
                )}
                style={{
                  left: `${ctrl.positionX}%`,
                  top: `${ctrl.positionY}%`,
                  width: `${ctrl.width}%`,
                  height: `${ctrl.height}%`,
                }}
                onMouseEnter={() => setHovered(ctrl.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onControlClick(ctrl.id)}
                aria-label={ctrl.name}
              />
            );
          })}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredCtrl && (
        <div className="absolute bottom-16 left-6 right-6 bg-black/75 backdrop-blur-sm text-white rounded-xl px-4 py-2.5 pointer-events-none">
          <p className="text-xs font-semibold">{hoveredCtrl.name}</p>
          <p className="text-[11px] text-white/60 mt-0.5">{hoveredCtrl.description}</p>
        </div>
      )}

      {/* Bottom labels */}
      <div className="absolute bottom-5 left-6">
        <p className="text-xl font-bold text-black/70 tracking-tight">{device.displayName}</p>
      </div>
      <div className="absolute bottom-6 right-6">
        <p className="text-[9px] text-black/25 uppercase tracking-[0.18em]">
          컨트롤을 탭해 보세요
        </p>
      </div>
    </div>
  );
}
