---
title: Macbook M1 体验 Operator 部署 TiCDC
description: Macbook M1 体验 Operator 部署 TiCDC
---

# Macbook M1 体验 Operator 部署 TiCDC

> **该文档已经发布，即从 “[论坛-技术随笔]” 中移出，原文档变为后期维护，可在 [原文档](http://forum.dbnest.net/t/topic/26) 中提出您对文档的建议。**

## 一、扩容 TiCDC POD

1. TiCDC 采用直接在已部署的 k8s 上的 TiDB Cluster 中扩容 POD 的方式部署，如不熟悉部署 TiDB 请参考 [**"Macbook M1 体验 Operator 部署 TiDB Cluster"**](http://www.dbnest.net/zh/tidb/08TiDB-Cloud-K8S/8-1TiDB-%E5%BA%94%E7%94%A8%E5%AE%9E%E8%B7%B5/01TiDB-Operator%20%E9%83%A8%E7%BD%B2%20TiDB.html)。
2. 该步骤参考 [TiDB 官网-在 Kubernetes 上部署 TiCDC](https://docs.pingcap.com/zh/tidb-in-kubernetes/stable/deploy-ticdc#%E5%9C%A8-kubernetes-%E4%B8%8A%E9%83%A8%E7%BD%B2-ticdc)，下述为操作步骤。

## 二、部署下游 MySQL

本次选择 MySQL 作为下游，直接在 k8s 上部署一个 MySQL，步骤如下：

```shell
jan@Jan-M1-Pro tidb-config % vim mysql.yaml
apiVersion: v1
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: ticdc-to-mysql-pvc
  namespace: tidb-cluster
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: ticdc-to-mysql-svc
  namespace: tidb-cluster
spec:
  ports:
  - name: mysql
    port: 3306
    targetPort: 3306
  selector:
    app: mysql
  clusterIP: None

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ticdc-to-mysql-deploy
  namespace: tidb-cluster
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          imagePullPolicy: IfNotPresent
          env:
          - name: MYSQL_ROOT_PASSWORD
            value: "123123"
          ports:
            - containerPort: 3306
          volumeMounts:
            - name: mysql-pvc
              mountPath: /var/lib/mysql
      volumes:
        - name: mysql-pvc
          persistentVolumeClaim:
            claimName: ticdc-to-mysql-pvc

jan@Jan-M1-Pro tidb-config % kubectl apply -f mysql.yaml -n tidb-cluster

jan@Jan-M1-Pro tidb-config % kubectl get pod -A |grep ticdc
tidb-cluster   ticdc-to-mysql-deploy-85d5d498bc-wwcvb   1/1     Running     0                  28s

jan@Jan-M1-Pro tidb-config % kubectl get pv|grep ticdc
pvc-00bdbc50-2be7-4525-8626-dc64ff8c1ef6   5Gi        RWX            Delete           Bound    tidb-cluster/ticdc-to-mysql-pvc                       hostpath                 38s
```

## 三、扩容 TiCDC POD

```shell
jan@Jan-M1-Pro tidb-config % kubectl get tc -n tidb-cluster
NAME    READY   PD                  STORAGE   READY   DESIRE   TIKV                  STORAGE   READY   DESIRE   TIDB                  READY   DESIRE   AGE
basic   True    pingcap/pd:v6.5.0   1Gi       1       1        pingcap/tikv:v6.5.0   1Gi       1       1        pingcap/tidb:v6.5.0   1       1        14d

jan@Jan-M1-Pro tidb-config % kubectl edit tc -n tidb-cluster

spec:
......
  ticdc:
    baseImage: pingcap/ticdc
    replicas: 2
......

jan@Jan-M1-Pro tidb-config % kubectl get pod -A |grep ticdc
tidb-cluster   basic-ticdc-0                            1/1     Running     0                19s
tidb-cluster   basic-ticdc-1                            1/1     Running     0                18s
tidb-cluster   ticdc-to-mysql-deploy-85d5d498bc-wwcvb   1/1     Running     0                7m5s
```

## 四、创建任务

1. 进入部署的 ticdc pod 内部,同步之前 DM 导入的 [test.sbtest1 ~ test.sbtest10](http://www.dbnest.net/zh/tidb/08TiDB-Cloud-K8S/8-1TiDB-%E5%BA%94%E7%94%A8%E5%AE%9E%E8%B7%B5/02TiDB-Operator%20%E9%83%A8%E7%BD%B2%20DM.html).

    ```shell
    jan@Jan-M1-Pro tidb-config % kubectl exec -it basic-ticdc-0 -n tidb-cluster -- sh

    / # ps -ef|grep cdc
        1 root      3h36 /cdc server --addr=0.0.0.0:8301 --advertise-addr=basic-ticdc-0.basic-ticdc-peer.tidb-cluster.svc:8301 --gc-ttl=86400 --log-file= --log-level=info --pd=http://basic-pd:2379
      91 root      0:00 grep cdc

    / # mkdir config & cd config

    / # vim changefeed-test.toml
    [filter]
    rules = ['test.*']

    / # /cdc cli changefeed create --server=http://basic-ticdc-0.basic-ticdc-peer.tidb-cluster.svc:8301 --sink-uri="mysql://root:123123@ticdc-to-mysql-svc:3307/" --changefeed-id="jan
    -task"
    Create changefeed successfully!
    ID: jan-task
    Info: {"upstream_id":7211019554206462790,"namespace":"default","id":"jan-task","sink_uri":"mysql://root:xxxxx@ticdc-to-mysql-svc:3307/","create_time":"2023-03-23T05:00:06.050107131Z","start_ts":440283327592660995,"engine":"unified","config":{"case_sensitive":true,"enable_old_value":true,"force_replicate":false,"ignore_ineligible_table":false,"check_gc_safe_point":true,"enable_sync_point":false,"bdr_mode":false,"sync_point_interval":600000000000,"sync_point_retention":86400000000000,"filter":{"rules":["*.*"],"event_filters":null},"mounter":{"worker_num":16},"sink":{"protocol":"","schema_registry":"","csv":{"delimiter":",","quote":"\"","null":"\\N","include_commit_ts":false},"column_selectors":null,"transaction_atomicity":"none","encoder_concurrency":16,"terminator":"\r\n","date_separator":"none","enable_partition_separator":false},"consistent":{"level":"none","max_log_size":64,"flush_interval":2000,"storage":""}},"state":"normal","creator_version":"v6.5.0"}
    ```

2. 检查 TiCDC 监控及下游是否有正常同步数据即可。

## 五、销毁 TiCDC

1. 删除同步任务

    ```shell
    jan@Jan-M1-Pro tidb-config % kubectl exec -it basic-ticdc-0 -n tidb-cluster -- sh

    / # /cdc cli changefeed remove --server=http://basic-ticdc-0.basic-ticdc-peer.tidb-cluster.svc:8301 --changefeed-id="jan-task"
    ```

2. 删除 TiCDC pod

    ```shell
      jan@Jan-M1-Pro tidb-config % kubectl edit tc -n tidb-cluster
      ......
      ticdc:
        baseImage: pingcap/ticdc
        replicas: 0
      ......

    jan@Jan-M1-Pro tidb-config % kubectl get pod -A |grep ticdc
    ```
