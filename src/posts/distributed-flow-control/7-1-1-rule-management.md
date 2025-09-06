---
title: 规则数据模型：资源、阈值、流控模式、效果（快速失败/Warm Up/排队等待）
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed]
published: true
---

在分布式限流平台中，规则数据模型是整个系统的核心基础。一个设计良好的规则数据模型不仅能够准确描述限流需求，还能支持灵活的配置和高效的执行。本文将深入探讨分布式限流平台的规则数据模型设计，包括资源定义、阈值设置、流控模式选择以及不同限流效果的实现。

## 规则数据模型设计原则

### 1. 设计目标

规则数据模型的设计需要满足以下核心目标：

#### 完整性
能够完整描述各种限流场景的需求，包括不同的算法、维度、粒度等。

#### 灵活性
支持灵活的配置和扩展，能够适应不同的业务场景。

#### 可执行性
模型设计要便于系统理解和执行，避免歧义。

#### 可维护性
结构清晰，易于理解和维护。

### 2. 核心要素

规则数据模型包含以下几个核心要素：

```java
// 规则数据模型核心要素
public class RateLimitRuleModel {
    // 1. 资源标识
    private String resource;
    
    // 2. 阈值配置
    private int threshold;
    private long windowSize;
    
    // 3. 流控模式
    private RateLimitMode mode;
    
    // 4. 限流效果
    private RateLimitEffect effect;
    
    // 5. 其他配置
    private RateLimitAlgorithm algorithm;
    private LimitDimension dimension;
    private LimitGranularity granularity;
}
```

## 资源定义

### 1. 资源标识设计

资源是限流的基本单位，需要有明确的标识来区分不同的限流对象。

#### 资源标识结构
```java
// 资源标识设计
public class ResourceIdentifier {
    
    // 资源类型
    public enum ResourceType {
        API,           // API接口
        SERVICE,       // 服务
        USER,          // 用户
        IP,            // IP地址
        PARAMETER,     // 参数
        CLUSTER        // 集群
    }
    
    // 资源标识构建器
    public static class Builder {
        private ResourceType type;
        private String namespace;
        private String name;
        private Map<String, String> attributes;
        
        public Builder type(ResourceType type) {
            this.type = type;
            return this;
        }
        
        public Builder namespace(String namespace) {
            this.namespace = namespace;
            return this;
        }
        
        public Builder name(String name) {
            this.name = name;
            return this;
        }
        
        public Builder attribute(String key, String value) {
            if (this.attributes == null) {
                this.attributes = new HashMap<>();
            }
            this.attributes.put(key, value);
            return this;
        }
        
        public ResourceIdentifier build() {
            return new ResourceIdentifier(type, namespace, name, attributes);
        }
    }
    
    // 构建标准资源标识
    public static ResourceIdentifier api(String namespace, String apiPath) {
        return new Builder()
            .type(ResourceType.API)
            .namespace(namespace)
            .name(apiPath)
            .build();
    }
    
    public static ResourceIdentifier service(String serviceName) {
        return new Builder()
            .type(ResourceType.SERVICE)
            .name(serviceName)
            .build();
    }
    
    public static ResourceIdentifier user(String userId) {
        return new Builder()
            .type(ResourceType.USER)
            .name(userId)
            .build();
    }
}
```

### 2. 资源分组管理

通过资源分组实现批量管理和策略复用。

#### 资源分组实现
```java
// 资源分组管理
public class ResourceGroup {
    
    private String groupId;
    private String groupName;
    private String description;
    private Set<ResourceIdentifier> resources;
    private RateLimitRule sharedRule;
    
    // 资源分组构建器
    public static class Builder {
        private String groupId = UUID.randomUUID().toString();
        private String groupName;
        private String description;
        private Set<ResourceIdentifier> resources = new HashSet<>();
        private RateLimitRule sharedRule;
        
        public Builder name(String groupName) {
            this.groupName = groupName;
            return this;
        }
        
        public Builder description(String description) {
            this.description = description;
            return this;
        }
        
        public Builder addResource(ResourceIdentifier resource) {
            this.resources.add(resource);
            return this;
        }
        
        public Builder addResources(Collection<ResourceIdentifier> resources) {
            this.resources.addAll(resources);
            return this;
        }
        
        public Builder sharedRule(RateLimitRule rule) {
            this.sharedRule = rule;
            return this;
        }
        
        public ResourceGroup build() {
            return new ResourceGroup(groupId, groupName, description, resources, sharedRule);
        }
    }
    
    // 资源匹配
    public boolean matches(ResourceIdentifier resource) {
        return resources.contains(resource);
    }
    
    // 获取分组内所有资源的限流规则
    public Map<ResourceIdentifier, RateLimitRule> getResourceRules() {
        Map<ResourceIdentifier, RateLimitRule> rules = new HashMap<>();
        for (ResourceIdentifier resource : resources) {
            rules.put(resource, sharedRule);
        }
        return rules;
    }
}
```

## 阈值配置

### 1. 阈值类型定义

不同的业务场景需要不同类型的阈值配置。

#### 阈值配置模型
```java
// 阈值配置模型
public class ThresholdConfig {
    
    // 阈值类型
    public enum ThresholdType {
        QPS,              // 每秒请求数
        CONCURRENT,       // 并发数
        TOTAL_QUOTA,      // 总配额
        PERCENTAGE        // 百分比
    }
    
    private ThresholdType type;
    private double value;
    private TimeUnit timeUnit;
    private String description;
    
    // 动态阈值配置
    public static class DynamicThreshold {
        private ThresholdType baseType;
        private double baseValue;
        private List<ThresholdAdjustment> adjustments;
        
        // 阈值调整规则
        public static class ThresholdAdjustment {
            private TimeRange timeRange;
            private double multiplier;
            private String reason;
            
            public boolean isActive() {
                return timeRange.contains(System.currentTimeMillis());
            }
        }
    }
    
    // 构建QPS阈值
    public static ThresholdConfig qps(double qps) {
        return new ThresholdConfig(ThresholdType.QPS, qps, TimeUnit.SECONDS);
    }
    
    // 构建并发阈值
    public static ThresholdConfig concurrent(int concurrent) {
        return new ThresholdConfig(ThresholdType.CONCURRENT, concurrent, TimeUnit.SECONDS);
    }
    
    // 构建总配额阈值
    public static ThresholdConfig totalQuota(long quota) {
        return new ThresholdConfig(ThresholdType.TOTAL_QUOTA, quota, TimeUnit.SECONDS);
    }
}
```

### 2. 时间窗口配置

时间窗口是限流算法的重要参数，需要灵活配置。

#### 时间窗口模型
```java
// 时间窗口配置
public class TimeWindowConfig {
    
    private long windowSize;      // 窗口大小（毫秒）
    private long slideInterval;   // 滑动间隔（毫秒）
    private TimeUnit timeUnit;
    
    // 预定义时间窗口
    public static class PredefinedWindows {
        public static TimeWindowConfig SECOND = new TimeWindowConfig(1000, 1000);
        public static TimeWindowConfig MINUTE = new TimeWindowConfig(60000, 1000);
        public static TimeWindowConfig HOUR = new TimeWindowConfig(3600000, 60000);
        public static TimeWindowConfig DAY = new TimeWindowConfig(86400000, 3600000);
    }
    
    // 自定义时间窗口
    public static TimeWindowConfig custom(long windowSizeMs, long slideIntervalMs) {
        return new TimeWindowConfig(windowSizeMs, slideIntervalMs);
    }
    
    // 动态时间窗口
    public static class DynamicTimeWindow {
        private List<TimeWindowRule> rules;
        
        public static class TimeWindowRule {
            private TimeRange timeRange;
            private TimeWindowConfig timeWindow;
            private String description;
            
            public boolean isActive() {
                return timeRange.contains(System.currentTimeMillis());
            }
        }
    }
}
```

## 流控模式

### 1. 模式分类

不同的流控模式适用于不同的业务场景。

#### 流控模式定义
```java
// 流控模式定义
public enum RateLimitMode {
    
    // 直接拒绝模式
    REJECT_IMMEDIATELY("立即拒绝", 
        "请求超过阈值时立即拒绝，返回错误信息"),
    
    // 预热模式
    WARM_UP("预热模式", 
        "逐渐增加阈值，避免冷启动时的突发流量"),
    
    // 排队等待模式
    QUEUE_WAIT("排队等待", 
        "请求超过阈值时进入队列等待，直到有容量处理"),
    
    // 优先级模式
    PRIORITY_BASED("优先级模式", 
        "根据请求优先级决定是否限流"),
    
    // 动态调整模式
    DYNAMIC_ADJUST("动态调整", 
        "根据系统负载动态调整限流阈值");
    
    private final String name;
    private final String description;
    
    RateLimitMode(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    public String getName() {
        return name;
    }
    
    public String getDescription() {
        return description;
    }
}
```

### 2. 模式实现

不同流控模式的具体实现方式。

#### 预热模式实现
```java
// 预热模式实现
public class WarmUpRateLimiter {
    
    private final long threshold;
    private final long warmUpPeriod;  // 预热期（毫秒）
    private final long startTime;
    private final RateLimitAlgorithm algorithm;
    
    public WarmUpRateLimiter(long threshold, long warmUpPeriod) {
        this.threshold = threshold;
        this.warmUpPeriod = warmUpPeriod;
        this.startTime = System.currentTimeMillis();
        this.algorithm = new TokenBucketAlgorithm();
    }
    
    public boolean tryAcquire(int permits) {
        long currentTime = System.currentTimeMillis();
        long elapsed = currentTime - startTime;
        
        // 计算当前阶段的阈值
        long currentThreshold = calculateCurrentThreshold(elapsed);
        
        // 使用计算出的阈值进行限流检查
        return algorithm.tryAcquire(permits, currentThreshold);
    }
    
    private long calculateCurrentThreshold(long elapsed) {
        if (elapsed >= warmUpPeriod) {
            // 预热完成，使用正常阈值
            return threshold;
        }
        
        // 预热期间，阈值逐渐增加
        double ratio = (double) elapsed / warmUpPeriod;
        return Math.max(1, (long) (threshold * ratio * ratio * ratio));
    }
}
```

#### 排队等待模式实现
```java
// 排队等待模式实现
public class QueueWaitRateLimiter {
    
    private final long threshold;
    private final long maxQueueSize;
    private final long maxWaitTime;
    private final BlockingQueue<RequestContext> requestQueue;
    private final ScheduledExecutorService scheduler;
    
    public QueueWaitRateLimiter(long threshold, long maxQueueSize, long maxWaitTime) {
        this.threshold = threshold;
        this.maxQueueSize = maxQueueSize;
        this.maxWaitTime = maxWaitTime;
        this.requestQueue = new LinkedBlockingQueue<>((int) maxQueueSize);
        this.scheduler = Executors.newScheduledThreadPool(1);
        
        // 启动处理队列的调度器
        startQueueProcessor();
    }
    
    public RateLimitResult tryAcquire(RequestContext context) {
        // 检查是否可以直接处理
        if (canProcessImmediately()) {
            return RateLimitResult.allowed();
        }
        
        // 检查队列是否已满
        if (requestQueue.size() >= maxQueueSize) {
            return RateLimitResult.denied("Queue is full");
        }
        
        // 将请求加入队列
        try {
            if (requestQueue.offer(context, maxWaitTime, TimeUnit.MILLISECONDS)) {
                // 等待处理结果
                return waitForProcessing(context);
            } else {
                return RateLimitResult.denied("Request timeout");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return RateLimitResult.denied("Interrupted");
        }
    }
    
    private boolean canProcessImmediately() {
        // 检查当前处理能力
        // 实现细节省略
        return getCurrentLoad() < threshold;
    }
    
    private void startQueueProcessor() {
        scheduler.scheduleAtFixedRate(() -> {
            processQueue();
        }, 0, 100, TimeUnit.MILLISECONDS);
    }
    
    private void processQueue() {
        while (!requestQueue.isEmpty() && canProcessImmediately()) {
            RequestContext context = requestQueue.poll();
            if (context != null) {
                // 处理请求
                processRequest(context);
            }
        }
    }
    
    private RateLimitResult waitForProcessing(RequestContext context) throws InterruptedException {
        // 等待处理完成的逻辑
        // 实现细节省略
        return RateLimitResult.allowed();
    }
}
```

## 限流效果配置

### 1. 效果类型定义

不同的限流效果提供不同的用户体验。

#### 限流效果模型
```java
// 限流效果定义
public enum RateLimitEffect {
    
    // 快速失败
    FAIL_FAST("快速失败", 
        "立即拒绝超过阈值的请求，返回错误信息",
        HttpStatus.TOO_MANY_REQUESTS),
    
    // 排队等待
    QUEUE_WAIT("排队等待", 
        "请求排队等待处理，直到有容量",
        HttpStatus.ACCEPTED),
    
    // 降级处理
    DEGRADE("降级处理", 
        "返回降级结果，而不是拒绝请求",
        HttpStatus.OK),
    
    // 重定向
    REDIRECT("重定向", 
        "将请求重定向到其他服务或页面",
        HttpStatus.FOUND),
    
    // 延迟处理
    DELAY("延迟处理", 
        "延迟处理请求，平滑流量",
        HttpStatus.OK);
    
    private final String name;
    private final String description;
    private final HttpStatus defaultStatus;
    
    RateLimitEffect(String name, String description, HttpStatus defaultStatus) {
        this.name = name;
        this.description = description;
        this.defaultStatus = defaultStatus;
    }
    
    public String getName() {
        return name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public HttpStatus getDefaultStatus() {
        return defaultStatus;
    }
}
```

### 2. 效果实现

不同限流效果的具体实现方式。

#### 快速失败效果
```java
// 快速失败效果实现
public class FailFastEffect implements RateLimitEffectHandler {
    
    private final String errorMessage;
    private final HttpStatus statusCode;
    
    public FailFastEffect() {
        this("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    }
    
    public FailFastEffect(String errorMessage, HttpStatus statusCode) {
        this.errorMessage = errorMessage;
        this.statusCode = statusCode;
    }
    
    @Override
    public RateLimitResult apply(RateLimitContext context) {
        return RateLimitResult.builder()
            .allowed(false)
            .statusCode(statusCode)
            .errorMessage(errorMessage)
            .retryAfter(calculateRetryAfter(context))
            .build();
    }
    
    private long calculateRetryAfter(RateLimitContext context) {
        // 计算建议的重试时间
        RateLimitRule rule = context.getRule();
        if (rule != null) {
            return rule.getWindowSize();
        }
        return 1000; // 默认1秒后重试
    }
}
```

#### 降级处理效果
```java
// 降级处理效果实现
public class DegradeEffect implements RateLimitEffectHandler {
    
    private final Object degradeResult;
    private final String degradeMessage;
    
    public DegradeEffect(Object degradeResult) {
        this(degradeResult, "Service is busy, returning degraded result");
    }
    
    public DegradeEffect(Object degradeResult, String degradeMessage) {
        this.degradeResult = degradeResult;
        this.degradeMessage = degradeMessage;
    }
    
    @Override
    public RateLimitResult apply(RateLimitContext context) {
        return RateLimitResult.builder()
            .allowed(true)
            .degraded(true)
            .result(degradeResult)
            .message(degradeMessage)
            .build();
    }
}
```

#### 延迟处理效果
```java
// 延迟处理效果实现
public class DelayEffect implements RateLimitEffectHandler {
    
    private final long delayMillis;
    private final DelayStrategy delayStrategy;
    
    public DelayEffect(long delayMillis) {
        this(delayMillis, DelayStrategy.LINEAR);
    }
    
    public DelayEffect(long delayMillis, DelayStrategy delayStrategy) {
        this.delayMillis = delayMillis;
        this.delayStrategy = delayStrategy;
    }
    
    @Override
    public RateLimitResult apply(RateLimitContext context) {
        long actualDelay = calculateDelay(context);
        
        try {
            // 执行延迟
            Thread.sleep(actualDelay);
            
            return RateLimitResult.builder()
                .allowed(true)
                .delayed(true)
                .delayTime(actualDelay)
                .message("Request processed after delay: " + actualDelay + "ms")
                .build();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return RateLimitResult.builder()
                .allowed(false)
                .errorMessage("Delay interrupted")
                .build();
        }
    }
    
    private long calculateDelay(RateLimitContext context) {
        switch (delayStrategy) {
            case LINEAR:
                return delayMillis;
            case EXPONENTIAL:
                // 指数退避延迟
                return (long) (delayMillis * Math.pow(2, context.getRetryCount()));
            case RANDOM:
                // 随机延迟
                return (long) (delayMillis * (0.5 + Math.random()));
            default:
                return delayMillis;
        }
    }
    
    public enum DelayStrategy {
        LINEAR,      // 线性延迟
        EXPONENTIAL, // 指数退避
        RANDOM       // 随机延迟
    }
}
```

## 完整规则模型

### 1. 规则实体定义

整合所有要素的完整规则模型。

#### 完整规则模型
```java
// 完整的限流规则模型
@Entity
@Table(name = "rate_limit_rules")
public class RateLimitRule {
    
    @Id
    private String id;
    
    // 资源标识
    @Column(nullable = false)
    private String resource;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType resourceType;
    
    // 阈值配置
    @Column(nullable = false)
    private long threshold;
    
    @Column(nullable = false)
    private long windowSize; // 毫秒
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ThresholdType thresholdType;
    
    // 流控模式
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RateLimitMode mode;
    
    // 限流效果
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RateLimitEffect effect;
    
    // 算法配置
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RateLimitAlgorithm algorithm;
    
    // 维度和粒度
    @Enumerated(EnumType.STRING)
    private LimitDimension dimension;
    
    @Enumerated(EnumType.STRING)
    private LimitGranularity granularity;
    
    // 时间配置
    @Column
    private String cronExpression; // 定时配置
    
    @Column
    private Long startTime; // 生效时间
    
    @Column
    private Long endTime;   // 失效时间
    
    // 高级配置
    @Column
    private String conditions; // 条件表达式
    
    @Column
    private String fallbackConfig; // 降级配置
    
    @Column
    private String extensionConfig; // 扩展配置
    
    // 元数据
    @Column(nullable = false)
    private String createdBy;
    
    @Column(nullable = false)
    private long createdAt;
    
    @Column(nullable = false)
    private long updatedAt;
    
    @Version
    private long version;
    
    // 构造函数和getter/setter方法省略
    
    // 业务方法
    public boolean isActive() {
        long now = System.currentTimeMillis();
        if (startTime != null && now < startTime) {
            return false;
        }
        if (endTime != null && now > endTime) {
            return false;
        }
        return true;
    }
    
    public boolean matches(ResourceIdentifier resource) {
        return this.resource.equals(resource.toString());
    }
}
```

### 2. 规则构建器

提供便捷的规则构建方式。

#### 规则构建器实现
```java
// 规则构建器
public class RateLimitRuleBuilder {
    
    private RateLimitRule rule;
    
    private RateLimitRuleBuilder() {
        this.rule = new RateLimitRule();
        this.rule.setId(UUID.randomUUID().toString());
        this.rule.setCreatedAt(System.currentTimeMillis());
        this.rule.setUpdatedAt(System.currentTimeMillis());
    }
    
    public static RateLimitRuleBuilder newRule() {
        return new RateLimitRuleBuilder();
    }
    
    public RateLimitRuleBuilder resource(String resource) {
        this.rule.setResource(resource);
        return this;
    }
    
    public RateLimitRuleBuilder resourceType(ResourceType type) {
        this.rule.setResourceType(type);
        return this;
    }
    
    public RateLimitRuleBuilder threshold(long threshold) {
        this.rule.setThreshold(threshold);
        return this;
    }
    
    public RateLimitRuleBuilder windowSize(long windowSizeMs) {
        this.rule.setWindowSize(windowSizeMs);
        return this;
    }
    
    public RateLimitRuleBuilder thresholdType(ThresholdType type) {
        this.rule.setThresholdType(type);
        return this;
    }
    
    public RateLimitRuleBuilder mode(RateLimitMode mode) {
        this.rule.setMode(mode);
        return this;
    }
    
    public RateLimitRuleBuilder effect(RateLimitEffect effect) {
        this.rule.setEffect(effect);
        return this;
    }
    
    public RateLimitRuleBuilder algorithm(RateLimitAlgorithm algorithm) {
        this.rule.setAlgorithm(algorithm);
        return this;
    }
    
    public RateLimitRuleBuilder dimension(LimitDimension dimension) {
        this.rule.setDimension(dimension);
        return this;
    }
    
    public RateLimitRuleBuilder granularity(LimitGranularity granularity) {
        this.rule.setGranularity(granularity);
        return this;
    }
    
    public RateLimitRuleBuilder timeRange(Long startTime, Long endTime) {
        this.rule.setStartTime(startTime);
        this.rule.setEndTime(endTime);
        return this;
    }
    
    public RateLimitRuleBuilder cron(String cronExpression) {
        this.rule.setCronExpression(cronExpression);
        return this;
    }
    
    public RateLimitRuleBuilder createdBy(String user) {
        this.rule.setCreatedBy(user);
        return this;
    }
    
    public RateLimitRule build() {
        // 验证必要字段
        validateRequiredFields();
        
        // 设置默认值
        setDefaultValues();
        
        return this.rule;
    }
    
    private void validateRequiredFields() {
        if (rule.getResource() == null) {
            throw new IllegalArgumentException("Resource is required");
        }
        if (rule.getThreshold() <= 0) {
            throw new IllegalArgumentException("Threshold must be positive");
        }
        if (rule.getWindowSize() <= 0) {
            throw new IllegalArgumentException("Window size must be positive");
        }
    }
    
    private void setDefaultValues() {
        if (rule.getResourceType() == null) {
            rule.setResourceType(ResourceType.API);
        }
        if (rule.getThresholdType() == null) {
            rule.setThresholdType(ThresholdType.QPS);
        }
        if (rule.getMode() == null) {
            rule.setMode(RateLimitMode.REJECT_IMMEDIATELY);
        }
        if (rule.getEffect() == null) {
            rule.setEffect(RateLimitEffect.FAIL_FAST);
        }
        if (rule.getAlgorithm() == null) {
            rule.setAlgorithm(RateLimitAlgorithm.TOKEN_BUCKET);
        }
    }
}
```

## 规则验证

### 1. 验证逻辑

确保规则配置的正确性和合理性。

#### 规则验证器
```java
// 规则验证器
@Component
public class RateLimitRuleValidator {
    
    public ValidationResult validate(RateLimitRule rule) {
        List<String> errors = new ArrayList<>();
        
        // 验证资源标识
        validateResource(rule, errors);
        
        // 验证阈值配置
        validateThreshold(rule, errors);
        
        // 验证时间配置
        validateTimeConfig(rule, errors);
        
        // 验证模式和效果的兼容性
        validateModeEffectCompatibility(rule, errors);
        
        // 验证算法配置
        validateAlgorithm(rule, errors);
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    private void validateResource(RateLimitRule rule, List<String> errors) {
        if (rule.getResource() == null || rule.getResource().trim().isEmpty()) {
            errors.add("Resource identifier is required");
        }
        
        if (rule.getResourceType() == null) {
            errors.add("Resource type is required");
        }
    }
    
    private void validateThreshold(RateLimitRule rule, List<String> errors) {
        if (rule.getThreshold() <= 0) {
            errors.add("Threshold must be positive");
        }
        
        if (rule.getWindowSize() <= 0) {
            errors.add("Window size must be positive");
        }
        
        // 根据阈值类型进行特定验证
        switch (rule.getThresholdType()) {
            case QPS:
                if (rule.getThreshold() > 100000) {
                    errors.add("QPS threshold is too high (max: 100000)");
                }
                break;
            case CONCURRENT:
                if (rule.getThreshold() > 10000) {
                    errors.add("Concurrent threshold is too high (max: 10000)");
                }
                break;
            case TOTAL_QUOTA:
                if (rule.getThreshold() > 1000000000L) {
                    errors.add("Total quota is too high (max: 1000000000)");
                }
                break;
        }
    }
    
    private void validateTimeConfig(RateLimitRule rule, List<String> errors) {
        if (rule.getStartTime() != null && rule.getEndTime() != null) {
            if (rule.getStartTime() >= rule.getEndTime()) {
                errors.add("Start time must be before end time");
            }
        }
        
        if (rule.getCronExpression() != null) {
            try {
                new CronSequenceGenerator(rule.getCronExpression());
            } catch (Exception e) {
                errors.add("Invalid cron expression: " + e.getMessage());
            }
        }
    }
    
    private void validateModeEffectCompatibility(RateLimitRule rule, List<String> errors) {
        // 验证模式和效果的兼容性
        if (rule.getMode() == RateLimitMode.QUEUE_WAIT && 
            rule.getEffect() == RateLimitEffect.FAIL_FAST) {
            errors.add("Queue wait mode is not compatible with fail fast effect");
        }
    }
    
    private void validateAlgorithm(RateLimitRule rule, List<String> errors) {
        if (rule.getAlgorithm() == null) {
            errors.add("Algorithm is required");
        }
        
        // 根据算法类型验证参数
        switch (rule.getAlgorithm()) {
            case TOKEN_BUCKET:
                // 令牌桶算法验证
                break;
            case LEAKY_BUCKET:
                // 漏桶算法验证
                break;
            case FIXED_WINDOW:
                // 固定窗口算法验证
                break;
            case SLIDING_WINDOW:
                // 滑动窗口算法验证
                break;
        }
    }
}
```

## 配置示例

### 1. 常见配置示例

提供一些常见的规则配置示例。

#### 配置示例
```java
// 常见配置示例
public class RateLimitRuleExamples {
    
    // API接口限流规则
    public static RateLimitRule apiRateLimitRule() {
        return RateLimitRuleBuilder.newRule()
            .resource("/api/users/**")
            .resourceType(ResourceType.API)
            .threshold(1000)
            .windowSize(60000) // 1分钟
            .thresholdType(ThresholdType.QPS)
            .mode(RateLimitMode.REJECT_IMMEDIATELY)
            .effect(RateLimitEffect.FAIL_FAST)
            .algorithm(RateLimitAlgorithm.TOKEN_BUCKET)
            .dimension(LimitDimension.API)
            .granularity(LimitGranularity.SERVICE)
            .createdBy("admin")
            .build();
    }
    
    // 用户级别限流规则
    public static RateLimitRule userRateLimitRule() {
        return RateLimitRuleBuilder.newRule()
            .resource("user:*")
            .resourceType(ResourceType.USER)
            .threshold(100)
            .windowSize(60000) // 1分钟
            .thresholdType(ThresholdType.QPS)
            .mode(RateLimitMode.REJECT_IMMEDIATELY)
            .effect(RateLimitEffect.FAIL_FAST)
            .algorithm(RateLimitAlgorithm.SLIDING_WINDOW)
            .dimension(LimitDimension.USER)
            .granularity(LimitGranularity.USER)
            .createdBy("admin")
            .build();
    }
    
    // 预热模式规则
    public static RateLimitRule warmUpRule() {
        return RateLimitRuleBuilder.newRule()
            .resource("service:payment")
            .resourceType(ResourceType.SERVICE)
            .threshold(1000)
            .windowSize(60000) // 1分钟
            .thresholdType(ThresholdType.QPS)
            .mode(RateLimitMode.WARM_UP)
            .effect(RateLimitEffect.FAIL_FAST)
            .algorithm(RateLimitAlgorithm.TOKEN_BUCKET)
            .dimension(LimitDimension.SERVICE)
            .granularity(LimitGranularity.SERVICE)
            .createdBy("admin")
            .build();
    }
    
    // 排队等待规则
    public static RateLimitRule queueWaitRule() {
        return RateLimitRuleBuilder.newRule()
            .resource("service:order")
            .resourceType(ResourceType.SERVICE)
            .threshold(100)
            .windowSize(60000) // 1分钟
            .thresholdType(ThresholdType.CONCURRENT)
            .mode(RateLimitMode.QUEUE_WAIT)
            .effect(RateLimitEffect.QUEUE_WAIT)
            .algorithm(RateLimitAlgorithm.LEAKY_BUCKET)
            .dimension(LimitDimension.SERVICE)
            .granularity(LimitGranularity.SERVICE)
            .createdBy("admin")
            .build();
    }
}
```

### 2. YAML配置示例

提供YAML格式的配置示例。

```yaml
# YAML配置示例
rate-limit-rules:
  - id: "rule-001"
    resource: "/api/users/**"
    resource-type: API
    threshold: 1000
    window-size: 60000
    threshold-type: QPS
    mode: REJECT_IMMEDIATELY
    effect: FAIL_FAST
    algorithm: TOKEN_BUCKET
    dimension: API
    granularity: SERVICE
    created-by: "admin"
    created-at: 1634567890000
    
  - id: "rule-002"
    resource: "user:*"
    resource-type: USER
    threshold: 100
    window-size: 60000
    threshold-type: QPS
    mode: REJECT_IMMEDIATELY
    effect: FAIL_FAST
    algorithm: SLIDING_WINDOW
    dimension: USER
    granularity: USER
    created-by: "admin"
    created-at: 1634567890000
    
  - id: "rule-003"
    resource: "service:payment"
    resource-type: SERVICE
    threshold: 1000
    window-size: 60000
    threshold-type: QPS
    mode: WARM_UP
    effect: FAIL_FAST
    algorithm: TOKEN_BUCKET
    dimension: SERVICE
    granularity: SERVICE
    created-by: "admin"
    created-at: 1634567890000
```

## 总结

规则数据模型是分布式限流平台的核心基础，一个设计良好的模型能够：

1. **准确描述需求**：通过资源、阈值、模式、效果等要素完整描述限流需求
2. **支持灵活配置**：提供丰富的配置选项适应不同业务场景
3. **便于系统执行**：模型结构清晰，易于系统理解和执行
4. **易于维护管理**：提供验证机制和配置示例，降低维护成本

关键设计要点包括：

- **资源标识设计**：明确的资源分类和标识机制
- **阈值配置**：支持多种阈值类型和时间窗口配置
- **流控模式**：提供多种流控模式满足不同需求
- **限流效果**：丰富的限流效果提升用户体验
- **验证机制**：完善的验证机制确保配置正确性

通过合理的规则数据模型设计，可以构建一个功能强大、灵活易用的分布式限流平台，为业务系统的稳定性提供有力保障。

在后续章节中，我们将深入探讨规则的热更新机制和版本管理。