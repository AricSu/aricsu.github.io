# Macbook M1 体验 Operator 部署 DM

> **该文档已经发布，即从 “[论坛-技术随笔]” 中移出，原文档变为后期维护，可在 [原文档](http://forum.dbnest.net/t/topic/18) 中提出您对文档的建议。**

## 一、安装并配置 MySQL

1. 寻找 mysql 配置，我选择 `/opt/homebrew/etc/my.cnf`，将 binlog 配置信息填入。
  
    ```shell
    jan@Jan-M1-Pro tidb-config % brew install mysql

    jan@Jan-M1-Pro tidb-config % mysql --help --verbose | grep my.cnf
                          order of preference, my.cnf, $MYSQL_TCP_PORT,
    /etc/my.cnf /etc/mysql/my.cnf /opt/homebrew/etc/my.cnf ~/.my.cnf 

    jan@Jan-M1-Pro tidb-config % vim /opt/homebrew/etc/my.cnf  

    [mysqld]
    ......
    log_bin = mysql-bin #开启binlog
    binlog_format = ROW #选择row模式
    server_id = 1

    jan@Jan-M1-Pro tidb-config % sudo chown _mysql:_mysql /Users/jan/Database/k8s/data_tidb/mysql-binlog
    
    jan@Jan-M1-Pro tidb-config % brew services restart mysql
    
    jan@Jan-M1-Pro tidb-config % brew services list |grep mysql
    mysql         started         jan  ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
    ```

2. 开启 binlog 并配置单独路径

    ```sql
    mysql> show variables like '%log_bin%';
    +---------------------------------+------------------------------------------------------+
    | Variable_name                   | Value                                                |
    +---------------------------------+------------------------------------------------------+
    | log_bin                         | ON                                                   |
    | log_bin_basename                | /opt/homebrew/var/mysql/mysql-bin                    |
    | log_bin_index                   | /Users/jan/Database/k8s/data_tidb/mysql-binlog.index |
    | log_bin_trust_function_creators | OFF                                                  |
    | log_bin_use_v1_row_events       | OFF                                                  |
    | sql_log_bin                     | ON                                                   |
    +---------------------------------+------------------------------------------------------+
    
    mysql> show master status;
    +------------------+----------+--------------+------------------+-------------------+
    | File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
    +------------------+----------+--------------+------------------+-------------------+
    | mysql-bin.000008 |      157 |              |                  |                   |
    +------------------+----------+--------------+------------------+-------------------+
    1 row in set (0.01 sec)
    ```

## 二、通过 TiDB Operator 配置 DM

1. [TiDB on kubernetes 官方文档](https://docs.pingcap.com/zh/tidb-in-kubernetes/stable/deploy-tidb-dm#%E5%9C%A8-kubernetes-%E4%B8%8A%E9%83%A8%E7%BD%B2-dm)写的很详细，按照步骤部署不会有太大的问题。

    > 适配自己部署环境的变量修改

    | 变量名 | 变量值 | 备注 |
    | - | - | - |
    | name  | jan-dm | DM 集群名称 |
    | namespace | tidb-cluster | 命名空间，与 TiDB Cluster 在一个空间下 |
    | storageSize | 10Gi | 存储大小 |

2. 部署 DM Master

    ```shell
    jan@Jan-M1-Pro tidb-config % less tidb-dm-master.yaml

    apiVersion: pingcap.com/v1alpha1
    kind: DMCluster
    metadata:
    name: jan-dm
    namespace: tidb-cluster
    spec:
    version: v6.5.0
    configUpdateStrategy: RollingUpdate
    pvReclaimPolicy: Retain
    discovery: {}
    master:
    baseImage: pingcap/dm
    maxFailoverCount: 0
    imagePullPolicy: IfNotPresent
    service:
    type: NodePort
    # 需要将 DM-master service 暴露在一个固定的 NodePort 时配置
    # masterNodePort: 30020
    replicas: 1
    storageSize: "10Gi"
    requests:
    cpu: 1
    config: |
    rpc-timeout = "40s"

    jan@Jan-M1-Pro tidb-config % kubectl apply -f tidb-dm-master.yaml -n tidb-cluster
    ```

3. 部署 DM Worker

    ```shell
    jan@Jan-M1-Pro tidb-config % less tidb-dm-worker.yaml

    apiVersion: pingcap.com/v1alpha1
    kind: DMCluster
    metadata:
    name: jan-dm
    namespace: tidb-cluster
    spec:
    version: v6.5.0
    configUpdateStrategy: RollingUpdate
    pvReclaimPolicy: Retain
    discovery: {}
    worker:
    baseImage: pingcap/dm
    maxFailoverCount: 0
    replicas: 1
    storageSize: "20Gi"
    requests:
    cpu: 1
    config: |
    keepalive-ttl = 15
    ```

4. 官方文档没有介绍整合 DM 监控的方法，从 [tidb-operator github repo](https://github.com/pingcap/tidb-operator/pull/3528) 上找到了相关描述，下述代码块是实际操作步骤。

    ```shell
    jan@Jan-M1-Pro tidb-config % vim tidb-monitor.yaml

    # 在之前部署 TiDB Cluster 的 Monitor 的部署文件（tidb-monitor.yaml）中追加下述内容 
    spec:
    ......
    dm:
        clusters:
        - name: basicdm
        initializer:
        baseImage: pingcap/dm-monitor-initializer
        version: v2.0.0
    ```

5. 检查 DM pod 状态和监控

    ```shell
    jan@Jan-M1-Pro tidb-config % kubectl get pod -n tidb-cluster | grep dm
    jan-dm-dm-discovery-5c84866d6c-cwcx6   1/1     Running     0          14d
    jan-dm-dm-master-0                     1/1     Running     0          14d
    jan-dm-dm-worker-0                     1/1     Running     0          14d
    ```

## 三、配置任务

1. 部署 DM Master 和 Worker 后，需要进入 Master pod 内部使用 ctl 创建同步任务。
2. 注意：这里 host 使用 `host.docker.internal` 是因为需要在 k8s 内部访问 MacBook 本地通过 brew 部署的 MySQL，相当于配置了 `127.0.0.1`。

    ```shell
    jan@Jan-M1-Pro tidb-config % kubectl exec -it jan-dm-dm-master-0 -n tidb-cluster -- sh

    / # ls |grep dmctl
    dmctl

    /mkdir conf & cd conf
    /conf # vim source1.yaml

    source-id: "mysql-replica-01"
    enable-gtid: false
    from:
    host: "host.docker.internal"
    user: "root"
    password: ""
    port: 3306

    /conf # ../dmctl --master-addr jan-dm-dm-master-0:8261 operate-source create  source1.yaml
    {
        "result": true,
        "msg": "",
        "sources": [
            {
                "result": true,
                "msg": "",
                "source": "mysql-replica-01",
                "worker": "jan-dm-dm-worker-0"
            }
        ]
    }
    ```

## 四、准备 DM loader PV

```shell

jan@Jan-M1-Pro ～ % vim tidb-dm-loader-pv.yaml

apiVersion: v1
kind: PersistentVolume
metadata:
    name: dm-loader-dir
spec:
    capacity:
    storage: 5Gi
    accessModes:
    - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: local-storage
    local:
    path: /Users/jan/Database/k8s/data_tidb/loader-mysql-dir
    nodeAffinity:
    required:
        nodeSelectorTerms:
        - matchExpressions:
        - key: kubernetes.io/hostname
            operator: In
            values:
            - localhost

jan@Jan-M1-Pro tidb-config % kubectl apply -f tidb-dm-loader-pv.yaml

jan@Jan-M1-Pro tidb-config % kubectl get pv |grep dm-loader-dir
dm-loader-dir                              5Gi        RWO            Retain           Available                                               local-storage
```

## 五、MySQL 造数据

```shell
jan@Jan-M1-Pro tidb-config % brew instal sysbench

jan@Jan-M1-Pro tidb-config % sysbench oltp_read_write --mysql-host=127.0.0.1 \
    --mysql-port=3306 --mysql-db=test \
    --mysql-user=root --mysql-password= \
    --table_size=5000 --tables=10  --events=10000 \
    --report-interval=10 prepare

Creating table 'sbtest1'...
Inserting 5000 records into 'sbtest1'
Creating a secondary index on 'sbtest1'...
...
...
Creating table 'sbtest10'...
Inserting 5000 records into 'sbtest10'
Creating a secondary index on 'sbtest10'...
```

## 六、导入 DM 数据

从 `sbtest1-sbtest10` 表结构单独在 TiDB 中手动创建，否则会出现 COLLATE=utf8mb4_0900_ai_ci 不兼容问题。

```sql
CREATE TABLE `sbtest1` (
CREATE TABLE `sbtest2` (
......
/*!40101 SET NAMES binary*/;
CREATE TABLE `sbtest10` (
  `id` int NOT NULL AUTO_INCREMENT,
  `k` int NOT NULL DEFAULT '0',
  `c` char(120) NOT NULL DEFAULT '',
  `pad` char(60) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `k_6` (`k`)
) ENGINE=InnoDB AUTO_INCREMENT=5001 DEFAULT CHARSET=utf8mb4;
```

## 七、启动同步

1. 如果没有手动建表，导致 utf8mb4_0900_ai_ci 不兼容问题，需要使用 `--remove-meta` 重启同步任务，否则可不带该参数。
2. 非预期同步状态

    ```yaml
    /conf # ../dmctl --master-addr jan-dm-dm-master-0:8261 start-task ./task.yaml --remove-meta
    {
        "result": true,
        "msg": "",
        "sources": [
            {
                "result": true,
                "msg": "",
                "source": "mysql-replica-01",
                "worker": "jan-dm-dm-worker-0"
            }
        ],
        "checkResult": "fail to check synchronization configuration with type: no errors but some warnings
            detail: {
                    "results": [
                            {
                                    "id": 1,
                                    "name": "mysql_version",
                                    "desc": "check whether mysql version is satisfied",
                                    "state": "warn",
                                    "errors": [
                                            {
                                                    "severity": "warn",
                                                    "short_error": "version suggested earlier than 8.0.0 but got 8.0.32"
                                            }
                                    ],
                                    "instruction": "It is recommended that you select a database version that meets the requirements before performing data migration. Otherwise data inconsistency or task exceptions might occur.",
                                    "extra": "address of db instance - host.docker.internal:3306"
                            },
                            {
                                    "id": 9,
                                    "name": "table structure compatibility check",
                                    "desc": "check compatibility of table structure",
                                    "state": "warn",
                                    "errors": [
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest9` collation is not same, upstream: (sbtest9 utf8mb4_0900_ai_ci), downstream: (sbtest9 utf8mb4_bin)"
                                            },
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest5` collation is not same, upstream: (sbtest5 utf8mb4_0900_ai_ci), downstream: (sbtest5 utf8mb4_bin)"
                                            },
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest7` collation is not same, upstream: (sbtest7 utf8mb4_0900_ai_ci), downstream: (sbtest7 utf8mb4_bin)"
                                            },
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest3` collation is not same, upstream: (sbtest3 utf8mb4_0900_ai_ci), downstream: (sbtest3 utf8mb4_bin)"
                                            },
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest8` collation is not same, upstream: (sbtest8 utf8mb4_0900_ai_ci), downstream: (sbtest8 utf8mb4_bin)"
                                            },
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest10` collation is not same, upstream: (sbtest10 utf8mb4_0900_ai_ci), downstream: (sbtest10 utf8mb4_bin)"
                                            },
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest2` collation is not same, upstream: (sbtest2 utf8mb4_0900_ai_ci), downstream: (sbtest2 utf8mb4_bin)"
                                            },
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest6` collation is not same, upstream: (sbtest6 utf8mb4_0900_ai_ci), downstream: (sbtest6 utf8mb4_bin)"
                                            },
                                            {
                                                    "severity": "warn",
                                                    "short_error": "table `test`.`sbtest1` collation is not same, upstream: (sbtest1 utf8mb4_0900_ai_ci), downstream: (sbtest1 utf8mb4_bin)"
                                            }
                                    ],
                                    "instruction": "Ensure that you use the same collations for both upstream and downstream databases. Otherwise the query results from the two databases might be inconsistent.; "
                            }
                    ],
                    "summary": {
                            "passed": true,
                            "total": 10,
                            "successful": 8,
                            "failed": 0,
                            "warning": 2
                    }
            }"
    }
    ```

3. 预期同步状态

    ```yaml
    /conf # ../dmctl --master-addr jan-dm-dm-master-0:8261 query-status local-mysql-test
    {
        "result": true,
        "msg": "",
        "sources": [
            {
                "result": true,
                "msg": "",
                "sourceStatus": {
                    "source": "mysql-replica-01",
                    "worker": "jan-dm-dm-worker-0",
                    "result": null,
                    "relayStatus": null
                },
                "subTaskStatus": [
                    {
                        "name": "local-mysql-test",
                        "stage": "Running",
                        "unit": "Sync",
                        "result": null,
                        "unresolvedDDLLockID": "",
                        "sync": {
                            "totalEvents": "0",
                            "totalTps": "0",
                            "recentTps": "0",
                            "masterBinlog": "(mysql-bin.000009, 9552368)",
                            "masterBinlogGtid": "",
                            "syncerBinlog": "(mysql-bin.000009, 9552368)",
                            "syncerBinlogGtid": "",
                            "blockingDDLs": [
                            ],
                            "unresolvedGroups": [
                            ],
                            "synced": true,
                            "binlogType": "remote",
                            "secondsBehindMaster": "0",
                            "blockDDLOwner": "",
                            "conflictMsg": "",
                            "totalRows": "0",
                            "totalRps": "0",
                            "recentRps": "0"
                        },
                        "validation": null
                    }
                ]
            }
        ]
    }
    ```
