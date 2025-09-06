---
title: 模块化设计与高可用性：元数据服务、数据存储服务、客户端、管理控制台
date: 2025-09-06
categories: [DFS]
tags: [dfs]
published: true
---

模块化设计是构建大型分布式系统的重要原则，通过将系统分解为独立的模块，可以提高系统的可维护性、可测试性和可扩展性。同时，高可用性设计确保系统在各种故障情况下仍能正常运行。本章将深入探讨分布式文件存储平台的模块化设计和高可用性实现，包括元数据服务、数据存储服务、客户端和管理控制台等核心组件。

## 模块化设计的核心理念

模块化设计通过将复杂系统分解为相对独立、功能明确的模块，实现系统的高内聚、低耦合。这种设计方法不仅提高了代码的可维护性，还为系统的扩展和演进提供了良好的基础。

### 模块划分原则

在分布式文件存储平台中，模块划分需要遵循以下原则：

```python
class ModularDesignPrinciples:
    def __init__(self):
        self.principles = {
            'separation_of_concerns': {
                'description': '关注点分离',
                'implementation': self._implement_separation_of_concerns
            },
            'single_responsibility': {
                'description': '单一职责原则',
                'implementation': self._implement_single_responsibility
            },
            'loose_coupling': {
                'description': '松耦合',
                'implementation': self._implement_loose_coupling
            },
            'high_cohesion': {
                'description': '高内聚',
                'implementation': self._implement_high_cohesion
            }
        }
    
    def _implement_separation_of_concerns(self):
        """实现关注点分离"""
        return {
            'access_layer': '处理客户端请求和协议适配',
            'metadata_layer': '管理文件系统元数据',
            'data_layer': '负责实际数据存储',
            'management_layer': '提供系统管理和监控功能'
        }
    
    def _implement_single_responsibility(self):
        """实现单一职责原则"""
        return {
            'metadata_service': '专门负责元数据管理',
            'data_storage_service': '专门负责数据存储',
            'client_service': '专门处理客户端交互',
            'management_console': '专门提供管理界面'
        }
    
    def _implement_loose_coupling(self):
        """实现松耦合"""
        return {
            'interface_based_communication': '通过定义良好的接口进行通信',
            'event_driven_architecture': '采用事件驱动的通信机制',
            'dependency_injection': '使用依赖注入降低耦合度'
        }
    
    def _implement_high_cohesion(self):
        """实现高内聚"""
        return {
            'related_functionality_grouping': '将相关的功能组织在同一模块内',
            'clear_module_boundaries': '明确模块的职责边界',
            'minimal_cross_module_dependencies': '减少模块间的交叉依赖'
        }
    
    def get_design_guidelines(self):
        """获取设计指南"""
        guidelines = {}
        for principle_name, principle_info in self.principles.items():
            guidelines[principle_name] = {
                'description': principle_info['description'],
                'implementation': principle_info['implementation']()
            }
        return guidelines

# 使用示例
design_principles = ModularDesignPrinciples()
guidelines = design_principles.get_design_guidelines()

print("模块化设计指南:")
for principle, info in guidelines.items():
    print(f"\n{principle.replace('_', ' ').title()}:")
    print(f"  描述: {info['description']}")
    print("  实现方式:")
    for key, value in info['implementation'].items():
        print(f"    {key}: {value}")
```

### 模块间通信机制

模块间的通信是模块化设计的关键，需要采用合适的通信机制：

```python
class InterModuleCommunication:
    def __init__(self):
        self.communication_patterns = {
            'synchronous_rpc': self._synchronous_rpc,
            'asynchronous_messaging': self._asynchronous_messaging,
            'event_based_communication': self._event_based_communication,
            'shared_memory': self._shared_memory
        }
    
    def _synchronous_rpc(self, sender, receiver, method, params):
        """同步RPC调用"""
        # 实现同步RPC调用逻辑
        return f"RPC call from {sender} to {receiver}: {method}({params})"
    
    def _asynchronous_messaging(self, sender, receiver, message):
        """异步消息传递"""
        # 实现异步消息传递逻辑
        return f"Async message from {sender} to {receiver}: {message}"
    
    def _event_based_communication(self, event_type, event_data):
        """基于事件的通信"""
        # 实现事件驱动通信逻辑
        return f"Event {event_type} triggered with data: {event_data}"
    
    def _shared_memory(self, module_a, module_b, data):
        """共享内存通信"""
        # 实现共享内存通信逻辑
        return f"Shared memory communication between {module_a} and {module_b}"
    
    def communicate(self, pattern, *args, **kwargs):
        """执行通信"""
        if pattern in self.communication_patterns:
            return self.communication_patterns[pattern](*args, **kwargs)
        else:
            raise ValueError(f"Unsupported communication pattern: {pattern}")

class ModuleInterface:
    """模块接口基类"""
    def __init__(self, module_name):
        self.module_name = module_name
        self.dependencies = []
        self.communication_mechanism = InterModuleCommunication()
    
    def add_dependency(self, dependency):
        """添加依赖"""
        self.dependencies.append(dependency)
    
    def notify_event(self, event_type, event_data):
        """通知事件"""
        return self.communication_mechanism.communicate(
            'event_based_communication',
            event_type,
            event_data
        )
    
    def call_remote_method(self, target_module, method, params):
        """调用远程方法"""
        return self.communication_mechanism.communicate(
            'synchronous_rpc',
            self.module_name,
            target_module,
            method,
            params
        )

# 使用示例
metadata_module = ModuleInterface("MetadataService")
data_module = ModuleInterface("DataStorageService")

# 添加依赖关系
metadata_module.add_dependency(data_module)

# 模块间通信
rpc_result = metadata_module.call_remote_method(
    "DataStorageService",
    "store_block",
    {"block_id": "block_123", "data": "file_data"}
)
print(rpc_result)

event_result = metadata_module.notify_event(
    "file_created",
    {"file_path": "/test/file.txt", "size": 1024}
)
print(event_result)
```

## 元数据服务（Metadata Service）深度解析

元数据服务是分布式文件存储平台的核心组件之一，负责管理文件系统的元数据，包括文件属性、目录结构、访问权限等信息。

### 架构设计

元数据服务需要具备高可用性、高性能和强一致性等特点：

```python
class MetadataService:
    def __init__(self, config):
        self.config = config
        self.service_id = config.get('service_id', 'metadata-service-1')
        self.metadata_store = self._initialize_metadata_store()
        self.cache_layer = self._initialize_cache()
        self.consistency_protocol = self._initialize_consistency_protocol()
        self.namespace_manager = self._initialize_namespace_manager()
        self.permission_manager = self._initialize_permission_manager()
        self.metrics_collector = MetricsCollector()
        self.health_checker = HealthChecker()
    
    def _initialize_metadata_store(self):
        """初始化元数据存储"""
        store_type = self.config.get('metadata_store_type', 'rocksdb')
        if store_type == 'rocksdb':
            return RocksDBMetadataStore(self.config.get('rocksdb_config', {}))
        elif store_type == 'mysql':
            return MySQLMetadataStore(self.config.get('mysql_config', {}))
        elif store_type == 'etcd':
            return EtcdMetadataStore(self.config.get('etcd_config', {}))
        else:
            raise ValueError(f"Unsupported metadata store type: {store_type}")
    
    def _initialize_cache(self):
        """初始化缓存层"""
        cache_config = self.config.get('cache_config', {})
        return LRUCache(cache_config.get('size', 10000))
    
    def _initialize_consistency_protocol(self):
        """初始化一致性协议"""
        protocol = self.config.get('consistency_protocol', 'raft')
        if protocol == 'raft':
            return RaftConsensus(self.config.get('raft_config', {}))
        elif protocol == 'paxos':
            return PaxosConsensus(self.config.get('paxos_config', {}))
        else:
            return SimpleConsistency()
    
    def _initialize_namespace_manager(self):
        """初始化命名空间管理器"""
        return NamespaceManager()
    
    def _initialize_permission_manager(self):
        """初始化权限管理器"""
        return PermissionManager()
    
    def get_file_attributes(self, file_path):
        """获取文件属性"""
        start_time = time.time()
        try:
            # 1. 检查缓存
            cache_key = f"attrs:{file_path}"
            cached_attrs = self.cache_layer.get(cache_key)
            if cached_attrs:
                self.metrics_collector.increment('cache_hits')
                return cached_attrs
            
            # 2. 从存储获取
            attrs = self.metadata_store.get_file_attributes(file_path)
            if attrs:
                # 3. 更新缓存
                self.cache_layer.put(cache_key, attrs)
                self.metrics_collector.increment('cache_misses')
                return attrs
            
            raise FileNotFoundError(f"File not found: {file_path}")
        except Exception as e:
            self.metrics_collector.increment('errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('get_file_attributes_duration', duration)
    
    def set_file_attributes(self, file_path, attributes):
        """设置文件属性"""
        start_time = time.time()
        try:
            # 1. 验证权限
            if not self.permission_manager.check_permission(file_path, 'write'):
                raise PermissionError("Write permission denied")
            
            # 2. 更新存储
            self.metadata_store.set_file_attributes(file_path, attributes)
            
            # 3. 更新缓存
            cache_key = f"attrs:{file_path}"
            self.cache_layer.put(cache_key, attributes)
            
            # 4. 通知一致性协议
            self.consistency_protocol.notify_update(file_path, attributes)
            
            # 5. 更新命名空间
            if attributes.get('type') == 'file':
                self.namespace_manager.add_file(file_path)
            elif attributes.get('type') == 'directory':
                self.namespace_manager.add_directory(file_path)
            
            self.metrics_collector.increment('successful_updates')
        except Exception as e:
            self.metrics_collector.increment('update_errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('set_file_attributes_duration', duration)
    
    def create_file(self, file_path, initial_attributes=None):
        """创建文件"""
        start_time = time.time()
        try:
            # 1. 检查父目录权限
            parent_dir = os.path.dirname(file_path)
            if not self.permission_manager.check_permission(parent_dir, 'write'):
                raise PermissionError("Write permission denied for parent directory")
            
            # 2. 创建文件元数据
            file_metadata = {
                'type': 'file',
                'size': 0,
                'created_time': time.time(),
                'modified_time': time.time(),
                'permissions': initial_attributes.get('permissions', 'rw-r--r--') if initial_attributes else 'rw-r--r--'
            }
            
            # 3. 合并初始属性
            if initial_attributes:
                file_metadata.update(initial_attributes)
            
            # 4. 存储元数据
            self.set_file_attributes(file_path, file_metadata)
            
            self.metrics_collector.increment('files_created')
            return file_metadata
        except Exception as e:
            self.metrics_collector.increment('create_file_errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('create_file_duration', duration)
    
    def delete_file(self, file_path):
        """删除文件"""
        start_time = time.time()
        try:
            # 1. 检查权限
            if not self.permission_manager.check_permission(file_path, 'delete'):
                raise PermissionError("Delete permission denied")
            
            # 2. 删除元数据
            self.metadata_store.delete_file(file_path)
            
            # 3. 清除缓存
            cache_key = f"attrs:{file_path}"
            self.cache_layer.remove(cache_key)
            
            # 4. 更新命名空间
            self.namespace_manager.remove_file(file_path)
            
            # 5. 通知一致性协议
            self.consistency_protocol.notify_delete(file_path)
            
            self.metrics_collector.increment('files_deleted')
        except Exception as e:
            self.metrics_collector.increment('delete_file_errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('delete_file_duration', duration)
    
    def list_directory(self, dir_path):
        """列出目录内容"""
        start_time = time.time()
        try:
            # 1. 检查权限
            if not self.permission_manager.check_permission(dir_path, 'read'):
                raise PermissionError("Read permission denied")
            
            # 2. 从命名空间管理器获取
            listing = self.namespace_manager.list_directory(dir_path)
            
            self.metrics_collector.increment('directory_listings')
            return listing
        except Exception as e:
            self.metrics_collector.increment('list_directory_errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('list_directory_duration', duration)
    
    def health_check(self):
        """健康检查"""
        return {
            'status': 'healthy' if self.health_checker.is_healthy() else 'unhealthy',
            'service_id': self.service_id,
            'uptime': time.time() - getattr(self, '_start_time', time.time()),
            'metrics': self.metrics_collector.get_metrics()
        }

class MetadataStore:
    """元数据存储接口"""
    def get_file_attributes(self, file_path):
        """获取文件属性"""
        raise NotImplementedError
    
    def set_file_attributes(self, file_path, attributes):
        """设置文件属性"""
        raise NotImplementedError
    
    def delete_file(self, file_path):
        """删除文件"""
        raise NotImplementedError

class RocksDBMetadataStore(MetadataStore):
    def __init__(self, config):
        self.config = config
        self.db = self._initialize_rocksdb()
    
    def _initialize_rocksdb(self):
        """初始化RocksDB"""
        # 实现RocksDB初始化逻辑
        import rocksdb
        opts = rocksdb.Options()
        opts.create_if_missing = True
        return rocksdb.DB(self.config.get('db_path', '/tmp/metadata.db'), opts)
    
    def get_file_attributes(self, file_path):
        """获取文件属性"""
        try:
            value = self.db.get(file_path.encode('utf-8'))
            if value:
                return json.loads(value.decode('utf-8'))
            return None
        except Exception as e:
            print(f"Error getting file attributes: {e}")
            return None
    
    def set_file_attributes(self, file_path, attributes):
        """设置文件属性"""
        try:
            self.db.put(
                file_path.encode('utf-8'),
                json.dumps(attributes).encode('utf-8')
            )
        except Exception as e:
            print(f"Error setting file attributes: {e}")
            raise
    
    def delete_file(self, file_path):
        """删除文件"""
        try:
            self.db.delete(file_path.encode('utf-8'))
        except Exception as e:
            print(f"Error deleting file: {e}")
            raise

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()
    
    def get(self, key):
        """获取缓存项"""
        if key in self.cache:
            # 移动到末尾表示最近使用
            self.cache.move_to_end(key)
            return self.cache[key]
        return None
    
    def put(self, key, value):
        """放入缓存项"""
        if key in self.cache:
            # 更新现有项
            self.cache.move_to_end(key)
        elif len(self.cache) >= self.capacity:
            # 删除最久未使用的项
            self.cache.popitem(last=False)
        
        self.cache[key] = value
    
    def remove(self, key):
        """移除缓存项"""
        if key in self.cache:
            del self.cache[key]

class MetricsCollector:
    def __init__(self):
        self.counters = defaultdict(int)
        self.histograms = defaultdict(list)
    
    def increment(self, metric_name):
        """增加计数器"""
        self.counters[metric_name] += 1
    
    def observe(self, metric_name, value):
        """观察直方图值"""
        self.histograms[metric_name].append(value)
    
    def get_metrics(self):
        """获取指标"""
        metrics = {
            'counters': dict(self.counters),
            'histograms': {}
        }
        
        for name, values in self.histograms.items():
            if values:
                metrics['histograms'][name] = {
                    'count': len(values),
                    'avg': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values)
                }
        
        return metrics

class HealthChecker:
    def __init__(self):
        self.checks = [
            self._check_storage_health,
            self._check_network_connectivity,
            self._check_system_resources
        ]
    
    def is_healthy(self):
        """检查健康状态"""
        for check in self.checks:
            if not check():
                return False
        return True
    
    def _check_storage_health(self):
        """检查存储健康"""
        # 实现存储健康检查逻辑
        return True
    
    def _check_network_connectivity(self):
        """检查网络连接"""
        # 实现网络连接检查逻辑
        return True
    
    def _check_system_resources(self):
        """检查系统资源"""
        # 实现系统资源检查逻辑
        return True
```

### 高可用性设计

元数据服务需要具备高可用性以确保系统的可靠性：

```python
class MetadataServiceCluster:
    def __init__(self, services_config):
        self.services = []
        self.leader_elector = LeaderElector()
        self.health_monitor = HealthMonitor()
        self.failover_manager = FailoverManager()
        self.load_balancer = LoadBalancer()
        
        # 初始化服务集群
        for config in services_config:
            service = MetadataService(config)
            self.services.append(service)
        
        # 启动健康监控
        self.health_monitor.start_monitoring(self.services)
        self.health_monitor.add_failure_callback(self._handle_service_failure)
    
    def get_file_attributes(self, file_path):
        """获取文件属性（高可用）"""
        # 1. 获取当前领导者
        leader = self.leader_elector.get_current_leader()
        if leader:
            try:
                return leader.get_file_attributes(file_path)
            except Exception as e:
                print(f"Leader failed: {e}")
                # 触发故障转移
                self.failover_manager.trigger_failover(leader)
        
        # 2. 尝试其他健康节点
        for service in self.services:
            if service != leader and self.health_monitor.is_healthy(service):
                try:
                    return service.get_file_attributes(file_path)
                except Exception as e:
                    print(f"Service {service.service_id} failed: {e}")
                    continue
        
        raise ServiceUnavailableError("No available metadata service")
    
    def set_file_attributes(self, file_path, attributes):
        """设置文件属性（高可用）"""
        # 1. 获取当前领导者
        leader = self.leader_elector.get_current_leader()
        if not leader:
            raise ServiceUnavailableError("No leader available")
        
        try:
            return leader.set_file_attributes(file_path, attributes)
        except Exception as e:
            print(f"Leader failed: {e}")
            # 触发故障转移
            self.failover_manager.trigger_failover(leader)
            raise
    
    def _handle_service_failure(self, failed_service):
        """处理服务故障"""
        print(f"Handling failure of service: {failed_service.service_id}")
        
        # 1. 隔离故障服务
        self.load_balancer.remove_service(failed_service)
        
        # 2. 触发故障转移
        self.failover_manager.trigger_failover(failed_service)
        
        # 3. 重新平衡负载
        self.load_balancer.rebalance()

class LeaderElector:
    def __init__(self):
        self.current_leader = None
        self.election_protocol = RaftElectionProtocol()
    
    def get_current_leader(self):
        """获取当前领导者"""
        if not self.current_leader or not self.current_leader.is_healthy():
            self._elect_new_leader()
        return self.current_leader
    
    def _elect_new_leader(self):
        """选举新领导者"""
        # 实现领导者选举逻辑
        self.current_leader = self.election_protocol.elect_leader()
        print(f"New leader elected: {self.current_leader.service_id if self.current_leader else 'None'}")

class HealthMonitor:
    def __init__(self):
        self.monitored_services = []
        self.failure_callbacks = []
        self.monitoring_interval = 5  # 秒
    
    def start_monitoring(self, services):
        """启动监控"""
        self.monitored_services = services
        self._start_monitoring_loop()
    
    def add_failure_callback(self, callback):
        """添加故障回调"""
        self.failure_callbacks.append(callback)
    
    def is_healthy(self, service):
        """检查服务健康状态"""
        try:
            health_info = service.health_check()
            return health_info['status'] == 'healthy'
        except Exception:
            return False
    
    def _start_monitoring_loop(self):
        """启动监控循环"""
        def monitoring_loop():
            while True:
                self._check_service_health()
                time.sleep(self.monitoring_interval)
        
        monitor_thread = threading.Thread(target=monitoring_loop, daemon=True)
        monitor_thread.start()
    
    def _check_service_health(self):
        """检查服务健康状态"""
        for service in self.monitored_services:
            if not self.is_healthy(service):
                self._report_service_failure(service)
    
    def _report_service_failure(self, service):
        """报告服务故障"""
        for callback in self.failure_callbacks:
            try:
                callback(service)
            except Exception as e:
                print(f"Error in failure callback: {e}")

class FailoverManager:
    def __init__(self):
        self.failover_history = []
    
    def trigger_failover(self, failed_service):
        """触发故障转移"""
        failover_record = {
            'failed_service': failed_service.service_id,
            'timestamp': time.time(),
            'recovery_actions': []
        }
        
        # 1. 隔离故障服务
        self._isolate_failed_service(failed_service)
        failover_record['recovery_actions'].append('service_isolated')
        
        # 2. 选举新领导者
        self._elect_new_leader()
        failover_record['recovery_actions'].append('new_leader_elected')
        
        # 3. 数据同步
        self._synchronize_data()
        failover_record['recovery_actions'].append('data_synchronized')
        
        self.failover_history.append(failover_record)
        print(f"Failover completed for service: {failed_service.service_id}")
    
    def _isolate_failed_service(self, service):
        """隔离故障服务"""
        # 实现服务隔离逻辑
        service.isolated = True
    
    def _elect_new_leader(self):
        """选举新领导者"""
        # 实现领导者选举逻辑
        pass
    
    def _synchronize_data(self):
        """同步数据"""
        # 实现数据同步逻辑
        pass

class LoadBalancer:
    def __init__(self):
        self.services = []
        self.algorithm = 'round_robin'
        self.current_index = 0
    
    def add_service(self, service):
        """添加服务"""
        self.services.append(service)
    
    def remove_service(self, service):
        """移除服务"""
        if service in self.services:
            self.services.remove(service)
    
    def get_service(self):
        """获取服务"""
        if not self.services:
            return None
        
        if self.algorithm == 'round_robin':
            service = self.services[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.services)
            return service
        elif self.algorithm == 'least_connections':
            return min(self.services, key=lambda s: getattr(s, 'active_connections', 0))
        else:
            return self.services[0]
    
    def rebalance(self):
        """重新平衡"""
        # 实现重新平衡逻辑
        pass
```

## 数据存储服务（Data Storage Service）深度解析

数据存储服务负责实际的文件数据存储和管理，是分布式文件存储平台的核心组件。

### 架构设计

数据存储服务需要提供高可靠性、高性能和高可扩展性的数据存储服务：

```python
class DataStorageService:
    def __init__(self, config):
        self.config = config
        self.service_id = config.get('service_id', 'data-storage-service-1')
        self.storage_engine = self._initialize_storage_engine()
        self.replication_manager = self._initialize_replication_manager()
        self.erasure_coding_manager = self._initialize_erasure_coding_manager()
        self.data_balancer = self._initialize_data_balancer()
        self.health_monitor = self._initialize_health_monitor()
        self.metrics_collector = MetricsCollector()
        self.cache_manager = self._initialize_cache()
    
    def _initialize_storage_engine(self):
        """初始化存储引擎"""
        engine_type = self.config.get('storage_engine', 'rocksdb')
        if engine_type == 'rocksdb':
            return RocksDBStorageEngine(self.config.get('rocksdb_config', {}))
        elif engine_type == 'filesystem':
            return FileSystemStorageEngine(self.config.get('filesystem_config', {}))
        else:
            raise ValueError(f"Unsupported storage engine: {engine_type}")
    
    def _initialize_replication_manager(self):
        """初始化副本管理器"""
        return ReplicationManager(self.config.get('replication_factor', 3))
    
    def _initialize_erasure_coding_manager(self):
        """初始化纠删码管理器"""
        return ErasureCodingManager(
            self.config.get('erasure_coding_k', 6),
            self.config.get('erasure_coding_m', 3)
        )
    
    def _initialize_data_balancer(self):
        """初始化数据均衡器"""
        return DataBalancer()
    
    def _initialize_health_monitor(self):
        """初始化健康监控器"""
        return HealthMonitor()
    
    def _initialize_cache(self):
        """初始化缓存"""
        return BlockCache(self.config.get('cache_config', {}))
    
    def store_block(self, block_id, data, redundancy_type='replication'):
        """存储数据块"""
        start_time = time.time()
        try:
            # 1. 检查缓存
            if self.cache_manager.get(block_id):
                self.metrics_collector.increment('cache_hits')
                return True
            
            # 2. 存储到本地引擎
            self.storage_engine.put(block_id, data)
            
            # 3. 应用冗余策略
            if redundancy_type == 'replication':
                self.replication_manager.create_replicas(block_id, data)
            elif redundancy_type == 'erasure_coding':
                self.erasure_coding_manager.encode_and_store(block_id, data)
            
            # 4. 更新缓存
            self.cache_manager.put(block_id, data)
            
            self.metrics_collector.increment('blocks_stored')
            return True
        except Exception as e:
            self.metrics_collector.increment('store_errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('store_block_duration', duration)
    
    def retrieve_block(self, block_id, redundancy_type='replication'):
        """检索数据块"""
        start_time = time.time()
        try:
            # 1. 检查本地缓存
            cached_data = self.cache_manager.get(block_id)
            if cached_data:
                self.metrics_collector.increment('cache_hits')
                return cached_data
            
            # 2. 尝试从本地存储读取
            try:
                data = self.storage_engine.get(block_id)
                if data:
                    # 3. 更新缓存
                    self.cache_manager.put(block_id, data)
                    self.metrics_collector.increment('local_retrievals')
                    return data
            except Exception as e:
                print(f"Local storage read failed: {e}")
            
            # 4. 从冗余副本恢复
            if redundancy_type == 'replication':
                data = self.replication_manager.recover_from_replicas(block_id)
            elif redundancy_type == 'erasure_coding':
                data = self.erasure_coding_manager.recover_from_encoding(block_id)
            else:
                raise ValueError(f"Unsupported redundancy type: {redundancy_type}")
            
            # 5. 更新缓存和本地存储
            self.cache_manager.put(block_id, data)
            self.storage_engine.put(block_id, data)
            
            self.metrics_collector.increment('recovery_retrievals')
            return data
        except Exception as e:
            self.metrics_collector.increment('retrieve_errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('retrieve_block_duration', duration)
    
    def delete_block(self, block_id):
        """删除数据块"""
        start_time = time.time()
        try:
            # 1. 删除本地数据
            self.storage_engine.delete(block_id)
            
            # 2. 删除冗余副本
            self.replication_manager.delete_replicas(block_id)
            self.erasure_coding_manager.delete_encoding(block_id)
            
            # 3. 清理缓存
            self.cache_manager.remove(block_id)
            
            self.metrics_collector.increment('blocks_deleted')
        except Exception as e:
            self.metrics_collector.increment('delete_errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('delete_block_duration', duration)
    
    def balance_data(self):
        """平衡数据分布"""
        start_time = time.time()
        try:
            # 1. 分析存储使用情况
            usage_stats = self.health_monitor.get_storage_usage()
            
            # 2. 识别不平衡节点
            imbalanced_nodes = self._identify_imbalanced_nodes(usage_stats)
            
            # 3. 执行数据迁移
            for node in imbalanced_nodes:
                self.data_balancer.rebalance_node(node)
            
            self.metrics_collector.increment('data_balancing_operations')
        except Exception as e:
            self.metrics_collector.increment('balancing_errors')
            raise
        finally:
            duration = time.time() - start_time
            self.metrics_collector.observe('balance_data_duration', duration)
    
    def _identify_imbalanced_nodes(self, usage_stats):
        """识别不平衡节点"""
        # 计算平均使用率
        avg_usage = sum(stats['utilization'] for stats in usage_stats.values()) / len(usage_stats)
        
        # 识别使用率超过平均值20%的节点
        threshold = avg_usage * 1.2
        imbalanced_nodes = [
            node_id for node_id, stats in usage_stats.items()
            if stats['utilization'] > threshold
        ]
        
        return imbalanced_nodes
    
    def health_check(self):
        """健康检查"""
        return {
            'status': 'healthy' if self.health_monitor.is_healthy() else 'unhealthy',
            'service_id': self.service_id,
            'storage_usage': self.health_monitor.get_storage_usage(),
            'metrics': self.metrics_collector.get_metrics()
        }

class StorageEngine:
    """存储引擎接口"""
    def put(self, key, value):
        """存储数据"""
        raise NotImplementedError
    
    def get(self, key):
        """获取数据"""
        raise NotImplementedError
    
    def delete(self, key):
        """删除数据"""
        raise NotImplementedError

class RocksDBStorageEngine(StorageEngine):
    def __init__(self, config):
        self.config = config
        self.db = self._initialize_rocksdb()
    
    def _initialize_rocksdb(self):
        """初始化RocksDB"""
        import rocksdb
        opts = rocksdb.Options()
        opts.create_if_missing = True
        db_path = self.config.get('db_path', '/tmp/data_storage.db')
        return rocksdb.DB(db_path, opts)
    
    def put(self, key, value):
        """存储数据"""
        self.db.put(key.encode('utf-8'), value)
    
    def get(self, key):
        """获取数据"""
        return self.db.get(key.encode('utf-8'))
    
    def delete(self, key):
        """删除数据"""
        self.db.delete(key.encode('utf-8'))

class BlockCache:
    def __init__(self, config):
        self.config = config
        self.cache = LRUCache(config.get('size', 1000))
    
    def get(self, block_id):
        """获取缓存块"""
        return self.cache.get(block_id)
    
    def put(self, block_id, data):
        """放入缓存块"""
        self.cache.put(block_id, data)
    
    def remove(self, block_id):
        """移除缓存块"""
        self.cache.remove(block_id)

class ReplicationManager:
    def __init__(self, replication_factor=3):
        self.replication_factor = replication_factor
        self.replica_locations = {}
    
    def create_replicas(self, block_id, data):
        """创建数据副本"""
        # 在实际实现中，这里会选择多个存储节点来存储副本
        # 简化实现，只记录副本信息
        replicas = []
        for i in range(self.replication_factor):
            replicas.append({
                'replica_id': f"{block_id}_replica_{i}",
                'node_id': f"node_{i % 5}",  # 假设有5个节点
                'status': 'created'
            })
        
        self.replica_locations[block_id] = replicas
        return replicas
    
    def recover_from_replicas(self, block_id):
        """从副本恢复数据"""
        if block_id not in self.replica_locations:
            raise DataNotFoundError(f"No replicas found for block: {block_id}")
        
        # 在实际实现中，会尝试从不同的副本节点获取数据
        # 简化实现，返回模拟数据
        return b"recovered_data_from_replica"
    
    def delete_replicas(self, block_id):
        """删除副本"""
        if block_id in self.replica_locations:
            del self.replica_locations[block_id]

class ErasureCodingManager:
    def __init__(self, k=6, m=3):
        self.k = k  # 数据块数
        self.m = m  # 校验块数
        self.block_locations = {}
    
    def encode_and_store(self, block_id, data):
        """编码并存储数据"""
        # 在实际实现中，会将数据分割并生成校验块
        # 简化实现，只记录块信息
        blocks = []
        for i in range(self.k + self.m):
            blocks.append({
                'block_id': f"{block_id}_block_{i}",
                'node_id': f"node_{i % 5}",  # 假设有5个节点
                'is_data_block': i