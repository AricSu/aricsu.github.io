# Deploy DM Cluster on the TiDB Operator of Macbook M1

> **This document has been released, which means the original documents's been moved to the period of maintenance. [Please comment anything you want at the topic](http://forum.dbnest.net/t/topic/18).**

## 1. Install and configure MySQL

1. To find the mysql configuration, I select `/opt/homebrew/etc/my.cnf` and fill in the binlog configuration information.
  
    ```shell
    jan@Jan-M1-Pro tidb-config % brew install mysql

    jan@Jan-M1-Pro tidb-config % mysql --help --verbose | grep my.cnf
                          order of preference, my.cnf, $MYSQL_TCP_PORT,
    /etc/my.cnf /etc/mysql/my.cnf /opt/homebrew/etc/my.cnf ~/.my.cnf 

    jan@Jan-M1-Pro tidb-config % vim /opt/homebrew/etc/my.cnf  

    [mysqld]
    ......
    log_bin = mysql-bin #config binlog
    binlog_format = ROW #select row-mode
    server_id = 1

    jan@Jan-M1-Pro tidb-config % sudo chown _mysql:_mysql /Users/jan/Database/k8s/data_tidb/mysql-binlog
    
    jan@Jan-M1-Pro tidb-config % brew services restart mysql
    
    jan@Jan-M1-Pro tidb-config % brew services list |grep mysql
    mysql         started         jan  ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
    ```

2. Enable binlog and configure an independent path

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

## 2. Configure the DM using TiDB Operator

1. [TiDB on kubernetes  Official document](https://docs.pingcap.com/zh/tidb-in-kubernetes/stable/deploy-tidb-dm#%E5%9C%A8-kubernetes-%E4%B8%8A%E9%83%A8%E7%BD%B2-dm) written in detail, follow the steps to deploy will not be too much of a problem.

    > Modify variables to suit your deployment environment

    | variable name note | variable values | comments |
    | - | - | - |
    | name | jan -dm | DM cluster name |
    | namespace | tidb - cluster | namespace, and tidb cluster under a space
    | storageSize | 10Gi |  |

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
    # When the DM-master service needs to be exposed to a fixed NodePort
    # masterNodePort: 30020
    replicas: 1
    storageSize: "10Gi"
    requests:
    cpu: 1
    config: |
    rpc-timeout = "40s"

    jan@Jan-M1-Pro tidb-config % kubectl apply -f tidb-dm-master.yaml -n tidb-cluster
    ```

3. Deploying DM Worker

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

4. Official document not introduce integrated DM monitoring method, from [tidb-operator github repo](https://github.com/pingcap/tidb-operator/pull/3528) to find the related description, The following code blocks are the actual steps.

    ```shell
    jan@Jan-M1-Pro tidb-config % vim tidb-monitor.yaml

    # Add the following information to the deployment file (tidb-monitor.yaml) of the monitor that previously deployed the TiDB Cluster 
    spec:
    ......
    dm:
        clusters:
        - name: basicdm
        initializer:
        baseImage: pingcap/dm-monitor-initializer
        version: v2.0.0
    ```

5. Check the DM pod status and monitoring

    ```shell
    jan@Jan-M1-Pro tidb-config % kubectl get pod -n tidb-cluster | grep dm
    jan-dm-dm-discovery-5c84866d6c-cwcx6   1/1     Running     0          14d
    jan-dm-dm-master-0                     1/1     Running     0          14d
    jan-dm-dm-worker-0                     1/1     Running     0          14d
    ```

## 3. Configure DM task

1. After the DM Master and Worker are deployed, log in to the Master pod and use the ctl to create synchronization tasks.
2. Note: host uses' host.docker.internal 'because you need to access MySQL locally deployed on the MacBook via brew inside k8s, which is equivalent to configuring `127.0.0.1`.

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

## 4. Prepare DM loader PV

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

## 5. Craete table data on MySQL

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

## Import DM data

Manually create table structures from `sbtest1-sbtest10` separately in TiDB, otherwise COLLATE=utf8mb4_0900_ai_ci is incompatible.

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

## 7. Start task

1. If the table is not manually created and `utf8mb4_0900_ai_ci` is incompatible, you need to use the `--remove-meta` command to restart the synchronization task. Otherwise, this parameter is omitted.
2. The synchronization status is not expected

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

3. The synchronization status is not expected

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
