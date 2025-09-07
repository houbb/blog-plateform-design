---
title: "核心架构: 事实、规则、规则集、决策流"
date: 2025-09-06
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 核心架构：事实、规则、规则集、决策流

## 引言

在企业级智能风控平台建设中，决策引擎作为风控系统的"大脑"，承担着风险识别、评估和决策的核心职能。一个优秀的决策引擎不仅需要具备高性能的规则处理能力，还需要支持灵活的策略编排和复杂的业务逻辑。决策引擎的核心架构设计直接影响着整个风控系统的效率、准确性和可维护性。

本文将深入探讨决策引擎的核心架构设计，包括事实（Fact）、规则（Rule）、规则集（RuleSet）和决策流（Decision Flow）等核心概念，分析它们之间的关系和协作机制，为构建高效、灵活、可扩展的决策引擎提供指导。

## 一、决策引擎概述

### 1.1 决策引擎的重要性

决策引擎是风控平台的核心组件，其重要性体现在多个方面。

#### 1.1.1 业务价值

**风险控制效果**：
- 实时识别和拦截风险行为，降低业务损失
- 提供准确的风险评估，支持精细化决策
- 支持复杂的业务规则，满足多样化的风控需求

**用户体验优化**：
- 快速响应用户请求，减少等待时间
- 减少对正常用户的误伤，提升服务体验
- 支持个性化的风控策略，提供差异化服务

**运营效率提升**：
- 自动化风险决策，减少人工干预
- 提供可视化的策略管理，降低运维成本
- 支持策略的快速迭代，提升响应速度

#### 1.1.2 技术价值

**高性能处理**：
- 支持高并发的实时决策请求
- 提供毫秒级的响应时间
- 具备良好的水平扩展能力

**灵活性配置**：
- 支持规则的动态配置和更新
- 提供可视化的策略编排工具
- 支持复杂的条件组合和逻辑运算

**可维护性保障**：
- 提供完善的监控和告警机制
- 支持策略的版本管理和回滚
- 具备良好的可测试性和可调试性

### 1.2 决策引擎架构设计

#### 1.2.1 核心组件架构

**分层架构设计**：
```
+---------------------+
|     应用层          |
|  (API/SDK/CLI)      |
+----------+----------+
           |
           v
+---------------------+
|     决策层          |
| (决策流/策略编排)   |
+----------+----------+
           |
           v
+---------------------+
|     规则层          |
|  (规则引擎/匹配)    |
+----------+----------+
           |
           v
+---------------------+
|     数据层          |
| (事实/规则/结果)    |
+----------+----------+
           |
           v
+---------------------+
|     存储层          |
| (规则库/事实库)     |
+---------------------+
```

#### 1.2.2 核心概念定义

**事实（Fact）**：
- 决策的输入数据，包含用户、环境、行为等信息
- 具有明确的数据结构和业务含义
- 支持动态扩展和自定义属性

**规则（Rule）**：
- 基本的决策单元，定义条件和动作
- 支持复杂的条件表达式和逻辑运算
- 具备可重用性和可组合性

**规则集（RuleSet）**：
- 规则的集合，按业务逻辑组织
- 支持规则的优先级排序和执行顺序
- 提供规则的批量管理和版本控制

**决策流（Decision Flow）**：
- 决策的执行流程，定义规则集的执行顺序
- 支持条件分支、循环、并行等流程控制
- 提供可视化的流程编排和监控能力

## 二、事实（Fact）设计

### 2.1 事实的定义与结构

#### 2.1.1 事实模型设计

**基础事实模型**：
```java
// 事实基类
public abstract class Fact {
    private String id;
    private String type;
    private Map<String, Object> attributes;
    private long timestamp;
    private String source;
    
    // 构造函数
    public Fact(String id, String type) {
        this.id = id;
        this.type = type;
        this.attributes = new HashMap<>();
        this.timestamp = System.currentTimeMillis();
    }
    
    // 属性操作
    public void setAttribute(String key, Object value) {
        this.attributes.put(key, value);
    }
    
    public Object getAttribute(String key) {
        return this.attributes.get(key);
    }
    
    public <T> T getAttribute(String key, Class<T> type) {
        Object value = this.attributes.get(key);
        if (value != null && type.isInstance(value)) {
            return type.cast(value);
        }
        return null;
    }
    
    // 获取所有属性
    public Map<String, Object> getAttributes() {
        return new HashMap<>(this.attributes);
    }
    
    // 其他getter和setter方法
    public String getId() { return id; }
    public String getType() { return type; }
    public long getTimestamp() { return timestamp; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}

// 用户事实
public class UserFact extends Fact {
    public UserFact(String userId) {
        super(userId, "user");
    }
    
    public String getUserId() {
        return getId();
    }
    
    public void setAge(Integer age) {
        setAttribute("age", age);
    }
    
    public Integer getAge() {
        return getAttribute("age", Integer.class);
    }
    
    public void setRiskLevel(String riskLevel) {
        setAttribute("riskLevel", riskLevel);
    }
    
    public String getRiskLevel() {
        return getAttribute("riskLevel", String.class);
    }
}

// 交易事实
public class TransactionFact extends Fact {
    public TransactionFact(String transactionId) {
        super(transactionId, "transaction");
    }
    
    public String getTransactionId() {
        return getId();
    }
    
    public void setAmount(Double amount) {
        setAttribute("amount", amount);
    }
    
    public Double getAmount() {
        return getAttribute("amount", Double.class);
    }
    
    public void setMerchantId(String merchantId) {
        setAttribute("merchantId", merchantId);
    }
    
    public String getMerchantId() {
        return getAttribute("merchantId", String.class);
    }
}
```

#### 2.1.2 事实工厂模式

**事实构建器**：
```java
// 事实工厂
public class FactFactory {
    private static final Map<String, FactBuilder> builders = new HashMap<>();
    
    static {
        registerBuilder("user", new UserFactBuilder());
        registerBuilder("transaction", new TransactionFactBuilder());
        registerBuilder("device", new DeviceFactBuilder());
        registerBuilder("environment", new EnvironmentFactBuilder());
    }
    
    public static void registerBuilder(String type, FactBuilder builder) {
        builders.put(type, builder);
    }
    
    public static Fact createFact(String type, String id, Map<String, Object> attributes) {
        FactBuilder builder = builders.get(type);
        if (builder == null) {
            throw new IllegalArgumentException("Unsupported fact type: " + type);
        }
        return builder.build(id, attributes);
    }
    
    public static Fact createFactFromJson(String json) {
        // 解析JSON并创建事实
        JsonObject jsonObject = JsonParser.parseString(json).getAsJsonObject();
        String type = jsonObject.get("type").getAsString();
        String id = jsonObject.get("id").getAsString();
        
        Map<String, Object> attributes = new HashMap<>();
        JsonObject attrs = jsonObject.getAsJsonObject("attributes");
        if (attrs != null) {
            for (Map.Entry<String, JsonElement> entry : attrs.entrySet()) {
                attributes.put(entry.getKey(), entry.getValue());
            }
        }
        
        return createFact(type, id, attributes);
    }
}

// 事实构建器接口
public interface FactBuilder {
    Fact build(String id, Map<String, Object> attributes);
}

// 用户事实构建器
public class UserFactBuilder implements FactBuilder {
    @Override
    public Fact build(String id, Map<String, Object> attributes) {
        UserFact userFact = new UserFact(id);
        
        // 设置属性
        attributes.forEach((key, value) -> {
            if ("age".equals(key) && value instanceof Number) {
                userFact.setAge(((Number) value).intValue());
            } else if ("riskLevel".equals(key) && value instanceof String) {
                userFact.setRiskLevel((String) value);
            } else {
                userFact.setAttribute(key, value);
            }
        });
        
        return userFact;
    }
}

// 交易事实构建器
public class TransactionFactBuilder implements FactBuilder {
    @Override
    public Fact build(String id, Map<String, Object> attributes) {
        TransactionFact transactionFact = new TransactionFact(id);
        
        // 设置属性
        attributes.forEach((key, value) -> {
            if ("amount".equals(key) && value instanceof Number) {
                transactionFact.setAmount(((Number) value).doubleValue());
            } else if ("merchantId".equals(key) && value instanceof String) {
                transactionFact.setMerchantId((String) value);
            } else {
                transactionFact.setAttribute(key, value);
            }
        });
        
        return transactionFact;
    }
}
```

### 2.2 事实管理与存储

#### 2.2.1 事实生命周期管理

**事实管理器**：
```java
// 事实管理器
public class FactManager {
    private final Map<String, Fact> factCache;
    private final FactStorage factStorage;
    private final int cacheSize;
    private final long cacheTtl;
    
    public FactManager(FactStorage factStorage, int cacheSize, long cacheTtl) {
        this.factCache = new LinkedHashMap<String, Fact>(cacheSize, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Fact> eldest) {
                return size() > cacheSize;
            }
        };
        this.factStorage = factStorage;
        this.cacheSize = cacheSize;
        this.cacheTtl = cacheTtl;
    }
    
    public void addFact(Fact fact) {
        String key = generateFactKey(fact);
        factCache.put(key, fact);
        
        // 异步存储到持久化存储
        CompletableFuture.runAsync(() -> {
            factStorage.saveFact(fact);
        });
    }
    
    public Fact getFact(String type, String id) {
        String key = generateFactKey(type, id);
        
        // 先从缓存获取
        Fact fact = factCache.get(key);
        if (fact != null && isFactValid(fact)) {
            return fact;
        }
        
        // 从持久化存储获取
        fact = factStorage.loadFact(type, id);
        if (fact != null) {
            factCache.put(key, fact);
        }
        
        return fact;
    }
    
    public List<Fact> getFactsByType(String type) {
        return factStorage.loadFactsByType(type);
    }
    
    public void removeFact(String type, String id) {
        String key = generateFactKey(type, id);
        factCache.remove(key);
        factStorage.deleteFact(type, id);
    }
    
    public void updateFact(Fact fact) {
        String key = generateFactKey(fact);
        factCache.put(key, fact);
        factStorage.updateFact(fact);
    }
    
    private String generateFactKey(Fact fact) {
        return generateFactKey(fact.getType(), fact.getId());
    }
    
    private String generateFactKey(String type, String id) {
        return type + ":" + id;
    }
    
    private boolean isFactValid(Fact fact) {
        return System.currentTimeMillis() - fact.getTimestamp() < cacheTtl;
    }
    
    // 批量操作
    public void addFacts(List<Fact> facts) {
        facts.forEach(this::addFact);
    }
    
    public Map<String, Fact> getFacts(List<String> factKeys) {
        Map<String, Fact> result = new HashMap<>();
        List<String> missingKeys = new ArrayList<>();
        
        // 先从缓存获取
        for (String key : factKeys) {
            Fact fact = factCache.get(key);
            if (fact != null && isFactValid(fact)) {
                result.put(key, fact);
            } else {
                missingKeys.add(key);
            }
        }
        
        // 从持久化存储获取缺失的事实
        if (!missingKeys.isEmpty()) {
            Map<String, Fact> loadedFacts = factStorage.loadFacts(missingKeys);
            result.putAll(loadedFacts);
            
            // 更新缓存
            loadedFacts.forEach(factCache::put);
        }
        
        return result;
    }
}

// 事实存储接口
public interface FactStorage {
    void saveFact(Fact fact);
    Fact loadFact(String type, String id);
    List<Fact> loadFactsByType(String type);
    Map<String, Fact> loadFacts(List<String> factKeys);
    void updateFact(Fact fact);
    void deleteFact(String type, String id);
}

// 内存事实存储实现
public class InMemoryFactStorage implements FactStorage {
    private final Map<String, Fact> factStore;
    private final Map<String, List<String>> typeIndex;
    
    public InMemoryFactStorage() {
        this.factStore = new ConcurrentHashMap<>();
        this.typeIndex = new ConcurrentHashMap<>();
    }
    
    @Override
    public void saveFact(Fact fact) {
        String key = generateFactKey(fact);
        factStore.put(key, fact);
        
        // 更新类型索引
        typeIndex.computeIfAbsent(fact.getType(), k -> new ArrayList<>()).add(key);
    }
    
    @Override
    public Fact loadFact(String type, String id) {
        String key = generateFactKey(type, id);
        return factStore.get(key);
    }
    
    @Override
    public List<Fact> loadFactsByType(String type) {
        List<String> keys = typeIndex.get(type);
        if (keys == null) {
            return new ArrayList<>();
        }
        
        List<Fact> facts = new ArrayList<>();
        for (String key : keys) {
            Fact fact = factStore.get(key);
            if (fact != null) {
                facts.add(fact);
            }
        }
        return facts;
    }
    
    @Override
    public Map<String, Fact> loadFacts(List<String> factKeys) {
        Map<String, Fact> result = new HashMap<>();
        for (String key : factKeys) {
            Fact fact = factStore.get(key);
            if (fact != null) {
                result.put(key, fact);
            }
        }
        return result;
    }
    
    @Override
    public void updateFact(Fact fact) {
        saveFact(fact);
    }
    
    @Override
    public void deleteFact(String type, String id) {
        String key = generateFactKey(type, id);
        factStore.remove(key);
        
        // 更新类型索引
        List<String> keys = typeIndex.get(type);
        if (keys != null) {
            keys.remove(key);
        }
    }
    
    private String generateFactKey(Fact fact) {
        return generateFactKey(fact.getType(), fact.getId());
    }
    
    private String generateFactKey(String type, String id) {
        return type + ":" + id;
    }
}
```

#### 2.2.2 事实序列化与传输

**事实序列化**：
```java
// 事实序列化器
public class FactSerializer {
    
    // 序列化为JSON
    public static String toJson(Fact fact) {
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("id", fact.getId());
        jsonObject.addProperty("type", fact.getType());
        jsonObject.addProperty("timestamp", fact.getTimestamp());
        jsonObject.addProperty("source", fact.getSource());
        
        JsonObject attributes = new JsonObject();
        fact.getAttributes().forEach((key, value) -> {
            if (value instanceof String) {
                attributes.addProperty(key, (String) value);
            } else if (value instanceof Number) {
                attributes.addProperty(key, (Number) value);
            } else if (value instanceof Boolean) {
                attributes.addProperty(key, (Boolean) value);
            } else {
                attributes.addProperty(key, value.toString());
            }
        });
        jsonObject.add("attributes", attributes);
        
        return jsonObject.toString();
    }
    
    // 从JSON反序列化
    public static Fact fromJson(String json) {
        return FactFactory.createFactFromJson(json);
    }
    
    // 序列化为二进制格式（更高效）
    public static byte[] toBytes(Fact fact) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(baos);
        
        oos.writeUTF(fact.getId());
        oos.writeUTF(fact.getType());
        oos.writeLong(fact.getTimestamp());
        oos.writeUTF(fact.getSource() != null ? fact.getSource() : "");
        
        // 序列化属性
        Map<String, Object> attributes = fact.getAttributes();
        oos.writeInt(attributes.size());
        for (Map.Entry<String, Object> entry : attributes.entrySet()) {
            oos.writeUTF(entry.getKey());
            writeObject(oos, entry.getValue());
        }
        
        oos.close();
        return baos.toByteArray();
    }
    
    // 从二进制反序列化
    public static Fact fromBytes(byte[] bytes) throws IOException, ClassNotFoundException {
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        ObjectInputStream ois = new ObjectInputStream(bais);
        
        String id = ois.readUTF();
        String type = ois.readUTF();
        long timestamp = ois.readLong();
        String source = ois.readUTF();
        
        int attrCount = ois.readInt();
        Map<String, Object> attributes = new HashMap<>();
        for (int i = 0; i < attrCount; i++) {
            String key = ois.readUTF();
            Object value = readObject(ois);
            attributes.put(key, value);
        }
        
        ois.close();
        
        Fact fact = FactFactory.createFact(type, id, attributes);
        // 注意：这里需要特殊处理timestamp和source
        // 在实际实现中可能需要Fact类支持这些属性的设置
        
        return fact;
    }
    
    private static void writeObject(ObjectOutputStream oos, Object obj) throws IOException {
        if (obj instanceof String) {
            oos.writeUTF("S:" + obj);
        } else if (obj instanceof Integer) {
            oos.writeUTF("I:" + obj);
        } else if (obj instanceof Long) {
            oos.writeUTF("L:" + obj);
        } else if (obj instanceof Double) {
            oos.writeUTF("D:" + obj);
        } else if (obj instanceof Boolean) {
            oos.writeUTF("B:" + obj);
        } else {
            oos.writeUTF("O:" + obj.toString());
        }
    }
    
    private static Object readObject(ObjectInputStream ois) throws IOException {
        String value = ois.readUTF();
        String[] parts = value.split(":", 2);
        if (parts.length != 2) {
            return value;
        }
        
        String type = parts[0];
        String data = parts[1];
        
        switch (type) {
            case "S":
                return data;
            case "I":
                return Integer.parseInt(data);
            case "L":
                return Long.parseLong(data);
            case "D":
                return Double.parseDouble(data);
            case "B":
                return Boolean.parseBoolean(data);
            default:
                return data;
        }
    }
}
```

## 三、规则（Rule）设计

### 3.1 规则定义与结构

#### 3.1.1 规则模型设计

**规则基类**：
```java
// 规则基类
public abstract class Rule {
    protected String id;
    protected String name;
    protected String description;
    protected int priority;
    protected boolean enabled;
    protected String category;
    protected List<String> tags;
    protected Map<String, Object> metadata;
    protected long createdAt;
    protected long updatedAt;
    
    public Rule(String id, String name) {
        this.id = id;
        this.name = name;
        this.priority = 0;
        this.enabled = true;
        this.tags = new ArrayList<>();
        this.metadata = new HashMap<>();
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }
    
    // 抽象方法：评估条件
    public abstract boolean evaluate(FactContext context);
    
    // 抽象方法：执行动作
    public abstract List<ActionResult> execute(FactContext context);
    
    // Getter和Setter方法
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { 
        this.description = description; 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public int getPriority() { return priority; }
    public void setPriority(int priority) { 
        this.priority = priority; 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { 
        this.enabled = enabled; 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { 
        this.category = category; 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public List<String> getTags() { return new ArrayList<>(tags); }
    public void addTag(String tag) { 
        if (!tags.contains(tag)) {
            tags.add(tag);
            this.updatedAt = System.currentTimeMillis();
        }
    }
    
    public void removeTag(String tag) {
        tags.remove(tag);
        this.updatedAt = System.currentTimeMillis();
    }
    
    public Map<String, Object> getMetadata() { return new HashMap<>(metadata); }
    public void setMetadata(String key, Object value) { 
        this.metadata.put(key, value); 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public long getCreatedAt() { return createdAt; }
    public long getUpdatedAt() { return updatedAt; }
}

// 条件规则
public class ConditionalRule extends Rule {
    private Condition condition;
    private List<Action> actions;
    
    public ConditionalRule(String id, String name) {
        super(id, name);
        this.actions = new ArrayList<>();
    }
    
    @Override
    public boolean evaluate(FactContext context) {
        if (!isEnabled()) {
            return false;
        }
        
        if (condition == null) {
            return false;
        }
        
        return condition.evaluate(context);
    }
    
    @Override
    public List<ActionResult> execute(FactContext context) {
        List<ActionResult> results = new ArrayList<>();
        
        if (evaluate(context)) {
            for (Action action : actions) {
                ActionResult result = action.execute(context);
                results.add(result);
                
                // 检查是否需要中断执行
                if (result.isBreakExecution()) {
                    break;
                }
            }
        }
        
        return results;
    }
    
    public void setCondition(Condition condition) {
        this.condition = condition;
        this.updatedAt = System.currentTimeMillis();
    }
    
    public Condition getCondition() {
        return condition;
    }
    
    public void addAction(Action action) {
        this.actions.add(action);
        this.updatedAt = System.currentTimeMillis();
    }
    
    public List<Action> getActions() {
        return new ArrayList<>(actions);
    }
    
    public void removeAction(Action action) {
        this.actions.remove(action);
        this.updatedAt = System.currentTimeMillis();
    }
}

// 事实上下文
public class FactContext {
    private Map<String, Fact> facts;
    private Map<String, Object> variables;
    private List<ActionResult> executionResults;
    
    public FactContext() {
        this.facts = new HashMap<>();
        this.variables = new HashMap<>();
        this.executionResults = new ArrayList<>();
    }
    
    public void addFact(Fact fact) {
        facts.put(generateFactKey(fact), fact);
    }
    
    public Fact getFact(String type, String id) {
        return facts.get(generateFactKey(type, id));
    }
    
    public <T extends Fact> T getFact(String type, String id, Class<T> factClass) {
        Fact fact = getFact(type, id);
        if (fact != null && factClass.isInstance(fact)) {
            return factClass.cast(fact);
        }
        return null;
    }
    
    public Collection<Fact> getAllFacts() {
        return facts.values();
    }
    
    public void setVariable(String name, Object value) {
        variables.put(name, value);
    }
    
    public Object getVariable(String name) {
        return variables.get(name);
    }
    
    public <T> T getVariable(String name, Class<T> type) {
        Object value = variables.get(name);
        if (value != null && type.isInstance(value)) {
            return type.cast(value);
        }
        return null;
    }
    
    public Map<String, Object> getVariables() {
        return new HashMap<>(variables);
    }
    
    public void addExecutionResult(ActionResult result) {
        executionResults.add(result);
    }
    
    public List<ActionResult> getExecutionResults() {
        return new ArrayList<>(executionResults);
    }
    
    private String generateFactKey(Fact fact) {
        return generateFactKey(fact.getType(), fact.getId());
    }
    
    private String generateFactKey(String type, String id) {
        return type + ":" + id;
    }
}
```

#### 3.1.2 条件表达式设计

**条件表达式**：
```java
// 条件接口
public interface Condition {
    boolean evaluate(FactContext context);
}

// 原子条件
public class AtomicCondition implements Condition {
    private String factType;
    private String factId;
    private String attributeName;
    private ComparisonOperator operator;
    private Object value;
    
    public AtomicCondition(String factType, String attributeName, 
                          ComparisonOperator operator, Object value) {
        this.factType = factType;
        this.attributeName = attributeName;
        this.operator = operator;
        this.value = value;
    }
    
    @Override
    public boolean evaluate(FactContext context) {
        Fact fact = context.getFact(factType, factId);
        if (fact == null) {
            return false;
        }
        
        Object factValue = fact.getAttribute(attributeName);
        if (factValue == null) {
            return false;
        }
        
        return operator.compare(factValue, value);
    }
    
    // Getter和Setter方法
    public String getFactType() { return factType; }
    public String getAttributeName() { return attributeName; }
    public ComparisonOperator getOperator() { return operator; }
    public Object getValue() { return value; }
}

// 复合条件
public class CompositeCondition implements Condition {
    private LogicalOperator operator;
    private List<Condition> conditions;
    
    public CompositeCondition(LogicalOperator operator) {
        this.operator = operator;
        this.conditions = new ArrayList<>();
    }
    
    public void addCondition(Condition condition) {
        conditions.add(condition);
    }
    
    @Override
    public boolean evaluate(FactContext context) {
        if (conditions.isEmpty()) {
            return true;
        }
        
        switch (operator) {
            case AND:
                for (Condition condition : conditions) {
                    if (!condition.evaluate(context)) {
                        return false;
                    }
                }
                return true;
                
            case OR:
                for (Condition condition : conditions) {
                    if (condition.evaluate(context)) {
                        return true;
                    }
                }
                return false;
                
            case NOT:
                return conditions.isEmpty() || !conditions.get(0).evaluate(context);
                
            default:
                return false;
        }
    }
    
    public LogicalOperator getOperator() { return operator; }
    public List<Condition> getConditions() { return new ArrayList<>(conditions); }
}

// 比较操作符
public enum ComparisonOperator {
    EQUAL("=") {
        @Override
        public boolean compare(Object left, Object right) {
            if (left == null && right == null) return true;
            if (left == null || right == null) return false;
            return left.equals(right);
        }
    },
    NOT_EQUAL("!=") {
        @Override
        public boolean compare(Object left, Object right) {
            if (left == null && right == null) return false;
            if (left == null || right == null) return true;
            return !left.equals(right);
        }
    },
    GREATER_THAN(">") {
        @Override
        public boolean compare(Object left, Object right) {
            if (left instanceof Number && right instanceof Number) {
                return ((Number) left).doubleValue() > ((Number) right).doubleValue();
            }
            return false;
        }
    },
    LESS_THAN("<") {
        @Override
        public boolean compare(Object left, Object right) {
            if (left instanceof Number && right instanceof Number) {
                return ((Number) left).doubleValue() < ((Number) right).doubleValue();
            }
            return false;
        }
    },
    GREATER_THAN_EQUAL(">=") {
        @Override
        public boolean compare(Object left, Object right) {
            if (left instanceof Number && right instanceof Number) {
                return ((Number) left).doubleValue() >= ((Number) right).doubleValue();
            }
            return false;
        }
    },
    LESS_THAN_EQUAL("<=") {
        @Override
        public boolean compare(Object left, Object right) {
            if (left instanceof Number && right instanceof Number) {
                return ((Number) left).doubleValue() <= ((Number) right).doubleValue();
            }
            return false;
        }
    },
    CONTAINS("contains") {
        @Override
        public boolean compare(Object left, Object right) {
            if (left instanceof String && right instanceof String) {
                return ((String) left).contains((String) right);
            }
            return false;
        }
    };
    
    private final String symbol;
    
    ComparisonOperator(String symbol) {
        this.symbol = symbol;
    }
    
    public abstract boolean compare(Object left, Object right);
    
    public String getSymbol() {
        return symbol;
    }
}

// 逻辑操作符
public enum LogicalOperator {
    AND, OR, NOT
}

// 动作接口
public interface Action {
    ActionResult execute(FactContext context);
}

// 动作结果
public class ActionResult {
    private String actionId;
    private boolean success;
    private String message;
    private Map<String, Object> resultData;
    private boolean breakExecution;
    
    public ActionResult(String actionId, boolean success, String message) {
        this.actionId = actionId;
        this.success = success;
        this.message = message;
        this.resultData = new HashMap<>();
        this.breakExecution = false;
    }
    
    // Getter和Setter方法
    public String getActionId() { return actionId; }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Map<String, Object> getResultData() { return new HashMap<>(resultData); }
    public void setResultData(String key, Object value) { resultData.put(key, value); }
    public boolean isBreakExecution() { return breakExecution; }
    public void setBreakExecution(boolean breakExecution) { this.breakExecution = breakExecution; }
}
```

### 3.2 规则管理与执行

#### 3.2.1 规则引擎核心

**规则引擎实现**：
```java
// 规则引擎
public class RuleEngine {
    private RuleRepository ruleRepository;
    private RuleEvaluator ruleEvaluator;
    private ActionExecutor actionExecutor;
    private RuleEngineMetrics metrics;
    
    public RuleEngine(RuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
        this.ruleEvaluator = new RuleEvaluator();
        this.actionExecutor = new ActionExecutor();
        this.metrics = new RuleEngineMetrics();
    }
    
    public RuleEngineResult executeRules(FactContext context, String ruleSetId) {
        long startTime = System.currentTimeMillis();
        
        try {
            // 获取规则集
            RuleSet ruleSet = ruleRepository.getRuleSet(ruleSetId);
            if (ruleSet == null) {
                throw new RuleEngineException("RuleSet not found: " + ruleSetId);
            }
            
            // 按优先级排序规则
            List<Rule> sortedRules = ruleSet.getRules().stream()
                .sorted(Comparator.comparingInt(Rule::getPriority).reversed())
                .collect(Collectors.toList());
            
            List<RuleExecutionResult> executionResults = new ArrayList<>();
            
            // 依次执行规则
            for (Rule rule : sortedRules) {
                if (!rule.isEnabled()) {
                    continue;
                }
                
                long ruleStartTime = System.currentTimeMillis();
                boolean conditionMatched = false;
                List<ActionResult> actionResults = new ArrayList<>();
                
                try {
                    // 评估条件
                    conditionMatched = ruleEvaluator.evaluate(rule, context);
                    metrics.recordRuleEvaluation(rule.getId(), System.currentTimeMillis() - ruleStartTime);
                    
                    if (conditionMatched) {
                        // 执行动作
                        long actionStartTime = System.currentTimeMillis();
                        actionResults = actionExecutor.execute(rule, context);
                        metrics.recordActionExecution(rule.getId(), System.currentTimeMillis() - actionStartTime);
                    }
                } catch (Exception e) {
                    metrics.recordRuleError(rule.getId());
                    // 记录错误但继续执行其他规则
                    System.err.println("Error executing rule " + rule.getId() + ": " + e.getMessage());
                }
                
                // 记录执行结果
                executionResults.add(new RuleExecutionResult(
                    rule.getId(), 
                    rule.getName(), 
                    conditionMatched, 
                    actionResults,
                    System.currentTimeMillis() - ruleStartTime
                ));
                
                // 将动作结果添加到上下文
                actionResults.forEach(context::addExecutionResult);
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            metrics.recordEngineExecution(totalTime);
            
            return new RuleEngineResult(
                ruleSetId,
                executionResults,
                totalTime,
                true,
                null
            );
            
        } catch (Exception e) {
            long totalTime = System.currentTimeMillis() - startTime;
            metrics.recordEngineError();
            
            return new RuleEngineResult(
                ruleSetId,
                new ArrayList<>(),
                totalTime,
                false,
                e.getMessage()
            );
        }
    }
    
    // 批量执行规则
    public List<RuleEngineResult> executeRulesBatch(List<FactContext> contexts, String ruleSetId) {
        return contexts.parallelStream()
            .map(context -> executeRules(context, ruleSetId))
            .collect(Collectors.toList());
    }
    
    // 获取引擎指标
    public RuleEngineMetrics getMetrics() {
        return metrics;
    }
    
    // 重置指标
    public void resetMetrics() {
        metrics.reset();
    }
}

// 规则评估器
public class RuleEvaluator {
    public boolean evaluate(Rule rule, FactContext context) {
        return rule.evaluate(context);
    }
}

// 动作执行器
public class ActionExecutor {
    public List<ActionResult> execute(Rule rule, FactContext context) {
        return rule.execute(context);
    }
}

// 规则执行结果
public class RuleExecutionResult {
    private String ruleId;
    private String ruleName;
    private boolean conditionMatched;
    private List<ActionResult> actionResults;
    private long executionTime;
    
    public RuleExecutionResult(String ruleId, String ruleName, boolean conditionMatched, 
                              List<ActionResult> actionResults, long executionTime) {
        this.ruleId = ruleId;
        this.ruleName = ruleName;
        this.conditionMatched = conditionMatched;
        this.actionResults = actionResults != null ? actionResults : new ArrayList<>();
        this.executionTime = executionTime;
    }
    
    // Getter方法
    public String getRuleId() { return ruleId; }
    public String getRuleName() { return ruleName; }
    public boolean isConditionMatched() { return conditionMatched; }
    public List<ActionResult> getActionResults() { return new ArrayList<>(actionResults); }
    public long getExecutionTime() { return executionTime; }
    public boolean hasActions() { return !actionResults.isEmpty(); }
}

// 规则引擎结果
public class RuleEngineResult {
    private String ruleSetId;
    private List<RuleExecutionResult> ruleResults;
    private long executionTime;
    private boolean success;
    private String errorMessage;
    
    public RuleEngineResult(String ruleSetId, List<RuleExecutionResult> ruleResults, 
                           long executionTime, boolean success, String errorMessage) {
        this.ruleSetId = ruleSetId;
        this.ruleResults = ruleResults != null ? ruleResults : new ArrayList<>();
        this.executionTime = executionTime;
        this.success = success;
        this.errorMessage = errorMessage;
    }
    
    // Getter方法
    public String getRuleSetId() { return ruleSetId; }
    public List<RuleExecutionResult> getRuleResults() { return new ArrayList<>(ruleResults); }
    public long getExecutionTime() { return executionTime; }
    public boolean isSuccess() { return success; }
    public String getErrorMessage() { return errorMessage; }
    
    // 便利方法
    public List<RuleExecutionResult> getMatchedRules() {
        return ruleResults.stream()
            .filter(RuleExecutionResult::isConditionMatched)
            .collect(Collectors.toList());
    }
    
    public List<ActionResult> getAllActionResults() {
        return ruleResults.stream()
            .flatMap(result -> result.getActionResults().stream())
            .collect(Collectors.toList());
    }
}

// 规则引擎异常
public class RuleEngineException extends RuntimeException {
    public RuleEngineException(String message) {
        super(message);
    }
    
    public RuleEngineException(String message, Throwable cause) {
        super(message, cause);
    }
}

// 规则引擎指标
public class RuleEngineMetrics {
    private final AtomicLong totalExecutions = new AtomicLong(0);
    private final AtomicLong totalErrors = new AtomicLong(0);
    private final AtomicLong totalRuleEvaluations = new AtomicLong(0);
    private final AtomicLong totalRuleErrors = new AtomicLong(0);
    private final AtomicLong totalActionExecutions = new AtomicLong(0);
    private final AtomicLong totalExecutionTime = new AtomicLong(0);
    private final Map<String, AtomicLong> ruleEvaluationTimes = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> ruleErrorCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> actionExecutionTimes = new ConcurrentHashMap<>();
    
    public void recordEngineExecution(long executionTime) {
        totalExecutions.incrementAndGet();
        totalExecutionTime.addAndGet(executionTime);
    }
    
    public void recordEngineError() {
        totalErrors.incrementAndGet();
    }
    
    public void recordRuleEvaluation(String ruleId, long evaluationTime) {
        totalRuleEvaluations.incrementAndGet();
        ruleEvaluationTimes.computeIfAbsent(ruleId, k -> new AtomicLong(0))
            .addAndGet(evaluationTime);
    }
    
    public void recordRuleError(String ruleId) {
        totalRuleErrors.incrementAndGet();
        ruleErrorCounts.computeIfAbsent(ruleId, k -> new AtomicLong(0))
            .incrementAndGet();
    }
    
    public void recordActionExecution(String ruleId, long executionTime) {
        totalActionExecutions.incrementAndGet();
        actionExecutionTimes.computeIfAbsent(ruleId, k -> new AtomicLong(0))
            .addAndGet(executionTime);
    }
    
    public void reset() {
        totalExecutions.set(0);
        totalErrors.set(0);
        totalRuleEvaluations.set(0);
        totalRuleErrors.set(0);
        totalActionExecutions.set(0);
        totalExecutionTime.set(0);
        ruleEvaluationTimes.clear();
        ruleErrorCounts.clear();
        actionExecutionTimes.clear();
    }
    
    // Getter方法
    public long getTotalExecutions() { return totalExecutions.get(); }
    public long getTotalErrors() { return totalErrors.get(); }
    public long getTotalRuleEvaluations() { return totalRuleEvaluations.get(); }
    public long getTotalRuleErrors() { return totalRuleErrors.get(); }
    public long getTotalActionExecutions() { return totalActionExecutions.get(); }
    public long getTotalExecutionTime() { return totalExecutionTime.get(); }
    public double getAverageExecutionTime() {
        long executions = totalExecutions.get();
        return executions > 0 ? (double) totalExecutionTime.get() / executions : 0;
    }
}
```

#### 3.2.2 规则存储与管理

**规则存储**：
```java
// 规则存储接口
public interface RuleRepository {
    void saveRule(Rule rule);
    Rule getRule(String ruleId);
    List<Rule> getRulesByCategory(String category);
    List<Rule> getRulesByTag(String tag);
    void deleteRule(String ruleId);
    void updateRule(Rule rule);
    
    void saveRuleSet(RuleSet ruleSet);
    RuleSet getRuleSet(String ruleSetId);
    List<RuleSet> getAllRuleSets();
    void deleteRuleSet(String ruleSetId);
    void updateRuleSet(RuleSet ruleSet);
}

// 规则集
public class RuleSet {
    private String id;
    private String name;
    private String description;
    private List<Rule> rules;
    private Map<String, Object> metadata;
    private long createdAt;
    private long updatedAt;
    private boolean enabled;
    
    public RuleSet(String id, String name) {
        this.id = id;
        this.name = name;
        this.rules = new ArrayList<>();
        this.metadata = new HashMap<>();
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
        this.enabled = true;
    }
    
    public void addRule(Rule rule) {
        if (!rules.contains(rule)) {
            rules.add(rule);
            this.updatedAt = System.currentTimeMillis();
        }
    }
    
    public void removeRule(Rule rule) {
        if (rules.remove(rule)) {
            this.updatedAt = System.currentTimeMillis();
        }
    }
    
    public Rule getRule(String ruleId) {
        return rules.stream()
            .filter(rule -> rule.getId().equals(ruleId))
            .findFirst()
            .orElse(null);
    }
    
    // Getter和Setter方法
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { 
        this.description = description; 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public List<Rule> getRules() { return new ArrayList<>(rules); }
    public Map<String, Object> getMetadata() { return new HashMap<>(metadata); }
    public void setMetadata(String key, Object value) { 
        this.metadata.put(key, value); 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public long getCreatedAt() { return createdAt; }
    public long getUpdatedAt() { return updatedAt; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { 
        this.enabled = enabled; 
        this.updatedAt = System.currentTimeMillis();
    }
}

// 内存规则存储实现
public class InMemoryRuleRepository implements RuleRepository {
    private final Map<String, Rule> ruleStore = new ConcurrentHashMap<>();
    private final Map<String, RuleSet> ruleSetStore = new ConcurrentHashMap<>();
    private final Map<String, List<String>> categoryIndex = new ConcurrentHashMap<>();
    private final Map<String, List<String>> tagIndex = new ConcurrentHashMap<>();
    
    @Override
    public void saveRule(Rule rule) {
        ruleStore.put(rule.getId(), rule);
        
        // 更新索引
        if (rule.getCategory() != null) {
            categoryIndex.computeIfAbsent(rule.getCategory(), k -> new ArrayList<>())
                .add(rule.getId());
        }
        
        for (String tag : rule.getTags()) {
            tagIndex.computeIfAbsent(tag, k -> new ArrayList<>())
                .add(rule.getId());
        }
    }
    
    @Override
    public Rule getRule(String ruleId) {
        return ruleStore.get(ruleId);
    }
    
    @Override
    public List<Rule> getRulesByCategory(String category) {
        List<String> ruleIds = categoryIndex.get(category);
        if (ruleIds == null) {
            return new ArrayList<>();
        }
        
        return ruleIds.stream()
            .map(this::getRule)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Rule> getRulesByTag(String tag) {
        List<String> ruleIds = tagIndex.get(tag);
        if (ruleIds == null) {
            return new ArrayList<>();
        }
        
        return ruleIds.stream()
            .map(this::getRule)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    @Override
    public void deleteRule(String ruleId) {
        Rule rule = ruleStore.remove(ruleId);
        if (rule != null) {
            // 更新索引
            if (rule.getCategory() != null) {
                List<String> categoryRules = categoryIndex.get(rule.getCategory());
                if (categoryRules != null) {
                    categoryRules.remove(ruleId);
                }
            }
            
            for (String tag : rule.getTags()) {
                List<String> tagRules = tagIndex.get(tag);
                if (tagRules != null) {
                    tagRules.remove(ruleId);
                }
            }
        }
    }
    
    @Override
    public void updateRule(Rule rule) {
        saveRule(rule);
    }
    
    @Override
    public void saveRuleSet(RuleSet ruleSet) {
        ruleSetStore.put(ruleSet.getId(), ruleSet);
    }
    
    @Override
    public RuleSet getRuleSet(String ruleSetId) {
        return ruleSetStore.get(ruleSetId);
    }
    
    @Override
    public List<RuleSet> getAllRuleSets() {
        return new ArrayList<>(ruleSetStore.values());
    }
    
    @Override
    public void deleteRuleSet(String ruleSetId) {
        ruleSetStore.remove(ruleSetId);
    }
    
    @Override
    public void updateRuleSet(RuleSet ruleSet) {
        saveRuleSet(ruleSet);
    }
}
```

## 四、规则集（RuleSet）设计

### 4.1 规则集组织与管理

#### 4.1.1 规则集结构设计

**规则集管理器**：
```java
// 规则集管理器
public class RuleSetManager {
    private RuleRepository ruleRepository;
    private RuleSetValidator ruleSetValidator;
    private RuleSetCompiler ruleSetCompiler;
    
    public RuleSetManager(RuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
        this.ruleSetValidator = new RuleSetValidator();
        this.ruleSetCompiler = new RuleSetCompiler();
    }
    
    public RuleSet createRuleSet(String id, String name, String description) {
        RuleSet ruleSet = new RuleSet(id, name);
        ruleSet.setDescription(description);
        return ruleSet;
    }
    
    public void addRuleToRuleSet(String ruleSetId, Rule rule) {
        RuleSet ruleSet = ruleRepository.getRuleSet(ruleSetId);
        if (ruleSet == null) {
            throw new RuleEngineException("RuleSet not found: " + ruleSetId);
        }
        
        ruleSet.addRule(rule);
        ruleRepository.updateRuleSet(ruleSet);
    }
    
    public void removeRuleFromRuleSet(String ruleSetId, String ruleId) {
        RuleSet ruleSet = ruleRepository.getRuleSet(ruleSetId);
        if (ruleSet == null) {
            throw new RuleEngineException("RuleSet not found: " + ruleSetId);
        }
        
        Rule rule = ruleRepository.getRule(ruleId);
        if (rule == null) {
            throw new RuleEngineException("Rule not found: " + ruleId);
        }
        
        ruleSet.removeRule(rule);
        ruleRepository.updateRuleSet(ruleSet);
    }
    
    public boolean validateRuleSet(String ruleSetId) {
        RuleSet ruleSet = ruleRepository.getRuleSet(ruleSetId);
        if (ruleSet == null) {
            throw new RuleEngineException("RuleSet not found: " + ruleSetId);
        }
        
        return ruleSetValidator.validate(ruleSet);
    }
    
    public CompiledRuleSet compileRuleSet(String ruleSetId) {
        RuleSet ruleSet = ruleRepository.getRuleSet(ruleSetId);
        if (ruleSet == null) {
            throw new RuleEngineException("RuleSet not found: " + ruleSetId);
        }
        
        if (!ruleSetValidator.validate(ruleSet)) {
            throw new RuleEngineException("RuleSet validation failed: " + ruleSetId);
        }
        
        return ruleSetCompiler.compile(ruleSet);
    }
    
    public List<Rule> getRulesByPriority(String ruleSetId) {
        RuleSet ruleSet = ruleRepository.getRuleSet(ruleSetId);
        if (ruleSet == null) {
            throw new RuleEngineException("RuleSet not found: " + ruleSetId);
        }
        
        return ruleSet.getRules().stream()
            .sorted(Comparator.comparingInt(Rule::getPriority).reversed())
            .collect(Collectors.toList());
    }
    
    public void setRulePriority(String ruleSetId, String ruleId, int priority) {
        RuleSet ruleSet = ruleRepository.getRuleSet(ruleSetId);
        if (ruleSet == null) {
            throw new RuleEngineException("RuleSet not found: " + ruleSetId);
        }
        
        Rule rule = ruleSet.getRule(ruleId);
        if (rule == null) {
            throw new RuleEngineException("Rule not found: " + ruleId);
        }
        
        rule.setPriority(priority);
        ruleRepository.updateRuleSet(ruleSet);
    }
    
    public List<RuleSet> searchRuleSets(String keyword) {
        return ruleRepository.getAllRuleSets().stream()
            .filter(ruleSet -> 
                ruleSet.getName().contains(keyword) || 
                (ruleSet.getDescription() != null && ruleSet.getDescription().contains(keyword))
            )
            .collect(Collectors.toList());
    }
}

// 规则集验证器
public class RuleSetValidator {
    public boolean validate(RuleSet ruleSet) {
        if (ruleSet == null) {
            return false;
        }
        
        // 检查规则集ID和名称
        if (ruleSet.getId() == null || ruleSet.getId().isEmpty()) {
            return false;
        }
        
        if (ruleSet.getName() == null || ruleSet.getName().isEmpty()) {
            return false;
        }
        
        // 检查规则
        for (Rule rule : ruleSet.getRules()) {
            if (!validateRule(rule)) {
                return false;
            }
        }
        
        // 检查循环依赖
        if (hasCircularDependency(ruleSet)) {
            return false;
        }
        
        return true;
    }
    
    private boolean validateRule(Rule rule) {
        if (rule == null) {
            return false;
        }
        
        if (rule.getId() == null || rule.getId().isEmpty()) {
            return false;
        }
        
        if (rule.getName() == null || rule.getName().isEmpty()) {
            return false;
        }
        
        // 对于条件规则，检查条件和动作
        if (rule instanceof ConditionalRule) {
            ConditionalRule conditionalRule = (ConditionalRule) rule;
            if (conditionalRule.getCondition() == null) {
                return false;
            }
        }
        
        return true;
    }
    
    private boolean hasCircularDependency(RuleSet ruleSet) {
        // 简化实现，实际应该检查规则间的依赖关系
        return false;
    }
}

// 规则集编译器
public class RuleSetCompiler {
    public CompiledRuleSet compile(RuleSet ruleSet) {
        // 按优先级排序规则
        List<Rule> sortedRules = ruleSet.getRules().stream()
            .sorted(Comparator.comparingInt(Rule::getPriority).reversed())
            .collect(Collectors.toList());
        
        // 编译规则条件和动作
        List<CompiledRule> compiledRules = sortedRules.stream()
            .map(this::compileRule)
            .collect(Collectors.toList());
        
        return new CompiledRuleSet(ruleSet.getId(), ruleSet.getName(), compiledRules);
    }
    
    private CompiledRule compileRule(Rule rule) {
        // 简化实现，实际应该编译成更高效的执行代码
        return new CompiledRule(rule.getId(), rule.getName(), rule);
    }
}

// 编译后的规则集
public class CompiledRuleSet {
    private String id;
    private String name;
    private List<CompiledRule> rules;
    
    public CompiledRuleSet(String id, String name, List<CompiledRule> rules) {
        this.id = id;
        this.name = name;
        this.rules = rules != null ? rules : new ArrayList<>();
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public List<CompiledRule> getRules() { return new ArrayList<>(rules); }
}

// 编译后的规则
public class CompiledRule {
    private String id;
    private String name;
    private Rule originalRule;
    
    public CompiledRule(String id, String name, Rule originalRule) {
        this.id = id;
        this.name = name;
        this.originalRule = originalRule;
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public Rule getOriginalRule() { return originalRule; }
}
```

### 4.2 规则集版本管理

#### 4.2.1 版本控制机制

**规则集版本管理**：
```java
// 规则集版本管理器
public class RuleSetVersionManager {
    private RuleRepository ruleRepository;
    private VersionStorage versionStorage;
    
    public RuleSetVersionManager(RuleRepository ruleRepository, VersionStorage versionStorage) {
        this.ruleRepository = ruleRepository;
        this.versionStorage = versionStorage;
    }
    
    public String createVersion(String ruleSetId, String version, String description) {
        RuleSet ruleSet = ruleRepository.getRuleSet(ruleSetId);
        if (ruleSet == null) {
            throw new RuleEngineException("RuleSet not found: " + ruleSetId);
        }
        
        // 创建版本快照
        RuleSetVersion versionSnapshot = new RuleSetVersion(
            ruleSetId, 
            version, 
            description, 
            ruleSet,
            System.currentTimeMillis()
        );
        
        // 保存版本
        versionStorage.saveVersion(versionSnapshot);
        
        return version;
    }
    
    public RuleSet getVersion(String ruleSetId, String version) {
        RuleSetVersion versionSnapshot = versionStorage.getVersion(ruleSetId, version);
        if (versionSnapshot == null) {
            return null;
        }
        
        return versionSnapshot.getRuleSet();
    }
    
    public List<RuleSetVersion> getVersionHistory(String ruleSetId) {
        return versionStorage.getVersionHistory(ruleSetId);
    }
    
    public boolean rollbackToVersion(String ruleSetId, String version) {
        RuleSetVersion versionSnapshot = versionStorage.getVersion(ruleSetId, version);
        if (versionSnapshot == null) {
            return false;
        }
        
        // 恢复规则集
        RuleSet ruleSet = versionSnapshot.getRuleSet();
        ruleRepository.updateRuleSet(ruleSet);
        
        return true;
    }
    
    public List<String> listVersions(String ruleSetId) {
        return versionStorage.getVersionHistory(ruleSetId).stream()
            .map(RuleSetVersion::getVersion)
            .collect(Collectors.toList());
    }
    
    public void deleteVersion(String ruleSetId, String version) {
        versionStorage.deleteVersion(ruleSetId, version);
    }
}

// 规则集版本
public class RuleSetVersion {
    private String ruleSetId;
    private String version;
    private String description;
    private RuleSet ruleSet;
    private long createdAt;
    private String createdBy;
    
    public RuleSetVersion(String ruleSetId, String version, String description, 
                         RuleSet ruleSet, long createdAt) {
        this.ruleSetId = ruleSetId;
        this.version = version;
        this.description = description;
        this.ruleSet = ruleSet;
        this.createdAt = createdAt;
    }
    
    // Getter方法
    public String getRuleSetId() { return ruleSetId; }
    public String getVersion() { return version; }
    public String getDescription() { return description; }
    public RuleSet getRuleSet() { return ruleSet; }
    public long getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}

// 版本存储接口
public interface VersionStorage {
    void saveVersion(RuleSetVersion version);
    RuleSetVersion getVersion(String ruleSetId, String version);
    List<RuleSetVersion> getVersionHistory(String ruleSetId);
    void deleteVersion(String ruleSetId, String version);
}

// 内存版本存储实现
public class InMemoryVersionStorage implements VersionStorage {
    private final Map<String, List<RuleSetVersion>> versionHistory = new ConcurrentHashMap<>();
    
    @Override
    public void saveVersion(RuleSetVersion version) {
        String key = generateKey(version.getRuleSetId());
        versionHistory.computeIfAbsent(key, k -> new ArrayList<>()).add(version);
        
        // 按时间排序
        versionHistory.get(key).sort(Comparator.comparingLong(RuleSetVersion::getCreatedAt));
    }
    
    @Override
    public RuleSetVersion getVersion(String ruleSetId, String version) {
        String key = generateKey(ruleSetId);
        List<RuleSetVersion> versions = versionHistory.get(key);
        if (versions == null) {
            return null;
        }
        
        return versions.stream()
            .filter(v -> v.getVersion().equals(version))
            .findFirst()
            .orElse(null);
    }
    
    @Override
    public List<RuleSetVersion> getVersionHistory(String ruleSetId) {
        String key = generateKey(ruleSetId);
        List<RuleSetVersion> versions = versionHistory.get(key);
        return versions != null ? new ArrayList<>(versions) : new ArrayList<>();
    }
    
    @Override
    public void deleteVersion(String ruleSetId, String version) {
        String key = generateKey(ruleSetId);
        List<RuleSetVersion> versions = versionHistory.get(key);
        if (versions != null) {
            versions.removeIf(v -> v.getVersion().equals(version));
        }
    }
    
    private String generateKey(String ruleSetId) {
        return "ruleSet:" + ruleSetId;
    }
}
```

## 五、决策流（Decision Flow）设计

### 5.1 决策流结构与执行

#### 5.1.1 决策流模型

**决策流设计**：
```java
// 决策流节点
public abstract class DecisionNode {
    protected String id;
    protected String name;
    protected String description;
    protected Map<String, Object> metadata;
    protected List<DecisionNode> nextNodes;
    
    public DecisionNode(String id, String name) {
        this.id = id;
        this.name = name;
        this.metadata = new HashMap<>();
        this.nextNodes = new ArrayList<>();
    }
    
    // 抽象执行方法
    public abstract DecisionNodeResult execute(FactContext context);
    
    // 添加下一个节点
    public void addNextNode(DecisionNode node) {
        if (!nextNodes.contains(node)) {
            nextNodes.add(node);
        }
    }
    
    // 移除下一个节点
    public void removeNextNode(DecisionNode node) {
        nextNodes.remove(node);
    }
    
    // Getter和Setter方法
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Map<String, Object> getMetadata() { return new HashMap<>(metadata); }
    public void setMetadata(String key, Object value) { metadata.put(key, value); }
    public List<DecisionNode> getNextNodes() { return new ArrayList<>(nextNodes); }
}

// 规则集节点
public class RuleSetNode extends DecisionNode {
    private String ruleSetId;
    private RuleEngine ruleEngine;
    
    public RuleSetNode(String id, String name, String ruleSetId, RuleEngine ruleEngine) {
        super(id, name);
        this.ruleSetId = ruleSetId;
        this.ruleEngine = ruleEngine;
    }
    
    @Override
    public DecisionNodeResult execute(FactContext context) {
        try {
            RuleEngineResult result = ruleEngine.executeRules(context, ruleSetId);
            
            return new DecisionNodeResult(
                getId(),
                getName(),
                result.isSuccess(),
                result.getErrorMessage(),
                result
            );
        } catch (Exception e) {
            return new DecisionNodeResult(
                getId(),
                getName(),
                false,
                e.getMessage(),
                null
            );
        }
    }
    
    public String getRuleSetId() { return ruleSetId; }
}

// 条件分支节点
public class ConditionalNode extends DecisionNode {
    private Condition condition;
    private DecisionNode trueBranch;
    private DecisionNode falseBranch;
    
    public ConditionalNode(String id, String name) {
        super(id, name);
    }
    
    @Override
    public DecisionNodeResult execute(FactContext context) {
        boolean conditionResult = condition != null && condition.evaluate(context);
        
        DecisionNode nextNode = conditionResult ? trueBranch : falseBranch;
        if (nextNode != null) {
            DecisionNodeResult result = nextNode.execute(context);
            return new DecisionNodeResult(
                getId(),
                getName(),
                true,
                null,
                result
            );
        }
        
        return new DecisionNodeResult(
            getId(),
            getName(),
            true,
            null,
            null
        );
    }
    
    public void setCondition(Condition condition) { this.condition = condition; }
    public void setTrueBranch(DecisionNode node) { this.trueBranch = node; }
    public void setFalseBranch(DecisionNode node) { this.falseBranch = node; }
    public Condition getCondition() { return condition; }
    public DecisionNode getTrueBranch() { return trueBranch; }
    public DecisionNode getFalseBranch() { return falseBranch; }
}

// 并行执行节点
public class ParallelNode extends DecisionNode {
    private List<DecisionNode> parallelNodes;
    private ParallelExecutionMode executionMode;
    
    public ParallelNode(String id, String name) {
        super(id, name);
        this.parallelNodes = new ArrayList<>();
        this.executionMode = ParallelExecutionMode.ALL;
    }
    
    @Override
    public DecisionNodeResult execute(FactContext context) {
        List<CompletableFuture<DecisionNodeResult>> futures = new ArrayList<>();
        
        // 并行执行所有子节点
        for (DecisionNode node : parallelNodes) {
            CompletableFuture<DecisionNodeResult> future = CompletableFuture.supplyAsync(() -> {
                return node.execute(context);
            });
            futures.add(future);
        }
        
        try {
            // 等待所有任务完成
            List<DecisionNodeResult> results = CompletableFuture.allOf(
                futures.toArray(new CompletableFuture[0])
            ).thenApply(v -> 
                futures.stream()
                    .map(CompletableFuture::join)
                    .collect(Collectors.toList())
            ).get();
            
            return new DecisionNodeResult(
                getId(),
                getName(),
                true,
                null,
                results
            );
        } catch (Exception e) {
            return new DecisionNodeResult(
                getId(),
                getName(),
                false,
                e.getMessage(),
                null
            );
        }
    }
    
    public void addParallelNode(DecisionNode node) {
        parallelNodes.add(node);
    }
    
    public List<DecisionNode> getParallelNodes() {
        return new ArrayList<>(parallelNodes);
    }
    
    public void setExecutionMode(ParallelExecutionMode mode) {
        this.executionMode = mode;
    }
    
    public ParallelExecutionMode getExecutionMode() {
        return executionMode;
    }
}

// 并行执行模式
public enum ParallelExecutionMode {
    ALL,      // 等待所有任务完成
    ANY,      // 任意一个任务完成即可
    MAJORITY  // 大多数任务完成
}

// 决策节点结果
public class DecisionNodeResult {
    private String nodeId;
    private String nodeName;
    private boolean success;
    private String errorMessage;
    private Object resultData;
    private List<DecisionNodeResult> childResults;
    
    public DecisionNodeResult(String nodeId, String nodeName, boolean success, 
                             String errorMessage, Object resultData) {
        this.nodeId = nodeId;
        this.nodeName = nodeName;
        this.success = success;
        this.errorMessage = errorMessage;
        this.resultData = resultData;
        this.childResults = new ArrayList<>();
    }
    
    public void addChildResult(DecisionNodeResult childResult) {
        childResults.add(childResult);
    }
    
    // Getter方法
    public String getNodeId() { return nodeId; }
    public String getNodeName() { return nodeName; }
    public boolean isSuccess() { return success; }
    public String getErrorMessage() { return errorMessage; }
    public Object getResultData() { return resultData; }
    public List<DecisionNodeResult> getChildResults() { return new ArrayList<>(childResults); }
    public boolean hasChildResults() { return !childResults.isEmpty(); }
}

// 决策流
public class DecisionFlow {
    private String id;
    private String name;
    private String description;
    private DecisionNode startNode;
    private Map<String, Object> metadata;
    private long createdAt;
    private long updatedAt;
    private boolean enabled;
    
    public DecisionFlow(String id, String name) {
        this.id = id;
        this.name = name;
        this.metadata = new HashMap<>();
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
        this.enabled = true;
    }
    
    public DecisionFlowResult execute(FactContext context) {
        long startTime = System.currentTimeMillis();
        
        if (!enabled) {
            return new DecisionFlowResult(
                id,
                name,
                false,
                "Decision flow is disabled",
                null,
                System.currentTimeMillis() - startTime
            );
        }
        
        if (startNode == null) {
            return new DecisionFlowResult(
                id,
                name,
                false,
                "No start node defined",
                null,
                System.currentTimeMillis() - startTime
            );
        }
        
        try {
            DecisionNodeResult result = startNode.execute(context);
            
            return new DecisionFlowResult(
                id,
                name,
                true,
                null,
                result,
                System.currentTimeMillis() - startTime
            );
        } catch (Exception e) {
            return new DecisionFlowResult(
                id,
                name,
                false,
                e.getMessage(),
                null,
                System.currentTimeMillis() - startTime
            );
        }
    }
    
    // Getter和Setter方法
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { 
        this.description = description; 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public DecisionNode getStartNode() { return startNode; }
    public void setStartNode(DecisionNode startNode) { 
        this.startNode = startNode; 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public Map<String, Object> getMetadata() { return new HashMap<>(metadata); }
    public void setMetadata(String key, Object value) { 
        this.metadata.put(key, value); 
        this.updatedAt = System.currentTimeMillis();
    }
    
    public long getCreatedAt() { return createdAt; }
    public long getUpdatedAt() { return updatedAt; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { 
        this.enabled = enabled; 
        this.updatedAt = System.currentTimeMillis();
    }
}

// 决策流结果
public class DecisionFlowResult {
    private String flowId;
    private String flowName;
    private boolean success;
    private String errorMessage;
    private DecisionNodeResult rootNodeResult;
    private long executionTime;
    
    public DecisionFlowResult(String flowId, String flowName, boolean success, 
                             String errorMessage, DecisionNodeResult rootNodeResult, 
                             long executionTime) {
        this.flowId = flowId;
        this.flowName = flowName;
        this.success = success;
        this.errorMessage = errorMessage;
        this.rootNodeResult = rootNodeResult;
        this.executionTime = executionTime;
    }
    
    // Getter方法
    public String getFlowId() { return flowId; }
    public String getFlowName() { return flowName; }
    public boolean isSuccess() { return success; }
    public String getErrorMessage() { return errorMessage; }
    public DecisionNodeResult getRootNodeResult() { return rootNodeResult; }
    public long getExecutionTime() { return executionTime; }
    
    public List<DecisionNodeResult> getAllResults() {
        List<DecisionNodeResult> allResults = new ArrayList<>();
        collectResults(rootNodeResult, allResults);
        return allResults;
    }
    
    private void collectResults(DecisionNodeResult result, List<DecisionNodeResult> results) {
        if (result != null) {
            results.add(result);
            for (DecisionNodeResult child : result.getChildResults()) {
                collectResults(child, results);
            }
        }
    }
}
```

### 5.2 决策流管理与编排

#### 5.2.1 决策流编排器

**决策流管理**：
```java
// 决策流管理器
public class DecisionFlowManager {
    private DecisionFlowRepository flowRepository;
    private RuleEngine ruleEngine;
    private DecisionFlowValidator flowValidator;
    private DecisionFlowCompiler flowCompiler;
    
    public DecisionFlowManager(DecisionFlowRepository flowRepository, RuleEngine ruleEngine) {
        this.flowRepository = flowRepository;
        this.ruleEngine = ruleEngine;
        this.flowValidator = new DecisionFlowValidator();
        this.flowCompiler = new DecisionFlowCompiler();
    }
    
    public DecisionFlow createDecisionFlow(String id, String name, String description) {
        DecisionFlow flow = new DecisionFlow(id, name);
        flow.setDescription(description);
        return flow;
    }
    
    public void saveDecisionFlow(DecisionFlow flow) {
        if (!flowValidator.validate(flow)) {
            throw new RuleEngineException("Decision flow validation failed");
        }
        
        flowRepository.saveFlow(flow);
    }
    
    public DecisionFlow getDecisionFlow(String flowId) {
        return flowRepository.getFlow(flowId);
    }
    
    public DecisionFlowResult executeFlow(String flowId, FactContext context) {
        DecisionFlow flow = getDecisionFlow(flowId);
        if (flow == null) {
            throw new RuleEngineException("Decision flow not found: " + flowId);
        }
        
        return flow.execute(context);
    }
    
    public CompiledDecisionFlow compileFlow(String flowId) {
        DecisionFlow flow = getDecisionFlow(flowId);
        if (flow == null) {
            throw new RuleEngineException("Decision flow not found: " + flowId);
        }
        
        if (!flowValidator.validate(flow)) {
            throw new RuleEngineException("Decision flow validation failed: " + flowId);
        }
        
        return flowCompiler.compile(flow);
    }
    
    public List<DecisionFlow> searchFlows(String keyword) {
        return flowRepository.getAllFlows().stream()
            .filter(flow -> 
                flow.getName().contains(keyword) || 
                (flow.getDescription() != null && flow.getDescription().contains(keyword))
            )
            .collect(Collectors.toList());
    }
    
    public void deleteFlow(String flowId) {
        flowRepository.deleteFlow(flowId);
    }
    
    public void updateFlow(DecisionFlow flow) {
        if (!flowValidator.validate(flow)) {
            throw new RuleEngineException("Decision flow validation failed");
        }
        
        flowRepository.updateFlow(flow);
    }
}

// 决策流验证器
public class DecisionFlowValidator {
    public boolean validate(DecisionFlow flow) {
        if (flow == null) {
            return false;
        }
        
        // 检查基本属性
        if (flow.getId() == null || flow.getId().isEmpty()) {
            return false;
        }
        
        if (flow.getName() == null || flow.getName().isEmpty()) {
            return false;
        }
        
        // 检查起始节点
        if (flow.getStartNode() == null) {
            return false;
        }
        
        // 验证节点结构
        return validateNode(flow.getStartNode(), new HashSet<>());
    }
    
    private boolean validateNode(DecisionNode node, Set<String> visitedNodes) {
        if (node == null) {
            return true;
        }
        
        // 检查循环引用
        if (visitedNodes.contains(node.getId())) {
            return false; // 发现循环
        }
        
        visitedNodes.add(node.getId());
        
        // 验证特定节点类型
        if (node instanceof RuleSetNode) {
            RuleSetNode ruleSetNode = (RuleSetNode) node;
            if (ruleSetNode.getRuleSetId() == null || ruleSetNode.getRuleSetId().isEmpty()) {
                return false;
            }
        } else if (node instanceof ConditionalNode) {
            ConditionalNode conditionalNode = (ConditionalNode) node;
            if (conditionalNode.getCondition() == null) {
                return false;
            }
        }
        
        // 递归验证子节点
        if (node instanceof ParallelNode) {
            ParallelNode parallelNode = (ParallelNode) node;
            for (DecisionNode childNode : parallelNode.getParallelNodes()) {
                if (!validateNode(childNode, new HashSet<>(visitedNodes))) {
                    return false;
                }
            }
        } else {
            for (DecisionNode nextNode : node.getNextNodes()) {
                if (!validateNode(nextNode, new HashSet<>(visitedNodes))) {
                    return false;
                }
            }
        }
        
        return true;
    }
}

// 决策流编译器
public class DecisionFlowCompiler {
    public CompiledDecisionFlow compile(DecisionFlow flow) {
        // 编译决策流为更高效的执行结构
        CompiledDecisionNode compiledStartNode = compileNode(flow.getStartNode());
        return new CompiledDecisionFlow(flow.getId(), flow.getName(), compiledStartNode);
    }
    
    private CompiledDecisionNode compileNode(DecisionNode node) {
        if (node == null) {
            return null;
        }
        
        // 根据节点类型创建编译后的节点
        if (node instanceof RuleSetNode) {
            RuleSetNode ruleSetNode = (RuleSetNode) node;
            return new CompiledRuleSetNode(
                ruleSetNode.getId(),
                ruleSetNode.getName(),
                ruleSetNode.getRuleSetId()
            );
        } else if (node instanceof ConditionalNode) {
            ConditionalNode conditionalNode = (ConditionalNode) node;
            CompiledDecisionNode trueBranch = compileNode(conditionalNode.getTrueBranch());
            CompiledDecisionNode falseBranch = compileNode(conditionalNode.getFalseBranch());
            return new CompiledConditionalNode(
                conditionalNode.getId(),
                conditionalNode.getName(),
                conditionalNode.getCondition(),
                trueBranch,
                falseBranch
            );
        } else if (node instanceof ParallelNode) {
            ParallelNode parallelNode = (ParallelNode) node;
            List<CompiledDecisionNode> compiledChildren = parallelNode.getParallelNodes()
                .stream()
                .map(this::compileNode)
                .collect(Collectors.toList());
            return new CompiledParallelNode(
                parallelNode.getId(),
                parallelNode.getName(),
                compiledChildren,
                parallelNode.getExecutionMode()
            );
        }
        
        // 默认情况，创建通用编译节点
        List<CompiledDecisionNode> compiledNextNodes = node.getNextNodes()
            .stream()
            .map(this::compileNode)
            .collect(Collectors.toList());
        return new CompiledDecisionNode(node.getId(), node.getName(), compiledNextNodes);
    }
}

// 编译后的决策流
public class CompiledDecisionFlow {
    private String id;
    private String name;
    private CompiledDecisionNode startNode;
    
    public CompiledDecisionFlow(String id, String name, CompiledDecisionNode startNode) {
        this.id = id;
        this.name = name;
        this.startNode = startNode;
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public CompiledDecisionNode getStartNode() { return startNode; }
}

// 编译后的决策节点基类
public class CompiledDecisionNode {
    protected String id;
    protected String name;
    protected List<CompiledDecisionNode> nextNodes;
    
    public CompiledDecisionNode(String id, String name, List<CompiledDecisionNode> nextNodes) {
        this.id = id;
        this.name = name;
        this.nextNodes = nextNodes != null ? nextNodes : new ArrayList<>();
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public List<CompiledDecisionNode> getNextNodes() { return new ArrayList<>(nextNodes); }
}

// 编译后的规则集节点
public class CompiledRuleSetNode extends CompiledDecisionNode {
    private String ruleSetId;
    
    public CompiledRuleSetNode(String id, String name, String ruleSetId) {
        super(id, name, new ArrayList<>());
        this.ruleSetId = ruleSetId;
    }
    
    public String getRuleSetId() { return ruleSetId; }
}

// 编译后的条件节点
public class CompiledConditionalNode extends CompiledDecisionNode {
    private Condition condition;
    private CompiledDecisionNode trueBranch;
    private CompiledDecisionNode falseBranch;
    
    public CompiledConditionalNode(String id, String name, Condition condition,
                                 CompiledDecisionNode trueBranch, CompiledDecisionNode falseBranch) {
        super(id, name, new ArrayList<>());
        this.condition = condition;
        this.trueBranch = trueBranch;
        this.falseBranch = falseBranch;
    }
    
    public Condition getCondition() { return condition; }
    public CompiledDecisionNode getTrueBranch() { return trueBranch; }
    public CompiledDecisionNode getFalseBranch() { return falseBranch; }
}

// 编译后的并行节点
public class CompiledParallelNode extends CompiledDecisionNode {
    private List<CompiledDecisionNode> parallelNodes;
    private ParallelExecutionMode executionMode;
    
    public CompiledParallelNode(String id, String name, List<CompiledDecisionNode> parallelNodes,
                              ParallelExecutionMode executionMode) {
        super(id, name, new ArrayList<>());
        this.parallelNodes = parallelNodes != null ? parallelNodes : new ArrayList<>();
        this.executionMode = executionMode;
    }
    
    public List<CompiledDecisionNode> getParallelNodes() { return new ArrayList<>(parallelNodes); }
    public ParallelExecutionMode getExecutionMode() { return executionMode; }
}

// 决策流存储接口
public interface DecisionFlowRepository {
    void saveFlow(DecisionFlow flow);
    DecisionFlow getFlow(String flowId);
    List<DecisionFlow> getAllFlows();
    void deleteFlow(String flowId);
    void updateFlow(DecisionFlow flow);
}

// 内存决策流存储实现
public class InMemoryDecisionFlowRepository implements DecisionFlowRepository {
    private final Map<String, DecisionFlow> flowStore = new ConcurrentHashMap<>();
    
    @Override
    public void saveFlow(DecisionFlow flow) {
        flowStore.put(flow.getId(), flow);
    }
    
    @Override
    public DecisionFlow getFlow(String flowId) {
        return flowStore.get(flowId);
    }
    
    @Override
    public List<DecisionFlow> getAllFlows() {
        return new ArrayList<>(flowStore.values());
    }
    
    @Override
    public void deleteFlow(String flowId) {
        flowStore.remove(flowId);
    }
    
    @Override
    public void updateFlow(DecisionFlow flow) {
        saveFlow(flow);
    }
}
```

## 结语

决策引擎的核心架构设计是构建高效、灵活、可扩展风控系统的基础。通过合理设计事实、规则、规则集和决策流等核心组件，可以实现复杂的业务逻辑和精准的风险控制。

在实际实施过程中，需要根据具体的业务需求和技术环境，选择合适的技术方案和实现方式。同时，要注重系统的性能优化、可维护性和可扩展性，确保决策引擎能够满足不断变化的业务需求。

随着人工智能和机器学习技术的发展，决策引擎也在不断创新演进。从传统的基于规则的决策到智能化的混合决策，从单一的决策引擎到分布式决策网络，决策引擎正朝着更加智能化、自动化的方向发展。

通过构建完善的决策引擎体系，企业可以更好地应对复杂多变的风险挑战，为业务的稳健发展提供有力保障。在下一章节中，我们将深入探讨高性能规则引擎的实现原理，包括Rete算法原理与优化等关键技术内容。