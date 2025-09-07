---
title: 部署与发布策略
date: 2025-08-30
categories: [CICD]
tags: [CICD]
published: true
---

在现代软件交付实践中，部署与发布策略是确保系统稳定性和业务连续性的关键环节。随着微服务架构和云原生技术的普及，传统的单一应用部署方式已无法满足复杂系统的部署需求。通过合理的部署策略，团队能够在保证系统稳定性的同时，实现快速、安全的软件交付。本文将深入探讨环境管理、部署策略、Kubernetes集成以及审批与安全管控等关键方面，帮助团队构建高效可靠的部署体系。

## 9.1 环境管理：开发、测试、预发、生产环境的自动化管理与隔离

环境管理是CI/CD流程中的基础环节，它确保了软件在不同阶段的验证和交付。通过自动化环境管理和有效隔离，团队能够提高开发效率、减少环境相关问题，并确保生产环境的稳定性。

### 环境层次结构设计

#### 开发环境（Development Environment）
开发环境是开发人员进行日常开发和调试的环境，具有以下特点：
- 灵活性高，允许开发人员自由配置和修改
- 资源相对较少，成本控制优先
- 数据通常是模拟或脱敏的测试数据
- 可能存在多个并行的开发环境，支持特性分支开发

#### 测试环境（Testing Environment）
测试环境用于执行各种类型的测试，包括功能测试、集成测试和性能测试：
- 环境配置相对稳定，与生产环境尽可能一致
- 包含完整的测试数据集
- 支持自动化测试执行
- 可能存在多个测试环境以支持并行测试

#### 预发环境（Staging Environment）
预发环境是生产环境的镜像，用于最终验证：
- 配置与生产环境完全一致
- 使用真实的生产数据子集或脱敏数据
- 用于用户验收测试和最终验证
- 部署流程与生产环境完全相同

#### 生产环境（Production Environment）
生产环境是为最终用户提供服务的环境：
- 高可用性和稳定性要求最高
- 严格的安全和合规要求
- 完整的监控和告警体系
- 严格的变更控制流程

### 环境自动化管理

#### 基础设施即代码（IaC）实现
```hcl
# Terraform配置示例：多环境基础设施管理
variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["dev", "test", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, staging, prod"
  }
}

# 环境特定配置
locals {
  env_config = {
    dev = {
      instance_count = 1
      instance_type  = "t3.micro"
      db_size        = "db.t3.micro"
    }
    test = {
      instance_count = 2
      instance_type  = "t3.small"
      db_size        = "db.t3.small"
    }
    staging = {
      instance_count = 3
      instance_type  = "t3.medium"
      db_size        = "db.t3.medium"
    }
    prod = {
      instance_count = 5
      instance_type  = "t3.large"
      db_size        = "db.t3.large"
    }
  }
  
  config = local.env_config[var.environment]
}

# VPC配置
resource "aws_vpc" "main" {
  cidr_block           = var.environment == "prod" ? "10.0.0.0/16" : "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

# 应用服务器组
resource "aws_launch_template" "app" {
  name_prefix   = "${var.environment}-app-"
  image_id      = var.ami_id
  instance_type = local.config.instance_type

  vpc_security_group_ids = [aws_security_group.app.id]

  user_data = base64encode(templatefile("${path.module}/templates/user-data.sh", {
    environment = var.environment
    app_version = var.app_version
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment}-app-instance"
      Environment = var.environment
    }
  }
}

# 自动扩展组
resource "aws_autoscaling_group" "app" {
  desired_capacity     = local.config.instance_count
  max_size             = local.config.instance_count * 2
  min_size             = local.config.instance_count
  vpc_zone_identifier  = aws_subnet.private[*].id
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [desired_capacity]
  }
}
```

#### 环境配置管理
```python
#!/usr/bin/env python3
"""
环境配置管理工具
支持多环境配置的统一管理和动态调整
"""

import yaml
import json
from typing import Dict, Any
from dataclasses import dataclass
from enum import Enum

class Environment(Enum):
    DEVELOPMENT = "dev"
    TESTING = "test"
    STAGING = "staging"
    PRODUCTION = "prod"

@dataclass
class EnvironmentConfig:
    name: str
    instance_count: int
    cpu_limit: str
    memory_limit: str
    storage_size: str
    replicas: int
    autoscaling: bool
    monitoring_level: str
    backup_enabled: bool
    security_level: str

class EnvironmentManager:
    def __init__(self, config_file: str):
        with open(config_file, 'r') as f:
            self.config_data = yaml.safe_load(f)
    
    def get_environment_config(self, env: Environment) -> EnvironmentConfig:
        """
        获取指定环境的配置
        
        Args:
            env: 环境枚举值
            
        Returns:
            环境配置对象
        """
        env_config = self.config_data['environments'][env.value]
        
        return EnvironmentConfig(
            name=env.value,
            instance_count=env_config['instance_count'],
            cpu_limit=env_config['resources']['cpu_limit'],
            memory_limit=env_config['resources']['memory_limit'],
            storage_size=env_config['resources']['storage_size'],
            replicas=env_config['deployment']['replicas'],
            autoscaling=env_config['deployment']['autoscaling'],
            monitoring_level=env_config['monitoring']['level'],
            backup_enabled=env_config['backup']['enabled'],
            security_level=env_config['security']['level']
        )
    
    def create_environment(self, env: Environment) -> bool:
        """
        创建环境
        
        Args:
            env: 环境枚举值
            
        Returns:
            创建是否成功
        """
        try:
            config = self.get_environment_config(env)
            # 调用基础设施提供商API创建环境
            # 这里简化处理，实际应该调用具体的IaC工具
            
            print(f"Creating environment: {env.value}")
            print(f"Configuration: {config}")
            
            # 模拟创建过程
            return True
        except Exception as e:
            print(f"Failed to create environment {env.value}: {e}")
            return False
    
    def destroy_environment(self, env: Environment) -> bool:
        """
        销毁环境
        
        Args:
            env: 环境枚举值
            
        Returns:
            销毁是否成功
        """
        try:
            print(f"Destroying environment: {env.value}")
            # 调用基础设施提供商API销毁环境
            # 这里简化处理
            
            return True
        except Exception as e:
            print(f"Failed to destroy environment {env.value}: {e}")
            return False

# 环境配置文件示例 (environments.yaml)
"""
environments:
  dev:
    instance_count: 1
    resources:
      cpu_limit: "500m"
      memory_limit: "1Gi"
      storage_size: "10Gi"
    deployment:
      replicas: 1
      autoscaling: false
    monitoring:
      level: "basic"
    backup:
      enabled: false
    security:
      level: "standard"
  
  test:
    instance_count: 2
    resources:
      cpu_limit: "1"
      memory_limit: "2Gi"
      storage_size: "50Gi"
    deployment:
      replicas: 2
      autoscaling: true
    monitoring:
      level: "detailed"
    backup:
      enabled: true
    security:
      level: "standard"
  
  staging:
    instance_count: 3
    resources:
      cpu_limit: "2"
      memory_limit: "4Gi"
      storage_size: "100Gi"
    deployment:
      replicas: 3
      autoscaling: true
    monitoring:
      level: "comprehensive"
    backup:
      enabled: true
    security:
      level: "enhanced"
  
  prod:
    instance_count: 5
    resources:
      cpu_limit: "4"
      memory_limit: "8Gi"
      storage_size: "500Gi"
    deployment:
      replicas: 5
      autoscaling: true
    monitoring:
      level: "comprehensive"
    backup:
      enabled: true
    security:
      level: "maximum"
"""
```

### 环境隔离策略

#### 网络隔离
```yaml
# Kubernetes网络策略示例：环境网络隔离
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: environment-isolation
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # 允许同环境内的Pod通信
  - from:
    - namespaceSelector:
        matchLabels:
          environment: dev
    ports:
    - protocol: TCP
      port: 8080
  # 允许特定的外部访问
  - from:
    - ipBlock:
        cidr: 10.0.0.0/8
    ports:
    - protocol: TCP
      port: 80
  egress:
  # 允许访问同环境内的服务
  - to:
    - namespaceSelector:
        matchLabels:
          environment: dev
    ports:
    - protocol: TCP
      port: 5432  # 数据库端口
  # 允许访问外部依赖
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
    ports:
    - protocol: TCP
      port: 443  # HTTPS
    - protocol: TCP
      port: 53   # DNS
```

#### 资源隔离
```yaml
# Kubernetes资源配额示例：环境资源隔离
apiVersion: v1
kind: ResourceQuota
metadata:
  name: env-resource-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
    persistentvolumeclaims: "10"
    services.loadbalancers: "2"
    services.nodeports: "0"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: env-limit-range
  namespace: dev
spec:
  limits:
  - default:
      cpu: 500m
      memory: 512Mi
    defaultRequest:
      cpu: 250m
      memory: 256Mi
    type: Container
```

## 9.2 部署策略详解：蓝绿部署、金丝雀发布、滚动发布、功能开关

不同的部署策略适用于不同的业务场景和风险偏好，选择合适的部署策略能够平衡发布速度与系统稳定性。

### 蓝绿部署（Blue-Green Deployment）

蓝绿部署通过维护两套完全相同的生产环境来实现零停机时间部署。

#### 实现原理
蓝绿部署维护两个完全独立的生产环境：
- 蓝色环境：当前正在提供服务的生产环境
- 绿色环境：待部署新版本的备用环境

部署流程：
1. 在绿色环境中部署新版本应用
2. 在绿色环境中进行完整的测试验证
3. 将流量从蓝色环境切换到绿色环境
4. 验证绿色环境运行正常后，蓝色环境变为备用

#### 蓝绿部署实现
```yaml
# Kubernetes蓝绿部署示例
# 蓝色环境部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
spec:
  replicas: 3
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
---
# 绿色环境部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 3
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
        image: myapp:v2.0
        ports:
        - containerPort: 8080

---
# 蓝色服务
apiVersion: v1
kind: Service
metadata:
  name: myapp-blue
spec:
  selector:
    app: myapp
    version: blue
  ports:
  - port: 80
    targetPort: 8080

---
# 绿色服务
apiVersion: v1
kind: Service
metadata:
  name: myapp-green
spec:
  selector:
    app: myapp
    version: green
  ports:
  - port: 80
    targetPort: 8080

---
# 主服务（流量切换点）
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # 切换时修改此标签
  ports:
  - port: 80
    targetPort: 8080
```

#### 蓝绿部署切换脚本
```bash
#!/bin/bash
# 蓝绿部署切换脚本

DEPLOYMENT_NAME="myapp"
CURRENT_VERSION="blue"
NEW_VERSION="green"

# 验证新版本是否准备就绪
echo "Validating new version..."
kubectl rollout status deployment/${DEPLOYMENT_NAME}-${NEW_VERSION}

if [ $? -ne 0 ]; then
    echo "New version is not ready, aborting deployment"
    exit 1
fi

# 执行金丝雀测试（可选）
echo "Performing canary test..."
# 这里可以添加具体的金丝雀测试逻辑

# 切换流量
echo "Switching traffic to new version..."
kubectl patch service ${DEPLOYMENT_NAME} -p "{\"spec\":{\"selector\":{\"version\":\"${NEW_VERSION}\"}}}"

# 等待切换完成
sleep 30

# 验证切换结果
echo "Validating traffic switch..."
# 这里可以添加验证逻辑

# 如果验证成功，销毁旧环境
echo "Cleaning up old environment..."
kubectl delete deployment ${DEPLOYMENT_NAME}-${CURRENT_VERSION}

echo "Blue-green deployment completed successfully"
```

### 金丝雀发布（Canary Release）

金丝雀发布通过逐步将新版本暴露给部分用户来降低发布风险。

#### 实现原理
金丝雀发布的核心思想是：
- 初始时，只有少量用户（例如1-5%）会被路由到新版本
- 逐步增加新版本的流量比例
- 监控新版本的性能和错误率
- 如果一切正常，最终将100%流量切换到新版本

#### 金丝雀发布实现
```yaml
# Istio金丝雀发布配置示例
# 虚拟服务定义流量路由规则
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myapp
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

---
# 目标规则定义版本子集
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: myapp
spec:
  host: myapp
  subsets:
  - name: v1
    labels:
      version: v1.0
  - name: v2
    labels:
      version: v2.0
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
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class CanaryConfig:
    service_name: str
    stable_version: str
    canary_version: str
    initial_weight: int = 5
    step_weight: int = 5
    max_weight: int = 100
    step_interval: int = 60  # 秒
    metrics_thresholds: Dict[str, float] = None

class CanaryController:
    def __init__(self, config: CanaryConfig, metrics_client, istio_client):
        self.config = config
        self.metrics_client = metrics_client
        self.istio_client = istio_client
    
    def start_canary_release(self) -> bool:
        """
        启动金丝雀发布
        
        Returns:
            发布是否成功
        """
        try:
            # 初始化流量权重
            current_weight = self.config.initial_weight
            
            # 设置初始流量分配
            self._set_traffic_weight(current_weight)
            
            # 渐进式增加流量
            while current_weight < self.config.max_weight:
                # 等待观察期
                time.sleep(self.config.step_interval)
                
                # 检查指标
                if not self._check_metrics():
                    print("Metrics check failed, rolling back")
                    self._rollback()
                    return False
                
                # 增加流量权重
                current_weight = min(
                    current_weight + self.config.step_weight,
                    self.config.max_weight
                )
                
                print(f"Increasing canary weight to {current_weight}%")
                self._set_traffic_weight(current_weight)
            
            # 完成发布
            print("Canary release completed successfully")
            return True
            
        except Exception as e:
            print(f"Canary release failed: {e}")
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
        self.istio_client.update_virtual_service(
            self.config.service_name,
            {
                self.config.stable_version: stable_weight,
                self.config.canary_version: canary_weight
            }
        )
    
    def _check_metrics(self) -> bool:
        """
        检查关键指标
        
        Returns:
            指标是否正常
        """
        if not self.config.metrics_thresholds:
            return True
        
        # 获取关键指标
        metrics = self.metrics_client.get_service_metrics(
            self.config.service_name,
            self.config.canary_version
        )
        
        # 检查各项指标阈值
        for metric_name, threshold in self.config.metrics_thresholds.items():
            if metric_name in metrics:
                actual_value = metrics[metric_name]
                if actual_value > threshold:
                    print(f"Metric {metric_name} exceeded threshold: {actual_value} > {threshold}")
                    return False
        
        return True
    
    def _rollback(self):
        """回滚到稳定版本"""
        print("Rolling back to stable version")
        self._set_traffic_weight(0)  # 100%流量回到稳定版本

# 金丝雀发布配置示例
"""
canary_config:
  service_name: "myapp"
  stable_version: "v1.0"
  canary_version: "v2.0"
  initial_weight: 5
  step_weight: 10
  max_weight: 100
  step_interval: 120
  metrics_thresholds:
    error_rate: 0.01  # 错误率不超过1%
    latency_95th: 500  # 95%延迟不超过500ms
    cpu_usage: 0.8  # CPU使用率不超过80%
"""
```

## 9.3 与Kubernetes的深度集成：Helm/Manifest的自动化部署

Kubernetes已成为云原生应用部署的事实标准，通过与Kubernetes的深度集成，CI/CD平台能够实现更高效的自动化部署。

### Helm集成实践

#### Helm Chart结构设计
```
myapp-chart/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
├── values-prod.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── _helpers.tpl
└── README.md
```

#### Helm模板示例
```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
        version: {{ .Values.image.tag | quote }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.port }}
              protocol: TCP
          env:
            {{- range $key, $value := .Values.env }}
            - name: {{ $key }}
              value: {{ $value | quote }}
            {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: {{ .Values.probe.liveness.initialDelaySeconds }}
            periodSeconds: {{ .Values.probe.liveness.periodSeconds }}
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: {{ .Values.probe.readiness.initialDelaySeconds }}
            periodSeconds: {{ .Values.probe.readiness.periodSeconds }}
```

#### 环境特定的values文件
```yaml
# values-prod.yaml
replicaCount: 5

image:
  repository: myapp
  tag: v1.2.3
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8080

env:
  ENV: production
  LOG_LEVEL: INFO
  DB_HOST: prod-db.example.com

resources:
  limits:
    cpu: 2
    memory: 4Gi
  requests:
    cpu: 1
    memory: 2Gi

probe:
  liveness:
    initialDelaySeconds: 60
    periodSeconds: 30
  readiness:
    initialDelaySeconds: 30
    periodSeconds: 10

autoscaling:
  enabled: true
  minReplicas: 5
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70

ingress:
  enabled: true
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
```

#### CI/CD中的Helm集成
```yaml
# GitLab CI中的Helm部署示例
deploy-staging:
  stage: deploy
  image: 
    name: dtzar/helm-kubectl:3.10.0
    entrypoint: [""]
  script:
    - |
      # 添加Helm仓库
      helm repo add myapp https://myapp.github.io/helm-charts
      helm repo update
      
      # 部署到预发环境
      helm upgrade --install \
        myapp-staging \
        myapp/myapp-chart \
        --namespace staging \
        --create-namespace \
        --values values-staging.yaml \
        --set image.tag=$CI_COMMIT_SHORT_SHA \
        --set appVersion=$CI_COMMIT_TAG \
        --timeout 300s \
        --wait
      
      # 验证部署
      kubectl rollout status deployment/myapp-staging -n staging
  environment:
    name: staging
  only:
    - staging

deploy-production:
  stage: deploy
  image: 
    name: dtzar/helm-kubectl:3.10.0
    entrypoint: [""]
  script:
    - |
      # 部署到生产环境（蓝绿部署方式）
      helm upgrade --install \
        myapp-green \
        myapp/myapp-chart \
        --namespace production \
        --values values-prod.yaml \
        --set image.tag=$CI_COMMIT_SHORT_SHA \
        --set appVersion=$CI_COMMIT_TAG \
        --timeout 600s \
        --wait
      
      # 执行蓝绿切换
      ./scripts/blue-green-switch.sh myapp production
  environment:
    name: production
  when: manual
  only:
    - master
```

### Kubernetes Manifest管理

#### Kustomize集成
```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- deployment.yaml
- service.yaml
- ingress.yaml

configMapGenerator:
- name: myapp-config
  envs:
  - config.env

secretGenerator:
- name: myapp-secrets
  envs:
  - secrets.env

images:
- name: myapp
  newName: myapp
  newTag: v1.2.3

commonLabels:
  app: myapp
  version: v1.2.3

namespace: myapp-prod
```

#### 环境覆盖配置
```yaml
# overlays/staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
- ../../base

namePrefix: staging-

patchesStrategicMerge:
- deployment-patch.yaml

configMapGenerator:
- name: myapp-config
  behavior: merge
  envs:
  - config-staging.env

namespace: myapp-staging
```

```yaml
# overlays/staging/deployment-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: myapp
        env:
        - name: ENV
          value: staging
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

## 9.4 审批与安全管控：人工卡点、安全扫描、合规检查

在CI/CD流程中，审批与安全管控是确保软件质量和合规性的关键环节。

### 人工审批机制

#### 审批流程设计
```yaml
# Jenkins Pipeline中的审批步骤
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'sonar-scanner'
            }
        }
        
        stage('Approval') {
            steps {
                timeout(time: 1, unit: 'DAYS') {
                    input(
                        message: 'Approve deployment to production?',
                        submitter: 'devops-team,architects',
                        parameters: [
                            choice(
                                choices: ['Approve', 'Reject'],
                                description: 'Deployment decision',
                                name: 'decision'
                            ),
                            text(
                                defaultValue: '',
                                description: 'Reason for decision',
                                name: 'reason'
                            )
                        ]
                    )
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'kubectl apply -f k8s/production/'
            }
        }
    }
}
```

#### 审批管理系统
```python
#!/usr/bin/env python3
"""
审批管理系统
支持多级审批和审批历史追踪
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
import datetime

class ApprovalStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

class ApprovalType(Enum):
    DEPLOYMENT = "deployment"
    CONFIG_CHANGE = "config_change"
    SECURITY_EXCEPTION = "security_exception"

@dataclass
class ApprovalRequest:
    id: str
    type: ApprovalType
    requester: str
    approvers: List[str]
    description: str
    created_at: datetime.datetime
    expires_at: datetime.datetime
    status: ApprovalStatus = ApprovalStatus.PENDING
    approvals: List[Dict] = None
    rejections: List[Dict] = None

class ApprovalManager:
    def __init__(self):
        self.requests = {}
    
    def create_approval_request(
        self,
        request_type: ApprovalType,
        requester: str,
        approvers: List[str],
        description: str,
        timeout_hours: int = 24
    ) -> str:
        """
        创建审批请求
        
        Args:
            request_type: 审批类型
            requester: 请求人
            approvers: 审批人列表
            description: 审批描述
            timeout_hours: 超时时间（小时）
            
        Returns:
            审批请求ID
        """
        import uuid
        request_id = str(uuid.uuid4())
        
        now = datetime.datetime.now()
        expires_at = now + datetime.timedelta(hours=timeout_hours)
        
        request = ApprovalRequest(
            id=request_id,
            type=request_type,
            requester=requester,
            approvers=approvers,
            description=description,
            created_at=now,
            expires_at=expires_at,
            approvals=[],
            rejections=[]
        )
        
        self.requests[request_id] = request
        return request_id
    
    def approve_request(self, request_id: str, approver: str, comment: str = "") -> bool:
        """
        批准请求
        
        Args:
            request_id: 审批请求ID
            approver: 审批人
            comment: 审批意见
            
        Returns:
            审批是否成功
        """
        if request_id not in self.requests:
            return False
        
        request = self.requests[request_id]
        
        # 检查审批人权限
        if approver not in request.approvers:
            return False
        
        # 检查是否已超时
        if datetime.datetime.now() > request.expires_at:
            request.status = ApprovalStatus.EXPIRED
            return False
        
        # 记录审批
        request.approvals.append({
            "approver": approver,
            "timestamp": datetime.datetime.now(),
            "comment": comment
        })
        
        # 更新状态
        request.status = ApprovalStatus.APPROVED
        return True
    
    def reject_request(self, request_id: str, rejector: str, comment: str = "") -> bool:
        """
        拒绝请求
        
        Args:
            request_id: 审批请求ID
            rejector: 拒绝人
            comment: 拒绝原因
            
        Returns:
            拒绝是否成功
        """
        if request_id not in self.requests:
            return False
        
        request = self.requests[request_id]
        
        # 检查拒绝人权限
        if rejector not in request.approvers:
            return False
        
        # 记录拒绝
        request.rejections.append({
            "rejector": rejector,
            "timestamp": datetime.datetime.now(),
            "comment": comment
        })
        
        # 更新状态
        request.status = ApprovalStatus.REJECTED
        return True
    
    def get_request_status(self, request_id: str) -> Optional[ApprovalStatus]:
        """
        获取审批请求状态
        
        Args:
            request_id: 审批请求ID
            
        Returns:
            审批状态
        """
        if request_id not in self.requests:
            return None
        
        return self.requests[request_id].status
```

### 安全扫描集成

#### 代码安全扫描
```yaml
# GitLab CI中的安全扫描集成
stages:
  - build
  - test
  - security
  - deploy

sast:
  stage: security
  script:
    - semgrep --config=ci --error --json . > semgrep-report.json
  artifacts:
    reports:
      sast: semgrep-report.json
  allow_failure: false

dependency_scanning:
  stage: security
  script:
    - dependency-check.sh --scan . --format JSON --out dependency-check-report.json
  artifacts:
    reports:
      dependency_scanning: dependency-check-report.json
  allow_failure: false

container_scanning:
  stage: security
  script:
    - docker build -t myapp:$CI_COMMIT_SHA .
    - trivy image --format json --output trivy-report.json myapp:$CI_COMMIT_SHA
  artifacts:
    reports:
      container_scanning: trivy-report.json
  allow_failure: false

dast:
  stage: security
  script:
    - zap-baseline.py -t https://myapp-staging.example.com -J zap-report.json
  artifacts:
    reports:
      dast: zap-report.json
  allow_failure: false
```

#### 安全门禁检查
```python
#!/usr/bin/env python3
"""
安全门禁检查工具
集成多种安全扫描工具的检查结果
"""

import json
from typing import Dict, List

class SecurityGate:
    def __init__(self, config: Dict):
        self.config = config
    
    def check_sast_results(self, report_file: str) -> Dict:
        """
        检查静态应用安全测试结果
        
        Args:
            report_file: SAST报告文件路径
            
        Returns:
            检查结果
        """
        with open(report_file, 'r') as f:
            report = json.load(f)
        
        critical_issues = []
        high_issues = []
        
        # 解析Semgrep报告
        if 'results' in report:
            for issue in report['results']:
                severity = issue.get('extra', {}).get('severity', 'low')
                if severity == 'CRITICAL':
                    critical_issues.append(issue)
                elif severity == 'HIGH':
                    high_issues.append(issue)
        
        return {
            'critical_count': len(critical_issues),
            'high_count': len(high_issues),
            'critical_issues': critical_issues,
            'high_issues': high_issues,
            'passed': (
                len(critical_issues) <= self.config.get('max_critical_issues', 0) and
                len(high_issues) <= self.config.get('max_high_issues', 5)
            )
        }
    
    def check_dependency_results(self, report_file: str) -> Dict:
        """
        检查依赖安全扫描结果
        
        Args:
            report_file: 依赖扫描报告文件路径
            
        Returns:
            检查结果
        """
        with open(report_file, 'r') as f:
            report = json.load(f)
        
        critical_vulns = []
        high_vulns = []
        
        # 解析Dependency-Check报告
        if 'dependencies' in report:
            for dependency in report['dependencies']:
                if 'vulnerabilities' in dependency:
                    for vuln in dependency['vulnerabilities']:
                        severity = vuln.get('severity', 'low')
                        if severity == 'CRITICAL':
                            critical_vulns.append({
                                'dependency': dependency.get('fileName', ''),
                                'vulnerability': vuln
                            })
                        elif severity == 'HIGH':
                            high_vulns.append({
                                'dependency': dependency.get('fileName', ''),
                                'vulnerability': vuln
                            })
        
        return {
            'critical_count': len(critical_vulns),
            'high_count': len(high_vulns),
            'critical_vulns': critical_vulns,
            'high_vulns': high_vulns,
            'passed': (
                len(critical_vulns) <= self.config.get('max_critical_vulns', 0) and
                len(high_vulns) <= self.config.get('max_high_vulns', 10)
            )
        }
    
    def check_container_results(self, report_file: str) -> Dict:
        """
        检查容器镜像安全扫描结果
        
        Args:
            report_file: 容器扫描报告文件路径
            
        Returns:
            检查结果
        """
        with open(report_file, 'r') as f:
            report = json.load(f)
        
        critical_vulns = []
        high_vulns = []
        
        # 解析Trivy报告
        if 'Results' in report:
            for result in report['Results']:
                if 'Vulnerabilities' in result:
                    for vuln in result['Vulnerabilities']:
                        severity = vuln.get('Severity', 'LOW')
                        if severity == 'CRITICAL':
                            critical_vulns.append(vuln)
                        elif severity == 'HIGH':
                            high_vulns.append(vuln)
        
        return {
            'critical_count': len(critical_vulns),
            'high_count': len(high_vulns),
            'critical_vulns': critical_vulns,
            'high_vulns': high_vulns,
            'passed': (
                len(critical_vulns) <= self.config.get('max_critical_container_vulns', 0) and
                len(high_vulns) <= self.config.get('max_high_container_vulns', 5)
            )
        }
    
    def check_all_security_gates(self, reports: Dict[str, str]) -> Dict:
        """
        检查所有安全门禁
        
        Args:
            reports: 各种安全报告文件路径字典
            
        Returns:
            综合检查结果
        """
        results = {}
        overall_passed = True
        
        # 检查SAST结果
        if 'sast' in reports:
            results['sast'] = self.check_sast_results(reports['sast'])
            overall_passed = overall_passed and results['sast']['passed']
        
        # 检查依赖扫描结果
        if 'dependency' in reports:
            results['dependency'] = self.check_dependency_results(reports['dependency'])
            overall_passed = overall_passed and results['dependency']['passed']
        
        # 检查容器扫描结果
        if 'container' in reports:
            results['container'] = self.check_container_results(reports['container'])
            overall_passed = overall_passed and results['container']['passed']
        
        results['overall_passed'] = overall_passed
        return results

# 安全门禁配置示例
"""
security_gate_config:
  max_critical_issues: 0
  max_high_issues: 5
  max_critical_vulns: 0
  max_high_vulns: 10
  max_critical_container_vulns: 0
  max_high_container_vulns: 5
"""
```

通过合理的部署与发布策略、与Kubernetes的深度集成以及完善的审批与安全管控机制，团队能够构建高效、安全、可靠的软件交付体系。这些实践不仅能够提高交付速度，还能确保系统稳定性和业务连续性，为企业的数字化转型提供有力支撑。