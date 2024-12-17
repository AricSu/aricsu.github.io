import{_ as n,c as a,a5 as p,o as i}from"./chunks/framework.PytyN_aB.js";const k=JSON.parse('{"title":"TiDB-TiUP工具集群离线部署方案","description":"","frontmatter":{},"headers":[],"relativePath":"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/01TiUP 离线部署 TiDB.md","filePath":"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/01TiUP 离线部署 TiDB.md"}'),l={name:"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/01TiUP 离线部署 TiDB.md"};function t(e,s,c,d,r,o){return i(),a("div",null,s[0]||(s[0]=[p(`<h1 id="tidb-tiup工具集群离线部署方案" tabindex="-1">TiDB-TiUP工具集群离线部署方案 <a class="header-anchor" href="#tidb-tiup工具集群离线部署方案" aria-label="Permalink to &quot;TiDB-TiUP工具集群离线部署方案&quot;">​</a></h1><p>时间：2020-12-25</p><blockquote><ul><li><a href="#下载TiUP离线组件">下载TiUP离线组件</a></li><li><a href="#下载TiUP离线组件">TiKV数据盘挂载</a></li><li><a href="#配置topology配置文件">配置topology配置文件</a></li><li><a href="#部署TiDB集群">部署TiDB集群</a></li><li><a href="#检查集群状态">检查集群状态</a></li><li><a href="#TiUP卸载集群">TiUP卸载集群</a></li><li><a href="#常见错误解决">常见错误解决</a></li></ul></blockquote><blockquote><p><strong>IP规划</strong></p></blockquote><table tabindex="0"><thead><tr><th>IP地址</th><th>Role信息</th><th>备注</th></tr></thead><tbody><tr><td>192.168.169.41</td><td>pd+tikv+tidb+cdc</td><td>部署TiUP主机</td></tr><tr><td>192.168.169.42</td><td>pd+tikv+tidb+cdc+prometheus+grafana+alertmanager</td><td></td></tr><tr><td>192.168.169.43</td><td>pd+tikv+tidb+cdc</td><td></td></tr><tr><td>192.168.169.44</td><td>tiflash</td><td></td></tr></tbody></table><h2 id="下载tiup离线组件" tabindex="-1">下载TiUP离线组件 <a class="header-anchor" href="#下载tiup离线组件" aria-label="Permalink to &quot;下载TiUP离线组件&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[root@tiup-tidb41 ~]# useradd tidb</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# passwd tidb</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tidb-tidb41 ~]# visudo</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tidb-tidb41 ~]# tail -1 /etc/sudoers</span></span>
<span class="line"><span>tidb ALL=(ALL) NOPASSWD: ALL</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# su - tidb</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[tidb@tiup-tidb44 ~]$ curl --proto &#39;=https&#39; --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh</span></span>
<span class="line"><span>  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current</span></span>
<span class="line"><span>                                 Dload  Upload   Total   Spent    Left  Speed</span></span>
<span class="line"><span> 23 8697k   23 2015k    0     0   303k      0  0:00:28  0:00:06  0:00:22  417k</span></span></code></pre></div><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># \${version} 替换为需要下载的版本名称，如：v4.0.2、v5.0.0-rc等</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb44 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]$ tiup mirror clone tidb-community-server-\${version}-linux-amd64 \${version} --os</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">linux</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> --arch</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">amd64</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Start</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> to</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> clone</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mirror,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> targetDir</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> is</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb-community-server-v4.0.2-linux-amd64,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> selectedVersions</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> are</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> []</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">If</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> this</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> does</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> not</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> meet</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> expectations,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> please</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> abort</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> this</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> process,</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> read</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tiup</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mirror clone </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">--help</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> and</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> again</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Arch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [amd64]</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [linux]</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">......</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">......</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">download</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://tiup-mirrors.pingcap.com/tiup-linux-amd64.tar.gz</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 8.49</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MiB</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 8.49</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MiB</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 100.00%</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 806.71</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> KiB</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> p/s</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb44 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]$ ll</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">total</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">drwxr-xr-x.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 172</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Jan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  9</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 11:40</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb44 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]$ cd tidb-community-server-v4.0.2-linux-amd64/</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb44 tidb-community-server-v4.0.2-linux-amd64]$ ll</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb44 tidb-community-server-v4.0.2-linux-amd64]$ ./local_install.sh </span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb44 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]$ tar -cvf tidb-community-server-v4.0.2-linux-amd64.tar.gz tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb44 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]$ ll -lrth</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">total</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 1.5G</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">drwxr-xr-x.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 4.0K</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Jan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  9</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 00:26</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-rw-rw-r--.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 1.5G</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Jan</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  9</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> 00:28</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb-community-server-v4.0.2-linux-amd64.tar.gz</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb44 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]$ scp tidb-community-server-v4.0.2-linux-amd64.tar.gz 192.168.169.41:/home/tidb/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Warning:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Permanently</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> added</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;192.168.169.41&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (ECDSA) to the list of known hosts.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tidb@192.168.169.41</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">&#39;s password: </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tidb-community-server-v4.0.2-linux-amd64.tar.gz                                                                                                                                  56%  869MB 129.1MB/s   00:05 ETA</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">[tidb@tiup-tidb41 ~]$ tar -xvf tidb-community-server-v4.0.2-linux-amd64.tar.gz </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tidb-community-server-v4.0.2-linux-amd64/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">......</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">......</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tidb-community-server-v4.0.2-linux-amd64/local_install.sh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">[tidb@tiup-tidb41 ~]$ ll -lrth</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">total 1.5G</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">drwxr-xr-x. 3 tidb tidb 4.0K Jan  9 00:26 tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">-rw-rw-r--. 1 tidb tidb 1.5G Jan  9 00:30 tidb-community-server-v4.0.2-linux-amd64.tar.gz</span></span></code></pre></div><p>安装组件</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[tidb@tiup-tidb41 ~]$ cd tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ ll |grep install</span></span>
<span class="line"><span>-rwxr-xr-x. 1 tidb tidb      2086 Jan  9 00:26 local_install.sh</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ sh local_install.sh </span></span>
<span class="line"><span>Set mirror to /home/tidb/tidb-community-server-v4.0.2-linux-amd64 success</span></span>
<span class="line"><span>Detected shell: bash</span></span>
<span class="line"><span>Shell profile:  /home/tidb/.bash_profile</span></span>
<span class="line"><span>/home/tidb/.bash_profile has been modified to to add tiup to PATH</span></span>
<span class="line"><span>open a new terminal or source /home/tidb/.bash_profile to use it</span></span>
<span class="line"><span>Installed path: /home/tidb/.tiup/bin/tiup</span></span>
<span class="line"><span>===============================================</span></span>
<span class="line"><span>1. source /home/tidb/.bash_profile</span></span>
<span class="line"><span>2. Have a try:   tiup playground</span></span>
<span class="line"><span>===============================================</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ source /home/tidb/.bash_profile</span></span></code></pre></div><h2 id="tikv数据盘挂载" tabindex="-1">TiKV数据盘挂载 <a class="header-anchor" href="#tikv数据盘挂载" aria-label="Permalink to &quot;TiKV数据盘挂载&quot;">​</a></h2><p>修改HHD的磁盘</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[root@tiup-tidb41 ~]# fdisk -l</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Disk /dev/sda: 107.4 GB, 107374182400 bytes, 209715200 sectors</span></span>
<span class="line"><span>Units = sectors of 1 * 512 = 512 bytes</span></span>
<span class="line"><span>Sector size (logical/physical): 512 bytes / 512 bytes</span></span>
<span class="line"><span>I/O size (minimum/optimal): 512 bytes / 512 bytes</span></span>
<span class="line"><span>Disk label type: dos</span></span>
<span class="line"><span>Disk identifier: 0x000a1f1f</span></span>
<span class="line"><span></span></span>
<span class="line"><span>   Device Boot      Start         End      Blocks   Id  System</span></span>
<span class="line"><span>/dev/sda1   *        2048      391167      194560   83  Linux</span></span>
<span class="line"><span>/dev/sda2          391168   199628799    99618816   8e  Linux LVM</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Disk /dev/sdb: 107.4 GB, 107374182400 bytes, 209715200 sectors</span></span>
<span class="line"><span>Units = sectors of 1 * 512 = 512 bytes</span></span>
<span class="line"><span>Sector size (logical/physical): 512 bytes / 512 bytes</span></span>
<span class="line"><span>I/O size (minimum/optimal): 512 bytes / 512 bytes</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>Disk /dev/mapper/centos-root: 102.0 GB, 102001278976 bytes, 199221248 sectors</span></span>
<span class="line"><span>Units = sectors of 1 * 512 = 512 bytes</span></span>
<span class="line"><span>Sector size (logical/physical): 512 bytes / 512 bytes</span></span>
<span class="line"><span>I/O size (minimum/optimal): 512 bytes / 512 bytes</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# parted -s -a optimal /dev/sdb mklabel gpt -- mkpart primary ext4 1 -1</span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# ll /dev/sd*</span></span>
<span class="line"><span>brw-rw----. 1 root disk 8,  0 Jan  8 23:29 /dev/sda</span></span>
<span class="line"><span>brw-rw----. 1 root disk 8,  1 Jan  8 23:29 /dev/sda1</span></span>
<span class="line"><span>brw-rw----. 1 root disk 8,  2 Jan  8 23:29 /dev/sda2</span></span>
<span class="line"><span>brw-rw----. 1 root disk 8, 16 Jan  8 23:46 /dev/sdb</span></span>
<span class="line"><span>brw-rw----. 1 root disk 8, 17 Jan  8 23:46 /dev/sdb1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# mkfs.ext4 /dev/sdb1 </span></span>
<span class="line"><span>mke2fs 1.42.9 (28-Dec-2013)</span></span>
<span class="line"><span>Filesystem label=</span></span>
<span class="line"><span>OS type: Linux</span></span>
<span class="line"><span>Block size=4096 (log=2)</span></span>
<span class="line"><span>Fragment size=4096 (log=2)</span></span>
<span class="line"><span>Stride=0 blocks, Stripe width=0 blocks</span></span>
<span class="line"><span>6553600 inodes, 26213888 blocks</span></span>
<span class="line"><span>1310694 blocks (5.00%) reserved for the super user</span></span>
<span class="line"><span>First data block=0</span></span>
<span class="line"><span>Maximum filesystem blocks=2174746624</span></span>
<span class="line"><span>800 block groups</span></span>
<span class="line"><span>32768 blocks per group, 32768 fragments per group</span></span>
<span class="line"><span>8192 inodes per group</span></span>
<span class="line"><span>Superblock backups stored on blocks: </span></span>
<span class="line"><span>	32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208, </span></span>
<span class="line"><span>	4096000, 7962624, 11239424, 20480000, 23887872</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Allocating group tables: done                            </span></span>
<span class="line"><span>Writing inode tables: done                            </span></span>
<span class="line"><span>Creating journal (32768 blocks): done</span></span>
<span class="line"><span>Writing superblocks and filesystem accounting information: done   </span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# lsblk -f</span></span>
<span class="line"><span>NAME            FSTYPE      LABEL UUID                                   MOUNTPOINT</span></span>
<span class="line"><span>sda                                                                      </span></span>
<span class="line"><span>├─sda1          xfs               f5186353-9452-4395-9549-0e0f05401910   /boot</span></span>
<span class="line"><span>└─sda2          LVM2_member       QjWT3C-PmGV-bIBK-kjxs-zGGE-xnLB-Kqyewx </span></span>
<span class="line"><span>  └─centos-root xfs               1c8f5bee-8e88-44d7-99c0-c5d8b1d621bb   /</span></span>
<span class="line"><span>sdb                                                                      </span></span>
<span class="line"><span>└─sdb1          ext4              003d05ff-6e97-49ec-abf4-b86be07754b8   </span></span>
<span class="line"><span>sr0                                                                      </span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# vi /etc/fstab </span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# tail -1 /etc/fstab </span></span>
<span class="line"><span>UUID=003d05ff-6e97-49ec-abf4-b86be07754b8 /data ext4    defaults,nodelalloc,noatime       0 2</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# mkdir /data</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# mount -a</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[root@tiup-tidb41 ~]# mount -t ext4</span></span>
<span class="line"><span>/dev/sdb1 on /data type ext4 (rw,noatime,seclabel,nodelalloc,data=ordered)</span></span></code></pre></div><h2 id="配置topology配置文件" tabindex="-1">配置topology配置文件 <a class="header-anchor" href="#配置topology配置文件" aria-label="Permalink to &quot;配置topology配置文件&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ vi topology.yaml</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ cat topology.yaml</span></span>
<span class="line"><span># # Global variables are applied to all deployments and used as the default value of</span></span>
<span class="line"><span># # the deployments if a specific deployment value is missing.</span></span>
<span class="line"><span>global:</span></span>
<span class="line"><span>  user: &quot;tidb&quot;</span></span>
<span class="line"><span>  ssh_port: 22</span></span>
<span class="line"><span>  deploy_dir: &quot;/data/tidb-deploy&quot;</span></span>
<span class="line"><span>  data_dir: &quot;/data/tidb-data&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>server_configs:</span></span>
<span class="line"><span>  pd:</span></span>
<span class="line"><span>    replication.enable-placement-rules: true</span></span>
<span class="line"><span></span></span>
<span class="line"><span>pd_servers:</span></span>
<span class="line"><span>  - host: 192.168.169.41</span></span>
<span class="line"><span>  - host: 192.168.169.42</span></span>
<span class="line"><span>  - host: 192.168.169.43</span></span>
<span class="line"><span>tidb_servers:</span></span>
<span class="line"><span>  - host: 192.168.169.41</span></span>
<span class="line"><span>  - host: 192.168.169.42</span></span>
<span class="line"><span>  - host: 192.168.169.43</span></span>
<span class="line"><span>tikv_servers:</span></span>
<span class="line"><span>  - host: 192.168.169.41</span></span>
<span class="line"><span>  - host: 192.168.169.42</span></span>
<span class="line"><span>  - host: 192.168.169.43</span></span>
<span class="line"><span>tiflash_servers:</span></span>
<span class="line"><span>  - host: 192.168.169.43</span></span>
<span class="line"><span>    data_dir: /data/tiflash1/data,/data/tiflash2/data</span></span>
<span class="line"><span>cdc_servers:</span></span>
<span class="line"><span>  - host: 192.168.169.41</span></span>
<span class="line"><span>  - host: 192.168.169.42</span></span>
<span class="line"><span>  - host: 192.168.169.43</span></span>
<span class="line"><span>monitoring_servers:</span></span>
<span class="line"><span>  - host: 192.168.169.42</span></span>
<span class="line"><span>grafana_servers:</span></span>
<span class="line"><span>  - host: 192.168.169.42</span></span>
<span class="line"><span>alertmanager_servers:</span></span>
<span class="line"><span>  - host: 192.168.169.42</span></span></code></pre></div><h2 id="部署tidb集群" tabindex="-1">部署TiDB集群 <a class="header-anchor" href="#部署tidb集群" aria-label="Permalink to &quot;部署TiDB集群&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ pwd</span></span>
<span class="line"><span>/home/tidb/tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ export TIUP_MIRRORS=/home/tidb/tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup cluster deploy tidb-test v4.0.2 topology.yaml --user root -p </span></span>
<span class="line"><span>Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster deploy tidb-test v4.0.2 topology.yaml --user root -p</span></span>
<span class="line"><span>Please confirm your topology:</span></span>
<span class="line"><span>Cluster type:    tidb</span></span>
<span class="line"><span>Cluster name:    tidb-test</span></span>
<span class="line"><span>Cluster version: v4.0.2</span></span>
<span class="line"><span>Type          Host            Ports                            OS/Arch       Directories</span></span>
<span class="line"><span>----          ----            -----                            -------       -----------</span></span>
<span class="line"><span>pd            192.168.169.41  2379/2380                        linux/x86_64  /data/tidb-deploy/pd-2379,/data/tidb-data/pd-2379</span></span>
<span class="line"><span>pd            192.168.169.42  2379/2380                        linux/x86_64  /data/tidb-deploy/pd-2379,/data/tidb-data/pd-2379</span></span>
<span class="line"><span>pd            192.168.169.43  2379/2380                        linux/x86_64  /data/tidb-deploy/pd-2379,/data/tidb-data/pd-2379</span></span>
<span class="line"><span>tikv          192.168.169.41  20160/20180                      linux/x86_64  /data/tidb-deploy/tikv-20160,/data/tidb-data/tikv-20160</span></span>
<span class="line"><span>tikv          192.168.169.42  20160/20180                      linux/x86_64  /data/tidb-deploy/tikv-20160,/data/tidb-data/tikv-20160</span></span>
<span class="line"><span>tikv          192.168.169.43  20160/20180                      linux/x86_64  /data/tidb-deploy/tikv-20160,/data/tidb-data/tikv-20160</span></span>
<span class="line"><span>tidb          192.168.169.41  4000/10080                       linux/x86_64  /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span>tidb          192.168.169.42  4000/10080                       linux/x86_64  /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span>tidb          192.168.169.43  4000/10080                       linux/x86_64  /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span>tiflash       192.168.169.43  9000/8123/3930/20170/20292/8234  linux/x86_64  /data/tidb-deploy/tiflash-9000,/data/tiflash1/data,/data/tiflash2/data</span></span>
<span class="line"><span>cdc           192.168.169.41  8300                             linux/x86_64  /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span>cdc           192.168.169.42  8300                             linux/x86_64  /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span>cdc           192.168.169.43  8300                             linux/x86_64  /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span>prometheus    192.168.169.42  9090                             linux/x86_64  /data/tidb-deploy/prometheus-9090,/data/tidb-data/prometheus-9090</span></span>
<span class="line"><span>grafana       192.168.169.42  3000                             linux/x86_64  /data/tidb-deploy/grafana-3000</span></span>
<span class="line"><span>alertmanager  192.168.169.42  9093/9094                        linux/x86_64  /data/tidb-deploy/alertmanager-9093,/data/tidb-data/alertmanager-9093</span></span>
<span class="line"><span>Attention:</span></span>
<span class="line"><span>    1. If the topology is not what you expected, check your yaml file.</span></span>
<span class="line"><span>    2. Please confirm there is no port/directory conflicts in same host.</span></span>
<span class="line"><span>Do you want to continue? [y/N]:  y</span></span>
<span class="line"><span>Input SSH password: </span></span>
<span class="line"><span>+ Generate SSH keys ... Done</span></span>
<span class="line"><span>+ Download TiDB components</span></span>
<span class="line"><span>  - Download pd:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download tikv:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download tidb:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download tiflash:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download cdc:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download prometheus:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download grafana:v4.0.2 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download alertmanager:v0.17.0 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download node_exporter:v0.17.0 (linux/amd64) ... Done</span></span>
<span class="line"><span>  - Download blackbox_exporter:v0.12.0 (linux/amd64) ... Done</span></span>
<span class="line"><span>+ Initialize target host environments</span></span>
<span class="line"><span>  - Prepare 192.168.169.41:22 ... Done</span></span>
<span class="line"><span>  - Prepare 192.168.169.42:22 ... Done</span></span>
<span class="line"><span>  - Prepare 192.168.169.43:22 ... Done</span></span>
<span class="line"><span>+ Copy files</span></span>
<span class="line"><span>  - Copy pd -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span>  - Copy pd -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy pd -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span>  - Copy tikv -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span>  - Copy tikv -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy tikv -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span>  - Copy tidb -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span>  - Copy tidb -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy tidb -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span>  - Copy tiflash -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span>  - Copy cdc -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span>  - Copy cdc -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy cdc -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span>  - Copy prometheus -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy grafana -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy alertmanager -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy node_exporter -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span>  - Copy node_exporter -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy node_exporter -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span>  - Copy blackbox_exporter -&gt; 192.168.169.42 ... Done</span></span>
<span class="line"><span>  - Copy blackbox_exporter -&gt; 192.168.169.43 ... Done</span></span>
<span class="line"><span>  - Copy blackbox_exporter -&gt; 192.168.169.41 ... Done</span></span>
<span class="line"><span>+ Check status</span></span>
<span class="line"><span>Enabling component pd</span></span>
<span class="line"><span>	Enabling instance pd 192.168.169.43:2379</span></span>
<span class="line"><span>	Enabling instance pd 192.168.169.41:2379</span></span>
<span class="line"><span>	Enabling instance pd 192.168.169.42:2379</span></span>
<span class="line"><span>	Enable pd 192.168.169.42:2379 success</span></span>
<span class="line"><span>	Enable pd 192.168.169.43:2379 success</span></span>
<span class="line"><span>	Enable pd 192.168.169.41:2379 success</span></span>
<span class="line"><span>Enabling component node_exporter</span></span>
<span class="line"><span>Enabling component blackbox_exporter</span></span>
<span class="line"><span>Enabling component node_exporter</span></span>
<span class="line"><span>Enabling component blackbox_exporter</span></span>
<span class="line"><span>Enabling component node_exporter</span></span>
<span class="line"><span>Enabling component blackbox_exporter</span></span>
<span class="line"><span>Enabling component tikv</span></span>
<span class="line"><span>	Enabling instance tikv 192.168.169.43:20160</span></span>
<span class="line"><span>	Enabling instance tikv 192.168.169.41:20160</span></span>
<span class="line"><span>	Enabling instance tikv 192.168.169.42:20160</span></span>
<span class="line"><span>	Enable tikv 192.168.169.42:20160 success</span></span>
<span class="line"><span>	Enable tikv 192.168.169.43:20160 success</span></span>
<span class="line"><span>	Enable tikv 192.168.169.41:20160 success</span></span>
<span class="line"><span>Enabling component tidb</span></span>
<span class="line"><span>	Enabling instance tidb 192.168.169.43:4000</span></span>
<span class="line"><span>	Enabling instance tidb 192.168.169.41:4000</span></span>
<span class="line"><span>	Enabling instance tidb 192.168.169.42:4000</span></span>
<span class="line"><span>	Enable tidb 192.168.169.43:4000 success</span></span>
<span class="line"><span>	Enable tidb 192.168.169.42:4000 success</span></span>
<span class="line"><span>	Enable tidb 192.168.169.41:4000 success</span></span>
<span class="line"><span>Enabling component tiflash</span></span>
<span class="line"><span>	Enabling instance tiflash 192.168.169.43:9000</span></span>
<span class="line"><span>	Enable tiflash 192.168.169.43:9000 success</span></span>
<span class="line"><span>Enabling component cdc</span></span>
<span class="line"><span>	Enabling instance cdc 192.168.169.43:8300</span></span>
<span class="line"><span>	Enabling instance cdc 192.168.169.41:8300</span></span>
<span class="line"><span>	Enabling instance cdc 192.168.169.42:8300</span></span>
<span class="line"><span>	Enable cdc 192.168.169.43:8300 success</span></span>
<span class="line"><span>	Enable cdc 192.168.169.42:8300 success</span></span>
<span class="line"><span>	Enable cdc 192.168.169.41:8300 success</span></span>
<span class="line"><span>Enabling component prometheus</span></span>
<span class="line"><span>	Enabling instance prometheus 192.168.169.42:9090</span></span>
<span class="line"><span>	Enable prometheus 192.168.169.42:9090 success</span></span>
<span class="line"><span>Enabling component grafana</span></span>
<span class="line"><span>	Enabling instance grafana 192.168.169.42:3000</span></span>
<span class="line"><span>	Enable grafana 192.168.169.42:3000 success</span></span>
<span class="line"><span>Enabling component alertmanager</span></span>
<span class="line"><span>	Enabling instance alertmanager 192.168.169.42:9093</span></span>
<span class="line"><span>	Enable alertmanager 192.168.169.42:9093 success</span></span>
<span class="line"><span>Cluster \`tidb-test\` deployed successfully, you can start it with command: \`tiup cluster start tidb-test\`</span></span></code></pre></div><h2 id="启动tidb集群" tabindex="-1">启动TiDB集群 <a class="header-anchor" href="#启动tidb集群" aria-label="Permalink to &quot;启动TiDB集群&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup cluster start tidb-test</span></span>
<span class="line"><span>Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster start tidb-test</span></span>
<span class="line"><span>Starting cluster tidb-test...</span></span>
<span class="line"><span>+ [ Serial ] - SSHKeySet: privateKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa, publicKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa.pub</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [ Serial ] - StartCluster</span></span>
<span class="line"><span>Starting component pd</span></span>
<span class="line"><span>	Starting instance pd 192.168.169.43:2379</span></span>
<span class="line"><span>	Starting instance pd 192.168.169.42:2379</span></span>
<span class="line"><span>	Starting instance pd 192.168.169.41:2379</span></span>
<span class="line"><span>	Start pd 192.168.169.43:2379 success</span></span>
<span class="line"><span>	Start pd 192.168.169.42:2379 success</span></span>
<span class="line"><span>	Start pd 192.168.169.41:2379 success</span></span>
<span class="line"><span>Starting component node_exporter</span></span>
<span class="line"><span>	Starting instance 192.168.169.41</span></span>
<span class="line"><span>	Start 192.168.169.41 success</span></span>
<span class="line"><span>Starting component blackbox_exporter</span></span>
<span class="line"><span>	Starting instance 192.168.169.41</span></span>
<span class="line"><span>	Start 192.168.169.41 success</span></span>
<span class="line"><span>Starting component node_exporter</span></span>
<span class="line"><span>	Starting instance 192.168.169.42</span></span>
<span class="line"><span>	Start 192.168.169.42 success</span></span>
<span class="line"><span>Starting component blackbox_exporter</span></span>
<span class="line"><span>	Starting instance 192.168.169.42</span></span>
<span class="line"><span>	Start 192.168.169.42 success</span></span>
<span class="line"><span>Starting component node_exporter</span></span>
<span class="line"><span>	Starting instance 192.168.169.43</span></span>
<span class="line"><span>	Start 192.168.169.43 success</span></span>
<span class="line"><span>Starting component blackbox_exporter</span></span>
<span class="line"><span>	Starting instance 192.168.169.43</span></span>
<span class="line"><span>	Start 192.168.169.43 success</span></span>
<span class="line"><span>Starting component tikv</span></span>
<span class="line"><span>	Starting instance tikv 192.168.169.43:20160</span></span>
<span class="line"><span>	Starting instance tikv 192.168.169.41:20160</span></span>
<span class="line"><span>	Starting instance tikv 192.168.169.42:20160</span></span>
<span class="line"><span>	Start tikv 192.168.169.41:20160 success</span></span>
<span class="line"><span>	Start tikv 192.168.169.43:20160 success</span></span>
<span class="line"><span>	Start tikv 192.168.169.42:20160 success</span></span>
<span class="line"><span>Starting component tidb</span></span>
<span class="line"><span>	Starting instance tidb 192.168.169.43:4000</span></span>
<span class="line"><span>	Starting instance tidb 192.168.169.42:4000</span></span>
<span class="line"><span>	Starting instance tidb 192.168.169.41:4000</span></span>
<span class="line"><span>	Start tidb 192.168.169.41:4000 success</span></span>
<span class="line"><span>	Start tidb 192.168.169.42:4000 success</span></span>
<span class="line"><span>	Start tidb 192.168.169.43:4000 success</span></span>
<span class="line"><span>Starting component tiflash</span></span>
<span class="line"><span>	Starting instance tiflash 192.168.169.43:9000</span></span>
<span class="line"><span>	Start tiflash 192.168.169.43:9000 success</span></span>
<span class="line"><span>Starting component cdc</span></span>
<span class="line"><span>	Starting instance cdc 192.168.169.43:8300</span></span>
<span class="line"><span>	Starting instance cdc 192.168.169.41:8300</span></span>
<span class="line"><span>	Starting instance cdc 192.168.169.42:8300</span></span>
<span class="line"><span>	Start cdc 192.168.169.42:8300 success</span></span>
<span class="line"><span>	Start cdc 192.168.169.41:8300 success</span></span>
<span class="line"><span>	Start cdc 192.168.169.43:8300 success</span></span>
<span class="line"><span>Starting component prometheus</span></span>
<span class="line"><span>	Starting instance prometheus 192.168.169.42:9090</span></span>
<span class="line"><span>	Start prometheus 192.168.169.42:9090 success</span></span>
<span class="line"><span>Starting component grafana</span></span>
<span class="line"><span>	Starting instance grafana 192.168.169.42:3000</span></span>
<span class="line"><span>	Start grafana 192.168.169.42:3000 success</span></span>
<span class="line"><span>Starting component alertmanager</span></span>
<span class="line"><span>	Starting instance alertmanager 192.168.169.42:9093</span></span>
<span class="line"><span>	Start alertmanager 192.168.169.42:9093 success</span></span>
<span class="line"><span>+ [ Serial ] - UpdateTopology: cluster=tidb-test</span></span>
<span class="line"><span>Started cluster \`tidb-test\` successfully</span></span></code></pre></div><h2 id="检查集群状态" tabindex="-1">检查集群状态 <a class="header-anchor" href="#检查集群状态" aria-label="Permalink to &quot;检查集群状态&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[tidb@tiup-tidb41 ~]$ tiup cluster display tidb-test</span></span>
<span class="line"><span>Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster display tidb-test</span></span>
<span class="line"><span>Cluster type:       tidb</span></span>
<span class="line"><span>Cluster name:       tidb-test</span></span>
<span class="line"><span>Cluster version:    v4.0.2</span></span>
<span class="line"><span>SSH type:           builtin</span></span>
<span class="line"><span>Dashboard URL:      http://192.168.169.42:2379/dashboard</span></span>
<span class="line"><span>ID                    Role          Host            Ports                            OS/Arch       Status   Data Dir                                 Deploy Dir</span></span>
<span class="line"><span>--                    ----          ----            -----                            -------       ------   --------                                 ----------</span></span>
<span class="line"><span>192.168.169.42:9093   alertmanager  192.168.169.42  9093/9094                        linux/x86_64  Up       /data/tidb-data/alertmanager-9093        /data/tidb-deploy/alertmanager-9093</span></span>
<span class="line"><span>192.168.169.41:8300   cdc           192.168.169.41  8300                             linux/x86_64  Up       -                                        /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span>192.168.169.42:8300   cdc           192.168.169.42  8300                             linux/x86_64  Up       -                                        /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span>192.168.169.43:8300   cdc           192.168.169.43  8300                             linux/x86_64  Up       -                                        /data/tidb-deploy/cdc-8300</span></span>
<span class="line"><span>192.168.169.42:3000   grafana       192.168.169.42  3000                             linux/x86_64  Up       -                                        /data/tidb-deploy/grafana-3000</span></span>
<span class="line"><span>192.168.169.41:2379   pd            192.168.169.41  2379/2380                        linux/x86_64  Up       /data/tidb-data/pd-2379                  /data/tidb-deploy/pd-2379</span></span>
<span class="line"><span>192.168.169.42:2379   pd            192.168.169.42  2379/2380                        linux/x86_64  Up|L|UI  /data/tidb-data/pd-2379                  /data/tidb-deploy/pd-2379</span></span>
<span class="line"><span>192.168.169.43:2379   pd            192.168.169.43  2379/2380                        linux/x86_64  Up       /data/tidb-data/pd-2379                  /data/tidb-deploy/pd-2379</span></span>
<span class="line"><span>192.168.169.42:9090   prometheus    192.168.169.42  9090                             linux/x86_64  Up       /data/tidb-data/prometheus-9090          /data/tidb-deploy/prometheus-9090</span></span>
<span class="line"><span>192.168.169.41:4000   tidb          192.168.169.41  4000/10080                       linux/x86_64  Up       -                                        /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span>192.168.169.42:4000   tidb          192.168.169.42  4000/10080                       linux/x86_64  Up       -                                        /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span>192.168.169.43:4000   tidb          192.168.169.43  4000/10080                       linux/x86_64  Up       -                                        /data/tidb-deploy/tidb-4000</span></span>
<span class="line"><span>192.168.169.44:9000   tiflash       192.168.169.44  9000/8123/3930/20170/20292/8234  linux/x86_64  Up       /data/tiflash1/data,/data/tiflash2/data  /data/tidb-deploy/tiflash-9000</span></span>
<span class="line"><span>192.168.169.41:20160  tikv          192.168.169.41  20160/20180                      linux/x86_64  Up       /data/tidb-data/tikv-20160               /data/tidb-deploy/tikv-20160</span></span>
<span class="line"><span>192.168.169.42:20160  tikv          192.168.169.42  20160/20180                      linux/x86_64  Up       /data/tidb-data/tikv-20160               /data/tidb-deploy/tikv-20160</span></span>
<span class="line"><span>192.168.169.43:20160  tikv          192.168.169.43  20160/20180                      linux/x86_64  Up       /data/tidb-data/tikv-20160               /data/tidb-deploy/tikv-20160</span></span>
<span class="line"><span>Total nodes: 16</span></span></code></pre></div><h2 id="tiup卸载集群" tabindex="-1">TiUP卸载集群 <a class="header-anchor" href="#tiup卸载集群" aria-label="Permalink to &quot;TiUP卸载集群&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup cluster clean tidb-test --all</span></span>
<span class="line"><span>Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster clean tidb-test --all</span></span>
<span class="line"><span>This operation will stop tidb v4.0.2 cluster tidb-test and clean its&#39; data and log.</span></span>
<span class="line"><span>Nodes will be ignored: []</span></span>
<span class="line"><span>Roles will be ignored: []</span></span>
<span class="line"><span>Files to be deleted are: </span></span>
<span class="line"><span>192.168.169.42:</span></span>
<span class="line"><span> /tidb-deploy/cdc-8300/log/*.log</span></span>
<span class="line"><span> /tidb-deploy/tidb-4000/log/*.log</span></span>
<span class="line"><span> /tidb-deploy/tikv-20160/log/*.log</span></span>
<span class="line"><span> /tidb-deploy/alertmanager-9093/log/*.log</span></span>
<span class="line"><span> /tidb-data/alertmanager-9093/*</span></span>
<span class="line"><span> /tidb-data/prometheus-9090/*</span></span>
<span class="line"><span> /tidb-deploy/pd-2379/log/*.log</span></span>
<span class="line"><span> /tidb-data/pd-2379/*</span></span>
<span class="line"><span> /tidb-deploy/grafana-3000/log/*.log</span></span>
<span class="line"><span> /tidb-deploy/prometheus-9090/log/*.log</span></span>
<span class="line"><span> /tidb-data/tikv-20160/*</span></span>
<span class="line"><span>192.168.169.41:</span></span>
<span class="line"><span> /tidb-deploy/pd-2379/log/*.log</span></span>
<span class="line"><span> /tidb-data/pd-2379/*</span></span>
<span class="line"><span> /tidb-deploy/cdc-8300/log/*.log</span></span>
<span class="line"><span> /tidb-deploy/tidb-4000/log/*.log</span></span>
<span class="line"><span> /tidb-deploy/tikv-20160/log/*.log</span></span>
<span class="line"><span> /tidb-data/tikv-20160/*</span></span>
<span class="line"><span>192.168.169.43:</span></span>
<span class="line"><span> /tidb-deploy/tiflash-9000/log/*.log</span></span>
<span class="line"><span> /data/tiflash/data/*</span></span>
<span class="line"><span> /tidb-deploy/tidb-4000/log/*.log</span></span>
<span class="line"><span> /tidb-deploy/tikv-20160/log/*.log</span></span>
<span class="line"><span> /tidb-data/tikv-20160/*</span></span>
<span class="line"><span> /tidb-deploy/pd-2379/log/*.log</span></span>
<span class="line"><span> /tidb-data/pd-2379/*</span></span>
<span class="line"><span> /tidb-deploy/cdc-8300/log/*.log</span></span>
<span class="line"><span>Do you want to continue? [y/N]: y</span></span>
<span class="line"><span>Cleanup cluster...</span></span>
<span class="line"><span>+ [ Serial ] - SSHKeySet: privateKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa, publicKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa.pub</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.43</span></span>
<span class="line"><span>+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span>+ [ Serial ] - StopCluster</span></span>
<span class="line"><span>Stopping component alertmanager</span></span>
<span class="line"><span>	Stopping instance 192.168.169.42</span></span>
<span class="line"><span>	Stop alertmanager 192.168.169.42:9093 success</span></span>
<span class="line"><span>Stopping component grafana</span></span>
<span class="line"><span>	Stopping instance 192.168.169.42</span></span>
<span class="line"><span>	Stop grafana 192.168.169.42:3000 success</span></span>
<span class="line"><span>Stopping component prometheus</span></span>
<span class="line"><span>	Stopping instance 192.168.169.42</span></span>
<span class="line"><span>	Stop prometheus 192.168.169.42:9090 success</span></span>
<span class="line"><span>Stopping component cdc</span></span>
<span class="line"><span>	Stopping instance 192.168.169.43</span></span>
<span class="line"><span>	Stopping instance 192.168.169.42</span></span>
<span class="line"><span>	Stopping instance 192.168.169.41</span></span>
<span class="line"><span>	Stop cdc 192.168.169.42:8300 success</span></span>
<span class="line"><span>	Stop cdc 192.168.169.41:8300 success</span></span>
<span class="line"><span>	Stop cdc 192.168.169.43:8300 success</span></span>
<span class="line"><span>Stopping component tiflash</span></span>
<span class="line"><span>	Stopping instance 192.168.169.43</span></span>
<span class="line"><span>	Stop tiflash 192.168.169.43:9000 success</span></span>
<span class="line"><span>Stopping component tidb</span></span>
<span class="line"><span>	Stopping instance 192.168.169.43</span></span>
<span class="line"><span>	Stopping instance 192.168.169.42</span></span>
<span class="line"><span>	Stopping instance 192.168.169.41</span></span>
<span class="line"><span>	Stop tidb 192.168.169.42:4000 success</span></span>
<span class="line"><span>	Stop tidb 192.168.169.41:4000 success</span></span>
<span class="line"><span>	Stop tidb 192.168.169.43:4000 success</span></span>
<span class="line"><span>Stopping component tikv</span></span>
<span class="line"><span>	Stopping instance 192.168.169.43</span></span>
<span class="line"><span>	Stopping instance 192.168.169.41</span></span>
<span class="line"><span>	Stopping instance 192.168.169.42</span></span>
<span class="line"><span>	Stop tikv 192.168.169.42:20160 success</span></span>
<span class="line"><span>	Stop tikv 192.168.169.43:20160 success</span></span>
<span class="line"><span>	Stop tikv 192.168.169.41:20160 success</span></span>
<span class="line"><span>Stopping component pd</span></span>
<span class="line"><span>	Stopping instance 192.168.169.43</span></span>
<span class="line"><span>	Stopping instance 192.168.169.41</span></span>
<span class="line"><span>	Stopping instance 192.168.169.42</span></span>
<span class="line"><span>	Stop pd 192.168.169.41:2379 success</span></span>
<span class="line"><span>	Stop pd 192.168.169.43:2379 success</span></span>
<span class="line"><span>	Stop pd 192.168.169.42:2379 success</span></span>
<span class="line"><span>Stopping component node_exporter</span></span>
<span class="line"><span>Stopping component blackbox_exporter</span></span>
<span class="line"><span>Stopping component node_exporter</span></span>
<span class="line"><span>Stopping component blackbox_exporter</span></span>
<span class="line"><span>Stopping component node_exporter</span></span>
<span class="line"><span>Stopping component blackbox_exporter</span></span>
<span class="line"><span>+ [ Serial ] - CleanupCluster</span></span>
<span class="line"><span>Cleanup instance 192.168.169.43</span></span>
<span class="line"><span>Cleanup 192.168.169.43 success</span></span>
<span class="line"><span>Cleanup instance 192.168.169.42</span></span>
<span class="line"><span>Cleanup 192.168.169.42 success</span></span>
<span class="line"><span>Cleanup instance 192.168.169.41</span></span>
<span class="line"><span>Cleanup 192.168.169.41 success</span></span>
<span class="line"><span>Cleanup cluster \`tidb-test\` successfully</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup install tiflash:v4.0.2</span></span>
<span class="line"><span>component tiflash version v4.0.2 is already installed</span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup clean tiflash:v4.0.2</span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup uninstall tiflash:v4.0.2</span></span>
<span class="line"><span>Uninstalled component \`tiflash:v4.0.2\` successfully!</span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup clean tiflash:v4.0.2</span></span>
<span class="line"><span>[tidb@tiup-tidb41 tidb-community-server-v4.0.2-linux-amd64]$ tiup install tiflash:v4.0.2</span></span></code></pre></div><h2 id="常见错误解决" tabindex="-1">常见错误解决 <a class="header-anchor" href="#常见错误解决" aria-label="Permalink to &quot;常见错误解决&quot;">​</a></h2><p>最开始安装过一次，以为tiflash必须要配置两个才能来起来，所以想尝试重新部署一次</p><p>但是正常 tiup clean --all 删除所有组件之后，修改topology.yaml的tiflash配置重新部署，出现如下报错</p><p>解决方案为，进入/home/tidb/.tiup/storage/cluster/clusters目录下删除tidb-test的文件</p><p>本人猜测可能是clean的时候没有将这部分文件一起删除导致的</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb41 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]$ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> TIUP_MIRRORS</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">/home/tidb/tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb41 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]$ tiup cluster deploy tidb-test v4.0.2 topology.yaml --user root -p </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Starting</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> component</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cluster</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> deploy</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> tidb-test</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> v4.0.2</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> topology.yaml</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --user</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> root</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Error:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> Cluster</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;tidb-test&#39;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> is</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> duplicated</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (deploy.name_dup)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Please</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> specify</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> another</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cluster</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> name</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Error:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">wd:/home/tidb/.tiup/data/SLZjdQu</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">failed:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> exit</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> status</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 解决方式</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb41 clusters]$ pwd</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/home/tidb/.tiup/storage/cluster/clusters</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[tidb@tiup-tidb41 clusters]$ rm -rf tidb-test/</span></span></code></pre></div>`,30)]))}const b=n(l,[["render",t]]);export{k as __pageData,b as default};
