---
title: 分布式限流智能报警：规则频繁触发与Redis异常的实时告警机制
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed, alerting]
published: true
---

在分布式限流平台的运维过程中，及时发现和响应异常情况是保障系统稳定性的关键。智能报警机制作为平台的重要组成部分，能够在关键问题发生时第一时间通知相关人员，确保问题得到快速处理。本文将深入探讨分布式限流平台的智能报警设计，包括报警规则的定义、报警评估引擎的实现、多渠道通知机制以及报警的智能化处理。

## 智能报警的核心价值

### 1. 问题及时发现

智能报警机制能够在问题发生的第一时间发出通知，大大缩短了问题发现的时间。

```java
// 报警规则实体
@Entity
@Table(name = "alert_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 报警规则ID
    @Column(name = "rule_id", unique = true)
    private String ruleId;
    
    // 报警规则名称
    @Column(name = "rule_name")
    private String ruleName;
    
    // 报警类型
    @Column(name = "alert_type")
    @Enumerated(EnumType.STRING)
    private AlertType alertType;
    
    // 监控指标
    @Column(name = "metric")
    private String metric;
    
    // 比较操作符
    @Column(name = "operator")
    @Enumerated(EnumType.STRING)
    private ComparisonOperator operator;
    
    // 阈值
    @Column(name = "threshold")
    private Double threshold;
    
    // 持续时间（秒）
    @Column(name = "duration")
    private Integer duration;
    
    // 报警级别
    @Column(name = "level")
    @Enumerated(EnumType.STRING)
    private AlertLevel level;
    
    // 报警接收人
    @Column(name = "receivers")
    private String receivers; // JSON格式存储
    
    // 报警模板
    @Column(name = "template", columnDefinition = "TEXT")
    private String template;
    
    // 是否启用
    @Column(name = "enabled")
    private Boolean enabled = true;
    
    // 创建时间
    @Column(name = "create_time")
    private Long createTime;
    
    // 最后更新时间
    @Column(name = "last_update_time")
    private Long lastUpdateTime;
}

// 报警类型枚举
public enum AlertType {
    METRIC_THRESHOLD("指标阈值报警"),
    ANOMALY_DETECTION("异常检测报警"),
    HEARTBEAT("心跳报警"),
    COMPOSITE("复合报警");
    
    private final String description;
    
    AlertType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// 比较操作符枚举
public enum ComparisonOperator {
    GREATER_THAN("大于", ">"),
    LESS_THAN("小于", "<"),
    EQUAL("等于", "=="),
    NOT_EQUAL("不等于", "!="),
    GREATER_THAN_OR_EQUAL("大于等于", ">="),
    LESS_THAN_OR_EQUAL("小于等于", "<=");
    
    private final String description;
    private final String symbol;
    
    ComparisonOperator(String description, String symbol) {
        this.description = description;
        this.symbol = symbol;
    }
    
    public String getDescription() {
        return description;
    }
    
    public String getSymbol() {
        return symbol;
    }
}

// 报警级别枚举
public enum AlertLevel {
    INFO("信息", 1),
    WARNING("警告", 2),
    CRITICAL("严重", 3),
    EMERGENCY("紧急", 4);
    
    private final String description;
    private final int priority;
    
    AlertLevel(String description, int priority) {
        this.description = description;
        this.priority = priority;
    }
    
    public String getDescription() {
        return description;
    }
    
    public int getPriority() {
        return priority;
    }
}
```

### 2. 减少误报和漏报

通过合理的报警规则设计和智能评估机制，有效减少误报和漏报的情况。

### 3. 提升运维效率

智能报警机制能够自动处理常见的报警场景，减少人工干预，提升运维效率。

## 报警规则设计

### 1. 指标阈值报警

指标阈值报警是最常见的报警类型，当监控指标超过或低于设定阈值时触发报警。

```java
// 指标阈值报警规则
@Service
public class MetricThresholdAlertRuleService {
    
    private final AlertRuleRepository alertRuleRepository;
    private final MeterRegistry meterRegistry;
    private final ObjectMapper objectMapper;
    
    /**
     * 创建指标阈值报警规则
     */
    public AlertRule createMetricThresholdRule(MetricThresholdRuleRequest request) {
        // 验证请求参数
        validateMetricThresholdRequest(request);
        
        // 构建报警规则
        AlertRule alertRule = AlertRule.builder()
            .ruleId(generateRuleId())
            .ruleName(request.getRuleName())
            .alertType(AlertType.METRIC_THRESHOLD)
            .metric(request.getMetric())
            .operator(request.getOperator())
            .threshold(request.getThreshold())
            .duration(request.getDuration())
            .level(request.getLevel())
            .receivers(objectMapper.writeValueAsString(request.getReceivers()))
            .template(request.getTemplate())
            .enabled(true)
            .createTime(System.currentTimeMillis())
            .lastUpdateTime(System.currentTimeMillis())
            .build();
        
        // 保存报警规则
        return alertRuleRepository.save(alertRule);
    }
    
    /**
     * 更新指标阈值报警规则
     */
    public AlertRule updateMetricThresholdRule(String ruleId, 
                                             MetricThresholdRuleRequest request) {
        // 验证请求参数
        validateMetricThresholdRequest(request);
        
        // 获取现有规则
        AlertRule existingRule = alertRuleRepository.findByRuleId(ruleId);
        if (existingRule == null) {
            throw new AlertRuleNotFoundException("Alert rule not found: " + ruleId);
        }
        
        // 更新规则属性
        existingRule.setRuleName(request.getRuleName());
        existingRule.setMetric(request.getMetric());
        existingRule.setOperator(request.getOperator());
        existingRule.setThreshold(request.getThreshold());
        existingRule.setDuration(request.getDuration());
        existingRule.setLevel(request.getLevel());
        existingRule.setReceivers(objectMapper.writeValueAsString(request.getReceivers()));
        existingRule.setTemplate(request.getTemplate());
        existingRule.setLastUpdateTime(System.currentTimeMillis());
        
        // 保存更新后的规则
        return alertRuleRepository.save(existingRule);
    }
    
    /**
     * 验证指标阈值请求参数
     */
    private void validateMetricThresholdRequest(MetricThresholdRuleRequest request) {
        if (request.getRuleName() == null || request.getRuleName().isEmpty()) {
            throw new IllegalArgumentException("Rule name cannot be empty");
        }
        
        if (request.getMetric() == null || request.getMetric().isEmpty()) {
            throw new IllegalArgumentException("Metric cannot be empty");
        }
        
        if (request.getThreshold() == null) {
            throw new IllegalArgumentException("Threshold cannot be null");
        }
        
        if (request.getDuration() == null || request.getDuration() <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
        
        if (request.getReceivers() == null || request.getReceivers().isEmpty()) {
            throw new IllegalArgumentException("Receivers cannot be empty");
        }
    }
    
    /**
     * 生成规则ID
     */
    private String generateRuleId() {
        return "rule_" + UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * 获取所有指标阈值报警规则
     */
    public List<AlertRule> getAllMetricThresholdRules() {
        return alertRuleRepository.findByAlertType(AlertType.METRIC_THRESHOLD);
    }
    
    /**
     * 启用/禁用报警规则
     */
    public void toggleAlertRule(String ruleId, boolean enabled) {
        AlertRule rule = alertRuleRepository.findByRuleId(ruleId);
        if (rule != null) {
            rule.setEnabled(enabled);
            rule.setLastUpdateTime(System.currentTimeMillis());
            alertRuleRepository.save(rule);
        }
    }
}

// 指标阈值规则请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricThresholdRuleRequest {
    private String ruleName;
    private String metric;
    private ComparisonOperator operator;
    private Double threshold;
    private Integer duration;
    private AlertLevel level;
    private List<String> receivers;
    private String template;
}
```

### 2. 异常检测报警

异常检测报警通过机器学习或统计方法识别系统中的异常行为。

```java
// 异常检测报警规则
@Service
public class AnomalyDetectionAlertRuleService {
    
    private final AlertRuleRepository alertRuleRepository;
    private final AnomalyDetectionService anomalyDetectionService;
    private final ObjectMapper objectMapper;
    
    /**
     * 创建异常检测报警规则
     */
    public AlertRule createAnomalyDetectionRule(AnomalyDetectionRuleRequest request) {
        // 验证请求参数
        validateAnomalyDetectionRequest(request);
        
        // 构建报警规则
        AlertRule alertRule = AlertRule.builder()
            .ruleId(generateRuleId())
            .ruleName(request.getRuleName())
            .alertType(AlertType.ANOMALY_DETECTION)
            .metric(request.getMetric())
            .operator(ComparisonOperator.GREATER_THAN)
            .threshold(request.getAnomalyThreshold())
            .duration(request.getDetectionWindow())
            .level(request.getLevel())
            .receivers(objectMapper.writeValueAsString(request.getReceivers()))
            .template(request.getTemplate())
            .enabled(true)
            .createTime(System.currentTimeMillis())
            .lastUpdateTime(System.currentTimeMillis())
            .build();
        
        // 保存报警规则
        return alertRuleRepository.save(alertRule);
    }
    
    /**
     * 执行异常检测
     */
    public void performAnomalyDetection() {
        // 获取所有启用的异常检测规则
        List<AlertRule> rules = alertRuleRepository
            .findByAlertTypeAndEnabled(AlertType.ANOMALY_DETECTION, true);
        
        for (AlertRule rule : rules) {
            try {
                // 获取指标数据
                List<Double> metricData = getMetricData(rule.getMetric(), rule.getDuration());
                
                // 执行异常检测
                AnomalyDetectionResult result = anomalyDetectionService.detectAnomalies(
                    metricData, rule.getThreshold());
                
                // 如果检测到异常，触发报警
                if (result.isAnomalyDetected()) {
                    triggerAnomalyAlert(rule, result);
                }
            } catch (Exception e) {
                log.error("Failed to perform anomaly detection for rule: {}", rule.getRuleId(), e);
            }
        }
    }
    
    /**
     * 获取指标数据
     */
    private List<Double> getMetricData(String metric, int duration) {
        List<Double> data = new ArrayList<>();
        
        // 根据指标名称获取数据
        switch (metric) {
            case "rate_limit.block_rate":
                data = getBlockRateData(duration);
                break;
            case "redis.connection_usage":
                data = getRedisConnectionUsageData(duration);
                break;
            case "jvm.heap.memory.usage":
                data = getJvmMemoryUsageData(duration);
                break;
            default:
                data = getCustomMetricData(metric, duration);
                break;
        }
        
        return data;
    }
    
    private List<Double> getBlockRateData(int duration) {
        // 获取阻塞率数据
        return new ArrayList<>();
    }
    
    private List<Double> getRedisConnectionUsageData(int duration) {
        // 获取Redis连接使用率数据
        return new ArrayList<>();
    }
    
    private List<Double> getJvmMemoryUsageData(int duration) {
        // 获取JVM内存使用率数据
        return new ArrayList<>();
    }
    
    private List<Double> getCustomMetricData(String metric, int duration) {
        // 获取自定义指标数据
        return new ArrayList<>();
    }
    
    /**
     * 触发异常报警
     */
    private void triggerAnomalyAlert(AlertRule rule, AnomalyDetectionResult result) {
        try {
            // 构建报警事件
            AlertEvent alertEvent = AlertEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .ruleId(rule.getRuleId())
                .ruleName(rule.getRuleName())
                .level(rule.getLevel())
                .metric(rule.getMetric())
                .currentValue(result.getAnomalyScore())
                .threshold(rule.getThreshold())
                .timestamp(System.currentTimeMillis())
                .additionalInfo(objectMapper.writeValueAsString(result.getAnomalyDetails()))
                .build();
            
            // 发送报警通知
            alertNotificationService.sendAlert(rule, alertEvent);
            
            // 记录报警事件
            alertEventRepository.save(alertEvent);
            
            log.info("Anomaly alert triggered: {} - Anomaly score: {}, Threshold: {}", 
                    rule.getRuleName(), result.getAnomalyScore(), rule.getThreshold());
        } catch (Exception e) {
            log.error("Failed to trigger anomaly alert for rule: {}", rule.getRuleId(), e);
        }
    }
    
    /**
     * 验证异常检测请求参数
     */
    private void validateAnomalyDetectionRequest(AnomalyDetectionRuleRequest request) {
        if (request.getRuleName() == null || request.getRuleName().isEmpty()) {
            throw new IllegalArgumentException("Rule name cannot be empty");
        }
        
        if (request.getMetric() == null || request.getMetric().isEmpty()) {
            throw new IllegalArgumentException("Metric cannot be empty");
        }
        
        if (request.getAnomalyThreshold() == null || request.getAnomalyThreshold() <= 0) {
            throw new IllegalArgumentException("Anomaly threshold must be positive");
        }
        
        if (request.getDetectionWindow() == null || request.getDetectionWindow() <= 0) {
            throw new IllegalArgumentException("Detection window must be positive");
        }
        
        if (request.getReceivers() == null || request.getReceivers().isEmpty()) {
            throw new IllegalArgumentException("Receivers cannot be empty");
        }
    }
    
    private String generateRuleId() {
        return "rule_" + UUID.randomUUID().toString().replace("-", "");
    }
}

// 异常检测规则请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyDetectionRuleRequest {
    private String ruleName;
    private String metric;
    private Double anomalyThreshold;
    private Integer detectionWindow; // 检测窗口（秒）
    private AlertLevel level;
    private List<String> receivers;
    private String template;
}

// 异常检测结果
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyDetectionResult {
    private boolean anomalyDetected;
    private double anomalyScore;
    private Map<String, Object> anomalyDetails;
    private long timestamp;
}
```

### 3. 心跳报警

心跳报警用于检测系统组件的存活状态。

```java
// 心跳报警规则
@Service
public class HeartbeatAlertRuleService {
    
    private final AlertRuleRepository alertRuleRepository;
    private final HeartbeatService heartbeatService;
    private final ObjectMapper objectMapper;
    private final ScheduledExecutorService scheduler;
    
    public HeartbeatAlertRuleService(AlertRuleRepository alertRuleRepository,
                                   HeartbeatService heartbeatService) {
        this.alertRuleRepository = alertRuleRepository;
        this.heartbeatService = heartbeatService;
        this.scheduler = Executors.newScheduledThreadPool(1);
        
        // 启动心跳检查任务
        scheduler.scheduleAtFixedRate(this::checkHeartbeats, 0, 30, TimeUnit.SECONDS);
    }
    
    /**
     * 创建心跳报警规则
     */
    public AlertRule createHeartbeatRule(HeartbeatRuleRequest request) {
        // 验证请求参数
        validateHeartbeatRequest(request);
        
        // 构建报警规则
        AlertRule alertRule = AlertRule.builder()
            .ruleId(generateRuleId())
            .ruleName(request.getRuleName())
            .alertType(AlertType.HEARTBEAT)
            .metric("heartbeat:" + request.getComponentId())
            .operator(ComparisonOperator.LESS_THAN)
            .threshold((double) request.getTimeout())
            .duration(request.getTimeout())
            .level(request.getLevel())
            .receivers(objectMapper.writeValueAsString(request.getReceivers()))
            .template(request.getTemplate())
            .enabled(true)
            .createTime(System.currentTimeMillis())
            .lastUpdateTime(System.currentTimeMillis())
            .build();
        
        // 保存报警规则
        return alertRuleRepository.save(alertRule);
    }
    
    /**
     * 检查心跳状态
     */
    private void checkHeartbeats() {
        try {
            // 获取所有启用的心跳报警规则
            List<AlertRule> rules = alertRuleRepository
                .findByAlertTypeAndEnabled(AlertType.HEARTBEAT, true);
            
            for (AlertRule rule : rules) {
                checkHeartbeat(rule);
            }
        } catch (Exception e) {
            log.error("Failed to check heartbeats", e);
        }
    }
    
    /**
     * 检查单个组件的心跳状态
     */
    private void checkHeartbeat(AlertRule rule) {
        try {
            // 从指标名称中提取组件ID
            String componentId = extractComponentId(rule.getMetric());
            
            // 获取组件最后心跳时间
            Long lastHeartbeatTime = heartbeatService.getLastHeartbeatTime(componentId);
            
            if (lastHeartbeatTime == null) {
                // 组件从未发送过心跳
                triggerHeartbeatAlert(rule, "Component never sent heartbeat");
                return;
            }
            
            // 计算距离上次心跳的时间
            long timeSinceLastHeartbeat = System.currentTimeMillis() - lastHeartbeatTime;
            
            // 如果超过超时时间，触发报警
            if (timeSinceLastHeartbeat > rule.getDuration() * 1000L) {
                String message = String.format("Component %s heartbeat timeout: %d ms since last heartbeat", 
                                             componentId, timeSinceLastHeartbeat);
                triggerHeartbeatAlert(rule, message);
            }
        } catch (Exception e) {
            log.error("Failed to check heartbeat for rule: {}", rule.getRuleId(), e);
        }
    }
    
    /**
     * 触发心跳报警
     */
    private void triggerHeartbeatAlert(AlertRule rule, String message) {
        try {
            // 构建报警事件
            AlertEvent alertEvent = AlertEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .ruleId(rule.getRuleId())
                .ruleName(rule.getRuleName())
                .level(rule.getLevel())
                .metric(rule.getMetric())
                .currentValue(0.0) // 心跳报警不使用具体数值
                .threshold(rule.getThreshold())
                .timestamp(System.currentTimeMillis())
                .message(message)
                .build();
            
            // 发送报警通知
            alertNotificationService.sendAlert(rule, alertEvent);
            
            // 记录报警事件
            alertEventRepository.save(alertEvent);
            
            log.info("Heartbeat alert triggered: {} - {}", rule.getRuleName(), message);
        } catch (Exception e) {
            log.error("Failed to trigger heartbeat alert for rule: {}", rule.getRuleId(), e);
        }
    }
    
    /**
     * 从指标名称中提取组件ID
     */
    private String extractComponentId(String metric) {
        if (metric.startsWith("heartbeat:")) {
            return metric.substring("heartbeat:".length());
        }
        return metric;
    }
    
    /**
     * 验证心跳请求参数
     */
    private void validateHeartbeatRequest(HeartbeatRuleRequest request) {
        if (request.getRuleName() == null || request.getRuleName().isEmpty()) {
            throw new IllegalArgumentException("Rule name cannot be empty");
        }
        
        if (request.getComponentId() == null || request.getComponentId().isEmpty()) {
            throw new IllegalArgumentException("Component ID cannot be empty");
        }
        
        if (request.getTimeout() == null || request.getTimeout() <= 0) {
            throw new IllegalArgumentException("Timeout must be positive");
        }
        
        if (request.getReceivers() == null || request.getReceivers().isEmpty()) {
            throw new IllegalArgumentException("Receivers cannot be empty");
        }
    }
    
    private String generateRuleId() {
        return "rule_" + UUID.randomUUID().toString().replace("-", "");
    }
}

// 心跳规则请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeartbeatRuleRequest {
    private String ruleName;
    private String componentId;
    private Integer timeout; // 超时时间（秒）
    private AlertLevel level;
    private List<String> receivers;
    private String template;
}
```

## 报警评估引擎

### 1. 报警评估服务

报警评估服务负责定期评估监控指标，判断是否触发报警。

```java
// 报警评估引擎
@Service
public class AlertEvaluationEngine {
    
    private final AlertRuleRepository alertRuleRepository;
    private final MeterRegistry meterRegistry;
    private final AlertNotificationService alertNotificationService;
    private final AlertEventRepository alertEventRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ScheduledExecutorService scheduler;
    
    public AlertEvaluationEngine(AlertRuleRepository alertRuleRepository,
                               MeterRegistry meterRegistry,
                               AlertNotificationService alertNotificationService,
                               AlertEventRepository alertEventRepository,
                               RedisTemplate<String, String> redisTemplate) {
        this.alertRuleRepository = alertRuleRepository;
        this.meterRegistry = meterRegistry;
        this.alertNotificationService = alertNotificationService;
        this.alertEventRepository = alertEventRepository;
        this.redisTemplate = redisTemplate;
        this.scheduler = Executors.newScheduledThreadPool(2);
        
        // 启动报警评估任务
        scheduler.scheduleAtFixedRate(this::evaluateAlerts, 0, 10, TimeUnit.SECONDS);
    }
    
    /**
     * 评估报警规则
     */
    private void evaluateAlerts() {
        try {
            // 获取所有启用的报警规则
            List<AlertRule> alertRules = alertRuleRepository.findEnabledRules();
            
            for (AlertRule rule : alertRules) {
                evaluateAlertRule(rule);
            }
        } catch (Exception e) {
            log.error("Failed to evaluate alerts", e);
        }
    }
    
    /**
     * 评估单个报警规则
     */
    private void evaluateAlertRule(AlertRule rule) {
        try {
            // 检查规则是否在静默期
            if (isInSilencePeriod(rule)) {
                return;
            }
            
            // 获取指标值
            double currentValue = getCurrentMetricValue(rule.getMetric());
            
            // 检查是否满足报警条件
            if (meetsAlertCondition(currentValue, rule)) {
                // 检查是否已经触发过报警（避免重复报警）
                if (!isAlertAlreadyTriggered(rule)) {
                    // 触发报警
                    triggerAlert(rule, currentValue);
                }
            } else {
                // 检查是否需要恢复报警状态
                if (isAlertAlreadyTriggered(rule)) {
                    recoverAlert(rule);
                }
            }
        } catch (Exception e) {
            log.error("Failed to evaluate alert rule: {}", rule.getRuleId(), e);
        }
    }
    
    /**
     * 获取当前指标值
     */
    private double getCurrentMetricValue(String metric) {
        // 根据指标名称获取当前值
        switch (metric) {
            case "rate_limit.block_rate":
                return getBlockRate();
            case "rate_limit.qps":
                return getRateLimitQps();
            case "redis.connection_usage":
                return getRedisConnectionUsage();
            case "jvm.heap.memory.usage":
                return getJvmHeapMemoryUsage();
            case "system.cpu.usage":
                return getSystemCpuUsage();
            default:
                return getCustomMetricValue(metric);
        }
    }
    
    /**
     * 检查是否满足报警条件
     */
    private boolean meetsAlertCondition(double currentValue, AlertRule rule) {
        double threshold = rule.getThreshold();
        ComparisonOperator operator = rule.getOperator();
        
        switch (operator) {
            case GREATER_THAN:
                return currentValue > threshold;
            case LESS_THAN:
                return currentValue < threshold;
            case EQUAL:
                return Math.abs(currentValue - threshold) < 0.0001;
            case NOT_EQUAL:
                return Math.abs(currentValue - threshold) >= 0.0001;
            case GREATER_THAN_OR_EQUAL:
                return currentValue >= threshold;
            case LESS_THAN_OR_EQUAL:
                return currentValue <= threshold;
            default:
                return false;
        }
    }
    
    /**
     * 检查报警是否已经触发
     */
    private boolean isAlertAlreadyTriggered(AlertRule rule) {
        String key = "alert:triggered:" + rule.getRuleId();
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
    
    /**
     * 检查是否在静默期
     */
    private boolean isInSilencePeriod(AlertRule rule) {
        String key = "alert:silence:" + rule.getRuleId();
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
    
    /**
     * 触发报警
     */
    private void triggerAlert(AlertRule rule, double currentValue) {
        try {
            // 构建报警事件
            AlertEvent alertEvent = AlertEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .ruleId(rule.getRuleId())
                .ruleName(rule.getRuleName())
                .level(rule.getLevel())
                .metric(rule.getMetric())
                .currentValue(currentValue)
                .threshold(rule.getThreshold())
                .timestamp(System.currentTimeMillis())
                .build();
            
            // 发送报警通知
            alertNotificationService.sendAlert(rule, alertEvent);
            
            // 记录报警触发状态
            String triggeredKey = "alert:triggered:" + rule.getRuleId();
            redisTemplate.opsForValue().set(triggeredKey, "true", 
                                          rule.getDuration(), TimeUnit.SECONDS);
            
            // 设置静默期（避免频繁报警）
            String silenceKey = "alert:silence:" + rule.getRuleId();
            redisTemplate.opsForValue().set(silenceKey, "true", 
                                          getSilencePeriod(rule), TimeUnit.SECONDS);
            
            // 记录报警事件
            alertEventRepository.save(alertEvent);
            
            log.info("Alert triggered: {} - Current value: {}, Threshold: {}", 
                    rule.getRuleName(), currentValue, rule.getThreshold());
        } catch (Exception e) {
            log.error("Failed to trigger alert: {}", rule.getRuleId(), e);
        }
    }
    
    /**
     * 恢复报警状态
     */
    private void recoverAlert(AlertRule rule) {
        try {
            // 清除报警触发状态
            String triggeredKey = "alert:triggered:" + rule.getRuleId();
            redisTemplate.delete(triggeredKey);
            
            // 发送恢复通知
            alertNotificationService.sendRecoveryNotification(rule);
            
            log.info("Alert recovered: {}", rule.getRuleName());
        } catch (Exception e) {
            log.error("Failed to recover alert: {}", rule.getRuleId(), e);
        }
    }
    
    /**
     * 获取静默期
     */
    private int getSilencePeriod(AlertRule rule) {
        // 根据报警级别设置不同的静默期
        switch (rule.getLevel()) {
            case INFO:
                return 60; // 1分钟
            case WARNING:
                return 300; // 5分钟
            case CRITICAL:
                return 600; // 10分钟
            case EMERGENCY:
                return 1800; // 30分钟
            default:
                return 300; // 默认5分钟
        }
    }
    
    // 以下为辅助方法，具体实现省略
    private double getBlockRate() { return 0.0; }
    private double getRateLimitQps() { return 0.0; }
    private double getRedisConnectionUsage() { return 0.0; }
    private double getJvmHeapMemoryUsage() { return 0.0; }
    private double getSystemCpuUsage() { return 0.0; }
    private double getCustomMetricValue(String metric) { return 0.0; }
}
```

### 2. 报警事件管理

报警事件管理负责记录和管理所有的报警事件。

```java
// 报警事件实体
@Entity
@Table(name = "alert_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 事件ID
    @Column(name = "event_id", unique = true)
    private String eventId;
    
    // 报警规则ID
    @Column(name = "rule_id")
    private String ruleId;
    
    // 报警规则名称
    @Column(name = "rule_name")
    private String ruleName;
    
    // 报警级别
    @Column(name = "level")
    @Enumerated(EnumType.STRING)
    private AlertLevel level;
    
    // 监控指标
    @Column(name = "metric")
    private String metric;
    
    // 当前值
    @Column(name = "current_value")
    private Double currentValue;
    
    // 阈值
    @Column(name = "threshold")
    private Double threshold;
    
    // 事件时间戳
    @Column(name = "timestamp")
    private Long timestamp;
    
    // 报警消息
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    // 附加信息
    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;
    
    // 处理状态
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private AlertEventStatus status = AlertEventStatus.TRIGGERED;
    
    // 处理人
    @Column(name = "handler")
    private String handler;
    
    // 处理时间
    @Column(name = "handled_time")
    private Long handledTime;
    
    // 处理备注
    @Column(name = "handle_notes", columnDefinition = "TEXT")
    private String handleNotes;
}

// 报警事件状态枚举
public enum AlertEventStatus {
    TRIGGERED("已触发"),
    HANDLED("已处理"),
    RESOLVED("已解决"),
    IGNORED("已忽略");
    
    private final String description;
    
    AlertEventStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// 报警事件管理服务
@Service
public class AlertEventManagementService {
    
    private final AlertEventRepository alertEventRepository;
    private final AlertRuleRepository alertRuleRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 查询报警事件
     */
    public List<AlertEvent> queryAlertEvents(AlertEventQueryRequest request) {
        // 构建查询条件
        Specification<AlertEvent> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // 时间范围过滤
            if (request.getStartTime() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("timestamp"), request.getStartTime()));
            }
            if (request.getEndTime() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("timestamp"), request.getEndTime()));
            }
            
            // 报警级别过滤
            if (request.getLevels() != null && !request.getLevels().isEmpty()) {
                predicates.add(root.get("level").in(request.getLevels()));
            }
            
            // 报警规则过滤
            if (request.getRuleIds() != null && !request.getRuleIds().isEmpty()) {
                predicates.add(root.get("ruleId").in(request.getRuleIds()));
            }
            
            // 处理状态过滤
            if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(request.getStatuses()));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        // 执行查询
        Sort sort = Sort.by(Sort.Direction.DESC, "timestamp");
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        
        return alertEventRepository.findAll(spec, pageable).getContent();
    }
    
    /**
     * 获取报警事件统计
     */
    public AlertEventStatistics getAlertEventStatistics(AlertEventStatisticsRequest request) {
        AlertEventStatistics statistics = new AlertEventStatistics();
        
        // 获取时间范围内的报警事件
        List<AlertEvent> events = getAlertEventsInTimeRange(request.getStartTime(), 
                                                           request.getEndTime());
        
        // 统计各报警级别的事件数量
        Map<AlertLevel, Long> levelCounts = events.stream()
            .collect(Collectors.groupingBy(AlertEvent::getLevel, Collectors.counting()));
        statistics.setLevelCounts(levelCounts);
        
        // 统计各处理状态的事件数量
        Map<AlertEventStatus, Long> statusCounts = events.stream()
            .collect(Collectors.groupingBy(AlertEvent::getStatus, Collectors.counting()));
        statistics.setStatusCounts(statusCounts);
        
        // 统计各报警规则的事件数量
        Map<String, Long> ruleCounts = events.stream()
            .collect(Collectors.groupingBy(AlertEvent::getRuleId, Collectors.counting()));
        statistics.setRuleCounts(ruleCounts);
        
        // 计算平均响应时间
        double avgResponseTime = calculateAvgResponseTime(events);
        statistics.setAvgResponseTime(avgResponseTime);
        
        return statistics;
    }
    
    /**
     * 处理报警事件
     */
    public void handleAlertEvent(String eventId, AlertEventHandleRequest request) {
        AlertEvent event = alertEventRepository.findByEventId(eventId);
        if (event == null) {
            throw new AlertEventNotFoundException("Alert event not found: " + eventId);
        }
        
        // 更新事件状态
        event.setStatus(request.getStatus());
        event.setHandler(request.getHandler());
        event.setHandledTime(System.currentTimeMillis());
        event.setHandleNotes(request.getHandleNotes());
        
        // 保存更新
        alertEventRepository.save(event);
        
        log.info("Alert event handled: {} - Status: {}", eventId, request.getStatus());
    }
    
    /**
     * 批量处理报警事件
     */
    public void batchHandleAlertEvents(List<String> eventIds, AlertEventHandleRequest request) {
        for (String eventId : eventIds) {
            try {
                handleAlertEvent(eventId, request);
            } catch (Exception e) {
                log.error("Failed to handle alert event: {}", eventId, e);
            }
        }
    }
    
    private List<AlertEvent> getAlertEventsInTimeRange(Long startTime, Long endTime) {
        if (startTime == null && endTime == null) {
            return alertEventRepository.findAll();
        } else if (startTime == null) {
            return alertEventRepository.findByTimestampLessThanEqual(endTime);
        } else if (endTime == null) {
            return alertEventRepository.findByTimestampGreaterThanEqual(startTime);
        } else {
            return alertEventRepository.findByTimestampBetween(startTime, endTime);
        }
    }
    
    private double calculateAvgResponseTime(List<AlertEvent> events) {
        if (events.isEmpty()) {
            return 0.0;
        }
        
        long totalResponseTime = events.stream()
            .filter(event -> event.getHandledTime() != null)
            .mapToLong(event -> event.getHandledTime() - event.getTimestamp())
            .sum();
        
        long handledEventCount = events.stream()
            .filter(event -> event.getHandledTime() != null)
            .count();
        
        return handledEventCount > 0 ? (double) totalResponseTime / handledEventCount : 0.0;
    }
}

// 报警事件查询请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertEventQueryRequest {
    private Long startTime;
    private Long endTime;
    private List<AlertLevel> levels;
    private List<String> ruleIds;
    private List<AlertEventStatus> statuses;
    private int page = 0;
    private int size = 20;
}

// 报警事件统计请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertEventStatisticsRequest {
    private Long startTime;
    private Long endTime;
}

// 报警事件统计
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertEventStatistics {
    private Map<AlertLevel, Long> levelCounts;
    private Map<AlertEventStatus, Long> statusCounts;
    private Map<String, Long> ruleCounts;
    private double avgResponseTime;
}

// 报警事件处理请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertEventHandleRequest {
    private AlertEventStatus status;
    private String handler;
    private String handleNotes;
}
```

## 多渠道通知机制

### 1. 通知服务实现

通知服务负责通过多种渠道发送报警通知。

```java
// 报警通知服务
@Service
public class AlertNotificationService {
    
    private final EmailService emailService;
    private final SmsService smsService;
    private final WebhookService webhookService;
    private final WeChatService weChatService;
    private final DingTalkService dingTalkService;
    private final ObjectMapper objectMapper;
    
    /**
     * 发送报警通知
     */
    public void sendAlert(AlertRule rule, AlertEvent alertEvent) {
        try {
            // 获取接收人列表
            List<String> receivers = parseReceivers(rule.getReceivers());
            
            // 构建报警消息
            String message = buildAlertMessage(rule, alertEvent);
            alertEvent.setMessage(message);
            
            // 向所有接收人发送通知
            for (String receiver : receivers) {
                sendNotification(receiver, rule, alertEvent);
            }
        } catch (Exception e) {
            log.error("Failed to send alert notification for rule: {}", rule.getRuleId(), e);
        }
    }
    
    /**
     * 发送恢复通知
     */
    public void sendRecoveryNotification(AlertRule rule) {
        try {
            // 获取接收人列表
            List<String> receivers = parseReceivers(rule.getReceivers());
            
            // 构建恢复消息
            String message = buildRecoveryMessage(rule);
            
            // 向所有接收人发送恢复通知
            for (String receiver : receivers) {
                sendRecoveryNotification(receiver, rule, message);
            }
        } catch (Exception e) {
            log.error("Failed to send recovery notification for rule: {}", rule.getRuleId(), e);
        }
    }
    
    /**
     * 发送通知
     */
    private void sendNotification(String receiver, AlertRule rule, AlertEvent alertEvent) {
        try {
            if (isEmail(receiver)) {
                sendEmailAlert(receiver, rule, alertEvent);
            } else if (isPhoneNumber(receiver)) {
                sendSmsAlert(receiver, rule, alertEvent);
            } else if (isWebhookUrl(receiver)) {
                sendWebhookAlert(receiver, rule, alertEvent);
            } else if (isWeChatUser(receiver)) {
                sendWeChatAlert(receiver, rule, alertEvent);
            } else if (isDingTalkUser(receiver)) {
                sendDingTalkAlert(receiver, rule, alertEvent);
            } else {
                log.warn("Unknown receiver type: {}", receiver);
            }
        } catch (Exception e) {
            log.error("Failed to send notification to: {}", receiver, e);
        }
    }
    
    /**
     * 发送邮件报警
     */
    private void sendEmailAlert(String email, AlertRule rule, AlertEvent alertEvent) {
        try {
            String subject = buildAlertSubject(rule, alertEvent);
            emailService.sendEmail(email, subject, alertEvent.getMessage());
            log.info("Email alert sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send email alert to: {}", email, e);
        }
    }
    
    /**
     * 发送短信报警
     */
    private void sendSmsAlert(String phoneNumber, AlertRule rule, AlertEvent alertEvent) {
        try {
            smsService.sendSms(phoneNumber, alertEvent.getMessage());
            log.info("SMS alert sent to: {}", phoneNumber);
        } catch (Exception e) {
            log.error("Failed to send SMS alert to: {}", phoneNumber, e);
        }
    }
    
    /**
     * 发送Webhook报警
     */
    private void sendWebhookAlert(String webhookUrl, AlertRule rule, AlertEvent alertEvent) {
        try {
            webhookService.sendWebhook(webhookUrl, alertEvent);
            log.info("Webhook alert sent to: {}", webhookUrl);
        } catch (Exception e) {
            log.error("Failed to send webhook alert to: {}", webhookUrl, e);
        }
    }
    
    /**
     * 发送微信报警
     */
    private void sendWeChatAlert(String weChatUser, AlertRule rule, AlertEvent alertEvent) {
        try {
            weChatService.sendAlert(weChatUser, buildAlertMessage(rule, alertEvent));
            log.info("WeChat alert sent to: {}", weChatUser);
        } catch (Exception e) {
            log.error("Failed to send WeChat alert to: {}", weChatUser, e);
        }
    }
    
    /**
     * 发送钉钉报警
     */
    private void sendDingTalkAlert(String dingTalkUser, AlertRule rule, AlertEvent alertEvent) {
        try {
            dingTalkService.sendAlert(dingTalkUser, buildAlertMessage(rule, alertEvent));
            log.info("DingTalk alert sent to: {}", dingTalkUser);
        } catch (Exception e) {
            log.error("Failed to send DingTalk alert to: {}", dingTalkUser, e);
        }
    }
    
    /**
     * 构建报警主题
     */
    private String buildAlertSubject(AlertRule rule, AlertEvent alertEvent) {
        return String.format("[%s][%s] %s", 
                           alertEvent.getLevel().getDescription(),
                           rule.getRuleName(),
                           getAlertSummary(alertEvent));
    }
    
    /**
     * 构建报警消息
     */
    private String buildAlertMessage(AlertRule rule, AlertEvent alertEvent) {
        String template = rule.getTemplate();
        if (template == null || template.isEmpty()) {
            template = getDefaultAlertTemplate();
        }
        
        return template.replace("${ruleName}", rule.getRuleName())
                     .replace("${level}", alertEvent.getLevel().getDescription())
                     .replace("${metric}", rule.getMetric())
                     .replace("${currentValue}", formatValue(alertEvent.getCurrentValue()))
                     .replace("${threshold}", formatValue(alertEvent.getThreshold()))
                     .replace("${timestamp}", new Date(alertEvent.getTimestamp()).toString())
                     .replace("${message}", alertEvent.getMessage() != null ? alertEvent.getMessage() : "");
    }
    
    /**
     * 构建恢复消息
     */
    private String buildRecoveryMessage(AlertRule rule) {
        return String.format("【恢复通知】报警规则: %s\n时间: %s\n状态: 已恢复", 
                           rule.getRuleName(), new Date().toString());
    }
    
    /**
     * 获取报警摘要
     */
    private String getAlertSummary(AlertEvent alertEvent) {
        if (alertEvent.getMessage() != null && !alertEvent.getMessage().isEmpty()) {
            return alertEvent.getMessage();
        }
        
        return String.format("%s 异常，当前值: %s，阈值: %s", 
                           alertEvent.getMetric(),
                           formatValue(alertEvent.getCurrentValue()),
                           formatValue(alertEvent.getThreshold()));
    }
    
    /**
     * 格式化数值
     */
    private String formatValue(Double value) {
        if (value == null) {
            return "N/A";
        }
        return String.format("%.2f", value);
    }
    
    /**
     * 解析接收人列表
     */
    private List<String> parseReceivers(String receiversJson) {
        try {
            return objectMapper.readValue(receiversJson, 
                                        new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse receivers: {}", receiversJson, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 获取默认报警模板
     */
    private String getDefaultAlertTemplate() {
        return "报警规则: ${ruleName}\n" +
               "报警级别: ${level}\n" +
               "监控指标: ${metric}\n" +
               "当前值: ${currentValue}\n" +
               "阈值: ${threshold}\n" +
               "时间: ${timestamp}\n" +
               "详情: ${message}";
    }
    
    // 以下为辅助方法，用于判断接收人类型
    private boolean isEmail(String receiver) {
        return receiver.contains("@");
    }
    
    private boolean isPhoneNumber(String receiver) {
        return receiver.matches("^1[3-9]\\d{9}$");
    }
    
    private boolean isWebhookUrl(String receiver) {
        return receiver.startsWith("http://") || receiver.startsWith("https://");
    }
    
    private boolean isWeChatUser(String receiver) {
        return receiver.startsWith("wechat:");
    }
    
    private boolean isDingTalkUser(String receiver) {
        return receiver.startsWith("dingtalk:");
    }
}

// 邮件服务
@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}

// 短信服务
@Service
public class SmsService {
    
    public void sendSms(String phoneNumber, String content) {
        // 实现短信发送逻辑
        // 可以集成阿里云、腾讯云等短信服务
        log.info("Sending SMS to {}: {}", phoneNumber, content);
    }
}

// Webhook服务
@Service
public class WebhookService {
    
    private final RestTemplate restTemplate;
    
    public void sendWebhook(String url, AlertEvent alertEvent) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<AlertEvent> entity = new HttpEntity<>(alertEvent, headers);
            restTemplate.postForEntity(url, entity, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send webhook", e);
        }
    }
}

// 微信服务
@Service
public class WeChatService {
    
    public void sendAlert(String userId, String message) {
        // 实现微信报警发送逻辑
        // 可以集成企业微信API
        log.info("Sending WeChat alert to {}: {}", userId, message);
    }
}

// 钉钉服务
@Service
public class DingTalkService {
    
    public void sendAlert(String userId, String message) {
        // 实现钉钉报警发送逻辑
        // 可以集成钉钉机器人API
        log.info("Sending DingTalk alert to {}: {}", userId, message);
    }
}
```

### 2. 通知策略配置

通知策略配置允许用户定义不同场景下的通知方式。

```java
// 通知策略实体
@Entity
@Table(name = "notification_strategies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationStrategy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 策略名称
    @Column(name = "strategy_name")
    private String strategyName;
    
    // 报警级别
    @Column(name = "alert_level")
    @Enumerated(EnumType.STRING)
    private AlertLevel alertLevel;
    
    // 通知渠道
    @Column(name = "channels")
    private String channels; // JSON格式存储
    
    // 通知时间窗口
    @Column(name = "time_window")
    private String timeWindow; // JSON格式存储
    
    // 通知频率限制
    @Column(name = "frequency_limit")
    private Integer frequencyLimit; // 每小时最大通知次数
    
    // 是否启用
    @Column(name = "enabled")
    private Boolean enabled = true;
    
    // 创建时间
    @Column(name = "create_time")
    private Long createTime;
    
    // 最后更新时间
    @Column(name = "last_update_time")
    private Long lastUpdateTime;
}

// 通知策略服务
@Service
public class NotificationStrategyService {
    
    private final NotificationStrategyRepository notificationStrategyRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 创建通知策略
     */
    public NotificationStrategy createNotificationStrategy(NotificationStrategyRequest request) {
        validateNotificationStrategyRequest(request);
        
        NotificationStrategy strategy = NotificationStrategy.builder()
            .strategyName(request.getStrategyName())
            .alertLevel(request.getAlertLevel())
            .channels(objectMapper.writeValueAsString(request.getChannels()))
            .timeWindow(objectMapper.writeValueAsString(request.getTimeWindow()))
            .frequencyLimit(request.getFrequencyLimit())
            .enabled(true)
            .createTime(System.currentTimeMillis())
            .lastUpdateTime(System.currentTimeMillis())
            .build();
        
        return notificationStrategyRepository.save(strategy);
    }
    
    /**
     * 根据报警级别获取通知策略
     */
    public NotificationStrategy getStrategyByLevel(AlertLevel level) {
        return notificationStrategyRepository.findByAlertLevelAndEnabled(level, true);
    }
    
    /**
     * 应用通知策略
     */
    public List<String> applyNotificationStrategy(AlertLevel level, List<String> receivers) {
        NotificationStrategy strategy = getStrategyByLevel(level);
        if (strategy == null) {
            return receivers; // 使用默认接收人列表
        }
        
        // 根据策略过滤接收人
        List<String> filteredReceivers = filterReceiversByChannels(receivers, strategy);
        
        // 检查频率限制
        if (checkFrequencyLimit(strategy)) {
            return filteredReceivers;
        } else {
            log.warn("Notification frequency limit exceeded for level: {}", level);
            return new ArrayList<>(); // 超过频率限制，不发送通知
        }
    }
    
    /**
     * 根据通知渠道过滤接收人
     */
    private List<String> filterReceiversByChannels(List<String> receivers, 
                                                 NotificationStrategy strategy) {
        try {
            List<String> channels = objectMapper.readValue(strategy.getChannels(), 
                                                         new TypeReference<List<String>>() {});
            
            return receivers.stream()
                .filter(receiver -> isReceiverInChannels(receiver, channels))
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to filter receivers by channels", e);
            return receivers;
        }
    }
    
    /**
     * 检查接收人是否在指定的渠道中
     */
    private boolean isReceiverInChannels(String receiver, List<String> channels) {
        for (String channel : channels) {
            switch (channel.toLowerCase()) {
                case "email":
                    if (isEmail(receiver)) return true;
                    break;
                case "sms":
                    if (isPhoneNumber(receiver)) return true;
                    break;
                case "webhook":
                    if (isWebhookUrl(receiver)) return true;
                    break;
                case "wechat":
                    if (isWeChatUser(receiver)) return true;
                    break;
                case "dingtalk":
                    if (isDingTalkUser(receiver)) return true;
                    break;
                default:
                    // 自定义渠道
                    if (receiver.startsWith(channel + ":")) return true;
                    break;
            }
        }
        return false;
    }
    
    /**
     * 检查频率限制
     */
    private boolean checkFrequencyLimit(NotificationStrategy strategy) {
        if (strategy.getFrequencyLimit() == null || strategy.getFrequencyLimit() <= 0) {
            return true; // 无频率限制
        }
        
        String key = "notification:frequency:" + strategy.getAlertLevel();
        String countStr = redisTemplate.opsForValue().get(key);
        int currentCount = countStr != null ? Integer.parseInt(countStr) : 0;
        
        if (currentCount >= strategy.getFrequencyLimit()) {
            return false; // 超过频率限制
        }
        
        // 增加计数器
        redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 3600, TimeUnit.SECONDS); // 1小时过期
        
        return true;
    }
    
    private void validateNotificationStrategyRequest(NotificationStrategyRequest request) {
        if (request.getStrategyName() == null || request.getStrategyName().isEmpty()) {
            throw new IllegalArgumentException("Strategy name cannot be empty");
        }
        
        if (request.getAlertLevel() == null) {
            throw new IllegalArgumentException("Alert level cannot be null");
        }
        
        if (request.getChannels() == null || request.getChannels().isEmpty()) {
            throw new IllegalArgumentException("Channels cannot be empty");
        }
    }
}

// 通知策略请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationStrategyRequest {
    private String strategyName;
    private AlertLevel alertLevel;
    private List<String> channels;
    private Map<String, Object> timeWindow;
    private Integer frequencyLimit;
}
```

## 报警智能化处理

### 1. 报警聚合与抑制

报警聚合与抑制机制能够减少重复报警，提升报警处理效率。

```java
// 报警聚合服务
@Service
public class AlertAggregationService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ScheduledExecutorService scheduler;
    
    public AlertAggregationService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.scheduler = Executors.newScheduledThreadPool(1);
        
        // 启动报警聚合任务
        scheduler.scheduleAtFixedRate(this::aggregateAlerts, 0, 60, TimeUnit.SECONDS);
    }
    
    /**
     * 聚合相似报警
     */
    public void aggregateSimilarAlerts(AlertEvent alertEvent) {
        try {
            // 生成报警指纹
            String fingerprint = generateAlertFingerprint(alertEvent);
            
            // 检查是否已存在相似报警
            String key = "alert:aggregation:" + fingerprint;
            String existingAlertJson = redisTemplate.opsForValue().get(key);
            
            if (existingAlertJson != null) {
                // 存在相似报警，更新计数
                AlertAggregationInfo info = objectMapper.readValue(existingAlertJson, 
                                                                 AlertAggregationInfo.class);
                info.setCount(info.getCount() + 1);
                info.setLastUpdateTime(System.currentTimeMillis());
                
                // 更新Redis中的聚合信息
                redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(info), 
                                              3600, TimeUnit.SECONDS);
            } else {
                // 不存在相似报警，创建新的聚合信息
                AlertAggregationInfo info = AlertAggregationInfo.builder()
                    .alertEvent(alertEvent)
                    .count(1)
                    .firstOccurrenceTime(alertEvent.getTimestamp())
                    .lastUpdateTime(alertEvent.getTimestamp())
                    .build();
                
                // 存储到Redis中
                redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(info), 
                                              3600, TimeUnit.SECONDS);
            }
        } catch (Exception e) {
            log.error("Failed to aggregate similar alerts", e);
        }
    }
    
    /**
     * 生成报警指纹
     */
    private String generateAlertFingerprint(AlertEvent alertEvent) {
        // 基于报警规则ID、指标名称和报警级别生成指纹
        String fingerprint = alertEvent.getRuleId() + ":" + 
                           alertEvent.getMetric() + ":" + 
                           alertEvent.getLevel();
        
        return DigestUtils.md5Hex(fingerprint);
    }
    
    /**
     * 聚合报警处理
     */
    private void aggregateAlerts() {
        try {
            // 获取所有聚合的报警信息
            Set<String> keys = redisTemplate.keys("alert:aggregation:*");
            
            for (String key : keys) {
                try {
                    String alertJson = redisTemplate.opsForValue().get(key);
                    if (alertJson != null) {
                        AlertAggregationInfo info = objectMapper.readValue(alertJson, 
                                                                         AlertAggregationInfo.class);
                        
                        // 检查是否需要发送聚合报警
                        if (shouldSendAggregatedAlert(info)) {
                            sendAggregatedAlert(info);
                            
                            // 清除已处理的聚合信息
                            redisTemplate.delete(key);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to process aggregated alert for key: {}", key, e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to aggregate alerts", e);
        }
    }
    
    /**
     * 判断是否需要发送聚合报警
     */
    private boolean shouldSendAggregatedAlert(AlertAggregationInfo info) {
        // 如果聚合次数超过阈值，或者距离首次发生时间超过一定时间，则发送聚合报警
        return info.getCount() >= 5 || 
               (System.currentTimeMillis() - info.getFirstOccurrenceTime()) > 300000; // 5分钟
    }
    
    /**
     * 发送聚合报警
     */
    private void sendAggregatedAlert(AlertAggregationInfo info) {
        try {
            AlertEvent originalEvent = info.getAlertEvent();
            
            // 构建聚合报警消息
            String aggregatedMessage = String.format(
                "【聚合报警】相同类型的报警在%d秒内发生了%d次\n" +
                "首次发生时间: %s\n" +
                "最后发生时间: %s\n" +
                "原始报警信息: %s",
                (info.getLastUpdateTime() - info.getFirstOccurrenceTime()) / 1000,
                info.getCount(),
                new Date(info.getFirstOccurrenceTime()),
                new Date(info.getLastUpdateTime()),
                originalEvent.getMessage()
            );
            
            // 更新原始事件的消息
            originalEvent.setMessage(aggregatedMessage);
            
            // 发送聚合报警
            alertNotificationService.sendAlert(
                alertRuleRepository.findByRuleId(originalEvent.getRuleId()), 
                originalEvent);
            
            log.info("Aggregated alert sent: {} occurrences of {}", 
                    info.getCount(), originalEvent.getRuleName());
        } catch (Exception e) {
            log.error("Failed to send aggregated alert", e);
        }
    }
}

// 报警聚合信息
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertAggregationInfo {
    private AlertEvent alertEvent;
    private int count;
    private long firstOccurrenceTime;
    private long lastUpdateTime;
}
```

### 2. 报警自动处理

报警自动处理机制能够根据预定义的规则自动处理某些类型的报警。

```java
// 报警自动处理服务
@Service
public class AlertAutoHandlingService {
    
    private final AlertRuleRepository alertRuleRepository;
    private final AlertEventRepository alertEventRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ScheduledExecutorService scheduler;
    
    public AlertAutoHandlingService(AlertRuleRepository alertRuleRepository,
                                  AlertEventRepository alertEventRepository,
                                  RedisTemplate<String, String> redisTemplate) {
        this.alertRuleRepository = alertRuleRepository;
        this.alertEventRepository = alertEventRepository;
        this.redisTemplate = redisTemplate;
        this.scheduler = Executors.newScheduledThreadPool(1);
        
        // 启动自动处理任务
        scheduler.scheduleAtFixedRate(this::autoHandleAlerts, 0, 30, TimeUnit.SECONDS);
    }
    
    /**
     * 自动处理报警
     */
    private void autoHandleAlerts() {
        try {
            // 获取所有未处理的报警事件
            List<AlertEvent> unhandledEvents = alertEventRepository
                .findByStatus(AlertEventStatus.TRIGGERED);
            
            for (AlertEvent event : unhandledEvents) {
                autoHandleAlertEvent(event);
            }
        } catch (Exception e) {
            log.error("Failed to auto handle alerts", e);
        }
    }
    
    /**
     * 自动处理单个报警事件
     */
    private void autoHandleAlertEvent(AlertEvent event) {
        try {
            // 获取对应的报警规则
            AlertRule rule = alertRuleRepository.findByRuleId(event.getRuleId());
            if (rule == null) {
                return;
            }
            
            // 检查是否有自动处理规则
            AutoHandlingRule autoHandlingRule = getAutoHandlingRule(rule);
            if (autoHandlingRule == null) {
                return;
            }
            
            // 检查是否满足自动处理条件
            if (meetsAutoHandlingConditions(event, autoHandlingRule)) {
                // 执行自动处理
                executeAutoHandling(event, autoHandlingRule);
            }
        } catch (Exception e) {
            log.error("Failed to auto handle alert event: {}", event.getEventId(), e);
        }
    }
    
    /**
     * 获取自动处理规则
     */
    private AutoHandlingRule getAutoHandlingRule(AlertRule rule) {
        String key = "auto_handling_rule:" + rule.getRuleId();
        String ruleJson = redisTemplate.opsForValue().get(key);
        
        if (ruleJson != null) {
            try {
                return objectMapper.readValue(ruleJson, AutoHandlingRule.class);
            } catch (Exception e) {
                log.warn("Failed to parse auto handling rule for rule: {}", rule.getRuleId(), e);
            }
        }
        
        return null;
    }
    
    /**
     * 检查是否满足自动处理条件
     */
    private boolean meetsAutoHandlingConditions(AlertEvent event, 
                                              AutoHandlingRule autoHandlingRule) {
        // 检查报警持续时间
        long duration = System.currentTimeMillis() - event.getTimestamp();
        if (duration < autoHandlingRule.getMinDuration() * 1000L) {
            return false;
        }
        
        // 检查报警频率
        if (!checkAlertFrequency(event, autoHandlingRule)) {
            return false;
        }
        
        // 检查其他自定义条件
        return checkCustomConditions(event, autoHandlingRule);
    }
    
    /**
     * 检查报警频率
     */
    private boolean checkAlertFrequency(AlertEvent event, AutoHandlingRule autoHandlingRule) {
        String key = "alert_frequency:" + event.getRuleId();
        String countStr = redisTemplate.opsForValue().get(key);
        int count = countStr != null ? Integer.parseInt(countStr) : 0;
        
        return count >= autoHandlingRule.getMinFrequency();
    }
    
    /**
     * 检查自定义条件
     */
    private boolean checkCustomConditions(AlertEvent event, AutoHandlingRule autoHandlingRule) {
        // 这里可以实现更复杂的条件检查逻辑
        // 例如检查系统负载、资源使用情况等
        return true;
    }
    
    /**
     * 执行自动处理
     */
    private void executeAutoHandling(AlertEvent event, AutoHandlingRule autoHandlingRule) {
        try {
            // 执行自动处理动作
            switch (autoHandlingRule.getAction()) {
                case "scale_up":
                    executeScaleUpAction(event, autoHandlingRule);
                    break;
                case "scale_down":
                    executeScaleDownAction(event, autoHandlingRule);
                    break;
                case "restart_service":
                    executeRestartServiceAction(event, autoHandlingRule);
                    break;
                case "switch_to_backup":
                    executeSwitchToBackupAction(event, autoHandlingRule);
                    break;
                default:
                    log.warn("Unknown auto handling action: {}", autoHandlingRule.getAction());
                    return;
            }
            
            // 更新报警事件状态
            event.setStatus(AlertEventStatus.HANDLED);
            event.setHandler("AutoHandler");
            event.setHandledTime(System.currentTimeMillis());
            event.setHandleNotes("Automatically handled by " + autoHandlingRule.getAction());
            
            alertEventRepository.save(event);
            
            log.info("Alert auto handled: {} - Action: {}", 
                    event.getEventId(), autoHandlingRule.getAction());
        } catch (Exception e) {
            log.error("Failed to execute auto handling for event: {}", event.getEventId(), e);
        }
    }
    
    /**
     * 执行扩容动作
     */
    private void executeScaleUpAction(AlertEvent event, AutoHandlingRule autoHandlingRule) {
        // 实现扩容逻辑
        // 例如调用Kubernetes API增加Pod副本数
        log.info("Executing scale up action for alert: {}", event.getEventId());
    }
    
    /**
     * 执行缩容动作
     */
    private void executeScaleDownAction(AlertEvent event, AutoHandlingRule autoHandlingRule) {
        // 实现缩容逻辑
        log.info("Executing scale down action for alert: {}", event.getEventId());
    }
    
    /**
     * 执行重启服务动作
     */
    private void executeRestartServiceAction(AlertEvent event, AutoHandlingRule autoHandlingRule) {
        // 实现重启服务逻辑
        log.info("Executing restart service action for alert: {}", event.getEventId());
    }
    
    /**
     * 执行切换到备份动作
     */
    private void executeSwitchToBackupAction(AlertEvent event, AutoHandlingRule autoHandlingRule) {
        // 实现切换到备份逻辑
        log.info("Executing switch to backup action for alert: {}", event.getEventId());
    }
}

// 自动处理规则
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoHandlingRule {
    private String ruleId;
    private String action; // 自动处理动作
    private int minDuration; // 最小持续时间（秒）
    private int minFrequency; // 最小频率
    private Map<String, Object> conditions; // 其他条件
    private boolean enabled;
}
```

## 总结

智能报警机制是分布式限流平台稳定运行的重要保障，通过合理的报警规则设计、高效的评估引擎、多渠道的通知机制以及智能化的处理策略，能够有效提升系统的可维护性和稳定性。

关键要点包括：

1. **多样化的报警类型**：支持指标阈值、异常检测、心跳等多种报警类型，满足不同场景的需求。

2. **灵活的通知机制**：支持邮件、短信、Webhook、微信、钉钉等多种通知渠道，确保报警信息能够及时送达。

3. **智能化处理**：通过报警聚合、自动处理等机制，减少重复报警，提升处理效率。

4. **可配置性**：提供丰富的配置选项，允许用户根据实际需求定制报警策略。

在实际应用中，需要根据具体的业务场景和技术架构，合理设计报警规则和处理策略，避免报警风暴和漏报问题。同时，还需要持续优化报警算法，提升报警的准确性和及时性。

在后续章节中，我们将深入探讨分布式限流平台与链路追踪系统的集成实现。