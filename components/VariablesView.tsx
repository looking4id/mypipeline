import React, { useState } from 'react';
import { PipelineVariable } from '../types';
import { Icons } from './Icons';

interface VariablesViewProps {
  variables: PipelineVariable[];
  onUpdate: (vars: PipelineVariable[]) => void;
}

export const VariablesView: React.FC<VariablesViewProps> = ({ variables, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newVar, setNewVar] = useState<Partial<PipelineVariable>>({});

  const handleDelete = (id: string) => {
    onUpdate(variables.filter(v => v.id !== id));
  };

  const handleAdd = () => {
    if (newVar.name) {
      onUpdate([...variables, {
        id: Date.now().toString(),
        name: newVar.name,
        type: (newVar.type as any) || 'string',
        defaultValue: newVar.defaultValue || '',
        description: newVar.description || ''
      }]);
      setIsAdding(false);
      setNewVar({});
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">流水线变量</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
        >
          <Icons.Plus className="w-4 h-4 mr-2" />
          添加变量
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变量名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变量类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">默认值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variables.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {v.type === 'string' ? '文本' : v.type}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.defaultValue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4"><Icons.Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-900"><Icons.Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {variables.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        暂无变量数据
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Add Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-[480px] p-6 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">添加变量</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">变量名称 <span className="text-red-500">*</span></label>
                <input 
                  autoFocus
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="请输入变量名"
                  value={newVar.name || ''}
                  onChange={e => setNewVar({...newVar, name: e.target.value})}
                />
              </div>
              <div className="flex space-x-4">
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                    <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                        value={newVar.type || 'string'}
                        onChange={e => setNewVar({...newVar, type: e.target.value as any})}
                    >
                        <option value="string">文本</option>
                        <option value="boolean">布尔值</option>
                        <option value="enum">枚举</option>
                    </select>
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">默认值</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="请输入默认值"
                  value={newVar.defaultValue || ''}
                  onChange={e => setNewVar({...newVar, defaultValue: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="请输入描述"
                  rows={3}
                  value={newVar.description || ''}
                  onChange={e => setNewVar({...newVar, description: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">取消</button>
              <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">确认添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};