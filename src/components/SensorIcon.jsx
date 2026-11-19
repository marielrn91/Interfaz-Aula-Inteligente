import React from 'react';
import {
  Wind,
  Magnet,
  Thermometer,
  Sun,
  Mic,
  Flame,
  Droplets,
  Gauge,
  Activity,
} from 'lucide-react';

const ICON_MAP = {
  Wind,
  Magnet,
  Thermometer,
  Sun,
  Mic,
  Flame,
  Droplets,
  Gauge,
  Activity,
};

export default function SensorIcon({ name, className = 'w-5 h-5', style }) {
  const IconComp = ICON_MAP[name] || Activity;
  return <IconComp className={className} style={style} />;
}
