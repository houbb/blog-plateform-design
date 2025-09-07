---
title: "告警与运维工具链集成: 自动创建工单、调用作业平台执行脚本"
date: 2025-08-30
categories: [Alarm]
tags: [Alarm]
published: true
---
在现代IT运维环境中，告警系统不再是一个孤立的工具，而是整个运维工具链中的关键一环。通过将告警系统与各种运维工具集成，可以实现自动化的工作流，显著提高故障响应速度和处理效率。本文将深入探讨如何将告警系统与工单系统、作业平台等运维工具链集成，实现自动化工单创建和脚本执行。

<!-- more -->

## 引言

随着企业IT环境的日益复杂化，单纯的告警通知已经无法满足现代运维的需求。当告警发生时，运维人员不仅需要及时收到通知，还需要能够快速采取行动来解决问题。这就要求告警系统能够与各种运维工具无缝集成，形成一个完整的自动化工作流。

告警与运维工具链集成的主要目标包括：
1. **自动化响应**：在告警触发时自动执行预定义的操作
2. **工单管理**：自动创建和更新工单，跟踪问题处理进度
3. **脚本执行**：调用作业平台执行诊断和修复脚本
4. **信息同步**：在不同系统间同步告警和处理信息

## 工单系统集成

### JIRA集成实现

#### JIRA API集成

```java
// JIRA工单管理器
@Service
public class JiraTicketManager {
    private final JiraRestClient jiraClient;
    private final TicketTemplateManager templateManager;
    private final AlertEventRepository alertEventRepository;
    
    public JiraTicketManager(JiraRestClient jiraClient,
                           TicketTemplateManager templateManager,
                           AlertEventRepository alertEventRepository) {
        this.jiraClient = jiraClient;
        this.templateManager = templateManager;
        this.alertEventRepository = alertEventRepository;
    }
    
    public String createTicketForAlert(AlertEvent event) {
        try {
            // 获取工单模板
            TicketTemplate template = templateManager.getTemplateForAlert(event);
            
            // 构建工单信息
            IssueInputBuilder issueBuilder = new IssueInputBuilder(
                template.getProjectKey(), 
                template.getIssueType(), 
                generateTicketSummary(event, template)
            );
            
            // 设置工单描述
            String description = generateTicketDescription(event, template);
            issueBuilder.setDescription(description);
            
            // 设置标签
            List<String> labels = generateLabels(event, template);
            issueBuilder.setLabels(labels.stream()
                .map(Label::label)
                .collect(Collectors.toList()));
            
            // 设置优先级
            String priority = determinePriority(event);
            issueBuilder.setPriority(Priority.valueOf(priority));
            
            // 设置分配人
            String assignee = determineAssignee(event);
            if (assignee != null) {
                issueBuilder.setAssigneeName(assignee);
            }
            
            // 添加自定义字段
            Map<String, Object> customFields = template.getCustomFields();
            for (Map.Entry<String, Object> entry : customFields.entrySet()) {
                issueBuilder.setFieldValue(entry.getKey(), entry.getValue());
            }
            
            // 创建工单
            IssueInput issueInput = issueBuilder.build();
            Promise<BasicIssue> issuePromise = jiraClient.getIssueClient().createIssue(issueInput);
            BasicIssue createdIssue = issuePromise.claim();
            
            // 关联告警和工单
            associateAlertWithTicket(event.getId(), createdIssue.getKey());
            
            // 记录日志
            logger.info("Created JIRA ticket {} for alert {}", createdIssue.getKey(), event.getId());
            
            return createdIssue.getKey();
        } catch (Exception e) {
            logger.error("Failed to create JIRA ticket for alert: " + event.getId(), e);
            throw new TicketCreationException("Failed to create JIRA ticket", e);
        }
    }
    
    private String generateTicketSummary(AlertEvent event, TicketTemplate template) {
        String summaryTemplate = template.getSummaryTemplate();
        if (summaryTemplate == null || summaryTemplate.isEmpty()) {
            return String.format("[%s] %s alert on %s", 
                event.getSeverity().toUpperCase(),
                event.getMetricName(),
                event.getLabels().getOrDefault("service", "unknown"));
        }
        
        // 使用模板引擎渲染摘要
        Map<String, Object> variables = new HashMap<>();
        variables.put("alert", event);
        variables.put("timestamp", new Date(event.getTimestamp()));
        variables.put("service", event.getLabels().get("service"));
        variables.put("severity", event.getSeverity());
        variables.put("metric", event.getMetricName());
        variables.put("value", event.getValue());
        
        return templateManager.renderTemplate(summaryTemplate, variables);
    }
    
    private String generateTicketDescription(AlertEvent event, TicketTemplate template) {
        String descriptionTemplate = template.getDescriptionTemplate();
        if (descriptionTemplate == null || descriptionTemplate.isEmpty()) {
            return generateDefaultDescription(event);
        }
        
        // 使用模板引擎渲染描述
        Map<String, Object> variables = new HashMap<>();
        variables.put("alert", event);
        variables.put("timestamp", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(event.getTimestamp())));
        variables.put("service", event.getLabels().get("service"));
        variables.put("severity", event.getSeverity());
        variables.put("metric", event.getMetricName());
        variables.put("value", event.getValue());
        variables.put("threshold", event.getThreshold());
        variables.put("labels", event.getLabels());
        variables.put("dashboardUrl", event.getDashboardUrl());
        variables.put("alertUrl", event.getAlertUrl());
        
        return templateManager.renderTemplate(descriptionTemplate, variables);
    }
    
    private String generateDefaultDescription(AlertEvent event) {
        StringBuilder description = new StringBuilder();
        description.append("## 告警详情\n\n");
        description.append(String.format("**告警名称**: %s\n", event.getName()));
        description.append(String.format("**指标名称**: %s\n", event.getMetricName()));
        description.append(String.format("**当前值**: %.2f\n", event.getValue()));
        description.append(String.format("**阈值**: %s\n", event.getThreshold()));
        description.append(String.format("**严重性**: %s\n", event.getSeverity()));
        description.append(String.format("**时间**: %s\n", 
            new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(event.getTimestamp()))));
        description.append(String.format("**服务**: %s\n", 
            event.getLabels().getOrDefault("service", "unknown")));
        description.append(String.format("**实例**: %s\n\n", 
            event.getLabels().getOrDefault("instance", "unknown")));
        
        description.append("## 标签信息\n\n");
        for (Map.Entry<String, String> entry : event.getLabels().entrySet()) {
            description.append(String.format("**%s**: %s\n", entry.getKey(), entry.getValue()));
        }
        description.append("\n");
        
        description.append("## 相关链接\n\n");
        if (event.getDashboardUrl() != null) {
            description.append(String.format("[监控面板](%s)\n", event.getDashboardUrl()));
        }
        if (event.getAlertUrl() != null) {
            description.append(String.format("[告警详情](%s)\n", event.getAlertUrl()));
        }
        
        return description.toString();
    }
    
    private List<String> generateLabels(AlertEvent event, TicketTemplate template) {
        List<String> labels = new ArrayList<>();
        
        // 添加模板定义的标签
        labels.addAll(template.getLabels());
        
        // 添加动态标签
        labels.add("alert");
        labels.add("severity-" + event.getSeverity());
        labels.add("service-" + event.getLabels().getOrDefault("service", "unknown"));
        labels.add("metric-" + event.getMetricName());
        
        // 根据环境添加标签
        String environment = event.getLabels().get("environment");
        if (environment != null) {
            labels.add("env-" + environment);
        }
        
        return labels;
    }
    
    private String determinePriority(AlertEvent event) {
        switch (event.getSeverity().toLowerCase()) {
            case "critical":
                return "Highest";
            case "high":
                return "High";
            case "medium":
                return "Medium";
            case "low":
                return "Low";
            default:
                return "Medium";
        }
    }
    
    private String determineAssignee(AlertEvent event) {
        // 根据服务和严重性确定分配人
        String service = event.getLabels().get("service");
        if (service != null) {
            return getOncallAssignee(service, event.getSeverity());
        }
        return null;
    }
    
    private String getOncallAssignee(String service, String severity) {
        // 从值班系统获取当前值班人员
        // 这里简化实现，实际应用中需要集成值班管理系统
        return "oncall-engineer";
    }
    
    private void associateAlertWithTicket(String alertId, String ticketKey) {
        // 在数据库中关联告警和工单
        alertEventRepository.updateTicketKey(alertId, ticketKey);
    }
    
    public void updateTicketStatus(String ticketKey, TicketStatus status, String comment) {
        try {
            // 添加注释
            if (comment != null && !comment.isEmpty()) {
                Issue issue = jiraClient.getIssueClient().getIssue(ticketKey).claim();
                CommentInput commentInput = new CommentInput(comment);
                jiraClient.getIssueClient().addComment(issue.getCommentsUri(), commentInput);
            }
            
            // 更新状态
            if (status != null) {
                Transition transition = findTransitionForStatus(ticketKey, status);
                if (transition != null) {
                    jiraClient.getIssueClient().transition(ticketKey, new TransitionInput(transition.getId()));
                }
            }
            
            logger.info("Updated JIRA ticket {} status to {}", ticketKey, status);
        } catch (Exception e) {
            logger.error("Failed to update JIRA ticket: " + ticketKey, e);
        }
    }
    
    private Transition findTransitionForStatus(String ticketKey, TicketStatus status) {
        try {
            Promise<Iterable<Transition>> transitionsPromise = 
                jiraClient.getIssueClient().getTransitions(ticketKey);
            Iterable<Transition> transitions = transitionsPromise.claim();
            
            String targetStatusName = status.getJiraStatusName();
            for (Transition transition : transitions) {
                if (transition.getToStatus().getName().equalsIgnoreCase(targetStatusName)) {
                    return transition;
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to find transition for status: " + status, e);
        }
        return null;
    }
    
    // 工单状态枚举
    public enum TicketStatus {
        OPEN("Open"),
        IN_PROGRESS("In Progress"),
        RESOLVED("Resolved"),
        CLOSED("Closed"),
        CANCELLED("Cancelled");
        
        private final String jiraStatusName;
        
        TicketStatus(String jiraStatusName) {
            this.jiraStatusName = jiraStatusName;
        }
        
        public String getJiraStatusName() {
            return jiraStatusName;
        }
    }
    
    // 工单创建异常类
    public static class TicketCreationException extends RuntimeException {
        public TicketCreationException(String message) {
            super(message);
        }
        
        public TicketCreationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
```

### 工单模板管理

```java
// 工单模板管理器
@Service
public class TicketTemplateManager {
    private final Map<String, TicketTemplate> templates = new ConcurrentHashMap<>();
    private final TemplateEngine templateEngine;
    
    public TicketTemplateManager(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
        initializeDefaultTemplates();
    }
    
    private void initializeDefaultTemplates() {
        // 严重告警模板
        TicketTemplate criticalTemplate = new TicketTemplate();
        criticalTemplate.setId("critical_alert");
        criticalTemplate.setName("严重告警工单模板");
        criticalTemplate.setProjectKey("OPS");
        criticalTemplate.setIssueType("Incident");
        criticalTemplate.setSummaryTemplate("[严重] {{service}}服务{{metric}}指标异常");
        criticalTemplate.setDescriptionTemplate(
            "## 告警信息\n\n" +
            "**服务**: {{service}}\n" +
            "**指标**: {{metric}}\n" +
            "**当前值**: {{value}}\n" +
            "**阈值**: {{threshold}}\n" +
            "**时间**: {{timestamp}}\n\n" +
            "## 处理建议\n\n" +
            "1. 立即检查服务状态\n" +
            "2. 查看监控面板: {{dashboardUrl}}\n" +
            "3. 执行诊断脚本\n" +
            "4. 必要时联系相关团队\n\n" +
            "## 相关链接\n\n" +
            "[告警详情]({{alertUrl}})"
        );
        criticalTemplate.setLabels(Arrays.asList("critical", "incident", "production"));
        criticalTemplate.setCustomFields(new HashMap<String, Object>() {{
            put("customfield_10001", "P1"); // 优先级字段
            put("customfield_10002", Arrays.asList("oncall-team")); // 通知组字段
        }});
        
        templates.put("critical_alert", criticalTemplate);
        
        // 一般告警模板
        TicketTemplate normalTemplate = new TicketTemplate();
        normalTemplate.setId("normal_alert");
        normalTemplate.setName("一般告警工单模板");
        normalTemplate.setProjectKey("OPS");
        normalTemplate.setIssueType("Task");
        normalTemplate.setSummaryTemplate("[{{severity}}] {{service}}服务{{metric}}指标异常");
        normalTemplate.setDescriptionTemplate(
            "## 告警信息\n\n" +
            "**服务**: {{service}}\n" +
            "**指标**: {{metric}}\n" +
            "**当前值**: {{value}}\n" +
            "**时间**: {{timestamp}}\n\n" +
            "## 相关链接\n\n" +
            "[告警详情]({{alertUrl}})\n" +
            "[监控面板]({{dashboardUrl}})"
        );
        normalTemplate.setLabels(Arrays.asList("alert", "monitoring"));
        
        templates.put("normal_alert", normalTemplate);
    }
    
    public TicketTemplate getTemplateForAlert(AlertEvent event) {
        // 根据告警特征选择模板
        String severity = event.getSeverity().toLowerCase();
        String service = event.getLabels().get("service");
        
        // 优先使用服务特定模板
        String serviceTemplateId = severity + "_alert_" + service;
        if (templates.containsKey(serviceTemplateId)) {
            return templates.get(serviceTemplateId);
        }
        
        // 使用严重性模板
        String severityTemplateId = severity + "_alert";
        if (templates.containsKey(severityTemplateId)) {
            return templates.get(severityTemplateId);
        }
        
        // 使用默认模板
        return templates.get("normal_alert");
    }
    
    public String renderTemplate(String template, Map<String, Object> variables) {
        try {
            return templateEngine.process(template, variables);
        } catch (Exception e) {
            logger.error("Failed to render template", e);
            return template; // 返回原始模板作为后备
        }
    }
    
    public void addTemplate(TicketTemplate template) {
        templates.put(template.getId(), template);
    }
    
    public void removeTemplate(String templateId) {
        templates.remove(templateId);
    }
    
    public List<TicketTemplate> getAllTemplates() {
        return new ArrayList<>(templates.values());
    }
    
    // 工单模板类
    public static class TicketTemplate {
        private String id;
        private String name;
        private String projectKey;
        private String issueType;
        private String summaryTemplate;
        private String descriptionTemplate;
        private List<String> labels;
        private Map<String, Object> customFields;
        private boolean enabled;
        
        // 构造函数
        public TicketTemplate() {
            this.labels = new ArrayList<>();
            this.customFields = new HashMap<>();
        }
        
        // getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getProjectKey() { return projectKey; }
        public void setProjectKey(String projectKey) { this.projectKey = projectKey; }
        public String getIssueType() { return issueType; }
        public void setIssueType(String issueType) { this.issueType = issueType; }
        public String getSummaryTemplate() { return summaryTemplate; }
        public void setSummaryTemplate(String summaryTemplate) { this.summaryTemplate = summaryTemplate; }
        public String getDescriptionTemplate() { return descriptionTemplate; }
        public void setDescriptionTemplate(String descriptionTemplate) { this.descriptionTemplate = descriptionTemplate; }
        public List<String> getLabels() { return labels; }
        public void setLabels(List<String> labels) { this.labels = labels; }
        public Map<String, Object> getCustomFields() { return customFields; }
        public void setCustomFields(Map<String, Object> customFields) { this.customFields = customFields; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }
}
```

## 作业平台集成

### Ansible集成实现

```java
// Ansible作业管理器
@Service
public class AnsibleJobManager {
    private final AnsibleApiClient ansibleClient;
    private final JobTemplateManager jobTemplateManager;
    private final JobExecutionHistoryService historyService;
    private final NotificationService notificationService;
    
    public AnsibleJobManager(AnsibleApiClient ansibleClient,
                           JobTemplateManager jobTemplateManager,
                           JobExecutionHistoryService historyService,
                           NotificationService notificationService) {
        this.ansibleClient = ansibleClient;
        this.jobTemplateManager = jobTemplateManager;
        this.historyService = historyService;
        this.notificationService = notificationService;
    }
    
    public JobExecutionResult executeDiagnosticJob(AlertEvent event) {
        try {
            // 获取作业模板
            JobTemplate template = jobTemplateManager.getDiagnosticTemplateForAlert(event);
            
            // 构建作业参数
            Map<String, Object> extraVars = buildJobVariables(event, template);
            
            // 执行作业
            JobLaunchRequest launchRequest = new JobLaunchRequest();
            launchRequest.setTemplateName(template.getName());
            launchRequest.setExtraVars(extraVars);
            launchRequest.setInventory(event.getLabels().get("service"));
            launchRequest.setLimit(buildHostLimit(event));
            
            JobLaunchResponse launchResponse = ansibleClient.launchJob(launchRequest);
            
            // 记录作业执行历史
            JobExecutionRecord record = new JobExecutionRecord();
            record.setAlertId(event.getId());
            record.setJobId(launchResponse.getJobId());
            record.setJobName(template.getName());
            record.setStartTime(System.currentTimeMillis());
            record.setStatus(JobStatus.RUNNING);
            historyService.recordJobExecution(record);
            
            // 监控作业执行状态
            return monitorJobExecution(record, template.getTimeoutSeconds());
        } catch (Exception e) {
            logger.error("Failed to execute diagnostic job for alert: " + event.getId(), e);
            return JobExecutionResult.failed("Failed to execute diagnostic job: " + e.getMessage());
        }
    }
    
    public JobExecutionResult executeRemediationJob(AlertEvent event, String action) {
        try {
            // 获取修复作业模板
            JobTemplate template = jobTemplateManager.getRemediationTemplateForAlert(event, action);
            
            if (template == null) {
                return JobExecutionResult.failed("No remediation template found for action: " + action);
            }
            
            // 构建作业参数
            Map<String, Object> extraVars = buildJobVariables(event, template);
            
            // 执行作业
            JobLaunchRequest launchRequest = new JobLaunchRequest();
            launchRequest.setTemplateName(template.getName());
            launchRequest.setExtraVars(extraVars);
            launchRequest.setInventory(event.getLabels().get("service"));
            launchRequest.setLimit(buildHostLimit(event));
            
            JobLaunchResponse launchResponse = ansibleClient.launchJob(launchRequest);
            
            // 记录作业执行历史
            JobExecutionRecord record = new JobExecutionRecord();
            record.setAlertId(event.getId());
            record.setJobId(launchResponse.getJobId());
            record.setJobName(template.getName());
            record.setStartTime(System.currentTimeMillis());
            record.setStatus(JobStatus.RUNNING);
            record.setAction(action);
            historyService.recordJobExecution(record);
            
            // 监控作业执行状态
            JobExecutionResult result = monitorJobExecution(record, template.getTimeoutSeconds());
            
            // 发送执行结果通知
            sendExecutionNotification(event, action, result);
            
            return result;
        } catch (Exception e) {
            logger.error("Failed to execute remediation job for alert: " + event.getId(), e);
            JobExecutionResult result = JobExecutionResult.failed(
                "Failed to execute remediation job: " + e.getMessage());
            sendExecutionNotification(event, action, result);
            return result;
        }
    }
    
    private Map<String, Object> buildJobVariables(AlertEvent event, JobTemplate template) {
        Map<String, Object> variables = new HashMap<>();
        
        // 添加告警相关信息
        variables.put("alert_id", event.getId());
        variables.put("alert_metric", event.getMetricName());
        variables.put("alert_value", event.getValue());
        variables.put("alert_threshold", event.getThreshold());
        variables.put("alert_severity", event.getSeverity());
        variables.put("alert_timestamp", event.getTimestamp());
        
        // 添加标签信息
        variables.put("alert_labels", event.getLabels());
        
        // 添加服务信息
        variables.put("service", event.getLabels().get("service"));
        variables.put("instance", event.getLabels().get("instance"));
        variables.put("environment", event.getLabels().get("environment"));
        
        // 添加模板定义的变量
        if (template.getExtraVars() != null) {
            variables.putAll(template.getExtraVars());
        }
        
        return variables;
    }
    
    private String buildHostLimit(AlertEvent event) {
        // 根据告警信息构建主机限制
        String instance = event.getLabels().get("instance");
        if (instance != null && !instance.isEmpty()) {
            return instance;
        }
        
        String service = event.getLabels().get("service");
        if (service != null && !service.isEmpty()) {
            return "service:" + service;
        }
        
        return null; // 不限制主机
    }
    
    private JobExecutionResult monitorJobExecution(JobExecutionRecord record, int timeoutSeconds) {
        long startTime = System.currentTimeMillis();
        long timeoutMs = timeoutSeconds * 1000L;
        
        while (System.currentTimeMillis() - startTime < timeoutMs) {
            try {
                // 查询作业状态
                JobStatusResponse statusResponse = ansibleClient.getJobStatus(record.getJobId());
                
                // 更新记录状态
                record.setStatus(convertAnsibleStatus(statusResponse.getStatus()));
                record.setStdout(statusResponse.getStdout());
                record.setStderr(statusResponse.getStderr());
                
                if (isJobCompleted(statusResponse.getStatus())) {
                    record.setEndTime(System.currentTimeMillis());
                    record.setExitCode(statusResponse.getExitCode());
                    historyService.updateJobExecution(record);
                    
                    // 构建执行结果
                    JobExecutionResult result = new JobExecutionResult();
                    result.setSuccess(statusResponse.getExitCode() == 0);
                    result.setJobId(record.getJobId());
                    result.setExitCode(statusResponse.getExitCode());
                    result.setStdout(statusResponse.getStdout());
                    result.setStderr(statusResponse.getStderr());
                    result.setDuration(System.currentTimeMillis() - record.getStartTime());
                    
                    if (result.isSuccess()) {
                        result.setMessage("Job executed successfully");
                    } else {
                        result.setMessage("Job failed with exit code: " + statusResponse.getExitCode());
                    }
                    
                    return result;
                }
                
                // 等待一段时间后重试
                Thread.sleep(5000); // 5秒轮询间隔
            } catch (Exception e) {
                logger.warn("Failed to check job status, retrying...", e);
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        
        // 超时处理
        record.setStatus(JobStatus.TIMEOUT);
        record.setEndTime(System.currentTimeMillis());
        historyService.updateJobExecution(record);
        
        return JobExecutionResult.failed("Job execution timeout after " + timeoutSeconds + " seconds");
    }
    
    private JobStatus convertAnsibleStatus(String ansibleStatus) {
        switch (ansibleStatus.toLowerCase()) {
            case "successful":
                return JobStatus.SUCCESS;
            case "failed":
                return JobStatus.FAILED;
            case "running":
                return JobStatus.RUNNING;
            case "pending":
                return JobStatus.PENDING;
            case "timeout":
                return JobStatus.TIMEOUT;
            case "canceled":
                return JobStatus.CANCELLED;
            default:
                return JobStatus.UNKNOWN;
        }
    }
    
    private boolean isJobCompleted(String ansibleStatus) {
        return "successful".equalsIgnoreCase(ansibleStatus) || 
               "failed".equalsIgnoreCase(ansibleStatus) ||
               "timeout".equalsIgnoreCase(ansibleStatus) ||
               "canceled".equalsIgnoreCase(ansibleStatus);
    }
    
    private void sendExecutionNotification(AlertEvent event, String action, JobExecutionResult result) {
        try {
            String message = String.format(
                "自动执行作业结果\n\n" +
                "告警ID: %s\n" +
                "执行动作: %s\n" +
                "执行结果: %s\n" +
                "退出码: %d\n" +
                "执行时间: %d ms",
                event.getId(), action, 
                result.isSuccess() ? "成功" : "失败",
                result.getExitCode(), result.getDuration());
            
            Notification notification = new Notification();
            notification.setAlertId(event.getId());
            notification.setTitle("自动作业执行结果");
            notification.setMessage(message);
            notification.setSeverity(result.isSuccess() ? "info" : "warning");
            
            notificationService.sendNotification(notification);
        } catch (Exception e) {
            logger.error("Failed to send execution notification", e);
        }
    }
    
    // 作业执行记录类
    public static class JobExecutionRecord {
        private String id;
        private String alertId;
        private String jobId;
        private String jobName;
        private String action;
        private JobStatus status;
        private long startTime;
        private long endTime;
        private int exitCode;
        private String stdout;
        private String stderr;
        
        // getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAlertId() { return alertId; }
        public void setAlertId(String alertId) { this.alertId = alertId; }
        public String getJobId() { return jobId; }
        public void setJobId(String jobId) { this.jobId = jobId; }
        public String getJobName() { return jobName; }
        public void setJobName(String jobName) { this.jobName = jobName; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public JobStatus getStatus() { return status; }
        public void setStatus(JobStatus status) { this.status = status; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
        public int getExitCode() { return exitCode; }
        public void setExitCode(int exitCode) { this.exitCode = exitCode; }
        public String getStdout() { return stdout; }
        public void setStdout(String stdout) { this.stdout = stdout; }
        public String getStderr() { return stderr; }
        public void setStderr(String stderr) { this.stderr = stderr; }
    }
    
    // 作业执行结果类
    public static class JobExecutionResult {
        private boolean success;
        private String jobId;
        private int exitCode;
        private String message;
        private String stdout;
        private String stderr;
        private long duration;
        
        public static JobExecutionResult success(String message) {
            JobExecutionResult result = new JobExecutionResult();
            result.success = true;
            result.message = message;
            return result;
        }
        
        public static JobExecutionResult failed(String message) {
            JobExecutionResult result = new JobExecutionResult();
            result.success = false;
            result.message = message;
            return result;
        }
        
        // getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getJobId() { return jobId; }
        public void setJobId(String jobId) { this.jobId = jobId; }
        public int getExitCode() { return exitCode; }
        public void setExitCode(int exitCode) { this.exitCode = exitCode; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getStdout() { return stdout; }
        public void setStdout(String stdout) { this.stdout = stdout; }
        public String getStderr() { return stderr; }
        public void setStderr(String stderr) { this.stderr = stderr; }
        public long getDuration() { return duration; }
        public void setDuration(long duration) { this.duration = duration; }
    }
    
    // 作业状态枚举
    public enum JobStatus {
        PENDING, RUNNING, SUCCESS, FAILED, TIMEOUT, CANCELLED, UNKNOWN
    }
}
```

### 作业模板管理

```java
// 作业模板管理器
@Service
public class JobTemplateManager {
    private final Map<String, JobTemplate> templates = new ConcurrentHashMap<>();
    
    public JobTemplateManager() {
        initializeDefaultTemplates();
    }
    
    private void initializeDefaultTemplates() {
        // 诊断作业模板
        JobTemplate diagnoseCpuTemplate = new JobTemplate();
        diagnoseCpuTemplate.setId("diagnose_cpu_high");
        diagnoseCpuTemplate.setName("diagnose_cpu_high");
        diagnoseCpuTemplate.setType(JobType.DIAGNOSTIC);
        diagnoseCpuTemplate.setMetricPattern("cpu.*");
        diagnoseCpuTemplate.setTimeoutSeconds(300);
        diagnoseCpuTemplate.setExtraVars(new HashMap<String, Object>() {{
            put("check_processes", true);
            put("check_top_processes", true);
            put("duration", "60");
        }});
        templates.put("diagnose_cpu_high", diagnoseCpuTemplate);
        
        JobTemplate diagnoseMemoryTemplate = new JobTemplate();
        diagnoseMemoryTemplate.setId("diagnose_memory_high");
        diagnoseMemoryTemplate.setName("diagnose_memory_high");
        diagnoseMemoryTemplate.setType(JobType.DIAGNOSTIC);
        diagnoseMemoryTemplate.setMetricPattern("memory.*");
        diagnoseMemoryTemplate.setTimeoutSeconds(300);
        diagnoseMemoryTemplate.setExtraVars(new HashMap<String, Object>() {{
            put("check_processes", true);
            put("check_top_memory", true);
        }});
        templates.put("diagnose_memory_high", diagnoseMemoryTemplate);
        
        // 修复作业模板
        JobTemplate restartServiceTemplate = new JobTemplate();
        restartServiceTemplate.setId("restart_service");
        restartServiceTemplate.setName("restart_service");
        restartServiceTemplate.setType(JobType.REMEDIATION);
        restartServiceTemplate.setAction("restart");
        restartServiceTemplate.setTimeoutSeconds(600);
        restartServiceTemplate.setExtraVars(new HashMap<String, Object>() {{
            put("service_name", "{{service}}");
            put("safe_mode", true);
        }});
        templates.put("restart_service", restartServiceTemplate);
        
        JobTemplate clearCacheTemplate = new JobTemplate();
        clearCacheTemplate.setId("clear_cache");
        clearCacheTemplate.setName("clear_cache");
        clearCacheTemplate.setType(JobType.REMEDIATION);
        clearCacheTemplate.setAction("clear_cache");
        clearCacheTemplate.setTimeoutSeconds(300);
        clearCacheTemplate.setExtraVars(new HashMap<String, Object>() {{
            put("cache_path", "/tmp/cache");
            put("force", false);
        }});
        templates.put("clear_cache", clearCacheTemplate);
    }
    
    public JobTemplate getDiagnosticTemplateForAlert(AlertEvent event) {
        String metricName = event.getMetricName();
        
        // 根据指标名称匹配模板
        for (JobTemplate template : templates.values()) {
            if (template.getType() == JobType.DIAGNOSTIC && 
                template.getMetricPattern() != null &&
                metricName.matches(template.getMetricPattern())) {
                return template;
            }
        }
        
        // 返回默认诊断模板
        return templates.get("diagnose_generic");
    }
    
    public JobTemplate getRemediationTemplateForAlert(AlertEvent event, String action) {
        // 根据服务和动作匹配模板
        String service = event.getLabels().get("service");
        String templateId = action + "_" + service;
        
        JobTemplate template = templates.get(templateId);
        if (template != null) {
            return template;
        }
        
        // 使用通用模板
        return templates.get(action);
    }
    
    public void addTemplate(JobTemplate template) {
        templates.put(template.getId(), template);
    }
    
    public void removeTemplate(String templateId) {
        templates.remove(templateId);
    }
    
    public List<JobTemplate> getAllTemplates() {
        return new ArrayList<>(templates.values());
    }
    
    // 作业模板类
    public static class JobTemplate {
        private String id;
        private String name;
        private JobType type;
        private String metricPattern;
        private String action;
        private int timeoutSeconds;
        private Map<String, Object> extraVars;
        private boolean enabled;
        private String description;
        
        // 构造函数
        public JobTemplate() {
            this.extraVars = new HashMap<>();
        }
        
        // getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public JobType getType() { return type; }
        public void setType(JobType type) { this.type = type; }
        public String getMetricPattern() { return metricPattern; }
        public void setMetricPattern(String metricPattern) { this.metricPattern = metricPattern; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public int getTimeoutSeconds() { return timeoutSeconds; }
        public void setTimeoutSeconds(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }
        public Map<String, Object> getExtraVars() { return extraVars; }
        public void setExtraVars(Map<String, Object> extraVars) { this.extraVars = extraVars; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    // 作业类型枚举
    public enum JobType {
        DIAGNOSTIC, REMEDIATION, MAINTENANCE
    }
}
```

## 自动化工作流

### 工作流引擎实现

```java
// 自动化工作流引擎
@Service
public class AutomationWorkflowEngine {
    private final JiraTicketManager ticketManager;
    private final AnsibleJobManager jobManager;
    private final AlertEventRepository alertEventRepository;
    private final WorkflowTemplateManager workflowTemplateManager;
    private final NotificationService notificationService;
    private final MeterRegistry meterRegistry;
    
    public AutomationWorkflowEngine(JiraTicketManager ticketManager,
                                  AnsibleJobManager jobManager,
                                  AlertEventRepository alertEventRepository,
                                  WorkflowTemplateManager workflowTemplateManager,
                                  NotificationService notificationService,
                                  MeterRegistry meterRegistry) {
        this.ticketManager = ticketManager;
        this.jobManager = jobManager;
        this.alertEventRepository = alertEventRepository;
        this.workflowTemplateManager = workflowTemplateManager;
        this.notificationService = notificationService;
        this.meterRegistry = meterRegistry;
    }
    
    public WorkflowExecutionResult executeWorkflow(AlertEvent event) {
        long startTime = System.currentTimeMillis();
        WorkflowExecutionResult result = new WorkflowExecutionResult();
        result.setAlertId(event.getId());
        result.setStartTime(startTime);
        
        try {
            // 获取工作流模板
            WorkflowTemplate template = workflowTemplateManager.getTemplateForAlert(event);
            if (template == null) {
                result.setSuccess(false);
                result.setMessage("No workflow template found for alert");
                return completeWorkflow(result, startTime);
            }
            
            result.setWorkflowName(template.getName());
            logger.info("Executing workflow {} for alert {}", template.getName(), event.getId());
            
            // 执行工作流步骤
            for (WorkflowStep step : template.getSteps()) {
                WorkflowStepResult stepResult = executeStep(event, step);
                result.addStepResult(stepResult);
                
                // 检查步骤执行结果
                if (!stepResult.isSuccess() && step.isCritical()) {
                    result.setSuccess(false);
                    result.setMessage("Critical step failed: " + step.getName());
                    return completeWorkflow(result, startTime);
                }
                
                // 如果步骤失败但非关键，记录并继续
                if (!stepResult.isSuccess()) {
                    logger.warn("Non-critical step failed: {} - {}", 
                        step.getName(), stepResult.getMessage());
                }
            }
            
            result.setSuccess(true);
            result.setMessage("Workflow executed successfully");
            return completeWorkflow(result, startTime);
        } catch (Exception e) {
            logger.error("Failed to execute workflow for alert: " + event.getId(), e);
            result.setSuccess(false);
            result.setMessage("Workflow execution failed: " + e.getMessage());
            return completeWorkflow(result, startTime);
        }
    }
    
    private WorkflowStepResult executeStep(AlertEvent event, WorkflowStep step) {
        WorkflowStepResult result = new WorkflowStepResult();
        result.setStepName(step.getName());
        result.setStartTime(System.currentTimeMillis());
        
        try {
            switch (step.getType()) {
                case CREATE_TICKET:
                    result = executeCreateTicketStep(event, step);
                    break;
                case EXECUTE_JOB:
                    result = executeJobStep(event, step);
                    break;
                case SEND_NOTIFICATION:
                    result = executeNotificationStep(event, step);
                    break;
                case WAIT:
                    result = executeWaitStep(step);
                    break;
                case CONDITIONAL:
                    result = executeConditionalStep(event, step);
                    break;
                default:
                    result.setSuccess(false);
                    result.setMessage("Unknown step type: " + step.getType());
            }
        } catch (Exception e) {
            logger.error("Failed to execute step: " + step.getName(), e);
            result.setSuccess(false);
            result.setMessage("Step execution failed: " + e.getMessage());
        } finally {
            result.setEndTime(System.currentTimeMillis());
            result.setDuration(result.getEndTime() - result.getStartTime());
        }
        
        return result;
    }
    
    private WorkflowStepResult executeCreateTicketStep(AlertEvent event, WorkflowStep step) {
        WorkflowStepResult result = new WorkflowStepResult();
        result.setStepName(step.getName());
        result.setStartTime(System.currentTimeMillis());
        
        try {
            String ticketKey = ticketManager.createTicketForAlert(event);
            
            result.setSuccess(true);
            result.setMessage("Ticket created: " + ticketKey);
            result.setOutput(new HashMap<String, Object>() {{
                put("ticketKey", ticketKey);
            }});
            
            // 更新告警事件
            alertEventRepository.updateTicketKey(event.getId(), ticketKey);
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Failed to create ticket: " + e.getMessage());
        } finally {
            result.setEndTime(System.currentTimeMillis());
            result.setDuration(result.getEndTime() - result.getStartTime());
        }
        
        return result;
    }
    
    private WorkflowStepResult executeJobStep(AlertEvent event, WorkflowStep step) {
        WorkflowStepResult result = new WorkflowStepResult();
        result.setStepName(step.getName());
        result.setStartTime(System.currentTimeMillis());
        
        try {
            String action = (String) step.getParameters().get("action");
            if (action == null) {
                result.setSuccess(false);
                result.setMessage("Missing action parameter for job step");
                return result;
            }
            
            AnsibleJobManager.JobExecutionResult jobResult = 
                jobManager.executeRemediationJob(event, action);
            
            result.setSuccess(jobResult.isSuccess());
            result.setMessage(jobResult.getMessage());
            result.setOutput(new HashMap<String, Object>() {{
                put("jobId", jobResult.getJobId());
                put("exitCode", jobResult.getExitCode());
                put("duration", jobResult.getDuration());
            }});
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Failed to execute job: " + e.getMessage());
        } finally {
            result.setEndTime(System.currentTimeMillis());
            result.setDuration(result.getEndTime() - result.getStartTime());
        }
        
        return result;
    }
    
    private WorkflowStepResult executeNotificationStep(AlertEvent event, WorkflowStep step) {
        WorkflowStepResult result = new WorkflowStepResult();
        result.setStepName(step.getName());
        result.setStartTime(System.currentTimeMillis());
        
        try {
            String message = (String) step.getParameters().get("message");
            String severity = (String) step.getParameters().get("severity");
            
            Notification notification = new Notification();
            notification.setAlertId(event.getId());
            notification.setTitle("Workflow Notification");
            notification.setMessage(message);
            notification.setSeverity(severity != null ? severity : "info");
            
            notificationService.sendNotification(notification);
            
            result.setSuccess(true);
            result.setMessage("Notification sent successfully");
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Failed to send notification: " + e.getMessage());
        } finally {
            result.setEndTime(System.currentTimeMillis());
            result.setDuration(result.getEndTime() - result.getStartTime());
        }
        
        return result;
    }
    
    private WorkflowStepResult executeWaitStep(WorkflowStep step) {
        WorkflowStepResult result = new WorkflowStepResult();
        result.setStepName(step.getName());
        result.setStartTime(System.currentTimeMillis());
        
        try {
            Integer duration = (Integer) step.getParameters().get("duration");
            if (duration != null) {
                Thread.sleep(duration * 1000L);
            }
            
            result.setSuccess(true);
            result.setMessage("Wait completed");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            result.setSuccess(false);
            result.setMessage("Wait interrupted");
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Wait failed: " + e.getMessage());
        } finally {
            result.setEndTime(System.currentTimeMillis());
            result.setDuration(result.getEndTime() - result.getStartTime());
        }
        
        return result;
    }
    
    private WorkflowStepResult executeConditionalStep(AlertEvent event, WorkflowStep step) {
        WorkflowStepResult result = new WorkflowStepResult();
        result.setStepName(step.getName());
        result.setStartTime(System.currentTimeMillis());
        
        try {
            String condition = (String) step.getParameters().get("condition");
            if (condition == null) {
                result.setSuccess(false);
                result.setMessage("Missing condition parameter");
                return result;
            }
            
            // 评估条件
            boolean conditionResult = evaluateCondition(event, condition);
            
            result.setSuccess(true);
            result.setMessage("Condition evaluated: " + conditionResult);
            result.setOutput(new HashMap<String, Object>() {{
                put("condition", condition);
                put("result", conditionResult);
            }});
        } catch (Exception e) {
            result.setSuccess(false);
            result.setMessage("Failed to evaluate condition: " + e.getMessage());
        } finally {
            result.setEndTime(System.currentTimeMillis());
            result.setDuration(result.getEndTime() - result.getStartTime());
        }
        
        return result;
    }
    
    private boolean evaluateCondition(AlertEvent event, String condition) {
        // 简化的条件评估实现
        // 实际应用中可能需要更复杂的表达式引擎
        switch (condition) {
            case "severity_critical":
                return "critical".equalsIgnoreCase(event.getSeverity());
            case "severity_high":
                return "high".equalsIgnoreCase(event.getSeverity());
            case "production_environment":
                return "production".equalsIgnoreCase(event.getLabels().get("environment"));
            default:
                return false;
        }
    }
    
    private WorkflowExecutionResult completeWorkflow(WorkflowExecutionResult result, long startTime) {
        result.setEndTime(System.currentTimeMillis());
        result.setDuration(result.getEndTime() - startTime);
        
        // 记录指标
        recordMetrics(result);
        
        // 更新告警状态
        if (result.isSuccess()) {
            alertEventRepository.updateWorkflowStatus(result.getAlertId(), "completed");
        } else {
            alertEventRepository.updateWorkflowStatus(result.getAlertId(), "failed");
        }
        
        logger.info("Workflow {} completed for alert {} in {} ms - {}",
            result.getWorkflowName(), result.getAlertId(), result.getDuration(),
            result.isSuccess() ? "SUCCESS" : "FAILED");
        
        return result;
    }
    
    private void recordMetrics(WorkflowExecutionResult result) {
        Timer.builder("workflow.execution.duration")
            .tag("workflow", result.getWorkflowName() != null ? result.getWorkflowName() : "unknown")
            .tag("success", String.valueOf(result.isSuccess()))
            .register(meterRegistry)
            .record(result.getDuration(), TimeUnit.MILLISECONDS);
            
        Counter.builder("workflow.execution.count")
            .tag("workflow", result.getWorkflowName() != null ? result.getWorkflowName() : "unknown")
            .tag("success", String.valueOf(result.isSuccess()))
            .register(meterRegistry)
            .increment();
    }
    
    // 工作流执行结果类
    public static class WorkflowExecutionResult {
        private String alertId;
        private String workflowName;
        private boolean success;
        private String message;
        private long startTime;
        private long endTime;
        private long duration;
        private List<WorkflowStepResult> stepResults = new ArrayList<>();
        
        public void addStepResult(WorkflowStepResult stepResult) {
            stepResults.add(stepResult);
        }
        
        // getters and setters
        public String getAlertId() { return alertId; }
        public void setAlertId(String alertId) { this.alertId = alertId; }
        public String getWorkflowName() { return workflowName; }
        public void setWorkflowName(String workflowName) { this.workflowName = workflowName; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
        public long getDuration() { return duration; }
        public void setDuration(long duration) { this.duration = duration; }
        public List<WorkflowStepResult> getStepResults() { return stepResults; }
        public void setStepResults(List<WorkflowStepResult> stepResults) { this.stepResults = stepResults; }
    }
    
    // 工作流步骤结果类
    public static class WorkflowStepResult {
        private String stepName;
        private boolean success;
        private String message;
        private long startTime;
        private long endTime;
        private long duration;
        private Map<String, Object> output;
        
        // getters and setters
        public String getStepName() { return stepName; }
        public void setStepName(String stepName) { this.stepName = stepName; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
        public long getDuration() { return duration; }
        public void setDuration(long duration) { this.duration = duration; }
        public Map<String, Object> getOutput() { return output; }
        public void setOutput(Map<String, Object> output) { this.output = output; }
    }
}
```

### 工作流模板管理

```java
// 工作流模板管理器
@Service
public class WorkflowTemplateManager {
    private final Map<String, WorkflowTemplate> templates = new ConcurrentHashMap<>();
    
    public WorkflowTemplateManager() {
        initializeDefaultTemplates();
    }
    
    private void initializeDefaultTemplates() {
        // 严重告警工作流模板
        WorkflowTemplate criticalWorkflow = new WorkflowTemplate();
        criticalWorkflow.setId("critical_alert_workflow");
        criticalWorkflow.setName("严重告警处理流程");
        criticalWorkflow.setDescription("处理严重级别告警的自动化工作流");
        criticalWorkflow.setSeverity("critical");
        
        List<WorkflowStep> steps = new ArrayList<>();
        
        // 步骤1: 创建工单
        WorkflowStep createTicketStep = new WorkflowStep();
        createTicketStep.setName("创建工单");
        createTicketStep.setType(WorkflowStepType.CREATE_TICKET);
        createTicketStep.setCritical(true);
        steps.add(createTicketStep);
        
        // 步骤2: 执行诊断作业
        WorkflowStep diagnoseStep = new WorkflowStep();
        diagnoseStep.setName("执行诊断");
        diagnoseStep.setType(WorkflowStepType.EXECUTE_JOB);
        diagnoseStep.setCritical(false);
        diagnoseStep.setParameters(new HashMap<String, Object>() {{
            put("action", "diagnose");
        }});
        steps.add(diagnoseStep);
        
        // 步骤3: 等待30秒
        WorkflowStep waitStep = new WorkflowStep();
        waitStep.setName("等待诊断结果");
        waitStep.setType(WorkflowStepType.WAIT);
        waitStep.setCritical(false);
        waitStep.setParameters(new HashMap<String, Object>() {{
            put("duration", 30);
        }});
        steps.add(waitStep);
        
        // 步骤4: 发送通知
        WorkflowStep notifyStep = new WorkflowStep();
        notifyStep.setName("发送诊断完成通知");
        notifyStep.setType(WorkflowStepType.SEND_NOTIFICATION);
        notifyStep.setCritical(false);
        notifyStep.setParameters(new HashMap<String, Object>() {{
            put("message", "诊断作业已完成，请查看结果");
            put("severity", "info");
        }});
        steps.add(notifyStep);
        
        criticalWorkflow.setSteps(steps);
        templates.put("critical_alert_workflow", criticalWorkflow);
        
        // 高级别告警工作流模板
        WorkflowTemplate highWorkflow = new WorkflowTemplate();
        highWorkflow.setId("high_alert_workflow");
        highWorkflow.setName("高级别告警处理流程");
        highWorkflow.setDescription("处理高级别告警的自动化工作流");
        highWorkflow.setSeverity("high");
        
        List<WorkflowStep> highSteps = new ArrayList<>();
        
        // 步骤1: 创建工单
        WorkflowStep highCreateTicketStep = new WorkflowStep();
        highCreateTicketStep.setName("创建工单");
        highCreateTicketStep.setType(WorkflowStepType.CREATE_TICKET);
        highCreateTicketStep.setCritical(true);
        highSteps.add(highCreateTicketStep);
        
        // 步骤2: 发送通知
        WorkflowStep highNotifyStep = new WorkflowStep();
        highNotifyStep.setName("发送通知");
        highNotifyStep.setType(WorkflowStepType.SEND_NOTIFICATION);
        highNotifyStep.setCritical(false);
        highNotifyStep.setParameters(new HashMap<String, Object>() {{
            put("message", "已创建工单处理此告警");
            put("severity", "info");
        }});
        highSteps.add(highNotifyStep);
        
        highWorkflow.setSteps(highSteps);
        templates.put("high_alert_workflow", highWorkflow);
    }
    
    public WorkflowTemplate getTemplateForAlert(AlertEvent event) {
        String severity = event.getSeverity().toLowerCase();
        
        // 根据严重性获取模板
        String templateId = severity + "_alert_workflow";
        WorkflowTemplate template = templates.get(templateId);
        if (template != null) {
            return template;
        }
        
        // 根据服务获取模板
        String service = event.getLabels().get("service");
        if (service != null) {
            templateId = severity + "_alert_workflow_" + service;
            template = templates.get(templateId);
            if (template != null) {
                return template;
            }
        }
        
        // 返回默认模板
        return templates.get("default_workflow");
    }
    
    public void addTemplate(WorkflowTemplate template) {
        templates.put(template.getId(), template);
    }
    
    public void removeTemplate(String templateId) {
        templates.remove(templateId);
    }
    
    public List<WorkflowTemplate> getAllTemplates() {
        return new ArrayList<>(templates.values());
    }
    
    // 工作流模板类
    public static class WorkflowTemplate {
        private String id;
        private String name;
        private String description;
        private String severity;
        private String service;
        private List<WorkflowStep> steps;
        private boolean enabled;
        private String createdBy;
        private long createdAt;
        private long updatedAt;
        
        // 构造函数
        public WorkflowTemplate() {
            this.steps = new ArrayList<>();
        }
        
        // getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public String getService() { return service; }
        public void setService(String service) { this.service = service; }
        public List<WorkflowStep> getSteps() { return steps; }
        public void setSteps(List<WorkflowStep> steps) { this.steps = steps; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public long getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }
    }
    
    // 工作流步骤类
    public static class WorkflowStep {
        private String name;
        private WorkflowStepType type;
        private Map<String, Object> parameters;
        private boolean critical;
        private String condition;
        
        // 构造函数
        public WorkflowStep() {
            this.parameters = new HashMap<>();
        }
        
        // getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public WorkflowStepType getType() { return type; }
        public void setType(WorkflowStepType type) { this.type = type; }
        public Map<String, Object> getParameters() { return parameters; }
        public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
        public boolean isCritical() { return critical; }
        public void setCritical(boolean critical) { this.critical = critical; }
        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }
    }
    
    // 工作流步骤类型枚举
    public enum WorkflowStepType {
        CREATE_TICKET, EXECUTE_JOB, SEND_NOTIFICATION, WAIT, CONDITIONAL
    }
}
```

## 集成监控与告警

### 集成健康检查

```java
// 集成健康检查器
@Component
public class IntegrationHealthChecker {
    private final JiraRestClient jiraClient;
    private final AnsibleApiClient ansibleClient;
    private final MeterRegistry meterRegistry;
    private final ScheduledExecutorService healthCheckExecutor;
    
    public IntegrationHealthChecker(JiraRestClient jiraClient,
                                  AnsibleApiClient ansibleClient,
                                  MeterRegistry meterRegistry) {
        this.jiraClient = jiraClient;
        this.ansibleClient = ansibleClient;
        this.meterRegistry = meterRegistry;
        this.healthCheckExecutor = Executors.newScheduledThreadPool(2);
        
        // 定期执行健康检查
        healthCheckExecutor.scheduleAtFixedRate(this::checkJiraHealth, 
                                              60, 300, TimeUnit.SECONDS); // 每5分钟检查一次
        healthCheckExecutor.scheduleAtFixedRate(this::checkAnsibleHealth, 
                                              60, 300, TimeUnit.SECONDS); // 每5分钟检查一次
    }
    
    public void checkJiraHealth() {
        try {
            // 检查JIRA连接
            Promise<ServerInfo> serverInfoPromise = jiraClient.getMetadataClient().getServerInfo();
            ServerInfo serverInfo = serverInfoPromise.claim();
            
            // 记录健康状态
            Gauge.builder("integration.jira.health")
                .register(meterRegistry, 1.0);
                
            logger.debug("JIRA health check successful - Version: {}", serverInfo.getVersion());
        } catch (Exception e) {
            logger.warn("JIRA health check failed", e);
            Gauge.builder("integration.jira.health")
                .register(meterRegistry, 0.0);
                
            // 发送告警
            sendHealthAlert("JIRA", e.getMessage());
        }
    }
    
    public void checkAnsibleHealth() {
        try {
            // 检查Ansible连接
            boolean isHealthy = ansibleClient.ping();
            
            // 记录健康状态
            Gauge.builder("integration.ansible.health")
                .register(meterRegistry, isHealthy ? 1.0 : 0.0);
                
            if (isHealthy) {
                logger.debug("Ansible health check successful");
            } else {
                logger.warn("Ansible health check failed");
                sendHealthAlert("Ansible", "Ping failed");
            }
        } catch (Exception e) {
            logger.warn("Ansible health check failed", e);
            Gauge.builder("integration.ansible.health")
                .register(meterRegistry, 0.0);
                
            sendHealthAlert("Ansible", e.getMessage());
        }
    }
    
    private void sendHealthAlert(String system, String errorMessage) {
        // 发送集成系统健康告警
        logger.error("Integration system {} is unhealthy: {}", system, errorMessage);
        // 实现告警发送逻辑
    }
    
    // 告警规则
    @Bean
    public List<AlertRule> integrationAlertRules() {
        List<AlertRule> rules = new ArrayList<>();
        
        // JIRA集成失败告警
        AlertRule jiraFailureRule = new AlertRule();
        jiraFailureRule.setName("JIRA Integration Failure");
        jiraFailureRule.setCondition("integration_jira_health == 0");
        jiraFailureRule.setSeverity("high");
        jiraFailureRule.setDescription("JIRA集成系统连接失败");
        rules.add(jiraFailureRule);
        
        // Ansible集成失败告警
        AlertRule ansibleFailureRule = new AlertRule();
        ansibleFailureRule.setName("Ansible Integration Failure");
        ansibleFailureRule.setCondition("integration_ansible_health == 0");
        ansibleFailureRule.setSeverity("high");
        ansibleFailureRule.setDescription("Ansible集成系统连接失败");
        rules.add(ansibleFailureRule);
        
        return rules;
    }
}
```

## 最佳实践

### 配置管理

```yaml
# 工具链集成配置示例
integration:
  jira:
    enabled: true
    url: "https://jira.company.com"
    username: "alert-system"
    password: "${JIRA_PASSWORD}"
    timeout_seconds: 30
    project_key: "OPS"
    default_issue_type: "Task"
  ansible:
    enabled: true
    url: "https://ansible.company.com"
    username: "alert-system"
    password: "${ANSIBLE_PASSWORD}"
    timeout_seconds: 60
    default_inventory: "production"
  workflow:
    enabled: true
    default_timeout_seconds: 300
    max_concurrent_workflows: 10
  health_check:
    enabled: true
    interval_seconds: 300
    alert_threshold: 3 # 连续3次失败后告警
```

### 安全考虑

```java
// 集成安全管理器
@Service
public class IntegrationSecurityManager {
    private final EncryptionService encryptionService;
    private final AccessControlService accessControlService;
    
    public IntegrationSecurityManager(EncryptionService encryptionService,
                                   AccessControlService accessControlService) {
        this.encryptionService = encryptionService;
        this.accessControlService = accessControlService;
    }
    
    public String encryptCredential(String plainText) {
        return encryptionService.encrypt(plainText);
    }
    
    public String decryptCredential(String encryptedText) {
        return encryptionService.decrypt(encryptedText);
    }
    
    public boolean checkPermission(String userId, String action, String resource) {
        return accessControlService.checkPermission(userId, action, resource);
    }
    
    public void auditIntegrationAction(String userId, String action, String details) {
        // 记录集成操作审计日志
        logger.info("Integration action audited - User: {}, Action: {}, Details: {}", 
                   userId, action, details);
    }
}
```

## 结论

告警与运维工具链的集成是构建现代化智能报警平台的关键环节。通过将告警系统与工单系统、作业平台等运维工具无缝集成，我们可以实现自动化的工作流，显著提高故障响应速度和处理效率。

关键要点包括：

1. **工单系统集成**：自动化工单创建和状态更新，确保问题得到有效跟踪
2. **作业平台集成**：自动执行诊断和修复脚本，实现快速响应
3. **工作流自动化**：编排复杂的处理流程，提高处理一致性
4. **监控与告警**：持续监控集成系统健康状态，及时发现和处理问题
5. **安全考虑**：确保集成过程中的数据安全和访问控制

通过合理设计和实现这些集成功能，我们可以构建出真正高效、智能、可靠的运维工具链集成系统，为业务的稳定运行提供有力保障。