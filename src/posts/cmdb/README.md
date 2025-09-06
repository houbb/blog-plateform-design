# 运维基石：可落地的CMDB平台全生命周期建设与实践

这是为《运维基石：可落地的CMDB平台全生命周期建设与实践》一书生成的系列文章索引。

## 第一部分：理念与规划篇——为什么需要CMDB？

### 第1章：CMDB：数字化转型的运维基石

* [1-1-1 CMDB的核心价值：从混乱到有序，从被动到主动](1-1-1_the-core-value-of-cmdb.md)
* [1-1-2 重新定义CMDB：不仅是数据库，更是连接与消费的枢纽](1-1-2_redefining-cmdb.md)
* [1-1-3 常见误区与失败原因分析：为什么你的CMDB成了"僵尸系统"？](1-1-3_common-mistakes-and-failure-analysis.md)
* [1-1-4 "可落地"与"全生命周期"的内涵：涵盖设计、自动采集、消费、运营治理](1-1-4_the-essence-of-practical-and-full-lifecycle.md)

### 第2章：核心概念与模型设计

* [2-1-1 配置项（CI）：识别与管理一切需要管理的对象](2-1-1_configuration-items.md)
* [2-1-2 配置项关系：依赖、连接、包含——构建数字世界的拓扑图](2-1-2_ci-relationships.md)
* [2-1-3 数据模型设计：经典模型与自定义扩展](2-1-3_data-model-design.md)
* [2-1-4 消费场景驱动设计：你的监控、发布、告警需要什么数据？](2-1-4_consumption-scenario-driven-design.md)

### 第3章：项目启动与总体规划

* [3-1-1 目标设定与范围界定：从哪里开始？（MVP原则）](3-1-1_goal-setting-and-scope-definition.md)
* [3-1-2 团队组建与协作：运维、开发、DBA的角色](3-1-2_team-building-and-collaboration.md)
* [3-1-3 技术选型：自研 vs. 开源（iTop、CMDBuild、OneCMDB） vs. 商业产品](3-1-3_technology-selection.md)
* [3-1-4 演进路线图：从核心CI管理到全链路拓扑与赋能](3-1-4_evolution-roadmap.md)

### 第4章：平台架构设计

* [4-1-1 分层架构：数据采集层、核心服务层、API网关层、消费展示层](4-1-1_layered-architecture.md)
* [4-1-2 核心模块设计：CI管理、关系管理、自动发现、权限控制、操作审计](4-1-2_core-module-design.md)
* [4-1-3 高可用与高性能设计：数据库选型（MySQL/PostgreSQL/NewSQL）、缓存策略、水平扩展](4-1-3_high-availability-and-performance-design.md)
* [4-1-4 API-first设计：提供全面、稳定的Restful API供各方消费](4-1-4_api-first-design.md)

### 第5章：数据模型与关系建模

* [5-1-1 基础CI模型设计：服务器、网络设备、数据库、中间件、应用服务](5-1-1_basic-ci-model-design.md)
* [5-1-2 关系类型定义：运行于、连接至、依赖、集群关系等](5-1-2_relationship-type-definition.md)
* [5-1-3 元数据管理：模型版本控制、变更与兼容性](5-1-3_metadata-management.md)
* [5-1-4 灵活的自定义字段与模型扩展能力](5-1-4_flexible-custom-fields-and-model-extension.md)

### 第6章：数据的生命线——自动发现与采集

* [6-1-1 自动化是准确性的唯一保障：摒弃手动录入](6-1-1_automation-is-the-only-guarantee-of-accuracy.md)
* [6-1-2 多模式采集融合：Agent模式、无Agent模式、API集成模式、流量分析模式](6-1-2_multi-mode-collection-integration.md)
* [6-1-3 发现策略与调度：全量发现与增量发现](6-1-3_discovery-strategy-and-scheduling.md)
* [6-1-4 数据清洗、校验与合规检查](6-1-4_data-cleaning-validation-and-compliance.md)

### 第7章：数据的维护与治理

* [7-1-1 变更流程与CMDB的联动：一切变更皆记录](7-1-1_change-processes-and-cmdb-integration.md)
* [7-1-2 数据保鲜策略：定期扫描、变更事件触发更新](7-1-2_data-freshness-strategy.md)
* [7-1-3 数据质量监控：完整性、准确性、一致性度量与告警](7-1-3_data-quality-monitoring.md)
* [7-1-4 权限与审计：基于RBAC的数据访问控制，所有操作留痕](7-1-4_permissions-and-auditing.md)

### 第8章：资源可视化与拓扑管理

* [8-1-1 全局资源视图：多维度的资源检索与统计看板](8-1-1_global-resource-view.md)
* [8-1-2 网络拓扑可视化：自动绘制基于物理连接和网络协议的拓扑图](8-1-2_network-topology-visualization.md)
* [8-1-3 应用拓扑可视化：自动绘制服务依赖关系图（Service Map）](8-1-3_application-topology-visualization.md)
* [8-1-4 影响分析可视化：一键式影响范围分析（Impact Analysis）](8-1-4_impact-analysis-visualization.md)

### 第9章：作为运维核心的消费场景

* [9-1-1 赋能智能监控：精准告警、快速定位（告警关联CI）](9-1-1_enabling-intelligent-monitoring.md)
* [9-1-2 赋能自动化运维：基于CI信息的作业平台执行](9-1-2_enabling-automated-operations.md)
* [9-1-3 赋能ITSM：变更管理、事件管理、资产管理与CMDB的闭环](9-1-3_enabling-itsm.md)
* [9-1-4 赋能成本优化：资源与财务数据的关联分析](9-1-4_enabling-cost-optimization.md)

### 第10章：与云原生和DevOps生态的集成

* [10-1-1 纳管Kubernetes资源：Namespace, Pod, Service, Ingress及其关系](10-1-1_managing-kubernetes-resources.md)
* [10-1-2 与CI/CD流水线集成：应用发布时自动更新CMDB状态](10-1-2_ci-cd-pipeline-integration.md)
* [10-1-3 作为ServiceMesh和微治理的数据来源](10-1-3_servicemesh-and-micro-governance.md)
* [10-1-4 通过API为运维平台和数据分析平台提供数据服务](10-1-4_api-data-services.md)

### 第11章：分阶段实施与推广策略

* [11-1-1 第一阶段：聚焦基础架构CI（服务器、网络、数据库）及其关系](11-1-1_phase-1-focus-on-infrastructure-cis.md)
* [11-1-2 第二阶段：向上延伸至应用与服务，构建应用拓扑](11-1-2_phase-2-extend-to-applications-and-services.md)
* [11-1-3 第三阶段：深度集成，赋能全运维场景](11-1-3_phase-3-deep-integration.md)
* [11-1-4 推广技巧：找到关键消费者（如监控团队），打造成功案例](11-1-4_promotion-techniques.md)

### 第12章：持续运营与度量优化

* [12-1-1 建立CMDB运营团队或虚拟团队](12-1-1_establishing-cmdb-operations-team.md)
* [12-1-2 定义并度量CMDB健康度指标：数据准确率、API调用量、消费场景数量](12-1-2_defining-and-measuring-cmdb-health-metrics.md)
* [12-1-3 定期审计与数据清洗流程](12-1-3_regular-audits-and-data-cleaning.md)
* [12-1-4 收集反馈并持续迭代模型与功能](12-1-4_collecting-feedback-and-continuous-improvement.md)

### 第13章：挑战、陷阱与最佳实践

* [13-1-1 如何应对"最后一公里"的准确性问题？](13-1-1_addressing-the-last-mile-accuracy-challenge.md)
* [13-1-2 如何处理历史遗留数据和模糊关系？](13-1-2_handling-legacy-data-and-ambiguous-relationships.md)
* [13-1-3 如何平衡模型的规范性与灵活性？](13-1-3_balancing-model-standardization-and-flexibility.md)
* [13-1-4 来自一线实战的"避坑"指南](13-1-4_real-world-pitfall-avoidance-guide.md)

### 第14章：高阶特性与未来演进

* [14-1-1 配置漂移检测与合规性检查](14-1-1_configuration-drift-detection-and-compliance.md)
* [14-1-2 与ChatOps集成：通过聊天机器人查询资源信息](14-1-2_chatops-integration.md)
* [14-1-3 基于AI/ML的应用：异常关系发现、容量预测、根因分析推荐](14-1-3_ai-ml-applications.md)
* [14-1-4 CMDB as Code：用代码定义和管理模型与数据](14-1-4_cmdb-as-code.md)

### 第15章：构建运维数据平台（DataOps）

* [15-1-1 从CMDB到运维数据中台：汇聚所有运维数据](15-1-1_from-cmdb-to-ops-data-platform.md)
* [15-1-2 数据治理在运维领域的实践](15-1-2_data-governance-in-ops-practice.md)
* [15-1-3 基于全域运维数据的分析与决策](15-1-3_analysis-and-decision-making-based-on-full-ops-data.md)

## 附录

* [附录A：开源CMDB系统对比表](appendix-a_open-source-cmdb-system-comparison.md)
* [附录B：常用自动发现工具与协议](appendix-b_common-auto-discovery-tools-and-protocols.md)
* [附录C：CI模型设计示例](appendix-c_ci-model-design-examples.md)
* [附录D：术语表](appendix-d_glossary.md)