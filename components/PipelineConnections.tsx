
import React, { useEffect, useState, useRef } from 'react';
import { PipelineData } from '../types';

interface PipelineConnectionsProps {
  pipeline: PipelineData;
}

interface Point {
  x: number;
  y: number;
}

export const PipelineConnections: React.FC<PipelineConnectionsProps> = ({ pipeline }) => {
  const [paths, setPaths] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Debounce resize handling
    let timeoutId: any;
    
    const calculatePaths = () => {
      const newPaths: string[] = [];
      const svgRect = svgRef.current?.getBoundingClientRect();

      if (!svgRect) return;

      // Adjust coordinates to be relative to the SVG container
      const getRelativePoint = (rect: DOMRect, point: 'left' | 'right' | 'top' | 'bottom'): Point => {
        let x = 0;
        let y = 0;

        switch (point) {
            case 'left':
                x = rect.left;
                y = rect.top + rect.height / 2;
                break;
            case 'right':
                x = rect.right;
                y = rect.top + rect.height / 2;
                break;
            case 'top':
                x = rect.left + rect.width / 2;
                y = rect.top;
                break;
            case 'bottom':
                x = rect.left + rect.width / 2;
                y = rect.bottom;
                break;
        }

        return {
          x: x - svgRect.left,
          y: y - svgRect.top
        };
      };

      const RADIUS = 14; // Increased radius for smoother corners

      // 1. Horizontal Step Path (Right -> Left) with midX
      const generateHorizontalStepPath = (start: Point, end: Point, midX: number) => {
        // Ensure midX has enough space for radius
        const safeRadius = Math.min(RADIUS, Math.abs(midX - start.x) / 2, Math.abs(end.x - midX) / 2, Math.abs(end.y - start.y) / 2);
        
        // Straight line if aligned
        if (Math.abs(start.y - end.y) < 2) {
            return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        }

        const dirY = end.y > start.y ? 1 : -1;
        
        // Path: Start -> Horizontal -> Curve -> Vertical -> Curve -> Horizontal -> End
        return `
          M ${start.x} ${start.y}
          L ${midX - safeRadius} ${start.y}
          Q ${midX} ${start.y} ${midX} ${start.y + safeRadius * dirY}
          L ${midX} ${end.y - safeRadius * dirY}
          Q ${midX} ${end.y} ${midX + safeRadius} ${end.y}
          L ${end.x} ${end.y}
        `;
      };

      // --- Logic Loop ---

      pipeline.stages.forEach((stage, stageIndex) => {
          
          // A. Intra-Stage Connections
          stage.groups.forEach((group, groupIndex) => {
              // A1. Intra-Group: Job -> Job (Horizontal)
              // Only connect jobs within the same row (group)
              for (let i = 0; i < group.length - 1; i++) {
                  const currentJob = group[i];
                  const nextJob = group[i+1];
                  const el1 = document.getElementById(`job-node-${currentJob.id}`);
                  const el2 = document.getElementById(`job-node-${nextJob.id}`);
                  
                  if (el1 && el2) {
                      const p1 = getRelativePoint(el1.getBoundingClientRect(), 'right');
                      const p2 = getRelativePoint(el2.getBoundingClientRect(), 'left');
                      
                      // Force strictly horizontal line by averaging Y
                      const midY = (p1.y + p2.y) / 2;
                      newPaths.push(`M ${p1.x} ${midY} L ${p2.x} ${midY}`);
                  }
              }
          });

          // B. Inter-Stage Connections (Fork & Join)
          // Skip connecting the Source stage (index 0) to the next stage
          if (stageIndex > 0 && stageIndex < pipeline.stages.length - 1) {
             const nextStage = pipeline.stages[stageIndex + 1];
             
             // 1. Outputs: Right side of last job in each group
             const outputNodes: Point[] = [];
             stage.groups.forEach(group => {
                if (group.length > 0) {
                    const lastJob = group[group.length - 1];
                    const el = document.getElementById(`job-node-${lastJob.id}`);
                    if (el) outputNodes.push(getRelativePoint(el.getBoundingClientRect(), 'right'));
                }
             });

             // 2. Inputs: Left side of first job in each group
             const inputNodes: Point[] = [];
             nextStage.groups.forEach(group => {
                 if (group.length > 0) {
                     const firstJob = group[0];
                     const el = document.getElementById(`job-node-${firstJob.id}`);
                     if (el) inputNodes.push(getRelativePoint(el.getBoundingClientRect(), 'left'));
                 }
             });

             if (outputNodes.length > 0 && inputNodes.length > 0) {
                 // Calculate Geometry
                 const minInputX = Math.min(...inputNodes.map(p => p.x));
                 const maxOutputX = Math.max(...outputNodes.map(p => p.x));
                 
                 // Calculate Centers
                 const avgOutputY = outputNodes.reduce((sum, p) => sum + p.y, 0) / outputNodes.length;
                 const avgInputY = inputNodes.reduce((sum, p) => sum + p.y, 0) / inputNodes.length;

                 const gap = minInputX - maxOutputX;
                 
                 // OPTIMIZATION: Use centered Fork/Merge points with fixed bridge width
                 // This maximizes the available horizontal space for the Fan-In/Fan-Out curves,
                 // ensuring the radius isn't clamped too aggressively.
                 
                 const bridgeWidth = 32; // Fixed short bridge
                 const centerX = maxOutputX + gap / 2;
                 
                 // Define Merge and Fork Points centered in the gap
                 const mergePoint = { x: centerX - bridgeWidth / 2, y: avgOutputY };
                 const forkPoint = { x: centerX + bridgeWidth / 2, y: avgInputY };

                 // 1. Fan-In (Join): Output Nodes -> Merge Point
                 outputNodes.forEach(pOut => {
                     // MidX is exactly halfway between output and merge point
                     const midX = (pOut.x + mergePoint.x) / 2;
                     newPaths.push(generateHorizontalStepPath(pOut, mergePoint, midX));
                 });

                 // 2. Bridge: Merge Point -> Fork Point
                 const bridgeMidX = (mergePoint.x + forkPoint.x) / 2;
                 newPaths.push(generateHorizontalStepPath(mergePoint, forkPoint, bridgeMidX));

                 // 3. Fan-Out (Fork): Fork Point -> Input Nodes
                 inputNodes.forEach(pIn => {
                     // MidX is exactly halfway between fork point and input
                     const midX = (forkPoint.x + pIn.x) / 2;
                     newPaths.push(generateHorizontalStepPath(forkPoint, pIn, midX));
                 });
             }
          }
      });

      setPaths(newPaths);
    };

    // Calculate initially and on resize
    const observer = new ResizeObserver(() => {
        // Use animation frame to avoid resize loop errors and ensure DOM is settled
        requestAnimationFrame(calculatePaths);
    });
    
    // Observe the document body for general layout changes
    observer.observe(document.body);
    
    // Also recalculate periodically to handle React render timing (simple fallback)
    const interval = setInterval(calculatePaths, 500);

    return () => {
        observer.disconnect();
        clearInterval(interval);
        if(timeoutId) clearTimeout(timeoutId);
    };
  }, [pipeline]);

  return (
    <svg 
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ minWidth: '100%', minHeight: '100%' }}
    >
      {paths.map((d, i) => (
        <path 
            key={i} 
            d={d} 
            stroke="#CBD5E1" // slate-300
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};
