---
title: "代码重复度与复制粘贴检测: 重构机会识别"
date: 2025-09-06
categories: [Qa]
tags: [Qa]
published: true
---
在软件开发过程中，代码重复是一个普遍存在的问题，它不仅增加了维护成本，还降低了代码质量和系统的可维护性。通过有效的代码重复度检测和复制粘贴检测，开发团队可以识别重构机会，提升代码质量。本章将深入探讨代码重复的类型、检测技术、工具实现以及重构策略。

## 代码重复的本质与影响

### 什么是代码重复？

代码重复是指在代码库中存在功能相同或相似的代码片段。这些重复可能出现在同一文件内、不同文件间，甚至是不同项目中。

```java
// 代码重复示例
public class UserService {
    public User findUserById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        
        if (id <= 0) {
            throw new IllegalArgumentException("ID must be positive");
        }
        
        // 查询用户逻辑
        return userRepository.findById(id);
    }
    
    public Order findOrderById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        
        if (id <= 0) {
            throw new IllegalArgumentException("ID must be positive");
        }
        
        // 查询订单逻辑
        return orderRepository.findById(id);
    }
    
    public Product findProductById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        
        if (id <= 0) {
            throw new IllegalArgumentException("ID must be positive");
        }
        
        // 查询产品逻辑
        return productRepository.findById(id);
    }
}
```

### 代码重复的类型

#### 1. 完全重复（Exact Duplicates）

完全相同的代码片段：

```javascript
// 完全重复示例
function calculateTax(amount) {
    if (amount <= 0) {
        throw new Error("Amount must be positive");
    }
    return amount * 0.08;
}

function calculateShipping(amount) {
    if (amount <= 0) {
        throw new Error("Amount must be positive");
    }
    return amount * 0.05;
}
```

#### 2. 参数化重复（Parameterized Duplicates）

结构相同但参数不同的代码：

```python
# 参数化重复示例
def process_user_data(user_id):
    if user_id is None:
        raise ValueError("User ID cannot be None")
    
    if user_id <= 0:
        raise ValueError("User ID must be positive")
    
    # 处理用户数据逻辑
    user = get_user(user_id)
    return user

def process_order_data(order_id):
    if order_id is None:
        raise ValueError("Order ID cannot be None")
    
    if order_id <= 0:
        raise ValueError("Order ID must be positive")
    
    # 处理订单数据逻辑
    order = get_order(order_id)
    return order
```

#### 3. 结构重复（Structural Duplicates）

逻辑结构相同但实现细节不同的代码：

```java
// 结构重复示例
public class DataProcessor {
    public List<User> processUsers(List<User> users) {
        List<User> result = new ArrayList<>();
        
        for (User user : users) {
            if (user != null && user.isActive()) {
                User processed = new User();
                processed.setId(user.getId());
                processed.setName(user.getName().toUpperCase());
                processed.setEmail(user.getEmail().toLowerCase());
                result.add(processed);
            }
        }
        
        return result;
    }
    
    public List<Order> processOrders(List<Order> orders) {
        List<Order> result = new ArrayList<>();
        
        for (Order order : orders) {
            if (order != null && order.getStatus() != OrderStatus.CANCELLED) {
                Order processed = new Order();
                processed.setId(order.getId());
                processed.setAmount(order.getAmount().setScale(2, RoundingMode.HALF_UP));
                processed.setCustomerId(order.getCustomerId());
                result.add(processed);
            }
        }
        
        return result;
    }
}
```

## 重复检测技术原理

### 基于文本的检测

最简单的重复检测方法是基于文本相似度：

```java
// 基于文本的重复检测示例
public class TextBasedDuplicateDetector {
    
    public List<DuplicateGroup> detectDuplicates(List<SourceFile> files, int minLines) {
        List<DuplicateGroup> duplicates = new ArrayList<>();
        
        // 为每个文件生成指纹
        Map<String, List<CodeBlock>> fingerprints = new HashMap<>();
        
        for (SourceFile file : files) {
            List<CodeBlock> blocks = extractCodeBlocks(file, minLines);
            
            for (CodeBlock block : blocks) {
                String fingerprint = generateFingerprint(block.getContent());
                
                if (!fingerprints.containsKey(fingerprint)) {
                    fingerprints.put(fingerprint, new ArrayList<>());
                }
                fingerprints.get(fingerprint).add(block);
            }
        }
        
        // 找出重复的代码块
        for (Map.Entry<String, List<CodeBlock>> entry : fingerprints.entrySet()) {
            List<CodeBlock> blocks = entry.getValue();
            if (blocks.size() > 1) {
                duplicates.add(new DuplicateGroup(blocks));
            }
        }
        
        return duplicates;
    }
    
    private String generateFingerprint(String content) {
        // 简单的指纹生成：移除空白字符和注释
        return content.replaceAll("\\s+", "")
                     .replaceAll("//.*", "")
                     .replaceAll("/\\*[\\s\\S]*?\\*/", "");
    }
    
    private List<CodeBlock> extractCodeBlocks(SourceFile file, int minLines) {
        List<CodeBlock> blocks = new ArrayList<>();
        List<String> lines = file.getLines();
        
        // 滑动窗口提取代码块
        for (int i = 0; i <= lines.size() - minLines; i++) {
            StringBuilder blockContent = new StringBuilder();
            for (int j = 0; j < minLines; j++) {
                blockContent.append(lines.get(i + j)).append("\n");
            }
            
            blocks.add(new CodeBlock(
                file.getPath(),
                i,
                i + minLines - 1,
                blockContent.toString()
            ));
        }
        
        return blocks;
    }
}
```

### 基于AST的检测

更高级的检测方法是基于抽象语法树（AST）：

```java
// 基于AST的重复检测示例
public class ASTBasedDuplicateDetector {
    
    public List<DuplicateGroup> detectDuplicates(List<SourceFile> files) {
        List<DuplicateGroup> duplicates = new ArrayList<>();
        
        // 为每个文件生成AST
        Map<String, List<ASTNode>> astPatterns = new HashMap<>();
        
        for (SourceFile file : files) {
            CompilationUnit ast = parseToAST(file.getContent());
            List<ASTNode> patterns = extractPatterns(ast);
            
            for (ASTNode pattern : patterns) {
                String signature = generateSignature(pattern);
                
                if (!astPatterns.containsKey(signature)) {
                    astPatterns.put(signature, new ArrayList<>());
                }
                astPatterns.get(signature).add(pattern);
            }
        }
        
        // 找出重复的模式
        for (Map.Entry<String, List<ASTNode>> entry : astPatterns.entrySet()) {
            List<ASTNode> nodes = entry.getValue();
            if (nodes.size() > 1) {
                duplicates.add(new DuplicateGroup(convertToCodeBlocks(nodes)));
            }
        }
        
        return duplicates;
    }
    
    private CompilationUnit parseToAST(String sourceCode) {
        // 使用JavaParser或其他AST解析器
        return StaticJavaParser.parse(sourceCode);
    }
    
    private List<ASTNode> extractPatterns(CompilationUnit ast) {
        List<ASTNode> patterns = new ArrayList<>();
        
        // 提取方法声明
        ast.findAll(MethodDeclaration.class).forEach(patterns::add);
        
        // 提取循环结构
        ast.findAll(ForStmt.class).forEach(patterns::add);
        ast.findAll(WhileStmt.class).forEach(patterns::add);
        
        // 提取条件语句
        ast.findAll(IfStmt.class).forEach(patterns::add);
        
        return patterns;
    }
    
    private String generateSignature(ASTNode node) {
        // 生成AST节点的标准化签名
        SignatureGenerator generator = new SignatureGenerator();
        return generator.generate(node);
    }
}
```

### 基于哈希的检测

使用哈希算法提高检测效率：

```python
# 基于哈希的重复检测示例
import hashlib
from collections import defaultdict

class HashBasedDuplicateDetector:
    def __init__(self, window_size=20, hash_size=100):
        self.window_size = window_size
        self.hash_size = hash_size
    
    def detect_duplicates(self, files):
        """检测代码重复"""
        # 1. 为所有文件生成哈希值
        hash_map = defaultdict(list)
        
        for file_path, content in files.items():
            hashes = self._generate_rolling_hashes(content)
            for i, hash_value in enumerate(hashes):
                hash_map[hash_value].append((file_path, i))
        
        # 2. 找出重复的哈希值
        duplicates = []
        for hash_value, locations in hash_map.items():
            if len(locations) > 1:
                # 3. 验证真正的重复（避免哈希冲突）
                verified_duplicates = self._verify_duplicates(locations, files)
                duplicates.extend(verified_duplicates)
        
        return duplicates
    
    def _generate_rolling_hashes(self, content):
        """生成滚动哈希值"""
        lines = content.split('\n')
        hashes = []
        
        # 滑动窗口生成哈希
        for i in range(len(lines) - self.window_size + 1):
            window = '\n'.join(lines[i:i + self.window_size])
            hash_value = self._hash_window(window)
            hashes.append(hash_value)
        
        return hashes
    
    def _hash_window(self, window):
        """对窗口内容进行哈希"""
        # 使用MD5哈希算法
        return hashlib.md5(window.encode('utf-8')).hexdigest()[:self.hash_size]
    
    def _verify_duplicates(self, locations, files):
        """验证重复内容"""
        verified = []
        
        # 比较实际内容
        for i in range(len(locations)):
            for j in range(i + 1, len(locations)):
                file1, line1 = locations[i]
                file2, line2 = locations[j]
                
                content1 = self._get_window_content(files[file1], line1)
                content2 = self._get_window_content(files[file2], line2)
                
                # 计算相似度
                similarity = self._calculate_similarity(content1, content2)
                if similarity > 0.9:  # 90%相似度阈值
                    verified.append({
                        'files': [file1, file2],
                        'lines': [line1, line2],
                        'similarity': similarity,
                        'content': content1
                    })
        
        return verified
    
    def _get_window_content(self, content, start_line):
        """获取窗口内容"""
        lines = content.split('\n')
        end_line = min(start_line + self.window_size, len(lines))
        return '\n'.join(lines[start_line:end_line])
    
    def _calculate_similarity(self, content1, content2):
        """计算内容相似度"""
        # 简化的相似度计算
        set1 = set(content1.split())
        set2 = set(content2.split())
        
        if not set1 and not set2:
            return 1.0
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
```

## 重复检测工具实现

### 自定义重复检测器

```java
// 自定义重复检测器
@Component
public class CustomDuplicateDetector {
    
    private static final int MIN_DUPLICATE_LINES = 5;
    private static final double SIMILARITY_THRESHOLD = 0.8;
    
    public DuplicateReport analyzeCodebase(List<SourceFile> files) {
        DuplicateReport report = new DuplicateReport();
        
        try {
            // 1. 多策略检测
            List<DuplicateGroup> exactDuplicates = detectExactDuplicates(files);
            List<DuplicateGroup> structuralDuplicates = detectStructuralDuplicates(files);
            
            // 2. 合并结果
            List<DuplicateGroup> allDuplicates = mergeDuplicates(
                exactDuplicates, structuralDuplicates);
            
            // 3. 计算指标
            report.setDuplicateGroups(allDuplicates);
            report.setTotalDuplicateLines(calculateTotalDuplicateLines(allDuplicates));
            report.setDuplicateRatio(calculateDuplicateRatio(files, allDuplicates));
            report.setRefactoringOpportunities(identifyRefactoringOpportunities(allDuplicates));
            
            // 4. 生成建议
            report.setRecommendations(generateRecommendations(report));
            
        } catch (Exception e) {
            report.setError("Failed to analyze codebase: " + e.getMessage());
        }
        
        return report;
    }
    
    private List<DuplicateGroup> detectExactDuplicates(List<SourceFile> files) {
        Map<String, List<CodeLocation>> contentMap = new HashMap<>();
        
        // 为每个代码块生成标准化内容
        for (SourceFile file : files) {
            List<CodeBlock> blocks = extractCodeBlocks(file, MIN_DUPLICATE_LINES);
            
            for (CodeBlock block : blocks) {
                String normalizedContent = normalizeContent(block.getContent());
                
                if (!contentMap.containsKey(normalizedContent)) {
                    contentMap.put(normalizedContent, new ArrayList<>());
                }
                contentMap.get(normalizedContent).add(
                    new CodeLocation(file.getPath(), block.getStartLine(), block.getEndLine()));
            }
        }
        
        // 找出重复的代码块
        List<DuplicateGroup> duplicates = new ArrayList<>();
        for (Map.Entry<String, List<CodeLocation>> entry : contentMap.entrySet()) {
            List<CodeLocation> locations = entry.getValue();
            if (locations.size() > 1) {
                duplicates.add(new DuplicateGroup(locations, entry.getKey()));
            }
        }
        
        return duplicates;
    }
    
    private List<DuplicateGroup> detectStructuralDuplicates(List<SourceFile> files) {
        List<DuplicateGroup> duplicates = new ArrayList<>();
        
        // 使用相似度算法检测结构重复
        for (int i = 0; i < files.size(); i++) {
            for (int j = i + 1; j < files.size(); j++) {
                List<DuplicateGroup> fileDuplicates = detectFileDuplicates(
                    files.get(i), files.get(j));
                duplicates.addAll(fileDuplicates);
            }
        }
        
        return duplicates;
    }
    
    private List<DuplicateGroup> detectFileDuplicates(SourceFile file1, SourceFile file2) {
        List<DuplicateGroup> duplicates = new ArrayList<>();
        
        // 比较两个文件中的代码块
        List<CodeBlock> blocks1 = extractCodeBlocks(file1, MIN_DUPLICATE_LINES);
        List<CodeBlock> blocks2 = extractCodeBlocks(file2, MIN_DUPLICATE_LINES);
        
        for (CodeBlock block1 : blocks1) {
            for (CodeBlock block2 : blocks2) {
                double similarity = calculateSimilarity(block1.getContent(), block2.getContent());
                
                if (similarity >= SIMILARITY_THRESHOLD) {
                    List<CodeLocation> locations = Arrays.asList(
                        new CodeLocation(file1.getPath(), block1.getStartLine(), block1.getEndLine()),
                        new CodeLocation(file2.getPath(), block2.getStartLine(), block2.getEndLine())
                    );
                    
                    duplicates.add(new DuplicateGroup(locations, 
                        "Similarity: " + String.format("%.2f", similarity)));
                }
            }
        }
        
        return duplicates;
    }
    
    private String normalizeContent(String content) {
        // 标准化内容：移除注释、空白字符，统一变量名
        return content.replaceAll("//.*", "")           // 移除单行注释
                     .replaceAll("/\\*[\\s\\S]*?\\*/", "") // 移除多行注释
                     .replaceAll("\\s+", " ")             // 统一空白字符
                     .replaceAll("\\b[a-zA-Z_][a-zA-Z0-9_]*\\b", "VAR") // 统一变量名
                     .trim();
    }
    
    private double calculateSimilarity(String content1, String content2) {
        // 使用余弦相似度算法
        return CosineSimilarity.calculate(content1, content2);
    }
}
```

### 集成开源工具

```java
// 集成CPD (Copy-Paste Detector)工具
@Service
public class CPDIntegrationService {
    
    public CPDReport runCPDAnalysis(String sourcePath) {
        CPDReport report = new CPDReport();
        
        try {
            // 配置CPD
            CPDConfiguration config = new CPDConfiguration();
            config.setMinimumTileSize(50); // 最小重复行数
            config.setLanguage(Language.JAVA);
            config.setSourceEncoding("UTF-8");
            config.addSourceFileOrDirectory(sourcePath);
            
            // 运行CPD分析
            CPD cpd = new CPD(config);
            cpd.go();
            
            // 处理结果
            Iterator<Match> matches = cpd.getMatches();
            List<CPDDuplicate> duplicates = new ArrayList<>();
            
            while (matches.hasNext()) {
                Match match = matches.next();
                CPDDuplicate duplicate = convertMatchToDuplicate(match);
                duplicates.add(duplicate);
            }
            
            report.setDuplicates(duplicates);
            report.setTotalDuplicatedLines(calculateTotalDuplicatedLines(duplicates));
            report.setDuplicatedCodePercentage(calculateDuplicatedPercentage(sourcePath, duplicates));
            
        } catch (Exception e) {
            report.setError("CPD analysis failed: " + e.getMessage());
        }
        
        return report;
    }
    
    private CPDDuplicate convertMatchToDuplicate(Match match) {
        CPDDuplicate duplicate = new CPDDuplicate();
        duplicate.setLineCount(match.getLineCount());
        duplicate.setTokenCount(match.getTokenCount());
        
        List<CPDLocation> locations = new ArrayList<>();
        Iterator<Mark> marks = match.iterator();
        
        while (marks.hasNext()) {
            Mark mark = marks.next();
            CPDLocation location = new CPDLocation();
            location.setFilePath(mark.getFilename());
            location.setStartLine(mark.getBeginLine());
            location.setEndLine(mark.getBeginLine() + match.getLineCount() - 1);
            locations.add(location);
        }
        
        duplicate.setLocations(locations);
        return duplicate;
    }
}
```

## 重构机会识别

### 重复模式分析

```java
// 重构机会识别器
@Service
public class RefactoringOpportunityDetector {
    
    public List<RefactoringOpportunity> identifyOpportunities(DuplicateReport report) {
        List<RefactoringOpportunity> opportunities = new ArrayList<>();
        
        for (DuplicateGroup group : report.getDuplicateGroups()) {
            RefactoringOpportunity opportunity = analyzeDuplicateGroup(group);
            if (opportunity != null) {
                opportunities.add(opportunity);
            }
        }
        
        // 按优先级排序
        opportunities.sort(Comparator.comparing(RefactoringOpportunity::getPriority).reversed());
        
        return opportunities;
    }
    
    private RefactoringOpportunity analyzeDuplicateGroup(DuplicateGroup group) {
        RefactoringOpportunity opportunity = new RefactoringOpportunity();
        opportunity.setDuplicateGroup(group);
        
        // 1. 分析重复代码的复杂度
        int complexity = calculateComplexity(group);
        opportunity.setComplexity(complexity);
        
        // 2. 分析重复代码的分布
        DistributionInfo distribution = analyzeDistribution(group);
        opportunity.setDistribution(distribution);
        
        // 3. 评估重构价值
        RefactoringValue value = evaluateRefactoringValue(group, complexity, distribution);
        opportunity.setValue(value);
        
        // 4. 确定重构优先级
        Priority priority = determinePriority(value, group.getLocations().size());
        opportunity.setPriority(priority);
        
        // 5. 生成重构建议
        List<RefactoringSuggestion> suggestions = generateSuggestions(group);
        opportunity.setSuggestions(suggestions);
        
        return opportunity;
    }
    
    private int calculateComplexity(DuplicateGroup group) {
        // 基于代码行数、嵌套层级、条件语句数量等计算复杂度
        String content = group.getContent();
        
        int lineCount = content.split("\n").length;
        int nestingLevel = calculateMaxNestingLevel(content);
        int conditionCount = countConditions(content);
        
        // 加权计算复杂度
        return lineCount + (nestingLevel * 2) + (conditionCount * 3);
    }
    
    private DistributionInfo analyzeDistribution(DuplicateGroup group) {
        DistributionInfo info = new DistributionInfo();
        
        // 分析重复代码在不同文件中的分布
        Set<String> files = new HashSet<>();
        Set<String> packages = new HashSet<>();
        
        for (CodeLocation location : group.getLocations()) {
            files.add(location.getFilePath());
            packages.add(extractPackage(location.getFilePath()));
        }
        
        info.setFileCount(files.size());
        info.setPackageCount(packages.size());
        info.setCrossPackage(distribution.isCrossPackage());
        
        return info;
    }
    
    private RefactoringValue evaluateRefactoringValue(DuplicateGroup group, 
                                                    int complexity, 
                                                    DistributionInfo distribution) {
        RefactoringValue value = new RefactoringValue();
        
        // 重复实例数量价值
        int instanceCount = group.getLocations().size();
        double instanceValue = Math.log(instanceCount) * 10;
        
        // 复杂度价值
        double complexityValue = Math.log(complexity) * 5;
        
        // 分布价值（跨包重复价值更高）
        double distributionValue = distribution.isCrossPackage() ? 20 : 10;
        
        // 维护成本价值
        double maintenanceValue = (instanceCount * complexity) / 100.0;
        
        value.setTotalValue(instanceValue + complexityValue + distributionValue + maintenanceValue);
        value.setInstanceValue(instanceValue);
        value.setComplexityValue(complexityValue);
        value.setDistributionValue(distributionValue);
        value.setMaintenanceValue(maintenanceValue);
        
        return value;
    }
    
    private Priority determinePriority(RefactoringValue value, int instanceCount) {
        double totalValue = value.getTotalValue();
        
        if (totalValue > 100 || instanceCount > 10) {
            return Priority.HIGH;
        } else if (totalValue > 50 || instanceCount > 5) {
            return Priority.MEDIUM;
        } else {
            return Priority.LOW;
        }
    }
}
```

### 自动生成重构建议

```python
# 自动生成重构建议
class RefactoringSuggestionGenerator:
    def __init__(self):
        self.refactoring_patterns = {
            'extract_method': self._suggest_extract_method,
            'extract_class': self._suggest_extract_class,
            'introduce_parameter': self._suggest_introduce_parameter,
            'pull_up_method': self._suggest_pull_up_method
        }
    
    def generate_suggestions(self, duplicate_group):
        """为重复代码生成重构建议"""
        suggestions = []
        
        # 分析重复代码特征
        characteristics = self._analyze_characteristics(duplicate_group)
        
        # 根据特征匹配重构模式
        for pattern_name, pattern_func in self.refactoring_patterns.items():
            if self._matches_pattern(characteristics, pattern_name):
                suggestion = pattern_func(duplicate_group, characteristics)
                if suggestion:
                    suggestions.append(suggestion)
        
        return suggestions
    
    def _analyze_characteristics(self, duplicate_group):
        """分析重复代码的特征"""
        content = duplicate_group.content
        lines = content.split('\n')
        
        characteristics = {
            'line_count': len(lines),
            'has_parameters': self._has_parameters(content),
            'has_return_value': self._has_return_value(content),
            'nesting_level': self._calculate_nesting_level(content),
            'uses_external_vars': self._uses_external_variables(content),
            'method_calls': self._count_method_calls(content),
            'conditionals': self._count_conditionals(content)
        }
        
        return characteristics
    
    def _suggest_extract_method(self, duplicate_group, characteristics):
        """建议提取方法重构"""
        if characteristics['line_count'] >= 3:
            return {
                'type': 'extract_method',
                'title': '提取公共方法',
                'description': f'发现{len(duplicate_group.locations)}处相同的代码块，建议提取为公共方法',
                'benefits': [
                    '减少代码重复',
                    '提高可维护性',
                    '便于测试'
                ],
                'steps': [
                    '创建新的私有方法',
                    '将重复代码移入新方法',
                    '在原位置调用新方法',
                    '添加适当的参数'
                ]
            }
        return None
    
    def _suggest_extract_class(self, duplicate_group, characteristics):
        """建议提取类重构"""
        if characteristics['line_count'] >= 20 and characteristics['nesting_level'] >= 3:
            return {
                'type': 'extract_class',
                'title': '提取新类',
                'description': '重复代码复杂度较高，建议提取为独立的类',
                'benefits': [
                    '提高代码组织性',
                    '增强单一职责原则',
                    '便于复用'
                ],
                'steps': [
                    '创建新的类',
                    '将相关方法和属性移入新类',
                    '在原类中使用新类的实例'
                ]
            }
        return None
```

## 预防策略与最佳实践

### 编码规范

```markdown
# 代码重复预防规范

## 1. DRY原则（Don't Repeat Yourself）

### 1.1 识别重复模式
- 当发现相同或相似的代码出现3次以上时，应考虑重构
- 注意参数化重复，即使代码不完全相同

### 1.2 提取公共方法
```java
// 不好的做法
public class OrderService {
    public void processOrder(Order order) {
        // 验证订单
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }
        if (order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have items");
        }
        // 处理逻辑...
    }
    
    public void updateOrder(Order order) {
        // 验证订单
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }
        if (order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have items");
        }
        // 更新逻辑...
    }
}

// 好的做法
public class OrderService {
    public void processOrder(Order order) {
        validateOrder(order);
        // 处理逻辑...
    }
    
    public void updateOrder(Order order) {
        validateOrder(order);
        // 更新逻辑...
    }
    
    private void validateOrder(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }
        if (order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have items");
        }
    }
}
```

### 1.3 使用设计模式
- 策略模式：处理不同的算法逻辑
- 模板方法模式：处理通用流程
- 工厂模式：创建相似的对象

## 2. 代码复用机制

### 2.1 工具类和公共库
```java
// 创建通用工具类
public class ValidationUtils {
    public static void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
    }
    
    public static void validateNotEmpty(Collection<?> collection, String fieldName) {
        if (collection == null || collection.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be empty");
        }
    }
}

// 使用工具类
public class UserService {
    public void createUser(User user) {
        ValidationUtils.validateNotNull(user, "User");
        ValidationUtils.validateNotEmpty(user.getRoles(), "User roles");
        // 创建逻辑...
    }
}
```

### 2.2 继承和接口
```java
// 定义通用接口
public interface Validatable {
    void validate();
}

// 实现通用验证逻辑
public abstract class BaseEntity implements Validatable {
    @Override
    public void validate() {
        // 通用验证逻辑
        validateId();
        validateTimestamps();
    }
    
    protected abstract void validateId();
    protected abstract void validateTimestamps();
}

// 具体实体类
public class User extends BaseEntity {
    private Long id;
    private String name;
    
    @Override
    protected void validateId() {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
    }
    
    @Override
    protected void validateTimestamps() {
        // 用户特定的时间戳验证
    }
}
```

## 3. 模板和代码生成

### 3.1 使用代码模板
```java
// 使用模板引擎生成重复代码
public class CodeGenerator {
    public String generateServiceClass(String entityName) {
        Map<String, Object> context = new HashMap<>();
        context.put("entityName", entityName);
        context.put("entityNameLower", entityName.toLowerCase());
        
        return templateEngine.process("service-template.ftl", context);
    }
}
```

### 3.2 配置驱动的实现
```yaml
# 通过配置减少重复代码
entity-config:
  user:
    fields:
      - name: id
        type: Long
        validation: notNull
      - name: name
        type: String
        validation: notEmpty
    operations:
      - create
      - update
      - delete
      - findById
```
```

### 持续集成集成

```yaml
# 在CI/CD中集成重复检测
name: Code Duplication Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  duplication-check:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'
    
    - name: Run PMD CPD
      run: |
        # 下载并运行PMD CPD
        wget https://github.com/pmd/pmd/releases/download/pmd_releases/6.55.0/pmd-bin-6.55.0.zip
        unzip pmd-bin-6.55.0.zip
        ./pmd-bin-6.55.0/bin/run.sh cpd --minimum-tokens 100 --files src/ --language java --format xml > cpd-report.xml
        
        # 检查是否有重复
        if grep -q "<duplication" cpd-report.xml; then
          echo "❌ Code duplication detected"
          cat cpd-report.xml
          exit 1
        else
          echo "✅ No code duplication found"
        fi
    
    - name: Run SonarQube Scanner
      uses: sonarqube-quality-gate-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      with:
        timeout: 300
    
    - name: Upload duplication report
      uses: actions/upload-artifact@v3
      with:
        name: duplication-report
        path: cpd-report.xml
```

## 监控与度量

### 重复度指标

```java
// 代码重复度指标定义
public class DuplicationMetrics {
    // 重复代码行数
    private int duplicatedLines;
    
    // 总代码行数
    private int totalLines;
    
    // 重复率
    private double duplicationRate;
    
    // 重复代码块数量
    private int duplicateBlocks;
    
    // 平均重复块大小
    private double averageBlockSize;
    
    // 重构机会数量
    private int refactoringOpportunities;
    
    // 重复代码分布
    private Map<String, Integer> duplicationByPackage;
    
    // 趋势数据
    private List<HistoricalMetric> trendData;
    
    // getter和setter方法...
}
```

### 仪表板展示

```javascript
// 代码重复监控仪表板
class DuplicationDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            metrics: null,
            opportunities: [],
            loading: true
        };
    }
    
    componentDidMount() {
        this.loadMetrics();
        this.loadRefactoringOpportunities();
    }
    
    loadMetrics() {
        fetch('/api/duplication/metrics')
            .then(response => response.json())
            .then(data => {
                this.setState({ metrics: data, loading: false });
            });
    }
    
    loadRefactoringOpportunities() {
        fetch('/api/duplication/opportunities?priority=HIGH')
            .then(response => response.json())
            .then(data => {
                this.setState({ opportunities: data });
            });
    }
    
    render() {
        const { metrics, opportunities, loading } = this.state;
        
        if (loading) {
            return <div>Loading...</div>;
        }
        
        return (
            <div className="duplication-dashboard">
                <h1>Code Duplication Dashboard</h1>
                
                <div className="metrics-grid">
                    <MetricCard 
                        title="Duplication Rate"
                        value={metrics.duplicationRate}
                        format="percentage"
                        trend={metrics.trend}
                    />
                    <MetricCard 
                        title="Duplicated Lines"
                        value={metrics.duplicatedLines}
                        format="number"
                    />
                    <MetricCard 
                        title="Refactoring Opportunities"
                        value={metrics.refactoringOpportunities}
                        format="number"
                    />
                    <MetricCard 
                        title="Average Block Size"
                        value={metrics.averageBlockSize}
                        format="number"
                    />
                </div>
                
                <div className="duplication-trend">
                    <h2>Duplication Trend</h2>
                    <LineChart data={metrics.trendData} />
                </div>
                
                <div className="refactoring-opportunities">
                    <h2>High Priority Refactoring Opportunities</h2>
                    <OpportunityTable opportunities={opportunities} />
                </div>
            </div>
        );
    }
}
```

## 总结

代码重复度与复制粘贴检测是提升代码质量和可维护性的重要手段。通过建立完善的检测机制、采用合理的预防策略、集成到开发流程中，并持续监控相关指标，可以有效减少代码重复问题。

关键要点包括：

1. **理解重复类型**：识别完全重复、参数化重复和结构重复
2. **掌握检测技术**：运用文本、AST和哈希等多种检测方法
3. **工具集成**：结合CPD等开源工具和自定义检测器
4. **重构识别**：自动识别重构机会并生成建议
5. **预防策略**：通过编码规范和最佳实践预防重复
6. **持续监控**：建立度量体系和监控仪表板

通过系统性地实施这些策略和技术，开发团队可以显著降低代码重复率，提升代码质量，减少维护成本，并为系统演进提供更好的基础。

在下一节中，我们将探讨架构治理与防腐层技术，这是确保系统架构稳定性和可维护性的重要保障。