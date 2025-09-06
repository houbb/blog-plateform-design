---
title: 部署策略详解：蓝绿部署、金丝雀发布、滚动发布、功能开关
date: 2025-08-30
categories: [CICD]
tags: [ci,cd,deployment,strategy,blue-green,canary,rolling]
published: true
---

在现代软件交付实践中，选择合适的部署策略对于确保系统稳定性和业务连续性至关重要。不同的部署策略适用于不同的业务场景和风险偏好，通过合理选择和组合使用，团队能够在保证系统稳定性的同时实现快速、安全的软件交付。本文将深入探讨四种主流部署策略：蓝绿部署、金丝雀发布、滚动发布和功能开关的实现原理、优缺点以及最佳实践。

## 蓝绿部署（Blue-Green Deployment）

蓝绿部署是一种通过维护两套完全相同的生产环境来实现零停机时间部署的策略。这种策略能够最大程度地降低部署风险，确保业务连续性。

### 实现原理

蓝绿部署的核心思想是维护两个完全独立的生产环境：
- **蓝色环境**：当前正在提供服务的生产环境
- **绿色环境**：待部署新版本的备用环境

部署流程：
1. 在绿色环境中部署新版本应用
2. 在绿色环境中进行完整的测试验证
3. 将流量从蓝色环境切换到绿色环境
4. 验证绿色环境运行正常后，蓝色环境变为备用

### 蓝绿部署实现

#### Kubernetes蓝绿部署实现
```yaml
# 蓝色环境部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
  labels:
    app: myapp
    version: blue
    environment: production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
      - name: myapp
        image: myapp:v1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "1"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
---
# 绿色环境部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
  labels:
    app: myapp
    version: green
    environment: production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: myapp
        image: myapp:v2.0  # 新版本
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "1"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10

---
# 蓝色服务
apiVersion: v1
kind: Service
metadata:
  name: myapp-blue
  labels:
    app: myapp
    version: blue
spec:
  selector:
    app: myapp
    version: blue
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP

---
# 绿色服务
apiVersion: v1
kind: Service
metadata:
  name: myapp-green
  labels:
    app: myapp
    version: green
spec:
  selector:
    app: myapp
    version: green
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP

---
# 主服务（流量切换点）
apiVersion: v1
kind: Service
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  selector:
    app: myapp
    version: blue  # 切换时修改此标签
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: LoadBalancer
```

#### 蓝绿部署切换脚本
```bash
#!/bin/bash
# 蓝绿部署切换脚本

set -e

# 配置变量
DEPLOYMENT_NAME="myapp"
CURRENT_VERSION=${1:-blue}
NEW_VERSION=${2:-green}
NAMESPACE="production"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 验证新版本是否准备就绪
validate_new_version() {
    log "Validating new version ($NEW_VERSION)..."
    
    # 检查Deployment状态
    kubectl rollout status deployment/${DEPLOYMENT_NAME}-${NEW_VERSION} -n $NAMESPACE
    
    if [ $? -ne 0 ]; then
        log "ERROR: New version is not ready, aborting deployment"
        exit 1
    fi
    
    # 检查Pod状态
    READY_REPLICAS=$(kubectl get deployment ${DEPLOYMENT_NAME}-${NEW_VERSION} -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    REPLICAS=$(kubectl get deployment ${DEPLOYMENT_NAME}-${NEW_VERSION} -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    
    if [ "$READY_REPLICAS" != "$REPLICAS" ]; then
        log "ERROR: Not all pods are ready ($READY_REPLICAS/$REPLICAS)"
        exit 1
    fi
    
    log "New version validation passed"
}

# 执行金丝雀测试（可选）
perform_canary_test() {
    log "Performing canary test..."
    
    # 获取新版本服务地址
    NEW_SERVICE_URL=$(kubectl get service ${DEPLOYMENT_NAME}-${NEW_VERSION} -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    if [ -z "$NEW_SERVICE_URL" ]; then
        NEW_SERVICE_URL=$(kubectl get service ${DEPLOYMENT_NAME}-${NEW_VERSION} -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    fi
    
    # 执行健康检查
    for i in {1..5}; do
        if curl -f -s --max-time 10 "http://$NEW_SERVICE_URL/health" > /dev/null; then
            log "Canary test request $i succeeded"
        else
            log "ERROR: Canary test request $i failed"
            exit 1
        fi
        sleep 2
    done
    
    log "Canary test completed successfully"
}

# 切换流量
switch_traffic() {
    log "Switching traffic from $CURRENT_VERSION to $NEW_VERSION..."
    
    # 使用kubectl patch更新主服务选择器
    kubectl patch service ${DEPLOYMENT_NAME} -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"version\":\"${NEW_VERSION}\"}}}"
    
    if [ $? -ne 0 ]; then
        log "ERROR: Failed to switch traffic"
        exit 1
    fi
    
    log "Traffic switched successfully"
}

# 验证切换结果
validate_switch() {
    log "Validating traffic switch..."
    
    # 等待切换生效
    sleep 30
    
    # 获取主服务地址
    MAIN_SERVICE_URL=$(kubectl get service ${DEPLOYMENT_NAME} -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    if [ -z "$MAIN_SERVICE_URL" ]; then
        MAIN_SERVICE_URL=$(kubectl get service ${DEPLOYMENT_NAME} -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    fi
    
    # 验证流量是否正确路由到新版本
    for i in {1..10}; do
        RESPONSE=$(curl -s --max-time 10 "http://$MAIN_SERVICE_URL/version")
        if [ "$RESPONSE" == "$NEW_VERSION" ]; then
            log "Traffic validation request $i: Correctly routed to $NEW_VERSION"
        else
            log "WARNING: Traffic validation request $i: Routed to $RESPONSE instead of $NEW_VERSION"
        fi
        sleep 1
    done
    
    log "Traffic validation completed"
}

# 清理旧环境
cleanup_old_environment() {
    log "Cleaning up old environment ($CURRENT_VERSION)..."
    
    # 这里可以添加清理逻辑，比如删除旧的Deployment
    # kubectl delete deployment ${DEPLOYMENT_NAME}-${CURRENT_VERSION} -n $NAMESPACE
    
    log "Old environment cleanup completed"
}

# 回滚函数
rollback() {
    log "Rolling back to $CURRENT_VERSION..."
    kubectl patch service ${DEPLOYMENT_NAME} -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"version\":\"${CURRENT_VERSION}\"}}}"
    log "Rollback completed"
}

# 主流程
main() {
    log "Starting blue-green deployment: $CURRENT_VERSION -> $NEW_VERSION"
    
    # 捕获退出信号，用于回滚
    trap rollback EXIT INT TERM
    
    # 验证新版本
    validate_new_version
    
    # 执行金丝雀测试
    perform_canary_test
    
    # 切换流量
    switch_traffic
    
    # 验证切换
    validate_switch
    
    # 取消回滚陷阱
    trap - EXIT INT TERM
    
    # 清理旧环境（可选）
    # cleanup_old_environment
    
    log "Blue-green deployment completed successfully"
}

# 执行主流程
main
```

### 蓝绿部署优缺点分析

#### 优点
1. **零停机时间**：流量切换是原子操作，用户无感知
2. **快速回滚**：出现问题时可以立即切换回旧版本
3. **完整测试**：新版本在完全隔离的环境中进行测试
4. **风险隔离**：新旧版本完全隔离，互不影响

#### 缺点
1. **资源成本高**：需要维护两套完全相同的环境
2. **数据一致性**：需要处理数据库等共享资源的一致性问题
3. **切换复杂性**：流量切换需要考虑DNS缓存、连接池等问题

## 金丝雀发布（Canary Release）

金丝雀发布通过逐步将新版本暴露给部分用户来降低发布风险，是一种渐进式的部署策略。

### 实现原理

金丝雀发布的核心思想是：
- 初始时，只有少量用户（例如1-5%）会被路由到新版本
- 逐步增加新版本的流量比例
- 监控新版本的性能和错误率
- 如果一切正常，最终将100%流量切换到新版本

### 金丝雀发布实现

#### 使用Istio实现金丝雀发布
```yaml
# 目标规则定义版本子集
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: myapp
  namespace: production
spec:
  host: myapp
  subsets:
  - name: v1
    labels:
      version: v1.0
  - name: v2
    labels:
      version: v2.0

---
# 虚拟服务定义流量路由规则
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myapp
  namespace: production
spec:
  hosts:
  - myapp.example.com
  gateways:
  - myapp-gateway
  http:
  - route:
    - destination:
        host: myapp
        subset: v1
      weight: 90  # 90%流量到v1版本
    - destination:
        host: myapp
        subset: v2
      weight: 10  # 10%流量到v2版本
    # 基于请求头的路由（用于测试）
    match:
    - headers:
        x-canary-test:
          exact: "true"
    route:
    - destination:
        host: myapp
        subset: v2
      weight: 100

---
# Gateway配置
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: myapp-gateway
  namespace: production
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - myapp.example.com
```

#### 金丝雀发布管理工具
```python
#!/usr/bin/env python3
"""
金丝雀发布管理工具
支持渐进式流量切换和自动回滚
"""

import time
import requests
import json
from typing import Dict, List, Optional
from dataclasses import dataclass
from prometheus_api_client import PrometheusConnect
import datetime

@dataclass
class CanaryConfig:
    """金丝雀发布配置"""
    service_name: str
    namespace: str
    stable_version: str
    canary_version: str
    initial_weight: int = 5
    step_weight: int = 5
    max_weight: int = 100
    step_interval: int = 300  # 秒
    metrics_check_interval: int = 60  # 秒
    metrics_window: int = 300  # 秒
    metrics_thresholds: Dict[str, float] = None
    auto_rollback: bool = True

@dataclass
class CanaryMetrics:
    """金丝雀发布指标"""
    error_rate: float
    latency_95th: float
    latency_99th: float
    request_rate: float
    cpu_usage: float
    memory_usage: float
    timestamp: datetime.datetime

class CanaryController:
    def __init__(self, config: CanaryConfig, prometheus_url: str):
        self.config = config
        self.prometheus = PrometheusConnect(url=prometheus_url, disable_ssl=True)
        self.current_weight = 0
        self.metrics_history = []
    
    def start_canary_release(self) -> bool:
        """
        启动金丝雀发布
        
        Returns:
            发布是否成功
        """
        try:
            log(f"Starting canary release for {self.config.service_name}")
            
            # 初始化流量权重
            self.current_weight = self.config.initial_weight
            self._set_traffic_weight(self.current_weight)
            log(f"Initial traffic weight set to {self.current_weight}%")
            
            # 渐进式增加流量
            while self.current_weight < self.config.max_weight:
                # 等待观察期
                log(f"Waiting for {self.config.step_interval} seconds before next step")
                time.sleep(self.config.step_interval)
                
                # 检查指标
                if not self._check_metrics():
                    log("Metrics check failed")
                    if self.config.auto_rollback:
                        self._rollback()
                        return False
                    else:
                        log("Auto-rollback disabled, stopping canary release")
                        return False
                
                # 增加流量权重
                self.current_weight = min(
                    self.current_weight + self.config.step_weight,
                    self.config.max_weight
                )
                
                log(f"Increasing canary weight to {self.current_weight}%")
                self._set_traffic_weight(self.current_weight)
            
            # 完成发布
            log("Canary release completed successfully")
            return True
            
        except Exception as e:
            log(f"Canary release failed: {e}")
            if self.config.auto_rollback:
                self._rollback()
            return False
    
    def _set_traffic_weight(self, canary_weight: int):
        """
        设置流量权重
        
        Args:
            canary_weight: 金丝雀版本的流量权重
        """
        stable_weight = 100 - canary_weight
        
        # 更新Istio虚拟服务配置
        patch_data = {
            "spec": {
                "http": [
                    {
                        "route": [
                            {
                                "destination": {
                                    "host": self.config.service_name,
                                    "subset": self.config.stable_version
                                },
                                "weight": stable_weight
                            },
                            {
                                "destination": {
                                    "host": self.config.service_name,
                                    "subset": self.config.canary_version
                                },
                                "weight": canary_weight
                            }
                        ]
                    }
                ]
            }
        }
        
        # 这里应该调用Kubernetes API更新VirtualService
        # 为简化示例，我们只打印操作
        log(f"Updating VirtualService with patch: {json.dumps(patch_data, indent=2)}")
    
    def _check_metrics(self) -> bool:
        """
        检查关键指标
        
        Returns:
            指标是否正常
        """
        try:
            metrics = self._collect_metrics()
            self.metrics_history.append(metrics)
            
            if not self.config.metrics_thresholds:
                return True
            
            # 检查各项指标阈值
            violations = []
            
            if 'error_rate' in self.config.metrics_thresholds:
                threshold = self.config.metrics_thresholds['error_rate']
                if metrics.error_rate > threshold:
                    violations.append(f"Error rate {metrics.error_rate:.4f} > {threshold:.4f}")
            
            if 'latency_95th' in self.config.metrics_thresholds:
                threshold = self.config.metrics_thresholds['latency_95th']
                if metrics.latency_95th > threshold:
                    violations.append(f"95th latency {metrics.latency_95th:.2f}ms > {threshold:.2f}ms")
            
            if 'latency_99th' in self.config.metrics_thresholds:
                threshold = self.config.metrics_thresholds['latency_99th']
                if metrics.latency_99th > threshold:
                    violations.append(f"99th latency {metrics.latency_99th:.2f}ms > {threshold:.2f}ms")
            
            if 'cpu_usage' in self.config.metrics_thresholds:
                threshold = self.config.metrics_thresholds['cpu_usage']
                if metrics.cpu_usage > threshold:
                    violations.append(f"CPU usage {metrics.cpu_usage:.2f} > {threshold:.2f}")
            
            if violations:
                log(f"Metrics violations: {', '.join(violations)}")
                return False
            
            return True
            
        except Exception as e:
            log(f"Error checking metrics: {e}")
            return False
    
    def _collect_metrics(self) -> CanaryMetrics:
        """
        收集关键指标
        
        Returns:
            指标数据
        """
        end_time = datetime.datetime.now()
        start_time = end_time - datetime.timedelta(seconds=self.config.metrics_window)
        
        # 错误率查询
        error_rate_query = f"""
        sum(rate(istio_requests_total{{destination_service="{self.config.service_name}.{self.config.namespace}.svc.cluster.local", response_code=~"5.."}}[5m])) 
        / 
        sum(rate(istio_requests_total{{destination_service="{self.config.service_name}.{self.config.namespace}.svc.cluster.local"}}[5m]))
        """
        
        # 延迟查询
        latency_95_query = f"""
        histogram_quantile(0.95, sum(rate(istio_request_duration_milliseconds_bucket{{destination_service="{self.config.service_name}.{self.config.namespace}.svc.cluster.local"}}[5m])) by (le))
        """
        
        latency_99_query = f"""
        histogram_quantile(0.99, sum(rate(istio_request_duration_milliseconds_bucket{{destination_service="{self.config.service_name}.{self.config.namespace}.svc.cluster.local"}}[5m])) by (le))
        """
        
        # CPU使用率查询
        cpu_query = f"""
        sum(rate(container_cpu_usage_seconds_total{{namespace="{self.config.namespace}", pod=~"{self.config.service_name}-{self.config.canary_version}-.*"}}[5m])) 
        / 
        sum(kube_pod_container_resource_limits{{namespace="{self.config.namespace}", pod=~"{self.config.service_name}-{self.config.canary_version}-.*", resource="cpu"}})
        """
        
        try:
            # 执行查询
            error_rate_result = self.prometheus.custom_query(error_rate_query)
            latency_95_result = self.prometheus.custom_query(latency_95_query)
            latency_99_result = self.prometheus.custom_query(latency_99_query)
            cpu_result = self.prometheus.custom_query(cpu_query)
            
            # 解析结果
            error_rate = float(error_rate_result[0]['value'][1]) if error_rate_result else 0.0
            latency_95 = float(latency_95_result[0]['value'][1]) if latency_95_result else 0.0
            latency_99 = float(latency_99_result[0]['value'][1]) if latency_99_result else 0.0
            cpu_usage = float(cpu_result[0]['value'][1]) if cpu_result else 0.0
            
            return CanaryMetrics(
                error_rate=error_rate,
                latency_95th=latency_95,
                latency_99th=latency_99,
                request_rate=0.0,  # 简化处理
                cpu_usage=cpu_usage,
                memory_usage=0.0,  # 简化处理
                timestamp=end_time
            )
            
        except Exception as e:
            log(f"Error collecting metrics: {e}")
            # 返回默认值
            return CanaryMetrics(
                error_rate=0.0,
                latency_95th=0.0,
                latency_99th=0.0,
                request_rate=0.0,
                cpu_usage=0.0,
                memory_usage=0.0,
                timestamp=end_time
            )
    
    def _rollback(self):
        """回滚到稳定版本"""
        log("Rolling back to stable version")
        self._set_traffic_weight(0)  # 100%流量回到稳定版本
        log("Rollback completed")
    
    def promote_to_production(self):
        """将金丝雀版本提升为生产版本"""
        log("Promoting canary version to production")
        self._set_traffic_weight(100)  # 100%流量到金丝雀版本
        log("Promotion completed")

def log(message: str):
    """日志函数"""
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}")

# 使用示例
if __name__ == "__main__":
    # 配置示例
    config = CanaryConfig(
        service_name="myapp",
        namespace="production",
        stable_version="v1.0",
        canary_version="v2.0",
        initial_weight=5,
        step_weight=10,
        max_weight=100,
        step_interval=300,
        metrics_thresholds={
            "error_rate": 0.01,      # 错误率不超过1%
            "latency_95th": 500.0,   # 95%延迟不超过500ms
            "latency_99th": 1000.0,  # 99%延迟不超过1000ms
            "cpu_usage": 0.8         # CPU使用率不超过80%
        }
    )
    
    # 创建控制器
    controller = CanaryController(config, "http://prometheus:9090")
    
    # 启动金丝雀发布
    success = controller.start_canary_release()
    
    if success:
        print("Canary release completed successfully")
        # 可选：将金丝雀版本提升为生产版本
        # controller.promote_to_production()
    else:
        print("Canary release failed")
```

### 金丝雀发布优缺点分析

#### 优点
1. **风险控制**：逐步暴露新版本，降低整体风险
2. **实时监控**：可以实时监控新版本表现
3. **灵活调整**：可以根据监控结果调整流量比例
4. **用户反馈**：可以收集早期用户反馈

#### 缺点
1. **实现复杂**：需要复杂的路由和监控机制
2. **数据一致性**：需要处理新旧版本间的数据一致性问题
3. **时间成本**：发布过程较长

## 滚动发布（Rolling Update）

滚动发布是一种逐步替换旧版本Pod的部署策略，通过逐个或分批替换实例来实现平滑升级。

### 实现原理

滚动发布的核心思想是：
- 逐步替换旧版本的实例，而不是一次性全部替换
- 在替换过程中保持服务的连续性
- 可以控制替换的速度和批次

### 滚动发布实现

#### Kubernetes滚动发布配置
```yaml
# Deployment配置支持滚动更新
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
  labels:
    app: myapp
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1        # 最大不可用实例数
      maxSurge: 1             # 最大超出期望实例数
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: v2.0
    spec:
      containers:
      - name: myapp
        image: myapp:v2.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "1"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3
```

#### 滚动发布监控脚本
```bash
#!/bin/bash
# 滚动发布监控脚本

set -e

DEPLOYMENT_NAME=${1:-myapp}
NAMESPACE=${2:-production}
TIMEOUT=${3:-600}  # 超时时间（秒）

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

monitor_rolling_update() {
    log "Monitoring rolling update for deployment: $DEPLOYMENT_NAME"
    
    start_time=$(date +%s)
    
    while true; do
        # 检查是否超时
        current_time=$(date +%s)
        if [ $((current_time - start_time)) -gt $TIMEOUT ]; then
            log "ERROR: Timeout waiting for rolling update to complete"
            exit 1
        fi
        
        # 获取Deployment状态
        status=$(kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=30s 2>&1)
        
        # 检查是否完成
        if echo "$status" | grep -q "successfully rolled out"; then
            log "Rolling update completed successfully"
            break
        fi
        
        # 检查是否有错误
        if echo "$status" | grep -q "error"; then
            log "ERROR: Rolling update failed: $status"
            exit 1
        fi
        
        # 显示当前状态
        replicas=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.replicas}')
        updated_replicas=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.status.updatedReplicas}')
        ready_replicas=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
        available_replicas=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.status.availableReplicas}')
        
        log "Deployment status: $updated_replicas/$replicas updated, $ready_replicas ready, $available_replicas available"
        
        # 等待一段时间再检查
        sleep 30
    done
    
    # 验证服务健康
    verify_service_health
}

verify_service_health() {
    log "Verifying service health..."
    
    # 获取服务地址
    SERVICE_URL=$(kubectl get service $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    if [ -z "$SERVICE_URL" ]; then
        SERVICE_URL=$(kubectl get service $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    fi
    
    # 执行健康检查
    for i in {1..20}; do
        if curl -f -s --max-time 10 "http://$SERVICE_URL/health" > /dev/null; then
            log "Health check $i succeeded"
        else
            log "ERROR: Health check $i failed"
            exit 1
        fi
        sleep 5
    done
    
    log "Service health verification completed successfully"
}

# 执行监控
monitor_rolling_update
```

### 滚动发布优缺点分析

#### 优点
1. **资源效率**：不需要额外的环境资源
2. **实现简单**：Kubernetes原生支持
3. **平滑过渡**：用户无感知的升级过程
4. **可控制性**：可以精确控制更新过程

#### 缺点
1. **回滚复杂**：回滚需要重新部署旧版本
2. **数据风险**：如果新版本有问题，可能影响所有实例
3. **时间较长**：大规模部署需要较长时间

## 功能开关（Feature Toggle）

功能开关是一种通过配置控制功能启用/禁用的策略，可以在不部署新代码的情况下控制功能的可用性。

### 实现原理

功能开关的核心思想是：
- 在代码中加入条件判断，根据配置决定是否启用某个功能
- 通过配置管理工具动态调整功能开关状态
- 可以针对不同用户、环境或时间段启用不同功能

### 功能开关实现

#### 功能开关管理类
```python
#!/usr/bin/env python3
"""
功能开关管理工具
支持动态配置和多维度控制
"""

import json
import redis
import hashlib
from typing import Dict, Any, Optional, List
from enum import Enum
from dataclasses import dataclass
import datetime

class ToggleState(Enum):
    """功能开关状态"""
    ENABLED = "enabled"
    DISABLED = "disabled"
    PARTIAL = "partial"

class UserSegment(Enum):
    """用户分段"""
    ALL = "all"
    INTERNAL = "internal"
    BETA = "beta"
    PREMIUM = "premium"

@dataclass
class FeatureToggle:
    """功能开关配置"""
    name: str
    state: ToggleState
    description: str
    enabled_for: List[UserSegment] = None
    percentage: int = 100  # 0-100
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    conditions: Dict[str, Any] = None

class FeatureToggleManager:
    def __init__(self, redis_host: str = 'localhost', redis_port: int = 6379):
        self.redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
        self.cache = {}  # 本地缓存
        self.cache_ttl = 60  # 缓存时间（秒）
        self.cache_timestamps = {}
    
    def is_feature_enabled(
        self,
        feature_name: str,
        user_id: Optional[str] = None,
        user_segment: Optional[UserSegment] = None,
        context: Dict[str, Any] = None
    ) -> bool:
        """
        检查功能是否启用
        
        Args:
            feature_name: 功能名称
            user_id: 用户ID
            user_segment: 用户分段
            context: 上下文信息
            
        Returns:
            功能是否启用
        """
        try:
            # 获取功能开关配置
            toggle = self._get_toggle_config(feature_name)
            if not toggle:
                return False
            
            # 检查时间范围
            if not self._is_time_valid(toggle):
                return False
            
            # 根据状态判断
            if toggle.state == ToggleState.DISABLED:
                return False
            elif toggle.state == ToggleState.ENABLED:
                return True
            elif toggle.state == ToggleState.PARTIAL:
                return self._evaluate_partial_toggle(toggle, user_id, user_segment, context)
            
            return False
            
        except Exception as e:
            # 发生错误时，默认禁用功能
            print(f"Error checking feature toggle {feature_name}: {e}")
            return False
    
    def _get_toggle_config(self, feature_name: str) -> Optional[FeatureToggle]:
        """
        获取功能开关配置
        
        Args:
            feature_name: 功能名称
            
        Returns:
            功能开关配置
        """
        # 检查本地缓存
        if feature_name in self.cache:
            cache_time = self.cache_timestamps.get(feature_name, 0)
            if datetime.datetime.now().timestamp() - cache_time < self.cache_ttl:
                return self.cache[feature_name]
        
        # 从Redis获取配置
        config_json = self.redis_client.get(f"feature_toggle:{feature_name}")
        if not config_json:
            return None
        
        try:
            config = json.loads(config_json)
            toggle = FeatureToggle(
                name=config['name'],
                state=ToggleState(config['state']),
                description=config['description'],
                enabled_for=[UserSegment(segment) for segment in config.get('enabled_for', [])],
                percentage=config.get('percentage', 100),
                start_time=datetime.datetime.fromisoformat(config['start_time']) if config.get('start_time') else None,
                end_time=datetime.datetime.fromisoformat(config['end_time']) if config.get('end_time') else None,
                conditions=config.get('conditions', {})
            )
            
            # 更新本地缓存
            self.cache[feature_name] = toggle
            self.cache_timestamps[feature_name] = datetime.datetime.now().timestamp()
            
            return toggle
            
        except Exception as e:
            print(f"Error parsing feature toggle config for {feature_name}: {e}")
            return None
    
    def _is_time_valid(self, toggle: FeatureToggle) -> bool:
        """
        检查时间是否有效
        
        Args:
            toggle: 功能开关配置
            
        Returns:
            时间是否有效
        """
        now = datetime.datetime.now()
        
        if toggle.start_time and now < toggle.start_time:
            return False
        
        if toggle.end_time and now > toggle.end_time:
            return False
        
        return True
    
    def _evaluate_partial_toggle(
        self,
        toggle: FeatureToggle,
        user_id: Optional[str],
        user_segment: Optional[UserSegment],
        context: Dict[str, Any]
    ) -> bool:
        """
        评估部分启用的功能开关
        
        Args:
            toggle: 功能开关配置
            user_id: 用户ID
            user_segment: 用户分段
            context: 上下文信息
            
        Returns:
            功能是否启用
        """
        # 检查用户分段
        if toggle.enabled_for and user_segment:
            if user_segment not in toggle.enabled_for and UserSegment.ALL not in toggle.enabled_for:
                return False
        
        # 检查百分比
        if toggle.percentage < 100 and user_id:
            # 使用用户ID进行一致性哈希
            hash_value = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
            user_percentage = hash_value % 100
            if user_percentage >= toggle.percentage:
                return False
        
        # 检查自定义条件
        if toggle.conditions and context:
            return self._evaluate_conditions(toggle.conditions, context)
        
        return True
    
    def _evaluate_conditions(self, conditions: Dict[str, Any], context: Dict[str, Any]) -> bool:
        """
        评估自定义条件
        
        Args:
            conditions: 条件配置
            context: 上下文信息
            
        Returns:
            条件是否满足
        """
        for key, expected_value in conditions.items():
            if key not in context:
                return False
            
            actual_value = context[key]
            
            # 支持多种比较操作
            if isinstance(expected_value, dict):
                op = expected_value.get('op')
                value = expected_value.get('value')
                
                if op == 'eq' and actual_value != value:
                    return False
                elif op == 'gt' and actual_value <= value:
                    return False
                elif op == 'lt' and actual_value >= value:
                    return False
                elif op == 'in' and actual_value not in value:
                    return False
                elif op == 'contains' and value not in actual_value:
                    return False
            else:
                # 默认相等比较
                if actual_value != expected_value:
                    return False
        
        return True
    
    def set_toggle(
        self,
        feature_name: str,
        state: ToggleState,
        description: str = "",
        enabled_for: List[UserSegment] = None,
        percentage: int = 100,
        start_time: Optional[datetime.datetime] = None,
        end_time: Optional[datetime.datetime] = None,
        conditions: Dict[str, Any] = None
    ):
        """
        设置功能开关
        
        Args:
            feature_name: 功能名称
            state: 开关状态
            description: 描述
            enabled_for: 启用的用户分段
            percentage: 启用百分比
            start_time: 开始时间
            end_time: 结束时间
            conditions: 自定义条件
        """
        toggle = FeatureToggle(
            name=feature_name,
            state=state,
            description=description,
            enabled_for=enabled_for or [],
            percentage=percentage,
            start_time=start_time,
            end_time=end_time,
            conditions=conditions or {}
        )
        
        # 保存到Redis
        config = {
            'name': toggle.name,
            'state': toggle.state.value,
            'description': toggle.description,
            'enabled_for': [segment.value for segment in toggle.enabled_for],
            'percentage': toggle.percentage,
            'start_time': toggle.start_time.isoformat() if toggle.start_time else None,
            'end_time': toggle.end_time.isoformat() if toggle.end_time else None,
            'conditions': toggle.conditions
        }
        
        self.redis_client.set(
            f"feature_toggle:{feature_name}",
            json.dumps(config),
            ex=3600  # 1小时过期
        )
        
        # 清除本地缓存
        if feature_name in self.cache:
            del self.cache[feature_name]
        if feature_name in self.cache_timestamps:
            del self.cache_timestamps[feature_name]
    
    def get_all_toggles(self) -> List[FeatureToggle]:
        """
        获取所有功能开关
        
        Returns:
            功能开关列表
        """
        keys = self.redis_client.keys("feature_toggle:*")
        toggles = []
        
        for key in keys:
            feature_name = key.replace("feature_toggle:", "")
            toggle = self._get_toggle_config(feature_name)
            if toggle:
                toggles.append(toggle)
        
        return toggles

# 功能开关使用示例
class FeatureToggleExample:
    def __init__(self):
        self.toggle_manager = FeatureToggleManager()
    
    def new_feature_handler(self, user_id: str, user_role: str) -> str:
        """
        使用功能开关的新功能处理函数
        
        Args:
            user_id: 用户ID
            user_role: 用户角色
            
        Returns:
            处理结果
        """
        # 确定用户分段
        if user_role == 'admin':
            user_segment = UserSegment.INTERNAL
        elif user_role == 'beta_user':
            user_segment = UserSegment.BETA
        elif user_role == 'premium':
            user_segment = UserSegment.PREMIUM
        else:
            user_segment = None
        
        # 检查新功能是否启用
        if self.toggle_manager.is_feature_enabled(
            'new_recommendation_engine',
            user_id=user_id,
            user_segment=user_segment,
            context={'user_role': user_role, 'request_time': datetime.datetime.now().hour}
        ):
            return self._new_recommendation_engine(user_id)
        else:
            return self._old_recommendation_engine(user_id)
    
    def _new_recommendation_engine(self, user_id: str) -> str:
        """新推荐引擎"""
        return f"New recommendation for user {user_id}"
    
    def _old_recommendation_engine(self, user_id: str) -> str:
        """旧推荐引擎"""
        return f"Old recommendation for user {user_id}"

# 初始化功能开关配置示例
def initialize_feature_toggles():
    """初始化功能开关配置"""
    toggle_manager = FeatureToggleManager()
    
    # 启用新推荐引擎，仅对内部用户和Beta用户开放
    toggle_manager.set_toggle(
        'new_recommendation_engine',
        ToggleState.PARTIAL,
        'New AI-powered recommendation engine',
        enabled_for=[UserSegment.INTERNAL, UserSegment.BETA],
        percentage=50,  # 50%的符合条件用户
        start_time=datetime.datetime.now(),
        conditions={
            'request_time': {'op': 'gt', 'value': 8},  # 只在上午8点后启用
            'request_time': {'op': 'lt', 'value': 20}  # 只在晚上8点前启用
        }
    )
    
    # 启用新的UI界面，对所有用户开放20%
    toggle_manager.set_toggle(
        'new_ui_interface',
        ToggleState.PARTIAL,
        'New modern UI interface',
        enabled_for=[UserSegment.ALL],
        percentage=20
    )
    
    # 临时禁用支付功能
    toggle_manager.set_toggle(
        'payment_feature',
        ToggleState.DISABLED,
        'Payment feature temporarily disabled due to maintenance'
    )

if __name__ == "__main__":
    # 初始化功能开关
    initialize_feature_toggles()
    
    # 使用示例
    example = FeatureToggleExample()
    
    # 测试不同用户
    test_users = [
        ('user1', 'admin'),
        ('user2', 'beta_user'),
        ('user3', 'premium'),
        ('user4', 'regular')
    ]
    
    for user_id, user_role in test_users:
        result = example.new_feature_handler(user_id, user_role)
        print(f"User {user_id} ({user_role}): {result}")
```

### 功能开关优缺点分析

#### 优点
1. **灵活控制**：可以动态启用/禁用功能
2. **风险隔离**：可以限制功能的用户范围
3. **A/B测试**：支持功能的A/B测试
4. **快速回滚**：出现问题时可以快速禁用功能

#### 缺点
1. **代码复杂性**：增加代码复杂性和维护成本
2. **技术债务**：废弃的功能开关需要及时清理
3. **性能影响**：频繁的配置检查可能影响性能

## 部署策略选择指南

### 根据场景选择策略

#### 高可用性要求场景
对于要求零停机时间的关键业务系统，推荐使用**蓝绿部署**或**金丝雀发布**。

#### 资源受限场景
对于资源有限的环境，推荐使用**滚动发布**，避免维护双倍资源。

#### 功能灰度发布场景
对于需要逐步验证新功能的场景，推荐使用**金丝雀发布**或**功能开关**。

#### 快速迭代场景
对于需要快速迭代的开发环境，推荐使用**滚动发布**，部署速度快。

### 策略组合使用

在实际应用中，往往需要组合使用多种部署策略：

1. **开发环境**：滚动发布，快速迭代
2. **测试环境**：滚动发布，完整测试
3. **预发环境**：金丝雀发布，小范围验证
4. **生产环境**：蓝绿部署，零停机时间

通过合理选择和组合使用不同的部署策略，团队能够在保证系统稳定性和业务连续性的同时，实现高效的软件交付。每种策略都有其适用场景和优缺点，需要根据具体的业务需求、技术架构和资源情况来选择最合适的策略。