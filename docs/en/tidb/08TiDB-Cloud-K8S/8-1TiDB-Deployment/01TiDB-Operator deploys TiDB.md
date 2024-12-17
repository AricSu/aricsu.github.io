# Deploy TiDB Cluster on the TiDB Operator of Macbook M1

> **This document has been released, which means the original documents's been moved to the period of maintenance. [Please comment anything you want at the topic](http://forum.dbnest.net/t/topic/21).**

## 1. Content guide

1. Personally, I think the fault self-healing of TiDB Operator, and TiDB itself is a database product with cloud native attributes, which can be said to be a perfect match and also a feasible way to realize the real concept of "cloud". Otherwise, TiDB can only achieve a certain degree of self-healing, which is not perfect. Therefore, decided to build a set of tidb cluster on k8s experimental environment on the notebook.

2. As I am using macbook pro m1 pro, m1 itself is an arm chip, the experimental test shows that TiDB supports deployment. Even if you don't use [the arm64 mirror installation guide](https://docs.pingcap.com/zh/tidb-in-kubernetes/dev/deploy-cluster-on-arm64).

3. Before this, Docker Desktop and kubernetes need to be installed on the laptop. The interface operation is not explained, for details, please refer to [Article: Install docker and k8s macbook (M1) - zhihu](https://zhuanlan.zhihu.com/p/381569200).

## 2. Storage preparation

1. If you do not use the self-created pv, skip the following steps because the pvc corresponding to tidb-cluster uses hostPath to create the pv.
2. If you want to build your own PVS, change the storage in addition to applying the following PVS.

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

## 3. Deployment Guidelines

1. The steps of TiDB Operator are very detailed. In the "Getting Started" section, the steps are as follows: **Deploy TiDB Operator, deploy TiDB cluster, monitor and connect TiDB cluster**, you can pull up a tidb cluster on k8s on macbook m1.
2. **Note:** It is OK not to use arm64 mirroring, and it can run normally on my computer.
3. Since the network is not very good, I will first teach the corresponding yaml to download it to the local through wget and then apply. The steps are as follows:

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
