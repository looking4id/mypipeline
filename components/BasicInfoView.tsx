import React from 'react';
import { PipelineData } from '../types';

interface BasicInfoViewProps {
  data: PipelineData;
  onChange: (data: PipelineData) => void;
}

export const BasicInfoView: React.FC<BasicInfoViewProps> = ({ data, onChange }) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">基本信息</h2>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">流水线名称 <span className="text-red-500">*</span></label>
            <div className="relative">
                <input 
                    type="text" 
                    value={data.name}
                    onChange={e => onChange({...data, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">{data.name.length}/128</span>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">流水线唯一标识 <span className="text-red-500">*</span></label>
            <div className="flex">
                <input 
                    type="text" 
                    value={data.id}
                    disabled
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-l-md text-gray-500"
                />
                <button className="px-4 py-2 bg-white border-t border-r border-b border-gray-300 rounded-r-md hover:bg-gray-50 text-gray-600">
                    复制
                </button>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分组</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                <option>开发类</option>
                <option>测试类</option>
                <option>运维类</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="w-full min-h-[42px] px-4 py-2 border border-gray-300 rounded-md flex flex-wrap gap-2 items-center cursor-text hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-sm flex items-center">
                    后端服务
                    <button className="ml-1 hover:text-blue-800">×</button>
                </span>
                <input type="text" placeholder="+ 新建标记" className="text-sm outline-none flex-1 min-w-[80px]" />
            </div>
        </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea 
                rows={4}
                value={data.description}
                onChange={e => onChange({...data, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
            />
        </div>
      </div>
    </div>
  );
};