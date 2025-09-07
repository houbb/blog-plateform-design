---
title: "名单类型: 黑名单、白名单、灰名单、临时名单"
date: 2025-09-07
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 名单类型：黑名单、白名单、灰名单、临时名单

## 引言

在企业级智能风控平台中，名单服务是风险控制的重要手段之一。通过对用户、设备、IP地址等实体进行分类管理，名单服务能够实现精准的风险识别和控制。不同类型的名单具有不同的特性和应用场景，合理运用各种名单类型能够有效提升风控系统的灵活性和准确性。

本文将深入探讨风控平台中常见的名单类型，包括黑名单、白名单、灰名单和临时名单，分析各自的特性和应用场景，为构建完善的名单管理体系提供指导。

## 一、名单服务概述

### 1.1 名单服务的重要性

名单服务作为风控平台的核心组件之一，在风险控制中发挥着重要作用。通过建立和维护各类名单，风控系统能够快速识别和响应风险事件，实现自动化风险控制。

#### 1.1.1 业务价值

**风险识别**：
1. **快速识别**：通过名单匹配快速识别高风险实体
2. **精准控制**：针对不同风险等级采取相应控制措施
3. **自动化处理**：减少人工干预，提高处理效率
4. **历史追溯**：记录风险实体历史行为，支持分析决策

**运营效率**：
1. **降低人工成本**：自动化名单匹配减少人工审核
2. **提升响应速度**：实时名单匹配提高风险响应速度
3. **统一管理**：集中管理各类名单，便于维护和更新
4. **灵活配置**：支持动态调整名单策略

#### 1.1.2 技术特点

**高性能匹配**：
- 支持海量名单数据的快速匹配
- 优化的存储结构和索引机制
- 分布式架构支持高并发访问
- 缓存机制提升访问性能

**灵活管理**：
- 支持多种名单类型和格式
- 提供完善的增删改查接口
- 支持批量操作和定时任务
- 完善的权限控制和审计日志

### 1.2 名单服务架构

#### 1.2.1 技术架构设计

```
+---------------------+
|     应用层          |
|  (业务系统调用)     |
+---------------------+
         |
         v
+---------------------+
|     接入层          |
|  (API网关/负载均衡) |
+---------------------+
         |
         v
+---------------------+
|     服务层          |
|  (名单匹配服务)     |
+---------------------+
         |
    +----+----+
    |         |
    v         v
+-----+   +-----+
|读服务|   |写服务|
+-----+   +-----+
         |
         v
+---------------------+
|     存储层          |
| (Redis/数据库)      |
+---------------------+
         |
         v
+---------------------+
|     数据源层        |
| (人工录入/自动产出) |
+---------------------+
```

#### 1.2.2 核心组件

**名单存储**：
- **Redis集群**：高性能缓存存储，支持快速匹配
- **关系数据库**：持久化存储，支持复杂查询
- **分布式文件系统**：大名单文件存储
- **搜索引擎**：支持全文检索和模糊匹配

**名单管理**：
- **名单录入**：支持多种录入方式
- **名单更新**：支持增量更新和全量更新
- **名单删除**：支持精确删除和批量删除
- **名单查询**：支持多种查询条件

**名单匹配**：
- **实时匹配**：支持毫秒级匹配响应
- **批量匹配**：支持大批量数据匹配
- **模糊匹配**：支持模式匹配和近似匹配
- **组合匹配**：支持多名单组合匹配

## 二、黑名单管理

### 2.1 黑名单概述

黑名单是风控系统中最常用的名单类型，用于标识已知的高风险实体。一旦实体被列入黑名单，系统将对其采取严格的控制措施。

#### 2.1.1 黑名单特性

**核心特征**：
1. **严格性**：被列入黑名单的实体通常会被直接拦截或拒绝
2. **持久性**：黑名单记录通常具有较长的有效期
3. **权威性**：黑名单的添加通常需要严格的审核流程
4. **影响性**：对被列入黑名单的实体会产生直接影响

**业务场景**：
- **欺诈用户**：识别和拦截已知的欺诈用户
- **恶意设备**：识别和拦截恶意设备或模拟器
- **黑产IP**：拦截已知的黑产IP地址
- **违规内容**：屏蔽发布违规内容的用户

#### 2.1.2 黑名单实现

**数据结构设计**：
```python
# 黑名单数据模型
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class BlacklistType(Enum):
    """黑名单类型"""
    USER = "user"           # 用户黑名单
    DEVICE = "device"       # 设备黑名单
    IP = "ip"              # IP地址黑名单
    CONTENT = "content"    # 内容黑名单
    MERCHANT = "merchant"  # 商户黑名单
    ACCOUNT = "account"    # 账户黑名单

@dataclass
class BlacklistEntry:
    """黑名单条目"""
    id: str
    type: BlacklistType
    value: str           # 黑名单值（用户ID、IP地址等）
    reason: str          # 加入原因
    source: str          # 来源（人工、规则、模型等）
    operator: str        # 操作人
    created_at: datetime
    updated_at: datetime
    effective_at: datetime   # 生效时间
    expire_at: Optional[datetime]  # 过期时间
    status: str          # 状态（active、inactive、expired）
    metadata: Dict[str, Any]  # 扩展信息

class BlacklistService:
    """黑名单服务"""
    
    def __init__(self, storage_backend):
        self.storage = storage_backend
        self.cache = {}  # 本地缓存
    
    def add_to_blacklist(self, entry: BlacklistEntry) -> bool:
        """
        添加到黑名单
        
        Args:
            entry: 黑名单条目
            
        Returns:
            添加是否成功
        """
        try:
            # 验证条目有效性
            if not self._validate_entry(entry):
                return False
            
            # 保存到存储
            success = self.storage.save_blacklist_entry(entry)
            if success:
                # 更新缓存
                self._update_cache(entry)
                # 记录操作日志
                self._log_operation("add", entry)
            
            return success
        except Exception as e:
            print(f"添加黑名单失败: {e}")
            return False
    
    def remove_from_blacklist(self, entry_id: str) -> bool:
        """
        从黑名单移除
        
        Args:
            entry_id: 条目ID
            
        Returns:
            移除是否成功
        """
        try:
            # 获取原条目
            old_entry = self.storage.get_blacklist_entry(entry_id)
            if not old_entry:
                return False
            
            # 更新状态为inactive
            old_entry.status = "inactive"
            old_entry.updated_at = datetime.now()
            
            # 保存更新
            success = self.storage.update_blacklist_entry(old_entry)
            if success:
                # 更新缓存
                self._invalidate_cache(old_entry)
                # 记录操作日志
                self._log_operation("remove", old_entry)
            
            return success
        except Exception as e:
            print(f"移除黑名单失败: {e}")
            return False
    
    def check_blacklist(self, value: str, entry_type: BlacklistType) -> Optional[BlacklistEntry]:
        """
        检查是否在黑名单中
        
        Args:
            value: 检查值
            entry_type: 条目类型
            
        Returns:
            黑名单条目，如果不在黑名单中则返回None
        """
        try:
            # 先检查缓存
            cache_key = f"{entry_type.value}:{value}"
            if cache_key in self.cache:
                entry = self.cache[cache_key]
                # 检查是否过期
                if not entry.expire_at or entry.expire_at > datetime.now():
                    return entry if entry.status == "active" else None
                else:
                    # 过期则从缓存移除
                    del self.cache[cache_key]
            
            # 从存储查询
            entry = self.storage.find_blacklist_entry(value, entry_type)
            if entry and entry.status == "active":
                # 检查是否过期
                if not entry.expire_at or entry.expire_at > datetime.now():
                    # 更新缓存
                    self._update_cache(entry)
                    return entry
            
            return None
        except Exception as e:
            print(f"检查黑名单失败: {e}")
            return None
    
    def batch_check_blacklist(self, values: List[str], 
                            entry_type: BlacklistType) -> Dict[str, Optional[BlacklistEntry]]:
        """
        批量检查黑名单
        
        Args:
            values: 检查值列表
            entry_type: 条目类型
            
        Returns:
            检查结果字典
        """
        results = {}
        
        # 先从缓存查找
        cache_misses = []
        for value in values:
            cache_key = f"{entry_type.value}:{value}"
            if cache_key in self.cache:
                entry = self.cache[cache_key]
                if not entry.expire_at or entry.expire_at > datetime.now():
                    results[value] = entry if entry.status == "active" else None
                else:
                    del self.cache[cache_key]
                    cache_misses.append(value)
            else:
                cache_misses.append(value)
        
        # 从存储批量查询缓存未命中的
        if cache_misses:
            storage_results = self.storage.batch_find_blacklist_entries(cache_misses, entry_type)
            for value, entry in storage_results.items():
                if entry and entry.status == "active":
                    if not entry.expire_at or entry.expire_at > datetime.now():
                        results[value] = entry
                        # 更新缓存
                        self._update_cache(entry)
                else:
                    results[value] = None
        
        # 处理未查询到的值
        for value in values:
            if value not in results:
                results[value] = None
        
        return results
    
    def _validate_entry(self, entry: BlacklistEntry) -> bool:
        """验证黑名单条目"""
        # 检查必填字段
        if not entry.value or not entry.reason or not entry.source:
            return False
        
        # 检查时间有效性
        if entry.expire_at and entry.expire_at <= entry.effective_at:
            return False
        
        # 检查类型有效性
        if not isinstance(entry.type, BlacklistType):
            return False
        
        return True
    
    def _update_cache(self, entry: BlacklistEntry):
        """更新缓存"""
        cache_key = f"{entry.type.value}:{entry.value}"
        self.cache[cache_key] = entry
        
        # 限制缓存大小
        if len(self.cache) > 10000:
            # 移除最旧的条目
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
    
    def _invalidate_cache(self, entry: BlacklistEntry):
        """使缓存失效"""
        cache_key = f"{entry.type.value}:{entry.value}"
        if cache_key in self.cache:
            del self.cache[cache_key]
    
    def _log_operation(self, operation: str, entry: BlacklistEntry):
        """记录操作日志"""
        log_entry = {
            'operation': operation,
            'entry_id': entry.id,
            'type': entry.type.value,
            'value': entry.value,
            'operator': entry.operator,
            'timestamp': datetime.now().isoformat()
        }
        # 这里应该将日志保存到日志系统
        print(f"黑名单操作日志: {log_entry}")

# 存储接口
class BlacklistStorage:
    """黑名单存储接口"""
    
    def save_blacklist_entry(self, entry: BlacklistEntry) -> bool:
        """保存黑名单条目"""
        raise NotImplementedError
    
    def get_blacklist_entry(self, entry_id: str) -> Optional[BlacklistEntry]:
        """获取黑名单条目"""
        raise NotImplementedError
    
    def update_blacklist_entry(self, entry: BlacklistEntry) -> bool:
        """更新黑名单条目"""
        raise NotImplementedError
    
    def find_blacklist_entry(self, value: str, 
                           entry_type: BlacklistType) -> Optional[BlacklistEntry]:
        """查找黑名单条目"""
        raise NotImplementedError
    
    def batch_find_blacklist_entries(self, values: List[str], 
                                   entry_type: BlacklistType) -> Dict[str, Optional[BlacklistEntry]]:
        """批量查找黑名单条目"""
        raise NotImplementedError

# Redis存储实现
import redis
import json

class RedisBlacklistStorage(BlacklistStorage):
    """基于Redis的黑名单存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=8,
            decode_responses=True
        )
    
    def save_blacklist_entry(self, entry: BlacklistEntry) -> bool:
        try:
            # 序列化条目
            entry_dict = {
                'id': entry.id,
                'type': entry.type.value,
                'value': entry.value,
                'reason': entry.reason,
                'source': entry.source,
                'operator': entry.operator,
                'created_at': entry.created_at.isoformat(),
                'updated_at': entry.updated_at.isoformat(),
                'effective_at': entry.effective_at.isoformat(),
                'expire_at': entry.expire_at.isoformat() if entry.expire_at else None,
                'status': entry.status,
                'metadata': json.dumps(entry.metadata)
            }
            
            # 保存条目数据
            entry_key = f"blacklist:entry:{entry.id}"
            self.redis.hset(entry_key, mapping=entry_dict)
            
            # 添加到索引
            index_key = f"blacklist:index:{entry.type.value}:{entry.value}"
            self.redis.set(index_key, entry.id)
            
            # 添加到列表
            list_key = f"blacklist:list:{entry.type.value}"
            self.redis.sadd(list_key, entry.id)
            
            # 设置过期时间
            if entry.expire_at:
                ttl = int((entry.expire_at - datetime.now()).total_seconds())
                if ttl > 0:
                    self.redis.expire(entry_key, ttl)
                    self.redis.expire(index_key, ttl)
            
            return True
        except Exception as e:
            print(f"保存黑名单条目失败: {e}")
            return False
    
    def get_blacklist_entry(self, entry_id: str) -> Optional[BlacklistEntry]:
        try:
            entry_key = f"blacklist:entry:{entry_id}"
            entry_data = self.redis.hgetall(entry_key)
            
            if not entry_data:
                return None
            
            return BlacklistEntry(
                id=entry_data['id'],
                type=BlacklistType(entry_data['type']),
                value=entry_data['value'],
                reason=entry_data['reason'],
                source=entry_data['source'],
                operator=entry_data['operator'],
                created_at=datetime.fromisoformat(entry_data['created_at']),
                updated_at=datetime.fromisoformat(entry_data['updated_at']),
                effective_at=datetime.fromisoformat(entry_data['effective_at']),
                expire_at=datetime.fromisoformat(entry_data['expire_at']) if entry_data['expire_at'] else None,
                status=entry_data['status'],
                metadata=json.loads(entry_data['metadata'])
            )
        except Exception as e:
            print(f"获取黑名单条目失败: {e}")
            return None
    
    def update_blacklist_entry(self, entry: BlacklistEntry) -> bool:
        return self.save_blacklist_entry(entry)
    
    def find_blacklist_entry(self, value: str, 
                           entry_type: BlacklistType) -> Optional[BlacklistEntry]:
        try:
            index_key = f"blacklist:index:{entry_type.value}:{value}"
            entry_id = self.redis.get(index_key)
            
            if not entry_id:
                return None
            
            return self.get_blacklist_entry(entry_id)
        except Exception as e:
            print(f"查找黑名单条目失败: {e}")
            return None
    
    def batch_find_blacklist_entries(self, values: List[str], 
                                   entry_type: BlacklistType) -> Dict[str, Optional[BlacklistEntry]]:
        results = {}
        
        try:
            # 批量获取条目ID
            index_keys = [f"blacklist:index:{entry_type.value}:{value}" for value in values]
            entry_ids = self.redis.mget(index_keys)
            
            # 批量获取条目数据
            for value, entry_id in zip(values, entry_ids):
                if entry_id:
                    entry = self.get_blacklist_entry(entry_id)
                    results[value] = entry
                else:
                    results[value] = None
            
            return results
        except Exception as e:
            print(f"批量查找黑名单条目失败: {e}")
            return {value: None for value in values}

# 使用示例
def example_blacklist_service():
    """黑名单服务使用示例"""
    # 初始化服务
    redis_client = redis.Redis(host='localhost', port=6379, db=8, decode_responses=True)
    storage = RedisBlacklistStorage(redis_client)
    blacklist_service = BlacklistService(storage)
    
    # 添加黑名单条目
    entry = BlacklistEntry(
        id="bl_123456",
        type=BlacklistType.USER,
        value="user_789",
        reason="多次欺诈行为",
        source="人工审核",
        operator="admin",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        effective_at=datetime.now(),
        expire_at=datetime.now() + timedelta(days=365),
        status="active",
        metadata={"evidence": "交易记录异常", "review_notes": "已核实"}
    )
    
    # 添加到黑名单
    success = blacklist_service.add_to_blacklist(entry)
    print(f"添加黑名单结果: {success}")
    
    # 检查黑名单
    result = blacklist_service.check_blacklist("user_789", BlacklistType.USER)
    print(f"黑名单检查结果: {result is not None}")
    
    # 批量检查
    batch_result = blacklist_service.batch_check_blacklist(
        ["user_789", "user_123", "user_456"], 
        BlacklistType.USER
    )
    print(f"批量检查结果: {batch_result}")
```

### 2.2 黑名单策略管理

#### 2.2.1 分级黑名单

**黑名单分级管理**：
```python
# 分级黑名单管理
from enum import Enum

class BlacklistLevel(Enum):
    """黑名单等级"""
    LOW = "low"        # 低风险
    MEDIUM = "medium"  # 中等风险
    HIGH = "high"      # 高风险
    CRITICAL = "critical"  # 关键风险

class BlacklistRule:
    """黑名单规则"""
    
    def __init__(self, rule_id: str, name: str, description: str,
                 level: BlacklistLevel, action: str, 
                 conditions: List[Dict[str, Any]], 
                 enabled: bool = True):
        self.rule_id = rule_id
        self.name = name
        self.description = description
        self.level = level
        self.action = action  # 拦截动作
        self.conditions = conditions
        self.enabled = enabled
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class BlacklistRuleEngine:
    """黑名单规则引擎"""
    
    def __init__(self):
        self.rules = []
        self._initialize_default_rules()
    
    def _initialize_default_rules(self):
        """初始化默认规则"""
        rules = [
            BlacklistRule(
                rule_id="rule_fraud_user",
                name="欺诈用户识别",
                description="识别已知欺诈用户",
                level=BlacklistLevel.CRITICAL,
                action="block",
                conditions=[
                    {"field": "user_id", "operator": "in_blacklist", "type": "user"},
                    {"field": "risk_score", "operator": ">=", "value": 90}
                ]
            ),
            BlacklistRule(
                rule_id="rule_suspicious_device",
                name="可疑设备识别",
                description="识别可疑设备",
                level=BlacklistLevel.HIGH,
                action="challenge",
                conditions=[
                    {"field": "device_id", "operator": "in_blacklist", "type": "device"},
                    {"field": "device_risk_score", "operator": ">=", "value": 80}
                ]
            ),
            BlacklistRule(
                rule_id="rule_blacklisted_ip",
                name="黑名单IP识别",
                description="识别黑名单IP",
                level=BlacklistLevel.HIGH,
                action="block",
                conditions=[
                    {"field": "ip_address", "operator": "in_blacklist", "type": "ip"}
                ]
            )
        ]
        self.rules.extend(rules)
    
    def evaluate_rules(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        评估规则
        
        Args:
            context: 评估上下文
            
        Returns:
            匹配的规则列表
        """
        matched_rules = []
        
        for rule in self.rules:
            if not rule.enabled:
                continue
            
            if self._evaluate_rule(rule, context):
                matched_rules.append({
                    'rule_id': rule.rule_id,
                    'rule_name': rule.name,
                    'level': rule.level.value,
                    'action': rule.action,
                    'context': context
                })
        
        return matched_rules
    
    def _evaluate_rule(self, rule: BlacklistRule, context: Dict[str, Any]) -> bool:
        """评估单个规则"""
        for condition in rule.conditions:
            field = condition['field']
            operator = condition['operator']
            value = condition.get('value')
            
            if field not in context:
                return False
            
            context_value = context[field]
            
            if operator == "in_blacklist":
                # 检查是否在黑名单中
                blacklist_type = condition.get('type')
                if blacklist_type:
                    # 这里应该调用黑名单服务检查
                    # 简化实现，假设返回False
                    if not self._check_blacklist(context_value, blacklist_type):
                        return False
            elif operator == ">=":
                if not isinstance(context_value, (int, float)) or context_value < value:
                    return False
            elif operator == "<=":
                if not isinstance(context_value, (int, float)) or context_value > value:
                    return False
            elif operator == "==":
                if context_value != value:
                    return False
            elif operator == "!=":
                if context_value == value:
                    return False
        
        return True
    
    def _check_blacklist(self, value: str, blacklist_type: str) -> bool:
        """检查黑名单（简化实现）"""
        # 实际实现应该调用黑名单服务
        return False

# 黑名单统计分析
class BlacklistAnalytics:
    """黑名单统计分析"""
    
    def __init__(self, storage: BlacklistStorage):
        self.storage = storage
    
    def get_statistics(self, days: int = 30) -> Dict[str, Any]:
        """
        获取统计信息
        
        Args:
            days: 统计天数
            
        Returns:
            统计信息
        """
        # 计算时间范围
        end_time = datetime.now()
        start_time = end_time - timedelta(days=days)
        
        # 获取统计数据（简化实现）
        stats = {
            'total_entries': self._get_total_entries(),
            'active_entries': self._get_active_entries(),
            'expired_entries': self._get_expired_entries(),
            'entries_by_type': self._get_entries_by_type(),
            'entries_by_level': self._get_entries_by_level(),
            'daily_trend': self._get_daily_trend(start_time, end_time)
        }
        
        return stats
    
    def _get_total_entries(self) -> int:
        """获取总条目数"""
        # 简化实现
        return 1000
    
    def _get_active_entries(self) -> int:
        """获取活跃条目数"""
        # 简化实现
        return 800
    
    def _get_expired_entries(self) -> int:
        """获取过期条目数"""
        # 简化实现
        return 200
    
    def _get_entries_by_type(self) -> Dict[str, int]:
        """按类型统计条目"""
        # 简化实现
        return {
            'user': 500,
            'device': 300,
            'ip': 200
        }
    
    def _get_entries_by_level(self) -> Dict[str, int]:
        """按等级统计条目"""
        # 简化实现
        return {
            'low': 100,
            'medium': 300,
            'high': 400,
            'critical': 200
        }
    
    def _get_daily_trend(self, start_time: datetime, 
                        end_time: datetime) -> Dict[str, int]:
        """获取每日趋势"""
        # 简化实现
        trend = {}
        current_date = start_time
        while current_date <= end_time:
            date_str = current_date.strftime('%Y-%m-%d')
            trend[date_str] = 10  # 每天新增10个条目
            current_date += timedelta(days=1)
        return trend

# 使用示例
def example_blacklist_analytics():
    """黑名单统计分析示例"""
    # 初始化
    redis_client = redis.Redis(host='localhost', port=6379, db=8, decode_responses=True)
    storage = RedisBlacklistStorage(redis_client)
    analytics = BlacklistAnalytics(storage)
    
    # 获取统计信息
    stats = analytics.get_statistics(30)
    print("黑名单统计信息:")
    print(json.dumps(stats, indent=2, ensure_ascii=False))
```

## 三、白名单管理

### 3.1 白名单概述

白名单是与黑名单相对的概念，用于标识可信的实体。被列入白名单的实体通常会享受更宽松的风控策略，减少误伤风险。

#### 3.1.1 白名单特性

**核心特征**：
1. **信任性**：白名单实体被认为是可信的
2. **优先性**：白名单实体通常享有优先处理权
3. **稳定性**：白名单通常包含长期稳定的可信实体
4. **价值性**：白名单实体通常具有较高的业务价值

**业务场景**：
- **VIP用户**：为重要客户提供更好的服务体验
- **合作伙伴**：为合作伙伴提供便利的业务通道
- **内部员工**：为内部员工提供特殊权限
- **优质商户**：为优质商户提供更宽松的风控策略

#### 3.1.2 白名单实现

**数据结构设计**：
```python
# 白名单数据模型
from enum import Enum

class WhitelistType(Enum):
    """白名单类型"""
    USER = "user"           # 用户白名单
    MERCHANT = "merchant"   # 商户白名单
    PARTNER = "partner"     # 合作伙伴白名单
    EMPLOYEE = "employee"   # 员工白名单
    IP = "ip"              # IP白名单

@dataclass
class WhitelistEntry:
    """白名单条目"""
    id: str
    type: WhitelistType
    value: str           # 白名单值
    reason: str          # 加入原因
    source: str          # 来源
    operator: str        # 操作人
    created_at: datetime
    updated_at: datetime
    effective_at: datetime   # 生效时间
    expire_at: Optional[datetime]  # 过期时间
    status: str          # 状态
    level: str           # 信任等级
    metadata: Dict[str, Any]  # 扩展信息

class WhitelistService:
    """白名单服务"""
    
    def __init__(self, storage_backend):
        self.storage = storage_backend
        self.cache = {}
    
    def add_to_whitelist(self, entry: WhitelistEntry) -> bool:
        """添加到白名单"""
        try:
            if not self._validate_entry(entry):
                return False
            
            success = self.storage.save_whitelist_entry(entry)
            if success:
                self._update_cache(entry)
                self._log_operation("add", entry)
            
            return success
        except Exception as e:
            print(f"添加白名单失败: {e}")
            return False
    
    def remove_from_whitelist(self, entry_id: str) -> bool:
        """从白名单移除"""
        try:
            old_entry = self.storage.get_whitelist_entry(entry_id)
            if not old_entry:
                return False
            
            old_entry.status = "inactive"
            old_entry.updated_at = datetime.now()
            
            success = self.storage.update_whitelist_entry(old_entry)
            if success:
                self._invalidate_cache(old_entry)
                self._log_operation("remove", old_entry)
            
            return success
        except Exception as e:
            print(f"移除白名单失败: {e}")
            return False
    
    def check_whitelist(self, value: str, entry_type: WhitelistType) -> Optional[WhitelistEntry]:
        """检查是否在白名单中"""
        try:
            cache_key = f"{entry_type.value}:{value}"
            if cache_key in self.cache:
                entry = self.cache[cache_key]
                if not entry.expire_at or entry.expire_at > datetime.now():
                    return entry if entry.status == "active" else None
                else:
                    del self.cache[cache_key]
            
            entry = self.storage.find_whitelist_entry(value, entry_type)
            if entry and entry.status == "active":
                if not entry.expire_at or entry.expire_at > datetime.now():
                    self._update_cache(entry)
                    return entry
            
            return None
        except Exception as e:
            print(f"检查白名单失败: {e}")
            return None
    
    def get_trust_level(self, value: str, entry_type: WhitelistType) -> str:
        """获取信任等级"""
        entry = self.check_whitelist(value, entry_type)
        return entry.level if entry else "normal"
    
    def _validate_entry(self, entry: WhitelistEntry) -> bool:
        """验证白名单条目"""
        if not entry.value or not entry.reason or not entry.source:
            return False
        
        if entry.expire_at and entry.expire_at <= entry.effective_at:
            return False
        
        if not isinstance(entry.type, WhitelistType):
            return False
        
        return True
    
    def _update_cache(self, entry: WhitelistEntry):
        """更新缓存"""
        cache_key = f"{entry.type.value}:{entry.value}"
        self.cache[cache_key] = entry
        
        if len(self.cache) > 10000:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
    
    def _invalidate_cache(self, entry: WhitelistEntry):
        """使缓存失效"""
        cache_key = f"{entry.type.value}:{entry.value}"
        if cache_key in self.cache:
            del self.cache[cache_key]
    
    def _log_operation(self, operation: str, entry: WhitelistEntry):
        """记录操作日志"""
        log_entry = {
            'operation': operation,
            'entry_id': entry.id,
            'type': entry.type.value,
            'value': entry.value,
            'operator': entry.operator,
            'timestamp': datetime.now().isoformat()
        }
        print(f"白名单操作日志: {log_entry}")

# 存储接口
class WhitelistStorage:
    """白名单存储接口"""
    
    def save_whitelist_entry(self, entry: WhitelistEntry) -> bool:
        raise NotImplementedError
    
    def get_whitelist_entry(self, entry_id: str) -> Optional[WhitelistEntry]:
        raise NotImplementedError
    
    def update_whitelist_entry(self, entry: WhitelistEntry) -> bool:
        raise NotImplementedError
    
    def find_whitelist_entry(self, value: str, 
                           entry_type: WhitelistType) -> Optional[WhitelistEntry]:
        raise NotImplementedError

# Redis存储实现
class RedisWhitelistStorage(WhitelistStorage):
    """基于Redis的白名单存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=9,
            decode_responses=True
        )
    
    def save_whitelist_entry(self, entry: WhitelistEntry) -> bool:
        try:
            entry_dict = {
                'id': entry.id,
                'type': entry.type.value,
                'value': entry.value,
                'reason': entry.reason,
                'source': entry.source,
                'operator': entry.operator,
                'created_at': entry.created_at.isoformat(),
                'updated_at': entry.updated_at.isoformat(),
                'effective_at': entry.effective_at.isoformat(),
                'expire_at': entry.expire_at.isoformat() if entry.expire_at else None,
                'status': entry.status,
                'level': entry.level,
                'metadata': json.dumps(entry.metadata)
            }
            
            entry_key = f"whitelist:entry:{entry.id}"
            self.redis.hset(entry_key, mapping=entry_dict)
            
            index_key = f"whitelist:index:{entry.type.value}:{entry.value}"
            self.redis.set(index_key, entry.id)
            
            list_key = f"whitelist:list:{entry.type.value}"
            self.redis.sadd(list_key, entry.id)
            
            if entry.expire_at:
                ttl = int((entry.expire_at - datetime.now()).total_seconds())
                if ttl > 0:
                    self.redis.expire(entry_key, ttl)
                    self.redis.expire(index_key, ttl)
            
            return True
        except Exception as e:
            print(f"保存白名单条目失败: {e}")
            return False
    
    def get_whitelist_entry(self, entry_id: str) -> Optional[WhitelistEntry]:
        try:
            entry_key = f"whitelist:entry:{entry_id}"
            entry_data = self.redis.hgetall(entry_key)
            
            if not entry_data:
                return None
            
            return WhitelistEntry(
                id=entry_data['id'],
                type=WhitelistType(entry_data['type']),
                value=entry_data['value'],
                reason=entry_data['reason'],
                source=entry_data['source'],
                operator=entry_data['operator'],
                created_at=datetime.fromisoformat(entry_data['created_at']),
                updated_at=datetime.fromisoformat(entry_data['updated_at']),
                effective_at=datetime.fromisoformat(entry_data['effective_at']),
                expire_at=datetime.fromisoformat(entry_data['expire_at']) if entry_data['expire_at'] else None,
                status=entry_data['status'],
                level=entry_data['level'],
                metadata=json.loads(entry_data['metadata'])
            )
        except Exception as e:
            print(f"获取白名单条目失败: {e}")
            return None
    
    def update_whitelist_entry(self, entry: WhitelistEntry) -> bool:
        return self.save_whitelist_entry(entry)
    
    def find_whitelist_entry(self, value: str, 
                           entry_type: WhitelistType) -> Optional[WhitelistEntry]:
        try:
            index_key = f"whitelist:index:{entry_type.value}:{value}"
            entry_id = self.redis.get(index_key)
            
            if not entry_id:
                return None
            
            return self.get_whitelist_entry(entry_id)
        except Exception as e:
            print(f"查找白名单条目失败: {e}")
            return None

# 使用示例
def example_whitelist_service():
    """白名单服务使用示例"""
    # 初始化服务
    redis_client = redis.Redis(host='localhost', port=6379, db=9, decode_responses=True)
    storage = RedisWhitelistStorage(redis_client)
    whitelist_service = WhitelistService(storage)
    
    # 添加白名单条目
    entry = WhitelistEntry(
        id="wl_123456",
        type=WhitelistType.USER,
        value="vip_user_789",
        reason="重要客户",
        source="客户关系管理",
        operator="admin",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        effective_at=datetime.now(),
        expire_at=datetime.now() + timedelta(days=365),
        status="active",
        level="high",
        metadata={"customer_value": "high", "service_level": "premium"}
    )
    
    # 添加到白名单
    success = whitelist_service.add_to_whitelist(entry)
    print(f"添加白名单结果: {success}")
    
    # 检查白名单
    result = whitelist_service.check_whitelist("vip_user_789", WhitelistType.USER)
    print(f"白名单检查结果: {result is not None}")
    
    # 获取信任等级
    trust_level = whitelist_service.get_trust_level("vip_user_789", WhitelistType.USER)
    print(f"信任等级: {trust_level}")
```

### 3.2 白名单策略应用

#### 3.2.1 风控策略差异化

**基于白名单的策略调整**：
```python
# 基于白名单的风控策略
class WhitelistBasedRiskControl:
    """基于白名单的风控策略"""
    
    def __init__(self, blacklist_service: BlacklistService,
                 whitelist_service: WhitelistService):
        self.blacklist_service = blacklist_service
        self.whitelist_service = whitelist_service
    
    def evaluate_risk(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        评估风险（考虑白名单因素）
        
        Args:
            context: 评估上下文
            
        Returns:
            风险评估结果
        """
        # 首先检查黑名单
        blacklist_result = self._check_blacklist(context)
        if blacklist_result['blocked']:
            return blacklist_result
        
        # 检查白名单
        whitelist_result = self._check_whitelist(context)
        if whitelist_result['trusted']:
            return whitelist_result
        
        # 执行标准风控流程
        return self._standard_risk_evaluation(context)
    
    def _check_blacklist(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """检查黑名单"""
        # 检查用户黑名单
        if 'user_id' in context:
            user_blacklisted = self.blacklist_service.check_blacklist(
                context['user_id'], BlacklistType.USER
            )
            if user_blacklisted:
                return {
                    'blocked': True,
                    'reason': '用户在黑名单中',
                    'risk_level': 'high',
                    'action': 'block',
                    'details': user_blacklisted
                }
        
        # 检查设备黑名单
        if 'device_id' in context:
            device_blacklisted = self.blacklist_service.check_blacklist(
                context['device_id'], BlacklistType.DEVICE
            )
            if device_blacklisted:
                return {
                    'blocked': True,
                    'reason': '设备在黑名单中',
                    'risk_level': 'high',
                    'action': 'block',
                    'details': device_blacklisted
                }
        
        # 检查IP黑名单
        if 'ip_address' in context:
            ip_blacklisted = self.blacklist_service.check_blacklist(
                context['ip_address'], BlacklistType.IP
            )
            if ip_blacklisted:
                return {
                    'blocked': True,
                    'reason': 'IP在黑名单中',
                    'risk_level': 'high',
                    'action': 'block',
                    'details': ip_blacklisted
                }
        
        return {'blocked': False}
    
    def _check_whitelist(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """检查白名单"""
        trust_level = "normal"
        
        # 检查用户白名单
        if 'user_id' in context:
            user_trust_level = self.whitelist_service.get_trust_level(
                context['user_id'], WhitelistType.USER
            )
            if user_trust_level in ["high", "medium"]:
                trust_level = user_trust_level
        
        # 检查商户白名单
        if 'merchant_id' in context:
            merchant_trust_level = self.whitelist_service.get_trust_level(
                context['merchant_id'], WhitelistType.MERCHANT
            )
            if merchant_trust_level in ["high", "medium"]:
                trust_level = max(trust_level, merchant_trust_level)
        
        # 根据信任等级调整风控策略
        if trust_level == "high":
            return {
                'trusted': True,
                'trust_level': trust_level,
                'risk_level': 'low',
                'action': 'allow',
                'message': '高信任用户，快速通过'
            }
        elif trust_level == "medium":
            return {
                'trusted': True,
                'trust_level': trust_level,
                'risk_level': 'low',
                'action': 'allow_with_monitoring',
                'message': '中等信任用户，监控通过'
            }
        
        return {'trusted': False}
    
    def _standard_risk_evaluation(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """标准风控评估"""
        # 这里应该调用标准的风控评估逻辑
        # 简化实现
        risk_score = context.get('risk_score', 50)
        
        if risk_score >= 80:
            return {
                'risk_level': 'high',
                'action': 'block',
                'score': risk_score,
                'message': '高风险，拦截处理'
            }
        elif risk_score >= 60:
            return {
                'risk_level': 'medium_high',
                'action': 'challenge',
                'score': risk_score,
                'message': '中高风险，挑战验证'
            }
        elif risk_score >= 40:
            return {
                'risk_level': 'medium',
                'action': 'allow_with_monitoring',
                'score': risk_score,
                'message': '中等风险，监控通过'
            }
        else:
            return {
                'risk_level': 'low',
                'action': 'allow',
                'score': risk_score,
                'message': '低风险，直接通过'
            }

# 使用示例
def example_whitelist_based_control():
    """基于白名单的风控示例"""
    # 初始化服务
    redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
    
    blacklist_storage = RedisBlacklistStorage(
        redis.Redis(host='localhost', port=6379, db=8, decode_responses=True)
    )
    blacklist_service = BlacklistService(blacklist_storage)
    
    whitelist_storage = RedisWhitelistStorage(
        redis.Redis(host='localhost', port=6379, db=9, decode_responses=True)
    )
    whitelist_service = WhitelistService(whitelist_storage)
    
    risk_control = WhitelistBasedRiskControl(blacklist_service, whitelist_service)
    
    # 测试场景1：黑名单用户
    context1 = {
        'user_id': 'blacklisted_user_123',
        'ip_address': '192.168.1.100',
        'risk_score': 90
    }
    
    result1 = risk_control.evaluate_risk(context1)
    print("黑名单用户评估结果:", result1)
    
    # 测试场景2：白名单用户
    context2 = {
        'user_id': 'vip_user_456',
        'ip_address': '192.168.1.101',
        'risk_score': 30
    }
    
    result2 = risk_control.evaluate_risk(context2)
    print("白名单用户评估结果:", result2)
    
    # 测试场景3：普通用户
    context3 = {
        'user_id': 'normal_user_789',
        'ip_address': '192.168.1.102',
        'risk_score': 65
    }
    
    result3 = risk_control.evaluate_risk(context3)
    print("普通用户评估结果:", result3)
```

## 四、灰名单管理

### 4.1 灰名单概述

灰名单是一种介于黑白名单之间的名单类型，用于标识存在潜在风险但尚未确认的实体。灰名单为风控系统提供了更精细的风险管理手段。

#### 4.1.1 灰名单特性

**核心特征**：
1. **观察性**：灰名单实体处于观察期，需要进一步验证
2. **临时性**：灰名单通常具有较短的有效期
3. **预警性**：灰名单用于提前预警潜在风险
4. **灵活性**：灰名单策略可以动态调整

**业务场景**：
- **可疑行为**：识别存在可疑行为但未确认欺诈的用户
- **新用户验证**：对新注册用户进行观察
- **异常交易**：对异常交易行为进行监控
- **设备验证**：对新设备或异常设备进行验证

#### 4.1.2 灰名单实现

**数据结构设计**：
```python
# 灰名单数据模型
from enum import Enum

class GraylistType(Enum):
    """灰名单类型"""
    USER = "user"           # 用户灰名单
    DEVICE = "device"       # 设备灰名单
    IP = "ip"              # IP灰名单
    TRANSACTION = "transaction"  # 交易灰名单

class GraylistStatus(Enum):
    """灰名单状态"""
    OBSERVING = "observing"    # 观察中
    CONFIRMED = "confirmed"    # 已确认（转黑名单）
    CLEARED = "cleared"        # 已清除（转白名单或删除）

@dataclass
class GraylistEntry:
    """灰名单条目"""
    id: str
    type: GraylistType
    value: str           # 灰名单值
    reason: str          # 加入原因
    source: str          # 来源
    operator: str        # 操作人
    created_at: datetime
    updated_at: datetime
    effective_at: datetime   # 生效时间
    expire_at: Optional[datetime]  # 过期时间
    status: GraylistStatus   # 状态
    observation_period: int  # 观察期（天）
    observation_data: Dict[str, Any]  # 观察数据
    metadata: Dict[str, Any]  # 扩展信息

class GraylistService:
    """灰名单服务"""
    
    def __init__(self, storage_backend):
        self.storage = storage_backend
        self.cache = {}
    
    def add_to_graylist(self, entry: GraylistEntry) -> bool:
        """添加到灰名单"""
        try:
            if not self._validate_entry(entry):
                return False
            
            success = self.storage.save_graylist_entry(entry)
            if success:
                self._update_cache(entry)
                self._log_operation("add", entry)
            
            return success
        except Exception as e:
            print(f"添加灰名单失败: {e}")
            return False
    
    def update_graylist_status(self, entry_id: str, 
                             status: GraylistStatus,
                             operator: str) -> bool:
        """更新灰名单状态"""
        try:
            entry = self.storage.get_graylist_entry(entry_id)
            if not entry:
                return False
            
            entry.status = status
            entry.updated_at = datetime.now()
            entry.operator = operator
            
            success = self.storage.update_graylist_entry(entry)
            if success:
                self._update_cache(entry)
                self._log_operation(f"update_status_{status.value}", entry)
            
            return success
        except Exception as e:
            print(f"更新灰名单状态失败: {e}")
            return False
    
    def check_graylist(self, value: str, entry_type: GraylistType) -> Optional[GraylistEntry]:
        """检查是否在灰名单中"""
        try:
            cache_key = f"{entry_type.value}:{value}"
            if cache_key in self.cache:
                entry = self.cache[cache_key]
                if not entry.expire_at or entry.expire_at > datetime.now():
                    return entry if entry.status == GraylistStatus.OBSERVING else None
                else:
                    del self.cache[cache_key]
            
            entry = self.storage.find_graylist_entry(value, entry_type)
            if entry and entry.status == GraylistStatus.OBSERVING:
                if not entry.expire_at or entry.expire_at > datetime.now():
                    self._update_cache(entry)
                    return entry
            
            return None
        except Exception as e:
            print(f"检查灰名单失败: {e}")
            return None
    
    def get_observation_data(self, entry_id: str) -> Dict[str, Any]:
        """获取观察数据"""
        entry = self.storage.get_graylist_entry(entry_id)
        return entry.observation_data if entry else {}
    
    def add_observation_record(self, entry_id: str, 
                             record: Dict[str, Any]) -> bool:
        """添加观察记录"""
        try:
            entry = self.storage.get_graylist_entry(entry_id)
            if not entry:
                return False
            
            # 更新观察数据
            if 'observation_history' not in entry.observation_data:
                entry.observation_data['observation_history'] = []
            
            record['timestamp'] = datetime.now().isoformat()
            entry.observation_data['observation_history'].append(record)
            
            # 更新统计信息
            self._update_observation_stats(entry, record)
            
            success = self.storage.update_graylist_entry(entry)
            if success:
                self._update_cache(entry)
            
            return success
        except Exception as e:
            print(f"添加观察记录失败: {e}")
            return False
    
    def _update_observation_stats(self, entry: GraylistEntry, 
                                record: Dict[str, Any]):
        """更新观察统计"""
        if 'observation_stats' not in entry.observation_data:
            entry.observation_data['observation_stats'] = {
                'total_records': 0,
                'risk_events': 0,
                'normal_events': 0,
                'last_update': None
            }
        
        stats = entry.observation_data['observation_stats']
        stats['total_records'] += 1
        stats['last_update'] = datetime.now().isoformat()
        
        # 根据记录类型更新统计
        if record.get('event_type') == 'risk':
            stats['risk_events'] += 1
        elif record.get('event_type') == 'normal':
            stats['normal_events'] += 1
    
    def _validate_entry(self, entry: GraylistEntry) -> bool:
        """验证灰名单条目"""
        if not entry.value or not entry.reason or not entry.source:
            return False
        
        if entry.expire_at and entry.expire_at <= entry.effective_at:
            return False
        
        if not isinstance(entry.type, GraylistType):
            return False
        
        return True
    
    def _update_cache(self, entry: GraylistEntry):
        """更新缓存"""
        cache_key = f"{entry.type.value}:{entry.value}"
        self.cache[cache_key] = entry
        
        if len(self.cache) > 10000:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
    
    def _invalidate_cache(self, entry: GraylistEntry):
        """使缓存失效"""
        cache_key = f"{entry.type.value}:{entry.value}"
        if cache_key in self.cache:
            del self.cache[cache_key]
    
    def _log_operation(self, operation: str, entry: GraylistEntry):
        """记录操作日志"""
        log_entry = {
            'operation': operation,
            'entry_id': entry.id,
            'type': entry.type.value,
            'value': entry.value,
            'operator': entry.operator,
            'timestamp': datetime.now().isoformat()
        }
        print(f"灰名单操作日志: {log_entry}")

# 存储接口
class GraylistStorage:
    """灰名单存储接口"""
    
    def save_graylist_entry(self, entry: GraylistEntry) -> bool:
        raise NotImplementedError
    
    def get_graylist_entry(self, entry_id: str) -> Optional[GraylistEntry]:
        raise NotImplementedError
    
    def update_graylist_entry(self, entry: GraylistEntry) -> bool:
        raise NotImplementedError
    
    def find_graylist_entry(self, value: str, 
                          entry_type: GraylistType) -> Optional[GraylistEntry]:
        raise NotImplementedError

# Redis存储实现
class RedisGraylistStorage(GraylistStorage):
    """基于Redis的灰名单存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=10,
            decode_responses=True
        )
    
    def save_graylist_entry(self, entry: GraylistEntry) -> bool:
        try:
            entry_dict = {
                'id': entry.id,
                'type': entry.type.value,
                'value': entry.value,
                'reason': entry.reason,
                'source': entry.source,
                'operator': entry.operator,
                'created_at': entry.created_at.isoformat(),
                'updated_at': entry.updated_at.isoformat(),
                'effective_at': entry.effective_at.isoformat(),
                'expire_at': entry.expire_at.isoformat() if entry.expire_at else None,
                'status': entry.status.value,
                'observation_period': entry.observation_period,
                'observation_data': json.dumps(entry.observation_data),
                'metadata': json.dumps(entry.metadata)
            }
            
            entry_key = f"graylist:entry:{entry.id}"
            self.redis.hset(entry_key, mapping=entry_dict)
            
            index_key = f"graylist:index:{entry.type.value}:{entry.value}"
            self.redis.set(index_key, entry.id)
            
            list_key = f"graylist:list:{entry.type.value}"
            self.redis.sadd(list_key, entry.id)
            
            if entry.expire_at:
                ttl = int((entry.expire_at - datetime.now()).total_seconds())
                if ttl > 0:
                    self.redis.expire(entry_key, ttl)
                    self.redis.expire(index_key, ttl)
            
            return True
        except Exception as e:
            print(f"保存灰名单条目失败: {e}")
            return False
    
    def get_graylist_entry(self, entry_id: str) -> Optional[GraylistEntry]:
        try:
            entry_key = f"graylist:entry:{entry_id}"
            entry_data = self.redis.hgetall(entry_key)
            
            if not entry_data:
                return None
            
            return GraylistEntry(
                id=entry_data['id'],
                type=GraylistType(entry_data['type']),
                value=entry_data['value'],
                reason=entry_data['reason'],
                source=entry_data['source'],
                operator=entry_data['operator'],
                created_at=datetime.fromisoformat(entry_data['created_at']),
                updated_at=datetime.fromisoformat(entry_data['updated_at']),
                effective_at=datetime.fromisoformat(entry_data['effective_at']),
                expire_at=datetime.fromisoformat(entry_data['expire_at']) if entry_data['expire_at'] else None,
                status=GraylistStatus(entry_data['status']),
                observation_period=int(entry_data['observation_period']),
                observation_data=json.loads(entry_data['observation_data']),
                metadata=json.loads(entry_data['metadata'])
            )
        except Exception as e:
            print(f"获取灰名单条目失败: {e}")
            return None
    
    def update_graylist_entry(self, entry: GraylistEntry) -> bool:
        return self.save_graylist_entry(entry)
    
    def find_graylist_entry(self, value: str, 
                          entry_type: GraylistType) -> Optional[GraylistEntry]:
        try:
            index_key = f"graylist:index:{entry_type.value}:{value}"
            entry_id = self.redis.get(index_key)
            
            if not entry_id:
                return None
            
            return self.get_graylist_entry(entry_id)
        except Exception as e:
            print(f"查找灰名单条目失败: {e}")
            return None

# 灰名单观察者
class GraylistObserver:
    """灰名单观察者"""
    
    def __init__(self, graylist_service: GraylistService):
        self.graylist_service = graylist_service
    
    def observe_user_behavior(self, user_id: str, behavior_data: Dict[str, Any]):
        """观察用户行为"""
        # 检查用户是否在灰名单中
        gray_entry = self.graylist_service.check_graylist(user_id, GraylistType.USER)
        if not gray_entry:
            return
        
        # 记录行为数据
        observation_record = {
            'event_type': 'user_behavior',
            'behavior_type': behavior_data.get('type'),
            'risk_level': behavior_data.get('risk_level', 'normal'),
            'details': behavior_data
        }
        
        self.graylist_service.add_observation_record(gray_entry.id, observation_record)
        
        # 根据观察数据决定是否更新状态
        self._evaluate_status_update(gray_entry)
    
    def observe_transaction(self, transaction_id: str, transaction_data: Dict[str, Any]):
        """观察交易行为"""
        # 检查交易是否在灰名单中
        gray_entry = self.graylist_service.check_graylist(
            transaction_id, GraylistType.TRANSACTION
        )
        if not gray_entry:
            return
        
        # 记录交易数据
        observation_record = {
            'event_type': 'transaction',
            'amount': transaction_data.get('amount'),
            'risk_level': transaction_data.get('risk_level', 'normal'),
            'details': transaction_data
        }
        
        self.graylist_service.add_observation_record(gray_entry.id, observation_record)
        
        # 根据观察数据决定是否更新状态
        self._evaluate_status_update(gray_entry)
    
    def _evaluate_status_update(self, entry: GraylistEntry):
        """评估状态更新"""
        observation_data = entry.observation_data
        stats = observation_data.get('observation_stats', {})
        
        total_records = stats.get('total_records', 0)
        risk_events = stats.get('risk_events', 0)
        normal_events = stats.get('normal_events', 0)
        
        # 如果观察期已满
        if total_records >= entry.observation_period:
            # 计算风险比例
            risk_ratio = risk_events / total_records if total_records > 0 else 0
            
            if risk_ratio > 0.5:  # 风险事件超过50%
                # 转为黑名单
                self.graylist_service.update_graylist_status(
                    entry.id, GraylistStatus.CONFIRMED, "system"
                )
            else:
                # 清除灰名单
                self.graylist_service.update_graylist_status(
                    entry.id, GraylistStatus.CLEARED, "system"
                )

# 使用示例
def example_graylist_service():
    """灰名单服务使用示例"""
    # 初始化服务
    redis_client = redis.Redis(host='localhost', port=6379, db=10, decode_responses=True)
    storage = RedisGraylistStorage(redis_client)
    graylist_service = GraylistService(storage)
    
    observer = GraylistObserver(graylist_service)
    
    # 添加灰名单条目
    entry = GraylistEntry(
        id="gl_123456",
        type=GraylistType.USER,
        value="suspicious_user_789",
        reason="可疑登录行为",
        source="行为分析系统",
        operator="system",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        effective_at=datetime.now(),
        expire_at=datetime.now() + timedelta(days=7),
        status=GraylistStatus.OBSERVING,
        observation_period=7,
        observation_data={},
        metadata={"evidence": "多次异常登录"}
    )
    
    # 添加到灰名单
    success = graylist_service.add_to_graylist(entry)
    print(f"添加灰名单结果: {success}")
    
    # 检查灰名单
    result = graylist_service.check_graylist("suspicious_user_789", GraylistType.USER)
    print(f"灰名单检查结果: {result is not None}")
    
    # 模拟观察行为
    behavior_data = {
        'type': 'login',
        'risk_level': 'high',
        'ip': '192.168.1.100',
        'time': datetime.now().isoformat()
    }
    
    observer.observe_user_behavior("suspicious_user_789", behavior_data)
```

## 五、临时名单管理

### 5.1 临时名单概述

临时名单是具有短期有效性的名单类型，通常用于应对突发风险事件或临时性风险控制需求。临时名单的灵活性和时效性使其成为风控系统的重要补充。

#### 5.1.1 临时名单特性

**核心特征**：
1. **时效性**：临时名单具有明确的生效和失效时间
2. **动态性**：临时名单可以快速创建和删除
3. **针对性**：临时名单通常针对特定事件或场景
4. **紧急性**：临时名单常用于紧急风险控制

**业务场景**：
- **突发事件**：应对突发的安全事件或风险事件
- **营销活动**：临时限制某些营销活动的参与
- **系统维护**：系统维护期间的临时访问控制
- **特殊时期**：特殊时期（如大促）的风险控制

#### 5.1.2 临时名单实现

**数据结构设计**：
```python
# 临时名单数据模型
from enum import Enum

class TemporaryListType(Enum):
    """临时名单类型"""
    USER = "user"           # 用户临时名单
    DEVICE = "device"       # 设备临时名单
    IP = "ip"              # IP临时名单
    MERCHANT = "merchant"   # 商户临时名单

class TemporaryListAction(Enum):
    """临时名单动作"""
    BLOCK = "block"        # 拦截
    ALLOW = "allow"        # 允许
    MONITOR = "monitor"    # 监控
    CHALLENGE = "challenge"  # 挑战

@dataclass
class TemporaryListEntry:
    """临时名单条目"""
    id: str
    type: TemporaryListType
    value: str           # 名单值
    action: TemporaryListAction  # 执行动作
    reason: str          # 加入原因
    source: str          # 来源
    operator: str        # 操作人
    created_at: datetime
    effective_at: datetime   # 生效时间
    expire_at: datetime      # 过期时间
    priority: int        # 优先级
    conditions: List[Dict[str, Any]]  # 生效条件
    metadata: Dict[str, Any]  # 扩展信息

class TemporaryListService:
    """临时名单服务"""
    
    def __init__(self, storage_backend):
        self.storage = storage_backend
        self.cache = {}
        self._start_cleanup_task()
    
    def add_temporary_entry(self, entry: TemporaryListEntry) -> bool:
        """添加临时名单条目"""
        try:
            if not self._validate_entry(entry):
                return False
            
            # 检查是否已存在相同条目
            existing_entry = self._find_existing_entry(entry)
            if existing_entry:
                # 如果已存在，更新过期时间
                existing_entry.expire_at = max(existing_entry.expire_at, entry.expire_at)
                existing_entry.updated_at = datetime.now()
                return self.storage.update_temporary_entry(existing_entry)
            
            success = self.storage.save_temporary_entry(entry)
            if success:
                self._update_cache(entry)
                self._log_operation("add", entry)
            
            return success
        except Exception as e:
            print(f"添加临时名单失败: {e}")
            return False
    
    def remove_temporary_entry(self, entry_id: str) -> bool:
        """移除临时名单条目"""
        try:
            entry = self.storage.get_temporary_entry(entry_id)
            if not entry:
                return False
            
            success = self.storage.delete_temporary_entry(entry_id)
            if success:
                self._invalidate_cache(entry)
                self._log_operation("remove", entry)
            
            return success
        except Exception as e:
            print(f"移除临时名单失败: {e}")
            return False
    
    def check_temporary_list(self, value: str, 
                           entry_type: TemporaryListType,
                           context: Dict[str, Any] = None) -> Optional[TemporaryListEntry]:
        """检查临时名单"""
        try:
            # 先检查缓存
            cache_key = f"{entry_type.value}:{value}"
            if cache_key in self.cache:
                entries = self.cache[cache_key]
                for entry in entries:
                    if self._is_entry_active(entry) and self._check_conditions(entry, context):
                        return entry
            
            # 从存储查询
            entries = self.storage.find_temporary_entries(value, entry_type)
            active_entries = [entry for entry in entries if self._is_entry_active(entry)]
            
            if active_entries:
                # 按优先级排序
                active_entries.sort(key=lambda x: x.priority, reverse=True)
                
                # 检查条件
                for entry in active_entries:
                    if self._check_conditions(entry, context):
                        # 更新缓存
                        self._update_cache(entry)
                        return entry
            
            return None
        except Exception as e:
            print(f"检查临时名单失败: {e}")
            return None
    
    def get_active_entries(self, entry_type: Optional[TemporaryListType] = None) -> List[TemporaryListEntry]:
        """获取活跃条目"""
        try:
            entries = self.storage.get_all_temporary_entries(entry_type)
            active_entries = [entry for entry in entries if self._is_entry_active(entry)]
            return active_entries
        except Exception as e:
            print(f"获取活跃条目失败: {e}")
            return []
    
    def _validate_entry(self, entry: TemporaryListEntry) -> bool:
        """验证临时名单条目"""
        if not entry.value or not entry.reason or not entry.source:
            return False
        
        if entry.expire_at <= entry.effective_at:
            return False
        
        if not isinstance(entry.type, TemporaryListType):
            return False
        
        if not isinstance(entry.action, TemporaryListAction):
            return False
        
        return True
    
    def _find_existing_entry(self, entry: TemporaryListEntry) -> Optional[TemporaryListEntry]:
        """查找已存在的条目"""
        existing_entries = self.storage.find_temporary_entries(entry.value, entry.type)
        for existing in existing_entries:
            if (existing.action == entry.action and 
                existing.conditions == entry.conditions):
                return existing
        return None
    
    def _is_entry_active(self, entry: TemporaryListEntry) -> bool:
        """检查条目是否活跃"""
        now = datetime.now()
        return entry.effective_at <= now <= entry.expire_at
    
    def _check_conditions(self, entry: TemporaryListEntry, 
                        context: Dict[str, Any] = None) -> bool:
        """检查生效条件"""
        if not entry.conditions or not context:
            return True
        
        for condition in entry.conditions:
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            if not field or field not in context:
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
    
    def _update_cache(self, entry: TemporaryListEntry):
        """更新缓存"""
        cache_key = f"{entry.type.value}:{entry.value}"
        if cache_key not in self.cache:
            self.cache[cache_key] = []
        
        # 移除过期条目
        self.cache[cache_key] = [e for e in self.cache[cache_key] if self._is_entry_active(e)]
        
        # 添加新条目
        self.cache[cache_key].append(entry)
        
        # 限制缓存大小
        if len(self.cache) > 10000:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
    
    def _invalidate_cache(self, entry: TemporaryListEntry):
        """使缓存失效"""
        cache_key = f"{entry.type.value}:{entry.value}"
        if cache_key in self.cache:
            self.cache[cache_key] = [e for e in self.cache[cache_key] if e.id != entry.id]
            if not self.cache[cache_key]:
                del self.cache[cache_key]
    
    def _start_cleanup_task(self):
        """启动清理任务"""
        import threading
        import time
        
        def cleanup_expired_entries():
            while True:
                try:
                    # 清理过期条目
                    expired_entries = self.storage.get_expired_entries()
                    for entry in expired_entries:
                        self.storage.delete_temporary_entry(entry.id)
                        self._invalidate_cache(entry)
                    
                    # 等待1小时
                    time.sleep(3600)
                except Exception as e:
                    print(f"清理过期条目失败: {e}")
                    time.sleep(300)  # 5分钟后重试
        
        # 启动后台线程
        cleanup_thread = threading.Thread(target=cleanup_expired_entries, daemon=True)
        cleanup_thread.start()
    
    def _log_operation(self, operation: str, entry: TemporaryListEntry):
        """记录操作日志"""
        log_entry = {
            'operation': operation,
            'entry_id': entry.id,
            'type': entry.type.value,
            'value': entry.value,
            'action': entry.action.value,
            'operator': entry.operator,
            'timestamp': datetime.now().isoformat()
        }
        print(f"临时名单操作日志: {log_entry}")

# 存储接口
class TemporaryListStorage:
    """临时名单存储接口"""
    
    def save_temporary_entry(self, entry: TemporaryListEntry) -> bool:
        raise NotImplementedError
    
    def get_temporary_entry(self, entry_id: str) -> Optional[TemporaryListEntry]:
        raise NotImplementedError
    
    def update_temporary_entry(self, entry: TemporaryListEntry) -> bool:
        raise NotImplementedError
    
    def delete_temporary_entry(self, entry_id: str) -> bool:
        raise NotImplementedError
    
    def find_temporary_entries(self, value: str, 
                             entry_type: TemporaryListType) -> List[TemporaryListEntry]:
        raise NotImplementedError
    
    def get_all_temporary_entries(self, entry_type: Optional[TemporaryListType] = None) -> List[TemporaryListEntry]:
        raise NotImplementedError
    
    def get_expired_entries(self) -> List[TemporaryListEntry]:
        raise NotImplementedError

# Redis存储实现
class RedisTemporaryListStorage(TemporaryListStorage):
    """基于Redis的临时名单存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost',
            port=6379,
            db=11,
            decode_responses=True
        )
    
    def save_temporary_entry(self, entry: TemporaryListEntry) -> bool:
        try:
            entry_dict = {
                'id': entry.id,
                'type': entry.type.value,
                'value': entry.value,
                'action': entry.action.value,
                'reason': entry.reason,
                'source': entry.source,
                'operator': entry.operator,
                'created_at': entry.created_at.isoformat(),
                'effective_at': entry.effective_at.isoformat(),
                'expire_at': entry.expire_at.isoformat(),
                'priority': entry.priority,
                'conditions': json.dumps(entry.conditions),
                'metadata': json.dumps(entry.metadata)
            }
            
            entry_key = f"temporary:entry:{entry.id}"
            self.redis.hset(entry_key, mapping=entry_dict)
            
            # 添加到索引
            index_key = f"temporary:index:{entry.type.value}:{entry.value}"
            self.redis.sadd(index_key, entry.id)
            
            # 添加到类型索引
            type_index_key = f"temporary:type:{entry.type.value}"
            self.redis.sadd(type_index_key, entry.id)
            
            # 添加到过期时间索引（用于清理）
            expire_timestamp = int(entry.expire_at.timestamp())
            expire_index_key = f"temporary:expire"
            self.redis.zadd(expire_index_key, {entry.id: expire_timestamp})
            
            # 设置过期时间
            ttl = int((entry.expire_at - datetime.now()).total_seconds())
            if ttl > 0:
                self.redis.expire(entry_key, ttl)
                self.redis.expire(index_key, ttl)
            
            return True
        except Exception as e:
            print(f"保存临时名单条目失败: {e}")
            return False
    
    def get_temporary_entry(self, entry_id: str) -> Optional[TemporaryListEntry]:
        try:
            entry_key = f"temporary:entry:{entry_id}"
            entry_data = self.redis.hgetall(entry_key)
            
            if not entry_data:
                return None
            
            return TemporaryListEntry(
                id=entry_data['id'],
                type=TemporaryListType(entry_data['type']),
                value=entry_data['value'],
                action=TemporaryListAction(entry_data['action']),
                reason=entry_data['reason'],
                source=entry_data['source'],
                operator=entry_data['operator'],
                created_at=datetime.fromisoformat(entry_data['created_at']),
                effective_at=datetime.fromisoformat(entry_data['effective_at']),
                expire_at=datetime.fromisoformat(entry_data['expire_at']),
                priority=int(entry_data['priority']),
                conditions=json.loads(entry_data['conditions']),
                metadata=json.loads(entry_data['metadata'])
            )
        except Exception as e:
            print(f"获取临时名单条目失败: {e}")
            return None
    
    def update_temporary_entry(self, entry: TemporaryListEntry) -> bool:
        return self.save_temporary_entry(entry)
    
    def delete_temporary_entry(self, entry_id: str) -> bool:
        try:
            entry = self.get_temporary_entry(entry_id)
            if not entry:
                return False
            
            entry_key = f"temporary:entry:{entry_id}"
            index_key = f"temporary:index:{entry.type.value}:{entry.value}"
            type_index_key = f"temporary:type:{entry.type.value}"
            expire_index_key = f"temporary:expire"
            
            # 删除所有相关键
            self.redis.delete(entry_key)
            self.redis.srem(index_key, entry_id)
            self.redis.srem(type_index_key, entry_id)
            self.redis.zrem(expire_index_key, entry_id)
            
            return True
        except Exception as e:
            print(f"删除临时名单条目失败: {e}")
            return False
    
    def find_temporary_entries(self, value: str, 
                             entry_type: TemporaryListType) -> List[TemporaryListEntry]:
        try:
            index_key = f"temporary:index:{entry_type.value}:{value}"
            entry_ids = self.redis.smembers(index_key)
            
            entries = []
            for entry_id in entry_ids:
                entry = self.get_temporary_entry(entry_id)
                if entry:
                    entries.append(entry)
            
            return entries
        except Exception as e:
            print(f"查找临时名单条目失败: {e}")
            return []
    
    def get_all_temporary_entries(self, entry_type: Optional[TemporaryListType] = None) -> List[TemporaryListEntry]:
        try:
            if entry_type:
                type_index_key = f"temporary:type:{entry_type.value}"
                entry_ids = self.redis.smembers(type_index_key)
            else:
                # 获取所有条目ID
                entry_ids = set()
                for temp_type in TemporaryListType:
                    type_index_key = f"temporary:type:{temp_type.value}"
                    type_entries = self.redis.smembers(type_index_key)
                    entry_ids.update(type_entries)
            
            entries = []
            for entry_id in entry_ids:
                entry = self.get_temporary_entry(entry_id)
                if entry:
                    entries.append(entry)
            
            return entries
        except Exception as e:
            print(f"获取所有临时名单条目失败: {e}")
            return []
    
    def get_expired_entries(self) -> List[TemporaryListEntry]:
        try:
            expire_index_key = f"temporary:expire"
            now_timestamp = int(datetime.now().timestamp())
            
            # 获取已过期的条目ID
            expired_entry_ids = self.redis.zrangebyscore(
                expire_index_key, 0, now_timestamp
            )
            
            entries = []
            for entry_id in expired_entry_ids:
                entry = self.get_temporary_entry(entry_id)
                if entry:
                    entries.append(entry)
            
            return entries
        except Exception as e:
            print(f"获取过期条目失败: {e}")
            return []

# 临时名单管理器
class TemporaryListManager:
    """临时名单管理器"""
    
    def __init__(self, temporary_service: TemporaryListService):
        self.temporary_service = temporary_service
    
    def create_emergency_block(self, value: str, entry_type: TemporaryListType,
                            duration_minutes: int = 60, reason: str = "紧急拦截") -> str:
        """
        创建紧急拦截
        
        Args:
            value: 拦截值
            entry_type: 名单类型
            duration_minutes: 持续时间（分钟）
            reason: 拦截原因
            
        Returns:
            条目ID
        """
        entry_id = f"temp_{int(datetime.now().timestamp())}_{hash(value) % 10000}"
        
        entry = TemporaryListEntry(
            id=entry_id,
            type=entry_type,
            value=value,
            action=TemporaryListAction.BLOCK,
            reason=reason,
            source="emergency_manager",
            operator="system",
            created_at=datetime.now(),
            effective_at=datetime.now(),
            expire_at=datetime.now() + timedelta(minutes=duration_minutes),
            priority=100,  # 高优先级
            conditions=[],
            metadata={"created_by": "emergency_manager"}
        )
        
        success = self.temporary_service.add_temporary_entry(entry)
        return entry_id if success else None
    
    def create_activity_allow(self, value: str, entry_type: TemporaryListType,
                            activity_name: str, duration_hours: int = 24) -> str:
        """
        创建活动白名单
        
        Args:
            value: 允许值
            entry_type: 名单类型
            activity_name: 活动名称
            duration_hours: 持续时间（小时）
            
        Returns:
            条目ID
        """
        entry_id = f"temp_{int(datetime.now().timestamp())}_{hash(value) % 10000}"
        
        entry = TemporaryListEntry(
            id=entry_id,
            type=entry_type,
            value=value,
            action=TemporaryListAction.ALLOW,
            reason=f"活动白名单: {activity_name}",
            source="activity_manager",
            operator="system",
            created_at=datetime.now(),
            effective_at=datetime.now(),
            expire_at=datetime.now() + timedelta(hours=duration_hours),
            priority=50,
            conditions=[{"field": "activity", "operator": "==", "value": activity_name}],
            metadata={"activity_name": activity_name}
        )
        
        success = self.temporary_service.add_temporary_entry(entry)
        return entry_id if success else None
    
    def create_maintenance_block(self, value: str, entry_type: TemporaryListType,
                               maintenance_window: tuple, reason: str = "系统维护") -> str:
        """
        创建维护期拦截
        
        Args:
            value: 拦截值
            entry_type: 名单类型
            maintenance_window: 维护时间窗口 (开始时间, 结束时间)
            reason: 拦截原因
            
        Returns:
            条目ID
        """
        entry_id = f"temp_{int(datetime.now().timestamp())}_{hash(value) % 10000}"
        
        entry = TemporaryListEntry(
            id=entry_id,
            type=entry_type,
            value=value,
            action=TemporaryListAction.BLOCK,
            reason=reason,
            source="maintenance_manager",
            operator="system",
            created_at=datetime.now(),
            effective_at=maintenance_window[0],
            expire_at=maintenance_window[1],
            priority=75,
            conditions=[],
            metadata={"maintenance_window": [t.isoformat() for t in maintenance_window]}
        )
        
        success = self.temporary_service.add_temporary_entry(entry)
        return entry_id if success else None

# 使用示例
def example_temporary_list_service():
    """临时名单服务使用示例"""
    # 初始化服务
    redis_client = redis.Redis(host='localhost', port=6379, db=11, decode_responses=True)
    storage = RedisTemporaryListStorage(redis_client)
    temporary_service = TemporaryListService(storage)
    manager = TemporaryListManager(temporary_service)
    
    # 创建紧急拦截
    emergency_id = manager.create_emergency_block(
        "suspicious_user_123", 
        TemporaryListType.USER, 
        duration_minutes=30,
        reason="检测到可疑行为"
    )
    print(f"创建紧急拦截: {emergency_id}")
    
    # 检查临时名单
    context = {"activity": "promotion_2025"}
    result = temporary_service.check_temporary_list(
        "suspicious_user_123", 
        TemporaryListType.USER,
        context
    )
    print(f"临时名单检查结果: {result}")
    
    # 创建活动白名单
    activity_id = manager.create_activity_allow(
        "vip_user_456",
        TemporaryListType.USER,
        "promotion_2025",
        duration_hours=48
    )
    print(f"创建活动白名单: {activity_id}")
    
    # 获取活跃条目
    active_entries = temporary_service.get_active_entries(TemporaryListType.USER)
    print(f"活跃用户条目数: {len(active_entries)}")

if __name__ == "__main__":
    example_temporary_list_service()