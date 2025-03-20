# Dumpling 架构原理

## 基本信息

1. 仓库：最初，Dumpling 是一个单独的项目，但现在已合并到 [TiDB Repo](https://github.com/pingcap/tidb/tree/master/dumpling) 中。

2. 分析：我必须说，Dumpling 是如此简单，但在大多数情况下，TiDB 集群通常会出现问题。尽管所有工具都有这种问题，但在我看来，Dumpling 更多。

3. 工作原理：简而言之，Dumpling 并行连接 TiDB 集群，使用 SQL 并发地获取结果，并最终将结果写入 Linux 文件。

## 如何初始化

1. [Startup steps](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L124-L137) 是以下一系列步骤的集合：

    ```go
    err = runSteps(d,
    initLogger,
    createExternalStore,
    startHTTPService,
    openSQLDB,
    detectServerInfo,
    resolveAutoConsistency,

    validateResolveAutoConsistency,
    tidbSetPDClientForGC,
    tidbGetSnapshot,
    tidbStartGCSavepointUpdateService,

    setSessionParam)
    ```

2. 我将只关注主要步骤和组件，即 (createExternalStore, startHTTPServer, openSQLDB, resolveAutoConsistency, validateResolveAutoConsistency, tidbSetPDClientForGC, tidbStartGCSavepointUpdateService)，而其他部分只是协调器部分。对于 `createExternalStore`，由于 dumpling 已经提供了 Local、Hdfs、S3、Azure，因此它们具有完全不同的配置项，主要思想是获取足够的信息以进行 读/写  到不同的 [LocalStorage](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/br/pkg/storage/local.go#L161)。 **我只关注 `Local`，它也是其他 externalStorage 背后实现逻辑的基础。**  只是一个封装了导出路径的结构体。

3. 对于 [`startHTTPServer`](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/http_handler.go#L21)，在一个单独的 goroutine 中，它用于构建与度量相关的内容和内部调试，这在 Dumpling 二进制文件出现问题时进行调查非常有用。对于 [`openSQLDB`]，它只是初始化了一个连接到旨在导出数据的数据库。

4. 对于 [validateResolveAutoConsistency](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1429)，检查是否存在一种情况，即在 --consistency 不是快照时无法指定 --snapshot。

5. 对于 [tidbSetPDClientForGC](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1438)，如果下游是 TiDB，则必须设置 GC，但在此步骤中，只需初始化并准备足够的信息，以使 pd-client 在 Dumpling 中与 PD 通信。

6. 对于 [tidbGetSnapshot](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1466)，只需使用 `show master status` 获取 Position，如下所示，实际上与 tidb 中的 `select tidb_current_tso()` 相同；

    ```sql
    mysql> begin;
    Query OK, 0 rows affected (0.00 sec)

    mysql> Show Master Status;
    +-------------+--------------------+--------------+------------------+-------------------+
    | File        | Position           | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
    +-------------+--------------------+--------------+------------------+-------------------+
    | tidb-binlog | 441037036439732234 |              |                  |                   |
    +-------------+--------------------+--------------+------------------+-------------------+
    1 row in set (0.01 sec)

    mysql> select tidb_current_tso();
    +--------------------+
    | tidb_current_tso() |
    +--------------------+
    | 441037036439732234 |
    +--------------------+
    1 row in set (0.01 sec)

    mysql> commit;
    Query OK, 0 rows affected (0.01 sec)
    ```

7. 对于 [tidbStartGCSavepointUpdateService](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1497) ，它使用从 `tidbGetSnapshot` 获得的快照来设置 [TiKV GC safepoint](https://github.com/pingcap/dumpling/issues/95)，并设置了一个 ttl。因此，通过这种方式，更高版本的 Dumpling 可以防止 TiKV GC 正在使用的要导出的数据。

8. 对于 [setSessionParam](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1559)，由于支持以  `dumpling --params`  方式使用的额外会话变量。不得不说，这种方式与 TiDB 交互非常重要，因为我在页面顶部提到在导出数据时， **`TiDB 集群通常会出现问题`**。

## 如何工作

1. 在初始化步骤之后，[Dump()](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L143) 是从数据库中导出表的主要逻辑。

2. 在 Dump() 中，有一个逻辑选择通过 SQL 还是通过数据库导出，这取决于您是否配置了 `--sql` 参数。

3. [func startWrite](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L267) 将创建与 `Threads` 数量相同的 groutines。创建的 groutines 用于并行处理任务。从 [func Write.handleTask](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/writer.go#L102) 的逻辑来看，有一系列函数，如 `WriteDatabaseMeta`、`WriteTableMeta`、`WriteTableData` 等。这些函数主要是执行 SQL 查询并将结果写入不同的 externalStorage 文件。

## SQL 导出

1. 在 [detectEstimateRows](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1261) 函数中，使用 `fmt.Sprintf("EXPLAIN %s", "select * from table_a a left join table_b b on a.id = b.id where ...")` 来获取 estimateRows，但是它只是用来记录 dumpling_dump_estimate_total_rows 指标的值。到目前为止，还没有任何关于 Dumpling 的开源服务。我猜在未来会有一个 [Dataflow Engine](https://github.com/pingcap/tidb/issues/34948) 作为后端服务运行 Dumpling。

2. 正如我上面提到的，Writer 组件将执行查询并将结果保存为文件。值得注意的是，使用 Dumpling 的 `--sql` 的逻辑是通过 `totalChunks` 硬编码为 `1` 来执行查询的唯一方式，也就是说不存在并发。

## Schema 导出

1. 首先，有[很多循环](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L420-L484)来准备每个表模式和表数据作为任务并将它们发送到 Write 等待处理。

2. 在 [func dumpTableData](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L624-L627) 内部有一个主要的逻辑来调整是否使用并发。如果您配置了 `--rows`，则会使用并发。如果没有，则整个表将使用一个查询导出结果，例如 `select column_a，column_b，column_c ... from database_a.table_a order by XXX`。但是，并发方式首先是 [the func concurrentDumpTable](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L731) 尝试将表拆分为多个块以进行导出。

3. 单表导出通过以下步骤并发执行：  
    a. 首先，[func orderByClause](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/sql.go#L439) 决定使用 `_tidb_rowid` 或 `Primary key` 进行排序。  
    b. 其次，[func pickupPossibleField] 决定使用 `_tidb_rowid` 或 `Numeric PK` 或 `UK Index` 或 `no proper index`，按我编写的顺序优先。  
    c. 第三，[func estimateCount](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/sql.go#L1175) 使用 `EXPLAIN SELECT * FROM DATABASE_XXX.TABLE_XXX` 获取估计的 RowNumber。  
    d. 如果 estimateCount < `--rows`，则直接使用一个单一的 sql 导出表。  
    e. 如果 pickupPossibleField 可以输出合适的字段（单数或复数），则使用 `SELECT MIN(field_xxx),MAX(field_xxx) FROM database_a.table_a` 获取最大值和最小值。如果有任何错误或无法获取最大值或最小值，则直接使用一个 sql 导出表。  
    f. 然后，使用 `estimatedChunks := count / conf.Rows` 将其拆分为一些块，并将它们并行执行为任务。  

## 最后总结

在快速查看源代码后，我们了解到以下内容：

1. `--row` 是控制表格是否可以被分成不同的块并并行执行的开关。
2. `--thread` 是控制不同表格之间并发的开关。
3. 尽管我们已经配置了 `--rows`，但有些情况下，因为无法将分割 chunk 导致表内部的数据导出无法以并发的方式执行。
