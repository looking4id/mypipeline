
import React, { useRef } from 'react';
import { Stage, Job } from '../types';
import { Icons } from './Icons';

export type StageStatus = 'idle' | 'waiting' | 'running' | 'completed' | 'failed';

interface StageColumnProps {
  stage: Stage;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  status?: StageStatus;
  isDragging: boolean; // Controlled by parent
  onAddJob: (stageId: string, groupIndex?: number, insertIndex?: number) => void;
  onEditJob: (job: Job, stageId: string) => void;
  onDeleteJob: (stageId: string, jobId: string) => void;
  onDeleteStage: (stageId: string) => void;
  onEditStage: (stage: Stage) => void;
  onAddStage: () => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onViewLogs: (job: Job) => void;
}

export const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  index,
  isFirst,
  isLast,
  status = 'idle',
  isDragging,
  onAddJob,
  onEditJob,
  onDeleteJob,
  onDeleteStage,
  onEditStage,
  onAddStage,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onViewLogs
}) => {
  
  // Default to parallel if undefined
  const isParallel = stage.isParallel !== false;
  const jobCount = stage.groups.flat().length;
  const hasMultipleGroups = stage.groups.length > 1;

  const handleDragStart = (e: React.DragEvent) => {
    // Only allow dragging if the handle (or header area) was grabbed
    const target = e.target as HTMLElement;
    if (!target.closest('.drag-handle')) {
      e.preventDefault();
      return;
    }
    
    // CRITICAL: Required for Firefox to initiate drag
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Notify parent
    onDragStart(index);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  // Status-based styling - refined for distinct visual feedback
  const getStatusStyles = () => {
    if (isDragging) {
        // Placeholder / Drop Zone Style
        return 'border-2 border-dashed border-blue-400 bg-blue-50/80 opacity-60 scale-[0.98] shadow-inner ring-2 ring-blue-200 ring-offset-2';
    }

    switch (status) {
      case 'running':
        // Keep a subtle highlight for running state
        return 'bg-blue-50/30 rounded-xl ring-1 ring-blue-100'; 
      case 'completed':
        return ''; // Clean look for completed
      case 'failed':
        return 'bg-red-50/30 rounded-xl ring-1 ring-red-100';
      case 'waiting':
        return 'opacity-70';
      default: // idle
        return ''; // Remove default border and background for a clean look
    }
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnter={() => onDragEnter(index)}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={handleDragEnd}
      className="relative flex flex-col min-w-[220px] w-max mx-12 flex-shrink-0 transition-all duration-200 group/stage pb-6 z-10"
    >
      {/* 
          REMOVED: Vertical Separator Line 
          To create a "blank area" between stages, the dashed line has been removed.
      */}

      {/* Dragging Placeholder Overlay Text - positioned relative to root for center alignment */}
      {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-blue-200">
                  放置于此
              </div>
          </div>
      )}

      {/* 
          INNER CONTENT CARD
          Contains the Header, Jobs, and Connectors.
          Applies the background/border styles via getStatusStyles().
      */}
      <div className={`flex flex-col flex-1 p-2 relative ${getStatusStyles()}`}>
          
          {/* Running Progress Bar (Top of Card) */}
          {status === 'running' && !isDragging && (
            <div className="absolute top-0 left-2 right-2 h-1 overflow-hidden rounded-full bg-blue-100 mt-[-2px]">
               <div className="h-full bg-blue-500 w-1/3 animate-[loading_1.5s_ease-in-out_infinite] rounded-full"></div>
               <style>{`
                 @keyframes loading {
                   0% { margin-left: -30%; width: 30%; }
                   50% { width: 60%; }
                   100% { margin-left: 100%; width: 30%; }
                 }
               `}</style>
            </div>
          )}

          {/* Add Stage Button & Vertical Line (Between Stages) */}
          {!isLast && !isDragging && (
            <>
                {/* Vertical Line - centered in the gap, full height */}
                <div className="absolute -right-24 top-0 -bottom-6 w-24 flex justify-center pointer-events-none z-0">
                    <div className="w-px bg-gray-200 h-full"></div>
                </div>

                {/* Add Button - centered in the gap, on top of the line */}
                <div className="absolute top-12 -right-24 w-24 h-10 z-20 flex items-center justify-center pointer-events-none">
                     {/* 
                        pointer-events-auto is needed because parent has pointer-events-none 
                     */}
                     <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddStage();
                        }}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all shadow-sm transform hover:scale-110 pointer-events-auto"
                        title="在此处插入新阶段"
                     >
                        <Icons.Plus className="w-4 h-4" />
                     </div>
                </div>
            </>
          )}

          {/* Stage Header */}
          <div className={`flex items-start justify-between mb-6 px-2 mt-0 ${isDragging ? 'opacity-50 blur-[1px]' : ''}`}>
              
              {/* Drag Handle Area - Includes Icon and Title */}
              <div className="flex-1 flex items-start space-x-2 drag-handle cursor-grab active:cursor-grabbing hover:bg-gray-100/50 rounded-lg p-1 -ml-1 transition-colors select-none">
                  <div className="mt-0.5 text-gray-300 group-hover/stage:text-gray-400">
                     <Icons.GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 
                            className="font-bold text-gray-800 text-sm truncate cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={(e) => {
                                if (!isDragging) {
                                    onEditStage(stage);
                                }
                            }}
                            title={stage.name}
                        >
                            {stage.name}
                        </h3>
                        
                        {status === 'running' && <Icons.Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                        {status === 'completed' && <Icons.CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                        {status === 'failed' && <Icons.AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                        {status === 'waiting' && <Icons.Clock className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                      
                      <div className="flex items-center mt-1 space-x-2 text-[10px]">
                          {status === 'running' ? (
                             <span className="font-semibold text-blue-600 animate-pulse">执行中...</span>
                          ) : status === 'failed' ? (
                             <span className="font-semibold text-red-500">执行失败</span>
                          ) : status === 'waiting' ? (
                             <span className="font-medium text-gray-400">等待执行</span>
                          ) : (
                            <>
                              <span className="font-medium text-gray-500">{jobCount} 任务</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className={`font-medium ${isParallel ? 'text-blue-600' : 'text-orange-500'}`}>
                                  {isParallel ? '并行' : '串行'}
                              </span>
                            </>
                          )}
                      </div>
                  </div>
              </div>

              {/* Actions - Separate from drag handle */}
              <div className={`flex items-center space-x-1 ml-2 transition-opacity duration-200 ${status === 'running' ? 'opacity-0' : 'opacity-0 group-hover/stage:opacity-100'}`}>
                <button onClick={() => onEditStage(stage)} className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
                    <Icons.Edit3 className="w-3 h-3" />
                </button>
                {!isFirst && (
                    <button onClick={() => onDeleteStage(stage.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors">
                        <Icons.Trash2 className="w-3 h-3" />
                    </button>
                )}
              </div>
          </div>

          {/* Jobs Container */}
          <div className={`flex flex-col relative pb-4 px-1 ${!isParallel ? 'space-y-10' : 'space-y-4'} ${isDragging ? 'opacity-30 grayscale' : ''} flex-1`}>
            {stage.groups.map((group, groupIndex) => {
                return (
                <div key={groupIndex} className={`relative group/serial-row ${isParallel && hasMultipleGroups ? 'ml-4' : ''}`}>
                    
                    {/* Groups are simply stacked. SVG overlay handles connection lines now. */}

                    <div className="flex items-center">
                        
                        {group.map((job, jobIndex) => (
                            <React.Fragment key={job.id}>
                                {/* Invisible Spacer for SVG Line - Reduced width */}
                                {jobIndex > 0 && (
                                    <div className="w-6 flex-shrink-0"></div>
                                )}

                                <div className="relative group/job">
                                    {/* Left Add Button (Hover) - Insert Before - NOT for First Job of Pipeline */}
                                    {status === 'idle' && !isDragging && !(isFirst && groupIndex === 0 && jobIndex === 0) && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onAddJob(stage.id, groupIndex, jobIndex); }}
                                            className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border border-blue-200 text-blue-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/job:opacity-100 transition-all hover:scale-110 hover:bg-blue-50 z-30"
                                            title="在此之前添加串行任务"
                                        >
                                            <Icons.Plus className="w-2.5 h-2.5" />
                                        </button>
                                    )}

                                    {/* JOB CARD with ID for SVG Lines - COMPACT SIZE */}
                                    <div 
                                        id={`job-node-${job.id}`}
                                        onClick={() => !isDragging && onEditJob(job, stage.id)}
                                        className={`relative bg-white border rounded-lg p-2 w-[180px] shadow-sm cursor-pointer transition-all flex-shrink-0 z-10
                                            ${status === 'running' ? 'border-blue-200 shadow-blue-100' : 
                                              status === 'failed' ? 'border-red-200' :
                                              status === 'completed' ? 'border-green-200' :
                                              'border-gray-200 hover:shadow-md hover:border-blue-500'}
                                        `}
                                    >
                                        <div className="flex items-start space-x-2">
                                            <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-300
                                                ${status === 'running' ? 'bg-blue-100 text-blue-600' : 
                                                  status === 'completed' ? 'bg-green-100 text-green-600' :
                                                  status === 'failed' ? 'bg-red-100 text-red-600' :
                                                  status === 'waiting' ? 'bg-gray-100 text-gray-400' :
                                                  isFirst ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}
                                            `}>
                                                {status === 'running' ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                                                 status === 'completed' ? <Icons.CheckCircle className="w-3.5 h-3.5" /> :
                                                 status === 'failed' ? <Icons.AlertCircle className="w-3.5 h-3.5" /> :
                                                 status === 'waiting' ? <Icons.Clock className="w-3.5 h-3.5" /> :
                                                 isFirst ? <Icons.GitBranch className="w-3.5 h-3.5" /> : <Icons.Box className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className={`text-xs font-semibold truncate ${status === 'waiting' ? 'text-gray-400' : 'text-gray-900'}`} title={job.name}>{job.name}</h4>
                                                <div className="flex items-center justify-between mt-0.5 min-w-0">
                                                    <span className="text-[10px] text-gray-500 truncate flex-1" title={job.type}>{job.type}</span>
                                                    
                                                    {(status === 'running' || status === 'completed' || status === 'failed') && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onViewLogs(job);
                                                            }}
                                                            className="ml-1 flex items-center text-[9px] text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-gray-100 transition-colors"
                                                            title="查看详细日志"
                                                        >
                                                            <Icons.ScrollText className="w-2.5 h-2.5 mr-0.5" />
                                                            日志
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Add Button (Hover) - Insert After */}
                                    {status === 'idle' && !isDragging && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onAddJob(stage.id, groupIndex, jobIndex + 1); }}
                                            className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border border-blue-200 text-blue-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/job:opacity-100 transition-all hover:scale-110 hover:bg-blue-50 z-30"
                                            title="在此之后添加串行任务"
                                        >
                                            <Icons.Plus className="w-2.5 h-2.5" />
                                        </button>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                        
                    </div>
                </div>
            )})}
            
            {status === 'idle' && !isDragging && (
                <button 
                    onClick={() => onAddJob(stage.id)}
                    className={`mt-auto flex items-center justify-center w-[180px] h-8 border-[0.5px] border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all self-start ${isParallel && hasMultipleGroups ? 'ml-4' : ''}`}
                >
                    <Icons.Plus className="w-3.5 h-3.5 mr-2" />
                    <span className="text-xs font-medium">{isFirst ? '流水线源' : '添加并行任务'}</span>
                </button>
            )}
          </div>
      </div>
    </div>
  );
};
