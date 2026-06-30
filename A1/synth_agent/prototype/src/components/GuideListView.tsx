import { ArrowLeft } from 'lucide-react';
import type { Device, Guide } from '@/data/mockData';

interface Props {
  device: Device;
  onSelectGuide: (g: Guide) => void;
  onBack: () => void;
}

export default function GuideListView({ device, onSelectGuide, onBack }: Props) {
  return (
    <div className="min-h-full flex flex-col px-14 py-12">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-8">
        {device.displayName} · 마스터리 트랙
      </p>

      <h1 className="text-5xl font-black leading-tight tracking-tight mb-10">
        트랙을 선택하세요.
      </h1>

      <div className="space-y-3 max-w-md">
        {device.guides.map((guide, i) => (
          <button
            key={guide.id}
            onClick={() => onSelectGuide(guide)}
            className="w-full text-left border border-border rounded-2xl p-6 hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200 group"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">
              트랙 {i + 1}{i === 0 ? ' · 무료' : ''}
            </p>
            <h3 className="font-bold text-[17px] mb-1.5">{guide.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {guide.description}
            </p>
            <span className="text-[11px] text-orange-500 font-medium uppercase tracking-wide group-hover:underline">
              학습 시작 →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
