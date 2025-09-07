---
title: "合规性即代码: 自动化审计与合规检查"
date: 2025-09-07
categories: [CICD]
tags: [compliance, policy-as-code, audit, devsecops, automation]
published: true
---
合规性即代码（Compliance as Code）是DevSecOps实践中的重要组成部分，它将传统的合规性检查和审计流程转化为可执行的代码，实现合规性检查的自动化和持续化。通过将合规性要求编码化，组织能够在软件开发生命周期的早期识别和修复合规性问题，降低合规风险并提高审计效率。本文将深入探讨合规性即代码的核心概念、实施方法和最佳实践。

## 合规性即代码的核心理念

合规性即代码借鉴了基础设施即代码（Infrastructure as Code）和策略即代码（Policy as Code）的理念，将合规性要求以代码的形式定义、管理和执行，实现合规性检查的自动化和标准化。

### 从文档到代码的转变

传统的合规性管理主要依赖文档和人工审计，这种方式存在效率低、易出错、难以持续跟踪等问题。合规性即代码通过以下方式解决这些问题：

#### 自动化合规检查
```python
#!/usr/bin/env python3
"""
合规性检查自动化系统
"""

import json
import yaml
from typing import Dict, List, Any
from datetime import datetime
import hashlib
from dataclasses import dataclass

@dataclass
class ComplianceRule:
    id: str
    name: str
    description: str
    category: str  # security, privacy, regulatory
    severity: str  # critical, high, medium, low
    script: str
    enabled: bool
    created_at: str

@dataclass
class ComplianceCheckResult:
    rule_id: str
    rule_name: str
    passed: bool
    violations: List[str]
    timestamp: str
    context: Dict[str, Any]

class ComplianceAsCodeEngine:
    def __init__(self):
        self.rules = {}
        self.check_history = []
        self.violation_tracker = {}
    
    def register_rule(self, rule_config: Dict[str, Any]) -> Dict[str, Any]:
        """注册合规规则"""
        try:
            rule = ComplianceRule(
                id=rule_config['id'],
                name=rule_config['name'],
                description=rule_config.get('description', ''),
                category=rule_config.get('category', 'security'),
                severity=rule_config.get('severity', 'medium'),
                script=rule_config['script'],
                enabled=rule_config.get('enabled', True),
                created_at=datetime.now().isoformat()
            )
            
            self.rules[rule.id] = rule
            
            return {
                'success': True,
                'rule_id': rule.id,
                'message': f"Rule {rule.name} registered successfully"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to register rule: {str(e)}"
            }
    
    def check_compliance(self, context: Dict[str, Any], 
                        rule_categories: List[str] = None) -> Dict[str, Any]:
        """执行合规性检查"""
        results = {
            'passed': [],
            'violations': [],
            'summary': {
                'total_rules': 0,
                'passed_rules': 0,
                'failed_rules': 0,
                'critical_violations': 0,
                'high_violations': 0
            }
        }
        
        # 筛选要检查的规则
        rules_to_check = []
        for rule in self.rules.values():
            if not rule.enabled:
                continue
            if rule_categories and rule.category not in rule_categories:
                continue
            rules_to_check.append(rule)
        
        results['summary']['total_rules'] = len(rules_to_check)
        
        # 执行每个规则的检查
        for rule in rules_to_check:
            try:
                violations = self._execute_rule(rule, context)
                
                if violations:
                    violation_record = {
                        'rule_id': rule.id,
                        'rule_name': rule.name,
                        'category': rule.category,
                        'severity': rule.severity,
                        'violations': violations,
                        'timestamp': datetime.now().isoformat()
                    }
                    results['violations'].append(violation_record)
                    
                    # 统计违规级别
                    if rule.severity == 'critical':
                        results['summary']['critical_violations'] += 1
                    elif rule.severity == 'high':
                        results['summary']['high_violations'] += 1
                    
                    # 跟踪违规
                    self._track_violation(rule.id, violations)
                else:
                    results['passed'].append({
                        'rule_id': rule.id,
                        'rule_name': rule.name,
                        'category': rule.category,
                        'timestamp': datetime.now().isoformat()
                    })
            except Exception as e:
                # 规则执行失败也视为违规
                violation_record = {
                    'rule_id': rule.id,
                    'rule_name': rule.name,
                    'category': rule.category,
                    'severity': 'high',
                    'violations': [f"Rule execution failed: {str(e)}"],
                    'timestamp': datetime.now().isoformat()
                }
                results['violations'].append(violation_record)
                results['summary']['high_violations'] += 1
        
        results['summary']['passed_rules'] = len(results['passed'])
        results['summary']['failed_rules'] = len(results['violations'])
        
        # 记录检查历史
        check_record = {
            'context_hash': self._hash_context(context),
            'timestamp': datetime.now().isoformat(),
            'results': results['summary']
        }
        self.check_history.append(check_record)
        
        return results
    
    def _execute_rule(self, rule: ComplianceRule, 
                     context: Dict[str, Any]) -> List[str]:
        """执行合规规则"""
        # 这里简化实现，实际应用中可能需要更复杂的规则引擎
        violations = []
        
        # 基于规则脚本的简单检查
        if 'required_labels' in rule.script and 'labels' in context:
            required_labels = ['team', 'environment', 'project']
            labels = context['labels']
            for label in required_labels:
                if label not in labels:
                    violations.append(f"Required label '{label}' is missing")
        
        if 'resource_limits' in rule.script and 'containers' in context:
            for container in context.get('containers', []):
                resources = container.get('resources', {})
                if not resources.get('requests') or not resources.get('limits'):
                    violations.append(f"Container {container.get('name', 'unknown')} missing resource limits")
        
        if 'security_context' in rule.script and 'containers' in context:
            for container in context.get('containers', []):
                security_context = container.get('securityContext', {})
                if not security_context.get('runAsNonRoot', False):
                    violations.append(f"Container {container.get('name', 'unknown')} not running as non-root")
        
        return violations
    
    def _track_violation(self, rule_id: str, violations: List[str]):
        """跟踪违规情况"""
        if rule_id not in self.violation_tracker:
            self.violation_tracker[rule_id] = {
                'count': 0,
                'first_occurrence': datetime.now().isoformat(),
                'last_occurrence': None,
                'violations': []
            }
        
        self.violation_tracker[rule_id]['count'] += 1
        self.violation_tracker[rule_id]['last_occurrence'] = datetime.now().isoformat()
        self.violation_tracker[rule_id]['violations'].extend(violations)
    
    def _hash_context(self, context: Dict[str, Any]) -> str:
        """计算上下文哈希"""
        context_str = json.dumps(context, sort_keys=True)
        return hashlib.sha256(context_str.encode()).hexdigest()
    
    def get_violation_report(self, days: int = 30) -> Dict[str, Any]:
        """获取违规报告"""
        cutoff_time = datetime.now().timestamp() - (days * 24 * 3600)
        
        recent_violations = []
        for record in self.check_history:
            record_time = datetime.fromisoformat(record['timestamp']).timestamp()
            if record_time > cutoff_time:
                recent_violations.append(record)
        
        # 统计违规趋势
        violation_trends = {}
        for record in recent_violations:
            date_key = record['timestamp'][:10]  # YYYY-MM-DD
            if date_key not in violation_trends:
                violation_trends[date_key] = {
                    'total_checks': 0,
                    'failed_checks': 0,
                    'critical_violations': 0,
                    'high_violations': 0
                }
            
            violation_trends[date_key]['total_checks'] += 1
            if record['results']['failed_rules'] > 0:
                violation_trends[date_key]['failed_checks'] += 1
            violation_trends[date_key]['critical_violations'] += record['results']['critical_violations']
            violation_trends[date_key]['high_violations'] += record['results']['high_violations']
        
        return {
            'period_days': days,
            'total_checks': len(recent_violations),
            'failed_checks': len([r for r in recent_violations if r['results']['failed_rules'] > 0]),
            'violation_trends': violation_trends,
            'top_violations': self._get_top_violations()
        }
    
    def _get_top_violations(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取最常见的违规"""
        sorted_violations = sorted(
            self.violation_tracker.items(),
            key=lambda x: x[1]['count'],
            reverse=True
        )
        
        top_violations = []
        for rule_id, violation_data in sorted_violations[:limit]:
            if rule_id in self.rules:
                rule = self.rules[rule_id]
                top_violations.append({
                    'rule_id': rule_id,
                    'rule_name': rule.name,
                    'violation_count': violation_data['count'],
                    'first_occurrence': violation_data['first_occurrence'],
                    'last_occurrence': violation_data['last_occurrence']
                })
        
        return top_violations

# 使用示例
# compliance_engine = ComplianceAsCodeEngine()
# 
# # 注册规则
# rules = [
#     {
#         'id': 'required_labels',
#         'name': '必需标签检查',
#         'description': '确保所有资源都有必需的标签',
#         'category': 'security',
#         'severity': 'medium',
#         'script': 'required_labels'
#     },
#     {
#         'id': 'resource_limits',
#         'name': '资源限制检查',
#         'description': '确保容器定义了资源请求和限制',
#         'category': 'operational',
#         'severity': 'medium',
#         'script': 'resource_limits'
#     },
#     {
#         'id': 'security_context',
#         'name': '安全上下文检查',
#         'description': '确保容器以非root用户运行',
#         'category': 'security',
#         'severity': 'high',
#         'script': 'security_context'
#     }
# ]
# 
# for rule_config in rules:
#     result = compliance_engine.register_rule(rule_config)
#     print(result)
# 
# # 执行合规检查
# context = {
#     'labels': {
#         'team': 'backend',
#         'environment': 'production'
#         # 缺少project标签
#     },
#     'containers': [
#         {
#             'name': 'app',
#             'resources': {
#                 'requests': {'cpu': '100m', 'memory': '128Mi'},
#                 'limits': {'cpu': '200m', 'memory': '256Mi'}
#             },
#             'securityContext': {
#                 'runAsNonRoot': True
#             }
#         },
#         {
#             'name': 'db',
#             'resources': {
#                 # 缺少requests和limits
#             },
#             'securityContext': {
#                 'runAsNonRoot': False  # 不符合安全要求
#             }
#         }
#     ]
# }
# 
# results = compliance_engine.check_compliance(context, ['security', 'operational'])
# print(json.dumps(results, indent=2, ensure_ascii=False))