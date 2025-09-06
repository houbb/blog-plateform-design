---
title: 故障降级与恢复：Redis宕机时，自动降级到本地限流或直接放行
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed]
published: true
---

在分布式限流系统中，存储组件（如Redis）的故障可能导致整个限流功能失效，进而影响业务的正常运行。为了确保系统的高可用性，必须实现完善的故障降级与恢复机制。当Redis等分布式存储组件出现故障时，系统应该能够自动降级到本地限流或直接放行策略，保证核心业务的连续性。本文将深入探讨分布式限流系统的故障降级与恢复机制，包括降级策略设计、实现方法和恢复机制。

## 故障降级策略设计

### 1. 降级策略分类

根据故障场景和业务需求，可以设计多种降级策略，每种策略都有其适用场景和优缺点。

#### Fail-Open策略
```java
// Fail-Open策略实现
public class FailOpenStrategy implements FaultToleranceStrategy {
    
    private final LocalRateLimiter localRateLimiter;
    private final CircuitBreaker circuitBreaker;
    
    @Override
    public RateLimitResult checkLimit(RateLimitContext context) {
        // 检查熔断器状态
        if (circuitBreaker.isOpen()) {
            log.warn("Circuit breaker is open, applying fail-open strategy");
            return RateLimitResult.allowed("Circuit breaker is open, fail-open");
        }
        
        try {
            // 尝试使用分布式限流
            return distributedRateLimiter.checkLimit(context);
        } catch (Exception e) {
            log.error("Distributed rate limiting failed, applying fail-open strategy", e);
            circuitBreaker.recordFailure();
            
            // Fail-Open：默认允许通过
            return RateLimitResult.allowed("Distributed rate limiting failed, fail-open");
        }
    }
}
```

#### Fail-Closed策略
```java
// Fail-Closed策略实现
public class FailClosedStrategy implements FaultToleranceStrategy {
    
    private final CircuitBreaker circuitBreaker;
    
    @Override
    public RateLimitResult checkLimit(RateLimitContext context) {
        // 检查熔断器状态
        if (circuitBreaker.isOpen()) {
            log.warn("Circuit breaker is open, applying fail-closed strategy");
            return RateLimitResult.denied("Circuit breaker is open, fail-closed");
        }
        
        try {
            // 尝试使用分布式限流
            return distributedRateLimiter.checkLimit(context);
        } catch (Exception e) {
            log.error("Distributed rate limiting failed, applying fail-closed strategy", e);
            circuitBreaker.recordFailure();
            
            // Fail-Closed：默认拒绝请求
            return RateLimitResult.denied("Distributed rate limiting failed, fail-closed");
        }
    }
}
```

#### Local-Fallback策略
```java
// Local-Fallback策略实现
public class LocalFallbackStrategy implements FaultToleranceStrategy {
    
    private final LocalRateLimiter localRateLimiter;
    private final CircuitBreaker circuitBreaker;
    
    @Override
    public RateLimitResult checkLimit(RateLimitContext context) {
        // 检查熔断器状态
        if (circuitBreaker.isOpen()) {
            log.warn("Circuit breaker is open, applying local fallback strategy");
            return localRateLimiter.checkLimit(context);
        }
        
        try {
            // 尝试使用分布式限流
            return distributedRateLimiter.checkLimit(context);
        } catch (Exception e) {
            log.error("Distributed rate limiting failed, applying local fallback strategy", e);
            circuitBreaker.recordFailure();
            
            // 降级到本地限流
            return localRateLimiter.checkLimit(context);
        }
    }
}
```

### 2. 策略选择机制

根据不同的业务场景和风险偏好，动态选择合适的降级策略。

#### 动态策略选择
```java
// 动态策略选择实现
@Component
public class DynamicFaultToleranceStrategy implements FaultToleranceStrategy {
    
    private final Map<FaultToleranceMode, FaultToleranceStrategy> strategies;
    private final FaultToleranceConfig config;
    private final ServiceHealthMonitor healthMonitor;
    
    public DynamicFaultToleranceStrategy(FaultToleranceConfig config,
                                        ServiceHealthMonitor healthMonitor) {
        this.config = config;
        this.healthMonitor = healthMonitor;
        
        // 初始化各种策略
        this.strategies = new HashMap<>();
        this.strategies.put(FaultToleranceMode.FAIL_OPEN, new FailOpenStrategy());
        this.strategies.put(FaultToleranceMode.FAIL_CLOSED, new FailClosedStrategy());
        this.strategies.put(FaultToleranceMode.LOCAL_FALLBACK, new LocalFallbackStrategy());
    }
    
    @Override
    public RateLimitResult checkLimit(RateLimitContext context) {
        // 根据当前健康状态和配置选择策略
        FaultToleranceMode mode = determineStrategyMode(context);
        FaultToleranceStrategy strategy = strategies.get(mode);
        
        if (strategy != null) {
            return strategy.checkLimit(context);
        }
        
        // 默认使用Fail-Open策略
        return new FailOpenStrategy().checkLimit(context);
    }
    
    private FaultToleranceMode determineStrategyMode(RateLimitContext context) {
        // 检查存储服务健康状态
        ServiceHealth storageHealth = healthMonitor.getStorageHealth();
        
        // 检查业务重要性
        BusinessCriticality criticality = getBusinessCriticality(context);
        
        // 根据健康状态和业务重要性选择策略
        if (storageHealth.isHealthy()) {
            return config.getDefaultMode();
        } else if (criticality == BusinessCriticality.HIGH) {
            // 高优先级业务使用Local-Fallback
            return FaultToleranceMode.LOCAL_FALLBACK;
        } else if (storageHealth.getFailureRate() > 0.5) {
            // 故障率高时使用Fail-Open
            return FaultToleranceMode.FAIL_OPEN;
        } else {
            // 其他情况使用配置的默认策略
            return config.getDefaultMode();
        }
    }
    
    private BusinessCriticality getBusinessCriticality(RateLimitContext context) {
        // 根据上下文判断业务重要性
        // 实现细节省略
        return BusinessCriticality.NORMAL;
    }
}
```

## 熔断器模式实现

### 1. 熔断器核心逻辑

熔断器是实现故障降级的重要组件，能够自动检测故障并切换到降级模式。

#### 熔断器状态管理
```java
// 熔断器实现
public class AdvancedCircuitBreaker {
    
    private final int failureThreshold;
    private final long timeoutMillis;
    private final long retryTimeoutMillis;
    private final int slidingWindowSize;
    
    private enum State {
        CLOSED, OPEN, HALF_OPEN
    }
    
    private volatile State state = State.CLOSED;
    private final SlidingWindowCounter failureCounter;
    private volatile long lastFailureTime;
    private final Object lock = new Object();
    
    public AdvancedCircuitBreaker(int failureThreshold, 
                                 long timeoutMillis, 
                                 long retryTimeoutMillis,
                                 int slidingWindowSize) {
        this.failureThreshold = failureThreshold;
        this.timeoutMillis = timeoutMillis;
        this.retryTimeoutMillis = retryTimeoutMillis;
        this.slidingWindowSize = slidingWindowSize;
        this.failureCounter = new SlidingWindowCounter(slidingWindowSize);
    }
    
    public boolean isOpen() {
        synchronized (lock) {
            if (state == State.OPEN) {
                // 检查是否应该进入半开状态
                if (System.currentTimeMillis() - lastFailureTime > retryTimeoutMillis) {
                    state = State.HALF_OPEN;
                    log.info("Circuit breaker entering HALF_OPEN state");
                    return false;
                }
                return true;
            }
            return false;
        }
    }
    
    public void recordSuccess() {
        synchronized (lock) {
            failureCounter.recordSuccess();
            if (state != State.CLOSED) {
                state = State.CLOSED;
                failureCounter.reset();
                log.info("Circuit breaker closed due to success");
            }
        }
    }
    
    public void recordFailure() {
        synchronized (lock) {
            failureCounter.recordFailure();
            lastFailureTime = System.currentTimeMillis();
            
            // 检查是否应该打开熔断器
            if (state == State.HALF_OPEN || 
                (state == State.CLOSED && failureCounter.getFailureRate() > failureThreshold)) {
                state = State.OPEN;
                log.warn("Circuit breaker opened due to failures");
            }
        }
    }
    
    public void recordHalfOpenSuccess() {
        synchronized (lock) {
            state = State.CLOSED;
            failureCounter.reset();
            log.info("Circuit breaker closed after half-open success");
        }
    }
    
    public void recordHalfOpenFailure() {
        synchronized (lock) {
            state = State.OPEN;
            lastFailureTime = System.currentTimeMillis();
            log.warn("Circuit breaker reopened after half-open failure");
        }
    }
    
    // 滑动窗口计数器
    private static class SlidingWindowCounter {
        private final int windowSize;
        private final Queue<Boolean> window;
        
        public SlidingWindowCounter(int windowSize) {
            this.windowSize = windowSize;
            this.window = new LinkedList<>();
        }
        
        public synchronized void recordSuccess() {
            addToWindow(true);
        }
        
        public synchronized void recordFailure() {
            addToWindow(false);
        }
        
        private void addToWindow(boolean success) {
            window.offer(success);
            if (window.size() > windowSize) {
                window.poll();
            }
        }
        
        public synchronized double getFailureRate() {
            if (window.isEmpty()) {
                return 0.0;
            }
            
            long failureCount = window.stream().filter(success -> !success).count();
            return (double) failureCount / window.size();
        }
        
        public synchronized void reset() {
            window.clear();
        }
    }
}
```

### 2. 熔断器集成

将熔断器集成到限流服务中，实现自动故障检测和降级。

#### 熔断器集成实现
```java
// 熔断器集成实现
@Component
public class CircuitBreakerIntegration {
    
    private final DistributedRateLimiter distributedRateLimiter;
    private final LocalRateLimiter localRateLimiter;
    private final AdvancedCircuitBreaker circuitBreaker;
    private final CircuitBreakerMetrics metrics;
    
    public RateLimitResult checkLimit(RateLimitContext context) {
        // 检查熔断器状态
        if (circuitBreaker.isOpen()) {
            metrics.recordCircuitBreakerOpen();
            return handleCircuitBreakerOpen(context);
        }
        
        try {
            // 执行分布式限流检查
            RateLimitResult result = distributedRateLimiter.checkLimit(context);
            
            // 记录成功
            circuitBreaker.recordSuccess();
            metrics.recordSuccess();
            
            return result;
        } catch (Exception e) {
            log.error("Distributed rate limiting failed", e);
            
            // 记录失败
            circuitBreaker.recordFailure();
            metrics.recordFailure(e);
            
            // 执行降级逻辑
            return handleFailure(context, e);
        }
    }
    
    private RateLimitResult handleCircuitBreakerOpen(RateLimitContext context) {
        // 熔断器打开时的处理逻辑
        switch (config.getOpenStateStrategy()) {
            case FAIL_OPEN:
                return RateLimitResult.allowed("Circuit breaker open, fail-open");
            case FAIL_CLOSED:
                return RateLimitResult.denied("Circuit breaker open, fail-closed");
            case LOCAL_FALLBACK:
                return localRateLimiter.checkLimit(context);
            default:
                return RateLimitResult.allowed("Circuit breaker open, default fail-open");
        }
    }
    
    private RateLimitResult handleFailure(RateLimitContext context, Exception exception) {
        // 故障处理逻辑
        switch (config.getFailureStrategy()) {
            case FAIL_OPEN:
                return RateLimitResult.allowed("Rate limiting failed, fail-open: " + exception.getMessage());
            case FAIL_CLOSED:
                return RateLimitResult.denied("Rate limiting failed, fail-closed: " + exception.getMessage());
            case LOCAL_FALLBACK:
                return localRateLimiter.checkLimit(context);
            default:
                return RateLimitResult.allowed("Rate limiting failed, default fail-open");
        }
    }
}
```

## 本地限流实现

### 1. 本地限流算法

在分布式存储故障时，本地限流作为降级方案需要提供基本的限流能力。

#### 令牌桶本地限流
```java
// 令牌桶本地限流实现
public class LocalTokenBucketRateLimiter {
    
    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor;
    
    public LocalTokenBucketRateLimiter() {
        this.cleanupExecutor = Executors.newScheduledThreadPool(1);
        // 定期清理过期的令牌桶
        this.cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredBuckets,
                                               60, 60, TimeUnit.SECONDS);
    }
    
    public boolean tryAcquire(String resource, int permits, RateLimitRule rule) {
        TokenBucket bucket = buckets.computeIfAbsent(resource, 
            k -> new TokenBucket(rule.getLimit(), rule.getWindowSize()));
        return bucket.tryAcquire(permits);
    }
    
    private static class TokenBucket {
        private final long capacity;
        private final long refillRate; // 每毫秒补充的令牌数
        private volatile long tokens;
        private volatile long lastRefillTime;
        
        public TokenBucket(long capacity, long windowSizeMillis) {
            this.capacity = capacity;
            this.refillRate = (capacity * 1000) / windowSizeMillis; // 每毫秒补充的令牌数
            this.tokens = capacity;
            this.lastRefillTime = System.currentTimeMillis();
        }
        
        public synchronized boolean tryAcquire(int permits) {
            refillTokens();
            
            if (tokens >= permits) {
                tokens -= permits;
                return true;
            }
            return false;
        }
        
        private void refillTokens() {
            long now = System.currentTimeMillis();
            long timePassed = now - lastRefillTime;
            
            if (timePassed > 0) {
                long tokensToAdd = (timePassed * refillRate) / 1000;
                tokens = Math.min(capacity, tokens + tokensToAdd);
                lastRefillTime = now;
            }
        }
    }
    
    private void cleanupExpiredBuckets() {
        long now = System.currentTimeMillis();
        buckets.entrySet().removeIf(entry -> {
            TokenBucket bucket = entry.getValue();
            // 如果很久没有使用，清理掉
            return (now - bucket.lastRefillTime) > 300000; // 5分钟
        });
    }
}
```

#### 滑动窗口本地限流
```java
// 滑动窗口本地限流实现
public class LocalSlidingWindowRateLimiter {
    
    private final Map<String, SlidingWindow> windows = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor;
    
    public LocalSlidingWindowRateLimiter() {
        this.cleanupExecutor = Executors.newScheduledThreadPool(1);
        this.cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredWindows,
                                               60, 60, TimeUnit.SECONDS);
    }
    
    public boolean tryAcquire(String resource, int permits, RateLimitRule rule) {
        SlidingWindow window = windows.computeIfAbsent(resource,
            k -> new SlidingWindow(rule.getLimit(), rule.getWindowSize()));
        return window.tryAcquire(permits);
    }
    
    private static class SlidingWindow {
        private final int limit;
        private final long windowSizeMillis;
        private final Queue<Long> timestamps;
        
        public SlidingWindow(int limit, long windowSizeMillis) {
            this.limit = limit;
            this.windowSizeMillis = windowSizeMillis;
            this.timestamps = new LinkedList<>();
        }
        
        public synchronized boolean tryAcquire(int permits) {
            long now = System.currentTimeMillis();
            long windowStart = now - windowSizeMillis;
            
            // 清除窗口外的过期时间戳
            while (!timestamps.isEmpty() && timestamps.peek() <= windowStart) {
                timestamps.poll();
            }
            
            // 检查是否超过限制
            if (timestamps.size() + permits <= limit) {
                // 添加新的时间戳
                for (int i = 0; i < permits; i++) {
                    timestamps.offer(now);
                }
                return true;
            }
            
            return false;
        }
    }
    
    private void cleanupExpiredWindows() {
        long now = System.currentTimeMillis();
        windows.entrySet().removeIf(entry -> {
            SlidingWindow window = entry.getValue();
            synchronized (window) {
                // 清除过期时间戳
                long windowStart = now - window.windowSizeMillis;
                while (!window.timestamps.isEmpty() && window.timestamps.peek() <= windowStart) {
                    window.timestamps.poll();
                }
                // 如果窗口为空且很久没有使用，清理掉
                return window.timestamps.isEmpty() && 
                       (now - windowStart) > 300000; // 5分钟
            }
        });
    }
}
```

## 故障检测与恢复

### 1. 健康检查机制

实现自动化的健康检查机制，及时发现和处理故障。

#### 健康检查实现
```java
// 健康检查实现
@Component
public class ServiceHealthChecker {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final HealthCheckConfig config;
    private final Map<ServiceType, ServiceHealth> healthStatus = new ConcurrentHashMap<>();
    private final ScheduledExecutorService healthCheckExecutor;
    
    public ServiceHealthChecker(RedisTemplate<String, String> redisTemplate,
                               HealthCheckConfig config) {
        this.redisTemplate = redisTemplate;
        this.config = config;
        this.healthCheckExecutor = Executors.newScheduledThreadPool(2);
        
        // 定期执行健康检查
        this.healthCheckExecutor.scheduleAtFixedRate(this::performHealthChecks,
                                                   0, config.getCheckInterval(), TimeUnit.SECONDS);
    }
    
    private void performHealthChecks() {
        try {
            // 检查Redis健康状态
            checkRedisHealth();
            
            // 检查其他依赖服务健康状态
            checkOtherServices();
            
        } catch (Exception e) {
            log.error("Failed to perform health checks", e);
        }
    }
    
    private void checkRedisHealth() {
        long startTime = System.currentTimeMillis();
        boolean healthy = false;
        String errorMessage = null;
        
        try {
            // 执行简单的Redis操作
            String testKey = "health_check:" + UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(testKey, "ok", Duration.ofSeconds(10));
            String value = redisTemplate.opsForValue().get(testKey);
            
            healthy = "ok".equals(value);
            if (!healthy) {
                errorMessage = "Redis returned unexpected value: " + value;
            }
        } catch (Exception e) {
            healthy = false;
            errorMessage = e.getMessage();
            log.error("Redis health check failed", e);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            ServiceHealth health = ServiceHealth.builder()
                .serviceType(ServiceType.REDIS)
                .healthy(healthy)
                .responseTime(duration)
                .errorMessage(errorMessage)
                .lastCheckTime(System.currentTimeMillis())
                .build();
                
            healthStatus.put(ServiceType.REDIS, health);
            
            // 上报健康指标
            reportHealthMetrics(health);
        }
    }
    
    public ServiceHealth getStorageHealth() {
        return healthStatus.getOrDefault(ServiceType.REDIS, 
            ServiceHealth.unhealthy(ServiceType.REDIS));
    }
    
    private void reportHealthMetrics(ServiceHealth health) {
        // 上报健康指标到监控系统
        metrics.gauge("service.health.status", health.isHealthy() ? 1 : 0,
                     "service", health.getServiceType().name());
        metrics.gauge("service.health.response_time", health.getResponseTime(),
                     "service", health.getServiceType().name());
    }
}
```

### 2. 自动恢复机制

实现自动化的故障恢复机制，当服务恢复正常时自动切换回正常模式。

#### 自动恢复实现
```java
// 自动恢复机制实现
@Component
public class AutoRecoveryManager {
    
    private final ServiceHealthChecker healthChecker;
    private final CircuitBreakerManager circuitBreakerManager;
    private final RecoveryConfig config;
    private final ScheduledExecutorService recoveryExecutor;
    
    public AutoRecoveryManager(ServiceHealthChecker healthChecker,
                              CircuitBreakerManager circuitBreakerManager,
                              RecoveryConfig config) {
        this.healthChecker = healthChecker;
        this.circuitBreakerManager = circuitBreakerManager;
        this.config = config;
        this.recoveryExecutor = Executors.newScheduledThreadPool(1);
        
        // 定期检查是否可以恢复
        this.recoveryExecutor.scheduleAtFixedRate(this::checkAndRecover,
                                                30, 30, TimeUnit.SECONDS);
    }
    
    private void checkAndRecover() {
        try {
            // 检查存储服务是否恢复
            if (isStorageRecovered()) {
                // 尝试恢复熔断器
                recoverCircuitBreakers();
            }
        } catch (Exception e) {
            log.error("Failed to check and recover", e);
        }
    }
    
    private boolean isStorageRecovered() {
        ServiceHealth storageHealth = healthChecker.getStorageHealth();
        
        // 检查服务是否健康且连续健康检查成功次数达到阈值
        return storageHealth.isHealthy() && 
               storageHealth.getSuccessiveSuccessCount() >= config.getRecoveryThreshold();
    }
    
    private void recoverCircuitBreakers() {
        // 获取所有熔断器
        List<CircuitBreaker> circuitBreakers = circuitBreakerManager.getAllCircuitBreakers();
        
        for (CircuitBreaker cb : circuitBreakers) {
            if (cb.isOpen() || cb.isHalfOpen()) {
                try {
                    // 执行恢复测试
                    if (testRecovery(cb)) {
                        // 恢复熔断器
                        cb.close();
                        log.info("Circuit breaker recovered: {}", cb.getName());
                        
                        // 发送恢复通知
                        sendRecoveryNotification(cb);
                    }
                } catch (Exception e) {
                    log.warn("Failed to recover circuit breaker: {}", cb.getName(), e);
                }
            }
        }
    }
    
    private boolean testRecovery(CircuitBreaker cb) {
        try {
            // 执行简单的测试操作
            return cb.testOperation();
        } catch (Exception e) {
            log.warn("Recovery test failed for circuit breaker: {}", cb.getName(), e);
            return false;
        }
    }
    
    private void sendRecoveryNotification(CircuitBreaker cb) {
        // 发送恢复通知
        Notification notification = Notification.builder()
            .type(NotificationType.SERVICE_RECOVERY)
            .title("Service Recovery")
            .message("Circuit breaker recovered: " + cb.getName())
            .timestamp(System.currentTimeMillis())
            .build();
            
        notificationService.send(notification);
    }
}
```

## 配置管理

### 1. 动态配置

支持动态调整故障降级策略和相关参数。

#### 动态配置实现
```java
// 动态配置实现
@ConfigurationProperties(prefix = "fault-tolerance")
@Data
public class FaultToleranceConfig {
    
    // 熔断器配置
    private CircuitBreakerConfig circuitBreaker = new CircuitBreakerConfig();
    
    // 降级策略配置
    private FallbackStrategyConfig fallbackStrategy = new FallbackStrategyConfig();
    
    // 健康检查配置
    private HealthCheckConfig healthCheck = new HealthCheckConfig();
    
    // 恢复配置
    private RecoveryConfig recovery = new RecoveryConfig();
    
    @Data
    public static class CircuitBreakerConfig {
        private int failureThreshold = 5;
        private long timeoutMillis = 60000;
        private long retryTimeoutMillis = 30000;
        private int slidingWindowSize = 10;
    }
    
    @Data
    public static class FallbackStrategyConfig {
        private FaultToleranceMode defaultMode = FaultToleranceMode.LOCAL_FALLBACK;
        private FaultToleranceMode openStateStrategy = FaultToleranceMode.FAIL_OPEN;
        private FaultToleranceMode failureStrategy = FaultToleranceMode.LOCAL_FALLBACK;
    }
    
    @Data
    public static class HealthCheckConfig {
        private long checkInterval = 30; // 秒
        private long timeout = 5000; // 毫秒
    }
    
    @Data
    public static class RecoveryConfig {
        private int recoveryThreshold = 3;
        private long recoveryTestInterval = 60; // 秒
    }
}

// 配置更新监听
@Component
public class ConfigUpdateListener {
    
    private final FaultToleranceConfig faultToleranceConfig;
    
    @EventListener
    public void handleConfigUpdate(ConfigUpdateEvent event) {
        if ("fault-tolerance".equals(event.getNamespace())) {
            // 更新故障容错配置
            updateFaultToleranceConfig(event.getNewConfig());
            
            // 通知相关组件配置已更新
            notifyComponents();
        }
    }
    
    private void updateFaultToleranceConfig(Map<String, Object> newConfig) {
        // 更新配置的逻辑
        // 实现细节省略
    }
    
    private void notifyComponents() {
        // 通知熔断器、降级策略等组件配置已更新
        ApplicationContext.publishEvent(new FaultToleranceConfigUpdatedEvent());
    }
}
```

### 2. 策略配置

根据不同业务场景配置不同的降级策略。

```yaml
# 故障容错配置
fault-tolerance:
  # 熔断器配置
  circuit-breaker:
    failure-threshold: 5
    timeout-millis: 60000
    retry-timeout-millis: 30000
    sliding-window-size: 10
  
  # 降级策略配置
  fallback-strategy:
    default-mode: LOCAL_FALLBACK
    open-state-strategy: FAIL_OPEN
    failure-strategy: LOCAL_FALLBACK
  
  # 健康检查配置
  health-check:
    check-interval: 30
    timeout: 5000
  
  # 恢复配置
  recovery:
    recovery-threshold: 3
    recovery-test-interval: 60
  
  # 业务特定配置
  business-specific:
    - service: user-service
      criticality: HIGH
      fallback-mode: LOCAL_FALLBACK
      circuit-breaker:
        failure-threshold: 3
        timeout-millis: 30000
    
    - service: order-service
      criticality: HIGH
      fallback-mode: LOCAL_FALLBACK
      circuit-breaker:
        failure-threshold: 3
        timeout-millis: 30000
    
    - service: notification-service
      criticality: LOW
      fallback-mode: FAIL_OPEN
```

## 监控与告警

### 1. 故障监控

建立完善的故障监控体系，及时发现和处理故障。

#### 故障监控实现
```java
// 故障监控实现
@Component
public class FaultToleranceMonitor {
    
    private final MeterRegistry meterRegistry;
    private final AlertService alertService;
    private final ScheduledExecutorService monitorExecutor;
    
    public FaultToleranceMonitor(MeterRegistry meterRegistry,
                                AlertService alertService) {
        this.meterRegistry = meterRegistry;
        this.alertService = alertService;
        this.monitorExecutor = Executors.newScheduledThreadPool(1);
        
        // 定期监控故障指标
        this.monitorExecutor.scheduleAtFixedRate(this::monitorFaultTolerance,
                                               10, 10, TimeUnit.SECONDS);
    }
    
    private void monitorFaultTolerance() {
        try {
            // 监控熔断器状态
            monitorCircuitBreakers();
            
            // 监控降级次数
            monitorFallbacks();
            
            // 监控故障率
            monitorFailureRate();
            
        } catch (Exception e) {
            log.error("Failed to monitor fault tolerance", e);
        }
    }
    
    private void monitorCircuitBreakers() {
        List<CircuitBreaker> circuitBreakers = circuitBreakerManager.getAllCircuitBreakers();
        
        for (CircuitBreaker cb : circuitBreakers) {
            // 上报熔断器状态指标
            Gauge.builder("circuit.breaker.state")
                .tag("name", cb.getName())
                .tag("state", cb.getState().name())
                .register(meterRegistry, () -> cb.getState() == CircuitBreaker.State.OPEN ? 1 : 0);
                
            // 检查是否需要告警
            if (cb.isOpen()) {
                checkAndAlertCircuitBreaker(cb);
            }
        }
    }
    
    private void monitorFallbacks() {
        // 监控降级次数
        Counter fallbackCounter = Counter.builder("rate.limit.fallback.count")
            .register(meterRegistry);
            
        // 定期检查降级次数是否异常
        double fallbackRate = fallbackCounter.count() / getTotalRequestCount();
        if (fallbackRate > 0.1) { // 降级率超过10%时告警
            alertService.sendAlert(AlertLevel.WARNING, 
                "High fallback rate detected", 
                "Fallback rate: " + String.format("%.2f%%", fallbackRate * 100));
        }
    }
    
    private void monitorFailureRate() {
        // 监控故障率
        Gauge.builder("rate.limit.failure.rate")
            .register(meterRegistry, this::calculateFailureRate);
    }
    
    private double calculateFailureRate() {
        // 计算故障率的逻辑
        // 实现细节省略
        return 0.0;
    }
    
    private void checkAndAlertCircuitBreaker(CircuitBreaker cb) {
        long openDuration = System.currentTimeMillis() - cb.getOpenTime();
        if (openDuration > 300000) { // 熔断器打开超过5分钟
            alertService.sendAlert(AlertLevel.CRITICAL,
                "Circuit breaker remains open",
                "Circuit breaker " + cb.getName() + " has been open for " + 
                (openDuration / 1000) + " seconds");
        }
    }
}
```

### 2. 恢复监控

监控服务恢复情况，确保及时恢复正常运行。

#### 恢复监控实现
```java
// 恢复监控实现
@Component
public class RecoveryMonitor {
    
    private final MeterRegistry meterRegistry;
    private final AlertService alertService;
    private final RecoveryMetrics recoveryMetrics;
    
    @EventListener
    public void handleRecoveryEvent(CircuitBreakerRecoveredEvent event) {
        CircuitBreaker cb = event.getCircuitBreaker();
        
        // 记录恢复事件
        recoveryMetrics.recordRecovery(cb.getName());
        
        // 发送恢复通知
        sendRecoveryNotification(cb);
        
        // 上报恢复指标
        Timer.builder("circuit.breaker.recovery.time")
            .tag("name", cb.getName())
            .register(meterRegistry)
            .record(event.getRecoveryTime(), TimeUnit.MILLISECONDS);
    }
    
    private void sendRecoveryNotification(CircuitBreaker cb) {
        Notification notification = Notification.builder()
            .type(NotificationType.SERVICE_RECOVERY)
            .title("Service Recovery")
            .message("Circuit breaker recovered: " + cb.getName() + 
                    " after " + cb.getOpenDuration() + "ms")
            .timestamp(System.currentTimeMillis())
            .build();
            
        notificationService.send(notification);
        
        // 发送恢复告警（INFO级别）
        alertService.sendAlert(AlertLevel.INFO,
            "Service recovered",
            "Circuit breaker " + cb.getName() + " has recovered");
    }
}
```

## 最佳实践

### 1. 故障处理原则

#### 渐进式降级
```java
// 渐进式降级实现
public class ProgressiveFallbackStrategy implements FaultToleranceStrategy {
    
    private final List<FaultToleranceStrategy> fallbackChain;
    
    public ProgressiveFallbackStrategy() {
        this.fallbackChain = Arrays.asList(
            new DistributedRateLimitStrategy(),
            new LocalCacheStrategy(),
            new LocalRateLimitStrategy(),
            new FailOpenStrategy()
        );
    }
    
    @Override
    public RateLimitResult checkLimit(RateLimitContext context) {
        Exception lastException = null;
        
        for (FaultToleranceStrategy strategy : fallbackChain) {
            try {
                return strategy.checkLimit(context);
            } catch (Exception e) {
                lastException = e;
                log.warn("Strategy {} failed, trying next strategy", 
                        strategy.getClass().getSimpleName(), e);
            }
        }
        
        // 所有策略都失败，记录错误并返回默认结果
        log.error("All fallback strategies failed", lastException);
        return RateLimitResult.allowed("All strategies failed, default allow");
    }
}
```

### 2. 配置建议

```yaml
# 故障容错配置建议
fault-tolerance:
  # 生产环境建议配置
  circuit-breaker:
    failure-threshold: 5        # 5次失败后打开熔断器
    timeout-millis: 60000       # 60秒后尝试半开
    retry-timeout-millis: 30000 # 30秒后重试
    sliding-window-size: 10     # 滑动窗口大小10
  
  fallback-strategy:
    default-mode: LOCAL_FALLBACK  # 默认使用本地降级
    open-state-strategy: FAIL_OPEN # 熔断器打开时直接放行
    failure-strategy: LOCAL_FALLBACK # 失败时使用本地限流
  
  # 核心服务特殊配置
  business-specific:
    - service: payment-service
      criticality: CRITICAL
      fallback-mode: LOCAL_FALLBACK
      circuit-breaker:
        failure-threshold: 3      # 更敏感的熔断
        timeout-millis: 30000     # 更快的恢复
      
    - service: user-service
      criticality: HIGH
      fallback-mode: LOCAL_FALLBACK
      
    - service: logging-service
      criticality: LOW
      fallback-mode: FAIL_OPEN    # 日志服务可以容忍丢失
```

## 总结

故障降级与恢复机制是分布式限流系统高可用性的关键保障。通过合理的降级策略设计、熔断器实现、本地限流备份和自动恢复机制，可以确保在分布式存储组件故障时系统仍能正常运行。

关键要点包括：

1. **降级策略设计**：根据业务重要性和风险偏好选择合适的降级策略
2. **熔断器实现**：通过熔断器自动检测故障并切换到降级模式
3. **本地限流备份**：实现高效的本地限流算法作为降级方案
4. **故障检测与恢复**：建立自动化的健康检查和恢复机制
5. **配置管理**：支持动态配置和业务特定的策略配置
6. **监控告警**：建立完善的监控告警体系及时发现和处理问题

在实际应用中，需要根据具体的业务场景和系统架构，选择合适的故障容错方案，并持续优化和调整配置参数，以达到最佳的系统可用性和用户体验。

通过这些机制的协同工作，分布式限流系统能够在面对各种故障场景时保持稳定运行，确保业务的连续性。