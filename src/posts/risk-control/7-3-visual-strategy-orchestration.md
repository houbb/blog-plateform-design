---
title: "可视化策略编排: 拖拽式配置复杂规则组合（IF-THEN-ELSE）"
date: 2025-09-06
categories: [RiskControl]
tags: [RiskControl]
published: true
---
# 可视化策略编排：拖拽式配置复杂规则组合（IF-THEN-ELSE）

## 引言

在企业级智能风控平台中，决策引擎作为风控系统的"大脑"，承担着实时分析风险、做出决策的关键职责。随着业务复杂度的不断提升，风控策略也变得越来越复杂，传统的代码编写方式已经难以满足快速迭代和灵活配置的需求。可视化策略编排技术应运而生，通过拖拽式界面和图形化配置，让业务人员和策略专家能够直观地设计、组合和管理复杂的风控规则。

本文将深入探讨可视化策略编排技术的核心原理和实现方法，详细介绍如何通过拖拽式配置构建复杂的IF-THEN-ELSE规则组合，为风控平台提供更加灵活、高效的策略管理能力。

## 一、可视化策略编排概述

### 1.1 策略编排的必要性

在现代风控场景中，单一规则往往难以应对复杂的业务需求，需要将多个规则进行组合形成策略。策略编排技术能够将分散的规则有机地组合起来，形成完整的风控决策流程。

#### 1.1.1 业务复杂性驱动

**多层次决策需求**：
1. **基础规则层**：简单的条件判断规则
2. **组合策略层**：多个规则的逻辑组合
3. **决策流层**：复杂的业务流程编排
4. **场景化策略层**：针对特定业务场景的策略组合

**动态调整需求**：
- 业务规则频繁变化
- 风险模式持续演进
- 策略效果实时监控
- 快速迭代优化需求

#### 1.1.2 技术发展趋势

**低代码/无代码平台**：
- 降低技术门槛
- 提高业务参与度
- 加速策略迭代
- 减少开发成本

**可视化交互**：
- 直观的图形界面
- 拖拽式操作体验
- 实时预览效果
- 协作式开发

### 1.2 可视化策略编排架构

#### 1.2.1 技术架构设计

```
+-------------------+
|   策略设计器      |
| (可视化界面)      |
+-------------------+
         |
         v
+-------------------+
|   策略编排引擎    |
| (规则组合逻辑)    |
+-------------------+
         |
         v
+-------------------+
|   规则执行引擎    |
| (Rete算法)        |
+-------------------+
         |
         v
+-------------------+
|   决策结果        |
| (拦截/放行等)     |
+-------------------+
```

#### 1.2.2 核心组件

**策略设计器**：
- 图形化界面组件
- 拖拽操作支持
- 实时预览功能
- 版本管理机制

**策略编排引擎**：
- 规则组合逻辑
- 流程控制机制
- 条件分支处理
- 异常处理机制

**规则执行引擎**：
- 高性能规则匹配
- 实时决策能力
- 结果聚合处理
- 执行状态监控

## 二、拖拽式配置实现

### 2.1 前端界面设计

#### 2.1.1 组件库设计

**基础规则组件**：
```javascript
// 规则组件定义
class RuleComponent {
    constructor(config) {
        this.id = config.id;
        this.type = config.type;
        this.name = config.name;
        this.description = config.description;
        this.parameters = config.parameters || {};
        this.conditions = config.conditions || [];
        this.actions = config.actions || [];
    }
    
    // 渲染组件
    render() {
        const container = document.createElement('div');
        container.className = 'rule-component';
        container.dataset.id = this.id;
        container.dataset.type = this.type;
        
        container.innerHTML = `
            <div class="component-header">
                <span class="component-name">${this.name}</span>
                <span class="component-type">${this.type}</span>
            </div>
            <div class="component-body">
                <div class="component-description">${this.description}</div>
                ${this.renderParameters()}
            </div>
            <div class="component-footer">
                <button class="edit-btn">编辑</button>
                <button class="delete-btn">删除</button>
            </div>
        `;
        
        return container;
    }
    
    // 渲染参数配置
    renderParameters() {
        let paramHtml = '<div class="component-parameters">';
        for (const [key, param] of Object.entries(this.parameters)) {
            paramHtml += `
                <div class="parameter-item">
                    <label>${param.label}:</label>
                    <input type="${param.type}" value="${param.defaultValue}" 
                           data-param="${key}" />
                </div>
            `;
        }
        paramHtml += '</div>';
        return paramHtml;
    }
}

// 条件组件
class ConditionComponent extends RuleComponent {
    constructor(config) {
        super({
            ...config,
            type: 'condition'
        });
    }
    
    render() {
        const container = super.render();
        container.classList.add('condition-component');
        return container;
    }
}

// 动作组件
class ActionComponent extends RuleComponent {
    constructor(config) {
        super({
            ...config,
            type: 'action'
        });
    }
    
    render() {
        const container = super.render();
        container.classList.add('action-component');
        return container;
    }
}
```

#### 2.1.2 画布设计

**拖拽画布实现**：
```javascript
// 策略画布类
class StrategyCanvas {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.components = new Map();
        this.connections = [];
        this.selectedComponent = null;
        
        this.initCanvas();
        this.bindEvents();
    }
    
    // 初始化画布
    initCanvas() {
        this.container.innerHTML = `
            <div class="canvas-toolbar">
                <button id="save-strategy">保存策略</button>
                <button id="execute-strategy">执行策略</button>
                <button id="clear-canvas">清空画布</button>
            </div>
            <div class="canvas-content" id="strategy-canvas">
                <!-- 组件将被添加到这里 -->
            </div>
            <div class="component-palette">
                <h3>组件库</h3>
                <div class="palette-section">
                    <h4>条件组件</h4>
                    <div class="component-item" data-type="condition" data-name="用户年龄">
                        用户年龄条件
                    </div>
                    <div class="component-item" data-type="condition" data-name="交易金额">
                        交易金额条件
                    </div>
                    <div class="component-item" data-type="condition" data-name="设备风险">
                        设备风险条件
                    </div>
                </div>
                <div class="palette-section">
                    <h4>动作组件</h4>
                    <div class="component-item" data-type="action" data-name="放行">
                        放行动作
                    </div>
                    <div class="component-item" data-type="action" data-name="拦截">
                        拦截动作
                    </div>
                    <div class="component-item" data-type="action" data-name="验证码">
                        发送验证码
                    </div>
                </div>
            </div>
        `;
    }
    
    // 绑定事件
    bindEvents() {
        // 组件拖拽事件
        const componentItems = this.container.querySelectorAll('.component-item');
        componentItems.forEach(item => {
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
        });
        
        // 画布拖拽事件
        const canvas = this.container.querySelector('#strategy-canvas');
        canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        canvas.addEventListener('drop', this.handleDrop.bind(this));
        
        // 工具栏事件
        this.container.querySelector('#save-strategy').addEventListener('click', this.saveStrategy.bind(this));
        this.container.querySelector('#execute-strategy').addEventListener('click', this.executeStrategy.bind(this));
        this.container.querySelector('#clear-canvas').addEventListener('click', this.clearCanvas.bind(this));
    }
    
    // 拖拽开始
    handleDragStart(e) {
        e.dataTransfer.setData('component-type', e.target.dataset.type);
        e.dataTransfer.setData('component-name', e.target.dataset.name);
    }
    
    // 拖拽经过
    handleDragOver(e) {
        e.preventDefault();
    }
    
    // 拖拽放置
    handleDrop(e) {
        e.preventDefault();
        const componentType = e.dataTransfer.getData('component-type');
        const componentName = e.dataTransfer.getData('component-name');
        
        this.createComponent(componentType, componentName, {
            x: e.clientX,
            y: e.clientY
        });
    }
    
    // 创建组件
    createComponent(type, name, position) {
        const componentId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let component;
        
        if (type === 'condition') {
            component = new ConditionComponent({
                id: componentId,
                name: name,
                description: `${name}条件判断`,
                parameters: this.getDefaultParameters(type, name)
            });
        } else if (type === 'action') {
            component = new ActionComponent({
                id: componentId,
                name: name,
                description: `${name}执行动作`,
                parameters: this.getDefaultParameters(type, name)
            });
        }
        
        if (component) {
            const componentElement = component.render();
            componentElement.style.position = 'absolute';
            componentElement.style.left = `${position.x}px`;
            componentElement.style.top = `${position.y}px`;
            
            this.container.querySelector('#strategy-canvas').appendChild(componentElement);
            this.components.set(componentId, component);
            
            // 绑定组件事件
            this.bindComponentEvents(componentElement, componentId);
        }
    }
    
    // 获取默认参数
    getDefaultParameters(type, name) {
        const paramConfig = {
            '用户年龄': {
                '最小年龄': { label: '最小年龄', type: 'number', defaultValue: 18 },
                '最大年龄': { label: '最大年龄', type: 'number', defaultValue: 65 }
            },
            '交易金额': {
                '最小金额': { label: '最小金额', type: 'number', defaultValue: 0 },
                '最大金额': { label: '最大金额', type: 'number', defaultValue: 10000 }
            },
            '设备风险': {
                '风险阈值': { label: '风险阈值', type: 'number', defaultValue: 0.5 }
            },
            '放行': {},
            '拦截': {
                '拦截原因': { label: '拦截原因', type: 'text', defaultValue: '风险检测' }
            },
            '验证码': {
                '验证码类型': { label: '验证码类型', type: 'select', defaultValue: '短信' }
            }
        };
        
        return paramConfig[name] || {};
    }
    
    // 绑定组件事件
    bindComponentEvents(element, componentId) {
        // 组件选择
        element.addEventListener('click', (e) => {
            this.selectComponent(componentId);
        });
        
        // 组件拖拽移动
        let isDragging = false;
        let offsetX, offsetY;
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            element.style.zIndex = '1000';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                element.style.left = (e.clientX - offsetX) + 'px';
                element.style.top = (e.clientY - offsetY) + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.style.zIndex = '1';
        });
        
        // 编辑按钮事件
        const editBtn = element.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editComponent(componentId);
            });
        }
        
        // 删除按钮事件
        const deleteBtn = element.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteComponent(componentId);
            });
        }
    }
    
    // 选择组件
    selectComponent(componentId) {
        // 清除之前的选择
        const previousSelected = this.container.querySelector('.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // 选择新组件
        const componentElement = this.container.querySelector(`[data-id="${componentId}"]`);
        if (componentElement) {
            componentElement.classList.add('selected');
            this.selectedComponent = componentId;
        }
    }
    
    // 编辑组件
    editComponent(componentId) {
        const component = this.components.get(componentId);
        if (component) {
            // 显示参数编辑对话框
            this.showParameterEditor(component);
        }
    }
    
    // 显示参数编辑器
    showParameterEditor(component) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>编辑 ${component.name} 参数</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${this.renderParameterForm(component)}
                </div>
                <div class="modal-footer">
                    <button id="save-params">保存</button>
                    <button id="cancel-params">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        const closeBtn = modal.querySelector('.close');
        const saveBtn = modal.querySelector('#save-params');
        const cancelBtn = modal.querySelector('#cancel-params');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        saveBtn.addEventListener('click', () => {
            this.saveComponentParameters(component, modal);
            document.body.removeChild(modal);
        });
    }
    
    // 渲染参数表单
    renderParameterForm(component) {
        let formHtml = '<form id="parameter-form">';
        for (const [key, param] of Object.entries(component.parameters)) {
            formHtml += `
                <div class="form-group">
                    <label>${param.label}:</label>
                    <input type="${param.type}" name="${key}" value="${param.defaultValue}" />
                </div>
            `;
        }
        formHtml += '</form>';
        return formHtml;
    }
    
    // 保存组件参数
    saveComponentParameters(component, modal) {
        const form = modal.querySelector('#parameter-form');
        const formData = new FormData(form);
        
        for (const [key, value] of formData.entries()) {
            if (component.parameters[key]) {
                component.parameters[key].defaultValue = value;
            }
        }
        
        // 更新组件显示
        const componentElement = this.container.querySelector(`[data-id="${component.id}"]`);
        if (componentElement) {
            const paramElements = componentElement.querySelectorAll('[data-param]');
            paramElements.forEach(element => {
                const paramName = element.dataset.param;
                if (component.parameters[paramName]) {
                    element.value = component.parameters[paramName].defaultValue;
                }
            });
        }
    }
    
    // 删除组件
    deleteComponent(componentId) {
        const componentElement = this.container.querySelector(`[data-id="${componentId}"]`);
        if (componentElement) {
            componentElement.remove();
            this.components.delete(componentId);
        }
        
        if (this.selectedComponent === componentId) {
            this.selectedComponent = null;
        }
    }
    
    // 保存策略
    saveStrategy() {
        const strategy = {
            id: `strategy_${Date.now()}`,
            name: '新策略',
            components: Array.from(this.components.values()),
            connections: this.connections,
            createdAt: new Date().toISOString()
        };
        
        // 发送到后端保存
        fetch('/api/strategies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(strategy)
        })
        .then(response => response.json())
        .then(data => {
            alert('策略保存成功！');
        })
        .catch(error => {
            console.error('保存策略失败:', error);
            alert('策略保存失败！');
        });
    }
    
    // 执行策略
    executeStrategy() {
        // 这里应该调用后端API执行策略
        alert('策略执行功能待实现');
    }
    
    // 清空画布
    clearCanvas() {
        if (confirm('确定要清空画布吗？')) {
            const canvas = this.container.querySelector('#strategy-canvas');
            canvas.innerHTML = '';
            this.components.clear();
            this.connections = [];
            this.selectedComponent = null;
        }
    }
}

// 初始化策略画布
document.addEventListener('DOMContentLoaded', function() {
    const canvas = new StrategyCanvas('strategy-designer');
});
```

### 2.2 后端服务实现

#### 2.2.1 策略模型定义

**策略数据模型**：
```python
# 策略模型定义
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

@dataclass
class ComponentParameter:
    """组件参数"""
    name: str
    label: str
    type: str
    default_value: Any
    required: bool = True

@dataclass
class Component:
    """组件定义"""
    id: str
    type: str  # condition, action, decision
    name: str
    description: str
    parameters: List[ComponentParameter]
    position: Dict[str, int]  # x, y坐标
    created_at: datetime

@dataclass
class Connection:
    """连接关系"""
    id: str
    source_component_id: str
    target_component_id: str
    source_port: str  # 输出端口
    target_port: str  # 输入端口
    condition: Optional[str] = None  # 连接条件

@dataclass
class Strategy:
    """策略定义"""
    id: str
    name: str
    description: str
    components: List[Component]
    connections: List[Connection]
    version: int = 1
    created_at: datetime
    updated_at: datetime
    created_by: str
    status: str = "draft"  # draft, active, inactive

class StrategyService:
    """策略服务"""
    
    def __init__(self, storage_backend):
        self.storage = storage_backend
    
    def create_strategy(self, strategy_data: Dict) -> Strategy:
        """创建策略"""
        # 解析组件数据
        components = []
        for comp_data in strategy_data.get('components', []):
            parameters = [
                ComponentParameter(**param) 
                for param in comp_data.get('parameters', [])
            ]
            
            component = Component(
                id=comp_data['id'],
                type=comp_data['type'],
                name=comp_data['name'],
                description=comp_data['description'],
                parameters=parameters,
                position=comp_data.get('position', {'x': 0, 'y': 0}),
                created_at=datetime.now()
            )
            components.append(component)
        
        # 解析连接数据
        connections = []
        for conn_data in strategy_data.get('connections', []):
            connection = Connection(
                id=conn_data['id'],
                source_component_id=conn_data['source_component_id'],
                target_component_id=conn_data['target_component_id'],
                source_port=conn_data['source_port'],
                target_port=conn_data['target_port'],
                condition=conn_data.get('condition')
            )
            connections.append(connection)
        
        # 创建策略对象
        strategy = Strategy(
            id=strategy_data['id'],
            name=strategy_data.get('name', '未命名策略'),
            description=strategy_data.get('description', ''),
            components=components,
            connections=connections,
            version=1,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            created_by=strategy_data.get('created_by', 'system')
        )
        
        # 保存策略
        self.storage.save_strategy(strategy)
        return strategy
    
    def get_strategy(self, strategy_id: str) -> Optional[Strategy]:
        """获取策略"""
        return self.storage.get_strategy(strategy_id)
    
    def update_strategy(self, strategy_id: str, update_data: Dict) -> Strategy:
        """更新策略"""
        strategy = self.get_strategy(strategy_id)
        if not strategy:
            raise ValueError(f"策略 {strategy_id} 不存在")
        
        # 更新策略属性
        if 'name' in update_data:
            strategy.name = update_data['name']
        if 'description' in update_data:
            strategy.description = update_data['description']
        if 'components' in update_data:
            # 更新组件
            strategy.components = self._parse_components(update_data['components'])
        if 'connections' in update_data:
            # 更新连接
            strategy.connections = self._parse_connections(update_data['connections'])
        
        strategy.version += 1
        strategy.updated_at = datetime.now()
        
        # 保存更新
        self.storage.update_strategy(strategy)
        return strategy
    
    def delete_strategy(self, strategy_id: str) -> bool:
        """删除策略"""
        return self.storage.delete_strategy(strategy_id)
    
    def list_strategies(self, status: Optional[str] = None) -> List[Strategy]:
        """列出策略"""
        return self.storage.list_strategies(status)
    
    def _parse_components(self, components_data: List[Dict]) -> List[Component]:
        """解析组件数据"""
        components = []
        for comp_data in components_data:
            parameters = [
                ComponentParameter(**param) 
                for param in comp_data.get('parameters', [])
            ]
            
            component = Component(
                id=comp_data['id'],
                type=comp_data['type'],
                name=comp_data['name'],
                description=comp_data['description'],
                parameters=parameters,
                position=comp_data.get('position', {'x': 0, 'y': 0}),
                created_at=datetime.now()
            )
            components.append(component)
        
        return components
    
    def _parse_connections(self, connections_data: List[Dict]) -> List[Connection]:
        """解析连接数据"""
        connections = []
        for conn_data in connections_data:
            connection = Connection(
                id=conn_data['id'],
                source_component_id=conn_data['source_component_id'],
                target_component_id=conn_data['target_component_id'],
                source_port=conn_data['source_port'],
                target_port=conn_data['target_port'],
                condition=conn_data.get('condition')
            )
            connections.append(connection)
        
        return connections

# 存储后端接口
class StrategyStorage:
    """策略存储接口"""
    
    def save_strategy(self, strategy: Strategy) -> bool:
        """保存策略"""
        raise NotImplementedError
    
    def get_strategy(self, strategy_id: str) -> Optional[Strategy]:
        """获取策略"""
        raise NotImplementedError
    
    def update_strategy(self, strategy: Strategy) -> bool:
        """更新策略"""
        raise NotImplementedError
    
    def delete_strategy(self, strategy_id: str) -> bool:
        """删除策略"""
        raise NotImplementedError
    
    def list_strategies(self, status: Optional[str] = None) -> List[Strategy]:
        """列出策略"""
        raise NotImplementedError

# Redis存储实现
import redis
import json

class RedisStrategyStorage(StrategyStorage):
    """基于Redis的策略存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost', 
            port=6379, 
            db=0,
            decode_responses=True
        )
    
    def save_strategy(self, strategy: Strategy) -> bool:
        """保存策略到Redis"""
        try:
            # 序列化策略对象
            strategy_dict = self._strategy_to_dict(strategy)
            
            # 保存策略数据
            strategy_key = f"strategy:{strategy.id}"
            self.redis.hset(strategy_key, mapping=strategy_dict)
            
            # 保存到策略列表
            self.redis.sadd("strategies", strategy.id)
            
            # 按状态索引
            status_key = f"strategies:{strategy.status}"
            self.redis.sadd(status_key, strategy.id)
            
            return True
        except Exception as e:
            print(f"保存策略失败: {e}")
            return False
    
    def get_strategy(self, strategy_id: str) -> Optional[Strategy]:
        """从Redis获取策略"""
        try:
            strategy_key = f"strategy:{strategy_id}"
            strategy_data = self.redis.hgetall(strategy_key)
            
            if not strategy_data:
                return None
            
            return self._dict_to_strategy(strategy_data)
        except Exception as e:
            print(f"获取策略失败: {e}")
            return None
    
    def update_strategy(self, strategy: Strategy) -> bool:
        """更新策略"""
        return self.save_strategy(strategy)
    
    def delete_strategy(self, strategy_id: str) -> bool:
        """删除策略"""
        try:
            strategy_key = f"strategy:{strategy_id}"
            strategy_data = self.redis.hgetall(strategy_key)
            
            if not strategy_data:
                return False
            
            # 删除策略数据
            self.redis.delete(strategy_key)
            
            # 从策略列表中移除
            self.redis.srem("strategies", strategy_id)
            
            # 从状态索引中移除
            if 'status' in strategy_data:
                status_key = f"strategies:{strategy_data['status']}"
                self.redis.srem(status_key, strategy_id)
            
            return True
        except Exception as e:
            print(f"删除策略失败: {e}")
            return False
    
    def list_strategies(self, status: Optional[str] = None) -> List[Strategy]:
        """列出策略"""
        try:
            if status:
                strategy_ids = self.redis.smembers(f"strategies:{status}")
            else:
                strategy_ids = self.redis.smembers("strategies")
            
            strategies = []
            for strategy_id in strategy_ids:
                strategy = self.get_strategy(strategy_id)
                if strategy:
                    strategies.append(strategy)
            
            return strategies
        except Exception as e:
            print(f"列出策略失败: {e}")
            return []
    
    def _strategy_to_dict(self, strategy: Strategy) -> Dict:
        """将策略对象转换为字典"""
        return {
            'id': strategy.id,
            'name': strategy.name,
            'description': strategy.description,
            'components': json.dumps([
                {
                    'id': comp.id,
                    'type': comp.type,
                    'name': comp.name,
                    'description': comp.description,
                    'parameters': [
                        {
                            'name': param.name,
                            'label': param.label,
                            'type': param.type,
                            'default_value': param.default_value,
                            'required': param.required
                        }
                        for param in comp.parameters
                    ],
                    'position': comp.position,
                    'created_at': comp.created_at.isoformat()
                }
                for comp in strategy.components
            ]),
            'connections': json.dumps([
                {
                    'id': conn.id,
                    'source_component_id': conn.source_component_id,
                    'target_component_id': conn.target_component_id,
                    'source_port': conn.source_port,
                    'target_port': conn.target_port,
                    'condition': conn.condition
                }
                for conn in strategy.connections
            ]),
            'version': strategy.version,
            'created_at': strategy.created_at.isoformat(),
            'updated_at': strategy.updated_at.isoformat(),
            'created_by': strategy.created_by,
            'status': strategy.status
        }
    
    def _dict_to_strategy(self, strategy_data: Dict) -> Strategy:
        """将字典转换为策略对象"""
        # 解析组件
        components_data = json.loads(strategy_data['components'])
        components = []
        for comp_data in components_data:
            parameters = [
                ComponentParameter(**param)
                for param in comp_data['parameters']
            ]
            
            component = Component(
                id=comp_data['id'],
                type=comp_data['type'],
                name=comp_data['name'],
                description=comp_data['description'],
                parameters=parameters,
                position=comp_data['position'],
                created_at=datetime.fromisoformat(comp_data['created_at'])
            )
            components.append(component)
        
        # 解析连接
        connections_data = json.loads(strategy_data['connections'])
        connections = [
            Connection(**conn_data)
            for conn_data in connections_data
        ]
        
        # 创建策略对象
        strategy = Strategy(
            id=strategy_data['id'],
            name=strategy_data['name'],
            description=strategy_data['description'],
            components=components,
            connections=connections,
            version=int(strategy_data['version']),
            created_at=datetime.fromisoformat(strategy_data['created_at']),
            updated_at=datetime.fromisoformat(strategy_data['updated_at']),
            created_by=strategy_data['created_by'],
            status=strategy_data['status']
        )
        
        return strategy
```

#### 2.2.2 策略执行引擎

**策略执行实现**：
```python
# 策略执行引擎
from typing import Dict, Any, List, Optional
import asyncio

class StrategyExecutionContext:
    """策略执行上下文"""
    
    def __init__(self, request_data: Dict[str, Any]):
        self.request_data = request_data
        self.variables = {}
        self.results = {}
        self.execution_path = []
        self.errors = []
    
    def set_variable(self, name: str, value: Any):
        """设置变量"""
        self.variables[name] = value
    
    def get_variable(self, name: str) -> Any:
        """获取变量"""
        return self.variables.get(name, self.request_data.get(name))
    
    def add_result(self, component_id: str, result: Any):
        """添加执行结果"""
        self.results[component_id] = result
        self.execution_path.append(component_id)
    
    def get_result(self, component_id: str) -> Any:
        """获取执行结果"""
        return self.results.get(component_id)
    
    def add_error(self, error: str):
        """添加错误信息"""
        self.errors.append(error)

class StrategyExecutor:
    """策略执行器"""
    
    def __init__(self, component_registry):
        self.component_registry = component_registry
    
    async def execute_strategy(self, strategy: Strategy, context: StrategyExecutionContext) -> Dict[str, Any]:
        """执行策略"""
        try:
            # 构建执行图
            execution_graph = self._build_execution_graph(strategy)
            
            # 拓扑排序
            sorted_components = self._topological_sort(execution_graph)
            
            # 依次执行组件
            for component_id in sorted_components:
                component = self._get_component_by_id(strategy, component_id)
                if component:
                    await self._execute_component(component, context)
            
            # 返回最终结果
            return {
                'success': True,
                'results': context.results,
                'execution_path': context.execution_path,
                'errors': context.errors
            }
        except Exception as e:
            context.add_error(f"策略执行失败: {str(e)}")
            return {
                'success': False,
                'results': context.results,
                'execution_path': context.execution_path,
                'errors': context.errors
            }
    
    def _build_execution_graph(self, strategy: Strategy) -> Dict[str, List[str]]:
        """构建执行图"""
        graph = {}
        
        # 初始化所有组件
        for component in strategy.components:
            graph[component.id] = []
        
        # 添加连接关系
        for connection in strategy.connections:
            if connection.source_component_id in graph:
                graph[connection.source_component_id].append(connection.target_component_id)
        
        return graph
    
    def _topological_sort(self, graph: Dict[str, List[str]]) -> List[str]:
        """拓扑排序"""
        # 计算入度
        in_degree = {node: 0 for node in graph}
        for node in graph:
            for neighbor in graph[node]:
                in_degree[neighbor] = in_degree.get(neighbor, 0) + 1
        
        # 找到入度为0的节点
        queue = [node for node in graph if in_degree[node] == 0]
        result = []
        
        while queue:
            node = queue.pop(0)
            result.append(node)
            
            # 更新邻居节点的入度
            for neighbor in graph.get(node, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        return result
    
    def _get_component_by_id(self, strategy: Strategy, component_id: str) -> Optional[Component]:
        """根据ID获取组件"""
        for component in strategy.components:
            if component.id == component_id:
                return component
        return None
    
    async def _execute_component(self, component: Component, context: StrategyExecutionContext):
        """执行组件"""
        try:
            # 获取组件处理器
            handler = self.component_registry.get_handler(component.type, component.name)
            if not handler:
                raise ValueError(f"未找到组件处理器: {component.type}.{component.name}")
            
            # 准备参数
            parameters = {}
            for param in component.parameters:
                parameters[param.name] = context.get_variable(param.name) or param.default_value
            
            # 执行组件
            result = await handler.execute(parameters, context)
            
            # 保存结果
            context.add_result(component.id, result)
            
        except Exception as e:
            context.add_error(f"组件 {component.id} 执行失败: {str(e)}")

# 组件处理器注册表
class ComponentHandlerRegistry:
    """组件处理器注册表"""
    
    def __init__(self):
        self.handlers = {}
    
    def register_handler(self, component_type: str, component_name: str, handler):
        """注册组件处理器"""
        key = f"{component_type}.{component_name}"
        self.handlers[key] = handler
    
    def get_handler(self, component_type: str, component_name: str):
        """获取组件处理器"""
        key = f"{component_type}.{component_name}"
        return self.handlers.get(key)

# 组件处理器基类
class ComponentHandler:
    """组件处理器基类"""
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> Any:
        """执行组件逻辑"""
        raise NotImplementedError

# 具体组件处理器实现
class AgeConditionHandler(ComponentHandler):
    """年龄条件处理器"""
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> bool:
        user_age = context.get_variable('user_age') or 0
        min_age = parameters.get('最小年龄', 0)
        max_age = parameters.get('最大年龄', 150)
        
        result = min_age <= user_age <= max_age
        return result

class AmountConditionHandler(ComponentHandler):
    """金额条件处理器"""
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> bool:
        transaction_amount = context.get_variable('transaction_amount') or 0
        min_amount = parameters.get('最小金额', 0)
        max_amount = parameters.get('最大金额', float('inf'))
        
        result = min_amount <= transaction_amount <= max_amount
        return result

class DeviceRiskConditionHandler(ComponentHandler):
    """设备风险条件处理器"""
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> bool:
        device_risk_score = context.get_variable('device_risk_score') or 0
        risk_threshold = parameters.get('风险阈值', 0.5)
        
        result = device_risk_score >= risk_threshold
        return result

class AllowActionHandler(ComponentHandler):
    """放行动作处理器"""
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> Dict[str, Any]:
        return {
            'action': 'allow',
            'reason': '通过风控检查'
        }

class BlockActionHandler(ComponentHandler):
    """拦截动作处理器"""
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> Dict[str, Any]:
        reason = parameters.get('拦截原因', '风险检测')
        return {
            'action': 'block',
            'reason': reason
        }

class CaptchaActionHandler(ComponentHandler):
    """验证码动作处理器"""
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> Dict[str, Any]:
        captcha_type = parameters.get('验证码类型', '短信')
        return {
            'action': 'captcha',
            'type': captcha_type,
            'message': f'请完成{captcha_type}验证'
        }

# 初始化组件处理器注册表
def init_component_registry():
    """初始化组件处理器注册表"""
    registry = ComponentHandlerRegistry()
    
    # 注册条件处理器
    registry.register_handler('condition', '用户年龄', AgeConditionHandler())
    registry.register_handler('condition', '交易金额', AmountConditionHandler())
    registry.register_handler('condition', '设备风险', DeviceRiskConditionHandler())
    
    # 注册动作处理器
    registry.register_handler('action', '放行', AllowActionHandler())
    registry.register_handler('action', '拦截', BlockActionHandler())
    registry.register_handler('action', '验证码', CaptchaActionHandler())
    
    return registry

# 使用示例
async def example_usage():
    """使用示例"""
    # 初始化组件注册表
    registry = init_component_registry()
    
    # 创建策略执行器
    executor = StrategyExecutor(registry)
    
    # 创建执行上下文
    context = StrategyExecutionContext({
        'user_age': 25,
        'transaction_amount': 1000,
        'device_risk_score': 0.3
    })
    
    # 执行策略（这里需要一个实际的策略对象）
    # result = await executor.execute_strategy(strategy, context)
    # print(f"执行结果: {result}")
```

## 三、IF-THEN-ELSE规则组合

### 3.1 规则组合逻辑

#### 3.1.1 条件分支实现

**分支逻辑处理**：
```python
# 条件分支组件
class DecisionComponent(Component):
    """决策组件"""
    
    def __init__(self, id: str, name: str, description: str, 
                 conditions: List[Dict], position: Dict[str, int]):
        super().__init__(id, 'decision', name, description, [], position)
        self.conditions = conditions

class DecisionHandler(ComponentHandler):
    """决策处理器"""
    
    def __init__(self, strategy_executor: StrategyExecutor):
        self.strategy_executor = strategy_executor
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> str:
        """执行决策逻辑"""
        # 获取条件列表
        conditions = parameters.get('conditions', [])
        
        # 依次评估条件
        for condition in conditions:
            condition_id = condition['condition_id']
            branch_name = condition['branch']
            
            # 获取条件组件的结果
            condition_result = context.get_result(condition_id)
            if condition_result:
                return branch_name
        
        # 默认分支
        return parameters.get('default_branch', 'default')

# 分支连接处理
class BranchConnection(Connection):
    """分支连接"""
    
    def __init__(self, id: str, source_component_id: str, target_component_id: str,
                 source_port: str, target_port: str, condition: str, branch: str):
        super().__init__(id, source_component_id, target_component_id, 
                        source_port, target_port, condition)
        self.branch = branch

# 策略执行器增强版
class EnhancedStrategyExecutor(StrategyExecutor):
    """增强版策略执行器"""
    
    async def execute_strategy(self, strategy: Strategy, context: StrategyExecutionContext) -> Dict[str, Any]:
        """执行策略（支持分支）"""
        try:
            # 构建执行图（包含分支信息）
            execution_graph = self._build_enhanced_execution_graph(strategy)
            
            # 执行策略
            await self._execute_enhanced_strategy(strategy, execution_graph, context)
            
            return {
                'success': True,
                'results': context.results,
                'execution_path': context.execution_path,
                'errors': context.errors
            }
        except Exception as e:
            context.add_error(f"策略执行失败: {str(e)}")
            return {
                'success': False,
                'results': context.results,
                'execution_path': context.execution_path,
                'errors': context.errors
            }
    
    def _build_enhanced_execution_graph(self, strategy: Strategy) -> Dict:
        """构建增强版执行图"""
        graph = {
            'components': {},
            'connections': {},
            'branches': {}
        }
        
        # 添加组件
        for component in strategy.components:
            graph['components'][component.id] = component
        
        # 添加连接和分支信息
        for connection in strategy.connections:
            source_id = connection.source_component_id
            if source_id not in graph['connections']:
                graph['connections'][source_id] = []
            
            connection_info = {
                'target': connection.target_component_id,
                'condition': connection.condition
            }
            
            # 如果是分支连接
            if hasattr(connection, 'branch'):
                connection_info['branch'] = connection.branch
                if source_id not in graph['branches']:
                    graph['branches'][source_id] = {}
                graph['branches'][source_id][connection.branch] = connection.target_component_id
            
            graph['connections'][source_id].append(connection_info)
        
        return graph
    
    async def _execute_enhanced_strategy(self, strategy: Strategy, execution_graph: Dict, 
                                       context: StrategyExecutionContext):
        """执行增强版策略"""
        # 获取起始组件
        start_components = self._get_start_components(strategy, execution_graph)
        
        # 并行执行起始组件
        tasks = []
        for component_id in start_components:
            task = self._execute_component_chain(component_id, strategy, execution_graph, context)
            tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks)
    
    def _get_start_components(self, strategy: Strategy, execution_graph: Dict) -> List[str]:
        """获取起始组件"""
        all_targets = set()
        for connections in execution_graph['connections'].values():
            for conn in connections:
                all_targets.add(conn['target'])
        
        start_components = []
        for component in strategy.components:
            if component.id not in all_targets:
                start_components.append(component.id)
        
        return start_components
    
    async def _execute_component_chain(self, component_id: str, strategy: Strategy, 
                                     execution_graph: Dict, context: StrategyExecutionContext):
        """执行组件链"""
        # 获取组件
        component = execution_graph['components'].get(component_id)
        if not component:
            return
        
        # 执行组件
        await self._execute_component(component, context)
        
        # 获取后续连接
        connections = execution_graph['connections'].get(component_id, [])
        branches = execution_graph['branches'].get(component_id, {})
        
        # 处理分支逻辑
        if branches:
            # 获取决策结果
            decision_result = context.get_result(component_id)
            if decision_result and decision_result in branches:
                # 执行对应的分支
                next_component_id = branches[decision_result]
                await self._execute_component_chain(next_component_id, strategy, execution_graph, context)
        else:
            # 顺序执行后续组件
            for connection in connections:
                next_component_id = connection['target']
                await self._execute_component_chain(next_component_id, strategy, execution_graph, context)
```

#### 3.1.2 复杂规则组合

**嵌套规则实现**：
```python
# 嵌套规则支持
class NestedRuleComponent(Component):
    """嵌套规则组件"""
    
    def __init__(self, id: str, name: str, description: str, 
                 sub_strategy_id: str, position: Dict[str, int]):
        super().__init__(id, 'nested_rule', name, description, [], position)
        self.sub_strategy_id = sub_strategy_id

class NestedRuleHandler(ComponentHandler):
    """嵌套规则处理器"""
    
    def __init__(self, strategy_service: StrategyService, 
                 strategy_executor: EnhancedStrategyExecutor):
        self.strategy_service = strategy_service
        self.strategy_executor = strategy_executor
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> Any:
        """执行嵌套规则"""
        sub_strategy_id = parameters.get('sub_strategy_id')
        if not sub_strategy_id:
            raise ValueError("缺少子策略ID")
        
        # 获取子策略
        sub_strategy = self.strategy_service.get_strategy(sub_strategy_id)
        if not sub_strategy:
            raise ValueError(f"子策略 {sub_strategy_id} 不存在")
        
        # 创建子执行上下文
        sub_context = StrategyExecutionContext(context.request_data.copy())
        sub_context.variables.update(context.variables)
        
        # 执行子策略
        result = await self.strategy_executor.execute_strategy(sub_strategy, sub_context)
        
        # 合并结果
        context.results.update(sub_context.results)
        context.execution_path.extend(sub_context.execution_path)
        context.errors.extend(sub_context.errors)
        
        return result

# 循环规则支持
class LoopComponent(Component):
    """循环组件"""
    
    def __init__(self, id: str, name: str, description: str,
                 loop_variable: str, loop_data: str, max_iterations: int,
                 position: Dict[str, int]):
        super().__init__(id, 'loop', name, description, [], position)
        self.loop_variable = loop_variable
        self.loop_data = loop_data
        self.max_iterations = max_iterations

class LoopHandler(ComponentHandler):
    """循环处理器"""
    
    def __init__(self, strategy_executor: EnhancedStrategyExecutor):
        self.strategy_executor = strategy_executor
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> List[Any]:
        """执行循环逻辑"""
        loop_variable = parameters.get('loop_variable')
        loop_data_source = parameters.get('loop_data')
        max_iterations = parameters.get('max_iterations', 100)
        
        # 获取循环数据
        loop_data = context.get_variable(loop_data_source)
        if not isinstance(loop_data, (list, tuple)):
            raise ValueError(f"循环数据 {loop_data_source} 不是列表类型")
        
        results = []
        iteration_count = 0
        
        # 执行循环
        for item in loop_data:
            if iteration_count >= max_iterations:
                break
            
            # 设置循环变量
            context.set_variable(loop_variable, item)
            
            # 执行循环体（这里需要获取循环体的组件）
            # 这是一个简化的实现，实际需要根据连接关系确定循环体组件
            # loop_body_result = await self._execute_loop_body(context)
            # results.append(loop_body_result)
            
            iteration_count += 1
        
        return results

# 条件聚合组件
class ConditionAggregatorComponent(Component):
    """条件聚合组件"""
    
    def __init__(self, id: str, name: str, description: str,
                 aggregation_type: str, condition_ids: List[str],
                 position: Dict[str, int]):
        super().__init__(id, 'condition_aggregator', name, description, [], position)
        self.aggregation_type = aggregation_type  # and, or, majority
        self.condition_ids = condition_ids

class ConditionAggregatorHandler(ComponentHandler):
    """条件聚合处理器"""
    
    async def execute(self, parameters: Dict[str, Any], context: StrategyExecutionContext) -> bool:
        """执行条件聚合"""
        aggregation_type = parameters.get('aggregation_type', 'and')
        condition_ids = parameters.get('condition_ids', [])
        
        # 获取各个条件的结果
        condition_results = []
        for condition_id in condition_ids:
            result = context.get_result(condition_id)
            if result is not None:
                condition_results.append(bool(result))
        
        # 根据聚合类型计算最终结果
        if aggregation_type == 'and':
            return all(condition_results) if condition_results else True
        elif aggregation_type == 'or':
            return any(condition_results) if condition_results else False
        elif aggregation_type == 'majority':
            if not condition_results:
                return False
            true_count = sum(condition_results)
            return true_count > len(condition_results) / 2
        else:
            raise ValueError(f"不支持的聚合类型: {aggregation_type}")
```

### 3.2 策略模板与复用

#### 3.2.1 策略模板设计

**模板管理系统**：
```python
# 策略模板
@dataclass
class StrategyTemplate:
    """策略模板"""
    id: str
    name: str
    description: str
    template_data: Dict[str, Any]
    category: str
    tags: List[str]
    created_at: datetime
    created_by: str
    version: int = 1

class TemplateService:
    """模板服务"""
    
    def __init__(self, storage_backend):
        self.storage = storage_backend
    
    def create_template(self, template_data: Dict) -> StrategyTemplate:
        """创建模板"""
        template = StrategyTemplate(
            id=f"template_{datetime.now().strftime('%Y%m%d%H%M%S')}_{hash(str(template_data)) % 10000}",
            name=template_data['name'],
            description=template_data.get('description', ''),
            template_data=template_data['template_data'],
            category=template_data.get('category', 'general'),
            tags=template_data.get('tags', []),
            created_at=datetime.now(),
            created_by=template_data.get('created_by', 'system'),
            version=1
        )
        
        self.storage.save_template(template)
        return template
    
    def get_template(self, template_id: str) -> Optional[StrategyTemplate]:
        """获取模板"""
        return self.storage.get_template(template_id)
    
    def list_templates(self, category: Optional[str] = None, 
                      tags: Optional[List[str]] = None) -> List[StrategyTemplate]:
        """列出模板"""
        return self.storage.list_templates(category, tags)
    
    def instantiate_strategy(self, template_id: str, 
                           instance_params: Dict[str, Any]) -> Strategy:
        """实例化策略"""
        template = self.get_template(template_id)
        if not template:
            raise ValueError(f"模板 {template_id} 不存在")
        
        # 根据模板数据创建策略
        strategy_data = self._instantiate_template(template, instance_params)
        strategy_service = StrategyService(RedisStrategyStorage())
        return strategy_service.create_strategy(strategy_data)
    
    def _instantiate_template(self, template: StrategyTemplate, 
                            params: Dict[str, Any]) -> Dict[str, Any]:
        """实例化模板"""
        template_data = template.template_data.copy()
        
        # 替换模板参数
        def replace_params(obj):
            if isinstance(obj, dict):
                return {k: replace_params(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [replace_params(item) for item in obj]
            elif isinstance(obj, str):
                # 简单的参数替换
                for param_name, param_value in params.items():
                    placeholder = f"{{{{{param_name}}}}}"
                    if placeholder in obj:
                        obj = obj.replace(placeholder, str(param_value))
                return obj
            else:
                return obj
        
        return replace_params(template_data)

# 模板存储
class TemplateStorage:
    """模板存储接口"""
    
    def save_template(self, template: StrategyTemplate) -> bool:
        raise NotImplementedError
    
    def get_template(self, template_id: str) -> Optional[StrategyTemplate]:
        raise NotImplementedError
    
    def list_templates(self, category: Optional[str] = None, 
                      tags: Optional[List[str]] = None) -> List[StrategyTemplate]:
        raise NotImplementedError

# Redis模板存储实现
class RedisTemplateStorage(TemplateStorage):
    """基于Redis的模板存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost', 
            port=6379, 
            db=1,  # 使用不同的数据库
            decode_responses=True
        )
    
    def save_template(self, template: StrategyTemplate) -> bool:
        try:
            template_dict = {
                'id': template.id,
                'name': template.name,
                'description': template.description,
                'template_data': json.dumps(template.template_data),
                'category': template.category,
                'tags': json.dumps(template.tags),
                'created_at': template.created_at.isoformat(),
                'created_by': template.created_by,
                'version': template.version
            }
            
            template_key = f"template:{template.id}"
            self.redis.hset(template_key, mapping=template_dict)
            
            # 添加到模板列表
            self.redis.sadd("templates", template.id)
            
            # 按分类索引
            self.redis.sadd(f"templates:category:{template.category}", template.id)
            
            # 按标签索引
            for tag in template.tags:
                self.redis.sadd(f"templates:tag:{tag}", template.id)
            
            return True
        except Exception as e:
            print(f"保存模板失败: {e}")
            return False
    
    def get_template(self, template_id: str) -> Optional[StrategyTemplate]:
        try:
            template_key = f"template:{template_id}"
            template_data = self.redis.hgetall(template_key)
            
            if not template_data:
                return None
            
            return StrategyTemplate(
                id=template_data['id'],
                name=template_data['name'],
                description=template_data['description'],
                template_data=json.loads(template_data['template_data']),
                category=template_data['category'],
                tags=json.loads(template_data['tags']),
                created_at=datetime.fromisoformat(template_data['created_at']),
                created_by=template_data['created_by'],
                version=int(template_data['version'])
            )
        except Exception as e:
            print(f"获取模板失败: {e}")
            return None
    
    def list_templates(self, category: Optional[str] = None, 
                      tags: Optional[List[str]] = None) -> List[StrategyTemplate]:
        try:
            if category:
                template_ids = self.redis.smembers(f"templates:category:{category}")
            elif tags:
                template_ids = set()
                for tag in tags:
                    tag_template_ids = self.redis.smembers(f"templates:tag:{tag}")
                    template_ids.update(tag_template_ids)
            else:
                template_ids = self.redis.smembers("templates")
            
            templates = []
            for template_id in template_ids:
                template = self.get_template(template_id)
                if template:
                    templates.append(template)
            
            return templates
        except Exception as e:
            print(f"列出模板失败: {e}")
            return []

# 常用策略模板示例
def create_common_templates():
    """创建常用策略模板"""
    template_service = TemplateService(RedisTemplateStorage())
    
    # 用户注册风险控制模板
    registration_template = {
        'name': '用户注册风险控制',
        'description': '用于用户注册场景的风险控制策略',
        'category': 'user_registration',
        'tags': ['注册', '风险控制', '用户'],
        'template_data': {
            'name': '用户注册风控策略 - {{business_name}}',
            'description': '针对{{business_name}}业务的用户注册风控策略',
            'components': [
                {
                    'id': 'comp_1',
                    'type': 'condition',
                    'name': '设备风险',
                    'description': '检查设备风险评分',
                    'parameters': [
                        {
                            'name': '风险阈值',
                            'label': '风险阈值',
                            'type': 'number',
                            'default_value': '{{device_risk_threshold}}'
                        }
                    ],
                    'position': {'x': 100, 'y': 100}
                },
                {
                    'id': 'comp_2',
                    'type': 'condition',
                    'name': 'IP频率',
                    'description': '检查IP注册频率',
                    'parameters': [
                        {
                            'name': '最大频率',
                            'label': '最大频率(次/小时)',
                            'type': 'number',
                            'default_value': '{{ip_frequency_limit}}'
                        }
                    ],
                    'position': {'x': 100, 'y': 200}
                },
                {
                    'id': 'comp_3',
                    'type': 'action',
                    'name': '拦截',
                    'description': '拦截高风险注册',
                    'parameters': [
                        {
                            'name': '拦截原因',
                            'label': '拦截原因',
                            'type': 'text',
                            'default_value': '注册风险检测'
                        }
                    ],
                    'position': {'x': 300, 'y': 150}
                }
            ],
            'connections': [
                {
                    'id': 'conn_1',
                    'source_component_id': 'comp_1',
                    'target_component_id': 'comp_3',
                    'source_port': 'output',
                    'target_port': 'input',
                    'condition': 'risk_detected'
                },
                {
                    'id': 'conn_2',
                    'source_component_id': 'comp_2',
                    'target_component_id': 'comp_3',
                    'source_port': 'output',
                    'target_port': 'input',
                    'condition': 'high_frequency'
                }
            ]
        }
    }
    
    template_service.create_template(registration_template)
    
    # 交易风险控制模板
    transaction_template = {
        'name': '交易风险控制',
        'description': '用于交易场景的风险控制策略',
        'category': 'transaction',
        'tags': ['交易', '风险控制', '支付'],
        'template_data': {
            'name': '交易风控策略 - {{business_name}}',
            'description': '针对{{business_name}}业务的交易风控策略',
            'components': [
                {
                    'id': 'comp_1',
                    'type': 'condition',
                    'name': '交易金额',
                    'description': '检查交易金额',
                    'parameters': [
                        {
                            'name': '最大金额',
                            'label': '最大金额',
                            'type': 'number',
                            'default_value': '{{max_transaction_amount}}'
                        }
                    ],
                    'position': {'x': 100, 'y': 100}
                },
                {
                    'id': 'comp_2',
                    'type': 'condition',
                    'name': '用户等级',
                    'description': '检查用户等级',
                    'parameters': [
                        {
                            'name': '最低等级',
                            'label': '最低等级',
                            'type': 'number',
                            'default_value': '{{min_user_level}}'
                        }
                    ],
                    'position': {'x': 100, 'y': 200}
                },
                {
                    'id': 'comp_3',
                    'type': 'decision',
                    'name': '风险决策',
                    'description': '综合评估风险',
                    'parameters': [],
                    'position': {'x': 300, 'y': 150}
                },
                {
                    'id': 'comp_4',
                    'type': 'action',
                    'name': '放行',
                    'description': '放行正常交易',
                    'parameters': [],
                    'position': {'x': 500, 'y': 100}
                },
                {
                    'id': 'comp_5',
                    'type': 'action',
                    'name': '验证码',
                    'description': '发送验证码验证',
                    'parameters': [
                        {
                            'name': '验证码类型',
                            'label': '验证码类型',
                            'type': 'select',
                            'default_value': '短信'
                        }
                    ],
                    'position': {'x': 500, 'y': 200}
                },
                {
                    'id': 'comp_6',
                    'type': 'action',
                    'name': '拦截',
                    'description': '拦截高风险交易',
                    'parameters': [
                        {
                            'name': '拦截原因',
                            'label': '拦截原因',
                            'type': 'text',
                            'default_value': '交易风险检测'
                        }
                    ],
                    'position': {'x': 500, 'y': 300}
                }
            ],
            'connections': [
                {
                    'id': 'conn_1',
                    'source_component_id': 'comp_1',
                    'target_component_id': 'comp_3',
                    'source_port': 'output',
                    'target_port': 'input'
                },
                {
                    'id': 'conn_2',
                    'source_component_id': 'comp_2',
                    'target_component_id': 'comp_3',
                    'source_port': 'output',
                    'target_port': 'input'
                },
                {
                    'id': 'conn_3',
                    'source_component_id': 'comp_3',
                    'target_component_id': 'comp_4',
                    'source_port': 'output_low_risk',
                    'target_port': 'input',
                    'branch': 'low_risk'
                },
                {
                    'id': 'conn_4',
                    'source_component_id': 'comp_3',
                    'target_component_id': 'comp_5',
                    'source_port': 'output_medium_risk',
                    'target_port': 'input',
                    'branch': 'medium_risk'
                },
                {
                    'id': 'conn_5',
                    'source_component_id': 'comp_3',
                    'target_component_id': 'comp_6',
                    'source_port': 'output_high_risk',
                    'target_port': 'input',
                    'branch': 'high_risk'
                }
            ]
        }
    }
    
    template_service.create_template(transaction_template)

# 使用模板创建策略示例
def create_strategy_from_template():
    """从模板创建策略示例"""
    template_service = TemplateService(RedisTemplateStorage())
    strategy_service = StrategyService(RedisStrategyStorage())
    
    # 查找模板
    templates = template_service.list_templates(category='transaction')
    if not templates:
        print("未找到交易风控模板")
        return
    
    template = templates[0]
    
    # 实例化参数
    instance_params = {
        'business_name': '电商平台',
        'max_transaction_amount': 50000,
        'min_user_level': 2
    }
    
    # 创建策略
    strategy = template_service.instantiate_strategy(template.id, instance_params)
    print(f"创建策略成功: {strategy.name}")
```

## 四、策略版本管理与发布

### 4.1 版本控制机制

#### 4.1.1 策略版本设计

**版本管理实现**：
```python
# 策略版本
@dataclass
class StrategyVersion:
    """策略版本"""
    id: str
    strategy_id: str
    version: int
    name: str
    description: str
    content: Dict[str, Any]
    created_at: datetime
    created_by: str
    status: str  # draft, testing, released, deprecated

class VersionService:
    """版本服务"""
    
    def __init__(self, storage_backend):
        self.storage = storage_backend
    
    def create_version(self, strategy_id: str, version_data: Dict) -> StrategyVersion:
        """创建策略版本"""
        # 获取当前最新版本
        latest_version = self.storage.get_latest_version(strategy_id)
        next_version = (latest_version.version + 1) if latest_version else 1
        
        version = StrategyVersion(
            id=f"version_{strategy_id}_{next_version}",
            strategy_id=strategy_id,
            version=next_version,
            name=version_data['name'],
            description=version_data.get('description', ''),
            content=version_data['content'],
            created_at=datetime.now(),
            created_by=version_data.get('created_by', 'system'),
            status='draft'
        )
        
        self.storage.save_version(version)
        return version
    
    def get_version(self, version_id: str) -> Optional[StrategyVersion]:
        """获取策略版本"""
        return self.storage.get_version(version_id)
    
    def get_strategy_versions(self, strategy_id: str) -> List[StrategyVersion]:
        """获取策略的所有版本"""
        return self.storage.get_strategy_versions(strategy_id)
    
    def update_version_status(self, version_id: str, status: str) -> bool:
        """更新版本状态"""
        version = self.get_version(version_id)
        if not version:
            return False
        
        version.status = status
        version.updated_at = datetime.now() if hasattr(version, 'updated_at') else datetime.now()
        
        return self.storage.update_version(version)
    
    def compare_versions(self, version1_id: str, version2_id: str) -> Dict[str, Any]:
        """比较两个版本的差异"""
        version1 = self.get_version(version1_id)
        version2 = self.get_version(version2_id)
        
        if not version1 or not version2:
            raise ValueError("版本不存在")
        
        # 比较内容差异
        differences = self._compare_content(version1.content, version2.content)
        
        return {
            'version1': {
                'id': version1.id,
                'version': version1.version,
                'status': version1.status
            },
            'version2': {
                'id': version2.id,
                'version': version2.version,
                'status': version2.status
            },
            'differences': differences
        }
    
    def _compare_content(self, content1: Dict, content2: Dict) -> Dict[str, Any]:
        """比较内容差异"""
        differences = {}
        
        # 比较基本属性
        basic_fields = ['name', 'description']
        for field in basic_fields:
            if content1.get(field) != content2.get(field):
                differences[field] = {
                    'version1': content1.get(field),
                    'version2': content2.get(field)
                }
        
        # 比较组件
        components1 = {comp['id']: comp for comp in content1.get('components', [])}
        components2 = {comp['id']: comp for comp in content2.get('components', [])}
        
        component_diffs = {}
        all_component_ids = set(components1.keys()) | set(components2.keys())
        
        for comp_id in all_component_ids:
            comp1 = components1.get(comp_id)
            comp2 = components2.get(comp_id)
            
            if comp1 and not comp2:
                component_diffs[comp_id] = {'type': 'removed', 'data': comp1}
            elif not comp1 and comp2:
                component_diffs[comp_id] = {'type': 'added', 'data': comp2}
            elif comp1 and comp2 and comp1 != comp2:
                component_diffs[comp_id] = {'type': 'modified', 'data1': comp1, 'data2': comp2}
        
        if component_diffs:
            differences['components'] = component_diffs
        
        # 比较连接
        connections1 = {conn['id']: conn for conn in content1.get('connections', [])}
        connections2 = {conn['id']: conn for conn in content2.get('connections', [])}
        
        connection_diffs = {}
        all_connection_ids = set(connections1.keys()) | set(connections2.keys())
        
        for conn_id in all_connection_ids:
            conn1 = connections1.get(conn_id)
            conn2 = connections2.get(conn_id)
            
            if conn1 and not conn2:
                connection_diffs[conn_id] = {'type': 'removed', 'data': conn1}
            elif not conn1 and conn2:
                connection_diffs[conn_id] = {'type': 'added', 'data': conn2}
            elif conn1 and conn2 and conn1 != conn2:
                connection_diffs[conn_id] = {'type': 'modified', 'data1': conn1, 'data2': conn2}
        
        if connection_diffs:
            differences['connections'] = connection_diffs
        
        return differences

# 版本存储
class VersionStorage:
    """版本存储接口"""
    
    def save_version(self, version: StrategyVersion) -> bool:
        raise NotImplementedError
    
    def get_version(self, version_id: str) -> Optional[StrategyVersion]:
        raise NotImplementedError
    
    def get_latest_version(self, strategy_id: str) -> Optional[StrategyVersion]:
        raise NotImplementedError
    
    def get_strategy_versions(self, strategy_id: str) -> List[StrategyVersion]:
        raise NotImplementedError
    
    def update_version(self, version: StrategyVersion) -> bool:
        raise NotImplementedError

# Redis版本存储实现
class RedisVersionStorage(VersionStorage):
    """基于Redis的版本存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost', 
            port=6379, 
            db=2,  # 使用不同的数据库
            decode_responses=True
        )
    
    def save_version(self, version: StrategyVersion) -> bool:
        try:
            version_dict = {
                'id': version.id,
                'strategy_id': version.strategy_id,
                'version': version.version,
                'name': version.name,
                'description': version.description,
                'content': json.dumps(version.content),
                'created_at': version.created_at.isoformat(),
                'created_by': version.created_by,
                'status': version.status
            }
            
            version_key = f"version:{version.id}"
            self.redis.hset(version_key, mapping=version_dict)
            
            # 添加到策略版本列表
            strategy_versions_key = f"strategy_versions:{version.strategy_id}"
            self.redis.sadd(strategy_versions_key, version.id)
            
            # 更新最新版本
            self.redis.set(f"latest_version:{version.strategy_id}", version.id)
            
            # 按状态索引
            self.redis.sadd(f"versions:status:{version.status}", version.id)
            
            return True
        except Exception as e:
            print(f"保存版本失败: {e}")
            return False
    
    def get_version(self, version_id: str) -> Optional[StrategyVersion]:
        try:
            version_key = f"version:{version_id}"
            version_data = self.redis.hgetall(version_key)
            
            if not version_data:
                return None
            
            return StrategyVersion(
                id=version_data['id'],
                strategy_id=version_data['strategy_id'],
                version=int(version_data['version']),
                name=version_data['name'],
                description=version_data['description'],
                content=json.loads(version_data['content']),
                created_at=datetime.fromisoformat(version_data['created_at']),
                created_by=version_data['created_by'],
                status=version_data['status']
            )
        except Exception as e:
            print(f"获取版本失败: {e}")
            return None
    
    def get_latest_version(self, strategy_id: str) -> Optional[StrategyVersion]:
        try:
            latest_version_id = self.redis.get(f"latest_version:{strategy_id}")
            if not latest_version_id:
                # 如果没有最新版本标记，查找版本号最大的版本
                strategy_versions_key = f"strategy_versions:{strategy_id}"
                version_ids = self.redis.smembers(strategy_versions_key)
                
                if not version_ids:
                    return None
                
                versions = []
                for version_id in version_ids:
                    version = self.get_version(version_id)
                    if version:
                        versions.append(version)
                
                if not versions:
                    return None
                
                # 按版本号排序，返回最新的
                versions.sort(key=lambda x: x.version, reverse=True)
                latest_version = versions[0]
                
                # 设置最新版本标记
                self.redis.set(f"latest_version:{strategy_id}", latest_version.id)
                
                return latest_version
            
            return self.get_version(latest_version_id)
        except Exception as e:
            print(f"获取最新版本失败: {e}")
            return None
    
    def get_strategy_versions(self, strategy_id: str) -> List[StrategyVersion]:
        try:
            strategy_versions_key = f"strategy_versions:{strategy_id}"
            version_ids = self.redis.smembers(strategy_versions_key)
            
            versions = []
            for version_id in version_ids:
                version = self.get_version(version_id)
                if version:
                    versions.append(version)
            
            # 按版本号排序
            versions.sort(key=lambda x: x.version)
            return versions
        except Exception as e:
            print(f"获取策略版本列表失败: {e}")
            return []
    
    def update_version(self, version: StrategyVersion) -> bool:
        return self.save_version(version)

# 策略发布流程
class StrategyReleaseService:
    """策略发布服务"""
    
    def __init__(self, strategy_service: StrategyService, 
                 version_service: VersionService,
                 executor: EnhancedStrategyExecutor):
        self.strategy_service = strategy_service
        self.version_service = version_service
        self.executor = executor
    
    def create_release_candidate(self, strategy_id: str, 
                               description: str = "") -> StrategyVersion:
        """创建发布候选版本"""
        # 获取当前策略
        strategy = self.strategy_service.get_strategy(strategy_id)
        if not strategy:
            raise ValueError(f"策略 {strategy_id} 不存在")
        
        # 创建版本数据
        version_data = {
            'name': f"{strategy.name} v{strategy.version + 1}",
            'description': description or f"{strategy.name} 的新版本",
            'content': self._strategy_to_version_content(strategy),
            'created_by': 'release_system'
        }
        
        # 创建版本
        version = self.version_service.create_version(strategy_id, version_data)
        
        # 更新策略状态为测试中
        self.version_service.update_version_status(version.id, 'testing')
        
        return version
    
    def test_version(self, version_id: str, test_data: List[Dict]) -> Dict[str, Any]:
        """测试版本"""
        version = self.version_service.get_version(version_id)
        if not version:
            raise ValueError(f"版本 {version_id} 不存在")
        
        # 创建测试策略
        test_strategy = self._version_content_to_strategy(
            version.content, 
            f"test_{version.strategy_id}_{version.version}"
        )
        
        # 执行测试
        test_results = []
        for data in test_data:
            context = StrategyExecutionContext(data)
            result = asyncio.run(self.executor.execute_strategy(test_strategy, context))
            test_results.append(result)
        
        # 分析测试结果
        passed_count = sum(1 for result in test_results if result['success'])
        total_count = len(test_results)
        pass_rate = passed_count / total_count if total_count > 0 else 0
        
        return {
            'version_id': version_id,
            'total_tests': total_count,
            'passed_tests': passed_count,
            'failed_tests': total_count - passed_count,
            'pass_rate': pass_rate,
            'test_results': test_results
        }
    
    def release_version(self, version_id: str) -> bool:
        """发布版本"""
        version = self.version_service.get_version(version_id)
        if not version:
            raise ValueError(f"版本 {version_id} 不存在")
        
        # 检查版本状态
        if version.status != 'testing':
            raise ValueError("只有测试中的版本才能发布")
        
        # 更新版本状态为已发布
        success = self.version_service.update_version_status(version_id, 'released')
        if not success:
            return False
        
        # 更新策略内容
        strategy = self.strategy_service.get_strategy(version.strategy_id)
        if strategy:
            # 更新策略内容为新版本内容
            updated_strategy = self._update_strategy_from_version(strategy, version)
            self.strategy_service.update_strategy(strategy.id, {
                'components': updated_strategy.components,
                'connections': updated_strategy.connections,
                'version': updated_strategy.version
            })
        
        return True
    
    def rollback_version(self, strategy_id: str, target_version: int) -> bool:
        """回滚到指定版本"""
        # 获取目标版本
        strategy_versions = self.version_service.get_strategy_versions(strategy_id)
        target_version_obj = None
        for version in strategy_versions:
            if version.version == target_version and version.status == 'released':
                target_version_obj = version
                break
        
        if not target_version_obj:
            raise ValueError(f"版本 {target_version} 不存在或未发布")
        
        # 更新策略内容为回滚版本
        strategy = self.strategy_service.get_strategy(strategy_id)
        if strategy:
            updated_strategy = self._update_strategy_from_version(strategy, target_version_obj)
            self.strategy_service.update_strategy(strategy.id, {
                'components': updated_strategy.components,
                'connections': updated_strategy.connections,
                'version': updated_strategy.version
            })
        
        return True
    
    def _strategy_to_version_content(self, strategy: Strategy) -> Dict[str, Any]:
        """将策略转换为版本内容"""
        return {
            'name': strategy.name,
            'description': strategy.description,
            'components': [
                {
                    'id': comp.id,
                    'type': comp.type,
                    'name': comp.name,
                    'description': comp.description,
                    'parameters': [
                        {
                            'name': param.name,
                            'label': param.label,
                            'type': param.type,
                            'default_value': param.default_value,
                            'required': param.required
                        }
                        for param in comp.parameters
                    ],
                    'position': comp.position
                }
                for comp in strategy.components
            ],
            'connections': [
                {
                    'id': conn.id,
                    'source_component_id': conn.source_component_id,
                    'target_component_id': conn.target_component_id,
                    'source_port': conn.source_port,
                    'target_port': conn.target_port,
                    'condition': conn.condition
                }
                for conn in strategy.connections
            ]
        }
    
    def _version_content_to_strategy(self, content: Dict[str, Any], strategy_id: str) -> Strategy:
        """将版本内容转换为策略"""
        # 解析组件
        components = []
        for comp_data in content.get('components', []):
            parameters = [
                ComponentParameter(**param)
                for param in comp_data['parameters']
            ]
            
            component = Component(
                id=comp_data['id'],
                type=comp_data['type'],
                name=comp_data['name'],
                description=comp_data['description'],
                parameters=parameters,
                position=comp_data['position'],
                created_at=datetime.now()
            )
            components.append(component)
        
        # 解析连接
        connections = []
        for conn_data in content.get('connections', []):
            connection = Connection(**conn_data)
            connections.append(connection)
        
        # 创建策略对象
        strategy = Strategy(
            id=strategy_id,
            name=content['name'],
            description=content['description'],
            components=components,
            connections=connections,
            version=1,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            created_by='version_system'
        )
        
        return strategy
    
    def _update_strategy_from_version(self, strategy: Strategy, 
                                    version: StrategyVersion) -> Strategy:
        """根据版本更新策略"""
        # 解析版本内容
        content = version.content
        
        # 更新策略属性
        strategy.name = content['name']
        strategy.description = content['description']
        strategy.version = version.version
        strategy.updated_at = datetime.now()
        
        # 更新组件
        strategy.components = []
        for comp_data in content.get('components', []):
            parameters = [
                ComponentParameter(**param)
                for param in comp_data['parameters']
            ]
            
            component = Component(
                id=comp_data['id'],
                type=comp_data['type'],
                name=comp_data['name'],
                description=comp_data['description'],
                parameters=parameters,
                position=comp_data['position'],
                created_at=datetime.now()
            )
            strategy.components.append(component)
        
        # 更新连接
        strategy.connections = []
        for conn_data in content.get('connections', []):
            connection = Connection(**conn_data)
            strategy.connections.append(connection)
        
        return strategy
```

### 4.2 灰度发布与A/B测试

#### 4.2.1 灰度发布机制

**灰度发布实现**：
```python
# 灰度发布配置
@dataclass
class GrayReleaseConfig:
    """灰度发布配置"""
    id: str
    strategy_id: str
    version_id: str
    release_percentage: float  # 发布百分比 0-100
    user_segments: List[str]   # 用户分群
    start_time: datetime
    end_time: Optional[datetime]
    created_at: datetime
    created_by: str
    status: str  # pending, active, completed, cancelled

class GrayReleaseService:
    """灰度发布服务"""
    
    def __init__(self, storage_backend, strategy_service: StrategyService,
                 version_service: VersionService):
        self.storage = storage_backend
        self.strategy_service = strategy_service
        self.version_service = version_service
    
    def create_gray_release(self, config_data: Dict) -> GrayReleaseConfig:
        """创建灰度发布"""
        config = GrayReleaseConfig(
            id=f"gray_{datetime.now().strftime('%Y%m%d%H%M%S')}_{hash(str(config_data)) % 10000}",
            strategy_id=config_data['strategy_id'],
            version_id=config_data['version_id'],
            release_percentage=config_data.get('release_percentage', 0),
            user_segments=config_data.get('user_segments', []),
            start_time=config_data.get('start_time', datetime.now()),
            end_time=config_data.get('end_time'),
            created_at=datetime.now(),
            created_by=config_data.get('created_by', 'system'),
            status='pending'
        )
        
        self.storage.save_gray_release(config)
        return config
    
    def start_gray_release(self, config_id: str) -> bool:
        """启动灰度发布"""
        config = self.storage.get_gray_release(config_id)
        if not config:
            raise ValueError(f"灰度发布配置 {config_id} 不存在")
        
        if config.status != 'pending':
            raise ValueError("只有待启动的灰度发布才能启动")
        
        config.status = 'active'
        config.start_time = datetime.now()
        
        return self.storage.update_gray_release(config)
    
    def stop_gray_release(self, config_id: str) -> bool:
        """停止灰度发布"""
        config = self.storage.get_gray_release(config_id)
        if not config:
            raise ValueError(f"灰度发布配置 {config_id} 不存在")
        
        if config.status != 'active':
            raise ValueError("只有进行中的灰度发布才能停止")
        
        config.status = 'completed'
        config.end_time = datetime.now()
        
        return self.storage.update_gray_release(config)
    
    def get_active_gray_releases(self) -> List[GrayReleaseConfig]:
        """获取进行中的灰度发布"""
        return self.storage.get_gray_releases_by_status('active')
    
    def should_use_new_strategy(self, strategy_id: str, user_id: str) -> bool:
        """判断是否应该使用新策略"""
        # 获取进行中的灰度发布
        active_releases = self.get_active_gray_releases()
        
        for release in active_releases:
            if release.strategy_id == strategy_id:
                # 检查用户是否在目标分群中
                if release.user_segments:
                    if not self._is_user_in_segments(user_id, release.user_segments):
                        continue
                
                # 检查发布时间窗口
                now = datetime.now()
                if now < release.start_time:
                    continue
                if release.end_time and now > release.end_time:
                    continue
                
                # 根据百分比决定是否使用新策略
                import random
                return random.random() * 100 < release.release_percentage
        
        return False
    
    def _is_user_in_segments(self, user_id: str, segments: List[str]) -> bool:
        """检查用户是否在指定分群中"""
        # 这里应该调用用户分群服务
        # 简化实现，假设用户ID的哈希值决定分群
        user_hash = hash(user_id) % 100
        return str(user_hash) in segments

# A/B测试支持
@dataclass
class ABTestConfig:
    """A/B测试配置"""
    id: str
    name: str
    description: str
    strategy_a_id: str
    strategy_b_id: str
    traffic_split: float  # A策略流量比例 0-1
    metrics: List[str]    # 关键指标
    start_time: datetime
    end_time: datetime
    created_at: datetime
    created_by: str
    status: str  # pending, active, completed, cancelled

@dataclass
class ABTestResult:
    """A/B测试结果"""
    config_id: str
    strategy_a_metrics: Dict[str, float]
    strategy_b_metrics: Dict[str, float]
    winner: str  # A, B, tie
    confidence: float
    created_at: datetime

class ABTestService:
    """A/B测试服务"""
    
    def __init__(self, storage_backend, metrics_service):
        self.storage = storage_backend
        self.metrics_service = metrics_service
    
    def create_ab_test(self, config_data: Dict) -> ABTestConfig:
        """创建A/B测试"""
        config = ABTestConfig(
            id=f"abtest_{datetime.now().strftime('%Y%m%d%H%M%S')}_{hash(str(config_data)) % 10000}",
            name=config_data['name'],
            description=config_data.get('description', ''),
            strategy_a_id=config_data['strategy_a_id'],
            strategy_b_id=config_data['strategy_b_id'],
            traffic_split=config_data.get('traffic_split', 0.5),
            metrics=config_data.get('metrics', ['conversion_rate', 'risk_detection_rate']),
            start_time=config_data['start_time'],
            end_time=config_data['end_time'],
            created_at=datetime.now(),
            created_by=config_data.get('created_by', 'system'),
            status='pending'
        )
        
        self.storage.save_ab_test(config)
        return config
    
    def start_ab_test(self, config_id: str) -> bool:
        """启动A/B测试"""
        config = self.storage.get_ab_test(config_id)
        if not config:
            raise ValueError(f"A/B测试配置 {config_id} 不存在")
        
        if config.status != 'pending':
            raise ValueError("只有待启动的A/B测试才能启动")
        
        config.status = 'active'
        return self.storage.update_ab_test(config)
    
    def stop_ab_test(self, config_id: str) -> bool:
        """停止A/B测试"""
        config = self.storage.get_ab_test(config_id)
        if not config:
            raise ValueError(f"A/B测试配置 {config_id} 不存在")
        
        if config.status != 'active':
            raise ValueError("只有进行中的A/B测试才能停止")
        
        config.status = 'completed'
        return self.storage.update_ab_test(config)
    
    def get_active_ab_tests(self) -> List[ABTestConfig]:
        """获取进行中的A/B测试"""
        return self.storage.get_ab_tests_by_status('active')
    
    def assign_strategy(self, user_id: str, strategy_a_id: str, strategy_b_id: str,
                       traffic_split: float) -> str:
        """为用户分配策略"""
        # 根据用户ID和流量分配比例决定使用哪个策略
        user_hash = hash(user_id) % 10000 / 10000
        return strategy_a_id if user_hash < traffic_split else strategy_b_id
    
    def record_user_event(self, config_id: str, user_id: str, strategy_id: str,
                         event_type: str, event_data: Dict[str, Any]):
        """记录用户事件"""
        # 记录用户在特定策略下的行为数据
        self.metrics_service.record_event(config_id, user_id, strategy_id, event_type, event_data)
    
    def analyze_ab_test(self, config_id: str) -> ABTestResult:
        """分析A/B测试结果"""
        config = self.storage.get_ab_test(config_id)
        if not config:
            raise ValueError(f"A/B测试配置 {config_id} 不存在")
        
        if config.status != 'completed':
            raise ValueError("只有已完成的A/B测试才能分析")
        
        # 获取测试数据
        test_data = self.metrics_service.get_test_data(config_id)
        
        # 计算各策略的指标
        strategy_a_metrics = self._calculate_metrics(test_data, config.strategy_a_id)
        strategy_b_metrics = self._calculate_metrics(test_data, config.strategy_b_id)
        
        # 确定获胜策略
        winner, confidence = self._determine_winner(strategy_a_metrics, strategy_b_metrics, config.metrics)
        
        result = ABTestResult(
            config_id=config_id,
            strategy_a_metrics=strategy_a_metrics,
            strategy_b_metrics=strategy_b_metrics,
            winner=winner,
            confidence=confidence,
            created_at=datetime.now()
        )
        
        # 保存结果
        self.storage.save_ab_test_result(result)
        
        return result
    
    def _calculate_metrics(self, test_data: List[Dict], strategy_id: str) -> Dict[str, float]:
        """计算策略指标"""
        strategy_data = [data for data in test_data if data['strategy_id'] == strategy_id]
        if not strategy_data:
            return {}
        
        metrics = {}
        total_users = len(set(data['user_id'] for data in strategy_data))
        
        # 转化率
        conversions = sum(1 for data in strategy_data if data.get('converted'))
        metrics['conversion_rate'] = conversions / total_users if total_users > 0 else 0
        
        # 风控检出率
        risks_detected = sum(1 for data in strategy_data if data.get('risk_detected'))
        metrics['risk_detection_rate'] = risks_detected / total_users if total_users > 0 else 0
        
        # 平均处理时间
        processing_times = [data['processing_time'] for data in strategy_data if 'processing_time' in data]
        metrics['avg_processing_time'] = sum(processing_times) / len(processing_times) if processing_times else 0
        
        return metrics
    
    def _determine_winner(self, metrics_a: Dict[str, float], metrics_b: Dict[str, float],
                         key_metrics: List[str]) -> tuple[str, float]:
        """确定获胜策略"""
        # 简化实现，基于关键指标的综合评分
        score_a = sum(metrics_a.get(metric, 0) for metric in key_metrics)
        score_b = sum(metrics_b.get(metric, 0) for metric in key_metrics)
        
        if score_a > score_b:
            winner = 'A'
            confidence = (score_a - score_b) / max(score_a, score_b) if max(score_a, score_b) > 0 else 0
        elif score_b > score_a:
            winner = 'B'
            confidence = (score_b - score_a) / max(score_a, score_b) if max(score_a, score_b) > 0 else 0
        else:
            winner = 'tie'
            confidence = 0
        
        return winner, confidence

# 存储接口
class ReleaseStorage:
    """发布存储接口"""
    
    def save_gray_release(self, config: GrayReleaseConfig) -> bool:
        raise NotImplementedError
    
    def get_gray_release(self, config_id: str) -> Optional[GrayReleaseConfig]:
        raise NotImplementedError
    
    def get_gray_releases_by_status(self, status: str) -> List[GrayReleaseConfig]:
        raise NotImplementedError
    
    def update_gray_release(self, config: GrayReleaseConfig) -> bool:
        raise NotImplementedError
    
    def save_ab_test(self, config: ABTestConfig) -> bool:
        raise NotImplementedError
    
    def get_ab_test(self, config_id: str) -> Optional[ABTestConfig]:
        raise NotImplementedError
    
    def get_ab_tests_by_status(self, status: str) -> List[ABTestConfig]:
        raise NotImplementedError
    
    def update_ab_test(self, config: ABTestConfig) -> bool:
        raise NotImplementedError
    
    def save_ab_test_result(self, result: ABTestResult) -> bool:
        raise NotImplementedError

# Redis存储实现
class RedisReleaseStorage(ReleaseStorage):
    """基于Redis的发布存储"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or redis.Redis(
            host='localhost', 
            port=6379, 
            db=3,  # 使用不同的数据库
            decode_responses=True
        )
    
    def save_gray_release(self, config: GrayReleaseConfig) -> bool:
        try:
            config_dict = {
                'id': config.id,
                'strategy_id': config.strategy_id,
                'version_id': config.version_id,
                'release_percentage': config.release_percentage,
                'user_segments': json.dumps(config.user_segments),
                'start_time': config.start_time.isoformat(),
                'end_time': config.end_time.isoformat() if config.end_time else '',
                'created_at': config.created_at.isoformat(),
                'created_by': config.created_by,
                'status': config.status
            }
            
            config_key = f"gray_release:{config.id}"
            self.redis.hset(config_key, mapping=config_dict)
            
            # 添加到列表
            self.redis.sadd("gray_releases", config.id)
            
            # 按状态索引
            self.redis.sadd(f"gray_releases:status:{config.status}", config.id)
            
            return True
        except Exception as e:
            print(f"保存灰度发布配置失败: {e}")
            return False
    
    def get_gray_release(self, config_id: str) -> Optional[GrayReleaseConfig]:
        try:
            config_key = f"gray_release:{config_id}"
            config_data = self.redis.hgetall(config_key)
            
            if not config_data:
                return None
            
            return GrayReleaseConfig(
                id=config_data['id'],
                strategy_id=config_data['strategy_id'],
                version_id=config_data['version_id'],
                release_percentage=float(config_data['release_percentage']),
                user_segments=json.loads(config_data['user_segments']),
                start_time=datetime.fromisoformat(config_data['start_time']),
                end_time=datetime.fromisoformat(config_data['end_time']) if config_data['end_time'] else None,
                created_at=datetime.fromisoformat(config_data['created_at']),
                created_by=config_data['created_by'],
                status=config_data['status']
            )
        except Exception as e:
            print(f"获取灰度发布配置失败: {e}")
            return None
    
    def get_gray_releases_by_status(self, status: str) -> List[GrayReleaseConfig]:
        try:
            config_ids = self.redis.smembers(f"gray_releases:status:{status}")
            
            configs = []
            for config_id in config_ids:
                config = self.get_gray_release(config_id)
                if config:
                    configs.append(config)
            
            return configs
        except Exception as e:
            print(f"获取灰度发布配置列表失败: {e}")
            return []
    
    def update_gray_release(self, config: GrayReleaseConfig) -> bool:
        # 先删除旧的状态索引
        old_config = self.get_gray_release(config.id)
        if old_config:
            self.redis.srem(f"gray_releases:status:{old_config.status}", config.id)
        
        # 保存更新后的配置
        return self.save_gray_release(config)
    
    def save_ab_test(self, config: ABTestConfig) -> bool:
        try:
            config_dict = {
                'id': config.id,
                'name': config.name,
                'description': config.description,
                'strategy_a_id': config.strategy_a_id,
                'strategy_b_id': config.strategy_b_id,
                'traffic_split': config.traffic_split,
                'metrics': json.dumps(config.metrics),
                'start_time': config.start_time.isoformat(),
                'end_time': config.end_time.isoformat(),
                'created_at': config.created_at.isoformat(),
                'created_by': config.created_by,
                'status': config.status
            }
            
            config_key = f"ab_test:{config.id}"
            self.redis.hset(config_key, mapping=config_dict)
            
            # 添加到列表
            self.redis.sadd("ab_tests", config.id)
            
            # 按状态索引
            self.redis.sadd(f"ab_tests:status:{config.status}", config.id)
            
            return True
        except Exception as e:
            print(f"保存A/B测试配置失败: {e}")
            return False
    
    def get_ab_test(self, config_id: str) -> Optional[ABTestConfig]:
        try:
            config_key = f"ab_test:{config_id}"
            config_data = self.redis.hgetall(config_key)
            
            if not config_data:
                return None
            
            return ABTestConfig(
                id=config_data['id'],
                name=config_data['name'],
                description=config_data['description'],
                strategy_a_id=config_data['strategy_a_id'],
                strategy_b_id=config_data['strategy_b_id'],
                traffic_split=float(config_data['traffic_split']),
                metrics=json.loads(config_data['metrics']),
                start_time=datetime.fromisoformat(config_data['start_time']),
                end_time=datetime.fromisoformat(config_data['end_time']),
                created_at=datetime.fromisoformat(config_data['created_at']),
                created_by=config_data['created_by'],
                status=config_data['status']
            )
        except Exception as e:
            print(f"获取A/B测试配置失败: {e}")
            return None
    
    def get_ab_tests_by_status(self, status: str) -> List[ABTestConfig]:
        try:
            config_ids = self.redis.smembers(f"ab_tests:status:{status}")
            
            configs = []
            for config_id in config_ids:
                config = self.get_ab_test(config_id)
                if config:
                    configs.append(config)
            
            return configs
        except Exception as e:
            print(f"获取A/B测试配置列表失败: {e}")
            return []
    
    def update_ab_test(self, config: ABTestConfig) -> bool:
        # 先删除旧的状态索引
        old_config = self.get_ab_test(config.id)
        if old_config:
            self.redis.srem(f"ab_tests:status:{old_config.status}", config.id)
        
        # 保存更新后的配置
        return self.save_ab_test(config)
    
    def save_ab_test_result(self, result: ABTestResult) -> bool:
        try:
            result_dict = {
                'config_id': result.config_id,
                'strategy_a_metrics': json.dumps(result.strategy_a_metrics),
                'strategy_b_metrics': json.dumps(result.strategy_b_metrics),
                'winner': result.winner,
                'confidence': result.confidence,
                'created_at': result.created_at.isoformat()
            }
            
            result_key = f"ab_test_result:{result.config_id}"
            self.redis.hset(result_key, mapping=result_dict)
            
            return True
        except Exception as e:
            print(f"保存A/B测试结果失败: {e}")
            return False

# 集成使用示例
def integrate_release_services():
    """集成发布服务示例"""
    # 初始化服务
    redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
    
    strategy_service = StrategyService(RedisStrategyStorage(redis_client))
    version_service = VersionService(RedisVersionStorage(redis_client))
    release_storage = RedisReleaseStorage(redis_client)
    
    gray_release_service = GrayReleaseService(
        release_storage, 
        strategy_service, 
        version_service
    )
    
    # 创建灰度发布示例
    gray_config = {
        'strategy_id': 'strategy_123',
        'version_id': 'version_456',
        'release_percentage': 10,  # 10%的流量
        'user_segments': ['vip_users', 'beta_testers'],
        'start_time': datetime.now(),
        'end_time': datetime.now() + timedelta(days=7),
        'created_by': 'admin'
    }
    
    gray_release = gray_release_service.create_gray_release(gray_config)
    print(f"创建灰度发布: {gray_release.id}")
    
    # 启动灰度发布
    gray_release_service.start_gray_release(gray_release.id)
    print("灰度发布已启动")
    
    # 检查是否应该使用新策略
    should_use_new = gray_release_service.should_use_new_strategy('strategy_123', 'user_789')
    print(f"用户是否使用新策略: {should_use_new}")
```

## 结语

可视化策略编排技术通过拖拽式界面和图形化配置，极大地简化了复杂风控策略的设计和管理过程。通过本文的详细介绍，我们了解了：

1. **可视化策略编排的核心架构**：从前端界面到后端执行引擎的完整技术架构
2. **拖拽式配置的实现**：包括前端组件库设计、画布交互、后端服务等关键技术
3. **IF-THEN-ELSE规则组合**：支持复杂的条件分支和决策逻辑
4. **策略模板与复用**：提高策略开发效率和一致性
5. **版本管理与发布**：确保策略的安全迭代和灰度发布

这些技术的综合应用，使得风控策略的开发、测试、发布和管理变得更加高效和可靠。通过可视化的方式，业务人员也能参与到策略设计中来，大大提升了风控系统的灵活性和适应性。

在未来的发展中，可视化策略编排还将结合AI技术，实现智能策略推荐、自动化策略优化等功能，进一步提升风控系统的智能化水平。