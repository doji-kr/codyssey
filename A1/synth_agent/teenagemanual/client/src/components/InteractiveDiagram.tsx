import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ControlPoint {
  id: string;
  name: string;
  description: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

interface InteractiveDiagramProps {
  imageUrl: string;
  controls: ControlPoint[];
  deviceName: string;
  onControlClick?: (controlId: string) => void;
  highlightedControls?: string[];
}

export function InteractiveDiagram({
  imageUrl,
  controls,
  deviceName,
  onControlClick,
  highlightedControls = [],
}: InteractiveDiagramProps) {
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);

  return (
    <TooltipProvider>
      <div className="relative inline-block w-full">
        {/* Device Image */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={deviceName}
            className="w-full h-auto"
            style={{ aspectRatio: "1/1" }}
          />

          {/* Control Overlays */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
          >
            {controls.map((control) => (
              <g key={control.id} style={{ pointerEvents: "auto" }}>
                {/* Highlight box when hovered */}
                {(hoveredControl === control.id || highlightedControls.includes(control.id)) && (
                  <rect
                    x={`${control.positionX}%`}
                    y={`${control.positionY}%`}
                    width={`${control.width}%`}
                    height={`${control.height}%`}
                    fill="rgba(255, 165, 0, 0.2)"
                    stroke="rgb(255, 165, 0)"
                    strokeWidth="2"
                    style={{ cursor: "pointer" }}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Control Buttons */}
          <div className="absolute inset-0">
            {controls.map((control) => (
              <Tooltip key={control.id}>
                <TooltipTrigger asChild>
                  <button
                    className="absolute rounded-full transition-all hover:ring-2 hover:ring-orange-500 hover:ring-offset-2"
                    style={{
                      left: `${control.positionX}%`,
                      top: `${control.positionY}%`,
                      width: `${control.width}%`,
                      height: `${control.height}%`,
                      transform: "translate(-50%, -50%)",
                      backgroundColor:
                        hoveredControl === control.id
                          ? "rgba(255, 165, 0, 0.3)"
                          : "rgba(0, 0, 0, 0)",
                      border:
                        (hoveredControl === control.id || highlightedControls.includes(control.id))
                          ? "2px solid rgb(255, 165, 0)"
                          : "1px solid rgba(255, 165, 0, 0.5)",
                    }}
                    onMouseEnter={() => setHoveredControl(control.id)}
                    onMouseLeave={() => setHoveredControl(null)}
                    onClick={() => onControlClick?.(control.id)}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">{control.name}</p>
                    <p className="text-sm text-gray-300">{control.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Control Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {controls.map((control) => (
            <button
              key={control.id}
              onClick={() => {
                setHoveredControl(control.id);
                onControlClick?.(control.id);
                setTimeout(() => setHoveredControl(null), 2000);
              }}
              className={`p-3 rounded border hover:border-orange-500 hover:bg-orange-50 transition-colors text-left\n                ${highlightedControls.includes(control.id) ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}
            >
              <p className="font-semibold text-sm">{control.name}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{control.description}</p>
            </button>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
