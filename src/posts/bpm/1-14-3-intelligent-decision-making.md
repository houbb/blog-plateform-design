---
title: "智能决策: 利用机器学习模型辅助流程中的关键决策"
date: 2025-09-07
categories: [BPM]
tags: [bpm, machine learning, decision support, predictive analytics, automation]
published: true
---
# 智能决策：利用机器学习模型辅助流程中的关键决策

在现代企业业务流程中，决策质量直接影响业务效率和客户满意度。传统的基于规则的决策系统虽然能够处理结构化和确定性的业务场景，但在面对复杂、动态和不确定性较高的业务环境时往往显得力不从心。通过将机器学习技术集成到BPM平台中，可以构建智能化的决策支持系统，为流程中的关键决策点提供数据驱动的智能建议。

## 智能决策的核心价值

### 提升决策质量
机器学习模型能够从历史数据中学习复杂的模式和关联关系，提供比传统规则更精准的决策建议。

### 增强适应性
智能决策系统能够随着业务环境的变化自动调整决策策略，保持决策的有效性。

### 降低人工干预
通过自动化决策支持，减少对专家经验的依赖，提高决策效率。

### 实现个性化服务
基于用户行为和偏好数据，提供个性化的决策建议，提升用户体验。

## 决策模型设计与实现

构建有效的智能决策系统需要从模型设计、训练到部署的完整流程。

```java
// 智能决策服务
@Service
public class IntelligentDecisionService {
    
    @Autowired
    private DecisionModelRepository modelRepository;
    
    @Autowired
    private FeatureEngineeringService featureEngineeringService;
    
    @Autowired
    private ModelTrainingService trainingService;
    
    @Autowired
    private DecisionLoggingService loggingService;
    
    /**
     * 执行智能决策
     * @param decisionContext 决策上下文
     * @return 决策结果
     */
    public IntelligentDecisionResult makeIntelligentDecision(DecisionContext decisionContext) {
        IntelligentDecisionResult result = new IntelligentDecisionResult();
        result.setDecisionTime(new Date());
        result.setContext(decisionContext);
        
        try {
            // 1. 获取决策模型
            DecisionModel decisionModel = getModelForDecision(decisionContext.getDecisionType());
            if (decisionModel == null) {
                throw new DecisionException("未找到适用于决策类型 " + decisionContext.getDecisionType() + " 的模型");
            }
            
            // 2. 特征工程
            Map<String, Object> features = featureEngineeringService.engineerFeatures(
                decisionContext.getInputData(), decisionContext.getDecisionType());
            result.setFeatures(features);
            
            // 3. 执行模型预测
            ModelPrediction prediction = executeModelPrediction(decisionModel, features);
            result.setPrediction(prediction);
            
            // 4. 解释决策结果
            DecisionExplanation explanation = explainDecision(decisionModel, features, prediction);
            result.setExplanation(explanation);
            
            // 5. 应用业务规则
            BusinessRuleResult ruleResult = applyBusinessRules(decisionContext, prediction);
            result.setRuleResult(ruleResult);
            
            // 6. 生成最终决策
            FinalDecision finalDecision = generateFinalDecision(prediction, ruleResult, explanation);
            result.setFinalDecision(finalDecision);
            
            // 7. 记录决策日志
            logDecision(decisionContext, result);
            
            result.setSuccess(true);
            result.setMessage("智能决策执行完成");
            
            log.info("智能决策执行完成 - 决策类型: {}", decisionContext.getDecisionType());
            
        } catch (Exception e) {
            log.error("执行智能决策失败 - 决策类型: {}", decisionContext.getDecisionType(), e);
            result.setSuccess(false);
            result.setErrorMessage("决策执行失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 获取适用于决策的模型
     */
    private DecisionModel getModelForDecision(DecisionType decisionType) {
        try {
            // 首先尝试获取专门针对该决策类型的模型
            DecisionModel model = modelRepository.findByDecisionTypeAndStatus(
                decisionType, ModelStatus.ACTIVE);
            
            if (model != null) {
                return model;
            }
            
            // 如果没有找到，尝试获取通用模型
            model = modelRepository.findByDecisionTypeAndStatus(
                DecisionType.GENERIC, ModelStatus.ACTIVE);
            
            return model;
            
        } catch (Exception e) {
            log.warn("获取决策模型失败 - 决策类型: {}", decisionType, e);
            return null;
        }
    }
    
    /**
     * 执行模型预测
     */
    private ModelPrediction executeModelPrediction(DecisionModel model, Map<String, Object> features) {
        ModelPrediction prediction = new ModelPrediction();
        prediction.setModelId(model.getId());
        prediction.setPredictionTime(new Date());
        
        try {
            // 根据模型类型执行相应的预测
            switch (model.getModelType()) {
                case DECISION_TREE:
                    prediction = executeDecisionTreePrediction(model, features);
                    break;
                    
                case RANDOM_FOREST:
                    prediction = executeRandomForestPrediction(model, features);
                    break;
                    
                case NEURAL_NETWORK:
                    prediction = executeNeuralNetworkPrediction(model, features);
                    break;
                    
                case GRADIENT_BOOSTING:
                    prediction = executeGradientBoostingPrediction(model, features);
                    break;
                    
                default:
                    throw new DecisionException("不支持的模型类型: " + model.getModelType());
            }
            
        } catch (Exception e) {
            log.error("执行模型预测失败 - 模型ID: {}", model.getId(), e);
            prediction.setSuccess(false);
            prediction.setErrorMessage("预测执行失败: " + e.getMessage());
        }
        
        return prediction;
    }
    
    /**
     * 执行决策树预测
     */
    private ModelPrediction executeDecisionTreePrediction(DecisionModel model, Map<String, Object> features) {
        ModelPrediction prediction = new ModelPrediction();
        prediction.setModelType(ModelType.DECISION_TREE);
        
        try {
            // 加载决策树模型
            DecisionTreeModel treeModel = DecisionTreeModel.loadFromString(model.getModelData());
            
            // 执行预测
            PredictionResult result = treeModel.predict(features);
            prediction.setPredictionResult(result);
            prediction.setConfidenceScore(result.getConfidence());
            prediction.setSuccess(true);
            
        } catch (Exception e) {
            log.error("执行决策树预测失败", e);
            prediction.setSuccess(false);
            prediction.setErrorMessage("决策树预测失败: " + e.getMessage());
        }
        
        return prediction;
    }
    
    /**
     * 执行随机森林预测
     */
    private ModelPrediction executeRandomForestPrediction(DecisionModel model, Map<String, Object> features) {
        ModelPrediction prediction = new ModelPrediction();
        prediction.setModelType(ModelType.RANDOM_FOREST);
        
        try {
            // 加载随机森林模型
            RandomForestModel forestModel = RandomForestModel.loadFromString(model.getModelData());
            
            // 执行预测
            PredictionResult result = forestModel.predict(features);
            prediction.setPredictionResult(result);
            prediction.setConfidenceScore(result.getConfidence());
            prediction.setSuccess(true);
            
        } catch (Exception e) {
            log.error("执行随机森林预测失败", e);
            prediction.setSuccess(false);
            prediction.setErrorMessage("随机森林预测失败: " + e.getMessage());
        }
        
        return prediction;
    }
    
    /**
     * 执行神经网络预测
     */
    private ModelPrediction executeNeuralNetworkPrediction(DecisionModel model, Map<String, Object> features) {
        ModelPrediction prediction = new ModelPrediction();
        prediction.setModelType(ModelType.NEURAL_NETWORK);
        
        try {
            // 加载神经网络模型
            NeuralNetworkModel nnModel = NeuralNetworkModel.loadFromString(model.getModelData());
            
            // 执行预测
            PredictionResult result = nnModel.predict(features);
            prediction.setPredictionResult(result);
            prediction.setConfidenceScore(result.getConfidence());
            prediction.setSuccess(true);
            
        } catch (Exception e) {
            log.error("执行神经网络预测失败", e);
            prediction.setSuccess(false);
            prediction.setErrorMessage("神经网络预测失败: " + e.getMessage());
        }
        
        return prediction;
    }
    
    /**
     * 执行梯度提升预测
     */
    private ModelPrediction executeGradientBoostingPrediction(DecisionModel model, Map<String, Object> features) {
        ModelPrediction prediction = new ModelPrediction();
        prediction.setModelType(ModelType.GRADIENT_BOOSTING);
        
        try {
            // 加载梯度提升模型
            GradientBoostingModel gbModel = GradientBoostingModel.loadFromString(model.getModelData());
            
            // 执行预测
            PredictionResult result = gbModel.predict(features);
            prediction.setPredictionResult(result);
            prediction.setConfidenceScore(result.getConfidence());
            prediction.setSuccess(true);
            
        } catch (Exception e) {
            log.error("执行梯度提升预测失败", e);
            prediction.setSuccess(false);
            prediction.setErrorMessage("梯度提升预测失败: " + e.getMessage());
        }
        
        return prediction;
    }
    
    /**
     * 解释决策结果
     */
    private DecisionExplanation explainDecision(DecisionModel model, Map<String, Object> features, 
        ModelPrediction prediction) {
        
        DecisionExplanation explanation = new DecisionExplanation();
        explanation.setExplanationTime(new Date());
        
        try {
            // 根据模型类型生成解释
            switch (model.getModelType()) {
                case DECISION_TREE:
                    explanation = explainDecisionTree(model, features, prediction);
                    break;
                    
                case RANDOM_FOREST:
                    explanation = explainRandomForest(model, features, prediction);
                    break;
                    
                case NEURAL_NETWORK:
                    explanation = explainNeuralNetwork(model, features, prediction);
                    break;
                    
                case GRADIENT_BOOSTING:
                    explanation = explainGradientBoosting(model, features, prediction);
                    break;
            }
            
        } catch (Exception e) {
            log.warn("生成决策解释失败", e);
        }
        
        return explanation;
    }
    
    /**
     * 解释决策树决策
     */
    private DecisionExplanation explainDecisionTree(DecisionModel model, Map<String, Object> features, 
        ModelPrediction prediction) {
        
        DecisionExplanation explanation = new DecisionExplanation();
        explanation.setModelType(ModelType.DECISION_TREE);
        
        try {
            DecisionTreeModel treeModel = DecisionTreeModel.loadFromString(model.getModelData());
            
            // 获取决策路径
            List<DecisionPathNode> decisionPath = treeModel.getDecisionPath(features);
            explanation.setDecisionPath(decisionPath);
            
            // 提取关键特征
            List<FeatureImportance> featureImportances = treeModel.getFeatureImportances();
            explanation.setFeatureImportances(featureImportances);
            
            // 生成自然语言解释
            String naturalLanguageExplanation = generateNaturalLanguageExplanation(decisionPath);
            explanation.setNaturalLanguageExplanation(naturalLanguageExplanation);
            
        } catch (Exception e) {
            log.warn("解释决策树决策失败", e);
        }
        
        return explanation;
    }
    
    /**
     * 生成自然语言解释
     */
    private String generateNaturalLanguageExplanation(List<DecisionPathNode> decisionPath) {
        StringBuilder explanation = new StringBuilder();
        explanation.append("基于以下条件做出决策:\n");
        
        for (DecisionPathNode node : decisionPath) {
            if (node.getFeatureName() != null) {
                explanation.append("- 当 ")
                    .append(node.getFeatureName())
                    .append(" ")
                    .append(node.getCondition())
                    .append(" ")
                    .append(node.getThreshold())
                    .append(" 时\n");
            }
        }
        
        return explanation.toString();
    }
    
    /**
     * 应用业务规则
     */
    private BusinessRuleResult applyBusinessRules(DecisionContext context, ModelPrediction prediction) {
        BusinessRuleResult ruleResult = new BusinessRuleResult();
        ruleResult.setRuleContext(context);
        
        try {
            // 获取适用于该决策类型的业务规则
            List<BusinessRule> applicableRules = getBusinessRules(context.getDecisionType());
            
            // 按优先级排序并应用规则
            applicableRules.sort(Comparator.comparingInt(BusinessRule::getPriority));
            
            List<RuleEvaluation> evaluations = new ArrayList<>();
            boolean ruleOverride = false;
            String overrideReason = null;
            
            for (BusinessRule rule : applicableRules) {
                RuleEvaluation evaluation = evaluateRule(rule, context, prediction);
                evaluations.add(evaluation);
                
                // 检查是否有规则覆盖模型预测
                if (evaluation.isOverride() && evaluation.isMatched()) {
                    ruleOverride = true;
                    overrideReason = rule.getDescription();
                    break;
                }
            }
            
            ruleResult.setEvaluations(evaluations);
            ruleResult.setRuleOverride(ruleOverride);
            ruleResult.setOverrideReason(overrideReason);
            
        } catch (Exception e) {
            log.warn("应用业务规则失败", e);
        }
        
        return ruleResult;
    }
    
    /**
     * 评估业务规则
     */
    private RuleEvaluation evaluateRule(BusinessRule rule, DecisionContext context, ModelPrediction prediction) {
        RuleEvaluation evaluation = new RuleEvaluation();
        evaluation.setRuleId(rule.getId());
        evaluation.setRuleName(rule.getName());
        
        try {
            // 评估规则条件
            boolean conditionMatched = evaluateRuleConditions(rule.getConditions(), context);
            evaluation.setMatched(conditionMatched);
            
            if (conditionMatched) {
                // 应用规则动作
                RuleAction action = rule.getAction();
                evaluation.setAction(action);
                evaluation.setOverride(action.isOverrideModel());
            }
            
        } catch (Exception e) {
            log.warn("评估业务规则失败 - 规则ID: {}", rule.getId(), e);
            evaluation.setMatched(false);
        }
        
        return evaluation;
    }
    
    /**
     * 评估规则条件
     */
    private boolean evaluateRuleConditions(List<RuleCondition> conditions, DecisionContext context) {
        // 简化实现，实际应该支持复杂的条件组合
        for (RuleCondition condition : conditions) {
            Object contextValue = getContextValue(context, condition.getFieldName());
            if (!evaluateCondition(condition, contextValue)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 获取上下文值
     */
    private Object getContextValue(DecisionContext context, String fieldName) {
        // 简化实现，实际应该支持嵌套字段访问
        return context.getInputData().get(fieldName);
    }
    
    /**
     * 评估单个条件
     */
    private boolean evaluateCondition(RuleCondition condition, Object contextValue) {
        try {
            switch (condition.getOperator()) {
                case EQUALS:
                    return Objects.equals(contextValue, condition.getValue());
                    
                case NOT_EQUALS:
                    return !Objects.equals(contextValue, condition.getValue());
                    
                case GREATER_THAN:
                    if (contextValue instanceof Number && condition.getValue() instanceof Number) {
                        return ((Number) contextValue).doubleValue() > ((Number) condition.getValue()).doubleValue();
                    }
                    break;
                    
                case LESS_THAN:
                    if (contextValue instanceof Number && condition.getValue() instanceof Number) {
                        return ((Number) contextValue).doubleValue() < ((Number) condition.getValue()).doubleValue();
                    }
                    break;
                    
                case CONTAINS:
                    if (contextValue instanceof String && condition.getValue() instanceof String) {
                        return ((String) contextValue).contains((String) condition.getValue());
                    }
                    break;
            }
        } catch (Exception e) {
            log.warn("评估条件失败", e);
        }
        
        return false;
    }
    
    /**
     * 生成最终决策
     */
    private FinalDecision generateFinalDecision(ModelPrediction prediction, BusinessRuleResult ruleResult, 
        DecisionExplanation explanation) {
        
        FinalDecision finalDecision = new FinalDecision();
        finalDecision.setDecisionTime(new Date());
        
        try {
            // 检查是否有业务规则覆盖
            if (ruleResult.isRuleOverride()) {
                // 使用业务规则的决策
                finalDecision.setDecisionSource(DecisionSource.BUSINESS_RULES);
                finalDecision.setDecision(ruleResult.getEvaluations().stream()
                    .filter(RuleEvaluation::isMatched)
                    .findFirst()
                    .map(e -> e.getAction().getDecision())
                    .orElse(null));
                finalDecision.setOverrideReason(ruleResult.getOverrideReason());
            } else {
                // 使用模型预测
                finalDecision.setDecisionSource(DecisionSource.MACHINE_LEARNING);
                finalDecision.setDecision(prediction.getPredictionResult().getPredictedClass());
                finalDecision.setConfidenceScore(prediction.getConfidenceScore());
            }
            
            finalDecision.setExplanation(explanation);
            
        } catch (Exception e) {
            log.warn("生成最终决策失败", e);
        }
        
        return finalDecision;
    }
    
    /**
     * 记录决策日志
     */
    private void logDecision(DecisionContext context, IntelligentDecisionResult result) {
        try {
            DecisionLog logEntry = new DecisionLog();
            logEntry.setDecisionType(context.getDecisionType());
            logEntry.setContextData(context.getInputData());
            logEntry.setFeatures(result.getFeatures());
            logEntry.setPrediction(result.getPrediction());
            logEntry.setFinalDecision(result.getFinalDecision());
            logEntry.setDecisionTime(new Date());
            
            loggingService.logDecision(logEntry);
        } catch (Exception e) {
            log.warn("记录决策日志失败", e);
        }
    }
    
    /**
     * 获取业务规则
     */
    private List<BusinessRule> getBusinessRules(DecisionType decisionType) {
        // 实际实现应该从数据库或规则引擎获取业务规则
        return new ArrayList<>();
    }
}
```

## 模型训练与优化

高质量的决策模型需要持续的训练和优化。

```java
// 模型训练服务
@Service
public class ModelTrainingService {
    
    @Autowired
    private TrainingDataService dataService;
    
    @Autowired
    private ModelEvaluationService evaluationService;
    
    @Autowired
    private ModelRepository modelRepository;
    
    /**
     * 训练决策模型
     * @param trainingRequest 训练请求
     * @return 训练结果
     */
    public ModelTrainingResult trainDecisionModel(ModelTrainingRequest trainingRequest) {
        ModelTrainingResult result = new ModelTrainingResult();
        result.setRequestTime(new Date());
        result.setTrainingRequest(trainingRequest);
        
        try {
            // 1. 准备训练数据
            TrainingDataset dataset = prepareTrainingData(trainingRequest);
            result.setDatasetInfo(dataset.getInfo());
            
            // 2. 数据预处理
            PreprocessingResult preprocessingResult = preprocessData(dataset, trainingRequest);
            result.setPreprocessingResult(preprocessingResult);
            
            // 3. 模型训练
            ModelTrainingOutcome trainingOutcome = trainModel(preprocessingResult, trainingRequest);
            result.setTrainingOutcome(trainingOutcome);
            
            // 4. 模型评估
            ModelEvaluationResult evaluationResult = evaluateModel(
                trainingOutcome.getTrainedModel(), preprocessingResult.getTestDataset());
            result.setEvaluationResult(evaluationResult);
            
            // 5. 模型优化
            ModelOptimizationResult optimizationResult = optimizeModel(
                trainingOutcome.getTrainedModel(), preprocessingResult.getValidationDataset());
            result.setOptimizationResult(optimizationResult);
            
            // 6. 保存模型
            if (evaluationResult.getOverallScore() >= trainingRequest.getMinimumAcceptanceScore()) {
                String modelId = saveModel(trainingOutcome.getTrainedModel(), trainingRequest);
                result.setModelId(modelId);
                result.setModelSaved(true);
                
                // 部署模型（如果需要）
                if (trainingRequest.isAutoDeploy()) {
                    deployModel(modelId);
                    result.setModelDeployed(true);
                }
            }
            
            result.setEndTime(new Date());
            result.setSuccess(true);
            result.setMessage("模型训练完成");
            
            log.info("决策模型训练完成 - 请求ID: {}", trainingRequest.getRequestId());
            
        } catch (Exception e) {
            log.error("训练决策模型失败 - 请求ID: {}", trainingRequest.getRequestId(), e);
            result.setSuccess(false);
            result.setErrorMessage("模型训练失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 准备训练数据
     */
    private TrainingDataset prepareTrainingData(ModelTrainingRequest request) {
        try {
            // 根据请求获取训练数据
            List<TrainingRecord> rawRecords = dataService.getTrainingData(
                request.getDecisionType(), request.getStartDate(), request.getEndDate());
            
            // 转换为训练数据集
            TrainingDataset dataset = new TrainingDataset();
            dataset.setRecords(rawRecords);
            dataset.setInfo(createDatasetInfo(rawRecords));
            
            log.info("训练数据准备完成 - 记录数: {}", rawRecords.size());
            
            return dataset;
            
        } catch (Exception e) {
            log.error("准备训练数据失败", e);
            throw new TrainingException("准备训练数据失败", e);
        }
    }
    
    /**
     * 创建数据集信息
     */
    private DatasetInfo createDatasetInfo(List<TrainingRecord> records) {
        DatasetInfo info = new DatasetInfo();
        info.setTotalRecords(records.size());
        info.setStartDate(records.stream().map(TrainingRecord::getTimestamp).min(Date::compareTo).orElse(null));
        info.setEndDate(records.stream().map(TrainingRecord::getTimestamp).max(Date::compareTo).orElse(null));
        
        // 统计各类别分布
        Map<String, Long> classDistribution = records.stream()
            .collect(Collectors.groupingBy(TrainingRecord::getActualDecision, Collectors.counting()));
        info.setClassDistribution(classDistribution);
        
        return info;
    }
    
    /**
     * 数据预处理
     */
    private PreprocessingResult preprocessData(TrainingDataset dataset, ModelTrainingRequest request) {
        PreprocessingResult result = new PreprocessingResult();
        
        try {
            List<TrainingRecord> records = dataset.getRecords();
            
            // 1. 数据清洗
            List<TrainingRecord> cleanedRecords = cleanData(records);
            result.setCleanedRecordsCount(cleanedRecords.size());
            
            // 2. 特征工程
            List<FeatureVector> featureVectors = engineerFeatures(cleanedRecords, request.getDecisionType());
            result.setFeatureVectorsCount(featureVectors.size());
            
            // 3. 数据分割
            DataSplitResult splitResult = splitData(featureVectors, request.getTrainTestSplitRatio());
            result.setTrainDataset(splitResult.getTrainDataset());
            result.setTestDataset(splitResult.getTestDataset());
            result.setValidationDataset(splitResult.getValidationDataset());
            
            // 4. 数据标准化
            if (request.isFeatureScalingRequired()) {
                scaleFeatures(result);
            }
            
            // 5. 处理类别不平衡
            if (request.isHandleClassImbalance()) {
                handleClassImbalance(result);
            }
            
            result.setSuccess(true);
            result.setMessage("数据预处理完成");
            
        } catch (Exception e) {
            log.error("数据预处理失败", e);
            result.setSuccess(false);
            result.setErrorMessage("数据预处理失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 数据清洗
     */
    private List<TrainingRecord> cleanData(List<TrainingRecord> records) {
        return records.stream()
            .filter(record -> record.getFeatures() != null && !record.getFeatures().isEmpty())
            .filter(record -> record.getActualDecision() != null && !record.getActualDecision().isEmpty())
            .filter(record -> isDataValid(record))
            .collect(Collectors.toList());
    }
    
    /**
     * 检查数据有效性
     */
    private boolean isDataValid(TrainingRecord record) {
        // 检查关键特征是否缺失
        Map<String, Object> features = record.getFeatures();
        for (String requiredFeature : getRequiredFeatures(record.getDecisionType())) {
            if (!features.containsKey(requiredFeature) || features.get(requiredFeature) == null) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 获取必需特征
     */
    private List<String> getRequiredFeatures(DecisionType decisionType) {
        // 根据决策类型返回必需特征列表
        switch (decisionType) {
            case LOAN_APPROVAL:
                return Arrays.asList("income", "credit_score", "debt_ratio", "employment_years");
            case CUSTOMER_SEGMENTATION:
                return Arrays.asList("age", "income", "purchase_frequency", "average_order_value");
            case FRAUD_DETECTION:
                return Arrays.asList("transaction_amount", "transaction_time", "merchant_category", "user_behavior_score");
            default:
                return new ArrayList<>();
        }
    }
    
    /**
     * 特征工程
     */
    private List<FeatureVector> engineerFeatures(List<TrainingRecord> records, DecisionType decisionType) {
        List<FeatureVector> featureVectors = new ArrayList<>();
        
        for (TrainingRecord record : records) {
            FeatureVector vector = new FeatureVector();
            vector.setRecordId(record.getId());
            vector.setActualClass(record.getActualDecision());
            vector.setTimestamp(record.getTimestamp());
            
            // 基础特征
            Map<String, Double> features = new HashMap<>();
            for (Map.Entry<String, Object> entry : record.getFeatures().entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                
                // 数值特征直接使用
                if (value instanceof Number) {
                    features.put(key, ((Number) value).doubleValue());
                }
                // 分类特征进行编码
                else if (value instanceof String) {
                    features.put(key, encodeCategoricalFeature(key, (String) value));
                }
            }
            
            // 派生特征
            Map<String, Double> derivedFeatures = createDerivedFeatures(record.getFeatures(), decisionType);
            features.putAll(derivedFeatures);
            
            vector.setFeatures(features);
            featureVectors.add(vector);
        }
        
        return featureVectors;
    }
    
    /**
     * 编码分类特征
     */
    private double encodeCategoricalFeature(String featureName, String value) {
        // 简化实现，实际应该使用更复杂的编码方法
        return value.hashCode() % 1000;
    }
    
    /**
     * 创建派生特征
     */
    private Map<String, Double> createDerivedFeatures(Map<String, Object> originalFeatures, 
        DecisionType decisionType) {
        
        Map<String, Double> derivedFeatures = new HashMap<>();
        
        switch (decisionType) {
            case LOAN_APPROVAL:
                // 收入债务比
                Number income = (Number) originalFeatures.get("income");
                Number debt = (Number) originalFeatures.get("debt");
                if (income != null && debt != null && income.doubleValue() > 0) {
                    derivedFeatures.put("debt_to_income_ratio", debt.doubleValue() / income.doubleValue());
                }
                break;
                
            case CUSTOMER_SEGMENTATION:
                // 购买频率得分
                Number frequency = (Number) originalFeatures.get("purchase_frequency");
                Number value = (Number) originalFeatures.get("average_order_value");
                if (frequency != null && value != null) {
                    derivedFeatures.put("purchase_power_score", frequency.doubleValue() * value.doubleValue());
                }
                break;
        }
        
        return derivedFeatures;
    }
    
    /**
     * 数据分割
     */
    private DataSplitResult splitData(List<FeatureVector> featureVectors, double trainTestSplitRatio) {
        DataSplitResult result = new DataSplitResult();
        
        // 随机打乱数据
        Collections.shuffle(featureVectors);
        
        int totalSize = featureVectors.size();
        int trainSize = (int) (totalSize * trainTestSplitRatio * 0.8); // 80%用于训练
        int validationSize = (int) (totalSize * trainTestSplitRatio * 0.2); // 20%用于验证
        int testSize = totalSize - trainSize - validationSize; // 剩余用于测试
        
        result.setTrainDataset(featureVectors.subList(0, trainSize));
        result.setValidationDataset(featureVectors.subList(trainSize, trainSize + validationSize));
        result.setTestDataset(featureVectors.subList(trainSize + validationSize, totalSize));
        
        return result;
    }
    
    /**
     * 特征缩放
     */
    private void scaleFeatures(PreprocessingResult result) {
        try {
            // 获取所有特征名称
            Set<String> featureNames = result.getTrainDataset().stream()
                .flatMap(vector -> vector.getFeatures().keySet().stream())
                .collect(Collectors.toSet());
            
            // 为每个特征计算均值和标准差
            Map<String, Double> means = new HashMap<>();
            Map<String, Double> stdDevs = new HashMap<>();
            
            for (String featureName : featureNames) {
                // 计算均值
                double mean = result.getTrainDataset().stream()
                    .mapToDouble(vector -> vector.getFeatures().getOrDefault(featureName, 0.0))
                    .average()
                    .orElse(0.0);
                means.put(featureName, mean);
                
                // 计算标准差
                double stdDev = Math.sqrt(result.getTrainDataset().stream()
                    .mapToDouble(vector -> Math.pow(vector.getFeatures().getOrDefault(featureName, 0.0) - mean, 2))
                    .average()
                    .orElse(0.0));
                stdDevs.put(featureName, stdDev);
            }
            
            // 应用标准化
            scaleDataset(result.getTrainDataset(), means, stdDevs);
            scaleDataset(result.getValidationDataset(), means, stdDevs);
            scaleDataset(result.getTestDataset(), means, stdDevs);
            
            result.setFeatureScalingApplied(true);
            result.setScalingParameters(new ScalingParameters(means, stdDevs));
            
        } catch (Exception e) {
            log.warn("特征缩放失败", e);
        }
    }
    
    /**
     * 缩放数据集
     */
    private void scaleDataset(List<FeatureVector> dataset, Map<String, Double> means, 
        Map<String, Double> stdDevs) {
        
        for (FeatureVector vector : dataset) {
            Map<String, Double> scaledFeatures = new HashMap<>();
            for (Map.Entry<String, Double> entry : vector.getFeatures().entrySet()) {
                String featureName = entry.getKey();
                Double value = entry.getValue();
                
                Double mean = means.get(featureName);
                Double stdDev = stdDevs.get(featureName);
                
                if (mean != null && stdDev != null && stdDev > 0) {
                    double scaledValue = (value - mean) / stdDev;
                    scaledFeatures.put(featureName, scaledValue);
                } else {
                    scaledFeatures.put(featureName, value);
                }
            }
            vector.setFeatures(scaledFeatures);
        }
    }
    
    /**
     * 处理类别不平衡
     */
    private void handleClassImbalance(PreprocessingResult result) {
        try {
            // 统计各类别样本数
            Map<String, Long> classCounts = result.getTrainDataset().stream()
                .collect(Collectors.groupingBy(FeatureVector::getActualClass, Collectors.counting()));
            
            // 找到多数类和少数类
            String majorityClass = classCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
            
            long majorityCount = classCounts.getOrDefault(majorityClass, 0L);
            
            // 对少数类进行过采样或对多数类进行欠采样
            List<FeatureVector> balancedDataset = new ArrayList<>();
            
            for (Map.Entry<String, Long> entry : classCounts.entrySet()) {
                String className = entry.getKey();
                long count = entry.getValue();
                
                List<FeatureVector> classVectors = result.getTrainDataset().stream()
                    .filter(vector -> className.equals(vector.getActualClass()))
                    .collect(Collectors.toList());
                
                if (count < majorityCount) {
                    // 过采样少数类
                    balancedDataset.addAll(oversample(classVectors, (int) (majorityCount - count)));
                } else if (count > majorityCount) {
                    // 欠采样多数类
                    balancedDataset.addAll(undersample(classVectors, (int) majorityCount));
                }
                balancedDataset.addAll(classVectors);
            }
            
            result.setTrainDataset(balancedDataset);
            result.setClassBalancingApplied(true);
            
        } catch (Exception e) {
            log.warn("处理类别不平衡失败", e);
        }
    }
    
    /**
     * 过采样
     */
    private List<FeatureVector> oversample(List<FeatureVector> vectors, int additionalSamples) {
        List<FeatureVector> oversampled = new ArrayList<>(vectors);
        
        Random random = new Random();
        for (int i = 0; i < additionalSamples; i++) {
            FeatureVector randomVector = vectors.get(random.nextInt(vectors.size()));
            // 创建略有变化的副本
            FeatureVector copy = createVariation(randomVector, random);
            oversampled.add(copy);
        }
        
        return oversampled;
    }
    
    /**
     * 创建变化副本
     */
    private FeatureVector createVariation(FeatureVector original, Random random) {
        FeatureVector copy = new FeatureVector();
        copy.setRecordId(original.getRecordId() + "_copy_" + random.nextInt(1000));
        copy.setActualClass(original.getActualClass());
        copy.setTimestamp(original.getTimestamp());
        
        Map<String, Double> variedFeatures = new HashMap<>();
        for (Map.Entry<String, Double> entry : original.getFeatures().entrySet()) {
            // 添加少量随机噪声
            double variation = (random.nextDouble() - 0.5) * 0.1; // ±5%的变化
            variedFeatures.put(entry.getKey(), entry.getValue() * (1 + variation));
        }
        copy.setFeatures(variedFeatures);
        
        return copy;
    }
    
    /**
     * 欠采样
     */
    private List<FeatureVector> undersample(List<FeatureVector> vectors, int targetSize) {
        if (vectors.size() <= targetSize) {
            return new ArrayList<>(vectors);
        }
        
        Collections.shuffle(vectors);
        return vectors.subList(0, targetSize);
    }
    
    /**
     * 模型训练
     */
    private ModelTrainingOutcome trainModel(PreprocessingResult preprocessingResult, 
        ModelTrainingRequest request) {
        
        ModelTrainingOutcome outcome = new ModelTrainingOutcome();
        outcome.setStartTime(new Date());
        
        try {
            List<FeatureVector> trainDataset = preprocessingResult.getTrainDataset();
            
            // 根据请求选择模型类型进行训练
            switch (request.getModelType()) {
                case DECISION_TREE:
                    outcome.setTrainedModel(trainDecisionTree(trainDataset, request));
                    break;
                    
                case RANDOM_FOREST:
                    outcome.setTrainedModel(trainRandomForest(trainDataset, request));
                    break;
                    
                case NEURAL_NETWORK:
                    outcome.setTrainedModel(trainNeuralNetwork(trainDataset, request));
                    break;
                    
                case GRADIENT_BOOSTING:
                    outcome.setTrainedModel(trainGradientBoosting(trainDataset, request));
                    break;
                    
                default:
                    throw new TrainingException("不支持的模型类型: " + request.getModelType());
            }
            
            outcome.setEndTime(new Date());
            outcome.setSuccess(true);
            outcome.setMessage("模型训练完成");
            
        } catch (Exception e) {
            log.error("模型训练失败", e);
            outcome.setSuccess(false);
            outcome.setErrorMessage("模型训练失败: " + e.getMessage());
        }
        
        return outcome;
    }
    
    /**
     * 训练决策树
     */
    private TrainedModel trainDecisionTree(List<FeatureVector> dataset, ModelTrainingRequest request) {
        try {
            DecisionTreeTrainer trainer = new DecisionTreeTrainer();
            trainer.setMaxDepth(request.getMaxDepth());
            trainer.setMinSamplesSplit(request.getMinSamplesSplit());
            trainer.setMinSamplesLeaf(request.getMinSamplesLeaf());
            
            return trainer.train(dataset);
        } catch (Exception e) {
            log.error("训练决策树失败", e);
            throw new TrainingException("训练决策树失败", e);
        }
    }
    
    /**
     * 训练随机森林
     */
    private TrainedModel trainRandomForest(List<FeatureVector> dataset, ModelTrainingRequest request) {
        try {
            RandomForestTrainer trainer = new RandomForestTrainer();
            trainer.setNumTrees(request.getNumTrees());
            trainer.setMaxDepth(request.getMaxDepth());
            trainer.setMinSamplesSplit(request.getMinSamplesSplit());
            
            return trainer.train(dataset);
        } catch (Exception e) {
            log.error("训练随机森林失败", e);
            throw new TrainingException("训练随机森林失败", e);
        }
    }
    
    /**
     * 保存模型
     */
    private String saveModel(TrainedModel trainedModel, ModelTrainingRequest request) {
        try {
            DecisionModel model = new DecisionModel();
            model.setId(UUID.randomUUID().toString());
            model.setDecisionType(request.getDecisionType());
            model.setModelType(request.getModelType());
            model.setModelData(trainedModel.serialize());
            model.setTrainingDate(new Date());
            model.setTrainedBy(request.getTrainedBy());
            model.setStatus(ModelStatus.ACTIVE);
            model.setVersion(1);
            
            // 保存到数据库
            modelRepository.save(model);
            
            log.info("模型保存完成 - 模型ID: {}", model.getId());
            
            return model.getId();
            
        } catch (Exception e) {
            log.error("保存模型失败", e);
            throw new TrainingException("保存模型失败", e);
        }
    }
    
    /**
     * 部署模型
     */
    private void deployModel(String modelId) {
        try {
            DecisionModel model = modelRepository.findById(modelId);
            if (model != null) {
                // 更新模型状态为已部署
                model.setStatus(ModelStatus.DEPLOYED);
                model.setDeploymentDate(new Date());
                modelRepository.save(model);
                
                log.info("模型部署完成 - 模型ID: {}", modelId);
            }
        } catch (Exception e) {
            log.error("部署模型失败 - 模型ID: {}", modelId, e);
        }
    }
}
```

## 决策效果评估与反馈

持续评估决策效果并收集反馈是优化智能决策系统的关键。

```java
// 决策效果评估服务
@Service
public class DecisionEvaluationService {
    
    @Autowired
    private DecisionLogRepository logRepository;
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private ModelPerformanceService performanceService;
    
    /**
     * 评估决策效果
     * @param evaluationRequest 评估请求
     * @return 评估结果
     */
    public DecisionEvaluationResult evaluateDecisionEffectiveness(
        DecisionEvaluationRequest evaluationRequest) {
        
        DecisionEvaluationResult result = new DecisionEvaluationResult();
        result.setRequestTime(new Date());
        result.setRequest(evaluationRequest);
        
        try {
            // 1. 收集决策日志
            List<DecisionLog> decisionLogs = collectDecisionLogs(evaluationRequest);
            result.setTotalDecisions(decisionLogs.size());
            
            // 2. 收集反馈数据
            List<DecisionFeedback> feedbacks = collectFeedbackData(evaluationRequest);
            result.setTotalFeedbacks(feedbacks.size());
            
            // 3. 计算准确性指标
            AccuracyMetrics accuracyMetrics = calculateAccuracyMetrics(decisionLogs, feedbacks);
            result.setAccuracyMetrics(accuracyMetrics);
            
            // 4. 计算业务指标
            BusinessMetrics businessMetrics = calculateBusinessMetrics(decisionLogs, feedbacks);
            result.setBusinessMetrics(businessMetrics);
            
            // 5. 分析决策分布
            DecisionDistribution distribution = analyzeDecisionDistribution(decisionLogs);
            result.setDecisionDistribution(distribution);
            
            // 6. 识别问题模式
            List<ProblemPattern> problemPatterns = identifyProblemPatterns(decisionLogs, feedbacks);
            result.setProblemPatterns(problemPatterns);
            
            // 7. 生成改进建议
            List<ImprovementSuggestion> suggestions = generateImprovementSuggestions(
                accuracyMetrics, businessMetrics, problemPatterns);
            result.setImprovementSuggestions(suggestions);
            
            // 8. 更新模型性能记录
            updateModelPerformance(evaluationRequest.getModelId(), accuracyMetrics, businessMetrics);
            
            result.setEndTime(new Date());
            result.setSuccess(true);
            result.setMessage("决策效果评估完成");
            
            log.info("决策效果评估完成 - 模型ID: {}, 决策数: {}", 
                evaluationRequest.getModelId(), decisionLogs.size());
            
        } catch (Exception e) {
            log.error("评估决策效果失败 - 模型ID: {}", evaluationRequest.getModelId(), e);
            result.setSuccess(false);
            result.setErrorMessage("评估失败: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 收集决策日志
     */
    private List<DecisionLog> collectDecisionLogs(DecisionEvaluationRequest request) {
        try {
            return logRepository.findByModelIdAndTimeRange(
                request.getModelId(), request.getStartDate(), request.getEndDate());
        } catch (Exception e) {
            log.warn("收集决策日志失败", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 收集反馈数据
     */
    private List<DecisionFeedback> collectFeedbackData(DecisionEvaluationRequest request) {
        try {
            return feedbackRepository.findByModelIdAndTimeRange(
                request.getModelId(), request.getStartDate(), request.getEndDate());
        } catch (Exception e) {
            log.warn("收集反馈数据失败", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 计算准确性指标
     */
    private AccuracyMetrics calculateAccuracyMetrics(List<DecisionLog> logs, 
        List<DecisionFeedback> feedbacks) {
        
        AccuracyMetrics metrics = new AccuracyMetrics();
        
        try {
            if (logs.isEmpty()) {
                return metrics;
            }
            
            // 将反馈数据映射到决策日志
            Map<String, DecisionFeedback> feedbackMap = feedbacks.stream()
                .collect(Collectors.toMap(DecisionFeedback::getDecisionId, feedback -> feedback));
            
            int totalDecisions = logs.size();
            int correctDecisions = 0;
            int feedbackCount = 0;
            
            for (DecisionLog log : logs) {
                DecisionFeedback feedback = feedbackMap.get(log.getId());
                if (feedback != null && feedback.getActualResult() != null) {
                    feedbackCount++;
                    
                    // 比较预测结果和实际结果
                    if (isDecisionCorrect(log.getFinalDecision().getDecision(), 
                        feedback.getActualResult())) {
                        correctDecisions++;
                    }
                }
            }
            
            // 计算准确率
            double accuracy = feedbackCount > 0 ? (double) correctDecisions / feedbackCount : 0;
            metrics.setAccuracy(accuracy);
            metrics.setTotalDecisions(totalDecisions);
            metrics.setFeedbackCount(feedbackCount);
            
            // 计算各类别的准确率
            Map<String, CategoryAccuracy> categoryAccuracies = calculateCategoryAccuracy(logs, feedbackMap);
            metrics.setCategoryAccuracies(categoryAccuracies);
            
            // 计算置信度相关指标
            ConfidenceMetrics confidenceMetrics = calculateConfidenceMetrics(logs, feedbackMap);
            metrics.setConfidenceMetrics(confidenceMetrics);
            
        } catch (Exception e) {
            log.warn("计算准确性指标失败", e);
        }
        
        return metrics;
    }
    
    /**
     * 判断决策是否正确
     */
    private boolean isDecisionCorrect(String predictedResult, String actualResult) {
        return Objects.equals(predictedResult, actualResult);
    }
    
    /**
     * 计算各类别准确率
     */
    private Map<String, CategoryAccuracy> calculateCategoryAccuracy(List<DecisionLog> logs, 
        Map<String, DecisionFeedback> feedbackMap) {
        
        Map<String, CategoryAccuracy> categoryAccuracies = new HashMap<>();
        
        // 按预测类别分组
        Map<String, List<DecisionLog>> groupedByPrediction = logs.stream()
            .collect(Collectors.groupingBy(log -> log.getFinalDecision().getDecision()));
        
        for (Map.Entry<String, List<DecisionLog>> entry : groupedByPrediction.entrySet()) {
            String category = entry.getKey();
            List<DecisionLog> categoryLogs = entry.getValue();
            
            int totalCount = categoryLogs.size();
            int correctCount = 0;
            
            for (DecisionLog log : categoryLogs) {
                DecisionFeedback feedback = feedbackMap.get(log.getId());
                if (feedback != null && feedback.getActualResult() != null) {
                    if (isDecisionCorrect(log.getFinalDecision().getDecision(), 
                        feedback.getActualResult())) {
                        correctCount++;
                    }
                }
            }
            
            CategoryAccuracy categoryAccuracy = new CategoryAccuracy();
            categoryAccuracy.setCategory(category);
            categoryAccuracy.setTotalCount(totalCount);
            categoryAccuracy.setCorrectCount(correctCount);
            categoryAccuracy.setAccuracy(totalCount > 0 ? (double) correctCount / totalCount : 0);
            
            categoryAccuracies.put(category, categoryAccuracy);
        }
        
        return categoryAccuracies;
    }
    
    /**
     * 计算置信度相关指标
     */
    private ConfidenceMetrics calculateConfidenceMetrics(List<DecisionLog> logs, 
        Map<String, DecisionFeedback> feedbackMap) {
        
        ConfidenceMetrics metrics = new ConfidenceMetrics();
        
        try {
            List<Double> confidences = new ArrayList<>();
            List<Boolean> correctness = new ArrayList<>();
            
            for (DecisionLog log : logs) {
                DecisionFeedback feedback = feedbackMap.get(log.getId());
                if (feedback != null && feedback.getActualResult() != null) {
                    Double confidence = log.getFinalDecision().getConfidenceScore();
                    if (confidence != null) {
                        confidences.add(confidence);
                        correctness.add(isDecisionCorrect(log.getFinalDecision().getDecision(), 
                            feedback.getActualResult()));
                    }
                }
            }
            
            if (!confidences.isEmpty()) {
                // 计算平均置信度
                double avgConfidence = confidences.stream().mapToDouble(Double::doubleValue).average().orElse(0);
                metrics.setAverageConfidence(avgConfidence);
                
                // 计算置信度与准确率的相关性
                double confidenceAccuracyCorrelation = calculateCorrelation(confidences, correctness);
                metrics.setConfidenceAccuracyCorrelation(confidenceAccuracyCorrelation);
                
                // 分桶分析
                Map<String, BucketMetrics> bucketMetrics = analyzeConfidenceBuckets(confidences, correctness);
                metrics.setBucketMetrics(bucketMetrics);
            }
            
        } catch (Exception e) {
            log.warn("计算置信度指标失败", e);
        }
        
        return metrics;
    }
    
    /**
     * 计算相关性
     */
    private double calculateCorrelation(List<Double> values1, List<Boolean> values2) {
        if (values1.size() != values2.size() || values1.isEmpty()) {
            return 0;
        }
        
        double mean1 = values1.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double mean2 = values2.stream().mapToDouble(b -> b ? 1.0 : 0.0).average().orElse(0);
        
        double numerator = 0;
        double denominator1 = 0;
        double denominator2 = 0;
        
        for (int i = 0; i < values1.size(); i++) {
            double diff1 = values1.get(i) - mean1;
            double diff2 = (values2.get(i) ? 1.0 : 0.0) - mean2;
            
            numerator += diff1 * diff2;
            denominator1 += diff1 * diff1;
            denominator2 += diff2 * diff2;
        }
        
        if (denominator1 == 0 || denominator2 == 0) {
            return 0;
        }
        
        return numerator / Math.sqrt(denominator1 * denominator2);
    }
    
    /**
     * 分析置信度桶
     */
    private Map<String, BucketMetrics> analyzeConfidenceBuckets(List<Double> confidences, 
        List<Boolean> correctness) {
        
        Map<String, BucketMetrics> bucketMetrics = new HashMap<>();
        
        // 定义置信度桶
        double[] buckets = {0.0, 0.2, 0.4, 0.6, 0.8, 1.0};
        String[] bucketNames = {"0-20%", "20-40%", "40-60%", "60-80%", "80-100%"};
        
        for (int i = 0; i < buckets.length - 1; i++) {
            double lowerBound = buckets[i];
            double upperBound = buckets[i + 1];
            String bucketName = bucketNames[i];
            
            int bucketCount = 0;
            int bucketCorrect = 0;
            
            for (int j = 0; j < confidences.size(); j++) {
                double confidence = confidences.get(j);
                if (confidence >= lowerBound && confidence < upperBound) {
                    bucketCount++;
                    if (correctness.get(j)) {
                        bucketCorrect++;
                    }
                }
            }
            
            if (bucketCount > 0) {
                BucketMetrics bucketMetric = new BucketMetrics();
                bucketMetric.setBucketName(bucketName);
                bucketMetric.setCount(bucketCount);
                bucketMetric.setCorrectCount(bucketCorrect);
                bucketMetric.setAccuracy((double) bucketCorrect / bucketCount);
                
                bucketMetrics.put(bucketName, bucketMetric);
            }
        }
        
        return bucketMetrics;
    }
    
    /**
     * 计算业务指标
     */
    private BusinessMetrics calculateBusinessMetrics(List<DecisionLog> logs, 
        List<DecisionFeedback> feedbacks) {
        
        BusinessMetrics metrics = new BusinessMetrics();
        
        try {
            // 计算决策效率指标
            long totalDecisionTime = logs.stream()
                .mapToLong(log -> log.getDecisionTime().getTime() - log.getRequestTime().getTime())
                .sum();
            double avgDecisionTime = logs.size() > 0 ? (double) totalDecisionTime / logs.size() : 0;
            metrics.setAverageDecisionTime(avgDecisionTime);
            
            // 计算业务价值指标（需要根据具体业务定义）
            double businessValue = calculateBusinessValue(logs, feedbacks);
            metrics.setBusinessValue(businessValue);
            
            // 计算用户满意度
            double userSatisfaction = calculateUserSatisfaction(feedbacks);
            metrics.setUserSatisfaction(userSatisfaction);
            
        } catch (Exception e) {
            log.warn("计算业务指标失败", e);
        }
        
        return metrics;
    }
    
    /**
     * 计算业务价值
     */
    private double calculateBusinessValue(List<DecisionLog> logs, List<DecisionFeedback> feedbacks) {
        // 简化实现，实际应该根据具体业务场景计算
        return logs.size() * 0.1; // 假设每个决策产生0.1的业务价值
    }
    
    /**
     * 计算用户满意度
     */
    private double calculateUserSatisfaction(List<DecisionFeedback> feedbacks) {
        if (feedbacks.isEmpty()) {
            return 0;
        }
        
        long satisfiedCount = feedbacks.stream()
            .mapToLong(DecisionFeedback::getSatisfactionScore)
            .filter(score -> score >= 4) // 4分及以上为满意
            .count();
        
        return (double) satisfiedCount / feedbacks.size();
    }
    
    /**
     * 分析决策分布
     */
    private DecisionDistribution analyzeDecisionDistribution(List<DecisionLog> logs) {
        DecisionDistribution distribution = new DecisionDistribution();
        
        try {
            // 统计各类别决策数量
            Map<String, Long> decisionCounts = logs.stream()
                .collect(Collectors.groupingBy(
                    log -> log.getFinalDecision().getDecision(),
                    Collectors.counting()));
            
            distribution.setDecisionCounts(decisionCounts);
            
            // 计算分布均匀性
            long totalDecisions = logs.size();
            double entropy = 0;
            for (Long count : decisionCounts.values()) {
                double probability = (double) count / totalDecisions;
                if (probability > 0) {
                    entropy -= probability * Math.log(probability);
                }
            }
            distribution.setEntropy(entropy);
            
        } catch (Exception e) {
            log.warn("分析决策分布失败", e);
        }
        
        return distribution;
    }
    
    /**
     * 识别问题模式
     */
    private List<ProblemPattern> identifyProblemPatterns(List<DecisionLog> logs, 
        List<DecisionFeedback> feedbacks) {
        
        List<ProblemPattern> patterns = new ArrayList<>();
        
        try {
            // 将反馈映射到日志
            Map<String, DecisionFeedback> feedbackMap = feedbacks.stream()
                .collect(Collectors.toMap(DecisionFeedback::getDecisionId, feedback -> feedback));
            
            // 按时间窗口分析
            patterns.addAll(analyzeTimeBasedPatterns(logs, feedbackMap));
            
            // 按特征分析
            patterns.addAll(analyzeFeatureBasedPatterns(logs, feedbackMap));
            
            // 按置信度分析
            patterns.addAll(analyzeConfidenceBasedPatterns(logs, feedbackMap));
            
        } catch (Exception e) {
            log.warn("识别问题模式失败", e);
        }
        
        return patterns;
    }
    
    /**
     * 分析基于时间的模式
     */
    private List<ProblemPattern> analyzeTimeBasedPatterns(List<DecisionLog> logs, 
        Map<String, DecisionFeedback> feedbackMap) {
        
        List<ProblemPattern> patterns = new ArrayList<>();
        
        // 按小时分组分析
        Map<Integer, List<DecisionLog>> hourlyGroups = logs.stream()
            .collect(Collectors.groupingBy(log -> getHourOfDay(log.getDecisionTime())));
        
        for (Map.Entry<Integer, List<DecisionLog>> entry : hourlyGroups.entrySet()) {
            int hour = entry.getKey();
            List<DecisionLog> hourlyLogs = entry.getValue();
            
            long errorCount = hourlyLogs.stream()
                .filter(log -> {
                    DecisionFeedback feedback = feedbackMap.get(log.getId());
                    return feedback != null && 
                        !isDecisionCorrect(log.getFinalDecision().getDecision(), 
                            feedback.getActualResult());
                })
                .count();
            
            double errorRate = hourlyLogs.size() > 0 ? (double) errorCount / hourlyLogs.size() : 0;
            
            // 如果错误率超过阈值，标记为问题模式
            if (errorRate > 0.1) { // 10%错误率阈值
                ProblemPattern pattern = new ProblemPattern();
                pattern.setPatternType(PatternType.TIME_BASED);
                pattern.setDescription("在" + hour + "点时段决策错误率较高: " + String.format("%.2f%%", errorRate * 100));
                pattern.setSeverity(errorRate > 0.2 ? Severity.HIGH : Severity.MEDIUM);
                patterns.add(pattern);
            }
        }
        
        return patterns;
    }
    
    /**
     * 获取小时
     */
    private int getHourOfDay(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        return calendar.get(Calendar.HOUR_OF_DAY);
    }
    
    /**
     * 生成改进建议
     */
    private List<ImprovementSuggestion> generateImprovementSuggestions(
        AccuracyMetrics accuracyMetrics, 
        BusinessMetrics businessMetrics, 
        List<ProblemPattern> problemPatterns) {
        
        List<ImprovementSuggestion> suggestions = new ArrayList<>();
        
        try {
            // 基于准确性指标的建议
            if (accuracyMetrics.getAccuracy() < 0.8) {
                ImprovementSuggestion suggestion = new ImprovementSuggestion();
                suggestion.setSuggestionType(SuggestionType.MODEL_IMPROVEMENT);
                suggestion.setDescription("模型准确率较低(" + String.format("%.2f%%", accuracyMetrics.getAccuracy() * 100) + 
                    ")，建议重新训练模型或调整特征工程");
                suggestion.setPriority(Priority.HIGH);
                suggestions.add(suggestion);
            }
            
            // 基于问题模式的建议
            for (ProblemPattern pattern : problemPatterns) {
                ImprovementSuggestion suggestion = new ImprovementSuggestion();
                suggestion.setSuggestionType(SuggestionType.PATTERN_BASED);
                suggestion.setDescription("检测到问题模式: " + pattern.getDescription());
                suggestion.setPriority(pattern.getSeverity() == Severity.HIGH ? Priority.HIGH : Priority.MEDIUM);
                suggestions.add(suggestion);
            }
            
            // 基于置信度指标的建议
            ConfidenceMetrics confidenceMetrics = accuracyMetrics.getConfidenceMetrics();
            if (confidenceMetrics != null && 
                confidenceMetrics.getConfidenceAccuracyCorrelation() < 0.3) {
                ImprovementSuggestion suggestion = new ImprovementSuggestion();
                suggestion.setSuggestionType(SuggestionType.CONFIDENCE_CALIBRATION);
                suggestion.setDescription("置信度与准确率相关性较低(" + 
                    String.format("%.2f", confidenceMetrics.getConfidenceAccuracyCorrelation()) + 
                    ")，建议校准模型置信度");
                suggestion.setPriority(Priority.MEDIUM);
                suggestions.add(suggestion);
            }
            
        } catch (Exception e) {
            log.warn("生成改进建议失败", e);
        }
        
        return suggestions;
    }
    
    /**
     * 更新模型性能记录
     */
    private void updateModelPerformance(String modelId, AccuracyMetrics accuracyMetrics, 
        BusinessMetrics businessMetrics) {
        
        try {
            ModelPerformance performance = new ModelPerformance();
            performance.setModelId(modelId);
            performance.setEvaluationTime(new Date());
            performance.setAccuracy(accuracyMetrics.getAccuracy());
            performance.setBusinessValue(businessMetrics.getBusinessValue());
            performance.setUserSatisfaction(businessMetrics.getUserSatisfaction());
            
            performanceService.saveModelPerformance(performance);
        } catch (Exception e) {
            log.warn("更新模型性能记录失败 - 模型ID: {}", modelId, e);
        }
    }
}
```

## 最佳实践与注意事项

在实现智能决策系统时，需要注意以下最佳实践：

### 1. 数据质量管理
- 确保训练数据的质量和代表性
- 建立数据清洗和验证机制
- 定期更新和维护训练数据

### 2. 模型可解释性
- 选择可解释的机器学习模型
- 提供清晰的决策解释
- 建立模型决策的审计跟踪

### 3. 持续监控与优化
- 建立实时监控机制
- 定期评估模型性能
- 实施自动化的模型更新流程

### 4. 安全与合规
- 确保决策过程中的数据安全
- 遵守相关法规和隐私保护要求
- 建立决策伦理审查机制

通过合理设计和实施智能决策系统，BPM平台能够实现更高水平的自动化决策能力，为企业创造更大的业务价值。