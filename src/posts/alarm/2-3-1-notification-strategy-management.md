---
title: "通知策略管理: 分级、分时、升级策略的详细设计与实现"
date: 2025-08-30
categories: [Alarm]
tags: [alarm]
published: true
---
通知策略管理是智能报警平台的核心功能之一，它决定了告警信息如何、何时以及向谁发送。一个完善的通知策略管理体系能够确保关键告警及时传达给相关人员，同时避免信息过载对非关键告警的处理造成干扰。本文将深入探讨通知策略管理的核心要素，包括分级策略、分时策略和升级策略的设计与实现。

<!-- more -->

## 引言

在复杂的IT运维环境中，告警通知的有效性直接关系到故障响应的速度和业务连续性的保障。然而，不同类型的告警具有不同的重要性和紧急程度，对通知的要求也各不相同。如果所有告警都采用相同的处理方式，不仅会造成信息过载，还可能导致关键告警被忽视。

通知策略管理的目标是：
1. **精准分级**：根据告警的重要性和紧急程度进行合理分级
2. **智能分时**：根据时间因素调整通知策略，避免非工作时间干扰
3. **自动升级**：在规定时间内未得到响应时自动升级通知级别
4. **个性化配置**：支持不同团队和业务场景的定制化需求

## 分级策略设计

### 告警级别定义

#### 核心级别体系

一个有效的告警分级体系应该能够清晰地区分不同告警的重要性和紧急程度，通常采用四到五级的分级方式：

```java
// 告警级别枚举
public enum AlertLevel {
    CRITICAL(4, "critical", "严重", "需要立即响应的紧急问题", 0),
    HIGH(3, "high", "高", "需要尽快处理的重要问题", 5),
    MEDIUM(2, "medium", "中", "需要注意的问题", 15),
    LOW(1, "low", "低", "一般性通知", 60),
    INFO(0, "info", "信息", "仅供信息参考", 1440); // 24小时
    
    private final int priority;
    private final String level;
    private final String displayName;
    private final String description;
    private final int responseTimeMinutes;
    
    AlertLevel(int priority, String level, String displayName, 
               String description, int responseTimeMinutes) {
        this.priority = priority;
        this.level = level;
        this.displayName = displayName;
        this.description = description;
        this.responseTimeMinutes = responseTimeMinutes;
    }
    
    public int getPriority() { return priority; }
    public String getLevel() { return level; }
    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    public int getResponseTimeMinutes() { return responseTimeMinutes; }
    
    public static AlertLevel fromString(String level) {
        for (AlertLevel al : values()) {
            if (al.level.equalsIgnoreCase(level)) {
                return al;
            }
        }
        return MEDIUM; // 默认级别
    }
    
    public boolean isHigherThan(AlertLevel other) {
        return this.priority > other.priority;
    }
    
    public boolean isLowerThan(AlertLevel other) {
        return this.priority < other.priority;
    }
}
```

#### 级别评估标准

为了确保告警级别的准确性和一致性，需要建立明确的评估标准：

```java
// 告警级别评估器
@Service
public class AlertLevelEvaluator {
    
    public AlertLevel evaluateAlertLevel(AlertEvent event) {
        // 综合多个维度评估告警级别
        
        // 1. 业务影响评估
        int businessImpactScore = evaluateBusinessImpact(event);
        
        // 2. 用户影响评估
        int userImpactScore = evaluateUserImpact(event);
        
        // 3. 系统影响评估
        int systemImpactScore = evaluateSystemImpact(event);
        
        // 4. 历史模式评估
        int historyPatternScore = evaluateHistoryPattern(event);
        
        // 综合评分
        double compositeScore = (businessImpactScore * 0.4 + 
                               userImpactScore * 0.3 + 
                               systemImpactScore * 0.2 + 
                               historyPatternScore * 0.1);
        
        return determineLevelFromScore(compositeScore);
    }
    
    private int evaluateBusinessImpact(AlertEvent event) {
        String service = event.getLabels().get("service");
        String environment = event.getLabels().get("environment");
        
        // 业务重要性权重
        int serviceWeight = getServiceImportanceWeight(service);
        
        // 环境权重
        int environmentWeight = getEnvironmentWeight(environment);
        
        // 告警类型权重
        int alertTypeWeight = getAlertTypeWeight(event.getType());
        
        return serviceWeight + environmentWeight + alertTypeWeight;
    }
    
    private int evaluateUserImpact(AlertEvent event) {
        // 用户影响评估基于用户数量、影响范围等
        String service = event.getLabels().get("service");
        int userCount = getUserCountForService(service);
        
        // 用户数量影响权重
        if (userCount > 100000) return 20; // 大规模用户影响
        if (userCount > 10000) return 15;  // 中等规模用户影响
        if (userCount > 1000) return 10;   // 小规模用户影响
        return 5; // 有限用户影响
    }
    
    private int evaluateSystemImpact(AlertEvent event) {
        // 系统影响评估基于资源使用率、依赖关系等
        double value = event.getValue();
        String metricName = event.getMetricName();
        
        // CPU、内存、磁盘使用率等关键指标
        if (metricName.contains("cpu") || metricName.contains("memory")) {
            if (value > 95) return 20; // 严重资源不足
            if (value > 90) return 15; // 高资源使用
            if (value > 80) return 10; // 中等资源使用
        }
        
        // 网络相关指标
        if (metricName.contains("network") || metricName.contains("latency")) {
            if (value > 1000) return 15; // 高延迟
            if (value > 500) return 10;  // 中等延迟
        }
        
        return 5; // 一般影响
    }
    
    private int evaluateHistoryPattern(AlertEvent event) {
        // 历史模式评估基于告警频率、重复性等
        String metricName = event.getMetricName();
        String service = event.getLabels().get("service");
        
        // 获取最近一小时内的相同告警数量
        int recentCount = getRecentAlertCount(metricName, service, 3600000);
        
        if (recentCount > 100) return 15; // 频繁告警
        if (recentCount > 10) return 10;  // 较频繁告警
        if (recentCount > 1) return 5;    // 偶发告警
        return 0; // 首次告警
    }
    
    private AlertLevel determineLevelFromScore(double score) {
        if (score >= 40) return AlertLevel.CRITICAL;
        if (score >= 30) return AlertLevel.HIGH;
        if (score >= 20) return AlertLevel.MEDIUM;
        if (score >= 10) return AlertLevel.LOW;
        return AlertLevel.INFO;
    }
    
    private int getServiceImportanceWeight(String service) {
        // 根据业务重要性定义服务权重
        switch (service) {
            case "payment-service": return 20; // 支付服务
            case "user-service": return 15;    // 用户服务
            case "order-service": return 15;   // 订单服务
            case "api-gateway": return 10;     // API网关
            default: return 5;                 // 其他服务
        }
    }
    
    private int getEnvironmentWeight(String environment) {
        // 根据环境重要性定义权重
        switch (environment) {
            case "production": return 10;  // 生产环境
            case "staging": return 5;      // 预发布环境
            case "testing": return 2;      // 测试环境
            default: return 1;             // 开发环境
        }
    }
    
    private int getAlertTypeWeight(String alertType) {
        // 根据告警类型定义权重
        switch (alertType) {
            case "availability": return 15;   // 可用性告警
            case "performance": return 10;    // 性能告警
            case "security": return 12;       // 安全告警
            case "resource": return 8;        // 资源告警
            default: return 5;                // 其他告警
        }
    }
    
    private int getUserCountForService(String service) {
        // 获取服务的用户数量（简化实现）
        // 实际应用中需要从用户管理系统获取
        return 10000; // 默认值
    }
    
    private int getRecentAlertCount(String metricName, String service, long timeWindowMs) {
        // 获取最近时间窗口内的告警数量（简化实现）
        // 实际应用中需要查询告警历史
        return 5; // 默认值
    }
}
```

### 级别配置管理

```java
// 级别配置管理器
@Service
public class AlertLevelConfigurationManager {
    private final Map<String, AlertLevelConfig> levelConfigs = new ConcurrentHashMap<>();
    private final AlertLevelEvaluator levelEvaluator;
    
    public AlertLevelConfigurationManager(AlertLevelEvaluator levelEvaluator) {
        this.levelEvaluator = levelEvaluator;
        initializeDefaultConfigurations();
    }
    
    private void initializeDefaultConfigurations() {
        // 严重级别配置
        AlertLevelConfig criticalConfig = new AlertLevelConfig();
        criticalConfig.setLevel(AlertLevel.CRITICAL);
        criticalConfig.setNotificationChannels(Arrays.asList(
            NotificationChannel.EMAIL,
            NotificationChannel.SMS,
            NotificationChannel.PHONE,
            NotificationChannel.SLACK
        ));
        criticalConfig.setResponseTimeMinutes(5);
        criticalConfig.setEscalationEnabled(true);
        criticalConfig.setEscalationTimeoutMinutes(10);
        levelConfigs.put("critical", criticalConfig);
        
        // 高级别配置
        AlertLevelConfig highConfig = new AlertLevelConfig();
        highConfig.setLevel(AlertLevel.HIGH);
        highConfig.setNotificationChannels(Arrays.asList(
            NotificationChannel.EMAIL,
            NotificationChannel.SMS,
            NotificationChannel.SLACK
        ));
        highConfig.setResponseTimeMinutes(15);
        highConfig.setEscalationEnabled(true);
        highConfig.setEscalationTimeoutMinutes(30);
        levelConfigs.put("high", highConfig);
        
        // 中级别配置
        AlertLevelConfig mediumConfig = new AlertLevelConfig();
        mediumConfig.setLevel(AlertLevel.MEDIUM);
        mediumConfig.setNotificationChannels(Arrays.asList(
            NotificationChannel.EMAIL,
            NotificationChannel.SLACK
        ));
        mediumConfig.setResponseTimeMinutes(60);
        mediumConfig.setEscalationEnabled(false);
        levelConfigs.put("medium", mediumConfig);
        
        // 低级别配置
        AlertLevelConfig lowConfig = new AlertLevelConfig();
        lowConfig.setLevel(AlertLevel.LOW);
        lowConfig.setNotificationChannels(Arrays.asList(
            NotificationChannel.EMAIL
        ));
        lowConfig.setResponseTimeMinutes(1440); // 24小时
        lowConfig.setEscalationEnabled(false);
        levelConfigs.put("low", lowConfig);
    }
    
    public AlertLevelConfig getLevelConfig(AlertLevel level) {
        return levelConfigs.get(level.getLevel());
    }
    
    public AlertLevelConfig getLevelConfig(String level) {
        return levelConfigs.get(level.toLowerCase());
    }
    
    public void updateLevelConfig(String level, AlertLevelConfig config) {
        levelConfigs.put(level.toLowerCase(), config);
    }
    
    public AlertLevel evaluateAndConfigureAlert(AlertEvent event) {
        // 评估告警级别
        AlertLevel level = levelEvaluator.evaluateAlertLevel(event);
        
        // 获取级别配置
        AlertLevelConfig config = getLevelConfig(level);
        
        // 应用配置到告警事件
        event.setLevel(level);
        event.setExpectedResponseTimeMinutes(config.getResponseTimeMinutes());
        
        return level;
    }
    
    // 级别配置类
    public static class AlertLevelConfig {
        private AlertLevel level;
        private List<NotificationChannel> notificationChannels;
        private int responseTimeMinutes;
        private boolean escalationEnabled;
        private int escalationTimeoutMinutes;
        private Map<String, Object> customProperties;
        
        // getters and setters
        public AlertLevel getLevel() { return level; }
        public void setLevel(AlertLevel level) { this.level = level; }
        public List<NotificationChannel> getNotificationChannels() { return notificationChannels; }
        public void setNotificationChannels(List<NotificationChannel> notificationChannels) { this.notificationChannels = notificationChannels; }
        public int getResponseTimeMinutes() { return responseTimeMinutes; }
        public void setResponseTimeMinutes(int responseTimeMinutes) { this.responseTimeMinutes = responseTimeMinutes; }
        public boolean isEscalationEnabled() { return escalationEnabled; }
        public void setEscalationEnabled(boolean escalationEnabled) { this.escalationEnabled = escalationEnabled; }
        public int getEscalationTimeoutMinutes() { return escalationTimeoutMinutes; }
        public void setEscalationTimeoutMinutes(int escalationTimeoutMinutes) { this.escalationTimeoutMinutes = escalationTimeoutMinutes; }
        public Map<String, Object> getCustomProperties() { return customProperties; }
        public void setCustomProperties(Map<String, Object> customProperties) { this.customProperties = customProperties; }
    }
}
```

## 分时策略实现

### 时间窗口管理

#### 工作时间定义

```java
// 工作时间配置管理器
@Service
public class WorkTimeConfigurationManager {
    private final Map<String, WorkTimeConfig> workTimeConfigs = new ConcurrentHashMap<>();
    
    public WorkTimeConfigurationManager() {
        initializeDefaultWorkTimeConfig();
    }
    
    private void initializeDefaultWorkTimeConfig() {
        WorkTimeConfig defaultConfig = new WorkTimeConfig();
        defaultConfig.setTimezone("Asia/Shanghai");
        defaultConfig.setWorkDays(Arrays.asList(1, 2, 3, 4, 5)); // 周一到周五
        defaultConfig.setWorkStartTime("09:00");
        defaultConfig.setWorkEndTime("18:00");
        defaultConfig.setHolidays(Arrays.asList("2025-01-01", "2025-02-10")); // 示例假期
        workTimeConfigs.put("default", defaultConfig);
    }
    
    public boolean isWorkTime(long timestamp, String teamId) {
        WorkTimeConfig config = workTimeConfigs.getOrDefault(teamId, 
            workTimeConfigs.get("default"));
        return isWorkTimeInternal(timestamp, config);
    }
    
    private boolean isWorkTimeInternal(long timestamp, WorkTimeConfig config) {
        try {
            // 设置时区
            TimeZone timezone = TimeZone.getTimeZone(config.getTimezone());
            Calendar calendar = Calendar.getInstance(timezone);
            calendar.setTimeInMillis(timestamp);
            
            // 检查是否为假期
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            dateFormat.setTimeZone(timezone);
            String dateStr = dateFormat.format(new Date(timestamp));
            if (config.getHolidays().contains(dateStr)) {
                return false; // 假期不工作
            }
            
            // 检查是否为工作日
            int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
            // Calendar中周日是1，周一是2，...周六是7
            int workDay = dayOfWeek == 1 ? 7 : dayOfWeek - 1; // 转换为周一=1，周日=7
            if (!config.getWorkDays().contains(workDay)) {
                return false; // 非工作日
            }
            
            // 检查是否在工作时间内
            int hour = calendar.get(Calendar.HOUR_OF_DAY);
            int minute = calendar.get(Calendar.MINUTE);
            int currentTimeMinutes = hour * 60 + minute;
            
            String[] startParts = config.getWorkStartTime().split(":");
            int startHour = Integer.parseInt(startParts[0]);
            int startMinute = Integer.parseInt(startParts[1]);
            int startTimeMinutes = startHour * 60 + startMinute;
            
            String[] endParts = config.getWorkEndTime().split(":");
            int endHour = Integer.parseInt(endParts[0]);
            int endMinute = Integer.parseInt(endParts[1]);
            int endTimeMinutes = endHour * 60 + endMinute;
            
            return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
        } catch (Exception e) {
            logger.error("Failed to check work time", e);
            return true; // 出错时默认为工作时间
        }
    }
    
    public WorkTimeConfig getWorkTimeConfig(String teamId) {
        return workTimeConfigs.getOrDefault(teamId, workTimeConfigs.get("default"));
    }
    
    public void updateWorkTimeConfig(String teamId, WorkTimeConfig config) {
        workTimeConfigs.put(teamId, config);
    }
    
    // 工作时间配置类
    public static class WorkTimeConfig {
        private String timezone;
        private List<Integer> workDays; // 1=周一, 2=周二, ..., 7=周日
        private String workStartTime; // HH:mm格式
        private String workEndTime;   // HH:mm格式
        private List<String> holidays; // yyyy-MM-dd格式的假期列表
        
        // getters and setters
        public String getTimezone() { return timezone; }
        public void setTimezone(String timezone) { this.timezone = timezone; }
        public List<Integer> getWorkDays() { return workDays; }
        public void setWorkDays(List<Integer> workDays) { this.workDays = workDays; }
        public String getWorkStartTime() { return workStartTime; }
        public void setWorkStartTime(String workStartTime) { this.workStartTime = workStartTime; }
        public String getWorkEndTime() { return workEndTime; }
        public void setWorkEndTime(String workEndTime) { this.workEndTime = workEndTime; }
        public List<String> getHolidays() { return holidays; }
        public void setHolidays(List<String> holidays) { this.holidays = holidays; }
    }
}
```

#### 分时通知策略

```java
// 分时通知策略管理器
@Service
public class TimeBasedNotificationStrategyManager {
    private final WorkTimeConfigurationManager workTimeManager;
    private final AlertLevelConfigurationManager levelConfigManager;
    
    public TimeBasedNotificationStrategyManager(
            WorkTimeConfigurationManager workTimeManager,
            AlertLevelConfigurationManager levelConfigManager) {
        this.workTimeManager = workTimeManager;
        this.levelConfigManager = levelConfigManager;
    }
    
    public NotificationStrategy determineNotificationStrategy(AlertEvent event, String teamId) {
        long currentTime = System.currentTimeMillis();
        boolean isWorkTime = workTimeManager.isWorkTime(currentTime, teamId);
        AlertLevel level = event.getLevel();
        
        // 获取基础级别配置
        AlertLevelConfigurationManager.AlertLevelConfig baseConfig = 
            levelConfigManager.getLevelConfig(level);
        
        // 根据是否为工作时间调整通知策略
        NotificationStrategy strategy = new NotificationStrategy();
        strategy.setLevel(level);
        
        if (isWorkTime) {
            // 工作时间使用标准策略
            strategy.setChannels(baseConfig.getNotificationChannels());
            strategy.setUrgency(NotificationUrgency.NORMAL);
        } else {
            // 非工作时间调整策略
            strategy.setChannels(adjustChannelsForOffHours(
                baseConfig.getNotificationChannels(), level));
            strategy.setUrgency(determineOffHoursUrgency(level));
        }
        
        // 设置其他策略参数
        strategy.setResponseTimeMinutes(baseConfig.getResponseTimeMinutes());
        strategy.setEscalationEnabled(baseConfig.isEscalationEnabled());
        strategy.setEscalationTimeoutMinutes(baseConfig.getEscalationTimeoutMinutes());
        
        return strategy;
    }
    
    private List<NotificationChannel> adjustChannelsForOffHours(
            List<NotificationChannel> baseChannels, AlertLevel level) {
        List<NotificationChannel> adjustedChannels = new ArrayList<>(baseChannels);
        
        switch (level) {
            case CRITICAL:
                // 严重级别在非工作时间增加电话通知
                if (!adjustedChannels.contains(NotificationChannel.PHONE)) {
                    adjustedChannels.add(NotificationChannel.PHONE);
                }
                break;
            case HIGH:
                // 高级别在非工作时间保持所有通知渠道
                break;
            case MEDIUM:
                // 中级别在非工作时间减少通知渠道
                adjustedChannels.removeIf(channel -> 
                    channel == NotificationChannel.SMS || channel == NotificationChannel.PHONE);
                break;
            case LOW:
            case INFO:
                // 低级别和信息级别在非工作时间只保留邮件
                adjustedChannels.retainAll(Arrays.asList(NotificationChannel.EMAIL));
                break;
        }
        
        return adjustedChannels;
    }
    
    private NotificationUrgency determineOffHoursUrgency(AlertLevel level) {
        // 在非工作时间调整紧急程度
        switch (level) {
            case CRITICAL:
                return NotificationUrgency.HIGH; // 仍然保持高紧急程度
            case HIGH:
                return NotificationUrgency.NORMAL; // 降低紧急程度
            default:
                return NotificationUrgency.LOW; // 其他级别进一步降低
        }
    }
    
    // 通知策略类
    public static class NotificationStrategy {
        private AlertLevel level;
        private List<NotificationChannel> channels;
        private NotificationUrgency urgency;
        private int responseTimeMinutes;
        private boolean escalationEnabled;
        private int escalationTimeoutMinutes;
        
        // getters and setters
        public AlertLevel getLevel() { return level; }
        public void setLevel(AlertLevel level) { this.level = level; }
        public List<NotificationChannel> getChannels() { return channels; }
        public void setChannels(List<NotificationChannel> channels) { this.channels = channels; }
        public NotificationUrgency getUrgency() { return urgency; }
        public void setUrgency(NotificationUrgency urgency) { this.urgency = urgency; }
        public int getResponseTimeMinutes() { return responseTimeMinutes; }
        public void setResponseTimeMinutes(int responseTimeMinutes) { this.responseTimeMinutes = responseTimeMinutes; }
        public boolean isEscalationEnabled() { return escalationEnabled; }
        public void setEscalationEnabled(boolean escalationEnabled) { this.escalationEnabled = escalationEnabled; }
        public int getEscalationTimeoutMinutes() { return escalationTimeoutMinutes; }
        public void setEscalationTimeoutMinutes(int escalationTimeoutMinutes) { this.escalationTimeoutMinutes = escalationTimeoutMinutes; }
    }
    
    // 通知紧急程度枚举
    public enum NotificationUrgency {
        LOW, NORMAL, HIGH, CRITICAL
    }
}
```

## 升级策略设计

### 升级机制实现

#### 升级规则定义

```java
// 告警升级管理器
@Service
public class AlertEscalationManager {
    private final Map<String, EscalationPolicy> escalationPolicies = new ConcurrentHashMap<>();
    private final NotificationService notificationService;
    private final AlertHistoryService alertHistoryService;
    private final ScheduledExecutorService escalationExecutor;
    
    public AlertEscalationManager(NotificationService notificationService,
                                AlertHistoryService alertHistoryService) {
        this.notificationService = notificationService;
        this.alertHistoryService = alertHistoryService;
        this.escalationExecutor = Executors.newScheduledThreadPool(10);
        initializeDefaultPolicies();
    }
    
    private void initializeDefaultPolicies() {
        // 严重级别升级策略
        EscalationPolicy criticalPolicy = new EscalationPolicy();
        criticalPolicy.setLevel(AlertLevel.CRITICAL);
        
        List<EscalationRule> criticalRules = new ArrayList<>();
        
        // 第一级：5分钟内未响应则升级
        EscalationRule level1 = new EscalationRule();
        level1.setLevel(1);
        level1.setTimeoutMinutes(5);
        level1.setRecipients(Arrays.asList("oncall-primary", "team-leads"));
        level1.setChannels(Arrays.asList(
            NotificationChannel.SMS, 
            NotificationChannel.PHONE,
            NotificationChannel.SLACK
        ));
        criticalRules.add(level1);
        
        // 第二级：再过10分钟未响应则再次升级
        EscalationRule level2 = new EscalationRule();
        level2.setLevel(2);
        level2.setTimeoutMinutes(15); // 总计15分钟
        level2.setRecipients(Arrays.asList("oncall-secondary", "managers"));
        level2.setChannels(Arrays.asList(
            NotificationChannel.PHONE,
            NotificationChannel.EMAIL,
            NotificationChannel.SLACK
        ));
        criticalRules.add(level2);
        
        // 第三级：再过15分钟未响应则最终升级
        EscalationRule level3 = new EscalationRule();
        level3.setLevel(3);
        level3.setTimeoutMinutes(30); // 总计30分钟
        level3.setRecipients(Arrays.asList("directors", "executives"));
        level3.setChannels(Arrays.asList(
            NotificationChannel.PHONE,
            NotificationChannel.EMAIL
        ));
        criticalRules.add(level3);
        
        criticalPolicy.setRules(criticalRules);
        escalationPolicies.put("critical", criticalPolicy);
        
        // 高级别升级策略
        EscalationPolicy highPolicy = new EscalationPolicy();
        highPolicy.setLevel(AlertLevel.HIGH);
        
        List<EscalationRule> highRules = new ArrayList<>();
        
        // 第一级：15分钟内未响应则升级
        EscalationRule highLevel1 = new EscalationRule();
        highLevel1.setLevel(1);
        highLevel1.setTimeoutMinutes(15);
        highLevel1.setRecipients(Arrays.asList("oncall-primary"));
        highLevel1.setChannels(Arrays.asList(
            NotificationChannel.SMS,
            NotificationChannel.EMAIL,
            NotificationChannel.SLACK
        ));
        highRules.add(highLevel1);
        
        // 第二级：再过30分钟未响应则升级
        EscalationRule highLevel2 = new EscalationRule();
        highLevel2.setLevel(2);
        highLevel2.setTimeoutMinutes(45); // 总计45分钟
        highLevel2.setRecipients(Arrays.asList("team-leads"));
        highLevel2.setChannels(Arrays.asList(
            NotificationChannel.EMAIL,
            NotificationChannel.SLACK
        ));
        highRules.add(highLevel2);
        
        highPolicy.setRules(highRules);
        escalationPolicies.put("high", highPolicy);
    }
    
    public void startEscalation(AlertEvent event) {
        AlertLevel level = event.getLevel();
        EscalationPolicy policy = escalationPolicies.get(level.getLevel());
        
        if (policy != null && policy.getRules() != null && !policy.getRules().isEmpty()) {
            // 为每个升级规则安排定时任务
            for (EscalationRule rule : policy.getRules()) {
                scheduleEscalation(event, rule);
            }
        }
    }
    
    private void scheduleEscalation(AlertEvent event, EscalationRule rule) {
        long delayMs = rule.getTimeoutMinutes() * 60 * 1000L;
        
        escalationExecutor.schedule(() -> {
            // 检查告警是否已解决
            if (!isAlertResolved(event.getId())) {
                // 检查是否已确认
                if (!isAlertAcknowledged(event.getId())) {
                    // 执行升级
                    executeEscalation(event, rule);
                }
            }
        }, delayMs, TimeUnit.MILLISECONDS);
    }
    
    private void executeEscalation(AlertEvent event, EscalationRule rule) {
        try {
            // 记录升级事件
            logEscalationEvent(event.getId(), rule.getLevel());
            
            // 发送升级通知
            sendEscalationNotification(event, rule);
            
            // 更新告警状态
            updateAlertEscalationStatus(event.getId(), rule.getLevel());
        } catch (Exception e) {
            logger.error("Failed to execute escalation for alert: " + event.getId(), e);
        }
    }
    
    private void sendEscalationNotification(AlertEvent event, EscalationRule rule) {
        EscalationNotification notification = new EscalationNotification();
        notification.setAlertId(event.getId());
        notification.setAlertEvent(event);
        notification.setEscalationLevel(rule.getLevel());
        notification.setRecipients(rule.getRecipients());
        notification.setChannels(rule.getChannels());
        notification.setReason("告警在规定时间内未得到响应");
        
        notificationService.sendEscalationNotification(notification);
    }
    
    private boolean isAlertResolved(String alertId) {
        // 检查告警是否已解决
        AlertEvent event = alertHistoryService.getAlertById(alertId);
        return event != null && event.isResolved();
    }
    
    private boolean isAlertAcknowledged(String alertId) {
        // 检查告警是否已确认
        AlertEvent event = alertHistoryService.getAlertById(alertId);
        return event != null && event.isAcknowledged();
    }
    
    private void logEscalationEvent(String alertId, int escalationLevel) {
        // 记录升级事件到历史记录
        alertHistoryService.recordEscalationEvent(alertId, escalationLevel, System.currentTimeMillis());
    }
    
    private void updateAlertEscalationStatus(String alertId, int escalationLevel) {
        // 更新告警的升级状态
        alertHistoryService.updateAlertEscalationLevel(alertId, escalationLevel);
    }
    
    public void cancelEscalation(String alertId) {
        // 取消告警的所有升级计划
        // 注意：ScheduledExecutorService没有直接取消特定任务的方法
        // 实际实现中可能需要维护任务引用映射
        logger.info("Escalation cancelled for alert: " + alertId);
    }
    
    // 升级策略类
    public static class EscalationPolicy {
        private AlertLevel level;
        private List<EscalationRule> rules;
        
        // getters and setters
        public AlertLevel getLevel() { return level; }
        public void setLevel(AlertLevel level) { this.level = level; }
        public List<EscalationRule> getRules() { return rules; }
        public void setRules(List<EscalationRule> rules) { this.rules = rules; }
    }
    
    // 升级规则类
    public static class EscalationRule {
        private int level;
        private int timeoutMinutes;
        private List<String> recipients;
        private List<NotificationChannel> channels;
        
        // getters and setters
        public int getLevel() { return level; }
        public void setLevel(int level) { this.level = level; }
        public int getTimeoutMinutes() { return timeoutMinutes; }
        public void setTimeoutMinutes(int timeoutMinutes) { this.timeoutMinutes = timeoutMinutes; }
        public List<String> getRecipients() { return recipients; }
        public void setRecipients(List<String> recipients) { this.recipients = recipients; }
        public List<NotificationChannel> getChannels() { return channels; }
        public void setChannels(List<NotificationChannel> channels) { this.channels = channels; }
    }
    
    // 升级通知类
    public static class EscalationNotification {
        private String alertId;
        private AlertEvent alertEvent;
        private int escalationLevel;
        private List<String> recipients;
        private List<NotificationChannel> channels;
        private String reason;
        
        // getters and setters
        public String getAlertId() { return alertId; }
        public void setAlertId(String alertId) { this.alertId = alertId; }
        public AlertEvent getAlertEvent() { return alertEvent; }
        public void setAlertEvent(AlertEvent alertEvent) { this.alertEvent = alertEvent; }
        public int getEscalationLevel() { return escalationLevel; }
        public void setEscalationLevel(int escalationLevel) { this.escalationLevel = escalationLevel; }
        public List<String> getRecipients() { return recipients; }
        public void setRecipients(List<String> recipients) { this.recipients = recipients; }
        public List<NotificationChannel> getChannels() { return channels; }
        public void setChannels(List<NotificationChannel> channels) { this.channels = channels; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
```

### 动态升级调整

```java
// 动态升级调整器
@Service
public class DynamicEscalationAdjuster {
    private final AlertEscalationManager escalationManager;
    private final AlertHistoryService alertHistoryService;
    private final TeamPerformanceAnalyzer teamPerformanceAnalyzer;
    
    public DynamicEscalationAdjuster(AlertEscalationManager escalationManager,
                                   AlertHistoryService alertHistoryService,
                                   TeamPerformanceAnalyzer teamPerformanceAnalyzer) {
        this.escalationManager = escalationManager;
        this.alertHistoryService = alertHistoryService;
        this.teamPerformanceAnalyzer = teamPerformanceAnalyzer;
    }
    
    public void adjustEscalationPolicyBasedOnPerformance(String teamId) {
        try {
            // 分析团队性能
            TeamPerformanceMetrics metrics = teamPerformanceAnalyzer.analyzeTeamPerformance(teamId);
            
            // 根据性能调整升级策略
            if (metrics.getAverageResponseTime() > 300000) { // 超过5分钟
                adjustForSlowResponse(teamId, metrics);
            } else if (metrics.getEscalationRate() > 0.3) { // 升级率超过30%
                adjustForHighEscalationRate(teamId, metrics);
            }
        } catch (Exception e) {
            logger.error("Failed to adjust escalation policy for team: " + teamId, e);
        }
    }
    
    private void adjustForSlowResponse(String teamId, TeamPerformanceMetrics metrics) {
        logger.info("Adjusting escalation policy for team {} due to slow response time: {}ms", 
                   teamId, metrics.getAverageResponseTime());
        
        // 可以采取的调整措施：
        // 1. 缩短升级时间
        // 2. 增加升级级别
        // 3. 调整通知渠道
        // 4. 发送性能提醒
    }
    
    private void adjustForHighEscalationRate(String teamId, TeamPerformanceMetrics metrics) {
        logger.info("Adjusting escalation policy for team {} due to high escalation rate: {}%", 
                   teamId, metrics.getEscalationRate() * 100);
        
        // 可以采取的调整措施：
        // 1. 延长升级时间
        // 2. 优化升级规则
        // 3. 提供培训建议
        // 4. 调整值班安排
    }
    
    public void adjustEscalationForSpecificAlert(AlertEvent event) {
        try {
            // 根据告警特征动态调整升级策略
            String service = event.getLabels().get("service");
            String environment = event.getLabels().get("environment");
            
            // 如果是核心服务的生产环境告警，加快升级
            if (isCoreService(service) && "production".equals(environment)) {
                accelerateEscalation(event);
            }
            
            // 如果是历史频繁告警，调整升级策略
            if (isFrequentAlert(event)) {
                adjustForFrequentAlert(event);
            }
        } catch (Exception e) {
            logger.error("Failed to adjust escalation for alert: " + event.getId(), e);
        }
    }
    
    private boolean isCoreService(String service) {
        // 定义核心服务列表
        Set<String> coreServices = Set.of("payment-service", "user-service", "api-gateway");
        return coreServices.contains(service);
    }
    
    private boolean isFrequentAlert(AlertEvent event) {
        // 检查是否为频繁告警
        String metricName = event.getMetricName();
        String service = event.getLabels().get("service");
        
        int recentCount = alertHistoryService.getRecentAlertCount(
            metricName, service, 3600000); // 最近1小时
        
        return recentCount > 10; // 1小时内超过10次
    }
    
    private void accelerateEscalation(AlertEvent event) {
        // 加快升级：缩短升级时间
        logger.info("Accelerating escalation for critical service alert: " + event.getId());
        // 实现加速逻辑
    }
    
    private void adjustForFrequentAlert(AlertEvent event) {
        // 调整频繁告警的升级策略
        logger.info("Adjusting escalation for frequent alert: " + event.getId());
        // 实现调整逻辑
    }
    
    // 团队性能指标类
    public static class TeamPerformanceMetrics {
        private double averageResponseTime;
        private double escalationRate;
        private int totalAlerts;
        private int resolvedAlerts;
        private int escalatedAlerts;
        
        // getters and setters
        public double getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        public double getEscalationRate() { return escalationRate; }
        public void setEscalationRate(double escalationRate) { this.escalationRate = escalationRate; }
        public int getTotalAlerts() { return totalAlerts; }
        public void setTotalAlerts(int totalAlerts) { this.totalAlerts = totalAlerts; }
        public int getResolvedAlerts() { return resolvedAlerts; }
        public void setResolvedAlerts(int resolvedAlerts) { this.resolvedAlerts = resolvedAlerts; }
        public int getEscalatedAlerts() { return escalatedAlerts; }
        public void setEscalatedAlerts(int escalatedAlerts) { this.escalatedAlerts = escalatedAlerts; }
    }
}
```

## 策略配置管理

### 配置中心实现

```java
// 通知策略配置中心
@Service
public class NotificationStrategyConfigurationCenter {
    private final Map<String, NotificationStrategyConfig> strategyConfigs = new ConcurrentHashMap<>();
    private final ConfigService configService;
    
    public NotificationStrategyConfigurationCenter(ConfigService configService) {
        this.configService = configService;
        loadConfigurations();
    }
    
    private void loadConfigurations() {
        try {
            // 从配置服务加载策略配置
            List<NotificationStrategyConfig> configs = configService.getAllNotificationStrategies();
            for (NotificationStrategyConfig config : configs) {
                strategyConfigs.put(config.getId(), config);
            }
        } catch (Exception e) {
            logger.error("Failed to load notification strategy configurations", e);
            // 加载默认配置
            loadDefaultConfigurations();
        }
    }
    
    private void loadDefaultConfigurations() {
        // 加载默认配置
        NotificationStrategyConfig defaultConfig = createDefaultConfiguration();
        strategyConfigs.put("default", defaultConfig);
    }
    
    private NotificationStrategyConfig createDefaultConfiguration() {
        NotificationStrategyConfig config = new NotificationStrategyConfig();
        config.setId("default");
        config.setName("默认通知策略");
        config.setDescription("系统默认的通知策略配置");
        
        // 定义各级别策略
        Map<AlertLevel, LevelStrategy> levelStrategies = new HashMap<>();
        
        // 严重级别策略
        LevelStrategy criticalStrategy = new LevelStrategy();
        criticalStrategy.setLevel(AlertLevel.CRITICAL);
        criticalStrategy.setChannels(Arrays.asList(
            NotificationChannel.EMAIL,
            NotificationChannel.SMS,
            NotificationChannel.PHONE,
            NotificationChannel.SLACK
        ));
        criticalStrategy.setWorkTimeResponseMinutes(5);
        criticalStrategy.setOffTimeResponseMinutes(10);
        criticalStrategy.setEscalationEnabled(true);
        levelStrategies.put(AlertLevel.CRITICAL, criticalStrategy);
        
        // 高级别策略
        LevelStrategy highStrategy = new LevelStrategy();
        highStrategy.setLevel(AlertLevel.HIGH);
        highStrategy.setChannels(Arrays.asList(
            NotificationChannel.EMAIL,
            NotificationChannel.SMS,
            NotificationChannel.SLACK
        ));
        highStrategy.setWorkTimeResponseMinutes(15);
        highStrategy.setOffTimeResponseMinutes(30);
        highStrategy.setEscalationEnabled(true);
        levelStrategies.put(AlertLevel.HIGH, highStrategy);
        
        // 中级别策略
        LevelStrategy mediumStrategy = new LevelStrategy();
        mediumStrategy.setLevel(AlertLevel.MEDIUM);
        mediumStrategy.setChannels(Arrays.asList(
            NotificationChannel.EMAIL,
            NotificationChannel.SLACK
        ));
        mediumStrategy.setWorkTimeResponseMinutes(60);
        mediumStrategy.setOffTimeResponseMinutes(120);
        mediumStrategy.setEscalationEnabled(false);
        levelStrategies.put(AlertLevel.MEDIUM, mediumStrategy);
        
        // 低级别策略
        LevelStrategy lowStrategy = new LevelStrategy();
        lowStrategy.setLevel(AlertLevel.LOW);
        lowStrategy.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        lowStrategy.setWorkTimeResponseMinutes(1440); // 24小时
        lowStrategy.setOffTimeResponseMinutes(2880); // 48小时
        lowStrategy.setEscalationEnabled(false);
        levelStrategies.put(AlertLevel.LOW, lowStrategy);
        
        config.setLevelStrategies(levelStrategies);
        
        // 定义升级策略
        Map<AlertLevel, EscalationConfig> escalationConfigs = new HashMap<>();
        
        // 严重级别升级配置
        EscalationConfig criticalEscalation = new EscalationConfig();
        criticalEscalation.setLevel(AlertLevel.CRITICAL);
        List<EscalationStep> criticalSteps = new ArrayList<>();
        
        EscalationStep step1 = new EscalationStep();
        step1.setStep(1);
        step1.setTimeoutMinutes(5);
        step1.setRecipients(Arrays.asList("oncall-primary"));
        step1.setChannels(Arrays.asList(NotificationChannel.SMS, NotificationChannel.PHONE));
        criticalSteps.add(step1);
        
        EscalationStep step2 = new EscalationStep();
        step2.setStep(2);
        step2.setTimeoutMinutes(15);
        step2.setRecipients(Arrays.asList("team-leads"));
        step2.setChannels(Arrays.asList(NotificationChannel.PHONE, NotificationChannel.EMAIL));
        criticalSteps.add(step2);
        
        criticalEscalation.setSteps(criticalSteps);
        escalationConfigs.put(AlertLevel.CRITICAL, criticalEscalation);
        
        config.setEscalationConfigs(escalationConfigs);
        
        return config;
    }
    
    public NotificationStrategyConfig getStrategyConfig(String configId) {
        return strategyConfigs.getOrDefault(configId, strategyConfigs.get("default"));
    }
    
    public LevelStrategy getLevelStrategy(String configId, AlertLevel level) {
        NotificationStrategyConfig config = getStrategyConfig(configId);
        return config.getLevelStrategies().get(level);
    }
    
    public EscalationConfig getEscalationConfig(String configId, AlertLevel level) {
        NotificationStrategyConfig config = getStrategyConfig(configId);
        return config.getEscalationConfigs().get(level);
    }
    
    public void updateStrategyConfig(String configId, NotificationStrategyConfig config) {
        strategyConfigs.put(configId, config);
        // 同步到配置服务
        configService.updateNotificationStrategy(configId, config);
    }
    
    // 通知策略配置类
    public static class NotificationStrategyConfig {
        private String id;
        private String name;
        private String description;
        private Map<AlertLevel, LevelStrategy> levelStrategies;
        private Map<AlertLevel, EscalationConfig> escalationConfigs;
        private boolean enabled;
        private String createdBy;
        private long createdAt;
        private long updatedAt;
        
        // getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Map<AlertLevel, LevelStrategy> getLevelStrategies() { return levelStrategies; }
        public void setLevelStrategies(Map<AlertLevel, LevelStrategy> levelStrategies) { this.levelStrategies = levelStrategies; }
        public Map<AlertLevel, EscalationConfig> getEscalationConfigs() { return escalationConfigs; }
        public void setEscalationConfigs(Map<AlertLevel, EscalationConfig> escalationConfigs) { this.escalationConfigs = escalationConfigs; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }
    }
    
    // 级别策略类
    public static class LevelStrategy {
        private AlertLevel level;
        private List<NotificationChannel> channels;
        private int workTimeResponseMinutes;
        private int offTimeResponseMinutes;
        private boolean escalationEnabled;
        
        // getters and setters
        public AlertLevel getLevel() { return level; }
        public void setLevel(AlertLevel level) { this.level = level; }
        public List<NotificationChannel> getChannels() { return channels; }
        public void setChannels(List<NotificationChannel> channels) { this.channels = channels; }
        public int getWorkTimeResponseMinutes() { return workTimeResponseMinutes; }
        public void setWorkTimeResponseMinutes(int workTimeResponseMinutes) { this.workTimeResponseMinutes = workTimeResponseMinutes; }
        public int getOffTimeResponseMinutes() { return offTimeResponseMinutes; }
        public void setOffTimeResponseMinutes(int offTimeResponseMinutes) { this.offTimeResponseMinutes = offTimeResponseMinutes; }
        public boolean isEscalationEnabled() { return escalationEnabled; }
        public void setEscalationEnabled(boolean escalationEnabled) { this.escalationEnabled = escalationEnabled; }
    }
    
    // 升级配置类
    public static class EscalationConfig {
        private AlertLevel level;
        private List<EscalationStep> steps;
        
        // getters and setters
        public AlertLevel getLevel() { return level; }
        public void setLevel(AlertLevel level) { this.level = level; }
        public List<EscalationStep> getSteps() { return steps; }
        public void setSteps(List<EscalationStep> steps) { this.steps = steps; }
    }
    
    // 升级步骤类
    public static class EscalationStep {
        private int step;
        private int timeoutMinutes;
        private List<String> recipients;
        private List<NotificationChannel> channels;
        
        // getters and setters
        public int getStep() { return step; }
        public void setStep(int step) { this.step = step; }
        public int getTimeoutMinutes() { return timeoutMinutes; }
        public void setTimeoutMinutes(int timeoutMinutes) { this.timeoutMinutes = timeoutMinutes; }
        public List<String> getRecipients() { return recipients; }
        public void setRecipients(List<String> recipients) { this.recipients = recipients; }
        public List<NotificationChannel> getChannels() { return channels; }
        public void setChannels(List<NotificationChannel> channels) { this.channels = channels; }
    }
}
```

### 策略应用引擎

```java
// 通知策略应用引擎
@Service
public class NotificationStrategyEngine {
    private final NotificationStrategyConfigurationCenter configCenter;
    private final WorkTimeConfigurationManager workTimeManager;
    private final AlertEscalationManager escalationManager;
    private final DynamicEscalationAdjuster dynamicAdjuster;
    
    public NotificationStrategyEngine(
            NotificationStrategyConfigurationCenter configCenter,
            WorkTimeConfigurationManager workTimeManager,
            AlertEscalationManager escalationManager,
            DynamicEscalationAdjuster dynamicAdjuster) {
        this.configCenter = configCenter;
        this.workTimeManager = workTimeManager;
        this.escalationManager = escalationManager;
        this.dynamicAdjuster = dynamicAdjuster;
    }
    
    public AppliedNotificationStrategy applyStrategy(AlertEvent event, String teamId) {
        try {
            // 获取策略配置
            String configId = determineConfigId(event, teamId);
            NotificationStrategyConfigurationCenter.NotificationStrategyConfig config = 
                configCenter.getStrategyConfig(configId);
            
            // 确定告警级别
            AlertLevel level = event.getLevel();
            
            // 获取级别策略
            NotificationStrategyConfigurationCenter.LevelStrategy levelStrategy = 
                configCenter.getLevelStrategy(configId, level);
            
            // 判断是否为工作时间
            long currentTime = System.currentTimeMillis();
            boolean isWorkTime = workTimeManager.isWorkTime(currentTime, teamId);
            
            // 应用分时策略
            AppliedNotificationStrategy appliedStrategy = new AppliedNotificationStrategy();
            appliedStrategy.setAlertId(event.getId());
            appliedStrategy.setLevel(level);
            appliedStrategy.setWorkTime(isWorkTime);
            
            if (isWorkTime) {
                appliedStrategy.setChannels(levelStrategy.getChannels());
                appliedStrategy.setExpectedResponseTimeMinutes(
                    levelStrategy.getWorkTimeResponseMinutes());
            } else {
                appliedStrategy.setChannels(
                    adjustChannelsForOffHours(levelStrategy.getChannels(), level));
                appliedStrategy.setExpectedResponseTimeMinutes(
                    levelStrategy.getOffTimeResponseMinutes());
            }
            
            // 设置升级策略
            if (levelStrategy.isEscalationEnabled()) {
                NotificationStrategyConfigurationCenter.EscalationConfig escalationConfig = 
                    configCenter.getEscalationConfig(configId, level);
                appliedStrategy.setEscalationConfig(escalationConfig);
                
                // 启动升级管理
                escalationManager.startEscalation(event);
            }
            
            // 动态调整升级策略
            dynamicAdjuster.adjustEscalationForSpecificAlert(event);
            
            return appliedStrategy;
        } catch (Exception e) {
            logger.error("Failed to apply notification strategy for alert: " + event.getId(), e);
            // 返回默认策略
            return createDefaultStrategy(event);
        }
    }
    
    private String determineConfigId(AlertEvent event, String teamId) {
        // 根据告警特征和团队确定使用的策略配置
        String service = event.getLabels().get("service");
        String environment = event.getLabels().get("environment");
        
        // 可以根据服务、环境等特征选择不同的配置
        if ("production".equals(environment)) {
            return "production_" + teamId;
        } else if ("payment-service".equals(service)) {
            return "payment_service";
        }
        
        return "default";
    }
    
    private List<NotificationChannel> adjustChannelsForOffHours(
            List<NotificationChannel> baseChannels, AlertLevel level) {
        // 在非工作时间调整通知渠道
        List<NotificationChannel> adjustedChannels = new ArrayList<>(baseChannels);
        
        switch (level) {
            case CRITICAL:
                // 严重级别在非工作时间加强通知
                if (!adjustedChannels.contains(NotificationChannel.PHONE)) {
                    adjustedChannels.add(NotificationChannel.PHONE);
                }
                break;
            case HIGH:
                // 高级别保持原有渠道
                break;
            case MEDIUM:
                // 中级别在非工作时间减少干扰性渠道
                adjustedChannels.removeIf(channel -> 
                    channel == NotificationChannel.SMS || channel == NotificationChannel.PHONE);
                break;
            default:
                // 低级别在非工作时间只保留邮件
                adjustedChannels.retainAll(Arrays.asList(NotificationChannel.EMAIL));
                break;
        }
        
        return adjustedChannels;
    }
    
    private AppliedNotificationStrategy createDefaultStrategy(AlertEvent event) {
        AppliedNotificationStrategy strategy = new AppliedNotificationStrategy();
        strategy.setAlertId(event.getId());
        strategy.setLevel(AlertLevel.MEDIUM);
        strategy.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        strategy.setExpectedResponseTimeMinutes(60);
        strategy.setWorkTime(true);
        return strategy;
    }
    
    // 应用的通知策略类
    public static class AppliedNotificationStrategy {
        private String alertId;
        private AlertLevel level;
        private List<NotificationChannel> channels;
        private int expectedResponseTimeMinutes;
        private boolean workTime;
        private NotificationStrategyConfigurationCenter.EscalationConfig escalationConfig;
        
        // getters and setters
        public String getAlertId() { return alertId; }
        public void setAlertId(String alertId) { this.alertId = alertId; }
        public AlertLevel getLevel() { return level; }
        public void setLevel(AlertLevel level) { this.level = level; }
        public List<NotificationChannel> getChannels() { return channels; }
        public void setChannels(List<NotificationChannel> channels) { this.channels = channels; }
        public int getExpectedResponseTimeMinutes() { return expectedResponseTimeMinutes; }
        public void setExpectedResponseTimeMinutes(int expectedResponseTimeMinutes) { this.expectedResponseTimeMinutes = expectedResponseTimeMinutes; }
        public boolean isWorkTime() { return workTime; }
        public void setWorkTime(boolean workTime) { this.workTime = workTime; }
        public NotificationStrategyConfigurationCenter.EscalationConfig getEscalationConfig() { return escalationConfig; }
        public void setEscalationConfig(NotificationStrategyConfigurationCenter.EscalationConfig escalationConfig) { this.escalationConfig = escalationConfig; }
    }
}
```

## 监控与优化

### 策略效果监控

```java
// 通知策略效果监控器
@Component
public class NotificationStrategyMonitor {
    private final MeterRegistry meterRegistry;
    private final AlertHistoryService alertHistoryService;
    
    public NotificationStrategyMonitor(MeterRegistry meterRegistry,
                                     AlertHistoryService alertHistoryService) {
        this.meterRegistry = meterRegistry;
        this.alertHistoryService = alertHistoryService;
    }
    
    @Scheduled(fixedRate = 300000) // 每5分钟执行一次
    public void monitorStrategyEffectiveness() {
        try {
            // 获取最近一小时的告警数据
            long endTime = System.currentTimeMillis();
            long startTime = endTime - 3600000; // 1小时前
            
            List<AlertEvent> recentAlerts = alertHistoryService.getAlertsByTimeRange(
                startTime, endTime);
            
            // 按级别统计
            Map<AlertLevel, List<AlertEvent>> alertsByLevel = recentAlerts.stream()
                .collect(Collectors.groupingBy(AlertEvent::getLevel));
            
            // 统计各级别的响应时间和升级情况
            for (Map.Entry<AlertLevel, List<AlertEvent>> entry : alertsByLevel.entrySet()) {
                AlertLevel level = entry.getKey();
                List<AlertEvent> alerts = entry.getValue();
                
                // 计算平均响应时间
                double avgResponseTime = calculateAverageResponseTime(alerts);
                
                // 计算升级率
                double escalationRate = calculateEscalationRate(alerts);
                
                // 记录监控指标
                recordMetrics(level, avgResponseTime, escalationRate, alerts.size());
            }
        } catch (Exception e) {
            logger.error("Failed to monitor notification strategy effectiveness", e);
        }
    }
    
    private double calculateAverageResponseTime(List<AlertEvent> alerts) {
        if (alerts.isEmpty()) {
            return 0.0;
        }
        
        long totalTime = 0;
        int resolvedCount = 0;
        
        for (AlertEvent alert : alerts) {
            if (alert.isResolved() && alert.getResolvedTime() > 0) {
                totalTime += (alert.getResolvedTime() - alert.getTimestamp());
                resolvedCount++;
            }
        }
        
        return resolvedCount > 0 ? (double) totalTime / resolvedCount : 0.0;
    }
    
    private double calculateEscalationRate(List<AlertEvent> alerts) {
        if (alerts.isEmpty()) {
            return 0.0;
        }
        
        long escalatedCount = alerts.stream()
            .filter(alert -> alert.getEscalationLevel() > 0)
            .count();
            
        return (double) escalatedCount / alerts.size();
    }
    
    private void recordMetrics(AlertLevel level, double avgResponseTime, 
                             double escalationRate, int alertCount) {
        // 记录平均响应时间
        Timer.builder("notification.strategy.response.time")
            .tag("level", level.getLevel())
            .register(meterRegistry)
            .record((long) avgResponseTime, TimeUnit.MILLISECONDS);
            
        // 记录升级率
        Gauge.builder("notification.strategy.escalation.rate")
            .tag("level", level.getLevel())
            .register(meterRegistry, escalationRate);
            
        // 记录告警数量
        Counter.builder("notification.strategy.alert.count")
            .tag("level", level.getLevel())
            .register(meterRegistry)
            .increment(alertCount);
    }
    
    // 告警规则配置
    @Bean
    public List<AlertRule> notificationStrategyAlertRules() {
        List<AlertRule> rules = new ArrayList<>();
        
        // 响应时间过长告警
        AlertRule responseTimeRule = new AlertRule();
        responseTimeRule.setName("High Notification Response Time");
        responseTimeRule.setCondition("notification_strategy_response_time_seconds > 300"); // 5分钟
        responseTimeRule.setSeverity("warning");
        responseTimeRule.setDescription("平均告警响应时间超过5分钟");
        rules.add(responseTimeRule);
        
        // 升级率过高告警
        AlertRule escalationRateRule = new AlertRule();
        escalationRateRule.setName("High Escalation Rate");
        escalationRateRule.setCondition("notification_strategy_escalation_rate > 0.2"); // 20%
        escalationRateRule.setSeverity("warning");
        escalationRateRule.setDescription("告警升级率超过20%");
        rules.add(escalationRateRule);
        
        return rules;
    }
}
```

### 策略优化建议

```java
// 通知策略优化建议生成器
@Service
public class NotificationStrategyOptimizer {
    private final NotificationStrategyMonitor strategyMonitor;
    private final TeamPerformanceAnalyzer teamPerformanceAnalyzer;
    private final ConfigService configService;
    
    public NotificationStrategyOptimizer(
            NotificationStrategyMonitor strategyMonitor,
            TeamPerformanceAnalyzer teamPerformanceAnalyzer,
            ConfigService configService) {
        this.strategyMonitor = strategyMonitor;
        this.teamPerformanceAnalyzer = teamPerformanceAnalyzer;
        this.configService = configService;
    }
    
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点执行
    public void generateOptimizationSuggestions() {
        try {
            // 分析各团队的通知策略效果
            List<String> teams = getAllTeams();
            
            for (String teamId : teams) {
                List<OptimizationSuggestion> suggestions = 
                    analyzeTeamStrategy(teamId);
                
                if (!suggestions.isEmpty()) {
                    // 保存优化建议
                    saveOptimizationSuggestions(teamId, suggestions);
                    
                    // 发送通知给团队负责人
                    notifyTeamLead(teamId, suggestions);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to generate optimization suggestions", e);
        }
    }
    
    private List<OptimizationSuggestion> analyzeTeamStrategy(String teamId) {
        List<OptimizationSuggestion> suggestions = new ArrayList<>();
        
        // 分析团队性能
        TeamPerformanceMetrics metrics = teamPerformanceAnalyzer.analyzeTeamPerformance(teamId);
        
        // 基于性能指标生成优化建议
        if (metrics.getAverageResponseTime() > 600000) { // 超过10分钟
            suggestions.add(createResponseTimeSuggestion(teamId, metrics));
        }
        
        if (metrics.getEscalationRate() > 0.25) { // 超过25%
            suggestions.add(createEscalationRateSuggestion(teamId, metrics));
        }
        
        // 分析通知渠道效果
        List<ChannelEffectiveness> channelEffectiveness = 
            analyzeChannelEffectiveness(teamId);
        
        for (ChannelEffectiveness effectiveness : channelEffectiveness) {
            if (effectiveness.getSuccessRate() < 0.8) { // 成功率低于80%
                suggestions.add(createChannelOptimizationSuggestion(
                    teamId, effectiveness));
            }
        }
        
        return suggestions;
    }
    
    private OptimizationSuggestion createResponseTimeSuggestion(
            String teamId, TeamPerformanceMetrics metrics) {
        OptimizationSuggestion suggestion = new OptimizationSuggestion();
        suggestion.setTeamId(teamId);
        suggestion.setType(OptimizationType.RESPONSE_TIME);
        suggestion.setPriority(OptimizationPriority.HIGH);
        suggestion.setTitle("优化告警响应时间");
        suggestion.setDescription(String.format(
            "团队%s的平均告警响应时间为%.1f分钟，超过了目标值10分钟。建议优化值班安排或调整通知策略。",
            teamId, metrics.getAverageResponseTime() / 60000.0));
        suggestion.setRecommendations(Arrays.asList(
            "优化值班人员配置",
            "调整通知渠道优先级",
            "提供处理培训"
        ));
        return suggestion;
    }
    
    private OptimizationSuggestion createEscalationRateSuggestion(
            String teamId, TeamPerformanceMetrics metrics) {
        OptimizationSuggestion suggestion = new OptimizationSuggestion();
        suggestion.setTeamId(teamId);
        suggestion.setType(OptimizationType.ESCALATION_RATE);
        suggestion.setPriority(OptimizationPriority.MEDIUM);
        suggestion.setTitle("降低告警升级率");
        suggestion.setDescription(String.format(
            "团队%s的告警升级率为%.1f%%，超过了目标值25%%。建议优化升级策略或提高一线处理能力。",
            teamId, metrics.getEscalationRate() * 100));
        suggestion.setRecommendations(Arrays.asList(
            "调整升级时间阈值",
            "加强一线人员培训",
            "优化升级路径"
        ));
        return suggestion;
    }
    
    private OptimizationSuggestion createChannelOptimizationSuggestion(
            String teamId, ChannelEffectiveness effectiveness) {
        OptimizationSuggestion suggestion = new OptimizationSuggestion();
        suggestion.setTeamId(teamId);
        suggestion.setType(OptimizationType.CHANNEL_OPTIMIZATION);
        suggestion.setPriority(OptimizationPriority.LOW);
        suggestion.setTitle("优化通知渠道配置");
        suggestion.setDescription(String.format(
            "通知渠道%s的成功率仅为%.1f%%，建议检查配置或更换服务商。",
            effectiveness.getChannel(), effectiveness.getSuccessRate() * 100));
        suggestion.setRecommendations(Arrays.asList(
            "检查渠道配置",
            "联系服务商",
            "考虑备用渠道"
        ));
        return suggestion;
    }
    
    private List<ChannelEffectiveness> analyzeChannelEffectiveness(String teamId) {
        // 分析各通知渠道的效果（简化实现）
        List<ChannelEffectiveness> effectivenessList = new ArrayList<>();
        
        // 示例数据
        ChannelEffectiveness emailEffectiveness = new ChannelEffectiveness();
        emailEffectiveness.setChannel(NotificationChannel.EMAIL);
        emailEffectiveness.setSuccessRate(0.95);
        effectivenessList.add(emailEffectiveness);
        
        ChannelEffectiveness smsEffectiveness = new ChannelEffectiveness();
        smsEffectiveness.setChannel(NotificationChannel.SMS);
        smsEffectiveness.setSuccessRate(0.75); // 假设SMS成功率较低
        effectivenessList.add(smsEffectiveness);
        
        return effectivenessList;
    }
    
    private List<String> getAllTeams() {
        // 获取所有团队ID（简化实现）
        return Arrays.asList("backend-team", "frontend-team", "ops-team");
    }
    
    private void saveOptimizationSuggestions(String teamId, 
                                           List<OptimizationSuggestion> suggestions) {
        // 保存优化建议到数据库或配置服务
        logger.info("Saving {} optimization suggestions for team {}", 
                   suggestions.size(), teamId);
    }
    
    private void notifyTeamLead(String teamId, List<OptimizationSuggestion> suggestions) {
        // 通知团队负责人
        logger.info("Notifying team lead of {} optimization suggestions for team {}", 
                   suggestions.size(), teamId);
    }
    
    // 优化建议类
    public static class OptimizationSuggestion {
        private String teamId;
        private OptimizationType type;
        private OptimizationPriority priority;
        private String title;
        private String description;
        private List<String> recommendations;
        private long createdAt;
        
        // getters and setters
        public String getTeamId() { return teamId; }
        public void setTeamId(String teamId) { this.teamId = teamId; }
        public OptimizationType getType() { return type; }
        public void setType(OptimizationType type) { this.type = type; }
        public OptimizationPriority getPriority() { return priority; }
        public void setPriority(OptimizationPriority priority) { this.priority = priority; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 优化类型枚举
    public enum OptimizationType {
        RESPONSE_TIME, ESCALATION_RATE, CHANNEL_OPTIMIZATION, POLICY_ADJUSTMENT
    }
    
    // 优化优先级枚举
    public enum OptimizationPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    // 渠道效果类
    public static class ChannelEffectiveness {
        private NotificationChannel channel;
        private double successRate;
        private long totalAttempts;
        private long successfulAttempts;
        
        // getters and setters
        public NotificationChannel getChannel() { return channel; }
        public void setChannel(NotificationChannel channel) { this.channel = channel; }
        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
        public long getTotalAttempts() { return totalAttempts; }
        public void setTotalAttempts(long totalAttempts) { this.totalAttempts = totalAttempts; }
        public long getSuccessfulAttempts() { return successfulAttempts; }
        public void setSuccessfulAttempts(long successfulAttempts) { this.successfulAttempts = successfulAttempts; }
    }
}
```

## 最佳实践

### 配置示例

```yaml
# 通知策略配置示例
notification:
  strategy:
    default:
      levels:
        critical:
          channels: [email, sms, phone, slack]
          work_time_response_minutes: 5
          off_time_response_minutes: 10
          escalation_enabled: true
        high:
          channels: [email, sms, slack]
          work_time_response_minutes: 15
          off_time_response_minutes: 30
          escalation_enabled: true
        medium:
          channels: [email, slack]
          work_time_response_minutes: 60
          off_time_response_minutes: 120
          escalation_enabled: false
        low:
          channels: [email]
          work_time_response_minutes: 1440
          off_time_response_minutes: 2880
          escalation_enabled: false
      escalation:
        critical:
          steps:
            - step: 1
              timeout_minutes: 5
              recipients: [oncall-primary]
              channels: [sms, phone]
            - step: 2
              timeout_minutes: 15
              recipients: [team-leads]
              channels: [phone, email]
            - step: 3
              timeout_minutes: 30
              recipients: [directors]
              channels: [phone, email]
        high:
          steps:
            - step: 1
              timeout_minutes: 15
              recipients: [oncall-primary]
              channels: [sms, email]
            - step: 2
              timeout_minutes: 45
              recipients: [team-leads]
              channels: [email]
  work_time:
    default:
      timezone: "Asia/Shanghai"
      work_days: [1, 2, 3, 4, 5]
      work_start_time: "09:00"
      work_end_time: "18:00"
      holidays: ["2025-01-01", "2025-02-10"]
  optimization:
    enabled: true
    analysis_interval_minutes: 1440 # 24小时
    suggestion_notification_enabled: true
```

### 故障处理

```java
// 通知策略容错处理器
@Component
public class NotificationStrategyFaultHandler {
    private final MeterRegistry meterRegistry;
    private final AlertQueue alertQueue;
    
    public NotificationStrategyFaultHandler(MeterRegistry meterRegistry,
                                          AlertQueue alertQueue) {
        this.meterRegistry = meterRegistry;
        this.alertQueue = alertQueue;
    }
    
    public AppliedNotificationStrategy handleStrategyFailure(AlertEvent event, Exception error) {
        // 记录故障
        Counter.builder("notification.strategy.failures")
            .register(meterRegistry)
            .increment();
            
        logger.error("Notification strategy application failed for alert: " + event.getId(), error);
        
        // 根据错误类型选择降级策略
        if (error instanceof ConfigurationException) {
            return handleConfigurationError(event, (ConfigurationException) error);
        } else if (error instanceof TimeoutException) {
            return handleTimeoutError(event, (TimeoutException) error);
        } else {
            return handleGeneralError(event, error);
        }
    }
    
    private AppliedNotificationStrategy handleConfigurationError(AlertEvent event, 
                                                               ConfigurationException error) {
        logger.warn("Configuration error for alert {}, using fallback strategy", event.getId());
        // 使用简化的默认策略
        return createFallbackStrategy(event, AlertLevel.MEDIUM);
    }
    
    private AppliedNotificationStrategy handleTimeoutError(AlertEvent event, 
                                                         TimeoutException error) {
        logger.warn("Timeout error for alert {}, using urgent strategy", event.getId());
        // 使用紧急策略确保关键告警不丢失
        return createFallbackStrategy(event, AlertLevel.HIGH);
    }
    
    private AppliedNotificationStrategy handleGeneralError(AlertEvent event, Exception error) {
        logger.warn("General error for alert {}, using safe strategy", event.getId());
        // 使用安全策略，确保通知能够送达
        return createFallbackStrategy(event, event.getLevel());
    }
    
    private AppliedNotificationStrategy createFallbackStrategy(AlertEvent event, AlertLevel level) {
        AppliedNotificationStrategy strategy = new AppliedNotificationStrategy();
        strategy.setAlertId(event.getId());
        strategy.setLevel(level);
        strategy.setChannels(Arrays.asList(NotificationChannel.EMAIL)); // 最可靠的渠道
        strategy.setExpectedResponseTimeMinutes(60);
        strategy.setWorkTime(true);
        return strategy;
    }
    
    // 配置异常类
    public static class ConfigurationException extends Exception {
        public ConfigurationException(String message) {
            super(message);
        }
        
        public ConfigurationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
```

## 结论

通知策略管理是构建高效智能报警平台的关键环节。通过建立完善的分级策略、分时策略和升级策略体系，我们可以确保告警信息在正确的时间以正确的方式传达给正确的人。

关键要点包括：

1. **分级策略**：建立清晰的告警级别体系，根据业务影响、用户影响和系统影响综合评估告警重要性
2. **分时策略**：根据工作时间和非工作时间调整通知策略，避免非工作时间的不必要干扰
3. **升级策略**：建立自动升级机制，确保在规定时间内未响应的告警能够及时升级处理
4. **动态调整**：基于历史数据和团队性能动态优化通知策略
5. **监控优化**：建立完善的监控体系，持续优化通知策略效果
6. **容错处理**：实现完善的故障处理机制，确保在系统异常时仍能提供基本的通知服务

通过合理设计和实现这些策略，我们可以构建出真正高效、智能、可靠的告警通知体系，为业务的稳定运行提供有力保障。