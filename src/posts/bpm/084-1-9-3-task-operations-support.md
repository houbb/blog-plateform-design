---
title: "任务操作支持: 审批、驳回、转交等复杂操作实现"
date: 2025-09-06
categories: [Bpm]
tags: [Bpm]
published: true
---
在企业级BPM平台中，任务操作支持是确保业务流程灵活性和适应性的关键功能。除了基本的任务分配和处理外，用户还需要执行各种复杂的操作，如审批、驳回、转交、会签、或签、加签等。这些操作不仅影响当前任务的状态，还可能触发流程的重新路由或分支。本章将深入探讨这些复杂任务操作的实现机制。

## 任务操作的核心价值

### 流程灵活性
丰富的任务操作支持使得业务流程能够适应各种复杂的业务场景，提高流程的灵活性和适应性。

### 协作效率
通过提供多样化的任务操作，可以促进团队成员间的协作，提高工作效率。

### 风险控制
合理的任务操作机制可以帮助企业更好地控制业务风险，确保关键决策得到适当的审核和批准。

## 审批操作实现

审批是最常见的任务操作之一，通常表示用户同意并完成任务。审批操作需要确保流程能够正确地继续执行到下一个节点。

```java
// 审批操作服务
@Service
public class TaskApprovalService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ProcessEngine processEngine;
    
    @Autowired
    private TaskHistoryService taskHistoryService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 执行任务审批操作
     * @param taskId 任务ID
     * @param approverId 审批者ID
     * @param approvalData 审批数据
     * @return 审批结果
     */
    public TaskApprovalResult approveTask(String taskId, String approverId, 
        TaskApprovalData approvalData) {
        
        TaskApprovalResult result = new TaskApprovalResult();
        result.setTaskId(taskId);
        result.setApproverId(approverId);
        result.setApprovalTime(new Date());
        
        try {
            // 获取任务信息
            Task task = taskRepository.findById(taskId);
            if (task == null) {
                result.setSuccess(false);
                result.setErrorMessage("任务不存在");
                return result;
            }
            
            // 验证审批者权限
            if (!task.getAssignee().equals(approverId)) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权审批此任务");
                return result;
            }
            
            // 验证任务状态
            if (task.getStatus() != TaskStatus.ASSIGNED && 
                task.getStatus() != TaskStatus.IN_PROGRESS) {
                result.setSuccess(false);
                result.setErrorMessage("任务状态不正确，无法执行审批操作");
                return result;
            }
            
            // 执行审批前检查
            ValidationResult preCheckResult = performPreApprovalCheck(task, approvalData);
            if (!preCheckResult.isValid()) {
                result.setSuccess(false);
                result.setErrorMessage("审批前检查失败: " + preCheckResult.getErrors());
                return result;
            }
            
            // 记录审批历史
            TaskHistory history = createApprovalHistory(task, approverId, approvalData);
            taskHistoryService.saveHistory(history);
            
            // 更新任务状态
            task.setStatus(TaskStatus.COMPLETED);
            task.setCompletionTime(new Date());
            task.setOutcome(TaskOutcome.APPROVED);
            task.setApprovalData(approvalData);
            taskRepository.save(task);
            
            // 触发流程继续执行
            RuntimeService runtimeService = processEngine.getRuntimeService();
            runtimeService.completeTask(taskId, convertToProcessVariables(approvalData));
            
            result.setSuccess(true);
            result.setTask(task);
            result.setMessage("任务审批成功");
            
            // 发送审批完成通知
            sendApprovalCompletionNotification(task, approverId);
            
        } catch (Exception e) {
            log.error("任务审批失败 - 任务ID: {}, 审批者ID: {}", taskId, approverId, e);
            result.setSuccess(false);
            result.setErrorMessage("任务审批过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 执行审批前检查
     * @param task 任务
     * @param approvalData 审批数据
     * @return 验证结果
     */
    private ValidationResult performPreApprovalCheck(Task task, TaskApprovalData approvalData) {
        ValidationResult result = new ValidationResult();
        
        // 检查必需的审批意见
        if (task.isRequiredComment() && StringUtils.isEmpty(approvalData.getComment())) {
            result.addError("审批意见为必填项");
        }
        
        // 检查附件要求
        if (task.isRequiredAttachment() && 
            (approvalData.getAttachments() == null || approvalData.getAttachments().isEmpty())) {
            result.addError("必须上传附件");
        }
        
        // 检查审批数据完整性
        if (approvalData.getApprovalFields() != null) {
            for (ApprovalField field : approvalData.getApprovalFields()) {
                if (field.isRequired() && StringUtils.isEmpty(
                    approvalData.getFieldValue(field.getFieldName()))) {
                    result.addError("必填字段 " + field.getFieldName() + " 不能为空");
                }
            }
        }
        
        return result;
    }
    
    /**
     * 创建审批历史记录
     * @param task 任务
     * @param approverId 审批者ID
     * @param approvalData 审批数据
     * @return 历史记录
     */
    private TaskHistory createApprovalHistory(Task task, String approverId, 
        TaskApprovalData approvalData) {
        
        TaskHistory history = new TaskHistory();
        history.setId(UUID.randomUUID().toString());
        history.setTaskId(task.getId());
        history.setOperationType(TaskOperationType.APPROVE);
        history.setOperatorId(approverId);
        history.setOperationTime(new Date());
        history.setComment(approvalData.getComment());
        history.setAttachments(approvalData.getAttachments());
        history.setOperationData(convertApprovalDataToMap(approvalData));
        
        return history;
    }
    
    /**
     * 转换审批数据为流程变量
     * @param approvalData 审批数据
     * @return 流程变量映射
     */
    private Map<String, Object> convertToProcessVariables(TaskApprovalData approvalData) {
        Map<String, Object> variables = new HashMap<>();
        
        // 添加审批结果
        variables.put("approved", true);
        variables.put("approvalComment", approvalData.getComment());
        
        // 添加自定义字段
        if (approvalData.getApprovalFields() != null) {
            for (ApprovalField field : approvalData.getApprovalFields()) {
                variables.put(field.getFieldName(), 
                    approvalData.getFieldValue(field.getFieldName()));
            }
        }
        
        return variables;
    }
}
```

## 驳回操作实现

驳回操作允许用户将任务退回给前一个节点或指定节点，通常用于审批不通过的情况。驳回操作需要处理复杂的流程回退逻辑。

```java
// 任务驳回服务
@Service
public class TaskRejectionService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ProcessEngine processEngine;
    
    @Autowired
    private TaskHistoryService taskHistoryService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 驳回任务到前一个节点
     * @param taskId 任务ID
     * @param rejectorId 驳回者ID
     * @param rejectionData 驳回数据
     * @return 驳回结果
     */
    public TaskRejectionResult rejectTaskToPrevious(String taskId, String rejectorId, 
        TaskRejectionData rejectionData) {
        
        TaskRejectionResult result = new TaskRejectionResult();
        result.setTaskId(taskId);
        result.setRejectorId(rejectorId);
        result.setRejectionTime(new Date());
        
        try {
            // 获取任务信息
            Task task = taskRepository.findById(taskId);
            if (task == null) {
                result.setSuccess(false);
                result.setErrorMessage("任务不存在");
                return result;
            }
            
            // 验证驳回者权限
            if (!task.getAssignee().equals(rejectorId)) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权驳回此任务");
                return result;
            }
            
            // 获取前一个任务节点
            Task previousTask = getPreviousTask(task);
            if (previousTask == null) {
                result.setSuccess(false);
                result.setErrorMessage("无法找到前一个任务节点");
                return result;
            }
            
            // 执行驳回操作
            executeRejection(task, previousTask, rejectorId, rejectionData);
            
            result.setSuccess(true);
            result.setTargetTaskId(previousTask.getId());
            result.setMessage("任务驳回成功");
            
        } catch (Exception e) {
            log.error("任务驳回失败 - 任务ID: {}, 驳回者ID: {}", taskId, rejectorId, e);
            result.setSuccess(false);
            result.setErrorMessage("任务驳回过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 驳回任务到指定节点
     * @param taskId 任务ID
     * @param rejectorId 驳回者ID
     * @param targetNodeId 目标节点ID
     * @param rejectionData 驳回数据
     * @return 驳回结果
     */
    public TaskRejectionResult rejectTaskToSpecificNode(String taskId, String rejectorId, 
        String targetNodeId, TaskRejectionData rejectionData) {
        
        TaskRejectionResult result = new TaskRejectionResult();
        result.setTaskId(taskId);
        result.setRejectorId(rejectorId);
        result.setRejectionTime(new Date());
        
        try {
            // 获取任务信息
            Task task = taskRepository.findById(taskId);
            if (task == null) {
                result.setSuccess(false);
                result.setErrorMessage("任务不存在");
                return result;
            }
            
            // 验证驳回者权限
            if (!task.getAssignee().equals(rejectorId)) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权驳回此任务");
                return result;
            }
            
            // 获取目标节点任务
            Task targetTask = getTaskByNodeId(task.getProcessInstanceId(), targetNodeId);
            if (targetTask == null) {
                result.setSuccess(false);
                result.setErrorMessage("指定的目标节点不存在");
                return result;
            }
            
            // 验证是否可以驳回到指定节点
            if (!canRejectToNode(task, targetTask)) {
                result.setSuccess(false);
                result.setErrorMessage("无法驳回到指定节点");
                return result;
            }
            
            // 执行驳回操作
            executeRejection(task, targetTask, rejectorId, rejectionData);
            
            result.setSuccess(true);
            result.setTargetTaskId(targetTask.getId());
            result.setMessage("任务驳回成功");
            
        } catch (Exception e) {
            log.error("任务驳回失败 - 任务ID: {}, 驳回者ID: {}, 目标节点: {}", 
                taskId, rejectorId, targetNodeId, e);
            result.setSuccess(false);
            result.setErrorMessage("任务驳回过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 执行驳回操作
     * @param currentTask 当前任务
     * @param targetTask 目标任务
     * @param rejectorId 驳回者ID
     * @param rejectionData 驳回数据
     */
    private void executeRejection(Task currentTask, Task targetTask, String rejectorId, 
        TaskRejectionData rejectionData) throws Exception {
        
        // 记录驳回历史
        TaskHistory history = createRejectionHistory(currentTask, targetTask, 
            rejectorId, rejectionData);
        taskHistoryService.saveHistory(history);
        
        // 更新当前任务状态
        currentTask.setStatus(TaskStatus.REJECTED);
        currentTask.setCompletionTime(new Date());
        currentTask.setOutcome(TaskOutcome.REJECTED);
        currentTask.setRejectionData(rejectionData);
        taskRepository.save(currentTask);
        
        // 重置目标任务状态
        targetTask.setStatus(TaskStatus.ASSIGNED);
        targetTask.setAssignee(rejectionData.getReassignTo());
        targetTask.setReactivatedTime(new Date());
        taskRepository.save(targetTask);
        
        // 触发流程回退
        RuntimeService runtimeService = processEngine.getRuntimeService();
        runtimeService.rejectTask(currentTask.getId(), targetTask.getId(), 
            convertToProcessVariables(rejectionData));
        
        // 发送驳回通知
        sendRejectionNotification(currentTask, targetTask, rejectorId, rejectionData);
    }
    
    /**
     * 获取前一个任务节点
     * @param task 当前任务
     * @return 前一个任务
     */
    private Task getPreviousTask(Task task) {
        // 这里需要根据流程实例的历史记录来查找前一个任务
        // 实现细节取决于具体的流程引擎
        return taskRepository.findPreviousTask(task.getProcessInstanceId(), 
            task.getTaskDefinitionKey());
    }
    
    /**
     * 根据节点ID获取任务
     * @param processInstanceId 流程实例ID
     * @param nodeId 节点ID
     * @return 任务
     */
    private Task getTaskByNodeId(String processInstanceId, String nodeId) {
        return taskRepository.findByProcessInstanceIdAndTaskDefinitionKey(
            processInstanceId, nodeId);
    }
    
    /**
     * 检查是否可以驳回到指定节点
     * @param currentTask 当前任务
     * @param targetTask 目标任务
     * @return 是否可以驳回
     */
    private boolean canRejectToNode(Task currentTask, Task targetTask) {
        // 检查目标任务是否已完成
        if (targetTask.getStatus() == TaskStatus.COMPLETED) {
            return false;
        }
        
        // 检查是否在同一流程实例中
        if (!currentTask.getProcessInstanceId().equals(targetTask.getProcessInstanceId())) {
            return false;
        }
        
        // 检查节点顺序（不能向前驳回）
        if (targetTask.getTaskOrder() >= currentTask.getTaskOrder()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 创建驳回历史记录
     * @param currentTask 当前任务
     * @param targetTask 目标任务
     * @param rejectorId 驳回者ID
     * @param rejectionData 驳回数据
     * @return 历史记录
     */
    private TaskHistory createRejectionHistory(Task currentTask, Task targetTask, 
        String rejectorId, TaskRejectionData rejectionData) {
        
        TaskHistory history = new TaskHistory();
        history.setId(UUID.randomUUID().toString());
        history.setTaskId(currentTask.getId());
        history.setOperationType(TaskOperationType.REJECT);
        history.setOperatorId(rejectorId);
        history.setOperationTime(new Date());
        history.setComment(rejectionData.getComment());
        history.setAttachments(rejectionData.getAttachments());
        history.setTargetTaskId(targetTask.getId());
        history.setOperationData(convertRejectionDataToMap(rejectionData));
        
        return history;
    }
}
```

## 任务转交操作实现

任务转交允许用户将任务委托给其他用户处理，这在用户无法亲自处理任务时非常有用。

```java
// 任务转交服务
@Service
public class TaskTransferService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskHistoryService taskHistoryService;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * 转交任务
     * @param taskId 任务ID
     * @param transferorId 转交者ID
     * @param transfereeId 接收者ID
     * @param transferData 转交数据
     * @return 转交结果
     */
    public TaskTransferResult transferTask(String taskId, String transferorId, 
        String transfereeId, TaskTransferData transferData) {
        
        TaskTransferResult result = new TaskTransferResult();
        result.setTaskId(taskId);
        result.setTransferorId(transferorId);
        result.setTransfereeId(transfereeId);
        result.setTransferTime(new Date());
        
        try {
            // 获取任务信息
            Task task = taskRepository.findById(taskId);
            if (task == null) {
                result.setSuccess(false);
                result.setErrorMessage("任务不存在");
                return result;
            }
            
            // 验证转交者权限
            if (!task.getAssignee().equals(transferorId)) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权转交此任务");
                return result;
            }
            
            // 验证接收者存在性
            User transferee = userRepository.findById(transfereeId);
            if (transferee == null) {
                result.setSuccess(false);
                result.setErrorMessage("指定的接收者不存在");
                return result;
            }
            
            // 检查接收者是否有处理任务的权限
            if (!hasPermissionToHandleTask(transferee, task)) {
                result.setSuccess(false);
                result.setErrorMessage("接收者没有处理该任务的权限");
                return result;
            }
            
            // 执行转交操作
            executeTransfer(task, transferorId, transfereeId, transferData);
            
            result.setSuccess(true);
            result.setTask(task);
            result.setMessage("任务转交成功");
            
        } catch (Exception e) {
            log.error("任务转交失败 - 任务ID: {}, 转交者ID: {}, 接收者ID: {}", 
                taskId, transferorId, transfereeId, e);
            result.setSuccess(false);
            result.setErrorMessage("任务转交过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 执行任务转交
     * @param task 任务
     * @param transferorId 转交者ID
     * @param transfereeId 接收者ID
     * @param transferData 转交数据
     */
    private void executeTransfer(Task task, String transferorId, String transfereeId, 
        TaskTransferData transferData) throws Exception {
        
        // 记录转交历史
        TaskHistory history = createTransferHistory(task, transferorId, transfereeId, transferData);
        taskHistoryService.saveHistory(history);
        
        // 更新任务分配
        String originalAssignee = task.getAssignee();
        task.setAssignee(transfereeId);
        task.setPreviousAssignee(originalAssignee);
        task.setTransferCount(task.getTransferCount() + 1);
        task.setLastTransferTime(new Date());
        taskRepository.save(task);
        
        // 发送转交通知
        sendTransferNotification(task, transferorId, transfereeId, transferData);
    }
    
    /**
     * 检查用户是否有处理任务的权限
     * @param user 用户
     * @param task 任务
     * @return 是否有权限
     */
    private boolean hasPermissionToHandleTask(User user, Task task) {
        // 检查用户角色权限
        List<String> userRoles = user.getRoleIds();
        List<String> requiredRoles = task.getRequiredRoles();
        
        if (requiredRoles != null && !requiredRoles.isEmpty()) {
            // 用户必须拥有至少一个必需角色
            boolean hasRequiredRole = userRoles.stream()
                .anyMatch(requiredRoles::contains);
            if (!hasRequiredRole) {
                return false;
            }
        }
        
        // 检查用户技能要求
        List<String> requiredSkills = task.getRequiredSkills();
        if (requiredSkills != null && !requiredSkills.isEmpty()) {
            if (!user.getSkills().containsAll(requiredSkills)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 创建转交历史记录
     * @param task 任务
     * @param transferorId 转交者ID
     * @param transfereeId 接收者ID
     * @param transferData 转交数据
     * @return 历史记录
     */
    private TaskHistory createTransferHistory(Task task, String transferorId, 
        String transfereeId, TaskTransferData transferData) {
        
        TaskHistory history = new TaskHistory();
        history.setId(UUID.randomUUID().toString());
        history.setTaskId(task.getId());
        history.setOperationType(TaskOperationType.TRANSFER);
        history.setOperatorId(transferorId);
        history.setOperationTime(new Date());
        history.setComment(transferData.getComment());
        history.setAttachments(transferData.getAttachments());
        history.setTargetUserId(transfereeId);
        history.setOperationData(convertTransferDataToMap(transferData));
        
        return history;
    }
}
```

## 会签与或签操作实现

会签和或签是多用户协同处理任务的两种常见模式。会签要求所有指定用户都完成任务，而或签只需要任意一个用户完成任务即可。

```java
// 会签与或签服务
@Service
public class MultiSignService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProcessEngine processEngine;
    
    @Autowired
    private TaskHistoryService taskHistoryService;
    
    /**
     * 启动会签任务
     * @param parentTaskId 父任务ID
     * @param participantIds 参与者ID列表
     * @param multiSignData 会签数据
     * @return 会签启动结果
     */
    public MultiSignResult startCountersign(String parentTaskId, List<String> participantIds, 
        MultiSignData multiSignData) {
        
        MultiSignResult result = new MultiSignResult();
        result.setParentTaskId(parentTaskId);
        result.setStartTime(new Date());
        result.setSignType(MultiSignType.COUNTERSIGN);
        
        try {
            // 获取父任务
            Task parentTask = taskRepository.findById(parentTaskId);
            if (parentTask == null) {
                result.setSuccess(false);
                result.setErrorMessage("父任务不存在");
                return result;
            }
            
            // 验证参与者列表
            if (participantIds == null || participantIds.isEmpty()) {
                result.setSuccess(false);
                result.setErrorMessage("参与者列表不能为空");
                return result;
            }
            
            // 创建会签子任务
            List<Task> subTasks = createCountersignSubTasks(parentTask, participantIds, multiSignData);
            
            // 更新父任务状态
            parentTask.setStatus(TaskStatus.WAITING_FOR_COUNTERSIGN);
            parentTask.setSubTaskIds(subTasks.stream().map(Task::getId).collect(Collectors.toList()));
            taskRepository.save(parentTask);
            
            result.setSuccess(true);
            result.setSubTasks(subTasks);
            result.setMessage("会签任务启动成功");
            
        } catch (Exception e) {
            log.error("启动会签任务失败 - 父任务ID: {}", parentTaskId, e);
            result.setSuccess(false);
            result.setErrorMessage("会签任务启动过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 启动或签任务
     * @param parentTaskId 父任务ID
     * @param participantIds 参与者ID列表
     * @param multiSignData 或签数据
     * @return 或签启动结果
     */
    public MultiSignResult startOrSign(String parentTaskId, List<String> participantIds, 
        MultiSignData multiSignData) {
        
        MultiSignResult result = new MultiSignResult();
        result.setParentTaskId(parentTaskId);
        result.setStartTime(new Date());
        result.setSignType(MultiSignType.OR_SIGN);
        
        try {
            // 获取父任务
            Task parentTask = taskRepository.findById(parentTaskId);
            if (parentTask == null) {
                result.setSuccess(false);
                result.setErrorMessage("父任务不存在");
                return result;
            }
            
            // 验证参与者列表
            if (participantIds == null || participantIds.isEmpty()) {
                result.setSuccess(false);
                result.setErrorMessage("参与者列表不能为空");
                return result;
            }
            
            // 创建或签子任务
            List<Task> subTasks = createOrSignSubTasks(parentTask, participantIds, multiSignData);
            
            // 更新父任务状态
            parentTask.setStatus(TaskStatus.WAITING_FOR_OR_SIGN);
            parentTask.setSubTaskIds(subTasks.stream().map(Task::getId).collect(Collectors.toList()));
            taskRepository.save(parentTask);
            
            result.setSuccess(true);
            result.setSubTasks(subTasks);
            result.setMessage("或签任务启动成功");
            
        } catch (Exception e) {
            log.error("启动或签任务失败 - 父任务ID: {}", parentTaskId, e);
            result.setSuccess(false);
            result.setErrorMessage("或签任务启动过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 创建会签子任务
     * @param parentTask 父任务
     * @param participantIds 参与者ID列表
     * @param multiSignData 会签数据
     * @return 子任务列表
     */
    private List<Task> createCountersignSubTasks(Task parentTask, List<String> participantIds, 
        MultiSignData multiSignData) {
        
        List<Task> subTasks = new ArrayList<>();
        
        for (String participantId : participantIds) {
            Task subTask = new Task();
            subTask.setId(UUID.randomUUID().toString());
            subTask.setParentTaskId(parentTask.getId());
            subTask.setProcessInstanceId(parentTask.getProcessInstanceId());
            subTask.setProcessDefinitionKey(parentTask.getProcessDefinitionKey());
            subTask.setTaskDefinitionKey(parentTask.getTaskDefinitionKey() + "_countersign");
            subTask.setTitle(parentTask.getTitle() + " - 会签[" + participantId + "]");
            subTask.setDescription(parentTask.getDescription());
            subTask.setAssignee(participantId);
            subTask.setStatus(TaskStatus.ASSIGNED);
            subTask.setPriority(parentTask.getPriority());
            subTask.setCreateTime(new Date());
            subTask.setDueDate(parentTask.getDueDate());
            subTask.setRequiredRoles(parentTask.getRequiredRoles());
            subTask.setRequiredSkills(parentTask.getRequiredSkills());
            subTask.setMultiSignType(MultiSignType.COUNTERSIGN);
            subTask.setMultiSignData(multiSignData);
            
            taskRepository.save(subTask);
            subTasks.add(subTask);
        }
        
        return subTasks;
    }
    
    /**
     * 创建或签子任务
     * @param parentTask 父任务
     * @param participantIds 参与者ID列表
     * @param multiSignData 或签数据
     * @return 子任务列表
     */
    private List<Task> createOrSignSubTasks(Task parentTask, List<String> participantIds, 
        MultiSignData multiSignData) {
        
        List<Task> subTasks = new ArrayList<>();
        
        for (String participantId : participantIds) {
            Task subTask = new Task();
            subTask.setId(UUID.randomUUID().toString());
            subTask.setParentTaskId(parentTask.getId());
            subTask.setProcessInstanceId(parentTask.getProcessInstanceId());
            subTask.setProcessDefinitionKey(parentTask.getProcessDefinitionKey());
            subTask.setTaskDefinitionKey(parentTask.getTaskDefinitionKey() + "_orsign");
            subTask.setTitle(parentTask.getTitle() + " - 或签[" + participantId + "]");
            subTask.setDescription(parentTask.getDescription());
            subTask.setAssignee(participantId);
            subTask.setStatus(TaskStatus.ASSIGNED);
            subTask.setPriority(parentTask.getPriority());
            subTask.setCreateTime(new Date());
            subTask.setDueDate(parentTask.getDueDate());
            subTask.setRequiredRoles(parentTask.getRequiredRoles());
            subTask.setRequiredSkills(parentTask.getRequiredSkills());
            subTask.setMultiSignType(MultiSignType.OR_SIGN);
            subTask.setMultiSignData(multiSignData);
            
            taskRepository.save(subTask);
            subTasks.add(subTask);
        }
        
        return subTasks;
    }
    
    /**
     * 完成会签子任务
     * @param subTaskId 子任务ID
     * @param participantId 参与者ID
     * @param approvalData 审批数据
     * @return 完成结果
     */
    public MultiSignSubTaskResult completeCountersignSubTask(String subTaskId, String participantId, 
        TaskApprovalData approvalData) {
        
        MultiSignSubTaskResult result = new MultiSignSubTaskResult();
        result.setSubTaskId(subTaskId);
        result.setParticipantId(participantId);
        result.setCompletionTime(new Date());
        
        try {
            // 获取子任务
            Task subTask = taskRepository.findById(subTaskId);
            if (subTask == null) {
                result.setSuccess(false);
                result.setErrorMessage("子任务不存在");
                return result;
            }
            
            // 验证参与者权限
            if (!subTask.getAssignee().equals(participantId)) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权处理此子任务");
                return result;
            }
            
            // 完成子任务
            subTask.setStatus(TaskStatus.COMPLETED);
            subTask.setCompletionTime(new Date());
            subTask.setApprovalData(approvalData);
            taskRepository.save(subTask);
            
            // 检查是否所有会签子任务都已完成
            boolean allCompleted = checkAllCountersignTasksCompleted(subTask.getParentTaskId());
            
            if (allCompleted) {
                // 完成父任务
                completeParentTask(subTask.getParentTaskId(), approvalData);
            }
            
            result.setSuccess(true);
            result.setAllCompleted(allCompleted);
            result.setMessage("会签子任务完成成功");
            
        } catch (Exception e) {
            log.error("完成会签子任务失败 - 子任务ID: {}, 参与者ID: {}", subTaskId, participantId, e);
            result.setSuccess(false);
            result.setErrorMessage("会签子任务完成过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 检查所有会签子任务是否都已完成
     * @param parentTaskId 父任务ID
     * @return 是否都已完成
     */
    private boolean checkAllCountersignTasksCompleted(String parentTaskId) {
        Task parentTask = taskRepository.findById(parentTaskId);
        if (parentTask == null || parentTask.getSubTaskIds() == null) {
            return false;
        }
        
        List<Task> subTasks = taskRepository.findByIds(parentTask.getSubTaskIds());
        return subTasks.stream().allMatch(task -> task.getStatus() == TaskStatus.COMPLETED);
    }
    
    /**
     * 完成父任务
     * @param parentTaskId 父任务ID
     * @param approvalData 审批数据
     */
    private void completeParentTask(String parentTaskId, TaskApprovalData approvalData) {
        Task parentTask = taskRepository.findById(parentTaskId);
        if (parentTask != null) {
            parentTask.setStatus(TaskStatus.COMPLETED);
            parentTask.setCompletionTime(new Date());
            parentTask.setOutcome(TaskOutcome.APPROVED);
            parentTask.setApprovalData(approvalData);
            taskRepository.save(parentTask);
            
            // 触发流程继续执行
            RuntimeService runtimeService = processEngine.getRuntimeService();
            runtimeService.completeTask(parentTaskId, convertToProcessVariables(approvalData));
        }
    }
}
```

## 加签操作实现

加签允许在任务处理过程中临时增加新的处理者，这在需要额外审批或咨询时非常有用。

```java
// 加签服务
@Service
public class AddSignService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskHistoryService taskHistoryService;
    
    /**
     * 添加加签人员
     * @param taskId 任务ID
     * @param requesterId 请求者ID
     * @param addSigneeId 加签人员ID
     * @param addSignData 加签数据
     * @return 加签结果
     */
    public AddSignResult addSignee(String taskId, String requesterId, String addSigneeId, 
        AddSignData addSignData) {
        
        AddSignResult result = new AddSignResult();
        result.setTaskId(taskId);
        result.setRequesterId(requesterId);
        result.setAddSigneeId(addSigneeId);
        result.setRequestTime(new Date());
        
        try {
            // 获取任务信息
            Task task = taskRepository.findById(taskId);
            if (task == null) {
                result.setSuccess(false);
                result.setErrorMessage("任务不存在");
                return result;
            }
            
            // 验证请求者权限（必须是任务处理者或其上级）
            if (!task.getAssignee().equals(requesterId) && 
                !isSupervisorOf(requesterId, task.getAssignee())) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权添加加签人员");
                return result;
            }
            
            // 验证加签人员存在性
            User addSignee = userRepository.findById(addSigneeId);
            if (addSignee == null) {
                result.setSuccess(false);
                result.setErrorMessage("指定的加签人员不存在");
                return result;
            }
            
            // 检查加签人员是否已经有此任务
            if (task.getAddSignees() != null && task.getAddSignees().contains(addSigneeId)) {
                result.setSuccess(false);
                result.setErrorMessage("该人员已经是加签人员");
                return result;
            }
            
            // 添加加签人员
            executeAddSign(task, addSigneeId, addSignData);
            
            result.setSuccess(true);
            result.setMessage("加签人员添加成功");
            
        } catch (Exception e) {
            log.error("添加加签人员失败 - 任务ID: {}, 请求者ID: {}, 加签人员ID: {}", 
                taskId, requesterId, addSigneeId, e);
            result.setSuccess(false);
            result.setErrorMessage("添加加签人员过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 执行加签操作
     * @param task 任务
     * @param addSigneeId 加签人员ID
     * @param addSignData 加签数据
     */
    private void executeAddSign(Task task, String addSigneeId, AddSignData addSignData) {
        // 更新任务的加签人员列表
        if (task.getAddSignees() == null) {
            task.setAddSignees(new ArrayList<>());
        }
        task.getAddSignees().add(addSigneeId);
        
        // 更新任务状态（如果需要）
        if (task.getStatus() == TaskStatus.ASSIGNED) {
            task.setStatus(TaskStatus.WAITING_FOR_ADD_SIGN);
        }
        
        taskRepository.save(task);
        
        // 创建加签子任务
        Task addSignSubTask = createAddSignSubTask(task, addSigneeId, addSignData);
        taskRepository.save(addSignSubTask);
        
        // 记录加签历史
        TaskHistory history = createAddSignHistory(task, addSigneeId, addSignData);
        taskHistoryService.saveHistory(history);
        
        // 发送加签通知
        sendAddSignNotification(task, addSigneeId, addSignData);
    }
    
    /**
     * 创建加签子任务
     * @param parentTask 父任务
     * @param addSigneeId 加签人员ID
     * @param addSignData 加签数据
     * @return 加签子任务
     */
    private Task createAddSignSubTask(Task parentTask, String addSigneeId, AddSignData addSignData) {
        Task subTask = new Task();
        subTask.setId(UUID.randomUUID().toString());
        subTask.setParentTaskId(parentTask.getId());
        subTask.setProcessInstanceId(parentTask.getProcessInstanceId());
        subTask.setProcessDefinitionKey(parentTask.getProcessDefinitionKey());
        subTask.setTaskDefinitionKey(parentTask.getTaskDefinitionKey() + "_addsign");
        subTask.setTitle(parentTask.getTitle() + " - 加签[" + addSigneeId + "]");
        subTask.setDescription(parentTask.getDescription());
        subTask.setAssignee(addSigneeId);
        subTask.setStatus(TaskStatus.ASSIGNED);
        subTask.setPriority(parentTask.getPriority());
        subTask.setCreateTime(new Date());
        subTask.setDueDate(parentTask.getDueDate());
        subTask.setAddSignTask(true);
        subTask.setAddSignData(addSignData);
        
        return subTask;
    }
    
    /**
     * 检查是否为上级关系
     * @param supervisorId 上级ID
     * @param subordinateId 下级ID
     * @return 是否为上级关系
     */
    private boolean isSupervisorOf(String supervisorId, String subordinateId) {
        User subordinate = userRepository.findById(subordinateId);
        if (subordinate == null) return false;
        
        return supervisorId.equals(subordinate.getSupervisorId());
    }
    
    /**
     * 完成加签任务
     * @param addSignTaskId 加签任务ID
     * @param addSigneeId 加签人员ID
     * @param approvalData 审批数据
     * @return 完成结果
     */
    public AddSignCompletionResult completeAddSignTask(String addSignTaskId, String addSigneeId, 
        TaskApprovalData approvalData) {
        
        AddSignCompletionResult result = new AddSignCompletionResult();
        result.setAddSignTaskId(addSignTaskId);
        result.setAddSigneeId(addSigneeId);
        result.setCompletionTime(new Date());
        
        try {
            // 获取加签任务
            Task addSignTask = taskRepository.findById(addSignTaskId);
            if (addSignTask == null || !addSignTask.isAddSignTask()) {
                result.setSuccess(false);
                result.setErrorMessage("加签任务不存在");
                return result;
            }
            
            // 验证加签人员权限
            if (!addSignTask.getAssignee().equals(addSigneeId)) {
                result.setSuccess(false);
                result.setErrorMessage("当前用户无权处理此加签任务");
                return result;
            }
            
            // 完成加签任务
            addSignTask.setStatus(TaskStatus.COMPLETED);
            addSignTask.setCompletionTime(new Date());
            addSignTask.setApprovalData(approvalData);
            taskRepository.save(addSignTask);
            
            // 检查是否还有未完成的加签任务
            boolean hasPendingAddSignTasks = checkHasPendingAddSignTasks(
                addSignTask.getParentTaskId());
            
            if (!hasPendingAddSignTasks) {
                // 恢复父任务状态
                restoreParentTaskStatus(addSignTask.getParentTaskId());
            }
            
            result.setSuccess(true);
            result.setHasPendingTasks(hasPendingAddSignTasks);
            result.setMessage("加签任务完成成功");
            
        } catch (Exception e) {
            log.error("完成加签任务失败 - 加签任务ID: {}, 加签人员ID: {}", addSignTaskId, addSigneeId, e);
            result.setSuccess(false);
            result.setErrorMessage("加签任务完成过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 检查是否还有未完成的加签任务
     * @param parentTaskId 父任务ID
     * @return 是否还有未完成的加签任务
     */
    private boolean checkHasPendingAddSignTasks(String parentTaskId) {
        List<Task> addSignTasks = taskRepository.findAddSignTasksByParentTaskId(parentTaskId);
        return addSignTasks.stream().anyMatch(task -> 
            task.getStatus() == TaskStatus.ASSIGNED || task.getStatus() == TaskStatus.IN_PROGRESS);
    }
    
    /**
     * 恢复父任务状态
     * @param parentTaskId 父任务ID
     */
    private void restoreParentTaskStatus(String parentTaskId) {
        Task parentTask = taskRepository.findById(parentTaskId);
        if (parentTask != null) {
            parentTask.setStatus(TaskStatus.ASSIGNED);
            taskRepository.save(parentTask);
        }
    }
}
```

## 最佳实践与注意事项

在实现任务操作支持时，需要注意以下最佳实践：

### 1. 权限控制
确保所有任务操作都经过严格的权限验证，防止未授权操作。

### 2. 数据一致性
在执行复杂操作时，确保数据的一致性，使用事务机制保证操作的原子性。

### 3. 审计日志
完整记录所有任务操作历史，便于问题排查和审计。

### 4. 用户体验
提供直观易用的操作界面，减少用户操作复杂度。

### 5. 错误处理
建立完善的错误处理机制，确保在操作失败时能够正确回滚和提示用户。

通过合理设计和实现任务操作支持功能，可以显著提升BPM平台的灵活性和实用性，满足企业复杂的业务流程需求。