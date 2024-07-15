import{_ as s,c as n,o as a,N as l}from"./chunks/framework.0799945b.js";const d=JSON.parse('{"title":"TiDB-TiUP工具集群离线部署方案","description":"","frontmatter":{},"headers":[],"relativePath":"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/01TiUP 离线部署 TiDB.md"}'),p={name:"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/01TiUP 离线部署 TiDB.md"},o=l(`<h1 id="tidb-tiup工具集群离线部署方案" tabindex="-1">TiDB-TiUP工具集群离线部署方案 <a class="header-anchor" href="#tidb-tiup工具集群离线部署方案" aria-label="Permalink to &quot;TiDB-TiUP工具集群离线部署方案&quot;">​</a></h1><p>时间：2020-12-25</p><blockquote><ul><li><a href="#下载TiUP离线组件">下载TiUP离线组件</a></li><li><a href="#下载TiUP离线组件">TiKV数据盘挂载</a></li><li><a href="#配置topology配置文件">配置topology配置文件</a></li><li><a href="#部署TiDB集群">部署TiDB集群</a></li><li><a href="#检查集群状态">检查集群状态</a></li><li><a href="#TiUP卸载集群">TiUP卸载集群</a></li><li><a href="#常见错误解决">常见错误解决</a></li></ul></blockquote><blockquote><p><strong>IP规划</strong></p></blockquote><table><thead><tr><th>IP地址</th><th>Role信息</th><th>备注</th></tr></thead><tbody><tr><td>192.168.169.41</td><td>pd+tikv+tidb+cdc</td><td>部署TiUP主机</td></tr><tr><td>192.168.169.42</td><td>pd+tikv+tidb+cdc+prometheus+grafana+alertmanager</td><td></td></tr><tr><td>192.168.169.43</td><td>pd+tikv+tidb+cdc</td><td></td></tr><tr><td>192.168.169.44</td><td>tiflash</td><td></td></tr></tbody></table><h2 id="下载tiup离线组件" tabindex="-1">下载TiUP离线组件 <a class="header-anchor" href="#下载tiup离线组件" aria-label="Permalink to &quot;下载TiUP离线组件&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# useradd tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# passwd tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tidb-tidb41 ~]# visudo</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tidb-tidb41 ~]# tail -1 /etc/sudoers</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb ALL=(ALL) NOPASSWD: ALL</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# su - tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb44 ~]$ curl --proto &#39;=https&#39; --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh</span></span>
<span class="line"><span style="color:#A6ACCD;">  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current</span></span>
<span class="line"><span style="color:#A6ACCD;">                                 Dload  Upload   Total   Spent    Left  Speed</span></span>
<span class="line"><span style="color:#A6ACCD;"> 23 8697k   23 2015k    0     0   303k      0  0:00:28  0:00:06  0:00:22  417k</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#676E95;font-style:italic;"># \${version} 替换为需要下载的版本名称，如：v4.0.2、v5.0.0-rc等</span></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb44 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ tiup mirror clone tidb-community-server-</span><span style="color:#89DDFF;">\${</span><span style="color:#A6ACCD;">version</span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">-linux-amd64 </span><span style="color:#89DDFF;">\${</span><span style="color:#A6ACCD;">version</span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> --os</span><span style="color:#89DDFF;">=</span><span style="color:#C3E88D;">linux</span><span style="color:#A6ACCD;"> --arch</span><span style="color:#89DDFF;">=</span><span style="color:#C3E88D;">amd64</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">Start</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">to</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">clone</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">mirror,</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">targetDir</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">is</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#C3E88D;">-linux-amd64,</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">selectedVersions</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">are</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[]</span></span>
<span class="line"><span style="color:#FFCB6B;">If</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">this</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">does</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">not</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">meet</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">expectations,</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">please</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">abort</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">this</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">process,</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">read</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#FFCB6B;">tiup</span><span style="color:#C3E88D;"> mirror clone --help</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">and</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">run</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">again</span></span>
<span class="line"><span style="color:#FFCB6B;">Arch</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">amd64</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#FFCB6B;">OS</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">linux</span><span style="color:#89DDFF;">]</span></span>
<span class="line"><span style="color:#82AAFF;">......</span></span>
<span class="line"><span style="color:#82AAFF;">......</span></span>
<span class="line"><span style="color:#FFCB6B;">download</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">https://tiup-mirrors.pingcap.com/tiup-linux-amd64.tar.gz</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">8.49</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">MiB</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">/</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">8.49</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">MiB</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">100.00</span><span style="color:#C3E88D;">%</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">806.71</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">KiB</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">p/s</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb44 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ ll</span></span>
<span class="line"><span style="color:#FFCB6B;">total</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">0</span></span>
<span class="line"><span style="color:#FFCB6B;">drwxr-xr-x.</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">172</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Jan</span><span style="color:#A6ACCD;">  </span><span style="color:#F78C6C;">9</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">11</span><span style="color:#C3E88D;">:</span><span style="color:#F78C6C;">40</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#C3E88D;">-linux-amd64</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb44 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ cd tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;">-linux-amd64/</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb44 tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;">-linux-amd64</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ ll</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb44 tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;">-linux-amd64</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ ./local_install.sh </span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb44 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ tar -cvf tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;">-linux-amd64.tar.gz tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;">-linux-amd64</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb44 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ ll -lrth</span></span>
<span class="line"><span style="color:#FFCB6B;">total</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">1.5G</span></span>
<span class="line"><span style="color:#FFCB6B;">drwxr-xr-x.</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">4.0K</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Jan</span><span style="color:#A6ACCD;">  </span><span style="color:#F78C6C;">9</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">00</span><span style="color:#C3E88D;">:</span><span style="color:#F78C6C;">26</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#C3E88D;">-linux-amd64</span></span>
<span class="line"><span style="color:#FFCB6B;">-rw-rw-r--</span><span style="color:#82AAFF;">.</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">1.5G</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Jan</span><span style="color:#A6ACCD;">  </span><span style="color:#F78C6C;">9</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">00</span><span style="color:#C3E88D;">:</span><span style="color:#F78C6C;">28</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#C3E88D;">-linux-amd64.tar.gz</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb44 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ scp tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;">-linux-amd64.tar.gz 192.168.169.41:/home/tidb/</span></span>
<span class="line"><span style="color:#FFCB6B;">Warning:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Permanently</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">added</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">192.168.169.41</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">ECDSA</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">to</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">the</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">list</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">of</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">known</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">hosts.</span></span>
<span class="line"><span style="color:#FFCB6B;">tidb@192.168.169.41&#39;s</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">password:</span><span style="color:#A6ACCD;"> </span></span>
<span class="line"><span style="color:#FFCB6B;">tidb-community-server-v4.0.2-linux-amd64.tar.gz</span><span style="color:#A6ACCD;">                                                                                                                                  </span><span style="color:#F78C6C;">56</span><span style="color:#C3E88D;">%</span><span style="color:#A6ACCD;">  </span><span style="color:#C3E88D;">869MB</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">129.1MB/s</span><span style="color:#A6ACCD;">   </span><span style="color:#F78C6C;">00</span><span style="color:#C3E88D;">:</span><span style="color:#F78C6C;">05</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">ETA</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb41 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ tar -xvf tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;">-linux-amd64.tar.gz </span></span>
<span class="line"><span style="color:#FFCB6B;">tidb-community-server-v4.0.2-linux-amd64/</span></span>
<span class="line"><span style="color:#82AAFF;">......</span></span>
<span class="line"><span style="color:#82AAFF;">......</span></span>
<span class="line"><span style="color:#FFCB6B;">tidb-community-server-v4.0.2-linux-amd64/local_install.sh</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb41 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ ll -lrth</span></span>
<span class="line"><span style="color:#FFCB6B;">total</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">1.5G</span></span>
<span class="line"><span style="color:#FFCB6B;">drwxr-xr-x.</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">3</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">4.0K</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Jan</span><span style="color:#A6ACCD;">  </span><span style="color:#F78C6C;">9</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">00</span><span style="color:#C3E88D;">:</span><span style="color:#F78C6C;">26</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#C3E88D;">-linux-amd64</span></span>
<span class="line"><span style="color:#FFCB6B;">-rw-rw-r--</span><span style="color:#82AAFF;">.</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">1.5G</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Jan</span><span style="color:#A6ACCD;">  </span><span style="color:#F78C6C;">9</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">00</span><span style="color:#C3E88D;">:</span><span style="color:#F78C6C;">30</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#C3E88D;">-linux-amd64.tar.gz</span></span>
<span class="line"></span></code></pre></div><p>安装组件</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 ~]$ cd tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ ll |grep install</span></span>
<span class="line"><span style="color:#A6ACCD;">-rwxr-xr-x. 1 tidb tidb      2086 Jan  9 00:26 local_install.sh</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ sh local_install.sh </span></span>
<span class="line"><span style="color:#A6ACCD;">Set mirror to /home/tidb/tidb-community-server-v4.0.2-linux-amd64 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Detected shell: bash</span></span>
<span class="line"><span style="color:#A6ACCD;">Shell profile:  /home/tidb/.bash_profile</span></span>
<span class="line"><span style="color:#A6ACCD;">/home/tidb/.bash_profile has been modified to to add tiup to PATH</span></span>
<span class="line"><span style="color:#A6ACCD;">open a new terminal or source /home/tidb/.bash_profile to use it</span></span>
<span class="line"><span style="color:#A6ACCD;">Installed path: /home/tidb/.tiup/bin/tiup</span></span>
<span class="line"><span style="color:#A6ACCD;">===============================================</span></span>
<span class="line"><span style="color:#A6ACCD;">1. source /home/tidb/.bash_profile</span></span>
<span class="line"><span style="color:#A6ACCD;">2. Have a try:   tiup playground</span></span>
<span class="line"><span style="color:#A6ACCD;">===============================================</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ source /home/tidb/.bash_profile</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="tikv数据盘挂载" tabindex="-1">TiKV数据盘挂载 <a class="header-anchor" href="#tikv数据盘挂载" aria-label="Permalink to &quot;TiKV数据盘挂载&quot;">​</a></h2><p>修改HHD的磁盘</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# fdisk -l</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Disk /dev/sda: 107.4 GB, 107374182400 bytes, 209715200 sectors</span></span>
<span class="line"><span style="color:#A6ACCD;">Units = sectors of 1 * 512 = 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;">Sector size (logical/physical): 512 bytes / 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;">I/O size (minimum/optimal): 512 bytes / 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;">Disk label type: dos</span></span>
<span class="line"><span style="color:#A6ACCD;">Disk identifier: 0x000a1f1f</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">   Device Boot      Start         End      Blocks   Id  System</span></span>
<span class="line"><span style="color:#A6ACCD;">/dev/sda1   *        2048      391167      194560   83  Linux</span></span>
<span class="line"><span style="color:#A6ACCD;">/dev/sda2          391168   199628799    99618816   8e  Linux LVM</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Disk /dev/sdb: 107.4 GB, 107374182400 bytes, 209715200 sectors</span></span>
<span class="line"><span style="color:#A6ACCD;">Units = sectors of 1 * 512 = 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;">Sector size (logical/physical): 512 bytes / 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;">I/O size (minimum/optimal): 512 bytes / 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Disk /dev/mapper/centos-root: 102.0 GB, 102001278976 bytes, 199221248 sectors</span></span>
<span class="line"><span style="color:#A6ACCD;">Units = sectors of 1 * 512 = 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;">Sector size (logical/physical): 512 bytes / 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;">I/O size (minimum/optimal): 512 bytes / 512 bytes</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# parted -s -a optimal /dev/sdb mklabel gpt -- mkpart primary ext4 1 -1</span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# ll /dev/sd*</span></span>
<span class="line"><span style="color:#A6ACCD;">brw-rw----. 1 root disk 8,  0 Jan  8 23:29 /dev/sda</span></span>
<span class="line"><span style="color:#A6ACCD;">brw-rw----. 1 root disk 8,  1 Jan  8 23:29 /dev/sda1</span></span>
<span class="line"><span style="color:#A6ACCD;">brw-rw----. 1 root disk 8,  2 Jan  8 23:29 /dev/sda2</span></span>
<span class="line"><span style="color:#A6ACCD;">brw-rw----. 1 root disk 8, 16 Jan  8 23:46 /dev/sdb</span></span>
<span class="line"><span style="color:#A6ACCD;">brw-rw----. 1 root disk 8, 17 Jan  8 23:46 /dev/sdb1</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# mkfs.ext4 /dev/sdb1 </span></span>
<span class="line"><span style="color:#A6ACCD;">mke2fs 1.42.9 (28-Dec-2013)</span></span>
<span class="line"><span style="color:#A6ACCD;">Filesystem label=</span></span>
<span class="line"><span style="color:#A6ACCD;">OS type: Linux</span></span>
<span class="line"><span style="color:#A6ACCD;">Block size=4096 (log=2)</span></span>
<span class="line"><span style="color:#A6ACCD;">Fragment size=4096 (log=2)</span></span>
<span class="line"><span style="color:#A6ACCD;">Stride=0 blocks, Stripe width=0 blocks</span></span>
<span class="line"><span style="color:#A6ACCD;">6553600 inodes, 26213888 blocks</span></span>
<span class="line"><span style="color:#A6ACCD;">1310694 blocks (5.00%) reserved for the super user</span></span>
<span class="line"><span style="color:#A6ACCD;">First data block=0</span></span>
<span class="line"><span style="color:#A6ACCD;">Maximum filesystem blocks=2174746624</span></span>
<span class="line"><span style="color:#A6ACCD;">800 block groups</span></span>
<span class="line"><span style="color:#A6ACCD;">32768 blocks per group, 32768 fragments per group</span></span>
<span class="line"><span style="color:#A6ACCD;">8192 inodes per group</span></span>
<span class="line"><span style="color:#A6ACCD;">Superblock backups stored on blocks: </span></span>
<span class="line"><span style="color:#A6ACCD;">	32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208, </span></span>
<span class="line"><span style="color:#A6ACCD;">	4096000, 7962624, 11239424, 20480000, 23887872</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Allocating group tables: done                            </span></span>
<span class="line"><span style="color:#A6ACCD;">Writing inode tables: done                            </span></span>
<span class="line"><span style="color:#A6ACCD;">Creating journal (32768 blocks): done</span></span>
<span class="line"><span style="color:#A6ACCD;">Writing superblocks and filesystem accounting information: done   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# lsblk -f</span></span>
<span class="line"><span style="color:#A6ACCD;">NAME            FSTYPE      LABEL UUID                                   MOUNTPOINT</span></span>
<span class="line"><span style="color:#A6ACCD;">sda                                                                      </span></span>
<span class="line"><span style="color:#A6ACCD;">├─sda1          xfs               f5186353-9452-4395-9549-0e0f05401910   /boot</span></span>
<span class="line"><span style="color:#A6ACCD;">└─sda2          LVM2_member       QjWT3C-PmGV-bIBK-kjxs-zGGE-xnLB-Kqyewx </span></span>
<span class="line"><span style="color:#A6ACCD;">  └─centos-root xfs               1c8f5bee-8e88-44d7-99c0-c5d8b1d621bb   /</span></span>
<span class="line"><span style="color:#A6ACCD;">sdb                                                                      </span></span>
<span class="line"><span style="color:#A6ACCD;">└─sdb1          ext4              003d05ff-6e97-49ec-abf4-b86be07754b8   </span></span>
<span class="line"><span style="color:#A6ACCD;">sr0                                                                      </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# vi /etc/fstab </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# tail -1 /etc/fstab </span></span>
<span class="line"><span style="color:#A6ACCD;">UUID=003d05ff-6e97-49ec-abf4-b86be07754b8 /data ext4    defaults,nodelalloc,noatime       0 2</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# mkdir /data</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# mount -a</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tiup-tidb41 ~]# mount -t ext4</span></span>
<span class="line"><span style="color:#A6ACCD;">/dev/sdb1 on /data type ext4 (rw,noatime,seclabel,nodelalloc,data=ordered)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="配置topology配置文件" tabindex="-1">配置topology配置文件 <a class="header-anchor" href="#配置topology配置文件" aria-label="Permalink to &quot;配置topology配置文件&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ vi topology.yaml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ cat topology.yaml</span></span>
<span class="line"><span style="color:#A6ACCD;"># # Global variables are applied to all deployments and used as the default value of</span></span>
<span class="line"><span style="color:#A6ACCD;"># # the deployments if a specific deployment value is missing.</span></span>
<span class="line"><span style="color:#A6ACCD;">global:</span></span>
<span class="line"><span style="color:#A6ACCD;">  user: &quot;tidb&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">  ssh_port: 22</span></span>
<span class="line"><span style="color:#A6ACCD;">  deploy_dir: &quot;/data/tidb-deploy&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">  data_dir: &quot;/data/tidb-data&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">server_configs:</span></span>
<span class="line"><span style="color:#A6ACCD;">  pd:</span></span>
<span class="line"><span style="color:#A6ACCD;">    replication.enable-placement-rules: true</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">pd_servers:</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb_servers:</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">tikv_servers:</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">tiflash_servers:</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">    data_dir: /data/tiflash1/data,/data/tiflash2/data</span></span>
<span class="line"><span style="color:#A6ACCD;">cdc_servers:</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">monitoring_servers:</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">grafana_servers:</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">alertmanager_servers:</span></span>
<span class="line"><span style="color:#A6ACCD;">  - host: 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="部署tidb集群" tabindex="-1">部署TiDB集群 <a class="header-anchor" href="#部署tidb集群" aria-label="Permalink to &quot;部署TiDB集群&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ pwd</span></span>
<span class="line"><span style="color:#A6ACCD;">/home/tidb/tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ export TIUP_MIRRORS=/home/tidb/tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup cluster deploy tidb-test v4.0.2 topology.yaml --user root -p </span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster deploy tidb-test v4.0.2 topology.yaml --user root -p</span></span>
<span class="line"><span style="color:#A6ACCD;">Please confirm your topology:</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster type:    tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster name:    tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster version: v4.0.2</span></span>
<span class="line"><span style="color:#A6ACCD;">Type          Host            Ports                            OS/Arch       Directories</span></span>
<span class="line"><span style="color:#A6ACCD;">----          ----            -----                            -------       -----------</span></span>
<span class="line"><span style="color:#A6ACCD;">pd            192.168.169.41  2379/2380                        linux/x86_64  /data/tidb-deploy/pd-2379,/data/tidb-data/pd-2379</span></span>
<span class="line"><span style="color:#A6ACCD;">pd            192.168.169.42  2379/2380                        linux/x86_64  /data/tidb-deploy/pd-2379,/data/tidb-data/pd-2379</span></span>
<span class="line"><span style="color:#A6ACCD;">pd            192.168.169.43  2379/2380                        linux/x86_64  /data/tidb-deploy/pd-2379,/data/tidb-data/pd-2379</span></span>
<span class="line"><span style="color:#A6ACCD;">tikv          192.168.169.41  20160/20180                      linux/x86_64  /data/tidb-deploy/tikv-20160,/data/tidb-data/tikv-20160</span></span>
<span class="line"><span style="color:#A6ACCD;">tikv          192.168.169.42  20160/20180                      linux/x86_64  /data/tidb-deploy/tikv-20160,/data/tidb-data/tikv-20160</span></span>
<span class="line"><span style="color:#A6ACCD;">tikv          192.168.169.43  20160/20180                      linux/x86_64  /data/tidb-deploy/tikv-20160,/data/tidb-data/tikv-20160</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb          192.168.169.41  4000/10080                       linux/x86_64  /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb          192.168.169.42  4000/10080                       linux/x86_64  /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb          192.168.169.43  4000/10080                       linux/x86_64  /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span style="color:#A6ACCD;">tiflash       192.168.169.43  9000/8123/3930/20170/20292/8234  linux/x86_64  /data/tidb-deploy/tiflash-9000,/data/tiflash1/data,/data/tiflash2/data</span></span>
<span class="line"><span style="color:#A6ACCD;">cdc           192.168.169.41  8300                             linux/x86_64  /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span style="color:#A6ACCD;">cdc           192.168.169.42  8300                             linux/x86_64  /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span style="color:#A6ACCD;">cdc           192.168.169.43  8300                             linux/x86_64  /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span style="color:#A6ACCD;">prometheus    192.168.169.42  9090                             linux/x86_64  /data/tidb-deploy/prometheus-9090,/data/tidb-data/prometheus-9090</span></span>
<span class="line"><span style="color:#A6ACCD;">grafana       192.168.169.42  3000                             linux/x86_64  /data/tidb-deploy/grafana-3000</span></span>
<span class="line"><span style="color:#A6ACCD;">alertmanager  192.168.169.42  9093/9094                        linux/x86_64  /data/tidb-deploy/alertmanager-9093,/data/tidb-data/alertmanager-9093</span></span>
<span class="line"><span style="color:#A6ACCD;">Attention:</span></span>
<span class="line"><span style="color:#A6ACCD;">    1. If the topology is not what you expected, check your yaml file.</span></span>
<span class="line"><span style="color:#A6ACCD;">    2. Please confirm there is no port/directory conflicts in same host.</span></span>
<span class="line"><span style="color:#A6ACCD;">Do you want to continue? [y/N]:  y</span></span>
<span class="line"><span style="color:#A6ACCD;">Input SSH password: </span></span>
<span class="line"><span style="color:#A6ACCD;">+ Generate SSH keys ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">+ Download TiDB components</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download pd:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download tikv:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download tidb:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download tiflash:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download cdc:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download prometheus:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download grafana:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download alertmanager:v0.17.0 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download node_exporter:v0.17.0 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Download blackbox_exporter:v0.12.0 (linux/amd64) ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">+ Initialize target host environments</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Prepare 192.168.169.41:22 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Prepare 192.168.169.42:22 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Prepare 192.168.169.43:22 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">+ Copy files</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy pd -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy pd -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy pd -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy tikv -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy tikv -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy tikv -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy tidb -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy tidb -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy tidb -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy tiflash -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy cdc -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy cdc -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy cdc -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy prometheus -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy grafana -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy alertmanager -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy node_exporter -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy node_exporter -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy node_exporter -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy blackbox_exporter -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy blackbox_exporter -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">  - Copy blackbox_exporter -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span style="color:#A6ACCD;">+ Check status</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component pd</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance pd 192.168.169.43:2379</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance pd 192.168.169.41:2379</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance pd 192.168.169.42:2379</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable pd 192.168.169.42:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable pd 192.168.169.43:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable pd 192.168.169.41:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component tikv</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance tikv 192.168.169.43:20160</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance tikv 192.168.169.41:20160</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance tikv 192.168.169.42:20160</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable tikv 192.168.169.42:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable tikv 192.168.169.43:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable tikv 192.168.169.41:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance tidb 192.168.169.43:4000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance tidb 192.168.169.41:4000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance tidb 192.168.169.42:4000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable tidb 192.168.169.43:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable tidb 192.168.169.42:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable tidb 192.168.169.41:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component tiflash</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance tiflash 192.168.169.43:9000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable tiflash 192.168.169.43:9000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component cdc</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance cdc 192.168.169.43:8300</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance cdc 192.168.169.41:8300</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance cdc 192.168.169.42:8300</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable cdc 192.168.169.43:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable cdc 192.168.169.42:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable cdc 192.168.169.41:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance prometheus 192.168.169.42:9090</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable prometheus 192.168.169.42:9090 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component grafana</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance grafana 192.168.169.42:3000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable grafana 192.168.169.42:3000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Enabling component alertmanager</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enabling instance alertmanager 192.168.169.42:9093</span></span>
<span class="line"><span style="color:#A6ACCD;">	Enable alertmanager 192.168.169.42:9093 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster \`tidb-test\` deployed successfully, you can start it with command: \`tiup cluster start tidb-test\`</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="启动tidb集群" tabindex="-1">启动TiDB集群 <a class="header-anchor" href="#启动tidb集群" aria-label="Permalink to &quot;启动TiDB集群&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup cluster start tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster start tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting cluster tidb-test...</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - SSHKeySet: privateKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa, publicKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa.pub</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - StartCluster</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component pd</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance pd 192.168.169.43:2379</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance pd 192.168.169.42:2379</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance pd 192.168.169.41:2379</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start pd 192.168.169.43:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start pd 192.168.169.42:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start pd 192.168.169.41:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start 192.168.169.41 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start 192.168.169.41 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start 192.168.169.42 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start 192.168.169.42 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start 192.168.169.43 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start 192.168.169.43 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component tikv</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance tikv 192.168.169.43:20160</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance tikv 192.168.169.41:20160</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance tikv 192.168.169.42:20160</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start tikv 192.168.169.41:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start tikv 192.168.169.43:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start tikv 192.168.169.42:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance tidb 192.168.169.43:4000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance tidb 192.168.169.42:4000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance tidb 192.168.169.41:4000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start tidb 192.168.169.41:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start tidb 192.168.169.42:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start tidb 192.168.169.43:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component tiflash</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance tiflash 192.168.169.43:9000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start tiflash 192.168.169.43:9000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component cdc</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance cdc 192.168.169.43:8300</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance cdc 192.168.169.41:8300</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance cdc 192.168.169.42:8300</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start cdc 192.168.169.42:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start cdc 192.168.169.41:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start cdc 192.168.169.43:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance prometheus 192.168.169.42:9090</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start prometheus 192.168.169.42:9090 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component grafana</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance grafana 192.168.169.42:3000</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start grafana 192.168.169.42:3000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component alertmanager</span></span>
<span class="line"><span style="color:#A6ACCD;">	Starting instance alertmanager 192.168.169.42:9093</span></span>
<span class="line"><span style="color:#A6ACCD;">	Start alertmanager 192.168.169.42:9093 success</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - UpdateTopology: cluster=tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Started cluster \`tidb-test\` successfully</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="检查集群状态" tabindex="-1">检查集群状态 <a class="header-anchor" href="#检查集群状态" aria-label="Permalink to &quot;检查集群状态&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 ~]$ tiup cluster display tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster display tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster type:       tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster name:       tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster version:    v4.0.2</span></span>
<span class="line"><span style="color:#A6ACCD;">SSH type:           builtin</span></span>
<span class="line"><span style="color:#A6ACCD;">Dashboard URL:      http://192.168.169.42:2379/dashboard</span></span>
<span class="line"><span style="color:#A6ACCD;">ID                    Role          Host            Ports                            OS/Arch       Status   Data Dir                                 Deploy Dir</span></span>
<span class="line"><span style="color:#A6ACCD;">--                    ----          ----            -----                            -------       ------   --------                                 ----------</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.42:9093   alertmanager  192.168.169.42  9093/9094                        linux/x86_64  Up       /data/tidb-data/alertmanager-9093        /data/tidb-deploy/alertmanager-9093</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.41:8300   cdc           192.168.169.41  8300                             linux/x86_64  Up       -                                        /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.42:8300   cdc           192.168.169.42  8300                             linux/x86_64  Up       -                                        /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.43:8300   cdc           192.168.169.43  8300                             linux/x86_64  Up       -                                        /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.42:3000   grafana       192.168.169.42  3000                             linux/x86_64  Up       -                                        /data/tidb-deploy/grafana-3000</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.41:2379   pd            192.168.169.41  2379/2380                        linux/x86_64  Up       /data/tidb-data/pd-2379                  /data/tidb-deploy/pd-2379</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.42:2379   pd            192.168.169.42  2379/2380                        linux/x86_64  Up|L|UI  /data/tidb-data/pd-2379                  /data/tidb-deploy/pd-2379</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.43:2379   pd            192.168.169.43  2379/2380                        linux/x86_64  Up       /data/tidb-data/pd-2379                  /data/tidb-deploy/pd-2379</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.42:9090   prometheus    192.168.169.42  9090                             linux/x86_64  Up       /data/tidb-data/prometheus-9090          /data/tidb-deploy/prometheus-9090</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.41:4000   tidb          192.168.169.41  4000/10080                       linux/x86_64  Up       -                                        /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.42:4000   tidb          192.168.169.42  4000/10080                       linux/x86_64  Up       -                                        /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.43:4000   tidb          192.168.169.43  4000/10080                       linux/x86_64  Up       -                                        /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.44:9000   tiflash       192.168.169.44  9000/8123/3930/20170/20292/8234  linux/x86_64  Up       /data/tiflash1/data,/data/tiflash2/data  /data/tidb-deploy/tiflash-9000</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.41:20160  tikv          192.168.169.41  20160/20180                      linux/x86_64  Up       /data/tidb-data/tikv-20160               /data/tidb-deploy/tikv-20160</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.42:20160  tikv          192.168.169.42  20160/20180                      linux/x86_64  Up       /data/tidb-data/tikv-20160               /data/tidb-deploy/tikv-20160</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.43:20160  tikv          192.168.169.43  20160/20180                      linux/x86_64  Up       /data/tidb-data/tikv-20160               /data/tidb-deploy/tikv-20160</span></span>
<span class="line"><span style="color:#A6ACCD;">Total nodes: 16</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="tiup卸载集群" tabindex="-1">TiUP卸载集群 <a class="header-anchor" href="#tiup卸载集群" aria-label="Permalink to &quot;TiUP卸载集群&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup cluster clean tidb-test --all</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster clean tidb-test --all</span></span>
<span class="line"><span style="color:#A6ACCD;">This operation will stop tidb v4.0.2 cluster tidb-test and clean its&#39; data and log.</span></span>
<span class="line"><span style="color:#A6ACCD;">Nodes will be ignored: []</span></span>
<span class="line"><span style="color:#A6ACCD;">Roles will be ignored: []</span></span>
<span class="line"><span style="color:#A6ACCD;">Files to be deleted are: </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.42:</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/cdc-8300/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/tidb-4000/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/tikv-20160/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/alertmanager-9093/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-data/alertmanager-9093/*</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-data/prometheus-9090/*</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/pd-2379/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-data/pd-2379/*</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/grafana-3000/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/prometheus-9090/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-data/tikv-20160/*</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.41:</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/pd-2379/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-data/pd-2379/*</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/cdc-8300/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/tidb-4000/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/tikv-20160/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-data/tikv-20160/*</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.169.43:</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/tiflash-9000/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /data/tiflash/data/*</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/tidb-4000/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/tikv-20160/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-data/tikv-20160/*</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/pd-2379/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-data/pd-2379/*</span></span>
<span class="line"><span style="color:#A6ACCD;"> /tidb-deploy/cdc-8300/log/*.log</span></span>
<span class="line"><span style="color:#A6ACCD;">Do you want to continue? [y/N]: y</span></span>
<span class="line"><span style="color:#A6ACCD;">Cleanup cluster...</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - SSHKeySet: privateKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa, publicKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa.pub</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - StopCluster</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component alertmanager</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop alertmanager 192.168.169.42:9093 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component grafana</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop grafana 192.168.169.42:3000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop prometheus 192.168.169.42:9090 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component cdc</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop cdc 192.168.169.42:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop cdc 192.168.169.41:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop cdc 192.168.169.43:8300 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component tiflash</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop tiflash 192.168.169.43:9000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop tidb 192.168.169.42:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop tidb 192.168.169.41:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop tidb 192.168.169.43:4000 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component tikv</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop tikv 192.168.169.42:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop tikv 192.168.169.43:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop tikv 192.168.169.41:20160 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component pd</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stopping instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop pd 192.168.169.41:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop pd 192.168.169.43:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">	Stop pd 192.168.169.42:2379 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component node_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">Stopping component blackbox_exporter</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - CleanupCluster</span></span>
<span class="line"><span style="color:#A6ACCD;">Cleanup instance 192.168.169.43</span></span>
<span class="line"><span style="color:#A6ACCD;">Cleanup 192.168.169.43 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Cleanup instance 192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">Cleanup 192.168.169.42 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Cleanup instance 192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;">Cleanup 192.168.169.41 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Cleanup cluster \`tidb-test\` successfully</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup install tiflash:v4.0.2</span></span>
<span class="line"><span style="color:#A6ACCD;">component tiflash version v4.0.2 is already installed</span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup clean tiflash:v4.0.2</span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup uninstall tiflash:v4.0.2</span></span>
<span class="line"><span style="color:#A6ACCD;">Uninstalled component \`tiflash:v4.0.2\` successfully!</span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup clean tiflash:v4.0.2</span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup install tiflash:v4.0.2</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="常见错误解决" tabindex="-1">常见错误解决 <a class="header-anchor" href="#常见错误解决" aria-label="Permalink to &quot;常见错误解决&quot;">​</a></h2><p>最开始安装过一次，以为tiflash必须要配置两个才能来起来，所以想尝试重新部署一次</p><p>但是正常 tiup clean --all 删除所有组件之后，修改topology.yaml的tiflash配置重新部署，出现如下报错</p><p>解决方案为，进入/home/tidb/.tiup/storage/cluster/clusters目录下删除tidb-test的文件</p><p>本人猜测可能是clean的时候没有将这部分文件一起删除导致的</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb41 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ </span><span style="color:#C792EA;">export</span><span style="color:#A6ACCD;"> TIUP_MIRRORS</span><span style="color:#89DDFF;">=</span><span style="color:#C3E88D;">/home/tidb/tidb-community-server-v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#C3E88D;">-linux-amd64</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb41 </span><span style="color:#89DDFF;">~]</span><span style="color:#A6ACCD;">$ tiup cluster deploy tidb-test v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;"> topology.yaml --user root -p </span></span>
<span class="line"><span style="color:#FFCB6B;">Starting</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">component</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#FFCB6B;">cluster</span><span style="color:#89DDFF;">\`</span><span style="color:#82AAFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">/home/tidb/.tiup/components/cluster/v1.</span><span style="color:#F78C6C;">3.1</span><span style="color:#C3E88D;">/tiup-cluster</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">deploy</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">tidb-test</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">v4.</span><span style="color:#F78C6C;">0.2</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">topology.yaml</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--user</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">root</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">-p</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">Error:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">Cluster</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">name</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">tidb-test</span><span style="color:#89DDFF;">&#39;</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">is</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">duplicated</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">deploy.name_dup</span><span style="color:#89DDFF;">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">Please</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">specify</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">another</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">cluster</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">name</span></span>
<span class="line"><span style="color:#FFCB6B;">Error:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">run</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#FFCB6B;">/home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">wd:/home/tidb/.tiup/data/SLZjdQu</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">failed:</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">exit</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">status</span><span style="color:#A6ACCD;"> </span><span style="color:#F78C6C;">1</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># 解决方式</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb41 clusters</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ pwd</span></span>
<span class="line"><span style="color:#FFCB6B;">/home/tidb/.tiup/storage/cluster/clusters</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;">tidb@tiup-tidb41 clusters</span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;">$ rm -rf tidb-test/</span></span>
<span class="line"></span></code></pre></div>`,30),e=[o];function t(c,i,r,C,A,y){return a(),n("div",null,e)}const b=s(p,[["render",t]]);export{d as __pageData,b as default};
