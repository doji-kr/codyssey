import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, CheckCircle2, Lightbulb } from 'lucide-react';
import type { Guide, Control } from '@/data/mockData';

interface Props {
  guide: Guide;
  controls: Control[];
  highlightedControls: string[];
  onStepChange: (controlIds: string[]) => void;
}

export default function TutorialPanel({
  guide,
  controls,
  highlightedControls,
  onStepChange,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
    onStepChange([]);
  }, [guide.id]);

  const goToStep = (index: number) => {
    setActiveStep(index);
    onStepChange(guide.steps[index].relatedControls);
  };

  const step = guide.steps[activeStep];
  const isLast = activeStep === guide.steps.length - 1;
  const progress = ((activeStep + 1) / guide.steps.length) * 100;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Guide header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/40 shrink-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
          Guide
        </p>
        <h1 className="text-xl font-bold leading-tight">{guide.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{guide.description}</p>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Step {activeStep + 1} of {guide.steps.length}
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Step navigator (left mini sidebar) */}
        <nav className="w-44 border-r border-border py-3 shrink-0 overflow-y-auto">
          <ol className="space-y-0.5 px-2">
            {guide.steps.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => goToStep(i)}
                  className={cn(
                    'w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start gap-2 transition-colors',
                    activeStep === i
                      ? 'bg-primary text-primary-foreground font-medium'
                      : i < activeStep
                      ? 'text-muted-foreground hover:bg-accent'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5',
                      activeStep === i
                        ? 'bg-primary-foreground text-primary'
                        : i < activeStep
                        ? 'bg-orange-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {i < activeStep ? '✓' : s.stepNumber}
                  </span>
                  <span className="leading-tight">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Step content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-2xl">
            {step && (
              <>
                {/* Step title */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {step.stepNumber}
                  </span>
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                </div>

                {/* Content */}
                <p className="text-foreground leading-relaxed text-[15px] mb-5">
                  {step.content}
                </p>

                {/* Tip */}
                {step.tips && (
                  <Card className="mb-5 border-blue-200 bg-blue-50/60">
                    <CardContent className="p-4 flex gap-3">
                      <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700 mb-0.5">Tip</p>
                        <p className="text-sm text-blue-800 leading-relaxed">{step.tips}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Related controls */}
                {step.relatedControls.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Controls used
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.relatedControls.map((controlId) => {
                        const control = controls.find((c) => c.id === controlId);
                        if (!control) return null;
                        return (
                          <Badge key={controlId} variant="orange">
                            {control.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeStep === 0}
                    onClick={() => goToStep(activeStep - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {isLast ? (
                    <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Guide complete!
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => goToStep(activeStep + 1)}>
                      Next Step
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
