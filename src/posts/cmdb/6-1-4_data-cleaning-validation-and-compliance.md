---
title: 数据清洗、校验与合规检查
date: 2025-09-07
categories: [CMDB]
tags: [cmdb, data-cleaning, data-validation, compliance, data-quality]
published: true
---

在配置管理数据库（CMDB）的自动发现过程中，原始采集的数据往往包含噪声、不一致性和错误信息。为了确保CMDB数据的准确性、完整性和可靠性，数据清洗、校验与合规检查成为不可或缺的关键环节。本文将深入探讨这些数据处理技术的原理、方法和最佳实践。

## 数据质量问题的来源

### 采集过程中的问题

自动发现过程中可能产生多种数据质量问题：

1. **格式不一致**：不同采集工具或协议返回的数据格式可能存在差异
2. **数据缺失**：某些字段可能由于权限或技术限制而无法获取
3. **数据错误**：采集过程中可能出现数据传输错误或解析错误
4. **重复数据**：同一配置项可能被多个发现任务重复发现
5. **过期数据**：目标系统状态已变化，但采集到的仍是旧数据

### 数据整合中的问题

在将多源数据整合到CMDB时，还会遇到以下问题：

1. **命名冲突**：不同系统对同一概念可能使用不同的命名方式
2. **数据冲突**：同一配置项在不同数据源中的信息可能存在矛盾
3. **关联错误**：配置项之间的关系可能存在错误或不完整
4. **时间同步**：不同数据源的时间戳可能不一致

## 数据清洗技术

### 数据清洗概述

数据清洗是指识别和纠正数据中的错误、不一致和不完整信息的过程。在CMDB环境中，数据清洗的目标是提高数据质量，确保数据的准确性、一致性和完整性。

### 技术实现

```python
import re
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from enum import Enum

class DataQualityIssue(Enum):
    MISSING_VALUE = "missing_value"
    INVALID_FORMAT = "invalid_format"
    DUPLICATE_RECORD = "duplicate_record"
    INCONSISTENT_DATA = "inconsistent_data"
    OUT_OF_RANGE = "out_of_range"
    INVALID_REFERENCE = "invalid_reference"

@dataclass
class DataQualityReport:
    issue_type: DataQualityIssue
    field_name: str
    record_id: str
    description: str
    severity: str  # critical, high, medium, low
    suggested_fix: str = None

class DataCleaner:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.cleaning_rules = {}
        self.quality_reports = []
        self.logger = logging.getLogger(__name__)
        
        # 初始化清洗规则
        self._init_cleaning_rules()
    
    def _init_cleaning_rules(self):
        """初始化清洗规则"""
        self.cleaning_rules = {
            'ip_address': self._clean_ip_address,
            'mac_address': self._clean_mac_address,
            'hostname': self._clean_hostname,
            'email': self._clean_email,
            'phone': self._clean_phone,
            'date': self._clean_date,
            'number': self._clean_number
        }
    
    def clean_data(self, raw_data: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[DataQualityReport]]:
        """清洗数据"""
        cleaned_data = []
        self.quality_reports = []
        
        for record in raw_data:
            cleaned_record, record_issues = self._clean_single_record(record)
            cleaned_data.append(cleaned_record)
            self.quality_reports.extend(record_issues)
        
        return cleaned_data, self.quality_reports
    
    def _clean_single_record(self, record: Dict[str, Any]) -> Tuple[Dict[str, Any], List[DataQualityReport]]:
        """清洗单条记录"""
        cleaned_record = record.copy()
        issues = []
        
        # 应用通用清洗规则
        for field_name, field_value in record.items():
            if field_value is None:
                continue
                
            # 根据字段名或类型应用相应的清洗规则
            cleaned_value, field_issues = self._apply_cleaning_rules(field_name, field_value)
            cleaned_record[field_name] = cleaned_value
            issues.extend(field_issues)
        
        # 应用记录级别的清洗规则
        record_issues = self._apply_record_level_cleaning(cleaned_record)
        issues.extend(record_issues)
        
        return cleaned_record, issues
    
    def _apply_cleaning_rules(self, field_name: str, field_value: Any) -> Tuple[Any, List[DataQualityReport]]:
        """应用清洗规则"""
        issues = []
        cleaned_value = field_value
        
        # 根据字段名匹配清洗规则
        if 'ip' in field_name.lower():
            cleaned_value, ip_issues = self.cleaning_rules['ip_address'](field_value)
            issues.extend(ip_issues)
        elif 'mac' in field_name.lower() or 'mac_address' in field_name.lower():
            cleaned_value, mac_issues = self.cleaning_rules['mac_address'](field_value)
            issues.extend(mac_issues)
        elif 'host' in field_name.lower() or 'name' in field_name.lower():
            cleaned_value, host_issues = self.cleaning_rules['hostname'](field_value)
            issues.extend(host_issues)
        elif 'email' in field_name.lower():
            cleaned_value, email_issues = self.cleaning_rules['email'](field_value)
            issues.extend(email_issues)
        elif 'phone' in field_name.lower() or 'tel' in field_name.lower():
            cleaned_value, phone_issues = self.cleaning_rules['phone'](field_value)
            issues.extend(phone_issues)
        
        # 尝试根据数据类型进行清洗
        if isinstance(field_value, str):
            # 字符串清洗
            cleaned_value = field_value.strip()
        elif isinstance(field_value, (int, float)):
            # 数值清洗
            cleaned_value, num_issues = self.cleaning_rules['number'](field_value)
            issues.extend(num_issues)
        
        return cleaned_value, issues
    
    def _clean_ip_address(self, value: Any) -> Tuple[str, List[DataQualityReport]]:
        """清洗IP地址"""
        issues = []
        
        if not isinstance(value, str):
            value = str(value)
        
        # 标准化IP地址格式
        ip_pattern = re.compile(r'^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$')
        match = ip_pattern.match(value.strip())
        
        if not match:
            issues.append(DataQualityReport(
                issue_type=DataQualityIssue.INVALID_FORMAT,
                field_name='ip_address',
                record_id='unknown',
                description=f'无效的IP地址格式: {value}',
                severity='high',
                suggested_fix='检查IP地址格式，应为xxx.xxx.xxx.xxx'
            ))
            return value, issues
        
        # 验证IP地址范围
        octets = [int(x) for x in match.groups()]
        for octet in octets:
            if octet < 0 or octet > 255:
                issues.append(DataQualityReport(
                    issue_type=DataQualityIssue.OUT_OF_RANGE,
                    field_name='ip_address',
                    record_id='unknown',
                    description=f'IP地址段超出范围: {octet}',
                    severity='critical',
                    suggested_fix='IP地址每个段应在0-255之间'
                ))
                return value, issues
        
        # 返回标准化格式
        cleaned_ip = '.'.join(str(octet) for octet in octets)
        return cleaned_ip, issues
    
    def _clean_mac_address(self, value: Any) -> Tuple[str, List[DataQualityReport]]:
        """清洗MAC地址"""
        issues = []
        
        if not isinstance(value, str):
            value = str(value)
        
        # 移除空格和特殊字符，统一格式
        cleaned_mac = re.sub(r'[^0-9a-fA-F]', '', value)
        
        # 验证长度
        if len(cleaned_mac) != 12:
            issues.append(DataQualityReport(
                issue_type=DataQualityIssue.INVALID_FORMAT,
                field_name='mac_address',
                record_id='unknown',
                description=f'MAC地址长度不正确: {value}',
                severity='high',
                suggested_fix='MAC地址应为12个十六进制字符'
            ))
            return value, issues
        
        # 格式化为标准形式
        formatted_mac = ':'.join(cleaned_mac[i:i+2] for i in range(0, 12, 2)).upper()
        return formatted_mac, issues
    
    def _clean_hostname(self, value: Any) -> Tuple[str, List[DataQualityReport]]:
        """清洗主机名"""
        issues = []
        
        if not isinstance(value, str):
            value = str(value)
        
        # 移除首尾空格
        cleaned_hostname = value.strip()
        
        # 验证主机名格式
        hostname_pattern = re.compile(r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$')
        
        if not hostname_pattern.match(cleaned_hostname):
            issues.append(DataQualityReport(
                issue_type=DataQualityIssue.INVALID_FORMAT,
                field_name='hostname',
                record_id='unknown',
                description=f'无效的主机名格式: {value}',
                severity='medium',
                suggested_fix='主机名应符合RFC 1123标准'
            ))
        
        # 转换为小写
        return cleaned_hostname.lower(), issues
    
    def _clean_email(self, value: Any) -> Tuple[str, List[DataQualityReport]]:
        """清洗邮箱地址"""
        issues = []
        
        if not isinstance(value, str):
            value = str(value)
        
        cleaned_email = value.strip().lower()
        
        # 验证邮箱格式
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        
        if not email_pattern.match(cleaned_email):
            issues.append(DataQualityReport(
                issue_type=DataQualityIssue.INVALID_FORMAT,
                field_name='email',
                record_id='unknown',
                description=f'无效的邮箱格式: {value}',
                severity='high',
                suggested_fix='邮箱地址应符合标准格式'
            ))
        
        return cleaned_email, issues
    
    def _clean_phone(self, value: Any) -> Tuple[str, List[DataQualityReport]]:
        """清洗电话号码"""
        issues = []
        
        if not isinstance(value, str):
            value = str(value)
        
        # 移除所有非数字字符
        digits_only = re.sub(r'\D', '', value)
        
        # 验证长度（简单验证）
        if len(digits_only) < 7 or len(digits_only) > 15:
            issues.append(DataQualityReport(
                issue_type=DataQualityIssue.INVALID_FORMAT,
                field_name='phone',
                record_id='unknown',
                description=f'电话号码长度不正确: {value}',
                severity='medium',
                suggested_fix='电话号码应为7-15位数字'
            ))
            return value, issues
        
        # 格式化电话号码（简单格式化）
        if len(digits_only) == 11 and digits_only.startswith('1'):
            # 中国手机号
            formatted_phone = f"+86 {digits_only[:3]}-{digits_only[3:7]}-{digits_only[7:]}"
        else:
            # 其他格式
            formatted_phone = f"+{digits_only}"
        
        return formatted_phone, issues
    
    def _clean_date(self, value: Any) -> Tuple[str, List[DataQualityReport]]:
        """清洗日期"""
        issues = []
        
        if isinstance(value, str):
            # 尝试解析字符串日期
            date_formats = [
                '%Y-%m-%d',
                '%Y/%m/%d',
                '%d-%m-%Y',
                '%d/%m/%Y',
                '%Y-%m-%d %H:%M:%S',
                '%Y/%m/%d %H:%M:%S'
            ]
            
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(value, fmt)
                    return parsed_date.isoformat(), issues
                except ValueError:
                    continue
            
            issues.append(DataQualityReport(
                issue_type=DataQualityIssue.INVALID_FORMAT,
                field_name='date',
                record_id='unknown',
                description=f'无法解析的日期格式: {value}',
                severity='medium',
                suggested_fix='日期应使用标准格式如YYYY-MM-DD'
            ))
        elif isinstance(value, (int, float)):
            # 假设是时间戳
            try:
                date_obj = datetime.fromtimestamp(value)
                return date_obj.isoformat(), issues
            except ValueError:
                issues.append(DataQualityReport(
                    issue_type=DataQualityIssue.INVALID_FORMAT,
                    field_name='date',
                    record_id='unknown',
                    description=f'无效的时间戳: {value}',
                    severity='high',
                    suggested_fix='时间戳应为有效的Unix时间戳'
                ))
        
        return str(value), issues
    
    def _clean_number(self, value: Any) -> Tuple[float, List[DataQualityReport]]:
        """清洗数字"""
        issues = []
        
        if isinstance(value, str):
            try:
                cleaned_number = float(value)
                return cleaned_number, issues
            except ValueError:
                issues.append(DataQualityReport(
                    issue_type=DataQualityIssue.INVALID_FORMAT,
                    field_name='number',
                    record_id='unknown',
                    description=f'无法转换为数字: {value}',
                    severity='high',
                    suggested_fix='数值字段应包含有效的数字'
                ))
                return value, issues
        elif isinstance(value, (int, float)):
            return float(value), issues
        else:
            issues.append(DataQualityReport(
                issue_type=DataQualityIssue.INVALID_FORMAT,
                field_name='number',
                record_id='unknown',
                description=f'无效的数据类型: {type(value)}',
                severity='high',
                suggested_fix='数值字段应为数字类型'
            ))
            return value, issues
    
    def _apply_record_level_cleaning(self, record: Dict[str, Any]) -> List[DataQualityReport]:
        """应用记录级别的清洗规则"""
        issues = []
        
        # 检查必需字段
        required_fields = self.config.get('required_fields', [])
        for field in required_fields:
            if field not in record or record[field] is None or record[field] == '':
                issues.append(DataQualityReport(
                    issue_type=DataQualityIssue.MISSING_VALUE,
                    field_name=field,
                    record_id=record.get('id', 'unknown'),
                    description=f'必需字段缺失: {field}',
                    severity='critical',
                    suggested_fix=f'提供 {field} 字段的值'
                ))
        
        # 检查字段一致性
        consistency_rules = self.config.get('consistency_rules', {})
        for field, rules in consistency_rules.items():
            if field in record:
                field_value = record[field]
                # 应用一致性规则
                if not self._check_consistency(field, field_value, record, rules):
                    issues.append(DataQualityReport(
                        issue_type=DataQualityIssue.INCONSISTENT_DATA,
                        field_name=field,
                        record_id=record.get('id', 'unknown'),
                        description=f'字段 {field} 与相关字段不一致',
                        severity='medium',
                        suggested_fix='检查字段间的一致性'
                    ))
        
        return issues
    
    def _check_consistency(self, field: str, value: Any, record: Dict[str, Any], rules: Dict[str, Any]) -> bool:
        """检查字段一致性"""
        # 检查依赖字段
        if 'depends_on' in rules:
            dependent_field = rules['depends_on']
            if dependent_field in record:
                dependent_value = record[dependent_field]
                # 根据依赖关系检查一致性
                if 'valid_combinations' in rules:
                    valid_combinations = rules['valid_combinations']
                    combination = (dependent_value, value)
                    if combination not in valid_combinations:
                        return False
        
        # 检查数值范围
        if 'range' in rules and isinstance(value, (int, float)):
            min_val, max_val = rules['range']
            if not (min_val <= value <= max_val):
                return False
        
        return True
    
    def get_quality_report(self) -> List[DataQualityReport]:
        """获取数据质量报告"""
        return self.quality_reports
    
    def generate_summary_report(self) -> Dict[str, Any]:
        """生成摘要报告"""
        if not self.quality_reports:
            return {'status': 'no_issues', 'total_records': 0, 'issues_found': 0}
        
        # 统计各类问题
        issue_counts = {}
        severity_counts = {}
        
        for report in self.quality_reports:
            # 按问题类型统计
            issue_type = report.issue_type.value
            issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
            
            # 按严重程度统计
            severity_counts[report.severity] = severity_counts.get(report.severity, 0) + 1
        
        return {
            'status': 'issues_found',
            'total_issues': len(self.quality_reports),
            'issue_types': issue_counts,
            'severity_distribution': severity_counts,
            'generated_at': datetime.now().isoformat()
        }

# 使用示例
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # 配置数据清洗器
    config = {
        'required_fields': ['hostname', 'ip_address'],
        'consistency_rules': {
            'cpu_cores': {
                'range': (1, 128)
            },
            'memory_gb': {
                'range': (1, 1024)
            }
        }
    }
    
    cleaner = DataCleaner(config)
    
    # 示例数据
    raw_data = [
        {
            'id': 'host-001',
            'hostname': '  Web-Server-01  ',
            'ip_address': '192.168.1.100',
            'mac_address': '00:11:22:33:44:55',
            'cpu_cores': 8,
            'memory_gb': 32
        },
        {
            'id': 'host-002',
            'hostname': 'DB-SERVER-02',
            'ip_address': '192.168.1.200',
            'mac_address': '00-11-22-33-44-66',
            'cpu_cores': 16,
            'memory_gb': 64
        },
        {
            'id': 'host-003',
            'hostname': 'invalid..hostname',
            'ip_address': '999.999.999.999',
            'mac_address': 'invalid-mac',
            'cpu_cores': 256,  # 超出范围
            'memory_gb': 2048  # 超出范围
        }
    ]
    
    # 清洗数据
    cleaned_data, quality_reports = cleaner.clean_data(raw_data)
    
    print("清洗后的数据:")
    for record in cleaned_data:
        print(json.dumps(record, indent=2, ensure_ascii=False))
    
    print("\n数据质量报告:")
    for report in quality_reports:
        print(f"- {report.issue_type.value}: {report.description} (严重程度: {report.severity})")
    
    print("\n摘要报告:")
    summary = cleaner.generate_summary_report()
    print(json.dumps(summary, indent=2, ensure_ascii=False))
```

## 数据校验技术

### 数据校验概述

数据校验是确保数据符合预定义规则和约束的过程。在CMDB中，数据校验用于验证配置项信息的准确性、完整性和一致性。

### 技术实现

```python
from typing import Dict, List, Any, Callable
import re
from datetime import datetime
from dataclasses import dataclass

@dataclass
class ValidationRule:
    field_name: str
    rule_type: str
    rule_function: Callable
    error_message: str
    severity: str

class DataValidator:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.validation_rules = []
        self.validation_results = []
        self.logger = logging.getLogger(__name__)
        
        # 初始化验证规则
        self._init_validation_rules()
    
    def _init_validation_rules(self):
        """初始化验证规则"""
        # 基本格式验证规则
        self.add_validation_rule('ip_address', 'format', 
                                lambda x: self._validate_ip_format(x),
                                'IP地址格式不正确', 'critical')
        
        self.add_validation_rule('mac_address', 'format',
                                lambda x: self._validate_mac_format(x),
                                'MAC地址格式不正确', 'high')
        
        self.add_validation_rule('email', 'format',
                                lambda x: self._validate_email_format(x),
                                '邮箱格式不正确', 'medium')
        
        self.add_validation_rule('hostname', 'format',
                                lambda x: self._validate_hostname_format(x),
                                '主机名格式不正确', 'medium')
        
        # 数值范围验证规则
        self.add_validation_rule('cpu_cores', 'range',
                                lambda x: self._validate_cpu_cores(x),
                                'CPU核心数超出有效范围', 'high')
        
        self.add_validation_rule('memory_gb', 'range',
                                lambda x: self._validate_memory_gb(x),
                                '内存大小超出有效范围', 'high')
        
        self.add_validation_rule('disk_space_gb', 'range',
                                lambda x: self._validate_disk_space_gb(x),
                                '磁盘空间超出有效范围', 'high')
    
    def add_validation_rule(self, field_name: str, rule_type: str, 
                          rule_function: Callable, error_message: str, severity: str):
        """添加验证规则"""
        rule = ValidationRule(
            field_name=field_name,
            rule_type=rule_type,
            rule_function=rule_function,
            error_message=error_message,
            severity=severity
        )
        self.validation_rules.append(rule)
        self.logger.info(f"添加验证规则: {field_name} ({rule_type})")
    
    def validate_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """验证数据"""
        self.validation_results = []
        
        for record in data:
            record_results = self._validate_single_record(record)
            self.validation_results.extend(record_results)
        
        return self.validation_results
    
    def _validate_single_record(self, record: Dict[str, Any]) -> List[Dict[str, Any]]:
        """验证单条记录"""
        results = []
        
        for rule in self.validation_rules:
            if rule.field_name in record:
                field_value = record[rule.field_name]
                is_valid = rule.rule_function(field_value)
                
                if not is_valid:
                    result = {
                        'record_id': record.get('id', 'unknown'),
                        'field_name': rule.field_name,
                        'rule_type': rule.rule_type,
                        'is_valid': False,
                        'error_message': rule.error_message,
                        'severity': rule.severity,
                        'field_value': field_value,
                        'validated_at': datetime.now().isoformat()
                    }
                    results.append(result)
        
        # 应用记录级别的验证规则
        record_level_results = self._apply_record_level_validation(record)
        results.extend(record_level_results)
        
        return results
    
    def _validate_ip_format(self, value: Any) -> bool:
        """验证IP地址格式"""
        if not isinstance(value, str):
            return False
        
        ip_pattern = re.compile(r'^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$')
        match = ip_pattern.match(value.strip())
        
        if not match:
            return False
        
        # 验证每个段的范围
        octets = [int(x) for x in match.groups()]
        return all(0 <= octet <= 255 for octet in octets)
    
    def _validate_mac_format(self, value: Any) -> bool:
        """验证MAC地址格式"""
        if not isinstance(value, str):
            return False
        
        # 移除分隔符并验证长度
        cleaned_mac = re.sub(r'[^0-9a-fA-F]', '', value)
        return len(cleaned_mac) == 12
    
    def _validate_email_format(self, value: Any) -> bool:
        """验证邮箱格式"""
        if not isinstance(value, str):
            return False
        
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        return bool(email_pattern.match(value.strip()))
    
    def _validate_hostname_format(self, value: Any) -> bool:
        """验证主机名格式"""
        if not isinstance(value, str):
            return False
        
        hostname_pattern = re.compile(r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$')
        return bool(hostname_pattern.match(value.strip()))
    
    def _validate_cpu_cores(self, value: Any) -> bool:
        """验证CPU核心数"""
        if not isinstance(value, (int, float)):
            return False
        
        return 1 <= int(value) <= 128
    
    def _validate_memory_gb(self, value: Any) -> bool:
        """验证内存大小"""
        if not isinstance(value, (int, float)):
            return False
        
        return 1 <= int(value) <= 1024
    
    def _validate_disk_space_gb(self, value: Any) -> bool:
        """验证磁盘空间"""
        if not isinstance(value, (int, float)):
            return False
        
        return 1 <= int(value) <= 100000  # 100TB
    
    def _apply_record_level_validation(self, record: Dict[str, Any]) -> List[Dict[str, Any]]:
        """应用记录级别的验证规则"""
        results = []
        
        # 验证必需字段
        required_fields = self.config.get('required_fields', [])
        for field in required_fields:
            if field not in record or record[field] is None or record[field] == '':
                results.append({
                    'record_id': record.get('id', 'unknown'),
                    'field_name': field,
                    'rule_type': 'required_field',
                    'is_valid': False,
                    'error_message': f'必需字段 {field} 缺失',
                    'severity': 'critical',
                    'field_value': None,
                    'validated_at': datetime.now().isoformat()
                })
        
        # 验证字段间关系
        relationship_rules = self.config.get('relationship_rules', {})
        for rule_name, rule_config in relationship_rules.items():
            rule_results = self._validate_relationship(rule_config, record)
            results.extend(rule_results)
        
        return results
    
    def _validate_relationship(self, rule_config: Dict[str, Any], record: Dict[str, Any]) -> List[Dict[str, Any]]:
        """验证字段间关系"""
        results = []
        
        field1 = rule_config.get('field1')
        field2 = rule_config.get('field2')
        relationship = rule_config.get('relationship')
        
        if field1 in record and field2 in record:
            value1 = record[field1]
            value2 = record[field2]
            
            is_valid = True
            error_message = ""
            
            if relationship == 'greater_than':
                is_valid = value1 > value2
                error_message = f"{field1} 应大于 {field2}"
            elif relationship == 'less_than':
                is_valid = value1 < value2
                error_message = f"{field1} 应小于 {field2}"
            elif relationship == 'equal':
                is_valid = value1 == value2
                error_message = f"{field1} 应等于 {field2}"
            
            if not is_valid:
                results.append({
                    'record_id': record.get('id', 'unknown'),
                    'field_name': f"{field1}_{field2}_relationship",
                    'rule_type': 'relationship',
                    'is_valid': False,
                    'error_message': error_message,
                    'severity': rule_config.get('severity', 'medium'),
                    'field_value': f"{value1} vs {value2}",
                    'validated_at': datetime.now().isoformat()
                })
        
        return results
    
    def get_validation_results(self) -> List[Dict[str, Any]]:
        """获取验证结果"""
        return self.validation_results
    
    def generate_validation_report(self) -> Dict[str, Any]:
        """生成验证报告"""
        if not self.validation_results:
            return {'status': 'all_valid', 'total_records': 0, 'validation_errors': 0}
        
        # 统计验证结果
        total_errors = len(self.validation_results)
        severity_counts = {}
        field_error_counts = {}
        
        for result in self.validation_results:
            # 按严重程度统计
            severity = result['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            # 按字段统计
            field_name = result['field_name']
            field_error_counts[field_name] = field_error_counts.get(field_name, 0) + 1
        
        return {
            'status': 'validation_errors_found',
            'total_errors': total_errors,
            'severity_distribution': severity_counts,
            'field_error_distribution': field_error_counts,
            'generated_at': datetime.now().isoformat()
        }

# 使用示例
# validator = DataValidator({
#     'required_fields': ['hostname', 'ip_address', 'os_type'],
#     'relationship_rules': {
#         'memory_vs_cpu': {
#             'field1': 'memory_gb',
#             'field2': 'cpu_cores',
#             'relationship': 'greater_than',
#             'severity': 'medium'
#         }
#     }
# })
#
# validation_results = validator.validate_data(cleaned_data)
# validation_report = validator.generate_validation_report()
# print(json.dumps(validation_report, indent=2, ensure_ascii=False))
```

## 合规检查技术

### 合规检查概述

合规检查是确保CMDB数据符合组织政策、行业标准和法规要求的过程。这包括数据隐私保护、安全配置检查、审计要求满足等方面。

### 技术实现

```python
from typing import Dict, List, Any
from datetime import datetime
import hashlib

class ComplianceChecker:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.compliance_rules = []
        self.compliance_results = []
        self.logger = logging.getLogger(__name__)
        
        # 初始化合规规则
        self._init_compliance_rules()
    
    def _init_compliance_rules(self):
        """初始化合规规则"""
        # 数据隐私规则
        self.add_compliance_rule(
            'data_privacy',
            'no_sensitive_data_exposure',
            self._check_sensitive_data_exposure,
            '敏感数据不应在CMDB中明文存储',
            'critical'
        )
        
        # 安全配置规则
        self.add_compliance_rule(
            'security',
            'secure_configuration',
            self._check_secure_configuration,
            '配置项应符合安全基线要求',
            'high'
        )
        
        # 审计要求规则
        self.add_compliance_rule(
            'audit',
            'audit_trail_integrity',
            self._check_audit_trail_integrity,
            '配置变更应有完整的审计记录',
            'high'
        )
        
        # 访问控制规则
        self.add_compliance_rule(
            'access_control',
            'proper_access_controls',
            self._check_access_controls,
            '应实施适当的访问控制措施',
            'high'
        )
    
    def add_compliance_rule(self, category: str, rule_name: str, 
                          rule_function: Callable, description: str, severity: str):
        """添加合规规则"""
        rule = {
            'category': category,
            'name': rule_name,
            'function': rule_function,
            'description': description,
            'severity': severity,
            'enabled': True
        }
        self.compliance_rules.append(rule)
        self.logger.info(f"添加合规规则: {category}.{rule_name}")
    
    def check_compliance(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """检查合规性"""
        self.compliance_results = []
        
        for record in data:
            record_results = self._check_single_record_compliance(record)
            self.compliance_results.extend(record_results)
        
        return self.compliance_results
    
    def _check_single_record_compliance(self, record: Dict[str, Any]) -> List[Dict[str, Any]]:
        """检查单条记录的合规性"""
        results = []
        
        for rule in self.compliance_rules:
            if not rule['enabled']:
                continue
            
            try:
                is_compliant, details = rule['function'](record)
                
                if not is_compliant:
                    result = {
                        'record_id': record.get('id', 'unknown'),
                        'category': rule['category'],
                        'rule_name': rule['name'],
                        'is_compliant': False,
                        'description': rule['description'],
                        'severity': rule['severity'],
                        'details': details,
                        'checked_at': datetime.now().isoformat()
                    }
                    results.append(result)
            except Exception as e:
                self.logger.error(f"合规检查规则 {rule['name']} 执行失败: {e}")
                results.append({
                    'record_id': record.get('id', 'unknown'),
                    'category': rule['category'],
                    'rule_name': rule['name'],
                    'is_compliant': False,
                    'description': '合规检查执行异常',
                    'severity': 'high',
                    'details': str(e),
                    'checked_at': datetime.now().isoformat()
                })
        
        return results
    
    def _check_sensitive_data_exposure(self, record: Dict[str, Any]) -> Tuple[bool, str]:
        """检查敏感数据暴露"""
        sensitive_fields = [
            'password', 'pwd', 'secret', 'key', 'token', 'credential',
            'ssn', 'social_security', 'credit_card', 'bank_account'
        ]
        
        exposed_fields = []
        for field_name, field_value in record.items():
            # 检查字段名是否包含敏感信息
            field_lower = field_name.lower()
            if any(sensitive in field_lower for sensitive in sensitive_fields):
                exposed_fields.append(field_name)
                continue
            
            # 检查字段值是否包含敏感信息（简单检查）
            if isinstance(field_value, str):
                value_lower = field_value.lower()
                if any(sensitive in value_lower for sensitive in ['password=', 'pwd=', 'key=']):
                    exposed_fields.append(field_name)
        
        if exposed_fields:
            return False, f"发现可能的敏感数据字段: {', '.join(exposed_fields)}"
        
        return True, "未发现敏感数据暴露"
    
    def _check_secure_configuration(self, record: Dict[str, Any]) -> Tuple[bool, str]:
        """检查安全配置"""
        issues = []
        
        # 检查是否包含安全相关字段
        if 'os_type' in record:
            os_type = record['os_type'].lower()
            if 'windows' in os_type and 'patch_level' not in record:
                issues.append("Windows系统应包含补丁级别信息")
        
        if 'services' in record and isinstance(record['services'], list):
            insecure_services = ['telnet', 'ftp', 'rsh']
            for service in record['services']:
                if isinstance(service, dict) and 'name' in service:
                    service_name = service['name'].lower()
                    if any(insecure in service_name for insecure in insecure_services):
                        issues.append(f"检测到不安全的服务: {service_name}")
        
        if issues:
            return False, "; ".join(issues)
        
        return True, "安全配置检查通过"
    
    def _check_audit_trail_integrity(self, record: Dict[str, Any]) -> Tuple[bool, str]:
        """检查审计轨迹完整性"""
        # 检查是否包含必要的审计字段
        required_audit_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
        missing_fields = [field for field in required_audit_fields if field not in record]
        
        if missing_fields:
            return False, f"缺少必要的审计字段: {', '.join(missing_fields)}"
        
        # 检查时间戳格式
        timestamp_fields = ['created_at', 'updated_at']
        for field in timestamp_fields:
            if field in record:
                timestamp = record[field]
                if not self._is_valid_iso_timestamp(timestamp):
                    return False, f"时间戳格式不正确: {field} = {timestamp}"
        
        return True, "审计轨迹完整性检查通过"
    
    def _is_valid_iso_timestamp(self, timestamp: Any) -> bool:
        """验证ISO时间戳格式"""
        if not isinstance(timestamp, str):
            return False
        
        try:
            datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return True
        except ValueError:
            return False
    
    def _check_access_controls(self, record: Dict[str, Any]) -> Tuple[bool, str]:
        """检查访问控制"""
        # 检查是否包含访问控制相关信息
        if 'owner' not in record and 'support_group' not in record:
            return False, "缺少所有者或支持组信息"
        
        # 检查权限字段
        if 'permissions' in record:
            permissions = record['permissions']
            if isinstance(permissions, dict):
                # 简单检查权限配置
                if not permissions:
                    return False, "权限配置为空"
        
        return True, "访问控制检查通过"
    
    def generate_compliance_report(self) -> Dict[str, Any]:
        """生成合规报告"""
        if not self.compliance_results:
            return {'status': 'fully_compliant', 'total_checks': 0, 'violations': 0}
        
        # 统计合规检查结果
        total_violations = len(self.compliance_results)
        category_counts = {}
        severity_counts = {}
        
        for result in self.compliance_results:
            # 按类别统计
            category = result['category']
            category_counts[category] = category_counts.get(category, 0) + 1
            
            # 按严重程度统计
            severity = result['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            'status': 'compliance_violations_found',
            'total_violations': total_violations,
            'category_distribution': category_counts,
            'severity_distribution': severity_counts,
            'generated_at': datetime.now().isoformat()
        }
    
    def generate_remediation_plan(self) -> List[Dict[str, Any]]:
        """生成整改计划"""
        remediation_plan = []
        
        for result in self.compliance_results:
            remediation_item = {
                'record_id': result['record_id'],
                'category': result['category'],
                'issue': result['description'],
                'severity': result['severity'],
                'details': result['details'],
                'recommended_action': self._get_recommended_action(result),
                'priority': self._calculate_priority(result['severity']),
                'estimated_effort': self._estimate_effort(result['category'])
            }
            remediation_plan.append(remediation_item)
        
        # 按优先级排序
        remediation_plan.sort(key=lambda x: x['priority'], reverse=True)
        
        return remediation_plan
    
    def _get_recommended_action(self, violation: Dict[str, Any]) -> str:
        """获取推荐的整改措施"""
        category = violation['category']
        rule_name = violation['rule_name']
        
        action_map = {
            'data_privacy': '加密或删除敏感数据字段',
            'security': '更新配置以符合安全基线',
            'audit': '补充缺失的审计信息',
            'access_control': '完善访问控制配置'
        }
        
        return action_map.get(category, '根据具体问题采取相应措施')
    
    def _calculate_priority(self, severity: str) -> int:
        """计算优先级"""
        priority_map = {
            'critical': 4,
            'high': 3,
            'medium': 2,
            'low': 1
        }
        return priority_map.get(severity, 2)
    
    def _estimate_effort(self, category: str) -> str:
        """估算整改工作量"""
        effort_map = {
            'data_privacy': '高',
            'security': '中',
            'audit': '低',
            'access_control': '中'
        }
        return effort_map.get(category, '中')

# 综合数据处理管道
class DataProcessingPipeline:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.cleaner = DataCleaner(config.get('cleaning', {}))
        self.validator = DataValidator(config.get('validation', {}))
        self.compliance_checker = ComplianceChecker(config.get('compliance', {}))
        self.logger = logging.getLogger(__name__)
    
    def process_data(self, raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """处理数据管道"""
        self.logger.info("开始数据处理管道")
        
        # 1. 数据清洗
        self.logger.info("执行数据清洗")
        cleaned_data, cleaning_reports = self.cleaner.clean_data(raw_data)
        
        # 2. 数据验证
        self.logger.info("执行数据验证")
        validation_results = self.validator.validate_data(cleaned_data)
        
        # 3. 合规检查
        self.logger.info("执行合规检查")
        compliance_results = self.compliance_checker.check_compliance(cleaned_data)
        
        # 4. 生成综合报告
        processing_report = self._generate_processing_report(
            cleaning_reports, validation_results, compliance_results
        )
        
        return {
            'processed_data': cleaned_data,
            'processing_report': processing_report,
            'cleaning_reports': cleaning_reports,
            'validation_results': validation_results,
            'compliance_results': compliance_results
        }
    
    def _generate_processing_report(self, cleaning_reports: List[DataQualityReport],
                                  validation_results: List[Dict[str, Any]],
                                  compliance_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """生成处理报告"""
        return {
            'summary': {
                'total_records': 'unknown',  # 需要从数据中计算
                'cleaning_issues': len(cleaning_reports),
                'validation_errors': len(validation_results),
                'compliance_violations': len(compliance_results),
                'processing_status': 'completed',
                'processing_time': datetime.now().isoformat()
            },
            'cleaning_summary': self.cleaner.generate_summary_report(),
            'validation_summary': self.validator.generate_validation_report(),
            'compliance_summary': self.compliance_checker.generate_compliance_report()
        }
    
    def get_remediation_recommendations(self) -> List[Dict[str, Any]]:
        """获取整改建议"""
        return self.compliance_checker.generate_remediation_plan()

# 使用示例
if __name__ == "__main__":
    # 配置数据处理管道
    pipeline_config = {
        'cleaning': {
            'required_fields': ['hostname', 'ip_address'],
            'consistency_rules': {
                'cpu_cores': {'range': (1, 128)},
                'memory_gb': {'range': (1, 1024)}
            }
        },
        'validation': {
            'required_fields': ['hostname', 'ip_address', 'os_type'],
            'relationship_rules': {
                'memory_vs_cpu': {
                    'field1': 'memory_gb',
                    'field2': 'cpu_cores',
                    'relationship': 'greater_than',
                    'severity': 'medium'
                }
            }
        },
        'compliance': {
            # 合规规则配置
        }
    }
    
    # 创建处理管道
    pipeline = DataProcessingPipeline(pipeline_config)
    
    # 示例数据
    sample_data = [
        {
            'id': 'host-001',
            'hostname': 'web-server-01',
            'ip_address': '192.168.1.100',
            'os_type': 'Linux',
            'cpu_cores': 8,
            'memory_gb': 32,
            'created_at': '2023-01-01T10:00:00Z',
            'updated_at': '2023-01-01T10:00:00Z',
            'owner': 'web-team'
        },
        {
            'id': 'host-002',
            'hostname': 'db-server-01',
            'ip_address': '192.168.1.101',
            'os_type': 'Linux',
            'cpu_cores': 16,
            'memory_gb': 64,
            'password': 'secret123',  # 敏感数据
            'services': [{'name': 'telnet'}],  # 不安全服务
            'created_at': '2023-01-01T10:00:00Z'
        }
    ]
    
    # 处理数据
    processing_result = pipeline.process_data(sample_data)
    
    print("数据处理结果:")
    print(json.dumps(processing_result['processing_report'], indent=2, ensure_ascii=False))
    
    # 获取整改建议
    remediation_plan = pipeline.get_remediation_recommendations()
    print("\n整改建议:")
    for item in remediation_plan:
        print(f"- {item['issue']} (优先级: {item['priority']})")
```

## 最佳实践总结

### 1. 数据清洗最佳实践

1. **标准化处理**：建立统一的数据格式标准
2. **渐进式清洗**：分步骤进行数据清洗，避免一次性处理过多错误
3. **可追溯性**：记录清洗过程和结果，便于问题排查
4. **自动化机制**：建立自动化的数据清洗流程

### 2. 数据验证最佳实践

1. **多层次验证**：实施字段级、记录级和业务级验证
2. **实时验证**：在数据录入时进行实时验证
3. **规则管理**：建立可配置的验证规则管理机制
4. **错误处理**：完善的错误处理和反馈机制

### 3. 合规检查最佳实践

1. **持续监控**：建立持续的合规性监控机制
2. **定期审计**：定期进行合规性审计
3. **整改跟踪**：跟踪合规问题的整改进度
4. **报告生成**：自动生成合规性报告

## 总结

数据清洗、校验与合规检查是确保CMDB数据质量的关键环节。通过建立完善的数据处理管道，实施多层次的数据质量控制措施，可以显著提高CMDB数据的准确性、完整性和合规性。在实际应用中，需要根据组织的具体需求和业务特点，制定适合的数据质量策略，并持续优化和改进数据处理流程。