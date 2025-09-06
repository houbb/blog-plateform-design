---
title: 多环境支持：开发、测试、预发、生产环境的规则隔离策略
date: 2025-08-30
categories: [DistributedFlowControl]
tags: [flow-control, distributed, multi-environment]
published: true
---

在企业级分布式限流平台的实施过程中，支持多环境部署是一个至关重要的需求。不同的环境（开发、测试、预发、生产）具有不同的业务需求、流量特征和风险容忍度。通过合理的多环境支持和规则隔离策略，我们可以在确保各环境独立性的同时，提高开发效率，降低配置错误的风险，并为生产环境的稳定运行提供保障。

## 多环境支持的核心价值

### 1. 环境隔离与独立性

多环境支持能够确保各个环境之间的配置和规则相互独立，避免相互干扰。

```java
// 多环境配置管理器
@Component
public class MultiEnvironmentConfigManager {
    
    private final EnvironmentRepository environmentRepository;
    private final RuleRepository ruleRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    // 环境配置缓存
    private final Map<String, EnvironmentConfig> configCache = new ConcurrentHashMap<>();
    
    public MultiEnvironmentConfigManager(EnvironmentRepository environmentRepository,
                                       RuleRepository ruleRepository,
                                       RedisTemplate<String, String> redisTemplate) {
        this.environmentRepository = environmentRepository;
        this.ruleRepository = ruleRepository;
        this.redisTemplate = redisTemplate;
        
        // 初始化环境配置缓存
        initializeConfigCache();
    }
    
    /**
     * 初始化环境配置缓存
     */
    private void initializeConfigCache() {
        try {
            List<EnvironmentConfig> configs = environmentRepository.findAll();
            for (EnvironmentConfig config : configs) {
                configCache.put(config.getEnvironmentName(), config);
            }
        } catch (Exception e) {
            log.warn("Failed to initialize environment config cache", e);
        }
    }
    
    /**
     * 获取环境配置
     */
    public EnvironmentConfig getEnvironmentConfig(String environmentName) {
        // 先从缓存获取
        EnvironmentConfig config = configCache.get(environmentName);
        if (config != null) {
            return config;
        }
        
        // 缓存未命中，从数据库获取
        try {
            config = environmentRepository.findByEnvironmentName(environmentName);
            if (config != null) {
                configCache.put(environmentName, config);
            }
            return config;
        } catch (Exception e) {
            log.error("Failed to get environment config for: {}", environmentName, e);
            return null;
        }
    }
    
    /**
     * 创建环境配置
     */
    public EnvironmentConfig createEnvironmentConfig(EnvironmentConfig config) {
        try {
            // 验证配置
            validateEnvironmentConfig(config);
            
            // 保存到数据库
            EnvironmentConfig savedConfig = environmentRepository.save(config);
            
            // 更新缓存
            configCache.put(config.getEnvironmentName(), savedConfig);
            
            // 初始化环境规则
            initializeEnvironmentRules(config);
            
            log.info("Environment config created: {}", config.getEnvironmentName());
            return savedConfig;
        } catch (Exception e) {
            log.error("Failed to create environment config: {}", config.getEnvironmentName(), e);
            throw new EnvironmentConfigException("环境配置创建失败", e);
        }
    }
    
    /**
     * 验证环境配置
     */
    private void validateEnvironmentConfig(EnvironmentConfig config) {
        if (config.getEnvironmentName() == null || config.getEnvironmentName().isEmpty()) {
            throw new IllegalArgumentException("环境名称不能为空");
        }
        
        if (config.getEnvironmentType() == null) {
            throw new IllegalArgumentException("环境类型不能为空");
        }
        
        // 检查环境名称是否已存在
        if (environmentRepository.existsByEnvironmentName(config.getEnvironmentName())) {
            throw new IllegalArgumentException("环境名称已存在: " + config.getEnvironmentName());
        }
    }
    
    /**
     * 初始化环境规则
     */
    private void initializeEnvironmentRules(EnvironmentConfig config) {
        try {
            String environmentName = config.getEnvironmentName();
            
            // 根据环境类型初始化默认规则
            List<RateLimitRule> defaultRules = createDefaultRulesForEnvironment(config);
            
            // 保存默认规则
            for (RateLimitRule rule : defaultRules) {
                rule.setEnvironment(environmentName);
                ruleRepository.save(rule);
            }
            
            log.info("Initialized default rules for environment: {}", environmentName);
        } catch (Exception e) {
            log.warn("Failed to initialize environment rules for: {}", config.getEnvironmentName(), e);
        }
    }
    
    /**
     * 为环境创建默认规则
     */
    private List<RateLimitRule> createDefaultRulesForEnvironment(EnvironmentConfig config) {
        List<RateLimitRule> rules = new ArrayList<>();
        
        switch (config.getEnvironmentType()) {
            case DEVELOPMENT:
                // 开发环境：宽松的限流规则
                rules.add(createDefaultRule("dev_api_default", "API默认限流", 1000, 60));
                break;
            case TESTING:
                // 测试环境：适中的限流规则
                rules.add(createDefaultRule("test_api_default", "API默认限流", 500, 60));
                break;
            case STAGING:
                // 预发环境：接近生产的限流规则
                rules.add(createDefaultRule("staging_api_default", "API默认限流", 200, 60));
                break;
            case PRODUCTION:
                // 生产环境：严格的限流规则
                rules.add(createDefaultRule("prod_api_default", "API默认限流", 100, 60));
                rules.add(createDefaultRule("prod_critical_api", "核心API限流", 50, 60));
                break;
        }
        
        return rules;
    }
    
    /**
     * 创建默认规则
     */
    private RateLimitRule createDefaultRule(String ruleId, String ruleName, 
                                          long limit, long windowSize) {
        RateLimitRule rule = new RateLimitRule();
        rule.setRuleId(ruleId);
        rule.setRuleName(ruleName);
        rule.setResource("api:*"); // 匹配所有API
        rule.setLimit(limit);
        rule.setWindowSize(windowSize);
        rule.setAlgorithm("TOKEN_BUCKET"); // 令牌桶算法
        rule.setEnabled(true);
        rule.setCreateTime(System.currentTimeMillis());
        rule.setLastUpdateTime(System.currentTimeMillis());
        return rule;
    }
    
    /**
     * 更新环境配置
     */
    public EnvironmentConfig updateEnvironmentConfig(String environmentName, 
                                                   EnvironmentConfigUpdateRequest request) {
        try {
            EnvironmentConfig existingConfig = environmentRepository.findByEnvironmentName(environmentName);
            if (existingConfig == null) {
                throw new EnvironmentNotFoundException("环境不存在: " + environmentName);
            }
            
            // 更新配置属性
            if (request.getDescription() != null) {
                existingConfig.setDescription(request.getDescription());
            }
            
            if (request.getEnabled() != null) {
                existingConfig.setEnabled(request.getEnabled());
            }
            
            if (request.getCustomProperties() != null) {
                existingConfig.setCustomProperties(request.getCustomProperties());
            }
            
            existingConfig.setLastUpdateTime(System.currentTimeMillis());
            
            // 保存更新
            EnvironmentConfig updatedConfig = environmentRepository.save(existingConfig);
            
            // 更新缓存
            configCache.put(environmentName, updatedConfig);
            
            log.info("Environment config updated: {}", environmentName);
            return updatedConfig;
        } catch (Exception e) {
            log.error("Failed to update environment config: {}", environmentName, e);
            throw new EnvironmentConfigException("环境配置更新失败", e);
        }
    }
    
    /**
     * 删除环境配置
     */
    public void deleteEnvironmentConfig(String environmentName) {
        try {
            // 检查环境是否可以删除
            if (EnvironmentType.PRODUCTION.name().equals(environmentName)) {
                throw new IllegalArgumentException("不允许删除生产环境配置");
            }
            
            // 删除环境配置
            environmentRepository.deleteByEnvironmentName(environmentName);
            
            // 删除环境相关的规则
            ruleRepository.deleteByEnvironment(environmentName);
            
            // 清除缓存
            configCache.remove(environmentName);
            
            log.info("Environment config deleted: {}", environmentName);
        } catch (Exception e) {
            log.error("Failed to delete environment config: {}", environmentName, e);
            throw new EnvironmentConfigException("环境配置删除失败", e);
        }
    }
    
    /**
     * 获取所有环境配置
     */
    public List<EnvironmentConfig> getAllEnvironmentConfigs() {
        try {
            return environmentRepository.findAll();
        } catch (Exception e) {
            log.error("Failed to get all environment configs", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 检查环境是否启用
     */
    public boolean isEnvironmentEnabled(String environmentName) {
        EnvironmentConfig config = getEnvironmentConfig(environmentName);
        return config != null && config.isEnabled();
    }
    
    /**
     * 获取环境特定的配置属性
     */
    public <T> T getEnvironmentProperty(String environmentName, String propertyKey, 
                                      Class<T> propertyType, T defaultValue) {
        try {
            EnvironmentConfig config = getEnvironmentConfig(environmentName);
            if (config != null && config.getCustomProperties() != null) {
                Object value = config.getCustomProperties().get(propertyKey);
                if (value != null) {
                    if (propertyType.isInstance(value)) {
                        return propertyType.cast(value);
                    } else {
                        // 尝试类型转换
                        return objectMapper.convertValue(value, propertyType);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get environment property: {} for environment: {}", 
                    propertyKey, environmentName, e);
        }
        return defaultValue;
    }
}

// 环境配置
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentConfig {
    private String environmentName;        // 环境名称
    private EnvironmentType environmentType; // 环境类型
    private String description;            // 描述
    private boolean enabled = true;        // 是否启用
    private Map<String, Object> customProperties; // 自定义属性
    private long createTime;               // 创建时间
    private long lastUpdateTime;           // 最后更新时间
}

// 环境类型枚举
public enum EnvironmentType {
    DEVELOPMENT("开发环境"),
    TESTING("测试环境"),
    STAGING("预发环境"),
    PRODUCTION("生产环境");
    
    private final String description;
    
    EnvironmentType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// 环境配置更新请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentConfigUpdateRequest {
    private String description;
    private Boolean enabled;
    private Map<String, Object> customProperties;
}

// 环境配置异常
public class EnvironmentConfigException extends RuntimeException {
    public EnvironmentConfigException(String message) {
        super(message);
    }
    
    public EnvironmentConfigException(String message, Throwable cause) {
        super(message, cause);
    }
}

// 环境未找到异常
public class EnvironmentNotFoundException extends RuntimeException {
    public EnvironmentNotFoundException(String message) {
        super(message);
    }
}
```

### 2. 规则继承与覆盖

通过规则继承机制，可以在保证环境独立性的同时，减少重复配置。

### 3. 配置同步与一致性

多环境支持需要确保配置在不同环境间的一致性和同步机制。

## 环境隔离策略

### 1. 基于命名空间的隔离

通过命名空间机制实现环境间的物理隔离。

```java
// 环境命名空间管理器
@Component
public class EnvironmentNamespaceManager {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    // 命名空间前缀配置
    private final Map<EnvironmentType, String> namespacePrefixes;
    
    public EnvironmentNamespaceManager(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.namespacePrefixes = initializeNamespacePrefixes();
    }
    
    /**
     * 初始化命名空间前缀
     */
    private Map<EnvironmentType, String> initializeNamespacePrefixes() {
        Map<EnvironmentType, String> prefixes = new HashMap<>();
        prefixes.put(EnvironmentType.DEVELOPMENT, "dev:");
        prefixes.put(EnvironmentType.TESTING, "test:");
        prefixes.put(EnvironmentType.STAGING, "staging:");
        prefixes.put(EnvironmentType.PRODUCTION, "prod:");
        return prefixes;
    }
    
    /**
     * 获取环境命名空间前缀
     */
    public String getNamespacePrefix(String environmentName) {
        try {
            // 从环境名称推断环境类型
            EnvironmentType environmentType = inferEnvironmentType(environmentName);
            return namespacePrefixes.getOrDefault(environmentType, environmentName + ":");
        } catch (Exception e) {
            log.warn("Failed to get namespace prefix for environment: {}", environmentName, e);
            return environmentName + ":";
        }
    }
    
    /**
     * 推断环境类型
     */
    private EnvironmentType inferEnvironmentType(String environmentName) {
        String lowerName = environmentName.toLowerCase();
        if (lowerName.contains("dev") || lowerName.contains("development")) {
            return EnvironmentType.DEVELOPMENT;
        } else if (lowerName.contains("test")) {
            return EnvironmentType.TESTING;
        } else if (lowerName.contains("staging") || lowerName.contains("pre")) {
            return EnvironmentType.STAGING;
        } else if (lowerName.contains("prod") || lowerName.contains("production")) {
            return EnvironmentType.PRODUCTION;
        } else {
            return EnvironmentType.DEVELOPMENT; // 默认为开发环境
        }
    }
    
    /**
     * 构造带命名空间的键名
     */
    public String buildNamespacedKey(String environmentName, String key) {
        String prefix = getNamespacePrefix(environmentName);
        return prefix + key;
    }
    
    /**
     * 在指定环境中设置值
     */
    public void setInEnvironment(String environmentName, String key, String value, long timeoutSeconds) {
        try {
            String namespacedKey = buildNamespacedKey(environmentName, key);
            redisTemplate.opsForValue().set(namespacedKey, value, timeoutSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Failed to set value in environment: {} for key: {}", environmentName, key, e);
            throw new EnvironmentOperationException("环境数据设置失败", e);
        }
    }
    
    /**
     * 从指定环境中获取值
     */
    public String getFromEnvironment(String environmentName, String key) {
        try {
            String namespacedKey = buildNamespacedKey(environmentName, key);
            return redisTemplate.opsForValue().get(namespacedKey);
        } catch (Exception e) {
            log.error("Failed to get value from environment: {} for key: {}", environmentName, key, e);
            return null;
        }
    }
    
    /**
     * 在指定环境中删除键
     */
    public void deleteFromEnvironment(String environmentName, String key) {
        try {
            String namespacedKey = buildNamespacedKey(environmentName, key);
            redisTemplate.delete(namespacedKey);
        } catch (Exception e) {
            log.error("Failed to delete key from environment: {} for key: {}", environmentName, key, e);
        }
    }
    
    /**
     * 获取环境中的所有键
     */
    public Set<String> getKeysInEnvironment(String environmentName, String pattern) {
        try {
            String namespacePrefix = getNamespacePrefix(environmentName);
            String fullPattern = namespacePrefix + pattern;
            return redisTemplate.keys(fullPattern);
        } catch (Exception e) {
            log.error("Failed to get keys in environment: {} for pattern: {}", environmentName, pattern, e);
            return new HashSet<>();
        }
    }
    
    /**
     * 环境间数据复制
     */
    public void copyDataBetweenEnvironments(String sourceEnvironment, String targetEnvironment, 
                                          String keyPattern) {
        try {
            // 获取源环境中的所有匹配键
            Set<String> sourceKeys = getKeysInEnvironment(sourceEnvironment, keyPattern);
            
            for (String sourceKey : sourceKeys) {
                // 获取源环境中的值
                String value = getFromEnvironment(sourceEnvironment, 
                    sourceKey.substring(getNamespacePrefix(sourceEnvironment).length()));
                
                if (value != null) {
                    // 构造目标键名
                    String targetKey = buildNamespacedKey(targetEnvironment, 
                        sourceKey.substring(getNamespacePrefix(sourceEnvironment).length()));
                    
                    // 设置到目标环境
                    redisTemplate.opsForValue().set(targetKey, value);
                }
            }
            
            log.info("Data copied from environment {} to {} for pattern {}", 
                    sourceEnvironment, targetEnvironment, keyPattern);
        } catch (Exception e) {
            log.error("Failed to copy data between environments: {} -> {}", 
                    sourceEnvironment, targetEnvironment, e);
            throw new EnvironmentOperationException("环境间数据复制失败", e);
        }
    }
    
    /**
     * 环境数据清理
     */
    public void cleanEnvironmentData(String environmentName) {
        try {
            String namespacePrefix = getNamespacePrefix(environmentName);
            String pattern = namespacePrefix + "*";
            Set<String> keys = redisTemplate.keys(pattern);
            
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Cleaned {} keys from environment: {}", keys.size(), environmentName);
            }
        } catch (Exception e) {
            log.error("Failed to clean environment data: {}", environmentName, e);
            throw new EnvironmentOperationException("环境数据清理失败", e);
        }
    }
    
    /**
     * 获取环境使用统计
     */
    public EnvironmentUsageStats getEnvironmentUsageStats(String environmentName) {
        try {
            EnvironmentUsageStats stats = new EnvironmentUsageStats();
            stats.setEnvironmentName(environmentName);
            
            String namespacePrefix = getNamespacePrefix(environmentName);
            String pattern = namespacePrefix + "*";
            Set<String> keys = redisTemplate.keys(pattern);
            
            stats.setTotalKeys(keys != null ? keys.size() : 0);
            
            // 统计不同类型的数据
            int ruleKeys = 0;
            int configKeys = 0;
            int metricsKeys = 0;
            
            if (keys != null) {
                for (String key : keys) {
                    String suffix = key.substring(namespacePrefix.length());
                    if (suffix.startsWith("rule:")) {
                        ruleKeys++;
                    } else if (suffix.startsWith("config:")) {
                        configKeys++;
                    } else if (suffix.startsWith("metrics:")) {
                        metricsKeys++;
                    }
                }
            }
            
            stats.setRuleKeys(ruleKeys);
            stats.setConfigKeys(configKeys);
            stats.setMetricsKeys(metricsKeys);
            stats.setTimestamp(System.currentTimeMillis());
            
            return stats;
        } catch (Exception e) {
            log.error("Failed to get environment usage stats: {}", environmentName, e);
            return new EnvironmentUsageStats();
        }
    }
}

// 环境使用统计
@Data
public class EnvironmentUsageStats {
    private String environmentName;
    private int totalKeys;
    private int ruleKeys;
    private int configKeys;
    private int metricsKeys;
    private long timestamp;
}

// 环境操作异常
public class EnvironmentOperationException extends RuntimeException {
    public EnvironmentOperationException(String message) {
        super(message);
    }
    
    public EnvironmentOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### 2. 基于标签的隔离

通过标签机制实现更细粒度的环境隔离。

```java
// 环境标签管理器
@Component
public class EnvironmentTagManager {
    
    private final EnvironmentRepository environmentRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    // 标签缓存
    private final Map<String, Set<String>> tagCache = new ConcurrentHashMap<>();
    
    public EnvironmentTagManager(EnvironmentRepository environmentRepository,
                               RedisTemplate<String, String> redisTemplate) {
        this.environmentRepository = environmentRepository;
        this.redisTemplate = redisTemplate;
    }
    
    /**
     * 为环境添加标签
     */
    public void addTagsToEnvironment(String environmentName, Set<String> tags) {
        try {
            // 更新数据库中的标签信息
            EnvironmentConfig config = environmentRepository.findByEnvironmentName(environmentName);
            if (config != null) {
                Set<String> existingTags = config.getTags() != null ? config.getTags() : new HashSet<>();
                existingTags.addAll(tags);
                config.setTags(existingTags);
                config.setLastUpdateTime(System.currentTimeMillis());
                environmentRepository.save(config);
                
                // 更新缓存
                tagCache.put(environmentName, new HashSet<>(existingTags));
                
                // 更新标签索引
                updateTagIndex(environmentName, tags, true);
                
                log.info("Added tags {} to environment: {}", tags, environmentName);
            }
        } catch (Exception e) {
            log.error("Failed to add tags to environment: {}", environmentName, e);
            throw new EnvironmentTagException("环境标签添加失败", e);
        }
    }
    
    /**
     * 从环境中移除标签
     */
    public void removeTagsFromEnvironment(String environmentName, Set<String> tags) {
        try {
            // 更新数据库中的标签信息
            EnvironmentConfig config = environmentRepository.findByEnvironmentName(environmentName);
            if (config != null && config.getTags() != null) {
                config.getTags().removeAll(tags);
                config.setLastUpdateTime(System.currentTimeMillis());
                environmentRepository.save(config);
                
                // 更新缓存
                if (tagCache.containsKey(environmentName)) {
                    tagCache.get(environmentName).removeAll(tags);
                }
                
                // 更新标签索引
                updateTagIndex(environmentName, tags, false);
                
                log.info("Removed tags {} from environment: {}", tags, environmentName);
            }
        } catch (Exception e) {
            log.error("Failed to remove tags from environment: {}", environmentName, e);
            throw new EnvironmentTagException("环境标签移除失败", e);
        }
    }
    
    /**
     * 更新标签索引
     */
    private void updateTagIndex(String environmentName, Set<String> tags, boolean add) {
        try {
            for (String tag : tags) {
                String indexKey = "tag_index:" + tag;
                if (add) {
                    redisTemplate.opsForSet().add(indexKey, environmentName);
                } else {
                    redisTemplate.opsForSet().remove(indexKey, environmentName);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to update tag index for environment: {}", environmentName, e);
        }
    }
    
    /**
     * 根据标签获取环境列表
     */
    public Set<String> getEnvironmentsByTag(String tag) {
        try {
            String indexKey = "tag_index:" + tag;
            Set<String> members = redisTemplate.opsForSet().members(indexKey);
            return members != null ? members : new HashSet<>();
        } catch (Exception e) {
            log.error("Failed to get environments by tag: {}", tag, e);
            return new HashSet<>();
        }
    }
    
    /**
     * 根据多个标签获取环境列表（交集）
     */
    public Set<String> getEnvironmentsByTags(Set<String> tags) {
        try {
            if (tags == null || tags.isEmpty()) {
                return new HashSet<>();
            }
            
            List<String> indexKeys = tags.stream()
                .map(tag -> "tag_index:" + tag)
                .collect(Collectors.toList());
            
            // 使用Redis的SINTER命令获取交集
            Set<String> result = redisTemplate.opsForSet().intersect(indexKeys);
            return result != null ? result : new HashSet<>();
        } catch (Exception e) {
            log.error("Failed to get environments by tags: {}", tags, e);
            return new HashSet<>();
        }
    }
    
    /**
     * 根据标签获取环境列表（并集）
     */
    public Set<String> getEnvironmentsByTagsUnion(Set<String> tags) {
        try {
            if (tags == null || tags.isEmpty()) {
                return new HashSet<>();
            }
            
            List<String> indexKeys = tags.stream()
                .map(tag -> "tag_index:" + tag)
                .collect(Collectors.toList());
            
            // 使用Redis的SUNION命令获取并集
            Set<String> result = redisTemplate.opsForSet().union(indexKeys);
            return result != null ? result : new HashSet<>();
        } catch (Exception e) {
            log.error("Failed to get environments by tags union: {}", tags, e);
            return new HashSet<>();
        }
    }
    
    /**
     * 获取环境的所有标签
     */
    public Set<String> getTagsForEnvironment(String environmentName) {
        // 先从缓存获取
        Set<String> cachedTags = tagCache.get(environmentName);
        if (cachedTags != null) {
            return new HashSet<>(cachedTags);
        }
        
        // 缓存未命中，从数据库获取
        try {
            EnvironmentConfig config = environmentRepository.findByEnvironmentName(environmentName);
            if (config != null && config.getTags() != null) {
                Set<String> tags = new HashSet<>(config.getTags());
                tagCache.put(environmentName, tags);
                return tags;
            }
        } catch (Exception e) {
            log.warn("Failed to get tags for environment: {}", environmentName, e);
        }
        
        return new HashSet<>();
    }
    
    /**
     * 检查环境是否具有指定标签
     */
    public boolean hasTag(String environmentName, String tag) {
        Set<String> tags = getTagsForEnvironment(environmentName);
        return tags.contains(tag);
    }
    
    /**
     * 获取所有标签
     */
    public Set<String> getAllTags() {
        try {
            Set<String> allTags = new HashSet<>();
            Iterable<EnvironmentConfig> configs = environmentRepository.findAll();
            for (EnvironmentConfig config : configs) {
                if (config.getTags() != null) {
                    allTags.addAll(config.getTags());
                }
            }
            return allTags;
        } catch (Exception e) {
            log.error("Failed to get all tags", e);
            return new HashSet<>();
        }
    }
    
    /**
     * 根据标签过滤规则
     */
    public List<RateLimitRule> filterRulesByEnvironmentTags(List<RateLimitRule> rules, 
                                                          Set<String> requiredTags) {
        if (requiredTags == null || requiredTags.isEmpty()) {
            return rules;
        }
        
        return rules.stream()
            .filter(rule -> {
                String environment = rule.getEnvironment();
                if (environment == null) {
                    return false;
                }
                
                Set<String> environmentTags = getTagsForEnvironment(environment);
                return environmentTags.containsAll(requiredTags);
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 环境标签继承
     */
    public void inheritTags(String sourceEnvironment, String targetEnvironment) {
        try {
            Set<String> sourceTags = getTagsForEnvironment(sourceEnvironment);
            if (!sourceTags.isEmpty()) {
                addTagsToEnvironment(targetEnvironment, sourceTags);
                log.info("Inherited tags from {} to {}: {}", sourceEnvironment, targetEnvironment, sourceTags);
            }
        } catch (Exception e) {
            log.error("Failed to inherit tags from {} to {}", sourceEnvironment, targetEnvironment, e);
            throw new EnvironmentTagException("环境标签继承失败", e);
        }
    }
}

// 环境标签异常
public class EnvironmentTagException extends RuntimeException {
    public EnvironmentTagException(String message) {
        super(message);
    }
    
    public EnvironmentTagException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

## 规则隔离与继承

### 1. 规则继承机制

通过规则继承机制，可以减少重复配置，提高配置效率。

```java
// 规则继承管理器
@Component
public class RuleInheritanceManager {
    
    private final RuleRepository ruleRepository;
    private final EnvironmentRepository environmentRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    public RuleInheritanceManager(RuleRepository ruleRepository,
                                EnvironmentRepository environmentRepository,
                                RedisTemplate<String, String> redisTemplate) {
        this.ruleRepository = ruleRepository;
        this.environmentRepository = environmentRepository;
        this.redisTemplate = redisTemplate;
    }
    
    /**
     * 创建继承规则
     */
    public RateLimitRule createInheritedRule(String parentRuleId, String targetEnvironment,
                                           RuleInheritanceConfig inheritanceConfig) {
        try {
            // 获取父规则
            RateLimitRule parentRule = ruleRepository.findByRuleId(parentRuleId);
            if (parentRule == null) {
                throw new RuleNotFoundException("父规则不存在: " + parentRuleId);
            }
            
            // 验证目标环境
            EnvironmentConfig targetEnv = environmentRepository.findByEnvironmentName(targetEnvironment);
            if (targetEnv == null) {
                throw new EnvironmentNotFoundException("目标环境不存在: " + targetEnvironment);
            }
            
            // 创建继承规则
            RateLimitRule inheritedRule = createInheritedRuleFromParent(parentRule, targetEnvironment, 
                                                                      inheritanceConfig);
            
            // 保存继承规则
            RateLimitRule savedRule = ruleRepository.save(inheritedRule);
            
            // 记录继承关系
            recordInheritanceRelationship(parentRuleId, savedRule.getRuleId(), targetEnvironment);
            
            log.info("Created inherited rule: {} from parent: {} in environment: {}", 
                    savedRule.getRuleId(), parentRuleId, targetEnvironment);
            
            return savedRule;
        } catch (Exception e) {
            log.error("Failed to create inherited rule from parent: {} to environment: {}", 
                    parentRuleId, targetEnvironment, e);
            throw new RuleInheritanceException("规则继承创建失败", e);
        }
    }
    
    /**
     * 从父规则创建继承规则
     */
    private RateLimitRule createInheritedRuleFromParent(RateLimitRule parentRule, 
                                                      String targetEnvironment,
                                                      RuleInheritanceConfig inheritanceConfig) {
        RateLimitRule inheritedRule = new RateLimitRule();
        
        // 复制父规则的基本属性
        BeanUtils.copyProperties(parentRule, inheritedRule);
        
        // 更新规则ID和环境
        inheritedRule.setRuleId(generateInheritedRuleId(parentRule.getRuleId(), targetEnvironment));
        inheritedRule.setEnvironment(targetEnvironment);
        inheritedRule.setParentRuleId(parentRule.getRuleId());
        
        // 应用继承配置的覆盖
        if (inheritanceConfig != null) {
            applyInheritanceOverrides(inheritedRule, inheritanceConfig);
        }
        
        // 更新时间戳
        inheritedRule.setCreateTime(System.currentTimeMillis());
        inheritedRule.setLastUpdateTime(System.currentTimeMillis());
        
        return inheritedRule;
    }
    
    /**
     * 生成继承规则ID
     */
    private String generateInheritedRuleId(String parentRuleId, String targetEnvironment) {
        return parentRuleId + "_inherited_" + targetEnvironment + "_" + System.currentTimeMillis();
    }
    
    /**
     * 应用继承覆盖配置
     */
    private void applyInheritanceOverrides(RateLimitRule rule, RuleInheritanceConfig config) {
        if (config.getLimitOverride() != null) {
            rule.setLimit(config.getLimitOverride());
        }
        
        if (config.getWindowSizeOverride() != null) {
            rule.setWindowSize(config.getWindowSizeOverride());
        }
        
        if (config.getAlgorithmOverride() != null) {
            rule.setAlgorithm(config.getAlgorithmOverride());
        }
        
        if (config.getEnabledOverride() != null) {
            rule.setEnabled(config.getEnabledOverride());
        }
        
        if (config.getResourceOverride() != null) {
            rule.setResource(config.getResourceOverride());
        }
    }
    
    /**
     * 记录继承关系
     */
    private void recordInheritanceRelationship(String parentRuleId, String childRuleId, 
                                             String targetEnvironment) {
        try {
            String key = "rule_inheritance:" + parentRuleId;
            RuleInheritanceRecord record = new RuleInheritanceRecord();
            record.setParentRuleId(parentRuleId);
            record.setChildRuleId(childRuleId);
            record.setTargetEnvironment(targetEnvironment);
            record.setCreateTime(System.currentTimeMillis());
            
            String jsonData = objectMapper.writeValueAsString(record);
            redisTemplate.opsForList().leftPush(key, jsonData);
        } catch (Exception e) {
            log.warn("Failed to record inheritance relationship: {} -> {}", parentRuleId, childRuleId, e);
        }
    }
    
    /**
     * 获取规则的所有继承子规则
     */
    public List<RateLimitRule> getChildRules(String parentRuleId) {
        try {
            return ruleRepository.findByParentRuleId(parentRuleId);
        } catch (Exception e) {
            log.error("Failed to get child rules for parent: {}", parentRuleId, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 获取环境中的继承规则
     */
    public List<RateLimitRule> getInheritedRulesInEnvironment(String environmentName) {
        try {
            return ruleRepository.findByEnvironmentAndParentRuleIdIsNotNull(environmentName);
        } catch (Exception e) {
            log.error("Failed to get inherited rules in environment: {}", environmentName, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 更新继承规则
     */
    public RateLimitRule updateInheritedRule(String ruleId, RuleUpdateRequest updateRequest) {
        try {
            RateLimitRule rule = ruleRepository.findByRuleId(ruleId);
            if (rule == null) {
                throw new RuleNotFoundException("规则不存在: " + ruleId);
            }
            
            if (rule.getParentRuleId() == null) {
                throw new IllegalArgumentException("规则不是继承规则: " + ruleId);
            }
            
            // 应用更新
            applyRuleUpdates(rule, updateRequest);
            
            // 更新时间戳
            rule.setLastUpdateTime(System.currentTimeMillis());
            
            // 保存更新
            RateLimitRule updatedRule = ruleRepository.save(rule);
            
            log.info("Updated inherited rule: {}", ruleId);
            return updatedRule;
        } catch (Exception e) {
            log.error("Failed to update inherited rule: {}", ruleId, e);
            throw new RuleInheritanceException("继承规则更新失败", e);
        }
    }
    
    /**
     * 应用规则更新
     */
    private void applyRuleUpdates(RateLimitRule rule, RuleUpdateRequest updateRequest) {
        if (updateRequest.getRuleName() != null) {
            rule.setRuleName(updateRequest.getRuleName());
        }
        
        if (updateRequest.getResource() != null) {
            rule.setResource(updateRequest.getResource());
        }
        
        if (updateRequest.getLimit() != null) {
            rule.setLimit(updateRequest.getLimit());
        }
        
        if (updateRequest.getWindowSize() != null) {
            rule.setWindowSize(updateRequest.getWindowSize());
        }
        
        if (updateRequest.getAlgorithm() != null) {
            rule.setAlgorithm(updateRequest.getAlgorithm());
        }
        
        if (updateRequest.getEnabled() != null) {
            rule.setEnabled(updateRequest.getEnabled());
        }
        
        if (updateRequest.getCustomProperties() != null) {
            rule.setCustomProperties(updateRequest.getCustomProperties());
        }
    }
    
    /**
     * 同步父规则变更到子规则
     */
    public void syncParentRuleChanges(String parentRuleId) {
        try {
            // 获取父规则
            RateLimitRule parentRule = ruleRepository.findByRuleId(parentRuleId);
            if (parentRule == null) {
                log.warn("Parent rule not found: {}", parentRuleId);
                return;
            }
            
            // 获取所有子规则
            List<RateLimitRule> childRules = getChildRules(parentRuleId);
            
            // 同步非覆盖属性的变更
            for (RateLimitRule childRule : childRules) {
                boolean updated = syncRuleFromParent(childRule, parentRule);
                if (updated) {
                    childRule.setLastUpdateTime(System.currentTimeMillis());
                    ruleRepository.save(childRule);
                    log.info("Synced rule changes from parent {} to child {}", 
                            parentRuleId, childRule.getRuleId());
                }
            }
        } catch (Exception e) {
            log.error("Failed to sync parent rule changes: {}", parentRuleId, e);
        }
    }
    
    /**
     * 从父规则同步规则
     */
    private boolean syncRuleFromParent(RateLimitRule childRule, RateLimitRule parentRule) {
        boolean updated = false;
        
        // 只同步未被覆盖的属性
        if (childRule.getRuleName() == null || 
            childRule.getRuleName().equals(parentRule.getRuleName())) {
            childRule.setRuleName(parentRule.getRuleName());
            updated = true;
        }
        
        if (childRule.getResource() == null || 
            childRule.getResource().equals(parentRule.getResource())) {
            childRule.setResource(parentRule.getResource());
            updated = true;
        }
        
        if (childRule.getAlgorithm() == null || 
            childRule.getAlgorithm().equals(parentRule.getAlgorithm())) {
            childRule.setAlgorithm(parentRule.getAlgorithm());
            updated = true;
        }
        
        // 其他属性可以根据需要添加同步逻辑
        
        return updated;
    }
    
    /**
     * 断开继承关系
     */
    public void detachInheritance(String ruleId) {
        try {
            RateLimitRule rule = ruleRepository.findByRuleId(ruleId);
            if (rule == null) {
                throw new RuleNotFoundException("规则不存在: " + ruleId);
            }
            
            if (rule.getParentRuleId() != null) {
                rule.setParentRuleId(null);
                rule.setLastUpdateTime(System.currentTimeMillis());
                ruleRepository.save(rule);
                
                log.info("Detached inheritance for rule: {}", ruleId);
            }
        } catch (Exception e) {
            log.error("Failed to detach inheritance for rule: {}", ruleId, e);
            throw new RuleInheritanceException("断开继承关系失败", e);
        }
    }
    
    /**
     * 获取继承链
     */
    public List<RuleInheritanceNode> getInheritanceChain(String ruleId) {
        List<RuleInheritanceNode> chain = new ArrayList<>();
        
        try {
            RateLimitRule currentRule = ruleRepository.findByRuleId(ruleId);
            while (currentRule != null) {
                RuleInheritanceNode node = new RuleInheritanceNode();
                node.setRuleId(currentRule.getRuleId());
                node.setRuleName(currentRule.getRuleName());
                node.setEnvironment(currentRule.getEnvironment());
                node.setParentRuleId(currentRule.getParentRuleId());
                node.setIsInherited(currentRule.getParentRuleId() != null);
                chain.add(node);
                
                // 如果是继承规则，继续向上查找
                if (currentRule.getParentRuleId() != null) {
                    currentRule = ruleRepository.findByRuleId(currentRule.getParentRuleId());
                } else {
                    break;
                }
            }
        } catch (Exception e) {
            log.error("Failed to get inheritance chain for rule: {}", ruleId, e);
        }
        
        return chain;
    }
}

// 规则继承配置
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleInheritanceConfig {
    private Long limitOverride;           // 限流阈值覆盖
    private Long windowSizeOverride;      // 时间窗口覆盖
    private String algorithmOverride;     // 算法覆盖
    private Boolean enabledOverride;      // 启用状态覆盖
    private String resourceOverride;      // 资源覆盖
    private Map<String, Object> customPropertiesOverride; // 自定义属性覆盖
}

// 规则继承记录
@Data
public class RuleInheritanceRecord {
    private String parentRuleId;
    private String childRuleId;
    private String targetEnvironment;
    private long createTime;
}

// 规则继承节点
@Data
public class RuleInheritanceNode {
    private String ruleId;
    private String ruleName;
    private String environment;
    private String parentRuleId;
    private boolean isInherited;
}

// 规则继承异常
public class RuleInheritanceException extends RuntimeException {
    public RuleInheritanceException(String message) {
        super(message);
    }
    
    public RuleInheritanceException(String message, Throwable cause) {
        super(message, cause);
    }
}

// 规则未找到异常
public class RuleNotFoundException extends RuntimeException {
    public RuleNotFoundException(String message) {
        super(message);
    }
}
```

### 2. 环境特定规则

为不同环境配置特定的规则，满足不同环境的需求。

```java
// 环境特定规则管理器
@Component
public class EnvironmentSpecificRuleManager {
    
    private final RuleRepository ruleRepository;
    private final EnvironmentRepository environmentRepository;
    private final MultiEnvironmentConfigManager environmentConfigManager;
    private final RedisTemplate<String, String> redisTemplate;
    
    public EnvironmentSpecificRuleManager(RuleRepository ruleRepository,
                                        EnvironmentRepository environmentRepository,
                                        MultiEnvironmentConfigManager environmentConfigManager,
                                        RedisTemplate<String, String> redisTemplate) {
        this.ruleRepository = ruleRepository;
        this.environmentRepository = environmentRepository;
        this.environmentConfigManager = environmentConfigManager;
        this.redisTemplate = redisTemplate;
    }
    
    /**
     * 为环境创建特定规则
     */
    public RateLimitRule createEnvironmentSpecificRule(String environmentName,
                                                     EnvironmentSpecificRuleRequest request) {
        try {
            // 验证环境
            EnvironmentConfig environment = environmentRepository.findByEnvironmentName(environmentName);
            if (environment == null) {
                throw new EnvironmentNotFoundException("环境不存在: " + environmentName);
            }
            
            // 验证规则请求
            validateRuleRequest(request);
            
            // 创建环境特定规则
            RateLimitRule rule = createRuleFromRequest(request);
            rule.setEnvironment(environmentName);
            rule.setCreateTime(System.currentTimeMillis());
            rule.setLastUpdateTime(System.currentTimeMillis());
            
            // 保存规则
            RateLimitRule savedRule = ruleRepository.save(rule);
            
            // 记录环境规则
            recordEnvironmentRule(environmentName, savedRule.getRuleId());
            
            log.info("Created environment specific rule: {} for environment: {}", 
                    savedRule.getRuleId(), environmentName);
            
            return savedRule;
        } catch (Exception e) {
            log.error("Failed to create environment specific rule for environment: {}", 
                    environmentName, e);
            throw new EnvironmentRuleException("环境特定规则创建失败", e);
        }
    }
    
    /**
     * 验证规则请求
     */
    private void validateRuleRequest(EnvironmentSpecificRuleRequest request) {
        if (request.getRuleName() == null || request.getRuleName().isEmpty()) {
            throw new IllegalArgumentException("规则名称不能为空");
        }
        
        if (request.getResource() == null || request.getResource().isEmpty()) {
            throw new IllegalArgumentException("资源不能为空");
        }
        
        if (request.getLimit() == null || request.getLimit() <= 0) {
            throw new IllegalArgumentException("限流阈值必须大于0");
        }
        
        if (request.getWindowSize() == null || request.getWindowSize() <= 0) {
            throw new IllegalArgumentException("时间窗口必须大于0");
        }
    }
    
    /**
     * 从请求创建规则
     */
    private RateLimitRule createRuleFromRequest(EnvironmentSpecificRuleRequest request) {
        RateLimitRule rule = new RateLimitRule();
        rule.setRuleId(generateRuleId(request.getRuleName()));
        rule.setRuleName(request.getRuleName());
        rule.setResource(request.getResource());
        rule.setLimit(request.getLimit());
        rule.setWindowSize(request.getWindowSize());
        rule.setAlgorithm(request.getAlgorithm() != null ? request.getAlgorithm() : "TOKEN_BUCKET");
        rule.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
        rule.setCustomProperties(request.getCustomProperties());
        return rule;
    }
    
    /**
     * 生成规则ID
     */
    private String generateRuleId(String ruleName) {
        return "rule_" + ruleName.replaceAll("\\s+", "_").toLowerCase() + "_" + System.currentTimeMillis();
    }
    
    /**
     * 记录环境规则
     */
    private void recordEnvironmentRule(String environmentName, String ruleId) {
        try {
            String key = "environment_rules:" + environmentName;
            redisTemplate.opsForSet().add(key, ruleId);
        } catch (Exception e) {
            log.warn("Failed to record environment rule: {} for environment: {}", ruleId, environmentName, e);
        }
    }
    
    /**
     * 获取环境的所有规则
     */
    public List<RateLimitRule> getRulesForEnvironment(String environmentName) {
        try {
            return ruleRepository.findByEnvironment(environmentName);
        } catch (Exception e) {
            log.error("Failed to get rules for environment: {}", environmentName, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 获取环境的启用规则
     */
    public List<RateLimitRule> getEnabledRulesForEnvironment(String environmentName) {
        try {
            return ruleRepository.findByEnvironmentAndEnabled(environmentName, true);
        } catch (Exception e) {
            log.error("Failed to get enabled rules for environment: {}", environmentName, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 根据资源获取环境规则
     */
    public List<RateLimitRule> getRulesForEnvironmentAndResource(String environmentName, 
                                                               String resource) {
        try {
            return ruleRepository.findByEnvironmentAndResource(environmentName, resource);
        } catch (Exception e) {
            log.error("Failed to get rules for environment: {} and resource: {}", 
                    environmentName, resource, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 更新环境特定规则
     */
    public RateLimitRule updateEnvironmentRule(String ruleId, RuleUpdateRequest updateRequest) {
        try {
            RateLimitRule rule = ruleRepository.findByRuleId(ruleId);
            if (rule == null) {
                throw new RuleNotFoundException("规则不存在: " + ruleId);
            }
            
            // 应用更新
            applyRuleUpdates(rule, updateRequest);
            
            // 更新时间戳
            rule.setLastUpdateTime(System.currentTimeMillis());
            
            // 保存更新
            RateLimitRule updatedRule = ruleRepository.save(rule);
            
            log.info("Updated environment specific rule: {}", ruleId);
            return updatedRule;
        } catch (Exception e) {
            log.error("Failed to update environment specific rule: {}", ruleId, e);
            throw new EnvironmentRuleException("环境特定规则更新失败", e);
        }
    }
    
    /**
     * 应用规则更新
     */
    private void applyRuleUpdates(RateLimitRule rule, RuleUpdateRequest updateRequest) {
        if (updateRequest.getRuleName() != null) {
            rule.setRuleName(updateRequest.getRuleName());
        }
        
        if (updateRequest.getResource() != null) {
            rule.setResource(updateRequest.getResource());
        }
        
        if (updateRequest.getLimit() != null) {
            rule.setLimit(updateRequest.getLimit());
        }
        
        if (updateRequest.getWindowSize() != null) {
            rule.setWindowSize(updateRequest.getWindowSize());
        }
        
        if (updateRequest.getAlgorithm() != null) {
            rule.setAlgorithm(updateRequest.getAlgorithm());
        }
        
        if (updateRequest.getEnabled() != null) {
            rule.setEnabled(updateRequest.getEnabled());
        }
        
        if (updateRequest.getCustomProperties() != null) {
            rule.setCustomProperties(updateRequest.getCustomProperties());
        }
    }
    
    /**
     * 删除环境特定规则
     */
    public void deleteEnvironmentRule(String ruleId) {
        try {
            RateLimitRule rule = ruleRepository.findByRuleId(ruleId);
            if (rule == null) {
                throw new RuleNotFoundException("规则不存在: " + ruleId);
            }
            
            // 删除规则
            ruleRepository.delete(rule);
            
            // 从环境记录中移除
            if (rule.getEnvironment() != null) {
                String key = "environment_rules:" + rule.getEnvironment();
                redisTemplate.opsForSet().remove(key, ruleId);
            }
            
            log.info("Deleted environment specific rule: {}", ruleId);
        } catch (Exception e) {
            log.error("Failed to delete environment specific rule: {}", ruleId, e);
            throw new EnvironmentRuleException("环境特定规则删除失败", e);
        }
    }
    
    /**
     * 批量导入环境规则
     */
    public List<RateLimitRule> batchImportRules(String environmentName, 
                                              List<EnvironmentSpecificRuleRequest> requests) {
        List<RateLimitRule> importedRules = new ArrayList<>();
        
        try {
            for (EnvironmentSpecificRuleRequest request : requests) {
                try {
                    RateLimitRule rule = createEnvironmentSpecificRule(environmentName, request);
                    importedRules.add(rule);
                } catch (Exception e) {
                    log.warn("Failed to import rule for environment: {}", environmentName, e);
                }
            }
            
            log.info("Batch imported {} rules for environment: {}", importedRules.size(), environmentName);
            return importedRules;
        } catch (Exception e) {
            log.error("Failed to batch import rules for environment: {}", environmentName, e);
            throw new EnvironmentRuleException("批量导入规则失败", e);
        }
    }
    
    /**
     * 导出环境规则
     */
    public List<EnvironmentSpecificRuleRequest> exportRules(String environmentName) {
        try {
            List<RateLimitRule> rules = getRulesForEnvironment(environmentName);
            List<EnvironmentSpecificRuleRequest> requests = new ArrayList<>();
            
            for (RateLimitRule rule : rules) {
                EnvironmentSpecificRuleRequest request = new EnvironmentSpecificRuleRequest();
                request.setRuleName(rule.getRuleName());
                request.setResource(rule.getResource());
                request.setLimit(rule.getLimit());
                request.setWindowSize(rule.getWindowSize());
                request.setAlgorithm(rule.getAlgorithm());
                request.setEnabled(rule.isEnabled());
                request.setCustomProperties(rule.getCustomProperties());
                requests.add(request);
            }
            
            return requests;
        } catch (Exception e) {
            log.error("Failed to export rules for environment: {}", environmentName, e);
            throw new EnvironmentRuleException("导出规则失败", e);
        }
    }
    
    /**
     * 环境规则复制
     */
    public void copyRulesBetweenEnvironments(String sourceEnvironment, 
                                           String targetEnvironment) {
        try {
            // 获取源环境规则
            List<RateLimitRule> sourceRules = getRulesForEnvironment(sourceEnvironment);
            
            // 复制规则到目标环境
            for (RateLimitRule sourceRule : sourceRules) {
                // 创建新的规则对象
                RateLimitRule targetRule = new RateLimitRule();
                BeanUtils.copyProperties(sourceRule, targetRule);
                
                // 更新环境和规则ID
                targetRule.setEnvironment(targetEnvironment);
                targetRule.setRuleId(generateRuleId(sourceRule.getRuleName()));
                targetRule.setParentRuleId(sourceRule.getRuleId()); // 记录原始规则ID
                targetRule.setCreateTime(System.currentTimeMillis());
                targetRule.setLastUpdateTime(System.currentTimeMillis());
                
                // 保存到目标环境
                ruleRepository.save(targetRule);
                
                // 记录环境规则
                recordEnvironmentRule(targetEnvironment, targetRule.getRuleId());
            }
            
            log.info("Copied {} rules from environment {} to {}", 
                    sourceRules.size(), sourceEnvironment, targetEnvironment);
        } catch (Exception e) {
            log.error("Failed to copy rules from {} to {}", sourceEnvironment, targetEnvironment, e);
            throw new EnvironmentRuleException("环境规则复制失败", e);
        }
    }
    
    /**
     * 获取环境规则统计
     */
    public EnvironmentRuleStats getEnvironmentRuleStats(String environmentName) {
        try {
            EnvironmentRuleStats stats = new EnvironmentRuleStats();
            stats.setEnvironmentName(environmentName);
            
            List<RateLimitRule> rules = getRulesForEnvironment(environmentName);
            stats.setTotalRules(rules.size());
            
            long enabledRules = rules.stream().filter(RateLimitRule::isEnabled).count();
            stats.setEnabledRules((int) enabledRules);
            
            long disabledRules = rules.size() - enabledRules;
            stats.setDisabledRules((int) disabledRules);
            
            // 统计算法分布
            Map<String, Long> algorithmStats = rules.stream()
                .collect(Collectors.groupingBy(RateLimitRule::getAlgorithm, Collectors.counting()));
            stats.setAlgorithmDistribution(algorithmStats);
            
            // 统计资源分布
            Map<String, Long> resourceStats = rules.stream()
                .collect(Collectors.groupingBy(RateLimitRule::getResource, Collectors.counting()));
            stats.setResourceDistribution(resourceStats);
            
            stats.setTimestamp(System.currentTimeMillis());
            
            return stats;
        } catch (Exception e) {
            log.error("Failed to get rule stats for environment: {}", environmentName, e);
            return new EnvironmentRuleStats();
        }
    }
}

// 环境特定规则请求
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentSpecificRuleRequest {
    private String ruleName;
    private String resource;
    private Long limit;
    private Long windowSize;
    private String algorithm;
    private Boolean enabled;
    private Map<String, Object> customProperties;
}

// 环境规则统计
@Data
public class EnvironmentRuleStats {
    private String environmentName;
    private int totalRules;
    private int enabledRules;
    private int disabledRules;
    private Map<String, Long> algorithmDistribution;
    private Map<String, Long> resourceDistribution;
    private long timestamp;
}

// 环境规则异常
public class EnvironmentRuleException extends RuntimeException {
    public EnvironmentRuleException(String message) {
        super(message);
    }
    
    public EnvironmentRuleException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

## 最佳实践与注意事项

### 1. 环境命名规范

建立统一的环境命名规范，便于管理和识别。

### 2. 权限控制

为不同环境设置不同的访问权限，确保安全性。

### 3. 配置版本管理

实施配置版本管理，支持配置的回滚和审计。

## 总结

多环境支持是企业级分布式限流平台实施的重要组成部分。通过合理的环境隔离策略、规则继承机制和环境特定配置，我们可以在确保各环境独立性的同时，提高配置效率，降低管理复杂度。这不仅有助于提升开发和测试效率，还能为生产环境的稳定运行提供有力保障。

在实际应用中，需要根据企业的具体需求和组织结构，设计合适的多环境支持方案，并建立完善的管理流程和规范，确保多环境限流平台的有效运行。