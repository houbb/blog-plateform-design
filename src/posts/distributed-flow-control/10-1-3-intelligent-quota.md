---
title: 智能配额分配：根据服务重要性与SLA动态分配集群总配额
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed, quota-allocation]
published: true
---

在复杂的微服务架构中，不同的服务具有不同的重要性和业务价值。核心交易服务通常需要更高的资源保障和更严格的SLA要求，而一些辅助服务则可以接受相对较低的资源分配。传统的静态配额分配方式难以满足这种差异化的需求，智能配额分配机制应运而生。它能够根据服务的重要性和SLA要求动态分配集群总配额，确保关键业务得到优先保障，同时最大化整体资源利用率。

## 智能配额分配的核心价值

### 1. 差异化资源保障

智能配额分配能够根据不同服务的重要性和业务价值，提供差异化的资源保障，确保关键业务的稳定运行。

```java
// 智能配额分配器
@Service
public class IntelligentQuotaAllocator {
    
    private final ServiceRegistry serviceRegistry;
    private final QuotaRepository quotaRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ScheduledExecutorService scheduler;
    
    // 配额分配策略
    private QuotaAllocationStrategy allocationStrategy;
    
    // 重要性权重配置
    private Map<ServiceLevel, Double> importanceWeights;
    
    public IntelligentQuotaAllocator(ServiceRegistry serviceRegistry,
                                   QuotaRepository quotaRepository,
                                   RedisTemplate<String, String> redisTemplate) {
        this.serviceRegistry = serviceRegistry;
        this.quotaRepository = quotaRepository;
        this.redisTemplate = redisTemplate;
        this.scheduler = Executors.newScheduledThreadPool(2);
        
        // 初始化配置
        this.allocationStrategy = new PriorityBasedAllocationStrategy();
        this.importanceWeights = initializeImportanceWeights();
        
        // 启动配额重新分配任务
        scheduler.scheduleAtFixedRate(this::reallocateQuotas, 0, 60, TimeUnit.SECONDS);
    }
    
    /**
     * 根据服务重要性和SLA要求分配配额
     */
    public Map<String, ServiceQuota> allocateQuotas(ClusterQuota clusterQuota) {
        try {
            // 获取所有服务信息
            List<ServiceInfo> services = serviceRegistry.getAllServices();
            
            // 计算每个服务的权重
            Map<String, Double> serviceWeights = calculateServiceWeights(services);
            
            // 应用配额分配策略
            Map<String, ServiceQuota> allocatedQuotas = allocationStrategy.allocate(
                clusterQuota, services, serviceWeights);
            
            // 保存分配结果
            saveQuotaAllocations(allocatedQuotas);
            
            // 发布配额更新事件
            publishQuotaUpdateEvent(allocatedQuotas);
            
            return allocatedQuotas;
        } catch (Exception e) {
            log.error("Failed to allocate quotas", e);
            throw new QuotaAllocationException("配额分配失败", e);
        }
    }
    
    /**
     * 计算服务权重
     */
    private Map<String, Double> calculateServiceWeights(List<ServiceInfo> services) {
        Map<String, Double> weights = new HashMap<>();
        
        for (ServiceInfo service : services) {
            // 基础权重来自服务等级
            double baseWeight = importanceWeights.getOrDefault(service.getServiceLevel(), 1.0);
            
            // SLA权重调整
            double slaWeight = calculateSlaWeight(service.getSlaRequirements());
            
            // 历史使用率权重调整
            double usageWeight = calculateUsageWeight(service.getServiceName());
            
            // 综合权重
            double finalWeight = baseWeight * slaWeight * usageWeight;
            weights.put(service.getServiceName(), finalWeight);
        }
        
        return weights;
    }
    
    /**
     * 计算SLA权重
     */
    private double calculateSlaWeight(SlaRequirements sla) {
        if (sla == null) {
            return 1.0;
        }
        
        double weight = 1.0;
        
        // 响应时间要求越严格，权重越高
        if (sla.getMaxResponseTime() <= 100) { // 100ms
            weight *= 2.0;
        } else if (sla.getMaxResponseTime() <= 500) { // 500ms
            weight *= 1.5;
        }
        
        // 可用性要求越严格，权重越高
        if (sla.getAvailability() >= 0.999) { // 99.9%
            weight *= 2.0;
        } else if (sla.getAvailability() >= 0.995) { // 99.5%
            weight *= 1.5;
        }
        
        // 错误率要求越严格，权重越高
        if (sla.getMaxErrorRate() <= 0.001) { // 0.1%
            weight *= 1.8;
        } else if (sla.getMaxErrorRate() <= 0.01) { // 1%
            weight *= 1.3;
        }
        
        return weight;
    }
    
    /**
     * 计算使用率权重
     */
    private double calculateUsageWeight(String serviceName) {
        try {
            // 获取历史配额使用率
            String key = "quota_usage_history:" + serviceName;
            List<String> usageRecords = redisTemplate.opsForList().range(key, 0, 9); // 最近10条记录
            
            if (usageRecords == null || usageRecords.isEmpty()) {
                return 1.0; // 没有历史数据，默认权重
            }
            
            // 计算平均使用率
            double totalUsage = 0.0;
            for (String record : usageRecords) {
                QuotaUsageHistory history = objectMapper.readValue(record, QuotaUsageHistory.class);
                totalUsage += history.getUsageRate();
            }
            double avgUsage = totalUsage / usageRecords.size();
            
            // 使用率越高，权重越高（但不超过一定阈值）
            return Math.min(2.0, 1.0 + avgUsage);
        } catch (Exception e) {
            log.warn("Failed to calculate usage weight for service: {}", serviceName, e);
            return 1.0;
        }
    }
    
    /**
     * 初始化重要性权重
     */
    private Map<ServiceLevel, Double> initializeImportanceWeights() {
        Map<ServiceLevel, Double> weights = new HashMap<>();
        weights.put(ServiceLevel.CRITICAL, 3.0);    // 关键服务权重3.0
        weights.put(ServiceLevel.HIGH, 2.0);        // 高优先级服务权重2.0
        weights.put(ServiceLevel.MEDIUM, 1.2);      // 中优先级服务权重1.2
        weights.put(ServiceLevel.LOW, 0.8);         // 低优先级服务权重0.8
        return weights;
    }
    
    /**
     * 重新分配配额
     */
    private void reallocateQuotas() {
        try {
            // 获取当前集群总配额
            ClusterQuota clusterQuota = getCurrentClusterQuota();
            
            // 重新分配配额
            Map<String, ServiceQuota> newAllocations = allocateQuotas(clusterQuota);
            
            log.info("Quotas reallocated for {} services", newAllocations.size());
        } catch (Exception e) {
            log.error("Failed to reallocate quotas", e);
        }
    }
    
    /**
     * 获取当前集群总配额
     */
    private ClusterQuota getCurrentClusterQuota() {
        try {
            String key = "cluster_quota:current";
            String jsonData = redisTemplate.opsForValue().get(key);
            if (jsonData != null) {
                return objectMapper.readValue(jsonData, ClusterQuota.class);
            }
        } catch (Exception e) {
            log.warn("Failed to get current cluster quota", e);
        }
        // 返回默认配额
        return new ClusterQuota(100000L, System.currentTimeMillis());
    }
    
    /**
     * 保存配额分配结果
     */
    private void saveQuotaAllocations(Map<String, ServiceQuota> allocations) {
        try {
            String key = "service_quotas:current";
            String jsonData = objectMapper.writeValueAsString(allocations);
            redisTemplate.opsForValue().set(key, jsonData, 3600, TimeUnit.SECONDS); // 保存1小时
            
            // 记录分配历史
            recordAllocationHistory(allocations);
        } catch (Exception e) {
            log.warn("Failed to save quota allocations", e);
        }
    }
    
    /**
     * 记录分配历史
     */
    private void recordAllocationHistory(Map<String, ServiceQuota> allocations) {
        try {
            String key = "quota_allocation_history";
            QuotaAllocationHistory history = new QuotaAllocationHistory();
            history.setAllocations(allocations);
            history.setTimestamp(System.currentTimeMillis());
            
            String jsonData = objectMapper.writeValueAsString(history);
            redisTemplate.opsForList().leftPush(key, jsonData);
            
            // 保留最近100条记录
            redisTemplate.opsForList().trim(key, 0, 99);
        } catch (Exception e) {
            log.warn("Failed to record allocation history", e);
        }
    }
    
    /**
     * 发布配额更新事件
     */
    private void publishQuotaUpdateEvent(Map<String, ServiceQuota> allocations) {
        try {
            QuotaUpdateEvent event = new QuotaUpdateEvent();
            event.setAllocations(allocations);
            event.setTimestamp(System.currentTimeMillis());
            
            // 发布到消息队列或事件总线
            eventPublisher.publishEvent(event);
        } catch (Exception e) {
            log.warn("Failed to publish quota update event", e);
        }
    }
    
    /**
     * 获取服务配额
     */
    public ServiceQuota getServiceQuota(String serviceName) {
        try {
            String key = "service_quotas:current";
            String jsonData = redisTemplate.opsForValue().get(key);
            if (jsonData != null) {
                Map<String, ServiceQuota> quotas = objectMapper.readValue(jsonData, 
                    new TypeReference<Map<String, ServiceQuota>>() {});
                return quotas.get(serviceName);
            }
        } catch (Exception e) {
            log.warn("Failed to get service quota for: {}", serviceName, e);
        }
        return null;
    }
    
    /**
     * 手动调整服务配额
     */
    public void adjustServiceQuota(String serviceName, long newQuota) {
        try {
            // 获取当前配额分配
            String key = "service_quotas:current";
            String jsonData = redisTemplate.opsForValue().get(key);
            if (jsonData != null) {
                Map<String, ServiceQuota> quotas = objectMapper.readValue(jsonData, 
                    new TypeReference<Map<String, ServiceQuota>>() {});
                
                // 调整指定服务配额
                ServiceQuota serviceQuota = quotas.get(serviceName);
                if (serviceQuota != null) {
                    long oldQuota = serviceQuota.getQuota();
                    serviceQuota.setQuota(newQuota);
                    serviceQuota.setLastUpdateTime(System.currentTimeMillis());
                    quotas.put(serviceName, serviceQuota);
                    
                    // 保存更新后的配额
                    redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(quotas), 
                                                  3600, TimeUnit.SECONDS);
                    
                    log.info("Adjusted quota for service {}: {} -> {}", serviceName, oldQuota, newQuota);
                    
                    // 发布配额更新事件
                    publishQuotaUpdateEvent(quotas);
                }
            }
        } catch (Exception e) {
            log.error("Failed to adjust service quota for: {}", serviceName, e);
            throw new QuotaAllocationException("配额调整失败", e);
        }
    }
}

// 服务信息
@Data
public class ServiceInfo {
    private String serviceName;
    private String serviceId;
    private ServiceLevel serviceLevel;
    private SlaRequirements slaRequirements;
    private String ownerTeam;
    private List<String> dependencies;
    private long instanceCount;
    private long createTime;
}

// 服务等级枚举
public enum ServiceLevel {
    CRITICAL("关键"),    // 关键业务服务
    HIGH("高"),        // 高优先级服务
    MEDIUM("中"),      // 中优先级服务
    LOW("低");         // 低优先级服务
    
    private final String description;
    
    ServiceLevel(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// SLA要求
@Data
public class SlaRequirements {
    private double availability;        // 可用性要求 (0.0 - 1.0)
    private long maxResponseTime;      // 最大响应时间 (毫秒)
    private double maxErrorRate;       // 最大错误率 (0.0 - 1.0)
    private long recoveryTime;         // 恢复时间要求 (毫秒)
}

// 集群总配额
@Data
public class ClusterQuota {
    private long totalQuota;           // 集群总配额
    private long timestamp;            // 时间戳
    private Map<String, Object> metadata; // 元数据
}

// 服务配额
@Data
public class ServiceQuota {
    private String serviceName;
    private long quota;                // 分配的配额
    private long usedQuota;            // 已使用的配额
    private double usageRate;          // 使用率
    private long createTime;
    private long lastUpdateTime;
    private Map<String, Object> metadata; // 元数据
}

// 配额使用历史
@Data
public class QuotaUsageHistory {
    private String serviceName;
    private long allocatedQuota;
    private long usedQuota;
    private double usageRate;
    private long timestamp;
}

// 配额分配历史
@Data
public class QuotaAllocationHistory {
    private Map<String, ServiceQuota> allocations;
    private long timestamp;
}

// 配额更新事件
@Data
public class QuotaUpdateEvent {
    private Map<String, ServiceQuota> allocations;
    private long timestamp;
}

// 配额分配异常
public class QuotaAllocationException extends RuntimeException {
    public QuotaAllocationException(String message) {
        super(message);
    }
    
    public QuotaAllocationException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### 2. 动态资源优化

智能配额分配能够根据实时的业务需求和系统负载情况，动态调整资源分配，最大化资源利用率。

### 3. 业务连续性保障

通过优先保障关键业务的资源需求，智能配额分配能够在资源紧张时确保核心业务的连续性。

## 配额分配策略

### 1. 基于优先级的分配策略

基于服务优先级的分配策略是最基础也是最重要的分配策略，它确保高优先级服务能够获得更多的资源保障。

```java
// 基于优先级的配额分配策略
@Component
public class PriorityBasedAllocationStrategy implements QuotaAllocationStrategy {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * 按优先级分配配额
     */
    @Override
    public Map<String, ServiceQuota> allocate(ClusterQuota clusterQuota, 
                                            List<ServiceInfo> services,
                                            Map<String, Double> serviceWeights) {
        Map<String, ServiceQuota> allocations = new HashMap<>();
        long remainingQuota = clusterQuota.getTotalQuota();
        
        // 按权重排序服务
        List<Map.Entry<String, Double>> sortedServices = serviceWeights.entrySet()
            .stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .collect(Collectors.toList());
        
        // 计算总权重
        double totalWeight = sortedServices.stream()
            .mapToDouble(Map.Entry::getValue)
            .sum();
        
        // 按权重分配配额
        for (Map.Entry<String, Double> entry : sortedServices) {
            String serviceName = entry.getKey();
            double weight = entry.getValue();
            
            // 计算分配配额
            long allocatedQuota = Math.round(remainingQuota * weight / totalWeight);
            
            // 确保至少分配最小配额
            allocatedQuota = Math.max(allocatedQuota, getMinimumQuota(serviceName));
            
            // 确保不超过剩余配额
            allocatedQuota = Math.min(allocatedQuota, remainingQuota);
            
            // 创建服务配额对象
            ServiceQuota serviceQuota = new ServiceQuota();
            serviceQuota.setServiceName(serviceName);
            serviceQuota.setQuota(allocatedQuota);
            serviceQuota.setUsedQuota(0L);
            serviceQuota.setUsageRate(0.0);
            serviceQuota.setCreateTime(System.currentTimeMillis());
            serviceQuota.setLastUpdateTime(System.currentTimeMillis());
            
            allocations.put(serviceName, serviceQuota);
            remainingQuota -= allocatedQuota;
            
            // 如果剩余配额不足，停止分配
            if (remainingQuota <= 0) {
                break;
            }
        }
        
        // 如果还有剩余配额，分配给最高优先级服务
        if (remainingQuota > 0 && !sortedServices.isEmpty()) {
            String highestPriorityService = sortedServices.get(0).getKey();
            ServiceQuota highestQuota = allocations.get(highestPriorityService);
            if (highestQuota != null) {
                highestQuota.setQuota(highestQuota.getQuota() + remainingQuota);
            }
        }
        
        return allocations;
    }
    
    /**
     * 获取服务的最小配额
     */
    private long getMinimumQuota(String serviceName) {
        try {
            // 从配置中心获取最小配额配置
            String key = "service_config:" + serviceName + ":min_quota";
            String minQuotaStr = redisTemplate.opsForValue().get(key);
            return minQuotaStr != null ? Long.parseLong(minQuotaStr) : 100L;
        } catch (Exception e) {
            log.warn("Failed to get minimum quota for service: {}", serviceName, e);
            return 100L; // 默认最小配额
        }
    }
}

// 配额分配策略接口
public interface QuotaAllocationStrategy {
    Map<String, ServiceQuota> allocate(ClusterQuota clusterQuota, 
                                     List<ServiceInfo> services,
                                     Map<String, Double> serviceWeights);
}

// 基于使用率的动态调整策略
@Component
public class UsageBasedAdjustmentStrategy {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * 根据使用率动态调整配额
     */
    public Map<String, ServiceQuota> adjustQuotas(Map<String, ServiceQuota> currentQuotas,
                                                ClusterQuota clusterQuota) {
        Map<String, ServiceQuota> adjustedQuotas = new HashMap<>();
        long totalQuota = clusterQuota.getTotalQuota();
        long usedTotalQuota = currentQuotas.values().stream()
            .mapToLong(ServiceQuota::getUsedQuota)
            .sum();
        
        // 计算整体使用率
        double overallUsageRate = totalQuota > 0 ? (double) usedTotalQuota / totalQuota : 0;
        
        // 如果整体使用率较低，可以重新分配资源
        if (overallUsageRate < 0.6) {
            adjustedQuotas = redistributeQuotas(currentQuotas, clusterQuota);
        }
        // 如果整体使用率较高，需要优化分配
        else if (overallUsageRate > 0.8) {
            adjustedQuotas = optimizeQuotas(currentQuotas, clusterQuota);
        }
        // 正常情况下保持当前分配
        else {
            adjustedQuotas = new HashMap<>(currentQuotas);
        }
        
        return adjustedQuotas;
    }
    
    /**
     * 重新分配配额
     */
    private Map<String, ServiceQuota> redistributeQuotas(Map<String, ServiceQuota> currentQuotas,
                                                       ClusterQuota clusterQuota) {
        // 将低使用率服务的配额重新分配给高使用率服务
        Map<String, ServiceQuota> redistributedQuotas = new HashMap<>();
        long totalQuota = clusterQuota.getTotalQuota();
        
        // 按使用率排序
        List<ServiceQuota> sortedByUsage = currentQuotas.values().stream()
            .sorted(Comparator.comparingDouble(ServiceQuota::getUsageRate))
            .collect(Collectors.toList());
        
        // 计算需要重新分配的配额
        long quotaToRedistribute = 0;
        List<ServiceQuota> lowUsageServices = new ArrayList<>();
        
        for (ServiceQuota quota : sortedByUsage) {
            if (quota.getUsageRate() < 0.3) { // 使用率低于30%的服务
                quotaToRedistribute += quota.getQuota() * 0.5; // 释放50%配额
                ServiceQuota newQuota = new ServiceQuota();
                BeanUtils.copyProperties(quota, newQuota);
                newQuota.setQuota(Math.round(quota.getQuota() * 0.5));
                newQuota.setLastUpdateTime(System.currentTimeMillis());
                lowUsageServices.add(newQuota);
            } else {
                redistributedQuotas.put(quota.getServiceName(), quota);
            }
        }
        
        // 将释放的配额分配给高使用率服务
        List<ServiceQuota> highUsageServices = sortedByUsage.stream()
            .filter(q -> q.getUsageRate() > 0.7) // 使用率高于70%的服务
            .collect(Collectors.toList());
        
        if (!highUsageServices.isEmpty() && quotaToRedistribute > 0) {
            long quotaPerService = quotaToRedistribute / highUsageServices.size();
            for (ServiceQuota highUsageService : highUsageServices) {
                ServiceQuota newQuota = new ServiceQuota();
                BeanUtils.copyProperties(highUsageService, newQuota);
                newQuota.setQuota(highUsageService.getQuota() + quotaPerService);
                newQuota.setLastUpdateTime(System.currentTimeMillis());
                redistributedQuotas.put(highUsageService.getServiceName(), newQuota);
            }
        }
        
        // 添加低使用率服务
        for (ServiceQuota lowUsageService : lowUsageServices) {
            redistributedQuotas.put(lowUsageService.getServiceName(), lowUsageService);
        }
        
        return redistributedQuotas;
    }
    
    /**
     * 优化配额分配
     */
    private Map<String, ServiceQuota> optimizeQuotas(Map<String, ServiceQuota> currentQuotas,
                                                   ClusterQuota clusterQuota) {
        // 在资源紧张时，优先保障高优先级服务
        Map<String, ServiceQuota> optimizedQuotas = new HashMap<>();
        long totalQuota = clusterQuota.getTotalQuota();
        
        // 按优先级和服务等级排序
        List<ServiceQuota> sortedByPriority = currentQuotas.values().stream()
            .sorted((q1, q2) -> {
                // 获取服务信息以确定优先级
                ServiceLevel level1 = getServiceLevel(q1.getServiceName());
                ServiceLevel level2 = getServiceLevel(q2.getServiceName());
                return level2.compareTo(level1); // 高优先级在前
            })
            .collect(Collectors.toList());
        
        // 计算需要削减的配额总量
        long quotaToReduce = Math.round(totalQuota * 0.1); // 削减10%
        
        // 从低优先级服务开始削减配额
        long reducedQuota = 0;
        for (ServiceQuota quota : sortedByPriority) {
            if (reducedQuota >= quotaToReduce) {
                break;
            }
            
            ServiceLevel serviceLevel = getServiceLevel(quota.getServiceName());
            if (serviceLevel == ServiceLevel.LOW || serviceLevel == ServiceLevel.MEDIUM) {
                long reduction = Math.min(quota.getQuota() * 0.2, quotaToReduce - reducedQuota);
                ServiceQuota newQuota = new ServiceQuota();
                BeanUtils.copyProperties(quota, newQuota);
                newQuota.setQuota(quota.getQuota() - Math.round(reduction));
                newQuota.setLastUpdateTime(System.currentTimeMillis());
                optimizedQuotas.put(quota.getServiceName(), newQuota);
                reducedQuota += reduction;
            } else {
                optimizedQuotas.put(quota.getServiceName(), quota);
            }
        }
        
        return optimizedQuotas;
    }
    
    /**
     * 获取服务等级
     */
    private ServiceLevel getServiceLevel(String serviceName) {
        try {
            String key = "service_info:" + serviceName;
            String jsonData = redisTemplate.opsForValue().get(key);
            if (jsonData != null) {
                ServiceInfo serviceInfo = objectMapper.readValue(jsonData, ServiceInfo.class);
                return serviceInfo.getServiceLevel();
            }
        } catch (Exception e) {
            log.warn("Failed to get service level for: {}", serviceName, e);
        }
        return ServiceLevel.MEDIUM; // 默认中等优先级
    }
}
```

### 2. 基于业务价值的分配策略

除了服务优先级外，还可以根据业务价值进行配额分配，确保高价值业务获得更多的资源支持。

```java
// 基于业务价值的配额分配策略
@Component
public class BusinessValueBasedAllocationStrategy implements QuotaAllocationStrategy {
    
    private final BusinessValueCalculator businessValueCalculator;
    
    public BusinessValueBasedAllocationStrategy(BusinessValueCalculator businessValueCalculator) {
        this.businessValueCalculator = businessValueCalculator;
    }
    
    /**
     * 基于业务价值分配配额
     */
    @Override
    public Map<String, ServiceQuota> allocate(ClusterQuota clusterQuota,
                                            List<ServiceInfo> services,
                                            Map<String, Double> serviceWeights) {
        Map<String, ServiceQuota> allocations = new HashMap<>();
        long remainingQuota = clusterQuota.getTotalQuota();
        
        // 计算每个服务的业务价值
        Map<String, Double> businessValues = calculateBusinessValues(services);
        
        // 结合权重和服务价值计算综合得分
        Map<String, Double> compositeScores = calculateCompositeScores(serviceWeights, businessValues);
        
        // 按综合得分排序
        List<Map.Entry<String, Double>> sortedServices = compositeScores.entrySet()
            .stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .collect(Collectors.toList());
        
        // 计算总得分
        double totalScore = sortedServices.stream()
            .mapToDouble(Map.Entry::getValue)
            .sum();
        
        // 按得分比例分配配额
        for (Map.Entry<String, Double> entry : sortedServices) {
            String serviceName = entry.getKey();
            double score = entry.getValue();
            
            // 计算分配配额
            long allocatedQuota = Math.round(remainingQuota * score / totalScore);
            
            // 确保至少分配最小配额
            allocatedQuota = Math.max(allocatedQuota, getMinimumQuota(serviceName));
            
            // 确保不超过剩余配额
            allocatedQuota = Math.min(allocatedQuota, remainingQuota);
            
            // 创建服务配额对象
            ServiceQuota serviceQuota = new ServiceQuota();
            serviceQuota.setServiceName(serviceName);
            serviceQuota.setQuota(allocatedQuota);
            serviceQuota.setUsedQuota(0L);
            serviceQuota.setUsageRate(0.0);
            serviceQuota.setCreateTime(System.currentTimeMillis());
            serviceQuota.setLastUpdateTime(System.currentTimeMillis());
            
            allocations.put(serviceName, serviceQuota);
            remainingQuota -= allocatedQuota;
            
            // 如果剩余配额不足，停止分配
            if (remainingQuota <= 0) {
                break;
            }
        }
        
        // 如果还有剩余配额，分配给最高得分服务
        if (remainingQuota > 0 && !sortedServices.isEmpty()) {
            String highestScoreService = sortedServices.get(0).getKey();
            ServiceQuota highestQuota = allocations.get(highestScoreService);
            if (highestQuota != null) {
                highestQuota.setQuota(highestQuota.getQuota() + remainingQuota);
            }
        }
        
        return allocations;
    }
    
    /**
     * 计算业务价值
     */
    private Map<String, Double> calculateBusinessValues(List<ServiceInfo> services) {
        Map<String, Double> businessValues = new HashMap<>();
        
        for (ServiceInfo service : services) {
            double businessValue = businessValueCalculator.calculateBusinessValue(service);
            businessValues.put(service.getServiceName(), businessValue);
        }
        
        return businessValues;
    }
    
    /**
     * 计算综合得分
     */
    private Map<String, Double> calculateCompositeScores(Map<String, Double> serviceWeights,
                                                       Map<String, Double> businessValues) {
        Map<String, Double> compositeScores = new HashMap<>();
        
        for (String serviceName : serviceWeights.keySet()) {
            double weight = serviceWeights.getOrDefault(serviceName, 1.0);
            double businessValue = businessValues.getOrDefault(serviceName, 0.0);
            
            // 综合得分 = 权重 * 业务价值
            double compositeScore = weight * businessValue;
            compositeScores.put(serviceName, compositeScore);
        }
        
        return compositeScores;
    }
    
    /**
     * 获取最小配额
     */
    private long getMinimumQuota(String serviceName) {
        // 实现略
        return 100L;
    }
}

// 业务价值计算器
@Service
public class BusinessValueCalculator {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * 计算服务的业务价值
     */
    public double calculateBusinessValue(ServiceInfo service) {
        double businessValue = 1.0;
        
        // 基于收入贡献计算价值
        businessValue *= calculateRevenueContribution(service.getServiceName());
        
        // 基于用户影响计算价值
        businessValue *= calculateUserImpact(service.getServiceName());
        
        // 基于业务关键性计算价值
        businessValue *= calculateBusinessCriticality(service);
        
        // 基于市场竞争力计算价值
        businessValue *= calculateMarketCompetitiveness(service.getServiceName());
        
        return businessValue;
    }
    
    /**
     * 计算收入贡献
     */
    private double calculateRevenueContribution(String serviceName) {
        try {
            String key = "business_value:revenue:" + serviceName;
            String revenueStr = redisTemplate.opsForValue().get(key);
            if (revenueStr != null) {
                double revenue = Double.parseDouble(revenueStr);
                // 假设收入贡献价值按对数增长
                return Math.log10(revenue + 1);
            }
        } catch (Exception e) {
            log.warn("Failed to calculate revenue contribution for service: {}", serviceName, e);
        }
        return 1.0; // 默认值
    }
    
    /**
     * 计算用户影响
     */
    private double calculateUserImpact(String serviceName) {
        try {
            String key = "business_value:user_impact:" + serviceName;
            String userCountStr = redisTemplate.opsForValue().get(key);
            if (userCountStr != null) {
                long userCount = Long.parseLong(userCountStr);
                // 假设用户影响价值按平方根增长
                return Math.sqrt(userCount / 1000.0 + 1);
            }
        } catch (Exception e) {
            log.warn("Failed to calculate user impact for service: {}", serviceName, e);
        }
        return 1.0; // 默认值
    }
    
    /**
     * 计算业务关键性
     */
    private double calculateBusinessCriticality(ServiceInfo service) {
        switch (service.getServiceLevel()) {
            case CRITICAL:
                return 3.0;
            case HIGH:
                return 2.0;
            case MEDIUM:
                return 1.2;
            case LOW:
                return 0.8;
            default:
                return 1.0;
        }
    }
    
    /**
     * 计算市场竞争力
     */
    private double calculateMarketCompetitiveness(String serviceName) {
        try {
            String key = "business_value:competitiveness:" + serviceName;
            String competitivenessStr = redisTemplate.opsForValue().get(key);
            if (competitivenessStr != null) {
                double competitiveness = Double.parseDouble(competitivenessStr);
                // 竞争力值范围0-1，转换为1-2的价值倍数
                return 1.0 + competitiveness;
            }
        } catch (Exception e) {
            log.warn("Failed to calculate market competitiveness for service: {}", serviceName, e);
        }
        return 1.0; // 默认值
    }
}
```

### 3. 混合分配策略

在实际应用中，往往需要结合多种策略来实现最优的配额分配。

```java
// 混合配额分配策略
@Component
public class HybridAllocationStrategy implements QuotaAllocationStrategy {
    
    private final List<QuotaAllocationStrategy> strategies;
    private final List<Double> strategyWeights;
    
    public HybridAllocationStrategy(List<QuotaAllocationStrategy> strategies,
                                  List<Double> strategyWeights) {
        this.strategies = strategies;
        this.strategyWeights = strategyWeights;
        
        // 验证权重总和为1
        double totalWeight = strategyWeights.stream().mapToDouble(Double::doubleValue).sum();
        if (Math.abs(totalWeight - 1.0) > 0.001) {
            throw new IllegalArgumentException("Strategy weights must sum to 1.0");
        }
    }
    
    /**
     * 混合策略分配配额
     */
    @Override
    public Map<String, ServiceQuota> allocate(ClusterQuota clusterQuota,
                                            List<ServiceInfo> services,
                                            Map<String, Double> serviceWeights) {
        // 使用多个策略分别计算配额分配
        List<Map<String, ServiceQuota>> strategyResults = new ArrayList<>();
        
        for (QuotaAllocationStrategy strategy : strategies) {
            Map<String, ServiceQuota> result = strategy.allocate(clusterQuota, services, serviceWeights);
            strategyResults.add(result);
        }
        
        // 合并结果
        return mergeAllocationResults(strategyResults, strategyWeights);
    }
    
    /**
     * 合并分配结果
     */
    private Map<String, ServiceQuota> mergeAllocationResults(List<Map<String, ServiceQuota>> results,
                                                           List<Double> weights) {
        Map<String, ServiceQuota> mergedResult = new HashMap<>();
        
        if (results.isEmpty()) {
            return mergedResult;
        }
        
        // 获取所有服务名称
        Set<String> serviceNames = results.get(0).keySet();
        
        // 对每个服务计算加权平均配额
        for (String serviceName : serviceNames) {
            long weightedQuota = 0;
            
            for (int i = 0; i < results.size(); i++) {
                ServiceQuota quota = results.get(i).get(serviceName);
                if (quota != null) {
                    weightedQuota += quota.getQuota() * weights.get(i);
                }
            }
            
            // 创建合并后的配额对象
            ServiceQuota mergedQuota = new ServiceQuota();
            mergedQuota.setServiceName(serviceName);
            mergedQuota.setQuota(weightedQuota);
            mergedQuota.setUsedQuota(0L);
            mergedQuota.setUsageRate(0.0);
            mergedQuota.setCreateTime(System.currentTimeMillis());
            mergedQuota.setLastUpdateTime(System.currentTimeMillis());
            
            mergedResult.put(serviceName, mergedQuota);
        }
        
        return mergedResult;
    }
}

// 配额分配策略工厂
@Component
public class QuotaAllocationStrategyFactory {
    
    private final PriorityBasedAllocationStrategy priorityStrategy;
    private final BusinessValueBasedAllocationStrategy businessValueStrategy;
    private final UsageBasedAdjustmentStrategy usageAdjustmentStrategy;
    
    public QuotaAllocationStrategyFactory(PriorityBasedAllocationStrategy priorityStrategy,
                                        BusinessValueBasedAllocationStrategy businessValueStrategy,
                                        UsageBasedAdjustmentStrategy usageAdjustmentStrategy) {
        this.priorityStrategy = priorityStrategy;
        this.businessValueStrategy = businessValueStrategy;
        this.usageAdjustmentStrategy = usageAdjustmentStrategy;
    }
    
    /**
     * 创建配额分配策略
    