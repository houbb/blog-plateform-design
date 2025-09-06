---
title: 效能度量实践：DORA指标与自定义指标体系
date: 2025-08-30
categories: [CICD]
tags: [ci,cd,metrics,dora,devops,performance,measurement]
published: true
---

在现代软件开发和运维实践中，效能度量已成为评估团队绩效、优化流程和驱动持续改进的关键手段。通过科学的度量体系，组织能够客观评估CI/CD平台的价值，识别改进机会，并基于数据驱动的方式做出决策。DORA（DevOps Research and Assessment）指标作为业界广泛认可的效能度量框架，为组织提供了标准化的评估基准。本文将深入探讨DORA指标的详细定义、收集方法、分析实践以及如何构建符合组织特色的自定义指标体系。

## DORA指标详解

DORA指标由DevOps Research and Assessment团队提出，经过对数千个组织的调研和分析，提炼出四个核心指标来衡量软件交付效能。这些指标已被证明与组织绩效高度相关。

### 1. 部署频率（Deployment Frequency）

部署频率衡量团队向生产环境部署代码的频率，反映了团队的交付速度和敏捷性。

#### 指标定义与计算
- **定义**：单位时间内向生产环境成功部署的次数
- **计算公式**：部署次数 / 时间周期
- **单位**：可以是每天、每周、每月等不同时间粒度

#### 数据收集方法
```python
#!/usr/bin/env python3
"""
部署频率数据收集工具
从CI/CD平台收集部署频率数据
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import json

class DeploymentFrequencyCollector:
    def __init__(self, ci_cd_platform_api):
        self.platform_api = ci_cd_platform_api
        self.deployments = []
    
    def collect_deployments(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """收集指定时间范围内的部署数据"""
        # 从CI/CD平台API获取部署记录
        deployments = self.platform_api.get_deployments(
            start_time=start_date.isoformat(),
            end_time=end_date.isoformat(),
            environment="production"
        )
        
        # 标准化部署数据
        standardized_deployments = []
        for deployment in deployments:
            standardized_deployments.append({
                'deployment_id': deployment.get('id'),
                'pipeline_id': deployment.get('pipeline_id'),
                'environment': deployment.get('environment', 'production'),
                'start_time': deployment.get('start_time'),
                'end_time': deployment.get('end_time'),
                'status': deployment.get('status'),
                'deployed_by': deployment.get('triggered_by'),
                'commit_sha': deployment.get('commit_sha'),
                'service_name': deployment.get('service_name')
            })
        
        self.deployments.extend(standardized_deployments)
        return standardized_deployments
    
    def calculate_deployment_frequency(self, period: str = 'daily') -> Dict:
        """计算部署频率"""
        if not self.deployments:
            return {}
        
        df = pd.DataFrame(self.deployments)
        df['start_time'] = pd.to_datetime(df['start_time'])
        
        if period == 'daily':
            frequency_data = df.groupby(df['start_time'].dt.date).size()
            metrics = {
                'daily_average': frequency_data.mean(),
                'daily_median': frequency_data.median(),
                'daily_max': frequency_data.max(),
                'daily_min': frequency_data.min()
            }
        elif period == 'weekly':
            frequency_data = df.groupby(df['start_time'].dt.isocalendar().week).size()
            metrics = {
                'weekly_average': frequency_data.mean(),
                'weekly_median': frequency_data.median(),
                'weekly_max': frequency_data.max(),
                'weekly_min': frequency_data.min()
            }
        elif period == 'monthly':
            frequency_data = df.groupby(df['start_time'].dt.month).size()
            metrics = {
                'monthly_average': frequency_data.mean(),
                'monthly_median': frequency_data.median(),
                'monthly_max': frequency_data.max(),
                'monthly_min': frequency_data.min()
            }
        
        return metrics
    
    def get_deployment_trends(self, days: int = 30) -> Dict:
        """获取部署趋势"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        recent_deployments = [
            d for d in self.deployments 
            if pd.to_datetime(d['start_time']) >= start_date
        ]
        
        df = pd.DataFrame(recent_deployments)
        if not df.empty:
            df['start_time'] = pd.to_datetime(df['start_time'])
            daily_deployments = df.groupby(df['start_time'].dt.date).size()
            
            # 计算趋势
            if len(daily_deployments) > 1:
                trend = (daily_deployments.iloc[-1] - daily_deployments.iloc[0]) / len(daily_deployments)
            else:
                trend = 0
            
            return {
                'total_deployments': len(recent_deployments),
                'deployment_trend': 'increasing' if trend > 0 else 'decreasing' if trend < 0 else 'stable',
                'average_daily_deployments': len(recent_deployments) / days
            }
        
        return {}

# 使用示例
if __name__ == "__main__":
    # 模拟CI/CD平台API
    class MockCICDPlatformAPI:
        def get_deployments(self, start_time, end_time, environment):
            # 生成模拟部署数据
            deployments = []
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            # 生成随机部署记录
            import random
            current_time = start
            while current_time < end:
                if random.random() > 0.7:  # 30%概率有部署
                    deployments.append({
                        'id': f'deploy-{len(deployments)+1}',
                        'pipeline_id': f'pipeline-{random.randint(1, 10)}',
                        'environment': environment,
                        'start_time': current_time.isoformat(),
                        'end_time': (current_time + timedelta(minutes=random.randint(5, 30))).isoformat(),
                        'status': 'success' if random.random() > 0.05 else 'failed',
                        'triggered_by': f'user-{random.randint(1, 5)}',
                        'commit_sha': f'abc{random.randint(1000, 9999)}def',
                        'service_name': f'service-{random.randint(1, 3)}'
                    })
                current_time += timedelta(hours=random.randint(1, 8))
            
            return deployments
    
    # 收集部署频率数据
    collector = DeploymentFrequencyCollector(MockCICDPlatformAPI())
    
    # 收集最近30天的数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    collector.collect_deployments(start_date, end_date)
    
    # 计算各种频率指标
    daily_metrics = collector.calculate_deployment_frequency('daily')
    weekly_metrics = collector.calculate_deployment_frequency('weekly')
    monthly_metrics = collector.calculate_deployment_frequency('monthly')
    
    # 获取趋势数据
    trends = collector.get_deployment_trends(30)
    
    print("部署频率指标:")
    print(f"  日平均部署次数: {daily_metrics.get('daily_average', 0):.2f}")
    print(f"  周平均部署次数: {weekly_metrics.get('weekly_average', 0):.2f}")
    print(f"  月平均部署次数: {monthly_metrics.get('monthly_average', 0):.2f}")
    print(f"  最近30天趋势: {trends.get('deployment_trend', 'unknown')}")
```

#### 性能基准
根据DORA研究，部署频率的性能分级如下：
- **Elite（精英级）**：按需部署，可能每天多次
- **High（高级）**：每周部署
- **Medium（中级）**：每月部署
- **Low（低级）**：每季度或更长时间部署一次

### 2. 变更前置时间（Lead Time for Changes）

变更前置时间衡量从代码提交到成功部署到生产环境的时间，反映了价值从概念到交付给用户的流动效率。

#### 指标定义与计算
- **定义**：从代码提交到生产环境成功部署的时间间隔
- **计算公式**：部署完成时间 - 代码提交时间
- **单位**：小时、天等时间单位

#### 数据收集方法
```python
#!/usr/bin/env python3
"""
变更前置时间数据收集工具
追踪代码从提交到部署的完整生命周期
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import json

class LeadTimeCollector:
    def __init__(self, ci_cd_platform_api, version_control_api):
        self.ci_cd_api = ci_cd_platform_api
        self.vcs_api = version_control_api
        self.lead_times = []
    
    def collect_lead_times(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """收集变更前置时间数据"""
        # 获取指定时间范围内的生产部署
        deployments = self.ci_cd_api.get_deployments(
            start_time=start_date.isoformat(),
            end_time=end_date.isoformat(),
            environment="production"
        )
        
        lead_time_data = []
        for deployment in deployments:
            if deployment.get('status') == 'success':
                # 获取对应的代码提交时间
                commit_sha = deployment.get('commit_sha')
                if commit_sha:
                    commit_info = self.vcs_api.get_commit_info(commit_sha)
                    if commit_info:
                        commit_time = datetime.fromisoformat(
                            commit_info.get('committed_date', '').replace('Z', '+00:00')
                        )
                        deploy_time = datetime.fromisoformat(
                            deployment.get('end_time', '').replace('Z', '+00:00')
                        )
                        
                        lead_time_hours = (deploy_time - commit_time).total_seconds() / 3600
                        
                        lead_time_record = {
                            'deployment_id': deployment.get('id'),
                            'commit_sha': commit_sha,
                            'commit_time': commit_time.isoformat(),
                            'deploy_time': deploy_time.isoformat(),
                            'lead_time_hours': lead_time_hours,
                            'pipeline_id': deployment.get('pipeline_id'),
                            'service_name': deployment.get('service_name'),
                            'author': commit_info.get('author_name')
                        }
                        
                        lead_time_data.append(lead_time_record)
                        self.lead_times.append(lead_time_record)
        
        return lead_time_data
    
    def calculate_lead_time_metrics(self) -> Dict:
        """计算变更前置时间指标"""
        if not self.lead_times:
            return {}
        
        df = pd.DataFrame(self.lead_times)
        
        return {
            'average_hours': df['lead_time_hours'].mean(),
            'median_hours': df['lead_time_hours'].median(),
            'p95_hours': df['lead_time_hours'].quantile(0.95),
            'p99_hours': df['lead_time_hours'].quantile(0.99),
            'min_hours': df['lead_time_hours'].min(),
            'max_hours': df['lead_time_hours'].max(),
            'total_changes': len(df)
        }
    
    def analyze_lead_time_by_service(self) -> Dict:
        """按服务分析变更前置时间"""
        if not self.lead_times:
            return {}
        
        df = pd.DataFrame(self.lead_times)
        service_metrics = {}
        
        for service in df['service_name'].unique():
            service_data = df[df['service_name'] == service]
            service_metrics[service] = {
                'average_hours': service_data['lead_time_hours'].mean(),
                'median_hours': service_data['lead_time_hours'].median(),
                'count': len(service_data)
            }
        
        return service_metrics
    
    def get_lead_time_trends(self, days: int = 90) -> Dict:
        """获取变更前置时间趋势"""
        if not self.lead_times:
            return {}
        
        df = pd.DataFrame(self.lead_times)
        df['deploy_time'] = pd.to_datetime(df['deploy_time'])
        
        # 按周分组计算平均前置时间
        weekly_avg = df.groupby(df['deploy_time'].dt.isocalendar().week)['lead_time_hours'].mean()
        
        if len(weekly_avg) > 1:
            trend = (weekly_avg.iloc[-1] - weekly_avg.iloc[0]) / len(weekly_avg)
        else:
            trend = 0
        
        return {
            'trend': 'improving' if trend < 0 else 'deteriorating' if trend > 0 else 'stable',
            'recent_average_hours': weekly_avg.iloc[-1] if len(weekly_avg) > 0 else 0
        }

# 使用示例
if __name__ == "__main__":
    # 模拟API
    class MockCICDPlatformAPI:
        def get_deployments(self, start_time, end_time, environment):
            # 生成模拟部署数据
            deployments = []
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            import random
            current_time = start
            while current_time < end:
                if random.random() > 0.8:  # 20%概率有部署
                    deployments.append({
                        'id': f'deploy-{len(deployments)+1}',
                        'pipeline_id': f'pipeline-{random.randint(1, 5)}',
                        'environment': environment,
                        'start_time': current_time.isoformat(),
                        'end_time': (current_time + timedelta(minutes=random.randint(5, 30))).isoformat(),
                        'status': 'success',
                        'commit_sha': f'commit-{random.randint(1000, 9999)}',
                        'service_name': f'service-{random.randint(1, 3)}'
                    })
                current_time += timedelta(hours=random.randint(2, 12))
            
            return deployments
    
    class MockVersionControlAPI:
        def get_commit_info(self, commit_sha):
            # 生成模拟提交信息
            import random
            return {
                'committed_date': (datetime.now() - timedelta(hours=random.randint(1, 168))).isoformat() + 'Z',
                'author_name': f'developer-{random.randint(1, 10)}'
            }
    
    # 收集变更前置时间数据
    collector = LeadTimeCollector(MockCICDPlatformAPI(), MockVersionControlAPI())
    
    # 收集最近90天的数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    collector.collect_lead_times(start_date, end_date)
    
    # 计算指标
    metrics = collector.calculate_lead_time_metrics()
    service_metrics = collector.analyze_lead_time_by_service()
    trends = collector.get_lead_time_trends(90)
    
    print("变更前置时间指标:")
    print(f"  平均时间: {metrics.get('average_hours', 0):.2f} 小时")
    print(f"  中位数时间: {metrics.get('median_hours', 0):.2f} 小时")
    print(f"  95%分位数: {metrics.get('p95_hours', 0):.2f} 小时")
    print(f"  趋势: {trends.get('trend', 'unknown')}")
    
    print("\n按服务分析:")
    for service, service_metric in service_metrics.items():
        print(f"  {service}: 平均 {service_metric.get('average_hours', 0):.2f} 小时")
```

#### 性能基准
根据DORA研究，变更前置时间的性能分级如下：
- **Elite（精英级）**：少于1小时
- **High（高级）**：少于1天
- **Medium（中级）**：少于1周
- **Low（低级）**：少于1个月

### 3. 变更失败率（Change Failure Rate）

变更失败率衡量部署到生产环境的变更导致服务降级或需要补丁修复的比例，反映了部署的质量和稳定性。

#### 指标定义与计算
- **定义**：失败部署次数占总部署次数的比例
- **计算公式**：失败部署次数 / 总部署次数 × 100%
- **单位**：百分比

#### 数据收集方法
```python
#!/usr/bin/env python3
"""
变更失败率数据收集工具
统计部署失败情况并计算失败率
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import json

class ChangeFailureRateCollector:
    def __init__(self, ci_cd_platform_api):
        self.platform_api = ci_cd_platform_api
        self.deployments = []
    
    def collect_deployments(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """收集部署数据"""
        deployments = self.platform_api.get_deployments(
            start_time=start_date.isoformat(),
            end_time=end_date.isoformat(),
            environment="production"
        )
        
        # 标准化部署数据
        standardized_deployments = []
        for deployment in deployments:
            standardized_deployments.append({
                'deployment_id': deployment.get('id'),
                'pipeline_id': deployment.get('pipeline_id'),
                'environment': deployment.get('environment', 'production'),
                'start_time': deployment.get('start_time'),
                'end_time': deployment.get('end_time'),
                'status': deployment.get('status', 'unknown'),
                'failure_reason': deployment.get('failure_reason', ''),
                'rollback_required': deployment.get('rollback_required', False),
                'service_name': deployment.get('service_name'),
                'deployed_by': deployment.get('triggered_by')
            })
        
        self.deployments.extend(standardized_deployments)
        return standardized_deployments
    
    def calculate_failure_rate(self) -> Dict:
        """计算变更失败率"""
        if not self.deployments:
            return {}
        
        df = pd.DataFrame(self.deployments)
        total_deployments = len(df)
        
        # 定义失败条件：状态为失败或需要回滚
        failed_deployments = df[
            (df['status'] == 'failed') | 
            (df['rollback_required'] == True)
        ]
        
        failure_count = len(failed_deployments)
        failure_rate = (failure_count / total_deployments) * 100 if total_deployments > 0 else 0
        
        # 分析失败原因
        failure_reasons = {}
        for _, deployment in failed_deployments.iterrows():
            reason = deployment.get('failure_reason', 'unknown')
            failure_reasons[reason] = failure_reasons.get(reason, 0) + 1
        
        return {
            'total_deployments': total_deployments,
            'failed_deployments': failure_count,
            'failure_rate_percentage': failure_rate,
            'failure_reasons': failure_reasons,
            'mtbf_hours': self._calculate_mtbf(df)  # 平均故障间隔时间
        }
    
    def _calculate_mtbf(self, df) -> float:
        """计算平均故障间隔时间"""
        failed_deployments = df[df['status'] == 'failed'].sort_values('end_time')
        if len(failed_deployments) < 2:
            return 0
        
        intervals = []
        prev_time = None
        for _, deployment in failed_deployments.iterrows():
            current_time = datetime.fromisoformat(deployment['end_time'].replace('Z', '+00:00'))
            if prev_time:
                interval = (current_time - prev_time).total_seconds() / 3600  # 转换为小时
                intervals.append(interval)
            prev_time = current_time
        
        return sum(intervals) / len(intervals) if intervals else 0
    
    def analyze_failure_by_service(self) -> Dict:
        """按服务分析失败率"""
        if not self.deployments:
            return {}
        
        df = pd.DataFrame(self.deployments)
        service_metrics = {}
        
        for service in df['service_name'].unique():
            service_deployments = df[df['service_name'] == service]
            total = len(service_deployments)
            failed = len(service_deployments[
                (service_deployments['status'] == 'failed') | 
                (service_deployments['rollback_required'] == True)
            ])
            
            service_metrics[service] = {
                'total_deployments': total,
                'failed_deployments': failed,
                'failure_rate': (failed / total) * 100 if total > 0 else 0
            }
        
        return service_metrics
    
    def get_failure_trends(self, days: int = 30) -> Dict:
        """获取失败率趋势"""
        if not self.deployments:
            return {}
        
        df = pd.DataFrame(self.deployments)
        df['end_time'] = pd.to_datetime(df['end_time'])
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        recent_deployments = df[df['end_time'] >= start_date]
        if len(recent_deployments) == 0:
            return {}
        
        # 按周计算失败率
        recent_deployments['week'] = recent_deployments['end_time'].dt.isocalendar().week
        weekly_rates = recent_deployments.groupby('week').apply(
            lambda x: (len(x[(x['status'] == 'failed') | (x['rollback_required'] == True)]) / len(x)) * 100
        )
        
        if len(weekly_rates) > 1:
            trend = (weekly_rates.iloc[-1] - weekly_rates.iloc[0]) / len(weekly_rates)
        else:
            trend = 0
        
        return {
            'trend': 'improving' if trend < 0 else 'deteriorating' if trend > 0 else 'stable',
            'recent_failure_rate': weekly_rates.iloc[-1] if len(weekly_rates) > 0 else 0
        }

# 使用示例
if __name__ == "__main__":
    # 模拟CI/CD平台API
    class MockCICDPlatformAPI:
        def get_deployments(self, start_time, end_time, environment):
            # 生成模拟部署数据
            deployments = []
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            import random
            current_time = start
            while current_time < end:
                if random.random() > 0.7:  # 30%概率有部署
                    status = 'failed' if random.random() < 0.1 else 'success'  # 10%失败率
                    deployments.append({
                        'id': f'deploy-{len(deployments)+1}',
                        'pipeline_id': f'pipeline-{random.randint(1, 5)}',
                        'environment': environment,
                        'start_time': current_time.isoformat(),
                        'end_time': (current_time + timedelta(minutes=random.randint(5, 30))).isoformat(),
                        'status': status,
                        'failure_reason': random.choice(['config_error', 'dependency_issue', 'test_failure', '']) if status == 'failed' else '',
                        'rollback_required': random.random() < 0.3 if status == 'failed' else False,
                        'service_name': f'service-{random.randint(1, 3)}',
                        'triggered_by': f'user-{random.randint(1, 5)}'
                    })
                current_time += timedelta(hours=random.randint(1, 8))
            
            return deployments
    
    # 收集变更失败率数据
    collector = ChangeFailureRateCollector(MockCICDPlatformAPI())
    
    # 收集最近30天的数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    collector.collect_deployments(start_date, end_date)
    
    # 计算指标
    failure_metrics = collector.calculate_failure_rate()
    service_metrics = collector.analyze_failure_by_service()
    trends = collector.get_failure_trends(30)
    
    print("变更失败率指标:")
    print(f"  总部署次数: {failure_metrics.get('total_deployments', 0)}")
    print(f"  失败部署次数: {failure_metrics.get('failed_deployments', 0)}")
    print(f"  失败率: {failure_metrics.get('failure_rate_percentage', 0):.2f}%")
    print(f"  趋势: {trends.get('trend', 'unknown')}")
    
    print("\n失败原因分析:")
    for reason, count in failure_metrics.get('failure_reasons', {}).items():
        print(f"  {reason or 'unknown'}: {count} 次")
    
    print("\n按服务分析:")
    for service, metrics in service_metrics.items():
        print(f"  {service}: 失败率 {metrics.get('failure_rate', 0):.2f}%")
```

#### 性能基准
根据DORA研究，变更失败率的性能分级如下：
- **Elite（精英级）**：0-15%
- **High（高级）**：16-30%
- **Medium（中级）**：31-45%
- **Low（低级）**：46%以上

### 4. 服务恢复时间（Time to Restore Service）

服务恢复时间衡量系统从服务中断中恢复到正常运行所需的时间，反映了组织的故障响应和恢复能力。

#### 指标定义与计算
- **定义**：从服务中断开始到服务恢复正常的时间
- **计算公式**：服务恢复时间 - 服务中断时间
- **单位**：分钟、小时等时间单位

#### 数据收集方法
```python
#!/usr/bin/env python3
"""
服务恢复时间数据收集工具
统计服务中断和恢复时间
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import json

class TimeToRestoreCollector:
    def __init__(self, monitoring_api, incident_management_api):
        self.monitoring_api = monitoring_api
        self.incident_api = incident_management_api
        self.incidents = []
    
    def collect_incidents(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """收集故障事件数据"""
        incidents = self.incident_api.get_incidents(
            start_time=start_date.isoformat(),
            end_time=end_date.isoformat(),
            status="resolved"
        )
        
        # 标准化故障数据
        standardized_incidents = []
        for incident in incidents:
            # 获取相关监控告警
            alerts = self.monitoring_api.get_alerts_for_incident(incident.get('id'))
            
            incident_record = {
                'incident_id': incident.get('id'),
                'title': incident.get('title'),
                'description': incident.get('description'),
                'severity': incident.get('severity'),
                'start_time': incident.get('start_time'),
                'end_time': incident.get('end_time'),
                'resolved_time': incident.get('resolved_time'),
                'assignee': incident.get('assignee'),
                'service_name': incident.get('service_name'),
                'alert_count': len(alerts),
                'root_cause': incident.get('root_cause', ''),
                'resolution': incident.get('resolution', '')
            }
            
            # 计算恢复时间
            if incident_record['start_time'] and incident_record['resolved_time']:
                start_dt = datetime.fromisoformat(incident_record['start_time'].replace('Z', '+00:00'))
                resolved_dt = datetime.fromisoformat(incident_record['resolved_time'].replace('Z', '+00:00'))
                incident_record['restore_time_hours'] = (resolved_dt - start_dt).total_seconds() / 3600
            
            standardized_incidents.append(incident_record)
            self.incidents.append(incident_record)
        
        return standardized_incidents
    
    def calculate_restore_time_metrics(self) -> Dict:
        """计算服务恢复时间指标"""
        if not self.incidents:
            return {}
        
        df = pd.DataFrame(self.incidents)
        resolved_incidents = df[df['restore_time_hours'].notna()]
        
        if len(resolved_incidents) == 0:
            return {}
        
        return {
            'average_hours': resolved_incidents['restore_time_hours'].mean(),
            'median_hours': resolved_incidents['restore_time_hours'].median(),
            'p95_hours': resolved_incidents['restore_time_hours'].quantile(0.95),
            'p99_hours': resolved_incidents['restore_time_hours'].quantile(0.99),
            'min_hours': resolved_incidents['restore_time_hours'].min(),
            'max_hours': resolved_incidents['restore_time_hours'].max(),
            'total_incidents': len(resolved_incidents)
        }
    
    def analyze_restore_time_by_severity(self) -> Dict:
        """按严重性分析恢复时间"""
        if not self.incidents:
            return {}
        
        df = pd.DataFrame(self.incidents)
        resolved_incidents = df[df['restore_time_hours'].notna()]
        
        severity_metrics = {}
        for severity in resolved_incidents['severity'].unique():
            severity_data = resolved_incidents[resolved_incidents['severity'] == severity]
            severity_metrics[severity] = {
                'average_hours': severity_data['restore_time_hours'].mean(),
                'median_hours': severity_data['restore_time_hours'].median(),
                'count': len(severity_data)
            }
        
        return severity_metrics
    
    def get_restore_time_trends(self, days: int = 90) -> Dict:
        """获取恢复时间趋势"""
        if not self.incidents:
            return {}
        
        df = pd.DataFrame(self.incidents)
        df['resolved_time'] = pd.to_datetime(df['resolved_time'])
        resolved_incidents = df[df['restore_time_hours'].notna()]
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        recent_incidents = resolved_incidents[resolved_incidents['resolved_time'] >= start_date]
        
        if len(recent_incidents) == 0:
            return {}
        
        # 按月计算平均恢复时间
        recent_incidents['month'] = recent_incidents['resolved_time'].dt.month
        monthly_avg = recent_incidents.groupby('month')['restore_time_hours'].mean()
        
        if len(monthly_avg) > 1:
            trend = (monthly_avg.iloc[-1] - monthly_avg.iloc[0]) / len(monthly_avg)
        else:
            trend = 0
        
        return {
            'trend': 'improving' if trend < 0 else 'deteriorating' if trend > 0 else 'stable',
            'recent_average_hours': monthly_avg.iloc[-1] if len(monthly_avg) > 0 else 0
        }

# 使用示例
if __name__ == "__main__":
    # 模拟API
    class MockMonitoringAPI:
        def get_alerts_for_incident(self, incident_id):
            # 生成模拟告警数据
            import random
            alert_count = random.randint(1, 10)
            return [{'id': f'alert-{i}'} for i in range(alert_count)]
    
    class MockIncidentManagementAPI:
        def get_incidents(self, start_time, end_time, status):
            # 生成模拟故障数据
            incidents = []
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            import random
            current_time = start
            while current_time < end:
                if random.random() > 0.9:  # 10%概率有故障
                    severity = random.choice(['P1', 'P2', 'P3', 'P4'])
                    start_time_incident = current_time
                    resolve_time = start_time_incident + timedelta(
                        minutes=random.randint(30, 1440)  # 30分钟到24小时
                    )
                    
                    incidents.append({
                        'id': f'incident-{len(incidents)+1}',
                        'title': f'Service outage - {severity}',
                        'description': 'Service became unavailable',
                        'severity': severity,
                        'start_time': start_time_incident.isoformat(),
                        'end_time': (start_time_incident + timedelta(minutes=10)).isoformat(),
                        'resolved_time': resolve_time.isoformat(),
                        'assignee': f'engineer-{random.randint(1, 5)}',
                        'service_name': f'service-{random.randint(1, 3)}',
                        'root_cause': random.choice(['memory_leak', 'network_issue', 'config_error']),
                        'resolution': 'Restarted service'
                    })
                current_time += timedelta(hours=random.randint(1, 24))
            
            return incidents
    
    # 收集服务恢复时间数据
    collector = TimeToRestoreCollector(MockMonitoringAPI(), MockIncidentManagementAPI())
    
    # 收集最近90天的数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    collector.collect_incidents(start_date, end_date)
    
    # 计算指标
    restore_metrics = collector.calculate_restore_time_metrics()
    severity_metrics = collector.analyze_restore_time_by_severity()
    trends = collector.get_restore_time_trends(90)
    
    print("服务恢复时间指标:")
    print(f"  平均恢复时间: {restore_metrics.get('average_hours', 0):.2f} 小时")
    print(f"  中位数恢复时间: {restore_metrics.get('median_hours', 0):.2f} 小时")
    print(f"  95%分位数: {restore_metrics.get('p95_hours', 0):.2f} 小时")
    print(f"  总故障次数: {restore_metrics.get('total_incidents', 0)}")
    print(f"  趋势: {trends.get('trend', 'unknown')}")
    
    print("\n按严重性分析:")
    for severity, metrics in severity_metrics.items():
        print(f"  {severity}: 平均 {metrics.get('average_hours', 0):.2f} 小时 ({metrics.get('count', 0)} 次)")
```

#### 性能基准
根据DORA研究，服务恢复时间的性能分级如下：
- **Elite（精英级）**：少于1小时
- **High（高级）**：少于1天
- **Medium（中级）**：少于1周
- **Low（低级）**：少于1个月

## 自定义指标体系构建

除了DORA指标外，组织还需要根据自身业务特点和目标构建自定义指标体系。

### 1. 业务价值指标

#### 功能交付周期
```python
#!/usr/bin/env python3
"""
功能交付周期指标计算工具
衡量从需求提出到功能上线的完整周期
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import json

class FeatureDeliveryCycleCollector:
    def __init__(self, project_management_api):
        self.pm_api = project_management_api
        self.features = []
    
    def collect_features(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """收集功能交付数据"""
        # 从项目管理系统获取已完成的功能
        completed_features = self.pm_api.get_completed_features(
            start_time=start_date.isoformat(),
            end_time=end_date.isoformat()
        )
        
        feature_data = []
        for feature in completed_features:
            # 获取功能的完整生命周期数据
            lifecycle_events = self.pm_api.get_feature_lifecycle(feature.get('id'))
            
            # 提取关键时间点
            created_time = self._find_event_time(lifecycle_events, 'created')
            development_start_time = self._find_event_time(lifecycle_events, 'development_started')
            development_end_time = self._find_event_time(lifecycle_events, 'development_completed')
            testing_start_time = self._find_event_time(lifecycle_events, 'testing_started')
            testing_end_time = self._find_event_time(lifecycle_events, 'testing_completed')
            deployed_time = self._find_event_time(lifecycle_events, 'deployed')
            
            if created_time and deployed_time:
                cycle_time_days = (deployed_time - created_time).days
                
                feature_record = {
                    'feature_id': feature.get('id'),
                    'feature_name': feature.get('name'),
                    'created_time': created_time.isoformat(),
                    'development_start_time': development_start_time.isoformat() if development_start_time else None,
                    'development_end_time': development_end_time.isoformat() if development_end_time else None,
                    'testing_start_time': testing_start_time.isoformat() if testing_start_time else None,
                    'testing_end_time': testing_end_time.isoformat() if testing_end_time else None,
                    'deployed_time': deployed_time.isoformat(),
                    'cycle_time_days': cycle_time_days,
                    'team': feature.get('team'),
                    'priority': feature.get('priority'),
                    'complexity': feature.get('complexity')
                }
                
                feature_data.append(feature_record)
                self.features.append(feature_record)
        
        return feature_data
    
    def _find_event_time(self, events: List[Dict], event_type: str) -> datetime:
        """查找特定事件的时间"""
        for event in events:
            if event.get('type') == event_type:
                return datetime.fromisoformat(event.get('timestamp', '').replace('Z', '+00:00'))
        return None
    
    def calculate_delivery_metrics(self) -> Dict:
        """计算功能交付指标"""
        if not self.features:
            return {}
        
        df = pd.DataFrame(self.features)
        
        return {
            'average_cycle_time_days': df['cycle_time_days'].mean(),
            'median_cycle_time_days': df['cycle_time_days'].median(),
            'p95_cycle_time_days': df['cycle_time_days'].quantile(0.95),
            'total_features': len(df),
            'on_time_delivery_rate': self._calculate_on_time_delivery_rate(df)
        }
    
    def _calculate_on_time_delivery_rate(self, df) -> float:
        """计算按时交付率"""
        # 假设目标交付周期为30天
        target_cycle_time = 30
        on_time_features = df[df['cycle_time_days'] <= target_cycle_time]
        return (len(on_time_features) / len(df)) * 100 if len(df) > 0 else 0

# 使用示例
if __name__ == "__main__":
    # 模拟项目管理API
    class MockProjectManagementAPI:
        def get_completed_features(self, start_time, end_time):
            # 生成模拟功能数据
            features = []
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            import random
            current_time = start
            while current_time < end:
                if random.random() > 0.8:  # 20%概率有功能完成
                    features.append({
                        'id': f'feature-{len(features)+1}',
                        'name': f'Feature {len(features)+1}',
                        'team': f'team-{random.randint(1, 3)}',
                        'priority': random.choice(['high', 'medium', 'low']),
                        'complexity': random.choice(['simple', 'medium', 'complex'])
                    })
                current_time += timedelta(days=random.randint(1, 7))
            
            return features
        
        def get_feature_lifecycle(self, feature_id):
            # 生成模拟生命周期事件
            import random
            base_time = datetime.now() - timedelta(days=random.randint(10, 100))
            
            events = [
                {'type': 'created', 'timestamp': base_time.isoformat() + 'Z'},
                {'type': 'development_started', 'timestamp': (base_time + timedelta(days=1)).isoformat() + 'Z'},
                {'type': 'development_completed', 'timestamp': (base_time + timedelta(days=5)).isoformat() + 'Z'},
                {'type': 'testing_started', 'timestamp': (base_time + timedelta(days=6)).isoformat() + 'Z'},
                {'type': 'testing_completed', 'timestamp': (base_time + timedelta(days=10)).isoformat() + 'Z'},
                {'type': 'deployed', 'timestamp': (base_time + timedelta(days=10 + random.randint(1, 5))).isoformat() + 'Z'}
            ]
            
            return events
    
    # 收集功能交付数据
    collector = FeatureDeliveryCycleCollector(MockProjectManagementAPI())
    
    # 收集最近180天的数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    collector.collect_features(start_date, end_date)
    
    # 计算指标
    delivery_metrics = collector.calculate_delivery_metrics()
    
    print("功能交付周期指标:")
    print(f"  平均交付周期: {delivery_metrics.get('average_cycle_time_days', 0):.1f} 天")
    print(f"  中位数交付周期: {delivery_metrics.get('median_cycle_time_days', 0):.1f} 天")
    print(f"  95%分位数: {delivery_metrics.get('p95_cycle_time_days', 0):.1f} 天")
    print(f"  总功能数: {delivery_metrics.get('total_features', 0)}")
    print(f"  按时交付率: {delivery_metrics.get('on_time_delivery_rate', 0):.1f}%")
```

### 2. 平台使用指标

#### 用户活跃度指标
```python
#!/usr/bin/env python3
"""
平台用户活跃度指标收集工具
衡量CI/CD平台的用户使用情况
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import json

class PlatformUsageCollector:
    def __init__(self, platform_analytics_api):
        self.analytics_api = platform_analytics_api
        self.user_activities = []
    
    def collect_user_activities(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """收集用户活动数据"""
        activities = self.analytics_api.get_user_activities(
            start_time=start_date.isoformat(),
            end_time=end_date.isoformat()
        )
        
        # 标准化活动数据
        standardized_activities = []
        for activity in activities:
            activity_record = {
                'user_id': activity.get('user_id'),
                'user_name': activity.get('user_name'),
                'activity_type': activity.get('activity_type'),
                'activity_time': activity.get('timestamp'),
                'resource_id': activity.get('resource_id'),
                'resource_type': activity.get('resource_type'),
                'session_duration_seconds': activity.get('session_duration', 0),
                'actions_count': activity.get('actions_count', 1)
            }
            
            standardized_activities.append(activity_record)
            self.user_activities.append(activity_record)
        
        return standardized_activities
    
    def calculate_user_engagement_metrics(self) -> Dict:
        """计算用户参与度指标"""
        if not self.user_activities:
            return {}
        
        df = pd.DataFrame(self.user_activities)
        df['activity_time'] = pd.to_datetime(df['activity_time'])
        
        # 计算活跃用户数
        daily_active_users = df.groupby(df['activity_time'].dt.date)['user_id'].nunique()
        weekly_active_users = df.groupby(df['activity_time'].dt.isocalendar().week)['user_id'].nunique()
        
        # 计算会话时长
        avg_session_duration = df['session_duration_seconds'].mean()
        
        # 计算用户操作频率
        actions_per_user = df.groupby('user_id')['actions_count'].sum()
        avg_actions_per_user = actions_per_user.mean()
        
        return {
            'daily_active_users_avg': daily_active_users.mean(),
            'daily_active_users_max': daily_active_users.max(),
            'weekly_active_users_avg': weekly_active_users.mean(),
            'avg_session_duration_minutes': avg_session_duration / 60,
            'avg_actions_per_user': avg_actions_per_user,
            'total_users': df['user_id'].nunique(),
            'total_activities': len(df)
        }
    
    def analyze_feature_adoption(self) -> Dict:
        """分析功能采纳率"""
        if not self.user_activities:
            return {}
        
        df = pd.DataFrame(self.user_activities)
        
        # 统计各功能的使用情况
        feature_usage = df[df['resource_type'] == 'feature'].groupby('resource_id').size()
        
        return {
            'total_features': len(feature_usage),
            'adopted_features': len(feature_usage[feature_usage > 0]),
            'feature_adoption_rate': (len(feature_usage[feature_usage > 0]) / len(feature_usage)) * 100 if len(feature_usage) > 0 else 0,
            'top_features': feature_usage.nlargest(5).to_dict()
        }

# 使用示例
if __name__ == "__main__":
    # 模拟平台分析API
    class MockPlatformAnalyticsAPI:
        def get_user_activities(self, start_time, end_time):
            # 生成模拟用户活动数据
            activities = []
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            
            import random
            current_time = start
            user_count = 50
            
            while current_time < end:
                # 每天生成用户活动
                for _ in range(random.randint(10, 50)):
                    user_id = f'user-{random.randint(1, user_count)}'
                    activity_type = random.choice(['login', 'pipeline_create', 'pipeline_execute', 'artifact_browse', 'settings_change'])
                    resource_type = random.choice(['feature', 'pipeline', 'artifact', 'settings'])
                    
                    activities.append({
                        'user_id': user_id,
                        'user_name': f'User {user_id.split("-")[1]}',
                        'activity_type': activity_type,
                        'timestamp': current_time.isoformat(),
                        'resource_id': f'{resource_type}-{random.randint(1, 20)}',
                        'resource_type': resource_type,
                        'session_duration': random.randint(300, 3600),  # 5分钟到1小时
                        'actions_count': random.randint(1, 20)
                    })
                
                current_time += timedelta(days=1)
            
            return activities
    
    # 收集平台使用数据
    collector = PlatformUsageCollector(MockPlatformAnalyticsAPI())
    
    # 收集最近30天的数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    collector.collect_user_activities(start_date, end_date)
    
    # 计算指标
    engagement_metrics = collector.calculate_user_engagement_metrics()
    adoption_metrics = collector.analyze_feature_adoption()
    
    print("平台用户活跃度指标:")
    print(f"  日均活跃用户: {engagement_metrics.get('daily_active_users_avg', 0):.0f}")
    print(f"  最大日活跃用户: {engagement_metrics.get('daily_active_users_max', 0):.0f}")
    print(f"  平均会话时长: {engagement_metrics.get('avg_session_duration_minutes', 0):.1f} 分钟")
    print(f"  用户平均操作数: {engagement_metrics.get('avg_actions_per_user', 0):.1f}")
    print(f"  总用户数: {engagement_metrics.get('total_users', 0)}")
    
    print("\n功能采纳指标:")
    print(f"  功能采纳率: {adoption_metrics.get('feature_adoption_rate', 0):.1f}%")
    print(f"  已采纳功能数: {adoption_metrics.get('adopted_features', 0)}")
    print("  热门功能:")
    for feature, count in adoption_metrics.get('top_features', {}).items():
        print(f"    {feature}: {count} 次使用")
```

通过建立完善的效能度量体系，包括DORA指标和自定义指标，组织能够全面评估CI/CD平台的效果，识别改进机会，并基于数据驱动的方式持续优化软件交付流程。关键是要根据组织的具体情况和业务目标，选择合适的指标进行跟踪，并建立定期分析和改进的机制。只有这样，才能真正发挥效能度量在提升组织绩效和竞争力方面的作用。