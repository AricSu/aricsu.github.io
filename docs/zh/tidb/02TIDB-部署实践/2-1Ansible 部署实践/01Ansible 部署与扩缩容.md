
## Ansible 部署


### TiDB-Ansible解决的问题
tidb的二进制部署时，某些环境下节点会超过100+；
单节点依次部署是非常麻烦，因此tidbAnsible统一部署及管理非常必要；


TiDB-Ansible的操作时幂等的，在操作过程中遇到报错，修复后即可继续安装。安装时注意，TiDB及TiDB-Ansible版本要对应；

### TiDB-Ansible目录结构

| 主要部分 | 说明 |
|---|---|
| yml文件 | 存放playbook剧本 |
| conf目录 | 配置文件 |
| group_vars目录| 端口配置等 |
| inventory.ini文件 | 主要的配置文件，指定操作主机 |
| resource和download目录 | binary包 |
| scripts目录 | 监控相关json文件，初始化之后生成运维脚本 |
| roles目录 | 角色相关目录和自定义变量 |


### TiDB-Ansible命令简介
| 功能 | 命令 | 备注 |
|---|---|---|
| 环境初始化 | ansible-playbook bootstrap.yml | 在服务器创建相应目录并检测环境信息 |
| 部署集群 | ansible-playbook deploy.yml | 正式开始部署，包含配置文件，启动脚本，binary包的分发等 |
| 更新集群 | ansible-playbook rolling_update.yml | 每个组件一步一步升级操作（pd->tikv->tidb） |
| 关闭集群 | ansible-playbook stop.yml |  |
| 启动集群 | ansible-playbook start.yml |  |

常用参数 
-l:指定host或者别名
--tags：指定task(tidb、tikv等组件)
-f:调整并发


### TiDB-Ansible在线部署TiDB集群

可供离线部署步骤参考使用；

#### 环境与IP规划

> **环境说明**

服务器环境	CentOS Linux release 7.9.2009 (Core)  
数据库版本	5.7.25-TiDB-v3.0.0  
文档参考地址     [**TiDB官网：https://docs.pingcap.com/zh/tidb/stable/production-deployment-using-tiup**](https://docs.pingcap.com/zh/tidb/stable/production-deployment-using-tiup)  

> **IP规划**

| IP地址 | Role信息 | 备注 |
|-|-|-|
| 192.168.1.41 | pd+tikv+tidb-ansible+monitor | 部署主机 |
| 192.168.1.42 | pd+tikv+tidb |  |
| 192.168.1.43 | pd+tikv+tidb |  |
| 192.168.1.44 | pd+tikv+tidb | 用于增删节点 |



> **核心部署步骤**

* 中控机安装依赖
  * 中控机安装git pip curl sshpass
  * 中控机安装Ansible(2.5+)及其依赖
* 中控机部署配置
  * 中控机创建tidb用户并配置互信
  * 中控机下载TiDB-Ansible(TiDB用户下)
  * 中控机配置NTP、CPUfrep、ext4
* 正式开始部署
  * 编辑inventory.ini
  * bootstrap.yml初始化环境
  * deploy.yml部署任务
  * start.yml启动集群
* 测试集群部署






#### 中控机配置依赖

> **中控机安装系统依赖包**

注意事项：
1. 在可联网的下载机上下载系统依赖离线安装包，然后上传至中控机。
2. 该离线包仅支持 CentOS 7 系统，包含安装git pip curl sshpass。
3. pip请确认版本 >= 8.1.2，否则会有兼容问题。

```
tar -xzvf ansible-system-rpms.el7.tar.gz &&
cd ansible-system-rpms.el7 &&
chmod u+x install_ansible_system_rpms.sh &&
./install_ansible_system_rpms.sh

ansible-system-rpms.el7/
ansible-system-rpms.el7/sed-4.2.2-5.el7.x86_64.rpm
......
......
Installed:
  python-backports.x86_64 0:1.0-8.el7        python-backports-ssl_match_hostname.noarch 0:3.4.0.2-4.el7        python-setuptools.noarch 0:0.9.8-7.el7       
  python2-pip.noarch 0:8.1.2-5.el7           sshpass.x86_64 0:1.06-2.el7                                      

Complete!




pip -V

pip 8.1.2 from /usr/lib/python2.7/site-packages (python 2.7)
```

> **中控机tidb 用户生成 ssh key**

创建 tidb 用户并修改密码
```
useradd -m -d /home/tidb tidb

passwd tidb
```

配置 tidb 用户 sudo 免密码；
<span style='color:red'>将 tidb ALL=(ALL) NOPASSWD: ALL 添加到文件末尾即可</span>

```
visudo
tidb ALL=(ALL) NOPASSWD: ALL
```


tidb 用户下生成 SSH key,直接回车即可;
执行成功后:
SSH 私钥文件为 /home/tidb/.ssh/id_rsa;
SSH 公钥文件为 /home/tidb/.ssh/id_rsa.pub。

```
su - tidb


ssh-keygen -t rsa
Generating public/private rsa key pair.
Enter file in which to save the key (/home/tidb/.ssh/id_rsa):
Created directory '/home/tidb/.ssh'.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:


Your identification has been saved in /home/tidb/.ssh/id_rsa.
Your public key has been saved in /home/tidb/.ssh/id_rsa.pub.
The key fingerprint is:


SHA256:eIBykszR1KyECA/h0d7PRKz4fhAeli7IrVphhte7/So tidb@172.16.10.49
The key's randomart image is:
+---[RSA 2048]----+
|=+o+.o.          |
|o=o+o.oo         |
| .O.=.=          |
| . B.B +         |
|o B * B S        |
| * + * +         |
|  o + .          |
| o  E+ .         |
|o   ..+o.        |
+----[SHA256]-----+
```


> **中控机器上下载 TiDB Ansible**


注意事项：
1. 在TiDB用户下操作；
2. 使用以下命令从 TiDB Ansible 项目上下载相应 TAG 版本的tidb-ansible，$tag 替换为选定的 TAG 版本的值，例如 v3.0.0；
3. 使用外部下载机下载相应版本TiDB Ansible后，用sftp等软件将安装包上传；
4. 将tidb-ansible上传到/home/tidb 目录下，权限为 tidb 用户，否则可能会遇到权限问题；
5. 目前，TiDB Ansible release-4.0 版本兼容 Ansible 2.5 ~ 2.7.11 


```
git clone -b $tag https://github.com/pingcap/tidb-ansible.git


scp tidb-ansible tidb@中控机IP:/home/tidb/
```


Ansible 及相关依赖的版本信息记录在 tidb-ansible/requirements.txt 文件中。

```
cd /home/tidb/tidb-ansible && \
sudo pip install -r ./requirements.txt
```

查看 Ansible 的版本
```
ansible --version

ansible 2.7.11
```


> **中控机上配置部署机器 SSH 互信及 sudo 规则**

注意事项：
1.以 tidb 用户登录中控机，然后执行以下步骤：
2.将你的部署目标机器 IP 添加到 hosts.ini 文件的 [servers] 区块下。
3.<span style='color:red'>cn.pool.ntp.org是网络上找的中国公用ntp服务不稳定，仅限测试机使用，生产服务器请使用自己的ntp服务。--[**国内常用NTP服务器地址及IP网址参考链接**](https://www.cnblogs.com/croso/p/6670039.html)</span>

```
cd /home/tidb/tidb-ansible && \
vi hosts.ini


[servers]
192.168.1.41
192.168.1.42
192.168.1.43

[all:vars]
username = tidb
ntp_server = cn.pool.ntp.org
```
执行以下命令并按提示输入部署目标机器的 root 用户密码后，将在部署目标机器上创建 tidb 用户，并配置 sudo 规则，配置中控机与部署目标机器之间的 SSH 互信。
```
ansible-playbook -i hosts.ini create_users.yml -u root -k
```

> **在部署目标机器上安装 NTP 服务**

注意事项：   
1. 以 tidb 用户登录中控机，执行以下命令；  
2. 该步骤将在部署目标机器上使用系统自带软件源联网安装并启动 NTP 服务;  
3. 服务使用安装包默认的 NTP server 列表，见配置文件 /etc/ntp.conf 中 server 参数，如果使用默认的 NTP server，你的机器需要连接外网。   
4. 为让 NTP 尽快开始同步，启动 NTP 服务前，系统会执行 ntpdate 命令，与用户在 hosts.ini 文件中指定的 ntp_server 同步日期与时间。    
5. 默认的服务器为 pool.ntp.org，也可替换为你的 NTP server。     
6. <span style='color:red'>注意：如果你的部署目标机器时间、时区设置一致，已开启 NTP 服务且在正常同步时间，此步骤可忽略。可参考如何检测 NTP 服务是否正常。</span>    

```
cd /home/tidb/tidb-ansible && \
ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b
```


> **在部署目标机器上配置 CPUfreq 调节器模式**

注意事项：
1. 如果支持设置 performance 和 powersave 模式，为发挥CPU最大性能，推荐设置CPUfreq调节器模式置为 performance 模式；
2. 本例中系统返回 Not Available，表示当前系统不支持配置 CPUfreq，跳过该步骤即可；


查看系统支持的调节器模式
```
cpupower frequency-info --governors


analyzing CPU 0:
  available cpufreq governors: performance powersave
```


<p style='color:red'>
或者
</p>


```
cpupower frequency-info --governors


analyzing CPU 0:
  available cpufreq governors: Not Available
```

查看系统当前的 CPUfreq 调节器模式，如下面代码所示，当前配置是 powersave 模式。
```
cpupower frequency-info --policy
analyzing CPU 0:
  current policy: frequency should be within 1.20 GHz and 3.20 GHz.
                  The governor "powersave" may decide which speed to use
                  within this range.
```


修改调节器模式

可以使用 cpupower frequency-set --governor 命令单机修改；

```
cpupower frequency-set --governor performance
```

也可以使用以下命令在部署目标机器上批量设置<span style='color:red'>  （推荐使用）</span>；
```
ansible -i hosts.ini all -m shell -a "cpupower frequency-set --governor performance" -u tidb -b
```


> **在部署目标机器上添加数据盘 ext4 文件系统挂载参数**


1. 使用 root 用户登录目标机器;
2. 将部署目标机器数据盘格式化成 ext4 文件系统;
3. 挂载时添加 nodelalloc 和 noatime 挂载参数;
4. nodelalloc 是必选参数，否则 Ansible 安装时检测无法通过,noatime 是可选建议参数;
5. 如果数据盘已经格式化成ext4并挂载，可先执行 umount,编辑 /etc/fstab 文件，添加挂载参数后重新挂载。
6. 使用 lsblk 命令查看分区的设备号：对于 nvme 磁盘（固态硬盘），生成的分区设备号一般为 nvme0n1p1；对于普通磁盘（例如 /dev/sdb），生成的的分区设备号一般为 sdb1。


<span style='color:red'>
以 /dev/nvme0n1 数据盘为例，具体操作步骤如下：
</span>

查看数据盘;
```
fdisk -l
Disk /dev/nvme0n1: 1000 GB
```

创建分区表;
```
parted -s -a optimal /dev/nvme0n1 mklabel gpt -- mkpart primary ext4 1 -1
```



格式化文件系统。
```
mkfs.ext4 /dev/nvme0n1p1
```
查看数据盘分区 UUID。
本例中 nvme0n1p1 的 UUID 为 c51eb23b-195c-4061-92a9-3fad812cc12f。
```
lsblk -f
NAME    FSTYPE LABEL UUID                                 MOUNTPOINT
sda
├─sda1  ext4         237b634b-a565-477b-8371-6dff0c41f5ab /boot
├─sda2  swap         f414c5c0-f823-4bb1-8fdf-e531173a72ed
└─sda3  ext4         547909c1-398d-4696-94c6-03e43e317b60 /
sr0
nvme0n1
└─nvme0n1p1 ext4         c51eb23b-195c-4061-92a9-3fad812cc12f
```

编辑 /etc/fstab 文件，添加 nodelalloc 挂载参数。
```
vi /etc/fstab
UUID=c51eb23b-195c-4061-92a9-3fad812cc12f /data1 ext4 defaults,nodelalloc,noatime 0 2
```
挂载数据盘。
```
mkdir /data1 && \
mount -a
```

执行以下命令，如果文件系统为 ext4，并且挂载参数中包含 nodelalloc，则表示已生效。
```
mount -t ext4
/dev/nvme0n1p1 on /data1 type ext4 (rw,noatime,nodelalloc,data=ordered)
```



#### 正式开始部署

> **编辑 inventory.ini 文件分配机器资源**


注意事项：

1. 以 tidb 用户登录中控机，编辑 /home/tidb/tidb-ansible/inventory.ini 文件为 TiDB 集群分配机器资源。   
2. 一个标准的 TiDB 集群需要 6 台机器：2 个 TiDB 实例，3 个 PD 实例，3 个 TiKV 实例,至少需部署 3 个 TiKV 实例。    
3. 不推荐将 TiKV 实例与 TiDB 或 PD 实例混合部署在同一台机器上<span style="color:red">----本例测试机采用这种部署方案！！！</span>   
4. 将第一台 TiDB 机器同时用作监控机。    
5. 请使用内网 IP 来部署集群，如果部署目标机器 SSH 端口非默认的 22 端口，需添加 ansible_port 变量，如 TiDB1 ansible_host=172.16.10.1 ansible_port=5555。
6. 如果是 ARM 架构的机器，需要将 cpu_architecture 改为 arm64。   
7. 默认情况下，建议在每个 TiKV 节点上仅部署一个 TiKV 实例，以提高性能。但是，如果你的 TiKV 部署机器的 CPU 和内存配置是部署建议的两倍或以上，并且一个节点拥有两块 SSD 硬盘或者单块 SSD 硬盘的容量大于 2 TB，则可以考虑部署两实例，但不建议部署两个以上实例。   

执行以下命令，如果所有 server 均返回 tidb，表示 SSH 互信配置成功：
```
ansible -i inventory.ini all -m shell -a 'whoami'
```

执行以下命令，如果所有 server 均返回 root，表示 tidb 用户 sudo 免密码配置成功。
```
ansible -i inventory.ini all -m shell -a 'whoami' -b
```


> **部署 TiDB 集群**

1. ansible-playbook 执行 Playbook 时，默认并发为 5;  
2. 部署目标机器较多时，可添加 -f 参数指定并发数，例如 ansible-playbook deploy.yml -f 10。  
3. 默认使用tidb 用户作为服务运行用户,需在tidb-ansible/inventory.ini 文件中，确认 ansible_user = tidb。  
4. 不要将 ansible_user 设置为 root 用户，因为 tidb-ansible 限制了服务以普通用户运行。  
  
```
Connection
ssh via normal user
ansible_user = tidb
```

执行 local_prepare.yml playbook，联网下载 TiDB binary 至中控机。
```
ansible-playbook local_prepare.yml
```



<span style='color:red'>如果采用实验环境很难满足TiDB的硬件要求（节点CPU核心数最低8核，内存最低16000MB），可以采用如下关闭自检的方式搭建，生产环境不要使用！</span>

```
- name: check system
  hosts: all
  any_errors_fatal: true
  roles:
    - check_system_static
    #- { role: check_system_optional, when: not dev_mode|default(false) }

- name: tikv_servers machine benchmark
  hosts: tikv_servers
  gather_facts: false
  roles:
    #- { role: machine_benchmark, when: not dev_mode|default(false) }

```

> **bootstrap.yml初始化环境**



初始化系统环境，修改内核参数。
```
ansible-playbook bootstrap.yml
```

> **deploy.yml部署任务**




部署 TiDB 集群软件。
```
ansible-playbook deploy.yml
```

> **start.yml启动集群**


启动 TiDB 集群。
```
ansible-playbook start.yml
```

#### 测试集群部署
TiDB 兼容 MySQL，因此可使用 MySQL 客户端直接连接 TiDB。推荐配置负载均衡以提供统一的 SQL 接口。

使用 MySQL 客户端连接 TiDB 集群。TiDB 服务的默认端口为 4000。

```
mysql -u root -h 172.16.10.1 -P 4000
```



## 扩容 PD 组件 


### 配置inventory.ini新节点IP信息
```
......
......

[pd_servers]
192.168.1.41
192.168.1.42
192.168.1.43
192.168.1.44

......
......

# node_exporter and blackbox_exporter servers
[monitored_servers]
192.168.1.41
192.168.1.42
192.168.1.43
192.168.1.44

......
......

```


### 中控机操作部署机建用户

执行以下命令，依据输入***部署目标机器***的 root 用户密码；
本例新增节点IP为192.168.1.44；



```
[tidb@tidb01-41 tidb-ansible]$ vi hosts.ini 
[tidb@tidb01-41 tidb-ansible]$ cat hosts.ini 
[servers]
192.168.1.44


[all:vars]
username = tidb
ntp_server = cn.pool.ntp.org



[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini create_users.yml -u root -k
SSH password: 

PLAY [all] ***************************************************************************************************************
......
......

Congrats! All goes well. :-)
```

### 中控机操作部署机配置ntp服务

***注意：生产上应该指向自己的ntp服务器，本次测试采用了公网公用的ntp服务不稳定。***

```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b

PLAY [all] ***************************************************************************************************************

......
......

Congrats! All goes well. :-)

```




### 中控及操作部署机设置CPU模式


调整CPU模式，如果同本文出现一样的报错，说明此版本的操作系统不支持CPU模式修改，可直接跳过。

```
[tidb@tidb01-41 tidb-ansible]$ ansible -i hosts.ini all -m shell -a "cpupower frequency-set --governor performance" -u tidb -b
192.168.1.44 | FAILED | rc=237 >>
Setting cpu: 0
Error setting new values. Common errors:
- Do you have proper administration rights? (super-user?)
- Is the governor you requested available and modprobed?
- Trying to set an invalid policy?
- Trying to set a specific frequency, but userspace governor is not available,
   for example because of hardware which cannot be set to a specific frequency
   or because the userspace governor isn't loaded?non-zero return code

```








### 执行bootstrap.yml生成模板文件
```
[tidb@tidb01-41 tidb-ansible]$ 
[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini 
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44

PLAY [initializing deployment target] ************************************************************************************
skipping: no hosts matched

......
......

Congrats! All goes well. :-)

```


### 执行deploy.yml正式部署新节点
```
[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini 
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44

PLAY [initializing deployment target] ************************************************************************************
skipping: no hosts matched

......
......

Congrats! All goes well. :-)
```


### 滚动更新普罗米修斯
```
[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini 
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus

PLAY [check config locally] ****************************************************************************************************

......
......

PLAY RECAP *********************************************************************************************************************
192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   
192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   
192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   
localhost                  : ok=7    changed=4    unreachable=0    failed=0   

Congrats! All goes well. :-)
```

### 基于Grafana可视化界面验证

![39368d20da884d3e70484891aa58aae.png](http://cdn.lifemini.cn/dbblog/20201227/b5ceba7b9807484b9f385d382d5ab325.png)



## 缩容 PD 组件 


### pd-ctl命令行删除PD节点

首先，登录pd-ctl命令行使用member命令查看删除节点对应"name": "pd_tidb04-44"；
其次，执行member delete name pd_tidb04-44操作删除该PD节点；
最后，使用member命令查看已无该name的集群节点出现。

```
[tidb@tidb01-41 tidb-ansible]$ resources/bin/pd-ctl -u http://192.168.1.41:2379 -i
» member
{
  "header": {
    "cluster_id": 6909452787323084897
  },
  "members": [
    {
      "name": "pd_tidb02-42",
      "member_id": 986258930764209162,
      "peer_urls": [
        "http://192.168.1.42:2380"
      ],
      "client_urls": [
        "http://192.168.1.42:2379"
      ]
    },
    {
      "name": "pd_tidb01-41",
      "member_id": 3654086277121920294,
      "peer_urls": [
        "http://192.168.1.41:2380"
      ],
      "client_urls": [
        "http://192.168.1.41:2379"
      ]
    },
    {
      "name": "pd_tidb04-44",
      "member_id": 6266742378045652471,
      "peer_urls": [
        "http://192.168.1.44:2380"
      ],
      "client_urls": [
        "http://192.168.1.44:2379"
      ]
    },
    {
      "name": "pd_tidb03-43",
      "member_id": 6461985847067688046,
      "peer_urls": [
        "http://192.168.1.43:2380"
      ],
      "client_urls": [
        "http://192.168.1.43:2379"
      ]
    }
  ],
  "leader": {
    "name": "pd_tidb01-41",
    "member_id": 3654086277121920294,
    "peer_urls": [
      "http://192.168.1.41:2380"
    ],
    "client_urls": [
      "http://192.168.1.41:2379"
    ]
  },
  "etcd_leader": {
    "name": "pd_tidb01-41",
    "member_id": 3654086277121920294,
    "peer_urls": [
      "http://192.168.1.41:2380"
    ],
    "client_urls": [
      "http://192.168.1.41:2379"
    ]
  }
}

» member delete name pd_tidb04-44
Success!
» member
{
  "header": {
    "cluster_id": 6909452787323084897
  },
  "members": [
    {
      "name": "pd_tidb02-42",
      "member_id": 986258930764209162,
      "peer_urls": [
        "http://192.168.1.42:2380"
      ],
      "client_urls": [
        "http://192.168.1.42:2379"
      ]
    },
    {
      "name": "pd_tidb01-41",
      "member_id": 3654086277121920294,
      "peer_urls": [
        "http://192.168.1.41:2380"
      ],
      "client_urls": [
        "http://192.168.1.41:2379"
      ]
    },
    {
      "name": "pd_tidb03-43",
      "member_id": 6461985847067688046,
      "peer_urls": [
        "http://192.168.1.43:2380"
      ],
      "client_urls": [
        "http://192.168.1.43:2379"
      ]
    }
  ],
  "leader": {
    "name": "pd_tidb01-41",
    "member_id": 3654086277121920294,
    "peer_urls": [
      "http://192.168.1.41:2380"
    ],
    "client_urls": [
      "http://192.168.1.41:2379"
    ]
  },
  "etcd_leader": {
    "name": "pd_tidb01-41",
    "member_id": 3654086277121920294,
    "peer_urls": [
      "http://192.168.1.41:2380"
    ],
    "client_urls": [
      "http://192.168.1.41:2379"
    ]
  }
}

» exit

```



### 执行stop.yml停止PD节点服务

```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook stop.yml -l 192.168.1.44

PLAY [check config locally] **********************************************************************************************
skipping: no hosts matched

......
......

Congrats! All goes well. :-)
```


### 从inventory.ini中移除IP信息


如下图所示；

![4c57d18d35394ad9e15616e20402fd7.png](http://cdn.lifemini.cn/dbblog/20201227/9151829e15b242239ba3430e67ad6786.png)



![3a63ec1627d25c3e07e5fad3aa42a69.png](http://cdn.lifemini.cn/dbblog/20201227/b4645ae5c9d742f8b01615762e9bf3af.png)




### rolling-update.yml滚动更新集群
```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update.yml

PLAY [check config locally] ****************************************************************************************************

......
......

PLAY RECAP *********************************************************************************************************************
192.168.1.41               : ok=117  changed=15   unreachable=0    failed=0   
192.168.1.42               : ok=92   changed=10   unreachable=0    failed=0   
192.168.1.43               : ok=116  changed=15   unreachable=0    failed=0   
localhost                  : ok=7    changed=4    unreachable=0    failed=0   

Congrats! All goes well. :-)

```

### 滚动更新普罗米修斯
```
[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini 
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus

PLAY [check config locally] ****************************************************************************************************

......
......

PLAY RECAP *********************************************************************************************************************
192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   
192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   
192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   
localhost                  : ok=7    changed=4    unreachable=0    failed=0   

Congrats! All goes well. :-)
```


### 基于Grafana的图形化界面检查


![63d36d0af6a99f38eaafd73e664ff73.png](http://cdn.lifemini.cn/dbblog/20201227/6ce5961607d0493ba7915f156eb8e971.png)



## 扩容 TiDB 组件 


### 配置互信和sudo规则

对于TiDB集群节点的扩容操作，首先修改hosts.ini文件；


```
[tidb@tidb01-41 tidb-ansible]$ vi hosts.ini 
[tidb@tidb01-41 tidb-ansible]$ cat hosts.ini 
[servers]
192.168.1.44

[all:vars]
username = tidb
ntp_server = cn.pool.ntp.org

```

![029282675fd15d6d77eb0e48d227694.png](http://cdn.lifemini.cn/dbblog/20201227/fcec4328a4294836b6d60223c1d6ce37.png)



### 中控机操作部署机建用户

执行以下命令，依据输入***部署目标机器***的 root 用户密码；
本例新增节点IP为192.168.1.44；



```
[tidb@tidb01-41 tidb-ansible]$ vi hosts.ini 
[tidb@tidb01-41 tidb-ansible]$ cat hosts.ini 
[servers]
192.168.1.44


[all:vars]
username = tidb
ntp_server = cn.pool.ntp.org



[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini create_users.yml -u root -k
SSH password: 

PLAY [all] ***************************************************************************************************************

Congrats! All goes well. :-)

```

### 中控机操作部署机配置ntp服务

***注意：生产上应该指向自己的ntp服务器，本次测试采用了公网公用的ntp服务不稳定。***

```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b

PLAY [all] ***************************************************************************************************************

......
......

Congrats! All goes well. :-)
```




### 中控及操作部署机设置CPU模式


调整CPU模式，如果同本文出现一样的报错，说明此版本的操作系统不支持CPU模式修改，可直接跳过。

```
[tidb@tidb01-41 tidb-ansible]$ ansible -i hosts.ini all -m shell -a "cpupower frequency-set --governor performance" -u tidb -b
192.168.1.44 | FAILED | rc=237 >>
Setting cpu: 0
Error setting new values. Common errors:
- Do you have proper administration rights? (super-user?)
- Is the governor you requested available and modprobed?
- Trying to set an invalid policy?
- Trying to set a specific frequency, but userspace governor is not available,
   for example because of hardware which cannot be set to a specific frequency
   or because the userspace governor isn't loaded?non-zero return code

```



### 执行bootstrap.yml生成模板


```

[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44

PLAY [initializing deployment target] ************************************************************************************

......
......
......

Congrats! All goes well. :-)
```

### 执行deploy.yml开始部署



```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44

PLAY [initializing deployment target] ************************************************************************************
skipping: no hosts matched

.....
.....

Congrats! All goes well. :-)
```


### 节点软件部署目录验证
```
[root@tidb04-44 ~]# cd /data/tidb/deploy/
[root@tidb04-44 deploy]# ll
total 0
drwxr-xr-x.  2 tidb tidb   6 Dec 27 01:18 backup
drwxr-xr-x.  2 tidb tidb  25 Dec 27 01:18 bin
drwxr-xr-x.  2 tidb tidb  23 Dec 27 01:18 conf
drwxr-xr-x.  2 tidb tidb   6 Dec 27 01:18 log
drwxr-xr-x.  2 tidb tidb  66 Dec 27 01:18 scripts
drwxrwxr-x. 13 tidb tidb 211 Sep 16  2018 spark

```

### 执行start.yml开启tidb服务

```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook start.yml -l 192.168.1.44

PLAY [check config locally] **********************************************************************************************
skipping: no hosts matched

......
......

Congrats! All goes well. :-)
```


### TiDB节点登陆验证

登陆验证成功

```
[tidb@tidb01-41 tidb-ansible]$ mysql -u root -h 192.168.1.44 -P 4000
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 2
Server version: 5.7.25-TiDB-v3.0.1 MySQL Community Server (Apache License 2.0)

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]> 
```


### 更新普罗米修斯

普罗米修斯是以主动pull的方式，从相应节点拉去所需要的信息；
因此，如果不手动更新，普罗米修斯便不会手动去拉取相应信息，无法达到监控的目的。


更新普罗米修斯前：

![98796cd631809c0bb316b105822930c.png](http://cdn.lifemini.cn/dbblog/20201227/46d3e18a3fee4a5c815b5dca2aae49e6.png)

普罗米修斯是通过pull的方式去新的tidb节点拉取的。

```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus

PLAY [check config locally] **********************************************************************************************

......
......


PLAY RECAP ***************************************************************************************************************
192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   
192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   
192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   
192.168.1.44               : ok=3    changed=0    unreachable=0    failed=0   
localhost                  : ok=7    changed=4    unreachable=0    failed=0   

Congrats! All goes well. :-)

```

更新普罗米修斯后：

![0d15b132201b1d48c858b674ea2b923.png](http://cdn.lifemini.cn/dbblog/20201227/486672e3306b41edb86b698d36d786be.png)


可以看到节点已经更新完毕。

## 缩容 TiDB 组件  


### 中控机操作目标机停用TiDB服务
```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook stop.yml -l 192.168.1.44

PLAY [check config locally] **********************************************************************************************
skipping: no hosts matched

......
......

Congrats! All goes well. :-)

```



### 登陆验证TiDB服务关闭


```
[tidb@tidb01-41 tidb-ansible]$ mysql -u root -h 192.168.1.44 -P 4000
ERROR 2003 (HY000): Can't connect to MySQL server on '192.168.1.44' (111)

```



### 中控机从inventory.ini移除IP


![99c7436e809d9c19fd042b08a6f1eb3.png](http://cdn.lifemini.cn/dbblog/20201227/b99b0347cb5d4e4ebb0097f9b8345874.png)

node_exporter and blackbox_exporter servers部分的监控IP信息同理也要移除。

```
# node_exporter and blackbox_exporter servers
[monitored_servers]
192.168.1.41
192.168.1.42
192.168.1.43

```



### 更新普哦米修斯



```
[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini 
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus

PLAY [check config locally] **********************************************************************************************

.....
.....


PLAY RECAP ***************************************************************************************************************
192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   
192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   
192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   
localhost                  : ok=7    changed=4    unreachable=0    failed=0   

Congrats! All goes well. :-)
```



红色部分需要一段时间才能消失，是整个集群还没有反映过来；
但是可以看到，TiDB的实例数量已经降到了2。

![1dc88c18a7de3dcafe8c757f993eda2.png](http://cdn.lifemini.cn/dbblog/20201227/dc89babef59f4262a0ff7b12b18ab45b.png)




## 扩容 TiKV 组件 




### 配置inventory.ini的TiKV部分

```
[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini
```
使用上述命令，在tikv_servers和monitored_servers中分别追加新部署节点的IP地址；

![5132bd5af713ee6e76bf91a87f58d87.png](http://cdn.lifemini.cn/dbblog/20201227/c45b87c46cc143f8a0def8b154e35c6c.png)


![dea88cbf26d02fa12d699d69bf343c8.png](http://cdn.lifemini.cn/dbblog/20201227/15323cdc7b4a49c2a7b30532829c1c83.png)



### 中控机操作部署机建用户

执行以下命令，依据输入***部署目标机器***的 root 用户密码；
本例新增节点IP为192.168.1.44；



```
[tidb@tidb01-41 tidb-ansible]$ vi hosts.ini 
[tidb@tidb01-41 tidb-ansible]$ cat hosts.ini 
[servers]
192.168.1.44


[all:vars]
username = tidb
ntp_server = cn.pool.ntp.org



[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini create_users.yml -u root -k
SSH password: 

PLAY [all] ***************************************************************************************************************

......
......

Congrats! All goes well. :-)
```

### 中控机操作部署机配置ntp服务

***注意：生产上应该指向自己的ntp服务器，本次测试采用了公网公用的ntp服务不稳定。***

```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook -i hosts.ini deploy_ntp.yml -u tidb -b

PLAY [all] ***************************************************************************************************************

......
......

Congrats! All goes well. :-)
```




### 中控及操作部署机设置CPU模式


调整CPU模式，如果同本文出现一样的报错，说明此版本的操作系统不支持CPU模式修改，可直接跳过。

```
[tidb@tidb01-41 tidb-ansible]$ ansible -i hosts.ini all -m shell -a "cpupower frequency-set --governor performance" -u tidb -b
192.168.1.44 | FAILED | rc=237 >>
Setting cpu: 0
Error setting new values. Common errors:
- Do you have proper administration rights? (super-user?)
- Is the governor you requested available and modprobed?
- Trying to set an invalid policy?
- Trying to set a specific frequency, but userspace governor is not available,
   for example because of hardware which cannot be set to a specific frequency
   or because the userspace governor isn't loaded?non-zero return code

```


### 执行bootstrap.yml创建模板
```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook bootstrap.yml -l 192.168.1.44

PLAY [initializing deployment target] ************************************************************************************
skipping: no hosts matched

......
......

Congrats! All goes well. :-)
```



### 执行start.yml启动tikv服务

```
Congrats! All goes well. :-)
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook start.yml -l 192.168.1.44

PLAY [check config locally] **********************************************************************************************
skipping: no hosts matched

......
......

Congrats! All goes well. :-)
```

### 执行rolling-update.yml滚动更新

```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus

PLAY [check config locally] **********************************************************************************************

......
......

PLAY RECAP ***************************************************************************************************************
192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   
192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   
192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   
192.168.1.44               : ok=3    changed=0    unreachable=0    failed=0   
localhost                  : ok=7    changed=4    unreachable=0    failed=0   

Congrats! All goes well. :-)

```


### pd-ctl命令行验证是否成功

可以使用stores show命令可以在pd-ctl交互式命令行中看到；
"count"：4 表示当前tikv有四个节点，说明tikv节点已经添加成功了。

```
[tidb@tidb01-41 tidb-ansible]$ resources/bin/pd-ctl -u http://192.168.1.41:2379 -i
» stores show
{
  "count": 4,
  "stores": [
    {
      "store": {
        "id": 2001,
        "address": "192.168.1.44:20160",
        "version": "3.0.1",
        "state_name": "Up"
      },
      "status": {
        "capacity": "17 GiB",
        "available": "15 GiB",
        "leader_count": 1,
        "leader_weight": 1,
        "leader_score": 1,
        "leader_size": 1,
        "region_count": 20,
        "region_weight": 1,
        "region_score": 20,
        "region_size": 20,
        "start_ts": "2020-12-27T01:53:06-05:00",
        "last_heartbeat_ts": "2020-12-27T01:59:36.260710913-05:00",
        "uptime": "6m30.260710913s"
      }
    },
    {
      "store": {
        "id": 1,
        "address": "192.168.1.41:20160",
        "version": "3.0.1",
        "state_name": "Up"
      },
      "status": {
        "capacity": "17 GiB",
        "available": "3.4 GiB",
        "leader_weight": 1,
        "region_weight": 1,
        "region_score": 1073738348.2304688,
        "start_ts": "2020-12-27T01:02:52-05:00",
        "last_heartbeat_ts": "2020-12-27T01:59:34.041233812-05:00",
        "uptime": "56m42.041233812s"
      }
    },
    {
      "store": {
        "id": 4,
        "address": "192.168.1.43:20160",
        "version": "3.0.1",
        "state_name": "Up"
      },
      "status": {
        "capacity": "17 GiB",
        "available": "14 GiB",
        "leader_count": 9,
        "leader_weight": 1,
        "leader_score": 9,
        "leader_size": 9,
        "region_count": 20,
        "region_weight": 1,
        "region_score": 20,
        "region_size": 20,
        "start_ts": "2020-12-27T01:01:12-05:00",
        "last_heartbeat_ts": "2020-12-27T01:59:32.975729011-05:00",
        "uptime": "58m20.975729011s"
      }
    },
    {
      "store": {
        "id": 5,
        "address": "192.168.1.42:20160",
        "version": "3.0.1",
        "state_name": "Up"
      },
      "status": {
        "capacity": "17 GiB",
        "available": "13 GiB",
        "leader_count": 10,
        "leader_weight": 1,
        "leader_score": 10,
        "leader_size": 10,
        "region_count": 20,
        "region_weight": 1,
        "region_score": 20,
        "region_size": 20,
        "start_ts": "2020-12-27T01:01:12-05:00",
        "last_heartbeat_ts": "2020-12-27T01:59:33.014833325-05:00",
        "uptime": "58m21.014833325s"
      }
    }
  ]
}

» exit
[tidb@tidb01-41 tidb-ansible]$ 

```


更新普罗米修斯后：


使用普罗米修斯的Grafana图形化监控界面也可以看到当前的tikv集群也已经加入新节点成功了。

![ea85764f4fe314d64f8295232245eeb.png](http://cdn.lifemini.cn/dbblog/20201227/2b15553374e54489b3b3f12707d5d264.png)




## 缩容 TiKV 组件  



### pd 删除 TiKV 节点

首先，登录pd-ctl交互式命令行，在PD集群中声明将该TiKV节点踢出TiKV集群；
而后，PD集群会将存在与被提出集群节点上的Region调度到其他机器上；
但应在命令行上为Offline状态，注意此时的offline状态并非是已调度完毕状态，而是正在调度状态；
真正的调度完成状态为tombstone（墓碑）状体，反应到命令上为该id消失。

```
[tidb@tidb01-41 tidb-ansible]$ resources/bin/pd-ctl -u http://192.168.1.41:2379 -i
» store delete 2001
Success!
» stores show
{
  "count": 4,
  "stores": [
    {
      "store": {
        "id": 1,
        "address": "192.168.1.41:20160",
        "version": "3.0.1",
        "state_name": "Up"
      },
      "status": {
        "capacity": "17 GiB",
        "available": "3.4 GiB",
        "leader_weight": 1,
        "region_weight": 1,
        "region_score": 1073738348.6953125,
        "start_ts": "2020-12-27T01:02:52-05:00",
        "last_heartbeat_ts": "2020-12-27T02:01:44.059741115-05:00",
        "uptime": "58m52.059741115s"
      }
    },
    {
      "store": {
        "id": 4,
        "address": "192.168.1.43:20160",
        "version": "3.0.1",
        "state_name": "Up"
      },
      "status": {
        "capacity": "17 GiB",
        "available": "14 GiB",
        "leader_count": 9,
        "leader_weight": 1,
        "leader_score": 9,
        "leader_size": 9,
        "region_count": 20,
        "region_weight": 1,
        "region_score": 20,
        "region_size": 20,
        "start_ts": "2020-12-27T01:01:12-05:00",
        "last_heartbeat_ts": "2020-12-27T02:01:42.99596895-05:00",
        "uptime": "1h0m30.99596895s"
      }
    },
    {
      "store": {
        "id": 5,
        "address": "192.168.1.42:20160",
        "version": "3.0.1",
        "state_name": "Up"
      },
      "status": {
        "capacity": "17 GiB",
        "available": "13 GiB",
        "leader_count": 10,
        "leader_weight": 1,
        "leader_score": 10,
        "leader_size": 10,
        "region_count": 20,
        "region_weight": 1,
        "region_score": 20,
        "region_size": 20,
        "start_ts": "2020-12-27T01:01:12-05:00",
        "last_heartbeat_ts": "2020-12-27T02:01:43.033315794-05:00",
        "uptime": "1h0m31.033315794s"
      }
    },
    {
      "store": {
        "id": 2001,
        "address": "192.168.1.44:20160",
        "state": 1,
        "version": "3.0.1",
        "state_name": "Offline"
      },
      "status": {
        "capacity": "17 GiB",
        "available": "15 GiB",
        "leader_count": 1,
        "leader_weight": 1,
        "leader_score": 1,
        "leader_size": 1,
        "region_count": 20,
        "region_weight": 1,
        "region_score": 20,
        "region_size": 20,
        "start_ts": "2020-12-27T01:53:06-05:00",
        "last_heartbeat_ts": "2020-12-27T02:01:46.276789545-05:00",
        "uptime": "8m40.276789545s"
      }
    }
  ]
}

» 

```







### 执行stop.yml停止节点tikv服务

等待offline之后,执行stop.yml停止节点tikv服务；

```
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook stop.yml -l 192.168.1.44

PLAY [check config locally] *********************************************************************************************************************************
skipping: no hosts matched

......
......

Congrats! All goes well. :-)
```



### 从inventory.ini中移除tikv节点IP

如下图所示，将框选出IP移除该文件；

![5b9b77a5bb7f53af382a1459ab2b0fb.png](http://cdn.lifemini.cn/dbblog/20201227/be8f5aa1d45b4107a3a32ba367b226e6.png)


![f27369a63cad296c22e8a014c68d0b7.png](http://cdn.lifemini.cn/dbblog/20201227/52da60141a0a45f8afd9872ef198ec4b.png)

### 滚动更新普罗米修斯



```

[tidb@tidb01-41 tidb-ansible]$ vi inventory.ini 
[tidb@tidb01-41 tidb-ansible]$ ansible-playbook rolling_update_monitor.yml --tags=prometheus

PLAY [check config locally] *********************************************************************************************************************************


.....
.....

PLAY RECAP **************************************************************************************************************************************************
192.168.1.41               : ok=3    changed=0    unreachable=0    failed=0   
192.168.1.42               : ok=25   changed=8    unreachable=0    failed=0   
192.168.1.43               : ok=3    changed=0    unreachable=0    failed=0   
localhost                  : ok=7    changed=4    unreachable=0    failed=0   

Congrats! All goes well. :-)
```



### 普罗米修斯检查

![84f476fc743f2cf8de27d5b2233c761.png](http://cdn.lifemini.cn/dbblog/20201227/13103cdaa9ef4c49afb1d89d50a334be.png)


刚刚更新完毕，集群还需要一定的时间反应；
下图可以看出，红色部分已经消失。

![09c46c43533324e9562450d4224e2c4.png](http://cdn.lifemini.cn/dbblog/20201227/f83b5cb124a0412d8c32df717c55ed38.png)















