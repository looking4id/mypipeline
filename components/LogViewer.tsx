
import React, { useState, useEffect, useRef } from 'react';
import { Job } from '../types';
import { Icons } from './Icons';

interface LogViewerProps {
  job: Job | null;
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ job, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!job) return;

    // Simulate generating logs based on job type
    const initialLogs = [
      `[INFO] Initializing environment for job: ${job.name}...`,
      `[INFO] Job ID: ${job.id}`,
      `[INFO] Worker allocated: worker-node-linux-small-04`,
      `[INFO] Pulling configuration...`,
    ];

    setLogs(initialLogs);

    // Simulate streaming logs
    let step = 0;
    const maxSteps = 15;
    const interval = setInterval(() => {
      step++;
      const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
      let newLog = '';

      if (job.type.includes('git')) {
         const actions = ['Fetching origin...', 'Checking out branch...', 'Verifying commit signature...', 'Git clone completed.'];
         newLog = `[${timestamp}] [GIT] ${actions[step % actions.length]}`;
      } else if (job.type.includes('build')) {
         const actions = ['Compiling source...', 'Downloading dependencies...', 'Running annotation processors...', 'Packaging artifact...'];
         newLog = `[${timestamp}] [BUILD] ${actions[step % actions.length]}`;
      } else if (job.type.includes('test')) {
         const actions = ['Running TestSuite A...', 'Running TestSuite B...', 'Validating coverage...', 'Generating report...'];
         newLog = `[${timestamp}] [TEST] ${actions[step % actions.length]}`;
      } else {
         newLog = `[${timestamp}] [EXEC] Processing step ${step} of task execution...`;
      }

      setLogs(prev => [...prev, newLog]);

      if (step >= maxSteps) {
        clearInterval(interval);
        setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, -1)}] [INFO] Job completed successfully.`]);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [job]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e1e1e] w-[800px] h-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-700 transform transition-all scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-gray-700">
          <div className="flex items-center space-x-3">
             <div className="p-1.5 bg-gray-700 rounded-md">
                <Icons.Terminal className="w-4 h-4 text-green-400" />
             </div>
             <div>
                <h3 className="text-gray-200 font-mono text-sm font-semibold">执行日志: {job.name}</h3>
                <p className="text-gray-500 text-xs">Job ID: {job.id}</p>
             </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white px-3 py-1 text-xs border border-gray-600 rounded hover:bg-gray-700 transition-colors">
                下载日志
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded transition-colors">
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {logs.map((log, index) => (
            <div key={index} className="flex space-x-2 text-gray-300 hover:bg-[#2a2a2a] px-2 rounded-sm">
               <span className="text-gray-600 select-none w-6 text-right flex-shrink-0">{index + 1}</span>
               <span className={`${log.includes('[INFO]') ? 'text-blue-400' : log.includes('[ERROR]') ? 'text-red-400' : 'text-gray-300'}`}>
                 {log}
               </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Footer Status */}
        <div className="bg-[#2d2d2d] px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-gray-400">正在实时输出日志...</span>
            </div>
            <span className="text-gray-500">UTF-8</span>
        </div>
      </div>
    </div>
  );
};
