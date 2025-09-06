---
title: 与文档管理系统集成：流程附件、合规存档
date: 2025-09-06
categories: [BPM]
tags: [bpm, document management, integration, attachment, archive, compliance]
published: true
---

# 与文档管理系统集成：流程附件、合规存档

在企业级BPM平台中，文档管理是业务流程的重要组成部分。通过与专业的文档管理系统集成，可以实现流程附件的统一管理、合规性文档的存档以及版本控制等功能，确保业务流程中产生的各类文档得到有效管理和合规保存。

## 文档管理系统集成的核心价值

### 统一文档管理
通过集成文档管理系统，可以实现流程中所有文档的统一存储和管理，避免文档分散在各个系统中，提高文档的可查找性和可管理性。

### 合规性保障
专业的文档管理系统通常具备完善的合规性功能，如文档版本控制、审计跟踪、权限管理等，能够满足企业内外部审计要求。

### 协作效率提升
集成的文档管理系统支持多人协作编辑、评论、审批等功能，提升团队协作效率。

## 文档管理系统集成架构设计

一个高效的文档管理系统集成架构需要支持多种文档操作，确保与文档管理系统的无缝对接。

```java
// 文档管理集成服务
@Service
public class DocumentManagementIntegrationService {
    
    @Autowired
    private DocumentManagementClient documentClient;
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private DocumentLogRepository logRepository;
    
    /**
     * 上传流程附件到文档管理系统
     * @param processInstanceId 流程实例ID
     * @param taskId 任务ID
     * @param file 文件
     * @param metadata 元数据
     * @return 文档信息
     */
    public DocumentInfo uploadProcessAttachment(String processInstanceId, String taskId, 
        MultipartFile file, DocumentMetadata metadata) {
        
        DocumentLog log = createDocumentLog("UPLOAD", processInstanceId, taskId, file.getOriginalFilename());
        
        try {
            // 设置文档元数据
            metadata.setProcessInstanceId(processInstanceId);
            metadata.setTaskId(taskId);
            metadata.setFileName(file.getOriginalFilename());
            metadata.setFileSize(file.getSize());
            metadata.setUploadTime(new Date());
            
            // 上传文档到文档管理系统
            DocumentInfo docInfo = documentClient.uploadDocument(file, metadata);
            
            // 保存文档信息到本地数据库
            Document document = new Document();
            document.setId(docInfo.getId());
            document.setProcessInstanceId(processInstanceId);
            document.setTaskId(taskId);
            document.setName(docInfo.getName());
            document.setPath(docInfo.getPath());
            document.setSize(docInfo.getSize());
            document.setType(docInfo.getType());
            document.setVersion(docInfo.getVersion());
            document.setCreatedBy(metadata.getCreatedBy());
            document.setCreateTime(new Date());
            documentRepository.save(document);
            
            // 记录成功日志
            log.setSuccess(true);
            log.setDocumentId(docInfo.getId());
            logRepository.save(log);
            
            return docInfo;
        } catch (Exception e) {
            log.setSuccess(false);
            log.setErrorMessage(e.getMessage());
            logRepository.save(log);
            
            log.error("上传流程附件失败 - 流程实例ID: {}, 任务ID: {}, 文件名: {}", 
                processInstanceId, taskId, file.getOriginalFilename(), e);
            throw new DocumentIntegrationException("上传流程附件失败", e);
        }
    }
    
    /**
     * 从文档管理系统下载文档
     * @param documentId 文档ID
     * @return 文档内容
     */
    public byte[] downloadDocument(String documentId) {
        DocumentLog log = createDocumentLog("DOWNLOAD", null, null, documentId);
        
        try {
            // 从文档管理系统下载文档
            byte[] content = documentClient.downloadDocument(documentId);
            
            // 记录成功日志
            log.setSuccess(true);
            log.setDocumentId(documentId);
            logRepository.save(log);
            
            return content;
        } catch (Exception e) {
            log.setSuccess(false);
            log.setErrorMessage(e.getMessage());
            logRepository.save(log);
            
            log.error("下载文档失败 - 文档ID: {}", documentId, e);
            throw new DocumentIntegrationException("下载文档失败", e);
        }
    }
    
    /**
     * 获取流程实例的所有文档
     * @param processInstanceId 流程实例ID
     * @return 文档列表
     */
    public List<DocumentInfo> getProcessDocuments(String processInstanceId) {
        try {
            return documentClient.getDocumentsByProcessInstance(processInstanceId);
        } catch (Exception e) {
            log.error("获取流程文档失败 - 流程实例ID: {}", processInstanceId, e);
            throw new DocumentIntegrationException("获取流程文档失败", e);
        }
    }
    
    /**
     * 删除文档
     * @param documentId 文档ID
     * @return 删除结果
     */
    public DocumentOperationResult deleteDocument(String documentId) {
        DocumentLog log = createDocumentLog("DELETE", null, null, documentId);
        
        try {
            // 从文档管理系统删除文档
            DocumentOperationResult result = documentClient.deleteDocument(documentId);
            
            if (result.isSuccess()) {
                // 从本地数据库删除文档记录
                documentRepository.deleteById(documentId);
                
                // 记录成功日志
                log.setSuccess(true);
                log.setDocumentId(documentId);
                logRepository.save(log);
            } else {
                log.setSuccess(false);
                log.setErrorMessage(result.getMessage());
                logRepository.save(log);
            }
            
            return result;
        } catch (Exception e) {
            log.setSuccess(false);
            log.setErrorMessage(e.getMessage());
            logRepository.save(log);
            
            log.error("删除文档失败 - 文档ID: {}", documentId, e);
            return new DocumentOperationResult(false, "删除文档失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建文档操作日志
     * @param operation 操作类型
     * @param processInstanceId 流程实例ID
     * @param taskId 任务ID
     * @param fileName 文件名
     * @return 文档日志
     */
    private DocumentLog createDocumentLog(String operation, String processInstanceId, 
        String taskId, String fileName) {
        DocumentLog log = new DocumentLog();
        log.setId(UUID.randomUUID().toString());
        log.setOperation(operation);
        log.setProcessInstanceId(processInstanceId);
        log.setTaskId(taskId);
        log.setFileName(fileName);
        log.setOperationTime(new Date());
        logRepository.save(log);
        return log;
    }
}
```

## 文档上传与下载实现

文档的上传和下载是文档管理系统集成的基础功能，需要确保操作的安全性和效率。

```java
// 文档管理客户端实现
@Component
public class DocumentManagementClient {
    
    @Value("${document.management.api.url}")
    private String apiUrl;
    
    @Value("${document.management.api.token}")
    private String apiToken;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 上传文档
     * @param file 文件
     * @param metadata 元数据
     * @return 文档信息
     */
    public DocumentInfo uploadDocument(MultipartFile file, DocumentMetadata metadata) {
        try {
            // 创建请求URL
            String url = apiUrl + "/documents";
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // 创建请求体
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // 添加文件
            body.add("file", new MultipartInputStreamFileResource(
                file.getInputStream(), file.getOriginalFilename()));
            
            // 添加元数据
            body.add("metadata", objectMapper.writeValueAsString(metadata));
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            // 发送请求
            ResponseEntity<DocumentInfo> response = restTemplate.postForEntity(
                url, requestEntity, DocumentInfo.class);
            
            return response.getBody();
        } catch (Exception e) {
            throw new DocumentIntegrationException("上传文档失败", e);
        }
    }
    
    /**
     * 下载文档
     * @param documentId 文档ID
     * @return 文档内容
     */
    public byte[] downloadDocument(String documentId) {
        try {
            // 创建请求URL
            String url = apiUrl + "/documents/" + documentId + "/content";
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            headers.set("Accept", "application/octet-stream");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // 发送请求
            ResponseEntity<byte[]> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, byte[].class);
            
            return response.getBody();
        } catch (Exception e) {
            throw new DocumentIntegrationException("下载文档失败", e);
        }
    }
    
    /**
     * 获取文档信息
     * @param documentId 文档ID
     * @return 文档信息
     */
    public DocumentInfo getDocumentInfo(String documentId) {
        try {
            // 创建请求URL
            String url = apiUrl + "/documents/" + documentId;
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // 发送请求
            ResponseEntity<DocumentInfo> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, DocumentInfo.class);
            
            return response.getBody();
        } catch (Exception e) {
            throw new DocumentIntegrationException("获取文档信息失败", e);
        }
    }
    
    /**
     * 根据流程实例获取文档
     * @param processInstanceId 流程实例ID
     * @return 文档列表
     */
    public List<DocumentInfo> getDocumentsByProcessInstance(String processInstanceId) {
        try {
            // 创建请求URL
            String url = apiUrl + "/documents?processInstanceId=" + processInstanceId;
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // 发送请求
            ResponseEntity<DocumentInfo[]> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, DocumentInfo[].class);
            
            return Arrays.asList(response.getBody());
        } catch (Exception e) {
            throw new DocumentIntegrationException("获取流程文档失败", e);
        }
    }
    
    /**
     * 删除文档
     * @param documentId 文档ID
     * @return 操作结果
     */
    public DocumentOperationResult deleteDocument(String documentId) {
        try {
            // 创建请求URL
            String url = apiUrl + "/documents/" + documentId;
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // 发送请求
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.DELETE, entity, String.class);
            
            return new DocumentOperationResult(true, "文档删除成功");
        } catch (Exception e) {
            return new DocumentOperationResult(false, "删除文档失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新文档元数据
     * @param documentId 文档ID
     * @param metadata 元数据
     * @return 更新结果
     */
    public DocumentOperationResult updateDocumentMetadata(String documentId, 
        DocumentMetadata metadata) {
        try {
            // 创建请求URL
            String url = apiUrl + "/documents/" + documentId + "/metadata";
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            headers.set("Content-Type", "application/json");
            
            // 设置请求体
            String requestBody = objectMapper.writeValueAsString(metadata);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            // 发送请求
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.PUT, entity, String.class);
            
            return new DocumentOperationResult(true, "文档元数据更新成功");
        } catch (Exception e) {
            return new DocumentOperationResult(false, "更新文档元数据失败: " + e.getMessage());
        }
    }
}
```

## 合规性文档存档实现

合规性文档存档是文档管理系统的重要功能，需要满足企业内外部审计要求。

```java
// 合规性文档存档服务
@Service
public class ComplianceDocumentArchivingService {
    
    @Autowired
    private DocumentManagementClient documentClient;
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private ComplianceRuleRepository complianceRuleRepository;
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    /**
     * 根据合规规则自动存档文档
     * @param processInstanceId 流程实例ID
     * @param documentId 文档ID
     * @return 存档结果
     */
    public DocumentArchivingResult archiveDocumentForCompliance(String processInstanceId, 
        String documentId) {
        
        DocumentArchivingResult result = new DocumentArchivingResult();
        result.setProcessInstanceId(processInstanceId);
        result.setDocumentId(documentId);
        result.setArchiveStartTime(new Date());
        
        try {
            // 获取文档信息
            DocumentInfo documentInfo = documentClient.getDocumentInfo(documentId);
            
            // 获取适用的合规规则
            List<ComplianceRule> applicableRules = getApplicableComplianceRules(
                processInstanceId, documentInfo);
            
            if (applicableRules.isEmpty()) {
                result.setSuccess(false);
                result.setMessage("未找到适用的合规规则");
                return result;
            }
            
            // 应用合规规则
            for (ComplianceRule rule : applicableRules) {
                applyComplianceRule(documentInfo, rule);
            }
            
            // 执行存档操作
            DocumentOperationResult archiveResult = documentClient.archiveDocument(documentId);
            
            if (archiveResult.isSuccess()) {
                // 更新文档状态
                Document document = documentRepository.findById(documentId);
                if (document != null) {
                    document.setStatus(DocumentStatus.ARCHIVED);
                    document.setArchiveTime(new Date());
                    documentRepository.save(document);
                }
                
                // 记录审计日志
                recordComplianceAuditLog(processInstanceId, documentId, applicableRules);
                
                result.setSuccess(true);
                result.setMessage("文档合规存档成功");
            } else {
                result.setSuccess(false);
                result.setMessage("文档存档失败: " + archiveResult.getMessage());
            }
            
            result.setArchiveEndTime(new Date());
            
        } catch (Exception e) {
            log.error("文档合规存档失败 - 流程实例ID: {}, 文档ID: {}", processInstanceId, documentId, e);
            result.setSuccess(false);
            result.setArchiveEndTime(new Date());
            result.setMessage("文档合规存档过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取适用的合规规则
     * @param processInstanceId 流程实例ID
     * @param documentInfo 文档信息
     * @return 合规规则列表
     */
    private List<ComplianceRule> getApplicableComplianceRules(String processInstanceId, 
        DocumentInfo documentInfo) {
        
        List<ComplianceRule> applicableRules = new ArrayList<>();
        
        try {
            // 获取流程定义信息
            ProcessDefinition processDefinition = getProcessDefinition(processInstanceId);
            
            // 根据流程类型、文档类型等条件筛选合规规则
            List<ComplianceRule> allRules = complianceRuleRepository.findAllActiveRules();
            
            for (ComplianceRule rule : allRules) {
                // 检查流程类型匹配
                if (rule.getApplicableProcessTypes() != null && 
                    !rule.getApplicableProcessTypes().isEmpty()) {
                    if (!rule.getApplicableProcessTypes().contains(processDefinition.getType())) {
                        continue;
                    }
                }
                
                // 检查文档类型匹配
                if (rule.getApplicableDocumentTypes() != null && 
                    !rule.getApplicableDocumentTypes().isEmpty()) {
                    if (!rule.getApplicableDocumentTypes().contains(documentInfo.getType())) {
                        continue;
                    }
                }
                
                // 检查其他条件
                if (matchesAdditionalConditions(rule, processInstanceId, documentInfo)) {
                    applicableRules.add(rule);
                }
            }
        } catch (Exception e) {
            log.warn("获取适用合规规则时发生错误", e);
        }
        
        return applicableRules;
    }
    
    /**
     * 检查是否满足额外条件
     * @param rule 合规规则
     * @param processInstanceId 流程实例ID
     * @param documentInfo 文档信息
     * @return 是否满足条件
     */
    private boolean matchesAdditionalConditions(ComplianceRule rule, String processInstanceId, 
        DocumentInfo documentInfo) {
        // 这里可以实现更复杂的条件匹配逻辑
        // 例如：根据业务数据、用户角色等条件判断
        
        // 示例：检查是否需要加密存储
        if (rule.isEncryptionRequired()) {
            // 检查文档是否已加密
            return documentInfo.isEncrypted();
        }
        
        // 示例：检查保留期限
        if (rule.getRetentionPeriod() > 0) {
            // 检查文档是否设置了正确的保留期限
            return documentInfo.getRetentionPeriod() >= rule.getRetentionPeriod();
        }
        
        return true;
    }
    
    /**
     * 应用合规规则
     * @param documentInfo 文档信息
     * @param rule 合规规则
     */
    private void applyComplianceRule(DocumentInfo documentInfo, ComplianceRule rule) {
        try {
            // 应用加密要求
            if (rule.isEncryptionRequired() && !documentInfo.isEncrypted()) {
                documentClient.encryptDocument(documentInfo.getId());
                documentInfo.setEncrypted(true);
            }
            
            // 应用水印要求
            if (rule.isWatermarkRequired()) {
                documentClient.addWatermark(documentInfo.getId(), rule.getWatermarkText());
            }
            
            // 应用访问控制要求
            if (rule.getRequiredPermissions() != null && !rule.getRequiredPermissions().isEmpty()) {
                documentClient.setDocumentPermissions(documentInfo.getId(), 
                    rule.getRequiredPermissions());
            }
            
            // 设置保留期限
            if (rule.getRetentionPeriod() > 0) {
                documentClient.setDocumentRetentionPeriod(documentInfo.getId(), 
                    rule.getRetentionPeriod());
            }
        } catch (Exception e) {
            log.warn("应用合规规则时发生错误 - 规则ID: {}, 文档ID: {}", 
                rule.getId(), documentInfo.getId(), e);
        }
    }
    
    /**
     * 记录合规审计日志
     * @param processInstanceId 流程实例ID
     * @param documentId 文档ID
     * @param rules 应用的合规规则
     */
    private void recordComplianceAuditLog(String processInstanceId, String documentId, 
        List<ComplianceRule> rules) {
        
        AuditLog auditLog = new AuditLog();
        auditLog.setId(UUID.randomUUID().toString());
        auditLog.setProcessInstanceId(processInstanceId);
        auditLog.setDocumentId(documentId);
        auditLog.setAction("COMPLIANCE_ARCHIVE");
        auditLog.setTimestamp(new Date());
        auditLog.setDetails("应用合规规则: " + rules.stream()
            .map(ComplianceRule::getName)
            .collect(Collectors.joining(", ")));
        auditLogRepository.save(auditLog);
    }
    
    /**
     * 批量合规存档
     * @param processInstanceId 流程实例ID
     * @return 存档结果
     */
    public BatchArchivingResult batchArchiveDocumentsForCompliance(String processInstanceId) {
        BatchArchivingResult result = new BatchArchivingResult();
        result.setProcessInstanceId(processInstanceId);
        result.setStartTime(new Date());
        
        try {
            // 获取流程实例的所有文档
            List<DocumentInfo> documents = documentClient.getDocumentsByProcessInstance(
                processInstanceId);
            
            int successCount = 0;
            int failureCount = 0;
            List<String> failedDocuments = new ArrayList<>();
            
            for (DocumentInfo document : documents) {
                try {
                    DocumentArchivingResult archivingResult = archiveDocumentForCompliance(
                        processInstanceId, document.getId());
                    
                    if (archivingResult.isSuccess()) {
                        successCount++;
                    } else {
                        failureCount++;
                        failedDocuments.add(document.getId() + ": " + archivingResult.getMessage());
                    }
                } catch (Exception e) {
                    failureCount++;
                    failedDocuments.add(document.getId() + ": " + e.getMessage());
                }
            }
            
            result.setSuccessCount(successCount);
            result.setFailureCount(failureCount);
            result.setFailedDocuments(failedDocuments);
            result.setEndTime(new Date());
            
            if (failureCount == 0) {
                result.setSuccess(true);
                result.setMessage("批量合规存档完成，成功存档 " + successCount + " 个文档");
            } else {
                result.setSuccess(false);
                result.setMessage("批量合规存档完成，成功 " + successCount + " 个，失败 " + failureCount + " 个");
            }
            
        } catch (Exception e) {
            log.error("批量合规存档失败 - 流程实例ID: {}", processInstanceId, e);
            result.setSuccess(false);
            result.setEndTime(new Date());
            result.setMessage("批量合规存档过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
}
```

## 文档版本控制实现

文档版本控制是文档管理系统的重要功能，确保文档的变更历史可追溯。

```java
// 文档版本控制服务
@Service
public class DocumentVersionControlService {
    
    @Autowired
    private DocumentManagementClient documentClient;
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private DocumentVersionRepository versionRepository;
    
    /**
     * 创建文档新版本
     * @param documentId 文档ID
     * @param file 新版本文件
     * @param changeDescription 变更描述
     * @param changedBy 变更人
     * @return 新版本信息
     */
    public DocumentVersion createNewVersion(String documentId, MultipartFile file, 
        String changeDescription, String changedBy) {
        
        try {
            // 获取当前文档信息
            DocumentInfo currentDocument = documentClient.getDocumentInfo(documentId);
            
            // 上传新版本到文档管理系统
            DocumentVersion newVersion = documentClient.uploadNewVersion(
                documentId, file, changeDescription, changedBy);
            
            // 保存版本信息到本地数据库
            DocumentVersion version = new DocumentVersion();
            version.setId(newVersion.getId());
            version.setDocumentId(documentId);
            version.setVersionNumber(newVersion.getVersionNumber());
            version.setFileName(file.getOriginalFilename());
            version.setFileSize(file.getSize());
            version.setChangeDescription(changeDescription);
            version.setChangedBy(changedBy);
            version.setChangeTime(new Date());
            version.setPath(newVersion.getPath());
            versionRepository.save(version);
            
            // 更新文档的最新版本信息
            Document document = documentRepository.findById(documentId);
            if (document != null) {
                document.setLatestVersion(newVersion.getVersionNumber());
                document.setLastModifiedTime(new Date());
                document.setLastModifiedBy(changedBy);
                documentRepository.save(document);
            }
            
            return newVersion;
        } catch (Exception e) {
            log.error("创建文档新版本失败 - 文档ID: {}", documentId, e);
            throw new DocumentIntegrationException("创建文档新版本失败", e);
        }
    }
    
    /**
     * 获取文档版本历史
     * @param documentId 文档ID
     * @return 版本历史列表
     */
    public List<DocumentVersion> getDocumentVersionHistory(String documentId) {
        try {
            return versionRepository.findByDocumentIdOrderByVersionNumberDesc(documentId);
        } catch (Exception e) {
            log.error("获取文档版本历史失败 - 文档ID: {}", documentId, e);
            throw new DocumentIntegrationException("获取文档版本历史失败", e);
        }
    }
    
    /**
     * 恢复到指定版本
     * @param documentId 文档ID
     * @param versionNumber 版本号
     * @return 恢复结果
     */
    public DocumentOperationResult restoreToVersion(String documentId, int versionNumber) {
        try {
            // 从文档管理系统恢复到指定版本
            DocumentOperationResult result = documentClient.restoreDocumentToVersion(
                documentId, versionNumber);
            
            if (result.isSuccess()) {
                // 更新文档信息
                Document document = documentRepository.findById(documentId);
                if (document != null) {
                    document.setLatestVersion(versionNumber);
                    document.setLastModifiedTime(new Date());
                    documentRepository.save(document);
                }
            }
            
            return result;
        } catch (Exception e) {
            log.error("恢复文档版本失败 - 文档ID: {}, 版本号: {}", documentId, versionNumber, e);
            return new DocumentOperationResult(false, "恢复文档版本失败: " + e.getMessage());
        }
    }
    
    /**
     * 比较两个版本的差异
     * @param documentId 文档ID
     * @param version1 版本1
     * @param version2 版本2
     * @return 差异信息
     */
    public VersionComparisonResult compareVersions(String documentId, int version1, int version2) {
        try {
            return documentClient.compareDocumentVersions(documentId, version1, version2);
        } catch (Exception e) {
            log.error("比较文档版本差异失败 - 文档ID: {}, 版本1: {}, 版本2: {}", 
                documentId, version1, version2, e);
            throw new DocumentIntegrationException("比较文档版本差异失败", e);
        }
    }
    
    /**
     * 锁定文档以防止修改
     * @param documentId 文档ID
     * @param lockedBy 锁定人
     * @param lockReason 锁定原因
     * @return 锁定结果
     */
    public DocumentOperationResult lockDocument(String documentId, String lockedBy, 
        String lockReason) {
        
        try {
            // 锁定文档管理系统中的文档
            DocumentOperationResult result = documentClient.lockDocument(
                documentId, lockedBy, lockReason);
            
            if (result.isSuccess()) {
                // 更新本地文档状态
                Document document = documentRepository.findById(documentId);
                if (document != null) {
                    document.setLocked(true);
                    document.setLockedBy(lockedBy);
                    document.setLockTime(new Date());
                    document.setLockReason(lockReason);
                    documentRepository.save(document);
                }
            }
            
            return result;
        } catch (Exception e) {
            log.error("锁定文档失败 - 文档ID: {}", documentId, e);
            return new DocumentOperationResult(false, "锁定文档失败: " + e.getMessage());
        }
    }
    
    /**
     * 解锁文档
     * @param documentId 文档ID
     * @param unlockedBy 解锁人
     * @return 解锁结果
     */
    public DocumentOperationResult unlockDocument(String documentId, String unlockedBy) {
        try {
            // 解锁文档管理系统中的文档
            DocumentOperationResult result = documentClient.unlockDocument(documentId, unlockedBy);
            
            if (result.isSuccess()) {
                // 更新本地文档状态
                Document document = documentRepository.findById(documentId);
                if (document != null) {
                    document.setLocked(false);
                    document.setLockedBy(null);
                    document.setLockTime(null);
                    document.setLockReason(null);
                    documentRepository.save(document);
                }
            }
            
            return result;
        } catch (Exception e) {
            log.error("解锁文档失败 - 文档ID: {}", documentId, e);
            return new DocumentOperationResult(false, "解锁文档失败: " + e.getMessage());
        }
    }
}
```

## 文档权限管理实现

文档权限管理确保只有授权用户才能访问相应的文档。

```java
// 文档权限管理服务
@Service
public class DocumentPermissionManagementService {
    
    @Autowired
    private DocumentManagementClient documentClient;
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    /**
     * 设置文档访问权限
     * @param documentId 文档ID
     * @param permissions 权限列表
     * @return 设置结果
     */
    public DocumentOperationResult setDocumentPermissions(String documentId, 
        List<DocumentPermission> permissions) {
        
        try {
            // 在文档管理系统中设置权限
            DocumentOperationResult result = documentClient.setDocumentPermissions(
                documentId, permissions);
            
            if (result.isSuccess()) {
                // 保存权限信息到本地数据库
                for (DocumentPermission permission : permissions) {
                    DocumentPermission perm = new DocumentPermission();
                    perm.setId(UUID.randomUUID().toString());
                    perm.setDocumentId(documentId);
                    perm.setPrincipalType(permission.getPrincipalType());
                    perm.setPrincipalId(permission.getPrincipalId());
                    perm.setPermissionType(permission.getPermissionType());
                    perm.setGrantTime(new Date());
                    permissionRepository.save(perm);
                }
            }
            
            return result;
        } catch (Exception e) {
            log.error("设置文档权限失败 - 文档ID: {}", documentId, e);
            return new DocumentOperationResult(false, "设置文档权限失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查用户对文档的访问权限
     * @param documentId 文档ID
     * @param userId 用户ID
     * @param permissionType 权限类型
     * @return 是否有权限
     */
    public boolean checkDocumentPermission(String documentId, String userId, 
        PermissionType permissionType) {
        
        try {
            // 检查直接权限
            boolean hasDirectPermission = permissionRepository.existsByDocumentIdAndPrincipalTypeAndPrincipalIdAndPermissionType(
                documentId, PrincipalType.USER, userId, permissionType);
            
            if (hasDirectPermission) {
                return true;
            }
            
            // 检查角色权限
            List<String> userRoles = getUserRoles(userId);
            for (String roleId : userRoles) {
                boolean hasRolePermission = permissionRepository.existsByDocumentIdAndPrincipalTypeAndPrincipalIdAndPermissionType(
                    documentId, PrincipalType.ROLE, roleId, permissionType);
                
                if (hasRolePermission) {
                    return true;
                }
            }
            
            // 检查部门权限
            String userDepartment = getUserDepartment(userId);
            if (userDepartment != null) {
                boolean hasDepartmentPermission = permissionRepository.existsByDocumentIdAndPrincipalTypeAndPrincipalIdAndPermissionType(
                    documentId, PrincipalType.DEPARTMENT, userDepartment, permissionType);
                
                if (hasDepartmentPermission) {
                    return true;
                }
            }
            
            return false;
        } catch (Exception e) {
            log.error("检查文档权限失败 - 文档ID: {}, 用户ID: {}, 权限类型: {}", 
                documentId, userId, permissionType, e);
            return false;
        }
    }
    
    /**
     * 获取用户角色列表
     * @param userId 用户ID
     * @return 角色列表
     */
    private List<String> getUserRoles(String userId) {
        // 这里应该调用用户服务获取用户角色信息
        // 简化实现，返回空列表
        return new ArrayList<>();
    }
    
    /**
     * 获取用户部门
     * @param userId 用户ID
     * @return 部门ID
     */
    private String getUserDepartment(String userId) {
        // 这里应该调用用户服务获取用户部门信息
        // 简化实现，返回null
        return null;
    }
    
    /**
     * 获取文档的所有权限
     * @param documentId 文档ID
     * @return 权限列表
     */
    public List<DocumentPermission> getDocumentPermissions(String documentId) {
        try {
            return permissionRepository.findByDocumentId(documentId);
        } catch (Exception e) {
            log.error("获取文档权限失败 - 文档ID: {}", documentId, e);
            throw new DocumentIntegrationException("获取文档权限失败", e);
        }
    }
    
    /**
     * 移除文档权限
     * @param permissionId 权限ID
     * @return 移除结果
     */
    public DocumentOperationResult removeDocumentPermission(String permissionId) {
        try {
            // 从文档管理系统中移除权限
            DocumentOperationResult result = documentClient.removeDocumentPermission(permissionId);
            
            if (result.isSuccess()) {
                // 从本地数据库删除权限记录
                permissionRepository.deleteById(permissionId);
            }
            
            return result;
        } catch (Exception e) {
            log.error("移除文档权限失败 - 权限ID: {}", permissionId, e);
            return new DocumentOperationResult(false, "移除文档权限失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据用户获取可访问的文档列表
     * @param userId 用户ID
     * @return 文档列表
     */
    public List<DocumentInfo> getDocumentsAccessibleByUser(String userId) {
        try {
            // 获取用户角色和部门
            List<String> userRoles = getUserRoles(userId);
            String userDepartment = getUserDepartment(userId);
            
            // 查询用户可访问的文档
            List<String> documentIds = permissionRepository.findDocumentIdsAccessibleByUser(
                userId, userRoles, userDepartment);
            
            // 获取文档详细信息
            List<DocumentInfo> documents = new ArrayList<>();
            for (String documentId : documentIds) {
                try {
                    DocumentInfo docInfo = documentClient.getDocumentInfo(documentId);
                    documents.add(docInfo);
                } catch (Exception e) {
                    log.warn("获取文档信息失败 - 文档ID: {}", documentId, e);
                }
            }
            
            return documents;
        } catch (Exception e) {
            log.error("获取用户可访问文档列表失败 - 用户ID: {}", userId, e);
            throw new DocumentIntegrationException("获取用户可访问文档列表失败", e);
        }
    }
}
```

## 最佳实践与注意事项

在实现文档管理系统集成时，需要注意以下最佳实践：

### 1. 安全性保障
- 使用HTTPS加密传输敏感文档数据
- 实施严格的认证和授权机制
- 对敏感文档进行加密存储

### 2. 性能优化
- 合理设置文档上传和下载的大小限制
- 对大文档实施分块上传机制
- 使用CDN加速文档访问

### 3. 容错处理
- 建立完善的错误处理和重试机制
- 实施文档上传的断点续传功能
- 提供文档操作的异步处理机制

### 4. 合规性保障
- 建立完善的文档审计跟踪机制
- 实施文档版本控制和变更管理
- 确保满足相关法规要求（如GDPR、SOX等）

### 5. 用户体验
- 提供直观易用的文档管理界面
- 支持文档的在线预览和编辑
- 实现文档的全文搜索功能

通过合理设计和实现文档管理系统集成，可以为BPM平台提供强大的文档管理能力，确保业务流程中产生的各类文档得到有效管理和合规保存。