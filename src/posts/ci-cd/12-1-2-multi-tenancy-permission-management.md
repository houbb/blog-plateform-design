---
title: "多租户与权限管理（RBAC）: 项目隔离与资源配额"
date: 2025-09-07
categories: [CICD]
tags: [CICD]
published: true
---
在企业级CI/CD平台运营中，多租户架构和基于角色的访问控制（RBAC）是确保平台安全、稳定运行的核心机制。随着组织规模的扩大和团队数量的增加，如何有效隔离不同团队的资源、确保数据安全以及实施精细化的访问控制成为平台运营的重要挑战。通过建立完善的多租户权限管理体系，可以实现资源的合理分配、访问权限的精确控制以及运营成本的有效管理。

## 多租户权限管理架构

多租户权限管理需要从身份认证、授权控制、资源隔离等多个维度进行综合设计。

### 1. RBAC模型设计

基于角色的访问控制模型通过角色来管理用户权限，简化权限管理复杂度：

#### 核心组件设计
```python
#!/usr/bin/env python3
"""
RBAC权限管理系统
"""

import json
from typing import Dict, List, Set, Any, Optional
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

class PermissionType(Enum):
    READ = "read"
    WRITE = "write"
    EXECUTE = "execute"
    ADMIN = "admin"

@dataclass
class Permission:
    id: str
    name: str
    resource_type: str  # pipeline, template, environment, etc.
    resource_id: Optional[str]  # specific resource ID or None for all
    actions: List[PermissionType]
    description: str

@dataclass
class Role:
    id: str
    name: str
    permissions: List[str]  # permission IDs
    description: str
    is_system_role: bool = False

@dataclass
class User:
    id: str
    username: str
    email: str
    roles: List[str]  # role IDs
    tenant_id: str
    created_at: str
    last_login: Optional[str]

class RBACManager:
    def __init__(self):
        self.permissions = {}
        self.roles = {}
        self.users = {}
        self.tenant_roles = {}  # tenant_id -> role_ids
        self.role_permissions = {}  # role_id -> permission_ids
    
    def create_permission(self, permission_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建权限"""
        try:
            permission = Permission(
                id=permission_data['id'],
                name=permission_data['name'],
                resource_type=permission_data['resource_type'],
                resource_id=permission_data.get('resource_id'),
                actions=[PermissionType(a) for a in permission_data['actions']],
                description=permission_data.get('description', '')
            )
            
            self.permissions[permission.id] = permission
            
            return {
                'success': True,
                'permission_id': permission.id,
                'message': f"Permission {permission.name} created successfully"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to create permission: {str(e)}"
            }
    
    def create_role(self, role_data: Dict[str, Any], tenant_id: str = None) -> Dict[str, Any]:
        """创建角色"""
        try:
            role = Role(
                id=role_data['id'],
                name=role_data['name'],
                permissions=role_data.get('permissions', []),
                description=role_data.get('description', ''),
                is_system_role=role_data.get('is_system_role', False)
            )
            
            self.roles[role.id] = role
            
            # 如果是租户特定角色，记录到租户角色映射中
            if tenant_id:
                if tenant_id not in self.tenant_roles:
                    self.tenant_roles[tenant_id] = []
                self.tenant_roles[tenant_id].append(role.id)
            
            # 建立角色-权限映射
            self.role_permissions[role.id] = role.permissions
            
            return {
                'success': True,
                'role_id': role.id,
                'message': f"Role {role.name} created successfully"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to create role: {str(e)}"
            }
    
    def assign_role_to_user(self, user_id: str, role_id: str) -> Dict[str, Any]:
        """为用户分配角色"""
        user = self.users.get(user_id)
        if not user:
            return {
                'success': False,
                'error': f"User {user_id} not found"
            }
        
        role = self.roles.get(role_id)
        if not role:
            return {
                'success': False,
                'error': f"Role {role_id} not found"
            }
        
        if role_id not in user.roles:
            user.roles.append(role_id)
        
        return {
            'success': True,
            'message': f"Role {role.name} assigned to user {user.username}"
        }
    
    def check_permission(self, user_id: str, resource_type: str, 
                        action: PermissionType, resource_id: str = None) -> bool:
        """检查用户是否具有指定权限"""
        user = self.users.get(user_id)
        if not user:
            return False
        
        # 获取用户的所有角色
        user_roles = [self.roles[role_id] for role_id in user.roles if role_id in self.roles]
        
        # 检查每个角色的权限
        for role in user_roles:
            # 获取角色的权限
            role_permissions = [self.permissions[perm_id] for perm_id in role.permissions 
                              if perm_id in self.permissions]
            
            # 检查权限是否匹配
            for permission in role_permissions:
                if (permission.resource_type == resource_type and 
                    action in permission.actions):
                    # 如果权限指定了具体资源ID，需要匹配
                    if permission.resource_id and resource_id:
                        if permission.resource_id == resource_id:
                            return True
                    # 如果权限适用于所有资源，或者没有指定资源ID
                    elif not permission.resource_id:
                        return True
        
        return False
    
    def get_user_permissions(self, user_id: str) -> Dict[str, Any]:
        """获取用户的所有权限"""
        user = self.users.get(user_id)
        if not user:
            return {
                'success': False,
                'error': f"User {user_id} not found"
            }
        
        permissions = []
        user_roles = [self.roles[role_id] for role_id in user.roles if role_id in self.roles]
        
        for role in user_roles:
            role_perms = [self.permissions[perm_id] for perm_id in role.permissions 
                         if perm_id in self.permissions]
            permissions.extend(role_perms)
        
        # 去重
        unique_permissions = []
        seen = set()
        for perm in permissions:
            if perm.id not in seen:
                unique_permissions.append(perm)
                seen.add(perm.id)
        
        return {
            'success': True,
            'permissions': unique_permissions
        }

# 使用示例
# rbac_manager = RBACManager()
# 
# # 创建权限
# pipeline_read_perm = rbac_manager.create_permission({
#     'id': 'pipeline_read',
#     'name': 'Read Pipeline',
#     'resource_type': 'pipeline',
#     'actions': ['read'],
#     'description': '允许读取流水线配置'
# })
# 
# pipeline_write_perm = rbac_manager.create_permission({
#     'id': 'pipeline_write',
#     'name': 'Write Pipeline',
#     'resource_type': 'pipeline',
#     'actions': ['read', 'write'],
#     'description': '允许创建和修改流水线配置'
# })
# 
# # 创建角色
# developer_role = rbac_manager.create_role({
#     'id': 'developer',
#     'name': 'Developer',
#     'permissions': ['pipeline_read', 'pipeline_write'],
#     'description': '开发人员角色'
# })
# 
# viewer_role = rbac_manager.create_role({
#     'id': 'viewer',
#     'name': 'Viewer',
#     'permissions': ['pipeline_read'],
#     'description': '只读查看角色'
# })
# 
# # 创建用户
# user = User(
#     id='user-123',
#     username='zhangsan',
#     email='zhangsan@example.com',
#     roles=[],
#     tenant_id='tenant-1',
#     created_at=datetime.now().isoformat(),
#     last_login=None
# )
# rbac_manager.users[user.id] = user
# 
# # 分配角色
# rbac_manager.assign_role_to_user('user-123', 'developer')
# 
# # 检查权限
# has_permission = rbac_manager.check_permission(
#     user_id='user-123',
#     resource_type='pipeline',
#     action=PermissionType.WRITE
# )
# print(f"User has write permission: {has_permission}")
```

### 2. 资源配额管理

通过资源配额管理确保各租户公平使用系统资源：

#### 配额策略设计
```python
#!/usr/bin/env python3
"""
资源配额管理系统
"""

import json
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class ResourceQuota:
    id: str
    tenant_id: str
    resource_type: str  # cpu, memory, storage, pipeline_count, etc.
    limit: float
    used: float
    unit: str  # cores, GiB, GiB-hours, count, etc.
    period: str  # daily, weekly, monthly, unlimited
    created_at: str
    updated_at: str

@dataclass
class QuotaUsage:
    tenant_id: str
    resource_type: str
    used_amount: float
    limit_amount: float
    usage_percentage: float
    reset_time: Optional[str]  # 下次重置时间

class QuotaManager:
    def __init__(self):
        self.quotas = {}
        self.usage_history = {}
    
    def create_quota(self, quota_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建资源配额"""
        try:
            quota = ResourceQuota(
                id=quota_data['id'],
                tenant_id=quota_data['tenant_id'],
                resource_type=quota_data['resource_type'],
                limit=quota_data['limit'],
                used=0.0,
                unit=quota_data.get('unit', 'count'),
                period=quota_data.get('period', 'unlimited'),
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            
            self.quotas[quota.id] = quota
            
            return {
                'success': True,
                'quota_id': quota.id,
                'message': f"Quota for {quota.resource_type} created successfully"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to create quota: {str(e)}"
            }
    
    def check_quota_availability(self, tenant_id: str, resource_type: str, 
                               requested_amount: float) -> Dict[str, Any]:
        """检查配额可用性"""
        tenant_quotas = [q for q in self.quotas.values() 
                        if q.tenant_id == tenant_id and q.resource_type == resource_type]
        
        if not tenant_quotas:
            return {
                'success': True,
                'available': True,
                'message': 'No quota limit set for this resource'
            }
        
        # 检查所有相关配额
        for quota in tenant_quotas:
            if quota.limit > 0 and (quota.used + requested_amount) > quota.limit:
                return {
                    'success': True,
                    'available': False,
                    'quota_id': quota.id,
                    'current_usage': quota.used,
                    'requested_amount': requested_amount,
                    'limit': quota.limit,
                    'message': f"Quota exceeded for {resource_type}"
                }
        
        return {
            'success': True,
            'available': True,
            'message': 'Quota available'
        }
    
    def consume_quota(self, tenant_id: str, resource_type: str, 
                     amount: float) -> Dict[str, Any]:
        """消耗配额"""
        tenant_quotas = [q for q in self.quotas.values() 
                        if q.tenant_id == tenant_id and q.resource_type == resource_type]
        
        if not tenant_quotas:
            return {
                'success': True,
                'message': 'No quota limit set for this resource'
            }
        
        success = False
        for quota in tenant_quotas:
            if quota.limit <= 0 or (quota.used + amount) <= quota.limit:
                quota.used += amount
                quota.updated_at = datetime.now().isoformat()
                success = True
                break
        
        if success:
            # 记录使用历史
            self._record_usage(tenant_id, resource_type, amount)
            
            return {
                'success': True,
                'message': f"Consumed {amount} {resource_type} quota"
            }
        else:
            return {
                'success': False,
                'error': f"Insufficient quota for {resource_type}"
            }
    
    def _record_usage(self, tenant_id: str, resource_type: str, amount: float):
        """记录使用历史"""
        key = f"{tenant_id}:{resource_type}"
        if key not in self.usage_history:
            self.usage_history[key] = []
        
        self.usage_history[key].append({
            'amount': amount,
            'timestamp': datetime.now().isoformat()
        })
        
        # 保留最近100条记录
        if len(self.usage_history[key]) > 100:
            self.usage_history[key] = self.usage_history[key][-100:]
    
    def get_tenant_usage_report(self, tenant_id: str, 
                              period_days: int = 30) -> Dict[str, Any]:
        """获取租户使用报告"""
        cutoff_time = datetime.now() - timedelta(days=period_days)
        
        # 计算当前配额使用情况
        tenant_quotas = [q for q in self.quotas.values() if q.tenant_id == tenant_id]
        usage_report = []
        
        for quota in tenant_quotas:
            usage_percentage = (quota.used / quota.limit * 100) if quota.limit > 0 else 0
            
            usage_report.append({
                'resource_type': quota.resource_type,
                'used': quota.used,
                'limit': quota.limit,
                'unit': quota.unit,
                'usage_percentage': round(usage_percentage, 2),
                'status': self._get_usage_status(usage_percentage)
            })
        
        # 计算历史使用趋势
        usage_trends = {}
        for key, history in self.usage_history.items():
            if key.startswith(f"{tenant_id}:"):
                resource_type = key.split(":")[1]
                recent_usage = [entry for entry in history 
                              if datetime.fromisoformat(entry['timestamp']) > cutoff_time]
                total_usage = sum(entry['amount'] for entry in recent_usage)
                usage_trends[resource_type] = total_usage
        
        return {
            'success': True,
            'tenant_id': tenant_id,
            'report_time': datetime.now().isoformat(),
            'current_usage': usage_report,
            'usage_trends': usage_trends,
            'period_days': period_days
        }
    
    def _get_usage_status(self, percentage: float) -> str:
        """根据使用百分比获取状态"""
        if percentage >= 90:
            return 'critical'
        elif percentage >= 75:
            return 'warning'
        else:
            return 'normal'
    
    def reset_periodic_quotas(self):
        """重置周期性配额"""
        now = datetime.now()
        reset_count = 0
        
        for quota in self.quotas.values():
            # 检查是否需要重置（简化实现，实际应用中需要更复杂的周期计算）
            should_reset = False
            last_reset = datetime.fromisoformat(quota.updated_at)
            
            if quota.period == 'daily':
                should_reset = (now - last_reset).days >= 1
            elif quota.period == 'weekly':
                should_reset = (now - last_reset).days >= 7
            elif quota.period == 'monthly':
                should_reset = (now - last_reset).days >= 30
            
            if should_reset:
                quota.used = 0.0
                quota.updated_at = now.isoformat()
                reset_count += 1
        
        return {
            'success': True,
            'reset_count': reset_count,
            'message': f"Reset {reset_count} periodic quotas"
        }

# 使用示例
# quota_manager = QuotaManager()
# 
# # 创建配额
# cpu_quota = quota_manager.create_quota({
#     'id': 'quota-1',
#     'tenant_id': 'tenant-1',
#     'resource_type': 'cpu',
#     'limit': 10.0,  # 10个CPU核心
#     'unit': 'cores',
#     'period': 'monthly'
# })
# 
# pipeline_quota = quota_manager.create_quota({
#     'id': 'quota-2',
#     'tenant_id': 'tenant-1',
#     'resource_type': 'pipeline_count',
#     'limit': 50,  # 50个流水线
#     'unit': 'count',
#     'period': 'unlimited'
# })
# 
# # 检查配额可用性
# availability = quota_manager.check_quota_availability(
#     tenant_id='tenant-1',
#     resource_type='cpu',
#     requested_amount=2.0
# )
# print(availability)
# 
# # 消耗配额
# consume_result = quota_manager.consume_quota(
#     tenant_id='tenant-1',
#     resource_type='cpu',
#     amount=2.0
# )
# print(consume_result)
# 
# # 获取使用报告
# report = quota_manager.get_tenant_usage_report('tenant-1', 30)
# print(json.dumps(report, indent=2, ensure_ascii=False))