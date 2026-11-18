// HOUSE STYLES: the surface of every room type in each house style (from the design boards). house.js asks
// STYLE[style].room(type) -> { wall, floor, ceil?, accent?: { n|s|e|w: material }, noCeiling?, joists? }.
import * as THREE from 'three';
import { mat } from '../materials.js';
const paint = (c, o = {}) => mat('plaster_fine', { color: c, size: 1.4, normal: 1.2, ...o });
const oak = (tint) => { const m = mat('laminate', { size: 2.4, clearcoat: .35, clearcoatRough: .3 }); if (tint) m.color.set(tint); return m; };
const tile = (c, size = .9) => mat('tiles', { color: c, size, clearcoat: .3 });
const cache = f => { const c = new Map(); return k => { if (!c.has(k)) c.set(k, f(k)); return c.get(k); }; };
function style(o) {
  const look = cache(t => o.rooms[t] ? o.rooms[t]() : { wall: o.wallMat(), floor: o.floorMat() });
  return { wall: o.wall, tread: o.tread, room: look, innerDoor: { '373737': { color: '#f1efea', kind: 'SmoothPlastic' }, '111111': { color: '#d6d2cb', kind: 'SmoothPlastic' }, a3a2a5: { color: '#2a2a2c', kind: 'Metal' } }, frontDoor: { '373737': { color: o.front, kind: 'SmoothPlastic' } } };
}
const concrete = () => mat('concrete', { color: '#b3b0aa', size: 3 });
export const STYLE = {
  warm: style({ wall: '#efe6d6', tread: () => oak(), front: '#1f2326',
    wallMat: (() => { let m; return () => m ??= paint('#efe6d6'); })(), floorMat: (() => { let m; return () => m ??= oak(); })(),
    rooms: {
      toilet: () => ({ wall: paint('#e7ddd0'), floor: tile('#e2d6c6'), accent: { n: tile('#c16a43', .5) } }),
      bathroom: () => ({ wall: paint('#e7ddd0'), floor: tile('#e2d6c6'), accent: { s: tile('#c16a43', .5) } }),
      ensuite: () => ({ wall: paint('#e7ddd0'), floor: tile('#e2d6c6'), accent: { e: tile('#8e9a86', .5) } }),
      laundry: () => ({ wall: paint('#ece6dc'), floor: tile('#d9d2c6') }),
      garage: () => ({ wall: paint('#ecebe8'), floor: concrete(), sockets: false }),
      teenBoy: () => ({ wall: paint('#d9dbe0'), floor: oak(), accent: { n: paint('#3b4250') } }),
      study: () => ({ wall: paint('#efe6d6'), floor: oak(), accent: { s: paint('#6f7b4f') } }),
      office: () => ({ wall: paint('#ece4d8'), floor: oak(), accent: { w: paint('#5b4636') } }),
      rec: () => ({ wall: paint('#d9d2c6'), floor: mat('carpet', { color: '#a59a8c', size: 1.2 }) }),
      storage: () => ({ wall: mat('plaster_brick', { color: '#d6d0c6', size: 1.4 }), floor: concrete(), sockets: false }),
    } }),
  soft: style({ wall: '#f3ece1', tread: () => oak('#fff6ee'), front: '#7f9a7c',
    wallMat: (() => { let m; return () => m ??= paint('#f3ece1'); })(), floorMat: (() => { let m; return () => m ??= oak('#fff6ee'); })(),
    rooms: {
      kitchen: () => ({ wall: paint('#f3ece1'), floor: tile('#ece4d8', 1.1) }),
      toilet: () => ({ wall: paint('#f2ebe2'), floor: tile('#e9e0d4'), accent: { s: tile('#d98a6a', .5) } }),
      bathroom: () => ({ wall: paint('#f2ebe2'), floor: tile('#e9e0d4'), accent: { n: tile('#d98a6a', .5) } }),
      ensuite: () => ({ wall: paint('#f2ebe2'), floor: tile('#e9e0d4'), accent: { w: tile('#9db49a', .5) } }),
      mudroom: () => ({ wall: paint('#e9e1d6'), floor: tile('#d8cfc2') }),
      teenGirl: () => ({ wall: paint('#f2d8d6'), floor: oak('#fff6ee'), accent: { n: paint('#e9c9c6') } }),
      kid: () => ({ wall: paint('#dfe6ee'), floor: oak('#fff6ee'), accent: { w: paint('#9fb6cf') } }),
      den: () => ({ wall: paint('#e8ecdf'), floor: mat('carpet', { color: '#c8bfae', size: 1.2 }) }),
      parents: () => ({ wall: paint('#efe6da'), floor: oak('#fff6ee'), accent: { n: paint('#b9785a') } }),
      basementRaw: () => ({ wall: mat('concrete', { color: '#bdbab4', size: 2.5 }), floor: concrete(), noCeiling: true, joists: mat('wood_fine', { size: 1.4 }), sockets: false }),
      furnace: () => ({ wall: mat('concrete', { color: '#bdbab4', size: 2.5 }), floor: concrete(), noCeiling: true, joists: mat('wood_fine', { size: 1.4 }), sockets: false }),
    } }),
};
