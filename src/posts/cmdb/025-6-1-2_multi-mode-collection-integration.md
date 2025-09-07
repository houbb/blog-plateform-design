---
title: "多模式采集融合: Agent模式、无Agent模式、API集成模式与流量分析模式"
date: 2025-09-07
categories: [Cmdb]
tags: [Cmdb]
published: true
---
在配置管理数据库（CMDB）的建设过程中，数据采集是确保数据准确性和完整性的关键环节。随着IT环境的日益复杂化，单一的采集方式已无法满足现代企业对配置信息全面性和实时性的需求。因此，构建一个多模式采集融合的体系，通过Agent模式、无Agent模式、API集成模式和流量分析模式相结合的方式，成为现代CMDB系统的重要特征。

## 多模式采集的必要性

### 采集挑战的多样性

现代IT环境呈现出前所未有的复杂性，这种复杂性体现在多个维度：

1. **技术栈多样性**：从传统的物理服务器到虚拟化环境，再到容器化和云原生架构
2. **部署环境多样性**：本地数据中心、混合云、多云环境并存
3. **安全要求多样性**：不同环境有不同的安全策略和访问限制
4. **数据类型多样性**：配置信息、性能指标、日志数据、关系信息等

面对这些挑战，单一的采集方式往往存在局限性：

- **Agent模式**虽然精度高，但在某些安全严格的环境中部署受限
- **无Agent模式**无需在目标系统安装软件，但可能无法获取深度信息
- **API集成模式**能够获取结构化数据，但依赖于系统提供完善的API
- **流量分析模式**能够发现服务关系，但可能无法获取详细的配置信息

### 融合采集的优势

多模式采集融合能够充分发挥各种采集方式的优势，弥补单一方式的不足：

1. **全面覆盖**：通过多种方式结合，实现对IT环境的全面覆盖
2. **互补增强**：不同方式采集的数据可以相互验证和补充
3. **灵活适应**：根据不同环境特点选择最合适的采集方式
4. **质量提升**：通过多源数据融合提高数据质量和准确性

## Agent模式：高精度采集服务器及应用信息

### Agent模式概述

Agent模式是指在目标系统上安装专用的采集程序（Agent），通过该程序主动收集系统和应用的配置信息。这是传统CMDB系统中最常用的采集方式之一。

### 技术实现

```python
import psutil
import platform
import subprocess
import json
from datetime import datetime

class AgentBasedCollector:
    def __init__(self, config):
        self.config = config
        self.collected_data = {}
    
    def collect_system_info(self):
        """收集系统基本信息"""
        system_info = {
            'hostname': platform.node(),
            'os_type': platform.system(),
            'os_version': platform.release(),
            'architecture': platform.machine(),
            'python_version': platform.python_version()
        }
        self.collected_data['system_info'] = system_info
        return system_info
    
    def collect_hardware_info(self):
        """收集硬件信息"""
        hardware_info = {
            'cpu_count': psutil.cpu_count(logical=False),
            'cpu_logical_count': psutil.cpu_count(logical=True),
            'cpu_freq': psutil.cpu_freq()._asdict() if psutil.cpu_freq() else {},
            'memory_total': psutil.virtual_memory().total,
            'memory_available': psutil.virtual_memory().available,
            'swap_total': psutil.swap_memory().total,
            'swap_used': psutil.swap_memory().used
        }
        
        # 收集磁盘信息
        disk_info = []
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                disk_info.append({
                    'device': partition.device,
                    'mountpoint': partition.mountpoint,
                    'filesystem_type': partition.fstype,
                    'total': usage.total,
                    'used': usage.used,
                    'free': usage.free
                })
            except PermissionError:
                # 某些分区可能无法访问
                continue
        hardware_info['disks'] = disk_info
        
        self.collected_data['hardware_info'] = hardware_info
        return hardware_info
    
    def collect_network_info(self):
        """收集网络信息"""
        network_info = {
            'interfaces': {},
            'connections': []
        }
        
        # 收集网络接口信息
        interfaces = psutil.net_if_addrs()
        for interface_name, interface_addresses in interfaces.items():
            addresses = []
            for address in interface_addresses:
                addresses.append({
                    'family': str(address.family),
                    'address': address.address,
                    'netmask': address.netmask,
                    'broadcast': address.broadcast
                })
            network_info['interfaces'][interface_name] = addresses
        
        # 收集网络连接信息
        connections = psutil.net_connections(kind='inet')
        for conn in connections:
            network_info['connections'].append({
                'fd': conn.fd,
                'family': str(conn.family),
                'type': str(conn.type),
                'laddr': f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else None,
                'raddr': f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else None,
                'status': conn.status
            })
        
        self.collected_data['network_info'] = network_info
        return network_info
    
    def collect_process_info(self):
        """收集进程信息"""
        process_info = []
        
        for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
            try:
                process_info.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        self.collected_data['process_info'] = process_info
        return process_info
    
    def collect_installed_software(self):
        """收集已安装软件信息"""
        software_info = []
        
        # 在Linux系统上收集已安装的包
        if platform.system() == "Linux":
            try:
                # 尝试使用dpkg（Debian/Ubuntu）
                result = subprocess.run(['dpkg', '-l'], capture_output=True, text=True)
                if result.returncode == 0:
                    lines = result.stdout.split('\n')[5:]  # 跳过标题行
                    for line in lines:
                        if line.startswith('ii'):
                            parts = line.split()
                            if len(parts) >= 3:
                                software_info.append({
                                    'name': parts[1],
                                    'version': parts[2],
                                    'description': ' '.join(parts[3:]) if len(parts) > 3 else ''
                                })
            except FileNotFoundError:
                pass
            
            try:
                # 尝试使用rpm（RedHat/CentOS）
                result = subprocess.run(['rpm', '-qa'], capture_output=True, text=True)
                if result.returncode == 0:
                    packages = result.stdout.strip().split('\n')
                    for package in packages:
                        software_info.append({
                            'name': package,
                            'version': '',  # 需要进一步解析
                            'description': ''
                        })
            except FileNotFoundError:
                pass
        
        self.collected_data['software_info'] = software_info
        return software_info
    
    def collect_all_data(self):
        """收集所有数据"""
        self.collect_system_info()
        self.collect_hardware_info()
        self.collect_network_info()
        self.collect_process_info()
        self.collect_installed_software()
        
        # 添加采集时间戳
        self.collected_data['collection_timestamp'] = datetime.now().isoformat()
        self.collected_data['collection_method'] = 'agent'
        
        return self.collected_data
    
    def send_to_cmdb(self, cmdb_endpoint):
        """将数据发送到CMDB"""
        try:
            import requests
            response = requests.post(
                cmdb_endpoint,
                json=self.collected_data,
                headers={'Content-Type': 'application/json'}
            )
            return response.status_code == 200
        except Exception as e:
            print(f"发送数据到CMDB失败: {e}")
            return False

# 使用示例
if __name__ == "__main__":
    config = {
        'cmdb_endpoint': 'http://cmdb.example.com/api/v1/data',
        'collection_interval': 3600  # 1小时
    }
    
    collector = AgentBasedCollector(config)
    data = collector.collect_all_data()
    
    print("采集到的数据:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    # 发送到CMDB
    # success = collector.send_to_cmdb(config['cmdb_endpoint'])
    # if success:
    #     print("数据发送成功")
    # else:
    #     print("数据发送失败")
```

### Agent模式的优势

1. **高精度采集**：能够获取系统和应用的详细配置信息
2. **实时性强**：可以按需或定时采集数据
3. **功能丰富**：支持复杂的采集逻辑和数据处理
4. **可控性好**：可以精确控制采集的内容和频率

### Agent模式的挑战

1. **部署复杂性**：需要在每个目标系统上安装和维护Agent
2. **资源消耗**：Agent会占用一定的系统资源
3. **安全考虑**：需要确保Agent的安全性和权限控制
4. **兼容性问题**：不同操作系统和版本可能需要不同的Agent

### 最佳实践

1. **轻量级设计**：Agent应尽量轻量，减少对系统性能的影响
2. **安全加固**：采用加密通信、身份验证等安全措施
3. **自动更新**：支持Agent的自动更新和版本管理
4. **配置灵活**：支持通过配置文件或远程配置调整采集策略

## 无Agent模式：通过SSH、WinRM等协议远程采集

### 无Agent模式概述

无Agent模式是指通过标准的远程管理协议（如SSH、WinRM等）连接到目标系统，执行命令或查询接口来获取配置信息，而无需在目标系统上安装专用软件。

### SSH采集实现

```python
import paramiko
import json
import re
from datetime import datetime

class SSHBasedCollector:
    def __init__(self, hostname, username, password=None, key_file=None, port=22):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.key_file = key_file
        self.port = port
        self.ssh_client = None
    
    def connect(self):
        """建立SSH连接"""
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            if self.key_file:
                self.ssh_client.connect(
                    self.hostname, 
                    port=self.port, 
                    username=self.username, 
                    key_filename=self.key_file
                )
            else:
                self.ssh_client.connect(
                    self.hostname, 
                    port=self.port, 
                    username=self.username, 
                    password=self.password
                )
            return True
        except Exception as e:
            print(f"SSH连接失败: {e}")
            return False
    
    def disconnect(self):
        """断开SSH连接"""
        if self.ssh_client:
            self.ssh_client.close()
    
    def execute_command(self, command):
        """执行远程命令"""
        if not self.ssh_client:
            raise Exception("SSH连接未建立")
        
        try:
            stdin, stdout, stderr = self.ssh_client.exec_command(command)
            output = stdout.read().decode('utf-8')
            error = stderr.read().decode('utf-8')
            
            if error:
                print(f"命令执行错误: {error}")
            
            return output.strip()
        except Exception as e:
            print(f"命令执行失败: {e}")
            return ""
    
    def collect_system_info(self):
        """收集系统信息"""
        system_info = {}
        
        # 获取操作系统信息
        os_info = self.execute_command("cat /etc/os-release")
        if os_info:
            for line in os_info.split('\n'):
                if line.startswith('NAME='):
                    system_info['os_name'] = line.split('=')[1].strip('"')
                elif line.startswith('VERSION='):
                    system_info['os_version'] = line.split('=')[1].strip('"')
        
        # 获取内核版本
        kernel_version = self.execute_command("uname -r")
        system_info['kernel_version'] = kernel_version
        
        # 获取主机名
        hostname = self.execute_command("hostname")
        system_info['hostname'] = hostname
        
        return system_info
    
    def collect_hardware_info(self):
        """收集硬件信息"""
        hardware_info = {}
        
        # 获取CPU信息
        cpu_info = self.execute_command("lscpu")
        if cpu_info:
            cpu_data = {}
            for line in cpu_info.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    cpu_data[key.strip()] = value.strip()
            
            hardware_info['cpu'] = {
                'model': cpu_data.get('Model name', ''),
                'cores': cpu_data.get('CPU(s)', ''),
                'threads_per_core': cpu_data.get('Thread(s) per core', ''),
                'architecture': cpu_data.get('Architecture', '')
            }
        
        # 获取内存信息
        mem_info = self.execute_command("free -b")
        if mem_info:
            lines = mem_info.split('\n')
            if len(lines) > 1:
                mem_line = lines[1].split()
                if len(mem_line) >= 2:
                    hardware_info['memory_total'] = int(mem_line[1])
        
        # 获取磁盘信息
        disk_info = self.execute_command("df -B1")
        if disk_info:
            lines = disk_info.split('\n')[1:]  # 跳过标题行
            disks = []
            for line in lines:
                parts = line.split()
                if len(parts) >= 6:
                    disks.append({
                        'filesystem': parts[0],
                        'size': int(parts[1]),
                        'used': int(parts[2]),
                        'available': int(parts[3]),
                        'mountpoint': parts[5]
                    })
            hardware_info['disks'] = disks
        
        return hardware_info
    
    def collect_network_info(self):
        """收集网络信息"""
        network_info = {}
        
        # 获取网络接口信息
        interfaces_info = self.execute_command("ip addr show")
        if interfaces_info:
            interfaces = {}
            current_interface = None
            
            for line in interfaces_info.split('\n'):
                # 匹配接口行
                interface_match = re.match(r'^\d+:\s+(\w+):', line)
                if interface_match:
                    current_interface = interface_match.group(1)
                    interfaces[current_interface] = {
                        'addresses': []
                    }
                # 匹配地址行
                elif current_interface and 'inet ' in line:
                    inet_match = re.search(r'inet (\d+\.\d+\.\d+\.\d+)/(\d+)', line)
                    if inet_match:
                        interfaces[current_interface]['addresses'].append({
                            'ip': inet_match.group(1),
                            'prefix': inet_match.group(2)
                        })
            
            network_info['interfaces'] = interfaces
        
        # 获取路由信息
        routing_info = self.execute_command("ip route show")
        if routing_info:
            network_info['routes'] = routing_info.split('\n')
        
        return network_info
    
    def collect_installed_packages(self):
        """收集已安装的软件包"""
        packages = []
        
        # 尝试使用dpkg（Debian/Ubuntu）
        dpkg_output = self.execute_command("dpkg -l")
        if dpkg_output and "no packages found" not in dpkg_output.lower():
            lines = dpkg_output.split('\n')[5:]  # 跳过标题行
            for line in lines:
                if line.startswith('ii'):
                    parts = line.split()
                    if len(parts) >= 3:
                        packages.append({
                            'name': parts[1],
                            'version': parts[2],
                            'status': 'installed'
                        })
            return packages
        
        # 尝试使用rpm（RedHat/CentOS）
        rpm_output = self.execute_command("rpm -qa")
        if rpm_output:
            package_list = rpm_output.split('\n')
            for package in package_list:
                if package:
                    packages.append({
                        'name': package,
                        'version': '',
                        'status': 'installed'
                    })
            return packages
        
        return packages
    
    def collect_all_data(self):
        """收集所有数据"""
        if not self.connect():
            return None
        
        try:
            collected_data = {
                'system_info': self.collect_system_info(),
                'hardware_info': self.collect_hardware_info(),
                'network_info': self.collect_network_info(),
                'installed_packages': self.collect_installed_packages(),
                'collection_timestamp': datetime.now().isoformat(),
                'collection_method': 'ssh',
                'target_host': self.hostname
            }
            
            return collected_data
        finally:
            self.disconnect()

# 使用示例
# collector = SSHBasedCollector(
#     hostname='192.168.1.100',
#     username='admin',
#     password='password'
# )
# data = collector.collect_all_data()
# if data:
#     print(json.dumps(data, indent=2, ensure_ascii=False))
```

### WinRM采集实现

```python
import winrm
import json
from datetime import datetime

class WinRMBasedCollector:
    def __init__(self, hostname, username, password, port=5985):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.port = port
        self.session = None
    
    def connect(self):
        """建立WinRM连接"""
        try:
            self.session = winrm.Session(
                f'http://{self.hostname}:{self.port}',
                auth=(self.username, self.password)
            )
            return True
        except Exception as e:
            print(f"WinRM连接失败: {e}")
            return False
    
    def execute_command(self, command):
        """执行远程命令"""
        if not self.session:
            raise Exception("WinRM会话未建立")
        
        try:
            result = self.session.run_cmd(command)
            return result.std_out.decode('gbk').strip()  # Windows系统通常使用GBK编码
        except Exception as e:
            print(f"命令执行失败: {e}")
            return ""
    
    def execute_powershell(self, script):
        """执行PowerShell脚本"""
        if not self.session:
            raise Exception("WinRM会话未建立")
        
        try:
            result = self.session.run_ps(script)
            return result.std_out.decode('gbk').strip()
        except Exception as e:
            print(f"PowerShell脚本执行失败: {e}")
            return ""
    
    def collect_system_info(self):
        """收集系统信息"""
        # 使用PowerShell获取系统信息
        ps_script = """
        $computerSystem = Get-CimInstance Win32_ComputerSystem
        $operatingSystem = Get-CimInstance Win32_OperatingSystem
        @{
            Manufacturer = $computerSystem.Manufacturer
            Model = $computerSystem.Model
            TotalPhysicalMemory = $computerSystem.TotalPhysicalMemory
            OSName = $operatingSystem.Caption
            OSVersion = $operatingSystem.Version
            InstallDate = $operatingSystem.InstallDate
        } | ConvertTo-Json
        """
        
        result = self.execute_powershell(ps_script)
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {}
    
    def collect_hardware_info(self):
        """收集硬件信息"""
        hardware_info = {}
        
        # 获取CPU信息
        cpu_script = """
        $cpu = Get-CimInstance Win32_Processor
        @{
            Name = $cpu.Name
            NumberOfCores = $cpu.NumberOfCores
            NumberOfLogicalProcessors = $cpu.NumberOfLogicalProcessors
            MaxClockSpeed = $cpu.MaxClockSpeed
        } | ConvertTo-Json
        """
        cpu_result = self.execute_powershell(cpu_script)
        try:
            hardware_info['cpu'] = json.loads(cpu_result)
        except json.JSONDecodeError:
            hardware_info['cpu'] = {}
        
        # 获取内存信息
        memory_script = """
        $memory = Get-CimInstance Win32_PhysicalMemory
        $memoryArray = @()
        foreach ($mem in $memory) {
            $memoryArray += @{
                Capacity = $mem.Capacity
                Speed = $mem.Speed
                Manufacturer = $mem.Manufacturer
            }
        }
        $memoryArray | ConvertTo-Json
        """
        memory_result = self.execute_powershell(memory_script)
        try:
            hardware_info['memory'] = json.loads(memory_result)
        except json.JSONDecodeError:
            hardware_info['memory'] = []
        
        # 获取磁盘信息
        disk_script = """
        $disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
        $diskArray = @()
        foreach ($disk in $disks) {
            $diskArray += @{
                DeviceID = $disk.DeviceID
                Size = $disk.Size
                FreeSpace = $disk.FreeSpace
                FileSystem = $disk.FileSystem
            }
        }
        $diskArray | ConvertTo-Json
        """
        disk_result = self.execute_powershell(disk_script)
        try:
            hardware_info['disks'] = json.loads(disk_result)
        except json.JSONDecodeError:
            hardware_info['disks'] = []
        
        return hardware_info
    
    def collect_network_info(self):
        """收集网络信息"""
        network_info = {}
        
        # 获取网络适配器信息
        network_script = """
        $adapters = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True"
        $adapterArray = @()
        foreach ($adapter in $adapters) {
            $adapterArray += @{
                Description = $adapter.Description
                IPAddress = $adapter.IPAddress
                IPSubnet = $adapter.IPSubnet
                MACAddress = $adapter.MACAddress
                DHCPEnabled = $adapter.DHCPEnabled
            }
        }
        $adapterArray | ConvertTo-Json
        """
        network_result = self.execute_powershell(network_script)
        try:
            network_info['adapters'] = json.loads(network_result)
        except json.JSONDecodeError:
            network_info['adapters'] = []
        
        return network_info
    
    def collect_installed_software(self):
        """收集已安装的软件"""
        software_script = """
        $software = Get-CimInstance Win32_Product
        $softwareArray = @()
        foreach ($item in $software) {
            $softwareArray += @{
                Name = $item.Name
                Version = $item.Version
                Vendor = $item.Vendor
                InstallDate = $item.InstallDate
            }
        }
        $softwareArray | ConvertTo-Json
        """
        software_result = self.execute_powershell(software_script)
        try:
            return json.loads(software_result)
        except json.JSONDecodeError:
            return []
    
    def collect_all_data(self):
        """收集所有数据"""
        if not self.connect():
            return None
        
        try:
            collected_data = {
                'system_info': self.collect_system_info(),
                'hardware_info': self.collect_hardware_info(),
                'network_info': self.collect_network_info(),
                'installed_software': self.collect_installed_software(),
                'collection_timestamp': datetime.now().isoformat(),
                'collection_method': 'winrm',
                'target_host': self.hostname
            }
            
            return collected_data
        except Exception as e:
            print(f"数据采集过程中发生错误: {e}")
            return None

# 使用示例
# collector = WinRMBasedCollector(
#     hostname='192.168.1.101',
#     username='administrator',
#     password='password'
# )
# data = collector.collect_all_data()
# if data:
#     print(json.dumps(data, indent=2, ensure_ascii=False))
```

### 无Agent模式的优势

1. **无需安装软件**：不需要在目标系统上安装专用Agent
2. **部署简单**：只需配置好远程访问权限即可
3. **资源消耗低**：采集过程对目标系统影响较小
4. **安全性高**：通过标准协议进行安全通信

### 无Agent模式的挑战

1. **权限依赖**：需要目标系统开启相应的远程管理服务
2. **信息有限**：可能无法获取某些深度系统信息
3. **网络依赖**：需要稳定的网络连接
4. **性能影响**：大量并发采集可能对网络和目标系统造成压力

### 最佳实践

1. **权限最小化**：为采集账户分配最小必要权限
2. **连接池管理**：使用连接池提高采集效率
3. **错误处理**：完善的错误处理和重试机制
4. **并发控制**：合理控制并发采集数量

## API集成模式：从云平台、监控系统、CI/CD工具拉取数据

### API集成模式概述

API集成模式是指通过调用各种系统和服务提供的API接口来获取配置信息。这种方式特别适用于云平台、监控系统、CI/CD工具等提供了完善API的现代IT系统。

### 云平台API集成

```python
import boto3
import requests
import json
from datetime import datetime

class CloudAPIBasedCollector:
    def __init__(self, cloud_provider, credentials):
        self.cloud_provider = cloud_provider
        self.credentials = credentials
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """初始化云平台客户端"""
        if self.cloud_provider == 'aws':
            self.client = boto3.client(
                'ec2',
                aws_access_key_id=self.credentials.get('access_key'),
                aws_secret_access_key=self.credentials.get('secret_key'),
                region_name=self.credentials.get('region', 'us-east-1')
            )
        elif self.cloud_provider == 'azure':
            # Azure客户端初始化
            from azure.identity import ClientSecretCredential
            from azure.mgmt.compute import ComputeManagementClient
            
            credential = ClientSecretCredential(
                self.credentials['tenant_id'],
                self.credentials['client_id'],
                self.credentials['client_secret']
            )
            self.client = ComputeManagementClient(
                credential, 
                self.credentials['subscription_id']
            )
        elif self.cloud_provider == 'aliyun':
            # 阿里云客户端初始化
            from aliyunsdkcore.client import AcsClient
            
            self.client = AcsClient(
                self.credentials['access_key'],
                self.credentials['access_secret'],
                self.credentials.get('region', 'cn-hangzhou')
            )
    
    def collect_aws_ec2_instances(self):
        """收集AWS EC2实例信息"""
        if self.cloud_provider != 'aws':
            return []
        
        try:
            response = self.client.describe_instances()
            instances = []
            
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    instance_info = {
                        'instance_id': instance['InstanceId'],
                        'instance_type': instance['InstanceType'],
                        'state': instance['State']['Name'],
                        'public_ip': instance.get('PublicIpAddress'),
                        'private_ip': instance.get('PrivateIpAddress'),
                        'launch_time': instance['LaunchTime'].isoformat(),
                        'availability_zone': instance['Placement']['AvailabilityZone'],
                        'vpc_id': instance.get('VpcId'),
                        'subnet_id': instance.get('SubnetId'),
                        'security_groups': [
                            sg['GroupName'] for sg in instance.get('SecurityGroups', [])
                        ],
                        'tags': {
                            tag['Key']: tag['Value'] 
                            for tag in instance.get('Tags', [])
                        }
                    }
                    instances.append(instance_info)
            
            return instances
        except Exception as e:
            print(f"收集AWS EC2实例信息失败: {e}")
            return []
    
    def collect_aws_rds_instances(self):
        """收集AWS RDS实例信息"""
        if self.cloud_provider != 'aws':
            return []
        
        try:
            rds_client = boto3.client(
                'rds',
                aws_access_key_id=self.credentials.get('access_key'),
                aws_secret_access_key=self.credentials.get('secret_key'),
                region_name=self.credentials.get('region', 'us-east-1')
            )
            
            response = rds_client.describe_db_instances()
            db_instances = []
            
            for db_instance in response['DBInstances']:
                db_info = {
                    'db_instance_identifier': db_instance['DBInstanceIdentifier'],
                    'db_instance_class': db_instance['DBInstanceClass'],
                    'engine': db_instance['Engine'],
                    'db_instance_status': db_instance['DBInstanceStatus'],
                    'endpoint': db_instance.get('Endpoint', {}),
                    'allocated_storage': db_instance['AllocatedStorage'],
                    'preferred_backup_window': db_instance['PreferredBackupWindow'],
                    'preferred_maintenance_window': db_instance['PreferredMaintenanceWindow'],
                    'tags': {
                        tag['Key']: tag['Value'] 
                        for tag in db_instance.get('TagList', [])
                    }
                }
                db_instances.append(db_info)
            
            return db_instances
        except Exception as e:
            print(f"收集AWS RDS实例信息失败: {e}")
            return []
    
    def collect_kubernetes_resources(self, kubeconfig_path=None):
        """收集Kubernetes资源信息"""
        try:
            from kubernetes import client, config
            
            # 加载kubeconfig
            if kubeconfig_path:
                config.load_kube_config(kubeconfig_path)
            else:
                config.load_incluster_config()  # 在集群内运行时使用
            
            # 创建API客户端
            v1 = client.CoreV1Api()
            apps_v1 = client.AppsV1Api()
            
            # 收集节点信息
            nodes = v1.list_node()
            node_info = []
            for node in nodes.items:
                node_info.append({
                    'name': node.metadata.name,
                    'labels': node.metadata.labels,
                    'annotations': node.metadata.annotations,
                    'status': node.status.conditions,
                    'capacity': node.status.capacity,
                    'allocatable': node.status.allocatable
                })
            
            # 收集Pod信息
            pods = v1.list_pod_for_all_namespaces()
            pod_info = []
            for pod in pods.items:
                pod_info.append({
                    'name': pod.metadata.name,
                    'namespace': pod.metadata.namespace,
                    'labels': pod.metadata.labels,
                    'status': pod.status.phase,
                    'node_name': pod.spec.node_name,
                    'containers': [
                        {
                            'name': container.name,
                            'image': container.image
                        }
                        for container in pod.spec.containers
                    ]
                })
            
            # 收集服务信息
            services = v1.list_service_for_all_namespaces()
            service_info = []
            for service in services.items:
                service_info.append({
                    'name': service.metadata.name,
                    'namespace': service.metadata.namespace,
                    'labels': service.metadata.labels,
                    'type': service.spec.type,
                    'cluster_ip': service.spec.cluster_ip,
                    'ports': [
                        {
                            'port': port.port,
                            'target_port': str(port.target_port),
                            'protocol': port.protocol
                        }
                        for port in service.spec.ports
                    ]
                })
            
            return {
                'nodes': node_info,
                'pods': pod_info,
                'services': service_info
            }
        except Exception as e:
            print(f"收集Kubernetes资源信息失败: {e}")
            return {}

class MonitoringAPIBasedCollector:
    def __init__(self, monitoring_system, api_endpoint, api_key):
        self.monitoring_system = monitoring_system
        self.api_endpoint = api_endpoint
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({'Authorization': f'Bearer {api_key}'})
    
    def collect_zabbix_hosts(self):
        """收集Zabbix主机信息"""
        if self.monitoring_system != 'zabbix':
            return []
        
        try:
            # Zabbix API调用示例
            payload = {
                "jsonrpc": "2.0",
                "method": "host.get",
                "params": {
                    "output": "extend",
                    "selectInterfaces": "extend",
                    "selectGroups": "extend",
                    "selectTags": "extend"
                },
                "auth": self.api_key,
                "id": 1
            }
            
            response = self.session.post(self.api_endpoint, json=payload)
            result = response.json()
            
            if 'result' in result:
                hosts = []
                for host in result['result']:
                    host_info = {
                        'hostid': host['hostid'],
                        'host': host['host'],
                        'name': host['name'],
                        'status': 'enabled' if host['status'] == '0' else 'disabled',
                        'interfaces': host['interfaces'],
                        'groups': host['groups'],
                        'tags': host['tags']
                    }
                    hosts.append(host_info)
                return hosts
            else:
                print(f"Zabbix API调用失败: {result}")
                return []
        except Exception as e:
            print(f"收集Zabbix主机信息失败: {e}")
            return []
    
    def collect_prometheus_targets(self):
        """收集Prometheus目标信息"""
        if self.monitoring_system != 'prometheus':
            return []
        
        try:
            response = self.session.get(f"{self.api_endpoint}/api/v1/targets")
            result = response.json()
            
            if result['status'] == 'success':
                targets = []
                for target in result['data']['activeTargets']:
                    target_info = {
                        'job': target['labels'].get('job'),
                        'instance': target['labels'].get('instance'),
                        'endpoint': target['scrapeUrl'],
                        'state': target['health'],
                        'last_scrape': target['lastScrape'],
                        'labels': target['labels']
                    }
                    targets.append(target_info)
                return targets
            else:
                print(f"Prometheus API调用失败: {result}")
                return []
        except Exception as e:
            print(f"收集Prometheus目标信息失败: {e}")
            return []

class CICDAPICollector:
    def __init__(self, cicd_system, api_endpoint, api_token):
        self.cicd_system = cicd_system
        self.api_endpoint = api_endpoint
        self.api_token = api_token
        self.session = requests.Session()
        self.session.headers.update({'Authorization': f'Bearer {api_token}'})
    
    def collect_jenkins_jobs(self):
        """收集Jenkins作业信息"""
        if self.cicd_system != 'jenkins':
            return []
        
        try:
            response = self.session.get(f"{self.api_endpoint}/api/json")
            result = response.json()
            
            jobs = []
            for job in result['jobs']:
                job_info = {
                    'name': job['name'],
                    'url': job['url'],
                    'color': job['color'],  # 表示状态
                    'buildable': job.get('buildable', True)
                }
                jobs.append(job_info)
            return jobs
        except Exception as e:
            print(f"收集Jenkins作业信息失败: {e}")
            return []
    
    def collect_gitlab_projects(self):
        """收集GitLab项目信息"""
        if self.cicd_system != 'gitlab':
            return []
        
        try:
            response = self.session.get(f"{self.api_endpoint}/api/v4/projects")
            projects = response.json()
            
            project_info = []
            for project in projects:
                info = {
                    'id': project['id'],
                    'name': project['name'],
                    'path_with_namespace': project['path_with_namespace'],
                    'default_branch': project['default_branch'],
                    'visibility': project['visibility'],
                    'last_activity_at': project['last_activity_at'],
                    'web_url': project['web_url']
                }
                project_info.append(info)
            return project_info
        except Exception as e:
            print(f"收集GitLab项目信息失败: {e}")
            return []

# 使用示例
# AWS采集
# aws_collector = CloudAPIBasedCollector('aws', {
#     'access_key': 'your-access-key',
#     'secret_key': 'your-secret-key',
#     'region': 'us-east-1'
# })
# ec2_instances = aws_collector.collect_aws_ec2_instances()
# rds_instances = aws_collector.collect_aws_rds_instances()

# Kubernetes采集
# kube_collector = CloudAPIBasedCollector('kubernetes', {})
# k8s_resources = kube_collector.collect_kubernetes_resources('/path/to/kubeconfig')

# Zabbix采集
# zabbix_collector = MonitoringAPIBasedCollector('zabbix', 'http://zabbix.example.com/api_jsonrpc.php', 'your-api-key')
# zabbix_hosts = zabbix_collector.collect_zabbix_hosts()

# Prometheus采集
# prometheus_collector = MonitoringAPIBasedCollector('prometheus', 'http://prometheus.example.com', '')
# prometheus_targets = prometheus_collector.collect_prometheus_targets()

# Jenkins采集
# jenkins_collector = CICDAPICollector('jenkins', 'http://jenkins.example.com', 'your-api-token')
# jenkins_jobs = jenkins_collector.collect_jenkins_jobs()