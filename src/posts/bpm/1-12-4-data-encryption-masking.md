---
title: "数据加密与脱敏: 保护流程中的敏感信息"
date: 2025-09-07
categories: [Bpm]
tags: [Bpm]
published: true
---
# 数据加密与脱敏：保护流程中的敏感信息

在企业级BPM平台中，数据加密与脱敏是保护敏感信息的关键技术手段。随着数据安全法规的日益严格和数据泄露事件的频发，企业必须采取有效措施保护业务流程中涉及的个人身份信息、财务数据、商业机密等敏感信息，防止数据泄露和滥用。

## 数据加密与脱敏的核心价值

### 数据安全保护
通过对敏感数据进行加密和脱敏处理，可以有效防止数据在存储、传输和使用过程中的泄露风险。

### 合规性保障
数据加密与脱敏是满足GDPR、SOX等数据保护法规要求的重要技术手段。

### 隐私权保护
保护个人隐私信息，维护数据主体的合法权益。

## 敏感数据识别与分类

在实施数据加密与脱敏之前，首先需要识别和分类系统中的敏感数据。

```java
// 敏感数据识别服务
@Service
public class SensitiveDataIdentificationService {
    
    @Autowired
    private DataDictionaryService dataDictionaryService;
    
    @Autowired
    private DataClassificationService dataClassificationService;
    
    @Autowired
    private SensitiveDataPatternRepository patternRepository;
    
    /**
     * 识别敏感数据
     * @param dataSource 数据源
     * @return 敏感数据列表
     */
    public List<SensitiveDataInfo> identifySensitiveData(DataSource dataSource) {
        List<SensitiveDataInfo> sensitiveDataList = new ArrayList<>();
        
        try {
            // 获取数据源中的所有表
            List<String> tableNames = getTableNames(dataSource);
            
            for (String tableName : tableNames) {
                // 获取表结构信息
                List<ColumnInfo> columns = getTableColumns(dataSource, tableName);
                
                for (ColumnInfo column : columns) {
                    // 识别敏感数据
                    SensitiveDataInfo sensitiveData = identifySensitiveColumn(dataSource, tableName, column);
                    if (sensitiveData != null) {
                        sensitiveDataList.add(sensitiveData);
                    }
                }
            }
        } catch (Exception e) {
            log.error("识别敏感数据失败 - 数据源: {}", dataSource.getName(), e);
        }
        
        return sensitiveDataList;
    }
    
    /**
     * 识别敏感列
     */
    private SensitiveDataInfo identifySensitiveColumn(DataSource dataSource, String tableName, 
        ColumnInfo column) {
        
        try {
            // 1. 基于列名识别
            SensitiveDataType dataType = identifyByColumnName(column.getName());
            if (dataType != null) {
                return createSensitiveDataInfo(dataSource, tableName, column, dataType);
            }
            
            // 2. 基于数据字典识别
            dataType = identifyByDataDictionary(tableName, column.getName());
            if (dataType != null) {
                return createSensitiveDataInfo(dataSource, tableName, column, dataType);
            }
            
            // 3. 基于数据模式识别
            dataType = identifyByDataPattern(dataSource, tableName, column);
            if (dataType != null) {
                return createSensitiveDataInfo(dataSource, tableName, column, dataType);
            }
            
            // 4. 基于业务规则识别
            dataType = identifyByBusinessRules(tableName, column);
            if (dataType != null) {
                return createSensitiveDataInfo(dataSource, tableName, column, dataType);
            }
            
            return null;
        } catch (Exception e) {
            log.warn("识别敏感列失败 - 表: {}, 列: {}", tableName, column.getName(), e);
            return null;
        }
    }
    
    /**
     * 基于列名识别敏感数据类型
     */
    private SensitiveDataType identifyByColumnName(String columnName) {
        String lowerColumnName = columnName.toLowerCase();
        
        // 个人身份信息
        if (lowerColumnName.contains("name") || lowerColumnName.contains("姓名")) {
            return SensitiveDataType.PERSONAL_NAME;
        }
        if (lowerColumnName.contains("id_card") || lowerColumnName.contains("身份证")) {
            return SensitiveDataType.ID_CARD_NUMBER;
        }
        if (lowerColumnName.contains("phone") || lowerColumnName.contains("电话")) {
            return SensitiveDataType.PHONE_NUMBER;
        }
        if (lowerColumnName.contains("email") || lowerColumnName.contains("邮箱")) {
            return SensitiveDataType.EMAIL_ADDRESS;
        }
        if (lowerColumnName.contains("address") || lowerColumnName.contains("地址")) {
            return SensitiveDataType.ADDRESS;
        }
        
        // 财务信息
        if (lowerColumnName.contains("bank") || lowerColumnName.contains("银行")) {
            return SensitiveDataType.BANK_ACCOUNT;
        }
        if (lowerColumnName.contains("salary") || lowerColumnName.contains("工资")) {
            return SensitiveDataType.SALARY;
        }
        if (lowerColumnName.contains("credit") || lowerColumnName.contains("信用卡")) {
            return SensitiveDataType.CREDIT_CARD;
        }
        
        // 商业机密
        if (lowerColumnName.contains("password") || lowerColumnName.contains("密码")) {
            return SensitiveDataType.PASSWORD;
        }
        if (lowerColumnName.contains("secret") || lowerColumnName.contains("密钥")) {
            return SensitiveDataType.SECRET_KEY;
        }
        
        return null;
    }
    
    /**
     * 基于数据字典识别敏感数据类型
     */
    private SensitiveDataType identifyByDataDictionary(String tableName, String columnName) {
        try {
            DataDictionaryEntry entry = dataDictionaryService.getEntry(tableName, columnName);
            if (entry != null && entry.getSensitiveDataType() != null) {
                return entry.getSensitiveDataType();
            }
        } catch (Exception e) {
            log.warn("基于数据字典识别敏感数据类型失败 - 表: {}, 列: {}", tableName, columnName, e);
        }
        
        return null;
    }
    
    /**
     * 基于数据模式识别敏感数据类型
     */
    private SensitiveDataType identifyByDataPattern(DataSource dataSource, String tableName, 
        ColumnInfo column) {
        
        try {
            // 获取识别模式
            List<SensitiveDataPattern> patterns = patternRepository.findAllActivePatterns();
            
            // 采样数据进行模式匹配
            List<String> sampleData = sampleColumnData(dataSource, tableName, column.getName(), 100);
            
            for (SensitiveDataPattern pattern : patterns) {
                if (matchesPattern(sampleData, pattern)) {
                    return pattern.getDataType();
                }
            }
        } catch (Exception e) {
            log.warn("基于数据模式识别敏感数据类型失败 - 表: {}, 列: {}", tableName, column.getName(), e);
        }
        
        return null;
    }
    
    /**
     * 采样列数据
     */
    private List<String> sampleColumnData(DataSource dataSource, String tableName, 
        String columnName, int sampleSize) {
        
        List<String> sampleData = new ArrayList<>();
        
        try {
            String sql = String.format("SELECT %s FROM %s LIMIT %d", columnName, tableName, sampleSize);
            // 执行SQL查询获取样本数据
            // sampleData = jdbcTemplate.queryForList(sql, String.class);
        } catch (Exception e) {
            log.warn("采样列数据失败 - 表: {}, 列: {}", tableName, columnName, e);
        }
        
        return sampleData;
    }
    
    /**
     * 检查数据是否匹配模式
     */
    private boolean matchesPattern(List<String> data, SensitiveDataPattern pattern) {
        if (data.isEmpty()) return false;
        
        int matchCount = 0;
        for (String value : data) {
            if (value != null && value.matches(pattern.getPattern())) {
                matchCount++;
            }
        }
        
        // 匹配率超过阈值则认为匹配
        double matchRate = (double) matchCount / data.size();
        return matchRate >= pattern.getMatchThreshold();
    }
    
    /**
     * 基于业务规则识别敏感数据类型
     */
    private SensitiveDataType identifyByBusinessRules(String tableName, ColumnInfo column) {
        // 根据具体业务场景实现识别逻辑
        // 例如：根据表名和业务领域判断
        return null;
    }
    
    /**
     * 创建敏感数据信息
     */
    private SensitiveDataInfo createSensitiveDataInfo(DataSource dataSource, String tableName, 
        ColumnInfo column, SensitiveDataType dataType) {
        
        SensitiveDataInfo info = new SensitiveDataInfo();
        info.setId(UUID.randomUUID().toString());
        info.setDataSourceId(dataSource.getId());
        info.setTableName(tableName);
        info.setColumnName(column.getName());
        info.setDataType(dataType);
        info.setColumnDataType(column.getDataType());
        info.setIdentifiedTime(new Date());
        info.setStatus(SensitiveDataStatus.IDENTIFIED);
        
        // 设置敏感级别
        info.setSensitivityLevel(determineSensitivityLevel(dataType));
        
        return info;
    }
    
    /**
     * 确定敏感级别
     */
    private SensitivityLevel determineSensitivityLevel(SensitiveDataType dataType) {
        switch (dataType) {
            case PASSWORD:
            case SECRET_KEY:
                return SensitivityLevel.CRITICAL;
            case ID_CARD_NUMBER:
            case BANK_ACCOUNT:
            case CREDIT_CARD:
            case SALARY:
                return SensitivityLevel.HIGH;
            case PERSONAL_NAME:
            case PHONE_NUMBER:
            case EMAIL_ADDRESS:
                return SensitivityLevel.MEDIUM;
            case ADDRESS:
            default:
                return SensitivityLevel.LOW;
        }
    }
    
    /**
     * 获取表名列表
     */
    private List<String> getTableNames(DataSource dataSource) {
        // 实现获取数据源中所有表名的逻辑
        return new ArrayList<>();
    }
    
    /**
     * 获取表列信息
     */
    private List<ColumnInfo> getTableColumns(DataSource dataSource, String tableName) {
        // 实现获取表列信息的逻辑
        return new ArrayList<>();
    }
}

// 敏感数据信息实体
public class SensitiveDataInfo {
    
    private String id;
    private String dataSourceId;
    private String tableName;
    private String columnName;
    private SensitiveDataType dataType;
    private String columnDataType;
    private SensitivityLevel sensitivityLevel;
    private SensitiveDataStatus status;
    private Date identifiedTime;
    private Date classifiedTime;
    private String classifier;
    private String notes;
    private Map<String, Object> metadata;
    
    // getters and setters
}

// 敏感数据类型枚举
public enum SensitiveDataType {
    PERSONAL_NAME("个人姓名"),
    ID_CARD_NUMBER("身份证号"),
    PHONE_NUMBER("电话号码"),
    EMAIL_ADDRESS("电子邮件地址"),
    ADDRESS("地址信息"),
    BANK_ACCOUNT("银行账户"),
    CREDIT_CARD("信用卡号"),
    SALARY("薪资信息"),
    PASSWORD("密码"),
    SECRET_KEY("密钥"),
    BUSINESS_SECRET("商业机密"),
    MEDICAL_RECORD("医疗记录"),
    OTHER("其他");
    
    private final String description;
    
    SensitiveDataType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// 敏感度级别枚举
public enum SensitivityLevel {
    CRITICAL(4, "关键"),
    HIGH(3, "高"),
    MEDIUM(2, "中"),
    LOW(1, "低");
    
    private final int priority;
    private final String description;
    
    SensitivityLevel(int priority, String description) {
        this.priority = priority;
        this.description = description;
    }
    
    public int getPriority() {
        return priority;
    }
    
    public String getDescription() {
        return description;
    }
}

// 敏感数据状态枚举
public enum SensitiveDataStatus {
    IDENTIFIED("已识别"),
    CLASSIFIED("已分类"),
    PROTECTED("已保护"),
    ARCHIVED("已归档"),
    DELETED("已删除");
    
    private final String description;
    
    SensitiveDataStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

## 数据加密实现

数据加密是保护敏感数据的核心技术手段，包括传输加密和存储加密。

```java
// 数据加密服务
@Service
public class DataEncryptionService {
    
    @Autowired
    private KeyManagementService keyManagementService;
    
    @Autowired
    private EncryptionConfigurationRepository configRepository;
    
    @Autowired
    private SensitiveDataInfoRepository sensitiveDataRepository;
    
    /**
     * 加密敏感数据
     */
    public String encryptSensitiveData(String plainText, SensitiveDataType dataType) {
        try {
            // 获取加密配置
            EncryptionConfiguration config = getEncryptionConfig(dataType);
            if (config == null) {
                throw new EncryptionException("未找到适用于数据类型 " + dataType + " 的加密配置");
            }
            
            // 获取加密密钥
            SecretKey secretKey = keyManagementService.getEncryptionKey(config.getKeyId());
            if (secretKey == null) {
                throw new EncryptionException("未找到加密密钥: " + config.getKeyId());
            }
            
            // 执行加密
            switch (config.getAlgorithm()) {
                case AES:
                    return encryptWithAES(plainText, secretKey, config);
                case RSA:
                    return encryptWithRSA(plainText, secretKey, config);
                default:
                    throw new EncryptionException("不支持的加密算法: " + config.getAlgorithm());
            }
        } catch (Exception e) {
            log.error("加密敏感数据失败 - 数据类型: {}", dataType, e);
            throw new EncryptionException("加密敏感数据失败", e);
        }
    }
    
    /**
     * 解密敏感数据
     */
    public String decryptSensitiveData(String cipherText, SensitiveDataType dataType) {
        try {
            // 获取加密配置
            EncryptionConfiguration config = getEncryptionConfig(dataType);
            if (config == null) {
                throw new EncryptionException("未找到适用于数据类型 " + dataType + " 的加密配置");
            }
            
            // 获取解密密钥
            SecretKey secretKey = keyManagementService.getDecryptionKey(config.getKeyId());
            if (secretKey == null) {
                throw new EncryptionException("未找到解密密钥: " + config.getKeyId());
            }
            
            // 执行解密
            switch (config.getAlgorithm()) {
                case AES:
                    return decryptWithAES(cipherText, secretKey, config);
                case RSA:
                    return decryptWithRSA(cipherText, secretKey, config);
                default:
                    throw new EncryptionException("不支持的解密算法: " + config.getAlgorithm());
            }
        } catch (Exception e) {
            log.error("解密敏感数据失败 - 数据类型: {}", dataType, e);
            throw new EncryptionException("解密敏感数据失败", e);
        }
    }
    
    /**
     * AES加密
     */
    private String encryptWithAES(String plainText, SecretKey secretKey, 
        EncryptionConfiguration config) throws Exception {
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        
        // 生成随机IV
        byte[] iv = new byte[12]; // GCM推荐12字节IV
        new SecureRandom().nextBytes(iv);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
        
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
        
        byte[] encryptedData = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
        
        // 将IV和加密数据组合
        ByteBuffer byteBuffer = ByteBuffer.allocate(4 + iv.length + encryptedData.length);
        byteBuffer.putInt(iv.length);
        byteBuffer.put(iv);
        byteBuffer.put(encryptedData);
        
        // Base64编码
        return Base64.getEncoder().encodeToString(byteBuffer.array());
    }
    
    /**
     * AES解密
     */
    private String decryptWithAES(String cipherText, SecretKey secretKey, 
        EncryptionConfiguration config) throws Exception {
        
        byte[] decodedData = Base64.getDecoder().decode(cipherText);
        
        ByteBuffer byteBuffer = ByteBuffer.wrap(decodedData);
        int ivLength = byteBuffer.getInt();
        
        if (ivLength != 12) { // GCM推荐12字节IV
            throw new IllegalArgumentException("无效的IV长度");
        }
        
        byte[] iv = new byte[ivLength];
        byteBuffer.get(iv);
        
        byte[] encryptedData = new byte[byteBuffer.remaining()];
        byteBuffer.get(encryptedData);
        
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);
        
        byte[] decryptedData = cipher.doFinal(encryptedData);
        
        return new String(decryptedData, StandardCharsets.UTF_8);
    }
    
    /**
     * RSA加密
     */
    private String encryptWithRSA(String plainText, SecretKey secretKey, 
        EncryptionConfiguration config) throws Exception {
        
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        
        byte[] encryptedData = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
        
        return Base64.getEncoder().encodeToString(encryptedData);
    }
    
    /**
     * RSA解密
     */
    private String decryptWithRSA(String cipherText, SecretKey secretKey, 
        EncryptionConfiguration config) throws Exception {
        
        byte[] decodedData = Base64.getDecoder().decode(cipherText);
        
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        
        byte[] decryptedData = cipher.doFinal(decodedData);
        
        return new String(decryptedData, StandardCharsets.UTF_8);
    }
    
    /**
     * 获取加密配置
     */
    private EncryptionConfiguration getEncryptionConfig(SensitiveDataType dataType) {
        try {
            return configRepository.findByDataType(dataType);
        } catch (Exception e) {
            log.warn("获取加密配置失败 - 数据类型: {}", dataType, e);
            return null;
        }
    }
    
    /**
     * 加密数据库列
     */
    public void encryptDatabaseColumn(DataSource dataSource, String tableName, 
        String columnName, SensitiveDataType dataType) {
        
        try {
            // 获取敏感数据信息
            SensitiveDataInfo sensitiveData = sensitiveDataRepository
                .findByDataSourceIdAndTableNameAndColumnName(
                    dataSource.getId(), tableName, columnName);
            
            if (sensitiveData == null) {
                log.warn("未找到敏感数据信息 - 数据源: {}, 表: {}, 列: {}", 
                    dataSource.getName(), tableName, columnName);
                return;
            }
            
            // 更新敏感数据状态
            sensitiveData.setStatus(SensitiveDataStatus.PROTECTED);
            sensitiveData.setClassifiedTime(new Date());
            sensitiveDataRepository.save(sensitiveData);
            
            // 执行列加密
            String sql = String.format(
                "UPDATE %s SET %s = ? WHERE id = ?", tableName, columnName);
            
            // 这里需要实现具体的加密逻辑
            // 通常需要分批处理大量数据
            log.info("开始加密数据库列 - 表: {}, 列: {}", tableName, columnName);
            
        } catch (Exception e) {
            log.error("加密数据库列失败 - 表: {}, 列: {}", tableName, columnName, e);
            throw new EncryptionException("加密数据库列失败", e);
        }
    }
    
    /**
     * 字段级加密注解
     */
    @Target({ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface EncryptedField {
        
        /**
         * 敏感数据类型
         */
        SensitiveDataType value() default SensitiveDataType.OTHER;
        
        /**
         * 加密算法
         */
        EncryptionAlgorithm algorithm() default EncryptionAlgorithm.AES;
        
        /**
         * 密钥ID
         */
        String keyId() default "";
    }
}

// 加密实体示例
@Entity
@Table(name = "user_info")
public class UserInfo {
    
    @Id
    private String id;
    
    private String username;
    
    // 敏感字段加密
    @EncryptedField(SensitiveDataType.PERSONAL_NAME)
    private String fullName;
    
    @EncryptedField(SensitiveDataType.ID_CARD_NUMBER)
    private String idCardNumber;
    
    @EncryptedField(SensitiveDataType.PHONE_NUMBER)
    private String phoneNumber;
    
    @EncryptedField(SensitiveDataType.EMAIL_ADDRESS)
    private String emailAddress;
    
    // getters and setters
}

// 加密配置实体
@Entity
@Table(name = "encryption_configurations")
public class EncryptionConfiguration {
    
    @Id
    private String id;
    
    @Enumerated(EnumType.STRING)
    private SensitiveDataType dataType;
    
    @Enumerated(EnumType.STRING)
    private EncryptionAlgorithm algorithm;
    
    private String keyId;
    
    private String keyAlias;
    
    private int keySize;
    
    private String mode;
    
    private String padding;
    
    private boolean enabled;
    
    private Date createTime;
    
    private Date updateTime;
    
    // getters and setters
}

// 加密算法枚举
public enum EncryptionAlgorithm {
    AES("AES"),
    RSA("RSA"),
    SM4("SM4"); // 国密算法
    
    private final String algorithm;
    
    EncryptionAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }
    
    public String getAlgorithm() {
        return algorithm;
    }
}
```

## 数据脱敏实现

数据脱敏是在保持数据可用性的前提下，对敏感信息进行变形处理的技术。

```java
// 数据脱敏服务
@Service
public class DataMaskingService {
    
    @Autowired
    private MaskingRuleRepository maskingRuleRepository;
    
    @Autowired
    private SensitiveDataInfoRepository sensitiveDataRepository;
    
    /**
     * 脱敏敏感数据
     */
    public String maskSensitiveData(String originalData, SensitiveDataType dataType) {
        if (originalData == null || originalData.isEmpty()) {
            return originalData;
        }
        
        try {
            // 获取脱敏规则
            MaskingRule rule = getMaskingRule(dataType);
            if (rule == null) {
                // 如果没有特定规则，使用默认脱敏
                return defaultMask(originalData, dataType);
            }
            
            // 根据规则执行脱敏
            switch (rule.getMaskingType()) {
                case REPLACE:
                    return replaceMask(originalData, rule);
                case SHUFFLE:
                    return shuffleMask(originalData, rule);
                case HASH:
                    return hashMask(originalData, rule);
                case PARTIAL:
                    return partialMask(originalData, rule);
                case FORMAT_PRESERVING:
                    return formatPreservingMask(originalData, rule);
                default:
                    return defaultMask(originalData, dataType);
            }
        } catch (Exception e) {
            log.error("脱敏敏感数据失败 - 数据类型: {}, 原始数据: {}", dataType, originalData, e);
            // 出错时返回默认脱敏结果
            return defaultMask(originalData, dataType);
        }
    }
    
    /**
     * 替换脱敏
     */
    private String replaceMask(String originalData, MaskingRule rule) {
        String replacement = rule.getConfiguration().get("replacement");
        if (replacement == null) {
            replacement = "*";
        }
        
        int start = Integer.parseInt(rule.getConfiguration().getOrDefault("start", "0"));
        int end = Integer.parseInt(rule.getConfiguration().getOrDefault("end", 
            String.valueOf(originalData.length())));
        
        if (start < 0) start = 0;
        if (end > originalData.length()) end = originalData.length();
        
        StringBuilder maskedData = new StringBuilder(originalData);
        for (int i = start; i < end; i++) {
            maskedData.setCharAt(i, replacement.charAt(0));
        }
        
        return maskedData.toString();
    }
    
    /**
     * 洗牌脱敏
     */
    private String shuffleMask(String originalData, MaskingRule rule) {
        char[] chars = originalData.toCharArray();
        Random random = new Random();
        
        // Fisher-Yates洗牌算法
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        
        return new String(chars);
    }
    
    /**
     * 哈希脱敏
     */
    private String hashMask(String originalData, MaskingRule rule) {
        try {
            String algorithm = rule.getConfiguration().getOrDefault("algorithm", "SHA-256");
            MessageDigest digest = MessageDigest.getInstance(algorithm);
            byte[] hashBytes = digest.digest(originalData.getBytes(StandardCharsets.UTF_8));
            
            // 转换为十六进制字符串
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            // 根据配置截取指定长度
            int length = Integer.parseInt(rule.getConfiguration().getOrDefault("length", "8"));
            if (length < hexString.length()) {
                return hexString.substring(0, length);
            }
            
            return hexString.toString();
        } catch (Exception e) {
            log.error("哈希脱敏失败", e);
            return defaultMask(originalData, SensitiveDataType.OTHER);
        }
    }
    
    /**
     * 部分脱敏
     */
    private String partialMask(String originalData, MaskingRule rule) {
        int prefixLength = Integer.parseInt(rule.getConfiguration().getOrDefault("prefixLength", "3"));
        int suffixLength = Integer.parseInt(rule.getConfiguration().getOrDefault("suffixLength", "4"));
        String maskChar = rule.getConfiguration().getOrDefault("maskChar", "*");
        
        if (originalData.length() <= prefixLength + suffixLength) {
            // 数据太短，全部脱敏
            return maskChar.repeat(originalData.length());
        }
        
        String prefix = originalData.substring(0, prefixLength);
        String suffix = originalData.substring(originalData.length() - suffixLength);
        String maskedMiddle = maskChar.repeat(originalData.length() - prefixLength - suffixLength);
        
        return prefix + maskedMiddle + suffix;
    }
    
    /**
     * 格式保持脱敏
     */
    private String formatPreservingMask(String originalData, MaskingRule rule) {
        // 实现格式保持加密(FPE)算法
        // 这里简化实现，使用字符映射
        String mapping = rule.getConfiguration().get("mapping");
        if (mapping == null) {
            return shuffleMask(originalData, rule);
        }
        
        StringBuilder maskedData = new StringBuilder();
        for (char c : originalData.toCharArray()) {
            // 简化的字符映射
            char maskedChar = mapCharacter(c, mapping);
            maskedData.append(maskedChar);
        }
        
        return maskedData.toString();
    }
    
    /**
     * 字符映射
     */
    private char mapCharacter(char originalChar, String mapping) {
        // 简化的映射逻辑
        return (char) (originalChar + 1);
    }
    
    /**
     * 默认脱敏
     */
    private String defaultMask(String originalData, SensitiveDataType dataType) {
        switch (dataType) {
            case ID_CARD_NUMBER:
                return maskIdCardNumber(originalData);
            case PHONE_NUMBER:
                return maskPhoneNumber(originalData);
            case EMAIL_ADDRESS:
                return maskEmailAddress(originalData);
            case BANK_ACCOUNT:
                return maskBankAccount(originalData);
            case CREDIT_CARD:
                return maskCreditCard(originalData);
            default:
                // 默认脱敏：保留前3位和后4位，中间用*替换
                return partialMask(originalData, createDefaultRule());
        }
    }
    
    /**
     * 身份证号脱敏
     */
    private String maskIdCardNumber(String idCard) {
        if (idCard == null || idCard.length() < 18) {
            return idCard;
        }
        return idCard.substring(0, 6) + "********" + idCard.substring(14);
    }
    
    /**
     * 电话号码脱敏
     */
    private String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() < 11) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }
    
    /**
     * 邮箱地址脱敏
     */
    private String maskEmailAddress(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        
        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];
        
        if (username.length() <= 2) {
            return "*" + "@" + domain;
        }
        
        return username.charAt(0) + "*" + username.charAt(username.length() - 1) + "@" + domain;
    }
    
    /**
     * 银行卡号脱敏
     */
    private String maskBankAccount(String account) {
        if (account == null || account.length() < 8) {
            return account;
        }
        return account.substring(0, 4) + "****" + account.substring(account.length() - 4);
    }
    
    /**
     * 信用卡号脱敏
     */
    private String maskCreditCard(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 8) {
            return cardNumber;
        }
        return cardNumber.substring(0, 4) + "****" + cardNumber.substring(cardNumber.length() - 4);
    }
    
    /**
     * 创建默认规则
     */
    private MaskingRule createDefaultRule() {
        MaskingRule rule = new MaskingRule();
        rule.setMaskingType(MaskingType.PARTIAL);
        rule.setConfiguration(new HashMap<>());
        rule.getConfiguration().put("prefixLength", "3");
        rule.getConfiguration().put("suffixLength", "4");
        rule.getConfiguration().put("maskChar", "*");
        return rule;
    }
    
    /**
     * 获取脱敏规则
     */
    private MaskingRule getMaskingRule(SensitiveDataType dataType) {
        try {
            return maskingRuleRepository.findByDataType(dataType);
        } catch (Exception e) {
            log.warn("获取脱敏规则失败 - 数据类型: {}", dataType, e);
            return null;
        }
    }
    
    /**
     * 脱敏数据库查询结果
     */
    public List<Map<String, Object>> maskQueryResults(List<Map<String, Object>> results, 
        List<SensitiveDataInfo> sensitiveColumns) {
        
        List<Map<String, Object>> maskedResults = new ArrayList<>();
        
        for (Map<String, Object> row : results) {
            Map<String, Object> maskedRow = new HashMap<>(row);
            
            for (SensitiveDataInfo sensitiveData : sensitiveColumns) {
                String columnName = sensitiveData.getColumnName();
                Object value = row.get(columnName);
                
                if (value instanceof String) {
                    String maskedValue = maskSensitiveData((String) value, sensitiveData.getDataType());
                    maskedRow.put(columnName, maskedValue);
                }
            }
            
            maskedResults.add(maskedRow);
        }
        
        return maskedResults;
    }
    
    /**
     * 动态脱敏注解
     */
    @Target({ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface MaskedField {
        
        /**
         * 敏感数据类型
         */
        SensitiveDataType value() default SensitiveDataType.OTHER;
        
        /**
         * 脱敏类型
         */
        MaskingType maskingType() default MaskingType.PARTIAL;
        
        /**
         * 脱敏配置
         */
        String[] configuration() default {};
    }
}

// 脱敏规则实体
@Entity
@Table(name = "masking_rules")
public class MaskingRule {
    
    @Id
    private String id;
    
    @Enumerated(EnumType.STRING)
    private SensitiveDataType dataType;
    
    @Enumerated(EnumType.STRING)
    private MaskingType maskingType;
    
    @ElementCollection
    @CollectionTable(name = "masking_rule_config", joinColumns = @JoinColumn(name = "rule_id"))
    @MapKeyColumn(name = "config_key")
    @Column(name = "config_value")
    private Map<String, String> configuration;
    
    private boolean enabled;
    
    private Date createTime;
    
    private Date updateTime;
    
    // getters and setters
}

// 脱敏类型枚举
public enum MaskingType {
    REPLACE("替换"),
    SHUFFLE("洗牌"),
    HASH("哈希"),
    PARTIAL("部分"),
    FORMAT_PRESERVING("格式保持");
    
    private final String description;
    
    MaskingType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}

// 脱敏实体示例
@Entity
@Table(name = "customer_info")
public class CustomerInfo {
    
    @Id
    private String id;
    
    private String customerName;
    
    // 脱敏字段
    @MaskedField(SensitiveDataType.ID_CARD_NUMBER)
    private String idCardNumber;
    
    @MaskedField(SensitiveDataType.PHONE_NUMBER)
    private String phoneNumber;
    
    @MaskedField(SensitiveDataType.EMAIL_ADDRESS)
    private String emailAddress;
    
    @MaskedField(SensitiveDataType.BANK_ACCOUNT)
    private String bankAccount;
    
    // getters and setters
}
```

## 传输加密实现

确保数据在传输过程中的安全性。

```java
// 传输加密配置
@Configuration
@EnableWebSecurity
public class TransportSecurityConfig {
    
    /**
     * 配置HTTPS重定向
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 强制HTTPS
            .requiresChannel(channel -> 
                channel.requestMatchers(r -> r.getHeader("X-Forwarded-Proto") != null)
                    .requiresSecure())
            
            // 配置安全头
            .headers(headers -> 
                headers
                    .frameOptions().deny()
                    .contentTypeOptions().and()
                    .httpStrictTransportSecurity(hstsConfig -> 
                        hstsConfig
                            .maxAgeInSeconds(31536000) // 1年
                            .includeSubdomains(true)
                            .preload(true))
                    .contentSecurityPolicy(cspConfig -> 
                        cspConfig.policyDirectives(
                            "default-src 'self'; " +
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                            "style-src 'self' 'unsafe-inline'; " +
                            "img-src 'self' data:; " +
                            "connect-src 'self'; " +
                            "font-src 'self'; " +
                            "object-src 'none'; " +
                            "media-src 'self'; " +
                            "frame-ancestors 'none'; " +
                            "base-uri 'self'; " +
                            "form-action 'self';"))
            )
            
            // 配置CSRF保护
            .csrf(csrf -> 
                csrf
                    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    .ignoringRequestMatchers("/api/public/**"))
            
            // 配置会话管理
            .sessionManagement(session -> 
                session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                    .maximumSessions(1)
                    .maxSessionsPreventsLogin(false))
            
            // 配置认证
            .authorizeHttpRequests(authz -> 
                authz
                    .requestMatchers("/api/public/**").permitAll()
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .anyRequest().authenticated());
        
        return http.build();
    }
    
    /**
     * 配置TLS
     */
    @Bean
    public TomcatServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();
        tomcat.addConnectorCustomizers(connector -> {
            connector.setAttribute("SSLEnabled", true);
            connector.setAttribute("sslProtocol", "TLS");
            connector.setAttribute("sslEnabledProtocols", "TLSv1.2,TLSv1.3");
            connector.setAttribute("ciphers", 
                "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256," +
                "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384," +
                "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256," +
                "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384");
        });
        return tomcat;
    }
}

// API传输加密拦截器
@Component
public class ApiTransportEncryptionInterceptor implements HandlerInterceptor {
    
    @Autowired
    private DataEncryptionService dataEncryptionService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
        Object handler) throws Exception {
        
        // 检查是否为API请求
        if (isApiRequest(request)) {
            // 验证HTTPS
            if (!isSecureRequest(request)) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.getWriter().write("API请求必须使用HTTPS");
                return false;
            }
            
            // 验证请求头
            if (!validateRequestHeaders(request)) {
                response.setStatus(HttpStatus.BAD_REQUEST.value());
                response.getWriter().write("请求头验证失败");
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 检查是否为API请求
     */
    private boolean isApiRequest(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/api/");
    }
    
    /**
     * 检查是否为安全请求
     */
    private boolean isSecureRequest(HttpServletRequest request) {
        return request.isSecure() || 
               "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
    }
    
    /**
     * 验证请求头
     */
    private boolean validateRequestHeaders(HttpServletRequest request) {
        // 检查必要的安全头
        String contentType = request.getContentType();
        if (contentType != null && !contentType.startsWith("application/json")) {
            return false;
        }
        
        // 检查自定义安全头
        String apiKey = request.getHeader("X-API-Key");
        if (apiKey == null || apiKey.isEmpty()) {
            return false;
        }
        
        // 验证API密钥
        return validateApiKey(apiKey);
    }
    
    /**
     * 验证API密钥
     */
    private boolean validateApiKey(String apiKey) {
        // 实现API密钥验证逻辑
        return true;
    }
}

// WebSocket传输加密配置
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins("*")
            .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        
        // 配置消息代理的安全性
        registry.configureBrokerTransport(transport -> {
            transport.setTcpServerCustomizer(tcpServer -> 
                tcpServer.secure(sslContextSpec -> 
                    sslContextSpec.sslContext(createSslContext())));
        });
    }
    
    /**
     * 创建SSL上下文
     */
    private SslContext createSslContext() {
        try {
            // 加载证书和私钥
            File certFile = new File("path/to/certificate.crt");
            File keyFile = new File("path/to/private.key");
            
            return SslContextBuilder.forServer(certFile, keyFile)
                .protocols("TLSv1.2", "TLSv1.3")
                .build();
        } catch (Exception e) {
            throw new RuntimeException("创建SSL上下文失败", e);
        }
    }
}
```

## 密钥管理实现

安全的密钥管理是数据加密与脱敏的基础。

```java
// 密钥管理服务
@Service
public class KeyManagementService {
    
    @Autowired
    private KeyRepository keyRepository;
    
    @Autowired
    private KeyEncryptionService keyEncryptionService;
    
    @Autowired
    private HsmService hsmService;
    
    @Value("${key.management.master.key}")
    private String masterKey;
    
    /**
     * 生成加密密钥
     */
    public SecretKey generateEncryptionKey(EncryptionAlgorithm algorithm, int keySize) {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(algorithm.getAlgorithm());
            keyGenerator.init(keySize);
            return keyGenerator.generateKey();
        } catch (Exception e) {
            log.error("生成加密密钥失败 - 算法: {}, 密钥长度: {}", algorithm, keySize, e);
            throw new KeyManagementException("生成加密密钥失败", e);
        }
    }
    
    /**
     * 存储密钥
     */
    public void storeKey(String keyId, SecretKey secretKey, KeyMetadata metadata) {
        try {
            // 加密密钥
            String encryptedKey = keyEncryptionService.encryptKey(secretKey, masterKey);
            
            // 创建密钥实体
            KeyInfo keyInfo = new KeyInfo();
            keyInfo.setId(keyId);
            keyInfo.setAlgorithm(metadata.getAlgorithm().getAlgorithm());
            keyInfo.setKeySize(metadata.getKeySize());
            keyInfo.setEncryptedKey(encryptedKey);
            keyInfo.setMetadata(metadata);
            keyInfo.setCreateTime(new Date());
            keyInfo.setUpdateTime(new Date());
            keyInfo.setStatus(KeyStatus.ACTIVE);
            
            // 保存到数据库
            keyRepository.save(keyInfo);
            
            // 如果配置了HSM，同时存储到HSM
            if (metadata.isHsmRequired()) {
                hsmService.storeKey(keyId, secretKey);
            }
        } catch (Exception e) {
            log.error("存储密钥失败 - 密钥ID: {}", keyId, e);
            throw new KeyManagementException("存储密钥失败", e);
        }
    }
    
    /**
     * 获取加密密钥
     */
    public SecretKey getEncryptionKey(String keyId) {
        try {
            // 从数据库获取密钥信息
            KeyInfo keyInfo = keyRepository.findById(keyId);
            if (keyInfo == null) {
                throw new KeyManagementException("密钥不存在: " + keyId);
            }
            
            if (keyInfo.getStatus() != KeyStatus.ACTIVE) {
                throw new KeyManagementException("密钥状态无效: " + keyInfo.getStatus());
            }
            
            // 解密密钥
            SecretKey secretKey = keyEncryptionService.decryptKey(
                keyInfo.getEncryptedKey(), masterKey);
            
            // 如果配置了HSM，从HSM获取
            if (keyInfo.getMetadata().isHsmRequired()) {
                SecretKey hsmKey = hsmService.getKey(keyId);
                if (hsmKey != null) {
                    return hsmKey;
                }
            }
            
            return secretKey;
        } catch (Exception e) {
            log.error("获取加密密钥失败 - 密钥ID: {}", keyId, e);
            throw new KeyManagementException("获取加密密钥失败", e);
        }
    }
    
    /**
     * 获取解密密钥
     */
    public SecretKey getDecryptionKey(String keyId) {
        // 解密密钥和加密密钥通常是相同的（对称加密）
        return getEncryptionKey(keyId);
    }
    
    /**
     * 轮换密钥
     */
    public void rotateKey(String keyId, EncryptionAlgorithm algorithm, int keySize) {
        try {
            // 生成新密钥
            SecretKey newKey = generateEncryptionKey(algorithm, keySize);
            
            // 获取旧密钥信息
            KeyInfo oldKeyInfo = keyRepository.findById(keyId);
            if (oldKeyInfo == null) {
                throw new KeyManagementException("密钥不存在: " + keyId);
            }
            
            // 更新密钥状态为轮换中
            oldKeyInfo.setStatus(KeyStatus.ROTATING);
            oldKeyInfo.setUpdateTime(new Date());
            keyRepository.save(oldKeyInfo);
            
            // 存储新密钥
            KeyMetadata newMetadata = new KeyMetadata(oldKeyInfo.getMetadata());
            newMetadata.setVersion(oldKeyInfo.getMetadata().getVersion() + 1);
            newMetadata.setActivationTime(new Date());
            
            String newKeyId = keyId + "_v" + newMetadata.getVersion();
            storeKey(newKeyId, newKey, newMetadata);
            
            // 更新密钥状态
            oldKeyInfo.setStatus(KeyStatus.DEPRECATED);
            oldKeyInfo.setUpdateTime(new Date());
            keyRepository.save(oldKeyInfo);
            
            log.info("密钥轮换完成 - 旧密钥ID: {}, 新密钥ID: {}", keyId, newKeyId);
        } catch (Exception e) {
            log.error("轮换密钥失败 - 密钥ID: {}", keyId, e);
            throw new KeyManagementException("轮换密钥失败", e);
        }
    }
    
    /**
     * 归档密钥
     */
    public void archiveKey(String keyId) {
        try {
            KeyInfo keyInfo = keyRepository.findById(keyId);
            if (keyInfo == null) {
                throw new KeyManagementException("密钥不存在: " + keyId);
            }
            
            keyInfo.setStatus(KeyStatus.ARCHIVED);
            keyInfo.setUpdateTime(new Date());
            keyRepository.save(keyInfo);
            
            // 从HSM删除（如果存在）
            if (keyInfo.getMetadata().isHsmRequired()) {
                hsmService.deleteKey(keyId);
            }
            
            log.info("密钥已归档 - 密钥ID: {}", keyId);
        } catch (Exception e) {
            log.error("归档密钥失败 - 密钥ID: {}", keyId, e);
            throw new KeyManagementException("归档密钥失败", e);
        }
    }
}

// 密钥加密服务
@Service
public class KeyEncryptionService {
    
    /**
     * 加密密钥
     */
    public String encryptKey(SecretKey secretKey, String masterKey) {
        try {
            // 使用主密钥加密密钥
            SecretKeySpec keySpec = new SecretKeySpec(
                masterKey.getBytes(StandardCharsets.UTF_8), "AES");
            
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            
            // 生成随机IV
            byte[] iv = new byte[12];
            new SecureRandom().nextBytes(iv);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
            
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, parameterSpec);
            
            byte[] encryptedKey = cipher.doFinal(secretKey.getEncoded());
            
            // 将IV和加密密钥组合
            ByteBuffer byteBuffer = ByteBuffer.allocate(4 + iv.length + encryptedKey.length);
            byteBuffer.putInt(iv.length);
            byteBuffer.put(iv);
            byteBuffer.put(encryptedKey);
            
            // Base64编码
            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            log.error("加密密钥失败", e);
            throw new KeyManagementException("加密密钥失败", e);
        }
    }
    
    /**
     * 解密密钥
     */
    public SecretKey decryptKey(String encryptedKey, String masterKey) {
        try {
            byte[] decodedData = Base64.getDecoder().decode(encryptedKey);
            
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedData);
            int ivLength = byteBuffer.getInt();
            
            if (ivLength != 12) {
                throw new IllegalArgumentException("无效的IV长度");
            }
            
            byte[] iv = new byte[ivLength];
            byteBuffer.get(iv);
            
            byte[] encryptedData = new byte[byteBuffer.remaining()];
            byteBuffer.get(encryptedData);
            
            // 使用主密钥解密密钥
            SecretKeySpec keySpec = new SecretKeySpec(
                masterKey.getBytes(StandardCharsets.UTF_8), "AES");
            
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, parameterSpec);
            
            byte[] decryptedKey = cipher.doFinal(encryptedData);
            
            // 重建SecretKey对象
            return new SecretKeySpec(decryptedKey, "AES");
        } catch (Exception e) {
            log.error("解密密钥失败", e);
            throw new KeyManagementException("解密密钥失败", e);
        }
    }
}

// HSM服务（硬件安全模块）
@Service
public class HsmService {
    
    /**
     * 存储密钥到HSM
     */
    public void storeKey(String keyId, SecretKey secretKey) {
        try {
            // 连接到HSM
            // HsmClient hsmClient = hsmClientFactory.createClient();
            
            // 存储密钥
            // hsmClient.storeKey(keyId, secretKey);
            
            log.info("密钥已存储到HSM - 密钥ID: {}", keyId);
        } catch (Exception e) {
            log.error("存储密钥到HSM失败 - 密钥ID: {}", keyId, e);
            throw new KeyManagementException("存储密钥到HSM失败", e);
        }
    }
    
    /**
     * 从HSM获取密钥
     */
    public SecretKey getKey(String keyId) {
        try {
            // 连接到HSM
            // HsmClient hsmClient = hsmClientFactory.createClient();
            
            // 获取密钥
            // SecretKey secretKey = hsmClient.getKey(keyId);
            
            // return secretKey;
            return null;
        } catch (Exception e) {
            log.error("从HSM获取密钥失败 - 密钥ID: {}", keyId, e);
            return null;
        }
    }
    
    /**
     * 从HSM删除密钥
     */
    public void deleteKey(String keyId) {
        try {
            // 连接到HSM
            // HsmClient hsmClient = hsmClientFactory.createClient();
            
            // 删除密钥
            // hsmClient.deleteKey(keyId);
            
            log.info("密钥已从HSM删除 - 密钥ID: {}", keyId);
        } catch (Exception e) {
            log.error("从HSM删除密钥失败 - 密钥ID: {}", keyId, e);
        }
    }
}

// 密钥信息实体
@Entity
@Table(name = "key_info")
public class KeyInfo {
    
    @Id
    private String id;
    
    private String algorithm;
    
    private int keySize;
    
    @Column(length = 4000)
    private String encryptedKey;
    
    @Embedded
    private KeyMetadata metadata;
    
    @Enumerated(EnumType.STRING)
    private KeyStatus status;
    
    private Date createTime;
    
    private Date updateTime;
    
    private Date activationTime;
    
    private Date expirationTime;
    
    // getters and setters
}

// 密钥元数据
@Embeddable
public class KeyMetadata {
    
    private int version;
    
    private String alias;
    
    private String description;
    
    private String owner;
    
    private String purpose;
    
    private boolean hsmRequired;
    
    private String keyUsage;
    
    private Map<String, String> customAttributes;
    
    // constructors
    public KeyMetadata() {}
    
    public KeyMetadata(KeyMetadata other) {
        this.version = other.version;
        this.alias = other.alias;
        this.description = other.description;
        this.owner = other.owner;
        this.purpose = other.purpose;
        this.hsmRequired = other.hsmRequired;
        this.keyUsage = other.keyUsage;
        this.customAttributes = other.customAttributes != null ? 
            new HashMap<>(other.customAttributes) : null;
    }
    
    // getters and setters
}

// 密钥状态枚举
public enum KeyStatus {
    ACTIVE("激活"),
    INACTIVE("未激活"),
    ROTATING("轮换中"),
    DEPRECATED("已弃用"),
    COMPROMISED("已泄露"),
    ARCHIVED("已归档"),
    DESTROYED("已销毁");
    
    private final String description;
    
    KeyStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

## 最佳实践与注意事项

在实现数据加密与脱敏时，需要注意以下最佳实践：

### 1. 分层防护策略
- 实施多层加密和脱敏策略，确保即使某一层被突破，其他层仍能提供保护
- 结合传输加密、存储加密和应用层加密，构建完整的防护体系

### 2. 性能优化
- 合理选择加密算法和密钥长度，在安全性和性能之间取得平衡
- 对频繁访问的数据考虑使用缓存机制
- 实施异步加密处理，避免阻塞业务操作

### 3. 密钥安全管理
- 实施严格的密钥生命周期管理，包括生成、存储、轮换、归档和销毁
- 使用硬件安全模块(HSM)保护核心密钥
- 建立密钥备份和恢复机制

### 4. 合规性保障
- 确保加密和脱敏方案符合相关法规要求
- 建立完整的审计日志，记录所有加密和脱敏操作
- 定期进行安全评估和合规性检查

### 5. 用户体验平衡
- 在保护敏感数据的同时，确保不影响正常的业务操作
- 提供灵活的脱敏策略，满足不同场景的需求
- 建立清晰的权限控制，确保授权用户能够访问原始数据

通过合理设计和实现数据加密与脱敏机制，可以有效保护BPM平台中的敏感信息，满足数据安全和隐私保护要求，为平台的可信运营提供坚实基础。