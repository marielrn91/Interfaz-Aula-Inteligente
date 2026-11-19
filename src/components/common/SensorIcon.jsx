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
  Users,
  DoorOpen,
  Radio,
  Wifi,
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
  Users,
  DoorOpen,
  Radio,
  Wifi,
};

export default function SensorIcon({ name, className = 'w-5 h-5', style }) {
  const IconComp = ICON_MAP[name] || Activity;
  return <IconComp className={className} style={style} />;
}
