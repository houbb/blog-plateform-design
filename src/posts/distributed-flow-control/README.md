# 企业级分布式限流平台建设：从网关集成到全域稳定的全链路实践

本文档系列深入探讨了分布式限流平台的设计、实现和运维，旨在帮助架构师、SRE、中间件开发工程师和后端开发负责人构建高可用、高精度、可观测、易运维的企业级分布式限流平台。

## 目录索引

### 第一部分：理念与基石篇——稳定性的基石

#### 第1章：流量洪峰下的守护神：为什么需要分布式限流？

- [1-1-1-why-distributed-flow-control.md](1-1-1-why-distributed-flow-control.md) - 流量洪峰下的守护神：为什么需要分布式限流？
- [1-1-2-from-single-to-distributed.md](1-1-2-from-single-to-distributed.md) - 从单机限流到分布式限流：微服务架构下的必然选择
- [1-1-3-core-values-and-applications.md](1-1-3-core-values-and-applications.md) - 核心价值：防止系统雪崩、保障服务可用性、实现公平调度、成本控制

#### 第2章：核心理论与算法

- [2-1-1-core-theory-and-algorithms.md](2-1-1-core-theory-and-algorithms.md) - 限流算法深度剖析：固定窗口、滑动窗口、漏桶与令牌桶
- [2-1-2-limiting-dimensions-and-granularity.md](2-1-2-limiting-dimensions-and-granularity.md) - 限流维度与粒度：QPS、并发线程数与分布式总配额的精细控制

#### 第3章：平台战略与总体规划

- [3-1-1-platform-strategy.md](3-1-1-platform-strategy.md) - 需求与场景分析：识别需要保护的核心服务与资源
- [3-1-2-design-principles.md](3-1-2-design-principles.md) - 设计原则：高可用、低延迟、最终一致性、配置热更新
- [3-1-3-tech-selection.md](3-1-3-tech-selection.md) - 技术选型：自研 vs. 集成开源（如 Sentinel, Redis-cell, Envoy RateLimit）
- [3-1-4-evolution-roadmap.md](3-1-4-evolution-roadmap.md) - 演进路线图：从网关单点限流到全链路精准限流

---

*注：本文档将持续更新，随着更多章节内容的完善，将逐步添加后续章节的文档链接。*