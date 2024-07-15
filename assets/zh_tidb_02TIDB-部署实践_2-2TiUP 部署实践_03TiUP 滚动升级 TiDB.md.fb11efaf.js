import{_ as s,c as a,o as n,N as l}from"./chunks/framework.0799945b.js";const y=JSON.parse('{"title":"TiDB-TiUP工具集群滚动升级","description":"","frontmatter":{},"headers":[],"relativePath":"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/03TiUP 滚动升级 TiDB.md"}'),p={name:"zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/03TiUP 滚动升级 TiDB.md"},t=l(`<h1 id="tidb-tiup工具集群滚动升级" tabindex="-1">TiDB-TiUP工具集群滚动升级 <a class="header-anchor" href="#tidb-tiup工具集群滚动升级" aria-label="Permalink to &quot;TiDB-TiUP工具集群滚动升级&quot;">​</a></h1><p>时间：2020-12-25</p><blockquote><p><a href="#获取升级版本镜像包">获取升级版本镜像包</a><br><a href="#升级前环境检查">升级前环境检查</a><br><a href="#将集群升级到指定版本">将集群升级到指定版本</a><br><a href="#TiUP工具滚动升级">TiUP工具滚动升级</a><br><a href="#验证集群升级">验证集群升级</a><br><a href="#常见问题解决方案">常见问题解决方案</a></p></blockquote><h2 id="获取升级版本镜像包" tabindex="-1">获取升级版本镜像包 <a class="header-anchor" href="#获取升级版本镜像包" aria-label="Permalink to &quot;获取升级版本镜像包&quot;">​</a></h2><p>方式一：<a href="https://pingcap.com/download-cn/community/" target="_blank" rel="noreferrer"><strong>TiDB社区版获取方式：https://pingcap.com/download-cn/community/</strong></a></p><p>方式二：联网TiUP服务器打包scp</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb44 ~]$ tiup mirror clone tidb-community-server-v4.0.9-linux-amd64 v4.0.9 --os=linux --arch=amd64</span></span>
<span class="line"><span style="color:#A6ACCD;">Start to clone mirror, targetDir is tidb-community-server-v4.0.9-linux-amd64, selectedVersions are [v4.0.9]</span></span>
<span class="line"><span style="color:#A6ACCD;">If this does not meet expectations, please abort this process, read \`tiup mirror clone --help\` and run again</span></span>
<span class="line"><span style="color:#A6ACCD;">Arch [amd64]</span></span>
<span class="line"><span style="color:#A6ACCD;">OS [linux]</span></span>
<span class="line"><span style="color:#A6ACCD;">download https://tiup-mirrors.pingcap.com/alertmanager-v0.17.0-linux-amd64.tar.gz 22.54 MiB / 22.54 MiB 100.00% 5.48 MiB p/s                                                                                                </span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......                                          </span></span>
<span class="line"><span style="color:#A6ACCD;">download https://tiup-mirrors.pingcap.com/tiup-linux-amd64.tar.gz 8.49 MiB / 8.49 MiB 100.00% 12.42 MiB p/s </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb44 ~]$ scp tidb-community-server-v4.0.9-linux-amd64.tar.gz 192.168.169.41:/home/tidb/</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb@192.168.169.41&#39;s password: </span></span>
<span class="line"><span style="color:#A6ACCD;">tidb-community-server-v4.0.9-linux-amd64.tar.gz                                                                                                                                 100% 1498MB  82.2MB/s   00:18    </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 ~]$ tar -zxvf tidb-community-server-v4.0.9-linux-amd64.tar.gz </span></span>
<span class="line"><span style="color:#A6ACCD;">tidb-community-server-v4.0.9-linux-amd64/</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb-community-server-v4.0.9-linux-amd64/local_install.sh</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 ~]$ ll</span></span>
<span class="line"><span style="color:#A6ACCD;">total 3101252</span></span>
<span class="line"><span style="color:#A6ACCD;">drwxr-xr-x. 3 tidb tidb       4096 Jan  9 01:40 tidb-community-server-v4.0.2-linux-amd64</span></span>
<span class="line"><span style="color:#A6ACCD;">-rw-rw-r--. 1 tidb tidb 1604720640 Jan  9 00:30 tidb-community-server-v4.0.2-linux-amd64.tar.gz</span></span>
<span class="line"><span style="color:#A6ACCD;">drwxr-xr-x. 3 tidb tidb       4096 Jan  9 02:44 tidb-community-server-v4.0.9-linux-amd64</span></span>
<span class="line"><span style="color:#A6ACCD;">-rw-rw-r--. 1 tidb tidb 1570949987 Jan  9 02:48 tidb-community-server-v4.0.9-linux-amd64.tar.gz</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 ~]$ cd tidb-community-server-v4.0.9-linux-amd64</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.9-linux-amd64]$ ./local_install.sh </span></span>
<span class="line"><span style="color:#A6ACCD;">Set mirror to /home/tidb/tidb-community-server-v4.0.9-linux-amd64 success</span></span>
<span class="line"><span style="color:#A6ACCD;">Detected shell: bash</span></span>
<span class="line"><span style="color:#A6ACCD;">Shell profile:  /home/tidb/.bash_profile</span></span>
<span class="line"><span style="color:#A6ACCD;">Installed path: /home/tidb/.tiup/bin/tiup</span></span>
<span class="line"><span style="color:#A6ACCD;">===============================================</span></span>
<span class="line"><span style="color:#A6ACCD;">1. source /home/tidb/.bash_profile</span></span>
<span class="line"><span style="color:#A6ACCD;">2. Have a try:   tiup playground</span></span>
<span class="line"><span style="color:#A6ACCD;">===============================================</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.9-linux-amd64]$ source /home/tidb/.bash_profile</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="升级前环境检查" tabindex="-1">升级前环境检查 <a class="header-anchor" href="#升级前环境检查" aria-label="Permalink to &quot;升级前环境检查&quot;">​</a></h2><ul><li>注意：在升级的过程中不要执行 DDL 请求，否则可能会出现行为未定义的问题</li></ul><p>如下情况便不能执行滚动上级操作</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">MySQL [(none)]&gt; admin show ddl jobs where state !=&#39;synced&#39;\\G</span></span>
<span class="line"><span style="color:#A6ACCD;">*************************** 1. row ***************************</span></span>
<span class="line"><span style="color:#A6ACCD;">      JOB_ID: 90</span></span>
<span class="line"><span style="color:#A6ACCD;">     DB_NAME: jan</span></span>
<span class="line"><span style="color:#A6ACCD;">  TABLE_NAME: </span></span>
<span class="line"><span style="color:#A6ACCD;">    JOB_TYPE: drop schema</span></span>
<span class="line"><span style="color:#A6ACCD;">SCHEMA_STATE: delete only</span></span>
<span class="line"><span style="color:#A6ACCD;">   SCHEMA_ID: 46</span></span>
<span class="line"><span style="color:#A6ACCD;">    TABLE_ID: 0</span></span>
<span class="line"><span style="color:#A6ACCD;">   ROW_COUNT: 0</span></span>
<span class="line"><span style="color:#A6ACCD;">  START_TIME: 2021-01-13 04:15:22</span></span>
<span class="line"><span style="color:#A6ACCD;">    END_TIME: NULL</span></span>
<span class="line"><span style="color:#A6ACCD;">       STATE: running</span></span>
<span class="line"><span style="color:#A6ACCD;">1 row in set (0.01 sec)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="将集群升级到指定版本" tabindex="-1">将集群升级到指定版本 <a class="header-anchor" href="#将集群升级到指定版本" aria-label="Permalink to &quot;将集群升级到指定版本&quot;">​</a></h2><p>升级前版本查看</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 ~]$ tiup cluster display tidb-test </span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster display tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster type:       tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster name:       tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster version:    v4.0.2</span></span>
<span class="line"><span style="color:#A6ACCD;">SSH type:           builtin</span></span>
<span class="line"><span style="color:#A6ACCD;">Dashboard URL:      http://192.168.169.42:2379/dashboard</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="tiup工具滚动升级" tabindex="-1">TiUP工具滚动升级 <a class="header-anchor" href="#tiup工具滚动升级" aria-label="Permalink to &quot;TiUP工具滚动升级&quot;">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.9-linux-amd64]$ tiup cluster upgrade tidb-test v4.0.9</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster upgrade tidb-test v4.0.9</span></span>
<span class="line"><span style="color:#A6ACCD;">This operation will upgrade tidb v4.0.2 cluster tidb-test to v4.0.9.</span></span>
<span class="line"><span style="color:#A6ACCD;">Do you want to continue? [y/N]: y</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Upgrading cluster...</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - SSHKeySet: privateKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa, publicKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa.pub</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.42</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [Parallel] - UserSSH: user=tidb, host=192.168.169.41</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Upgraded cluster \`tidb-test\` successfully</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="验证集群升级" tabindex="-1">验证集群升级 <a class="header-anchor" href="#验证集群升级" aria-label="Permalink to &quot;验证集群升级&quot;">​</a></h2><p>观察到Cluster version已经变更为了v4.0.9</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.9-linux-amd64]$ tiup cluster display tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster display tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster type:       tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster name:       tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster version:    v4.0.9</span></span>
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
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="常见问题解决方案" tabindex="-1">常见问题解决方案 <a class="header-anchor" href="#常见问题解决方案" aria-label="Permalink to &quot;常见问题解决方案&quot;">​</a></h2><ul><li>v4.0.9版本升级时出现Run Command Timeout错误解决</li></ul><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.9-linux-amd64]$ tiup cluster upgrade tidb-test v4.0.9</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster upgrade tidb-test v4.0.9</span></span>
<span class="line"><span style="color:#A6ACCD;">This operation will upgrade tidb v4.0.2 cluster tidb-test to v4.0.9.</span></span>
<span class="line"><span style="color:#A6ACCD;">Do you want to continue? [y/N]: y</span></span>
<span class="line"><span style="color:#A6ACCD;">Upgrading cluster...</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - InitConfig: cluster=tidb-test, user=tidb, host=192.168.169.42, path=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/config-cache/tikv-20160.service, deploy_dir=/data/tidb-deploy/tikv-20160, data_dir=[/data/tidb-data/tikv-20160], log_dir=/data/tidb-deploy/tikv-20160/log, cache_dir=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/config-cache</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Error: stderr: Run Command Timeout!</span></span>
<span class="line"><span style="color:#A6ACCD;">: executor.ssh.execute_timedout: Execute command over SSH timedout for &#39;tidb@192.168.169.44:22&#39; {ssh_stderr: Run Command Timeout!</span></span>
<span class="line"><span style="color:#A6ACCD;">, ssh_stdout: , ssh_command: export LANG=C; PATH=$PATH:/usr/bin:/usr/sbin tar --no-same-owner -zxf /data/tidb-deploy/tiflash-9000/bin/tiflash-v4.0.9-linux-amd64.tar.gz -C /data/tidb-deploy/tiflash-9000/bin &amp;&amp; rm /data/tidb-deploy/tiflash-9000/bin/tiflash-v4.0.9-linux-amd64.tar.gz}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Verbose debug logs has been written to /home/tidb/.tiup/logs/tiup-cluster-debug-2021-01-10-01-04-18.log.</span></span>
<span class="line"><span style="color:#A6ACCD;">Error: run \`/home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster\` (wd:/home/tidb/.tiup/data/SLfUqGv) failed: exit status 1</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>通过指定wait-timeout参数增大SSH Command的执行时间</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.9-linux-amd64]$ tiup cluster upgrade tidb-test v4.0.9 --ssh-timeout 100000000 --wait-timeout 100000000</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster upgrade tidb-test v4.0.9 --wait-timeout 100000000</span></span>
<span class="line"><span style="color:#A6ACCD;">This operation will upgrade tidb v4.0.2 cluster tidb-test to v4.0.9.</span></span>
<span class="line"><span style="color:#A6ACCD;">Do you want to continue? [y/N]: y</span></span>
<span class="line"><span style="color:#A6ACCD;">Upgrading cluster...</span></span>
<span class="line"><span style="color:#A6ACCD;">+ [ Serial ] - SSHKeySet: privateKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa, publicKey=/home/tidb/.tiup/storage/cluster/clusters/tidb-test/ssh/id_rsa.pub</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">Upgraded custer \`tidb-test\` successfully</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tiup-tidb41 tidb-community-server-v4.0.9-linux-amd64]$ tiup cluster display tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Starting component \`cluster\`: /home/tidb/.tiup/components/cluster/v1.3.1/tiup-cluster display tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster type:       tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster name:       tidb-test</span></span>
<span class="line"><span style="color:#A6ACCD;">Cluster version:    v4.0.9</span></span>
<span class="line"><span style="color:#A6ACCD;">SSH type:           builtin</span></span>
<span class="line"><span style="color:#A6ACCD;">Dashboard URL:      http://192.168.169.41:2379/dashboard</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div>`,24),e=[t];function i(o,c,r,d,C,A){return n(),a("div",null,e)}const b=s(p,[["render",i]]);export{y as __pageData,b as default};
