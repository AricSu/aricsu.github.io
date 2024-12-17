# Deploy TiCDC Cluster on the TiDB Operator of Macbook M1

> **This document has been released, which means the original documents's been moved to the period of maintenance. [Please comment anything you want at the topic](http://forum.dbnest.net/t/topic/26).**

## 1. Summary

1. Add pods to the TiDB Cluster on the deployed k8s. If you are not familiar with deploying TiDB, see [**"Macbook M1 Experience the Operator deploys TiDB Cluster"**](http://www.dbnest.net/zh/tidb/08TiDB-Cloud-K8S/8-1TiDB-%E5%BA%94%E7%94%A8%E5%AE%9E%E8%B7%B5/01TiDB-Operator%20%E9%83%A8%E7%BD%B2%20TiDB.html).
2. For details, see [TiDB website -- Deploy TiCDC on Kubernetes](https://docs.pingcap.com/zh/tidb-in-kubernetes/stable/deploy-ticdc#%E5%9C%A8-kubernetes-%E4%B8%8A%E9%83%A8%E7%BD%B2-ticdc), the following is the procedure.

## 2. Deploy downstream MySQL

This time, MySQL is selected as the downstream, and a MySQL is directly deployed on k8s. The steps are as follows:

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

## 3. Scaling out TiCDC POD

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

## 4. Create changefeed

1. Go to the deployed ticdc pod and synchronize TiDB table data from the DM import [test.sbtest1 ~ test.sbtest10](http://www.dbnest.net/zh/tidb/08TiDB-Cloud-K8S/8-1TiDB-%E5%BA%94%E7%94%A8%E5%AE%9E%E8%B7%B5/02TiDB-Operator%20%E9%83%A8%E7%BD%B2%20DM.html).

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

2. Check whether TiCDC monitoring and downstream data are properly synchronized.

## 5. Destroy TiCDC

1. Delete a synchronization changefeed

    ```shell
    jan@Jan-M1-Pro tidb-config % kubectl exec -it basic-ticdc-0 -n tidb-cluster -- sh

    / # /cdc cli changefeed remove --server=http://basic-ticdc-0.basic-ticdc-peer.tidb-cluster.svc:8301 --changefeed-id="jan-task"
    ```

2. Scaling in TiCDC pods

    ```shell
      jan@Jan-M1-Pro tidb-config % kubectl edit tc -n tidb-cluster
      ......
      ticdc:
        baseImage: pingcap/ticdc
        replicas: 0
      ......

    jan@Jan-M1-Pro tidb-config % kubectl get pod -A |grep ticdc
    ```
