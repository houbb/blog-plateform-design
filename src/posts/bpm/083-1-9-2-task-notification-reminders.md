---
title: "任务通知与催办: 多渠道消息触达与自动催办机制"
date: 2025-09-06
categories: [Bpm]
tags: [Bpm]
published: true
---
在企业级BPM平台中，及时有效的任务通知与催办机制是确保业务流程顺畅运行的关键因素。无论任务分配得多么合理，如果任务处理者不能及时收到通知，或者在任务逾期时没有适当的催办机制，都会严重影响业务流程的效率和质量。本章将深入探讨多渠道消息触达机制和自动催办策略的实现。

## 任务通知的核心价值

### 及时性保障
任务通知的首要目标是确保任务处理者能够在第一时间获知新分配的任务，避免因信息传递延迟而导致的流程延误。

### 多渠道覆盖
不同的用户可能偏好不同的通知方式，通过多渠道通知可以确保信息能够有效传达给所有相关人员。

### 个性化体验
根据用户偏好和任务紧急程度提供个性化的通知策略，提升用户体验和任务处理效率。

## 多渠道消息触达机制

现代企业环境中，用户可能通过多种渠道接收信息。一个完善的通知系统应该支持多种通知方式，并能够根据用户偏好和任务特性选择合适的渠道。

```java
// 多渠道通知服务
@Service
public class MultiChannelNotificationService {
    
    @Autowired
    private EmailNotificationService emailNotificationService;
    
    @Autowired
    private SMSNotificationService smsNotificationService;
    
    @Autowired
    private PushNotificationService pushNotificationService;
    
    @Autowired
    private InAppNotificationService inAppNotificationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationTemplateRepository notificationTemplateRepository;
    
    /**
     * 发送多渠道任务通知
     * @param task 任务对象
     * @param recipient 接收者
     * @param notificationType 通知类型
     * @return 通知结果
     */
    public NotificationResult sendTaskNotification(Task task, User recipient, 
        NotificationType notificationType) {
        
        NotificationResult result = new NotificationResult();
        result.setTaskId(task.getId());
        result.setRecipientId(recipient.getId());
        result.setNotificationTime(new Date());
        
        try {
            // 获取用户通知偏好设置
            UserNotificationPreference preference = getUserNotificationPreference(recipient.getId());
            
            // 根据通知类型和用户偏好选择通知渠道
            List<NotificationChannel> channels = selectNotificationChannels(
                notificationType, preference);
            
            // 发送通知到各个渠道
            List<ChannelNotificationResult> channelResults = new ArrayList<>();
            
            for (NotificationChannel channel : channels) {
                ChannelNotificationResult channelResult = sendNotificationToChannel(
                    task, recipient, notificationType, channel);
                channelResults.add(channelResult);
            }
            
            result.setSuccess(true);
            result.setChannelResults(channelResults);
            result.setMessage("通知发送成功");
            
        } catch (Exception e) {
            log.error("任务通知发送失败 - 任务ID: {}, 接收者ID: {}", task.getId(), recipient.getId(), e);
            result.setSuccess(false);
            result.setErrorMessage("通知发送过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取用户通知偏好设置
     * @param userId 用户ID
     * @return 通知偏好设置
     */
    private UserNotificationPreference getUserNotificationPreference(String userId) {
        UserNotificationPreference preference = userNotificationPreferenceRepository
            .findByUserId(userId);
        
        // 如果用户没有设置偏好，使用默认设置
        if (preference == null) {
            preference = createDefaultNotificationPreference(userId);
        }
        
        return preference;
    }
    
    /**
     * 创建默认通知偏好设置
     * @param userId 用户ID
     * @return 默认通知偏好设置
     */
    private UserNotificationPreference createDefaultNotificationPreference(String userId) {
        UserNotificationPreference preference = new UserNotificationPreference();
        preference.setUserId(userId);
        preference.setEmailEnabled(true);
        preference.setSmsEnabled(false);
        preference.setPushEnabled(true);
        preference.setInAppEnabled(true);
        preference.setWorkHoursOnly(false);
        preference.setQuietHoursStart("22:00");
        preference.setQuietHoursEnd("08:00");
        
        userNotificationPreferenceRepository.save(preference);
        return preference;
    }
    
    /**
     * 根据通知类型和用户偏好选择通知渠道
     * @param notificationType 通知类型
     * @param preference 用户偏好
     * @return 通知渠道列表
     */
    private List<NotificationChannel> selectNotificationChannels(
        NotificationType notificationType, UserNotificationPreference preference) {
        
        List<NotificationChannel> channels = new ArrayList<>();
        
        // 根据通知类型确定必需渠道
        switch (notificationType) {
            case TASK_ASSIGNMENT:
                // 任务分配通常需要确保用户收到通知
                if (preference.isEmailEnabled()) channels.add(NotificationChannel.EMAIL);
                if (preference.isInAppEnabled()) channels.add(NotificationChannel.IN_APP);
                if (preference.isPushEnabled()) channels.add(NotificationChannel.PUSH);
                break;
                
            case TASK_REMINDER:
                // 任务提醒可以根据用户偏好选择
                if (preference.isEmailEnabled()) channels.add(NotificationChannel.EMAIL);
                if (preference.isSmsEnabled()) channels.add(NotificationChannel.SMS);
                if (preference.isPushEnabled()) channels.add(NotificationChannel.PUSH);
                break;
                
            case TASK_OVERDUE:
                // 任务逾期通常需要更强烈的提醒
                channels.add(NotificationChannel.EMAIL);
                channels.add(NotificationChannel.SMS);
                channels.add(NotificationChannel.IN_APP);
                channels.add(NotificationChannel.PUSH);
                break;
                
            case TASK_COMPLETED:
                // 任务完成通知通常较为简单
                if (preference.isEmailEnabled()) channels.add(NotificationChannel.EMAIL);
                if (preference.isInAppEnabled()) channels.add(NotificationChannel.IN_APP);
                break;
        }
        
        return channels;
    }
    
    /**
     * 发送通知到指定渠道
     * @param task 任务对象
     * @param recipient 接收者
     * @param notificationType 通知类型
     * @param channel 通知渠道
     * @return 渠道通知结果
     */
    private ChannelNotificationResult sendNotificationToChannel(Task task, User recipient,
        NotificationType notificationType, NotificationChannel channel) {
        
        ChannelNotificationResult result = new ChannelNotificationResult();
        result.setChannel(channel);
        result.setSendTime(new Date());
        
        try {
            // 获取通知模板
            NotificationTemplate template = getNotificationTemplate(notificationType, channel);
            
            // 渲染通知内容
            NotificationContent content = renderNotificationContent(template, task, recipient);
            
            // 发送通知
            switch (channel) {
                case EMAIL:
                    emailNotificationService.sendEmail(recipient.getEmail(), 
                        content.getSubject(), content.getBody());
                    break;
                    
                case SMS:
                    smsNotificationService.sendSms(recipient.getPhoneNumber(), content.getBody());
                    break;
                    
                case PUSH:
                    pushNotificationService.sendPushNotification(recipient.getDeviceToken(), 
                        content.getTitle(), content.getBody());
                    break;
                    
                case IN_APP:
                    inAppNotificationService.createInAppNotification(recipient.getId(), 
                        content.getTitle(), content.getBody(), task.getId());
                    break;
            }
            
            result.setSuccess(true);
            result.setMessage("通知发送成功");
            
        } catch (Exception e) {
            log.error("渠道通知发送失败 - 渠道: {}, 任务ID: {}", channel, task.getId(), e);
            result.setSuccess(false);
            result.setErrorMessage("通知发送失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取通知模板
     * @param notificationType 通知类型
     * @param channel 通知渠道
     * @return 通知模板
     */
    private NotificationTemplate getNotificationTemplate(NotificationType notificationType, 
        NotificationChannel channel) {
        
        String templateKey = notificationType.name() + "_" + channel.name();
        NotificationTemplate template = notificationTemplateRepository.findByKey(templateKey);
        
        // 如果没有找到特定模板，使用默认模板
        if (template == null) {
            template = notificationTemplateRepository.findByKey("DEFAULT_" + channel.name());
        }
        
        return template;
    }
    
    /**
     * 渲染通知内容
     * @param template 模板
     * @param task 任务
     * @param recipient 接收者
     * @return 通知内容
     */
    private NotificationContent renderNotificationContent(NotificationTemplate template, 
        Task task, User recipient) {
        
        NotificationContent content = new NotificationContent();
        
        // 替换模板中的变量
        String subject = replaceTemplateVariables(template.getSubject(), task, recipient);
        String body = replaceTemplateVariables(template.getBody(), task, recipient);
        String title = replaceTemplateVariables(template.getTitle(), task, recipient);
        
        content.setSubject(subject);
        content.setBody(body);
        content.setTitle(title);
        
        return content;
    }
    
    /**
     * 替换模板变量
     * @param template 模板内容
     * @param task 任务
     * @param recipient 接收者
     * @return 替换后的内容
     */
    private String replaceTemplateVariables(String template, Task task, User recipient) {
        if (template == null) return "";
        
        return template
            .replace("${task.title}", task.getTitle())
            .replace("${task.description}", task.getDescription())
            .replace("${task.dueDate}", formatDateTime(task.getDueDate()))
            .replace("${task.priority}", task.getPriority().toString())
            .replace("${recipient.name}", recipient.getName())
            .replace("${recipient.email}", recipient.getEmail())
            .replace("${system.url}", systemConfig.getBaseUrl());
    }
}
```

## 个性化通知策略

不同用户有不同的通知偏好，不同任务也有不同的紧急程度。通过个性化的通知策略，可以提高通知的有效性和用户体验。

```java
// 个性化通知策略服务
@Service
public class PersonalizedNotificationStrategyService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserNotificationPreferenceRepository preferenceRepository;
    
    @Autowired
    private NotificationTimingService notificationTimingService;
    
    /**
     * 根据用户和任务特性制定个性化通知计划
     * @param task 任务对象
     * @param recipient 接收者
     * @return 通知计划
     */
    public PersonalizedNotificationPlan createPersonalizedNotificationPlan(Task task, User recipient) {
        PersonalizedNotificationPlan plan = new PersonalizedNotificationPlan();
        plan.setTaskId(task.getId());
        plan.setRecipientId(recipient.getId());
        plan.setCreateTime(new Date());
        
        try {
            // 获取用户通知偏好
            UserNotificationPreference preference = preferenceRepository.findByUserId(recipient.getId());
            if (preference == null) {
                preference = createDefaultNotificationPreference(recipient.getId());
            }
            
            // 根据任务优先级和截止时间制定通知时间表
            List<NotificationSchedule> schedule = createNotificationSchedule(task, preference);
            plan.setSchedule(schedule);
            
            // 保存通知计划
            personalizedNotificationPlanRepository.save(plan);
            
            // 安排通知发送
            scheduleNotifications(plan);
            
        } catch (Exception e) {
            log.error("创建个性化通知计划失败 - 任务ID: {}, 用户ID: {}", task.getId(), recipient.getId(), e);
        }
        
        return plan;
    }
    
    /**
     * 创建通知时间表
     * @param task 任务
     * @param preference 用户偏好
     * @return 通知时间表
     */
    private List<NotificationSchedule> createNotificationSchedule(Task task, 
        UserNotificationPreference preference) {
        
        List<NotificationSchedule> schedule = new ArrayList<>();
        Date now = new Date();
        
        // 检查是否在静默时间内
        if (isInQuietHours(now, preference)) {
            // 如果当前在静默时间，推迟到静默时间结束
            Date quietHoursEnd = calculateQuietHoursEndTime(now, preference);
            schedule.add(createInitialNotification(quietHoursEnd, task, preference));
        } else {
            // 正常工作时间，立即发送初始通知
            schedule.add(createInitialNotification(now, task, preference));
        }
        
        // 根据任务优先级和截止时间添加提醒通知
        if (task.getDueDate() != null) {
            List<NotificationSchedule> reminderSchedule = createReminderSchedule(task, preference);
            schedule.addAll(reminderSchedule);
        }
        
        return schedule;
    }
    
    /**
     * 创建初始通知
     * @param sendTime 发送时间
     * @param task 任务
     * @param preference 用户偏好
     * @return 通知安排
     */
    private NotificationSchedule createInitialNotification(Date sendTime, Task task, 
        UserNotificationPreference preference) {
        
        NotificationSchedule schedule = new NotificationSchedule();
        schedule.setId(UUID.randomUUID().toString());
        schedule.setScheduledTime(sendTime);
        schedule.setNotificationType(NotificationType.TASK_ASSIGNMENT);
        schedule.setStatus(NotificationStatus.PENDING);
        schedule.setChannels(selectInitialNotificationChannels(preference));
        
        return schedule;
    }
    
    /**
     * 选择初始通知渠道
     * @param preference 用户偏好
     * @return 通知渠道列表
     */
    private List<NotificationChannel> selectInitialNotificationChannels(
        UserNotificationPreference preference) {
        
        List<NotificationChannel> channels = new ArrayList<>();
        
        if (preference.isInAppEnabled()) channels.add(NotificationChannel.IN_APP);
        if (preference.isEmailEnabled()) channels.add(NotificationChannel.EMAIL);
        if (preference.isPushEnabled()) channels.add(NotificationChannel.PUSH);
        
        return channels;
    }
    
    /**
     * 创建提醒通知时间表
     * @param task 任务
     * @param preference 用户偏好
     * @return 提醒通知时间表
     */
    private List<NotificationSchedule> createReminderSchedule(Task task, 
        UserNotificationPreference preference) {
        
        List<NotificationSchedule> schedule = new ArrayList<>();
        Date dueDate = task.getDueDate();
        Date now = new Date();
        
        // 计算提醒时间点
        List<Date> reminderTimes = calculateReminderTimes(dueDate, task.getPriority());
        
        for (int i = 0; i < reminderTimes.size(); i++) {
            Date reminderTime = reminderTimes.get(i);
            
            // 检查提醒时间是否已过
            if (reminderTime.before(now)) continue;
            
            NotificationSchedule reminderSchedule = new NotificationSchedule();
            reminderSchedule.setId(UUID.randomUUID().toString());
            reminderSchedule.setScheduledTime(reminderTime);
            reminderSchedule.setNotificationType(NotificationType.TASK_REMINDER);
            reminderSchedule.setStatus(NotificationStatus.PENDING);
            reminderSchedule.setChannels(selectReminderChannels(preference, i));
            
            schedule.add(reminderSchedule);
        }
        
        return schedule;
    }
    
    /**
     * 计算提醒时间点
     * @param dueDate 截止日期
     * @param priority 任务优先级
     * @return 提醒时间点列表
     */
    private List<Date> calculateReminderTimes(Date dueDate, TaskPriority priority) {
        List<Date> reminderTimes = new ArrayList<>();
        long dueTime = dueDate.getTime();
        
        switch (priority) {
            case HIGH:
                // 高优先级：提前1天、12小时、6小时、1小时、30分钟
                reminderTimes.add(new Date(dueTime - 24 * 3600000L));  // 提前1天
                reminderTimes.add(new Date(dueTime - 12 * 3600000L)); // 提前12小时
                reminderTimes.add(new Date(dueTime - 6 * 3600000L));  // 提前6小时
                reminderTimes.add(new Date(dueTime - 3600000L));      // 提前1小时
                reminderTimes.add(new Date(dueTime - 1800000L));      // 提前30分钟
                break;
                
            case MEDIUM:
                // 中优先级：提前2天、1天、6小时、1小时
                reminderTimes.add(new Date(dueTime - 2 * 24 * 3600000L)); // 提前2天
                reminderTimes.add(new Date(dueTime - 24 * 3600000L));     // 提前1天
                reminderTimes.add(new Date(dueTime - 6 * 3600000L));      // 提前6小时
                reminderTimes.add(new Date(dueTime - 3600000L));          // 提前1小时
                break;
                
            case LOW:
                // 低优先级：提前3天、1天、6小时
                reminderTimes.add(new Date(dueTime - 3 * 24 * 3600000L)); // 提前3天
                reminderTimes.add(new Date(dueTime - 24 * 3600000L));     // 提前1天
                reminderTimes.add(new Date(dueTime - 6 * 3600000L));      // 提前6小时
                break;
        }
        
        return reminderTimes;
    }
    
    /**
     * 选择提醒通知渠道
     * @param preference 用户偏好
     * @param reminderIndex 提醒索引
     * @return 通知渠道列表
     */
    private List<NotificationChannel> selectReminderChannels(
        UserNotificationPreference preference, int reminderIndex) {
        
        List<NotificationChannel> channels = new ArrayList<>();
        
        // 第一次提醒使用较轻的通知方式
        if (reminderIndex == 0) {
            if (preference.isInAppEnabled()) channels.add(NotificationChannel.IN_APP);
            if (preference.isEmailEnabled()) channels.add(NotificationChannel.EMAIL);
        } else {
            // 后续提醒使用更强烈的通知方式
            channels.add(NotificationChannel.EMAIL);
            if (preference.isPushEnabled()) channels.add(NotificationChannel.PUSH);
            if (preference.isSmsEnabled()) channels.add(NotificationChannel.SMS);
        }
        
        return channels;
    }
    
    /**
     * 检查当前时间是否在静默时间内
     * @param currentTime 当前时间
     * @param preference 用户偏好
     * @return 是否在静默时间内
     */
    private boolean isInQuietHours(Date currentTime, UserNotificationPreference preference) {
        if (!preference.isQuietHoursEnabled()) {
            return false;
        }
        
        String quietHoursStart = preference.getQuietHoursStart();
        String quietHoursEnd = preference.getQuietHoursEnd();
        
        return notificationTimingService.isTimeInRange(currentTime, quietHoursStart, quietHoursEnd);
    }
    
    /**
     * 计算静默时间结束时间
     * @param currentTime 当前时间
     * @param preference 用户偏好
     * @return 静默时间结束时间
     */
    private Date calculateQuietHoursEndTime(Date currentTime, UserNotificationPreference preference) {
        String quietHoursEnd = preference.getQuietHoursEnd();
        return notificationTimingService.calculateEndTime(currentTime, quietHoursEnd);
    }
}
```

## 自动催办与升级机制

当任务接近截止时间或已经逾期时，需要启动自动催办机制，确保任务能够及时完成。对于重要任务，还应该有升级机制，将任务上报给更高级别的管理者。

```java
// 自动催办与升级服务
@Service
public class AutoReminderAndEscalationService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MultiChannelNotificationService notificationService;
    
    @Autowired
    private TaskEscalationRuleRepository escalationRuleRepository;
    
    /**
     * 检查并处理逾期任务
     */
    @Scheduled(cron = "0 0/15 * * * ?") // 每15分钟执行一次
    public void checkOverdueTasks() {
        try {
            log.info("开始检查逾期任务");
            
            // 获取所有已分配但未完成且已逾期的任务
            Date now = new Date();
            List<Task> overdueTasks = taskRepository.findOverdueTasks(now);
            
            log.info("发现 {} 个逾期任务", overdueTasks.size());
            
            for (Task task : overdueTasks) {
                handleOverdueTask(task);
            }
            
            log.info("逾期任务检查完成");
        } catch (Exception e) {
            log.error("检查逾期任务时发生错误", e);
        }
    }
    
    /**
     * 处理逾期任务
     * @param task 逾期任务
     */
    private void handleOverdueTask(Task task) {
        try {
            // 获取任务处理者
            User assignee = userRepository.findById(task.getAssignee());
            if (assignee == null) {
                log.warn("任务处理者不存在 - 任务ID: {}", task.getId());
                return;
            }
            
            // 发送逾期通知
            sendOverdueNotification(task, assignee);
            
            // 检查是否需要升级
            checkAndEscalateTask(task, assignee);
            
            // 更新任务状态
            task.setOverdue(true);
            task.setOverdueTime(new Date());
            taskRepository.save(task);
            
        } catch (Exception e) {
            log.error("处理逾期任务失败 - 任务ID: {}", task.getId(), e);
        }
    }
    
    /**
     * 发送逾期通知
     * @param task 任务
     * @param assignee 处理者
     */
    private void sendOverdueNotification(Task task, User assignee) {
        try {
            NotificationResult result = notificationService.sendTaskNotification(
                task, assignee, NotificationType.TASK_OVERDUE);
            
            if (result.isSuccess()) {
                log.info("逾期通知发送成功 - 任务ID: {}, 用户ID: {}", task.getId(), assignee.getId());
            } else {
                log.warn("逾期通知发送失败 - 任务ID: {}, 用户ID: {}, 错误: {}", 
                    task.getId(), assignee.getId(), result.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("发送逾期通知时发生错误 - 任务ID: {}", task.getId(), e);
        }
    }
    
    /**
     * 检查并升级任务
     * @param task 任务
     * @param assignee 当前处理者
     */
    private void checkAndEscalateTask(Task task, User assignee) {
        try {
            // 获取任务的升级规则
            TaskEscalationRule escalationRule = escalationRuleRepository
                .findByProcessDefinitionKey(task.getProcessDefinitionKey());
            
            if (escalationRule == null) {
                log.debug("任务没有配置升级规则 - 任务ID: {}", task.getId());
                return;
            }
            
            // 检查是否满足升级条件
            if (shouldEscalateTask(task, escalationRule)) {
                escalateTask(task, assignee, escalationRule);
            }
        } catch (Exception e) {
            log.error("检查任务升级时发生错误 - 任务ID: {}", task.getId(), e);
        }
    }
    
    /**
     * 判断是否应该升级任务
     * @param task 任务
     * @param escalationRule 升级规则
     * @return 是否应该升级
     */
    private boolean shouldEscalateTask(Task task, TaskEscalationRule escalationRule) {
        // 检查逾期时间是否超过升级阈值
        Date now = new Date();
        long overdueDuration = now.getTime() - task.getDueDate().getTime();
        long escalationThreshold = escalationRule.getEscalationThresholdHours() * 3600000L;
        
        return overdueDuration >= escalationThreshold;
    }
    
    /**
     * 执行任务升级
     * @param task 任务
     * @param currentAssignee 当前处理者
     * @param escalationRule 升级规则
     */
    private void escalateTask(Task task, User currentAssignee, TaskEscalationRule escalationRule) {
        try {
            // 确定升级后的处理者
            User escalatedAssignee = determineEscalatedAssignee(
                task, currentAssignee, escalationRule);
            
            if (escalatedAssignee == null) {
                log.warn("无法确定升级后的处理者 - 任务ID: {}", task.getId());
                return;
            }
            
            // 更新任务分配
            task.setPreviousAssignee(currentAssignee.getId());
            task.setAssignee(escalatedAssignee.getId());
            task.setEscalated(true);
            task.setEscalationTime(new Date());
            task.setEscalationLevel(task.getEscalationLevel() + 1);
            taskRepository.save(task);
            
            // 发送升级通知给原处理者和新处理者
            sendEscalationNotification(task, currentAssignee, escalatedAssignee);
            
            log.info("任务已升级 - 任务ID: {}, 原处理者: {}, 新处理者: {}", 
                task.getId(), currentAssignee.getId(), escalatedAssignee.getId());
                
        } catch (Exception e) {
            log.error("任务升级失败 - 任务ID: {}", task.getId(), e);
        }
    }
    
    /**
     * 确定升级后的处理者
     * @param task 任务
     * @param currentAssignee 当前处理者
     * @param escalationRule 升级规则
     * @return 升级后的处理者
     */
    private User determineEscalatedAssignee(Task task, User currentAssignee, 
        TaskEscalationRule escalationRule) {
        
        EscalationTargetType targetType = escalationRule.getTargetType();
        
        switch (targetType) {
            case DIRECT_SUPERVISOR:
                // 直接上级
                return userRepository.findDirectSupervisor(currentAssignee.getId());
                
            case DEPARTMENT_HEAD:
                // 部门负责人
                return userRepository.findDepartmentHead(currentAssignee.getDepartmentId());
                
            case ROLE_BASED:
                // 基于角色
                List<User> roleUsers = userRepository.findByRoleIds(escalationRule.getTargetRoleIds());
                // 选择第一个可用用户
                return roleUsers.isEmpty() ? null : roleUsers.get(0);
                
            case SPECIFIC_USER:
                // 指定用户
                return userRepository.findById(escalationRule.getTargetUserId());
                
            default:
                return null;
        }
    }
    
    /**
     * 发送升级通知
     * @param task 任务
     * @param originalAssignee 原处理者
     * @param newAssignee 新处理者
     */
    private void sendEscalationNotification(Task task, User originalAssignee, User newAssignee) {
        try {
            // 通知原处理者
            notificationService.sendTaskNotification(
                task, originalAssignee, NotificationType.TASK_ESCALATED_AWAY);
            
            // 通知新处理者
            notificationService.sendTaskNotification(
                task, newAssignee, NotificationType.TASK_ESCALATED_TO);
                
        } catch (Exception e) {
            log.error("发送升级通知时发生错误 - 任务ID: {}", task.getId(), e);
        }
    }
    
    /**
     * 预提醒机制
     */
    @Scheduled(cron = "0 0 9 * * ?") // 每天上午9点执行
    public void sendPreReminders() {
        try {
            log.info("开始发送预提醒");
            
            // 获取即将到期的任务（未来24小时内到期）
            Date tomorrow = new Date(System.currentTimeMillis() + 24 * 3600000L);
            List<Task> upcomingTasks = taskRepository.findTasksDueBefore(tomorrow);
            
            log.info("发现 {} 个即将到期的任务", upcomingTasks.size());
            
            for (Task task : upcomingTasks) {
                sendPreReminder(task);
            }
            
            log.info("预提醒发送完成");
        } catch (Exception e) {
            log.error("发送预提醒时发生错误", e);
        }
    }
    
    /**
     * 发送预提醒
     * @param task 任务
     */
    private void sendPreReminder(Task task) {
        try {
            User assignee = userRepository.findById(task.getAssignee());
            if (assignee == null) return;
            
            NotificationResult result = notificationService.sendTaskNotification(
                task, assignee, NotificationType.TASK_PRE_REMINDER);
            
            if (result.isSuccess()) {
                log.info("预提醒发送成功 - 任务ID: {}", task.getId());
            } else {
                log.warn("预提醒发送失败 - 任务ID: {}, 错误: {}", task.getId(), result.getErrorMessage());
            }
        } catch (Exception e) {
            log.error("发送预提醒时发生错误 - 任务ID: {}", task.getId(), e);
        }
    }
}
```

## 通知模板与内容定制

为了提供更好的用户体验，通知内容应该支持模板化和个性化定制。

```java
// 通知模板管理服务
@Service
public class NotificationTemplateManagementService {
    
    @Autowired
    private NotificationTemplateRepository templateRepository;
    
    /**
     * 创建通知模板
     * @param template 模板对象
     * @return 创建结果
     */
    public TemplateOperationResult createTemplate(NotificationTemplate template) {
        TemplateOperationResult result = new TemplateOperationResult();
        result.setOperationTime(new Date());
        
        try {
            // 验证模板
            ValidationResult validation = validateTemplate(template);
            if (!validation.isValid()) {
                result.setSuccess(false);
                result.setErrorMessage("模板验证失败: " + validation.getErrors());
                return result;
            }
            
            // 检查模板键是否已存在
            if (templateRepository.existsByKey(template.getKey())) {
                result.setSuccess(false);
                result.setErrorMessage("模板键已存在: " + template.getKey());
                return result;
            }
            
            // 保存模板
            template.setCreateTime(new Date());
            template.setLastModifiedTime(new Date());
            templateRepository.save(template);
            
            result.setSuccess(true);
            result.setTemplate(template);
            result.setMessage("模板创建成功");
            
        } catch (Exception e) {
            log.error("创建通知模板失败 - 模板键: {}", template.getKey(), e);
            result.setSuccess(false);
            result.setErrorMessage("模板创建过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 验证通知模板
     * @param template 模板对象
     * @return 验证结果
     */
    private ValidationResult validateTemplate(NotificationTemplate template) {
        ValidationResult result = new ValidationResult();
        
        // 检查必要字段
        if (StringUtils.isEmpty(template.getKey())) {
            result.addError("模板键不能为空");
        }
        
        if (StringUtils.isEmpty(template.getName())) {
            result.addError("模板名称不能为空");
        }
        
        if (StringUtils.isEmpty(template.getSubject())) {
            result.addError("模板主题不能为空");
        }
        
        if (StringUtils.isEmpty(template.getBody())) {
            result.addError("模板内容不能为空");
        }
        
        // 检查模板变量
        List<String> requiredVariables = extractTemplateVariables(template);
        if (!requiredVariables.isEmpty()) {
            // 验证是否提供了所有必需的变量说明
            if (template.getVariableDescriptions() == null || 
                !template.getVariableDescriptions().keySet().containsAll(requiredVariables)) {
                result.addError("模板变量说明不完整");
            }
        }
        
        return result;
    }
    
    /**
     * 提取模板中的变量
     * @param template 模板
     * @return 变量列表
     */
    private List<String> extractTemplateVariables(NotificationTemplate template) {
        List<String> variables = new ArrayList<>();
        
        // 提取主题中的变量
        extractVariablesFromText(template.getSubject(), variables);
        
        // 提取内容中的变量
        extractVariablesFromText(template.getBody(), variables);
        
        // 提取标题中的变量
        extractVariablesFromText(template.getTitle(), variables);
        
        return variables;
    }
    
    /**
     * 从文本中提取变量
     * @param text 文本
     * @param variables 变量列表
     */
    private void extractVariablesFromText(String text, List<String> variables) {
        if (StringUtils.isEmpty(text)) return;
        
        // 使用正则表达式匹配 ${variable} 格式的变量
        Pattern pattern = Pattern.compile("\\$\\{([^}]+)\\}");
        Matcher matcher = pattern.matcher(text);
        
        while (matcher.find()) {
            String variable = matcher.group(1);
            if (!variables.contains(variable)) {
                variables.add(variable);
            }
        }
    }
    
    /**
     * 更新通知模板
     * @param templateId 模板ID
     * @param updatedTemplate 更新后的模板
     * @return 更新结果
     */
    public TemplateOperationResult updateTemplate(String templateId, 
        NotificationTemplate updatedTemplate) {
        
        TemplateOperationResult result = new TemplateOperationResult();
        result.setOperationTime(new Date());
        
        try {
            // 获取现有模板
            NotificationTemplate existingTemplate = templateRepository.findById(templateId);
            if (existingTemplate == null) {
                result.setSuccess(false);
                result.setErrorMessage("模板不存在: " + templateId);
                return result;
            }
            
            // 验证更新后的模板
            ValidationResult validation = validateTemplate(updatedTemplate);
            if (!validation.isValid()) {
                result.setSuccess(false);
                result.setErrorMessage("模板验证失败: " + validation.getErrors());
                return result;
            }
            
            // 更新模板内容
            existingTemplate.setName(updatedTemplate.getName());
            existingTemplate.setSubject(updatedTemplate.getSubject());
            existingTemplate.setBody(updatedTemplate.getBody());
            existingTemplate.setTitle(updatedTemplate.getTitle());
            existingTemplate.setVariableDescriptions(updatedTemplate.getVariableDescriptions());
            existingTemplate.setLastModifiedTime(new Date());
            
            // 保存更新
            templateRepository.save(existingTemplate);
            
            result.setSuccess(true);
            result.setTemplate(existingTemplate);
            result.setMessage("模板更新成功");
            
        } catch (Exception e) {
            log.error("更新通知模板失败 - 模板ID: {}", templateId, e);
            result.setSuccess(false);
            result.setErrorMessage("模板更新过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取模板渲染预览
     * @param template 模板
     * @param sampleData 示例数据
     * @return 渲染后的内容
     */
    public NotificationContent previewTemplate(NotificationTemplate template, 
        Map<String, Object> sampleData) {
        
        NotificationContent content = new NotificationContent();
        
        // 渲染主题
        content.setSubject(renderTemplateText(template.getSubject(), sampleData));
        
        // 渲染内容
        content.setBody(renderTemplateText(template.getBody(), sampleData));
        
        // 渲染标题
        content.setTitle(renderTemplateText(template.getTitle(), sampleData));
        
        return content;
    }
    
    /**
     * 渲染模板文本
     * @param templateText 模板文本
     * @param data 数据
     * @return 渲染后的文本
     */
    private String renderTemplateText(String templateText, Map<String, Object> data) {
        if (StringUtils.isEmpty(templateText)) return "";
        
        String renderedText = templateText;
        
        // 替换变量
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String variable = "${" + entry.getKey() + "}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            renderedText = renderedText.replace(variable, value);
        }
        
        return renderedText;
    }
}
```

## 最佳实践与注意事项

在实现任务通知与催办机制时，需要注意以下最佳实践：

### 1. 避免通知骚扰
合理设置通知频率和渠道，避免对用户造成骚扰。提供用户友好的通知偏好设置界面。

### 2. 确保通知可靠性
建立通知发送的重试机制和失败处理机制，确保重要通知能够成功送达。

### 3. 保护用户隐私
在通知内容中避免包含敏感信息，遵守相关的隐私保护法规。

### 4. 提供通知历史记录
为用户和管理员提供通知发送历史记录，便于问题排查和审计。

### 5. 支持多语言
对于国际化企业，通知内容应该支持多语言，根据用户语言偏好提供相应语言的通知。

通过合理设计和实现任务通知与催办机制，可以显著提升BPM平台的用户体验和任务处理效率，确保业务流程的顺畅运行。