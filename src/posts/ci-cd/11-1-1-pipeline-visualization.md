---
title: 指标收集与分析: 构建统一的指标体系
date: 2025-08-30
categories: [CICD]
tags: [ci,cd,metrics,monitoring,prometheus,grafana,devops]
published: true
---
在现代CI/CD平台中，指标收集与分析是实现可观测性的基础环节。通过构建统一的指标体系，团队能够全面了解平台运行状态、流水线执行效率以及用户行为模式，从而为优化决策提供数据支撑。本文将深入探讨指标体系设计原则、核心指标定义、收集工具选型以及分析实践方法。

## 指标体系设计原则

构建有效的指标体系需要遵循一系列设计原则，确保指标能够准确反映系统状态并支持业务决策。

### 1. SMART原则

#### Specific（具体性）
指标应该明确定义其含义和计算方式，避免模糊不清：
- **不良示例**："系统性能良好"
- **良好示例**："API平均响应时间小于200ms"

#### Measurable（可度量性）
指标必须能够被量化测量，具有明确的数值表示：
- **不良示例**："用户体验良好"
- **良好示例**："用户页面加载时间平均为1.5秒"

#### Achievable（可达成性）
指标应该设定合理的目标值，既具有挑战性又可实现：
- **不良示例**："系统可用性100%"
- **良好示例**："系统可用性99.9%"

#### Relevant（相关性）
指标应该与业务目标和系统关键性能直接相关：
- **不良示例**："服务器CPU温度"
- **良好示例**："用户请求成功率"

#### Time-bound（有时限性）
指标应该设定明确的时间范围和更新频率：
- **不良示例**："提高系统性能"
- **良好示例**："在未来30天内将API平均响应时间降低20%"

### 2. 四层指标模型

基于Google SRE实践，建议采用四层指标模型：

#### 1. 基础设施层指标
反映底层基础设施的健康状态：
- **CPU使用率**：各节点CPU使用情况
- **内存使用率**：内存分配和使用情况
- **磁盘IO**：读写速度和延迟
- **网络流量**：带宽使用和丢包率

#### 2. 系统层指标
反映平台核心组件的运行状态：
- **服务可用性**：各服务的在线状态和响应能力
- **请求延迟**：API接口的响应时间分布
- **错误率**：请求失败的比例和分类
- **吞吐量**：单位时间内的请求数量

#### 3. 应用层指标
反映业务逻辑的执行效果：
- **流水线执行时间**：从开始到完成的总耗时
- **构建成功率**：代码构建的成功比例
- **部署成功率**：应用部署的成功比例
- **测试通过率**：自动化测试的通过情况

#### 4. 业务层指标
反映对最终用户的价值交付：
- **部署频率**：向生产环境部署的频率
- **变更前置时间**：从代码提交到生产部署的时间
- **变更失败率**：部署后需要回滚的比例
- **服务恢复时间**：从故障发生到恢复正常的时间

## 核心指标定义与收集

### 1. 平台健康指标

#### 系统可用性指标
```prometheus
# 平台核心服务可用性
platform_service_up{service="pipeline-engine"} 1
platform_service_up{service="artifact-repo"} 1
platform_service_up{service="executor-manager"} 1

# 平台整体可用性
platform_up 1

# 计算可用性百分比的PromQL查询
avg_over_time(platform_up[30d]) * 100
```

#### 资源利用率指标
```prometheus
# CPU使用率
platform_cpu_usage_percent{node=~".+"} 75.5

# 内存使用率
platform_memory_usage_percent{node=~".+"} 68.2

# 存储使用率
platform_storage_usage_percent{volume=~".+"} 45.8

# 网络带宽使用
platform_network_receive_bytes_total{interface="eth0"} 123456789
platform_network_transmit_bytes_total{interface="eth0"} 987654321
```

#### 性能指标
```prometheus
# API响应时间（分位数）
platform_api_duration_seconds{endpoint="/api/v1/pipelines", quantile="0.5"} 0.123
platform_api_duration_seconds{endpoint="/api/v1/pipelines", quantile="0.95"} 0.456
platform_api_duration_seconds{endpoint="/api/v1/pipelines", quantile="0.99"} 0.789

# 请求速率
platform_api_requests_total{endpoint="/api/v1/pipelines", method="GET", code="200"} 12345

# 错误率
platform_api_errors_total{endpoint="/api/v1/pipelines", method="GET", code=~"5.."} 45
```

### 2. 流水线执行指标

#### 执行效率指标
```prometheus
# 流水线执行时间
pipeline_execution_duration_seconds{pipeline="web-app-build", stage="build"} 120.5
pipeline_execution_duration_seconds{pipeline="web-app-build", stage="test"} 300.2
pipeline_execution_duration_seconds{pipeline="web-app-build", stage="deploy"} 45.8

# 流水线总执行时间
pipeline_total_duration_seconds{pipeline="web-app-build"} 466.5

# 并发执行数
pipeline_concurrent_executions 15
```

#### 质量指标
```prometheus
# 流水线成功率
pipeline_success_total{pipeline="web-app-build"} 98
pipeline_failure_total{pipeline="web-app-build"} 2

# 步骤成功率
pipeline_step_success_total{pipeline="web-app-build", step="unit-test"} 99
pipeline_step_failure_total{pipeline="web-app-build", step="unit-test"} 1

# 测试覆盖率
pipeline_test_coverage_percent{pipeline="web-app-build"} 85.5

# 代码扫描问题数
pipeline_code_issues_total{pipeline="web-app-build", severity="critical"} 0
pipeline_code_issues_total{pipeline="web-app-build", severity="high"} 3
pipeline_code_issues_total{pipeline="web-app-build", severity="medium"} 15
```

#### 资源消耗指标
```prometheus
# 流水线资源消耗
pipeline_resource_cpu_seconds_total{pipeline="web-app-build", executor="executor-1"} 300
pipeline_resource_memory_bytes_total{pipeline="web-app-build", executor="executor-1"} 2147483648

# 执行器负载
pipeline_executor_load_average{executor="executor-1"} 0.75
pipeline_executor_load_average{executor="executor-2"} 0.85

# 任务队列长度
pipeline_task_queue_length 5
```

### 3. 用户行为指标

#### 使用活跃度指标
```prometheus
# 活跃用户数
platform_active_users_daily 150
platform_active_users_weekly 250
platform_active_users_monthly 350

# 用户会话时长
platform_user_session_duration_seconds{user=~".+"} 1800

# 功能使用频率
platform_feature_usage_total{feature="pipeline-create"} 45
platform_feature_usage_total{feature="pipeline-execute"} 120
platform_feature_usage_total{feature="artifact-browse"} 200
```

#### 用户满意度指标
```prometheus
# 用户反馈评分
platform_user_satisfaction_score 4.5

# 功能采纳率
platform_feature_adoption_rate{feature="new-ui"} 0.75

# 支持请求数
platform_support_requests_total{priority="high"} 5
platform_support_requests_total{priority="normal"} 15
platform_support_requests_total{priority="low"} 25
```

## 指标收集工具选型与集成

### 1. Prometheus集成实践

#### Prometheus配置
```yaml
# prometheus.yml - Prometheus主配置文件
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'ci-cd-platform'

rule_files:
  - "platform-rules.yml"
  - "pipeline-rules.yml"

scrape_configs:
  # 平台核心服务指标
  - job_name: 'platform-services'
    static_configs:
      - targets: 
        - 'pipeline-engine:9090'
        - 'artifact-repo:9090'
        - 'executor-manager:9090'
        - 'web-ui:9090'
    metrics_path: /metrics
    scrape_interval: 10s

  # 流水线执行器指标
  - job_name: 'pipeline-executors'
    static_configs:
      - targets: 
        - 'executor-1:9090'
        - 'executor-2:9090'
        - 'executor-3:9090'
    metrics_path: /metrics
    scrape_interval: 5s

  # 数据库指标
  - job_name: 'database'
    static_configs:
      - targets: ['postgres-exporter:9187']
    scrape_interval: 30s

  # 黑盒监控
  - job_name: 'blackbox'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
        - http://pipeline-engine:8080/health
        - http://artifact-repo:8080/health
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

#### 自定义指标导出器
```python
#!/usr/bin/env python3
"""
CI/CD平台自定义指标导出器
为Prometheus提供平台特定指标
"""

from prometheus_client import start_http_server, Gauge, Counter, Histogram, Summary
import random
import time
import threading
from typing import Dict

class CICDMetricsExporter:
    def __init__(self, port: int = 9090):
        self.port = port
        
        # 平台健康指标
        self.platform_up = Gauge('platform_up', 'CI/CD平台整体健康状态')
        self.service_up = Gauge('platform_service_up', '平台各服务健康状态', ['service'])
        self.cpu_usage = Gauge('platform_cpu_usage_percent', 'CPU使用率', ['node'])
        self.memory_usage = Gauge('platform_memory_usage_percent', '内存使用率', ['node'])
        
        # 流水线执行指标
        self.pipeline_duration = Histogram(
            'pipeline_execution_duration_seconds',
            '流水线执行时间分布',
            ['pipeline', 'stage'],
            buckets=(30, 60, 120, 300, 600, 900, 1800, 3600, float('inf'))
        )
        self.pipeline_success = Counter('pipeline_success_total', '流水线成功执行次数', ['pipeline'])
        self.pipeline_failure = Counter('pipeline_failure_total', '流水线失败执行次数', ['pipeline'])
        self.concurrent_executions = Gauge('pipeline_concurrent_executions', '并发执行流水线数')
        
        # 用户行为指标
        self.active_users = Gauge('platform_active_users_current', '当前活跃用户数')
        self.feature_usage = Counter('platform_feature_usage_total', '功能使用次数', ['feature'])
        
        # 初始化指标
        self._initialize_metrics()
    
    def _initialize_metrics(self):
        """初始化默认指标值"""
        self.platform_up.set(1)
        services = ['pipeline-engine', 'artifact-repo', 'executor-manager', 'web-ui']
        for service in services:
            self.service_up.labels(service=service).set(1)
    
    def update_platform_health(self, service_statuses: Dict[str, bool], 
                              cpu_usage: Dict[str, float], 
                              memory_usage: Dict[str, float]):
        """更新平台健康指标"""
        # 更新整体健康状态
        overall_health = all(service_statuses.values())
        self.platform_up.set(1 if overall_health else 0)
        
        # 更新各服务状态
        for service, status in service_statuses.items():
            self.service_up.labels(service=service).set(1 if status else 0)
        
        # 更新资源使用率
        for node, usage in cpu_usage.items():
            self.cpu_usage.labels(node=node).set(usage)
        
        for node, usage in memory_usage.items():
            self.memory_usage.labels(node=node).set(usage)
    
    def record_pipeline_execution(self, pipeline_name: str, stage_name: str, 
                                duration: float, success: bool):
        """记录流水线执行指标"""
        # 记录执行时间
        self.pipeline_duration.labels(
            pipeline=pipeline_name, 
            stage=stage_name
        ).observe(duration)
        
        # 记录执行结果
        if success:
            self.pipeline_success.labels(pipeline=pipeline_name).inc()
        else:
            self.pipeline_failure.labels(pipeline=pipeline_name).inc()
    
    def update_concurrent_executions(self, count: int):
        """更新并发执行数"""
        self.concurrent_executions.set(count)
    
    def record_feature_usage(self, feature_name: str):
        """记录功能使用"""
        self.feature_usage.labels(feature=feature_name).inc()
    
    def update_active_users(self, count: int):
        """更新活跃用户数"""
        self.active_users.set(count)
    
    def start_server(self):
        """启动指标服务器"""
        start_http_server(self.port)
        print(f"Metrics exporter started on port {self.port}")
    
    def simulate_metrics(self):
        """模拟指标数据生成（用于演示）"""
        def generate_data():
            while True:
                # 模拟平台健康数据
                services = {
                    'pipeline-engine': random.random() > 0.05,
                    'artifact-repo': random.random() > 0.05,
                    'executor-manager': random.random() > 0.05,
                    'web-ui': random.random() > 0.05
                }
                cpu_usage = {
                    'node-1': random.uniform(20, 80),
                    'node-2': random.uniform(20, 80),
                    'node-3': random.uniform(20, 80)
                }
                memory_usage = {
                    'node-1': random.uniform(30, 70),
                    'node-2': random.uniform(30, 70),
                    'node-3': random.uniform(30, 70)
                }
                
                self.update_platform_health(services, cpu_usage, memory_usage)
                
                # 模拟流水线执行
                pipelines = ['web-app-build', 'mobile-app-deploy', 'api-test']
                stages = ['build', 'test', 'deploy']
                
                for pipeline in pipelines:
                    for stage in stages:
                        duration = random.uniform(30, 600)
                        success = random.random() > 0.1
                        self.record_pipeline_execution(pipeline, stage, duration, success)
                
                # 模拟并发执行
                self.update_concurrent_executions(random.randint(5, 20))
                
                # 模拟用户行为
                self.update_active_users(random.randint(50, 200))
                features = ['pipeline-create', 'pipeline-execute', 'artifact-browse']
                for feature in features:
                    if random.random() > 0.7:
                        self.record_feature_usage(feature)
                
                time.sleep(30)
        
        thread = threading.Thread(target=generate_data, daemon=True)
        thread.start()

# 使用示例
if __name__ == "__main__":
    exporter = CICDMetricsExporter(port=9090)
    exporter.start_server()
    exporter.simulate_metrics()
    
    # 保持服务器运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Metrics exporter stopped")
```

### 2. 指标规则定义

#### Prometheus告警规则
```yaml
# platform-rules.yml - 平台告警规则
groups:
- name: platform-health.rules
  rules:
  - alert: PlatformDown
    expr: platform_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "CI/CD平台整体不可用"
      description: "平台整体健康状态为down，需要立即处理"

  - alert: ServiceDown
    expr: platform_service_up == 0
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "平台服务{{ $labels.service }}不可用"
      description: "服务{{ $labels.service }}健康状态为down，可能影响平台功能"

  - alert: HighCPUUsage
    expr: platform_cpu_usage_percent > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "节点{{ $labels.node }} CPU使用率过高"
      description: "节点{{ $labels.node }} CPU使用率已超过85%，当前为{{ $value }}%"

  - alert: HighMemoryUsage
    expr: platform_memory_usage_percent > 90
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "节点{{ $labels.node }} 内存使用率过高"
      description: "节点{{ $labels.node }} 内存使用率已超过90%，当前为{{ $value }}%"

- name: pipeline-performance.rules
  rules:
  - alert: PipelineFailureRateHigh
    expr: rate(pipeline_failure_total[5m]) / (rate(pipeline_success_total[5m]) + rate(pipeline_failure_total[5m])) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "流水线失败率过高"
      description: "过去5分钟流水线失败率超过10%，当前为{{ $value }}%"

  - alert: PipelineDurationTooLong
    expr: pipeline_execution_duration_seconds > 3600
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "流水线执行时间过长"
      description: "流水线{{ $labels.pipeline }}执行时间超过1小时，当前为{{ $value }}秒"
```

## 指标分析与可视化

### 1. Grafana仪表板设计

#### 核心指标仪表板
```json
{
  "dashboard": {
    "id": null,
    "title": "CI/CD Platform Core Metrics",
    "timezone": "browser",
    "schemaVersion": 16,
    "version": 0,
    "panels": [
      {
        "type": "stat",
        "title": "平台健康状态",
        "gridPos": {
          "x": 0,
          "y": 0,
          "w": 6,
          "h": 4
        },
        "targets": [
          {
            "expr": "platform_up",
            "instant": true
          }
        ],
        "thresholds": [
          {
            "color": "red",
            "value": 0
          },
          {
            "color": "green",
            "value": 1
          }
        ]
      },
      {
        "type": "graph",
        "title": "资源使用率",
        "gridPos": {
          "x": 6,
          "y": 0,
          "w": 18,
          "h": 8
        },
        "targets": [
          {
            "expr": "platform_cpu_usage_percent",
            "legendFormat": "CPU - {{node}}"
          },
          {
            "expr": "platform_memory_usage_percent",
            "legendFormat": "Memory - {{node}}"
          }
        ]
      },
      {
        "type": "graph",
        "title": "流水线执行趋势",
        "gridPos": {
          "x": 0,
          "y": 8,
          "w": 12,
          "h": 8
        },
        "targets": [
          {
            "expr": "rate(pipeline_success_total[5m])",
            "legendFormat": "成功 - {{pipeline}}"
          },
          {
            "expr": "rate(pipeline_failure_total[5m])",
            "legendFormat": "失败 - {{pipeline}}"
          }
        ]
      },
      {
        "type": "heatmap",
        "title": "流水线执行时间分布",
        "gridPos": {
          "x": 12,
          "y": 8,
          "w": 12,
          "h": 8
        },
        "targets": [
          {
            "expr": "pipeline_execution_duration_seconds_bucket",
            "format": "heatmap",
            "legendFormat": "{{le}}"
          }
        ]
      }
    ]
  }
}
```

### 2. 指标分析实践

#### 趋势分析脚本
```python
#!/usr/bin/env python3
"""
指标趋势分析工具
分析关键指标的变化趋势并生成报告
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from typing import Dict, List

class MetricsAnalyzer:
    def __init__(self, prometheus_url: str):
        self.prometheus_url = prometheus_url
        # 在实际实现中，这里应该连接到Prometheus API
    
    def analyze_platform_health_trends(self, days: int = 30) -> Dict:
        """分析平台健康趋势"""
        # 模拟数据
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # 生成模拟数据
        data = {
            'date': date_range,
            'uptime': np.random.normal(0.99, 0.01, len(date_range)),
            'cpu_usage': np.random.normal(65, 10, len(date_range)),
            'memory_usage': np.random.normal(55, 8, len(date_range))
        }
        
        df = pd.DataFrame(data)
        df['uptime'] = df['uptime'].clip(0.95, 1.0)
        df['cpu_usage'] = df['cpu_usage'].clip(0, 100)
        df['memory_usage'] = df['memory_usage'].clip(0, 100)
        
        # 计算趋势
        uptime_trend = np.polyfit(range(len(df)), df['uptime'], 1)[0]
        cpu_trend = np.polyfit(range(len(df)), df['cpu_usage'], 1)[0]
        memory_trend = np.polyfit(range(len(df)), df['memory_usage'], 1)[0]
        
        return {
            'period': f"{days}天趋势",
            'uptime_trend': '上升' if uptime_trend > 0 else '下降' if uptime_trend < 0 else '稳定',
            'cpu_usage_trend': '上升' if cpu_trend > 0 else '下降' if cpu_trend < 0 else '稳定',
            'memory_usage_trend': '上升' if memory_trend > 0 else '下降' if memory_trend < 0 else '稳定',
            'current_uptime': f"{df['uptime'].iloc[-1]:.3f}",
            'avg_cpu_usage': f"{df['cpu_usage'].mean():.1f}%",
            'avg_memory_usage': f"{df['memory_usage'].mean():.1f}%"
        }
    
    def analyze_pipeline_performance(self, days: int = 30) -> Dict:
        """分析流水线性能"""
        # 模拟数据
        pipelines = ['web-app-build', 'mobile-app-deploy', 'api-test']
        metrics = {}
        
        for pipeline in pipelines:
            # 生成模拟执行时间数据
            execution_times = np.random.exponential(300, 100)  # 平均5分钟
            success_rates = np.random.beta(50, 5, 100)  # 高成功率
            
            metrics[pipeline] = {
                'avg_execution_time': f"{np.mean(execution_times):.1f}秒",
                'median_execution_time': f"{np.median(execution_times):.1f}秒",
                'success_rate': f"{np.mean(success_rates)*100:.1f}%",
                'failure_rate': f"{(1-np.mean(success_rates))*100:.1f}%"
            }
        
        return metrics
    
    def generate_health_report(self) -> Dict:
        """生成健康报告"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'platform_health': self.analyze_platform_health_trends(),
            'pipeline_performance': self.analyze_pipeline_performance(),
            'recommendations': self._generate_recommendations()
        }
        
        return report
    
    def _generate_recommendations(self) -> List[str]:
        """生成优化建议"""
        return [
            "建议优化流水线执行时间，当前平均执行时间较长",
            "监控CPU使用率趋势，必要时进行资源扩容",
            "定期清理历史构建产物，释放存储空间",
            "优化测试阶段并行度，提高执行效率"
        ]

# 使用示例
if __name__ == "__main__":
    analyzer = MetricsAnalyzer("http://prometheus:9090")
    report = analyzer.generate_health_report()
    print(json.dumps(report, indent=2, ensure_ascii=False))
```

### 3. 异常检测与告警

#### 异常检测算法
```python
#!/usr/bin/env python3
"""
指标异常检测工具
使用统计方法检测指标异常
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

class AnomalyDetector:
    def __init__(self, window_size: int = 100, threshold: float = 3.0):
        self.window_size = window_size
        self.threshold = threshold
    
    def detect_anomalies_zscore(self, data: List[float]) -> List[Tuple[int, float]]:
        """使用Z-Score方法检测异常"""
        if len(data) < self.window_size:
            return []
        
        anomalies = []
        for i in range(self.window_size, len(data)):
            # 计算历史窗口的统计信息
            window = data[i-self.window_size:i]
            mean = np.mean(window)
            std = np.std(window)
            
            # 计算当前点的Z-Score
            if std > 0:
                z_score = abs(data[i] - mean) / std
                if z_score > self.threshold:
                    anomalies.append((i, z_score))
        
        return anomalies
    
    def detect_anomalies_iqr(self, data: List[float]) -> List[Tuple[int, float]]:
        """使用IQR方法检测异常"""
        if len(data) < self.window_size:
            return []
        
        anomalies = []
        for i in range(self.window_size, len(data)):
            # 计算历史窗口的四分位数
            window = data[i-self.window_size:i]
            q1 = np.percentile(window, 25)
            q3 = np.percentile(window, 75)
            iqr = q3 - q1
            
            # 计算异常边界
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            # 检测异常
            if data[i] < lower_bound or data[i] > upper_bound:
                anomalies.append((i, abs(data[i] - (q1 + q3) / 2)))
        
        return anomalies
    
    def detect_anomalies_ewma(self, data: List[float], alpha: float = 0.3) -> List[Tuple[int, float]]:
        """使用指数加权移动平均检测异常"""
        if len(data) < 2:
            return []
        
        anomalies = []
        ewma = data[0]
        ewmvar = 0
        
        for i in range(1, len(data)):
            # 更新EWMA
            old_ewma = ewma
            ewma = alpha * data[i] + (1 - alpha) * old_ewma
            
            # 更新方差
            ewmvar = alpha * (data[i] - old_ewma) ** 2 + (1 - alpha) * ewmvar
            
            # 计算标准差
            std = np.sqrt(ewmvar)
            
            # 检测异常
            if std > 0:
                z_score = abs(data[i] - ewma) / std
                if z_score > self.threshold:
                    anomalies.append((i, z_score))
        
        return anomalies

# 使用示例
if __name__ == "__main__":
    # 生成模拟数据
    np.random.seed(42)
    normal_data = np.random.normal(100, 10, 200).tolist()
    
    # 添加一些异常点
    normal_data[50] = 200  # 异常高值
    normal_data[100] = 10   # 异常低值
    normal_data[150] = 180  # 异常高值
    
    detector = AnomalyDetector(window_size=50, threshold=2.5)
    
    # 使用不同方法检测异常
    zscore_anomalies = detector.detect_anomalies_zscore(normal_data)
    iqr_anomalies = detector.detect_anomalies_iqr(normal_data)
    ewma_anomalies = detector.detect_anomalies_ewma(normal_data)
    
    print("Z-Score异常检测结果:")
    for idx, score in zscore_anomalies:
        print(f"  点 {idx}: 值 {normal_data[idx]:.2f}, Z-Score {score:.2f}")
    
    print("\nIQR异常检测结果:")
    for idx, score in iqr_anomalies:
        print(f"  点 {idx}: 值 {normal_data[idx]:.2f}, 偏差 {score:.2f}")
    
    print("\nEWMA异常检测结果:")
    for idx, score in ewma_anomalies:
        print(f"  点 {idx}: 值 {normal_data[idx]:.2f}, Z-Score {score:.2f}")
```

通过构建统一的指标体系并实施有效的收集与分析机制，CI/CD平台能够实现全面的可观测性，为平台优化和业务决策提供强有力的数据支撑。关键是要根据平台特点和业务需求设计合适的指标体系，选择适当的工具进行集成，并建立持续的分析和改进机制。只有这样，才能真正发挥指标数据的价值，推动平台向更高水平发展。