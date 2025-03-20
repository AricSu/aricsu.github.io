# Dumpling Aachitecture

## Basic info about it

1. REPO : Oringally, the project existed as in single project, but now it'as been merged into [TiDB Repo](https://github.com/pingcap/tidb/tree/master/dumpling).

2. Investigate : I've gotta to say Dumpling is such simple, but in most cases, something wrong with TiDB Cluster usually happens. Although, all of tools have this kind of issues, in my opnion, Dumpling is much more.

3. How to work : In short, Dumpling connects TiDB Cluster parallelly, uses SQLs to get results concurrently and finally writes results into linux files.

## How does it init?

1. [Startup steps](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L124-L137) is a serious of things below:

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

2. I'll just focus on main steps and components, which's (createExternalStore, startHTTPServer, openSQLDB, resolveAutoConsistency, validateResolveAutoConsistency, tidbSetPDClientForGC, tidbStartGCSavepointUpdateService) and the others are just coordinater parts. For `createExternalStore`, due to dumpling supplied already Local, Hdfs, S3, Azure. So they have different config items totally and main idea is to get enough info to read/write. **I just focus on `Local`, which is the basic implmented logic behind the other storage.** The [LocalStorage](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/br/pkg/storage/local.go#L161) is just an struct encapsulated path of export to.

3. For [`startHTTPServer`](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/http_handler.go#L21), in one single goroutine, it's used to construct related things about metrics and go debug inside, which's very useful when something worng with the Dumpling binary for investigating. For [`openSQLDB`], just inits a connection to the database aimed for dumping data.

4. For [validateResolveAutoConsistency](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1429), check if there's an scenario that can't specify --snapshot when --consistency isn't snapshot.

5. For [tidbSetPDClientForGC](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1438), if the downstream was TiDB, it'd havet to set GC, however in this step, just inits and prepares engough info to have pd-client communicate with PD inside Dumpling.

6. For [tidbGetSnapshot](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1466), just uses `show master status` to get the Position, like below, that's actually the same as `select tidb_current_tso()` just in tidb;

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

7. For [tidbStartGCSavepointUpdateService](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1497), It uses the snapshot got from `tidbGetSnapshot` to set [TiKV GC safe point](https://github.com/pingcap/dumpling/issues/95) with a ttl. So, in this way, higher version Dumpling could be able to prevent TiKV GC the data which's being needed.

8. For [setSessionParam](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1559), because of supporting in `dumpling --params` extra session variables used while dumping, here's the main logic to process. I've gotta to say that's very important to interact with TiDB as the reason of, I mentioned on the top of page, **`something wrong with TiDB Cluster usually happens`**.

## How does it work?

1. After init steps, [Dump()](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L143) is the main logic to dump table from database.

2. Inside Dump(), there's a logic choosing dump-by-sql or dump-database by wether you configured `--sql` parameter.

3. The [func startWrite](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L267) will create groutines in the number of `Threads`. The created groutines are used to deal with tasks parallelly. And from the logic of the [func Write.handleTask](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/writer.go#L102), there's a serious of functions like `WriteDatabaseMeta`, `WriteTableMeta`, `WriteTableData`, etc. Which mainly is execute the SQL query and write result into different externalStorage files.

## Dump SQL

1. There's afunction named [detectEstimateRows](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1261) to get the estimateRows using `fmt.Sprintf("EXPLAIN %s", "select * from table_a a left join table_b b on a.id = b.id where ...")`, but, it's just used to record as the value of dumpling_dump_estimate_total_rows metric. Until now, there hasn't had any finished opensource service about Dumpling. I guess in the future there'll be a [Dataflow Engine](https://github.com/pingcap/tidb/issues/34948) runing Dumpling as a backend service.

2. Also as I mentioned above, the Writer component will execute query and save results as files. A noticable thing is that , [from the logic](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L1260) using Dumpling by `--sql` is a single there way to execute query. Because the totalChunks is hardcoded as just `1` here.

## Dump Databases

1. First of all, there's [many LOOPs](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L420-L484) to prepare eache table schema and table data as task and sent them to Write to be waiting for handle.

2. Inside the [func dumpTableData](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L624-L627) has a main logics to adjust wether to use concurrency. If you have `--rows` configured, concurrency would be used. If not the whole table will be exported use just one query to get result, like `select column_a, column_b, column_c ... from database_a.table_a order by XXX`. However, the concurrent way is firstly that [the func concurrentDumpTable](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/dump.go#L731) tries to split table into several chunks to dump

3. The single table dump is executed in concurrent by steps below:  
    a. First, [func orderByClause](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/sql.go#L439) decides to use `_tidb_rowid` or `Primary key` to sort.  
    b. Second, [func pickupPossibleField] decides to use `_tidb_rowid` or `Numeric PK` or `UK Index` or `no proper index` in the priority of order I wrote.
    c. Third, [func estimateCount](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/dumpling/export/sql.go#L1175) to get estimate RowNumber using `EXPLAIN SELECT * FROM DATABASE_XXX.TABLE_XXX`.  
    d. If the estimateCount < `--rows`, it'll directly dump table using just one single sql.  
    e. If pickupPossibleField can output sutiable fields(single or plural), it'll get max and min value using `SELECT MIN(field_xxx),MAX(field_xxx) FROM database_a.table_a`. if there's any error or can not get max or min, it also directly dumps table using one sql.  
    f. Then, uses `estimatedChunks := count / conf.Rows` to split into some chunks and parallelly execute them as tasks.

## The End

After took a look at source code quickly, we know something below:  

1. `--row` is the switch to control if table table could be able to be split into different chunks and parallely executed.  
2. `--thread` is the switch to control concurrency between differen tables.  
3. And there's some scenarios we couldn't split chunks, though, we've configured `--rows`.  
