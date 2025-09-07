---
title: 微信小程序、H5混合应用测试支持
date: 2025-09-06
categories: [Tests]
tags: [Tests]
published: true
---

# 8.4 微信小程序、H5混合应用测试支持

随着移动互联网的发展，微信小程序和H5混合应用已成为企业数字化转型的重要载体。这类应用结合了原生应用的性能优势和Web技术的灵活性，但也带来了独特的测试挑战。本节将详细介绍如何在移动端专项测试平台中支持微信小程序和H5混合应用的测试，包括测试框架集成、测试策略制定、性能优化和安全测试等方面。

## 8.4.1 微信小程序测试框架集成

### 小程序测试的特殊性

微信小程序作为一种新型的应用形态，具有独特的运行环境和技术特点：

1. **双线程架构**：
   - 逻辑层运行在JSCore中
   - 渲染层运行在WebView中
   - 两层之间通过Native进行通信

2. **受限的API环境**：
   - 无法直接访问DOM
   - 不能使用浏览器的全局对象
   - 需要通过微信提供的API进行操作

3. **特定的生命周期**：
   - 应用生命周期：onLaunch、onShow、onHide
   - 页面生命周期：onLoad、onShow、onReady、onHide、onUnload

### 官方测试框架MiniProgram Test

微信官方提供了专门的小程序自动化测试框架MiniProgram Test，该框架基于Node.js环境，可以模拟用户操作并获取小程序的运行状态：

```javascript
// 安装依赖
// npm install --save-dev miniprogram-automator

const automator = require('miniprogram-automator')

async function runTest() {
  // 连接开发者工具
  const miniProgram = await automator.launch({
    cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli', // 工具cli路径
    projectPath: '/Users/username/miniprogram-demo', // 项目路径
  })
  
  // 获取当前页面
  const page = await miniProgram.currentPage()
  
  // 获取元素
  const element = await page.$('.userinfo-nickname')
  
  // 点击元素
  await element.tap()
  
  // 获取文本内容
  const text = await element.text()
  console.log(text)
  
  // 关闭工具
  await miniProgram.close()
}

runTest().catch(console.error)
```

### 平台化集成方案

为了在测试平台中集成微信小程序测试能力，需要设计统一的集成方案：

```python
class WeChatMiniProgramTester:
    """微信小程序测试器"""
    
    def __init__(self, config):
        self.config = config
        self.mini_program = None
        self.current_page = None
    
    async def launch(self, project_path, cli_path=None):
        """启动小程序测试环境"""
        try:
            # 初始化自动化工具
            self.mini_program = await automator.launch({
                'cliPath': cli_path or self.config.get('cli_path'),
                'projectPath': project_path,
                'port': self.config.get('port', 9420)
            })
            
            # 获取首页
            self.current_page = await self.mini_program.currentPage()
            return True
        except Exception as e:
            logger.error(f"Failed to launch mini program: {e}")
            return False
    
    async def navigate_to_page(self, page_path, params=None):
        """导航到指定页面"""
        try:
            if params:
                await self.mini_program.reLaunch(page_path, params)
            else:
                await self.mini_program.reLaunch(page_path)
            
            # 更新当前页面
            self.current_page = await self.mini_program.currentPage()
            return True
        except Exception as e:
            logger.error(f"Failed to navigate to page {page_path}: {e}")
            return False
    
    async def find_element(self, selector):
        """查找元素"""
        try:
            element = await self.current_page.$(selector)
            return element
        except Exception as e:
            logger.error(f"Failed to find element {selector}: {e}")
            return None
    
    async def tap_element(self, selector):
        """点击元素"""
        element = await self.find_element(selector)
        if element:
            try:
                await element.tap()
                return True
            except Exception as e:
                logger.error(f"Failed to tap element {selector}: {e}")
        return False
    
    async def input_text(self, selector, text):
        """输入文本"""
        element = await self.find_element(selector)
        if element:
            try:
                await element.input(text)
                return True
            except Exception as e:
                logger.error(f"Failed to input text to element {selector}: {e}")
        return False
    
    async def get_element_text(self, selector):
        """获取元素文本"""
        element = await self.find_element(selector)
        if element:
            try:
                return await element.text()
            except Exception as e:
                logger.error(f"Failed to get text from element {selector}: {e}")
        return None
    
    async def wait_for_element(self, selector, timeout=10000):
        """等待元素出现"""
        try:
            await self.current_page.waitForSelector(selector, {'timeout': timeout})
            return True
        except Exception as e:
            logger.error(f"Element {selector} not found within {timeout}ms: {e}")
            return False
    
    async def close(self):
        """关闭测试环境"""
        if self.mini_program:
            try:
                await self.mini_program.close()
                return True
            except Exception as e:
                logger.error(f"Failed to close mini program: {e}")
        return False
```

### 测试用例设计

针对微信小程序的特点，需要设计专门的测试用例：

```javascript
// 小程序测试用例示例
describe('用户登录功能测试', () => {
  let miniProgram
  let page
  
  beforeAll(async () => {
    // 启动小程序
    miniProgram = await automator.launch({
      projectPath: './miniprogram'
    })
  })
  
  afterAll(async () => {
    // 关闭小程序
    await miniProgram.close()
  })
  
  beforeEach(async () => {
    // 重新启动到首页
    await miniProgram.reLaunch('/pages/index/index')
    page = await miniProgram.currentPage()
  })
  
  test('正常登录流程', async () => {
    // 点击登录按钮
    const loginButton = await page.$('.login-button')
    await loginButton.tap()
    
    // 等待登录页面加载
    await page.waitForSelector('.login-form')
    
    // 输入用户名和密码
    const usernameInput = await page.$('.username-input')
    await usernameInput.input('testuser')
    
    const passwordInput = await page.$('.password-input')
    await passwordInput.input('testpass123')
    
    // 点击提交按钮
    const submitButton = await page.$('.submit-button')
    await submitButton.tap()
    
    // 验证登录成功
    await page.waitForSelector('.user-profile')
    const profileElement = await page.$('.user-profile')
    expect(profileElement).not.toBeNull()
  })
  
  test('空用户名登录', async () => {
    // 点击登录按钮
    const loginButton = await page.$('.login-button')
    await loginButton.tap()
    
    // 不输入用户名，直接提交
    const submitButton = await page.$('.submit-button')
    await submitButton.tap()
    
    // 验证错误提示
    await page.waitForSelector('.error-message')
    const errorElement = await page.$('.error-message')
    const errorText = await errorElement.text()
    expect(errorText).toContain('用户名不能为空')
  })
})
```

## 8.4.2 H5混合应用测试策略

### 混合应用架构分析

H5混合应用通常采用以下架构模式：

1. **WebView容器**：
   - 使用系统WebView组件加载H5页面
   - 原生代码与H5通过JavaScript Bridge通信

2. **混合渲染**：
   - 核心功能使用原生实现
   - 部分页面使用H5实现
   - 通过路由控制页面跳转

3. **数据交互**：
   - 原生向H5传递数据
   - H5调用原生功能
   - 双向数据同步

### WebView测试框架

针对H5混合应用，可以使用多种测试框架：

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class HybridAppTester:
    """混合应用测试器"""
    
    def __init__(self, platform='android'):
        self.platform = platform
        self.driver = None
        self.wait = None
    
    def setup_driver(self, capabilities=None):
        """设置测试驱动"""
        if self.platform == 'android':
            # Android混合应用测试
            desired_caps = {
                'platformName': 'Android',
                'platformVersion': '10',
                'deviceName': 'Android Emulator',
                'appPackage': 'com.example.hybridapp',
                'appActivity': '.MainActivity',
                'automationName': 'UiAutomator2',
                'chromedriverExecutable': '/path/to/chromedriver'
            }
        else:
            # iOS混合应用测试
            desired_caps = {
                'platformName': 'iOS',
                'platformVersion': '14.0',
                'deviceName': 'iPhone 11',
                'bundleId': 'com.example.hybridapp',
                'automationName': 'XCUITest',
                'webkitDebugProxyPort': 27753
            }
        
        # 合并自定义能力
        if capabilities:
            desired_caps.update(capabilities)
        
        # 初始化驱动
        self.driver = webdriver.Remote(
            'http://localhost:4723/wd/hub',
            desired_caps
        )
        
        # 设置等待器
        self.wait = WebDriverWait(self.driver, 10)
    
    def switch_to_webview(self, webview_name=None):
        """切换到WebView上下文"""
        try:
            contexts = self.driver.contexts
            webview_contexts = [ctx for ctx in contexts if 'WEBVIEW' in ctx]
            
            if webview_contexts:
                target_context = webview_contexts[0]
                if webview_name:
                    # 查找指定的WebView
                    for ctx in webview_contexts:
                        if webview_name in ctx:
                            target_context = ctx
                            break
                
                self.driver.switch_to.context(target_context)
                return True
        except Exception as e:
            logger.error(f"Failed to switch to webview: {e}")
        
        return False
    
    def switch_to_native(self):
        """切换到原生上下文"""
        try:
            self.driver.switch_to.context('NATIVE_APP')
            return True
        except Exception as e:
            logger.error(f"Failed to switch to native context: {e}")
            return False
    
    def find_web_element(self, locator):
        """查找Web元素"""
        try:
            self.switch_to_webview()
            element = self.wait.until(
                EC.presence_of_element_located(locator)
            )
            return element
        except Exception as e:
            logger.error(f"Failed to find web element: {e}")
            return None
    
    def find_native_element(self, locator):
        """查找原生元素"""
        try:
            self.switch_to_native()
            element = self.wait.until(
                EC.presence_of_element_located(locator)
            )
            return element
        except Exception as e:
            logger.error(f"Failed to find native element: {e}")
            return None
    
    def hybrid_action(self, action_type, **kwargs):
        """混合操作"""
        if action_type == 'web_click':
            element = self.find_web_element(kwargs.get('locator'))
            if element:
                element.click()
                return True
        elif action_type == 'native_click':
            element = self.find_native_element(kwargs.get('locator'))
            if element:
                element.click()
                return True
        elif action_type == 'web_input':
            element = self.find_web_element(kwargs.get('locator'))
            if element:
                element.clear()
                element.send_keys(kwargs.get('text', ''))
                return True
        elif action_type == 'bridge_call':
            # 调用JavaScript Bridge
            return self.call_bridge_function(
                kwargs.get('function_name'),
                kwargs.get('params', [])
            )
        
        return False
    
    def call_bridge_function(self, function_name, params=None):
        """调用JavaScript Bridge函数"""
        try:
            self.switch_to_webview()
            script = f"window.{function_name}({json.dumps(params or [])})"
            result = self.driver.execute_script(script)
            return result
        except Exception as e:
            logger.error(f"Failed to call bridge function {function_name}: {e}")
            return None
```

### 原生与H5交互测试

混合应用的核心在于原生与H5的交互，需要专门的测试策略：

```javascript
// JavaScript Bridge测试示例
describe('JavaScript Bridge功能测试', () => {
  let driver
  
  beforeAll(async () => {
    // 初始化Appium驱动
    const capabilities = {
      platformName: 'Android',
      appPackage: 'com.example.hybridapp',
      appActivity: '.MainActivity'
    }
    
    driver = await wdio.remote({
      host: 'localhost',
      port: 4723,
      capabilities
    })
  })
  
  afterAll(async () => {
    if (driver) {
      await driver.deleteSession()
    }
  })
  
  test('原生调用H5函数', async () => {
    // 切换到WebView上下文
    const contexts = await driver.getContexts()
    const webviewContext = contexts.find(ctx => ctx.includes('WEBVIEW'))
    await driver.switchContext(webviewContext)
    
    // 在H5中注册测试函数
    await driver.executeScript(`
      window.testCallback = function(data) {
        window.testResult = data
        return 'success'
      }
    `)
    
    // 切换回原生上下文
    await driver.switchContext('NATIVE_APP')
    
    // 通过原生代码调用H5函数
    const result = await driver.executeScript(`
      const webView = findViewById(R.id.webview)
      webView.evaluateJavascript("window.testCallback('test data')", null)
    `)
    
    // 验证调用结果
    await driver.switchContext(webviewContext)
    const testResult = await driver.executeScript('return window.testResult')
    expect(testResult).toBe('test data')
  })
  
  test('H5调用原生功能', async () => {
    // 切换到WebView上下文
    const contexts = await driver.getContexts()
    const webviewContext = contexts.find(ctx => ctx.includes('WEBVIEW'))
    await driver.switchContext(webviewContext)
    
    // 调用原生功能
    const result = await driver.executeScript(`
      return new Promise((resolve) => {
        if (window.NativeBridge) {
          window.NativeBridge.getUserInfo((userInfo) => {
            resolve(userInfo)
          })
        } else {
          resolve(null)
        }
      })
    `)
    
    // 验证返回结果
    expect(result).not.toBeNull()
    expect(result.username).toBeDefined()
  })
})
```

## 8.4.3 混合应用性能优化

### 资源加载优化

混合应用的性能瓶颈往往出现在资源加载阶段：

```python
class HybridAppPerformanceOptimizer:
    """混合应用性能优化器"""
    
    def __init__(self, driver):
        self.driver = driver
        self.performance_data = {}
    
    def analyze_resource_loading(self):
        """分析资源加载性能"""
        try:
            # 切换到WebView上下文
            self.driver.switch_to.context('WEBVIEW')
            
            # 获取资源加载信息
            performance_logs = self.driver.get_log('performance')
            
            # 分析关键指标
            resource_timing = self._parse_resource_timing(performance_logs)
            
            return {
                'total_resources': len(resource_timing),
                'slow_resources': self._find_slow_resources(resource_timing),
                'cache_hit_rate': self._calculate_cache_hit_rate(resource_timing)
            }
        except Exception as e:
            logger.error(f"Failed to analyze resource loading: {e}")
            return {}
    
    def _parse_resource_timing(self, logs):
        """解析资源时序数据"""
        resource_timing = []
        
        for log in logs:
            if log.get('message'):
                try:
                    message = json.loads(log['message'])
                    if (message.get('message', {}).get('method') == 'Network.responseReceived' or
                        message.get('message', {}).get('method') == 'Network.loadingFinished'):
                        resource_timing.append(message)
                except:
                    continue
        
        return resource_timing
    
    def _find_slow_resources(self, resource_timing, threshold=2000):
        """查找加载缓慢的资源"""
        slow_resources = []
        
        for resource in resource_timing:
            try:
                # 计算加载时间
                timing = resource.get('message', {}).get('params', {}).get('response', {}).get('timing', {})
                if timing:
                    load_time = timing.get('receiveHeadersEnd', 0) - timing.get('requestStart', 0)
                    if load_time > threshold:
                        slow_resources.append({
                            'url': resource.get('message', {}).get('params', {}).get('response', {}).get('url'),
                            'load_time': load_time
                        })
            except:
                continue
        
        return slow_resources
    
    def optimize_image_loading(self):
        """优化图片加载"""
        try:
            self.driver.switch_to.context('WEBVIEW')
            
            # 启用懒加载
            self.driver.execute_script("""
                // 为所有图片添加懒加载属性
                const images = document.querySelectorAll('img')
                images.forEach(img => {
                    if (!img.hasAttribute('loading')) {
                        img.setAttribute('loading', 'lazy')
                    }
                })
                
                // 启用Intersection Observer
                if ('IntersectionObserver' in window) {
                    const imageObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target
                                if (img.dataset.src) {
                                    img.src = img.dataset.src
                                    img.removeAttribute('data-src')
                                    observer.unobserve(img)
                                }
                            }
                        })
                    })
                    
                    document.querySelectorAll('img[data-src]').forEach(img => {
                        imageObserver.observe(img)
                    })
                }
            """)
            
            return True
        except Exception as e:
            logger.error(f"Failed to optimize image loading: {e}")
            return False
    
    def enable_resource_caching(self):
        """启用资源缓存"""
        try:
            // 配置HTTP缓存头
            self.driver.execute_script("""
                // 为静态资源添加缓存策略
                const staticResources = document.querySelectorAll(
                    'link[rel="stylesheet"], script[src], img[src]'
                )
                
                staticResources.forEach(resource => {
                    const url = resource.href || resource.src
                    if (url && (url.includes('.css') || url.includes('.js') || url.includes('.png'))) {
                        // 设置长期缓存
                        resource.setAttribute('data-cache-control', 'max-age=31536000')
                    }
                })
            """)
            
            return True
        except Exception as e:
            logger.error(f"Failed to enable resource caching: {e}")
            return False
```

### 渲染性能优化

渲染性能是影响用户体验的关键因素：

```javascript
// 渲染性能监控和优化
class RenderingPerformanceOptimizer {
  constructor() {
    this.observer = null
    this.longTasks = []
  }
  
  startMonitoring() {
    // 监控长任务
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask' && entry.duration > 50) {
            this.longTasks.push({
              startTime: entry.startTime,
              duration: entry.duration,
              attribution: entry.attribution
            })
            
            // 记录性能问题
            console.warn(`Long task detected: ${entry.duration}ms`, entry)
          }
        })
      })
      
      this.observer.observe({ entryTypes: ['longtask'] })
    }
    
    // 监控FPS
    this.monitorFPS()
  }
  
  monitorFPS() {
    let lastTime = performance.now()
    let frames = 0
    let fps = 0
    
    const measureFPS = () => {
      frames++
      const now = performance.now()
      
      if (now - lastTime >= 1000) {
        fps = Math.round((frames * 1000) / (now - lastTime))
        frames = 0
        lastTime = now
        
        // 如果FPS过低，记录警告
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}`)
        }
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    requestAnimationFrame(measureFPS)
  }
  
  optimizeRendering() {
    // 启用硬件加速
    this.enableHardwareAcceleration()
    
    // 优化重绘和重排
    this.optimizeReflowRepaint()
    
    // 使用虚拟滚动
    this.enableVirtualScrolling()
  }
  
  enableHardwareAcceleration() {
    // 为动画元素启用硬件加速
    const animatedElements = document.querySelectorAll('.animated, .transition')
    animatedElements.forEach(el => {
      el.style.transform = 'translateZ(0)'
      el.style.willChange = 'transform'
    })
  }
  
  optimizeReflowRepaint() {
    // 批量处理DOM操作
    const batchDOMOperations = (operations) => {
      requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment()
        operations.forEach(op => {
          if (op.type === 'appendChild') {
            fragment.appendChild(op.element)
          } else if (op.type === 'removeChild') {
            op.parent.removeChild(op.element)
          }
        })
        
        // 一次性添加到DOM
        if (fragment.childNodes.length > 0) {
          document.body.appendChild(fragment)
        }
      })
    }
    
    // 避免强制同步布局
    const readWriteBatch = {
      reads: [],
      writes: [],
      
      addRead(fn) {
        this.reads.push(fn)
      },
      
      addWrite(fn) {
        this.writes.push(fn)
      },
      
      execute() {
        this.reads.forEach(fn => fn())
        this.writes.forEach(fn => fn())
        
        this.reads = []
        this.writes = []
      }
    }
    
    // 使用批处理优化DOM操作
    window.batchDOM = batchDOMOperations
    window.readWriteBatch = readWriteBatch
  }
  
  enableVirtualScrolling() {
    // 为长列表启用虚拟滚动
    const enableVirtualScroll = (container, itemHeight, itemCount, renderItem) => {
      const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2
      const startIndex = Math.floor(container.scrollTop / itemHeight)
      const endIndex = Math.min(startIndex + visibleCount, itemCount)
      
      // 清空容器
      container.innerHTML = ''
      
      // 创建可见项
      for (let i = startIndex; i < endIndex; i++) {
        const item = renderItem(i)
        item.style.position = 'absolute'
        item.style.top = (i * itemHeight) + 'px'
        item.style.height = itemHeight + 'px'
        container.appendChild(item)
      }
      
      // 更新容器高度
      container.style.height = (itemCount * itemHeight) + 'px'
    }
    
    window.enableVirtualScroll = enableVirtualScroll
  }
}
```

### 内存管理优化

内存泄漏是混合应用常见的性能问题：

```python
class MemoryManagementOptimizer:
    """内存管理优化器"""
    
    def __init__(self, driver):
        self.driver = driver
    
    def monitor_memory_usage(self):
        """监控内存使用情况"""
        try:
            // 获取内存信息
            memory_info = self.driver.execute_script("""
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                }
            """)
            
            // 计算内存使用率
            if memory_info['totalJSHeapSize'] > 0:
                usage_rate = (memory_info['usedJSHeapSize'] / memory_info['totalJSHeapSize']) * 100
                memory_info['usageRate'] = usage_rate
            
            return memory_info
        except Exception as e:
            logger.error(f"Failed to monitor memory usage: {e}")
            return {}
    
    def detect_memory_leaks(self):
        """检测内存泄漏"""
        initial_memory = self.monitor_memory_usage()
        
        // 执行一系列操作
        self.perform_test_operations()
        
        // 等待垃圾回收
        time.sleep(2)
        self.driver.execute_script("if(window.gc) window.gc()")
        time.sleep(1)
        
        // 再次检查内存
        final_memory = self.monitor_memory_usage()
        
        // 分析内存变化
        if (initial_memory.get('usedJSHeapSize') and 
            final_memory.get('usedJSHeapSize')):
            memory_increase = final_memory['usedJSHeapSize'] - initial_memory['usedJSHeapSize']
            if memory_increase > 10 * 1024 * 1024:  // 10MB
                logger.warning(f"Potential memory leak detected: {memory_increase / 1024 / 1024:.2f}MB increase")
                return True
        
        return False
    
    def perform_test_operations(self):
        """执行测试操作以触发可能的内存泄漏"""
        try:
            // 导航到不同页面
            pages = ['/page1', '/page2', '/page3']
            for page in pages:
                self.driver.get(f"https://example.com{page}")
                time.sleep(1)
            
            // 执行一些交互操作
            for i in range(10):
                self.driver.execute_script(f"""
                    // 创建一些DOM元素
                    for(let j = 0; j < 100; j++) {{
                        const div = document.createElement('div')
                        div.innerHTML = 'Test element ' + j
                        document.body.appendChild(div)
                    }}
                    
                    // 创建一些事件监听器
                    const button = document.createElement('button')
                    button.addEventListener('click', function() {{
                        console.log('Button clicked')
                    }})
                    document.body.appendChild(button)
                """)
                time.sleep(0.1)
        except Exception as e:
            logger.error(f"Failed to perform test operations: {e}")
    
    def optimize_memory_usage(self):
        """优化内存使用"""
        try:
            self.driver.execute_script("""
                // 清理事件监听器
                const removeAllEventListeners = (element) => {
                    const clone = element.cloneNode(true)
                    element.parentNode.replaceChild(clone, element)
                }
                
                // 清理定时器
                const clearAllTimers = () => {
                    for(let i = 1; i < 1000; i++) {
                        clearInterval(i)
                        clearTimeout(i)
                    }
                }
                
                // 清理全局变量
                const clearGlobalVariables = () => {
                    const globalsToClear = ['tempData', 'cache', 'tempArray']
                    globalsToClear.forEach(name => {
                        if (window[name]) {
                            delete window[name]
                        }
                    })
                }
                
                // 执行清理
                clearAllTimers()
                clearGlobalVariables()
                
                // 触发垃圾回收
                if (window.gc) {
                    window.gc()
                }
            """)
            
            return True
        except Exception as e:
            logger.error(f"Failed to optimize memory usage: {e}")
            return False
```

## 8.4.4 混合应用安全测试

### 数据传输安全

混合应用中的数据传输安全至关重要：

```python
class HybridAppSecurityTester:
    """混合应用安全测试器"""
    
    def __init__(self, driver):
        self.driver = driver
        self.security_issues = []
    
    def test_data_transmission_security(self):
        """测试数据传输安全"""
        issues = []
        
        // 检查HTTPS使用
        https_check = self._check_https_usage()
        if not https_check['secure']:
            issues.append({
                'type': 'HTTPS',
                'severity': 'HIGH',
                'description': https_check['message']
            })
        
        // 检查敏感数据传输
        sensitive_data_check = self._check_sensitive_data_transmission()
        issues.extend(sensitive_data_check)
        
        // 检查API安全
        api_security_check = self._check_api_security()
        issues.extend(api_security_check)
        
        self.security_issues.extend(issues)
        return issues
    
    def _check_https_usage(self):
        """检查HTTPS使用情况"""
        try:
            current_url = self.driver.current_url
            if current_url.startswith('https://'):
                return {'secure': True, 'message': 'Using HTTPS'}
            else:
                return {'secure': False, 'message': f'Using insecure protocol: {current_url}'}
        except Exception as e:
            return {'secure': False, 'message': f'Failed to check protocol: {e}'}
    
    def _check_sensitive_data_transmission(self):
        """检查敏感数据传输"""
        issues = []
        
        try:
            // 监控网络请求
            logs = self.driver.get_log('performance')
            
            for log in logs:
                if log.get('message'):
                    try:
                        message = json.loads(log['message'])
                        if message.get('message', {}).get('method') == 'Network.requestWillBeSent':
                            request = message.get('message', {}).get('params', {}).get('request', {})
                            url = request.get('url', '')
                            headers = request.get('headers', {})
                            post_data = request.get('postData', '')
                            
                            // 检查是否传输敏感数据
                            sensitive_patterns = [
                                r'password=',
                                r'token=',
                                r'creditcard=',
                                r'ssn=',
                                r'phone=',
                            ]
                            
                            for pattern in sensitive_patterns:
                                if (re.search(pattern, url, re.IGNORECASE) or 
                                    re.search(pattern, post_data, re.IGNORECASE)):
                                    issues.append({
                                        'type': 'SENSITIVE_DATA',
                                        'severity': 'HIGH',
                                        'description': f'Sensitive data found in URL/POST data: {url}'
                                    })
                            
                            // 检查安全头
                            security_headers = [
                                'Strict-Transport-Security',
                                'X-Content-Type-Options',
                                'X-Frame-Options',
                                'Content-Security-Policy'
                            ]
                            
                            missing_headers = []
                            for header in security_headers:
                                if header not in headers:
                                    missing_headers.append(header)
                            
                            if missing_headers:
                                issues.append({
                                    'type': 'MISSING_SECURITY_HEADERS',
                                    'severity': 'MEDIUM',
                                    'description': f'Missing security headers: {", ".join(missing_headers)}'
                                })
                    except:
                        continue
        except Exception as e:
            logger.error(f"Failed to check sensitive data transmission: {e}")
        
        return issues
    
    def _check_api_security(self):
        """检查API安全"""
        issues = []
        
        try:
            // 检查API认证
            self.driver.execute_script("""
                // 检查是否所有API调用都有认证
                const originalFetch = window.fetch
                window.fetch = function(...args) {
                    window.apiCalls = window.apiCalls || []
                    window.apiCalls.push({
                        url: args[0],
                        options: args[1] || {}
                    })
                    return originalFetch.apply(this, args)
                }
                
                // 检查XMLHttpRequest
                const originalXHR = window.XMLHttpRequest
                window.XMLHttpRequest = function() {
                    const xhr = new originalXHR()
                    const originalOpen = xhr.open
                    xhr.open = function(...args) {
                        window.xhrCalls = window.xhrCalls || []
                        window.xhrCalls.push({
                            method: args[0],
                            url: args[1]
                        })
                        return originalOpen.apply(this, args)
                    }
                    return xhr
                }
            """)
            
            // 执行一些操作以触发API调用
            time.sleep(2)
            
            // 检查API调用安全性
            api_calls = self.driver.execute_script("return window.apiCalls || []")
            xhr_calls = self.driver.execute_script("return window.xhrCalls || []")
            
            all_calls = api_calls + xhr_calls
            for call in all_calls:
                url = call.get('url', '')
                // 检查是否为内部API且缺少认证
                if '/api/' in url and 'Authorization' not in str(call):
                    issues.append({
                        'type': 'API_AUTH',
                        'severity': 'HIGH',
                        'description': f'API call without authorization: {url}'
                    })
        except Exception as e:
            logger.error(f"Failed to check API security: {e}")
        
        return issues
```

### 本地存储安全

本地存储安全是混合应用安全的重要组成部分：

```javascript
// 本地存储安全测试
class LocalStorageSecurityTester {
  constructor() {
    this.storageTypes = ['localStorage', 'sessionStorage', 'cookies', 'indexedDB']
  }
  
  testLocalStorageSecurity() {
    const issues = []
    
    // 检查敏感数据存储
    const sensitiveDataIssues = this.checkSensitiveDataStorage()
    issues.push(...sensitiveDataIssues)
    
    // 检查存储配额
    const quotaIssues = this.checkStorageQuota()
    issues.push(...quotaIssues)
    
    // 检查存储加密
    const encryptionIssues = this.checkStorageEncryption()
    issues.push(...encryptionIssues)
    
    return issues
  }
  
  checkSensitiveDataStorage() {
    const issues = []
    const sensitivePatterns = [
      'password', 'token', 'credit', 'ssn', 'phone', 'email'
    ]
    
    // 检查localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const value = localStorage.getItem(key)
      
      for (const pattern of sensitivePatterns) {
        if (key.toLowerCase().includes(pattern) || 
            value.toLowerCase().includes(pattern)) {
          issues.push({
            type: 'LOCAL_STORAGE_SENSITIVE',
            severity: 'HIGH',
            description: `Sensitive data stored in localStorage: ${key}`
          })
        }
      }
    }
    
    // 检查sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      const value = sessionStorage.getItem(key)
      
      for (const pattern of sensitivePatterns) {
        if (key.toLowerCase().includes(pattern) || 
            value.toLowerCase().includes(pattern)) {
          issues.push({
            type: 'SESSION_STORAGE_SENSITIVE',
            severity: 'HIGH',
            description: `Sensitive data stored in sessionStorage: ${key}`
          })
        }
      }
    }
    
    // 检查Cookie
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=')
      
      for (const pattern of sensitivePatterns) {
        if (key.toLowerCase().includes(pattern) || 
            (value && value.toLowerCase().includes(pattern))) {
          issues.push({
            type: 'COOKIE_SENSITIVE',
            severity: 'HIGH',
            description: `Sensitive data stored in cookie: ${key}`,
            recommendation: 'Use secure, httpOnly cookies for sensitive data'
          })
        }
      }
    }
    
    return issues
  }
  
  checkStorageQuota() {
    const issues = []
    
    try {
      // 检查localStorage使用情况
      const usedSpace = JSON.stringify(localStorage).length
      const quota = 5 * 1024 * 1024 // 5MB typical quota
      const usagePercentage = (usedSpace / quota) * 100
      
      if (usagePercentage > 80) {
        issues.push({
          type: 'STORAGE_QUOTA',
          severity: 'MEDIUM',
          description: `LocalStorage usage high: ${usagePercentage.toFixed(1)}%`,
          recommendation: 'Consider implementing data cleanup strategies'
        })
      }
    } catch (e) {
      issues.push({
        type: 'STORAGE_CHECK_FAILED',
        severity: 'LOW',
        description: `Failed to check storage quota: ${e.message}`
      })
    }
    
    return issues
  }
  
  checkStorageEncryption() {
    const issues = []
    
    // 检查是否对敏感数据进行加密存储
    const storageKeys = Object.keys(localStorage)
    const unencryptedKeys = storageKeys.filter(key => {
      const value = localStorage.getItem(key)
      // 简单检查是否为明文敏感数据
      return (key.includes('password') || key.includes('token')) && 
             !value.startsWith('encrypted_')
    })
    
    if (unencryptedKeys.length > 0) {
      issues.push({
        type: 'STORAGE_ENCRYPTION',
        severity: 'HIGH',
        description: `Unencrypted sensitive data found: ${unencryptedKeys.join(', ')}`,
        recommendation: 'Implement client-side encryption for sensitive data'
      })
    }
    
    return issues
  }
  
  implementSecureStorage() {
    // 实现安全的存储方案
    const SecureStorage = {
      // 加密存储
      setItem(key, value) {
        try {
          const encryptedValue = this.encrypt(value)
          localStorage.setItem(key, encryptedValue)
        } catch (e) {
          console.error('Failed to set secure item:', e)
        }
      },
      
      // 解密读取
      getItem(key) {
        try {
          const encryptedValue = localStorage.getItem(key)
          if (encryptedValue) {
            return this.decrypt(encryptedValue)
          }
          return null
        } catch (e) {
          console.error('Failed to get secure item:', e)
          return null
        }
      },
      
      // 简单加密（实际应用中应使用更强的加密算法）
      encrypt(text) {
        // 注意：这只是一个示例，实际应用中应使用AES等强加密算法
        return btoa(encodeURIComponent(text))
      },
      
      // 解密
      decrypt(encryptedText) {
        try {
          return decodeURIComponent(atob(encryptedText))
        } catch (e) {
          return null
        }
      }
    }
    
    window.SecureStorage = SecureStorage
    return SecureStorage
  }
}

// 权限控制测试
class PermissionControlTester {
  constructor() {
    this.requiredPermissions = [
      'camera', 'microphone', 'geolocation', 
      'notifications', 'clipboard-read', 'clipboard-write'
    ]
  }
  
  testPermissionRequests() {
    const issues = []
    
    // 检查权限请求的合理性
    const permissionRequests = this.monitorPermissionRequests()
    
    for (const request of permissionRequests) {
      // 检查是否在用户操作后请求权限
      if (!request.userInitiated) {
        issues.push({
          type: 'PERMISSION_AUTO_REQUEST',
          severity: 'HIGH',
          description: `Permission requested without user interaction: ${request.permission}`,
          recommendation: 'Request permissions only after explicit user action'
        })
      }
      
      // 检查权限使用说明
      if (!request.hasExplanation) {
        issues.push({
          type: 'PERMISSION_NO_EXPLANATION',
          severity: 'MEDIUM',
          description: `Permission requested without explanation: ${request.permission}`,
          recommendation: 'Provide clear explanation before requesting permission'
        })
      }
    }
    
    return issues
  }
  
  monitorPermissionRequests() {
    // 监控权限请求
    const requests = []
    
    // 重写权限请求API
    const originalRequest = navigator.permissions ? navigator.permissions.request : null
    if (originalRequest) {
      navigator.permissions.request = function(descriptor) {
        requests.push({
          permission: descriptor.name,
          userInitiated: this.isUserInteraction(),
          hasExplanation: this.hasPermissionExplanation(descriptor.name),
          timestamp: Date.now()
        })
        
        return originalRequest.call(this, descriptor)
      }.bind(this)
    }
    
    return requests
  }
  
  isUserInteraction() {
    // 检查最近是否有用户交互
    const lastInteraction = sessionStorage.getItem('lastUserInteraction')
    if (lastInteraction) {
      const timeDiff = Date.now() - parseInt(lastInteraction)
      return timeDiff < 1000 // 1秒内视为用户交互
    }
    return false
  }
  
  hasPermissionExplanation(permission) {
    // 检查是否有权限使用说明
    const explanations = sessionStorage.getItem('permissionExplanations')
    if (explanations) {
      const explList = JSON.parse(explanations)
      return explList.includes(permission)
    }
    return false
  }
}
```

## 本节小结

本节详细介绍了微信小程序和H5混合应用的测试支持方案。通过集成官方测试框架、制定专门的测试策略、优化性能和加强安全测试，可以构建全面的混合应用测试体系。

通过本节的学习，读者应该能够：

1. 掌握微信小程序测试框架的集成方法和测试用例设计。
2. 理解H5混合应用的测试策略，包括WebView测试和原生与H5交互测试。
3. 学会混合应用的性能优化技术，包括资源加载优化、渲染优化和内存管理。
4. 了解混合应用的安全测试要点，包括数据传输安全、本地存储安全和权限控制。

在下一章中，我们将详细介绍性能测试平台建设，帮助读者构建高效的性能测试体系。