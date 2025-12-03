
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
  onAddJob: (stageId: string, groupIndex?: number) => void;
  onEditJob: (job: Job) => void;
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
        return 'border-blue-500 bg-blue-50/60 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500';
      case 'completed':
        return 'border-green-500 bg-green-50/60';
      case 'failed':
        return 'border-red-500 bg-red-50/60 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500';
      case 'waiting':
        return 'border-gray-300 border-dashed bg-gray-50/50';
      default: // idle
        return 'border-gray-200 bg-white/40 hover:border-gray-300 hover:bg-gray-50/60 hover:shadow-sm border';
    }
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnter={() => onDragEnter(index)}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={handleDragEnd}
      className={`relative flex flex-col min-w-[260px] w-max h-full mx-6 flex-shrink-0 transition-all duration-200 rounded-xl p-2 group/stage ${getStatusStyles()}`}
    >
      {/* Dragging Placeholder Overlay Text */}
      {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-blue-200">
                  放置于此
              </div>
          </div>
      )}

      {/* Running Progress Bar (Top) */}
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

      {/* Vertical Separator Line */}
      {!isLast && status === 'idle' && !isDragging && (
        <div className="absolute top-0 bottom-0 -right-12 w-12 flex justify-center">
             <div className="h-full w-px border-r border-dashed border-gray-300"></div>
        </div>
      )}

      {/* Connector Line to next stage */}
      {!isLast && !isDragging && (
        <div className="absolute top-16 -right-12 w-12 h-0.5 bg-transparent z-0 flex items-center justify-center pointer-events-none">
             <div className="absolute w-full h-0.5 bg-gray-200"></div>

             {(status === 'completed' || status === 'running') && (
                <div className="absolute inset-0 bg-green-400 w-full animate-fade-in origin-left duration-500"></div>
             )}
             
             <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddStage();
                }}
                className="w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-400 flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all z-10 shadow-sm transform hover:scale-110 pointer-events-auto relative"
                title="在此处插入新阶段"
             >
                <Icons.Plus className="w-3.5 h-3.5" />
             </div>
        </div>
      )}

      {/* Stage Header */}
      <div className={`flex items-start justify-between mb-6 px-2 mt-2 ${isDragging ? 'opacity-50 blur-[1px]' : ''}`}>
          
          {/* Drag Handle Area - Includes Icon and Title */}
          <div className="flex-1 flex items-start space-x-2 drag-handle cursor-grab active:cursor-grabbing hover:bg-gray-100/50 rounded-lg p-1 -ml-1 transition-colors select-none">
              <div className="mt-1 text-gray-300 group-hover/stage:text-gray-400">
                 <Icons.GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 
                        className="font-bold text-gray-800 text-base truncate cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={(e) => {
                            if (!isDragging) {
                                // e.stopPropagation(); // Don't stop propagation to allow drag, but here we want click to edit
                                onEditStage(stage);
                            }
                        }}
                        title={stage.name}
                    >
                        {stage.name}
                    </h3>
                    
                    {status === 'running' && <Icons.Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    {status === 'completed' && <Icons.CheckCircle className="w-4 h-4 text-green-500" />}
                    {status === 'failed' && <Icons.AlertCircle className="w-4 h-4 text-red-500" />}
                    {status === 'waiting' && <Icons.Clock className="w-4 h-4 text-gray-400" />}
                  </div>
                  
                  <div className="flex items-center mt-1 space-x-2 text-xs">
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
                <Icons.Edit3 className="w-3.5 h-3.5" />
            </button>
            {!isFirst && (
                <button onClick={() => onDeleteStage(stage.id)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors">
                    <Icons.Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
          </div>
      </div>

      {/* Jobs Container */}
      <div className={`flex flex-col relative pb-4 px-1 ${!isParallel ? 'space-y-10' : 'space-y-4'} ${isDragging ? 'opacity-30 grayscale' : ''} flex-1`}>
        {stage.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="relative group/serial-row">
                {!isParallel && groupIndex > 0 && (
                    <>
                        <div className="absolute -top-10 left-8 h-10 w-0.5 bg-gray-200"></div>
                        <div className="absolute -top-5 left-8 transform -translate-x-1/2 text-gray-300 bg-white z-10 rounded-full border border-gray-100 shadow-sm p-0.5">
                             <Icons.ChevronDown className="w-3 h-3" />
                        </div>
                    </>
                )}

                <div className="flex items-center">
                    {group.map((job, jobIndex) => (
                        <React.Fragment key={job.id}>
                            {jobIndex > 0 && (
                                <div className="w-8 h-0.5 bg-gray-200 flex-shrink-0 relative">
                                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                </div>
                            )}

                            <div 
                                onClick={() => !isDragging && onEditJob(job)}
                                className={`relative bg-white border rounded-lg p-3 w-[240px] shadow-sm cursor-pointer transition-all group/job flex-shrink-0 z-10
                                    ${status === 'running' ? 'border-blue-200 shadow-blue-100' : 
                                      status === 'failed' ? 'border-red-200' :
                                      status === 'completed' ? 'border-green-200' :
                                      'border-gray-200 hover:shadow-md hover:border-blue-500'}
                                `}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300
                                        ${status === 'running' ? 'bg-blue-100 text-blue-600' : 
                                          status === 'completed' ? 'bg-green-100 text-green-600' :
                                          status === 'failed' ? 'bg-red-100 text-red-600' :
                                          status === 'waiting' ? 'bg-gray-100 text-gray-400' :
                                          isFirst ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}
                                    `}>
                                        {status === 'running' ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : 
                                         status === 'completed' ? <Icons.CheckCircle className="w-5 h-5" /> :
                                         status === 'failed' ? <Icons.AlertCircle className="w-5 h-5" /> :
                                         status === 'waiting' ? <Icons.Clock className="w-5 h-5" /> :
                                         isFirst ? <Icons.GitBranch className="w-5 h-5" /> : <Icons.Box className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className={`text-sm font-medium truncate ${status === 'waiting' ? 'text-gray-400' : 'text-gray-900'}`} title={job.name}>{job.name}</h4>
                                        <div className="flex items-center mt-1 space-x-2">
                                            <span className="text-xs text-gray-500 truncate max-w-[120px]">{job.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -top-2 -right-2 flex space-x-1 opacity-0 group-hover/job:opacity-100 transition-all z-20 scale-90 hover:scale-100">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onViewLogs(job); }}
                                        className="bg-white rounded-full p-1 text-gray-400 border border-gray-100 shadow-sm hover:text-blue-500 hover:border-blue-200 transition-colors"
                                        title="查看日志"
                                    >
                                        <Icons.ScrollText className="w-3 h-3" />
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteJob(stage.id, job.id); }}
                                        className="bg-white rounded-full p-1 text-gray-400 border border-gray-100 shadow-sm hover:text-red-500 hover:border-red-200 transition-colors"
                                        title="删除任务"
                                    >
                                        <Icons.X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                    
                    {status === 'idle' && !isDragging && (
                        <button 
                            onClick={() => onAddJob(stage.id, groupIndex)}
                            className="ml-3 flex flex-col items-center justify-center w-8 h-[60px] rounded-lg border-2 border-dashed border-gray-200 text-gray-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover/serial-row:opacity-100 scale-90 hover:scale-100"
                            title="在此任务后添加串行任务"
                        >
                            <Icons.Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        ))}
        
        {status === 'idle' && !isDragging && (
            <button 
                onClick={() => onAddJob(stage.id)}
                className="mt-auto flex items-center justify-center w-[240px] h-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group-hover/stage:border-gray-300"
            >
                <Icons.Plus className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">添加并行任务</span>
            </button>
        )}
      </div>
    </div>
  );
};
