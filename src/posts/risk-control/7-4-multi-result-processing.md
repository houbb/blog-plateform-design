---
title: "多结果处理: 评分、标签、拦截、挑战（发送验证码）、人工审核"
date: 2025-09-07
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 多结果处理：评分、标签、拦截、挑战（发送验证码）、人工审核

## 引言

在企业级智能风控平台中，决策引擎作为风控系统的"大脑"，不仅需要做出准确的风险判断，还需要根据不同风险等级和业务场景提供多样化的处理结果。单一的拦截或放行决策已经无法满足复杂业务场景的需求，多结果处理机制应运而生。通过提供评分、标签、拦截、挑战、人工审核等多种处理方式，风控系统能够更加灵活地平衡安全与用户体验，实现精细化的风险管理。

本文将深入探讨多结果处理机制的核心原理和实现方法，详细介绍评分系统、标签体系、拦截策略、挑战机制以及人工审核流程等关键技术，为构建高效、灵活的风控决策体系提供指导。

## 一、多结果处理概述

### 1.1 多结果处理的必要性

在现代风控场景中，不同风险等级和业务场景需要采用不同的处理方式。多结果处理机制能够根据风险评估结果，自动选择最适合的处理方式，实现风险管控与用户体验的平衡。

#### 1.1.1 业务场景多样化

**风险等级差异化**：
1. **低风险场景**：直接放行，无需额外验证
2. **中低风险场景**：记录风险评分，用于后续分析
3. **中高风险场景**：发送挑战验证（如验证码）
4. **高风险场景**：直接拦截或转人工审核

**业务类型差异化**：
- **注册场景**：更注重用户体验，适度放宽风险阈值
- **交易场景**：更注重安全防护，严格控制风险
- **内容发布场景**：需要内容审核，结合自动和人工审核
- **营销活动场景**：防止作弊，但要避免误伤正常用户

#### 1.1.2 用户体验平衡

**渐进式风险控制**：
- **无感知风控**：对正常用户无任何影响
- **轻度验证**：简单的挑战验证，如图形验证码
- **中度验证**：多重验证，如短信验证码+人脸识别
- **重度验证**：人工审核，详细信息确认

**个性化处理**：
- 根据用户历史行为调整验证强度
- 根据用户等级提供差异化服务
- 根据业务场景优化处理流程

### 1.2 多结果处理架构

#### 1.2.1 技术架构设计

```
+-------------------+
|   风控决策引擎    |
| (风险评估)        |
+-------------------+
         |
         v
+-------------------+
|   结果处理器      |
| (多结果分发)      |
+-------------------+
         |
    +----+----+----+----+----+
    |    |    |    |    |    |
    v    v    v    v    v    v
+---+  +-+  +-+  +-+  +-+  +-+
|评分|  |标签| |拦截| |挑战| |人工|
|系统|  |系统| |系统| |系统| |审核|
+---+  +-+  +-+  +-+  +-+  +-+
```

#### 1.2.2 核心组件

**风险评估引擎**：
- 实时风险评分计算
- 多维度风险因子分析
- 风险等级判定

**结果分发器**：
- 多结果路由逻辑
- 处理优先级管理
- 异常处理机制

**评分系统**：
- 风险评分计算
- 评分模型管理
- 评分结果存储

**标签系统**：
- 风险标签生成
- 标签分类管理
- 标签应用策略

**拦截系统**：
- 拦截规则执行
- 拦截日志记录
- 拦截统计分析

**挑战系统**：
- 验证码生成与验证
- 多因子验证支持
- 验证结果处理

**人工审核系统**：
- 审核任务分配
- 审核流程管理
- 审核结果反馈

## 二、评分系统实现

### 2.1 风险评分模型

#### 2.1.1 评分模型设计

**多维度评分体系**：
```python
# 风险评分模型
import numpy as np
from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum

class RiskDimension(Enum):
    """风险维度枚举"""
    USER_BEHAVIOR = "user_behavior"      # 用户行为风险
    DEVICE_RISK = "device_risk"          # 设备风险
    TRANSACTION_RISK = "transaction_risk" # 交易风险
    NETWORK_RISK = "network_risk"        # 网络风险
    CONTENT_RISK = "content_risk"        # 内容风险

@dataclass
class RiskFactor:
    """风险因子"""
    name: str
    dimension: RiskDimension
    weight: float  # 权重 0-1
    score: float   # 得分 0-100
    confidence: float  # 置信度 0-1
    explanation: str   # 解释说明

class RiskScoringModel:
    """风险评分模型"""
    
    def __init__(self):
        # 各维度默认权重
        self.dimension_weights = {
            RiskDimension.USER_BEHAVIOR: 0.3,
            RiskDimension.DEVICE_RISK: 0.2,
            RiskDimension.TRANSACTION_RISK: 0.25,
            RiskDimension.NETWORK_RISK: 0.15,
            RiskDimension.CONTENT_RISK: 0.1
        }
    
    def calculate_overall_score(self, factors: List[RiskFactor]) -> Dict[str, Any]:
        """
        计算综合风险评分
        
        Args:
            factors: 风险因子列表
            
        Returns:
            包含总分、各维度得分和风险等级的字典
        """
        # 按维度分组因子
        dimension_factors = self._group_factors_by_dimension(factors)
        
        # 计算各维度得分
        dimension_scores = {}
        dimension_confidences = {}
        
        for dimension, dim_factors in dimension_factors.items():
            if dim_factors:
                # 加权平均计算维度得分
                total_weight = sum(f.weight for f in dim_factors)
                if total_weight > 0:
                    weighted_score = sum(f.score * f.weight for f in dim_factors) / total_weight
                    weighted_confidence = sum(f.confidence * f.weight for f in dim_factors) / total_weight
                else:
                    weighted_score = 0
                    weighted_confidence = 0
                
                dimension_scores[dimension.value] = weighted_score
                dimension_confidences[dimension.value] = weighted_confidence
            else:
                dimension_scores[dimension.value] = 0
                dimension_confidences[dimension.value] = 0
        
        # 计算综合得分
        total_score = sum(
            dimension_scores[dim.value] * self.dimension_weights[dim]
            for dim in RiskDimension
        )
        
        # 计算综合置信度
        total_confidence = sum(
            dimension_confidences[dim.value] * self.dimension_weights[dim]
            for dim in RiskDimension
        )
        
        # 确定风险等级
        risk_level = self._determine_risk_level(total_score)
        
        return {
            'total_score': total_score,
            'risk_level': risk_level.value,
            'confidence': total_confidence,
            'dimension_scores': dimension_scores,
            'dimension_confidences': dimension_confidences,
            'factors': [self._factor_to_dict(f) for f in factors]
        }
    
    def _group_factors_by_dimension(self, factors: List[RiskFactor]) -> Dict[RiskDimension, List[RiskFactor]]:
        """按维度分组风险因子"""
        grouped = {dim: [] for dim in RiskDimension}
        for factor in factors:
            grouped[factor.dimension].append(factor)
        return grouped
    
    def _determine_risk_level(self, score: float) -> 'RiskLevel':
        """根据得分确定风险等级"""
        if score >= 80:
            return RiskLevel.HIGH
        elif score >= 60:
            return RiskLevel.MEDIUM_HIGH
        elif score >= 40:
            return RiskLevel.MEDIUM
        elif score >= 20:
            return RiskLevel.MEDIUM_LOW
        else:
            return RiskLevel.LOW
    
    def _factor_to_dict(self, factor: RiskFactor) -> Dict[str, Any]:
        """将风险因子转换为字典"""
        return {
            'name': factor.name,
            'dimension': factor.dimension.value,
            'weight': factor.weight,
            'score': factor.score,
            'confidence': factor.confidence,
            'explanation': factor.explanation
        }

class RiskLevel(Enum):
    """风险等级枚举"""
    LOW = "low"           # 低风险
    MEDIUM_LOW = "medium_low"  # 中低风险
    MEDIUM = "medium"     # 中等风险
    MEDIUM_HIGH = "medium_high" # 中高风险
    HIGH = "high"         # 高风险

# 使用示例
def example_risk_scoring():
    """风险评分示例"""
    # 创建评分模型
    model = RiskScoringModel()
    
    # 定义风险因子
    factors = [
        RiskFactor(
            name="异常登录时间",
            dimension=RiskDimension.USER_BEHAVIOR,
            weight=0.8,
            score=75.0,
            confidence=0.9,
            explanation="用户在凌晨2点登录，偏离正常行为模式"
        ),
        RiskFactor(
            name="设备指纹风险",
            dimension=RiskDimension.DEVICE_RISK,
            weight=0.6,
            score=60.0,
            confidence=0.8,
            explanation="设备指纹与历史记录存在差异"
        ),
        RiskFactor(
            name="交易金额异常",
            dimension=RiskDimension.TRANSACTION_RISK,
            weight=0.9,
            score=85.0,
            confidence=0.95,
            explanation="交易金额远超用户历史平均水平"
        )
    ]
    
    # 计算综合评分
    result = model.calculate_overall_score(factors)
    
    print("风险评分结果:")
    print(f"综合得分: {result['total_score']:.2f}")
    print(f"风险等级: {result['risk_level']}")
    print(f"置信度: {result['confidence']:.2f}")
    print("各维度得分:")
    for dim, score in result['dimension_scores'].items():
        print(f"  {dim}: {score:.2f}")
```

#### 2.1.2 评分存储与查询

**评分数据管理**：
```python
# 评分数据存储
import json
import redis
from datetime import datetime, timedelta
from typing import Optional, List

class ScoreStorage:
    """评分存储服务"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=4,
            decode_responses=True
        )
    
    def save_score(self, user_id: str, event_id: str, score_result: Dict[str, Any]) -> bool:
        """
        保存评分结果
        
        Args:
            user_id: 用户ID
            event_id: 事件ID
            score_result: 评分结果
            
        Returns:
            保存是否成功
        """
        try:
            # 保存完整的评分结果
            score_key = f"score:{user_id}:{event_id}"
            score_data = {
                'user_id': user_id,
                'event_id': event_id,
                'score_result': json.dumps(score_result),
                'created_at': datetime.now().isoformat()
            }
            self.redis.hset(score_key, mapping=score_data)
            
            # 添加到用户评分历史
            user_scores_key = f"user_scores:{user_id}"
            self.redis.zadd(user_scores_key, {event_id: datetime.now().timestamp()})
            
            # 保留最近100条记录
            self.redis.zremrangebyrank(user_scores_key, 0, -101)
            
            # 添加到事件索引
            event_scores_key = f"event_scores:{event_id}"
            self.redis.sadd(event_scores_key, user_id)
            
            return True
        except Exception as e:
            print(f"保存评分失败: {e}")
            return False
    
    def get_score(self, user_id: str, event_id: str) -> Optional[Dict[str, Any]]:
        """
        获取评分结果
        
        Args:
            user_id: 用户ID
            event_id: 事件ID
            
        Returns:
            评分结果，如果不存在则返回None
        """
        try:
            score_key = f"score:{user_id}:{event_id}"
            score_data = self.redis.hgetall(score_key)
            
            if not score_data:
                return None
            
            return {
                'user_id': score_data['user_id'],
                'event_id': score_data['event_id'],
                'score_result': json.loads(score_data['score_result']),
                'created_at': score_data['created_at']
            }
        except Exception as e:
            print(f"获取评分失败: {e}")
            return None
    
    def get_user_score_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取用户评分历史
        
        Args:
            user_id: 用户ID
            limit: 返回记录数限制
            
        Returns:
            评分历史列表
        """
        try:
            user_scores_key = f"user_scores:{user_id}"
            # 获取最近的事件ID
            event_ids = self.redis.zrevrange(user_scores_key, 0, limit - 1)
            
            history = []
            for event_id in event_ids:
                score = self.get_score(user_id, event_id)
                if score:
                    history.append(score)
            
            return history
        except Exception as e:
            print(f"获取用户评分历史失败: {e}")
            return []
    
    def get_user_risk_trend(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """
        获取用户风险趋势
        
        Args:
            user_id: 用户ID
            days: 天数范围
            
        Returns:
            风险趋势数据
        """
        try:
            # 计算时间范围
            end_time = datetime.now()
            start_time = end_time - timedelta(days=days)
            
            user_scores_key = f"user_scores:{user_id}"
            # 获取指定时间范围内的事件ID
            event_ids = self.redis.zrevrangebyscore(
                user_scores_key,
                end_time.timestamp(),
                start_time.timestamp()
            )
            
            # 统计各风险等级的数量
            risk_level_counts = {
                'low': 0,
                'medium_low': 0,
                'medium': 0,
                'medium_high': 0,
                'high': 0
            }
            
            daily_stats = {}
            
            for event_id in event_ids:
                score = self.get_score(user_id, event_id)
                if score:
                    score_result = score['score_result']
                    risk_level = score_result['risk_level']
                    if risk_level in risk_level_counts:
                        risk_level_counts[risk_level] += 1
                    
                    # 按天统计
                    created_at = datetime.fromisoformat(score['created_at'])
                    date_str = created_at.strftime('%Y-%m-%d')
                    if date_str not in daily_stats:
                        daily_stats[date_str] = {
                            'count': 0,
                            'total_score': 0,
                            'risk_levels': {
                                'low': 0, 'medium_low': 0, 'medium': 0,
                                'medium_high': 0, 'high': 0
                            }
                        }
                    
                    daily_stats[date_str]['count'] += 1
                    daily_stats[date_str]['total_score'] += score_result['total_score']
                    daily_stats[date_str]['risk_levels'][risk_level] += 1
            
            # 计算每日平均分
            for date_str, stats in daily_stats.items():
                if stats['count'] > 0:
                    stats['avg_score'] = stats['total_score'] / stats['count']
                else:
                    stats['avg_score'] = 0
            
            return {
                'risk_level_distribution': risk_level_counts,
                'daily_trend': daily_stats,
                'total_events': len(event_ids)
            }
        except Exception as e:
            print(f"获取用户风险趋势失败: {e}")
            return {}

# 评分服务
class ScoreService:
    """评分服务"""
    
    def __init__(self, scoring_model: RiskScoringModel, storage: ScoreStorage):
        self.scoring_model = scoring_model
        self.storage = storage
    
    def process_risk_scoring(self, user_id: str, event_id: str, 
                           risk_factors: List[RiskFactor]) -> Dict[str, Any]:
        """
        处理风险评分
        
        Args:
            user_id: 用户ID
            event_id: 事件ID
            risk_factors: 风险因子列表
            
        Returns:
            评分结果
        """
        # 计算综合评分
        score_result = self.scoring_model.calculate_overall_score(risk_factors)
        
        # 添加事件信息
        score_result['user_id'] = user_id
        score_result['event_id'] = event_id
        score_result['timestamp'] = datetime.now().isoformat()
        
        # 保存评分结果
        self.storage.save_score(user_id, event_id, score_result)
        
        return score_result
    
    def get_user_risk_profile(self, user_id: str) -> Dict[str, Any]:
        """
        获取用户风险画像
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户风险画像
        """
        # 获取用户评分历史
        history = self.storage.get_user_score_history(user_id, 50)
        
        if not history:
            return {
                'user_id': user_id,
                'risk_level': 'unknown',
                'avg_score': 0,
                'total_events': 0,
                'risk_trend': {}
            }
        
        # 计算统计数据
        total_score = sum(item['score_result']['total_score'] for item in history)
        avg_score = total_score / len(history)
        
        # 确定用户整体风险等级
        risk_level = self.scoring_model._determine_risk_level(avg_score)
        
        # 获取风险趋势
        risk_trend = self.storage.get_user_risk_trend(user_id, 30)
        
        return {
            'user_id': user_id,
            'risk_level': risk_level.value,
            'avg_score': avg_score,
            'total_events': len(history),
            'risk_trend': risk_trend,
            'recent_scores': history[:10]  # 最近10次评分
        }

# 使用示例
def example_score_service():
    """评分服务使用示例"""
    # 初始化服务
    scoring_model = RiskScoringModel()
    storage = ScoreStorage()
    score_service = ScoreService(scoring_model, storage)
    
    # 模拟风险因子
    factors = [
        RiskFactor(
            name="异常登录时间",
            dimension=RiskDimension.USER_BEHAVIOR,
            weight=0.8,
            score=75.0,
            confidence=0.9,
            explanation="用户在凌晨2点登录，偏离正常行为模式"
        ),
        RiskFactor(
            name="设备指纹风险",
            dimension=RiskDimension.DEVICE_RISK,
            weight=0.6,
            score=60.0,
            confidence=0.8,
            explanation="设备指纹与历史记录存在差异"
        )
    ]
    
    # 处理评分
    result = score_service.process_risk_scoring(
        user_id="user_123",
        event_id="event_456",
        risk_factors=factors
    )
    
    print("评分结果:", result)
    
    # 获取用户风险画像
    profile = score_service.get_user_risk_profile("user_123")
    print("用户风险画像:", profile)
```

### 2.2 动态评分调整

#### 2.2.1 评分模型优化

**自适应评分模型**：
```python
# 自适应评分模型
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score

class AdaptiveScoringModel:
    """自适应评分模型"""
    
    def __init__(self):
        self.models = {}
        self.model_weights = {}
        self.feedback_data = []
        self.is_trained = False
    
    def add_feedback(self, score_result: Dict[str, Any], actual_outcome: str):
        """
        添加反馈数据
        
        Args:
            score_result: 评分结果
            actual_outcome: 实际结果 ('fraud', 'legitimate')
        """
        feedback_record = {
            'score_result': score_result,
            'actual_outcome': actual_outcome,
            'timestamp': datetime.now().isoformat()
        }
        self.feedback_data.append(feedback_record)
        
        # 当积累足够数据时重新训练模型
        if len(self.feedback_data) >= 1000 and len(self.feedback_data) % 100 == 0:
            self._retrain_models()
    
    def _retrain_models(self):
        """重新训练模型"""
        if len(self.feedback_data) < 100:
            return
        
        # 准备训练数据
        X, y = self._prepare_training_data()
        if len(X) < 50:  # 数据量不足
            return
        
        # 分割训练和测试数据
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # 训练多个模型
        models = {
            'logistic': LogisticRegression(random_state=42),
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42)
        }
        
        model_scores = {}
        for name, model in models.items():
            # 训练模型
            model.fit(X_train, y_train)
            
            # 评估模型
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, pos_label='fraud')
            recall = recall_score(y_test, y_pred, pos_label='fraud')
            
            model_scores[name] = {
                'model': model,
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall
            }
        
        # 选择最佳模型
        best_model_name = max(model_scores.keys(), 
                            key=lambda x: model_scores[x]['accuracy'])
        self.models['best'] = model_scores[best_model_name]['model']
        
        # 计算模型权重（基于性能）
        total_performance = sum(
            scores['accuracy'] + scores['precision'] + scores['recall']
            for scores in model_scores.values()
        )
        
        for name, scores in model_scores.items():
            performance = scores['accuracy'] + scores['precision'] + scores['recall']
            self.model_weights[name] = performance / total_performance if total_performance > 0 else 0
        
        self.is_trained = True
        print(f"模型重新训练完成，最佳模型: {best_model_name}")
    
    def _prepare_training_data(self):
        """准备训练数据"""
        X = []
        y = []
        
        for record in self.feedback_data[-5000:]:  # 使用最近5000条数据
            score_result = record['score_result']
            outcome = record['actual_outcome']
            
            # 提取特征
            features = [
                score_result['total_score'],
                score_result['confidence'],
                # 各维度得分
                *[score for score in score_result['dimension_scores'].values()],
                # 风险因子数量
                len(score_result['factors'])
            ]
            
            X.append(features)
            y.append(outcome)
        
        return np.array(X), np.array(y)
    
    def predict_risk_probability(self, score_result: Dict[str, Any]) -> float:
        """
        预测风险概率
        
        Args:
            score_result: 评分结果
            
        Returns:
            风险概率 (0-1)
        """
        if not self.is_trained or 'best' not in self.models:
            # 使用基础评分作为概率
            return score_result['total_score'] / 100.0
        
        # 提取特征
        features = [
            score_result['total_score'],
            score_result['confidence'],
            *[score for score in score_result['dimension_scores'].values()],
            len(score_result['factors'])
        ]
        
        # 使用训练好的模型预测
        model = self.models['best']
        probability = model.predict_proba([features])[0]
        
        # 返回欺诈概率
        fraud_index = np.where(model.classes_ == 'fraud')[0]
        if len(fraud_index) > 0:
            return probability[fraud_index[0]]
        else:
            return 0.0

# 在线学习机制
class OnlineLearningScoring:
    """在线学习评分"""
    
    def __init__(self, base_model: RiskScoringModel):
        self.base_model = base_model
        self.adaptive_model = AdaptiveScoringModel()
        self.user_behavior_profiles = {}  # 用户行为画像
    
    def calculate_score(self, user_id: str, factors: List[RiskFactor]) -> Dict[str, Any]:
        """
        计算评分（结合自适应模型）
        
        Args:
            user_id: 用户ID
            factors: 风险因子列表
            
        Returns:
            评分结果
        """
        # 基础评分
        base_result = self.base_model.calculate_overall_score(factors)
        
        # 获取用户行为画像
        user_profile = self._get_user_profile(user_id)
        
        # 调整个人化评分
        personalized_result = self._personalize_score(base_result, user_profile)
        
        # 如果有自适应模型，添加概率预测
        if self.adaptive_model.is_trained:
            fraud_probability = self.adaptive_model.predict_risk_probability(personalized_result)
            personalized_result['fraud_probability'] = fraud_probability
        
        return personalized_result
    
    def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """获取用户行为画像"""
        if user_id not in self.user_behavior_profiles:
            self.user_behavior_profiles[user_id] = {
                'risk_history': [],
                'behavior_patterns': {},
                'trust_score': 0.5  # 初始信任分
            }
        
        return self.user_behavior_profiles[user_id]
    
    def _personalize_score(self, base_result: Dict[str, Any], 
                          user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """个性化评分调整"""
        # 基于用户历史调整评分
        risk_history = user_profile['risk_history']
        if len(risk_history) > 0:
            # 计算用户历史平均风险分
            avg_historical_score = np.mean([h['total_score'] for h in risk_history[-10:]])
            
            # 如果用户历史表现良好，适当降低风险评分
            if avg_historical_score < 30:  # 历史低风险
                adjustment_factor = 0.9  # 降低10%
                base_result['total_score'] *= adjustment_factor
                base_result['risk_level'] = self.base_model._determine_risk_level(
                    base_result['total_score']
                ).value
        
        # 基于信任分调整
        trust_score = user_profile['trust_score']
        if trust_score > 0.8:  # 高信任用户
            base_result['total_score'] *= 0.8
            base_result['risk_level'] = self.base_model._determine_risk_level(
                base_result['total_score']
            ).value
        
        return base_result
    
    def update_user_profile(self, user_id: str, score_result: Dict[str, Any], 
                           actual_outcome: str):
        """
        更新用户行为画像
        
        Args:
            user_id: 用户ID
            score_result: 评分结果
            actual_outcome: 实际结果
        """
        if user_id not in self.user_behavior_profiles:
            self.user_behavior_profiles[user_id] = {
                'risk_history': [],
                'behavior_patterns': {},
                'trust_score': 0.5
            }
        
        user_profile = self.user_behavior_profiles[user_id]
        
        # 添加到风险历史
        user_profile['risk_history'].append(score_result)
        
        # 保留最近100条记录
        if len(user_profile['risk_history']) > 100:
            user_profile['risk_history'] = user_profile['risk_history'][-100:]
        
        # 更新信任分
        if actual_outcome == 'legitimate':
            # 合法行为，增加信任分
            user_profile['trust_score'] = min(1.0, user_profile['trust_score'] + 0.01)
        elif actual_outcome == 'fraud':
            # 欺诈行为，降低信任分
            user_profile['trust_score'] = max(0.0, user_profile['trust_score'] - 0.1)
        
        # 添加反馈数据用于模型训练
        self.adaptive_model.add_feedback(score_result, actual_outcome)

# 使用示例
def example_adaptive_scoring():
    """自适应评分示例"""
    # 初始化模型
    base_model = RiskScoringModel()
    adaptive_scoring = OnlineLearningScoring(base_model)
    
    # 模拟评分过程
    factors = [
        RiskFactor(
            name="异常登录时间",
            dimension=RiskDimension.USER_BEHAVIOR,
            weight=0.8,
            score=75.0,
            confidence=0.9,
            explanation="用户在凌晨2点登录，偏离正常行为模式"
        )
    ]
    
    # 计算评分
    result = adaptive_scoring.calculate_score("user_123", factors)
    print("自适应评分结果:", result)
    
    # 模拟反馈（用户实际是合法用户）
    adaptive_scoring.update_user_profile("user_123", result, "legitimate")
```

## 三、标签系统实现

### 3.1 标签体系设计

#### 3.1.1 标签分类与定义

**风险标签体系**：
```python
# 风险标签体系
from enum import Enum
from typing import List, Dict, Any
import json

class TagCategory(Enum):
    """标签分类"""
    BEHAVIOR = "behavior"        # 行为标签
    DEVICE = "device"            # 设备标签
    TRANSACTION = "transaction"  # 交易标签
    NETWORK = "network"          # 网络标签
    CONTENT = "content"          # 内容标签
    COMPOSITE = "composite"      # 综合标签

class RiskTag:
    """风险标签"""
    
    def __init__(self, name: str, category: TagCategory, 
                 description: str, severity: int, 
                 auto_apply: bool = True):
        self.name = name
        self.category = category
        self.description = description
        self.severity = severity  # 严重程度 1-5
        self.auto_apply = auto_apply  # 是否自动应用
        self.created_at = datetime.now()
    
    def to_dict(self):
        """转换为字典"""
        return {
            'name': self.name,
            'category': self.category.value,
            'description': self.description,
            'severity': self.severity,
            'auto_apply': self.auto_apply,
            'created_at': self.created_at.isoformat()
        }

class TagSystem:
    """标签系统"""
    
    def __init__(self):
        self.tags = {}
        self._initialize_default_tags()
    
    def _initialize_default_tags(self):
        """初始化默认标签"""
        default_tags = [
            # 行为标签
            RiskTag("频繁登录", TagCategory.BEHAVIOR, "短时间内多次登录", 2),
            RiskTag("异常时间操作", TagCategory.BEHAVIOR, "在异常时间段进行操作", 2),
            RiskTag("批量注册", TagCategory.BEHAVIOR, "短时间内大量注册账号", 4),
            RiskTag("模拟操作", TagCategory.BEHAVIOR, "检测到自动化操作行为", 3),
            
            # 设备标签
            RiskTag("模拟器", TagCategory.DEVICE, "检测到模拟器环境", 3),
            RiskTag("越狱设备", TagCategory.DEVICE, "检测到越狱/Root设备", 4),
            RiskTag("设备共享", TagCategory.DEVICE, "多个账户使用同一设备", 2),
            RiskTag("设备异常", TagCategory.DEVICE, "设备指纹异常", 3),
            
            # 交易标签
            RiskTag("大额交易", TagCategory.TRANSACTION, "交易金额超过阈值", 3),
            RiskTag("高频交易", TagCategory.TRANSACTION, "短时间内多次交易", 3),
            RiskTag("异常收款", TagCategory.TRANSACTION, "收款账户存在风险", 4),
            RiskTag("套现行为", TagCategory.TRANSACTION, "疑似信用卡套现", 5),
            
            # 网络标签
            RiskTag("代理IP", TagCategory.NETWORK, "使用代理IP访问", 2),
            RiskTag("黑产IP", TagCategory.NETWORK, "IP地址在黑产库中", 5),
            RiskTag("VPN", TagCategory.NETWORK, "检测到VPN使用", 2),
            RiskTag("网络异常", TagCategory.NETWORK, "网络环境异常", 3),
            
            # 内容标签
            RiskTag("敏感内容", TagCategory.CONTENT, "包含敏感词汇", 3),
            RiskTag("垃圾信息", TagCategory.CONTENT, "发布垃圾信息", 3),
            RiskTag("恶意链接", TagCategory.CONTENT, "包含恶意链接", 4),
            RiskTag("虚假宣传", TagCategory.CONTENT, "虚假宣传内容", 3),
            
            # 综合标签
            RiskTag("高风险用户", TagCategory.COMPOSITE, "综合评估为高风险用户", 5, False),
            RiskTag("可疑行为", TagCategory.COMPOSITE, "存在可疑行为模式", 3, False),
            RiskTag("重点关注", TagCategory.COMPOSITE, "需要重点关注的用户", 4, False)
        ]
        
        for tag in default_tags:
            self.tags[tag.name] = tag
    
    def add_tag(self, tag: RiskTag):
        """添加标签"""
        self.tags[tag.name] = tag
    
    def get_tag(self, tag_name: str) -> Optional[RiskTag]:
        """获取标签"""
        return self.tags.get(tag_name)
    
    def list_tags(self, category: Optional[TagCategory] = None) -> List[RiskTag]:
        """列出标签"""
        if category:
            return [tag for tag in self.tags.values() if tag.category == category]
        return list(self.tags.values())
    
    def apply_tags(self, risk_factors: List[RiskFactor]) -> List[str]:
        """
        根据风险因子自动应用标签
        
        Args:
            risk_factors: 风险因子列表
            
        Returns:
            应用的标签列表
        """
        applied_tags = []
        
        for factor in risk_factors:
            tags = self._get_tags_for_factor(factor)
            applied_tags.extend(tags)
        
        # 去重
        return list(set(applied_tags))
    
    def _get_tags_for_factor(self, factor: RiskFactor) -> List[str]:
        """根据风险因子获取对应标签"""
        tags = []
        
        # 根据因子名称和维度匹配标签
        factor_name = factor.name.lower()
        dimension = factor.dimension
        
        if dimension == RiskDimension.USER_BEHAVIOR:
            if "频繁" in factor_name or "批量" in factor_name:
                tags.append("频繁登录")
            if "时间" in factor_name or "凌晨" in factor_name:
                tags.append("异常时间操作")
            if "模拟" in factor_name:
                tags.append("模拟操作")
        
        elif dimension == RiskDimension.DEVICE_RISK:
            if "模拟器" in factor_name:
                tags.append("模拟器")
            if "越狱" in factor_name or "root" in factor_name:
                tags.append("越狱设备")
            if "共享" in factor_name:
                tags.append("设备共享")
            if "异常" in factor_name:
                tags.append("设备异常")
        
        elif dimension == RiskDimension.TRANSACTION_RISK:
            if "大额" in factor_name or "金额" in factor_name:
                tags.append("大额交易")
            if "频繁" in factor_name or "高频" in factor_name:
                tags.append("高频交易")
            if "套现" in factor_name:
                tags.append("套现行为")
        
        elif dimension == RiskDimension.NETWORK_RISK:
            if "代理" in factor_name:
                tags.append("代理IP")
            if "vpn" in factor_name:
                tags.append("VPN")
            if "异常" in factor_name:
                tags.append("网络异常")
        
        elif dimension == RiskDimension.CONTENT_RISK:
            if "敏感" in factor_name:
                tags.append("敏感内容")
            if "垃圾" in factor_name:
                tags.append("垃圾信息")
            if "恶意" in factor_name:
                tags.append("恶意链接")
            if "虚假" in factor_name:
                tags.append("虚假宣传")
        
        return tags

# 标签存储服务
class TagStorage:
    """标签存储服务"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=5,
            decode_responses=True
        )
    
    def save_user_tags(self, user_id: str, event_id: str, tags: List[str]) -> bool:
        """
        保存用户标签
        
        Args:
            user_id: 用户ID
            event_id: 事件ID
            tags: 标签列表
            
        Returns:
            保存是否成功
        """
        try:
            # 保存事件标签
            event_tags_key = f"event_tags:{user_id}:{event_id}"
            self.redis.sadd(event_tags_key, *tags)
            self.redis.expire(event_tags_key, 86400 * 30)  # 保存30天
            
            # 添加到用户标签历史
            user_tags_key = f"user_tags:{user_id}"
            for tag in tags:
                self.redis.zadd(user_tags_key, {tag: datetime.now().timestamp()})
            
            # 保留最近1000条记录
            self.redis.zremrangebyrank(user_tags_key, 0, -1001)
            
            # 更新用户标签统计
            self._update_user_tag_statistics(user_id, tags)
            
            return True
        except Exception as e:
            print(f"保存用户标签失败: {e}")
            return False
    
    def get_event_tags(self, user_id: str, event_id: str) -> List[str]:
        """
        获取事件标签
        
        Args:
            user_id: 用户ID
            event_id: 事件ID
            
        Returns:
            标签列表
        """
        try:
            event_tags_key = f"event_tags:{user_id}:{event_id}"
            return list(self.redis.smembers(event_tags_key))
        except Exception as e:
            print(f"获取事件标签失败: {e}")
            return []
    
    def get_user_tag_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        获取用户标签历史
        
        Args:
            user_id: 用户ID
            limit: 返回记录数限制
            
        Returns:
            标签历史列表
        """
        try:
            user_tags_key = f"user_tags:{user_id}"
            # 获取最近的标签
            tags_with_timestamp = self.redis.zrevrange(
                user_tags_key, 0, limit - 1, withscores=True
            )
            
            history = []
            for tag, timestamp in tags_with_timestamp:
                history.append({
                    'tag': tag,
                    'timestamp': datetime.fromtimestamp(timestamp).isoformat()
                })
            
            return history
        except Exception as e:
            print(f"获取用户标签历史失败: {e}")
            return []
    
    def get_user_tag_statistics(self, user_id: str) -> Dict[str, int]:
        """
        获取用户标签统计
        
        Args:
            user_id: 用户ID
            
        Returns:
            标签统计字典
        """
        try:
            stats_key = f"user_tag_stats:{user_id}"
            stats = self.redis.hgetall(stats_key)
            return {tag: int(count) for tag, count in stats.items()}
        except Exception as e:
            print(f"获取用户标签统计失败: {e}")
            return {}
    
    def _update_user_tag_statistics(self, user_id: str, tags: List[str]):
        """更新用户标签统计"""
        try:
            stats_key = f"user_tag_stats:{user_id}"
            # 增加标签计数
            for tag in tags:
                self.redis.hincrby(stats_key, tag, 1)
        except Exception as e:
            print(f"更新用户标签统计失败: {e}")

# 标签服务
class TagService:
    """标签服务"""
    
    def __init__(self, tag_system: TagSystem, storage: TagStorage):
        self.tag_system = tag_system
        self.storage = storage
    
    def process_tags(self, user_id: str, event_id: str, 
                    risk_factors: List[RiskFactor]) -> List[str]:
        """
        处理标签生成和存储
        
        Args:
            user_id: 用户ID
            event_id: 事件ID
            risk_factors: 风险因子列表
            
        Returns:
            生成的标签列表
        """
        # 自动生成标签
        auto_tags = self.tag_system.apply_tags(risk_factors)
        
        # 可以在这里添加业务规则生成的标签
        business_tags = self._apply_business_rules(user_id, risk_factors)
        
        # 合并所有标签
        all_tags = list(set(auto_tags + business_tags))
        
        # 保存标签
        self.storage.save_user_tags(user_id, event_id, all_tags)
        
        return all_tags
    
    def _apply_business_rules(self, user_id: str, 
                           risk_factors: List[RiskFactor]) -> List[str]:
        """
        应用业务规则生成标签
        
        Args:
            user_id: 用户ID
            risk_factors: 风险因子列表
            
        Returns:
            业务规则生成的标签列表
        """
        business_tags = []
        
        # 获取用户历史标签统计
        tag_stats = self.storage.get_user_tag_statistics(user_id)
        
        # 根据历史行为生成综合标签
        high_risk_tags = ['套现行为', '黑产IP', '越狱设备', '批量注册']
        high_risk_count = sum(tag_stats.get(tag, 0) for tag in high_risk_tags)
        
        if high_risk_count >= 3:
            business_tags.append('高风险用户')
        
        frequent_tags = ['频繁登录', '高频交易', '设备共享']
        frequent_count = sum(tag_stats.get(tag, 0) for tag in frequent_tags)
        
        if frequent_count >= 5:
            business_tags.append('可疑行为')
        
        return business_tags
    
    def get_user_tag_profile(self, user_id: str) -> Dict[str, Any]:
        """
        获取用户标签画像
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户标签画像
        """
        # 获取标签历史
        tag_history = self.storage.get_user_tag_history(user_id, 100)
        
        # 获取标签统计
        tag_stats = self.storage.get_user_tag_statistics(user_id)
        
        # 分类统计
        category_stats = {}
        severity_stats = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        
        for tag_name, count in tag_stats.items():
            tag = self.tag_system.get_tag(tag_name)
            if tag:
                # 分类统计
                category = tag.category.value
                if category not in category_stats:
                    category_stats[category] = 0
                category_stats[category] += count
                
                # 严重程度统计
                severity_stats[tag.severity] += count
        
        return {
            'user_id': user_id,
            'tag_statistics': tag_stats,
            'category_statistics': category_stats,
            'severity_statistics': severity_stats,
            'recent_tags': tag_history[:20],  # 最近20个标签
            'total_tag_events': len(tag_history)
        }

# 使用示例
def example_tag_system():
    """标签系统使用示例"""
    # 初始化系统
    tag_system = TagSystem()
    tag_storage = TagStorage()
    tag_service = TagService(tag_system, tag_storage)
    
    # 模拟风险因子
    factors = [
        RiskFactor(
            name="批量注册行为",
            dimension=RiskDimension.USER_BEHAVIOR,
            weight=0.9,
            score=80.0,
            confidence=0.95,
            explanation="短时间内大量注册账号"
        ),
        RiskFactor(
            name="设备指纹异常",
            dimension=RiskDimension.DEVICE_RISK,
            weight=0.7,
            score=65.0,
            confidence=0.8,
            explanation="设备指纹与历史记录存在较大差异"
        )
    ]
    
    # 处理标签
    tags = tag_service.process_tags("user_123", "event_456", factors)
    print("生成的标签:", tags)
    
    # 获取用户标签画像
    profile = tag_service.get_user_tag_profile("user_123")
    print("用户标签画像:", json.dumps(profile, indent=2, ensure_ascii=False))
```

### 3.2 标签应用场景

#### 3.2.1 用户画像构建

**基于标签的用户画像**：
```python
# 用户画像系统
from collections import defaultdict
from typing import Set

class UserProfile:
    """用户画像"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.tags: Set[str] = set()
        self.risk_score_history: List[float] = []
        self.behavior_patterns = {}
        self.trust_score = 0.5
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class UserProfileBuilder:
    """用户画像构建器"""
    
    def __init__(self, tag_service: TagService, score_service: ScoreService):
        self.tag_service = tag_service
        self.score_service = score_service
        self.user_profiles: Dict[str, UserProfile] = {}
    
    def build_profile(self, user_id: str) -> UserProfile:
        """
        构建用户画像
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户画像
        """
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = UserProfile(user_id)
        
        profile = self.user_profiles[user_id]
        
        # 更新标签信息
        tag_profile = self.tag_service.get_user_tag_profile(user_id)
        profile.tags = set(tag_profile['tag_statistics'].keys())
        
        # 更新风险评分历史
        score_history = self.score_service.storage.get_user_score_history(user_id, 20)
        profile.risk_score_history = [
            item['score_result']['total_score'] for item in score_history
        ]
        
        # 更新信任分
        profile.trust_score = self._calculate_trust_score(profile, tag_profile)
        
        # 更新行为模式
        profile.behavior_patterns = self._analyze_behavior_patterns(tag_profile)
        
        profile.updated_at = datetime.now()
        
        return profile
    
    def _calculate_trust_score(self, profile: UserProfile, 
                             tag_profile: Dict[str, Any]) -> float:
        """计算信任分"""
        # 基于标签统计计算信任分
        tag_stats = tag_profile['tag_statistics']
        
        # 高风险标签扣分
        high_risk_tags = ['套现行为', '黑产IP', '越狱设备', '批量注册', '恶意链接']
        high_risk_penalty = sum(tag_stats.get(tag, 0) * 0.1 for tag in high_risk_tags)
        
        # 低风险标签加分
        low_risk_tags = ['正常行为', '长期用户', '良好记录']
        low_risk_bonus = sum(tag_stats.get(tag, 0) * 0.05 for tag in low_risk_tags)
        
        # 基于风险评分历史调整
        if profile.risk_score_history:
            avg_score = sum(profile.risk_score_history) / len(profile.risk_score_history)
            score_adjustment = max(0, (50 - avg_score) / 100)  # 平均分越低，信任分越高
        else:
            score_adjustment = 0
        
        trust_score = 0.5 - high_risk_penalty + low_risk_bonus + score_adjustment
        return max(0.0, min(1.0, trust_score))  # 限制在0-1之间
    
    def _analyze_behavior_patterns(self, tag_profile: Dict[str, Any]) -> Dict[str, Any]:
        """分析行为模式"""
        patterns = {}
        
        # 分析活跃度
        total_events = tag_profile['total_tag_events']
        if total_events > 100:
            patterns['activity_level'] = 'high'
        elif total_events > 10:
            patterns['activity_level'] = 'medium'
        else:
            patterns['activity_level'] = 'low'
        
        # 分析风险倾向
        severity_stats = tag_profile['severity_statistics']
        high_severity_count = severity_stats[4] + severity_stats[5]
        low_severity_count = severity_stats[1] + severity_stats[2]
        
        if high_severity_count > low_severity_count * 2:
            patterns['risk_tendency'] = 'high'
        elif low_severity_count > high_severity_count * 2:
            patterns['risk_tendency'] = 'low'
        else:
            patterns['risk_tendency'] = 'medium'
        
        # 分析行为类型
        category_stats = tag_profile['category_statistics']
        dominant_category = max(category_stats.keys(), 
                              key=lambda x: category_stats[x]) if category_stats else 'unknown'
        patterns['dominant_behavior'] = dominant_category
        
        return patterns
    
    def get_user_segments(self, user_id: str) -> List[str]:
        """
        获取用户分群
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户分群列表
        """
        profile = self.build_profile(user_id)
        
        segments = []
        
        # 基于信任分分群
        if profile.trust_score >= 0.8:
            segments.append('high_trust')
        elif profile.trust_score >= 0.5:
            segments.append('medium_trust')
        else:
            segments.append('low_trust')
        
        # 基于活跃度分群
        if profile.behavior_patterns.get('activity_level') == 'high':
            segments.append('high_activity')
        elif profile.behavior_patterns.get('activity_level') == 'low':
            segments.append('low_activity')
        
        # 基于风险倾向分群
        if profile.behavior_patterns.get('risk_tendency') == 'high':
            segments.append('high_risk')
        elif profile.behavior_patterns.get('risk_tendency') == 'low':
            segments.append('low_risk')
        
        # 基于行为类型分群
        dominant_behavior = profile.behavior_patterns.get('dominant_behavior')
        if dominant_behavior:
            segments.append(f"{dominant_behavior}_behavior")
        
        return segments

# 用户画像存储
class UserProfileStorage:
    """用户画像存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=6,
            decode_responses=True
        )
    
    def save_profile(self, profile: UserProfile) -> bool:
        """
        保存用户画像
        
        Args:
            profile: 用户画像
            
        Returns:
            保存是否成功
        """
        try:
            profile_key = f"user_profile:{profile.user_id}"
            profile_data = {
                'user_id': profile.user_id,
                'tags': json.dumps(list(profile.tags)),
                'risk_score_history': json.dumps(profile.risk_score_history),
                'behavior_patterns': json.dumps(profile.behavior_patterns),
                'trust_score': profile.trust_score,
                'created_at': profile.created_at.isoformat(),
                'updated_at': profile.updated_at.isoformat()
            }
            self.redis.hset(profile_key, mapping=profile_data)
            return True
        except Exception as e:
            print(f"保存用户画像失败: {e}")
            return False
    
    def get_profile(self, user_id: str) -> Optional[UserProfile]:
        """
        获取用户画像
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户画像，如果不存在则返回None
        """
        try:
            profile_key = f"user_profile:{user_id}"
            profile_data = self.redis.hgetall(profile_key)
            
            if not profile_data:
                return None
            
            profile = UserProfile(user_id)
            profile.tags = set(json.loads(profile_data['tags']))
            profile.risk_score_history = json.loads(profile_data['risk_score_history'])
            profile.behavior_patterns = json.loads(profile_data['behavior_patterns'])
            profile.trust_score = float(profile_data['trust_score'])
            profile.created_at = datetime.fromisoformat(profile_data['created_at'])
            profile.updated_at = datetime.fromisoformat(profile_data['updated_at'])
            
            return profile
        except Exception as e:
            print(f"获取用户画像失败: {e}")
            return None

# 用户画像服务
class UserProfileService:
    """用户画像服务"""
    
    def __init__(self, profile_builder: UserProfileBuilder, 
                 storage: UserProfileStorage):
        self.profile_builder = profile_builder
        self.storage = storage
    
    def get_user_profile(self, user_id: str) -> UserProfile:
        """
        获取用户画像
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户画像
        """
        # 先从缓存获取
        profile = self.storage.get_profile(user_id)
        if not profile:
            # 构建新的画像
            profile = self.profile_builder.build_profile(user_id)
            # 保存到存储
            self.storage.save_profile(profile)
        
        return profile
    
    def update_user_profile(self, user_id: str) -> UserProfile:
        """
        更新用户画像
        
        Args:
            user_id: 用户ID
            
        Returns:
            更新后的用户画像
        """
        # 重新构建画像
        profile = self.profile_builder.build_profile(user_id)
        # 保存到存储
        self.storage.save_profile(profile)
        return profile
    
    def get_user_segments(self, user_id: str) -> List[str]:
        """
        获取用户分群
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户分群列表
        """
        profile = self.get_user_profile(user_id)
        return self.profile_builder.get_user_segments(user_id)
    
    def get_similar_users(self, user_id: str, limit: int = 10) -> List[str]:
        """
        获取相似用户
        
        Args:
            user_id: 用户ID
            limit: 返回用户数限制
            
        Returns:
            相似用户ID列表
        """
        # 简化实现：基于标签相似度
        target_profile = self.get_user_profile(user_id)
        target_tags = target_profile.tags
        
        # 获取所有用户画像
        # 这里应该从存储中获取，简化实现直接返回空列表
        similar_users = []
        
        return similar_users

# 使用示例
def example_user_profile():
    """用户画像使用示例"""
    # 初始化服务
    tag_system = TagSystem()
    tag_storage = TagStorage()
    tag_service = TagService(tag_system, tag_storage)
    
    scoring_model = RiskScoringModel()
    score_storage = ScoreStorage()
    score_service = ScoreService(scoring_model, score_storage)
    
    profile_builder = UserProfileBuilder(tag_service, score_service)
    profile_storage = UserProfileStorage()
    profile_service = UserProfileService(profile_builder, profile_storage)
    
    # 获取用户画像
    profile = profile_service.get_user_profile("user_123")
    print("用户画像:")
    print(f"  用户ID: {profile.user_id}")
    print(f"  标签: {list(profile.tags)}")
    print(f"  信任分: {profile.trust_score:.2f}")
    print(f"  行为模式: {profile.behavior_patterns}")
    
    # 获取用户分群
    segments = profile_service.get_user_segments("user_123")
    print(f"  用户分群: {segments}")
```

## 四、拦截系统实现

### 4.1 拦截策略设计

#### 4.1.1 拦截规则引擎

**拦截规则系统**：
```python
# 拦截规则系统
from typing import Dict, List, Any, Callable
from enum import Enum
import re
import ipaddress

class InterceptAction(Enum):
    """拦截动作"""
    BLOCK = "block"          # 直接拦截
    CHALLENGE = "challenge"  # 发送挑战
    MONITOR = "monitor"      # 监控记录
    ALLOW = "allow"          # 允许通过

class InterceptRule:
    """拦截规则"""
    
    def __init__(self, rule_id: str, name: str, description: str,
                 condition: Callable, action: InterceptAction,
                 priority: int = 100, enabled: bool = True):
        self.rule_id = rule_id
        self.name = name
        self.description = description
        self.condition = condition  # 条件函数
        self.action = action
        self.priority = priority
        self.enabled = enabled
        self.created_at = datetime.now()
        self.hit_count = 0
    
    def evaluate(self, context: Dict[str, Any]) -> tuple[bool, InterceptAction]:
        """
        评估规则
        
        Args:
            context: 评估上下文
            
        Returns:
            (是否匹配, 拦截动作)
        """
        if not self.enabled:
            return False, InterceptAction.ALLOW
        
        try:
            if self.condition(context):
                self.hit_count += 1
                return True, self.action
            return False, InterceptAction.ALLOW
        except Exception as e:
            print(f"规则评估失败 {self.rule_id}: {e}")
            return False, InterceptAction.ALLOW
    
    def to_dict(self):
        """转换为字典"""
        return {
            'rule_id': self.rule_id,
            'name': self.name,
            'description': self.description,
            'action': self.action.value,
            'priority': self.priority,
            'enabled': self.enabled,
            'hit_count': self.hit_count,
            'created_at': self.created_at.isoformat()
        }

class InterceptRuleEngine:
    """拦截规则引擎"""
    
    def __init__(self):
        self.rules: List[InterceptRule] = []
        self._initialize_default_rules()
    
    def _initialize_default_rules(self):
        """初始化默认规则"""
        # 高风险评分拦截规则
        def high_risk_condition(context):
            return context.get('risk_score', 0) >= 80
        
        high_risk_rule = InterceptRule(
            rule_id="block_high_risk",
            name="高风险拦截",
            description="拦截风险评分>=80的请求",
            condition=high_risk_condition,
            action=InterceptAction.BLOCK,
            priority=10
        )
        
        # 中高风险挑战规则
        def medium_high_risk_condition(context):
            score = context.get('risk_score', 0)
            return 60 <= score < 80
        
        medium_high_risk_rule = InterceptRule(
            rule_id="challenge_medium_high_risk",
            name="中高风险挑战",
            description="对风险评分60-80的请求发送挑战",
            condition=medium_high_risk_condition,
            action=InterceptAction.CHALLENGE,
            priority=20
        )
        
        # 黑名单IP拦截规则
        def blacklist_ip_condition(context):
            ip = context.get('ip_address', '')
            blacklist = context.get('ip_blacklist', set())
            return ip in blacklist
        
        blacklist_ip_rule = InterceptRule(
            rule_id="block_blacklist_ip",
            name="黑名单IP拦截",
            description="拦截黑名单中的IP地址",
            condition=blacklist_ip_condition,
            action=InterceptAction.BLOCK,
            priority=5
        )
        
        # 高频请求监控规则
        def high_frequency_condition(context):
            frequency = context.get('request_frequency', 0)
            return frequency > 100  # 每分钟超过100次请求
        
        high_frequency_rule = InterceptRule(
            rule_id="monitor_high_frequency",
            name="高频请求监控",
            description="监控高频请求",
            condition=high_frequency_condition,
            action=InterceptAction.MONITOR,
            priority=30
        )
        
        # 添加规则
        self.rules.extend([
            high_risk_rule,
            medium_high_risk_rule,
            blacklist_ip_rule,
            high_frequency_rule
        ])
    
    def add_rule(self, rule: InterceptRule):
        """添加规则"""
        self.rules.append(rule)
        # 按优先级排序
        self.rules.sort(key=lambda x: x.priority)
    
    def remove_rule(self, rule_id: str) -> bool:
        """移除规则"""
        for i, rule in enumerate(self.rules):
            if rule.rule_id == rule_id:
                del self.rules[i]
                return True
        return False
    
    def enable_rule(self, rule_id: str, enabled: bool = True) -> bool:
        """启用/禁用规则"""
        for rule in self.rules:
            if rule.rule_id == rule_id:
                rule.enabled = enabled
                return True
        return False
    
    def evaluate(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        评估所有规则
        
        Args:
            context: 评估上下文
            
        Returns:
            评估结果
        """
        # 按优先级顺序评估规则
        for rule in self.rules:
            matched, action = rule.evaluate(context)
            if matched:
                return {
                    'matched': True,
                    'action': action,
                    'rule_id': rule.rule_id,
                    'rule_name': rule.name,
                    'context': context
                }
        
        # 默认允许通过
        return {
            'matched': False,
            'action': InterceptAction.ALLOW,
            'rule_id': None,
            'rule_name': 'default_allow',
            'context': context
        }
    
    def get_rule_statistics(self) -> List[Dict[str, Any]]:
        """获取规则统计"""
        return [rule.to_dict() for rule in self.rules]

# 动态规则管理
class DynamicRuleManager:
    """动态规则管理器"""
    
    def __init__(self, rule_engine: InterceptRuleEngine):
        self.rule_engine = rule_engine
        self.rule_templates = {}
        self._initialize_rule_templates()
    
    def _initialize_rule_templates(self):
        """初始化规则模板"""
        self.rule_templates = {
            'ip_blacklist': {
                'name': 'IP黑名单拦截',
                'description': '拦截指定IP地址',
                'condition_template': 'ip_address in {ip_list}',
                'default_action': InterceptAction.BLOCK,
                'parameters': ['ip_list']
            },
            'user_blacklist': {
                'name': '用户黑名单拦截',
                'description': '拦截指定用户',
                'condition_template': 'user_id in {user_list}',
                'default_action': InterceptAction.BLOCK,
                'parameters': ['user_list']
            },
            'score_threshold': {
                'name': '评分阈值拦截',
                'description': '根据风险评分阈值拦截',
                'condition_template': 'risk_score >= {threshold}',
                'default_action': InterceptAction.BLOCK,
                'parameters': ['threshold']
            },
            'frequency_limit': {
                'name': '频率限制',
                'description': '限制请求频率',
                'condition_template': 'request_frequency >= {limit}',
                'default_action': InterceptAction.MONITOR,
                'parameters': ['limit']
            }
        }
    
    def create_rule_from_template(self, template_name: str, 
                                rule_id: str, parameters: Dict[str, Any],
                                priority: int = 100) -> InterceptRule:
        """
        从模板创建规则
        
        Args:
            template_name: 模板名称
            rule_id: 规则ID
            parameters: 参数
            priority: 优先级
            
        Returns:
            拦截规则
        """
        if template_name not in self.rule_templates:
            raise ValueError(f"模板 {template_name} 不存在")
        
        template = self.rule_templates[template_name]
        
        # 创建条件函数
        condition_func = self._create_condition_function(
            template['condition_template'], parameters
        )
        
        rule = InterceptRule(
            rule_id=rule_id,
            name=template['name'],
            description=template['description'],
            condition=condition_func,
            action=template['default_action'],
            priority=priority
        )
        
        return rule
    
    def _create_condition_function(self, template: str, 
                                 parameters: Dict[str, Any]) -> Callable:
        """创建条件函数"""
        def condition(context):
            # 简化的条件评估实现
            condition_str = template.format(**parameters)
            
            # 解析简单的条件表达式
            if '>=' in condition_str:
                left, right = condition_str.split('>=')
                left = left.strip()
                right = float(right.strip())
                return context.get(left, 0) >= right
            elif '<=' in condition_str:
                left, right = condition_str.split('<=')
                left = left.strip()
                right = float(right.strip())
                return context.get(left, 0) <= right
            elif 'in' in condition_str:
                left, right = condition_str.split('in')
                left = left.strip()
                # 解析右侧的列表
                right = right.strip().strip('{}')
                right_list = [item.strip().strip("'\"") for item in right.split(',')]
                return context.get(left, '') in right_list
            
            return False
        
        return condition
    
    def add_ip_blacklist_rule(self, rule_id: str, ip_list: List[str], 
                            priority: int = 50) -> InterceptRule:
        """
        添加IP黑名单规则
        
        Args:
            rule_id: 规则ID
            ip_list: IP地址列表
            priority: 优先级
            
        Returns:
            拦截规则
        """
        rule = self.create_rule_from_template(
            'ip_blacklist',
            rule_id,
            {'ip_list': str(ip_list)},
            priority
        )
        self.rule_engine.add_rule(rule)
        return rule
    
    def add_score_threshold_rule(self, rule_id: str, threshold: float,
                               action: InterceptAction = InterceptAction.BLOCK,
                               priority: int = 75) -> InterceptRule:
        """
        添加评分阈值规则
        
        Args:
            rule_id: 规则ID
            threshold: 阈值
            action: 拦截动作
            priority: 优先级
            
        Returns:
            拦截规则
        """
        rule = self.create_rule_from_template(
            'score_threshold',
            rule_id,
            {'threshold': str(threshold)},
            priority
        )
        rule.action = action
        self.rule_engine.add_rule(rule)
        return rule

# 拦截存储服务
class InterceptStorage:
    """拦截存储服务"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=7,
            decode_responses=True
        )
    
    def log_intercept_event(self, event_data: Dict[str, Any]) -> bool:
        """
        记录拦截事件
        
        Args:
            event_data: 事件数据
            
        Returns:
            记录是否成功
        """
        try:
            event_id = event_data.get('event_id', f"event_{datetime.now().timestamp()}")
            event_key = f"intercept_event:{event_id}"
            
            # 保存事件数据
            event_data['logged_at'] = datetime.now().isoformat()
            self.redis.hset(event_key, mapping={
                'event_data': json.dumps(event_data),
                'logged_at': event_data['logged_at']
            })
            
            # 添加到事件索引
            events_key = "intercept_events"
            self.redis.zadd(events_key, {event_id: datetime.now().timestamp()})
            
            # 按用户索引
            user_id = event_data.get('user_id')
            if user_id:
                user_events_key = f"user_intercept_events:{user_id}"
                self.redis.zadd(user_events_key, {event_id: datetime.now().timestamp()})
            
            # 按规则索引
            rule_id = event_data.get('rule_id')
            if rule_id:
                rule_events_key = f"rule_intercept_events:{rule_id}"
                self.redis.zadd(rule_events_key, {event_id: datetime.now().timestamp()})
            
            # 保留最近10000条记录
            self.redis.zremrangebyrank(events_key, 0, -10001)
            
            return True
        except Exception as e:
            print(f"记录拦截事件失败: {e}")
            return False
    
    def get_intercept_events(self, limit: int = 100, 
                           user_id: Optional[str] = None,
                           rule_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        获取拦截事件
        
        Args:
            limit: 返回记录数限制
            user_id: 用户ID过滤
            rule_id: 规则ID过滤
            
        Returns:
            拦截事件列表
        """
        try:
            if user_id:
                events_key = f"user_intercept_events:{user_id}"
            elif rule_id:
                events_key = f"rule_intercept_events:{rule_id}"
            else:
                events_key = "intercept_events"
            
            # 获取事件ID
            event_ids = self.redis.zrevrange(events_key, 0, limit - 1)
            
            events = []
            for event_id in event_ids:
                event_key = f"intercept_event:{event_id}"
                event_data = self.redis.hgetall(event_key)
                if event_data:
                    events.append(json.loads(event_data['event_data']))
            
            return events
        except Exception as e:
            print(f"获取拦截事件失败: {e}")
            return []
    
    def get_intercept_statistics(self, hours: int = 24) -> Dict[str, Any]:
        """
        获取拦截统计
        
        Args:
            hours: 统计小时数
            
        Returns:
            拦截统计
        """
        try:
            # 计算时间范围
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=hours)
            
            events_key = "intercept_events"
            # 获取指定时间范围内的事件
            event_ids = self.redis.zrevrangebyscore(
                events_key,
                end_time.timestamp(),
                start_time.timestamp()
            )
            
            # 统计数据
            total_events = len(event_ids)
            action_stats = defaultdict(int)
            rule_stats = defaultdict(int)
            hourly_stats = defaultdict(int)
            
            for event_id in event_ids:
                event_key = f"intercept_event:{event_id}"
                event_data = self.redis.hgetall(event_key)
                if event_data:
                    data = json.loads(event_data['event_data'])
                    
                    # 动作统计
                    action = data.get('action', 'unknown')
                    action_stats[action] += 1
                    
                    # 规则统计
                    rule_id = data.get('rule_id', 'unknown')
                    rule_stats[rule_id] += 1
                    
                    # 小时统计
                    logged_at = datetime.fromisoformat(data['logged_at'])
                    hour_key = logged_at.strftime('%Y-%m-%d %H:00')
                    hourly_stats[hour_key] += 1
            
            return {
                'total_events': total_events,
                'action_statistics': dict(action_stats),
                'rule_statistics': dict(rule_stats),
                'hourly_statistics': dict(hourly_stats),
                'time_range': {
                    'start': start_time.isoformat(),
                    'end': end_time.isoformat()
                }
            }
        except Exception as e:
            print(f"获取拦截统计失败: {e}")
            return {}

# 拦截服务
class InterceptService:
    """拦截服务"""
    
    def __init__(self, rule_engine: InterceptRuleEngine, 
                 storage: InterceptStorage,
                 dynamic_manager: DynamicRuleManager):
        self.rule_engine = rule_engine
        self.storage = storage
        self.dynamic_manager = dynamic_manager
    
    def process_intercept(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        处理拦截逻辑
        
        Args:
            context: 处理上下文
            
        Returns:
            处理结果
        """
        # 评估规则
        result = self.rule_engine.evaluate(context)
        
        # 记录拦截事件
        event_data = {
            'event_id': context.get('event_id', f"event_{datetime.now().timestamp()}"),
            'user_id': context.get('user_id'),
            'ip_address': context.get('ip_address'),
            'risk_score': context.get('risk_score'),
            'action': result['action'].value,
            'rule_id': result['rule_id'],
            'rule_name': result['rule_name'],
            'context': {k: v for k, v in context.items() 
                       if k not in ['ip_blacklist', 'user_blacklist']}
        }
        
        self.storage.log_intercept_event(event_data)
        
        return result
    
    def add_ip_blacklist(self, ip_list: List[str], 
                        rule_id: Optional[str] = None) -> str:
        """
        添加IP黑名单
        
        Args:
            ip_list: IP地址列表
            rule_id: 规则ID
            
        Returns:
            规则ID
        """
        if not rule_id:
            rule_id = f"ip_blacklist_{int(datetime.now().timestamp())}"
        
        self.dynamic_manager.add_ip_blacklist_rule(rule_id, ip_list)
        return rule_id
    
    def add_score_threshold(self, threshold: float,
                          action: InterceptAction = InterceptAction.BLOCK,
                          rule_id: Optional[str] = None) -> str:
        """
        添加评分阈值规则
        
        Args:
            threshold: 阈值
            action: 拦截动作
            rule_id: 规则ID
            
        Returns:
            规则ID
        """
        if not rule_id:
            rule_id = f"score_threshold_{int(datetime.now().timestamp())}"
        
        self.dynamic_manager.add_score_threshold_rule(rule_id, threshold, action)
        return rule_id
    
    def get_intercept_statistics(self, hours: int = 24) -> Dict[str, Any]:
        """
        获取拦截统计
        
        Args:
            hours: 统计小时数
            
        Returns:
            拦截统计
        """
        return self.storage.get_intercept_statistics(hours)
    
    def get_recent_intercepts(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        获取最近拦截事件
        
        Args:
            limit: 返回记录数限制
            
        Returns:
            拦截事件列表
        """
        return self.storage.get_intercept_events(limit)

# 使用示例
def example_intercept_system():
    """拦截系统使用示例"""
    # 初始化系统
    rule_engine = InterceptRuleEngine()
    storage = InterceptStorage()
    dynamic_manager = DynamicRuleManager(rule_engine)
    intercept_service = InterceptService(rule_engine, storage, dynamic_manager)
    
    # 添加自定义规则
    intercept_service.add_ip_blacklist(['192.168.1.100', '10.0.0.50'], 'custom_blacklist')
    intercept_service.add_score_threshold(75, InterceptAction.CHALLENGE, 'medium_risk_challenge')
    
    # 模拟处理请求
    context = {
        'event_id': 'event_123',
        'user_id': 'user_456',
        'ip_address': '192.168.1.100',
        'risk_score': 85,
        'request_frequency': 150,
        'ip_blacklist': {'192.168.1.100', '10.0.0.50'},
        'user_blacklist': {'user_789'}
    }
    
    # 处理拦截
    result = intercept_service.process_intercept(context)
    print("拦截结果:", result)
    
    # 获取统计信息
    stats = intercept_service.get_intercept_statistics(24)
    print("24小时拦截统计:", json.dumps(stats, indent=2, ensure_ascii=False))
```

### 4.2 拦截执行机制

#### 4.2.1 拦截响应处理

**拦截响应系统**：
```python
# 拦截响应系统
from typing import Optional
from enum import Enum
import uuid
import time

class InterceptResponse:
    """拦截响应"""
    
    def __init__(self, action: InterceptAction, 
                 response_data: Dict[str, Any],
                 redirect_url: Optional[str] = None):
        self.action = action
        self.response_data = response_data
        self.redirect_url = redirect_url
        self.response_id = str(uuid.uuid4())
        self.created_at = datetime.now()

class InterceptResponseHandler:
    """拦截响应处理器"""
    
    def __init__(self):
        self.response_templates = {}
        self._initialize_response_templates()
    
    def _initialize_response_templates(self):
        """初始化响应模板"""
        self.response_templates = {
            InterceptAction.BLOCK: {
                'status_code': 403,
                'content_type': 'application/json',
                'body': {
                    'code': 403,
                    'message': '请求被拦截',
                    'timestamp': datetime.now().isoformat()
                }
            },
            InterceptAction.CHALLENGE: {
                'status_code': 401,
                'content_type': 'application/json',
                'body': {
                    'code': 401,
                    'message': '需要验证',
                    'challenge_required': True,
                    'challenge_type': 'captcha',
                    'timestamp': datetime.now().isoformat()
                }
            },
            InterceptAction.MONITOR: {
                'status_code': 200,
                'content_type': 'application/json',
                'body': {
                    'code': 200,
                    'message': '请求已记录',
                    'monitored': True,
                    'timestamp': datetime.now().isoformat()
                }
            },
            InterceptAction.ALLOW: {
                'status_code': 200,
                'content_type': 'application/json',
                'body': {
                    'code': 200,
                    'message': '请求通过',
                    'allowed': True,
                    'timestamp': datetime.now().isoformat()
                }
            }
        }
    
    def create_response(self, action: InterceptAction, 
                       context: Dict[str, Any]) -> InterceptResponse:
        """
        创建拦截响应
        
        Args:
            action: 拦截动作
            context: 上下文信息
            
        Returns:
            拦截响应
        """
        template = self.response_templates.get(action, self.response_templates[InterceptAction.ALLOW])
        
        # 根据上下文定制响应
        response_data = template.copy()
        
        # 添加上下文信息
        if 'event_id' in context:
            response_data['body']['event_id'] = context['event_id']
        
        if 'risk_score' in context:
            response_data['body']['risk_score'] = context['risk_score']
        
        if 'rule_name' in context:
            response_data['body']['blocked_by_rule'] = context['rule_name']
        
        # 特殊处理挑战响应
        if action == InterceptAction.CHALLENGE:
            challenge_data = self._generate_challenge(context)
            response_data['body'].update(challenge_data)
        
        return InterceptResponse(action, response_data)
    
    def _generate_challenge(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """生成挑战数据"""
        challenge_type = context.get('preferred_challenge', 'captcha')
        
        if challenge_type == 'captcha':
            return {
                'challenge_type': 'captcha',
                'captcha_id': str(uuid.uuid4()),
                'captcha_image': self._generate_captcha_image(),
                'expires_at': (datetime.now() + timedelta(minutes=5)).isoformat()
            }
        elif challenge_type == 'sms':
            return {
                'challenge_type': 'sms',
                'verification_id': str(uuid.uuid4()),
                'message': '验证码已发送至您的手机',
                'expires_at': (datetime.now() + timedelta(minutes=10)).isoformat()
            }
        else:
            return {
                'challenge_type': 'generic',
                'verification_id': str(uuid.uuid4()),
                'message': '请完成身份验证',
                'expires_at': (datetime.now() + timedelta(minutes=5)).isoformat()
            }
    
    def _generate_captcha_image(self) -> str:
        """生成验证码图片（简化实现）"""
        # 实际实现应该生成真实的验证码图片
        import random
        import string
        captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"data:image/png;base64,captcha_{captcha_text}"

# 挑战验证系统
class ChallengeVerification:
    """挑战验证系统"""
    
    def __init__(self):
        self.challenges = {}  # 存储挑战信息
        self.verification_results = {}  # 存储验证结果
    
    def create_captcha_challenge(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建验证码挑战
        
        Args:
            context: 上下文信息
            
        Returns:
            挑战信息
        """
        challenge_id = str(uuid.uuid4())
        captcha_text = self._generate_captcha_text()
        
        challenge_data = {
            'challenge_id': challenge_id,
            'challenge_type': 'captcha',
            'captcha_text': captcha_text,
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(minutes=5),
            'context': context
        }
        
        self.challenges[challenge_id] = challenge_data
        
        return {
            'challenge_id': challenge_id,
            'challenge_type': 'captcha',
            'captcha_image': self._generate_captcha_image(captcha_text),
            'expires_at': challenge_data['expires_at'].isoformat()
        }
    
    def create_sms_challenge(self, phone_number: str, 
                           context: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建短信挑战
        
        Args:
            phone_number: 手机号码
            context: 上下文信息
            
        Returns:
            挑战信息
        """
        challenge_id = str(uuid.uuid4())
        verification_code = self._generate_verification_code()
        
        challenge_data = {
            'challenge_id': challenge_id,
            'challenge_type': 'sms',
            'phone_number': phone_number,
            'verification_code': verification_code,
            'created_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(minutes=10),
            'context': context
        }
        
        self.challenges[challenge_id] = challenge_data
        
        # 发送短信（模拟）
        self._send_sms(phone_number, verification_code)
        
        return {
            'challenge_id': challenge_id,
            'challenge_type': 'sms',
            'message': f'验证码已发送至 {phone_number}',
            'expires_at': challenge_data['expires_at'].isoformat()
        }
    
    def verify_challenge(self, challenge_id: str, 
                        user_input: str) -> Dict[str, Any]:
        """
        验证挑战
        
        Args:
            challenge_id: 挑战ID
            user_input: 用户输入
            
        Returns:
            验证结果
        """
        if challenge_id not in self.challenges:
            return {
                'success': False,
                'message': '挑战不存在或已过期'
            }
        
        challenge_data = self.challenges[challenge_id]
        
        # 检查是否过期
        if datetime.now() > challenge_data['expires_at']:
            del self.challenges[challenge_id]
            return {
                'success': False,
                'message': '挑战已过期'
            }
        
        # 验证用户输入
        expected_value = challenge_data.get('captcha_text') or challenge_data.get('verification_code')
        is_valid = user_input.lower() == expected_value.lower()
        
        result = {
            'success': is_valid,
            'challenge_id': challenge_id,
            'verified_at': datetime.now().isoformat(),
            'context': challenge_data['context']
        }
        
        # 存储验证结果
        self.verification_results[challenge_id] = result
        
        # 删除已验证的挑战
        if is_valid:
            del self.challenges[challenge_id]
        
        return result
    
    def _generate_captcha_text(self) -> str:
        """生成验证码文本"""
        import random
        import string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    def _generate_verification_code(self) -> str:
        """生成验证码"""
        import random
        return ''.join(random.choices('0123456789', k=6))
    
    def _generate_captcha_image(self, text: str) -> str:
        """生成验证码图片"""
        # 简化实现，实际应该生成图片
        return f"data:image/png;base64,captcha_{text}"
    
    def _send_sms(self, phone_number: str, code: str):
        """发送短信（模拟）"""
        print(f"发送短信到 {phone_number}: 验证码 {code}")

# 拦截执行器
class InterceptExecutor:
    """拦截执行器"""
    
    def __init__(self, response_handler: InterceptResponseHandler,
                 challenge_system: ChallengeVerification):
        self.response_handler = response_handler
        self.challenge_system = challenge_system
    
    def execute_intercept(self, intercept_result: Dict[str, Any],
                         original_request: Dict[str, Any]) -> InterceptResponse:
        """
        执行拦截
        
        Args:
            intercept_result: 拦截结果
            original_request: 原始请求
            
        Returns:
            拦截响应
        """
        action = InterceptAction(intercept_result['action'])
        context = intercept_result.get('context', {})
        
        # 根据动作类型执行不同的处理
        if action == InterceptAction.BLOCK:
            return self._handle_block(context)
        elif action == InterceptAction.CHALLENGE:
            return self._handle_challenge(context, original_request)
        elif action == InterceptAction.MONITOR:
            return self._handle_monitor(context)
        else:  # ALLOW
            return self._handle_allow(context)
    
    def _handle_block(self, context: Dict[str, Any]) -> InterceptResponse:
        """处理拦截"""
        return self.response_handler.create_response(InterceptAction.BLOCK, context)
    
    def _handle_challenge(self, context: Dict[str, Any], 
                         request: Dict[str, Any]) -> InterceptResponse:
        """处理挑战"""
        # 根据请求偏好选择挑战类型
        preferred_challenge = request.get('preferred_challenge', 'captcha')
        
        if preferred_challenge == 'sms' and 'phone_number' in request:
            challenge_info = self.challenge_system.create_sms_challenge(
                request['phone_number'], context
            )
        else:
            challenge_info = self.challenge_system.create_captcha_challenge(context)
        
        # 创建挑战响应
        response_data = self.response_handler.response_templates[InterceptAction.CHALLENGE].copy()
        response_data['body'].update(challenge_info)
        
        return InterceptResponse(InterceptAction.CHALLENGE, response_data)
    
    def _handle_monitor(self, context: Dict[str, Any]) -> InterceptResponse:
        """处理监控"""
        return self.response_handler.create_response(InterceptAction.MONITOR, context)
    
    def _handle_allow(self, context: Dict[str, Any]) -> InterceptResponse:
        """处理允许"""
        return self.response_handler.create_response(InterceptAction.ALLOW, context)
    
    def verify_challenge_response(self, challenge_id: str, 
                                 user_input: str) -> Dict[str, Any]:
        """
        验证挑战响应
        
        Args:
            challenge_id: 挑战ID
            user_input: 用户输入
            
        Returns:
            验证结果
        """
        return self.challenge_system.verify_challenge(challenge_id, user_input)

# 拦截协调服务
class InterceptCoordinationService:
    """拦截协调服务"""
    
    def __init__(self, intercept_service: InterceptService,
                 executor: InterceptExecutor):
        self.intercept_service = intercept_service
        self.executor = executor
    
    def process_request(self, request_data: Dict[str, Any]) -> InterceptResponse:
        """
        处理请求
        
        Args:
            request_data: 请求数据
            
        Returns:
            拦截响应
        """
        # 执行拦截评估
        intercept_result = self.intercept_service.process_intercept(request_data)
        
        # 执行拦截响应
        response = self.executor.execute_intercept(intercept_result, request_data)
        
        return response
    
    def verify_and_continue(self, challenge_id: str, 
                          user_input: str) -> Dict[str, Any]:
        """
        验证挑战并继续处理
        
        Args:
            challenge_id: 挑战ID
            user_input: 用户输入
            
        Returns:
            验证和处理结果
        """
        # 验证挑战
        verification_result = self.executor.verify_challenge_response(
            challenge_id, user_input
        )
        
        if not verification_result['success']:
            return {
                'success': False,
                'message': verification_result['message']
            }
        
        # 获取原始上下文并重新处理
        context = verification_result.get('context', {})
        intercept_result = self.intercept_service.process_intercept(context)
        
        # 如果仍然需要挑战，返回新的挑战
        if intercept_result['action'] == InterceptAction.CHALLENGE.value:
            response = self.executor.execute_intercept(intercept_result, context)
            return {
                'success': True,
                'requires_additional_challenge': True,
                'response': response
            }
        
        # 否则允许通过
        response = self.executor.execute_intercept(
            {'action': InterceptAction.ALLOW.value, 'context': context},
            context
        )
        
        return {
            'success': True,
            'requires_additional_challenge': False,
            'response': response
        }

# 使用示例
def example_intercept_execution():
    """拦截执行示例"""
    # 初始化系统
    rule_engine = InterceptRuleEngine()
    storage = InterceptStorage()
    dynamic_manager = DynamicRuleManager(rule_engine)
    intercept_service = InterceptService(rule_engine, storage, dynamic_manager)
    
    response_handler = InterceptResponseHandler()
    challenge_system = ChallengeVerification()
    executor = InterceptExecutor(response_handler, challenge_system)
    
    coordination_service = InterceptCoordinationService(intercept_service, executor)
    
    # 模拟高风险请求
    request_data = {
        'event_id': 'event_123',
        'user_id': 'user_456',
        'ip_address': '192.168.1.100',
        'risk_score': 85,
        'request_frequency': 150,
        'ip_blacklist': {'192.168.1.100'},
        'preferred_challenge': 'captcha'
    }
    
    # 处理请求
    response = coordination_service.process_request(request_data)
    print("拦截响应:")
    print(f"  动作: {response.action.value}")
    print(f"  状态码: {response.response_data['status_code']}")
    print(f"  响应体: {json.dumps(response.response_data['body'], indent=2, ensure_ascii=False)}")
    
    # 如果需要挑战，模拟用户完成挑战
    if response.action == InterceptAction.CHALLENGE:
        # 获取挑战ID和验证码（实际应该从响应中获取）
        challenge_id = response.response_data['body'].get('captcha_id') or \
                      response.response_data['body'].get('verification_id')
        
        if challenge_id:
            # 模拟用户输入验证码
            user_input = "ABCD1234"  # 实际应该从用户获取
            
            # 验证挑战
            verify_result = coordination_service.verify_and_continue(
                challenge_id, user_input
            )
            print("挑战验证结果:", verify_result)

if __name__ == "__main__":
    example_intercept_execution()