---
title: 发现策略与调度: 全量发现与增量发现
date: 2025-09-07
categories: [CMDB]
tags: [cmdb, discovery-strategy, scheduling, full-discovery, incremental-discovery]
published: true
---
在配置管理数据库（CMDB）的自动发现体系中，发现策略与调度机制是确保数据准确性和时效性的核心组件。合理的发现策略能够平衡系统资源消耗与数据新鲜度，而高效的调度机制则能确保发现任务按时执行并适应动态变化的IT环境。本文将深入探讨全量发现与增量发现两种核心策略，以及如何设计高效的发现调度体系。

## 发现策略的重要性

### 策略设计的挑战

现代IT环境的复杂性和动态性给发现策略设计带来了多重挑战：

1. **规模挑战**：企业IT环境可能包含数千甚至数万个配置项，全量发现需要大量时间和资源
2. **变化频率**：不同类型的配置项变化频率差异巨大，从静态的硬件设备到动态的容器实例
3. **资源约束**：发现过程会消耗网络带宽、CPU、内存等资源，需要合理控制
4. **准确性要求**：业务对配置数据的准确性要求越来越高，需要及时发现变化
5. **成本考虑**：频繁的发现操作会增加系统运营成本

### 策略设计原则

设计有效的发现策略需要遵循以下原则：

1. **业务驱动**：根据业务重要性和数据敏感性制定不同的发现频率
2. **资源优化**：合理分配系统资源，避免发现任务对生产环境造成影响
3. **风险控制**：通过分批、错峰等方式降低发现风险
4. **灵活适应**：策略应能适应环境变化和业务需求调整
5. **可度量性**：策略效果应可度量和优化

## 全量发现策略

### 全量发现概述

全量发现是指对整个IT环境中的所有配置项进行全面扫描和信息收集的过程。这种策略能够确保数据的完整性和一致性，是建立CMDB数据基线的重要手段。

### 技术实现

```python
import threading
import time
import queue
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
import hashlib

class FullDiscoveryManager:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.discovery_queue = queue.Queue()
        self.discovery_workers = []
        self.discovery_results = {}
        self.logger = logging.getLogger(__name__)
        
        # 初始化发现工作者线程
        self._init_workers()
    
    def _init_workers(self):
        """初始化发现工作者线程"""
        worker_count = self.config.get('worker_count', 5)
        for i in range(worker_count):
            worker = threading.Thread(
                target=self._discovery_worker,
                name=f"DiscoveryWorker-{i}",
                daemon=True
            )
            worker.start()
            self.discovery_workers.append(worker)
    
    def _discovery_worker(self):
        """发现工作者线程"""
        while True:
            try:
                # 从队列获取发现任务
                task = self.discovery_queue.get(timeout=1)
                if task is None:
                    break
                
                target = task['target']
                discovery_type = task['type']
                task_id = task['task_id']
                
                self.logger.info(f"开始发现任务 {task_id}: {discovery_type} -> {target}")
                
                # 执行发现
                start_time = time.time()
                try:
                    result = self._execute_discovery(target, discovery_type)
                    elapsed_time = time.time() - start_time
                    
                    # 记录结果
                    self.discovery_results[task_id] = {
                        'status': 'success',
                        'result': result,
                        'elapsed_time': elapsed_time,
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    self.logger.info(f"发现任务 {task_id} 完成，耗时 {elapsed_time:.2f} 秒")
                    
                except Exception as e:
                    self.logger.error(f"发现任务 {task_id} 失败: {e}")
                    self.discovery_results[task_id] = {
                        'status': 'failed',
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    }
                
                self.discovery_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                self.logger.error(f"发现工作者线程异常: {e}")
    
    def _execute_discovery(self, target: str, discovery_type: str) -> Dict[str, Any]:
        """执行具体的发现任务"""
        # 根据发现类型调用相应的发现器
        if discovery_type == 'network_scan':
            return self._network_scan_discovery(target)
        elif discovery_type == 'host_info':
            return self._host_info_discovery(target)
        elif discovery_type == 'application':
            return self._application_discovery(target)
        else:
            raise ValueError(f"不支持的发现类型: {discovery_type}")
    
    def _network_scan_discovery(self, target: str) -> Dict[str, Any]:
        """网络扫描发现"""
        # 模拟网络扫描发现
        import random
        import ipaddress
        
        try:
            # 解析目标网络
            network = ipaddress.ip_network(target, strict=False)
            discovered_hosts = []
            
            # 模拟扫描过程
            for ip in network.hosts():
                if random.random() < 0.1:  # 10%的概率发现主机
                    discovered_hosts.append({
                        'ip': str(ip),
                        'hostname': f"host-{str(ip).replace('.', '-')}",
                        'status': 'active',
                        'discovery_time': datetime.now().isoformat()
                    })
            
            return {
                'network': str(network),
                'discovered_hosts': discovered_hosts,
                'total_scanned': network.num_addresses,
                'active_hosts': len(discovered_hosts)
            }
        except Exception as e:
            raise Exception(f"网络扫描失败: {e}")
    
    def _host_info_discovery(self, target: str) -> Dict[str, Any]:
        """主机信息发现"""
        # 模拟主机信息发现
        import random
        
        return {
            'hostname': f"server-{target.replace('.', '-')}",
            'ip_address': target,
            'os_type': random.choice(['Linux', 'Windows', 'Unix']),
            'cpu_cores': random.choice([2, 4, 8, 16, 32]),
            'memory_gb': random.choice([4, 8, 16, 32, 64, 128]),
            'disk_space_gb': random.choice([100, 250, 500, 1000, 2000]),
            'discovery_time': datetime.now().isoformat()
        }
    
    def _application_discovery(self, target: str) -> Dict[str, Any]:
        """应用发现"""
        # 模拟应用发现
        import random
        
        applications = []
        app_types = ['web_server', 'database', 'cache', 'message_queue']
        
        for _ in range(random.randint(1, 5)):
            app_type = random.choice(app_types)
            applications.append({
                'name': f"{app_type}-{random.randint(1, 100)}",
                'type': app_type,
                'version': f"{random.randint(1, 10)}.{random.randint(0, 9)}.{random.randint(0, 9)}",
                'port': random.choice([80, 443, 3306, 6379, 5432, 9092]),
                'status': random.choice(['running', 'stopped']),
                'discovery_time': datetime.now().isoformat()
            })
        
        return {
            'target_host': target,
            'applications': applications,
            'total_applications': len(applications)
        }
    
    def schedule_full_discovery(self, targets: List[Dict[str, Any]]) -> str:
        """调度全量发现任务"""
        discovery_session_id = hashlib.md5(
            f"full_discovery_{datetime.now().isoformat()}".encode()
        ).hexdigest()[:12]
        
        self.logger.info(f"开始调度全量发现会话 {discovery_session_id}，目标数量: {len(targets)}")
        
        # 将发现任务添加到队列
        for i, target_info in enumerate(targets):
            task_id = f"{discovery_session_id}_{i}"
            task = {
                'task_id': task_id,
                'target': target_info['target'],
                'type': target_info['type'],
                'priority': target_info.get('priority', 'normal')
            }
            self.discovery_queue.put(task)
        
        return discovery_session_id
    
    def wait_for_completion(self, session_id: str, timeout: int = 3600) -> Dict[str, Any]:
        """等待发现任务完成"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            # 检查是否所有任务都已完成
            completed_tasks = [
                task_id for task_id in self.discovery_results 
                if task_id.startswith(session_id)
            ]
            
            # 这里简化处理，实际应用中需要更精确的完成判断
            if len(completed_tasks) > 0:
                # 检查是否有未完成的任务
                pending_tasks = [
                    task_id for task_id in self.discovery_results 
                    if task_id.startswith(session_id) and 
                    self.discovery_results[task_id].get('status') is None
                ]
                
                if not pending_tasks:
                    break
            
            time.sleep(5)
        
        # 收集会话结果
        session_results = {
            'session_id': session_id,
            'start_time': datetime.now().isoformat(),
            'completed_tasks': [],
            'failed_tasks': [],
            'statistics': {}
        }
        
        for task_id, result in self.discovery_results.items():
            if task_id.startswith(session_id):
                if result.get('status') == 'success':
                    session_results['completed_tasks'].append({
                        'task_id': task_id,
                        'result': result
                    })
                elif result.get('status') == 'failed':
                    session_results['failed_tasks'].append({
                        'task_id': task_id,
                        'error': result.get('error')
                    })
        
        # 计算统计信息
        total_tasks = len(session_results['completed_tasks']) + len(session_results['failed_tasks'])
        successful_tasks = len(session_results['completed_tasks'])
        
        session_results['statistics'] = {
            'total_tasks': total_tasks,
            'successful_tasks': successful_tasks,
            'failed_tasks': len(session_results['failed_tasks']),
            'success_rate': successful_tasks / total_tasks if total_tasks > 0 else 0,
            'end_time': datetime.now().isoformat()
        }
        
        return session_results
    
    def get_discovery_progress(self, session_id: str) -> Dict[str, Any]:
        """获取发现进度"""
        completed_tasks = [
            task_id for task_id in self.discovery_results 
            if task_id.startswith(session_id) and 
            self.discovery_results[task_id].get('status') is not None
        ]
        
        return {
            'session_id': session_id,
            'completed_tasks': len(completed_tasks),
            'total_tasks': 'unknown',  # 需要额外跟踪
            'progress': len(completed_tasks)  # 简化处理
        }

# 全量发现调度器
class FullDiscoveryScheduler:
    def __init__(self, discovery_manager: FullDiscoveryManager):
        self.discovery_manager = discovery_manager
        self.schedules = {}
        self.logger = logging.getLogger(__name__)
    
    def add_schedule(self, schedule_name: str, targets: List[Dict[str, Any]], 
                    cron_expression: str, enabled: bool = True) -> str:
        """添加发现调度"""
        schedule_id = hashlib.md5(
            f"schedule_{schedule_name}_{datetime.now().isoformat()}".encode()
        ).hexdigest()[:12]
        
        self.schedules[schedule_id] = {
            'name': schedule_name,
            'targets': targets,
            'cron_expression': cron_expression,
            'enabled': enabled,
            'last_run': None,
            'next_run': self._calculate_next_run(cron_expression),
            'created_time': datetime.now().isoformat()
        }
        
        self.logger.info(f"添加发现调度 {schedule_name} (ID: {schedule_id})")
        return schedule_id
    
    def _calculate_next_run(self, cron_expression: str) -> datetime:
        """计算下次运行时间（简化实现）"""
        # 简化处理，实际应用中需要解析cron表达式
        return datetime.now() + timedelta(hours=24)  # 默认24小时后
    
    def run_scheduled_discovery(self, schedule_id: str) -> Dict[str, Any]:
        """运行计划的发现任务"""
        if schedule_id not in self.schedules:
            raise ValueError(f"调度 {schedule_id} 不存在")
        
        schedule = self.schedules[schedule_id]
        if not schedule['enabled']:
            raise ValueError(f"调度 {schedule_id} 已禁用")
        
        self.logger.info(f"运行计划发现任务: {schedule['name']}")
        
        # 调度全量发现
        session_id = self.discovery_manager.schedule_full_discovery(schedule['targets'])
        
        # 等待完成（异步处理时可省略）
        # results = self.discovery_manager.wait_for_completion(session_id)
        
        # 更新调度状态
        schedule['last_run'] = datetime.now().isoformat()
        schedule['next_run'] = self._calculate_next_run(schedule['cron_expression'])
        
        return {
            'schedule_id': schedule_id,
            'session_id': session_id,
            'scheduled_time': datetime.now().isoformat()
        }
    
    def get_schedules(self) -> Dict[str, Any]:
        """获取所有调度"""
        return self.schedules

# 使用示例
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # 配置发现管理器
    config = {
        'worker_count': 3
    }
    
    discovery_manager = FullDiscoveryManager(config)
    scheduler = FullDiscoveryScheduler(discovery_manager)
    
    # 定义发现目标
    targets = [
        {'target': '192.168.1.0/24', 'type': 'network_scan', 'priority': 'high'},
        {'target': '192.168.1.100', 'type': 'host_info', 'priority': 'normal'},
        {'target': '192.168.1.101', 'type': 'host_info', 'priority': 'normal'},
        {'target': '192.168.1.100', 'type': 'application', 'priority': 'low'}
    ]
    
    # 调度全量发现
    session_id = discovery_manager.schedule_full_discovery(targets)
    print(f"已调度发现会话: {session_id}")
    
    # 等待完成
    # results = discovery_manager.wait_for_completion(session_id, timeout=60)
    # print(f"发现结果: {results}")
    
    # 添加调度计划
    schedule_id = scheduler.add_schedule(
        "夜间全量发现",
        targets,
        "0 2 * * *",  # 每天凌晨2点执行
        enabled=True
    )
    
    print(f"已添加调度计划: {schedule_id}")
```

### 全量发现的优势

1. **数据完整性**：能够发现环境中所有配置项，确保数据完整性
2. **一致性保证**：建立统一的数据基线，消除数据不一致问题
3. **错误纠正**：能够纠正增量发现可能遗漏的错误
4. **基准建立**：为后续的增量发现提供基准参考

### 全量发现的挑战

1. **资源消耗大**：需要扫描整个环境，消耗大量系统资源
2. **执行时间长**：大规模环境中可能需要数小时甚至更长时间
3. **对生产影响**：频繁的全量发现可能对生产环境造成影响
4. **成本较高**：需要投入更多的人力和计算资源

### 最佳实践

1. **合理规划频率**：根据环境规模和变化频率确定全量发现频率
2. **分批执行**：将大规模发现任务分批执行，降低单次负载
3. **错峰调度**：选择业务低峰期执行全量发现
4. **资源监控**：实时监控发现过程中的资源消耗
5. **结果验证**：对发现结果进行验证，确保数据质量

## 增量发现策略

### 增量发现概述

增量发现是指只发现自上次发现以来发生变化的配置项，通过事件驱动或定期检查的方式，实现对环境变化的快速响应。这种策略能够显著降低资源消耗，提高发现效率。

### 技术实现

```python
import threading
import time
import json
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Callable
import logging

class IncrementalDiscoveryManager:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.event_listeners = {}
        self.discovery_triggers = {}
        self.last_discovery_times = {}
        self.discovery_cache = {}
        self.logger = logging.getLogger(__name__)
        
    def register_event_listener(self, event_type: str, listener: Callable):
        """注册事件监听器"""
        if event_type not in self.event_listeners:
            self.event_listeners[event_type] = []
        self.event_listeners[event_type].append(listener)
        self.logger.info(f"注册事件监听器: {event_type}")
    
    def register_discovery_trigger(self, trigger_name: str, trigger_func: Callable,
                                 check_interval: int = 300):
        """注册发现触发器"""
        self.discovery_triggers[trigger_name] = {
            'function': trigger_func,
            'interval': check_interval,
            'last_check': datetime.now()
        }
        self.logger.info(f"注册发现触发器: {trigger_name}")
    
    def trigger_event(self, event_type: str, event_data: Dict[str, Any]):
        """触发事件"""
        self.logger.info(f"触发事件: {event_type}")
        
        # 通知所有监听器
        if event_type in self.event_listeners:
            for listener in self.event_listeners[event_type]:
                try:
                    listener(event_data)
                except Exception as e:
                    self.logger.error(f"事件监听器执行失败: {e}")
        
        # 触发相关发现
        self._trigger_related_discovery(event_type, event_data)
    
    def _trigger_related_discovery(self, event_type: str, event_data: Dict[str, Any]):
        """触发相关发现"""
        # 根据事件类型确定需要发现的内容
        if event_type == 'host_provisioned':
            # 主机创建事件，发现主机详细信息
            host_ip = event_data.get('ip_address')
            if host_ip:
                self._discover_host_details(host_ip)
        elif event_type == 'service_deployed':
            # 服务部署事件，发现服务信息
            service_name = event_data.get('service_name')
            if service_name:
                self._discover_service_details(service_name)
        elif event_type == 'network_change':
            # 网络变更事件，发现网络配置
            network_segment = event_data.get('network_segment')
            if network_segment:
                self._discover_network_details(network_segment)
    
    def _discover_host_details(self, host_ip: str):
        """发现主机详细信息"""
        self.logger.info(f"发现主机详细信息: {host_ip}")
        
        # 模拟主机发现
        import random
        
        host_info = {
            'hostname': f"server-{host_ip.replace('.', '-')}",
            'ip_address': host_ip,
            'os_type': random.choice(['Linux', 'Windows', 'Unix']),
            'cpu_cores': random.choice([2, 4, 8, 16, 32]),
            'memory_gb': random.choice([4, 8, 16, 32, 64, 128]),
            'disk_space_gb': random.choice([100, 250, 500, 1000, 2000]),
            'discovery_time': datetime.now().isoformat(),
            'discovery_type': 'incremental'
        }
        
        # 更新缓存
        cache_key = f"host_{host_ip}"
        self.discovery_cache[cache_key] = host_info
        
        # 通知CMDB更新
        self._notify_cmdb_update('host', host_info)
    
    def _discover_service_details(self, service_name: str):
        """发现服务详细信息"""
        self.logger.info(f"发现服务详细信息: {service_name}")
        
        # 模拟服务发现
        import random
        
        service_info = {
            'name': service_name,
            'version': f"{random.randint(1, 10)}.{random.randint(0, 9)}.{random.randint(0, 9)}",
            'status': random.choice(['running', 'stopped', 'starting']),
            'endpoints': [f"http://service-{random.randint(1, 100)}.example.com"],
            'dependencies': [f"service-{random.randint(1, 50)}" for _ in range(random.randint(0, 3))],
            'discovery_time': datetime.now().isoformat(),
            'discovery_type': 'incremental'
        }
        
        # 更新缓存
        cache_key = f"service_{service_name}"
        self.discovery_cache[cache_key] = service_info
        
        # 通知CMDB更新
        self._notify_cmdb_update('service', service_info)
    
    def _discover_network_details(self, network_segment: str):
        """发现网络详细信息"""
        self.logger.info(f"发现网络详细信息: {network_segment}")
        
        # 模拟网络发现
        import random
        import ipaddress
        
        try:
            network = ipaddress.ip_network(network_segment, strict=False)
            network_info = {
                'network': str(network),
                'subnet_mask': str(network.netmask),
                'gateway': str(ipaddress.ip_interface(f"{network.network_address}/24")).split('/')[0],
                'dns_servers': [f"8.8.8.{random.randint(1, 8)}" for _ in range(2)],
                'vlan_id': random.randint(1, 4096),
                'discovery_time': datetime.now().isoformat(),
                'discovery_type': 'incremental'
            }
            
            # 更新缓存
            cache_key = f"network_{network_segment}"
            self.discovery_cache[cache_key] = network_info
            
            # 通知CMDB更新
            self._notify_cmdb_update('network', network_info)
            
        except Exception as e:
            self.logger.error(f"网络发现失败: {e}")
    
    def _notify_cmdb_update(self, ci_type: str, ci_data: Dict[str, Any]):
        """通知CMDB更新"""
        self.logger.info(f"通知CMDB更新 {ci_type}: {ci_data.get('name', ci_data.get('ip_address', 'unknown'))}")
        
        # 这里应该调用CMDB的API来更新数据
        # 实际实现中需要根据具体的CMDB系统进行调整
        try:
            # 模拟API调用
            # response = requests.post(
            #     f"{self.config['cmdb_api_endpoint']}/api/v1/ci/{ci_type}",
            #     json=ci_data,
            #     headers={'Authorization': f"Bearer {self.config['api_token']}"}
            # )
            # if response.status_code == 200:
            #     self.logger.info("CMDB更新成功")
            # else:
            #     self.logger.error(f"CMDB更新失败: {response.status_code}")
            pass
        except Exception as e:
            self.logger.error(f"CMDB更新异常: {e}")
    
    def start_trigger_monitoring(self):
        """启动触发器监控"""
        def monitor_triggers():
            while True:
                try:
                    current_time = datetime.now()
                    for trigger_name, trigger_info in self.discovery_triggers.items():
                        # 检查是否需要执行触发器
                        if (current_time - trigger_info['last_check']).seconds >= trigger_info['interval']:
                            try:
                                should_trigger = trigger_info['function']()
                                if should_trigger:
                                    self.logger.info(f"触发器 {trigger_name} 触发发现")
                                    # 执行发现逻辑
                                    self._execute_triggered_discovery(trigger_name)
                            except Exception as e:
                                self.logger.error(f"触发器 {trigger_name} 执行失败: {e}")
                            
                            # 更新最后检查时间
                            trigger_info['last_check'] = current_time
                    
                    # 休眠一段时间再检查
                    time.sleep(60)
                except Exception as e:
                    self.logger.error(f"触发器监控异常: {e}")
                    time.sleep(60)
        
        # 启动监控线程
        monitor_thread = threading.Thread(target=monitor_triggers, daemon=True)
        monitor_thread.start()
        self.logger.info("启动触发器监控")
    
    def _execute_triggered_discovery(self, trigger_name: str):
        """执行触发的发现"""
        self.logger.info(f"执行触发的发现: {trigger_name}")
        # 具体的发现逻辑根据触发器类型实现
    
    def should_discover(self, target: str, discovery_interval: int = 3600) -> bool:
        """判断是否应该进行发现"""
        last_time = self.last_discovery_times.get(target, 0)
        current_time = time.time()
        return (current_time - last_time) > discovery_interval
    
    def record_discovery_time(self, target: str):
        """记录发现时间"""
        self.last_discovery_times[target] = time.time()
    
    def get_cached_discovery_result(self, target: str) -> Dict[str, Any]:
        """获取缓存的发现结果"""
        return self.discovery_cache.get(target, {})

# 增量发现调度器
class IncrementalDiscoveryScheduler:
    def __init__(self, discovery_manager: IncrementalDiscoveryManager):
        self.discovery_manager = discovery_manager
        self.schedules = {}
        self.logger = logging.getLogger(__name__)
    
    def add_incremental_schedule(self, schedule_name: str, trigger_type: str,
                               trigger_config: Dict[str, Any], enabled: bool = True) -> str:
        """添加增量发现调度"""
        schedule_id = hashlib.md5(
            f"incremental_{schedule_name}_{datetime.now().isoformat()}".encode()
        ).hexdigest()[:12]
        
        self.schedules[schedule_id] = {
            'name': schedule_name,
            'trigger_type': trigger_type,
            'trigger_config': trigger_config,
            'enabled': enabled,
            'last_run': None,
            'created_time': datetime.now().isoformat()
        }
        
        # 注册触发器
        if trigger_type == 'event_based':
            # 基于事件的触发器已在事件监听器中处理
            pass
        elif trigger_type == 'time_based':
            # 基于时间的触发器
            check_interval = trigger_config.get('check_interval', 300)
            self.discovery_manager.register_discovery_trigger(
                schedule_name,
                lambda: self._time_based_trigger(schedule_id),
                check_interval
            )
        
        self.logger.info(f"添加增量发现调度 {schedule_name} (ID: {schedule_id})")
        return schedule_id
    
    def _time_based_trigger(self, schedule_id: str) -> bool:
        """基于时间的触发器"""
        if schedule_id not in self.schedules:
            return False
        
        schedule = self.schedules[schedule_id]
        if not schedule['enabled']:
            return False
        
        # 检查是否满足触发条件
        # 这里简化处理，实际应用中需要根据具体配置判断
        import random
        return random.random() < 0.1  # 10%的概率触发
    
    def get_schedules(self) -> Dict[str, Any]:
        """获取所有调度"""
        return self.schedules

# 使用示例
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # 配置增量发现管理器
    config = {
        'cmdb_api_endpoint': 'http://cmdb.example.com',
        'api_token': 'your-api-token'
    }
    
    discovery_manager = IncrementalDiscoveryManager(config)
    scheduler = IncrementalDiscoveryScheduler(discovery_manager)
    
    # 注册事件监听器
    def host_provisioned_listener(event_data):
        print(f"监听到主机创建事件: {event_data}")
    
    discovery_manager.register_event_listener('host_provisioned', host_provisioned_listener)
    
    # 添加增量发现调度
    schedule_id = scheduler.add_incremental_schedule(
        "服务变更监控",
        "time_based",
        {'check_interval': 600},  # 每10分钟检查一次
        enabled=True
    )
    
    print(f"已添加增量发现调度: {schedule_id}")
    
    # 启动触发器监控
    discovery_manager.start_trigger_monitoring()
    
    # 模拟触发事件
    time.sleep(2)
    discovery_manager.trigger_event('host_provisioned', {
        'ip_address': '192.168.1.100',
        'hostname': 'web-server-01'
    })
```

### 增量发现的优势

1. **资源效率高**：只发现变化的部分，显著降低资源消耗
2. **响应速度快**：能够快速响应环境变化
3. **对生产影响小**：发现范围小，对生产环境影响较小
4. **成本较低**：相比全量发现，运营成本更低

### 增量发现的挑战

1. **完整性风险**：可能遗漏某些变化或无法发现新加入的配置项
2. **复杂性高**：需要建立完善的事件监听和变更检测机制
3. **依赖性强**：依赖于准确的事件源和变更通知机制
4. **错误累积**：长期运行可能导致错误累积，需要定期校正

### 最佳实践

1. **多源事件监听**：从多个源头监听变更事件
2. **变更检测机制**：建立定期的变更检测机制作为补充
3. **错误处理**：完善的错误处理和重试机制
4. **数据校验**：定期与全量发现结果进行对比校验
5. **日志记录**：详细记录发现过程和结果，便于问题排查

## 混合发现策略

### 策略组合

在实际应用中，通常采用全量发现和增量发现相结合的混合策略：

1. **定期全量发现**：按计划执行全量发现，确保数据完整性
2. **实时增量发现**：基于事件驱动执行增量发现，提高响应速度
3. **智能调度**：根据配置项的重要性和变化频率制定不同的发现策略

### 实现示例

```python
class HybridDiscoveryManager:
    def __init__(self, full_discovery_manager: FullDiscoveryManager,
                 incremental_discovery_manager: IncrementalDiscoveryManager):
        self.full_discovery_manager = full_discovery_manager
        self.incremental_discovery_manager = incremental_discovery_manager
        self.discovery_policies = {}
        self.logger = logging.getLogger(__name__)
    
    def add_discovery_policy(self, policy_name: str, ci_type: str,
                           discovery_strategy: str, schedule_config: Dict[str, Any]):
        """添加发现策略"""
        self.discovery_policies[policy_name] = {
            'ci_type': ci_type,
            'strategy': discovery_strategy,  # 'full', 'incremental', 'hybrid'
            'schedule_config': schedule_config,
            'created_time': datetime.now().isoformat()
        }
        self.logger.info(f"添加发现策略 {policy_name} for {ci_type}")
    
    def execute_discovery_by_policy(self, policy_name: str) -> Dict[str, Any]:
        """根据策略执行发现"""
        if policy_name not in self.discovery_policies:
            raise ValueError(f"策略 {policy_name} 不存在")
        
        policy = self.discovery_policies[policy_name]
        strategy = policy['strategy']
        
        self.logger.info(f"根据策略 {policy_name} 执行 {strategy} 发现")
        
        if strategy == 'full':
            # 执行全量发现
            targets = self._get_targets_for_policy(policy)
            session_id = self.full_discovery_manager.schedule_full_discovery(targets)
            return {
                'type': 'full_discovery',
                'session_id': session_id,
                'policy': policy_name
            }
        elif strategy == 'incremental':
            # 执行增量发现
            # 这里需要根据具体策略触发相应的增量发现
            return {
                'type': 'incremental_discovery',
                'policy': policy_name,
                'status': 'triggered'
            }
        elif strategy == 'hybrid':
            # 执行混合策略
            # 可以先执行增量发现，然后根据情况决定是否需要全量发现
            return {
                'type': 'hybrid_discovery',
                'policy': policy_name,
                'status': 'executing'
            }
        else:
            raise ValueError(f"不支持的发现策略: {strategy}")
    
    def _get_targets_for_policy(self, policy: Dict[str, Any]) -> List[Dict[str, Any]]:
        """根据策略获取发现目标"""
        # 这里应该根据策略配置获取相应的发现目标
        # 简化处理，返回示例数据
        return [
            {'target': '192.168.1.0/24', 'type': 'network_scan'},
            {'target': '192.168.1.100', 'type': 'host_info'}
        ]
    
    def get_discovery_statistics(self) -> Dict[str, Any]:
        """获取发现统计信息"""
        return {
            'policies': len(self.discovery_policies),
            'full_discovery_sessions': len([
                sid for sid in self.full_discovery_manager.discovery_results 
                if sid.startswith('full_')
            ]),
            'incremental_discovery_events': len([
                key for key in self.incremental_discovery_manager.discovery_cache 
                if key.startswith('event_')
            ])
        }

# 策略配置示例
def configure_hybrid_discovery():
    """配置混合发现策略"""
    # 初始化发现管理器
    full_config = {'worker_count': 5}
    incremental_config = {
        'cmdb_api_endpoint': 'http://cmdb.example.com',
        'api_token': 'your-api-token'
    }
    
    full_manager = FullDiscoveryManager(full_config)
    incremental_manager = IncrementalDiscoveryManager(incremental_config)
    hybrid_manager = HybridDiscoveryManager(full_manager, incremental_manager)
    
    # 添加发现策略
    hybrid_manager.add_discovery_policy(
        'critical_infrastructure',
        'server',
        'hybrid',
        {
            'full_discovery_interval': 86400,  # 每天一次全量发现
            'incremental_triggers': ['host_provisioned', 'host_deprovisioned']
        }
    )
    
    hybrid_manager.add_discovery_policy(
        'network_devices',
        'network_device',
        'full',
        {
            'full_discovery_interval': 259200  # 每3天一次全量发现
        }
    )
    
    hybrid_manager.add_discovery_policy(
        'applications',
        'application',
        'incremental',
        {
            'incremental_triggers': ['service_deployed', 'service_updated']
        }
    )
    
    return hybrid_manager

# 使用示例
# hybrid_manager = configure_hybrid_discovery()
# result = hybrid_manager.execute_discovery_by_policy('critical_infrastructure')
# print(f"执行发现策略结果: {result}")
```

## 调度优化策略

### 智能调度

```python
class IntelligentDiscoveryScheduler:
    def __init__(self, hybrid_manager: HybridDiscoveryManager):
        self.hybrid_manager = hybrid_manager
        self.performance_metrics = {}
        self.resource_usage = {}
        self.logger = logging.getLogger(__name__)
    
    def optimize_schedule(self, policy_name: str, optimization_params: Dict[str, Any]):
        """优化发现调度"""
        # 收集性能指标
        metrics = self._collect_performance_metrics(policy_name)
        
        # 根据指标调整调度参数
        if metrics['average_duration'] > 3600:  # 如果平均执行时间超过1小时
            # 降低发现频率
            self._adjust_discovery_frequency(policy_name, 'decrease')
        elif metrics['success_rate'] < 0.95:  # 如果成功率低于95%
            # 检查是否需要调整策略
            self._adjust_discovery_strategy(policy_name, 'improve_reliability')
        
        self.logger.info(f"优化调度策略 {policy_name}")
    
    def _collect_performance_metrics(self, policy_name: str) -> Dict[str, Any]:
        """收集性能指标"""
        # 简化实现，实际应用中需要从监控系统获取真实数据
        import random
        
        return {
            'average_duration': random.randint(1800, 7200),  # 30分钟到2小时
            'success_rate': random.uniform(0.85, 0.99),      # 85%到99%
            'resource_usage': random.uniform(0.1, 0.8),      # 10%到80%资源使用率
            'data_accuracy': random.uniform(0.90, 0.99)      # 90%到99%数据准确率
        }
    
    def _adjust_discovery_frequency(self, policy_name: str, adjustment: str):
        """调整发现频率"""
        self.logger.info(f"调整策略 {policy_name} 的发现频率: {adjustment}")
        # 实际实现中需要更新调度配置
    
    def _adjust_discovery_strategy(self, policy_name: str, adjustment: str):
        """调整发现策略"""
        self.logger.info(f"调整策略 {policy_name} 的发现策略: {adjustment}")
        # 实际实现中需要更新策略配置

# 资源感知调度
class ResourceAwareScheduler:
    def __init__(self, hybrid_manager: HybridDiscoveryManager):
        self.hybrid_manager = hybrid_manager
        self.system_resources = {}
        self.logger = logging.getLogger(__name__)
    
    def check_system_resources(self) -> Dict[str, Any]:
        """检查系统资源"""
        import psutil
        
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'disk_percent': (disk.used / disk.total) * 100,
            'available_memory_gb': memory.available / (1024**3),
            'timestamp': datetime.now().isoformat()
        }
    
    def should_execute_discovery(self, resource_thresholds: Dict[str, float] = None) -> bool:
        """判断是否应该执行发现"""
        if resource_thresholds is None:
            resource_thresholds = {
                'cpu_percent': 80.0,
                'memory_percent': 85.0,
                'disk_percent': 90.0
            }
        
        resources = self.check_system_resources()
        
        # 检查是否超过阈值
        if resources['cpu_percent'] > resource_thresholds['cpu_percent']:
            self.logger.warning(f"CPU使用率过高: {resources['cpu_percent']}%")
            return False
        
        if resources['memory_percent'] > resource_thresholds['memory_percent']:
            self.logger.warning(f"内存使用率过高: {resources['memory_percent']}%")
            return False
        
        if resources['disk_percent'] > resource_thresholds['disk_percent']:
            self.logger.warning(f"磁盘使用率过高: {resources['disk_percent']}%")
            return False
        
        return True
    
    def schedule_discovery_with_resource_check(self, policy_name: str) -> Dict[str, Any]:
        """在资源检查后调度发现"""
        if self.should_execute_discovery():
            try:
                result = self.hybrid_manager.execute_discovery_by_policy(policy_name)
                return {
                    'status': 'scheduled',
                    'result': result,
                    'resource_check': 'passed'
                }
            except Exception as e:
                return {
                    'status': 'failed',
                    'error': str(e),
                    'resource_check': 'passed'
                }
        else:
            return {
                'status': 'deferred',
                'reason': 'system_resources_insufficient',
                'resource_check': 'failed'
            }

# 使用示例
# resource_scheduler = ResourceAwareScheduler(hybrid_manager)
# result = resource_scheduler.schedule_discovery_with_resource_check('critical_infrastructure')
# print(f"资源感知调度结果: {result}")
```

## 最佳实践总结

### 1. 策略制定建议

1. **分层策略**：根据配置项的重要性和变化频率制定不同层次的发现策略
2. **动态调整**：根据环境变化和业务需求动态调整发现策略
3. **风险控制**：建立完善的风险控制机制，避免发现任务对生产环境造成影响
4. **监控告警**：建立发现任务的监控和告警机制

### 2. 技术实现建议

1. **模块化设计**：将发现策略、调度机制、执行引擎等模块化设计
2. **可扩展性**：确保系统具有良好的可扩展性，能够适应业务发展
3. **容错处理**：实现完善的错误处理和重试机制
4. **性能优化**：通过并发处理、缓存机制等手段优化性能

### 3. 运营管理建议

1. **定期评估**：定期评估发现策略的有效性并进行优化
2. **文档管理**：建立完整的策略文档和操作手册
3. **团队培训**：对运维团队进行相关培训
4. **持续改进**：建立持续改进机制，不断提升发现效率和质量

## 总结

发现策略与调度机制是CMDB自动发现体系的核心组成部分。通过合理设计全量发现与增量发现策略，并结合智能调度和资源感知机制，可以构建高效、可靠的自动发现体系。在实际实施过程中，需要根据企业的具体环境和业务需求，制定适合的发现策略，并持续优化和改进，以确保CMDB数据的准确性和时效性。