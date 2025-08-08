---
title: 解析慢日志
description: 解析慢日志
---

# 解析慢日志

使用 `tihc tools slowlog` 命令解析 TiDB 集群的慢查询日志文件，并以异步的方式导入任意与 MySQL 兼容的数据库中以便分析。

## 使用场景

在分析 TiDB 集群性能问题时，慢查询日志（slow log）是分析性能问题的重要数据来源。通常我们可以通过以下方式分析慢查询，使用 [TiDB Dashboard](https://docs.pingcap.com/zh/tidb/v7.5/dashboard-slow-query/) 进行在线分析。

![TiDB Dashboard](https://docs-download.pingcap.com/media/images/docs-cn/dashboard/dashboard-slow-queries-list1-v620.png)


但类似以下场景中，我们需要一种更灵活的分析方式：
- 无法访问 Dashboard
- 无法连接数据库查询 [information_schema.cluster_slow_query](https://docs.pingcap.com/zh/tidb/v7.5/information-schema-slow-query/#cluster_slow_query-table)
- 需要对历史数据进行离线分析
- **需要进行复杂的统计分析（如：分析某类 Slow SQL 的时间分布）**

`tihc tools slowlog` 命令可以将慢查询日志解析并导入到数据库中，支持使用 SQL 进行灵活的查询和统计分析。


## 使用方法

1. 准备 TiDB 集群

```bash
aric@MacBook ~ % curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh

aric@MacBook ~ % source ${your_shell_profile}

aric@MacBook ~ % tiup playground
🎉 TiDB Playground Cluster is started, enjoy!

Connect TiDB:    mysql --comments --host 127.0.0.1 --port 4000 -u root
TiDB Dashboard:  http://127.0.0.1:2379/dashboard
Grafana:         http://127.0.0.1:3000

```

2. 确定慢查询日志位置

```bash
aric@MacBook tidb_slow_query-2025-03 % cd /Downloads/tidb_slow_query-2025-03
aric@MacBook tidb_slow_query-2025-03 % ll
total 821464
-rw-r--r--@ 1 aric  staff   38140064  3 27 15:52 tidb.log
-rw-r--r--@ 1 aric  staff  314572718  3 26 00:57 tidb_slow_query-2025-03-25T16-57-07.979.log
-rw-r--r--@ 1 aric  staff   67874170  4  7 17:27 tidb_slow_query.log

```


3. 解析慢日志文件入表

```bash
aric@MacBook tidb_slow_query-2025-03 % tihc tools slowlog \
    --host 127.0.0.1:4000 \
    --log-dir /Downloads/tidb_slow_query-2025-03 \
    --pattern "tidb_.*.log"

==================================================
Command: slowlog
Status: Success
Duration: 15.974513708s
==================================================
```

4. 检查导入结果
```sql
aric@MacBook Downloads % mysql --comments --host 127.0.0.1 --port 4000 -u root                         

mysql> use tihc

mysql> show tables;
+--------------------+
| Tables_in_tihc     |
+--------------------+
| CLUSTER_SLOW_QUERY |
+--------------------+
1 row in set (0.00 sec)

mysql> select count(*) from CLUSTER_SLOW_QUERY;
+----------+
| count(*) |
+----------+
|    88522 |
+----------+
1 row in set (0.03 sec)
```

5. 分析慢查询日志
可以看到 Digest = '12aee6550cdb84e9b42b0bdafff971ed4f4917faa7509129c56a0341fc127050' 的 SQL 在 2025-03-26 21:00:00 ～ 2025-03-26 21:00:00 出现最多，查询也最慢。

```sql
mysql> SELECT 
    DATE_FORMAT(Time, '%Y-%m-%d %H:00:00') as hour_time,
    COUNT(*) as frequency,
    AVG(Query_time) as avg_query_time,
    MAX(Query_time) as max_query_time,
    MIN(LEFT(Query, 20)) as query_sample
FROM tihc.CLUSTER_SLOW_QUERY 
WHERE 
    Digest = '12aee6550cdb84e9b42b0bdafff971ed4f4917faa7509129c56a0341fc127050'
GROUP BY 
    DATE_FORMAT(Time, '%Y-%m-%d %H:00:00')
ORDER BY 
    hour_time ASC;

+---------------------+-----------+---------------------+----------------+----------------------+
| hour_time           | frequency | avg_query_time      | max_query_time | query_sample         |
+---------------------+-----------+---------------------+----------------+----------------------+
| 2025-03-18 21:00:00 |        19 |  0.4493804775789474 |    0.606918439 | select user_id,base_ |
| 2025-03-19 18:00:00 |         4 |          0.32581528 |    0.338701305 | select user_id,base_ |
| 2025-03-19 21:00:00 |         5 |        0.3377161814 |     0.34657984 | select user_id,base_ |
| 2025-03-20 02:00:00 |         3 |          0.33664294 |    0.355553451 | select user_id,base_ |
| 2025-03-20 13:00:00 |         1 |         0.314235047 |    0.314235047 | select user_id,base_ |
| 2025-03-20 18:00:00 |         1 |          0.47384816 |     0.47384816 | select user_id,base_ |
| 2025-03-20 23:00:00 |         2 |         0.344667988 |    0.360696473 | select user_id,base_ |
| 2025-03-22 15:00:00 |         1 |         0.325766261 |    0.325766261 | select user_id,base_ |
| 2025-03-22 19:00:00 |         1 |         0.364963524 |    0.364963524 | select user_id,base_ |
| 2025-03-24 11:00:00 |         6 | 0.35267484299999996 |    0.387675187 | select user_id,base_ |
| 2025-03-25 15:00:00 |         5 |  0.5252397500000001 |    0.550156766 | select user_id,base_ |
| 2025-03-26 10:00:00 |         1 |         0.303821168 |    0.303821168 | select user_id,base_ |
| 2025-03-26 15:00:00 |        19 |  2.3894580074210525 |    3.486571348 | select user_id,base_ |
| 2025-03-26 16:00:00 |        12 |  1.6510478335833334 |    1.736003024 | select user_id,base_ |
| 2025-03-26 17:00:00 |        24 |  0.7259553074999999 |    1.322673489 | select user_id,base_ |
| 2025-03-26 18:00:00 |        22 |  1.9133352314545455 |    3.009928439 | select user_id,base_ |
| 2025-03-26 19:00:00 |        12 | 0.35154566491666667 |    0.505610509 | select user_id,base_ |
| 2025-03-26 20:00:00 |         9 |  2.3434320862222227 |    2.374194282 | select user_id,base_ |
| 2025-03-26 21:00:00 |        96 |  1.9793197923125003 |    5.519375406 | select user_id,base_ |
| 2025-03-26 23:00:00 |        39 |  1.4582763911025642 |    2.269301483 | select user_id,base_ |
| 2025-03-27 00:00:00 |        34 |  0.8496621455294118 |    1.047704387 | select user_id,base_ |
| 2025-03-27 01:00:00 |        16 |     0.8533504235625 |    2.043561618 | select user_id,base_ |
| 2025-03-27 02:00:00 |        13 |  1.5850548099230768 |      1.6326255 | select user_id,base_ |
| 2025-03-27 03:00:00 |        40 |  1.6741900960500005 |    1.825635187 | select user_id,base_ |
| 2025-03-27 05:00:00 |        29 |  1.4251187663793108 |    1.882324567 | select user_id,base_ |
| 2025-03-27 06:00:00 |        12 |  0.5653918619166668 |    0.602165939 | select user_id,base_ |
| 2025-03-27 07:00:00 |        25 |  0.8880253696799998 |    1.409791623 | select user_id,base_ |
| 2025-03-27 13:00:00 |        12 |  0.6974716397499999 |    0.749698881 | select user_id,base_ |
| 2025-03-27 14:00:00 |        15 |  0.8890294175333332 |    0.939996461 | select user_id,base_ |
| 2025-03-27 15:00:00 |        54 |  1.9239673954629628 |    2.684070904 | select user_id,base_ |
+---------------------+-----------+---------------------+----------------+----------------------+
30 rows in set (0.09 sec)
```

## 主要选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-a, --host <HOST:PORT>` | TiDB 服务器地址，例如：127.0.0.1:4000 | - |
| `-b, --batch-size <BATCH_SIZE>` | 每批处理的记录数量 | 64 |
| `-d, --database <DATABASE>` | 导入慢查询数据的目标数据库名 | tihc |
| `-D, --log-dir <DIR>` | TiDB 慢查询日志文件所在目录 | - |
| `-p, --password <PASSWORD>` | TiDB 数据库密码 | "" |
| `-u, --user <USER>` | TiDB 数据库用户名 | root |
| `-t, --pattern <PATTERN>` | 慢查询日志文件名匹配模式，例如："tidb-slow*.log" | - |
| `--timezone <TIMEZONE>` | 你所在的时区 (如：UTC+8)，用于确保导入数据的时间与日志文件中时间的**字面值**一致 | UTC |
| `-l, --log-file <LOG_FILE>` | 日志文件路径 | tihc_started_at_*.log |
| `-L, --log-level <LOG_LEVEL>` | 日志级别（trace、debug、info、warn、error） | info |



## CLUSTER_SLOW_QUERY

tihc.CLUSTER_SLOW_QUERY 与 TiDB 慢查询日志文件的字段一一对应， **仅缺少 INSTANCE 字段，因为 slow log 中没有记录该值**。

1. TiDB 慢日志介绍，请参考[官方介绍](https://docs.pingcap.com/zh/tidb/v7.5/identify-slow-queries)
2. TiDB 的 CLUSTER_SLOW_QUERY，请参考[官方介绍](https://docs.pingcap.com/zh/tidb/stable/information-schema-slow-query/#cluster_slow_query-table)