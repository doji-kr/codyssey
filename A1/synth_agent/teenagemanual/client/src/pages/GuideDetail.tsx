import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Streamdown } from "streamdown";
import { InteractiveDiagram } from "@/components/InteractiveDiagram";
import { useState } from "react";

export default function GuideDetail() {
  const params = useParams<{ slug: string; guideSlug: string }>();
  const deviceSlug = params?.slug || "";
  const guideSlug = params?.guideSlug || "";

  const { data: device, isLoading: deviceLoading } = trpc.devices.getBySlug.useQuery(
    { slug: deviceSlug },
    { enabled: !!deviceSlug }
  );

  const { data: guide, isLoading: guideLoading } = trpc.guides.getBySlug.useQuery(
    { deviceId: device?.id || 0, slug: guideSlug },
    { enabled: !!device?.id && !!guideSlug }
  );

  const { data: guideSteps = [], isLoading: stepsLoading } = trpc.guides.getSteps.useQuery(
    { guideId: guide?.id || 0 },
    { enabled: !!guide?.id }
  );

  const { data: deviceControls = [] } = trpc.controls.listByDevice.useQuery(
    { deviceId: device?.id || 0 },
    { enabled: !!device?.id }
  );

  const [highlightedControls, setHighlightedControls] = useState<string[]>([]);

  const handleControlClick = (controlId: string) => {
    setHighlightedControls([controlId]);
    // Optionally scroll to the diagram or step
  };

  if (deviceLoading || guideLoading || stepsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-32 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
        </div>
      </div>
    );
  }

  if (!device || !guide) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Guide not found</h1>
            <Link href={`/${deviceSlug}`}>
              <Button>Back to Device</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-black hover:opacity-80">
              teenage manual
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">{device.displayName}</span>
            <Link href={`/${deviceSlug}/mastery`} className="text-sm text-gray-600 hover:text-black">Back to Mastery</Link>
          </div>
        </div>
      </header>

      {/* Guide Hero */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
        <p className="text-lg text-gray-700 mb-8">{guide.description}</p>
        {!guide.isFree && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-md inline-block mb-8">
            Pro Only Guide
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
        {/* Left Column: Interactive Diagram */}
        <div className="md:col-span-1">
          {device.diagramImageUrl && (
            <InteractiveDiagram
              imageUrl={device.diagramImageUrl}
              deviceName={device.displayName}
              controls={deviceControls.map(control => ({
                id: control.controlId,
                name: control.name,
                description: control.description || "",
                positionX: control.positionX || 0,
                positionY: control.positionY || 0,
                width: control.width || 0,
                height: control.height || 0,
              }))}
              onControlClick={handleControlClick}
              highlightedControls={highlightedControls}
            />
          )}
          {!device.diagramImageUrl && (
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-400">Diagram Not Available</p>
            </div>
          )}
        </div>

        {/* Right Column: Guide Steps */}
        <div className="md:col-span-2 space-y-8">
          {guideSteps.length === 0 ? (
            <p className="text-gray-500">No steps available for this guide yet.</p>
          ) : (
            guideSteps.map((step: any) => (
              <Card key={step.id} className="p-6 border border-gray-200">
                <h3 className="font-bold text-xl mb-3">Step {step.stepNumber}: {step.title}</h3>
                <Streamdown>{step.content || ""}</Streamdown>
                {step.tips && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                    <span className="font-semibold">Tip:</span> <Streamdown>{step.tips}</Streamdown>
                  </div>
                )}
                {step.relatedControls && step.relatedControls.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold text-sm mb-2">Related Controls:</p>
                    <div className="flex flex-wrap gap-2">
                      {step.relatedControls.map((controlId: string) => {
                        const control = deviceControls.find((c: any) => c.controlId === controlId);
                        return control ? (
                          <span
                            key={controlId}
                            className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-colors
                              ${highlightedControls.includes(controlId) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            onClick={() => handleControlClick(controlId)}
                          >
                            {control.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            <p>teenage manual - the field guide to small machines</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
