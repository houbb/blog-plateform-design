---
title: 附录B：常用故障诊断命令与工具
date: 2025-09-06
categories: [Schdedule]
tags: [schedule]
published: true
---

## 附录B：常用故障诊断命令与工具

在分布式调度平台的运维过程中，快速准确地诊断和解决问题是保障系统稳定运行的关键。本附录将介绍常用的故障诊断命令和工具，帮助运维人员快速定位和解决系统问题。

### 系统级诊断命令

#### CPU和内存诊断

**top命令：**
```bash
# 查看系统整体资源使用情况
top

# 查看特定用户的进程
top -u username

# 按CPU使用率排序
top -o %CPU
```

**htop命令：**
```bash
# 更友好的交互式进程查看器
htop
```

**vmstat命令：**
```bash
# 查看虚拟内存统计信息
vmstat 1 5

# 查看系统整体性能
vmstat -s
```

**iostat命令：**
```bash
# 查看IO统计信息
iostat -x 1 5

# 查看磁盘IO情况
iostat -d 1 5
```

**free命令：**
```bash
# 查看内存使用情况
free -h

# 持续监控内存使用
watch -n 1 free -h
```

#### 网络诊断

**netstat命令：**
```bash
# 查看网络连接状态
netstat -an

# 查看TCP连接状态
netstat -an | grep ESTABLISHED

# 查看监听端口
netstat -tuln
```

**ss命令：**
```bash
# 更现代的网络连接查看工具
ss -tuln

# 查看TCP连接
ss -t state established
```

**tcpdump命令：**
```bash
# 抓取网络包进行分析
tcpdump -i eth0 port 8080

# 抓取特定主机的包
tcpdump -i eth0 host 192.168.1.100
```

**ping命令：**
```bash
# 测试网络连通性
ping google.com

# 指定次数的ping
ping -c 4 google.com
```

**traceroute命令：**
```bash
# 跟踪网络路径
traceroute google.com
```

#### 磁盘和文件系统诊断

**df命令：**
```bash
# 查看磁盘空间使用情况
df -h

# 查看inode使用情况
df -i
```

**du命令：**
```bash
# 查看目录空间使用情况
du -sh /var/log

# 查找大文件
du -ah /var | sort -rh | head -20
```

**lsof命令：**
```bash
# 查看打开的文件
lsof /var/log/scheduler.log

# 查看进程打开的文件
lsof -p 12345
```

### 应用级诊断工具

#### Java应用诊断

**jps命令：**
```bash
# 查看Java进程
jps -l

# 查看Java进程详细信息
jps -v
```

**jstat命令：**
```bash
# 查看JVM垃圾收集统计
jstat -gc 12345

# 查看JVM类加载统计
jstat -class 12345
```

**jstack命令：**
```bash
# 生成线程dump
jstack 12345 > thread_dump.txt

# 检测死锁
jstack -l 12345
```

**jmap命令：**
```bash
# 生成堆dump
jmap -dump:format=b,file=heap_dump.hprof 12345

# 查看堆内存使用情况
jmap -heap 12345
```

**jinfo命令：**
```bash
# 查看JVM参数
jinfo -flags 12345

# 查看系统属性
jinfo -sysprops 12345
```

#### 日志分析工具

**tail命令：**
```bash
# 实时查看日志文件
tail -f /var/log/scheduler.log

# 查看最后100行日志
tail -n 100 /var/log/scheduler.log
```

**grep命令：**
```bash
# 在日志中搜索关键字
grep "ERROR" /var/log/scheduler.log

# 搜索多个关键字
grep -E "ERROR|WARN" /var/log/scheduler.log

# 显示匹配行的上下文
grep -C 5 "exception" /var/log/scheduler.log
```

**awk命令：**
```bash
# 提取日志中的特定字段
awk '{print $1, $4}' /var/log/scheduler.log

# 统计错误日志数量
grep "ERROR" /var/log/scheduler.log | wc -l
```

**sed命令：**
```bash
# 替换日志中的敏感信息
sed 's/password=.*/password=****/g' /var/log/scheduler.log
```

#### 性能分析工具

**perf命令：**
```bash
# 记录性能数据
perf record -g -p 12345

# 查看性能报告
perf report
```

**strace命令：**
```bash
# 跟踪系统调用
strace -p 12345

# 跟踪特定系统调用
strace -e trace=open,read,write -p 12345
```

**ltrace命令：**
```bash
# 跟踪库函数调用
ltrace -p 12345
```

### 容器化环境诊断

#### Docker诊断命令

**docker stats命令：**
```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器的统计信息
docker stats scheduler-master
```

**docker logs命令：**
```bash
# 查看容器日志
docker logs scheduler-worker

# 实时查看容器日志
docker logs -f scheduler-master
```

**docker exec命令：**
```bash
# 进入容器执行命令
docker exec -it scheduler-master bash

# 在容器中执行特定命令
docker exec scheduler-worker ps aux
```

**docker inspect命令：**
```bash
# 查看容器详细信息
docker inspect scheduler-master
```

#### Kubernetes诊断命令

**kubectl get命令：**
```bash
# 查看Pod状态
kubectl get pods -n scheduler

# 查看服务状态
kubectl get services -n scheduler

# 查看节点状态
kubectl get nodes
```

**kubectl describe命令：**
```bash
# 查看Pod详细信息
kubectl describe pod scheduler-master-7d5b8c9c4f-xyz12 -n scheduler

# 查看服务详细信息
kubectl describe service scheduler-service -n scheduler
```

**kubectl logs命令：**
```bash
# 查看Pod日志
kubectl logs scheduler-worker-6d4b7c8b5f-abc34 -n scheduler

# 实时查看Pod日志
kubectl logs -f scheduler-master-7d5b8c9c4f-xyz12 -n scheduler
```

**kubectl exec命令：**
```bash
# 在Pod中执行命令
kubectl exec -it scheduler-master-7d5b8c9c4f-xyz12 -n scheduler -- bash

# 查看Pod中的进程
kubectl exec scheduler-worker-6d4b7c8b5f-abc34 -n scheduler -- ps aux
```

### 监控和告警工具

#### Prometheus查询

**常用PromQL查询：**
```promql
# CPU使用率
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 内存使用率
(node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# 磁盘使用率
(node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_free_bytes{mountpoint="/"}) / node_filesystem_size_bytes{mountpoint="/"} * 100

# 网络流量
irate(node_network_receive_bytes_total[5m])
```

#### Grafana面板

**关键监控指标：**
1. **系统指标**：CPU、内存、磁盘、网络使用率
2. **应用指标**：请求率、错误率、响应时间
3. **业务指标**：任务成功率、执行延迟、吞吐量
4. **JVM指标**：堆内存使用、GC频率、线程数

### 故障排查流程

#### 常见故障类型

**性能问题排查：**
1. **确认问题现象**：响应慢、超时、卡顿等
2. **系统资源检查**：CPU、内存、磁盘、网络
3. **应用状态检查**：线程状态、GC情况、连接池
4. **日志分析**：错误日志、警告日志、性能日志
5. **依赖检查**：数据库、缓存、外部服务
6. **配置检查**：JVM参数、应用配置、环境变量

**可用性问题排查：**
1. **确认故障范围**：单点故障还是全局故障
2. **网络连通性**：ping、telnet、traceroute
3. **服务状态**：进程状态、端口监听、健康检查
4. **负载情况**：CPU、内存、连接数
5. **日志分析**：启动日志、错误日志、异常堆栈
6. **配置检查**：配置文件、环境变量、权限设置

**数据问题排查：**
1. **确认问题现象**：数据丢失、数据不一致、数据错误
2. **数据源检查**：输入数据、配置数据、依赖数据
3. **处理过程检查**：日志分析、中间状态、计算逻辑
4. **存储检查**：数据库状态、文件系统、缓存数据
5. **传输检查**：网络传输、消息队列、API调用
6. **恢复验证**：数据恢复、一致性校验、业务验证

#### 排查工具组合

**Linux系统排查：**
```bash
# 综合系统信息查看
uptime && free -h && df -h && iostat -x 1 1

# 网络连接检查
netstat -an | grep ESTABLISHED | wc -l

# 进程资源使用
ps aux --sort=-%cpu | head -10
```

**Java应用排查：**
```bash
# JVM基本信息
jps -v | grep scheduler

# 堆内存使用情况
jstat -gc $(jps | grep Scheduler | awk '{print $1}')

# 线程状态检查
jstack $(jps | grep Scheduler | awk '{print $1}') | grep -A 10 "BLOCKED\|WAITING"
```

**容器环境排查：**
```bash
# 容器资源使用
docker stats --no-stream

# 容器日志分析
docker logs scheduler-master --since 1h | grep ERROR

# 容器内进程检查
docker exec scheduler-worker ps aux --sort=-%cpu
```

### 最佳实践建议

#### 日常监控

1. **建立基线**：建立系统正常运行的性能基线
2. **设置告警**：为关键指标设置合理的告警阈值
3. **定期巡检**：定期检查系统状态和日志
4. **容量规划**：根据历史数据进行容量规划
5. **预案准备**：准备常见故障的处理预案

#### 故障处理

1. **快速响应**：建立快速响应机制
2. **信息收集**：全面收集故障相关信息
3. **影响评估**：评估故障对业务的影响
4. **优先处理**：优先处理影响大的问题
5. **根因分析**：深入分析问题根本原因
6. **经验总结**：总结故障处理经验

#### 工具使用

1. **工具熟悉**：熟练掌握常用诊断工具
2. **脚本化**：将常用诊断操作脚本化
3. **自动化**：建立自动化监控和告警
4. **文档化**：完善故障处理文档
5. **培训分享**：定期进行技术培训和经验分享

通过掌握这些常用的故障诊断命令和工具，运维人员可以更快速、准确地定位和解决分布式调度平台中的各种问题，保障系统的稳定运行。