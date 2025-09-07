---
title: "模型监控与迭代: 模型性能衰减预警、概念漂移检测、持续学习"
date: 2025-09-07
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 模型监控与迭代：模型性能衰减预警、概念漂移检测、持续学习

## 引言

在企业级智能风控平台中，模型上线并不意味着工作的结束，而是一个新阶段的开始。随着时间推移和业务环境的变化，模型性能会逐渐衰减，甚至可能出现严重偏离预期的情况。有效的模型监控与迭代机制能够及时发现性能问题，触发模型更新流程，确保风控系统持续有效地保护业务安全。

模型监控与迭代是MLOps体系中的关键环节，涵盖了模型性能监控、数据质量检测、概念漂移识别、自动预警以及持续学习等多个方面。通过建立完善的监控体系，可以实现模型的自动化运维，降低人工干预成本，提升模型生命周期管理的效率。

本文将深入探讨模型监控与迭代的核心技术要点，包括监控指标设计、漂移检测算法、预警机制以及持续学习策略，为构建智能化的风控模型管理体系提供指导。

## 一、模型监控体系设计

### 1.1 监控指标体系

模型监控需要从多个维度建立全面的指标体系，包括性能指标、数据指标、业务指标等。

#### 1.1.1 性能指标

**基础性能指标**：
```python
# 模型性能监控指标
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from typing import Dict, List, Optional
import pandas as pd

class ModelPerformanceMonitor:
    """模型性能监控器"""
    
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.performance_history = []
        self.thresholds = {
            'accuracy': 0.85,
            'precision': 0.80,
            'recall': 0.80,
            'f1_score': 0.80,
            'auc': 0.85
        }
    
    def calculate_metrics(self, y_true: List[int], y_pred: List[int], 
                         y_prob: Optional[List[float]] = None) -> Dict[str, float]:
        """
        计算模型性能指标
        
        Args:
            y_true: 真实标签
            y_pred: 预测标签
            y_prob: 预测概率
            
        Returns:
            性能指标字典
        """
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, zero_division=0),
            'recall': recall_score(y_true, y_pred, zero_division=0),
            'f1_score': f1_score(y_true, y_pred, zero_division=0)
        }
        
        if y_prob is not None:
            metrics['auc'] = roc_auc_score(y_true, y_prob)
        
        # 记录历史数据
        metrics['timestamp'] = pd.Timestamp.now()
        self.performance_history.append(metrics)
        
        return metrics
    
    def check_performance_degradation(self, current_metrics: Dict[str, float]) -> Dict[str, bool]:
        """
        检查性能衰减
        
        Args:
            current_metrics: 当前性能指标
            
        Returns:
            衰减检查结果
        """
        degradation_alerts = {}
        
        for metric_name, threshold in self.thresholds.items():
            if metric_name in current_metrics:
                current_value = current_metrics[metric_name]
                if current_value < threshold:
                    degradation_alerts[metric_name] = True
                else:
                    degradation_alerts[metric_name] = False
        
        return degradation_alerts
    
    def get_performance_trend(self, window_size: int = 7) -> Dict[str, List[float]]:
        """
        获取性能趋势
        
        Args:
            window_size: 窗口大小（天）
            
        Returns:
            性能趋势数据
        """
        if len(self.performance_history) < window_size:
            return {}
        
        # 取最近window_size条记录
        recent_history = self.performance_history[-window_size:]
        
        trend = {}
        for metric_name in self.thresholds.keys():
            if metric_name != 'auc' or any('auc' in record for record in recent_history):
                trend[metric_name] = [
                    record[metric_name] for record in recent_history 
                    if metric_name in record
                ]
        
        return trend

# 使用示例
def example_performance_monitoring():
    """性能监控示例"""
    monitor = ModelPerformanceMonitor("fraud_detection_model")
    
    # 模拟历史性能数据
    historical_data = [
        ([1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0.9, 0.1, 0.8, 0.2, 0.95]),
        ([1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [0.85, 0.3, 0.2, 0.1, 0.9]),
        ([0, 1, 1, 0, 0], [0, 1, 0, 0, 0], [0.2, 0.8, 0.4, 0.1, 0.3])
    ]
    
    for y_true, y_pred, y_prob in historical_data:
        metrics = monitor.calculate_metrics(y_true, y_pred, y_prob)
        print(f"性能指标: {metrics}")
        
        # 检查性能衰减
        alerts = monitor.check_performance_degradation(metrics)
        print(f"衰减警报: {alerts}")
    
    # 获取性能趋势
    trend = monitor.get_performance_trend(3)
    print(f"性能趋势: {trend}")

# 运行示例
# example_performance_monitoring()
```

#### 1.1.2 数据质量指标

**数据分布监控**：
```python
# 数据质量监控
import numpy as np
from scipy import stats
from typing import Dict, List, Any
import pandas as pd

class DataQualityMonitor:
    """数据质量监控器"""
    
    def __init__(self, feature_names: List[str]):
        self.feature_names = feature_names
        self.baseline_statistics = {}
        self.current_statistics = {}
    
    def establish_baseline(self, data: pd.DataFrame):
        """
        建立基线统计信息
        
        Args:
            data: 基线数据
        """
        for feature in self.feature_names:
            if feature in data.columns:
                self.baseline_statistics[feature] = {
                    'mean': data[feature].mean(),
                    'std': data[feature].std(),
                    'min': data[feature].min(),
                    'max': data[feature].max(),
                    'quantiles': data[feature].quantile([0.25, 0.5, 0.75]).to_dict()
                }
    
    def calculate_current_statistics(self, data: pd.DataFrame) -> Dict[str, Dict[str, float]]:
        """
        计算当前统计信息
        
        Args:
            data: 当前数据
            
        Returns:
            当前统计信息
        """
        current_stats = {}
        for feature in self.feature_names:
            if feature in data.columns:
                current_stats[feature] = {
                    'mean': data[feature].mean(),
                    'std': data[feature].std(),
                    'min': data[feature].min(),
                    'max': data[feature].max(),
                    'quantiles': data[feature].quantile([0.25, 0.5, 0.75]).to_dict()
                }
        
        self.current_statistics = current_stats
        return current_stats
    
    def detect_data_drift(self, threshold: float = 0.05) -> Dict[str, Dict[str, Any]]:
        """
        检测数据漂移
        
        Args:
            threshold: 显著性阈值
            
        Returns:
            漂移检测结果
        """
        drift_results = {}
        
        for feature in self.feature_names:
            if (feature in self.baseline_statistics and 
                feature in self.current_statistics):
                
                baseline = self.baseline_statistics[feature]
                current = self.current_statistics[feature]
                
                # KS检验检测分布变化
                # 这里简化处理，实际应用中需要原始数据进行KS检验
                mean_diff = abs(baseline['mean'] - current['mean'])
                std_diff = abs(baseline['std'] - current['std'])
                
                # 简化的漂移检测逻辑
                drift_detected = (
                    mean_diff > (baseline['std'] * 2) or 
                    std_diff > (baseline['std'] * 0.5)
                )
                
                drift_results[feature] = {
                    'drift_detected': drift_detected,
                    'mean_diff': mean_diff,
                    'std_diff': std_diff,
                    'baseline_mean': baseline['mean'],
                    'current_mean': current['mean']
                }
        
        return drift_results
    
    def detect_outliers(self, data: pd.DataFrame, method: str = 'iqr') -> Dict[str, int]:
        """
        检测异常值
        
        Args:
            data: 数据
            method: 检测方法 ('iqr', 'zscore')
            
        Returns:
            异常值统计
        """
        outlier_counts = {}
        
        for feature in self.feature_names:
            if feature in data.columns:
                if method == 'iqr':
                    Q1 = data[feature].quantile(0.25)
                    Q3 = data[feature].quantile(0.75)
                    IQR = Q3 - Q1
                    lower_bound = Q1 - 1.5 * IQR
                    upper_bound = Q3 + 1.5 * IQR
                    outliers = data[(data[feature] < lower_bound) | (data[feature] > upper_bound)]
                elif method == 'zscore':
                    z_scores = np.abs(stats.zscore(data[feature]))
                    outliers = data[z_scores > 3]
                else:
                    outliers = pd.DataFrame()
                
                outlier_counts[feature] = len(outliers)
        
        return outlier_counts

# 使用示例
def example_data_quality_monitoring():
    """数据质量监控示例"""
    # 创建示例数据
    np.random.seed(42)
    baseline_data = pd.DataFrame({
        'amount': np.random.lognormal(5, 1, 1000),
        'frequency': np.random.poisson(5, 1000),
        'velocity': np.random.exponential(2, 1000)
    })
    
    # 当前数据（模拟数据漂移）
    current_data = pd.DataFrame({
        'amount': np.random.lognormal(5.5, 1.2, 1000),  # 均值和标准差变化
        'frequency': np.random.poisson(7, 1000),        # 分布变化
        'velocity': np.random.exponential(3, 1000)      # 分布变化
    })
    
    # 初始化监控器
    monitor = DataQualityMonitor(['amount', 'frequency', 'velocity'])
    
    # 建立基线
    monitor.establish_baseline(baseline_data)
    print("基线统计信息建立完成")
    
    # 计算当前统计信息
    current_stats = monitor.calculate_current_statistics(current_data)
    print("当前统计信息:")
    for feature, stats in current_stats.items():
        print(f"  {feature}: 均值={stats['mean']:.2f}, 标准差={stats['std']:.2f}")
    
    # 检测数据漂移
    drift_results = monitor.detect_data_drift()
    print("\n数据漂移检测结果:")
    for feature, result in drift_results.items():
        if result['drift_detected']:
            print(f"  {feature}: 检测到漂移 (均值差异: {result['mean_diff']:.2f})")
        else:
            print(f"  {feature}: 无显著漂移")
    
    # 检测异常值
    outlier_counts = monitor.detect_outliers(current_data, method='iqr')
    print("\n异常值统计:")
    for feature, count in outlier_counts.items():
        print(f"  {feature}: {count} 个异常值")

# 运行示例
# example_data_quality_monitoring()
```

### 1.2 监控系统架构

#### 1.2.1 实时监控架构

**监控系统设计**：
```python
# 实时监控系统
import asyncio
import time
from typing import Dict, List, Callable
import threading
from dataclasses import dataclass
from enum import Enum

class AlertLevel(Enum):
    """告警级别"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

@dataclass
class Alert:
    """告警信息"""
    level: AlertLevel
    message: str
    timestamp: float
    source: str
    details: Dict[str, Any]

class MonitoringSystem:
    """监控系统"""
    
    def __init__(self):
        self.monitors = []
        self.alert_handlers = []
        self.alerts = []
        self.running = False
        self.monitoring_thread = None
    
    def add_monitor(self, monitor: Callable):
        """添加监控器"""
        self.monitors.append(monitor)
    
    def add_alert_handler(self, handler: Callable):
        """添加告警处理器"""
        self.alert_handlers.append(handler)
    
    def start_monitoring(self, interval: int = 60):
        """启动监控"""
        self.running = True
        self.monitoring_thread = threading.Thread(
            target=self._monitoring_loop, 
            args=(interval,)
        )
        self.monitoring_thread.start()
    
    def stop_monitoring(self):
        """停止监控"""
        self.running = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
    
    def _monitoring_loop(self, interval: int):
        """监控循环"""
        while self.running:
            try:
                # 执行所有监控器
                for monitor in self.monitors:
                    alerts = monitor()
                    if alerts:
                        for alert in alerts:
                            self._handle_alert(alert)
                
                time.sleep(interval)
            except Exception as e:
                print(f"监控循环异常: {e}")
                time.sleep(interval)
    
    def _handle_alert(self, alert: Alert):
        """处理告警"""
        self.alerts.append(alert)
        
        # 调用所有告警处理器
        for handler in self.alert_handlers:
            try:
                handler(alert)
            except Exception as e:
                print(f"告警处理器异常: {e}")
    
    def get_recent_alerts(self, hours: int = 24) -> List[Alert]:
        """获取最近的告警"""
        cutoff_time = time.time() - (hours * 3600)
        return [alert for alert in self.alerts if alert.timestamp > cutoff_time]

# Prometheus集成
from prometheus_client import Counter, Histogram, Gauge

class PrometheusMetrics:
    """Prometheus指标"""
    
    def __init__(self):
        # 模型性能指标
        self.model_accuracy = Gauge('model_accuracy', 'Model accuracy', ['model_name'])
        self.model_precision = Gauge('model_precision', 'Model precision', ['model_name'])
        self.model_recall = Gauge('model_recall', 'Model recall', ['model_name'])
        self.model_f1 = Gauge('model_f1_score', 'Model F1 score', ['model_name'])
        self.model_auc = Gauge('model_auc', 'Model AUC', ['model_name'])
        
        # 数据质量指标
        self.data_drift = Gauge('data_drift_detected', 'Data drift detected', ['feature'])
        self.outlier_count = Gauge('feature_outliers', 'Feature outlier count', ['feature'])
        
        # 业务指标
        self.prediction_count = Counter('model_predictions_total', 'Total predictions', ['model_name'])
        self.alert_count = Counter('model_alerts_total', 'Total alerts', ['level'])
        
        # 延迟指标
        self.prediction_latency = Histogram('model_prediction_latency_seconds', 'Prediction latency')
    
    def update_model_metrics(self, model_name: str, metrics: Dict[str, float]):
        """更新模型指标"""
        self.model_accuracy.labels(model_name=model_name).set(metrics.get('accuracy', 0))
        self.model_precision.labels(model_name=model_name).set(metrics.get('precision', 0))
        self.model_recall.labels(model_name=model_name).set(metrics.get('recall', 0))
        self.model_f1.labels(model_name=model_name).set(metrics.get('f1_score', 0))
        if 'auc' in metrics:
            self.model_auc.labels(model_name=model_name).set(metrics['auc'])
    
    def record_alert(self, level: AlertLevel):
        """记录告警"""
        self.alert_count.labels(level=level.value).inc()

# 告警处理器
class AlertHandler:
    """告警处理器"""
    
    def __init__(self, metrics: PrometheusMetrics):
        self.metrics = metrics
    
    def handle_alert(self, alert: Alert):
        """处理告警"""
        print(f"[{alert.level.value.upper()}] {alert.timestamp}: {alert.message}")
        print(f"来源: {alert.source}")
        if alert.details:
            print(f"详情: {alert.details}")
        
        # 更新Prometheus指标
        self.metrics.record_alert(alert.level)
        
        # 根据告警级别采取不同行动
        if alert.level == AlertLevel.CRITICAL:
            self._send_critical_alert(alert)
        elif alert.level == AlertLevel.WARNING:
            self._send_warning_alert(alert)
    
    def _send_critical_alert(self, alert: Alert):
        """发送严重告警"""
        # 这里可以集成邮件、短信、电话等通知方式
        print(f"发送严重告警通知: {alert.message}")
    
    def _send_warning_alert(self, alert: Alert):
        """发送警告告警"""
        # 这里可以集成Slack、钉钉等通知方式
        print(f"发送警告通知: {alert.message}")

# 使用示例
def example_monitoring_system():
    """监控系统示例"""
    # 初始化组件
    monitoring_system = MonitoringSystem()
    prometheus_metrics = PrometheusMetrics()
    alert_handler = AlertHandler(prometheus_metrics)
    
    # 添加告警处理器
    monitoring_system.add_alert_handler(alert_handler.handle_alert)
    
    # 模拟监控器
    def mock_model_monitor():
        """模拟模型监控器"""
        import random
        
        # 模拟性能下降
        accuracy = random.uniform(0.7, 0.95)
        
        alerts = []
        if accuracy < 0.8:
            alerts.append(Alert(
                level=AlertLevel.WARNING,
                message=f"模型准确率下降到 {accuracy:.3f}",
                timestamp=time.time(),
                source="model_performance_monitor",
                details={'accuracy': accuracy, 'threshold': 0.8}
            ))
        
        # 更新Prometheus指标
        prometheus_metrics.update_model_metrics("fraud_detection", {'accuracy': accuracy})
        
        return alerts
    
    def mock_data_monitor():
        """模拟数据监控器"""
        import random
        
        alerts = []
        # 模拟数据漂移
        if random.random() < 0.1:  # 10%概率检测到漂移
            alerts.append(Alert(
                level=AlertLevel.INFO,
                message="检测到数据分布变化",
                timestamp=time.time(),
                source="data_quality_monitor",
                details={'feature': 'transaction_amount', 'change_type': 'mean_shift'}
            ))
        
        return alerts
    
    # 添加监控器
    monitoring_system.add_monitor(mock_model_monitor)
    monitoring_system.add_monitor(mock_data_monitor)
    
    # 启动监控（每10秒检查一次）
    monitoring_system.start_monitoring(interval=10)
    
    print("监控系统已启动，按Ctrl+C停止...")
    
    try:
        # 运行一段时间
        time.sleep(60)
    except KeyboardInterrupt:
        print("停止监控系统...")
        monitoring_system.stop_monitoring()
        
        # 显示最近的告警
        recent_alerts = monitoring_system.get_recent_alerts(hours=1)
        print(f"\n最近1小时告警数量: {len(recent_alerts)}")
        for alert in recent_alerts[-5:]:  # 显示最近5个告警
            print(f"  [{alert.timestamp}] {alert.level.value}: {alert.message}")

# 运行示例
# example_monitoring_system()
```

## 二、概念漂移检测

### 2.1 漂移检测算法

概念漂移是指数据分布随时间发生变化的现象，在风控场景中尤其常见。有效的漂移检测能够帮助及时发现模型失效风险。

#### 2.1.1 统计方法

**KL散度检测**：
```python
# 概念漂移检测算法
import numpy as np
from scipy import stats
from typing import List, Tuple, Optional
import warnings

class ConceptDriftDetector:
    """概念漂移检测器"""
    
    def __init__(self, window_size: int = 1000, threshold: float = 0.05):
        self.window_size = window_size
        self.threshold = threshold
        self.reference_data = []
        self.current_data = []
    
    def add_reference_data(self, data: List[float]):
        """添加参考数据"""
        self.reference_data.extend(data)
        # 保持窗口大小
        if len(self.reference_data) > self.window_size:
            self.reference_data = self.reference_data[-self.window_size:]
    
    def add_current_data(self, data: List[float]):
        """添加当前数据"""
        self.current_data.extend(data)
        # 保持窗口大小
        if len(self.current_data) > self.window_size:
            self.current_data = self.current_data[-self.window_size:]
    
    def detect_drift_kl(self) -> Tuple[bool, float]:
        """
        使用KL散度检测漂移
        
        Returns:
            (是否检测到漂移, KL散度值)
        """
        if len(self.reference_data) < 50 or len(self.current_data) < 50:
            return False, 0.0
        
        # 计算KL散度
        kl_divergence = self._calculate_kl_divergence(
            self.reference_data, 
            self.current_data
        )
        
        drift_detected = kl_divergence > self.threshold
        return drift_detected, kl_divergence
    
    def _calculate_kl_divergence(self, p: List[float], q: List[float]) -> float:
        """计算KL散度"""
        # 将数据分箱
        min_val = min(min(p), min(q))
        max_val = max(max(p), max(q))
        bins = np.linspace(min_val, max_val, 50)
        
        # 计算直方图
        p_hist, _ = np.histogram(p, bins=bins, density=True)
        q_hist, _ = np.histogram(q, bins=bins, density=True)
        
        # 避免零值
        p_hist = np.clip(p_hist, 1e-10, None)
        q_hist = np.clip(q_hist, 1e-10, None)
        
        # 计算KL散度
        kl_div = np.sum(p_hist * np.log(p_hist / q_hist))
        return kl_div
    
    def detect_drift_ks(self) -> Tuple[bool, float]:
        """
        使用KS检验检测漂移
        
        Returns:
            (是否检测到漂移, p值)
        """
        if len(self.reference_data) < 10 or len(self.current_data) < 10:
            return False, 1.0
        
        # KS检验
        statistic, p_value = stats.ks_2samp(self.reference_data, self.current_data)
        
        # 如果p值小于阈值，说明两个分布有显著差异
        drift_detected = p_value < self.threshold
        return drift_detected, p_value
    
    def detect_drift_cusum(self, target_mean: Optional[float] = None) -> Tuple[bool, float]:
        """
        使用CUSUM算法检测漂移
        
        Args:
            target_mean: 目标均值，如果为None则使用参考数据均值
            
        Returns:
            (是否检测到漂移, CUSUM统计量)
        """
        if len(self.current_data) < 10:
            return False, 0.0
        
        if target_mean is None:
            if len(self.reference_data) < 10:
                return False, 0.0
            target_mean = np.mean(self.reference_data)
        
        # 计算CUSUM统计量
        cusum_stat = self._calculate_cusum(self.current_data, target_mean)
        
        drift_detected = cusum_stat > self.threshold
        return drift_detected, cusum_stat
    
    def _calculate_cusum(self, data: List[float], target_mean: float) -> float:
        """计算CUSUM统计量"""
        # 简化的CUSUM实现
        deviations = [x - target_mean for x in data]
        cumsum_pos = 0.0
        max_cumsum = 0.0
        
        for dev in deviations:
            cumsum_pos = max(0, cumsum_pos + dev)
            max_cumsum = max(max_cumsum, cumsum_pos)
        
        return max_cumsum

# 在线漂移检测器
class OnlineDriftDetector:
    """在线漂移检测器"""
    
    def __init__(self, detector_type: str = 'ks', **kwargs):
        self.detector_type = detector_type
        self.detector = ConceptDriftDetector(**kwargs)
        self.drift_history = []
        self.alert_threshold = kwargs.get('threshold', 0.05)
    
    def update(self, value: float) -> Tuple[bool, Dict[str, float]]:
        """
        更新检测器
        
        Args:
            value: 新的数据点
            
        Returns:
            (是否检测到漂移, 检测结果详情)
        """
        # 添加到当前数据
        self.detector.add_current_data([value])
        
        # 执行检测
        if self.detector_type == 'kl':
            drift_detected, metric_value = self.detector.detect_drift_kl()
        elif self.detector_type == 'ks':
            drift_detected, metric_value = self.detector.detect_drift_ks()
        elif self.detector_type == 'cusum':
            drift_detected, metric_value = self.detector.detect_drift_cusum()
        else:
            raise ValueError(f"不支持的检测器类型: {self.detector_type}")
        
        # 记录检测结果
        result = {
            'drift_detected': drift_detected,
            'metric_value': metric_value,
            'detector_type': self.detector_type,
            'timestamp': time.time()
        }
        
        if drift_detected:
            self.drift_history.append(result)
        
        return drift_detected, result

# 使用示例
def example_concept_drift_detection():
    """概念漂移检测示例"""
    # 创建检测器
    detectors = {
        'KL散度': OnlineDriftDetector('kl', window_size=500, threshold=0.1),
        'KS检验': OnlineDriftDetector('ks', window_size=500, threshold=0.05),
        'CUSUM': OnlineDriftDetector('cusum', window_size=500, threshold=2.0)
    }
    
    # 生成参考数据（正态分布）
    np.random.seed(42)
    reference_data = np.random.normal(0, 1, 1000)
    
    # 为每个检测器添加参考数据
    for detector in detectors.values():
        for value in reference_data:
            detector.detector.add_reference_data([value])
    
    # 模拟数据流
    print("开始概念漂移检测...")
    print("时间\tKL散度\tKS检验\tCUSUM")
    
    drift_counts = {name: 0 for name in detectors.keys()}
    
    for i in range(2000):
        # 前1000个点：正常数据
        # 后1000个点：漂移数据（均值从0变为1）
        if i < 1000:
            value = np.random.normal(0, 1)  # 正常数据
        else:
            value = np.random.normal(1, 1)  # 漂移数据
        
        # 更新所有检测器
        results = {}
        for name, detector in detectors.items():
            drift_detected, result = detector.update(value)
            results[name] = result
            if drift_detected:
                drift_counts[name] += 1
        
        # 每100个点输出一次结果
        if (i + 1) % 100 == 0:
            print(f"{i+1:4d}\t"
                  f"{results['KL散度']['drift_detected']!s:5s}\t"
                  f"{results['KS检验']['drift_detected']!s:5s}\t"
                  f"{results['CUSUM']['drift_detected']!s:5s}")
    
    print("\n检测结果统计:")
    for name, count in drift_counts.items():
        print(f"  {name}: 检测到 {count} 次漂移")

# 运行示例
# example_concept_drift_detection()
```

#### 2.1.2 机器学习方法

**基于分类器的漂移检测**：
```python
# 基于机器学习的漂移检测
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

class MLBasedDriftDetector:
    """基于机器学习的漂移检测器"""
    
    def __init__(self, threshold: float = 0.7):
        self.threshold = threshold
        self.reference_model = None
        self.reference_features = None
        self.reference_labels = None
    
    def fit_reference(self, X_reference: np.ndarray):
        """
        训练参考模型
        
        Args:
            X_reference: 参考数据特征
        """
        # 创建标签：0表示参考数据
        n_samples = X_reference.shape[0]
        y_reference = np.zeros(n_samples)
        
        # 训练分类器来区分参考数据和新数据
        self.reference_features = X_reference
        self.reference_labels = y_reference
        
        # 合成一些"新数据"用于训练（实际应用中可能需要历史数据）
        X_synthetic = X_reference + np.random.normal(0, 0.1, X_reference.shape)
        y_synthetic = np.ones(n_samples)
        
        # 合并数据
        X_combined = np.vstack([X_reference, X_synthetic])
        y_combined = np.hstack([y_reference, y_synthetic])
        
        # 训练分类器
        self.reference_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.reference_model.fit(X_combined, y_combined)
    
    def detect_drift(self, X_current: np.ndarray) -> Tuple[bool, float]:
        """
        检测漂移
        
        Args:
            X_current: 当前数据特征
            
        Returns:
            (是否检测到漂移, 漂移分数)
        """
        if self.reference_model is None:
            raise ValueError("请先调用fit_reference方法训练参考模型")
        
        # 预测当前数据是否属于参考分布
        y_pred = self.reference_model.predict(X_current)
        
        # 计算当前数据被分类为"新数据"的比例
        drift_score = np.mean(y_pred)
        
        # 如果漂移分数超过阈值，说明检测到漂移
        drift_detected = drift_score > self.threshold
        
        return drift_detected, drift_score

# 特征重要性漂移检测
class FeatureImportanceDriftDetector:
    """基于特征重要性的漂移检测器"""
    
    def __init__(self, threshold: float = 0.2):
        self.threshold = threshold
        self.reference_importance = None
        self.current_model = None
    
    def establish_baseline(self, X_reference: np.ndarray, y_reference: np.ndarray):
        """
        建立基线特征重要性
        
        Args:
            X_reference: 参考数据特征
            y_reference: 参考数据标签
        """
        # 训练模型
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_reference, y_reference)
        
        # 保存特征重要性
        self.reference_importance = model.feature_importances_
        self.current_model = model
    
    def detect_importance_drift(self, X_current: np.ndarray, y_current: np.ndarray) -> Tuple[bool, Dict[str, float]]:
        """
        检测特征重要性漂移
        
        Args:
            X_current: 当前数据特征
            y_current: 当前数据标签
            
        Returns:
            (是否检测到漂移, 详细结果)
        """
        if self.reference_importance is None:
            raise ValueError("请先调用establish_baseline方法建立基线")
        
        # 训练当前模型
        current_model = RandomForestClassifier(n_estimators=100, random_state=42)
        current_model.fit(X_current, y_current)
        current_importance = current_model.feature_importances_
        
        # 计算重要性差异
        importance_diff = np.abs(self.reference_importance - current_importance)
        max_diff = np.max(importance_diff)
        mean_diff = np.mean(importance_diff)
        
        # 检测漂移
        drift_detected = max_diff > self.threshold
        
        return drift_detected, {
            'max_difference': max_diff,
            'mean_difference': mean_diff,
            'reference_importance': self.reference_importance.tolist(),
            'current_importance': current_importance.tolist()
        }

# 使用示例
def example_ml_drift_detection():
    """机器学习漂移检测示例"""
    # 生成示例数据
    np.random.seed(42)
    
    # 参考数据
    X_reference = np.random.randn(1000, 5)
    y_reference = (X_reference[:, 0] + X_reference[:, 1] > 0).astype(int)
    
    # 当前数据（模拟漂移）
    X_current = np.random.randn(500, 5) + np.array([1, 0, 0, 0, 0])  # 第一个特征均值偏移
    y_current = (X_current[:, 0] + X_current[:, 1] > 1).astype(int)  # 标签分布变化
    
    print("=== 基于分类器的漂移检测 ===")
    # 基于分类器的检测
    ml_detector = MLBasedDriftDetector(threshold=0.6)
    ml_detector.fit_reference(X_reference)
    drift_detected, drift_score = ml_detector.detect_drift(X_current)
    print(f"检测结果: {'检测到漂移' if drift_detected else '未检测到漂移'}")
    print(f"漂移分数: {drift_score:.3f}")
    
    print("\n=== 基于特征重要性的漂移检测 ===")
    # 基于特征重要性的检测
    fi_detector = FeatureImportanceDriftDetector(threshold=0.15)
    fi_detector.establish_baseline(X_reference, y_reference)
    drift_detected, details = fi_detector.detect_importance_drift(X_current, y_current)
    print(f"检测结果: {'检测到漂移' if drift_detected else '未检测到漂移'}")
    print(f"最大差异: {details['max_difference']:.3f}")
    print(f"平均差异: {details['mean_difference']:.3f}")
    
    print("\n特征重要性对比:")
    print("特征\t参考重要性\t当前重要性\t差异")
    for i, (ref_imp, curr_imp) in enumerate(zip(
        details['reference_importance'], 
        details['current_importance']
    )):
        diff = abs(ref_imp - curr_imp)
        print(f"{i+1}\t{ref_imp:.3f}\t\t{curr_imp:.3f}\t\t{diff:.3f}")

# 运行示例
# example_ml_drift_detection()
```

## 三、自动预警机制

### 3.1 预警策略设计

有效的预警机制需要结合业务特点和风险承受能力，设计合理的预警策略。

#### 3.1.1 多级预警体系

**预警分级管理**：
```python
# 多级预警体系
from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Optional, Callable
import time
import json

class WarningLevel(Enum):
    """预警级别"""
    NORMAL = "normal"      # 正常
    ATTENTION = "attention"  # 关注
    WARNING = "warning"    # 警告
    ALERT = "alert"        # 警报
    CRITICAL = "critical"  # 严重

@dataclass
class WarningRule:
    """预警规则"""
    name: str
    level: WarningLevel
    condition: Callable
    description: str
    cooldown_period: int = 300  # 冷却期（秒）
    last_triggered: float = 0   # 上次触发时间

class WarningSystem:
    """预警系统"""
    
    def __init__(self):
        self.rules = []
        self.active_warnings = {}
        self.warning_history = []
        self.notification_channels = []
    
    def add_rule(self, rule: WarningRule):
        """添加预警规则"""
        self.rules.append(rule)
    
    def add_notification_channel(self, channel: Callable):
        """添加通知渠道"""
        self.notification_channels.append(channel)
    
    def check_warnings(self, metrics: Dict[str, float]) -> List[Dict[str, any]]:
        """
        检查预警
        
        Args:
            metrics: 当前指标
            
        Returns:
            触发的预警列表
        """
        triggered_warnings = []
        current_time = time.time()
        
        for rule in self.rules:
            # 检查冷却期
            if current_time - rule.last_triggered < rule.cooldown_period:
                continue
            
            # 检查条件
            try:
                if rule.condition(metrics):
                    # 创建预警
                    warning = {
                        'rule_name': rule.name,
                        'level': rule.level,
                        'description': rule.description,
                        'metrics': metrics,
                        'timestamp': current_time,
                        'triggered_at': time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    
                    triggered_warnings.append(warning)
                    
                    # 更新最后触发时间
                    rule.last_triggered = current_time
                    
                    # 记录历史
                    self.warning_history.append(warning)
                    
                    # 发送通知
                    self._send_notification(warning)
                    
            except Exception as e:
                print(f"检查预警规则 {rule.name} 时出错: {e}")
        
        return triggered_warnings
    
    def _send_notification(self, warning: Dict[str, any]):
        """发送通知"""
        for channel in self.notification_channels:
            try:
                channel(warning)
            except Exception as e:
                print(f"发送通知失败: {e}")
    
    def get_active_warnings(self) -> Dict[WarningLevel, List[Dict[str, any]]]:
        """获取活跃预警"""
        active_by_level = {level: [] for level in WarningLevel}
        
        current_time = time.time()
        # 保留最近1小时的预警
        recent_warnings = [
            w for w in self.warning_history 
            if current_time - w['timestamp'] < 3600
        ]
        
        for warning in recent_warnings:
            level = WarningLevel(warning['level'])
            active_by_level[level].append(warning)
        
        return active_by_level
    
    def get_warning_statistics(self, hours: int = 24) -> Dict[str, any]:
        """获取预警统计"""
        current_time = time.time()
        cutoff_time = current_time - (hours * 3600)
        
        recent_warnings = [
            w for w in self.warning_history 
            if w['timestamp'] > cutoff_time
        ]
        
        # 按级别统计
        level_counts = {level.value: 0 for level in WarningLevel}
        for warning in recent_warnings:
            level_counts[warning['level'].value] += 1
        
        return {
            'total_warnings': len(recent_warnings),
            'level_distribution': level_counts,
            'most_frequent_rules': self._get_most_frequent_rules(recent_warnings)
        }
    
    def _get_most_frequent_rules(self, warnings: List[Dict[str, any]]) -> List[Dict[str, any]]:
        """获取最频繁的预警规则"""
        rule_counts = {}
        for warning in warnings:
            rule_name = warning['rule_name']
            rule_counts[rule_name] = rule_counts.get(rule_name, 0) + 1
        
        # 按频率排序
        sorted_rules = sorted(rule_counts.items(), key=lambda x: x[1], reverse=True)
        return [{'rule_name': name, 'count': count} for name, count in sorted_rules[:5]]

# 通知渠道实现
def email_notification(warning: Dict[str, any]):
    """邮件通知"""
    print(f"[邮件通知] {warning['level'].value.upper()}: {warning['description']}")
    print(f"时间: {warning['triggered_at']}")
    print(f"指标: {json.dumps(warning['metrics'], indent=2)}")

def slack_notification(warning: Dict[str, any]):
    """Slack通知"""
    print(f"[Slack通知] {warning['level'].value.upper()}: {warning['description']}")

def sms_notification(warning: Dict[str, any]):
    """短信通知"""
    print(f"[短信通知] 严重预警: {warning['description']}")

# 预警规则定义
def create_warning_rules():
    """创建预警规则"""
    rules = [
        WarningRule(
            name="model_accuracy_drop",
            level=WarningLevel.WARNING,
            condition=lambda metrics: metrics.get('accuracy', 1.0) < 0.85,
            description="模型准确率下降",
            cooldown_period=600
        ),
        WarningRule(
            name="high_false_positive_rate",
            level=WarningLevel.ALERT,
            condition=lambda metrics: metrics.get('false_positive_rate', 0.0) > 0.1,
            description="误报率过高",
            cooldown_period=300
        ),
        WarningRule(
            name="data_drift_detected",
            level=WarningLevel.WARNING,
            condition=lambda metrics: metrics.get('data_drift_score', 0.0) > 0.1,
            description="检测到数据漂移",
            cooldown_period=900
        ),
        WarningRule(
            name="model_performance_critical",
            level=WarningLevel.CRITICAL,
            condition=lambda metrics: (
                metrics.get('accuracy', 1.0) < 0.7 and 
                metrics.get('recall', 1.0) < 0.7
            ),
            description="模型性能严重下降",
            cooldown_period=300
        )
    ]
    return rules

# 使用示例
def example_warning_system():
    """预警系统示例"""
    # 初始化预警系统
    warning_system = WarningSystem()
    
    # 添加预警规则
    rules = create_warning_rules()
    for rule in rules:
        warning_system.add_rule(rule)
    
    # 添加通知渠道
    warning_system.add_notification_channel(email_notification)
    warning_system.add_notification_channel(slack_notification)
    warning_system.add_notification_channel(sms_notification)
    
    # 模拟监控循环
    print("启动预警监控...")
    
    # 模拟不同的指标数据
    test_metrics = [
        {'accuracy': 0.92, 'recall': 0.88, 'false_positive_rate': 0.05, 'data_drift_score': 0.02},
        {'accuracy': 0.82, 'recall': 0.78, 'false_positive_rate': 0.08, 'data_drift_score': 0.05},
        {'accuracy': 0.75, 'recall': 0.70, 'false_positive_rate': 0.12, 'data_drift_score': 0.15},
        {'accuracy': 0.65, 'recall': 0.60, 'false_positive_rate': 0.18, 'data_drift_score': 0.25},
    ]
    
    for i, metrics in enumerate(test_metrics):
        print(f"\n--- 第 {i+1} 轮检查 ---")
        print(f"当前指标: {metrics}")
        
        # 检查预警
        warnings = warning_system.check_warnings(metrics)
        
        if warnings:
            print(f"触发 {len(warnings)} 个预警:")
            for warning in warnings:
                print(f"  - {warning['level'].value.upper()}: {warning['description']}")
        else:
            print("无预警触发")
        
        # 显示活跃预警
        active_warnings = warning_system.get_active_warnings()
        active_count = sum(len(warnings) for warnings in active_warnings.values())
        print(f"活跃预警总数: {active_count}")
        
        time.sleep(1)  # 模拟时间间隔

# 运行示例
# example_warning_system()
```

### 3.2 智能预警优化

#### 3.2.1 预警抑制与聚合

**智能预警处理**：
```python
# 智能预警处理
from collections import defaultdict
import hashlib

class SmartWarningSystem:
    """智能预警系统"""
    
    def __init__(self):
        self.warning_system = WarningSystem()
        self.suppression_rules = []
        self.warning_groups = defaultdict(list)
        self.suppressed_warnings = []
    
    def add_suppression_rule(self, rule: Callable):
        """添加抑制规则"""
        self.suppression_rules.append(rule)
    
    def check_warnings_with_suppression(self, metrics: Dict[str, float]) -> List[Dict[str, any]]:
        """
        检查预警并应用抑制规则
        
        Args:
            metrics: 当前指标
            
        Returns:
            未被抑制的预警列表
        """
        # 获取所有预警
        all_warnings = self.warning_system.check_warnings(metrics)
        
        # 应用抑制规则
        active_warnings = []
        for warning in all_warnings:
            suppressed = False
            suppression_reason = None
            
            # 检查所有抑制规则
            for rule in self.suppression_rules:
                try:
                    result = rule(warning, metrics)
                    if result['suppressed']:
                        suppressed = True
                        suppression_reason = result['reason']
                        break
                except Exception as e:
                    print(f"抑制规则检查失败: {e}")
            
            if suppressed:
                # 记录被抑制的预警
                suppressed_warning = warning.copy()
                suppressed_warning['suppression_reason'] = suppression_reason
                self.suppressed_warnings.append(suppressed_warning)
                print(f"预警被抑制: {warning['description']} - 原因: {suppression_reason}")
            else:
                active_warnings.append(warning)
        
        # 警预警聚合
        aggregated_warnings = self._aggregate_warnings(active_warnings)
        
        return aggregated_warnings
    
    def _aggregate_warnings(self, warnings: List[Dict[str, any]]) -> List[Dict[str, any]]:
        """
        聚合相似预警
        
        Args:
            warnings: 预警列表
            
        Returns:
            聚合后的预警列表
        """
        if not warnings:
            return []
        
        # 按规则名称和级别分组
        grouped_warnings = defaultdict(list)
        for warning in warnings:
            key = f"{warning['rule_name']}_{warning['level'].value}"
            grouped_warnings[key].append(warning)
        
        # 对每组进行聚合
        aggregated = []
        for key, group in grouped_warnings.items():
            if len(group) == 1:
                # 单个预警，直接添加
                aggregated.append(group[0])
            else:
                # 多个相似预警，聚合为一个
                primary_warning = group[0]
                aggregated_warning = primary_warning.copy()
                aggregated_warning['description'] = f"{primary_warning['description']} (共{len(group)}个相似预警)"
                aggregated_warning['aggregated_count'] = len(group)
                aggregated_warning['aggregated_warnings'] = group
                aggregated.append(aggregated_warning)
        
        return aggregated
    
    def group_warnings_by_correlation(self, warnings: List[Dict[str, any]]) -> Dict[str, List[Dict[str, any]]]:
        """
        按相关性分组预警
        
        Args:
            warnings: 预警列表
            
        Returns:
            按相关性分组的预警
        """
        groups = defaultdict(list)
        
        for warning in warnings:
            # 基于预警内容生成分组键
            content = f"{warning['description']}_{str(warning['metrics'])}"
            group_key = hashlib.md5(content.encode()).hexdigest()[:8]
            groups[group_key].append(warning)
        
        return dict(groups)

# 抑制规则示例
def create_suppression_rules():
    """创建抑制规则"""
    def suppress_low_impact_if_high_impact_exists(warning: Dict[str, any], metrics: Dict[str, float]) -> Dict[str, any]:
        """如果有高影响预警，则抑制低影响预警"""
        if warning['level'] == WarningLevel.WARNING:
            # 检查是否存在更高级别的预警
            critical_warnings = [
                w for w in [warning]  # 这里应该是当前所有预警
                if w['level'] in [WarningLevel.ALERT, WarningLevel.CRITICAL]
            ]
            if critical_warnings:
                return {
                    'suppressed': True,
                    'reason': '存在更高级别的预警，抑制低级别预警'
                }
        return {'suppressed': False, 'reason': ''}
    
    def suppress_frequent_warnings(warning: Dict[str, any], metrics: Dict[str, float]) -> Dict[str, any]:
        """抑制频繁触发的预警"""
        # 这里应该检查历史预警频率
        # 简化实现
        if 'frequent' in warning['description'].lower():
            return {
                'suppressed': True,
                'reason': '预警过于频繁，暂时抑制'
            }
        return {'suppressed': False, 'reason': ''}
    
    return [suppress_low_impact_if_high_impact_exists, suppress_frequent_warnings]

# 使用示例
def example_smart_warning_system():
    """智能预警系统示例"""
    # 初始化智能预警系统
    smart_system = SmartWarningSystem()
    
    # 添加预警规则
    rules = create_warning_rules()
    for rule in rules:
        smart_system.warning_system.add_rule(rule)
    
    # 添加通知渠道
    smart_system.warning_system.add_notification_channel(email_notification)
    
    # 添加抑制规则
    suppression_rules = create_suppression_rules()
    for rule in suppression_rules:
        smart_system.add_suppression_rule(rule)
    
    # 模拟监控数据
    test_scenarios = [
        # 场景1：正常情况
        [
            {'accuracy': 0.95, 'recall': 0.90, 'false_positive_rate': 0.03},
        ],
        # 场景2：多个相关预警
        [
            {'accuracy': 0.82, 'recall': 0.78, 'false_positive_rate': 0.08},  # WARNING
            {'accuracy': 0.75, 'recall': 0.70, 'false_positive_rate': 0.12},  # WARNING
        ],
        # 场景3：混合级别预警
        [
            {'accuracy': 0.85, 'recall': 0.80, 'false_positive_rate': 0.06},  # WARNING
            {'accuracy': 0.65, 'recall': 0.60, 'false_positive_rate': 0.18},  # CRITICAL
        ]
    ]
    
    for i, scenario in enumerate(test_scenarios):
        print(f"\n=== 场景 {i+1} ===")
        for j, metrics in enumerate(scenario):
            print(f"\n第 {j+1} 轮检查:")
            print(f"指标: {metrics}")
            
            # 智能预警检查
            warnings = smart_system.check_warnings_with_suppression(metrics)
            
            if warnings:
                print(f"触发 {len(warnings)} 个预警:")
                for k, warning in enumerate(warnings):
                    print(f"  {k+1}. {warning['level'].value.upper()}: {warning['description']}")
                    if 'aggregated_count' in warning:
                        print(f"     (聚合了 {warning['aggregated_count']} 个相似预警)")
            else:
                print("无活跃预警")
        
        # 显示相关性分组
        # 这里简化处理，实际应该收集所有预警进行分组

# 运行示例
# example_smart_warning_system()
```

## 四、持续学习机制

### 4.1 在线学习策略

持续学习是保持模型性能的关键，特别是在数据分布快速变化的风控场景中。

#### 4.1.1 增量学习

**增量学习实现**：
```python
# 增量学习机制
import numpy as np
from sklearn.linear_model import SGDClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from typing import List, Tuple, Optional
import joblib

class IncrementalLearningModel:
    """增量学习模型"""
    
    def __init__(self, model_type: str = 'sgd', **kwargs):
        self.model_type = model_type
        self.model = self._create_model(model_type, **kwargs)
        self.is_fitted = False
        self.training_history = []
        self.performance_history = []
    
    def _create_model(self, model_type: str, **kwargs):
        """创建模型"""
        if model_type == 'sgd':
            return SGDClassifier(
                loss='log',  # 逻辑回归损失
                learning_rate='adaptive',
                eta0=0.01,
                random_state=42,
                **kwargs
            )
        elif model_type == 'rf':
            return RandomForestClassifier(
                n_estimators=10,
                warm_start=True,
                random_state=42,
                **kwargs
            )
        else:
            raise ValueError(f"不支持的模型类型: {model_type}")
    
    def partial_fit(self, X: np.ndarray, y: np.ndarray, classes: Optional[np.ndarray] = None):
        """
        增量训练
        
        Args:
            X: 特征数据
            y: 标签数据
            classes: 类别列表（首次训练时需要）
        """
        if self.model_type == 'sgd':
            if not self.is_fitted:
                self.model.partial_fit(X, y, classes=classes)
                self.is_fitted = True
            else:
                self.model.partial_fit(X, y)
        elif self.model_type == 'rf':
            # RandomForest不直接支持partial_fit，需要特殊处理
            if not self.is_fitted:
                self.model.fit(X, y)
                self.is_fitted = True
            else:
                # 对于随机森林，我们可以增加树的数量来模拟增量学习
                current_estimators = self.model.n_estimators
                self.model.n_estimators += 5  # 增加5棵树
                self.model.fit(X, y)  # 重新训练（实际应用中可以优化）
        
        # 记录训练历史
        self.training_history.append({
            'samples': len(X),
            'timestamp': time.time(),
            'model_type': self.model_type
        })
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """预测"""
        if not self.is_fitted:
            raise ValueError("模型尚未训练")
        return self.model.predict(X)
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """预测概率"""
        if not self.is_fitted:
            raise ValueError("模型尚未训练")
        return self.model.predict_proba(X)
    
    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """评估模型"""
        if not self.is_fitted:
            raise ValueError("模型尚未训练")
        
        y_pred = self.predict(X)
        accuracy = accuracy_score(y, y_pred)
        
        metrics = {
            'accuracy': accuracy,
            'samples': len(X),
            'timestamp': time.time()
        }
        
        self.performance_history.append(metrics)
        return metrics
    
    def save_model(self, filepath: str):
        """保存模型"""
        joblib.dump(self.model, filepath)
    
    def load_model(self, filepath: str):
        """加载模型"""
        self.model = joblib.load(filepath)
        self.is_fitted = True

# 在线学习框架
class OnlineLearningFramework:
    """在线学习框架"""
    
    def __init__(self, model: IncrementalLearningModel, 
                 evaluation_window: int = 1000,
                 retrain_threshold: float = 0.05):
        self.model = model
        self.evaluation_window = evaluation_window
        self.retrain_threshold = retrain_threshold
        self.feedback_buffer = []
        self.classes = None
    
    def add_feedback(self, X: np.ndarray, y: np.ndarray, 
                    prediction: Optional[np.ndarray] = None,
                    confidence: Optional[np.ndarray] = None):
        """
        添加反馈数据
        
        Args:
            X: 特征数据
            y: 真实标签
            prediction: 模型预测（可选）
            confidence: 预测置信度（可选）
        """
        # 存储反馈数据
        feedback_entry = {
            'X': X,
            'y': y,
            'prediction': prediction,
            'confidence': confidence,
            'timestamp': time.time()
        }
        self.feedback_buffer.append(feedback_entry)
        
        # 如果提供了预测和置信度，可以进行选择性学习
        if prediction is not None and confidence is not None:
            self._selective_learning(X, y, prediction, confidence)
        else:
            # 直接进行增量学习
            self._incremental_learning(X, y)
    
    def _selective_learning(self, X: np.ndarray, y: np.ndarray,
                          prediction: np.ndarray, confidence: np.ndarray):
        """选择性学习"""
        # 选择置信度低或预测错误的样本进行学习
        mask = np.logical_or(
            confidence < 0.8,  # 置信度低的样本
            prediction != y    # 预测错误的样本
        )
        
        if np.any(mask):
            X_selected = X[mask]
            y_selected = y[mask]
            self._incremental_learning(X_selected, y_selected)
    
    def _incremental_learning(self, X: np.ndarray, y: np.ndarray):
        """增量学习"""
        # 更新类别信息
        if self.classes is None:
            self.classes = np.unique(y)
        
        # 执行增量训练
        self.model.partial_fit(X, y, classes=self.classes)
        
        print(f"增量学习完成: {len(X)} 个样本")
    
    def periodic_retrain(self, X_batch: np.ndarray, y_batch: np.ndarray) -> Dict[str, any]:
        """
        周期性重训练
        
        Args:
            X_batch: 批量特征数据
            y_batch: 批量标签数据
            
        Returns:
            重训练结果
        """
        if not self.model.is_fitted:
            # 首次训练
            self.model.partial_fit(X_batch, y_batch, classes=np.unique(y_batch))
            return {'action': 'initial_training', 'samples': len(X_batch)}
        
        # 评估当前性能
        try:
            current_metrics = self.model.evaluate(X_batch, y_batch)
            print(f"当前模型准确率: {current_metrics['accuracy']:.3f}")
            
            # 如果性能下降超过阈值，触发重训练
            if (len(self.model.performance_history) > 1 and 
                current_metrics['accuracy'] < self.retrain_threshold):
                
                print("检测到性能下降，触发重训练...")
                self.model.partial_fit(X_batch, y_batch)
                return {'action': 'retrain', 'samples': len(X_batch)}
            else:
                # 增量学习
                self.model.partial_fit(X_batch, y_batch)
                return {'action': 'incremental_learning', 'samples': len(X_batch)}
                
        except Exception as e:
            print(f"评估或重训练失败: {e}")
            # 降级到增量学习
            self.model.partial_fit(X_batch, y_batch)
            return {'action': 'incremental_learning', 'samples': len(X_batch)}

# 使用示例
def example_incremental_learning():
    """增量学习示例"""
    # 创建增量学习模型
    model = IncrementalLearningModel(model_type='sgd')
    framework = OnlineLearningFramework(model, retrain_threshold=0.8)
    
    # 生成初始训练数据
    np.random.seed(42)
    X_initial = np.random.randn(1000, 5)
    y_initial = (X_initial[:, 0] + X_initial[:, 1] > 0).astype(int)
    
    print("=== 初始训练 ===")
    framework.periodic_retrain(X_initial, y_initial)
    
    # 模拟在线学习过程
    print("\n=== 在线学习过程 ===")
    for i in range(5):
        # 生成新数据
        X_new = np.random.randn(200, 5)
        y_new = (X_new[:, 0] + X_new[:, 1] > 0).astype(int)
        
        # 添加一些噪声来模拟概念漂移
        if i >= 3:
            X_new[:, 0] += 1  # 特征偏移
        
        # 模拟预测
        try:
            y_pred = model.predict(X_new)
            y_prob = model.predict_proba(X_new)
            confidence = np.max(y_prob, axis=1)
        except:
            y_pred = None
            confidence = None
        
        # 添加反馈
        framework.add_feedback(X_new, y_new, y_pred, confidence)
        
        # 评估性能
        try:
            metrics = model.evaluate(X_new, y_new)
            print(f"轮次 {i+1}: 准确率 {metrics['accuracy']:.3f}")
        except:
            print(f"轮次 {i+1}: 评估失败")
        
        time.sleep(0.1)  # 模拟时间间隔

# 运行示例
# example_incremental_learning()
```

#### 4.1.2 联邦学习

**联邦学习框架**：
```python
# 联邦学习实现
import numpy as np
from typing import List, Dict, Any
import hashlib
import json

class FederatedLearningClient:
    """联邦学习客户端"""
    
    def __init__(self, client_id: str, model: IncrementalLearningModel):
        self.client_id = client_id
        self.model = model
        self.local_data = []
        self.local_weights = None
    
    def add_local_data(self, X: np.ndarray, y: np.ndarray):
        """添加本地数据"""
        self.local_data.append((X, y))
    
    def local_training(self, epochs: int = 1) -> Dict[str, Any]:
        """本地训练"""
        if not self.local_data:
            return {'status': 'no_data', 'client_id': self.client_id}
        
        # 合并本地数据
        X_combined = np.vstack([X for X, _ in self.local_data])
        y_combined = np.hstack([y for _, y in self.local_data])
        
        # 执行本地训练
        for _ in range(epochs):
            self.model.partial_fit(X_combined, y_combined)
        
        # 获取模型参数
        weights = self._get_model_weights()
        
        return {
            'status': 'success',
            'client_id': self.client_id,
            'weights': weights,
            'samples': len(X_combined),
            'timestamp': time.time()
        }
    
    def _get_model_weights(self) -> Dict[str, np.ndarray]:
        """获取模型权重"""
        if hasattr(self.model.model, 'coef_'):
            return {
                'coef': self.model.model.coef_.copy(),
                'intercept': self.model.model.intercept_.copy()
            }
        else:
            # 对于不支持直接访问权重的模型，返回空字典
            return {}
    
    def update_model_weights(self, global_weights: Dict[str, np.ndarray]):
        """更新模型权重"""
        if hasattr(self.model.model, 'coef_') and 'coef' in global_weights:
            self.model.model.coef_ = global_weights['coef'].copy()
            self.model.model.intercept_ = global_weights['intercept'].copy()
            self.model.is_fitted = True

class FederatedLearningServer:
    """联邦学习服务器"""
    
    def __init__(self, aggregation_method: str = 'fedavg'):
        self.clients = {}
        self.global_model = None
        self.aggregation_method = aggregation_method
        self.round_history = []
    
    def register_client(self, client: FederatedLearningClient):
        """注册客户端"""
        self.clients[client.client_id] = client
        print(f"客户端 {client.client_id} 已注册")
    
    def broadcast_global_weights(self, global_weights: Dict[str, np.ndarray]):
        """广播全局权重"""
        for client in self.clients.values():
            client.update_model_weights(global_weights)
        print(f"已向 {len(self.clients)} 个客户端广播全局权重")
    
    def aggregate_weights(self, client_weights: List[Dict[str, Any]]) -> Dict[str, np.ndarray]:
        """
        聚合客户端权重
        
        Args:
            client_weights: 客户端权重列表
            
        Returns:
            聚合后的全局权重
        """
        if not client_weights:
            return {}
        
        if self.aggregation_method == 'fedavg':
            return self._federated_averaging(client_weights)
        elif self.aggregation_method == 'fedprox':
            return self._federated_proximal(client_weights)
        else:
            raise ValueError(f"不支持的聚合方法: {self.aggregation_method}")
    
    def _federated_averaging(self, client_weights: List[Dict[str, Any]]) -> Dict[str, np.ndarray]:
        """联邦平均聚合"""
        if not client_weights or 'weights' not in client_weights[0]:
            return {}
        
        # 计算总样本数
        total_samples = sum(weight_info['samples'] for weight_info in client_weights)
        
        # 初始化聚合权重
        aggregated_weights = {}
        first_weights = client_weights[0]['weights']
        
        for key in first_weights.keys():
            aggregated_weights[key] = np.zeros_like(first_weights[key])
        
        # 加权平均
        for weight_info in client_weights:
            weights = weight_info['weights']
            samples = weight_info['samples']
            weight_factor = samples / total_samples
            
            for key in weights.keys():
                aggregated_weights[key] += weights[key] * weight_factor
        
        return aggregated_weights
    
    def _federated_proximal(self, client_weights: List[Dict[str, Any]]) -> Dict[str, np.ndarray]:
        """联邦近端聚合（简化版）"""
        # 这里简化实现，实际应该考虑近端项
        return self._federated_averaging(client_weights)
    
    def run_federated_round(self) -> Dict[str, Any]:
        """运行一轮联邦学习"""
        print("开始联邦学习轮次...")
        
        # 1. 客户端本地训练
        client_updates = []
        for client_id, client in self.clients.items():
            print(f"客户端 {client_id} 进行本地训练...")
            update = client.local_training(epochs=1)
            if update['status'] == 'success':
                client_updates.append(update)
        
        if not client_updates:
            return {'status': 'failed', 'reason': '没有客户端成功完成训练'}
        
        # 2. 聚合权重
        global_weights = self.aggregate_weights(client_updates)
        print(f"聚合完成，共 {len(client_updates)} 个客户端参与")
        
        # 3. 广播全局权重
        self.broadcast_global_weights(global_weights)
        
        # 4. 记录轮次历史
        round_info = {
            'round': len(self.round_history) + 1,
            'participants': len(client_updates),
            'timestamp': time.time(),
            'global_weights': global_weights
        }
        self.round_history.append(round_info)
        
        return {'status': 'success', 'round_info': round_info}

# 使用示例
def example_federated_learning():
    """联邦学习示例"""
    # 创建联邦学习服务器
    server = FederatedLearningServer(aggregation_method='fedavg')
    
    # 创建客户端
    clients_data = [
        ('client_1', np.random.randn(500, 5), np.random.randint(0, 2, 500)),
        ('client_2', np.random.randn(300, 5), np.random.randint(0, 2, 300)),
        ('client_3', np.random.randn(400, 5), np.random.randint(0, 2, 400)),
    ]
    
    clients = []
    for client_id, X, y in clients_data:
        model = IncrementalLearningModel(model_type='sgd')
        client = FederatedLearningClient(client_id, model)
        client.add_local_data(X, y)
        clients.append(client)
        server.register_client(client)
    
    # 运行几轮联邦学习
    print("=== 联邦学习过程 ===")
    for round_num in range(3):
        print(f"\n--- 第 {round_num + 1} 轮 ---")
        result = server.run_federated_round()
        
        if result['status'] == 'success':
            round_info = result['round_info']
            print(f"轮次 {round_info['round']} 完成")
            print(f"参与客户端数: {round_info['participants']}")
        else:
            print(f"轮次失败: {result.get('reason', '未知错误')}")
        
        time.sleep(1)  # 模拟时间间隔

# 运行示例
# example_federated_learning()
```

## 五、模型迭代管理

### 5.1 迭代流程设计

模型迭代是保持模型性能的重要手段，需要建立标准化的迭代流程。

#### 5.1.1 自动化迭代管道

**迭代管道实现**：
```python
# 模型迭代管道
import asyncio
import time
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum

class IterationStage(Enum):
    """迭代阶段"""
    TRIGGERED = "triggered"      # 已触发
    DATA_PREP = "data_preparation"  # 数据准备
    TRAINING = "training"        # 训练
    EVALUATION = "evaluation"    # 评估
    VALIDATION = "validation"    # 验证
    DEPLOYMENT = "deployment"    # 部署
    COMPLETED = "completed"      # 完成
    FAILED = "failed"            # 失败

@dataclass
class IterationContext:
    """迭代上下文"""
    iteration_id: str
    trigger_reason: str
    model_name: str
    current_version: str
    new_version: str
    data_time_range: tuple
    parameters: Dict[str, any]

class ModelIterationPipeline:
    """模型迭代管道"""
    
    def __init__(self):
        self.stages = []
        self.context = None
        self.current_stage = None
        self.stage_results = {}
        self.callbacks = {}
    
    def add_stage(self, stage_name: IterationStage, handler: Callable):
        """添加迭代阶段"""
        self.stages.append((stage_name, handler))
    
    def add_callback(self, event: str, callback: Callable):
        """添加回调函数"""
        if event not in self.callbacks:
            self.callbacks[event] = []
        self.callbacks[event].append(callback)
    
    def _trigger_callbacks(self, event: str, *args, **kwargs):
        """触发回调函数"""
        if event in self.callbacks:
            for callback in self.callbacks[event]:
                try:
                    callback(*args, **kwargs)
                except Exception as e:
                    print(f"回调函数 {callback.__name__} 执行失败: {e}")
    
    async def run_iteration(self, context: IterationContext) -> Dict[str, any]:
        """
        运行迭代
        
        Args:
            context: 迭代上下文
            
        Returns:
            迭代结果
        """
        self.context = context
        self.current_stage = IterationStage.TRIGGERED
        self.stage_results = {}
        
        print(f"开始模型迭代: {context.iteration_id}")
        print(f"触发原因: {context.trigger_reason}")
        print(f"模型: {context.model_name} ({context.current_version} -> {context.new_version})")
        
        # 触发开始回调
        self._trigger_callbacks('iteration_started', context)
        
        try:
            # 依次执行各阶段
            for stage_name, handler in self.stages:
                self.current_stage = stage_name
                print(f"\n执行阶段: {stage_name.value}")
                
                # 触发阶段开始回调
                self._trigger_callbacks('stage_started', stage_name, context)
                
                # 执行阶段处理函数
                start_time = time.time()
                result = await handler(context, self.stage_results)
                elapsed_time = time.time() - start_time
                
                # 保存阶段结果
                self.stage_results[stage_name.value] = {
                    'result': result,
                    'elapsed_time': elapsed_time,
                    'timestamp': time.time()
                }
                
                print(f"阶段 {stage_name.value} 完成，耗时: {elapsed_time:.2f}秒")
                
                # 触发阶段完成回调
                self._trigger_callbacks('stage_completed', stage_name, result, context)
                
                # 检查阶段是否成功
                if result.get('status') == 'failed':
                    raise Exception(f"阶段 {stage_name.value} 失败: {result.get('error')}")
            
            self.current_stage = IterationStage.COMPLETED
            print(f"\n模型迭代 {context.iteration_id} 完成!")
            
            # 触发完成回调
            self._trigger_callbacks('iteration_completed', context, self.stage_results)
            
            return {
                'status': 'success',
                'iteration_id': context.iteration_id,
                'final_stage': IterationStage.COMPLETED.value,
                'results': self.stage_results
            }
            
        except Exception as e:
            self.current_stage = IterationStage.FAILED
            error_msg = f"迭代失败在阶段 {self.current_stage.value}: {str(e)}"
            print(f"\n{error_msg}")
            
            # 触发失败回调
            self._trigger_callbacks('iteration_failed', context, str(e))
            
            return {
                'status': 'failed',
                'iteration_id': context.iteration_id,
                'failed_stage': self.current_stage.value,
                'error': str(e),
                'results': self.stage_results
            }

# 迭代阶段处理器示例
async def data_preparation_stage(context: IterationContext, previous_results: Dict) -> Dict[str, any]:
    """数据准备阶段"""
    print("准备训练数据...")
    
    # 模拟数据准备过程
    await asyncio.sleep(2)
    
    # 模拟数据准备结果
    data_info = {
        'train_samples': 50000,
        'validation_samples': 10000,
        'test_samples': 5000,
        'features': 50,
        'positive_rate': 0.15
    }
    
    print(f"数据准备完成: {data_info['train_samples']} 训练样本")
    
    return {
        'status': 'success',
        'data_info': data_info
    }

async def training_stage(context: IterationContext, previous_results: Dict) -> Dict[str, any]:
    """模型训练阶段"""
    print("开始模型训练...")
    
    # 获取数据信息
    data_info = previous_results.get('data_preparation', {}).get('data_info', {})
    print(f"使用 {data_info.get('train_samples', 0)} 个样本进行训练")
    
    # 模拟训练过程
    for epoch in range(5):
        print(f"训练轮次 {epoch + 1}/5")
        await asyncio.sleep(1)  # 模拟训练时间
    
    # 模拟训练结果
    model_metrics = {
        'train_loss': 0.25,
        'validation_loss': 0.32,
        'accuracy': 0.92,
        'precision': 0.88,
        'recall': 0.90,
        'f1_score': 0.89
    }
    
    print(f"训练完成，验证集F1分数: {model_metrics['f1_score']:.3f}")
    
    return {
        'status': 'success',
        'model_metrics': model_metrics,
        'model_path': f"models/{context.model_name}_v{context.new_version}.pkl"
    }

async def evaluation_stage(context: IterationContext, previous_results: Dict) -> Dict[str, any]:
    """模型评估阶段"""
    print("开始模型评估...")
    
    # 获取训练结果
    training_result = previous_results.get('training', {})
    model_metrics = training_result.get('model_metrics', {})
    
    print(f"评估模型性能: 准确率={model_metrics.get('accuracy', 0):.3f}")
    
    # 模拟评估过程
    await asyncio.sleep(1)
    
    # 检查性能是否满足要求
    min_accuracy = 0.90
    min_f1_score = 0.85
    
    if (model_metrics.get('accuracy', 0) >= min_accuracy and 
        model_metrics.get('f1_score', 0) >= min_f1_score):
        
        print("模型性能满足要求")
        return {
            'status': 'success',
            'evaluation_result': 'passed',
            'metrics': model_metrics
        }
    else:
        print("模型性能不满足要求")
        return {
            'status': 'failed',
            'evaluation_result': 'failed',
            'metrics': model_metrics,
            'error': f"模型性能不满足要求 (准确率>={min_accuracy}, F1>={min_f1_score})"
        }

async def deployment_stage(context: IterationContext, previous_results: Dict) -> Dict[str, any]:
    """模型部署阶段"""
    print("开始模型部署...")
    
    # 模拟部署过程
    await asyncio.sleep(2)
    
    # 模拟部署结果
    deployment_info = {
        'deployment_status': 'success',
        'deployed_version': context.new_version,
        'deployment_time': time.time(),
        'rollback_version': context.current_version
    }
    
    print(f"模型部署完成，新版本: {context.new_version}")
    
    return {
        'status': 'success',
        'deployment_info': deployment_info
    }

# 回调函数示例
def iteration_started_callback(context: IterationContext):
    """迭代开始回调"""
    print(f"[回调] 迭代开始: {context.iteration_id}")

def stage_completed_callback(stage: IterationStage, result: Dict, context: IterationContext):
    """阶段完成回调"""
    if result.get('status') == 'success':
        print(f"[回调] 阶段 {stage.value} 成功完成")
    else:
        print(f"[回调] 阶段 {stage.value} 失败: {result.get('error')}")

def iteration_completed_callback(context: IterationContext, results: Dict):
    """迭代完成回调"""
    print(f"[回调] 迭代 {context.iteration_id} 成功完成")
    # 可以在这里发送通知、记录日志等

# 使用示例
async def example_model_iteration():
    """模型迭代示例"""
    # 创建迭代管道
    pipeline = ModelIterationPipeline()
    
    # 添加迭代阶段
    pipeline.add_stage(IterationStage.DATA_PREP, data_preparation_stage)
    pipeline.add_stage(IterationStage.TRAINING, training_stage)
    pipeline.add_stage(IterationStage.EVALUATION, evaluation_stage)
    pipeline.add_stage(IterationStage.DEPLOYMENT, deployment_stage)
    
    # 添加回调函数
    pipeline.add_callback('iteration_started', iteration_started_callback)
    pipeline.add_callback('stage_completed', stage_completed_callback)
    pipeline.add_callback('iteration_completed', iteration_completed_callback)
    
    # 创建迭代上下文
    context = IterationContext(
        iteration_id=f"iteration_{int(time.time())}",
        trigger_reason="性能下降预警",
        model_name="fraud_detection_model",
        current_version="1.2.0",
        new_version="1.3.0",
        data_time_range=("2025-08-01", "2025-09-01"),
        parameters={'learning_rate': 0.001, 'batch_size': 32}
    )
    
    # 运行迭代
    print("=== 模型迭代管道 ===")
    result = await pipeline.run_iteration(context)
    
    print(f"\n迭代结果: {result['status']}")
    if result['status'] == 'success':
        print("模型迭代成功完成!")
    else:
        print(f"迭代失败: {result.get('error')}")

# 运行示例
# asyncio.run(example_model_iteration())
```

### 5.2 A/B测试与灰度发布

#### 5.2.1 智能分流策略

**A/B测试框架**：
```python
# A/B测试框架
import hashlib
import random
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum

class TestGroup(Enum):
    """测试组"""
    CONTROL = "A"      # 对照组
    TREATMENT = "B"    # 实验组

@dataclass
class ABTestConfig:
    """A/B测试配置"""
    test_id: str
    model_a: str  # 对照组模型
    model_b: str  # 实验组模型
    traffic_ratio: float  # 实验组流量比例 (0-1)
    start_time: float
    end_time: Optional[float] = None
    metrics: List[str] = None

class ABTestManager:
    """A/B测试管理器"""
    
    def __init__(self):
        self.tests = {}
        self.user_assignments = {}  # 用户分配记录
        self.test_results = {}      # 测试结果
    
    def create_test(self, config: ABTestConfig):
        """创建A/B测试"""
        self.tests[config.test_id] = config
        self.test_results[config.test_id] = {
            'assignments': {TestGroup.CONTROL.value: 0, TestGroup.TREATMENT.value: 0},
            'predictions': {TestGroup.CONTROL.value: [], TestGroup.TREATMENT.value: []},
            'feedback': {TestGroup.CONTROL.value: [], TestGroup.TREATMENT.value: []}
        }
        print(f"A/B测试 {config.test_id} 已创建")
        print(f"流量分配: A组 {1-config.traffic_ratio:.1%}, B组 {config.traffic_ratio:.1%}")
    
    def assign_user(self, user_id: str, test_id: str) -> TestGroup:
        """
        为用户分配测试组
        
        Args:
            user_id: 用户ID
            test_id: 测试ID
            
        Returns:
            分配的测试组
        """
        if test_id not in self.tests:
            raise ValueError(f"测试 {test_id} 不存在")
        
        test_config = self.tests[test_id]
        
        # 检查测试时间
        current_time = time.time()
        if current_time < test_config.start_time:
            raise ValueError("测试尚未开始")
        if test_config.end_time and current_time > test_config.end_time:
            raise ValueError("测试已结束")
        
        # 一致性哈希分配，确保用户始终分配到同一组
        hash_value = int(hashlib.md5(f"{test_id}:{user_id}".encode()).hexdigest()[:8], 16)
        assignment_ratio = hash_value % 1000 / 1000.0
        
        group = TestGroup.TREATMENT if assignment_ratio < test_config.traffic_ratio else TestGroup.CONTROL
        
        # 记录分配
        assignment_key = f"{test_id}:{user_id}"
        self.user_assignments[assignment_key] = group
        
        # 更新统计
        self.test_results[test_id]['assignments'][group.value] += 1
        
        return group
    
    def get_user_group(self, user_id: str, test_id: str) -> Optional[TestGroup]:
        """获取用户所属测试组"""
        assignment_key = f"{test_id}:{user_id}"
        return self.user_assignments.get(assignment_key)
    
    def record_prediction(self, test_id: str, group: TestGroup, prediction: float, 
                         features: Optional[List[float]] = None):
        """记录预测结果"""
        if test_id not in self.test_results:
            return
        
        self.test_results[test_id]['predictions'][group.value].append({
            'prediction': prediction,
            'features': features,
            'timestamp': time.time()
        })
    
    def record_feedback(self, test_id: str, group: TestGroup, actual_label: int, 
                       prediction: float, user_id: str):
        """记录反馈结果"""
        if test_id not in self.test_results:
            return
        
        self.test_results[test_id]['feedback'][group.value].append({
            'user_id': user_id,
            'actual_label': actual_label,
            'prediction': prediction,
            'timestamp': time.time()
        })
    
    def get_test_results(self, test_id: str) -> Dict[str, any]:
        """获取测试结果"""
        if test_id not in self.test_results:
            return {}
        
        results = self.test_results[test_id]
        
        # 计算各组指标
        group_metrics = {}
        for group in TestGroup:
            group_key = group.value
            feedback_data = results['feedback'][group_key]
            
            if not feedback_data:
                group_metrics[group_key] = {'samples': 0}
                continue
            
            # 计算准确率
            correct_predictions = sum(
                1 for item in feedback_data 
                if (item['prediction'] > 0.5) == (item['actual_label'] == 1)
            )
            accuracy = correct_predictions / len(feedback_data)
            
            # 计算平均预测分数
            avg_prediction = sum(item['prediction'] for item in feedback_data) / len(feedback_data)
            
            group_metrics[group_key] = {
                'samples': len(feedback_data),
                'accuracy': accuracy,
                'avg_prediction': avg_prediction
            }
        
        return {
            'test_id': test_id,
            'assignments': results['assignments'],
            'metrics': group_metrics
        }
    
    def is_test_significant(self, test_id: str, p_threshold: float = 0.05) -> bool:
        """检查测试结果是否显著"""
        results = self.get_test_results(test_id)
        if not results:
            return False
        
        metrics = results['metrics']
        group_a = metrics.get(TestGroup.CONTROL.value, {})
        group_b = metrics.get(TestGroup.TREATMENT.value, {})
        
        if group_a.get('samples', 0) < 30 or group_b.get('samples', 0) < 30:
            return False  # 样本量不足
        
        # 简化的显著性检验（实际应用中应使用统计检验方法）
        accuracy_a = group_a.get('accuracy', 0)
        accuracy_b = group_b.get('accuracy', 0)
        diff = abs(accuracy_a - accuracy_b)
        
        # 简单的阈值判断
        return diff > 0.02  # 准确率差异超过2%认为显著

# 智能路由
class IntelligentRouter:
    """智能路由"""
    
    def __init__(self, ab_test_manager: ABTestManager):
        self.ab_test_manager = ab_test_manager
        self.models = {}  # 模型缓存
        self.performance_cache = {}  # 性能缓存
    
    def add_model(self, model_id: str, model_instance):
        """添加模型"""
        self.models[model_id] = model_instance
        print(f"模型 {model_id} 已添加到路由")
    
    def predict(self, user_id: str, features: List[float], 
               test_id: Optional[str] = None) -> Dict[str, any]:
        """
        智能预测
        
        Args:
            user_id: 用户ID
            features: 特征数据
            test_id: A/B测试ID（可选）
            
        Returns:
            预测结果
        """
        model_id = "default_model"
        group = TestGroup.CONTROL
        
        # 如果有A/B测试，进行分流
        if test_id:
            try:
                group = self.ab_test_manager.assign_user(user_id, test_id)
                test_config = self.ab_test_manager.tests[test_id]
                
                if group == TestGroup.CONTROL:
                    model_id = test_config.model_a
                else:
                    model_id = test_config.model_b
                    
            except Exception as e:
                print(f"A/B测试分配失败: {e}")
                # 回退到默认模型
                model_id = "default_model"
        
        # 获取模型并预测
        if model_id not in self.models:
            raise ValueError(f"模型 {model_id} 不存在")
        
        model = self.models[model_id]
        prediction = model.predict([features])[0]
        
        # 记录预测结果（用于A/B测试分析）
        if test_id:
            self.ab_test_manager.record_prediction(test_id, group, prediction, features)
        
        return {
            'prediction': prediction,
            'model_id': model_id,
            'test_group': group.value if test_id else None,
            'test_id': test_id
        }
    
    def feedback(self, user_id: str, actual_label: int, prediction_info: Dict[str, any]):
        """反馈处理"""
        test_id = prediction_info.get('test_id')
        test_group = prediction_info.get('test_group')
        prediction = prediction_info.get('prediction')
        
        if test_id and test_group:
            group = TestGroup(test_group)
            self.ab_test_manager.record_feedback(
                test_id, group, actual_label, prediction, user_id
            )

# 使用示例
def example_ab_testing():
    """A/B测试示例"""
    # 初始化组件
    ab_manager = ABTestManager()
    router = IntelligentRouter(ab_manager)
    
    # 添加模型（模拟）
    class MockModel:
        def __init__(self, name: str, accuracy: float):
            self.name = name
            self.accuracy = accuracy
        
        def predict(self, features_list):
            results = []
            for features in features_list:
                # 模拟预测，有一定准确率
                if random.random() < self.accuracy:
                    # 正确预测
                    results.append(random.random() * 0.4 + 0.6 if sum(features) > 0 else random.random() * 0.4)
                else:
                    # 错误预测
                    results.append(random.random() * 0.4 if sum(features) > 0 else random.random() * 0.4 + 0.6)
            return results
    
    router.add_model("model_v1.2", MockModel("model_v1.2", 0.85))
    router.add_model("model_v1.3", MockModel("model_v1.3", 0.88))
    
    # 创建A/B测试
    test_config = ABTestConfig(
        test_id="model_upgrade_test_001",
        model_a="model_v1.2",
        model_b="model_v1.3",
        traffic_ratio=0.5,  # 50%流量到新模型
        start_time=time.time(),
        metrics=['accuracy', 'precision', 'recall']
    )
    
    ab_manager.create_test(test_config)
    
    # 模拟预测和反馈
    print("=== A/B测试运行 ===")
    user_ids = [f"user_{i}" for i in range(1000)]
    features_list = [np.random.randn(10).tolist() for _ in range(1000)]
    actual_labels = [1 if sum(f) > 0 else 0 for f in features_list]
    
    # 进行预测
    for i in range(1000):
        user_id = user_ids[i]
        features = features_list[i]
        actual_label = actual_labels[i]
        
        # 预测
        result = router.predict(user_id, features, test_id="model_upgrade_test_001")
        
        # 模拟反馈（实际应用中来自业务系统）
        router.feedback(user_id, actual_label, result)
        
        # 定期输出进度
        if (i + 1) % 200 == 0:
            results = ab_manager.get_test_results("model_upgrade_test_001")
            print(f"进度: {i+1}/1000")
            if results.get('metrics'):
                metrics = results['metrics']
                print(f"  A组准确率: {metrics.get('A', {}).get('accuracy', 0):.3f} "
                      f"({metrics.get('A', {}).get('samples', 0)} 样本)")
                print(f"  B组准确率: {metrics.get('B', {}).get('accuracy', 0):.3f} "
                      f"({metrics.get('B', {}).get('samples', 0)} 样本)")
    
    # 输出最终结果
    print("\n=== A/B测试最终结果 ===")
    final_results = ab_manager.get_test_results("model_upgrade_test_001")
    print(f"测试ID: {final_results.get('test_id')}")
    print(f"分配统计: {final_results.get('assignments')}")
    
    metrics = final_results.get('metrics', {})
    for group, group_metrics in metrics.items():
        print(f"组 {group}:")
        for metric, value in group_metrics.items():
            print(f"  {metric}: {value}")
    
    # 检查显著性
    is_significant = ab_manager.is_test_significant("model_upgrade_test_001")
    print(f"\n结果是否显著: {'是' if is_significant else '否'}")

# 运行示例
# example_ab_testing()
```

## 总结

模型监控与迭代是智能风控平台持续保持高效防护能力的关键环节。通过建立完善的监控体系、实施有效的概念漂移检测、构建智能的预警机制以及建立标准化的迭代流程，可以确保模型始终处于最佳状态。

关键要点包括：
1. **全面监控**：建立涵盖性能、数据质量、业务指标的多维度监控体系
2. **智能检测**：采用统计方法和机器学习算法及时发现概念漂移
3. **分级预警**：设计合理的预警策略，确保重要问题及时响应
4. **持续学习**：通过增量学习、联邦学习等技术保持模型适应性
5. **规范迭代**：建立自动化的模型迭代管道和A/B测试机制

随着业务环境的不断变化和攻击手段的持续演进，模型监控与迭代体系也需要不断优化和完善，以应对新的挑战和需求。