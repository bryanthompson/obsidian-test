import { h, render } from 'https://esm.sh/preact';
import { JsonCanvas } from './JsonCanvas.js';

const canvasData = {
  nodes: [
      { id: '1', label: 'Node 1', position: { x: 100, y: 100 }, size: { width: 100, height: 50 } },
      { id: '2', label: 'Node 2', position: { x: 300, y: 200 }, size: { width: 100, height: 50 } }
  ],
  edges: [
      { id: 'e1', source: { x: 150, y: 125 }, target: { x: 300, y: 225 } }
  ]
};

const app = h('div', null, [
  h('h1', null, 'JSON Canvas Example'),
  h(JsonCanvas, { data: canvasData })
]);

render(app, document.getElementById('canvas'));