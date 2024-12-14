import { h, render } from 'https://esm.sh/preact';
import { JsonCanvas } from './JsonCanvas.js';

(async () => {
    const response = await fetch('../Test Canvas.canvas');
    const canvasData = await response.json();

    console.log(canvasData);

    const app = h('div', null, [
        h(JsonCanvas, { data: canvasData }),
    ]);

    render(app, document.getElementById('canvas'));
})();
