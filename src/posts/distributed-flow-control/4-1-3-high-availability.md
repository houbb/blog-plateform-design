---
title: 分布式限流平台高可用设计：控制面无状态、数据面本地降级、存储多活
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed]
published: true
---

高可用性是分布式限流平台设计的核心要求之一。在面对大规模并发请求和复杂网络环境时，平台必须能够持续稳定地提供服务，即使在部分组件出现故障的情况下也能保持基本功能。本文将深入探讨分布式限流平台的高可用设计，包括控制面的无状态设计、数据面的本地降级机制以及存储层的多活架构。

## 控制面无状态设计

控制面作为分布式限流平台的"大脑"，负责策略管理、配置分发和系统协调等工作。为了实现高可用性，控制面必须采用无状态设计，确保任何节点的故障都不会影响整体服务。

### 1. 无状态架构设计

无状态设计意味着控制面的每个节点都不保存任何会话状态或业务状态，所有状态信息都存储在外部存储系统中。

#### 核心原则
- **状态外置**：将所有状态信息存储在外部存储系统中
- **水平扩展**：通过增加节点数量来提升处理能力
- **故障透明**：单个节点故障不影响整体服务

#### 技术实现
```java
// 无状态控制面服务实现
@RestController
@RequestMapping("/api/control")
public class StatelessControlPlaneController {
    
    // 使用外部存储而不是本地状态
    private final RuleRepository ruleRepository;
    private final ConfigStore configStore;
    private final SessionStore sessionStore;
    
    // 创建限流规则 - 状态存储在外部数据库
    @PostMapping("/rules")
    public ResponseEntity<RateLimitRule> createRule(@RequestBody CreateRuleRequest request) {
        // 所有状态都存储在外部存储中，节点本身不保存状态
        RateLimitRule rule = RateLimitRule.builder()
            .id(UUID.randomUUID().toString())
            .resource(request.getResource())
            .limit(request.getLimit())
            .algorithm(request.getAlgorithm())
            .createdAt(System.currentTimeMillis())
            .build();
            
        // 保存到外部存储
        RateLimitRule savedRule = ruleRepository.save(rule);
        
        // 通过消息队列通知数据面节点
        publishRuleUpdate(savedRule);
        
        return ResponseEntity.ok(savedRule);
    }
    
    // 查询限流规则 - 从外部存储获取
    @GetMapping("/rules/{id}")
    public ResponseEntity<RateLimitRule> getRule(@PathVariable String id) {
        // 每次都从外部存储获取最新数据
        Optional<RateLimitRule> rule = ruleRepository.findById(id);
        return rule.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // 更新配置 - 存储在配置中心
    @PutMapping("/config/{key}")
    public ResponseEntity<Void> updateConfig(@PathVariable String key, 
                                           @RequestBody String value) {
        // 配置存储在外部配置中心
        configStore.update(key, value);
        
        // 通知所有相关组件配置变更
        notifyConfigChange(key, value);
        
        return ResponseEntity.ok().build();
    }
}
```

### 2. 负载均衡与故障转移

通过负载均衡器和健康检查机制实现控制面的高可用。

#### 负载均衡实现
```java
// 控制面负载均衡实现
@Component
public class ControlPlaneLoadBalancer {
    
    private final List<ControlPlaneNode> nodes;
    private final HealthChecker healthChecker;
    private final AtomicInteger currentIndex = new AtomicInteger(0);
    
    public ControlPlaneLoadBalancer(List<ControlPlaneNode> nodes) {
        this.nodes = nodes;
        this.healthChecker = new HealthChecker();
    }
    
    // 轮询选择健康节点
    public ControlPlaneNode selectNode() {
        List<ControlPlaneNode> healthyNodes = nodes.stream()
            .filter(node -> healthChecker.isHealthy(node.getAddress()))
            .collect(Collectors.toList());
            
        if (healthyNodes.isEmpty()) {
            throw new NoHealthyNodeException("No healthy control plane nodes available");
        }
        
        int index = currentIndex.getAndIncrement() % healthyNodes.size();
        return healthyNodes.get(index);
    }
    
    // 根据负载选择节点
    public ControlPlaneNode selectNodeByLoad() {
        return nodes.stream()
            .filter(node -> healthChecker.isHealthy(node.getAddress()))
            .min(Comparator.comparing(ControlPlaneNode::getLoad))
            .orElseThrow(() -> new NoHealthyNodeException("No healthy control plane nodes available"));
    }
}
```

#### 健康检查实现
```java
// 健康检查实现
@Component
public class HealthChecker {
    
    private final Map<String, HealthStatus> healthStatusCache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    
    public HealthChecker() {
        // 定期执行健康检查
        scheduler.scheduleAtFixedRate(this::performHealthChecks, 0, 30, TimeUnit.SECONDS);
    }
    
    public boolean isHealthy(String address) {
        HealthStatus status = healthStatusCache.get(address);
        if (status == null) {
            return false;
        }
        
        // 检查状态是否过期（5分钟内有效）
        return status.isHealthy() && 
               (System.currentTimeMillis() - status.getLastCheckTime()) < 300000;
    }
    
    private void performHealthChecks() {
        for (ControlPlaneNode node : getAllNodes()) {
            try {
                // 执行健康检查
                boolean healthy = checkNodeHealth(node.getAddress());
                healthStatusCache.put(node.getAddress(), 
                    new HealthStatus(healthy, System.currentTimeMillis()));
                
                if (!healthy) {
                    log.warn("Control plane node is unhealthy: {}", node.getAddress());
                }
            } catch (Exception e) {
                log.error("Failed to check health of node: {}", node.getAddress(), e);
                healthStatusCache.put(node.getAddress(), 
                    new HealthStatus(false, System.currentTimeMillis()));
            }
        }
    }
    
    private boolean checkNodeHealth(String address) {
        try {
            URL url = new URL(address + "/health");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            return connection.getResponseCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }
}
```

### 3. 配置中心集成

通过与配置中心集成，实现配置的集中管理和动态更新。

```java
// 配置中心集成实现
@Component
public class ConfigCenterIntegration {
    
    private final ConfigCenterClient configCenterClient;
    private final Map<String, String> localCache = new ConcurrentHashMap<>();
    private final List<ConfigChangeListener> listeners = new CopyOnWriteArrayList<>();
    
    public ConfigCenterIntegration(ConfigCenterClient configCenterClient) {
        this.configCenterClient = configCenterClient;
        
        // 订阅配置变更通知
        configCenterClient.subscribeConfigChange(this::onConfigChange);
    }
    
    public String getConfig(String key) {
        // 首先从本地缓存获取
        String value = localCache.get(key);
        if (value != null) {
            return value;
        }
        
        // 从配置中心获取
        try {
            value = configCenterClient.getConfig(key);
            if (value != null) {
                localCache.put(key, value);
            }
            return value;
        } catch (Exception e) {
            log.error("Failed to get config from config center: {}", key, e);
            return null;
        }
    }
    
    private void onConfigChange(ConfigChangeEvent event) {
        // 更新本地缓存
        localCache.put(event.getKey(), event.getNewValue());
        
        // 通知监听器
        for (ConfigChangeListener listener : listeners) {
            try {
                listener.onConfigChange(event);
            } catch (Exception e) {
                log.error("Error notifying config change listener", e);
            }
        }
    }
    
    public void addConfigChangeListener(ConfigChangeListener listener) {
        listeners.add(listener);
    }
}
```

## 数据面本地降级机制

数据面作为限流平台的"肌肉"，直接处理业务请求。为了确保在分布式存储或网络故障时仍能提供基本服务，数据面需要实现本地降级机制。

### 1. 熔断器模式实现

通过熔断器模式实现故障检测和自动降级。

```java
// 熔断器实现
public class CircuitBreaker {
    
    private final int failureThreshold;
    private final long timeout;
    private final int retryTimeout;
    
    private enum State {
        CLOSED, OPEN, HALF_OPEN
    }
    
    private volatile State state = State.CLOSED;
    private volatile long lastFailureTime;
    private volatile int failureCount;
    private final Object lock = new Object();
    
    public CircuitBreaker(int failureThreshold, long timeout, int retryTimeout) {
        this.failureThreshold = failureThreshold;
        this.timeout = timeout;
        this.retryTimeout = retryTimeout;
    }
    
    public boolean isOpen() {
        synchronized (lock) {
            if (state == State.OPEN) {
                // 检查是否应该进入半开状态
                if (System.currentTimeMillis() - lastFailureTime > retryTimeout) {
                    state = State.HALF_OPEN;
                    return false;
                }
                return true;
            }
            return false;
        }
    }
    
    public void recordSuccess() {
        synchronized (lock) {
            state = State.CLOSED;
            failureCount = 0;
        }
    }
    
    public void recordFailure() {
        synchronized (lock) {
            failureCount++;
            lastFailureTime = System.currentTimeMillis();
            
            if (failureCount >= failureThreshold) {
                state = State.OPEN;
            }
        }
    }
    
    public void recordHalfOpenSuccess() {
        synchronized (lock) {
            state = State.CLOSED;
            failureCount = 0;
        }
    }
    
    public void recordHalfOpenFailure() {
        synchronized (lock) {
            state = State.OPEN;
            lastFailureTime = System.currentTimeMillis();
        }
    }
}
```

### 2. 本地缓存降级

当分布式存储不可用时，使用本地缓存提供服务。

```java
// 本地缓存降级实现
@Service
public class LocalFallbackRateLimiter {
    
    private final DistributedCounter distributedCounter;
    private final LocalCounter localCounter;
    private final PolicyCache policyCache;
    private final CircuitBreaker circuitBreaker;
    
    public boolean tryAcquire(String resource, int permits) {
        // 检查熔断器状态
        if (circuitBreaker.isOpen()) {
            log.warn("Circuit breaker is open, using local fallback");
            return tryAcquireLocal(resource, permits);
        }
        
        try {
            // 尝试使用分布式计数器
            boolean result = distributedCounter.tryAcquire(resource, permits);
            circuitBreaker.recordSuccess();
            return result;
        } catch (Exception e) {
            log.error("Failed to acquire from distributed counter, falling back to local", e);
            circuitBreaker.recordFailure();
            
            // 降级到本地限流
            return tryAcquireLocal(resource, permits);
        }
    }
    
    private boolean tryAcquireLocal(String resource, int permits) {
        try {
            // 获取本地缓存的规则
            RateLimitRule rule = policyCache.getRule(resource);
            if (rule == null) {
                // 没有规则，默认允许
                return true;
            }
            
            // 使用本地计数器执行限流
            return localCounter.tryAcquire(resource, permits, rule);
        } catch (Exception e) {
            log.error("Failed to acquire from local counter", e);
            // 最后的降级策略：允许请求通过（fail-open）
            return true;
        }
    }
}
```

### 3. 本地计数器实现

本地计数器用于在分布式存储不可用时提供基本的限流功能。

```java
// 本地计数器实现
@Component
public class LocalCounter {
    
    private final Map<String, SlidingWindowCounter> counters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupScheduler;
    
    public LocalCounter() {
        // 定期清理过期的计数器
        cleanupScheduler = Executors.newScheduledThreadPool(1);
        cleanupScheduler.scheduleAtFixedRate(this::cleanupExpiredCounters, 
                                           60, 60, TimeUnit.SECONDS);
    }
    
    public boolean tryAcquire(String resource, int permits, RateLimitRule rule) {
        // 获取或创建计数器
        SlidingWindowCounter counter = counters.computeIfAbsent(
            resource, k -> new SlidingWindowCounter(rule.getLimit(), rule.getWindowSize()));
        
        // 执行限流检查
        return counter.tryAcquire(permits);
    }
    
    // 滑动窗口计数器实现
    private static class SlidingWindowCounter {
        private final int limit;
        private final long windowSize;
        private final long sliceSize;
        private final int[] counters;
        private volatile long lastUpdateTime;
        
        public SlidingWindowCounter(int limit, long windowSize) {
            this.limit = limit;
            this.windowSize = windowSize;
            this.sliceSize = windowSize / 10; // 分为10个时间片
            this.counters = new int[10];
            this.lastUpdateTime = System.currentTimeMillis();
        }
        
        public synchronized boolean tryAcquire(int permits) {
            long now = System.currentTimeMillis();
            long currentSlice = now / sliceSize;
            long lastSlice = lastUpdateTime / sliceSize;
            
            // 清理过期的时间片
            if (currentSlice > lastSlice) {
                int slicesToClear = (int) Math.min(currentSlice - lastSlice, 10);
                for (int i = 0; i < slicesToClear; i++) {
                    int index = (int) ((lastSlice + 1 + i) % 10);
                    counters[index] = 0;
                }
                lastUpdateTime = now;
            }
            
            // 计算当前窗口内的总请求数
            int totalCount = 0;
            for (int i = 0; i < 10; i++) {
                totalCount += counters[i];
            }
            
            if (totalCount + permits <= limit) {
                int currentIndex = (int) (currentSlice % 10);
                counters[currentIndex] += permits;
                return true;
            }
            
            return false;
        }
    }
    
    private void cleanupExpiredCounters() {
        long now = System.currentTimeMillis();
        counters.entrySet().removeIf(entry -> 
            now - entry.getValue().getLastUpdateTime() > 300000); // 5分钟未更新则清理
    }
}
```

## 存储多活架构

存储层作为限流平台的数据基础，必须具备高可用性和数据一致性。通过多活架构设计，可以确保在部分存储节点故障时仍能正常提供服务。

### 1. Redis集群架构

Redis作为分布式计数器的主要存储，采用集群架构实现高可用。

```java
// Redis集群配置
@Configuration
public class RedisClusterConfig {
    
    @Bean
    @Profile("cluster")
    public LettuceConnectionFactory redisClusterConnectionFactory() {
        // Redis集群配置
        RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration(
            Arrays.asList(
                "redis-node1:7000",
                "redis-node2:7001",
                "redis-node3:7002",
                "redis-node4:7003",
                "redis-node5:7004",
                "redis-node6:7005"
            )
        );
        
        // 设置最大重定向次数
        clusterConfig.setMaxRedirects(3);
        
        // 设置密码（如果需要）
        clusterConfig.setPassword("your-redis-password");
        
        return new LettuceConnectionFactory(clusterConfig);
    }
    
    @Bean
    public RedisTemplate<String, String> redisTemplate(
            LettuceConnectionFactory redisClusterConnectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(redisClusterConnectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new StringRedisSerializer());
        return template;
    }
}
```

### 2. 数据库主从复制

规则配置等重要数据采用数据库主从复制架构。

```java
// 数据库主从配置
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.master")
    public DataSource masterDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @ConfigurationProperties("spring.datasource.slave")
    public DataSource slaveDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    public DataSource routingDataSource() {
        Map<Object, Object> dataSourceMap = new HashMap<>();
        dataSourceMap.put("master", masterDataSource());
        dataSourceMap.put("slave", slaveDataSource());
        
        DynamicDataSource routingDataSource = new DynamicDataSource();
        routingDataSource.setTargetDataSources(dataSourceMap);
        routingDataSource.setDefaultTargetDataSource(masterDataSource());
        
        return routingDataSource;
    }
    
    // 动态数据源路由
    public static class DynamicDataSource extends AbstractRoutingDataSource {
        @Override
        protected Object determineCurrentLookupKey() {
            return DataSourceContextHolder.getDataSourceType();
        }
    }
}

// 数据源上下文持有者
public class DataSourceContextHolder {
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();
    
    public static void setDataSourceType(String dataSourceType) {
        contextHolder.set(dataSourceType);
    }
    
    public static String getDataSourceType() {
        return contextHolder.get();
    }
    
    public static void clearDataSourceType() {
        contextHolder.remove();
    }
}

// 数据源切换注解
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataSource {
    String value();
}

// 数据源切换切面
@Aspect
@Component
public class DataSourceAspect {
    
    @Around("@annotation(dataSource)")
    public Object around(ProceedingJoinPoint point, DataSource dataSource) throws Throwable {
        try {
            DataSourceContextHolder.setDataSourceType(dataSource.value());
            return point.proceed();
        } finally {
            DataSourceContextHolder.clearDataSourceType();
        }
    }
}
```

### 3. 存储故障检测与恢复

实现存储故障的自动检测和恢复机制。

```java
// 存储健康检查实现
@Component
public class StorageHealthChecker {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final DataSource masterDataSource;
    private final DataSource slaveDataSource;
    private final Map<String, StorageStatus> storageStatus = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    
    public StorageHealthChecker(RedisTemplate<String, String> redisTemplate,
                               DataSource masterDataSource,
                               DataSource slaveDataSource) {
        this.redisTemplate = redisTemplate;
        this.masterDataSource = masterDataSource;
        this.slaveDataSource = slaveDataSource;
        
        // 定期执行健康检查
        scheduler.scheduleAtFixedRate(this::performHealthChecks, 0, 30, TimeUnit.SECONDS);
    }
    
    public boolean isRedisHealthy() {
        StorageStatus status = storageStatus.get("redis");
        return status != null && status.isHealthy() && 
               (System.currentTimeMillis() - status.getLastCheckTime()) < 60000;
    }
    
    public boolean isDatabaseHealthy() {
        StorageStatus status = storageStatus.get("database");
        return status != null && status.isHealthy() && 
               (System.currentTimeMillis() - status.getLastCheckTime()) < 60000;
    }
    
    private void performHealthChecks() {
        // 检查Redis健康状态
        checkRedisHealth();
        
        // 检查数据库健康状态
        checkDatabaseHealth();
    }
    
    private void checkRedisHealth() {
        try {
            // 执行简单的Redis操作
            String key = "health_check:" + UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(key, "ok", Duration.ofSeconds(10));
            String value = redisTemplate.opsForValue().get(key);
            
            boolean healthy = "ok".equals(value);
            storageStatus.put("redis", 
                new StorageStatus(healthy, System.currentTimeMillis()));
            
            if (!healthy) {
                log.warn("Redis health check failed");
            }
        } catch (Exception e) {
            log.error("Redis health check failed", e);
            storageStatus.put("redis", 
                new StorageStatus(false, System.currentTimeMillis()));
        }
    }
    
    private void checkDatabaseHealth() {
        try {
            // 执行简单的数据库查询
            try (Connection conn = masterDataSource.getConnection()) {
                try (PreparedStatement stmt = conn.prepareStatement("SELECT 1")) {
                    try (ResultSet rs = stmt.executeQuery()) {
                        boolean healthy = rs.next() && rs.getInt(1) == 1;
                        storageStatus.put("database", 
                            new StorageStatus(healthy, System.currentTimeMillis()));
                        
                        if (!healthy) {
                            log.warn("Database health check failed");
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Database health check failed", e);
            storageStatus.put("database", 
                new StorageStatus(false, System.currentTimeMillis()));
        }
    }
}
```

### 4. 数据一致性保证

在多活架构下，确保数据的一致性是关键挑战。

```java
// 数据一致性保证实现
@Service
public class DataConsistencyService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final RuleRepository ruleRepository;
    private final StorageHealthChecker healthChecker;
    
    // 写操作实现
    public void writeData(String key, String value) {
        // 首先写入主存储
        if (healthChecker.isDatabaseHealthy()) {
            ruleRepository.saveOrUpdate(key, value);
        } else {
            throw new StorageUnavailableException("Database is not available");
        }
        
        // 然后写入缓存存储
        if (healthChecker.isRedisHealthy()) {
            try {
                redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(5));
            } catch (Exception e) {
                log.warn("Failed to write to Redis cache", e);
                // 缓存写入失败不影响主流程
            }
        }
    }
    
    // 读操作实现
    public String readData(String key) {
        // 首先尝试从缓存读取
        if (healthChecker.isRedisHealthy()) {
            try {
                String value = redisTemplate.opsForValue().get(key);
                if (value != null) {
                    return value;
                }
            } catch (Exception e) {
                log.warn("Failed to read from Redis cache", e);
            }
        }
        
        // 缓存不可用或未命中，从主存储读取
        if (healthChecker.isDatabaseHealthy()) {
            return ruleRepository.findById(key);
        } else {
            throw new StorageUnavailableException("No available storage for reading");
        }
    }
    
    // 数据同步实现
    @Scheduled(fixedRate = 60000) // 每分钟执行一次
    public void syncData() {
        if (!healthChecker.isDatabaseHealthy() || !healthChecker.isRedisHealthy()) {
            return;
        }
        
        try {
            // 从数据库同步数据到Redis
            List<RuleData> rules = ruleRepository.findAll();
            for (RuleData rule : rules) {
                redisTemplate.opsForValue().set(
                    rule.getKey(), rule.getValue(), Duration.ofMinutes(5));
            }
        } catch (Exception e) {
            log.error("Failed to sync data from database to Redis", e);
        }
    }
}
```

## 高可用监控与告警

完善的监控和告警机制是高可用设计的重要组成部分。

```java
// 高可用监控实现
@Component
public class HighAvailabilityMonitor {
    
    private final StorageHealthChecker storageHealthChecker;
    private final ControlPlaneLoadBalancer loadBalancer;
    private final AlertService alertService;
    private final MetricsCollector metricsCollector;
    
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    public HighAvailabilityMonitor(StorageHealthChecker storageHealthChecker,
                                  ControlPlaneLoadBalancer loadBalancer,
                                  AlertService alertService,
                                  MetricsCollector metricsCollector) {
        this.storageHealthChecker = storageHealthChecker;
        this.loadBalancer = loadBalancer;
        this.alertService = alertService;
        this.metricsCollector = metricsCollector;
        
        // 定期检查高可用状态
        scheduler.scheduleAtFixedRate(this::checkHighAvailabilityStatus, 0, 60, TimeUnit.SECONDS);
    }
    
    private void checkHighAvailabilityStatus() {
        try {
            // 检查存储健康状态
            checkStorageHealth();
            
            // 检查控制面节点状态
            checkControlPlaneNodes();
            
            // 检查数据面节点状态
            checkDataPlaneNodes();
            
            // 收集和上报指标
            collectAndReportMetrics();
        } catch (Exception e) {
            log.error("Failed to check high availability status", e);
        }
    }
    
    private void checkStorageHealth() {
        if (!storageHealthChecker.isRedisHealthy()) {
            alertService.sendAlert(AlertLevel.CRITICAL, 
                "Redis storage is unhealthy", 
                "Redis cluster is not responding properly");
        }
        
        if (!storageHealthChecker.isDatabaseHealthy()) {
            alertService.sendAlert(AlertLevel.CRITICAL, 
                "Database storage is unhealthy", 
                "Database is not responding properly");
        }
    }
    
    private void checkControlPlaneNodes() {
        List<ControlPlaneNode> nodes = loadBalancer.getAllNodes();
        long healthyNodes = nodes.stream()
            .filter(node -> node.isHealthy())
            .count();
            
        if (healthyNodes == 0) {
            alertService.sendAlert(AlertLevel.CRITICAL, 
                "No healthy control plane nodes", 
                "All control plane nodes are unhealthy");
        } else if (healthyNodes < nodes.size() / 2) {
            alertService.sendAlert(AlertLevel.WARNING, 
                "Control plane nodes degraded", 
                "More than half of control plane nodes are unhealthy");
        }
    }
    
    private void checkDataPlaneNodes() {
        // 实现数据面节点健康检查
        // ...
    }
    
    private void collectAndReportMetrics() {
        // 收集高可用相关指标
        HAMetrics metrics = HAMetrics.builder()
            .storageHealth(storageHealthChecker.isRedisHealthy() && 
                          storageHealthChecker.isDatabaseHealthy())
            .controlPlaneNodes(loadBalancer.getHealthyNodeCount())
            .dataPlaneNodes(getHealthyDataPlaneNodeCount())
            .timestamp(System.currentTimeMillis())
            .build();
            
        metricsCollector.reportHAMetrics(metrics);
    }
}
```

## 总结

分布式限流平台的高可用设计需要从多个维度进行考虑和实现：

1. **控制面无状态设计**通过状态外置、负载均衡和配置中心集成实现高可用
2. **数据面本地降级机制**通过熔断器、本地缓存和本地计数器实现故障降级
3. **存储多活架构**通过Redis集群、数据库主从复制和数据一致性保证实现存储高可用

关键设计要点包括：

- **故障隔离**：确保单个组件故障不影响整体服务
- **自动恢复**：实现故障的自动检测和恢复机制
- **降级策略**：在关键组件故障时提供备用方案
- **监控告警**：实时监控系统状态并及时告警

通过这些高可用设计，分布式限流平台能够在面对各种故障场景时保持稳定运行，确保业务的连续性。

在后续章节中，我们将深入探讨平台的扩展性设计，包括如何支持多语言SDK和多环境部署。