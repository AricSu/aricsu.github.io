# Oracle 11g RAC 部署搭建

> [DBNEST -- Bilibili RAC 基础搭建视频地址](https://www.bilibili.com/video/BV1ZT4y157NN?from=search&seid=17237800447886927935&spm_id_from=333.337.0.0)

<iframe src="//player.bilibili.com/player.html?aid=926769884&bvid=BV1ZT4y157NN&cid=228088873&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" height="560" width="780"> </iframe>

| HOSTNAME | 公网IP | 主机名 | 私网IP | VIP | SCANIP |
| - | - | - | - | - | - |
| node1 | 192.168.174.11 | Prod1 | 10.10.10.1 | 192.168.174.111 | 192.168.174.24
| node2 | 192.168.174.12 | Prod2 | 10.10.10.2 | 192.168.174.121 | 192.168.174.24

## 一、创建虚拟机及搭建操作系统

### 1.1 创建虚拟机

虚拟机的创建 需要创建两个虚拟机配置相同取不同的名字来区分。
打开vmware点击创建新的虚拟机。

![01](./Oracle-RAC/01.png)  

![02](./Oracle-RAC/02.png)

![03](./Oracle-RAC/03.png)

选择redhat 6 版本64位  

![04](./Oracle-RAC/04.png)

此处最好在windows上创建好一个目录来放集群方便区分  

![05](./Oracle-RAC/05.png)  

![06](./Oracle-RAC/06.png)  

![07](./Oracle-RAC/07.png)  

![08](./Oracle-RAC/08.png)  

![09](./Oracle-RAC/09.png)  

![10](./Oracle-RAC/10.png)  

![11](./Oracle-RAC/11.png)  

![12](./Oracle-RAC/12.png)  

![13](./Oracle-RAC/13.png)  

![14](./Oracle-RAC/14.png)  

![15](./Oracle-RAC/15.png)  

![16](./Oracle-RAC/16.png)  

![17](./Oracle-RAC/17.png)  

![18](./Oracle-RAC/18.png)  

![19](./Oracle-RAC/19.png)  

![20](./Oracle-RAC/20.png)  

![21](./Oracle-RAC/21.png)  

![22](./Oracle-RAC/22.png)  

![23](./Oracle-RAC/23.png)  

![24](./Oracle-RAC/24.png)  

![25](./Oracle-RAC/25.png)  

![26](./Oracle-RAC/26.png)  

![27](./Oracle-RAC/27.png)  

![28](./Oracle-RAC/28.png)  

![29](./Oracle-RAC/29.png)  

![30](./Oracle-RAC/30.png)

![31](./Oracle-RAC/31.png)  

![32](./Oracle-RAC/32.png)

![33](./Oracle-RAC/33.png)  

![34](./Oracle-RAC/34.png)

### 1.2 配置虚拟机网卡

点击虚拟网络编辑器，准备添加网卡；

![35](./Oracle-RAC/35.png)

点击更改设置；
![36](./Oracle-RAC/36.png)

点击添加网络，添加虚拟网卡；
![37](./Oracle-RAC/37.png)  

点击确定；
![38](./Oracle-RAC/38.png)  

修改子网IP至规划的公网地址。
按照上述操作，创建内网网卡，并修改IP我地址为10.10.10.1；
![39](./Oracle-RAC/39.png)  

点击vmware的编辑虚拟机设置  
![40](./Oracle-RAC/40.png)  

选中网络适配器点击添加  
![41](./Oracle-RAC/41.png)  

选择网络适配器点击完成即可完成添加  
![42](./Oracle-RAC/42.png)  

新添加的网卡选择为桥接模式点击确定保存更改  
![43](./Oracle-RAC/43.png)  

### 1.3 创建共享磁盘

进入windows的cmd命令行窗口到安装VMware软件的目录执行如下命令创建共享磁盘，就是两台机器共用的磁盘所以在另一台虚机上无需再次创建五个。
创建的磁盘最好单独放到一个目录中方便后续的配置

```
cd /d D:\VMware15
vmware-vdiskmanager.exe -c -s 2Gb -a lsilogic -t 2 "D:\JanRAC\sharedisk\OCR01.vmdk"
vmware-vdiskmanager.exe -c -s 2Gb -a lsilogic -t 2 "D:\JanRAC\sharedisk\OCR02.vmdk"
vmware-vdiskmanager.exe -c -s 2Gb -a lsilogic -t 2 "D:\JanRAC\sharedisk\OCR03.vmdk"
vmware-vdiskmanager.exe -c -s 15Gb -a lsilogic -t 2 "D:\JanRAC\sharedisk\DATA1.vmdk"
vmware-vdiskmanager.exe -c -s 5Gb -a lsilogic -t 2 "D:\JanRAC\sharedisk\ARCH.vmdk"
```

磁盘创建完成后再次进入VMware点击编辑点击添加
![44](./Oracle-RAC/44.png)  

选择硬盘
![45](./Oracle-RAC/45.png)  
![46](./Oracle-RAC/46.png)  

选择使用现有的磁盘
![47](./Oracle-RAC/47.png)  

进入刚才建立的磁盘目录中选择如下图所示的盘（不要选flat结尾的）
![48](./Oracle-RAC/48.png)  
![49](./Oracle-RAC/49.png)  
![50](./Oracle-RAC/50.png)  
![51](./Oracle-RAC/51.png)  
![52](./Oracle-RAC/52.png)  

按照同样的方法把五个盘都加到上面。
全部完成后点击确认使其生效

![53](./Oracle-RAC/53.png)  
![54](./Oracle-RAC/54.png)  

找到两台虚拟机的配置文件用记事本模式打开它加入两行参数。

将下面配置粘贴至VMX文件中，两个节点均操作。

```
disk.locking="FALSE"
disk.EnableUUID = "TRUE" 
```

### 1.4 搭建linux操作系统

点击虚拟机设置
![55](./Oracle-RAC/55.png)

选择安装光盘后点击确认  
![56](./Oracle-RAC/56.png)  

点击开启次虚拟机
![57](./Oracle-RAC/57.png)  

点击回车
![58](./Oracle-RAC/58.png)  
![59](./Oracle-RAC/59.png)  
![60](./Oracle-RAC/60.png)  
![61](./Oracle-RAC/61.png)  
![62](./Oracle-RAC/62.png)  
![63](./Oracle-RAC/63.png)  

选择yes
![64](./Oracle-RAC/64.png)  

主机名字
![65](./Oracle-RAC/65.png)  

时区选择上海
![66](./Oracle-RAC/66.png)  

设置密码
![67](./Oracle-RAC/67.png)  

磁盘分区
![68](./Oracle-RAC/68.png)  

点击create
![69](./Oracle-RAC/69.png)  

注意只选择sda盘进行分区其他的盘勾掉，首先加一个/boot分区大小200点击ok
![70](./Oracle-RAC/70.png)  

注意只选择sda盘进行分区其他的盘勾掉，加一个swap分区大小2G
![71](./Oracle-RAC/71.png)  

注意只选择sda盘进行分区其他的盘勾掉，根分区大小5G
![72](./Oracle-RAC/72.png)  

注意只选择sda盘进行分区其他的盘勾掉，/u01分区将剩下所有空间全部分配给他

![73](./Oracle-RAC/73.png)  
![74](./Oracle-RAC/74.png)  
![75](./Oracle-RAC/75.png)  
![76](./Oracle-RAC/76.png)  

点击reboot完成操作系统的安装重启后进入操作系统界面
![77](./Oracle-RAC/78.png)  

## 二、操作系统配置

### 2.1 检查操作系统设置

两个虚机根据自己的网卡信息配置网卡

```shell
vi /etc/sysconfig/network-script/ifcfg-eth0
DEVICE=eth0
#HWADDR=00:0C:29:93:4D:A6
TYPE=Ethernet
#UUID=58b202c7-754b-4cea-aedc-705e370c90b8
ONBOOT=yes
NM_CONTROLLED=yes
BOOTPROTO=static
IPADDR=192.168.174.11
NETMASK=255.255.255.0

vi /etc/sysconfig/network-script/ifcfg-eth1
DEVICE=eth1
#HWADDR=00:0C:29:93:4D:B0
TYPE=Ethernet
#UUID=5050a9fd-a783-4ddc-bc31-59cbe7be5d1d
ONBOOT=yes
NM_CONTROLLED=yes
BOOTPROTO=static
IPADDR=10.10.10.1
NETMASK=255.255.255.0
```

### 2.2 检查系统库依赖

配置yum源，并安装依赖包

```shell
vi /etc/yum.repos.d/iso.repo
[iso]
name=iso
baseurl=file:///mnt
enabled=1
gpgcheck=0

mount /dev/cdrom /mnt
yum -y install binutils compat-libstdc++-33 glibc ksh libaio libgcc libstdc++ make compat-libcap1 gcc gcc-c++ glibc-devel libaio-devel libstdc++-devel sysstat
```

### 2.3 操作系统内核参数调整

```shell
vi /etc/sysctl.conf
kernel.shmall = xxx  #填入命令echo "`cat /proc/meminfo | grep "MemTotal" | awk '{print $2}'` / (`getconf PAGESIZE` / 1024)" | bc 的运行结果
kernel.shmmax = xxx  #填入命令echo "`cat /proc/meminfo | grep "MemTotal" | awk '{print $2}'` * 1024 * 0.8" | bc  | sed 's#\..*$##' 的运行结果

kernel.shmmni = 4096 
kernel.sem = 250 32000 100 128 

fs.file-max = 6815744
fs.aio-max-nr = 1048576

net.ipv4.ip_local_port_range = 9000 65500 
net.core.rmem_default = 262144 
net.core.rmem_max = 4194304 
net.core.wmem_default = 262144 
net.core.wmem_max = 104857

vm.swappiness = 0
vm.dirty_background_ratio = 3
vm.dirty_ratio = 80
vm.dirty_expire_centisecs = 500
vm.dirty_writeback_centisecs = 100

sysctl -p   使参数生效
```

### 2.4 关闭 SElinux、防火墙

根据安装规范，此两项内容应该已经被关闭
使用如下命令关闭：

```shell
sed -i 's/enforcing/disabled/g' /etc/selinux/config
setenforce 0

service iptables stop
chkconfig iptables off

service NetworkManager stop
chkconfig NetworkManager off
```

### 2.5 IP地址分配

#### 2.5.1 主机文件配置

1. 每个节点的公网网卡名，私网网卡名应保持一致，例如：在节点1公网网卡名为eth0，私网网卡名eth1，则节点2的公2. 网网卡名也应为eth0，私网网卡名应为eth1。
注意：各个节点的同名网卡的配置文件“/etc/sysconfig/network-scripts/ifcfg-网卡名”也应相同！

vip/priv/scan命名规则如下：

```shell
<hostname>-vip，代表VIP主机名；
<hostname>-priv，代表priv主机名；
<hostname>-scan，代表scan主机名；
```

针对IP地址分配如下，需要在/etc/hosts文件中增加以下IP地址解析：

```shell
#PUBLIC
192.168.174.11    rac1
192.168.174.12    rac2
 
#PRIVATE
10.10.10.1    rac1-priv 
10.10.10.2    rac2-priv   

#VIP
192.168.174.111   rac1-vip
192.168.174.121   rac2-vip
192.168.174.24    rac-scan
```

#### 2.5.2 Ip地址分配应遵循如下原则

（1） Public ip,scan ip, vip 必须在相同网段
（2） private ip 与上述ip 不能在相同网段；

## 三、用户环境及目录配置

### 3.1 用户相关设置

创建用户和组

```shell
groupadd -g 1000 oinstall
groupadd -g 1001 dba
groupadd -g 1002 oper
groupadd -g 1003 asmadmin
groupadd -g 1004 asmdba
groupadd -g 1005 asmoper
useradd -u 1001 -g oinstall -G dba,asmadmin,asmdba,asmoper grid
useradd -u 1002 -g oinstall -G dba,oper,asmadmin,asmdba oracle
echo grid |passwd --stdin grid
echo grid |passwd --stdin oracle
```

创建目录

```shell
mkdir -p /u01/app/oraInventory
chown -R grid:oinstall /u01/app/oraInventory
chmod -R 775 /u01/app/oraInventory

mkdir -p /u01/app/grid
chown -R grid:oinstall /u01/app/grid
chmod -R 775 /u01/app/grid

mkdir -p /u01/app/11.2.0.4/grid
chown -R grid:oinstall /u01/app/11.2.0.4/grid
chmod -R 775 /u01/app/11.2.0.4/grid

mkdir -p /u01/app/oracle
chown -R oracle:oinstall /u01/app/oracle
chmod -R 775 /u01/app/oracle

mkdir -p /u01/app/oracle/product/11.2.0.4/db_1
chown -R oracle:oinstall /u01/app/oracle/product/11.2.0.4/db_1
chmod -R 775 /u01/app/oracle/product/11.2.0.4/db_1
```

修改系统资源限制

```shell
vi /etc/security/limits.conf
grid soft nproc 2047    
grid hard nproc 16384   
grid soft nofile 1024   
grid hard nofile 65536  
oracle soft nproc 2047  
oracle hard nproc 16384 
oracle soft nofile 1024 
oracle hard nofile 65536
```

修改/etc/profile，添加如下配置

```shell
vi /etc/profile
if [ \$USER = "oracle" ] || [ \$USER = "grid" ]; then
 if [ \$SHELL = "/bin/ksh" ]; then
    ulimit -p 16384
    ulimit -n 65536
 else
    ulimit -u 16384 -n 65536
 fi
umask 022
fi
```

修改/etc/csh.log，添加如下配置

```shell
vi /etc/csh.login
if ( \$USER = "oracle" || \$USER = "grid" ) then
limit maxproc 16384
limit descriptors 65536
endif
```

修改grid用户环境变量

```shell
su - grid
vi .bash_profile
export ORACLE_BASE=/u01/app/grid
export ORACLE_SID=+ASM1  ---节点2 为+ASM2
export ORACLE_HOME=/u01/app/11.2.0.4/grid
export PATH=$ORACLE_HOME/bin:$ORACLE_HOME/OPatch:$PATH
NAME=`hostname`
PS1="[$NAME:$LOGNAME]:\${PWD}>"  
umask 022
```

修改oracle环境变量

```shell
su - oracle
vi .bash_profile
export ORACLE_BASE=/u01/app/oracle
export ORACLE_SID=orcl1  ---节点2 为orcl2
export ORACLE_HOME=$ORACLE_BASE/product/11.2.0.4/db_1
export PATH=$ORACLE_HOME/bin:$ORACLE_HOME/OPatch:$PATH
NAME=`hostname`
PS1="[$NAME:$LOGNAME]:\${PWD}>" 
umask 022
```

### 3.2 解压 11.2.0.4 安装包

上传安装介质并解压缩，共三个压缩包，1,2解压出来为database，3解压出来为grid

```shell
p13390677_112040_Linux-x86-64_1of7.zip
p13390677_112040_Linux-x86-64_2of7.zip
p13390677_112040_Linux-x86-64_3of7.zip
```

### 3.3 设置 UDEV 规则

绑定前需要查看下虚机的配置文件的disk.EnableUUID参数需要是TRUE，如果不是需要关闭操作系统血钙参数后再重启

修改文件/etc/udev/rules.d/99-oracle-asmdevices.rules，运行一下脚本：

```shell
>/etc/udev/rules.d/99-oracle-asmdevices.rules
export DISK=0
for i in b c d e f 
do
DISK=$(expr $DISK + 1)
UUID=`scsi_id -gud /dev/sd$i`
echo "KERNEL==\"sd*\", SUBSYSTEM==\"block\", PROGRAM==\"/sbin/scsi_id --whitelisted --replace-whitespace --device=/dev/\$name\",  RESULT==\"$UUID\", NAME=\"asm-disk$DISK\",  OWNER=\"grid\",  GROUP=\"asmadmin\", MODE=\"0660\" " >>/etc/udev/rules.d/99-oracle-asmdevices.rules
done
```

重启UDEV以使上述设置生效：

```shell
/sbin/udevadm control --reload-rules
/sbin/start_udev
```

## 四、GRID 和 DB 软件安装

1. 用SecureCRT，对应服务器连接属性中勾选Forward X11 Packets，即可实现在不设置DISPLAY选项，对应服务器ping不通本机的情形下依然可以正常显示Oracle安装界面。
2. 但在执行runInstaller时最后要以对应的grid/oracle用户登录，不能用root用户ssh登录后再su到grid/oracle用户，否则Oracle安装界面有可能显示不出来。

### 4.1 GRID 软件安装

grid用户登录第一个节点主机，然后执行runInstaller命令安装Grid Infrastructure,具体安装步骤如下：执行./runInstaller安装：

```shell
[grid@epayrac1 ~]$ cd /home/oracle_install/grid
[root@tim1 ~]# dd if=/dev/zero of=/u01/swap1 bs=1M count=2048
2）创建一个swap类型文件,
[root@epayrac1 ~]# mkswap /u01/swap1
3）将swpf1生成swap文件
[root@epayrac1 ~]# swapon /u01/swap1
查看一下，swap1起作用了
[root@epayrac1 ~]# free -m   
4）实现开机后自动使用新添的swap1分区
[root@epayrac1 ~]# vi /etc/fstab
添加swap行
/u01/swap1       swap       swap      defaults     0 0
5）修改tmpfs行
tmpfs            /dev/shm   tmpfs   defaults,size=2G    0 0
6）tmpfs重置一下，使其当下有效
[root@epayrac1 ~]# mount -o remount /dev/shm
[grid@epayrac1 grid]$ ./runInstaller
Starting Oracle Universal Installer...

Checking Temp space: must be greater than 120 MB.   Actual 3996 MB    Passed
Checking swap space: must be greater than 150 MB.   Actual 32145 MB    Passed
Checking monitor: must be configured to display at least 256 colors.    Actual 16777216    Passed
Preparing to launch Oracle Universal Installer from /tmp/OraInstall2014-08-21_05-26-13PM. Please wait ...
```

执行runInstaller后出现如下安装界面：
选择“skip software updates”然后下一步：
![80](./Oracle-RAC/80.png)  

选择“Install and Configure Oracle Grid infrastructure for a Cluster”然后下一步：
![81](./Oracle-RAC/81.png)  

选择“Advanced Installation”，然后下一步:
![82](./Oracle-RAC/82.png)  
选择安装语言，默认为英语，直接点击下一步：
![83](./Oracle-RAC/83.png)  
输入Cluster Name为epayrac-cluster, SCAN Name为epayrac-scan，SCAN Port为1521，注意SCAN Name必须与/etc/hosts文件中设置的一致；另外，这里不配GNS，然后点击下一步：
![84](./Oracle-RAC/84.png)  
在随后出现的界面中单击“Add”按钮：
![85](./Oracle-RAC/85.png)  

配置ssh单击“SSH Connectivity”按钮：输入grid的密码后点击setup
![86](./Oracle-RAC/86.png)  
![87](./Oracle-RAC/87.png)  

完成ssh配置
![88](./Oracle-RAC/88.png)  
单击Test按钮，应该出现以下窗口，如果以下窗口不能出现，则说明SSH配置有问题，请退出安装程序，修改ssh配置，然后重新执行上述步骤：
单击“OK”按钮：
![89](./Oracle-RAC/89.png)  
单击“Next”按钮执行下一步：
![90](./Oracle-RAC/90.png)  
确认无问题后单击“Next”下一步：
选择“Oracle Automatic Storage Managemnet(Oracle ASM)”，然后单击“Next”按钮执行下一步:
![91](./Oracle-RAC/91.png)  
注意该窗口为指定用来保存ocr和voting disk的ASM DiskGroup，如果生产环境，DiskGroupName为SYSTEMDG并且Redundancy为Normal，然后选择3块2G的小盘；如果为非生产环境可以将OCR和DB共享一个磁盘组并且将Redundancy设置为External。如果在Add Disks项没有出现ASM磁盘，则可能是磁盘权限设置和属主有问题。
单击Change Discovery Path按钮设置ASM磁盘访问路径（这里设置真实磁盘访问路径，此处为多路径磁盘的访问路径/dev/asm*），然后单击“OK”：
![92](./Oracle-RAC/92.png)  
选择大小为2G的三块盘，然后单击“Next”按钮执行下一步：
![93](./Oracle-RAC/93.png)  
选择“Use same passwords for these accounts”然后然输入口令，然后单击“Next”按钮执行下一步：
![94](./Oracle-RAC/94.png)  
IPMI一般不设置，单击“Next”按钮进行下一步：
![95](./Oracle-RAC/95.png)  
使用缺省设置，直接单击“Next”按钮执行下一步：
![96](./Oracle-RAC/96.png)  
确认grid用户的ORACLE_BASE路径为/home/app/grid，ORACLE_HOME路径为/home/app/11.2.0.3/grid，确认无误后单击“Next”按钮执行下一步：
![97](./Oracle-RAC/97.png)  
确认Inventory Directory为/home/app/oraInventory，然后单击“Next”按钮执行下一步：
![98](./Oracle-RAC/98.png)  
接着出现如下安装前检查界面：
![99](./Oracle-RAC/99.png)  
接着出现如下检查结果界面：
![100](./Oracle-RAC/100.png)  
此处需要说明的是：
1）elfutils-libelf-devel-0.97和pdksh在RedHat 6里无需安装，可忽略；
2）resolv.conf为DNS解析的配置，可忽略；
3）Network Time Protocol(NTP)这一项，我们使用CTSSD，不配置NTP，可忽略；
4) ASM检查失败也可忽略。
除上述可忽略的几项外，如果还有其他的未满足项，则需要具体问题具体分析，待解决后再安装GRID。
因此可以选择“Ignore All”,然后单击“Next”按钮执行下一步：
![101](./Oracle-RAC/101.png)  
接着出现安装概要界面，确认无误后单击“Install”按钮进行软件安装：
![102](./Oracle-RAC/102.png)
如下是安装进度界面：
![103](./Oracle-RAC/103.png)
接着出现如下界面：
![104](./Oracle-RAC/104.png)
以root用户登陆系统，执行上面的脚本，顺序如下：
1） 在epayrac1上执行脚本1，在epayrac2上执行脚本1；
2） 在epayrac1上执行脚本2，在epayrac2上执行脚本2。

各个节点执行上述脚本情况如下：

```
[root@epayrac1 ~]# /home/app/oraInventory/orainstRoot.sh
Changing permissions of /home/app/oraInventory.
Adding read,write permissions for group.
Removing read,write,execute permissions for world.

Changing groupname of /home/app/oraInventory to oinstall.
The execution of the script is complete.

[root@epayrac2 ~]# /home/app/oraInventory/orainstRoot.sh
Changing permissions of /home/app/oraInventory.
Adding read,write permissions for group.
Removing read,write,execute permissions for world.

Changing groupname of /home/app/oraInventory to oinstall.
The execution of the script is complete.

[root@epayrac1 ~]# /home/app/11.2.0.3/grid/root.sh
Performing root user operation for Oracle 11g 

The following environment variables are set as:
    ORACLE_OWNER= grid
    ORACLE_HOME=  /home/app/11.2.0.3/grid

Enter the full pathname of the local bin directory: [/usr/local/bin]: 
   Copying dbhome to /usr/local/bin ...
   Copying oraenv to /usr/local/bin ...
   Copying coraenv to /usr/local/bin ...


Creating /etc/oratab file...
Entries will be added to the /etc/oratab file as needed by
Database Configuration Assistant when a database is created
Finished running generic part of root script.
Now product-specific root actions will be performed.
Using configuration parameter file: /home/app/11.2.0.3/grid/crs/install/crsconfig_params
Creating trace directory
User ignored Prerequisites during installation
OLR initialization - successful
  root wallet
  root wallet cert
  root cert export
  peer wallet
  profile reader wallet
  pa wallet
  peer wallet keys
  pa wallet keys
  peer cert request
  pa cert request
  peer cert
  pa cert
  peer root cert TP
  profile reader root cert TP
  pa root cert TP
  peer pa cert TP
  pa peer cert TP
  profile reader pa cert TP
  profile reader peer cert TP
  peer user cert
  pa user cert
Adding Clusterware entries to upstart
CRS-2672: Attempting to start 'ora.mdnsd' on 'epayrac1'
CRS-2676: Start of 'ora.mdnsd' on 'epayrac1' succeeded
CRS-2672: Attempting to start 'ora.gpnpd' on 'epayrac1'
CRS-2676: Start of 'ora.gpnpd' on 'epayrac1' succeeded
CRS-2672: Attempting to start 'ora.cssdmonitor' on 'epayrac1'
CRS-2672: Attempting to start 'ora.gipcd' on 'epayrac1'
CRS-2676: Start of 'ora.cssdmonitor' on 'epayrac1' succeeded
CRS-2676: Start of 'ora.gipcd' on 'epayrac1' succeeded
CRS-2672: Attempting to start 'ora.cssd' on 'epayrac1'
CRS-2672: Attempting to start 'ora.diskmon' on 'epayrac1'
CRS-2676: Start of 'ora.diskmon' on 'epayrac1' succeeded
CRS-2676: Start of 'ora.cssd' on 'epayrac1' succeeded

ASM created and started successfully.

Disk Group SYSTEMDG created successfully.

clscfg: -install mode specified
Successfully accumulated necessary OCR keys.
Creating OCR keys for user 'root', privgrp 'root'..
Operation successful.
CRS-4256: Updating the profile
Successful addition of voting disk 26c16c734fd64ffdbf102c26d4d5a4ed.
Successful addition of voting disk 7684d2a722754f19bf838c65ae52494b.
Successful addition of voting disk 59bade4e4cea4f0bbf77567c9c17cb12.
Successfully replaced voting disk group with +SYSTEMDG.
CRS-4256: Updating the profile
CRS-4266: Voting file(s) successfully replaced
##  STATE    File Universal Id                File Name Disk group
--  -----    -----------------                --------- ---------
 1. ONLINE   26c16c734fd64ffdbf102c26d4d5a4ed (/dev/mapper/asmocrvote1) [SYSTEMDG]
 2. ONLINE   7684d2a722754f19bf838c65ae52494b (/dev/mapper/asmocrvote2) [SYSTEMDG]
 3. ONLINE   59bade4e4cea4f0bbf77567c9c17cb12 (/dev/mapper/asmocrvote3) [SYSTEMDG]
Located 3 voting disk(s).
CRS-2672: Attempting to start 'ora.asm' on 'epayrac1'
CRS-2676: Start of 'ora.asm' on 'epayrac1' succeeded
CRS-2672: Attempting to start 'ora.SYSTEMDG.dg' on 'epayrac1'
CRS-2676: Start of 'ora.SYSTEMDG.dg' on 'epayrac1' succeeded
Preparing packages for installation...
cvuqdisk-1.0.9-1
Configure Oracle Grid Infrastructure for a Cluster ... succeeded

[root@epayrac2 ~]# /home/app/11.2.0.3/grid/root.sh
Performing root user operation for Oracle 11g 

The following environment variables are set as:
    ORACLE_OWNER= grid
    ORACLE_HOME=  /home/app/11.2.0.3/grid

Enter the full pathname of the local bin directory: [/usr/local/bin]: 
   Copying dbhome to /usr/local/bin ...
   Copying oraenv to /usr/local/bin ...
   Copying coraenv to /usr/local/bin ...


Creating /etc/oratab file...
Entries will be added to the /etc/oratab file as needed by
Database Configuration Assistant when a database is created
Finished running generic part of root script.
Now product-specific root actions will be performed.
Using configuration parameter file: /home/app/11.2.0.3/grid/crs/install/crsconfig_params
Creating trace directory
User ignored Prerequisites during installation
OLR initialization - successful
Adding Clusterware entries to upstart
CRS-4402: The CSS daemon was started in exclusive mode but found an active CSS daemon on node epayrac1, number 1, and is terminating
An active cluster was found during exclusive startup, restarting to join the cluster
Preparing packages for installation...
cvuqdisk-1.0.9-1
Configure Oracle Grid Infrastructure for a Cluster ... succeeded
```

上面的脚本执行成功后，单击”OK”按钮，自动执行几个配置操作后，出现如下窗口：

![105](./Oracle-RAC/105.png)
由于SCAN VIP主机名epayrac-scan没有在DNS注册，导致Oracle Cluster Verification Utility失败，可以忽略此错误。

单击“OK”按钮：
![106](./Oracle-RAC/106.png)

单击“Next”按钮继续：
![107](./Oracle-RAC/107.png)
单击“Yes”按钮：
![108](./Oracle-RAC/108.png)
单击“Close”按钮，至此Grid 11.2.0.3软件安装完毕。

### 4.2 DB 软件安装

以oracle用户登录第一个节点，然后执行runInstaller命令安装DB软件,具体安装步骤如下：执行./runInstaller安装：

```
[oracle@epayrac1 ~]$ cd /home/oracle_install/database

[oracle@epayrac1 database]$ ./runInstaller
Starting Oracle Universal Installer...

Checking Temp space: must be greater than 120 MB.   Actual 3994 MB    Passed
Checking swap space: must be greater than 150 MB.   Actual 32145 MB    Passed
Checking monitor: must be configured to display at least 256 colors.    Actual 16777216    Passed
Preparing to launch Oracle Universal Installer from /tmp/OraInstall2014-08-21_07-09-01PM. Please wait ...
```

执行runInstaller后出现如下安装界面：
取消“I wish to receive security updates via My Oracle Support”选项，然后单击“Next”按钮执行下一步：

![109](./Oracle-RAC/109.png)
单击“Yes”按钮:
![110](./Oracle-RAC/110.png)
选择“Skip software updates”选项，然后单击“Next”按钮执行下一步：
![111](./Oracle-RAC/111.png)
选择“Install database software only”选项，然后单击“Next”按钮执行下一步：
![112](./Oracle-RAC/112.png)
选择“Oracle Real Application Clusters database installation”选项，确保第二个节点epayrac2已被勾选:
![113](./Oracle-RAC/113.png)
单击SSH Connectivity按钮后，单击“setup”按钮，出现以下成功窗口：
![114](./Oracle-RAC/114.png)
单击“OK”按钮，返回后再单击“Next”按钮执行下一步：
![115](./Oracle-RAC/115.png)
单击“Next”按钮执行下一步：
![116](./Oracle-RAC/116.png)
选择“Enterprise Edition(4.5GB)”,单击“Next”按钮执行下一步：
![117](./Oracle-RAC/117.png)
确认目录正确无误后（Oracle用户的ORACLE_BASE路径是/home/app/oracle，Oracle用户ORACLE_HOME路径是/home/app/oracle/product/11.2.0.3/db_1）单击“Next”按钮执行下一步：
![118](./Oracle-RAC/118.png)
Database Operator组可不选，直接单击“Next”按钮执行下一步：
![119](./Oracle-RAC/119.png)
接着出现如下安装检查界面：
![120](./Oracle-RAC/120.png)
接着出现如下检查结果界面：
![121](./Oracle-RAC/121.png)
此处需要说明的是：
1）elfutils-libelf-devel-0.97和pdksh在RedHat 6里无需安装，可忽略；
2）resolv.conf为DNS解析的配置，可忽略；
3）Clock Synchronization这一项，我们使用CTSSD，不配置NTP，可忽略；
4) Single Client Access Name(SCAN)这一项，为没有配置DNS所致，可忽略；
除上述可忽略的几项外，如果还有其他的未满足项，则需要具体问题具体分析，待解决后再安装数据库软件。
因此可以选择“Ignore All”,然后单击“Next”按钮执行下一步：
![122](./Oracle-RAC/122.png)

单击“Install”按钮执行下一步：
![123](./Oracle-RAC/123.png)

如下是安装进度界面：
![124](./Oracle-RAC/124.png)

接着出现如下界面：
![125](./Oracle-RAC/125.png)
以root用户登陆系统，执行上面的脚本，顺序如下：
在epayrac1上执行脚本1，在epayrac2上执行脚本1；

节点1的执行情况：

```
[root@epayrac1 ~]# /home/app/oracle/product/11.2.0.3/db_1/root.sh
Performing root user operation for Oracle 11g 

The following environment variables are set as:
    ORACLE_OWNER= oracle
    ORACLE_HOME=  /home/app/oracle/product/11.2.0.3/db_1

Enter the full pathname of the local bin directory: [/usr/local/bin]: 
The contents of "dbhome" have not changed. No need to overwrite.
The contents of "oraenv" have not changed. No need to overwrite.
The contents of "coraenv" have not changed. No need to overwrite.

Entries will be added to the /etc/oratab file as needed by
Database Configuration Assistant when a database is created
Finished running generic part of root script.
Now product-specific root actions will be performed.
Finished product-specific root actions.
```

节点2的执行情况：

```
[root@epayrac2 ~]# /home/app/oracle/product/11.2.0.3/db_1/root.sh
Performing root user operation for Oracle 11g 

The following environment variables are set as:
    ORACLE_OWNER= oracle
    ORACLE_HOME=  /home/app/oracle/product/11.2.0.3/db_1

Enter the full pathname of the local bin directory: [/usr/local/bin]: 
The contents of "dbhome" have not changed. No need to overwrite.
The contents of "oraenv" have not changed. No need to overwrite.
The contents of "coraenv" have not changed. No need to overwrite.

Entries will be added to the /etc/oratab file as needed by
Database Configuration Assistant when a database is created
Finished running generic part of root script.
Now product-specific root actions will be performed.
Finished product-specific root actions.
```

上面的脚本执行成功后，单击”OK”按钮，出现如下界面：
![126](./Oracle-RAC/126.png)

单击“Close”按钮,Oracle database 11.2.0.3软件安装完毕。

### 4.3 创建 ASM 磁盘组

以grid用户登录节点1执行ASMCA创建DATADG和ARCHDG

```
[grid@epayrac1 ~]$ asmca
```

执行asmca后出现如下安装界面：

![127](./Oracle-RAC/127.png)
点击“Create”按钮，选择asmr1datadisk1，选择External Redundancy，创建磁盘组DATADG1：
 ![128](./Oracle-RAC/128.png)
点击“OK”按钮：
![129](./Oracle-RAC/129.png)

从如下结果中可以看到磁盘组DATADG已经成功创建：
![130](./Oracle-RAC/130.png)

点击“Create”按钮，选择asmr5datadisk1，创建磁盘组ARCHDG：
![131](./Oracle-RAC/131.png)

从如下结果中可以看到磁盘组FRADG已经成功创建：
![132](./Oracle-RAC/132.png)

### 4.4 建库

以oracle用户登录节点1执行DBCA建库
注意要修改相关设置，如字符集、归档模式、redo log大小、multiplex redo log设置等
[oracle@epayrac1 ~]$ dbca

执行dbca后出现如下安装界面：
![133](./Oracle-RAC/133.png)
![134](./Oracle-RAC/134.png)
![135](./Oracle-RAC/135.png)
![136](./Oracle-RAC/136.png)
![137](./Oracle-RAC/137.png)
![138](./Oracle-RAC/138.png)
![139](./Oracle-RAC/139.png)
![140](./Oracle-RAC/140.png)
![141](./Oracle-RAC/141.png)
![142](./Oracle-RAC/142.png)
![143](./Oracle-RAC/143.png)
![144](./Oracle-RAC/144.png)
![145](./Oracle-RAC/145.png)
![146](./Oracle-RAC/146.png)
![147](./Oracle-RAC/147.png)

## 五、常见问题解决

Red Hat Linux6.9安装RAC11.2.0.4.0，dbca建库配置ASM时报错：
Counld not connect to ASM due to following error,ora-12547:TNS:lost comact
![148](./Oracle-RAC/148.png)
解决办法：

```shell
[grid@liuqi1 oracle]$ cd $ORACLE_HOME/bin
[grid@liuqi1 bin]$ ll oracle
-rwxr-x--x 1 grid oinstall 203974257 Mar  9 20:42 oracle
[grid@liuqi1 bin]$ chmod 6751 oracle
[grid@liuqi1 bin]$ ll oracle
-rwsr-s--x 1 grid oinstall 203974257 Mar  9 20:42 oracle
[grid@liuqi1 bin]$
```

将$GRID_HOME/bin和$ORACLE_HOME/bin下的oracle都赋6751权限：

```shell
chmod 6751 $GRID_HOME/bin/oracle
chmod 6751 $ORACLE_HOME/bin/oracle
```
