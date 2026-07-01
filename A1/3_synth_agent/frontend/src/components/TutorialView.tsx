import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Guide, Control } from '@/data/mockData';

interface Props {
  guide: Guide;
  controls: Control[];
  highlighted: string[];
  onStepChange: (ids: string[]) => void;
  onBack: () => void;
}

function StepContent({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('{') && part.endsWith('}') ? (
          <strong key={i} className="text-orange-500 font-bold not-italic">
            {part.slice(1, -1)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function TutorialView({ guide, onStepChange, onBack }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [stepKey, setStepKey] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setActiveStep(0);
    setStepKey((k) => k + 1);
    setIsExiting(false);
    onStepChange([]);
  }, [guide.id]);

  const goToStep = (i: number) => {
    if (i === activeStep) return;
    setIsExiting(true);
    setTimeout(() => {
      setActiveStep(i);
      setStepKey((k) => k + 1);
      setIsExiting(false);
      onStepChange(guide.steps[i].relatedControls);
    }, 140);
  };

  const step = guide.steps[activeStep];
  const total = guide.steps.length;
  const isFirst = activeStep === 0;
  const isLast = activeStep === total - 1;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#f5f4f2' }}>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 sm:px-12 pt-6 sm:pt-8 pb-6">

          {/* Back link */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            전체 트랙
          </button>

          {/* STEP X / Y */}
          <p className="text-[11px] uppercase tracking-[0.2em] mb-2.5 font-medium">
            <span className="text-orange-500">STEP {activeStep + 1}</span>
            <span className="text-gray-400"> / {total}</span>
          </p>

          {/* Segmented progress bar */}
          <div className="flex gap-1.5 mb-10">
            {guide.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={cn(
                  'flex-1 h-[4px] rounded-full transition-colors',
                  i < activeStep
                    ? 'bg-orange-500'
                    : i === activeStep
                    ? 'bg-orange-500'
                    : 'bg-gray-300/60'
                )}
                aria-label={`스텝 ${i + 1}`}
              />
            ))}
          </div>

          {step && (
            <div
              key={stepKey}
              className={isExiting ? 'anim-step-exit' : 'anim-step-enter'}
            >
              {/* Title */}
              <h2 className="text-[22px] sm:text-[28px] font-bold text-gray-950 mb-4 sm:mb-5 leading-tight tracking-tight">
                {step.title}
              </h2>

              {/* Body */}
              <p className="text-[15px] text-gray-700 leading-relaxed mb-7">
                <StepContent text={step.content} />
              </p>

              {/* YOU SHOULD SEE / HEAR */}
              {step.youShouldSeeHear && (
                <div
                  className="rounded-xl px-5 py-4 mb-4"
                  style={{ border: '1px solid #dedad5', backgroundColor: 'rgba(255,255,255,0.5)' }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2"
                    style={{ color: '#b0aa9f' }}>
                    이렇게 보이거나 들려야 해요
                  </p>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: '#5a564f' }}>
                    {step.youShouldSeeHear}
                  </p>
                </div>
              )}

              {/* TIP */}
              {step.tips && (
                <div
                  className="rounded-xl px-5 py-4 mb-8"
                  style={{ backgroundColor: '#fdf0e8', border: '1px solid #f5d9c4' }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"
                    style={{ color: '#e86500' }}>
                    <span>◆</span> 팁
                  </p>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: '#7a4020' }}>
                    {step.tips}
                  </p>
                </div>
              )}

              {/* Stuck footer */}
              <button
                className="text-[10.5px] uppercase tracking-[0.2em] transition-colors"
                style={{ color: '#b0aa9f' }}
                onMouseOver={e => (e.currentTarget.style.color = '#888')}
                onMouseOut={e => (e.currentTarget.style.color = '#b0aa9f')}
              >
                이 스텝에서 막혔나요? AI에게 물어보기 ↗
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom nav */}
      <div
        className="shrink-0 flex items-center px-6 py-3 gap-4"
        style={{ borderTop: '1px solid #e2ddd8', backgroundColor: '#f5f4f2' }}
      >
        <button
          onClick={isFirst ? onBack : () => goToStep(activeStep - 1)}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] transition-colors whitespace-nowrap px-2"
          style={{ color: '#a09a92' }}
          onMouseOver={e => (e.currentTarget.style.color = '#555')}
          onMouseOut={e => (e.currentTarget.style.color = '#a09a92')}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          뒤로
        </button>

        {isLast ? (
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-lg py-3.5 transition-colors"
            style={{ backgroundColor: '#f04e00' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#d44400')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f04e00')}
          >
            <CheckCircle2 className="w-4 h-4" />
            트랙 완료
          </button>
        ) : (
          <button
            onClick={() => goToStep(activeStep + 1)}
            className="flex-1 flex items-center justify-center gap-2 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-lg py-3.5 transition-colors"
            style={{ backgroundColor: '#f04e00' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#d44400')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f04e00')}
          >
            알겠어요, 다음으로
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
