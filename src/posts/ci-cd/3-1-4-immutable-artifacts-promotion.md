---
title: "不可变制品与晋升流程: 构建一次，多处部署"
date: 2025-08-30
categories: [CICD]
tags: [ci,cd]
published: true
---
不可变制品是现代软件交付的重要原则，它确保在不同环境中部署的是完全相同的制品，避免了"在我机器上能运行"的问题。通过建立标准化的制品晋升流程，可以实现从开发到生产的无缝交付，提高软件交付的可靠性和一致性。本文将深入探讨不可变制品的核心概念、实现方式和晋升流程设计，帮助团队构建可靠的软件交付链。

## 不可变制品的核心价值

不可变制品原则是DevOps和持续交付实践的基石，它为软件交付带来了多方面的重要价值。

### 一致性保障
不可变制品确保在不同环境中部署的是完全相同的二进制文件，消除了因环境差异导致的问题。开发、测试、预发和生产环境使用相同的制品，大大降低了环境相关的bug。

### 可追溯性增强
每个制品都有唯一的标识符和完整的元数据，可以精确追踪制品的来源、构建过程和部署历史。这对于问题排查和审计合规具有重要意义。

### 部署可靠性提升
由于制品在构建后不再发生变化，部署过程变得更加可预测和可靠。回滚操作也变得简单直接，只需重新部署之前的制品版本。

### 安全性加强
不可变制品减少了运行时修改的可能性，降低了安全攻击面。同时，制品的完整性和来源可以得到有效验证。

## 不可变性原则实现

实现不可变制品需要从构建过程、存储管理和部署流程等多个方面进行设计和控制。

### 构建过程控制

#### 唯一标识符生成
```python
import hashlib
import uuid
from datetime import datetime

class ArtifactIdentifier:
    def __init__(self):
        self.build_timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        self.build_id = str(uuid.uuid4())
    
    def generate_artifact_id(self, project_name: str, version: str, commit_sha: str) -> str:
        """生成唯一的制品标识符"""
        # 创建包含关键信息的字符串
        identifier_string = f"{project_name}:{version}:{commit_sha}:{self.build_timestamp}:{self.build_id}"
        
        # 生成SHA256哈希作为唯一标识
        artifact_hash = hashlib.sha256(identifier_string.encode()).hexdigest()
        
        # 返回格式化的标识符
        return f"{project_name}-{version}-{commit_sha[:8]}-{artifact_hash[:12]}"
    
    def generate_docker_tag(self, project_name: str, version: str, commit_sha: str) -> str:
        """生成Docker镜像标签"""
        return f"{project_name}:{version}-{commit_sha[:8]}"

# 使用示例
identifier = ArtifactIdentifier()
artifact_id = identifier.generate_artifact_id("my-app", "1.2.3", "a1b2c3d4e5f67890")
docker_tag = identifier.generate_docker_tag("my-app", "1.2.3", "a1b2c3d4e5f67890")

print(f"Artifact ID: {artifact_id}")
print(f"Docker Tag: {docker_tag}")
```

#### 构建环境隔离
```dockerfile
# 不可变构建环境Dockerfile
FROM openjdk:11-jdk-slim AS builder

# 设置固定版本的构建工具
ARG MAVEN_VERSION=3.8.6
ARG USER_HOME_DIR="/root"

# 安装固定版本的Maven
RUN apt-get update && apt-get install -y curl \
    && mkdir -p /usr/share/maven /usr/share/maven/ref \
    && curl -fsSL https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz \
    | tar -xzC /usr/share/maven --strip-components=1 \
    && ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

# 设置工作目录
WORKDIR /build

# 复制源代码和构建配置
COPY . .

# 执行构建（确保不修改源代码）
RUN mvn clean package -DskipTests

# 创建运行时镜像
FROM openjdk:11-jre-slim
WORKDIR /app

# 从构建阶段复制制品
COPY --from=builder /build/target/*.jar app.jar

# 设置不可变的运行时配置
ENV JAVA_OPTS="-Xmx512m -Xms256m"
EXPOSE 8080

# 使用非root用户运行
USER 1001

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 构建元数据注入
```python
import json
import subprocess
from datetime import datetime

class BuildMetadataInjector:
    def __init__(self, project_info: dict):
        self.project_info = project_info
    
    def collect_build_metadata(self) -> dict:
        """收集构建元数据"""
        metadata = {
            "build": {
                "id": self._generate_build_id(),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "project": self.project_info,
                "git": self._collect_git_info(),
                "environment": self._collect_environment_info(),
                "dependencies": self._collect_dependencies()
            }
        }
        return metadata
    
    def _generate_build_id(self) -> str:
        """生成构建ID"""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"build-{timestamp}-{uuid.uuid4().hex[:8]}"
    
    def _collect_git_info(self) -> dict:
        """收集Git信息"""
        try:
            commit_sha = subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip()
            commit_author = subprocess.check_output(["git", "log", "-1", "--pretty=format:%an"]).decode().strip()
            commit_message = subprocess.check_output(["git", "log", "-1", "--pretty=format:%s"]).decode().strip()
            branch = subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"]).decode().strip()
            
            return {
                "commit_sha": commit_sha,
                "commit_author": commit_author,
                "commit_message": commit_message,
                "branch": branch
            }
        except subprocess.CalledProcessError:
            return {"error": "Failed to collect git info"}
    
    def _collect_environment_info(self) -> dict:
        """收集环境信息"""
        return {
            "build_tool": "maven",
            "java_version": "11",
            "os": "linux",
            "arch": "amd64"
        }
    
    def _collect_dependencies(self) -> list:
        """收集依赖信息"""
        # 这里应该解析pom.xml或build.gradle文件
        # 简化示例：
        return [
            {"name": "spring-boot-starter-web", "version": "2.7.0"},
            {"name": "junit-jupiter", "version": "5.8.2"}
        ]
    
    def inject_metadata_to_artifact(self, artifact_path: str, metadata: dict):
        """将元数据注入到制品中"""
        metadata_file = f"{artifact_path}.metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # 对于JAR文件，可以将元数据添加到JAR中
        if artifact_path.endswith('.jar'):
            subprocess.run([
                "jar", "uf", artifact_path, "-C", 
                "/tmp", metadata_file.split('/')[-1]
            ])
```

### 存储管理策略

#### 制品完整性验证
```python
import hashlib
import os

class ArtifactIntegrityManager:
    def __init__(self, storage_client):
        self.storage_client = storage_client
    
    def calculate_checksum(self, file_path: str, algorithm: str = "sha256") -> str:
        """计算文件校验和"""
        hash_obj = hashlib.new(algorithm)
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_obj.update(chunk)
        return hash_obj.hexdigest()
    
    def verify_artifact_integrity(self, artifact_path: str, expected_checksum: str, algorithm: str = "sha256") -> bool:
        """验证制品完整性"""
        actual_checksum = self.calculate_checksum(artifact_path, algorithm)
        return actual_checksum == expected_checksum
    
    def store_artifact_with_integrity(self, local_path: str, remote_path: str) -> dict:
        """存储制品并记录完整性信息"""
        # 计算校验和
        sha256_checksum = self.calculate_checksum(local_path, "sha256")
        md5_checksum = self.calculate_checksum(local_path, "md5")
        
        # 上传制品
        self.storage_client.upload_file(local_path, remote_path)
        
        # 存储校验和信息
        integrity_info = {
            "path": remote_path,
            "sha256": sha256_checksum,
            "md5": md5_checksum,
            "size": os.path.getsize(local_path),
            "uploaded_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # 存储完整性信息到元数据存储
        self.storage_client.store_metadata(f"{remote_path}.integrity", integrity_info)
        
        return integrity_info
    
    def validate_artifact_before_deployment(self, artifact_url: str) -> bool:
        """部署前验证制品完整性"""
        try:
            # 下载制品
            local_path = f"/tmp/artifact_{uuid.uuid4().hex}"
            self.storage_client.download_file(artifact_url, local_path)
            
            # 获取预期的校验和
            integrity_info = self.storage_client.get_metadata(f"{artifact_url}.integrity")
            
            # 验证完整性
            is_valid = self.verify_artifact_integrity(
                local_path, 
                integrity_info["sha256"], 
                "sha256"
            )
            
            # 清理临时文件
            os.remove(local_path)
            
            return is_valid
        except Exception as e:
            print(f"Artifact validation failed: {e}")
            return False
```

#### 版本锁定机制
```python
class VersionLockManager:
    def __init__(self, metadata_store):
        self.metadata_store = metadata_store
    
    def lock_artifact_version(self, artifact_id: str, environment: str) -> bool:
        """锁定制品版本用于特定环境"""
        lock_key = f"lock:{environment}:{artifact_id}"
        lock_info = {
            "artifact_id": artifact_id,
            "environment": environment,
            "locked_at": datetime.utcnow().isoformat() + "Z",
            "locked_by": self._get_current_user()
        }
        
        try:
            # 尝试获取锁
            self.metadata_store.set_if_not_exists(lock_key, lock_info)
            return True
        except Exception:
            # 锁已存在
            return False
    
    def unlock_artifact_version(self, artifact_id: str, environment: str) -> bool:
        """解锁制品版本"""
        lock_key = f"lock:{environment}:{artifact_id}"
        return self.metadata_store.delete(lock_key)
    
    def is_artifact_locked(self, artifact_id: str, environment: str) -> bool:
        """检查制品是否被锁定"""
        lock_key = f"lock:{environment}:{artifact_id}"
        return self.metadata_store.exists(lock_key)
    
    def get_locked_artifact(self, environment: str) -> dict:
        """获取环境中锁定的制品"""
        pattern = f"lock:{environment}:*"
        locks = self.metadata_store.scan(pattern)
        return locks[0] if locks else None
    
    def _get_current_user(self) -> str:
        """获取当前用户信息"""
        # 实际实现应该从认证系统获取用户信息
        return os.environ.get("USER", "unknown")
```

## 晋升流程设计

晋升流程是不可变制品管理的核心，它定义了制品从开发环境到生产环境的流转路径和验证机制。

### 晋升阶段定义

#### 环境层次结构
```python
from enum import Enum
from typing import List, Dict

class Environment(Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"

class PromotionStage:
    def __init__(self, name: str, environment: Environment, required_approvals: int = 0):
        self.name = name
        self.environment = environment
        self.required_approvals = required_approvals
        self.validation_checks = []
        self.approval_policy = None
    
    def add_validation_check(self, check_name: str, check_function):
        """添加验证检查"""
        self.validation_checks.append({
            "name": check_name,
            "function": check_function
        })
    
    def set_approval_policy(self, policy):
        """设置审批策略"""
        self.approval_policy = policy

class PromotionPipeline:
    def __init__(self, name: str):
        self.name = name
        self.stages = []
        self.artifact_registry = None
    
    def add_stage(self, stage: PromotionStage):
        """添加晋升阶段"""
        self.stages.append(stage)
    
    def get_next_stage(self, current_stage: str) -> PromotionStage:
        """获取下一个晋升阶段"""
        for i, stage in enumerate(self.stages):
            if stage.name == current_stage and i < len(self.stages) - 1:
                return self.stages[i + 1]
        return None
    
    def can_promote(self, artifact_id: str, from_stage: str, to_stage: str) -> bool:
        """检查是否可以晋升"""
        # 检查制品是否已通过当前阶段的所有验证
        if not self._is_stage_validated(artifact_id, from_stage):
            return False
        
        # 检查是否满足目标阶段的要求
        target_stage = self._get_stage_by_name(to_stage)
        if not target_stage:
            return False
        
        # 检查审批要求
        if target_stage.required_approvals > 0:
            approvals = self._get_approvals(artifact_id, to_stage)
            if len(approvals) < target_stage.required_approvals:
                return False
        
        return True
    
    def _is_stage_validated(self, artifact_id: str, stage_name: str) -> bool:
        """检查阶段是否已验证"""
        # 实现验证逻辑
        return True
    
    def _get_stage_by_name(self, stage_name: str) -> PromotionStage:
        """根据名称获取阶段"""
        for stage in self.stages:
            if stage.name == stage_name:
                return stage
        return None
    
    def _get_approvals(self, artifact_id: str, stage_name: str) -> List[Dict]:
        """获取审批信息"""
        # 实现审批信息获取逻辑
        return []
```

### 自动化验证机制

#### 质量门禁检查
```python
class QualityGateChecker:
    def __init__(self, ci_client, security_scanner, performance_tester):
        self.ci_client = ci_client
        self.security_scanner = security_scanner
        self.performance_tester = performance_tester
    
    def run_quality_gates(self, artifact_id: str, stage: str) -> Dict[str, bool]:
        """运行质量门禁检查"""
        results = {}
        
        # 代码质量检查
        results["code_quality"] = self._check_code_quality(artifact_id)
        
        # 安全扫描
        results["security"] = self._run_security_scan(artifact_id)
        
        # 性能测试
        results["performance"] = self._run_performance_test(artifact_id, stage)
        
        # 依赖检查
        results["dependencies"] = self._check_dependencies(artifact_id)
        
        # 合规性检查
        results["compliance"] = self._check_compliance(artifact_id)
        
        return results
    
    def _check_code_quality(self, artifact_id: str) -> bool:
        """检查代码质量"""
        try:
            # 调用CI系统获取代码质量报告
            quality_report = self.ci_client.get_code_quality_report(artifact_id)
            
            # 检查关键指标
            if quality_report.get("bugs", 0) > 0:
                return False
            if quality_report.get("vulnerabilities", 0) > 5:
                return False
            if quality_report.get("code_smells", 0) > 50:
                return False
            
            return True
        except Exception as e:
            print(f"Code quality check failed: {e}")
            return False
    
    def _run_security_scan(self, artifact_id: str) -> bool:
        """运行安全扫描"""
        try:
            scan_result = self.security_scanner.scan_artifact(artifact_id)
            critical_vulnerabilities = scan_result.get("critical", 0)
            high_vulnerabilities = scan_result.get("high", 0)
            
            # 不允许存在严重漏洞，高危漏洞不能超过3个
            return critical_vulnerabilities == 0 and high_vulnerabilities <= 3
        except Exception as e:
            print(f"Security scan failed: {e}")
            return False
    
    def _run_performance_test(self, artifact_id: str, stage: str) -> bool:
        """运行性能测试"""
        try:
            # 不同阶段有不同的性能要求
            performance_requirements = {
                "testing": {"response_time": 500, "throughput": 100},
                "staging": {"response_time": 200, "throughput": 500},
                "production": {"response_time": 100, "throughput": 1000}
            }
            
            requirements = performance_requirements.get(stage, performance_requirements["testing"])
            test_result = self.performance_tester.run_test(artifact_id)
            
            # 检查性能指标
            if test_result.get("avg_response_time", 0) > requirements["response_time"]:
                return False
            if test_result.get("throughput", 0) < requirements["throughput"]:
                return False
            
            return True
        except Exception as e:
            print(f"Performance test failed: {e}")
            return False
    
    def _check_dependencies(self, artifact_id: str) -> bool:
        """检查依赖安全性"""
        try:
            dependency_report = self.ci_client.get_dependency_report(artifact_id)
            vulnerable_deps = dependency_report.get("vulnerable_dependencies", [])
            
            # 不允许存在已知的严重漏洞依赖
            for dep in vulnerable_deps:
                if dep.get("severity") in ["CRITICAL", "HIGH"]:
                    return False
            
            return True
        except Exception as e:
            print(f"Dependency check failed: {e}")
            return False
    
    def _check_compliance(self, artifact_id: str) -> bool:
        """检查合规性"""
        try:
            # 检查许可证合规性
            license_check = self.ci_client.check_licenses(artifact_id)
            if not license_check.get("compliant", False):
                return False
            
            # 检查安全策略合规性
            policy_check = self.security_scanner.check_policies(artifact_id)
            if not policy_check.get("compliant", False):
                return False
            
            return True
        except Exception as e:
            print(f"Compliance check failed: {e}")
            return False
```

#### 环境验证
```python
class EnvironmentValidator:
    def __init__(self, infrastructure_client):
        self.infra_client = infrastructure_client
    
    def validate_environment(self, environment: str, artifact_id: str) -> Dict[str, bool]:
        """验证环境准备情况"""
        results = {}
        
        # 检查基础设施状态
        results["infrastructure"] = self._check_infrastructure(environment)
        
        # 检查配置管理
        results["configuration"] = self._check_configuration(environment, artifact_id)
        
        # 检查网络连通性
        results["network"] = self._check_network_connectivity(environment)
        
        # 检查资源配额
        results["resources"] = self._check_resource_quota(environment)
        
        return results
    
    def _check_infrastructure(self, environment: str) -> bool:
        """检查基础设施状态"""
        try:
            # 检查Kubernetes集群状态
            cluster_status = self.infra_client.get_cluster_status(environment)
            if cluster_status.get("status") != "ready":
                return False
            
            # 检查节点健康状态
            nodes = self.infra_client.get_cluster_nodes(environment)
            for node in nodes:
                if node.get("status") != "ready":
                    return False
            
            return True
        except Exception as e:
            print(f"Infrastructure check failed: {e}")
            return False
    
    def _check_configuration(self, environment: str, artifact_id: str) -> bool:
        """检查环境配置"""
        try:
            # 获取环境配置
            env_config = self.infra_client.get_environment_config(environment)
            
            # 验证配置完整性
            required_configs = ["database_url", "api_key", "service_endpoints"]
            for config in required_configs:
                if not env_config.get(config):
                    return False
            
            # 验证配置安全性
            if not self._validate_config_security(env_config):
                return False
            
            return True
        except Exception as e:
            print(f"Configuration check failed: {e}")
            return False
    
    def _check_network_connectivity(self, environment: str) -> bool:
        """检查网络连通性"""
        try:
            # 检查服务间连通性
            services = self.infra_client.get_services(environment)
            for service in services:
                if not self.infra_client.check_service_connectivity(service):
                    return False
            
            # 检查外部依赖连通性
            external_deps = ["database", "cache", "message_queue"]
            for dep in external_deps:
                if not self.infra_client.check_external_connectivity(environment, dep):
                    return False
            
            return True
        except Exception as e:
            print(f"Network connectivity check failed: {e}")
            return False
    
    def _check_resource_quota(self, environment: str) -> bool:
        """检查资源配额"""
        try:
            # 获取当前资源使用情况
            usage = self.infra_client.get_resource_usage(environment)
            quota = self.infra_client.get_resource_quota(environment)
            
            # 检查CPU配额
            if usage.get("cpu_used", 0) > quota.get("cpu_limit", 0) * 0.8:
                return False
            
            # 检查内存配额
            if usage.get("memory_used", 0) > quota.get("memory_limit", 0) * 0.8:
                return False
            
            # 检查存储配额
            if usage.get("storage_used", 0) > quota.get("storage_limit", 0) * 0.8:
                return False
            
            return True
        except Exception as e:
            print(f"Resource quota check failed: {e}")
            return False
    
    def _validate_config_security(self, config: dict) -> bool:
        """验证配置安全性"""
        # 检查敏感信息是否加密
        sensitive_keys = ["password", "secret", "key", "token"]
        for key, value in config.items():
            for sensitive_key in sensitive_keys:
                if sensitive_key in key.lower() and not self._is_encrypted(value):
                    return False
        return True
    
    def _is_encrypted(self, value) -> bool:
        """检查值是否已加密"""
        # 简化实现，实际应该检查加密标记
        return str(value).startswith("ENC(") and str(value).endswith(")")
```

## 晋升流程自动化

通过自动化工具和流程，可以实现制品晋升的无缝流转，减少人工干预，提高效率和可靠性。

### 晋升控制器

#### 晋升状态管理
```python
class PromotionController:
    def __init__(self, artifact_registry, promotion_pipeline, quality_gate_checker, environment_validator):
        self.artifact_registry = artifact_registry
        self.promotion_pipeline = promotion_pipeline
        self.quality_gate_checker = quality_gate_checker
        self.environment_validator = environment_validator
        self.promotion_store = PromotionStore()
    
    def initiate_promotion(self, artifact_id: str, target_environment: str, requester: str) -> str:
        """发起制品晋升"""
        promotion_id = f"promo-{uuid.uuid4().hex[:8]}"
        
        # 创建晋升记录
        promotion_record = {
            "id": promotion_id,
            "artifact_id": artifact_id,
            "target_environment": target_environment,
            "requester": requester,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "checks": {},
            "approvals": []
        }
        
        # 存储晋升记录
        self.promotion_store.create_promotion(promotion_record)
        
        # 异步执行晋升流程
        self._execute_promotion_async(promotion_id)
        
        return promotion_id
    
    def _execute_promotion_async(self, promotion_id: str):
        """异步执行晋升流程"""
        import threading
        thread = threading.Thread(target=self._execute_promotion, args=(promotion_id,))
        thread.start()
    
    def _execute_promotion(self, promotion_id: str):
        """执行晋升流程"""
        try:
            # 获取晋升记录
            promotion = self.promotion_store.get_promotion(promotion_id)
            
            # 更新状态为进行中
            self.promotion_store.update_promotion_status(promotion_id, "in_progress")
            
            # 执行质量门禁检查
            quality_results = self.quality_gate_checker.run_quality_gates(
                promotion["artifact_id"], 
                promotion["target_environment"]
            )
            self.promotion_store.update_promotion_checks(promotion_id, quality_results)
            
            # 检查质量门禁是否通过
            if not all(quality_results.values()):
                self.promotion_store.update_promotion_status(promotion_id, "failed")
                return
            
            # 验证目标环境
            env_results = self.environment_validator.validate_environment(
                promotion["target_environment"], 
                promotion["artifact_id"]
            )
            self.promotion_store.update_promotion_environment_checks(promotion_id, env_results)
            
            # 检查环境验证是否通过
            if not all(env_results.values()):
                self.promotion_store.update_promotion_status(promotion_id, "failed")
                return
            
            # 执行晋升
            success = self._perform_promotion(
                promotion["artifact_id"], 
                promotion["target_environment"]
            )
            
            if success:
                self.promotion_store.update_promotion_status(promotion_id, "completed")
                # 更新制品在目标环境的状态
                self.artifact_registry.update_artifact_environment(
                    promotion["artifact_id"], 
                    promotion["target_environment"], 
                    "deployed"
                )
            else:
                self.promotion_store.update_promotion_status(promotion_id, "failed")
                
        except Exception as e:
            print(f"Promotion execution failed: {e}")
            self.promotion_store.update_promotion_status(promotion_id, "failed")
    
    def _perform_promotion(self, artifact_id: str, target_environment: str) -> bool:
        """执行实际的晋升操作"""
        try:
            # 获取制品信息
            artifact = self.artifact_registry.get_artifact(artifact_id)
            
            # 部署到目标环境
            deployment_result = self._deploy_to_environment(
                artifact, 
                target_environment
            )
            
            return deployment_result.get("success", False)
        except Exception as e:
            print(f"Promotion deployment failed: {e}")
            return False
    
    def _deploy_to_environment(self, artifact: dict, environment: str) -> dict:
        """部署到指定环境"""
        # 这里应该调用实际的部署系统
        # 简化示例：
        return {
            "success": True,
            "deployment_id": f"deploy-{uuid.uuid4().hex[:8]}",
            "environment": environment
        }
    
    def get_promotion_status(self, promotion_id: str) -> dict:
        """获取晋升状态"""
        return self.promotion_store.get_promotion(promotion_id)
    
    def cancel_promotion(self, promotion_id: str, reason: str) -> bool:
        """取消晋升"""
        promotion = self.promotion_store.get_promotion(promotion_id)
        if promotion["status"] in ["pending", "in_progress"]:
            self.promotion_store.update_promotion_status(
                promotion_id, 
                "cancelled", 
                {"cancellation_reason": reason}
            )
            return True
        return False
```

#### 晋升存储管理
```python
class PromotionStore:
    def __init__(self):
        self.promotions = {}  # 简化实现，实际应该使用数据库
    
    def create_promotion(self, promotion_record: dict):
        """创建晋升记录"""
        self.promotions[promotion_record["id"]] = promotion_record
    
    def get_promotion(self, promotion_id: str) -> dict:
        """获取晋升记录"""
        return self.promotions.get(promotion_id, {})
    
    def update_promotion_status(self, promotion_id: str, status: str, details: dict = None):
        """更新晋升状态"""
        if promotion_id in self.promotions:
            self.promotions[promotion_id]["status"] = status
            self.promotions[promotion_id]["updated_at"] = datetime.utcnow().isoformat() + "Z"
            if details:
                if "details" not in self.promotions[promotion_id]:
                    self.promotions[promotion_id]["details"] = {}
                self.promotions[promotion_id]["details"].update(details)
    
    def update_promotion_checks(self, promotion_id: str, checks: dict):
        """更新质量检查结果"""
        if promotion_id in self.promotions:
            self.promotions[promotion_id]["checks"] = checks
    
    def update_promotion_environment_checks(self, promotion_id: str, env_checks: dict):
        """更新环境检查结果"""
        if promotion_id in self.promotions:
            if "environment_checks" not in self.promotions[promotion_id]:
                self.promotions[promotion_id]["environment_checks"] = {}
            self.promotions[promotion_id]["environment_checks"] = env_checks
    
    def list_promotions(self, artifact_id: str = None, status: str = None) -> list:
        """列出晋升记录"""
        promotions = list(self.promotions.values())
        
        if artifact_id:
            promotions = [p for p in promotions if p["artifact_id"] == artifact_id]
        
        if status:
            promotions = [p for p in promotions if p["status"] == status]
        
        return promotions
```

通过实施不可变制品原则和标准化的晋升流程，团队能够实现可靠的软件交付，确保在不同环境中部署的是完全相同的制品。这种做法不仅提高了部署的一致性和可靠性，还简化了问题排查和回滚操作。在实际应用中，需要根据团队的具体需求和现有工具链，逐步建立和完善不可变制品管理体系，最终实现"构建一次，多处部署"的目标。