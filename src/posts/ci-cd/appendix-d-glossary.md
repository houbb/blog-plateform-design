---
title: 附录D：术语表
date: 2025-09-07
categories: [CICD]
tags: [glossary, terminology, ci, cd, devops, sre, dora]
published: true
---

本文档提供了CI/CD及相关领域中常用术语的定义和解释，帮助读者更好地理解本书内容。

## A

### API (Application Programming Interface)
应用程序编程接口，定义了软件组件之间交互的规范和协议。

### API-First Design
API优先设计，指在开发过程中首先设计和定义API接口，然后基于API进行开发的方法。

### Approval Gate
审批门禁，在流水线中设置的人工或自动审批节点，确保变更在部署前得到适当审查。

### Artifact
制品，软件构建过程中产生的可部署文件，如JAR包、Docker镜像、NPM包等。

### Artifact Repository
制品仓库，用于存储和管理构建制品的系统，如Nexus、Artifactory等。

## B

### Blue-Green Deployment
蓝绿部署，一种部署策略，通过维护两个相同的生产环境（蓝色和绿色）来实现零停机部署。

### Branching Strategy
分支策略，团队在版本控制系统中管理代码分支的规范和方法，如Git Flow、GitHub Flow等。

### Build
构建，将源代码转换为可执行软件的过程，通常包括编译、链接、打包等步骤。

### Build Automation
构建自动化，通过脚本和工具自动执行软件构建过程，减少人工干预。

## C

### Canary Deployment
金丝雀部署，一种渐进式部署策略，先将新版本部署到一小部分用户，然后逐步扩大范围。

### CD (Continuous Delivery)
持续交付，确保软件可以随时发布的实践，通过自动化流程将变更可靠地部署到类生产环境。

### CD (Continuous Deployment)
持续部署，持续交付的延伸，在持续交付的基础上自动将通过所有测试的变更部署到生产环境。

### CI (Continuous Integration)
持续集成，开发人员频繁地将代码变更集成到共享仓库，并通过自动化构建和测试验证变更的实践。

### CI/CD Pipeline
CI/CD流水线，将代码从提交到部署的整个自动化流程，包括构建、测试、部署等阶段。

### Code Coverage
代码覆盖率，衡量测试用例执行了多少源代码的指标，通常以百分比表示。

### Configuration as Code
配置即代码，将系统配置以代码形式管理的实践，便于版本控制和自动化。

### Container
容器，一种轻量级虚拟化技术，将应用程序及其依赖打包在一起，确保在不同环境中一致运行。

## D

### Deployment
部署，将软件应用程序安装到目标环境并使其可供使用的过程。

### DevOps
开发运维，一种文化和实践，旨在缩短系统开发生命周期，提供高质量软件的持续交付。

### DevSecOps
开发安全运维，DevOps的扩展，在整个软件开发生命周期中集成安全实践。

### Docker
Docker，一种开源的容器化平台，用于自动化应用程序的部署、扩展和管理。

### Dockerfile
Dockerfile，用于定义如何构建Docker镜像的文本文件，包含一系列指令。

## E

### Environment
环境，应用程序运行的特定配置和基础设施，如开发、测试、预发、生产环境。

### Environment Isolation
环境隔离，确保不同环境之间相互独立，避免相互影响的实践。

## F

### Feature Branch
功能分支，为开发特定功能而创建的代码分支，开发完成后合并到主分支。

### Feature Flag
功能开关，一种技术手段，允许在不部署新代码的情况下启用或禁用特定功能。

### Feedback Loop
反馈循环，指从系统输出返回到输入的过程，用于持续改进和调整。

## G

### Git
Git，一种分布式版本控制系统，广泛用于软件开发中的代码管理。

### GitOps
GitOps，一种基于Git的运维模式，将Git作为系统状态的唯一真实来源。

### GitHub Flow
GitHub Flow，一种轻量级的Git分支策略，适用于持续交付。

### GitLab CI/CD
GitLab CI/CD，GitLab平台内置的持续集成和持续交付功能。

## H

### Helm
Helm，Kubernetes的包管理工具，用于定义、安装和升级Kubernetes应用程序。

### Hook
钩子，一种机制，允许在特定事件发生时执行自定义脚本或操作。

## I

### IaC (Infrastructure as Code)
基础设施即代码，使用代码来管理和配置基础设施的实践。

### Idempotent
幂等性，指操作可以多次执行而不会产生不同的结果。

### Immutable Infrastructure
不可变基础设施，一旦部署就不修改的基础设施管理理念，变更通过替换实现。

### Integration Test
集成测试，验证不同模块或服务之间交互是否正确的测试类型。

## J

### Jenkins
Jenkins，一种开源的自动化服务器，广泛用于实现CI/CD流水线。

### Jenkinsfile
Jenkinsfile，Jenkins Pipeline的配置文件，使用Groovy语法定义流水线。

## K

### Kanban
看板，一种可视化工作流程的管理方法，帮助团队优化工作流程。

### Kubernetes
Kubernetes，一种开源的容器编编排平台，用于自动化应用程序的部署、扩展和管理。

## L

### Linting
代码检查，通过工具自动检查代码质量和潜在问题的过程。

## M

### Master/Worker Architecture
主从架构，一种分布式系统架构，由一个主节点和多个工作节点组成。

### Microservice
微服务，一种架构风格，将应用程序构建为一组小的、独立的服务。

## N

### Nexus
Nexus，Sonatype公司提供的仓库管理软件，用于存储和管理构建制品。

## O

### Observability
可观测性，系统通过其外部输出（日志、指标、链路追踪）来理解和解释其内部状态的能力。

### On-Premises
本地部署，软件部署在组织自己的服务器和基础设施上，而不是云服务提供商的平台上。

## P

### Pipeline
流水线，将软件从源代码到部署的整个自动化流程。

### Pipeline as Code
流水线即代码，将CI/CD流水线定义为代码的实践，便于版本控制和自动化。

### Plugin
插件，用于扩展软件功能的模块化组件。

## Q

### Quality Gate
质量门禁，在流水线中设置的检查点，确保只有满足特定质量标准的变更才能继续。

## R

### Release
发布，将软件的特定版本交付给最终用户的过程。

### Repository
仓库，版本控制系统中存储代码和历史记录的地方。

### Rolling Deployment
滚动部署，一种部署策略，逐步替换应用程序的实例，避免停机时间。

## S

### SAST (Static Application Security Testing)
静态应用安全测试，在不运行代码的情况下分析源代码以发现安全漏洞。

### SCM (Source Control Management)
源码管理，管理和跟踪代码变更的系统，如Git、SVN等。

### Scripted Pipeline
脚本化流水线，Jenkins Pipeline的一种语法，使用Groovy编写，提供更大的灵活性。

### SDLC (Software Development Life Cycle)
软件开发生命周期，软件从需求分析到退役的整个过程。

### Security Scan
安全扫描，自动检测代码、依赖项或配置中安全漏洞的过程。

### Selenium
Selenium，一种用于Web应用程序自动化测试的开源框架。

### Service Mesh
服务网格，一种基础设施层，用于处理服务间通信、监控、安全等。

### SLI (Service Level Indicator)
服务水平指标，用于衡量服务质量的具体指标。

### SLO (Service Level Objective)
服务水平目标，为SLI设定的具体目标值。

### SLA (Service Level Agreement)
服务水平协议，服务提供商和客户之间关于服务质量的正式协议。

### SonarQube
SonarQube，一种代码质量管理平台，用于持续检查代码质量。

### Sprint
冲刺，Scrum框架中的一个时间盒，通常为2-4周，团队在此期间完成预定工作。

### SSH (Secure Shell)
安全外壳协议，一种网络协议，用于安全地访问网络服务。

## T

### Test Automation
测试自动化，使用工具和脚本自动执行测试用例的过程。

### Test Pyramid
测试金字塔，一种测试策略模型，强调不同层次测试的合理比例。

### Trunk-Based Development
主干开发，一种版本控制策略，开发人员直接在主分支上进行开发。

## U

### Unit Test
单元测试，针对软件中最小可测试单元的测试。

### User Story
用户故事，敏捷开发中描述功能需求的简短描述，从用户角度编写。

## V

### Version Control
版本控制，管理和跟踪文件和代码变更的系统。

## W

### Webhook
Web钩子，一种机制，当特定事件发生时，系统会向预定义的URL发送HTTP请求。

## Y

### YAML (YAML Ain't Markup Language)
YAML，一种人类可读的数据序列化标准，常用于配置文件。

## 技术缩写词

### CI/CD
持续集成/持续交付（Continuous Integration/Continuous Delivery）

### DAST (Dynamic Application Security Testing)
动态应用安全测试

### DORA (DevOps Research and Assessment)
DevOps研究与评估

### DSL (Domain Specific Language)
领域特定语言

### FaaS (Function as a Service)
函数即服务

### IaC (Infrastructure as Code)
基础设施即代码

### IDP (Internal Developer Platform)
内部开发者平台

### K8s
Kubernetes的缩写

### MTTR (Mean Time To Recovery)
平均恢复时间

### NPM (Node Package Manager)
Node包管理器

### OPA (Open Policy Agent)
开放策略代理

### RBAC (Role-Based Access Control)
基于角色的访问控制

### SCM (Source Control Management)
源码管理

### SRE (Site Reliability Engineering)
站点可靠性工程

### SCM (Software Configuration Management)
软件配置管理

### SLI (Service Level Indicator)
服务水平指标

### SLO (Service Level Objective)
服务水平目标

### SLA (Service Level Agreement)
服务水平协议

### SSH (Secure Shell)
安全外壳协议

### TLS (Transport Layer Security)
传输层安全

### UI (User Interface)
用户界面

### UX (User Experience)
用户体验

## DORA指标

### Deployment Frequency
部署频率，衡量团队在一定时间内成功部署到生产的次数。

### Lead Time for Changes
变更前置时间，衡量从代码提交到成功运行在生产环境的平均时间。

### Change Failure Rate
变更失败率，衡量部署到生产环境的变更中导致失败的比例。

### Time to Restore Service
服务恢复时间，衡量从服务中断到恢复正常运行的平均时间。

通过理解这些术语，读者可以更好地掌握CI/CD平台建设的相关概念和实践方法。