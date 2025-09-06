---
title: 限流算法深度剖析：固定窗口计数器、滑动窗口计数器、漏桶算法、令牌桶算法、自适应算法
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed]
published: true
---

在分布式限流系统中，选择合适的限流算法是实现有效流量控制的关键。不同的算法有各自的优缺点和适用场景。本文将深入剖析五种主流的限流算法：固定窗口计数器、滑动窗口计数器、漏桶算法、令牌桶算法和自适应算法，帮助读者理解其原理、实现方式和应用场景。

## 1. 固定窗口计数器（Fixed Window Counter）

### 算法原理

固定窗口计数器是最简单的限流算法之一。它将时间划分为固定大小的时间窗口（如1秒），在每个时间窗口内维护一个计数器，记录请求数量。当请求数量超过预设阈值时，拒绝后续请求，直到进入下一个时间窗口。

### 实现方式

```java
public class FixedWindowCounter {
    private final int limit;
    private final long windowSizeInMillis;
    private volatile long currentWindowStart;
    private volatile int count;

    public FixedWindowCounter(int limit, long windowSizeInMillis) {
        this.limit = limit;
        this.windowSizeInMillis = windowSizeInMillis;
        this.currentWindowStart = System.currentTimeMillis();
        this.count = 0;
    }

    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long windowStart = now - (now % windowSizeInMillis);

        if (windowStart > currentWindowStart) {
            // 进入新的时间窗口
            currentWindowStart = windowStart;
            count = 0;
        }

        if (count < limit) {
            count++;
            return true;
        }

        return false;
    }
}
```

### 优点

1. **实现简单**：算法逻辑清晰，易于理解和实现
2. **内存占用少**：只需要维护一个计数器和时间戳
3. **性能高**：计数操作的时间复杂度为O(1)

### 缺点

1. **临界问题突出**：在时间窗口切换时可能出现突发流量
2. **精度较低**：无法精确控制请求速率

### 适用场景

- 对限流精度要求不高的场景
- 简单的API访问频率控制
- 资源使用量统计

## 2. 滑动窗口计数器（Sliding Window Counter）

### 算法原理

滑动窗口计数器是对固定窗口计数器的改进，通过将一个时间窗口划分为多个小的时间片，实现更精确的流量控制。它只统计最近一个完整时间窗口内的请求数量，避免了固定窗口计数器的临界问题。

### 实现方式

```java
public class SlidingWindowCounter {
    private final int limit;
    private final long windowSizeInMillis;
    private final int slices;
    private final long sliceSizeInMillis;
    private final int[] counters;
    private volatile long lastSliceTime;

    public SlidingWindowCounter(int limit, long windowSizeInMillis, int slices) {
        this.limit = limit;
        this.windowSizeInMillis = windowSizeInMillis;
        this.slices = slices;
        this.sliceSizeInMillis = windowSizeInMillis / slices;
        this.counters = new int[slices];
        this.lastSliceTime = System.currentTimeMillis();
    }

    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long currentSlice = now / sliceSizeInMillis;
        long lastSlice = lastSliceTime / sliceSizeInMillis;

        // 清除过期的时间片计数
        if (currentSlice > lastSlice) {
            int slicesToClear = (int) Math.min(currentSlice - lastSlice, slices);
            for (int i = 0; i < slicesToClear; i++) {
                int index = (int) ((lastSlice + 1 + i) % slices);
                counters[index] = 0;
            }
            lastSliceTime = now;
        }

        // 计算当前窗口内的总请求数
        int totalCount = 0;
        for (int i = 0; i < slices; i++) {
            totalCount += counters[i];
        }

        if (totalCount < limit) {
            int currentIndex = (int) (currentSlice % slices);
            counters[currentIndex]++;
            return true;
        }

        return false;
    }
}
```

### 优点

1. **精度更高**：能够更精确地控制请求速率
2. **避免临界问题**：解决了固定窗口计数器的突发流量问题
3. **实现相对简单**：比滑动窗口日志算法简单

### 缺点

1. **内存占用增加**：需要维护多个时间片的计数器
2. **计算复杂度增加**：每次请求都需要计算窗口内的总请求数

### 适用场景

- 对限流精度有一定要求的场景
- API访问频率控制
- 需要避免突发流量的系统

## 3. 漏桶算法（Leaky Bucket）

### 算法原理

漏桶算法将请求比作水，将处理能力比作漏桶的漏洞。请求以任意速率进入漏桶，但漏桶以恒定速率处理请求。当漏桶满时，新进入的请求被拒绝。

### 实现方式

```java
public class LeakyBucket {
    private final int capacity;
    private final int leakRate; // 每秒漏水数量
    private volatile int water; // 当前水量
    private volatile long lastLeakTime; // 上次漏水时间

    public LeakyBucket(int capacity, int leakRate) {
        this.capacity = capacity;
        this.leakRate = leakRate;
        this.water = 0;
        this.lastLeakTime = System.currentTimeMillis();
    }

    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        // 先漏水
        long elapsedTime = now - lastLeakTime;
        int leakedWater = (int) (elapsedTime * leakRate / 1000);
        water = Math.max(0, water - leakedWater);
        lastLeakTime = now;

        // 尝试加水
        if (water < capacity) {
            water++;
            return true;
        }

        return false;
    }
}
```

### 优点

1. **平滑流量**：能够平滑突发流量，保证恒定的输出速率
2. **实现简单**：算法逻辑清晰
3. **适用于带宽控制**：特别适合控制网络带宽

### 缺点

1. **无法应对突发流量**：即使系统有空闲资源，也无法处理突发请求
2. **可能浪费资源**：在低流量时，处理能力可能未被充分利用

### 适用场景

- 需要平滑流量的场景
- 网络带宽控制
- 需要恒定处理速率的系统

## 4. 令牌桶算法（Token Bucket）

### 算法原理

令牌桶算法与漏桶算法相反，系统以恒定速率向桶中添加令牌，请求需要获取令牌才能被处理。当桶中没有令牌时，请求被拒绝或等待。

### 实现方式

```java
public class TokenBucket {
    private final int capacity;
    private final int refillRate; // 每秒添加令牌数量
    private volatile int tokens; // 当前令牌数量
    private volatile long lastRefillTime; // 上次添加令牌时间

    public TokenBucket(int capacity, int refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.tokens = capacity;
        this.lastRefillTime = System.currentTimeMillis();
    }

    public synchronized boolean tryAcquire(int numTokens) {
        long now = System.currentTimeMillis();
        // 添加令牌
        long elapsedTime = now - lastRefillTime;
        int newTokens = (int) (elapsedTime * refillRate / 1000);
        tokens = Math.min(capacity, tokens + newTokens);
        lastRefillTime = now;

        // 尝试获取令牌
        if (tokens >= numTokens) {
            tokens -= numTokens;
            return true;
        }

        return false;
    }

    public boolean tryAcquire() {
        return tryAcquire(1);
    }
}
```

### 优点

1. **允许突发流量**：桶中有足够令牌时，可以处理突发请求
2. **资源利用率高**：在低流量时积累令牌，提高资源利用率
3. **灵活性好**：可以控制请求的处理速率

### 缺点

1. **实现相对复杂**：需要维护令牌数量和添加时间
2. **可能积累过多令牌**：在长时间低流量后，可能积累大量令牌

### 适用场景

- 需要允许突发流量的场景
- API访问频率控制
- 需要灵活控制处理速率的系统

## 5. 自适应算法（Adaptive Algorithm）

### 算法原理

自适应算法根据系统的实时状态动态调整限流阈值。它通过监控系统的关键指标（如CPU使用率、内存使用率、响应时间等），自动调整限流策略，实现智能化的流量控制。

### 实现方式

```java
public class AdaptiveLimiter {
    private final int baseLimit;
    private final SystemMetricsCollector metricsCollector;
    private volatile int currentLimit;

    public AdaptiveLimiter(int baseLimit, SystemMetricsCollector metricsCollector) {
        this.baseLimit = baseLimit;
        this.metricsCollector = metricsCollector;
        this.currentLimit = baseLimit;
    }

    public boolean tryAcquire() {
        // 收集系统指标
        SystemMetrics metrics = metricsCollector.getMetrics();
        
        // 根据指标调整限流阈值
        adjustLimit(metrics);
        
        // 使用调整后的阈值进行限流
        // 这里可以结合其他算法，如令牌桶
        return internalTryAcquire();
    }

    private void adjustLimit(SystemMetrics metrics) {
        // 根据CPU使用率调整
        if (metrics.getCpuUsage() > 80) {
            currentLimit = (int) (baseLimit * 0.8); // 高负载时降低阈值
        } else if (metrics.getCpuUsage() < 30) {
            currentLimit = (int) (baseLimit * 1.2); // 低负载时提高阈值
        } else {
            currentLimit = baseLimit;
        }

        // 根据响应时间调整
        if (metrics.getAverageResponseTime() > 1000) {
            currentLimit = Math.min(currentLimit, baseLimit / 2);
        }
    }

    private boolean internalTryAcquire() {
        // 实际的限流逻辑，可以使用令牌桶等算法
        // 这里简化处理
        return true;
    }
}
```

### 优点

1. **智能化**：能够根据系统状态自动调整限流策略
2. **适应性强**：能够适应不同的负载情况
3. **资源利用率高**：在系统空闲时提高阈值，充分利用资源

### 缺点

1. **实现复杂**：需要监控系统状态并实现调整逻辑
2. **可能存在滞后**：系统状态变化与限流策略调整之间可能存在时间差
3. **需要丰富的监控指标**：需要收集和分析多种系统指标

### 适用场景

- 对系统稳定性要求极高的场景
- 负载变化较大的系统
- 需要智能化流量控制的平台

## 算法对比与选择建议

| 算法 | 精度 | 处理突发流量 | 实现复杂度 | 适用场景 |
|------|------|--------------|------------|----------|
| 固定窗口计数器 | 低 | 差 | 简单 | 简单的频率控制 |
| 滑动窗口计数器 | 中 | 中 | 中等 | 需要较高精度的控制 |
| 漏桶算法 | 高 | 差 | 中等 | 需要平滑流量 |
| 令牌桶算法 | 高 | 好 | 中等 | 允许突发流量 |
| 自适应算法 | 高 | 好 | 复杂 | 智能化流量控制 |

## 总结

不同的限流算法有各自的优缺点和适用场景。在实际应用中，我们需要根据具体的业务需求、系统特点和性能要求来选择合适的算法：

1. **简单场景**：可以选择固定窗口计数器
2. **需要较高精度**：可以选择滑动窗口计数器
3. **需要平滑流量**：可以选择漏桶算法
4. **允许突发流量**：可以选择令牌桶算法
5. **需要智能化控制**：可以选择自适应算法

在后续章节中，我们将深入探讨这些算法在分布式环境下的实现细节和优化策略，帮助读者构建一个高效、稳定的分布式限流系统。