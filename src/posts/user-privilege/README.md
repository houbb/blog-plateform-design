# 企业级统一身份治理平台：可落地的用户、权限与SSO全生命周期建设

本文档系列基于同名书籍，深入探讨企业级统一身份治理平台的设计与实现。

## 第一章：为什么需要统一的身份治理平台？

- [1-1-why-need-unified-identity-governance-platform.md](1-1-why-need-unified-identity-governance-platform.md) - 为什么需要统一的身份治理平台？（概述）
- [1-1-1-digital-transformation-identity-pain-points.md](1-1-1-digital-transformation-identity-pain-points.md) - 数字化转型下的身份管理之痛：烟囱系统、权限混乱、效率低下
- [1-1-2-identity-governance-core-concepts.md](1-1-2-identity-governance-core-concepts.md) - 核心概念界定：IAM、4A、CIAM、SSO、权限
- [1-1-3-unified-identity-platform-core-values.md](1-1-3-unified-identity-platform-core-values.md) - 平台的核心价值：安全、效率、合规、体验
- [1-1-4-identity-lifecycle-management.md](1-1-4-identity-lifecycle-management.md) - "全生命周期"解读：从账号创建、权限授予到离职回收的完整闭环

## 第二章：核心理论基础与开放标准

- [1-2-core-theory-basis-open-standards.md](1-2-core-theory-basis-open-standards.md) - 核心理论基础与开放标准（概述）
- [1-2-1-authentication-vs-authorization-protocols.md](1-2-1-authentication-vs-authorization-protocols.md) - 认证（Authentication）vs. 授权（Authorization）：OAuth 2.0、OIDC、SAML 2.0 核心原理详解
- [1-2-2-permission-models-foundations.md](1-2-2-permission-models-foundations.md) - 权限模型基石：自主访问控制（DAC）、强制访问控制（MAC）、基于角色的访问控制（RBAC）、基于属性的访问控制（ABAC）
- [1-2-3-directory-services-ldap-ad.md](1-2-3-directory-services-ldap-ad.md) - 目录服务：LDAP协议与Active Directory的深度解读
- [1-2-4-modern-security-best-practices.md](1-2-4-modern-security-best-practices.md) - 现代安全最佳实践：多因子认证（MFA）、无密码认证、风险感知认证

## 第三章：平台建设前的战略规划与设计原则

- [1-3-strategic-planning-design-principles.md](1-3-strategic-planning-design-principles.md) - 平台建设前的战略规划与设计原则（概述）
- [1-3-1-requirements-survey-and-analysis.md](1-3-1-requirements-survey-and-analysis.md) - 需求调研与现状分析：梳理现有系统、用户类型、权限场景
- [1-3-2-evolution-roadmap.md](1-3-2-evolution-roadmap.md) - 制定演进路线图：从统一账号到全面身份治理
- [1-3-3-core-design-principles.md](1-3-3-core-design-principles.md) - 核心设计原则：最小权限原则、安全默认、可扩展性、用户体验
- [1-3-4-technology-selection-considerations.md](1-3-4-technology-selection-considerations.md) - 技术选型考量：自研 vs 商用产品 vs 开源方案（Keycloak, Casdoor, Ory Kratos）

## 第四章：统一用户中心设计

- [1-4-unified-user-center-design.md](1-4-unified-user-center-design.md) - 统一用户中心设计（概述）
- [1-4-1-user-model-abstraction.md](1-4-1-user-model-abstraction.md) - 用户模型抽象：个人用户、设备、应用、API账号
- [1-4-2-organization-structure-design.md](1-4-2-organization-structure-design.md) - 组织架构设计：支持多维级联、动态团队、虚拟组
- [1-4-3-user-lifecycle-management.md](1-4-3-user-lifecycle-management.md) - 用户生命周期管理：入职、转岗、离职的自动化流程（HR驱动）
- [4-4-user-self-service-registration-profile-password-reset.md](4-4-user-self-service-registration-profile-password-reset.md) - 用户自服务：注册、资料维护、密码重置

## 第五章：认证体系实现（AuthN）

- [1-5-authentication-system-implementation.md](1-5-authentication-system-implementation.md) - 认证体系实现（AuthN）（概述）
- [1-5-1-core-authentication-engine.md](1-5-1-core-authentication-engine.md) - 核心认证引擎：密码认证、短信/邮箱验证码、第三方社交登录
- [1-5-2-mfa-integration.md](1-5-2-mfa-integration.md) - 多因子认证（MFA）集成：TOTP、短信、邮件、生物识别、安全密钥
- [1-5-3-session-management.md](1-5-3-session-management.md) - 会话管理：分布式Session、JWT令牌的生命周期与安全
- [1-5-4-risk-control.md](1-5-4-risk-control.md) - 风险控制：异常登录检测、设备管理、密码策略 enforcement

## 第六章：授权体系实现（AuthZ）

- [1-6-authorization-system-implementation.md](1-6-authorization-system-implementation.md) - 授权体系实现（AuthZ）（概述）
- [1-6-1-rbac-model-implementation.md](1-6-1-rbac-model-implementation.md) - RBAC模型实现：角色、权限、用户组的关联与设计
- [1-6-2-abac-model-introduction.md](1-6-2-abac-model-introduction.md) - ABAC模型初探：策略语言（如Rego）与策略执行点（PEP）/决策点（PDP）架构
- [1-6-3-permission-grant-revoke-inheritance.md](1-6-3-permission-grant-revoke-inheritance.md) - 权限的授予、回收与继承：管理控制台的设计
- [1-6-4-permission-validation.md](1-6-4-permission-validation.md) - 权限的效验：中央化API网关与Sidecar模式

## 第七章：单点登录（SSO）系统集成

- [1-7-sso-system-integration.md](1-7-sso-system-integration.md) - 单点登录（SSO）系统集成（概述）
- [1-7-1-sso-core-process.md](1-7-1-sso-core-process.md) - SSO核心流程：基于票据的交换过程
- [1-7-2-1-oauth2-implementation.md](1-7-2-1-oauth2-implementation.md) - OAuth 2.0 四种模式与最佳实践
- [1-7-2-2-oidc-implementation.md](1-7-2-2-oidc-implementation.md) - OpenID Connect (OIDC) 实现用户认证
- [1-7-2-3-saml2-enterprise-idp-integration.md](1-7-2-3-saml2-enterprise-idp-integration.md) - SAML 2.0 与企业IdP的集成
- [1-7-3-client-integration.md](1-7-3-client-integration.md) - 客户端集成：Web应用、移动端、后端服务、旧系统的改造方案
- [1-7-4-logout-single-logout.md](1-7-4-logout-single-logout.md) - 登出与全局登出（Single Logout）

## 后续章节待生成

（此处将在后续生成过程中逐步添加）