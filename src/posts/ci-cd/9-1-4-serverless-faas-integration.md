---
title: 与Serverless/FaaS平台集成: 函数即服务的持续交付
date: 2025-08-30
categories: [CICD]
tags: [ci,cd,serverless,faas,aws-lambda,azure-functions,devops,cloud]
published: true
---
随着云计算技术的发展，Serverless架构和函数即服务（Function as a Service, FaaS）平台正变得越来越流行。这些平台允许开发者专注于业务逻辑的实现，而无需管理底层基础设施。然而，这也带来了新的挑战：如何在Serverless环境中实现高效的持续集成和持续交付（CI/CD）。通过将CI/CD平台与主流的Serverless/FaaS平台集成，团队能够实现函数的自动化构建、测试、部署和监控。本文将深入探讨如何实现CI/CD平台与AWS Lambda、Azure Functions、Google Cloud Functions等主流Serverless平台的深度集成。

## Serverless/FaaS集成的价值

Serverless/FaaS平台集成不仅能够提升函数交付效率，还能优化资源利用和成本控制。

### 1. 自动化函数交付

通过集成实现函数的全自动化交付流程：
- **代码构建**：自动编译和打包函数代码
- **依赖管理**：自动处理函数依赖项
- **测试执行**：自动运行单元测试和集成测试
- **部署发布**：自动部署函数到目标环境
- **版本管理**：自动管理函数版本和别名

### 2. 环境一致性

确保不同环境间的一致性：
- **配置管理**：统一管理不同环境的配置
- **权限控制**：一致的权限和安全策略
- **资源分配**：标准化的资源配额和限制
- **监控告警**：统一的监控和告警机制

### 3. 成本优化

通过集成优化Serverless成本：
- **资源优化**：优化函数内存和超时配置
- **执行监控**：监控函数执行频率和持续时间
- **冷启动优化**：减少函数冷启动时间
- **版本清理**：自动清理过期的函数版本

## AWS Lambda集成实践

AWS Lambda作为最流行的FaaS平台之一，与其集成能够实现丰富的功能。

### 1. 认证与连接配置

安全可靠的认证机制是集成的基础：

#### IAM角色配置
```yaml
# AWS Lambda集成配置
aws_lambda_integration:
  enabled: true
  region: "us-east-1"
  auth:
    type: "iam_role"
    role_arn: "arn:aws:iam::123456789012:role/CICD-Lambda-Role"
    external_id: "ci-cd-platform"
  
  # 或使用访问密钥
  # auth:
  #   type: "access_key"
  #   access_key_id: "${AWS_ACCESS_KEY_ID}"
  #   secret_access_key: "${AWS_SECRET_ACCESS_KEY}"
  
  deployment:
    bucket: "lambda-deployment-artifacts"
    prefix: "functions/"
  
  monitoring:
    cloudwatch:
      enabled: true
      namespace: "CI/CD/Lambda"
```

#### 客户端实现
```python
#!/usr/bin/env python3
"""
AWS Lambda集成工具
实现与AWS Lambda的深度集成
"""

import boto3
import json
import zipfile
import io
import logging
from typing import Dict, List, Optional
from datetime import datetime
from botocore.exceptions import ClientError

class AWSLambdaIntegration:
    def __init__(self, config: Dict):
        self.config = config
        self.region = config.get('region', 'us-east-1')
        self.logger = logging.getLogger(__name__)
        self.lambda_client = self._create_lambda_client()
        self.s3_client = self._create_s3_client()
    
    def _create_lambda_client(self):
        """创建Lambda客户端"""
        auth_config = self.config.get('auth', {})
        
        if auth_config.get('type') == 'iam_role':
            # 使用IAM角色
            sts_client = boto3.client('sts', region_name=self.region)
            assumed_role = sts_client.assume_role(
                RoleArn=auth_config['role_arn'],
                RoleSessionName='CICD-Lambda-Session',
                ExternalId=auth_config.get('external_id')
            )
            
            credentials = assumed_role['Credentials']
            return boto3.client(
                'lambda',
                region_name=self.region,
                aws_access_key_id=credentials['AccessKeyId'],
                aws_secret_access_key=credentials['SecretAccessKey'],
                aws_session_token=credentials['SessionToken']
            )
        else:
            # 使用访问密钥
            return boto3.client('lambda', region_name=self.region)
    
    def _create_s3_client(self):
        """创建S3客户端"""
        auth_config = self.config.get('auth', {})
        
        if auth_config.get('type') == 'iam_role':
            sts_client = boto3.client('sts', region_name=self.region)
            assumed_role = sts_client.assume_role(
                RoleArn=auth_config['role_arn'],
                RoleSessionName='CICD-S3-Session',
                ExternalId=auth_config.get('external_id')
            )
            
            credentials = assumed_role['Credentials']
            return boto3.client(
                's3',
                region_name=self.region,
                aws_access_key_id=credentials['AccessKeyId'],
                aws_secret_access_key=credentials['SecretAccessKey'],
                aws_session_token=credentials['SessionToken']
            )
        else:
            return boto3.client('s3', region_name=self.region)
    
    def create_deployment_package(self, function_code_path: str, 
                                dependencies: List[str] = None) -> bytes:
        """创建部署包"""
        try:
            # 创建内存中的ZIP文件
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                # 添加函数代码
                if function_code_path.endswith('.py'):
                    with open(function_code_path, 'rb') as f:
                        zip_file.writestr('lambda_function.py', f.read())
                else:
                    # 如果是目录，递归添加所有文件
                    import os
                    for root, dirs, files in os.walk(function_code_path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            arc_path = os.path.relpath(file_path, function_code_path)
                            zip_file.write(file_path, arc_path)
                
                # 添加依赖项
                if dependencies:
                    for dep in dependencies:
                        # 这里需要根据具体的依赖管理工具实现
                        # 例如：pip install -r requirements.txt -t ./package
                        pass
            
            zip_buffer.seek(0)
            return zip_buffer.read()
        except Exception as e:
            self.logger.error(f"Failed to create deployment package: {e}")
            raise
    
    def upload_to_s3(self, deployment_package: bytes, 
                    function_name: str) -> str:
        """上传部署包到S3"""
        try:
            deployment_config = self.config.get('deployment', {})
            bucket = deployment_config.get('bucket')
            prefix = deployment_config.get('prefix', '')
            
            # 生成对象键
            timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
            object_key = f"{prefix}{function_name}/{timestamp}.zip"
            
            # 上传到S3
            self.s3_client.put_object(
                Bucket=bucket,
                Key=object_key,
                Body=deployment_package
            )
            
            s3_url = f"s3://{bucket}/{object_key}"
            self.logger.info(f"Deployment package uploaded to {s3_url}")
            return s3_url
        except Exception as e:
            self.logger.error(f"Failed to upload deployment package to S3: {e}")
            raise
    
    def create_or_update_function(self, function_config: Dict) -> Dict:
        """创建或更新Lambda函数"""
        try:
            function_name = function_config['function_name']
            
            # 检查函数是否存在
            try:
                existing_function = self.lambda_client.get_function(
                    FunctionName=function_name
                )
                function_exists = True
            except ClientError as e:
                if e.response['Error']['Code'] == 'ResourceNotFoundException':
                    function_exists = False
                else:
                    raise
            
            if function_exists:
                # 更新现有函数
                return self._update_function(function_config)
            else:
                # 创建新函数
                return self._create_function(function_config)
        except Exception as e:
            self.logger.error(f"Failed to create or update function {function_config['function_name']}: {e}")
            raise
    
    def _create_function(self, function_config: Dict) -> Dict:
        """创建新函数"""
        try:
            # 准备函数参数
            create_params = {
                'FunctionName': function_config['function_name'],
                'Runtime': function_config.get('runtime', 'python3.9'),
                'Role': function_config['role_arn'],
                'Handler': function_config.get('handler', 'lambda_function.lambda_handler'),
                'Code': {},
                'Description': function_config.get('description', ''),
                'Timeout': function_config.get('timeout', 30),
                'MemorySize': function_config.get('memory_size', 128),
                'Publish': function_config.get('publish', True)
            }
            
            # 设置代码源
            if 's3_bucket' in function_config and 's3_key' in function_config:
                create_params['Code'] = {
                    'S3Bucket': function_config['s3_bucket'],
                    'S3Key': function_config['s3_key']
                }
            elif 'zip_file' in function_config:
                create_params['Code'] = {
                    'ZipFile': function_config['zip_file']
                }
            else:
                raise ValueError("Either S3 location or ZipFile must be provided")
            
            # 添加环境变量
            if 'environment_variables' in function_config:
                create_params['Environment'] = {
                    'Variables': function_config['environment_variables']
                }
            
            # 添加标签
            if 'tags' in function_config:
                create_params['Tags'] = function_config['tags']
            
            # 创建函数
            response = self.lambda_client.create_function(**create_params)
            
            self.logger.info(f"Function {function_config['function_name']} created successfully")
            return response
        except Exception as e:
            self.logger.error(f"Failed to create function: {e}")
            raise
    
    def _update_function(self, function_config: Dict) -> Dict:
        """更新现有函数"""
        try:
            function_name = function_config['function_name']
            
            # 更新函数代码
            update_code_params = {
                'FunctionName': function_name
            }
            
            if 's3_bucket' in function_config and 's3_key' in function_config:
                update_code_params['S3Bucket'] = function_config['s3_bucket']
                update_code_params['S3Key'] = function_config['s3_key']
            elif 'zip_file' in function_config:
                update_code_params['ZipFile'] = function_config['zip_file']
            
            code_response = self.lambda_client.update_function_code(**update_code_params)
            
            # 更新函数配置
            update_config_params = {
                'FunctionName': function_name,
                'Role': function_config['role_arn'],
                'Handler': function_config.get('handler', 'lambda_function.lambda_handler'),
                'Description': function_config.get('description', ''),
                'Timeout': function_config.get('timeout', 30),
                'MemorySize': function_config.get('memory_size', 128)
            }
            
            # 添加环境变量
            if 'environment_variables' in function_config:
                update_config_params['Environment'] = {
                    'Variables': function_config['environment_variables']
                }
            
            config_response = self.lambda_client.update_function_configuration(**update_config_params)
            
            self.logger.info(f"Function {function_name} updated successfully")
            return {**code_response, **config_response}
        except Exception as e:
            self.logger.error(f"Failed to update function: {e}")
            raise
    
    def publish_version(self, function_name: str, description: str = None) -> Dict:
        """发布函数版本"""
        try:
            params = {
                'FunctionName': function_name
            }
            
            if description:
                params['Description'] = description
            
            response = self.lambda_client.publish_version(**params)
            
            self.logger.info(f"Version {response['Version']} published for function {function_name}")
            return response
        except Exception as e:
            self.logger.error(f"Failed to publish version for function {function_name}: {e}")
            raise
    
    def create_alias(self, function_name: str, alias_name: str, 
                    function_version: str, description: str = None) -> Dict:
        """创建函数别名"""
        try:
            params = {
                'FunctionName': function_name,
                'FunctionVersion': function_version,
                'Name': alias_name
            }
            
            if description:
                params['Description'] = description
            
            response = self.lambda_client.create_alias(**params)
            
            self.logger.info(f"Alias {alias_name} created for function {function_name}")
            return response
        except Exception as e:
            self.logger.error(f"Failed to create alias {alias_name} for function {function_name}: {e}")
            raise
    
    def invoke_function(self, function_name: str, payload: Dict = None,
                       qualifier: str = None) -> Dict:
        """调用函数"""
        try:
            params = {
                'FunctionName': function_name,
                'InvocationType': 'RequestResponse',
                'LogType': 'Tail'
            }
            
            if payload:
                params['Payload'] = json.dumps(payload)
            
            if qualifier:
                params['Qualifier'] = qualifier
            
            response = self.lambda_client.invoke(**params)
            
            # 解析响应
            result = {
                'status_code': response['StatusCode'],
                'payload': json.loads(response['Payload'].read().decode()) if response.get('Payload') else None,
                'logs': response.get('LogResult')
            }
            
            if 'FunctionError' in response:
                result['error'] = response['FunctionError']
            
            return result
        except Exception as e:
            self.logger.error(f"Failed to invoke function {function_name}: {e}")
            raise
```

### 2. 函数部署流水线

实现完整的函数部署流水线：

#### 流水线配置
```yaml
# Lambda函数部署流水线配置
lambda_deployment_pipeline:
  stages:
    - name: build
      steps:
        - name: package-function
          type: lambda-package
          config:
            source_path: "./src"
            output_path: "./dist/function.zip"
            runtime: "python3.9"
            dependencies:
              - "requirements.txt"
        
        - name: upload-artifact
          type: s3-upload
          config:
            bucket: "lambda-deployment-artifacts"
            key_prefix: "my-function/"
            file: "./dist/function.zip"
    
    - name: test
      steps:
        - name: unit-test
          type: script
          config:
            script: "python -m pytest tests/unit"
        
        - name: integration-test
          type: lambda-test
          config:
            function_name: "my-function-test"
            test_cases:
              - name: "test-success-case"
                payload:
                  action: "process"
                  data: "test-data"
                expected_status: 200
              
              - name: "test-error-case"
                payload:
                  action: "invalid"
                expected_status: 400
    
    - name: deploy
      steps:
        - name: deploy-to-dev
          type: lambda-deploy
          config:
            function_name: "my-function-dev"
            s3_bucket: "lambda-deployment-artifacts"
            s3_key: "my-function/latest.zip"
            role_arn: "arn:aws:iam::123456789012:role/lambda-execution-role"
            environment_variables:
              ENV: "dev"
              LOG_LEVEL: "DEBUG"
            timeout: 30
            memory_size: 128
        
        - name: deploy-to-prod
          type: lambda-deploy
          config:
            function_name: "my-function-prod"
            s3_bucket: "lambda-deployment-artifacts"
            s3_key: "my-function/latest.zip"
            role_arn: "arn:aws:iam::123456789012:role/lambda-execution-role"
            environment_variables:
              ENV: "prod"
              LOG_LEVEL: "INFO"
            timeout: 60
            memory_size: 256
            alias: "LATEST"
```

#### 部署执行器
```python
#!/usr/bin/env python3
"""
Lambda部署执行器
执行Lambda函数的部署流程
"""

import json
import logging
import os
from typing import Dict, List
from aws_lambda_integration import AWSLambdaIntegration

class LambdaDeploymentExecutor:
    def __init__(self, lambda_client: AWSLambdaIntegration):
        self.lambda_client = lambda_client
        self.logger = logging.getLogger(__name__)
    
    def execute_deployment(self, deployment_config: Dict) -> Dict:
        """执行函数部署"""
        try:
            self.logger.info(f"Starting deployment for function {deployment_config['function_name']}")
            
            # 创建部署包
            deployment_package = self.lambda_client.create_deployment_package(
                deployment_config['source_path'],
                deployment_config.get('dependencies', [])
            )
            
            # 上传到S3
            s3_url = self.lambda_client.upload_to_s3(
                deployment_package,
                deployment_config['function_name']
            )
            
            # 解析S3 URL
            s3_parts = s3_url.replace('s3://', '').split('/', 1)
            s3_bucket = s3_parts[0]
            s3_key = s3_parts[1]
            
            # 更新函数配置
            function_config = {
                'function_name': deployment_config['function_name'],
                'runtime': deployment_config.get('runtime', 'python3.9'),
                'role_arn': deployment_config['role_arn'],
                'handler': deployment_config.get('handler', 'lambda_function.lambda_handler'),
                'description': deployment_config.get('description', ''),
                'timeout': deployment_config.get('timeout', 30),
                'memory_size': deployment_config.get('memory_size', 128),
                's3_bucket': s3_bucket,
                's3_key': s3_key,
                'environment_variables': deployment_config.get('environment_variables', {}),
                'tags': deployment_config.get('tags', {})
            }
            
            # 创建或更新函数
            function_response = self.lambda_client.create_or_update_function(function_config)
            
            # 发布版本
            version_response = None
            if deployment_config.get('publish', True):
                version_response = self.lambda_client.publish_version(
                    deployment_config['function_name'],
                    f"Deployed by CI/CD pipeline at {datetime.now().isoformat()}"
                )
            
            # 创建别名
            alias_response = None
            if 'alias' in deployment_config and version_response:
                alias_response = self.lambda_client.create_alias(
                    deployment_config['function_name'],
                    deployment_config['alias'],
                    version_response['Version'],
                    f"Alias for version {version_response['Version']}"
                )
            
            self.logger.info(f"Deployment completed for function {deployment_config['function_name']}")
            
            return {
                'function': function_response,
                'version': version_response,
                'alias': alias_response,
                's3_url': s3_url
            }
        except Exception as e:
            self.logger.error(f"Failed to execute deployment: {e}")
            raise
    
    def run_tests(self, test_config: Dict) -> Dict:
        """运行函数测试"""
        try:
            self.logger.info(f"Running tests for function {test_config['function_name']}")
            
            test_results = {
                'function_name': test_config['function_name'],
                'total_tests': 0,
                'passed_tests': 0,
                'failed_tests': 0,
                'test_cases': []
            }
            
            for test_case in test_config.get('test_cases', []):
                test_results['total_tests'] += 1
                
                try:
                    # 调用函数
                    result = self.lambda_client.invoke_function(
                        test_config['function_name'],
                        test_case.get('payload', {}),
                        test_case.get('qualifier')
                    )
                    
                    # 验证结果
                    expected_status = test_case.get('expected_status')
                    if expected_status and result['status_code'] != expected_status:
                        raise AssertionError(f"Expected status {expected_status}, got {result['status_code']}")
                    
                    # 检查预期响应
                    expected_response = test_case.get('expected_response')
                    if expected_response and result['payload'] != expected_response:
                        raise AssertionError(f"Response mismatch")
                    
                    test_results['passed_tests'] += 1
                    test_case_result = {
                        'name': test_case['name'],
                        'status': 'passed',
                        'result': result
                    }
                    
                except Exception as e:
                    test_results['failed_tests'] += 1
                    test_case_result = {
                        'name': test_case['name'],
                        'status': 'failed',
                        'error': str(e),
                        'result': result if 'result' in locals() else None
                    }
                
                test_results['test_cases'].append(test_case_result)
            
            # 计算通过率
            pass_rate = (test_results['passed_tests'] / test_results['total_tests'] * 100) if test_results['total_tests'] > 0 else 0
            test_results['pass_rate'] = pass_rate
            
            self.logger.info(f"Tests completed: {test_results['passed_tests']}/{test_results['total_tests']} passed ({pass_rate:.1f}%)")
            
            return test_results
        except Exception as e:
            self.logger.error(f"Failed to run tests: {e}")
            raise
```

## Azure Functions集成实践

Azure Functions作为微软的FaaS平台，也支持丰富的集成能力。

### 1. 认证配置

Azure Functions支持多种认证方式：

#### 服务主体认证
```yaml
# Azure Functions集成配置
azure_functions_integration:
  enabled: true
  subscription_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  tenant_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  auth:
    type: "service_principal"
    client_id: "${AZURE_CLIENT_ID}"
    client_secret: "${AZURE_CLIENT_SECRET}"
  
  resource_group: "my-resource-group"
  storage_account: "myfunctionstorage"
  
  deployment:
    container_registry: "myregistry.azurecr.io"
    container_name: "functions"
```

#### 客户端实现
```python
#!/usr/bin/env python3
"""
Azure Functions集成工具
实现与Azure Functions的深度集成
"""

from azure.identity import ClientSecretCredential
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.web import WebSiteManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.storage.blob import BlobServiceClient
import logging
from typing import Dict, Optional

class AzureFunctionsIntegration:
    def __init__(self, config: Dict):
        self.config = config
        self.subscription_id = config['subscription_id']
        self.tenant_id = config['tenant_id']
        self.logger = logging.getLogger(__name__)
        
        # 创建认证凭据
        self.credential = self._create_credential()
        
        # 创建管理客户端
        self.resource_client = ResourceManagementClient(
            self.credential, self.subscription_id
        )
        self.web_client = WebSiteManagementClient(
            self.credential, self.subscription_id
        )
        self.storage_client = StorageManagementClient(
            self.credential, self.subscription_id
        )
    
    def _create_credential(self):
        """创建认证凭据"""
        auth_config = self.config['auth']
        
        if auth_config['type'] == 'service_principal':
            return ClientSecretCredential(
                self.tenant_id,
                auth_config['client_id'],
                auth_config['client_secret']
            )
        else:
            raise ValueError(f"Unsupported auth type: {auth_config['type']}")
    
    def create_or_update_function_app(self, app_config: Dict) -> Dict:
        """创建或更新函数应用"""
        try:
            resource_group = app_config.get('resource_group', self.config['resource_group'])
            app_name = app_config['app_name']
            
            # 准备函数应用参数
            app_params = {
                'location': app_config.get('location', 'East US'),
                'kind': 'functionapp',
                'reserved': False,  # Windows应用
                'server_farm_id': app_config['app_service_plan_id'],
                'site_config': {
                    'app_settings': self._prepare_app_settings(app_config)
                }
            }
            
            # 创建或更新函数应用
            poller = self.web_client.web_apps.begin_create_or_update(
                resource_group,
                app_name,
                app_params
            )
            
            result = poller.result()
            
            self.logger.info(f"Function app {app_name} created/updated successfully")
            return result
        except Exception as e:
            self.logger.error(f"Failed to create/update function app {app_config['app_name']}: {e}")
            raise
    
    def _prepare_app_settings(self, app_config: Dict) -> List[Dict]:
        """准备应用设置"""
        settings = []
        
        # 基本设置
        settings.extend([
            {'name': 'FUNCTIONS_WORKER_RUNTIME', 'value': app_config.get('runtime', 'python')},
            {'name': 'FUNCTIONS_EXTENSION_VERSION', 'value': '~4'},
            {'name': 'AzureWebJobsStorage', 'value': self._get_storage_connection_string()},
            {'name': 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING', 'value': self._get_storage_connection_string()},
            {'name': 'WEBSITE_CONTENTSHARE', 'value': app_config['app_name'].lower()}
        ])
        
        # 自定义环境变量
        for key, value in app_config.get('environment_variables', {}).items():
            settings.append({'name': key, 'value': value})
        
        return settings
    
    def _get_storage_connection_string(self) -> str:
        """获取存储账户连接字符串"""
        try:
            resource_group = self.config['resource_group']
            storage_account = self.config['storage_account']
            
            # 获取存储账户密钥
            keys = self.storage_client.storage_accounts.list_keys(
                resource_group, storage_account
            )
            
            # 构建连接字符串
            connection_string = (
                f"DefaultEndpointsProtocol=https;"
                f"AccountName={storage_account};"
                f"AccountKey={keys.keys[0].value};"
                f"EndpointSuffix=core.windows.net"
            )
            
            return connection_string
        except Exception as e:
            self.logger.error(f"Failed to get storage connection string: {e}")
            raise
    
    def deploy_function_code(self, app_name: str, package_path: str) -> bool:
        """部署函数代码"""
        try:
            resource_group = self.config['resource_group']
            
            # 上传部署包到Kudu
            with open(package_path, 'rb') as f:
                package_data = f.read()
            
            # 使用ZIP部署API
            self.web_client.web_apps.begin_create_zip_deployment_slot(
                resource_group,
                app_name,
                {
                    'package_uri': None,  # 直接上传数据
                    'zip_content': package_data
                }
            )
            
            self.logger.info(f"Function code deployed to {app_name}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to deploy function code to {app_name}: {e}")
            raise
```

## Google Cloud Functions集成实践

Google Cloud Functions作为谷歌的FaaS平台，也有其独特的集成方式。

### 1. 认证配置

Google Cloud Functions支持服务账户密钥认证：

#### 服务账户认证
```yaml
# Google Cloud Functions集成配置
gcp_functions_integration:
  enabled: true
  project_id: "my-gcp-project"
  region: "us-central1"
  auth:
    type: "service_account"
    credentials_file: "${GOOGLE_APPLICATION_CREDENTIALS}"
  
  deployment:
    bucket: "gcf-deployment-artifacts"
    prefix: "functions/"
```

#### 客户端实现
```python
#!/usr/bin/env python3
"""
Google Cloud Functions集成工具
实现与Google Cloud Functions的深度集成
"""

from google.cloud import functions_v1
from google.cloud import storage
from google.oauth2 import service_account
import zipfile
import io
import logging
from typing import Dict

class GCPFunctionsIntegration:
    def __init__(self, config: Dict):
        self.config = config
        self.project_id = config['project_id']
        self.region = config['region']
        self.logger = logging.getLogger(__name__)
        
        # 创建客户端
        self.functions_client = self._create_functions_client()
        self.storage_client = self._create_storage_client()
    
    def _create_functions_client(self):
        """创建Cloud Functions客户端"""
        auth_config = self.config['auth']
        
        if auth_config['type'] == 'service_account':
            credentials = service_account.Credentials.from_service_account_file(
                auth_config['credentials_file']
            )
            return functions_v1.CloudFunctionsServiceClient(credentials=credentials)
        else:
            return functions_v1.CloudFunctionsServiceClient()
    
    def _create_storage_client(self):
        """创建Cloud Storage客户端"""
        auth_config = self.config['auth']
        
        if auth_config['type'] == 'service_account':
            credentials = service_account.Credentials.from_service_account_file(
                auth_config['credentials_file']
            )
            return storage.Client(
                project=self.project_id,
                credentials=credentials
            )
        else:
            return storage.Client(project=self.project_id)
    
    def create_deployment_archive(self, source_dir: str) -> bytes:
        """创建部署归档文件"""
        try:
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                import os
                for root, dirs, files in os.walk(source_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_path = os.path.relpath(file_path, source_dir)
                        zip_file.write(file_path, arc_path)
            
            zip_buffer.seek(0)
            return zip_buffer.read()
        except Exception as e:
            self.logger.error(f"Failed to create deployment archive: {e}")
            raise
    
    def upload_to_cloud_storage(self, archive_data: bytes, 
                              function_name: str) -> str:
        """上传到Cloud Storage"""
        try:
            deployment_config = self.config['deployment']
            bucket_name = deployment_config['bucket']
            prefix = deployment_config.get('prefix', '')
            
            # 生成对象名称
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
            object_name = f"{prefix}{function_name}/{timestamp}.zip"
            
            # 上传到存储桶
            bucket = self.storage_client.bucket(bucket_name)
            blob = bucket.blob(object_name)
            blob.upload_from_string(archive_data)
            
            source_url = f"gs://{bucket_name}/{object_name}"
            self.logger.info(f"Archive uploaded to {source_url}")
            return source_url
        except Exception as e:
            self.logger.error(f"Failed to upload archive to Cloud Storage: {e}")
            raise
    
    def create_or_update_function(self, function_config: Dict) -> Dict:
        """创建或更新Cloud Function"""
        try:
            function_name = function_config['function_name']
            location = f"projects/{self.project_id}/locations/{self.region}"
            full_function_name = f"{location}/functions/{function_name}"
            
            # 准备函数配置
            function = functions_v1.CloudFunction()
            function.name = full_function_name
            function.runtime = function_config.get('runtime', 'python39')
            function.entry_point = function_config.get('entry_point', 'main')
            
            # 设置触发器
            trigger_type = function_config.get('trigger_type', 'http')
            if trigger_type == 'http':
                function.https_trigger = functions_v1.HttpsTrigger()
            # 可以添加其他触发器类型
            
            # 设置源代码
            if 'source_url' in function_config:
                function.source_archive_url = function_config['source_url']
            
            # 设置环境变量
            if 'environment_variables' in function_config:
                function.environment_variables = function_config['environment_variables']
            
            # 检查函数是否存在
            try:
                existing_function = self.functions_client.get_function(
                    name=full_function_name
                )
                function_exists = True
            except Exception:
                function_exists = False
            
            if function_exists:
                # 更新现有函数
                update_mask = {
                    'paths': ['source_archive_url', 'environment_variables']
                }
                operation = self.functions_client.update_function(
                    function=function,
                    update_mask=update_mask
                )
            else:
                # 创建新函数
                function.description = function_config.get('description', '')
                operation = self.functions_client.create_function(
                    location=location,
                    function=function
                )
            
            # 等待操作完成
            result = operation.result()
            
            self.logger.info(f"Function {function_name} {'updated' if function_exists else 'created'} successfully")
            return result
        except Exception as e:
            self.logger.error(f"Failed to create/update function {function_config['function_name']}: {e}")
            raise
    
    def invoke_function(self, function_name: str, data: Dict = None) -> Dict:
        """调用Cloud Function"""
        try:
            import requests
            import json
            
            # 获取函数URL
            location = f"projects/{self.project_id}/locations/{self.region}"
            full_function_name = f"{location}/functions/{function_name}"
            
            function = self.functions_client.get_function(name=full_function_name)
            
            if not function.https_trigger:
                raise ValueError("Function does not have HTTP trigger")
            
            # 调用函数
            response = requests.post(
                function.https_trigger.url,
                json=data or {},
                headers={'Content-Type': 'application/json'}
            )
            
            return {
                'status_code': response.status_code,
                'headers': dict(response.headers),
                'body': response.json() if response.content else None
            }
        except Exception as e:
            self.logger.error(f"Failed to invoke function {function_name}: {e}")
            raise
```

通过与Serverless/FaaS平台的深度集成，CI/CD平台能够实现函数的自动化构建、测试、部署和监控，提升函数交付效率并优化资源利用。关键是要根据团队使用的具体云平台选择合适的集成方案，并建立完善的部署流水线和测试机制。