---
title: "附录B: 常用自动发现工具与协议"
date: 2025-09-07
categories: [CMDB]
tags: [cmdb, auto-discovery, tools, protocols,自动发现]
published: true
---
自动发现是配置管理数据库（CMDB）数据准确性的关键保障。通过各种工具和协议，系统能够自动识别和收集IT环境中的配置项信息。本文档详细介绍了常用的自动发现工具与协议，为CMDB的自动发现实现提供参考。

## 自动发现概述

### 发现方式分类

自动发现技术主要可以分为以下几类：

```python
class DiscoveryMethods:
    def __init__(self):
        self.methods = {
            'active_discovery': {
                'description': '主动发现',
                'characteristics': [
                    '系统主动向目标发送探测请求',
                    '能够发现详细配置信息',
                    '对目标系统有一定负载影响',
                    '发现准确性高'
                ],
                'examples': ['网络端口扫描', 'SNMP轮询', 'WMI查询']
            },
            'passive_discovery': {
                'description': '被动发现',
                'characteristics': [
                    '通过监听网络流量发现设备',
                    '对目标系统影响小',
                    '发现信息相对有限',
                    '适合持续监控'
                ],
                'examples': ['NetFlow分析', '网络流量监听', '日志分析']
            },
            'agent_based_discovery': {
                'description': '基于代理的发现',
                'characteristics': [
                    '在目标系统安装代理程序',
                    '能够获取详细和实时信息',
                    '需要部署和维护代理',
                    '资源消耗相对较高'
                ],
                'examples': ['Zabbix Agent', 'Prometheus Node Exporter', 'SCOM Agent']
            },
            'api_based_discovery': {
                'description': '基于API的发现',
                'characteristics': [
                    '通过系统提供的API获取信息',
                    '数据准确性高',
                    '依赖系统API的完善程度',
                    '适合云环境和现代系统'
                ],
                'examples': ['AWS API', 'Kubernetes API', 'vCenter API']
            }
        }
    
    def get_method_details(self, method_name):
        """获取发现方式详情"""
        return self.methods.get(method_name, {})
    
    def compare_methods(self):
        """比较不同发现方式"""
        comparison = "自动发现方式对比\n"
        comparison += "=" * 20 + "\n\n"
        
        for name, details in self.methods.items():
            comparison += f"{details['description']}\n"
            comparison += "-" * len(details['description']) + "\n"
            comparison += "特点:\n"
            for char in details['characteristics']:
                comparison += f"  • {char}\n"
            comparison += f"示例: {', '.join(details['examples'])}\n\n"
        
        return comparison

# 展示发现方式对比
discovery_methods = DiscoveryMethods()
print(discovery_methods.compare_methods())
```

### 发现层次结构

自动发现通常按照层次结构进行：

1. **网络层发现**：发现网络中的设备和连接关系
2. **系统层发现**：发现服务器、操作系统等基础信息
3. **应用层发现**：发现运行的应用程序和服务
4. **业务层发现**：发现业务服务和依赖关系

## 网络发现协议与工具

### SNMP (Simple Network Management Protocol)

SNMP是最常用的网络设备发现协议：

```python
class SNMPDiscovery:
    def __init__(self):
        self.versions = {
            'SNMPv1': {
                'security': 'Community String (明文)',
                'port': 161,
                'features': ['基本MIB支持', '简单易用'],
                'limitations': ['安全性差', '功能有限']
            },
            'SNMPv2c': {
                'security': 'Community String (明文)',
                'port': 161,
                'features': ['批量操作', '64位计数器', '增强错误处理'],
                'limitations': ['安全性仍不足']
            },
            'SNMPv3': {
                'security': '用户名/密码认证 + 加密',
                'port': 161,
                'features': ['强认证', '数据加密', '访问控制'],
                'limitations': ['配置复杂']
            }
        }
    
    def get_version_details(self, version):
        """获取SNMP版本详情"""
        return self.versions.get(version, {})
    
    def snmp_walk_example(self):
        """SNMP Walk示例"""
        example = """
# 使用snmpwalk获取系统信息
snmpwalk -v2c -c public 192.168.1.1 system

# 输出示例:
SNMPv2-MIB::sysDescr.0 = STRING: Cisco IOS Software, C2960 Software
SNMPv2-MIB::sysObjectID.0 = OID: SNMPv2-SMI::enterprises.9.1.1234
SNMPv2-MIB::sysUpTime.0 = Timeticks: (12345678) 1 day, 10:17:36.78
SNMPv2-MIB::sysContact.0 = STRING: admin@example.com
SNMPv2-MIB::sysName.0 = STRING: core-switch-01
SNMPv2-MIB::sysLocation.0 = STRING: Data Center A
        """
        return example
    
    def mib_browser_example(self):
        """MIB浏览器示例"""
        example = """
常用MIB库:
- IF-MIB: 网络接口信息
- IP-MIB: IP地址和路由信息
- TCP-MIB: TCP连接信息
- UDP-MIB: UDP连接信息
- HOST-RESOURCES-MIB: 主机资源信息
- ENTITY-MIB: 设备实体信息
        """
        return example

# SNMP发现示例
snmp_discovery = SNMPDiscovery()
print("SNMP版本对比:")
for version, details in snmp_discovery.versions.items():
    print(f"\n{version}:")
    print(f"  安全性: {details['security']}")
    print(f"  端口: {details['port']}")
    print("  特点:")
    for feature in details['features']:
        print(f"    • {feature}")
    print("  限制:")
    for limitation in details['limitations']:
        print(f"    • {limitation}")

print("\nSNMP Walk示例:")
print(snmp_discovery.snmp_walk_example())
```

### ICMP (Internet Control Message Protocol)

ICMP主要用于网络连通性检测：

```python
import subprocess
import platform
from datetime import datetime

class ICMPDiscovery:
    def __init__(self):
        self.ping_params = {
            'windows': ['-n', '1', '-w', '1000'],  # 1次ping，1秒超时
            'linux': ['-c', '1', '-W', '1'],       # 1次ping，1秒超时
            'darwin': ['-c', '1', '-W', '1']       # macOS
        }
    
    def ping_host(self, host):
        """Ping主机"""
        system = platform.system().lower()
        params = self.ping_params.get(system, self.ping_params['linux'])
        
        try:
            # 构建ping命令
            command = ['ping'] + params + [host]
            result = subprocess.run(command, capture_output=True, text=True, timeout=5)
            
            # 分析结果
            if result.returncode == 0:
                # 提取延迟信息
                output = result.stdout
                if 'time=' in output:
                    time_str = output.split('time=')[-1].split('ms')[0]
                    try:
                        delay = float(time_str)
                        return {
                            'status': 'reachable',
                            'delay_ms': delay,
                            'timestamp': datetime.now().isoformat()
                        }
                    except ValueError:
                        return {
                            'status': 'reachable',
                            'delay_ms': None,
                            'timestamp': datetime.now().isoformat()
                        }
                else:
                    return {
                        'status': 'reachable',
                        'delay_ms': None,
                        'timestamp': datetime.now().isoformat()
                    }
            else:
                return {
                    'status': 'unreachable',
                    'error': result.stderr,
                    'timestamp': datetime.now().isoformat()
                }
        except subprocess.TimeoutExpired:
            return {
                'status': 'timeout',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def network_scan(self, network_base, start_ip=1, end_ip=254):
        """网络扫描"""
        reachable_hosts = []
        unreachable_hosts = []
        
        for i in range(start_ip, end_ip + 1):
            host = f"{network_base}.{i}"
            result = self.ping_host(host)
            
            if result['status'] == 'reachable':
                reachable_hosts.append({
                    'ip': host,
                    'delay_ms': result['delay_ms']
                })
            else:
                unreachable_hosts.append({
                    'ip': host,
                    'status': result['status']
                })
        
        return {
            'reachable': reachable_hosts,
            'unreachable': unreachable_hosts,
            'scan_time': datetime.now().isoformat()
        }

# ICMP发现示例
icmp_discovery = ICMPDiscovery()

# Ping单个主机示例
print("ICMP发现示例:")
result = icmp_discovery.ping_host('8.8.8.8')
print(f"Google DNS (8.8.8.8) 状态: {result['status']}")
if result['delay_ms']:
    print(f"延迟: {result['delay_ms']} ms")

# 网络扫描示例 (注释掉以避免实际网络扫描)
# scan_result = icmp_discovery.network_scan('192.168.1')
# print(f"发现 {len(scan_result['reachable'])} 个可达主机")
```

### ARP (Address Resolution Protocol)

ARP用于发现同一局域网内的设备：

```python
import subprocess
import re
from datetime import datetime

class ARPDiscovery:
    def __init__(self):
        pass
    
    def get_arp_table(self):
        """获取ARP表"""
        try:
            if platform.system().lower() == 'windows':
                result = subprocess.run(['arp', '-a'], capture_output=True, text=True)
            else:
                result = subprocess.run(['arp', '-n'], capture_output=True, text=True)
            
            if result.returncode == 0:
                return self.parse_arp_output(result.stdout)
            else:
                return {'error': 'Failed to get ARP table'}
        except Exception as e:
            return {'error': str(e)}
    
    def parse_arp_output(self, output):
        """解析ARP输出"""
        entries = []
        
        # 针对不同操作系统的ARP输出格式进行解析
        if platform.system().lower() == 'windows':
            # Windows格式解析
            lines = output.split('\n')
            for line in lines:
                # 匹配IP地址和MAC地址
                match = re.search(r'(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F\-]+)', line)
                if match:
                    ip = match.group(1)
                    mac = match.group(2).replace('-', ':')
                    entries.append({
                        'ip_address': ip,
                        'mac_address': mac,
                        'discovered_at': datetime.now().isoformat()
                    })
        else:
            # Linux/macOS格式解析
            lines = output.split('\n')
            for line in lines:
                # 匹配IP地址和MAC地址
                match = re.search(r'(\d+\.\d+\.\d+\.\d+).*?([0-9a-fA-F:]{17})', line)
                if match:
                    ip = match.group(1)
                    mac = match.group(2)
                    entries.append({
                        'ip_address': ip,
                        'mac_address': mac,
                        'discovered_at': datetime.now().isoformat()
                    })
        
        return {
            'entries': entries,
            'count': len(entries),
            'timestamp': datetime.now().isoformat()
        }
    
    def identify_device_type(self, mac_address):
        """根据MAC地址识别设备类型"""
        # MAC地址前缀到厂商的映射 (部分示例)
        vendor_map = {
            '00:50:56': 'VMware',
            '00:0C:29': 'VMware',
            '00:1C:42': 'Parallels',
            '00:16:3E': 'XenSource',
            '00:05:69': 'VMware',
            '00:1B:21': 'Intel',
            '00:1E:68': 'Intel',
            '00:21:5A': 'Intel',
            '00:25:64': 'Intel',
            '00:1A:A0': 'Dell',
            '00:1E:4F': 'Dell',
            '00:21:9B': 'Dell',
            '00:24:E8': 'Dell',
            '00:0A:F7': 'Cisco',
            '00:1A:6C': 'Cisco',
            '00:1B:D6': 'Cisco',
            '00:1D:A2': 'Cisco',
            '00:22:55': 'Cisco'
        }
        
        # 提取MAC地址前缀
        prefix = ':'.join(mac_address.split(':')[:3]).upper()
        return vendor_map.get(prefix, 'Unknown')

# ARP发现示例
arp_discovery = ARPDiscovery()

print("ARP发现示例:")
arp_table = arp_discovery.get_arp_table()

if 'error' not in arp_table:
    print(f"发现 {arp_table['count']} 个ARP条目:")
    for entry in arp_table['entries'][:5]:  # 只显示前5个
        vendor = arp_discovery.identify_device_type(entry['mac_address'])
        print(f"  IP: {entry['ip_address']}, MAC: {entry['mac_address']}, 厂商: {vendor}")
else:
    print(f"获取ARP表失败: {arp_table['error']}")
```

## 系统发现协议与工具

### SSH (Secure Shell)

SSH是Linux/Unix系统远程管理的标准协议：

```python
import paramiko
import json
from datetime import datetime

class SSHDiscovery:
    def __init__(self):
        self.ssh_clients = {}
    
    def connect_and_discover(self, host, username, password=None, key_file=None, port=22):
        """通过SSH连接并发现系统信息"""
        try:
            # 创建SSH客户端
            ssh_client = paramiko.SSHClient()
            ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # 连接
            if key_file:
                ssh_client.connect(host, port=port, username=username, key_filename=key_file)
            else:
                ssh_client.connect(host, port=port, username=username, password=password)
            
            # 存储客户端
            self.ssh_clients[host] = ssh_client
            
            # 执行发现命令
            system_info = self.discover_system_info(ssh_client)
            hardware_info = self.discover_hardware_info(ssh_client)
            network_info = self.discover_network_info(ssh_client)
            
            # 关闭连接
            ssh_client.close()
            del self.ssh_clients[host]
            
            return {
                'host': host,
                'system_info': system_info,
                'hardware_info': hardware_info,
                'network_info': network_info,
                'discovered_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'host': host,
                'error': str(e),
                'discovered_at': datetime.now().isoformat()
            }
    
    def execute_command(self, ssh_client, command):
        """执行SSH命令"""
        try:
            stdin, stdout, stderr = ssh_client.exec_command(command)
            output = stdout.read().decode('utf-8').strip()
            error = stderr.read().decode('utf-8').strip()
            
            if error:
                return {'output': output, 'error': error}
            else:
                return {'output': output}
        except Exception as e:
            return {'error': str(e)}
    
    def discover_system_info(self, ssh_client):
        """发现系统信息"""
        system_info = {}
        
        # 操作系统信息
        os_info = self.execute_command(ssh_client, 'cat /etc/os-release')
        if 'output' in os_info:
            for line in os_info['output'].split('\n'):
                if '=' in line:
                    key, value = line.split('=', 1)
                    system_info[key] = value.strip('"')
        
        # 内核版本
        kernel_info = self.execute_command(ssh_client, 'uname -r')
        if 'output' in kernel_info:
            system_info['kernel_version'] = kernel_info['output']
        
        # 主机名
        hostname_info = self.execute_command(ssh_client, 'hostname')
        if 'output' in hostname_info:
            system_info['hostname'] = hostname_info['output']
        
        # 系统架构
        arch_info = self.execute_command(ssh_client, 'uname -m')
        if 'output' in arch_info:
            system_info['architecture'] = arch_info['output']
        
        # 启动时间
        uptime_info = self.execute_command(ssh_client, 'uptime -s')
        if 'output' in uptime_info:
            system_info['boot_time'] = uptime_info['output']
        
        return system_info
    
    def discover_hardware_info(self, ssh_client):
        """发现硬件信息"""
        hardware_info = {}
        
        # CPU信息
        cpu_info = self.execute_command(ssh_client, 'lscpu')
        if 'output' in cpu_info:
            for line in cpu_info['output'].split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    if 'CPU(s)' in key:
                        hardware_info['cpu_cores'] = int(value.strip())
                    elif 'Model name' in key:
                        hardware_info['cpu_model'] = value.strip()
        
        # 内存信息
        mem_info = self.execute_command(ssh_client, 'free -m')
        if 'output' in mem_info:
            lines = mem_info['output'].split('\n')
            if len(lines) > 1:
                mem_values = lines[1].split()
                if len(mem_values) > 1:
                    hardware_info['memory_total_mb'] = int(mem_values[1])
        
        # 磁盘信息
        disk_info = self.execute_command(ssh_client, 'df -h /')
        if 'output' in disk_info:
            lines = disk_info['output'].split('\n')
            if len(lines) > 1:
                disk_values = lines[1].split()
                if len(disk_values) > 1:
                    hardware_info['disk_total'] = disk_values[1]
                    hardware_info['disk_used'] = disk_values[2]
                    hardware_info['disk_available'] = disk_values[3]
        
        return hardware_info
    
    def discover_network_info(self, ssh_client):
        """发现网络信息"""
        network_info = {}
        
        # 网络接口信息
        interface_info = self.execute_command(ssh_client, 'ip addr show')
        if 'output' in interface_info:
            interfaces = []
            current_interface = {}
            
            for line in interface_info['output'].split('\n'):
                if line.startswith(' '):
                    continue
                if line and not line.startswith(' '):
                    if current_interface:
                        interfaces.append(current_interface)
                    current_interface = {}
                    
                    # 解析接口名称
                    parts = line.split(':')
                    if len(parts) > 1:
                        current_interface['name'] = parts[1].strip().split('@')[0]
                elif 'inet ' in line:
                    if 'ip_addresses' not in current_interface:
                        current_interface['ip_addresses'] = []
                    ip_part = line.split('inet ')[1].split('/')[0]
                    current_interface['ip_addresses'].append(ip_part)
            
            if current_interface:
                interfaces.append(current_interface)
            
            network_info['interfaces'] = interfaces
        
        # 默认网关
        gateway_info = self.execute_command(ssh_client, 'ip route | grep default')
        if 'output' in gateway_info:
            parts = gateway_info['output'].split()
            if 'via' in parts:
                gateway_index = parts.index('via') + 1
                if gateway_index < len(parts):
                    network_info['default_gateway'] = parts[gateway_index]
        
        return network_info

# SSH发现示例 (注释掉以避免实际连接)
# ssh_discovery = SSHDiscovery()
# 
# # 示例连接参数 (请替换为实际参数)
# result = ssh_discovery.connect_and_discover(
#     host='192.168.1.100',
#     username='admin',
#     password='password'
# )
# 
# print("SSH发现结果:")
# print(json.dumps(result, indent=2, ensure_ascii=False))
```

### WMI (Windows Management Instrumentation)

WMI是Windows系统的管理框架：

```python
class WMIDiscovery:
    def __init__(self):
        pass
    
    def wmi_queries(self):
        """常用的WMI查询"""
        queries = {
            'operating_system': {
                'query': 'SELECT * FROM Win32_OperatingSystem',
                'description': '获取操作系统信息',
                'key_fields': ['Caption', 'Version', 'BuildNumber', 'TotalVisibleMemorySize']
            },
            'computer_system': {
                'query': 'SELECT * FROM Win32_ComputerSystem',
                'description': '获取计算机系统信息',
                'key_fields': ['Name', 'Manufacturer', 'Model', 'NumberOfProcessors', 'TotalPhysicalMemory']
            },
            'processor': {
                'query': 'SELECT * FROM Win32_Processor',
                'description': '获取处理器信息',
                'key_fields': ['Name', 'NumberOfCores', 'NumberOfLogicalProcessors', 'MaxClockSpeed']
            },
            'logical_disk': {
                'query': 'SELECT * FROM Win32_LogicalDisk WHERE DriveType=3',
                'description': '获取磁盘信息',
                'key_fields': ['DeviceID', 'Size', 'FreeSpace', 'FileSystem']
            },
            'network_adapter': {
                'query': 'SELECT * FROM Win32_NetworkAdapter WHERE NetEnabled=True',
                'description': '获取网络适配器信息',
                'key_fields': ['Name', 'AdapterType', 'MACAddress', 'Speed']
            },
            'network_adapter_config': {
                'query': 'SELECT * FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled=True',
                'description': '获取网络配置信息',
                'key_fields': ['IPAddress', 'IPSubnet', 'DefaultIPGateway', 'DNSServerSearchOrder']
            },
            'service': {
                'query': 'SELECT * FROM Win32_Service',
                'description': '获取服务信息',
                'key_fields': ['Name', 'State', 'StartMode', 'PathName']
            },
            'process': {
                'query': 'SELECT * FROM Win32_Process',
                'description': '获取进程信息',
                'key_fields': ['Name', 'ProcessId', 'ExecutablePath', 'CommandLine']
            }
        }
        return queries
    
    def powershell_examples(self):
        """PowerShell发现示例"""
        examples = """
# 获取操作系统信息
Get-WmiObject -Class Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber

# 获取计算机系统信息
Get-WmiObject -Class Win32_ComputerSystem | Select-Object Name, Manufacturer, Model

# 获取处理器信息
Get-WmiObject -Class Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed

# 获取磁盘信息
Get-WmiObject -Class Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID, Size, FreeSpace

# 获取网络适配器信息
Get-WmiObject -Class Win32_NetworkAdapter -Filter "NetEnabled=True" | Select-Object Name, MACAddress

# 获取网络配置信息
Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" | Select-Object IPAddress, IPSubnet

# 获取服务信息
Get-WmiObject -Class Win32_Service -Filter "State='Running'" | Select-Object Name, State

# 获取进程信息
Get-WmiObject -Class Win32_Process | Select-Object Name, ProcessId
        """
        return examples
    
    def wmic_examples(self):
        """WMIC命令示例"""
        examples = """
# 获取操作系统信息
wmic os get Caption,Version,BuildNumber /format:list

# 获取计算机系统信息
wmic computersystem get Name,Manufacturer,Model /format:list

# 获取处理器信息
wmic cpu get Name,NumberOfCores,MaxClockSpeed /format:list

# 获取磁盘信息
wmic logicaldisk where "DriveType=3" get DeviceID,Size,FreeSpace /format:list

# 获取网络适配器信息
wmic nic where "NetEnabled=True" get Name,MACAddress /format:list

# 获取服务信息
wmic service where "State='Running'" get Name,State /format:list

# 获取进程信息
wmic process get Name,ProcessId /format:list
        """
        return examples

# WMI发现示例
wmi_discovery = WMIDiscovery()

print("WMI查询示例:")
queries = wmi_discovery.wmi_queries()
for name, query_info in queries.items():
    print(f"\n{name}:")
    print(f"  描述: {query_info['description']}")
    print(f"  查询: {query_info['query']}")
    print(f"  关键字段: {', '.join(query_info['key_fields'])}")

print("\nPowerShell示例:")
print(wmi_discovery.powershell_examples())

print("\nWMIC示例:")
print(wmi_discovery.wmic_examples())
```

## 应用发现工具与方法

### 端口扫描工具

端口扫描是发现运行服务的重要手段：

```python
import socket
from concurrent.futures import ThreadPoolExecutor
import threading

class PortScanner:
    def __init__(self):
        self.open_ports = []
        self.lock = threading.Lock()
    
    def scan_port(self, host, port, timeout=1):
        """扫描单个端口"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                with self.lock:
                    self.open_ports.append(port)
                return True
            return False
        except Exception:
            return False
    
    def scan_ports(self, host, ports, max_threads=100):
        """扫描多个端口"""
        self.open_ports = []
        
        with ThreadPoolExecutor(max_workers=max_threads) as executor:
            futures = [executor.submit(self.scan_port, host, port) for port in ports]
            # 等待所有任务完成
            for future in futures:
                future.result()
        
        return sorted(self.open_ports)
    
    def service_identification(self, host, port):
        """服务识别"""
        service_map = {
            21: 'FTP',
            22: 'SSH',
            23: 'Telnet',
            25: 'SMTP',
            53: 'DNS',
            80: 'HTTP',
            110: 'POP3',
            143: 'IMAP',
            443: 'HTTPS',
            3306: 'MySQL',
            5432: 'PostgreSQL',
            6379: 'Redis',
            9200: 'Elasticsearch',
            27017: 'MongoDB'
        }
        
        return service_map.get(port, 'Unknown')
    
    def comprehensive_scan(self, host, port_range=(1, 1000)):
        """综合扫描"""
        print(f"开始扫描主机 {host} 的端口 {port_range[0]}-{port_range[1]}")
        
        # 生成端口列表
        ports = list(range(port_range[0], port_range[1] + 1))
        
        # 扫描端口
        open_ports = self.scan_ports(host, ports)
        
        # 识别服务
        services = []
        for port in open_ports:
            service = self.service_identification(host, port)
            services.append({
                'port': port,
                'service': service
            })
        
        return {
            'host': host,
            'open_ports': open_ports,
            'services': services,
            'scan_time': datetime.now().isoformat()
        }

# 端口扫描示例 (注释掉以避免实际扫描)
# scanner = PortScanner()
# 
# # 扫描常见端口
# result = scanner.comprehensive_scan('127.0.0.1', (80, 443))
# print("端口扫描结果:")
# print(f"开放端口: {result['open_ports']}")
# for service in result['services']:
#     print(f"  端口 {service['port']}: {service['service']}")
```

### 进程和服务发现

发现系统中运行的进程和服务：

```python
import psutil
import platform
from datetime import datetime

class ProcessServiceDiscovery:
    def __init__(self):
        pass
    
    def discover_processes(self):
        """发现进程信息"""
        processes = []
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'username', 'memory_info', 'cpu_percent']):
                try:
                    process_info = proc.info
                    processes.append({
                        'pid': process_info['pid'],
                        'name': process_info['name'],
                        'username': process_info['username'],
                        'memory_mb': round(process_info['memory_info'].rss / 1024 / 1024, 2) if process_info['memory_info'] else 0,
                        'cpu_percent': round(process_info['cpu_percent'], 2),
                        'discovered_at': datetime.now().isoformat()
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    # 忽略无法访问的进程
                    pass
        except Exception as e:
            return {'error': str(e)}
        
        return {
            'processes': processes,
            'total_processes': len(processes),
            'discovered_at': datetime.now().isoformat()
        }
    
    def discover_services(self):
        """发现服务信息"""
        services = []
        
        try:
            if platform.system().lower() == 'windows':
                # Windows服务发现
                import win32serviceutil
                import win32service
                
                # 这里简化处理，实际应用中需要更复杂的实现
                services = [{'platform': 'windows', 'note': '需要pywin32库支持'}]
            else:
                # Linux服务发现 (systemd)
                import subprocess
                result = subprocess.run(['systemctl', 'list-units', '--type=service', '--state=running'], 
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    lines = result.stdout.split('\n')[1:]  # 跳过标题行
                    for line in lines:
                        if line.strip() and not line.startswith('UNIT'):
                            parts = line.split()
                            if len(parts) >= 4:
                                services.append({
                                    'name': parts[0],
                                    'state': parts[3],
                                    'type': 'systemd'
                                })
        except Exception as e:
            return {'error': str(e)}
        
        return {
            'services': services,
            'total_services': len(services),
            'discovered_at': datetime.now().isoformat()
        }
    
    def identify_applications(self, processes):
        """识别应用程序"""
        app_signatures = {
            'web_server': ['nginx', 'apache', 'httpd', 'iis'],
            'database': ['mysql', 'postgres', 'mongodb', 'redis', 'elasticsearch'],
            'application_server': ['java', 'tomcat', 'jboss', 'weblogic', 'websphere'],
            'container': ['docker', 'kubelet', 'containerd'],
            'monitoring': ['zabbix', 'prometheus', 'telegraf', 'collectd'],
            'cache': ['redis', 'memcached'],
            'message_queue': ['rabbitmq', 'kafka', 'activemq']
        }
        
        identified_apps = {}
        
        for process in processes:
            process_name = process['name'].lower()
            
            for app_type, signatures in app_signatures.items():
                for signature in signatures:
                    if signature in process_name:
                        if app_type not in identified_apps:
                            identified_apps[app_type] = []
                        identified_apps[app_type].append(process)
        
        return identified_apps

# 进程服务发现示例
process_discovery = ProcessServiceDiscovery()

print("进程发现示例:")
processes_result = process_discovery.discover_processes()

if 'error' not in processes_result:
    print(f"发现 {processes_result['total_processes']} 个进程")
    # 显示前5个进程
    for proc in processes_result['processes'][:5]:
        print(f"  PID: {proc['pid']}, 名称: {proc['name']}, 内存: {proc['memory_mb']}MB, CPU: {proc['cpu_percent']}%")
    
    # 识别应用程序
    print("\n识别的应用程序:")
    apps = process_discovery.identify_applications(processes_result['processes'])
    for app_type, app_processes in apps.items():
        print(f"  {app_type}: {len(app_processes)} 个进程")
        for proc in app_processes[:3]:  # 显示每个类型前3个
            print(f"    - {proc['name']} (PID: {proc['pid']})")
else:
    print(f"进程发现失败: {processes_result['error']}")

print("\n服务发现示例:")
services_result = process_discovery.discover_services()

if 'error' not in services_result:
    print(f"发现 {services_result['total_services']} 个服务")
    # 显示前5个服务
    for service in services_result['services'][:5]:
        print(f"  名称: {service.get('name', 'N/A')}, 状态: {service.get('state', 'N/A')}")
else:
    print(f"服务发现失败: {services_result['error']}")
```

## 云平台API发现

### AWS发现

通过AWS API发现云资源：

```python
import boto3
from datetime import datetime

class AWSDiscovery:
    def __init__(self, access_key=None, secret_key=None, region='us-east-1'):
        """初始化AWS客户端"""
        try:
            if access_key and secret_key:
                self.ec2_client = boto3.client('ec2', 
                                             aws_access_key_id=access_key,
                                             aws_secret_access_key=secret_key,
                                             region_name=region)
                self.rds_client = boto3.client('rds',
                                             aws_access_key_id=access_key,
                                             aws_secret_access_key=secret_key,
                                             region_name=region)
            else:
                # 使用默认凭证（如IAM角色）
                self.ec2_client = boto3.client('ec2', region_name=region)
                self.rds_client = boto3.client('rds', region_name=region)
        except Exception as e:
            self.ec2_client = None
            self.rds_client = None
            print(f"AWS客户端初始化失败: {e}")
    
    def discover_ec2_instances(self):
        """发现EC2实例"""
        if not self.ec2_client:
            return {'error': 'AWS客户端未初始化'}
        
        try:
            response = self.ec2_client.describe_instances()
            instances = []
            
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    instance_info = {
                        'instance_id': instance['InstanceId'],
                        'instance_type': instance['InstanceType'],
                        'state': instance['State']['Name'],
                        'launch_time': instance['LaunchTime'].isoformat(),
                        'availability_zone': instance['Placement']['AvailabilityZone'],
                        'vpc_id': instance.get('VpcId', 'N/A'),
                        'subnet_id': instance.get('SubnetId', 'N/A'),
                        'private_ip': instance.get('PrivateIpAddress', 'N/A'),
                        'public_ip': instance.get('PublicIpAddress', 'N/A'),
                        'key_name': instance.get('KeyName', 'N/A'),
                        'security_groups': [sg['GroupName'] for sg in instance.get('SecurityGroups', [])],
                        'tags': {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
                    }
                    instances.append(instance_info)
            
            return {
                'instances': instances,
                'count': len(instances),
                'discovered_at': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def discover_rds_instances(self):
        """发现RDS实例"""
        if not self.rds_client:
            return {'error': 'AWS客户端未初始化'}
        
        try:
            response = self.rds_client.describe_db_instances()
            instances = []
            
            for db_instance in response['DBInstances']:
                instance_info = {
                    'db_instance_identifier': db_instance['DBInstanceIdentifier'],
                    'db_instance_class': db_instance['DBInstanceClass'],
                    'engine': db_instance['Engine'],
                    'engine_version': db_instance['EngineVersion'],
                    'db_instance_status': db_instance['DBInstanceStatus'],
                    'allocated_storage': db_instance['AllocatedStorage'],
                    'endpoint': db_instance.get('Endpoint', {}),
                    'availability_zone': db_instance.get('AvailabilityZone', 'N/A'),
                    'multi_az': db_instance.get('MultiAZ', False),
                    'publicly_accessible': db_instance.get('PubliclyAccessible', False),
                    'storage_type': db_instance.get('StorageType', 'N/A'),
                    'backup_retention_period': db_instance.get('BackupRetentionPeriod', 0),
                    'tags': {tag['Key']: tag['Value'] for tag in db_instance.get('TagList', [])}
                }
                instances.append(instance_info)
            
            return {
                'instances': instances,
                'count': len(instances),
                'discovered_at': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def discover_vpcs(self):
        """发现VPC"""
        if not self.ec2_client:
            return {'error': 'AWS客户端未初始化'}
        
        try:
            response = self.ec2_client.describe_vpcs()
            vpcs = []
            
            for vpc in response['Vpcs']:
                vpc_info = {
                    'vpc_id': vpc['VpcId'],
                    'state': vpc['State'],
                    'cidr_block': vpc['CidrBlock'],
                    'is_default': vpc.get('IsDefault', False),
                    'tags': {tag['Key']: tag['Value'] for tag in vpc.get('Tags', [])},
                    'instance_tenancy': vpc.get('InstanceTenancy', 'default')
                }
                vpcs.append(vpc_info)
            
            return {
                'vpcs': vpcs,
                'count': len(vpcs),
                'discovered_at': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': str(e)}

# AWS发现示例 (注释掉以避免实际调用)
# aws_discovery = AWSDiscovery()
# 
# print("AWS发现示例:")
# ec2_result = aws_discovery.discover_ec2_instances()
# if 'error' not in ec2_result:
#     print(f"发现 {ec2_result['count']} 个EC2实例")
#     for instance in ec2_result['instances'][:2]:
#         print(f"  实例ID: {instance['instance_id']}")
#         print(f"    类型: {instance['instance_type']}")
#         print(f"    状态: {instance['state']}")
#         print(f"    私有IP: {instance['private_ip']}")
# else:
#     print(f"EC2发现失败: {ec2_result['error']}")
```

### Kubernetes发现

通过Kubernetes API发现资源：

```python
from kubernetes import client, config
from datetime import datetime

class KubernetesDiscovery:
    def __init__(self, kubeconfig_path=None):
        """初始化Kubernetes客户端"""
        try:
            if kubeconfig_path:
                config.load_kube_config(kubeconfig_path)
            else:
                # 尝试加载默认配置
                config.load_incluster_config()  # 在集群内运行时
        except:
            try:
                config.load_kube_config()  # 加载默认kubeconfig
            except Exception as e:
                print(f"Kubernetes配置加载失败: {e}")
                self.core_v1 = None
                self.apps_v1 = None
                return
        
        self.core_v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
    
    def discover_nodes(self):
        """发现节点"""
        if not self.core_v1:
            return {'error': 'Kubernetes客户端未初始化'}
        
        try:
            nodes = self.core_v1.list_node()
            node_list = []
            
            for node in nodes.items:
                node_info = {
                    'name': node.metadata.name,
                    'uid': node.metadata.uid,
                    'creation_timestamp': node.metadata.creation_timestamp.isoformat(),
                    'labels': dict(node.metadata.labels) if node.metadata.labels else {},
                    'annotations': dict(node.metadata.annotations) if node.metadata.annotations else {},
                    'status': {
                        'capacity': dict(node.status.capacity) if node.status.capacity else {},
                        'allocatable': dict(node.status.allocatable) if node.status.allocatable else {},
                        'conditions': [{'type': cond.type, 'status': cond.status} 
                                     for cond in node.status.conditions] if node.status.conditions else []
                    },
                    'addresses': [{'type': addr.type, 'address': addr.address} 
                                for addr in node.status.addresses] if node.status.addresses else []
                }
                node_list.append(node_info)
            
            return {
                'nodes': node_list,
                'count': len(node_list),
                'discovered_at': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def discover_pods(self):
        """发现Pods"""
        if not self.core_v1:
            return {'error': 'Kubernetes客户端未初始化'}
        
        try:
            pods = self.core_v1.list_pod_for_all_namespaces()
            pod_list = []
            
            for pod in pods.items:
                pod_info = {
                    'name': pod.metadata.name,
                    'namespace': pod.metadata.namespace,
                    'uid': pod.metadata.uid,
                    'creation_timestamp': pod.metadata.creation_timestamp.isoformat(),
                    'labels': dict(pod.metadata.labels) if pod.metadata.labels else {},
                    'annotations': dict(pod.metadata.annotations) if pod.metadata.annotations else {},
                    'status': {
                        'phase': pod.status.phase,
                        'host_ip': pod.status.host_ip,
                        'pod_ip': pod.status.pod_ip,
                        'start_time': pod.status.start_time.isoformat() if pod.status.start_time else None
                    },
                    'spec': {
                        'containers': [{
                            'name': container.name,
                            'image': container.image,
                            'ports': [{'container_port': port.container_port, 'protocol': port.protocol} 
                                    for port in container.ports] if container.ports else []
                        } for container in pod.spec.containers] if pod.spec.containers else []
                    }
                }
                pod_list.append(pod_info)
            
            return {
                'pods': pod_list,
                'count': len(pod_list),
                'discovered_at': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def discover_services(self):
        """发现服务"""
        if not self.core_v1:
            return {'error': 'Kubernetes客户端未初始化'}
        
        try:
            services = self.core_v1.list_service_for_all_namespaces()
            service_list = []
            
            for service in services.items:
                service_info = {
                    'name': service.metadata.name,
                    'namespace': service.metadata.namespace,
                    'uid': service.metadata.uid,
                    'creation_timestamp': service.metadata.creation_timestamp.isoformat(),
                    'labels': dict(service.metadata.labels) if service.metadata.labels else {},
                    'spec': {
                        'type': service.spec.type,
                        'cluster_ip': service.spec.cluster_ip,
                        'ports': [{
                            'name': port.name,
                            'port': port.port,
                            'target_port': str(port.target_port) if port.target_port else None,
                            'protocol': port.protocol
                        } for port in service.spec.ports] if service.spec.ports else [],
                        'selector': dict(service.spec.selector) if service.spec.selector else {}
                    },
                    'status': {
                        'load_balancer': {
                            'ingress': [{
                                'ip': ingress.ip,
                                'hostname': ingress.hostname
                            } for ingress in service.status.load_balancer.ingress] 
                            if service.status.load_balancer.ingress else []
                        } if service.status.load_balancer else {}
                    }
                }
                service_list.append(service_info)
            
            return {
                'services': service_list,
                'count': len(service_list),
                'discovered_at': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': str(e)}

# Kubernetes发现示例 (注释掉以避免实际调用)
# k8s_discovery = KubernetesDiscovery()
# 
# print("Kubernetes发现示例:")
# nodes_result = k8s_discovery.discover_nodes()
# if 'error' not in nodes_result:
#     print(f"发现 {nodes_result['count']} 个节点")
#     for node in nodes_result['nodes'][:2]:
#         print(f"  节点名称: {node['name']}")
#         print(f"    状态: {node['status']['conditions'][-1] if node['status']['conditions'] else 'Unknown'}")
# else:
#     print(f"节点发现失败: {nodes_result['error']}")
```

## 最佳实践与建议

### 发现策略建议

```python
class DiscoveryBestPractices:
    def __init__(self):
        self.practices = {
            'strategy_planning': {
                'title': '策略规划',
                'recommendations': [
                    '制定分层发现策略，从网络层到应用层逐步深入',
                    '根据CI重要性设定不同的发现频率',
                    '结合主动发现和被动发现，提高发现效率',
                    '建立发现任务优先级机制，确保关键系统优先发现'
                ]
            },
            'resource_management': {
                'title': '资源管理',
                'recommendations': [
                    '合理控制并发发现任务数量，避免对生产环境造成影响',
                    '设置发现任务超时机制，防止任务长时间占用资源',
                    '监控发现任务的资源消耗，及时调整配置',
                    '建立发现任务队列机制，平滑资源使用'
                ]
            },
            'data_quality': {
                'title': '数据质量',
                'recommendations': [
                    '建立数据验证机制，确保发现数据的准确性',
                    '实施数据去重策略，避免重复发现',
                    '设置数据更新策略，及时反映环境变化',
                    '建立数据质量监控，及时发现数据问题'
                ]
            },
            'security_compliance': {
                'title': '安全合规',
                'recommendations': [
                    '实施最小权限原则，限制发现工具的访问权限',
                    '加密敏感数据传输和存储',
                    '建立访问审计机制，记录所有发现活动',
                    '定期审查发现策略，确保符合安全要求'
                ]
            },
            'performance_optimization': {
                'title': '性能优化',
                'recommendations': [
                    '使用增量发现减少不必要的数据采集',
                    '实施缓存机制，避免重复查询',
                    '优化发现算法，提高发现效率',
                    '分布式部署发现任务，提高整体性能'
                ]
            }
        }
    
    def get_practice_details(self, practice_name):
        """获取实践详情"""
        return self.practices.get(practice_name, {})
    
    def generate_best_practices_guide(self):
        """生成最佳实践指南"""
        guide = "自动发现最佳实践指南\n"
        guide += "=" * 25 + "\n\n"
        
        for name, details in self.practices.items():
            guide += f"{details['title']}\n"
            guide += "-" * len(details['title']) + "\n"
            for i, recommendation in enumerate(details['recommendations'], 1):
                guide += f"{i}. {recommendation}\n"
            guide += "\n"
        
        return guide

# 生成最佳实践指南
best_practices = DiscoveryBestPractices()
print(best_practices.generate_best_practices_guide())
```

### 工具选择建议

1. **网络发现**：
   - 小规模环境：Nmap + 自定义脚本
   - 大规模环境：专业的网络扫描工具如 Nessus、OpenVAS

2. **系统发现**：
   - Linux/Unix：SSH + 自定义脚本
   - Windows：WMI + PowerShell
   - 混合环境：Ansible、SaltStack等配置管理工具

3. **应用发现**：
   - 容器环境：Kubernetes API
   - 云环境：各云平台原生API
   - 传统应用：进程扫描 + 端口扫描

4. **服务发现**：
   - 微服务：Consul、Eureka等服务注册中心
   - 传统服务：系统服务管理工具

## 总结

自动发现工具与协议是CMDB数据准确性的基础保障。合理选择和组合使用各种发现工具与协议，能够构建完整的自动发现体系：

1. **多层发现**：结合网络层、系统层、应用层发现，构建全面的发现能力
2. **多协议支持**：支持SNMP、SSH、WMI、API等多种协议，适应不同环境
3. **工具集成**：整合开源和商业工具，发挥各自优势
4. **策略优化**：制定合理的发现策略，平衡准确性与时效性
5. **安全合规**：确保发现过程符合安全和合规要求

通过持续优化自动发现体系，企业能够确保CMDB数据的准确性和时效性，为IT服务管理提供可靠的数据基础。