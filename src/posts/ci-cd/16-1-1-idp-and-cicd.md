---
title: 内部开发者平台（IDP）与CI/CD: 构建开发者友好的一体化交付平台
date: 2025-09-07
categories: [CICD]
tags: [platform-engineering, idp, developer-experience, self-service, devops, automation]
published: true
---
内部开发者平台（Internal Developer Platform, IDP）代表了现代软件工程组织在平台工程实践中的重要演进。它不仅仅是技术工具的集合，更是一种全新的组织能力，旨在为开发者提供自助式、一致且可靠的开发体验。通过将CI/CD能力深度集成到IDP中，组织能够显著提升开发效率、标准化最佳实践并加速价值交付。本文将深入探讨IDP的核心概念、架构设计以及与CI/CD的深度融合实践。

## IDP的核心理念与价值

内部开发者平台的核心理念是"平台即产品"，它将平台工程团队定位为内部客户（开发者）的服务提供者，致力于提供卓越的开发者体验。

### 平台即产品的思维转变

传统的基础设施和工具提供方式往往是"推式"的，即平台团队构建工具并期望开发者使用。而IDP采用"拉式"思维，从开发者的需求出发，构建真正有价值的自助服务：

#### 开发者旅程映射
```python
#!/usr/bin/env python3
"""
开发者旅程映射与体验优化系统
"""

import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from enum import Enum

class DeveloperStage(Enum):
    ONBOARDING = "onboarding"
    DEVELOPMENT = "development"
    TESTING = "testing"
    DEPLOYMENT = "deployment"
    OPERATIONS = "operations"
    OFFBOARDING = "offboarding"

@dataclass
class DeveloperJourney:
    user_id: str
    current_stage: DeveloperStage
    stage_start_time: datetime
    completed_stages: List[DeveloperStage]
    current_activities: List[str]
    pain_points: List[str]
    satisfaction_score: float  # 0-100
    preferred_channels: List[str]  # slack, email, portal, cli

@dataclass
class JourneyStage:
    stage: DeveloperStage
    name: str
    description: str
    typical_duration: str  # 预期时长
    key_activities: List[str]
    required_tools: List[str]
    common_challenges: List[str]
    success_metrics: List[str]

@dataclass
class PersonalizedGuidance:
    stage: DeveloperStage
    recommended_actions: List[str]
    required_resources: List[str]
    estimated_completion: str
    support_contacts: List[str]
    next_milestones: List[str]

class DeveloperJourneyMapper:
    def __init__(self):
        self.journeys: Dict[str, DeveloperJourney] = {}
        self.stage_definitions = self._define_stage_definitions()
        self.logger = logging.getLogger(__name__)
    
    def _define_stage_definitions(self) -> Dict[DeveloperStage, JourneyStage]:
        """定义各阶段的详细信息"""
        return {
            DeveloperStage.ONBOARDING: JourneyStage(
                stage=DeveloperStage.ONBOARDING,
                name="开发者入职",
                description="新开发者加入团队并熟悉开发环境的过程",
                typical_duration="1-2周",
                key_activities=[
                    "环境访问权限申请",
                    "开发工具安装配置",
                    "代码库访问",
                    "基础培训",
                    "第一个任务分配"
                ],
                required_tools=["IDE", "Git", "CI/CD工具", "文档系统"],
                common_challenges=[
                    "权限配置复杂",
                    "环境搭建困难",
                    "文档不清晰",
                    "缺少指导"
                ],
                success_metrics=[
                    "环境配置完成率",
                    "首次提交时间",
                    "问题解决时间"
                ]
            ),
            DeveloperStage.DEVELOPMENT: JourneyStage(
                stage=DeveloperStage.DEVELOPMENT,
                name="开发阶段",
                description="日常代码编写、功能开发和本地测试",
                typical_duration="持续进行",
                key_activities=[
                    "代码编写",
                    "单元测试",
                    "本地构建",
                    "代码审查",
                    "功能调试"
                ],
                required_tools=["IDE", "版本控制", "本地开发环境", "测试框架"],
                common_challenges=[
                    "依赖管理复杂",
                    "环境不一致",
                    "构建时间长",
                    "调试困难"
                ],
                success_metrics=[
                    "代码提交频率",
                    "构建成功率",
                    "代码审查通过率"
                ]
            ),
            DeveloperStage.TESTING: JourneyStage(
                stage=DeveloperStage.TESTING,
                name="测试阶段",
                description="自动化测试执行和质量验证",
                typical_duration="每个发布周期",
                key_activities=[
                    "测试环境准备",
                    "自动化测试执行",
                    "测试结果分析",
                    "缺陷修复验证",
                    "性能测试"
                ],
                required_tools=["测试框架", "测试环境", "监控工具", "报告系统"],
                common_challenges=[
                    "测试环境不稳定",
                    "测试数据管理",
                    "测试执行时间长",
                    "结果分析困难"
                ],
                success_metrics=[
                    "测试覆盖率",
                    "缺陷发现率",
                    "测试执行效率"
                ]
            ),
            DeveloperStage.DEPLOYMENT: JourneyStage(
                stage=DeveloperStage.DEPLOYMENT,
                name="部署阶段",
                description="应用部署到各个环境并进行验证",
                typical_duration="每个发布周期",
                key_activities=[
                    "环境部署",
                    "配置管理",
                    "部署验证",
                    "回滚准备",
                    "发布通知"
                ],
                required_tools=["部署工具", "配置管理", "监控系统", "通知系统"],
                common_challenges=[
                    "部署失败",
                    "环境差异",
                    "配置错误",
                    "回滚困难"
                ],
                success_metrics=[
                    "部署成功率",
                    "部署时间",
                    "环境一致性"
                ]
            ),
            DeveloperStage.OPERATIONS: JourneyStage(
                stage=DeveloperStage.OPERATIONS,
                name="运维阶段",
                description="应用上线后的监控、维护和优化",
                typical_duration="持续进行",
                key_activities=[
                    "应用监控",
                    "性能优化",
                    "故障排查",
                    "容量规划",
                    "安全维护"
                ],
                required_tools=["监控系统", "日志系统", "告警系统", "分析工具"],
                common_challenges=[
                    "问题定位困难",
                    "性能瓶颈",
                    "容量不足",
                    "安全威胁"
                ],
                success_metrics=[
                    "系统可用性",
                    "故障响应时间",
                    "性能指标",
                    "安全合规性"
                ]
            ),
            DeveloperStage.OFFBOARDING: JourneyStage(
                stage=DeveloperStage.OFFBOARDING,
                name="开发者离职",
                description="开发者离开团队时的知识转移和权限清理",
                typical_duration="1-3天",
                key_activities=[
                    "知识转移",
                    "代码交接",
                    "权限清理",
                    "设备回收",
                    "经验总结"
                ],
                required_tools=["文档系统", "权限管理", "资产管理"],
                common_challenges=[
                    "知识孤岛",
                    "权限清理不彻底",
                    "交接不完整"
                ],
                success_metrics=[
                    "交接完成率",
                    "权限清理及时性",
                    "知识保留率"
                ]
            )
        }
    
    def register_developer(self, user_id: str, initial_stage: DeveloperStage = DeveloperStage.ONBOARDING) -> DeveloperJourney:
        """注册新开发者"""
        journey = DeveloperJourney(
            user_id=user_id,
            current_stage=initial_stage,
            stage_start_time=datetime.now(),
            completed_stages=[],
            current_activities=[],
            pain_points=[],
            satisfaction_score=50.0,  # 初始中等满意度
            preferred_channels=["portal", "slack"]
        )
        
        self.journeys[user_id] = journey
        self.logger.info(f"Registered developer journey for {user_id}")
        return journey
    
    def update_developer_stage(self, user_id: str, new_stage: DeveloperStage, 
                            activities: List[str] = None, pain_points: List[str] = None):
        """更新开发者阶段"""
        if user_id not in self.journeys:
            raise ValueError(f"Developer {user_id} not found")
        
        journey = self.journeys[user_id]
        
        # 记录完成的阶段
        if journey.current_stage not in journey.completed_stages:
            journey.completed_stages.append(journey.current_stage)
        
        # 更新当前阶段
        journey.current_stage = new_stage
        journey.stage_start_time = datetime.now()
        
        # 更新活动和痛点
        if activities:
            journey.current_activities = activities
        if pain_points:
            journey.pain_points = pain_points
        
        self.logger.info(f"Updated developer {user_id} to stage {new_stage.value}")
    
    def track_activity(self, user_id: str, activity: str, duration: float = None):
        """跟踪开发者活动"""
        if user_id not in self.journeys:
            raise ValueError(f"Developer {user_id} not found")
        
        journey = self.journeys[user_id]
        journey.current_activities.append(activity)
        
        # 更新满意度（简化模型）
        if "failed" in activity.lower():
            journey.satisfaction_score = max(0, journey.satisfaction_score - 5)
        elif "completed" in activity.lower():
            journey.satisfaction_score = min(100, journey.satisfaction_score + 3)
        
        self.logger.info(f"Tracked activity for {user_id}: {activity}")
    
    def record_pain_point(self, user_id: str, pain_point: str, severity: int = 5):
        """记录痛点"""
        if user_id not in self.journeys:
            raise ValueError(f"Developer {user_id} not found")
        
        journey = self.journeys[user_id]
        journey.pain_points.append(f"{pain_point} (severity: {severity})")
        
        # 根据严重程度调整满意度
        journey.satisfaction_score = max(0, journey.satisfaction_score - severity)
        
        self.logger.info(f"Recorded pain point for {user_id}: {pain_point}")
    
    def get_personalized_guidance(self, user_id: str) -> PersonalizedGuidance:
        """获取个性化指导"""
        if user_id not in self.journeys:
            raise ValueError(f"Developer {user_id} not found")
        
        journey = self.journeys[user_id]
        stage_def = self.stage_definitions.get(journey.current_stage)
        
        if not stage_def:
            raise ValueError(f"Stage definition not found for {journey.current_stage}")
        
        # 生成推荐行动
        recommended_actions = self._generate_recommended_actions(journey, stage_def)
        
        # 确定所需资源
        required_resources = self._identify_required_resources(journey, stage_def)
        
        # 预估完成时间
        estimated_completion = self._estimate_completion_time(journey, stage_def)
        
        # 确定支持联系人
        support_contacts = self._get_support_contacts(journey.current_stage)
        
        # 确定下一个里程碑
        next_milestones = self._get_next_milestones(journey)
        
        return PersonalizedGuidance(
            stage=journey.current_stage,
            recommended_actions=recommended_actions,
            required_resources=required_resources,
            estimated_completion=estimated_completion,
            support_contacts=support_contacts,
            next_milestones=next_milestones
        )
    
    def _generate_recommended_actions(self, journey: DeveloperJourney, 
                                    stage_def: JourneyStage) -> List[str]:
        """生成推荐行动"""
        actions = []
        
        # 基于阶段的推荐
        actions.extend([f"完成{activity}" for activity in stage_def.key_activities[:3]])
        
        # 基于痛点的推荐
        for pain_point in journey.pain_points[-3:]:  # 最近的3个痛点
            if "权限" in pain_point:
                actions.append("联系平台团队解决权限问题")
            elif "环境" in pain_point:
                actions.append("使用自助环境配置工具")
            elif "构建" in pain_point:
                actions.append("查看构建优化指南")
        
        # 基于满意度的推荐
        if journey.satisfaction_score < 30:
            actions.append("安排一对一支持会议")
        elif journey.satisfaction_score > 80:
            actions.append("分享最佳实践经验")
        
        return actions[:5]  # 限制推荐数量
    
    def _identify_required_resources(self, journey: DeveloperJourney, 
                                   stage_def: JourneyStage) -> List[str]:
        """识别所需资源"""
        resources = stage_def.required_tools.copy()
        
        # 根据当前痛点添加资源
        for pain_point in journey.pain_points:
            if "文档" in pain_point:
                resources.append("文档中心")
            elif "调试" in pain_point:
                resources.append("调试工具")
            elif "测试" in pain_point:
                resources.append("测试环境")
        
        return list(set(resources))  # 去重
    
    def _estimate_completion_time(self, journey: DeveloperJourney, 
                                stage_def: JourneyStage) -> str:
        """预估完成时间"""
        # 基于阶段定义的时间
        base_time = stage_def.typical_duration
        
        # 根据当前痛点调整
        pain_point_count = len(journey.pain_points)
        if pain_point_count > 5:
            return f"{base_time} + 额外时间（因存在较多问题）"
        elif pain_point_count > 2:
            return f"{base_time} + 适度延长时间"
        else:
            return base_time
    
    def _get_support_contacts(self, stage: DeveloperStage) -> List[str]:
        """获取支持联系人"""
        contact_mapping = {
            DeveloperStage.ONBOARDING: ["onboarding-team@company.com", "新人导师"],
            DeveloperStage.DEVELOPMENT: ["dev-platform@company.com", "技术导师"],
            DeveloperStage.TESTING: ["qa-team@company.com", "测试负责人"],
            DeveloperStage.DEPLOYMENT: ["ops-team@company.com", "运维负责人"],
            DeveloperStage.OPERATIONS: ["sre-team@company.com", "SRE团队"],
            DeveloperStage.OFFBOARDING: ["hr@company.com", "人事部门"]
        }
        return contact_mapping.get(stage, ["platform-team@company.com"])
    
    def _get_next_milestones(self, journey: DeveloperJourney) -> List[str]:
        """获取下一个里程碑"""
        stage_order = list(DeveloperStage)
        current_index = stage_order.index(journey.current_stage)
        
        milestones = []
        for i in range(current_index + 1, min(current_index + 4, len(stage_order))):
            next_stage = stage_order[i]
            stage_def = self.stage_definitions.get(next_stage)
            if stage_def:
                milestones.append(f"进入{stage_def.name}阶段")
        
        if not milestones:
            milestones.append("完成当前阶段目标")
        
        return milestones
    
    def get_journey_analytics(self) -> Dict[str, Any]:
        """获取旅程分析数据"""
        if not self.journeys:
            return {}
        
        # 统计各阶段的开发者数量
        stage_counts = {}
        for journey in self.journeys.values():
            stage = journey.current_stage.value
            stage_counts[stage] = stage_counts.get(stage, 0) + 1
        
        # 计算平均满意度
        avg_satisfaction = sum(j.satisfaction_score for j in self.journeys.values()) / len(self.journeys)
        
        # 识别常见痛点
        all_pain_points = []
        for journey in self.journeys.values():
            all_pain_points.extend(journey.pain_points)
        
        common_pain_points = {}
        for pain_point in all_pain_points:
            # 提取痛点类型
            pain_type = pain_point.split(" (")[0] if " (" in pain_point else pain_point
            common_pain_points[pain_type] = common_pain_points.get(pain_type, 0) + 1
        
        # 按频率排序
        sorted_pain_points = sorted(common_pain_points.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "stage_distribution": stage_counts,
            "average_satisfaction": round(avg_satisfaction, 2),
            "total_developers": len(self.journeys),
            "common_pain_points": sorted_pain_points[:10],  # 前10个常见痛点
            "reporting_period": f"截至 {datetime.now().strftime('%Y-%m-%d')}"
        }

# 使用示例
# journey_mapper = DeveloperJourneyMapper()
# 
# # 注册新开发者
# developer_journey = journey_mapper.register_developer("dev-001")
# print(f"开发者 {developer_journey.user_id} 已注册，当前阶段: {developer_journey.current_stage.value}")
# 
# # 更新阶段
# journey_mapper.update_developer_stage(
#     "dev-001", 
#     DeveloperStage.DEVELOPMENT,
#     activities=["环境配置完成", "第一个PR提交"],
#     pain_points=["本地环境启动慢"]
# )
# 
# # 跟踪活动
# journey_mapper.track_activity("dev-001", "完成用户认证功能开发")
# journey_mapper.track_activity("dev-001", "单元测试通过")
# journey_mapper.track_activity("dev-001", "代码审查完成")
# 
# # 记录痛点
# journey_mapper.record_pain_point("dev-001", "构建时间过长", severity=7)
# journey_mapper.record_pain_point("dev-001", "测试环境不稳定", severity=6)
# 
# # 获取个性化指导
# guidance = journey_mapper.get_personalized_guidance("dev-001")
# print(f"\n{guidance.stage.name}阶段个性化指导:")
# print("推荐行动:")
# for action in guidance.recommended_actions:
#     print(f"  - {action}")
# print("所需资源:")
# for resource in guidance.required_resources:
#     print(f"  - {resource}")
# print(f"预估完成时间: {guidance.estimated_completion}")
# print("支持联系人:")
# for contact in guidance.support_contacts:
#     print(f"  - {contact}")
# print("下一个里程碑:")
# for milestone in guidance.next_milestones:
#     print(f"  - {milestone}")
# 
# # 获取分析数据
# analytics = journey_mapper.get_journey_analytics()
# print(f"\n旅程分析数据:")
# print(f"  总开发者数: {analytics['total_developers']}")
# print(f"  平均满意度: {analytics['average_satisfaction']}")
# print(f"  阶段分布: {analytics['stage_distribution']}")
# print("  常见痛点:")
# for pain_point, count in analytics['common_pain_points'][:5]:
#     print(f"    {pain_point}: {count}次")
```

### 自助服务平台的核心组件

一个完整的IDP需要包含多个核心组件，为开发者提供端到端的自助服务体验：

#### 统一门户与CLI工具
```python
#!/usr/bin/env python3
"""
IDP统一门户与CLI工具系统
"""

import json
import yaml
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
from datetime import datetime
import logging
import argparse
import sys

@dataclass
class ServiceCatalog:
    id: str
    name: str
    category: str  # infrastructure, application, database, monitoring
    description: str
    version: str
    provider: str
    documentation_url: str
    support_contact: str
    sla: str  # 服务等级协议
    cost_model: str  # 免费、按使用量计费、按实例计费
    configuration_schema: Dict[str, Any]  # 配置参数模式
    deployment_targets: List[str]  # 支持的部署目标
    dependencies: List[str]  # 依赖的服务

@dataclass
class ServiceInstance:
    id: str
    catalog_id: str
    name: str
    owner: str
    status: str  # provisioning, running, failed, deleting, updating
    created_at: datetime
    updated_at: datetime
    configuration: Dict[str, Any]
    endpoints: Dict[str, str]  # 服务端点
    credentials: Dict[str, str]  # 访问凭证
    tags: List[str]
    cost: float  # 当前成本

@dataclass
class UserProfile:
    user_id: str
    name: str
    email: str
    team: str
    role: str  # developer, tester, ops, admin
    permissions: List[str]
    preferences: Dict[str, Any]
    last_login: datetime

class IDPUnifiedPortal:
    def __init__(self):
        self.services: Dict[str, ServiceCatalog] = {}
        self.instances: Dict[str, ServiceInstance] = {}
        self.users: Dict[str, UserProfile] = {}
        self.logger = logging.getLogger(__name__)
    
    def register_service(self, service: ServiceCatalog):
        """注册服务到目录"""
        self.services[service.id] = service
        self.logger.info(f"Registered service: {service.name} (v{service.version})")
    
    def provision_service(self, catalog_id: str, name: str, owner: str,
                         configuration: Dict[str, Any], tags: List[str] = None) -> str:
        """部署服务实例"""
        if catalog_id not in self.services:
            raise ValueError(f"Service {catalog_id} not found in catalog")
        
        service = self.services[catalog_id]
        
        # 验证配置
        self._validate_configuration(service, configuration)
        
        # 创建实例
        instance_id = f"inst-{int(datetime.now().timestamp() * 1000)}"
        instance = ServiceInstance(
            id=instance_id,
            catalog_id=catalog_id,
            name=name,
            owner=owner,
            status="provisioning",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            configuration=configuration,
            endpoints={},
            credentials={},
            tags=tags or [],
            cost=0.0
        )
        
        self.instances[instance_id] = instance
        
        # 模拟异步部署过程
        import asyncio
        asyncio.create_task(self._provision_instance_async(instance_id))
        
        self.logger.info(f"Provisioning service instance: {instance_id}")
        return instance_id
    
    async def _provision_instance_async(self, instance_id: str):
        """异步部署实例"""
        if instance_id not in self.instances:
            return
        
        instance = self.instances[instance_id]
        
        try:
            # 模拟部署过程
            await asyncio.sleep(3)  # 模拟部署时间
            
            # 更新实例状态
            instance.status = "running"
            instance.updated_at = datetime.now()
            instance.endpoints = self._generate_endpoints(instance)
            instance.credentials = self._generate_credentials(instance)
            instance.cost = self._calculate_cost(instance)
            
            self.logger.info(f"Service instance {instance_id} provisioned successfully")
            
        except Exception as e:
            instance.status = "failed"
            instance.updated_at = datetime.now()
            self.logger.error(f"Failed to provision service instance {instance_id}: {e}")
    
    def _validate_configuration(self, service: ServiceCatalog, configuration: Dict[str, Any]):
        """验证配置参数"""
        schema = service.configuration_schema
        if not schema:
            return
        
        required_fields = schema.get("required", [])
        properties = schema.get("properties", {})
        
        # 检查必需字段
        for field in required_fields:
            if field not in configuration:
                raise ValueError(f"Required configuration field '{field}' is missing")
        
        # 检查字段类型和值
        for field, value in configuration.items():
            if field in properties:
                field_schema = properties[field]
                field_type = field_schema.get("type")
                if field_type and not self._validate_type(value, field_type):
                    raise ValueError(f"Configuration field '{field}' has invalid type")
                
                # 检查枚举值
                enum_values = field_schema.get("enum")
                if enum_values and value not in enum_values:
                    raise ValueError(f"Configuration field '{field}' value '{value}' not in allowed values: {enum_values}")
    
    def _validate_type(self, value: Any, expected_type: str) -> bool:
        """验证类型"""
        type_mapping = {
            "string": str,
            "integer": int,
            "number": (int, float),
            "boolean": bool,
            "array": list,
            "object": dict
        }
        
        expected_python_type = type_mapping.get(expected_type)
        if not expected_python_type:
            return True  # 未知类型默认通过
        
        if isinstance(expected_python_type, tuple):
            return isinstance(value, expected_python_type)
        else:
            return isinstance(value, expected_python_type)
    
    def _generate_endpoints(self, instance: ServiceInstance) -> Dict[str, str]:
        """生成服务端点"""
        service = self.services[instance.catalog_id]
        
        # 简化实现，实际应用中会根据服务类型生成相应端点
        if "web" in service.category.lower():
            return {"url": f"https://{instance.name}.example.com"}
        elif "database" in service.category.lower():
            return {"host": f"{instance.name}.db.example.com", "port": "5432"}
        elif "api" in service.category.lower():
            return {"endpoint": f"https://api.example.com/{instance.name}"}
        else:
            return {"info": "Endpoints will be available after provisioning"}
    
    def _generate_credentials(self, instance: ServiceInstance) -> Dict[str, str]:
        """生成访问凭证"""
        # 简化实现，实际应用中会集成密钥管理系统
        return {
            "username": f"{instance.name}_user",
            "password": "generated_password_123"
        }
    
    def _calculate_cost(self, instance: ServiceInstance) -> float:
        """计算成本"""
        service = self.services[instance.catalog_id]
        
        if service.cost_model == "free":
            return 0.0
        elif service.cost_model == "per_instance":
            return 10.0  # 简化实现
        elif service.cost_model == "usage_based":
            return 5.0  # 简化实现
        else:
            return 0.0
    
    def get_service_catalog(self) -> List[ServiceCatalog]:
        """获取服务目录"""
        return list(self.services.values())
    
    def get_user_instances(self, user_id: str) -> List[ServiceInstance]:
        """获取用户的服务实例"""
        return [inst for inst in self.instances.values() if inst.owner == user_id]
    
    def get_instance(self, instance_id: str) -> Optional[ServiceInstance]:
        """获取服务实例"""
        return self.instances.get(instance_id)
    
    def update_instance(self, instance_id: str, configuration: Dict[str, Any]):
        """更新服务实例配置"""
        if instance_id not in self.instances:
            raise ValueError(f"Service instance {instance_id} not found")
        
        instance = self.instances[instance_id]
        instance.configuration.update(configuration)
        instance.updated_at = datetime.now()
        instance.status = "updating"
        
        # 模拟异步更新
        import asyncio
        asyncio.create_task(self._update_instance_async(instance_id))
    
    async def _update_instance_async(self, instance_id: str):
        """异步更新实例"""
        await asyncio.sleep(2)  # 模拟更新时间
        
        if instance_id in self.instances:
            instance = self.instances[instance_id]
            instance.status = "running"
            instance.updated_at = datetime.now()
            self.logger.info(f"Service instance {instance_id} updated successfully")
    
    def delete_instance(self, instance_id: str):
        """删除服务实例"""
        if instance_id not in self.instances:
            raise ValueError(f"Service instance {instance_id} not found")
        
        instance = self.instances[instance_id]
        instance.status = "deleting"
        instance.updated_at = datetime.now()
        
        # 模拟异步删除
        import asyncio
        asyncio.create_task(self._delete_instance_async(instance_id))
    
    async def _delete_instance_async(self, instance_id: str):
        """异步删除实例"""
        await asyncio.sleep(1)  # 模拟删除时间
        
        if instance_id in self.instances:
            del self.instances[instance_id]
            self.logger.info(f"Service instance {instance_id} deleted successfully")

class IDPCommandLineInterface:
    def __init__(self, portal: IDPUnifiedPortal):
        self.portal = portal
        self.parser = self._create_parser()
    
    def _create_parser(self) -> argparse.ArgumentParser:
        """创建命令行解析器"""
        parser = argparse.ArgumentParser(
            prog='idp',
            description='Internal Developer Platform CLI',
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
常用命令:
  idp catalog list                    列出所有可用服务
  idp service create <name>           创建新服务实例
  idp service list                    列出我的服务实例
  idp service info <instance-id>      查看服务实例详情
  idp service delete <instance-id>    删除服务实例
            """
        )
        
        subparsers = parser.add_subparsers(dest='command', help='可用命令')
        
        # Catalog commands
        catalog_parser = subparsers.add_parser('catalog', help='服务目录管理')
        catalog_subparsers = catalog_parser.add_subparsers(dest='catalog_command')
        
        catalog_subparsers.add_parser('list', help='列出所有服务')
        catalog_subparsers.add_parser('show', help='显示服务详情')
        
        # Service commands
        service_parser = subparsers.add_parser('service', help='服务实例管理')
        service_subparsers = service_parser.add_subparsers(dest='service_command')
        
        create_parser = service_subparsers.add_parser('create', help='创建服务实例')
        create_parser.add_argument('name', help='服务实例名称')
        create_parser.add_argument('--type', required=True, help='服务类型')
        create_parser.add_argument('--config', help='配置文件路径')
        
        service_subparsers.add_parser('list', help='列出服务实例')
        
        info_parser = service_subparsers.add_parser('info', help='查看服务实例详情')
        info_parser.add_argument('instance_id', help='服务实例ID')
        
        delete_parser = service_subparsers.add_parser('delete', help='删除服务实例')
        delete_parser.add_argument('instance_id', help='服务实例ID')
        
        return parser
    
    def run(self, args: List[str] = None):
        """运行CLI"""
        if args is None:
            args = sys.argv[1:]
        
        try:
            parsed_args = self.parser.parse_args(args)
            self._execute_command(parsed_args)
        except SystemExit:
            pass
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
    
    def _execute_command(self, args):
        """执行命令"""
        if args.command == 'catalog':
            self._handle_catalog_command(args)
        elif args.command == 'service':
            self._handle_service_command(args)
        else:
            self.parser.print_help()
    
    def _handle_catalog_command(self, args):
        """处理目录命令"""
        if args.catalog_command == 'list':
            services = self.portal.get_service_catalog()
            print("可用服务:")
            for service in services:
                print(f"  {service.id:<20} {service.name:<30} {service.category}")
        else:
            self.parser.print_help()
    
    def _handle_service_command(self, args):
        """处理服务命令"""
        if args.service_command == 'create':
            self._create_service(args)
        elif args.service_command == 'list':
            self._list_services()
        elif args.service_command == 'info':
            self._show_service_info(args.instance_id)
        elif args.service_command == 'delete':
            self._delete_service(args.instance_id)
        else:
            self.parser.print_help()
    
    def _create_service(self, args):
        """创建服务"""
        # 简化实现，实际应用中会从配置文件读取配置
        configuration = {"example": "config"}
        if args.config:
            try:
                with open(args.config, 'r') as f:
                    if args.config.endswith('.json'):
                        configuration = json.load(f)
                    elif args.config.endswith('.yaml') or args.config.endswith('.yml'):
                        configuration = yaml.safe_load(f)
            except Exception as e:
                print(f"Failed to load config file: {e}")
                return
        
        try:
            instance_id = self.portal.provision_service(
                catalog_id=args.type,
                name=args.name,
                owner="cli_user",  # 简化实现
                configuration=configuration
            )
            print(f"Service instance created: {instance_id}")
            print("Provisioning in progress...")
        except Exception as e:
            print(f"Failed to create service: {e}")
    
    def _list_services(self):
        """列出服务"""
        instances = self.portal.get_user_instances("cli_user")  # 简化实现
        if not instances:
            print("No service instances found")
            return
        
        print("服务实例:")
        print(f"{'ID':<20} {'名称':<20} {'状态':<15} {'创建时间':<20}")
        print("-" * 75)
        for instance in instances:
            print(f"{instance.id:<20} {instance.name:<20} {instance.status:<15} {instance.created_at.strftime('%Y-%m-%d %H:%M')}")
    
    def _show_service_info(self, instance_id: str):
        """显示服务详情"""
        instance = self.portal.get_instance(instance_id)
        if not instance:
            print(f"Service instance {instance_id} not found")
            return
        
        print(f"服务实例详情: {instance_id}")
        print(f"  名称: {instance.name}")
        print(f"  状态: {instance.status}")
        print(f"  创建时间: {instance.created_at}")
        print(f"  更新时间: {instance.updated_at}")
        print(f"  配置: {json.dumps(instance.configuration, indent=2, ensure_ascii=False)}")
        print(f"  端点: {json.dumps(instance.endpoints, indent=2, ensure_ascii=False)}")
        print(f"  标签: {', '.join(instance.tags)}")
        print(f"  成本: ${instance.cost:.2f}")
    
    def _delete_service(self, instance_id: str):
        """删除服务"""
        try:
            self.portal.delete_instance(instance_id)
            print(f"Service instance {instance_id} deletion started")
        except Exception as e:
            print(f"Failed to delete service: {e}")

# 使用示例
# # 创建IDP门户
# portal = IDPUnifiedPortal()
# 
# # 注册服务
# services = [
#     ServiceCatalog(
#         id="web-app-template",
#         name="Web应用模板",
#         category="application",
#         description="标准Web应用部署模板",
#         version="1.0.0",
#         provider="Platform Team",
#         documentation_url="https://docs.example.com/web-app",
#         support_contact="platform-team@example.com",
#         sla="99.9%",
#         cost_model="free",
#         configuration_schema={
#             "required": ["app_name", "replicas"],
#             "properties": {
#                 "app_name": {"type": "string"},
#                 "replicas": {"type": "integer", "minimum": 1, "maximum": 10},
#                 "image": {"type": "string"},
#                 "environment": {"type": "string", "enum": ["development", "staging", "production"]}
#             }
#         },
#         deployment_targets=["kubernetes"],
#         dependencies=[]
#     ),
#     ServiceCatalog(
#         id="postgres-database",
#         name="PostgreSQL数据库",
#         category="database",
#         description="托管PostgreSQL数据库服务",
#         version="12.0",
#         provider="Database Team",
#         documentation_url="https://docs.example.com/postgres",
#         support_contact="db-team@example.com",
#         sla="99.95%",
#         cost_model="per_instance",
#         configuration_schema={
#             "required": ["db_name", "storage_gb"],
#             "properties": {
#                 "db_name": {"type": "string"},
#                 "storage_gb": {"type": "integer", "minimum": 10},
#                 "backup_enabled": {"type": "boolean"}
#             }
#         },
#         deployment_targets=["aws", "gcp", "azure"],
#         dependencies=[]
#     )
# ]
# 
# for service in services:
#     portal.register_service(service)
# 
# # 创建CLI接口
# cli = IDPCommandLineInterface(portal)
# 
# # 模拟CLI命令执行
# print("=== IDP CLI 演示 ===")
# 
# # 列出服务目录
# print("\n1. 列出服务目录:")
# cli.run(['catalog', 'list'])
# 
# # 创建服务实例
# print("\n2. 创建Web应用服务:")
# cli.run(['service', 'create', 'my-web-app', '--type', 'web-app-template'])
# 
# # 等待异步操作完成
# import asyncio
# import time
# time.sleep(4)
# 
# # 列出服务实例
# print("\n3. 列出服务实例:")
# cli.run(['service', 'list'])
# 
# # 显示服务详情（需要实际的实例ID）
# # 这里简化处理，实际应用中需要获取真实的实例ID
```

## IDP与CI/CD的深度融合

IDP的核心价值在于将CI/CD能力深度集成到开发者自助服务平台中，提供端到端的交付体验。

### 一体化流水线管理

通过IDP，开发者可以自助创建、配置和管理CI/CD流水线：

#### 流水线模板与自助配置
```python
#!/usr/bin/env python3
"""
IDP流水线模板与自助配置系统
"""

import json
import yaml
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
from datetime import datetime
import logging
import re

@dataclass
class PipelineTemplate:
    id: str
    name: str
    version: str
    description: str
    category: str  # web, mobile, data, infrastructure
    author: str
    tags: List[str]
    parameters: Dict[str, Any]  # 模板参数
    stages: List[Dict[str, Any]]  # 流水线阶段定义
    notifications: List[Dict[str, Any]]  # 通知配置
    security_policies: List[str]  # 安全策略
    compliance_requirements: List[str]  # 合规要求
    estimated_duration: str  # 预估执行时间
    supported_triggers: List[str]  # 支持的触发方式

@dataclass
class PipelineInstance:
    id: str
    template_id: str
    name: str
    owner: str
    status: str  # draft, active, paused, archived
    created_at: datetime
    updated_at: datetime
    configuration: Dict[str, Any]  # 实例配置
    triggers: List[Dict[str, Any]]  # 触发配置
    variables: Dict[str, str]  # 环境变量
    secrets: Dict[str, str]  # 密钥引用
    permissions: Dict[str, List[str]]  # 权限配置
    execution_history: List[Dict[str, Any]]  # 执行历史

@dataclass
class TemplateParameter:
    name: str
    type: str  # string, integer, boolean, enum, secret
    description: str
    required: bool
    default: Any
    validation: Dict[str, Any]  # 验证规则
    sensitive: bool  # 是否敏感信息

class IDPPipelineManager:
    def __init__(self):
        self.templates: Dict[str, PipelineTemplate] = {}
        self.instances: Dict[str, PipelineInstance] = {}
        self.logger = logging.getLogger(__name__)
    
    def register_template(self, template: PipelineTemplate):
        """注册流水线模板"""
        self.templates[template.id] = template
        self.logger.info(f"Registered pipeline template: {template.name} (v{template.version})")
    
    def create_pipeline_from_template(self, template_id: str, name: str, owner: str,
                                    parameters: Dict[str, Any] = None,
                                    variables: Dict[str, str] = None) -> str:
        """基于模板创建流水线实例"""
        if template_id not in self.templates:
            raise ValueError(f"Template {template_id} not found")
        
        template = self.templates[template_id]
        
        # 验证和处理参数
        processed_parameters = self._process_parameters(template, parameters or {})
        
        # 创建实例
        instance_id = f"pipeline-{int(datetime.now().timestamp() * 1000)}"
        instance = PipelineInstance(
            id=instance_id,
            template_id=template_id,
            name=name,
            owner=owner,
            status="draft",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            configuration=processed_parameters,
            triggers=[],
            variables=variables or {},
            secrets={},
            permissions={"owners": [owner], "viewers": [], "executors": []},
            execution_history=[]
        )
        
        self.instances[instance_id] = instance
        self.logger.info(f"Created pipeline instance: {instance_id}")
        return instance_id
    
    def _process_parameters(self, template: PipelineTemplate, 
                          provided_parameters: Dict[str, Any]) -> Dict[str, Any]:
        """处理模板参数"""
        processed = {}
        
        for param_name, param_config in template.parameters.items():
            param = TemplateParameter(**param_config)
            
            # 检查必需参数
            if param.required and param_name not in provided_parameters:
                if param.default is not None:
                    processed[param_name] = param.default
                else:
                    raise ValueError(f"Required parameter '{param_name}' is missing")
            elif param_name in provided_parameters:
                value = provided_parameters[param_name]
                
                # 验证参数值
                if not self._validate_parameter_value(param, value):
                    raise ValueError(f"Invalid value for parameter '{param_name}'")
                
                processed[param_name] = value
            elif param.default is not None:
                processed[param_name] = param.default
        
        return processed
    
    def _validate_parameter_value(self, param: TemplateParameter, value: Any) -> bool:
        """验证参数值"""
        # 类型验证
        if not self._validate_type(param.type, value):
            return False
        
        # 自定义验证规则
        validation = param.validation or {}
        
        # 范围验证
        if "min" in validation and value < validation["min"]:
            return False
        if "max" in validation and value > validation["max"]:
            return False
        
        # 长度验证
        if "min_length" in validation and len(str(value)) < validation["min_length"]:
            return False
        if "max_length" in validation and len(str(value)) > validation["max_length"]:
            return False
        
        # 正则表达式验证
        if "pattern" in validation:
            if not re.match(validation["pattern"], str(value)):
                return False
        
        # 枚举验证
        if "enum" in validation and value not in validation["enum"]:
            return False
        
        return True
    
    def _validate_type(self, expected_type: str, value: Any) -> bool:
        """验证类型"""
        type_mapping = {
            "string": str,
            "integer": int,
            "boolean": bool,
            "number": (int, float)
        }
        
        expected_python_type = type_mapping.get(expected_type)
        if not expected_python_type:
            return True  # 未知类型默认通过
        
        if isinstance(expected_python_type, tuple):
            return isinstance(value, expected_python_type)
        else:
            return isinstance(value, expected_python_type)
    
    def configure_triggers(self, instance_id: str, triggers: List[Dict[str, Any]]):
        """配置流水线触发器"""
        if instance_id not in self.instances:
            raise ValueError(f"Pipeline instance {instance_id} not found")
        
        instance = self.instances[instance_id]
        
        # 验证触发器配置
        for trigger in triggers:
            self._validate_trigger(trigger)
        
        instance.triggers = triggers
        instance.updated_at = datetime.now()
        self.logger.info(f"Configured triggers for pipeline {instance_id}")
    
    def _validate_trigger(self, trigger: Dict[str, Any]):
        """验证触发器配置"""
        trigger_type = trigger.get("type")
        if not trigger_type:
            raise ValueError("Trigger type is required")
        
        # 根据触发器类型验证配置
        if trigger_type == "git":
            if not trigger.get("repository"):
                raise ValueError("Git trigger requires repository")
            if not trigger.get("events"):
                raise ValueError("Git trigger requires events")
        elif trigger_type == "schedule":
            if not trigger.get("cron"):
                raise ValueError("Schedule trigger requires cron expression")
        elif trigger_type == "webhook":
            if not trigger.get("endpoint"):
                raise ValueError("Webhook trigger requires endpoint")
    
    def add_secret(self, instance_id: str, name: str, value: str):
        """添加密钥"""
        if instance_id not in self.instances:
            raise ValueError(f"Pipeline instance {instance_id} not found")
        
        instance = self.instances[instance_id]
        
        # 简化实现，实际应用中会集成密钥管理系统
        instance.secrets[name] = f"secret_ref_{name}"
        instance.updated_at = datetime.now()
        self.logger.info(f"Added secret {name} to pipeline {instance_id}")
    
    def activate_pipeline(self, instance_id: str):
        """激活流水线"""
        if instance_id not in self.instances:
            raise ValueError(f"Pipeline instance {instance_id} not found")
        
        instance = self.instances[instance_id]
        instance.status = "active"
        instance.updated_at = datetime.now()
        self.logger.info(f"Activated pipeline {instance_id}")
    
    def execute_pipeline(self, instance_id: str, 
                        trigger_info: Dict[str, Any] = None) -> str:
        """执行流水线"""
        if instance_id not in self.instances:
            raise ValueError(f"Pipeline instance {instance_id} not found")
        
        instance = self.instances[instance_id]
        if instance.status != "active":
            raise ValueError(f"Pipeline {instance_id} is not active")
        
        # 创建执行记录
        execution_id = f"exec-{int(datetime.now().timestamp() * 1000)}"
        execution_record = {
            "id": execution_id,
            "started_at": datetime.now(),
            "status": "running",
            "trigger_info": trigger_info or {},
            "logs": []
        }
        
        instance.execution_history.append(execution_record)
        instance.updated_at = datetime.now()
        
        # 模拟异步执行
        import asyncio
        asyncio.create_task(self._execute_pipeline_async(instance_id, execution_id))
        
        self.logger.info(f"Started pipeline execution: {execution_id}")
        return execution_id
    
    async def _execute_pipeline_async(self, instance_id: str, execution_id: str):
        """异步执行流水线"""
        await asyncio.sleep(3)  # 模拟执行时间
        
        if instance_id in self.instances:
            instance = self.instances[instance_id]
            
            # 查找执行记录
            execution_record = None
            for record in instance.execution_history:
                if record["id"] == execution_id:
                    execution_record = record
                    break
            
            if execution_record:
                execution_record["completed_at"] = datetime.now()
                execution_record["status"] = "success"
                execution_record["duration"] = (
                    execution_record["completed_at"] - execution_record["started_at"]
                ).total_seconds()
                
                self.logger.info(f"Pipeline execution {execution_id} completed successfully")
    
    def get_template_catalog(self) -> List[PipelineTemplate]:
        """获取模板目录"""
        return list(self.templates.values())
    
    def get_user_pipelines(self, user_id: str) -> List[PipelineInstance]:
        """获取用户的流水线"""
        return [inst for inst in self.instances.values() if inst.owner == user_id]
    
    def get_pipeline_details(self, instance_id: str) -> Optional[PipelineInstance]:
        """获取流水线详情"""
        return self.instances.get(instance_id)
    
    def update_pipeline_configuration(self, instance_id: str, 
                                   configuration: Dict[str, Any]):
        """更新流水线配置"""
        if instance_id not in self.instances:
            raise ValueError(f"Pipeline instance {instance_id} not found")
        
        instance = self.instances[instance_id]
        instance.configuration.update(configuration)
        instance.updated_at = datetime.now()
        self.logger.info(f"Updated pipeline configuration for {instance_id}")

# 使用示例
# pipeline_manager = IDPPipelineManager()
# 
# # 注册流水线模板
# web_app_template = PipelineTemplate(
#     id="web-app-ci-cd",
#     name="Web应用CI/CD流水线",
#     version="1.0.0",
#     description="标准Web应用的持续集成和持续部署流水线",
#     category="web",
#     author="Platform Team",
#     tags=["web", "ci", "cd", "kubernetes"],
#     parameters={
#         "app_name": {
#             "name": "app_name",
#             "type": "string",
#             "description": "应用名称",
#             "required": True,
#             "default": None,
#             "validation": {"min_length": 3, "max_length": 50, "pattern": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$"},
#             "sensitive": False
#         },
#         "repository_url": {
#             "name": "repository_url",
#             "type": "string",
#             "description": "Git仓库URL",
#             "required": True,
#             "default": None,
#             "validation": {"pattern": "^https://"},
#             "sensitive": False
#         },
#         "build_tool": {
#             "name": "build_tool",
#             "type": "string",
#             "description": "构建工具",
#             "required": False,
#             "default": "maven",
#             "validation": {"enum": ["maven", "gradle", "npm", "yarn"]},
#             "sensitive": False
#         },
#         "target_environment": {
#             "name": "target_environment",
#             "type": "string",
#             "description": "目标环境",
#             "required": True,
#             "default": "staging",
#             "validation": {"enum": ["development", "staging", "production"]},
#             "sensitive": False
#         }
#     },
#     stages=[
#         {
#             "name": "checkout",
#             "type": "git-checkout",
#             "configuration": {"repository": "{{ repository_url }}"}
#         },
#         {
#             "name": "build",
#             "type": "build",
#             "configuration": {"tool": "{{ build_tool }}"}
#         },
#         {
#             "name": "test",
#             "type": "test",
#             "configuration": {"framework": "junit"}
#         },
#         {
#             "name": "deploy",
#             "type": "deploy",
#             "configuration": {"environment": "{{ target_environment }}"}
#         }
#     ],
#     notifications=[
#         {
#             "type": "slack",
#             "events": ["pipeline.start", "pipeline.success", "pipeline.failure"],
#             "channel": "#ci-cd-notifications"
#         }
#     ],
#     security_policies=["require_approval_for_production"],
#     compliance_requirements=["data_encryption", "access_logging"],
#     estimated_duration="15-30分钟",
#     supported_triggers=["git", "schedule", "manual"]
# )
# 
# pipeline_manager.register_template(web_app_template)
# 
# # 基于模板创建流水线实例
# pipeline_id = pipeline_manager.create_pipeline_from_template(
#     template_id="web-app-ci-cd",
#     name="My Web App Pipeline",
#     owner="developer-001",
#     parameters={
#         "app_name": "my-web-app",
#         "repository_url": "https://github.com/example/my-web-app.git",
#         "target_environment": "staging"
#     },
#     variables={
#         "JAVA_OPTS": "-Xmx512m",
#         "LOG_LEVEL": "INFO"
#     }
# )
# 
# print(f"Created pipeline: {pipeline_id}")
# 
# # 配置触发器
# pipeline_manager.configure_triggers(pipeline_id, [
#     {
#         "type": "git",
#         "repository": "https://github.com/example/my-web-app.git",
#         "events": ["push", "pull_request"],
#         "branches": ["main", "develop"]
#     },
#     {
#         "type": "schedule",
#         "cron": "0 2 * * *",  # 每天凌晨2点执行
#         "timezone": "Asia/Shanghai"
#     }
# ])
# 
# # 添加密钥
# pipeline_manager.add_secret(pipeline_id, "docker_registry_token", "secret_value")
# 
# # 激活流水线
# pipeline_manager.activate_pipeline(pipeline_id)
# 
# # 执行流水线
# execution_id = pipeline_manager.execute_pipeline(pipeline_id, {
#     "trigger_type": "manual",
#     "user": "developer-001"
# })
# 
# print(f"Started pipeline execution: {execution_id}")
# 
# # 查看流水线详情
# pipeline_details = pipeline_manager.get_pipeline_details(pipeline_id)
# if pipeline_details:
#     print(f"Pipeline status: {pipeline_details.status}")
#     print(f"Configuration: {json.dumps(pipeline_details.configuration, indent=2, ensure_ascii=False)}")
```

通过构建内部开发者平台并将其与CI/CD能力深度集成，组织能够为开发者提供更加友好、高效的一体化交付体验。这种平台化的 approach 不仅提升了开发效率，还通过标准化和自动化确保了交付质量和安全合规性。随着平台工程实践的不断发展，IDP将成为现代软件工程组织不可或缺的基础设施。