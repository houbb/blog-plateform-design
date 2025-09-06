---
title: 基于Redis的分布式计数器：Lua脚本保证原子性、集群模式下的同步问题
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed]
published: true
---

在分布式限流系统中，计数器是实现各种限流算法的核心组件。由于需要在多个节点间共享计数状态，分布式计数器的实现面临着原子性、一致性、性能等多重挑战。Redis作为一个高性能的内存数据库，凭借其原子操作和Lua脚本支持，成为实现分布式计数器的理想选择。本文将深入探讨基于Redis的分布式计数器实现，包括Lua脚本保证原子性的方法以及在集群模式下可能遇到的同步问题。

## Redis分布式计数器设计原理

### 1. 原子性保证

在分布式环境中，计数器操作必须保证原子性，否则可能导致计数不准确。Redis通过单线程模型和原子命令保证了单个命令的原子性，但对于复杂的计数逻辑，需要使用Lua脚本来保证多个操作的原子性。

#### 基本计数操作
```java
// 基本的Redis计数操作
@Component
public class BasicRedisCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    // 简单计数增加
    public long increment(String key) {
        return redisTemplate.opsForValue().increment(key, 1);
    }
    
    // 带过期时间的计数增加
    public long incrementWithExpire(String key, long expireSeconds) {
        Long result = redisTemplate.opsForValue().increment(key, 1);
        if (result != null && result == 1) {
            // 第一次设置时设置过期时间
            redisTemplate.expire(key, expireSeconds, TimeUnit.SECONDS);
        }
        return result != null ? result : 0;
    }
    
    // 批量计数增加
    public List<Long> incrementBatch(List<String> keys) {
        List<Long> results = new ArrayList<>();
        for (String key : keys) {
            results.add(increment(key));
        }
        return results;
    }
}
```

#### Lua脚本保证原子性
```java
// 使用Lua脚本保证复杂操作的原子性
@Component
public class AtomicRedisCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    // 带条件的原子计数操作
    public boolean incrementIfLessThan(String key, long increment, long limit, long expireSeconds) {
        String script = 
            "local current = redis.call('GET', KEYS[1]) or '0'\n" +
            "local new_value = tonumber(current) + tonumber(ARGV[1])\n" +
            "if new_value <= tonumber(ARGV[2]) then\n" +
            "  redis.call('SET', KEYS[1], new_value)\n" +
            "  redis.call('EXPIRE', KEYS[1], ARGV[3])\n" +
            "  return 1\n" +
            "else\n" +
            "  return 0\n" +
            "end";
        
        List<String> keys = Collections.singletonList(key);
        List<String> args = Arrays.asList(
            String.valueOf(increment),
            String.valueOf(limit),
            String.valueOf(expireSeconds)
        );
        
        Object result = redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class), keys, args.toArray());
        
        return "1".equals(result.toString());
    }
    
    // 滑动窗口计数器原子操作
    public boolean slidingWindowIncrement(String key, long increment, long limit, 
                                        long windowSizeMillis) {
        String script = 
            "redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])\n" +
            "local current_count = redis.call('ZCARD', KEYS[1])\n" +
            "if current_count + tonumber(ARGV[2]) <= tonumber(ARGV[3]) then\n" +
            "  local score = tonumber(ARGV[4])\n" +
            "  for i=1,tonumber(ARGV[2]) do\n" +
            "    redis.call('ZADD', KEYS[1], score, score..':'..i)\n" +
            "  end\n" +
            "  redis.call('EXPIRE', KEYS[1], ARGV[5])\n" +
            "  return 1\n" +
            "else\n" +
            "  return 0\n" +
            "end";
        
        long now = System.currentTimeMillis();
        long windowStart = now - windowSizeMillis;
        long expireSeconds = windowSizeMillis / 1000;
        
        List<String> keys = Collections.singletonList(key);
        List<String> args = Arrays.asList(
            String.valueOf(windowStart),
            String.valueOf(increment),
            String.valueOf(limit),
            String.valueOf(now),
            String.valueOf(expireSeconds)
        );
        
        Object result = redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class), keys, args.toArray());
        
        return "1".equals(result.toString());
    }
}
```

### 2. 数据结构选择

不同的限流算法需要不同的Redis数据结构来实现。

#### 字符串类型计数器
```java
// 基于字符串的固定窗口计数器
public class FixedWindowCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    public boolean tryAcquire(String resource, int permits, int limit, long windowSizeSeconds) {
        String key = "rate_limit:fixed_window:" + resource;
        String timeKey = key + ":time";
        
        String script = 
            "local current_time = tonumber(ARGV[1])\n" +
            "local window_size = tonumber(ARGV[2])\n" +
            "local limit = tonumber(ARGV[3])\n" +
            "local permits = tonumber(ARGV[4])\n" +
            "local window_start = current_time - window_size\n" +
            
            "-- 获取上次窗口开始时间\n" +
            "local last_window_start = redis.call('GET', KEYS[2]) or '0'\n" +
            
            "-- 如果是新窗口，重置计数\n" +
            "if tonumber(last_window_start) < window_start then\n" +
            "  redis.call('SET', KEYS[1], permits)\n" +
            "  redis.call('SET', KEYS[2], current_time)\n" +
            "  redis.call('EXPIRE', KEYS[1], window_size)\n" +
            "  redis.call('EXPIRE', KEYS[2], window_size)\n" +
            "  return 1\n" +
            "else\n" +
            "  -- 在当前窗口内增加计数\n" +
            "  local current_count = redis.call('GET', KEYS[1]) or '0'\n" +
            "  local new_count = tonumber(current_count) + permits\n" +
            "  if new_count <= limit then\n" +
            "    redis.call('SET', KEYS[1], new_count)\n" +
            "    return 1\n" +
            "  else\n" +
            "    return 0\n" +
            "  end\n" +
            "end";
        
        List<String> keys = Arrays.asList(key, timeKey);
        List<String> args = Arrays.asList(
            String.valueOf(System.currentTimeMillis() / 1000),
            String.valueOf(windowSizeSeconds),
            String.valueOf(limit),
            String.valueOf(permits)
        );
        
        Object result = redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class), keys, args.toArray());
        
        return "1".equals(result.toString());
    }
}
```

#### 有序集合类型计数器
```java
// 基于有序集合的滑动窗口计数器
public class SlidingWindowCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    public boolean tryAcquire(String resource, int permits, int limit, long windowSizeMillis) {
        String key = "rate_limit:sliding_window:" + resource;
        
        String script = 
            "-- 清除过期的元素\n" +
            "local window_start = tonumber(ARGV[1])\n" +
            "redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, window_start)\n" +
            
            "-- 获取当前窗口内的元素数量\n" +
            "local current_count = redis.call('ZCARD', KEYS[1])\n" +
            
            "-- 检查是否超过限制\n" +
            "local permits = tonumber(ARGV[2])\n" +
            "local limit = tonumber(ARGV[3])\n" +
            
            "if current_count + permits <= limit then\n" +
            "  -- 添加新的元素\n" +
            "  local current_time = tonumber(ARGV[4])\n" +
            "  for i=1,permits do\n" +
            "    redis.call('ZADD', KEYS[1], current_time, current_time..':'..i)\n" +
            "  end\n" +
            
            "  -- 设置过期时间\n" +
            "  local expire_time = math.ceil(tonumber(ARGV[5]))\n" +
            "  redis.call('EXPIRE', KEYS[1], expire_time)\n" +
            
            "  return 1\n" +
            "else\n" +
            "  return 0\n" +
            "end";
        
        long now = System.currentTimeMillis();
        long windowStart = now - windowSizeMillis;
        long expireSeconds = (windowSizeMillis / 1000) + 1;
        
        List<String> keys = Collections.singletonList(key);
        List<String> args = Arrays.asList(
            String.valueOf(windowStart),
            String.valueOf(permits),
            String.valueOf(limit),
            String.valueOf(now),
            String.valueOf(expireSeconds)
        );
        
        Object result = redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class), keys, args.toArray());
        
        return "1".equals(result.toString());
    }
}
```

## Lua脚本实现详解

### 1. 脚本设计原则

#### 原子性保证
Lua脚本在Redis中以原子方式执行，确保脚本内的所有操作要么全部执行，要么全部不执行。

#### 性能优化
脚本应该尽可能高效，避免不必要的操作和循环。

#### 错误处理
脚本需要正确处理各种异常情况，避免因错误导致的数据不一致。

### 2. 令牌桶算法实现

```lua
-- 令牌桶算法Lua脚本
local function token_bucket_rate_limit()
    local key = KEYS[1]
    local tokens_key = key .. ":tokens"
    local timestamp_key = key .. ":timestamp"
    
    local capacity = tonumber(ARGV[1])
    local rate = tonumber(ARGV[2])
    local requested_tokens = tonumber(ARGV[3])
    local current_timestamp = tonumber(ARGV[4])
    
    -- 获取当前令牌数和上次更新时间
    local current_tokens = redis.call('GET', tokens_key) or tostring(capacity)
    local last_timestamp = redis.call('GET', timestamp_key) or tostring(current_timestamp)
    
    -- 计算需要补充的令牌数
    local time_passed = current_timestamp - tonumber(last_timestamp)
    local tokens_to_add = math.floor(time_passed * rate)
    local new_tokens = math.min(capacity, tonumber(current_tokens) + tokens_to_add)
    
    -- 检查是否有足够的令牌
    if new_tokens >= requested_tokens then
        -- 消费令牌
        local remaining_tokens = new_tokens - requested_tokens
        redis.call('SET', tokens_key, remaining_tokens)
        redis.call('SET', timestamp_key, current_timestamp)
        
        -- 设置过期时间
        local ttl = math.ceil(capacity / rate) + 10
        redis.call('EXPIRE', tokens_key, ttl)
        redis.call('EXPIRE', timestamp_key, ttl)
        
        return {1, remaining_tokens, capacity}
    else
        -- 令牌不足
        redis.call('SET', tokens_key, new_tokens)
        redis.call('SET', timestamp_key, current_timestamp)
        
        -- 设置过期时间
        local ttl = math.ceil(capacity / rate) + 10
        redis.call('EXPIRE', tokens_key, ttl)
        redis.call('EXPIRE', timestamp_key, ttl)
        
        return {0, new_tokens, capacity}
    end
end

return token_bucket_rate_limit()
```

```java
// Java调用令牌桶Lua脚本
@Component
public class TokenBucketRedisCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final DefaultRedisScript<List> tokenBucketScript;
    
    public TokenBucketRedisCounter(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.tokenBucketScript = new DefaultRedisScript<>();
        this.tokenBucketScript.setScriptSource(
            new ResourceScriptSource(new ClassPathResource("lua/token_bucket.lua")));
        this.tokenBucketScript.setResultType(List.class);
    }
    
    public TokenBucketResult tryAcquire(String resource, int permits, 
                                      int capacity, double rate) {
        String key = "rate_limit:token_bucket:" + resource;
        
        List<String> keys = Collections.singletonList(key);
        List<String> args = Arrays.asList(
            String.valueOf(capacity),
            String.valueOf(rate),
            String.valueOf(permits),
            String.valueOf(System.currentTimeMillis() / 1000.0)
        );
        
        List result = redisTemplate.execute(tokenBucketScript, keys, args.toArray());
        
        if (result != null && result.size() >= 3) {
            boolean allowed = "1".equals(result.get(0).toString());
            long remaining = Long.parseLong(result.get(1).toString());
            long limit = Long.parseLong(result.get(2).toString());
            
            return new TokenBucketResult(allowed, remaining, limit);
        }
        
        // 默认允许通过（fail-open）
        return new TokenBucketResult(true, capacity, capacity);
    }
}
```

### 3. 漏桶算法实现

```lua
-- 漏桶算法Lua脚本
local function leaky_bucket_rate_limit()
    local key = KEYS[1]
    local queue_key = key .. ":queue"
    local timestamp_key = key .. ":timestamp"
    
    local capacity = tonumber(ARGV[1])
    local rate = tonumber(ARGV[2])
    local requested_permits = tonumber(ARGV[3])
    local current_timestamp = tonumber(ARGV[4])
    
    -- 清除已处理的请求（模拟漏水）
    local last_timestamp = redis.call('GET', timestamp_key) or tostring(current_timestamp)
    local time_passed = current_timestamp - tonumber(last_timestamp)
    local leaked_permits = math.floor(time_passed * rate)
    
    -- 获取当前队列长度
    local current_queue_size = redis.call('LLEN', queue_key)
    
    -- 移除已处理的请求
    for i = 1, math.min(leaked_permits, current_queue_size) do
        redis.call('LPOP', queue_key)
    end
    
    -- 更新时间戳
    redis.call('SET', timestamp_key, current_timestamp)
    
    -- 检查是否有足够的空间
    local new_queue_size = redis.call('LLEN', queue_key)
    if new_queue_size + requested_permits <= capacity then
        -- 添加新请求到队列
        for i = 1, requested_permits do
            redis.call('RPUSH', queue_key, current_timestamp .. ":" .. i)
        end
        
        -- 设置过期时间
        local ttl = math.ceil(capacity / rate) + 10
        redis.call('EXPIRE', queue_key, ttl)
        redis.call('EXPIRE', timestamp_key, ttl)
        
        return {1, new_queue_size + requested_permits, capacity}
    else
        -- 队列已满
        local ttl = math.ceil(capacity / rate) + 10
        redis.call('EXPIRE', queue_key, ttl)
        redis.call('EXPIRE', timestamp_key, ttl)
        
        return {0, new_queue_size, capacity}
    end
end

return leaky_bucket_rate_limit()
```

## 集群模式下的同步问题

### 1. 数据分片问题

在Redis集群模式下，不同的key可能被分配到不同的节点上，这可能导致数据不一致和性能问题。

#### Hash标签使用
```java
// 使用Hash标签确保相关key在同一个slot
public class ClusterAwareRedisCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    public boolean tryAcquire(String resource, int permits, int limit) {
        // 使用Hash标签确保相关key在同一个slot
        String baseKey = "{rate_limit:" + resource + "}";
        String counterKey = baseKey + ":counter";
        String timestampKey = baseKey + ":timestamp";
        
        String script = 
            "local current_time = tonumber(ARGV[1])\n" +
            "local permits = tonumber(ARGV[2])\n" +
            "local limit = tonumber(ARGV[3])\n" +
            
            "-- 获取当前计数\n" +
            "local current_count = redis.call('GET', KEYS[1]) or '0'\n" +
            "local new_count = tonumber(current_count) + permits\n" +
            
            "if new_count <= limit then\n" +
            "  redis.call('SET', KEYS[1], new_count)\n" +
            "  redis.call('SET', KEYS[2], current_time)\n" +
            "  return 1\n" +
            "else\n" +
            "  return 0\n" +
            "end";
        
        List<String> keys = Arrays.asList(counterKey, timestampKey);
        List<String> args = Arrays.asList(
            String.valueOf(System.currentTimeMillis()),
            String.valueOf(permits),
            String.valueOf(limit)
        );
        
        Object result = redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class), keys, args.toArray());
        
        return "1".equals(result.toString());
    }
}
```

### 2. 跨节点事务问题

Redis集群不支持跨节点的事务操作，这在实现复杂的限流逻辑时可能成为问题。

#### 本地化处理策略
```java
// 跨节点问题的本地化处理
@Component
public class LocalizedClusterCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ClusterTopology clusterTopology;
    
    public RateLimitResult tryAcquire(String resource, int permits, 
                                    RateLimitRule rule) {
        // 根据资源确定应该使用的节点
        String nodeId = clusterTopology.getNodeForResource(resource);
        
        // 如果是本地节点，直接处理
        if (clusterTopology.isLocalNode(nodeId)) {
            return localTryAcquire(resource, permits, rule);
        } else {
            // 如果是远程节点，通过网络调用
            return remoteTryAcquire(nodeId, resource, permits, rule);
        }
    }
    
    private RateLimitResult localTryAcquire(String resource, int permits, 
                                          RateLimitRule rule) {
        // 本地处理逻辑
        String key = "rate_limit:" + resource;
        
        // 使用Lua脚本保证原子性
        String script = buildRateLimitScript(rule);
        
        List<String> keys = Collections.singletonList(key);
        List<String> args = buildRateLimitArgs(permits, rule);
        
        Object result = redisTemplate.execute(
            new DefaultRedisScript<>(script, List.class), keys, args.toArray());
        
        return parseResult(result);
    }
    
    private RateLimitResult remoteTryAcquire(String nodeId, String resource, 
                                           int permits, RateLimitRule rule) {
        // 远程调用逻辑
        // 通过gRPC或其他协议调用远程节点
        return remoteRateLimitClient.tryAcquire(nodeId, resource, permits, rule);
    }
}
```

### 3. 一致性哈希优化

使用一致性哈希算法优化数据分布，减少跨节点访问。

```java
// 一致性哈希实现
public class ConsistentHashRedisCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ConsistentHash<String> nodeHash;
    private final Map<String, RedisTemplate<String, String>> nodeTemplates;
    
    public ConsistentHashRedisCounter(List<String> nodes) {
        // 初始化一致性哈希环
        this.nodeHash = new ConsistentHash<>(nodes);
        
        // 为每个节点创建RedisTemplate
        this.nodeTemplates = new HashMap<>();
        for (String node : nodes) {
            this.nodeTemplates.put(node, createRedisTemplate(node));
        }
    }
    
    public boolean tryAcquire(String resource, int permits, int limit) {
        // 根据资源确定应该使用的节点
        String node = nodeHash.get(resource);
        RedisTemplate<String, String> template = nodeTemplates.get(node);
        
        if (template == null) {
            // 节点不可用，降级处理
            return true; // fail-open
        }
        
        String key = "rate_limit:" + resource;
        
        String script = 
            "local current = redis.call('GET', KEYS[1]) or '0'\n" +
            "local new_value = tonumber(current) + tonumber(ARGV[1])\n" +
            "if new_value <= tonumber(ARGV[2]) then\n" +
            "  redis.call('SET', KEYS[1], new_value)\n" +
            "  redis.call('EXPIRE', KEYS[1], 60)\n" +
            "  return 1\n" +
            "else\n" +
            "  return 0\n" +
            "end";
        
        List<String> keys = Collections.singletonList(key);
        List<String> args = Arrays.asList(String.valueOf(permits), String.valueOf(limit));
        
        try {
            Object result = template.execute(
                new DefaultRedisScript<>(script, Long.class), keys, args.toArray());
            return "1".equals(result.toString());
        } catch (Exception e) {
            log.error("Failed to execute rate limit on node: {}", node, e);
            return true; // fail-open
        }
    }
    
    private RedisTemplate<String, String> createRedisTemplate(String node) {
        // 为指定节点创建RedisTemplate
        // 实现细节省略
        return new RedisTemplate<>();
    }
}
```

## 性能优化策略

### 1. 连接池优化

```java
// Redis连接池优化配置
@Configuration
public class RedisConnectionConfig {
    
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        LettucePoolingClientConfiguration clientConfig = LettucePoolingClientConfiguration
            .builder()
            .poolConfig(createOptimizedPoolConfig())
            .commandTimeout(Duration.ofSeconds(2))
            .shutdownTimeout(Duration.ofSeconds(5))
            .build();
            
        RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration(
            Arrays.asList("redis-node1:7000", "redis-node2:7001", "redis-node3:7002"));
            
        return new LettuceConnectionFactory(clusterConfig, clientConfig);
    }
    
    private GenericObjectPoolConfig createOptimizedPoolConfig() {
        GenericObjectPoolConfig poolConfig = new GenericObjectPoolConfig();
        poolConfig.setMaxTotal(200);           // 最大连接数
        poolConfig.setMaxIdle(100;            // 最大空闲连接数
        poolConfig.setMinIdle(20);             // 最小空闲连接数
        poolConfig.setMaxWaitMillis(2000);     // 最大等待时间
        poolConfig.setTestOnBorrow(true);      // 借用时测试
        poolConfig.setTestOnReturn(true);      // 归还时测试
        poolConfig.setTestWhileIdle(true);     // 空闲时测试
        poolConfig.setTimeBetweenEvictionRunsMillis(30000);  // 清理间隔
        poolConfig.setMinEvictableIdleTimeMillis(60000);     // 最小空闲时间
        return poolConfig;
    }
}
```

### 2. 批量操作优化

```java
// 批量操作优化
@Component
public class BatchRedisCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    public List<Boolean> batchTryAcquire(List<RateLimitRequest> requests) {
        // 使用Pipeline批量执行
        List<Object> results = redisTemplate.executePipelined(
            new RedisCallback<Object>() {
                @Override
                public Object doInRedis(RedisConnection connection) 
                        throws DataAccessException {
                    for (RateLimitRequest request : requests) {
                        String key = "rate_limit:" + request.getResource();
                        connection.incr(key.getBytes());
                        connection.expire(key.getBytes(), 60);
                    }
                    return null;
                }
            });
        
        // 处理结果
        List<Boolean> booleanResults = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            // 根据实际业务逻辑判断是否允许
            booleanResults.add(true);
        }
        
        return booleanResults;
    }
}
```

## 监控与告警

### 1. 性能指标监控

```java
// Redis计数器性能监控
@Component
public class RedisCounterMetrics {
    
    private final MeterRegistry meterRegistry;
    private final Timer counterTimer;
    private final Counter errorCounter;
    private final Gauge connectionGauge;
    
    public RedisCounterMetrics(MeterRegistry meterRegistry, 
                              RedisConnectionFactory connectionFactory) {
        this.meterRegistry = meterRegistry;
        this.counterTimer = Timer.builder("redis.counter.operation")
            .description("Redis counter operation duration")
            .register(meterRegistry);
            
        this.errorCounter = Counter.builder("redis.counter.errors")
            .description("Redis counter operation errors")
            .register(meterRegistry);
            
        this.connectionGauge = Gauge.builder("redis.connections.active")
            .description("Active Redis connections")
            .register(meterRegistry, connectionFactory, this::getActiveConnections);
    }
    
    public <T> T recordOperation(Supplier<T> operation) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            T result = operation.get();
            sample.stop(counterTimer);
            return result;
        } catch (Exception e) {
            sample.stop(counterTimer.tag("error", "true"));
            errorCounter.increment();
            throw e;
        }
    }
    
    private double getActiveConnections(RedisConnectionFactory connectionFactory) {
        if (connectionFactory instanceof LettuceConnectionFactory) {
            LettuceConnectionFactory lettuceFactory = (LettuceConnectionFactory) connectionFactory;
            // 获取活跃连接数的逻辑
            return 0.0;
        }
        return 0.0;
    }
}
```

### 2. 告警机制

```java
// Redis计数器告警机制
@Component
public class RedisCounterAlerts {
    
    private final AlertService alertService;
    private final RedisCounterMetrics metrics;
    private final ScheduledExecutorService scheduler;
    
    public RedisCounterAlerts(AlertService alertService, RedisCounterMetrics metrics) {
        this.alertService = alertService;
        this.metrics = metrics;
        this.scheduler = Executors.newScheduledThreadPool(1);
        
        // 定期检查并发送告警
        scheduler.scheduleAtFixedRate(this::checkAndAlert, 0, 30, TimeUnit.SECONDS);
    }
    
    private void checkAndAlert() {
        try {
            // 检查错误率
            checkErrorRate();
            
            // 检查响应时间
            checkResponseTime();
            
            // 检查连接数
            checkConnectionCount();
        } catch (Exception e) {
            log.error("Failed to check Redis counter alerts", e);
        }
    }
    
    private void checkErrorRate() {
        // 实现错误率检查逻辑
    }
    
    private void checkResponseTime() {
        // 实现响应时间检查逻辑
    }
    
    private void checkConnectionCount() {
        // 实现连接数检查逻辑
    }
}
```

## 最佳实践

### 1. 故障处理

#### 熔断机制
```java
// Redis计数器熔断机制
public class CircuitBreakerRedisCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final CircuitBreaker circuitBreaker;
    
    public CircuitBreakerRedisCounter(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.circuitBreaker = CircuitBreaker.ofDefaults("redis-counter");
    }
    
    public boolean tryAcquire(String resource, int permits, int limit) {
        return circuitBreaker.executeSupplier(() -> {
            try {
                return doTryAcquire(resource, permits, limit);
            } catch (Exception e) {
                // 记录失败，触发熔断
                throw new RedisCounterException("Failed to acquire from Redis", e);
            }
        });
    }
    
    private boolean doTryAcquire(String resource, int permits, int limit) {
        // 实际的限流逻辑
        return true;
    }
}
```

#### 降级策略
```java
// Redis计数器降级策略
@Component
public class FallbackRedisCounter {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final LocalCounter localCounter;
    
    public boolean tryAcquire(String resource, int permits, int limit) {
        try {
            return doTryAcquire(resource, permits, limit);
        } catch (Exception e) {
            log.warn("Failed to acquire from Redis, falling back to local counter", e);
            // 降级到本地计数器
            return localCounter.tryAcquire(resource, permits, limit);
        }
    }
    
    private boolean doTryAcquire(String resource, int permits, int limit) {
        // Redis计数器实现
        return true;
    }
}
```

### 2. 配置管理

```yaml
# Redis计数器配置
redis:
  counter:
    # 连接池配置
    pool:
      max-total: 200
      max-idle: 100
      min-idle: 20
      max-wait-millis: 2000
    
    # 超时配置
    timeout:
      connect: 2000ms
      command: 5000ms
      shutdown: 5000ms
    
    # 重试配置
    retry:
      max-attempts: 3
      backoff-multiplier: 2.0
      initial-delay: 100ms
    
    # 监控配置
    metrics:
      enabled: true
      sample-rate: 0.1  # 10%采样率
```

## 总结

基于Redis的分布式计数器是实现高性能分布式限流系统的关键组件。通过合理使用Lua脚本保证原子性、优化数据结构选择、处理集群模式下的同步问题，可以构建一个稳定、高效的分布式计数器系统。

关键要点包括：

1. **原子性保证**：使用Lua脚本确保复杂操作的原子性
2. **数据结构选择**：根据限流算法选择合适的数据结构
3. **集群优化**：使用Hash标签和一致性哈希优化集群性能
4. **性能优化**：通过连接池、批量操作等方式提升性能
5. **监控告警**：建立完善的监控告警体系
6. **容错机制**：实现熔断和降级策略确保系统稳定性

在实际应用中，需要根据具体的业务场景和性能要求，选择合适的实现方案和优化策略，以达到最佳的限流效果。

在后续章节中，我们将深入探讨本地缓存与分布式存储的同步机制。