---
title: 附录D: 术语表
date: 2025-09-07
categories: [Security]
tags: [security]
published: true
---
## 引言

在企业级统一安全能力平台的建设过程中，涉及众多专业术语和概念。为了确保各相关方对关键术语有一致的理解，本附录提供了详细的术语解释。这些术语涵盖了安全技术、管理流程、架构设计等多个方面，有助于读者更好地理解本书内容和相关安全概念。

本术语表不仅适用于本书的阅读和理解，也可作为企业安全团队日常工作中的参考工具。通过统一术语定义，有助于提高沟通效率，减少理解偏差，促进安全工作的规范化和标准化。

## A

### **APT (Advanced Persistent Threat) 高级持续性威胁**
一种隐蔽的、长期的网络攻击形式，攻击者通过多种技术手段在目标网络中长期潜伏，逐步渗透并最终达成攻击目标。APT攻击通常具有目标明确、技术复杂、持续时间长等特点。

### **API (Application Programming Interface) 应用程序编程接口**
一套预定义的函数、协议和工具，用于构建软件应用程序。API定义了不同软件组件之间如何交互，使得开发者能够利用现有功能而无需重新实现。

### **API网关**
一种服务器组件，作为系统前端入口，负责接收所有API调用，通常执行请求路由、组合和协议转换等功能。API网关还可以提供安全控制、流量控制、监控等附加功能。

### **AES (Advanced Encryption Standard) 高级加密标准**
美国联邦政府采用的一种对称加密算法，用于保护电子数据的安全。AES支持128、192和256位密钥长度，是目前广泛使用的加密标准之一。

## B

### **BIA (Business Impact Analysis) 业务影响分析**
评估业务功能中断对组织造成的财务和运营影响的过程。BIA是业务连续性规划和灾难恢复计划的重要组成部分。

### **Botnet 僵尸网络**
由被恶意软件感染并受攻击者控制的计算机组成的网络。攻击者可以利用僵尸网络进行分布式拒绝服务攻击、发送垃圾邮件、窃取数据等恶意活动。

### **BYOD (Bring Your Own Device) 自带设备**
允许员工使用个人设备（如智能手机、平板电脑、笔记本电脑）处理工作相关事务的政策。BYOD在提高员工满意度的同时也带来了安全挑战。

## C

### **CA (Certificate Authority) 证书颁发机构**
负责颁发和管理数字证书的可信第三方机构。CA验证申请者的身份，并为其签发数字证书，用于在互联网上建立信任关系。

### **CIA三元组 (CIA Triad)**
信息安全的三个核心原则：
- **机密性 (Confidentiality)**：确保信息不被未授权的个人、实体或过程访问
- **完整性 (Integrity)**：保护信息的准确性和完整性，防止未授权的修改
- **可用性 (Availability)**：确保授权用户在需要时能够访问信息和相关资产

### **CI/CD (Continuous Integration/Continuous Deployment) 持续集成/持续部署**
软件开发实践，通过自动化构建、测试和部署流程，实现代码的快速、可靠交付。CI/CD有助于提高软件质量和交付速度。

### **CIS (Center for Internet Security) 互联网安全中心**
一个非营利组织，致力于提高全球互联网安全。CIS发布安全基准和最佳实践，帮助组织改善其网络安全态势。

### **CISO (Chief Information Security Officer) 首席信息安全官**
负责组织整体信息安全战略和实施的高级管理人员。CISO通常负责制定安全政策、管理安全风险、确保合规性等。

### **CSPM (Cloud Security Posture Management) 云安全态势管理**
一种云安全技术，用于自动化检测云平台的错误配置、识别安全风险并提供修复建议，帮助企业持续监控和改善云环境的安全态势。

### **CSRF (Cross-Site Request Forgery) 跨站请求伪造**
一种网络攻击，攻击者诱使用户在已认证的网站上执行非预期的操作。CSRF攻击利用用户的身份执行恶意操作，如转账、修改密码等。

### **CVE (Common Vulnerabilities and Exposures) 通用漏洞和暴露**
由MITRE公司维护的公开数据库，为已知的安全漏洞和暴露提供标准化的标识符。CVE编号有助于安全专业人员准确识别和讨论特定的安全问题。

### **CVSS (Common Vulnerability Scoring System) 通用漏洞评分系统**
一种开放的行业标准，用于评估和传达软件安全漏洞的严重性。CVSS提供定量的评分方法，帮助组织确定漏洞的优先级。

## D

### **DAST (Dynamic Application Security Testing) 动态应用安全测试**
一种安全测试方法，在应用程序运行时检测安全漏洞。DAST模拟攻击者的行为，通过向应用程序发送恶意请求来发现潜在的安全问题。

### **DDoS (Distributed Denial of Service) 分布式拒绝服务**
一种网络攻击，攻击者利用多个被控制的系统同时向目标系统发送大量请求，耗尽目标系统的资源，使其无法正常提供服务。

### **DevSecOps**
将安全集成到DevOps流程中的实践方法。DevSecOps强调在软件开发生命周期的早期阶段引入安全控制，实现安全左移。

### **DLP (Data Loss Prevention) 数据丢失防护**
一套技术和策略，用于防止敏感数据的未授权访问、使用或传输。DLP系统可以监控、检测和阻止敏感数据的泄露。

### **DNS (Domain Name System) 域名系统**
互联网的一项核心服务，用于将人类可读的域名转换为计算机可识别的IP地址。DNS是互联网正常运行的基础。

### **DoS (Denial of Service) 拒绝服务**
一种网络攻击，攻击者通过耗尽目标系统的资源或使其无法处理合法请求，从而阻止合法用户访问服务。

## E

### **E2E (End-to-End) 端到端**
指从起点到终点的完整过程或系统。在安全领域，端到端加密意味着数据从发送方到接收方的整个传输过程中都保持加密状态。

### **EDR (Endpoint Detection and Response) 端点检测与响应**
一种安全解决方案，用于监控和分析端点设备上的活动，以检测和响应安全威胁。EDR提供实时监控、威胁狩猎和事件响应功能。

### **ESB (Enterprise Service Bus) 企业服务总线**
一种软件架构模式，用于设计和实现企业级应用集成。ESB提供消息路由、协议转换、服务编排等功能，支持不同系统间的通信。

## F

### **FIM (File Integrity Monitoring) 文件完整性监控**
一种安全控制措施，用于监控关键系统文件和配置文件的变化。FIM可以检测未授权的修改，帮助识别潜在的安全威胁。

### **Firewall 防火墙**
一种网络安全系统，用于监控和控制进出网络的流量。防火墙基于预定义的安全规则允许或阻止特定的网络流量。

### **Forensics (Digital) 数字取证**
应用计算机科学和调查技术来识别、保存、分析和记录数字证据的过程。数字取证在网络安全事件响应和法律调查中发挥重要作用。

## G

### **GDPR (General Data Protection Regulation) 通用数据保护条例**
欧盟制定的数据保护法规，旨在加强和统一欧盟境内所有个人数据的保护。GDPR对数据处理、隐私权和数据主体权利等方面做出了严格规定。

### **GRC (Governance, Risk Management, and Compliance) 治理、风险管理和合规**
企业管理和运营的三个关键领域：
- **治理**：确保组织目标的实现和责任的履行
- **风险管理**：识别、评估和控制组织面临的风险
- **合规**：确保组织遵守适用的法律、法规和标准

## H

### **HIDS (Host-based Intrusion Detection System) 基于主机的入侵检测系统**
在单个主机上运行的入侵检测系统，监控主机上的活动以检测潜在的安全威胁。HIDS可以检测恶意软件、未授权访问和其他可疑行为。

### **HIPS (Host-based Intrusion Prevention System) 基于主机的入侵防护系统**
在主机上运行的安全系统，不仅可以检测潜在的入侵行为，还可以主动阻止这些行为。HIPS提供实时保护，防止恶意活动对主机造成损害。

### **HSM (Hardware Security Module) 硬件安全模块**
一种物理计算设备，用于安全地生成、存储和管理加密密钥。HSM提供硬件级别的安全保护，防止密钥被未授权访问或篡改。

## I

### **IAM (Identity and Access Management) 身份与访问管理**
一套安全策略和技术，用于管理数字身份和控制用户对系统资源的访问。IAM包括身份验证、授权、用户管理等功能。

### **IDS (Intrusion Detection System) 入侵检测系统**
一种网络安全设备或软件应用程序，用于监控网络或系统活动，检测恶意活动或违反安全策略的行为。

### **IaaS (Infrastructure as a Service) 基础设施即服务**
云计算服务模型之一，提供商通过互联网提供虚拟化计算资源，如服务器、存储和网络。用户可以按需使用这些资源，而无需购买和维护物理硬件。

### **ICS (Industrial Control Systems) 工业控制系统**
用于操作和自动化工业过程的控制系统，包括SCADA系统、DCS系统等。ICS广泛应用于电力、水处理、制造业等关键基础设施领域。

### **IDE (Integrated Development Environment) 集成开发环境**
为软件开发提供全面设施的应用程序，通常包括代码编辑器、编译器、调试器和图形用户界面等工具。

### **IDPS (Intrusion Detection and Prevention System) 入侵检测与防护系统**
结合了入侵检测和入侵防护功能的安全系统，可以检测潜在威胁并主动阻止恶意活动。

### **IOT (Internet of Things) 物联网**
通过互联网连接各种物理设备、车辆、家用电器和其他嵌入电子设备、软件、传感器、执行器的物品，使它们能够收集和交换数据。

### **IPS (Intrusion Prevention System) 入侵防护系统**
一种网络安全设备或软件，用于实时监控网络或系统活动，检测恶意活动并主动阻止这些活动。

### **IR (Incident Response) 事件响应**
组织为应对安全事件而采取的一系列措施，包括事件检测、分析、遏制、根除、恢复和总结等阶段。

### **ISO (International Organization for Standardization) 国际标准化组织**
世界上最大的非政府国际标准化专门机构，负责制定各种国际标准，包括信息安全管理体系标准ISO 27001等。

## K

### **KMS (Key Management Service) 密钥管理服务**
用于生成、存储、分发和管理加密密钥的服务。KMS确保密钥的安全性和可用性，支持各种加密操作。

### **KPI (Key Performance Indicator) 关键绩效指标**
用于衡量组织、部门或个人在关键业务目标方面表现的可量化的指标。KPI帮助组织跟踪进展并做出数据驱动的决策。

## L

### **LDAP (Lightweight Directory Access Protocol) 轻量级目录访问协议**
一种开放的、供应商中立的行业标准应用协议，用于访问和维护分布式目录信息服务。LDAP常用于企业身份管理。

### **Log Aggregation 日志聚合**
将来自不同源的日志数据收集、整合和存储到中央位置的过程。日志聚合有助于安全监控、故障排除和合规性审计。

## M

### **MFA (Multi-Factor Authentication) 多因子认证**
一种安全机制，要求用户提供两种或多种不同类型的身份验证因素才能获得访问权限。常见的因素包括知识因素（密码）、拥有因素（令牌）和生物特征因素。

### **MITM (Man-in-the-Middle) 中间人攻击**
一种网络攻击，攻击者秘密中继和可能篡改通信双方之间的通信。MITM攻击使攻击者能够窃听、篡改或伪造通信内容。

### **MITRE ATT&CK**
一个全球可访问的基于知识的框架，描述了攻击者在企业网络中使用的战术和技术。ATT&CK帮助安全团队了解攻击行为并制定防御策略。

### **MTTD (Mean Time to Detect) 平均检测时间**
衡量安全团队检测安全事件所需平均时间的指标。MTTD越短，说明安全检测能力越强。

### **MTTR (Mean Time to Respond/Recover) 平均响应/恢复时间**
衡量安全团队响应和恢复安全事件所需平均时间的指标。MTTR越短，说明安全响应能力越强。

## N

### **NAC (Network Access Control) 网络访问控制**
一种网络安全解决方案，用于控制哪些设备可以接入网络以及它们可以访问哪些资源。NAC基于预定义的安全策略实施访问控制。

### **NIDS (Network-based Intrusion Detection System) 基于网络的入侵检测系统**
监控网络流量以检测潜在安全威胁的入侵检测系统。NIDS分析网络数据包，识别恶意活动模式。

### **NIST (National Institute of Standards and Technology) 美国国家标准与技术研究院**
美国商务部的一个机构，负责制定技术标准和指南，包括网络安全框架(Cybersecurity Framework)等重要安全标准。

### **NTA (Network Traffic Analysis) 网络流量分析**
通过分析网络流量来检测异常行为和潜在安全威胁的技术。NTA有助于识别恶意活动、数据泄露和其他网络安全问题。

## O

### **OAuth**
一种开放标准，允许用户授权第三方应用访问其服务器资源，而无需共享密码。OAuth广泛用于Web和移动应用的身份验证和授权。

### **OIDC (OpenID Connect)**
建立在OAuth 2.0协议之上的身份验证层，允许客户端验证终端用户的身份并获取基本的用户配置文件信息。

### **OSINT (Open Source Intelligence) 开源情报**
从公开可获取的来源收集、分析和利用信息的过程。在网络安全中，OSINT用于威胁情报收集和安全研究。

### **OWASP (Open Web Application Security Project) 开放Web应用安全项目**
一个非营利组织，致力于提高软件安全。OWASP发布Web应用安全风险Top 10等重要安全指南。

## P

### **PaaS (Platform as a Service) 平台即服务**
云计算服务模型之一，提供商通过互联网提供硬件和软件工具平台，供客户创建、运行和管理应用程序。

### **PAM (Privileged Access Management) 特权访问管理**
用于控制、监控和保护特权用户账户访问的解决方案。PAM帮助组织管理具有高权限的账户，防止滥用和安全威胁。

### **PCI DSS (Payment Card Industry Data Security Standard) 支付卡行业数据安全标准**
一套安全标准，旨在确保所有处理、存储或传输信用卡信息的公司都维护安全环境。PCI DSS由主要信用卡公司共同制定。

### **Penetration Testing (Pen Test) 渗透测试**
一种授权的模拟攻击，用于评估计算机系统、网络或Web应用程序的安全性。渗透测试帮助识别安全漏洞并提供修复建议。

### **Phishing 钓鱼攻击**
一种网络攻击，攻击者通过伪装成可信实体发送欺诈性通信，诱骗受害者泄露敏感信息，如用户名、密码和信用卡信息。

### **PII (Personally Identifiable Information) 个人身份信息**
可用于直接或间接识别特定个人的任何数据。PII包括姓名、地址、电话号码、社会安全号码等敏感信息。

### **PKI (Public Key Infrastructure) 公钥基础设施**
一套硬件、软件、人员、政策和程序，用于创建、管理、分发、使用、存储和撤销数字证书。PKI支持公钥加密和数字签名。

### **PTES (Penetration Testing Execution Standard) 渗透测试执行标准**
一套渗透测试的标准化方法论，定义了渗透测试的七个阶段，为安全专业人员提供详细的测试指导。

## R

### **RBAC (Role-Based Access Control) 基于角色的访问控制**
一种访问控制机制，根据用户在组织中的角色分配权限。RBAC简化了权限管理，提高了安全性。

### **RCE (Remote Code Execution) 远程代码执行**
一种安全漏洞，允许攻击者在目标系统上远程执行任意代码。RCE漏洞可能导致系统完全被控制。

### **RDP (Remote Desktop Protocol) 远程桌面协议**
由微软开发的专有协议，用于通过网络连接远程访问Windows计算机。RDP广泛用于远程管理和技术支持。

### **Risk Assessment 风险评估**
识别、分析和评估潜在风险及其对组织影响的过程。风险评估是风险管理的基础，有助于制定有效的风险缓解策略。

### **ROSI (Return on Security Investment) 安全投资回报率**
衡量安全投资效益的指标，计算安全措施带来的收益与投入成本的比率。ROSI帮助组织评估安全投资的价值。

## S

### **SaaS (Software as a Service) 软件即服务**
云计算服务模型之一，提供商通过互联网提供软件应用程序。用户无需安装和维护软件，通过Web浏览器即可使用。

### **SAML (Security Assertion Markup Language) 安全断言标记语言**
一种基于XML的标准，用于在不同安全域之间交换身份验证和授权数据。SAML支持单点登录(SSO)等功能。

### **SAST (Static Application Security Testing) 静态应用安全测试**
一种安全测试方法，在不执行代码的情况下分析源代码、字节码或二进制文件，以发现潜在的安全漏洞。

### **SCADA (Supervisory Control and Data Acquisition) 数据采集与监控系统**
用于工业控制系统的软件应用，用于监控和控制工业过程。SCADA系统广泛应用于电力、水处理、石油天然气等关键基础设施。

### **SCM (Supply Chain Management) 供应链管理**
管理从原材料采购到产品交付给最终用户的整个供应链过程。在安全领域，SCM涉及供应链风险管理。

### **SCM (Software Configuration Management) 软件配置管理**
在软件开发生命周期中管理变更的实践，包括版本控制、变更控制、构建管理和发布管理等。

### **SIEM (Security Information and Event Management) 安全信息和事件管理**
一种安全解决方案，用于实时收集、分析和关联来自各种IT资源的安全事件和日志数据，以检测潜在的安全威胁。

### **SLA (Service Level Agreement) 服务级别协议**
服务提供商和客户之间定义的协议，明确服务的预期质量、可用性、性能和其他指标。SLA通常包括补救措施和处罚条款。

### **SOC (Security Operations Center) 安全运营中心**
一个集中化的安全监控和响应团队或设施，负责监控、检测、分析和响应安全事件。SOC是组织安全防护体系的核心。

### **SOAR (Security Orchestration, Automation and Response) 安全编排、自动化和响应**
一种安全解决方案，通过自动化和编排安全工具和流程，提高安全运营的效率和效果。SOAR支持事件响应、威胁情报和安全管理。

### **SPDX (Software Package Data Exchange) 软件包数据交换**
一种开放标准，用于描述软件包的元数据，包括许可证信息、组件依赖关系和安全漏洞等。

### **SQL Injection SQL注入**
一种代码注入技术，攻击者通过在输入字段中插入恶意SQL代码，操纵后端数据库执行非预期的SQL命令。

### **SSO (Single Sign-On) 单点登录**
一种身份验证服务，允许用户使用一组登录凭据访问多个相关但独立的软件系统。SSO提高了用户体验和管理效率。

### **STIX (Structured Threat Information Expression) 结构化威胁信息表达**
一种标准化语言，用于描述网络威胁信息。STIX支持威胁情报的共享和分析。

## T

### **TEE (Trusted Execution Environment) 可信执行环境**
一个安全区域，位于主处理器内部，确保加载到其中的代码和数据的机密性和完整性。TEE用于保护敏感计算和数据处理。

### **Threat Intelligence 威胁情报**
基于证据的知识，包括上下文、机制、指标、影响和可行的建议，关于现有或新兴的威胁对资产的潜在危害。

### **TLS (Transport Layer Security) 传输层安全**
一种加密协议，用于在互联网上提供通信安全。TLS是SSL的继任者，广泛用于保护Web通信、电子邮件和其他数据传输。

## U

### **UEBA (User and Entity Behavior Analytics) 用户与实体行为分析**
一种安全技术，使用机器学习和统计分析来检测用户和实体（如设备、应用程序）的异常行为，以识别潜在的安全威胁。

### **URL (Uniform Resource Locator) 统一资源定位符**
用于标识互联网上资源位置的字符串，通常被称为Web地址。URL包含协议、域名、路径等信息。

## V

### **VPN (Virtual Private Network) 虚拟私人网络**
一种网络技术，通过在公共网络上创建加密通道，实现远程用户安全访问私有网络资源。VPN提供隐私保护和访问控制。

## W

### **WAF (Web Application Firewall) Web应用防火墙**
一种专门用于保护Web应用程序的安全设备或服务。WAF监控、过滤和阻止HTTP流量中的恶意请求。

### **Zero Trust 零信任**
一种安全模型，基于"永不信任，始终验证"的原则，要求对所有用户和设备进行严格的身份验证和授权，无论其位于网络内部还是外部。

## X

### **XDR (Extended Detection and Response) 扩展检测与响应**
一种安全解决方案，整合来自多个安全层（端点、网络、云等）的数据，提供更全面的威胁检测和响应能力。

### **XSS (Cross-Site Scripting) 跨站脚本**
一种安全漏洞，允许攻击者在受害者的浏览器中注入恶意脚本。XSS攻击可以窃取用户数据、劫持用户会话或传播恶意软件。

## Y

### **YARA**
一种模式匹配工具，用于识别和分类恶意软件样本。YARA使用基于文本的规则语言描述恶意软件家族的特征。

## Z

### **Zero-day 零日漏洞**
一种软件漏洞，供应商和用户在攻击者利用该漏洞之前不知道其存在。零日攻击是指利用零日漏洞的攻击。

### **ZTA (Zero Trust Architecture) 零信任架构**
基于零信任原则设计的安全架构，通过微分割、最小权限访问和持续验证等技术，实现全面的安全防护。

## 结论

本术语表涵盖了企业级统一安全能力平台建设中涉及的主要专业术语和概念。通过统一这些术语的定义，有助于提高沟通效率，减少理解偏差，促进安全工作的规范化和标准化。

在实际应用中，随着技术的不断发展和新概念的涌现，术语表也需要持续更新和完善。建议读者在使用过程中，结合具体上下文环境，准确理解和应用相关术语。

通过掌握这些安全术语，读者可以更好地理解安全概念和技术，提高安全专业能力，为构建和维护安全的IT环境奠定坚实基础。同时，统一的术语理解也有助于促进团队协作，提高安全工作的整体效率和效果。