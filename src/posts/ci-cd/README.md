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

- [5-1 部署与发布策略](5-1-deployment-release-strategies.md)
  - [5-1-1 环境管理与隔离：开发、测试、预发、生产环境的自动化管理](5-1-1-environment-management-isolation.md)
  - [5-1-2 部署策略详解：蓝绿部署、金丝雀发布、滚动发布、功能开关](5-1-2-deployment-strategy-details.md)
  - [5-1-3 与Kubernetes的深度集成：Helm/Manifest的自动化部署](5-1-3-kubernetes-integration.md)
  - [5-1-4 审批与安全管控：人工卡点、安全扫描、合规检查](5-1-4-approval-security-control.md)

### 第四部分：运维、观测与落地篇

- [8-1 平台运营与最佳实践](8-1-platform-operations-best-practices.md)
  - [8-1-1 流水线模板库与共享库：促进最佳实践复用，降低使用门槛](8-1-1-pipeline-template-library.md)
  - [8-1-2 多租户与权限管理（RBAC）：项目隔离、资源配额](8-1-2-multi-tenancy-permission-management.md)
  - [8-1-3 推广与赋能：文档、培训、支持，培育内部专家](8-1-3-promotion-empowerment.md)
  - [8-1-4 常见问题与避坑指南：依赖问题、环境问题、网络问题](8-1-4-common-issues-pitfall-guide.md)

- [9-1 与生态系统的集成](9-1-ecosystem-integration.md)
  - [9-1-1 与项目管理工具（Jira）集成：需求驱动部署](9-1-1-project-management-integration.md)
  - [9-1-2 与监控系统（Prometheus）集成：部署后自动验证](9-1-2-monitoring-system-integration.md)
  - [9-1-3 与沟通工具（钉钉/企微）集成：构建结果通知](9-1-3-communication-tools-integration.md)
  - [9-1-4 与Serverless/FaaS平台集成](9-1-4-serverless-faas-integration.md)

- [10-1 安全与合规（DevSecOps）](10-1-security-compliance-devsecops.md)
  - [10-1-1 左移的安全实践：SAST/DAST/SCA工具在流水线中的集成](10-1-1-left-shift-security-practices.md)
  - [10-1-2 密钥与凭据管理：与Vault等 secrets manager 集成](10-1-2-secrets-credentials-management.md)
  - [10-1-3 合规性即代码：自动化审计与合规检查](10-1-3-compliance-as-code.md)
  - [10-1-4 镜像安全扫描：CVE漏洞扫描与阻断](10-1-4-image-security-scanning.md)

- [11-1 可观测性与效能度量](11-1-observability-effectiveness-metrics.md)
  - [11-1-1 流水线可视化：全局视图、实时日志、执行历史](11-1-1-pipeline-visualization.md)
  - [11-1-2 平台自身监控：健康度、性能、队列状态](11-1-2-platform-monitoring.md)
  - [11-1-3 研发效能度量：DORA指标看板、瓶颈分析、驱动改进](11-1-3-rd-effectiveness-metrics.md)
  - [11-1-4 效能度量实践：DORA指标与自定义指标体系](11-1-4-effectiveness-metrics-practice.md)

### 第五部分：进阶与未来篇

- [14-1 GitOps模式实践](14-1-gitops-practice.md)
  - [14-1-1 GitOps核心思想：声明式、版本控制、自动同步](14-1-1-gitops-core-concepts.md)
  - [14-1-2 使用Argo CD/FluxCD实现GitOps部署模式](14-1-2-gitops-with-argocd-fluxcd.md)
  - [14-1-3 应用与基础设施的统一交付](14-1-3-unified-delivery-of-applications-and-infrastructure.md)

- [15-1 AIOps在CI/CD中的探索](15-1-aiops-in-cicd.md)
  - [15-1-1 智能测试优化：预测性测试选择、故障测试用例识别](15-1-1-intelligent-test-optimization.md)
  - [15-1-2 智能资源调度与成本优化](15-1-2-intelligent-resource-scheduling-cost-optimization.md)
  - [15-1-3 异常构建的智能根因分析](15-1-3-intelligent-root-cause-analysis.md)

- [16-1 未来演进趋势](16-1-future-evolution-trends.md)
  - [16-1-1 内部开发者平台（IDP）与CI/CD](16-1-1-idp-and-cicd.md)
  - [16-1-2 安全与合规的进一步自动化](16-1-2-security-compliance-automation.md)
  - [16-1-3 云原生环境下的CI/CD新范式](16-1-3-cloud-native-cicd-paradigms.md)

### 附录

- [附录A：主流CI/CD工具对比](appendix-a-cicd-tools-comparison.md)
- [附录B：Jenkinsfile/GitLab CI YAML 编写指南](appendix-b-pipeline-configuration-guide.md)
- [附录C：Dockerfile 最佳实践](appendix-c-dockerfile-best-practices.md)
- [附录D：术语表 (CI, CD, DevOps, SRE, DORA, etc.)](appendix-d-glossary.md)