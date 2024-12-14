import { h } from 'https://esm.sh/preact';

export function JsonCanvas({ data }) {
    return h('div', { className: 'canvas-container' },
        h('svg', { width: '100%', height: '100%' },
            // Render nodes
            data.nodes?.map(node => 
                h('g', { key: node.id, transform: `translate(${node.position.x}, ${node.position.y})` },
                    h('rect', { width: node.size?.width || 100, height: node.size?.height || 50 }),
                    h('text', null, node.label)
                )
            ),
            // Render edges
            data.edges?.map(edge => 
                h('line', {
                    key: edge.id,
                    x1: edge.source.x,
                    y1: edge.source.y,
                    x2: edge.target.x,
                    y2: edge.target.y,
                    stroke: 'black'
                })
            )
        )
    );
}