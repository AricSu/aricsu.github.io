import{_ as s,c as a,o as n,N as l}from"./chunks/framework.0799945b.js";const F=JSON.parse('{"title":"TiDB-单机多TiKV实例、多TiDB实例部署","description":"","frontmatter":{},"headers":[],"relativePath":"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/04TiUP 单机混部多实例.md"}'),p={name:"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/04TiUP 单机混部多实例.md"},o=l(`<h1 id="tidb-单机多tikv实例、多tidb实例部署" tabindex="-1">TiDB-单机多TiKV实例、多TiDB实例部署 <a class="header-anchor" href="#tidb-单机多tikv实例、多tidb实例部署" aria-label="Permalink to &quot;TiDB-单机多TiKV实例、多TiDB实例部署&quot;">​</a></h1><p>时间：2021-01-06</p><h2 id="summary" tabindex="-1">summary <a class="header-anchor" href="#summary" aria-label="Permalink to &quot;summary&quot;">​</a></h2><blockquote><ul><li><a href="#配置inventory的TiKV部分">配置inventory的TiKV部分</a></li><li><a href="#集群节点环境配置与参数限制">集群节点环境配置与参数限制</a><ul><li><a href="#中控机操作部署机建用户">中控机操作部署机建用户</a></li><li><a href="#中控机操作部署机配置ntp服务">中控机操作部署机配置ntp服务</a></li><li><a href="#中控及操作部署机设置CPU模式">中控及操作部署机设置CPU模式</a></li></ul></li><li><a href="#ansible部署命令黄金五步骤走">ansible部署命令黄金五步骤走</a><ul><li><a href="#执行local_prepare联网下载binary包">执行local_prepare联网下载binary包</a></li><li><a href="#初始化系统环境并修改内核参数">初始化系统环境并修改内核参数</a></li><li><a href="#部署TiDB集群软件">部署TiDB集群软件</a></li><li><a href="#安装Dashboard依赖包">安装Dashboard依赖包</a></li><li><a href="#执行start启动TiDB集群">执行start启动TiDB集群</a></li></ul></li><li><a href="#验证是否安装成功">验证是否安装成功</a></li></ul></blockquote><h2 id="配置inventory的tikv部分" tabindex="-1">配置inventory的TiKV部分 <a class="header-anchor" href="#配置inventory的tikv部分" aria-label="Permalink to &quot;配置inventory的TiKV部分&quot;">​</a></h2><p>配置范例：</p><div class="language-python"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb</span><span style="color:#89DDFF;">@</span><span style="color:#A6ACCD;">tidb01</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> tidb</span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;">ansible</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ vi inventory</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">ini</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb_servers</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">11</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">42</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data1</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">4000</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">10080</span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">12</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">42</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data2</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">4001</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">10081</span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB2</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">21</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">43</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data1</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">4000</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">10080</span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB2</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">22</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">43</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data2</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">4001</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">10081</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">pd_servers</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">41</span></span>
<span class="line"><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">42</span></span>
<span class="line"><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">43</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># 注意：要使用 TiKV 的 labels，必须同时配置 PD 的 location_labels 参数，否则 labels 设置不生效。</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># 多实例场景需要额外配置 status 端口，示例如下：</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tikv_servers</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">11</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">41</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data1</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20171</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20181</span><span style="color:#A6ACCD;"> labels</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">host=tikv1</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">12</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">41</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data2</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20172</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20182</span><span style="color:#A6ACCD;"> labels</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">host=tikv1</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">21</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">42</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data1</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20171</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20181</span><span style="color:#A6ACCD;"> labels</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">host=tikv2</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">22</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">42</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data2</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20172</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20182</span><span style="color:#A6ACCD;"> labels</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">host=tikv2</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">31</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">43</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data1</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20171</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20181</span><span style="color:#A6ACCD;"> labels</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">host=tikv3</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">32</span><span style="color:#A6ACCD;"> ansible_host</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">43</span><span style="color:#A6ACCD;"> deploy_dir</span><span style="color:#89DDFF;">=/</span><span style="color:#A6ACCD;">data2</span><span style="color:#89DDFF;">/</span><span style="color:#A6ACCD;">deploy tikv_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20172</span><span style="color:#A6ACCD;"> tikv_status_port</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">20182</span><span style="color:#A6ACCD;"> labels</span><span style="color:#89DDFF;">=</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">host=tikv3</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">monitoring_servers</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">42</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">grafana_servers</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">42</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">monitored_servers</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># 192.168.1.41</span></span>
<span class="line"><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">42</span></span>
<span class="line"><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">43</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># 为使 TiKV 的 labels 设置生效，部署集群时必须设置 PD 的 location_labels 参数</span></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">pd_servers</span><span style="color:#89DDFF;">:</span><span style="color:#82AAFF;">vars</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#A6ACCD;">location_labels </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">host</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">]</span></span>
<span class="line"></span></code></pre></div><p>labels参数作用：</p><ul><li>labels 是 Region 调度的最小单元，每一个 raft group 中不同的 replica 不会在扩展过程中被迁移到同一个lable单元，避免这种情况下 server 宕机导致的单点问题（3副本，2副本落在同一个server）。</li><li>raft group 的 multi-replica 主要解决的是数据的容灾问题，labels 参数可以有效防止随数据扩展，在Region 迁移过程中因散列计算 Region 迁移位置时，由于冲撞导致的同一个 server 存储同一个 Region group 的多个 replica 的情况。</li><li>可以给一个服务器打一个 labels、可以给一个服务器机柜打一个 labels，也可以是一个 IDC 打一个 labels。</li></ul><h2 id="集群节点环境配置与参数限制" tabindex="-1">集群节点环境配置与参数限制 <a class="header-anchor" href="#集群节点环境配置与参数限制" aria-label="Permalink to &quot;集群节点环境配置与参数限制&quot;">​</a></h2><h4 id="block-cache-size下的capacity参数调整" tabindex="-1">block-cache-size下的capacity参数调整 <a class="header-anchor" href="#block-cache-size下的capacity参数调整" aria-label="Permalink to &quot;block-cache-size下的capacity参数调整&quot;">​</a></h4><p>多实例情况下，需要修改 tidb-ansible/conf/tikv.yml 中 block-cache-size 下面的 capacity 参数; 用以限制每个TiKV实例用于block-cache的内存使用限制。</p><p>官方推荐设置：capacity = MEM_TOTAL * 0.5 / TiKV 实例数量</p><p>本例：各节点内存3G，每个节点部署两台实例，因此 capacity = 3 * 0.5 / 2 = 0.75GB</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tidb01-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ vi </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;">/tidb-ansible/conf/tikv.yml</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">storage:</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#FFCB6B;">block-cache:</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">capacity:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">0.75GB</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span></code></pre></div><h4 id="readpool下coprocessor的并发度调整" tabindex="-1">readpool下coprocessor的并发度调整 <a class="header-anchor" href="#readpool下coprocessor的并发度调整" aria-label="Permalink to &quot;readpool下coprocessor的并发度调整&quot;">​</a></h4><p>官方推荐设置： 参数值 = ( CPU 核心数量 * 0.8 ) / TiKV 实例数量</p><p>本例：各节点部署两个实例，CPU 核心数量 8 个，参数值 = ( 8 * 0.8 ) / 2 = 3</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;"># 使用 shell 命令查看逻辑核心数量</span></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tidb01-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> tidb-ansible</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ cat /proc/cpuinfo</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">grep</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">processor</span><span style="color:#89DDFF;">&quot;</span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">wc</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">-l</span></span>
<span class="line"><span style="color:#F78C6C;">8</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tidb01-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ vi </span><span style="color:#89DDFF;">~</span><span style="color:#A6ACCD;">/tidb-ansible/conf/tikv.yml</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">readpool:</span></span>
<span class="line"><span style="color:#A6ACCD;">  </span><span style="color:#FFCB6B;">coprocessor:</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#676E95;font-style:italic;"># Notice: if CPU_NUM &gt; 8, default thread pool size for coprocessors</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#676E95;font-style:italic;"># will be set to CPU_NUM * 0.8.</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">high-concurrency:</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">normal-concurrency:</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">low-concurrency:</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span></span>
<span class="line"></span></code></pre></div><h4 id="raftstore下的capacity参数调整" tabindex="-1">raftstore下的capacity参数调整 <a class="header-anchor" href="#raftstore下的capacity参数调整" aria-label="Permalink to &quot;raftstore下的capacity参数调整&quot;">​</a></h4><p>如果多个 TiKV 实例部署在同一块物理磁盘上，需要修改 conf/tikv.yml 中的 capacity 参数，限制每个 TiKV 实例所能使用的磁盘容量，官方推荐配置：capacity = 磁盘总容量 / TiKV 实例数量。</p><p>本例：各节点限制使用磁盘容量为 5 GB ，capacity = 5GB</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">vi ~/tidb-ansible/conf/tikv.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">raftstore:</span></span>
<span class="line"><span style="color:#A6ACCD;">  capacity = 5GB</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="中控机操作部署机建用户" tabindex="-1">中控机操作部署机建用户 <a class="header-anchor" href="#中控机操作部署机建用户" aria-label="Permalink to &quot;中控机操作部署机建用户&quot;">​</a></h2><p>执行以下命令，依据输入<em><strong>部署目标机器</strong></em>的 root 用户密码； 本例新增节点IP为192.168.1.44；</p><div class="language-python"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb</span><span style="color:#89DDFF;">@</span><span style="color:#A6ACCD;">tidb01</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> tidb</span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;">ansible</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ vi hosts</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">ini</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb</span><span style="color:#89DDFF;">@</span><span style="color:#A6ACCD;">tidb01</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> tidb</span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;">ansible</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ cat hosts</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">ini</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">servers</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#F78C6C;">192.168</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">1</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">44</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#82AAFF;">all</span><span style="color:#89DDFF;">:</span><span style="color:#82AAFF;">vars</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#A6ACCD;">username </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">ntp_server </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> cn</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">pool</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">ntp</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">org</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb</span><span style="color:#89DDFF;">@</span><span style="color:#A6ACCD;">tidb01</span><span style="color:#89DDFF;">-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> tidb</span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;">ansible</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ ansible</span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;">playbook </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;">i hosts</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">ini</span><span style="color:#A6ACCD;"> create_users</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;">yml</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;">u root </span><span style="color:#89DDFF;">-</span><span style="color:#A6ACCD;">k</span></span>
<span class="line"><span style="color:#A6ACCD;">SSH password</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">PLAY </span><span style="color:#89DDFF;">[</span><span style="color:#82AAFF;">all</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">***************************************************************************************************************</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well</span><span style="color:#89DDFF;">.</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">:-</span><span style="color:#A6ACCD;">)</span></span>
<span class="line"></span>
<span class="line"></span></code></pre></div><p>验证互信时候成功</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible -i inventory.ini all -m shell -a &#39;whoami&#39;</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-21 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-22 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-12 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-11 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3-31 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3-32 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2-21 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2-22 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1-11 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1-12 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>验证sudo 免密码配置成功</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible -i inventory.ini all -m shell -a &#39;whoami&#39; -b</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-12 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-11 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-21 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-22 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2-21 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2-22 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3-31 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3-32 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1-11 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1-12 | SUCCESS | rc=0 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">root</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="中控机操作部署机配置ntp服务" tabindex="-1">中控机操作部署机配置ntp服务 <a class="header-anchor" href="#中控机操作部署机配置ntp服务" aria-label="Permalink to &quot;中控机操作部署机配置ntp服务&quot;">​</a></h2><p><em><strong>注意：生产上应该指向自己的ntp服务器，本次测试采用了公网公用的ntp服务不稳定。</strong></em></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="中控及操作部署机设置cpu模式" tabindex="-1">中控及操作部署机设置CPU模式 <a class="header-anchor" href="#中控及操作部署机设置cpu模式" aria-label="Permalink to &quot;中控及操作部署机设置CPU模式&quot;">​</a></h2><p>调整CPU模式，如果同本文出现一样的报错，说明此版本的操作系统不支持CPU模式修改，可直接跳过。</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tidb01-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> tidb-ansible</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ ansible -i hosts.ini all -m shell -a</span><span style="color:#89DDFF;"> &quot;</span><span style="color:#C3E88D;">cpupower frequency-set --governor performance</span><span style="color:#89DDFF;">&quot;</span><span style="color:#A6ACCD;"> -u tidb -b</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44 </span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">FAILED</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> rc</span><span style="color:#89DDFF;">=</span><span style="color:#F78C6C;">237</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&gt;&gt;</span></span>
<span class="line"><span style="color:#FFCB6B;">Setting</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">cpu:</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">0</span></span>
<span class="line"><span style="color:#FFCB6B;">Error</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">setting</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">new</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">values.</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Common</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">errors:</span></span>
<span class="line"><span style="color:#FFCB6B;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Do</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">you</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">have</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">proper</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">administration</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">rights?</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">super-user?</span><span style="color:#89DDFF;">)</span></span>
<span class="line"><span style="color:#FFCB6B;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Is</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">the</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">governor</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">you</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">requested</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">available</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">and</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">modprobed?</span></span>
<span class="line"><span style="color:#FFCB6B;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Trying</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">to</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">set</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">an</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">invalid</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">policy?</span></span>
<span class="line"><span style="color:#FFCB6B;">-</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Trying</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">to</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">set</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">a</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">specific</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">frequency,</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">but</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">userspace</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">governor</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">is</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">not</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">available,</span></span>
<span class="line"><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;font-style:italic;">for</span><span style="color:#A6ACCD;"> example because of hardware which cannot be set to a specific frequency</span></span>
<span class="line"><span style="color:#A6ACCD;">   </span><span style="color:#FFCB6B;">or</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">because</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">the</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">userspace</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">governor</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">isn</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">t loaded?non-zero return code</span></span>
<span class="line"></span>
<span class="line"></span></code></pre></div><h2 id="ansible部署命令黄金五步骤走" tabindex="-1">ansible部署命令黄金五步骤走 <a class="header-anchor" href="#ansible部署命令黄金五步骤走" aria-label="Permalink to &quot;ansible部署命令黄金五步骤走&quot;">​</a></h2><h4 id="执行local-prepare联网下载binary包" tabindex="-1">执行local_prepare联网下载binary包 <a class="header-anchor" href="#执行local-prepare联网下载binary包" aria-label="Permalink to &quot;执行local_prepare联网下载binary包&quot;">​</a></h4><p>执行 local_prepare.yml playbook，联网下载 TiDB binary 至中控机。</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tidb01-</span><span style="color:#F78C6C;">41</span><span style="color:#A6ACCD;"> tidb-ansible</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ ansible-playbook local_prepare.yml</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">PLAY</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">do </span><span style="color:#C792EA;">local</span><span style="color:#A6ACCD;"> preparation</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;">***************************************************************************</span></span>
<span class="line"></span>
<span class="line"><span style="color:#82AAFF;">......</span></span>
<span class="line"><span style="color:#82AAFF;">......</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">Congrats!</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">All</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">goes</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">well.</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">:-</span><span style="color:#A6ACCD;">)</span></span>
<span class="line"></span></code></pre></div><h4 id="初始化系统环境并修改内核参数" tabindex="-1">初始化系统环境并修改内核参数 <a class="header-anchor" href="#初始化系统环境并修改内核参数" aria-label="Permalink to &quot;初始化系统环境并修改内核参数&quot;">​</a></h4><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [initializing deployment target] *****************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h4 id="部署tidb集群软件" tabindex="-1">部署TiDB集群软件 <a class="header-anchor" href="#部署tidb集群软件" aria-label="Permalink to &quot;部署TiDB集群软件&quot;">​</a></h4><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook deploy.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] ***************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP ********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=53   changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=121  changed=16   unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=52   changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-11                   : ok=26   changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-12                   : ok=26   changed=2    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-21                   : ok=26   changed=2    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-22                   : ok=26   changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1-11                   : ok=28   changed=5    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1-12                   : ok=28   changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2-21                   : ok=28   changed=3    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2-22                   : ok=28   changed=3    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3-31                   : ok=28   changed=3    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3-32                   : ok=28   changed=3    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h4 id="安装dashboard依赖包" tabindex="-1">安装Dashboard依赖包 <a class="header-anchor" href="#安装dashboard依赖包" aria-label="Permalink to &quot;安装Dashboard依赖包&quot;">​</a></h4><p>Grafana Dashboard 上的 Report 按钮可用来生成 PDF 文件，此功能依赖 fontconfig 包和英文字体。如</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[root@tidb01-41 tmp]# sudo yum install fontconfig open-sans-fonts</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h4 id="执行start启动tidb集群" tabindex="-1">执行start启动TiDB集群 <a class="header-anchor" href="#执行start启动tidb集群" aria-label="Permalink to &quot;执行start启动TiDB集群&quot;">​</a></h4><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook start.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] **********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP *******************************************************************************************************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=9    changed=2    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=34   changed=10   unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=12   changed=3    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-11                   : ok=6    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB1-12                   : ok=6    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB2-21                   : ok=6    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiDB2-22                   : ok=6    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1-11                   : ok=8    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV1-12                   : ok=8    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2-21                   : ok=8    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV2-22                   : ok=8    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3-31                   : ok=8    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">TiKV3-32                   : ok=8    changed=1    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="验证是否安装成功" tabindex="-1">验证是否安装成功 <a class="header-anchor" href="#验证是否安装成功" aria-label="Permalink to &quot;验证是否安装成功&quot;">​</a></h2><ul><li>MySQL客户端连接验证</li></ul><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ mysql -uroot -P4000 -h192.168.1.43</span></span>
<span class="line"><span style="color:#A6ACCD;">Welcome to the MariaDB monitor.  Commands end with ; or \\g.</span></span>
<span class="line"><span style="color:#A6ACCD;">Your MySQL connection id is 18</span></span>
<span class="line"><span style="color:#A6ACCD;">Server version: 5.7.25-TiDB-v3.0.1 MySQL Community Server (Apache License 2.0)</span></span>
<span class="line"><span style="color:#A6ACCD;">MySQL [(none)]&gt; exit</span></span>
<span class="line"><span style="color:#A6ACCD;">Bye</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ mysql -uroot -P4000 -h192.168.1.42</span></span>
<span class="line"><span style="color:#A6ACCD;">Welcome to the MariaDB monitor.  Commands end with ; or \\g.</span></span>
<span class="line"><span style="color:#A6ACCD;">Your MySQL connection id is 17</span></span>
<span class="line"><span style="color:#A6ACCD;">Server version: 5.7.25-TiDB-v3.0.1 MySQL Community Server (Apache License 2.0)</span></span>
<span class="line"><span style="color:#A6ACCD;">MySQL [(none)]&gt; exit</span></span>
<span class="line"><span style="color:#A6ACCD;">Bye</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ mysql -uroot -P4001 -h192.168.1.43</span></span>
<span class="line"><span style="color:#A6ACCD;">ERROR 2003 (HY000): Can&#39;t connect to MySQL server on &#39;192.168.1.43&#39; (111)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ mysql -uroot -P4001 -h192.168.1.42</span></span>
<span class="line"><span style="color:#A6ACCD;">ERROR 2003 (HY000): Can&#39;t connect to MySQL server on &#39;192.168.1.42&#39; (111)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p><strong>出现了TiDB实例没有起来的状况，但是ansible没有报错！</strong></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb02-42 deploy]$ pwd</span></span>
<span class="line"><span style="color:#A6ACCD;">/data1/deploy</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb02-42 deploy]$ ./bin/tidb-server -P 4001 --status=10081 1-advertise-address=192.168.1.42 --path=192.168.1.42:2379,192.168.1.43:2379 --config=conf/tidb.toml --log-slow-query=/data1/deploy/log/tidb_slow_query.log --log-file=/data1/deploy/log/tidb.log</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[2021/01/06 10:08:41.846 -05:00] [INFO] [domain.go:554] [&quot;domain closed&quot;] [&quot;take time&quot;=82.116µs]</span></span>
<span class="line"><span style="color:#A6ACCD;">sync log err: sync /dev/stdout: invalid argument</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ mysql -uroot -P4001 -h192.168.1.42</span></span>
<span class="line"><span style="color:#A6ACCD;">Welcome to the MariaDB monitor.  Commands end with ; or \\g.</span></span>
<span class="line"><span style="color:#A6ACCD;">Your MySQL connection id is 1</span></span>
<span class="line"><span style="color:#A6ACCD;">Server version: 5.7.25-TiDB-v3.0.1 MySQL Community Server (Apache License 2.0)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">MySQL [(none)]&gt; exit</span></span>
<span class="line"><span style="color:#A6ACCD;">Bye</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><ul><li>grafana图形界面验证 <img src="http://cdn.lifemini.cn/dbblog/20210106/9e1e0fde9ec446c7ae32df0a6f1f5338.png" alt="grafana节点校验"></li></ul><h2 id="参考文章" tabindex="-1">参考文章 <a class="header-anchor" href="#参考文章" aria-label="Permalink to &quot;参考文章&quot;">​</a></h2><p><a href="https://docs.pingcap.com/zh/tidb/stable/online-deployment-using-ansible#%E5%8D%95%E6%9C%BA%E5%A4%9A-tikv-%E5%AE%9E%E4%BE%8B%E9%9B%86%E7%BE%A4%E6%8B%93%E6%89%91" target="_blank" rel="noreferrer">PingCAP官方文档-单机单 TiKV 实例集群拓扑</a></p>`,57),e=[o];function t(c,r,C,i,y,D){return n(),a("div",null,e)}const d=s(p,[["render",t]]);export{F as __pageData,d as default};
