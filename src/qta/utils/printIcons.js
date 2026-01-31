/**
 * Ícones Lucide em formato SVG para impressão (paths do lucide-react).
 * Usado nas páginas de impressão para manter a identidade visual.
 * Fallback: Tag.
 */

/** Nodos SVG por ícone: array de [elementType, attrs] (sem key). Lucide 24x24. */
const ICON_NODES = {
  Tag: [
    ['path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }],
  ],
  Calendar: [
    ['path', { d: 'M8 2v4', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M16 2v4', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['rect', { width: '18', height: '18', x: '3', y: '4', rx: '2', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M3 10h18', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  BookOpen: [
    ['path', { d: 'M12 7v14', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  FolderOpen: [
    ['path', { d: 'm6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Folder: [
    ['path', { d: 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  FileText: [
    ['path', { d: 'M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M14 2v5a1 1 0 0 0 1 1h5', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M10 9H8', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M16 13H8', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M16 17H8', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Target: [
    ['circle', { cx: '12', cy: '12', r: '10', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['circle', { cx: '12', cy: '12', r: '6', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['circle', { cx: '12', cy: '12', r: '2', fill: 'currentColor' }],
  ],
  Star: [
    ['path', { d: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z', fill: 'currentColor', stroke: 'currentColor', strokeWidth: '0.5' }],
  ],
  Layout: [
    ['rect', { width: '7', height: '7', x: '3', y: '3', rx: '1', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['rect', { width: '7', height: '7', x: '14', y: '3', rx: '1', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['rect', { width: '7', height: '7', x: '3', y: '14', rx: '1', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Heart: [
    ['path', { d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Flag: [
    ['path', { d: 'M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Award: [
    ['path', { d: 'm15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['circle', { cx: '12', cy: '8', r: '6', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Users: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['circle', { cx: '9', cy: '7', r: '4', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Home: [
    ['path', { d: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M9 22V12h6v10', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  GraduationCap: [
    ['path', { d: 'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.838l8.57 4.908a2 2 0 0 0 1.66 0z', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M22 10v6', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M6 12v4c0 2.21 3.582 4 8 4s8-1.79 8-4v-4', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Briefcase: [
    ['path', { d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['rect', { width: '20', height: '14', x: '2', y: '6', rx: '2', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Music: [
    ['path', { d: 'M9 18V5l12-2v13', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['circle', { cx: '6', cy: '18', r: '3', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['circle', { cx: '18', cy: '16', r: '3', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Zap: [
    ['path', { d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Settings: [
    ['path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['circle', { cx: '12', cy: '12', r: '3', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
  Clock: [
    ['circle', { cx: '12', cy: '12', r: '10', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
    ['path', { d: 'M12 6v6l4 2', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }],
  ],
};

const DEFAULT_ICON = 'Tag';

function attrStr(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => {
      const key = k === 'strokeWidth' ? 'stroke-width' : k;
      return `${key}="${String(v).replace(/"/g, '&quot;')}"`;
    })
    .join(' ');
}

/**
 * Retorna SVG inline para o ícone (24x24). color aplicado no stroke/fill currentColor.
 */
export function getIconSvg(iconKey, color = 'currentColor', size = 14) {
  const key = iconKey && ICON_NODES[iconKey] ? iconKey : DEFAULT_ICON;
  const nodes = ICON_NODES[key] || ICON_NODES[DEFAULT_ICON];
  const inner = nodes
    .map(([tag, attrs]) => {
      const a = { ...attrs };
      return `<${tag} ${attrStr(a)}/>`;
    })
    .join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:${color};vertical-align:middle;">${inner}</svg>`;
}
