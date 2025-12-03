
import React, { useState, useEffect } from 'react';
import { INITIAL_PIPELINE, PipelineData, Tab, Job, Stage } from './types';
import { Icons } from './components/Icons';
import { StageColumn, StageStatus } from './components/StageColumn';
import { ConfigDrawer, JobConfigForm } from './components/ConfigDrawer';
import { VariablesView } from './components/VariablesView';
import { BasicInfoView } from './components/BasicInfoView';
import { AdvancedSettingsView } from './components/AdvancedSettingsView';
import { LogViewer } from './components/LogViewer';

const App: React.FC = () => {
  const [pipeline, setPipeline] = useState<PipelineData>(INITIAL_PIPELINE);
  const [activeTab, setActiveTab] = useState<Tab>('workflow');
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [drawerTitle, setDrawerTitle] = useState('');

  // Drag and Drop State
  const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);

  // Log Viewer State
  const [viewingLogsJob, setViewingLogsJob] = useState<Job | null>(null);

  // Execution Simulation State
  const [isRunning, setIsRunning] = useState(false);
  const [runningStageIndex, setRunningStageIndex] = useState<number>(-1);

  // Simulation Effect
  useEffect(() => {
    if (isRunning && runningStageIndex >= 0) {
        if (runningStageIndex < pipeline.stages.length) {
            // Simulate stage execution time (random between 2s and 4s)
            const delay = Math.floor(Math.random() * 2000) + 2000;
            const timer = setTimeout(() => {
                setRunningStageIndex(prev => prev + 1);
            }, delay);
            return () => clearTimeout(timer);
        } else {
            // Finished
            setIsRunning(false);
        }
    }
  }, [isRunning, runningStageIndex, pipeline.stages.length]);

  const handleRunPipeline = () => {
      if (isRunning) return; // Prevent double click
      setActiveTab('workflow');
      setIsRunning(true);
      setRunningStageIndex(0);
  };

  const getStageStatus = (index: number): StageStatus => {
      if (!isRunning && runningStageIndex === -1) return 'idle'; // Not started
      if (!isRunning && runningStageIndex >= pipeline.stages.length) return 'completed'; // All done
      
      if (index < runningStageIndex) return 'completed';
      if (index === runningStageIndex) return 'running';
      return 'waiting';
  };

  // Handlers
  const handleAddJob = (stageId: string, groupIndex?: number) => {
    const newJob: Job = {
      id: `j-${Date.now()}`,
      name: '新任务',
      type: 'script',
      config: {}
    };
    
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.map(s => {
        if (s.id === stageId) {
          if (groupIndex !== undefined && groupIndex >= 0) {
            // Add to existing group (Serial)
            const newGroups = [...s.groups];
            newGroups[groupIndex] = [...newGroups[groupIndex], newJob];
            return { ...s, groups: newGroups };
          } else {
            // Add as a new parallel group
            return { ...s, groups: [...s.groups, [newJob]] };
          }
        }
        return s;
      })
    }));
  };

  const handleDeleteJob = (stageId: string, jobId: string) => {
      setPipeline(prev => ({
          ...prev,
          stages: prev.stages.map(s => {
              if (s.id === stageId) {
                  // Filter out the job from all groups and remove empty groups
                  const newGroups = s.groups.map(group => group.filter(j => j.id !== jobId))
                                            .filter(group => group.length > 0);
                  return { ...s, groups: newGroups };
              }
              return s;
          })
      }));
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setDrawerTitle(`编辑任务: ${job.name}`);
    setIsDrawerOpen(true);
  };

  const saveJobConfig = () => {
    if (!editingJob) return;
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.map(s => ({
        ...s,
        groups: s.groups.map(group => group.map(j => j.id === editingJob.id ? editingJob : j))
      }))
    }));
    setIsDrawerOpen(false);
    setEditingJob(null);
  };

  const handleAddStage = (index: number) => {
      const newStage: Stage = {
          id: `s-${Date.now()}`,
          name: '新阶段',
          groups: [],
          isParallel: true
      };
      const newStages = [...pipeline.stages];
      newStages.splice(index + 1, 0, newStage);
      setPipeline({...pipeline, stages: newStages});
  };

  const handleDeleteStage = (stageId: string) => {
      setPipeline(prev => ({
          ...prev,
          stages: prev.stages.filter(s => s.id !== stageId)
      }));
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedStageIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedStageIndex === null) return;
    if (draggedStageIndex === index) return;

    // Create a new array and swap the stages
    const newStages = [...pipeline.stages];
    const draggedStage = newStages[draggedStageIndex];
    
    // Remove from old position
    newStages.splice(draggedStageIndex, 1);
    // Insert at new position
    newStages.splice(index, 0, draggedStage);
    
    setPipeline(prev => ({ ...prev, stages: newStages }));
    setDraggedStageIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedStageIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        {/* Row 1: Breadcrumbs & Actions */}
        <div className="px-6 h-16 flex items-center justify-between">
            <div className="flex items-center">
                <button className="p-2 mr-4 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <Icons.ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                
                <div className="flex flex-col justify-center">
                     {/* Breadcrumbs */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-0.5">
                        <span className="hover:text-blue-600 cursor-pointer transition-colors">项目</span>
                        <Icons.ChevronRight className="w-3 h-3 text-gray-300" />
                        <span className="hover:text-blue-600 cursor-pointer transition-colors">敏捷研发项目01</span>
                    </div>

                    {/* Pipeline Title */}
                    <div className="flex items-center group cursor-pointer" onClick={() => setActiveTab('basic')}>
                         <div className="p-1 bg-blue-50 text-blue-600 rounded-md mr-2">
                            <Icons.Workflow className="w-4 h-4" />
                         </div>
                         <h1 className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                            {pipeline.name}
                         </h1>
                         <Icons.Edit3 className="w-3.5 h-3.5 text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-px" />
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 font-medium hover:border-gray-400 transition-all">
                    保存
                </button>
                <button 
                    onClick={handleRunPipeline}
                    disabled={isRunning}
                    className={`px-4 py-2 text-white rounded-lg text-sm shadow-sm font-medium flex items-center space-x-2 transition-all
                        ${isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 hover:shadow-md'}
                    `}
                >
                    {isRunning ? (
                        <>
                            <Icons.Clock className="w-4 h-4 animate-spin" />
                            <span>运行中...</span>
                        </>
                    ) : (
                        <>
                            <Icons.Play className="w-4 h-4 fill-current" />
                            <span>保存并运行</span>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Row 2: Tabs */}
        <div className="px-6 flex space-x-8 border-t border-gray-100">
             {[
                 { id: 'basic', label: '基本信息' },
                 { id: 'workflow', label: '流程编排' },
                 { id: 'variables', label: '变量设置' },
                 { id: 'advanced', label: '高级设置' }
             ].map((tab) => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id 
                        ? 'border-rose-600 text-rose-600' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                 >
                     {tab.label}
                 </button>
             ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
          
          {activeTab === 'workflow' && (
              <div className="h-full w-full overflow-x-auto overflow-y-auto p-8">
                  <div className="flex min-w-max items-stretch pt-4 pb-8">
                      {pipeline.stages.map((stage, index) => (
                          <React.Fragment key={stage.id}>
                              <StageColumn 
                                stage={stage} 
                                index={index}
                                isFirst={index === 0}
                                isLast={index === pipeline.stages.length - 1}
                                status={getStageStatus(index)}
                                isDragging={draggedStageIndex === index}
                                onAddJob={handleAddJob}
                                onEditJob={handleEditJob}
                                onDeleteJob={handleDeleteJob}
                                onDeleteStage={handleDeleteStage}
                                onAddStage={() => handleAddStage(index)}
                                onEditStage={(s) => {
                                    // Hack: Use Job interface to pass stage data to drawer
                                    setEditingJob({
                                        id: s.id, 
                                        name: s.name, 
                                        type: 'stage', 
                                        config: { isParallel: s.isParallel !== false } // Preserve isParallel state
                                    } as Job);
                                    setDrawerTitle('编辑阶段');
                                    setIsDrawerOpen(true);
                                }}
                                onDragStart={handleDragStart}
                                onDragEnter={handleDragEnter}
                                onDragEnd={handleDragEnd}
                                onViewLogs={setViewingLogsJob}
                              />
                          </React.Fragment>
                      ))}

                      {/* Add End Stage Button - Only show when not running */}
                      {!isRunning && (
                          <div className="h-full flex items-start pt-4 pl-4">
                                <button 
                                    onClick={() => handleAddStage(pipeline.stages.length)}
                                    className="flex flex-col items-center justify-center w-12 h-full space-y-2 group opacity-50 hover:opacity-100"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors">
                                        <Icons.Plus className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs text-gray-400 group-hover:text-blue-500 writing-vertical">添加阶段</span>
                                </button>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'variables' && (
              <VariablesView 
                variables={pipeline.variables} 
                onUpdate={(vars) => setPipeline({...pipeline, variables: vars})} 
              />
          )}

          {activeTab === 'basic' && (
              <BasicInfoView 
                data={pipeline} 
                onChange={setPipeline} 
              />
          )}

           {activeTab === 'advanced' && (
              <AdvancedSettingsView 
                data={pipeline} 
                onChange={setPipeline} 
              />
          )}
      </main>

      {/* Log Viewer Modal */}
      {viewingLogsJob && (
          <LogViewer 
            job={viewingLogsJob} 
            onClose={() => setViewingLogsJob(null)} 
          />
      )}

      {/* Configuration Drawer */}
      <ConfigDrawer
        isOpen={isDrawerOpen}
        title={drawerTitle}
        onClose={() => setIsDrawerOpen(false)}
        onSave={activeTab === 'workflow' ? saveJobConfig : undefined}
      >
          {editingJob && editingJob.type !== 'stage' && (
              <JobConfigForm 
                job={editingJob} 
                onChange={setEditingJob} 
              />
          )}
          {editingJob && editingJob.type === 'stage' && (
               <div className="space-y-6">
                   <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">阶段名称</label>
                        <input 
                            type="text" 
                            value={editingJob.name}
                            onChange={(e) => setEditingJob({...editingJob, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                   </div>

                    {/* Stage Execution Mode Toggle */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-700">并行执行</span>
                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                    {editingJob.config.isParallel ? 'Parallel' : 'Serial'}
                                </span>
                            </div>
                            <button 
                                onClick={() => setEditingJob({...editingJob, config: {...editingJob.config, isParallel: !editingJob.config.isParallel}})}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editingJob.config.isParallel ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingJob.config.isParallel ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            {editingJob.config.isParallel 
                                ? '当前阶段内的不同任务组将同时开始执行 (默认)' 
                                : '当前阶段内的任务组将按照顺序依次串行执行'}
                        </p>
                    </div>

                   <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                       阶段ID: {editingJob.id}
                   </div>

                   <button 
                    onClick={() => {
                        setPipeline(p => ({
                            ...p,
                            stages: p.stages.map(s => s.id === editingJob.id ? {
                                ...s, 
                                name: editingJob.name,
                                isParallel: editingJob.config.isParallel
                            } : s)
                        }));
                        setIsDrawerOpen(false);
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
                   >
                       保存修改
                   </button>
               </div>
          )}
      </ConfigDrawer>
    </div>
  );
};

export default App;
