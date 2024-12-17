---
sidebar_position: 203
title: Start--11g物理DG部署
---


> [DBNEST -- Bilibili DataGuard 基础搭建视频地址](https://www.bilibili.com/video/BV1Ep4y197JA?from=search&seid=17237800447886927935&spm_id_from=333.337.0.0)    
> [DBNEST -- 旧版文档 “点击” 直接浏览或下载 PDF](./Oracle11gRAC集群搭建手册.pdf) 

<iframe src="//player.bilibili.com/player.html?aid=968019810&bvid=BV1Ep4y197JA&cid=187553574&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" height="560" width="780"> </iframe>

## 一、安装前提

### 1.1 物理DG参数

| HOSTNAME | IP | DB_NAME | DB_UNIQUE_NAME | INSTANCE_NAME | SERVICE_NAME | TNSNAME | 
| - | - | - | - | - | - | - |
| dg1 | 192.168.169.220 | prod | uni_dg1 | prod | dg1 | uni_dg1 |
| dg2 | 192.168.169.221 | prod | uni_dg2 | Prod_stdby | dg2 | uni_dg2 |

### 1.2 文件物理路径
| datafile | controlfile | logfile | archivelog | auditfile |
| - | - | - | - | - |
| /u01/oradata/prod | /u01/oradata/prod /u01/fast_recovery_area/prod  | /u01/oradata/prod | /u01/arch | /u01/admin/prod/adump |
| /u01/oradata/prod_stdby | /u01/oradata/prod_stdby /u01/fast_recovery_area/prod | /u01/oradata/prod_stdby | /u01/arch | /u01/admin/prod_stdby/adump |



## 二、服务器配置修改
### 2.1 配置网络
主库dg1:
```shell
[root@dg1 ~]# vi /etc/hosts
[root@dg1 ~]# scp /etc/hosts dg2:/etc/
The authenticity of host 'dg2 (192.168.169.201)' can't be established.
RSA key fingerprint is 26:5c:d2:36:66:2b:e2:b3:12:0d:c4:fb:a6:44:97:7b.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'dg2,192.168.169.201' (RSA) to the list of known hosts.
root@dg2's password: 123456
```
### 2.2 修改备库实例名

备库dg2:
```shell
[root@dg2 ~]# cat /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
192.168.169.200 dg1
192.168.169.201 dg2
[root@dg2 ~]# su - oracle
[oracle@dg2 ~]$ vi .bash_profile 
[oracle@dg2 ~]$ source .bash_profile 
[oracle@dg2 ~]$ env |grep SID
ORACLE_SID=prod_stdby
```
### 2.3 建立备库目录
备库dg2:
```shell
[oracle@dg2 ~]$ mkdir -p /u01/oradata/prod_stdby
[oracle@dg2 ~]$ mkdir -p /u01/arch
[oracle@dg2 ~]$ mkdir -p /u01/fast_recovery_area/prod_stdby/
```
## 三、建立物理DG
### 3.1 主库强制记录日志
主库dg1:
```shell
[oracle@dg1 ~]$ sqlplus / as sysdba
SQL> select log_mode,force_logging from v$database;
LOG_MODE     FOR
------------   ---
NOARCHIVELOG NO
SQL> alter database force logging;
SQL> select log_mode,force_logging from v$database;
LOG_MODE     FOR
------------   ---
NOARCHIVELOG YES
SQL> shutdown immediate
SQL> startup mount;
SQL> alter database archivelog;
SQL> alter database open;
SQL> select log_mode,force_logging from v$database;
LOG_MODE     FOR
------------   ---
ARCHIVELOG    YES
```
### 3.2 配置主备监听
```shell
[oracle@dg1 ~]$ cd /u01/oracle/network/admin/
[oracle@dg1 admin]$ vi tnsnames.ora 
                                    
uni_dg1 =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = dg1)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = uni_dg1)
    )
  )

uni_dg2 =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = dg2)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = uni_dg2)
    )
  )
[oracle@dg1 admin]$ scp ./tnsnames.ora dg2:/u01/oracle/network/admin/
The authenticity of host 'dg2 (192.168.169.221)' can't be established.
RSA key fingerprint is 26:5c:d2:36:66:2b:e2:b3:12:0d:c4:fb:a6:44:97:7b.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'dg2,192.168.169.221' (RSA) to the list of known hosts.
oracle@dg2's password: 
Permission denied, please try again.
oracle@dg2's password: 
Permission denied, please try again.
oracle@dg2's password: 
tnsnames.ora

[oracle@dg2 ~]$ cd /u01/oracle/network/admin/
[oracle@dg2 admin]$ cat tnsnames.ora 
```
### 3.3 配置主库信息
主库dg1:
```
SQL> create pfile='/home/oracle/dg1_spfile' from spfile;
SQL> exit
[oracle@dg1 ~]$ vi dg1_spfile 
DB_UNIQUE_NAME=uni_dg1 LOG_ARCHIVE_CONFIG='DG_CONFIG=(uni_dg1,uni_dg2)'


LOG_ARCHIVE_DEST_1='LOCATION=/u01/arch/ VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=uni_dg1'
LOG_ARCHIVE_DEST_2='SERVICE=uni_dg2 ASYNC VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE) DB_UNIQUE_NAME=uni_dg2'
LOG_ARCHIVE_DEST_STATE_1=ENABLE
LOG_ARCHIVE_DEST_STATE_2=ENABLE

FAL_SERVER=uni_dg2
DB_FILE_NAME_CONVERT='/u01/oradata/prod_stdby','/u01/oradata/prod'
LOG_FILE_NAME_CONVERT='/u01/oradata/prod_stdby','/u01/oradata/prod'
STANDBY_FILE_MANAGEMENT=AUTO
[oracle@dg1 ~]$ cd /u01/
[oracle@dg1 u01]$ mkdir arch
[oracle@dg1 u01]$ ll  |grep arch
drwxr-xr-x  2 oracle oinstall 4096 Apr 22 18:19 arch

[oracle@dg1 u01]$ sqlplus / as sysdba
SQL> shutdown immediate
[oracle@dg1 u01]$ sqlplus / as sysdba
SQL> startup force nomount pfile=/home/oracle/dg1_spfile
ORACLE instance started.
Total System Global Area  521936896 bytes
SQL> show parameter name

NAME         TYPE                             VALUE
-------------------------   -------------------------------    ---------------------------------------
cell_offloadgroup_name   string
db_file_name_convert        string                        /u01/oradata/prod_stdby, /u01/oradata/prod
db_name           string     prod
db_unique_name    string     uni_dg1
global_names          boolean    FALSE
instance_name          string     prod
lock_name_space          string
log_file_name_convert         string     /u01/oradata/prod_stdby, /u01/oradata/prod
processor_group_name   string
service_names          string     uni_dg1
SQL> create spfile from pfile='/home/oracle/dg1_spfile';
SQL> startup force
Database opened.
SQL> show parameter name

NAME         TYPE  VALUE
------------------------------------ ----------- ------------------------------
cell_offloadgroup_name       string
db_file_name_convert       string  /u01/oradata/prod_stdby, /u01/oradata/prod
db_name         string  prod
db_unique_name       string  uni_dg1
global_names        boolean  FALSE
instance_name        string  prod
lock_name_space        string
log_file_name_convert       string  /u01/oradata/prod_stdby, /u01/oradata/prod
processor_group_name      string
service_names        string  uni_dg1
SQL> alter database create standby controlfile as '/home/oracle/stdby_ctrl_file.bak';
Database altered.
SQL> exit
Disconnected from Oracle Database 11g Enterprise Edition Release 11.2.0.4.0 - 64bit Production
With the Partitioning, OLAP, Data Mining and Real Application Testing options
[oracle@dg1 u01]$ cd
[oracle@dg1 ~]$ ll |grep ctrl
-rw-r----- 1 oracle oinstall 9748480 Apr 22 18:34 stdby_ctrl_file.bak
[oracle@dg1 ~]$ cd /u01/oradata/prod/
[oracle@dg1 prod]$ ll
total 3531072
-rw-r----- 1 oracle oinstall    9748480 Apr 22 18:36 control01.ctl
-rw-r----- 1 oracle oinstall  363077632 Apr 22 18:32 example01.dbf
-rw-r----- 1 oracle oinstall   52429312 Apr 22 18:36 redo01.log
-rw-r----- 1 oracle oinstall   52429312 Apr 22 18:32 redo02.log
-rw-r----- 1 oracle oinstall   52429312 Apr 22 18:32 redo03.log
-rw-r----- 1 oracle oinstall  702554112 Apr 22 18:32 sysaux01.dbf
-rw-r----- 1 oracle oinstall  796925952 Apr 22 18:32 system01.dbf
-rw-r----- 1 oracle oinstall   38805504 Apr 22 18:32 temp01.dbf
-rw-r----- 1 oracle oinstall 1428103168 Apr 22 18:32 test01.dbf
-rw-r----- 1 oracle oinstall  110108672 Apr 22 18:32 undotbs01.dbf
-rw-r----- 1 oracle oinstall    9183232 Apr 22 18:32 users01.dbf
[oracle@dg1 prod]$ scp * dg2:/u01/oradata/prod_stdby/
[oracle@dg1 dbs]$  scp orapwprod /u01/oracle/dbs/orapwprod_stdby 
[oracle@dg1 dbs]$  scp orapwprod oracle@dg2:/u01/oracle/dbs/orapwprod_stdby
```
备库dg2：
```shell
[oracle@dg2 prod_stdby]$ cd /u01/oradata/prod_stdby/
[oracle@dg2 prod_stdby]$ ll |grep control
-rw-r----- 1 oracle oinstall    9748480 Apr 22 18:39 control01.ctl
[oracle@dg2 prod_stdby]$ rm control01.ctl
[oracle@dg2 prod_stdby]$ cd /u01/fast_recovery_area/prod/ PROD/ 
[oracle@dg2 prod_stdby]$ cd /u01/fast_recovery_area/prod/
[oracle@dg2 prod]$ ll
total 9520
-rw-r----- 1 oracle oinstall 9748480 Apr 22 17:30 control02.ctl
[oracle@dg2 prod]$ rm control02.ctl
[oracle@dg1 ~]$ sqlplus / as sysdba
SQL> shutdown immediate
ORACLE instance shut down.
[oracle@dg1 ~]$ scp stdby_ctrl_file.bak dg2:/u01/oradata/prod_stdby/control01.ctl
[oracle@dg1 ~]$ cd /u01/oradata/prod/ 
[oracle@dg1 prod]$ scp * dg2:/u01/oradata/prod_stdby/
```
备库dg2:
```shell
[oracle@dg2 prod_stdby]$ ll
total 3521564
-rw-r--r-- 1 oracle oinstall       1168 Apr 22 18:44 control01.ctl
-rw-r--r-- 1 oracle oinstall       1168 Apr 22 18:44 dg1_spfile
-rw-r----- 1 oracle oinstall  363077632 Apr 22 18:39 example01.dbf
-rw-r----- 1 oracle oinstall   52429312 Apr 22 18:39 redo01.log
-rw-r----- 1 oracle oinstall   52429312 Apr 22 18:39 redo02.log
-rw-r----- 1 oracle oinstall   52429312 Apr 22 18:39 redo03.log
-rw-r----- 1 oracle oinstall  702554112 Apr 22 18:39 sysaux01.dbf
-rw-r----- 1 oracle oinstall  796925952 Apr 22 18:39 system01.dbf
-rw-r----- 1 oracle oinstall   38805504 Apr 22 18:39 temp01.dbf
-rw-r----- 1 oracle oinstall 1428103168 Apr 22 18:40 test01.dbf
-rw-r----- 1 oracle oinstall  110108672 Apr 22 18:40 undotbs01.dbf
-rw-r----- 1 oracle oinstall    9183232 Apr 22 18:40 users01.d
[oracle@dg1 prod]$ cd
[oracle@dg1 ~]$ scp stdby_ctrl_file.bak dg2:/u01/oradata/prod_stdby/control01.ctl
oracle@dg2's password: 
stdby_ctrl_file.bak                           100% 9520KB   9.3MB/s   00:00
[oracle@dg1 ~]$ scp stdby_ctrl_file.bak dg2:/u01/fast_recovery_area/prod_stdby/control02.ctl
oracle@dg2's password: 
stdby_ctrl_file.bak                                   100% 9520KB   9.3MB/s   00:00  
```

### 3.4 配置备库信息
备库dg2:
```shell
[oracle@dg2 dbs]$ cd
[oracle@dg2 ~]$ vi .bash_profile 
[oracle@dg2 ~]$ env |grep SID
ORACLE_SID=prod_stdby
[oracle@dg2 ~]$ cd $ORACLE_HOME/dbs
[oracle@dg2 dbs]$ ll
total 24
-rw-rw---- 1 oracle oinstall 1544 Apr 22 17:38 hc_prod.dat
-rw-r--r-- 1 oracle oinstall 2851 May 15  2009 init.ora
-rw-r--r-- 1 oracle oinstall  896 Apr 16 22:31 initprod.ora
-rw-r----- 1 oracle oinstall   24 Mar  8 08:50 lkPROD
-rw-r----- 1 oracle oinstall 1536 Mar  8 08:53 orapwprod
-rw-r----- 1 oracle oinstall 2560 Apr 22 17:30 spfileprod.ora
[oracle@dg2 dbs]$ cp initprod.ora initprod_stdby.ora 
[oracle@dg2 dbs]$ vi initprod_stdby.ora
*.db_recovery_file_dest='/u01/fast_recovery_area'
*.db_recovery_file_dest_size=4385144832
*.diagnostic_dest='/u01'
*.dispatchers='(PROTOCOL=TCP) (SERVICE=prodXDB)'
*.memory_target=511705088
*.nls_language='SIMPLIFIED CHINESE'
*.nls_territory='CHINA'
*.open_cursors=300
*.processes=150
*.remote_login_passwordfile='EXCLUSIVE'
*.undo_tablespace='UNDOTBS1'
DB_UNIQUE_NAME=uni_dg2
LOG_ARCHIVE_CONFIG='DG_CONFIG=(uni_dg1,uni_dg2)'
LOG_ARCHIVE_DEST_1=
 'LOCATION=/u01/arch/
  VALID_FOR=(ALL_LOGFILES,ALL_ROLES)
  DB_UNIQUE_NAME=uni_dg2'
LOG_ARCHIVE_DEST_2=
 'SERVICE=uni_dg1 ASYNC
  VALID_FOR=(ONLINE_LOGFILES,PRIMARY_ROLE)
  DB_UNIQUE_NAME=uni_dg1'
LOG_ARCHIVE_DEST_STATE_1=ENABLE
LOG_ARCHIVE_DEST_STATE_2=ENABLE
FAL_SERVER=uni_dg1
DB_FILE_NAME_CONVERT='/u01/oradata/prod','/u01/oradata/prod_stdby'
LOG_FILE_NAME_CONVERT='/u01/oradata/prod','/u01/oradata/prod_stdby'
STANDBY_FILE_MANAGEMENT=AUTO








alter system set log_archive_dest_1='LOCATION=/u01/ora_arch VALID_FOR=(ALL_LOGFILES,ALL_ROLES) DB_UNIQUE_NAME=primary' scope=both;
= db_unique_name=primary


[oracle@dg2 prod_stdby]$ cd /u01/
[oracle@dg2 u01]$ ll |grep ^d|grep arch
drwxr-xr-x  2 oracle oinstall 4096 Apr 22 19:03 arch
[oracle@dg2 u01]$ sqlplus / as sysdba
SQL> startup force nomount pfile=/u01/oracle/dbs/initprod_stdby.ora;
ORACLE instance started.
Total System Global Area  509411328 bytes
Fixed Size      2254704 bytes
Variable Size    377489552 bytes
Database Buffers   121634816 bytes
Redo Buffers      8032256 bytes
create spfile from pfile;
File created.
SQL> startup force mount
ORACLE instance st SQL> arted.
Total System Global Area  509411328 bytes
Fixed Size      2254704 bytes
Variable Size    377489552 bytes
Database Buffers   121634816 bytes
Redo Buffers      8032256 bytes
Database mounted.
SQL> startup force
SQL> alter database open;   
SQL> recover managed standby database disconnect from session;
```
### 3.4 测试日志切换
主库dg1:
```shell
SQL> select tablespace_name,file_name from dba_data_files;
TABLESPACE_NAME                FILE_NAME
------------------------------ --------------------------------------------------
EXAMPLE                        /u01/oradata/prod/example01.dbf
USERS                          /u01/oradata/prod/users01.dbf
UNDOTBS1                       /u01/oradata/prod/undotbs01.dbf
SYSAUX                         /u01/oradata/prod/sysaux01.dbf
SYSTEM                         /u01/oradata/prod/system01.dbf

SQL> create tablespace test1 datafile '/u01/oradata/prod/test101.dbf' size 5m;
SQL> create table scott.test(id int) tablespace test1;
SQL> insert into scott.test values(1);
SQL> commit;
SQL> alter system switch logfile;     
```
备库dg2:
```shell
SQL> select tablespace_name,file_name from dba_data_files where tablespace_name=’TEST1’;
SQL> select * from scott.test;

```