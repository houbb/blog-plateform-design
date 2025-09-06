# 企业级CI/CD平台建设：从代码提交到无缝交付的全生命周期实践

本文档索引了《企业级CI/CD平台建设：从代码提交到无缝交付的全生命周期实践》一书的所有章节内容。

## 目录

### 第一部分：理念与规划篇——CI/CD的战略价值

- [1-1 数字化转型的引擎：CI/CD的核心价值](1-1-digital-transformation-engine-core-value.md)
  - [1-1-1 从手工部署到持续交付：软件交付的演进史](1-1-1-from-manual-deployment-to-continuous-delivery.md)
  - [1-1-2 CI、CD、CD：厘清持续集成、持续交付与持续部署](1-1-2-ci-cd-cd-concepts.md)
  - [1-1-3 DevOps文化与CI/CD：相辅相成的双翼](1-1-3-devops-culture-and-ci-cd.md)
  - [1-1-4 "全生命周期"与"可落地"：涵盖开发、测试、部署、运维的端到端流水线](1-1-4-end-to-end-pipeline.md)

- [1-2 核心概念与原则](1-2-core-concepts-and-principles.md)
  - [1-2-1 基础组件：版本控制、流水线、构建工具、制品仓库、部署工具](1-2-1-foundation-components.md)
  - [1-2-2 关键原则：一切皆代码（Pipeline as Code, IaC）、自动化、快速反馈、持续改进](1-2-2-key-principles.md)
  - [1-2-3 度量指标：部署频率、变更前置时间、变更失败率、平均恢复时间（MTTR）](1-2-3-metrics.md)

- [1-3 平台建设前的战略规划](1-3-strategic-planning.md)
  - [1-3-1 需求分析与现状评估：梳理技术栈、团队结构、现有流程痛点](1-3-1-requirements-analysis.md)
  - [1-3-2 技术选型决策：自研 vs 基于开源（Jenkins, GitLab CI, Drone, Argo CD）二次开发](1-3-2-technology-selection.md)
  - [1-3-3 设计原则：可扩展性、稳定性、安全性、用户体验](1-3-3-design-principles.md)
  - [1-3-4 演进路线图：从标准化流水线到全自动化无人值守交付](1-3-4-evolution-roadmap.md)

### 第二部分：平台架构与核心引擎篇

- [2-1 平台总体架构设计](2-1-platform-architecture-design.md)
  - [2-1-1 分层架构：接入层、调度层、执行层、存储层、可视化层](2-1-1-layered-architecture.md)
  - [2-1-2 核心服务设计：流水线服务、代码仓库服务、制品库服务、环境管理服务](2-1-2-core-services.md)
  - [2-1-3 高可用与弹性设计：Master/Worker架构、基于Kubernetes的动态弹性伸缩](2-1-3-high-availability-elasticity.md)
  - [2-1-4 API-first与插件化设计](2-1-4-api-first-plugin-design.md)

- [2-2 流水线引擎设计与实现](2-2-pipeline-engine-design.md)
  - [2-2-1 流水线即代码（Pipeline as Code）：DSL vs YAML vs GUI](2-2-1-pipeline-as-code.md)
  - [2-2-2 流水线核心模型：阶段（Stage）、任务（Job）、步骤（Step）](2-2-2-pipeline-core-model.md)
  - [2-2-3 执行环境隔离：容器化（Docker/Kubernetes Pod）作为标准执行单元](2-2-3-execution-environment-isolation.md)
  - [2-2-4 流水线控制流：并行、串行、手动审批、重试、超时控制](2-2-4-pipeline-control-flow.md)

- [2-3 代码管理与集成](2-3-code-management-integration.md)
  - [2-3-1 与Git的深度集成：Webhook、Checkout策略、多仓库管理](2-3-1-git-integration.md)
  - [2-3-2 分支策略与流水线触发：Git Flow, GitHub Flow, Trunk-Based Development](2-3-2-branch-strategy-pipeline-trigger.md)
  - [2-3-3 代码扫描与质量门禁：SonarQube集成、代码规范检查](2-3-3-code-scanning-quality-gate.md)
  - [2-3-4 变更关联：将提交、流水线、构建、部署与需求/缺陷关联](2-3-4-change-correlation.md)

### 第三部分：功能与交付篇

- [3-1 构建与制品管理](3-1-build-artifact-management.md)
  - [3-1-1 多语言构建支持：Java, Go, Python, Node.js, .NET的标准化构建环境](3-1-1-multi-language-build.md)
  - [3-1-2 构建加速策略：缓存优化（依赖缓存、增量构建）、分布式构建](3-1-2-build-acceleration.md)
  - [3-1-3 制品仓库管理：管理Jar, Docker Image, Npm等制品，生命周期管理](3-1-3-artifact-repository.md)
  - [3-1-4 不可变制品与晋升流程：构建一次，多处部署](3-1-4-immutable-artifacts-promotion.md)

- [4-1 自动化测试集成](4-1-automated-testing-integration.md)
  - [4-1-1 测试金字塔在流水线中的落地：单元测试、集成测试、端到端测试](4-1-1-test-pyramid-implementation.md)
  - [4-1-2 自动化测试管理与执行：测试环境准备、测试用例筛选、测试报告分析](4-1-2-test-management-execution.md)
  - [4-1-3 质量门禁设置：测试覆盖率、通过率作为流水线推进的硬性条件](4-1-3-quality-gate-settings.md)

### 第四部分：运维、观测与落地篇

（此部分的文章将在后续生成）

### 第五部分：进阶与未来篇

（此部分的文章将在后续生成）