---
title: 附录C：CI模型设计示例
date: 2025-09-07
categories: [CMDB]
tags: [cmdb, ci-model, design-examples]
published: true
---

在配置管理数据库（CMDB）的实施过程中，配置项（CI）模型设计是核心环节之一。良好的CI模型设计不仅能够准确描述IT环境中的各种资源，还能支撑复杂的关联关系分析和业务场景应用。本文将通过具体的示例，详细介绍不同类型CI的模型设计方法和最佳实践。

## CI模型设计原则

在设计CI模型时，需要遵循以下核心原则：

### 1. 业务驱动原则
CI模型设计应以业务需求为导向，确保模型能够支撑实际的运维场景和业务应用。

### 2. 标准化原则
采用业界标准和最佳实践，确保模型的通用性和可扩展性。

### 3. 灵活性原则
模型应具备足够的灵活性，能够适应业务变化和技术演进。

### 4. 可管理性原则
模型应便于维护和管理，避免过度复杂化。

## 基础CI模型设计

### 1. 服务器（Server）模型

服务器是IT基础设施的核心组件，其模型设计需要考虑硬件、操作系统、网络等多个维度。

```python
class ServerCI:
    def __init__(self):
        # 基础属性
        self.ci_id = None
        self.ci_type = "Server"
        self.name = ""
        self.description = ""
        
        # 硬件属性
        self.hardware = {
            "manufacturer": "",
            "model": "",
            "serial_number": "",
            "cpu": {
                "count": 0,
                "cores_per_cpu": 0,
                "threads_per_core": 0,
                "architecture": "",
                "clock_speed_ghz": 0.0
            },
            "memory": {
                "total_gb": 0,
                "slots_used": 0,
                "slots_total": 0
            },
            "storage": [
                # 存储设备列表
            ],
            "network_interfaces": [
                # 网络接口列表
            ]
        }
        
        # 操作系统属性
        self.operating_system = {
            "name": "",
            "version": "",
            "architecture": "",
            "kernel_version": "",
            "install_date": None
        }
        
        # 网络属性
        self.network = {
            "primary_ip": "",
            "secondary_ips": [],
            "dns_servers": [],
            "gateway": "",
            "subnet_mask": ""
        }
        
        # 管理属性
        self.management = {
            "asset_tag": "",
            "purchase_date": None,
            "warranty_expiration": None,
            "location": "",
            "rack_position": "",
            "owner": "",
            "support_group": ""
        }
        
        # 状态属性
        self.status = {
            "operational_status": "active",  # active, inactive, maintenance, decommissioned
            "maintenance_window": "",
            "last_updated": None,
            "discovery_source": ""
        }
    
    def add_storage_device(self, device_info):
        """添加存储设备"""
        self.hardware["storage"].append(device_info)
    
    def add_network_interface(self, interface_info):
        """添加网络接口"""
        self.hardware["network_interfaces"].append(interface_info)
    
    def validate_model(self):
        """验证模型完整性"""
        required_fields = [
            "name", "hardware.manufacturer", "hardware.model",
            "operating_system.name", "network.primary_ip"
        ]
        
        missing_fields = []
        for field in required_fields:
            if not self._get_nested_value(field):
                missing_fields.append(field)
        
        return {
            "is_valid": len(missing_fields) == 0,
            "missing_fields": missing_fields
        }
    
    def _get_nested_value(self, field_path):
        """获取嵌套字段值"""
        keys = field_path.split('.')
        value = self
        try:
            for key in keys:
                if isinstance(value, dict):
                    value = value[key]
                else:
                    return None
            return value
        except (KeyError, TypeError):
            return None

# 服务器模型使用示例
server = ServerCI()
server.name = "web-server-01"
server.description = "前端Web服务器"
server.hardware["manufacturer"] = "Dell"
server.hardware["model"] = "PowerEdge R740"
server.hardware["serial_number"] = "SN123456789"
server.hardware["cpu"]["count"] = 2
server.hardware["cpu"]["cores_per_cpu"] = 16
server.hardware["memory"]["total_gb"] = 64
server.operating_system["name"] = "CentOS Linux"
server.operating_system["version"] = "7.9"
server.network["primary_ip"] = "192.168.1.100"
server.management["asset_tag"] = "ASSET001"
server.management["location"] = "数据中心A-机柜01-U10"

# 验证模型
validation_result = server.validate_model()
print(f"模型验证结果: {validation_result}")
```

### 2. 网络设备（Network Device）模型

网络设备包括路由器、交换机、防火墙等，其模型设计需要关注网络连接和路由信息。

```python
class NetworkDeviceCI:
    def __init__(self):
        # 基础属性
        self.ci_id = None
        self.ci_type = "NetworkDevice"
        self.name = ""
        self.description = ""
        
        # 设备属性
        self.device = {
            "manufacturer": "",
            "model": "",
            "serial_number": "",
            "device_type": "",  # router, switch, firewall, load_balancer
            "firmware_version": ""
        }
        
        # 网络接口属性
        self.interfaces = [
            # 接口列表
        ]
        
        # 路由属性
        self.routing = {
            "routing_protocols": [],
            "static_routes": [],
            "default_gateway": ""
        }
        
        # 安全属性
        self.security = {
            "firewall_enabled": False,
            "access_control_lists": [],
            "vpn_configurations": []
        }
        
        # 管理属性
        self.management = {
            "management_ip": "",
            "snmp_community": "",
            "ssh_enabled": True,
            "telnet_enabled": False,
            "asset_tag": "",
            "location": ""
        }
        
        # 状态属性
        self.status = {
            "operational_status": "active",
            "last_reboot": None,
            "uptime_hours": 0,
            "cpu_usage_percent": 0,
            "memory_usage_percent": 0
        }
    
    def add_interface(self, interface_info):
        """添加网络接口"""
        # 验证接口信息
        required_fields = ["name", "type", "speed_mbps"]
        if all(field in interface_info for field in required_fields):
            self.interfaces.append(interface_info)
            return True
        return False
    
    def add_static_route(self, route_info):
        """添加静态路由"""
        required_fields = ["destination", "gateway", "metric"]
        if all(field in route_info for field in required_fields):
            self.routing["static_routes"].append(route_info)
            return True
        return False
    
    def get_interface_by_name(self, interface_name):
        """根据名称获取接口"""
        for interface in self.interfaces:
            if interface.get("name") == interface_name:
                return interface
        return None

# 网络设备模型使用示例
router = NetworkDeviceCI()
router.name = "core-router-01"
router.description = "核心路由器"
router.device["manufacturer"] = "Cisco"
router.device["model"] = "ISR 4451"
router.device["serial_number"] = "FCW12345678"
router.device["device_type"] = "router"
router.device["firmware_version"] = "16.12.04"

# 添加网络接口
router.add_interface({
    "name": "GigabitEthernet0/0/0",
    "type": "ethernet",
    "speed_mbps": 1000,
    "description": "连接到互联网",
    "ip_address": "203.0.113.1",
    "subnet_mask": "255.255.255.0",
    "status": "up"
})

router.add_interface({
    "name": "GigabitEthernet0/0/1",
    "type": "ethernet",
    "speed_mbps": 1000,
    "description": "连接到内部网络",
    "ip_address": "192.168.1.1",
    "subnet_mask": "255.255.255.0",
    "status": "up"
})

# 添加静态路由
router.add_static_route({
    "destination": "10.0.0.0/8",
    "gateway": "192.168.1.254",
    "metric": 1
})

router.management["management_ip"] = "192.168.1.1"
router.management["asset_tag"] = "NET001"
```

### 3. 数据库（Database）模型

数据库是应用系统的核心数据存储，其模型设计需要关注性能、安全和备份等方面。

```python
class DatabaseCI:
    def __init__(self):
        # 基础属性
        self.ci_id = None
        self.ci_type = "Database"
        self.name = ""
        self.description = ""
        
        # 数据库属性
        self.database = {
            "type": "",  # mysql, postgresql, oracle, mssql, mongodb
            "version": "",
            "edition": "",
            "instance_name": "",
            "port": 0
        }
        
        # 存储属性
        self.storage = {
            "data_directory": "",
            "log_directory": "",
            "total_size_gb": 0,
            "used_size_gb": 0,
            "datafiles": []
        }
        
        # 性能属性
        self.performance = {
            "max_connections": 0,
            "current_connections": 0,
            "buffer_pool_size_mb": 0,
            "query_cache_size_mb": 0,
            "slow_query_threshold_ms": 0
        }
        
        # 安全属性
        self.security = {
            "authentication_method": "",
            "encryption_enabled": False,
            "ssl_enabled": False,
            "audit_logging_enabled": False,
            "users": []
        }
        
        # 备份属性
        self.backup = {
            "backup_strategy": "",  # full, incremental, differential
            "backup_frequency": "",
            "retention_period_days": 0,
            "last_backup_time": None,
            "backup_location": ""
        }
        
        # 高可用属性
        self.high_availability = {
            "ha_enabled": False,
            "cluster_type": "",  # master-slave, cluster, replication
            "replicas": [],
            "failover_method": ""
        }
        
        # 管理属性
        self.management = {
            "owner": "",
            "support_group": "",
            "maintenance_window": "",
            "asset_tag": ""
        }
    
    def add_user(self, user_info):
        """添加数据库用户"""
        required_fields = ["username", "role"]
        if all(field in user_info for field in required_fields):
            self.security["users"].append(user_info)
            return True
        return False
    
    def add_datafile(self, datafile_info):
        """添加数据文件"""
        required_fields = ["name", "path", "size_gb"]
        if all(field in datafile_info for field in required_fields):
            self.storage["datafiles"].append(datafile_info)
            return True
        return False
    
    def calculate_storage_utilization(self):
        """计算存储利用率"""
        if self.storage["total_size_gb"] > 0:
            return (self.storage["used_size_gb"] / self.storage["total_size_gb"]) * 100
        return 0

# 数据库模型使用示例
database = DatabaseCI()
database.name = "customer-db-prod"
database.description = "客户关系管理生产数据库"
database.database["type"] = "postgresql"
database.database["version"] = "13.4"
database.database["instance_name"] = "crm_prod"
database.database["port"] = 5432

# 存储配置
database.storage["data_directory"] = "/var/lib/postgresql/13/main"
database.storage["log_directory"] = "/var/log/postgresql"
database.storage["total_size_gb"] = 500
database.storage["used_size_gb"] = 320

# 添加数据文件
database.add_datafile({
    "name": "main_data",
    "path": "/var/lib/postgresql/13/main/base",
    "size_gb": 280
})

database.add_datafile({
    "name": "wal_logs",
    "path": "/var/lib/postgresql/13/main/pg_wal",
    "size_gb": 40
})

# 性能配置
database.performance["max_connections"] = 200
database.performance["buffer_pool_size_mb"] = 8192
database.performance["slow_query_threshold_ms"] = 5000

# 安全配置
database.security["authentication_method"] = "md5"
database.security["encryption_enabled"] = True
database.security["ssl_enabled"] = True

# 添加用户
database.add_user({
    "username": "crm_app",
    "role": "application",
    "privileges": ["connect", "select", "insert", "update", "delete"]
})

database.add_user({
    "username": "db_admin",
    "role": "administrator",
    "privileges": ["all"]
})

# 备份配置
database.backup["backup_strategy"] = "full"
database.backup["backup_frequency"] = "daily"
database.backup["retention_period_days"] = 30
database.backup["backup_location"] = "/backup/database"

# 管理信息
database.management["owner"] = "DBA Team"
database.management["support_group"] = "Database Support"
database.management["asset_tag"] = "DB001"
```

## 关系模型设计

CI之间的关系是CMDB的核心价值所在，关系模型设计需要考虑不同类型的关系和复杂的关联场景。

### 1. 关系类型定义

```python
class RelationshipType:
    def __init__(self, name, description, direction="bidirectional"):
        self.name = name
        self.description = description
        self.direction = direction  # unidirectional, bidirectional
        self.attributes = {}
        self.validation_rules = []
    
    def add_attribute(self, attr_name, attr_type, required=False):
        """添加关系属性"""
        self.attributes[attr_name] = {
            "type": attr_type,
            "required": required
        }
    
    def add_validation_rule(self, rule_function):
        """添加验证规则"""
        self.validation_rules.append(rule_function)
    
    def validate_relationship(self, relationship):
        """验证关系"""
        # 验证必需属性
        for attr_name, attr_config in self.attributes.items():
            if attr_config["required"] and attr_name not in relationship.attributes:
                return False, f"缺少必需属性: {attr_name}"
        
        # 执行自定义验证规则
        for rule in self.validation_rules:
            is_valid, message = rule(relationship)
            if not is_valid:
                return False, message
        
        return True, "验证通过"

# 常用关系类型定义
RUNS_ON = RelationshipType("runs_on", "应用运行在服务器上", "unidirectional")
CONNECTS_TO = RelationshipType("connects_to", "设备连接到网络", "bidirectional")
DEPENDS_ON = RelationshipType("depends_on", "CI依赖于其他CI", "unidirectional")
CONTAINS = RelationshipType("contains", "容器包含组件", "unidirectional")
BACKUP_OF = RelationshipType("backup_of", "备份关系", "unidirectional")

# 依赖关系验证规则示例
def validate_dependency_relationship(relationship):
    """验证依赖关系"""
    # 不能自己依赖自己
    if relationship.source_ci_id == relationship.target_ci_id:
        return False, "CI不能依赖自己"
    
    # 检查循环依赖
    # 这里简化处理，实际应用中需要更复杂的循环检测
    return True, "验证通过"

DEPENDS_ON.add_validation_rule(validate_dependency_relationship)
```

### 2. 关系实例设计

```python
class Relationship:
    def __init__(self, source_ci_id, target_ci_id, relationship_type):
        self.relationship_id = None
        self.source_ci_id = source_ci_id
        self.target_ci_id = target_ci_id
        self.type = relationship_type
        self.attributes = {}
        self.metadata = {
            "created_time": None,
            "created_by": None,
            "confidence": 1.0,  # 0.0-1.0的置信度
            "discovery_source": ""
        }
    
    def set_attribute(self, name, value):
        """设置关系属性"""
        self.attributes[name] = value
    
    def get_attribute(self, name, default=None):
        """获取关系属性"""
        return self.attributes.get(name, default)
    
    def validate(self, relationship_type_def):
        """验证关系"""
        return relationship_type_def.validate_relationship(self)

# 关系管理器
class RelationshipManager:
    def __init__(self):
        self.relationships = []
        self.relationship_types = {}
    
    def register_relationship_type(self, rel_type):
        """注册关系类型"""
        self.relationship_types[rel_type.name] = rel_type
    
    def create_relationship(self, source_ci_id, target_ci_id, rel_type_name, attributes=None):
        """创建关系"""
        # 检查关系类型是否存在
        if rel_type_name not in self.relationship_types:
            raise ValueError(f"关系类型 {rel_type_name} 未注册")
        
        # 创建关系实例
        relationship = Relationship(source_ci_id, target_ci_id, rel_type_name)
        
        # 设置属性
        if attributes:
            for attr_name, attr_value in attributes.items():
                relationship.set_attribute(attr_name, attr_value)
        
        # 验证关系
        rel_type_def = self.relationship_types[rel_type_name]
        is_valid, message = relationship.validate(rel_type_def)
        if not is_valid:
            raise ValueError(f"关系验证失败: {message}")
        
        # 添加到关系列表
        self.relationships.append(relationship)
        return relationship
    
    def get_relationships_by_ci(self, ci_id):
        """获取CI的所有关系"""
        return [rel for rel in self.relationships 
                if rel.source_ci_id == ci_id or rel.target_ci_id == ci_id]
    
    def get_relationships_by_type(self, rel_type_name):
        """根据类型获取关系"""
        return [rel for rel in self.relationships if rel.type == rel_type_name]

# 使用示例
rel_manager = RelationshipManager()

# 注册关系类型
rel_manager.register_relationship_type(RUNS_ON)
rel_manager.register_relationship_type(CONNECTS_TO)
rel_manager.register_relationship_type(DEPENDS_ON)

# 创建关系
try:
    # 应用运行在服务器上
    app_to_server = rel_manager.create_relationship(
        "app-crm-01",  # 应用CI ID
        "srv-web-01",  # 服务器CI ID
        "runs_on",
        {
            "deployment_path": "/opt/crm",
            "startup_script": "/etc/init.d/crm"
        }
    )
    
    # 服务器连接到网络设备
    server_to_network = rel_manager.create_relationship(
        "srv-web-01",     # 服务器CI ID
        "net-switch-01",  # 网络设备CI ID
        "connects_to",
        {
            "interface": "eth0",
            "vlan": 100,
            "bandwidth_mbps": 1000
        }
    )
    
    # 应用依赖数据库
    app_to_db = rel_manager.create_relationship(
        "app-crm-01",    # 应用CI ID
        "db-crm-prod",   # 数据库CI ID
        "depends_on",
        {
            "connection_string": "postgresql://crm_app@db-crm-prod:5432/crm",
            "dependency_type": "database"
        }
    )
    
    print("关系创建成功")
    
except ValueError as e:
    print(f"关系创建失败: {e}")
```

## 高级CI模型设计

### 1. 云资源模型

随着云计算的普及，云资源的管理成为CMDB的重要组成部分。

```python
class CloudResourceCI:
    def __init__(self, resource_type):
        self.ci_id = None
        self.ci_type = f"Cloud{resource_type}"
        self.resource_type = resource_type
        self.name = ""
        self.description = ""
        
        # 云平台属性
        self.cloud = {
            "provider": "",  # aws, azure, gcp, aliyun
            "region": "",
            "availability_zone": "",
            "account_id": "",
            "resource_id": ""
        }
        
        # 资源属性
        self.resource = {
            "state": "",  # running, stopped, terminated
            "created_time": None,
            "launch_time": None,
            "tags": {}
        }
        
        # 网络属性
        self.network = {
            "private_ip": "",
            "public_ip": "",
            "security_groups": [],
            "subnets": []
        }
        
        # 成本属性
        self.cost = {
            "hourly_rate": 0.0,
            "monthly_estimate": 0.0,
            "currency": "USD",
            "billing_tags": {}
        }
        
        # 自动化属性
        self.automation = {
            "auto_scaling_group": "",
            "load_balancer": "",
            "monitoring_enabled": False
        }
    
    def add_tag(self, key, value):
        """添加标签"""
        self.resource["tags"][key] = value
    
    def add_security_group(self, sg_id):
        """添加安全组"""
        self.network["security_groups"].append(sg_id)
    
    def calculate_monthly_cost(self, hours_per_month=730):
        """计算月度成本"""
        self.cost["monthly_estimate"] = self.cost["hourly_rate"] * hours_per_month
        return self.cost["monthly_estimate"]

# AWS EC2实例示例
ec2_instance = CloudResourceCI("EC2")
ec2_instance.name = "web-server-prod-01"
ec2_instance.description = "生产环境Web服务器"
ec2_instance.cloud["provider"] = "aws"
ec2_instance.cloud["region"] = "us-east-1"
ec2_instance.cloud["availability_zone"] = "us-east-1a"
ec2_instance.cloud["account_id"] = "123456789012"
ec2_instance.cloud["resource_id"] = "i-0123456789abcdef0"

# 资源属性
ec2_instance.resource["state"] = "running"
ec2_instance.resource["created_time"] = "2023-01-01T10:00:00Z"

# 网络属性
ec2_instance.network["private_ip"] = "10.0.1.100"
ec2_instance.network["public_ip"] = "203.0.113.100"

# 添加标签
ec2_instance.add_tag("Environment", "Production")
ec2_instance.add_tag("Application", "WebServer")
ec2_instance.add_tag("Team", "WebTeam")

# 成本属性
ec2_instance.cost["hourly_rate"] = 0.0464  # t3.medium按需实例价格
ec2_instance.calculate_monthly_cost()

# 添加安全组
ec2_instance.add_security_group("sg-0123456789abcdef0")
```

### 2. 容器化应用模型

在云原生环境中，容器化应用的管理变得越来越重要。

```python
class ContainerizedApplicationCI:
    def __init__(self):
        self.ci_id = None
        self.ci_type = "ContainerizedApplication"
        self.name = ""
        self.description = ""
        
        # 应用属性
        self.application = {
            "name": "",
            "version": "",
            "namespace": "",
            "replicas": 0,
            "deployment_strategy": ""  # rolling, recreate, blue-green
        }
        
        # 容器属性
        self.containers = [
            # 容器列表
        ]
        
        # 服务属性
        self.services = [
            # 服务列表
        ]
        
        # 配置属性
        self.configuration = {
            "config_maps": [],
            "secrets": [],
            "environment_variables": {}
        }
        
        # 网络属性
        self.networking = {
            "ingress": {},
            "service_mesh": "",
            "exposed_ports": []
        }
        
        # 存储属性
        self.storage = {
            "volumes": [],
            "persistent_volume_claims": []
        }
        
        # 监控属性
        self.monitoring = {
            "health_checks": [],
            "metrics_endpoints": [],
            "logging_config": {}
        }
    
    def add_container(self, container_info):
        """添加容器"""
        required_fields = ["name", "image"]
        if all(field in container_info for field in required_fields):
            self.containers.append(container_info)
            return True
        return False
    
    def add_service(self, service_info):
        """添加服务"""
        required_fields = ["name", "port"]
        if all(field in service_info for field in required_fields):
            self.services.append(service_info)
            return True
        return False
    
    def add_config_map(self, config_map_info):
        """添加配置映射"""
        required_fields = ["name", "data"]
        if all(field in config_map_info for field in required_fields):
            self.configuration["config_maps"].append(config_map_info)
            return True
        return False

# Kubernetes应用示例
k8s_app = ContainerizedApplicationCI()
k8s_app.name = "ecommerce-api"
k8s_app.description = "电子商务API服务"
k8s_app.application["name"] = "ecommerce-api"
k8s_app.application["version"] = "v1.2.3"
k8s_app.application["namespace"] = "production"
k8s_app.application["replicas"] = 3
k8s_app.application["deployment_strategy"] = "rolling"

# 添加容器
k8s_app.add_container({
    "name": "api-server",
    "image": "ecommerce/api:1.2.3",
    "ports": [
        {"containerPort": 8080, "protocol": "TCP"}
    ],
    "resources": {
        "requests": {"memory": "512Mi", "cpu": "250m"},
        "limits": {"memory": "1Gi", "cpu": "500m"}
    },
    "env": [
        {"name": "DATABASE_URL", "valueFrom": {"secretKeyRef": {"name": "db-secret", "key": "url"}}}
    ]
})

# 添加服务
k8s_app.add_service({
    "name": "api-service",
    "port": 80,
    "target_port": 8080,
    "protocol": "TCP",
    "type": "ClusterIP"
})

# 配置管理
k8s_app.add_config_map({
    "name": "api-config",
    "data": {
        "log_level": "INFO",
        "max_connections": "100"
    }
})

# 网络配置
k8s_app.networking["ingress"] = {
    "host": "api.ecommerce.com",
    "paths": ["/api"]
}
k8s_app.networking["service_mesh"] = "istio"
k8s_app.networking["exposed_ports"].append(8080)

# 存储配置
k8s_app.storage["persistent_volume_claims"].append({
    "name": "api-storage",
    "claim_name": "api-pvc",
    "mount_path": "/data"
})

# 监控配置
k8s_app.monitoring["health_checks"].append({
    "type": "liveness",
    "path": "/health",
    "port": 8080
})
k8s_app.monitoring["metrics_endpoints"].append("/metrics")
```

## 模型验证与管理

### 1. 模型验证框架

```python
class CIModelValidator:
    def __init__(self):
        self.validation_rules = {}
    
    def register_validation_rule(self, ci_type, rule_name, validation_function):
        """注册验证规则"""
        if ci_type not in self.validation_rules:
            self.validation_rules[ci_type] = {}
        self.validation_rules[ci_type][rule_name] = validation_function
    
    def validate_ci(self, ci_instance):
        """验证CI实例"""
        ci_type = getattr(ci_instance, 'ci_type', None)
        if not ci_type:
            return False, "CI类型未定义"
        
        if ci_type not in self.validation_rules:
            return True, "无验证规则，验证通过"
        
        errors = []
        for rule_name, rule_func in self.validation_rules[ci_type].items():
            try:
                is_valid, message = rule_func(ci_instance)
                if not is_valid:
                    errors.append(f"{rule_name}: {message}")
            except Exception as e:
                errors.append(f"{rule_name}: 验证异常 - {str(e)}")
        
        if errors:
            return False, "; ".join(errors)
        return True, "验证通过"

# 验证规则示例
def validate_server_name(server_ci):
    """验证服务器名称"""
    if not server_ci.name or len(server_ci.name.strip()) == 0:
        return False, "服务器名称不能为空"
    if len(server_ci.name) > 100:
        return False, "服务器名称长度不能超过100个字符"
    return True, "验证通过"

def validate_server_ip(server_ci):
    """验证服务器IP地址"""
    import re
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    primary_ip = server_ci.network.get("primary_ip", "")
    if not primary_ip:
        return False, "主IP地址不能为空"
    if not re.match(ip_pattern, primary_ip):
        return False, "IP地址格式不正确"
    return True, "验证通过"

# 注册验证规则
validator = CIModelValidator()
validator.register_validation_rule("Server", "name_validation", validate_server_name)
validator.register_validation_rule("Server", "ip_validation", validate_server_ip)

# 验证CI实例
server = ServerCI()
server.name = "test-server"
server.network["primary_ip"] = "192.168.1.100"

is_valid, message = validator.validate_ci(server)
print(f"验证结果: {is_valid}, 消息: {message}")
```

### 2. 模型版本管理

```python
class CIModelVersionManager:
    def __init__(self):
        self.model_versions = {}
        self.current_versions = {}
    
    def register_model_version(self, ci_type, version, model_class, schema):
        """注册模型版本"""
        if ci_type not in self.model_versions:
            self.model_versions[ci_type] = {}
        self.model_versions[ci_type][version] = {
            "class": model_class,
            "schema": schema,
            "created_time": datetime.now()
        }
    
    def set_current_version(self, ci_type, version):
        """设置当前版本"""
        if (ci_type in self.model_versions and 
            version in self.model_versions[ci_type]):
            self.current_versions[ci_type] = version
            return True
        return False
    
    def get_model_class(self, ci_type, version=None):
        """获取模型类"""
        if version is None:
            version = self.current_versions.get(ci_type)
        
        if (ci_type in self.model_versions and 
            version in self.model_versions[ci_type]):
            return self.model_versions[ci_type][version]["class"]
        return None
    
    def get_schema(self, ci_type, version=None):
        """获取模型Schema"""
        if version is None:
            version = self.current_versions.get(ci_type)
        
        if (ci_type in self.model_versions and 
            version in self.model_versions[ci_type]):
            return self.model_versions[ci_type][version]["schema"]
        return None

# 模型版本管理使用示例
version_manager = CIModelVersionManager()

# 注册不同版本的服务器模型
version_manager.register_model_version(
    "Server", 
    "1.0", 
    ServerCI, 
    {
        "required_fields": ["name", "network.primary_ip"],
        "optional_fields": ["hardware.cpu.count", "hardware.memory.total_gb"]
    }
)

# 设置当前版本
version_manager.set_current_version("Server", "1.0")

# 获取当前版本的模型类
current_server_class = version_manager.get_model_class("Server")
if current_server_class:
    server_instance = current_server_class()
    print(f"创建了 {current_server_class.__name__} 实例")
```

## 最佳实践总结

### 1. 模型设计建议

1. **从业务需求出发**：模型设计应以实际业务场景为驱动
2. **保持适度抽象**：避免过度复杂化，保持模型的可管理性
3. **考虑扩展性**：设计时预留扩展空间
4. **标准化命名**：采用一致的命名规范
5. **文档化设计**：详细记录模型设计决策和变更

### 2. 实施建议

1. **分阶段实施**：从核心CI类型开始，逐步扩展
2. **建立治理机制**：制定模型变更审批流程
3. **持续优化**：根据使用反馈不断改进模型
4. **培训团队**：确保团队理解模型设计原则
5. **工具支持**：提供模型设计和验证工具

## 总结

CI模型设计是CMDB实施的关键环节，良好的模型设计能够准确描述IT环境中的各种资源及其关系。通过本文的示例，我们可以看到：

1. **基础模型设计**：服务器、网络设备、数据库等基础CI的模型设计方法
2. **关系模型设计**：CI之间关系的建模和管理
3. **高级模型设计**：云资源和容器化应用等现代IT架构的模型设计
4. **模型验证与管理**：确保模型质量和一致性的机制

在实际应用中，应根据组织的具体需求和IT环境特点，灵活运用这些设计方法和原则，构建适合自身业务的CI模型体系。