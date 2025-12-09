
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

      const RADIUS = 14; 

      // 1. Join Path (Output -> Merge Vertical Line)
      // Connects a point to a vertical line at mergeX, then goes to targetY (trunk)
      const generateJoinPath = (start: Point, mergeX: number, targetY: number) => {
          // If perfectly aligned (Top Task), straight line
          if (Math.abs(start.y - targetY) < 1) {
              return `M ${start.x} ${start.y} L ${mergeX} ${start.y}`;
          }

          const dirY = targetY > start.y ? 1 : -1;
          const safeRadius = Math.min(RADIUS, Math.abs(mergeX - start.x) / 2, Math.abs(targetY - start.y) / 2);

          // Path: Start -> Horizontal to MergeX-r -> Curve -> Vertical to TargetY
          // Note: We stop at TargetY (T-junction), we don't curve again.
          return `
            M ${start.x} ${start.y}
            L ${mergeX - safeRadius} ${start.y}
            Q ${mergeX} ${start.y} ${mergeX} ${start.y + safeRadius * dirY}
            L ${mergeX} ${targetY}
          `;
      };

      // 2. Split Path (Fork Vertical Line -> Input)
      // Starts from (forkX, sourceY), goes vertical to input.y, then horizontal to input
      const generateSplitPath = (forkX: number, sourceY: number, end: Point) => {
          // If perfectly aligned (Top Task), straight line
          if (Math.abs(sourceY - end.y) < 1) {
              return `M ${forkX} ${sourceY} L ${end.x} ${end.y}`;
          }

          const dirY = end.y > sourceY ? 1 : -1;
          const safeRadius = Math.min(RADIUS, Math.abs(end.x - forkX) / 2, Math.abs(end.y - sourceY) / 2);

          // Path: Start(ForkX, SourceY) -> Vertical to EndY-r -> Curve -> Horizontal to End
          return `
            M ${forkX} ${sourceY}
            L ${forkX} ${end.y - safeRadius * dirY}
            Q ${forkX} ${end.y} ${forkX + safeRadius} ${end.y}
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

          // B. Inter-Stage Connections (Trunk / Bus Style)
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
                 
                 // Main Trunk Y is aligned with the top-most tasks (Index 0)
                 // Assuming standard layout order, index 0 is top
                 const trunkY = outputNodes[0].y;
                 // Note: We assume inputNodes[0].y is roughly aligned with outputNodes[0].y for a straight bridge
                 // If not (e.g. stage misalignment), we might need a step in the bridge, 
                 // but for this design we assume the "Main Trunk" level is determined by the Output Stage top task.

                 const gap = minInputX - maxOutputX;
                 const centerX = maxOutputX + gap / 2;
                 
                 const bridgeWidth = 40; 
                 
                 // Define Merge (Vertical Line X) and Fork (Vertical Line X)
                 const mergeX = centerX - bridgeWidth / 2;
                 const forkX = centerX + bridgeWidth / 2;

                 // 1. Fan-In: Connect all outputs to the Merge Line, then up/down to TrunkY
                 outputNodes.forEach(pOut => {
                     newPaths.push(generateJoinPath(pOut, mergeX, trunkY));
                 });

                 // 2. Bridge: Connect Merge Point to Fork Point along TrunkY
                 // This is the "Main Trunk" horizontal segment
                 newPaths.push(`M ${mergeX} ${trunkY} L ${forkX} ${trunkY}`);

                 // 3. Fan-Out: Connect Trunk (at ForkX) to all inputs
                 // We distribute from (ForkX, TrunkY)
                 inputNodes.forEach(pIn => {
                     newPaths.push(generateSplitPath(forkX, trunkY, pIn));
                 });
             }
          }
      });

      setPaths(newPaths);
    };

    // Calculate initially and on resize
    const observer = new ResizeObserver(() => {
        requestAnimationFrame(calculatePaths);
    });
    
    observer.observe(document.body);
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
