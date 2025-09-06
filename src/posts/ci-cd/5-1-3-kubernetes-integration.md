---
title: 与Kubernetes的深度集成：Helm/Manifest的自动化部署
date: 2025-08-30
categories: [CICD]
tags: [ci,cd,kubernetes,helm,manifest,automation]
published: true
---

随着云原生技术的快速发展，Kubernetes已成为容器编排的事实标准。在现代CI/CD平台中，与Kubernetes的深度集成是实现高效、可靠自动化部署的关键。通过Helm、Kustomize等工具以及原生Manifest管理，团队能够实现复杂应用的标准化部署和管理。本文将深入探讨如何通过CI/CD流水线与Kubernetes进行深度集成，包括Helm Chart开发、Manifest管理、部署策略以及最佳实践。

## Helm集成实践

Helm作为Kubernetes的包管理工具，为复杂应用的部署提供了标准化解决方案。通过Helm Chart，团队可以将应用及其依赖项打包成可重用的部署单元。

### Helm Chart结构设计

一个良好的Helm Chart应该具备清晰的结构和良好的可维护性：

```
myapp-chart/
├── Chart.yaml                  # Chart基本信息
├── values.yaml                 # 默认配置值
├── values-dev.yaml            # 开发环境配置
├── values-staging.yaml        # 预发环境配置
├── values-prod.yaml           # 生产环境配置
├── templates/                 # 模板文件
│   ├── deployment.yaml        # Deployment模板
│   ├── service.yaml           # Service模板
│   ├── ingress.yaml           # Ingress模板
│   ├── configmap.yaml         # ConfigMap模板
│   ├── secret.yaml            # Secret模板
│   ├── hpa.yaml               # HorizontalPodAutoscaler模板
│   ├── pdb.yaml               # PodDisruptionBudget模板
│   ├── serviceaccount.yaml    # ServiceAccount模板
│   ├── _helpers.tpl           # 帮助模板函数
│   └── tests/                 # 测试文件
│       └── test-connection.yaml
├── crds/                      # 自定义资源定义（可选）
│   └── myapp-crd.yaml
├── charts/                    # 依赖的子Chart（可选）
├── README.md                  # 使用说明
├── LICENSE                    # 许可证
└── .helmignore                # 忽略文件列表
```

### Helm模板开发最佳实践

#### 模板设计原则

```yaml
# Chart.yaml - Chart基本信息
apiVersion: v2
name: myapp
description: A Helm chart for my application
type: application
version: 1.2.3
appVersion: "1.16.0"
home: https://example.com
sources:
  - https://github.com/example/myapp
maintainers:
  - name: John Doe
    email: john.doe@example.com
icon: https://example.com/logo.png
keywords:
  - web
  - application
  - microservice
```

#### Deployment模板示例

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
  {{- with .Values.deployment.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
        {{- with .Values.podLabels }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "myapp.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.port }}
              protocol: TCP
          {{- if .Values.env }}
          env:
            {{- range $key, $value := .Values.env }}
            - name: {{ $key }}
              value: {{ $value | quote }}
            {{- end }}
          {{- end }}
          {{- if .Values.envFrom }}
          envFrom:
            {{- toYaml .Values.envFrom | nindent 12 }}
          {{- end }}
          {{- if .Values.resources }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          {{- end }}
          {{- if or .Values.livenessProbe .Values.readinessProbe }}
          livenessProbe:
            {{- toYaml .Values.livenessProbe | nindent 12 }}
          readinessProbe:
            {{- toYaml .Values.readinessProbe | nindent 12 }}
          {{- end }}
          {{- if .Values.volumeMounts }}
          volumeMounts:
            {{- toYaml .Values.volumeMounts | nindent 12 }}
          {{- end }}
      {{- if .Values.volumes }}
      volumes:
        {{- toYaml .Values.volumes | nindent 8 }}
      {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

#### 帮助模板函数

```yaml
# templates/_helpers.tpl
{{/*
Expand the name of the chart.
*/}}
{{- define "myapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "myapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "myapp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "myapp.labels" -}}
helm.sh/chart: {{ include "myapp.chart" . }}
{{ include "myapp.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "myapp.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "myapp.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
```

### 环境特定配置管理

#### values.yaml - 默认配置
```yaml
# values.yaml
replicaCount: 1

image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}
podLabels: {}

podSecurityContext: {}
  # fsGroup: 2000

securityContext: {}
  # capabilities:
  #   drop:
  #   - ALL
  # readOnlyRootFilesystem: true
  # runAsNonRoot: true
  # runAsUser: 1000

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: []

resources: {}
  # limits:
  #   cpu: 100m
  #   memory: 128Mi
  # requests:
  #   cpu: 100m
  #   memory: 128Mi

livenessProbe:
  httpGet:
    path: /
    port: http
readinessProbe:
  httpGet:
    path: /
    port: http

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}

env: {}
envFrom: []

volumeMounts: []
volumes: []

deployment:
  annotations: {}
```

#### 环境特定配置文件

```yaml
# values-prod.yaml - 生产环境配置
replicaCount: 5

image:
  repository: myapp
  tag: v1.2.3
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8080

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - myapp.example.com

resources:
  limits:
    cpu: 2
    memory: 4Gi
  requests:
    cpu: 1
    memory: 2Gi

livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

autoscaling:
  enabled: true
  minReplicas: 5
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70

env:
  ENV: production
  LOG_LEVEL: INFO
  DB_HOST: prod-db.example.com
  DB_PORT: "3306"

envFrom:
  - secretRef:
      name: myapp-secrets

volumeMounts:
  - name: logs
    mountPath: /var/log/myapp

volumes:
  - name: logs
    emptyDir: {}

nodeSelector:
  environment: production

tolerations:
  - key: environment
    operator: Equal
    value: prod
    effect: NoSchedule

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values:
            - myapp
        topologyKey: kubernetes.io/hostname
```

## CI/CD中的Helm集成

在CI/CD流水线中集成Helm能够实现应用的自动化部署和管理。

### GitLab CI集成示例

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - package
  - deploy-dev
  - deploy-staging
  - deploy-prod

variables:
  HELM_VERSION: "3.10.0"
  KUBE_CONTEXT: "my-cluster"
  CHART_NAME: "myapp"
  CHART_VERSION: "1.2.3"

before_script:
  - helm version
  - kubectl version --client
  - echo "Using Kubernetes context: $KUBE_CONTEXT"
  - kubectl config use-context $KUBE_CONTEXT

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - branches

test:
  stage: test
  image: python:3.9
  script:
    - pip install -r requirements.txt
    - pytest tests/
  only:
    - branches

package-chart:
  stage: package
  image: 
    name: alpine/helm:$HELM_VERSION
    entrypoint: [""]
  script:
    - helm dependency update charts/$CHART_NAME
    - helm lint charts/$CHART_NAME
    - helm package charts/$CHART_NAME --version $CHART_VERSION-$CI_COMMIT_SHORT_SHA
    - mkdir -p charts/packages
    - mv $CHART_NAME-*.tgz charts/packages/
    - helm repo index charts/packages --url https://$CI_PAGES_URL/charts/packages
  artifacts:
    paths:
      - charts/packages/
  only:
    - master

deploy-dev:
  stage: deploy-dev
  image: 
    name: alpine/helm:$HELM_VERSION
    entrypoint: [""]
  script:
    - kubectl config use-context dev-cluster
    - |
      helm upgrade --install $CHART_NAME-dev \
        charts/$CHART_NAME \
        --namespace dev \
        --create-namespace \
        --values charts/$CHART_NAME/values-dev.yaml \
        --set image.tag=$CI_COMMIT_SHA \
        --set appVersion=$CI_COMMIT_TAG \
        --timeout 300s \
        --wait
  environment:
    name: development
  only:
    - develop

deploy-staging:
  stage: deploy-staging
  image: 
    name: alpine/helm:$HELM_VERSION
    entrypoint: [""]
  script:
    - kubectl config use-context staging-cluster
    - |
      helm upgrade --install $CHART_NAME-staging \
        charts/$CHART_NAME \
        --namespace staging \
        --create-namespace \
        --values charts/$CHART_NAME/values-staging.yaml \
        --set image.tag=$CI_COMMIT_SHA \
        --set appVersion=$CI_COMMIT_TAG \
        --timeout 600s \
        --wait
  environment:
    name: staging
  when: manual
  only:
    - staging

deploy-prod:
  stage: deploy-prod
  image: 
    name: alpine/helm:$HELM_VERSION
    entrypoint: [""]
  script:
    - kubectl config use-context prod-cluster
    # 蓝绿部署方式
    - |
      helm upgrade --install $CHART_NAME-green \
        charts/$CHART_NAME \
        --namespace production \
        --values charts/$CHART_NAME/values-prod.yaml \
        --set image.tag=$CI_COMMIT_SHA \
        --set appVersion=$CI_COMMIT_TAG \
        --timeout 900s \
        --wait
    # 执行蓝绿切换
    - ./scripts/blue-green-switch.sh $CHART_NAME production
  environment:
    name: production
  when: manual
  only:
    - master
```

### Helm部署监控和验证

```python
#!/usr/bin/env python3
"""
Helm部署监控和验证工具
确保部署的正确性和稳定性
"""

import subprocess
import time
import json
from typing import Dict, List, Optional
import yaml
from kubernetes import client, config
from kubernetes.client.rest import ApiException

class HelmDeploymentValidator:
    def __init__(self, kube_context: str = None):
        if kube_context:
            config.load_kube_config(context=kube_context)
        else:
            config.load_kube_config()
        self.apps_v1 = client.AppsV1Api()
        self.core_v1 = client.CoreV1Api()
        self.timeout = 300  # 5分钟超时
    
    def validate_helm_release(
        self,
        release_name: str,
        namespace: str,
        expected_replicas: int = None
    ) -> Dict[str, any]:
        """
        验证Helm发布
        
        Args:
            release_name: 发布名称
            namespace: 命名空间
            expected_replicas: 期望的副本数
            
        Returns:
            验证结果
        """
        results = {
            'release_name': release_name,
            'namespace': namespace,
            'status': 'unknown',
            'validations': {},
            'errors': []
        }
        
        try:
            # 检查Helm发布状态
            helm_status = self._check_helm_status(release_name, namespace)
            results['validations']['helm_status'] = helm_status
            
            # 检查Deployment状态
            deployment_status = self._check_deployment_status(release_name, namespace, expected_replicas)
            results['validations']['deployment'] = deployment_status
            
            # 检查Pod状态
            pod_status = self._check_pod_status(release_name, namespace)
            results['validations']['pods'] = pod_status
            
            # 检查服务状态
            service_status = self._check_service_status(release_name, namespace)
            results['validations']['services'] = service_status
            
            # 综合判断
            if (helm_status['status'] == 'deployed' and
                deployment_status['ready'] and
                pod_status['healthy'] and
                service_status['available']):
                results['status'] = 'success'
            else:
                results['status'] = 'failed'
                results['errors'].extend(helm_status.get('errors', []))
                results['errors'].extend(deployment_status.get('errors', []))
                results['errors'].extend(pod_status.get('errors', []))
                results['errors'].extend(service_status.get('errors', []))
                
        except Exception as e:
            results['status'] = 'error'
            results['errors'].append(f"Validation failed: {str(e)}")
        
        return results
    
    def _check_helm_status(self, release_name: str, namespace: str) -> Dict[str, any]:
        """检查Helm发布状态"""
        try:
            result = subprocess.run([
                'helm', 'status', release_name,
                '--namespace', namespace,
                '--output', 'json'
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                return {
                    'status': 'error',
                    'errors': [f"Helm status check failed: {result.stderr}"]
                }
            
            status_data = json.loads(result.stdout)
            return {
                'status': status_data.get('info', {}).get('status', 'unknown'),
                'revision': status_data.get('version'),
                'last_deployed': status_data.get('info', {}).get('last_deployed')
            }
            
        except subprocess.TimeoutExpired:
            return {
                'status': 'error',
                'errors': ['Helm status check timed out']
            }
        except Exception as e:
            return {
                'status': 'error',
                'errors': [f"Helm status check failed: {str(e)}"]
            }
    
    def _check_deployment_status(
        self,
        release_name: str,
        namespace: str,
        expected_replicas: int = None
    ) -> Dict[str, any]:
        """检查Deployment状态"""
        try:
            deployments = self.apps_v1.list_namespaced_deployment(
                namespace=namespace,
                label_selector=f"app.kubernetes.io/instance={release_name}"
            )
            
            if not deployments.items:
                return {
                    'ready': False,
                    'errors': [f"No deployments found for release {release_name}"]
                }
            
            deployment_results = []
            all_ready = True
            
            for deployment in deployments.items:
                status = deployment.status
                spec = deployment.spec
                
                ready = (
                    status.ready_replicas == spec.replicas and
                    status.updated_replicas == spec.replicas and
                    status.available_replicas == spec.replicas
                )
                
                if expected_replicas and spec.replicas != expected_replicas:
                    ready = False
                
                deployment_results.append({
                    'name': deployment.metadata.name,
                    'replicas': {
                        'desired': spec.replicas,
                        'ready': status.ready_replicas,
                        'updated': status.updated_replicas,
                        'available': status.available_replicas
                    },
                    'ready': ready
                })
                
                if not ready:
                    all_ready = False
            
            return {
                'ready': all_ready,
                'deployments': deployment_results
            }
            
        except ApiException as e:
            return {
                'ready': False,
                'errors': [f"Deployment check failed: {e.reason}"]
            }
    
    def _check_pod_status(self, release_name: str, namespace: str) -> Dict[str, any]:
        """检查Pod状态"""
        try:
            pods = self.core_v1.list_namespaced_pod(
                namespace=namespace,
                label_selector=f"app.kubernetes.io/instance={release_name}"
            )
            
            if not pods.items:
                return {
                    'healthy': False,
                    'errors': [f"No pods found for release {release_name}"]
                }
            
            pod_results = []
            all_healthy = True
            
            for pod in pods.items:
                healthy = pod.status.phase == 'Running'
                restarts = sum(cs.restart_count for cs in pod.status.container_statuses or [])
                
                # 检查容器状态
                if pod.status.container_statuses:
                    for container_status in pod.status.container_statuses:
                        if container_status.state.waiting or container_status.state.terminated:
                            healthy = False
                            break
                
                pod_results.append({
                    'name': pod.metadata.name,
                    'phase': pod.status.phase,
                    'restarts': restarts,
                    'healthy': healthy
                })
                
                if not healthy:
                    all_healthy = False
            
            return {
                'healthy': all_healthy,
                'pods': pod_results
            }
            
        except ApiException as e:
            return {
                'healthy': False,
                'errors': [f"Pod check failed: {e.reason}"]
            }
    
    def _check_service_status(self, release_name: str, namespace: str) -> Dict[str, any]:
        """检查服务状态"""
        try:
            services = self.core_v1.list_namespaced_service(
                namespace=namespace,
                label_selector=f"app.kubernetes.io/instance={release_name}"
            )
            
            if not services.items:
                return {
                    'available': True,  # 没有服务也认为是正常的
                    'services': []
                }
            
            service_results = []
            all_available = True
            
            for service in services.items:
                available = True
                endpoints = []
                
                # 检查Endpoints
                try:
                    endpoint = self.core_v1.read_namespaced_endpoints(
                        name=service.metadata.name,
                        namespace=namespace
                    )
                    endpoints = [addr.ip for subset in endpoint.subsets or [] 
                                for addr in subset.addresses or []]
                    if not endpoints:
                        available = False
                except ApiException:
                    available = False
                
                service_results.append({
                    'name': service.metadata.name,
                    'type': service.spec.type,
                    'cluster_ip': service.spec.cluster_ip,
                    'endpoints': endpoints,
                    'available': available
                })
                
                if not available:
                    all_available = False
            
            return {
                'available': all_available,
                'services': service_results
            }
            
        except ApiException as e:
            return {
                'available': False,
                'errors': [f"Service check failed: {e.reason}"]
            }
    
    def wait_for_deployment_ready(
        self,
        release_name: str,
        namespace: str,
        timeout: int = None
    ) -> bool:
        """
        等待部署就绪
        
        Args:
            release_name: 发布名称
            namespace: 命名空间
            timeout: 超时时间（秒）
            
        Returns:
            是否就绪
        """
        timeout = timeout or self.timeout
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                result = self.validate_helm_release(release_name, namespace)
                if result['status'] == 'success':
                    return True
            except Exception:
                pass
            
            time.sleep(10)
        
        return False

# 使用示例
if __name__ == "__main__":
    validator = HelmDeploymentValidator()
    
    # 验证部署
    result = validator.validate_helm_release(
        release_name="myapp-staging",
        namespace="staging",
        expected_replicas=3
    )
    
    print(json.dumps(result, indent=2, default=str))
    
    # 等待部署就绪
    if result['status'] != 'success':
        print("Deployment not ready, waiting...")
        if validator.wait_for_deployment_ready("myapp-staging", "staging"):
            print("Deployment is now ready")
        else:
            print("Deployment timeout")
```

## Kubernetes Manifest管理

除了Helm，原生的Kubernetes Manifest管理也是重要的部署方式。

### Kustomize集成实践

Kustomize是Kubernetes原生的配置管理工具，适合管理不同环境的配置差异。

#### Kustomize项目结构

```
myapp-kustomize/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── overlays/
│   ├── dev/
│   │   ├── kustomization.yaml
│   │   ├── deployment-patch.yaml
│   │   └── config.env
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   ├── deployment-patch.yaml
│   │   └── config.env
│   └── prod/
│       ├── kustomization.yaml
│       ├── deployment-patch.yaml
│       └── config.env
└── README.md
```

#### Base配置

```yaml
# base/kustomization.yaml
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
  newTag: latest

commonLabels:
  app: myapp
  version: latest

namespace: myapp-base
```

```yaml
# base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: myapp-config
        - secretRef:
            name: myapp-secrets
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
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
  - config.env

secretGenerator:
- name: myapp-secrets
  behavior: merge
  envs:
  - secrets.env

images:
- name: myapp
  newTag: v1.2.3-staging

replicas:
- name: myapp
  count: 3

namespace: myapp-staging
```

```yaml
# overlays/staging/deployment-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: myapp
        env:
        - name: ENV
          value: staging
        - name: LOG_LEVEL
          value: DEBUG
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 1
            memory: 2Gi
```

### CI/CD中的Kustomize集成

```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches:
      - main
      - develop
      - staging

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Build and push
      uses: docker/build-push-action@v3
      with:
        context: .
        push: true
        tags: myapp:${{ github.sha }}

    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'

    - name: Set up Kustomize
      run: |
        curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
        sudo mv kustomize /usr/local/bin/

    - name: Configure kubeconfig
      run: |
        mkdir -p ~/.kube
        echo "${{ secrets.KUBE_CONFIG_DATA }}" | base64 -d > ~/.kube/config

    - name: Deploy to staging
      if: github.ref == 'refs/heads/staging'
      run: |
        cd kustomize/overlays/staging
        kustomize edit set image myapp=myapp:${{ github.sha }}
        kubectl apply -k .
        kubectl rollout status deployment/staging-myapp -n myapp-staging

    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        # 蓝绿部署
        cd kustomize/overlays/prod
        kustomize edit set image myapp=myapp:${{ github.sha }}
        kubectl apply -k . --prune -l app=myapp-green
        # 执行流量切换脚本
        ./scripts/switch-traffic.sh
```

## 部署策略与最佳实践

### 部署安全最佳实践

#### 镜像安全扫描
```yaml
# GitLab CI中的安全扫描
security-scan:
  stage: security
  image: 
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy image --exit-code 0 --severity HIGH,CRITICAL myapp:${CI_COMMIT_SHA}
    - trivy image --exit-code 1 --severity CRITICAL myapp:${CI_COMMIT_SHA}
  allow_failure: false
  only:
    - master
    - staging
```

#### 配置安全检查
```python
#!/usr/bin/env python3
"""
Kubernetes配置安全检查工具
检查部署配置中的安全问题
"""

import yaml
from typing import Dict, List
import subprocess

class K8sSecurityChecker:
    def __init__(self):
        self.security_rules = [
            {
                'name': 'privileged_containers',
                'description': '检查特权容器',
                'check': self._check_privileged_containers
            },
            {
                'name': 'host_network',
                'description': '检查主机网络访问',
                'check': self._check_host_network
            },
            {
                'name': 'host_pid',
                'description': '检查主机PID命名空间',
                'check': self._check_host_pid
            },
            {
                'name': 'host_ipc',
                'description': '检查主机IPC命名空间',
                'check': self._check_host_ipc
            },
            {
                'name': 'allow_privilege_escalation',
                'description': '检查权限提升',
                'check': self._check_privilege_escalation
            },
            {
                'name': 'run_as_root',
                'description': '检查以root用户运行',
                'check': self._check_run_as_root
            }
        ]
    
    def check_manifests(self, manifest_files: List[str]) -> Dict[str, any]:
        """
        检查Kubernetes清单文件
        
        Args:
            manifest_files: 清单文件列表
            
        Returns:
            检查结果
        """
        results = {
            'files_checked': len(manifest_files),
            'violations': [],
            'passed': True
        }
        
        for file_path in manifest_files:
            try:
                with open(file_path, 'r') as f:
                    manifests = list(yaml.safe_load_all(f))
                
                for manifest in manifests:
                    if not manifest:
                        continue
                    
                    for rule in self.security_rules:
                        violations = rule['check'](manifest, file_path)
                        if violations:
                            results['violations'].extend(violations)
                            results['passed'] = False
                            
            except Exception as e:
                results['violations'].append({
                    'file': file_path,
                    'rule': 'file_parsing',
                    'description': f'Failed to parse file: {str(e)}',
                    'severity': 'ERROR'
                })
                results['passed'] = False
        
        return results
    
    def _check_privileged_containers(self, manifest: Dict, file_path: str) -> List[Dict]:
        """检查特权容器"""
        violations = []
        
        if manifest.get('kind') == 'Pod':
            violations.extend(self._check_pod_privileged(manifest, file_path))
        elif manifest.get('kind') == 'Deployment':
            template = manifest.get('spec', {}).get('template', {})
            violations.extend(self._check_pod_privileged(template, file_path))
        
        return violations
    
    def _check_pod_privileged(self, pod_spec: Dict, file_path: str) -> List[Dict]:
        """检查Pod特权设置"""
        violations = []
        containers = pod_spec.get('spec', {}).get('containers', [])
        
        for container in containers:
            security_context = container.get('securityContext', {})
            if security_context.get('privileged', False):
                violations.append({
                    'file': file_path,
                    'rule': 'privileged_containers',
                    'description': f"Container '{container.get('name')}' is running in privileged mode",
                    'severity': 'HIGH'
                })
        
        return violations
    
    def _check_host_network(self, manifest: Dict, file_path: str) -> List[Dict]:
        """检查主机网络访问"""
        violations = []
        
        if manifest.get('kind') == 'Pod':
            if manifest.get('spec', {}).get('hostNetwork', False):
                violations.append({
                    'file': file_path,
                    'rule': 'host_network',
                    'description': 'Pod is using host network',
                    'severity': 'MEDIUM'
                })
        elif manifest.get('kind') == 'Deployment':
            if manifest.get('spec', {}).get('template', {}).get('spec', {}).get('hostNetwork', False):
                violations.append({
                    'file': file_path,
                    'rule': 'host_network',
                    'description': 'Deployment is using host network',
                    'severity': 'MEDIUM'
                })
        
        return violations
    
    def _check_host_pid(self, manifest: Dict, file_path: str) -> List[Dict]:
        """检查主机PID命名空间"""
        violations = []
        
        if manifest.get('kind') == 'Pod':
            if manifest.get('spec', {}).get('hostPID', False):
                violations.append({
                    'file': file_path,
                    'rule': 'host_pid',
                    'description': 'Pod is using host PID namespace',
                    'severity': 'MEDIUM'
                })
        elif manifest.get('kind') == 'Deployment':
            if manifest.get('spec', {}).get('template', {}).get('spec', {}).get('hostPID', False):
                violations.append({
                    'file': file_path,
                    'rule': 'host_pid',
                    'description': 'Deployment is using host PID namespace',
                    'severity': 'MEDIUM'
                })
        
        return violations
    
    def _check_host_ipc(self, manifest: Dict, file_path: str) -> List[Dict]:
        """检查主机IPC命名空间"""
        violations = []
        
        if manifest.get('kind') == 'Pod':
            if manifest.get('spec', {}).get('hostIPC', False):
                violations.append({
                    'file': file_path,
                    'rule': 'host_ipc',
                    'description': 'Pod is using host IPC namespace',
                    'severity': 'MEDIUM'
                })
        elif manifest.get('kind') == 'Deployment':
            if manifest.get('spec', {}).get('template', {}).get('spec', {}).get('hostIPC', False):
                violations.append({
                    'file': file_path,
                    'rule': 'host_ipc',
                    'description': 'Deployment is using host IPC namespace',
                    'severity': 'MEDIUM'
                })
        
        return violations
    
    def _check_privilege_escalation(self, manifest: Dict, file_path: str) -> List[Dict]:
        """检查权限提升"""
        violations = []
        
        containers = []
        if manifest.get('kind') == 'Pod':
            containers = manifest.get('spec', {}).get('containers', [])
        elif manifest.get('kind') == 'Deployment':
            containers = manifest.get('spec', {}).get('template', {}).get('spec', {}).get('containers', [])
        
        for container in containers:
            security_context = container.get('securityContext', {})
            if security_context.get('allowPrivilegeEscalation', True):
                violations.append({
                    'file': file_path,
                    'rule': 'allow_privilege_escalation',
                    'description': f"Container '{container.get('name')}' allows privilege escalation",
                    'severity': 'MEDIUM'
                })
        
        return violations
    
    def _check_run_as_root(self, manifest: Dict, file_path: str) -> List[Dict]:
        """检查以root用户运行"""
        violations = []
        
        containers = []
        if manifest.get('kind') == 'Pod':
            containers = manifest.get('spec', {}).get('containers', [])
        elif manifest.get('kind') == 'Deployment':
            containers = manifest.get('spec', {}).get('template', {}).get('spec', {}).get('containers', [])
        
        for container in containers:
            security_context = container.get('securityContext', {})
            run_as_user = security_context.get('runAsUser')
            run_as_non_root = security_context.get('runAsNonRoot')
            
            if run_as_non_root is False or (run_as_user is not None and run_as_user == 0):
                violations.append({
                    'file': file_path,
                    'rule': 'run_as_root',
                    'description': f"Container '{container.get('name')}' is running as root user",
                    'severity': 'HIGH'
                })
        
        return violations

# 使用示例
if __name__ == "__main__":
    checker = K8sSecurityChecker()
    
    # 检查清单文件
    manifest_files = [
        'kustomize/base/deployment.yaml',
        'kustomize/overlays/prod/deployment-patch.yaml'
    ]
    
    results = checker.check_manifests(manifest_files)
    
    print(f"Checked {results['files_checked']} files")
    print(f"Security check {'PASSED' if results['passed'] else 'FAILED'}")
    
    if results['violations']:
        print("\nViolations found:")
        for violation in results['violations']:
            print(f"  [{violation['severity']}] {violation['description']} ({violation['rule']})")
```

### 部署监控和告警

#### 部署健康检查
```bash
#!/bin/bash
# 部署健康检查脚本

set -e

DEPLOYMENT_NAME=${1:-myapp}
NAMESPACE=${2:-default}
TIMEOUT=${3:-300}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

check_deployment_health() {
    log "Checking health of deployment: $DEPLOYMENT_NAME in namespace: $NAMESPACE"
    
    # 等待Deployment就绪
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=${TIMEOUT}s
    
    # 检查Pod状态
    pods=$(kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT_NAME -o jsonpath='{.items[*].metadata.name}')
    
    for pod in $pods; do
        log "Checking pod: $pod"
        
        # 检查Pod状态
        phase=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.phase}')
        if [ "$phase" != "Running" ]; then
            log "ERROR: Pod $pod is in phase $phase"
            exit 1
        fi
        
        # 检查容器状态
        container_statuses=$(kubectl get pod $pod -n $NAMESPACE -o jsonpath='{.status.containerStatuses[*].ready}')
        for status in $container_statuses; do
            if [ "$status" != "true" ]; then
                log "ERROR: Container in pod $pod is not ready"
                kubectl describe pod $pod -n $NAMESPACE
                exit 1
            fi
        done
        
        log "Pod $pod is healthy"
    done
    
    # 执行应用健康检查
    check_application_health
}

check_application_health() {
    log "Performing application health check"
    
    # 获取服务地址
    service_host=$(kubectl get service $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    service_port=$(kubectl get service $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.ports[0].port}')
    
    # 执行健康检查
    for i in {1..10}; do
        if curl -f -s --max-time 10 "http://$service_host:$service_port/health" > /dev/null; then
            log "Application health check $i succeeded"
        else
            log "ERROR: Application health check $i failed"
            exit 1
        fi
        sleep 2
    done
    
    log "Application health check completed successfully"
}

# 执行检查
check_deployment_health
```

通过与Kubernetes的深度集成，CI/CD平台能够实现高效、可靠的自动化部署。Helm和Kustomize等工具为复杂应用的部署提供了标准化解决方案，而安全检查、监控告警等最佳实践则确保了部署的安全性和稳定性。在实际应用中，需要根据具体的业务需求和技术架构选择合适的工具和策略，构建适合团队的Kubernetes集成方案。