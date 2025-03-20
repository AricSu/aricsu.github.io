# DM syncer

## What's syncer

1. Syncer 可以同步你的 MySQL 数据到另一个 MySQL 数据库，这是 Package 层面的定义，因为 Syncer 真正实现了读取 MySQL Binlog 并转化为 DML/DDL 语句同步到下游的关键逻辑， DM Master 和 Worker 更像是外层高可用性的封装，偏颇的说。

    ![DM_Worker_Components](../../../../../images/tidb/05TiDB-EcosystematicTools/5-4DM/03-DM_Worker_Components.jpeg)

## Pessimist

1. 我已经谈论了一些工人在悲观的DDL机制中所做的事情，PTAL在[悲观主义者内容](./03TiDB-DM%20Master.md)首先在DM Master中。

2. 从 DM worker 的 `DM Syncer Main Steps` 部分，我们可以看到 DM worker 中的 Syncer 只是把他的 DDL Info 上传给 DM Masrter, 如果它是 DDL 锁的 Owner 的话，监视由 DM Master 生成的 Operation 放在 `DDL作业队列` 中。

## Optimist

1. 也请看看我写的[这里](../5-4DM/03TiDB-DM%20Master.md)，所有这些都是因为如果没有预读，你可能会感到困惑。大部分都是相关的。

2. 本页顶部的图片，唯一不同的处理步骤只是 `GetOperation` 之后的 `switch op.ConflictStage`。他们在etcd 上给出了悲观主义者和乐观主义者完全不同的信息，在乐观主义中把信息交给 DM Master 后，DM Worker 获得并判断是否存在冲突，并以不同的方式处理下一步。在[这里](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/ddl.go#L883)调整冲突后，DM Worker 实际得到的是 DM Master 返回的结果。

## streamController

1. streamController 包括一些字段，如 `retryStrategy`，  `syncCfg`，  `fromDB` 等，在[它的 struct](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/binlogstream/streamer_controller.go#L131) 可以看到更多，主要用于去控制读取 binlog，包括将streamer 重置 binlog 位置或 GTID，读取下一个 binlog 事件，从本地 streamer 传输到远程 streamer（remote or relay）。

2. 从[`GenerateStreamFrom`](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/binlogstream/streamer_controller.go#L54-L83)和[`func GetEvent`](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/binlogstream/streamer_controller.go#L337)的界面可以看到，它连续封装了MySQL Binlog到下一个事件的状态信息。

## RunningLoop

1. 实际上，`RunnLoop` 是我创造的一个名称，它应该是 `func (s *Syncer) Run`。我更改名称的原因是使其更有意义，因为关键逻辑参考了一个 694行的函数中 [this for-loop](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1968-L1969)，较为难理解。

2. 如图所示，streamController 将通过 `handleRotateEvent`， `HandleQueryEvent` 等连续发送 MySQL Binlog 和运行处理每个 Binglog Event。

3. 在 [func handleRowsEvent](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L2535)中，MySQL定义了太多的事件，DM只需要转换其中的一部分，如 `UPDATE_ROWS_EVENT`， `DELETE_ROWS_EVENT`，`WRITE_ROWS_EVENT` 等。Syncer 可以通过[Package mysql-go](https://github.com/go-mysql-org/go-mysql)和一些 Event 信息做到这一点，你可以在[page_protocol_replication_binlog_event](https://dev.mysql.com/doc/dev/mysql-server/latest/page_protocol_replication_binlog_event.html) 查看到更多定义解析。

## syncDML

1. 这个[func syncDML](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1534) 所做的只是从 dmlJobCh 连续获取 dmlJob，并将其输出到压缩器或因果关系。它取决于你是否将 `compact` 配置为true，这是一个加速复制速度的调优。[compact](https://docs.pingcap.com/zh/tidb/stable/dm-dml-replication-logic#compactor) 是一个新功能，用于将一些 DML 压缩为一个 DML，如: `INSERT + UPDATE => INSERT`， `INSERT + DELETE => DELETE`等。我们都知道，像 `insert into XXX values()，()…;` 这样的查询比 `insert into XXX values();insert into XXX values();…` 快很多。

2. 同时，`Causality` 也不容忽视，因为该功能用于检测 DML 冲突，而不仅仅是有序地复制 DML。更多关于因果关系并行算法的信息，在[这个博客](https://cn.pingcap.com/blog/tidb-binlog-source-code-reading-8#%E5%B9%B6%E8%A1%8C%E6%89%A7%E8%A1%8CDML)，简而言之，每个事件将被 PK 或 UK 分派到不同的  `因果关系树`  的组中，如果后一个事件的关键字与前一个有冲突。例如冲突可能是 `Event-1: INSERT INTO table_name (pk, uk) VALUES(1,2);` 和 `Event-4: DELETE FROM table_name WHERE pk = 1;` 必须按时间顺序执行，反之亦然，将会有冲突。这样 DM 就可以在不同的  `因果树`  组之间同步并行的执行 DML。因此，如果因果关系检测到任何冲突，必须首先将组中已经存在的查询同步到下游(TiDB集群)。

## syncDDL

1. 恕我直言，这只是一个 dispath 组件函数，它的目标是 DDL shard 逻辑和记录指标。如果配置为 `shard pessimism`，

2. 在 [func syncDDL](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1356)中。它将检查 [shardMode](https://docs.pingcap.com/tidb/stable/dm-shard-merge#configure-parameters) 的配置模式，以执行完全不同的行为。 对于悲观模式，请查看[同步器中的悲观者组件](#pessimist)和[DM Masrer Pessmist 组件](./03TiDB-DM%20Master.md)。而对于乐观主义者，请看[DM Masrer Optimist 组件](./03TiDB-DM%20Master.md)和[syncer中的乐观主义者成分](#optimist)。我认为这是整个 DM 中最复杂和最重要的逻辑。

## DDLWorker

1. DDLWorker 只是一个组件来做关于 DDL 的工作，也有一些关键功能，如 `HandleQueryEvent`， `skipQueryEvent`， `processOneDDL` 和 `handleDDL` 的正常 DDL，乐观 DDL 和悲观 DDL。

2. 而 `HandleQueryEvent` 连接了我上面提到的函数。它将记录指标，并负责将一个 SQL 中压缩的多个 DDL 类型拆分为一些单个 DDL。因为，直到现在，TiDB还不支持[同时执行多个 DDL](https://docs.pingcap.com/tidb/stable/dm-faq#if-a-statement-executed-upstream-contains-multiple-ddl-operations-does-dm-support-such-migration)。

## DMLWorker

1. 此外，主要函数是 `dmlWorkerWrap` ， `sendJobToAllDmlQueue` ， `executeJobs` ， `gensql` 。DM有一个名为[worker-count](https://docs.pingcap.com/zh/tidb/stable/dm-tune-configuration#worker-count)的配置参数，可以加速DML复制速度。在 `dmlWorkerWrap '中，该步骤创建了worker-count的数量作为并发来同步dml。DML被 [func run](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/dml_worker.go#L101) 中的[Hash 每个DML Key](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/dml_worker.go#L138)分割。这样，每个队列以 [DM batch](https://docs.pingcap.com/tidb/stable/dm-tune-configuration#batch)参数的批处理方式执行。简而言之，DMLWorker将作业转换为SQL并将其刷新到下游。

2. 你可以在[这里](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/dml_worker.go#L33)找到更多细节。

## checkpointWorker

1. CheckPoint 表示 Syncer 的检查点状态，包括全局 binlog 的检查点和每个表的检查点，当保存检查点时，我们必须在内存中保存，并将其永久地保存到 DB(或文件)。对于分片合并，在内存中保存检查点，以支持重新同步特殊streamer 时的跳过，但在一个分片组的所有 ddl 被同步和执行之前，不应该永久保存检查点。因为，当重新启动以继续同步时，所有分片 ddl 必须再次尝试同步。这里有一个关键的[接口](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/checkpoint.go#L227)，你可以知道它是如何工作的。

2. 在 Syncer 中，[flushcheckpoint](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1187)和[flushCheckPointsAsync](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1223)调用 `checkpointFlushWorker.Add(task)` 将检查点任务推入checkpointWorker。还有一个循环 [func Run](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/checkpoint_flush_worker.go#L91)来分派到同步/异步逻辑中，并使用 FlushPointsExcept 永久地将全局 checkpint 刷新到下游检查点表中。到目前为止，异步刷新检查点还没有发布，更多信息请访问[RFC](https://github.com/pingcap/tiflow/blob/master/dm/docs/RFCS/20211012_async_checkpoint_flush.md)。

3. 需要刷新检查点的场景有四种。其中一半包含在 [func handleJob](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1048) 中，另一半包含在 [func Syncer.Run](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1654) 中。  
a. **DDL执行**: 当 DM 中每个 DDL 都出现时，将在[func handleJob](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1101-L1142)处触发刷新操作。  
b. **暂停/停止同步(由 `s.flushJobs` 驱动)**: 在退出前刷新所有作业，在 [func s.flushJobs()](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1870)中，每当遇到该场景，新的 flushJob 就会生成。或者使用[skip-error方法](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L2174-L2203) 解决错误或中断的 DM 同步时，也会刷新。  
c. **IsFreshTask返回true**: 如果streamController成功启动或Mode配置为 `ALL`，则从转储元文件加载的检查点将被刷新。  
d. **心跳事件收到**: 在 [func flushifexpired](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1030)，当每个事件从MySQL Binlog被分派到DML作业队列，[这里](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L2614)。  

4. 简而言之，检查点是保证数据复制过程中最终一致性的重要一项。我的意思是，如果出现任何错误，DM 可以在从错误中恢复后继续复制。
