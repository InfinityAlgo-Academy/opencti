import { clone } from 'ramda';
import useEntitySettings from './useEntitySettings';
import { Scale, ScaleConfig, Tick } from '../../private/components/settings/sub_types/scaleConfiguration/scale';

const admiraltyScale: ScaleConfig = {
  better_side: 'min',
  min: {
    value: 0,
    color: '#f44336',
    label: '6 - Truth Cannot be judged',
  },
  max: {
    value: 100,
    color: '#6e44ad',
    label: 'Out of Range',
  },
  ticks: [
    { value: 1, color: '#f57423', label: '5 - Improbable' },
    { value: 20, color: '#ff9800', label: '4 - Doubtful' },
    { value: 40, color: '#f8e71c', label: '3 - Possibly True' },
    { value: 60, color: '#92f81c', label: '2 - Probably True' },
    { value: 80, color: '#4caf50', label: '1 - Confirmed by other sources' },
  ],
};

const objectiveScale: ScaleConfig = {
  better_side: 'min',
  min: {
    value: 0,
    color: '#f44336',
    label: 'Cannot be judged',
  },
  max: {
    value: 100,
    color: '#6e44ad',
    label: 'Out of Range',
  },
  ticks: [
    { value: 1, color: '#f57423', label: 'Told' },
    { value: 25, color: '#ff9800', label: 'Induced' },
    { value: 51, color: '#f8e71c', label: 'Inferred' },
    { value: 75, color: '#4caf50', label: 'Witnessed' },
  ],
};

const standardScale: ScaleConfig = {
  better_side: 'min',
  min: {
    value: 0,
    color: '#607d8b',
    label: 'None',
  },
  max: {
    value: 100,
    color: '#6e44ad',
    label: 'Out of Range',
  },
  ticks: [
    { value: 1, color: '#f44336', label: 'Low' },
    { value: 30, color: '#ff9800', label: 'Med' },
    { value: 70, color: '#4caf50', label: 'High' },
  ],
};

const noneLevel = {
  label: 'None',
  color: '#607d8b',
};

const notSpecifiedLevel = {
  label: 'Not Specified',
  color: '#607d8b',
};

const defaultScale: ScaleConfig = { ...standardScale };

export const customScaleName = 'Custom';
export const allScales: { name: string, scale: ScaleConfig, json: string }[] = [
  { name: 'Admiralty', scale: clone(admiraltyScale), json: JSON.stringify(admiraltyScale) },
  { name: 'Objective', scale: clone(objectiveScale), json: JSON.stringify(objectiveScale) },
  { name: 'Standard', scale: clone(standardScale), json: JSON.stringify(standardScale) },
];

export const findSelectedScaleName = (scale: ScaleConfig) => {
  const jsonScale = JSON.stringify(scale);
  const selectedScale = allScales.find((s) => s.json === jsonScale);
  if (selectedScale) {
    return selectedScale.name;
  }
  return customScaleName;
};

const useScale = (
  entityType: string | null,
  attributeName: string,
): ScaleConfig | null => {
  if (!entityType) {
    // return default configuration scale if entity type is not defined (ex: relationships)
    return defaultScale;
  }
  const entitySetting = useEntitySettings(entityType).find(
    (node) => node.scaleAttributes !== null,
  );
  const scaleAttribute = entitySetting?.scaleAttributes.find(
    (a) => a.name === attributeName,
  );
  if (!scaleAttribute || !scaleAttribute.scale) {
    return defaultScale;
  }
  const scale = JSON.parse(scaleAttribute.scale) as Scale;
  return scale.local_config;
};

export const buildScaleLevel = (
  value: number | null,
  scale: ScaleConfig | null | undefined,
) => {
  if (value === null || !scale) {
    return {
      level: {
        value,
        label: notSpecifiedLevel.label,
        color: notSpecifiedLevel.color,
      },
      marks: [],
      scale,
    };
  }
  let level: Tick;
  const { min, max } = scale;
  const sortedTicks = (
    scale.ticks.filter((tick) => !!tick) as Array<Tick>
  ).sort((a: Tick, b: Tick) => b.value - a.value);
  const tickLevel = sortedTicks.find((tick: Tick) => value >= tick?.value);
  if (value > max.value) {
    level = max;
  } else if (tickLevel) {
    level = tickLevel;
  } else if (value < min.value) {
    level = { value, ...noneLevel };
  } else {
    level = min;
  }
  return {
    level,
    marks: [
      ...sortedTicks,
      min,
    ],
    scale,
  };
};

export const useLevel = (
  entityType: string | null,
  attributeName: string,
  value: number | null,
) => {
  const scale = useScale(entityType, attributeName);
  if (scale) {
    return buildScaleLevel(value, scale);
  }
  return {
    level: {
      value,
      label: notSpecifiedLevel.label,
      color: notSpecifiedLevel.color,
    },
    marks: [],
    scale: null,
  };
};

export default useScale;
