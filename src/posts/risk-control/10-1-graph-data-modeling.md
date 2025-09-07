---
title: "图数据建模: 点、边、属性的设计"
date: 2025-09-07
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 图数据建模：点、边、属性的设计

## 引言

在企业级智能风控平台中，图计算与关系网络分析已成为识别复杂欺诈模式和挖掘隐藏风险关系的重要技术手段。通过将用户、设备、交易、账户等实体抽象为图中的节点，将它们之间的关系抽象为边，可以构建出反映真实业务关系的图结构。这种结构化表示能够揭示传统分析方法难以发现的复杂关联模式，如团伙欺诈、中介网络、传销结构等。

图数据建模是图计算的基础，合理的图模型设计直接影响着后续分析的效果和性能。一个优秀的图数据模型需要充分考虑业务场景特点、数据特征以及计算需求，在表达能力和计算效率之间找到平衡点。

本文将深入探讨图数据建模的核心要素，包括节点设计、边设计、属性建模以及实际应用案例，为构建高效的风控图计算系统提供指导。

## 一、图计算基础概念

### 1.1 图论基础

图计算基于图论理论，图是由节点（Vertex/Node）和边（Edge）组成的数学结构，用于表示对象之间的关系。

#### 1.1.1 基本定义

**图的定义**：
```python
# 图的基本定义
class Graph:
    """图的基本结构"""
    def __init__(self):
        self.vertices = {}  # 节点集合
        self.edges = {}     # 边集合
    
    def add_vertex(self, vertex_id, properties=None):
        """添加节点"""
        self.vertices[vertex_id] = properties or {}
    
    def add_edge(self, from_vertex, to_vertex, edge_type, properties=None):
        """添加边"""
        edge_key = (from_vertex, to_vertex, edge_type)
        self.edges[edge_key] = properties or {}

# 节点定义
class Vertex:
    """节点定义"""
    def __init__(self, vertex_id, vertex_type, properties=None):
        self.id = vertex_id           # 节点ID
        self.type = vertex_type       # 节点类型
        self.properties = properties or {}  # 节点属性
        self.in_edges = []           # 入边
        self.out_edges = []          # 出边

# 边定义
class Edge:
    """边定义"""
    def __init__(self, edge_id, source_vertex, target_vertex, edge_type, properties=None):
        self.id = edge_id                    # 边ID
        self.source = source_vertex          # 源节点
        self.target = target_vertex          # 目标节点
        self.type = edge_type                # 边类型
        self.properties = properties or {}   # 边属性
```

#### 1.1.2 图的分类

**按方向分类**：
- **有向图**：边具有方向性，表示单向关系
- **无向图**：边无方向性，表示双向关系

**按权重分类**：
- **有权图**：边具有权重属性，表示关系强度
- **无权图**：边无权重属性

**按连通性分类**：
- **连通图**：任意两个节点之间都存在路径
- **非连通图**：存在不连通的子图

### 1.2 风控图计算特点

#### 1.2.1 业务特性

**多类型节点**：
```python
# 风控图中的节点类型
NODE_TYPES = {
    'USER': '用户',           # 用户节点
    'DEVICE': '设备',         # 设备节点
    'ACCOUNT': '账户',        # 账户节点
    'IP': 'IP地址',          # IP节点
    'BANK_CARD': '银行卡',    # 银行卡节点
    'EMAIL': '邮箱',          # 邮箱节点
    'PHONE': '手机号',        # 手机号节点
    'COMPANY': '公司',        # 公司节点
    'TRANSACTION': '交易',    # 交易节点
    'ORDER': '订单'           # 订单节点
}

# 节点属性设计
USER_NODE_PROPERTIES = {
    'user_id': '用户ID',
    'register_time': '注册时间',
    'risk_level': '风险等级',
    'account_status': '账户状态',
    'real_name_verified': '实名认证',
    'total_transactions': '总交易数',
    'total_amount': '总交易金额',
    'fraud_history': '欺诈历史'
}

DEVICE_NODE_PROPERTIES = {
    'device_id': '设备ID',
    'device_type': '设备类型',
    'os_version': '操作系统版本',
    'app_version': '应用版本',
    'first_seen': '首次出现时间',
    'last_seen': '最后出现时间',
    'risk_score': '风险评分'
}
```

**多类型边**：
```python
# 风控图中的边类型
EDGE_TYPES = {
    'REGISTER': '注册',           # 用户注册设备
    'LOGIN': '登录',             # 用户登录设备
    'TRANSACTION': '交易',        # 用户发起交易
    'TRANSFER': '转账',          # 账户间转账
    'SHARE_IP': '共享IP',        # 共享相同IP
    'SHARE_DEVICE': '共享设备',   # 共享相同设备
    'SHARE_EMAIL': '共享邮箱',    # 共享相同邮箱
    'SHARE_PHONE': '共享手机',    # 共享相同手机号
    'COMPANY_ASSOCIATION': '公司关联',  # 公司关联关系
    'FRIEND': '好友',            # 好友关系
    'FAMILY': '家庭关系'          # 家庭关系
}

# 边属性设计
TRANSACTION_EDGE_PROPERTIES = {
    'transaction_id': '交易ID',
    'amount': '交易金额',
    'timestamp': '交易时间',
    'currency': '货币类型',
    'transaction_type': '交易类型',
    'risk_score': '风险评分',
    'status': '交易状态'
}

LOGIN_EDGE_PROPERTIES = {
    'login_id': '登录ID',
    'timestamp': '登录时间',
    'ip_address': '登录IP',
    'user_agent': '用户代理',
    'login_result': '登录结果',
    'risk_score': '风险评分'
}
```

## 二、节点设计

### 2.1 节点类型设计

在风控场景中，节点类型的设计需要充分考虑业务实体的多样性和关联性。

#### 2.1.1 核心节点类型

**用户节点**：
```python
# 用户节点设计
class UserNode:
    """用户节点"""
    
    def __init__(self, user_id, properties=None):
        self.node_id = f"user:{user_id}"
        self.node_type = "USER"
        self.properties = {
            'user_id': user_id,
            'create_time': properties.get('create_time', None),
            'update_time': properties.get('update_time', None),
            'status': properties.get('status', 'active'),
            'risk_level': properties.get('risk_level', 'normal'),
            'verified': properties.get('verified', False),
            'real_name': properties.get('real_name', ''),
            'id_card': properties.get('id_card', ''),
            'phone': properties.get('phone', ''),
            'email': properties.get('email', ''),
            'register_ip': properties.get('register_ip', ''),
            'register_device': properties.get('register_device', ''),
            'last_login_time': properties.get('last_login_time', None),
            'total_transactions': properties.get('total_transactions', 0),
            'total_amount': properties.get('total_amount', 0.0),
            'fraud_count': properties.get('fraud_count', 0),
            'tags': properties.get('tags', [])
        }
    
    def to_graph_format(self):
        """转换为图数据库格式"""
        return {
            'id': self.node_id,
            'type': self.node_type,
            'properties': self.properties
        }

# 用户节点工厂
class UserNodeFactory:
    """用户节点工厂"""
    
    @staticmethod
    def create_from_user_data(user_data):
        """从用户数据创建节点"""
        properties = {
            'create_time': user_data.get('created_at'),
            'update_time': user_data.get('updated_at'),
            'status': user_data.get('status', 'active'),
            'risk_level': user_data.get('risk_level', 'normal'),
            'verified': user_data.get('is_verified', False),
            'real_name': user_data.get('real_name', ''),
            'id_card': user_data.get('id_card', ''),
            'phone': user_data.get('phone', ''),
            'email': user_data.get('email', ''),
            'register_ip': user_data.get('register_ip', ''),
            'register_device': user_data.get('register_device_id', ''),
            'last_login_time': user_data.get('last_login_at'),
            'total_transactions': user_data.get('total_transactions', 0),
            'total_amount': user_data.get('total_transaction_amount', 0.0),
            'fraud_count': user_data.get('fraud_incidents', 0),
            'tags': user_data.get('user_tags', [])
        }
        
        return UserNode(user_data['user_id'], properties)
```

**设备节点**：
```python
# 设备节点设计
class DeviceNode:
    """设备节点"""
    
    def __init__(self, device_id, properties=None):
        self.node_id = f"device:{device_id}"
        self.node_type = "DEVICE"
        self.properties = {
            'device_id': device_id,
            'create_time': properties.get('create_time', None),
            'update_time': properties.get('update_time', None),
            'device_type': properties.get('device_type', ''),
            'os_type': properties.get('os_type', ''),
            'os_version': properties.get('os_version', ''),
            'app_version': properties.get('app_version', ''),
            'manufacturer': properties.get('manufacturer', ''),
            'model': properties.get('model', ''),
            'screen_size': properties.get('screen_size', ''),
            'first_seen': properties.get('first_seen', None),
            'last_seen': properties.get('last_seen', None),
            'risk_score': properties.get('risk_score', 0.0),
            'fraud_devices': properties.get('fraud_devices', 0),
            'associated_users': properties.get('associated_users', 0),
            'tags': properties.get('tags', [])
        }
    
    def update_risk_score(self, new_score):
        """更新风险评分"""
        self.properties['risk_score'] = new_score
        self.properties['update_time'] = time.time()
    
    def add_user_association(self):
        """增加用户关联"""
        self.properties['associated_users'] += 1

# 设备指纹节点
class DeviceFingerprintNode:
    """设备指纹节点"""
    
    def __init__(self, fingerprint, properties=None):
        self.node_id = f"fingerprint:{fingerprint}"
        self.node_type = "DEVICE_FINGERPRINT"
        self.properties = {
            'fingerprint': fingerprint,
            'create_time': properties.get('create_time', None),
            'update_time': properties.get('update_time', None),
            'confidence': properties.get('confidence', 1.0),
            'device_count': properties.get('device_count', 1),
            'user_count': properties.get('user_count', 1),
            'risk_score': properties.get('risk_score', 0.0),
            'tags': properties.get('tags', [])
        }
```

### 2.2 节点属性设计

#### 2.2.1 属性分类

**静态属性**：
```python
# 静态属性设计
STATIC_PROPERTIES = {
    'IDENTIFIER': {  # 标识属性
        'user_id': '用户唯一标识',
        'device_id': '设备唯一标识',
        'account_id': '账户唯一标识',
        'id_card': '身份证号',
        'phone': '手机号',
        'email': '邮箱地址'
    },
    'BASIC_INFO': {  # 基本信息
        'real_name': '真实姓名',
        'gender': '性别',
        'age': '年龄',
        'birthday': '生日',
        'address': '地址',
        'company': '公司',
        'occupation': '职业'
    },
    'DEVICE_SPEC': {  # 设备规格
        'device_type': '设备类型',
        'os_type': '操作系统类型',
        'os_version': '操作系统版本',
        'manufacturer': '制造商',
        'model': '型号',
        'screen_size': '屏幕尺寸'
    }
}
```

**动态属性**：
```python
# 动态属性设计
DYNAMIC_PROPERTIES = {
    'TIMESTAMP': {  # 时间戳属性
        'create_time': '创建时间',
        'update_time': '更新时间',
        'first_seen': '首次出现时间',
        'last_seen': '最后出现时间',
        'last_login': '最后登录时间',
        'last_transaction': '最后交易时间'
    },
    'BEHAVIORAL': {  # 行为属性
        'login_count': '登录次数',
        'transaction_count': '交易次数',
        'amount_sum': '交易总金额',
        'session_count': '会话次数',
        'page_views': '页面浏览量'
    },
    'RISK': {  # 风险属性
        'risk_score': '风险评分',
        'risk_level': '风险等级',
        'fraud_count': '欺诈次数',
        'suspicious_count': '可疑次数',
        'verification_status': '验证状态'
    }
}
```

#### 2.2.2 属性优化

**属性索引设计**：
```python
# 属性索引设计
class PropertyIndexManager:
    """属性索引管理器"""
    
    def __init__(self):
        self.indexes = {}
        self.indexed_properties = {
            'USER': ['user_id', 'phone', 'email', 'id_card', 'risk_level'],
            'DEVICE': ['device_id', 'device_type', 'os_type', 'risk_score'],
            'ACCOUNT': ['account_id', 'account_type', 'status', 'risk_level'],
            'IP': ['ip_address', 'risk_score', 'country', 'city'],
            'TRANSACTION': ['transaction_id', 'status', 'amount', 'timestamp']
        }
    
    def create_index(self, node_type, property_name):
        """创建属性索引"""
        index_key = f"{node_type}:{property_name}"
        if index_key not in self.indexes:
            self.indexes[index_key] = {}
        return index_key
    
    def add_to_index(self, node_type, property_name, property_value, node_id):
        """添加到索引"""
        index_key = self.create_index(node_type, property_name)
        if property_value not in self.indexes[index_key]:
            self.indexes[index_key][property_value] = []
        self.indexes[index_key][property_value].append(node_id)
    
    def query_by_property(self, node_type, property_name, property_value):
        """根据属性查询节点"""
        index_key = f"{node_type}:{property_name}"
        if index_key in self.indexes and property_value in self.indexes[index_key]:
            return self.indexes[index_key][property_value]
        return []

# 使用示例
def example_property_indexing():
    """属性索引示例"""
    index_manager = PropertyIndexManager()
    
    # 创建用户节点
    user_node = UserNode("user_12345", {
        'phone': '13800138000',
        'email': 'user@example.com',
        'risk_level': 'high'
    })
    
    # 添加到索引
    index_manager.add_to_index('USER', 'user_id', 'user_12345', user_node.node_id)
    index_manager.add_to_index('USER', 'phone', '13800138000', user_node.node_id)
    index_manager.add_to_index('USER', 'email', 'user@example.com', user_node.node_id)
    index_manager.add_to_index('USER', 'risk_level', 'high', user_node.node_id)
    
    # 查询示例
    user_ids = index_manager.query_by_property('USER', 'phone', '13800138000')
    print(f"通过手机号查询到的用户: {user_ids}")
```

## 三、边设计

### 3.1 边类型设计

边的设计需要准确反映实体间的关系类型和业务含义。

#### 3.1.1 关系类型分类

**直接关系**：
```python
# 直接关系边设计
DIRECT_RELATIONSHIPS = {
    'OWNERSHIP': {  # 拥有关系
        'USER_DEVICE': ('USER', 'DEVICE', '使用设备'),
        'USER_ACCOUNT': ('USER', 'ACCOUNT', '拥有账户'),
        'USER_PHONE': ('USER', 'PHONE', '拥有手机号'),
        'USER_EMAIL': ('USER', 'EMAIL', '拥有邮箱')
    },
    'ACTION': {  # 行为关系
        'USER_LOGIN': ('USER', 'DEVICE', '用户登录'),
        'USER_TRANSACTION': ('USER', 'TRANSACTION', '发起交易'),
        'ACCOUNT_TRANSFER': ('ACCOUNT', 'ACCOUNT', '账户转账'),
        'USER_ORDER': ('USER', 'ORDER', '创建订单')
    },
    'ASSOCIATION': {  # 关联关系
        'DEVICE_IP': ('DEVICE', 'IP', '设备使用IP'),
        'USER_COMPANY': ('USER', 'COMPANY', '就职于'),
        'USER_FRIEND': ('USER', 'USER', '好友关系'),
        'USER_FAMILY': ('USER', 'USER', '家庭关系')
    }
}
```

**间接关系**：
```python
# 间接关系边设计
INDIRECT_RELATIONSHIPS = {
    'SHARED_RESOURCE': {  # 共享资源关系
        'SHARE_IP': ('USER', 'USER', '共享IP地址'),
        'SHARE_DEVICE': ('USER', 'USER', '共享设备'),
        'SHARE_EMAIL': ('USER', 'USER', '共享邮箱'),
        'SHARE_PHONE': ('USER', 'USER', '共享手机号')
    },
    'DERIVED_RELATION': {  # 推导关系
        'SIMILAR_BEHAVIOR': ('USER', 'USER', '行为相似'),
        'SAME_LOCATION': ('USER', 'USER', '相同位置'),
        'FREQUENT_CONTACT': ('USER', 'USER', '频繁联系'),
        'TRANSACTION_CHAIN': ('TRANSACTION', 'TRANSACTION', '交易链')
    }
}
```

#### 3.1.2 边属性设计

**时间属性**：
```python
# 边时间属性
EDGE_TIME_PROPERTIES = {
    'TIMESTAMP': '时间戳',
    'START_TIME': '开始时间',
    'END_TIME': '结束时间',
    'DURATION': '持续时间',
    'FREQUENCY': '频率',
    'RECENCY': '最近性'
}

# 边权重属性
EDGE_WEIGHT_PROPERTIES = {
    'STRENGTH': '关系强度',
    'CONFIDENCE': '置信度',
    'WEIGHT': '权重',
    'SCORE': '评分'
}

# 边业务属性
EDGE_BUSINESS_PROPERTIES = {
    'AMOUNT': '金额',
    'COUNT': '次数',
    'STATUS': '状态',
    'TYPE': '类型',
    'CHANNEL': '渠道'
}
```

### 3.2 边的实现

#### 3.2.1 边类设计

```python
# 边类实现
class GraphEdge:
    """图边类"""
    
    def __init__(self, source_node, target_node, edge_type, properties=None):
        self.edge_id = f"{source_node.node_id}:{edge_type}:{target_node.node_id}"
        self.source_node = source_node
        self.target_node = target_node
        self.edge_type = edge_type
        self.properties = properties or {}
        self.create_time = time.time()
        self.update_time = time.time()
    
    def add_property(self, key, value):
        """添加属性"""
        self.properties[key] = value
        self.update_time = time.time()
    
    def get_property(self, key, default=None):
        """获取属性"""
        return self.properties.get(key, default)
    
    def calculate_weight(self):
        """计算边权重"""
        # 根据边类型和属性计算权重
        base_weight = 1.0
        
        if self.edge_type == 'SHARE_IP':
            # 共享IP的权重基于共享次数
            shared_count = self.properties.get('shared_count', 1)
            base_weight = min(shared_count / 10.0, 1.0)
        elif self.edge_type == 'TRANSACTION':
            # 交易边的权重基于金额
            amount = self.properties.get('amount', 0)
            base_weight = min(amount / 1000.0, 1.0)
        elif self.edge_type == 'FRIEND':
            # 好友关系权重
            interaction_count = self.properties.get('interaction_count', 1)
            base_weight = min(interaction_count / 100.0, 1.0)
        
        return base_weight
    
    def to_graph_format(self):
        """转换为图数据库格式"""
        return {
            'id': self.edge_id,
            'source': self.source_node.node_id,
            'target': self.target_node.node_id,
            'type': self.edge_type,
            'properties': self.properties,
            'weight': self.calculate_weight(),
            'create_time': self.create_time,
            'update_time': self.update_time
        }

# 边工厂类
class EdgeFactory:
    """边工厂类"""
    
    @staticmethod
    def create_user_device_edge(user_node, device_node, login_data=None):
        """创建用户-设备边"""
        properties = {
            'first_login': login_data.get('timestamp') if login_data else time.time(),
            'last_login': login_data.get('timestamp') if login_data else time.time(),
            'login_count': 1,
            'success_count': 1 if login_data and login_data.get('success', True) else 0,
            'failed_count': 0 if login_data and login_data.get('success', True) else 1,
            'ip_addresses': [login_data.get('ip_address')] if login_data else [],
            'user_agents': [login_data.get('user_agent')] if login_data else []
        }
        
        edge = GraphEdge(user_node, device_node, 'USER_DEVICE', properties)
        return edge
    
    @staticmethod
    def create_shared_resource_edge(user1_node, user2_node, resource_type, shared_data):
        """创建共享资源边"""
        edge_type = f'SHARE_{resource_type.upper()}'
        properties = {
            'shared_resource': shared_data.get('resource'),
            'first_shared': shared_data.get('first_time'),
            'last_shared': shared_data.get('last_time'),
            'shared_count': shared_data.get('count', 1),
            'confidence': shared_data.get('confidence', 0.8)
        }
        
        edge = GraphEdge(user1_node, user2_node, edge_type, properties)
        return edge
    
    @staticmethod
    def create_transaction_edge(user_node, transaction_node, transaction_data):
        """创建交易边"""
        properties = {
            'transaction_id': transaction_data.get('transaction_id'),
            'amount': transaction_data.get('amount', 0.0),
            'timestamp': transaction_data.get('timestamp'),
            'currency': transaction_data.get('currency', 'CNY'),
            'transaction_type': transaction_data.get('type', 'unknown'),
            'status': transaction_data.get('status', 'completed'),
            'risk_score': transaction_data.get('risk_score', 0.0)
        }
        
        edge = GraphEdge(user_node, transaction_node, 'USER_TRANSACTION', properties)
        return edge
```

## 四、图模型设计实践

### 4.1 交易反欺诈图模型

#### 4.1.1 模型结构

```python
# 交易反欺诈图模型
class TransactionFraudGraphModel:
    """交易反欺诈图模型"""
    
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.index_manager = PropertyIndexManager()
    
    def add_user_node(self, user_data):
        """添加用户节点"""
        user_node = UserNodeFactory.create_from_user_data(user_data)
        self.nodes[user_node.node_id] = user_node
        
        # 添加到索引
        self.index_manager.add_to_index('USER', 'user_id', user_data['user_id'], user_node.node_id)
        if user_data.get('phone'):
            self.index_manager.add_to_index('USER', 'phone', user_data['phone'], user_node.node_id)
        if user_data.get('email'):
            self.index_manager.add_to_index('USER', 'email', user_data['email'], user_node.node_id)
        
        return user_node
    
    def add_device_node(self, device_data):
        """添加设备节点"""
        device_node = DeviceNode(device_data['device_id'], {
            'device_type': device_data.get('device_type'),
            'os_type': device_data.get('os_type'),
            'os_version': device_data.get('os_version'),
            'first_seen': device_data.get('first_seen'),
            'last_seen': device_data.get('last_seen'),
            'risk_score': device_data.get('risk_score', 0.0)
        })
        self.nodes[device_node.node_id] = device_node
        return device_node
    
    def add_transaction_node(self, transaction_data):
        """添加交易节点"""
        transaction_node = Vertex(
            f"transaction:{transaction_data['transaction_id']}",
            'TRANSACTION',
            {
                'transaction_id': transaction_data['transaction_id'],
                'amount': transaction_data.get('amount', 0.0),
                'timestamp': transaction_data.get('timestamp'),
                'currency': transaction_data.get('currency', 'CNY'),
                'type': transaction_data.get('type', 'unknown'),
                'status': transaction_data.get('status', 'completed'),
                'risk_score': transaction_data.get('risk_score', 0.0)
            }
        )
        self.nodes[transaction_node.id] = transaction_node
        return transaction_node
    
    def create_user_device_relationship(self, user_id, device_id, login_data=None):
        """创建用户-设备关系"""
        user_node_id = f"user:{user_id}"
        device_node_id = f"device:{device_id}"
        
        if user_node_id in self.nodes and device_node_id in self.nodes:
            user_node = self.nodes[user_node_id]
            device_node = self.nodes[device_node_id]
            
            edge = EdgeFactory.create_user_device_edge(user_node, device_node, login_data)
            self.edges[edge.edge_id] = edge
            return edge
        return None
    
    def create_transaction_relationship(self, user_id, transaction_data):
        """创建交易关系"""
        user_node_id = f"user:{user_id}"
        transaction_node_id = f"transaction:{transaction_data['transaction_id']}"
        
        if user_node_id in self.nodes and transaction_node_id in self.nodes:
            user_node = self.nodes[user_node_id]
            transaction_node = self.nodes[transaction_node_id]
            
            edge = EdgeFactory.create_transaction_edge(user_node, transaction_node, transaction_data)
            self.edges[edge.edge_id] = edge
            return edge
        return None
    
    def find_users_by_phone(self, phone):
        """通过手机号查找用户"""
        return self.index_manager.query_by_property('USER', 'phone', phone)
    
    def find_users_by_email(self, email):
        """通过邮箱查找用户"""
        return self.index_manager.query_by_property('USER', 'email', email)
    
    def get_user_devices(self, user_id):
        """获取用户关联的设备"""
        user_node_id = f"user:{user_id}"
        devices = []
        
        for edge_id, edge in self.edges.items():
            if (edge.source_node.node_id == user_node_id and 
                edge.edge_type == 'USER_DEVICE'):
                devices.append(edge.target_node)
        
        return devices

# 使用示例
def example_transaction_fraud_graph():
    """交易反欺诈图模型示例"""
    # 创建图模型
    graph_model = TransactionFraudGraphModel()
    
    # 添加用户节点
    user1_data = {
        'user_id': 'user_001',
        'phone': '13800138001',
        'email': 'user1@example.com',
        'created_at': time.time() - 86400 * 30,  # 30天前注册
        'total_transactions': 50,
        'total_transaction_amount': 15000.0,
        'risk_level': 'normal'
    }
    user1_node = graph_model.add_user_node(user1_data)
    
    user2_data = {
        'user_id': 'user_002',
        'phone': '13800138002',
        'email': 'user2@example.com',
        'created_at': time.time() - 86400 * 10,  # 10天前注册
        'total_transactions': 5,
        'total_transaction_amount': 2000.0,
        'risk_level': 'high'
    }
    user2_node = graph_model.add_user_node(user2_data)
    
    # 添加设备节点
    device1_data = {
        'device_id': 'device_001',
        'device_type': 'iOS',
        'os_type': 'iOS',
        'os_version': '14.0',
        'first_seen': time.time() - 86400 * 25,
        'last_seen': time.time(),
        'risk_score': 0.1
    }
    device1_node = graph_model.add_device_node(device1_data)
    
    # 创建用户-设备关系
    login_data = {
        'timestamp': time.time(),
        'ip_address': '192.168.1.100',
        'user_agent': 'iPhone Safari',
        'success': True
    }
    edge1 = graph_model.create_user_device_relationship('user_001', 'device_001', login_data)
    
    # 添加交易节点和关系
    transaction_data = {
        'transaction_id': 'trans_001',
        'amount': 1000.0,
        'timestamp': time.time(),
        'currency': 'CNY',
        'type': 'purchase',
        'status': 'completed',
        'risk_score': 0.2
    }
    transaction_node = graph_model.add_transaction_node(transaction_data)
    edge2 = graph_model.create_transaction_relationship('user_001', transaction_data)
    
    print("图模型构建完成:")
    print(f"节点数: {len(graph_model.nodes)}")
    print(f"边数: {len(graph_model.edges)}")
    print(f"用户1关联设备数: {len(graph_model.get_user_devices('user_001'))}")
```

### 4.2 营销反作弊图模型

#### 4.2.1 模型特点

```python
# 营销反作弊图模型
class MarketingAntiFraudGraphModel:
    """营销反作弊图模型"""
    
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.campaign_groups = {}  # 活动分组
    
    def add_campaign_participation(self, user_id, campaign_id, participation_data):
        """添加活动参与关系"""
        # 创建用户节点（如果不存在）
        user_node_id = f"user:{user_id}"
        if user_node_id not in self.nodes:
            user_node = Vertex(user_node_id, 'USER', {
                'user_id': user_id,
                'register_time': participation_data.get('register_time'),
                'risk_level': 'normal'
            })
            self.nodes[user_node_id] = user_node
        
        # 创建活动节点（如果不存在）
        campaign_node_id = f"campaign:{campaign_id}"
        if campaign_node_id not in self.nodes:
            campaign_node = Vertex(campaign_node_id, 'CAMPAIGN', {
                'campaign_id': campaign_id,
                'start_time': participation_data.get('campaign_start_time'),
                'end_time': participation_data.get('campaign_end_time'),
                'type': participation_data.get('campaign_type', 'unknown')
            })
            self.nodes[campaign_node_id] = campaign_node
        
        # 创建参与边
        participation_edge = Edge(
            f"participate:{user_id}:{campaign_id}",
            self.nodes[user_node_id],
            self.nodes[campaign_node_id],
            'PARTICIPATE',
            {
                'participation_time': participation_data.get('participation_time'),
                'reward_amount': participation_data.get('reward_amount', 0.0),
                'ip_address': participation_data.get('ip_address'),
                'device_id': participation_data.get('device_id'),
                'success': participation_data.get('success', True)
            }
        )
        self.edges[participation_edge.id] = participation_edge
        
        # 添加到活动分组
        if campaign_id not in self.campaign_groups:
            self.campaign_groups[campaign_id] = []
        self.campaign_groups[campaign_id].append(user_node_id)
        
        return participation_edge
    
    def detect_bulk_participation(self, campaign_id, time_window=3600):
        """
        检测批量参与
        
        Args:
            campaign_id: 活动ID
            time_window: 时间窗口（秒）
        """
        if campaign_id not in self.campaign_groups:
            return []
        
        # 获取活动参与者
        participants = self.campaign_groups[campaign_id]
        bulk_participants = []
        
        # 按时间分组参与者
        time_groups = {}
        for user_node_id in participants:
            # 查找用户参与该活动的边
            for edge_id, edge in self.edges.items():
                if (edge.source.id == user_node_id and 
                    edge.target.id == f"campaign:{campaign_id}" and
                    edge.type == 'PARTICIPATE'):
                    
                    participation_time = edge.properties.get('participation_time')
                    if participation_time:
                        time_key = int(participation_time / time_window)
                        if time_key not in time_groups:
                            time_groups[time_key] = []
                        time_groups[time_key].append({
                            'user_id': user_node_id,
                            'time': participation_time,
                            'edge': edge
                        })
        
        # 检测批量参与（同一时间窗口内参与人数过多）
        for time_key, group in time_groups.items():
            if len(group) > 10:  # 超过10人认为是批量参与
                bulk_participants.extend([item['user_id'] for item in group])
        
        return list(set(bulk_participants))
    
    def detect_shared_resources(self, resource_type='IP'):
        """检测共享资源"""
        shared_users = {}
        
        # 遍历所有参与边
        for edge_id, edge in self.edges.items():
            if edge.type == 'PARTICIPATE':
                resource_value = edge.properties.get(resource_type.lower())
                if resource_value:
                    if resource_value not in shared_users:
                        shared_users[resource_value] = []
                    shared_users[resource_value].append(edge.source.id)
        
        # 找出共享资源的用户组
        suspicious_groups = []
        for resource_value, users in shared_users.items():
            if len(users) > 5:  # 超过5个用户共享同一资源
                suspicious_groups.append({
                    'resource_type': resource_type,
                    'resource_value': resource_value,
                    'users': users,
                    'count': len(users)
                })
        
        return suspicious_groups

# 使用示例
def example_marketing_anti_fraud_graph():
    """营销反作弊图模型示例"""
    # 创建图模型
    graph_model = MarketingAntiFraudGraphModel()
    
    # 模拟活动参与数据
    import random
    campaign_id = "campaign_001"
    
    # 正常用户参与
    for i in range(50):
        participation_data = {
            'participation_time': time.time() - random.randint(0, 86400),  # 随机时间
            'reward_amount': random.uniform(10, 100),
            'ip_address': f"192.168.1.{random.randint(1, 100)}",
            'device_id': f"device_{random.randint(1, 200)}",
            'success': True
        }
        graph_model.add_campaign_participation(f"user_{i:03d}", campaign_id, participation_data)
    
    # 模拟作弊用户批量参与
    base_time = time.time() - 1800  # 30分钟前
    for i in range(20):
        participation_data = {
            'participation_time': base_time + random.randint(0, 60),  # 短时间内
            'reward_amount': random.uniform(10, 100),
            'ip_address': "192.168.1.200",  # 相同IP
            'device_id': f"device_999",     # 相同设备
            'success': True
        }
        graph_model.add_campaign_participation(f"cheater_{i:02d}", campaign_id, participation_data)
    
    # 检测批量参与
    bulk_participants = graph_model.detect_bulk_participation(campaign_id, time_window=300)
    print(f"检测到批量参与者: {len(bulk_participants)} 个")
    
    # 检测共享资源
    shared_ips = graph_model.detect_shared_resources('IP')
    print(f"检测到共享IP组: {len(shared_ips)} 组")
    for group in shared_ips:
        if group['count'] > 5:
            print(f"  IP {group['resource_value']} 被 {group['count']} 个用户共享")

# 运行示例
# example_marketing_anti_fraud_graph()
```

## 五、图数据存储与管理

### 5.1 存储方案选择

#### 5.1.1 图数据库选型

```python
# 图数据库接口设计
class GraphDatabaseInterface:
    """图数据库接口"""
    
    def __init__(self, db_type, connection_config):
        self.db_type = db_type
        self.connection_config = connection_config
        self.connection = None
    
    def connect(self):
        """建立连接"""
        raise NotImplementedError
    
    def add_vertex(self, vertex):
        """添加节点"""
        raise NotImplementedError
    
    def add_edge(self, edge):
        """添加边"""
        raise NotImplementedError
    
    def query_vertex(self, vertex_id):
        """查询节点"""
        raise NotImplementedError
    
    def query_edges(self, vertex_id, direction='both'):
        """查询边"""
        raise NotImplementedError
    
    def execute_traversal(self, start_vertex, traversal_script):
        """执行图遍历"""
        raise NotImplementedError

# Neo4j实现
class Neo4jGraphDatabase(GraphDatabaseInterface):
    """Neo4j图数据库实现"""
    
    def __init__(self, connection_config):
        super().__init__('neo4j', connection_config)
        self.driver = None
    
    def connect(self):
        """建立Neo4j连接"""
        try:
            from neo4j import GraphDatabase
            self.driver = GraphDatabase.driver(
                self.connection_config['uri'],
                auth=(self.connection_config['user'], self.connection_config['password'])
            )
            return True
        except Exception as e:
            print(f"连接Neo4j失败: {e}")
            return False
    
    def add_vertex(self, vertex):
        """添加节点到Neo4j"""
        if not self.driver:
            raise Exception("数据库未连接")
        
        with self.driver.session() as session:
            query = """
            MERGE (n:{label} {{id: $id}})
            SET n += $properties
            """.format(label=vertex.type)
            
            session.run(query, {
                'id': vertex.id,
                'properties': vertex.properties
            })
    
    def add_edge(self, edge):
        """添加边到Neo4j"""
        if not self.driver:
            raise Exception("数据库未连接")
        
        with self.driver.session() as session:
            query = """
            MATCH (a {{id: $source_id}}), (b {{id: $target_id}})
            MERGE (a)-[r:{edge_type}]->(b)
            SET r += $properties
            """.format(edge_type=edge.type)
            
            session.run(query, {
                'source_id': edge.source.id,
                'target_id': edge.target.id,
                'properties': edge.properties
            })

# Redis图数据库实现
class RedisGraphDatabase(GraphDatabaseInterface):
    """Redis图数据库实现"""
    
    def __init__(self, connection_config):
        super().__init__('redis', connection_config)
        self.redis_client = None
    
    def connect(self):
        """建立Redis连接"""
        try:
            import redis
            self.redis_client = redis.Redis(
                host=self.connection_config['host'],
                port=self.connection_config['port'],
                db=self.connection_config.get('db', 0),
                decode_responses=True
            )
            return True
        except Exception as e:
            print(f"连接Redis失败: {e}")
            return False
    
    def add_vertex(self, vertex):
        """添加节点到Redis"""
        if not self.redis_client:
            raise Exception("数据库未连接")
        
        # 使用Hash存储节点属性
        vertex_key = f"vertex:{vertex.id}"
        self.redis_client.hset(vertex_key, mapping={
            'type': vertex.type,
            'properties': str(vertex.properties)
        })
        
        # 添加到类型索引
        type_index_key = f"vertex_index:type:{vertex.type}"
        self.redis_client.sadd(type_index_key, vertex.id)
    
    def add_edge(self, edge):
        """添加边到Redis"""
        if not self.redis_client:
            raise Exception("数据库未连接")
        
        # 使用Sorted Set存储边关系
        source_edges_key = f"edges:{edge.source.id}:out"
        target_edges_key = f"edges:{edge.target.id}:in"
        
        edge_data = {
            'target': edge.target.id,
            'type': edge.type,
            'properties': str(edge.properties)
        }
        
        self.redis_client.zadd(source_edges_key, {str(edge_data): time.time()})
        self.redis_client.zadd(target_edges_key, {str(edge_data): time.time()})

# 存储管理器
class GraphStorageManager:
    """图存储管理器"""
    
    def __init__(self, storage_config):
        self.storage_config = storage_config
        self.storages = {}
        self._initialize_storages()
    
    def _initialize_storages(self):
        """初始化存储"""
        for storage_name, config in self.storage_config.items():
            if config['type'] == 'neo4j':
                self.storages[storage_name] = Neo4jGraphDatabase(config)
            elif config['type'] == 'redis':
                self.storages[storage_name] = RedisGraphDatabase(config)
    
    def get_storage(self, storage_name):
        """获取存储实例"""
        return self.storages.get(storage_name)
    
    def sync_data(self, source_storage, target_storage, batch_size=1000):
        """同步数据"""
        # 这里简化实现，实际需要考虑数据一致性和性能优化
        print(f"从 {source_storage} 同步数据到 {target_storage}")
```

### 5.2 数据分区与分片

#### 5.2.1 分区策略

```python
# 图数据分区策略
class GraphPartitionStrategy:
    """图数据分区策略"""
    
    def __init__(self, partition_count=16):
        self.partition_count = partition_count
        self.partition_map = {}  # 节点到分区的映射
    
    def hash_partition(self, node_id):
        """哈希分区"""
        import hashlib
        hash_value = int(hashlib.md5(node_id.encode()).hexdigest()[:8], 16)
        return hash_value % self.partition_count
    
    def range_partition(self, node_id, partition_key='timestamp'):
        """范围分区"""
        # 根据节点属性进行范围分区
        # 这里简化实现
        if partition_key == 'timestamp':
            # 假设节点ID包含时间戳信息
            try:
                timestamp = int(node_id.split(':')[-1])
                return (timestamp // 86400) % self.partition_count  # 按天分区
            except:
                return 0
        return 0
    
    def assign_partition(self, node_id, strategy='hash'):
        """分配分区"""
        if strategy == 'hash':
            partition_id = self.hash_partition(node_id)
        elif strategy == 'range':
            partition_id = self.range_partition(node_id)
        else:
            partition_id = 0
        
        self.partition_map[node_id] = partition_id
        return partition_id
    
    def get_partition(self, node_id):
        """获取节点分区"""
        return self.partition_map.get(node_id, 0)
    
    def get_nodes_in_partition(self, partition_id):
        """获取分区中的节点"""
        return [node_id for node_id, pid in self.partition_map.items() if pid == partition_id]

# 分布式图存储
class DistributedGraphStorage:
    """分布式图存储"""
    
    def __init__(self, storage_nodes, partition_strategy):
        self.storage_nodes = storage_nodes
        self.partition_strategy = partition_strategy
        self.node_locations = {}  # 节点位置映射
    
    def store_node(self, node):
        """存储节点"""
        partition_id = self.partition_strategy.assign_partition(node.id)
        storage_node = self.storage_nodes[partition_id % len(self.storage_nodes)]
        
        # 存储节点
        storage_node.add_vertex(node)
        self.node_locations[node.id] = storage_node
        
        return partition_id
    
    def store_edge(self, edge):
        """存储边"""
        # 确保边的两个节点在同一个存储节点上，或支持跨节点查询
        source_partition = self.partition_strategy.get_partition(edge.source.id)
        target_partition = self.partition_strategy.get_partition(edge.target.id)
        
        if source_partition == target_partition:
            # 同一分区，直接存储
            storage_node = self.storage_nodes[source_partition % len(self.storage_nodes)]
            storage_node.add_edge(edge)
        else:
            # 不同分区，需要特殊处理
            # 这里简化处理，实际需要考虑分布式事务和数据一致性
            source_storage = self.storage_nodes[source_partition % len(self.storage_nodes)]
            target_storage = self.storage_nodes[target_partition % len(self.storage_nodes)]
            
            # 在两个存储节点上都存储边信息
            source_storage.add_edge(edge)
            # 可以考虑在目标节点上存储反向边或引用
    
    def query_node(self, node_id):
        """查询节点"""
        if node_id in self.node_locations:
            storage_node = self.node_locations[node_id]
            return storage_node.query_vertex(node_id)
        else:
            # 需要广播查询或使用全局索引
            for storage_node in self.storage_nodes:
                try:
                    node = storage_node.query_vertex(node_id)
                    if node:
                        return node
                except:
                    continue
        return None

# 使用示例
def example_distributed_storage():
    """分布式存储示例"""
    # 创建分区策略
    partition_strategy = GraphPartitionStrategy(partition_count=4)
    
    # 创建存储节点（模拟）
    class MockStorageNode:
        def __init__(self, node_id):
            self.node_id = node_id
            self.vertices = {}
            self.edges = {}
        
        def add_vertex(self, vertex):
            self.vertices[vertex.id] = vertex
            print(f"存储节点 {self.node_id} 添加节点 {vertex.id}")
        
        def add_edge(self, edge):
            self.edges[edge.id] = edge
            print(f"存储节点 {self.node_id} 添加边 {edge.id}")
        
        def query_vertex(self, vertex_id):
            return self.vertices.get(vertex_id)
    
    storage_nodes = [MockStorageNode(i) for i in range(4)]
    
    # 创建分布式存储
    distributed_storage = DistributedGraphStorage(storage_nodes, partition_strategy)
    
    # 创建节点
    user_node = Vertex("user:001", "USER", {"name": "张三", "age": 25})
    device_node = Vertex("device:001", "DEVICE", {"type": "iPhone", "os": "iOS 14"})
    
    # 存储节点
    user_partition = distributed_storage.store_node(user_node)
    device_partition = distributed_storage.store_node(device_node)
    
    print(f"用户节点存储在分区 {user_partition}")
    print(f"设备节点存储在分区 {device_partition}")
    
    # 创建边
    edge = Edge("user:001-use-device:001", user_node, device_node, "USE", {"timestamp": time.time()})
    distributed_storage.store_edge(edge)
```

## 总结

图数据建模是风控图计算系统的基础，合理的模型设计能够有效支撑后续的图分析和风险识别。在设计过程中，需要充分考虑业务场景特点、数据特征以及计算需求。

关键要点包括：
1. **节点设计**：合理定义节点类型和属性，确保能够准确表达业务实体
2. **边设计**：准确反映实体间的关系类型和业务含义
3. **属性优化**：通过索引和分层设计提升查询性能
4. **存储管理**：选择合适的存储方案并设计有效的分区策略
5. **实践应用**：结合具体业务场景实现针对性的图模型

随着业务的发展和数据的积累，图模型也需要不断迭代优化，以适应新的风险模式和业务需求。