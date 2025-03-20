# 我的 TiDB 笔记简介

## 01TiDB-原理总结

## 02TIDB-部署实践

## 03TiDB-运维管理

## 04TiDB-调优实践

## 05TiDB-生态工具

## 06TiDB-解决方案

## 07TiDB-源码阅读

## 08TiDB-Cloud-K8S

```shell
jan@Jan-M1-Pro tidb-config % kubectl get pod -n tidb-cluster
NAME                                     READY   STATUS      RESTARTS   AGE
basic-discovery-5db6c75657-h4c2p         1/1     Running     0          14d
basic-monitor-0                          4/4     Running     0          14d
basic-pd-0                               1/1     Running     0          14d
basic-ticdc-0                            1/1     Running     0          60m
basic-ticdc-1                            1/1     Running     0          60m
basic-tidb-0                             2/2     Running     0          14d
basic-tikv-0                             1/1     Running     0          14d
jan-dm-dm-discovery-5c84866d6c-cwcx6     1/1     Running     0          14d
jan-dm-dm-master-0                       1/1     Running     0          14d
jan-dm-dm-worker-0                       1/1     Running     0          14d
jan-lightning-tidb-lightning-7ssfc       0/1     Completed   0          23h
ticdc-to-mysql-deploy-85d5d498bc-wwcvb   1/1     Running     0          67m
```
