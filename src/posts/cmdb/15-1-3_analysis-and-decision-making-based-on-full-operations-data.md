---
title: 基于全域运维数据的分析与决策
date: 2025-09-07
categories: [CMDB]
tags: [cmdb, data-analysis, decision-making, ai-ops]
published: true
---

在数字化转型的浪潮中，企业IT环境变得越来越复杂，传统的运维模式已难以应对日益增长的挑战。随着运维数据中台的建设，企业能够汇聚来自各个系统的全域运维数据，这为基于数据的分析与决策提供了坚实的基础。本文将深入探讨如何利用全域运维数据进行深度分析，并基于分析结果做出科学的运维决策，最终实现智能化运维。

## 全域运维数据的价值

### 数据融合的意义

全域运维数据的汇聚不仅仅是数据量的增加，更重要的是通过数据融合产生的价值倍增效应：

1. **全景视图**：通过整合配置数据、监控数据、日志数据等，形成IT环境的全景视图
2. **关联分析**：发现不同数据源之间的关联关系，揭示隐藏的问题和机会
3. **预测能力**：基于历史数据和趋势分析，预测未来的系统状态和业务影响
4. **决策支持**：为运维决策提供数据支撑，提高决策的科学性和准确性

### 数据类型与来源

全域运维数据通常包括以下几类：

1. **配置数据**：来自CMDB的配置项信息及其关系
2. **监控数据**：来自监控系统的性能指标和健康状态
3. **日志数据**：来自应用和系统的日志信息
4. **业务数据**：与业务运营相关的数据，如交易量、用户行为等
5. **变更数据**：记录系统变更历史的数据
6. **安全数据**：来自安全系统的威胁情报和安全事件

## 数据分析方法与技术

### 1. 描述性分析

描述性分析是对历史数据的总结和描述，帮助我们了解"发生了什么"。

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns

class DescriptiveAnalyzer:
    def __init__(self, data_source):
        self.data_source = data_source
        self.data_cache = {}
    
    def get_system_performance_summary(self, time_range_days=30):
        """获取系统性能摘要"""
        # 获取监控数据
        metrics_data = self.data_source.get_monitoring_data(
            days=time_range_days
        )
        
        # 转换为DataFrame便于分析
        df = pd.DataFrame(metrics_data)
        
        # 计算基本统计信息
        summary = {
            'time_range': f"最近{time_range_days}天",
            'total_metrics': len(df),
            'cpu_utilization': {
                'avg': float(df['cpu_usage'].mean()),
                'max': float(df['cpu_usage'].max()),
                'min': float(df['cpu_usage'].min()),
                'std': float(df['cpu_usage'].std())
            },
            'memory_utilization': {
                'avg': float(df['memory_usage'].mean()),
                'max': float(df['memory_usage'].max()),
                'min': float(df['memory_usage'].min()),
                'std': float(df['memory_usage'].std())
            },
            'disk_io': {
                'avg': float(df['disk_io'].mean()),
                'max': float(df['disk_io'].max()),
                'min': float(df['disk_io'].min()),
                'std': float(df['disk_io'].std())
            },
            'network_traffic': {
                'avg': float(df['network_traffic'].mean()),
                'max': float(df['network_traffic'].max()),
                'min': float(df['network_traffic'].min()),
                'std': float(df['network_traffic'].std())
            }
        }
        
        return summary
    
    def analyze_resource_trends(self, time_range_days=30):
        """分析资源使用趋势"""
        # 获取监控数据
        metrics_data = self.data_source.get_monitoring_data(
            days=time_range_days
        )
        
        df = pd.DataFrame(metrics_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # 按天聚合数据
        daily_stats = df.groupby(df['timestamp'].dt.date).agg({
            'cpu_usage': ['mean', 'max', 'min'],
            'memory_usage': ['mean', 'max', 'min'],
            'disk_io': 'mean',
            'network_traffic': 'mean'
        }).round(2)
        
        # 生成趋势分析报告
        trends = {
            'cpu_trend': self._calculate_trend(df['cpu_usage']),
            'memory_trend': self._calculate_trend(df['memory_usage']),
            'disk_io_trend': self._calculate_trend(df['disk_io']),
            'network_trend': self._calculate_trend(df['network_traffic'])
        }
        
        return {
            'daily_statistics': daily_stats.to_dict(),
            'trends': trends
        }
    
    def _calculate_trend(self, series):
        """计算数据趋势"""
        if len(series) < 2:
            return 'insufficient_data'
        
        # 计算线性回归斜率
        x = np.arange(len(series))
        slope = np.polyfit(x, series, 1)[0]
        
        if slope > 0.5:
            return 'increasing_rapidly'
        elif slope > 0.1:
            return 'increasing'
        elif slope < -0.5:
            return 'decreasing_rapidly'
        elif slope < -0.1:
            return 'decreasing'
        else:
            return 'stable'
    
    def generate_resource_utilization_report(self, time_range_days=30):
        """生成资源利用率报告"""
        summary = self.get_system_performance_summary(time_range_days)
        trends = self.analyze_resource_trends(time_range_days)
        
        # 识别资源瓶颈
        bottlenecks = []
        
        cpu_avg = summary['cpu_utilization']['avg']
        if cpu_avg > 80:
            bottlenecks.append({
                'resource': 'CPU',
                'issue': '平均利用率过高',
                'severity': 'high',
                'recommendation': '考虑扩容或优化应用性能'
            })
        elif cpu_avg > 60:
            bottlenecks.append({
                'resource': 'CPU',
                'issue': '平均利用率偏高',
                'severity': 'medium',
                'recommendation': '监控趋势变化，准备扩容方案'
            })
        
        memory_avg = summary['memory_utilization']['avg']
        if memory_avg > 85:
            bottlenecks.append({
                'resource': '内存',
                'issue': '平均利用率过高',
                'severity': 'high',
                'recommendation': '检查内存泄漏，考虑扩容'
            })
        elif memory_avg > 70:
            bottlenecks.append({
                'resource': '内存',
                'issue': '平均利用率偏高',
                'severity': 'medium',
                'recommendation': '监控内存使用模式，优化应用'
            })
        
        return {
            'summary': summary,
            'trends': trends,
            'bottlenecks': bottlenecks
        }

# 模拟数据源
class MockDataSource:
    def get_monitoring_data(self, days=30):
        """生成模拟监控数据"""
        data = []
        base_time = datetime.now() - timedelta(days=days)
        
        for i in range(days * 24):  # 每小时一个数据点
            timestamp = base_time + timedelta(hours=i)
            # 模拟逐渐增长的资源使用率
            trend_factor = i / (days * 24)
            
            data.append({
                'timestamp': timestamp.isoformat(),
                'cpu_usage': min(95, 30 + trend_factor * 40 + np.random.normal(0, 5)),
                'memory_usage': min(95, 40 + trend_factor * 30 + np.random.normal(0, 5)),
                'disk_io': max(0, 100 + trend_factor * 50 + np.random.normal(0, 20)),
                'network_traffic': max(0, 50 + trend_factor * 30 + np.random.normal(0, 15))
            })
        
        return data

# 使用示例
data_source = MockDataSource()
analyzer = DescriptiveAnalyzer(data_source)

# 生成资源利用率报告
report = analyzer.generate_resource_utilization_report(30)
print("资源利用率报告:")
print(f"CPU平均利用率: {report['summary']['cpu_utilization']['avg']:.2f}%")
print(f"内存平均利用率: {report['summary']['memory_utilization']['avg']:.2f}%")
print(f"发现的瓶颈: {len(report['bottlenecks'])}个")

for bottleneck in report['bottlenecks']:
    print(f"- {bottleneck['resource']}: {bottleneck['issue']} ({bottleneck['severity']})")
```

### 2. 诊断性分析

诊断性分析旨在找出"为什么会发生"，通过深入分析找出问题的根本原因。

```python
class DiagnosticAnalyzer:
    def __init__(self, data_source):
        self.data_source = data_source
    
    def analyze_performance_degradation(self, start_time, end_time):
        """分析性能下降原因"""
        # 获取时间段内的数据
        metrics_data = self.data_source.get_monitoring_data_by_time_range(
            start_time, end_time
        )
        log_data = self.data_source.get_log_data_by_time_range(
            start_time, end_time
        )
        config_changes = self.data_source.get_configuration_changes_by_time_range(
            start_time, end_time
        )
        
        # 分析指标变化
        metric_analysis = self._analyze_metric_changes(metrics_data)
        
        # 分析日志异常
        log_analysis = self._analyze_log_patterns(log_data)
        
        # 分析配置变更影响
        config_analysis = self._analyze_configuration_impact(config_changes, metrics_data)
        
        # 综合分析
        root_causes = self._identify_root_causes(
            metric_analysis, log_analysis, config_analysis
        )
        
        return {
            'metric_analysis': metric_analysis,
            'log_analysis': log_analysis,
            'config_analysis': config_analysis,
            'root_causes': root_causes
        }
    
    def _analyze_metric_changes(self, metrics_data):
        """分析指标变化"""
        if len(metrics_data) < 2:
            return {'status': 'insufficient_data'}
        
        df = pd.DataFrame(metrics_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # 计算变化率
        df = df.sort_values('timestamp')
        df['cpu_change_rate'] = df['cpu_usage'].pct_change()
        df['memory_change_rate'] = df['memory_usage'].pct_change()
        
        # 识别异常点
        cpu_anomalies = self._detect_anomalies(df['cpu_usage'])
        memory_anomalies = self._detect_anomalies(df['memory_usage'])
        
        return {
            'cpu_anomalies': cpu_anomalies,
            'memory_anomalies': memory_anomalies,
            'trend_analysis': self._analyze_trends(df)
        }
    
    def _detect_anomalies(self, series, threshold=2):
        """检测异常值"""
        mean = series.mean()
        std = series.std()
        
        anomalies = []
        for i, value in enumerate(series):
            if abs(value - mean) > threshold * std:
                anomalies.append({
                    'index': i,
                    'value': value,
                    'z_score': abs(value - mean) / std if std > 0 else 0
                })
        
        return anomalies
    
    def _analyze_log_patterns(self, log_data):
        """分析日志模式"""
        error_logs = [log for log in log_data if log.get('level') == 'ERROR']
        warning_logs = [log for log in log_data if log.get('level') == 'WARNING']
        
        # 统计错误类型
        error_types = {}
        for log in error_logs:
            error_type = log.get('error_type', 'unknown')
            error_types[error_type] = error_types.get(error_type, 0) + 1
        
        # 统计警告类型
        warning_types = {}
        for log in warning_logs:
            warning_type = log.get('warning_type', 'unknown')
            warning_types[warning_type] = warning_types.get(warning_type, 0) + 1
        
        return {
            'error_count': len(error_logs),
            'warning_count': len(warning_logs),
            'error_types': error_types,
            'warning_types': warning_types,
            'spike_detection': self._detect_log_spikes(log_data)
        }
    
    def _detect_log_spikes(self, log_data):
        """检测日志激增"""
        df = pd.DataFrame(log_data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # 按小时聚合日志数量
        hourly_counts = df.groupby(df['timestamp'].dt.hour).size()
        
        # 计算平均值和标准差
        mean_count = hourly_counts.mean()
        std_count = hourly_counts.std()
        
        # 识别激增时段
        spikes = []
        for hour, count in hourly_counts.items():
            if count > mean_count + 2 * std_count:
                spikes.append({
                    'hour': hour,
                    'count': count,
                    'deviation': (count - mean_count) / std_count
                })
        
        return spikes
    
    def _analyze_configuration_impact(self, config_changes, metrics_data):
        """分析配置变更影响"""
        if not config_changes or not metrics_data:
            return {'status': 'no_data'}
        
        # 将配置变更与性能指标关联
        impact_analysis = []
        
        for change in config_changes:
            change_time = change['timestamp']
            # 查找变更前后性能指标的变化
            before_metrics, after_metrics = self._split_metrics_by_time(
                metrics_data, change_time
            )
            
            if before_metrics and after_metrics:
                impact = self._calculate_impact(before_metrics, after_metrics)
                impact_analysis.append({
                    'change': change,
                    'impact': impact
                })
        
        return {
            'changes_count': len(config_changes),
            'impact_analysis': impact_analysis
        }
    
    def _split_metrics_by_time(self, metrics_data, split_time):
        """按时间分割指标数据"""
        before = [m for m in metrics_data if m['timestamp'] < split_time]
        after = [m for m in metrics_data if m['timestamp'] >= split_time]
        return before[-10:] if before else [], after[:10] if after else []
    
    def _calculate_impact(self, before_metrics, after_metrics):
        """计算变更影响"""
        before_avg_cpu = np.mean([m['cpu_usage'] for m in before_metrics])
        after_avg_cpu = np.mean([m['cpu_usage'] for m in after_metrics])
        
        before_avg_memory = np.mean([m['memory_usage'] for m in before_metrics])
        after_avg_memory = np.mean([m['memory_usage'] for m in after_metrics])
        
        return {
            'cpu_impact': after_avg_cpu - before_avg_cpu,
            'memory_impact': after_avg_memory - before_avg_memory,
            'cpu_impact_percentage': ((after_avg_cpu - before_avg_cpu) / before_avg_cpu * 100) if before_avg_cpu > 0 else 0,
            'memory_impact_percentage': ((after_avg_memory - before_avg_memory) / before_avg_memory * 100) if before_avg_memory > 0 else 0
        }
    
    def _analyze_trends(self, df):
        """分析趋势"""
        trends = {}
        
        for column in ['cpu_usage', 'memory_usage']:
            if column in df.columns:
                # 计算移动平均
                df[f'{column}_ma'] = df[column].rolling(window=5).mean()
                
                # 计算趋势
                x = np.arange(len(df))
                slope = np.polyfit(x, df[column], 1)[0]
                
                trends[column] = {
                    'slope': slope,
                    'direction': 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable'
                }
        
        return trends
    
    def _identify_root_causes(self, metric_analysis, log_analysis, config_analysis):
        """识别根本原因"""
        root_causes = []
        
        # 基于指标异常识别原因
        if 'cpu_anomalies' in metric_analysis and metric_analysis['cpu_anomalies']:
            root_causes.append({
                'type': 'performance',
                'cause': 'CPU使用率异常',
                'evidence': f"检测到{len(metric_analysis['cpu_anomalies'])}个CPU异常点",
                'confidence': 0.8
            })
        
        # 基于日志分析识别原因
        if log_analysis['error_count'] > 100:
            root_causes.append({
                'type': 'application',
                'cause': '应用程序错误激增',
                'evidence': f"错误日志数量: {log_analysis['error_count']}",
                'confidence': 0.7
            })
        
        # 基于配置变更影响识别原因
        if 'impact_analysis' in config_analysis:
            significant_impacts = [
                impact for impact in config_analysis['impact_analysis']
                if abs(impact['impact'].get('cpu_impact_percentage', 0)) > 10
            ]
            
            if significant_impacts:
                root_causes.append({
                    'type': 'configuration',
                    'cause': '配置变更导致性能影响',
                    'evidence': f"检测到{len(significant_impacts)}个有显著影响的配置变更",
                    'confidence': 0.9
                })
        
        return root_causes

# 扩展MockDataSource以支持更多数据类型
class ExtendedMockDataSource(MockDataSource):
    def get_monitoring_data_by_time_range(self, start_time, end_time):
        """获取指定时间范围的监控数据"""
        # 简化实现，实际应用中需要根据时间范围过滤数据
        return self.get_monitoring_data(1)
    
    def get_log_data_by_time_range(self, start_time, end_time):
        """获取指定时间范围的日志数据"""
        # 生成模拟日志数据
        logs = []
        current_time = start_time
        
        while current_time < end_time:
            # 随机生成日志
            log_level = np.random.choice(['INFO', 'WARNING', 'ERROR'], p=[0.7, 0.2, 0.1])
            
            if log_level == 'ERROR':
                error_type = np.random.choice(['database', 'network', 'application'])
                logs.append({
                    'timestamp': current_time.isoformat(),
                    'level': log_level,
                    'message': f'{error_type} error occurred',
                    'error_type': error_type
                })
            elif log_level == 'WARNING':
                warning_type = np.random.choice(['disk', 'memory', 'cpu'])
                logs.append({
                    'timestamp': current_time.isoformat(),
                    'level': log_level,
                    'message': f'{warning_type} usage high',
                    'warning_type': warning_type
                })
            else:
                logs.append({
                    'timestamp': current_time.isoformat(),
                    'level': log_level,
                    'message': 'Normal operation'
                })
            
            # 随机增加时间间隔
            current_time += timedelta(minutes=np.random.randint(1, 60))
        
        return logs
    
    def get_configuration_changes_by_time_range(self, start_time, end_time):
        """获取指定时间范围的配置变更数据"""
        # 生成模拟配置变更数据
        changes = []
        
        # 在时间范围内随机生成几个配置变更
        change_times = [
            start_time + (end_time - start_time) * (i / 4)
            for i in range(1, 4)
        ]
        
        for change_time in change_times:
            changes.append({
                'timestamp': change_time.isoformat(),
                'change_type': np.random.choice(['update', 'delete', 'create']),
                'resource_type': np.random.choice(['server', 'database', 'application']),
                'resource_id': f'resource_{np.random.randint(1, 100)}',
                'user': np.random.choice(['admin', 'operator', 'developer'])
            })
        
        return changes

# 使用示例
data_source = ExtendedMockDataSource()
diagnostic_analyzer = DiagnosticAnalyzer(data_source)

# 分析性能下降原因
start_time = datetime.now() - timedelta(days=1)
end_time = datetime.now()

analysis_result = diagnostic_analyzer.analyze_performance_degradation(
    start_time, end_time
)

print("性能下降诊断分析结果:")
print(f"根本原因数量: {len(analysis_result['root_causes'])}")

for cause in analysis_result['root_causes']:
    print(f"- {cause['cause']} (置信度: {cause['confidence']})")
    print(f"  证据: {cause['evidence']}")
```

### 3. 预测性分析

预测性分析通过历史数据预测未来趋势，帮助我们了解"可能会发生什么"。

```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib

class PredictiveAnalyzer:
    def __init__(self, data_source):
        self.data_source = data_source
        self.models = {}
    
    def predict_resource_utilization(self, resource_type, hours_ahead=24):
        """预测资源利用率"""
        # 获取历史数据
        historical_data = self.data_source.get_monitoring_data(days=60)
        
        # 准备特征数据
        features, targets = self._prepare_features_and_targets(
            historical_data, resource_type
        )
        
        # 训练模型
        model = self._train_model(features, targets, resource_type)
        
        # 预测未来值
        predictions = self._make_predictions(model, hours_ahead)
        
        return {
            'resource_type': resource_type,
            'predictions': predictions,
            'model_accuracy': self._evaluate_model(model, features, targets)
        }
    
    def _prepare_features_and_targets(self, data, resource_type):
        """准备特征和目标变量"""
        df = pd.DataFrame(data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # 提取时间特征
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['day_of_month'] = df['timestamp'].dt.day
        
        # 创建滞后特征
        target_column = f'{resource_type}_usage'
        df[f'{target_column}_lag1'] = df[target_column].shift(1)
        df[f'{target_column}_lag24'] = df[target_column].shift(24)
        df[f'{target_column}_rolling_mean'] = df[target_column].rolling(window=24).mean()
        
        # 删除包含NaN的行
        df = df.dropna()
        
        # 特征列
        feature_columns = [
            'hour', 'day_of_week', 'day_of_month',
            f'{target_column}_lag1', f'{target_column}_lag24',
            f'{target_column}_rolling_mean'
        ]
        
        features = df[feature_columns]
        targets = df[target_column]
        
        return features, targets
    
    def _train_model(self, features, targets, resource_type):
        """训练预测模型"""
        # 检查是否已有训练好的模型
        if resource_type in self.models:
            return self.models[resource_type]
        
        # 分割训练和测试数据
        X_train, X_test, y_train, y_test = train_test_split(
            features, targets, test_size=0.2, random_state=42
        )
        
        # 训练随机森林模型
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # 保存模型
        self.models[resource_type] = model
        
        return model
    
    def _make_predictions(self, model, hours_ahead):
        """进行预测"""
        # 获取最新的数据点作为预测起点
        latest_data = self.data_source.get_latest_monitoring_data()
        
        predictions = []
        current_time = datetime.now()
        
        for i in range(hours_ahead):
            # 准备特征
            features = self._prepare_prediction_features(latest_data, i)
            
            # 进行预测
            prediction = model.predict([features])[0]
            
            # 确保预测值在合理范围内
            prediction = max(0, min(100, prediction))
            
            predictions.append({
                'timestamp': current_time + timedelta(hours=i+1),
                'predicted_value': prediction
            })
            
            # 更新latest_data用于下一个预测点
            latest_data = self._update_latest_data(latest_data, prediction)
        
        return predictions
    
    def _prepare_prediction_features(self, latest_data, hour_offset):
        """准备预测特征"""
        current_time = datetime.now() + timedelta(hours=hour_offset)
        
        # 时间特征
        hour = current_time.hour
        day_of_week = current_time.weekday()
        day_of_month = current_time.day
        
        # 基于最新数据的特征
        cpu_usage = latest_data.get('cpu_usage', 50)
        memory_usage = latest_data.get('memory_usage', 50)
        
        # 简化的特征准备
        features = [
            hour, day_of_week, day_of_month,
            cpu_usage, cpu_usage, cpu_usage  # 简化处理，实际应用中需要更复杂的逻辑
        ]
        
        return features
    
    def _update_latest_data(self, latest_data, prediction):
        """更新最新数据"""
        updated_data = latest_data.copy()
        updated_data['cpu_usage'] = prediction  # 简化处理
        return updated_data
    
    def _evaluate_model(self, model, features, targets):
        """评估模型准确性"""
        predictions = model.predict(features)
        
        mse = mean_squared_error(targets, predictions)
        mae = mean_absolute_error(targets, predictions)
        rmse = np.sqrt(mse)
        
        # 计算R²分数
        ss_res = np.sum((targets - predictions) ** 2)
        ss_tot = np.sum((targets - np.mean(targets)) ** 2)
        r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            'mse': mse,
            'mae': mae,
            'rmse': rmse,
            'r2': r2
        }
    
    def predict_failure_risk(self, systems, time_window_hours=24):
        """预测系统故障风险"""
        risk_assessments = []
        
        for system in systems:
            # 获取系统相关数据
            system_data = self.data_source.get_system_data(system)
            
            # 计算风险指标
            risk_score = self._calculate_failure_risk_score(system_data)
            
            # 预测未来风险趋势
            risk_trend = self._predict_risk_trend(system_data, time_window_hours)
            
            risk_assessments.append({
                'system': system,
                'current_risk_score': risk_score,
                'risk_trend': risk_trend,
                'recommendations': self._generate_risk_recommendations(risk_score)
            })
        
        return risk_assessments
    
    def _calculate_failure_risk_score(self, system_data):
        """计算故障风险评分"""
        # 基于多个指标计算综合风险评分
        cpu_usage = system_data.get('cpu_usage', 50)
        memory_usage = system_data.get('memory_usage', 50)
        disk_usage = system_data.get('disk_usage', 50)
        error_rate = system_data.get('error_rate', 0)
        
        # 加权计算风险评分
        risk_score = (
            cpu_usage * 0.3 +
            memory_usage * 0.25 +
            disk_usage * 0.25 +
            error_rate * 10 * 0.2
        )
        
        # 确保评分在0-100范围内
        return max(0, min(100, risk_score))
    
    def _predict_risk_trend(self, system_data, time_window_hours):
        """预测风险趋势"""
        # 简化实现，实际应用中需要更复杂的预测模型
        current_risk = self._calculate_failure_risk_score(system_data)
        
        # 基于历史趋势预测
        historical_risks = system_data.get('historical_risks', [])
        if len(historical_risks) > 1:
            trend = np.polyfit(range(len(historical_risks)), historical_risks, 1)[0]
            if trend > 2:
                return 'increasing_rapidly'
            elif trend > 0.5:
                return 'increasing'
            elif trend < -2:
                return 'decreasing_rapidly'
            elif trend < -0.5:
                return 'decreasing'
            else:
                return 'stable'
        else:
            return 'insufficient_data'
    
    def _generate_risk_recommendations(self, risk_score):
        """生成风险建议"""
        if risk_score > 80:
            return [
                '立即检查系统资源使用情况',
                '准备应急预案',
                '考虑扩容资源',
                '加强监控频率'
            ]
        elif risk_score > 60:
            return [
                '密切监控系统状态',
                '准备资源扩容方案',
                '检查应用性能'
            ]
        elif risk_score > 40:
            return [
                '保持常规监控',
                '优化资源配置'
            ]
        else:
            return [
                '继续保持当前运维策略'
            ]

# 扩展MockDataSource以支持预测分析
class PredictiveMockDataSource(ExtendedMockDataSource):
    def get_latest_monitoring_data(self):
        """获取最新的监控数据"""
        # 生成最新的监控数据
        return {
            'timestamp': datetime.now().isoformat(),
            'cpu_usage': np.random.uniform(30, 80),
            'memory_usage': np.random.uniform(40, 70),
            'disk_io': np.random.uniform(50, 200),
            'network_traffic': np.random.uniform(30, 150)
        }
    
    def get_system_data(self, system):
        """获取系统数据"""
        # 生成模拟系统数据
        return {
            'cpu_usage': np.random.uniform(30, 90),
            'memory_usage': np.random.uniform(40, 85),
            'disk_usage': np.random.uniform(20, 95),
            'error_rate': np.random.uniform(0, 5),
            'historical_risks': [np.random.uniform(20, 80) for _ in range(10)]
        }

# 使用示例
data_source = PredictiveMockDataSource()
predictive_analyzer = PredictiveAnalyzer(data_source)

# 预测CPU利用率
cpu_prediction = predictive_analyzer.predict_resource_utilization('cpu', 24)
print("CPU利用率预测:")
print(f"预测时间点数量: {len(cpu_prediction['predictions'])}")
print(f"模型R²分数: {cpu_prediction['model_accuracy']['r2']:.3f}")

for pred in cpu_prediction['predictions'][:5]:  # 显示前5个预测点
    print(f"- {pred['timestamp'].strftime('%Y-%m-%d %H:%M')}: {pred['predicted_value']:.2f}%")

# 预测系统故障风险
systems = ['web-server-01', 'database-01', 'cache-01']
risk_assessments = predictive_analyzer.predict_failure_risk(systems)

print("\n系统故障风险评估:")
for assessment in risk_assessments:
    print(f"系统: {assessment['system']}")
    print(f"当前风险评分: {assessment['current_risk_score']:.2f}")
    print(f"风险趋势: {assessment['risk_trend']}")
    print("建议措施:")
    for rec in assessment['recommendations']:
        print(f"  - {rec}")
```

### 4. 规范性分析

规范性分析不仅预测可能发生的情况，还提供"应该做什么"的建议。

```python
class PrescriptiveAnalyzer:
    def __init__(self, data_source, action_executor):
        self.data_source = data_source
        self.action_executor = action_executor
        self.optimization_rules = []
    
    def register_optimization_rule(self, rule):
        """注册优化规则"""
        self.optimization_rules.append(rule)
    
    def generate_optimization_recommendations(self, systems):
        """生成优化建议"""
        recommendations = []
        
        for system in systems:
            # 获取系统状态
            system_state = self.data_source.get_system_state(system)
            
            # 应用优化规则
            system_recommendations = []
            for rule in self.optimization_rules:
                if rule.is_applicable(system_state):
                    recommendation = rule.generate_recommendation(system_state)
                    system_recommendations.append(recommendation)
            
            if system_recommendations:
                recommendations.append({
                    'system': system,
                    'recommendations': system_recommendations,
                    'priority': self._calculate_priority(system_recommendations)
                })
        
        # 按优先级排序
        recommendations.sort(key=lambda x: x['priority'], reverse=True)
        
        return recommendations
    
    def _calculate_priority(self, recommendations):
        """计算建议优先级"""
        # 基于紧急程度和影响范围计算优先级
        total_priority = 0
        for rec in recommendations:
            urgency = rec.get('urgency', 1)  # 1-5级
            impact = rec.get('impact', 1)    # 1-5级
            total_priority += urgency * impact
        return total_priority
    
    def execute_automated_actions(self, recommendations, auto_execute=False):
        """执行自动化操作"""
        executed_actions = []
        
        for system_rec in recommendations:
            system = system_rec['system']
            for recommendation in system_rec['recommendations']:
                action = recommendation.get('action')
                if action:
                    # 检查是否应该自动执行
                    if auto_execute or recommendation.get('auto_execute', False):
                        try:
                            result = self.action_executor.execute(action, system)
                            executed_actions.append({
                                'system': system,
                                'action': action,
                                'result': result,
                                'status': 'success'
                            })
                        except Exception as e:
                            executed_actions.append({
                                'system': system,
                                'action': action,
                                'error': str(e),
                                'status': 'failed'
                            })
                    else:
                        executed_actions.append({
                            'system': system,
                            'action': action,
                            'status': 'pending_approval'
                        })
        
        return executed_actions
    
    def optimize_resource_allocation(self, resource_pools):
        """优化资源分配"""
        optimization_plan = []
        
        for pool_name, pool_config in resource_pools.items():
            # 分析资源池使用情况
            usage_analysis = self._analyze_resource_pool_usage(pool_name, pool_config)
            
            # 生成优化建议
            if usage_analysis['under_utilized']:
                optimization_plan.append({
                    'pool': pool_name,
                    'action': 'consolidate_resources',
                    'resources_to_consolidate': usage_analysis['under_utilised_resources'],
                    'expected_savings': usage_analysis['potential_savings']
                })
            elif usage_analysis['over_utilized']:
                optimization_plan.append({
                    'pool': pool_name,
                    'action': 'scale_up',
                    'resources_needed': usage_analysis['additional_resources_needed'],
                    'urgency': usage_analysis['scaling_urgency']
                })
        
        return optimization_plan
    
    def _analyze_resource_pool_usage(self, pool_name, pool_config):
        """分析资源池使用情况"""
        # 获取资源池数据
        pool_data = self.data_source.get_resource_pool_data(pool_name)
        
        # 计算使用率
        total_resources = pool_config.get('total_resources', 100)
        used_resources = len(pool_data.get('allocated_resources', []))
        utilization_rate = used_resources / total_resources if total_resources > 0 else 0
        
        # 识别低利用率资源
        under_utilized_resources = []
        potential_savings = 0
        
        for resource in pool_data.get('allocated_resources', []):
            usage = resource.get('current_usage', 0)
            if usage < 0.3:  # 使用率低于30%认为是低利用率
                under_utilized_resources.append(resource)
                potential_savings += resource.get('resource_value', 0)
        
        # 检查是否过载
        over_utilized = utilization_rate > 0.8
        additional_resources_needed = 0
        scaling_urgency = 'low'
        
        if over_utilized:
            additional_resources_needed = int((utilization_rate - 0.8) * total_resources)
            if utilization_rate > 0.95:
                scaling_urgency = 'critical'
            elif utilization_rate > 0.9:
                scaling_urgency = 'high'
            else:
                scaling_urgency = 'medium'
        
        return {
            'utilization_rate': utilization_rate,
            'under_utilized': len(under_utilized_resources) > 0,
            'under_utilised_resources': under_utilized_resources,
            'potential_savings': potential_savings,
            'over_utilized': over_utilized,
            'additional_resources_needed': additional_resources_needed,
            'scaling_urgency': scaling_urgency
        }
    
    def generate_capacity_planning_report(self, time_horizon_days=90):
        """生成容量规划报告"""
        # 获取历史增长趋势
        growth_trends = self.data_source.get_resource_growth_trends()
        
        # 预测未来需求
        forecasts = self._forecast_resource_needs(growth_trends, time_horizon_days)
        
        # 生成规划建议
        recommendations = self._generate_capacity_recommendations(forecasts)
        
        return {
            'time_horizon': f"未来{time_horizon_days}天",
            'growth_trends': growth_trends,
            'forecasts': forecasts,
            'recommendations': recommendations
        }
    
    def _forecast_resource_needs(self, growth_trends, time_horizon_days):
        """预测资源需求"""
        forecasts = {}
        
        for resource_type, trend_data in growth_trends.items():
            current_usage = trend_data.get('current_usage', 0)
            growth_rate = trend_data.get('growth_rate', 0)
            
            # 简单线性预测
            forecasted_usage = current_usage * (1 + growth_rate * time_horizon_days / 30)
            
            forecasts[resource_type] = {
                'current_usage': current_usage,
                'forecasted_usage': forecasted_usage,
                'required_capacity': forecasted_usage * 1.2,  # 预留20%缓冲
                'growth_rate': growth_rate
            }
        
        return forecasts
    
    def _generate_capacity_recommendations(self, forecasts):
        """生成容量建议"""
        recommendations = []
        
        for resource_type, forecast in forecasts.items():
            current = forecast['current_usage']
            forecasted = forecast['forecasted_usage']
            required = forecast['required_capacity']
            
            if forecasted > current * 1.5:  # 预测需求增长超过50%
                recommendations.append({
                    'resource_type': resource_type,
                    'action': 'plan_capacity_expansion',
                    'current_capacity': current,
                    'required_capacity': required,
                    'expansion_needed': required - current,
                    'urgency': 'high' if forecasted > current * 2 else 'medium'
                })
            elif forecasted > current * 1.2:  # 预测需求增长超过20%
                recommendations.append({
                    'resource_type': resource_type,
                    'action': 'monitor_growth_trend',
                    'current_capacity': current,
                    'required_capacity': required,
                    'expansion_needed': required - current,
                    'urgency': 'low'
                })
        
        return recommendations

# 优化规则基类
class OptimizationRule:
    def __init__(self, name, description):
        self.name = name
        self.description = description
    
    def is_applicable(self, system_state):
        """检查规则是否适用"""
        raise NotImplementedError
    
    def generate_recommendation(self, system_state):
        """生成优化建议"""
        raise NotImplementedError

# CPU优化规则
class CPUOptimizationRule(OptimizationRule):
    def __init__(self):
        super().__init__('cpu_optimization', 'CPU资源优化规则')
    
    def is_applicable(self, system_state):
        """检查是否适用"""
        cpu_usage = system_state.get('cpu_usage', 0)
        return cpu_usage > 70  # CPU使用率超过70%时适用
    
    def generate_recommendation(self, system_state):
        """生成优化建议"""
        cpu_usage = system_state.get('cpu_usage', 0)
        
        if cpu_usage > 90:
            return {
                'type': 'cpu_optimization',
                'description': 'CPU使用率过高，需要立即优化',
                'action': 'scale_up_cpu',
                'urgency': 5,
                'impact': 5,
                'auto_execute': False,
                'details': {
                    'current_usage': cpu_usage,
                    'threshold': 90,
                    'recommended_cores': system_state.get('cpu_cores', 4) + 2
                }
            }
        elif cpu_usage > 70:
            return {
                'type': 'cpu_optimization',
                'description': 'CPU使用率偏高，建议优化',
                'action': 'analyze_cpu_processes',
                'urgency': 3,
                'impact': 4,
                'auto_execute': True,
                'details': {
                    'current_usage': cpu_usage,
                    'threshold': 70
                }
            }
        else:
            return None

# 内存优化规则
class MemoryOptimizationRule(OptimizationRule):
    def __init__(self):
        super().__init__('memory_optimization', '内存资源优化规则')
    
    def is_applicable(self, system_state):
        """检查是否适用"""
        memory_usage = system_state.get('memory_usage', 0)
        return memory_usage > 75  # 内存使用率超过75%时适用
    
    def generate_recommendation(self, system_state):
        """生成优化建议"""
        memory_usage = system_state.get('memory_usage', 0)
        
        if memory_usage > 90:
            return {
                'type': 'memory_optimization',
                'description': '内存使用率过高，需要立即处理',
                'action': 'scale_up_memory',
                'urgency': 5,
                'impact': 4,
                'auto_execute': False,
                'details': {
                    'current_usage': memory_usage,
                    'threshold': 90,
                    'recommended_memory_gb': system_state.get('memory_gb', 8) + 4
                }
            }
        elif memory_usage > 75:
            return {
                'type': 'memory_optimization',
                'description': '内存使用率偏高，建议检查内存泄漏',
                'action': 'check_memory_leaks',
                'urgency': 3,
                'impact': 3,
                'auto_execute': True,
                'details': {
                    'current_usage': memory_usage,
                    'threshold': 75
                }
            }
        else:
            return None

# 操作执行器
class ActionExecutor:
    def __init__(self):
        self.executed_actions = []
    
    def execute(self, action, system):
        """执行操作"""
        print(f"执行操作: {action} on {system}")
        
        # 模拟操作执行
        result = {
            'action': action,
            'system': system,
            'status': 'success',
            'timestamp': datetime.now().isoformat(),
            'details': '操作执行成功'
        }
        
        self.executed_actions.append(result)
        return result
    
    def get_execution_history(self):
        """获取执行历史"""
        return self.executed_actions

# 扩展MockDataSource以支持规范性分析
class PrescriptiveMockDataSource(PredictiveMockDataSource):
    def get_system_state(self, system):
        """获取系统状态"""
        return {
            'cpu_usage': np.random.uniform(30, 95),
            'memory_usage': np.random.uniform(40, 90),
            'disk_usage': np.random.uniform(20, 85),
            'cpu_cores': np.random.choice([2, 4, 8, 16]),
            'memory_gb': np.random.choice([4, 8, 16, 32, 64])
        }
    
    def get_resource_pool_data(self, pool_name):
        """获取资源池数据"""
        # 生成模拟资源池数据
        allocated_resources = []
        for i in range(np.random.randint(5, 20)):
            allocated_resources.append({
                'resource_id': f'resource_{i}',
                'current_usage': np.random.uniform(0.1, 1.0),
                'resource_value': np.random.uniform(100, 1000)
            })
        
        return {
            'allocated_resources': allocated_resources,
            'total_capacity': 100
        }
    
    def get_resource_growth_trends(self):
        """获取资源增长趋势"""
        return {
            'cpu_cores': {
                'current_usage': np.random.uniform(100, 500),
                'growth_rate': np.random.uniform(0.05, 0.2)  # 每月增长率
            },
            'memory_gb': {
                'current_usage': np.random.uniform(200, 1000),
                'growth_rate': np.random.uniform(0.08, 0.25)
            },
            'storage_tb': {
                'current_usage': np.random.uniform(500, 2000),
                'growth_rate': np.random.uniform(0.1, 0.3)
            }
        }

# 使用示例
data_source = PrescriptiveMockDataSource()
action_executor = ActionExecutor()
prescriptive_analyzer = PrescriptiveAnalyzer(data_source, action_executor)

# 注册优化规则
prescriptive_analyzer.register_optimization_rule(CPUOptimizationRule())
prescriptive_analyzer.register_optimization_rule(MemoryOptimizationRule())

# 生成优化建议
systems = ['web-server-01', 'database-01', 'cache-01']
recommendations = prescriptive_analyzer.generate_optimization_recommendations(systems)

print("优化建议:")
for rec in recommendations:
    print(f"系统: {rec['system']} (优先级: {rec['priority']})")
    for suggestion in rec['recommendations']:
        print(f"  - {suggestion['description']}")
        print(f"    紧急程度: {suggestion['urgency']}, 影响: {suggestion['impact']}")

# 执行自动化操作
executed_actions = prescriptive_analyzer.execute_automated_actions(recommendations, auto_execute=True)

print("\n执行的操作:")
for action in executed_actions:
    print(f"- {action['system']}: {action['action']} ({action['status']})")

# 优化资源分配
resource_pools = {
    'web_servers': {'total_resources': 50},
    'databases': {'total_resources': 20},
    'caches': {'total_resources': 30}
}

optimization_plan = prescriptive_analyzer.optimize_resource_allocation(resource_pools)

print("\n资源优化计划:")
for plan in optimization_plan:
    print(f"资源池: {plan['pool']}")
    print(f"操作: {plan['action']}")
    if 'resources_to_consolidate' in plan:
        print(f"可整合资源数: {len(plan['resources_to_consolidate'])}")
    if 'additional_resources_needed' in plan:
        print(f"需要扩容: {plan['additional_resources_needed']}")

# 生成容量规划报告
capacity_report = prescriptive_analyzer.generate_capacity_planning_report(90)

print("\n容量规划报告:")
print(f"时间范围: {capacity_report['time_horizon']}")
for resource_type, forecast in capacity_report['forecasts'].items():
    print(f"{resource_type}: 当前{forecast['current_usage']:.1f}, 预测{forecast['forecasted_usage']:.1f}")
```

## 决策支持系统

基于上述分析结果，我们可以构建一个完整的决策支持系统：

```python
class OperationsDecisionSupportSystem:
    def __init__(self):
        self.data_source = PrescriptiveMockDataSource()
        self.action_executor = ActionExecutor()
        
        # 初始化各种分析器
        self.descriptive_analyzer = DescriptiveAnalyzer(self.data_source)
        self.diagnostic_analyzer = DiagnosticAnalyzer(self.data_source)
        self.predictive_analyzer = PredictiveAnalyzer(self.data_source)
        self.prescriptive_analyzer = PrescriptiveAnalyzer(self.data_source, self.action_executor)
        
        # 注册优化规则
        self.prescriptive_analyzer.register_optimization_rule(CPUOptimizationRule())
        self.prescriptive_analyzer.register_optimization_rule(MemoryOptimizationRule())
        
        # 决策历史
        self.decision_history = []
    
    def generate_comprehensive_analysis_report(self, systems, time_range_days=30):
        """生成综合分析报告"""
        report = {
            'generated_at': datetime.now().isoformat(),
            'systems_analyzed': systems,
            'time_range': f"最近{time_range_days}天"
        }
        
        # 1. 描述性分析
        report['descriptive_analysis'] = self._generate_descriptive_analysis(systems, time_range_days)
        
        # 2. 诊断性分析
        report['diagnostic_analysis'] = self._generate_diagnostic_analysis(systems)
        
        # 3. 预测性分析
        report['predictive_analysis'] = self._generate_predictive_analysis(systems)
        
        # 4. 规范性分析
        report['prescriptive_analysis'] = self._generate_prescriptive_analysis(systems)
        
        return report
    
    def _generate_descriptive_analysis(self, systems, time_range_days):
        """生成描述性分析"""
        # 获取整体资源使用情况
        resource_report = self.descriptive_analyzer.generate_resource_utilization_report(time_range_days)
        
        # 分析各系统状态
        system_stats = {}
        for system in systems:
            system_data = self.data_source.get_system_state(system)
            system_stats[system] = {
                'cpu_usage': system_data.get('cpu_usage', 0),
                'memory_usage': system_data.get('memory_usage', 0),
                'status': self._determine_system_status(system_data)
            }
        
        return {
            'overall_resource_utilization': resource_report,
            'system_statistics': system_stats
        }
    
    def _determine_system_status(self, system_data):
        """确定系统状态"""
        cpu_usage = system_data.get('cpu_usage', 0)
        memory_usage = system_data.get('memory_usage', 0)
        
        if cpu_usage > 90 or memory_usage > 90:
            return 'critical'
        elif cpu_usage > 75 or memory_usage > 75:
            return 'warning'
        else:
            return 'healthy'
    
    def _generate_diagnostic_analysis(self, systems):
        """生成诊断性分析"""
        # 模拟分析最近24小时的性能问题
        start_time = datetime.now() - timedelta(days=1)
        end_time = datetime.now()
        
        system_diagnostics = {}
        for system in systems:
            try:
                diagnosis = self.diagnostic_analyzer.analyze_performance_degradation(
                    start_time, end_time
                )
                system_diagnostics[system] = diagnosis
            except Exception as e:
                system_diagnostics[system] = {'error': str(e)}
        
        return system_diagnostics
    
    def _generate_predictive_analysis(self, systems):
        """生成预测性分析"""
        predictions = {}
        
        # 预测各系统资源使用
        for system in systems:
            try:
                cpu_pred = self.predictive_analyzer.predict_resource_utilization('cpu', 24)
                memory_pred = self.predictive_analyzer.predict_resource_utilization('memory', 24)
                
                predictions[system] = {
                    'cpu_prediction': cpu_pred,
                    'memory_prediction': memory_pred
                }
            except Exception as e:
                predictions[system] = {'error': str(e)}
        
        # 预测故障风险
        try:
            risk_assessments = self.predictive_analyzer.predict_failure_risk(systems)
            predictions['failure_risk_assessments'] = risk_assessments
        except Exception as e:
            predictions['failure_risk_assessments'] = {'error': str(e)}
        
        return predictions
    
    def _generate_prescriptive_analysis(self, systems):
        """生成规范性分析"""
        # 生成优化建议
        recommendations = self.prescriptive_analyzer.generate_optimization_recommendations(systems)
        
        # 优化资源分配
        resource_pools = {
            'web_servers': {'total_resources': 50},
            'databases': {'total_resources': 20},
            'caches': {'total_resources': 30}
        }
        optimization_plan = self.prescriptive_analyzer.optimize_resource_allocation(resource_pools)
        
        # 容量规划
        capacity_report = self.prescriptive_analyzer.generate_capacity_planning_report(90)
        
        return {
            'optimization_recommendations': recommendations,
            'resource_optimization_plan': optimization_plan,
            'capacity_planning': capacity_report
        }
    
    def make_decision(self, decision_type, parameters):
        """做出决策"""
        decision = {
            'type': decision_type,
            'parameters': parameters,
            'timestamp': datetime.now().isoformat(),
            'analysis_basis': {}
        }
        
        if decision_type == 'resource_scaling':
            # 资源扩容决策
            system = parameters.get('system')
            resource_type = parameters.get('resource_type')
            scale_amount = parameters.get('scale_amount')
            
            # 基于分析做出决策
            system_state = self.data_source.get_system_state(system)
            current_usage = system_state.get(f'{resource_type}_usage', 0)
            
            decision['analysis_basis'] = {
                'current_usage': current_usage,
                'threshold': parameters.get('threshold', 80)
            }
            
            if current_usage > decision['analysis_basis']['threshold']:
                decision['action'] = 'scale_up'
                decision['details'] = {
                    'system': system,
                    'resource_type': resource_type,
                    'amount': scale_amount
                }
            else:
                decision['action'] = 'no_action_needed'
        
        elif decision_type == 'maintenance_scheduling':
            # 维护计划决策
            systems = parameters.get('systems', [])
            
            # 基于风险评估做出决策
            risk_assessments = self.predictive_analyzer.predict_failure_risk(systems)
            
            decision['analysis_basis'] = {
                'risk_assessments': risk_assessments
            }
            
            # 识别高风险系统
            high_risk_systems = [
                assessment['system'] for assessment in risk_assessments
                if assessment['current_risk_score'] > 80
            ]
            
            if high_risk_systems:
                decision['action'] = 'schedule_immediate_maintenance'
                decision['details'] = {
                    'systems': high_risk_systems,
                    'priority': 'high'
                }
            else:
                decision['action'] = 'schedule_routine_maintenance'
                decision['details'] = {
                    'systems': systems,
                    'priority': 'normal'
                }
        
        # 记录决策历史
        self.decision_history.append(decision)
        
        return decision
    
    def execute_decision(self, decision):
        """执行决策"""
        if decision['action'] == 'scale_up':
            # 执行扩容操作
            details = decision['details']
            action = f"scale_up_{details['resource_type']}"
            result = self.action_executor.execute(action, details['system'])
            return result
        elif decision['action'] == 'schedule_immediate_maintenance':
            # 安排紧急维护
            details = decision['details']
            print(f"安排紧急维护: {details['systems']}")
            return {'status': 'maintenance_scheduled', 'systems': details['systems']}
        elif decision['action'] == 'schedule_routine_maintenance':
            # 安排常规维护
            details = decision['details']
            print(f"安排常规维护: {details['systems']}")
            return {'status': 'maintenance_scheduled', 'systems': details['systems']}
        else:
            return {'status': 'no_action_executed'}
    
    def get_decision_history(self, limit=10):
        """获取决策历史"""
        return self.decision_history[-limit:]

# 使用示例
dss = OperationsDecisionSupportSystem()

# 生成综合分析报告
systems = ['web-server-01', 'database-01', 'cache-01']
comprehensive_report = dss.generate_comprehensive_analysis_report(systems, 30)

print("综合分析报告摘要:")
print(f"报告生成时间: {comprehensive_report['generated_at']}")
print(f"分析系统数: {len(comprehensive_report['systems_analyzed'])}")

# 显示资源利用率摘要
overall_utilization = comprehensive_report['descriptive_analysis']['overall_resource_utilization']
print(f"CPU平均利用率: {overall_utilization['summary']['cpu_utilization']['avg']:.2f}%")
print(f"内存平均利用率: {overall_utilization['summary']['memory_utilization']['avg']:.2f}%")

# 显示系统状态
system_stats = comprehensive_report['descriptive_analysis']['system_statistics']
for system, stats in system_stats.items():
    print(f"{system} 状态: {stats['status']} (CPU: {stats['cpu_usage']:.1f}%, 内存: {stats['memory_usage']:.1f}%)")

# 做出扩容决策
scaling_decision = dss.make_decision('resource_scaling', {
    'system': 'web-server-01',
    'resource_type': 'cpu',
    'scale_amount': 2,
    'threshold': 80
})

print(f"\n扩容决策: {scaling_decision['action']}")
if 'details' in scaling_decision:
    print(f"详情: {scaling_decision['details']}")

# 执行决策
execution_result = dss.execute_decision(scaling_decision)
print(f"执行结果: {execution_result}")

# 做出维护计划决策
maintenance_decision = dss.make_decision('maintenance_scheduling', {
    'systems': systems
})

print(f"\n维护计划决策: {maintenance_decision['action']}")
if 'details' in maintenance_decision:
    print(f"详情: {maintenance_decision['details']}")

# 查看决策历史
decision_history = dss.get_decision_history(5)
print(f"\n最近5个决策:")
for i, decision in enumerate(decision_history, 1):
    print(f"{i}. {decision['type']} - {decision['action']} ({decision['timestamp']})")
```

## 实施建议

### 1. 分阶段实施策略

1. **第一阶段：基础数据整合**
   - 建立统一的数据采集和存储平台
   - 实现基本的描述性分析功能

2. **第二阶段：深度分析能力**
   - 实现诊断性和预测性分析
   - 建立初步的决策支持能力

3. **第三阶段：智能化决策**
   - 实现规范性分析和自动化决策
   - 建立完整的决策支持系统

### 2. 技术选型建议

1. **数据存储**：选择适合的数据库技术（时序数据库、图数据库等）
2. **分析引擎**：采用大数据处理框架（Spark、Flink等）
3. **机器学习**：使用成熟的ML框架（Scikit-learn、TensorFlow等）
4. **可视化**：选择合适的BI工具（Grafana、Tableau等）

### 3. 组织保障

1. **建立数据分析团队**：培养专业的数据分析人才
2. **制定数据标准**：建立统一的数据标准和规范
3. **建立反馈机制**：建立分析结果的反馈和优化机制

## 总结

基于全域运维数据的分析与决策是实现智能化运维的关键。通过描述性、诊断性、预测性和规范性分析，我们可以：

1. **全面了解系统状态**：通过描述性分析掌握系统当前状况
2. **快速定位问题根源**：通过诊断性分析找出问题根本原因
3. **预见未来趋势**：通过预测性分析预知潜在风险
4. **制定优化策略**：通过规范性分析提供具体行动建议

成功的实施需要：

1. **完善的数据基础**：建立统一的数据采集和存储平台
2. **先进的分析技术**：采用合适的分析方法和工具
3. **科学的决策流程**：建立基于数据的决策机制
4. **持续的优化改进**：不断优化分析模型和决策策略

只有通过系统性的规划和实施，才能真正发挥全域运维数据分析的价值，为企业的数字化转型提供强有力的支撑。