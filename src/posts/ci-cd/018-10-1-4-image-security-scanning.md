---
title: "镜像安全扫描: 容器镜像的漏洞检测与合规检查"
date: 2025-08-30
categories: [CICD]
tags: [CICD]
published: true
---
在容器化应用日益普及的今天，容器镜像已成为软件交付的核心载体。然而，容器镜像中可能包含各种安全漏洞和不合规的组件，这些风险会直接传递到生产环境中，造成严重的安全隐患。通过在CI/CD流水线中集成镜像安全扫描工具，团队能够在镜像构建阶段就发现并修复安全问题，实现"安全左移"的重要实践。本文将深入探讨镜像安全扫描的重要性、主流扫描工具的集成实践以及构建安全镜像的最佳策略。

## 镜像安全扫描的重要性

容器镜像安全扫描是现代DevSecOps实践中的关键环节，它能够帮助团队在软件交付的早期阶段识别和修复安全风险，从而降低整体安全风险并满足合规要求。

### 容器镜像的安全风险

#### 1. 基础镜像漏洞
基础镜像（如Alpine、Ubuntu、CentOS等）本身可能包含已知的安全漏洞：
- **操作系统漏洞**：Linux内核或系统库中的安全漏洞
- **过时的软件包**：未及时更新的系统软件包
- **默认配置风险**：不安全的默认系统配置

#### 2. 应用依赖漏洞
应用依赖的第三方库和组件可能包含安全漏洞：
- **已知CVE漏洞**：公共漏洞数据库中记录的已知漏洞
- **恶意软件包**：被植入恶意代码的第三方软件包
- **废弃组件**：不再维护的老旧组件

#### 3. 配置安全问题
镜像构建过程中的配置可能引入安全风险：
- **硬编码密钥**：在镜像中硬编码的密码或密钥
- **不安全的权限设置**：过高的文件或目录权限
- **不必要的软件包**：增加攻击面的非必要组件

### 镜像安全扫描的价值

#### 1. 早期风险识别
通过在构建阶段进行安全扫描，能够：
- **降低成本**：在早期发现和修复漏洞的成本远低于生产环境修复
- **加快响应**：开发团队能够立即获得安全反馈并快速修复
- **防止传播**：阻止包含漏洞的镜像进入后续环境

#### 2. 合规性保障
镜像安全扫描有助于满足各种合规要求：
- **行业标准**：如PCI DSS、HIPAA等对软件安全的要求
- **内部政策**：企业自定义的安全基线和标准
- **客户要求**：特定客户对供应商安全的要求

#### 3. 持续安全保障
通过自动化扫描实现持续安全保障：
- **实时监控**：新发现的漏洞能够及时检测到
- **版本追踪**：完整记录镜像的安全状态历史
- **趋势分析**：分析安全风险的变化趋势

## 主流镜像安全扫描工具

目前市场上有多种成熟的镜像安全扫描工具，每种工具都有其特点和适用场景。

### Clair

Clair是CoreOS（现为Red Hat）开源的容器镜像安全扫描工具，专门用于静态分析容器镜像中的安全漏洞。

#### Clair核心架构

##### 1. 分层架构
Clair采用分层架构设计：
- **Updater**：负责从漏洞数据库获取最新的漏洞数据
- **Notifier**：在发现新漏洞时发送通知
- **API Server**：提供RESTful API供客户端查询
- **Database**：存储漏洞数据和镜像分析结果

##### 2. 多数据库支持
Clair支持多种漏洞数据库：
- **Debian Security Tracker**：Debian系统漏洞数据
- **Ubuntu CVE Tracker**：Ubuntu系统漏洞数据
- **Red Hat Security Data**：Red Hat系统漏洞数据
- **Alpine SecDB**：Alpine Linux漏洞数据
- **Oracle Linux Security Data**：Oracle Linux漏洞数据

#### Clair集成实践

##### 1. Clair服务部署
```yaml
# docker-compose.yml - Clair服务部署
version: '3.7'

services:
  clair-db:
    image: arminc/clair-db:latest
    container_name: clair-db
    restart: unless-stopped
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - clair-db-data:/var/lib/postgresql/data

  clair:
    image: quay.io/coreos/clair:v4.6.0
    container_name: clair
    restart: unless-stopped
    depends_on:
      - clair-db
    ports:
      - "6060:6060"
      - "6061:6061"
    volumes:
      - ./config/clair.yaml:/etc/clair/config.yaml
    command: [-config, /etc/clair/config.yaml]

volumes:
  clair-db-data:
```

```yaml
# config/clair.yaml - Clair配置文件
clair:
  database:
    type: pgsql
    options:
      source: host=clair-db port=5432 user=postgres password=password sslmode=disable
  api:
    addr: "0.0.0.0:6060"
    healthaddr: "0.0.0.0:6061"
  updater:
    interval: 2h
    enabledupdaters:
      - debian
      - ubuntu
      - rhel
      - alpine
      - oracle
  notifier:
    attempts: 3
    renotifyinterval: 2h
    http:
      endpoint: "http://localhost:9000/webhook"
```

##### 2. CI/CD集成
```bash
#!/bin/bash
# clair-scan.sh - Clair镜像扫描脚本

set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 配置变量
CLAIR_URL=${CLAIR_URL:-"http://localhost:6060"}
IMAGE_NAME=${1:-""}
IMAGE_TAG=${2:-"latest"}

if [ -z "$IMAGE_NAME" ]; then
    echo "Usage: $0 <image_name> [image_tag]"
    exit 1
fi

FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"

# 拉取镜像
log "Pulling image: $FULL_IMAGE_NAME"
docker pull "$FULL_IMAGE_NAME"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# 导出镜像层
log "Exporting image layers..."
docker save "$FULL_IMAGE_NAME" | tar -xf - -C "$TEMP_DIR"

# 获取镜像清单
MANIFEST_FILE=$(find "$TEMP_DIR" -name "manifest.json" | head -n 1)
if [ ! -f "$MANIFEST_FILE" ]; then
    echo "ERROR: Manifest file not found"
    exit 1
fi

# 提取镜像配置
CONFIG_DIGEST=$(jq -r '.[0].Config' "$MANIFEST_FILE")
CONFIG_FILE="$TEMP_DIR/$CONFIG_DIGEST"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: Config file not found"
    exit 1
fi

# 提取镜像层信息
LAYERS=$(jq -r '.[0].Layers[]' "$MANIFEST_FILE")

# 上传镜像层到Clair
log "Uploading image layers to Clair..."
for layer in $LAYERS; do
    LAYER_PATH="$TEMP_DIR/$layer"
    if [ -f "$LAYER_PATH" ]; then
        LAYER_DIGEST=$(basename "$layer" | cut -d'.' -f1)
        log "Uploading layer: $LAYER_DIGEST"
        
        # 上传层文件
        curl -s -X POST \
            -H "Content-Type: application/octet-stream" \
            --data-binary @"$LAYER_PATH" \
            "$CLAIR_URL/v1/layers/$LAYER_DIGEST"
    fi
done

# 扫描镜像
log "Scanning image for vulnerabilities..."
VULNERABILITIES=$(curl -s "$CLAIR_URL/v1/layers/$LAYER_DIGEST?vulnerabilities")

# 解析扫描结果
CRITICAL_COUNT=$(echo "$VULNERABILITIES" | jq '[.features[].vulnerabilities[] | select(.severity=="Critical")] | length')
HIGH_COUNT=$(echo "$VULNERABILITIES" | jq '[.features[].vulnerabilities[] | select(.severity=="High")] | length')
MEDIUM_COUNT=$(echo "$VULNERABILITIES" | jq '[.features[].vulnerabilities[] | select(.severity=="Medium")] | length')

log "Scan Results:"
log "  Critical: $CRITICAL_COUNT"
log "  High: $HIGH_COUNT"
log "  Medium: $MEDIUM_COUNT"

# 生成详细报告
REPORT_FILE="clair-report-$(date +%Y%m%d-%H%M%S).json"
echo "$VULNERABILITIES" > "$REPORT_FILE"
log "Detailed report saved to: $REPORT_FILE"

# 检查是否超过阈值
if [ "$CRITICAL_COUNT" -gt 0 ] || [ "$HIGH_COUNT" -gt 5 ]; then
    log "ERROR: Vulnerability threshold exceeded"
    exit 1
fi

log "Image scan completed successfully"
```

### Trivy

Trivy是Aqua Security开源的简单而全面的容器镜像安全扫描工具，具有易用性强、扫描速度快的特点。

#### Trivy核心特性

##### 1. 多类型扫描
Trivy支持多种类型的扫描：
- **OS包扫描**：检测操作系统包中的漏洞
- **应用依赖扫描**：检测应用依赖库中的漏洞
- **配置检查**：检查不安全的配置
- **机密信息扫描**：检测硬编码的密钥和密码

##### 2. 多格式支持
Trivy支持多种镜像格式：
- **Docker镜像**：本地或远程Docker镜像
- **OCI镜像**：符合OCI标准的镜像
- **文件系统**：本地文件系统扫描
- **Git仓库**：Git仓库扫描

#### Trivy集成实践

##### 1. 基本使用
```bash
#!/bin/bash
# trivy-scan.sh - Trivy镜像扫描脚本

set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 配置变量
IMAGE_NAME=${1:-""}
IMAGE_TAG=${2:-"latest"}
SEVERITY_THRESHOLD=${SEVERITY_THRESHOLD:-"CRITICAL,HIGH"}
EXIT_CODE=${EXIT_CODE:-1}

if [ -z "$IMAGE_NAME" ]; then
    echo "Usage: $0 <image_name> [image_tag]"
    exit 1
fi

FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"

# 拉取镜像
log "Pulling image: $FULL_IMAGE_NAME"
docker pull "$FULL_IMAGE_NAME"

# 扫描镜像
log "Scanning image with Trivy..."
trivy image \
    --severity "$SEVERITY_THRESHOLD" \
    --exit-code "$EXIT_CODE" \
    --format json \
    --output "trivy-report-$(date +%Y%m%d-%H%M%S).json" \
    "$FULL_IMAGE_NAME"

log "Image scan completed successfully"
```

##### 2. CI/CD集成
```yaml
# GitHub Actions中的Trivy集成
name: Trivy Scan
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  scan:
    name: Scan image
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Build an image from Dockerfile
        run: |
          docker build -t docker.io/my-organization/my-app:${{ github.sha }} .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'docker.io/my-organization/my-app:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
```

##### 3. 高级配置
```yaml
# trivy.yaml - Trivy配置文件
scan:
  skip-dirs:
    - usr/share/doc
    - usr/share/man
  skip-files:
    - etc/ssl/certs/ca-certificates.crt

vulnerability:
  type:
    - os
    - library
  ignore-unfixed: true
  ignore-policy: .trivyignore

misconfiguration:
  scanners:
    - docker
    - kubernetes
  skip-policy: .trivymisconfigskip

secret:
  scanners:
    - aws
    - gcp
    - azure
    - github
  exclude-pattern:
    - "test.*"

# 忽略特定漏洞配置
# .trivyignore
CVE-2018-12345
CVE-2020-54321
```

### Anchore Engine

Anchore Engine是Anchore公司开源的企业级容器镜像分析和合规检查平台，提供了全面的镜像安全和合规性检查功能。

#### Anchore核心组件

##### 1. 核心服务
Anchore Engine包含以下核心服务：
- **Catalog**：核心API服务，管理镜像元数据和分析状态
- **Policy Engine**：策略引擎，执行安全策略和合规检查
- **Analyzer**：分析器，分析镜像内容和提取元数据
- **Simple Queue**：任务队列，管理分析任务
- **API Ext**：扩展API服务

##### 2. 策略管理
Anchore支持灵活的策略管理：
- **Gate Actions**：定义策略检查项和动作
- **Triggers**：定义触发条件
- **Parameters**：定义检查参数

#### Anchore集成实践

##### 1. 服务部署
```yaml
# docker-compose.yml - Anchore Engine部署
version: '3.7'

services:
  anchore-db:
    image: postgres:13
    container_name: anchore-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: anchore
      POSTGRES_PASSWORD: anchore
      POSTGRES_DB: anchore
    volumes:
      - anchore-db-data:/var/lib/postgresql/data

  anchore-engine:
    image: anchore/anchore-engine:v1.0.0
    container_name: anchore-engine
    restart: unless-stopped
    depends_on:
      - anchore-db
    ports:
      - "8228:8228"
    volumes:
      - ./config:/config
    environment:
      ANCHORE_ENDPOINT_HOSTNAME: localhost
      ANCHORE_DB_HOST: anchore-db
      ANCHORE_DB_PASSWORD: anchore
      ANCHORE_DB_USER: anchore
      ANCHORE_DB_NAME: anchore

volumes:
  anchore-db-data:
```

##### 2. 策略配置
```json
{
  "name": "custom_policy",
  "version": "1_0",
  "comment": "Custom security policy",
  "id": "custom_policy_id",
  "rules": [
    {
      "id": "critical_vulns",
      "gate": "vulnerabilities",
      "trigger": "package",
      "action": "stop",
      "params": [
        {
          "name": "package_type",
          "value": "all"
        },
        {
          "name": "severity_comparison",
          "value": ">="
        },
        {
          "name": "severity",
          "value": "Critical"
        }
      ]
    },
    {
      "id": "high_vulns",
      "gate": "vulnerabilities",
      "trigger": "package",
      "action": "warn",
      "params": [
        {
          "name": "package_type",
          "value": "all"
        },
        {
          "name": "severity_comparison",
          "value": ">="
        },
        {
          "name": "severity",
          "value": "High"
        }
      ]
    },
    {
      "id": "unofficial_images",
      "gate": "dockerfile",
      "trigger": "instruction",
      "action": "stop",
      "params": [
        {
          "name": "instruction",
          "value": "FROM"
        },
        {
          "name": "check",
          "value": "not_from_official"
        }
      ]
    }
  ]
}
```

##### 3. CI/CD集成
```python
#!/usr/bin/env python3
"""
Anchore CI/CD集成工具
在CI/CD流程中集成Anchore镜像分析
"""

import requests
import json
import time
import sys
from typing import Dict, Any

class AnchoreClient:
    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip('/')
        self.auth = (username, password)
        self.session = requests.Session()
        self.session.auth = self.auth
    
    def add_image(self, image_tag: str) -> str:
        """添加镜像到Anchore进行分析"""
        url = f"{self.base_url}/v1/images"
        data = {
            "tag": image_tag,
            "dockerfile": None,
            "annotations": {}
        }
        
        response = self.session.post(url, json=data)
        response.raise_for_status()
        
        image_digest = response.json()[0]['imageDigest']
        print(f"Image {image_tag} added with digest: {image_digest}")
        return image_digest
    
    def wait_for_analysis(self, image_digest: str, timeout: int = 300) -> bool:
        """等待镜像分析完成"""
        url = f"{self.base_url}/v1/images/{image_digest}"
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            response = self.session.get(url)
            response.raise_for_status()
            
            status = response.json()[0]['analysis_status']
            print(f"Analysis status: {status}")
            
            if status == 'analyzed':
                return True
            elif status == 'analysis_failed':
                return False
            
            time.sleep(10)
        
        raise TimeoutError("Image analysis timed out")
    
    def evaluate_policy(self, image_digest: str, policy_id: str = None) -> Dict[str, Any]:
        """评估镜像策略"""
        url = f"{self.base_url}/v1/images/{image_digest}/check"
        params = {}
        if policy_id:
            params['policyId'] = policy_id
        
        response = self.session.get(url, params=params)
        response.raise_for_status()
        
        return response.json()
    
    def get_vulnerabilities(self, image_digest: str) -> Dict[str, Any]:
        """获取镜像漏洞信息"""
        url = f"{self.base_url}/v1/images/{image_digest}/vuln/all"
        response = self.session.get(url)
        response.raise_for_status()
        
        return response.json()

def main():
    # 配置参数
    ANCHORE_URL = "http://localhost:8228"
    ANCHORE_USER = "admin"
    ANCHORE_PASS = "foobar"
    IMAGE_TAG = sys.argv[1] if len(sys.argv) > 1 else "myapp:latest"
    
    # 创建Anchore客户端
    client = AnchoreClient(ANCHORE_URL, ANCHORE_USER, ANCHORE_PASS)
    
    try:
        # 添加镜像
        image_digest = client.add_image(IMAGE_TAG)
        
        # 等待分析完成
        print("Waiting for image analysis to complete...")
        if not client.wait_for_analysis(image_digest):
            print("ERROR: Image analysis failed")
            sys.exit(1)
        
        # 评估策略
        print("Evaluating image policy...")
        policy_result = client.evaluate_policy(image_digest)
        
        # 检查策略结果
        final_action = policy_result[0]['detail']['result']['final_action']
        if final_action == 'stop':
            print("ERROR: Image failed policy evaluation")
            print(json.dumps(policy_result, indent=2))
            sys.exit(1)
        
        # 获取漏洞信息
        print("Getting vulnerability information...")
        vulns = client.get_vulnerabilities(image_digest)
        
        # 统计漏洞
        critical_count = len([v for v in vulns.get('Vulnerabilities', []) if v.get('Severity') == 'Critical'])
        high_count = len([v for v in vulns.get('Vulnerabilities', []) if v.get('Severity') == 'High'])
        
        print(f"Vulnerability Summary:")
        print(f"  Critical: {critical_count}")
        print(f"  High: {high_count}")
        
        # 保存详细报告
        with open('anchore-report.json', 'w') as f:
            json.dump(vulns, f, indent=2)
        
        print("Image analysis completed successfully")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## 镜像安全扫描最佳实践

### 1. 构建安全镜像

#### 基础镜像选择
```dockerfile
# 使用官方最小化基础镜像
FROM alpine:3.18

# 或使用Distroless镜像（无shell和包管理器）
# FROM gcr.io/distroless/java:11

# 或使用Red Hat UBI（通用基础镜像）
# FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

# 避免使用以下不安全的基础镜像：
# FROM ubuntu:latest  # 版本不固定
# FROM centos:latest  # 版本不固定
```

#### 多阶段构建
```dockerfile
# 多阶段构建示例
# 构建阶段
FROM golang:1.21-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache git gcc musl-dev

# 设置工作目录
WORKDIR /app

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 运行阶段
FROM alpine:3.18

# 安装运行时依赖
RUN apk add --no-cache ca-certificates

# 创建非root用户
RUN adduser -D -s /bin/sh appuser

# 复制构建产物
COPY --from=builder /app/main /main

# 更改文件所有者
RUN chown appuser:appuser /main

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["/main"]
```

#### 最小化攻击面
```dockerfile
# 避免安装不必要的软件包
FROM alpine:3.18

# 只安装必需的软件包
RUN apk add --no-cache \
    ca-certificates \
    tzdata

# 删除包管理器缓存
# Alpine Linux在使用--no-cache时自动清理

# 移除不必要的文件
RUN rm -rf /var/cache/apk/* \
    /tmp/* \
    /var/tmp/*

# 设置只读文件系统（运行时）
# docker run --read-only ...
```

### 2. 扫描策略配置

#### 严重性阈值设置
```yaml
# trivy.yaml - 严重性阈值配置
scan:
  # 忽略未修复的漏洞
  ignore-unfixed: true

vulnerability:
  # 设置严重性阈值
  severity:
    - CRITICAL
    - HIGH
    - MEDIUM
    - LOW
  
  # 忽略特定漏洞
  ignore-policy: .trivyignore

# .trivyignore - 忽略的漏洞列表
# CVE-2018-12345: 已评估为低风险
# CVE-2020-54321: 不影响当前使用场景
```

#### CI/CD门禁配置
```yaml
# GitLab CI中的门禁配置
stages:
  - build
  - security-scan
  - deploy

security-scan:
  stage: security-scan
  image: 
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy image --severity CRITICAL,HIGH --exit-code 1 $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  allow_failure: false
  only:
    - master
    - develop
```

### 3. 持续监控与告警

#### 漏洞监控脚本
```python
#!/usr/bin/env python3
"""
镜像漏洞监控工具
持续监控已部署镜像的新漏洞
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List

class ImageVulnerabilityMonitor:
    def __init__(self, registry_url: str, trivy_server: str):
        self.registry_url = registry_url
        self.trivy_server = trivy_server
    
    def get_deployed_images(self) -> List[str]:
        """获取已部署的镜像列表"""
        # 这里应该根据具体的部署环境获取镜像列表
        # 示例：从Kubernetes获取
        try:
            import subprocess
            result = subprocess.run([
                'kubectl', 'get', 'pods', 
                '-o', 'jsonpath={.items[*].spec.containers[*].image}'
            ], capture_output=True, text=True)
            
            images = list(set(result.stdout.split()))
            return images
        except Exception as e:
            print(f"Error getting deployed images: {e}")
            return []
    
    def scan_image(self, image_name: str) -> Dict:
        """扫描镜像"""
        url = f"{self.trivy_server}/api/v1/scan"
        data = {
            "image": image_name
        }
        
        try:
            response = requests.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error scanning image {image_name}: {e}")
            return {}
    
    def check_new_vulnerabilities(self, scan_result: Dict, since_hours: int = 24) -> List[Dict]:
        """检查新发现的漏洞"""
        new_vulns = []
        since_time = datetime.now() - timedelta(hours=since_hours)
        
        vulnerabilities = scan_result.get('Results', [])
        for result in vulnerabilities:
            if 'Vulnerabilities' in result:
                for vuln in result['Vulnerabilities']:
                    # 检查漏洞发布时间
                    published_date = vuln.get('PublishedDate')
                    if published_date:
                        pub_time = datetime.fromisoformat(published_date.replace('Z', '+00:00'))
                        if pub_time > since_time:
                            new_vulns.append(vuln)
        
        return new_vulns
    
    def send_alert(self, image_name: str, vulnerabilities: List[Dict]):
        """发送告警"""
        # 这里可以集成具体的告警系统
        # 如：Slack、Email、PagerDuty等
        print(f"ALERT: New vulnerabilities found in {image_name}")
        for vuln in vulnerabilities:
            print(f"  - {vuln.get('VulnerabilityID')}: {vuln.get('Title')}")
    
    def monitor_loop(self, interval_minutes: int = 60):
        """监控循环"""
        print("Starting image vulnerability monitoring...")
        
        while True:
            try:
                # 获取已部署镜像
                images = self.get_deployed_images()
                print(f"Found {len(images)} deployed images")
                
                # 扫描每个镜像
                for image in images:
                    print(f"Scanning image: {image}")
                    scan_result = self.scan_image(image)
                    
                    if scan_result:
                        # 检查新漏洞
                        new_vulns = self.check_new_vulnerabilities(scan_result)
                        if new_vulns:
                            self.send_alert(image, new_vulns)
                
                print(f"Waiting {interval_minutes} minutes before next scan...")
                time.sleep(interval_minutes * 60)
                
            except KeyboardInterrupt:
                print("Monitoring stopped")
                break
            except Exception as e:
                print(f"Error during monitoring: {e}")
                time.sleep(60)

# 使用示例
if __name__ == "__main__":
    monitor = ImageVulnerabilityMonitor(
        registry_url="https://registry.example.com",
        trivy_server="http://trivy-server:8080"
    )
    
    # 运行监控循环（每小时检查一次）
    monitor.monitor_loop(interval_minutes=60)
```

### 4. 报告与可视化

#### 漏洞报告生成
```python
#!/usr/bin/env python3
"""
镜像安全扫描报告生成工具
生成详细的漏洞分析报告
"""

import json
import pandas as pd
from typing import Dict, List
from datetime import datetime

class VulnerabilityReportGenerator:
    def __init__(self, scan_results: List[Dict]):
        self.scan_results = scan_results
    
    def generate_summary(self) -> Dict:
        """生成汇总统计"""
        summary = {
            'total_images': len(self.scan_results),
            'total_vulnerabilities': 0,
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0,
            'unknown': 0,
            'unfixed': 0
        }
        
        for result in self.scan_results:
            vulnerabilities = self._extract_vulnerabilities(result)
            summary['total_vulnerabilities'] += len(vulnerabilities)
            
            for vuln in vulnerabilities:
                severity = vuln.get('Severity', 'UNKNOWN').lower()
                if severity in summary:
                    summary[severity] += 1
                else:
                    summary['unknown'] += 1
                
                if not vuln.get('FixedVersion'):
                    summary['unfixed'] += 1
        
        return summary
    
    def _extract_vulnerabilities(self, scan_result: Dict) -> List[Dict]:
        """提取漏洞信息"""
        vulnerabilities = []
        results = scan_result.get('Results', [])
        
        for result in results:
            if 'Vulnerabilities' in result:
                vulnerabilities.extend(result['Vulnerabilities'])
        
        return vulnerabilities
    
    def generate_detailed_report(self) -> pd.DataFrame:
        """生成详细报告"""
        report_data = []
        
        for i, result in enumerate(self.scan_results):
            image_name = result.get('ArtifactName', f'Image_{i}')
            vulnerabilities = self._extract_vulnerabilities(result)
            
            for vuln in vulnerabilities:
                report_data.append({
                    'Image': image_name,
                    'VulnerabilityID': vuln.get('VulnerabilityID'),
                    'PkgName': vuln.get('PkgName'),
                    'InstalledVersion': vuln.get('InstalledVersion'),
                    'FixedVersion': vuln.get('FixedVersion', 'None'),
                    'Severity': vuln.get('Severity'),
                    'Title': vuln.get('Title', ''),
                    'Description': vuln.get('Description', '')[:100] + '...' if len(vuln.get('Description', '')) > 100 else vuln.get('Description', ''),
                    'PrimaryURL': vuln.get('PrimaryURL', '')
                })
        
        return pd.DataFrame(report_data)
    
    def generate_html_report(self, output_file: str):
        """生成HTML报告"""
        summary = self.generate_summary()
        details = self.generate_detailed_report()
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>镜像安全扫描报告</title>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                h1, h2 {{ color: #333; }}
                table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .critical {{ background-color: #ffebee; }}
                .high {{ background-color: #fff3e0; }}
                .medium {{ background-color: #fff8e1; }}
                .summary {{ background-color: #e8f5e8; padding: 15px; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <h1>镜像安全扫描报告</h1>
            <p>生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <div class="summary">
                <h2>汇总统计</h2>
                <p>扫描镜像数量: {summary['total_images']}</p>
                <p>总漏洞数量: {summary['total_vulnerabilities']}</p>
                <p>严重(Critical): {summary['critical']}</p>
                <p>高(High): {summary['high']}</p>
                <p>中(Medium): {summary['medium']}</p>
                <p>低(Low): {summary['low']}</p>
                <p>未知(Unknown): {summary['unknown']}</p>
                <p>未修复: {summary['unfixed']}</p>
            </div>
            
            <h2>详细漏洞信息</h2>
            {details.to_html(classes='dataframe', escape=False, index=False)}
        </body>
        </html>
        """
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"HTML报告已生成: {output_file}")
    
    def generate_csv_report(self, output_file: str):
        """生成CSV报告"""
        details = self.generate_detailed_report()
        details.to_csv(output_file, index=False, encoding='utf-8')
        print(f"CSV报告已生成: {output_file}")

# 使用示例
if __name__ == "__main__":
    # 加载扫描结果
    scan_results = []
    for i in range(1, 4):
        try:
            with open(f'trivy-report-{i}.json', 'r') as f:
                scan_results.append(json.load(f))
        except FileNotFoundError:
            print(f"警告: 未找到 trivy-report-{i}.json")
    
    if scan_results:
        generator = VulnerabilityReportGenerator(scan_results)
        
        # 生成HTML报告
        generator.generate_html_report('image-security-report.html')
        
        # 生成CSV报告
        generator.generate_csv_report('image-security-report.csv')
    else:
        print("未找到扫描结果文件")
```

通过在CI/CD流水线中集成镜像安全扫描工具，团队能够在软件交付的早期阶段识别和修复容器镜像中的安全漏洞，实现真正的"安全左移"。这不仅能够显著降低安全风险，还能帮助组织满足各种合规性要求。关键是要选择合适的扫描工具，建立完善的扫描策略，并将安全扫描深度集成到开发和部署流程中，从而构建安全、可靠的容器化应用交付体系。