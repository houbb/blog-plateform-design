---
title: "名单分级与生效范围: 全局名单、业务专属名单"
date: 2025-09-07
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 名单分级与生效范围：全局名单、业务专属名单

## 引言

在企业级智能风控平台中，名单服务不仅需要支持多种类型的名单，还需要具备灵活的分级管理和精准的生效范围控制能力。通过合理的名单分级和范围管理，可以实现更加精细化的风险控制，满足不同业务场景的需求。全局名单和业务专属名单的结合使用，使得风控系统既能保持统一的风控标准，又能适应各业务线的特殊需求。

本文将深入探讨名单分级管理机制和生效范围控制技术，分析全局名单与业务专属名单的设计原理和实现方法，为构建灵活高效的名单服务体系提供指导。

## 一、名单分级管理

### 1.1 分级管理概述

名单分级管理是根据名单的重要性和影响范围，将名单划分为不同等级的管理方式。通过分级管理，可以实现不同等级名单的差异化处理策略，提高名单管理的效率和准确性。

#### 1.1.1 分级管理价值

**资源优化**：
1. **存储优化**：不同等级名单采用不同的存储策略
2. **计算优化**：高优先级名单优先匹配，提高处理效率
3. **网络优化**：减少不必要的名单传输和同步
4. **人力优化**：重要名单重点维护，普通名单自动化管理

**风险控制**：
1. **精准控制**：不同等级名单采取不同的风控策略
2. **快速响应**：高优先级名单快速生效和失效
3. **权限管理**：不同等级名单需要不同权限操作
4. **审计追踪**：重要名单操作详细记录和追踪

#### 1.1.2 分级设计原则

**业务导向**：
- 根据业务重要性确定名单等级
- 考虑名单对业务的影响程度
- 结合业务风险容忍度设计等级

**技术可行**：
- 确保技术实现的可行性
- 考虑系统性能和资源消耗
- 平衡复杂度和实用性

**可扩展性**：
- 支持等级的动态调整
- 便于新增等级类型
- 适应业务发展需要

### 1.2 名单等级体系

#### 1.2.1 等级分类

**核心等级**：
```python
# 名单等级体系
from enum import Enum
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

class ListLevel(Enum):
    """名单等级"""
    CRITICAL = "critical"      # 关键级 - 影响核心业务
    HIGH = "high"             # 高级 - 影响重要业务
    MEDIUM = "medium"         # 中级 - 影响一般业务
    LOW = "low"               # 低级 - 影响较小业务
    NORMAL = "normal"         # 普通级 - 常规名单

@dataclass
class ListLevelConfig:
    """名单等级配置"""
    level: ListLevel
    priority: int           # 优先级（数值越大优先级越高）
    storage_type: str       # 存储类型
    sync_frequency: int     # 同步频率（秒）
    retention_period: int   # 保留周期（天）
    approval_required: bool # 是否需要审批
    audit_level: str        # 审计级别
    max_entries: int        # 最大条目数

class ListLevelManager:
    """名单等级管理器"""
    
    def __init__(self):
        self.level_configs = self._initialize_level_configs()
    
    def _initialize_level_configs(self) -> Dict[ListLevel, ListLevelConfig]:
        """初始化等级配置"""
        return {
            ListLevel.CRITICAL: ListLevelConfig(
                level=ListLevel.CRITICAL,
                priority=100,
                storage_type="redis_cluster",
                sync_frequency=1,      # 1秒同步
                retention_period=365,  # 1年
                approval_required=True,
                audit_level="detailed",
                max_entries=100000
            ),
            ListLevel.HIGH: ListLevelConfig(
                level=ListLevel.HIGH,
                priority=80,
                storage_type="redis",
                sync_frequency=5,      # 5秒同步
                retention_period=180,  # 180天
                approval_required=True,
                audit_level="standard",
                max_entries=500000
            ),
            ListLevel.MEDIUM: ListLevelConfig(
                level=ListLevel.MEDIUM,
                priority=60,
                storage_type="redis",
                sync_frequency=30,     # 30秒同步
                retention_period=90,   # 90天
                approval_required=False,
                audit_level="basic",
                max_entries=2000000
            ),
            ListLevel.LOW: ListLevelConfig(
                level=ListLevel.LOW,
                priority=40,
                storage_type="database",
                sync_frequency=300,    # 5分钟同步
                retention_period=30,   # 30天
                approval_required=False,
                audit_level="minimal",
                max_entries=10000000
            ),
            ListLevel.NORMAL: ListLevelConfig(
                level=ListLevel.NORMAL,
                priority=20,
                storage_type="database",
                sync_frequency=3600,   # 1小时同步
                retention_period=7,    # 7天
                approval_required=False,
                audit_level="none",
                max_entries=50000000
            )
        }
    
    def get_level_config(self, level: ListLevel) -> ListLevelConfig:
        """获取等级配置"""
        return self.level_configs.get(level, self.level_configs[ListLevel.NORMAL])
    
    def get_priority(self, level: ListLevel) -> int:
        """获取优先级"""
        config = self.level_configs.get(level)
        return config.priority if config else 0
    
    def should_approve(self, level: ListLevel) -> bool:
        """是否需要审批"""
        config = self.level_configs.get(level)
        return config.approval_required if config else False

# 名单条目基类
@dataclass
class BaseListEntry:
    """名单条目基类"""
    id: str
    value: str
    level: ListLevel
    reason: str
    source: str
    operator: str
    created_at: datetime
    effective_at: datetime
    expire_at: datetime
    status: str
    metadata: Dict[str, Any]

# 使用示例
def example_list_level_management():
    """名单等级管理示例"""
    level_manager = ListLevelManager()
    
    # 获取关键级配置
    critical_config = level_manager.get_level_config(ListLevel.CRITICAL)
    print(f"关键级配置: {critical_config}")
    
    # 获取高级配置
    high_config = level_manager.get_level_config(ListLevel.HIGH)
    print(f"高级配置: {high_config}")
    
    # 检查是否需要审批
    print(f"关键级是否需要审批: {level_manager.should_approve(ListLevel.CRITICAL)}")
    print(f"普通级是否需要审批: {level_manager.should_approve(ListLevel.NORMAL)}")
```

#### 1.2.2 等级管理实现

**等级管理服务**：
```python
# 等级管理服务
import uuid
from typing import Optional

class LevelBasedListService:
    """基于等级的名单服务"""
    
    def __init__(self, level_manager: ListLevelManager, storage_backend):
        self.level_manager = level_manager
        self.storage = storage_backend
        self.cache = {}
        self.approval_service = ApprovalService()
    
    def add_list_entry(self, entry: BaseListEntry) -> Dict[str, Any]:
        """
        添加名单条目
        
        Args:
            entry: 名单条目
            
        Returns:
            添加结果
        """
        try:
            # 验证条目
            if not self._validate_entry(entry):
                return {
                    'success': False,
                    'message': '条目验证失败'
                }
            
            # 检查是否需要审批
            if self.level_manager.should_approve(entry.level):
                # 创建审批流程
                approval_id = self.approval_service.create_approval(
                    entry_id=entry.id,
                    level=entry.level,
                    reason=entry.reason,
                    operator=entry.operator
                )
                
                return {
                    'success': True,
                    'message': '已提交审批',
                    'approval_id': approval_id,
                    'status': 'pending_approval'
                }
            
            # 直接添加
            success = self.storage.save_entry(entry)
            if success:
                self._update_cache(entry)
                self._log_operation("add", entry)
                
                return {
                    'success': True,
                    'message': '添加成功',
                    'entry_id': entry.id
                }
            else:
                return {
                    'success': False,
                    'message': '存储失败'
                }
                
        except Exception as e:
            print(f"添加名单条目失败: {e}")
            return {
                'success': False,
                'message': f'添加失败: {str(e)}'
            }
    
    def approve_list_entry(self, approval_id: str, approver: str, 
                          approved: bool, comments: str = "") -> Dict[str, Any]:
        """
        审批名单条目
        
        Args:
            approval_id: 审批ID
            approver: 审批人
            approved: 是否批准
            comments: 审批意见
            
        Returns:
            审批结果
        """
        try:
            # 获取审批信息
            approval_info = self.approval_service.get_approval(approval_id)
            if not approval_info:
                return {
                    'success': False,
                    'message': '审批信息不存在'
                }
            
            if approval_info['status'] != 'pending':
                return {
                    'success': False,
                    'message': '审批状态不正确'
                }
            
            # 更新审批状态
            self.approval_service.update_approval(
                approval_id=approval_id,
                approver=approver,
                approved=approved,
                comments=comments
            )
            
            if approved:
                # 获取原始条目
                entry = self.storage.get_entry(approval_info['entry_id'])
                if entry:
                    # 添加到名单
                    success = self.storage.save_entry(entry)
                    if success:
                        self._update_cache(entry)
                        self._log_operation("approved_add", entry)
                        
                        return {
                            'success': True,
                            'message': '审批通过，条目已添加'
                        }
                    else:
                        return {
                            'success': False,
                            'message': '存储失败'
                        }
                else:
                    return {
                        'success': False,
                        'message': '原始条目不存在'
                    }
            else:
                return {
                    'success': True,
                    'message': '审批拒绝'
                }
                
        except Exception as e:
            print(f"审批名单条目失败: {e}")
            return {
                'success': False,
                'message': f'审批失败: {str(e)}'
            }
    
    def check_list_entry(self, value: str, context: Dict[str, Any] = None) -> Optional[BaseListEntry]:
        """
        检查名单条目（按等级优先级排序）
        
        Args:
            value: 检查值
            context: 上下文信息
            
        Returns:
            匹配的名单条目
        """
        try:
            # 按优先级顺序检查各等级
            priority_levels = [
                ListLevel.CRITICAL,
                ListLevel.HIGH,
                ListLevel.MEDIUM,
                ListLevel.LOW,
                ListLevel.NORMAL
            ]
            
            for level in priority_levels:
                # 检查缓存
                cache_key = f"{level.value}:{value}"
                if cache_key in self.cache:
                    entry = self.cache[cache_key]
                    if self._is_entry_active(entry) and self._check_context(entry, context):
                        return entry
                
                # 检查存储
                entry = self.storage.find_entry(value, level)
                if entry and self._is_entry_active(entry) and self._check_context(entry, context):
                    self._update_cache(entry)
                    return entry
            
            return None
            
        except Exception as e:
            print(f"检查名单条目失败: {e}")
            return None
    
    def _validate_entry(self, entry: BaseListEntry) -> bool:
        """验证名单条目"""
        # 检查必填字段
        if not entry.value or not entry.reason or not entry.source:
            return False
        
        # 检查时间有效性
        if entry.expire_at <= entry.effective_at:
            return False
        
        # 检查等级有效性
        if not isinstance(entry.level, ListLevel):
            return False
        
        # 检查条目数量限制
        level_config = self.level_manager.get_level_config(entry.level)
        current_count = self.storage.get_entry_count(entry.level)
        if current_count >= level_config.max_entries:
            return False
        
        return True
    
    def _is_entry_active(self, entry: BaseListEntry) -> bool:
        """检查条目是否活跃"""
        now = datetime.now()
        return entry.effective_at <= now <= entry.expire_at and entry.status == "active"
    
    def _check_context(self, entry: BaseListEntry, context: Dict[str, Any] = None) -> bool:
        """检查上下文条件"""
        if not context or not entry.metadata.get('conditions'):
            return True
        
        conditions = entry.metadata.get('conditions', [])
        for condition in conditions:
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            if field not in context:
                return False
            
            context_value = context[field]
            
            if operator == "==":
                if context_value != value:
                    return False
            elif operator == "!=":
                if context_value == value:
                    return False
            elif operator == ">":
                if not isinstance(context_value, (int, float)) or context_value <= value:
                    return False
            elif operator == "<":
                if not isinstance(context_value, (int, float)) or context_value >= value:
                    return False
            elif operator == "in":
                if not isinstance(value, list) or context_value not in value:
                    return False
        
        return True
    
    def _update_cache(self, entry: BaseListEntry):
        """更新缓存"""
        cache_key = f"{entry.level.value}:{entry.value}"
        self.cache[cache_key] = entry
        
        # 限制缓存大小
        if len(self.cache) > 100000:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
    
    def _log_operation(self, operation: str, entry: BaseListEntry):
        """记录操作日志"""
        log_entry = {
            'operation': operation,
            'entry_id': entry.id,
            'level': entry.level.value,
            'value': entry.value,
            'operator': entry.operator,
            'timestamp': datetime.now().isoformat()
        }
        print(f"名单操作日志: {log_entry}")

# 审批服务
class ApprovalService:
    """审批服务"""
    
    def __init__(self):
        self.approvals = {}  # 简化实现，实际应该使用存储
    
    def create_approval(self, entry_id: str, level: ListLevel, 
                       reason: str, operator: str) -> str:
        """创建审批"""
        approval_id = f"approval_{uuid.uuid4().hex}"
        
        approval_info = {
            'approval_id': approval_id,
            'entry_id': entry_id,
            'level': level.value,
            'reason': reason,
            'applicant': operator,
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'approved_by': None,
            'approved_at': None,
            'comments': ''
        }
        
        self.approvals[approval_id] = approval_info
        return approval_id
    
    def get_approval(self, approval_id: str) -> Optional[Dict[str, Any]]:
        """获取审批信息"""
        return self.approvals.get(approval_id)
    
    def update_approval(self, approval_id: str, approver: str, 
                       approved: bool, comments: str = ""):
        """更新审批"""
        if approval_id in self.approvals:
            approval = self.approvals[approval_id]
            approval['status'] = 'approved' if approved else 'rejected'
            approval['approved_by'] = approver
            approval['approved_at'] = datetime.now().isoformat()
            approval['comments'] = comments

# 存储接口
class ListStorage:
    """名单存储接口"""
    
    def save_entry(self, entry: BaseListEntry) -> bool:
        raise NotImplementedError
    
    def get_entry(self, entry_id: str) -> Optional[BaseListEntry]:
        raise NotImplementedError
    
    def find_entry(self, value: str, level: ListLevel) -> Optional[BaseListEntry]:
        raise NotImplementedError
    
    def get_entry_count(self, level: ListLevel) -> int:
        raise NotImplementedError

# 使用示例
def example_level_based_service():
    """基于等级的名单服务示例"""
    # 初始化服务
    level_manager = ListLevelManager()
    storage = MockListStorage()  # 模拟存储
    list_service = LevelBasedListService(level_manager, storage)
    
    # 创建关键级名单条目
    critical_entry = BaseListEntry(
        id=f"entry_{uuid.uuid4().hex}",
        value="critical_user_123",
        level=ListLevel.CRITICAL,
        reason="核心业务风险用户",
        source="安全审计",
        operator="admin",
        created_at=datetime.now(),
        effective_at=datetime.now(),
        expire_at=datetime.now() + timedelta(days=365),
        status="active",
        metadata={"business": "payment", "risk_level": "high"}
    )
    
    # 添加条目（需要审批）
    result = list_service.add_list_entry(critical_entry)
    print(f"添加关键级条目结果: {result}")
    
    # 如果需要审批，进行审批
    if 'approval_id' in result:
        approval_result = list_service.approve_list_entry(
            approval_id=result['approval_id'],
            approver="security_manager",
            approved=True,
            comments="风险确认，同意加入名单"
        )
        print(f"审批结果: {approval_result}")
    
    # 检查名单
    check_result = list_service.check_list_entry("critical_user_123")
    print(f"名单检查结果: {check_result is not None}")
```

## 二、生效范围管理

### 2.1 范围管理概述

生效范围管理是指控制名单条目在什么范围内生效的机制。通过精确的范围控制，可以实现名单的精细化管理，避免过度拦截或拦截不足的问题。

#### 2.1.1 范围管理价值

**精准控制**：
1. **业务隔离**：不同业务使用不同的名单
2. **地域控制**：按地域应用不同的风控策略
3. **时间控制**：在特定时间范围内生效
4. **条件控制**：满足特定条件时才生效

**灵活配置**：
1. **动态调整**：根据业务需要动态调整生效范围
2. **组合应用**：多个范围条件组合生效
3. **优先级管理**：不同范围有不同的优先级
4. **继承机制**：子范围继承父范围的配置

#### 2.1.2 范围类型设计

**范围分类**：
```python
# 生效范围类型
from enum import Enum

class ScopeType(Enum):
    """范围类型"""
    GLOBAL = "global"           # 全局范围
    BUSINESS = "business"       # 业务范围
    REGION = "region"           # 地域范围
    CHANNEL = "channel"         # 渠道范围
    USER_GROUP = "user_group"   # 用户组范围
    TIME_WINDOW = "time_window" # 时间窗口范围
    CUSTOM = "custom"           # 自定义范围

@dataclass
class ScopeDefinition:
    """范围定义"""
    scope_type: ScopeType
    scope_value: str           # 范围值
    priority: int             # 优先级
    conditions: List[Dict[str, Any]]  # 生效条件
    metadata: Dict[str, Any]   # 扩展信息

class ScopeManager:
    """范围管理器"""
    
    def __init__(self):
        self.scopes = {}  # 范围配置
        self.scope_hierarchy = {}  # 范围层级关系
    
    def add_scope(self, scope_id: str, definition: ScopeDefinition) -> bool:
        """添加范围"""
        try:
            self.scopes[scope_id] = definition
            return True
        except Exception as e:
            print(f"添加范围失败: {e}")
            return False
    
    def get_scope(self, scope_id: str) -> Optional[ScopeDefinition]:
        """获取范围"""
        return self.scopes.get(scope_id)
    
    def get_matching_scopes(self, context: Dict[str, Any]) -> List[ScopeDefinition]:
        """
        获取匹配的范围
        
        Args:
            context: 上下文信息
            
        Returns:
            匹配的范围列表
        """
        matching_scopes = []
        
        for scope_id, scope_def in self.scopes.items():
            if self._matches_scope(scope_def, context):
                matching_scopes.append(scope_def)
        
        # 按优先级排序
        matching_scopes.sort(key=lambda x: x.priority, reverse=True)
        return matching_scopes
    
    def _matches_scope(self, scope_def: ScopeDefinition, 
                      context: Dict[str, Any]) -> bool:
        """检查是否匹配范围"""
        # 检查范围类型
        if scope_def.scope_type == ScopeType.GLOBAL:
            return True
        elif scope_def.scope_type == ScopeType.BUSINESS:
            return context.get('business') == scope_def.scope_value
        elif scope_def.scope_type == ScopeType.REGION:
            return context.get('region') == scope_def.scope_value
        elif scope_def.scope_type == ScopeType.CHANNEL:
            return context.get('channel') == scope_def.scope_value
        elif scope_def.scope_type == ScopeType.USER_GROUP:
            return context.get('user_group') == scope_def.scope_value
        elif scope_def.scope_type == ScopeType.TIME_WINDOW:
            return self._check_time_window(scope_def.scope_value)
        elif scope_def.scope_type == ScopeType.CUSTOM:
            return self._check_custom_conditions(scope_def.conditions, context)
        
        return False
    
    def _check_time_window(self, time_window: str) -> bool:
        """检查时间窗口"""
        try:
            # 解析时间窗口格式: "09:00-18:00" 或 "2025-01-01~2025-12-31"
            if "~" in time_window:
                # 日期范围
                start_date, end_date = time_window.split("~")
                start = datetime.fromisoformat(start_date)
                end = datetime.fromisoformat(end_date)
                now = datetime.now()
                return start <= now <= end
            elif "-" in time_window:
                # 时间范围
                start_time, end_time = time_window.split("-")
                start = datetime.strptime(start_time, "%H:%M").time()
                end = datetime.strptime(end_time, "%H:%M").time()
                now = datetime.now().time()
                return start <= now <= end
            else:
                return False
        except Exception as e:
            print(f"时间窗口检查失败: {e}")
            return False
    
    def _check_custom_conditions(self, conditions: List[Dict[str, Any]], 
                               context: Dict[str, Any]) -> bool:
        """检查自定义条件"""
        for condition in conditions:
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            if field not in context:
                return False
            
            context_value = context[field]
            
            if operator == "==":
                if context_value != value:
                    return False
            elif operator == "!=":
                if context_value == value:
                    return False
            elif operator == ">":
                if not isinstance(context_value, (int, float)) or context_value <= value:
                    return False
            elif operator == "<":
                if not isinstance(context_value, (int, float)) or context_value >= value:
                    return False
            elif operator == "in":
                if not isinstance(value, list) or context_value not in value:
                    return False
            elif operator == "contains":
                if not isinstance(context_value, str) or value not in context_value:
                    return False
        
        return True

# 范围感知的名单服务
class ScopeAwareListService:
    """范围感知的名单服务"""
    
    def __init__(self, level_manager: ListLevelManager, 
                 scope_manager: ScopeManager, storage_backend):
        self.level_manager = level_manager
        self.scope_manager = scope_manager
        self.storage = storage_backend
        self.cache = {}
    
    def add_scoped_entry(self, entry: BaseListEntry, 
                        scopes: List[ScopeDefinition]) -> Dict[str, Any]:
        """
        添加范围感知的名单条目
        
        Args:
            entry: 名单条目
            scopes: 生效范围列表
            
        Returns:
            添加结果
        """
        try:
            # 验证条目
            if not self._validate_entry(entry):
                return {
                    'success': False,
                    'message': '条目验证失败'
                }
            
            # 添加范围信息到元数据
            entry.metadata['scopes'] = [self._scope_to_dict(scope) for scope in scopes]
            
            # 保存条目
            success = self.storage.save_entry(entry)
            if success:
                self._update_cache(entry)
                self._log_operation("add_scoped", entry)
                
                return {
                    'success': True,
                    'message': '添加成功',
                    'entry_id': entry.id
                }
            else:
                return {
                    'success': False,
                    'message': '存储失败'
                }
                
        except Exception as e:
            print(f"添加范围名单条目失败: {e}")
            return {
                'success': False,
                'message': f'添加失败: {str(e)}'
            }
    
    def check_scoped_entry(self, value: str, 
                          context: Dict[str, Any] = None) -> Optional[BaseListEntry]:
        """
        检查范围感知的名单条目
        
        Args:
            value: 检查值
            context: 上下文信息
            
        Returns:
            匹配的名单条目
        """
        try:
            # 获取匹配的范围
            matching_scopes = self.scope_manager.get_matching_scopes(context or {})
            
            # 按优先级顺序检查各等级
            priority_levels = [
                ListLevel.CRITICAL,
                ListLevel.HIGH,
                ListLevel.MEDIUM,
                ListLevel.LOW,
                ListLevel.NORMAL
            ]
            
            for level in priority_levels:
                # 检查缓存
                cache_key = f"{level.value}:{value}"
                if cache_key in self.cache:
                    entry = self.cache[cache_key]
                    if (self._is_entry_active(entry) and 
                        self._check_scopes(entry, matching_scopes) and
                        self._check_context(entry, context)):
                        return entry
                
                # 检查存储
                entry = self.storage.find_entry(value, level)
                if (entry and self._is_entry_active(entry) and 
                    self._check_scopes(entry, matching_scopes) and
                    self._check_context(entry, context)):
                    self._update_cache(entry)
                    return entry
            
            return None
            
        except Exception as e:
            print(f"检查范围名单条目失败: {e}")
            return None
    
    def _check_scopes(self, entry: BaseListEntry, 
                     matching_scopes: List[ScopeDefinition]) -> bool:
        """检查范围匹配"""
        entry_scopes = entry.metadata.get('scopes', [])
        if not entry_scopes:
            # 无范围限制，默认全局生效
            return True
        
        # 检查是否有匹配的范围
        for entry_scope_dict in entry_scopes:
            entry_scope = self._dict_to_scope(entry_scope_dict)
            for matching_scope in matching_scopes:
                if self._scopes_match(entry_scope, matching_scope):
                    return True
        
        return False
    
    def _scopes_match(self, scope1: ScopeDefinition, 
                     scope2: ScopeDefinition) -> bool:
        """检查两个范围是否匹配"""
        if scope1.scope_type != scope2.scope_type:
            return False
        
        if scope1.scope_type == ScopeType.GLOBAL:
            return True
        elif scope1.scope_type == ScopeType.BUSINESS:
            return scope1.scope_value == scope2.scope_value
        elif scope1.scope_type == ScopeType.REGION:
            return scope1.scope_value == scope2.scope_value
        # 其他类型的匹配逻辑可以继续扩展
        
        return False
    
    def _scope_to_dict(self, scope: ScopeDefinition) -> Dict[str, Any]:
        """范围转字典"""
        return {
            'scope_type': scope.scope_type.value,
            'scope_value': scope.scope_value,
            'priority': scope.priority,
            'conditions': scope.conditions,
            'metadata': scope.metadata
        }
    
    def _dict_to_scope(self, scope_dict: Dict[str, Any]) -> ScopeDefinition:
        """字典转范围"""
        return ScopeDefinition(
            scope_type=ScopeType(scope_dict['scope_type']),
            scope_value=scope_dict['scope_value'],
            priority=scope_dict['priority'],
            conditions=scope_dict['conditions'],
            metadata=scope_dict['metadata']
        )
    
    def _validate_entry(self, entry: BaseListEntry) -> bool:
        """验证名单条目"""
        # 复用之前的验证逻辑
        if not entry.value or not entry.reason or not entry.source:
            return False
        
        if entry.expire_at <= entry.effective_at:
            return False
        
        if not isinstance(entry.level, ListLevel):
            return False
        
        level_config = self.level_manager.get_level_config(entry.level)
        current_count = self.storage.get_entry_count(entry.level)
        if current_count >= level_config.max_entries:
            return False
        
        return True
    
    def _is_entry_active(self, entry: BaseListEntry) -> bool:
        """检查条目是否活跃"""
        now = datetime.now()
        return entry.effective_at <= now <= entry.expire_at and entry.status == "active"
    
    def _check_context(self, entry: BaseListEntry, context: Dict[str, Any] = None) -> bool:
        """检查上下文条件"""
        # 复用之前的上下文检查逻辑
        if not context or not entry.metadata.get('conditions'):
            return True
        
        conditions = entry.metadata.get('conditions', [])
        for condition in conditions:
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            if field not in context:
                return False
            
            context_value = context[field]
            
            if operator == "==":
                if context_value != value:
                    return False
            elif operator == "!=":
                if context_value == value:
                    return False
            elif operator == ">":
                if not isinstance(context_value, (int, float)) or context_value <= value:
                    return False
            elif operator == "<":
                if not isinstance(context_value, (int, float)) or context_value >= value:
                    return False
            elif operator == "in":
                if not isinstance(value, list) or context_value not in value:
                    return False
        
        return True
    
    def _update_cache(self, entry: BaseListEntry):
        """更新缓存"""
        cache_key = f"{entry.level.value}:{entry.value}"
        self.cache[cache_key] = entry
        
        if len(self.cache) > 100000:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
    
    def _log_operation(self, operation: str, entry: BaseListEntry):
        """记录操作日志"""
        log_entry = {
            'operation': operation,
            'entry_id': entry.id,
            'level': entry.level.value,
            'value': entry.value,
            'operator': entry.operator,
            'timestamp': datetime.now().isoformat()
        }
        print(f"范围名单操作日志: {log_entry}")

# 使用示例
def example_scope_aware_service():
    """范围感知名单服务示例"""
    # 初始化管理器
    level_manager = ListLevelManager()
    scope_manager = ScopeManager()
    
    # 添加范围定义
    # 全局范围
    global_scope = ScopeDefinition(
        scope_type=ScopeType.GLOBAL,
        scope_value="global",
        priority=100,
        conditions=[],
        metadata={}
    )
    scope_manager.add_scope("global_scope", global_scope)
    
    # 支付业务范围
    payment_scope = ScopeDefinition(
        scope_type=ScopeType.BUSINESS,
        scope_value="payment",
        priority=80,
        conditions=[],
        metadata={}
    )
    scope_manager.add_scope("payment_scope", payment_scope)
    
    # 华北地区范围
    north_region_scope = ScopeDefinition(
        scope_type=ScopeType.REGION,
        scope_value="north_china",
        priority=60,
        conditions=[],
        metadata={}
    )
    scope_manager.add_scope("north_region_scope", north_region_scope)
    
    # 初始化服务
    storage = MockListStorage()
    scoped_service = ScopeAwareListService(level_manager, scope_manager, storage)
    
    # 创建范围名单条目
    entry = BaseListEntry(
        id=f"entry_{uuid.uuid4().hex}",
        value="scoped_user_456",
        level=ListLevel.HIGH,
        reason="支付业务高风险用户",
        source="风控系统",
        operator="risk_manager",
        created_at=datetime.now(),
        effective_at=datetime.now(),
        expire_at=datetime.now() + timedelta(days=90),
        status="active",
        metadata={"risk_type": "transaction_fraud"}
    )
    
    # 添加范围
    scopes = [payment_scope, north_region_scope]
    
    # 添加范围名单条目
    result = scoped_service.add_scoped_entry(entry, scopes)
    print(f"添加范围名单条目结果: {result}")
    
    # 检查名单（匹配支付业务和华北地区）
    context = {
        'business': 'payment',
        'region': 'north_china',
        'user_id': 'scoped_user_456'
    }
    
    check_result = scoped_service.check_scoped_entry("scoped_user_456", context)
    print(f"范围名单检查结果: {check_result is not None}")
    
    # 检查名单（不匹配业务）
    context2 = {
        'business': 'loan',
        'region': 'north_china',
        'user_id': 'scoped_user_456'
    }
    
    check_result2 = scoped_service.check_scoped_entry("scoped_user_456", context2)
    print(f"不匹配业务的检查结果: {check_result2 is not None}")
```

## 三、全局名单管理

### 3.1 全局名单概述

全局名单是指在整个风控平台范围内生效的名单，具有最高的影响范围和最重要的业务价值。全局名单通常用于管理最核心的风险实体，需要严格的安全控制和高效的访问性能。

#### 3.1.1 全局名单特性

**核心特征**：
1. **全局生效**：在所有业务场景下都生效
2. **高优先级**：具有最高的匹配优先级
3. **严格管控**：需要严格的审批和审计流程
4. **高性能**：需要毫秒级的匹配响应

**业务价值**：
- **统一风控**：确保全平台风控标准的一致性
- **核心保护**：保护平台最核心的业务资产
- **快速响应**：对紧急风险事件快速响应
- **合规保障**：满足监管要求和合规标准

#### 3.1.2 全局名单实现

**全局名单服务**：
```python
# 全局名单服务
import threading
import time
from concurrent.futures import ThreadPoolExecutor

class GlobalListService:
    """全局名单服务"""
    
    def __init__(self, storage_backend, cache_backend=None):
        self.storage = storage_backend
        self.cache = cache_backend or {}
        self.sync_lock = threading.Lock()
        self.sync_interval = 1  # 同步间隔（秒）
        self.is_syncing = False
        self.sync_thread = None
        self._start_sync_thread()
    
    def _start_sync_thread(self):
        """启动同步线程"""
        def sync_loop():
            while True:
                try:
                    if not self.is_syncing:
                        self._sync_global_lists()
                    time.sleep(self.sync_interval)
                except Exception as e:
                    print(f"全局名单同步失败: {e}")
                    time.sleep(60)  # 失败后等待1分钟重试
        
        self.sync_thread = threading.Thread(target=sync_loop, daemon=True)
        self.sync_thread.start()
    
    def _sync_global_lists(self):
        """同步全局名单"""
        with self.sync_lock:
            self.is_syncing = True
            try:
                # 获取最新的全局名单
                global_entries = self.storage.get_global_entries()
                
                # 更新缓存
                new_cache = {}
                for entry in global_entries:
                    if self._is_entry_active(entry):
                        cache_key = f"global:{entry.value}"
                        new_cache[cache_key] = entry
                
                self.cache = new_cache
                
                print(f"全局名单同步完成，条目数: {len(global_entries)}")
            except Exception as e:
                print(f"全局名单同步异常: {e}")
            finally:
                self.is_syncing = False
    
    def add_global_entry(self, entry: BaseListEntry) -> Dict[str, Any]:
        """
        添加全局名单条目
        
        Args:
            entry: 名单条目
            
        Returns:
            添加结果
        """
        try:
            # 验证条目
            if not self._validate_global_entry(entry):
                return {
                    'success': False,
                    'message': '全局名单条目验证失败'
                }
            
            # 设置为全局范围
            entry.metadata['scope'] = 'global'
            
            # 保存到存储
            success = self.storage.save_global_entry(entry)
            if success:
                # 立即更新缓存
                cache_key = f"global:{entry.value}"
                self.cache[cache_key] = entry
                
                self._log_operation("add_global", entry)
                
                return {
                    'success': True,
                    'message': '全局名单添加成功',
                    'entry_id': entry.id
                }
            else:
                return {
                    'success': False,
                    'message': '存储失败'
                }
                
        except Exception as e:
            print(f"添加全局名单条目失败: {e}")
            return {
                'success': False,
                'message': f'添加失败: {str(e)}'
            }
    
    def remove_global_entry(self, entry_id: str) -> Dict[str, Any]:
        """
        移除全局名单条目
        
        Args:
            entry_id: 条目ID
            
        Returns:
            移除结果
        """
        try:
            # 获取原始条目
            entry = self.storage.get_entry(entry_id)
            if not entry:
                return {
                    'success': False,
                    'message': '条目不存在'
                }
            
            # 从存储删除
            success = self.storage.delete_global_entry(entry_id)
            if success:
                # 从缓存删除
                cache_key = f"global:{entry.value}"
                if cache_key in self.cache:
                    del self.cache[cache_key]
                
                self._log_operation("remove_global", entry)
                
                return {
                    'success': True,
                    'message': '全局名单移除成功'
                }
            else:
                return {
                    'success': False,
                    'message': '删除失败'
                }
                
        except Exception as e:
            print(f"移除全局名单条目失败: {e}")
            return {
                'success': False,
                'message': f'移除失败: {str(e)}'
            }
    
    def check_global_entry(self, value: str) -> Optional[BaseListEntry]:
        """
        检查全局名单条目
        
        Args:
            value: 检查值
            
        Returns:
            匹配的名单条目
        """
        try:
            # 先检查缓存
            cache_key = f"global:{value}"
            if cache_key in self.cache:
                entry = self.cache[cache_key]
                if self._is_entry_active(entry):
                    return entry
                else:
                    # 过期则从缓存删除
                    del self.cache[cache_key]
            
            # 从存储查询
            entry = self.storage.find_global_entry(value)
            if entry and self._is_entry_active(entry):
                # 更新缓存
                self.cache[cache_key] = entry
                return entry
            
            return None
            
        except Exception as e:
            print(f"检查全局名单条目失败: {e}")
            return None
    
    def batch_check_global_entries(self, values: List[str]) -> Dict[str, Optional[BaseListEntry]]:
        """
        批量检查全局名单条目
        
        Args:
            values: 检查值列表
            
        Returns:
            检查结果字典
        """
        try:
            results = {}
            
            # 先从缓存查找
            cache_misses = []
            for value in values:
                cache_key = f"global:{value}"
                if cache_key in self.cache:
                    entry = self.cache[cache_key]
                    if self._is_entry_active(entry):
                        results[value] = entry
                    else:
                        del self.cache[cache_key]
                        cache_misses.append(value)
                else:
                    cache_misses.append(value)
            
            # 从存储批量查询缓存未命中的
            if cache_misses:
                storage_results = self.storage.batch_find_global_entries(cache_misses)
                for value, entry in storage_results.items():
                    if entry and self._is_entry_active(entry):
                        results[value] = entry
                        # 更新缓存
                        cache_key = f"global:{value}"
                        self.cache[cache_key] = entry
                    else:
                        results[value] = None
            
            # 处理未查询到的值
            for value in values:
                if value not in results:
                    results[value] = None
            
            return results
            
        except Exception as e:
            print(f"批量检查全局名单条目失败: {e}")
            return {value: None for value in values}
    
    def get_global_statistics(self) -> Dict[str, Any]:
        """
        获取全局名单统计信息
        
        Returns:
            统计信息
        """
        try:
            # 从存储获取统计
            storage_stats = self.storage.get_global_statistics()
            
            # 添加缓存信息
            cache_stats = {
                'cache_size': len(self.cache),
                'cache_hit_rate': self._calculate_cache_hit_rate()
            }
            
            # 合并统计信息
            stats = {**storage_stats, **cache_stats}
            return stats
            
        except Exception as e:
            print(f"获取全局名单统计失败: {e}")
            return {}
    
    def _validate_global_entry(self, entry: BaseListEntry) -> bool:
        """验证全局名单条目"""
        # 全局名单条目需要更高的标准
        if not entry.value or not entry.reason or not entry.source:
            return False
        
        # 全局名单条目必须是关键级或高级
        if entry.level not in [ListLevel.CRITICAL, ListLevel.HIGH]:
            return False
        
        # 检查时间有效性
        if entry.expire_at <= entry.effective_at:
            return False
        
        # 检查条目数量限制（全局名单通常有更严格的限制）
        current_count = self.storage.get_global_entry_count()
        if current_count >= 100000:  # 全局名单限制10万条
            return False
        
        return True
    
    def _is_entry_active(self, entry: BaseListEntry) -> bool:
        """检查条目是否活跃"""
        now = datetime.now()
        return entry.effective_at <= now <= entry.expire_at and entry.status == "active"
    
    def _calculate_cache_hit_rate(self) -> float:
        """计算缓存命中率（简化实现）"""
        # 实际实现应该跟踪缓存命中和未命中的次数
        return 0.95  # 假设95%的命中率
    
    def _log_operation(self, operation: str, entry: BaseListEntry):
        """记录操作日志"""
        log_entry = {
            'operation': operation,
            'entry_id': entry.id,
            'value': entry.value,
            'level': entry.level.value,
            'operator': entry.operator,
            'timestamp': datetime.now().isoformat()
        }
        print(f"全局名单操作日志: {log_entry}")

# 全局名单存储接口
class GlobalListStorage:
    """全局名单存储接口"""
    
    def save_global_entry(self, entry: BaseListEntry) -> bool:
        raise NotImplementedError
    
    def get_global_entry(self, entry_id: str) -> Optional[BaseListEntry]:
        raise NotImplementedError
    
    def find_global_entry(self, value: str) -> Optional[BaseListEntry]:
        raise NotImplementedError
    
    def batch_find_global_entries(self, values: List[str]) -> Dict[str, Optional[BaseListEntry]]:
        raise NotImplementedError
    
    def delete_global_entry(self, entry_id: str) -> bool:
        raise NotImplementedError
    
    def get_global_entries(self) -> List[BaseListEntry]:
        raise NotImplementedError
    
    def get_global_entry_count(self) -> int:
        raise NotImplementedError
    
    def get_global_statistics(self) -> Dict[str, Any]:
        raise NotImplementedError

# Redis全局名单存储实现
class RedisGlobalListStorage(GlobalListStorage):
    """基于Redis的全局名单存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=12,
            decode_responses=True
        )
        self._initialize_indexes()
    
    def _initialize_indexes(self):
        """初始化索引"""
        # 确保必要的索引存在
        pass
    
    def save_global_entry(self, entry: BaseListEntry) -> bool:
        try:
            # 序列化条目
            entry_dict = {
                'id': entry.id,
                'value': entry.value,
                'level': entry.level.value,
                'reason': entry.reason,
                'source': entry.source,
                'operator': entry.operator,
                'created_at': entry.created_at.isoformat(),
                'effective_at': entry.effective_at.isoformat(),
                'expire_at': entry.expire_at.isoformat(),
                'status': entry.status,
                'metadata': json.dumps(entry.metadata)
            }
            
            # 保存条目数据
            entry_key = f"global_list:entry:{entry.id}"
            self.redis.hset(entry_key, mapping=entry_dict)
            
            # 添加到全局索引
            global_index_key = f"global_list:index:global:{entry.value}"
            self.redis.set(global_index_key, entry.id)
            
            # 添加到列表
            list_key = "global_list:all_entries"
            self.redis.sadd(list_key, entry.id)
            
            # 设置过期时间
            ttl = int((entry.expire_at - datetime.now()).total_seconds())
            if ttl > 0:
                self.redis.expire(entry_key, ttl)
                self.redis.expire(global_index_key, ttl)
            
            return True
        except Exception as e:
            print(f"保存全局名单条目失败: {e}")
            return False
    
    def get_global_entry(self, entry_id: str) -> Optional[BaseListEntry]:
        try:
            entry_key = f"global_list:entry:{entry_id}"
            entry_data = self.redis.hgetall(entry_key)
            
            if not entry_data:
                return None
            
            return BaseListEntry(
                id=entry_data['id'],
                value=entry_data['value'],
                level=ListLevel(entry_data['level']),
                reason=entry_data['reason'],
                source=entry_data['source'],
                operator=entry_data['operator'],
                created_at=datetime.fromisoformat(entry_data['created_at']),
                effective_at=datetime.fromisoformat(entry_data['effective_at']),
                expire_at=datetime.fromisoformat(entry_data['expire_at']),
                status=entry_data['status'],
                metadata=json.loads(entry_data['metadata'])
            )
        except Exception as e:
            print(f"获取全局名单条目失败: {e}")
            return None
    
    def find_global_entry(self, value: str) -> Optional[BaseListEntry]:
        try:
            global_index_key = f"global_list:index:global:{value}"
            entry_id = self.redis.get(global_index_key)
            
            if not entry_id:
                return None
            
            return self.get_global_entry(entry_id)
        except Exception as e:
            print(f"查找全局名单条目失败: {e}")
            return None
    
    def batch_find_global_entries(self, values: List[str]) -> Dict[str, Optional[BaseListEntry]]:
        try:
            # 批量获取条目ID
            index_keys = [f"global_list:index:global:{value}" for value in values]
            entry_ids = self.redis.mget(index_keys)
            
            # 批量获取条目数据
            results = {}
            for value, entry_id in zip(values, entry_ids):
                if entry_id:
                    entry = self.get_global_entry(entry_id)
                    results[value] = entry
                else:
                    results[value] = None
            
            return results
        except Exception as e:
            print(f"批量查找全局名单条目失败: {e}")
            return {value: None for value in values}
    
    def delete_global_entry(self, entry_id: str) -> bool:
        try:
            entry = self.get_global_entry(entry_id)
            if not entry:
                return False
            
            entry_key = f"global_list:entry:{entry_id}"
            global_index_key = f"global_list:index:global:{entry.value}"
            list_key = "global_list:all_entries"
            
            # 删除所有相关键
            self.redis.delete(entry_key)
            self.redis.delete(global_index_key)
            self.redis.srem(list_key, entry_id)
            
            return True
        except Exception as e:
            print(f"删除全局名单条目失败: {e}")
            return False
    
    def get_global_entries(self) -> List[BaseListEntry]:
        try:
            list_key = "global_list:all_entries"
            entry_ids = self.redis.smembers(list_key)
            
            entries = []
            for entry_id in entry_ids:
                entry = self.get_global_entry(entry_id)
                if entry:
                    entries.append(entry)
            
            return entries
        except Exception as e:
            print(f"获取全局名单条目列表失败: {e}")
            return []
    
    def get_global_entry_count(self) -> int:
        try:
            list_key = "global_list:all_entries"
            return self.redis.scard(list_key)
        except Exception as e:
            print(f"获取全局名单条目数量失败: {e}")
            return 0
    
    def get_global_statistics(self) -> Dict[str, Any]:
        try:
            total_count = self.get_global_entry_count()
            
            # 获取各等级统计
            level_stats = {}
            entries = self.get_global_entries()
            for entry in entries:
                level = entry.level.value
                level_stats[level] = level_stats.get(level, 0) + 1
            
            # 获取近期添加统计
            recent_count = 0
            for entry in entries:
                if entry.created_at >= datetime.now() - timedelta(days=1):
                    recent_count += 1
            
            return {
                'total_entries': total_count,
                'level_distribution': level_stats,
                'recently_added': recent_count,
                'storage_type': 'redis'
            }
        except Exception as e:
            print(f"获取全局名单统计失败: {e}")
            return {}

# 全局名单管理器
class GlobalListManager:
    """全局名单管理器"""
    
    def __init__(self, global_service: GlobalListService):
        self.global_service = global_service
        self.emergency_service = EmergencyListService(global_service)
    
    def create_emergency_block(self, value: str, reason: str, 
                            duration_minutes: int = 60) -> Dict[str, Any]:
        """
        创建紧急全局拦截
        
        Args:
            value: 拦截值
            reason: 拦截原因
            duration_minutes: 持续时间（分钟）
            
        Returns:
            创建结果
        """
        return self.emergency_service.create_emergency_block(
            value, reason, duration_minutes
        )
    
    def get_global_list_report(self) -> Dict[str, Any]:
        """
        获取全局名单报告
        
        Returns:
            报告信息
        """
        try:
            # 获取统计信息
            stats = self.global_service.get_global_statistics()
            
            # 获取最近添加的条目
            recent_entries = self._get_recent_entries(24)  # 最近24小时
            
            # 获取高风险条目
            high_risk_entries = self._get_high_risk_entries()
            
            return {
                'statistics': stats,
                'recent_entries': recent_entries,
                'high_risk_entries': high_risk_entries,
                'generated_at': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"生成全局名单报告失败: {e}")
            return {}
    
    def _get_recent_entries(self, hours: int) -> List[Dict[str, Any]]:
        """获取最近添加的条目"""
        try:
            entries = self.global_service.storage.get_global_entries()
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            recent_entries = []
            for entry in entries:
                if entry.created_at >= cutoff_time:
                    recent_entries.append({
                        'id': entry.id,
                        'value': entry.value,
                        'level': entry.level.value,
                        'reason': entry.reason,
                        'created_at': entry.created_at.isoformat(),
                        'operator': entry.operator
                    })
            
            # 按创建时间排序
            recent_entries.sort(key=lambda x: x['created_at'], reverse=True)
            return recent_entries[:50]  # 最多返回50条
        except Exception as e:
            print(f"获取最近条目失败: {e}")
            return []
    
    def _get_high_risk_entries(self) -> List[Dict[str, Any]]:
        """获取高风险条目"""
        try:
            entries = self.global_service.storage.get_global_entries()
            
            high_risk_entries = []
            for entry in entries:
                if entry.level in [ListLevel.CRITICAL, ListLevel.HIGH]:
                    high_risk_entries.append({
                        'id': entry.id,
                        'value': entry.value,
                        'level': entry.level.value,
                        'reason': entry.reason,
                        'created_at': entry.created_at.isoformat(),
                        'expire_at': entry.expire_at.isoformat()
                    })
            
            # 按等级和创建时间排序
            high_risk_entries.sort(
                key=lambda x: (x['level'], x['created_at']), 
                reverse=True
            )
            return high_risk_entries[:100]  # 最多返回100条
        except Exception as e:
            print(f"获取高风险条目失败: {e}")
            return []

# 紧急名单服务
class EmergencyListService:
    """紧急名单服务"""
    
    def __init__(self, global_service: GlobalListService):
        self.global_service = global_service
    
    def create_emergency_block(self, value: str, reason: str, 
                            duration_minutes: int = 60) -> Dict[str, Any]:
        """
        创建紧急全局拦截
        
        Args:
            value: 拦截值
            reason: 拦截原因
            duration_minutes: 持续时间（分钟）
            
        Returns:
            创建结果
        """
        try:
            entry = BaseListEntry(
                id=f"emergency_{int(datetime.now().timestamp())}_{hash(value) % 10000}",
                value=value,
                level=ListLevel.CRITICAL,  # 紧急条目为关键级
                reason=f"[紧急] {reason}",
                source="emergency_service",
                operator="system",
                created_at=datetime.now(),
                effective_at=datetime.now(),
                expire_at=datetime.now() + timedelta(minutes=duration_minutes),
                status="active",
                metadata={
                    "emergency": True,
                    "duration_minutes": duration_minutes,
                    "created_by": "emergency_service"
                }
            )
            
            # 紧急条目直接添加，无需审批
            result = self.global_service.add_global_entry(entry)
            return result
            
        except Exception as e:
            print(f"创建紧急拦截失败: {e}")
            return {
                'success': False,
                'message': f'创建紧急拦截失败: {str(e)}'
            }

# 使用示例
def example_global_list_service():
    """全局名单服务示例"""
    # 初始化存储
    redis_client = redis.Redis(host='localhost', port=6379, db=12, decode_responses=True)
    storage = RedisGlobalListStorage(redis_client)
    
    # 初始化服务
    global_service = GlobalListService(storage)
    manager = GlobalListManager(global_service)
    
    # 添加全局名单条目
    entry = BaseListEntry(
        id=f"global_{uuid.uuid4().hex}",
        value="global_risk_user_123",
        level=ListLevel.HIGH,
        reason="全局高风险用户",
        source="安全审计",
        operator="security_admin",
        created_at=datetime.now(),
        effective_at=datetime.now(),
        expire_at=datetime.now() + timedelta(days=180),
        status="active",
        metadata={"risk_category": "fraud", "evidence": "多笔异常交易"}
    )
    
    # 添加全局名单条目
    add_result = global_service.add_global_entry(entry)
    print(f"添加全局名单结果: {add_result}")
    
    # 检查全局名单
    check_result = global_service.check_global_entry("global_risk_user_123")
    print(f"全局名单检查结果: {check_result is not None}")
    
    # 批量检查
    batch_values = ["global_risk_user_123", "normal_user_456", "another_risk_user_789"]
    batch_result = global_service.batch_check_global_entries(batch_values)
    print(f"批量检查结果: {len([v for v in batch_result.values() if v is not None])} 个匹配")
    
    # 获取统计信息
    stats = global_service.get_global_statistics()
    print(f"全局名单统计: {stats}")
    
    # 创建紧急拦截
    emergency_result = manager.create_emergency_block(
        "suspicious_user_999",
        "检测到紧急风险行为",
        duration_minutes=30
    )
    print(f"紧急拦截创建结果: {emergency_result}")
    
    # 获取全局名单报告
    report = manager.get_global_list_report()
    print(f"全局名单报告生成: {report is not None}")

if __name__ == "__main__":
    example_global_list_service()