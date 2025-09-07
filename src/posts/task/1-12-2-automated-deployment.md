---
title: 自动化部署方案: 基于Ansible/Helm/K8s的现代部署实践
date: 2025-09-06
categories: [Task]
tags: [task]
published: true
---
在现代软件交付流程中，自动化部署已成为提高交付效率、降低人为错误、确保部署一致性的核心实践。随着基础设施即代码（Infrastructure as Code）理念的普及，企业越来越多地采用Ansible、Helm、Kubernetes等工具来实现部署过程的自动化。本章将深入探讨这些主流自动化部署工具的原理、实践和最佳实践，帮助企业构建高效可靠的自动化部署体系。

## 自动化部署的核心概念与价值

自动化部署是指通过预定义的脚本和配置，自动完成软件应用从构建到部署的整个过程，无需人工干预。

### 自动化部署的定义

自动化部署包含以下几个核心要素：

#### 基础设施即代码（IaC）
基础设施即代码是自动化部署的基础，通过代码来定义和管理基础设施：
- 使用声明式配置文件定义服务器、网络、存储等资源
- 通过版本控制系统管理基础设施配置
- 实现基础设施的可重复创建和销毁

#### 配置管理自动化
配置管理自动化确保应用在不同环境中的一致性：
- 统一的应用配置管理
- 环境特定配置的动态注入
- 配置变更的自动化应用

#### 部署流水线自动化
部署流水线自动化实现从代码提交到生产部署的全自动化：
- 持续集成和持续部署（CI/CD）
- 自动化测试和验证
- 零停机部署策略

### 自动化部署的价值

自动化部署为企业带来显著的业务价值：

#### 提高部署效率
通过自动化部署，可以显著提高部署效率：
- 减少手动操作时间，从小时级缩短到分钟级
- 实现并行部署，提高资源利用率
- 减少部署过程中的等待时间

#### 降低人为错误
自动化部署可以有效降低人为错误：
- 消除手工配置的不一致性
- 减少因疲劳或疏忽导致的错误
- 实现部署过程的标准化和规范化

#### 增强部署可靠性
自动化部署有助于增强部署的可靠性：
- 通过预定义的检查点确保部署质量
- 实现部署过程的可追溯性和可审计性
- 支持快速回滚和故障恢复

## Ansible自动化部署实践

Ansible作为一种无代理的自动化工具，以其简单易用、幂等性强的特点在企业中广泛应用。

### Ansible核心概念

#### Playbook设计
Playbook是Ansible的配置、部署和编排语言，采用YAML格式编写：
```yaml
# 作业平台部署Playbook示例
---
- name: Deploy Job Platform Application
  hosts: job_platform_servers
  become: yes
  vars:
    app_version: "2.1.0"
    app_port: 8080
    config_dir: "/etc/job-platform"
    data_dir: "/var/lib/job-platform"
    log_dir: "/var/log/job-platform"
  
  pre_tasks:
    - name: Ensure required packages are installed
      package:
        name:
          - java-11-openjdk
          - python3
          - nginx
          - git
        state: present
      tags: setup
  
  tasks:
    - name: Create application directories
      file:
        path: "{{ item }}"
        state: directory
        owner: jobplatform
        group: jobplatform
        mode: '0755'
      loop:
        - "{{ config_dir }}"
        - "{{ data_dir }}"
        - "{{ log_dir }}"
      tags: setup
    
    - name: Download application package
      get_url:
        url: "https://artifacts.company.com/job-platform/{{ app_version }}/job-platform-{{ app_version }}.tar.gz"
        dest: "/tmp/job-platform-{{ app_version }}.tar.gz"
        checksum: "sha256:{{ app_checksum }}"
        timeout: 300
      tags: deploy
    
    - name: Extract application package
      unarchive:
        src: "/tmp/job-platform-{{ app_version }}.tar.gz"
        dest: "/opt/job-platform"
        owner: jobplatform
        group: jobplatform
        remote_src: yes
      tags: deploy
    
    - name: Configure application
      template:
        src: application.conf.j2
        dest: "{{ config_dir }}/application.conf"
        owner: jobplatform
        group: jobplatform
        mode: '0644'
      notify: restart job platform
      tags: configure
    
    - name: Configure nginx reverse proxy
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-available/job-platform
      notify: reload nginx
      tags: configure
    
    - name: Enable nginx site
      file:
        src: /etc/nginx/sites-available/job-platform
        dest: /etc/nginx/sites-enabled/job-platform
        state: link
      notify: reload nginx
      tags: configure
    
    - name: Configure systemd service
      template:
        src: job-platform.service.j2
        dest: /etc/systemd/system/job-platform.service
        mode: '0644'
      notify: reload systemd
      tags: configure
    
    - name: Start and enable job platform service
      systemd:
        name: job-platform
        state: started
        enabled: yes
        daemon_reload: yes
      tags: deploy
    
    - name: Wait for application to start
      wait_for:
        host: localhost
        port: "{{ app_port }}"
        delay: 10
        timeout: 300
      tags: deploy
    
    - name: Verify application health
      uri:
        url: "http://localhost:{{ app_port }}/health"
        method: GET
        status_code: 200
      tags: verify

  handlers:
    - name: restart job platform
      systemd:
        name: job-platform
        state: restarted
    
    - name: reload nginx
      systemd:
        name: nginx
        state: reloaded
    
    - name: reload systemd
      systemd:
        daemon_reload: yes

  post_tasks:
    - name: Clean up temporary files
      file:
        path: "/tmp/job-platform-{{ app_version }}.tar.gz"
        state: absent
      tags: cleanup
```

#### 角色（Roles）组织
角色是Ansible中组织任务、变量、文件和模板的方式：
```yaml
# roles/job-platform/tasks/main.yml
---
- name: Install required packages
  package:
    name: "{{ job_platform_packages }}"
    state: present

- name: Create application directories
  file:
    path: "{{ item }}"
    state: directory
    owner: "{{ job_platform_user }}"
    group: "{{ job_platform_group }}"
    mode: '0755'
  loop:
    - "{{ job_platform_config_dir }}"
    - "{{ job_platform_data_dir }}"
    - "{{ job_platform_log_dir }}"

- name: Deploy application files
  unarchive:
    src: "{{ job_platform_artifact_url }}"
    dest: "{{ job_platform_install_dir }}"
    owner: "{{ job_platform_user }}"
    group: "{{ job_platform_group }}"
    remote_src: yes

- name: Configure application
  template:
    src: application.conf.j2
    dest: "{{ job_platform_config_dir }}/application.conf"
    owner: "{{ job_platform_user }}"
    group: "{{ job_platform_group }}"
    mode: '0644'
  notify: restart job platform

- name: Configure systemd service
  template:
    src: job-platform.service.j2
    dest: /etc/systemd/system/job-platform.service
    mode: '0644'
  notify: reload systemd

- name: Start and enable service
  systemd:
    name: job-platform
    state: started
    enabled: yes
    daemon_reload: yes
```

```yaml
# roles/job-platform/defaults/main.yml
---
job_platform_packages:
  - java-11-openjdk
  - python3
  - nginx

job_platform_user: jobplatform
job_platform_group: jobplatform

job_platform_config_dir: /etc/job-platform
job_platform_data_dir: /var/lib/job-platform
job_platform_log_dir: /var/log/job-platform
job_platform_install_dir: /opt/job-platform

job_platform_artifact_url: "https://artifacts.company.com/job-platform/latest/job-platform.tar.gz"

job_platform_port: 8080
```

```yaml
# roles/job-platform/templates/job-platform.service.j2
[Unit]
Description=Job Platform Service
After=network.target

[Service]
Type=simple
User={{ job_platform_user }}
Group={{ job_platform_group }}
WorkingDirectory={{ job_platform_install_dir }}
ExecStart={{ job_platform_install_dir }}/bin/job-platform
EnvironmentFile={{ job_platform_config_dir }}/application.conf
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Ansible部署流水线

构建完整的Ansible部署流水线可以实现端到端的自动化：

#### 多环境部署
```yaml
# 部署到不同环境的Playbook
# deploy-to-development.yml
---
- name: Deploy to Development Environment
  hosts: development
  vars:
    environment: development
    app_version: "{{ lookup('env', 'APP_VERSION') | default('latest') }}"
  roles:
    - job-platform
  tags: deploy-dev

# deploy-to-testing.yml
---
- name: Deploy to Testing Environment
  hosts: testing
  vars:
    environment: testing
    app_version: "{{ lookup('env', 'APP_VERSION') | default('stable') }}"
  roles:
    - job-platform
  tags: deploy-test

# deploy-to-production.yml
---
- name: Deploy to Production Environment
  hosts: production
  vars:
    environment: production
    app_version: "{{ lookup('env', 'APP_VERSION') }}"
  pre_tasks:
    - name: Confirm production deployment
      pause:
        prompt: "Confirm deployment of version {{ app_version }} to production (yes/no)"
      register: confirm
      when: ansible_check_mode is not defined
    
    - name: Fail if not confirmed
      assert:
        that:
          - confirm.user_input == "yes"
        fail_msg: "Production deployment not confirmed"
      when: confirm.user_input is defined
  roles:
    - job-platform
  tags: deploy-prod
```

#### 滚动部署策略
```yaml
# 滚动部署Playbook
---
- name: Rolling Deployment of Job Platform
  hosts: job_platform_cluster
  serial: 1  # 每次只部署一个节点
  max_fail_percentage: 0
  vars:
    app_version: "{{ lookup('env', 'APP_VERSION') }}"
  tasks:
    - name: Drain node from load balancer
      uri:
        url: "http://loadbalancer/api/nodes/{{ inventory_hostname }}/drain"
        method: POST
        status_code: 200
      delegate_to: localhost
    
    - name: Wait for active connections to drain
      wait_for:
        timeout: 30
    
    - name: Stop application service
      systemd:
        name: job-platform
        state: stopped
    
    - name: Backup current application
      archive:
        path: /opt/job-platform
        dest: "/opt/job-platform-backup-{{ ansible_date_time.iso8601_basic_short }}.tar.gz"
    
    - name: Deploy new application version
      unarchive:
        src: "https://artifacts.company.com/job-platform/{{ app_version }}/job-platform-{{ app_version }}.tar.gz"
        dest: /opt
        remote_src: yes
    
    - name: Start application service
      systemd:
        name: job-platform
        state: started
    
    - name: Wait for application to be healthy
      uri:
        url: "http://localhost:8080/health"
        method: GET
        status_code: 200
        timeout: 30
    
    - name: Add node back to load balancer
      uri:
        url: "http://loadbalancer/api/nodes/{{ inventory_hostname }}/enable"
        method: POST
        status_code: 200
      delegate_to: localhost
```

## Helm与Kubernetes部署实践

Helm作为Kubernetes的包管理器，为容器化应用的部署提供了强大的支持。

### Helm核心概念

#### Chart结构
Helm Chart是描述Kubernetes应用的打包格式：
```
job-platform-chart/
├── Chart.yaml
├── values.yaml
├── charts/
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── _helpers.tpl
└── README.md
```

```yaml
# Chart.yaml
apiVersion: v2
name: job-platform
version: 1.2.3
appVersion: "2.1.0"
description: A Helm chart for Job Platform
type: application
keywords:
  - job-platform
  - automation
  - enterprise
home: https://company.com/job-platform
sources:
  - https://github.com/company/job-platform
maintainers:
  - name: DevOps Team
    email: devops@company.com
```

```yaml
# values.yaml
# Default values for job-platform chart

# 应用配置
replicaCount: 1

image:
  repository: company/job-platform
  tag: "2.1.0"
  pullPolicy: IfNotPresent

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

# 服务配置
service:
  type: ClusterIP
  port: 8080

# Ingress配置
ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: job-platform.local
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: []

# 资源配置
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi

# 持久化配置
persistence:
  enabled: false
  storageClass: ""
  accessModes:
    - ReadWriteOnce
  size: 10Gi

# 环境变量
env:
  LOG_LEVEL: info
  DATABASE_URL: postgresql://user:pass@db:5432/jobplatform

# 配置
config:
  application:
    name: "Job Platform"
    version: "2.1.0"
```

#### 模板文件
```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "job-platform.fullname" . }}
  labels:
    {{- include "job-platform.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "job-platform.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "job-platform.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "job-platform.serviceAccountName" . }}
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
              containerPort: 8080
              protocol: TCP
          env:
            {{- range $key, $val := .Values.env }}
            - name: {{ $key }}
              value: {{ $val | quote }}
            {{- end }}
          envFrom:
            - configMapRef:
                name: {{ include "job-platform.fullname" . }}-config
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          volumeMounts:
            {{- if .Values.persistence.enabled }}
            - name: data
              mountPath: /var/lib/job-platform
            {{- end }}
      volumes:
        {{- if .Values.persistence.enabled }}
        - name: data
          persistentVolumeClaim:
            claimName: {{ include "job-platform.fullname" . }}
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

```yaml
# templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "job-platform.fullname" . }}
  labels:
    {{- include "job-platform.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "job-platform.selectorLabels" . | nindent 4 }}
```

### Helm部署策略

#### 多环境部署
```yaml
# values-development.yaml
replicaCount: 1

image:
  tag: "latest"

resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 50m
    memory: 64Mi

env:
  LOG_LEVEL: debug
  DATABASE_URL: postgresql://dev_user:dev_pass@dev-db:5432/jobplatform_dev

persistence:
  enabled: false

# values-testing.yaml
replicaCount: 2

image:
  tag: "stable"

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

env:
  LOG_LEVEL: info
  DATABASE_URL: postgresql://test_user:test_pass@test-db:5432/jobplatform_test

persistence:
  enabled: true
  size: 5Gi

# values-production.yaml
replicaCount: 3

image:
  tag: "2.1.0"

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

env:
  LOG_LEVEL: warn
  DATABASE_URL: postgresql://prod_user:prod_pass@prod-db:5432/jobplatform_prod

persistence:
  enabled: true
  storageClass: fast-ssd
  size: 20Gi

ingress:
  enabled: true
  hosts:
    - host: job-platform.company.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: job-platform-tls
      hosts:
        - job-platform.company.com
```

#### 蓝绿部署
```bash
#!/bin/bash
# 蓝绿部署脚本

set -e

APP_NAME="job-platform"
NAMESPACE="default"
NEW_VERSION=${1:-"2.1.0"}

# 部署绿色环境
echo "Deploying green environment with version $NEW_VERSION"
helm upgrade --install ${APP_NAME}-green ./job-platform-chart \
  --namespace $NAMESPACE \
  --set image.tag=$NEW_VERSION \
  --set service.name=${APP_NAME}-green \
  --set ingress.hosts[0].host=green.job-platform.company.com \
  --wait \
  --timeout 300s

# 等待绿色环境就绪
echo "Waiting for green environment to be ready"
kubectl wait --for=condition=available --timeout=60s deployment/${APP_NAME}-green -n $NAMESPACE

# 执行健康检查
echo "Performing health check on green environment"
GREEN_URL="http://green.job-platform.company.com/health"
for i in {1..30}; do
  if curl -f -s $GREEN_URL; then
    echo "Green environment is healthy"
    break
  fi
  echo "Waiting for green environment to be healthy..."
  sleep 10
done

# 切换流量到绿色环境
echo "Switching traffic to green environment"
kubectl patch ingress ${APP_NAME}-ingress -n $NAMESPACE -p '{"spec":{"rules":[{"host":"job-platform.company.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"'$APP_NAME'-green","port":{"number":8080}}}}]}}]}}'

# 验证生产流量
echo "Verifying production traffic"
PROD_URL="https://job-platform.company.com/health"
for i in {1..10}; do
  if curl -f -s $PROD_URL; then
    echo "Production traffic is working correctly"
  else
    echo "ERROR: Production traffic verification failed"
    # 回滚流量
    kubectl patch ingress ${APP_NAME}-ingress -n $NAMESPACE -p '{"spec":{"rules":[{"host":"job-platform.company.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"'$APP_NAME'-blue","port":{"number":8080}}}}]}}]}}'
    exit 1
  fi
  sleep 5
done

# 清理蓝色环境
echo "Cleaning up blue environment"
helm uninstall ${APP_NAME}-blue --namespace $NAMESPACE

echo "Blue-green deployment completed successfully"
```

## Kubernetes原生部署实践

Kubernetes提供了丰富的原生部署机制，可以直接使用kubectl进行部署。

### Deployment资源管理

#### 基础Deployment配置
```yaml
# job-platform-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: job-platform
  labels:
    app: job-platform
    version: "2.1.0"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: job-platform
  template:
    metadata:
      labels:
        app: job-platform
        version: "2.1.0"
    spec:
      containers:
      - name: job-platform
        image: company/job-platform:2.1.0
        ports:
        - containerPort: 8080
        env:
        - name: LOG_LEVEL
          value: "info"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: job-platform-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: config-volume
          mountPath: /etc/job-platform
        - name: data-volume
          mountPath: /var/lib/job-platform
      volumes:
      - name: config-volume
        configMap:
          name: job-platform-config
      - name: data-volume
        persistentVolumeClaim:
          claimName: job-platform-pvc
```

#### Service和Ingress配置
```yaml
# job-platform-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: job-platform
  labels:
    app: job-platform
spec:
  selector:
    app: job-platform
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

```yaml
# job-platform-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: job-platform
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - job-platform.company.com
    secretName: job-platform-tls
  rules:
  - host: job-platform.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: job-platform
            port:
              number: 80
```

### 部署自动化脚本

#### 部署脚本
```bash
#!/bin/bash
# Kubernetes部署脚本

set -e

APP_NAME="job-platform"
NAMESPACE="default"
VERSION=${1:-"2.1.0"}
KUBECONFIG=${KUBECONFIG:-"$HOME/.kube/config"}

# 检查kubectl是否可用
if ! command -v kubectl &> /dev/null; then
    echo "kubectl is not installed"
    exit 1
fi

# 检查集群连接
echo "Checking Kubernetes cluster connection..."
kubectl cluster-info --kubeconfig=$KUBECONFIG

# 应用配置
echo "Applying configurations..."
kubectl apply -f job-platform-configmap.yaml --namespace=$NAMESPACE
kubectl apply -f job-platform-secrets.yaml --namespace=$NAMESPACE
kubectl apply -f job-platform-pvc.yaml --namespace=$NAMESPACE

# 部署应用
echo "Deploying application version $VERSION..."
kubectl apply -f job-platform-deployment.yaml --namespace=$NAMESPACE
kubectl apply -f job-platform-service.yaml --namespace=$NAMESPACE
kubectl apply -f job-platform-ingress.yaml --namespace=$NAMESPACE

# 等待部署完成
echo "Waiting for deployment to complete..."
kubectl rollout status deployment/$APP_NAME --namespace=$NAMESPACE --timeout=300s

# 验证部署
echo "Verifying deployment..."
kubectl get deployment $APP_NAME --namespace=$NAMESPACE
kubectl get pods --selector=app=job-platform --namespace=$NAMESPACE
kubectl get service $APP_NAME --namespace=$NAMESPACE

# 执行健康检查
echo "Performing health check..."
SERVICE_URL="http://job-platform.$NAMESPACE.svc.cluster.local/health"
for i in {1..30}; do
  if kubectl exec -it $(kubectl get pods --selector=app=job-platform --namespace=$NAMESPACE -o jsonpath='{.items[0].metadata.name}') --namespace=$NAMESPACE -- curl -f -s $SERVICE_URL; then
    echo "Application is healthy"
    break
  fi
  echo "Waiting for application to be healthy..."
  sleep 10
done

echo "Deployment completed successfully"
```

#### 回滚脚本
```bash
#!/bin/bash
# Kubernetes回滚脚本

set -e

APP_NAME="job-platform"
NAMESPACE="default"

# 检查部署历史
echo "Deployment revision history:"
kubectl rollout history deployment/$APP_NAME --namespace=$NAMESPACE

# 获取要回滚到的版本
read -p "Enter revision number to rollback to (or press Enter for previous revision): " REVISION

if [ -z "$REVISION" ]; then
    # 回滚到上一个版本
    echo "Rolling back to previous revision..."
    kubectl rollout undo deployment/$APP_NAME --namespace=$NAMESPACE
else
    # 回滚到指定版本
    echo "Rolling back to revision $REVISION..."
    kubectl rollout undo deployment/$APP_NAME --to-revision=$REVISION --namespace=$NAMESPACE
fi

# 等待回滚完成
echo "Waiting for rollback to complete..."
kubectl rollout status deployment/$APP_NAME --namespace=$NAMESPACE --timeout=300s

# 验证回滚
echo "Verifying rollback..."
kubectl get deployment $APP_NAME --namespace=$NAMESPACE
kubectl get pods --selector=app=job-platform --namespace=$NAMESPACE

echo "Rollback completed successfully"
```

## 部署工具选型与最佳实践

选择合适的部署工具和遵循最佳实践是成功实施自动化部署的关键。

### 工具选型指南

#### Ansible适用场景
Ansible适用于以下场景：
- 传统虚拟机和物理服务器部署
- 需要复杂系统配置管理的场景
- 团队对YAML和脚本语言较为熟悉的环境
- 需要与现有基础设施管理工具集成的场景

#### Helm适用场景
Helm适用于以下场景：
- 完全容器化的应用部署
- Kubernetes环境中的应用管理
- 需要复杂配置模板和参数化的场景
- 多环境部署和版本管理需求

#### Kubernetes原生部署适用场景
Kubernetes原生部署适用于以下场景：
- 简单的容器化应用部署
- 对部署过程有完全控制需求的场景
- 不需要复杂模板和参数化的应用
- 希望直接使用Kubernetes API的场景

### 最佳实践建议

#### 配置管理最佳实践
```yaml
# 使用ConfigMap管理配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: job-platform-config
data:
  # 应用配置
  application.properties: |
    server.port=8080
    logging.level.root=INFO
    spring.profiles.active=production
    
  # 环境特定配置
  environment: production
  
  # 版本信息
  version: "2.1.0"
```

#### 安全最佳实践
```yaml
# 使用Secret管理敏感信息
apiVersion: v1
kind: Secret
metadata:
  name: job-platform-secrets
type: Opaque
data:
  # 敏感信息应进行base64编码
  database-password: {{ "mysecretpassword" | b64enc }}
  api-key: {{ "myapikey" | b64enc }}
```

#### 监控和日志最佳实践
```yaml
# 配置监控注解
apiVersion: apps/v1
kind: Deployment
metadata:
  name: job-platform
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/metrics"
spec:
  # ... 其他配置
```

#### 部署流水线最佳实践
```yaml
# GitLab CI/CD示例
stages:
  - build
  - test
  - deploy-dev
  - deploy-test
  - deploy-prod

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

build_job_platform:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - branches

deploy_to_development:
  stage: deploy-dev
  image: dtzar/helm-kubectl:latest
  script:
    - kubectl config use-context development
    - helm upgrade --install job-platform ./job-platform-chart
      --set image.tag=$CI_COMMIT_SHA
      --set replicaCount=1
  only:
    - develop
  environment:
    name: development

deploy_to_testing:
  stage: deploy-test
  image: dtzar/helm-kubectl:latest
  script:
    - kubectl config use-context testing
    - helm upgrade --install job-platform ./job-platform-chart
      --set image.tag=$CI_COMMIT_SHA
      --set replicaCount=2
  only:
    - staging
  environment:
    name: testing

deploy_to_production:
  stage: deploy-prod
  image: dtzar/helm-kubectl:latest
  script:
    - kubectl config use-context production
    - helm upgrade --install job-platform ./job-platform-chart
      --set image.tag=$CI_COMMIT_SHA
      --set replicaCount=3
  when: manual
  only:
    - master
  environment:
    name: production
```

## 总结

自动化部署是现代软件交付流程的核心实践，通过Ansible、Helm、Kubernetes等工具，企业可以构建高效可靠的自动化部署体系。在实施自动化部署时，需要根据具体需求选择合适的工具，并遵循最佳实践来确保部署的成功和稳定运行。

Ansible以其简单易用和强大的配置管理能力，适用于传统基础设施的自动化部署；Helm作为Kubernetes的包管理器，为容器化应用提供了强大的部署和管理能力；Kubernetes原生部署则为完全容器化的环境提供了直接的部署手段。

在实际应用中，企业应根据自身的技术栈、团队技能和业务需求，选择最适合的自动化部署方案。同时，还需要建立完善的监控、日志和告警机制，确保部署过程的可观察性和可追溯性。

随着云原生技术的不断发展，自动化部署也在不断演进。GitOps、服务网格、无服务器架构等新技术为企业提供了更多选择，但同时也带来了新的挑战。我们需要持续学习和实践，不断提升自动化部署的水平，为企业业务的快速发展提供有力支撑。

在后续章节中，我们将继续探讨平滑升级与数据迁移等主题，帮助企业构建完整的企业级作业平台解决方案。