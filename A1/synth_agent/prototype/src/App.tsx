import { useState } from 'react';
import { devices, type Device, type Guide } from '@/data/mockData';
import Header from '@/components/Header';
import DevicePanel from '@/components/DevicePanel';
import HomeView from '@/components/HomeView';
import GuideListView from '@/components/GuideListView';
import TutorialView from '@/components/TutorialView';

type View = 'home' | 'guides' | 'tutorial';

export default function App() {
  const [device, setDevice] = useState<Device>(devices[0]);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [view, setView] = useState<View>('home');
  const [highlighted, setHighlighted] = useState<string[]>([]);

  const handleDeviceChange = (d: Device) => {
    setDevice(d);
    setGuide(null);
    setView('home');
    setHighlighted([]);
  };

  const handleStartMastery = () => {
    setView('guides');
    setHighlighted([]);
  };

  const handleSelectGuide = (g: Guide) => {
    setGuide(g);
    setView('tutorial');
    setHighlighted([]);
  };

  const handleBack = () => {
    if (view === 'tutorial') {
      setView('guides');
      setHighlighted([]);
    } else {
      setView('home');
    }
  };

  const right =
    view === 'home' ? (
      <HomeView device={device} onStartMastery={handleStartMastery} />
    ) : view === 'guides' ? (
      <GuideListView device={device} onSelectGuide={handleSelectGuide} onBack={handleBack} />
    ) : (
      <TutorialView
        guide={guide!}
        controls={device.controls}
        highlighted={highlighted}
        onStepChange={setHighlighted}
        onBack={handleBack}
      />
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Header
        devices={devices}
        selectedDevice={device}
        onDeviceChange={handleDeviceChange}
        onMasteryClick={handleStartMastery}
      />
      <main className="flex flex-1 overflow-hidden">
        <DevicePanel
          device={device}
          highlighted={highlighted}
          onControlClick={(id) =>
            setHighlighted((prev) => (prev.includes(id) ? [] : [id]))
          }
        />
        <div className={`w-1/2 ${view === 'tutorial' ? 'overflow-hidden h-full' : 'overflow-y-auto'}`}>{right}</div>
      </main>
    </div>
  );
}
