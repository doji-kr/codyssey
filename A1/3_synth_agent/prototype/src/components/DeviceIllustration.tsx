import type { Device } from '@/data/mockData';

export default function DeviceIllustration({ device }: { device: Device }) {
  if (device.slug === 'ep-133') return <KO2 />;
  if (device.slug === 'op-1f') return <OP1F />;
  if (device.slug === 'tx-6') return <TX6 />;
  return null;
}

function KO2() {
  return (
    <img
      src="/ep133.png"
      alt="K.O. II EP-133"
      className="w-full h-full object-contain drop-shadow-2xl select-none"
      draggable={false}
    />
  );
}

function OP1F() {
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full drop-shadow-2xl" aria-label="OP-1 Field">
      <rect x="4" y="4" width="352" height="192" rx="10" fill="#e8e4dc" />
      <rect x="8" y="8" width="344" height="184" rx="8" fill="#f0ede6" />
      {[
        { x: 28, color: '#4caf50', label: 'GRN' },
        { x: 76, color: '#2196f3', label: 'BLU' },
        { x: 124, color: '#ff9800', label: 'ORG' },
        { x: 172, color: '#f44336', label: 'RED' },
      ].map(({ x, color, label }) => (
        <g key={label}>
          <circle cx={x} cy={44} r={20} fill={color} />
          <circle cx={x} cy={44} r={14} fill={color} opacity={0.7} />
          <line x1={x} y1={26} x2={x} y2={34} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      <rect x="210" y="16" width="130" height="80" rx="4" fill="#222" />
      <rect x="215" y="21" width="120" height="70" rx="2" fill="#1a1a2a" />
      <text x="275" y="65" fontSize="22" fill="#f90" fontFamily="monospace" fontWeight="bold" textAnchor="middle">SYN</text>
      {['SYN', 'DRM', 'OTH', 'T-E'].map((t, i) => (
        <g key={t}>
          <rect x={168 + (i % 2) * 20} y={16 + Math.floor(i / 2) * 22} width="16" height="18" rx="2" fill="#ccc" />
          <text x={176 + (i % 2) * 20} y={28 + Math.floor(i / 2) * 22} fontSize="5" fill="#555" fontFamily="sans-serif" textAnchor="middle">{t}</text>
        </g>
      ))}
      <circle cx="248" cy="114" r="10" fill="#f44336" />
      <rect x="262" y="106" width="18" height="16" rx="2" fill="#555" />
      <polygon points="284,106 300,114 284,122" fill="#555" />
      <rect x="306" y="106" width="18" height="16" rx="2" fill="#333" />
      {Array.from({ length: 18 }).map((_, i) => (
        <rect key={i} x={8 + i * 19} y={140} width="17" height="52" rx="2" fill="white" stroke="#ccc" strokeWidth="1" />
      ))}
      {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15].map((i) => (
        <rect key={i} x={19 + i * 19} y={140} width="11" height="34" rx="1" fill="#1a1a1a" />
      ))}
    </svg>
  );
}

function TX6() {
  return (
    <svg viewBox="0 0 220 300" className="w-full h-full drop-shadow-2xl" aria-label="TX-6">
      <rect x="4" y="4" width="212" height="292" rx="12" fill="#0e0e30" />
      <rect x="8" y="8" width="204" height="284" rx="10" fill="#12123a" />
      <text x="110" y="30" fontSize="10" fill="#555" fontFamily="sans-serif" textAnchor="middle" letterSpacing="4">TX-6</text>
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 16 + i * 32;
        const faderY = 60 + (i % 3) * 12;
        return (
          <g key={i}>
            <rect x={x + 8} y={50} width="16" height="180" rx="2" fill="#0a0a28" />
            <rect x={x + 5} y={faderY + 60} width="22" height="8" rx="2" fill="#666" />
            <rect x={x + 5} y={faderY + 63} width="22" height="2" rx="1" fill="#888" />
            <circle cx={x + 16} cy={40} r="9" fill="#1e1e50" />
            <circle cx={x + 16} cy={40} r="6" fill="#252560" />
            <line x1={x + 16} y1={33} x2={x + 16} y2={37} stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx={x + 16} cy={240} r="3" fill={i < 2 ? '#0f0' : i < 4 ? '#ff0' : '#f60'} opacity="0.9" />
            <text x={x + 16} y={260} fontSize="7" fill="#444" fontFamily="sans-serif" textAnchor="middle">{i + 1}</text>
          </g>
        );
      })}
      <rect x="204" y="50" width="4" height="180" rx="2" fill="#0a0a28" />
      <circle cx="194" cy="44" r="8" fill="#1e1e50" />
      <circle cx="194" cy="44" r="5" fill="#252560" />
      <text x="110" y="285" fontSize="6" fill="#333" fontFamily="sans-serif" textAnchor="middle" letterSpacing="2">STEREO FIELD MIXER</text>
    </svg>
  );
}
