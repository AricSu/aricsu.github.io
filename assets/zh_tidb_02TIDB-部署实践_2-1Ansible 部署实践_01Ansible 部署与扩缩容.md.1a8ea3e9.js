import{_ as s,c as n,o as a,N as l}from"./chunks/framework.0799945b.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"zh/tidb/02TIDB-部署实践/2-1Ansible 部署实践/01Ansible 部署与扩缩容.md"}'),p={name:"zh/tidb/02TIDB-部署实践/2-1Ansible 部署实践/01Ansible 部署与扩缩容.md"},e=l(`<h2 id="ansible-部署" tabindex="-1">Ansible 部署 <a class="header-anchor" href="#ansible-部署" aria-label="Permalink to &quot;Ansible 部署&quot;">​</a></h2><h3 id="tidb-ansible解决的问题" tabindex="-1">TiDB-Ansible解决的问题 <a class="header-anchor" href="#tidb-ansible解决的问题" aria-label="Permalink to &quot;TiDB-Ansible解决的问题&quot;">​</a></h3><p>tidb的二进制部署时，某些环境下节点会超过100+； 单节点依次部署是非常麻烦，因此tidbAnsible统一部署及管理非常必要；</p><p>TiDB-Ansible的操作时幂等的，在操作过程中遇到报错，修复后即可继续安装。安装时注意，TiDB及TiDB-Ansible版本要对应；</p><h3 id="tidb-ansible目录结构" tabindex="-1">TiDB-Ansible目录结构 <a class="header-anchor" href="#tidb-ansible目录结构" aria-label="Permalink to &quot;TiDB-Ansible目录结构&quot;">​</a></h3><table><thead><tr><th>主要部分</th><th>说明</th></tr></thead><tbody><tr><td>yml文件</td><td>存放playbook剧本</td></tr><tr><td>conf目录</td><td>配置文件</td></tr><tr><td>group_vars目录</td><td>端口配置等</td></tr><tr><td>inventory.ini文件</td><td>主要的配置文件，指定操作主机</td></tr><tr><td>resource和download目录</td><td>binary包</td></tr><tr><td>scripts目录</td><td>监控相关json文件，初始化之后生成运维脚本</td></tr><tr><td>roles目录</td><td>角色相关目录和自定义变量</td></tr></tbody></table><h3 id="tidb-ansible命令简介" tabindex="-1">TiDB-Ansible命令简介 <a class="header-anchor" href="#tidb-ansible命令简介" aria-label="Permalink to &quot;TiDB-Ansible命令简介&quot;">​</a></h3><table><thead><tr><th>功能</th><th>命令</th><th>备注</th></tr></thead><tbody><tr><td>环境初始化</td><td>ansible-playbook bootstrap.yml</td><td>在服务器创建相应目录并检测环境信息</td></tr><tr><td>部署集群</td><td>ansible-playbook deploy.yml</td><td>正式开始部署，包含配置文件，启动脚本，binary包的分发等</td></tr><tr><td>更新集群</td><td>ansible-playbook rolling_update.yml</td><td>每个组件一步一步升级操作（pd-&gt;tikv-&gt;tidb）</td></tr><tr><td>关闭集群</td><td>ansible-playbook stop.yml</td><td></td></tr><tr><td>启动集群</td><td>ansible-playbook start.yml</td><td></td></tr></tbody></table><p>常用参数 -l:指定host或者别名 --tags：指定task(tidb、tikv等组件) -f:调整并发</p><h3 id="tidb-ansible在线部署tidb集群" tabindex="-1">TiDB-Ansible在线部署TiDB集群 <a class="header-anchor" href="#tidb-ansible在线部署tidb集群" aria-label="Permalink to &quot;TiDB-Ansible在线部署TiDB集群&quot;">​</a></h3><p>可供离线部署步骤参考使用；</p><h4 id="环境与ip规划" tabindex="-1">环境与IP规划 <a class="header-anchor" href="#环境与ip规划" aria-label="Permalink to &quot;环境与IP规划&quot;">​</a></h4><blockquote><p><strong>环境说明</strong></p></blockquote><p>服务器环境 CentOS Linux release 7.9.2009 (Core)<br> 数据库版本 5.7.25-TiDB-v3.0.0<br> 文档参考地址 <a href="https://docs.pingcap.com/zh/tidb/stable/production-deployment-using-tiup" target="_blank" rel="noreferrer"><strong>TiDB官网：https://docs.pingcap.com/zh/tidb/stable/production-deployment-using-tiup</strong></a></p><blockquote><p><strong>IP规划</strong></p></blockquote><table><thead><tr><th>IP地址</th><th>Role信息</th><th>备注</th></tr></thead><tbody><tr><td>192.168.1.41</td><td>pd+tikv+tidb-ansible+monitor</td><td>部署主机</td></tr><tr><td>192.168.1.42</td><td>pd+tikv+tidb</td><td></td></tr><tr><td>192.168.1.43</td><td>pd+tikv+tidb</td><td></td></tr><tr><td>192.168.1.44</td><td>pd+tikv+tidb</td><td>用于增删节点</td></tr></tbody></table><blockquote><p><strong>核心部署步骤</strong></p></blockquote><ul><li>中控机安装依赖 <ul><li>中控机安装git pip curl sshpass</li><li>中控机安装Ansible(2.5+)及其依赖</li></ul></li><li>中控机部署配置 <ul><li>中控机创建tidb用户并配置互信</li><li>中控机下载TiDB-Ansible(TiDB用户下)</li><li>中控机配置NTP、CPUfrep、ext4</li></ul></li><li>正式开始部署 <ul><li>编辑inventory.ini</li><li>bootstrap.yml初始化环境</li><li>deploy.yml部署任务</li><li>start.yml启动集群</li></ul></li><li>测试集群部署</li></ul><h4 id="中控机配置依赖" tabindex="-1">中控机配置依赖 <a class="header-anchor" href="#中控机配置依赖" aria-label="Permalink to &quot;中控机配置依赖&quot;">​</a></h4><blockquote><p><strong>中控机安装系统依赖包</strong></p></blockquote><p>注意事项：</p><ol><li>在可联网的下载机上下载系统依赖离线安装包，然后上传至中控机。</li><li>该离线包仅支持 CentOS 7 系统，包含安装git pip curl sshpass。</li><li>pip请确认版本 &gt;= 8.1.2，否则会有兼容问题。</li></ol><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">tar -xzvf ansible-system-rpms.el7.tar.gz &amp;&amp;</span></span>
<span class="line"><span style="color:#A6ACCD;">cd ansible-system-rpms.el7 &amp;&amp;</span></span>
<span class="line"><span style="color:#A6ACCD;">chmod u+x install_ansible_system_rpms.sh &amp;&amp;</span></span>
<span class="line"><span style="color:#A6ACCD;">./install_ansible_system_rpms.sh</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">ansible-system-rpms.el7/</span></span>
<span class="line"><span style="color:#A6ACCD;">ansible-system-rpms.el7/sed-4.2.2-5.el7.x86_64.rpm</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">Installed:</span></span>
<span class="line"><span style="color:#A6ACCD;">  python-backports.x86_64 0:1.0-8.el7        python-backports-ssl_match_hostname.noarch 0:3.4.0.2-4.el7        python-setuptools.noarch 0:0.9.8-7.el7       </span></span>
<span class="line"><span style="color:#A6ACCD;">  python2-pip.noarch 0:8.1.2-5.el7           sshpass.x86_64 0:1.06-2.el7                                      </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Complete!</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">pip -V</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">pip 8.1.2 from /usr/lib/python2.7/site-packages (python 2.7)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>中控机tidb 用户生成 ssh key</strong></p></blockquote><p>创建 tidb 用户并修改密码</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">useradd -m -d /home/tidb tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">passwd tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>配置 tidb 用户 sudo 免密码； <span style="color:red;">将 tidb ALL=(ALL) NOPASSWD: ALL 添加到文件末尾即可</span></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">visudo</span></span>
<span class="line"><span style="color:#A6ACCD;">tidb ALL=(ALL) NOPASSWD: ALL</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>tidb 用户下生成 SSH key,直接回车即可; 执行成功后: SSH 私钥文件为 /home/tidb/.ssh/id_rsa; SSH 公钥文件为 /home/tidb/.ssh/id_rsa.pub。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">su - tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">ssh-keygen -t rsa</span></span>
<span class="line"><span style="color:#A6ACCD;">Generating public/private rsa key pair.</span></span>
<span class="line"><span style="color:#A6ACCD;">Enter file in which to save the key (/home/tidb/.ssh/id_rsa):</span></span>
<span class="line"><span style="color:#A6ACCD;">Created directory &#39;/home/tidb/.ssh&#39;.</span></span>
<span class="line"><span style="color:#A6ACCD;">Enter passphrase (empty for no passphrase):</span></span>
<span class="line"><span style="color:#A6ACCD;">Enter same passphrase again:</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Your identification has been saved in /home/tidb/.ssh/id_rsa.</span></span>
<span class="line"><span style="color:#A6ACCD;">Your public key has been saved in /home/tidb/.ssh/id_rsa.pub.</span></span>
<span class="line"><span style="color:#A6ACCD;">The key fingerprint is:</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">SHA256:eIBykszR1KyECA/h0d7PRKz4fhAeli7IrVphhte7/So tidb@172.16.10.49</span></span>
<span class="line"><span style="color:#A6ACCD;">The key&#39;s randomart image is:</span></span>
<span class="line"><span style="color:#A6ACCD;">+---[RSA 2048]----+</span></span>
<span class="line"><span style="color:#A6ACCD;">|=+o+.o.          |</span></span>
<span class="line"><span style="color:#A6ACCD;">|o=o+o.oo         |</span></span>
<span class="line"><span style="color:#A6ACCD;">| .O.=.=          |</span></span>
<span class="line"><span style="color:#A6ACCD;">| . B.B +         |</span></span>
<span class="line"><span style="color:#A6ACCD;">|o B * B S        |</span></span>
<span class="line"><span style="color:#A6ACCD;">| * + * +         |</span></span>
<span class="line"><span style="color:#A6ACCD;">|  o + .          |</span></span>
<span class="line"><span style="color:#A6ACCD;">| o  E+ .         |</span></span>
<span class="line"><span style="color:#A6ACCD;">|o   ..+o.        |</span></span>
<span class="line"><span style="color:#A6ACCD;">+----[SHA256]-----+</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>中控机器上下载 TiDB Ansible</strong></p></blockquote><p>注意事项：</p><ol><li>在TiDB用户下操作；</li><li>使用以下命令从 TiDB Ansible 项目上下载相应 TAG 版本的tidb-ansible，$tag 替换为选定的 TAG 版本的值，例如 v3.0.0；</li><li>使用外部下载机下载相应版本TiDB Ansible后，用sftp等软件将安装包上传；</li><li>将tidb-ansible上传到/home/tidb 目录下，权限为 tidb 用户，否则可能会遇到权限问题；</li><li>目前，TiDB Ansible release-4.0 版本兼容 Ansible 2.5 ~ 2.7.11</li></ol><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">git clone -b $tag https://github.com/pingcap/tidb-ansible.git</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">scp tidb-ansible tidb@中控机IP:/home/tidb/</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>Ansible 及相关依赖的版本信息记录在 tidb-ansible/requirements.txt 文件中。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">cd /home/tidb/tidb-ansible &amp;&amp; \\</span></span>
<span class="line"><span style="color:#A6ACCD;">sudo pip install -r ./requirements.txt</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>查看 Ansible 的版本</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible --version</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">ansible 2.7.11</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>中控机上配置部署机器 SSH 互信及 sudo 规则</strong></p></blockquote><p>注意事项： 1.以 tidb 用户登录中控机，然后执行以下步骤： 2.将你的部署目标机器 IP 添加到 hosts.ini 文件的 [servers] 区块下。 3.<span style="color:red;">cn.pool.ntp.org是网络上找的中国公用ntp服务不稳定，仅限测试机使用，生产服务器请使用自己的ntp服务。--<a href="https://www.cnblogs.com/croso/p/6670039.html" target="_blank" rel="noreferrer"><strong>国内常用NTP服务器地址及IP网址参考链接</strong></a></span></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">cd /home/tidb/tidb-ansible &amp;&amp; \\</span></span>
<span class="line"><span style="color:#A6ACCD;">vi hosts.ini</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[servers]</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[all:vars]</span></span>
<span class="line"><span style="color:#A6ACCD;">username = tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">ntp_server = cn.pool.ntp.org</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>执行以下命令并按提示输入部署目标机器的 root 用户密码后，将在部署目标机器上创建 tidb 用户，并配置 sudo 规则，配置中控机与部署目标机器之间的 SSH 互信。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible-playbook -i hosts.ini create_users.yml -u root -k</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>在部署目标机器上安装 NTP 服务</strong></p></blockquote><p>注意事项：</p><ol><li>以 tidb 用户登录中控机，执行以下命令；</li><li>该步骤将在部署目标机器上使用系统自带软件源联网安装并启动 NTP 服务;</li><li>服务使用安装包默认的 NTP server 列表，见配置文件 /etc/ntp.conf 中 server 参数，如果使用默认的 NTP server，你的机器需要连接外网。</li><li>为让 NTP 尽快开始同步，启动 NTP 服务前，系统会执行 ntpdate 命令，与用户在 hosts.ini 文件中指定的 ntp_server 同步日期与时间。</li><li>默认的服务器为 pool.ntp.org，也可替换为你的 NTP server。</li><li><span style="color:red;">注意：如果你的部署目标机器时间、时区设置一致，已开启 NTP 服务且在正常同步时间，此步骤可忽略。可参考如何检测 NTP 服务是否正常。</span></li></ol><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">cd /home/tidb/tidb-ansible &amp;&amp; \\</span></span>
<span class="line"><span style="color:#A6ACCD;">ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>在部署目标机器上配置 CPUfreq 调节器模式</strong></p></blockquote><p>注意事项：</p><ol><li>如果支持设置 performance 和 powersave 模式，为发挥CPU最大性能，推荐设置CPUfreq调节器模式置为 performance 模式；</li><li>本例中系统返回 Not Available，表示当前系统不支持配置 CPUfreq，跳过该步骤即可；</li></ol><p>查看系统支持的调节器模式</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">cpupower frequency-info --governors</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">analyzing CPU 0:</span></span>
<span class="line"><span style="color:#A6ACCD;">  available cpufreq governors: performance powersave</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p style="color:red;"> 或者 </p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">cpupower frequency-info --governors</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">analyzing CPU 0:</span></span>
<span class="line"><span style="color:#A6ACCD;">  available cpufreq governors: Not Available</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>查看系统当前的 CPUfreq 调节器模式，如下面代码所示，当前配置是 powersave 模式。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">cpupower frequency-info --policy</span></span>
<span class="line"><span style="color:#A6ACCD;">analyzing CPU 0:</span></span>
<span class="line"><span style="color:#A6ACCD;">  current policy: frequency should be within 1.20 GHz and 3.20 GHz.</span></span>
<span class="line"><span style="color:#A6ACCD;">                  The governor &quot;powersave&quot; may decide which speed to use</span></span>
<span class="line"><span style="color:#A6ACCD;">                  within this range.</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>修改调节器模式</p><p>可以使用 cpupower frequency-set --governor 命令单机修改；</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">cpupower frequency-set --governor performance</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>也可以使用以下命令在部署目标机器上批量设置<span style="color:red;"> （推荐使用）</span>；</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible -i hosts.ini all -m shell -a &quot;cpupower frequency-set --governor performance&quot; -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>在部署目标机器上添加数据盘 ext4 文件系统挂载参数</strong></p></blockquote><ol><li>使用 root 用户登录目标机器;</li><li>将部署目标机器数据盘格式化成 ext4 文件系统;</li><li>挂载时添加 nodelalloc 和 noatime 挂载参数;</li><li>nodelalloc 是必选参数，否则 Ansible 安装时检测无法通过,noatime 是可选建议参数;</li><li>如果数据盘已经格式化成ext4并挂载，可先执行 umount,编辑 /etc/fstab 文件，添加挂载参数后重新挂载。</li><li>使用 lsblk 命令查看分区的设备号：对于 nvme 磁盘（固态硬盘），生成的分区设备号一般为 nvme0n1p1；对于普通磁盘（例如 /dev/sdb），生成的的分区设备号一般为 sdb1。</li></ol><span style="color:red;"> 以 /dev/nvme0n1 数据盘为例，具体操作步骤如下： </span><p>查看数据盘;</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">fdisk -l</span></span>
<span class="line"><span style="color:#A6ACCD;">Disk /dev/nvme0n1: 1000 GB</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>创建分区表;</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">parted -s -a optimal /dev/nvme0n1 mklabel gpt -- mkpart primary ext4 1 -1</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>格式化文件系统。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">mkfs.ext4 /dev/nvme0n1p1</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>查看数据盘分区 UUID。 本例中 nvme0n1p1 的 UUID 为 c51eb23b-195c-4061-92a9-3fad812cc12f。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">lsblk -f</span></span>
<span class="line"><span style="color:#A6ACCD;">NAME    FSTYPE LABEL UUID                                 MOUNTPOINT</span></span>
<span class="line"><span style="color:#A6ACCD;">sda</span></span>
<span class="line"><span style="color:#A6ACCD;">├─sda1  ext4         237b634b-a565-477b-8371-6dff0c41f5ab /boot</span></span>
<span class="line"><span style="color:#A6ACCD;">├─sda2  swap         f414c5c0-f823-4bb1-8fdf-e531173a72ed</span></span>
<span class="line"><span style="color:#A6ACCD;">└─sda3  ext4         547909c1-398d-4696-94c6-03e43e317b60 /</span></span>
<span class="line"><span style="color:#A6ACCD;">sr0</span></span>
<span class="line"><span style="color:#A6ACCD;">nvme0n1</span></span>
<span class="line"><span style="color:#A6ACCD;">└─nvme0n1p1 ext4         c51eb23b-195c-4061-92a9-3fad812cc12f</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>编辑 /etc/fstab 文件，添加 nodelalloc 挂载参数。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">vi /etc/fstab</span></span>
<span class="line"><span style="color:#A6ACCD;">UUID=c51eb23b-195c-4061-92a9-3fad812cc12f /data1 ext4 defaults,nodelalloc,noatime 0 2</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>挂载数据盘。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">mkdir /data1 &amp;&amp; \\</span></span>
<span class="line"><span style="color:#A6ACCD;">mount -a</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>执行以下命令，如果文件系统为 ext4，并且挂载参数中包含 nodelalloc，则表示已生效。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">mount -t ext4</span></span>
<span class="line"><span style="color:#A6ACCD;">/dev/nvme0n1p1 on /data1 type ext4 (rw,noatime,nodelalloc,data=ordered)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h4 id="正式开始部署" tabindex="-1">正式开始部署 <a class="header-anchor" href="#正式开始部署" aria-label="Permalink to &quot;正式开始部署&quot;">​</a></h4><blockquote><p><strong>编辑 inventory.ini 文件分配机器资源</strong></p></blockquote><p>注意事项：</p><ol><li>以 tidb 用户登录中控机，编辑 /home/tidb/tidb-ansible/inventory.ini 文件为 TiDB 集群分配机器资源。</li><li>一个标准的 TiDB 集群需要 6 台机器：2 个 TiDB 实例，3 个 PD 实例，3 个 TiKV 实例,至少需部署 3 个 TiKV 实例。</li><li>不推荐将 TiKV 实例与 TiDB 或 PD 实例混合部署在同一台机器上<span style="color:red;">----本例测试机采用这种部署方案！！！</span></li><li>将第一台 TiDB 机器同时用作监控机。</li><li>请使用内网 IP 来部署集群，如果部署目标机器 SSH 端口非默认的 22 端口，需添加 ansible_port 变量，如 TiDB1 ansible_host=172.16.10.1 ansible_port=5555。</li><li>如果是 ARM 架构的机器，需要将 cpu_architecture 改为 arm64。</li><li>默认情况下，建议在每个 TiKV 节点上仅部署一个 TiKV 实例，以提高性能。但是，如果你的 TiKV 部署机器的 CPU 和内存配置是部署建议的两倍或以上，并且一个节点拥有两块 SSD 硬盘或者单块 SSD 硬盘的容量大于 2 TB，则可以考虑部署两实例，但不建议部署两个以上实例。</li></ol><p>执行以下命令，如果所有 server 均返回 tidb，表示 SSH 互信配置成功：</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible -i inventory.ini all -m shell -a &#39;whoami&#39;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>执行以下命令，如果所有 server 均返回 root，表示 tidb 用户 sudo 免密码配置成功。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible -i inventory.ini all -m shell -a &#39;whoami&#39; -b</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>部署 TiDB 集群</strong></p></blockquote><ol><li>ansible-playbook 执行 Playbook 时，默认并发为 5;</li><li>部署目标机器较多时，可添加 -f 参数指定并发数，例如 ansible-playbook deploy.yml -f 10。</li><li>默认使用tidb 用户作为服务运行用户,需在tidb-ansible/inventory.ini 文件中，确认 ansible_user = tidb。</li><li>不要将 ansible_user 设置为 root 用户，因为 tidb-ansible 限制了服务以普通用户运行。</li></ol><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">Connection</span></span>
<span class="line"><span style="color:#A6ACCD;">ssh via normal user</span></span>
<span class="line"><span style="color:#A6ACCD;">ansible_user = tidb</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>执行 local_prepare.yml playbook，联网下载 TiDB binary 至中控机。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible-playbook local_prepare.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p><span style="color:red;">如果采用实验环境很难满足TiDB的硬件要求（节点CPU核心数最低8核，内存最低16000MB），可以采用如下关闭自检的方式搭建，生产环境不要使用！</span></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">- name: check system</span></span>
<span class="line"><span style="color:#A6ACCD;">  hosts: all</span></span>
<span class="line"><span style="color:#A6ACCD;">  any_errors_fatal: true</span></span>
<span class="line"><span style="color:#A6ACCD;">  roles:</span></span>
<span class="line"><span style="color:#A6ACCD;">    - check_system_static</span></span>
<span class="line"><span style="color:#A6ACCD;">    #- { role: check_system_optional, when: not dev_mode|default(false) }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">- name: tikv_servers machine benchmark</span></span>
<span class="line"><span style="color:#A6ACCD;">  hosts: tikv_servers</span></span>
<span class="line"><span style="color:#A6ACCD;">  gather_facts: false</span></span>
<span class="line"><span style="color:#A6ACCD;">  roles:</span></span>
<span class="line"><span style="color:#A6ACCD;">    #- { role: machine_benchmark, when: not dev_mode|default(false) }</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>bootstrap.yml初始化环境</strong></p></blockquote><p>初始化系统环境，修改内核参数。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible-playbook bootstrap.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>deploy.yml部署任务</strong></p></blockquote><p>部署 TiDB 集群软件。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible-playbook deploy.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><blockquote><p><strong>start.yml启动集群</strong></p></blockquote><p>启动 TiDB 集群。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">ansible-playbook start.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h4 id="测试集群部署" tabindex="-1">测试集群部署 <a class="header-anchor" href="#测试集群部署" aria-label="Permalink to &quot;测试集群部署&quot;">​</a></h4><p>TiDB 兼容 MySQL，因此可使用 MySQL 客户端直接连接 TiDB。推荐配置负载均衡以提供统一的 SQL 接口。</p><p>使用 MySQL 客户端连接 TiDB 集群。TiDB 服务的默认端口为 4000。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">mysql -u root -h 172.16.10.1 -P 4000</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h2 id="扩容-pd-组件" tabindex="-1">扩容 PD 组件 <a class="header-anchor" href="#扩容-pd-组件" aria-label="Permalink to &quot;扩容 PD 组件&quot;">​</a></h2><h3 id="配置inventory-ini新节点ip信息" tabindex="-1">配置inventory.ini新节点IP信息 <a class="header-anchor" href="#配置inventory-ini新节点ip信息" aria-label="Permalink to &quot;配置inventory.ini新节点IP信息&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[pd_servers]</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># node_exporter and blackbox_exporter servers</span></span>
<span class="line"><span style="color:#A6ACCD;">[monitored_servers]</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="中控机操作部署机建用户" tabindex="-1">中控机操作部署机建用户 <a class="header-anchor" href="#中控机操作部署机建用户" aria-label="Permalink to &quot;中控机操作部署机建用户&quot;">​</a></h3><p>执行以下命令，依据输入<em><strong>部署目标机器</strong></em>的 root 用户密码； 本例新增节点IP为192.168.1.44；</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi hosts.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ cat hosts.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[servers]</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[all:vars]</span></span>
<span class="line"><span style="color:#A6ACCD;">username = tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">ntp_server = cn.pool.ntp.org</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini create_users.yml -u root -k</span></span>
<span class="line"><span style="color:#A6ACCD;">SSH password: </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [all] ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="中控机操作部署机配置ntp服务" tabindex="-1">中控机操作部署机配置ntp服务 <a class="header-anchor" href="#中控机操作部署机配置ntp服务" aria-label="Permalink to &quot;中控机操作部署机配置ntp服务&quot;">​</a></h3><p><em><strong>注意：生产上应该指向自己的ntp服务器，本次测试采用了公网公用的ntp服务不稳定。</strong></em></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [all] ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="中控及操作部署机设置cpu模式" tabindex="-1">中控及操作部署机设置CPU模式 <a class="header-anchor" href="#中控及操作部署机设置cpu模式" aria-label="Permalink to &quot;中控及操作部署机设置CPU模式&quot;">​</a></h3><p>调整CPU模式，如果同本文出现一样的报错，说明此版本的操作系统不支持CPU模式修改，可直接跳过。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible -i hosts.ini all -m shell -a &quot;cpupower frequency-set --governor performance&quot; -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44 | FAILED | rc=237 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">Setting cpu: 0</span></span>
<span class="line"><span style="color:#A6ACCD;">Error setting new values. Common errors:</span></span>
<span class="line"><span style="color:#A6ACCD;">- Do you have proper administration rights? (super-user?)</span></span>
<span class="line"><span style="color:#A6ACCD;">- Is the governor you requested available and modprobed?</span></span>
<span class="line"><span style="color:#A6ACCD;">- Trying to set an invalid policy?</span></span>
<span class="line"><span style="color:#A6ACCD;">- Trying to set a specific frequency, but userspace governor is not available,</span></span>
<span class="line"><span style="color:#A6ACCD;">   for example because of hardware which cannot be set to a specific frequency</span></span>
<span class="line"><span style="color:#A6ACCD;">   or because the userspace governor isn&#39;t loaded?non-zero return code</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>### 执行bootstrap.yml生成模板文件</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [initializing deployment target] ************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>### 执行deploy.yml正式部署新节点</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [initializing deployment target] ************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="滚动更新普罗米修斯" tabindex="-1">滚动更新普罗米修斯 <a class="header-anchor" href="#滚动更新普罗米修斯" aria-label="Permalink to &quot;滚动更新普罗米修斯&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] ****************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP *********************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="基于grafana可视化界面验证" tabindex="-1">基于Grafana可视化界面验证 <a class="header-anchor" href="#基于grafana可视化界面验证" aria-label="Permalink to &quot;基于Grafana可视化界面验证&quot;">​</a></h3><p><img src="http://cdn.lifemini.cn/dbblog/20201227/b5ceba7b9807484b9f385d382d5ab325.png" alt="39368d20da884d3e70484891aa58aae.png"></p><h2 id="缩容-pd-组件" tabindex="-1">缩容 PD 组件 <a class="header-anchor" href="#缩容-pd-组件" aria-label="Permalink to &quot;缩容 PD 组件&quot;">​</a></h2><h3 id="pd-ctl命令行删除pd节点" tabindex="-1">pd-ctl命令行删除PD节点 <a class="header-anchor" href="#pd-ctl命令行删除pd节点" aria-label="Permalink to &quot;pd-ctl命令行删除PD节点&quot;">​</a></h3><p>首先，登录pd-ctl命令行使用member命令查看删除节点对应&quot;name&quot;: &quot;pd_tidb04-44&quot;； 其次，执行member delete name pd_tidb04-44操作删除该PD节点； 最后，使用member命令查看已无该name的集群节点出现。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ resources/bin/pd-ctl -u http://192.168.1.41:2379 -i</span></span>
<span class="line"><span style="color:#A6ACCD;">» member</span></span>
<span class="line"><span style="color:#A6ACCD;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;header&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;cluster_id&quot;: 6909452787323084897</span></span>
<span class="line"><span style="color:#A6ACCD;">  },</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;members&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;name&quot;: &quot;pd_tidb02-42&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;member_id&quot;: 986258930764209162,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.42:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ],</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.42:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ]</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;name&quot;: &quot;pd_tidb01-41&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;member_id&quot;: 3654086277121920294,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.41:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ],</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.41:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ]</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;name&quot;: &quot;pd_tidb04-44&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;member_id&quot;: 6266742378045652471,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.44:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ],</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.44:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ]</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;name&quot;: &quot;pd_tidb03-43&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;member_id&quot;: 6461985847067688046,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.43:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ],</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.43:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ]</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">  ],</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;leader&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;name&quot;: &quot;pd_tidb01-41&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;member_id&quot;: 3654086277121920294,</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;http://192.168.1.41:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    ],</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;http://192.168.1.41:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    ]</span></span>
<span class="line"><span style="color:#A6ACCD;">  },</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;etcd_leader&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;name&quot;: &quot;pd_tidb01-41&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;member_id&quot;: 3654086277121920294,</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;http://192.168.1.41:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    ],</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;http://192.168.1.41:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    ]</span></span>
<span class="line"><span style="color:#A6ACCD;">  }</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">» member delete name pd_tidb04-44</span></span>
<span class="line"><span style="color:#A6ACCD;">Success!</span></span>
<span class="line"><span style="color:#A6ACCD;">» member</span></span>
<span class="line"><span style="color:#A6ACCD;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;header&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;cluster_id&quot;: 6909452787323084897</span></span>
<span class="line"><span style="color:#A6ACCD;">  },</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;members&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;name&quot;: &quot;pd_tidb02-42&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;member_id&quot;: 986258930764209162,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.42:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ],</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.42:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ]</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;name&quot;: &quot;pd_tidb01-41&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;member_id&quot;: 3654086277121920294,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.41:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ],</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.41:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ]</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;name&quot;: &quot;pd_tidb03-43&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;member_id&quot;: 6461985847067688046,</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.43:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ],</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;http://192.168.1.43:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      ]</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">  ],</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;leader&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;name&quot;: &quot;pd_tidb01-41&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;member_id&quot;: 3654086277121920294,</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;http://192.168.1.41:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    ],</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;http://192.168.1.41:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    ]</span></span>
<span class="line"><span style="color:#A6ACCD;">  },</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;etcd_leader&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;name&quot;: &quot;pd_tidb01-41&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;member_id&quot;: 3654086277121920294,</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;peer_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;http://192.168.1.41:2380&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    ],</span></span>
<span class="line"><span style="color:#A6ACCD;">    &quot;client_urls&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;http://192.168.1.41:2379&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">    ]</span></span>
<span class="line"><span style="color:#A6ACCD;">  }</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">» exit</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="执行stop-yml停止pd节点服务" tabindex="-1">执行stop.yml停止PD节点服务 <a class="header-anchor" href="#执行stop-yml停止pd节点服务" aria-label="Permalink to &quot;执行stop.yml停止PD节点服务&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook stop.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] **********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="从inventory-ini中移除ip信息" tabindex="-1">从inventory.ini中移除IP信息 <a class="header-anchor" href="#从inventory-ini中移除ip信息" aria-label="Permalink to &quot;从inventory.ini中移除IP信息&quot;">​</a></h3><p>如下图所示；</p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/9151829e15b242239ba3430e67ad6786.png" alt="4c57d18d35394ad9e15616e20402fd7.png"></p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/b4645ae5c9d742f8b01615762e9bf3af.png" alt="3a63ec1627d25c3e07e5fad3aa42a69.png"></p><h3 id="rolling-update-yml滚动更新集群" tabindex="-1">rolling-update.yml滚动更新集群 <a class="header-anchor" href="#rolling-update-yml滚动更新集群" aria-label="Permalink to &quot;rolling-update.yml滚动更新集群&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update.yml</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] ****************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP *********************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=117  changed=15   unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=92   changed=10   unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=116  changed=15   unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="滚动更新普罗米修斯-1" tabindex="-1">滚动更新普罗米修斯 <a class="header-anchor" href="#滚动更新普罗米修斯-1" aria-label="Permalink to &quot;滚动更新普罗米修斯&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] ****************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP *********************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="基于grafana的图形化界面检查" tabindex="-1">基于Grafana的图形化界面检查 <a class="header-anchor" href="#基于grafana的图形化界面检查" aria-label="Permalink to &quot;基于Grafana的图形化界面检查&quot;">​</a></h3><p><img src="http://cdn.lifemini.cn/dbblog/20201227/6ce5961607d0493ba7915f156eb8e971.png" alt="63d36d0af6a99f38eaafd73e664ff73.png"></p><h2 id="扩容-tidb-组件" tabindex="-1">扩容 TiDB 组件 <a class="header-anchor" href="#扩容-tidb-组件" aria-label="Permalink to &quot;扩容 TiDB 组件&quot;">​</a></h2><h3 id="配置互信和sudo规则" tabindex="-1">配置互信和sudo规则 <a class="header-anchor" href="#配置互信和sudo规则" aria-label="Permalink to &quot;配置互信和sudo规则&quot;">​</a></h3><p>对于TiDB集群节点的扩容操作，首先修改hosts.ini文件；</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi hosts.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ cat hosts.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[servers]</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[all:vars]</span></span>
<span class="line"><span style="color:#A6ACCD;">username = tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">ntp_server = cn.pool.ntp.org</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p><img src="http://cdn.lifemini.cn/dbblog/20201227/fcec4328a4294836b6d60223c1d6ce37.png" alt="029282675fd15d6d77eb0e48d227694.png"></p><h3 id="中控机操作部署机建用户-1" tabindex="-1">中控机操作部署机建用户 <a class="header-anchor" href="#中控机操作部署机建用户-1" aria-label="Permalink to &quot;中控机操作部署机建用户&quot;">​</a></h3><p>执行以下命令，依据输入<em><strong>部署目标机器</strong></em>的 root 用户密码； 本例新增节点IP为192.168.1.44；</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi hosts.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ cat hosts.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[servers]</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[all:vars]</span></span>
<span class="line"><span style="color:#A6ACCD;">username = tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">ntp_server = cn.pool.ntp.org</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini create_users.yml -u root -k</span></span>
<span class="line"><span style="color:#A6ACCD;">SSH password: </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [all] ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="中控机操作部署机配置ntp服务-1" tabindex="-1">中控机操作部署机配置ntp服务 <a class="header-anchor" href="#中控机操作部署机配置ntp服务-1" aria-label="Permalink to &quot;中控机操作部署机配置ntp服务&quot;">​</a></h3><p><em><strong>注意：生产上应该指向自己的ntp服务器，本次测试采用了公网公用的ntp服务不稳定。</strong></em></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [all] ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="中控及操作部署机设置cpu模式-1" tabindex="-1">中控及操作部署机设置CPU模式 <a class="header-anchor" href="#中控及操作部署机设置cpu模式-1" aria-label="Permalink to &quot;中控及操作部署机设置CPU模式&quot;">​</a></h3><p>调整CPU模式，如果同本文出现一样的报错，说明此版本的操作系统不支持CPU模式修改，可直接跳过。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible -i hosts.ini all -m shell -a &quot;cpupower frequency-set --governor performance&quot; -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44 | FAILED | rc=237 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">Setting cpu: 0</span></span>
<span class="line"><span style="color:#A6ACCD;">Error setting new values. Common errors:</span></span>
<span class="line"><span style="color:#A6ACCD;">- Do you have proper administration rights? (super-user?)</span></span>
<span class="line"><span style="color:#A6ACCD;">- Is the governor you requested available and modprobed?</span></span>
<span class="line"><span style="color:#A6ACCD;">- Trying to set an invalid policy?</span></span>
<span class="line"><span style="color:#A6ACCD;">- Trying to set a specific frequency, but userspace governor is not available,</span></span>
<span class="line"><span style="color:#A6ACCD;">   for example because of hardware which cannot be set to a specific frequency</span></span>
<span class="line"><span style="color:#A6ACCD;">   or because the userspace governor isn&#39;t loaded?non-zero return code</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="执行bootstrap-yml生成模板" tabindex="-1">执行bootstrap.yml生成模板 <a class="header-anchor" href="#执行bootstrap-yml生成模板" aria-label="Permalink to &quot;执行bootstrap.yml生成模板&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [initializing deployment target] ************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="执行deploy-yml开始部署" tabindex="-1">执行deploy.yml开始部署 <a class="header-anchor" href="#执行deploy-yml开始部署" aria-label="Permalink to &quot;执行deploy.yml开始部署&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [initializing deployment target] ************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">.....</span></span>
<span class="line"><span style="color:#A6ACCD;">.....</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="节点软件部署目录验证" tabindex="-1">节点软件部署目录验证 <a class="header-anchor" href="#节点软件部署目录验证" aria-label="Permalink to &quot;节点软件部署目录验证&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[root@tidb04-44 ~]# cd /data/tidb/deploy/</span></span>
<span class="line"><span style="color:#A6ACCD;">[root@tidb04-44 deploy]# ll</span></span>
<span class="line"><span style="color:#A6ACCD;">total 0</span></span>
<span class="line"><span style="color:#A6ACCD;">drwxr-xr-x.  2 tidb tidb   6 Dec 27 01:18 backup</span></span>
<span class="line"><span style="color:#A6ACCD;">drwxr-xr-x.  2 tidb tidb  25 Dec 27 01:18 bin</span></span>
<span class="line"><span style="color:#A6ACCD;">drwxr-xr-x.  2 tidb tidb  23 Dec 27 01:18 conf</span></span>
<span class="line"><span style="color:#A6ACCD;">drwxr-xr-x.  2 tidb tidb   6 Dec 27 01:18 log</span></span>
<span class="line"><span style="color:#A6ACCD;">drwxr-xr-x.  2 tidb tidb  66 Dec 27 01:18 scripts</span></span>
<span class="line"><span style="color:#A6ACCD;">drwxrwxr-x. 13 tidb tidb 211 Sep 16  2018 spark</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="执行start-yml开启tidb服务" tabindex="-1">执行start.yml开启tidb服务 <a class="header-anchor" href="#执行start-yml开启tidb服务" aria-label="Permalink to &quot;执行start.yml开启tidb服务&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook start.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] **********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="tidb节点登陆验证" tabindex="-1">TiDB节点登陆验证 <a class="header-anchor" href="#tidb节点登陆验证" aria-label="Permalink to &quot;TiDB节点登陆验证&quot;">​</a></h3><p>登陆验证成功</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ mysql -u root -h 192.168.1.44 -P 4000</span></span>
<span class="line"><span style="color:#A6ACCD;">Welcome to the MariaDB monitor.  Commands end with ; or \\g.</span></span>
<span class="line"><span style="color:#A6ACCD;">Your MySQL connection id is 2</span></span>
<span class="line"><span style="color:#A6ACCD;">Server version: 5.7.25-TiDB-v3.0.1 MySQL Community Server (Apache License 2.0)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Type &#39;help;&#39; or &#39;\\h&#39; for help. Type &#39;\\c&#39; to clear the current input statement.</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">MySQL [(none)]&gt; </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="更新普罗米修斯" tabindex="-1">更新普罗米修斯 <a class="header-anchor" href="#更新普罗米修斯" aria-label="Permalink to &quot;更新普罗米修斯&quot;">​</a></h3><p>普罗米修斯是以主动pull的方式，从相应节点拉去所需要的信息； 因此，如果不手动更新，普罗米修斯便不会手动去拉取相应信息，无法达到监控的目的。</p><p>更新普罗米修斯前：</p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/46d3e18a3fee4a5c815b5dca2aae49e6.png" alt="98796cd631809c0bb316b105822930c.png"></p><p>普罗米修斯是通过pull的方式去新的tidb节点拉取的。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] **********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>更新普罗米修斯后：</p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/486672e3306b41edb86b698d36d786be.png" alt="0d15b132201b1d48c858b674ea2b923.png"></p><p>可以看到节点已经更新完毕。</p><h2 id="缩容-tidb-组件" tabindex="-1">缩容 TiDB 组件 <a class="header-anchor" href="#缩容-tidb-组件" aria-label="Permalink to &quot;缩容 TiDB 组件&quot;">​</a></h2><h3 id="中控机操作目标机停用tidb服务" tabindex="-1">中控机操作目标机停用TiDB服务 <a class="header-anchor" href="#中控机操作目标机停用tidb服务" aria-label="Permalink to &quot;中控机操作目标机停用TiDB服务&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook stop.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] **********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="登陆验证tidb服务关闭" tabindex="-1">登陆验证TiDB服务关闭 <a class="header-anchor" href="#登陆验证tidb服务关闭" aria-label="Permalink to &quot;登陆验证TiDB服务关闭&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ mysql -u root -h 192.168.1.44 -P 4000</span></span>
<span class="line"><span style="color:#A6ACCD;">ERROR 2003 (HY000): Can&#39;t connect to MySQL server on &#39;192.168.1.44&#39; (111)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="中控机从inventory-ini移除ip" tabindex="-1">中控机从inventory.ini移除IP <a class="header-anchor" href="#中控机从inventory-ini移除ip" aria-label="Permalink to &quot;中控机从inventory.ini移除IP&quot;">​</a></h3><p><img src="http://cdn.lifemini.cn/dbblog/20201227/b99b0347cb5d4e4ebb0097f9b8345874.png" alt="99c7436e809d9c19fd042b08a6f1eb3.png"></p><p>node_exporter and blackbox_exporter servers部分的监控IP信息同理也要移除。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"># node_exporter and blackbox_exporter servers</span></span>
<span class="line"><span style="color:#A6ACCD;">[monitored_servers]</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="更新普哦米修斯" tabindex="-1">更新普哦米修斯 <a class="header-anchor" href="#更新普哦米修斯" aria-label="Permalink to &quot;更新普哦米修斯&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] **********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">.....</span></span>
<span class="line"><span style="color:#A6ACCD;">.....</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>红色部分需要一段时间才能消失，是整个集群还没有反映过来； 但是可以看到，TiDB的实例数量已经降到了2。</p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/dc89babef59f4262a0ff7b12b18ab45b.png" alt="1dc88c18a7de3dcafe8c757f993eda2.png"></p><h2 id="扩容-tikv-组件" tabindex="-1">扩容 TiKV 组件 <a class="header-anchor" href="#扩容-tikv-组件" aria-label="Permalink to &quot;扩容 TiKV 组件&quot;">​</a></h2><h3 id="配置inventory-ini的tikv部分" tabindex="-1">配置inventory.ini的TiKV部分 <a class="header-anchor" href="#配置inventory-ini的tikv部分" aria-label="Permalink to &quot;配置inventory.ini的TiKV部分&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>使用上述命令，在tikv_servers和monitored_servers中分别追加新部署节点的IP地址；</p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/c45b87c46cc143f8a0def8b154e35c6c.png" alt="5132bd5af713ee6e76bf91a87f58d87.png"></p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/15323cdc7b4a49c2a7b30532829c1c83.png" alt="dea88cbf26d02fa12d699d69bf343c8.png"></p><h3 id="中控机操作部署机建用户-2" tabindex="-1">中控机操作部署机建用户 <a class="header-anchor" href="#中控机操作部署机建用户-2" aria-label="Permalink to &quot;中控机操作部署机建用户&quot;">​</a></h3><p>执行以下命令，依据输入<em><strong>部署目标机器</strong></em>的 root 用户密码； 本例新增节点IP为192.168.1.44；</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi hosts.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ cat hosts.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[servers]</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[all:vars]</span></span>
<span class="line"><span style="color:#A6ACCD;">username = tidb</span></span>
<span class="line"><span style="color:#A6ACCD;">ntp_server = cn.pool.ntp.org</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini create_users.yml -u root -k</span></span>
<span class="line"><span style="color:#A6ACCD;">SSH password: </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [all] ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="中控机操作部署机配置ntp服务-2" tabindex="-1">中控机操作部署机配置ntp服务 <a class="header-anchor" href="#中控机操作部署机配置ntp服务-2" aria-label="Permalink to &quot;中控机操作部署机配置ntp服务&quot;">​</a></h3><p><em><strong>注意：生产上应该指向自己的ntp服务器，本次测试采用了公网公用的ntp服务不稳定。</strong></em></p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [all] ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="中控及操作部署机设置cpu模式-2" tabindex="-1">中控及操作部署机设置CPU模式 <a class="header-anchor" href="#中控及操作部署机设置cpu模式-2" aria-label="Permalink to &quot;中控及操作部署机设置CPU模式&quot;">​</a></h3><p>调整CPU模式，如果同本文出现一样的报错，说明此版本的操作系统不支持CPU模式修改，可直接跳过。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible -i hosts.ini all -m shell -a &quot;cpupower frequency-set --governor performance&quot; -u tidb -b</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44 | FAILED | rc=237 &gt;&gt;</span></span>
<span class="line"><span style="color:#A6ACCD;">Setting cpu: 0</span></span>
<span class="line"><span style="color:#A6ACCD;">Error setting new values. Common errors:</span></span>
<span class="line"><span style="color:#A6ACCD;">- Do you have proper administration rights? (super-user?)</span></span>
<span class="line"><span style="color:#A6ACCD;">- Is the governor you requested available and modprobed?</span></span>
<span class="line"><span style="color:#A6ACCD;">- Trying to set an invalid policy?</span></span>
<span class="line"><span style="color:#A6ACCD;">- Trying to set a specific frequency, but userspace governor is not available,</span></span>
<span class="line"><span style="color:#A6ACCD;">   for example because of hardware which cannot be set to a specific frequency</span></span>
<span class="line"><span style="color:#A6ACCD;">   or because the userspace governor isn&#39;t loaded?non-zero return code</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="执行bootstrap-yml创建模板" tabindex="-1">执行bootstrap.yml创建模板 <a class="header-anchor" href="#执行bootstrap-yml创建模板" aria-label="Permalink to &quot;执行bootstrap.yml创建模板&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [initializing deployment target] ************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="执行start-yml启动tikv服务" tabindex="-1">执行start.yml启动tikv服务 <a class="header-anchor" href="#执行start-yml启动tikv服务" aria-label="Permalink to &quot;执行start.yml启动tikv服务&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook start.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] **********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="执行rolling-update-yml滚动更新" tabindex="-1">执行rolling-update.yml滚动更新 <a class="header-anchor" href="#执行rolling-update-yml滚动更新" aria-label="Permalink to &quot;执行rolling-update.yml滚动更新&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] **********************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP ***************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.44               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="pd-ctl命令行验证是否成功" tabindex="-1">pd-ctl命令行验证是否成功 <a class="header-anchor" href="#pd-ctl命令行验证是否成功" aria-label="Permalink to &quot;pd-ctl命令行验证是否成功&quot;">​</a></h3><p>可以使用stores show命令可以在pd-ctl交互式命令行中看到； &quot;count&quot;：4 表示当前tikv有四个节点，说明tikv节点已经添加成功了。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ resources/bin/pd-ctl -u http://192.168.1.41:2379 -i</span></span>
<span class="line"><span style="color:#A6ACCD;">» stores show</span></span>
<span class="line"><span style="color:#A6ACCD;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;count&quot;: 4,</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;stores&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;store&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;id&quot;: 2001,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;address&quot;: &quot;192.168.1.44:20160&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;version&quot;: &quot;3.0.1&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state_name&quot;: &quot;Up&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;status&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;capacity&quot;: &quot;17 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;available&quot;: &quot;15 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_count&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_score&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_size&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_count&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_score&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_size&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;start_ts&quot;: &quot;2020-12-27T01:53:06-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;last_heartbeat_ts&quot;: &quot;2020-12-27T01:59:36.260710913-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;uptime&quot;: &quot;6m30.260710913s&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;store&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;id&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;address&quot;: &quot;192.168.1.41:20160&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;version&quot;: &quot;3.0.1&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state_name&quot;: &quot;Up&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;status&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;capacity&quot;: &quot;17 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;available&quot;: &quot;3.4 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_score&quot;: 1073738348.2304688,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;start_ts&quot;: &quot;2020-12-27T01:02:52-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;last_heartbeat_ts&quot;: &quot;2020-12-27T01:59:34.041233812-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;uptime&quot;: &quot;56m42.041233812s&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;store&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;id&quot;: 4,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;address&quot;: &quot;192.168.1.43:20160&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;version&quot;: &quot;3.0.1&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state_name&quot;: &quot;Up&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;status&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;capacity&quot;: &quot;17 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;available&quot;: &quot;14 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_count&quot;: 9,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_score&quot;: 9,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_size&quot;: 9,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_count&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_score&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_size&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;start_ts&quot;: &quot;2020-12-27T01:01:12-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;last_heartbeat_ts&quot;: &quot;2020-12-27T01:59:32.975729011-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;uptime&quot;: &quot;58m20.975729011s&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;store&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;id&quot;: 5,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;address&quot;: &quot;192.168.1.42:20160&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;version&quot;: &quot;3.0.1&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state_name&quot;: &quot;Up&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;status&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;capacity&quot;: &quot;17 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;available&quot;: &quot;13 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_count&quot;: 10,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_score&quot;: 10,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_size&quot;: 10,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_count&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_score&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_size&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;start_ts&quot;: &quot;2020-12-27T01:01:12-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;last_heartbeat_ts&quot;: &quot;2020-12-27T01:59:33.014833325-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;uptime&quot;: &quot;58m21.014833325s&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">  ]</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">» exit</span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><p>更新普罗米修斯后：</p><p>使用普罗米修斯的Grafana图形化监控界面也可以看到当前的tikv集群也已经加入新节点成功了。</p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/2b15553374e54489b3b3f12707d5d264.png" alt="ea85764f4fe314d64f8295232245eeb.png"></p><h2 id="缩容-tikv-组件" tabindex="-1">缩容 TiKV 组件 <a class="header-anchor" href="#缩容-tikv-组件" aria-label="Permalink to &quot;缩容 TiKV 组件&quot;">​</a></h2><h3 id="pd-删除-tikv-节点" tabindex="-1">pd 删除 TiKV 节点 <a class="header-anchor" href="#pd-删除-tikv-节点" aria-label="Permalink to &quot;pd 删除 TiKV 节点&quot;">​</a></h3><p>首先，登录pd-ctl交互式命令行，在PD集群中声明将该TiKV节点踢出TiKV集群； 而后，PD集群会将存在与被提出集群节点上的Region调度到其他机器上； 但应在命令行上为Offline状态，注意此时的offline状态并非是已调度完毕状态，而是正在调度状态； 真正的调度完成状态为tombstone（墓碑）状体，反应到命令上为该id消失。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ resources/bin/pd-ctl -u http://192.168.1.41:2379 -i</span></span>
<span class="line"><span style="color:#A6ACCD;">» store delete 2001</span></span>
<span class="line"><span style="color:#A6ACCD;">Success!</span></span>
<span class="line"><span style="color:#A6ACCD;">» stores show</span></span>
<span class="line"><span style="color:#A6ACCD;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;count&quot;: 4,</span></span>
<span class="line"><span style="color:#A6ACCD;">  &quot;stores&quot;: [</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;store&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;id&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;address&quot;: &quot;192.168.1.41:20160&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;version&quot;: &quot;3.0.1&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state_name&quot;: &quot;Up&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;status&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;capacity&quot;: &quot;17 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;available&quot;: &quot;3.4 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_score&quot;: 1073738348.6953125,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;start_ts&quot;: &quot;2020-12-27T01:02:52-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;last_heartbeat_ts&quot;: &quot;2020-12-27T02:01:44.059741115-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;uptime&quot;: &quot;58m52.059741115s&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;store&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;id&quot;: 4,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;address&quot;: &quot;192.168.1.43:20160&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;version&quot;: &quot;3.0.1&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state_name&quot;: &quot;Up&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;status&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;capacity&quot;: &quot;17 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;available&quot;: &quot;14 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_count&quot;: 9,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_score&quot;: 9,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_size&quot;: 9,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_count&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_score&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_size&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;start_ts&quot;: &quot;2020-12-27T01:01:12-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;last_heartbeat_ts&quot;: &quot;2020-12-27T02:01:42.99596895-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;uptime&quot;: &quot;1h0m30.99596895s&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;store&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;id&quot;: 5,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;address&quot;: &quot;192.168.1.42:20160&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;version&quot;: &quot;3.0.1&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state_name&quot;: &quot;Up&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;status&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;capacity&quot;: &quot;17 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;available&quot;: &quot;13 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_count&quot;: 10,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_score&quot;: 10,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_size&quot;: 10,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_count&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_score&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_size&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;start_ts&quot;: &quot;2020-12-27T01:01:12-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;last_heartbeat_ts&quot;: &quot;2020-12-27T02:01:43.033315794-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;uptime&quot;: &quot;1h0m31.033315794s&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    },</span></span>
<span class="line"><span style="color:#A6ACCD;">    {</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;store&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;id&quot;: 2001,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;address&quot;: &quot;192.168.1.44:20160&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;version&quot;: &quot;3.0.1&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;state_name&quot;: &quot;Offline&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      },</span></span>
<span class="line"><span style="color:#A6ACCD;">      &quot;status&quot;: {</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;capacity&quot;: &quot;17 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;available&quot;: &quot;15 GiB&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_count&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_score&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;leader_size&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_count&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_weight&quot;: 1,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_score&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;region_size&quot;: 20,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;start_ts&quot;: &quot;2020-12-27T01:53:06-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;last_heartbeat_ts&quot;: &quot;2020-12-27T02:01:46.276789545-05:00&quot;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        &quot;uptime&quot;: &quot;8m40.276789545s&quot;</span></span>
<span class="line"><span style="color:#A6ACCD;">      }</span></span>
<span class="line"><span style="color:#A6ACCD;">    }</span></span>
<span class="line"><span style="color:#A6ACCD;">  ]</span></span>
<span class="line"><span style="color:#A6ACCD;">}</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">» </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="执行stop-yml停止节点tikv服务" tabindex="-1">执行stop.yml停止节点tikv服务 <a class="header-anchor" href="#执行stop-yml停止节点tikv服务" aria-label="Permalink to &quot;执行stop.yml停止节点tikv服务&quot;">​</a></h3><p>等待offline之后,执行stop.yml停止节点tikv服务；</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook stop.yml -l 192.168.1.44</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] *********************************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">skipping: no hosts matched</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;">......</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="从inventory-ini中移除tikv节点ip" tabindex="-1">从inventory.ini中移除tikv节点IP <a class="header-anchor" href="#从inventory-ini中移除tikv节点ip" aria-label="Permalink to &quot;从inventory.ini中移除tikv节点IP&quot;">​</a></h3><p>如下图所示，将框选出IP移除该文件；</p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/be8f5aa1d45b4107a3a32ba367b226e6.png" alt="5b9b77a5bb7f53af382a1459ab2b0fb.png"></p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/52da60141a0a45f8afd9872ef198ec4b.png" alt="f27369a63cad296c22e8a014c68d0b7.png"></p><h3 id="滚动更新普罗米修斯-2" tabindex="-1">滚动更新普罗米修斯 <a class="header-anchor" href="#滚动更新普罗米修斯-2" aria-label="Permalink to &quot;滚动更新普罗米修斯&quot;">​</a></h3><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini </span></span>
<span class="line"><span style="color:#A6ACCD;">[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY [check config locally] *********************************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">.....</span></span>
<span class="line"><span style="color:#A6ACCD;">.....</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">PLAY RECAP **************************************************************************************************************************************************</span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;">localhost                  : ok=7    changed=4    unreachable=0    failed=0   </span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">Congrats! All goes well. :-)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h3 id="普罗米修斯检查" tabindex="-1">普罗米修斯检查 <a class="header-anchor" href="#普罗米修斯检查" aria-label="Permalink to &quot;普罗米修斯检查&quot;">​</a></h3><p><img src="http://cdn.lifemini.cn/dbblog/20201227/13103cdaa9ef4c49afb1d89d50a334be.png" alt="84f476fc743f2cf8de27d5b2233c761.png"></p><p>刚刚更新完毕，集群还需要一定的时间反应； 下图可以看出，红色部分已经消失。</p><p><img src="http://cdn.lifemini.cn/dbblog/20201227/f83b5cb124a0412d8c32df717c55ed38.png" alt="09c46c43533324e9562450d4224e2c4.png"></p>`,233),o=[e];function t(c,i,r,C,A,y){return a(),n("div",null,o)}const b=s(p,[["render",t]]);export{u as __pageData,b as default};
