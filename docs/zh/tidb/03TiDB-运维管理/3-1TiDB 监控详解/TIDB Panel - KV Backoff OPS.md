1. 面板简介

   该面板的统计位于下图的 tikv client 模块，如图所示，主要用于统计集群层面 TiDB-Server 与 TiKV-Server 交互过程中，不同“重试”类型的频次。

图片
   在 TiDB 的分布式交互中，"重试" 无法根本上完全避免，与其完全避免，采用一种更为合理的解决方案（例如易于理解和实现的优点）更为常见。实现上借鉴了 OCC （乐观并发控制）算法为冲突增加睡眠时间，通过引入睡眠时间来减少冲突的发生频次，从而降低争用。

图片
   该面板有助于分析在性能问题发生时是否因“重试”导致性能下降，并且结合不同的“重试类型”可以进一步关联上下文分析问题的根源。

2. 面板位置

   Cluster-TiDB --> KV Errors --> KV Backoff OPS

图片

3. 面板详情

   重试类型：

tikvRPC

tiflashRPC

pdRPC

tikvLockFast

txnLock

regionMiss

regionScheduling

serverBusy

tikvDiskFull

regionRecoveryInProgress

staleCommand

isWitness


1. tikvRPC, tiflashRPC

   这类重试通常伴随出现在TiDB日志中，需要结合上下文分析。日志中的 "send tiflash request error" 和 "tiflash server timeout" 表示tiflash可能发生了不可用；而 "send tikv request error" 和 "tikv server timeout" 表示tikv可能不可用。

2. pdRPC

   这种重试可能发生在 RegionCache、StoreCache、KvStore 和 Split & ScatterRegion 等调用过程中。通常是在与PD通信时发生错误：

   RegionCache：TiDB-Server 内部维护缓存，用于快速定位和访问 Region。如果 RegionCache 中的缓存信息过时，会通过 PD 获取最新的Region信息。

图片
       如果 RegionCache 发现自己缓存的 Region 是过旧的会首先从 PD 获取并更新，因为 PD 维护着全局的 Region 信息。因此，调用如果发生错误会归属到 pdRPC 里面。

       在 tidb.log 中通常会出现对应关键字的日志。

failed to decode region range key, key

loadRegion from PD failed, key

region not found for key

receive Region with no available peer

failed to decode region range key, regionID

loadRegion from PD failed, regionID

region not found for regionID

receive Region with no available peer

failed to decode region range key, limit

scanRegion from PD failed, limit

PD returned no region, limit

PD returned regions have gaps, limit

failed to decode region range key, range num

batchScanRegion from PD failed, range num


   RegionCache 也会维护 Store(TiKV) 的信息，如果请求 PD 发生失败也会重试，可在 tidb.log 中发现下述关键字 loadStore from PD failed, id。

   KvStore : 每个事务都会过 KvStore，有可能会在这里获取 TSO（每次获取一批 TSO），如果获取失败会在 tidb.log 中出现 “get timestamp failed”，“get minimum timestamp failed”。

   Split &ScatterRegion ：TiDB 有很多 Split Region 的地方，由调度自动触发或手动触发，先 Split 一个 Region 为 2 个，再将 Region 调度到不同 Store 上以解决热点问题。主要请求发给 PD 去调度，因此也归类到 pdRPC 类型上。通常在 tidb.log 中会伴有下述日志关键字，“start scatter region”

batch split regions complete

start scatter region

batch split regions, scatter region complete

batch split regions, scatter region failed


3. tikvLockFast, txnLock

   此类重试主要由锁机制引发，是常见的告警类型，本质上无论 “读写冲突” 或 “写写冲突” 都是由事务完成的不够快造成的，遇到该类问题还是建议更细节分析不够快的“根因”，并针对性的解决。

   tikvLockFast：代表出现了读写冲突, 如下图所示。

图片


   txnLock：代表出现了写写冲突，事务在 Prewrite 阶段的第一步就会检查是否有写写冲突，第二步会检查目标 key 是否已经被另一个事务上锁。当检测到该 key 被 lock 后，会自动进行 backoff 重试并记录为 txnLock。

4. regionMiss, regionScheduling

   regionMiss : 此重试由 TiDB-Server 发往 TiKV-Server 过程中, Region Cache 中缓存着错误的 region 信息导致， 因为 Region 已经被调度走了。可能在 splitRegion, deleteRange, 2PC Txn, 清锁, 加锁, 清事物, piplineFlush, prewrite, scanRegion, snapshot 过程中遭遇。

   regionScheduling : 此类重试与 regionMiss 类似，但更多特指此时 Region 正在选举或正在调度，所以 tidb.log 会看到关键字 "read index not ready, ctx", "region is merging, ctx", "no leader, ctx"。

5. regionRecoveryInProgress

  此类重试，特指集群正在进行 Online recovery ，拒绝写入以避免潜在问题发生的重试。

6. 顾名思义 serverBusy, tikvDiskFull

   serverBusy : 可以分为 tiflashServerBusy 和 tikvServerBusy，

7. staleCommand

   StaleCommand : 表示请求发送给了旧 Region Leader，且其 Term 已更改，无法知道上一个请求是否已提交，需要重试请求。

8. isWitness

   isWitness : 这是TiKV的一项未正式发布的功能。在云环境下，为了保证99.99%的可用性，使用TiKV的Raft三副本会浪费资源。该功能通过引入见证（Witness）角色来提高资源利用率，重试通常发生在相关功能下。



4. 参考文献

Exponential Backoff And Jitter | AWS Architecture Blog : https://aws.amazon.com/cn/blogs/architecture/exponential-backoff-and-jitter

TiDB 锁冲突问题处理 : https://docs.pingcap.com/zh/tidb/stable/troubleshoot-lock-conflicts

Github client-go repo : https://github.com/tikv/client-go

witness feature : https://github.com/tikv/tikv/issues/12876