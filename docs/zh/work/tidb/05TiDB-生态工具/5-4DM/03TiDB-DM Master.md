# TiDB DM Master

## What's DM Master

![DM_Master_Components](../../../../../images/tidb/05TiDB-EcosystematicTools/5-4DM/02-DM_Master_Components.jpeg)

## Etcd

**DM Master高可用性如何工作** : 大多数情况下，这是由于ectd的可用特性，它将所有持久化数据存储在DM集群中。同时，到 [the Election](#election)，只有 DM Master 的领导才能启动组件和 etcd 工作，并且领导还定期检查DM是否有严重的问题，在正确的时间立即执行恢复操作。

## OpenapiHandles

DM 提供 [OpenAPI](https://docs.pingcap.com/tidb/stable/dm-open-api) 来操作/创建任务、Binlog 源等,就像在 dm-ctl 命令中使用它一样,主要由 OpenapiHandler 封装在 DM Master 中实现。当DM Master leader 启动时工作。同时，如果 DM Worker peer 收到 OpenAPI 请求，将请求重定向给leader 处理。

## AgentPool

1. 此组件是在 [此PR](https://github.com/pingcap/dm/pull/157) 中添加的，主要是期待在 dm-master 中添加速率限制和 rpc 客户端管理。虽然，它是整个DM Master组件中的关键组件，但我之所以决定介绍它，是因为它出现在 [Server](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/server.go#L127) 结构体中。

2. 它的主要实现方式是封装 [golang rate.Limit](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/agent_pool.go#L60) 包。

## Election

1. **首先**，它是一个构建在 etcd 基础上实现 leader 选举功能的高可用封装。
2. **其次**，函数[compaignLoop](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/pkg/election/election.go#L200)是理解逻辑概念如何持续运行的关键。它会定期重选 DM leader ，并且由 **leader 将启动**一些组件，包括 `Scheduler`，`Pessimist` 和 `Optimist`，DM Master follower 不负责这些，只有在成为 leader 时才负责。
3. **然后**，它还将 task 分成 subtask，这些 subtask 在一个迁移任务中只代表一个 source(或 worker)(**逻辑对应关系: 1 个 worker VS 1 个 source VS 1 个 subtask**)。

## Scheduler

1. **首先**，调度器是Master的一部分，它负责DM worker的任务，如“注册/取消注册”，“观察在线/离线”，“观察添加/删除源配置”，“计划上游源”，“计划数据迁移子任务”等等，更多详细信息请参阅[这里](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/scheduler/scheduler.go#L44)。
2. **第二**，调度器实际上做的是，一方面，一些后台gorountines在启动主实例后持续运行，如[`observeWorkerEvent`](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/scheduler/scheduler.go#L2081)将收到DM Worker触发的keepalive状态，另一方面，当dmctl或openAPI发送一些操作时，其他将被触发，如:[`RemoveSourceCfg`](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/scheduler/scheduler.go#L441)。大多数情况下，函数都嵌入到GRPC定义中。
3. **第三**，它还从一个复制任务生成子任务，并将它们持久化在etcd上。

## Pessimist

1. 首先，我们可以看到悲观主义者从上图中提出了“DM Master”和“syncer”的两个部分。这一部分将重点介绍DM Master在内部做什么。从 [the function handleInfoPut of DM Master](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L464) 中，我们可以确保当DM Master从etcd中接收到足够多的信息时，这个信息被DM Master处理。实际上，dm-ctl也可以生成操作，就像DDL锁的一些严重错误一样，当你使用[`waitOwnerToBeDone`](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L343) 的逻辑在里面使用' unlock-ddl-lock '时。从代码中，当 [shardOp.Exec](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/ddl.go#L641) 是分片DDL锁的所有者并且由DM主领导者的 [putOpForOwner](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L605) 编写时，它将为真。我的意思是，这是实现的逻辑，实际上是所有者执行下游的唯一一个DDL。在worker的“Syncer”中，DM-worker所做的只是在' the handledl function '接收到任何DDL MySQL binlog事件时，将信息放入DM-Master的etcd中，同时，如果它是所有者或第一个满足DDL的worker，它也负责执行。

2. 第二，PTAL在[分片-合并-悲观](https://docs.pingcap.com/zh/tidb-data-migration/v5.3/feature-shard-merge-pessimistic#%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86)的概念逻辑，[实现细节](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/pkg/shardddl/pessimism/doc.go)。简而言之，它实际上所做的是将DM集群中的每个DML保存在尚未同步的特定DDL时间戳之前，直到DDL结束。简而言之，如果在一个分片组中存在DDL复制(多个MySQL分片表到一个TiDB表中)，第一个满足DDL查询的worker将通知DM-Master生成一个锁，然后阻塞相关的DDL和DML查询。在所有源的DDL都报告给DM-Master之前，已经被选为所有者的那个worker开始执行DDL。如果成功执行了DDL，它将重放被阻塞的DDL和DML查询，并像往常一样重放复制。

    ![pessimism](https://download.pingcap.com/images/tidb-data-migration/shard-ddl-flow.png)

3. `LockKeeper` 封装了 `Lock`，用于方便地保存和处理DDL锁，并且在复制任务中，锁与DDL在特定时间是1对1的关系。两人也都不需要当总统。因为它可以从DM-Worker保存在DM-Master etcd中的碎片DDL信息重新构建。并且，这个strcut有一个名为TrySync的键函数，它通过增加剩余的 **数量来同步锁**，如果它从MySQL Binlog 接收到 DDL事件，则该数量等于源(相关worker) 的数量。  

    ```go
    type Lock struct {
    mu sync.RWMutex

    ID     string   // lock's ID
    Task   string   // lock's corresponding task name
    Owner  string   // Owner's source ID (not DM-worker's name)
    DDLs   []string // DDL statements
    remain int      // remain count of sources needed to receive DDL info

    // whether the DDL info received from the source.
    // if all of them have been ready, then we call the lock `synced`.
    ready map[string]bool

    // whether the operations have done (exec/skip the shard DDL).
    // if all of them have done, then we call the lock `resolved`.
    done map[string]bool
    }

    type LockKeeper struct {
    mu    sync.RWMutex
    locks map[string]*Lock // lockID -> Lock
    }
    ```

4. `Info` 表示shard DDL信息，`Operation` 表示shard DDL坐标操作，所有信息都应该持久化在etcd中。“信息”和“操作”之间的另一个关键区别是，我们必须知道DM Worker只是将锁或DDL信息发送给DM Master，并从etcd中观看操作。因此，DM Master将使用[`func putOpForOwner`](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L601)将操作放入etcd以执行DDL。

    ```go
    type Info struct {
        Task   string   `json:"task"`   // data migration task name
        Source string   `json:"source"` // upstream source ID
        Schema string   `json:"schema"` // schema name of the DDL
        Table  string   `json:"table"`  // table name of the DDL
        DDLs   []string `json:"ddls"`   // DDL statements
    }
    type Operation struct {
        ID     string   `json:"id"`     // the corresponding DDL lock ID
        Task   string   `json:"task"`   // data migration task name
        Source string   `json:"source"` // upstream source ID
        DDLs   []string `json:"ddls"`   // DDL statements
        Exec   bool     `json:"exec"`   // execute or skip the DDL statements
        Done   bool     `json:"done"`   // whether the `Exec` operation has done
        // only used to report to the caller of the watcher, do not marsh it.
        // if it's true, it means the Operation has been deleted in etcd.
        IsDeleted bool `json:"-"`
    }
    ```

5. 最后，我想说这里有很多与持久化数据相关的关键函数比如 `handleInfoPut`, `handleOperationPut` 等等。他们都是与 DM Master 的 etcd 交互。但是在我的 DM 概览图中，没有被清晰地刻画出来。

6. 如果你想了解更多细节，我建议你阅读这个[content](https://tidb.net/blog/ebc3d5e6)，它描述了更多关于锁如何解析的信息，以及 dml 如何重新同步(我上面提到的概念应该是阻塞，实际上我忽略了这部分)在[这里](https://tidb.net/blog/80c41c9d)。这些内容没有英文版本，请使用其他翻译工具来解决。

## Optimist

1. 还有一个重要的[概念逻辑](https://docs.pingcap.com/zh/tidb-data-migration/v5.3/feature-shard-merge-optimistic#%E5%8E%9F%E7%90%86)你必须首先知道。我还将对该模式进行总结，与悲观模式相比，DDL不会阻塞DML复制。

2. LockKeeper和Lock用于方便地保存和处理DDL锁。概念逻辑功能相当于锁定悲观主义。这个高度等于悲观主义者的一部分。

3. 还有一个 [Doc](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/pkg/shardddl/optimism/doc.go#L16)只是简单地说不同于悲观主义者。实际上，我认为你可以阅读这个页面，它等于一个或更多的信息，你可以得到[这里](https://docs.pingcap.com/tidb-data-migration/v5.3/feature-shard-merge-optimistic#restrictions)。让我们开始看看DM Master在乐观模式下对DDL复制分片做了什么。

    ![optimistic](https://download.pingcap.com/images/tidb-data-migration/optimistic-ddl-flow.png)

4. 我们可以简单地得到，信息和操作不同于悲观主义者的结构。乐观主义者操作的信息包含了比悲观主义者更多的东西，比如 `TableInfoBefore`， `tableinfoafter`，`DownTable` 等等，它们被用来计算DDL应该如何转换。

    ```go
    type Info struct {
    Task       string   `json:"task"`        // data migration task name
    Source     string   `json:"source"`      // upstream source ID
    UpSchema   string   `json:"up-schema"`   // upstream/source schema name, different sources can have the same schema name
    UpTable    string   `json:"up-table"`    // upstream/source table name, different sources can have the same table name
    DownSchema string   `json:"down-schema"` // downstream/target schema name
    DownTable  string   `json:"down-table"`  // downstream/target table name
    DDLs       []string `json:"ddls"`        // DDL statements

    TableInfoBefore *model.TableInfo   `json:"table-info-before"` // the tracked table schema before applying the DDLs
    TableInfosAfter []*model.TableInfo `json:"table-info-after"`  // the tracked table schema after applying the DDLs

    // only used to report to the caller of the watcher, do not marsh it.
    // if it's true, it means the Info has been deleted in etcd.
    IsDeleted bool `json:"-"`

    // only set it when get/watch from etcd
    Version int64 `json:"-"`

    // only set it when get from etcd
    // use for sort infos in recoverlock
    Revision int64 `json:"-"`

    // use to resolve conflict
    IgnoreConflict bool `json:"ignore-conflict"`
    }

    type Operation struct {
    ID            string        `json:"id"`               // the corresponding DDL lock ID
    Task          string        `json:"task"`             // data migration task name
    Source        string        `json:"source"`           // upstream source ID
    UpSchema      string        `json:"up-schema"`        // upstream/source schema name, different sources can have the same schema name
    UpTable       string        `json:"up-table"`         // upstream/source table name, different sources can have the same table name
    DDLs          []string      `json:"ddls"`             // DDL statements need to apply to the downstream.
    ConflictStage ConflictStage `json:"conflict-stage"`   // current conflict stage.
    ConflictMsg   string        `json:"conflict-message"` // current conflict message
    Done          bool          `json:"done"`             // whether the operation has done
    Cols          []string      `json:"cols"`             // drop columns' name

    // only set it when get from etcd
    // use for sort infos in recovering locks
    Revision int64 `json:"-"`
    }
    ```

5. **DM Master如何转换DDL信息或模式信息** 只是试图检测是否有任何DDL冲突，并允许每个DML同步到下游尽快。如果有错误或冲突，它将被报告。
