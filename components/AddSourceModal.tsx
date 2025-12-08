
import React, { useState } from 'react';
import { Icons } from './Icons';
import { LucideIcon } from 'lucide-react';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (config: any) => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeCategory, setActiveCategory] = useState('code');
  const [selectedSource, setSelectedSource] = useState('git-generic');
  const [formData, setFormData] = useState({
      repo: '',
      branch: '',
      authType: 'service-connection',
      cloneSubmodules: false,
      customDepth: false,
      triggerEnabled: false,
      branchMode: false,
      workDir: ''
  });

  if (!isOpen) return null;

  const toggleField = (field: keyof typeof formData) => {
      setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const categories = [
      { id: 'code', name: '代码源', icon: 'Code2' },
      { id: 'artifact', name: '制品源', icon: 'Package' },
      { id: 'jenkins', name: 'Jenkins', icon: 'Server' },
      { id: 'flow', name: 'Flow流水线', icon: 'Workflow' },
  ];

  const sourceTypes = [
      { id: 'git-generic', name: '通用Git', icon: 'GitBranch', color: 'text-rose-600' },
      { id: 'sample', name: '示例代码源', icon: 'FileText', color: 'text-blue-500' },
      { id: 'gitlab-self', name: '自建Gitlab', icon: 'Gitlab', color: 'text-orange-600' },
      { id: 'gitee', name: '码云', icon: 'Code2', color: 'text-red-600' }, // Gitee placeholder
      { id: 'codeup', name: 'Codeup', icon: 'Cloud', color: 'text-blue-600' },
      { id: 'atomgit', name: 'AtomGit', icon: 'Fingerprint', color: 'text-blue-400' },
      { id: 'github', name: 'Github', icon: 'Github', color: 'text-gray-900' },
      { id: 'other', name: '其他', icon: 'MoreHorizontal', color: 'text-gray-400' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-[900px] h-[800px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">添加流水线源</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                <Icons.X className="w-5 h-5" />
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col pt-4">
                {categories.map(cat => {
                    const CatIcon = Icons[cat.icon as keyof typeof Icons] as LucideIcon;
                    return (
                        <div 
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center px-6 py-3 cursor-pointer transition-colors border-l-4 ${
                                activeCategory === cat.id 
                                ? 'bg-white border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <CatIcon className="w-4 h-4 mr-3" />
                            <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                
                {/* Source Type Grid */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">选择代码源</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {sourceTypes.map(source => {
                             const SourceIcon = Icons[source.icon as keyof typeof Icons] as LucideIcon;
                             const isSelected = selectedSource === source.id;
                             return (
                                 <div 
                                    key={source.id}
                                    onClick={() => setSelectedSource(source.id)}
                                    className={`
                                        relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all h-24
                                        ${isSelected 
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' 
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}
                                    `}
                                 >
                                     <div className={`mb-2 ${source.color}`}>
                                         <SourceIcon className="w-8 h-8" />
                                     </div>
                                     <span className={`text-xs font-medium ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                         {source.name}
                                     </span>
                                     {isSelected && (
                                         <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-blue-500 border-r-transparent rounded-bl-sm transform rotate-90" />
                                     )}
                                     {isSelected && (
                                        <div className="absolute top-0.5 right-0.5 text-white">
                                            <Icons.CheckCircle className="w-3 h-3 fill-white text-blue-500" />
                                        </div>
                                     )}
                                 </div>
                             );
                        })}
                    </div>
                </div>

                {/* Configuration Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            代码仓库 <Icons.AlertCircle className="inline w-3.5 h-3.5 text-gray-400 ml-1 cursor-help" />
                        </label>
                        <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="请输入代码仓库 (例如: https://github.com/owner/repo.git)"
                            value={formData.repo}
                            onChange={e => setFormData({...formData, repo: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            默认分支 <Icons.AlertCircle className="inline w-3.5 h-3.5 text-gray-400 ml-1 cursor-help" />
                        </label>
                        <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="请输入分支"
                            value={formData.branch}
                            onChange={e => setFormData({...formData, branch: e.target.value})}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300" id="filter" />
                        <label htmlFor="filter" className="text-sm text-gray-600 cursor-pointer">过滤规则 <Icons.AlertCircle className="inline w-3.5 h-3.5 text-gray-400 ml-1" /></label>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">选择凭证类型</label>
                         <div className="flex space-x-6">
                             <label className="flex items-center space-x-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="authType" 
                                    checked={formData.authType === 'service-connection'}
                                    onChange={() => setFormData({...formData, authType: 'service-connection'})}
                                    className="text-blue-600 focus:ring-blue-500 border-gray-300" 
                                 />
                                 <span className="text-sm text-gray-700">服务连接</span>
                             </label>
                             <label className="flex items-center space-x-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="authType" 
                                    checked={formData.authType === 'ssh'}
                                    onChange={() => setFormData({...formData, authType: 'ssh'})}
                                    className="text-blue-600 focus:ring-blue-500 border-gray-300" 
                                 />
                                 <span className="text-sm text-gray-700">组织公钥</span>
                             </label>
                             <label className="flex items-center space-x-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="authType" 
                                    checked={formData.authType === 'none'}
                                    onChange={() => setFormData({...formData, authType: 'none'})}
                                    className="text-blue-600 focus:ring-blue-500 border-gray-300" 
                                 />
                                 <span className="text-sm text-gray-700">不使用凭证</span>
                             </label>
                         </div>
                    </div>

                    {formData.authType === 'service-connection' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">服务连接</label>
                                <button className="text-xs text-blue-600 hover:underline flex items-center">
                                    <Icons.Plus className="w-3 h-3 mr-0.5" /> 添加服务连接
                                </button>
                            </div>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white">
                                    <option>请选择</option>
                                    <option>Github-Oauth-Token</option>
                                    <option>Gitlab-Private-Token</option>
                                </select>
                                <Icons.ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Toggles Section */}
                    <div className="space-y-5 pt-2">
                        {[
                            { id: 'cloneSubmodules', label: '同时克隆子模块' },
                            { id: 'customDepth', label: '自定义克隆深度' },
                            { id: 'triggerEnabled', label: '开启代码源触发' },
                            { id: 'branchMode', label: '开启分支模式' },
                        ].map((toggle: any) => (
                             <div key={toggle.id} className="flex items-center justify-between">
                                 <label className="text-sm text-gray-700 flex items-center">
                                     {toggle.label} 
                                     <Icons.AlertCircle className="w-3.5 h-3.5 text-gray-400 ml-1.5 cursor-help" />
                                 </label>
                                 
                                 <div 
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${(formData as any)[toggle.id] ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    onClick={() => toggleField(toggle.id)}
                                 >
                                     <span 
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${(formData as any)[toggle.id] ? 'translate-x-6' : 'translate-x-1'}`} 
                                     />
                                 </div>
                             </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            工作目录 <Icons.AlertCircle className="inline w-3.5 h-3.5 text-gray-400 ml-1 cursor-help" />
                        </label>
                        <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder=""
                            value={formData.workDir}
                            onChange={e => setFormData({...formData, workDir: e.target.value})}
                        />
                    </div>

                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-start">
            <button 
                onClick={() => {
                    onAdd({
                        name: 'New Git Source',
                        type: 'git-source',
                        config: {
                            repo: formData.repo,
                            branch: formData.branch,
                            ...formData
                        }
                    });
                    onClose();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
                添加
            </button>
        </div>
      </div>
    </div>
  );
};
