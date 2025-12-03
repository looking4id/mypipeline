

export type Tab = 'basic' | 'workflow' | 'variables' | 'advanced';

export interface PipelineVariable {
  id: string;
  name: string;
  type: 'string' | 'enum' | 'boolean';
  defaultValue: string;
  description?: string;
  isSecret?: boolean;
}

export interface JobConfig {
  [key: string]: any;
}

export interface Job {
  id: string;
  name: string;
  type: string;
  description?: string;
  config: JobConfig;
}

export interface Stage {
  id: string;
  name: string;
  groups: Job[][]; // Array of job groups. Outer array = parallel, Inner array = serial.
  isParallel?: boolean;
}

export interface PipelineData {
  name: string;
  id: string;
  description: string;
  variables: PipelineVariable[];
  stages: Stage[];
  settings: {
    cron: string;
    timeout: number;
    retryCount: number;
    skipStrategy: string;
  };
}

export const INITIAL_PIPELINE: PipelineData = {
  name: "流水线-202212141737",
  id: "p-20221214-001",
  description: "Standard CI/CD pipeline for backend services",
  variables: [
    { id: 'v1', name: 'var1', type: 'string', defaultValue: '仓库名称', description: 'Target repository name' }
  ],
  stages: [
    {
      id: 's1',
      name: '源',
      groups: [
        [{ id: 'j1', name: 'gitee-go/spring-boot', type: 'git-source', config: { repo: 'spring-boot', branch: 'master' } }],
        [{ id: 'j2', name: 'gitee-go/golang-build-case', type: 'git-source', config: { repo: 'golang-build', branch: 'master' } }],
        [{ id: 'j-new-1', name: 'New Git Source', type: 'git-source', config: { repo: '', branch: 'main' } }]
      ]
    },
    {
      id: 's2',
      name: '测试',
      groups: [
        [
          { id: 'j3', name: 'Maven 单元测试', type: 'test-maven', config: {} },
          { id: 'j4', name: 'Jacoco 覆盖率采集', type: 'test-coverage', config: {} }
        ],
        [
          { id: 'j5', name: 'Golang 单元测试', type: 'test-go', config: {} }
        ]
      ]
    },
    {
      id: 's3',
      name: '人工审批',
      groups: [
        [{ id: 'j6', name: '人工卡点', type: 'manual-approval', config: { approvers: ['admin'] } }]
      ]
    },
    {
      id: 's4',
      name: '构建',
      groups: [
        [{ id: 'j7', name: 'Maven 构建', type: 'build-maven', config: {} }],
        [{ id: 'j8', name: 'SBOM 扫描', type: 'security-scan', config: {} }],
        [{ id: 'j10', name: 'Docker Build', type: 'build-docker', config: { image: 'my-app:latest', dockerfile: './Dockerfile' } }],
        [{ id: 'j11', name: 'Run Script', type: 'script', config: { script: 'echo "Running post-build script..."' } }]
      ]
    },
    {
      id: 's5',
      name: '发布',
      groups: [
        [{ id: 'j9', name: 'Kubernetes 发布', type: 'deploy', config: {} }]
      ]
    }
  ],
  settings: {
    cron: '0 0 * * *',
    timeout: 60,
    retryCount: 0,
    skipStrategy: 'none'
  }
};