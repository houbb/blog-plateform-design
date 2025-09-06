---
title: 安全与合规（DevSecOps）
date: 2025-08-30
categories: [CICD]
tags: [ci,cd,security,compliance,devsecops]
published: true
---

在现代软件开发和交付实践中，安全与合规已成为不可忽视的重要环节。随着DevOps理念的深入发展，DevSecOps作为其自然延伸，强调将安全左移至开发早期阶段，通过自动化和集成化的手段确保软件全生命周期的安全性。同时，面对日益严格的法规要求和行业标准，合规性也成为企业必须满足的基本条件。本文将深入探讨左移的安全实践、密钥与凭据管理、合规性即代码以及镜像安全扫描等关键方面，帮助团队构建安全可靠的CI/CD平台。

## 10.1 左移的安全实践：SAST/DAST/SCA工具在流水线中的集成

安全左移是DevSecOps的核心理念，旨在将安全检查和控制措施尽早集成到软件开发生命周期中，从而在问题早期发现和修复安全漏洞，降低修复成本和风险。

### 安全左移的核心价值

#### 早期风险识别
通过在开发早期集成安全工具，团队能够在代码编写阶段就发现潜在的安全问题，避免问题在后期才被发现而导致高昂的修复成本。

#### 成本效益优化
统计数据显示，在需求阶段修复安全问题的成本仅为生产环境修复成本的1/100，而在开发阶段修复的成本也仅为生产环境的1/10。

#### 文化转变促进
安全左移不仅是一种技术实践，更是一种文化转变，促使开发团队承担起安全责任，形成"安全人人有责"的组织文化。

#### 合规性保障
通过自动化安全检查，确保软件开发过程符合相关法规和行业标准要求，降低合规风险。

### SAST（静态应用安全测试）集成

SAST工具通过分析源代码来发现潜在的安全漏洞和代码缺陷，是安全左移的重要工具。

#### SAST工具选择与集成

```yaml
# GitLab CI中的SAST集成示例
sast:
  stage: security
  variables:
    SAST_CONFIDENCE_LEVEL: 3  # 高置信度
  script:
    - semgrep --config=ci --error --json . > semgrep-report.json
  artifacts:
    reports:
      sast: semgrep-report.json
  allow_failure: false
  only:
    - branches

# 自定义SAST扫描脚本
#!/bin/bash
# sast-scan.sh

set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 运行多种SAST工具
run_semgrep() {
    log "Running Semgrep scan..."
    semgrep --config=ci --error --json . > semgrep-report.json
    log "Semgrep scan completed"
}

run_bandit() {
    log "Running Bandit scan..."
    bandit -r . -f json -o bandit-report.json
    log "Bandit scan completed"
}

run_gosec() {
    log "Running Gosec scan..."
    gosec -fmt=json -out=gosec-report.json ./...
    log "Gosec scan completed"
}

# 主扫描流程
main() {
    log "Starting SAST scan"
    
    # 创建报告目录
    mkdir -p sast-reports
    
    # 运行各种扫描工具
    run_semgrep
    run_bandit
    run_gosec
    
    # 合并报告
    python3 ./scripts/merge-sast-reports.py
    
    # 检查结果
    python3 ./scripts/check-sast-results.py
    
    log "SAST scan completed"
}

main
```

#### SAST工具配置最佳实践

```yaml
# Semgrep配置示例
rules:
  - id: hardcoded-password
    patterns:
      - pattern: $PASSWORD = "..."
      - metavariable-regex:
          metavariable: $PASSWORD
          regex: (password|pwd|pass)
    message: "Hardcoded password detected"
    languages: [python, javascript, java]
    severity: ERROR

  - id: sql-injection
    patterns:
      - pattern-either:
          - pattern: |
              $QUERY = "...".$VAR."..."
              execute($QUERY)
          - pattern: |
              execute("..." + $VAR + "...")
    message: "Potential SQL injection vulnerability"
    languages: [python, java, javascript]
    severity: ERROR

  - id: weak-crypto
    patterns:
      - pattern-either:
          - pattern: md5(...)
          - pattern: sha1(...)
    message: "Weak cryptographic hash function used"
    languages: [python, java, javascript]
    severity: WARNING
```

### DAST（动态应用安全测试）集成

DAST工具通过模拟攻击来测试运行中的应用程序，发现运行时安全漏洞。

#### DAST工具集成实践

```yaml
# GitLab CI中的DAST集成
dast:
  stage: security
  image: 
    name: owasp/zap2docker-stable
    entrypoint: [""]
  variables:
    DAST_WEBSITE: "http://myapp-staging.example.com"
    DAST spider: "true"
    DAST passive_scan: "true"
    DAST active_scan: "true"
  script:
    - zap-baseline.py -t $DAST_WEBSITE -J zap-report.json
  artifacts:
    reports:
      dast: zap-report.json
  allow_failure: false
  only:
    - staging

# 自定义DAST扫描脚本
#!/bin/bash
# dast-scan.sh

set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 配置变量
TARGET_URL=${1:-"http://localhost:8080"}
SCAN_DURATION=${2:-"300"}  # 扫描时长（秒）

# 启动ZAP daemon
log "Starting ZAP daemon..."
zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true &

# 等待ZAP启动
sleep 10

# 执行扫描
log "Starting DAST scan for $TARGET_URL"
python3 /zap/scripts/zap-full-scan.py -t $TARGET_URL -d -m $SCAN_DURATION

# 生成报告
log "Generating DAST report..."
python3 /zap/scripts/zap-api-scan.py -t $TARGET_URL -f openapi -r dast-report.html

log "DAST scan completed"
```

### SCA（软件成分分析）集成

SCA工具分析应用程序的第三方依赖，识别已知的安全漏洞和许可证风险。

#### SCA工具集成示例

```python
#!/usr/bin/env python3
"""
SCA扫描工具集成
支持多种SCA工具的结果合并和分析
"""

import subprocess
import json
from typing import Dict, List
import requests
from datetime import datetime

class ScaScanner:
    def __init__(self):
        self.scanners = {
            'dependency_check': self._run_dependency_check,
            'safety': self._run_safety,
            'npm_audit': self._run_npm_audit,
            'snyk': self._run_snyk
        }
    
    def scan_all(self) -> Dict[str, any]:
        """
        运行所有SCA工具
        
        Returns:
            扫描结果
        """
        results = {
            'timestamp': datetime.now().isoformat(),
            'scanners': {},
            'vulnerabilities': [],
            'licenses': [],
            'summary': {}
        }
        
        for scanner_name, scanner_func in self.scanners.items():
            try:
                result = scanner_func()
                results['scanners'][scanner_name] = {
                    'status': 'success',
                    'result': result
                }
                results['vulnerabilities'].extend(result.get('vulnerabilities', []))
                results['licenses'].extend(result.get('licenses', []))
            except Exception as e:
                results['scanners'][scanner_name] = {
                    'status': 'failed',
                    'error': str(e)
                }
        
        # 生成摘要
        results['summary'] = self._generate_summary(results['vulnerabilities'])
        return results
    
    def _run_dependency_check(self) -> Dict[str, any]:
        """运行OWASP Dependency-Check"""
        try:
            # 运行Dependency-Check
            result = subprocess.run([
                'dependency-check.sh',
                '--scan', '.',
                '--format', 'JSON',
                '--out', 'dependency-check-report.json'
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                raise Exception(f"Dependency-Check failed: {result.stderr}")
            
            # 解析结果
            with open('dependency-check-report.json', 'r') as f:
                report = json.load(f)
            
            vulnerabilities = []
            licenses = []
            for dependency in report.get('dependencies', []):
                # 收集漏洞信息
                for vulnerability in dependency.get('vulnerabilities', []):
                    vulnerabilities.append({
                        'scanner': 'dependency_check',
                        'dependency': dependency.get('fileName', ''),
                        'cve': vulnerability.get('name', ''),
                        'severity': vulnerability.get('severity', 'UNKNOWN'),
                        'description': vulnerability.get('description', ''),
                        'cvss_score': vulnerability.get('cvssScore', 0),
                        'references': vulnerability.get('references', [])
                    })
                
                # 收集许可证信息
                for license_info in dependency.get('licenses', []):
                    licenses.append({
                        'scanner': 'dependency_check',
                        'dependency': dependency.get('fileName', ''),
                        'license': license_info.get('name', ''),
                        'risk': license_info.get('risk', 'UNKNOWN')
                    })
            
            return {
                'vulnerabilities': vulnerabilities,
                'licenses': licenses,
                'dependencies_scanned': len(report.get('dependencies', []))
            }
            
        except subprocess.TimeoutExpired:
            raise Exception("Dependency-Check timed out")
        except Exception as e:
            raise Exception(f"Dependency-Check failed: {str(e)}")
    
    def _run_safety(self) -> Dict[str, any]:
        """运行Safety"""
        try:
            # 运行Safety
            result = subprocess.run([
                'safety',
                'check',
                '--json',
                '--full-report'
            ], capture_output=True, text=True, timeout=120)
            
            if result.returncode not in [0, 1]:  # 0=无漏洞, 1=有漏洞
                raise Exception(f"Safety failed: {result.stderr}")
            
            # 解析结果
            vulnerabilities = json.loads(result.stdout)
            
            parsed_vulnerabilities = []
            for vuln in vulnerabilities:
                parsed_vulnerabilities.append({
                    'scanner': 'safety',
                    'package': vuln.get('package_name', ''),
                    'version': vuln.get('analyzed_version', ''),
                    'cve': vuln.get('cve', ''),
                    'severity': self._map_safety_severity(vuln.get('severity', 'UNKNOWN')),
                    'description': vuln.get('advisory', ''),
                    'cvss_score': vuln.get('cvssv2', 0),
                    'affected_versions': vuln.get('affected_versions', [])
                })
            
            return {
                'vulnerabilities': parsed_vulnerabilities,
                'vulnerabilities_found': len(parsed_vulnerabilities)
            }
            
        except subprocess.TimeoutExpired:
            raise Exception("Safety timed out")
        except Exception as e:
            raise Exception(f"Safety failed: {str(e)}")
    
    def _run_npm_audit(self) -> Dict[str, any]:
        """运行npm audit"""
        try:
            # 检查是否存在package.json
            import os
            if not os.path.exists('package.json'):
                return {'vulnerabilities': [], 'licenses': [], 'skipped': 'No package.json found'}
            
            # 运行npm audit
            result = subprocess.run([
                'npm',
                'audit',
                '--json'
            ], capture_output=True, text=True, timeout=120)
            
            if result.returncode not in [0, 1]:  # 0=无漏洞, 1=有漏洞
                raise Exception(f"npm audit failed: {result.stderr}")
            
            # 解析结果
            audit_result = json.loads(result.stdout)
            
            vulnerabilities = []
            for vuln_id, vuln_info in audit_result.get('vulnerabilities', {}).items():
                vulnerabilities.append({
                    'scanner': 'npm_audit',
                    'package': vuln_id,
                    'severity': vuln_info.get('severity', 'UNKNOWN').upper(),
                    'description': vuln_info.get('title', ''),
                    'cvss_score': vuln_info.get('cvss', {}).get('score', 0),
                    'recommendation': vuln_info.get('recommendation', ''),
                    'via': vuln_info.get('via', [])
                })
            
            # 运行npm license checker
            licenses = self._run_npm_license_checker()
            
            return {
                'vulnerabilities': vulnerabilities,
                'licenses': licenses,
                'vulnerabilities_found': len(vulnerabilities)
            }
            
        except subprocess.TimeoutExpired:
            raise Exception("npm audit timed out")
        except Exception as e:
            raise Exception(f"npm audit failed: {str(e)}")
    
    def _run_npm_license_checker(self) -> List[Dict]:
        """运行npm license checker"""
        try:
            result = subprocess.run([
                'license-checker',
                '--json',
                '--summary'
            ], capture_output=True, text=True, timeout=60)
            
            if result.returncode != 0:
                return []
            
            license_data = json.loads(result.stdout)
            licenses = []
            
            for package, info in license_data.items():
                licenses.append({
                    'scanner': 'npm_license_checker',
                    'package': package,
                    'license': info.get('licenses', ['UNKNOWN'])[0],
                    'repository': info.get('repository', ''),
                    'publisher': info.get('publisher', '')
                })
            
            return licenses
            
        except Exception:
            return []
    
    def _run_snyk(self) -> Dict[str, any]:
        """运行Snyk"""
        try:
            # 检查是否存在Snyk配置
            import os
            if not os.path.exists('.snyk'):
                return {'vulnerabilities': [], 'licenses': [], 'skipped': 'No .snyk config found'}
            
            # 运行Snyk测试
            test_result = subprocess.run([
                'snyk',
                'test',
                '--json'
            ], capture_output=True, text=True, timeout=300)
            
            if test_result.returncode not in [0, 1]:  # 0=无漏洞, 1=有漏洞
                raise Exception(f"Snyk test failed: {test_result.stderr}")
            
            # 解析漏洞结果
            snyk_result = json.loads(test_result.stdout)
            
            vulnerabilities = []
            for vuln in snyk_result.get('vulnerabilities', []):
                vulnerabilities.append({
                    'scanner': 'snyk',
                    'package': vuln.get('packageName', ''),
                    'version': vuln.get('version', ''),
                    'cve': vuln.get('identifiers', {}).get('CVE', [''])[0],
                    'severity': vuln.get('severity', 'UNKNOWN').upper(),
                    'description': vuln.get('title', ''),
                    'cvss_score': vuln.get('cvssScore', 0),
                    'patch': vuln.get('isPatchable', False),
                    'upgrade_path': vuln.get('upgradePath', [])
                })
            
            # 运行Snyk许可证检查
            license_result = subprocess.run([
                'snyk',
                'test',
                '--org',
                'myorg',
                '--json'
            ], capture_output=True, text=True, timeout=300)
            
            if license_result.returncode not in [0, 1]:
                licenses = []
            else:
                license_data = json.loads(license_result.stdout)
                licenses = []
                for license_info in license_data.get('licenses', []):
                    licenses.append({
                        'scanner': 'snyk',
                        'package': license_info.get('package', {}).get('name', ''),
                        'license': license_info.get('license', ''),
                        'license_type': license_info.get('type', ''),
                        'policy': license_info.get('policy', '')
                    })
            
            return {
                'vulnerabilities': vulnerabilities,
                'licenses': licenses,
                'vulnerabilities_found': len(vulnerabilities)
            }
            
        except subprocess.TimeoutExpired:
            raise Exception("Snyk timed out")
        except Exception as e:
            raise Exception(f"Snyk failed: {str(e)}")
    
    def _map_safety_severity(self, severity: str) -> str:
        """映射Safety严重性等级"""
        severity_map = {
            '0': 'LOW',
            '1': 'MEDIUM',
            '2': 'HIGH',
            '3': 'CRITICAL'
        }
        return severity_map.get(severity, 'UNKNOWN')
    
    def _generate_summary(self, vulnerabilities: List[Dict]) -> Dict[str, int]:
        """生成漏洞摘要"""
        summary = {
            'total': len(vulnerabilities),
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        }
        
        severity_map = {
            'CRITICAL': 'critical',
            'HIGH': 'high',
            'MEDIUM': 'medium',
            'LOW': 'low'
        }
        
        for vuln in vulnerabilities:
            severity = vuln.get('severity', 'UNKNOWN')
            if severity in severity_map:
                summary[severity_map[severity]] += 1
        
        return summary

# CI/CD集成示例
if __name__ == "__main__":
    scanner = ScaScanner()
    
    try:
        results = scanner.scan_all()
        print(json.dumps(results, indent=2))
        
        # 检查是否有严重漏洞
        if results['summary']['critical'] > 0 or results['summary']['high'] > 5:
            print("ERROR: Critical or too many high severity vulnerabilities found")
            exit(1)
        else:
            print("SCA scan passed")
            
    except Exception as e:
        print(f"SCA scan failed: {e}")
        exit(1)
```

## 10.2 密钥与凭据管理：与Vault等 secrets manager 集成

在现代应用开发中，密钥和凭据的安全管理至关重要。硬编码密钥不仅违反安全最佳实践，还可能导致严重的安全事件。通过集成专业的密钥管理工具，可以实现密钥的安全存储、动态生成和访问控制。

### 密钥管理挑战与解决方案

#### 常见密钥管理问题

1. **硬编码密钥**：密钥直接写在代码中，容易泄露
2. **明文存储**：配置文件中以明文形式存储密钥
3. **权限控制不足**：缺乏细粒度的访问控制
4. **轮换困难**：密钥更新和轮换过程复杂
5. **审计缺失**：缺乏密钥使用情况的审计跟踪

#### 密钥管理最佳实践

```yaml
# Kubernetes Secret管理示例
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
  namespace: production
type: Opaque
data:
  # Base64编码的密钥
  database-password: {{ .Values.database.password | b64enc }}
  api-key: {{ .Values.api.key | b64enc }}
  tls-cert: {{ .Values.tls.cert | b64enc }}
  tls-key: {{ .Values.tls.key | b64enc }}

---
# 通过外部密钥管理器注入
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
spec:
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v1.0
        env:
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-password
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: api-key
        volumeMounts:
        - name: tls-certs
          mountPath: /etc/certs
          readOnly: true
      volumes:
      - name: tls-certs
        secret:
          secretName: myapp-secrets
          items:
          - key: tls-cert
            path: tls.crt
          - key: tls-key
            path: tls.key
```

### HashiCorp Vault集成实践

#### Vault架构设计

```hcl
# Vault策略配置示例
# production-app-policy.hcl
path "secret/data/production/myapp/*" {
  capabilities = ["read"]
}

path "secret/data/production/myapp/database" {
  capabilities = ["read", "update"]
}

path "secret/metadata/production/myapp/*" {
  capabilities = ["list"]
}

# 允许生成临时凭据
path "database/creds/myapp-production" {
  capabilities = ["read"]
}
```

#### Vault Agent集成

```yaml
# Vault Agent配置
# vault-agent-config.hcl
exit_after_auth = true
pid_file = "/tmp/pidfile"

auto_auth {
  method {
    type = "kubernetes"
    mount_path = "auth/kubernetes"
    config = {
      role = "myapp-role"
    }
  }

  sink {
    type = "file"
    config = {
      path = "/home/vault/.vault-token"
    }
  }
}

template {
  source = "/etc/vault/templates/database-config.ctmpl"
  destination = "/etc/myapp/database-config.yaml"
  command = "chmod 600 /etc/myapp/database-config.yaml"
}

template {
  source = "/etc/vault/templates/api-config.ctmpl"
  destination = "/etc/myapp/api-config.yaml"
  command = "chmod 600 /etc/myapp/api-config.yaml"
}
```

```go
// Go应用中的Vault集成示例
package main

import (
    "context"
    "fmt"
    "log"
    "os"
    "time"

    "github.com/hashicorp/vault/api"
)

type Config struct {
    DatabaseURL    string
    DatabaseUser   string
    DatabasePass   string
    APIKey         string
    ServiceAccount string
}

func main() {
    // 初始化Vault客户端
    config := &api.Config{
        Address: os.Getenv("VAULT_ADDR"),
    }
    
    client, err := api.NewClient(config)
    if err != nil {
        log.Fatal(err)
    }
    
    // 使用Kubernetes认证
    if err := authenticateWithKubernetes(client); err != nil {
        log.Fatal(err)
    }
    
    // 获取配置
    cfg, err := getConfig(client)
    if err != nil {
        log.Fatal(err)
    }
    
    // 使用配置启动应用
    startApplication(cfg)
}

func authenticateWithKubernetes(client *api.Client) error {
    // 读取Kubernetes服务账户Token
    jwt, err := os.ReadFile("/var/run/secrets/kubernetes.io/serviceaccount/token")
    if err != nil {
        return fmt.Errorf("failed to read service account token: %w", err)
    }
    
    // 准备认证请求
    secret, err := client.Logical().Write("auth/kubernetes/login", map[string]interface{}{
        "role": "myapp-role",
        "jwt":  string(jwt),
    })
    if err != nil {
        return fmt.Errorf("failed to authenticate with Kubernetes: %w", err)
    }
    
    // 设置客户端Token
    client.SetToken(secret.Auth.ClientToken)
    return nil
}

func getConfig(client *api.Client) (*Config, error) {
    // 读取数据库配置
    dbSecret, err := client.Logical().Read("secret/data/production/myapp/database")
    if err != nil {
        return nil, fmt.Errorf("failed to read database secret: %w", err)
    }
    
    dbData := dbSecret.Data["data"].(map[string]interface{})
    
    // 读取API密钥
    apiSecret, err := client.Logical().Read("secret/data/production/myapp/api-key")
    if err != nil {
        return nil, fmt.Errorf("failed to read API key: %w", err)
    }
    
    apiKeyData := apiSecret.Data["data"].(map[string]interface{})
    
    // 生成临时数据库凭据
    tempCreds, err := client.Logical().Read("database/creds/myapp-production")
    if err != nil {
        return nil, fmt.Errorf("failed to generate temporary credentials: %w", err)
    }
    
    tempData := tempCreds.Data
    
    return &Config{
        DatabaseURL:    dbData["url"].(string),
        DatabaseUser:   tempData["username"].(string),
        DatabasePass:   tempData["password"].(string),
        APIKey:         apiKeyData["key"].(string),
        ServiceAccount: os.Getenv("SERVICE_ACCOUNT"),
    }, nil
}

func startApplication(cfg *Config) {
    fmt.Printf("Starting application with config:\n")
    fmt.Printf("  Database URL: %s\n", cfg.DatabaseURL)
    fmt.Printf("  Database User: %s\n", cfg.DatabaseUser)
    // 注意：不要打印密码等敏感信息
    fmt.Printf("  API Key: ***\n")
    
    // 启动应用逻辑
    // ...
}
```

#### Kubernetes集成示例

```yaml
# Vault Kubernetes认证配置
# vault-kubernetes-auth.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vault-agent-injector
  namespace: vault
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vault-agent-injector
  template:
    metadata:
      labels:
        app: vault-agent-injector
    spec:
      serviceAccountName: vault-agent-injector
      containers:
      - name: vault-agent-injector
        image: hashicorp/vault-k8s:latest
        env:
        - name: VAULT_ADDR
          value: "http://vault:8200"
        - name: SKIP_SECRETS
          value: "false"
        args:
        - agent-inject
        - -log-level=info

---
# 应用Deployment配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
  annotations:
    vault.hashicorp.com/agent-inject: "true"
    vault.hashicorp.com/role: "myapp-role"
    vault.hashicorp.com/agent-inject-secret-database-config: "secret/data/production/myapp/database"
    vault.hashicorp.com/agent-inject-template-database-config: |
      {{- with secret "secret/data/production/myapp/database" -}}
      database:
        url: {{ .Data.data.url }}
        username: {{ .Data.data.username }}
        password: {{ .Data.data.password }}
      {{- end }}
    vault.hashicorp.com/agent-inject-secret-api-config: "secret/data/production/myapp/api-key"
    vault.hashicorp.com/agent-inject-template-api-config: |
      {{- with secret "secret/data/production/myapp/api-key" -}}
      api:
        key: {{ .Data.data.key }}
      {{- end }}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      serviceAccountName: myapp
      containers:
      - name: myapp
        image: myapp:v1.0
        volumeMounts:
        - name: vault-secrets
          mountPath: "/vault/secrets"
          readOnly: true
      volumes:
      - name: vault-secrets
        emptyDir:
          medium: Memory
```

## 10.3 合规性即代码：自动化审计与合规检查

合规性即代码（Compliance as Code）是将合规性要求转化为可执行代码的实践，通过自动化手段确保系统配置和操作符合法规和标准要求。

### 合规性框架设计

#### 合规性检查分类

```python
#!/usr/bin/env python3
"""
合规性检查框架
支持多种合规标准的自动化检查
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum
import json
import yaml
from datetime import datetime

class ComplianceStandard(Enum):
    """合规标准"""
    ISO_27001 = "iso_27001"
    SOC_2 = "soc_2"
    HIPAA = "hipaa"
    GDPR = "gdpr"
    PCI_DSS = "pci_dss"

class ComplianceSeverity(Enum):
    """合规严重性"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class ComplianceCheck:
    """合规检查项"""
    id: str
    name: str
    description: str
    standard: ComplianceStandard
    severity: ComplianceSeverity
    check_function: callable
    remediation: str

@dataclass
class ComplianceResult:
    """合规检查结果"""
    check_id: str
    check_name: str
    standard: ComplianceStandard
    severity: ComplianceSeverity
    passed: bool
    evidence: Any
    remediation: str
    timestamp: datetime

class ComplianceChecker:
    """合规检查器"""
    def __init__(self):
        self.checks = []
        self.results = []
    
    def register_check(self, check: ComplianceCheck):
        """注册合规检查项"""
        self.checks.append(check)
    
    def run_all_checks(self, context: Dict[str, Any]) -> List[ComplianceResult]:
        """
        运行所有合规检查
        
        Args:
            context: 检查上下文
            
        Returns:
            检查结果列表
        """
        results = []
        
        for check in self.checks:
            try:
                passed, evidence = check.check_function(context)
                result = ComplianceResult(
                    check_id=check.id,
                    check_name=check.name,
                    standard=check.standard,
                    severity=check.severity,
                    passed=passed,
                    evidence=evidence,
                    remediation=check.remediation,
                    timestamp=datetime.now()
                )
                results.append(result)
            except Exception as e:
                # 检查执行失败也记录为不合规
                result = ComplianceResult(
                    check_id=check.id,
                    check_name=check.name,
                    standard=check.standard,
                    severity=ComplianceSeverity.CRITICAL,
                    passed=False,
                    evidence=f"Check execution failed: {str(e)}",
                    remediation=check.remediation,
                    timestamp=datetime.now()
                )
                results.append(result)
        
        self.results = results
        return results
    
    def get_summary(self) -> Dict[str, int]:
        """获取合规检查摘要"""
        summary = {
            'total': len(self.results),
            'passed': 0,
            'failed': 0,
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        }
        
        for result in self.results:
            if result.passed:
                summary['passed'] += 1
            else:
                summary['failed'] += 1
                severity_key = result.severity.value.lower()
                summary[severity_key] += 1
        
        return summary
    
    def generate_report(self) -> str:
        """生成合规报告"""
        summary = self.get_summary()
        
        report_lines = []
        report_lines.append("=" * 60)
        report_lines.append("COMPLIANCE CHECK REPORT")
        report_lines.append("=" * 60)
        report_lines.append(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append("")
        report_lines.append("SUMMARY:")
        report_lines.append(f"  Total checks: {summary['total']}")
        report_lines.append(f"  Passed: {summary['passed']}")
        report_lines.append(f"  Failed: {summary['failed']}")
        report_lines.append(f"  Critical: {summary['critical']}")
        report_lines.append(f"  High: {summary['high']}")
        report_lines.append(f"  Medium: {summary['medium']}")
        report_lines.append(f"  Low: {summary['low']}")
        report_lines.append("")
        report_lines.append("FAILED CHECKS:")
        
        failed_checks = [r for r in self.results if not r.passed]
        for result in failed_checks:
            report_lines.append(f"  [{result.severity.value}] {result.check_name}")
            report_lines.append(f"    Standard: {result.standard.value}")
            report_lines.append(f"    Evidence: {result.evidence}")
            report_lines.append(f"    Remediation: {result.remediation}")
            report_lines.append("")
        
        return "\n".join(report_lines)

# 具体的合规检查实现
def check_code_review(context: Dict[str, Any]) -> tuple:
    """检查代码审查"""
    # 检查是否有足够的代码审查
    pr_reviews = context.get('pull_request_reviews', [])
    min_reviews = context.get('min_reviews_required', 2)
    
    review_count = len([r for r in pr_reviews if r.get('state') == 'APPROVED'])
    passed = review_count >= min_reviews
    evidence = f"Approved reviews: {review_count}/{min_reviews}"
    
    return passed, evidence

def check_branch_protection(context: Dict[str, Any]) -> tuple:
    """检查分支保护"""
    # 检查主分支是否有保护规则
    branch_protection = context.get('branch_protection', {})
    required_checks = ['code_review', 'ci_passing', 'security_scan']
    
    enabled_protections = branch_protection.get('required_status_checks', [])
    missing_protections = [check for check in required_checks if check not in enabled_protections]
    
    passed = len(missing_protections) == 0
    evidence = f"Missing protections: {missing_protections}" if missing_protections else "All protections enabled"
    
    return passed, evidence

def check_secrets_management(context: Dict[str, Any]) -> tuple:
    """检查密钥管理"""
    # 检查代码中是否包含硬编码密钥
    code_files = context.get('code_files', [])
    secrets_found = []
    
    secret_patterns = [
        r'password\s*=\s*[\'"][^\'"]+',
        r'api_key\s*=\s*[\'"][^\'"]+',
        r'secret\s*=\s*[\'"][^\'"]+',
        r'token\s*=\s*[\'"][^\'"]+'
    ]
    
    import re
    for file_path in code_files:
        try:
            with open(file_path, 'r') as f:
                content = f.read()
                for pattern in secret_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    if matches:
                        secrets_found.extend([(file_path, match) for match in matches])
        except Exception:
            continue
    
    passed = len(secrets_found) == 0
    evidence = f"Secrets found: {len(secrets_found)}" if secrets_found else "No secrets found"
    
    return passed, evidence

def check_access_control(context: Dict[str, Any]) -> tuple:
    """检查访问控制"""
    # 检查权限分配是否合理
    permissions = context.get('permissions', {})
    admin_users = permissions.get('admin_users', [])
    max_admins = context.get('max_admins_allowed', 5)
    
    passed = len(admin_users) <= max_admins
    evidence = f"Admin users: {len(admin_users)}/{max_admins}"
    
    return passed, evidence

# 初始化合规检查
def initialize_compliance_checker():
    """初始化合规检查器"""
    checker = ComplianceChecker()
    
    # 注册检查项
    checks = [
        ComplianceCheck(
            id="code_review_001",
            name="Code Review Requirement",
            description="Ensure all changes are reviewed by at least 2 team members",
            standard=ComplianceStandard.ISO_27001,
            severity=ComplianceSeverity.HIGH,
            check_function=check_code_review,
            remediation="Configure branch protection rules to require code reviews"
        ),
        ComplianceCheck(
            id="branch_protection_001",
            name="Branch Protection",
            description="Ensure main branch has proper protection rules",
            standard=ComplianceStandard.ISO_27001,
            severity=ComplianceSeverity.CRITICAL,
            check_function=check_branch_protection,
            remediation="Enable branch protection with required status checks"
        ),
        ComplianceCheck(
            id="secrets_management_001",
            name="Secrets Management",
            description="Ensure no secrets are hardcoded in source code",
            standard=ComplianceStandard.ISO_27001,
            severity=ComplianceSeverity.CRITICAL,
            check_function=check_secrets_management,
            remediation="Use secret management tools like HashiCorp Vault or AWS Secrets Manager"
        ),
        ComplianceCheck(
            id="access_control_001",
            name="Access Control",
            description="Ensure proper access control and least privilege principle",
            standard=ComplianceStandard.ISO_27001,
            severity=ComplianceSeverity.HIGH,
            check_function=check_access_control,
            remediation="Review and minimize admin permissions, implement role-based access control"
        )
    ]
    
    for check in checks:
        checker.register_check(check)
    
    return checker

# CI/CD集成示例
def run_compliance_check_in_ci():
    """在CI/CD中运行合规检查"""
    # 构建检查上下文
    context = {
        'pull_request_reviews': [
            {'state': 'APPROVED', 'reviewer': 'user1'},
            {'state': 'APPROVED', 'reviewer': 'user2'}
        ],
        'min_reviews_required': 2,
        'branch_protection': {
            'required_status_checks': ['code_review', 'ci_passing', 'security_scan']
        },
        'code_files': ['src/main.py', 'src/config.py'],
        'permissions': {
            'admin_users': ['admin1', 'admin2', 'admin3']
        },
        'max_admins_allowed': 5
    }
    
    # 运行合规检查
    checker = initialize_compliance_checker()
    results = checker.run_all_checks(context)
    
    # 生成报告
    report = checker.generate_report()
    print(report)
    
    # 检查是否有严重问题
    summary = checker.get_summary()
    if summary['critical'] > 0 or summary['high'] > 2:
        print("ERROR: Compliance check failed due to critical or high severity issues")
        exit(1)
    else:
        print("Compliance check passed")

if __name__ == "__main__":
    run_compliance_check_in_ci()
```

### 基础设施即合规（Infrastructure as Compliant）

```hcl
# Terraform合规性检查示例
# 使用OPA (Open Policy Agent)进行合规性验证

# 合规策略示例 (compliance.rego)
package terraform.compliance

# 检查所有S3存储桶是否启用了加密
deny[msg] {
    resource := input.resource.aws_s3_bucket[_]
    not resource.server_side_encryption_configuration
    msg = sprintf("S3 bucket %s does not have server-side encryption enabled", [resource.name])
}

# 检查所有RDS实例是否启用了加密
deny[msg] {
    resource := input.resource.aws_db_instance[_]
    resource.storage_encrypted != true
    msg = sprintf("RDS instance %s does not have storage encryption enabled", [resource.name])
}

# 检查所有安全组是否限制了入站访问
deny[msg] {
    resource := input.resource.aws_security_group[_]
    rule := resource.ingress[_]
    rule.cidr_blocks[_] == "0.0.0.0/0"
    msg = sprintf("Security group %s allows unrestricted inbound access", [resource.name])
}

# 检查所有EC2实例是否使用了IAM角色而非密钥
deny[msg] {
    resource := input.resource.aws_instance[_]
    resource.key_name
    msg = sprintf("EC2 instance %s uses key pair instead of IAM role", [resource.name])
}
```

```yaml
# Terrascan配置示例
# .terrascan/config.toml
[policy]
path = "./policies"
rego_subdirs = ["rego"]

[rules]
skip_rules = [
    "AWS.S3Bucket.DS.High.1041"  # 跳过特定规则示例
]

[notifications]
webhook_url = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# 扫描配置
scan {
    severity = "HIGH"
    category = "all"
}
```

## 10.4 镜像安全扫描：CVE漏洞扫描与阻断

容器镜像安全是云原生应用安全的重要组成部分。通过集成镜像安全扫描工具，可以在镜像构建和部署阶段发现并阻止包含已知漏洞的镜像。

### 镜像安全扫描工具集成

#### Trivy集成实践

```yaml
# GitLab CI中的Trivy集成
container_scanning:
  stage: security
  image: 
    name: docker:latest
    entrypoint: [""]
  services:
    - docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_TLS_CERTDIR: "/certs"
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - trivy image --exit-code 0 --severity HIGH,CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - trivy image --exit-code 1 --severity CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  artifacts:
    reports:
      container_scanning: gl-container-scanning-report.json
  allow_failure: false
  only:
    - master
    - staging

# 自定义Trivy扫描脚本
#!/bin/bash
# trivy-scan.sh

set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 配置变量
IMAGE_NAME=${1:-"myapp:latest"}
SCAN_FORMAT=${2:-"json"}
OUTPUT_FILE=${3:-"trivy-report.json"}
SEVERITY_THRESHOLD=${4:-"CRITICAL"}

# 运行Trivy扫描
log "Running Trivy scan on $IMAGE_NAME"
trivy image \
    --format $SCAN_FORMAT \
    --output $OUTPUT_FILE \
    --severity HIGH,CRITICAL \
    --exit-code 0 \
    $IMAGE_NAME

# 检查结果
log "Checking scan results..."
if [ "$SCAN_FORMAT" = "json" ]; then
    # 解析JSON结果
    CRITICAL_COUNT=$(jq '.Results[].Vulnerabilities[] | select(.Severity=="CRITICAL") | .Severity' $OUTPUT_FILE | wc -l)
    HIGH_COUNT=$(jq '.Results[].Vulnerabilities[] | select(.Severity=="HIGH") | .Severity' $OUTPUT_FILE | wc -l)
    
    log "Found $CRITICAL_COUNT critical and $HIGH_COUNT high severity vulnerabilities"
    
    # 根据阈值决定是否阻断
    if [ "$SEVERITY_THRESHOLD" = "CRITICAL" ] && [ "$CRITICAL_COUNT" -gt 0 ]; then
        log "ERROR: Critical vulnerabilities found, blocking deployment"
        exit 1
    elif [ "$SEVERITY_THRESHOLD" = "HIGH" ] && ([ "$CRITICAL_COUNT" -gt 0 ] || [ "$HIGH_COUNT" -gt 0 ]); then
        log "ERROR: High or critical vulnerabilities found, blocking deployment"
        exit 1
    fi
fi

log "Trivy scan completed successfully"
```

#### Clair集成实践

```python
#!/usr/bin/env python3
"""
Clair镜像安全扫描集成
支持与Clair API进行交互
"""

import requests
import json
from typing import Dict, List
import base64
import hashlib
from datetime import datetime

class ClairScanner:
    def __init__(self, clair_url: str, username: str = None, password: str = None):
        self.clair_url = clair_url.rstrip('/')
        self.session = requests.Session()
        
        if username and password:
            # 设置基本认证
            credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
            self.session.headers.update({
                'Authorization': f'Basic {credentials}'
            })
    
    def scan_image(self, image_name: str) -> Dict[str, any]:
        """
        扫描Docker镜像
        
        Args:
            image_name: 镜像名称
            
        Returns:
            扫描结果
        """
        try:
            # 1. 提交镜像进行扫描
            manifest_url = f"{self.clair_url}/v1/layers"
            image_manifest = self._get_image_manifest(image_name)
            
            # 2. 上传镜像层
            layer_hash = self._upload_layer(image_manifest)
            
            # 3. 获取漏洞报告
            vulnerabilities = self._get_vulnerabilities(layer_hash)
            
            # 4. 分析结果
            analysis = self._analyze_vulnerabilities(vulnerabilities)
            
            return {
                'image': image_name,
                'timestamp': datetime.now().isoformat(),
                'vulnerabilities': vulnerabilities,
                'analysis': analysis
            }
            
        except Exception as e:
            raise Exception(f"Clair scan failed: {str(e)}")
    
    def _get_image_manifest(self, image_name: str) -> Dict:
        """获取镜像清单"""
        # 这里简化处理，实际应该与Docker Registry交互
        # 获取镜像的manifest信息
        return {
            'name': image_name,
            'layers': self._generate_dummy_layers(image_name)
        }
    
    def _generate_dummy_layers(self, image_name: str) -> List[Dict]:
        """生成示例层信息（实际应从镜像中提取）"""
        # 生成一些示例层哈希
        layers = []
        for i in range(3):
            layer_hash = hashlib.sha256(f"{image_name}-layer-{i}".encode()).hexdigest()
            layers.append({
                'digest': f"sha256:{layer_hash}",
                'path': f"/tmp/layer-{i}.tar.gz"
            })
        return layers
    
    def _upload_layer(self, manifest: Dict) -> str:
        """上传镜像层到Clair"""
        # 选择最后一层作为分析目标
        target_layer = manifest['layers'][-1]
        layer_hash = target_layer['digest'].split(':')[1]
        
        # 构造层信息
        layer_data = {
            "Layer": {
                "Name": layer_hash,
                "Path": target_layer['path'],
                "ParentName": manifest['layers'][-2]['digest'].split(':')[1] if len(manifest['layers']) > 1 else "",
                "Format": "Docker",
                "Features": []
            }
        }
        
        # 上传层信息
        response = self.session.post(
            f"{self.clair_url}/v1/layers",
            json=layer_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code != 201:
            raise Exception(f"Failed to upload layer: {response.text}")
        
        return layer_hash
    
    def _get_vulnerabilities(self, layer_hash: str) -> List[Dict]:
        """获取漏洞信息"""
        response = self.session.get(f"{self.clair_url}/v1/layers/{layer_hash}")
        
        if response.status_code != 200:
            raise Exception(f"Failed to get layer vulnerabilities: {response.text}")
        
        layer_data = response.json()
        return layer_data.get('Layer', {}).get('Features', [])
    
    def _analyze_vulnerabilities(self, vulnerabilities: List[Dict]) -> Dict[str, int]:
        """分析漏洞严重性"""
        analysis = {
            'total': len(vulnerabilities),
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0,
            'negligible': 0,
            'unknown': 0
        }
        
        severity_mapping = {
            'Critical': 'critical',
            'High': 'high',
            'Medium': 'medium',
            'Low': 'low',
            'Negligible': 'negligible',
            'Unknown': 'unknown'
        }
        
        for vuln in vulnerabilities:
            for vulnerability in vuln.get('Vulnerabilities', []):
                severity = vulnerability.get('Severity', 'Unknown')
                if severity in severity_mapping:
                    analysis[severity_mapping[severity]] += 1
        
        return analysis
    
    def generate_report(self, scan_result: Dict[str, any]) -> str:
        """生成扫描报告"""
        analysis = scan_result['analysis']
        
        report_lines = []
        report_lines.append("=" * 50)
        report_lines.append("CLAIR SECURITY SCAN REPORT")
        report_lines.append("=" * 50)
        report_lines.append(f"Image: {scan_result['image']}")
        report_lines.append(f"Scan Time: {scan_result['timestamp']}")
        report_lines.append("")
        report_lines.append("VULNERABILITY SUMMARY:")
        report_lines.append(f"  Total: {analysis['total']}")
        report_lines.append(f"  Critical: {analysis['critical']}")
        report_lines.append(f"  High: {analysis['high']}")
        report_lines.append(f"  Medium: {analysis['medium']}")
        report_lines.append(f"  Low: {analysis['low']}")
        report_lines.append(f"  Negligible: {analysis['negligible']}")
        report_lines.append(f"  Unknown: {analysis['unknown']}")
        
        # 详细漏洞信息
        if scan_result['vulnerabilities']:
            report_lines.append("")
            report_lines.append("DETECTED VULNERABILITIES:")
            for feature in scan_result['vulnerabilities']:
                for vulnerability in feature.get('Vulnerabilities', []):
                    severity = vulnerability.get('Severity', 'Unknown')
                    name = vulnerability.get('Name', 'Unknown')
                    description = vulnerability.get('Description', 'No description')
                    
                    report_lines.append(f"  [{severity}] {name}")
                    report_lines.append(f"    Feature: {feature.get('Name', 'Unknown')}")
                    report_lines.append(f"    Description: {description[:100]}...")
                    report_lines.append("")
        
        return "\n".join(report_lines)

# CI/CD集成示例
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python clair-scanner.py <image_name>")
        sys.exit(1)
    
    image_name = sys.argv[1]
    
    try:
        # 初始化Clair扫描器
        scanner = ClairScanner("http://clair:6060")
        
        # 扫描镜像
        result = scanner.scan_image(image_name)
        
        # 生成报告
        report = scanner.generate_report(result)
        print(report)
        
        # 根据结果决定是否阻断
        analysis = result['analysis']
        if analysis['critical'] > 0 or analysis['high'] > 5:
            print("ERROR: Critical or too many high severity vulnerabilities found")
            sys.exit(1)
        else:
            print("Image scan passed")
            
    except Exception as e:
        print(f"Image scan failed: {e}")
        sys.exit(1)
```

### 镜像安全最佳实践

#### 多阶段构建优化

```dockerfile
# 多阶段构建示例
# 构建阶段
FROM golang:1.19-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache git gcc musl-dev

# 设置工作目录
WORKDIR /app

# 复制go.mod和go.sum
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 安全运行阶段
FROM alpine:latest

# 安装必要的运行时依赖
RUN apk --no-cache add ca-certificates

# 创建非root用户
RUN adduser -D -s /bin/sh appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制二进制文件
COPY --from=builder /app/main .

# 更改文件所有者
RUN chown appuser:appuser main

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 启动应用
ENTRYPOINT ["./main"]
```

#### 镜像扫描策略

```yaml
# 镜像扫描策略配置
image_scanning_policy:
  # 基础镜像扫描
  base_images:
    severity_threshold: CRITICAL
    action: block
    schedule: daily
  
  # 应用镜像扫描
  application_images:
    severity_threshold: HIGH
    action: block
    schedule: on_build
  
  # 生产环境镜像扫描
  production_images:
    severity_threshold: MEDIUM
    action: block
    schedule: on_deploy
  
  # 扫描工具配置
  scanners:
    - name: trivy
      enabled: true
      timeout: 300
      ignore_unfixed: true
    
    - name: clair
      enabled: true
      timeout: 600
      ignore_unfixed: false
    
    - name: docker_scan
      enabled: false
      timeout: 120
      ignore_unfixed: true
  
  # 例外配置
  exceptions:
    - cve: CVE-2021-44228
      reason: "Log4j vulnerability, but not using log4j in this application"
      expires: "2023-12-31"
      approved_by: security_team
    
    - image_pattern: "nginx:*"
      reason: "Base image, vulnerabilities will be addressed in next update"
      expires: "2023-11-30"
      approved_by: platform_team
```

通过实施全面的安全与合规策略，团队能够在CI/CD流水线中构建可靠的安全防护体系。左移的安全实践确保安全问题在早期被发现和修复，密钥与凭据管理保障了敏感信息的安全存储和使用，合规性即代码实现了合规要求的自动化验证，而镜像安全扫描则防止了包含已知漏洞的镜像进入生产环境。这些措施的综合应用不仅提高了软件交付的安全性，也为企业的安全合规提供了有力支撑。