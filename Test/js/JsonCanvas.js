import { h, render } from 'https://esm.sh/preact';
import { useRef, useEffect, useState } from 'https://esm.sh/preact/hooks';

// Helper: Map side names to SVG alignment points
const sideToOffset = {
  top: (width, height) => ({ x: width / 2, y: 0 }),
  bottom: (width, height) => ({ x: width / 2, y: height }),
  left: (width, height) => ({ x: 0, y: height / 2 }),
  right: (width, height) => ({ x: width, y: height / 2 }),
};

// Canvas component
export function JsonCanvas({ data }) {
  const [nodes, setNodes] = useState(data.nodes);
  const svgRef = useRef();

  // Drag handling
  const handleDrag = (e, id) => {
    const svgBounds = svgRef.current.getBoundingClientRect();
    const newX = e.clientX - svgBounds.left;
    const newY = e.clientY - svgBounds.top;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? { ...node, x: newX - node.width / 2, y: newY - node.height / 2 }
          : node
      )
    );
  };

  // Render nodes
  const renderNodes = () =>
    nodes.map((node) => {
      switch (node.type) {
        case 'text':
          return h(
            'g',
            {
              key: node.id,
              transform: `translate(${node.x}, ${node.y})`,
              onMouseDown: (e) => e.preventDefault(), // Prevent drag selection
              onMouseMove: (e) => e.buttons === 1 && handleDrag(e, node.id),
            },
            h('rect', {
              width: node.width,
              height: node.height,
              fill: '#fff',
              stroke: '#495057',
              rx: 8,
            }),
            h(
              'text',
              {
                x: node.width / 2,
                y: node.height / 2,
                dominantBaseline: 'middle',
                textAnchor: 'middle',
              },
              node.text
            )
          );
        case 'link':
          return h(
            'g',
            {
              key: node.id,
              transform: `translate(${node.x}, ${node.y})`,
              onClick: () => window.open(node.url, '_blank'),
              style: { cursor: 'pointer' },
            },
            h('rect', {
              width: node.width,
              height: node.height,
              fill: '#d9f7be',
              stroke: '#52c41a',
              rx: 8,
            }),
            h(
              'text',
              {
                x: node.width / 2,
                y: node.height / 2,
                dominantBaseline: 'middle',
                textAnchor: 'middle',
              },
              'Open Link'
            )
          );
        case 'file':
          return h(
            'g',
            {
              key: node.id,
              transform: `translate(${node.x}, ${node.y})`,
            },
            h('rect', {
              width: node.width,
              height: node.height,
              fill: '#e6f7ff',
              stroke: '#1890ff',
              rx: 8,
            }),
            h(
              'text',
              {
                x: node.width / 2,
                y: node.height / 2,
                dominantBaseline: 'middle',
                textAnchor: 'middle',
              },
              'File: ' + node.file
            )
          );
        default:
          return null;
      }
    });

  // Render edges
  const renderEdges = () =>
    data.edges.map((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.fromNode);
      const toNode = nodes.find((n) => n.id === edge.toNode);

      if (!fromNode || !toNode) return null;

      const fromOffset = sideToOffset[edge.fromSide](fromNode.width, fromNode.height);
      const toOffset = sideToOffset[edge.toSide](toNode.width, toNode.height);

      const x1 = fromNode.x + fromOffset.x;
      const y1 = fromNode.y + fromOffset.y;
      const x2 = toNode.x + toOffset.x;
      const y2 = toNode.y + toOffset.y;

      return h('line', {
        key: edge.id,
        x1,
        y1,
        x2,
        y2,
        stroke: '#adb5bd',
        strokeWidth: 2,
        markerEnd: edge.fromEnd === 'arrow' ? 'url(#arrowhead)' : null,
      });
    });

  return h(
    'svg',
    {
      ref: svgRef,
      width: '100%',
      height: '100%',
      style: { background: '#f8f9fa' },
    },
    // Define arrowhead marker
    h(
      'defs',
      null,
      h(
        'marker',
        {
          id: 'arrowhead',
          markerWidth: 10,
          markerHeight: 7,
          refX: 10,
          refY: 3.5,
          orient: 'auto',
        },
        h('polygon', { points: '0 0, 10 3.5, 0 7', fill: '#adb5bd' })
      )
    ),
    // Render edges first to appear below nodes
    renderEdges(),
    // Render nodes
    renderNodes()
  );
}

// Render the canvas
export function renderCanvas(data, container) {
  render(h(JsonCanvas, { data }), container);
}
