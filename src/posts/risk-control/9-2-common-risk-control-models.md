---
title: "常用风控模型: GBDT（XGBoost/LightGBM）、深度学习、异常检测（Isolation Forest）"
date: 2025-09-07
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 常用风控模型：GBDT（XGBoost/LightGBM）、深度学习、异常检测（Isolation Forest）

## 引言

在企业级智能风控平台中，模型算法的选择直接决定了风险识别的准确性和系统的整体性能。不同的业务场景和风险类型需要采用不同的模型算法，而同一种算法在不同场景下也可能表现出截然不同的效果。在众多机器学习算法中，GBDT（梯度提升决策树）系列算法、深度学习模型和异常检测算法因其在风控场景中的优异表现而被广泛应用。

GBDT系列算法（如XGBoost、LightGBM）凭借其出色的特征处理能力、强大的非线性拟合能力和良好的可解释性，成为风控建模的首选算法之一。深度学习模型通过其强大的表征学习能力，在处理复杂、高维数据方面展现出独特优势。异常检测算法（如Isolation Forest）则在识别新型欺诈模式和异常行为方面发挥着重要作用。

本文将深入探讨这些常用风控模型的原理、特点和应用场景，通过实际案例分析它们在不同风控场景中的表现，为风控模型的选择和应用提供指导。

## 一、GBDT系列算法

### 1.1 算法原理

GBDT（Gradient Boosting Decision Tree，梯度提升决策树）是一种基于决策树的集成学习算法，通过迭代地训练多个弱学习器（通常是决策树），并将它们组合成一个强学习器。

#### 1.1.1 核心思想

**提升方法**：
GBDT采用提升（Boosting）的思想，将多个弱学习器组合成一个强学习器。与Bagging方法不同，Boosting是串行训练的，每个新的学习器都会关注前一个学习器预测错误的样本。

**梯度下降优化**：
GBDT将模型训练过程看作是一个函数优化问题，通过梯度下降的方法最小化损失函数。在每一轮迭代中，算法都会拟合当前模型的负梯度（即残差），然后将拟合结果作为新的弱学习器加入到模型中。

**加法模型**：
GBDT的最终模型可以表示为一系列基学习器的加权和：
```
F(x) = Σ(αₘ * hₘ(x))
```
其中，hₘ(x)是第m个基学习器，αₘ是对应的权重。

#### 1.1.2 算法流程

```python
# GBDT算法实现示例
import numpy as np
from sklearn.tree import DecisionTreeRegressor

class GBDT:
    """梯度提升决策树实现"""
    
    def __init__(self, n_estimators=100, learning_rate=0.1, max_depth=3):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.trees = []
        self.initial_prediction = 0
    
    def fit(self, X, y):
        """
        训练GBDT模型
        
        Args:
            X: 特征矩阵
            y: 标签向量
        """
        # 初始化预测值（通常使用标签的均值）
        self.initial_prediction = np.mean(y)
        F_m = np.full(len(y), self.initial_prediction)
        
        # 迭代训练弱学习器
        for m in range(self.n_estimators):
            # 计算负梯度（残差）
            negative_gradient = y - F_m
            
            # 训练新的决策树拟合负梯度
            tree = DecisionTreeRegressor(max_depth=self.max_depth)
            tree.fit(X, negative_gradient)
            
            # 更新模型预测值
            tree_pred = tree.predict(X)
            F_m += self.learning_rate * tree_pred
            
            # 保存树模型
            self.trees.append(tree)
    
    def predict(self, X):
        """
        预测
        
        Args:
            X: 特征矩阵
            
        Returns:
            预测结果
        """
        # 初始化预测值
        predictions = np.full(X.shape[0], self.initial_prediction)
        
        # 累加每个树的预测结果
        for tree in self.trees:
            predictions += self.learning_rate * tree.predict(X)
        
        return predictions

# 使用示例
def example_gbdt():
    """GBDT使用示例"""
    # 生成示例数据
    np.random.seed(42)
    X = np.random.randn(1000, 4)
    y = X[:, 0] + 2 * X[:, 1] - X[:, 2] + 0.5 * np.random.randn(1000)
    
    # 训练GBDT模型
    gbdt = GBDT(n_estimators=50, learning_rate=0.1, max_depth=3)
    gbdt.fit(X, y)
    
    # 预测
    predictions = gbdt.predict(X[:10])
    print("GBDT预测结果:")
    for i, pred in enumerate(predictions):
        print(f"样本 {i+1}: {pred:.4f}")

# XGBoost实现
class XGBoostRegressor:
    """XGBoost回归器简化实现"""
    
    def __init__(self, n_estimators=100, learning_rate=0.1, max_depth=3, 
                 reg_lambda=1, reg_alpha=0):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.reg_lambda = reg_lambda  # L2正则化
        self.reg_alpha = reg_alpha    # L1正则化
        self.trees = []
        self.initial_prediction = 0
    
    def _calculate_gradients(self, y_true, y_pred):
        """计算一阶和二阶导数"""
        # 对于平方损失函数 L = (y - y_hat)^2
        # 一阶导数 g = ∂L/∂y_hat = 2(y_hat - y)
        # 二阶导数 h = ∂²L/∂y_hat² = 2
        g = 2 * (y_pred - y_true)
        h = np.full_like(y_true, 2.0)
        return g, h
    
    def _calculate_gain(self, G, H, G_left, H_left, G_right, H_right):
        """计算分裂增益"""
        def calc_term(g, h):
            return g**2 / (h + self.reg_lambda)
        
        gain = calc_term(G_left, H_left) + calc_term(G_right, H_right) - calc_term(G, H)
        return gain - self.reg_alpha  # 减去L1正则化项
    
    def fit(self, X, y):
        """训练XGBoost模型"""
        self.initial_prediction = np.mean(y)
        F_m = np.full(len(y), self.initial_prediction)
        
        for m in range(self.n_estimators):
            # 计算梯度
            g, h = self._calculate_gradients(y, F_m)
            
            # 训练新的树（简化实现）
            tree = DecisionTreeRegressor(max_depth=self.max_depth)
            # 在实际XGBoost中，这里会使用二阶导数信息进行分裂
            tree.fit(X, g)  # 简化处理，实际应使用g和h
            
            # 更新预测值
            tree_pred = tree.predict(X)
            F_m += self.learning_rate * tree_pred
            
            self.trees.append(tree)

# LightGBM特点
class LightGBMFeatures:
    """LightGBM关键特性"""
    
    @staticmethod
    def histogram_based_splitting():
        """
        基于直方图的分裂
        
        LightGBM使用直方图算法来加速决策树的训练：
        1. 将连续特征离散化为k个bin
        2. 统计每个bin的梯度信息
        3. 基于直方图进行最优分裂点搜索
        """
        print("LightGBM基于直方图的分裂算法：")
        print("1. 特征离散化：将连续特征映射到固定数量的bin中")
        print("2. 梯度统计：计算每个bin的一阶和二阶导数统计信息")
        print("3. 分裂搜索：基于直方图快速找到最优分裂点")
        print("4. 优势：大幅减少分裂点搜索时间，内存使用更少")
    
    @staticmethod
    def leaf_wise_growth():
        """
        Leaf-wise叶子生长策略
        
        与传统的Level-wise生长策略不同，Leaf-wise策略每次选择增益最大的叶子进行分裂，
        能够获得更好的精度，但也可能产生过深的树。
        """
        print("LightGBM Leaf-wise生长策略：")
        print("1. 每次选择分裂增益最大的叶子节点进行分裂")
        print("2. 相比Level-wise，能够获得更低的损失")
        print("3. 通过max_depth参数控制树的深度，防止过拟合")
    
    @staticmethod
    def categorical_feature_support():
        """
        类别特征支持
        
        LightGBM原生支持类别特征，无需进行one-hot编码。
        """
        print("LightGBM类别特征支持：")
        print("1. 直接处理类别特征，无需预处理")
        print("2. 使用Fisher算法寻找最优分割")
        print("3. 比one-hot编码更高效，避免维度爆炸")

# 使用示例
def example_xgboost_lightgbm():
    """XGBoost和LightGBM示例"""
    print("=== XGBoost和LightGBM特点 ===")
    LightGBMFeatures.histogram_based_splitting()
    print()
    LightGBMFeatures.leaf_wise_growth()
    print()
    LightGBMFeatures.categorical_feature_support()

if __name__ == "__main__":
    example_gbdt()
    print()
    example_xgboost_lightgbm()
```

### 1.2 在风控场景中的应用

#### 1.2.1 交易反欺诈

**特征工程**：
在交易反欺诈场景中，GBDT算法能够有效处理各种类型的特征：

```python
# 交易反欺诈特征工程
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class TransactionFraudFeatures:
    """交易反欺诈特征工程"""
    
    def __init__(self):
        pass
    
    def create_user_behavior_features(self, transactions: pd.DataFrame) -> pd.DataFrame:
        """
        创建用户行为特征
        
        Args:
            transactions: 交易数据
            
        Returns:
            用户行为特征DataFrame
        """
        features = pd.DataFrame()
        
        # 基础统计特征
        features['user_id'] = transactions['user_id'].unique()
        user_groups = transactions.groupby('user_id')
        
        features['total_transactions'] = user_groups['transaction_id'].count()
        features['total_amount'] = user_groups['amount'].sum()
        features['avg_amount'] = user_groups['amount'].mean()
        features['max_amount'] = user_groups['amount'].max()
        features['min_amount'] = user_groups['amount'].min()
        
        # 时间特征
        features['account_age_days'] = (datetime.now() - user_groups['timestamp'].min()).dt.days
        features['transactions_per_day'] = features['total_transactions'] / features['account_age_days']
        
        # 异常行为特征
        features['high_amount_ratio'] = self._calculate_high_amount_ratio(transactions)
        features['late_night_ratio'] = self._calculate_late_night_ratio(transactions)
        features['velocity_features'] = self._calculate_velocity_features(transactions)
        
        return features
    
    def _calculate_high_amount_ratio(self, transactions: pd.DataFrame) -> pd.Series:
        """计算大额交易比例"""
        user_groups = transactions.groupby('user_id')
        high_amount_ratios = {}
        
        for user_id, group in user_groups:
            # 计算90分位数
            percentile_90 = group['amount'].quantile(0.9)
            # 计算大额交易比例
            high_amount_count = (group['amount'] > percentile_90).sum()
            total_count = len(group)
            high_amount_ratios[user_id] = high_amount_count / max(1, total_count)
        
        return pd.Series(high_amount_ratios)
    
    def _calculate_late_night_ratio(self, transactions: pd.DataFrame) -> pd.Series:
        """计算深夜交易比例"""
        # 深夜定义为晚上10点到早上6点
        late_night_mask = ((transactions['timestamp'].dt.hour >= 22) | 
                          (transactions['timestamp'].dt.hour <= 6))
        late_night_transactions = transactions[late_night_mask]
        
        user_groups = transactions.groupby('user_id')
        late_night_ratios = {}
        
        for user_id, group in user_groups:
            total_count = len(group)
            late_night_count = len(late_night_transactions[late_night_transactions['user_id'] == user_id])
            late_night_ratios[user_id] = late_night_count / max(1, total_count)
        
        return pd.Series(late_night_ratios)
    
    def _calculate_velocity_features(self, transactions: pd.DataFrame) -> pd.DataFrame:
        """计算交易频率特征"""
        transactions = transactions.sort_values(['user_id', 'timestamp'])
        transactions['time_diff'] = transactions.groupby('user_id')['timestamp'].diff()
        transactions['time_diff_seconds'] = transactions['time_diff'].dt.total_seconds()
        
        # 计算平均交易间隔
        avg_intervals = transactions.groupby('user_id')['time_diff_seconds'].mean()
        
        return avg_intervals

# XGBoost在交易反欺诈中的应用
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

class XGBoostFraudDetector:
    """基于XGBoost的欺诈检测器"""
    
    def __init__(self, params=None):
        self.params = params or {
            'objective': 'binary:logistic',
            'eval_metric': 'auc',
            'max_depth': 6,
            'learning_rate': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'reg_alpha': 0.1,
            'reg_lambda': 1,
            'random_state': 42
        }
        self.model = None
    
    def train(self, X_train, y_train, X_val=None, y_val=None, num_rounds=100):
        """
        训练模型
        
        Args:
            X_train: 训练特征
            y_train: 训练标签
            X_val: 验证特征
            y_val: 验证标签
            num_rounds: 训练轮数
        """
        # 转换为DMatrix格式
        dtrain = xgb.DMatrix(X_train, label=y_train)
        
        if X_val is not None and y_val is not None:
            dval = xgb.DMatrix(X_val, label=y_val)
            eval_list = [(dtrain, 'train'), (dval, 'eval')]
            early_stopping_rounds = 10
        else:
            eval_list = [(dtrain, 'train')]
            early_stopping_rounds = None
        
        # 训练模型
        self.model = xgb.train(
            self.params,
            dtrain,
            num_boost_round=num_rounds,
            evals=eval_list,
            early_stopping_rounds=early_stopping_rounds,
            verbose_eval=False
        )
    
    def predict(self, X):
        """
        预测
        
        Args:
            X: 特征数据
            
        Returns:
            预测概率
        """
        dmatrix = xgb.DMatrix(X)
        return self.model.predict(dmatrix)
    
    def evaluate(self, X_test, y_test):
        """
        评估模型
        
        Args:
            X_test: 测试特征
            y_test: 测试标签
            
        Returns:
            评估结果
        """
        predictions = self.predict(X_test)
        y_pred = (predictions > 0.5).astype(int)
        
        auc = roc_auc_score(y_test, predictions)
        report = classification_report(y_test, y_pred, output_dict=True)
        
        return {
            'auc': auc,
            'classification_report': report,
            'predictions': predictions
        }
    
    def get_feature_importance(self, feature_names):
        """
        获取特征重要性
        
        Args:
            feature_names: 特征名称列表
            
        Returns:
            特征重要性字典
        """
        if self.model is None:
            return {}
        
        importance_scores = self.model.get_score(importance_type='gain')
        importance_dict = {}
        
        for feature_idx, feature_name in enumerate(feature_names):
            feature_key = f'f{feature_idx}'
            if feature_key in importance_scores:
                importance_dict[feature_name] = importance_scores[feature_key]
        
        return importance_dict

# 使用示例
def example_transaction_fraud_detection():
    """交易反欺诈检测示例"""
    # 创建示例数据
    np.random.seed(42)
    n_samples = 10000
    
    # 生成特征
    X = pd.DataFrame({
        'amount': np.random.lognormal(5, 1, n_samples),
        'user_tenure': np.random.exponential(365, n_samples),
        'transaction_frequency': np.random.gamma(2, 2, n_samples),
        'avg_amount': np.random.lognormal(4, 0.8, n_samples),
        'high_amount_ratio': np.random.beta(2, 5, n_samples),
        'late_night_ratio': np.random.beta(1, 9, n_samples),
        'velocity_score': np.random.exponential(1, n_samples),
        'device_risk_score': np.random.beta(2, 8, n_samples),
        'location_risk_score': np.random.beta(1, 10, n_samples),
        'behavior_anomaly_score': np.random.beta(1, 15, n_samples)
    })
    
    # 生成标签（基于特征的线性组合加噪声）
    linear_combination = (0.3 * X['amount'] / 1000 +
                         0.2 * X['high_amount_ratio'] +
                         0.2 * X['late_night_ratio'] +
                         0.1 * X['velocity_score'] +
                         0.1 * X['device_risk_score'] +
                         0.1 * X['location_risk_score'])
    
    # 添加噪声并转换为二分类标签
    noise = np.random.normal(0, 0.1, n_samples)
    y = (linear_combination + noise > 0.5).astype(int)
    
    # 分割数据
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42, stratify=y_train
    )
    
    # 训练模型
    detector = XGBoostFraudDetector()
    detector.train(X_train, y_train, X_val, y_val, num_rounds=100)
    
    # 评估模型
    evaluation_result = detector.evaluate(X_test, y_test)
    print("XGBoost欺诈检测模型评估结果:")
    print(f"AUC: {evaluation_result['auc']:.4f}")
    print("分类报告:")
    for key, value in evaluation_result['classification_report'].items():
        if isinstance(value, dict):
            print(f"  {key}: Precision={value['precision']:.4f}, Recall={value['recall']:.4f}, F1={value['f1-score']:.4f}")
    
    # 特征重要性
    feature_importance = detector.get_feature_importance(X.columns.tolist())
    print("\n特征重要性:")
    sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    for feature, importance in sorted_features[:5]:
        print(f"  {feature}: {importance:.4f}")

# LightGBM在风控中的优势
import lightgbm as lgb

class LightGBMFraudDetector:
    """基于LightGBM的欺诈检测器"""
    
    def __init__(self, params=None):
        self.params = params or {
            'objective': 'binary',
            'metric': 'auc',
            'boosting_type': 'gbdt',
            'num_leaves': 31,
            'learning_rate': 0.05,
            'feature_fraction': 0.9,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'verbose': -1,
            'random_state': 42
        }
        self.model = None
    
    def train(self, X_train, y_train, X_val=None, y_val=None, num_rounds=100):
        """
        训练模型
        
        Args:
            X_train: 训练特征
            y_train: 训练标签
            X_val: 验证特征
            y_val: 验证标签
            num_rounds: 训练轮数
        """
        # 转换为Dataset格式
        train_data = lgb.Dataset(X_train, label=y_train)
        
        if X_val is not None and y_val is not None:
            val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
            valid_sets = [train_data, val_data]
            valid_names = ['train', 'eval']
            early_stopping_rounds = 10
        else:
            valid_sets = [train_data]
            valid_names = ['train']
            early_stopping_rounds = None
        
        # 训练模型
        self.model = lgb.train(
            self.params,
            train_data,
            num_boost_round=num_rounds,
            valid_sets=valid_sets,
            valid_names=valid_names,
            early_stopping_rounds=early_stopping_rounds,
            verbose_eval=False
        )
    
    def predict(self, X):
        """
        预测
        
        Args:
            X: 特征数据
            
        Returns:
            预测概率
        """
        return self.model.predict(X, num_iteration=self.model.best_iteration)
    
    def evaluate(self, X_test, y_test):
        """
        评估模型
        
        Args:
            X_test: 测试特征
            y_test: 测试标签
            
        Returns:
            评估结果
        """
        predictions = self.predict(X_test)
        y_pred = (predictions > 0.5).astype(int)
        
        auc = roc_auc_score(y_test, predictions)
        report = classification_report(y_test, y_pred, output_dict=True)
        
        return {
            'auc': auc,
            'classification_report': report,
            'predictions': predictions
        }

# 比较XGBoost和LightGBM
def compare_gbdt_algorithms():
    """比较XGBoost和LightGBM"""
    print("=== XGBoost vs LightGBM 比较 ===")
    
    # 创建示例数据
    np.random.seed(42)
    n_samples = 50000  # 更大的数据集以体现性能差异
    
    X = pd.DataFrame({
        'feature1': np.random.normal(0, 1, n_samples),
        'feature2': np.random.normal(0, 1, n_samples),
        'feature3': np.random.normal(0, 1, n_samples),
        'feature4': np.random.normal(0, 1, n_samples),
        'feature5': np.random.normal(0, 1, n_samples),
        'categorical_feature': np.random.choice(['A', 'B', 'C', 'D'], n_samples)
    })
    
    # 将类别特征转换为数值
    X['categorical_feature'] = pd.Categorical(X['categorical_feature']).codes
    
    # 生成标签
    y = ((X['feature1'] + X['feature2'] - X['feature3'] + 
          np.random.normal(0, 0.5, n_samples)) > 0).astype(int)
    
    # 分割数据
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42, stratify=y_train
    )
    
    import time
    
    # 训练XGBoost
    print("训练XGBoost...")
    start_time = time.time()
    xgb_detector = XGBoostFraudDetector()
    xgb_detector.train(X_train, y_train, X_val, y_val, num_rounds=100)
    xgb_training_time = time.time() - start_time
    
    # 训练LightGBM
    print("训练LightGBM...")
    start_time = time.time()
    lgb_detector = LightGBMFraudDetector()
    lgb_detector.train(X_train, y_train, X_val, y_val, num_rounds=100)
    lgb_training_time = time.time() - start_time
    
    # 评估模型
    xgb_result = xgb_detector.evaluate(X_test, y_test)
    lgb_result = lgb_detector.evaluate(X_test, y_test)
    
    print(f"\n性能比较:")
    print(f"XGBoost训练时间: {xgb_training_time:.2f}秒")
    print(f"LightGBM训练时间: {lgb_training_time:.2f}秒")
    print(f"XGBoost AUC: {xgb_result['auc']:.4f}")
    print(f"LightGBM AUC: {lgb_result['auc']:.4f}")
    print(f"时间提升: {((xgb_training_time - lgb_training_time) / xgb_training_time * 100):.1f}%")

if __name__ == "__main__":
    example_transaction_fraud_detection()
    print()
    compare_gbdt_algorithms()
```

#### 1.2.2 营销反作弊

**场景特点**：
营销反作弊场景通常涉及大量用户和复杂的作弊模式，GBDT算法能够有效识别各种作弊行为：

```python
# 营销反作弊特征工程
class MarketingAntiFraudFeatures:
    """营销反作弊特征工程"""
    
    def create_campaign_features(self, campaign_data: pd.DataFrame) -> pd.DataFrame:
        """
        创建营销活动特征
        
        Args:
            campaign_data: 营销活动数据
            
        Returns:
            营销活动特征DataFrame
        """
        features = pd.DataFrame()
        
        # 用户参与活动特征
        features['user_id'] = campaign_data['user_id'].unique()
        user_groups = campaign_data.groupby('user_id')
        
        # 参与活动数量
        features['campaigns_participated'] = user_groups['campaign_id'].nunique()
        
        # 参与频率
        features['participation_frequency'] = user_groups['participation_id'].count()
        
        # 异常参与模式
        features['same_ip_participations'] = self._calculate_same_ip_participations(campaign_data)
        features['same_device_participations'] = self._calculate_same_device_participations(campaign_data)
        features['bulk_participation_pattern'] = self._calculate_bulk_participation_pattern(campaign_data)
        
        # 时间特征
        features['first_participation_time'] = user_groups['timestamp'].min()
        features['last_participation_time'] = user_groups['timestamp'].max()
        features['participation_span_days'] = (features['last_participation_time'] - features['first_participation_time']).dt.days
        
        return features
    
    def _calculate_same_ip_participations(self, campaign_data: pd.DataFrame) -> pd.Series:
        """计算相同IP参与次数"""
        # 统计每个IP地址的参与次数
        ip_counts = campaign_data.groupby('ip_address')['participation_id'].count()
        
        # 对于每个用户，统计其使用过的IP中参与次数最多的
        user_max_ip_counts = {}
        user_groups = campaign_data.groupby('user_id')
        
        for user_id, group in user_groups:
            user_ips = group['ip_address'].unique()
            max_count = 0
            for ip in user_ips:
                if ip in ip_counts:
                    max_count = max(max_count, ip_counts[ip])
            user_max_ip_counts[user_id] = max_count
        
        return pd.Series(user_max_ip_counts)
    
    def _calculate_same_device_participations(self, campaign_data: pd.DataFrame) -> pd.Series:
        """计算相同设备参与次数"""
        # 统计每个设备的参与次数
        device_counts = campaign_data.groupby('device_id')['participation_id'].count()
        
        # 对于每个用户，统计其使用过的设备中参与次数最多的
        user_max_device_counts = {}
        user_groups = campaign_data.groupby('user_id')
        
        for user_id, group in user_groups:
            user_devices = group['device_id'].unique()
            max_count = 0
            for device in user_devices:
                if device in device_counts:
                    max_count = max(max_count, device_counts[device])
            user_max_device_counts[user_id] = max_count
        
        return pd.Series(user_max_device_counts)
    
    def _calculate_bulk_participation_pattern(self, campaign_data: pd.DataFrame) -> pd.Series:
        """计算批量参与模式"""
        # 统计短时间内大量参与的行为
        campaign_data = campaign_data.sort_values(['user_id', 'timestamp'])
        campaign_data['time_diff'] = campaign_data.groupby('user_id')['timestamp'].diff()
        campaign_data['time_diff_seconds'] = campaign_data['time_diff'].dt.total_seconds()
        
        # 标记短时间内参与的行为（例如：10秒内）
        bulk_participation_mask = campaign_data['time_diff_seconds'] < 10
        bulk_participations = campaign_data[bulk_participation_mask]
        
        # 统计每个用户的批量参与次数
        bulk_counts = bulk_participations.groupby('user_id')['participation_id'].count()
        
        # 填充没有批量参与的用户
        all_users = campaign_data['user_id'].unique()
        bulk_counts = bulk_counts.reindex(all_users, fill_value=0)
        
        return bulk_counts

# 营销反作弊模型
class MarketingAntiFraudModel:
    """营销反作弊模型"""
    
    def __init__(self):
        self.feature_engineer = MarketingAntiFraudFeatures()
        self.model = None
        self.threshold = 0.5
    
    def prepare_features(self, campaign_data: pd.DataFrame) -> pd.DataFrame:
        """
        准备特征
        
        Args:
            campaign_data: 营销活动数据
            
        Returns:
            特征DataFrame
        """
        # 创建特征
        features = self.feature_engineer.create_campaign_features(campaign_data)
        
        # 处理时间特征
        features['account_age_days'] = (datetime.now() - features['first_participation_time']).dt.days
        features['participation_rate'] = features['participation_frequency'] / (features['participation_span_days'] + 1)
        
        # 删除时间列
        features = features.drop(['first_participation_time', 'last_participation_time'], axis=1, errors='ignore')
        
        return features
    
    def train(self, features: pd.DataFrame, labels: pd.Series):
        """
        训练模型
        
        Args:
            features: 特征数据
            labels: 标签数据
        """
        # 使用LightGBM进行训练
        train_data = lgb.Dataset(features, label=labels)
        
        params = {
            'objective': 'binary',
            'metric': 'auc',
            'boosting_type': 'gbdt',
            'num_leaves': 63,
            'learning_rate': 0.05,
            'feature_fraction': 0.8,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'min_data_in_leaf': 50,
            'verbose': -1,
            'random_state': 42
        }
        
        self.model = lgb.train(params, train_data, num_boost_round=200)
    
    def predict(self, features: pd.DataFrame) -> np.ndarray:
        """
        预测
        
        Args:
            features: 特征数据
            
        Returns:
            预测概率
        """
        return self.model.predict(features)
    
    def set_threshold(self, threshold: float):
        """设置分类阈值"""
        self.threshold = threshold
    
    def classify(self, features: pd.DataFrame) -> np.ndarray:
        """
        分类
        
        Args:
            features: 特征数据
            
        Returns:
            分类结果
        """
        probabilities = self.predict(features)
        return (probabilities > self.threshold).astype(int)

# 使用示例
def example_marketing_anti_fraud():
    """营销反作弊示例"""
    # 创建示例数据
    np.random.seed(42)
    n_users = 5000
    
    # 生成用户数据
    user_data = pd.DataFrame({
        'user_id': [f'user_{i}' for i in range(n_users)],
        'registration_date': pd.date_range('2023-01-01', periods=n_users, freq='1min')
    })
    
    # 生成营销活动参与数据
    participation_data = []
    
    for i in range(n_users):
        user_id = f'user_{i}'
        # 正常用户参与1-5次活动
        normal_participations = np.random.randint(1, 6)
        
        for j in range(normal_participations):
            participation_data.append({
                'participation_id': f'part_{i}_{j}',
                'user_id': user_id,
                'campaign_id': f'campaign_{np.random.randint(1, 100)}',
                'ip_address': f'192.168.1.{np.random.randint(1, 255)}',
                'device_id': f'device_{np.random.randint(1, 1000)}',
                'timestamp': user_data.loc[user_data['user_id'] == user_id, 'registration_date'].iloc[0] + 
                            timedelta(days=np.random.randint(0, 365), seconds=np.random.randint(0, 86400))
            })
        
        # 生成作弊用户（约5%）
        if np.random.random() < 0.05:
            # 作弊用户参与大量活动
            fraud_participations = np.random.randint(20, 100)
            base_time = user_data.loc[user_data['user_id'] == user_id, 'registration_date'].iloc[0]
            
            for j in range(fraud_participations):
                participation_data.append({
                    'participation_id': f'fraud_part_{i}_{j}',
                    'user_id': user_id,
                    'campaign_id': f'campaign_{np.random.randint(1, 100)}',
                    'ip_address': f'192.168.1.{np.random.randint(1, 10)}',  # 使用相同IP段
                    'device_id': f'device_{np.random.randint(1, 10)}',      # 使用相同设备
                    'timestamp': base_time + timedelta(seconds=np.random.randint(0, 3600))  # 短时间内大量参与
                })
    
    campaign_data = pd.DataFrame(participation_data)
    
    # 生成标签
    fraud_users = campaign_data.groupby('user_id').size()
    fraud_users = fraud_users[fraud_users > 10].index  # 参与超过10次的标记为作弊
    
    labels = campaign_data['user_id'].isin(fraud_users).astype(int)
    campaign_data['label'] = labels
    
    # 准备特征
    model = MarketingAntiFraudModel()
    features = model.prepare_features(campaign_data)
    
    # 添加标签到特征中
    user_labels = campaign_data.groupby('user_id')['label'].max()
    features_with_labels = features.merge(user_labels, left_on='user_id', right_index=True)
    
    # 分割数据
    feature_cols = [col for col in features_with_labels.columns if col not in ['user_id', 'label']]
    X = features_with_labels[feature_cols]
    y = features_with_labels['label']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 训练模型
    model.train(X_train, y_train)
    
    # 预测和评估
    predictions = model.predict(X_test)
    y_pred = model.classify(X_test)
    
    auc = roc_auc_score(y_test, predictions)
    report = classification_report(y_test, y_pred, output_dict=True)
    
    print("营销反作弊模型评估结果:")
    print(f"AUC: {auc:.4f}")
    print("分类报告:")
    for key, value in report.items():
        if isinstance(value, dict):
            print(f"  {key}: Precision={value['precision']:.4f}, Recall={value['recall']:.4f}, F1={value['f1-score']:.4f}")

if __name__ == "__main__":
    example_marketing_anti_fraud()
```

## 二、深度学习模型

### 2.1 深度学习在风控中的应用

深度学习模型通过其强大的表征学习能力，在处理复杂、高维数据方面展现出独特优势，特别适用于以下风控场景：

#### 2.1.1 序列建模

**RNN/LSTM在用户行为分析中的应用**：

```python
# 深度学习风控模型
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# 用户行为序列数据集
class UserBehaviorDataset(Dataset):
    """用户行为序列数据集"""
    
    def __init__(self, sequences, labels, max_length=100):
        self.sequences = sequences
        self.labels = labels
        self.max_length = max_length
    
    def __len__(self):
        return len(self.sequences)
    
    def __getitem__(self, idx):
        sequence = self.sequences[idx]
        label = self.labels[idx]
        
        # 填充或截断序列
        if len(sequence) > self.max_length:
            sequence = sequence[:self.max_length]
        else:
            padding = np.zeros((self.max_length - len(sequence), sequence.shape[1]))
            sequence = np.vstack([sequence, padding])
        
        return torch.FloatTensor(sequence), torch.FloatTensor([label])

# LSTM风控模型
class LSTMRiskControlModel(nn.Module):
    """基于LSTM的风控模型"""
    
    def __init__(self, input_size, hidden_size=128, num_layers=2, dropout=0.2):
        super(LSTMRiskControlModel, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM层
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # 注意力机制
        self.attention = nn.Linear(hidden_size, 1)
        
        # 全连接层
        self.fc1 = nn.Linear(hidden_size, 64)
        self.fc2 = nn.Linear(64, 32)
        self.fc3 = nn.Linear(32, 1)
        
        # 激活函数和Dropout
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        # LSTM前向传播
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # 注意力机制
        attention_weights = torch.softmax(self.attention(lstm_out), dim=1)
        context_vector = torch.sum(attention_weights * lstm_out, dim=1)
        
        # 全连接层
        x = self.relu(self.fc1(context_vector))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.sigmoid(self.fc3(x))
        
        return x.squeeze()

# CNN风控模型
class CNNRiskControlModel(nn.Module):
    """基于CNN的风控模型"""
    
    def __init__(self, input_channels, sequence_length, num_classes=1):
        super(CNNRiskControlModel, self).__init__()
        
        # 卷积层
        self.conv1 = nn.Conv1d(input_channels, 64, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(64, 128, kernel_size=3, padding=1)
        self.conv3 = nn.Conv1d(128, 256, kernel_size=3, padding=1)
        
        # 池化层
        self.pool = nn.MaxPool1d(2)
        
        # 批归一化
        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(128)
        self.bn3 = nn.BatchNorm1d(256)
        
        # 计算全连接层输入维度
        conv_output_size = sequence_length // (2 ** 3)  # 3个池化层
        fc_input_size = 256 * conv_output_size
        
        # 全连接层
        self.fc1 = nn.Linear(fc_input_size, 512)
        self.fc2 = nn.Linear(512, 128)
        self.fc3 = nn.Linear(128, num_classes)
        
        # 激活函数和Dropout
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.5)
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        # 调整维度 (batch, sequence, features) -> (batch, features, sequence)
        x = x.transpose(1, 2)
        
        # 卷积层
        x = self.pool(self.relu(self.bn1(self.conv1(x))))
        x = self.pool(self.relu(self.bn2(self.conv2(x))))
        x = self.pool(self.relu(self.bn3(self.conv3(x))))
        
        # 展平
        x = x.view(x.size(0), -1)
        
        # 全连接层
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.sigmoid(self.fc3(x))
        
        return x.squeeze()

# Transformer风控模型
class TransformerRiskControlModel(nn.Module):
    """基于Transformer的风控模型"""
    
    def __init__(self, input_size, d_model=128, nhead=8, num_layers=4, dropout=0.2):
        super(TransformerRiskControlModel, self).__init__()
        
        # 输入投影层
        self.input_projection = nn.Linear(input_size, d_model)
        
        # 位置编码
        self.pos_encoding = nn.Parameter(torch.randn(1000, d_model))
        
        # Transformer编码器
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dropout=dropout,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers)
        
        # 全局平均池化
        self.global_pool = nn.AdaptiveAvgPool1d(1)
        
        # 分类头
        self.classifier = nn.Sequential(
            nn.Linear(d_model, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        # 输入投影
        x = self.input_projection(x)
        
        # 添加位置编码
        seq_len = x.size(1)
        x = x + self.pos_encoding[:seq_len, :].unsqueeze(0)
        
        # Transformer编码
        x = self.transformer_encoder(x)
        
        # 全局池化
        x = x.transpose(1, 2)  # (batch, seq, features) -> (batch, features, seq)
        x = self.global_pool(x).squeeze(-1)
        
        # 分类
        x = self.classifier(x)
        
        return x.squeeze()

# 模型训练器
class RiskControlTrainer:
    """风控模型训练器"""
    
    def __init__(self, model, device='cpu'):
        self.model = model.to(device)
        self.device = device
        self.criterion = nn.BCELoss()
        self.optimizer = None
    
    def compile(self, optimizer='adam', lr=0.001):
        """编译模型"""
        if optimizer == 'adam':
            self.optimizer = optim.Adam(self.model.parameters(), lr=lr)
        elif optimizer == 'sgd':
            self.optimizer = optim.SGD(self.model.parameters(), lr=lr, momentum=0.9)
    
    def train_epoch(self, dataloader):
        """训练一个epoch"""
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        for batch_idx, (data, target) in enumerate(dataloader):
            data, target = data.to(self.device), target.to(self.device)
            
            self.optimizer.zero_grad()
            output = self.model(data)
            loss = self.criterion(output, target)
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
            predicted = (output > 0.5).float()
            total += target.size(0)
            correct += (predicted == target).sum().item()
        
        avg_loss = total_loss / len(dataloader)
        accuracy = correct / total
        
        return avg_loss, accuracy
    
    def validate(self, dataloader):
        """验证模型"""
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for data, target in dataloader:
                data, target = data.to(self.device), target.to(self.device)
                output = self.model(data)
                loss = self.criterion(output, target)
                
                total_loss += loss.item()
                predicted = (output > 0.5).float()
                total += target.size(0)
                correct += (predicted == target).sum().item()
        
        avg_loss = total_loss / len(dataloader)
        accuracy = correct / total
        
        return avg_loss, accuracy

# 使用示例
def example_deep_learning_models():
    """深度学习风控模型示例"""
    print("=== 深度学习风控模型示例 ===")
    
    # 设置设备
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"使用设备: {device}")
    
    # 生成示例序列数据
    np.random.seed(42)
    n_samples = 1000
    sequence_length = 50
    n_features = 10
    
    # 生成序列数据
    sequences = []
    labels = []
    
    for i in range(n_samples):
        # 正常用户序列
        if np.random.random() < 0.8:
            sequence = np.random.normal(0, 1, (sequence_length, n_features))
            label = 0
        else:
            # 异常用户序列（某些特征值异常）
            sequence = np.random.normal(0, 1, (sequence_length, n_features))
            # 在序列的后半部分添加异常值
            anomaly_start = sequence_length // 2
            sequence[anomaly_start:, :3] += np.random.normal(3, 1, (sequence_length - anomaly_start, 3))
            label = 1
        
        sequences.append(sequence)
        labels.append(label)
    
    # 转换为numpy数组
    sequences = np.array(sequences)
    labels = np.array(labels)
    
    # 分割数据
    from sklearn.model_selection import train_test_split
    
    X_train, X_test, y_train, y_test = train_test_split(
        sequences, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    # 创建数据集和数据加载器
    train_dataset = UserBehaviorDataset(X_train, y_train)
    test_dataset = UserBehaviorDataset(X_test, y_test)
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
    
    # 训练LSTM模型
    print("\n训练LSTM模型...")
    lstm_model = LSTMRiskControlModel(input_size=n_features, hidden_size=64, num_layers=2)
    lstm_trainer = RiskControlTrainer(lstm_model, device)
    lstm_trainer.compile(optimizer='adam', lr=0.001)
    
    # 训练几个epoch
    for epoch in range(10):
        train_loss, train_acc = lstm_trainer.train_epoch(train_loader)
        val_loss, val_acc = lstm_trainer.validate(test_loader)
        print(f"Epoch {epoch+1}: Train Loss={train_loss:.4f}, Train Acc={train_acc:.4f}, "
              f"Val Loss={val_loss:.4f}, Val Acc={val_acc:.4f}")
    
    # 训练CNN模型
    print("\n训练CNN模型...")
    cnn_model = CNNRiskControlModel(input_channels=n_features, sequence_length=sequence_length)
    cnn_trainer = RiskControlTrainer(cnn_model, device)
    cnn_trainer.compile(optimizer='adam', lr=0.001)
    
    for epoch in range(10):
        train_loss, train_acc = cnn_trainer.train_epoch(train_loader)
        val_loss, val_acc = cnn_trainer.validate(test_loader)
        print(f"Epoch {epoch+1}: Train Loss={train_loss:.4f}, Train Acc={train_acc:.4f}, "
              f"Val Loss={val_loss:.4f}, Val Acc={val_acc:.4f}")
    
    # 训练Transformer模型
    print("\n训练Transformer模型...")
    transformer_model = TransformerRiskControlModel(input_size=n_features, d_model=64, nhead=8)
    transformer_trainer = RiskControlTrainer(transformer_model, device)
    transformer_trainer.compile(optimizer='adam', lr=0.001)
    
    for epoch in range(10):
        train_loss, train_acc = transformer_trainer.train_epoch(train_loader)
        val_loss, val_acc = transformer_trainer.validate(test_loader)
        print(f"Epoch {epoch+1}: Train Loss={train_loss:.4f}, Train Acc={train_acc:.4f}, "
              f"Val Loss={val_loss:.4f}, Val Acc={val_acc:.4f}")

# 图神经网络在风控中的应用
class GraphRiskControlModel(nn.Module):
    """图神经网络风控模型"""
    
    def __init__(self, input_dim, hidden_dim=64, output_dim=1, num_layers=2):
        super(GraphRiskControlModel, self).__init__()
        
        # 图卷积层
        self.gcns = nn.ModuleList()
        self.gcns.append(nn.Linear(input_dim, hidden_dim))
        
        for _ in range(num_layers - 1):
            self.gcns.append(nn.Linear(hidden_dim, hidden_dim))
        
        # 节点分类层
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(32, output_dim),
            nn.Sigmoid()
        )
    
    def forward(self, x, adj):
        """
        前向传播
        
        Args:
            x: 节点特征矩阵 (num_nodes, input_dim)
            adj: 邻接矩阵 (num_nodes, num_nodes)
        """
        # 图卷积操作
        for gcn in self.gcns:
            # 邻接矩阵归一化
            degree = torch.sum(adj, dim=1, keepdim=True)
            degree = torch.where(degree > 0, 1.0 / torch.sqrt(degree), torch.zeros_like(degree))
            norm_adj = adj * degree * degree.t()
            
            # 图卷积
            x = torch.matmul(norm_adj, x)
            x = gcn(x)
            x = torch.relu(x)
        
        # 节点分类
        output = self.classifier(x)
        
        return output.squeeze()

# 自编码器异常检测
class AutoencoderAnomalyDetector(nn.Module):
    """自编码器异常检测模型"""
    
    def __init__(self, input_dim, hidden_dim=32):
        super(AutoencoderAnomalyDetector, self).__init__()
        
        # 编码器
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, hidden_dim),
            nn.ReLU()
        )
        
        # 解码器
        self.decoder = nn.Sequential(
            nn.Linear(hidden_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, input_dim),
            nn.Sigmoid()  # 假设输入已被归一化到[0,1]
        )
    
    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded
    
    def get_reconstruction_error(self, x):
        """获取重构误差"""
        reconstructed = self.forward(x)
        error = torch.mean((x - reconstructed) ** 2, dim=1)
        return error

# 使用示例
def example_graph_and_autoencoder():
    """图神经网络和自编码器示例"""
    print("\n=== 图神经网络和自编码器示例 ===")
    
    # 设置设备
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # 生成图数据示例
    num_nodes = 100
    input_dim = 16
    
    # 节点特征
    node_features = torch.randn(num_nodes, input_dim)
    
    # 生成邻接矩阵（模拟用户关系网络）
    adj_matrix = torch.zeros(num_nodes, num_nodes)
    for i in range(num_nodes):
        # 每个节点连接到几个随机节点
        connections = np.random.choice(num_nodes, size=np.random.randint(3, 10), replace=False)
        adj_matrix[i, connections] = 1
        adj_matrix[connections, i] = 1  # 无向图
    
    # 标签（模拟欺诈用户）
    labels = torch.zeros(num_nodes)
    fraud_indices = np.random.choice(num_nodes, size=10, replace=False)
    labels[fraud_indices] = 1
    
    # 训练图神经网络
    print("训练图神经网络...")
    gnn_model = GraphRiskControlModel(input_dim=input_dim, hidden_dim=32)
    gnn_model = gnn_model.to(device)
    
    optimizer = optim.Adam(gnn_model.parameters(), lr=0.01)
    criterion = nn.BCELoss()
    
    node_features = node_features.to(device)
    adj_matrix = adj_matrix.to(device)
    labels = labels.to(device)
    
    for epoch in range(100):
        gnn_model.train()
        optimizer.zero_grad()
        
        output = gnn_model(node_features, adj_matrix)
        loss = criterion(output, labels)
        
        loss.backward()
        optimizer.step()
        
        if epoch % 20 == 0:
            print(f"Epoch {epoch}, Loss: {loss.item():.4f}")
    
    # 训练自编码器异常检测
    print("\n训练自编码器异常检测...")
    autoencoder = AutoencoderAnomalyDetector(input_dim=input_dim, hidden_dim=16)
    autoencoder = autoencoder.to(device)
    
    ae_optimizer = optim.Adam(autoencoder.parameters(), lr=0.001)
    ae_criterion = nn.MSELoss()
    
    # 正常数据用于训练
    normal_data = node_features[labels == 0][:50]  # 使用部分正常数据
    
    for epoch in range(100):
        autoencoder.train()
        ae_optimizer.zero_grad()
        
        reconstructed = autoencoder(normal_data)
        loss = ae_criterion(reconstructed, normal_data)
        
        loss.backward()
        ae_optimizer.step()
        
        if epoch % 20 == 0:
            print(f"Autoencoder Epoch {epoch}, Loss: {loss.item():.4f}")
    
    # 检测异常
    autoencoder.eval()
    with torch.no_grad():
        reconstruction_errors = autoencoder.get_reconstruction_error(node_features)
        # 高重构误差的节点可能是异常节点
        anomaly_scores = reconstruction_errors.cpu().numpy()
        print(f"异常检测完成，平均重构误差: {np.mean(anomaly_scores):.4f}")

if __name__ == "__main__":
    example_deep_learning_models()
    example_graph_and_autoencoder()
```

### 2.2 深度学习模型优化

#### 2.2.1 模型压缩与加速

在实际风控场景中，深度学习模型的部署需要考虑性能和资源限制：

```python
# 模型优化技术
import torch.nn.utils.prune as prune

class ModelOptimizer:
    """模型优化器"""
    
    @staticmethod
    def prune_model(model, pruning_ratio=0.3):
        """
        模型剪枝
        
        Args:
            model: 待剪枝的模型
            pruning_ratio: 剪枝比例
        """
        # 对所有线性层进行剪枝
        for name, module in model.named_modules():
            if isinstance(module, nn.Linear):
                prune.l1_unstructured(module, name='weight', amount=pruning_ratio)
                prune.remove(module, 'weight')  # 移除剪枝掩码
        
        return model
    
    @staticmethod
    def quantize_model(model):
        """
        模型量化
        
        Args:
            model: 待量化的模型
        """
        # 静态量化
        model.eval()
        model.qconfig = torch.quantization.get_default_qconfig('fbgemm')
        torch.quantization.prepare(model, inplace=True)
        torch.quantization.convert(model, inplace=True)
        
        return model
    
    @staticmethod
    def knowledge_distillation(teacher_model, student_model, train_loader, device, epochs=10):
        """
        知识蒸馏
        
        Args:
            teacher_model: 教师模型
            student_model: 学生模型
            train_loader: 训练数据加载器
            device: 设备
            epochs: 训练轮数
        """
        teacher_model.eval()
        student_model.train()
        
        optimizer = optim.Adam(student_model.parameters(), lr=0.001)
        criterion = nn.KLDivLoss(reduction='batchmean')
        
        for epoch in range(epochs):
            total_loss = 0
            for batch_idx, (data, target) in enumerate(train_loader):
                data, target = data.to(device), target.to(device)
                
                optimizer.zero_grad()
                
                # 教师模型预测
                with torch.no_grad():
                    teacher_output = teacher_model(data)
                
                # 学生模型预测
                student_output = student_model(data)
                
                # 知识蒸馏损失
                loss = criterion(torch.log_softmax(student_output, dim=1),
                               torch.softmax(teacher_output, dim=1))
                
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
            
            print(f"Knowledge Distillation Epoch {epoch+1}, Loss: {total_loss/len(train_loader):.4f}")
        
        return student_model

# 模型集成
class EnsembleRiskControlModel:
    """集成风控模型"""
    
    def __init__(self, models, weights=None):
        self.models = models
        self.weights = weights or [1.0/len(models)] * len(models)
    
    def predict(self, x):
        """集成预测"""
        predictions = []
        
        for model in self.models:
            model.eval()
            with torch.no_grad():
                pred = model(x)
                predictions.append(pred)
        
        # 加权平均
        ensemble_pred = torch.zeros_like(predictions[0])
        for pred, weight in zip(predictions, self.weights):
            ensemble_pred += pred * weight
        
        return ensemble_pred

# 在线学习
class OnlineLearningModel:
    """在线学习模型"""
    
    def __init__(self, base_model, learning_rate=0.01):
        self.model = base_model
        self.optimizer = optim.SGD(self.model.parameters(), lr=learning_rate)
        self.criterion = nn.BCELoss()
    
    def update(self, x, y):
        """
        在线更新模型
        
        Args:
            x: 新样本特征
            y: 新样本标签
        """
        self.model.train()
        self.optimizer.zero_grad()
        
        output = self.model(x)
        loss = self.criterion(output, y)
        
        loss.backward()
        self.optimizer.step()
        
        self.model.eval()
        return loss.item()

# 使用示例
def example_model_optimization():
    """模型优化示例"""
    print("=== 模型优化示例 ===")
    
    # 创建示例模型
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # 原始模型
    original_model = nn.Sequential(
        nn.Linear(10, 128),
        nn.ReLU(),
        nn.Linear(128, 64),
        nn.ReLU(),
        nn.Linear(64, 1),
        nn.Sigmoid()
    )
    
    print(f"原始模型参数量: {sum(p.numel() for p in original_model.parameters())}")
    
    # 模型剪枝
    pruned_model = ModelOptimizer.prune_model(original_model, pruning_ratio=0.3)
    print(f"剪枝后模型参数量: {sum(p.numel() for p in pruned_model.parameters())}")
    
    # 创建集成模型
    model1 = nn.Sequential(nn.Linear(10, 64), nn.ReLU(), nn.Linear(64, 1), nn.Sigmoid())
    model2 = nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 1), nn.Sigmoid())
    model3 = nn.Sequential(nn.Linear(10, 16), nn.ReLU(), nn.Linear(16, 1), nn.Sigmoid())
    
    ensemble_model = EnsembleRiskControlModel([model1, model2, model3])
    print("集成模型创建完成")
    
    # 在线学习示例
    online_model = OnlineLearningModel(model1)
    
    # 模拟在线学习过程
    for i in range(10):
        # 生成新样本
        x = torch.randn(1, 10)
        y = torch.tensor([np.random.random() > 0.5]).float()
        
        # 更新模型
        loss = online_model.update(x, y)
        if i % 5 == 0:
            print(f"在线学习步骤 {i}, 损失: {loss:.4f}")

if __name__ == "__main__":
    example_model_optimization()
```

## 三、异常检测算法

### 3.1 Isolation Forest算法

Isolation Forest（孤立森林）是一种专门用于异常检测的无监督学习算法，特别适用于风控场景中的异常行为识别。

#### 3.1.1 算法原理

```python
# Isolation Forest实现
import numpy as np
from sklearn.ensemble import IsolationForest as SklearnIsolationForest
from sklearn.metrics import classification_report, roc_auc_score
import matplotlib.pyplot as plt

class IsolationForestNode:
    """孤立森林节点"""
    
    def __init__(self, feature_index=None, threshold=None, left=None, right=None, size=0, depth=0):
        self.feature_index = feature_index
        self.threshold = threshold
        self.left = left
        self.right = right
        self.size = size
        self.depth = depth

class IsolationForest:
    """孤立森林实现"""
    
    def __init__(self, n_estimators=100, max_samples=256, contamination=0.1, random_state=None):
        self.n_estimators = n_estimators
        self.max_samples = max_samples
        self.contamination = contamination
        self.random_state = random_state
        self.trees = []
        self.threshold_ = None
    
    def _get_random_split(self, X):
        """获取随机分割"""
        n_samples, n_features = X.shape
        
        if n_samples <= 1:
            return None, None
        
        # 随机选择特征
        feature_index = np.random.randint(0, n_features)
        
        # 随机选择分割点
        min_val = X[:, feature_index].min()
        max_val = X[:, feature_index].max()
        
        if min_val == max_val:
            return None, None
        
        threshold = np.random.uniform(min_val, max_val)
        
        return feature_index, threshold
    
    def _build_tree(self, X, depth=0):
        """构建孤立树"""
        n_samples, n_features = X.shape
        
        # 停止条件
        if n_samples <= 1 or depth >= np.ceil(np.log2(self.max_samples)):
            return IsolationForestNode(size=n_samples, depth=depth)
        
        # 获取随机分割
        feature_index, threshold = self._get_random_split(X)
        
        if feature_index is None:
            return IsolationForestNode(size=n_samples, depth=depth)
        
        # 分割数据
        left_mask = X[:, feature_index] < threshold
        right_mask = ~left_mask
        
        left_X = X[left_mask]
        right_X = X[right_mask]
        
        # 递归构建子树
        left_child = self._build_tree(left_X, depth + 1)
        right_child = self._build_tree(right_X, depth + 1)
        
        return IsolationForestNode(
            feature_index=feature_index,
            threshold=threshold,
            left=left_child,
            right=right_child,
            size=n_samples,
            depth=depth
        )
    
    def _path_length(self, x, node, depth=0):
        """计算样本的路径长度"""
        if isinstance(node, IsolationForestNode) and node.size <= 1:
            return depth + self._c(node.size)
        
        if node.feature_index is None:
            return depth + self._c(node.size)
        
        if x[node.feature_index] < node.threshold:
            return self._path_length(x, node.left, depth + 1)
        else:
            return self._path_length(x, node.right, depth + 1)
    
    def _c(self, n):
        """计算调和数"""
        if n > 2:
            return 2 * (np.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n
        elif n == 2:
            return 1
        else:
            return 0
    
    def fit(self, X):
        """训练孤立森林"""
        if self.random_state is not None:
            np.random.seed(self.random_state)
        
        n_samples = X.shape[0]
        self.max_samples = min(self.max_samples, n_samples)
        
        # 构建多棵孤立树
        for _ in range(self.n_estimators):
            # 随机采样
            indices = np.random.choice(n_samples, self.max_samples, replace=False)
            X_sample = X[indices]
            
            # 构建树
            tree = self._build_tree(X_sample)
            self.trees.append(tree)
        
        # 计算异常分数阈值
        scores = self.decision_function(X)
        self.threshold_ = np.percentile(scores, 100 * (1 - self.contamination))
    
    def decision_function(self, X):
        """计算异常分数"""
        n_samples = X.shape[0]
        avg_path_lengths = np.zeros(n_samples)
        
        # 计算每个样本的平均路径长度
        for i in range(n_samples):
            path_lengths = []
            for tree in self.trees:
                path_length = self._path_length(X[i], tree)
                path_lengths.append(path_length)
            
            avg_path_lengths[i] = np.mean(path_lengths)
        
        # 转换为异常分数
        scores = np.power(2, -avg_path_lengths / self._c(self.max_samples))
        return scores
    
    def predict(self, X):
        """预测"""
        scores = self.decision_function(X)
        return (scores < self.threshold_).astype(int)

# 使用示例
def example_isolation_forest():
    """孤立森林示例"""
    print("=== 孤立森林示例 ===")
    
    # 生成示例数据
    np.random.seed(42)
    n_normal = 1000
    n_anomalies = 100
    
    # 正常数据（高斯分布）
    normal_data = np.random.multivariate_normal([0, 0], [[1, 0], [0, 1]], n_normal)
    
    # 异常数据（远离正常数据的点）
    anomaly_data = np.random.multivariate_normal([5, 5], [[1, 0], [0, 1]], n_anomalies)
    
    # 合并数据
    X = np.vstack([normal_data, anomaly_data])
    y = np.hstack([np.zeros(n_normal), np.ones(n_anomalies)])
    
    # 使用自实现的孤立森林
    print("使用自实现的孤立森林:")
    iso_forest_custom = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    iso_forest_custom.fit(X)
    
    predictions_custom = iso_forest_custom.predict(X)
    scores_custom = iso_forest_custom.decision_function(X)
    
    auc_custom = roc_auc_score(y, scores_custom)
    print(f"自实现AUC: {auc_custom:.4f}")
    print("自实现分类报告:")
    print(classification_report(y, predictions_custom))
    
    # 使用sklearn的孤立森林
    print("\n使用sklearn的孤立森林:")
    iso_forest_sklearn = SklearnIsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    iso_forest_sklearn.fit(X)
    
    predictions_sklearn = iso_forest_sklearn.predict(X)
    # 转换标签（sklearn使用1表示正常，-1表示异常）
    predictions_sklearn = (predictions_sklearn == -1).astype(int)
    scores_sklearn = iso_forest_sklearn.decision_function(X)
    
    auc_sklearn = roc_auc_score(y, -scores_sklearn)  # 注意符号
    print(f"Sklearn AUC: {auc_sklearn:.4f}")
    print("Sklearn分类报告:")
    print(classification_report(y, predictions_sklearn))
    
    # 可视化结果
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 3, 1)
    plt.scatter(normal_data[:, 0], normal_data[:, 1], c='blue', alpha=0.6, label='Normal')
    plt.scatter(anomaly_data[:, 0], anomaly_data[:, 1], c='red', alpha=0.6, label='Anomaly')
    plt.title('Original Data')
    plt.legend()
    
    plt.subplot(1, 3, 2)
    colors_custom = ['blue' if p == 0 else 'red' for p in predictions_custom]
    plt.scatter(X[:, 0], X[:, 1], c=colors_custom, alpha=0.6)
    plt.title('Custom Isolation Forest')
    
    plt.subplot(1, 3, 3)
    colors_sklearn = ['blue' if p == 0 else 'red' for p in predictions_sklearn]
    plt.scatter(X[:, 0], X[:, 1], c=colors_sklearn, alpha=0.6)
    plt.title('Sklearn Isolation Forest')
    
    plt.tight_layout()
    plt.show()

# 孤立森林在风控中的应用
class RiskControlAnomalyDetector:
    """风控异常检测器"""
    
    def __init__(self, contamination=0.1, n_estimators=100):
        self.iso_forest = SklearnIsolationForest(
            contamination=contamination,
            n_estimators=n_estimators,
            random_state=42
        )
        self.feature_names = None
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def prepare_features(self, data: pd.DataFrame) -> np.ndarray:
        """
        准备特征
        
        Args:
            data: 原始数据
            
        Returns:
            特征矩阵
        """
        # 选择数值特征
        numeric_features = data.select_dtypes(include=[np.number]).columns.tolist()
        
        # 移除ID类特征
        numeric_features = [f for f in numeric_features if not f.endswith('_id')]
        
        self.feature_names = numeric_features
        X = data[numeric_features].values
        
        return X
    
    def fit(self, data: pd.DataFrame):
        """
        训练模型
        
        Args:
            data: 训练数据
        """
        X = self.prepare_features(data)
        
        # 标准化特征
        X_scaled = self.scaler.fit_transform(X)
        
        # 训练孤立森林
        self.iso_forest.fit(X_scaled)
        self.is_fitted = True
    
    def predict(self, data: pd.DataFrame) -> np.ndarray:
        """
        预测
        
        Args:
            data: 待预测数据
            
        Returns:
            预测结果（0表示正常，1表示异常）
        """
        if not self.is_fitted:
            raise ValueError("模型尚未训练")
        
        X = self.prepare_features(data)
        X_scaled = self.scaler.transform(X)
        
        predictions = self.iso_forest.predict(X_scaled)
        # 转换标签（1表示正常，-1表示异常）
        return (predictions == -1).astype(int)
    
    def decision_function(self, data: pd.DataFrame) -> np.ndarray:
        """
        计算异常分数
        
        Args:
            data: 数据
            
        Returns:
            异常分数
        """
        if not self.is_fitted:
            raise ValueError("模型尚未训练")
        
        X = self.prepare_features(data)
        X_scaled = self.scaler.transform(X)
        
        return self.iso_forest.decision_function(X_scaled)

# 多种异常检测算法比较
from sklearn.svm import OneClassSVM
from sklearn.neighbors import LocalOutlierFactor
from sklearn.covariance import EllipticEnvelope

class AnomalyDetectionComparison:
    """异常检测算法比较"""
    
    def __init__(self):
        self.algorithms = {
            'IsolationForest': SklearnIsolationForest(contamination=0.1, random_state=42),
            'OneClassSVM': OneClassSVM(nu=0.1, kernel='rbf', gamma='scale'),
            'LocalOutlierFactor': LocalOutlierFactor(n_neighbors=20, contamination=0.1),
            'EllipticEnvelope': EllipticEnvelope(contamination=0.1, random_state=42)
        }
    
    def compare_algorithms(self, X_train, X_test, y_test):
        """
        比较不同算法
        
        Args:
            X_train: 训练数据
            X_test: 测试数据
            y_test: 测试标签
        """
        results = {}
        
        for name, algorithm in self.algorithms.items():
            try:
                # 训练模型
                if name == 'LocalOutlierFactor':
                    # LOF不需要单独的训练步骤
                    predictions = algorithm.fit_predict(X_test)
                else:
                    algorithm.fit(X_train)
                    predictions = algorithm.predict(X_test)
                
                # 转换标签
                if name in ['IsolationForest', 'OneClassSVM', 'EllipticEnvelope']:
                    predictions = (predictions == -1).astype(int)
                elif name == 'LocalOutlierFactor':
                    predictions = (predictions == -1).astype(int)
                
                # 计算指标
                auc = roc_auc_score(y_test, predictions)
                report = classification_report(y_test, predictions, output_dict=True)
                
                results[name] = {
                    'auc': auc,
                    'precision': report['1']['precision'],
                    'recall': report['1']['recall'],
                    'f1': report['1']['f1-score']
                }
                
                print(f"{name}: AUC={auc:.4f}, Precision={report['1']['precision']:.4f}, "
                      f"Recall={report['1']['recall']:.4f}, F1={report['1']['f1-score']:.4f}")
                
            except Exception as e:
                print(f"{name} 训练失败: {e}")
                results[name] = {'error': str(e)}
        
        return results

# 使用示例
def example_anomaly_detection_comparison():
    """异常检测算法比较示例"""
    print("\n=== 异常检测算法比较 ===")
    
    # 生成复杂的数据集
    np.random.seed(42)
    n_normal = 2000
    n_anomalies = 200
    
    # 正常数据：多模态分布
    normal_data1 = np.random.multivariate_normal([0, 0], [[1, 0.5], [0.5, 1]], n_normal//2)
    normal_data2 = np.random.multivariate_normal([3, 3], [[1, -0.3], [-0.3, 1]], n_normal//2)
    normal_data = np.vstack([normal_data1, normal_data2])
    
    # 异常数据：多种类型
    # 类型1：远离正常数据的点
    anomaly_data1 = np.random.multivariate_normal([6, 6], [[0.5, 0], [0, 0.5]], n_anomalies//2)
    
    # 类型2：局部异常（在正常数据区域内的小团簇）
    anomaly_data2 = np.random.multivariate_normal([1, 1], [[0.1, 0], [0, 0.1]], n_anomalies//2)
    
    anomaly_data = np.vstack([anomaly_data1, anomaly_data2])
    
    # 合并数据
    X = np.vstack([normal_data, anomaly_data])
    y = np.hstack([np.zeros(n_normal), np.ones(n_anomalies)])
    
    # 分割训练和测试数据
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    # 比较算法
    comparator = AnomalyDetectionComparison()
    results = comparator.compare_algorithms(X_train, X_test, y_test)
    
    # 可视化结果
    plt.figure(figsize=(15, 5))
    
    plt.subplot(1, 3, 1)
    plt.scatter(normal_data[:, 0], normal_data[:, 1], c='blue', alpha=0.6, label='Normal', s=20)
    plt.scatter(anomaly_data[:, 0], anomaly_data[:, 1], c='red', alpha=0.6, label='Anomaly', s=20)
    plt.title('Original Data')
    plt.legend()
    
    # 可视化不同算法的检测结果
    algorithms_to_visualize = ['IsolationForest', 'OneClassSVM']
    for i, alg_name in enumerate(algorithms_to_visualize):
        if alg_name in comparator.algorithms:
            try:
                algorithm = comparator.algorithms[alg_name]
                if alg_name == 'LocalOutlierFactor':
                    predictions = algorithm.fit_predict(X)
                else:
                    algorithm.fit(X_train)
                    predictions = algorithm.predict(X)
                
                predictions = (predictions == -1).astype(int)
                
                plt.subplot(1, 3, i+2)
                colors = ['blue' if p == 0 else 'red' for p in predictions]
                plt.scatter(X[:, 0], X[:, 1], c=colors, alpha=0.6, s=20)
                plt.title(f'{alg_name} Detection')
            except Exception as e:
                print(f"可视化 {alg_name} 失败: {e}")
    
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    example_isolation_forest()
    print()
    example_anomaly_detection_comparison()
```

### 3.2 异常检测在风控中的应用

#### 3.2.1 用户行为异常检测

```python
# 用户行为异常检测
class UserBehaviorAnomalyDetector:
    """用户行为异常检测器"""
    
    def __init__(self, contamination=0.1):
        self.contamination = contamination
        self.detector = SklearnIsolationForest(contamination=contamination, random_state=42)
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.is_fitted = False
    
    def extract_behavior_features(self, user_events: pd.DataFrame) -> pd.DataFrame:
        """
        提取用户行为特征
        
        Args:
            user_events: 用户事件数据
            
        Returns:
            用户行为特征DataFrame
        """
        features = pd.DataFrame()
        
        # 基础统计特征
        features['user_id'] = user_events['user_id'].unique()
        user_groups = user_events.groupby('user_id')
        
        # 事件频率特征
        features['event_count_24h'] = user_groups.apply(
            lambda x: len(x[x['timestamp'] > (x['timestamp'].max() - pd.Timedelta(days=1))])
        )
        
        features['event_count_7d'] = user_groups['event_id'].count()
        features['avg_events_per_day'] = features['event_count_7d'] / 7
        
        # 时间特征
        features['active_days'] = user_groups['timestamp'].nunique()
        features['session_count'] = user_groups['session_id'].nunique()
        features['avg_session_duration'] = user_groups.apply(
            lambda x: (x.groupby('session_id')['timestamp'].max() - 
                      x.groupby('session_id')['timestamp'].min()).mean().total_seconds()
        )
        
        # 设备特征
        features['device_count'] = user_groups['device_id'].nunique()
        features['ip_count'] = user_groups['ip_address'].nunique()
        features['device_diversity'] = features['device_count'] / features['event_count_7d']
        
        # 异常行为特征
        features['late_night_events'] = user_groups.apply(
            lambda x: len(x[(x['timestamp'].dt.hour >= 22) | (x['timestamp'].dt.hour <= 6)])
        )
        
        features['bulk_events'] = user_groups.apply(
            self._calculate_bulk_events
        )
        
        # 地理位置特征
        features['location_count'] = user_groups['location'].nunique()
        features['location_change_rate'] = features['location_count'] / features['active_days']
        
        return features
    
    def _calculate_bulk_events(self, user_data: pd.DataFrame) -> int:
        """计算批量事件"""
        user_data = user_data.sort_values('timestamp')
        user_data['time_diff'] = user_data['timestamp'].diff().dt.total_seconds()
        # 标记10秒内的连续事件
        bulk_mask = user_data['time_diff'] < 10
        return bulk_mask.sum()
    
    def prepare_features(self, features: pd.DataFrame) -> np.ndarray:
        """
        准备特征矩阵
        
        Args:
            features: 特征DataFrame
            
        Returns:
            特征矩阵
        """
        # 选择数值特征列
        numeric_columns = features.select_dtypes(include=[np.number]).columns.tolist()
        self.feature_columns = [col for col in numeric_columns if col != 'user_id']
        
        X = features[self.feature_columns].values
        
        # 处理缺失值
        X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
        
        return X
    
    def fit(self, user_events: pd.DataFrame):
        """
        训练模型
        
        Args:
            user_events: 用户事件数据
        """
        # 提取特征
        features = self.extract_behavior_features(user_events)
        
        # 准备特征矩阵
        X = self.prepare_features(features)
        
        # 标准化
        X_scaled = self.scaler.fit_transform(X)
        
        # 训练模型
        self.detector.fit(X_scaled)
        self.is_fitted = True
    
    def predict_anomalies(self, user_events: pd.DataFrame) -> pd.DataFrame:
        """
        预测异常用户
        
        Args:
            user_events: 用户事件数据
            
        Returns:
            包含异常预测结果的DataFrame
        """
        if not self.is_fitted:
            raise ValueError("模型尚未训练")
        
        # 提取特征
        features = self.extract_behavior_features(user_events)
        
        # 准备特征矩阵
        X = self.prepare_features(features)
        
        # 标准化
        X_scaled = self.scaler.transform(X)
        
        # 预测
        predictions = self.detector.predict(X_scaled)
        anomaly_scores = self.detector.decision_function(X_scaled)
        
        # 转换结果
        results = features[['user_id']].copy()
        results['is_anomaly'] = (predictions == -1).astype(int)
        results['anomaly_score'] = anomaly_scores
        results['risk_level'] = pd.cut(
            -anomaly_scores,  # 注意符号
            bins=[-np.inf, -0.5, -0.1, 0.1, np.inf],
            labels=['High', 'Medium', 'Low', 'Very Low']
        )
        
        return results

# 实时异常检测
class RealTimeAnomalyDetector:
    """实时异常检测器"""
    
    def __init__(self, window_size=1000, contamination=0.1):
        self.window_size = window_size
        self.contamination = contamination
        self.event_buffer = []
        self.detector = None
        self.scaler = StandardScaler()
        self.feature_extractor = UserBehaviorAnomalyDetector()
    
    def add_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        添加事件并检测异常
        
        Args:
            event: 事件数据
            
        Returns:
            检测结果
        """
        # 添加到缓冲区
        self.event_buffer.append(event)
        
        # 维持窗口大小
        if len(self.event_buffer) > self.window_size:
            self.event_buffer.pop(0)
        
        # 当缓冲区满时进行检测
        if len(self.event_buffer) == self.window_size:
            return self._detect_anomalies()
        
        return {'status': 'buffering', 'buffer_size': len(self.event_buffer)}
    
    def _detect_anomalies(self) -> Dict[str, Any]:
        """检测异常"""
        try:
            # 转换为DataFrame
            events_df = pd.DataFrame(self.event_buffer)
            events_df['timestamp'] = pd.to_datetime(events_df['timestamp'])
            
            # 提取特征
            features = self.feature_extractor.extract_behavior_features(events_df)
            
            # 如果是第一次，初始化检测器
            if self.detector is None:
                X = self.feature_extractor.prepare_features(features)
                X_scaled = self.scaler.fit_transform(X)
                
                self.detector = SklearnIsolationForest(
                    contamination=self.contamination, 
                    random_state=42
                )
                self.detector.fit(X_scaled)
            else:
                # 使用现有检测器
                X = self.feature_extractor.prepare_features(features)
                X_scaled = self.scaler.transform(X)
                
                predictions = self.detector.predict(X_scaled)
                anomaly_scores = self.detector.decision_function(X_scaled)
                
                # 返回异常用户
                anomaly_users = features[(predictions == -1)]['user_id'].tolist()
                
                return {
                    'status': 'detection_complete',
                    'anomaly_users': anomaly_users,
                    'anomaly_count': len(anomaly_users),
                    'total_users': len(features)
                }
        
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
        
        return {'status': 'no_detection'}

# 使用示例
def example_user_behavior_anomaly_detection():
    """用户行为异常检测示例"""
    print("=== 用户行为异常检测示例 ===")
    
    # 生成模拟用户事件数据
    np.random.seed(42)
    n_users = 1000
    n_events_per_user = 50
    
    events_data = []
    
    for user_id in range(n_users):
        # 正常用户
        if np.random.random() < 0.95:
            # 生成正常行为模式
            for event_id in range(n_events_per_user):
                events_data.append({
                    'user_id': f'user_{user_id}',
                    'event_id': f'event_{user_id}_{event_id}',
                    'session_id': f'session_{user_id}_{event_id // 10}',
                    'device_id': f'device_{user_id % 50}',
                    'ip_address': f'192.168.1.{user_id % 255}',
                    'location': f'city_{user_id % 10}',
                    'timestamp': pd.Timestamp('2023-01-01') + 
                                pd.Timedelta(days=np.random.randint(0, 30)) +
                                pd.Timedelta(seconds=np.random.randint(0, 86400))
                })
        else:
            # 异常用户（生成异常行为）
            for event_id in range(n_events_per_user * 3):  # 更多事件
                events_data.append({
                    'user_id': f'user_{user_id}',
                    'event_id': f'event_{user_id}_{event_id}',
                    'session_id': f'session_{user_id}_{event_id}',
                    'device_id': f'device_{np.random.randint(1000, 1010)}',  # 使用罕见设备
                    'ip_address': f'10.0.0.{np.random.randint(1, 100)}',    # 使用内部IP
                    'location': f'city_{np.random.randint(100, 200)}',       # 罕见位置
                    'timestamp': pd.Timestamp('2023-01-01') + 
                                pd.Timedelta(seconds=np.random.randint(0, 86400))  # 随机时间
                })
    
    events_df = pd.DataFrame(events_data)
    print(f"生成事件数据: {len(events_df)} 条记录")
    print(f"用户数量: {events_df['user_id'].nunique()}")
    
    # 训练异常检测器
    detector = UserBehaviorAnomalyDetector(contamination=0.05)
    detector.fit(events_df)
    
    # 预测异常
    results = detector.predict_anomalies(events_df)
    
    print(f"\n检测结果:")
    print(f"异常用户数量: {results['is_anomaly'].sum()}")
    print(f"异常率: {results['is_anomaly'].mean():.2%}")
    
    # 显示高风险用户
    high_risk_users = results[results['risk_level'] == 'High']
    print(f"\n高风险用户 ({len(high_risk_users)} 个):")
    print(high_risk_users[['user_id', 'anomaly_score']].head(10))
    
    # 实时检测示例
    print("\n=== 实时异常检测示例 ===")
    real_time_detector = RealTimeAnomalyDetector(window_size=100, contamination=0.1)
    
    # 模拟实时事件流
    for i in range(150):
        event = {
            'user_id': f'rt_user_{np.random.randint(0, 20)}',
            'event_id': f'rt_event_{i}',
            'session_id': f'rt_session_{i // 5}',
            'device_id': f'rt_device_{np.random.randint(0, 5)}',
            'ip_address': f'192.168.1.{np.random.randint(1, 100)}',
            'location': f'rt_city_{np.random.randint(0, 3)}',
            'timestamp': pd.Timestamp('2023-01-01') + pd.Timedelta(seconds=i*10)
        }
        
        result = real_time_detector.add_event(event)
        
        if result['status'] == 'detection_complete':
            print(f"检测完成: 发现 {result['anomaly_count']} 个异常用户")
        elif result['status'] == 'buffering':
            if i % 30 == 0:  # 每30个事件报告一次
                print(f"缓冲中: {result['buffer_size']}/{real_time_detector.window_size}")

if __name__ == "__main__":
    example_user_behavior_anomaly_detection()
```

## 四、模型选择与评估

### 4.1 风控场景模型选择指南

不同风控场景需要选择不同的模型算法，以下是选择指南：

#### 4.1.1 场景适配性分析

```python
# 模型选择指南
class ModelSelectionGuide:
    """模型选择指南"""
    
    @staticmethod
    def get_recommendations(scenario: str, data_characteristics: Dict[str, Any]) -> Dict[str, Any]:
        """
        获取模型推荐
        
        Args:
            scenario: 应用场景
            data_characteristics: 数据特征
            
        Returns:
            推荐结果
        """
        recommendations = {
            'scenario': scenario,
            'recommendations': [],
            'reasoning': []
        }
        
        if scenario == 'transaction_fraud':
            recommendations['recommendations'] = ['XGBoost', 'LightGBM', 'Deep Neural Network']
            recommendations['reasoning'] = [
                'GBDT算法对交易特征处理能力强',
                '深度学习可以捕获复杂模式',
                '需要高精度和可解释性'
            ]
            
        elif scenario == 'marketing_abuse':
            recommendations['recommendations'] = ['Isolation Forest', 'XGBoost', 'LSTM']
            recommendations['reasoning'] = [
                '异常检测适合发现新型作弊模式',
                'GBDT处理用户行为特征效果好',
                '序列模型捕获时间模式'
            ]
            
        elif scenario == 'content_moderation':
            recommendations['recommendations'] = ['CNN', 'Transformer', 'Ensemble']
            recommendations['reasoning'] = [
                'CNN适合文本和图像特征',
                'Transformer捕获长距离依赖',
                '集成模型提升稳定性'
            ]
            
        elif scenario == 'user_risk_scoring':
            recommendations['recommendations'] = ['LightGBM', 'Random Forest', 'Logistic Regression']
            recommendations['reasoning'] = [
                'GBDT提供良好的准确性和可解释性',
                '随机森林稳定性好',
                '逻辑回归适合基准模型'
            ]
        
        # 根据数据特征调整推荐
        n_samples = data_characteristics.get('n_samples', 0)
        n_features = data_characteristics.get('n_features', 0)
        feature_types = data_characteristics.get('feature_types', [])
        
        if n_samples < 10000:
            recommendations['recommendations'].append('Smaller Data Optimized Models')
            recommendations['reasoning'].append('小数据集需要防止过拟合')
        
        if n_features > 100:
            recommendations['recommendations'].append('Feature Selection + XGBoost')
            recommendations['reasoning'].append('高维特征需要特征选择')
        
        if 'categorical' in feature_types:
            recommendations['recommendations'].insert(0, 'LightGBM')
            recommendations['reasoning'].insert(0, 'LightGBM原生支持类别特征')
        
        if 'sequential' in feature_types:
            recommendations['recommendations'].append('LSTM/GRU')
            recommendations['reasoning'].append('序列数据适合RNN模型')
        
        return recommendations

# 模型性能评估框架
class ModelEvaluationFramework:
    """模型性能评估框架"""
    
    def __init__(self):
        self.metrics = {
            'classification': ['accuracy', 'precision', 'recall', 'f1', 'auc', 'pr_auc'],
            'regression': ['mse', 'mae', 'rmse', 'r2'],
            'ranking': ['ndcg', 'map', 'mrr']
        }
    
    def evaluate_classification_model(self, y_true, y_pred, y_prob=None) -> Dict[str, float]:
        """
        评估分类模型
        
        Args:
            y_true: 真实标签
            y_pred: 预测标签
            y_prob: 预测概率
            
        Returns:
            评估指标字典
        """
        from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                                   f1_score, roc_auc_score, average_precision_score)
        
        results = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, zero_division=0),
            'recall': recall_score(y_true, y_pred, zero_division=0),
            'f1': f1_score(y_true, y_pred, zero_division=0)
        }
        
        if y_prob is not None:
            results['auc'] = roc_auc_score(y_true, y_prob)
            results['pr_auc'] = average_precision_score(y_true, y_prob)
        
        return results
    
    def evaluate_model_business_impact(self, y_true, y_pred, cost_matrix: Dict[str, float]) -> Dict[str, float]:
        """
        评估模型业务影响
        
        Args:
            y_true: 真实标签
            y_pred: 预测标签
            cost_matrix: 成本矩阵
            
        Returns:
            业务影响评估
        """
        from sklearn.metrics import confusion_matrix
        
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        
        # 计算业务成本
        total_cost = (tn * cost_matrix['tn'] + fp * cost_matrix['fp'] + 
                     fn * cost_matrix['fn'] + tp * cost_matrix['tp'])
        
        # 计算业务收益（假设防止欺诈的收益）
        prevented_loss = tp * cost_matrix.get('prevented_loss_per_fraud', 0)
        business_value = prevented_loss - total_cost
        
        return {
            'total_cost': total_cost,
            'prevented_loss': prevented_loss,
            'business_value': business_value,
            'roi': business_value / max(1, total_cost),
            'confusion_matrix': {'tn': tn, 'fp': fp, 'fn': fn, 'tp': tp}
        }

# 模型对比实验
def model_comparison_experiment():
    """模型对比实验"""
    print("=== 模型对比实验 ===")
    
    # 生成实验数据
    np.random.seed(42)
    n_samples = 10000
    n_features = 20
    
    X = np.random.randn(n_samples, n_features)
    # 创建复杂的非线性关系
    y = ((X[:, 0] * X[:, 1] + X[:, 2]**2 - X[:, 3] * X[:, 4] + 
          np.random.randn(n_samples) * 0.1) > 0).astype(int)
    
    # 分割数据
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 定义模型
    models = {
        'LogisticRegression': {
            'model': SklearnIsolationForest(contamination=0.1),
            'type': 'sklearn'
        },
        'XGBoost': {
            'model': xgb.XGBClassifier(n_estimators=100, random_state=42),
            'type': 'xgboost'
        },
        'LightGBM': {
            'model': lgb.LGBMClassifier(n_estimators=100, random_state=42),
            'type': 'lightgbm'
        }
    }
    
    # 成本矩阵（风控场景）
    cost_matrix = {
        'tp': 0,      # 正确拦截欺诈的成本（主要是处理成本）
        'fp': 10,     # 错误拦截正常用户造成的损失
        'fn': 100,    # 未能拦截欺诈造成的损失
        'tn': 0,      # 正确放过正常用户的成本
        'prevented_loss_per_fraud': 1000  # 每个防止的欺诈带来的收益
    }
    
    # 评估框架
    evaluator = ModelEvaluationFramework()
    
    results = {}
    
    for name, model_info in models.items():
        try:
            model = model_info['model']
            
            # 训练模型
            if name == 'LogisticRegression':
                from sklearn.linear_model import LogisticRegression
                model = LogisticRegression(random_state=42)
                model.fit(X_train, y_train)
            else:
                model.fit(X_train, y_train)
            
            # 预测
            y_pred = model.predict(X_test)
            if hasattr(model, 'predict_proba'):
                y_prob = model.predict_proba(X_test)[:, 1]
            else:
                y_prob = None
            
            # 评估性能
            performance = evaluator.evaluate_classification_model(y_test, y_pred, y_prob)
            
            # 评估业务影响
            business_impact = evaluator.evaluate_model_business_impact(y_test, y_pred, cost_matrix)
            
            results[name] = {
                'performance': performance,
                'business_impact': business_impact
            }
            
            print(f"\n{name} 结果:")
            print(f"  性能指标:")
            for metric, value in performance.items():
                print(f"    {metric}: {value:.4f}")
            
            print(f"  业务影响:")
            print(f"    总成本: {business_impact['total_cost']:.2f}")
            print(f"    防止损失: {business_impact['prevented_loss']:.2f}")
            print(f"    业务价值: {business_impact['business_value']:.2f}")
            print(f"    ROI: {business_impact['roi']:.4f}")
            
        except Exception as e:
            print(f"{name} 训练失败: {e}")
            results[name] = {'error': str(e)}
    
    return results

# 使用示例
def example_model_selection_and_evaluation():
    """模型选择和评估示例"""
    print("=== 模型选择和评估示例 ===")
    
    # 获取模型推荐
    guide = ModelSelectionGuide()
    
    scenarios = [
        {
            'name': 'transaction_fraud',
            'characteristics': {
                'n_samples': 500000,
                'n_features': 50,
                'feature_types': ['numerical', 'categorical']
            }
        },
        {
            'name': 'marketing_abuse',
            'characteristics': {
                'n_samples': 100000,
                'n_features': 30,
                'feature_types': ['numerical', 'sequential']
            }
        }
    ]
    
    for scenario in scenarios:
        recommendations = guide.get_recommendations(
            scenario['name'], 
            scenario['characteristics']
        )
        
        print(f"\n场景: {scenario['name']}")
        print(f"推荐模型: {', '.join(recommendations['recommendations'])}")
        print("推荐理由:")
        for reason in recommendations['reasoning']:
            print(f"  - {reason}")
    
    # 运行模型对比实验
    print("\n" + "="*50)
    results = model_comparison_experiment()
    
    # 总结最佳模型
    print("\n=== 模型对比总结 ===")
    best_models = {}
    
    metrics = ['auc', 'f1', 'precision', 'recall']
    for metric in metrics:
        best_score = -1
        best_model = None
        
        for model_name, result in results.items():
            if 'error' not in result and metric in result['performance']:
                score = result['performance'][metric]
                if score > best_score:
                    best_score = score
                    best_model = model_name
        
        if best_model:
            best_models[metric] = {'model': best_model, 'score': best_score}
            print(f"最佳 {metric.upper()}: {best_model} ({best_score:.4f})")
    
    # 业务价值最佳模型
    best_business_value = -float('inf')
    best_business_model = None
    
    for model_name, result in results.items():
        if 'error' not in result and 'business_impact' in result:
            value = result['business_impact']['business_value']
            if value > best_business_value:
                best_business_value = value
                best_business_model = model_name
    
    if best_business_model:
        print(f"最佳业务价值: {best_business_model} ({best_business_value:.2f})")

if __name__ == "__main__":
    example_model_selection_and_evaluation()
```

## 五、总结

在企业级智能风控平台中，选择合适的模型算法对于风险识别的准确性和系统的整体性能至关重要。本文详细介绍了三种常用的风控模型：

1. **GBDT系列算法**（XGBoost、LightGBM）：凭借其出色的特征处理能力、强大的非线性拟合能力和良好的可解释性，成为风控建模的首选算法之一。在交易反欺诈和营销反作弊等场景中表现出色。

2. **深度学习模型**：通过其强大的表征学习能力，在处理复杂、高维数据方面展现出独特优势。特别适用于序列建模、图分析和复杂模式识别等场景。

3. **异常检测算法**（Isolation Forest）：专门用于异常检测，在识别新型欺诈模式和异常行为方面发挥重要作用。计算效率高，适合实时检测场景。

在实际应用中，应根据具体的业务场景、数据特征和性能要求来选择合适的模型算法，并通过科学的评估方法来验证模型效果。同时，模型的选择不是一次性的，需要根据业务发展和数据变化进行持续优化和迭代。

通过合理选择和应用这些模型算法，可以构建更加智能、高效的风控系统，为企业的业务发展提供有力保障。