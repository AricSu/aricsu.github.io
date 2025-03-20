# Dumpling 快速使用

## 下载安装包

下载链接<https://download.pingcap.org/tidb-toolkit-{version}-linux-amd64.tar.gz中的> **{version}** 为 Dumpling 的版本号。  
本例，以v4.0.2 版本为范例下载链接如下。

```shell
[tidb@tidb01-41 soft]$ wget https://download.pingcap.org/tidb-toolkit-v4.0.2-linux-amd64.tar.gz

--2021-01-04 08:34:25--  https://download.pingcap.org/tidb-toolkit-v4.0.2-linux-amd64.tar.gz
Resolving download.pingcap.org (download.pingcap.org)... 111.7.105.238, 111.63.182.240, 120.201.132.238, ...
Connecting to download.pingcap.org (download.pingcap.org)|111.7.105.238|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 142758194 (136M) [application/x-compressed]
Saving to: ‘tidb-toolkit-v4.0.2-linux-amd64.tar.gz’

100%[========================================================================================================================================================================>] 142,758,194 4.52MB/s   in 26s    

2021-01-04 08:34:52 (5.21 MB/s) - ‘tidb-toolkit-v4.0.2-linux-amd64.tar.gz’ saved [142758194/142758194]


[tidb@tidb01-41 soft]$ ll
total 139420
drwxrwxr-x 18 tidb tidb      4096 Dec 27 03:29 tidb-ansible
-rw-rw-r--  1 tidb tidb 142758194 Jul  1  2020 tidb-toolkit-v4.0.2-linux-amd64.tar.gz
```

## 解压并配置环境变量

```shell
[tidb@tidb01-41 soft]$ ll
total 139420
drwxrwxr-x 18 tidb tidb      4096 Dec 27 03:29 tidb-ansible
-rw-rw-r--  1 tidb tidb 142758194 Jul  1  2020 tidb-toolkit-v4.0.2-linux-amd64.tar.gz

# 解压下载好的压缩包
[tidb@tidb01-41 soft]$ tar -xivf tidb-toolkit-v4.0.2-linux-amd64.tar.gz 
tidb-toolkit-v4.0.2-linux-amd64/
tidb-toolkit-v4.0.2-linux-amd64/bin/
tidb-toolkit-v4.0.2-linux-amd64/bin/pd-tso-bench
tidb-toolkit-v4.0.2-linux-amd64/bin/tikv-importer
tidb-toolkit-v4.0.2-linux-amd64/bin/tidb-lightning-ctl
tidb-toolkit-v4.0.2-linux-amd64/bin/br
tidb-toolkit-v4.0.2-linux-amd64/bin/sync_diff_inspector
tidb-toolkit-v4.0.2-linux-amd64/bin/mydumper
tidb-toolkit-v4.0.2-linux-amd64/bin/dumpling
tidb-toolkit-v4.0.2-linux-amd64/bin/tidb-lightning


# 修改用户环境变量配置文件
# 在结尾追加如下两行内容
[tidb@tidb01-41 soft]$ vi ~/.bash_profile 

[tidb@tidb01-41 soft]$ tail -2 ~/.bash_profile
PATH=/home/tidb/soft/tidb-toolkit-v4.0.2-linux-amd64/bin:$PATH
export PATH

# 使环境变量更改生效
[tidb@tidb01-41 soft]$ source ~/.bash_profile
[tidb@tidb01-41 soft]$ dumpling --help
```

## tiup 使用 dumpling

```shell
[tidb@tiup-tidb41 ~]$ tiup install dumpling

[tidb@tiup-tidb41 ~]$ tiup list --installed
Available components:
Name      Owner    Description
----      -----    -----------
dumpling  pingcap  Dumpling is a CLI tool that helps you dump MySQL/TiDB data
......
......
```

## MySQL 测试 Dumping

1. 将dumpling工具相关机器上传入测试MySQL的服务器 /usr/local/bin 路径下,全局可用状态；

    ```shell
    [tidb@tidb01-41 bin]$ scp dumpling root@192.168.1.44:/usr/local/bin/
    root@192.168.1.44's password: 
    dumpling                                                             100%   21MB  33.6MB/s   00:00
    ```

2. 实验环境准备；

    ```shell
    # 创建测试数据库

    mysql> create database jan_db;
    mysql> use jan_db
    mysql> create table jan_test (id int,name varchar(20)) DEFAULT CHARACTER SET utf8;
    mysql> insert into jan_test values (1,'jan_1'),(2,'jan_2'),(3,'jan_3'),(4,'jan_4');


    # 创建测试用户并授权

    create user 'jan'@'tidb04-44' identified by '123123';
    grant reload,replication client on *.* to 'jan'@'tidb04-44';
    grant lock tables on jan_db.* to 'jan'@'tidb04-44';
    grant select on jan_db.* to 'jan'@'tidb04-44';
    flush privileges;
    # grant select on mysql.tidb to 'jan'@'%';
    ```

3. MySQL 端使用 Dumpling 导出，并更改表名将数据导回数据库；

    ```shell
    # 成功使用dumpling导出MySQL数据

    [root@tidb04-44 ~]# dumpling -h192.168.1.44 -ujan -p123123 -P 3306 -T "jan_db.jan_test" -o /root/dumpdir 
    Release version: v4.0.2
    Git commit hash: ff92fcf2fa8fc77127df21820280f6b2088b8309
    Git branch:      heads/v4.0.2
    Build timestamp: 2020-07-01 09:42:00Z
    Go version:      go version go1.13 linux/amd64

    [2021/01/05 09:12:23.633 -05:00] [INFO] [config.go:139] ["detect server type"] [type=MySQL]
    [2021/01/05 09:12:23.633 -05:00] [INFO] [config.go:157] ["detect server version"] [version=5.6.50]
    [2021/01/05 09:12:23.634 -05:00] [INFO] [sql.go:419] ["session variable is not supported by db"] [variable=tidb_mem_quota_query] [value=34359738368]
    [2021/01/05 09:12:23.643 -05:00] [INFO] [main.go:195] ["dump data successfully, dumpling will exit now"]

    # 列出导出数据目录下
    [root@tidb04-44 dumpdir]# ll
    total 16
    -rwxr-xr-x. 1 root root 111 Jan  5 09:12 jan_db.jan_test.0.sql       #  导出的逻辑数据sql文件
    -rwxr-xr-x. 1 root root 129 Jan  5 09:12 jan_db.jan_test-schema.sql  #  导出的表schema逻辑语句文件
    -rwxr-xr-x. 1 root root  67 Jan  5 09:12 jan_db-schema-create.sql    #  导出的数据库schema逻辑语句文件
    -rwxr-xr-x. 1 root root  95 Jan  5 09:12 metadata                    #  导出的元数据记录文件


    # root用户下更改表名将数据导回数据库
    [root@tidb04-44 dumpdir]# mysql -uroot -p123123 
    mysql> use jan_db
    mysql> rename table jan_test to jan_test_bak;
    mysql> source jan_db.jan_test-schema.sql
    mysql> source jan_db.jan_test.0.sql
    mysql> show tables;
    +------------------+
    | Tables_in_jan_db |
    +------------------+
    | jan_test         |
    | jan_test_bak     |
    +------------------+
    2 rows in set (0.00 sec)

    mysql> select count(*) from jan_test;
    +----------+
    | count(*) |
    +----------+
    |        4 |
    +----------+
    1 row in set (0.00 sec)

    mysql> select count(*) from jan_test_bak;
    +----------+
    | count(*) |
    +----------+
    |        4 |
    +----------+
    1 row in set (0.00 sec)
    ```

## TiDB 测试 Dumpling 导出 SQL

```shell
# 执行dumpling导出命令

[tidb@tidb01-41 soft]$ dumpling \
  -u root \
  -P 4000 \
  -h 192.168.1.41 \
  -o /home/tidb/dumpdir/sqlexp \
  --sql 'select * from `jan`.`sbtest1` where id < 100'

Release version: v4.0.2
Git commit hash: ff92fcf2fa8fc77127df21820280f6b2088b8309
Git branch:      heads/v4.0.2
Build timestamp: 2020-07-01 09:42:00Z
Go version:      go version go1.13 linux/amd64

[2021/01/04 09:11:00.450 -05:00] [INFO] [config.go:139] ["detect server type"] [type=TiDB]
[2021/01/04 09:11:00.451 -05:00] [INFO] [config.go:157] ["detect server version"] [version=3.0.1]
[2021/01/04 09:11:00.451 -05:00] [WARN] [dump.go:95] ["If the amount of data to dump is large, criteria: (data more than 60GB or dumped time more than 10 minutes)\nyou'd better adjust the tikv_gc_life_time to avoid export failure due to TiDB GC during the dump process.\nBefore dumping: run sql `update mysql.tidb set VARIABLE_VALUE = '720h' where VARIABLE_NAME = 'tikv_gc_life_time';` in tidb.\nAfter dumping: run sql `update mysql.tidb set VARIABLE_VALUE = '10m' where VARIABLE_NAME = 'tikv_gc_life_time';` in tidb.\n"]
[2021/01/04 09:11:00.580 -05:00] [INFO] [main.go:195] ["dump data successfully, dumpling will exit now"]


# 进入 SQL 文件导出目录，查看导出的文件

[tidb@tidb01-41 soft]$ cd ../dumpdir/sqlexp
[tidb@tidb01-41 dumpdir]$ pwd
/home/tidb/dumpdir
[tidb@tidb01-41 sqlexp]$ ll
total 24
-rwxr-xr-x 1 tidb tidb   140 Jan  4 09:26 metadata
-rwxr-xr-x 1 tidb tidb 19368 Jan  4 09:26 result.0.sql


# 查看dumpling导出的元数据信息

[tidb@tidb01-41 sqlexp]$ cat metadata 
Started dump at: 2021-01-04 09:26:42
SHOW MASTER STATUS:
  Log: tidb-binlog        #  binlog日志名称
  Pos: 421991652309860365 #  master binary log 的位置
Finished dump at: 2021-01-04 09:26:42   #  导出的起始时间


# 查看result.0.csv文件的前5行

[tidb@tidb01-41 sqlexp]$ head -5 result.0.sql

/*!40101 SET NAMES binary*/;
INSERT INTO `` (`id`,`k`,`c`,`pad`) VALUES
(1,2494,'31451373586-15688153734-79729593694-96509299839-83724898275-86711833539-78981337422-35049690573-51724173961-87474696253','98996621624-36689827414-04092488557-09587706818-65008859162'),
(2,2489,'21472970079-70972780322-70018558993-71769650003-09270326047-32417012031-10768856803-14235120402-93989080412-18690312264','04776826683-45880822084-77922711547-29057964468-76514263618'),
(3,2495,'49376827441-24903985029-56844662308-79012577859-40518387141-60588419212-24399130405-42612257832-29494881732-71506024440','26843035807-96849339132-53943793991-69741192222-48634174017'),
[tidb@tidb01-41 sqlexp]$ vi result.0.sql 

[tidb@tidb01-41 sqlexp]$ cat ./result.0.sql |wc -l
101
```

可以看到导出的result文件中为101行，证明--sql参数也适用于sql文件的导出。

## TiDB 测试 Dumpling 导出 CSV

```shell
# 执行dumpling导出命令
[tidb@tidb01-41 soft]$ dumpling \
  -u root \
  -P 4000 \
  -h 192.168.1.41 \
  -o /home/tidb/dumpdir \
  --filetype csv \
  --sql 'select * from `jan`.`sbtest1` where id < 100'

Release version: v4.0.2
Git commit hash: ff92fcf2fa8fc77127df21820280f6b2088b8309
Git branch:      heads/v4.0.2
Build timestamp: 2020-07-01 09:42:00Z
Go version:      go version go1.13 linux/amd64

[2021/01/04 09:11:00.450 -05:00] [INFO] [config.go:139] ["detect server type"] [type=TiDB]
[2021/01/04 09:11:00.451 -05:00] [INFO] [config.go:157] ["detect server version"] [version=3.0.1]
[2021/01/04 09:11:00.451 -05:00] [WARN] [dump.go:95] ["If the amount of data to dump is large, criteria: (data more than 60GB or dumped time more than 10 minutes)\nyou'd better adjust the tikv_gc_life_time to avoid export failure due to TiDB GC during the dump process.\nBefore dumping: run sql `update mysql.tidb set VARIABLE_VALUE = '720h' where VARIABLE_NAME = 'tikv_gc_life_time';` in tidb.\nAfter dumping: run sql `update mysql.tidb set VARIABLE_VALUE = '10m' where VARIABLE_NAME = 'tikv_gc_life_time';` in tidb.\n"]
[2021/01/04 09:11:00.580 -05:00] [INFO] [main.go:195] ["dump data successfully, dumpling will exit now"]


# 进入 SQL 文件导出目录，查看导出的文件
[tidb@tidb01-41 soft]$ cd ../dumpdir/
[tidb@tidb01-41 dumpdir]$ pwd
/home/tidb/dumpdir
[tidb@tidb01-41 dumpdir]$ ll
total 24
-rwxr-xr-x 1 tidb tidb   140 Jan  4 09:11 metadata
-rwxr-xr-x 1 tidb tidb 19018 Jan  4 09:11 result.0.csv


# 查看dumpling导出的元数据信息
[tidb@tidb01-41 dumpdir]$ cat metadata 
Started dump at: 2021-01-04 09:11:00
SHOW MASTER STATUS:
  Log: tidb-binlog        #  binlog日志名称
  Pos: 421991405435486213 #  master binary log 的位置
Finished dump at: 2021-01-04 09:11:00   # 导出的起始时间


# 查看result.0.csv文件的前5行
[tidb@tidb01-41 dumpdir]$ head -5 result.0.csv 
"id","k","c","pad"
1,2494,"31451373586-15688153734-79729593694-96509299839-83724898275-86711833539-78981337422-35049690573-51724173961-87474696253","98996621624-36689827414-04092488557-09587706818-65008859162"
2,2489,"21472970079-70972780322-70018558993-71769650003-09270326047-32417012031-10768856803-14235120402-93989080412-18690312264","04776826683-45880822084-77922711547-29057964468-76514263618"
3,2495,"49376827441-24903985029-56844662308-79012577859-40518387141-60588419212-24399130405-42612257832-29494881732-71506024440","26843035807-96849339132-53943793991-69741192222-48634174017"
4,2594,"85762858421-36258200885-10758669419-44272723583-12529521893-95630803635-53907705724-07005352902-43001596772-53048338959","37979424284-37912826784-31868864947-42903702727-96097885121"



# 如果导出的数据非常大，如：数据量超过60GB或导出时常超过10分钟；
# 推荐调整tikv_gc_life_time以避免由于TiDB GC导致的失败；
update mysql.tidb set VARIABLE_VALUE = '720h' where VARIABLE_NAME = 'tikv_gc_life_time';           # 导出前调整
update mysql.tidb set VARIABLE_VALUE = '10m' where VARIABLE_NAME = 'tikv_gc_life_time';            # 导出后调整
MySQL [(none)]> select * from mysql.tidb where variable_name like 'tikv_gc_life_time'\G            # 查询调涨结果
*************************** 1. row ***************************
 VARIABLE_NAME: tikv_gc_life_time
VARIABLE_VALUE: 720h
       COMMENT: All versions within life time will not be collected by GC, at least 10m, in Go format.
1 row in set (0.01 sec)
```

## 参考文章

1. [TiDB官网-Dumpling 使用文档](https://docs.pingcap.com/zh/tidb/stable/dumpling-overview)
2. [TiDB官网-工具下载](https://docs.pingcap.com/zh/tidb/stable/download-ecosystem-tools#dumpling)
3. [B站-yi888long对dumpling的讲解：https://www.bilibili.com/video/BV1kK4y1Z7tE?from=search&seid=8438422389068483544](https://www.bilibili.com/video/BV1kK4y1Z7tE?from=search&seid=8438422389068483544)
4. [B站-【High Performance TiDB】Lesson 12 生态工具优化](https://www.bilibili.com/video/BV1D5411L7z5)
