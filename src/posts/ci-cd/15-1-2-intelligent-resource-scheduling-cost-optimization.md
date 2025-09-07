---
title: 智能资源调度与成本优化: 基于机器学习的CI/CD资源管理
date: 2025-09-07
categories: [CICD]
tags: [aiops, resource-scheduling, cost-optimization, machine-learning, kubernetes, devops]
published: true
---
在现代CI/CD环境中，资源调度和成本优化是确保高效、经济的软件交付流程的关键因素。随着云原生技术的普及和容器化部署的广泛应用，组织面临着如何在保证性能的同时最大化资源利用率和最小化成本的挑战。智能资源调度通过应用机器学习和预测分析技术，能够动态分配计算资源，优化任务执行顺序，并实现成本效益的最大化。本文将深入探讨智能资源调度与成本优化的核心技术和实践方法。

## 智能资源调度架构

智能资源调度系统需要一个完整的架构来收集数据、分析需求、做出调度决策并持续优化。

### 系统组件设计

一个完整的智能资源调度系统由多个核心组件构成：

#### 资源监控与数据收集层
```python
#!/usr/bin/env python3
"""
资源监控与数据收集系统
"""

import psutil
import docker
import kubernetes
from kubernetes import client, config
import time
import json
from typing import Dict, List, Any
import logging
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ResourceMetrics:
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, int]
    container_count: int
    pod_count: int

@dataclass
class WorkloadProfile:
    name: str
    resource_requirements: Dict[str, float]  # cpu, memory, disk
    execution_time: float
    priority: int
    dependencies: List[str]
    historical_performance: Dict[str, Any]

class ResourceMonitor:
    def __init__(self):
        self.docker_client = docker.from_env()
        self.k8s_client = None
        self.logger = logging.getLogger(__name__)
        
        # 初始化Kubernetes客户端
        try:
            config.load_kube_config()
            self.k8s_client = client.CoreV1Api()
        except Exception as e:
            self.logger.warning(f"Could not initialize Kubernetes client: {e}")
    
    def collect_host_metrics(self) -> ResourceMetrics:
        """收集主机资源指标"""
        # CPU使用率
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # 内存使用率
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        
        # 磁盘使用率
        disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100
        
        # 网络IO
        net_io = psutil.net_io_counters()
        network_stats = {
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv,
            'packets_sent': net_io.packets_sent,
            'packets_recv': net_io.packets_recv
        }
        
        return ResourceMetrics(
            timestamp=datetime.now(),
            cpu_usage=cpu_percent,
            memory_usage=memory_percent,
            disk_usage=disk_percent,
            network_io=network_stats,
            container_count=self._get_container_count(),
            pod_count=self._get_pod_count()
        )
    
    def _get_container_count(self) -> int:
        """获取容器数量"""
        try:
            containers = self.docker_client.containers.list()
            return len(containers)
        except Exception as e:
            self.logger.warning(f"Could not get container count: {e}")
            return 0
    
    def _get_pod_count(self) -> int:
        """获取Pod数量"""
        if not self.k8s_client:
            return 0
        
        try:
            pods = self.k8s_client.list_pod_for_all_namespaces()
            return len(pods.items)
        except Exception as e:
            self.logger.warning(f"Could not get pod count: {e}")
            return 0
    
    def collect_workload_profiles(self) -> List[WorkloadProfile]:
        """收集工作负载配置文件"""
        # 这里简化实现，实际应用中会从配置文件或数据库中读取
        profiles = [
            WorkloadProfile(
                name="build-job-high-cpu",
                resource_requirements={"cpu": 4.0, "memory": 8.0, "disk": 20.0},
                execution_time=300.0,
                priority=1,
                dependencies=[],
                historical_performance={
                    "avg_execution_time": 295.0,
                    "success_rate": 0.95,
                    "resource_utilization": 0.85
                }
            ),
            WorkloadProfile(
                name="test-job-medium-cpu",
                resource_requirements={"cpu": 2.0, "memory": 4.0, "disk": 10.0},
                execution_time=180.0,
                priority=2,
                dependencies=["build-job-high-cpu"],
                historical_performance={
                    "avg_execution_time": 175.0,
                    "success_rate": 0.98,
                    "resource_utilization": 0.75
                }
            )
        ]
        
        return profiles
    
    def export_metrics(self, metrics: ResourceMetrics, filename: str = None):
        """导出指标数据"""
        if not filename:
            filename = f"resource_metrics_{int(time.time())}.json"
        
        metrics_dict = {
            "timestamp": metrics.timestamp.isoformat(),
            "cpu_usage": metrics.cpu_usage,
            "memory_usage": metrics.memory_usage,
            "disk_usage": metrics.disk_usage,
            "network_io": metrics.network_io,
            "container_count": metrics.container_count,
            "pod_count": metrics.pod_count
        }
        
        with open(filename, 'w') as f:
            json.dump(metrics_dict, f, indent=2)
        
        self.logger.info(f"Metrics exported to {filename}")

# 使用示例
# monitor = ResourceMonitor()
# metrics = monitor.collect_host_metrics()
# print(f"CPU Usage: {metrics.cpu_usage}%")
# print(f"Memory Usage: {metrics.memory_usage}%")
# profiles = monitor.collect_workload_profiles()
# print(f"Collected {len(profiles)} workload profiles")
```

### 调度决策引擎

调度决策引擎是智能资源调度系统的核心，负责根据收集到的数据做出最优的资源分配决策：

#### 机器学习驱动的调度器
```python
#!/usr/bin/env python3
"""
机器学习驱动的调度决策引擎
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple, Optional
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class ResourceRequest:
    id: str
    name: str
    cpu_cores: float
    memory_gb: float
    disk_gb: float
    estimated_duration: int  # seconds
    priority: int  # 1-10, 1 is highest
    dependencies: List[str]
    resource_pool: str

@dataclass
class ResourceNode:
    id: str
    name: str
    total_cpu: float
    total_memory: float
    total_disk: float
    available_cpu: float
    available_memory: float
    available_disk: float
    status: str  # available, busy, maintenance
    labels: Dict[str, str]
    performance_score: float

@dataclass
class SchedulingDecision:
    request_id: str
    node_id: str
    scheduled_time: datetime
    expected_completion: datetime
    confidence_score: float

class MLScheduler:
    def __init__(self):
        self.duration_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.resource_optimizer = KMeans(n_clusters=3, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.logger = logging.getLogger(__name__)
    
    def train_models(self, historical_data: pd.DataFrame):
        """训练预测模型"""
        # 训练执行时间预测模型
        feature_columns = [
            'cpu_cores', 'memory_gb', 'disk_gb', 'priority',
            'node_cpu_utilization', 'node_memory_utilization',
            'workload_complexity'
        ]
        
        X_duration = historical_data[feature_columns]
        y_duration = historical_data['actual_duration']
        
        X_scaled = self.scaler.fit_transform(X_duration)
        self.duration_predictor.fit(X_scaled, y_duration)
        
        # 训练资源优化模型
        resource_features = historical_data[['cpu_cores', 'memory_gb', 'disk_gb']]
        self.resource_optimizer.fit(resource_features)
        
        self.is_trained = True
        self.logger.info("ML models trained successfully")
    
    def predict_execution_time(self, request: ResourceRequest, 
                             node: ResourceNode) -> float:
        """预测执行时间"""
        if not self.is_trained:
            # 如果模型未训练，使用简单的启发式方法
            return request.estimated_duration
        
        # 构造特征向量
        features = np.array([[
            request.cpu_cores,
            request.memory_gb,
            request.disk_gb,
            request.priority,
            (node.total_cpu - node.available_cpu) / node.total_cpu,  # CPU利用率
            (node.total_memory - node.available_memory) / node.total_memory,  # 内存利用率
            self._calculate_workload_complexity(request)
        ]])
        
        features_scaled = self.scaler.transform(features)
        predicted_time = self.duration_predictor.predict(features_scaled)[0]
        
        return max(predicted_time, 1.0)  # 确保时间至少为1秒
    
    def _calculate_workload_complexity(self, request: ResourceRequest) -> float:
        """计算工作负载复杂度"""
        # 简化的复杂度计算
        complexity = (
            request.cpu_cores * 0.4 +
            request.memory_gb * 0.3 +
            request.disk_gb * 0.2 +
            (11 - request.priority) * 0.1  # 优先级越高，复杂度越低
        )
        return complexity
    
    def score_node_fitness(self, request: ResourceRequest, 
                          node: ResourceNode) -> float:
        """评分节点适合度"""
        # 检查资源是否足够
        if (request.cpu_cores > node.available_cpu or
            request.memory_gb > node.available_memory or
            request.disk_gb > node.available_disk):
            return 0.0  # 资源不足
        
        # 计算资源匹配度
        cpu_match = request.cpu_cores / node.available_cpu
        memory_match = request.memory_gb / node.available_memory
        disk_match = request.disk_gb / node.available_disk
        
        # 资源利用率得分（避免过度分配）
        resource_utilization_score = min(1.0, (cpu_match + memory_match + disk_match) / 3)
        
        # 节点性能得分
        performance_score = node.performance_score
        
        # 优先级调整
        priority_factor = request.priority / 10.0
        
        # 综合得分
        fitness_score = (
            resource_utilization_score * 0.4 +
            performance_score * 0.4 +
            priority_factor * 0.2
        )
        
        return fitness_score
    
    def schedule_workloads(self, requests: List[ResourceRequest], 
                          nodes: List[ResourceNode]) -> List[SchedulingDecision]:
        """调度工作负载"""
        decisions = []
        allocated_resources = {node.id: {
            'cpu': 0.0, 'memory': 0.0, 'disk': 0.0
        } for node in nodes}
        
        # 按优先级排序请求
        sorted_requests = sorted(requests, key=lambda x: x.priority)
        
        for request in sorted_requests:
            # 查找最佳节点
            best_node = self._find_best_node(request, nodes, allocated_resources)
            
            if best_node:
                # 预测执行时间
                execution_time = self.predict_execution_time(request, best_node)
                
                # 创建调度决策
                decision = SchedulingDecision(
                    request_id=request.id,
                    node_id=best_node.id,
                    scheduled_time=datetime.now(),
                    expected_completion=datetime.now() + timedelta(seconds=execution_time),
                    confidence_score=self.score_node_fitness(request, best_node)
                )
                
                decisions.append(decision)
                
                # 更新已分配资源
                allocated_resources[best_node.id]['cpu'] += request.cpu_cores
                allocated_resources[best_node.id]['memory'] += request.memory_gb
                allocated_resources[best_node.id]['disk'] += request.disk_gb
            else:
                self.logger.warning(f"No suitable node found for request {request.id}")
        
        return decisions
    
    def _find_best_node(self, request: ResourceRequest, 
                       nodes: List[ResourceNode],
                       allocated_resources: Dict[str, Dict[str, float]]) -> Optional[ResourceNode]:
        """查找最佳节点"""
        best_node = None
        best_score = 0.0
        
        for node in nodes:
            # 检查节点状态
            if node.status != "available":
                continue
            
            # 检查已分配资源
            available_cpu = node.available_cpu - allocated_resources[node.id]['cpu']
            available_memory = node.available_memory - allocated_resources[node.id]['memory']
            available_disk = node.available_disk - allocated_resources[node.id]['disk']
            
            # 创建临时节点对象用于评分
            temp_node = ResourceNode(
                id=node.id,
                name=node.name,
                total_cpu=node.total_cpu,
                total_memory=node.total_memory,
                total_disk=node.total_disk,
                available_cpu=available_cpu,
                available_memory=available_memory,
                available_disk=available_disk,
                status=node.status,
                labels=node.labels,
                performance_score=node.performance_score
            )
            
            # 评分节点
            score = self.score_node_fitness(request, temp_node)
            
            if score > best_score:
                best_score = score
                best_node = node
        
        return best_node if best_score > 0.1 else None

# 使用示例
# scheduler = MLScheduler()
# 
# # 创建示例请求
# requests = [
#     ResourceRequest(
#         id="req-1",
#         name="high-cpu-build",
#         cpu_cores=4.0,
#         memory_gb=8.0,
#         disk_gb=20.0,
#         estimated_duration=300,
#         priority=1,
#         dependencies=[],
#         resource_pool="build-pool"
#     ),
#     ResourceRequest(
#         id="req-2",
#         name="medium-memory-test",
#         cpu_cores=2.0,
#         memory_gb=16.0,
#         disk_gb=10.0,
#         estimated_duration=180,
#         priority=2,
#         dependencies=["req-1"],
#         resource_pool="test-pool"
#     )
# ]
# 
# # 创建示例节点
# nodes = [
#     ResourceNode(
#         id="node-1",
#         name="build-node-1",
#         total_cpu=8.0,
#         total_memory=32.0,
#         total_disk=100.0,
#         available_cpu=6.0,
#         available_memory=24.0,
#         available_disk=80.0,
#         status="available",
#         labels={"type": "build", "region": "us-west"},
#         performance_score=0.9
#     ),
#     ResourceNode(
#         id="node-2",
#         name="test-node-1",
#         total_cpu=4.0,
#         total_memory=64.0,
#         total_disk=200.0,
#         available_cpu=3.0,
#         available_memory=48.0,
#         available_disk=150.0,
#         status="available",
#         labels={"type": "test", "region": "us-west"},
#         performance_score=0.85
#     )
# ]
# 
# # 调度工作负载
# decisions = scheduler.schedule_workloads(requests, nodes)
# for decision in decisions:
#     print(f"Request {decision.request_id} scheduled on node {decision.node_id}")
#     print(f"Expected completion: {decision.expected_completion}")
#     print(f"Confidence score: {decision.confidence_score:.2f}")
```

## 成本优化策略

成本优化是智能资源调度的重要目标，通过合理的资源分配和使用策略，可以显著降低CI/CD流程的运营成本。

### 动态资源伸缩

基于工作负载预测的动态资源伸缩能够有效平衡性能和成本：

#### 预测性伸缩算法
```python
#!/usr/bin/env python3
"""
预测性资源伸缩系统
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class WorkloadForecast:
    timestamp: datetime
    predicted_workload: float
    confidence_interval: Tuple[float, float]
    resource_requirements: Dict[str, float]

@dataclass
class ScalingRecommendation:
    timestamp: datetime
    action: str  # scale_up, scale_down, maintain
    target_nodes: int
    reason: str
    cost_impact: float

class PredictiveScaler:
    def __init__(self):
        self.workload_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.logger = logging.getLogger(__name__)
        self.historical_scaling_decisions = []
    
    def train_model(self, historical_data: pd.DataFrame):
        """训练工作负载预测模型"""
        # 特征包括时间特征、历史工作负载、季节性因素等
        feature_columns = [
            'hour_of_day', 'day_of_week', 'day_of_month',
            'workload_lag_1h', 'workload_lag_24h', 'workload_lag_168h',  # 1小时、24小时、168小时滞后
            'rolling_mean_24h', 'rolling_std_24h',
            'is_weekend', 'is_holiday'
        ]
        
        X = historical_data[feature_columns]
        y = historical_data['actual_workload']
        
        X_scaled = self.scaler.fit_transform(X)
        self.workload_predictor.fit(X_scaled, y)
        
        self.is_trained = True
        self.logger.info("Predictive scaling model trained successfully")
    
    def forecast_workload(self, forecast_horizon_hours: int = 24) -> List[WorkloadForecast]:
        """预测未来工作负载"""
        if not self.is_trained:
            raise Exception("Model not trained yet")
        
        forecasts = []
        current_time = datetime.now()
        
        for i in range(forecast_horizon_hours):
            forecast_time = current_time + timedelta(hours=i)
            
            # 构造特征向量
            features = self._construct_features(forecast_time)
            features_scaled = self.scaler.transform([features])
            
            # 预测工作负载
            predicted_workload = self.workload_predictor.predict(features_scaled)[0]
            
            # 计算置信区间（简化实现）
            # 实际应用中会使用更复杂的不确定性量化方法
            confidence_lower = max(0, predicted_workload * 0.8)
            confidence_upper = predicted_workload * 1.2
            
            # 计算资源需求
            resource_requirements = self._calculate_resource_requirements(predicted_workload)
            
            forecast = WorkloadForecast(
                timestamp=forecast_time,
                predicted_workload=predicted_workload,
                confidence_interval=(confidence_lower, confidence_upper),
                resource_requirements=resource_requirements
            )
            
            forecasts.append(forecast)
        
        return forecasts
    
    def _construct_features(self, timestamp: datetime) -> List[float]:
        """构造特征向量"""
        # 这里简化实现，实际应用中会从历史数据中获取相关特征
        hour_of_day = timestamp.hour
        day_of_week = timestamp.weekday()
        day_of_month = timestamp.day
        is_weekend = 1 if day_of_week >= 5 else 0
        is_holiday = 0  # 简化处理
        
        # 模拟滞后特征
        workload_lag_1h = 10.0
        workload_lag_24h = 12.0
        workload_lag_168h = 11.0
        
        # 模拟滚动统计特征
        rolling_mean_24h = 11.5
        rolling_std_24h = 2.0
        
        return [
            hour_of_day, day_of_week, day_of_month,
            workload_lag_1h, workload_lag_24h, workload_lag_168h,
            rolling_mean_24h, rolling_std_24h,
            is_weekend, is_holiday
        ]
    
    def _calculate_resource_requirements(self, workload: float) -> Dict[str, float]:
        """计算资源需求"""
        # 简化的资源需求计算模型
        cpu_cores = max(1.0, workload * 0.5)
        memory_gb = max(2.0, workload * 1.0)
        disk_gb = max(10.0, workload * 2.0)
        
        return {
            'cpu_cores': cpu_cores,
            'memory_gb': memory_gb,
            'disk_gb': disk_gb
        }
    
    def generate_scaling_recommendations(self, current_nodes: int, 
                                       forecasts: List[WorkloadForecast],
                                       cost_per_node_hour: float = 1.0) -> List[ScalingRecommendation]:
        """生成伸缩建议"""
        recommendations = []
        
        for forecast in forecasts:
            # 计算所需节点数
            required_nodes = self._calculate_required_nodes(forecast.resource_requirements)
            
            # 确定伸缩动作
            if required_nodes > current_nodes * 1.2:  # 需要扩容超过20%
                action = "scale_up"
                reason = f"预测工作负载增加，需要{required_nodes}个节点"
            elif required_nodes < current_nodes * 0.8:  # 需要缩容超过20%
                action = "scale_down"
                reason = f"预测工作负载减少，只需要{required_nodes}个节点"
            else:
                action = "maintain"
                reason = f"当前{current_nodes}个节点满足需求"
            
            # 计算成本影响
            cost_impact = (required_nodes - current_nodes) * cost_per_node_hour
            
            recommendation = ScalingRecommendation(
                timestamp=forecast.timestamp,
                action=action,
                target_nodes=required_nodes,
                reason=reason,
                cost_impact=cost_impact
            )
            
            recommendations.append(recommendation)
        
        return recommendations
    
    def _calculate_required_nodes(self, resource_requirements: Dict[str, float]) -> int:
        """计算所需节点数"""
        # 假设每个节点的容量
        node_capacity = {
            'cpu_cores': 4.0,
            'memory_gb': 16.0,
            'disk_gb': 100.0
        }
        
        # 根据最限制性的资源计算所需节点数
        cpu_nodes = np.ceil(resource_requirements['cpu_cores'] / node_capacity['cpu_cores'])
        memory_nodes = np.ceil(resource_requirements['memory_gb'] / node_capacity['memory_gb'])
        disk_nodes = np.ceil(resource_requirements['disk_gb'] / node_capacity['disk_gb'])
        
        return int(max(cpu_nodes, memory_nodes, disk_nodes, 1))

# 使用示例
# scaler = PredictiveScaler()
# 
# # 生成工作负载预测
# forecasts = scaler.forecast_workload(forecast_horizon_hours=6)
# 
# # 生成伸缩建议
# current_nodes = 5
# recommendations = scaler.generate_scaling_recommendations(current_nodes, forecasts)
# 
# for rec in recommendations:
#     print(f"Time: {rec.timestamp}")
#     print(f"Action: {rec.action}")
#     print(f"Target nodes: {rec.target_nodes}")
#     print(f"Reason: {rec.reason}")
#     print(f"Cost impact: ${rec.cost_impact:.2f}")
#     print("---")
```

### 资源利用率优化

通过优化资源利用率，可以在不增加成本的情况下提升系统性能：

#### 资源碎片化优化
```python
#!/usr/bin/env python3
"""
资源碎片化优化系统
"""

import numpy as np
from typing import List, Dict, Tuple
import logging
from dataclasses import dataclass

@dataclass
class ResourceFragment:
    id: str
    node_id: str
    cpu_available: float
    memory_available: float
    disk_available: float
    allocation_time: float  # 已分配时间（小时）

@dataclass
class ConsolidationPlan:
    source_fragments: List[str]
    target_node: str
    expected_savings: float
    estimated_time: float  # 预计迁移时间（分钟）

class ResourceConsolidator:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def analyze_fragmentation(self, fragments: List[ResourceFragment]) -> Dict[str, any]:
        """分析资源碎片化程度"""
        if not fragments:
            return {"fragmentation_score": 0.0, "recommendations": []}
        
        # 按节点分组
        node_fragments = {}
        for fragment in fragments:
            if fragment.node_id not in node_fragments:
                node_fragments[fragment.node_id] = []
            node_fragments[fragment.node_id].append(fragment)
        
        # 计算每个节点的碎片化分数
        node_scores = {}
        total_fragmentation = 0.0
        
        for node_id, node_frags in node_fragments.items():
            score = self._calculate_node_fragmentation(node_frags)
            node_scores[node_id] = score
            total_fragmentation += score
        
        avg_fragmentation = total_fragmentation / len(node_fragments)
        
        return {
            "fragmentation_score": avg_fragmentation,
            "node_scores": node_scores,
            "total_fragments": len(fragments),
            "nodes_affected": len(node_fragments)
        }
    
    def _calculate_node_fragmentation(self, fragments: List[ResourceFragment]) -> float:
        """计算节点碎片化分数"""
        if len(fragments) <= 1:
            return 0.0
        
        # 计算资源分布的不均匀性
        cpu_resources = [f.cpu_available for f in fragments]
        memory_resources = [f.memory_available for f in fragments]
        disk_resources = [f.disk_available for f in fragments]
        
        # 使用标准差衡量不均匀性
        cpu_std = np.std(cpu_resources) if len(cpu_resources) > 1 else 0
        memory_std = np.std(memory_resources) if len(memory_resources) > 1 else 0
        disk_std = np.std(disk_resources) if len(disk_resources) > 1 else 0
        
        # 归一化到0-1范围
        max_cpu = max(cpu_resources) if cpu_resources else 1
        max_memory = max(memory_resources) if memory_resources else 1
        max_disk = max(disk_resources) if disk_resources else 1
        
        normalized_cpu_std = cpu_std / max_cpu if max_cpu > 0 else 0
        normalized_memory_std = memory_std / max_memory if max_memory > 0 else 0
        normalized_disk_std = disk_std / max_disk if max_disk > 0 else 0
        
        # 综合碎片化分数
        fragmentation_score = (normalized_cpu_std + normalized_memory_std + normalized_disk_std) / 3
        
        return min(fragmentation_score, 1.0)
    
    def generate_consolidation_plans(self, fragments: List[ResourceFragment],
                                   max_consolidations: int = 5) -> List[ConsolidationPlan]:
        """生成资源合并计划"""
        plans = []
        
        # 按节点分组碎片
        node_fragments = {}
        for fragment in fragments:
            if fragment.node_id not in node_fragments:
                node_fragments[fragment.node_id] = []
            node_fragments[fragment.node_id].append(fragment)
        
        # 为每个节点生成合并建议
        for node_id, node_frags in node_fragments.items():
            if len(node_frags) > 1:
                plan = self._generate_node_consolidation_plan(node_id, node_frags)
                if plan:
                    plans.append(plan)
        
        # 按预期节省排序
        plans.sort(key=lambda x: x.expected_savings, reverse=True)
        
        return plans[:max_consolidations]
    
    def _generate_node_consolidation_plan(self, node_id: str, 
                                        fragments: List[ResourceFragment]) -> ConsolidationPlan:
        """为单个节点生成合并计划"""
        if len(fragments) <= 1:
            return None
        
        # 计算总可用资源
        total_cpu = sum(f.cpu_available for f in fragments)
        total_memory = sum(f.memory_available for f in fragments)
        total_disk = sum(f.disk_available for f in fragments)
        
        # 估计可以合并到多少个碎片中
        # 假设目标是将资源集中在较大的碎片中
        sorted_fragments = sorted(fragments, key=lambda x: x.cpu_available + x.memory_available, reverse=True)
        
        # 简化处理：假设可以将小碎片合并到大碎片中
        target_fragment = sorted_fragments[0]
        source_fragments = [f.id for f in sorted_fragments[1:]]
        
        # 估计节省（假设每个碎片的维护成本）
        cost_per_fragment = 0.1  # 每个碎片的维护成本假设为$0.1/小时
        expected_savings = len(source_fragments) * cost_per_fragment
        
        # 估计迁移时间（简化）
        estimated_time = len(source_fragments) * 5  # 每个碎片迁移需要5分钟
        
        return ConsolidationPlan(
            source_fragments=source_fragments,
            target_node=target_fragment.node_id,
            expected_savings=expected_savings,
            estimated_time=estimated_time
        )
    
    def optimize_resource_allocation(self, fragments: List[ResourceFragment]) -> List[ResourceFragment]:
        """优化资源分配"""
        # 这里实现资源重新分配算法
        # 简化实现：重新平衡资源分布
        
        if len(fragments) <= 1:
            return fragments
        
        # 计算平均资源
        total_cpu = sum(f.cpu_available for f in fragments)
        total_memory = sum(f.memory_available for f in fragments)
        total_disk = sum(f.disk_available for f in fragments)
        
        avg_cpu = total_cpu / len(fragments)
        avg_memory = total_memory / len(fragments)
        avg_disk = total_disk / len(fragments)
        
        # 重新分配资源（简化处理）
        optimized_fragments = []
        for fragment in fragments:
            optimized_fragment = ResourceFragment(
                id=fragment.id,
                node_id=fragment.node_id,
                cpu_available=avg_cpu,
                memory_available=avg_memory,
                disk_available=avg_disk,
                allocation_time=fragment.allocation_time
            )
            optimized_fragments.append(optimized_fragment)
        
        return optimized_fragments

# 使用示例
# consolidator = ResourceConsolidator()
# 
# # 创建示例碎片
# fragments = [
#     ResourceFragment("frag-1", "node-1", 1.5, 4.0, 20.0, 2.5),
#     ResourceFragment("frag-2", "node-1", 0.5, 2.0, 10.0, 1.0),
#     ResourceFragment("frag-3", "node-1", 2.0, 6.0, 30.0, 3.0),
#     ResourceFragment("frag-4", "node-2", 1.0, 3.0, 15.0, 2.0),
#     ResourceFragment("frag-5", "node-2", 0.8, 2.5, 12.0, 1.5)
# ]
# 
# # 分析碎片化
# analysis = consolidator.analyze_fragmentation(fragments)
# print(f"Fragmentation score: {analysis['fragmentation_score']:.2f}")
# print(f"Nodes affected: {analysis['nodes_affected']}")
# 
# # 生成合并计划
# plans = consolidator.generate_consolidation_plans(fragments)
# for i, plan in enumerate(plans):
#     print(f"Plan {i+1}:")
#     print(f"  Source fragments: {plan.source_fragments}")
#     print(f"  Target node: {plan.target_node}")
#     print(f"  Expected savings: ${plan.expected_savings:.2f}/hour")
#     print(f"  Estimated time: {plan.estimated_time} minutes")
```

## 成本效益分析

智能资源调度的最终目标是实现成本效益的最大化，需要建立完善的成本效益分析体系：

### 成本模型与优化

建立准确的成本模型是实现成本优化的基础：

#### 动态成本计算模型
```python
#!/usr/bin/env python3
"""
动态成本计算与优化系统
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Tuple
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class CostComponent:
    name: str
    unit: str
    rate: float
    usage: float
    total_cost: float

@dataclass
class CostAnalysis:
    period: Tuple[datetime, datetime]
    total_cost: float
    components: List[CostComponent]
    optimizations: List[Dict[str, any]]
    projected_savings: float

class DynamicCostOptimizer:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.cost_models = {}
        self.historical_costs = []
    
    def register_cost_model(self, resource_type: str, cost_function: callable):
        """注册成本模型"""
        self.cost_models[resource_type] = cost_function
    
    def calculate_resource_cost(self, resource_type: str, usage_data: Dict) -> float:
        """计算资源成本"""
        if resource_type not in self.cost_models:
            raise ValueError(f"No cost model registered for {resource_type}")
        
        return self.cost_models[resource_type](usage_data)
    
    def perform_cost_analysis(self, start_time: datetime, 
                            end_time: datetime,
                            usage_data: Dict[str, List[Dict]]) -> CostAnalysis:
        """执行成本分析"""
        components = []
        total_cost = 0.0
        
        # 计算各组件成本
        for resource_type, data_list in usage_data.items():
            component_cost = 0.0
            
            for data in data_list:
                cost = self.calculate_resource_cost(resource_type, data)
                component_cost += cost
            
            # 创建成本组件
            component = CostComponent(
                name=resource_type,
                unit=self._get_unit_for_resource(resource_type),
                rate=self._get_rate_for_resource(resource_type),
                usage=self._calculate_total_usage(data_list),
                total_cost=component_cost
            )
            
            components.append(component)
            total_cost += component_cost
        
        # 生成优化建议
        optimizations = self._generate_optimizations(components, usage_data)
        
        # 计算预期节省
        projected_savings = self._calculate_projected_savings(optimizations)
        
        return CostAnalysis(
            period=(start_time, end_time),
            total_cost=total_cost,
            components=components,
            optimizations=optimizations,
            projected_savings=projected_savings
        )
    
    def _get_unit_for_resource(self, resource_type: str) -> str:
        """获取资源单位"""
        units = {
            'compute': 'CPU-hours',
            'memory': 'GB-hours',
            'storage': 'GB-months',
            'network': 'GB',
            'build_minutes': 'minutes'
        }
        return units.get(resource_type, 'units')
    
    def _get_rate_for_resource(self, resource_type: str) -> float:
        """获取资源费率"""
        # 简化实现，实际应用中会从配置或API获取
        rates = {
            'compute': 0.05,      # $0.05 per CPU-hour
            'memory': 0.01,       # $0.01 per GB-hour
            'storage': 0.10,      # $0.10 per GB-month
            'network': 0.02,      # $0.02 per GB
            'build_minutes': 0.03 # $0.03 per minute
        }
        return rates.get(resource_type, 0.0)
    
    def _calculate_total_usage(self, data_list: List[Dict]) -> float:
        """计算总使用量"""
        if not data_list:
            return 0.0
        
        # 根据数据类型计算总使用量
        first_item = data_list[0]
        if 'cpu_hours' in first_item:
            return sum(item.get('cpu_hours', 0) for item in data_list)
        elif 'gb_hours' in first_item:
            return sum(item.get('gb_hours', 0) for item in data_list)
        elif 'gb' in first_item:
            return sum(item.get('gb', 0) for item in data_list)
        else:
            return len(data_list)  # 默认返回计数
    
    def _generate_optimizations(self, components: List[CostComponent], 
                              usage_data: Dict[str, List[Dict]]) -> List[Dict[str, any]]:
        """生成优化建议"""
        optimizations = []
        
        # 分析高成本组件
        for component in components:
            if component.total_cost > 100:  # 超过$100的成本组件
                optimization = {
                    'type': 'high_cost',
                    'component': component.name,
                    'current_cost': component.total_cost,
                    'recommendation': f'Consider optimizing {component.name} usage',
                    'potential_savings': component.total_cost * 0.2  # 假设可节省20%
                }
                optimizations.append(optimization)
        
        # 分析使用模式
        for resource_type, data_list in usage_data.items():
            if resource_type == 'compute':
                # 检查CPU使用模式
                avg_usage = np.mean([data.get('cpu_utilization', 0) for data in data_list])
                if avg_usage < 0.3:  # 平均使用率低于30%
                    optimization = {
                        'type': 'underutilization',
                        'component': resource_type,
                        'current_usage': avg_usage,
                        'recommendation': 'Consider rightsizing compute resources',
                        'potential_savings': self._calculate_rightsizing_savings(data_list)
                    }
                    optimizations.append(optimization)
        
        return optimizations
    
    def _calculate_rightsizing_savings(self, compute_data: List[Dict]) -> float:
        """计算资源调整节省"""
        total_cost = sum(self.calculate_resource_cost('compute', data) for data in compute_data)
        # 假设通过调整可以节省30%的成本
        return total_cost * 0.3
    
    def _calculate_projected_savings(self, optimizations: List[Dict]) -> float:
        """计算预期节省"""
        return sum(opt.get('potential_savings', 0) for opt in optimizations)
    
    def simulate_cost_scenarios(self, base_usage: Dict[str, float],
                              scenarios: List[Dict[str, float]]) -> Dict[str, float]:
        """模拟不同成本场景"""
        results = {}
        
        # 基准成本
        base_cost = 0.0
        for resource_type, usage in base_usage.items():
            cost = self.calculate_resource_cost(resource_type, {'usage': usage})
            base_cost += cost
        
        results['base_cost'] = base_cost
        
        # 场景成本
        for i, scenario in enumerate(scenarios):
            scenario_cost = 0.0
            for resource_type, usage in scenario.items():
                cost = self.calculate_resource_cost(resource_type, {'usage': usage})
                scenario_cost += cost
            
            results[f'scenario_{i+1}'] = scenario_cost
            results[f'scenario_{i+1}_savings'] = base_cost - scenario_cost
        
        return results

# 使用示例
# optimizer = DynamicCostOptimizer()
# 
# # 注册成本模型
# optimizer.register_cost_model('compute', lambda data: data.get('cpu_hours', 0) * 0.05)
# optimizer.register_cost_model('memory', lambda data: data.get('gb_hours', 0) * 0.01)
# optimizer.register_cost_model('storage', lambda data: data.get('gb_months', 0) * 0.10)
# 
# # 创建使用数据
# usage_data = {
#     'compute': [
#         {'cpu_hours': 100, 'cpu_utilization': 0.25},
#         {'cpu_hours': 150, 'cpu_utilization': 0.35}
#     ],
#     'memory': [
#         {'gb_hours': 500},
#         {'gb_hours': 750}
#     ],
#     'storage': [
#         {'gb_months': 1000}
#     ]
# }
# 
# # 执行成本分析
# start_time = datetime.now() - timedelta(days=7)
# end_time = datetime.now()
# analysis = optimizer.perform_cost_analysis(start_time, end_time, usage_data)
# 
# print(f"Total cost: ${analysis.total_cost:.2f}")
# print(f"Projected savings: ${analysis.projected_savings:.2f}")
# print("\nCost components:")
# for component in analysis.components:
#     print(f"  {component.name}: ${component.total_cost:.2f}")
# 
# print("\nOptimization recommendations:")
# for opt in analysis.optimizations:
#     print(f"  {opt['recommendation']} - Potential savings: ${opt['potential_savings']:.2f}")
# 
# # 模拟成本场景
# base_usage = {'compute': 250, 'memory': 1250, 'storage': 1000}
# scenarios = [
#     {'compute': 200, 'memory': 1000, 'storage': 1000},  # 优化场景1
#     {'compute': 150, 'memory': 800, 'storage': 800}     # 优化场景2
# ]
# 
# scenario_results = optimizer.simulate_cost_scenarios(base_usage, scenarios)
# print("\nCost scenarios:")
# for scenario, cost in scenario_results.items():
#     print(f"  {scenario}: ${cost:.2f}")
```

通过实施智能资源调度与成本优化策略，组织可以在保证CI/CD流程性能的同时，显著降低运营成本。这些技术不仅提高了资源利用率，还通过预测性分析和机器学习算法实现了更加精细化的资源管理。随着云原生技术的不断发展，智能资源调度将成为现代DevOps实践中的重要组成部分。