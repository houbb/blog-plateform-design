# 简介

核心平台设计博客

# 在线

[https://houbb.github.io/blog-plateform-design/](https://houbb.github.io/blog-plateform-design/)

# 本地

## node 版本

```
> node -v
v22.18.0
```

## 命令

```
npm install
npm run docs:clean-dev
```

# 系列专题

## 读书笔记（知识输入）

## 知识花园（知识库、沉淀、有效输出）

github: [https://github.com/houbb/blog-plateform-design](https://github.com/houbb/blog-plateform-design)

github-pags: [https://houbb.github.io/blog-plateform-design/](https://houbb.github.io/blog-plateform-design/posts/digit-garden/)

gitbook: [https://houbb.gitbook.io/digit-garden/](https://houbb.gitbook.io/digit-garden/)

## 学习方法论（学习技巧-深度加工）

github: [https://github.com/houbb/blog-plateform-design](https://github.com/houbb/blog-plateform-design)

github-pags: [https://houbb.github.io/blog-plateform-design/](https://houbb.github.io/blog-plateform-design/posts/learnmethods/)

## 思维模型（底层模型-深度加工）

github: [https://github.com/houbb/blog-plateform-design](https://github.com/houbb/blog-plateform-design)

github-pags: [https://houbb.github.io/blog-plateform-design/](https://houbb.github.io/blog-plateform-design/posts/thinkmodel/)

## 刻意练习(力扣算法)

[leetcode 算法实现源码](https://github.com/houbb/leetcode)

[leetcode 刷题学习笔记](https://github.com/houbb/leetcode-notes)

[老马技术博客](https://houbb.github.io/)

# 相关

[个人技术笔记](https://github/houbb/houbb.github.io)

[个人思考(不止技术) blog-plateform-design](https://github/houbb/blog-plateform-design)

## 整体关系

高效输入（时间管理+阅读）、深度加工（笔记+反思）、有效输出（练习+讲解+实战）、科学记忆（复习+间隔重复）。

读书--》高质量的输入

方法论---》指导实践

个人思考笔记--》反馈+记录+沉淀

实战--》不要纸上谈兵

PDCA

## 工具支撑

方法论+对应的工具流程支撑（潜移默化）

# 缺失部分

风控

分布式文件


# 生态

### 一、业务支撑与用户体验类

这类平台直接赋能业务团队，提升用户获取和留存效率。

1.  客户数据平台 (CDP - Customer Data Platform)
    *   核心价值：统一整合来自不同渠道（App、Web、小程序、线下）的用户行为数据和属性数据，形成统一的用户画像（OneID）。
    *   关键能力：用户行为轨迹分析、用户分群、标签体系管理、实时数据更新。
    *   为什么重要：是精准营销、个性化推荐、用户体验优化的核心数据底座。没有CDP，营销和运营就像“盲人摸象”。

2.  营销自动化平台 (MAP - Marketing Automation Platform)
    *   核心价值：基于CDP的用户分群，自动化地执行跨渠道的营销活动（如邮件、短信、Push、广告再投放）。
    *   关键能力：可视化旅程设计器（Customer Journey）、A/B测试、营销效果归因分析。
    *   为什么重要：大幅提升营销效率，实现“千人千面”的自动化运营，促进用户增长和转化。

3.  用户交互与触达平台 (CEP - Customer Engagement Platform)
    *   核心价值：管理和优化所有与用户直接交互的渠道。
    *   关键能力：
        *   推送平台：管理App Push、站内信等。
        *   客服系统：在线客服、机器人、工单系统（这部分常与ITSM有重叠但侧重外部用户）。
        *   短信/邮件通道（您已提及的通知平台是其底层支撑）。
    *   为什么重要：是所有用户沟通的生命线，直接影响用户体验和满意度。

4.  A/B 实验与灰度发布平台 (Experimentation Platform)
    *   核心价值：用数据驱动决策，科学地验证每一个产品改动、算法策略和UI设计对业务指标的影响。
    *   关键能力：流量分割、实验参数配置、数据分析与显著性检验、多层实验正交管理。
    *   为什么重要：避免了“拍脑袋”做决策，是产品迭代和算法优化的核心工具，文化上倡导“用数据说话”。

---

### 二、资源效率与成本优化类

这类平台帮助公司在快速发展中控制云资源成本，实现精细化管理。

1.  云资源管理与成本优化平台 (FinOps Platform)
    *   核心价值：实现云资源的透明化、可观测、可优化和可预测。让技术成本成为一项可控的经营指标。
    *   关键能力：
        *   资源目录：自动发现并纳管所有云上资源（EC2、RDS、S3等）。
        *   成本分账：将云账单按部门、项目、产品线进行拆分和展示。
        *   优化建议：自动识别闲置、未充分利用的资源，提供优化建议（如 rightsizing，购买预留实例）。
        *   预算与预警：设置预算并预警超支风险。
    *   为什么重要：对于上云的公司，云成本是最大支出之一。缺乏管理会导致巨额浪费。

2.  统一资源调度平台 (Beyond Kubernetes)
    *   核心价值：在K8s之上，实现混合云（多云）、批量计算、AI训练任务等异构工作负载的统一调度和资源池化。
    *   关键能力：支持YARN、K8s、Slurm等多种调度器；队列管理；优先级调度；资源配额管理。
    *   为什么重要：最大化集群资源利用率，为AI、大数据等计算密集型任务提供稳定高效的底层支撑。

---

### 三、创新与研发效率类

这类平台进一步降低创新门槛，提升整体协作和交付效率。

1.  低代码/无代码平台 (LCAP/No-Code Platform)
    *   核心价值：让产品、运营、业务等非技术人员也能通过拖拽方式快速构建应用（如后台、报表、审批流），解放开发者生产力。
    *   关键能力：可视化表单/流程设计器、数据模型管理、连接器（与后端API、数据库连接）。
    *   为什么重要：应对长尾、多变的企业内部应用需求，极大提升企业整体数字化效率。

2.  内部知识库与协作平台 (Internal Wiki & Collaboration)
    *   核心价值：沉淀组织知识，减少重复沟通，加速新人成长。是公司文化的载体。
    *   关键能力：易于编辑和搜索、权限管理、与代码库、工单系统等集成。
    *   为什么重要：技术文档、项目复盘、决策记录、团队规范都沉淀于此，是组织避免“失忆”的关键。

3.  开发者门户 (Developer Portal) / 内部开发者平台 (IDP)
    *   核心价值：为内部开发者提供一站式服务窗口，是“平台之平台”。
    *   关键能力：
        *   服务目录：检索和申请所有内部平台和中间件服务（如申请一个MQ主题、一个Redis实例）。
        *   自助服务：一键获取开发环境、资源。
        *   工具链集成：集中展示CI/CD状态、文档、监控链接等。
    *   为什么重要：极大提升开发者体验和效率，是平台工程（Platform Engineering）理念的最终体现。

### 总结

您可以将其视为一个完整的互联网公司技术平台生态图谱：

| 类别 | 核心平台 | 目标 |
| :--- | :--- | :--- |
| 研发与交付 | CI/CD, 代码平台, 测试平台, BPM | 高效、高质量地交付软件 |
| 运维与稳定性 | 监控报警, CMDB, 作业平台, 调度平台, 限流平台 | 保障系统稳定、可靠、高效运行 |
| 数据与智能 | 数据平台, 数仓, 分布式文件平台, 风控平台, CDP | 挖掘数据价值，驱动业务增长和风险控制 |
| 安全与合规 | 安全平台, 用户权限, 加密证书, 审计日志 | 保障数据、应用和基础设施安全 |
| 资源与成本 | 云管平台 (FinOps), 资源调度平台 | 实现资源高效利用和成本优化 |
| 业务与增长 | 营销平台, A/B实验平台, 用户触达平台 | 直接赋能业务，实现用户增长和转化 |
| 组织与效率 | 低代码平台, 知识库, 开发者门户 | 提升组织协作效率，降低创新门槛 |

