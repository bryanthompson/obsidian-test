import { h, render } from 'https://esm.sh/preact';
import { useRef, useState, useEffect } from 'https://esm.sh/preact/hooks';

const sideToOffset = {
  top: (width, height) => ({ x: width / 2, y: 0 }),
  bottom: (width, height) => ({ x: width / 2, y: height }),
  left: (width, height) => ({ x: 0, y: height / 2 }),
  right: (width, height) => ({ x: width, y: height / 2 }),
};

export function JsonCanvas({ data, containerRef }) {
  const [nodes, setNodes] = useState(data.nodes);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState(null);
  const panStart = useRef(null);

  // Ensure container dimensions are available
  const containerBounds = containerRef.current?.getBoundingClientRect();

  // Handle node drag start
  const handleNodeDragStart = (e, id) => {
    e.stopPropagation(); // Prevent triggering pan
    setDraggingNode({ id, startX: e.clientX, startY: e.clientY });
  };

  // Handle node dragging
  const handleNodeDrag = (e) => {
    if (!draggingNode) return;

    const { id, startX, startY } = draggingNode;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id ? { ...node, x: node.x + dx, y: node.y + dy } : node
      )
    );

    setDraggingNode({ id, startX: e.clientX, startY: e.clientY });
  };

  // Handle node drag end
  const handleNodeDragEnd = () => {
    setDraggingNode(null);
  };

  // Handle background pan start
  const handlePanStart = (e) => {
    if (draggingNode) return; // Ignore if dragging a node
    if (!containerBounds) return;

    panStart.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  // Handle background panning
  const handlePanMove = (e) => {
    if (!panStart.current) return;

    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;

    setPanOffset({ x: dx, y: dy });
  };

  // Handle background pan end
  const handlePanEnd = () => {
    panStart.current = null;
  };

  const renderNodes = () =>
    nodes.map((node) => {
      return h(
        'g',
        {
          key: node.id,
          transform: `translate(${node.x}, ${node.y})`,
          onMouseDown: (e) => handleNodeDragStart(e, node.id),
          onMouseMove: (e) => e.buttons === 1 && handleNodeDrag(e),
          onMouseUp: handleNodeDragEnd,
          onMouseLeave: handleNodeDragEnd,
        },
        h('rect', {
          width: node.width,
          height: node.height,
          fill: node.type === 'link' ? '#d9f7be' : '#fff',
          stroke: node.type === 'link' ? '#52c41a' : '#495057',
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
          node.type === 'link' ? 'Open Link' : node.text
        )
      );
    });

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
      width: '100%',
      height: '100%',
      style: { background: '#f8f9fa', cursor: panStart.current ? 'grabbing' : 'grab' },
      onMouseDown: handlePanStart,
      onMouseMove: handlePanMove,
      onMouseUp: handlePanEnd,
      onMouseLeave: handlePanEnd,
    },
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
    h(
      'g',
      {
        transform: `translate(${panOffset.x}, ${panOffset.y})`,
      },
      renderEdges(),
      renderNodes()
    )
  );
}

// Render the canvas
export function renderCanvas(data, container) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (container) {
      containerRef.current = container;
    }
  }, [container]);

  render(h(JsonCanvas, { data, containerRef }), container);
}
