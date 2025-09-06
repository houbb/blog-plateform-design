---
title: 附录B：常用自动发现工具与协议
date: 2025-09-07
categories: [CMDB]
tags: [cmdb, discovery, protocols, tools]
published: true
---

在配置管理数据库（CMDB）的实施过程中，自动发现技术是确保数据准确性和时效性的关键手段。通过自动发现，CMDB系统能够持续获取IT环境中的配置项信息，减少手工录入的错误和滞后。本文将详细介绍常用的自动发现工具和协议，帮助读者构建高效的自动发现体系。

## 自动发现技术概述

自动发现是指通过技术手段自动识别、收集和更新IT环境中配置项信息的过程。它是现代CMDB系统的核心功能之一，具有以下重要意义：

1. **数据准确性**：减少手工录入错误，提高数据质量
2. **实时性**：及时反映环境变化，保持数据时效性
3. **效率提升**：大幅减少人工维护工作量
4. **完整性**：发现容易被忽略的配置项

## 自动发现的分类

### 按发现范围分类

1. **网络发现**：发现网络设备和连接关系
2. **主机发现**：发现服务器和工作站的硬件、软件信息
3. **应用发现**：发现运行在主机上的应用程序和服务
4. **服务发现**：发现业务服务及其依赖关系

### 按发现方式分类

1. **主动发现**：系统主动扫描目标环境
2. **被动发现**：通过监听网络流量或接收事件来发现
3. **混合发现**：结合主动和被动方式

## 常用发现协议

### 1. SNMP（Simple Network Management Protocol）

SNMP是最常用的网络设备发现协议，广泛应用于路由器、交换机、防火墙等网络设备的管理。

**特点：**
- 标准化程度高，支持广泛
- 轻量级协议，资源消耗小
- 支持MIB（Management Information Base）管理信息库

**版本：**
- SNMPv1：最早的版本，安全性较低
- SNMPv2c：改进版本，增加了数据类型和错误码
- SNMPv3：最新版本，提供认证和加密功能

**应用场景：**
- 网络设备基本信息发现
- 接口状态和流量监控
- 系统资源使用情况监控

**示例代码（Python）：**
```python
from pysnmp.hlapi import *

class SNMPDiscoverer:
    def __init__(self, community='public', version=1):
        self.community = community
        self.version = version
    
    def discover_device_info(self, ip_address, port=161):
        """发现设备基本信息"""
        device_info = {}
        
        # 获取系统描述
        sys_descr = self._get_snmp_value(ip_address, port, '1.3.6.1.2.1.1.1.0')
        if sys_descr:
            device_info['description'] = sys_descr
        
        # 获取系统名称
        sys_name = self._get_snmp_value(ip_address, port, '1.3.6.1.2.1.1.5.0')
        if sys_name:
            device_info['name'] = sys_name
        
        # 获取系统位置
        sys_location = self._get_snmp_value(ip_address, port, '1.3.6.1.2.1.1.6.0')
        if sys_location:
            device_info['location'] = sys_location
        
        # 获取接口信息
        interfaces = self._get_interfaces(ip_address, port)
        device_info['interfaces'] = interfaces
        
        return device_info
    
    def _get_snmp_value(self, ip, port, oid):
        """获取SNMP值"""
        try:
            iterator = getCmd(
                SnmpEngine(),
                CommunityData(self.community, mpModel=self.version),
                UdpTransportTarget((ip, port)),
                ContextData(),
                ObjectType(ObjectIdentity(oid))
            )
            
            errorIndication, errorStatus, errorIndex, varBinds = next(iterator)
            
            if errorIndication:
                print(f"SNMP错误: {errorIndication}")
                return None
            elif errorStatus:
                print(f"SNMP状态错误: {errorStatus.prettyPrint()}")
                return None
            else:
                for varBind in varBinds:
                    return str(varBind[1])
        except Exception as e:
            print(f"SNMP查询异常: {e}")
            return None
    
    def _get_interfaces(self, ip, port):
        """获取接口信息"""
        interfaces = []
        
        # 获取接口数量
        if_number_oid = '1.3.6.1.2.1.2.1.0'
        if_number = self._get_snmp_value(ip, port, if_number_oid)
        
        if if_number:
            try:
                count = int(if_number)
                for i in range(1, count + 1):
                    # 获取接口描述
                    if_descr_oid = f'1.3.6.1.2.1.2.2.1.2.{i}'
                    if_descr = self._get_snmp_value(ip, port, if_descr_oid)
                    
                    # 获取接口状态
                    if_oper_status_oid = f'1.3.6.1.2.1.2.2.1.8.{i}'
                    if_oper_status = self._get_snmp_value(ip, port, if_oper_status_oid)
                    
                    interfaces.append({
                        'index': i,
                        'description': if_descr,
                        'status': 'up' if if_oper_status == '1' else 'down'
                    })
            except ValueError:
                pass
        
        return interfaces

# 使用示例
# discoverer = SNMPDiscoverer()
# device_info = discoverer.discover_device_info('192.168.1.1')
# print(device_info)
```

### 2. SSH（Secure Shell）

SSH协议用于安全地访问网络设备和服务器，是主机发现的重要手段。

**特点：**
- 加密传输，安全性高
- 支持命令执行和文件传输
- 广泛支持各种操作系统

**应用场景：**
- Linux/Unix服务器信息收集
- 网络设备配置信息获取
- 应用程序状态检查

**示例代码（Python）：**
```python
import paramiko
import json

class SSHDiscoverer:
    def __init__(self, username, password=None, key_file=None):
        self.username = username
        self.password = password
        self.key_file = key_file
    
    def discover_linux_host(self, hostname, port=22):
        """发现Linux主机信息"""
        host_info = {
            'hostname': hostname,
            'os_type': 'Linux'
        }
        
        try:
            # 建立SSH连接
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            if self.key_file:
                ssh.connect(hostname, port, self.username, key_filename=self.key_file)
            else:
                ssh.connect(hostname, port, self.username, self.password)
            
            # 获取系统信息
            host_info.update(self._get_system_info(ssh))
            
            # 获取硬件信息
            host_info.update(self._get_hardware_info(ssh))
            
            # 获取网络信息
            host_info.update(self._get_network_info(ssh))
            
            # 获取运行服务
            host_info['services'] = self._get_running_services(ssh)
            
            # 关闭连接
            ssh.close()
            
        except Exception as e:
            print(f"SSH发现失败 {hostname}: {e}")
            host_info['error'] = str(e)
        
        return host_info
    
    def _get_system_info(self, ssh):
        """获取系统信息"""
        system_info = {}
        
        # 获取操作系统版本
        stdin, stdout, stderr = ssh.exec_command('cat /etc/os-release')
        os_info = stdout.read().decode()
        for line in os_info.split('\n'):
            if line.startswith('NAME='):
                system_info['os_name'] = line.split('=')[1].strip('"')
            elif line.startswith('VERSION='):
                system_info['os_version'] = line.split('=')[1].strip('"')
        
        # 获取主机名
        stdin, stdout, stderr = ssh.exec_command('hostname')
        system_info['hostname'] = stdout.read().decode().strip()
        
        # 获取内核版本
        stdin, stdout, stderr = ssh.exec_command('uname -r')
        system_info['kernel_version'] = stdout.read().decode().strip()
        
        return system_info
    
    def _get_hardware_info(self, ssh):
        """获取硬件信息"""
        hardware_info = {}
        
        # 获取CPU信息
        stdin, stdout, stderr = ssh.exec_command('lscpu')
        cpu_info = stdout.read().decode()
        for line in cpu_info.split('\n'):
            if line.startswith('CPU(s):'):
                hardware_info['cpu_cores'] = int(line.split(':')[1].strip())
            elif line.startswith('Model name:'):
                hardware_info['cpu_model'] = line.split(':')[1].strip()
        
        # 获取内存信息
        stdin, stdout, stderr = ssh.exec_command('free -m')
        mem_info = stdout.read().decode()
        lines = mem_info.split('\n')
        if len(lines) > 1:
            mem_line = lines[1].split()
            if len(mem_line) > 1:
                hardware_info['memory_mb'] = int(mem_line[1])
        
        # 获取磁盘信息
        stdin, stdout, stderr = ssh.exec_command('df -h')
        disk_info = stdout.read().decode()
        hardware_info['disk_usage'] = disk_info
        
        return hardware_info
    
    def _get_network_info(self, ssh):
        """获取网络信息"""
        network_info = {}
        
        # 获取网络接口
        stdin, stdout, stderr = ssh.exec_command('ip addr show')
        network_info['interfaces'] = stdout.read().decode()
        
        # 获取路由表
        stdin, stdout, stderr = ssh.exec_command('ip route show')
        network_info['routes'] = stdout.read().decode()
        
        return network_info
    
    def _get_running_services(self, ssh):
        """获取运行服务"""
        services = []
        
        # 使用systemctl获取服务状态
        stdin, stdout, stderr = ssh.exec_command('systemctl list-units --type=service --state=running')
        service_output = stdout.read().decode()
        
        for line in service_output.split('\n')[1:]:  # 跳过标题行
            if line.strip() and not line.startswith('UNIT'):
                parts = line.split()
                if parts:
                    services.append({
                        'name': parts[0],
                        'status': 'running'
                    })
        
        return services

# 使用示例
# discoverer = SSHDiscoverer('username', 'password')
# host_info = discoverer.discover_linux_host('192.168.1.100')
# print(json.dumps(host_info, indent=2))
```

### 3. WMI（Windows Management Instrumentation）

WMI是Windows平台的管理框架，用于发现和管理Windows系统的配置信息。

**特点：**
- Windows原生支持
- 提供丰富的管理信息
- 支持远程管理

**应用场景：**
- Windows服务器信息收集
- Windows应用程序状态监控
- Windows系统配置管理

**示例代码（Python）：**
```python
import wmi

class WMIDiscoverer:
    def __init__(self, username=None, password=None):
        self.username = username
        self.password = password
    
    def discover_windows_host(self, hostname):
        """发现Windows主机信息"""
        host_info = {
            'hostname': hostname,
            'os_type': 'Windows'
        }
        
        try:
            # 建立WMI连接
            if self.username and self.password:
                conn = wmi.WMI(computer=hostname, user=self.username, password=self.password)
            else:
                conn = wmi.WMI(computer=hostname)
            
            # 获取操作系统信息
            host_info.update(self._get_os_info(conn))
            
            # 获取硬件信息
            host_info.update(self._get_hardware_info(conn))
            
            # 获取网络信息
            host_info.update(self._get_network_info(conn))
            
            # 获取运行进程
            host_info['processes'] = self._get_running_processes(conn)
            
        except Exception as e:
            print(f"WMI发现失败 {hostname}: {e}")
            host_info['error'] = str(e)
        
        return host_info
    
    def _get_os_info(self, conn):
        """获取操作系统信息"""
        os_info = {}
        
        # 获取操作系统信息
        for os in conn.Win32_OperatingSystem():
            os_info['os_name'] = os.Caption
            os_info['os_version'] = os.Version
            os_info['os_architecture'] = os.OSArchitecture
            os_info['install_date'] = os.InstallDate
            break
        
        # 获取计算机系统信息
        for cs in conn.Win32_ComputerSystem():
            os_info['manufacturer'] = cs.Manufacturer
            os_info['model'] = cs.Model
            os_info['total_physical_memory'] = int(cs.TotalPhysicalMemory) // (1024*1024)  # 转换为MB
            break
        
        return os_info
    
    def _get_hardware_info(self, conn):
        """获取硬件信息"""
        hardware_info = {}
        
        # 获取CPU信息
        cpus = []
        for cpu in conn.Win32_Processor():
            cpus.append({
                'name': cpu.Name,
                'cores': cpu.NumberOfCores,
                'threads': cpu.NumberOfLogicalProcessors
            })
        hardware_info['cpus'] = cpus
        
        # 获取磁盘信息
        disks = []
        for disk in conn.Win32_DiskDrive():
            disks.append({
                'model': disk.Model,
                'size': int(disk.Size) // (1024*1024*1024) if disk.Size else 0  # 转换为GB
            })
        hardware_info['disks'] = disks
        
        # 获取内存信息
        memory_modules = []
        for mem in conn.Win32_PhysicalMemory():
            memory_modules.append({
                'capacity': int(mem.Capacity) // (1024*1024) if mem.Capacity else 0,  # 转换为MB
                'speed': mem.Speed
            })
        hardware_info['memory_modules'] = memory_modules
        
        return hardware_info
    
    def _get_network_info(self, conn):
        """获取网络信息"""
        network_info = {}
        
        # 获取网络适配器信息
        adapters = []
        for adapter in conn.Win32_NetworkAdapterConfiguration(IPEnabled=True):
            adapters.append({
                'description': adapter.Description,
                'ip_address': adapter.IPAddress[0] if adapter.IPAddress else None,
                'subnet_mask': adapter.IPSubnet[0] if adapter.IPSubnet else None,
                'mac_address': adapter.MACAddress
            })
        network_info['network_adapters'] = adapters
        
        return network_info
    
    def _get_running_processes(self, conn):
        """获取运行进程"""
        processes = []
        
        for process in conn.Win32_Process():
            processes.append({
                'name': process.Name,
                'pid': process.ProcessId,
                'executable_path': process.ExecutablePath
            })
        
        return processes

# 使用示例
# discoverer = WMIDiscoverer('username', 'password')
# host_info = discoverer.discover_windows_host('192.168.1.101')
# print(json.dumps(host_info, indent=2))
```

### 4. HTTP/HTTPS

HTTP/HTTPS协议用于发现基于Web的服务和应用程序。

**特点：**
- 应用层协议，适用于Web服务
- 支持认证和加密
- 可以获取详细的应用信息

**应用场景：**
- Web服务器发现
- REST API服务发现
- 应用程序健康检查

**示例代码（Python）：**
```python
import requests
import json
from urllib.parse import urljoin

class HTTPDiscoverer:
    def __init__(self, timeout=10, verify_ssl=True):
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self.session = requests.Session()
    
    def discover_web_service(self, base_url, auth=None):
        """发现Web服务信息"""
        service_info = {
            'url': base_url,
            'service_type': 'web'
        }
        
        try:
            # 检查服务可达性
            response = self.session.get(
                base_url, 
                timeout=self.timeout, 
                verify=self.verify_ssl,
                auth=auth
            )
            
            service_info['status_code'] = response.status_code
            service_info['response_time'] = response.elapsed.total_seconds()
            
            # 获取服务器信息
            server_header = response.headers.get('Server')
            if server_header:
                service_info['server'] = server_header
            
            # 获取内容类型
            content_type = response.headers.get('Content-Type')
            if content_type:
                service_info['content_type'] = content_type
            
            # 尝试发现API端点
            api_endpoints = self._discover_api_endpoints(base_url, response)
            if api_endpoints:
                service_info['api_endpoints'] = api_endpoints
            
            # 尝试获取健康检查信息
            health_info = self._check_health(base_url, auth)
            if health_info:
                service_info['health'] = health_info
            
        except requests.exceptions.RequestException as e:
            service_info['error'] = str(e)
            service_info['status'] = 'unreachable'
        
        return service_info
    
    def _discover_api_endpoints(self, base_url, response):
        """发现API端点"""
        endpoints = []
        
        # 检查常见的API端点
        common_endpoints = [
            '/api',
            '/v1',
            '/v2',
            '/swagger',
            '/docs',
            '/health',
            '/status'
        ]
        
        for endpoint in common_endpoints:
            try:
                url = urljoin(base_url, endpoint)
                resp = self.session.get(
                    url, 
                    timeout=self.timeout, 
                    verify=self.verify_ssl
                )
                
                if resp.status_code == 200:
                    endpoints.append({
                        'url': url,
                        'status_code': resp.status_code,
                        'content_type': resp.headers.get('Content-Type')
                    })
            except:
                pass  # 忽略单个端点的错误
        
        return endpoints
    
    def _check_health(self, base_url, auth):
        """检查服务健康状态"""
        health_endpoints = ['/health', '/status', '/api/health']
        
        for endpoint in health_endpoints:
            try:
                url = urljoin(base_url, endpoint)
                response = self.session.get(
                    url, 
                    timeout=self.timeout, 
                    verify=self.verify_ssl,
                    auth=auth
                )
                
                if response.status_code == 200:
                    try:
                        health_data = response.json()
                        return {
                            'url': url,
                            'status': 'healthy',
                            'details': health_data
                        }
                    except:
                        return {
                            'url': url,
                            'status': 'healthy',
                            'details': response.text[:200]  # 限制文本长度
                        }
            except:
                continue  # 尝试下一个健康检查端点
        
        return None

# 使用示例
# discoverer = HTTPDiscoverer()
# service_info = discoverer.discover_web_service('http://example.com')
# print(json.dumps(service_info, indent=2))
```

## 常用发现工具

### 1. Nmap

Nmap（Network Mapper）是一个网络发现和安全审计工具。

**特点：**
- 功能强大，支持多种扫描技术
- 跨平台支持
- 开源免费

**主要功能：**
- 主机发现
- 端口扫描
- 服务版本检测
- 操作系统检测

**使用示例：**
```bash
# 基本主机发现
nmap -sn 192.168.1.0/24

# 端口扫描和服务检测
nmap -sV 192.168.1.1

# 操作系统检测
nmap -O 192.168.1.1

# 综合扫描
nmap -A 192.168.1.1
```

### 2. Ansible

Ansible是一个自动化工具，也可用于配置发现。

**特点：**
- 无代理架构
- YAML配置文件
- 强大的模块系统

**使用示例：**
```yaml
---
- name: Discover system information
  hosts: all
  gather_facts: yes
  tasks:
    - name: Display system information
      debug:
        msg: "Host {{ inventory_hostname }} is running {{ ansible_distribution }} {{ ansible_distribution_version }}"
    
    - name: Get network interfaces
      debug:
        var: ansible_interfaces
    
    - name: Get disk usage
      debug:
        var: ansible_devices
```

### 3. Zabbix

Zabbix是一个企业级监控解决方案，包含自动发现功能。

**特点：**
- 完整的监控解决方案
- 强大的自动发现能力
- 支持多种协议

**主要发现功能：**
- 网络发现
- 低级别发现（LLD）
- 自动注册

### 4. Prometheus

Prometheus是一个云原生监控系统，支持服务发现。

**特点：**
- 云原生设计
- 多种服务发现机制
- 强大的查询语言

**支持的发现机制：**
- 静态配置
- DNS发现
- Kubernetes发现
- Consul发现
- 文件发现

## 发现策略与最佳实践

### 1. 分层发现策略

```python
class LayeredDiscoveryStrategy:
    def __init__(self):
        self.discovery_layers = []
    
    def add_layer(self, layer_name, discoverer, priority=0):
        """添加发现层"""
        self.discovery_layers.append({
            'name': layer_name,
            'discoverer': discoverer,
            'priority': priority
        })
        # 按优先级排序
        self.discovery_layers.sort(key=lambda x: x['priority'], reverse=True)
    
    def discover(self, target):
        """分层发现"""
        results = {}
        
        for layer in self.discovery_layers:
            try:
                layer_result = layer['discoverer'].discover(target)
                results[layer['name']] = layer_result
                
                # 如果当前层提供了足够的信息，可以决定是否继续
                if self._should_stop_discovery(layer_result):
                    break
            except Exception as e:
                print(f"发现层 {layer['name']} 失败: {e}")
        
        return results
    
    def _should_stop_discovery(self, layer_result):
        """判断是否应该停止发现"""
        # 根据业务逻辑决定是否继续发现
        # 例如，如果获得了关键信息，可以停止
        return False

# 使用示例
# strategy = LayeredDiscoveryStrategy()
# strategy.add_layer('network', NetworkDiscoverer(), priority=10)
# strategy.add_layer('host', HostDiscoverer(), priority=20)
# results = strategy.discover('192.168.1.0/24')
```

### 2. 增量发现机制

```python
class IncrementalDiscoveryManager:
    def __init__(self, discovery_interval=3600):
        self.discovery_interval = discovery_interval
        self.last_discovery_times = {}
        self.discovery_cache = {}
    
    def should_discover(self, target):
        """判断是否应该进行发现"""
        last_time = self.last_discovery_times.get(target, 0)
        current_time = time.time()
        return (current_time - last_time) > self.discovery_interval
    
    def discover_if_needed(self, target, discoverer):
        """按需发现"""
        if self.should_discover(target):
            result = discoverer.discover(target)
            self.last_discovery_times[target] = time.time()
            self.discovery_cache[target] = result
            return result
        else:
            return self.discovery_cache.get(target)
    
    def force_discovery(self, target, discoverer):
        """强制发现"""
        result = discoverer.discover(target)
        self.last_discovery_times[target] = time.time()
        self.discovery_cache[target] = result
        return result

# 使用示例
# manager = IncrementalDiscoveryManager(discovery_interval=1800)  # 30分钟
# result = manager.discover_if_needed('192.168.1.1', SSHDiscoverer('user', 'pass'))
```

### 3. 发现结果验证

```python
class DiscoveryResultValidator:
    def __init__(self):
        self.validation_rules = []
    
    def add_validation_rule(self, rule_name, validation_function):
        """添加验证规则"""
        self.validation_rules.append({
            'name': rule_name,
            'function': validation_function
        })
    
    def validate_result(self, discovery_result):
        """验证发现结果"""
        validation_report = {
            'result': discovery_result,
            'validations': {},
            'overall_status': 'valid'
        }
        
        for rule in self.validation_rules:
            try:
                is_valid = rule['function'](discovery_result)
                validation_report['validations'][rule['name']] = is_valid
                
                if not is_valid:
                    validation_report['overall_status'] = 'invalid'
            except Exception as e:
                validation_report['validations'][rule['name']] = {
                    'error': str(e)
                }
                validation_report['overall_status'] = 'error'
        
        return validation_report

# 验证规则示例
def validate_ip_address(result):
    """验证IP地址格式"""
    import re
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    ip_address = result.get('ip_address', '')
    return bool(re.match(ip_pattern, ip_address))

def validate_required_fields(result):
    """验证必需字段"""
    required_fields = ['hostname', 'os_type']
    return all(field in result for field in required_fields)

# 使用示例
# validator = DiscoveryResultValidator()
# validator.add_validation_rule('ip_format', validate_ip_address)
# validator.add_validation_rule('required_fields', validate_required_fields)
# report = validator.validate_result(discovery_result)
```

## 安全考虑

### 1. 认证与授权

```python
class SecureDiscoveryManager:
    def __init__(self):
        self.credentials_manager = CredentialsManager()
        self.access_control = AccessControlManager()
    
    def discover_with_security(self, target, user):
        """安全发现"""
        # 检查用户权限
        if not self.access_control.can_discover(user, target):
            raise PermissionError("用户无权发现目标")
        
        # 获取凭证
        credentials = self.credentials_manager.get_credentials(target)
        if not credentials:
            raise ValueError("未找到目标凭证")
        
        # 执行发现
        discoverer = self._get_appropriate_discoverer(target, credentials)
        result = discoverer.discover(target)
        
        # 记录审计日志
        self._log_discovery_activity(user, target, result)
        
        return result
    
    def _get_appropriate_discoverer(self, target, credentials):
        """获取合适的发现器"""
        # 根据目标类型和凭证类型选择发现器
        if target.startswith('http'):
            return HTTPDiscoverer()
        elif credentials.get('type') == 'ssh':
            return SSHDiscoverer(
                credentials['username'], 
                credentials['password']
            )
        # 其他类型的发现器...
```

### 2. 数据加密

```python
class EncryptedDiscoveryData:
    def __init__(self, encryption_key):
        self.encryption_key = encryption_key
    
    def encrypt_sensitive_data(self, discovery_result):
        """加密敏感数据"""
        sensitive_fields = ['password', 'api_key', 'private_key', 'credentials']
        
        encrypted_result = discovery_result.copy()
        for field in sensitive_fields:
            if field in encrypted_result:
                encrypted_result[field] = self._encrypt(encrypted_result[field])
        
        return encrypted_result
    
    def _encrypt(self, data):
        """加密数据"""
        # 实现具体的加密逻辑
        # 这里简化处理
        import base64
        return base64.b64encode(str(data).encode()).decode()
```

## 性能优化

### 1. 并行发现

```python
import concurrent.futures
import threading

class ParallelDiscoveryManager:
    def __init__(self, max_workers=10):
        self.max_workers = max_workers
        self.discovery_lock = threading.Lock()
    
    def discover_multiple_targets(self, targets, discoverer_factory):
        """并行发现多个目标"""
        results = {}
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # 提交所有发现任务
            future_to_target = {
                executor.submit(self._discover_single_target, target, discoverer_factory): target
                for target in targets
            }
            
            # 收集结果
            for future in concurrent.futures.as_completed(future_to_target):
                target = future_to_target[future]
                try:
                    result = future.result()
                    results[target] = result
                except Exception as e:
                    print(f"发现目标 {target} 失败: {e}")
                    results[target] = {'error': str(e)}
        
        return results
    
    def _discover_single_target(self, target, discoverer_factory):
        """发现单个目标"""
        discoverer = discoverer_factory.create_discoverer(target)
        return discoverer.discover(target)

# 使用示例
# manager = ParallelDiscoveryManager(max_workers=20)
# targets = ['192.168.1.1', '192.168.1.2', ...]
# results = manager.discover_multiple_targets(targets, DiscovererFactory())
```

### 2. 缓存机制

```python
import time
import hashlib

class DiscoveryCache:
    def __init__(self, ttl=3600):
        self.ttl = ttl
        self.cache = {}
        self.cache_lock = threading.Lock()
    
    def get(self, key):
        """获取缓存数据"""
        with self.cache_lock:
            if key in self.cache:
                data, timestamp = self.cache[key]
                if time.time() - timestamp < self.ttl:
                    return data
                else:
                    del self.cache[key]
            return None
    
    def set(self, key, data):
        """设置缓存数据"""
        with self.cache_lock:
            self.cache[key] = (data, time.time())
    
    def generate_key(self, target, discovery_type):
        """生成缓存键"""
        key_string = f"{target}:{discovery_type}"
        return hashlib.md5(key_string.encode()).hexdigest()

# 使用示例
# cache = DiscoveryCache(ttl=1800)  # 30分钟缓存
# cache_key = cache.generate_key('192.168.1.1', 'ssh')
# cached_data = cache.get(cache_key)
```

## 总结

自动发现是CMDB系统的核心功能，通过合理选择和组合不同的发现协议与工具，可以构建高效的自动发现体系。在实施过程中需要注意：

1. **协议选择**：根据目标环境选择合适的发现协议
2. **工具集成**：合理集成多种发现工具
3. **安全考虑**：确保发现过程的安全性
4. **性能优化**：通过并行处理和缓存机制提升发现效率
5. **结果验证**：对发现结果进行验证以确保数据质量

通过建立完善的自动发现体系，CMDB系统能够持续获取准确的配置信息，为企业的IT运维提供坚实的数据基础。