---
title: 自动化测试管理与执行: 测试环境准备、测试用例筛选、测试报告分析
date: 2025-08-30
categories: [CICD]
tags: [ci,cd]
published: true
---
自动化测试的成功实施不仅依赖于测试用例的编写，更需要完善的测试管理体系。测试环境的准备是自动化测试的前提，它需要确保环境的一致性和可重复性。测试用例的筛选能够提高测试效率，通过智能算法选择最相关的测试用例执行。测试报告的分析则为质量评估和问题定位提供重要依据。通过将这些环节自动化，可以显著提高测试效率和质量。本文将深入探讨自动化测试管理与执行的关键环节，包括测试环境准备、测试用例筛选和测试报告分析等核心内容。

## 测试环境自动化准备

测试环境的自动化准备是确保测试一致性和可重复性的关键。通过基础设施即代码和容器化技术，可以实现测试环境的快速创建和销毁，确保每次测试都在相同条件下执行。

### 基础设施即代码实现

#### Terraform测试环境配置
```hcl
# test-environment.tf
variable "environment_name" {
  description = "测试环境名称"
  type        = string
  default     = "test"
}

variable "region" {
  description = "AWS区域"
  type        = string
  default     = "us-west-2"
}

# VPC配置
resource "aws_vpc" "test_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.environment_name}-vpc"
  }
}

# 子网配置
resource "aws_subnet" "test_subnet" {
  vpc_id                  = aws_vpc.test_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment_name}-subnet"
  }
}

# 安全组配置
resource "aws_security_group" "test_sg" {
  name        = "${var.environment_name}-sg"
  description = "测试环境安全组"
  vpc_id      = aws_vpc.test_vpc.id

  # HTTP访问
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS访问
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH访问（仅限特定IP）
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/24"]  # 替换为实际IP范围
  }

  # 出站规则
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment_name}-sg"
  }
}

# 数据库实例
resource "aws_db_instance" "test_db" {
  identifier              = "${var.environment_name}-db"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  storage_type            = "gp2"
  username                = "testuser"
  password                = "testpassword123"
  parameter_group_name    = "default.mysql8.0"
  skip_final_snapshot     = true
  publicly_accessible     = false
  vpc_security_group_ids  = [aws_security_group.test_sg.id]
  db_subnet_group_name    = aws_db_subnet_group.test_db_subnet_group.name

  tags = {
    Name = "${var.environment_name}-db"
  }
}

# 数据库子网组
resource "aws_db_subnet_group" "test_db_subnet_group" {
  name       = "${var.environment_name}-db-subnet-group"
  subnet_ids = [aws_subnet.test_subnet.id]

  tags = {
    Name = "${var.environment_name}-db-subnet-group"
  }
}

# 输出变量
output "vpc_id" {
  value = aws_vpc.test_vpc.id
}

output "subnet_id" {
  value = aws_subnet.test_subnet.id
}

output "database_endpoint" {
  value = aws_db_instance.test_db.endpoint
}
```

#### Ansible环境配置剧本
```yaml
# test-environment-playbook.yml
---
- name: 配置测试环境
  hosts: test_servers
  become: yes
  vars:
    app_user: testapp
    app_group: testapp
    app_port: 8080
    java_version: "11"
    nodejs_version: "16"

  tasks:
    - name: 更新系统包
      apt:
        update_cache: yes
        upgrade: yes
      when: ansible_os_family == "Debian"

    - name: 安装基础依赖
      apt:
        name:
          - curl
          - wget
          - git
          - unzip
          - openjdk-{{ java_version }}-jdk
          - nodejs
          - npm
        state: present
      when: ansible_os_family == "Debian"

    - name: 创建应用用户组
      group:
        name: "{{ app_group }}"
        state: present

    - name: 创建应用用户
      user:
        name: "{{ app_user }}"
        group: "{{ app_group }}"
        shell: /bin/bash
        create_home: yes

    - name: 创建应用目录
      file:
        path: /opt/testapp
        state: directory
        owner: "{{ app_user }}"
        group: "{{ app_group }}"
        mode: '0755'

    - name: 配置防火墙
      ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop:
        - "22"
        - "{{ app_port }}"

    - name: 启动防火墙
      ufw:
        state: enabled

    - name: 配置系统服务
      template:
        src: testapp.service.j2
        dest: /etc/systemd/system/testapp.service
        mode: '0644'

    - name: 重新加载systemd
      systemd:
        daemon_reload: yes

    - name: 启动应用服务
      systemd:
        name: testapp
        state: started
        enabled: yes
```

### 容器化测试环境

#### Docker Compose测试环境
```yaml
# docker-compose.test.yml
version: '3.8'

services:
  # 应用服务
  app:
    build:
      context: .
      dockerfile: Dockerfile.test
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=test
      - DATABASE_URL=jdbc:postgresql://postgres:5432/testdb
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    volumes:
      - ./test-data:/app/data
    networks:
      - test-network

  # 数据库服务
  postgres:
    image: postgres:13-alpine
    environment:
      - POSTGRES_DB=testdb
      - POSTGRES_USER=testuser
      - POSTGRES_PASSWORD=testpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - test-network

  # 缓存服务
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - test-network

  # 消息队列服务
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=testuser
      - RABBITMQ_DEFAULT_PASS=testpass
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - test-network

  # 模拟外部API服务
  mock-api:
    image: mockserver/mockserver:5.11.2
    ports:
      - "1080:1080"
    environment:
      - MOCKSERVER_WATCH_INITIALIZATION_JSON=true
    volumes:
      - ./mock-data:/config
    networks:
      - test-network

  # 测试执行服务
  test-runner:
    build:
      context: .
      dockerfile: Dockerfile.test-runner
    depends_on:
      - app
      - postgres
      - redis
      - rabbitmq
    environment:
      - TEST_ENV=test
      - APP_URL=http://app:8080
    volumes:
      - ./test-results:/app/test-results
      - ./coverage:/app/coverage
    networks:
      - test-network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  test-network:
    driver: bridge
```

#### 测试环境管理脚本
```bash
#!/bin/bash
# test-environment-manager.sh

set -e

ENV_NAME=${1:-"default"}
ACTION=${2:-"up"}
COMPOSE_FILE="docker-compose.test.yml"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        exit 1
    fi
}

# 创建测试环境
create_environment() {
    log "Creating test environment: ${ENV_NAME}"
    
    # 设置环境变量
    export COMPOSE_PROJECT_NAME="test-${ENV_NAME}"
    
    # 构建镜像
    docker-compose -f ${COMPOSE_FILE} build
    
    # 启动服务
    docker-compose -f ${COMPOSE_FILE} up -d
    
    # 等待服务启动
    wait_for_services
    
    log "Test environment ${ENV_NAME} created successfully"
}

# 销毁测试环境
destroy_environment() {
    log "Destroying test environment: ${ENV_NAME}"
    
    # 设置环境变量
    export COMPOSE_PROJECT_NAME="test-${ENV_NAME}"
    
    # 停止并删除服务
    docker-compose -f ${COMPOSE_FILE} down -v --remove-orphans
    
    log "Test environment ${ENV_NAME} destroyed successfully"
}

# 等待服务启动
wait_for_services() {
    log "Waiting for services to start..."
    
    # 等待关键服务启动
    services=("app" "postgres" "redis" "rabbitmq")
    
    for service in "${services[@]}"; do
        log "Waiting for ${service}..."
        timeout=60
        counter=0
        
        while ! docker-compose -f ${COMPOSE_FILE} exec ${service} echo "ready" &> /dev/null; do
            sleep 2
            counter=$((counter + 2))
            
            if [ $counter -ge $timeout ]; then
                error "Service ${service} failed to start within ${timeout} seconds"
                exit 1
            fi
            
            # 检查容器状态
            status=$(docker-compose -f ${COMPOSE_FILE} ps -q ${service} | xargs docker inspect -f '{{.State.Running}}' 2>/dev/null || echo "false")
            if [ "$status" = "false" ]; then
                error "Service ${service} container is not running"
                exit 1
            fi
        done
        
        log "${service} is ready"
    done
    
    log "All services are ready"
}

# 运行测试
run_tests() {
    log "Running tests in environment: ${ENV_NAME}"
    
    # 设置环境变量
    export COMPOSE_PROJECT_NAME="test-${ENV_NAME}"
    
    # 运行测试
    docker-compose -f ${COMPOSE_FILE} run --rm test-runner
    
    # 收集测试结果
    collect_test_results
}

# 收集测试结果
collect_test_results() {
    log "Collecting test results..."
    
    # 创建结果目录
    mkdir -p test-results/${ENV_NAME}
    
    # 复制测试报告
    docker-compose -f ${COMPOSE_FILE} cp test-runner:/app/test-results/. test-results/${ENV_NAME}/
    docker-compose -f ${COMPOSE_FILE} cp test-runner:/app/coverage/. test-results/${ENV_NAME}/coverage/
    
    log "Test results collected in test-results/${ENV_NAME}"
}

# 主函数
main() {
    check_docker
    
    case $ACTION in
        "up")
            create_environment
            ;;
        "down")
            destroy_environment
            ;;
        "test")
            run_tests
            ;;
        "recreate")
            destroy_environment
            create_environment
            ;;
        *)
            error "Unknown action: $ACTION"
            echo "Usage: $0 [environment_name] [up|down|test|recreate]"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
```

## 测试用例智能筛选

测试用例筛选是提高测试效率的重要手段，通过分析代码变更和历史测试数据，智能选择最相关的测试用例执行，避免全量测试的时间浪费。

### 基于代码变更的测试筛选

#### Git差异分析
```python
import subprocess
import os
import json
from typing import List, Set, Dict
from pathlib import Path

class TestSelector:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.test_mapping = self._load_test_mapping()
    
    def _load_test_mapping(self) -> Dict[str, List[str]]:
        """加载测试映射关系"""
        mapping_file = self.project_root / ".test-mapping.json"
        if mapping_file.exists():
            with open(mapping_file, 'r') as f:
                return json.load(f)
        return {}
    
    def get_changed_files(self, base_commit: str, target_commit: str = "HEAD") -> List[str]:
        """获取变更的文件列表"""
        try:
            result = subprocess.run([
                "git", "diff", "--name-only", base_commit, target_commit
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode != 0:
                raise Exception(f"Git command failed: {result.stderr}")
            
            return result.stdout.strip().split('\n')
        except Exception as e:
            print(f"Error getting changed files: {e}")
            return []
    
    def get_affected_tests(self, changed_files: List[str]) -> Set[str]:
        """获取受影响的测试用例"""
        affected_tests = set()
        
        for file_path in changed_files:
            # 直接映射
            if file_path in self.test_mapping:
                affected_tests.update(self.test_mapping[file_path])
            
            # 模块级映射
            module_path = self._get_module_path(file_path)
            if module_path and module_path in self.test_mapping:
                affected_tests.update(self.test_mapping[module_path])
            
            # 依赖分析
            dependencies = self._analyze_dependencies(file_path)
            for dep in dependencies:
                if dep in self.test_mapping:
                    affected_tests.update(self.test_mapping[dep])
        
        return affected_tests
    
    def _get_module_path(self, file_path: str) -> str:
        """获取文件所属模块路径"""
        path_parts = file_path.split('/')
        if len(path_parts) > 1:
            return '/'.join(path_parts[:-1])
        return ""
    
    def _analyze_dependencies(self, file_path: str) -> List[str]:
        """分析文件依赖关系"""
        dependencies = []
        
        # 对于Java文件，分析import语句
        if file_path.endswith('.java'):
            dependencies.extend(self._analyze_java_imports(file_path))
        
        # 对于Python文件，分析import语句
        elif file_path.endswith('.py'):
            dependencies.extend(self._analyze_python_imports(file_path))
        
        # 对于JavaScript文件，分析import语句
        elif file_path.endswith(('.js', '.ts')):
            dependencies.extend(self._analyze_js_imports(file_path))
        
        return dependencies
    
    def _analyze_java_imports(self, file_path: str) -> List[str]:
        """分析Java文件的import语句"""
        dependencies = []
        try:
            with open(self.project_root / file_path, 'r') as f:
                for line in f:
                    if line.strip().startswith('import '):
                        # 提取导入的类或包
                        import_stmt = line.strip().replace('import ', '').replace(';', '')
                        dependencies.append(import_stmt.replace('.', '/') + '.java')
        except Exception as e:
            print(f"Error analyzing Java imports: {e}")
        return dependencies
    
    def _analyze_python_imports(self, file_path: str) -> List[str]:
        """分析Python文件的import语句"""
        dependencies = []
        try:
            with open(self.project_root / file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('import ') or line.startswith('from '):
                        # 提取导入的模块
                        if line.startswith('import '):
                            module = line.replace('import ', '').split()[0]
                        else:  # from ... import ...
                            module = line.replace('from ', '').split()[0]
                        
                        # 转换为文件路径
                        module_path = module.replace('.', '/') + '.py'
                        dependencies.append(module_path)
        except Exception as e:
            print(f"Error analyzing Python imports: {e}")
        return dependencies
    
    def _analyze_js_imports(self, file_path: str) -> List[str]:
        """分析JavaScript/TypeScript文件的import语句"""
        dependencies = []
        try:
            with open(self.project_root / file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if 'import ' in line or 'require(' in line:
                        # 简化的依赖分析
                        # 实际应用中可能需要更复杂的解析
                        pass
        except Exception as e:
            print(f"Error analyzing JS imports: {e}")
        return dependencies
    
    def generate_test_command(self, affected_tests: Set[str], test_framework: str = "jest") -> str:
        """生成测试执行命令"""
        if not affected_tests:
            return ""
        
        if test_framework == "jest":
            # Jest测试命令
            test_patterns = " ".join([f"--testPathPattern={test}" for test in affected_tests])
            return f"npm test {test_patterns}"
        elif test_framework == "pytest":
            # Pytest测试命令
            test_files = " ".join(affected_tests)
            return f"python -m pytest {test_files}"
        elif test_framework == "junit":
            # JUnit测试命令
            test_classes = ",".join(affected_tests)
            return f"./gradlew test --tests \"{test_classes}\""
        else:
            return ""

# 使用示例
if __name__ == "__main__":
    selector = TestSelector()
    
    # 获取最近一次提交的变更文件
    changed_files = selector.get_changed_files("HEAD~1")
    print(f"Changed files: {changed_files}")
    
    # 获取受影响的测试
    affected_tests = selector.get_affected_tests(changed_files)
    print(f"Affected tests: {affected_tests}")
    
    # 生成测试命令
    test_command = selector.generate_test_command(affected_tests)
    print(f"Test command: {test_command}")
```

### 基于历史数据的智能筛选

#### 测试历史数据分析
```python
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Set
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class IntelligentTestSelector:
    def __init__(self, db_path: str = "test_history.db"):
        self.db_path = db_path
        self._init_database()
        self.tfidf_vectorizer = TfidfVectorizer()
    
    def _init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 创建测试执行历史表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS test_executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_name TEXT NOT NULL,
                file_path TEXT,
                execution_time REAL,
                success BOOLEAN,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建文件变更历史表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS file_changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT NOT NULL,
                commit_hash TEXT,
                change_type TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建测试-文件关联表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS test_file_correlations (
                test_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                correlation_score REAL,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (test_name, file_path)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def record_test_execution(self, test_name: str, file_path: str, execution_time: float, success: bool):
        """记录测试执行结果"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO test_executions (test_name, file_path, execution_time, success)
            VALUES (?, ?, ?, ?)
        ''', (test_name, file_path, execution_time, success))
        
        conn.commit()
        conn.close()
    
    def record_file_change(self, file_path: str, commit_hash: str, change_type: str):
        """记录文件变更"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO file_changes (file_path, commit_hash, change_type)
            VALUES (?, ?, ?)
        ''', (file_path, commit_hash, change_type))
        
        conn.commit()
        conn.close()
    
    def update_correlations(self):
        """更新测试-文件关联度"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取最近30天的数据
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # 获取测试执行数据
        cursor.execute('''
            SELECT test_name, file_path, success
            FROM test_executions
            WHERE timestamp > ?
        ''', (thirty_days_ago,))
        
        test_executions = cursor.fetchall()
        
        # 计算关联度
        correlations = {}
        for test_name, file_path, success in test_executions:
            key = (test_name, file_path)
            if key not in correlations:
                correlations[key] = {'total': 0, 'success': 0}
            
            correlations[key]['total'] += 1
            if success:
                correlations[key]['success'] += 1
        
        # 更新数据库
        cursor.execute('DELETE FROM test_file_correlations')
        
        for (test_name, file_path), stats in correlations.items():
            correlation_score = stats['success'] / stats['total']
            cursor.execute('''
                INSERT INTO test_file_correlations (test_name, file_path, correlation_score)
                VALUES (?, ?, ?)
            ''', (test_name, file_path, correlation_score))
        
        conn.commit()
        conn.close()
    
    def predict_affected_tests(self, changed_files: List[str]) -> Dict[str, float]:
        """预测受影响的测试及其概率"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        affected_tests = {}
        
        for file_path in changed_files:
            cursor.execute('''
                SELECT test_name, correlation_score
                FROM test_file_correlations
                WHERE file_path = ?
                ORDER BY correlation_score DESC
            ''', (file_path,))
            
            results = cursor.fetchall()
            for test_name, correlation_score in results:
                if test_name not in affected_tests:
                    affected_tests[test_name] = 0
                affected_tests[test_name] = max(affected_tests[test_name], correlation_score)
        
        conn.close()
        return affected_tests
    
    def select_tests_by_priority(self, changed_files: List[str], max_tests: int = 50) -> List[str]:
        """根据优先级选择测试用例"""
        affected_tests = self.predict_affected_tests(changed_files)
        
        # 按关联度排序
        sorted_tests = sorted(affected_tests.items(), key=lambda x: x[1], reverse=True)
        
        # 选择前N个测试
        selected_tests = [test[0] for test in sorted_tests[:max_tests]]
        
        return selected_tests
    
    def get_test_recommendations(self, changed_files: List[str], confidence_threshold: float = 0.3) -> Dict[str, Dict]:
        """获取测试推荐"""
        affected_tests = self.predict_affected_tests(changed_files)
        
        recommendations = {}
        for test_name, confidence in affected_tests.items():
            if confidence >= confidence_threshold:
                # 获取测试历史信息
                conn = sqlite3.connect(self.db_path)
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT AVG(execution_time), COUNT(*) as execution_count
                    FROM test_executions
                    WHERE test_name = ?
                ''', (test_name,))
                
                result = cursor.fetchone()
                avg_execution_time = result[0] if result[0] else 0
                execution_count = result[1] if result[1] else 0
                
                conn.close()
                
                recommendations[test_name] = {
                    'confidence': confidence,
                    'avg_execution_time': avg_execution_time,
                    'execution_count': execution_count,
                    'priority': 'high' if confidence > 0.7 else 'medium' if confidence > 0.4 else 'low'
                }
        
        return recommendations

# 使用示例
if __name__ == "__main__":
    selector = IntelligentTestSelector()
    
    # 记录测试执行
    selector.record_test_execution("UserServiceTest.testCreateUser", "src/main/java/com/example/UserService.java", 0.5, True)
    selector.record_test_execution("UserServiceTest.testUpdateUser", "src/main/java/com/example/UserService.java", 0.3, True)
    
    # 记录文件变更
    selector.record_file_change("src/main/java/com/example/UserService.java", "abc123", "modified")
    
    # 更新关联度
    selector.update_correlations()
    
    # 预测受影响的测试
    changed_files = ["src/main/java/com/example/UserService.java"]
    recommendations = selector.get_test_recommendations(changed_files)
    
    print("Test recommendations:")
    for test_name, info in recommendations.items():
        print(f"  {test_name}: confidence={info['confidence']:.2f}, priority={info['priority']}")
```

## 测试报告自动化分析

测试报告的自动化分析能够为质量评估和问题定位提供重要依据。通过解析测试结果、生成可视化报告和识别质量趋势，可以帮助团队及时发现和解决质量问题。

### 测试报告解析器

#### JUnit XML报告解析
```python
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class TestCaseResult:
    name: str
    classname: str
    time: float
    status: str  # passed, failed, skipped
    failure_message: Optional[str] = None
    failure_type: Optional[str] = None
    system_out: Optional[str] = None
    system_err: Optional[str] = None

@dataclass
class TestSuiteResult:
    name: str
    tests: int
    failures: int
    errors: int
    skipped: int
    time: float
    timestamp: str
    test_cases: List[TestCaseResult]

class JUnitReportParser:
    def __init__(self):
        self.suite_results: List[TestSuiteResult] = []
    
    def parse_report(self, report_path: str) -> List[TestSuiteResult]:
        """解析JUnit XML报告"""
        tree = ET.parse(report_path)
        root = tree.getroot()
        
        if root.tag == 'testsuites':
            # 多个测试套件
            for suite_element in root.findall('testsuite'):
                suite_result = self._parse_test_suite(suite_element)
                self.suite_results.append(suite_result)
        elif root.tag == 'testsuite':
            # 单个测试套件
            suite_result = self._parse_test_suite(root)
            self.suite_results.append(suite_result)
        
        return self.suite_results
    
    def _parse_test_suite(self, suite_element: ET.Element) -> TestSuiteResult:
        """解析单个测试套件"""
        name = suite_element.get('name', 'Unknown')
        tests = int(suite_element.get('tests', 0))
        failures = int(suite_element.get('failures', 0))
        errors = int(suite_element.get('errors', 0))
        skipped = int(suite_element.get('skipped', 0))
        time = float(suite_element.get('time', 0))
        timestamp = suite_element.get('timestamp', '')
        
        test_cases = []
        for case_element in suite_element.findall('testcase'):
            test_case = self._parse_test_case(case_element)
            test_cases.append(test_case)
        
        return TestSuiteResult(
            name=name,
            tests=tests,
            failures=failures,
            errors=errors,
            skipped=skipped,
            time=time,
            timestamp=timestamp,
            test_cases=test_cases
        )
    
    def _parse_test_case(self, case_element: ET.Element) -> TestCaseResult:
        """解析单个测试用例"""
        name = case_element.get('name', 'Unknown')
        classname = case_element.get('classname', 'Unknown')
        time = float(case_element.get('time', 0))
        
        # 检查失败
        failure_element = case_element.find('failure')
        if failure_element is not None:
            status = 'failed'
            failure_message = failure_element.get('message')
            failure_type = failure_element.get('type')
        else:
            failure_message = None
            failure_type = None
            # 检查错误
            error_element = case_element.find('error')
            if error_element is not None:
                status = 'failed'
                failure_message = error_element.get('message')
                failure_type = error_element.get('type')
            else:
                # 检查跳过
                skipped_element = case_element.find('skipped')
                if skipped_element is not None:
                    status = 'skipped'
                else:
                    status = 'passed'
        
        # 获取系统输出
        system_out_element = case_element.find('system-out')
        system_out = system_out_element.text if system_out_element is not None else None
        
        system_err_element = case_element.find('system-err')
        system_err = system_err_element.text if system_err_element is not None else None
        
        return TestCaseResult(
            name=name,
            classname=classname,
            time=time,
            status=status,
            failure_message=failure_message,
            failure_type=failure_type,
            system_out=system_out,
            system_err=system_err
        )
    
    def get_summary(self) -> Dict:
        """获取测试摘要"""
        total_tests = sum(suite.tests for suite in self.suite_results)
        total_failures = sum(suite.failures for suite in self.suite_results)
        total_errors = sum(suite.errors for suite in self.suite_results)
        total_skipped = sum(suite.skipped for suite in self.suite_results)
        total_time = sum(suite.time for suite in self.suite_results)
        
        passed_tests = total_tests - total_failures - total_errors - total_skipped
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': total_failures,
            'error_tests': total_errors,
            'skipped_tests': total_skipped,
            'success_rate': round(success_rate, 2),
            'total_time': round(total_time, 2)
        }
    
    def get_failed_tests(self) -> List[TestCaseResult]:
        """获取失败的测试用例"""
        failed_tests = []
        for suite in self.suite_results:
            for test_case in suite.test_cases:
                if test_case.status == 'failed':
                    failed_tests.append(test_case)
        return failed_tests
    
    def generate_html_report(self, output_path: str):
        """生成HTML报告"""
        summary = self.get_summary()
        failed_tests = self.get_failed_tests()
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .summary {{ background-color: #f5f5f5; padding: 20px; border-radius: 5px; }}
        .metrics {{ display: flex; justify-content: space-around; margin: 20px 0; }}
        .metric {{ text-align: center; }}
        .metric-value {{ font-size: 24px; font-weight: bold; }}
        .passed {{ color: #28a745; }}
        .failed {{ color: #dc3545; }}
        .table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .table th, .table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        .table th {{ background-color: #f2f2f2; }}
        .failure {{ background-color: #f8d7da; }}
    </style>
</head>
<body>
    <h1>Test Execution Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">{summary['total_tests']}</div>
                <div>Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value passed">{summary['passed_tests']}</div>
                <div>Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value failed">{summary['failed_tests']}</div>
                <div>Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">{summary['success_rate']}%</div>
                <div>Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">{summary['total_time']}s</div>
                <div>Total Time</div>
            </div>
        </div>
    </div>
    
    <h2>Failed Tests</h2>
    <table class="table">
        <thead>
            <tr>
                <th>Test Name</th>
                <th>Class</th>
                <th>Failure Message</th>
                <th>Time (s)</th>
            </tr>
        </thead>
        <tbody>
"""
        
        for test_case in failed_tests:
            html_content += f"""
            <tr class="failure">
                <td>{test_case.name}</td>
                <td>{test_case.classname}</td>
                <td>{test_case.failure_message or 'No message'}</td>
                <td>{test_case.time}</td>
            </tr>
"""
        
        html_content += """
        </tbody>
    </table>
</body>
</html>
"""
        
        with open(output_path, 'w') as f:
            f.write(html_content)

# 使用示例
if __name__ == "__main__":
    parser = JUnitReportParser()
    results = parser.parse_report("test-results/junit.xml")
    
    # 打印摘要
    summary = parser.get_summary()
    print("Test Summary:")
    for key, value in summary.items():
        print(f"  {key}: {value}")
    
    # 生成HTML报告
    parser.generate_html_report("test-report.html")
    print("HTML report generated: test-report.html")
```

### 质量趋势分析

#### 测试质量监控
```python
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import matplotlib.pyplot as plt
import numpy as np
from dataclasses import dataclass

@dataclass
class QualityMetric:
    timestamp: datetime
    success_rate: float
    total_tests: int
    execution_time: float
    code_coverage: float

class QualityTrendAnalyzer:
    def __init__(self, db_path: str = "quality_metrics.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quality_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                success_rate REAL,
                total_tests INTEGER,
                execution_time REAL,
                code_coverage REAL,
                build_number TEXT,
                branch TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def record_metrics(self, metrics: QualityMetric, build_number: str = "", branch: str = "main"):
        """记录质量指标"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO quality_metrics 
            (timestamp, success_rate, total_tests, execution_time, code_coverage, build_number, branch)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            metrics.timestamp,
            metrics.success_rate,
            metrics.total_tests,
            metrics.execution_time,
            metrics.code_coverage,
            build_number,
            branch
        ))
        
        conn.commit()
        conn.close()
    
    def get_metrics_history(self, days: int = 30, branch: str = "main") -> List[QualityMetric]:
        """获取历史质量指标"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since_date = datetime.now() - timedelta(days=days)
        
        cursor.execute('''
            SELECT timestamp, success_rate, total_tests, execution_time, code_coverage
            FROM quality_metrics
            WHERE timestamp > ? AND branch = ?
            ORDER BY timestamp ASC
        ''', (since_date, branch))
        
        results = cursor.fetchall()
        conn.close()
        
        metrics_history = []
        for row in results:
            metrics_history.append(QualityMetric(
                timestamp=datetime.fromisoformat(row[0]),
                success_rate=row[1],
                total_tests=row[2],
                execution_time=row[3],
                code_coverage=row[4]
            ))
        
        return metrics_history
    
    def analyze_trends(self, days: int = 30) -> Dict:
        """分析质量趋势"""
        metrics_history = self.get_metrics_history(days)
        
        if not metrics_history:
            return {}
        
        # 计算各项指标的趋势
        success_rates = [m.success_rate for m in metrics_history]
        execution_times = [m.execution_time for m in metrics_history]
        code_coverages = [m.code_coverage for m in metrics_history]
        
        # 趋势分析
        success_rate_trend = self._calculate_trend(success_rates)
        execution_time_trend = self._calculate_trend(execution_times)
        code_coverage_trend = self._calculate_trend(code_coverages)
        
        # 统计信息
        avg_success_rate = np.mean(success_rates)
        avg_execution_time = np.mean(execution_times)
        avg_code_coverage = np.mean(code_coverages)
        
        # 最新值
        latest_metrics = metrics_history[-1]
        
        return {
            'period': f'Last {days} days',
            'total_builds': len(metrics_history),
            'latest_metrics': {
                'success_rate': latest_metrics.success_rate,
                'execution_time': latest_metrics.execution_time,
                'code_coverage': latest_metrics.code_coverage
            },
            'averages': {
                'success_rate': round(avg_success_rate, 2),
                'execution_time': round(avg_execution_time, 2),
                'code_coverage': round(avg_code_coverage, 2)
            },
            'trends': {
                'success_rate': success_rate_trend,
                'execution_time': execution_time_trend,
                'code_coverage': code_coverage_trend
            }
        }
    
    def _calculate_trend(self, values: List[float]) -> Dict:
        """计算趋势"""
        if len(values) < 2:
            return {'direction': 'stable', 'slope': 0}
        
        # 简单线性回归计算斜率
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        
        if slope > 0.1:
            direction = 'improving'
        elif slope < -0.1:
            direction = 'deteriorating'
        else:
            direction = 'stable'
        
        return {
            'direction': direction,
            'slope': round(slope, 4)
        }
    
    def generate_trend_report(self, days: int = 30) -> str:
        """生成趋势报告"""
        trends = self.analyze_trends(days)
        
        if not trends:
            return "No data available for trend analysis"
        
        report = f"""
Quality Trend Report - {trends['period']}
=======================================

Build Statistics:
  Total Builds: {trends['total_builds']}
  
Latest Metrics:
  Success Rate: {trends['latest_metrics']['success_rate']}%
  Execution Time: {trends['latest_metrics']['execution_time']}s
  Code Coverage: {trends['latest_metrics']['code_coverage']}%

Averages:
  Success Rate: {trends['averages']['success_rate']}%
  Execution Time: {trends['averages']['execution_time']}s
  Code Coverage: {trends['averages']['code_coverage']}%

Trends:
  Success Rate: {trends['trends']['success_rate']['direction']} 
    (slope: {trends['trends']['success_rate']['slope']})
  Execution Time: {trends['trends']['execution_time']['direction']} 
    (slope: {trends['trends']['execution_time']['slope']})
  Code Coverage: {trends['trends']['code_coverage']['direction']} 
    (slope: {trends['trends']['code_coverage']['slope']})
"""
        
        return report
    
    def plot_trends(self, days: int = 30, output_path: str = "quality_trends.png"):
        """绘制趋势图表"""
        metrics_history = self.get_metrics_history(days)
        
        if not metrics_history:
            print("No data available for plotting")
            return
        
        timestamps = [m.timestamp for m in metrics_history]
        success_rates = [m.success_rate for m in metrics_history]
        execution_times = [m.execution_time for m in metrics_history]
        code_coverages = [m.code_coverage for m in metrics_history]
        
        fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(12, 10))
        
        # 成功率趋势
        ax1.plot(timestamps, success_rates, 'g-', marker='o')
        ax1.set_title('Test Success Rate Trend')
        ax1.set_ylabel('Success Rate (%)')
        ax1.grid(True)
        
        # 执行时间趋势
        ax2.plot(timestamps, execution_times, 'b-', marker='s')
        ax2.set_title('Test Execution Time Trend')
        ax2.set_ylabel('Time (seconds)')
        ax2.grid(True)
        
        # 代码覆盖率趋势
        ax3.plot(timestamps, code_coverages, 'r-', marker='^')
        ax3.set_title('Code Coverage Trend')
        ax3.set_ylabel('Coverage (%)')
        ax3.set_xlabel('Date')
        ax3.grid(True)
        
        plt.tight_layout()
        plt.savefig(output_path)
        plt.close()
        
        print(f"Trend chart saved to {output_path}")

# 使用示例
if __name__ == "__main__":
    analyzer = QualityTrendAnalyzer()
    
    # 记录一些示例数据
    for i in range(10):
        metrics = QualityMetric(
            timestamp=datetime.now() - timedelta(days=9-i),
            success_rate=95.0 + np.random.normal(0, 2),
            total_tests=100,
            execution_time=120 + np.random.normal(0, 10),
            code_coverage=80.0 + np.random.normal(0, 3)
        )
        analyzer.record_metrics(metrics, build_number=f"BUILD-{100+i}")
    
    # 生成趋势报告
    report = analyzer.generate_trend_report(10)
    print(report)
    
    # 绘制趋势图表
    analyzer.plot_trends(10)
```

通过完善的自动化测试管理体系，团队能够实现测试环境的快速准备、测试用例的智能筛选和测试结果的深度分析。测试环境自动化确保了测试的一致性和可重复性，智能测试筛选提高了测试效率，而自动化报告分析则为质量改进提供了数据支撑。在实际应用中，需要根据项目特点和团队需求，持续优化测试管理策略，以实现最佳的测试效果和质量保障。