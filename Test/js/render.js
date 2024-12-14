import { h, render } from 'https://esm.sh/preact';
import { useRef } from 'https://esm.sh/preact/hooks';
import { JsonCanvas } from './JsonCanvas.js';

(async () => {
    // Fetch the canvas data
    const response = await fetch('../Test Canvas.canvas');
    const canvasData = await response.json();

    console.log(canvasData);

    // Create a container reference for the JsonCanvas
    const containerRef = { current: null }; // Create a mutable ref object

    const app = h(
        'div',
        {
            ref: (el) => {
                containerRef.current = el; // Assign the container element to the ref
            },
            style: { width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' },
        },
        [
            h(JsonCanvas, { data: canvasData, containerRef }),
        ]
    );

    // Render the app
    render(app, document.getElementById('canvas'));
})();
