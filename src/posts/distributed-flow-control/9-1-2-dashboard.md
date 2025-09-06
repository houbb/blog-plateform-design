---
title: 分布式限流实时仪表盘：全局流量态势与限流热点图可视化
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed, dashboard]
published: true
---

在分布式限流平台的运维过程中，实时仪表盘是运维人员了解系统状态、快速响应问题的重要工具。一个设计良好的仪表盘不仅能够直观地展示关键指标，还能帮助运维人员发现潜在问题、评估限流策略的有效性。本文将深入探讨如何构建一个功能强大、信息丰富的分布式限流实时仪表盘，包括全局流量态势展示、限流热点图绘制以及规则效果可视化等核心功能。

## 实时仪表盘的核心价值

### 1. 信息集中化展示

实时仪表盘将分散在各个监控系统中的关键信息集中展示，大大提升了运维效率。

```java
// 仪表盘数据聚合服务
@Service
public class DashboardAggregationService {
    
    private final MeterRegistry meterRegistry;
    private final RedisTemplate<String, String> redisTemplate;
    private final RuleRepository ruleRepository;
    private final ScheduledExecutorService scheduler;
    
    public DashboardAggregationService(MeterRegistry meterRegistry,
                                     RedisTemplate<String, String> redisTemplate,
                                     RuleRepository ruleRepository) {
        this.meterRegistry = meterRegistry;
        this.redisTemplate = redisTemplate;
        this.ruleRepository = ruleRepository;
        this.scheduler = Executors.newScheduledThreadPool(2);
        
        // 启动数据聚合任务
        scheduler.scheduleAtFixedRate(this::aggregateDashboardData, 0, 5, TimeUnit.SECONDS);
    }
    
    /**
     * 聚合仪表盘数据
     */
    private void aggregateDashboardData() {
        try {
            // 聚合全局流量数据
            aggregateGlobalTrafficData();
            
            // 聚合限流热点数据
            aggregateHotspotData();
            
            // 聚合规则效果数据
            aggregateRuleEffectData();
            
            // 聚合系统健康数据
            aggregateSystemHealthData();
        } catch (Exception e) {
            log.error("Failed to aggregate dashboard data", e);
        }
    }
    
    private void aggregateGlobalTrafficData() {
        // 获取全局流量统计
        GlobalTrafficStats stats = collectGlobalTrafficStats();
        
        // 将数据存储到Redis中供仪表盘查询
        String key = "dashboard:global_traffic";
        String jsonData = JsonUtils.toJson(stats);
        redisTemplate.opsForValue().set(key, jsonData, 30, TimeUnit.SECONDS);
    }
    
    private void aggregateHotspotData() {
        // 获取限流热点数据
        HotspotData hotspotData = collectHotspotData();
        
        // 将数据存储到Redis中供仪表盘查询
        String key = "dashboard:hotspots";
        String jsonData = JsonUtils.toJson(hotspotData);
        redisTemplate.opsForValue().set(key, jsonData, 30, TimeUnit.SECONDS);
    }
    
    private void aggregateRuleEffectData() {
        // 获取规则效果数据
        RuleEffectData ruleEffectData = collectRuleEffectData();
        
        // 将数据存储到Redis中供仪表盘查询
        String key = "dashboard:rule_effects";
        String jsonData = JsonUtils.toJson(ruleEffectData);
        redisTemplate.opsForValue().set(key, jsonData, 30, TimeUnit.SECONDS);
    }
    
    private void aggregateSystemHealthData() {
        // 获取系统健康数据
        SystemHealthData healthData = collectSystemHealthData();
        
        // 将数据存储到Redis中供仪表盘查询
        String key = "dashboard:system_health";
        String jsonData = JsonUtils.toJson(healthData);
        redisTemplate.opsForValue().set(key, jsonData, 30, TimeUnit.SECONDS);
    }
    
    private GlobalTrafficStats collectGlobalTrafficStats() {
        GlobalTrafficStats stats = new GlobalTrafficStats();
        
        // 从监控系统收集数据
        stats.setTotalRequests(getTotalRequests());
        stats.setBlockedRequests(getBlockedRequests());
        stats.setPassRequests(getPassRequests());
        stats.setAvgResponseTime(getAvgResponseTime());
        stats.setErrorRate(getErrorRate());
        stats.setTimestamp(System.currentTimeMillis());
        
        return stats;
    }
    
    private HotspotData collectHotspotData() {
        HotspotData hotspotData = new HotspotData();
        
        // 获取热点资源
        List<HotResource> hotResources = getTopHotResources(20);
        hotspotData.setHotResources(hotResources);
        
        // 获取热点服务
        List<HotService> hotServices = getTopHotServices(10);
        hotspotData.setHotServices(hotServices);
        
        hotspotData.setTimestamp(System.currentTimeMillis());
        
        return hotspotData;
    }
    
    private RuleEffectData collectRuleEffectData() {
        RuleEffectData ruleEffectData = new RuleEffectData();
        
        // 获取所有规则
        List<RateLimitRule> rules = ruleRepository.findAll();
        
        List<RuleEffect> ruleEffects = new ArrayList<>();
        for (RateLimitRule rule : rules) {
            RuleEffect effect = new RuleEffect();
            effect.setRuleId(rule.getRuleId());
            effect.setRuleName(rule.getRuleName());
            effect.setResource(rule.getResource());
            effect.setEnabled(rule.isEnabled());
            
            // 获取规则执行数据
            RuleExecutionStats stats = getRuleExecutionStats(rule.getRuleId());
            effect.setStats(stats);
            
            ruleEffects.add(effect);
        }
        
        ruleEffectData.setRuleEffects(ruleEffects);
        ruleEffectData.setTimestamp(System.currentTimeMillis());
        
        return ruleEffectData;
    }
    
    private SystemHealthData collectSystemHealthData() {
        SystemHealthData healthData = new SystemHealthData();
        
        // 获取系统健康指标
        healthData.setCpuUsage(getCpuUsage());
        healthData.setMemoryUsage(getMemoryUsage());
        healthData.setRedisConnectionUsage(getRedisConnectionUsage());
        healthData.setActiveRules(getActiveRuleCount());
        healthData.setTotalRules(getTotalRuleCount());
        healthData.setTimestamp(System.currentTimeMillis());
        
        return healthData;
    }
    
    // 以下为辅助方法，具体实现省略
    private long getTotalRequests() { return 0; }
    private long getBlockedRequests() { return 0; }
    private long getPassRequests() { return 0; }
    private double getAvgResponseTime() { return 0.0; }
    private double getErrorRate() { return 0.0; }
    private List<HotResource> getTopHotResources(int limit) { return new ArrayList<>(); }
    private List<HotService> getTopHotServices(int limit) { return new ArrayList<>(); }
    private RuleExecutionStats getRuleExecutionStats(String ruleId) { return new RuleExecutionStats(); }
    private double getCpuUsage() { return 0.0; }
    private double getMemoryUsage() { return 0.0; }
    private double getRedisConnectionUsage() { return 0.0; }
    private int getActiveRuleCount() { return 0; }
    private int getTotalRuleCount() { return 0; }
}

// 全局流量统计
@Data
public class GlobalTrafficStats {
    private long totalRequests;
    private long blockedRequests;
    private long passRequests;
    private double avgResponseTime;
    private double errorRate;
    private long timestamp;
}

// 热点数据
@Data
public class HotspotData {
    private List<HotResource> hotResources;
    private List<HotService> hotServices;
    private long timestamp;
}

// 热点资源
@Data
public class HotResource {
    private String resourceName;
    private long requestCount;
    private long blockedCount;
    private double blockRate;
    private long lastBlockedTime;
}

// 热点服务
@Data
public class HotService {
    private String serviceName;
    private long requestCount;
    private long blockedCount;
    private double blockRate;
    private long lastBlockedTime;
}

// 规则效果数据
@Data
public class RuleEffectData {
    private List<RuleEffect> ruleEffects;
    private long timestamp;
}

// 规则效果
@Data
public class RuleEffect {
    private String ruleId;
    private String ruleName;
    private String resource;
    private boolean enabled;
    private RuleExecutionStats stats;
}

// 规则执行统计
@Data
public class RuleExecutionStats {
    private long triggerCount;
    private long passCount;
    private long blockCount;
    private double avgLatency;
    private long lastTriggerTime;
}

// 系统健康数据
@Data
public class SystemHealthData {
    private double cpuUsage;
    private double memoryUsage;
    private double redisConnectionUsage;
    private int activeRules;
    private int totalRules;
    private long timestamp;
}
```

### 2. 问题快速发现

通过可视化的方式，实时仪表盘能够帮助运维人员快速发现系统中的异常情况。

### 3. 决策支持

丰富的数据展示和趋势分析为运维决策提供了有力支持。

## 全局流量态势展示

### 1. 流量概览面板

流量概览面板提供系统整体流量的实时视图，包括总请求数、通过请求数、阻塞请求数等关键指标。

```java
// 流量概览面板控制器
@RestController
@RequestMapping("/api/dashboard/traffic")
public class TrafficOverviewController {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    @GetMapping("/overview")
    public ResponseEntity<GlobalTrafficOverview> getTrafficOverview() {
        try {
            String key = "dashboard:global_traffic";
            String jsonData = redisTemplate.opsForValue().get(key);
            
            if (jsonData != null) {
                GlobalTrafficStats stats = JsonUtils.fromJson(jsonData, GlobalTrafficStats.class);
                GlobalTrafficOverview overview = convertToOverview(stats);
                return ResponseEntity.ok(overview);
            } else {
                return ResponseEntity.ok(new GlobalTrafficOverview());
            }
        } catch (Exception e) {
            log.error("Failed to get traffic overview", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/trend")
    public ResponseEntity<List<TrafficTrendPoint>> getTrafficTrend(
            @RequestParam(defaultValue = "3600") int duration) {
        try {
            List<TrafficTrendPoint> trendPoints = getTrafficTrendData(duration);
            return ResponseEntity.ok(trendPoints);
        } catch (Exception e) {
            log.error("Failed to get traffic trend", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    private GlobalTrafficOverview convertToOverview(GlobalTrafficStats stats) {
        GlobalTrafficOverview overview = new GlobalTrafficOverview();
        
        overview.setTotalRequests(stats.getTotalRequests());
        overview.setBlockedRequests(stats.getBlockedRequests());
        overview.setPassRequests(stats.getPassRequests());
        
        // 计算阻塞率
        if (stats.getTotalRequests() > 0) {
            double blockRate = (double) stats.getBlockedRequests() / stats.getTotalRequests();
            overview.setBlockRate(blockRate);
        }
        
        // 计算通过率
        if (stats.getTotalRequests() > 0) {
            double passRate = (double) stats.getPassRequests() / stats.getTotalRequests();
            overview.setPassRate(passRate);
        }
        
        overview.setAvgResponseTime(stats.getAvgResponseTime());
        overview.setErrorRate(stats.getErrorRate());
        overview.setTimestamp(stats.getTimestamp());
        
        return overview;
    }
    
    private List<TrafficTrendPoint> getTrafficTrendData(int duration) {
        List<TrafficTrendPoint> trendPoints = new ArrayList<>();
        
        // 从Redis获取历史数据
        String key = "dashboard:traffic_trend";
        List<String> jsonDataList = redisTemplate.opsForList().range(key, 0, -1);
        
        if (jsonDataList != null) {
            long endTime = System.currentTimeMillis();
            long startTime = endTime - (duration * 1000L);
            
            for (String jsonData : jsonDataList) {
                try {
                    TrafficTrendPoint point = JsonUtils.fromJson(jsonData, TrafficTrendPoint.class);
                    // 只返回指定时间范围内的数据
                    if (point.getTimestamp() >= startTime && point.getTimestamp() <= endTime) {
                        trendPoints.add(point);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse traffic trend point", e);
                }
            }
        }
        
        return trendPoints;
    }
}

// 全局流量概览
@Data
public class GlobalTrafficOverview {
    private long totalRequests;
    private long blockedRequests;
    private long passRequests;
    private double blockRate;
    private double passRate;
    private double avgResponseTime;
    private double errorRate;
    private long timestamp;
}

// 流量趋势点
@Data
public class TrafficTrendPoint {
    private long timestamp;
    private long totalRequests;
    private long blockedRequests;
    private long passRequests;
    private double avgResponseTime;
    private double errorRate;
}
```

### 2. 服务流量分布

服务流量分布展示各服务的流量情况，帮助识别流量热点和服务负载情况。

```java
// 服务流量分布面板控制器
@RestController
@RequestMapping("/api/dashboard/services")
public class ServiceTrafficController {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    @GetMapping("/distribution")
    public ResponseEntity<List<ServiceTrafficInfo>> getServiceDistribution() {
        try {
            List<ServiceTrafficInfo> serviceTrafficInfos = getServiceTrafficData();
            return ResponseEntity.ok(serviceTrafficInfos);
        } catch (Exception e) {
            log.error("Failed to get service distribution", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/{serviceName}/details")
    public ResponseEntity<ServiceTrafficDetails> getServiceDetails(
            @PathVariable String serviceName) {
        try {
            ServiceTrafficDetails details = getServiceTrafficDetails(serviceName);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            log.error("Failed to get service details for: {}", serviceName, e);
            return ResponseEntity.status(500).build();
        }
    }
    
    private List<ServiceTrafficInfo> getServiceTrafficData() {
        List<ServiceTrafficInfo> serviceTrafficInfos = new ArrayList<>();
        
        // 从Redis获取服务流量数据
        String pattern = "dashboard:service:*";
        Set<String> keys = redisTemplate.keys(pattern);
        
        for (String key : keys) {
            try {
                String jsonData = redisTemplate.opsForValue().get(key);
                if (jsonData != null) {
                    ServiceTrafficInfo info = JsonUtils.fromJson(jsonData, ServiceTrafficInfo.class);
                    serviceTrafficInfos.add(info);
                }
            } catch (Exception e) {
                log.warn("Failed to parse service traffic info for key: {}", key, e);
            }
        }
        
        // 按请求数排序
        serviceTrafficInfos.sort((s1, s2) -> 
            Long.compare(s2.getTotalRequests(), s1.getTotalRequests()));
        
        return serviceTrafficInfos;
    }
    
    private ServiceTrafficDetails getServiceTrafficDetails(String serviceName) {
        ServiceTrafficDetails details = new ServiceTrafficDetails();
        details.setServiceName(serviceName);
        
        // 从Redis获取服务详细信息
        String key = "dashboard:service:" + serviceName;
        String jsonData = redisTemplate.opsForValue().get(key);
        
        if (jsonData != null) {
            try {
                ServiceTrafficInfo info = JsonUtils.fromJson(jsonData, ServiceTrafficInfo.class);
                details.setTotalRequests(info.getTotalRequests());
                details.setBlockedRequests(info.getBlockedRequests());
                details.setPassRequests(info.getPassRequests());
                details.setBlockRate(info.getBlockRate());
                details.setAvgResponseTime(info.getAvgResponseTime());
                details.setErrorRate(info.getErrorRate());
            } catch (Exception e) {
                log.warn("Failed to parse service traffic details for: {}", serviceName, e);
            }
        }
        
        // 获取服务相关的限流规则
        List<RuleInfo> ruleInfos = getServiceRules(serviceName);
        details.setRules(ruleInfos);
        
        details.setTimestamp(System.currentTimeMillis());
        
        return details;
    }
    
    private List<RuleInfo> getServiceRules(String serviceName) {
        List<RuleInfo> ruleInfos = new ArrayList<>();
        
        // 从Redis获取服务相关的规则信息
        String key = "dashboard:service_rules:" + serviceName;
        String jsonData = redisTemplate.opsForValue().get(key);
        
        if (jsonData != null) {
            try {
                ruleInfos = JsonUtils.fromJsonList(jsonData, RuleInfo.class);
            } catch (Exception e) {
                log.warn("Failed to parse rule infos for service: {}", serviceName, e);
            }
        }
        
        return ruleInfos;
    }
}

// 服务流量信息
@Data
public class ServiceTrafficInfo {
    private String serviceName;
    private long totalRequests;
    private long blockedRequests;
    private long passRequests;
    private double blockRate;
    private double avgResponseTime;
    private double errorRate;
    private long timestamp;
}

// 服务流量详情
@Data
public class ServiceTrafficDetails {
    private String serviceName;
    private long totalRequests;
    private long blockedRequests;
    private long passRequests;
    private double blockRate;
    private double avgResponseTime;
    private double errorRate;
    private List<RuleInfo> rules;
    private long timestamp;
}

// 规则信息
@Data
public class RuleInfo {
    private String ruleId;
    private String ruleName;
    private String resource;
    private long limit;
    private String algorithm;
    private boolean enabled;
}
```

## 限流热点图绘制

### 1. 热点资源识别

热点资源识别通过分析请求频率和阻塞情况，识别出系统中的限流热点。

```java
// 热点资源识别服务
@Service
public class HotspotDetectionService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ScheduledExecutorService scheduler;
    
    public HotspotDetectionService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.scheduler = Executors.newScheduledThreadPool(1);
        
        // 启动热点检测任务
        scheduler.scheduleAtFixedRate(this::detectHotspots, 0, 10, TimeUnit.SECONDS);
    }
    
    /**
     * 检测热点资源
     */
    private void detectHotspots() {
        try {
            // 获取热点资源
            List<HotResource> hotResources = detectHotResources();
            
            // 获取热点服务
            List<HotService> hotServices = detectHotServices();
            
            // 构建热点数据
            HotspotData hotspotData = new HotspotData();
            hotspotData.setHotResources(hotResources);
            hotspotData.setHotServices(hotServices);
            hotspotData.setTimestamp(System.currentTimeMillis());
            
            // 存储到Redis供仪表盘查询
            String key = "dashboard:hotspots";
            String jsonData = JsonUtils.toJson(hotspotData);
            redisTemplate.opsForValue().set(key, jsonData, 60, TimeUnit.SECONDS);
            
            // 更新热点趋势数据
            updateHotspotTrend(hotspotData);
        } catch (Exception e) {
            log.error("Failed to detect hotspots", e);
        }
    }
    
    private List<HotResource> detectHotResources() {
        List<HotResource> hotResources = new ArrayList<>();
        
        // 从Redis获取资源请求统计
        String pattern = "resource:stats:*";
        Set<String> keys = redisTemplate.keys(pattern);
        
        for (String key : keys) {
            try {
                String jsonData = redisTemplate.opsForValue().get(key);
                if (jsonData != null) {
                    ResourceStats stats = JsonUtils.fromJson(jsonData, ResourceStats.class);
                    
                    // 判断是否为热点资源
                    if (isHotResource(stats)) {
                        HotResource hotResource = new HotResource();
                        hotResource.setResourceName(stats.getResourceName());
                        hotResource.setRequestCount(stats.getRequestCount());
                        hotResource.setBlockedCount(stats.getBlockedCount());
                        
                        if (stats.getRequestCount() > 0) {
                            double blockRate = (double) stats.getBlockedCount() / stats.getRequestCount();
                            hotResource.setBlockRate(blockRate);
                        }
                        
                        hotResource.setLastBlockedTime(stats.getLastBlockedTime());
                        hotResources.add(hotResource);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse resource stats for key: {}", key, e);
            }
        }
        
        // 按阻塞次数排序
        hotResources.sort((r1, r2) -> 
            Long.compare(r2.getBlockedCount(), r1.getBlockedCount()));
        
        // 只返回前50个热点资源
        return hotResources.stream().limit(50).collect(Collectors.toList());
    }
    
    private List<HotService> detectHotServices() {
        List<HotService> hotServices = new ArrayList<>();
        
        // 从Redis获取服务请求统计
        String pattern = "service:stats:*";
        Set<String> keys = redisTemplate.keys(pattern);
        
        for (String key : keys) {
            try {
                String jsonData = redisTemplate.opsForValue().get(key);
                if (jsonData != null) {
                    ServiceStats stats = JsonUtils.fromJson(jsonData, ServiceStats.class);
                    
                    // 判断是否为热点服务
                    if (isHotService(stats)) {
                        HotService hotService = new HotService();
                        hotService.setServiceName(stats.getServiceName());
                        hotService.setRequestCount(stats.getRequestCount());
                        hotService.setBlockedCount(stats.getBlockedCount());
                        
                        if (stats.getRequestCount() > 0) {
                            double blockRate = (double) stats.getBlockedCount() / stats.getRequestCount();
                            hotService.setBlockRate(blockRate);
                        }
                        
                        hotService.setLastBlockedTime(stats.getLastBlockedTime());
                        hotServices.add(hotService);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse service stats for key: {}", key, e);
            }
        }
        
        // 按阻塞次数排序
        hotServices.sort((s1, s2) -> 
            Long.compare(s2.getBlockedCount(), s1.getBlockedCount()));
        
        // 只返回前20个热点服务
        return hotServices.stream().limit(20).collect(Collectors.toList());
    }
    
    private boolean isHotResource(ResourceStats stats) {
        // 判断资源是否为热点的条件
        // 1. 请求次数超过阈值
        // 2. 阻塞次数超过阈值
        // 3. 阻塞率超过阈值
        return stats.getRequestCount() > 1000 && 
               stats.getBlockedCount() > 100 && 
               (double) stats.getBlockedCount() / stats.getRequestCount() > 0.05;
    }
    
    private boolean isHotService(ServiceStats stats) {
        // 判断服务是否为热点的条件
        // 1. 请求次数超过阈值
        // 2. 阻塞次数超过阈值
        // 3. 阻塞率超过阈值
        return stats.getRequestCount() > 5000 && 
               stats.getBlockedCount() > 500 && 
               (double) stats.getBlockedCount() / stats.getRequestCount() > 0.05;
    }
    
    private void updateHotspotTrend(HotspotData hotspotData) {
        try {
            // 构建趋势数据点
            HotspotTrendPoint trendPoint = new HotspotTrendPoint();
            trendPoint.setTimestamp(System.currentTimeMillis());
            
            // 统计热点资源信息
            Map<String, Long> topResources = new HashMap<>();
            for (HotResource resource : hotspotData.getHotResources()) {
                topResources.put(resource.getResourceName(), resource.getBlockedCount());
            }
            trendPoint.setTopResources(topResources);
            
            // 统计热点服务信息
            Map<String, Long> topServices = new HashMap<>();
            for (HotService service : hotspotData.getHotServices()) {
                topServices.put(service.getServiceName(), service.getBlockedCount());
            }
            trendPoint.setTopServices(topServices);
            
            // 存储到Redis列表中
            String key = "dashboard:hotspot_trend";
            String jsonData = JsonUtils.toJson(trendPoint);
            redisTemplate.opsForList().leftPush(key, jsonData);
            
            // 保留最近100个数据点
            redisTemplate.opsForList().trim(key, 0, 99);
        } catch (Exception e) {
            log.error("Failed to update hotspot trend", e);
        }
    }
}

// 资源统计
@Data
public class ResourceStats {
    private String resourceName;
    private long requestCount;
    private long blockedCount;
    private long passCount;
    private double avgResponseTime;
    private long lastBlockedTime;
    private long lastRequestTime;
}

// 服务统计
@Data
public class ServiceStats {
    private String serviceName;
    private long requestCount;
    private long blockedCount;
    private long passCount;
    private double avgResponseTime;
    private long lastBlockedTime;
    private long lastRequestTime;
}

// 热点趋势点
@Data
public class HotspotTrendPoint {
    private long timestamp;
    private Map<String, Long> topResources; // 资源名 -> 阻塞次数
    private Map<String, Long> topServices; // 服务名 -> 阻塞次数
}
```

### 2. 热点可视化展示

热点可视化展示通过图表的形式直观地展示系统中的限流热点。

```java
// 热点可视化控制器
@RestController
@RequestMapping("/api/dashboard/hotspots")
public class HotspotVisualizationController {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    @GetMapping
    public ResponseEntity<HotspotVisualizationData> getHotspotData() {
        try {
            String key = "dashboard:hotspots";
            String jsonData = redisTemplate.opsForValue().get(key);
            
            if (jsonData != null) {
                HotspotData hotspotData = JsonUtils.fromJson(jsonData, HotspotData.class);
                HotspotVisualizationData visualizationData = convertToVisualizationData(hotspotData);
                return ResponseEntity.ok(visualizationData);
            } else {
                return ResponseEntity.ok(new HotspotVisualizationData());
            }
        } catch (Exception e) {
            log.error("Failed to get hotspot data", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/trend")
    public ResponseEntity<List<HotspotTrendPoint>> getHotspotTrend(
            @RequestParam(defaultValue = "3600") int duration) {
        try {
            List<HotspotTrendPoint> trendPoints = getHotspotTrendData(duration);
            return ResponseEntity.ok(trendPoints);
        } catch (Exception e) {
            log.error("Failed to get hotspot trend", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    private HotspotVisualizationData convertToVisualizationData(HotspotData hotspotData) {
        HotspotVisualizationData visualizationData = new HotspotVisualizationData();
        
        // 转换热点资源数据为图表格式
        List<ChartDataPoint> resourceChartData = new ArrayList<>();
        for (HotResource resource : hotspotData.getHotResources()) {
            ChartDataPoint point = new ChartDataPoint();
            point.setName(resource.getResourceName());
            point.setValue(resource.getBlockedCount());
            point.setExtraData(Map.of(
                "blockRate", String.valueOf(resource.getBlockRate()),
                "requestCount", String.valueOf(resource.getRequestCount())
            ));
            resourceChartData.add(point);
        }
        visualizationData.setResourceHotspots(resourceChartData);
        
        // 转换热点服务数据为图表格式
        List<ChartDataPoint> serviceChartData = new ArrayList<>();
        for (HotService service : hotspotData.getHotServices()) {
            ChartDataPoint point = new ChartDataPoint();
            point.setName(service.getServiceName());
            point.setValue(service.getBlockedCount());
            point.setExtraData(Map.of(
                "blockRate", String.valueOf(service.getBlockRate()),
                "requestCount", String.valueOf(service.getRequestCount())
            ));
            serviceChartData.add(point);
        }
        visualizationData.setServiceHotspots(serviceChartData);
        
        visualizationData.setTimestamp(hotspotData.getTimestamp());
        
        return visualizationData;
    }
    
    private List<HotspotTrendPoint> getHotspotTrendData(int duration) {
        List<HotspotTrendPoint> trendPoints = new ArrayList<>();
        
        // 从Redis获取趋势数据
        String key = "dashboard:hotspot_trend";
        List<String> jsonDataList = redisTemplate.opsForList().range(key, 0, -1);
        
        if (jsonDataList != null) {
            long endTime = System.currentTimeMillis();
            long startTime = endTime - (duration * 1000L);
            
            for (String jsonData : jsonDataList) {
                try {
                    HotspotTrendPoint point = JsonUtils.fromJson(jsonData, HotspotTrendPoint.class);
                    // 只返回指定时间范围内的数据
                    if (point.getTimestamp() >= startTime && point.getTimestamp() <= endTime) {
                        trendPoints.add(point);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse hotspot trend point", e);
                }
            }
        }
        
        // 按时间排序
        trendPoints.sort(Comparator.comparingLong(HotspotTrendPoint::getTimestamp));
        
        return trendPoints;
    }
}

// 热点可视化数据
@Data
public class HotspotVisualizationData {
    private List<ChartDataPoint> resourceHotspots;
    private List<ChartDataPoint> serviceHotspots;
    private long timestamp;
}

// 图表数据点
@Data
public class ChartDataPoint {
    private String name;
    private long value;
    private Map<String, String> extraData;
}
```

## 规则效果可视化

### 1. 规则执行统计

规则执行统计展示各个限流规则的执行情况，包括触发次数、通过次数、阻塞次数等。

```java
// 规则效果统计服务
@Service
public class RuleEffectStatisticsService {
    
    private final RuleRepository ruleRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ScheduledExecutorService scheduler;
    
    public RuleEffectStatisticsService(RuleRepository ruleRepository,
                                     RedisTemplate<String, String> redisTemplate) {
        this.ruleRepository = ruleRepository;
        this.redisTemplate = redisTemplate;
        this.scheduler = Executors.newScheduledThreadPool(1);
        
        // 启动规则效果统计任务
        scheduler.scheduleAtFixedRate(this::collectRuleEffectStats, 0, 15, TimeUnit.SECONDS);
    }
    
    /**
     * 收集规则效果统计
     */
    private void collectRuleEffectStats() {
        try {
            // 获取所有规则
            List<RateLimitRule> rules = ruleRepository.findAll();
            
            List<RuleEffect> ruleEffects = new ArrayList<>();
            Map<String, Integer> ruleCategoryStats = new HashMap<>();
            
            for (RateLimitRule rule : rules) {
                // 获取规则执行统计
                RuleExecutionStats stats = getRuleExecutionStats(rule.getRuleId());
                
                RuleEffect effect = new RuleEffect();
                effect.setRuleId(rule.getRuleId());
                effect.setRuleName(rule.getRuleName());
                effect.setResource(rule.getResource());
                effect.setEnabled(rule.isEnabled());
                effect.setAlgorithm(rule.getAlgorithm());
                effect.setLimit(rule.getLimit());
                effect.setStats(stats);
                
                ruleEffects.add(effect);
                
                // 统计规则分类
                String category = getRuleCategory(rule);
                ruleCategoryStats.merge(category, 1, Integer::sum);
            }
            
            // 构建规则效果数据
            RuleEffectData ruleEffectData = new RuleEffectData();
            ruleEffectData.setRuleEffects(ruleEffects);
            ruleEffectData.setCategoryStats(ruleCategoryStats);
            ruleEffectData.setTimestamp(System.currentTimeMillis());
            
            // 存储到Redis供仪表盘查询
            String key = "dashboard:rule_effects";
            String jsonData = JsonUtils.toJson(ruleEffectData);
            redisTemplate.opsForValue().set(key, jsonData, 60, TimeUnit.SECONDS);
            
            // 更新规则效果趋势
            updateRuleEffectTrend(ruleEffectData);
        } catch (Exception e) {
            log.error("Failed to collect rule effect stats", e);
        }
    }
    
    private RuleExecutionStats getRuleExecutionStats(String ruleId) {
        RuleExecutionStats stats = new RuleExecutionStats();
        
        // 从Redis获取规则执行统计
        String prefix = "rule:" + ruleId + ":";
        
        String triggerCountStr = redisTemplate.opsForValue().get(prefix + "trigger_count");
        stats.setTriggerCount(triggerCountStr != null ? Long.parseLong(triggerCountStr) : 0);
        
        String passCountStr = redisTemplate.opsForValue().get(prefix + "pass_count");
        stats.setPassCount(passCountStr != null ? Long.parseLong(passCountStr) : 0);
        
        String blockCountStr = redisTemplate.opsForValue().get(prefix + "block_count");
        stats.setBlockCount(blockCountStr != null ? Long.parseLong(blockCountStr) : 0);
        
        String avgLatencyStr = redisTemplate.opsForValue().get(prefix + "avg_latency");
        stats.setAvgLatency(avgLatencyStr != null ? Double.parseDouble(avgLatencyStr) : 0.0);
        
        String lastTriggerTimeStr = redisTemplate.opsForValue().get(prefix + "last_trigger_time");
        stats.setLastTriggerTime(lastTriggerTimeStr != null ? Long.parseLong(lastTriggerTimeStr) : 0);
        
        return stats;
    }
    
    private String getRuleCategory(RateLimitRule rule) {
        // 根据规则属性确定分类
        if (rule.getResource().startsWith("user:")) {
            return "用户级限流";
        } else if (rule.getResource().startsWith("ip:")) {
            return "IP级限流";
        } else if (rule.getResource().startsWith("api:")) {
            return "API级限流";
        } else {
            return "其他";
        }
    }
    
    private void updateRuleEffectTrend(RuleEffectData ruleEffectData) {
        try {
            // 构建趋势数据点
            RuleEffectTrendPoint trendPoint = new RuleEffectTrendPoint();
            trendPoint.setTimestamp(System.currentTimeMillis());
            
            // 统计各类规则的执行情况
            Map<String, RuleExecutionSummary> categorySummaries = new HashMap<>();
            for (RuleEffect effect : ruleEffectData.getRuleEffects()) {
                String category = getRuleCategoryForTrend(effect);
                RuleExecutionSummary summary = categorySummaries.computeIfAbsent(
                    category, k -> new RuleExecutionSummary());
                
                summary.setTriggerCount(summary.getTriggerCount() + effect.getStats().getTriggerCount());
                summary.setPassCount(summary.getPassCount() + effect.getStats().getPassCount());
                summary.setBlockCount(summary.getBlockCount() + effect.getStats().getBlockCount());
            }
            trendPoint.setCategorySummaries(categorySummaries);
            
            // 存储到Redis列表中
            String key = "dashboard:rule_effect_trend";
            String jsonData = JsonUtils.toJson(trendPoint);
            redisTemplate.opsForList().leftPush(key, jsonData);
            
            // 保留最近100个数据点
            redisTemplate.opsForList().trim(key, 0, 99);
        } catch (Exception e) {
            log.error("Failed to update rule effect trend", e);
        }
    }
    
    private String getRuleCategoryForTrend(RuleEffect effect) {
        if (effect.getResource().startsWith("user:")) {
            return "user";
        } else if (effect.getResource().startsWith("ip:")) {
            return "ip";
        } else if (effect.getResource().startsWith("api:")) {
            return "api";
        } else {
            return "other";
        }
    }
}

// 规则执行摘要
@Data
public class RuleExecutionSummary {
    private long triggerCount;
    private long passCount;
    private long blockCount;
}
```

### 2. 规则效果展示

规则效果展示通过多种图表形式展示规则的执行效果。

```java
// 规则效果展示控制器
@RestController
@RequestMapping("/api/dashboard/rules")
public class RuleEffectVisualizationController {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    @GetMapping("/effects")
    public ResponseEntity<RuleEffectVisualizationData> getRuleEffects() {
        try {
            String key = "dashboard:rule_effects";
            String jsonData = redisTemplate.opsForValue().get(key);
            
            if (jsonData != null) {
                RuleEffectData ruleEffectData = JsonUtils.fromJson(jsonData, RuleEffectData.class);
                RuleEffectVisualizationData visualizationData = convertToVisualizationData(ruleEffectData);
                return ResponseEntity.ok(visualizationData);
            } else {
                return ResponseEntity.ok(new RuleEffectVisualizationData());
            }
        } catch (Exception e) {
            log.error("Failed to get rule effects", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/{ruleId}/details")
    public ResponseEntity<RuleEffectDetails> getRuleEffectDetails(
            @PathVariable String ruleId) {
        try {
            RuleEffectDetails details = getRuleEffectDetailsData(ruleId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            log.error("Failed to get rule effect details for: {}", ruleId, e);
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/trend")
    public ResponseEntity<List<RuleEffectTrendPoint>> getRuleEffectTrend(
            @RequestParam(defaultValue = "3600") int duration) {
        try {
            List<RuleEffectTrendPoint> trendPoints = getRuleEffectTrendData(duration);
            return ResponseEntity.ok(trendPoints);
        } catch (Exception e) {
            log.error("Failed to get rule effect trend", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    private RuleEffectVisualizationData convertToVisualizationData(RuleEffectData ruleEffectData) {
        RuleEffectVisualizationData visualizationData = new RuleEffectVisualizationData();
        
        // 转换规则效果数据为图表格式
        List<RuleEffectChartData> chartDataList = new ArrayList<>();
        for (RuleEffect effect : ruleEffectData.getRuleEffects()) {
            RuleEffectChartData chartData = new RuleEffectChartData();
            chartData.setRuleId(effect.getRuleId());
            chartData.setRuleName(effect.getRuleName());
            chartData.setResource(effect.getResource());
            chartData.setEnabled(effect.isEnabled());
            
            // 构建执行统计数据
            RuleExecutionStats stats = effect.getStats();
            chartData.setTriggerCount(stats.getTriggerCount());
            chartData.setPassCount(stats.getPassCount());
            chartData.setBlockCount(stats.getBlockCount());
            chartData.setAvgLatency(stats.getAvgLatency());
            
            // 计算通过率和阻塞率
            if (stats.getTriggerCount() > 0) {
                double passRate = (double) stats.getPassCount() / stats.getTriggerCount();
                double blockRate = (double) stats.getBlockCount() / stats.getTriggerCount();
                chartData.setPassRate(passRate);
                chartData.setBlockRate(blockRate);
            }
            
            chartDataList.add(chartData);
        }
        visualizationData.setRuleEffects(chartDataList);
        
        // 转换分类统计数据
        List<CategoryStatsData> categoryStatsDataList = new ArrayList<>();
        if (ruleEffectData.getCategoryStats() != null) {
            for (Map.Entry<String, Integer> entry : ruleEffectData.getCategoryStats().entrySet()) {
                CategoryStatsData categoryStatsData = new CategoryStatsData();
                categoryStatsData.setCategory(entry.getKey());
                categoryStatsData.setRuleCount(entry.getValue());
                categoryStatsDataList.add(categoryStatsData);
            }
        }
        visualizationData.setCategoryStats(categoryStatsDataList);
        
        visualizationData.setTimestamp(ruleEffectData.getTimestamp());
        
        return visualizationData;
    }
    
    private RuleEffectDetails getRuleEffectDetailsData(String ruleId) {
        RuleEffectDetails details = new RuleEffectDetails();
        details.setRuleId(ruleId);
        
        // 从Redis获取规则详细信息
        String key = "dashboard:rule_effects";
        String jsonData = redisTemplate.opsForValue().get(key);
        
        if (jsonData != null) {
            try {
                RuleEffectData ruleEffectData = JsonUtils.fromJson(jsonData, RuleEffectData.class);
                
                // 查找指定规则
                for (RuleEffect effect : ruleEffectData.getRuleEffects()) {
                    if (ruleId.equals(effect.getRuleId())) {
                        details.setRuleName(effect.getRuleName());
                        details.setResource(effect.getResource());
                        details.setEnabled(effect.isEnabled());
                        details.setAlgorithm(effect.getAlgorithm());
                        details.setLimit(effect.getLimit());
                        
                        RuleExecutionStats stats = effect.getStats();
                        details.setTriggerCount(stats.getTriggerCount());
                        details.setPassCount(stats.getPassCount());
                        details.setBlockCount(stats.getBlockCount());
                        details.setAvgLatency(stats.getAvgLatency());
                        details.setLastTriggerTime(stats.getLastTriggerTime());
                        
                        // 计算通过率和阻塞率
                        if (stats.getTriggerCount() > 0) {
                            double passRate = (double) stats.getPassCount() / stats.getTriggerCount();
                            double blockRate = (double) stats.getBlockCount() / stats.getTriggerCount();
                            details.setPassRate(passRate);
                            details.setBlockRate(blockRate);
                        }
                        
                        break;
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse rule effect data", e);
            }
        }
        
        details.setTimestamp(System.currentTimeMillis());
        
        return details;
    }
    
    private List<RuleEffectTrendPoint> getRuleEffectTrendData(int duration) {
        List<RuleEffectTrendPoint> trendPoints = new ArrayList<>();
        
        // 从Redis获取趋势数据
        String key = "dashboard:rule_effect_trend";
        List<String> jsonDataList = redisTemplate.opsForList().range(key, 0, -1);
        
        if (jsonDataList != null) {
            long endTime = System.currentTimeMillis();
            long startTime = endTime - (duration * 1000L);
            
            for (String jsonData : jsonDataList) {
                try {
                    RuleEffectTrendPoint point = JsonUtils.fromJson(jsonData, RuleEffectTrendPoint.class);
                    // 只返回指定时间范围内的数据
                    if (point.getTimestamp() >= startTime && point.getTimestamp() <= endTime) {
                        trendPoints.add(point);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse rule effect trend point", e);
                }
            }
        }
        
        // 按时间排序
        trendPoints.sort(Comparator.comparingLong(RuleEffectTrendPoint::getTimestamp));
        
        return trendPoints;
    }
}

// 规则效果可视化数据
@Data
public class RuleEffectVisualizationData {
    private List<RuleEffectChartData> ruleEffects;
    private List<CategoryStatsData> categoryStats;
    private long timestamp;
}

// 规则效果图表数据
@Data
public class RuleEffectChartData {
    private String ruleId;
    private String ruleName;
    private String resource;
    private boolean enabled;
    private long triggerCount;
    private long passCount;
    private long blockCount;
    private double passRate;
    private double blockRate;
    private double avgLatency;
}

// 分类统计数据
@Data
public class CategoryStatsData {
    private String category;
    private int ruleCount;
}

// 规则效果详情
@Data
public class RuleEffectDetails {
    private String ruleId;
    private String ruleName;
    private String resource;
    private boolean enabled;
    private String algorithm;
    private long limit;
    private long triggerCount;
    private long passCount;
    private long blockCount;
    private double passRate;
    private double blockRate;
    private double avgLatency;
    private long lastTriggerTime;
    private long timestamp;
}

// 规则效果趋势点
@Data
public class RuleEffectTrendPoint {
    private long timestamp;
    private Map<String, RuleExecutionSummary> categorySummaries;
}
```

## 仪表盘前端实现

### 1. 仪表盘布局设计

仪表盘布局设计需要考虑信息的层次结构和用户的使用习惯。

```html
<!-- 仪表盘主页面 -->
<div class="dashboard-container">
  <!-- 顶部导航栏 -->
  <nav class="dashboard-nav">
    <div class="nav-brand">分布式限流平台</div>
    <div class="nav-items">
      <a href="#traffic" class="nav-item active">流量概览</a>
      <a href="#hotspots" class="nav-item">限流热点</a>
      <a href="#rules" class="nav-item">规则效果</a>
      <a href="#system" class="nav-item">系统健康</a>
    </div>
    <div class="nav-controls">
      <select id="timeRange">
        <option value="300">最近5分钟</option>
        <option value="900">最近15分钟</option>
        <option value="1800">最近30分钟</option>
        <option value="3600" selected>最近1小时</option>
        <option value="86400">最近24小时</option>
      </select>
      <button id="refreshBtn">刷新</button>
    </div>
  </nav>
  
  <!-- 主要内容区域 -->
  <div class="dashboard-content">
    <!-- 流量概览面板 -->
    <section id="traffic" class="dashboard-section">
      <h2>全局流量态势</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-title">总请求数</div>
          <div class="metric-value" id="totalRequests">0</div>
          <div class="metric-trend" id="totalRequestsTrend"></div>
        </div>
        <div class="metric-card">
          <div class="metric-title">通过请求数</div>
          <div class="metric-value" id="passRequests">0</div>
          <div class="metric-trend" id="passRequestsTrend"></div>
        </div>
        <div class="metric-card">
          <div class="metric-title">阻塞请求数</div>
          <div class="metric-value" id="blockedRequests">0</div>
          <div class="metric-trend" id="blockedRequestsTrend"></div>
        </div>
        <div class="metric-card">
          <div class="metric-title">阻塞率</div>
          <div class="metric-value" id="blockRate">0%</div>
          <div class="metric-trend" id="blockRateTrend"></div>
        </div>
      </div>
      
      <!-- 流量趋势图 -->
      <div class="chart-container">
        <h3>流量趋势</h3>
        <canvas id="trafficTrendChart"></canvas>
      </div>
    </section>
    
    <!-- 限流热点面板 -->
    <section id="hotspots" class="dashboard-section">
      <h2>限流热点图</h2>
      <div class="hotspot-charts">
        <div class="chart-container">
          <h3>热点资源</h3>
          <canvas id="resourceHotspotChart"></canvas>
        </div>
        <div class="chart-container">
          <h3>热点服务</h3>
          <canvas id="serviceHotspotChart"></canvas>
        </div>
      </div>
      
      <!-- 热点趋势图 -->
      <div class="chart-container">
        <h3>热点趋势</h3>
        <canvas id="hotspotTrendChart"></canvas>
      </div>
    </section>
    
    <!-- 规则效果面板 -->
    <section id="rules" class="dashboard-section">
      <h2>规则效果可视化</h2>
      <div class="rule-overview">
        <div class="metric-card">
          <div class="metric-title">总规则数</div>
          <div class="metric-value" id="totalRules">0</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">启用规则数</div>
          <div class="metric-value" id="enabledRules">0</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">触发总次数</div>
          <div class="metric-value" id="totalTriggers">0</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">平均阻塞率</div>
          <div class="metric-value" id="avgBlockRate">0%</div>
        </div>
      </div>
      
      <!-- 规则分类统计 -->
      <div class="chart-container">
        <h3>规则分类统计</h3>
        <canvas id="ruleCategoryChart"></canvas>
      </div>
      
      <!-- 规则效果趋势 -->
      <div class="chart-container">
        <h3>规则效果趋势</h3>
        <canvas id="ruleEffectTrendChart"></canvas>
      </div>
    </section>
    
    <!-- 系统健康面板 -->
    <section id="system" class="dashboard-section">
      <h2>系统健康状态</h2>
      <div class="health-metrics">
        <div class="metric-card">
          <div class="metric-title">CPU使用率</div>
          <div class="metric-value" id="cpuUsage">0%</div>
          <div class="metric-progress">
            <div class="progress-bar" id="cpuUsageBar"></div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-title">内存使用率</div>
          <div class="metric-value" id="memoryUsage">0%</div>
          <div class="metric-progress">
            <div class="progress-bar" id="memoryUsageBar"></div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Redis连接使用率</div>
          <div class="metric-value" id="redisUsage">0%</div>
          <div class="metric-progress">
            <div class="progress-bar" id="redisUsageBar"></div>
          </div>
        </div>
      </div>
      
      <!-- 系统健康趋势 -->
      <div class="chart-container">
        <h3>系统健康趋势</h3>
        <canvas id="systemHealthChart"></canvas>
      </div>
    </section>
  </div>
</div>
```

### 2. 数据可视化实现

使用Chart.js等图表库实现数据的可视化展示。

```javascript
// 仪表盘数据可视化实现
class DashboardVisualization {
  constructor() {
    this.initializeCharts();
    this.bindEvents();
    this.refreshData();
  }
  
  initializeCharts() {
    // 初始化流量趋势图
    const trafficCtx = document.getElementById('trafficTrendChart').getContext('2d');
    this.trafficChart = new Chart(trafficCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: '总请求数',
          data: [],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }, {
          label: '通过请求数',
          data: [],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        }, {
          label: '阻塞请求数',
          data: [],
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // 初始化热点资源图
    const resourceCtx = document.getElementById('resourceHotspotChart').getContext('2d');
    this.resourceHotspotChart = new Chart(resourceCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: '阻塞次数',
          data: [],
          backgroundColor: '#FF9800'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
    
    // 初始化规则分类统计图
    const categoryCtx = document.getElementById('ruleCategoryChart').getContext('2d');
    this.categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FF9800',
            '#F44336',
            '#9C27B0'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  
  bindEvents() {
    // 绑定刷新按钮事件
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshData();
    });
    
    // 绑定时间范围选择事件
    document.getElementById('timeRange').addEventListener('change', (e) => {
      this.refreshData(e.target.value);
    });
    
    // 绑定导航栏点击事件
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchSection(e.target.getAttribute('href').substring(1));
      });
    });
  }
  
  switchSection(sectionId) {
    // 切换显示的面板
    document.querySelectorAll('.dashboard-section').forEach(section => {
      section.style.display = 'none';
    });
    
    document.getElementById(sectionId).style.display = 'block';
    
    // 更新导航栏激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    document.querySelector(`.nav-item[href="#${sectionId}"]`).classList.add('active');
  }
  
  async refreshData(duration = 3600) {
    try {
      // 获取流量概览数据
      const trafficResponse = await fetch(`/api/dashboard/traffic/overview`);
      const trafficData = await trafficResponse.json();
      this.updateTrafficOverview(trafficData);
      
      // 获取流量趋势数据
      const trendResponse = await fetch(`/api/dashboard/traffic/trend?duration=${duration}`);
      const trendData = await trendResponse.json();
      this.updateTrafficTrend(trendData);
      
      // 获取热点数据
      const hotspotResponse = await fetch(`/api/dashboard/hotspots`);
      const hotspotData = await hotspotResponse.json();
      this.updateHotspots(hotspotData);
      
      // 获取规则效果数据
      const ruleResponse = await fetch(`/api/dashboard/rules/effects`);
      const ruleData = await ruleResponse.json();
      this.updateRuleEffects(ruleData);
      
      // 更新刷新时间
      document.getElementById('lastRefresh').textContent = 
        new Date().toLocaleTimeString();
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  }
  
  updateTrafficOverview(data) {
    // 更新流量概览指标
    document.getElementById('totalRequests').textContent = 
      data.totalRequests.toLocaleString();
    document.getElementById('passRequests').textContent = 
      data.passRequests.toLocaleString();
    document.getElementById('blockedRequests').textContent = 
      data.blockedRequests.toLocaleString();
    document.getElementById('blockRate').textContent = 
      (data.blockRate * 100).toFixed(2) + '%';
  }
  
  updateTrafficTrend(data) {
    // 更新流量趋势图
    const labels = data.map(point => 
      new Date(point.timestamp).toLocaleTimeString());
    const totalRequests = data.map(point => point.totalRequests);
    const passRequests = data.map(point => point.passRequests);
    const blockedRequests = data.map(point => point.blockedRequests);
    
    this.trafficChart.data.labels = labels;
    this.trafficChart.data.datasets[0].data = totalRequests;
    this.trafficChart.data.datasets[1].data = passRequests;
    this.trafficChart.data.datasets[2].data = blockedRequests;
    this.trafficChart.update();
  }
  
  updateHotspots(data) {
    // 更新热点资源图
    const resourceLabels = data.resourceHotspots.map(item => item.name);
    const resourceData = data.resourceHotspots.map(item => item.value);
    
    this.resourceHotspotChart.data.labels = resourceLabels;
    this.resourceHotspotChart.data.datasets[0].data = resourceData;
    this.resourceHotspotChart.update();
  }
  
  updateRuleEffects(data) {
    // 更新规则分类统计图
    const categoryLabels = data.categoryStats.map(item => item.category);
    const categoryData = data.categoryStats.map(item => item.ruleCount);
    
    this.categoryChart.data.labels = categoryLabels;
    this.categoryChart.data.datasets[0].data = categoryData;
    this.categoryChart.update();
    
    // 更新规则概览指标
    const totalRules = data.ruleEffects.length;
    const enabledRules = data.ruleEffects.filter(effect => effect.enabled).length;
    const totalTriggers = data.ruleEffects.reduce((sum, effect) => 
      sum + effect.triggerCount, 0);
    const avgBlockRate = data.ruleEffects.length > 0 ? 
      data.ruleEffects.reduce((sum, effect) => 
        sum + effect.blockRate, 0) / data.ruleEffects.length : 0;
    
    document.getElementById('totalRules').textContent = totalRules;
    document.getElementById('enabledRules').textContent = enabledRules;
    document.getElementById('totalTriggers').textContent = 
      totalTriggers.toLocaleString();
    document.getElementById('avgBlockRate').textContent = 
      (avgBlockRate * 100).toFixed(2) + '%';
  }
}

// 页面加载完成后初始化仪表盘
document.addEventListener('DOMContentLoaded', () => {
  new DashboardVisualization();
});
```

## 总结

实时仪表盘是分布式限流平台运维的重要工具，通过全局流量态势展示、限流热点图绘制和规则效果可视化等功能，为运维人员提供了全面的系统状态视图。

关键要点包括：

1. **数据聚合**：通过后台服务定期聚合各类监控数据，为前端展示提供统一的数据源。

2. **多维度展示**：从流量概览、热点分析到规则效果，提供了多层次的可视化展示。

3. **实时更新**：通过定时刷新机制确保展示数据的实时性。

4. **交互友好**：提供了时间范围选择、手动刷新等交互功能，提升用户体验。

在实际应用中，需要根据具体的业务需求和技术架构，合理设计仪表盘的功能和界面布局，确保能够有效地支持运维工作。同时，还需要考虑性能优化，避免频繁的数据查询对系统造成压力。

在后续章节中，我们将深入探讨分布式限流平台的智能报警机制和链路追踪集成。