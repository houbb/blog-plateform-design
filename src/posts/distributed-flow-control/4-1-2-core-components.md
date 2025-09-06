---
title: 分布式限流平台核心组件设计：控制面、数据面、存储层
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed]
published: true
---

分布式限流平台的核心组件设计是整个系统功能实现的基础。这些组件包括控制面的核心组件、数据面的执行组件以及存储层的持久化组件。每个组件都有其特定的职责和设计考量。本文将深入探讨这些核心组件的详细设计，包括其架构、实现方式和交互机制。

## 控制面核心组件设计

控制面是分布式限流平台的"大脑"，负责策略管理、配置分发和系统协调等工作。

### 1. 规则管理组件

规则管理组件负责限流规则的全生命周期管理，包括创建、查询、更新和删除操作。

#### 核心功能
- 规则定义和验证
- 规则版本管理
- 规则查询和检索
- 规则变更审计

#### 技术实现
```java
// 限流规则实体
@Entity
@Table(name = "rate_limit_rules")
public class RateLimitRule {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String resource;
    
    @Column(nullable = false)
    private int limit;
    
    @Column(nullable = false)
    private long windowSize; // 毫秒
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RateLimitAlgorithm algorithm;
    
    @Enumerated(EnumType.STRING)
    private LimitDimension dimension;
    
    @Enumerated(EnumType.STRING)
    private LimitGranularity granularity;
    
    @Column
    private String description;
    
    @Column(nullable = false)
    private long createdAt;
    
    @Column(nullable = false)
    private long updatedAt;
    
    @Version
    private long version;
    
    // 构造函数、getter和setter方法...
}

// 规则管理服务
@Service
@Transactional
public class RuleManagementService {
    
    private final RuleRepository ruleRepository;
    private final RuleValidator ruleValidator;
    private final RuleDistributor ruleDistributor;
    private final AuditLogger auditLogger;
    
    // 创建限流规则
    public RateLimitRule createRule(CreateRuleRequest request) {
        // 验证规则参数
        ValidationResult validationResult = ruleValidator.validate(request);
        if (!validationResult.isValid()) {
            throw new InvalidRuleException(validationResult.getErrorMessage());
        }
        
        // 构造规则实体
        RateLimitRule rule = RateLimitRule.builder()
            .id(UUID.randomUUID().toString())
            .resource(request.getResource())
            .limit(request.getLimit())
            .windowSize(request.getWindowSize())
            .algorithm(request.getAlgorithm())
            .dimension(request.getDimension())
            .granularity(request.getGranularity())
            .description(request.getDescription())
            .createdAt(System.currentTimeMillis())
            .updatedAt(System.currentTimeMillis())
            .build();
        
        // 保存规则
        RateLimitRule savedRule = ruleRepository.save(rule);
        
        // 分发规则到数据面
        ruleDistributor.distributeRule(savedRule);
        
        // 记录审计日志
        auditLogger.logRuleCreation(savedRule);
        
        return savedRule;
    }
    
    // 更新限流规则
    public RateLimitRule updateRule(String ruleId, UpdateRuleRequest request) {
        // 获取现有规则
        RateLimitRule existingRule = ruleRepository.findById(ruleId)
            .orElseThrow(() -> new RuleNotFoundException(ruleId));
        
        // 验证更新参数
        ValidationResult validationResult = ruleValidator.validateUpdate(request);
        if (!validationResult.isValid()) {
            throw new InvalidRuleException(validationResult.getErrorMessage());
        }
        
        // 更新规则属性
        RateLimitRule updatedRule = existingRule.toBuilder()
            .limit(request.getLimit() != null ? request.getLimit() : existingRule.getLimit())
            .windowSize(request.getWindowSize() != null ? request.getWindowSize() : existingRule.getWindowSize())
            .algorithm(request.getAlgorithm() != null ? request.getAlgorithm() : existingRule.getAlgorithm())
            .dimension(request.getDimension() != null ? request.getDimension() : existingRule.getDimension())
            .granularity(request.getGranularity() != null ? request.getGranularity() : existingRule.getGranularity())
            .description(request.getDescription() != null ? request.getDescription() : existingRule.getDescription())
            .updatedAt(System.currentTimeMillis())
            .version(existingRule.getVersion() + 1)
            .build();
        
        // 保存更新后的规则
        RateLimitRule savedRule = ruleRepository.update(ruleId, updatedRule);
        
        // 分发更新后的规则到数据面
        ruleDistributor.updateRule(savedRule);
        
        // 记录审计日志
        auditLogger.logRuleUpdate(existingRule, savedRule);
        
        return savedRule;
    }
    
    // 删除限流规则
    public void deleteRule(String ruleId) {
        // 获取现有规则
        RateLimitRule existingRule = ruleRepository.findById(ruleId)
            .orElseThrow(() -> new RuleNotFoundException(ruleId));
        
        // 删除规则
        ruleRepository.delete(ruleId);
        
        // 通知数据面删除规则
        ruleDistributor.removeRule(ruleId);
        
        // 记录审计日志
        auditLogger.logRuleDeletion(existingRule);
    }
    
    // 查询规则
    public List<RateLimitRule> queryRules(RuleQuery query) {
        return ruleRepository.query(query);
    }
}
```

### 2. 策略分发组件

策略分发组件负责将限流策略从控制面推送到数据面的各个节点。

#### 核心功能
- 策略变更通知
- 节点状态管理
- 消息可靠传输
- 分发状态监控

#### 技术实现
```java
// 策略分发服务
@Service
public class PolicyDistributionService {
    
    private final List<DataPlaneNode> dataPlaneNodes;
    private final MessageQueue messageQueue;
    private final NodeRegistry nodeRegistry;
    private final DistributionMetrics metrics;
    
    // 分发规则创建事件
    public void distributeRuleCreation(RateLimitRule rule) {
        long startTime = System.currentTimeMillis();
        
        try {
            PolicyUpdateEvent event = PolicyUpdateEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(PolicyEventType.RULE_CREATED)
                .rule(rule)
                .timestamp(startTime)
                .build();
            
            // 发送到消息队列
            messageQueue.send("policy_updates", event);
            
            // 同步通知在线节点
            int successCount = 0;
            for (DataPlaneNode node : dataPlaneNodes) {
                if (nodeRegistry.isNodeOnline(node.getId())) {
                    try {
                        node.updatePolicy(rule);
                        successCount++;
                    } catch (Exception e) {
                        log.error("Failed to update policy on node: {}", node.getId(), e);
                        metrics.recordDistributionFailure(node.getId());
                    }
                }
            }
            
            long duration = System.currentTimeMillis() - startTime;
            metrics.recordDistributionSuccess(successCount, duration);
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            metrics.recordDistributionError(duration);
            throw new PolicyDistributionException("Failed to distribute rule creation", e);
        }
    }
    
    // 分发规则更新事件
    public void distributeRuleUpdate(RateLimitRule rule) {
        long startTime = System.currentTimeMillis();
        
        try {
            PolicyUpdateEvent event = PolicyUpdateEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(PolicyEventType.RULE_UPDATED)
                .rule(rule)
                .timestamp(startTime)
                .build();
            
            // 发送到消息队列
            messageQueue.send("policy_updates", event);
            
            // 同步通知在线节点
            int successCount = 0;
            for (DataPlaneNode node : dataPlaneNodes) {
                if (nodeRegistry.isNodeOnline(node.getId())) {
                    try {
                        node.updatePolicy(rule);
                        successCount++;
                    } catch (Exception e) {
                        log.error("Failed to update policy on node: {}", node.getId(), e);
                        metrics.recordDistributionFailure(node.getId());
                    }
                }
            }
            
            long duration = System.currentTimeMillis() - startTime;
            metrics.recordDistributionSuccess(successCount, duration);
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            metrics.recordDistributionError(duration);
            throw new PolicyDistributionException("Failed to distribute rule update", e);
        }
    }
    
    // 分发规则删除事件
    public void distributeRuleDeletion(String ruleId) {
        long startTime = System.currentTimeMillis();
        
        try {
            PolicyDeleteEvent event = PolicyDeleteEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(PolicyEventType.RULE_DELETED)
                .ruleId(ruleId)
                .timestamp(startTime)
                .build();
            
            // 发送到消息队列
            messageQueue.send("policy_deletes", event);
            
            // 同步通知在线节点
            int successCount = 0;
            for (DataPlaneNode node : dataPlaneNodes) {
                if (nodeRegistry.isNodeOnline(node.getId())) {
                    try {
                        node.removePolicy(ruleId);
                        successCount++;
                    } catch (Exception e) {
                        log.error("Failed to remove policy on node: {}", node.getId(), e);
                        metrics.recordDistributionFailure(node.getId());
                    }
                }
            }
            
            long duration = System.currentTimeMillis() - startTime;
            metrics.recordDistributionSuccess(successCount, duration);
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            metrics.recordDistributionError(duration);
            throw new PolicyDistributionException("Failed to distribute rule deletion", e);
        }
    }
}
```

### 3. 集群协调组件

集群协调组件负责管理分布式节点的状态和协调工作。

#### 核心功能
- 节点注册与发现
- 健康检查
- 负载均衡
- 故障检测与恢复

#### 技术实现
```java
// 集群协调服务
@Component
public class ClusterCoordinationService {
    
    private final NodeRegistry nodeRegistry;
    private final HealthChecker healthChecker;
    private final LoadBalancer loadBalancer;
    private final ClusterMetrics clusterMetrics;
    private final ScheduledExecutorService scheduler;
    
    public ClusterCoordinationService() {
        this.scheduler = Executors.newScheduledThreadPool(2);
        
        // 定期执行健康检查
        scheduler.scheduleAtFixedRate(this::performHealthCheck, 0, 30, TimeUnit.SECONDS);
        
        // 定期更新负载均衡
        scheduler.scheduleAtFixedRate(this::updateLoadBalancing, 0, 10, TimeUnit.SECONDS);
    }
    
    // 节点注册
    public void registerNode(NodeInfo nodeInfo) {
        nodeRegistry.registerNode(nodeInfo);
        clusterMetrics.recordNodeRegistration(nodeInfo.getId());
        log.info("Node registered: {}", nodeInfo.getId());
    }
    
    // 节点注销
    public void unregisterNode(String nodeId) {
        nodeRegistry.unregisterNode(nodeId);
        clusterMetrics.recordNodeUnregistration(nodeId);
        log.info("Node unregistered: {}", nodeId);
    }
    
    // 执行健康检查
    private void performHealthCheck() {
        List<NodeInfo> allNodes = nodeRegistry.getAllNodes();
        int healthyNodes = 0;
        
        for (NodeInfo node : allNodes) {
            boolean isHealthy = healthChecker.checkHealth(node);
            nodeRegistry.updateNodeHealth(node.getId(), isHealthy);
            
            if (isHealthy) {
                healthyNodes++;
            } else {
                clusterMetrics.recordNodeUnhealthy(node.getId());
                log.warn("Node is unhealthy: {}", node.getId());
            }
        }
        
        clusterMetrics.updateHealthyNodeCount(healthyNodes);
    }
    
    // 更新负载均衡
    private void updateLoadBalancing() {
        List<NodeInfo> healthyNodes = nodeRegistry.getHealthyNodes();
        loadBalancer.updateNodeList(healthyNodes);
        clusterMetrics.updateLoadBalancingInfo(healthyNodes.size());
    }
    
    // 获取节点状态
    public ClusterStatus getClusterStatus() {
        List<NodeInfo> allNodes = nodeRegistry.getAllNodes();
        List<NodeInfo> healthyNodes = nodeRegistry.getHealthyNodes();
        
        return ClusterStatus.builder()
            .totalNodes(allNodes.size())
            .healthyNodes(healthyNodes.size())
            .unhealthyNodes(allNodes.size() - healthyNodes.size())
            .nodes(allNodes)
            .timestamp(System.currentTimeMillis())
            .build();
    }
}
```

## 数据面核心组件设计

数据面是分布式限流平台的"肌肉"，负责实际的限流执行工作。

### 1. 限流执行组件

限流执行组件负责根据策略执行具体的限流操作。

#### 核心功能
- 限流算法实现
- 请求处理
- 结果返回
- 性能优化

#### 技术实现
```java
// 限流执行服务
@Service
public class RateLimitExecutionService {
    
    private final DistributedCounter distributedCounter;
    private final LocalCounter localCounter;
    private final PolicyCache policyCache;
    private final CircuitBreaker circuitBreaker;
    private final ExecutionMetrics executionMetrics;
    
    // 执行限流检查
    public RateLimitResult checkLimit(String resource, int permits) {
        long startTime = System.currentTimeMillis();
        
        try {
            // 熔断器检查
            if (circuitBreaker.isOpen()) {
                executionMetrics.recordCircuitBreakerTriggered();
                return RateLimitResult.denied("Circuit breaker is open");
            }
            
            // 获取限流策略
            RateLimitRule rule = getRule(resource);
            if (rule == null) {
                executionMetrics.recordNoRuleFound(resource);
                return RateLimitResult.allowed(); // 没有规则，默认允许
            }
            
            // 执行限流检查
            boolean allowed = executeRateLimit(resource, permits, rule);
            
            long duration = System.currentTimeMillis() - startTime;
            if (allowed) {
                executionMetrics.recordAllowedRequest(resource, duration);
                circuitBreaker.recordSuccess();
                return RateLimitResult.allowed();
            } else {
                executionMetrics.recordDeniedRequest(resource, duration);
                circuitBreaker.recordFailure();
                return RateLimitResult.denied("Rate limit exceeded");
            }
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            executionMetrics.recordExecutionError(resource, duration, e);
            circuitBreaker.recordFailure();
            
            // 异常情况下，默认允许请求（fail-open策略）
            return RateLimitResult.allowed("Execution error, fail-open");
        }
    }
    
    // 获取限流策略
    private RateLimitRule getRule(String resource) {
        // 首先从本地缓存获取
        RateLimitRule rule = policyCache.getRule(resource);
        if (rule != null) {
            return rule;
        }
        
        // 从远程获取（这里简化处理，实际可能需要从配置中心获取）
        // 在实际实现中，这里可能需要通过gRPC或其他方式从控制面获取
        return null;
    }
    
    // 执行限流算法
    private boolean executeRateLimit(String resource, int permits, RateLimitRule rule) {
        switch (rule.getAlgorithm()) {
            case TOKEN_BUCKET:
                return executeTokenBucket(resource, permits, rule);
            case LEAKY_BUCKET:
                return executeLeakyBucket(resource, permits, rule);
            case FIXED_WINDOW:
                return executeFixedWindow(resource, permits, rule);
            case SLIDING_WINDOW:
                return executeSlidingWindow(resource, permits, rule);
            default:
                throw new UnsupportedOperationException("Unsupported algorithm: " + rule.getAlgorithm());
        }
    }
    
    // 令牌桶算法实现
    private boolean executeTokenBucket(String resource, int permits, RateLimitRule rule) {
        String key = buildCounterKey(resource, rule);
        return distributedCounter.acquireTokens(key, permits, 
            rule.getLimit(), rule.getWindowSize());
    }
    
    // 漏桶算法实现
    private boolean executeLeakyBucket(String resource, int permits, RateLimitRule rule) {
        String key = buildCounterKey(resource, rule);
        return distributedCounter.acquirePermits(key, permits, 
            rule.getLimit(), rule.getWindowSize());
    }
    
    // 固定窗口算法实现
    private boolean executeFixedWindow(String resource, int permits, RateLimitRule rule) {
        String key = buildCounterKey(resource, rule);
        return distributedCounter.checkFixedWindow(key, permits, 
            rule.getLimit(), rule.getWindowSize());
    }
    
    // 滑动窗口算法实现
    private boolean executeSlidingWindow(String resource, int permits, RateLimitRule rule) {
        String key = buildCounterKey(resource, rule);
        return distributedCounter.checkSlidingWindow(key, permits, 
            rule.getLimit(), rule.getWindowSize());
    }
    
    // 构建计数器key
    private String buildCounterKey(String resource, RateLimitRule rule) {
        return "rate_limit:" + rule.getDimension() + ":" + resource;
    }
}
```

### 2. 分布式计数器组件

分布式计数器组件负责在分布式环境中维护计数状态。

#### 核心功能
- 分布式计数
- 原子操作保证
- 性能优化
- 故障处理

#### 技术实现
```java
// 分布式计数器实现
@Component
public class RedisDistributedCounter implements DistributedCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final CounterMetrics counterMetrics;
    
    // 获取令牌（令牌桶算法）
    @Override
    public boolean acquireTokens(String key, int tokens, int rate, long windowSize) {
        long startTime = System.currentTimeMillis();
        
        try {
            String script = 
                "local current = redis.call('GET', KEYS[1]) or '0'\n" +
                "local last_refill = redis.call('GET', KEYS[2]) or '0'\n" +
                "local now = tonumber(ARGV[1])\n" +
                "local rate = tonumber(ARGV[2])\n" +
                "local window = tonumber(ARGV[3])\n" +
                "local tokens_requested = tonumber(ARGV[4])\n" +
                
                "-- 计算需要补充的令牌数\n" +
                "local time_passed = now - tonumber(last_refill)\n" +
                "local tokens_to_add = math.floor((time_passed / 1000) * rate)\n" +
                
                "-- 更新令牌数\n" +
                "local new_tokens = math.min(rate, tonumber(current) + tokens_to_add)\n" +
                
                "-- 检查是否有足够的令牌\n" +
                "if new_tokens >= tokens_requested then\n" +
                "  redis.call('SET', KEYS[1], new_tokens - tokens_requested)\n" +
                "  redis.call('SET', KEYS[2], now)\n" +
                "  redis.call('EXPIRE', KEYS[1], math.ceil(window / 1000))\n" +
                "  redis.call('EXPIRE', KEYS[2], math.ceil(window / 1000))\n" +
                "  return 1\n" +
                "else\n" +
                "  redis.call('SET', KEYS[1], new_tokens)\n" +
                "  redis.call('SET', KEYS[2], now)\n" +
                "  redis.call('EXPIRE', KEYS[1], math.ceil(window / 1000))\n" +
                "  redis.call('EXPIRE', KEYS[2], math.ceil(window / 1000))\n" +
                "  return 0\n" +
                "end";
            
            List<String> keys = Arrays.asList(key + ":tokens", key + ":last_refill");
            List<String> args = Arrays.asList(
                String.valueOf(System.currentTimeMillis()),
                String.valueOf(rate),
                String.valueOf(windowSize),
                String.valueOf(tokens)
            );
            
            Object result = redisTemplate.execute(
                new DefaultRedisScript<>(script, Long.class), keys, args.toArray());
            
            long duration = System.currentTimeMillis() - startTime;
            counterMetrics.recordCounterOperation("acquire_tokens", duration);
            
            return "1".equals(result.toString());
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            counterMetrics.recordCounterError("acquire_tokens", duration, e);
            throw new DistributedCounterException("Failed to acquire tokens", e);
        }
    }
    
    // 滑动窗口计数
    @Override
    public boolean checkSlidingWindow(String key, int permits, int limit, long windowSize) {
        long startTime = System.currentTimeMillis();
        
        try {
            String script = 
                "redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])\n" +
                "local current_count = redis.call('ZCARD', KEYS[1])\n" +
                "if current_count + tonumber(ARGV[2]) <= tonumber(ARGV[3]) then\n" +
                "  for i=1,tonumber(ARGV[2]) do\n" +
                "    redis.call('ZADD', KEYS[1], ARGV[4], ARGV[4]..i)\n" +
                "  end\n" +
                "  redis.call('EXPIRE', KEYS[1], ARGV[5])\n" +
                "  return 1\n" +
                "else\n" +
                "  return 0\n" +
                "end";
            
            List<String> keys = Arrays.asList(key);
            List<String> args = Arrays.asList(
                String.valueOf(System.currentTimeMillis() - windowSize),
                String.valueOf(permits),
                String.valueOf(limit),
                String.valueOf(System.currentTimeMillis()),
                String.valueOf(windowSize / 1000) // 转换为秒
            );
            
            Object result = redisTemplate.execute(
                new DefaultRedisScript<>(script, Long.class), keys, args.toArray());
            
            long duration = System.currentTimeMillis() - startTime;
            counterMetrics.recordCounterOperation("sliding_window", duration);
            
            return "1".equals(result.toString());
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            counterMetrics.recordCounterError("sliding_window", duration, e);
            throw new DistributedCounterException("Failed to check sliding window", e);
        }
    }
}
```

### 3. 本地缓存组件

本地缓存组件用于缓存策略和计数信息，提高性能。

#### 核心功能
- 策略缓存
- 计数结果缓存
- 缓存失效管理
- 内存使用优化

#### 技术实现
```java
// 本地缓存实现
@Component
public class LocalPolicyCache {
    
    private final Cache<String, RateLimitRule> ruleCache;
    private final Cache<String, Boolean> resultCache;
    private final CacheMetrics cacheMetrics;
    
    public LocalPolicyCache() {
        // 策略缓存：最多10000个条目，过期时间5分钟
        this.ruleCache = Caffeine.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .recordStats()
            .build();
            
        // 结果缓存：最多50000个条目，过期时间1秒
        this.resultCache = Caffeine.newBuilder()
            .maximumSize(50000)
            .expireAfterWrite(1, TimeUnit.SECONDS)
            .recordStats()
            .build();
            
        this.cacheMetrics = new CacheMetrics();
    }
    
    // 获取限流规则
    public RateLimitRule getRule(String resource) {
        RateLimitRule rule = ruleCache.getIfPresent(resource);
        if (rule != null) {
            cacheMetrics.recordRuleCacheHit();
        } else {
            cacheMetrics.recordRuleCacheMiss();
        }
        return rule;
    }
    
    // 放入限流规则
    public void putRule(String resource, RateLimitRule rule) {
        ruleCache.put(resource, rule);
        cacheMetrics.recordRuleCachePut();
    }
    
    // 获取限流结果
    public Boolean getResult(String cacheKey) {
        Boolean result = resultCache.getIfPresent(cacheKey);
        if (result != null) {
            cacheMetrics.recordResultCacheHit();
        } else {
            cacheMetrics.recordResultCacheMiss();
        }
        return result;
    }
    
    // 放入限流结果
    public void putResult(String cacheKey, boolean result) {
        resultCache.put(cacheKey, result);
        cacheMetrics.recordResultCachePut();
    }
    
    // 获取缓存统计信息
    public CacheStats getCacheStats() {
        return CacheStats.builder()
            .ruleCacheStats(ruleCache.stats())
            .resultCacheStats(resultCache.stats())
            .build();
    }
}
```

## 存储层核心组件设计

存储层负责持久化限流平台的各种数据。

### 1. 规则配置存储

规则配置存储负责存储限流规则和相关配置。

#### 核心功能
- 规则持久化
- 配置版本管理
- 查询优化
- 事务支持

#### 技术实现
```java
// 规则存储实现
@Repository
public class RuleRepositoryImpl implements RuleRepository {
    
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    
    // 保存规则
    @Override
    public RateLimitRule save(RateLimitRule rule) {
        String sql = "INSERT INTO rate_limit_rules (id, resource, limit_value, window_size, " +
                    "algorithm, dimension, granularity, description, created_at, updated_at, version) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        jdbcTemplate.update(sql,
            rule.getId(),
            rule.getResource(),
            rule.getLimit(),
            rule.getWindowSize(),
            rule.getAlgorithm().name(),
            rule.getDimension() != null ? rule.getDimension().name() : null,
            rule.getGranularity() != null ? rule.getGranularity().name() : null,
            rule.getDescription(),
            rule.getCreatedAt(),
            rule.getUpdatedAt(),
            rule.getVersion()
        );
        
        return rule;
    }
    
    // 更新规则
    @Override
    public RateLimitRule update(String id, RateLimitRule rule) {
        String sql = "UPDATE rate_limit_rules SET resource = ?, limit_value = ?, window_size = ?, " +
                    "algorithm = ?, dimension = ?, granularity = ?, description = ?, " +
                    "updated_at = ?, version = ? WHERE id = ? AND version = ?";
        
        int updated = jdbcTemplate.update(sql,
            rule.getResource(),
            rule.getLimit(),
            rule.getWindowSize(),
            rule.getAlgorithm().name(),
            rule.getDimension() != null ? rule.getDimension().name() : null,
            rule.getGranularity() != null ? rule.getGranularity().name() : null,
            rule.getDescription(),
            rule.getUpdatedAt(),
            rule.getVersion(),
            id,
            rule.getVersion() - 1 // 乐观锁检查
        );
        
        if (updated == 0) {
            throw new OptimisticLockException("Rule has been modified by another transaction");
        }
        
        return rule;
    }
    
    // 删除规则
    @Override
    public void delete(String id) {
        String sql = "DELETE FROM rate_limit_rules WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
    
    // 根据ID查询规则
    @Override
    public Optional<RateLimitRule> findById(String id) {
        String sql = "SELECT * FROM rate_limit_rules WHERE id = ?";
        
        try {
            RateLimitRule rule = jdbcTemplate.queryForObject(sql, new RuleRowMapper(), id);
            return Optional.of(rule);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    // 查询规则
    @Override
    public List<RateLimitRule> query(RuleQuery query) {
        StringBuilder sql = new StringBuilder("SELECT * FROM rate_limit_rules WHERE 1=1");
        List<Object> params = new ArrayList<>();
        
        if (query.getResource() != null && !query.getResource().isEmpty()) {
            sql.append(" AND resource LIKE ?");
            params.add("%" + query.getResource() + "%");
        }
        
        if (query.getAlgorithm() != null) {
            sql.append(" AND algorithm = ?");
            params.add(query.getAlgorithm().name());
        }
        
        sql.append(" ORDER BY updated_at DESC");
        
        if (query.getLimit() > 0) {
            sql.append(" LIMIT ?");
            params.add(query.getLimit());
        }
        
        return jdbcTemplate.query(sql.toString(), new RuleRowMapper(), params.toArray());
    }
}
```

### 2. 分布式计数存储

分布式计数存储负责存储分布式计数器的状态。

#### 核心功能
- 高性能读写
- 数据一致性保证
- 持久化支持
- 扩展性设计

#### 技术实现
```java
// Redis配置
@Configuration
@EnableCaching
public class RedisConfig {
    
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName("localhost");
        config.setPort(6379);
        return new LettuceConnectionFactory(config);
    }
    
    @Bean
    public RedisTemplate<String, String> redisTemplate() {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
    
    // Redis集群配置
    @Bean
    @Profile("cluster")
    public LettuceConnectionFactory clusterRedisConnectionFactory() {
        RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration(
            Arrays.asList("localhost:7000", "localhost:7001", "localhost:7002"));
        return new LettuceConnectionFactory(clusterConfig);
    }
}
```

### 3. 监控数据存储

监控数据存储负责存储平台的监控和统计信息。

#### 核心功能
- 指标数据存储
- 日志数据存储
- 查询优化
- 数据归档

#### 技术实现
```java
// 监控数据存储实现
@Repository
public class MetricsRepositoryImpl implements MetricsRepository {
    
    private final MongoTemplate mongoTemplate;
    
    // 存储指标数据
    @Override
    public void saveMetrics(RateLimitMetrics metrics) {
        mongoTemplate.save(metrics, "rate_limit_metrics");
    }
    
    // 查询实时指标
    @Override
    public RateLimitMetrics getRealtimeMetrics(String resource) {
        Query query = new Query()
            .addCriteria(Criteria.where("resource").is(resource))
            .with(Sort.by(Sort.Direction.DESC, "timestamp"))
            .limit(1);
            
        return mongoTemplate.findOne(query, RateLimitMetrics.class, "rate_limit_metrics");
    }
    
    // 查询历史指标
    @Override
    public List<RateLimitMetrics> getHistoryMetrics(String resource, 
                                                   LocalDateTime start, 
                                                   LocalDateTime end) {
        Query query = new Query()
            .addCriteria(Criteria.where("resource").is(resource)
                .and("timestamp").gte(start).lte(end))
            .with(Sort.by(Sort.Direction.ASC, "timestamp"));
            
        return mongoTemplate.find(query, RateLimitMetrics.class, "rate_limit_metrics");
    }
    
    // 聚合统计指标
    @Override
    public AggregatedMetrics getAggregatedMetrics(String resource, 
                                                 LocalDateTime start, 
                                                 LocalDateTime end) {
        GroupOperation group = Aggregation.group()
            .sum("allowedCount").as("totalAllowed")
            .sum("deniedCount").as("totalDenied")
            .avg("averageLatency").as("avgLatency")
            .max("peakQps").as("maxQps");
            
        MatchOperation match = Aggregation.match(
            Criteria.where("resource").is(resource)
                .and("timestamp").gte(start).lte(end));
                
        Aggregation aggregation = Aggregation.newAggregation(match, group);
        
        AggregationResults<AggregatedMetrics> results = mongoTemplate.aggregate(
            aggregation, "rate_limit_metrics", AggregatedMetrics.class);
            
        return results.getUniqueMappedResult();
    }
}
```

## 组件间交互机制

各个核心组件通过定义良好的接口和协议进行交互，确保系统的松耦合和高内聚。

### 1. 异步消息机制

```java
// 消息队列配置
@Configuration
public class MessageQueueConfig {
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(new Jackson2JsonMessageConverter());
        return template;
    }
    
    @Bean
    public Queue policyUpdatesQueue() {
        return QueueBuilder.durable("policy_updates").build();
    }
    
    @Bean
    public Queue policyDeletesQueue() {
        return QueueBuilder.durable("policy_deletes").build();
    }
    
    @Bean
    public TopicExchange policyExchange() {
        return new TopicExchange("policy_exchange");
    }
    
    @Bean
    public Binding policyUpdatesBinding() {
        return BindingBuilder.bind(policyUpdatesQueue())
            .to(policyExchange())
            .with("policy.update.#");
    }
    
    @Bean
    public Binding policyDeletesBinding() {
        return BindingBuilder.bind(policyDeletesQueue())
            .to(policyExchange())
            .with("policy.delete.#");
    }
}
```

### 2. gRPC通信机制

```java
// gRPC服务定义
@Service
public class DataPlaneGrpcService extends DataPlaneServiceGrpc.DataPlaneServiceImplBase {
    
    private final RateLimitExecutionService executionService;
    
    @Override
    public void checkLimit(CheckLimitRequest request, 
                          StreamObserver<CheckLimitResponse> responseObserver) {
        try {
            RateLimitResult result = executionService.checkLimit(
                request.getResource(), request.getPermits());
            
            CheckLimitResponse response = CheckLimitResponse.newBuilder()
                .setAllowed(result.isAllowed())
                .setMessage(result.getMessage())
                .build();
                
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }
    
    @Override
    public void updatePolicy(UpdatePolicyRequest request, 
                           StreamObserver<UpdatePolicyResponse> responseObserver) {
        try {
            // 处理策略更新
            // ...
            
            UpdatePolicyResponse response = UpdatePolicyResponse.newBuilder()
                .setSuccess(true)
                .build();
                
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}
```

## 总结

分布式限流平台的核心组件设计涵盖了控制面、数据面和存储层的各个方面。每个组件都有明确的职责和设计考量：

1. **控制面组件**负责策略管理和分发，确保限流规则能够及时准确地传递到数据面
2. **数据面组件**负责实际的限流执行，通过高效的算法实现和本地缓存优化提升性能
3. **存储层组件**负责数据的持久化存储，确保系统的可靠性和可追溯性

组件间的交互通过异步消息机制和gRPC通信实现，确保系统的高可用性和可扩展性。在实际实现中，需要根据具体的业务需求和技术环境选择合适的技术栈和实现方案。

在后续章节中，我们将深入探讨如何实现这些组件的高可用设计和扩展性设计。