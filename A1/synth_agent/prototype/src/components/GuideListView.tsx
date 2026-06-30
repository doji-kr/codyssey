import { Lock } from 'lucide-react';
import type { Device, Guide } from '@/data/mockData';

interface Props {
  device: Device;
  onSelectGuide: (g: Guide) => void;
  onBack: () => void;
}

export default function GuideListView({ device, onSelectGuide, onBack }: Props) {
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: '#f5f4f2' }}>
      <div className="px-12 pt-10 pb-14">

        {/* Breadcrumb */}
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] mb-4"
           style={{ color: '#a09890' }}>
          <button onClick={onBack} className="hover:text-orange-500 transition-colors">
            마스터리
          </button>
          {' · '}
          <span>인터랙티브 트랙</span>
        </p>

        {/* Title */}
        <h1 className="text-[32px] font-black leading-tight tracking-tight mb-3"
            style={{ color: '#1a1714' }}>
          {device.displayName} 마스터하기
        </h1>

        {/* Description */}
        <p className="text-[14px] leading-relaxed mb-10" style={{ color: '#7a7068', maxWidth: '360px' }}>
          컨트롤에 불이 들어오며 단계별로 안내하는 인터랙티브 레슨입니다. 첫 번째 트랙은 무료입니다.
        </p>

        {/* Guide list */}
        <div className="flex flex-col gap-0" style={{ maxWidth: '480px' }}>
          {device.guides.map((guide, i) => {
            const isFree = guide.isFree ?? false;
            const stepCount = guide.steps.length;
            const mins = guide.estimatedMinutes;

            return (
              <button
                key={guide.id}
                onClick={() => onSelectGuide(guide)}
                className="anim-card-enter w-full text-left flex items-center gap-4 px-5 py-4 transition-colors duration-150 group"
                style={{
                  animationDelay: `${i * 70 + 60}ms`,
                  border: '1px solid #dedad5',
                  borderBottom: i < device.guides.length - 1 ? 'none' : '1px solid #dedad5',
                  backgroundColor: '#ffffff',
                  borderRadius:
                    i === 0
                      ? '10px 10px 0 0'
                      : i === device.guides.length - 1
                      ? '0 0 10px 10px'
                      : '0',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#fffaf7';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff';
                }}
              >
                {/* Left: number or lock badge */}
                <div
                  className="shrink-0 w-9 h-9 rounded flex items-center justify-center text-[11px] font-bold"
                  style={{
                    backgroundColor: isFree ? '#f04e00' : '#edeae6',
                    color: isFree ? '#ffffff' : '#9a9088',
                  }}
                >
                  {isFree ? (
                    String(i + 1).padStart(2, '0')
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Center: text */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[15px] font-bold leading-snug mb-0.5 group-hover:text-orange-600 transition-colors"
                    style={{ color: '#1a1714' }}
                  >
                    {guide.title}
                  </h3>
                  <p className="text-[12px] leading-snug mb-1.5 line-clamp-1"
                     style={{ color: '#8a8078' }}>
                    {guide.description}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em]"
                     style={{ color: '#b0a89e' }}>
                    {mins ? `${mins}분` : null}
                    {mins && ' · '}
                    {stepCount}스텝
                  </p>
                </div>

                {/* Right: FREE / PRO badge */}
                <div
                  className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1"
                  style={{
                    border: `1px solid ${isFree ? '#1a1714' : '#c8c0b8'}`,
                    color: isFree ? '#1a1714' : '#a09890',
                    borderRadius: '4px',
                    letterSpacing: '0.08em',
                  }}
                >
                  {isFree ? '무료' : 'PRO'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
