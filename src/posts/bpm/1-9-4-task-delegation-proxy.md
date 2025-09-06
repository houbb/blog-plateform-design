---
title: 任务委托与代理：休假等场景下的工作交接机制
date: 2025-09-06
categories: [BPM]
tags: [bpm, task delegation, proxy, vacation, work handover]
published: true
---

在企业级BPM平台中，任务委托与代理机制是确保业务连续性的重要功能。员工可能因为休假、出差、生病或其他原因无法及时处理分配给他们的任务，这时就需要通过委托或代理机制将任务转交给其他人员处理。本章将深入探讨任务委托与代理的实现机制，以及如何在各种场景下确保工作的顺利交接。

## 任务委托与代理的核心价值

### 业务连续性保障
通过完善的委托与代理机制，确保在员工无法处理任务时，业务流程不会因此中断，保障业务的连续性。

### 灵活的工作安排
支持员工在休假、出差等情况下合理安排工作，提高工作灵活性和员工满意度。

### 风险控制
避免因关键人员缺席而导致的重要任务延误，降低业务风险。

## 任务委托机制实现

任务委托是指任务所有者将任务的处理权限临时或永久性地转移给其他人员。委托可以是主动发起的，也可以是系统自动触发的。

```java
// 任务委托服务
@Service
public class TaskDelegationService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DelegationRuleRepository delegationRuleRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private TaskHistoryService taskHistoryService;
    
    /**
     * 创建任务委托
     * @param delegatorId 委托人ID
     * @param delegateeId 被委托人ID
     * @param delegationRequest 委托请求
     * @return 委托结果
     */
    public TaskDelegationResult createDelegation(String delegatorId, String delegateeId, 
        TaskDelegationRequest delegationRequest) {
        
        TaskDelegationResult result = new TaskDelegationResult();
        result.setDelegatorId(delegatorId);
        result.setDelegateeId(delegateeId);
        result.setCreateTime(new Date());
        
        try {
            // 验证委托人和被委托人
            User delegator = userRepository.findById(delegatorId);
            User delegatee = userRepository.findById(delegateeId);
            
            if (delegator == null) {
                result.setSuccess(false);
                result.setErrorMessage("委托人不存在");
                return result;
            }
            
            if (delegatee == null) {
                result.setSuccess(false);
                result.setErrorMessage("被委托人不存在");
                return result;
            }
            
            // 验证委托权限
            if (!hasDelegationPermission(delegator, delegationRequest)) {
                result.setSuccess(false);
                result.setErrorMessage("委托人没有执行此委托操作的权限");
                return result;
            }
            
            // 检查被委托人是否有处理任务的权限
            if (!hasPermissionToHandleTasks(delegatee, delegationRequest.getTaskFilters())) {
                result.setSuccess(false);
                result.setErrorMessage("被委托人没有处理相关任务的权限");
                return result;
            }
            
            // 创建委托记录
            TaskDelegation delegation = createDelegationRecord(delegatorId, delegateeId, 
                delegationRequest);
            
            // 保存委托记录
            delegationRuleRepository.save(delegation);
            
            // 转移符合条件的现有任务
            if (delegationRequest.isTransferExistingTasks()) {
                transferExistingTasks(delegatorId, delegateeId, delegationRequest.getTaskFilters());
            }
            
            result.setSuccess(true);
            result.setDelegation(delegation);
            result.setMessage("任务委托创建成功");
            
            // 发送委托通知
            sendDelegationNotification(delegator, delegatee, delegation);
            
        } catch (Exception e) {
            log.error("创建任务委托失败 - 委托人ID: {}, 被委托人ID: {}", delegatorId, delegateeId, e);
            result.setSuccess(false);
            result.setErrorMessage("任务委托创建过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 验证委托权限
     * @param delegator 委托人
     * @param delegationRequest 委托请求
     * @return 是否有权限
     */
    private boolean hasDelegationPermission(User delegator, TaskDelegationRequest delegationRequest) {
        // 检查用户角色权限
        List<String> userRoles = delegator.getRoleIds();
        if (!userRoles.contains("TASK_DELEGATOR")) {
            // 检查是否有特定的委托权限
            List<String> delegationPermissions = getUserDelegationPermissions(delegator.getId());
            if (delegationPermissions.isEmpty()) {
                return false;
            }
        }
        
        // 检查委托时间范围
        if (delegationRequest.getStartTime() != null && delegationRequest.getEndTime() != null) {
            long duration = delegationRequest.getEndTime().getTime() - 
                delegationRequest.getStartTime().getTime();
            // 限制最长委托时间（例如90天）
            if (duration > 90L * 24 * 3600000) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 创建委托记录
     * @param delegatorId 委托人ID
     * @param delegateeId 被委托人ID
     * @param delegationRequest 委托请求
     * @return 委托记录
     */
    private TaskDelegation createDelegationRecord(String delegatorId, String delegateeId, 
        TaskDelegationRequest delegationRequest) {
        
        TaskDelegation delegation = new TaskDelegation();
        delegation.setId(UUID.randomUUID().toString());
        delegation.setDelegatorId(delegatorId);
        delegation.setDelegateeId(delegateeId);
        delegation.setDelegationType(delegationRequest.getDelegationType());
        delegation.setStartTime(delegationRequest.getStartTime());
        delegation.setEndTime(delegationRequest.getEndTime());
        delegation.setTaskFilters(delegationRequest.getTaskFilters());
        delegation.setTransferExistingTasks(delegationRequest.isTransferExistingTasks());
        delegation.setStatus(DelegationStatus.ACTIVE);
        delegation.setCreateTime(new Date());
        delegation.setLastModifiedTime(new Date());
        
        return delegation;
    }
    
    /**
     * 转移现有任务
     * @param delegatorId 委托人ID
     * @param delegateeId 被委托人ID
     * @param taskFilters 任务过滤条件
     */
    private void transferExistingTasks(String delegatorId, String delegateeId, 
        TaskFilters taskFilters) {
        
        // 获取符合条件的现有任务
        List<Task> tasksToTransfer = taskRepository.findTasksByAssigneeAndFilters(
            delegatorId, taskFilters);
        
        for (Task task : tasksToTransfer) {
            // 转移任务
            transferTask(task, delegateeId);
            
            // 记录转移历史
            TaskHistory history = createTaskTransferHistory(task, delegatorId, delegateeId);
            taskHistoryService.saveHistory(history);
        }
    }
    
    /**
     * 转移单个任务
     * @param task 任务
     * @param newAssigneeId 新处理者ID
     */
    private void transferTask(Task task, String newAssigneeId) {
        String originalAssignee = task.getAssignee();
        task.setAssignee(newAssigneeId);
        task.setPreviousAssignee(originalAssignee);
        task.setDelegated(true);
        task.setDelegationTime(new Date());
        taskRepository.save(task);
    }
    
    /**
     * 检查被委托人是否有处理任务的权限
     * @param delegatee 被委托人
     * @param taskFilters 任务过滤条件
     * @return 是否有权限
     */
    private boolean hasPermissionToHandleTasks(User delegatee, TaskFilters taskFilters) {
        // 检查角色权限
        List<String> delegateeRoles = delegatee.getRoleIds();
        List<String> requiredRoles = taskFilters.getRequiredRoles();
        
        if (requiredRoles != null && !requiredRoles.isEmpty()) {
            boolean hasRequiredRole = delegateeRoles.stream()
                .anyMatch(requiredRoles::contains);
            if (!hasRequiredRole) {
                return false;
            }
        }
        
        // 检查技能要求
        List<String> requiredSkills = taskFilters.getRequiredSkills();
        if (requiredSkills != null && !requiredSkills.isEmpty()) {
            if (!delegatee.getSkills().containsAll(requiredSkills)) {
                return false;
            }
        }
        
        return true;
    }
}
```

## 自动代理机制实现

自动代理机制可以根据预设规则在特定条件下自动将任务代理给指定人员，例如在员工休假期间自动代理其所有任务。

```java
// 自动代理服务
@Service
public class AutoProxyService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ProxyRuleRepository proxyRuleRepository;
    
    @Autowired
    private CalendarService calendarService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 检查并应用自动代理规则
     */
    @Scheduled(cron = "0 0 0 * * ?") // 每天凌晨执行
    public void checkAndApplyProxyRules() {
        try {
            log.info("开始检查自动代理规则");
            
            // 获取所有激活的代理规则
            List<ProxyRule> activeRules = proxyRuleRepository.findActiveRules();
            
            Date today = new Date();
            
            for (ProxyRule rule : activeRules) {
                // 检查是否应该激活代理
                if (shouldActivateProxy(rule, today)) {
                    activateProxy(rule);
                }
                // 检查是否应该停用代理
                else if (shouldDeactivateProxy(rule, today)) {
                    deactivateProxy(rule);
                }
            }
            
            log.info("自动代理规则检查完成");
        } catch (Exception e) {
            log.error("检查自动代理规则时发生错误", e);
        }
    }
    
    /**
     * 检查是否应该激活代理
     * @param rule 代理规则
     * @param currentDate 当前日期
     * @return 是否应该激活
     */
    private boolean shouldActivateProxy(ProxyRule rule, Date currentDate) {
        // 检查规则状态
        if (rule.getStatus() != ProxyRuleStatus.ACTIVE) {
            return false;
        }
        
        // 检查时间范围
        if (rule.getStartTime() != null && currentDate.before(rule.getStartTime())) {
            return false;
        }
        
        if (rule.getEndTime() != null && currentDate.after(rule.getEndTime())) {
            return false;
        }
        
        // 检查是否为特定日期
        if (rule.getSpecificDates() != null && !rule.getSpecificDates().isEmpty()) {
            boolean isSpecificDate = rule.getSpecificDates().stream()
                .anyMatch(date -> isSameDay(date, currentDate));
            if (!isSpecificDate) {
                return false;
            }
        }
        
        // 检查是否为周期性代理（如每周、每月）
        if (rule.getRecurrencePattern() != null) {
            if (!matchesRecurrencePattern(rule.getRecurrencePattern(), currentDate)) {
                return false;
            }
        }
        
        // 检查用户状态（如是否在休假中）
        if (rule.isCheckUserStatus()) {
            User user = userRepository.findById(rule.getUserId());
            if (user != null && !isUserOnLeave(user, currentDate)) {
                return false;
            }
        }
        
        // 检查是否已经激活
        if (rule.isActivated()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 检查是否应该停用代理
     * @param rule 代理规则
     * @param currentDate 当前日期
     * @return 是否应该停用
     */
    private boolean shouldDeactivateProxy(ProxyRule rule, Date currentDate) {
        // 检查是否已经停用
        if (!rule.isActivated()) {
            return false;
        }
        
        // 检查结束时间
        if (rule.getEndTime() != null && currentDate.after(rule.getEndTime())) {
            return true;
        }
        
        // 检查是否过了特定日期
        if (rule.getSpecificDates() != null && !rule.getSpecificDates().isEmpty()) {
            boolean isAfterSpecificDate = rule.getSpecificDates().stream()
                .anyMatch(date -> currentDate.after(date));
            if (isAfterSpecificDate) {
                return true;
            }
        }
        
        // 检查用户状态
        if (rule.isCheckUserStatus()) {
            User user = userRepository.findById(rule.getUserId());
            if (user != null && !isUserOnLeave(user, currentDate)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 激活代理
     * @param rule 代理规则
     */
    private void activateProxy(ProxyRule rule) {
        try {
            log.info("激活代理规则 - 规则ID: {}", rule.getId());
            
            // 更新规则状态
            rule.setActivated(true);
            rule.setActivationTime(new Date());
            proxyRuleRepository.save(rule);
            
            // 转移符合条件的任务
            transferTasksForProxy(rule);
            
            // 发送代理激活通知
            sendProxyActivationNotification(rule);
            
        } catch (Exception e) {
            log.error("激活代理规则失败 - 规则ID: {}", rule.getId(), e);
        }
    }
    
    /**
     * 停用代理
     * @param rule 代理规则
     */
    private void deactivateProxy(ProxyRule rule) {
        try {
            log.info("停用代理规则 - 规则ID: {}", rule.getId());
            
            // 更新规则状态
            rule.setActivated(false);
            rule.setDeactivationTime(new Date());
            proxyRuleRepository.save(rule);
            
            // 如果需要，可以转移回原处理者
            if (rule.isReturnTasksOnDeactivation()) {
                returnTasksToOriginalOwner(rule);
            }
            
            // 发送代理停用通知
            sendProxyDeactivationNotification(rule);
            
        } catch (Exception e) {
            log.error("停用代理规则失败 - 规则ID: {}", rule.getId(), e);
        }
    }
    
    /**
     * 为代理转移任务
     * @param rule 代理规则
     */
    private void transferTasksForProxy(ProxyRule rule) {
        // 获取需要代理的任务
        List<Task> tasksToProxy = taskRepository.findTasksByAssigneeAndFilters(
            rule.getUserId(), rule.getTaskFilters());
        
        log.info("发现 {} 个任务需要代理给用户 {}", tasksToProxy.size(), rule.getProxyUserId());
        
        for (Task task : tasksToProxy) {
            // 转移任务
            transferTask(task, rule.getProxyUserId());
            
            // 记录代理历史
            recordProxyHistory(task, rule);
        }
    }
    
    /**
     * 返回任务给原所有者
     * @param rule 代理规则
     */
    private void returnTasksToOriginalOwner(ProxyRule rule) {
        // 获取由代理用户处理的原属于规则所有者的任务
        List<Task> tasksToReturn = taskRepository.findTasksByAssigneeAndOriginalOwner(
            rule.getProxyUserId(), rule.getUserId());
        
        log.info("发现 {} 个任务需要返回给原所有者 {}", tasksToReturn.size(), rule.getUserId());
        
        for (Task task : tasksToReturn) {
            // 返回任务
            returnTask(task, rule.getUserId());
            
            // 记录返回历史
            recordReturnHistory(task, rule);
        }
    }
    
    /**
     * 创建代理历史记录
     * @param task 任务
     * @param rule 代理规则
     */
    private void recordProxyHistory(Task task, ProxyRule rule) {
        TaskHistory history = new TaskHistory();
        history.setId(UUID.randomUUID().toString());
        history.setTaskId(task.getId());
        history.setOperationType(TaskOperationType.PROXY);
        history.setOperatorId(rule.getUserId());
        history.setOperationTime(new Date());
        history.setComment("任务自动代理给用户 " + rule.getProxyUserId());
        history.setTargetUserId(rule.getProxyUserId());
        history.setAdditionalData(createProxyData(rule));
        
        taskHistoryService.saveHistory(history);
    }
    
    /**
     * 创建代理数据
     * @param rule 代理规则
     * @return 代理数据
     */
    private Map<String, Object> createProxyData(ProxyRule rule) {
        Map<String, Object> data = new HashMap<>();
        data.put("proxyRuleId", rule.getId());
        data.put("originalAssignee", rule.getUserId());
        data.put("proxyAssignee", rule.getProxyUserId());
        data.put("activationTime", rule.getActivationTime());
        return data;
    }
}
```

## 休假场景下的工作交接

休假是任务委托与代理最常见的应用场景之一。通过完善的休假管理机制，可以确保员工在休假期间的工作得到妥善处理。

```java
// 休假管理服务
@Service
public class LeaveManagementService {
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskDelegationService taskDelegationService;
    
    @Autowired
    private AutoProxyService autoProxyService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 提交休假申请
     * @param userId 用户ID
     * @param leaveRequest 休假申请
     * @return 申请结果
     */
    public LeaveRequestResult submitLeaveRequest(String userId, LeaveRequest leaveRequest) {
        LeaveRequestResult result = new LeaveRequestResult();
        result.setUserId(userId);
        result.setSubmitTime(new Date());
        
        try {
            // 验证用户
            User user = userRepository.findById(userId);
            if (user == null) {
                result.setSuccess(false);
                result.setErrorMessage("用户不存在");
                return result;
            }
            
            // 验证休假申请
            ValidationResult validation = validateLeaveRequest(leaveRequest);
            if (!validation.isValid()) {
                result.setSuccess(false);
                result.setErrorMessage("休假申请验证失败: " + validation.getErrors());
                return result;
            }
            
            // 检查休假时间是否冲突
            if (hasLeaveConflict(userId, leaveRequest)) {
                result.setSuccess(false);
                result.setErrorMessage("休假时间与已有申请冲突");
                return result;
            }
            
            // 保存休假申请
            leaveRequest.setId(UUID.randomUUID().toString());
            leaveRequest.setUserId(userId);
            leaveRequest.setStatus(LeaveStatus.PENDING);
            leaveRequest.setSubmitTime(new Date());
            leaveRequestRepository.save(leaveRequest);
            
            // 发送审批通知
            sendLeaveApprovalNotification(leaveRequest, user);
            
            result.setSuccess(true);
            result.setLeaveRequest(leaveRequest);
            result.setMessage("休假申请提交成功");
            
        } catch (Exception e) {
            log.error("提交休假申请失败 - 用户ID: {}", userId, e);
            result.setSuccess(false);
            result.setErrorMessage("休假申请提交过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 验证休假申请
     * @param leaveRequest 休假申请
     * @return 验证结果
     */
    private ValidationResult validateLeaveRequest(LeaveRequest leaveRequest) {
        ValidationResult result = new ValidationResult();
        
        // 检查必要字段
        if (leaveRequest.getStartTime() == null) {
            result.addError("休假开始时间不能为空");
        }
        
        if (leaveRequest.getEndTime() == null) {
            result.addError("休假结束时间不能为空");
        }
        
        if (leaveRequest.getStartTime() != null && leaveRequest.getEndTime() != null) {
            if (leaveRequest.getStartTime().after(leaveRequest.getEndTime())) {
                result.addError("休假开始时间不能晚于结束时间");
            }
        }
        
        if (StringUtils.isEmpty(leaveRequest.getLeaveType())) {
            result.addError("休假类型不能为空");
        }
        
        if (StringUtils.isEmpty(leaveRequest.getReason())) {
            result.addError("休假原因不能为空");
        }
        
        return result;
    }
    
    /**
     * 检查休假时间冲突
     * @param userId 用户ID
     * @param leaveRequest 休假申请
     * @return 是否有冲突
     */
    private boolean hasLeaveConflict(String userId, LeaveRequest leaveRequest) {
        List<LeaveRequest> existingLeaves = leaveRequestRepository
            .findApprovedLeavesByUserAndTimeRange(userId, 
                leaveRequest.getStartTime(), leaveRequest.getEndTime());
        
        return !existingLeaves.isEmpty();
    }
    
    /**
     * 审批休假申请
     * @param leaveRequestId 休假申请ID
     * @param approverId 审批者ID
     * @param approvalResult 审批结果
     * @return 审批结果
     */
    public LeaveApprovalResult approveLeaveRequest(String leaveRequestId, String approverId, 
        LeaveApprovalResult approvalResult) {
        
        LeaveApprovalResult result = new LeaveApprovalResult();
        result.setLeaveRequestId(leaveRequestId);
        result.setApproverId(approverId);
        result.setApprovalTime(new Date());
        
        try {
            // 获取休假申请
            LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId);
            if (leaveRequest == null) {
                result.setSuccess(false);
                result.setErrorMessage("休假申请不存在");
                return result;
            }
            
            // 验证审批者权限
            if (!hasApprovalPermission(approverId, leaveRequest)) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权审批此休假申请");
                return result;
            }
            
            // 更新申请状态
            leaveRequest.setStatus(approvalResult.isApproved() ? 
                LeaveStatus.APPROVED : LeaveStatus.REJECTED);
            leaveRequest.setApproverId(approverId);
            leaveRequest.setApprovalTime(new Date());
            leaveRequest.setApprovalComment(approvalResult.getComment());
            leaveRequestRepository.save(leaveRequest);
            
            // 如果批准，自动创建代理规则
            if (approvalResult.isApproved()) {
                createAutoProxyRule(leaveRequest);
            }
            
            result.setSuccess(true);
            result.setLeaveRequest(leaveRequest);
            result.setMessage("休假申请审批成功");
            
            // 发送审批结果通知
            sendLeaveApprovalResultNotification(leaveRequest);
            
        } catch (Exception e) {
            log.error("审批休假申请失败 - 申请ID: {}, 审批者ID: {}", leaveRequestId, approverId, e);
            result.setSuccess(false);
            result.setErrorMessage("休假申请审批过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 创建自动代理规则
     * @param leaveRequest 休假申请
     */
    private void createAutoProxyRule(LeaveRequest leaveRequest) {
        try {
            // 获取用户的默认代理设置
            UserProxySetting userProxySetting = getUserDefaultProxySetting(leaveRequest.getUserId());
            
            if (userProxySetting != null) {
                // 创建代理规则
                ProxyRule proxyRule = new ProxyRule();
                proxyRule.setId(UUID.randomUUID().toString());
                proxyRule.setUserId(leaveRequest.getUserId());
                proxyRule.setProxyUserId(userProxySetting.getProxyUserId());
                proxyRule.setStartTime(leaveRequest.getStartTime());
                proxyRule.setEndTime(leaveRequest.getEndTime());
                proxyRule.setRuleType(ProxyRuleType.LEAVE_BASED);
                proxyRule.setStatus(ProxyRuleStatus.ACTIVE);
                proxyRule.setTaskFilters(createLeaveTaskFilters(leaveRequest));
                proxyRule.setCheckUserStatus(true);
                proxyRule.setReturnTasksOnDeactivation(true);
                
                // 保存代理规则
                proxyRuleRepository.save(proxyRule);
                
                log.info("为用户 {} 的休假创建了自动代理规则", leaveRequest.getUserId());
            }
        } catch (Exception e) {
            log.error("创建自动代理规则失败 - 用户ID: {}", leaveRequest.getUserId(), e);
        }
    }
    
    /**
     * 创建休假任务过滤器
     * @param leaveRequest 休假申请
     * @return 任务过滤器
     */
    private TaskFilters createLeaveTaskFilters(LeaveRequest leaveRequest) {
        TaskFilters filters = new TaskFilters();
        // 可以根据休假类型设置不同的任务过滤条件
        // 例如：年假可能代理所有任务，病假可能只代理紧急任务
        filters.setPriorityLevels(Arrays.asList(TaskPriority.HIGH, TaskPriority.MEDIUM));
        return filters;
    }
    
    /**
     * 获取用户默认代理设置
     * @param userId 用户ID
     * @return 代理设置
     */
    private UserProxySetting getUserDefaultProxySetting(String userId) {
        return userProxySettingRepository.findByUserId(userId);
    }
}
```

## 紧急代理机制

在某些紧急情况下，可能需要立即代理某个用户的所有任务，而不需要等待预定的代理规则生效。

```java
// 紧急代理服务
@Service
public class EmergencyProxyService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private TaskHistoryService taskHistoryService;
    
    /**
     * 启动紧急代理
     * @param userId 需要代理的用户ID
     * @param proxyUserId 代理用户ID
     * @param emergencyReason 紧急原因
     * @return 代理结果
     */
    public EmergencyProxyResult startEmergencyProxy(String userId, String proxyUserId, 
        String emergencyReason) {
        
        EmergencyProxyResult result = new EmergencyProxyResult();
        result.setUserId(userId);
        result.setProxyUserId(proxyUserId);
        result.setStartTime(new Date());
        
        try {
            // 验证用户
            User user = userRepository.findById(userId);
            User proxyUser = userRepository.findById(proxyUserId);
            
            if (user == null) {
                result.setSuccess(false);
                result.setErrorMessage("用户不存在");
                return result;
            }
            
            if (proxyUser == null) {
                result.setSuccess(false);
                result.setErrorMessage("代理用户不存在");
                return result;
            }
            
            // 验证操作权限（通常需要管理员权限）
            if (!hasEmergencyProxyPermission()) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权执行紧急代理操作");
                return result;
            }
            
            // 转移用户的所有未完成任务
            List<Task> userTasks = taskRepository.findIncompleteTasksByAssignee(userId);
            
            log.info("发现 {} 个任务需要紧急代理给用户 {}", userTasks.size(), proxyUserId);
            
            int transferredCount = 0;
            List<String> transferredTaskIds = new ArrayList<>();
            
            for (Task task : userTasks) {
                try {
                    // 转移任务
                    transferTask(task, proxyUserId);
                    
                    // 记录紧急代理历史
                    recordEmergencyProxyHistory(task, userId, proxyUserId, emergencyReason);
                    
                    transferredTaskIds.add(task.getId());
                    transferredCount++;
                } catch (Exception e) {
                    log.error("转移任务失败 - 任务ID: {}", task.getId(), e);
                }
            }
            
            // 更新用户状态为紧急代理中
            updateUserEmergencyProxyStatus(userId, proxyUserId, emergencyReason);
            
            result.setSuccess(true);
            result.setTransferredTaskCount(transferredCount);
            result.setTransferredTaskIds(transferredTaskIds);
            result.setMessage("紧急代理启动成功，共转移 " + transferredCount + " 个任务");
            
            // 发送紧急代理通知
            sendEmergencyProxyNotification(user, proxyUser, transferredCount, emergencyReason);
            
        } catch (Exception e) {
            log.error("启动紧急代理失败 - 用户ID: {}, 代理用户ID: {}", userId, proxyUserId, e);
            result.setSuccess(false);
            result.setErrorMessage("紧急代理启动过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 转移任务
     * @param task 任务
     * @param newAssigneeId 新处理者ID
     */
    private void transferTask(Task task, String newAssigneeId) {
        String originalAssignee = task.getAssignee();
        task.setAssignee(newAssigneeId);
        task.setPreviousAssignee(originalAssignee);
        task.setEmergencyProxied(true);
        task.setEmergencyProxyTime(new Date());
        task.setEmergencyProxyReason("紧急代理");
        taskRepository.save(task);
    }
    
    /**
     * 记录紧急代理历史
     * @param task 任务
     * @param userId 原用户ID
     * @param proxyUserId 代理用户ID
     * @param reason 原因
     */
    private void recordEmergencyProxyHistory(Task task, String userId, String proxyUserId, 
        String reason) {
        
        TaskHistory history = new TaskHistory();
        history.setId(UUID.randomUUID().toString());
        history.setTaskId(task.getId());
        history.setOperationType(TaskOperationType.EMERGENCY_PROXY);
        history.setOperatorId("SYSTEM");
        history.setOperationTime(new Date());
        history.setComment("紧急代理: " + reason);
        history.setTargetUserId(proxyUserId);
        
        Map<String, Object> additionalData = new HashMap<>();
        additionalData.put("originalAssignee", userId);
        additionalData.put("proxyAssignee", proxyUserId);
        additionalData.put("emergencyReason", reason);
        history.setAdditionalData(additionalData);
        
        taskHistoryService.saveHistory(history);
    }
    
    /**
     * 更新用户紧急代理状态
     * @param userId 用户ID
     * @param proxyUserId 代理用户ID
     * @param reason 原因
     */
    private void updateUserEmergencyProxyStatus(String userId, String proxyUserId, String reason) {
        User user = userRepository.findById(userId);
        if (user != null) {
            user.setEmergencyProxied(true);
            user.setEmergencyProxyUserId(proxyUserId);
            user.setEmergencyProxyStartTime(new Date());
            user.setEmergencyProxyReason(reason);
            userRepository.save(user);
        }
    }
    
    /**
     * 结束紧急代理
     * @param userId 用户ID
     * @return 结束结果
     */
    public EmergencyProxyEndResult endEmergencyProxy(String userId) {
        EmergencyProxyEndResult result = new EmergencyProxyEndResult();
        result.setUserId(userId);
        result.setEndTime(new Date());
        
        try {
            // 获取用户信息
            User user = userRepository.findById(userId);
            if (user == null) {
                result.setSuccess(false);
                result.setErrorMessage("用户不存在");
                return result;
            }
            
            // 验证是否处于紧急代理状态
            if (!user.isEmergencyProxied()) {
                result.setSuccess(false);
                result.setErrorMessage("用户当前未处于紧急代理状态");
                return result;
            }
            
            // 验证操作权限
            if (!hasEmergencyProxyPermission()) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权结束紧急代理操作");
                return result;
            }
            
            String proxyUserId = user.getEmergencyProxyUserId();
            
            // 将任务返回给原用户（可选）
            List<Task> proxiedTasks = taskRepository.findEmergencyProxiedTasksByUser(proxyUserId, userId);
            
            log.info("发现 {} 个紧急代理任务需要返回给用户 {}", proxiedTasks.size(), userId);
            
            int returnedCount = 0;
            List<String> returnedTaskIds = new ArrayList<>();
            
            for (Task task : proxiedTasks) {
                try {
                    // 返回任务
                    returnTask(task, userId);
                    
                    // 记录返回历史
                    recordEmergencyProxyReturnHistory(task, userId, proxyUserId);
                    
                    returnedTaskIds.add(task.getId());
                    returnedCount++;
                } catch (Exception e) {
                    log.error("返回任务失败 - 任务ID: {}", task.getId(), e);
                }
            }
            
            // 更新用户状态
            user.setEmergencyProxied(false);
            user.setEmergencyProxyUserId(null);
            user.setEmergencyProxyEndTime(new Date());
            userRepository.save(user);
            
            result.setSuccess(true);
            result.setReturnedTaskCount(returnedCount);
            result.setReturnedTaskIds(returnedTaskIds);
            result.setMessage("紧急代理结束成功，共返回 " + returnedCount + " 个任务");
            
            // 发送结束通知
            sendEmergencyProxyEndNotification(user, proxyUserId, returnedCount);
            
        } catch (Exception e) {
            log.error("结束紧急代理失败 - 用户ID: {}", userId, e);
            result.setSuccess(false);
            result.setErrorMessage("结束紧急代理过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
}
```

## 最佳实践与注意事项

在实现任务委托与代理机制时，需要注意以下最佳实践：

### 1. 权限控制
确保只有授权用户才能创建、修改或删除委托和代理规则，防止恶意操作。

### 2. 审计跟踪
完整记录所有委托和代理操作的历史，便于审计和问题排查。

### 3. 通知机制
及时通知相关人员委托和代理状态的变化，确保信息透明。

### 4. 冲突处理
建立完善的冲突检测和处理机制，避免出现任务分配冲突。

### 5. 用户体验
提供直观易用的界面，让用户能够方便地管理和监控自己的委托和代理设置。

通过合理设计和实现任务委托与代理机制，可以显著提升BPM平台的灵活性和可靠性，确保在各种场景下业务流程的连续性和稳定性。