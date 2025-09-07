---
title: "日志收集与分析: 统一日志平台建设"
date: 2025-08-30
categories: [CICD]
tags: [CICD]
published: true
---
在CI/CD平台的可观测性体系中，日志收集与分析是不可或缺的重要组成部分。日志作为系统运行过程中最详细的信息载体，能够为问题诊断、安全审计和性能优化提供关键线索。通过建设统一的日志平台，团队能够集中管理分散在各个组件中的日志数据，实现高效的日志查询、分析和可视化。本文将深入探讨日志平台架构设计、收集工具选型、处理流程优化以及分析实践方法。

## 日志平台架构设计

构建高效的日志平台需要合理的架构设计，确保能够处理大规模日志数据的收集、存储、检索和分析需求。

### 1. 分层架构模型

#### 数据收集层
负责从各种数据源收集日志数据：
- **Agent收集器**：部署在各节点上的轻量级日志收集代理
- **协议适配器**：支持多种日志传输协议（Syslog、HTTP、Kafka等）
- **缓冲队列**：应对突发日志流量，保证数据不丢失

#### 数据处理层
对收集的日志数据进行处理和转换：
- **数据清洗**：去除无效数据，标准化日志格式
- **字段提取**：从非结构化日志中提取关键字段
- ** enrichment**：添加上下文信息，如主机名、服务名等
- **路由分发**：根据日志类型和重要性进行分类处理

#### 数据存储层
提供高效的日志数据存储和检索能力：
- **热数据存储**：近期日志数据，支持快速查询
- **温数据存储**：中期日志数据，平衡成本和性能
- **冷数据存储**：历史日志数据，低成本大容量存储
- **索引优化**：建立合适的索引结构，提高查询效率

#### 数据展示层
提供友好的日志查询和分析界面：
- **搜索界面**：支持复杂查询条件的日志搜索
- **仪表板**：可视化展示关键日志指标
- **告警系统**：基于日志内容的实时告警
- **报表生成**：定期生成日志分析报告

### 2. ELK Stack架构实践

ELK Stack（Elasticsearch、Logstash、Kibana）是业界广泛使用的日志平台解决方案。

#### Elasticsearch集群设计
```yaml
# elasticsearch.yml - Elasticsearch配置
cluster.name: ci-cd-logging-cluster
node.name: es-node-1
network.host: 0.0.0.0
http.port: 9200
transport.tcp.port: 9300

# 集群发现配置
discovery.seed_hosts: ["es-node-1", "es-node-2", "es-node-3"]
cluster.initial_master_nodes: ["es-node-1", "es-node-2", "es-node-3"]

# 内存配置
bootstrap.memory_lock: true
ES_JAVA_OPTS: "-Xms4g -Xmx4g"

# 数据路径
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# 网络配置
http.cors.enabled: true
http.cors.allow-origin: "*"

# 安全配置
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

#### Logstash管道配置
```ruby
# logstash-pipeline.conf - Logstash管道配置
input {
  # 接收Fluentd转发的日志
  beats {
    port => 5044
  }
  
  # 接收Syslog
  syslog {
    port => 514
    type => "syslog"
  }
  
  # 接收HTTP日志
  http {
    port => 8080
    type => "http"
  }
}

filter {
  # 处理CI/CD平台日志
  if [fields][service] == "pipeline-engine" {
    grok {
      match => { "message" => "\[%{TIMESTAMP_ISO8601:timestamp}\] \[%{LOGLEVEL:level}\] %{DATA:component} - %{GREEDYDATA:message}" }
    }
    
    # 提取流水线ID和执行状态
    if [message] =~ /Pipeline (\w+-\w+) (started|completed|failed)/ {
      grok {
        match => { "message" => "Pipeline %{DATA:pipeline_id} %{WORD:status}" }
      }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
  
  # 处理执行器日志
  if [fields][service] == "executor" {
    grok {
      match => { "message" => "\[%{TIMESTAMP_ISO8601:timestamp}\] \[%{LOGLEVEL:level}\] Executor %{DATA:executor_id} - %{GREEDYDATA:message}" }
    }
    
    # 提取步骤信息
    if [message] =~ /Step (\w+) (started|completed|failed)/ {
      grok {
        match => { "message" => "Step %{DATA:step_name} %{WORD:step_status}" }
      }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
  
  # 通用字段处理
  mutate {
    add_field => { "received_at" => "%{@timestamp}" }
    convert => {
      "duration" => "integer"
      "size" => "integer"
    }
  }
}

output {
  # 输出到Elasticsearch
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "ci-cd-logs-%{+YYYY.MM.dd}"
    user => "logstash_internal"
    password => "logstash_password"
  }
  
  # 同时输出到文件（调试用）
  file {
    path => "/var/log/logstash/ci-cd-logs.log"
    codec => json_lines
  }
}
```

#### Kibana仪表板配置
```json
{
  "dashboard": {
    "id": "ci-cd-logs-dashboard",
    "title": "CI/CD Platform Logs Dashboard",
    "description": "CI/CD平台日志监控仪表板",
    "panels": [
      {
        "id": "pipeline-logs-panel",
        "type": "logs",
        "gridData": {
          "x": 0,
          "y": 0,
          "w": 24,
          "h": 12
        },
        "savedQueryRefName": "pipeline-logs-query"
      },
      {
        "id": "error-rate-panel",
        "type": "visualization",
        "gridData": {
          "x": 0,
          "y": 12,
          "w": 12,
          "h": 8
        },
        "savedVisualizationRefName": "error-rate-visualization"
      },
      {
        "id": "log-volume-panel",
        "type": "visualization",
        "gridData": {
          "x": 12,
          "y": 12,
          "w": 12,
          "h": 8
        },
        "savedVisualizationRefName": "log-volume-visualization"
      }
    ]
  },
  "queries": [
    {
      "id": "pipeline-logs-query",
      "attributes": {
        "title": "Pipeline Logs",
        "description": "流水线执行日志",
        "query": {
          "language": "kuery",
          "query": "fields.service: pipeline-engine"
        },
        "filters": []
      }
    }
  ],
  "visualizations": [
    {
      "id": "error-rate-visualization",
      "attributes": {
        "title": "Error Rate Over Time",
        "description": "错误率时间趋势",
        "visState": "{\"title\":\"Error Rate\",\"type\":\"line\",\"params\":{\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\"},\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{\"field\":\"_id\"}},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"schema\":\"segment\",\"params\":{\"field\":\"@timestamp\",\"interval\":\"auto\"}}]}",
        "uiStateJSON": "{}",
        "description": "",
        "version": 1,
        "kibanaSavedObjectMeta": {
          "searchSourceJSON": "{\"index\":\"ci-cd-logs-*\",\"filter\":[],\"query\":{\"query\":\"level: ERROR\",\"language\":\"kuery\"}}"
        }
      }
    }
  ]
}
```

## 日志收集工具选型与集成

### 1. Fluentd集成实践

Fluentd是一个开源的数据收集器，特别适合构建统一的日志收集管道。

#### Fluentd配置文件
```xml
<!-- fluentd.conf - Fluentd主配置文件 -->
<source>
  @type tail
  @id input_tail_ci_cd
  path /var/log/ci-cd/*.log
  pos_file /var/log/fluentd-ci-cd.pos
  tag ci-cd.*
  <parse>
    @type json
    time_key timestamp
    time_format %Y-%m-%dT%H:%M:%S.%NZ
  </parse>
  refresh_interval 5
</source>

<source>
  @type forward
  @id input_forward
  port 24224
  bind 0.0.0.0
</source>

<source>
  @type http
  @id input_http
  port 9880
  bind 0.0.0.0
  body_size_limit 32m
  keepalive_timeout 10s
</source>

<!-- 数据处理过滤器 -->
<filter ci-cd.pipeline.**>
  @type record_transformer
  <record>
    service pipeline-engine
    hostname "#{Socket.gethostname}"
    environment production
  </record>
  <record>
    pipeline_id ${record["pipeline"] || "unknown"}
    execution_id ${record["execution"] || "unknown"}
  </record>
</filter>

<filter ci-cd.executor.**>
  @type record_transformer
  <record>
    service executor
    hostname "#{Socket.gethostname}"
    environment production
  </record>
  <record>
    executor_id ${record["executor"] || "unknown"}
    job_id ${record["job"] || "unknown"}
  </record>
</filter>

<!-- 结构化日志处理 -->
<filter ci-cd.**>
  @type parser
  key_name log
  reserve_data true
  <parse>
    @type regexp
    expression /^(?<time>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(?<level>[A-Z]+)\] (?<component>[^:]+): (?<message>.*)$/
    time_format %Y-%m-%d %H:%M:%S
  </parse>
</filter>

<!-- 数据丰富 -->
<filter ci-cd.**>
  @type record_modifier
  <record>
    collected_at ${Time.now.utc.iso8601(6)}
    version 1.0
  </record>
</filter>

<!-- 敏感信息过滤 -->
<filter ci-cd.**>
  @type record_transformer
  enable_ruby
  <record>
    message ${record["message"].gsub(/(password|token|key)=['"]?[^'"\s]+['"]?/i, '\\1=***')}
  </record>
</filter>

<!-- 输出配置 -->
<match ci-cd.pipeline.**>
  @type copy
  <store>
    @type elasticsearch
    host elasticsearch
    port 9200
    logstash_format true
    logstash_prefix ci-cd-pipeline
    include_tag_key true
    tag_key @log_name
    flush_interval 10s
    <buffer>
      @type file
      path /var/log/fluentd-buffer-pipeline
      flush_mode interval
      flush_interval 10s
      retry_type exponential_backoff
      retry_forever true
      retry_max_interval 30
    </buffer>
  </store>
  <store>
    @type s3
    aws_key_id YOUR_AWS_KEY_ID
    aws_sec_key YOUR_AWS_SECRET_KEY
    s3_bucket ci-cd-logs-archive
    s3_region us-west-2
    path pipeline/%Y/%m/%d/
    time_slice_format %Y%m%d%H
    <buffer time>
      @type file
      path /var/log/fluentd-s3-buffer-pipeline
      timekey 3600
      timekey_wait 10m
      timekey_use_utc true
    </buffer>
  </store>
</match>

<match ci-cd.executor.**>
  @type copy
  <store>
    @type elasticsearch
    host elasticsearch
    port 9200
    logstash_format true
    logstash_prefix ci-cd-executor
    include_tag_key true
    tag_key @log_name
    flush_interval 5s
    <buffer>
      @type file
      path /var/log/fluentd-buffer-executor
      flush_mode interval
      flush_interval 5s
      retry_type exponential_backoff
      retry_forever true
      retry_max_interval 30
    </buffer>
  </store>
</match>

<match ci-cd.**>
  @type copy
  <store>
    @type elasticsearch
    host elasticsearch
    port 9200
    logstash_format true
    logstash_prefix ci-cd-all
    include_tag_key true
    tag_key @log_name
    flush_interval 15s
  </store>
  <store>
    @type stdout
  </store>
</match>
```

#### 自定义Fluentd插件
```ruby
# fluent-plugin-ci-cd-parser/lib/fluent/plugin/parser_ci_cd.rb
require 'fluent/plugin/parser'

module Fluent
  module Plugin
    class CICDLogParser < Parser
      Fluent::Plugin.register_parser('ci_cd', self)

      config_param :time_format, :string, default: "%Y-%m-%d %H:%M:%S"

      def configure(conf)
        super
      end

      def parse(text)
        # 解析CI/CD平台特定格式的日志
        if text =~ /\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(\w+)\] ([^:]+): (.*)/
          time_str, level, component, message = $1, $2, $3, $4
          
          # 解析时间戳
          time = Time.strptime(time_str, @time_format).to_i
          
          # 提取额外字段
          record = {
            'timestamp' => time_str,
            'level' => level,
            'component' => component,
            'message' => message,
            'pipeline_id' => extract_pipeline_id(message),
            'execution_time' => extract_execution_time(message)
          }
          
          yield time, record
        else
          # 无法解析的格式，作为原始消息处理
          yield nil, {'message' => text}
        end
      end

      private

      def extract_pipeline_id(message)
        # 从消息中提取流水线ID
        message[/Pipeline (\w+-\w+)/, 1] || 'unknown'
      end

      def extract_execution_time(message)
        # 从消息中提取执行时间
        message[/duration: (\d+)ms/, 1]&.to_i || 0
      end
    end
  end
end
```

### 2. Filebeat集成实践

Filebeat是Elastic官方提供的轻量级日志收集器，特别适合资源受限的环境。

#### Filebeat配置文件
```yaml
# filebeat.yml - Filebeat配置文件
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/ci-cd/pipeline-engine/*.log
    - /var/log/ci-cd/artifact-repo/*.log
    - /var/log/ci-cd/executor/*.log
  fields:
    service: ci-cd-platform
    environment: production
  fields_under_root: true
  multiline.pattern: '^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]'
  multiline.negate: true
  multiline.match: after

- type: log
  enabled: true
  paths:
    - /var/log/nginx/access.log
    - /var/log/nginx/error.log
  fields:
    service: web-ui
    environment: production
  fields_under_root: true

processors:
- add_host_metadata:
    when.not.contains.tags: forwarded
- add_cloud_metadata: ~
- add_docker_metadata: ~

# 日志处理管道
processors:
- decode_json_fields:
    fields: ["message"]
    process_array: false
    max_depth: 10
    target: ""
    overwrite_keys: true

- dissect:
    tokenizer: "[%{timestamp}] [%{level}] %{component}: %{message}"
    field: "message"
    target_prefix: "log"

- rename:
    fields:
      - from: "log.timestamp"
        to: "timestamp"
      - from: "log.level"
        to: "level"
      - from: "log.component"
        to: "component"
      - from: "log.message"
        to: "message"

# 敏感信息过滤
- drop_fields:
    fields: ["password", "token", "secret"]

# 添加环境信息
- add_fields:
    target: ''
    fields:
      collector: filebeat
      version: 1.0

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "ci-cd-logs-%{+yyyy.MM.dd}"
  username: "filebeat_internal"
  password: "filebeat_password"

# 备用输出到Logstash
# output.logstash:
#   hosts: ["logstash:5044"]

# 文件输出（调试用）
output.file:
  path: "/tmp/filebeat"
  filename: ci-cd-logs
  rotate_every_kb: 10000
  number_of_files: 5
```

## 日志处理与分析

### 1. 日志结构化处理

#### 日志格式标准化
```python
#!/usr/bin/env python3
"""
日志结构化处理工具
将非结构化日志转换为结构化JSON格式
"""

import json
import re
from datetime import datetime
from typing import Dict, Any, Optional
import logging

class LogProcessor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # 定义日志模式
        self.patterns = {
            'pipeline_engine': re.compile(
                r'\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] '
                r'\[(?P<level>\w+)\] '
                r'(?P<component>[^:]+): '
                r'Pipeline (?P<pipeline_id>[\w-]+) '
                r'(?P<action>\w+)'
                r'(?: in (?P<duration>\d+)ms)?'
            ),
            'executor': re.compile(
                r'\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] '
                r'\[(?P<level>\w+)\] '
                r'Executor (?P<executor_id>[\w-]+): '
                r'Step (?P<step_name>[\w-]+) '
                r'(?P<action>\w+)'
                r'(?: with result (?P<result>\w+))?'
            ),
            'artifact_repo': re.compile(
                r'\[(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] '
                r'\[(?P<level>\w+)\] '
                r'ArtifactRepo: '
                r'(?P<action>\w+) artifact (?P<artifact_id>[\w\-\.]+)'
                r'(?: from (?P<source>[\w\-\.]+))?'
            )
        }
    
    def process_log_line(self, log_line: str, source: str = "unknown") -> Optional[Dict[str, Any]]:
        """处理单行日志"""
        try:
            # 尝试匹配不同类型的日志模式
            for pattern_name, pattern in self.patterns.items():
                match = pattern.match(log_line.strip())
                if match:
                    record = match.groupdict()
                    return self._enrich_record(record, pattern_name, source)
            
            # 如果没有匹配的模式，返回基本结构
            return {
                'timestamp': datetime.utcnow().isoformat(),
                'level': 'INFO',
                'component': 'unknown',
                'message': log_line.strip(),
                'source': source,
                'processed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error processing log line: {e}")
            return None
    
    def _enrich_record(self, record: Dict[str, Any], pattern_type: str, source: str) -> Dict[str, Any]:
        """丰富日志记录"""
        # 添加基础字段
        enriched_record = {
            'timestamp': record.get('timestamp', datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')),
            'level': record.get('level', 'INFO'),
            'component': record.get('component', pattern_type),
            'source': source,
            'pattern_type': pattern_type,
            'processed_at': datetime.utcnow().isoformat()
        }
        
        # 添加提取的字段
        for key, value in record.items():
            if key not in ['timestamp', 'level', 'component'] and value is not None:
                enriched_record[key] = value
        
        # 添加计算字段
        if 'duration' in record and record['duration']:
            enriched_record['duration_ms'] = int(record['duration'])
        
        return enriched_record
    
    def process_log_file(self, file_path: str, source: str = "unknown") -> list:
        """处理整个日志文件"""
        processed_logs = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    if line.strip():
                        processed_log = self.process_log_line(line, source)
                        if processed_log:
                            processed_log['line_number'] = line_num
                            processed_logs.append(processed_log)
        except Exception as e:
            self.logger.error(f"Error processing log file {file_path}: {e}")
        
        return processed_logs

# 使用示例
if __name__ == "__main__":
    processor = LogProcessor()
    
    # 测试日志处理
    test_logs = [
        "[2025-08-01 10:30:45] [INFO] PipelineEngine: Pipeline web-app-deploy-123 started",
        "[2025-08-01 10:35:20] [INFO] PipelineEngine: Pipeline web-app-deploy-123 completed in 275000ms",
        "[2025-08-01 10:36:15] [ERROR] Executor executor-001: Step deploy-k8s failed with result error",
        "[2025-08-01 10:37:30] [INFO] ArtifactRepo: Uploaded artifact web-app-1.2.3.jar from build-step"
    ]
    
    for log in test_logs:
        processed = processor.process_log_line(log, "test-service")
        if processed:
            print(json.dumps(processed, indent=2, ensure_ascii=False))
```

### 2. 日志分析与可视化

#### 日志分析脚本
```python
#!/usr/bin/env python3
"""
日志分析工具
对收集的日志数据进行统计分析
"""

import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import matplotlib.pyplot as plt
import seaborn as sns

class LogAnalyzer:
    def __init__(self, log_file: str):
        self.log_file = log_file
        self.logs_df = self._load_logs()
    
    def _load_logs(self) -> pd.DataFrame:
        """加载日志数据"""
        logs = []
        try:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        try:
                            log_entry = json.loads(line)
                            logs.append(log_entry)
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            print(f"Error loading logs: {e}")
            return pd.DataFrame()
        
        df = pd.DataFrame(logs)
        if not df.empty and 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        return df
    
    def analyze_error_patterns(self) -> Dict:
        """分析错误模式"""
        if self.logs_df.empty:
            return {}
        
        error_logs = self.logs_df[self.logs_df['level'].isin(['ERROR', 'CRITICAL'])]
        
        analysis = {
            'total_errors': len(error_logs),
            'error_rate': len(error_logs) / len(self.logs_df) * 100,
            'errors_by_component': error_logs['component'].value_counts().to_dict() if 'component' in error_logs.columns else {},
            'errors_by_hour': error_logs.groupby(error_logs['timestamp'].dt.hour).size().to_dict() if 'timestamp' in error_logs.columns else {},
            'common_error_messages': error_logs['message'].value_counts().head(10).to_dict() if 'message' in error_logs.columns else {}
        }
        
        return analysis
    
    def analyze_pipeline_performance(self) -> Dict:
        """分析流水线性能"""
        if self.logs_df.empty:
            return {}
        
        # 提取流水线相关日志
        pipeline_logs = self.logs_df[
            (self.logs_df['pattern_type'] == 'pipeline_engine') &
            (self.logs_df['action'].isin(['started', 'completed']))
        ]
        
        if pipeline_logs.empty:
            return {}
        
        # 计算执行时间
        performance_data = []
        for pipeline_id in pipeline_logs['pipeline_id'].unique():
            pipeline_events = pipeline_logs[pipeline_logs['pipeline_id'] == pipeline_id]
            if len(pipeline_events) >= 2:
                start_time = pipeline_events[pipeline_events['action'] == 'started']['timestamp'].min()
                end_time = pipeline_events[pipeline_events['action'] == 'completed']['timestamp'].max()
                duration = (end_time - start_time).total_seconds()
                
                performance_data.append({
                    'pipeline_id': pipeline_id,
                    'duration_seconds': duration,
                    'start_time': start_time,
                    'end_time': end_time
                })
        
        if not performance_data:
            return {}
        
        performance_df = pd.DataFrame(performance_data)
        
        return {
            'total_pipelines': len(performance_data),
            'avg_duration_seconds': performance_df['duration_seconds'].mean(),
            'median_duration_seconds': performance_df['duration_seconds'].median(),
            'p95_duration_seconds': performance_df['duration_seconds'].quantile(0.95),
            'longest_pipeline': performance_df.loc[performance_df['duration_seconds'].idxmax()].to_dict(),
            'shortest_pipeline': performance_df.loc[performance_df['duration_seconds'].idxmin()].to_dict()
        }
    
    def generate_report(self) -> Dict:
        """生成分析报告"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_logs': len(self.logs_df),
            'log_volume_by_hour': self._analyze_log_volume(),
            'error_analysis': self.analyze_error_patterns(),
            'pipeline_performance': self.analyze_pipeline_performance(),
            'top_components': self.logs_df['component'].value_counts().head(10).to_dict() if 'component' in self.logs_df.columns else {}
        }
        
        return report
    
    def _analyze_log_volume(self) -> Dict:
        """分析日志量趋势"""
        if self.logs_df.empty or 'timestamp' not in self.logs_df.columns:
            return {}
        
        hourly_volume = self.logs_df.groupby(self.logs_df['timestamp'].dt.hour).size()
        return hourly_volume.to_dict()

# 使用示例
if __name__ == "__main__":
    analyzer = LogAnalyzer("sample-logs.json")
    report = analyzer.generate_report()
    print(json.dumps(report, indent=2, ensure_ascii=False))
```

### 3. 实时日志监控

#### 实时告警系统
```python
#!/usr/bin/env python3
"""
实时日志监控与告警系统
监控日志流并触发告警
"""

import json
import time
import threading
from typing import Dict, List, Callable
from collections import deque
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class LogMonitor:
    def __init__(self, log_file: str, check_interval: int = 5):
        self.log_file = log_file
        self.check_interval = check_interval
        self.alert_rules = []
        self.alert_callbacks = []
        self.log_buffer = deque(maxlen=1000)  # 保留最近1000条日志
        self.last_position = 0
        self.running = False
    
    def add_alert_rule(self, rule: Dict):
        """添加告警规则"""
        self.alert_rules.append(rule)
    
    def add_alert_callback(self, callback: Callable):
        """添加告警回调函数"""
        self.alert_callbacks.append(callback)
    
    def start_monitoring(self):
        """开始监控"""
        self.running = True
        monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        monitor_thread.start()
        print("Log monitoring started")
    
    def stop_monitoring(self):
        """停止监控"""
        self.running = False
        print("Log monitoring stopped")
    
    def _monitor_loop(self):
        """监控循环"""
        while self.running:
            try:
                self._check_new_logs()
                self._evaluate_alert_rules()
                time.sleep(self.check_interval)
            except Exception as e:
                print(f"Error in monitoring loop: {e}")
                time.sleep(self.check_interval)
    
    def _check_new_logs(self):
        """检查新日志"""
        try:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                f.seek(self.last_position)
                new_lines = f.readlines()
                self.last_position = f.tell()
                
                for line in new_lines:
                    if line.strip():
                        try:
                            log_entry = json.loads(line)
                            self.log_buffer.append(log_entry)
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            print(f"Error reading log file: {e}")
    
    def _evaluate_alert_rules(self):
        """评估告警规则"""
        current_time = time.time()
        
        for rule in self.alert_rules:
            # 检查时间窗口
            window_start = current_time - rule.get('window_seconds', 300)
            recent_logs = [log for log in self.log_buffer 
                          if 'timestamp' in log and 
                          time.mktime(time.strptime(log['timestamp'], '%Y-%m-%d %H:%M:%S')) > window_start]
            
            # 应用过滤条件
            filtered_logs = recent_logs
            if 'filter' in rule:
                filtered_logs = self._apply_filter(filtered_logs, rule['filter'])
            
            # 检查阈值
            if len(filtered_logs) >= rule.get('threshold', 1):
                alert = {
                    'rule_name': rule.get('name', 'unnamed_rule'),
                    'matched_logs': filtered_logs[-rule.get('threshold', 1):],
                    'count': len(filtered_logs),
                    'timestamp': time.time()
                }
                
                self._trigger_alert(alert)
    
    def _apply_filter(self, logs: List[Dict], filter_condition: Dict) -> List[Dict]:
        """应用过滤条件"""
        filtered = []
        for log in logs:
            match = True
            for key, value in filter_condition.items():
                if key not in log or log[key] != value:
                    match = False
                    break
            if match:
                filtered.append(log)
        return filtered
    
    def _trigger_alert(self, alert: Dict):
        """触发告警"""
        print(f"ALERT: {alert['rule_name']} - {alert['count']} matching logs")
        
        # 调用回调函数
        for callback in self.alert_callbacks:
            try:
                callback(alert)
            except Exception as e:
                print(f"Error in alert callback: {e}")

# 告警回调函数示例
def email_alert_callback(alert: Dict):
    """邮件告警回调"""
    # 邮件配置
    smtp_server = "smtp.example.com"
    smtp_port = 587
    sender_email = "alerts@example.com"
    sender_password = "your_password"
    receiver_email = "admin@example.com"
    
    # 创建邮件内容
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = f"CI/CD Alert: {alert['rule_name']}"
    
    body = f"""
    告警名称: {alert['rule_name']}
    匹配日志数量: {alert['count']}
    时间: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(alert['timestamp']))}
    
    最近的匹配日志:
    """
    
    for log in alert['matched_logs'][-5:]:  # 只显示最近5条
        body += f"\n{json.dumps(log, indent=2, ensure_ascii=False)}"
    
    message.attach(MIMEText(body, "plain", "utf-8"))
    
    # 发送邮件
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        print("Alert email sent successfully")
    except Exception as e:
        print(f"Error sending alert email: {e}")

# 使用示例
if __name__ == "__main__":
    monitor = LogMonitor("ci-cd-logs.json", check_interval=10)
    
    # 添加告警规则
    monitor.add_alert_rule({
        'name': 'High Error Rate',
        'filter': {'level': 'ERROR'},
        'threshold': 5,
        'window_seconds': 300  # 5分钟窗口
    })
    
    monitor.add_alert_rule({
        'name': 'Pipeline Failure',
        'filter': {'component': 'pipeline-engine', 'action': 'failed'},
        'threshold': 1,
        'window_seconds': 60  # 1分钟窗口
    })
    
    # 添加告警回调
    monitor.add_alert_callback(email_alert_callback)
    
    # 开始监控
    monitor.start_monitoring()
    
    # 保持程序运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        monitor.stop_monitoring()
```

通过建设统一的日志平台并实施有效的收集、处理和分析机制，CI/CD平台能够实现全面的日志可观测性，为问题诊断、性能优化和安全审计提供强有力的支持。关键是要根据平台规模和需求选择合适的工具和技术栈，设计合理的架构，并建立持续的监控和改进机制。只有这样，才能真正发挥日志数据的价值，提升平台的稳定性和可靠性。