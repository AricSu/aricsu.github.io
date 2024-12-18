# What's TiDB

## Concepts

From it's [website](https://docs.pingcap.com/zh/tidb/stable/overview), we can know TiDB is a database which has different attributes below (scaling, high availability, HTAP, Cloud-native distributed, Compatible with the MySQL):

1. Horizontally scaling out or scaling in easily
2. Financial-grade high availability
3. Real-time HTAP
4. Cloud-native distributed database
5. Compatible with the MySQL 5.7 protocol and MySQL ecosystem

TiDB Cluster, which was basicly composed with component instances of PD-Server, TiDB-Server, TiKV-Server, could be understanded easily in a pic below:
![tidb-architecture-v3.1](https://download.pingcap.com/images/docs-cn/tidb-architecture-v3.1.png)
TiDB-Server is a statusless instance encapsulated etcd, which was used to deal with App connections and compute SQL result;  
TiKV-Server is a status instance encapsulated raft protocol, rocksdb KV engine and so forth, which were used to storage data;  
PD-Server is a status instance, which continously getting data or load info from TiKV heartbeats, aiming for scheduling parts of data to different TiKV-Server.  

## Attributes and effects

1. First of all, `scale-out` and `scale-in` are very easy to implment without any bad effections or just a little bit effects on App.
2. Second, 

All of components transport info on the internet,

## ecosystem
