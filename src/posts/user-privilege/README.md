# 企业级统一身份治理平台：可落地的用户、权限与SSO全生命周期建设

本文档系列基于同名书籍，深入探讨企业级统一身份治理平台的设计与实现。

## 第一章：为什么需要统一的身份治理平台？

- [1-1-why-need-unified-identity-governance-platform.md](1-1-why-need-unified-identity-governance-platform.md) - 为什么需要统一的身份治理平台？（概述）
- [1-1-1-digital-transformation-identity-management-pain-points.md](1-1-1-digital-transformation-identity-management-pain-points.md) - 数字化转型下的身份管理之痛：烟囱系统、权限混乱、效率低下
- [1-1-2-core-values-unified-identity-governance-platform.md](1-1-2-core-values-unified-identity-governance-platform.md) - 统一身份治理平台的核心价值：安全、效率、合规、体验

## 第二章：核心理论基础与开放标准

- [1-2-core-theory-basis-open-standards.md](1-2-core-theory-basis-open-standards.md) - 核心理论基础与开放标准（概述）
- [1-2-1-authentication-vs-authorization-oauth2-oidc-saml2.md](1-2-1-authentication-vs-authorization-oauth2-oidc-saml2.md) - 认证（Authentication）vs. 授权（Authorization）：OAuth 2.0、OIDC、SAML 2.0 核心原理详解
- [1-2-2-permission-models-dac-mac-rbac-abac.md](1-2-2-permission-models-dac-mac-rbac-abac.md) - 权限模型基石：自主访问控制（DAC）、强制访问控制（MAC）、基于角色的访问控制（RBAC）、基于属性的访问控制（ABAC）

## 第三章：平台建设前的战略规划与设计原则

- [1-3-strategic-planning-design-principles.md](1-3-strategic-planning-design-principles.md) - 平台建设前的战略规划与设计原则（概述）
- [1-3-1-requirements-survey-current-analysis.md](1-3-1-requirements-survey-current-analysis.md) - 需求调研与现状分析：梳理现有系统、用户类型、权限场景
- [1-3-2-evolution-roadmap-unified-account-to-identity-governance.md](1-3-2-evolution-roadmap-unified-account-to-identity-governance.md) - 制定演进路线图：从统一账号到全面身份治理

## 第四章：统一用户中心设计

- [1-4-unified-user-center-design.md](1-4-unified-user-center-design.md) - 统一用户中心设计（概述）
- [1-4-1-user-model-abstraction.md](1-4-1-user-model-abstraction.md) - 用户模型抽象：个人用户、设备、应用、API账号
- [1-4-2-organization-structure-design.md](1-4-2-organization-structure-design.md) - 组织架构设计：支持多维级联、动态团队、虚拟组

## 第五章：认证体系实现（AuthN）

- [1-5-authentication-system-implementation.md](1-5-authentication-system-implementation.md) - 认证体系实现（AuthN）（概述）
- [1-5-1-core-authentication-engine.md](1-5-1-core-authentication-engine.md) - 核心认证引擎：密码认证、短信/邮箱验证码、第三方社交登录
- [1-5-2-mfa-integration.md](1-5-2-mfa-integration.md) - 多因子认证（MFA）集成：TOTP、短信、邮件、生物识别、安全密钥

## 后续章节待生成

（此处将在后续生成过程中逐步添加）