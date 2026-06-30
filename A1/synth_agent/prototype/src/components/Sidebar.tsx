import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Device, Guide } from '@/data/mockData';

interface Props {
  devices: Device[];
  selectedDevice: Device;
  selectedGuide: Guide;
  onDeviceSelect: (device: Device) => void;
  onGuideSelect: (guide: Guide) => void;
}

export default function Sidebar({
  devices,
  selectedDevice,
  selectedGuide,
  onDeviceSelect,
  onGuideSelect,
}: Props) {
  return (
    <aside className="w-52 border-r border-border flex flex-col shrink-0 bg-background">
      <ScrollArea className="flex-1">
        {/* Devices */}
        <div className="p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Devices
          </p>
          <ul className="space-y-0.5">
            {devices.map((device) => (
              <li key={device.id}>
                <button
                  onClick={() => onDeviceSelect(device)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                    selectedDevice.id === device.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <span className="block font-semibold leading-tight">{device.displayName}</span>
                  <span
                    className={cn(
                      'text-[11px]',
                      selectedDevice.id === device.id
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground'
                    )}
                  >
                    {device.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-1" />

        {/* Guides for selected device */}
        <div className="p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Guides
          </p>
          <ul className="space-y-0.5">
            {selectedDevice.guides.map((guide) => (
              <li key={guide.id}>
                <button
                  onClick={() => onGuideSelect(guide)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    selectedGuide.id === guide.id
                      ? 'bg-orange-500 text-white'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  {guide.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </aside>
  );
}
