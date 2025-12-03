
import React, { useState, useEffect, useRef } from 'react';
import { Job, JobConfig } from '../types';
import { Icons } from './Icons';
import { LucideIcon } from 'lucide-react';

interface ConfigDrawerProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  onSave?: () => void;
}

export const ConfigDrawer: React.FC<ConfigDrawerProps> = ({
  isOpen,
  title,
  onClose,
  children,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Removed bg-black/20 and backdrop-blur-sm to make the overlay invisible */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />
      <div className="relative w-[500px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <div className="flex items-center space-x-2">
            {onSave && (
                <button 
                    onClick={onSave}
                    className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors font-medium"
                >
                    确认
                </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Job Type Definitions ---

interface JobTypeDefinition {
  id: string;
  name: string;
  icon: keyof typeof Icons;
  description: string;
  category: 'Source' | 'Build' | 'Test' | 'Deploy' | 'Control' | 'Other';
}

const JOB_TYPES: JobTypeDefinition[] = [
  // Source
  { id: 'git-source', name: 'Git 代码源', icon: 'GitBranch', description: '从 Git 仓库拉取代码', category: 'Source' },
  
  // Build
  { id: 'build-maven', name: 'Maven 构建', icon: 'Box', description: '使用 Maven 编译和打包 Java 项目', category: 'Build' },
  { id: 'build-docker', name: 'Docker 构建', icon: 'Container', description: '构建并推送 Docker 镜像', category: 'Build' },
  
  // Test
  { id: 'test-maven', name: 'Maven 单元测试', icon: 'Beaker', description: '运行 Maven 单元测试', category: 'Test' },
  { id: 'test-coverage', name: 'Jacoco 覆盖率', icon: 'PieChart', description: '采集代码覆盖率数据', category: 'Test' },
  { id: 'test-go', name: 'Golang 测试', icon: 'Terminal', description: '运行 Go 语言测试', category: 'Test' },
  { id: 'security-scan', name: '安全扫描', icon: 'Shield', description: '代码安全漏洞扫描', category: 'Test' },

  // Deploy
  { id: 'deploy', name: 'Kubernetes 发布', icon: 'CloudUpload', description: '部署到 K8s 集群', category: 'Deploy' },
  
  // Control
  { id: 'manual-approval', name: '人工卡点', icon: 'UserCheck', description: '等待人工确认后继续', category: 'Control' },
  
  // Other
  { id: 'seaborn-report', name: 'Seaborn 报表', icon: 'LineChart', description: '生成 Seaborn 数据可视化图表', category: 'Other' },
  { id: 'script', name: 'Shell 脚本', icon: 'Terminal', description: '执行自定义 Shell 脚本', category: 'Other' },
];

const CATEGORY_LABELS: Record<string, string> = {
  Source: '源',
  Build: '构建',
  Test: '测试',
  Deploy: '部署',
  Control: '控制',
  Other: '其他'
};

const CATEGORY_ORDER = ['Source', 'Build', 'Test', 'Deploy', 'Control', 'Other'];

// --- JobTypeSelector Component ---

interface JobTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const JobTypeSelector: React.FC<JobTypeSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedType = JOB_TYPES.find(t => t.id === value) || JOB_TYPES[0];
  const SelectedIcon = Icons[selectedType.icon] as LucideIcon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors shadow-sm select-none"
      >
        <div className="flex items-center space-x-3">
            {/* Selected Icon with rounded background */}
            <div className={`p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 transition-colors`}>
                <SelectedIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-gray-900 leading-tight">{selectedType.name}</span>
                <span className="text-xs text-gray-500 leading-tight mt-0.5">{selectedType.description}</span>
            </div>
        </div>
        <Icons.ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[420px] overflow-y-auto">
           {CATEGORY_ORDER.map(category => {
             const jobsInCategory = JOB_TYPES.filter(j => j.category === category);
             if (jobsInCategory.length === 0) return null;

             return (
               <div key={category} className="border-b border-gray-100 last:border-0">
                 <div className="px-3 py-1.5 bg-gray-50/95 backdrop-blur-sm text-[11px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b border-gray-100">
                   {CATEGORY_LABELS[category]}
                 </div>
                 <div className="py-1">
                    {jobsInCategory.map(type => {
                        const TypeIcon = Icons[type.icon] as LucideIcon;
                        const isSelected = value === type.id;
                        return (
                            <div 
                                key={type.id}
                                onClick={() => {
                                    onChange(type.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-start space-x-3 px-3 py-2.5 cursor-pointer transition-colors group ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`flex-shrink-0 p-2 rounded-lg transition-colors ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-blue-500'}`}>
                                    <TypeIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <div className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-gray-800'}`}>
                                        {type.name}
                                    </div>
                                    <div className={`text-xs mt-0.5 leading-snug ${isSelected ? 'text-blue-500/80' : 'text-gray-500'}`}>
                                        {type.description}
                                    </div>
                                </div>
                                {isSelected && <Icons.CheckCircle className="w-4 h-4 text-blue-600 mt-1.5" />}
                            </div>
                        );
                    })}
                 </div>
               </div>
             );
           })}
        </div>
      )}
    </div>
  );
};

// --- Mock Branches Data ---
const MOCK_BRANCHES = [
    { name: 'master', remote: true },
    { name: 'main', remote: true },
    { name: 'develop', remote: true },
    { name: 'staging', remote: true },
    { name: 'feature/login-page', remote: true },
    { name: 'feature/user-profile', remote: true },
    { name: 'fix/auth-bug', remote: true },
    { name: 'fix/nav-issue', remote: true },
    { name: 'release/v1.0.0', remote: true },
    { name: 'release/v1.1.0', remote: true },
];

// --- JobConfigForm Component ---

interface JobConfigFormProps {
  job: Job;
  onChange: (job: Job) => void;
}

export const JobConfigForm: React.FC<JobConfigFormProps> = ({ job, onChange }) => {
  const [branchSearch, setBranchSearch] = useState('');
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);

  // Initialize search input with current job config
  useEffect(() => {
    if (job.config.branch) {
        setBranchSearch(job.config.branch);
    } else {
        setBranchSearch('');
    }
  }, [job.id]); // Reset when job changes

  // Update job config when search input changes
  const handleBranchChange = (val: string) => {
      setBranchSearch(val);
      onChange({ ...job, config: { ...job.config, branch: val } });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setIsBranchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBranches = MOCK_BRANCHES.filter(b => 
    b.name.toLowerCase().includes(branchSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务名称 <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                value={job.name}
                onChange={e => onChange({...job, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="请输入任务名称"
            />
       </div>

       <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务类型 <span className="text-red-500">*</span></label>
            <JobTypeSelector 
                value={job.type}
                onChange={type => onChange({...job, type})}
            />
       </div>

       <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Icons.Settings className="w-4 h-4 mr-2 text-gray-500" />
                任务配置
            </h3>

            {/* Common Job Configuration: Timeout */}
            <div className="mb-6">
                <label className="block text-xs font-medium text-gray-600 mb-1">超时时间 (分钟)</label>
                <div className="relative">
                    <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none pr-10"
                        placeholder="默认"
                        value={job.config.timeout !== undefined ? job.config.timeout : ''}
                        onChange={(e) => onChange({...job, config: {...job.config, timeout: e.target.value ? parseInt(e.target.value) : undefined}})}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Icons.Clock className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Git Source Config */}
            {job.type === 'git-source' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">代码库</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="owner/repo"
                            value={job.config.repo || ''}
                            onChange={(e) => onChange({...job, config: {...job.config, repo: e.target.value}})}
                        />
                    </div>
                    <div className="relative" ref={branchRef}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">默认分支</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="选择或输入分支"
                                value={branchSearch}
                                onChange={(e) => handleBranchChange(e.target.value)}
                                onFocus={() => setIsBranchOpen(true)}
                                autoComplete="off"
                            />
                            <Icons.GitBranch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            {isBranchOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto animate-fade-in">
                                    {filteredBranches.length > 0 ? (
                                        filteredBranches.map(b => (
                                            <div 
                                                key={b.name}
                                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                                                onClick={() => {
                                                    handleBranchChange(b.name);
                                                    setIsBranchOpen(false);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <Icons.GitBranch className="w-3.5 h-3.5 mr-2 text-gray-400 group-hover:text-blue-500" />
                                                    <span className="text-sm text-gray-700 font-mono">{b.name}</span>
                                                </div>
                                                {b.remote && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">origin</span>}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-3 py-4 text-center text-gray-500 text-xs">
                                            未找到匹配的分支
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Docker Build Config */}
            {job.type === 'build-docker' && (
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">镜像名称</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="例如: my-registry/my-app:v1.0"
                            value={job.config.image || ''}
                            onChange={(e) => onChange({...job, config: {...job.config, image: e.target.value}})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Dockerfile 路径</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="./Dockerfile"
                            value={job.config.dockerfile || ''}
                            onChange={(e) => onChange({...job, config: {...job.config, dockerfile: e.target.value}})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">构建上下文</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="."
                            value={job.config.context || ''}
                            onChange={(e) => onChange({...job, config: {...job.config, context: e.target.value}})}
                        />
                    </div>
                </div>
            )}

            {/* Maven Config (Build & Test) */}
            {(job.type === 'build-maven' || job.type === 'test-maven') && (
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">JDK 版本</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                            value={job.config.jdkVersion || 'jdk-11'}
                            onChange={(e) => onChange({...job, config: {...job.config, jdkVersion: e.target.value}})}
                        >
                            <option value="jdk-8">JDK 1.8</option>
                            <option value="jdk-11">JDK 11</option>
                            <option value="jdk-17">JDK 17</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Maven 命令</label>
                        <div className="flex items-center">
                            <span className="px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l text-sm text-gray-500">mvn</span>
                            <input 
                                type="text" 
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                placeholder="clean package -DskipTests"
                                value={job.config.mvnCommand || ''}
                                onChange={(e) => onChange({...job, config: {...job.config, mvnCommand: e.target.value}})}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Golang Config */}
            {(job.type === 'test-go' || job.type === 'build-go') && (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Go 版本</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                            value={job.config.goVersion || '1.18'}
                            onChange={(e) => onChange({...job, config: {...job.config, goVersion: e.target.value}})}
                        >
                            <option value="1.16">Go 1.16</option>
                            <option value="1.18">Go 1.18</option>
                            <option value="1.20">Go 1.20</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">测试命令</label>
                        <textarea 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            rows={3}
                            value={job.config.command || 'go test ./...'}
                            onChange={(e) => onChange({...job, config: {...job.config, command: e.target.value}})}
                        />
                    </div>
                </div>
            )}

            {/* Deploy Config */}
            {job.type === 'deploy' && (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Kubernetes 集群</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white">
                            <option>Cluster-Prod-01</option>
                            <option>Cluster-Dev-01</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Namespace</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            value={job.config.namespace || 'default'}
                            onChange={(e) => onChange({...job, config: {...job.config, namespace: e.target.value}})}
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">YAML 文件路径</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            value={job.config.yamlPath || './deploy.yaml'}
                            onChange={(e) => onChange({...job, config: {...job.config, yamlPath: e.target.value}})}
                        />
                    </div>
                 </div>
            )}

            {/* Security Scan */}
            {job.type === 'security-scan' && (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">扫描级别</label>
                        <div className="flex space-x-4">
                             {['Low', 'Medium', 'High'].map(level => (
                                 <label key={level} className="flex items-center space-x-2 cursor-pointer">
                                     <input 
                                        type="radio" 
                                        name="scanLevel"
                                        checked={job.config.scanLevel === level || (level === 'Medium' && !job.config.scanLevel)}
                                        onChange={() => onChange({...job, config: {...job.config, scanLevel: level}})}
                                        className="text-blue-600 focus:ring-blue-500" 
                                     />
                                     <span className="text-sm text-gray-700">{level}</span>
                                 </label>
                             ))}
                        </div>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded text-blue-600 focus:ring-blue-500"
                            checked={job.config.blockOnFailure !== false}
                            onChange={(e) => onChange({...job, config: {...job.config, blockOnFailure: e.target.checked}})}
                        />
                        <span className="text-sm text-gray-700">发现高危漏洞时阻断流水线</span>
                    </label>
                </div>
            )}
            
            {/* Manual Approval */}
            {job.type === 'manual-approval' && (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">审批人</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="user1, user2"
                            value={job.config.approvers ? job.config.approvers.join(', ') : ''}
                            onChange={(e) => onChange({...job, config: {...job.config, approvers: e.target.value.split(',').map(s => s.trim())}})}
                        />
                        <p className="text-xs text-gray-500 mt-1">多个审批人请用逗号分隔</p>
                    </div>
                 </div>
            )}

            {/* Script */}
            {job.type === 'script' && (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">脚本内容</label>
                        <textarea 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono h-32 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="#!/bin/bash\necho 'Hello World'"
                            value={job.config.script || ''}
                            onChange={(e) => onChange({...job, config: {...job.config, script: e.target.value}})}
                        />
                    </div>
                 </div>
            )}
            
            {/* Seaborn Report */}
            {job.type === 'seaborn-report' && (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">数据源脚本路径</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            placeholder="./scripts/generate_data.py"
                            value={job.config.scriptPath || ''}
                            onChange={(e) => onChange({...job, config: {...job.config, scriptPath: e.target.value}})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">图表类型</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                            value={job.config.chartType || 'line'}
                            onChange={(e) => onChange({...job, config: {...job.config, chartType: e.target.value}})}
                        >
                            <option value="line">折线图 (Line)</option>
                            <option value="bar">柱状图 (Bar)</option>
                            <option value="scatter">散点图 (Scatter)</option>
                            <option value="heatmap">热力图 (Heatmap)</option>
                        </select>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="rounded text-blue-600 focus:ring-blue-500"
                                checked={job.config.showTooltips !== false}
                                onChange={(e) => onChange({...job, config: {...job.config, showTooltips: e.target.checked}})}
                            />
                            <span className="text-sm text-gray-700 font-medium">悬停显示数据提示 (Tooltips)</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 pl-6">
                            启用后，鼠标悬停在数据点上时将显示详细数值信息。
                        </p>
                    </div>
                 </div>
            )}
       </div>
    </div>
  );
};
