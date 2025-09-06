---
title: 与沟通工具（钉钉/企微）集成：构建结果通知
date: 2025-09-07
categories: [CICD]
tags: [dingtalk, wecom, communication, integration, notification, devops]
published: true
---

在现代软件开发团队中，及时的沟通和信息共享是确保项目顺利进行的关键。通过将CI/CD平台与钉钉、企业微信等沟通工具集成，可以实时推送构建和部署状态，确保团队成员及时了解项目进展，快速响应问题。这种集成不仅提高了团队的协作效率，还增强了开发流程的透明度。

## 沟通工具集成方案

构建结果通知系统需要支持多种沟通工具，并提供丰富的通知内容和灵活的配置选项。

### 集成实现

#### 1. 多平台通知支持
实现对钉钉和企业微信的通知支持：

```python
#!/usr/bin/env python3
"""
沟通工具集成管理器
"""

import json
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import hashlib
import hmac
import base64
import urllib.parse

class CommunicationIntegrationManager:
    def __init__(self):
        self.integrations = {}
        self.logger = logging.getLogger(__name__)
    
    def register_dingtalk_webhook(self, name: str, webhook_url: str, 
                                secret: str = None) -> Dict[str, Any]:
        """注册钉钉Webhook"""
        try:
            self.integrations[name] = {
                'type': 'dingtalk',
                'webhook_url': webhook_url,
                'secret': secret,
                'enabled': True
            }
            
            return {
                'success': True,
                'message': f"DingTalk webhook {name} registered successfully"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to register DingTalk webhook: {str(e)}"
            }
    
    def register_wecom_webhook(self, name: str, webhook_url: str, 
                             secret: str = None) -> Dict[str, Any]:
        """注册企业微信Webhook"""
        try:
            self.integrations[name] = {
                'type': 'wecom',
                'webhook_url': webhook_url,
                'secret': secret,
                'enabled': True
            }
            
            return {
                'success': True,
                'message': f"WeCom webhook {name} registered successfully"
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Failed to register WeCom webhook: {str(e)}"
            }
    
    def send_dingtalk_message(self, webhook_name: str, 
                            message: Dict[str, Any]) -> Dict[str, Any]:
        """发送钉钉消息"""
        integration = self.integrations.get(webhook_name)
        if not integration or integration['type'] != 'dingtalk' or not integration['enabled']:
            return {
                'success': False,
                'error': f"DingTalk webhook {webhook_name} not found or disabled"
            }
        
        try:
            # 构建请求URL（如果需要签名）
            url = integration['webhook_url']
            if integration.get('secret'):
                timestamp = str(round(datetime.now().timestamp() * 1000))
                sign = self._generate_dingtalk_sign(integration['secret'], timestamp)
                url = f"{integration['webhook_url']}&timestamp={timestamp}&sign={sign}"
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, headers=headers, json=message)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('errcode') == 0:
                    return {
                        'success': True,
                        'message': 'DingTalk message sent successfully'
                    }
                else:
                    return {
                        'success': False,
                        'error': f"Failed to send DingTalk message: {result.get('errmsg')}"
                    }
            else:
                return {
                    'success': False,
                    'error': f"HTTP error {response.status_code}: {response.text}"
                }
        except Exception as e:
            return {
                'success': False,
                'error': f"Exception during DingTalk message sending: {str(e)}"
            }
    
    def send_wecom_message(self, webhook_name: str, 
                          message: Dict[str, Any]) -> Dict[str, Any]:
        """发送企业微信消息"""
        integration = self.integrations.get(webhook_name)
        if not integration or integration['type'] != 'wecom' or not integration['enabled']:
            return {
                'success': False,
                'error': f"WeCom webhook {webhook_name} not found or disabled"
            }
        
        try:
            headers = {
                'Content-Type': 'application/json'
            }
            
            response = requests.post(integration['webhook_url'], headers=headers, json=message)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('errcode') == 0:
                    return {
                        'success': True,
                        'message': 'WeCom message sent successfully'
                    }
                else:
                    return {
                        'success': False,
                        'error': f"Failed to send WeCom message: {result.get('errmsg')}"
                    }
            else:
                return {
                    'success': False,
                    'error': f"HTTP error {response.status_code}: {response.text}"
                }
        except Exception as e:
            return {
                'success': False,
                'error': f"Exception during WeCom message sending: {str(e)}"
            }
    
    def _generate_dingtalk_sign(self, secret: str, timestamp: str) -> str:
        """生成钉钉签名"""
        string_to_sign = f'{timestamp}\n{secret}'
        hmac_code = hmac.new(
            secret.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).digest()
        sign = urllib.parse.quote_plus(base64.b64encode(hmac_code))
        return sign
    
    def create_build_notification(self, build_info: Dict[str, Any]) -> Dict[str, Any]:
        """创建构建通知消息"""
        try:
            # 构建通知内容
            status_emoji = "✅" if build_info.get('status') == 'SUCCESS' else "❌"
            status_text = "成功" if build_info.get('status') == 'SUCCESS' else "失败"
            
            title = f"{status_emoji} 构建通知 - {build_info.get('project_name', 'Unknown Project')}"
            content = f"""
**项目**: {build_info.get('project_name', 'N/A')}
**分支**: {build_info.get('branch', 'N/A')}
**构建号**: #{build_info.get('build_number', 'N/A')}
**状态**: {status_text}
**触发者**: {build_info.get('triggered_by', 'N/A')}
**耗时**: {build_info.get('duration', 'N/A')} 秒
**时间**: {build_info.get('finished_at', datetime.now().isoformat())}

[查看构建详情]({build_info.get('build_url', '#')})
"""
            
            # 钉钉消息格式
            dingtalk_message = {
                "msgtype": "markdown",
                "markdown": {
                    "title": title,
                    "text": content
                },
                "at": {
                    "atMobiles": build_info.get('notify_mobiles', []),
                    "isAtAll": build_info.get('notify_all', False)
                }
            }
            
            # 企业微信消息格式
            wecom_message = {
                "msgtype": "markdown",
                "markdown": {
                    "content": f"## {title}\n{content}"
                }
            }
            
            return {
                'success': True,
                'dingtalk_message': dingtalk_message,
                'wecom_message': wecom_message
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Exception during notification creation: {str(e)}"
            }
    
    def send_build_notification(self, webhook_name: str, 
                              build_info: Dict[str, Any]) -> Dict[str, Any]:
        """发送构建通知"""
        integration = self.integrations.get(webhook_name)
        if not integration:
            return {
                'success': False,
                'error': f"Webhook {webhook_name} not found"
            }
        
        # 创建通知消息
        notification_result = self.create_build_notification(build_info)
        if not notification_result['success']:
            return notification_result
        
        # 根据平台类型发送消息
        if integration['type'] == 'dingtalk':
            return self.send_dingtalk_message(webhook_name, notification_result['dingtalk_message'])
        elif integration['type'] == 'wecom':
            return self.send_wecom_message(webhook_name, notification_result['wecom_message'])
        else:
            return {
                'success': False,
                'error': f"Unsupported integration type: {integration['type']}"
            }
    
    def create_deployment_notification(self, deployment_info: Dict[str, Any]) -> Dict[str, Any]:
        """创建部署通知消息"""
        try:
            # 部署通知内容
            status_emoji = "✅" if deployment_info.get('status') == 'SUCCESS' else "⚠️"
            status_text = "成功" if deployment_info.get('status') == 'SUCCESS' else "部分成功"
            
            title = f"{status_emoji} 部署通知 - {deployment_info.get('service_name', 'Unknown Service')}"
            content = f"""
**服务**: {deployment_info.get('service_name', 'N/A')}
**环境**: {deployment_info.get('environment', 'N/A')}
**版本**: {deployment_info.get('version', 'N/A')}
**状态**: {status_text}
**部署者**: {deployment_info.get('deployed_by', 'N/A')}
**耗时**: {deployment_info.get('duration', 'N/A')} 秒
**时间**: {deployment_info.get('finished_at', datetime.now().isoformat())}

[查看部署详情]({deployment_info.get('deployment_url', '#')})
"""
            
            # 钉钉消息格式
            dingtalk_message = {
                "msgtype": "markdown",
                "markdown": {
                    "title": title,
                    "text": content
                },
                "at": {
                    "atMobiles": deployment_info.get('notify_mobiles', []),
                    "isAtAll": deployment_info.get('notify_all', False)
                }
            }
            
            # 企业微信消息格式
            wecom_message = {
                "msgtype": "markdown",
                "markdown": {
                    "content": f"## {title}\n{content}"
                }
            }
            
            return {
                'success': True,
                'dingtalk_message': dingtalk_message,
                'wecom_message': wecom_message
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Exception during deployment notification creation: {str(e)}"
            }
    
    def send_deployment_notification(self, webhook_name: str, 
                                   deployment_info: Dict[str, Any]) -> Dict[str, Any]:
        """发送部署通知"""
        integration = self.integrations.get(webhook_name)
        if not integration:
            return {
                'success': False,
                'error': f"Webhook {webhook_name} not found"
            }
        
        # 创建通知消息
        notification_result = self.create_deployment_notification(deployment_info)
        if not notification_result['success']:
            return notification_result
        
        # 根据平台类型发送消息
        if integration['type'] == 'dingtalk':
            return self.send_dingtalk_message(webhook_name, notification_result['dingtalk_message'])
        elif integration['type'] == 'wecom':
            return self.send_wecom_message(webhook_name, notification_result['wecom_message'])
        else:
            return {
                'success': False,
                'error': f"Unsupported integration type: {integration['type']}"
            }
    
    def create_pipeline_summary_notification(self, pipeline_info: Dict[str, Any]) -> Dict[str, Any]:
        """创建流水线汇总通知"""
        try:
            # 计算总体状态
            total_stages = len(pipeline_info.get('stages', []))
            success_stages = len([s for s in pipeline_info.get('stages', []) if s.get('status') == 'SUCCESS'])
            failed_stages = len([s for s in pipeline_info.get('stages', []) if s.get('status') == 'FAILED'])
            
            if failed_stages > 0:
                status_emoji = "❌"
                status_text = "失败"
            elif success_stages == total_stages:
                status_emoji = "✅"
                status_text = "成功"
            else:
                status_emoji = "⚠️"
                status_text = "部分成功"
            
            title = f"{status_emoji} 流水线执行完成 - {pipeline_info.get('pipeline_name', 'Unknown Pipeline')}"
            
            # 构建阶段详情
            stage_details = "\n".join([
                f"- {stage.get('name', 'Unknown')}: "
                f"{'✅' if stage.get('status') == 'SUCCESS' else '❌' if stage.get('status') == 'FAILED' else '⏳'} "
                f"({stage.get('duration', 0)}s)"
                for stage in pipeline_info.get('stages', [])
            ])
            
            content = f"""
**流水线**: {pipeline_info.get('pipeline_name', 'N/A')}
**触发者**: {pipeline_info.get('triggered_by', 'N/A')}
**状态**: {status_text}
**总计阶段**: {total_stages}
**成功**: {success_stages}
**失败**: {failed_stages}
**总耗时**: {pipeline_info.get('total_duration', 0)} 秒
**完成时间**: {pipeline_info.get('finished_at', datetime.now().isoformat())}

**阶段详情**:
{stage_details}

[查看流水线详情]({pipeline_info.get('pipeline_url', '#')})
"""
            
            # 钉钉消息格式
            dingtalk_message = {
                "msgtype": "markdown",
                "markdown": {
                    "title": title,
                    "text": content
                },
                "at": {
                    "atMobiles": pipeline_info.get('notify_mobiles', []),
                    "isAtAll": pipeline_info.get('notify_all', False)
                }
            }
            
            # 企业微信消息格式
            wecom_message = {
                "msgtype": "markdown",
                "markdown": {
                    "content": f"## {title}\n{content}"
                }
            }
            
            return {
                'success': True,
                'dingtalk_message': dingtalk_message,
                'wecom_message': wecom_message
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Exception during pipeline summary notification creation: {str(e)}"
            }

# 使用示例
# comm_manager = CommunicationIntegrationManager()
# 
# # 注册钉钉Webhook
# dingtalk_result = comm_manager.register_dingtalk_webhook(
#     name="dev-team",
#     webhook_url="https://oapi.dingtalk.com/robot/send?access_token=your-token",
#     secret="your-secret"  # 如果启用了签名
# )
# print(dingtalk_result)
# 
# # 注册企业微信Webhook
# wecom_result = comm_manager.register_wecom_webhook(
#     name="ops-team",
#     webhook_url="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your-key"
# )
# print(wecom_result)
# 
# # 发送构建通知
# build_notification_result = comm_manager.send_build_notification(
#     webhook_name="dev-team",
#     build_info={
#         'project_name': 'user-service',
#         'branch': 'main',
#         'build_number': 123,
#         'status': 'SUCCESS',
#         'triggered_by': '张三',
#         'duration': 120,
#         'finished_at': '2025-09-07T10:30:00Z',
#         'build_url': 'https://ci.example.com/builds/123',
#         'notify_mobiles': ['13800138000'],
#         'notify_all': False
#     }
# )
# print(build_notification_result)
# 
# # 发送部署通知
# deployment_notification_result = comm_manager.send_deployment_notification(
#     webhook_name="ops-team",
#     deployment_info={
#         'service_name': 'order-service',
#         'environment': 'production',
#         'version': 'v1.2.3',
#         'status': 'SUCCESS',
#         'deployed_by': '李四',
#         'duration': 180,
#         'finished_at': '2025-09-07T11:00:00Z',
#         'deployment_url': 'https://cd.example.com/deployments/456',
#         'notify_mobiles': [],
#         'notify_all': True
#     }
# )
# print(deployment_notification_result)