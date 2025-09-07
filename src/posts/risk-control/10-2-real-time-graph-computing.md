---
title: "实时图计算: 识别关联欺诈、社区发现、风险传播"
date: 2025-09-07
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 实时图计算：识别关联欺诈、社区发现、风险传播

## 引言

在企业级智能风控平台中，实时图计算已成为识别复杂欺诈模式和挖掘隐藏风险关系的核心技术手段。传统的基于规则或统计的方法往往只能发现简单的风险模式，而图计算能够通过分析实体间的复杂关联关系，揭示出更为隐蔽的团伙欺诈、中介网络和风险传播路径。

实时图计算要求系统能够在数据流入的同时快速完成图结构的更新和分析计算，这对系统的性能、扩展性和算法效率都提出了极高的要求。通过实时图计算，风控系统能够及时发现新出现的风险模式，快速响应不断演进的欺诈手段。

本文将深入探讨实时图计算的核心技术要点，包括实时图更新、高效算法实现、风险模式识别以及实际应用案例，为构建高性能的风控图计算系统提供指导。

## 一、实时图计算架构

### 1.1 系统架构设计

实时图计算系统需要在保证低延迟的同时处理高并发的数据流，其架构设计直接影响着系统的性能和可靠性。

#### 1.1.1 核心组件

**数据接入层**：
```python
# 实时图计算系统架构
import asyncio
import time
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import threading
import queue

class GraphEventType(Enum):
    """图事件类型"""
    VERTEX_ADD = "vertex_add"        # 添加节点
    VERTEX_UPDATE = "vertex_update"  # 更新节点
    EDGE_ADD = "edge_add"            # 添加边
    EDGE_REMOVE = "edge_remove"      # 删除边
    VERTEX_REMOVE = "vertex_remove"  # 删除节点

@dataclass
class GraphEvent:
    """图事件"""
    event_type: GraphEventType
    entity_id: str
    entity_type: str
    properties: Dict
    timestamp: float
    source: str = "unknown"

class DataIngestionLayer:
    """数据接入层"""
    
    def __init__(self, event_queue: queue.Queue):
        self.event_queue = event_queue
        self.processors = []
        self.running = False
    
    def add_processor(self, processor: Callable):
        """添加数据处理器"""
        self.processors.append(processor)
    
    def start_ingestion(self):
        """启动数据接入"""
        self.running = True
        ingestion_thread = threading.Thread(target=self._ingestion_loop)
        ingestion_thread.start()
        print("数据接入层已启动")
    
    def stop_ingestion(self):
        """停止数据接入"""
        self.running = False
    
    def _ingestion_loop(self):
        """数据接入循环"""
        while self.running:
            # 模拟从不同数据源接收数据
            try:
                # 这里可以接入Kafka、消息队列等
                event = self._generate_mock_event()
                if event:
                    self.event_queue.put(event)
                    # 通知处理器
                    for processor in self.processors:
                        processor(event)
                
                time.sleep(0.01)  # 10ms间隔
            except Exception as e:
                print(f"数据接入异常: {e}")
    
    def _generate_mock_event(self) -> Optional[GraphEvent]:
        """生成模拟事件（实际应用中从数据源获取）"""
        import random
        
        # 随机生成事件类型
        event_types = list(GraphEventType)
        event_type = random.choice(event_types)
        
        # 生成事件数据
        if event_type == GraphEventType.VERTEX_ADD:
            entity_id = f"user_{random.randint(1000, 9999)}"
            return GraphEvent(
                event_type=event_type,
                entity_id=entity_id,
                entity_type="USER",
                properties={
                    "name": f"用户{entity_id}",
                    "register_time": time.time(),
                    "risk_score": random.random()
                },
                timestamp=time.time()
            )
        elif event_type == GraphEventType.EDGE_ADD:
            user_id = f"user_{random.randint(1000, 9999)}"
            device_id = f"device_{random.randint(100, 999)}"
            return GraphEvent(
                event_type=event_type,
                entity_id=f"{user_id}-{device_id}",
                entity_type="USER_DEVICE",
                properties={
                    "user_id": user_id,
                    "device_id": device_id,
                    "login_time": time.time(),
                    "ip_address": f"192.168.1.{random.randint(1, 255)}"
                },
                timestamp=time.time()
            )
        
        return None

# 使用示例
def example_data_ingestion():
    """数据接入示例"""
    event_queue = queue.Queue()
    ingestion_layer = DataIngestionLayer(event_queue)
    
    def mock_processor(event: GraphEvent):
        print(f"处理事件: {event.event_type.value} - {event.entity_id}")
    
    ingestion_layer.add_processor(mock_processor)
    ingestion_layer.start_ingestion()
    
    # 运行1秒
    time.sleep(1)
    ingestion_layer.stop_ingestion()
```

#### 1.1.2 图存储层

**内存图存储**：
```python
# 内存图存储实现
import threading
from collections import defaultdict
import copy

class InMemoryGraphStore:
    """内存图存储"""
    
    def __init__(self):
        self.vertices = {}  # 节点存储
        self.edges = {}     # 边存储
        self.vertex_index = defaultdict(set)  # 节点索引
        self.edge_index = defaultdict(set)    # 边索引
        self.lock = threading.RWLock() if hasattr(threading, 'RWLock') else threading.Lock()
    
    def add_vertex(self, vertex_id: str, vertex_type: str, properties: Dict):
        """添加节点"""
        with self.lock:
            self.vertices[vertex_id] = {
                'type': vertex_type,
                'properties': copy.deepcopy(properties),
                'in_edges': set(),
                'out_edges': set(),
                'created_at': time.time(),
                'updated_at': time.time()
            }
            
            # 更新索引
            self.vertex_index[vertex_type].add(vertex_id)
    
    def update_vertex(self, vertex_id: str, properties: Dict):
        """更新节点"""
        with self.lock:
            if vertex_id in self.vertices:
                self.vertices[vertex_id]['properties'].update(properties)
                self.vertices[vertex_id]['updated_at'] = time.time()
                return True
            return False
    
    def add_edge(self, edge_id: str, source_id: str, target_id: str, 
                 edge_type: str, properties: Dict):
        """添加边"""
        with self.lock:
            # 检查节点是否存在
            if source_id not in self.vertices or target_id not in self.vertices:
                return False
            
            self.edges[edge_id] = {
                'source': source_id,
                'target': target_id,
                'type': edge_type,
                'properties': copy.deepcopy(properties),
                'created_at': time.time(),
                'updated_at': time.time()
            }
            
            # 更新节点的边引用
            self.vertices[source_id]['out_edges'].add(edge_id)
            self.vertices[target_id]['in_edges'].add(edge_id)
            
            # 更新索引
            self.edge_index[edge_type].add(edge_id)
            
            return True
    
    def get_vertex(self, vertex_id: str) -> Optional[Dict]:
        """获取节点"""
        with self.lock:
            return self.vertices.get(vertex_id)
    
    def get_edges_by_vertex(self, vertex_id: str, direction: str = 'both') -> List[Dict]:
        """根据节点获取边"""
        with self.lock:
            if vertex_id not in self.vertices:
                return []
            
            edge_ids = set()
            if direction in ['out', 'both']:
                edge_ids.update(self.vertices[vertex_id]['out_edges'])
            if direction in ['in', 'both']:
                edge_ids.update(self.vertices[vertex_id]['in_edges'])
            
            return [self.edges[edge_id] for edge_id in edge_ids if edge_id in self.edges]
    
    def get_neighbors(self, vertex_id: str, edge_type: Optional[str] = None) -> List[str]:
        """获取邻居节点"""
        with self.lock:
            if vertex_id not in self.vertices:
                return []
            
            neighbors = set()
            
            # 获取出边邻居
            for edge_id in self.vertices[vertex_id]['out_edges']:
                if edge_id in self.edges:
                    edge = self.edges[edge_id]
                    if edge_type is None or edge['type'] == edge_type:
                        neighbors.add(edge['target'])
            
            # 获取入边邻居
            for edge_id in self.vertices[vertex_id]['in_edges']:
                if edge_id in self.edges:
                    edge = self.edges[edge_id]
                    if edge_type is None or edge['type'] == edge_type:
                        neighbors.add(edge['source'])
            
            return list(neighbors)
    
    def get_vertices_by_type(self, vertex_type: str) -> List[str]:
        """根据类型获取节点"""
        with self.lock:
            return list(self.vertex_index.get(vertex_type, set()))
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        with self.lock:
            return {
                'vertex_count': len(self.vertices),
                'edge_count': len(self.edges),
                'vertex_types': {k: len(v) for k, v in self.vertex_index.items()},
                'edge_types': {k: len(v) for k, v in self.edge_index.items()}
            }

# 图更新处理器
class GraphUpdateProcessor:
    """图更新处理器"""
    
    def __init__(self, graph_store: InMemoryGraphStore):
        self.graph_store = graph_store
        self.event_handlers = {
            GraphEventType.VERTEX_ADD: self._handle_vertex_add,
            GraphEventType.VERTEX_UPDATE: self._handle_vertex_update,
            GraphEventType.EDGE_ADD: self._handle_edge_add,
            GraphEventType.EDGE_REMOVE: self._handle_edge_remove,
            GraphEventType.VERTEX_REMOVE: self._handle_vertex_remove
        }
    
    def process_event(self, event: GraphEvent):
        """处理图事件"""
        handler = self.event_handlers.get(event.event_type)
        if handler:
            try:
                handler(event)
                print(f"处理事件成功: {event.event_type.value} - {event.entity_id}")
            except Exception as e:
                print(f"处理事件失败: {event.event_type.value} - {event.entity_id}, 错误: {e}")
        else:
            print(f"未知事件类型: {event.event_type}")
    
    def _handle_vertex_add(self, event: GraphEvent):
        """处理节点添加事件"""
        self.graph_store.add_vertex(
            event.entity_id,
            event.entity_type,
            event.properties
        )
    
    def _handle_vertex_update(self, event: GraphEvent):
        """处理节点更新事件"""
        self.graph_store.update_vertex(
            event.entity_id,
            event.properties
        )
    
    def _handle_edge_add(self, event: GraphEvent):
        """处理边添加事件"""
        # 从属性中提取源节点和目标节点
        source_id = event.properties.get('source_id', event.properties.get('user_id'))
        target_id = event.properties.get('target_id', event.properties.get('device_id'))
        
        if source_id and target_id:
            self.graph_store.add_edge(
                event.entity_id,
                source_id,
                target_id,
                event.entity_type,
                event.properties
            )
    
    def _handle_edge_remove(self, event: GraphEvent):
        """处理边删除事件"""
        # 实际实现中需要从存储中删除边
        pass
    
    def _handle_vertex_remove(self, event: GraphEvent):
        """处理节点删除事件"""
        # 实际实现中需要从存储中删除节点及其关联的边
        pass

# 使用示例
def example_graph_storage():
    """图存储示例"""
    # 创建图存储
    graph_store = InMemoryGraphStore()
    
    # 添加测试数据
    graph_store.add_vertex("user_001", "USER", {
        "name": "张三",
        "age": 25,
        "risk_score": 0.1
    })
    
    graph_store.add_vertex("device_001", "DEVICE", {
        "type": "iPhone",
        "os": "iOS 14",
        "risk_score": 0.05
    })
    
    graph_store.add_edge("user_001-use-device_001", "user_001", "device_001", "USE", {
        "login_time": time.time(),
        "ip_address": "192.168.1.100"
    })
    
    # 查询测试
    user_vertex = graph_store.get_vertex("user_001")
    print(f"用户节点: {user_vertex}")
    
    user_edges = graph_store.get_edges_by_vertex("user_001")
    print(f"用户边数: {len(user_edges)}")
    
    neighbors = graph_store.get_neighbors("user_001")
    print(f"邻居节点: {neighbors}")
    
    stats = graph_store.get_statistics()
    print(f"图统计: {stats}")
```

### 1.2 实时处理引擎

#### 1.2.1 事件驱动架构

**事件处理管道**：
```python
# 事件驱动的实时处理引擎
import asyncio
from typing import Dict, List, Callable, Any
import json
from concurrent.futures import ThreadPoolExecutor
import time

class EventDrivenProcessingEngine:
    """事件驱动处理引擎"""
    
    def __init__(self, max_workers: int = 10):
        self.event_queue = asyncio.Queue()
        self.processors = {}
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.running = False
        self.metrics = {
            'events_processed': 0,
            'events_failed': 0,
            'processing_time': 0.0
        }
    
    def register_processor(self, event_type: str, processor: Callable):
        """注册事件处理器"""
        if event_type not in self.processors:
            self.processors[event_type] = []
        self.processors[event_type].append(processor)
    
    async def start_engine(self):
        """启动处理引擎"""
        self.running = True
        print("事件驱动处理引擎已启动")
        
        # 启动处理任务
        processing_task = asyncio.create_task(self._processing_loop())
        return processing_task
    
    async def stop_engine(self):
        """停止处理引擎"""
        self.running = False
        print("事件驱动处理引擎已停止")
    
    async def submit_event(self, event: GraphEvent):
        """提交事件"""
        await self.event_queue.put(event)
    
    async def _processing_loop(self):
        """处理循环"""
        while self.running:
            try:
                # 获取事件
                event = await self.event_queue.get()
                start_time = time.time()
                
                # 处理事件
                await self._process_event(event)
                
                # 更新指标
                processing_time = time.time() - start_time
                self.metrics['events_processed'] += 1
                self.metrics['processing_time'] += processing_time
                
                # 标记任务完成
                self.event_queue.task_done()
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.metrics['events_failed'] += 1
                print(f"处理事件异常: {e}")
    
    async def _process_event(self, event: GraphEvent):
        """处理单个事件"""
        # 获取对应的处理器
        processors = self.processors.get(event.event_type.value, [])
        
        if not processors:
            print(f"没有找到 {event.event_type.value} 类型事件的处理器")
            return
        
        # 并行执行所有处理器
        tasks = []
        for processor in processors:
            if asyncio.iscoroutinefunction(processor):
                task = asyncio.create_task(processor(event))
            else:
                # 对于同步函数，使用线程池执行
                task = asyncio.get_event_loop().run_in_executor(
                    self.executor, processor, event
                )
            tasks.append(task)
        
        # 等待所有处理器完成
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

# 具体处理器实现
class GraphUpdateProcessor:
    """图更新处理器"""
    
    def __init__(self, graph_store: InMemoryGraphStore):
        self.graph_store = graph_store
    
    async def process_vertex_event(self, event: GraphEvent):
        """处理节点事件"""
        if event.event_type == GraphEventType.VERTEX_ADD:
            self.graph_store.add_vertex(
                event.entity_id,
                event.entity_type,
                event.properties
            )
        elif event.event_type == GraphEventType.VERTEX_UPDATE:
            self.graph_store.update_vertex(
                event.entity_id,
                event.properties
            )
        print(f"图更新处理器完成: {event.event_type.value} - {event.entity_id}")

class RiskAnalysisProcessor:
    """风险分析处理器"""
    
    def __init__(self, graph_store: InMemoryGraphStore, risk_detector):
        self.graph_store = graph_store
        self.risk_detector = risk_detector
    
    async def process_risk_event(self, event: GraphEvent):
        """处理风险事件"""
        # 根据事件类型进行风险分析
        if event.event_type == GraphEventType.EDGE_ADD:
            # 分析新建立的关系是否存在风险
            risk_score = await self._analyze_new_relationship(event)
            if risk_score > 0.8:
                print(f"高风险关系检测: {event.entity_id}, 风险评分: {risk_score}")
        
        elif event.event_type == GraphEventType.VERTEX_ADD:
            # 分析新节点的风险
            risk_score = await self._analyze_new_vertex(event)
            if risk_score > 0.7:
                print(f"高风险节点检测: {event.entity_id}, 风险评分: {risk_score}")
    
    async def _analyze_new_relationship(self, event: GraphEvent) -> float:
        """分析新关系的风险"""
        # 简化实现，实际应该进行复杂的图分析
        source_risk = event.properties.get('source_risk', 0.0)
        target_risk = event.properties.get('target_risk', 0.0)
        return (source_risk + target_risk) / 2
    
    async def _analyze_new_vertex(self, event: GraphEvent) -> float:
        """分析新节点的风险"""
        return event.properties.get('risk_score', 0.0)

# 使用示例
async def example_event_driven_engine():
    """事件驱动引擎示例"""
    # 创建组件
    graph_store = InMemoryGraphStore()
    engine = EventDrivenProcessingEngine(max_workers=5)
    
    # 创建处理器
    graph_processor = GraphUpdateProcessor(graph_store)
    risk_detector = None  # 简化实现
    risk_processor = RiskAnalysisProcessor(graph_store, risk_detector)
    
    # 注册处理器
    engine.register_processor('vertex_add', graph_processor.process_vertex_event)
    engine.register_processor('vertex_update', graph_processor.process_vertex_event)
    engine.register_processor('edge_add', graph_processor.process_vertex_event)
    engine.register_processor('edge_add', risk_processor.process_risk_event)
    
    # 启动引擎
    processing_task = await engine.start_engine()
    
    # 提交测试事件
    test_events = [
        GraphEvent(
            event_type=GraphEventType.VERTEX_ADD,
            entity_id="user_1001",
            entity_type="USER",
            properties={"name": "测试用户1", "risk_score": 0.1},
            timestamp=time.time()
        ),
        GraphEvent(
            event_type=GraphEventType.VERTEX_ADD,
            entity_id="device_1001",
            entity_type="DEVICE",
            properties={"type": "Android", "risk_score": 0.05},
            timestamp=time.time()
        ),
        GraphEvent(
            event_type=GraphEventType.EDGE_ADD,
            entity_id="user_1001-use-device_1001",
            entity_type="USE",
            properties={
                "source_id": "user_1001",
                "target_id": "device_1001",
                "source_risk": 0.1,
                "target_risk": 0.05
            },
            timestamp=time.time()
        )
    ]
    
    # 提交事件
    for event in test_events:
        await engine.submit_event(event)
    
    # 等待处理完成
    await asyncio.sleep(1)
    
    # 停止引擎
    await engine.stop_engine()
    
    # 查看结果
    print("图存储统计:")
    stats = graph_store.get_statistics()
    print(json.dumps(stats, indent=2, ensure_ascii=False))

# 运行示例
# asyncio.run(example_event_driven_engine())
```

## 二、高效算法实现

### 2.1 图遍历算法

实时图计算需要高效的图遍历算法来支持快速的风险分析和模式识别。

#### 2.1.1 广度优先搜索

**BFS实现**：
```python
# 广度优先搜索算法
from collections import deque
from typing import Set, List, Callable, Optional

class GraphTraversal:
    """图遍历算法"""
    
    def __init__(self, graph_store: InMemoryGraphStore):
        self.graph_store = graph_store
    
    def bfs_traversal(self, start_vertex: str, max_depth: int = 3, 
                      edge_filter: Optional[Callable] = None) -> Dict:
        """
        广度优先搜索遍历
        
        Args:
            start_vertex: 起始节点
            max_depth: 最大深度
            edge_filter: 边过滤器函数
            
        Returns:
            遍历结果
        """
        if not self.graph_store.get_vertex(start_vertex):
            return {'error': '起始节点不存在'}
        
        visited = set()
        queue = deque([(start_vertex, 0)])  # (节点ID, 深度)
        result = {
            'start_vertex': start_vertex,
            'nodes': [],
            'edges': [],
            'depth_info': {},
            'statistics': {}
        }
        
        while queue and len(visited) < 10000:  # 防止无限遍历
            current_vertex, depth = queue.popleft()
            
            if current_vertex in visited or depth > max_depth:
                continue
            
            visited.add(current_vertex)
            result['nodes'].append(current_vertex)
            result['depth_info'][current_vertex] = depth
            
            # 获取当前节点的邻居
            neighbors = self.graph_store.get_neighbors(current_vertex)
            
            for neighbor_id in neighbors:
                if neighbor_id not in visited:
                    # 获取连接边
                    edges = self.graph_store.get_edges_by_vertex(current_vertex)
                    for edge in edges:
                        # 检查边是否连接到邻居
                        if (edge['source'] == current_vertex and edge['target'] == neighbor_id) or \
                           (edge['target'] == current_vertex and edge['source'] == neighbor_id):
                            
                            # 应用边过滤器
                            if edge_filter and not edge_filter(edge):
                                continue
                            
                            result['edges'].append(edge)
                            queue.append((neighbor_id, depth + 1))
        
        result['statistics'] = {
            'total_nodes': len(result['nodes']),
            'total_edges': len(result['edges']),
            'max_depth_reached': max(result['depth_info'].values()) if result['depth_info'] else 0,
            'execution_time': time.time()
        }
        
        return result
    
    def dfs_traversal(self, start_vertex: str, max_depth: int = 3,
                      edge_filter: Optional[Callable] = None) -> Dict:
        """
        深度优先搜索遍历
        
        Args:
            start_vertex: 起始节点
            max_depth: 最大深度
            edge_filter: 边过滤器函数
            
        Returns:
            遍历结果
        """
        if not self.graph_store.get_vertex(start_vertex):
            return {'error': '起始节点不存在'}
        
        visited = set()
        result = {
            'start_vertex': start_vertex,
            'nodes': [],
            'edges': [],
            'depth_info': {},
            'path': []
        }
        
        def dfs_recursive(current_vertex: str, depth: int, path: List[str]):
            if current_vertex in visited or depth > max_depth:
                return
            
            visited.add(current_vertex)
            result['nodes'].append(current_vertex)
            result['depth_info'][current_vertex] = depth
            result['path'].extend(path + [current_vertex])
            
            # 获取邻居
            neighbors = self.graph_store.get_neighbors(current_vertex)
            for neighbor_id in neighbors:
                if neighbor_id not in visited:
                    # 获取连接边
                    edges = self.graph_store.get_edges_by_vertex(current_vertex)
                    for edge in edges:
                        if (edge['source'] == current_vertex and edge['target'] == neighbor_id) or \
                           (edge['target'] == current_vertex and edge['source'] == neighbor_id):
                            
                            # 应用边过滤器
                            if edge_filter and not edge_filter(edge):
                                continue
                            
                            result['edges'].append(edge)
                            dfs_recursive(neighbor_id, depth + 1, path + [current_vertex])
        
        dfs_recursive(start_vertex, 0, [])
        
        result['statistics'] = {
            'total_nodes': len(result['nodes']),
            'total_edges': len(result['edges']),
            'max_depth_reached': max(result['depth_info'].values()) if result['depth_info'] else 0
        }
        
        return result

# 使用示例
def example_graph_traversal():
    """图遍历示例"""
    # 创建图存储并添加测试数据
    graph_store = InMemoryGraphStore()
    
    # 创建用户节点
    users = [f"user_{i:03d}" for i in range(10)]
    for user_id in users:
        graph_store.add_vertex(user_id, "USER", {
            "name": f"用户{user_id}",
            "risk_score": 0.1
        })
    
    # 创建设备节点
    devices = [f"device_{i:03d}" for i in range(5)]
    for device_id in devices:
        graph_store.add_vertex(device_id, "DEVICE", {
            "type": "Mobile",
            "risk_score": 0.05
        })
    
    # 创建关系边
    import random
    for user_id in users:
        # 每个用户关联1-3个设备
        device_count = random.randint(1, 3)
        selected_devices = random.sample(devices, min(device_count, len(devices)))
        
        for device_id in selected_devices:
            graph_store.add_edge(
                f"{user_id}-use-{device_id}",
                user_id,
                device_id,
                "USE",
                {
                    "timestamp": time.time(),
                    "frequency": random.randint(1, 100)
                }
            )
    
    # 创建图遍历器
    traversal = GraphTraversal(graph_store)
    
    # BFS遍历
    print("=== BFS遍历 ===")
    bfs_result = traversal.bfs_traversal("user_001", max_depth=2)
    print(f"BFS结果: 访问节点数={bfs_result['statistics']['total_nodes']}, "
          f"边数={bfs_result['statistics']['total_edges']}")
    
    # DFS遍历
    print("\n=== DFS遍历 ===")
    dfs_result = traversal.dfs_traversal("user_001", max_depth=2)
    print(f"DFS结果: 访问节点数={dfs_result['statistics']['total_nodes']}, "
          f"边数={dfs_result['statistics']['total_edges']}")

# example_graph_traversal()
```

#### 2.1.2 最短路径算法

**Dijkstra算法实现**：
```python
# 最短路径算法
import heapq
from typing import Dict, List, Tuple, Optional

class ShortestPathAlgorithms:
    """最短路径算法"""
    
    def __init__(self, graph_store: InMemoryGraphStore):
        self.graph_store = graph_store
    
    def dijkstra_shortest_path(self, start_vertex: str, end_vertex: str,
                              weight_function: Optional[Callable] = None) -> Dict:
        """
        Dijkstra最短路径算法
        
        Args:
            start_vertex: 起始节点
            end_vertex: 终止节点
            weight_function: 边权重计算函数
            
        Returns:
            最短路径结果
        """
        start_time = time.time()
        
        # 检查节点是否存在
        if not self.graph_store.get_vertex(start_vertex):
            return {'error': f'起始节点 {start_vertex} 不存在'}
        if not self.graph_store.get_vertex(end_vertex):
            return {'error': f'终止节点 {end_vertex} 不存在'}
        
        # 初始化
        distances = {start_vertex: 0}
        previous = {}
        visited = set()
        priority_queue = [(0, start_vertex)]
        
        while priority_queue:
            current_distance, current_vertex = heapq.heappop(priority_queue)
            
            if current_vertex in visited:
                continue
            
            visited.add(current_vertex)
            
            # 如果到达目标节点，提前结束
            if current_vertex == end_vertex:
                break
            
            # 获取邻居节点
            neighbors = self.graph_store.get_neighbors(current_vertex)
            for neighbor in neighbors:
                if neighbor in visited:
                    continue
                
                # 获取连接边
                edges = self.graph_store.get_edges_by_vertex(current_vertex)
                edge_weight = float('inf')
                
                for edge in edges:
                    if (edge['source'] == current_vertex and edge['target'] == neighbor) or \
                       (edge['target'] == current_vertex and edge['source'] == neighbor):
                        
                        # 计算边权重
                        if weight_function:
                            edge_weight = weight_function(edge)
                        else:
                            # 默认权重为1
                            edge_weight = 1
                        break
                
                # 更新距离
                new_distance = current_distance + edge_weight
                if new_distance < distances.get(neighbor, float('inf')):
                    distances[neighbor] = new_distance
                    previous[neighbor] = current_vertex
                    heapq.heappush(priority_queue, (new_distance, neighbor))
        
        # 重构路径
        path = []
        current = end_vertex
        while current is not None:
            path.append(current)
            current = previous.get(current)
        path.reverse()
        
        # 检查是否找到路径
        if end_vertex not in distances:
            return {
                'start_vertex': start_vertex,
                'end_vertex': end_vertex,
                'path_exists': False,
                'distance': float('inf'),
                'path': [],
                'execution_time': time.time() - start_time
            }
        
        return {
            'start_vertex': start_vertex,
            'end_vertex': end_vertex,
            'path_exists': True,
            'distance': distances[end_vertex],
            'path': path if path[0] == start_vertex else [],
            'execution_time': time.time() - start_time
        }
    
    def all_pairs_shortest_path(self, vertices: List[str],
                               weight_function: Optional[Callable] = None) -> Dict:
        """
        所有节点对最短路径（Floyd-Warshall算法简化版）
        
        Args:
            vertices: 节点列表
            weight_function: 边权重计算函数
            
        Returns:
            所有节点对最短路径
        """
        start_time = time.time()
        
        # 初始化距离矩阵
        distances = {}
        next_vertex = {}
        
        # 初始化
        for u in vertices:
            distances[u] = {}
            next_vertex[u] = {}
            for v in vertices:
                if u == v:
                    distances[u][v] = 0
                else:
                    distances[u][v] = float('inf')
                next_vertex[u][v] = None
        
        # 设置直接连接的边的权重
        for u in vertices:
            edges = self.graph_store.get_edges_by_vertex(u)
            for edge in edges:
                if edge['source'] == u:
                    v = edge['target']
                    if weight_function:
                        weight = weight_function(edge)
                    else:
                        weight = 1
                    
                    if weight < distances[u][v]:
                        distances[u][v] = weight
                        next_vertex[u][v] = v
                elif edge['target'] == u:
                    v = edge['source']
                    if weight_function:
                        weight = weight_function(edge)
                    else:
                        weight = 1
                    
                    if weight < distances[u][v]:
                        distances[u][v] = weight
                        next_vertex[u][v] = v
        
        # Floyd-Warshall算法核心
        for k in vertices:
            for i in vertices:
                for j in vertices:
                    if distances[i][k] + distances[k][j] < distances[i][j]:
                        distances[i][j] = distances[i][k] + distances[k][j]
                        next_vertex[i][j] = next_vertex[i][k]
        
        execution_time = time.time() - start_time
        
        return {
            'distances': distances,
            'next_vertex': next_vertex,
            'execution_time': execution_time,
            'vertex_count': len(vertices)
        }

# 使用示例
def example_shortest_path():
    """最短路径算法示例"""
    # 创建图存储并添加测试数据
    graph_store = InMemoryGraphStore()
    
    # 创建节点
    nodes = ['A', 'B', 'C', 'D', 'E']
    for node in nodes:
        graph_store.add_vertex(node, "TEST", {"value": node})
    
    # 创建带权重的边
    edges = [
        ('A', 'B', 4),
        ('A', 'C', 2),
        ('B', 'C', 1),
        ('B', 'D', 5),
        ('C', 'D', 8),
        ('C', 'E', 10),
        ('D', 'E', 2)
    ]
    
    for source, target, weight in edges:
        graph_store.add_edge(
            f"{source}-{target}",
            source,
            target,
            "CONNECTED",
            {"weight": weight}
        )
    
    # 创建最短路径算法实例
    sp_algorithms = ShortestPathAlgorithms(graph_store)
    
    # Dijkstra算法
    print("=== Dijkstra最短路径 ===")
    weight_func = lambda edge: edge['properties'].get('weight', 1)
    result = sp_algorithms.dijkstra_shortest_path('A', 'E', weight_func)
    print(f"从A到E的最短路径: {result['path']}")
    print(f"距离: {result['distance']}")
    print(f"执行时间: {result['execution_time']:.4f}秒")
    
    # 所有节点对最短路径
    print("\n=== 所有节点对最短路径 ===")
    all_pairs_result = sp_algorithms.all_pairs_shortest_path(nodes, weight_func)
    print(f"计算了 {all_pairs_result['vertex_count']} 个节点的最短路径")
    print(f"执行时间: {all_pairs_result['execution_time']:.4f}秒")
    
    # 显示部分距离
    distances = all_pairs_result['distances']
    for i, u in enumerate(nodes[:3]):  # 只显示前3个节点
        for v in nodes:
            if u != v:
                print(f"{u} -> {v}: {distances[u][v]}")

# example_shortest_path()
```

### 2.2 社区发现算法

#### 2.2.1 Louvain算法

**Louvain社区发现**：
```python
# Louvain社区发现算法
import random
from collections import defaultdict, Counter
from typing import Dict, List, Set, Tuple

class LouvainCommunityDetection:
    """Louvain社区发现算法"""
    
    def __init__(self, graph_store: InMemoryGraphStore):
        self.graph_store = graph_store
    
    def detect_communities(self, max_iterations: int = 10) -> Dict:
        """
        使用Louvain算法检测社区
        
        Args:
            max_iterations: 最大迭代次数
            
        Returns:
            社区检测结果
        """
        start_time = time.time()
        
        # 构建邻接表表示
        adjacency_list = self._build_adjacency_list()
        if not adjacency_list:
            return {'error': '图为空或无法构建邻接表'}
        
        # 初始化每个节点为一个独立社区
        community_map = {node: i for i, node in enumerate(adjacency_list.keys())}
        communities = list(adjacency_list.keys())
        
        # 计算初始模块度
        initial_modularity = self._calculate_modularity(adjacency_list, community_map)
        
        iteration = 0
        modularity_history = [initial_modularity]
        
        while iteration < max_iterations:
            # 阶段1：局部优化
            improvement = self._local_optimization(adjacency_list, community_map)
            if not improvement:
                break
            
            # 计算当前模块度
            current_modularity = self._calculate_modularity(adjacency_list, community_map)
            modularity_history.append(current_modularity)
            
            # 阶段2：社区聚合
            adjacency_list = self._aggregate_communities(adjacency_list, community_map)
            community_map = {node: i for i, node in enumerate(adjacency_list.keys())}
            
            iteration += 1
        
        # 重构最终社区分配
        final_communities = self._reconstruct_communities(community_map, communities)
        
        execution_time = time.time() - start_time
        
        return {
            'communities': final_communities,
            'community_count': len(final_communities),
            'modularity_history': modularity_history,
            'final_modularity': modularity_history[-1] if modularity_history else 0,
            'iterations': iteration,
            'execution_time': execution_time
        }
    
    def _build_adjacency_list(self) -> Dict[str, List[str]]:
        """构建邻接表"""
        adjacency_list = defaultdict(list)
        
        # 获取所有节点
        all_vertices = list(self.graph_store.vertices.keys())
        
        # 构建邻接关系
        for vertex_id in all_vertices:
            neighbors = self.graph_store.get_neighbors(vertex_id)
            adjacency_list[vertex_id] = neighbors
        
        return dict(adjacency_list)
    
    def _calculate_modularity(self, adjacency_list: Dict[str, List[str]], 
                            community_map: Dict[str, int]) -> float:
        """计算模块度"""
        # 计算总边数
        total_edges = sum(len(neighbors) for neighbors in adjacency_list.values())
        if total_edges == 0:
            return 0.0
        
        # 计算社区内部边数和社区总度数
        community_edges = defaultdict(int)
        community_degrees = defaultdict(int)
        
        for node, neighbors in adjacency_list.items():
            node_community = community_map[node]
            community_degrees[node_community] += len(neighbors)
            
            for neighbor in neighbors:
                if community_map[neighbor] == node_community:
                    community_edges[node_community] += 1
        
        # 计算模块度
        modularity = 0.0
        for community in community_edges:
            internal_edges = community_edges[community]
            community_degree = community_degrees[community]
            modularity += (internal_edges / total_edges) - (community_degree / total_edges) ** 2
        
        return modularity
    
    def _local_optimization(self, adjacency_list: Dict[str, List[str]], 
                          community_map: Dict[str, int]) -> bool:
        """局部优化阶段"""
        improvement = False
        nodes = list(adjacency_list.keys())
        random.shuffle(nodes)  # 随机顺序优化
        
        for node in nodes:
            current_community = community_map[node]
            best_community = current_community
            best_gain = 0.0
            
            # 计算移动到其他社区的增益
            neighbor_communities = set()
            for neighbor in adjacency_list[node]:
                neighbor_communities.add(community_map[neighbor])
            
            for community in neighbor_communities:
                if community != current_community:
                    gain = self._calculate_modularity_gain(
                        node, community, adjacency_list, community_map
                    )
                    if gain > best_gain:
                        best_gain = gain
                        best_community = community
            
            # 如果有改进，则移动节点
            if best_community != current_community:
                community_map[node] = best_community
                improvement = True
        
        return improvement
    
    def _calculate_modularity_gain(self, node: str, new_community: int,
                                 adjacency_list: Dict[str, List[str]],
                                 community_map: Dict[str, int]) -> float:
        """计算模块度增益"""
        # 简化实现，实际Louvain算法的增益计算更复杂
        current_community = community_map[node]
        
        # 计算移动到新社区的边数
        intra_edges_new = 0
        intra_edges_current = 0
        
        for neighbor in adjacency_list[node]:
            if community_map[neighbor] == new_community:
                intra_edges_new += 1
            elif community_map[neighbor] == current_community:
                intra_edges_current += 1
        
        # 简化的增益计算
        return intra_edges_new - intra_edges_current
    
    def _aggregate_communities(self, adjacency_list: Dict[str, List[str]],
                             community_map: Dict[str, int]) -> Dict[str, List[str]]:
        """社区聚合"""
        # 创建新的社区到节点的映射
        community_nodes = defaultdict(list)
        for node, community in community_map.items():
            community_nodes[community].append(node)
        
        # 构建聚合后的邻接表
        aggregated_adjacency = {}
        
        for community_id, nodes in community_nodes.items():
            # 社区作为一个超级节点
            community_name = f"community_{community_id}"
            neighbors = set()
            
            # 收集所有节点的邻居
            for node in nodes:
                for neighbor in adjacency_list.get(node, []):
                    neighbor_community = community_map[neighbor]
                    if neighbor_community != community_id:
                        neighbors.add(f"community_{neighbor_community}")
            
            aggregated_adjacency[community_name] = list(neighbors)
        
        return aggregated_adjacency
    
    def _reconstruct_communities(self, community_map: Dict[str, int],
                               original_communities: List[str]) -> Dict[int, List[str]]:
        """重构社区"""
        communities = defaultdict(list)
        
        # 反向映射
        reverse_map = {}
        for node, community in community_map.items():
            if node.startswith('community_'):
                original_community_id = int(node.split('_')[1])
                reverse_map[original_community_id] = community
        
        # 重构原始节点的社区分配
        for i, node in enumerate(original_communities):
            community_id = reverse_map.get(i, i)
            communities[community_id].append(node)
        
        return dict(communities)

# 使用示例
def example_community_detection():
    """社区发现示例"""
    # 创建图存储并添加测试数据（模拟社交网络）
    graph_store = InMemoryGraphStore()
    
    # 创建用户节点
    users = [f"user_{i:02d}" for i in range(20)]
    for user in users:
        graph_store.add_vertex(user, "USER", {"name": user})
    
    # 创建社区结构（模拟真实社交网络）
    import random
    
    # 社区1：用户00-09
    community1 = users[0:10]
    for i, user1 in enumerate(community1):
        # 社区内连接（高密度）
        for user2 in community1[i+1:]:
            if random.random() < 0.4:  # 40%连接概率
                graph_store.add_edge(
                    f"{user1}-{user2}",
                    user1,
                    user2,
                    "FRIEND",
                    {"strength": random.random()}
                )
    
    # 社区2：用户10-19
    community2 = users[10:20]
    for i, user1 in enumerate(community2):
        # 社区内连接（高密度）
        for user2 in community2[i+1:]:
            if random.random() < 0.4:  # 40%连接概率
                graph_store.add_edge(
                    f"{user1}-{user2}",
                    user1,
                    user2,
                    "FRIEND",
                    {"strength": random.random()}
                )
    
    # 社区间连接（低密度）
    for user1 in community1:
        for user2 in community2:
            if random.random() < 0.05:  # 5%连接概率
                graph_store.add_edge(
                    f"{user1}-{user2}",
                    user1,
                    user2,
                    "FRIEND",
                    {"strength": random.random() * 0.5}
                )
    
    # 执行社区发现
    print("=== Louvain社区发现 ===")
    louvain = LouvainCommunityDetection(graph_store)
    result = louvain.detect_communities(max_iterations=5)
    
    print(f"检测到 {result['community_count']} 个社区")
    print(f"最终模块度: {result['final_modularity']:.4f}")
    print(f"迭代次数: {result['iterations']}")
    print(f"执行时间: {result['execution_time']:.4f}秒")
    
    # 显示社区结构
    print("\n社区结构:")
    for community_id, members in result['communities'].items():
        print(f"  社区 {community_id}: {len(members)} 个成员")
        if len(members) <= 10:  # 只显示小社区的成员
            print(f"    成员: {', '.join(members)}")

# example_community_detection()
```

## 三、风险模式识别

### 3.1 关联欺诈检测

#### 3.1.1 团伙识别算法

**团伙欺诈检测**：
```python
# 团伙欺诈检测算法
from typing import Dict, List, Set, Tuple
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

class GangFraudDetection:
    """团伙欺诈检测"""
    
    def __init__(self, graph_store: InMemoryGraphStore):
        self.graph_store = graph_store
    
    def detect_gang_fraud_patterns(self, min_gang_size: int = 3,
                                 max_search_depth: int = 3) -> Dict:
        """
        检测团伙欺诈模式
        
        Args:
            min_gang_size: 最小团伙大小
            max_search_depth: 最大搜索深度
            
        Returns:
            团伙检测结果
        """
        start_time = time.time()
        
        # 方法1：基于社区发现的团伙检测
        community_gangs = self._detect_community_gangs(min_gang_size)
        
        # 方法2：基于行为相似性的团伙检测
        behavior_gangs = self._detect_behavior_gangs(min_gang_size)
        
        # 方法3：基于共享资源的团伙检测
        resource_gangs = self._detect_resource_gangs(min_gang_size)
        
        # 合并结果
        all_gangs = {
            'community_based': community_gangs,
            'behavior_based': behavior_gangs,
            'resource_based': resource_gangs,
            'total_gangs': len(community_gangs) + len(behavior_gangs) + len(resource_gangs),
            'execution_time': time.time() - start_time
        }
        
        return all_gangs
    
    def _detect_community_gangs(self, min_gang_size: int) -> List[Dict]:
        """基于社区发现检测团伙"""
        # 使用Louvain算法检测社区
        louvain = LouvainCommunityDetection(self.graph_store)
        community_result = louvain.detect_communities(max_iterations=3)
        
        gangs = []
        for community_id, members in community_result.get('communities', {}).items():
            if len(members) >= min_gang_size:
                # 计算团伙风险评分
                risk_score = self._calculate_community_risk(members)
                gangs.append({
                    'gang_id': f"community_{community_id}",
                    'members': members,
                    'member_count': len(members),
                    'risk_score': risk_score,
                    'detection_method': 'community_detection',
                    'evidence': f"社区内{len(members)}个节点高度连接"
                })
        
        return gangs
    
    def _detect_behavior_gangs(self, min_gang_size: int) -> List[Dict]:
        """基于行为相似性检测团伙"""
        # 提取用户行为特征
        user_features = self._extract_user_features()
        if not user_features:
            return []
        
        # 使用DBSCAN聚类算法
        feature_matrix = []
        user_ids = []
        for user_id, features in user_features.items():
            feature_matrix.append(list(features.values()))
            user_ids.append(user_id)
        
        if len(feature_matrix) < min_gang_size:
            return []
        
        # 标准化特征
        scaler = StandardScaler()
        normalized_features = scaler.fit_transform(feature_matrix)
        
        # DBSCAN聚类
        dbscan = DBSCAN(eps=0.5, min_samples=min_gang_size)
        cluster_labels = dbscan.fit_predict(normalized_features)
        
        # 分析聚类结果
        gangs = []
        unique_labels = set(cluster_labels)
        unique_labels.discard(-1)  # -1表示噪声点
        
        for label in unique_labels:
            member_indices = np.where(cluster_labels == label)[0]
            if len(member_indices) >= min_gang_size:
                members = [user_ids[i] for i in member_indices]
                risk_score = self._calculate_behavior_risk(members, user_features)
                gangs.append({
                    'gang_id': f"behavior_{label}",
                    'members': members,
                    'member_count': len(members),
                    'risk_score': risk_score,
                    'detection_method': 'behavior_clustering',
                    'evidence': f"{len(members)}个用户行为模式相似"
                })
        
        return gangs
    
    def _detect_resource_gangs(self, min_gang_size: int) -> List[Dict]:
        """基于共享资源检测团伙"""
        gangs = []
        
        # 检测共享IP的用户组
        ip_groups = self._find_shared_ip_groups()
        for ip, users in ip_groups.items():
            if len(users) >= min_gang_size:
                risk_score = self._calculate_resource_risk(users)
                gangs.append({
                    'gang_id': f"ip_{ip.replace('.', '_')}",
                    'members': list(users),
                    'member_count': len(users),
                    'risk_score': risk_score,
                    'detection_method': 'shared_ip',
                    'evidence': f"{len(users)}个用户共享IP {ip}"
                })
        
        # 检测共享设备的用户组
        device_groups = self._find_shared_device_groups()
        for device, users in device_groups.items():
            if len(users) >= min_gang_size:
                risk_score = self._calculate_resource_risk(users)
                gangs.append({
                    'gang_id': f"device_{device}",
                    'members': list(users),
                    'member_count': len(users),
                    'risk_score': risk_score,
                    'detection_method': 'shared_device',
                    'evidence': f"{len(users)}个用户共享设备 {device}"
                })
        
        return gangs
    
    def _extract_user_features(self) -> Dict[str, Dict[str, float]]:
        """提取用户行为特征"""
        features = {}
        
        # 获取所有用户节点
        user_nodes = self.graph_store.get_vertices_by_type("USER")
        
        for user_id in user_nodes:
            vertex = self.graph_store.get_vertex(user_id)
            if not vertex:
                continue
            
            user_features = {}
            
            # 基础统计特征
            edges = self.graph_store.get_edges_by_vertex(user_id)
            
            # 登录频率
            login_edges = [e for e in edges if e['type'] == 'LOGIN']
            user_features['login_frequency'] = len(login_edges)
            
            # 交易频率
            transaction_edges = [e for e in edges if e['type'] == 'TRANSACTION']
            user_features['transaction_frequency'] = len(transaction_edges)
            
            # 关联设备数
            device_edges = [e for e in edges if e['type'] == 'USE']
            user_features['device_count'] = len(device_edges)
            
            # 邻居数
            neighbors = self.graph_store.get_neighbors(user_id)
            user_features['neighbor_count'] = len(neighbors)
            
            # 风险评分
            risk_score = vertex['properties'].get('risk_score', 0.0)
            user_features['risk_score'] = risk_score
            
            features[user_id] = user_features
        
        return features
    
    def _find_shared_ip_groups(self) -> Dict[str, Set[str]]:
        """查找共享IP的用户组"""
        ip_groups = defaultdict(set)
        
        # 查找登录边
        login_edges = []
        for edge_id, edge in self.graph_store.edges.items():
            if edge['type'] == 'LOGIN':
                login_edges.append(edge)
        
        # 按IP分组用户
        for edge in login_edges:
            ip_address = edge['properties'].get('ip_address')
            user_id = edge['source']
            if ip_address:
                ip_groups[ip_address].add(user_id)
        
        return dict(ip_groups)
    
    def _find_shared_device_groups(self) -> Dict[str, Set[str]]:
        """查找共享设备的用户组"""
        device_groups = defaultdict(set)
        
        # 查找设备使用边
        use_edges = []
        for edge_id, edge in self.graph_store.edges.items():
            if edge['type'] == 'USE':
                use_edges.append(edge)
        
        # 按设备分组用户
        for edge in use_edges:
            device_id = edge['target']
            user_id = edge['source']
            device_groups[device_id].add(user_id)
        
        return dict(device_groups)
    
    def _calculate_community_risk(self, members: List[str]) -> float:
        """计算社区风险评分"""
        if not members:
            return 0.0
        
        # 计算成员平均风险评分
        total_risk = 0.0
        valid_members = 0
        
        for member_id in members:
            vertex = self.graph_store.get_vertex(member_id)
            if vertex:
                risk_score = vertex['properties'].get('risk_score', 0.0)
                total_risk += risk_score
                valid_members += 1
        
        return total_risk / valid_members if valid_members > 0 else 0.0
    
    def _calculate_behavior_risk(self, members: List[str],
                               user_features: Dict[str, Dict[str, float]]) -> float:
        """计算行为风险评分"""
        if not members:
            return 0.0
        
        # 计算行为异常度
        total_risk = 0.0
        for member in members:
            if member in user_features:
                features = user_features[member]
                # 综合风险评分
                behavior_risk = (
                    features.get('risk_score', 0.0) * 0.4 +
                    min(features.get('login_frequency', 0) / 100.0, 1.0) * 0.3 +
                    min(features.get('transaction_frequency', 0) / 50.0, 1.0) * 0.3
                )
                total_risk += behavior_risk
        
        return total_risk / len(members) if members else 0.0
    
    def _calculate_resource_risk(self, members: List[str]) -> float:
        """计算资源共享风险评分"""
        if not members:
            return 0.0
        
        # 计算成员平均风险
        total_risk = 0.0
        valid_members = 0
        
        for member_id in members:
            vertex = self.graph_store.get_vertex(member_id)
            if vertex:
                risk_score = vertex['properties'].get('risk_score', 0.0)
                total_risk += risk_score
                valid_members += 1
        
        return total_risk / valid_members if valid_members > 0 else 0.0

# 使用示例
def example_gang_fraud_detection():
    """团伙欺诈检测示例"""
    # 创建图存储并添加测试数据
    graph_store = InMemoryGraphStore()
    
    # 创建用户节点（包含风险评分）
    users = []
    for i in range(30):
        user_id = f"user_{i:02d}"
        # 前10个用户为高风险用户（模拟欺诈团伙）
        risk_score = 0.8 if i < 10 else random.random() * 0.3
        graph_store.add_vertex(user_id, "USER", {
            "name": f"用户{user_id}",
            "risk_score": risk_score,
            "register_time": time.time() - random.randint(0, 365) * 86400
        })
        users.append(user_id)
    
    # 创建团伙内部连接（前10个用户高度连接）
    gang_members = users[:10]
    for i, user1 in enumerate(gang_members):
        for user2 in gang_members[i+1:]:
            if random.random() < 0.6:  # 高连接概率
                graph_store.add_edge(
                    f"{user1}-{user2}",
                    user1,
                    user2,
                    "FRIEND",
                    {"strength": random.random()}
                )
    
    # 创建正常用户连接（低连接概率）
    normal_members = users[10:]
    for i, user1 in enumerate(normal_members):
        for user2 in normal_members[i+1:]:
            if random.random() < 0.1:  # 低连接概率
                graph_store.add_edge(
                    f"{user1}-{user2}",
                    user1,
                    user2,
                    "FRIEND",
                    {"strength": random.random() * 0.5}
                )
    
    # 创建共享资源（IP和设备）
    # 团伙成员共享相同IP和设备
    shared_ip = "192.168.1.100"
    shared_device = "device_gang_001"
    
    for i, user_id in enumerate(gang_members):
        # 添加登录边（共享IP）
        graph_store.add_edge(
            f"login_{user_id}_{int(time.time())}",
            user_id,
            f"ip_{shared_ip.replace('.', '_')}",
            "LOGIN",
            {
                "ip_address": shared_ip,
                "timestamp": time.time() - random.randint(0, 7) * 86400,
                "success": True
            }
        )
        
        # 添加设备使用边（共享设备）
        graph_store.add_edge(
            f"use_{user_id}_{shared_device}",
            user_id,
            shared_device,
            "USE",
            {
                "timestamp": time.time() - random.randint(0, 30) * 86400,
                "frequency": random.randint(10, 100)
            }
        )
    
    # 执行团伙欺诈检测
    print("=== 团伙欺诈检测 ===")
    gang_detector = GangFraudDetection(graph_store)
    result = gang_detector.detect_gang_fraud_patterns(min_gang_size=3)
    
    print(f"检测到团伙总数: {result['total_gangs']}")
    print(f"执行时间: {result['execution_time']:.4f}秒")
    
    # 显示各类检测结果
    print("\n基于社区的团伙:")
    for gang in result['community_based']:
        print(f"  团伙ID: {gang['gang_id']}")
        print(f"  成员数: {gang['member_count']}")
        print(f"  风险评分: {gang['risk_score']:.3f}")
        print(f"  证据: {gang['evidence']}")
    
    print("\n基于行为的团伙:")
    for gang in result['behavior_based']:
        print(f"  团伙ID: {gang['gang_id']}")
        print(f"  成员数: {gang['member_count']}")
        print(f"  风险评分: {gang['risk_score']:.3f}")
        print(f"  证据: {gang['evidence']}")
    
    print("\n基于资源共享的团伙:")
    for gang in result['resource_based']:
        print(f"  团伙ID: {gang['gang_id']}")
        print(f"  成员数: {gang['member_count']}")
        print(f"  风险评分: {gang['risk_score']:.3f}")
        print(f"  证据: {gang['evidence']}")

# example_gang_fraud_detection()
```

### 3.2 风险传播分析

#### 3.2.1 传播路径追踪

**风险传播分析**：
```python
# 风险传播分析
from typing import Dict, List, Set, Tuple
import heapq

class RiskPropagationAnalysis:
    """风险传播分析"""
    
    def __init__(self, graph_store: InMemoryGraphStore):
        self.graph_store = graph_store
    
    def analyze_risk_propagation(self, source_nodes: List[str],
                               max_depth: int = 5,
                               risk_threshold: float = 0.5) -> Dict:
        """
        分析风险传播
        
        Args:
            source_nodes: 源节点列表
            max_depth: 最大传播深度
            risk_threshold: 风险阈值
            
        Returns:
            风险传播分析结果
        """
        start_time = time.time()
        
        # 验证源节点
        valid_sources = [node for node in source_nodes if self.graph_store.get_vertex(node)]
        if not valid_sources:
            return {'error': '没有有效的源节点'}
        
        # 分析传播路径
        propagation_paths = self._trace_propagation_paths(valid_sources, max_depth)
        
        # 识别高风险节点
        high_risk_nodes = self._identify_high_risk_nodes(risk_threshold)
        
        # 计算传播影响范围
        impact_analysis = self._analyze_propagation_impact(valid_sources, max_depth)
        
        execution_time = time.time() - start_time
        
        return {
            'source_nodes': valid_sources,
            'propagation_paths': propagation_paths,
            'high_risk_nodes': high_risk_nodes,
            'impact_analysis': impact_analysis,
            'execution_time': execution_time
        }
    
    def _trace_propagation_paths(self, source_nodes: List[str],
                               max_depth: int) -> List[Dict]:
        """追踪传播路径"""
        paths = []
        
        for source in source_nodes:
            # 获取源节点风险评分
            source_vertex = self.graph_store.get_vertex(source)
            if not source_vertex:
                continue
            
            source_risk = source_vertex['properties'].get('risk_score', 0.0)
            if source_risk < 0.1:  # 风险太低不考虑传播
                continue
            
            # BFS搜索传播路径
            visited = set()
            queue = [(source, 0, [source], source_risk)]  # (当前节点, 深度, 路径, 累积风险)
            
            while queue:
                current_node, depth, path, accumulated_risk = queue.pop(0)
                
                if current_node in visited or depth >= max_depth:
                    continue
                
                visited.add(current_node)
                
                # 如果累积风险足够高，记录路径
                if accumulated_risk >= 0.3 and len(path) > 1:
                    paths.append({
                        'source': source,
                        'path': path.copy(),
                        'path_length': len(path),
                        'accumulated_risk': accumulated_risk,
                        'final_node': current_node
                    })
                
                # 获取邻居节点
                neighbors = self.graph_store.get_neighbors(current_node)
                for neighbor in neighbors:
                    if neighbor not in visited:
                        # 计算传播到邻居的风险
                        neighbor_vertex = self.graph_store.get_vertex(neighbor)
                        if neighbor_vertex:
                            neighbor_risk = neighbor_vertex['properties'].get('risk_score', 0.0)
                            # 传播风险 = 当前风险 * 传播系数 + 邻居基础风险
                            propagation_coefficient = self._calculate_propagation_coefficient(
                                current_node, neighbor
                            )
                            new_risk = accumulated_risk * propagation_coefficient + neighbor_risk * 0.3
                            
                            # 如果新风险足够高，继续传播
                            if new_risk >= 0.2:
                                new_path = path + [neighbor]
                                queue.append((neighbor, depth + 1, new_path, new_risk))
        
        return paths
    
    def _calculate_propagation_coefficient(self, source_node: str,
                                         target_node: str) -> float:
        """计算传播系数"""
        # 获取连接边
        edges = self.graph_store.get_edges_by_vertex(source_node)
        connection_strength = 0.0
        
        for edge in edges:
            if (edge['source'] == source_node and edge['target'] == target_node) or \
               (edge['target'] == source_node and edge['source'] == target_node):
                # 根据边类型和属性计算连接强度
                edge_type = edge['type']
                if edge_type == 'FRIEND':
                    connection_strength = 0.8
                elif edge_type == 'FAMILY':
                    connection_strength = 0.9
                elif edge_type == 'COLLEAGUE':
                    connection_strength = 0.6
                elif edge_type == 'TRANSACTION':
                    # 根据交易金额和频率
                    amount = edge['properties'].get('amount', 0)
                    frequency = edge['properties'].get('frequency', 1)
                    connection_strength = min(0.3 + (amount / 10000) + (frequency / 100), 0.8)
                else:
                    connection_strength = 0.5
                
                break
        
        return connection_strength
    
    def _identify_high_risk_nodes(self, risk_threshold: float) -> List[Dict]:
        """识别高风险节点"""
        high_risk_nodes = []
        
        # 获取所有节点
        all_vertices = list(self.graph_store.vertices.keys())
        
        for vertex_id in all_vertices:
            vertex = self.graph_store.get_vertex(vertex_id)
            if not vertex:
                continue
            
            risk_score = vertex['properties'].get('risk_score', 0.0)
            if risk_score >= risk_threshold:
                # 计算风险传播潜力
                neighbors = self.graph_store.get_neighbors(vertex_id)
                propagation_potential = len(neighbors) * risk_score
                
                high_risk_nodes.append({
                    'node_id': vertex_id,
                    'node_type': vertex['type'],
                    'risk_score': risk_score,
                    'propagation_potential': propagation_potential,
                    'neighbor_count': len(neighbors)
                })
        
        # 按传播潜力排序
        high_risk_nodes.sort(key=lambda x: x['propagation_potential'], reverse=True)
        
        return high_risk_nodes
    
    def _analyze_propagation_impact(self, source_nodes: List[str],
                                  max_depth: int) -> Dict:
        """分析传播影响"""
        impact_stats = {
            'total_affected_nodes': 0,
            'affected_node_types': defaultdict(int),
            'max_propagation_depth': 0,
            'average_risk_increase': 0.0
        }
        
        # 使用BFS计算影响范围
        affected_nodes = set()
        depth_counts = defaultdict(int)
        
        for source in source_nodes:
            visited = set()
            queue = [(source, 0)]  # (节点, 深度)
            
            while queue:
                current_node, depth = queue.pop(0)
                
                if current_node in visited or depth > max_depth:
                    continue
                
                visited.add(current_node)
                affected_nodes.add(current_node)
                depth_counts[depth] += 1
                
                # 获取邻居
                neighbors = self.graph_store.get_neighbors(current_node)
                for neighbor in neighbors:
                    if neighbor not in visited:
                        queue.append((neighbor, depth + 1))
        
        # 统计影响信息
        impact_stats['total_affected_nodes'] = len(affected_nodes)
        impact_stats['max_propagation_depth'] = max(depth_counts.keys()) if depth_counts else 0
        
        # 统计节点类型
        for node_id in affected_nodes:
            vertex = self.graph_store.get_vertex(node_id)
            if vertex:
                impact_stats['affected_node_types'][vertex['type']] += 1
        
        return impact_stats
    
    def get_propagation_hotspots(self, time_window: int = 86400) -> List[Dict]:
        """
        获取传播热点
        
        Args:
            time_window: 时间窗口（秒）
            
        Returns:
            传播热点列表
        """
        hotspots = []
        current_time = time.time()
        cutoff_time = current_time - time_window
        
        # 统计近期新增的高风险连接
        recent_high_risk_edges = []
        for edge_id, edge in self.graph_store.edges.items():
            created_time = edge.get('created_at', 0)
            if created_time >= cutoff_time:
                # 检查边连接的节点是否为高风险
                source_vertex = self.graph_store.get_vertex(edge['source'])
                target_vertex = self.graph_store.get_vertex(edge['target'])
                
                source_risk = source_vertex['properties'].get('risk_score', 0.0) if source_vertex else 0.0
                target_risk = target_vertex['properties'].get('risk_score', 0.0) if target_vertex else 0.0
                
                if source_risk >= 0.5 or target_risk >= 0.5:
                    recent_high_risk_edges.append({
                        'edge': edge,
                        'source_risk': source_risk,
                        'target_risk': target_risk,
                        'total_risk': source_risk + target_risk
                    })
        
        # 按总风险排序
        recent_high_risk_edges.sort(key=lambda x: x['total_risk'], reverse=True)
        
        # 识别热点节点（连接多个高风险边的节点）
        node_connection_count = defaultdict(int)
        for edge_info in recent_high_risk_edges:
            edge = edge_info['edge']
            node_connection_count[edge['source']] += 1
            node_connection_count[edge['target']] += 1
        
        # 选择连接数最多的节点作为热点
        for node_id, connection_count in sorted(node_connection_count.items(),
                                              key=lambda x: x[1], reverse=True)[:10]:
            vertex = self.graph_store.get_vertex(node_id)
            if vertex:
                hotspots.append({
                    'node_id': node_id,
                    'node_type': vertex['type'],
                    'connection_count': connection_count,
                    'risk_score': vertex['properties'].get('risk_score', 0.0)
                })
        
        return hotspots

# 使用示例
def example_risk_propagation():
    """风险传播分析示例"""
    # 创建图存储并添加测试数据
    graph_store = InMemoryGraphStore()
    
    # 创建节点（包含不同风险评分）
    nodes_data = [
        ('user_001', 'USER', {'name': '高风险用户A', 'risk_score': 0.9}),
        ('user_002', 'USER', {'name': '高风险用户B', 'risk_score': 0.85}),
        ('user_003', 'USER', {'name': '中风险用户C', 'risk_score': 0.6}),
        ('user_004', 'USER', {'name': '中风险用户D', 'risk_score': 0.55}),
        ('user_005', 'USER', {'name': '低风险用户E', 'risk_score': 0.2}),
        ('user_006', 'USER', {'name': '正常用户F', 'risk_score': 0.1}),
        ('device_001', 'DEVICE', {'type': 'Mobile', 'risk_score': 0.4}),
        ('device_002', 'DEVICE', {'type': 'PC', 'risk_score': 0.3}),
    ]
    
    for node_id, node_type, properties in nodes_data:
        graph_store.add_vertex(node_id, node_type, properties)
    
    # 创建连接边（包含传播关系）
    edges_data = [
        # 高风险用户之间的强连接
        ('user_001', 'user_002', 'FRIEND', {'strength': 0.9, 'since': time.time() - 86400 * 30}),
        ('user_001', 'user_003', 'TRANSACTION', {'amount': 5000, 'frequency': 10}),
        ('user_002', 'user_004', 'FRIEND', {'strength': 0.8, 'since': time.time() - 86400 * 15}),
        
        # 中风险用户连接
        ('user_003', 'user_005', 'COLLEAGUE', {'strength': 0.6}),
        ('user_004', 'user_006', 'FRIEND', {'strength': 0.7}),
        
        # 设备使用关系
        ('user_001', 'device_001', 'USE', {'frequency': 50}),
        ('user_002', 'device_001', 'USE', {'frequency': 30}),  # 共享设备
        ('user_003', 'device_002', 'USE', {'frequency': 20}),
    ]
    
    for source, target, edge_type, properties in edges_data:
        edge_id = f"{source}-{target}-{edge_type.lower()}"
        graph_store.add_edge(edge_id, source, target, edge_type, properties)
    
    # 执行风险传播分析
    print("=== 风险传播分析 ===")
    propagation_analyzer = RiskPropagationAnalysis(graph_store)
    
    # 分析从高风险用户开始的传播
    source_nodes = ['user_001', 'user_002']
    result = propagation_analyzer.analyze_risk_propagation(
        source_nodes=source_nodes,
        max_depth=3,
        risk_threshold=0.4
    )
    
    print(f"源节点: {result['source_nodes']}")
    print(f"执行时间: {result['execution_time']:.4f}秒")
    
    # 显示传播路径
    print(f"\n发现 {len(result['propagation_paths'])} 条传播路径:")
    for i, path_info in enumerate(result['propagation_paths'][:5]):  # 只显示前5条
        print(f"  路径 {i+1}: {' -> '.join(path_info['path'])}")
        print(f"    长度: {path_info['path_length']}, 累积风险: {path_info['accumulated_risk']:.3f}")
    
    # 显示高风险节点
    print(f"\n识别 {len(result['high_risk_nodes'])} 个高风险节点:")
    for node_info in result['high_risk_nodes'][:5]:  # 只显示前5个
        print(f"  节点: {node_info['node_id']} ({node_info['node_type']})")
        print(f"    风险评分: {node_info['risk_score']:.3f}")
        print(f"    传播潜力: {node_info['propagation_potential']:.3f}")
        print(f"    邻居数: {node_info['neighbor_count']}")
    
    # 显示影响分析
    impact = result['impact_analysis']
    print(f"\n传播影响分析:")
    print(f"  总影响节点数: {impact['total_affected_nodes']}")
    print(f"  最大传播深度: {impact['max_propagation_depth']}")
    print(f"  受影响节点类型分布:")
    for node_type, count in impact['affected_node_types'].items():
        print(f"    {node_type}: {count}")
    
    # 获取传播热点
    print(f"\n=== 传播热点 ===")
    hotspots = propagation_analyzer.get_propagation_hotspots(time_window=86400 * 7)  # 一周内
    print(f"发现 {len(hotspots)} 个传播热点:")
    for hotspot in hotspots:
        print(f"  热点节点: {hotspot['node_id']} ({hotspot['node_type']})")
        print(f"    连接数: {hotspot['connection_count']}")
        print(f"    风险评分: {hotspot['risk_score']:.3f}")

# example_risk_propagation()
```

## 四、性能优化策略

### 4.1 计算优化

#### 4.1.1 并行计算

**并行图计算**：
```python
# 并行图计算优化
import asyncio
import concurrent.futures
from typing import Dict, List, Callable, Any
import multiprocessing as mp
from functools import partial

class ParallelGraphComputation:
    """并行图计算"""
    
    def __init__(self, graph_store: InMemoryGraphStore, 
                 max_workers: int = None):
        self.graph_store = graph_store
        self.max_workers = max_workers or mp.cpu_count()
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers)
    
    async def parallel_traversal(self, start_vertices: List[str],
                               traversal_func: Callable,
                               **kwargs) -> Dict[str, Any]:
        """
        并行图遍历
        
        Args:
            start_vertices: 起始节点列表
            traversal_func: 遍历函数
            **kwargs: 其他参数
            
        Returns:
            并行遍历结果
        """
        start_time = time.time()
        
        # 创建遍历任务
        tasks = []
        for vertex in start_vertices:
            # 使用偏函数绑定参数
            bound_func = partial(traversal_func, vertex, **kwargs)
            task = asyncio.get_event_loop().run_in_executor(
                self.executor, bound_func
            )
            tasks.append((vertex, task))
        
        # 等待所有任务完成
        results = {}
        for vertex, task in tasks:
            try:
                result = await task
                results[vertex] = result
            except Exception as e:
                results[vertex] = {'error': str(e)}
        
        execution_time = time.time() - start_time
        
        return {
            'results': results,
            'execution_time': execution_time,
            'parallel_tasks': len(tasks)
        }
    
    def parallel_community_detection(self, detection_method: str,
                                   partitions: int = 4) -> Dict[str, Any]:
        """
        并行社区发现
        
        Args:
            detection_method: 检测方法
            partitions: 分区数
            
        Returns:
            社区发现结果
        """
        start_time = time.time()
        
        # 将图分区
        partitions_data = self._partition_graph(partitions)
        
        # 并行执行社区发现
        with concurrent.futures.ProcessPoolExecutor(max_workers=partitions) as executor:
            # 提交任务
            futures = []
            for i, partition_data in enumerate(partitions_data):
                future = executor.submit(
                    self._community_detection_worker,
                    partition_data,
                    detection_method
                )
                futures.append(future)
            
            # 收集结果
            partition_results = []
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    partition_results.append(result)
                except Exception as e:
                    print(f"分区计算错误: {e}")
        
        # 合并结果
        merged_result = self._merge_community_results(partition_results)
        
        execution_time = time.time() - start_time
        
        return {
            'communities': merged_result,
            'partition_count': partitions,
            'execution_time': execution_time,
            'partition_results': partition_results
        }
    
    def _partition_graph(self, partition_count: int) -> List[Dict]:
        """图分区"""
        # 简单的哈希分区
        partitions = [{} for _ in range(partition_count)]
        
        # 分区节点
        for vertex_id, vertex_data in self.graph_store.vertices.items():
            partition_id = hash(vertex_id) % partition_count
            if 'vertices' not in partitions[partition_id]:
                partitions[partition_id]['vertices'] = {}
            partitions[partition_id]['vertices'][vertex_id] = vertex_data
        
        # 分区边（确保边的两个端点在同一分区或正确处理跨分区边）
        for edge_id, edge_data in self.graph_store.edges.items():
            source_partition = hash(edge_data['source']) % partition_count
            target_partition = hash(edge_data['target']) % partition_count
            
            # 如果边的两个端点在同一分区
            if source_partition == target_partition:
                partition_id = source_partition
                if 'edges' not in partitions[partition_id]:
                    partitions[partition_id]['edges'] = {}
                partitions[partition_id]['edges'][edge_id] = edge_data
            else:
                # 跨分区边需要特殊处理
                # 这里简化处理，实际应用中需要更复杂的跨分区边管理
                pass
        
        return partitions
    
    def _community_detection_worker(self, partition_data: Dict,
                                  detection_method: str) -> Dict:
        """社区发现工作进程"""
        # 创建临时图存储
        temp_store = InMemoryGraphStore()
        
        # 加载分区数据
        for vertex_id, vertex_data in partition_data.get('vertices', {}).items():
            temp_store.vertices[vertex_id] = vertex_data
        
        for edge_id, edge_data in partition_data.get('edges', {}).items():
            temp_store.edges[edge_id] = edge_data
        
        # 执行社区发现
        if detection_method == 'louvain':
            louvain = LouvainCommunityDetection(temp_store)
            return louvain.detect_communities(max_iterations=2)
        else:
            return {'error': f'不支持的检测方法: {detection_method}'}
    
    def _merge_community_results(self, partition_results: List[Dict]) -> Dict:
        """合并社区发现结果"""
        merged_communities = {}
        community_id_offset = 0
        
        for partition_result in partition_results:
            communities = partition_result.get('communities', {})
            for community_id, members in communities.items():
                new_community_id = community_id + community_id_offset
                merged_communities[new_community_id] = members
            community_id_offset += len(communities)
        
        return merged_communities
    
    async def batch_risk_analysis(self, nodes: List[str],
                                analysis_functions: List[Callable]) -> Dict[str, Any]:
        """
        批量风险分析
        
        Args:
            nodes: 节点列表
            analysis_functions: 分析函数列表
            
        Returns:
            批量分析结果
        """
        start_time = time.time()
        
        # 为每个节点并行执行所有分析函数
        node_results = {}
        
        for node in nodes:
            function_results = {}
            tasks = []
            
            # 为每个分析函数创建任务
            for func in analysis_functions:
                task = asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    func,
                    node
                )
                tasks.append((func.__name__, task))
            
            # 等待所有函数完成
            for func_name, task in tasks:
                try:
                    result = await task
                    function_results[func_name] = result
                except Exception as e:
                    function_results[func_name] = {'error': str(e)}
            
            node_results[node] = function_results
        
        execution_time = time.time() - start_time
        
        return {
            'node_results': node_results,
            'total_nodes': len(nodes),
            'execution_time': execution_time
        }

# 使用示例
async def example_parallel_computation():
    """并行计算示例"""
    # 创建图存储并添加测试数据
    graph_store = InMemoryGraphStore()
    
    # 创建大量测试节点和边
    print("创建测试数据...")
    nodes = []
    for i in range(100):
        node_id = f"user_{i:03d}"
        risk_score = random.random() * 0.8 if i < 20 else random.random() * 0.3  # 前20个为高风险
        graph_store.add_vertex(node_id, "USER", {
            "name": f"用户{node_id}",
            "risk_score": risk_score
        })
        nodes.append(node_id)
    
    # 创建连接关系
    for i in range(100):
        user1 = f"user_{i:03d}"
        # 每个用户连接2-5个其他用户
        connection_count = random.randint(2, 5)
        for _ in range(connection_count):
            j = random.randint(0, 99)
            if i != j:
                user2 = f"user_{j:03d}"
                edge_id = f"{user1}-{user2}"
                if edge_id not in graph_store.edges:  # 避免重复边
                    graph_store.add_edge(
                        edge_id,
                        user1,
                        user2,
                        "FRIEND",
                        {"strength": random.random()}
                    )
    
    # 创建并行计算实例
    parallel_computer = ParallelGraphComputation(graph_store, max_workers=8)
    
    print("=== 并行图遍历 ===")
    # 并行遍历多个起始节点
    start_vertices = [f"user_{i:03d}" for i in range(0, 20, 5)]  # 选择5个起始节点
    
    def traversal_wrapper(start_vertex):
        traversal = GraphTraversal(graph_store)
        return traversal.bfs_traversal(start_vertex, max_depth=2)
    
    traversal_result = await parallel_computer.parallel_traversal(
        start_vertices,
        traversal_wrapper
    )
    
    print(f"并行遍历完成:")
    print(f"  任务数: {traversal_result['parallel_tasks']}")
    print(f"  执行时间: {traversal_result['execution_time']:.4f}秒")
    print(f"  成功结果数: {len([r for r in traversal_result['results'].values() if 'error' not in r])}")
    
    print("\n=== 并行社区发现 ===")
    community_result = parallel_computer.parallel_community_detection(
        detection_method='louvain',
        partitions=4
    )
    
    print(f"并行社区发现完成:")
    print(f"  分区数: {community_result['partition_count']}")
    print(f"  发现社区数: {len(community_result['communities'])}")
    print(f"  执行时间: {community_result['execution_time']:.4f}秒")
    
    print("\n=== 批量风险分析 ===")
    # 定义分析函数
    def risk_score_analysis(node_id):
        vertex = graph_store.get_vertex(node_id)
        return vertex['properties'].get('risk_score', 0.0) if vertex else 0.0
    
    def neighbor_analysis(node_id):
        neighbors = graph_store.get_neighbors(node_id)
        return len(neighbors)
    
    def community_analysis(node_id):
        # 简化的社区分析
        edges = graph_store.get_edges_by_vertex(node_id)
        return len([e for e in edges if e['type'] == 'FRIEND'])
    
    # 批量分析前10个节点
    batch_nodes = [f"user_{i:03d}" for i in range(10)]
    batch_result = await parallel_computer.batch_risk_analysis(
        batch_nodes,
        [risk_score_analysis, neighbor_analysis, community_analysis]
    )
    
    print(f"批量风险分析完成:")
    print(f"  节点数: {batch_result['total_nodes']}")
    print(f"  执行时间: {batch_result['execution_time']:.4f}秒")
    print(f"  分析函数数: 3")
    
    # 显示部分结果
    print("\n前3个节点的分析结果:")
    for i, (node_id, analyses) in enumerate(list(batch_result['node_results'].items())[:3]):
        print(f"  节点 {node_id}:")
        for func_name, result in analyses.items():
            if isinstance(result, dict) and 'error' in result:
                print(f"    {func_name}: 错误 - {result['error']}")
            else:
                print(f"    {func_name}: {result}")

# 运行示例
# asyncio.run(example_parallel_computation())
```

### 4.2 缓存优化

#### 4.2.1 智能缓存策略

**图计算缓存**：
```python
# 图计算缓存优化
import hashlib
from typing import Dict, Any, Optional
import time
from collections import OrderedDict

class GraphComputationCache:
    """图计算缓存"""
    
    def __init__(self, max_size: int = 1000, ttl: int = 300):
        self.max_size = max_size
        self.ttl = ttl  # 缓存过期时间（秒）
        self.cache = OrderedDict()  # 使用LRU缓存策略
        self.access_count = defaultdict(int)  # 访问计数
        self.hit_count = 0
        self.miss_count = 0
    
    def _generate_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """生成缓存键"""
        # 序列化参数
        key_data = f"{func_name}:{str(args)}:{str(sorted(kwargs.items()))}"
        # 使用MD5生成固定长度的键
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def get(self, func_name: str, args: tuple, kwargs: dict) -> Optional[Any]:
        """获取缓存值"""
        cache_key = self._generate_cache_key(func_name, args, kwargs)
        
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            # 检查是否过期
            if time.time() - entry['timestamp'] < self.ttl:
                # 更新访问计数
                self.access_count[cache_key] += 1
                self.hit_count += 1
                
                # 移动到末尾（LRU）
                self.cache.move_to_end(cache_key)
                
                return entry['value']
            else:
                # 过期，删除缓存项
                del self.cache[cache_key]
                if cache_key in self.access_count:
                    del self.access_count[cache_key]
        
        self.miss_count += 1
        return None
    
    def put(self, func_name: str, args: tuple, kwargs: dict, value: Any):
        """放入缓存值"""
        cache_key = self._generate_cache_key(func_name, args, kwargs)
        
        # 如果缓存已满，删除最少使用的项
        if len(self.cache) >= self.max_size:
            # 找到访问次数最少的项
            if self.access_count:
                min_access_key = min(self.access_count.keys(), 
                                   key=lambda k: self.access_count[k])
                del self.cache[min_access_key]
                del self.access_count[min_access_key]
            else:
                # 如果没有访问计数，删除最老的项
                self.cache.popitem(last=False)
        
        # 添加新项
        self.cache[cache_key] = {
            'value': value,
            'timestamp': time.time(),
            'func_name': func_name
        }
        self.access_count[cache_key] = 1
    
    def invalidate(self, func_name: Optional[str] = None):
        """使缓存失效"""
        if func_name:
            # 只使特定函数的缓存失效
            keys_to_remove = [
                key for key, entry in self.cache.items() 
                if entry['func_name'] == func_name
            ]
            for key in keys_to_remove:
                del self.cache[key]
                if key in self.access_count:
                    del self.access_count[key]
        else:
            # 使所有缓存失效
            self.cache.clear()
            self.access_count.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        total_requests = self.hit_count + self.miss_count
        hit_rate = self.hit_count / total_requests if total_requests > 0 else 0
        
        return {
            'hit_count': self.hit_count,
            'miss_count': self.miss_count,
            'hit_rate': hit_rate,
            'cache_size': len(self.cache),
            'max_size': self.max_size,
            'ttl': self.ttl
        }
    
    def get_hot_items(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """获取热门缓存项"""
        hot_items = []
        current_time = time.time()
        
        for cache_key, access_count in sorted(
            self.access_count.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:top_n]:
            if cache_key in self.cache:
                entry = self.cache[cache_key]
                hot_items.append({
                    'key': cache_key[:16] + '...',  # 截断显示
                    'func_name': entry['func_name'],
                    'access_count': access_count,
                    'age': current_time - entry['timestamp'],
                    'size': len(str(entry['value'])) if entry['value'] else 0
                })
        
        return hot_items

# 缓存装饰器
def cached_graph_computation(cache: GraphComputationCache, ttl: Optional[int] = None):
    """图计算缓存装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # 检查缓存
            cached_value = cache.get(func.__name__, args, kwargs)
            if cached_value is not None:
                return cached_value
            
            # 执行计算
            result = func(*args, **kwargs)
            
            # 缓存结果
            cache.put(func.__name__, args, kwargs, result)
            
            return result
        return wrapper
    return decorator

# 使用缓存的图算法
class CachedGraphAlgorithms:
    """带缓存的图算法"""
    
    def __init__(self, graph_store: InMemoryGraphStore):
        self.graph_store = graph_store
        self.cache = GraphComputationCache(max_size=500, ttl=600)  # 10分钟过期
    
    @cached_graph_computation(cache=lambda self: self.cache)
    def cached_bfs_traversal(self, start_vertex: str, max_depth: int = 3) -> Dict:
        """带缓存的BFS遍历"""
        traversal = GraphTraversal(self.graph_store)
        return traversal.bfs_traversal(start_vertex, max_depth)
    
    @cached_graph_computation(cache=lambda self: self.cache)
    def cached_shortest_path(self, start_vertex: str, end_vertex: str) -> Dict:
        """带缓存的最短路径计算"""
        sp_algorithms = ShortestPathAlgorithms(self.graph_store)
        return sp_algorithms.dijkstra_shortest_path(start_vertex, end_vertex)
    
    @cached_graph_computation(cache=lambda self: self.cache, ttl=300)  # 5分钟过期
    def cached_community_detection(self) -> Dict:
        """带缓存的社区发现"""
        louvain = LouvainCommunityDetection(self.graph_store)
        return louvain.detect_communities(max_iterations=3)
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """获取缓存统计"""
        return self.cache.get_stats()
    
    def get_hot_cache_items(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """获取热门缓存项"""
        return self.cache.get_hot_items(top_n)

# 使用示例
def example_cached_computation():
    """缓存计算示例"""
    # 创建图存储并添加测试数据
    graph_store = InMemoryGraphStore()
    
    # 创建测试节点和边
    print("创建测试数据...")
    for i in range(50):
        user_id = f"user_{i:02d}"
        graph_store.add_vertex(user_id, "USER", {
            "name": f"用户{user_id}",
            "risk_score": random.random()
        })
    
    # 创建连接关系
    for i in range(50):
        user1 = f"user_{i:02d}"
        for j in range(i+1, min(i+5, 50)):  # 每个用户连接后续4个用户
            user2 = f"user_{j:02d}"
            graph_store.add_edge(
                f"{user1}-{user2}",
                user1,
                user2,
                "FRIEND",
                {"strength": random.random()}
            )
    
    # 创建带缓存的图算法实例
    cached_algorithms = CachedGraphAlgorithms(graph_store)
    
    print("=== 缓存图计算测试 ===")
    
    # 第一次执行（缓存未命中）
    print("第一次执行BFS遍历...")
    start_time = time.time()
    result1 = cached_algorithms.cached_bfs_traversal("user_00", max_depth=2)
    first_execution_time = time.time() - start_time
    print(f"第一次执行时间: {first_execution_time:.4f}秒")
    
    # 第二次执行相同参数（缓存命中）
    print("第二次执行相同BFS遍历...")
    start_time = time.time()
    result2 = cached_algorithms.cached_bfs_traversal("user_00", max_depth=2)
    second_execution_time = time.time() - start_time
    print(f"第二次执行时间: {second_execution_time:.4f}秒")
    print(f"性能提升: {first_execution_time/second_execution_time:.2f}倍")
    
    # 执行不同的遍历（缓存未命中）
    print("执行不同的BFS遍历...")
    result3 = cached_algorithms.cached_bfs_traversal("user_05", max_depth=2)
    
    # 最短路径计算测试
    print("\n最短路径计算测试...")
    path_result1 = cached_algorithms.cached_shortest_path("user_00", "user_10")
    path_result2 = cached_algorithms.cached_shortest_path("user_00", "user_10")  # 缓存命中
    
    # 社区发现测试
    print("社区发现测试...")
    community_result1 = cached_algorithms.cached_community_detection()
    community_result2 = cached_algorithms.cached_community_detection()  # 缓存命中
    
    # 显示缓存统计
    print("\n=== 缓存统计 ===")
    stats = cached_algorithms.get_cache_stats()
    print(f"缓存命中数: {stats['hit_count']}")
    print(f"缓存未命中数: {stats['miss_count']}")
    print(f"命中率: {stats['hit_rate']:.2%}")
    print(f"缓存大小: {stats['cache_size']}/{stats['max_size']}")
    
    # 显示热门缓存项
    print("\n热门缓存项:")
    hot_items = cached_algorithms.get_hot_cache_items(5)
    for i, item in enumerate(hot_items, 1):
        print(f"  {i}. {item['func_name']} - 访问次数: {item['access_count']}, 存活时间: {item['age']:.1f}秒")

# example_cached_computation()
```

## 总结

实时图计算是现代风控系统识别复杂欺诈模式的核心技术，通过高效的算法实现和优化策略，能够及时发现团伙欺诈、中介网络和风险传播路径。

关键要点包括：
1. **架构设计**：采用事件驱动的实时处理架构，支持高并发数据流处理
2. **算法优化**：实现高效的图遍历、最短路径和社区发现算法
3. **风险识别**：通过多种方法识别关联欺诈和风险传播模式
4. **性能优化**：运用并行计算和智能缓存策略提升系统性能

随着业务规模的扩大和欺诈手段的演进，实时图计算系统需要持续优化算法效率、扩展系统容量，并引入更先进的机器学习技术来提升风险识别的准确性和及时性。