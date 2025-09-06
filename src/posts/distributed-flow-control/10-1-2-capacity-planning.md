---
title: 压测与容量规划：通过限流平台模拟流量进行全链路压测找出系统瓶颈
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed, capacity-planning]
published: true
---

在分布式系统中，容量规划是确保系统稳定性和性能的关键环节。传统的容量规划方法往往依赖于历史数据和经验估算，难以准确反映系统在真实负载下的表现。通过限流平台进行全链路压测，我们可以在受控环境中模拟各种负载场景，精确测量系统的性能指标，识别潜在的瓶颈，并为容量规划提供科学依据。

## 压测与容量规划的核心价值

### 1. 精准性能评估

通过全链路压测，我们可以在接近真实的业务场景下评估系统性能，获得比理论估算更准确的性能数据。

```java
// 压测任务管理器
@Service
public class LoadTestManager {
    
    private final LoadTestExecutor loadTestExecutor;
    private final MetricsCollector metricsCollector;
    private final RedisTemplate<String, String> redisTemplate;
    private final ScheduledExecutorService scheduler;
    
    public LoadTestManager(LoadTestExecutor loadTestExecutor,
                          MetricsCollector metricsCollector,
                          RedisTemplate<String, String> redisTemplate) {
        this.loadTestExecutor = loadTestExecutor;
        this.metricsCollector = metricsCollector;
        this.redisTemplate = redisTemplate;
        this.scheduler = Executors.newScheduledThreadPool(2);
    }
    
    /**
     * 创建压测任务
     */
    public LoadTestTask createLoadTestTask(LoadTestConfig config) {
        // 验证配置
        validateLoadTestConfig(config);
        
        // 创建压测任务
        LoadTestTask task = new LoadTestTask();
        task.setTaskId(UUID.randomUUID().toString());
        task.setConfig(config);
        task.setStatus(LoadTestStatus.PENDING);
        task.setCreateTime(System.currentTimeMillis());
        
        // 保存任务信息
        saveLoadTestTask(task);
        
        // 启动压测任务
        startLoadTestTask(task);
        
        return task;
    }
    
    /**
     * 验证压测配置
     */
    private void validateLoadTestConfig(LoadTestConfig config) {
        if (config.getTargetQps() <= 0) {
            throw new IllegalArgumentException("Target QPS must be positive");
        }
        
        if (config.getDurationSeconds() <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
        
        if (config.getTestScenarios().isEmpty()) {
            throw new IllegalArgumentException("Test scenarios cannot be empty");
        }
        
        for (TestScenario scenario : config.getTestScenarios()) {
            if (scenario.getWeight() <= 0) {
                throw new IllegalArgumentException("Scenario weight must be positive");
            }
        }
    }
    
    /**
     * 启动压测任务
     */
    private void startLoadTestTask(LoadTestTask task) {
        try {
            // 更新任务状态
            task.setStatus(LoadTestStatus.RUNNING);
            task.setStartTime(System.currentTimeMillis());
            saveLoadTestTask(task);
            
            // 启动压测执行器
            LoadTestExecution execution = loadTestExecutor.executeLoadTest(task);
            
            // 启动监控任务
            startMonitoringTask(task, execution);
            
            log.info("Load test task started: {}", task.getTaskId());
        } catch (Exception e) {
            log.error("Failed to start load test task: {}", task.getTaskId(), e);
            task.setStatus(LoadTestStatus.FAILED);
            task.setEndTime(System.currentTimeMillis());
            saveLoadTestTask(task);
        }
    }
    
    /**
     * 启动监控任务
     */
    private void startMonitoringTask(LoadTestTask task, LoadTestExecution execution) {
        scheduler.scheduleAtFixedRate(() -> {
            try {
                // 收集压测指标
                LoadTestMetrics metrics = collectLoadTestMetrics(task, execution);
                
                // 保存指标数据
                saveLoadTestMetrics(task.getTaskId(), metrics);
                
                // 检查是否需要调整
                checkAndAdjustLoadTest(task, metrics);
            } catch (Exception e) {
                log.warn("Failed to collect load test metrics for task: {}", task.getTaskId(), e);
            }
        }, 0, 5, TimeUnit.SECONDS); // 每5秒收集一次指标
        
        // 启动任务完成检查
        scheduler.schedule(() -> {
            try {
                completeLoadTestTask(task);
            } catch (Exception e) {
                log.error("Failed to complete load test task: {}", task.getTaskId(), e);
            }
        }, task.getConfig().getDurationSeconds(), TimeUnit.SECONDS);
    }
    
    /**
     * 收集压测指标
     */
    private LoadTestMetrics collectLoadTestMetrics(LoadTestTask task, LoadTestExecution execution) {
        LoadTestMetrics metrics = new LoadTestMetrics();
        metrics.setTaskId(task.getTaskId());
        metrics.setTimestamp(System.currentTimeMillis());
        
        // 收集系统指标
        SystemMetrics systemMetrics = metricsCollector.collectCurrentMetrics();
        metrics.setSystemMetrics(systemMetrics);
        
        // 收集压测执行指标
        ExecutionMetrics executionMetrics = execution.getMetrics();
        metrics.setExecutionMetrics(executionMetrics);
        
        // 计算性能指标
        calculatePerformanceMetrics(metrics, executionMetrics);
        
        return metrics;
    }
    
    /**
     * 计算性能指标
     */
    private void calculatePerformanceMetrics(LoadTestMetrics metrics, ExecutionMetrics executionMetrics) {
        PerformanceMetrics performance = new PerformanceMetrics();
        
        // 计算QPS
        long durationSeconds = executionMetrics.getDurationSeconds();
        if (durationSeconds > 0) {
            performance.setActualQps(executionMetrics.getTotalRequests() / durationSeconds);
        }
        
        // 计算成功率
        long totalRequests = executionMetrics.getTotalRequests();
        if (totalRequests > 0) {
            performance.setSuccessRate((double) (totalRequests - executionMetrics.getFailedRequests()) 
                                     / totalRequests);
        }
        
        // 计算平均响应时间
        long successfulRequests = totalRequests - executionMetrics.getFailedRequests();
        if (successfulRequests > 0) {
            performance.setAvgResponseTime(executionMetrics.getTotalResponseTime() / successfulRequests);
        }
        
        // 计算P99响应时间
        performance.setP99ResponseTime(executionMetrics.getPercentile99ResponseTime());
        
        metrics.setPerformanceMetrics(performance);
    }
    
    /**
     * 检查并调整压测
     */
    private void checkAndAdjustLoadTest(LoadTestTask task, LoadTestMetrics metrics) {
        try {
            // 检查系统负载
            SystemMetrics systemMetrics = metrics.getSystemMetrics();
            
            // 如果系统负载过高，降低压测强度
            if (shouldReduceLoad(systemMetrics)) {
                loadTestExecutor.reduceLoad(task.getTaskId());
                log.info("Reduced load for task: {} due to high system load", task.getTaskId());
            }
            // 如果系统负载正常且未达到目标QPS，可以适当增加压测强度
            else if (shouldIncreaseLoad(task, metrics)) {
                loadTestExecutor.increaseLoad(task.getTaskId());
                log.info("Increased load for task: {} to reach target QPS", task.getTaskId());
            }
        } catch (Exception e) {
            log.warn("Failed to adjust load test: {}", task.getTaskId(), e);
        }
    }
    
    /**
     * 判断是否应该降低负载
     */
    private boolean shouldReduceLoad(SystemMetrics systemMetrics) {
        return systemMetrics.getCpuUsage() > 0.85 || 
               systemMetrics.getMemoryUsage() > 0.85 ||
               systemMetrics.getErrorRate() > 0.05;
    }
    
    /**
     * 判断是否应该增加负载
     */
    private boolean shouldIncreaseLoad(LoadTestTask task, LoadTestMetrics metrics) {
        LoadTestConfig config = task.getConfig();
        PerformanceMetrics performance = metrics.getPerformanceMetrics();
        
        // 如果当前QPS远低于目标QPS且系统负载正常
        return performance.getActualQps() < config.getTargetQps() * 0.8 &&
               metrics.getSystemMetrics().getCpuUsage() < 0.7 &&
               metrics.getSystemMetrics().getMemoryUsage() < 0.7;
    }
    
    /**
     * 完成压测任务
     */
    private void completeLoadTestTask(LoadTestTask task) {
        try {
            task.setStatus(LoadTestStatus.COMPLETED);
            task.setEndTime(System.currentTimeMillis());
            saveLoadTestTask(task);
            
            // 生成压测报告
            generateLoadTestReport(task);
            
            log.info("Load test task completed: {}", task.getTaskId());
        } catch (Exception e) {
            log.error("Failed to complete load test task: {}", task.getTaskId(), e);
            task.setStatus(LoadTestStatus.FAILED);
            task.setEndTime(System.currentTimeMillis());
            saveLoadTestTask(task);
        }
    }
    
    /**
     * 生成压测报告
     */
    private void generateLoadTestReport(LoadTestTask task) {
        try {
            // 获取所有指标数据
            List<LoadTestMetrics> metricsList = getLoadTestMetricsHistory(task.getTaskId());
            
            // 分析性能瓶颈
            PerformanceBottleneck bottleneck = analyzePerformanceBottlenecks(metricsList);
            
            // 生成容量规划建议
            CapacityPlan plan = generateCapacityPlan(task, metricsList, bottleneck);
            
            // 保存报告
            LoadTestReport report = new LoadTestReport();
            report.setTaskId(task.getTaskId());
            report.setMetricsList(metricsList);
            report.setBottleneck(bottleneck);
            report.setCapacityPlan(plan);
            report.setGenerateTime(System.currentTimeMillis());
            
            saveLoadTestReport(report);
            
            log.info("Load test report generated for task: {}", task.getTaskId());
        } catch (Exception e) {
            log.error("Failed to generate load test report for task: {}", task.getTaskId(), e);
        }
    }
    
    /**
     * 分析性能瓶颈
     */
    private PerformanceBottleneck analyzePerformanceBottlenecks(List<LoadTestMetrics> metricsList) {
        PerformanceBottleneck bottleneck = new PerformanceBottleneck();
        
        if (metricsList.isEmpty()) {
            return bottleneck;
        }
        
        // 分析系统资源瓶颈
        SystemMetrics maxSystemMetrics = metricsList.stream()
            .map(LoadTestMetrics::getSystemMetrics)
            .max(Comparator.comparingDouble(SystemMetrics::getCpuUsage))
            .orElse(new SystemMetrics());
        
        if (maxSystemMetrics.getCpuUsage() > 0.8) {
            bottleneck.setCpuBottleneck(true);
            bottleneck.setCpuUsage(maxSystemMetrics.getCpuUsage());
        }
        
        if (maxSystemMetrics.getMemoryUsage() > 0.8) {
            bottleneck.setMemoryBottleneck(true);
            bottleneck.setMemoryUsage(maxSystemMetrics.getMemoryUsage());
        }
        
        // 分析响应时间瓶颈
        PerformanceMetrics maxPerformance = metricsList.stream()
            .map(LoadTestMetrics::getPerformanceMetrics)
            .max(Comparator.comparingDouble(PerformanceMetrics::getAvgResponseTime))
            .orElse(new PerformanceMetrics());
        
        if (maxPerformance.getAvgResponseTime() > 500) { // 假设500ms为响应时间阈值
            bottleneck.setResponseTimeBottleneck(true);
            bottleneck.setMaxResponseTime(maxPerformance.getAvgResponseTime());
        }
        
        return bottleneck;
    }
    
    /**
     * 生成容量规划建议
     */
    private CapacityPlan generateCapacityPlan(LoadTestTask task, List<LoadTestMetrics> metricsList,
                                            PerformanceBottleneck bottleneck) {
        CapacityPlan plan = new CapacityPlan();
        LoadTestConfig config = task.getConfig();
        
        if (metricsList.isEmpty()) {
            return plan;
        }
        
        // 计算平均性能指标
        double avgQps = metricsList.stream()
            .mapToDouble(m -> m.getPerformanceMetrics().getActualQps())
            .average()
            .orElse(0);
        
        double avgResponseTime = metricsList.stream()
            .mapToDouble(m -> m.getPerformanceMetrics().getAvgResponseTime())
            .average()
            .orElse(0);
        
        double successRate = metricsList.stream()
            .mapToDouble(m -> m.getPerformanceMetrics().getSuccessRate())
            .average()
            .orElse(0);
        
        // 根据性能指标生成容量建议
        if (avgQps < config.getTargetQps() * 0.9) {
            plan.setScalingRecommendation("建议扩容：当前QPS未达到目标值");
            plan.setRecommendedInstances(calculateRecommendedInstances(config.getTargetQps(), avgQps));
        } else if (successRate < 0.99) {
            plan.setScalingRecommendation("建议优化：成功率较低");
        } else if (avgResponseTime > 200) {
            plan.setScalingRecommendation("建议优化：响应时间较长");
        } else {
            plan.setScalingRecommendation("当前容量满足需求");
        }
        
        // 添加瓶颈相关的建议
        if (bottleneck.isCpuBottleneck()) {
            plan.setBottleneckRecommendations(
                plan.getBottleneckRecommendations() + "CPU瓶颈，建议优化算法或扩容CPU");
        }
        
        if (bottleneck.isMemoryBottleneck()) {
            plan.setBottleneckRecommendations(
                plan.getBottleneckRecommendations() + "内存瓶颈，建议优化内存使用或扩容内存");
        }
        
        return plan;
    }
    
    /**
     * 计算推荐实例数
     */
    private int calculateRecommendedInstances(long targetQps, double currentQps) {
        if (currentQps <= 0) {
            return 1;
        }
        return (int) Math.ceil(targetQps / currentQps);
    }
    
    // 数据存储相关方法
    private void saveLoadTestTask(LoadTestTask task) {
        try {
            String key = "load_test:task:" + task.getTaskId();
            String jsonData = JsonUtils.toJson(task);
            redisTemplate.opsForValue().set(key, jsonData, 86400, TimeUnit.SECONDS); // 保存24小时
        } catch (Exception e) {
            log.warn("Failed to save load test task: {}", task.getTaskId(), e);
        }
    }
    
    private void saveLoadTestMetrics(String taskId, LoadTestMetrics metrics) {
        try {
            String key = "load_test:metrics:" + taskId;
            String jsonData = JsonUtils.toJson(metrics);
            redisTemplate.opsForList().leftPush(key, jsonData);
            
            // 保留最近1000条记录
            redisTemplate.opsForList().trim(key, 0, 999);
        } catch (Exception e) {
            log.warn("Failed to save load test metrics for task: {}", taskId, e);
        }
    }
    
    private List<LoadTestMetrics> getLoadTestMetricsHistory(String taskId) {
        List<LoadTestMetrics> metricsList = new ArrayList<>();
        
        try {
            String key = "load_test:metrics:" + taskId;
            List<String> jsonDataList = redisTemplate.opsForList().range(key, 0, -1);
            
            if (jsonDataList != null) {
                for (String jsonData : jsonDataList) {
                    LoadTestMetrics metrics = JsonUtils.fromJson(jsonData, LoadTestMetrics.class);
                    metricsList.add(metrics);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get load test metrics history for task: {}", taskId, e);
        }
        
        return metricsList;
    }
    
    private void saveLoadTestReport(LoadTestReport report) {
        try {
            String key = "load_test:report:" + report.getTaskId();
            String jsonData = JsonUtils.toJson(report);
            redisTemplate.opsForValue().set(key, jsonData, 604800, TimeUnit.SECONDS); // 保存7天
        } catch (Exception e) {
            log.warn("Failed to save load test report: {}", report.getTaskId(), e);
        }
    }
}

// 压测配置
@Data
public class LoadTestConfig {
    private long targetQps;                    // 目标QPS
    private int durationSeconds;              // 压测持续时间（秒）
    private List<TestScenario> testScenarios; // 测试场景列表
    private Map<String, String> headers;      // 请求头
    private String description;               // 描述
}

// 测试场景
@Data
public class TestScenario {
    private String name;        // 场景名称
    private String url;         // 请求URL
    private String method;      // HTTP方法
    private String body;        // 请求体
    private double weight;      // 权重
    private Map<String, String> headers; // 场景特定的请求头
}

// 压测任务
@Data
public class LoadTestTask {
    private String taskId;              // 任务ID
    private LoadTestConfig config;      // 压测配置
    private LoadTestStatus status;      // 任务状态
    private long createTime;            // 创建时间
    private Long startTime;             // 开始时间
    private Long endTime;               // 结束时间
    private String createdBy;           // 创建者
}

// 压测任务状态枚举
public enum LoadTestStatus {
    PENDING("待执行"),
    RUNNING("执行中"),
    COMPLETED("已完成"),
    FAILED("失败"),
    CANCELLED("已取消");
    
    private final String description;
    
    LoadTestStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// 压测执行器
@Data
public class LoadTestExecution {
    private String executionId;
    private String taskId;
    private LoadTestConfig config;
    private ExecutionMetrics metrics;
    private LoadTestStatus status;
    private long startTime;
    private Long endTime;
}

// 执行指标
@Data
public class ExecutionMetrics {
    private long totalRequests;              // 总请求数
    private long successfulRequests;         // 成功请求数
    private long failedRequests;             // 失败请求数
    private long totalResponseTime;          // 总响应时间（毫秒）
    private long maxResponseTime;            // 最大响应时间（毫秒）
    private long percentile99ResponseTime;   // P99响应时间（毫秒）
    private long durationSeconds;            // 执行时长（秒）
    private Map<String, Long> statusCodeCounts; // 状态码统计
}

// 压测指标
@Data
public class LoadTestMetrics {
    private String taskId;
    private SystemMetrics systemMetrics;      // 系统指标
    private ExecutionMetrics executionMetrics; // 执行指标
    private PerformanceMetrics performanceMetrics; // 性能指标
    private long timestamp;
}

// 性能指标
@Data
public class PerformanceMetrics {
    private double actualQps;        // 实际QPS
    private double successRate;      // 成功率
    private double avgResponseTime;  // 平均响应时间（毫秒）
    private double p99ResponseTime;  // P99响应时间（毫秒）
    private long timestamp;
}

// 性能瓶颈分析
@Data
public class PerformanceBottleneck {
    private boolean cpuBottleneck;      // CPU瓶颈
    private boolean memoryBottleneck;   // 内存瓶颈
    private boolean responseTimeBottleneck; // 响应时间瓶颈
    private double cpuUsage;            // CPU使用率
    private double memoryUsage;         // 内存使用率
    private double maxResponseTime;     // 最大响应时间
}

// 容量规划建议
@Data
public class CapacityPlan {
    private String scalingRecommendation;     // 扩容建议
    private int recommendedInstances;         // 推荐实例数
    private String bottleneckRecommendations; // 瓶颈相关建议
    private Map<String, Object> resourceRequirements; // 资源需求
}
```

### 2. 瓶颈识别与优化

全链路压测能够暴露系统在高负载下的各种瓶颈，包括数据库性能、网络延迟、第三方服务调用等，为系统优化提供明确方向。

### 3. 科学容量规划

基于压测结果，我们可以制定更加科学合理的容量规划方案，避免资源浪费或容量不足的问题。

## 压测平台设计

### 1. 压测任务调度

压测平台需要具备灵活的任务调度能力，支持定时执行、并发执行等多种调度方式。

```java
// 压测任务调度器
@Component
public class LoadTestScheduler {
    
    private final LoadTestManager loadTestManager;
    private final RedisTemplate<String, String> redisTemplate;
    private final ScheduledExecutorService scheduler;
    
    public LoadTestScheduler(LoadTestManager loadTestManager,
                           RedisTemplate<String, String> redisTemplate) {
        this.loadTestManager = loadTestManager;
        this.redisTemplate = redisTemplate;
        this.scheduler = Executors.newScheduledThreadPool(5);
    }
    
    /**
     * 提交一次性压测任务
     */
    public LoadTestTask submitLoadTest(LoadTestConfig config) {
        return loadTestManager.createLoadTestTask(config);
    }
    
    /**
     * 创建定时压测任务
     */
    public ScheduledLoadTest createScheduledLoadTest(ScheduledLoadTestConfig config) {
        // 验证配置
        validateScheduledConfig(config);
        
        // 创建定时任务
        ScheduledLoadTest scheduledTest = new ScheduledLoadTest();
        scheduledTest.setTaskId(UUID.randomUUID().toString());
        scheduledTest.setConfig(config);
        scheduledTest.setStatus(ScheduledLoadTestStatus.ACTIVE);
        scheduledTest.setCreateTime(System.currentTimeMillis());
        
        // 保存定时任务
        saveScheduledLoadTest(scheduledTest);
        
        // 注册定时执行
        registerScheduledExecution(scheduledTest);
        
        return scheduledTest;
    }
    
    /**
     * 验证定时压测配置
     */
    private void validateScheduledConfig(ScheduledLoadTestConfig config) {
        if (config.getCronExpression() == null || config.getCronExpression().isEmpty()) {
            throw new IllegalArgumentException("Cron expression cannot be empty");
        }
        
        if (config.getLoadTestConfig() == null) {
            throw new IllegalArgumentException("Load test config cannot be null");
        }
    }
    
    /**
     * 注册定时执行
     */
    private void registerScheduledExecution(ScheduledLoadTest scheduledTest) {
        try {
            String cronExpression = scheduledTest.getConfig().getCronExpression();
            CronTrigger cronTrigger = new CronTrigger(cronExpression);
            
            scheduler.scheduleWithFixedDelay(() -> {
                try {
                    // 检查任务是否处于激活状态
                    if (isScheduledTestActive(scheduledTest.getTaskId())) {
                        // 执行压测任务
                        executeScheduledLoadTest(scheduledTest);
                    }
                } catch (Exception e) {
                    log.error("Failed to execute scheduled load test: {}", scheduledTest.getTaskId(), e);
                }
            }, cronTrigger.nextExecutionTime().toInstant().toEpochMilli(), 
               TimeUnit.MILLISECONDS.toNanos(60000), TimeUnit.NANOSECONDS); // 每分钟检查一次
            
            log.info("Scheduled load test registered: {}", scheduledTest.getTaskId());
        } catch (Exception e) {
            log.error("Failed to register scheduled load test: {}", scheduledTest.getTaskId(), e);
            scheduledTest.setStatus(ScheduledLoadTestStatus.ERROR);
            saveScheduledLoadTest(scheduledTest);
        }
    }
    
    /**
     * 执行定时压测任务
     */
    private void executeScheduledLoadTest(ScheduledLoadTest scheduledTest) {
        try {
            log.info("Executing scheduled load test: {}", scheduledTest.getTaskId());
            
            // 创建压测任务
            LoadTestTask task = loadTestManager.createLoadTestTask(
                scheduledTest.getConfig().getLoadTestConfig());
            
            // 记录执行历史
            LoadTestExecutionHistory history = new LoadTestExecutionHistory();
            history.setScheduledTaskId(scheduledTest.getTaskId());
            history.setLoadTestTaskId(task.getTaskId());
            history.setExecuteTime(System.currentTimeMillis());
            history.setStatus(LoadTestExecutionStatus.STARTED);
            
            saveExecutionHistory(history);
            
            log.info("Scheduled load test executed: {} -> {}", 
                    scheduledTest.getTaskId(), task.getTaskId());
        } catch (Exception e) {
            log.error("Failed to execute scheduled load test: {}", scheduledTest.getTaskId(), e);
        }
    }
    
    /**
     * 检查定时任务是否处于激活状态
     */
    private boolean isScheduledTestActive(String taskId) {
        try {
            String key = "scheduled_load_test:" + taskId;
            String jsonData = redisTemplate.opsForValue().get(key);
            if (jsonData != null) {
                ScheduledLoadTest test = JsonUtils.fromJson(jsonData, ScheduledLoadTest.class);
                return ScheduledLoadTestStatus.ACTIVE.equals(test.getStatus());
            }
        } catch (Exception e) {
            log.warn("Failed to check scheduled test status: {}", taskId, e);
        }
        return false;
    }
    
    /**
     * 更新定时任务状态
     */
    public void updateScheduledTestStatus(String taskId, ScheduledLoadTestStatus status) {
        try {
            String key = "scheduled_load_test:" + taskId;
            String jsonData = redisTemplate.opsForValue().get(key);
            if (jsonData != null) {
                ScheduledLoadTest test = JsonUtils.fromJson(jsonData, ScheduledLoadTest.class);
                test.setStatus(status);
                test.setUpdateTime(System.currentTimeMillis());
                redisTemplate.opsForValue().set(key, JsonUtils.toJson(test));
            }
        } catch (Exception e) {
            log.warn("Failed to update scheduled test status: {}", taskId, e);
        }
    }
    
    /**
     * 获取定时任务列表
     */
    public List<ScheduledLoadTest> getScheduledLoadTests(ScheduledLoadTestStatus status) {
        List<ScheduledLoadTest> tests = new ArrayList<>();
        
        try {
            String pattern = "scheduled_load_test:*";
            Set<String> keys = redisTemplate.keys(pattern);
            
            for (String key : keys) {
                try {
                    String jsonData = redisTemplate.opsForValue().get(key);
                    if (jsonData != null) {
                        ScheduledLoadTest test = JsonUtils.fromJson(jsonData, ScheduledLoadTest.class);
                        if (status == null || status.equals(test.getStatus())) {
                            tests.add(test);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse scheduled load test: {}", key, e);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get scheduled load tests", e);
        }
        
        return tests;
    }
    
    // 数据存储相关方法
    private void saveScheduledLoadTest(ScheduledLoadTest test) {
        try {
            String key = "scheduled_load_test:" + test.getTaskId();
            String jsonData = JsonUtils.toJson(test);
            redisTemplate.opsForValue().set(key, jsonData, 2592000, TimeUnit.SECONDS); // 保存30天
        } catch (Exception e) {
            log.warn("Failed to save scheduled load test: {}", test.getTaskId(), e);
        }
    }
    
    private void saveExecutionHistory(LoadTestExecutionHistory history) {
        try {
            String key = "load_test:execution_history:" + history.getScheduledTaskId();
            String jsonData = JsonUtils.toJson(history);
            redisTemplate.opsForList().leftPush(key, jsonData);
            
            // 保留最近100条记录
            redisTemplate.opsForList().trim(key, 0, 99);
        } catch (Exception e) {
            log.warn("Failed to save execution history for task: {}", history.getScheduledTaskId(), e);
        }
    }
    
    /**
     * 并发压测任务管理
     */
    public List<LoadTestTask> executeConcurrentLoadTests(List<LoadTestConfig> configs) {
        List<LoadTestTask> tasks = new ArrayList<>();
        List<CompletableFuture<LoadTestTask>> futures = new ArrayList<>();
        
        // 并发执行多个压测任务
        for (LoadTestConfig config : configs) {
            CompletableFuture<LoadTestTask> future = CompletableFuture.supplyAsync(() -> {
                try {
                    return loadTestManager.createLoadTestTask(config);
                } catch (Exception e) {
                    log.error("Failed to create load test task", e);
                    return null;
                }
            }, scheduler);
            futures.add(future);
        }
        
        // 等待所有任务完成
        CompletableFuture<Void> allFutures = CompletableFuture.allOf(
            futures.toArray(new CompletableFuture[0]));
        
        try {
            allFutures.get(30, TimeUnit.MINUTES); // 最多等待30分钟
        } catch (Exception e) {
            log.error("Failed to wait for concurrent load tests", e);
        }
        
        // 收集结果
        for (CompletableFuture<LoadTestTask> future : futures) {
            try {
                LoadTestTask task = future.get();
                if (task != null) {
                    tasks.add(task);
                }
            } catch (Exception e) {
                log.warn("Failed to get load test task result", e);
            }
        }
        
        return tasks;
    }
}

// 定时压测配置
@Data
public class ScheduledLoadTestConfig {
    private String cronExpression;    // Cron表达式
    private LoadTestConfig loadTestConfig; // 压测配置
    private String description;       // 描述
    private String createdBy;         // 创建者
}

// 定时压测任务
@Data
public class ScheduledLoadTest {
    private String taskId;                    // 任务ID
    private ScheduledLoadTestConfig config;   // 配置
    private ScheduledLoadTestStatus status;   // 状态
    private long createTime;                  // 创建时间
    private Long updateTime;                  // 更新时间
    private String createdBy;                 // 创建者
}

// 定时压测任务状态
public enum ScheduledLoadTestStatus {
    ACTIVE("激活"),
    PAUSED("暂停"),
    ERROR("错误"),
    DELETED("已删除");
    
    private final String description;
    
    ScheduledLoadTestStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// 压测执行历史
@Data
public class LoadTestExecutionHistory {
    private String scheduledTaskId;        // 定时任务ID
    private String loadTestTaskId;         // 压测任务ID
    private long executeTime;              // 执行时间
    private LoadTestExecutionStatus status; // 执行状态
    private String errorMessage;           // 错误信息
}

// 压测执行状态
public enum LoadTestExecutionStatus {
    STARTED("已开始"),
    RUNNING("执行中"),
    COMPLETED("已完成"),
    FAILED("失败");
    
    private final String description;
    
    LoadTestExecutionStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

### 2. 压测数据采集

压测过程中需要采集大量的性能数据，包括系统指标、业务指标、错误日志等，为后续分析提供数据基础。

```java
// 压测数据采集器
@Service
public class LoadTestDataCollector {
    
    private final MeterRegistry meterRegistry;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * 收集压测指标
     */
    public LoadTestMetrics collectMetrics(String taskId, LoadTestExecution execution) {
        LoadTestMetrics metrics = new LoadTestMetrics();
        metrics.setTaskId(taskId);
        metrics.setTimestamp(System.currentTimeMillis());
        
        // 收集系统指标
        metrics.setSystemMetrics(collectSystemMetrics());
        
        // 收集执行指标
        metrics.setExecutionMetrics(execution.getMetrics());
        
        // 收集业务指标
        metrics.setBusinessMetrics(collectBusinessMetrics(taskId));
        
        // 收集错误信息
        metrics.setErrorMetrics(collectErrorMetrics(taskId));
        
        return metrics;
    }
    
    /**
     * 收集系统指标
     */
    private SystemMetrics collectSystemMetrics() {
        SystemMetrics metrics = new SystemMetrics();
        
        // 收集CPU使用率
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
            com.sun.management.OperatingSystemMXBean sunOsBean = 
                (com.sun.management.OperatingSystemMXBean) osBean;
            metrics.setCpuUsage(sunOsBean.getProcessCpuLoad());
        }
        
        // 收集内存使用率
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapMemoryUsage = memoryBean.getHeapMemoryUsage();
        if (heapMemoryUsage.getMax() > 0) {
            metrics.setMemoryUsage((double) heapMemoryUsage.getUsed() / heapMemoryUsage.getMax());
        }
        
        // 收集线程数
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        metrics.setThreadCount(threadBean.getThreadCount());
        
        // 从监控系统收集HTTP指标
        Timer httpTimer = meterRegistry.find("http.server.requests").timer();
        if (httpTimer != null) {
            metrics.setAvgResponseTime(httpTimer.mean(TimeUnit.MILLISECONDS));
            metrics.setP99ResponseTime(httpTimer.percentile(0.99, TimeUnit.MILLISECONDS));
        }
        
        // 收集错误率
        Counter totalCounter = meterRegistry.find("http.server.requests").counter();
        Counter errorCounter = meterRegistry.find("http.server.requests")
            .tag("status", "5xx").counter();
        if (totalCounter != null && errorCounter != null && totalCounter.count() > 0) {
            metrics.setErrorRate(errorCounter.count() / totalCounter.count());
        }
        
        metrics.setTimestamp(System.currentTimeMillis());
        
        return metrics;
    }
    
    /**
     * 收集业务指标
     */
    private BusinessMetrics collectBusinessMetrics(String taskId) {
        BusinessMetrics metrics = new BusinessMetrics();
        
        try {
            // 从Redis获取业务指标
            String keyPrefix = "load_test:business_metrics:" + taskId;
            
            // 收集订单量
            String orderCountStr = redisTemplate.opsForValue().get(keyPrefix + ":orders");
            metrics.setOrderCount(orderCountStr != null ? Long.parseLong(orderCountStr) : 0);
            
            // 收集支付量
            String paymentCountStr = redisTemplate.opsForValue().get(keyPrefix + ":payments");
            metrics.setPaymentCount(paymentCountStr != null ? Long.parseLong(paymentCountStr) : 0);
            
            // 收集用户活跃度
            String activeUsersStr = redisTemplate.opsForValue().get(keyPrefix + ":active_users");
            metrics.setActiveUsers(activeUsersStr != null ? Long.parseLong(activeUsersStr) : 0);
            
            // 收集业务成功率
            String successRateStr = redisTemplate.opsForValue().get(keyPrefix + ":success_rate");
            metrics.setBusinessSuccessRate(successRateStr != null ? 
                Double.parseDouble(successRateStr) : 0.0);
        } catch (Exception e) {
            log.warn("Failed to collect business metrics for task: {}", taskId, e);
        }
        
        return metrics;
    }
    
    /**
     * 收集错误指标
     */
    private ErrorMetrics collectErrorMetrics(String taskId) {
        ErrorMetrics metrics = new ErrorMetrics();
        
        try {
            String key = "load_test:error_metrics:" + taskId;
            String jsonData = redisTemplate.opsForValue().get(key);
            if (jsonData != null) {
                metrics = objectMapper.readValue(jsonData, ErrorMetrics.class);
            }
        } catch (Exception e) {
            log.warn("Failed to collect error metrics for task: {}", taskId, e);
        }
        
        return metrics;
    }
    
    /**
     * 持续收集压测数据
     */
    @EventListener
    public void handleLoadTestEvent(LoadTestEvent event) {
        try {
            String taskId = event.getTaskId();
            LoadTestExecution execution = event.getExecution();
            
            // 收集指标
            LoadTestMetrics metrics = collectMetrics(taskId, execution);
            
            // 存储指标数据
            storeMetrics(taskId, metrics);
            
            // 实时分析
            analyzeMetricsInRealTime(metrics);
        } catch (Exception e) {
            log.error("Failed to handle load test event", e);
        }
    }
    
    /**
     * 存储指标数据
     */
    private void storeMetrics(String taskId, LoadTestMetrics metrics) {
        try {
            String key = "load_test:metrics:" + taskId;
            String jsonData = objectMapper.writeValueAsString(metrics);
            redisTemplate.opsForList().leftPush(key, jsonData);
            
            // 保留最近1000条记录
            redisTemplate.opsForList().trim(key, 0, 999);
        } catch (Exception e) {
            log.warn("Failed to store metrics for task: {}", taskId, e);
        }
    }
    
    /**
     * 实时分析指标
     */
    private void analyzeMetricsInRealTime(LoadTestMetrics metrics) {
        try {
            // 检查是否需要告警
            checkAlerts(metrics);
            
            // 检查是否需要调整压测参数
            checkLoadTestAdjustment(metrics);
        } catch (Exception e) {
            log.warn("Failed to analyze metrics in real time", e);
        }
    }
    
    /**
     * 检查告警条件
     */
    private void checkAlerts(LoadTestMetrics metrics) {
        SystemMetrics systemMetrics = metrics.getSystemMetrics();
        
        // CPU使用率过高告警
        if (systemMetrics.getCpuUsage() > 0.9) {
            sendAlert("CPU使用率过高", "CPU使用率达到" + systemMetrics.getCpuUsage());
        }
        
        // 内存使用率过高告警
        if (systemMetrics.getMemoryUsage() > 0.9) {
            sendAlert("内存使用率过高", "内存使用率达到" + systemMetrics.getMemoryUsage());
        }
        
        // 错误率过高告警
        if (systemMetrics.getErrorRate() > 0.05) {
            sendAlert("错误率过高", "系统错误率达到" + systemMetrics.getErrorRate());
        }
    }
    
    /**
     * 检查压测调整条件
     */
    private void checkLoadTestAdjustment(LoadTestMetrics metrics) {
        // 根据指标情况动态调整压测参数
        // 实现略
    }
    
    /**
     * 发送告警
     */
    private void sendAlert(String title, String content) {
        // 发送告警通知
        // 实现略
        log.warn("Load test alert: {} - {}", title, content);
    }
    
    /**
     * 获取历史指标数据
     */
    public List<LoadTestMetrics> getHistoricalMetrics(String taskId, int minutes) {
        List<LoadTestMetrics> metricsList = new ArrayList<>();
        
        try {
            String key = "load_test:metrics:" + taskId;
            long endTime = System.currentTimeMillis();
            long startTime = endTime - (minutes * 60 * 1000L);
            
            List<String> jsonDataList = redisTemplate.opsForList().range(key, 0, -1);
            
            if (jsonDataList != null) {
                for (String jsonData : jsonDataList) {
                    LoadTestMetrics metrics = objectMapper.readValue(jsonData, LoadTestMetrics.class);
                    if (metrics.getTimestamp() >= startTime && metrics.getTimestamp() <= endTime) {
                        metricsList.add(metrics);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get historical metrics for task: {}", taskId, e);
        }
        
        return metricsList;
    }
}

// 业务指标
@Data
public class BusinessMetrics {
    private long orderCount;           // 订单量
    private long paymentCount;         // 支付量
    private long activeUsers;          // 活跃用户数
    private double businessSuccessRate; // 业务成功率
    private Map<String, Object> customMetrics; // 自定义业务指标
    private long timestamp;
}

// 错误指标
@Data
public class ErrorMetrics {
    private long totalErrors;              // 总错误数
    private Map<String, Long> errorTypeCounts; // 错误类型统计
    private Map<String, Long> errorCodeCounts; // 错误码统计
    private List<ErrorDetail> errorDetails;    // 错误详情
    private long timestamp;
}

// 错误详情
@Data
public class ErrorDetail {
    private String errorType;    // 错误类型
    private String errorCode;    // 错误码
    private String errorMessage; // 错误信息
    private String stackTrace;   // 堆栈信息
    private long timestamp;
}

// 压测事件
@Data
public class LoadTestEvent {
    private String taskId;
    private LoadTestExecution execution;
    private LoadTestEventType eventType;
    private long timestamp;
}

// 压测事件类型
public enum LoadTestEventType {
    STARTED, PROGRESS, COMPLETED, FAILED
}
```

## 容量规划实践

### 1. 基于压测结果的容量模型

通过分析压测结果，我们可以建立系统的容量模型，用于预测在不同负载下的系统表现。

```java
// 容量规划服务
@Service
public class CapacityPlanningService {
    
    private final LoadTestDataCollector dataCollector;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * 基于压测结果生成容量模型
     */
    public CapacityModel generateCapacityModel(String taskId) {
        try {
            // 获取压测历史数据
            List<LoadTestMetrics> metricsList = dataCollector.getHistoricalMetrics(taskId, 60);
            
            if (metricsList.isEmpty()) {
                throw new IllegalStateException("No metrics data available for task: " + taskId);
            }
            
            // 分析容量特征
            CapacityCharacteristics characteristics = analyzeCapacityCharacteristics(metricsList);
            
            // 构建容量模型
            CapacityModel model = new CapacityModel();
            model.setTaskId(taskId);
            model.setCharacteristics(characteristics);
            model.setCapacityFormula(buildCapacityFormula(characteristics));
            model.setRecommendations(generateRecommendations(characteristics));
            model.setCreateTime(System.currentTimeMillis());
            
            // 保存容量模型
            saveCapacityModel(model);
            
            return model;
        } catch (Exception e) {
            log.error("Failed to generate capacity model for task: {}", taskId, e);
            throw new RuntimeException("Failed to generate capacity model", e);
        }
    }
    
    /**
     * 分析容量特征
     */
    private CapacityCharacteristics analyzeCapacityCharacteristics(List<LoadTestMetrics> metricsList) {
        CapacityCharacteristics characteristics = new CapacityCharacteristics();
        
        // 计算各项指标的统计值
        DoubleSummaryStatistics qpsStats = metricsList.stream()
            .mapToDouble(m -> m.getExecutionMetrics().getTotalRequests() / 
                         m.getExecutionMetrics().getDurationSeconds())
            .summaryStatistics();
        
        DoubleSummaryStatistics responseTimeStats = metricsList.stream()
            .mapToDouble(m -> m.getSystemMetrics().getAvgResponseTime())
            .summaryStatistics();
        
        DoubleSummaryStatistics cpuStats = metricsList.stream()
            .mapToDouble(m -> m.getSystemMetrics().getCpuUsage())
            .summaryStatistics();
        
        DoubleSummaryStatistics memoryStats = metricsList.stream()
            .mapToDouble(m -> m.getSystemMetrics().getMemoryUsage())
            .summaryStatistics();
        
        // 设置容量特征
        characteristics.setMaxQps(qpsStats.getMax());
        characteristics.setAvgQps(qpsStats.getAverage());
        characteristics.setMaxResponseTime(responseTimeStats.getMax());
        characteristics.setAvgResponseTime(responseTimeStats.getAverage());
        characteristics.setMaxCpuUsage(cpuStats.getMax());
        characteristics.setAvgCpuUsage(cpuStats.getAverage());
        characteristics.setMaxMemoryUsage(memoryStats.getMax());
        characteristics.setAvgMemoryUsage(memoryStats.getAverage());
        
        // 分析瓶颈点
        characteristics.setBottlenecks(analyzeBottlenecks(metricsList));
        
        return characteristics;
    }
    
    /**
     * 分析瓶颈点
     */
    private List<BottleneckPoint> analyzeBottlenecks(List<LoadTestMetrics> metricsList) {
        List<BottleneckPoint> bottlenecks = new ArrayList<>();
        
        // 按QPS分组分析
        Map<Long, List<LoadTestMetrics>> groupedByQps = metricsList.stream()
            .collect(Collectors.groupingBy(m -> 
                m.getExecutionMetrics().getTotalRequests() / 
                m.getExecutionMetrics().getDurationSeconds() / 100 * 100)); // 按100 QPS分组
        
        groupedByQps.forEach((qps, metricsGroup) -> {
            // 计算该QPS下的平均系统指标
            double avgCpu = metricsGroup.stream()
                .mapToDouble(m -> m.getSystemMetrics().getCpuUsage())
                .average().orElse(0);
            
            double avgMemory = metricsGroup.stream()
                .mapToDouble(m -> m.getSystemMetrics().getMemoryUsage())
                .average().orElse(0);
            
            double avgResponseTime = metricsGroup.stream()
                .mapToDouble(m -> m.getSystemMetrics().getAvgResponseTime())
                .average().orElse(0);
            
            // 识别瓶颈
            if (avgCpu > 0.8) {
                BottleneckPoint cpuBottleneck = new BottleneckPoint();
                cpuBottleneck.setType(BottleneckType.CPU);
                cpuBottleneck.setQps(qps);
                cpuBottleneck.setValue(avgCpu);
                cpuBottleneck.setDescription("CPU使用率超过80%");
                bottlenecks.add(cpuBottleneck);
            }
            
            if (avgMemory > 0.8) {
                BottleneckPoint memoryBottleneck = new BottleneckPoint();
                memoryBottleneck.setType(BottleneckType.MEMORY);
                memoryBottleneck.setQps(qps);
                memoryBottleneck.setValue(avgMemory);
                memoryBottleneck.setDescription("内存使用率超过80%");
                bottlenecks.add(memoryBottleneck);
            }
            
            if (avgResponseTime > 500) {
                BottleneckPoint responseBottleneck = new BottleneckPoint();
                responseBottleneck.setType(BottleneckType.RESPONSE_TIME);
                responseBottleneck.setQps(qps);
                responseBottleneck.setValue(avgResponseTime);
                responseBottleneck.setDescription("平均响应时间超过500ms");
                bottlenecks.add(responseBottleneck);
            }
        });
        
        return bottlenecks;
    }
    
    /**
     * 构建容量公式
     */
    private CapacityFormula buildCapacityFormula(CapacityCharacteristics characteristics) {
        CapacityFormula formula = new CapacityFormula();
        
        // 简化的容量公式（实际应用中可能更复杂）
        // QPS = f(CPU, Memory, ResponseTime)
        formula.setFormula("QPS = α * CPU_capacity + β * Memory_capacity + γ * (1/ResponseTime)");
        formula.setParameters(Map.of(
            "α", "0.4",  // CPU权重
            "β", "0.3",  // 内存权重
            "γ", "0.3"   // 响应时间权重
        ));
        
        // 基于历史数据的线性回归分析
        formula.setRegressionAnalysis(performRegressionAnalysis(characteristics));
        
        return formula;
    }
    
    /**
     * 执行回归分析
     */
    private RegressionAnalysis performRegressionAnalysis(CapacityCharacteristics characteristics) {
        // 简化的回归分析实现
        RegressionAnalysis analysis = new RegressionAnalysis();
        analysis.setMethod("多元线性回归");
        analysis.setR2Value(0.85); // 假设R²值为0.85
        analysis.setSignificance(true);
        
        return analysis;
    }
    
    /**
     * 生成容量规划建议
     */
    private List<PlanningRecommendation> generateRecommendations(CapacityCharacteristics characteristics) {
        List<PlanningRecommendation> recommendations = new ArrayList<>();
        
        // 根据瓶颈点生成建议
        for (BottleneckPoint bottleneck : characteristics.getBottlenecks()) {
            PlanningRecommendation recommendation = new PlanningRecommendation();
            recommendation.setBottleneck(bottleneck);
            
            switch (bottleneck.getType()) {
                case CPU:
                    recommendation.setAction("扩容CPU资源");
                    recommendation.setPriority(RecommendationPriority.HIGH);
                    recommendation.setEstimatedCost("增加20%CPU资源");
                    break;
                case MEMORY:
                    recommendation.setAction("扩容内存资源");
                    recommendation.setPriority(RecommendationPriority.HIGH);
                    recommendation.setEstimatedCost("增加15%内存资源");
                    break;
                case RESPONSE_TIME:
                    recommendation.setAction("优化代码逻辑或数据库查询");
                    recommendation.setPriority(RecommendationPriority.MEDIUM);
                    recommendation.setEstimatedCost("开发人员工时2人天");
                    break;
            }
            
            recommendations.add(recommendation);
        }
        
        // 生成总体容量建议
        if (characteristics.getMaxQps() < 5000) { // 假设5000 QPS为目标
            PlanningRecommendation overall = new PlanningRecommendation();
            overall.setAction("整体扩容服务器实例");
            overall.setPriority(RecommendationPriority.HIGH);
            overall.setEstimatedCost("增加30%服务器实例");
            recommendations.add(overall);
        }
        
        return recommendations;
    }
    
    /**
     * 预测指定负载下的系统表现
     */
    public SystemPerformance predictPerformance(CapacityModel model, long targetQps) {
        SystemPerformance performance = new SystemPerformance();
        performance.setTargetQps(targetQps);
        
        // 基于容量模型预测
        CapacityCharacteristics characteristics = model.getCharacteristics();
        
        // 简化的预测逻辑
        double cpuUsage = Math.min(1.0, characteristics.getAvgCpuUsage() * 
                                  (double) targetQps / characteristics.getAvgQps());
        double memoryUsage = Math.min(1.0, characteristics.getAvgMemoryUsage() * 
                                     (double) targetQps / characteristics.getAvgQps());
        double responseTime = characteristics.getAvgResponseTime() * 
                             (double) targetQps / characteristics.getAvgQps();
        
        performance.setPredictedCpuUsage(cpuUsage);
        performance.setPredictedMemoryUsage(memoryUsage);
        performance.setPredictedResponseTime(responseTime);
        
        // 评估风险
        performance.setRiskLevel(assessRisk(cpuUsage, memoryUsage, responseTime));
        
        return performance;
    }
    
    /**
     * 评估风险等级
     */
    private RiskLevel assessRisk(double cpuUsage, double memoryUsage, double responseTime) {
        if (cpuUsage > 0.9 || memoryUsage > 0.9 || responseTime > 1000) {
            return RiskLevel.HIGH;
        } else if (cpuUsage > 0.8 || memoryUsage > 0.8 || responseTime > 500) {
            return RiskLevel.MEDIUM;
        } else {
            return RiskLevel.LOW;
        }
    }
    
    /**
     * 生成容量规划报告
     */
    public CapacityPlanningReport generateReport(String taskId) {
        try {
            // 获取容量模型
            CapacityModel model = getCapacityModel(taskId);
            
            // 生成报告
            CapacityPlanningReport report = new CapacityPlanningReport();
            report.setTaskId(taskId);
            report.setModel(model);
            
            // 生成不同负载场景下的预测
            List<SystemPerformance> predictions = new ArrayList<>();
            long[] qpsLevels = {1000, 2000, 3000, 5000, 8000, 10000};
            
            for (long qps : qpsLevels) {
                predictions.add(predictPerformance(model, qps));
            }
            
            report.setPredictions(predictions);
            report.setGenerateTime(System.currentTimeMillis());
            
            return report;
        } catch (Exception e) {
            log.error("Failed to generate capacity planning report for task: {}", taskId, e);
            throw new RuntimeException("Failed to generate capacity planning report", e);
        }
    }
    
    // 数据存储相关方法
    private void saveCapacityModel(CapacityModel model) {
        try {
            String key = "capacity_model:" + model.getTaskId();
            String jsonData = objectMapper.writeValueAsString(model);
            redisTemplate.opsForValue().set(key, jsonData, 2592000, TimeUnit.SECONDS); // 保存30天
        } catch (Exception e) {
            log.warn("Failed to save capacity model: {}", model.getTaskId(), e);
        }
    }
    
    private CapacityModel getCapacityModel(String taskId) {
        try {
            String key = "capacity_model:" + taskId;
            String jsonData = redisTemplate.opsForValue().get(key);
            if (jsonData != null) {
                return objectMapper.readValue(jsonData, CapacityModel.class);
            }
        } catch (Exception e) {
            log.warn("Failed to get capacity model: {}", taskId, e);
        }
        throw new IllegalStateException("Capacity model not found for task: " + taskId);
    }
}

// 容量模型
@Data
public class CapacityModel {
    private String taskId;
    private CapacityCharacteristics characteristics;
    private CapacityFormula capacityFormula;
    private List<PlanningRecommendation> recommendations;
    private long createTime;
}

// 容量特征
@Data
public class CapacityCharacteristics {
    private double maxQps;
    private double avgQps;
    private double maxResponseTime;
    private double avgResponseTime;
    private double maxCpuUsage;
    private double avgCpuUsage;
    private double maxMemoryUsage;
    private double avgMemoryUsage;
    private List<BottleneckPoint> bottlenecks;
}

// 瓶颈点
@Data
public class BottleneckPoint {
    private BottleneckType type;
    private long qps;
    private double value;
    private String description;
}

// 瓶颈类型
public enum BottleneckType {
    CPU, MEMORY, RESPONSE_TIME, DATABASE, NETWORK
}

// 容量公式
@Data
public class CapacityFormula {
    private String formula;
    private Map<String, String> parameters;
    private RegressionAnalysis regressionAnalysis;
}

// 回归分析结果
@Data
public class RegressionAnalysis {
    private String method;
    private double r2Value;
    private boolean significance;
    private Map<String, Double> coefficients;
}

// 规划建议
@Data
public class PlanningRecommendation {
    private BottleneckPoint bottleneck;
    private String action;
    private RecommendationPriority priority;
    private String estimatedCost;
    private String implementationPlan;
}

// 建议优先级
public enum RecommendationPriority {
    HIGH, MEDIUM, LOW
}

// 系统性能预测
@Data
public class SystemPerformance {
    private long targetQps;
    private double predictedCpuUsage;
    private double predictedMemoryUsage;
    private double predictedResponseTime;
    private RiskLevel riskLevel;
    private String recommendations;
}

// 风险等级
public enum RiskLevel {
    LOW("低风险"), MEDIUM("中风险"), HIGH("高风险");
    
    private final String description;
    
    RiskLevel(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// 容量规划报告
@Data
public class CapacityPlanningReport {
    private String taskId;
    private CapacityModel model;
    private List<SystemPerformance> predictions;
    private long generateTime;
}
```

### 2. 容量规划工具

为了更好地支持容量规划工作，我们需要开发一套完整的工具链。

```java
// 容量规划工具集
@Component
public class CapacityPlanningToolkit {
    
    private final CapacityPlanningService capacityPlanningService;
    private final LoadTestManager loadTestManager;
    private final RedisTemplate<String, String> redisTemplate;
    
    /**
     * 容量规划向导
     */
    public CapacityPlanWizard createPlanWizard(String serviceName) {
        CapacityPlanWizard wizard = new CapacityPlanWizard();
        wizard.setServiceName(serviceName);
        wizard.setSteps(createPlanningSteps());
        wizard.setCurrentStep(0);
        wizard.setCreateTime(System.currentTimeMillis());
        
        return wizard;
    }
    
    /**
     * 创建规划步骤
     */
    private List<PlanningStep> createPlanningSteps() {
        List<PlanningStep> steps = new ArrayList<>();
        
        steps.add(new PlanningStep(1, "需求分析", "分析业务需求和预期流量", 
                  PlanningStepType.ANALYSIS));
        steps.add(new PlanningStep(2, "基准测试", "执行基准性能测试", 
                  PlanningStepType.TESTING));
        steps.add(new PlanningStep(3, "压力测试", "执行压力测试确定系统极限", 
                  PlanningStepType.TESTING));
        steps.add(new PlanningStep(4, "容量建模", "基于测试结果建立容量模型", 
                  PlanningStepType.MODELLING));
        steps.add(new PlanningStep(5, "规划制定", "制定详细的容量规划方案", 
                  PlanningStepType.PLANNING));
        steps.add(new PlanningStep(6, "方案验证", "验证规划方案的有效性", 
                  PlanningStepType.VALIDATION));
        
        return steps;
    }
    
    /**
     * 执行容量规划步骤
     */
    public PlanningStepResult executePlanningStep(CapacityPlanWizard wizard, 
                                                Map<String, Object> parameters) {
        PlanningStep currentStep = wizard.getCurrentStepInfo();
        PlanningStepResult result = new PlanningStepResult();
        result.setStepId(currentStep.getId());
        result.setStartTime(System.currentTimeMillis());
        
        try {
            switch (currentStep.getType()) {
                case ANALYSIS:
                    result = executeAnalysisStep(wizard, parameters);
                    break;
                case TESTING:
                    result = executeTestingStep(wizard, parameters);
                    break;
                case MODELLING:
                    result = executeModellingStep(wizard, parameters);
                    break;
                case PLANNING:
                    result = executePlanningStep(wizard, parameters);
                    break;
                case VALIDATION:
                    result = executeValidationStep(wizard, parameters);
                    break;
            }
            
            result.setStatus(PlanningStepStatus.COMPLETED);
        } catch (Exception e) {
            log.error("Failed to execute planning step: {}", currentStep.getId(), e);
            result.setStatus(PlanningStepStatus.FAILED);
            result.setErrorMessage(e.getMessage());
        }
        
        result.setEndTime(System.currentTimeMillis());
        return result;
    }
    
    /**
     * 执行分析步骤
     */
    private PlanningStepResult executeAnalysisStep(CapacityPlanWizard wizard,
                                                 Map<String, Object> parameters) {
        PlanningStepResult result = new PlanningStepResult();
        
        // 获取业务需求参数
        String expectedQps = (String) parameters.get("expectedQps");
        String peakQps = (String) parameters.get("peakQps");
        String slaRequirements = (String) parameters.get("slaRequirements");
        
        // 分析结果
        AnalysisResult analysisResult = new AnalysisResult();
        analysisResult.setExpectedQps(Long.parseLong(expectedQps));
        analysisResult.setPeakQps(Long.parseLong(peakQps));
        analysisResult.setSlaRequirements(slaRequirements);
        analysisResult.setAnalysisTime(System.currentTimeMillis());
        
        result.setData(analysisResult);
        result.setMessage("需求分析完成");
        
        return result;
    }
    
    /**
     * 执行测试步骤
     */
    private PlanningStepResult executeTestingStep(CapacityPlanWizard wizard,
                                                Map<String, Object> parameters) {
        PlanningStepResult result = new PlanningStepResult();
        
        // 创建压测配置
        LoadTestConfig config = new LoadTestConfig();
        config.setTargetQps(Long.parseLong((String) parameters.get("targetQps")));
        config.setDurationSeconds(Integer.parseInt((String) parameters.get("duration")));
        
        // 执行压测
        LoadTestTask task = loadTestManager.createLoadTestTask(config);
        
        // 等待压测完成
        waitForLoadTestCompletion(task.getTaskId());
        
        // 获取压测报告
        LoadTestReport report = getLoadTestReport(task.getTaskId());
        
        result.setData(report);
        result.setMessage("压测完成，生成报告");
        
        return result;
    }
    
    /**
     * 等待压测完成
     */
    private void waitForLoadTestCompletion(String taskId) {
        int maxWaitTime = 300; // 最大等待时间5分钟
        int waitCount = 0;
        
        while (waitCount < maxWaitTime) {
            try {
                LoadTestTask task = getLoadTestTask(taskId);
                if (LoadTestStatus.COMPLETED.equals(task.getStatus()) || 
                    LoadTestStatus.FAILED.equals(task.getStatus())) {
                    break;
                }
                Thread.sleep(1000); // 等待1秒
                waitCount++;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.warn("Failed to check load test status", e);
                break;
            }
        }
    }
    
    /**
     * 执行建模步骤
     */
    private PlanningStepResult executeModellingStep(CapacityPlanWizard wizard,
                                                  Map<String, Object> parameters) {
        PlanningStepResult result = new PlanningStepResult();
        
        // 获取压测任务ID
        String loadTestTaskId = (String) parameters.get("loadTestTaskId");
        
        // 生成容量模型
        CapacityModel model = capacityPlanningService.generateCapacityModel(loadTestTaskId);
        
        result.setData(model);
        result.setMessage("容量模型生成完成");
        
        return result;
    }
    
    /**
     * 执行规划步骤
     */
    private PlanningStepResult executePlanningStep(CapacityPlanWizard wizard,
                                                 Map<String, Object> parameters) {
        PlanningStepResult result = new PlanningStepResult();
        
        // 获取容量模型
        String capacityModelId = (String) parameters.get("capacityModelId");
        CapacityModel model = getCapacityModel(capacityModelId);
        
        // 生成容量规划方案
        CapacityPlanningScheme scheme = generatePlanningScheme(model, parameters);
        
        result.setData(scheme);
        result.setMessage("容量规划方案制定完成");
        
        return result;
    }
    
    /**
     * 生成规划方案
     */
    private CapacityPlanningScheme generatePlanningScheme(CapacityModel model,
                                                       Map<String, Object> parameters) {
        CapacityPlanningScheme scheme = new CapacityPlanningScheme();
        
        // 基于模型和参数生成方案
        scheme.setModelId(model.getTaskId());
        scheme.setTargetQps(Long.parseLong((String) parameters.get("targetQps")));
        scheme.setTargetResponseTime(Double.parseDouble((String) parameters.get("targetResponseTime")));
        scheme.setRecommendations(model.getRecommendations());
        scheme.setCreateTime(System.currentTimeMillis());
        
        // 生成资源需求
        Map<String, Object> resourceRequirements = calculateResourceRequirements(model, parameters);
        scheme.setResourceRequirements(resourceRequirements);
        
        return scheme;
    }
    
    /**
     * 计算资源需求
     */
    private Map<String, Object> calculateResourceRequirements(CapacityModel model,
                                                           Map<String, Object> parameters) {
        Map<String, Object> requirements = new HashMap<>();
        
        // 简化的资源计算逻辑
        long targetQps = Long.parseLong((String) parameters.get("targetQps"));
        double currentQps = model.getCharacteristics().getAvgQps();
        
        if (currentQps > 0) {
            double scaleRatio = targetQps / currentQps;
            requirements.put("instanceCount", Math.ceil(scaleRatio));
            requirements.put("cpuCores", Math.ceil(4 * scaleRatio)); // 假设每实例4核
            requirements.put("memoryGB", Math.ceil(8 * scaleRatio)); // 假设每实例8GB
        }
        
        return requirements;
    }
    
    /**
     * 执行验证步骤
     */
    private PlanningStepResult executeValidationStep(CapacityPlanWizard wizard,
                                                   Map<String, Object> parameters) {
        PlanningStepResult result = new PlanningStepResult();
        
        // 获取规划方案ID
        String schemeId = (String) parameters.get("schemeId");
        
        // 执行验证测试
        ValidationTestResult validationResult = executeValidationTest(schemeId, parameters);
        
        result.setData(validationResult);
        result.setMessage("规划方案验证完成");
        
        return result;
    }
    
    /**
     * 执行验证测试
     */
    private ValidationTestResult executeValidationTest(String schemeId,
                                                     Map<String, Object> parameters) {
        ValidationTestResult result = new ValidationTestResult();
        
        // 创建验证压测配置
        LoadTestConfig config = new LoadTestConfig();
        config.setTargetQps(Long.parseLong((String) parameters.get("validationQps")));
        config.setDurationSeconds(Integer.parseInt((String) parameters.get("validationDuration")));
        
        // 执行验证压测
        LoadTestTask task = loadTestManager.createLoadTestTask(config);
        
        // 等待完成
        waitForLoadTestCompletion(task.getTaskId());
        
        // 分析验证结果
        LoadTestReport report = getLoadTestReport(task.getTaskId());
        boolean isValid = analyzeValidationResult(report, parameters);
        
        result.setTestTaskId(task.getTaskId());
        result.setReport(report);
        result.setValid(isValid);
        result.setValidationTime(System.currentTimeMillis());
        
        return result;
    }
    
    /**
     * 分析验证结果
     */
    private boolean analyzeValidationResult(LoadTestReport report,
                                          Map<String, Object> parameters) {
        // 简化的验证逻辑
        PerformanceMetrics metrics = report.getMetricsList().stream()
            .map(LoadTestMetrics::getPerformanceMetrics)
            .max(Comparator.comparingDouble(PerformanceMetrics::getActualQps))
            .orElse(new PerformanceMetrics());
        
        long targetQps = Long.parseLong((String) parameters.get("validationQps"));
        double targetResponseTime = Double.parseDouble((String) parameters.get("targetResponseTime"));
        
        // 验证QPS和响应时间是否满足要求
        return metrics.getActualQps() >= targetQps * 0.9 && 
               metrics.getAvgResponseTime() <= targetResponseTime * 1.1;
    }
    
    // 数据访问方法
    private LoadTestTask getLoadTestTask(String taskId) {
        // 实现略
        return new LoadTestTask();
    }
    
    private LoadTestReport getLoadTestReport(String taskId) {
        // 实现略
        return new LoadTestReport();
    }
    
    private CapacityModel getCapacityModel(String modelId) {
        // 实现略
        return new CapacityModel();
    }
}

// 容量规划向导
@Data
public class CapacityPlanWizard {
    private String serviceName;
    private List<PlanningStep> steps;
    private int currentStep;
    private Map<String, PlanningStepResult> stepResults;
    private long createTime;
    
    public PlanningStep getCurrentStepInfo() {
        return steps.get(currentStep);
    }
}

// 规划步骤
@Data
public class PlanningStep {
    private int id;
    private String name;
    private String description;
    private PlanningStepType type;
}

// 规划步骤类型
public enum PlanningStepType {
    ANALYSIS, TESTING, MODELLING, PLANNING, VALIDATION
}

// 规划步骤结果
@Data
public class PlanningStepResult {
    private int stepId;
    private PlanningStepStatus status;
    private Object data;
    private String message;
    private String errorMessage;
    private long startTime;
    private long endTime;
}

// 规划步骤状态
public enum PlanningStepStatus {
    PENDING, RUNNING, COMPLETED, FAILED
}

// 分析结果
@Data
public class AnalysisResult {
    private long expectedQps;
    private long peakQps;
    private String slaRequirements;
    private long analysisTime;
}

// 容量规划方案
@Data
public class CapacityPlanningScheme {
    private String modelId;
    private long targetQps;
    private double targetResponseTime;
    private List<PlanningRecommendation> recommendations;
    private Map<String, Object> resourceRequirements;
    private long createTime;
}

// 验证测试结果
@Data
public class ValidationTestResult {
    private String testTaskId;
    private LoadTestReport report;
    private boolean valid;
    private long validationTime;
}
```

## 总结

通过限流平台进行全链路压测是现代分布式系统容量规划的重要手段。它不仅能够帮助我们准确评估系统性能，识别潜在瓶颈，还能为科学的容量规划提供数据支撑。

在实际应用中，我们需要建立完整的压测工具链，包括任务调度、数据采集、分析建模等环节，并结合业务特点制定合适的压测策略。只有这样，我们才能在系统上线前发现并解决性能问题，确保系统在高负载下依然能够稳定运行。

下一节我们将探讨第10章的第三部分：智能配额分配，这是自适应限流的重要组成部分。