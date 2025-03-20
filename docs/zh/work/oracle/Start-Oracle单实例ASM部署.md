# Oracle 11g单库ASM部署

> [DBNEST -- 旧版文档 “点击” 直接浏览或下载 PDF](./Oracle11g单实例ASM静默安装.pdf)

## 一、环境说明

| 参数名 | 参数值 |
| - | - |
| 服务器环境 | Red Hat Enterprise Linux Server release 6.9 (Santiago) |
| Oracle版本 | Oracle Database 11g Enterprise Edition Release 11.2.0.4.0 |
| grid软件版本 | 11g Enterprise Edition Release 11.2.0.4.0 |

## 二、建立数据库

### 2.1 虚拟机建立共享盘

```shell
[root@jandb ~]# fdisk -l

Disk /dev/sda: 8589 MB, 8589934592 bytes
255 heads, 63 sectors/track, 1044 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x00057041

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *           1          26      204800   83  Linux
Partition 1 does not end on cylinder boundary.
/dev/sda2              26         287     2097152   82  Linux swap / Solaris
Partition 2 does not end on cylinder boundary.
/dev/sda3             287        1045     6085632   83  Linux

Disk /dev/sdb: 10.7 GB, 10737418240 bytes
255 heads, 63 sectors/track, 1305 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x00000000

[root@jandb ~]# ls -al  /dev/sd*
brw-rw----. 1 root disk 8,  0 Nov  4 05:21 /dev/sda
brw-rw----. 1 root disk 8,  1 Nov  4 05:21 /dev/sda1
brw-rw----. 1 root disk 8,  2 Nov  4 05:21 /dev/sda2
brw-rw----. 1 root disk 8,  3 Nov  4 05:21 /dev/sda3
brw-rw----. 1 root disk 8, 16 Nov  4 05:21 /dev/sdb
[root@jandb ~]# fdisk /dev/sdb
[root@jandb ~]# fdisk -l

Disk /dev/sda: 8589 MB, 8589934592 bytes
255 heads, 63 sectors/track, 1044 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x00057041

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *           1          26      204800   83  Linux
Partition 1 does not end on cylinder boundary.
/dev/sda2              26         287     2097152   82  Linux swap / Solaris
Partition 2 does not end on cylinder boundary.
/dev/sda3             287        1045     6085632   83  Linux

Disk /dev/sdb: 10.7 GB, 10737418240 bytes
255 heads, 63 sectors/track, 1305 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0xf207b5b8

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1               1         654     5253223+  83  Linux
/dev/sdb2             655        1305     5229157+  83  Linux
```

### 2.2 创建组和用户

```shell
groupadd -g 1000 oinstall
groupadd -g 1001 dba
groupadd -g 1002 oper
groupadd -g 1003 asmadmin
groupadd -g 1004 asmdba
groupadd -g 1005 asmoper
useradd -u 2000 -g oinstall -G asmadmin,asmdba,asmoper,dba -d /home/grid grid
useradd -u 2001 -g oinstall -G asmdba,asmadmin,dba,oper -d /home/oracle oracle

passwd grid
passwd oracle
```

### 2.3 创建目录

```shell
mkdir -p /oracle/app/grid
mkdir -p /oracle/app/11.2.0/grid
chown -R grid:oinstall /oracle
mkdir -p /oracle/app/oracle
chown -R oracle:oinstall /oracle/app/oracle
chmod -R 775 /oracle
```

### 2.4 修改内核参数

首先注销掉配置文件最后6行内容，然后添加下面8行内容。

```shell
[root@jandb ~]# vim /etc/sysctl.conf
##################11g#############################
net.core.rmem_max=4194304
net.core.wmem_max=1048576
net.core.rmem_default=262144
net.core.wmem_default=262144
net.ipv4.ip_local_port_range =9000 65500
fs.file-max = 6815744
fs.aio-max-nr =1048576
kernel.shmmni =4096
net.ipv4.ipfrag_low_thresh = 943718400
net.ipv4.ipfrag_high_thresh = 1073741824
net.ipv4.ipfrag_time = 90
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
[root@jandb ~]# sysctl -p
```

### 2.5 修改最大限制

```shell
[root@jandb ~]# vim /etc/profile
if [ $USER = "oracle" ]||[ $USER = "grid" ]; then
        if [ $SHELL = "/bin/ksh" ]; then
                ulimit -p 16384
                ulimit -n 65536
        else
                ulimit -u 16384 -n 65536
        fi
                umask 022
fi
[root@jandb ~]# vim /etc/security/limits.conf
grid            soft    nproc   2047
grid            hard    nproc   16384
grid            soft    nofile  1024
grid            hard    nofile  65536
oracle          soft    nproc   2047
oracle          hard    nproc   16384
oracle          soft    nofile  1024
oracle          hard    nofile  65536
[root@jandb ~]# vim /etc/pam.d/login
session    required     pam_limits.so
```

### 2.6 设置环境变量

Grid用户：添加如下内容

```shell
[root@jandb ~]# vim /home/grid/.bash_profile
export EDITOR=vi
export ORACLE_SID=+ASM
export ORACLE_BASE=/oracle/app/grid
export ORACLE_HOME=/oracle/app/11.2.0/grid
export ORACLE_OWNER=grid
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME/lib:/lib:/usr/lib:/usr/local/lib
export NLS_LANG="simplified chinese"_china.zhs16gbk
export PATH=$PATH:$HOME/bin:$ORACLE_HOME/bin
unset USERNAME
umask 022

[root@jandb ~]# vim /home/oracle/.bash_profile
export ORACLE_UNQNAME=prod
export ORACLE_SID=prod
export ORACLE_BASE=/oracle/app/oracle
export ORACLE_HOME=/oracle/app/oracle/product/11.2.0/db_1
export ORACLE_OWNER=oracle
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME/lib:/lib:/usr/lib:/usr/local/lib
export NLS_LANG="simplified chinese"_china.zhs16gbk
export PATH=$PATH:$HOME/bin:$ORACLE_HOME/bin
unset USERNAME
umask 022
[root@jandb ~]# source /home/grid/.bash_profile
[root@jandb ~]# source /home/oracle/.bash_profile
```

### 2.7 配置裸设备

```shell
[root@jandb oracle]# cat /etc/udev/rules.d/60-raw.rules 
# Enter raw device bindings here.
#
# An example would be:
#   ACTION=="add", KERNEL=="sda", RUN+="/bin/raw /dev/raw/raw1 %N"
# to bind /dev/raw/raw1 to /dev/sda, or
#   ACTION=="add", ENV{MAJOR}=="8", ENV{MINOR}=="1", RUN+="/bin/raw /dev/raw/raw2 %M %m"
# to bind /dev/raw/raw2 to the device with major 8, minor 1.
 ACTION=="add", KERNEL=="sdc1", RUN+="/bin/raw /dev/raw/raw1 %N"
 ACTION=="add", KERNEL=="sdc2", RUN+="/bin/raw /dev/raw/raw2 %N"



[root@jandb oracle]# cat /etc/rc.local 
#!/bin/sh
#
# This script will be executed *after* all the other init scripts.
# You can put your own initialization stuff in here if you don't
# want to do the full Sys V style init stuff.

touch /var/lock/subsys/local
/bin/raw /dev/raw/raw1 /dev/sdb1
/bin/raw /dev/raw/raw2 /dev/sdb2

sleep 3s
chown grid:asmadmin /dev/raw/raw*
chmod 660 /dev/raw/raw*
```

配置设备参数文件，重启服务器

## 三、安装grid

### 3.1 下载依赖包

```shell
yum install -y compat-libstdc++-33* elfutils-libelf* elfutils-libelf-devel* gcc gcc-c++* glibc* glibc-common* glibc-devel* glibc-headers* libaio* libaio-devel* libgcc* libstdc++* libstdc++-devel* libXp* make* sysstat* unixODBC* unixODBC-devel* compat-libcap1* compat-libstdc++-33* elfutils-libelf-devel* ksh*
```

### 3.2 脚本修改内核参数

grid的包是 ：p10404530_112030_Linux-x86-64_3of7.zip

```shell
[root@jandb /]# unzip p10404530_112030_Linux-x86-64_1of7.zip
[root@jandb /]# unzip p10404530_112030_Linux-x86-64_2of7.zip
[root@jandb /]# cd /soft/grid/rpm/
[root@jandb rpm]# rpm -ivh cvuqdisk-1.0.9-1.rpm
[root@jandb /]# chown grid:oinstall grid/* -R
[grid@jandb grid]$ 
./runcluvfy.sh stage -pre crsinst -n jandb -fixup -verbose
```

### 3.3 修改安装文件grid_install.rsp

```shell
[grid@jandb response]$ sed -i 's/^#.*$//g' *.rsp 
[grid@jandb response]$ sed -i '/^$/d' *.rsp
ORACLE_HOSTNAME=jandb
INVENTORY_LOCATION=/oracle/app/oraInventory
SELECTED_LANGUAGES=en,zh_CN
oracle.install.option=HA_CONFIG
ORACLE_BASE=/oracle/app/grid
ORACLE_HOME=/oracle/app/11.2.0/grid
oracle.install.asm.OSDBA=asmdba
oracle.install.asm.OSOPER=asmoper
oracle.install.asm.OSASM=asmadmin
oracle.install.crs.config.gpnp.scanName=
oracle.install.crs.config.gpnp.scanPort=
oracle.install.crs.config.clusterName=
oracle.install.crs.config.gpnp.configureGNS=false
oracle.install.crs.config.gpnp.gnsSubDomain=
oracle.install.crs.config.gpnp.gnsVIPAddress=
oracle.install.crs.config.autoConfigureClusterNodeVIP=
oracle.install.crs.config.clusterNodes=
oracle.install.crs.config.storageOption= ASM_STORAGE
oracle.install.crs.config.sharedFileSystemStorage.diskDriveMapping=
oracle.install.crs.config.sharedFileSystemStorage.votingDiskLocations=
oracle.install.crs.config.sharedFileSystemStorage.votingDiskRedundancy=NORMAL
oracle.install.crs.config.sharedFileSystemStorage.ocrLocations=
oracle.install.crs.config.sharedFileSystemStorage.ocrRedundancy=NORMAL
oracle.install.crs.config.useIPMI=false
oracle.install.crs.config.ipmi.bmcUsername=
oracle.install.crs.config.ipmi.bmcPassword=
oracle.install.asm.SYSASMPassword=oracle
oracle.install.asm.diskGroup.name=DATA1
oracle.install.asm.diskGroup.redundancy=EXTERNAL
oracle.install.asm.diskGroup.disks=/dev/raw/raw1
oracle.install.asm.diskGroup.diskDiscoveryString=/dev/raw/raw*
oracle.install.asm.monitorPassword=oracle
oracle.install.crs.upgrade.clusterNodes=
oracle.install.asm.upgradeASM=false
oracle.installer.autoupdates.option=SKIP_UPDATES
oracle.installer.autoupdates.downloadUpdatesLoc=
AUTOUPDATES_MYORACLESUPPORT_USERNAME=
AUTOUPDATES_MYORACLESUPPORT_PASSWORD=
PROXY_HOST=
PROXY_PORT=
PROXY_USER=
PROXY_PWD=
PROXY_REALM=
```

### 3.4 开始静默安装

```shell
[grid@jandb grid] ./runInstaller -responseFile /soft/grid/response/grid_install.rsp -silent -ignorePrereq -showProgress

[grid@jandb grid]$ [WARNING] [INS-30011] The SYS password entered does not conform to the Oracle recommended standards.
   CAUSE: Oracle recommends that the password entered should be at least 8 characters in length, contain at least 1 uppercase character, 1 lower case character and 1 digit [0-9].
   ACTION: Provide a password that conforms to the Oracle recommended standards.
[WARNING] [INS-30011] The ASMSNMP password entered does not conform to the Oracle recommended standards.
   CAUSE: Oracle recommends that the password entered should be at least 8 characters in length, contain at least 1 uppercase character, 1 lower case character and 1 digit [0-9].
   ACTION: Provide a password that conforms to the Oracle recommended standards.
[WARNING] [INS-32018] The selected Oracle home is outside of Oracle base.
   CAUSE: The Oracle home selected was outside of Oracle base.
   ACTION: Oracle recommends installing Oracle software within the Oracle base directory. Adjust the Oracle home or Oracle base accordingly.
You can find the log of this install session at:
 /oracle/app/oraInventory/logs/installActions2020-11-05_08-38-55AM.log

Prepare in progress.
..................................................   9% Done.

Prepare successful.

Copy files in progress.
..................................................   14% Done.
..................................................   21% Done.
..................................................   26% Done.
..................................................   31% Done.
..................................................   36% Done.
..................................................   42% Done.
..................................................   49% Done.
..................................................   56% Done.
..................................................   61% Done.
..................................................   66% Done.
..................................................   71% Done.
........................................
Copy files successful.

Link binaries in progress.
..........
Link binaries successful.
..........
Setup files in progress.
..................................................   76% Done.
..................................................   89% Done.

Setup files successful.
The installation of Oracle Grid Infrastructure 11g was successful.
Please check '/oracle/app/oraInventory/logs/silentInstall2020-11-05_08-38-55AM.log' for more details.
..................................................   94% Done.

Execute Root Scripts in progress.

As a root user, execute the following script(s):
 1. /oracle/app/oraInventory/orainstRoot.sh
 2. /oracle/app/11.2.0/grid/root.sh


..................................................   100% Done.

Execute Root Scripts successful.
As install user, execute the following script to complete the configuration.
 1. /oracle/app/11.2.0/grid/cfgtoollogs/configToolAllCommands RESPONSE_FILE=<response_file>

  Note:
 1. This script must be run on the same host from where installer was run. 
 2. This script needs a small password properties file for configuration assistants that require passwords (refer to install guide documentation).


Successfully Setup Software.


[root@jandb ~]# /oracle/app/oraInventory/orainstRoot.sh
Changing permissions of /oracle/app/oraInventory.
Adding read,write permissions for group.
Removing read,write,execute permissions for world.

Changing groupname of /oracle/app/oraInventory to oinstall.
The execution of the script is complete.
[root@jandb ~]# /oracle/app/11.2.0/grid/root.sh
Check /oracle/app/11.2.0/grid/install/root_jandb_2020-11-05_09-51-12.log for the output of root script

[root@jandb ~]# tail -f /oracle/app/11.2.0/grid/install/root_jandb_2020-11-05_09-51-12.log
Creating trace directory
LOCAL ADD MODE 
Creating OCR keys for user 'grid', privgrp 'oinstall'..
Operation successful.
LOCAL ONLY MODE 
Successfully accumulated necessary OCR keys.
Creating OCR keys for user 'root', privgrp 'root'..
Operation successful.
CRS-4664: Node jandb successfully pinned.
Adding Clusterware entries to upstart

jandb     2020/11/05 09:53:36     /oracle/app/11.2.0/grid/cdata/jandb/backup_20201105_095336.olr
Successfully configured Oracle Grid Infrastructure for a Standalone Server

[grid@jandb grid]$ ./runInstaller -responseFile /soft/grid/response/grid_install.rsp -silent -ignorePrereq -showProgress 
[grid@jandb bin]$ ./crs_stat -t

--------------------------------------------------------------------------------------------
ora.cssd       ora.cssd.type  OFFLINE   OFFLINE               
ora.diskmon    ora....on.type OFFLINE   OFFLINE               
ora.evmd       ora.evm.type   ONLINE    ONLINE    jandb       
ora.ons        ora.ons.type   OFFLINE   OFFLINE  

[grid@jandb bin]$ /oracle/app/11.2.0/grid/cfgtoollogs/configToolAllCommands RESPONSE_FILE=/oracle/soft/grid/response/grid_install.rsp
Setting the invPtrLoc to /oracle/app/11.2.0/grid/oraInst.loc

perform - mode is starting for action: configure

perform - mode finished for action: configure

You can see the log file: /oracle/app/11.2.0/grid/cfgtoollogs/oui/configActions2020-11-05_09-57-46-AM.log
```

到这里整个grid安装成功

## 四、建立ASM

### 4.1 检查has,css,evm都是online

[grid@jandb grid]$ crsctl check has
CRS-4638: Oracle 高可用性服务联机
[grid@jandb grid]$ crsctl check css
CRS-4529: 集群同步服务联机
[grid@jandb grid]$ crsctl check evm
CRS-4533: 事件管理器联机

### 4.2 创建密码文件

[grid@jandb grid]$ cd $ORACLE_HOME/dbs
[grid@jandb dbs]$ orapwd file=orapw+ASM password=oracle entries=10 ignorecase=y

### 4.3 配置RESPONSE_FILE

grid用户执行配置
[grid@jandb dbs]$ /oracle/app/11.2.0/grid/cfgtoollogs/configToolAllCommands RESPONSE_FILE=/oracle/soft/grid/response/grid_install.rsp
Setting the invPtrLoc to /oracle/app/11.2.0/grid/oraInst.loc
perform - mode is starting for action: configure
perform - mode finished for action: configure

You can see the log file: /oracle/app/11.2.0/grid/cfgtoollogs/oui/configActions2020-11-08_06-05-25-AM.log

### 4.4 配置ASM的pfile

```shell
[grid@jandb dbs]$ ll
total 8
-rw-r--r-- 1 grid oinstall 2851 May 15  2009 init.ora
-rw-r----- 1 grid oinstall 2560 Nov  8 06:04 orapw+ASM
[grid@jandb dbs]$ pwd
/oracle/app/11.2.0/grid/dbs
[grid@jandb dbs]$ vi init+ASM.ora
[grid@jandb dbs]$ cat init+ASM.ora 
INSTANCE_TYPE=ASM
DB_UNIQUE_NAME=+ASM
ASM_POWER_LIMIT=1
ASM_DISKSTRING=/dev/raw/raw*
ASM_DISKGROUPS=data1
LARGE_POOL_SIZE=16M
```

启动到nomount

```shell
[grid@jandb dbs]$ sqlplus / as sysasm
SQL> startup nomount pfile='$ORACLE_HOME/dbs/init+ASM.ora'
set linesize 1000
col path for a20
col name for a10
col FAILGROUP for a15
select GROUP_NUMBER, DISK_NUMBER, MOUNT_STATUS, NAME, FAILGROUP, CREATE_DATE, PATH from v$asm_disk;
SQL> 
GROUP_NUMBER DISK_NUMBER MOUNT_STATUS NAME    FAILGROUP    CREATE_DATE PATH
------------ ----------- -------------- ---------- --------------- ------------ --------------------
    2        0 CACHED  DATA2_0000 DATA2_0000    08-NOV-20 /dev/raw/raw2
    1        0 CACHED  DATA1_0000 DATA1_0000    08-NOV-20 /dev/raw/raw1

SQL> select GROUP_NUMBER, NAME, TYPE, TOTAL_MB, FREE_MB, USABLE_FILE_MB from v$asm_diskgroup;
no rows selected
SQL> create diskgroup DATA1 external REDUNDANCY disk '/dev/raw/raw1';
Diskgroup created.
SQL> create diskgroup DATA2 external REDUNDANCY disk '/dev/raw/raw2';
Diskgroup created.
SQL> select group_number,name,total_mb/1024 total_G,free_mb/1024 free_G,state,type from v$asm_diskgroup;

GROUP_NUMBER NAME    TOTAL_G     FREE_G STATE       TYPE
------------ ---------- ---------- ---------- ---------------------- ------------
    1 DATA1 5.00976563  4.9609375 MOUNTED       EXTERN
    2 DATA2 4.98632813     4.9375 MOUNTED       EXTERN
```

### 4.5 ASM服务加入集群

```shell
[grid@jandb dbs]$ srvctl add asm
[grid@jandb dbs]$ crsctl stat res -t
--------------------------------------------------------------------------------
NAME           TARGET  STATE        SERVER                   STATE_DETAILS       
--------------------------------------------------------------------------------
Local Resources
--------------------------------------------------------------------------------
ora.LISTENER.lsnr
               ONLINE  ONLINE       jandb                                        
ora.asm
               OFFLINE OFFLINE      jandb                                        
ora.ons
               OFFLINE OFFLINE      jandb                                        
--------------------------------------------------------------------------------
Cluster Resources
--------------------------------------------------------------------------------
ora.cssd
      1        ONLINE  ONLINE       jandb                                        
ora.diskmon
      1        OFFLINE OFFLINE                                                   
ora.evmd
      1        ONLINE  ONLINE       jandb   
6 创建spfile
[grid@jandb dbs]$ sqlplus / as sysasm
SQL>  create spfile from pfile;
SQL>  shutdown immediate;
SQL> startup

[grid@jandb ~]$ crsctl stat res -t
--------------------------------------------------------------------------------
NAME           TARGET  STATE        SERVER                   STATE_DETAILS       
--------------------------------------------------------------------------------
Local Resources
--------------------------------------------------------------------------------
ora.DATA1.dg
               ONLINE  ONLINE       jandb                                        
ora.LISTENER.lsnr
               ONLINE  ONLINE       jandb                                        
ora.asm
               ONLINE  ONLINE       jandb                    Started             
ora.ons
               OFFLINE OFFLINE      jandb                                        
--------------------------------------------------------------------------------
Cluster Resources
--------------------------------------------------------------------------------
ora.cssd
      1        ONLINE  ONLINE       jandb                                        
ora.diskmon
      1        OFFLINE OFFLINE                                                   
ora.evmd
      1        ONLINE  ONLINE       jandb   
```

## 五、安装数据库软件

### 5.1 修改应答文件db_install.rsp

```shell
[root@jandb soft]# chown oracle:oinstall database/ -R
[root@jandb soft]#  su – oracle
[oracle@jandb response]$ sed -i 's/^#.*$//g' *.rsp
[oracle@jandb response]$ sed -i '/^$/d' *.rsp

oracle.install.option=INSTALL_DB_SWONLY
ORACLE_HOSTNAME=prod
UNIX_GROUP_NAME=oinstall
INVENTORY_LOCATION=/oracle/app/oracle/oraInventory
SELECTED_LANGUAGES=en,zh_CN
ORACLE_HOME=/oracle/app/oracle/product/11.2.0/db_1
ORACLE_BASE=/oracle/app/oracle
oracle.install.db.InstallEdition=EE
oracle.install.db.DBA_GROUP=dba
oracle.install.db.OPER_GROUP=oinstall
oracle.install.db.config.starterdb.characterSet=AL32UTF8
oracle.install.db.config.starterdb.storageType=ASM_STORAGE
oracle.install.db.config.starterdb.fileSystemStorage.dataLocation=DATA1
oracle.install.db.config.starterdb.fileSystemStorage.recoveryLocation=
DECLINE_SECURITY_UPDATES=true    //一定要设为true
```

### 5.2 开始安装软件

```shell
[oracle@jandb response]$ pwd
/soft/database/response
[oracle@jandb response]$ ../runInstaller -silent -responseFile /soft/database/response/db_install.rsp -ignorePrereq -ignoreDiskWarning  -ignoreSysPrereqs -ignorePrereq
Starting Oracle Universal Installer...

Checking Temp space: must be greater than 120 MB.   Actual 6390 MB    Passed
Checking swap space: must be greater than 150 MB.   Actual 2222 MB    Passed
Preparing to launch Oracle Universal Installer from /tmp/OraInstall2020-11-08_06-39-56AM. Please wait ...[oracle@jandb response]$ You can find the log of this install session at:
 /oracle/app/oraInventory/logs/installActions2020-11-08_06-39-56AM.log

[oracle@jandb response]$ The installation of Oracle Database 11g was successful.
Please check '/oracle/app/oraInventory/logs/silentInstall2020-11-08_06-39-56AM.log' for more details.

As a root user, execute the following script(s):
 1. /oracle/app/oracle/product/11.2.0/db_1/root.sh


Successfully Setup Software.
```

### 5.3 执行脚本

```shell
[oracle@jandb ~]$ /oracle/app/oracle/product/11.2.0/db_1/root.sh
```

## 六、建立数据库

### 6.1 修改应答文件dbca.resp

```shell
[oracle@jandb response]$ sed -i 's/^#.*$//g' *.rsp 
[oracle@jandb response]$ sed -i '/^$/d' *.rsp
[oracle@jandb response]$ pwd
/soft/database/response
[oracle@jandb response]$ cat dbca.rsp 
[GENERAL]
RESPONSEFILE_VERSION = "11.2.0"
OPERATION_TYPE = "createDatabase"
[CREATEDATABASE]
GDBNAME = "prod"
SID = "prod"
TEMPLATENAME = "General_Purpose.dbc"
STORAGETYPE=ASM
DATAFILEDESTINATION=DATA1
RECOVERYAREADESTINATION=
CHARACTERSET = "AL32UTF8"
NATIONALCHARACTERSET= "AL16UTF16"
LISTENERS=LISTENER
TOTALMEMORY = "700"
SYSPASSWORD = "oracle"
SYSTEMPASSWORD = "oracle"

[oracle@jandb response]$ dbca  -silent  -createDatabase -responseFile   /soft/database/response/dbca.rsp
Copying database files
1% complete
35% complete
Creating and starting Oracle instance
37% complete
58% complete
Registering database with Oracle Restart
64% complete
Completing Database Creation
100% complete
Look at the log file "/oracle/app/oracle/cfgtoollogs/dbca/prod/prod.log" for further details.
```

### 6.2 Mount所有磁盘组

```shell
[grid@jandb ~]$ sqlplus / as sysasm
SQL> select group_number,name,total_mb/1024 total_G,free_mb/1024 free_G,state,type from v$asm_diskgroup;

GROUP_NUMBER NAME  TOTAL_G  FREE_G   STATE  TYPE
----------------------  ----------  ----------  ------------    ----------  ------------
    1         DATA1 5.00976563  4.9609375  MOUNTED  EXTERN 
    0         DATA2   0     0       DISMOUNTED

SQL> alter diskgroup DATA2 mount;
Diskgroup altered.

SQL> col name for a10
SQL> col state for a10
SQL> select group_number,name,total_mb/1024 total_G,free_mb/1024 free_G,state,type from v$asm_diskgroup;

GROUP_NUMBER NAME    TOTAL_G     FREE_G STATE  TYPE
------------ ---------- ---------- ---------- ---------- ------------
    1 DATA1 5.00976563  4.9609375 MOUNTED  EXTERN
    2 DATA2 4.98632813 4.93652344 MOUNTED  EXTERN

```
