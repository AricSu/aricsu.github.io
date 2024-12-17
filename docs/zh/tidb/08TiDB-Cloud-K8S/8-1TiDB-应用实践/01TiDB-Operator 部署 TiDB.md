# Macbook M1 体验 Operator 部署 TiDB Cluster

> **该文档已经发布，即从 “[论坛-技术随笔]” 中移出，原文档变为后期维护，可在 [原文档](http://forum.dbnest.net/t/topic/21) 中提出您对文档的建议。**

## 一、内容前导

1. 个人觉得 TiDB Operator 的故障自愈，加持 TiDB 本身是具有 cloud native 属性的数据库产品，可以说是绝配，也是实现真正 “云” 概念的可行之路，否则 TiDB 仅能实现一定程度的自愈，并不完美。因此，决定在笔记本上搭建一套 tidb cluster on k8s 实验环境。

2. 由于本人使用的是 macbook pro m1 pro，m1 本身是 arm 芯片，经实验测试发现，在部署上 TiDB 是支持的，即使不使用 [arm64 镜像 安装指引](https://docs.pingcap.com/zh/tidb-in-kubernetes/dev/deploy-cluster-on-arm64)。

3. 在此之前，需要在笔记本上安装 Docker Desktop 及 kubernetes，均是界面操作不展开讲解，详情可参考 [文章 : 安装docker与k8s（macbook M1) - 知乎](https://zhuanlan.zhihu.com/p/381569200)。

## 二、存储准备

1. 如果不使用自建 pv，可以忽略以下创建步骤，因为 tidb-cluster 对应的 pvc 会使用 hostPath 方式创建 pv。
2. 如果想要自建 pv，除 apply 以下 pv 外，还要更改 storage

  ```yaml
  jan@Jan-M1-Pro tidb-config % cat tidb-pvs.yaml
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: local-ssd
  spec:
    capacity:
      storage: 5Gi
    accessModes:
      - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: local-storage
    local:
      path: /Users/jan/Database/k8s/data_tidb/ssd
    nodeAffinity:
      required:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
            - localhost
  ---
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: local-sharedssd
  spec:
    capacity:
      storage: 5Gi
    accessModes:
      - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: local-storage
    local:
      path: /Users/jan/Database/k8s/data_tidb/sharedssd
    nodeAffinity:
      required:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
            - localhost
  ---
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: local-backup
  spec:
    capacity:
      storage: 5Gi
    accessModes:
      - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: local-storage
    local:
      path: /Users/jan/Database/k8s/data_tidb/backup
    nodeAffinity:
      required:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
            - localhost
  ---
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: local-monitoring
  spec:
    capacity:
      storage: 5Gi
    accessModes:
      - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    storageClassName: local-storage
    local:
      path: /Users/jan/Database/k8s/data_tidb/monitoring
    nodeAffinity:
      required:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
            - localhost
  ```

## 三、部署指引

1. TiDB Operator 步骤非常详尽，在 “快速上手” 章节大致存在如下几步：**部署 TiDB Operator、 部署 TiDB 集群和监控、 连接 TiDB 集群** ，便可在 macbook m1 上拉起一个 tidb cluster on k8s。
2. 注意：不使用 arm64 镜像也是可以的，在本人电脑上可以正常运行。
3. 由于网络不是特别好，所以我会先讲对应的 yaml 通过 wget 下载到本地再进行 apply，步骤如下：

    ```shell
    kubectl create -f crd.yaml
    
    helm repo add pingcap https://charts.pingcap.org/
    
    kubectl create namespace tidb-admin
    
    helm install --namespace tidb-admin tidb-operator pingcap/tidb-operator --version v1.4.0
    
    kubectl get pods --namespace tidb-admin -l app.kubernetes.io/instance=tidb-operator
    
    kubectl create namespace tidb-cluster
    
    kubectl -n tidb-cluster apply -f tidb-cluster.yaml
    
    kubectl -n tidb-cluster apply -f tidb-dashboard.yaml
    
    kubectl -n tidb-cluster apply -f tidb-monitor.yaml
    
    kubectl get pod -n tidb-cluster

    NAME                                   READY   STATUS    RESTARTS   AGE
    basic-discovery-5db6c75657-h4c2p       1/1     Running   0          27h
    basic-monitor-0                        4/4     Running   0          23h
    basic-pd-0                             1/1     Running   0          27h
    basic-tidb-0                           2/2     Running   0          27h
    basic-tikv-0                           1/1     Running   0          27h
    ```
