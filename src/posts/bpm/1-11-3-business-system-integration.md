---
title: 与业务系统集成: 从ERP、CRM、财务系统中获取数据或回写结果
date: 2025-09-06
categories: [BPM]
tags: [bpm, integration, erp, crm, finance, api, rest, soap]
published: true
---
# 与业务系统集成：从ERP、CRM、财务系统中获取数据或回写结果

在企业级BPM平台建设中，与业务系统的集成是实现端到端业务流程自动化的核心环节。通过与ERP、CRM、财务系统等核心业务系统的深度集成，BPM平台可以获取业务所需的数据，并将流程处理结果回写到相应的系统中，从而实现真正的业务闭环。

## 业务系统集成的核心价值

### 数据共享与一致性
通过与业务系统集成，可以实现数据的实时共享和一致性，避免在多个系统中维护重复数据，降低数据不一致的风险。

### 业务流程自动化
将BPM平台作为业务流程的中枢，连接各个业务系统，实现跨系统的业务流程自动化，提升整体业务效率。

### 决策支持
通过集成各业务系统的数据，为管理决策提供全面、准确的数据支持，提升决策的科学性。

## 业务系统集成架构设计

一个高效的业务系统集成架构需要支持多种集成协议和数据格式，确保与不同类型业务系统的无缝对接。

```java
// 业务系统集成服务
@Service
public class BusinessSystemIntegrationService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private IntegrationConfigRepository configRepository;
    
    @Autowired
    private IntegrationLogRepository logRepository;
    
    /**
     * 从ERP系统获取订单信息
     * @param orderId 订单ID
     * @return 订单信息
     */
    public OrderInfo getOrderFromERP(String orderId) {
        IntegrationLog log = createIntegrationLog("ERP", "GET_ORDER", orderId);
        
        try {
            // 获取ERP系统配置
            IntegrationConfig config = configRepository.findBySystemName("ERP");
            if (config == null) {
                throw new IntegrationException("ERP系统配置不存在");
            }
            
            // 构建请求URL
            String url = config.getBaseUrl() + "/api/orders/" + orderId;
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getAccessToken());
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // 发送请求
            ResponseEntity<OrderInfo> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, OrderInfo.class);
            
            OrderInfo orderInfo = response.getBody();
            
            // 记录成功日志
            log.setSuccess(true);
            log.setResponseData(objectMapper.writeValueAsString(orderInfo));
            logRepository.save(log);
            
            return orderInfo;
        } catch (Exception e) {
            log.setSuccess(false);
            log.setErrorMessage(e.getMessage());
            logRepository.save(log);
            
            log.error("从ERP获取订单信息失败 - 订单ID: {}", orderId, e);
            throw new IntegrationException("从ERP获取订单信息失败", e);
        }
    }
    
    /**
     * 向CRM系统更新客户信息
     * @param customerInfo 客户信息
     * @return 更新结果
     */
    public IntegrationResult updateCustomerInCRM(CustomerInfo customerInfo) {
        IntegrationLog log = createIntegrationLog("CRM", "UPDATE_CUSTOMER", customerInfo.getId());
        
        try {
            // 获取CRM系统配置
            IntegrationConfig config = configRepository.findBySystemName("CRM");
            if (config == null) {
                throw new IntegrationException("CRM系统配置不存在");
            }
            
            // 构建请求URL
            String url = config.getBaseUrl() + "/api/customers/" + customerInfo.getId();
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getAccessToken());
            headers.set("Content-Type", "application/json");
            
            // 构建请求体
            String requestBody = objectMapper.writeValueAsString(customerInfo);
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            // 发送请求
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.PUT, entity, String.class);
            
            // 记录成功日志
            log.setSuccess(true);
            log.setResponseData(response.getBody());
            logRepository.save(log);
            
            return new IntegrationResult(true, "客户信息更新成功");
        } catch (Exception e) {
            log.setSuccess(false);
            log.setErrorMessage(e.getMessage());
            logRepository.save(log);
            
            log.error("向CRM更新客户信息失败 - 客户ID: {}", customerInfo.getId(), e);
            return new IntegrationResult(false, "向CRM更新客户信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 向财务系统回写付款结果
     * @param paymentResult 付款结果
     * @return 回写结果
     */
    public IntegrationResult writeBackPaymentToFinance(PaymentResult paymentResult) {
        IntegrationLog log = createIntegrationLog("FINANCE", "WRITE_BACK_PAYMENT", paymentResult.getId());
        
        try {
            // 获取财务系统配置
            IntegrationConfig config = configRepository.findBySystemName("FINANCE");
            if (config == null) {
                throw new IntegrationException("财务系统配置不存在");
            }
            
            // 构建请求URL
            String url = config.getBaseUrl() + "/api/payments/writeback";
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getAccessToken());
            headers.set("Content-Type", "application/json");
            
            // 构建请求体
            String requestBody = objectMapper.writeValueAsString(paymentResult);
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            // 发送请求
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class);
            
            // 记录成功日志
            log.setSuccess(true);
            log.setResponseData(response.getBody());
            logRepository.save(log);
            
            return new IntegrationResult(true, "付款结果回写成功");
        } catch (Exception e) {
            log.setSuccess(false);
            log.setErrorMessage(e.getMessage());
            logRepository.save(log);
            
            log.error("向财务系统回写付款结果失败 - 付款ID: {}", paymentResult.getId(), e);
            return new IntegrationResult(false, "向财务系统回写付款结果失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建集成日志
     * @param systemName 系统名称
     * @param operation 操作类型
     * @param businessKey 业务键
     * @return 集成日志
     */
    private IntegrationLog createIntegrationLog(String systemName, String operation, String businessKey) {
        IntegrationLog log = new IntegrationLog();
        log.setId(UUID.randomUUID().toString());
        log.setSystemName(systemName);
        log.setOperation(operation);
        log.setBusinessKey(businessKey);
        log.setStartTime(new Date());
        logRepository.save(log);
        return log;
    }
}
```

## REST API集成实现

REST API是现代系统集成中最常用的协议之一，具有简单、灵活、易于调试等优点。

```java
// REST API集成处理器
@Component
public class RestApiIntegrationHandler {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private IntegrationConfigRepository configRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 发送REST请求
     * @param request 请求参数
     * @return 响应结果
     */
    public RestApiResponse sendRestRequest(RestApiRequest request) {
        RestApiResponse response = new RestApiResponse();
        response.setRequestTime(new Date());
        
        try {
            // 获取系统配置
            IntegrationConfig config = configRepository.findBySystemName(request.getSystemName());
            if (config == null) {
                throw new IntegrationException("系统配置不存在: " + request.getSystemName());
            }
            
            // 构建完整URL
            String url = buildFullUrl(config.getBaseUrl(), request.getEndpoint());
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            setAuthenticationHeaders(headers, config, request);
            setContentTypeHeader(headers, request.getContentType());
            
            // 设置自定义请求头
            if (request.getHeaders() != null) {
                request.getHeaders().forEach(headers::set);
            }
            
            // 构建请求体
            HttpEntity<?> entity = buildHttpEntity(request, headers);
            
            // 发送请求
            ResponseEntity<String> httpResponse = restTemplate.exchange(
                url, request.getMethod(), entity, String.class);
            
            // 处理响应
            response.setSuccess(true);
            response.setStatusCode(httpResponse.getStatusCodeValue());
            response.setResponseBody(httpResponse.getBody());
            response.setResponseHeaders(httpResponse.getHeaders().toSingleValueMap());
            response.setResponseTime(new Date());
            
            // 解析响应数据
            if (httpResponse.getBody() != null && request.getResponseType() != null) {
                Object parsedData = objectMapper.readValue(
                    httpResponse.getBody(), request.getResponseType());
                response.setParsedData(parsedData);
            }
            
        } catch (Exception e) {
            log.error("发送REST请求失败 - 系统: {}, 端点: {}", 
                request.getSystemName(), request.getEndpoint(), e);
            
            response.setSuccess(false);
            response.setErrorMessage(e.getMessage());
            response.setResponseTime(new Date());
        }
        
        return response;
    }
    
    /**
     * 构建完整URL
     * @param baseUrl 基础URL
     * @param endpoint 端点
     * @return 完整URL
     */
    private String buildFullUrl(String baseUrl, String endpoint) {
        if (baseUrl.endsWith("/") && endpoint.startsWith("/")) {
            return baseUrl + endpoint.substring(1);
        } else if (!baseUrl.endsWith("/") && !endpoint.startsWith("/")) {
            return baseUrl + "/" + endpoint;
        } else {
            return baseUrl + endpoint;
        }
    }
    
    /**
     * 设置认证头
     * @param headers 请求头
     * @param config 配置信息
     * @param request 请求参数
     */
    private void setAuthenticationHeaders(HttpHeaders headers, IntegrationConfig config, 
        RestApiRequest request) {
        
        if (request.getAuthType() == AuthType.BEARER_TOKEN) {
            headers.set("Authorization", "Bearer " + config.getAccessToken());
        } else if (request.getAuthType() == AuthType.BASIC_AUTH) {
            String auth = config.getUsername() + ":" + config.getPassword();
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);
        } else if (request.getAuthType() == AuthType.API_KEY) {
            headers.set(config.getApiKeyHeader(), config.getApiKey());
        }
    }
    
    /**
     * 设置内容类型头
     * @param headers 请求头
     * @param contentType 内容类型
     */
    private void setContentTypeHeader(HttpHeaders headers, ContentType contentType) {
        if (contentType == ContentType.JSON) {
            headers.set("Content-Type", "application/json");
        } else if (contentType == ContentType.XML) {
            headers.set("Content-Type", "application/xml");
        } else if (contentType == ContentType.FORM_URLENCODED) {
            headers.set("Content-Type", "application/x-www-form-urlencoded");
        }
    }
    
    /**
     * 构建HTTP实体
     * @param request 请求参数
     * @param headers 请求头
     * @return HTTP实体
     */
    private HttpEntity<?> buildHttpEntity(RestApiRequest request, HttpHeaders headers) {
        if (request.getData() != null) {
            if (request.getContentType() == ContentType.JSON) {
                try {
                    String jsonBody = objectMapper.writeValueAsString(request.getData());
                    return new HttpEntity<>(jsonBody, headers);
                } catch (Exception e) {
                    throw new IntegrationException("序列化请求数据失败", e);
                }
            } else if (request.getContentType() == ContentType.FORM_URLENCODED) {
                if (request.getData() instanceof Map) {
                    MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
                    ((Map<String, String>) request.getData()).forEach(formData::add);
                    return new HttpEntity<>(formData, headers);
                }
            }
        }
        
        return new HttpEntity<>(headers);
    }
    
    /**
     * 从ERP系统获取产品信息
     * @param productId 产品ID
     * @return 产品信息
     */
    public ProductInfo getProductFromERP(String productId) {
        RestApiRequest request = new RestApiRequest();
        request.setSystemName("ERP");
        request.setEndpoint("/api/products/" + productId);
        request.setMethod(HttpMethod.GET);
        request.setAuthType(AuthType.BEARER_TOKEN);
        request.setContentType(ContentType.JSON);
        request.setResponseType(ProductInfo.class);
        
        RestApiResponse response = sendRestRequest(request);
        
        if (response.isSuccess() && response.getParsedData() != null) {
            return (ProductInfo) response.getParsedData();
        } else {
            throw new IntegrationException("获取产品信息失败: " + response.getErrorMessage());
        }
    }
    
    /**
     * 向CRM系统创建销售机会
     * @param opportunity 销售机会
     * @return 创建结果
     */
    public IntegrationResult createOpportunityInCRM(Opportunity opportunity) {
        RestApiRequest request = new RestApiRequest();
        request.setSystemName("CRM");
        request.setEndpoint("/api/opportunities");
        request.setMethod(HttpMethod.POST);
        request.setAuthType(AuthType.BEARER_TOKEN);
        request.setContentType(ContentType.JSON);
        request.setData(opportunity);
        
        RestApiResponse response = sendRestRequest(request);
        
        if (response.isSuccess()) {
            return new IntegrationResult(true, "销售机会创建成功");
        } else {
            return new IntegrationResult(false, "销售机会创建失败: " + response.getErrorMessage());
        }
    }
}
```

## SOAP WebService集成实现

对于一些传统的企业系统，可能仍然使用SOAP WebService作为集成接口。

```java
// SOAP WebService集成处理器
@Component
public class SoapWebServiceIntegrationHandler {
    
    @Autowired
    private IntegrationConfigRepository configRepository;
    
    /**
     * 调用SOAP服务
     * @param request SOAP请求
     * @return SOAP响应
     */
    public SoapResponse callSoapService(SoapRequest request) {
        SoapResponse response = new SoapResponse();
        response.setRequestTime(new Date());
        
        try {
            // 获取系统配置
            IntegrationConfig config = configRepository.findBySystemName(request.getSystemName());
            if (config == null) {
                throw new IntegrationException("系统配置不存在: " + request.getSystemName());
            }
            
            // 创建SOAP连接
            SOAPConnectionFactory soapConnectionFactory = SOAPConnectionFactory.newInstance();
            SOAPConnection soapConnection = soapConnectionFactory.createConnection();
            
            // 创建SOAP消息
            MessageFactory messageFactory = MessageFactory.newInstance();
            SOAPMessage soapMessage = messageFactory.createMessage();
            
            // 设置SOAP头
            setSoapHeaders(soapMessage, config, request);
            
            // 设置SOAP体
            setSoapBody(soapMessage, request);
            
            // 发送SOAP消息
            SOAPMessage soapResponse = soapConnection.call(soapMessage, config.getSoapEndpoint());
            
            // 处理响应
            response.setSuccess(true);
            response.setResponseTime(new Date());
            response.setSoapMessage(soapResponse);
            
            // 解析响应数据
            Object parsedData = parseSoapResponse(soapResponse, request.getResponseClass());
            response.setParsedData(parsedData);
            
            soapConnection.close();
            
        } catch (Exception e) {
            log.error("调用SOAP服务失败 - 系统: {}, 操作: {}", 
                request.getSystemName(), request.getOperation(), e);
            
            response.setSuccess(false);
            response.setErrorMessage(e.getMessage());
            response.setResponseTime(new Date());
        }
        
        return response;
    }
    
    /**
     * 设置SOAP头
     * @param soapMessage SOAP消息
     * @param config 配置信息
     * @param request 请求参数
     * @throws SOAPException SOAP异常
     */
    private void setSoapHeaders(SOAPMessage soapMessage, IntegrationConfig config, 
        SoapRequest request) throws SOAPException {
        
        SOAPEnvelope envelope = soapMessage.getSOAPPart().getEnvelope();
        SOAPHeader header = envelope.getHeader();
        
        if (header == null) {
            header = envelope.addHeader();
        }
        
        // 添加认证信息
        if (config.getAuthType() == AuthType.BASIC_AUTH) {
            SOAPHeaderElement authHeader = header.addHeaderElement(
                envelope.createName("Authorization", "auth", "http://schemas.xmlsoap.org/ws/2002/12/secext"));
            String auth = config.getUsername() + ":" + config.getPassword();
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            authHeader.setValue("Basic " + encodedAuth);
        }
    }
    
    /**
     * 设置SOAP体
     * @param soapMessage SOAP消息
     * @param request 请求参数
     * @throws SOAPException SOAP异常
     */
    private void setSoapBody(SOAPMessage soapMessage, SoapRequest request) throws SOAPException {
        SOAPEnvelope envelope = soapMessage.getSOAPPart().getEnvelope();
        SOAPBody body = envelope.getBody();
        
        // 创建操作元素
        Name operationName = envelope.createName(request.getOperation(), 
            request.getNamespacePrefix(), request.getNamespaceUri());
        SOAPBodyElement operationElement = body.addBodyElement(operationName);
        
        // 添加参数
        if (request.getParameters() != null) {
            for (Map.Entry<String, Object> param : request.getParameters().entrySet()) {
                SOAPElement paramElement = operationElement.addChildElement(param.getKey());
                paramElement.setValue(String.valueOf(param.getValue()));
            }
        }
    }
    
    /**
     * 解析SOAP响应
     * @param soapResponse SOAP响应
     * @param responseClass 响应类
     * @return 解析后的数据
     * @throws SOAPException SOAP异常
     */
    private Object parseSoapResponse(SOAPMessage soapResponse, Class<?> responseClass) 
        throws SOAPException {
        
        SOAPBody body = soapResponse.getSOAPBody();
        
        if (body.hasFault()) {
            SOAPFault fault = body.getFault();
            throw new IntegrationException("SOAP调用失败: " + fault.getFaultString());
        }
        
        // 这里可以根据具体需求解析SOAP响应
        // 简化处理，返回SOAP消息本身
        return soapResponse;
    }
    
    /**
     * 从财务系统获取发票信息
     * @param invoiceId 发票ID
     * @return 发票信息
     */
    public InvoiceInfo getInvoiceFromFinanceSystem(String invoiceId) {
        SoapRequest request = new SoapRequest();
        request.setSystemName("FINANCE");
        request.setOperation("GetInvoice");
        request.setNamespacePrefix("fin");
        request.setNamespaceUri("http://finance.company.com/webservice");
        
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("invoiceId", invoiceId);
        request.setParameters(parameters);
        request.setResponseClass(InvoiceInfo.class);
        
        SoapResponse response = callSoapService(request);
        
        if (response.isSuccess() && response.getParsedData() != null) {
            return (InvoiceInfo) response.getParsedData();
        } else {
            throw new IntegrationException("获取发票信息失败: " + response.getErrorMessage());
        }
    }
}
```

## 数据格式转换与映射

在系统集成过程中，不同系统间的数据格式可能存在差异，需要进行转换和映射。

```java
// 数据转换服务
@Service
public class DataTransformationService {
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 转换订单数据格式
     * @param erpOrder ERP订单
     * @return BPM订单
     */
    public BpmOrder convertErpOrderToBpmOrder(ErpOrder erpOrder) {
        BpmOrder bpmOrder = new BpmOrder();
        bpmOrder.setId(erpOrder.getOrderId());
        bpmOrder.setOrderNumber(erpOrder.getOrderNo());
        bpmOrder.setCustomerId(erpOrder.getCustomerId());
        bpmOrder.setCustomerName(erpOrder.getCustomerName());
        bpmOrder.setOrderDate(erpOrder.getCreateDate());
        bpmOrder.setTotalAmount(erpOrder.getTotalAmount());
        bpmOrder.setStatus(mapErpOrderStatusToBpm(erpOrder.getStatus()));
        
        // 转换订单项
        if (erpOrder.getOrderItems() != null) {
            List<BpmOrderItem> bpmItems = erpOrder.getOrderItems().stream()
                .map(this::convertErpOrderItemToBpmOrderItem)
                .collect(Collectors.toList());
            bpmOrder.setItems(bpmItems);
        }
        
        return bpmOrder;
    }
    
    /**
     * 映射ERP订单状态到BPM订单状态
     * @param erpStatus ERP状态
     * @return BPM状态
     */
    private OrderStatus mapErpOrderStatusToBpm(String erpStatus) {
        switch (erpStatus.toUpperCase()) {
            case "CREATED":
                return OrderStatus.NEW;
            case "CONFIRMED":
                return OrderStatus.CONFIRMED;
            case "PROCESSING":
                return OrderStatus.IN_PROGRESS;
            case "SHIPPED":
                return OrderStatus.SHIPPED;
            case "DELIVERED":
                return OrderStatus.DELIVERED;
            case "CANCELLED":
                return OrderStatus.CANCELLED;
            default:
                return OrderStatus.UNKNOWN;
        }
    }
    
    /**
     * 转换订单项
     * @param erpItem ERP订单项
     * @return BPM订单项
     */
    private BpmOrderItem convertErpOrderItemToBpmOrderItem(ErpOrderItem erpItem) {
        BpmOrderItem bpmItem = new BpmOrderItem();
        bpmItem.setId(erpItem.getItemId());
        bpmItem.setProductId(erpItem.getProductId());
        bpmItem.setProductName(erpItem.getProductName());
        bpmItem.setQuantity(erpItem.getQuantity());
        bpmItem.setUnitPrice(erpItem.getUnitPrice());
        bpmItem.setTotalPrice(erpItem.getTotalPrice());
        return bpmItem;
    }
    
    /**
     * 转换客户数据格式
     * @param crmCustomer CRM客户
     * @return BPM客户
     */
    public BpmCustomer convertCrmCustomerToBpmCustomer(CrmCustomer crmCustomer) {
        BpmCustomer bpmCustomer = new BpmCustomer();
        bpmCustomer.setId(crmCustomer.getCustomerId());
        bpmCustomer.setName(crmCustomer.getCustomerName());
        bpmCustomer.setEmail(crmCustomer.getEmail());
        bpmCustomer.setPhone(crmCustomer.getPhone());
        bpmCustomer.setAddress(crmCustomer.getAddress());
        bpmCustomer.setIndustry(crmCustomer.getIndustry());
        bpmCustomer.setCustomerLevel(mapCrmCustomerLevelToBpm(crmCustomer.getLevel()));
        bpmCustomer.setCreateDate(crmCustomer.getCreateDate());
        return bpmCustomer;
    }
    
    /**
     * 映射CRM客户等级到BPM客户等级
     * @param crmLevel CRM等级
     * @return BPM等级
     */
    private CustomerLevel mapCrmCustomerLevelToBpm(String crmLevel) {
        switch (crmLevel.toUpperCase()) {
            case "VIP":
                return CustomerLevel.VIP;
            case "PREMIUM":
                return CustomerLevel.PREMIUM;
            case "STANDARD":
                return CustomerLevel.STANDARD;
            case "BASIC":
                return CustomerLevel.BASIC;
            default:
                return CustomerLevel.UNKNOWN;
        }
    }
    
    /**
     * 转换XML到JSON
     * @param xml XML字符串
     * @return JSON字符串
     */
    public String convertXmlToJson(String xml) {
        try {
            // 使用Jackson XML模块进行转换
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode jsonNode = xmlMapper.readTree(xml);
            
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(jsonNode);
        } catch (Exception e) {
            throw new IntegrationException("XML到JSON转换失败", e);
        }
    }
    
    /**
     * 转换JSON到XML
     * @param json JSON字符串
     * @return XML字符串
     */
    public String convertJsonToXml(String json) {
        try {
            // 使用Jackson进行转换
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(json);
            
            XmlMapper xmlMapper = new XmlMapper();
            return xmlMapper.writeValueAsString(jsonNode);
        } catch (Exception e) {
            throw new IntegrationException("JSON到XML转换失败", e);
        }
    }
}
```

## 集成监控与错误处理

为了确保业务系统集成的稳定性和可靠性，需要建立完善的监控和错误处理机制。

```java
// 集成监控服务
@Service
public class IntegrationMonitoringService {
    
    @Autowired
    private IntegrationLogRepository logRepository;
    
    @Autowired
    private AlertService alertService;
    
    @Autowired
    private MetricsService metricsService;
    
    /**
     * 监控集成性能
     */
    @Scheduled(fixedRate = 300000) // 每5分钟执行一次
    public void monitorIntegrationPerformance() {
        try {
            Date fiveMinutesAgo = new Date(System.currentTimeMillis() - 300000);
            
            // 统计最近5分钟的集成情况
            List<IntegrationLog> recentLogs = logRepository.findByStartTimeAfter(fiveMinutesAgo);
            
            if (recentLogs.isEmpty()) {
                return;
            }
            
            // 计算成功率
            long successCount = recentLogs.stream().filter(IntegrationLog::isSuccess).count();
            double successRate = (double) successCount / recentLogs.size() * 100;
            
            // 记录指标
            metricsService.recordIntegrationSuccessRate(successRate);
            
            // 检查是否需要告警
            if (successRate < 95.0) { // 成功率低于95%时告警
                sendIntegrationAlert("集成成功率下降", 
                    String.format("最近5分钟集成成功率: %.2f%%，低于阈值95%%", successRate));
            }
            
            // 计算平均响应时间
            double avgResponseTime = recentLogs.stream()
                .filter(log -> log.getResponseTime() != null && log.getStartTime() != null)
                .mapToLong(log -> log.getResponseTime().getTime() - log.getStartTime().getTime())
                .average()
                .orElse(0.0);
            
            // 记录响应时间指标
            metricsService.recordIntegrationAvgResponseTime(avgResponseTime);
            
            // 检查响应时间是否异常
            if (avgResponseTime > 5000) { // 平均响应时间超过5秒时告警
                sendIntegrationAlert("集成响应时间过长", 
                    String.format("最近5分钟平均响应时间: %.2f毫秒，超过阈值5000毫秒", avgResponseTime));
            }
            
        } catch (Exception e) {
            log.error("监控集成性能时发生错误", e);
        }
    }
    
    /**
     * 发送集成告警
     * @param title 告警标题
     * @param message 告警消息
     */
    private void sendIntegrationAlert(String title, String message) {
        Alert alert = new Alert();
        alert.setType(AlertType.INTEGRATION_ISSUE);
        alert.setLevel(AlertLevel.WARNING);
        alert.setTitle(title);
        alert.setMessage(message);
        alert.setTimestamp(new Date());
        
        alertService.sendAlert(alert);
    }
    
    /**
     * 重试失败的集成请求
     */
    @Scheduled(fixedRate = 600000) // 每10分钟执行一次
    public void retryFailedIntegrations() {
        try {
            Date oneHourAgo = new Date(System.currentTimeMillis() - 3600000);
            
            // 获取最近1小时内失败且重试次数小于3次的集成日志
            List<IntegrationLog> failedLogs = logRepository
                .findFailedLogsByStartTimeAfterAndRetryCountLessThan(oneHourAgo, 3);
            
            for (IntegrationLog log : failedLogs) {
                try {
                    // 根据日志类型重新执行集成请求
                    retryIntegrationRequest(log);
                    
                    // 更新重试次数
                    log.setRetryCount(log.getRetryCount() + 1);
                    logRepository.save(log);
                } catch (Exception e) {
                    log.error("重试集成请求失败 - 日志ID: {}", log.getId(), e);
                }
            }
        } catch (Exception e) {
            log.error("重试失败的集成请求时发生错误", e);
        }
    }
    
    /**
     * 重试集成请求
     * @param log 集成日志
     */
    private void retryIntegrationRequest(IntegrationLog log) {
        // 根据日志信息重新构建请求并执行
        // 这里简化处理，实际实现需要根据具体业务逻辑进行
        log.info("重试集成请求 - 系统: {}, 操作: {}, 业务键: {}", 
            log.getSystemName(), log.getOperation(), log.getBusinessKey());
    }
}
```

## 最佳实践与注意事项

在实现业务系统集成时，需要注意以下最佳实践：

### 1. 安全性保障
- 使用HTTPS加密传输敏感数据
- 实施严格的认证和授权机制
- 对敏感信息进行加密存储和传输

### 2. 性能优化
- 合理设置连接池大小和超时时间
- 对频繁访问的数据进行缓存
- 实施异步处理机制避免阻塞

### 3. 容错处理
- 建立完善的错误处理和重试机制
- 实施熔断机制防止故障扩散
- 提供降级方案确保核心功能可用

### 4. 监控与告警
- 建立全面的集成监控体系
- 设置合理的性能阈值和告警机制
- 记录详细的集成日志便于问题排查

### 5. 数据一致性
- 实施事务性操作确保数据一致性
- 建立数据校验机制防止异常数据
- 定期进行数据一致性检查和修复

通过合理设计和实现业务系统集成，可以将BPM平台与企业核心业务系统无缝连接，实现端到端的业务流程自动化，为企业创造真正的业务价值。