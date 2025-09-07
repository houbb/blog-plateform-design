---
title: "特征体系规划: 基础特征、统计特征、交叉特征、图特征、文本特征"
date: 2025-09-06
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 特征体系规划：基础特征、统计特征、交叉特征、图特征、文本特征

## 引言

在企业级智能风控平台中，特征工程是连接原始数据与机器学习模型的关键桥梁。高质量的特征能够显著提升模型的性能和效果，而合理的特征体系规划则是构建高效风控系统的基础。特征体系规划不仅涉及特征的设计和分类，还包括特征的管理、更新和优化等全生命周期管理。

本文将深入探讨风控平台中的特征体系规划，包括基础特征、统计特征、交叉特征、图特征、文本特征等不同类型特征的设计思路和实现方法，为构建完善的特征工程体系提供指导。

## 一、特征体系规划概述

### 1.1 特征工程的重要性

特征工程是机器学习项目中最为关键的环节之一，在风控场景中尤为重要。好的特征能够：

**业务价值**：
1. **提升模型效果**：高质量特征显著提升模型准确性和稳定性
2. **降低业务风险**：更准确的风险识别能力
3. **优化用户体验**：减少对正常用户的误伤
4. **提高运营效率**：降低人工审核成本

**技术价值**：
1. **加速模型训练**：优质的特征减少模型训练时间
2. **提升泛化能力**：良好的特征提升模型泛化性能
3. **增强可解释性**：业务含义明确的特征便于解释
4. **支持模型迭代**：结构化的特征体系便于模型优化

### 1.2 特征体系规划原则

#### 1.2.1 业务导向原则

**贴近业务场景**：
- 特征设计紧密结合具体业务场景
- 体现业务逻辑和风险模式
- 支持业务目标的达成

**可解释性**：
- 特征含义明确，业务人员能够理解
- 便于业务人员参与特征设计
- 支持模型决策的解释和分析

#### 1.2.2 技术可行原则

**计算可行性**：
- 特征计算复杂度可控
- 支持实时和离线计算需求
- 资源消耗在可接受范围内

**稳定性**：
- 特征值在时间上相对稳定
- 对数据噪声不敏感
- 具有良好的鲁棒性

#### 1.2.3 可扩展性原则

**模块化设计**：
- 特征分类清晰，便于管理
- 支持特征的独立开发和部署
- 便于特征的复用和共享

**版本管理**：
- 支持特征版本控制
- 便于特征的回溯和对比
- 支持A/B测试和灰度发布

### 1.3 特征体系架构

#### 1.3.1 分层架构

**原始数据层**：
- 各类原始业务数据
- 用户行为日志
- 第三方数据源

**特征计算层**：
- 基础特征计算
- 统计特征聚合
- 复杂特征生成

**特征存储层**：
- 特征数据存储
- 特征版本管理
- 特征服务接口

**特征应用层**：
- 模型训练使用
- 在线预测调用
- 特征分析和优化

#### 1.3.2 分类体系

**按数据类型分类**：
- 数值型特征
- 类别型特征
- 文本型特征
- 时间型特征

**按计算方式分类**：
- 原始特征
- 统计特征
- 组合特征
- 派生特征

**按时效性分类**：
- 实时特征
- 离线特征
- 历史特征
- 预测特征

## 二、基础特征设计

### 2.1 基础特征概述

基础特征是从原始数据中直接提取或简单处理得到的特征，是构建复杂特征的基础。在风控场景中，基础特征通常包括用户基本信息、设备信息、行为信息等。

#### 2.1.1 用户基础特征

**身份特征**：
- 用户ID、注册时间、注册渠道
- 实名认证状态、认证时间
- 用户等级、会员类型
- 账户状态、风险标签

**属性特征**：
- 年龄、性别、地域
- 职业、收入水平
- 教育背景、婚姻状况
- 社交关系、兴趣爱好

**行为特征**：
- 登录频率、登录时间分布
- 操作习惯、使用偏好
- 活跃度、留存率
- 消费能力、消费习惯

#### 2.1.2 设备基础特征

**设备信息**：
- 设备型号、操作系统
- 浏览器类型、版本信息
- 屏幕分辨率、设备指纹
- 网络环境、地理位置

**使用特征**：
- 设备使用频率、使用时长
- 应用安装情况、使用习惯
- 设备风险评分、异常行为
- 多账户使用、共享设备情况

#### 2.1.3 环境基础特征

**网络环境**：
- IP地址、地理位置
- 网络类型、运营商
- 代理使用、VPN检测
- 网络质量、延迟情况

**时间特征**：
- 操作时间、星期几
- 是否节假日、特殊时期
- 时区信息、季节性
- 时间间隔、频率特征

### 2.2 基础特征处理

#### 2.2.1 数据清洗

**缺失值处理**：
```python
def handle_missing_values(feature_data):
    """
    处理特征中的缺失值
    """
    processed_features = {}
    
    for feature_name, values in feature_data.items():
        if feature_name in ['age', 'income']:
            # 数值型特征用中位数填充
            median_value = np.nanmedian(values)
            processed_features[feature_name] = np.where(
                np.isnan(values), median_value, values
            )
        elif feature_name in ['gender', 'education']:
            # 类别型特征用众数填充
            mode_value = pd.Series(values).mode()[0] if len(pd.Series(values).mode()) > 0 else 'unknown'
            processed_features[feature_name] = np.where(
                pd.isnull(values), mode_value, values
            )
        else:
            # 其他特征用默认值填充
            processed_features[feature_name] = np.where(
                pd.isnull(values), 'unknown', values
            )
    
    return processed_features
```

**异常值处理**：
```python
def detect_and_handle_outliers(data, feature_name, method='iqr'):
    """
    检测和处理异常值
    """
    if method == 'iqr':
        Q1 = np.percentile(data, 25)
        Q3 = np.percentile(data, 75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        # 用边界值替换异常值
        cleaned_data = np.where(data < lower_bound, lower_bound, data)
        cleaned_data = np.where(cleaned_data > upper_bound, upper_bound, cleaned_data)
        
        return cleaned_data
    elif method == 'zscore':
        mean_val = np.mean(data)
        std_val = np.std(data)
        z_scores = np.abs((data - mean_val) / std_val)
        
        # 用均值替换3σ外的异常值
        cleaned_data = np.where(z_scores > 3, mean_val, data)
        
        return cleaned_data
```

#### 2.2.2 特征编码

**类别编码**：
```python
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
import pandas as pd

def encode_categorical_features(data, categorical_columns):
    """
    对类别型特征进行编码
    """
    encoded_data = data.copy()
    
    for column in categorical_columns:
        if column in data.columns:
            # 标签编码
            le = LabelEncoder()
            encoded_data[f'{column}_label'] = le.fit_transform(data[column].astype(str))
            
            # 独热编码（适用于类别数较少的特征）
            if data[column].nunique() <= 10:
                dummies = pd.get_dummies(data[column], prefix=column)
                encoded_data = pd.concat([encoded_data, dummies], axis=1)
    
    return encoded_data
```

**数值标准化**：
```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

def normalize_numerical_features(data, numerical_columns, method='standard'):
    """
    对数值型特征进行标准化
    """
    normalized_data = data.copy()
    
    for column in numerical_columns:
        if column in data.columns:
            if method == 'standard':
                scaler = StandardScaler()
                normalized_data[column] = scaler.fit_transform(data[[column]])
            elif method == 'minmax':
                scaler = MinMaxScaler()
                normalized_data[column] = scaler.fit_transform(data[[column]])
    
    return normalized_data
```

## 三、统计特征构建

### 3.1 统计特征概述

统计特征是通过对历史数据进行统计计算得到的特征，能够反映用户或实体的行为模式和趋势。在风控场景中，统计特征是识别异常行为的重要手段。

#### 3.1.1 时间窗口统计

**固定窗口统计**：
- 近1小时/24小时/7天的交易次数
- 近1小时/24小时/7天的交易金额
- 近1小时/24小时/7天的登录次数
- 近1小时/24小时/7天的操作次数

**滑动窗口统计**：
- 滑动7天的平均交易金额
- 滑动30天的登录频率变化
- 滑动90天的行为趋势

#### 3.1.2 分布统计特征

**集中趋势**：
- 均值、中位数、众数
- 加权平均值
- 截尾均值

**离散程度**：
- 方差、标准差
- 极差、四分位距
- 变异系数

**分布形状**：
- 偏度、峰度
- 分位数
- 分布拟合参数

### 3.2 实时统计特征

#### 3.2.1 流式计算框架

**基于Flink的实时统计**：
```java
// Flink流处理代码示例
public class RealTimeFeatureCalculator {
    
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        
        // 读取实时事件流
        DataStream<Event> eventStream = env.addSource(new KafkaSource<Event>());
        
        // 按用户ID分组，计算近1小时交易统计特征
        DataStream<UserFeature> userFeatures = eventStream
            .keyBy(event -> event.getUserId())
            .window(TumblingProcessingTimeWindows.of(Time.hours(1)))
            .aggregate(new TransactionAggregator())
            .map(aggregatedResult -> convertToUserFeature(aggregatedResult));
        
        // 输出特征结果
        userFeatures.addSink(new RedisSink<UserFeature>());
        
        env.execute("Real-time Feature Calculation");
    }
    
    // 交易聚合器
    public static class TransactionAggregator implements AggregateFunction<Event, TransactionAccumulator, AggregatedResult> {
        
        @Override
        public TransactionAccumulator createAccumulator() {
            return new TransactionAccumulator();
        }
        
        @Override
        public TransactionAccumulator add(Event event, TransactionAccumulator accumulator) {
            accumulator.count++;
            accumulator.totalAmount += event.getAmount();
            accumulator.timestamps.add(event.getTimestamp());
            return accumulator;
        }
        
        @Override
        public AggregatedResult getResult(TransactionAccumulator accumulator) {
            return new AggregatedResult(
                accumulator.count,
                accumulator.totalAmount,
                accumulator.totalAmount / accumulator.count, // 平均金额
                calculateStdDev(accumulator.amounts), // 金额标准差
                calculateFrequency(accumulator.timestamps) // 交易频率
            );
        }
        
        @Override
        public TransactionAccumulator merge(TransactionAccumulator a, TransactionAccumulator b) {
            a.count += b.count;
            a.totalAmount += b.totalAmount;
            a.timestamps.addAll(b.timestamps);
            return a;
        }
    }
}
```

#### 3.2.2 内存计算优化

**基于Redis的实时特征存储**：
```python
import redis
import json
from datetime import datetime, timedelta

class RealTimeFeatureStore:
    def __init__(self, redis_host='localhost', redis_port=6379):
        self.redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
    
    def update_user_transaction_stats(self, user_id, amount, timestamp):
        """
        更新用户交易统计特征
        """
        # 使用Redis的有序集合存储交易记录
        transaction_key = f"user:{user_id}:transactions"
        self.redis_client.zadd(transaction_key, {str(timestamp): amount})
        
        # 保留近24小时的交易记录
        cutoff_time = timestamp - 24 * 3600
        self.redis_client.zremrangebyscore(transaction_key, 0, cutoff_time)
        
        # 计算统计特征
        recent_transactions = self.redis_client.zrangebyscore(
            transaction_key, cutoff_time, timestamp, withscores=True
        )
        
        if recent_transactions:
            amounts = [amount for _, amount in recent_transactions]
            count = len(amounts)
            total_amount = sum(amounts)
            avg_amount = total_amount / count
            max_amount = max(amounts)
            min_amount = min(amounts)
            
            # 存储统计特征
            stats_key = f"user:{user_id}:stats:24h"
            stats_data = {
                'transaction_count': count,
                'total_amount': total_amount,
                'avg_amount': avg_amount,
                'max_amount': max_amount,
                'min_amount': min_amount,
                'update_time': timestamp
            }
            
            self.redis_client.hmset(stats_key, stats_data)
            self.redis_client.expire(stats_key, 25 * 3600)  # 过期时间25小时
    
    def get_user_stats(self, user_id, window='24h'):
        """
        获取用户统计特征
        """
        stats_key = f"user:{user_id}:stats:{window}"
        stats_data = self.redis_client.hgetall(stats_key)
        
        # 转换数据类型
        for key, value in stats_data.items():
            try:
                if '.' in value:
                    stats_data[key] = float(value)
                else:
                    stats_data[key] = int(value)
            except ValueError:
                pass  # 保持字符串类型
        
        return stats_data
```

### 3.3 离线统计特征

#### 3.3.1 批处理计算

**基于Spark的离线特征计算**：
```scala
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._

object OfflineFeatureCalculator {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("Offline Feature Calculation")
      .getOrCreate()
    
    import spark.implicits._
    
    // 读取历史交易数据
    val transactionDF = spark.read.parquet("hdfs://path/to/transaction/data")
    
    // 计算用户近30天的交易特征
    val userFeatures30d = transactionDF
      .filter($"timestamp" >= date_sub(current_date(), 30))
      .groupBy($"user_id")
      .agg(
        count("*").as("transaction_count_30d"),
        sum("amount").as("total_amount_30d"),
        avg("amount").as("avg_amount_30d"),
        stddev("amount").as("std_amount_30d"),
        min("amount").as("min_amount_30d"),
        max("amount").as("max_amount_30d"),
        countDistinct("merchant_id").as("distinct_merchants_30d"),
        approx_count_distinct("ip_address").as("distinct_ips_30d")
      )
    
    // 计算用户近7天的交易特征
    val userFeatures7d = transactionDF
      .filter($"timestamp" >= date_sub(current_date(), 7))
      .groupBy($"user_id")
      .agg(
        count("*").as("transaction_count_7d"),
        sum("amount").as("total_amount_7d"),
        avg("amount").as("avg_amount_7d")
      )
    
    // 关联不同时间窗口的特征
    val userFeatures = userFeatures30d
      .join(userFeatures7d, Seq("user_id"), "outer")
      .withColumn("count_ratio_7d_30d", $"transaction_count_7d" / $"transaction_count_30d")
      .withColumn("amount_ratio_7d_30d", $"total_amount_7d" / $"total_amount_30d")
    
    // 保存特征结果
    userFeatures.write
      .mode("overwrite")
      .parquet("hdfs://path/to/user/features")
    
    spark.stop()
  }
}
```

#### 3.3.2 特征回溯计算

**历史特征回溯**：
```python
import pandas as pd
from datetime import datetime, timedelta

def calculate_historical_features(transaction_data, target_date, window_days=30):
    """
    计算指定日期的历史特征
    """
    # 确定时间窗口
    end_date = target_date
    start_date = target_date - timedelta(days=window_days)
    
    # 筛选时间窗口内的数据
    window_data = transaction_data[
        (transaction_data['timestamp'] >= start_date) & 
        (transaction_data['timestamp'] < end_date)
    ]
    
    # 按用户分组计算特征
    user_features = window_data.groupby('user_id').agg({
        'amount': ['count', 'sum', 'mean', 'std', 'min', 'max'],
        'merchant_id': 'nunique',
        'ip_address': lambda x: x.nunique(dropna=True)
    }).reset_index()
    
    # 重命名列
    user_features.columns = [
        'user_id',
        'transaction_count',
        'total_amount',
        'avg_amount',
        'std_amount',
        'min_amount',
        'max_amount',
        'distinct_merchants',
        'distinct_ips'
    ]
    
    # 添加时间戳
    user_features['feature_date'] = target_date
    
    return user_features

def batch_historical_feature_calculation(transaction_data, start_date, end_date, interval_days=1):
    """
    批量计算历史特征
    """
    features_list = []
    current_date = start_date
    
    while current_date <= end_date:
        print(f"Calculating features for {current_date}")
        daily_features = calculate_historical_features(
            transaction_data, current_date, window_days=30
        )
        features_list.append(daily_features)
        current_date += timedelta(days=interval_days)
    
    # 合并所有特征
    all_features = pd.concat(features_list, ignore_index=True)
    
    return all_features
```

## 四、交叉特征构建

### 4.1 交叉特征概述

交叉特征是通过组合两个或多个基础特征生成的新特征，能够捕捉特征间的交互关系，在风控场景中特别有用。

#### 4.1.1 交叉特征的价值

**增强表达能力**：
- 捕捉特征间的非线性关系
- 发现隐藏的业务模式
- 提升模型的拟合能力

**业务解释性**：
- 体现业务逻辑和规则
- 便于业务人员理解和应用
- 支持策略的制定和优化

#### 4.1.2 交叉特征类型

**数值交叉**：
- 比值特征：A/B
- 差值特征：A-B
- 乘积特征：A×B
- 组合统计：mean(A,B), max(A,B)

**类别交叉**：
- 笛卡尔积：category_A × category_B
- 条件组合：if category_A == X then category_B
- 分组统计：groupby(category_A).agg(category_B)

### 4.2 手工交叉特征

#### 4.2.1 业务规则交叉

**基于业务逻辑的交叉特征**：
```python
def create_business_cross_features(user_data):
    """
    基于业务规则创建交叉特征
    """
    features = user_data.copy()
    
    # 年龄与消费能力交叉
    features['age_amount_ratio'] = features['total_amount_30d'] / (features['age'] + 1)
    
    # 登录频率与交易频率交叉
    features['login_transaction_ratio'] = (
        features['login_count_7d'] / (features['transaction_count_7d'] + 1)
    )
    
    # 设备使用与账户活跃度交叉
    features['device_active_ratio'] = (
        features['active_days_30d'] / (features['device_change_count_30d'] + 1)
    )
    
    # 地域与交易金额交叉
    features['region_amount_level'] = pd.cut(
        features['avg_amount_30d'], 
        bins=[0, 100, 500, 1000, float('inf')], 
        labels=['low', 'medium', 'high', 'very_high']
    )
    
    # 时间与行为交叉
    features['night_activity_ratio'] = (
        features['night_transactions_30d'] / (features['total_transactions_30d'] + 1)
    )
    
    return features
```

#### 4.2.2 统计交叉特征

**分组统计交叉**：
```python
def create_group_statistics_features(transaction_data):
    """
    创建分组统计交叉特征
    """
    # 按地域分组的交易金额统计
    region_stats = transaction_data.groupby('region').agg({
        'amount': ['mean', 'std', 'count']
    }).reset_index()
    
    region_stats.columns = ['region', 'region_avg_amount', 'region_std_amount', 'region_count']
    
    # 将分组统计特征合并到用户数据
    user_data_with_region_stats = transaction_data.merge(
        region_stats, on='region', how='left'
    )
    
    # 创建用户与地域平均水平的交叉特征
    user_data_with_region_stats['amount_vs_region_avg'] = (
        user_data_with_region_stats['amount'] / 
        user_data_with_region_stats['region_avg_amount']
    )
    
    # 按设备类型分组的登录频率统计
    device_stats = transaction_data.groupby('device_type').agg({
        'login_count': ['mean', 'std']
    }).reset_index()
    
    device_stats.columns = ['device_type', 'device_avg_login', 'device_std_login']
    
    # 合并设备统计特征
    user_data_with_cross_features = user_data_with_region_stats.merge(
        device_stats, on='device_type', how='left'
    )
    
    # 创建用户与设备平均水平的交叉特征
    user_data_with_cross_features['login_vs_device_avg'] = (
        user_data_with_cross_features['login_count'] / 
        user_data_with_cross_features['device_avg_login']
    )
    
    return user_data_with_cross_features
```

### 4.3 自动交叉特征

#### 4.3.1 基于决策树的特征交叉

**使用决策树发现交叉特征**：
```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import numpy as np

def discover_cross_features_with_tree(X, y, max_depth=3, min_samples_split=100):
    """
    使用决策树发现潜在的交叉特征
    """
    # 训练决策树
    tree_model = DecisionTreeClassifier(
        max_depth=max_depth,
        min_samples_split=min_samples_split,
        random_state=42
    )
    
    tree_model.fit(X, y)
    
    # 提取决策路径
    feature_names = X.columns.tolist()
    tree_rules = extract_tree_rules(tree_model, feature_names)
    
    # 生成交叉特征
    cross_features = []
    for rule in tree_rules:
        if len(rule['features']) > 1:  # 多特征组合
            cross_feature = {
                'name': '_x_'.join(rule['features']),
                'condition': rule['condition'],
                'features': rule['features'],
                'importance': rule['importance']
            }
            cross_features.append(cross_feature)
    
    return cross_features

def extract_tree_rules(tree_model, feature_names):
    """
    从决策树中提取规则
    """
    tree = tree_model.tree_
    rules = []
    
    def recurse(node_id, depth, condition_parts, features_used):
        if tree.feature[node_id] != -2:  # 非叶子节点
            feature_name = feature_names[tree.feature[node_id]]
            threshold = tree.threshold[node_id]
            
            # 左子树 (<=)
            left_condition = condition_parts + [f"{feature_name} <= {threshold:.2f}"]
            left_features = features_used + [feature_name]
            recurse(tree.children_left[node_id], depth + 1, left_condition, left_features)
            
            # 右子树 (>)
            right_condition = condition_parts + [f"{feature_name} > {threshold:.2f}"]
            right_features = features_used + [feature_name]
            recurse(tree.children_right[node_id], depth + 1, right_condition, right_features)
        else:  # 叶子节点
            # 计算叶子节点的重要性（样本数 * 基尼不纯度减少）
            importance = tree.n_node_samples[node_id] * (1 - tree.impurity[node_id])
            rules.append({
                'condition': ' AND '.join(condition_parts),
                'features': list(set(features_used)),
                'importance': importance
            })
    
    recurse(0, 0, [], [])
    return rules
```

#### 4.3.2 基于因子分解机的交叉特征

**因子分解机自动交叉**：
```python
from sklearn.linear_model import SGDRegressor
import numpy as np

class FactorizationMachine:
    """
    简化的因子分解机实现，用于发现特征交叉
    """
    def __init__(self, n_factors=10, n_epochs=10, learning_rate=0.01):
        self.n_factors = n_factors
        self.n_epochs = n_epochs
        self.learning_rate = learning_rate
        self.w = None
        self.V = None
    
    def fit(self, X, y):
        """
        训练因子分解机模型
        """
        n_samples, n_features = X.shape
        
        # 初始化参数
        self.w = np.random.normal(0, 0.1, n_features)
        self.V = np.random.normal(0, 0.1, (n_features, self.n_factors))
        
        # 随机梯度下降训练
        for epoch in range(self.n_epochs):
            for i in range(n_samples):
                # 预测
                prediction = self.predict_single(X[i])
                
                # 计算误差
                error = prediction - y[i]
                
                # 更新参数
                self.update_weights(X[i], error)
    
    def predict_single(self, x):
        """
        单样本预测
        """
        # 线性部分
        linear_term = np.dot(x, self.w)
        
        # 交叉部分
        interaction_term = 0
        for f in range(self.n_factors):
            sum_vx = np.dot(self.V[:, f], x)
            sum_v2x2 = np.dot(self.V[:, f] ** 2, x ** 2)
            interaction_term += 0.5 * (sum_vx ** 2 - sum_v2x2)
        
        return linear_term + interaction_term
    
    def update_weights(self, x, error):
        """
        更新权重
        """
        # 更新线性权重
        self.w -= self.learning_rate * error * x
        
        # 更新因子权重
        for f in range(self.n_factors):
            for j in range(len(x)):
                if x[j] != 0:
                    sum_vx = np.dot(self.V[:, f], x)
                    gradient = error * (x[j] * (sum_vx - self.V[j, f] * x[j]))
                    self.V[j, f] -= self.learning_rate * gradient
    
    def get_feature_interactions(self, feature_names, threshold=0.1):
        """
        获取重要的特征交互
        """
        interactions = []
        n_features = len(feature_names)
        
        # 计算特征交互强度
        for i in range(n_features):
            for j in range(i + 1, n_features):
                interaction_strength = np.sum(self.V[i] * self.V[j])
                if abs(interaction_strength) > threshold:
                    interactions.append({
                        'feature1': feature_names[i],
                        'feature2': feature_names[j],
                        'strength': interaction_strength,
                        'cross_feature_name': f"{feature_names[i]}_x_{feature_names[j]}"
                    })
        
        # 按强度排序
        interactions.sort(key=lambda x: abs(x['strength']), reverse=True)
        return interactions
```

## 五、图特征构建

### 5.1 图特征概述

图特征是基于用户或实体间的关系网络构建的特征，在风控场景中特别适用于识别团伙欺诈、关联风险等复杂模式。

#### 5.1.1 图特征的价值

**关系挖掘**：
- 发现隐藏的关联关系
- 识别团伙欺诈模式
- 构建风险传播路径

**风险传导**：
- 评估风险传导路径
- 预测风险扩散范围
- 制定针对性防控策略

#### 5.1.2 图特征类型

**节点特征**：
- 度中心性：节点的连接数
- 接近中心性：节点到其他节点的平均距离
- 中介中心性：节点在最短路径上的重要性

**社区特征**：
- 社区规模：社区内节点数量
- 社区内密度：社区内连接密度
- 社区间连接：社区间的连接情况

**路径特征**：
- 最短路径长度
- 路径数量
- 路径权重

### 5.2 图特征计算

#### 5.2.1 基础图特征

**中心性指标计算**：
```python
import networkx as nx
import pandas as pd

def calculate_graph_features(transaction_data, user_data):
    """
    计算图特征
    """
    # 构建关系图
    G = nx.Graph()
    
    # 添加用户节点
    for _, user in user_data.iterrows():
        G.add_node(user['user_id'], node_type='user')
    
    # 添加设备节点和边
    device_user_edges = []
    for _, transaction in transaction_data.iterrows():
        user_id = transaction['user_id']
        device_id = transaction['device_id']
        
        # 添加设备节点
        if not G.has_node(device_id):
            G.add_node(device_id, node_type='device')
        
        # 添加边
        G.add_edge(user_id, device_id, edge_type='use_device')
    
    # 计算中心性特征
    degree_centrality = nx.degree_centrality(G)
    betweenness_centrality = nx.betweenness_centrality(G)
    closeness_centrality = nx.closeness_centrality(G)
    
    # 构建特征DataFrame
    graph_features = pd.DataFrame({
        'node_id': list(degree_centrality.keys()),
        'degree_centrality': list(degree_centrality.values()),
        'betweenness_centrality': list(betweenness_centrality.values()),
        'closeness_centrality': list(closeness_centrality.values())
    })
    
    # 区分用户节点和设备节点
    user_graph_features = graph_features[
        graph_features['node_id'].isin(user_data['user_id'])
    ].copy()
    
    return user_graph_features

def calculate_community_features(transaction_data):
    """
    计算社区特征
    """
    # 构建用户-设备二分图
    G_bipartite = nx.Graph()
    
    # 添加用户节点
    users = transaction_data['user_id'].unique()
    for user in users:
        G_bipartite.add_node(user, bipartite=0)
    
    # 添加设备节点
    devices = transaction_data['device_id'].unique()
    for device in devices:
        G_bipartite.add_node(device, bipartite=1)
    
    # 添加边
    for _, transaction in transaction_data.iterrows():
        G_bipartite.add_edge(transaction['user_id'], transaction['device_id'])
    
    # 投影到用户网络
    user_nodes = {n for n, d in G_bipartite.nodes(data=True) if d['bipartite'] == 0}
    G_user_projection = nx.bipartite.weighted_projected_graph(G_bipartite, user_nodes)
    
    # 检测社区
    communities = nx.community.greedy_modularity_communities(G_user_projection)
    
    # 计算社区特征
    community_features = []
    for i, community in enumerate(communities):
        community_subgraph = G_user_projection.subgraph(community)
        
        feature = {
            'community_id': i,
            'community_size': len(community),
            'internal_edges': community_subgraph.number_of_edges(),
            'density': nx.density(community_subgraph),
            'avg_clustering': nx.average_clustering(community_subgraph)
        }
        
        community_features.append(feature)
    
    return pd.DataFrame(community_features)
```

#### 5.2.2 高级图特征

**PageRank和相似性特征**：
```python
def calculate_advanced_graph_features(G, user_data):
    """
    计算高级图特征
    """
    # PageRank
    pagerank_scores = nx.pagerank(G, alpha=0.85)
    
    # 聚类系数
    clustering_coefficients = nx.clustering(G)
    
    # 三角形计数
    triangles = nx.triangles(G)
    
    # 构建特征DataFrame
    advanced_features = pd.DataFrame({
        'node_id': list(pagerank_scores.keys()),
        'pagerank': list(pagerank_scores.values()),
        'clustering_coefficient': list(clustering_coefficients.values()),
        'triangle_count': list(triangles.values())
    })
    
    # 计算用户间的相似性
    user_nodes = [node for node in G.nodes() if node in user_data['user_id'].values]
    user_similarities = []
    
    for i, user1 in enumerate(user_nodes):
        for j, user2 in enumerate(user_nodes):
            if i < j:  # 避免重复计算
                # Jaccard相似性
                neighbors1 = set(G.neighbors(user1))
                neighbors2 = set(G.neighbors(user2))
                jaccard_sim = len(neighbors1 & neighbors2) / len(neighbors1 | neighbors2) if len(neighbors1 | neighbors2) > 0 else 0
                
                # 共同邻居数
                common_neighbors = len(neighbors1 & neighbors2)
                
                similarity_feature = {
                    'user1': user1,
                    'user2': user2,
                    'jaccard_similarity': jaccard_sim,
                    'common_neighbors': common_neighbors
                }
                
                user_similarities.append(similarity_feature)
    
    return advanced_features, pd.DataFrame(user_similarities)
```

### 5.3 实时图特征

#### 5.3.1 流式图计算

**基于图数据库的实时图特征**：
```python
from neo4j import GraphDatabase

class RealTimeGraphFeatureCalculator:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def update_graph(self, transaction_data):
        """
        更新图数据库中的关系
        """
        with self.driver.session() as session:
            for _, transaction in transaction_data.iterrows():
                session.write_transaction(
                    self._create_or_update_relationship,
                    transaction['user_id'],
                    transaction['device_id'],
                    transaction['timestamp']
                )
    
    @staticmethod
    def _create_or_update_relationship(tx, user_id, device_id, timestamp):
        """
        创建或更新用户-设备关系
        """
        query = (
            "MERGE (u:User {id: $user_id}) "
            "MERGE (d:Device {id: $device_id}) "
            "MERGE (u)-[r:USES_DEVICE]->(d) "
            "ON CREATE SET r.first_seen = $timestamp "
            "ON MATCH SET r.last_seen = $timestamp, r.transaction_count = coalesce(r.transaction_count, 0) + 1"
        )
        tx.run(query, user_id=user_id, device_id=device_id, timestamp=timestamp)
    
    def calculate_realtime_features(self, user_id):
        """
        计算实时图特征
        """
        with self.driver.session() as session:
            result = session.read_transaction(self._get_user_graph_features, user_id)
            return result
    
    @staticmethod
    def _get_user_graph_features(tx, user_id):
        """
        获取用户图特征
        """
        query = (
            "MATCH (u:User {id: $user_id}) "
            "OPTIONAL MATCH (u)-[r:USES_DEVICE]->(d:Device) "
            "RETURN "
            "count(DISTINCT d) as device_count, "
            "sum(r.transaction_count) as total_transactions, "
            "avg(r.transaction_count) as avg_device_transactions"
        )
        result = tx.run(query, user_id=user_id)
        return result.single()
```

#### 5.3.2 增量图特征更新

**增量图特征计算**：
```python
class IncrementalGraphFeatureUpdater:
    def __init__(self):
        self.graph_cache = {}
        self.feature_cache = {}
    
    def update_with_new_transactions(self, new_transactions):
        """
        基于新交易数据增量更新图特征
        """
        # 更新图结构
        self._update_graph_structure(new_transactions)
        
        # 增量更新受影响节点的特征
        affected_users = self._get_affected_users(new_transactions)
        self._update_user_features(affected_users)
    
    def _update_graph_structure(self, transactions):
        """
        更新图结构
        """
        for _, transaction in transactions.iterrows():
            user_id = transaction['user_id']
            device_id = transaction['device_id']
            
            # 更新用户-设备关系
            if user_id not in self.graph_cache:
                self.graph_cache[user_id] = {'devices': set(), 'transactions': 0}
            
            self.graph_cache[user_id]['devices'].add(device_id)
            self.graph_cache[user_id]['transactions'] += 1
            
            # 更新设备信息
            if device_id not in self.graph_cache:
                self.graph_cache[device_id] = {'users': set(), 'transactions': 0}
            
            self.graph_cache[device_id]['users'].add(user_id)
            self.graph_cache[device_id]['transactions'] += 1
    
    def _get_affected_users(self, new_transactions):
        """
        获取受新交易影响的用户
        """
        affected_users = set()
        
        # 直接涉及的用户
        affected_users.update(new_transactions['user_id'].unique())
        
        # 通过设备关联的用户
        for _, transaction in new_transactions.iterrows():
            device_id = transaction['device_id']
            if device_id in self.graph_cache:
                affected_users.update(self.graph_cache[device_id]['users'])
        
        return affected_users
    
    def _update_user_features(self, user_ids):
        """
        更新用户特征
        """
        for user_id in user_ids:
            if user_id in self.graph_cache:
                user_info = self.graph_cache[user_id]
                
                # 计算图特征
                device_count = len(user_info['devices'])
                total_transactions = user_info['transactions']
                avg_transactions_per_device = (
                    total_transactions / device_count if device_count > 0 else 0
                )
                
                # 更新特征缓存
                self.feature_cache[user_id] = {
                    'device_count': device_count,
                    'total_transactions': total_transactions,
                    'avg_transactions_per_device': avg_transactions_per_device,
                    'update_time': datetime.now()
                }
    
    def get_user_features(self, user_id):
        """
        获取用户图特征
        """
        return self.feature_cache.get(user_id, {})
```

## 六、文本特征构建

### 6.1 文本特征概述

文本特征是从非结构化的文本数据中提取的特征，在风控场景中常用于内容安全、用户画像、行为分析等方面。

#### 6.1.1 文本特征的应用场景

**内容风控**：
- 识别不良内容、敏感词汇
- 检测垃圾信息、虚假宣传
- 分析用户评论、反馈内容

**用户画像**：
- 从用户描述中提取兴趣标签
- 分析用户语言风格、情感倾向
- 构建用户社交特征

**行为分析**：
- 分析搜索关键词、查询意图
- 识别异常操作、恶意行为
- 构建用户偏好特征

#### 6.1.2 文本特征类型

**统计特征**：
- 文本长度、词数、句数
- 词频、TF-IDF
- 词汇多样性、重复度

**语义特征**：
- 情感分析得分
- 主题分布
- 语义相似度

**结构特征**：
- 标点符号使用
- 大写字母比例
- 特殊字符使用

### 6.2 文本预处理

#### 6.2.1 基础预处理

**文本清洗和标准化**：
```python
import re
import jieba
from collections import Counter
import numpy as np

class TextPreprocessor:
    def __init__(self, stop_words=None):
        self.stop_words = stop_words or set()
    
    def clean_text(self, text):
        """
        清洗文本
        """
        if not isinstance(text, str):
            return ""
        
        # 转换为小写
        text = text.lower()
        
        # 移除HTML标签
        text = re.sub(r'<[^>]+>', '', text)
        
        # 移除URL
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # 移除邮箱
        text = re.sub(r'\S+@\S+', '', text)
        
        # 移除特殊字符，保留中文、英文、数字
        text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9\s]', '', text)
        
        # 移除多余空格
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize(self, text):
        """
        分词
        """
        # 使用jieba进行中文分词
        tokens = jieba.lcut(text)
        
        # 移除停用词和空字符串
        tokens = [token for token in tokens if token.strip() and token not in self.stop_words]
        
        return tokens
    
    def preprocess(self, text):
        """
        完整的预处理流程
        """
        cleaned_text = self.clean_text(text)
        tokens = self.tokenize(cleaned_text)
        return tokens

# 使用示例
stop_words = {'的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'}
preprocessor = TextPreprocessor(stop_words)
```

#### 6.2.2 高级预处理

**词干提取和词形还原**：
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import jieba.posseg as pseg

class AdvancedTextProcessor:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
        self.lda_model = LatentDirichletAllocation(n_components=10, random_state=42)
    
    def extract_pos_features(self, text):
        """
        提取词性特征
        """
        words = pseg.cut(text)
        pos_counts = Counter()
        word_pos_pairs = []
        
        for word, flag in words:
            if len(word.strip()) > 0:
                pos_counts[flag] += 1
                word_pos_pairs.append((word, flag))
        
        return pos_counts, word_pos_pairs
    
    def calculate_text_statistics(self, text):
        """
        计算文本统计特征
        """
        # 基础统计
        char_count = len(text)
        word_count = len(text.split())
        
        # 中文分词统计
        chinese_words = jieba.lcut(text)
        chinese_word_count = len([w for w in chinese_words if len(w.strip()) > 0])
        
        # 句子统计
        sentences = re.split(r'[。！？!?]+', text)
        sentence_count = len([s for s in sentences if s.strip()])
        
        # 标点符号统计
        punctuation_count = len(re.findall(r'[，。！？；：""''（）【】《》]', text))
        
        # 数字和英文统计
        digit_count = len(re.findall(r'\d', text))
        english_count = len(re.findall(r'[a-zA-Z]', text))
        
        return {
            'char_count': char_count,
            'word_count': word_count,
            'chinese_word_count': chinese_word_count,
            'sentence_count': sentence_count,
            'punctuation_count': punctuation_count,
            'digit_count': digit_count,
            'english_count': english_count,
            'avg_sentence_length': char_count / sentence_count if sentence_count > 0 else 0,
            'punctuation_ratio': punctuation_count / char_count if char_count > 0 else 0
        }
    
    def extract_tfidf_features(self, texts):
        """
        提取TF-IDF特征
        """
        tfidf_matrix = self.tfidf_vectorizer.fit_transform(texts)
        feature_names = self.tfidf_vectorizer.get_feature_names_out()
        
        return tfidf_matrix, feature_names
    
    def extract_topic_features(self, texts):
        """
        提取主题特征
        """
        # 先提取TF-IDF特征
        tfidf_matrix, _ = self.extract_tfidf_features(texts)
        
        # 使用LDA提取主题分布
        topic_distribution = self.lda_model.fit_transform(tfidf_matrix)
        
        return topic_distribution
```

### 6.3 文本特征提取

#### 6.3.1 统计特征提取

**词频和TF-IDF特征**：
```python
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
import pandas as pd

class TextFeatureExtractor:
    def __init__(self, max_features=1000):
        self.max_features = max_features
        self.count_vectorizer = CountVectorizer(
            max_features=max_features,
            ngram_range=(1, 2),
            stop_words=None
        )
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=(1, 2),
            stop_words=None
        )
    
    def extract_count_features(self, texts):
        """
        提取词频特征
        """
        count_matrix = self.count_vectorizer.fit_transform(texts)
        feature_names = self.count_vectorizer.get_feature_names_out()
        
        # 转换为DataFrame
        count_df = pd.DataFrame(
            count_matrix.toarray(),
            columns=[f'count_{name}' for name in feature_names]
        )
        
        return count_df
    
    def extract_tfidf_features(self, texts):
        """
        提取TF-IDF特征
        """
        tfidf_matrix = self.tfidf_vectorizer.fit_transform(texts)
        feature_names = self.tfidf_vectorizer.get_feature_names_out()
        
        # 转换为DataFrame
        tfidf_df = pd.DataFrame(
            tfidf_matrix.toarray(),
            columns=[f'tfidf_{name}' for name in feature_names]
        )
        
        return tfidf_df
    
    def extract_statistical_features(self, texts):
        """
        提取统计特征
        """
        features = []
        
        for text in texts:
            # 文本长度特征
            char_length = len(text)
            word_length = len(text.split())
            chinese_word_length = len(jieba.lcut(text))
            
            # 词汇多样性
            unique_words = set(text.split())
            vocabulary_richness = len(unique_words) / word_length if word_length > 0 else 0
            
            # 重复度
            word_counts = Counter(text.split())
            repetition_rate = sum(count > 1 for count in word_counts.values()) / len(word_counts) if len(word_counts) > 0 else 0
            
            features.append({
                'char_length': char_length,
                'word_length': word_length,
                'chinese_word_length': chinese_word_length,
                'vocabulary_richness': vocabulary_richness,
                'repetition_rate': repetition_rate
            })
        
        return pd.DataFrame(features)

# 使用示例
def extract_text_features_for_risk_control(text_data):
    """
    为风控场景提取文本特征
    """
    extractor = TextFeatureExtractor(max_features=1000)
    
    # 提取各种特征
    count_features = extractor.extract_count_features(text_data)
    tfidf_features = extractor.extract_tfidf_features(text_data)
    statistical_features = extractor.extract_statistical_features(text_data)
    
    # 合并特征
    all_features = pd.concat([
        count_features,
        tfidf_features,
        statistical_features
    ], axis=1)
    
    return all_features
```

#### 6.3.2 语义特征提取

**情感分析和主题建模**：
```python
from textblob import TextBlob
import numpy as np

class SemanticFeatureExtractor:
    def __init__(self):
        # 可以加载预训练的情感词典或模型
        pass
    
    def extract_sentiment_features(self, texts):
        """
        提取情感特征
        """
        features = []
        
        for text in texts:
            try:
                # 使用TextBlob进行情感分析
                blob = TextBlob(text)
                polarity = blob.sentiment.polarity  # 情感极性 (-1到1)
                subjectivity = blob.sentiment.subjectivity  # 主观性 (0到1)
                
                # 自定义情感词统计
                positive_words = ['好', '棒', '赞', '优秀', '满意', '喜欢']
                negative_words = ['差', '坏', '垃圾', '讨厌', '不满', '失望']
                
                text_lower = text.lower()
                positive_count = sum(1 for word in positive_words if word in text_lower)
                negative_count = sum(1 for word in negative_words if word in text_lower)
                
                # 情感强度
                sentiment_intensity = (positive_count - negative_count) / len(text) if len(text) > 0 else 0
                
                features.append({
                    'sentiment_polarity': polarity,
                    'sentiment_subjectivity': subjectivity,
                    'positive_word_count': positive_count,
                    'negative_word_count': negative_count,
                    'sentiment_intensity': sentiment_intensity
                })
            except:
                # 处理异常情况
                features.append({
                    'sentiment_polarity': 0,
                    'sentiment_subjectivity': 0,
                    'positive_word_count': 0,
                    'negative_word_count': 0,
                    'sentiment_intensity': 0
                })
        
        return pd.DataFrame(features)
    
    def extract_keyword_features(self, texts, risk_keywords=None):
        """
        提取关键词特征
        """
        if risk_keywords is None:
            # 风控相关关键词
            risk_keywords = [
                '免费', '赚钱', '刷单', '兼职', '返利', '优惠', '折扣',
                '点击', '链接', '下载', '安装', '注册', '领取',
                '紧急', '限时', '最后', '仅此一次', '错过不再',
                '银行', '账户', '密码', '验证码', '安全码'
            ]
        
        features = []
        
        for text in texts:
            text_lower = text.lower()
            
            # 统计风险关键词出现次数
            risk_keyword_count = sum(1 for keyword in risk_keywords if keyword in text_lower)
            
            # 风险关键词密度
            risk_keyword_density = risk_keyword_count / len(text) if len(text) > 0 else 0
            
            # 关键词多样性
            found_keywords = [keyword for keyword in risk_keywords if keyword in text_lower]
            keyword_diversity = len(set(found_keywords)) / len(risk_keywords) if len(risk_keywords) > 0 else 0
            
            features.append({
                'risk_keyword_count': risk_keyword_count,
                'risk_keyword_density': risk_keyword_density,
                'keyword_diversity': keyword_diversity
            })
        
        return pd.DataFrame(features)

# 使用示例
def extract_semantic_features_for_risk_control(text_data):
    """
    为风控场景提取语义特征
    """
    semantic_extractor = SemanticFeatureExtractor()
    
    # 提取情感特征
    sentiment_features = semantic_extractor.extract_sentiment_features(text_data)
    
    # 提取关键词特征
    keyword_features = semantic_extractor.extract_keyword_features(text_data)
    
    # 合并特征
    all_semantic_features = pd.concat([
        sentiment_features,
        keyword_features
    ], axis=1)
    
    return all_semantic_features
```

## 结语

特征体系规划是企业级智能风控平台建设中的核心环节。通过合理设计基础特征、统计特征、交叉特征、图特征和文本特征，可以构建全面、高效的特征工程体系，为风控模型提供高质量的输入。

在实际实施过程中，需要根据具体的业务场景和技术条件，选择合适的特征类型和计算方法。同时，要建立完善的特征管理机制，包括特征的版本控制、质量监控、更新优化等，确保特征体系的持续演进和优化。

随着人工智能和大数据技术的不断发展，特征工程也在不断创新和演进。从传统的手工特征工程到自动化的特征发现，从单一模态特征到多模态融合特征，特征工程正朝着更加智能化、自动化的方向发展。

在下一章节中，我们将深入探讨实时特征计算技术，包括基于Flink/Redis的窗口聚合、特征计算优化、实时特征服务等内容，帮助读者构建高效的实时特征计算体系。