import type { Device } from '@/data/mockData';

interface Props {
  device: Device;
  onStartMastery: () => void;
}

export default function HomeView({ device, onStartMastery }: Props) {
  return (
    <div className="min-h-full flex flex-col justify-center px-14 py-12">
      {/* Breadcrumb */}
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-10">
        {device.displayName} · 학습 경로 선택
      </p>

      {/* Heading */}
      <h1 className="text-5xl font-black leading-[1.1] tracking-tight mb-5">
        무엇을 배우고<br />싶으신가요?
      </h1>

      {/* Description */}
      <p className="text-muted-foreground text-[15px] leading-relaxed mb-10 max-w-sm">
        {device.description}
      </p>

      {/* Action cards */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mb-10">
        {/* AI mode */}
        <div className="border border-border rounded-2xl p-6 cursor-not-allowed opacity-60 group">
          <div className="w-5 h-5 bg-orange-500 rounded mb-5 flex items-center justify-center text-white text-[10px]">
            ◆
          </div>
          <h3 className="font-bold text-[15px] mb-2">AI 모드</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-5">
            무엇이든 물어보면 {device.displayName}의 정확한 컨트롤을 짚어주는 답변을 즉시 드립니다.
          </p>
          <span className="text-[11px] text-orange-500 font-medium uppercase tracking-wide">
            질문하러 가기 →
          </span>
        </div>

        {/* Mastery */}
        <button
          onClick={onStartMastery}
          className="border border-border rounded-2xl p-6 text-left hover:border-orange-300 hover:bg-orange-50/40 transition-all duration-200 group"
        >
          <div className="w-5 h-5 bg-orange-100 rounded mb-5 flex items-center justify-center text-orange-500 text-[10px]">
            ▦
          </div>
          <h3 className="font-bold text-[15px] mb-2">마스터리</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-5">
            {device.displayName}을 단계별로 안내하는 가이드 트랙. 각 컨트롤이 순서에 맞게 강조됩니다.
          </p>
          <span className="text-[11px] text-orange-500 font-medium uppercase tracking-wide group-hover:underline">
            학습 시작 →
          </span>
        </button>
      </div>

      {/* Guide quick links */}
      <div className="text-[13px] text-muted-foreground mb-3">
        <span>가이드: </span>
        {device.guides.map((g, i) => (
          <span key={g.id}>
            {i > 0 && <span className="mx-1.5 opacity-30">·</span>}
            <button
              onClick={onStartMastery}
              className="text-orange-500 hover:underline"
            >
              {g.title}
            </button>
          </span>
        ))}
      </div>

      <p className="text-[13px] text-muted-foreground">
        질문이나 피드백이 있으신가요?{' '}
        <span className="text-orange-500">hello@synthagent.io</span>
      </p>
    </div>
  );
}
