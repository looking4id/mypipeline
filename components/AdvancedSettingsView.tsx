import React from 'react';
import { PipelineData } from '../types';
import { Icons } from './Icons';

interface AdvancedSettingsViewProps {
  data: PipelineData;
  onChange: (data: PipelineData) => void;
}

export const AdvancedSettingsView: React.FC<AdvancedSettingsViewProps> = ({ data, onChange }) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">高级设置</h2>
      
      <div className="space-y-6">
        {/* Trigger Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-900">定时触发</h3>
                <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer left-1 top-1 transition-all duration-300 checked:left-5 checked:border-blue-600" checked onChange={() => {}}/>
                    <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-blue-600 transition-colors duration-300"></label>
                </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">定时单次或周期性的触发流水线自动运行</p>
            
            <div className="bg-gray-50 p-4 rounded border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">触发周期</span>
                    <div className="flex space-x-4 text-sm text-gray-600">
                         {['周天', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, idx) => (
                             <label key={day} className="flex items-center space-x-1 cursor-pointer">
                                 <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={idx === 1 || idx === 2} />
                                 <span>{day}</span>
                             </label>
                         ))}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                     <span className="text-sm font-medium text-gray-700">时间范围</span>
                     <input type="time" className="px-3 py-1.5 border border-gray-300 rounded text-sm" defaultValue="00:00" />
                     <span className="text-gray-400">→</span>
                     <input type="time" className="px-3 py-1.5 border border-gray-300 rounded text-sm" defaultValue="01:00" />
                </div>
            </div>
        </div>

        {/* Timeout Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-base font-medium text-gray-900 mb-4">任务超时设置</h3>
             <div className="flex items-center space-x-3">
                 <input 
                    type="number" 
                    value={data.settings.timeout}
                    onChange={e => onChange({...data, settings: {...data.settings, timeout: parseInt(e.target.value)}})}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                 />
                 <span className="text-sm text-gray-500">分钟</span>
                 <Icons.AlertCircle className="w-4 h-4 text-gray-400 cursor-help" />
             </div>
        </div>

        {/* Retry Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-base font-medium text-gray-900 mb-4">任务重试设置</h3>
             <select 
                value={data.settings.retryCount}
                onChange={e => onChange({...data, settings: {...data.settings, retryCount: parseInt(e.target.value)}})}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
             >
                 <option value={0}>不重试</option>
                 <option value={1}>重试 1 次</option>
                 <option value={2}>重试 2 次</option>
             </select>
        </div>

        {/* Skip Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">自动跳过任务</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                    <Icons.Plus className="w-3 h-3 mr-1" /> 添加
                </button>
             </div>
             <div className="mt-4 border border-dashed border-gray-300 rounded bg-gray-50 p-6 text-center text-sm text-gray-500">
                 暂无配置跳过策略
             </div>
        </div>

         {/* Resources */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="text-base font-medium text-gray-900 mb-4">运行资源规格</h3>
             <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-500"
                disabled
             >
                 <option>请选择运行资源规格</option>
             </select>
        </div>
      </div>
    </div>
  );
};