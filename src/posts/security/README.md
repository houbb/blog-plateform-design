# 企业级统一安全能力平台建设：从基础安全到智能防御的全生命周期实践

本书旨在帮助**CISO（首席信息安全官）、安全架构师、运维负责人、研发总监**构建一个纵深防御、主动管控、可观测、可度量的统一安全能力平台。

## 目录

### 第一部分：理念与战略篇——重新定义企业安全

**第1章：数字时代的安全新范式：从被动响应到主动免疫**
* [1-1-digital-age-security-new-paradigm.md](1-1-digital-age-security-new-paradigm.md) - 数字时代的安全新范式：从被动响应到主动免疫
  * [1-1-1-security-architecture-evolution.md](1-1-1-security-architecture-evolution.md) - 安全体系的演进：从边界防护到零信任、从合规驱动到风险驱动
  * [1-1-2-security-platform-core-value.md](1-1-2-security-platform-core-value.md) - 安全平台的核心价值：降低风险、满足合规、保障业务、赋能发展
  * [1-1-3-security-shift-left-and-devsecops.md](1-1-3-security-shift-left-and-devsecops.md) - 安全左移与DevSecOps：将安全能力嵌入到研发运维全生命周期（Day 0）
  * [1-1-4-security-lifecycle-closure.md](1-1-4-security-lifecycle-closure.md) - "全生命周期"内涵：覆盖预防、防御、检测、响应的安全闭环

**第2章：企业安全架构与合规框架**
* [2-1-enterprise-security-architecture-and-compliance-framework.md](2-1-enterprise-security-architecture-and-compliance-framework.md) - 企业安全架构与合规框架
  * [2-1-1-known-security-architecture-reference.md](2-1-1-known-security-architecture-reference.md) - 知名安全架构参考：零信任架构（ZTA）、网络安全框架（CSF）
  * [2-1-2-compliance-requirements.md](2-1-2-compliance-requirements.md) - 合规性要求：等保2.0、GDPR、ISO 27001、PCI DSS中的平台能力要求
  * [2-1-3-security-domain-division-and-control-strategy.md](2-1-3-security-domain-division-and-control-strategy.md) - 安全域划分与管控策略：网络、主机、应用、数据安全
  * [2-1-4-security-metrics-and-indicator-system.md](2-1-4-security-metrics-and-indicator-system.md) - 安全度量与指标体系：量化安全水位、投入产出比（ROSI）

**第3章：平台战略与顶层规划**
* [3-1-platform-strategy-and-top-level-planning.md](3-1-platform-strategy-and-top-level-planning.md) - 平台战略与顶层规划
  * [3-1-1-current-status-assessment-and-gap-analysis.md](3-1-1-current-status-assessment-and-gap-analysis.md) - 现状评估与差距分析（GAP Analysis）：识别最大风险与能力短板
  * [3-1-2-design-principles.md](3-1-2-design-principles.md) - 设计原则：纵深防御、最小权限、永不信任、始终验证
  * [3-1-3-technology-selection.md](3-1-3-technology-selection.md) - 技术选型：自研 vs. 采购商用产品 vs. 开源组合（Wazuh, Osquery, TheHive等）
  * [3-1-4-evolution-roadmap.md](3-1-4-evolution-roadmap.md) - 演进路线图：从基础安全加固到智能安全运营的演进路径

### 第二部分：基础安全能力篇——安全的基石

**第4章：密码基础设施与密钥管理**
* [4-1-cryptographic-infrastructure-and-key-management.md](4-1-cryptographic-infrastructure-and-key-management.md) - 密码基础设施与密钥管理
  * [4-1-1-hardware-security-module.md](4-1-1-hardware-security-module.md) - 硬件安全模块（HSM/加密机）：原理、选型与部署，保障密钥安全
  * [4-1-2-key-lifecycle-management.md](4-1-2-key-lifecycle-management.md) - 密钥全生命周期管理：生成、存储、轮换、使用、归档、销毁
  * [4-1-3-certificate-management-service.md](4-1-3-certificate-management-service.md) - 证书管理服务（CMS）：SSL/TLS证书、代码签名证书的自动申请、部署和更新
  * [4-1-4-key-management-and-application-integration.md](4-1-4-key-management-and-application-integration.md) - 密钥管理与应用集成：通过KMS（密钥管理服务）为应用提供透明加密

**第5章：身份与访问管理（IAM）**
* [5-1-identity-and-access-management.md](5-1-identity-and-access-management.md) - 身份与访问管理（IAM）
  * [5-1-1-unified-identity-authentication.md](5-1-1-unified-identity-authentication.md) - 统一身份认证（SSO）：集成AD/LDAP、OAUTH 2.0、OIDC、SAML 2.0
  * [5-1-2-fine-grained-authorization.md](5-1-2-fine-grained-authorization.md) - 细粒度授权（RBAC/ABAC）：实现基于角色和属性的访问控制
  * [5-1-3-privileged-access-management.md](5-1-3-privileged-access-management.md) - 特权访问管理（PAM）：管理服务器、数据库、网络设备等高权限账号
  * [5-1-4-multi-factor-authentication-global-mandatory-policy.md](5-1-4-multi-factor-authentication-global-mandatory-policy.md) - 多因子认证（MFA）全局强制策略

**第6章：数据安全与隐私保护**
* [6-1-data-security-and-privacy-protection.md](6-1-data-security-and-privacy-protection.md) - 数据安全与隐私保护
  * [6-1-1-data-classification-and-grading.md](6-1-1-data-classification-and-grading.md) - 数据分类分级：自动识别敏感数据（PII、PCI）
  * [6-1-2-data-encryption.md](6-1-2-data-encryption.md) - 数据加密：透明加密（TDE）、应用层加密、字段级加密
  * [6-1-3-data-masking.md](6-1-3-data-masking.md) - 数据脱敏：静态脱敏（用于测试）、动态脱敏（用于生产查询）
  * [6-1-4-data-leak-prevention.md](6-1-4-data-leak-prevention.md) - 数据泄露防护（DLP）：监控与阻断敏感数据外传

### 第三部分：主动防御与检测响应篇

**第7章：应用与架构安全（安全左移）**
* [7-1-application-and-architecture-security-devsecops.md](7-1-application-and-architecture-security-devsecops.md) - 应用与架构安全（安全左移）
  * [7-1-1-day-0-security-architecture-review.md](7-1-1-day-0-security-architecture-review.md) - Day 0 安全架构检视：在设计阶段引入威胁建模（STRIDE）
  * [7-1-2-software-composition-analysis.md](7-1-2-software-composition-analysis.md) - 组件软件成分分析（SCA）：管理第三方库漏洞与许可证风险
  * [7-1-3-static-application-security-testing.md](7-1-3-static-application-security-testing.md) - 静态应用安全测试（SAST）：集成CI/CD，在编码阶段发现漏洞
  * [7-1-4-dynamic-and-interactive-application-security-testing.md](7-1-4-dynamic-and-interactive-application-security-testing.md) - 动态应用安全测试（DAST）与交互式安全测试（IAST）

**第8章：全栈可观测性与安全审计**
* [8-1-full-stack-observability-and-security-audit.md](8-1-full-stack-observability-and-security-audit.md) - 全栈可观测性与安全审计
  * [8-1-1-unified-log-collection.md](8-1-1-unified-log-collection.md) - 统一日志采集：汇集操作系统、网络设备、数据库、应用日志
  * [8-1-2-security-log-audit.md](8-1-2-security-log-audit.md) - 安全日志审计：标准化（CEE）、关联分析、异常检测
  * [8-1-3-endpoint-detection-and-response.md](8-1-3-endpoint-detection-and-response.md) - 终端检测与响应（EDR）：主机层面的恶意行为监控与响应
  * [8-1-4-network-traffic-analysis.md](8-1-4-network-traffic-analysis.md) - 网络流量分析（NTA）：检测横向移动与未知威胁

**第9章：安全事件响应与自动化（SOAR）**
* [9-1-security-incident-response-and-automation.md](9-1-security-incident-response-and-automation.md) - 安全事件响应与自动化（SOAR）
  * [9-1-1-security-information-and-event-management.md](9-1-1-security-information-and-event-management.md) - 安全事件管理（SIEM）：作为安全事件的中枢
  * [9-1-2-response-process-orchestration.md](9-1-2-response-process-orchestration.md) - 响应流程编排：自动化处理低复杂度告警（如封禁IP、下线主机）
  * [9-1-3-threat-intelligence-integration.md](9-1-3-threat-intelligence-integration.md) - 威胁情报集成：自动拉取IoC（入侵指标）并阻断
  * [9-1-4-incident-response-and-playbook-management.md](9-1-4-incident-response-and-playbook-management.md) - 应急响应与预案管理：线上化演练与执行

### 第四部分：平台化运营与治理篇

**第10章：安全运营中心（SOC）平台**
* [10-1-security-operations-center-platform.md](10-1-security-operations-center-platform.md) - 安全运营中心（SOC）平台
  * [10-1-1-security-situation-overview.md](10-1-1-security-situation-overview.md) - 安全态势总览：全局风险水位、攻击态势、待处理事件
  * [10-1-2-case-management-and-collaboration.md](10-1-2-case-management-and-collaboration.md) - 案件管理与协同：安全事件的线上化分派、调查、闭环
  * [10-1-3-knowledge-base-and-playbooks.md](10-1-3-knowledge-base-and-playbooks.md) - 知识库与剧本：沉淀调查步骤、处置方案、应急预案
  * [10-1-4-security-metrics-and-reporting.md](10-1-4-security-metrics-and-reporting.md) - 安全度量与报告：自动生成合规报告、向上汇报材料

**第11章：平台实施与集成**
* [11-1-platform-implementation-and-integration.md](11-1-platform-implementation-and-integration.md) - 平台实施与集成
  * [11-1-1-phased-implementation.md](11-1-1-phased-implementation.md) - 分阶段实施：先夯实基础（IAM、日志），再建设高级能力（威胁检测）
  * [11-1-2-integration-with-existing-ecosystem.md](11-1-2-integration-with-existing-ecosystem.md) - 与现有生态集成：与CMDB、ITSM、监控平台、CI/CD工具打通
  * [11-1-3-change-management-and-promotion.md](11-1-3-change-management-and-promotion.md) - 变更管理与推广：安全流程的标准化与推广，改变工程师习惯
  * [11-1-4-continuous-training-and-red-blue-team-exercises.md](11-1-4-continuous-training-and-red-blue-team-exercises.md) - 持续培训与红蓝对抗：提升团队能力，检验平台有效性

**第12章：安全治理与持续改进**
* [12-1-security-governance-and-continuous-improvement.md](12-1-security-governance-and-continuous-improvement.md) - 安全治理与持续改进
  * [12-1-1-security-policy-management.md](12-1-1-security-policy-management.md) - 安全策略管理：集中化管理防火墙、WAF、IPS等策略
  * [12-1-2-vulnerability-lifecycle-management.md](12-1-2-vulnerability-lifecycle-management.md) - 漏洞全生命周期管理：从发现、分发、修复到验证的闭环
  * [12-1-3-risk-assessment-and-governance.md](12-1-3-risk-assessment-and-governance.md) - 风险评估与治理：定期进行风险评估，驱动安全预算投入
  * [12-1-4-platform-security-and-audit.md](12-1-4-platform-security-and-audit.md) - 平台自身的安全与审计：保障平台的可信度

### 第五部分：进阶与未来篇

**第13章：云原生安全**
* [13-1-cloud-native-security.md](13-1-cloud-native-security.md) - 云原生安全：构建企业级统一安全能力平台的云原生安全防护体系
  * [13-1-1-container-security.md](13-1-1-container-security.md) - 容器安全：镜像扫描、运行时安全、Kubernetes安全加固
  * [13-1-2-cloud-security-posture-management.md](13-1-2-cloud-security-posture-management.md) - 云安全态势管理（CSPM）：自动化检测云平台错误配置
  * [13-1-3-service-mesh-security.md](13-1-3-service-mesh-security.md) - 服务网格安全：零信任在微服务间的实践

**第14章：智能安全（AISecOps）**
* [14-1-intelligent-security.md](14-1-intelligent-security.md) - 智能安全：构建企业级统一安全能力平台的智能化安全防护体系
  * [14-1-2-security-prediction-and-hunting.md](14-1-2-security-prediction-and-hunting.md) - 安全预测与狩猎：主动发现潜伏的高级持续性威胁（APT）
  * [14-1-3-automated-vulnerability-exploitation-prediction.md](14-1-3-automated-vulnerability-exploitation-prediction.md) - 自动化漏洞利用预测与优先级排序

**第15章：未来趋势与展望**
* [15-1-future-trends-and-outlook.md](15-1-future-trends-and-outlook.md) - 未来趋势与展望：企业安全的下一个十年
  * [15-1-1-privacy-computing-and-confidential-computing.md](15-1-1-privacy-computing-and-confidential-computing.md) - 隐私计算与机密计算：数据安全共享的新范式
  * [15-1-2-supply-chain-security-and-sbom.md](15-1-2-supply-chain-security-and-sbom.md) - 供应链安全与SBOM（软件物料清单）：构建可信软件供应链的基石
  * [15-1-3-security-capability-api-and-self-service.md](15-1-3-security-capability-api-and-self-service.md) - 安全能力的API化与自助服务：构建敏捷安全运营新模式

### 附录

* [appendix-a-open-source-security-tool-stack-selection-guide.md](appendix-a-open-source-security-tool-stack-selection-guide.md) - 附录A：开源安全工具栈选型指南
* [appendix-b-security-requirements-checklist.md](appendix-b-security-requirements-checklist.md) - 附录B：安全需求 checklist
* [appendix-c-common-vulnerability-handling-manual.md](appendix-c-common-vulnerability-handling-manual.md) - 附录C：常见漏洞处置手册
* [appendix-d-glossary.md](appendix-d-glossary.md) - 附录D：术语表

---
*本文档最后更新时间：2025年9月7日*