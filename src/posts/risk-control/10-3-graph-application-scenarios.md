---
title: "图计算应用场景: 挖掘欺诈团伙、识别中介、发现传销结构"
date: 2025-09-07
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 图计算应用场景：挖掘欺诈团伙、识别中介、发现传销结构

## 引言

在企业级智能风控平台中，图计算技术已成为识别复杂欺诈模式和挖掘隐藏风险关系的重要工具。通过将用户、设备、交易、账户等实体抽象为图中的节点，将它们之间的关系抽象为边，可以构建出反映真实业务关系的图结构。这种结构化表示能够揭示传统分析方法难以发现的复杂关联模式，如团伙欺诈、中介网络、传销结构等。

图计算的应用场景非常广泛，涵盖了从简单的关联分析到复杂的社区发现和风险传播分析。通过深入挖掘这些应用场景，可以显著提升风控系统的识别能力和防护效果。

本文将深入探讨图计算在风控领域的核心应用场景，包括欺诈团伙挖掘、中介识别、传销结构发现等，为构建高效的风控图计算系统提供指导。

## 一、欺诈团伙挖掘

### 1.1 团伙欺诈特征

团伙欺诈是指多个欺诈分子协同作案，通过复杂的组织结构和分工合作来规避风控系统的检测。这类欺诈行为具有以下典型特征：

#### 1.1.1 行为模式特征

**协同性**：
```python
# 团伙协同行为检测
import numpy as np
from collections import defaultdict
import time

class GangBehaviorAnalyzer:
    """团伙行为分析器"""
    
    def __init__(self):
        self.user_behaviors = defaultdict(list)
        self.co_occurrence_matrix = defaultdict(lambda: defaultdict(int))
    
    def record_user_behavior(self, user_id, behavior_type, timestamp, context=None):
        """记录用户行为"""
        behavior_record = {
            'type': behavior_type,
            'timestamp': timestamp,
            'context': context or {}
        }
        self.user_behaviors[user_id].append(behavior_record)
    
    def build_co_occurrence_matrix(self, time_window=3600):
        """
        构建共现矩阵
        
        Args:
            time_window: 时间窗口（秒）
        """
        # 清空之前的矩阵
        self.co_occurrence_matrix = defaultdict(lambda: defaultdict(int))
        
        # 按时间窗口分组行为
        time_groups = defaultdict(lambda: defaultdict(list))
        
        for user_id, behaviors in self.user_behaviors.items():
            for behavior in behaviors:
                time_key = int(behavior['timestamp'] / time_window)
                time_groups[time_key][user_id].append(behavior)
        
        # 构建共现关系
        for time_key, user_behaviors in time_groups.items():
            users_in_window = list(user_behaviors.keys())
            
            # 计算用户间的共现次数
            for i in range(len(users_in_window)):
                for j in range(i + 1, len(users_in_window)):
                    user1 = users_in_window[i]
                    user2 = users_in_window[j]
                    self.co_occurrence_matrix[user1][user2] += 1
                    self.co_occurrence_matrix[user2][user1] += 1
    
    def detect_cooperative_behavior(self, threshold=3):
        """
        检测协同行为
        
        Args:
            threshold: 共现阈值
            
        Returns:
            协同用户对列表
        """
        cooperative_pairs = []
        
        for user1, connections in self.co_occurrence_matrix.items():
            for user2, count in connections.items():
                if count >= threshold and user1 < user2:  # 避免重复
                    cooperative_pairs.append({
                        'user1': user1,
                        'user2': user2,
                        'co_occurrence_count': count
                    })
        
        return cooperative_pairs

# 使用示例
def example_gang_behavior_detection():
    """团伙行为检测示例"""
    analyzer = GangBehaviorAnalyzer()
    
    # 模拟用户行为数据
    import random
    base_time = time.time() - 86400  # 24小时前
    
    # 正常用户行为
    for i in range(50):
        user_id = f"user_{i:03d}"
        # 随机时间点的行为
        for _ in range(random.randint(1, 5)):
            behavior_time = base_time + random.randint(0, 86400)
            analyzer.record_user_behavior(
                user_id, 
                'login', 
                behavior_time,
                {'ip': f"192.168.1.{random.randint(1, 100)}"}
            )
    
    # 模拟团伙用户行为（在短时间内频繁共现）
    gang_users = [f"gang_{i:02d}" for i in range(10)]
    for i in range(20):  # 20个时间窗口
        window_start = base_time + i * 1800  # 每30分钟一个窗口
        # 团伙成员在相同时间窗口内活动
        for user_id in gang_users:
            for j in range(3):  # 每个成员在窗口内有3次行为
                behavior_time = window_start + random.randint(0, 1800)
                analyzer.record_user_behavior(
                    user_id,
                    'transaction',
                    behavior_time,
                    {'amount': random.uniform(100, 1000)}
                )
    
    # 构建共现矩阵
    analyzer.build_co_occurrence_matrix(time_window=1800)
    
    # 检测协同行为
    cooperative_pairs = analyzer.detect_cooperative_behavior(threshold=5)
    
    print(f"检测到 {len(cooperative_pairs)} 对协同用户:")
    for pair in cooperative_pairs[:10]:  # 显示前10对
        print(f"  {pair['user1']} - {pair['user2']}: 共现 {pair['co_occurrence_count']} 次")

# 运行示例
# example_gang_behavior_detection()
```

#### 1.1.2 设备指纹特征

**设备共享模式**：
```python
# 设备指纹分析
class DeviceFingerprintAnalyzer:
    """设备指纹分析器"""
    
    def __init__(self):
        self.device_users = defaultdict(set)
        self.user_devices = defaultdict(set)
    
    def record_device_usage(self, user_id, device_id, timestamp):
        """记录设备使用情况"""
        self.device_users[device_id].add(user_id)
        self.user_devices[user_id].add(device_id)
    
    def detect_device_sharing_gangs(self, min_users_per_device=3):
        """
        检测设备共享团伙
        
        Args:
            min_users_per_device: 单个设备最少用户数
            
        Returns:
            设备共享团伙列表
        """
        sharing_gangs = []
        
        for device_id, users in self.device_users.items():
            if len(users) >= min_users_per_device:
                sharing_gangs.append({
                    'device_id': device_id,
                    'users': list(users),
                    'user_count': len(users)
                })
        
        return sharing_gangs
    
    def detect_user_device_networks(self, max_devices_per_user=2):
        """
        检测用户设备网络
        
        Args:
            max_devices_per_user: 单个用户最多设备数
            
        Returns:
            异常用户列表
        """
        suspicious_users = []
        
        for user_id, devices in self.user_devices.items():
            if len(devices) > max_devices_per_user:
                suspicious_users.append({
                    'user_id': user_id,
                    'devices': list(devices),
                    'device_count': len(devices)
                })
        
        return suspicious_users

# 使用示例
def example_device_fingerprint_analysis():
    """设备指纹分析示例"""
    analyzer = DeviceFingerprintAnalyzer()
    
    # 模拟正常用户设备使用
    import random
    for i in range(100):
        user_id = f"user_{i:03d}"
        # 正常用户通常使用1-2个设备
        device_count = random.randint(1, 2)
        for j in range(device_count):
            device_id = f"device_{random.randint(1, 50):03d}"
            analyzer.record_device_usage(user_id, device_id, time.time())
    
    # 模拟团伙用户共享设备
    gang_devices = [f"gang_device_{i:02d}" for i in range(5)]
    for i in range(20):
        user_id = f"gang_member_{i:02d}"
        # 团伙成员共享多个设备
        for device_id in gang_devices:
            analyzer.record_device_usage(user_id, device_id, time.time())
    
    # 检测设备共享团伙
    sharing_gangs = analyzer.detect_device_sharing_gangs(min_users_per_device=3)
    print(f"检测到 {len(sharing_gangs)} 个设备共享团伙:")
    for gang in sharing_gangs:
        print(f"  设备 {gang['device_id']} 被 {gang['user_count']} 个用户共享")
    
    # 检测异常用户设备网络
    suspicious_users = analyzer.detect_user_device_networks(max_devices_per_user=3)
    print(f"\n检测到 {len(suspicious_users)} 个异常用户:")
    for user in suspicious_users:
        if user['device_count'] > 5:  # 重点关注设备数过多的用户
            print(f"  用户 {user['user_id']} 使用了 {user['device_count']} 个设备")

# 运行示例
# example_device_fingerprint_analysis()
```

### 1.2 社团发现算法

#### 1.2.1 Louvain算法

**社团结构识别**：
```python
# Louvain社团发现算法实现
class LouvainCommunityDetection:
    """Louvain社团发现算法"""
    
    def __init__(self, graph):
        self.graph = graph
        self.communities = {node: i for i, node in enumerate(graph.nodes)}
        self.community_edges = defaultdict(int)
        self.node_degrees = defaultdict(int)
        self.total_edges = 0
        
        # 初始化社区和度数
        self._initialize()
    
    def _initialize(self):
        """初始化社区和度数"""
        # 计算节点度数和社区内边数
        for edge in self.graph.edges.values():
            source = edge.source_node.node_id
            target = edge.target_node.node_id
            
            self.node_degrees[source] += 1
            self.node_degrees[target] += 1
            self.total_edges += 1
            
            # 如果边的两端在同一社区，增加社区内边数
            if self.communities[source] == self.communities[target]:
                community = self.communities[source]
                self.community_edges[community] += 1
    
    def modularity(self):
        """计算模块度"""
        Q = 0.0
        m = self.total_edges
        
        if m == 0:
            return 0.0
        
        for community in set(self.communities.values()):
            # 社区内边数
            edges_in = self.community_edges[community]
            # 社区内节点度数平方和
            degree_sum = sum(
                self.node_degrees[node] 
                for node, comm in self.communities.items() 
                if comm == community
            )
            
            Q += (edges_in / m) - (degree_sum / (2 * m)) ** 2
        
        return Q
    
    def find_best_community_for_node(self, node_id):
        """为节点找到最佳社区"""
        best_community = self.communities[node_id]
        best_gain = 0.0
        
        # 计算当前模块度增益
        current_community = self.communities[node_id]
        current_gain = self._calculate_modularity_gain(node_id, current_community)
        
        # 检查邻居节点所在的社区
        neighbor_communities = set()
        for edge_id, edge in self.graph.edges.items():
            if edge.source_node.node_id == node_id:
                neighbor_communities.add(self.communities[edge.target_node.node_id])
            elif edge.target_node.node_id == node_id:
                neighbor_communities.add(self.communities[edge.source_node.node_id])
        
        # 计算移动到每个邻居社区的模块度增益
        for community in neighbor_communities:
            if community != current_community:
                gain = self._calculate_modularity_gain(node_id, community)
                if gain > best_gain:
                    best_gain = gain
                    best_community = community
        
        return best_community, best_gain
    
    def _calculate_modularity_gain(self, node_id, new_community):
        """计算模块度增益"""
        # 简化实现，实际Louvain算法更复杂
        current_community = self.communities[node_id]
        if current_community == new_community:
            return 0.0
        
        # 计算移动节点后的模块度变化
        # 这里使用简化的近似计算
        node_degree = self.node_degrees[node_id]
        m = self.total_edges
        
        if m == 0:
            return 0.0
        
        # 计算与新社区的连接数
        connections_to_new = 0
        connections_to_current = 0
        
        for edge_id, edge in self.graph.edges.items():
            if edge.source_node.node_id == node_id:
                target_community = self.communities[edge.target_node.node_id]
                if target_community == new_community:
                    connections_to_new += 1
                elif target_community == current_community:
                    connections_to_current += 1
            elif edge.target_node.node_id == node_id:
                source_community = self.communities[edge.source_node.node_id]
                if source_community == new_community:
                    connections_to_new += 1
                elif source_community == current_community:
                    connections_to_current += 1
        
        # 简化的模块度增益计算
        gain = (connections_to_new - connections_to_current) / m
        return gain
    
    def detect_communities(self, max_iterations=10):
        """
        检测社区结构
        
        Args:
            max_iterations: 最大迭代次数
            
        Returns:
            社区检测结果
        """
        for iteration in range(max_iterations):
            improved = False
            
            # 遍历所有节点
            for node_id in self.graph.nodes.keys():
                best_community, best_gain = self.find_best_community_for_node(node_id)
                
                # 如果有更好的社区，移动节点
                if best_gain > 0:
                    old_community = self.communities[node_id]
                    self.communities[node_id] = best_community
                    improved = True
            
            # 如果没有改进，停止迭代
            if not improved:
                break
        
        # 整理社区结果
        community_groups = defaultdict(list)
        for node_id, community in self.communities.items():
            community_groups[community].append(node_id)
        
        # 过滤掉过小的社区
        significant_communities = {
            comm_id: nodes 
            for comm_id, nodes in community_groups.items() 
            if len(nodes) >= 3
        }
        
        return {
            'communities': significant_communities,
            'modularity': self.modularity(),
            'iterations': iteration + 1
        }

# 使用示例
def example_louvain_community_detection():
    """Louvain社区发现示例"""
    # 创建示例图（简化）
    class SimpleGraph:
        def __init__(self):
            self.nodes = {}
            self.edges = {}
    
    graph = SimpleGraph()
    
    # 添加节点（模拟用户）
    users = [f"user_{i:02d}" for i in range(20)]
    for user in users:
        graph.nodes[user] = user
    
    # 添加边（模拟用户关系）
    import random
    
    # 创建几个紧密连接的用户组（模拟团伙）
    gangs = [
        [f"user_{i:02d}" for i in range(5)],    # 团伙1
        [f"user_{i:02d}" for i in range(5, 10)], # 团伙2
        [f"user_{i:02d}" for i in range(10, 15)] # 团伙3
    ]
    
    # 在团伙内部添加密集连接
    for gang in gangs:
        for i in range(len(gang)):
            for j in range(i + 1, len(gang)):
                if random.random() > 0.3:  # 70%概率有连接
                    edge_id = f"{gang[i]}-{gang[j]}"
                    graph.edges[edge_id] = {
                        'source_node': {'node_id': gang[i]},
                        'target_node': {'node_id': gang[j]}
                    }
    
    # 添加一些随机连接（模拟正常用户关系）
    for _ in range(30):
        user1 = random.choice(users)
        user2 = random.choice(users)
        if user1 != user2:
            edge_id = f"{user1}-{user2}"
            if edge_id not in graph.edges:
                graph.edges[edge_id] = {
                    'source_node': {'node_id': user1},
                    'target_node': {'node_id': user2}
                }
    
    # 执行社区发现
    louvain = LouvainCommunityDetection(graph)
    result = louvain.detect_communities()
    
    print(f"检测到 {len(result['communities'])} 个显著社区:")
    print(f"模块度: {result['modularity']:.4f}")
    print(f"迭代次数: {result['iterations']}")
    
    for comm_id, nodes in result['communities'].items():
        print(f"  社区 {comm_id}: {len(nodes)} 个节点")
        if len(nodes) <= 10:  # 只显示小社区的节点
            print(f"    节点: {', '.join(nodes)}")

# 运行示例
# example_louvain_community_detection()
```

## 二、中介识别

### 2.1 中介模式分析

中介是指在欺诈活动中起到桥梁作用的个人或账户，他们通常与多个欺诈团伙有联系，帮助传递资金或信息。

#### 2.1.1 中介特征识别

**桥梁节点检测**：
```python
# 中介识别算法
class IntermediaryDetector:
    """中介识别器"""
    
    def __init__(self, graph):
        self.graph = graph
        self.betweenness_scores = {}
        self.centrality_scores = {}
    
    def calculate_betweenness_centrality(self):
        """计算介数中心性"""
        # 简化实现，实际应该使用Brandes算法
        node_betweenness = defaultdict(float)
        
        # 对于每个节点，计算它是多少最短路径上的中介
        nodes = list(self.graph.nodes.keys())
        
        for source in nodes:
            for target in nodes:
                if source != target:
                    # 找到从source到target的所有最短路径
                    paths = self._find_shortest_paths(source, target)
                    
                    # 如果有多条最短路径，中介节点得分更高
                    if len(paths) > 1:
                        for path in paths:
                            for node in path[1:-1]:  # 排除起点和终点
                                node_betweenness[node] += 1.0 / len(paths)
        
        self.betweenness_scores = dict(node_betweenness)
        return self.betweenness_scores
    
    def _find_shortest_paths(self, source, target):
        """查找最短路径（简化实现）"""
        # 使用BFS查找最短路径
        from collections import deque
        
        queue = deque([(source, [source])])
        visited = {source}
        paths = []
        min_length = float('inf')
        
        while queue:
            current_node, path = queue.popleft()
            
            if len(path) > min_length:
                continue
            
            if current_node == target:
                if len(path) < min_length:
                    min_length = len(path)
                    paths = [path]
                elif len(path) == min_length:
                    paths.append(path)
                continue
            
            # 查找邻居节点
            neighbors = self._get_neighbors(current_node)
            for neighbor in neighbors:
                if neighbor not in visited or len(path) < 3:  # 允许短路径回访
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))
        
        return paths
    
    def _get_neighbors(self, node_id):
        """获取节点的邻居"""
        neighbors = set()
        
        for edge in self.graph.edges.values():
            if edge.source_node.node_id == node_id:
                neighbors.add(edge.target_node.node_id)
            elif edge.target_node.node_id == node_id:
                neighbors.add(edge.source_node.node_id)
        
        return list(neighbors)
    
    def calculate_closeness_centrality(self):
        """计算接近中心性"""
        node_closeness = {}
        nodes = list(self.graph.nodes.keys())
        
        for node in nodes:
            total_distance = 0
            reachable_nodes = 0
            
            # 计算到其他所有节点的最短距离
            distances = self._calculate_distances(node)
            
            for target, distance in distances.items():
                if distance != float('inf') and target != node:
                    total_distance += distance
                    reachable_nodes += 1
            
            if reachable_nodes > 0 and total_distance > 0:
                closeness = reachable_nodes / total_distance
                node_closeness[node] = closeness
            else:
                node_closeness[node] = 0
        
        self.centrality_scores = node_closeness
        return node_closeness
    
    def _calculate_distances(self, source):
        """计算从源节点到所有其他节点的距离"""
        from collections import deque
        
        distances = defaultdict(lambda: float('inf'))
        distances[source] = 0
        queue = deque([source])
        visited = {source}
        
        while queue:
            current = queue.popleft()
            
            neighbors = self._get_neighbors(current)
            for neighbor in neighbors:
                if neighbor not in visited:
                    distances[neighbor] = distances[current] + 1
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        return dict(distances)
    
    def detect_intermediaries(self, betweenness_threshold=0.5, centrality_threshold=0.3):
        """
        检测中介节点
        
        Args:
            betweenness_threshold: 介数中心性阈值
            centrality_threshold: 接近中心性阈值
            
        Returns:
            中介节点列表
        """
        # 计算中心性指标
        if not self.betweenness_scores:
            self.calculate_betweenness_centrality()
        
        if not self.centrality_scores:
            self.calculate_closeness_centrality()
        
        # 识别中介节点
        intermediaries = []
        all_nodes = set(self.graph.nodes.keys())
        
        for node in all_nodes:
            betweenness = self.betweenness_scores.get(node, 0)
            centrality = self.centrality_scores.get(node, 0)
            
            # 中介节点通常具有高介数中心性和适中的接近中心性
            if betweenness > betweenness_threshold and centrality > centrality_threshold:
                intermediaries.append({
                    'node_id': node,
                    'betweenness': betweenness,
                    'centrality': centrality,
                    'score': betweenness * centrality
                })
        
        # 按得分排序
        intermediaries.sort(key=lambda x: x['score'], reverse=True)
        return intermediaries

# 使用示例
def example_intermediary_detection():
    """中介识别示例"""
    # 创建示例图
    class SimpleGraph:
        def __init__(self):
            self.nodes = {}
            self.edges = {}
    
    graph = SimpleGraph()
    
    # 创建节点
    nodes = [f"node_{i:02d}" for i in range(15)]
    for node in nodes:
        graph.nodes[node] = node
    
    # 创建团伙结构，包含中介节点
    # 团伙A: node_00 - node_04
    gang_a = [f"node_{i:02d}" for i in range(5)]
    # 团伙B: node_10 - node_14
    gang_b = [f"node_{i:02d}" for i in range(10, 15)]
    # 中介节点: node_05 - node_09
    intermediaries = [f"node_{i:02d}" for i in range(5, 10)]
    
    # 在团伙内部添加连接
    for gang in [gang_a, gang_b]:
        for i in range(len(gang)):
            for j in range(i + 1, len(gang)):
                edge_id = f"{gang[i]}-{gang[j]}"
                graph.edges[edge_id] = {
                    'source_node': {'node_id': gang[i]},
                    'target_node': {'node_id': gang[j]}
                }
    
    # 中介节点连接两个团伙
    for intermediary in intermediaries:
        # 连接到团伙A
        for node in gang_a:
            if node != intermediary:
                edge_id = f"{intermediary}-{node}"
                graph.edges[edge_id] = {
                    'source_node': {'node_id': intermediary},
                    'target_node': {'node_id': node}
                }
        # 连接到团伙B
        for node in gang_b:
            if node != intermediary:
                edge_id = f"{intermediary}-{node}"
                graph.edges[edge_id] = {
                    'source_node': {'node_id': intermediary},
                    'target_node': {'node_id': node}
                }
    
    # 执行中介识别
    detector = IntermediaryDetector(graph)
    intermediaries_found = detector.detect_intermediaries(
        betweenness_threshold=1.0,
        centrality_threshold=0.1
    )
    
    print(f"检测到 {len(intermediaries_found)} 个中介节点:")
    for intermediary in intermediaries_found[:5]:  # 显示前5个
        print(f"  节点 {intermediary['node_id']}: "
              f"介数={intermediary['betweenness']:.2f}, "
              f"接近中心性={intermediary['centrality']:.2f}, "
              f"得分={intermediary['score']:.2f}")

# 运行示例
# example_intermediary_detection()
```

### 2.2 资金流中介检测

#### 2.2.1 交易链路分析

**资金流转模式**：
```python
# 资金流中介检测
class MoneyFlowIntermediaryDetector:
    """资金流中介检测器"""
    
    def __init__(self, transaction_graph):
        self.graph = transaction_graph
        self.transaction_chains = []
    
    def build_transaction_chains(self, max_chain_length=5):
        """
        构建交易链
        
        Args:
            max_chain_length: 最大链长度
        """
        # 查找所有可能的交易链路
        transaction_nodes = [
            node_id for node_id, node in self.graph.nodes.items()
            if node.type == 'TRANSACTION'
        ]
        
        chains = []
        for start_node in transaction_nodes:
            # 从每个交易节点开始，查找可能的链路
            chain = self._find_transaction_chain(start_node, max_chain_length)
            if len(chain) > 1:  # 至少两个节点才构成链
                chains.append(chain)
        
        self.transaction_chains = chains
        return chains
    
    def _find_transaction_chain(self, start_node_id, max_length):
        """查找交易链"""
        chain = [start_node_id]
        current_node = start_node_id
        
        # 向前查找
        for _ in range(max_length - 1):
            next_node = self._find_next_transaction(current_node)
            if next_node and next_node not in chain:
                chain.append(next_node)
                current_node = next_node
            else:
                break
        
        return chain
    
    def _find_next_transaction(self, current_node_id):
        """查找下一个相关交易"""
        # 查找与当前交易相关的下一个交易
        for edge_id, edge in self.graph.edges.items():
            if (edge.source_node.node_id == current_node_id and 
                edge.edge_type == 'TRANSACTION_CHAIN'):
                return edge.target_node.node_id
            elif (edge.target_node.node_id == current_node_id and 
                  edge.edge_type == 'TRANSACTION_CHAIN'):
                return edge.source_node.node_id
        return None
    
    def detect_money_mules(self, min_chain_length=3, min_amount_ratio=0.8):
        """
        检测资金骡（洗钱中介）
        
        Args:
            min_chain_length: 最小链长度
            min_amount_ratio: 最小金额比例阈值
            
        Returns:
            资金骡列表
        """
        if not self.transaction_chains:
            self.build_transaction_chains()
        
        money_mules = []
        
        for chain in self.transaction_chains:
            if len(chain) >= min_chain_length:
                # 分析链中的中间节点
                intermediate_nodes = chain[1:-1]  # 排除首尾节点
                
                for node_id in intermediate_nodes:
                    node = self.graph.nodes.get(node_id)
                    if node and node.type == 'USER':
                        # 检查该用户是否是资金骡
                        is_mule = self._analyze_user_as_mule(node_id, chain)
                        if is_mule:
                            money_mules.append({
                                'user_id': node_id,
                                'chain_length': len(chain),
                                'position_in_chain': chain.index(node_id),
                                'suspicion_score': self._calculate_mule_score(node_id, chain)
                            })
        
        # 按嫌疑度排序
        money_mules.sort(key=lambda x: x['suspicion_score'], reverse=True)
        return money_mules
    
    def _analyze_user_as_mule(self, user_id, chain):
        """分析用户是否为资金骡"""
        # 检查用户的交易模式
        user_transactions = self._get_user_transactions(user_id)
        
        if len(user_transactions) < 2:
            return False
        
        # 检查是否在短时间内收到和发送相似金额的资金
        received_transactions = [
            tx for tx in user_transactions 
            if tx.get('direction') == 'received'
        ]
        sent_transactions = [
            tx for tx in user_transactions 
            if tx.get('direction') == 'sent'
        ]
        
        if not received_transactions or not sent_transactions:
            return False
        
        # 检查金额相似性
        avg_received = sum(tx.get('amount', 0) for tx in received_transactions) / len(received_transactions)
        avg_sent = sum(tx.get('amount', 0) for tx in sent_transactions) / len(sent_transactions)
        
        amount_ratio = min(avg_received, avg_sent) / max(avg_received, avg_sent)
        
        # 检查时间间隔
        time_intervals = []
        for i in range(len(user_transactions) - 1):
            interval = abs(
                user_transactions[i+1].get('timestamp', 0) - 
                user_transactions[i].get('timestamp', 0)
            )
            time_intervals.append(interval)
        
        avg_interval = sum(time_intervals) / len(time_intervals) if time_intervals else float('inf')
        
        # 资金骡特征：金额相似且时间间隔短
        return amount_ratio > 0.8 and avg_interval < 3600  # 1小时内
    
    def _calculate_mule_score(self, user_id, chain):
        """计算资金骡嫌疑度得分"""
        score = 0.0
        
        # 链长度贡献
        score += len(chain) * 0.1
        
        # 用户交易历史贡献
        user_transactions = self._get_user_transactions(user_id)
        if len(user_transactions) > 5:
            score += 0.2
        
        # 金额相似度贡献
        received_transactions = [
            tx for tx in user_transactions 
            if tx.get('direction') == 'received'
        ]
        sent_transactions = [
            tx for tx in user_transactions 
            if tx.get('direction') == 'sent'
        ]
        
        if received_transactions and sent_transactions:
            avg_received = sum(tx.get('amount', 0) for tx in received_transactions) / len(received_transactions)
            avg_sent = sum(tx.get('amount', 0) for tx in sent_transactions) / len(sent_transactions)
            
            if max(avg_received, avg_sent) > 0:
                amount_ratio = min(avg_received, avg_sent) / max(avg_received, avg_sent)
                score += amount_ratio * 0.3
        
        return min(score, 1.0)  # 限制最大得分为1.0
    
    def _get_user_transactions(self, user_id):
        """获取用户交易记录"""
        transactions = []
        
        # 查找与用户相关的交易边
        for edge_id, edge in self.graph.edges.items():
            if edge.edge_type == 'USER_TRANSACTION':
                if edge.source_node.node_id == f"user:{user_id}":
                    transactions.append({
                        'transaction_id': edge.properties.get('transaction_id'),
                        'amount': edge.properties.get('amount', 0),
                        'timestamp': edge.properties.get('timestamp', 0),
                        'direction': 'sent'
                    })
                elif edge.target_node.node_id == f"user:{user_id}":
                    transactions.append({
                        'transaction_id': edge.properties.get('transaction_id'),
                        'amount': edge.properties.get('amount', 0),
                        'timestamp': edge.properties.get('timestamp', 0),
                        'direction': 'received'
                    })
        
        return transactions

# 使用示例
def example_money_flow_detection():
    """资金流中介检测示例"""
    # 创建交易图
    class TransactionGraph:
        def __init__(self):
            self.nodes = {}
            self.edges = {}
    
    graph = TransactionGraph()
    
    # 创建用户节点
    users = ['user_A', 'user_B', 'user_C', 'user_D', 'user_E']
    for user in users:
        graph.nodes[f"user:{user}"] = type('Node', (), {
            'node_id': f"user:{user}",
            'type': 'USER'
        })()
    
    # 创建交易节点
    transactions = [f"tx_{i:02d}" for i in range(10)]
    for tx in transactions:
        graph.nodes[tx] = type('Node', (), {
            'node_id': tx,
            'type': 'TRANSACTION'
        })()
    
    import random
    base_time = time.time() - 86400
    
    # 创建正常的用户交易
    for i in range(3):
        user = random.choice(users)
        tx_id = f"tx_{i:02d}"
        amount = random.uniform(100, 1000)
        
        edge = type('Edge', (), {
            'edge_type': 'USER_TRANSACTION',
            'source_node': graph.nodes[f"user:{user}"],
            'target_node': graph.nodes[tx_id],
            'properties': {
                'transaction_id': tx_id,
                'amount': amount,
                'timestamp': base_time + i * 3600
            }
        })()
        graph.edges[f"edge_{i:02d}"] = edge
    
    # 创建资金骡模式的交易链
    mule_user = 'user_C'
    chain_transactions = [f"tx_{i:02d}" for i in range(3, 8)]
    
    # 资金骡接收资金
    receive_amount = 1000.0
    for i, tx_id in enumerate(chain_transactions[:-1]):
        edge = type('Edge', (), {
            'edge_type': 'USER_TRANSACTION',
            'source_node': graph.nodes[f"user:user_B"],  # 发送者
            'target_node': graph.nodes[f"user:{mule_user}"],
            'properties': {
                'transaction_id': f"receive_{tx_id}",
                'amount': receive_amount,
                'timestamp': base_time + 10000 + i * 600,  # 短时间内
                'direction': 'received'
            }
        })()
        graph.edges[f"receive_edge_{i:02d}"] = edge
        
        # 资金骡发送资金
        send_amount = receive_amount * 0.95  # 略微减少（扣除手续费）
        edge2 = type('Edge', (), {
            'edge_type': 'USER_TRANSACTION',
            'source_node': graph.nodes[f"user:{mule_user}"],
            'target_node': graph.nodes[f"user:user_D"],  # 接收者
            'properties': {
                'transaction_id': f"send_{tx_id}",
                'amount': send_amount,
                'timestamp': base_time + 10030 + i * 600,  # 紧接着
                'direction': 'sent'
            }
        })()
        graph.edges[f"send_edge_{i:02d}"] = edge2
    
    # 创建交易链边
    for i in range(len(chain_transactions) - 1):
        edge = type('Edge', (), {
            'edge_type': 'TRANSACTION_CHAIN',
            'source_node': graph.nodes[chain_transactions[i]],
            'target_node': graph.nodes[chain_transactions[i+1]],
            'properties': {}
        })()
        graph.edges[f"chain_edge_{i:02d}"] = edge
    
    # 执行资金骡检测
    detector = MoneyFlowIntermediaryDetector(graph)
    money_mules = detector.detect_money_mules(min_chain_length=3)
    
    print(f"检测到 {len(money_mules)} 个资金骡:")
    for mule in money_mules:
        print(f"  用户 {mule['user_id']}: "
              f"链长度={mule['chain_length']}, "
              f"位置={mule['position_in_chain']}, "
              f"嫌疑度={mule['suspicion_score']:.2f}")

# 运行示例
# example_money_flow_detection()
```

## 三、传销结构发现

### 3.1 传销模式特征

传销是一种非法的营销模式，通过发展人员加入并要求其继续发展下线来获取利益。在风控场景中，识别传销结构对于防范金融风险具有重要意义。

#### 3.1.1 层级结构分析

**树状结构检测**：
```python
# 传销结构检测
class PyramidSchemeDetector:
    """传销结构检测器"""
    
    def __init__(self, referral_graph):
        self.graph = referral_graph
        self.tree_structures = []
    
    def build_referral_trees(self):
        """构建推荐树结构"""
        # 查找所有可能的根节点（没有上级推荐的用户）
        root_candidates = self._find_root_candidates()
        
        trees = []
        for root in root_candidates:
            tree = self._build_referral_tree(root)
            if tree and len(tree['nodes']) > 5:  # 至少5个节点才认为是潜在传销
                trees.append(tree)
        
        self.tree_structures = trees
        return trees
    
    def _find_root_candidates(self):
        """查找根节点候选"""
        all_users = {
            node_id for node_id, node in self.graph.nodes.items()
            if node.type == 'USER'
        }
        
        # 查找没有被推荐的用户
        referred_users = set()
        for edge in self.graph.edges.values():
            if edge.edge_type == 'REFERRAL':
                referred_users.add(edge.target_node.node_id)
        
        root_candidates = all_users - referred_users
        return list(root_candidates)
    
    def _build_referral_tree(self, root_node_id, max_depth=10):
        """构建推荐树"""
        tree = {
            'root': root_node_id,
            'nodes': {root_node_id: {'level': 0, 'parent': None, 'children': []}},
            'levels': defaultdict(list),
            'depth': 0
        }
        
        tree['levels'][0].append(root_node_id)
        
        # 广度优先遍历构建树
        queue = [(root_node_id, 0)]
        visited = {root_node_id}
        
        while queue and tree['depth'] < max_depth:
            current_node, level = queue.pop(0)
            
            if level >= max_depth:
                continue
            
            # 查找当前节点的下级
            children = self._find_referrals(current_node)
            
            for child in children:
                if child not in visited:
                    visited.add(child)
                    tree['nodes'][child] = {
                        'level': level + 1,
                        'parent': current_node,
                        'children': []
                    }
                    tree['levels'][level + 1].append(child)
                    tree['nodes'][current_node]['children'].append(child)
                    tree['depth'] = max(tree['depth'], level + 1)
                    queue.append((child, level + 1))
        
        return tree if len(tree['nodes']) > 1 else None
    
    def _find_referrals(self, user_id):
        """查找用户的下级推荐"""
        referrals = []
        
        for edge in self.graph.edges.values():
            if (edge.edge_type == 'REFERRAL' and 
                edge.source_node.node_id == user_id):
                referrals.append(edge.target_node.node_id)
        
        return referrals
    
    def detect_pyramid_schemes(self, min_levels=3, min_branching_factor=2):
        """
        检测传销结构
        
        Args:
            min_levels: 最小层级数
            min_branching_factor: 最小分支因子
            
        Returns:
            传销结构列表
        """
        if not self.tree_structures:
            self.build_referral_trees()
        
        pyramid_schemes = []
        
        for tree in self.tree_structures:
            # 检查树的特征
            if self._is_pyramid_scheme(tree, min_levels, min_branching_factor):
                pyramid_schemes.append({
                    'root': tree['root'],
                    'node_count': len(tree['nodes']),
                    'depth': tree['depth'],
                    'branching_pattern': self._analyze_branching_pattern(tree),
                    'pyramid_score': self._calculate_pyramid_score(tree)
                })
        
        # 按传销嫌疑度排序
        pyramid_schemes.sort(key=lambda x: x['pyramid_score'], reverse=True)
        return pyramid_schemes
    
    def _is_pyramid_scheme(self, tree, min_levels, min_branching_factor):
        """判断是否为传销结构"""
        # 检查层级数
        if tree['depth'] < min_levels:
            return False
        
        # 检查分支模式
        branching_factors = []
        for level in range(tree['depth']):
            nodes_at_level = tree['levels'][level]
            if level > 0:
                parent_level = level - 1
                parents_at_level = tree['levels'][parent_level]
                
                if parents_at_level:
                    # 计算平均分支因子
                    total_children = sum(
                        len(tree['nodes'][parent]['children'])
                        for parent in parents_at_level
                    )
                    avg_branching = total_children / len(parents_at_level)
                    branching_factors.append(avg_branching)
        
        if not branching_factors:
            return False
        
        avg_branching_factor = sum(branching_factors) / len(branching_factors)
        return avg_branching_factor >= min_branching_factor
    
    def _analyze_branching_pattern(self, tree):
        """分析分支模式"""
        pattern = []
        
        for level in range(min(tree['depth'] + 1, 5)):  # 最多分析5层
            nodes_count = len(tree['levels'][level])
            pattern.append(nodes_count)
        
        return pattern
    
    def _calculate_pyramid_score(self, tree):
        """计算传销嫌疑度得分"""
        score = 0.0
        
        # 层级深度贡献
        score += min(tree['depth'] / 10.0, 0.3)
        
        # 节点数量贡献
        node_count = len(tree['nodes'])
        score += min(node_count / 100.0, 0.3)
        
        # 分支模式贡献
        branching_factors = []
        for level in range(tree['depth']):
            nodes_at_level = tree['levels'][level]
            if level > 0:
                parent_level = level - 1
                parents_at_level = tree['levels'][parent_level]
                
                if parents_at_level:
                    total_children = sum(
                        len(tree['nodes'][parent]['children'])
                        for parent in parents_at_level
                    )
                    avg_branching = total_children / len(parents_at_level) if parents_at_level else 0
                    branching_factors.append(avg_branching)
        
        if branching_factors:
            avg_branching = sum(branching_factors) / len(branching_factors)
            score += min(avg_branching / 5.0, 0.4)
        
        return min(score, 1.0)

# 使用示例
def example_pyramid_scheme_detection():
    """传销结构检测示例"""
    # 创建推荐图
    class ReferralGraph:
        def __init__(self):
            self.nodes = {}
            self.edges = {}
    
    graph = ReferralGraph()
    
    # 创建用户节点
    import random
    
    # 创建正常用户
    normal_users = [f"normal_user_{i:02d}" for i in range(20)]
    for user in normal_users:
        graph.nodes[user] = type('Node', (), {
            'node_id': user,
            'type': 'USER'
        })()
    
    # 创建传销结构
    # 创建一个传销组织，根节点为pyramid_root
    pyramid_root = "pyramid_root"
    graph.nodes[pyramid_root] = type('Node', (), {
        'node_id': pyramid_root,
        'type': 'USER'
    })()
    
    # 创建传销层级结构
    # 第1层：5个直接下级
    level1_users = [f"pyramid_l1_{i}" for i in range(5)]
    for user in level1_users:
        graph.nodes[user] = type('Node', (), {
            'node_id': user,
            'type': 'USER'
        })()
        # 添加推荐关系边
        edge = type('Edge', (), {
            'edge_type': 'REFERRAL',
            'source_node': graph.nodes[pyramid_root],
            'target_node': graph.nodes[user],
            'properties': {}
        })()
        graph.edges[f"referral_{pyramid_root}_{user}"] = edge
    
    # 第2层：每个第1层用户有3个下级
    level2_users = []
    for i, parent in enumerate(level1_users):
        for j in range(3):
            child = f"pyramid_l2_{i}_{j}"
            level2_users.append(child)
            graph.nodes[child] = type('Node', (), {
                'node_id': child,
                'type': 'USER'
            })()
            # 添加推荐关系边
            edge = type('Edge', (), {
                'edge_type': 'REFERRAL',
                'source_node': graph.nodes[parent],
                'target_node': graph.nodes[child],
                'properties': {}
            })()
            graph.edges[f"referral_{parent}_{child}"] = edge
    
    # 第3层：每个第2层用户有2个下级
    level3_users = []
    for i, parent in enumerate(level2_users[:10]):  # 只为前10个用户创建下级
        for j in range(2):
            child = f"pyramid_l3_{i}_{j}"
            level3_users.append(child)
            graph.nodes[child] = type('Node', (), {
                'node_id': child,
                'type': 'USER'
            })()
            # 添加推荐关系边
            edge = type('Edge', (), {
                'edge_type': 'REFERRAL',
                'source_node': graph.nodes[parent],
                'target_node': graph.nodes[child],
                'properties': {}
            })()
            graph.edges[f"referral_{parent}_{child}"] = edge
    
    # 添加一些正常的推荐关系
    for i in range(5):
        parent = random.choice(normal_users)
        child = random.choice([u for u in normal_users if u != parent])
        if f"referral_{parent}_{child}" not in graph.edges:
            edge = type('Edge', (), {
                'edge_type': 'REFERRAL',
                'source_node': graph.nodes[parent],
                'target_node': graph.nodes[child],
                'properties': {}
            })()
            graph.edges[f"referral_{parent}_{child}"] = edge
    
    # 执行传销结构检测
    detector = PyramidSchemeDetector(graph)
    pyramid_schemes = detector.detect_pyramid_schemes(min_levels=3, min_branching_factor=2)
    
    print(f"检测到 {len(pyramid_schemes)} 个传销结构:")
    for scheme in pyramid_schemes:
        print(f"  根节点: {scheme['root']}")
        print(f"  节点数: {scheme['node_count']}")
        print(f"  深度: {scheme['depth']}")
        print(f"  分支模式: {scheme['branching_pattern']}")
        print(f"  传销嫌疑度: {scheme['pyramid_score']:.2f}")
        print()

# 运行示例
# example_pyramid_scheme_detection()
```

### 3.2 异常资金流动检测

#### 3.2.1 资金回流分析

**循环资金检测**：
```python
# 循环资金流动检测
class CircularFundFlowDetector:
    """循环资金流动检测器"""
    
    def __init__(self, transaction_graph):
        self.graph = transaction_graph
        self.cycles = []
    
    def detect_circular_flows(self, min_cycle_length=3, max_cycle_length=10):
        """
        检测循环资金流动
        
        Args:
            min_cycle_length: 最小循环长度
            max_cycle_length: 最大循环长度
            
        Returns:
            循环资金流列表
        """
        # 使用DFS查找所有循环
        cycles = []
        visited = set()
        rec_stack = []  # 递归栈，用于检测循环
        
        # 获取所有用户节点
        user_nodes = [
            node_id for node_id, node in self.graph.nodes.items()
            if node.type == 'USER'
        ]
        
        for node in user_nodes:
            if node not in visited:
                cycle_path = []
                self._dfs_detect_cycles(
                    node, visited, rec_stack, cycle_path,
                    cycles, min_cycle_length, max_cycle_length
                )
        
        # 分析循环特征
        circular_flows = []
        for cycle in cycles:
            flow_analysis = self._analyze_circular_flow(cycle)
            if flow_analysis:
                circular_flows.append(flow_analysis)
        
        self.cycles = circular_flows
        return circular_flows
    
    def _dfs_detect_cycles(self, node, visited, rec_stack, path, 
                          cycles, min_length, max_length):
        """DFS检测循环"""
        visited.add(node)
        rec_stack.append(node)
        path.append(node)
        
        # 查找当前节点的邻居（通过交易连接的用户）
        neighbors = self._get_transaction_neighbors(node)
        
        for neighbor in neighbors:
            if neighbor not in visited:
                self._dfs_detect_cycles(
                    neighbor, visited, rec_stack, path,
                    cycles, min_length, max_length
                )
            elif neighbor in rec_stack:
                # 发现循环
                cycle_start = rec_stack.index(neighbor)
                cycle = rec_stack[cycle_start:]
                if min_length <= len(cycle) <= max_length:
                    cycles.append(cycle[:])  # 复制循环
        
        rec_stack.pop()
        path.pop()
    
    def _get_transaction_neighbors(self, user_id):
        """获取通过交易连接的邻居用户"""
        neighbors = set()
        
        # 查找与用户相关的交易
        related_transactions = []
        for edge in self.graph.edges.values():
            if (edge.edge_type == 'USER_TRANSACTION' and 
                edge.source_node.node_id == f"user:{user_id}"):
                related_transactions.append(edge.target_node.node_id)
        
        # 查找这些交易的其他参与者
        for tx_id in related_transactions:
            for edge in self.graph.edges.values():
                if (edge.edge_type == 'USER_TRANSACTION' and 
                    edge.target_node.node_id == tx_id and
                    edge.source_node.node_id != f"user:{user_id}"):
                    # 提取用户ID
                    neighbor_user_id = edge.source_node.node_id.replace('user:', '')
                    neighbors.add(neighbor_user_id)
        
        return list(neighbors)
    
    def _analyze_circular_flow(self, cycle):
        """分析循环资金流特征"""
        if len(cycle) < 3:
            return None
        
        # 获取循环中的交易信息
        cycle_transactions = self._get_cycle_transactions(cycle)
        
        if not cycle_transactions:
            return None
        
        # 计算循环特征
        total_amount = sum(tx.get('amount', 0) for tx in cycle_transactions)
        avg_amount = total_amount / len(cycle_transactions) if cycle_transactions else 0
        
        # 检查金额相似性
        amount_variance = sum(
            abs(tx.get('amount', 0) - avg_amount) 
            for tx in cycle_transactions
        ) / len(cycle_transactions) if cycle_transactions else 0
        
        amount_similarity = 1.0 - (amount_variance / avg_amount) if avg_amount > 0 else 0
        amount_similarity = max(0, amount_similarity)  # 确保非负
        
        # 检查时间间隔
        timestamps = [tx.get('timestamp', 0) for tx in cycle_transactions]
        timestamps.sort()
        
        time_intervals = [
            timestamps[i+1] - timestamps[i] 
            for i in range(len(timestamps) - 1)
        ]
        
        avg_interval = sum(time_intervals) / len(time_intervals) if time_intervals else 0
        
        # 循环资金流嫌疑度计算
        suspicion_score = 0.0
        
        # 金额相似性贡献（0-0.4）
        suspicion_score += max(0, min(amount_similarity * 0.4, 0.4))
        
        # 时间间隔贡献（0-0.3）
        # 循环在短时间内完成更可疑
        if avg_interval > 0:
            time_score = min(3600 / avg_interval, 1.0) * 0.3  # 1小时内完成得满分
            suspicion_score += max(0, time_score)
        
        # 循环长度贡献（0-0.3）
        length_score = min(len(cycle) / 10.0, 1.0) * 0.3
        suspicion_score += length_score
        
        return {
            'cycle': cycle,
            'length': len(cycle),
            'total_amount': total_amount,
            'avg_amount': avg_amount,
            'amount_similarity': amount_similarity,
            'avg_time_interval': avg_interval,
            'transactions': cycle_transactions,
            'suspicion_score': min(suspicion_score, 1.0)
        }
    
    def _get_cycle_transactions(self, cycle):
        """获取循环中的交易信息"""
        transactions = []
        
        # 获取循环中相邻用户之间的交易
        for i in range(len(cycle)):
            source_user = cycle[i]
            target_user = cycle[(i + 1) % len(cycle)]
            
            # 查找从source到target的交易
            tx = self._find_transaction_between(source_user, target_user)
            if tx:
                transactions.append(tx)
        
        return transactions
    
    def _find_transaction_between(self, source_user, target_user):
        """查找两个用户之间的交易"""
        for edge in self.graph.edges.values():
            if (edge.edge_type == 'USER_TRANSACTION' and
                edge.source_node.node_id == f"user:{source_user}"):
                
                # 查找该交易的接收者
                tx_id = edge.target_node.node_id
                for edge2 in self.graph.edges.values():
                    if (edge2.edge_type == 'USER_TRANSACTION' and
                        edge2.target_node.node_id == tx_id and
                        edge2.source_node.node_id == f"user:{target_user}"):
                        
                        return {
                            'transaction_id': tx_id,
                            'from_user': source_user,
                            'to_user': target_user,
                            'amount': edge.properties.get('amount', 0),
                            'timestamp': edge.properties.get('timestamp', 0)
                        }
        
        return None

# 使用示例
def example_circular_fund_flow_detection():
    """循环资金流检测示例"""
    # 创建交易图
    class TransactionGraph:
        def __init__(self):
            self.nodes = {}
            self.edges = {}
    
    graph = TransactionGraph()
    
    # 创建用户节点
    users = ['user_A', 'user_B', 'user_C', 'user_D', 'user_E']
    for user in users:
        graph.nodes[f"user:{user}"] = type('Node', (), {
            'node_id': f"user:{user}",
            'type': 'USER'
        })()
    
    # 创建交易节点
    transactions = [f"tx_{i:02d}" for i in range(10)]
    for tx in transactions:
        graph.nodes[tx] = type('Node', (), {
            'node_id': tx,
            'type': 'TRANSACTION'
        })()
    
    import random
    base_time = time.time() - 86400
    
    # 创建正常交易
    for i in range(5):
        sender = random.choice(users)
        receiver = random.choice([u for u in users if u != sender])
        tx_id = f"tx_{i:02d}"
        amount = random.uniform(100, 1000)
        
        # 发送边
        send_edge = type('Edge', (), {
            'edge_type': 'USER_TRANSACTION',
            'source_node': graph.nodes[f"user:{sender}"],
            'target_node': graph.nodes[tx_id],
            'properties': {
                'amount': amount,
                'timestamp': base_time + i * 7200
            }
        })()
        graph.edges[f"send_{sender}_{tx_id}"] = send_edge
        
        # 接收边
        receive_edge = type('Edge', (), {
            'edge_type': 'USER_TRANSACTION',
            'source_node': graph.nodes[f"user:{receiver}"],
            'target_node': graph.nodes[tx_id],
            'properties': {
                'amount': amount,
                'timestamp': base_time + i * 7200
            }
        })()
        graph.edges[f"receive_{receiver}_{tx_id}"] = receive_edge
    
    # 创建循环资金流（传销典型模式）
    pyramid_users = ['pyramid_root', 'member_1', 'member_2', 'member_3']
    for user in pyramid_users:
        graph.nodes[f"user:{user}"] = type('Node', (), {
            'node_id': f"user:{user}",
            'type': 'USER'
        })()
    
    # 创建循环交易：root -> member_1 -> member_2 -> member_3 -> root
    cycle_amount = 500.0
    for i in range(len(pyramid_users)):
        sender = pyramid_users[i]
        receiver = pyramid_users[(i + 1) % len(pyramid_users)]
        tx_id = f"pyramid_tx_{i:02d}"
        
        graph.nodes[tx_id] = type('Node', (), {
            'node_id': tx_id,
            'type': 'TRANSACTION'
        })()
        
        # 发送边
        send_edge = type('Edge', (), {
            'edge_type': 'USER_TRANSACTION',
            'source_node': graph.nodes[f"user:{sender}"],
            'target_node': graph.nodes[tx_id],
            'properties': {
                'amount': cycle_amount + random.uniform(-10, 10),  # 金额相似
                'timestamp': base_time + 50000 + i * 300  # 短时间内完成
            }
        })()
        graph.edges[f"pyramid_send_{sender}_{tx_id}"] = send_edge
        
        # 接收边
        receive_edge = type('Edge', (), {
            'edge_type': 'USER_TRANSACTION',
            'source_node': graph.nodes[f"user:{receiver}"],
            'target_node': graph.nodes[tx_id],
            'properties': {
                'amount': cycle_amount + random.uniform(-10, 10),
                'timestamp': base_time + 50000 + i * 300
            }
        })()
        graph.edges[f"pyramid_receive_{receiver}_{tx_id}"] = receive_edge
    
    # 执行循环资金流检测
    detector = CircularFundFlowDetector(graph)
    circular_flows = detector.detect_circular_flows(min_cycle_length=3, max_cycle_length=8)
    
    print(f"检测到 {len(circular_flows)} 个循环资金流:")
    for flow in circular_flows:
        print(f"  循环用户: {' -> '.join(flow['cycle'])}")
        print(f"  循环长度: {flow['length']}")
        print(f"  总金额: {flow['total_amount']:.2f}")
        print(f"  平均金额: {flow['avg_amount']:.2f}")
        print(f"  金额相似度: {flow['amount_similarity']:.2f}")
        print(f"  平均时间间隔: {flow['avg_time_interval']:.0f}秒")
        print(f"  嫌疑度: {flow['suspicion_score']:.2f}")
        print()

# 运行示例
# example_circular_fund_flow_detection()
```

## 四、图计算在风控中的实际应用

### 4.1 实时风险评估

#### 4.1.1 动态图计算

**实时风险传播分析**：
```python
# 实时风险传播分析
class RealTimeRiskPropagation:
    """实时风险传播分析"""
    
    def __init__(self, graph_database):
        self.graph_db = graph_database
        self.risk_scores = {}
        self.propagation_cache = {}
    
    def update_risk_score(self, node_id, new_risk_score, propagation_depth=3):
        """
        更新节点风险评分并传播
        
        Args:
            node_id: 节点ID
            new_risk_score: 新风险评分
            propagation_depth: 传播深度
        """
        old_score = self.risk_scores.get(node_id, 0.0)
        self.risk_scores[node_id] = new_risk_score
        
        # 计算风险变化
        risk_change = abs(new_risk_score - old_score)
        
        # 如果风险变化显著，触发传播
        if risk_change > 0.1:
            self._propagate_risk(node_id, new_risk_score, propagation_depth)
    
    def _propagate_risk(self, source_node, risk_score, depth):
        """传播风险评分"""
        if depth <= 0:
            return
        
        # 获取邻居节点
        neighbors = self._get_neighbors(source_node)
        
        # 计算传播系数
        propagation_factor = 0.5  # 风险传播衰减因子
        
        for neighbor in neighbors:
            # 计算连接强度
            connection_strength = self._calculate_connection_strength(source_node, neighbor)
            
            # 计算传播的风险评分
            propagated_risk = risk_score * connection_strength * (propagation_factor ** (4 - depth))
            
            # 更新邻居的风险评分
            current_score = self.risk_scores.get(neighbor, 0.0)
            updated_score = max(current_score, propagated_risk)
            
            # 如果评分有显著变化，继续传播
            if abs(updated_score - current_score) > 0.05:
                self.risk_scores[neighbor] = updated_score
                self._propagate_risk(neighbor, updated_score, depth - 1)
    
    def _get_neighbors(self, node_id):
        """获取邻居节点"""
        # 从图数据库获取邻居
        neighbors = set()
        
        # 查找出边
        out_edges = self.graph_db.query_edges(node_id, direction='out')
        for edge in out_edges:
            neighbors.add(edge.target.id)
        
        # 查找入边
        in_edges = self.graph_db.query_edges(node_id, direction='in')
        for edge in in_edges:
            neighbors.add(edge.source.id)
        
        return list(neighbors)
    
    def _calculate_connection_strength(self, node1, node2):
        """计算节点间连接强度"""
        # 基于边的类型和权重计算连接强度
        edges = self.graph_db.query_edges_between(node1, node2)
        
        if not edges:
            return 0.0
        
        # 计算平均权重
        total_weight = sum(edge.properties.get('weight', 1.0) for edge in edges)
        avg_weight = total_weight / len(edges)
        
        # 根据边类型调整强度
        strength_multiplier = 1.0
        edge_types = [edge.type for edge in edges]
        
        if 'SHARE_DEVICE' in edge_types:
            strength_multiplier = 1.5
        elif 'SHARE_IP' in edge_types:
            strength_multiplier = 1.3
        elif 'FRIEND' in edge_types:
            strength_multiplier = 1.2
        
        return min(avg_weight * strength_multiplier, 1.0)
    
    def get_high_risk_nodes(self, threshold=0.7):
        """
        获取高风险节点
        
        Args:
            threshold: 风险阈值
            
        Returns:
            高风险节点列表
        """
        high_risk_nodes = []
        
        for node_id, risk_score in self.risk_scores.items():
            if risk_score >= threshold:
                high_risk_nodes.append({
                    'node_id': node_id,
                    'risk_score': risk_score
                })
        
        # 按风险评分排序
        high_risk_nodes.sort(key=lambda x: x['risk_score'], reverse=True)
        return high_risk_nodes
    
    def get_risk_distribution(self):
        """获取风险分布统计"""
        if not self.risk_scores:
            return {}
        
        # 统计各风险区间的节点数
        distribution = {
            'very_high': 0,    # > 0.9
            'high': 0,         # 0.7 - 0.9
            'medium': 0,       # 0.4 - 0.7
            'low': 0,          # 0.1 - 0.4
            'very_low': 0      # < 0.1
        }
        
        for score in self.risk_scores.values():
            if score > 0.9:
                distribution['very_high'] += 1
            elif score > 0.7:
                distribution['high'] += 1
            elif score > 0.4:
                distribution['medium'] += 1
            elif score > 0.1:
                distribution['low'] += 1
            else:
                distribution['very_low'] += 1
        
        return distribution

# 图数据库模拟
class MockGraphDatabase:
    """模拟图数据库"""
    
    def __init__(self):
        self.nodes = {}
        self.edges = {}
    
    def query_edges(self, node_id, direction='both'):
        """查询边"""
        result_edges = []
        
        for edge in self.edges.values():
            if direction == 'out' and edge.source.id == node_id:
                result_edges.append(edge)
            elif direction == 'in' and edge.target.id == node_id:
                result_edges.append(edge)
            elif direction == 'both' and (edge.source.id == node_id or edge.target.id == node_id):
                result_edges.append(edge)
        
        return result_edges
    
    def query_edges_between(self, node1, node2):
        """查询两个节点之间的边"""
        result_edges = []
        
        for edge in self.edges.values():
            if ((edge.source.id == node1 and edge.target.id == node2) or
                (edge.source.id == node2 and edge.target.id == node1)):
                result_edges.append(edge)
        
        return result_edges

# 使用示例
def example_real_time_risk_propagation():
    """实时风险传播示例"""
    # 创建图数据库和风险传播分析器
    graph_db = MockGraphDatabase()
    risk_analyzer = RealTimeRiskPropagation(graph_db)
    
    # 创建节点和边
    users = [f"user_{i:02d}" for i in range(10)]
    for user in users:
        graph_db.nodes[user] = type('Node', (), {'id': user})()
    
    import random
    
    # 创建连接关系
    connections = [
        ('user_00', 'user_01', 'FRIEND', 0.8),
        ('user_01', 'user_02', 'SHARE_DEVICE', 0.9),
        ('user_02', 'user_03', 'SHARE_IP', 0.7),
        ('user_03', 'user_04', 'FRIEND', 0.6),
        ('user_00', 'user_05', 'SHARE_DEVICE', 0.85),
        ('user_05', 'user_06', 'FRIEND', 0.7),
        ('user_06', 'user_07', 'SHARE_IP', 0.75),
        ('user_07', 'user_08', 'FRIEND', 0.65),
        ('user_08', 'user_09', 'SHARE_DEVICE', 0.8),
    ]
    
    for i, (source, target, edge_type, weight) in enumerate(connections):
        edge = type('Edge', (), {
            'source': graph_db.nodes[source],
            'target': graph_db.nodes[target],
            'type': edge_type,
            'properties': {'weight': weight}
        })()
        graph_db.edges[f"edge_{i:02d}"] = edge
    
    # 初始风险评分
    initial_scores = {
        'user_00': 0.2,
        'user_01': 0.1,
        'user_02': 0.15,
        'user_03': 0.1,
        'user_04': 0.05,
        'user_05': 0.1,
        'user_06': 0.05,
        'user_07': 0.1,
        'user_08': 0.05,
        'user_09': 0.1,
    }
    
    for user, score in initial_scores.items():
        risk_analyzer.risk_scores[user] = score
    
    print("初始风险分布:")
    distribution = risk_analyzer.get_risk_distribution()
    for level, count in distribution.items():
        print(f"  {level}: {count} 个节点")
    
    # 模拟风险事件：user_00 被标记为高风险
    print("\n模拟风险事件：user_00 被标记为高风险 (0.95)")
    risk_analyzer.update_risk_score('user_00', 0.95, propagation_depth=3)
    
    print("\n传播后的风险分布:")
    distribution = risk_analyzer.get_risk_distribution()
    for level, count in distribution.items():
        print(f"  {level}: {count} 个节点")
    
    print("\n高风险节点:")
    high_risk_nodes = risk_analyzer.get_high_risk_nodes(threshold=0.5)
    for node in high_risk_nodes:
        print(f"  {node['node_id']}: {node['risk_score']:.3f}")

# 运行示例
# example_real_time_risk_propagation()
```

### 4.2 批量风险筛查

#### 4.2.1 图算法批处理

**大规模图计算**：
```python
# 大规模图计算批处理
class BatchGraphProcessor:
    """批量图处理器"""
    
    def __init__(self, graph_database, batch_size=1000):
        self.graph_db = graph_database
        self.batch_size = batch_size
        self.processing_stats = {
            'processed_nodes': 0,
            'detected_risks': 0,
            'processing_time': 0
        }
    
    def process_large_graph(self, algorithms=['community_detection', 'centrality', 'anomaly']):
        """
        处理大规模图
        
        Args:
            algorithms: 要执行的算法列表
            
        Returns:
            处理结果
        """
        import time
        start_time = time.time()
        
        results = {}
        
        # 获取所有节点
        all_nodes = list(self.graph_db.get_all_nodes())
        
        print(f"开始处理 {len(all_nodes)} 个节点...")
        
        # 分批处理
        for i in range(0, len(all_nodes), self.batch_size):
            batch = all_nodes[i:i + self.batch_size]
            batch_id = i // self.batch_size + 1
            total_batches = (len(all_nodes) + self.batch_size - 1) // self.batch_size
            
            print(f"处理批次 {batch_id}/{total_batches} ({len(batch)} 个节点)")
            
            batch_results = self._process_batch(batch, algorithms)
            
            # 合并结果
            for algo, result in batch_results.items():
                if algo not in results:
                    results[algo] = []
                results[algo].extend(result)
            
            self.processing_stats['processed_nodes'] += len(batch)
        
        # 合并全局分析结果
        final_results = self._merge_batch_results(results, algorithms)
        
        self.processing_stats['processing_time'] = time.time() - start_time
        
        return {
            'results': final_results,
            'stats': self.processing_stats
        }
    
    def _process_batch(self, batch, algorithms):
        """处理单个批次"""
        batch_results = {}
        
        # 为批次创建子图
        subgraph = self._create_subgraph(batch)
        
        # 执行各种算法
        if 'community_detection' in algorithms:
            batch_results['communities'] = self._detect_communities_batch(subgraph)
        
        if 'centrality' in algorithms:
            batch_results['centrality'] = self._calculate_centrality_batch(subgraph)
        
        if 'anomaly' in algorithms:
            batch_results['anomalies'] = self._detect_anomalies_batch(subgraph)
        
        return batch_results
    
    def _create_subgraph(self, node_batch):
        """为节点批次创建子图"""
        # 获取节点及其直接邻居
        subgraph_nodes = set(node_batch)
        
        # 扩展到1跳邻居
        for node_id in node_batch:
            neighbors = self.graph_db.get_neighbors(node_id, depth=1)
            subgraph_nodes.update(neighbors)
        
        # 创建子图
        subgraph = {
            'nodes': list(subgraph_nodes),
            'edges': self.graph_db.get_edges_between_nodes(subgraph_nodes)
        }
        
        return subgraph
    
    def _detect_communities_batch(self, subgraph):
        """批次社区发现"""
        # 简化实现，实际应使用更复杂的社区发现算法
        communities = []
        
        # 基于节点连接密度进行简单聚类
        node_connections = defaultdict(int)
        for edge in subgraph['edges']:
            node_connections[edge['source']] += 1
            node_connections[edge['target']] += 1
        
        # 简单的密度聚类
        high_density_nodes = [
            node for node, connections in node_connections.items()
            if connections > 3
        ]
        
        if high_density_nodes:
            communities.append({
                'type': 'high_density_cluster',
                'nodes': high_density_nodes,
                'size': len(high_density_nodes)
            })
        
        return communities
    
    def _calculate_centrality_batch(self, subgraph):
        """批次中心性计算"""
        centrality_scores = {}
        
        # 计算度中心性
        node_degrees = defaultdict(int)
        for edge in subgraph['edges']:
            node_degrees[edge['source']] += 1
            node_degrees[edge['target']] += 1
        
        # 归一化
        max_degree = max(node_degrees.values()) if node_degrees else 1
        for node, degree in node_degrees.items():
            centrality_scores[node] = degree / max_degree
        
        return centrality_scores
    
    def _detect_anomalies_batch(self, subgraph):
        """批次异常检测"""
        anomalies = []
        
        # 基于节点行为模式检测异常
        node_behaviors = defaultdict(list)
        
        # 收集节点行为数据
        for node in subgraph['nodes']:
            behavior = self.graph_db.get_node_behavior(node)
            node_behaviors[node] = behavior
        
        # 检测异常模式
        for node, behavior in node_behaviors.items():
            if self._is_anomalous_behavior(behavior):
                anomalies.append({
                    'node_id': node,
                    'anomaly_type': 'behavioral',
                    'confidence': self._calculate_anomaly_confidence(behavior)
                })
        
        return anomalies
    
    def _is_anomalous_behavior(self, behavior):
        """判断是否为异常行为"""
        # 简化的异常检测逻辑
        if not behavior:
            return False
        
        # 检查是否有异常高的连接数
        connection_count = behavior.get('connections', 0)
        if connection_count > 50:
            return True
        
        # 检查是否有异常的资金流动
        transaction_count = behavior.get('transactions', 0)
        if transaction_count > 100:
            return True
        
        return False
    
    def _calculate_anomaly_confidence(self, behavior):
        """计算异常置信度"""
        confidence = 0.0
        
        connection_count = behavior.get('connections', 0)
        if connection_count > 50:
            confidence += min(connection_count / 100.0, 0.5)
        
        transaction_count = behavior.get('transactions', 0)
        if transaction_count > 100:
            confidence += min(transaction_count / 200.0, 0.5)
        
        return min(confidence, 1.0)
    
    def _merge_batch_results(self, batch_results, algorithms):
        """合并批次结果"""
        merged_results = {}
        
        # 合并社区发现结果
        if 'community_detection' in algorithms:
            all_communities = []
            for batch_result in batch_results.get('communities', []):
                all_communities.extend(batch_result)
            
            # 合并重叠的社区
            merged_communities = self._merge_communities(all_communities)
            merged_results['communities'] = merged_communities
        
        # 合并中心性结果
        if 'centrality' in algorithms:
            merged_centrality = {}
            for batch_result in batch_results.get('centrality', []):
                merged_centrality.update(batch_result)
            merged_results['centrality'] = merged_centrality
        
        # 合并异常检测结果
        if 'anomaly' in algorithms:
            all_anomalies = []
            for batch_result in batch_results.get('anomalies', []):
                all_anomalies.extend(batch_result)
            
            # 去重
            unique_anomalies = []
            seen_nodes = set()
            for anomaly in all_anomalies:
                if anomaly['node_id'] not in seen_nodes:
                    unique_anomalies.append(anomaly)
                    seen_nodes.add(anomaly['node_id'])
            
            merged_results['anomalies'] = unique_anomalies
        
        return merged_results
    
    def _merge_communities(self, communities):
        """合并社区"""
        # 简化的社区合并逻辑
        merged = []
        processed = set()
        
        for i, community1 in enumerate(communities):
            if i in processed:
                continue
            
            # 查找重叠的社区
            overlapping = [community1]
            community1_nodes = set(community1.get('nodes', []))
            
            for j, community2 in enumerate(communities[i+1:], i+1):
                if j in processed:
                    continue
                
                community2_nodes = set(community2.get('nodes', []))
                intersection = community1_nodes.intersection(community2_nodes)
                
                # 如果重叠度超过50%，认为是同一社区
                if intersection and len(intersection) / len(community1_nodes) > 0.5:
                    overlapping.append(community2)
                    processed.add(j)
            
            # 合并重叠的社区
            merged_nodes = set()
            for comm in overlapping:
                merged_nodes.update(comm.get('nodes', []))
            
            merged.append({
                'type': 'merged_community',
                'nodes': list(merged_nodes),
                'size': len(merged_nodes)
            })
            
            processed.add(i)
        
        return merged

# 模拟图数据库接口
class MockLargeGraphDatabase:
    """模拟大规模图数据库"""
    
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.node_behaviors = {}
    
    def get_all_nodes(self):
        """获取所有节点"""
        return list(self.nodes.keys())
    
    def get_neighbors(self, node_id, depth=1):
        """获取邻居节点"""
        neighbors = set()
        
        if depth >= 1:
            # 直接邻居
            for edge in self.edges.values():
                if edge['source'] == node_id:
                    neighbors.add(edge['target'])
                elif edge['target'] == node_id:
                    neighbors.add(edge['source'])
        
        return list(neighbors)
    
    def get_edges_between_nodes(self, node_set):
        """获取节点集之间的边"""
        edges = []
        node_set = set(node_set)
        
        for edge in self.edges.values():
            if edge['source'] in node_set and edge['target'] in node_set:
                edges.append(edge)
        
        return edges
    
    def get_node_behavior(self, node_id):
        """获取节点行为数据"""
        return self.node_behaviors.get(node_id, {})

# 使用示例
def example_batch_graph_processing():
    """批量图处理示例"""
    # 创建大规模图数据库
    graph_db = MockLargeGraphDatabase()
    
    # 创建大量节点和边（模拟大规模图）
    import random
    
    # 创建10000个用户节点
    print("创建模拟数据...")
    for i in range(10000):
        user_id = f"user_{i:05d}"
        graph_db.nodes[user_id] = {'id': user_id, 'type': 'USER'}
        
        # 为每个用户生成行为数据
        behavior = {
            'connections': random.randint(0, 100),
            'transactions': random.randint(0, 200),
            'risk_score': random.random()
        }
        graph_db.node_behaviors[user_id] = behavior
    
    # 创建边关系
    edge_count = 0
    for i in range(10000):
        user1 = f"user_{i:05d}"
        # 每个用户随机连接到其他用户
        connection_count = random.randint(0, 20)
        for _ in range(connection_count):
            j = random.randint(0, 9999)
            user2 = f"user_{j:05d}"
            if user1 != user2:
                edge_id = f"edge_{edge_count:06d}"
                graph_db.edges[edge_id] = {
                    'source': user1,
                    'target': user2,
                    'type': random.choice(['FRIEND', 'SHARE_DEVICE', 'SHARE_IP']),
                    'weight': random.random()
                }
                edge_count += 1
    
    print(f"创建了 {len(graph_db.nodes)} 个节点和 {len(graph_db.edges)} 条边")
    
    # 创建一些异常模式
    # 创建一个高连接数的节点（模拟中介）
    graph_db.node_behaviors['user_00001'] = {
        'connections': 200,  # 异常高的连接数
        'transactions': 500,
        'risk_score': 0.9
    }
    
    # 创建一个高频交易的节点（模拟资金骡）
    graph_db.node_behaviors['user_00002'] = {
        'connections': 50,
        'transactions': 500,  # 异常高的交易数
        'risk_score': 0.8
    }
    
    # 执行批量处理
    print("\n开始批量图处理...")
    processor = BatchGraphProcessor(graph_db, batch_size=1000)
    
    results = processor.process_large_graph(
        algorithms=['community_detection', 'centrality', 'anomaly']
    )
    
    print(f"\n处理完成:")
    print(f"  处理节点数: {results['stats']['processed_nodes']}")
    print(f"  处理时间: {results['stats']['processing_time']:.2f}秒")
    
    # 显示结果
    if 'communities' in results['results']:
        print(f"\n检测到 {len(results['results']['communities'])} 个社区:")
        for i, community in enumerate(results['results']['communities'][:3]):  # 显示前3个
            print(f"  社区 {i+1}: {community['size']} 个节点")
    
    if 'anomalies' in results['results']:
        print(f"\n检测到 {len(results['results']['anomalies'])} 个异常节点:")
        for anomaly in results['results']['anomalies'][:5]:  # 显示前5个
            print(f"  节点 {anomaly['node_id']}: "
                  f"置信度 {anomaly['confidence']:.2f}")

# 运行示例
# example_batch_graph_processing()
```

## 总结

图计算在风控领域的应用场景非常广泛，从欺诈团伙挖掘到中介识别，再到传销结构发现，都能发挥重要作用。通过合理设计图模型和选择适当的算法，可以有效提升风控系统的识别能力和防护效果。

关键要点包括：

1. **欺诈团伙挖掘**：通过分析用户行为模式和设备指纹特征，结合社团发现算法，能够有效识别协同作案的欺诈团伙。

2. **中介识别**：利用中心性分析和资金流模式识别，可以发现起到桥梁作用的中介节点，阻断欺诈资金的流转路径。

3. **传销结构发现**：通过分析层级结构和循环资金流动，能够识别典型的传销模式，防范相关金融风险。

4. **实时风险评估**：动态图计算和风险传播分析能够实现风险的实时评估和预警。

5. **大规模处理**：批处理和分布式计算技术使得图计算能够应用于大规模风控场景。

随着技术的不断发展，图计算在风控领域的应用将更加深入和广泛，为构建更加智能和高效的风控系统提供有力支撑。