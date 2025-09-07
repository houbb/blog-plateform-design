import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as i,d as a,o as l}from"./app-BzRS7AVz.js";const e={};function p(t,s){return l(),i("div",null,[...s[0]||(s[0]=[a(`<h1 id="生成改进看板-量化分析故障-驱动系统性优化" tabindex="-1"><a class="header-anchor" href="#生成改进看板-量化分析故障-驱动系统性优化"><span>生成改进看板：量化分析故障，驱动系统性优化</span></a></h1><p>在现代运维体系中，仅仅解决单个故障是远远不够的。真正有价值的运维实践是能够从历史故障中提取洞察，量化分析问题模式，并驱动系统性的优化改进。改进看板作为连接故障复盘与持续改进的重要工具，能够帮助团队可视化问题趋势、跟踪改进进度、评估优化效果。</p><h2 id="引言" tabindex="-1"><a class="header-anchor" href="#引言"><span>引言</span></a></h2><p>改进看板是将故障复盘中获得的经验教训转化为可量化、可跟踪、可评估的改进措施的重要载体。它具有以下核心价值：</p><ol><li><strong>可视化改进过程</strong>：将抽象的改进措施转化为可视化的进度跟踪</li><li><strong>量化改进效果</strong>：通过数据指标评估改进措施的实际效果</li><li><strong>驱动系统优化</strong>：识别系统性问题，推动架构和流程的优化</li><li><strong>促进知识共享</strong>：让团队成员了解改进进展和成果</li></ol><p>改进看板的设计应遵循以下原则：</p><ul><li><strong>数据驱动</strong>：基于客观数据而非主观判断</li><li><strong>实时更新</strong>：反映最新的改进状态和效果</li><li><strong>易于理解</strong>：使用直观的可视化方式呈现信息</li><li><strong>行动导向</strong>：明确下一步的改进方向和行动计划</li></ul><h2 id="改进看板的核心组件" tabindex="-1"><a class="header-anchor" href="#改进看板的核心组件"><span>改进看板的核心组件</span></a></h2><h3 id="_1-故障趋势分析面板" tabindex="-1"><a class="header-anchor" href="#_1-故障趋势分析面板"><span>1. 故障趋势分析面板</span></a></h3><p>故障趋势分析是改进看板的核心组件之一，它帮助团队识别故障模式和发展趋势。</p><div class="language-python line-numbers-mode" data-highlighter="shiki" data-ext="python" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-python"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> FaultTrendAnalyzer</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> __init__</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> data_source</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.data_source </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> data_source</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.metrics </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> analyze_trend</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> time_range</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;30d&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;分析故障趋势&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 获取故障数据</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        incidents </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.data_source.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">get_incidents</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(time_range)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 计算关键指标</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        trend_metrics </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;total_incidents&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incidents),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;mttr_trend&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">calculate_mttr_trend</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incidents),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;incident_frequency&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">calculate_frequency</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incidents),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;severity_distribution&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">analyze_severity</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incidents),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;repeat_incidents&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">find_repeat_incidents</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incidents)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> trend_metrics</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> calculate_mttr_trend</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> incidents</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;计算MTTR趋势&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        mttr_data </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> []</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incidents:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            mttr_data.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">({</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;date&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: incident.created_at.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">date</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;mttr&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: incident.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">get_mttr</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            })</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 计算趋势线</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        trend_line </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">calculate_trend_line</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(mttr_data)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;data&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: mttr_data,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;trend&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: trend_line,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;improvement_rate&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">calculate_improvement_rate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(mttr_data)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> analyze_severity</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> incidents</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;分析故障严重性分布&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        severity_count </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {}</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incidents:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            severity </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident.severity</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            severity_count[severity] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> severity_count.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">get</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(severity, </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">+</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 1</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> severity_count</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> find_repeat_incidents</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> incidents</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;识别重复故障&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        incident_groups </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        repeat_incidents </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> []</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incidents:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            key </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> f</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">{</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">incident.service</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">}</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">:</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">{</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">incident.error_type</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">}</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> key </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">not</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident_groups:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                incident_groups[key] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> []</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            incident_groups[key].</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incident)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 找出重复发生的故障</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> key, group </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident_groups.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">():</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            if</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(group) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">&gt;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                repeat_incidents.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">extend</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(group)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(repeat_incidents),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;percentage&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(repeat_incidents) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">/</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incidents) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">*</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 100</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;details&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: repeat_incidents</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-根因分类统计面板" tabindex="-1"><a class="header-anchor" href="#_2-根因分类统计面板"><span>2. 根因分类统计面板</span></a></h3><p>根因分类统计帮助团队识别最常见的故障原因，从而有针对性地进行改进。</p><div class="language-python line-numbers-mode" data-highlighter="shiki" data-ext="python" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-python"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> RootCauseAnalyzer</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> __init__</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> incident_repository</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.repository </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident_repository</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.category_mapping </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">load_category_mapping</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> analyze_root_causes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> time_range</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;90d&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;分析根因分类&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        incidents </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.repository.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">get_incidents_with_root_causes</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(time_range)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 按根因分类统计</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        category_stats </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {}</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incidents:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            category </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">categorize_root_cause</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incident.root_cause)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> category </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">not</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> category_stats:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                category_stats[category] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                    &#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                    &#39;incidents&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: [],</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                    &#39;mttr_sum&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                    &#39;business_impact&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">0</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            category_stats[category][</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">+=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 1</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            category_stats[category][</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;incidents&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">].</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(incident)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            category_stats[category][</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;mttr_sum&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">+=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">get_mttr</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            category_stats[category][</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;business_impact&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">+=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> incident.business_impact</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 计算统计数据</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> category, stats </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> category_stats.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">():</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;avg_mttr&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;mttr_sum&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">/</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">&gt;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> else</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;avg_business_impact&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;business_impact&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">/</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">&gt;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> else</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> category_stats</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> categorize_root_cause</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> root_cause</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;将根因分类&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 根据预定义的映射规则进行分类</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> pattern, category </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.category_mapping.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">():</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> pattern </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> root_cause.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">lower</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">():</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">                return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> category</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> &#39;其他&#39;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> load_category_mapping</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;加载根因分类映射规则&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;network&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;网络问题&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;database&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;数据库问题&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;memory&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;内存问题&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;cpu&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;CPU问题&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;disk&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;磁盘问题&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;config&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;配置问题&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;code&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;代码缺陷&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;third-party&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;第三方服务问题&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;human&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;人为操作失误&#39;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> generate_recommendations</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> category_stats</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;生成改进建议&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        recommendations </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> []</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 识别高频根因</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        sorted_categories </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> sorted</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(category_stats.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(), </span></span>
<span class="line"><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic;">                                 key</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">lambda</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> x</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: x[</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">1</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">][</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">], </span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E06C75;--shiki-dark-font-style:italic;">reverse</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">True</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> category, stats </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> sorted_categories[:</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">3</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]:  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 前3个高频根因</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            recommendation </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;category&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: category,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">],</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;priority&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">calculate_priority</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(stats),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;suggestions&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">get_suggestions_for_category</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(category)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            recommendations.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(recommendation)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> recommendations</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> calculate_priority</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> stats</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;计算改进优先级&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 综合考虑故障次数、平均MTTR和业务影响</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        frequency_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">*</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 10</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        mttr_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;avg_mttr&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">/</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 60</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">  # 转换为分钟</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        impact_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> stats[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;avg_business_impact&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        total_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> frequency_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">+</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> mttr_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">+</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> impact_score</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> total_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">&gt;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 100</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            return</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> &#39;高&#39;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        elif</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> total_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">&gt;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 50</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            return</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> &#39;中&#39;</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        else</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            return</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> &#39;低&#39;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-改进行动跟踪面板" tabindex="-1"><a class="header-anchor" href="#_3-改进行动跟踪面板"><span>3. 改进行动跟踪面板</span></a></h3><p>改进行动跟踪面板用于监控改进措施的执行状态和效果。</p><div class="language-python line-numbers-mode" data-highlighter="shiki" data-ext="python" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-python"><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> ImprovementTracker</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> __init__</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> action_item_repository</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.repository </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> action_item_repository</span></span>
<span class="line"><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">        self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.status_colors </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;待办&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;#cccccc&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;进行中&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;#ffcc00&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;已完成&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;#00cc66&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;已取消&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;#ff3300&#39;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> track_improvements</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;跟踪改进措施&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        action_items </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.repository.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">get_all_action_items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 按状态分组</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        status_groups </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {}</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> action_items:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            status </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item.status</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> status </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">not</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> status_groups:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                status_groups[status] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> []</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            status_groups[status].</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(item)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 计算统计数据</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        tracking_data </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;total&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(action_items),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;by_status&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: {},</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;completion_rate&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">calculate_completion_rate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(action_items),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;overdue_items&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">find_overdue_items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(action_items),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;effectiveness&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">evaluate_effectiveness</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(action_items)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> status, items </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> status_groups.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">():</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            tracking_data[</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;by_status&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">][status] </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(items),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;percentage&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(items) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">/</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(action_items) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">*</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 100</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">                &#39;color&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.status_colors.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">get</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(status, </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;#666666&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> tracking_data</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> calculate_completion_rate</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> action_items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;计算完成率&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        completed </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> sum</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">1</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> action_items </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item.status </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">==</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> &#39;已完成&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> completed </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">/</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(action_items) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">*</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 100</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> action_items </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">else</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> find_overdue_items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> action_items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;查找逾期项目&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        overdue </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> []</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        current_time </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> datetime.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">now</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">()</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> action_items:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item.due_date </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">and</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item.due_date </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">&lt;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> current_time </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">and</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item.status </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">!=</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> &#39;已完成&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">                overdue.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(item)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> overdue</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> evaluate_effectiveness</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> action_items</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;评估改进效果&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        completed_items </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> [item </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> action_items </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item.status </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">==</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> &#39;已完成&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">]</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        if</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> not</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> completed_items:</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;score&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">0</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">, </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;details&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&#39;暂无完成的改进项&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 评估已完成改进项的效果</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        effectiveness_scores </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> []</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> completed_items:</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">calculate_item_effectiveness</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(item)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">            effectiveness_scores.</span><span style="--shiki-light:#383A42;--shiki-dark:#61AFEF;">append</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(score)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        avg_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> sum</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(effectiveness_scores) </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">/</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(effectiveness_scores)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;score&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: avg_score,</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;total_completed&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(completed_items),</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">            &#39;high_impact_count&#39;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">: </span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;">len</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">([s </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">for</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> s </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">in</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> effectiveness_scores </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> s </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">&gt;</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 80</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">])</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    def</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> calculate_item_effectiveness</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#E5C07B;--shiki-dark-font-style:italic;">self</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">,</span><span style="--shiki-light:#986801;--shiki-light-font-style:inherit;--shiki-dark:#D19A66;--shiki-dark-font-style:italic;"> item</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">):</span></span>
<span class="line"><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">        &quot;&quot;&quot;计算单个改进项的效果得分&quot;&quot;&quot;</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 基于多个维度评估效果</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        impact_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item.impact_score </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">or</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 50</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">  # 预期影响 (0-100)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        actual_result </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> item.actual_result </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">or</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0</span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">  # 实际结果 (0-100)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        effort_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 100</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> -</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (item.effort_level </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">or</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 50</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 努力程度反向评分</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        </span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;">        # 加权计算总分</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        total_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (impact_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">*</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0.4</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> actual_result </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">*</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0.4</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> +</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> effort_score </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">*</span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;"> 0.2</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        return</span><span style="--shiki-light:#0184BC;--shiki-dark:#56B6C2;"> min</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(total_score, </span><span style="--shiki-light:#986801;--shiki-dark:#D19A66;">100</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)  </span><span style="--shiki-light:#A0A1A7;--shiki-light-font-style:italic;--shiki-dark:#7F848E;--shiki-dark-font-style:italic;"># 确保不超过100</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="改进看板的设计与实现" tabindex="-1"><a class="header-anchor" href="#改进看板的设计与实现"><span>改进看板的设计与实现</span></a></h2><h3 id="_1-看板架构设计" tabindex="-1"><a class="header-anchor" href="#_1-看板架构设计"><span>1. 看板架构设计</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>class ImprovementDashboard:</span></span>
<span class="line"><span>    def __init__(self):</span></span>
<span class="line"><span>        self.analyzers = {</span></span>
<span class="line"><span>            &#39;trend&#39;: FaultTrendAnalyzer(DataSource()),</span></span>
<span class="line"><span>            &#39;root_cause&#39;: RootCauseAnalyzer(IncidentRepository()),</span></span>
<span class="line"><span>            &#39;tracker&#39;: ImprovementTracker(ActionItemRepository())</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        self.cache = {}</span></span>
<span class="line"><span>        self.update_interval = 3600  # 1小时更新一次</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def generate_dashboard_data(self):</span></span>
<span class="line"><span>        &quot;&quot;&quot;生成看板数据&quot;&quot;&quot;</span></span>
<span class="line"><span>        dashboard_data = {</span></span>
<span class="line"><span>            &#39;timestamp&#39;: datetime.now(),</span></span>
<span class="line"><span>            &#39;sections&#39;: {}</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 生成各部分数据</span></span>
<span class="line"><span>        dashboard_data[&#39;sections&#39;][&#39;trend_analysis&#39;] = self.generate_trend_section()</span></span>
<span class="line"><span>        dashboard_data[&#39;sections&#39;][&#39;root_cause_analysis&#39;] = self.generate_root_cause_section()</span></span>
<span class="line"><span>        dashboard_data[&#39;sections&#39;][&#39;improvement_tracking&#39;] = self.generate_tracking_section()</span></span>
<span class="line"><span>        dashboard_data[&#39;sections&#39;][&#39;recommendations&#39;] = self.generate_recommendations_section()</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return dashboard_data</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def generate_trend_section(self):</span></span>
<span class="line"><span>        &quot;&quot;&quot;生成趋势分析部分&quot;&quot;&quot;</span></span>
<span class="line"><span>        trend_data = self.analyzers[&#39;trend&#39;].analyze_trend()</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>            &#39;title&#39;: &#39;故障趋势分析&#39;,</span></span>
<span class="line"><span>            &#39;metrics&#39;: [</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;name&#39;: &#39;总故障数&#39;,</span></span>
<span class="line"><span>                    &#39;value&#39;: trend_data[&#39;total_incidents&#39;],</span></span>
<span class="line"><span>                    &#39;trend&#39;: &#39;down&#39; if trend_data[&#39;total_incidents&#39;] &lt; self.get_previous_value(&#39;total_incidents&#39;) else &#39;up&#39;</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;name&#39;: &#39;平均MTTR&#39;,</span></span>
<span class="line"><span>                    &#39;value&#39;: f&quot;{trend_data[&#39;mttr_trend&#39;][&#39;data&#39;][-1][&#39;mttr&#39;]:.1f}分钟&quot;,</span></span>
<span class="line"><span>                    &#39;trend&#39;: &#39;down&#39; if trend_data[&#39;mttr_trend&#39;][&#39;improvement_rate&#39;] &lt; 0 else &#39;up&#39;</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;name&#39;: &#39;重复故障率&#39;,</span></span>
<span class="line"><span>                    &#39;value&#39;: f&quot;{trend_data[&#39;repeat_incidents&#39;][&#39;percentage&#39;]:.1f}%&quot;,</span></span>
<span class="line"><span>                    &#39;trend&#39;: &#39;down&#39; if trend_data[&#39;repeat_incidents&#39;][&#39;percentage&#39;] &lt; self.get_previous_value(&#39;repeat_rate&#39;) else &#39;up&#39;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            ],</span></span>
<span class="line"><span>            &#39;chart_data&#39;: trend_data[&#39;mttr_trend&#39;][&#39;data&#39;]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def generate_root_cause_section(self):</span></span>
<span class="line"><span>        &quot;&quot;&quot;生成根因分析部分&quot;&quot;&quot;</span></span>
<span class="line"><span>        root_cause_data = self.analyzers[&#39;root_cause&#39;].analyze_root_causes()</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 准备图表数据</span></span>
<span class="line"><span>        chart_data = []</span></span>
<span class="line"><span>        for category, stats in root_cause_data.items():</span></span>
<span class="line"><span>            chart_data.append({</span></span>
<span class="line"><span>                &#39;category&#39;: category,</span></span>
<span class="line"><span>                &#39;count&#39;: stats[&#39;count&#39;],</span></span>
<span class="line"><span>                &#39;avg_mttr&#39;: stats[&#39;avg_mttr&#39;]</span></span>
<span class="line"><span>            })</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>            &#39;title&#39;: &#39;根因分类统计&#39;,</span></span>
<span class="line"><span>            &#39;chart_data&#39;: chart_data,</span></span>
<span class="line"><span>            &#39;top_categories&#39;: sorted(chart_data, key=lambda x: x[&#39;count&#39;], reverse=True)[:5]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def generate_tracking_section(self):</span></span>
<span class="line"><span>        &quot;&quot;&quot;生成跟踪部分&quot;&quot;&quot;</span></span>
<span class="line"><span>        tracking_data = self.analyzers[&#39;tracker&#39;].track_improvements()</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>            &#39;title&#39;: &#39;改进行动跟踪&#39;,</span></span>
<span class="line"><span>            &#39;completion_rate&#39;: tracking_data[&#39;completion_rate&#39;],</span></span>
<span class="line"><span>            &#39;status_distribution&#39;: tracking_data[&#39;by_status&#39;],</span></span>
<span class="line"><span>            &#39;overdue_count&#39;: len(tracking_data[&#39;overdue_items&#39;]),</span></span>
<span class="line"><span>            &#39;effectiveness_score&#39;: tracking_data[&#39;effectiveness&#39;][&#39;score&#39;]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def generate_recommendations_section(self):</span></span>
<span class="line"><span>        &quot;&quot;&quot;生成建议部分&quot;&quot;&quot;</span></span>
<span class="line"><span>        root_cause_data = self.analyzers[&#39;root_cause&#39;].analyze_root_causes()</span></span>
<span class="line"><span>        recommendations = self.analyzers[&#39;root_cause&#39;].generate_recommendations(root_cause_data)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>            &#39;title&#39;: &#39;改进建议&#39;,</span></span>
<span class="line"><span>            &#39;items&#39;: recommendations</span></span>
<span class="line"><span>        }</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-前端展示实现" tabindex="-1"><a class="header-anchor" href="#_2-前端展示实现"><span>2. 前端展示实现</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>// 改进看板前端组件</span></span>
<span class="line"><span>class ImprovementDashboardComponent extends React.Component {</span></span>
<span class="line"><span>    constructor(props) {</span></span>
<span class="line"><span>        super(props);</span></span>
<span class="line"><span>        this.state = {</span></span>
<span class="line"><span>            dashboardData: null,</span></span>
<span class="line"><span>            loading: true,</span></span>
<span class="line"><span>            error: null</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    componentDidMount() {</span></span>
<span class="line"><span>        this.loadDashboardData();</span></span>
<span class="line"><span>        // 定期刷新数据</span></span>
<span class="line"><span>        this.refreshInterval = setInterval(this.loadDashboardData, 60000);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    componentWillUnmount() {</span></span>
<span class="line"><span>        if (this.refreshInterval) {</span></span>
<span class="line"><span>            clearInterval(this.refreshInterval);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    async loadDashboardData() {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            this.setState({ loading: true });</span></span>
<span class="line"><span>            const response = await fetch(&#39;/api/improvement-dashboard&#39;);</span></span>
<span class="line"><span>            const data = await response.json();</span></span>
<span class="line"><span>            this.setState({ dashboardData: data, loading: false });</span></span>
<span class="line"><span>        } catch (error) {</span></span>
<span class="line"><span>            this.setState({ error: error.message, loading: false });</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    render() {</span></span>
<span class="line"><span>        const { dashboardData, loading, error } = this.state;</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if (loading) return &lt;div className=&quot;loading&quot;&gt;加载中...&lt;/div&gt;;</span></span>
<span class="line"><span>        if (error) return &lt;div className=&quot;error&quot;&gt;错误: {error}&lt;/div&gt;;</span></span>
<span class="line"><span>        if (!dashboardData) return &lt;div&gt;暂无数据&lt;/div&gt;;</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return (</span></span>
<span class="line"><span>            &lt;div className=&quot;improvement-dashboard&quot;&gt;</span></span>
<span class="line"><span>                &lt;header&gt;</span></span>
<span class="line"><span>                    &lt;h1&gt;系统改进看板&lt;/h1&gt;</span></span>
<span class="line"><span>                    &lt;div className=&quot;last-updated&quot;&gt;</span></span>
<span class="line"><span>                        最后更新: {new Date(dashboardData.timestamp).toLocaleString()}</span></span>
<span class="line"><span>                    &lt;/div&gt;</span></span>
<span class="line"><span>                &lt;/header&gt;</span></span>
<span class="line"><span>                </span></span>
<span class="line"><span>                &lt;div className=&quot;dashboard-grid&quot;&gt;</span></span>
<span class="line"><span>                    &lt;TrendAnalysisSection data={dashboardData.sections.trend_analysis} /&gt;</span></span>
<span class="line"><span>                    &lt;RootCauseSection data={dashboardData.sections.root_cause_analysis} /&gt;</span></span>
<span class="line"><span>                    &lt;TrackingSection data={dashboardData.sections.improvement_tracking} /&gt;</span></span>
<span class="line"><span>                    &lt;RecommendationsSection data={dashboardData.sections.recommendations} /&gt;</span></span>
<span class="line"><span>                &lt;/div&gt;</span></span>
<span class="line"><span>            &lt;/div&gt;</span></span>
<span class="line"><span>        );</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 趋势分析组件</span></span>
<span class="line"><span>class TrendAnalysisSection extends React.Component {</span></span>
<span class="line"><span>    render() {</span></span>
<span class="line"><span>        const { data } = this.props;</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return (</span></span>
<span class="line"><span>            &lt;div className=&quot;dashboard-section trend-analysis&quot;&gt;</span></span>
<span class="line"><span>                &lt;h2&gt;{data.title}&lt;/h2&gt;</span></span>
<span class="line"><span>                &lt;div className=&quot;metrics-grid&quot;&gt;</span></span>
<span class="line"><span>                    {data.metrics.map((metric, index) =&gt; (</span></span>
<span class="line"><span>                        &lt;div key={index} className=&quot;metric-card&quot;&gt;</span></span>
<span class="line"><span>                            &lt;div className=&quot;metric-name&quot;&gt;{metric.name}&lt;/div&gt;</span></span>
<span class="line"><span>                            &lt;div className=&quot;metric-value&quot;&gt;</span></span>
<span class="line"><span>                                {metric.value}</span></span>
<span class="line"><span>                                &lt;span className={\`trend-indicator \${metric.trend}\`}&gt;</span></span>
<span class="line"><span>                                    {metric.trend === &#39;up&#39; ? &#39;↑&#39; : &#39;↓&#39;}</span></span>
<span class="line"><span>                                &lt;/span&gt;</span></span>
<span class="line"><span>                            &lt;/div&gt;</span></span>
<span class="line"><span>                        &lt;/div&gt;</span></span>
<span class="line"><span>                    ))}</span></span>
<span class="line"><span>                &lt;/div&gt;</span></span>
<span class="line"><span>                &lt;div className=&quot;chart-container&quot;&gt;</span></span>
<span class="line"><span>                    &lt;LineChart data={data.chart_data} /&gt;</span></span>
<span class="line"><span>                &lt;/div&gt;</span></span>
<span class="line"><span>            &lt;/div&gt;</span></span>
<span class="line"><span>        );</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 根因分析组件</span></span>
<span class="line"><span>class RootCauseSection extends React.Component {</span></span>
<span class="line"><span>    render() {</span></span>
<span class="line"><span>        const { data } = this.props;</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return (</span></span>
<span class="line"><span>            &lt;div className=&quot;dashboard-section root-cause-analysis&quot;&gt;</span></span>
<span class="line"><span>                &lt;h2&gt;{data.title}&lt;/h2&gt;</span></span>
<span class="line"><span>                &lt;div className=&quot;chart-container&quot;&gt;</span></span>
<span class="line"><span>                    &lt;BarChart data={data.chart_data} /&gt;</span></span>
<span class="line"><span>                &lt;/div&gt;</span></span>
<span class="line"><span>                &lt;div className=&quot;top-categories&quot;&gt;</span></span>
<span class="line"><span>                    &lt;h3&gt;主要根因类别&lt;/h3&gt;</span></span>
<span class="line"><span>                    &lt;ul&gt;</span></span>
<span class="line"><span>                        {data.top_categories.map((category, index) =&gt; (</span></span>
<span class="line"><span>                            &lt;li key={index}&gt;</span></span>
<span class="line"><span>                                &lt;span className=&quot;category-name&quot;&gt;{category.category}&lt;/span&gt;</span></span>
<span class="line"><span>                                &lt;span className=&quot;category-count&quot;&gt;{category.count}次&lt;/span&gt;</span></span>
<span class="line"><span>                            &lt;/li&gt;</span></span>
<span class="line"><span>                        ))}</span></span>
<span class="line"><span>                    &lt;/ul&gt;</span></span>
<span class="line"><span>                &lt;/div&gt;</span></span>
<span class="line"><span>            &lt;/div&gt;</span></span>
<span class="line"><span>        );</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="看板指标体系设计" tabindex="-1"><a class="header-anchor" href="#看板指标体系设计"><span>看板指标体系设计</span></a></h2><h3 id="_1-核心指标定义" tabindex="-1"><a class="header-anchor" href="#_1-核心指标定义"><span>1. 核心指标定义</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>class DashboardMetrics:</span></span>
<span class="line"><span>    &quot;&quot;&quot;改进看板指标体系&quot;&quot;&quot;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    # 故障相关指标</span></span>
<span class="line"><span>    INCIDENT_METRICS = {</span></span>
<span class="line"><span>        &#39;incident_count&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;故障总数&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;指定时间范围内的故障总数&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;次&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;持续下降&#39;</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        &#39;mttr&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;平均修复时间&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;故障从发生到解决的平均时间&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;分钟&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;持续下降&#39;</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        &#39;mtbf&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;平均故障间隔时间&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;两次故障之间的平均时间&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;小时&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;持续上升&#39;</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        &#39;repeat_rate&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;重复故障率&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;重复发生故障占总故障的比例&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;%&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;持续下降&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    # 改进相关指标</span></span>
<span class="line"><span>    IMPROVEMENT_METRICS = {</span></span>
<span class="line"><span>        &#39;action_completion_rate&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;行动项完成率&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;已完成的改进行动项占总数的比例&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;%&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;≥80%&#39;</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        &#39;improvement_effectiveness&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;改进效果评分&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;改进行动项的实际效果评估&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;分&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;≥75分&#39;</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        &#39;prevention_effect&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;预防效果&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;通过改进措施预防的故障数量&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;次&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;持续上升&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    # 业务影响指标</span></span>
<span class="line"><span>    BUSINESS_METRICS = {</span></span>
<span class="line"><span>        &#39;business_impact&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;业务影响评分&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;故障对业务造成的平均影响程度&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;分&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;持续下降&#39;</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        &#39;customer_satisfaction&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;客户满意度&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;受故障影响客户的满意度评分&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;分&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;≥90分&#39;</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        &#39;revenue_impact&#39;: {</span></span>
<span class="line"><span>            &#39;name&#39;: &#39;收入影响&#39;,</span></span>
<span class="line"><span>            &#39;description&#39;: &#39;故障造成的直接收入损失&#39;,</span></span>
<span class="line"><span>            &#39;unit&#39;: &#39;元&#39;,</span></span>
<span class="line"><span>            &#39;target&#39;: &#39;持续下降&#39;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-指标计算与评估" tabindex="-1"><a class="header-anchor" href="#_2-指标计算与评估"><span>2. 指标计算与评估</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>class MetricsCalculator:</span></span>
<span class="line"><span>    &quot;&quot;&quot;指标计算器&quot;&quot;&quot;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def __init__(self, data_source):</span></span>
<span class="line"><span>        self.data_source = data_source</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def calculate_all_metrics(self, time_range=&#39;30d&#39;):</span></span>
<span class="line"><span>        &quot;&quot;&quot;计算所有指标&quot;&quot;&quot;</span></span>
<span class="line"><span>        metrics = {}</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算故障相关指标</span></span>
<span class="line"><span>        metrics.update(self.calculate_incident_metrics(time_range))</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算改进相关指标</span></span>
<span class="line"><span>        metrics.update(self.calculate_improvement_metrics(time_range))</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算业务影响指标</span></span>
<span class="line"><span>        metrics.update(self.calculate_business_metrics(time_range))</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 添加评估结果</span></span>
<span class="line"><span>        metrics[&#39;assessment&#39;] = self.assess_performance(metrics)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return metrics</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def calculate_incident_metrics(self, time_range):</span></span>
<span class="line"><span>        &quot;&quot;&quot;计算故障相关指标&quot;&quot;&quot;</span></span>
<span class="line"><span>        incidents = self.data_source.get_incidents(time_range)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if not incidents:</span></span>
<span class="line"><span>            return {key: 0 for key in DashboardMetrics.INCIDENT_METRICS.keys()}</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算各项指标</span></span>
<span class="line"><span>        total_incidents = len(incidents)</span></span>
<span class="line"><span>        total_mttr = sum(incident.get_mttr() for incident in incidents)</span></span>
<span class="line"><span>        avg_mttr = total_mttr / total_incidents if total_incidents &gt; 0 else 0</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算MTBF</span></span>
<span class="line"><span>        sorted_incidents = sorted(incidents, key=lambda x: x.created_at)</span></span>
<span class="line"><span>        if len(sorted_incidents) &gt; 1:</span></span>
<span class="line"><span>            total_duration = (sorted_incidents[-1].created_at - sorted_incidents[0].created_at).total_seconds()</span></span>
<span class="line"><span>            avg_mtbf = total_duration / (len(sorted_incidents) - 1) / 3600  # 转换为小时</span></span>
<span class="line"><span>        else:</span></span>
<span class="line"><span>            avg_mtbf = 0</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算重复故障率</span></span>
<span class="line"><span>        repeat_count = self.count_repeat_incidents(incidents)</span></span>
<span class="line"><span>        repeat_rate = repeat_count / total_incidents * 100 if total_incidents &gt; 0 else 0</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>            &#39;incident_count&#39;: total_incidents,</span></span>
<span class="line"><span>            &#39;mttr&#39;: round(avg_mttr, 2),</span></span>
<span class="line"><span>            &#39;mtbf&#39;: round(avg_mtbf, 2),</span></span>
<span class="line"><span>            &#39;repeat_rate&#39;: round(repeat_rate, 2)</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def calculate_improvement_metrics(self, time_range):</span></span>
<span class="line"><span>        &quot;&quot;&quot;计算改进相关指标&quot;&quot;&quot;</span></span>
<span class="line"><span>        action_items = self.data_source.get_action_items(time_range)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if not action_items:</span></span>
<span class="line"><span>            return {key: 0 for key in DashboardMetrics.IMPROVEMENT_METRICS.keys()}</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算完成率</span></span>
<span class="line"><span>        completed_count = sum(1 for item in action_items if item.status == &#39;已完成&#39;)</span></span>
<span class="line"><span>        completion_rate = completed_count / len(action_items) * 100 if action_items else 0</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算改进效果评分</span></span>
<span class="line"><span>        effectiveness_scores = [item.effectiveness_score for item in action_items </span></span>
<span class="line"><span>                              if item.effectiveness_score is not None]</span></span>
<span class="line"><span>        avg_effectiveness = sum(effectiveness_scores) / len(effectiveness_scores) if effectiveness_scores else 0</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算预防效果</span></span>
<span class="line"><span>        prevented_count = sum(1 for item in action_items if item.prevented_incidents)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>            &#39;action_completion_rate&#39;: round(completion_rate, 2),</span></span>
<span class="line"><span>            &#39;improvement_effectiveness&#39;: round(avg_effectiveness, 2),</span></span>
<span class="line"><span>            &#39;prevention_effect&#39;: prevented_count</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def calculate_business_metrics(self, time_range):</span></span>
<span class="line"><span>        &quot;&quot;&quot;计算业务影响指标&quot;&quot;&quot;</span></span>
<span class="line"><span>        incidents = self.data_source.get_incidents(time_range)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if not incidents:</span></span>
<span class="line"><span>            return {key: 0 for key in DashboardMetrics.BUSINESS_METRICS.keys()}</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算平均业务影响评分</span></span>
<span class="line"><span>        impact_scores = [incident.business_impact for incident in incidents </span></span>
<span class="line"><span>                        if incident.business_impact is not None]</span></span>
<span class="line"><span>        avg_impact = sum(impact_scores) / len(impact_scores) if impact_scores else 0</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算客户满意度（模拟数据）</span></span>
<span class="line"><span>        avg_satisfaction = 92.5  # 假设值</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算收入影响</span></span>
<span class="line"><span>        total_revenue_impact = sum(incident.revenue_impact for incident in incidents </span></span>
<span class="line"><span>                                 if incident.revenue_impact is not None)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>            &#39;business_impact&#39;: round(avg_impact, 2),</span></span>
<span class="line"><span>            &#39;customer_satisfaction&#39;: round(avg_satisfaction, 2),</span></span>
<span class="line"><span>            &#39;revenue_impact&#39;: round(total_revenue_impact, 2)</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def assess_performance(self, metrics):</span></span>
<span class="line"><span>        &quot;&quot;&quot;评估整体表现&quot;&quot;&quot;</span></span>
<span class="line"><span>        assessment = {</span></span>
<span class="line"><span>            &#39;overall_score&#39;: 0,</span></span>
<span class="line"><span>            &#39;strengths&#39;: [],</span></span>
<span class="line"><span>            &#39;weaknesses&#39;: [],</span></span>
<span class="line"><span>            &#39;recommendations&#39;: []</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 计算综合评分</span></span>
<span class="line"><span>        score_components = []</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 故障指标评分（越低越好，需要转换）</span></span>
<span class="line"><span>        if metrics.get(&#39;incident_count&#39;, 0) &gt; 0:</span></span>
<span class="line"><span>            incident_score = max(0, 100 - metrics[&#39;incident_count&#39;])</span></span>
<span class="line"><span>            score_components.append(incident_score * 0.3)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if metrics.get(&#39;mttr&#39;, 0) &gt; 0:</span></span>
<span class="line"><span>            mttr_score = max(0, 100 - metrics[&#39;mttr&#39;])</span></span>
<span class="line"><span>            score_components.append(mttr_score * 0.3)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if metrics.get(&#39;repeat_rate&#39;, 0) &gt; 0:</span></span>
<span class="line"><span>            repeat_score = max(0, 100 - metrics[&#39;repeat_rate&#39;] * 2)</span></span>
<span class="line"><span>            score_components.append(repeat_score * 0.2)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 改进指标评分（越高越好）</span></span>
<span class="line"><span>        if metrics.get(&#39;action_completion_rate&#39;, 0) &gt; 0:</span></span>
<span class="line"><span>            completion_score = metrics[&#39;action_completion_rate&#39;]</span></span>
<span class="line"><span>            score_components.append(completion_score * 0.2)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        assessment[&#39;overall_score&#39;] = round(sum(score_components), 2)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 识别优势和劣势</span></span>
<span class="line"><span>        self.identify_strengths_weaknesses(metrics, assessment)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 生成建议</span></span>
<span class="line"><span>        self.generate_recommendations(metrics, assessment)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return assessment</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def identify_strengths_weaknesses(self, metrics, assessment):</span></span>
<span class="line"><span>        &quot;&quot;&quot;识别优势和劣势&quot;&quot;&quot;</span></span>
<span class="line"><span>        # 优势判断</span></span>
<span class="line"><span>        if metrics.get(&#39;mttr&#39;, 100) &lt; 30:</span></span>
<span class="line"><span>            assessment[&#39;strengths&#39;].append(&#39;故障修复速度快&#39;)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if metrics.get(&#39;action_completion_rate&#39;, 0) &gt; 85:</span></span>
<span class="line"><span>            assessment[&#39;strengths&#39;].append(&#39;改进行动执行效果好&#39;)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if metrics.get(&#39;repeat_rate&#39;, 100) &lt; 5:</span></span>
<span class="line"><span>            assessment[&#39;strengths&#39;].append(&#39;重复故障控制良好&#39;)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 劣势判断</span></span>
<span class="line"><span>        if metrics.get(&#39;incident_count&#39;, 0) &gt; 50:</span></span>
<span class="line"><span>            assessment[&#39;weaknesses&#39;].append(&#39;故障发生频率较高&#39;)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if metrics.get(&#39;mttr&#39;, 0) &gt; 60:</span></span>
<span class="line"><span>            assessment[&#39;weaknesses&#39;].append(&#39;故障修复时间较长&#39;)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if metrics.get(&#39;repeat_rate&#39;, 0) &gt; 15:</span></span>
<span class="line"><span>            assessment[&#39;weaknesses&#39;].append(&#39;重复故障问题突出&#39;)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="系统性优化驱动" tabindex="-1"><a class="header-anchor" href="#系统性优化驱动"><span>系统性优化驱动</span></a></h2><h3 id="_1-优化机会识别" tabindex="-1"><a class="header-anchor" href="#_1-优化机会识别"><span>1. 优化机会识别</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>class OptimizationOpportunityIdentifier:</span></span>
<span class="line"><span>    &quot;&quot;&quot;优化机会识别器&quot;&quot;&quot;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def __init__(self, metrics_analyzer, incident_analyzer):</span></span>
<span class="line"><span>        self.metrics_analyzer = metrics_analyzer</span></span>
<span class="line"><span>        self.incident_analyzer = incident_analyzer</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def identify_optimization_opportunities(self, time_range=&#39;90d&#39;):</span></span>
<span class="line"><span>        &quot;&quot;&quot;识别系统性优化机会&quot;&quot;&quot;</span></span>
<span class="line"><span>        opportunities = []</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 1. 基于指标趋势识别机会</span></span>
<span class="line"><span>        trend_opportunities = self.identify_from_trends(time_range)</span></span>
<span class="line"><span>        opportunities.extend(trend_opportunities)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 2. 基于根因分析识别机会</span></span>
<span class="line"><span>        root_cause_opportunities = self.identify_from_root_causes(time_range)</span></span>
<span class="line"><span>        opportunities.extend(root_cause_opportunities)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 3. 基于改进行动识别机会</span></span>
<span class="line"><span>        action_opportunities = self.identify_from_actions(time_range)</span></span>
<span class="line"><span>        opportunities.extend(action_opportunities)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 4. 基于业务影响识别机会</span></span>
<span class="line"><span>        business_opportunities = self.identify_from_business_impact(time_range)</span></span>
<span class="line"><span>        opportunities.extend(business_opportunities)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 去重和优先级排序</span></span>
<span class="line"><span>        unique_opportunities = self.deduplicate_opportunities(opportunities)</span></span>
<span class="line"><span>        prioritized_opportunities = self.prioritize_opportunities(unique_opportunities)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return prioritized_opportunities</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def identify_from_trends(self, time_range):</span></span>
<span class="line"><span>        &quot;&quot;&quot;基于趋势识别优化机会&quot;&quot;&quot;</span></span>
<span class="line"><span>        opportunities = []</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 获取指标趋势数据</span></span>
<span class="line"><span>        trend_data = self.metrics_analyzer.get_trend_data(time_range)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 识别恶化趋势</span></span>
<span class="line"><span>        for metric_name, trend_info in trend_data.items():</span></span>
<span class="line"><span>            if trend_info[&#39;trend&#39;] == &#39;up&#39; and trend_info[&#39;change_rate&#39;] &gt; 10:  # 上升超过10%</span></span>
<span class="line"><span>                opportunity = {</span></span>
<span class="line"><span>                    &#39;type&#39;: &#39;trend_based&#39;,</span></span>
<span class="line"><span>                    &#39;metric&#39;: metric_name,</span></span>
<span class="line"><span>                    &#39;description&#39;: f&quot;{metric_name}指标呈恶化趋势，上升{trend_info[&#39;change_rate&#39;]:.1f}%&quot;,</span></span>
<span class="line"><span>                    &#39;priority&#39;: &#39;high&#39;,</span></span>
<span class="line"><span>                    &#39;suggested_actions&#39;: self.get_trend_suggestions(metric_name)</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                opportunities.append(opportunity)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return opportunities</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def identify_from_root_causes(self, time_range):</span></span>
<span class="line"><span>        &quot;&quot;&quot;基于根因分析识别优化机会&quot;&quot;&quot;</span></span>
<span class="line"><span>        opportunities = []</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 获取根因分析数据</span></span>
<span class="line"><span>        root_cause_data = self.incident_analyzer.analyze_root_causes(time_range)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 识别高频根因</span></span>
<span class="line"><span>        for category, stats in root_cause_data.items():</span></span>
<span class="line"><span>            if stats[&#39;count&#39;] &gt; 10:  # 超过10次</span></span>
<span class="line"><span>                opportunity = {</span></span>
<span class="line"><span>                    &#39;type&#39;: &#39;root_cause_based&#39;,</span></span>
<span class="line"><span>                    &#39;category&#39;: category,</span></span>
<span class="line"><span>                    &#39;description&#39;: f&quot;{category}类问题频繁发生，共{stats[&#39;count&#39;]}次&quot;,</span></span>
<span class="line"><span>                    &#39;priority&#39;: &#39;high&#39; if stats[&#39;count&#39;] &gt; 20 else &#39;medium&#39;,</span></span>
<span class="line"><span>                    &#39;suggested_actions&#39;: self.get_root_cause_suggestions(category)</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                opportunities.append(opportunity)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return opportunities</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def identify_from_actions(self, time_range):</span></span>
<span class="line"><span>        &quot;&quot;&quot;基于改进行动识别优化机会&quot;&quot;&quot;</span></span>
<span class="line"><span>        opportunities = []</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 获取改进行动数据</span></span>
<span class="line"><span>        action_data = self.metrics_analyzer.get_action_items(time_range)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 识别低效改进</span></span>
<span class="line"><span>        low_effectiveness_actions = [action for action in action_data </span></span>
<span class="line"><span>                                   if action.effectiveness_score and action.effectiveness_score &lt; 50]</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if len(low_effectiveness_actions) &gt; len(action_data) * 0.3:  # 超过30%效果不佳</span></span>
<span class="line"><span>            opportunity = {</span></span>
<span class="line"><span>                &#39;type&#39;: &#39;action_based&#39;,</span></span>
<span class="line"><span>                &#39;description&#39;: f&quot;改进行动整体效果不佳，{len(low_effectiveness_actions)}个行动项效果评分低于50分&quot;,</span></span>
<span class="line"><span>                &#39;priority&#39;: &#39;high&#39;,</span></span>
<span class="line"><span>                &#39;suggested_actions&#39;: [&#39;重新评估改进策略&#39;, &#39;加强改进过程跟踪&#39;, &#39;优化改进项优先级&#39;]</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            opportunities.append(opportunity)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return opportunities</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def prioritize_opportunities(self, opportunities):</span></span>
<span class="line"><span>        &quot;&quot;&quot;为优化机会设置优先级&quot;&quot;&quot;</span></span>
<span class="line"><span>        priority_mapping = {&#39;high&#39;: 3, &#39;medium&#39;: 2, &#39;low&#39;: 1}</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 按优先级排序</span></span>
<span class="line"><span>        sorted_opportunities = sorted(</span></span>
<span class="line"><span>            opportunities,</span></span>
<span class="line"><span>            key=lambda x: priority_mapping.get(x.get(&#39;priority&#39;, &#39;low&#39;), 1),</span></span>
<span class="line"><span>            reverse=True</span></span>
<span class="line"><span>        )</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 添加序号</span></span>
<span class="line"><span>        for i, opportunity in enumerate(sorted_opportunities):</span></span>
<span class="line"><span>            opportunity[&#39;rank&#39;] = i + 1</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return sorted_opportunities</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-优化方案制定" tabindex="-1"><a class="header-anchor" href="#_2-优化方案制定"><span>2. 优化方案制定</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>class OptimizationPlanner:</span></span>
<span class="line"><span>    &quot;&quot;&quot;优化方案制定器&quot;&quot;&quot;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def __init__(self, opportunity_identifier):</span></span>
<span class="line"><span>        self.opportunity_identifier = opportunity_identifier</span></span>
<span class="line"><span>        self.template_library = self.load_template_library()</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def create_optimization_plan(self, time_range=&#39;90d&#39;):</span></span>
<span class="line"><span>        &quot;&quot;&quot;创建系统性优化计划&quot;&quot;&quot;</span></span>
<span class="line"><span>        # 识别优化机会</span></span>
<span class="line"><span>        opportunities = self.opportunity_identifier.identify_optimization_opportunities(time_range)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 为每个机会制定优化方案</span></span>
<span class="line"><span>        optimization_plan = {</span></span>
<span class="line"><span>            &#39;plan_name&#39;: f&#39;系统优化计划_{datetime.now().strftime(&quot;%Y%m%d&quot;)}&#39;,</span></span>
<span class="line"><span>            &#39;created_at&#39;: datetime.now(),</span></span>
<span class="line"><span>            &#39;time_range&#39;: time_range,</span></span>
<span class="line"><span>            &#39;opportunities&#39;: opportunities,</span></span>
<span class="line"><span>            &#39;initiatives&#39;: [],</span></span>
<span class="line"><span>            &#39;timeline&#39;: {},</span></span>
<span class="line"><span>            &#39;resources&#39;: {},</span></span>
<span class="line"><span>            &#39;success_metrics&#39;: {}</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 为高优先级机会制定具体方案</span></span>
<span class="line"><span>        high_priority_opportunities = [opp for opp in opportunities if opp[&#39;priority&#39;] == &#39;high&#39;]</span></span>
<span class="line"><span>        for opportunity in high_priority_opportunities:</span></span>
<span class="line"><span>            initiative = self.create_initiative_for_opportunity(opportunity)</span></span>
<span class="line"><span>            optimization_plan[&#39;initiatives&#39;].append(initiative)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 制定时间线</span></span>
<span class="line"><span>        optimization_plan[&#39;timeline&#39;] = self.create_timeline(optimization_plan[&#39;initiatives&#39;])</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 估算资源需求</span></span>
<span class="line"><span>        optimization_plan[&#39;resources&#39;] = self.estimate_resources(optimization_plan[&#39;initiatives&#39;])</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 定义成功指标</span></span>
<span class="line"><span>        optimization_plan[&#39;success_metrics&#39;] = self.define_success_metrics(optimization_plan[&#39;initiatives&#39;])</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return optimization_plan</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def create_initiative_for_opportunity(self, opportunity):</span></span>
<span class="line"><span>        &quot;&quot;&quot;为优化机会创建具体方案&quot;&quot;&quot;</span></span>
<span class="line"><span>        initiative = {</span></span>
<span class="line"><span>            &#39;id&#39;: f&quot;INIT-{uuid.uuid4().hex[:8]}&quot;,</span></span>
<span class="line"><span>            &#39;opportunity_id&#39;: opportunity.get(&#39;rank&#39;),</span></span>
<span class="line"><span>            &#39;name&#39;: f&quot;优化: {opportunity[&#39;description&#39;][:50]}...&quot;,</span></span>
<span class="line"><span>            &#39;description&#39;: opportunity[&#39;description&#39;],</span></span>
<span class="line"><span>            &#39;type&#39;: opportunity[&#39;type&#39;],</span></span>
<span class="line"><span>            &#39;priority&#39;: opportunity[&#39;priority&#39;],</span></span>
<span class="line"><span>            &#39;owner&#39;: self.assign_owner(opportunity),</span></span>
<span class="line"><span>            &#39;team&#39;: self.assign_team(opportunity),</span></span>
<span class="line"><span>            &#39;goals&#39;: self.define_goals(opportunity),</span></span>
<span class="line"><span>            &#39;actions&#39;: self.define_actions(opportunity),</span></span>
<span class="line"><span>            &#39;timeline&#39;: self.estimate_timeline(opportunity),</span></span>
<span class="line"><span>            &#39;resources&#39;: self.estimate_required_resources(opportunity),</span></span>
<span class="line"><span>            &#39;risks&#39;: self.identify_risks(opportunity),</span></span>
<span class="line"><span>            &#39;success_criteria&#39;: self.define_success_criteria(opportunity)</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return initiative</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def define_actions(self, opportunity):</span></span>
<span class="line"><span>        &quot;&quot;&quot;定义具体行动步骤&quot;&quot;&quot;</span></span>
<span class="line"><span>        template_actions = self.get_template_actions(opportunity)</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if template_actions:</span></span>
<span class="line"><span>            return template_actions</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        # 基于机会类型生成行动步骤</span></span>
<span class="line"><span>        actions = []</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if opportunity[&#39;type&#39;] == &#39;trend_based&#39;:</span></span>
<span class="line"><span>            actions = [</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;step&#39;: 1,</span></span>
<span class="line"><span>                    &#39;description&#39;: &#39;深入分析指标恶化原因&#39;,</span></span>
<span class="line"><span>                    &#39;duration&#39;: &#39;3天&#39;,</span></span>
<span class="line"><span>                    &#39;responsible&#39;: &#39;技术团队&#39;</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;step&#39;: 2,</span></span>
<span class="line"><span>                    &#39;description&#39;: &#39;制定针对性改进措施&#39;,</span></span>
<span class="line"><span>                    &#39;duration&#39;: &#39;5天&#39;,</span></span>
<span class="line"><span>                    &#39;responsible&#39;: &#39;架构师&#39;</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;step&#39;: 3,</span></span>
<span class="line"><span>                    &#39;description&#39;: &#39;实施改进措施&#39;,</span></span>
<span class="line"><span>                    &#39;duration&#39;: &#39;14天&#39;,</span></span>
<span class="line"><span>                    &#39;responsible&#39;: &#39;开发团队&#39;</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;step&#39;: 4,</span></span>
<span class="line"><span>                    &#39;description&#39;: &#39;监控改进效果&#39;,</span></span>
<span class="line"><span>                    &#39;duration&#39;: &#39;持续&#39;,</span></span>
<span class="line"><span>                    &#39;responsible&#39;: &#39;运维团队&#39;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        elif opportunity[&#39;type&#39;] == &#39;root_cause_based&#39;:</span></span>
<span class="line"><span>            actions = [</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;step&#39;: 1,</span></span>
<span class="line"><span>                    &#39;description&#39;: &#39;根本原因深入分析&#39;,</span></span>
<span class="line"><span>                    &#39;duration&#39;: &#39;5天&#39;,</span></span>
<span class="line"><span>                    &#39;responsible&#39;: &#39;SRE团队&#39;</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;step&#39;: 2,</span></span>
<span class="line"><span>                    &#39;description&#39;: &#39;设计预防机制&#39;,</span></span>
<span class="line"><span>                    &#39;duration&#39;: &#39;7天&#39;,</span></span>
<span class="line"><span>                    &#39;responsible&#39;: &#39;架构师&#39;</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;step&#39;: 3,</span></span>
<span class="line"><span>                    &#39;description&#39;: &#39;开发和部署预防措施&#39;,</span></span>
<span class="line"><span>                    &#39;duration&#39;: &#39;21天&#39;,</span></span>
<span class="line"><span>                    &#39;responsible&#39;: &#39;开发团队&#39;</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                {</span></span>
<span class="line"><span>                    &#39;step&#39;: 4,</span></span>
<span class="line"><span>                    &#39;description&#39;: &#39;验证预防效果&#39;,</span></span>
<span class="line"><span>                    &#39;duration&#39;: &#39;30天&#39;,</span></span>
<span class="line"><span>                    &#39;responsible&#39;: &#39;QA团队&#39;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return actions</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    def define_success_criteria(self, opportunity):</span></span>
<span class="line"><span>        &quot;&quot;&quot;定义成功标准&quot;&quot;&quot;</span></span>
<span class="line"><span>        criteria = []</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        if opportunity[&#39;type&#39;] == &#39;trend_based&#39;:</span></span>
<span class="line"><span>            metric_name = opportunity[&#39;metric&#39;]</span></span>
<span class="line"><span>            criteria = [</span></span>
<span class="line"><span>                f&quot;{metric_name}指标下降20%以上&quot;,</span></span>
<span class="line"><span>                &quot;相关故障数量减少30%&quot;,</span></span>
<span class="line"><span>                &quot;团队对该问题的处理效率提升&quot;</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        elif opportunity[&#39;type&#39;] == &#39;root_cause_based&#39;:</span></span>
<span class="line"><span>            category = opportunity[&#39;category&#39;]</span></span>
<span class="line"><span>            criteria = [</span></span>
<span class="line"><span>                f&quot;{category}类故障减少50%以上&quot;,</span></span>
<span class="line"><span>                &quot;平均MTTR下降25%&quot;,</span></span>
<span class="line"><span>                &quot;客户满意度提升5个百分点&quot;</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        </span></span>
<span class="line"><span>        return criteria</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="最佳实践与总结" tabindex="-1"><a class="header-anchor" href="#最佳实践与总结"><span>最佳实践与总结</span></a></h2><h3 id="_1-看板实施建议" tabindex="-1"><a class="header-anchor" href="#_1-看板实施建议"><span>1. 看板实施建议</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>class DashboardImplementationGuide:</span></span>
<span class="line"><span>    &quot;&quot;&quot;看板实施指南&quot;&quot;&quot;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    @staticmethod</span></span>
<span class="line"><span>    def get_implementation_steps():</span></span>
<span class="line"><span>        &quot;&quot;&quot;获取实施步骤&quot;&quot;&quot;</span></span>
<span class="line"><span>        return [</span></span>
<span class="line"><span>            {</span></span>
<span class="line"><span>                &#39;phase&#39;: &#39;准备阶段&#39;,</span></span>
<span class="line"><span>                &#39;steps&#39;: [</span></span>
<span class="line"><span>                    &#39;明确看板目标和受众&#39;,</span></span>
<span class="line"><span>                    &#39;确定关键指标体系&#39;,</span></span>
<span class="line"><span>                    &#39;设计看板布局和视觉风格&#39;,</span></span>
<span class="line"><span>                    &#39;选择合适的技术栈&#39;</span></span>
<span class="line"><span>                ]</span></span>
<span class="line"><span>            },</span></span>
<span class="line"><span>            {</span></span>
<span class="line"><span>                &#39;phase&#39;: &#39;开发阶段&#39;,</span></span>
<span class="line"><span>                &#39;steps&#39;: [</span></span>
<span class="line"><span>                    &#39;搭建数据收集和处理管道&#39;,</span></span>
<span class="line"><span>                    &#39;开发后端API接口&#39;,</span></span>
<span class="line"><span>                    &#39;实现前端可视化组件&#39;,</span></span>
<span class="line"><span>                    &#39;集成告警和通知机制&#39;</span></span>
<span class="line"><span>                ]</span></span>
<span class="line"><span>            },</span></span>
<span class="line"><span>            {</span></span>
<span class="line"><span>                &#39;phase&#39;: &#39;测试阶段&#39;,</span></span>
<span class="line"><span>                &#39;steps&#39;: [</span></span>
<span class="line"><span>                    &#39;进行功能测试和性能测试&#39;,</span></span>
<span class="line"><span>                    &#39;邀请关键用户进行体验测试&#39;,</span></span>
<span class="line"><span>                    &#39;根据反馈优化界面和功能&#39;,</span></span>
<span class="line"><span>                    &#39;准备上线文档和培训材料&#39;</span></span>
<span class="line"><span>                ]</span></span>
<span class="line"><span>            },</span></span>
<span class="line"><span>            {</span></span>
<span class="line"><span>                &#39;phase&#39;: &#39;上线阶段&#39;,</span></span>
<span class="line"><span>                &#39;steps&#39;: [</span></span>
<span class="line"><span>                    &#39;正式部署看板系统&#39;,</span></span>
<span class="line"><span>                    &#39;对相关人员进行培训&#39;,</span></span>
<span class="line"><span>                    &#39;建立日常维护机制&#39;,</span></span>
<span class="line"><span>                    &#39;定期收集用户反馈&#39;</span></span>
<span class="line"><span>                ]</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        ]</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    @staticmethod</span></span>
<span class="line"><span>    def get_success_factors():</span></span>
<span class="line"><span>        &quot;&quot;&quot;获取成功因素&quot;&quot;&quot;</span></span>
<span class="line"><span>        return [</span></span>
<span class="line"><span>            &#39;高层支持和资源投入&#39;,</span></span>
<span class="line"><span>            &#39;跨团队协作和沟通&#39;,</span></span>
<span class="line"><span>            &#39;数据质量和准确性&#39;,</span></span>
<span class="line"><span>            &#39;用户参与和反馈机制&#39;,</span></span>
<span class="line"><span>            &#39;持续改进和优化&#39;</span></span>
<span class="line"><span>        ]</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-常见问题与解决方案" tabindex="-1"><a class="header-anchor" href="#_2-常见问题与解决方案"><span>2. 常见问题与解决方案</span></a></h3><p>改进看板在实施过程中可能会遇到各种问题，以下是常见问题及解决方案：</p><ol><li><p><strong>数据质量问题</strong></p><ul><li>问题：数据不准确或不完整导致看板失去参考价值</li><li>解决方案： <ul><li>建立数据质量检查机制</li><li>设置数据验证规则</li><li>定期进行数据审计</li><li>建立数据责任制度</li></ul></li></ul></li><li><p><strong>指标选择不当</strong></p><ul><li>问题：选择的指标无法真实反映系统状态或改进效果</li><li>解决方案： <ul><li>与业务目标对齐选择指标</li><li>采用平衡计分卡方法</li><li>定期评审和调整指标</li><li>收集用户反馈优化指标</li></ul></li></ul></li><li><p><strong>用户参与度低</strong></p><ul><li>问题：团队成员对看板关注度不够，影响改进效果</li><li>解决方案： <ul><li>提高看板的易用性和可视化效果</li><li>建立激励机制</li><li>定期组织看板评审会议</li><li>将看板数据与绩效考核关联</li></ul></li></ul></li></ol><h2 id="结论" tabindex="-1"><a class="header-anchor" href="#结论"><span>结论</span></a></h2><p>改进看板作为连接故障复盘与持续改进的重要工具，在现代运维体系中发挥着越来越重要的作用。通过科学设计指标体系、合理构建看板架构、有效驱动系统性优化，团队能够：</p><ol><li><strong>量化改进效果</strong>：通过数据指标客观评估改进措施的实际效果</li><li><strong>识别优化机会</strong>：系统性地发现潜在的改进空间和优化方向</li><li><strong>驱动持续改进</strong>：形成&quot;发现问题-分析问题-解决问题-预防问题&quot;的闭环</li><li><strong>提升团队能力</strong>：通过知识沉淀和经验分享提升整体技术水平</li></ol><p>在实施改进看板时，需要注意以下关键点：</p><ol><li><strong>以业务价值为导向</strong>：确保所有指标和改进措施都与业务目标对齐</li><li><strong>注重数据质量</strong>：建立完善的数据收集、处理和验证机制</li><li><strong>持续迭代优化</strong>：根据使用反馈不断改进看板功能和用户体验</li><li><strong>培养改进文化</strong>：营造积极的改进氛围，鼓励团队主动参与</li></ol><p>通过有效利用改进看板，组织能够从被动响应故障转变为主动预防问题，真正实现运维效能的持续提升和业务稳定性的有力保障。</p>`,44)])])}const h=n(e,[["render",p]]),k=JSON.parse('{"path":"/posts/alarm/044-3-3-4-improvement-dashboard.html","title":"生成改进看板: 量化分析故障，驱动系统性优化","lang":"zh-CN","frontmatter":{"title":"生成改进看板: 量化分析故障，驱动系统性优化","date":"2025-09-07T00:00:00.000Z","categories":["Alarm"],"tags":["Alarm"],"published":true,"description":"生成改进看板：量化分析故障，驱动系统性优化 在现代运维体系中，仅仅解决单个故障是远远不够的。真正有价值的运维实践是能够从历史故障中提取洞察，量化分析问题模式，并驱动系统性的优化改进。改进看板作为连接故障复盘与持续改进的重要工具，能够帮助团队可视化问题趋势、跟踪改进进度、评估优化效果。 引言 改进看板是将故障复盘中获得的经验教训转化为可量化、可跟踪、可评...","head":[["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"生成改进看板: 量化分析故障，驱动系统性优化\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2025-09-07T00:00:00.000Z\\",\\"dateModified\\":\\"2025-09-07T09:02:25.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"老马啸西风\\",\\"url\\":\\"https://houbb.github.io\\"}]}"],["meta",{"property":"og:url","content":"https://houbb.github.io/blog-plateform-design/posts/alarm/044-3-3-4-improvement-dashboard.html"}],["meta",{"property":"og:site_name","content":"老马啸西风"}],["meta",{"property":"og:title","content":"生成改进看板: 量化分析故障，驱动系统性优化"}],["meta",{"property":"og:description","content":"生成改进看板：量化分析故障，驱动系统性优化 在现代运维体系中，仅仅解决单个故障是远远不够的。真正有价值的运维实践是能够从历史故障中提取洞察，量化分析问题模式，并驱动系统性的优化改进。改进看板作为连接故障复盘与持续改进的重要工具，能够帮助团队可视化问题趋势、跟踪改进进度、评估优化效果。 引言 改进看板是将故障复盘中获得的经验教训转化为可量化、可跟踪、可评..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-09-07T09:02:25.000Z"}],["meta",{"property":"article:tag","content":"Alarm"}],["meta",{"property":"article:published_time","content":"2025-09-07T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2025-09-07T09:02:25.000Z"}]]},"git":{"createdTime":1757168950000,"updatedTime":1757235745000,"contributors":[{"name":"bbhou","username":"bbhou","email":"1557740299@qq.com","commits":10,"url":"https://github.com/bbhou"}]},"readingTime":{"minutes":15.78,"words":4733},"filePathRelative":"posts/alarm/044-3-3-4-improvement-dashboard.md","excerpt":"\\n<p>在现代运维体系中，仅仅解决单个故障是远远不够的。真正有价值的运维实践是能够从历史故障中提取洞察，量化分析问题模式，并驱动系统性的优化改进。改进看板作为连接故障复盘与持续改进的重要工具，能够帮助团队可视化问题趋势、跟踪改进进度、评估优化效果。</p>\\n<h2>引言</h2>\\n<p>改进看板是将故障复盘中获得的经验教训转化为可量化、可跟踪、可评估的改进措施的重要载体。它具有以下核心价值：</p>\\n<ol>\\n<li><strong>可视化改进过程</strong>：将抽象的改进措施转化为可视化的进度跟踪</li>\\n<li><strong>量化改进效果</strong>：通过数据指标评估改进措施的实际效果</li>\\n<li><strong>驱动系统优化</strong>：识别系统性问题，推动架构和流程的优化</li>\\n<li><strong>促进知识共享</strong>：让团队成员了解改进进展和成果</li>\\n</ol>","autoDesc":true}');export{h as comp,k as data};
