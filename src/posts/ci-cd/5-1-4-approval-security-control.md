---
title: "审批与安全管控: 人工卡点、安全扫描、合规检查"
date: 2025-08-30
categories: [CICD]
tags: [CICD]
published: true
---
在现代软件交付流程中，审批与安全管控是确保软件质量和合规性的关键环节。随着DevOps实践的深入和部署频率的提高，如何在保持交付速度的同时确保安全性和合规性成为团队面临的重要挑战。通过建立完善的审批机制、集成全面的安全扫描工具和实施严格的合规检查，团队能够在CI/CD流水线中构建可靠的质量门禁，防止有缺陷或不合规的代码进入生产环境。本文将深入探讨人工审批机制、安全扫描集成、合规检查实施以及整体安全管控策略。

## 人工审批机制

人工审批是CI/CD流水线中的重要质量门禁，通过引入人工决策环节，确保关键变更经过充分审查和授权。

### 审批流程设计

#### 审批类型分类

1. **生产环境部署审批**：对生产环境的任何变更都需要经过严格审批
2. **配置变更审批**：对关键配置的修改需要审批
3. **安全例外审批**：对安全扫描发现的问题申请例外需要审批
4. **架构变更审批**：对系统架构的重大变更需要审批

#### 审批层级设计

```yaml
# 审批策略配置示例
approval_policies:
  production_deployment:
    type: deployment
    environment: production
    approvers:
      - role: devops_team
        min_count: 2
      - role: architect
        min_count: 1
      - role: security_officer
        min_count: 1
    timeout: 24h
    escalation:
      - level: 1
        time: 2h
        notify: team_leads
      - level: 2
        time: 6h
        notify: directors
  
  config_change:
    type: config
    environment: all
    approvers:
      - role: config_owner
        min_count: 1
    timeout: 4h
    escalation:
      - level: 1
        time: 1h
        notify: team_lead
  
  security_exception:
    type: security
    environment: all
    approvers:
      - role: security_team
        min_count: 2
    timeout: 8h
    escalation:
      - level: 1
        time: 2h
        notify: security_lead
```

### CI/CD工具中的审批集成

#### Jenkins Pipeline审批实现
```groovy
// Jenkinsfile - 审批集成示例
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
                timeout(time: 24, unit: 'HOURS') {
                    script {
                        def approval = input(
                            message: 'Approve deployment to production?',
                            submitterParameter: 'approver',
                            parameters: [
                                choice(
                                    choices: ['Approve', 'Reject'],
                                    description: 'Deployment decision',
                                    name: 'decision'
                                ),
                                text(
                                    defaultValue: '',
                                    description: 'Reason for decision (required if rejecting)',
                                    name: 'reason'
                                )
                            ]
                        )
                        
                        // 记录审批信息
                        env.APPROVER = approval.approver
                        env.APPROVAL_DECISION = approval.decision
                        env.APPROVAL_REASON = approval.reason
                        
                        // 如果拒绝，终止流水线
                        if (approval.decision == 'Reject') {
                            error "Deployment rejected by ${approval.approver}: ${approval.reason}"
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                sh 'kubectl apply -f k8s/staging/'
            }
        }
        
        stage('Staging Validation') {
            steps {
                sh './scripts/validate-staging.sh'
            }
        }
        
        stage('Production Approval') {
            steps {
                timeout(time: 24, unit: 'HOURS') {
                    script {
                        def prodApproval = input(
                            message: 'Approve production deployment?',
                            submitterParameter: 'approver',
                            parameters: [
                                choice(
                                    choices: ['Approve', 'Approve with Rollback Plan', 'Reject'],
                                    description: 'Production deployment decision',
                                    name: 'decision'
                                ),
                                text(
                                    defaultValue: '',
                                    description: 'Additional notes',
                                    name: 'notes'
                                )
                            ]
                        )
                        
                        env.PROD_APPROVER = prodApproval.approver
                        env.PROD_APPROVAL_DECISION = prodApproval.decision
                        env.PROD_APPROVAL_NOTES = prodApproval.notes
                        
                        // 如果需要回滚计划，验证回滚计划
                        if (prodApproval.decision == 'Approve with Rollback Plan') {
                            sh './scripts/validate-rollback-plan.sh'
                        }
                        
                        // 如果拒绝，终止流水线
                        if (prodApproval.decision == 'Reject') {
                            error "Production deployment rejected by ${prodApproval.approver}: ${prodApproval.notes}"
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            steps {
                sh 'kubectl apply -f k8s/production/'
            }
        }
    }
    
    post {
        always {
            // 发送通知
            emailext (
                subject: "Pipeline ${currentBuild.result}: ${env.JOB_NAME}",
                body: """
                Pipeline: ${env.JOB_NAME}
                Build: ${env.BUILD_NUMBER}
                Result: ${currentBuild.result}
                Approver: ${env.APPROVER ?: 'N/A'}
                Production Approver: ${env.PROD_APPROVER ?: 'N/A'}
                Duration: ${currentBuild.durationString}
                URL: ${env.BUILD_URL}
                """,
                to: 'devops-team@example.com'
            )
        }
        
        success {
            // 记录成功部署
            sh './scripts/record-deployment.sh success'
        }
        
        failure {
            // 记录失败部署
            sh './scripts/record-deployment.sh failure'
        }
    }
}
```

#### GitLab CI审批实现
```yaml
# .gitlab-ci.yml - 审批集成示例
stages:
  - build
  - test
  - security
  - approval
  - deploy-staging
  - validation
  - deploy-prod-approval
  - deploy-prod

variables:
  DEPLOY_ENVIRONMENT: $CI_COMMIT_REF_NAME

build:
  stage: build
  script:
    - mvn clean package
  artifacts:
    paths:
      - target/*.jar

test:
  stage: test
  script:
    - mvn test
  artifacts:
    reports:
      junit: target/surefire-reports/TEST-*.xml

security-scan:
  stage: security
  script:
    - sonar-scanner
  allow_failure: false

approval:
  stage: approval
  script:
    - echo "Waiting for approval to deploy to staging"
  when: manual
  only:
    - master

deploy-staging:
  stage: deploy-staging
  script:
    - kubectl apply -f k8s/staging/
  environment:
    name: staging
  only:
    - master

validation:
  stage: validation
  script:
    - ./scripts/validate-staging.sh
  environment:
    name: staging
  only:
    - master

deploy-prod-approval:
  stage: deploy-prod-approval
  script:
    - echo "Waiting for production deployment approval"
  when: manual
  only:
    - master

deploy-prod:
  stage: deploy-prod
  script:
    - |
      # 执行蓝绿部署
      helm upgrade --install myapp-green charts/myapp \
        --namespace production \
        --values charts/myapp/values-prod.yaml \
        --set image.tag=$CI_COMMIT_SHA \
        --timeout 900s \
        --wait
    - ./scripts/blue-green-switch.sh myapp production
  environment:
    name: production
  when: manual
  only:
    - master
```

### 审批管理系统

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
import json
import uuid
from abc import ABC, abstractmethod

class ApprovalStatus(Enum):
    """审批状态"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class ApprovalType(Enum):
    """审批类型"""
    DEPLOYMENT = "deployment"
    CONFIG_CHANGE = "config_change"
    SECURITY_EXCEPTION = "security_exception"
    ARCHITECTURE_CHANGE = "architecture_change"

@dataclass
class Approver:
    """审批人"""
    user_id: str
    name: str
    role: str
    email: str

@dataclass
class ApprovalAction:
    """审批动作"""
    approver: Approver
    action: str  # approve, reject, delegate
    comment: str
    timestamp: datetime.datetime

@dataclass
class ApprovalRequest:
    """审批请求"""
    id: str
    type: ApprovalType
    title: str
    description: str
    requester: Approver
    approvers: List[Approver]
    min_approvals: int
    created_at: datetime.datetime
    expires_at: datetime.datetime
    status: ApprovalStatus
    actions: List[ApprovalAction]
    metadata: Dict[str, any]

class ApprovalPolicy:
    """审批策略"""
    def __init__(
        self,
        type: ApprovalType,
        approvers: List[Dict[str, any]],
        timeout_hours: int = 24,
        min_approvals: int = 1
    ):
        self.type = type
        self.approvers = approvers
        self.timeout_hours = timeout_hours
        self.min_approvals = min_approvals

class ApprovalManager:
    """审批管理器"""
    def __init__(self):
        self.requests = {}
        self.policies = {}
        self.approvers_db = {}
    
    def register_approver(self, approver: Approver):
        """注册审批人"""
        self.approvers_db[approver.user_id] = approver
    
    def create_policy(self, policy_name: str, policy: ApprovalPolicy):
        """创建审批策略"""
        self.policies[policy_name] = policy
    
    def create_approval_request(
        self,
        request_type: ApprovalType,
        title: str,
        description: str,
        requester_id: str,
        policy_name: str = None,
        metadata: Dict[str, any] = None
    ) -> str:
        """
        创建审批请求
        
        Args:
            request_type: 审批类型
            title: 标题
            description: 描述
            requester_id: 请求人ID
            policy_name: 策略名称
            metadata: 元数据
            
        Returns:
            审批请求ID
        """
        request_id = str(uuid.uuid4())
        
        # 获取请求人
        requester = self.approvers_db.get(requester_id)
        if not requester:
            raise ValueError(f"Requester {requester_id} not found")
        
        # 获取审批人列表
        approvers = []
        min_approvals = 1
        
        if policy_name and policy_name in self.policies:
            policy = self.policies[policy_name]
            # 根据策略获取审批人
            for approver_config in policy.approvers:
                role = approver_config['role']
                # 这里简化处理，实际应该从用户管理系统获取角色对应的用户
                role_approvers = [a for a in self.approvers_db.values() if a.role == role]
                approvers.extend(role_approvers[:approver_config.get('min_count', 1)])
            min_approvals = policy.min_approvals
        else:
            # 默认审批人（简化处理）
            approvers = [requester]
        
        # 创建审批请求
        now = datetime.datetime.now()
        expires_at = now + datetime.timedelta(hours=24)  # 默认24小时超时
        
        request = ApprovalRequest(
            id=request_id,
            type=request_type,
            title=title,
            description=description,
            requester=requester,
            approvers=approvers,
            min_approvals=min_approvals,
            created_at=now,
            expires_at=expires_at,
            status=ApprovalStatus.PENDING,
            actions=[],
            metadata=metadata or {}
        )
        
        self.requests[request_id] = request
        return request_id
    
    def approve_request(
        self,
        request_id: str,
        approver_id: str,
        comment: str = ""
    ) -> bool:
        """
        批准请求
        
        Args:
            request_id: 审批请求ID
            approver_id: 审批人ID
            comment: 审批意见
            
        Returns:
            审批是否成功
        """
        if request_id not in self.requests:
            return False
        
        request = self.requests[request_id]
        approver = self.approvers_db.get(approver_id)
        
        if not approver:
            return False
        
        # 检查审批人权限
        if approver not in request.approvers:
            return False
        
        # 检查是否已超时
        if datetime.datetime.now() > request.expires_at:
            request.status = ApprovalStatus.EXPIRED
            return False
        
        # 记录审批动作
        action = ApprovalAction(
            approver=approver,
            action="approve",
            comment=comment,
            timestamp=datetime.datetime.now()
        )
        request.actions.append(action)
        
        # 检查是否满足最小审批数
        approve_actions = [a for a in request.actions if a.action == "approve"]
        if len(approve_actions) >= request.min_approvals:
            request.status = ApprovalStatus.APPROVED
        
        return True
    
    def reject_request(
        self,
        request_id: str,
        approver_id: str,
        comment: str = ""
    ) -> bool:
        """
        拒绝请求
        
        Args:
            request_id: 审批请求ID
            approver_id: 审批人ID
            comment: 拒绝原因
            
        Returns:
            拒绝是否成功
        """
        if request_id not in self.requests:
            return False
        
        request = self.requests[request_id]
        approver = self.approvers_db.get(approver_id)
        
        if not approver:
            return False
        
        # 检查审批人权限
        if approver not in request.approvers:
            return False
        
        # 记录拒绝动作
        action = ApprovalAction(
            approver=approver,
            action="reject",
            comment=comment,
            timestamp=datetime.datetime.now()
        )
        request.actions.append(action)
        
        # 更新状态
        request.status = ApprovalStatus.REJECTED
        return True
    
    def get_request(self, request_id: str) -> Optional[ApprovalRequest]:
        """获取审批请求"""
        return self.requests.get(request_id)
    
    def list_requests(
        self,
        status: ApprovalStatus = None,
        request_type: ApprovalType = None
    ) -> List[ApprovalRequest]:
        """列出审批请求"""
        requests = list(self.requests.values())
        
        if status:
            requests = [r for r in requests if r.status == status]
        
        if request_type:
            requests = [r for r in requests if r.type == request_type]
        
        return requests

# 审批策略配置示例
def initialize_approval_policies():
    """初始化审批策略"""
    manager = ApprovalManager()
    
    # 注册审批人
    approvers = [
        Approver("user1", "John Doe", "devops_team", "john.doe@example.com"),
        Approver("user2", "Jane Smith", "architect", "jane.smith@example.com"),
        Approver("user3", "Bob Johnson", "security_officer", "bob.johnson@example.com"),
        Approver("user4", "Alice Brown", "config_owner", "alice.brown@example.com"),
    ]
    
    for approver in approvers:
        manager.register_approver(approver)
    
    # 创建审批策略
    prod_deployment_policy = ApprovalPolicy(
        type=ApprovalType.DEPLOYMENT,
        approvers=[
            {"role": "devops_team", "min_count": 2},
            {"role": "architect", "min_count": 1},
            {"role": "security_officer", "min_count": 1}
        ],
        timeout_hours=24,
        min_approvals=3
    )
    
    manager.create_policy("production_deployment", prod_deployment_policy)
    
    config_change_policy = ApprovalPolicy(
        type=ApprovalType.CONFIG_CHANGE,
        approvers=[
            {"role": "config_owner", "min_count": 1}
        ],
        timeout_hours=4,
        min_approvals=1
    )
    
    manager.create_policy("config_change", config_change_policy)
    
    return manager

# 使用示例
if __name__ == "__main__":
    # 初始化审批系统
    manager = initialize_approval_policies()
    
    # 创建生产部署审批请求
    request_id = manager.create_approval_request(
        request_type=ApprovalType.DEPLOYMENT,
        title="Production Deployment - MyApp v2.0",
        description="Deploying new version with critical security fixes",
        requester_id="user1",
        policy_name="production_deployment",
        metadata={
            "version": "v2.0",
            "commit_sha": "abc123",
            "environment": "production"
        }
    )
    
    print(f"Created approval request: {request_id}")
    
    # 查看审批请求
    request = manager.get_request(request_id)
    print(f"Request: {request.title}")
    print(f"Status: {request.status.value}")
    print(f"Approvers: {[a.name for a in request.approvers]}")
```

## 安全扫描集成

安全扫描是CI/CD流水线中的重要环节，通过集成多种安全工具，能够在代码提交早期发现和修复安全问题。

### 代码安全扫描

#### SAST（静态应用安全测试）
```yaml
# GitLab CI中的SAST集成
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

#### 依赖安全扫描
```python
#!/usr/bin/env python3
"""
依赖安全扫描工具
集成多种依赖扫描工具的结果
"""

import subprocess
import json
from typing import Dict, List
import requests
from datetime import datetime

class DependencyScanner:
    def __init__(self):
        self.scanners = {
            'dependency_check': self._run_dependency_check,
            'safety': self._run_safety,
            'npm_audit': self._run_npm_audit,
            'snyk': self._run_snyk
        }
    
    def scan_all(self) -> Dict[str, any]:
        """
        运行所有依赖扫描工具
        
        Returns:
            扫描结果
        """
        results = {
            'timestamp': datetime.now().isoformat(),
            'scanners': {},
            'vulnerabilities': [],
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
            for dependency in report.get('dependencies', []):
                for vulnerability in dependency.get('vulnerabilities', []):
                    vulnerabilities.append({
                        'scanner': 'dependency_check',
                        'dependency': dependency.get('fileName', ''),
                        'cve': vulnerability.get('name', ''),
                        'severity': vulnerability.get('severity', 'UNKNOWN'),
                        'description': vulnerability.get('description', ''),
                        'cvss_score': vulnerability.get('cvssScore', 0)
                    })
            
            return {
                'vulnerabilities': vulnerabilities,
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
                    'cvss_score': vuln.get('cvssv2', 0)
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
                return {'vulnerabilities': [], 'skipped': 'No package.json found'}
            
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
                    'recommendation': vuln_info.get('recommendation', '')
                })
            
            return {
                'vulnerabilities': vulnerabilities,
                'vulnerabilities_found': len(vulnerabilities)
            }
            
        except subprocess.TimeoutExpired:
            raise Exception("npm audit timed out")
        except Exception as e:
            raise Exception(f"npm audit failed: {str(e)}")
    
    def _run_snyk(self) -> Dict[str, any]:
        """运行Snyk"""
        try:
            # 检查是否存在Snyk配置
            import os
            if not os.path.exists('.snyk'):
                return {'vulnerabilities': [], 'skipped': 'No .snyk config found'}
            
            # 运行Snyk
            result = subprocess.run([
                'snyk',
                'test',
                '--json'
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode not in [0, 1]:  # 0=无漏洞, 1=有漏洞
                raise Exception(f"Snyk failed: {result.stderr}")
            
            # 解析结果
            snyk_result = json.loads(result.stdout)
            
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
                    'patch': vuln.get('isPatchable', False)
                })
            
            return {
                'vulnerabilities': vulnerabilities,
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

# 使用示例
if __name__ == "__main__":
    scanner = DependencyScanner()
    
    try:
        results = scanner.scan_all()
        print(json.dumps(results, indent=2))
        
        # 检查是否有严重漏洞
        if results['summary']['critical'] > 0 or results['summary']['high'] > 5:
            print("ERROR: Critical or too many high severity vulnerabilities found")
            exit(1)
        else:
            print("Dependency scan passed")
            
    except Exception as e:
        print(f"Dependency scan failed: {e}")
        exit(1)
```

### 容器镜像安全扫描

```yaml
# GitLab CI中的容器镜像安全扫描
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
```

## 合规检查实施

合规检查确保软件开发和部署过程符合相关法规和标准要求。

### 合规检查框架

```python
#!/usr/bin/env python3
"""
合规检查框架
支持多种合规标准的检查
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

## 整体安全管控策略

### 安全门禁系统

```python
#!/usr/bin/env python3
"""
安全门禁系统
集成多种安全检查的统一门禁控制
"""

from typing import Dict, List
from dataclasses import dataclass
from enum import Enum
import json

class GateType(Enum):
    """门禁类型"""
    SAST = "sast"
    DEPENDENCY = "dependency"
    CONTAINER = "container"
    COMPLIANCE = "compliance"
    APPROVAL = "approval"

@dataclass
class SecurityGate:
    """安全门禁"""
    type: GateType
    name: str
    enabled: bool
    threshold: Dict[str, any]
    action: str  # block, warn, log

class SecurityGateKeeper:
    """安全门禁管理员"""
    def __init__(self):
        self.gates = []
        self.results = {}
    
    def add_gate(self, gate: SecurityGate):
        """添加安全门禁"""
        self.gates.append(gate)
    
    def check_all_gates(self, scan_results: Dict[str, any]) -> Dict[str, any]:
        """
        检查所有安全门禁
        
        Args:
            scan_results: 扫描结果
            
        Returns:
            检查结果
        """
        results = {
            'passed': True,
            'violations': [],
            'details': {}
        }
        
        for gate in self.gates:
            if not gate.enabled:
                continue
            
            try:
                passed, violations = self._check_gate(gate, scan_results)
                results['details'][gate.type.value] = {
                    'passed': passed,
                    'violations': violations
                }
                
                if not passed and gate.action == 'block':
                    results['passed'] = False
                    results['violations'].extend(violations)
                    
            except Exception as e:
                results['details'][gate.type.value] = {
                    'passed': False,
                    'violations': [f"Gate check failed: {str(e)}"]
                }
                if gate.action == 'block':
                    results['passed'] = False
                    results['violations'].append(f"Gate check failed: {str(e)}")
        
        return results
    
    def _check_gate(self, gate: SecurityGate, scan_results: Dict[str, any]) -> tuple:
        """检查单个门禁"""
        if gate.type == GateType.SAST:
            return self._check_sast_gate(gate, scan_results.get('sast', {}))
        elif gate.type == GateType.DEPENDENCY:
            return self._check_dependency_gate(gate, scan_results.get('dependency', {}))
        elif gate.type == GateType.CONTAINER:
            return self._check_container_gate(gate, scan_results.get('container', {}))
        elif gate.type == GateType.COMPLIANCE:
            return self._check_compliance_gate(gate, scan_results.get('compliance', {}))
        elif gate.type == GateType.APPROVAL:
            return self._check_approval_gate(gate, scan_results.get('approval', {}))
        else:
            return True, []
    
    def _check_sast_gate(self, gate: SecurityGate, sast_results: Dict[str, any]) -> tuple:
        """检查SAST门禁"""
        violations = []
        passed = True
        
        # 检查严重漏洞数量
        critical_threshold = gate.threshold.get('max_critical', 0)
        high_threshold = gate.threshold.get('max_high', 5)
        
        summary = sast_results.get('summary', {})
        critical_count = summary.get('critical', 0)
        high_count = summary.get('high', 0)
        
        if critical_count > critical_threshold:
            violations.append(f"SAST critical issues ({critical_count}) exceed threshold ({critical_threshold})")
            passed = False
        
        if high_count > high_threshold:
            violations.append(f"SAST high issues ({high_count}) exceed threshold ({high_threshold})")
            passed = False
        
        return passed, violations
    
    def _check_dependency_gate(self, gate: SecurityGate, dependency_results: Dict[str, any]) -> tuple:
        """检查依赖门禁"""
        violations = []
        passed = True
        
        # 检查严重漏洞数量
        critical_threshold = gate.threshold.get('max_critical', 0)
        high_threshold = gate.threshold.get('max_high', 10)
        
        summary = dependency_results.get('summary', {})
        critical_count = summary.get('critical', 0)
        high_count = summary.get('high', 0)
        
        if critical_count > critical_threshold:
            violations.append(f"Dependency critical issues ({critical_count}) exceed threshold ({critical_threshold})")
            passed = False
        
        if high_count > high_threshold:
            violations.append(f"Dependency high issues ({high_count}) exceed threshold ({high_threshold})")
            passed = False
        
        return passed, violations
    
    def _check_container_gate(self, gate: SecurityGate, container_results: Dict[str, any]) -> tuple:
        """检查容器门禁"""
        violations = []
        passed = True
        
        # 检查严重漏洞数量
        critical_threshold = gate.threshold.get('max_critical', 0)
        high_threshold = gate.threshold.get('max_high', 5)
        
        summary = container_results.get('summary', {})
        critical_count = summary.get('critical', 0)
        high_count = summary.get('high', 0)
        
        if critical_count > critical_threshold:
            violations.append(f"Container critical issues ({critical_count}) exceed threshold ({critical_threshold})")
            passed = False
        
        if high_count > high_threshold:
            violations.append(f"Container high issues ({high_count}) exceed threshold ({high_threshold})")
            passed = False
        
        return passed, violations
    
    def _check_compliance_gate(self, gate: SecurityGate, compliance_results: Dict[str, any]) -> tuple:
        """检查合规门禁"""
        violations = []
        passed = True
        
        # 检查严重合规问题数量
        critical_threshold = gate.threshold.get('max_critical', 0)
        high_threshold = gate.threshold.get('max_high', 3)
        
        summary = compliance_results.get('summary', {})
        critical_count = summary.get('critical', 0)
        high_count = summary.get('high', 0)
        
        if critical_count > critical_threshold:
            violations.append(f"Compliance critical issues ({critical_count}) exceed threshold ({critical_threshold})")
            passed = False
        
        if high_count > high_threshold:
            violations.append(f"Compliance high issues ({high_count}) exceed threshold ({high_threshold})")
            passed = False
        
        return passed, violations
    
    def _check_approval_gate(self, gate: SecurityGate, approval_results: Dict[str, any]) -> tuple:
        """检查审批门禁"""
        # 审批门禁通常在CI/CD流程中处理
        # 这里简化处理
        passed = approval_results.get('approved', False)
        violations = [] if passed else ['Approval not granted']
        return passed, violations

# 安全门禁配置示例
def initialize_security_gates():
    """初始化安全门禁"""
    gate_keeper = SecurityGateKeeper()
    
    gates = [
        SecurityGate(
            type=GateType.SAST,
            name="SAST Security Gate",
            enabled=True,
            threshold={
                'max_critical': 0,
                'max_high': 5
            },
            action='block'
        ),
        SecurityGate(
            type=GateType.DEPENDENCY,
            name="Dependency Security Gate",
            enabled=True,
            threshold={
                'max_critical': 0,
                'max_high': 10
            },
            action='block'
        ),
        SecurityGate(
            type=GateType.CONTAINER,
            name="Container Security Gate",
            enabled=True,
            threshold={
                'max_critical': 0,
                'max_high': 5
            },
            action='block'
        ),
        SecurityGate(
            type=GateType.COMPLIANCE,
            name="Compliance Gate",
            enabled=True,
            threshold={
                'max_critical': 0,
                'max_high': 3
            },
            action='block'
        ),
        SecurityGate(
            type=GateType.APPROVAL,
            name="Production Approval Gate",
            enabled=True,
            threshold={},
            action='block'
        )
    ]
    
    for gate in gates:
        gate_keeper.add_gate(gate)
    
    return gate_keeper

# CI/CD集成示例
def run_security_gates_in_ci():
    """在CI/CD中运行安全门禁"""
    # 模拟扫描结果
    scan_results = {
        'sast': {
            'summary': {
                'critical': 0,
                'high': 3,
                'medium': 10,
                'low': 20
            }
        },
        'dependency': {
            'summary': {
                'critical': 0,
                'high': 5,
                'medium': 15,
                'low': 30
            }
        },
        'container': {
            'summary': {
                'critical': 0,
                'high': 2,
                'medium': 8,
                'low': 15
            }
        },
        'compliance': {
            'summary': {
                'critical': 0,
                'high': 1,
                'medium': 3,
                'low': 5
            }
        },
        'approval': {
            'approved': True
        }
    }
    
    # 运行安全门禁检查
    gate_keeper = initialize_security_gates()
    results = gate_keeper.check_all_gates(scan_results)
    
    # 输出结果
    print(json.dumps(results, indent=2))
    
    # 根据结果决定是否继续
    if results['passed']:
        print("All security gates passed, proceeding with deployment")
        return True
    else:
        print("Security gates failed, blocking deployment")
        print("Violations:")
        for violation in results['violations']:
            print(f"  - {violation}")
        return False

if __name__ == "__main__":
    success = run_security_gates_in_ci()
    exit(0 if success else 1)
```

通过建立完善的审批与安全管控体系，团队能够在CI/CD流水线中构建可靠的质量门禁，确保只有经过充分审查、安全扫描和合规检查的代码才能进入生产环境。人工审批机制提供了重要的决策环节，安全扫描工具能够在早期发现潜在的安全问题，而合规检查则确保开发过程符合相关法规和标准要求。这些措施的综合应用不仅提高了软件交付的安全性和可靠性，也为企业的合规审计提供了有力支撑。