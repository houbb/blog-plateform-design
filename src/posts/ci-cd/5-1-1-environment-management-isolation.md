---
title: 环境管理与隔离: 开发、测试、预发、生产环境的自动化管理
date: 2025-08-30
categories: [CICD]
tags: [ci,cd,environment,automation]
published: true
---
在现代软件开发和交付流程中，环境管理是确保软件质量和交付效率的关键环节。通过建立完善的环境管理体系，团队能够实现开发、测试、预发和生产环境的标准化、自动化管理，从而提高开发效率、减少环境相关问题，并确保生产环境的稳定性。本文将深入探讨环境层次结构设计、自动化管理实现以及环境隔离策略等关键方面。

## 环境层次结构设计

环境层次结构设计是环境管理的基础，合理的环境划分能够满足不同阶段的验证需求，同时控制成本和复杂性。

### 环境类型定义

#### 开发环境（Development Environment）
开发环境是开发人员进行日常开发和调试的环境，具有以下特点：
- **灵活性高**：允许开发人员自由配置和修改环境，支持快速迭代
- **资源相对较少**：在保证基本功能的前提下，优先考虑成本控制
- **数据特征**：通常使用模拟数据或脱敏的测试数据，避免使用真实业务数据
- **并行支持**：可能存在多个并行的开发环境，支持特性分支开发和个人开发环境

#### 测试环境（Testing Environment）
测试环境用于执行各种类型的测试，包括功能测试、集成测试和性能测试：
- **配置稳定性**：环境配置相对稳定，与生产环境尽可能保持一致
- **数据完整性**：包含完整的测试数据集，覆盖各种业务场景
- **自动化支持**：支持自动化测试执行，能够快速重建和重置
- **并行测试**：可能需要多个测试环境以支持不同团队或项目的并行测试

#### 预发环境（Staging Environment）
预发环境是生产环境的镜像，用于最终验证：
- **配置一致性**：配置与生产环境完全一致，包括硬件规格、网络配置等
- **数据真实性**：使用真实的生产数据子集或经过脱敏处理的生产数据
- **流程一致性**：部署流程与生产环境完全相同，用于验证部署脚本和流程
- **用户验收**：支持用户验收测试和最终验证，确保新版本满足业务需求

#### 生产环境（Production Environment）
生产环境是为最终用户提供服务的环境：
- **高可用性**：具备高可用性和容错能力，确保服务的连续性
- **安全性**：严格的安全和合规要求，实施多层次安全防护
- **监控完善**：完整的监控和告警体系，实时掌握系统状态
- **变更控制**：严格的变更控制流程，确保每次变更都经过充分验证

### 环境生命周期管理

#### 环境创建流程
```python
#!/usr/bin/env python3
"""
环境生命周期管理工具
支持环境的创建、配置、销毁等全生命周期管理
"""

import json
import yaml
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass
import datetime

class EnvironmentType(Enum):
    DEVELOPMENT = "dev"
    TESTING = "test"
    STAGING = "staging"
    PRODUCTION = "prod"

class EnvironmentStatus(Enum):
    CREATING = "creating"
    ACTIVE = "active"
    UPDATING = "updating"
    DESTROYING = "destroying"
    INACTIVE = "inactive"
    ERROR = "error"

@dataclass
class EnvironmentSpec:
    """环境规格定义"""
    name: str
    type: EnvironmentType
    region: str
    instance_count: int
    instance_type: str
    cpu_limit: str
    memory_limit: str
    storage_size: str
    network_config: Dict
    security_config: Dict
    monitoring_config: Dict

@dataclass
class Environment:
    """环境实例"""
    id: str
    spec: EnvironmentSpec
    status: EnvironmentStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime
    creator: str
    tags: Dict[str, str]

class EnvironmentLifecycleManager:
    def __init__(self, config_file: str):
        with open(config_file, 'r') as f:
            self.config = yaml.safe_load(f)
        self.environments = {}
    
    def create_environment(
        self,
        env_type: EnvironmentType,
        creator: str,
        tags: Dict[str, str] = None
    ) -> str:
        """
        创建环境
        
        Args:
            env_type: 环境类型
            creator: 创建者
            tags: 环境标签
            
        Returns:
            环境ID
        """
        import uuid
        
        # 生成环境ID
        env_id = str(uuid.uuid4())
        
        # 获取环境规格
        spec = self._get_environment_spec(env_type)
        
        # 创建环境实例
        env = Environment(
            id=env_id,
            spec=spec,
            status=EnvironmentStatus.CREATING,
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now(),
            creator=creator,
            tags=tags or {}
        )
        
        # 存储环境信息
        self.environments[env_id] = env
        
        # 异步创建环境（实际实现中会调用基础设施提供商API）
        self._async_create_environment(env_id)
        
        return env_id
    
    def _get_environment_spec(self, env_type: EnvironmentType) -> EnvironmentSpec:
        """
        获取环境规格
        
        Args:
            env_type: 环境类型
            
        Returns:
            环境规格
        """
        env_config = self.config['environments'][env_type.value]
        
        return EnvironmentSpec(
            name=f"{env_type.value}-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}",
            type=env_type,
            region=env_config.get('region', 'us-west-2'),
            instance_count=env_config['instance_count'],
            instance_type=env_config['instance_type'],
            cpu_limit=env_config['resources']['cpu_limit'],
            memory_limit=env_config['resources']['memory_limit'],
            storage_size=env_config['resources']['storage_size'],
            network_config=env_config.get('network', {}),
            security_config=env_config.get('security', {}),
            monitoring_config=env_config.get('monitoring', {})
        )
    
    def _async_create_environment(self, env_id: str):
        """
        异步创建环境
        
        Args:
            env_id: 环境ID
        """
        import threading
        
        def create_env():
            try:
                env = self.environments[env_id]
                # 这里应该调用实际的基础设施提供商API
                # 模拟创建过程
                print(f"Creating environment {env_id}...")
                # 模拟创建时间
                import time
                time.sleep(5)
                
                # 更新环境状态
                env.status = EnvironmentStatus.ACTIVE
                env.updated_at = datetime.datetime.now()
                print(f"Environment {env_id} created successfully")
            except Exception as e:
                print(f"Failed to create environment {env_id}: {e}")
                env = self.environments[env_id]
                env.status = EnvironmentStatus.ERROR
                env.updated_at = datetime.datetime.now()
        
        # 启动异步创建线程
        thread = threading.Thread(target=create_env)
        thread.start()
    
    def destroy_environment(self, env_id: str) -> bool:
        """
        销毁环境
        
        Args:
            env_id: 环境ID
            
        Returns:
            销毁是否成功
        """
        if env_id not in self.environments:
            return False
        
        env = self.environments[env_id]
        env.status = EnvironmentStatus.DESTROYING
        env.updated_at = datetime.datetime.now()
        
        # 异步销毁环境
        self._async_destroy_environment(env_id)
        return True
    
    def _async_destroy_environment(self, env_id: str):
        """
        异步销毁环境
        
        Args:
            env_id: 环境ID
        """
        import threading
        
        def destroy_env():
            try:
                env = self.environments[env_id]
                # 这里应该调用实际的基础设施提供商API
                # 模拟销毁过程
                print(f"Destroying environment {env_id}...")
                # 模拟销毁时间
                import time
                time.sleep(3)
                
                # 从环境中移除
                del self.environments[env_id]
                print(f"Environment {env_id} destroyed successfully")
            except Exception as e:
                print(f"Failed to destroy environment {env_id}: {e}")
                env = self.environments[env_id]
                env.status = EnvironmentStatus.ERROR
                env.updated_at = datetime.datetime.now()
        
        # 启动异步销毁线程
        thread = threading.Thread(target=destroy_env)
        thread.start()
    
    def get_environment(self, env_id: str) -> Optional[Environment]:
        """
        获取环境信息
        
        Args:
            env_id: 环境ID
            
        Returns:
            环境信息
        """
        return self.environments.get(env_id)
    
    def list_environments(
        self,
        env_type: EnvironmentType = None,
        status: EnvironmentStatus = None
    ) -> List[Environment]:
        """
        列出环境
        
        Args:
            env_type: 环境类型过滤
            status: 环境状态过滤
            
        Returns:
            环境列表
        """
        environments = list(self.environments.values())
        
        if env_type:
            environments = [env for env in environments if env.spec.type == env_type]
        
        if status:
            environments = [env for env in environments if env.status == status]
        
        return environments

# 环境配置文件示例 (environment-config.yaml)
"""
environments:
  dev:
    region: us-west-2
    instance_count: 1
    instance_type: t3.micro
    resources:
      cpu_limit: "500m"
      memory_limit: "1Gi"
      storage_size: "10Gi"
    network:
      vpc_cidr: "10.1.0.0/16"
      subnet_cidrs:
        - "10.1.1.0/24"
        - "10.1.2.0/24"
    security:
      security_groups:
        - name: dev-app-sg
          rules:
            - type: ingress
              protocol: tcp
              port: 8080
              source: "0.0.0.0/0"
    monitoring:
      enabled: true
      level: basic
  
  test:
    region: us-west-2
    instance_count: 2
    instance_type: t3.small
    resources:
      cpu_limit: "1"
      memory_limit: "2Gi"
      storage_size: "50Gi"
    network:
      vpc_cidr: "10.2.0.0/16"
      subnet_cidrs:
        - "10.2.1.0/24"
        - "10.2.2.0/24"
    security:
      security_groups:
        - name: test-app-sg
          rules:
            - type: ingress
              protocol: tcp
              port: 8080
              source: "10.0.0.0/8"
    monitoring:
      enabled: true
      level: detailed
  
  staging:
    region: us-west-2
    instance_count: 3
    instance_type: t3.medium
    resources:
      cpu_limit: "2"
      memory_limit: "4Gi"
      storage_size: "100Gi"
    network:
      vpc_cidr: "10.3.0.0/16"
      subnet_cidrs:
        - "10.3.1.0/24"
        - "10.3.2.0/24"
        - "10.3.3.0/24"
    security:
      security_groups:
        - name: staging-app-sg
          rules:
            - type: ingress
              protocol: tcp
              port: 8080
              source: "10.0.0.0/8"
    monitoring:
      enabled: true
      level: comprehensive
  
  prod:
    region: us-west-2
    instance_count: 5
    instance_type: t3.large
    resources:
      cpu_limit: "4"
      memory_limit: "8Gi"
      storage_size: "500Gi"
    network:
      vpc_cidr: "10.4.0.0/16"
      subnet_cidrs:
        - "10.4.1.0/24"
        - "10.4.2.0/24"
        - "10.4.3.0/24"
    security:
      security_groups:
        - name: prod-app-sg
          rules:
            - type: ingress
              protocol: tcp
              port: 8080
              source: "0.0.0.0/0"
    monitoring:
      enabled: true
      level: comprehensive
"""
```

## 环境自动化管理实现

环境自动化管理是现代CI/CD平台的核心能力，通过基础设施即代码（IaC）和自动化工具，能够实现环境的快速创建、配置和销毁。

### 基础设施即代码（IaC）实践

#### Terraform实现多环境管理
```hcl
# Terraform配置示例：多环境基础设施管理
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["dev", "test", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, staging, prod"
  }
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

# 环境特定配置
locals {
  env_config = {
    dev = {
      instance_count = 1
      instance_type  = "t3.micro"
      db_instance_class = "db.t3.micro"
      vpc_cidr       = "10.1.0.0/16"
      subnet_cidrs   = ["10.1.1.0/24", "10.1.2.0/24"]
    }
    test = {
      instance_count = 2
      instance_type  = "t3.small"
      db_instance_class = "db.t3.small"
      vpc_cidr       = "10.2.0.0/16"
      subnet_cidrs   = ["10.2.1.0/24", "10.2.2.0/24"]
    }
    staging = {
      instance_count = 3
      instance_type  = "t3.medium"
      db_instance_class = "db.t3.medium"
      vpc_cidr       = "10.3.0.0/16"
      subnet_cidrs   = ["10.3.1.0/24", "10.3.2.0/24", "10.3.3.0/24"]
    }
    prod = {
      instance_count = 5
      instance_type  = "t3.large"
      db_instance_class = "db.t3.large"
      vpc_cidr       = "10.4.0.0/16"
      subnet_cidrs   = ["10.4.1.0/24", "10.4.2.0/24", "10.4.3.0/24"]
    }
  }
  
  config = local.env_config[var.environment]
}

provider "aws" {
  region = var.region
}

# VPC配置
resource "aws_vpc" "main" {
  cidr_block           = local.config.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

# 子网配置
resource "aws_subnet" "private" {
  count = length(local.config.subnet_cidrs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = local.config.subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.environment}-subnet-${count.index}"
    Environment = var.environment
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# 安全组配置
resource "aws_security_group" "app" {
  name_prefix = "${var.environment}-app-sg-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = var.environment == "prod" ? ["0.0.0.0/0"] : ["10.0.0.0/8"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = var.environment
  }
}

# 应用服务器组
resource "aws_launch_template" "app" {
  name_prefix   = "${var.environment}-app-"
  image_id      = var.ami_id
  instance_type = local.config.instance_type

  vpc_security_group_ids = [aws_security_group.app.id]

  user_data = base64encode(templatefile("${path.module}/templates/user-data.sh", {
    environment = var.environment
    app_version = var.app_version
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment}-app-instance"
      Environment = var.environment
    }
  }
}

# 自动扩展组
resource "aws_autoscaling_group" "app" {
  desired_capacity     = local.config.instance_count
  max_size             = local.config.instance_count * 2
  min_size             = local.config.instance_count
  vpc_zone_identifier  = aws_subnet.private[*].id
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [desired_capacity]
  }
}

# RDS数据库实例
resource "aws_db_instance" "main" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = local.config.db_instance_class
  db_name              = "myapp"
  username             = "admin"
  password             = var.db_password
  parameter_group_name = "default.mysql8.0"
  skip_final_snapshot  = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "myapp-prod-final-snapshot" : null

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  tags = {
    Environment = var.environment
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Environment = var.environment
  }
}

resource "aws_security_group" "db" {
  name_prefix = "${var.environment}-db-sg-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = {
    Environment = var.environment
  }
}
```

#### 使用Ansible进行配置管理
```yaml
# Ansible playbook示例：环境配置管理
---
- name: Configure application environment
  hosts: all
  become: yes
  vars:
    environment: "{{ env }}"
    app_version: "{{ version }}"
  
  tasks:
    - name: Update package cache
      apt:
        update_cache: yes
      when: ansible_os_family == "Debian"
    
    - name: Install required packages
      apt:
        name:
          - openjdk-11-jdk
          - python3
          - python3-pip
        state: present
      when: ansible_os_family == "Debian"
    
    - name: Create application user
      user:
        name: appuser
        system: yes
        shell: /bin/bash
        home: /home/appuser
    
    - name: Create application directory
      file:
        path: /opt/myapp
        state: directory
        owner: appuser
        group: appuser
        mode: '0755'
    
    - name: Download application artifact
      get_url:
        url: "https://artifacts.example.com/myapp-{{ app_version }}.jar"
        dest: /opt/myapp/myapp.jar
        owner: appuser
        group: appuser
        mode: '0644'
    
    - name: Create application configuration
      template:
        src: application-{{ environment }}.j2
        dest: /opt/myapp/application.yml
        owner: appuser
        group: appuser
        mode: '0644'
    
    - name: Create systemd service file
      template:
        src: myapp.service.j2
        dest: /etc/systemd/system/myapp.service
        mode: '0644'
    
    - name: Reload systemd
      systemd:
        daemon_reload: yes
    
    - name: Start and enable application service
      systemd:
        name: myapp
        state: started
        enabled: yes
    
    - name: Wait for application to start
      wait_for:
        port: 8080
        delay: 10
        timeout: 60

# 环境特定配置模板示例 (templates/application-dev.j2)
"""
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://{{ hostvars[groups['db'][0]]['ansible_default_ipv4']['address'] }}:3306/myapp
    username: appuser
    password: "{{ app_db_password }}"

logging:
  level:
    com.example: DEBUG
  file:
    name: /var/log/myapp/application.log

management:
  endpoints:
    web:
      exposure:
        include: "*"
"""
```

### 环境管理工具链

#### 环境管理CLI工具
```python
#!/usr/bin/env python3
"""
环境管理CLI工具
提供统一的环境管理命令行接口
"""

import argparse
import sys
from typing import List
from environment_lifecycle_manager import EnvironmentLifecycleManager, EnvironmentType, EnvironmentStatus

class EnvironmentCLI:
    def __init__(self):
        self.manager = EnvironmentLifecycleManager('environment-config.yaml')
        self.parser = self._create_parser()
    
    def _create_parser(self) -> argparse.ArgumentParser:
        """创建命令行参数解析器"""
        parser = argparse.ArgumentParser(
            description='Environment Management CLI Tool',
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Examples:
  # 创建开发环境
  env-cli create --type dev --creator john.doe
  
  # 列出所有测试环境
  env-cli list --type test
  
  # 销毁指定环境
  env-cli destroy --id 123e4567-e89b-12d3-a456-426614174000
            """
        )
        
        subparsers = parser.add_subparsers(dest='command', help='Available commands')
        
        # 创建环境命令
        create_parser = subparsers.add_parser('create', help='Create a new environment')
        create_parser.add_argument('--type', required=True, choices=['dev', 'test', 'staging', 'prod'],
                                 help='Environment type')
        create_parser.add_argument('--creator', required=True, help='Creator name')
        create_parser.add_argument('--tag', action='append', nargs=2, metavar=('KEY', 'VALUE'),
                                 help='Environment tags')
        
        # 列出环境命令
        list_parser = subparsers.add_parser('list', help='List environments')
        list_parser.add_argument('--type', choices=['dev', 'test', 'staging', 'prod'],
                               help='Filter by environment type')
        list_parser.add_argument('--status', choices=['creating', 'active', 'updating', 'destroying', 'inactive', 'error'],
                               help='Filter by environment status')
        
        # 销毁环境命令
        destroy_parser = subparsers.add_parser('destroy', help='Destroy an environment')
        destroy_parser.add_argument('--id', required=True, help='Environment ID')
        
        # 查看环境详情命令
        show_parser = subparsers.add_parser('show', help='Show environment details')
        show_parser.add_argument('--id', required=True, help='Environment ID')
        
        return parser
    
    def run(self, args: List[str] = None):
        """运行CLI工具"""
        parsed_args = self.parser.parse_args(args)
        
        if not parsed_args.command:
            self.parser.print_help()
            return
        
        try:
            if parsed_args.command == 'create':
                self._create_environment(parsed_args)
            elif parsed_args.command == 'list':
                self._list_environments(parsed_args)
            elif parsed_args.command == 'destroy':
                self._destroy_environment(parsed_args)
            elif parsed_args.command == 'show':
                self._show_environment(parsed_args)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    
    def _create_environment(self, args):
        """创建环境"""
        env_type = EnvironmentType(args.type)
        tags = dict(args.tag) if args.tag else {}
        
        env_id = self.manager.create_environment(env_type, args.creator, tags)
        print(f"Environment creation initiated. ID: {env_id}")
    
    def _list_environments(self, args):
        """列出环境"""
        env_type = EnvironmentType(args.type) if args.type else None
        status = EnvironmentStatus(args.status) if args.status else None
        
        environments = self.manager.list_environments(env_type, status)
        
        if not environments:
            print("No environments found")
            return
        
        print(f"{'ID':<36} {'Name':<20} {'Type':<10} {'Status':<12} {'Created At':<20}")
        print("-" * 100)
        
        for env in environments:
            print(f"{env.id:<36} {env.spec.name:<20} {env.spec.type.value:<10} {env.status.value:<12} {env.created_at.strftime('%Y-%m-%d %H:%M'):<20}")
    
    def _destroy_environment(self, args):
        """销毁环境"""
        success = self.manager.destroy_environment(args.id)
        if success:
            print(f"Environment destruction initiated. ID: {args.id}")
        else:
            print(f"Failed to destroy environment. ID: {args.id}")
    
    def _show_environment(self, args):
        """显示环境详情"""
        env = self.manager.get_environment(args.id)
        if not env:
            print(f"Environment not found. ID: {args.id}")
            return
        
        print(f"Environment Details:")
        print(f"  ID: {env.id}")
        print(f"  Name: {env.spec.name}")
        print(f"  Type: {env.spec.type.value}")
        print(f"  Status: {env.status.value}")
        print(f"  Created At: {env.created_at}")
        print(f"  Updated At: {env.updated_at}")
        print(f"  Creator: {env.creator}")
        print(f"  Tags: {env.tags}")
        print(f"  Specification:")
        print(f"    Region: {env.spec.region}")
        print(f"    Instance Count: {env.spec.instance_count}")
        print(f"    Instance Type: {env.spec.instance_type}")
        print(f"    CPU Limit: {env.spec.cpu_limit}")
        print(f"    Memory Limit: {env.spec.memory_limit}")
        print(f"    Storage Size: {env.spec.storage_size}")

# 主函数
if __name__ == "__main__":
    cli = EnvironmentCLI()
    cli.run()
```

## 环境隔离策略

环境隔离是确保不同环境之间互不干扰的重要手段，通过网络隔离、资源隔离和数据隔离等策略，能够有效防止环境间的相互影响。

### 网络隔离实现

#### Kubernetes网络策略
```yaml
# Kubernetes网络策略示例：环境网络隔离
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: environment-isolation
  namespace: dev  # 针对dev环境
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # 允许同环境内的Pod通信
  - from:
    - namespaceSelector:
        matchLabels:
          environment: dev
    ports:
    - protocol: TCP
      port: 8080
    - protocol: TCP
      port: 80
  # 允许特定的外部访问（如监控、日志收集）
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 9090  # Prometheus
  - from:
    - namespaceSelector:
        matchLabels:
          name: logging
    ports:
    - protocol: TCP
      port: 514   # Syslog
  egress:
  # 允许访问同环境内的服务
  - to:
    - namespaceSelector:
        matchLabels:
          environment: dev
    ports:
    - protocol: TCP
      port: 5432  # 数据库端口
    - protocol: TCP
      port: 6379  # Redis端口
  # 允许访问外部依赖（如API、第三方服务）
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8  # 阻止访问内部网络
    ports:
    - protocol: TCP
      port: 443  # HTTPS
    - protocol: TCP
      port: 80   # HTTP
    - protocol: TCP
      port: 53   # DNS
---
# 生产环境的网络策略（更严格）
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: prod-environment-isolation
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # 只允许负载均衡器访问应用端口
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  # 允许监控系统访问监控端口
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 8080
  egress:
  # 只允许访问必要的外部服务
  - to:
    - ipBlock:
        cidr: 34.120.0.0/16  # 允许访问特定的外部API
    ports:
    - protocol: TCP
      port: 443
  # 允许访问内部依赖服务
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
```

#### AWS VPC网络隔离
```hcl
# AWS VPC网络隔离配置
# 为每个环境创建独立的VPC
resource "aws_vpc" "dev" {
  cidr_block           = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "dev-vpc"
    Environment = "dev"
  }
}

resource "aws_vpc" "test" {
  cidr_block           = "10.2.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "test-vpc"
    Environment = "test"
  }
}

resource "aws_vpc" "staging" {
  cidr_block           = "10.3.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "staging-vpc"
    Environment = "staging"
  }
}

resource "aws_vpc" "prod" {
  cidr_block           = "10.4.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "prod-vpc"
    Environment = "prod"
  }
}

# VPC对等连接（仅在必要时）
resource "aws_vpc_peering_connection" "dev_test" {
  peer_vpc_id   = aws_vpc.test.id
  vpc_id        = aws_vpc.dev.id
  auto_accept   = true

  tags = {
    Name = "dev-test-peering"
  }
}

# 安全组规则限制跨环境访问
resource "aws_security_group_rule" "dev_ingress" {
  type              = "ingress"
  from_port         = 8080
  to_port           = 8080
  protocol          = "tcp"
  cidr_blocks       = ["10.1.0.0/16"]  # 仅允许dev环境内部访问
  security_group_id = aws_security_group.dev_app.id
}
```

### 资源隔离实现

#### Kubernetes资源配额
```yaml
# Kubernetes资源配额示例：环境资源隔离
apiVersion: v1
kind: ResourceQuota
metadata:
  name: env-resource-quota
  namespace: dev
spec:
  hard:
    # 计算资源限制
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
    # 存储资源限制
    requests.storage: 20Gi
    persistentvolumeclaims: "10"
    # 对象数量限制
    services.loadbalancers: "2"
    services.nodeports: "0"
    pods: "20"
    replicationcontrollers: "10"
    secrets: "20"
    configmaps: "20"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: env-limit-range
  namespace: dev
spec:
  limits:
  # 容器默认资源限制
  - default:
      cpu: 500m
      memory: 512Mi
    defaultRequest:
      cpu: 250m
      memory: 256Mi
    type: Container
  # Pod资源限制
  - max:
      cpu: "2"
      memory: 2Gi
    min:
      cpu: 100m
      memory: 128Mi
    type: Pod
  # 持久卷资源限制
  - max:
      storage: 10Gi
    min:
      storage: 1Gi
    type: PersistentVolumeClaim
```

#### 资源调度策略
```yaml
# Kubernetes节点亲和性和污点策略
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: prod
spec:
  replicas: 5
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        environment: prod
    spec:
      # 节点亲和性：优先调度到生产环境节点
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: environment
                operator: In
                values:
                - prod
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            preference:
              matchExpressions:
              - key: node-type
                operator: In
                values:
                - high-performance
        
        # Pod亲和性：尽量将同一应用的Pod调度到不同节点
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - myapp
              topologyKey: kubernetes.io/hostname
      
      # 容忍生产环境节点的污点
      tolerations:
      - key: environment
        operator: Equal
        value: prod
        effect: NoSchedule
      
      containers:
      - name: myapp
        image: myapp:v1.0
        resources:
          requests:
            cpu: "1"
            memory: 2Gi
          limits:
            cpu: "2"
            memory: 4Gi
```

### 数据隔离实现

#### 数据库隔离策略
```python
#!/usr/bin/env python3
"""
数据库环境隔离工具
支持多环境数据库的创建、配置和隔离
"""

import boto3
from typing import Dict, List
import json

class DatabaseEnvironmentManager:
    def __init__(self, region: str = 'us-west-2'):
        self.rds_client = boto3.client('rds', region_name=region)
        self.ec2_client = boto3.client('ec2', region_name=region)
    
    def create_isolated_database(
        self,
        env_name: str,
        db_instance_identifier: str,
        master_username: str,
        master_password: str,
        db_name: str,
        instance_class: str = 'db.t3.micro',
        allocated_storage: int = 20
    ) -> Dict:
        """
        创建隔离的数据库实例
        
        Args:
            env_name: 环境名称
            db_instance_identifier: 数据库实例标识符
            master_username: 主用户名
            master_password: 主用户密码
            db_name: 数据库名称
            instance_class: 实例类型
            allocated_storage: 存储空间(GiB)
            
        Returns:
            数据库实例信息
        """
        # 创建数据库子网组
        subnet_group_name = f"{env_name}-db-subnet-group"
        self._create_db_subnet_group(subnet_group_name, env_name)
        
        # 创建安全组
        security_group_id = self._create_db_security_group(env_name)
        
        # 创建数据库实例
        response = self.rds_client.create_db_instance(
            DBInstanceIdentifier=db_instance_identifier,
            DBName=db_name,
            MasterUsername=master_username,
            MasterUserPassword=master_password,
            DBInstanceClass=instance_class,
            Engine='mysql',
            AllocatedStorage=allocated_storage,
            StorageType='gp2',
            VpcSecurityGroupIds=[security_group_id],
            DBSubnetGroupName=subnet_group_name,
            BackupRetentionPeriod=7 if env_name == 'prod' else 1,
            MultiAZ=True if env_name == 'prod' else False,
            PubliclyAccessible=False,
            Tags=[
                {'Key': 'Environment', 'Value': env_name},
                {'Key': 'Name', 'Value': f"{env_name}-database"}
            ]
        )
        
        return response['DBInstance']
    
    def _create_db_subnet_group(self, subnet_group_name: str, env_name: str):
        """创建数据库子网组"""
        # 获取环境对应的子网
        subnets = self.ec2_client.describe_subnets(
            Filters=[
                {'Name': 'tag:Environment', 'Value': env_name},
                {'Name': 'tag:Type', 'Value': 'private'}
            ]
        )
        
        subnet_ids = [subnet['SubnetId'] for subnet in subnets['Subnets']]
        
        try:
            self.rds_client.create_db_subnet_group(
                DBSubnetGroupName=subnet_group_name,
                DBSubnetGroupDescription=f"Subnet group for {env_name} environment",
                SubnetIds=subnet_ids,
                Tags=[
                    {'Key': 'Environment', 'Value': env_name}
                ]
            )
        except self.rds_client.exceptions.DBSubnetGroupAlreadyExistsFault:
            print(f"Subnet group {subnet_group_name} already exists")
    
    def _create_db_security_group(self, env_name: str) -> str:
        """创建数据库安全组"""
        # 获取VPC ID
        vpcs = self.ec2_client.describe_vpcs(
            Filters=[{'Name': 'tag:Environment', 'Value': env_name}]
        )
        
        if not vpcs['Vpcs']:
            raise Exception(f"No VPC found for environment {env_name}")
        
        vpc_id = vpcs['Vpcs'][0]['VpcId']
        
        # 创建安全组
        response = self.ec2_client.create_security_group(
            GroupName=f"{env_name}-db-sg",
            Description=f"Security group for {env_name} database",
            VpcId=vpc_id,
            TagSpecifications=[
                {
                    'ResourceType': 'security-group',
                    'Tags': [
                        {'Key': 'Environment', 'Value': env_name},
                        {'Key': 'Name', 'Value': f"{env_name}-db-sg"}
                    ]
                }
            ]
        )
        
        security_group_id = response['GroupId']
        
        # 添加安全组规则
        self.ec2_client.authorize_security_group_ingress(
            GroupId=security_group_id,
            IpPermissions=[
                {
                    'IpProtocol': 'tcp',
                    'FromPort': 3306,
                    'ToPort': 3306,
                    'UserIdGroupPairs': [
                        {
                            'GroupId': self._get_app_security_group_id(env_name),
                            'Description': 'Allow application access'
                        }
                    ]
                }
            ]
        )
        
        return security_group_id
    
    def _get_app_security_group_id(self, env_name: str) -> str:
        """获取应用安全组ID"""
        response = self.ec2_client.describe_security_groups(
            Filters=[
                {'Name': 'tag:Environment', 'Value': env_name},
                {'Name': 'tag:Type', 'Value': 'app'}
            ]
        )
        
        if not response['SecurityGroups']:
            raise Exception(f"No app security group found for environment {env_name}")
        
        return response['SecurityGroups'][0]['GroupId']
    
    def setup_cross_environment_access(
        self,
        source_env: str,
        target_env: str,
        reason: str
    ) -> bool:
        """
        设置跨环境数据库访问（仅在必要时，如数据迁移）
        
        Args:
            source_env: 源环境
            target_env: 目标环境
            reason: 访问原因
            
        Returns:
            是否设置成功
        """
        try:
            # 获取源环境应用安全组
            source_sg_id = self._get_app_security_group_id(source_env)
            
            # 获取目标环境数据库安全组
            target_sg_id = self._get_db_security_group_id(target_env)
            
            # 添加临时访问规则
            self.ec2_client.authorize_security_group_ingress(
                GroupId=target_sg_id,
                IpPermissions=[
                    {
                        'IpProtocol': 'tcp',
                        'FromPort': 3306,
                        'ToPort': 3306,
                        'UserIdGroupPairs': [
                            {
                                'GroupId': source_sg_id,
                                'Description': f"Cross-env access for {reason}"
                            }
                        ]
                    }
                ]
            )
            
            # 记录访问日志
            self._log_cross_environment_access(source_env, target_env, reason)
            
            return True
        except Exception as e:
            print(f"Failed to setup cross-environment access: {e}")
            return False
    
    def _get_db_security_group_id(self, env_name: str) -> str:
        """获取数据库安全组ID"""
        response = self.ec2_client.describe_security_groups(
            Filters=[
                {'Name': 'tag:Environment', 'Value': env_name},
                {'Name': 'tag:Type', 'Value': 'db'}
            ]
        )
        
        if not response['SecurityGroups']:
            raise Exception(f"No db security group found for environment {env_name}")
        
        return response['SecurityGroups'][0]['GroupId']
    
    def _log_cross_environment_access(
        self,
        source_env: str,
        target_env: str,
        reason: str
    ):
        """记录跨环境访问日志"""
        log_entry = {
            'timestamp': str(datetime.datetime.now()),
            'source_env': source_env,
            'target_env': target_env,
            'reason': reason
        }
        
        # 这里应该将日志写入日志系统
        print(f"Cross-environment access log: {json.dumps(log_entry)}")

# 使用示例
if __name__ == "__main__":
    db_manager = DatabaseEnvironmentManager()
    
    # 为生产环境创建数据库
    prod_db = db_manager.create_isolated_database(
        env_name='prod',
        db_instance_identifier='myapp-prod-db',
        master_username='admin',
        master_password='secure-password-123',
        db_name='myapp',
        instance_class='db.r5.large',
        allocated_storage=100
    )
    
    print(f"Created production database: {prod_db['Endpoint']['Address']}")
```

通过建立完善的环境管理体系，包括合理的环境层次结构、自动化的环境管理工具和严格的环境隔离策略，团队能够实现高效、安全、可靠的环境管理。这不仅能够提高开发和测试效率，还能确保生产环境的稳定性和安全性，为企业的数字化转型提供坚实的基础。