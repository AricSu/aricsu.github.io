# Metrics

## Overview

## operate error

## HA

1. **number of dm-masters start leader components per minute**  
    **a. Meaning** : number of dm-masters try to start leader components per minute
    **b. Colculation** :

2. **number of workers in different state**  
    **a. Meaning** : number of workers in different state
    **b. Colculation** :

3. **workers' state**  
    **a. Meaning** : workers' state  
    **b. Colculation** :

4. **number of worker event error**  
    **a. Meaning** : number of worker event error  
    **b. Colculation** :

5. **shard ddl error per minute**  
    **a. Meaning** : number of shard DDL lock/operation error in one minute  
    **b. Colculation** : In `pressimism`,

6. . **number of pending shard ddl**  
    **a. Meaning** : number of pending shard DDL in different states, Un-synced (waiting all upstream), Synced (all upstream finished, waiting all downstream). It has three different types of DDL job, including `None`, `Un-synced`, `Synced`. The metrics will change the one type when every new Lock generates(`None` --> `Un-synced`, like `NewLock` in [pessimism](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/pkg/shardddl/pessimism/lock.go#L45)) or releases(`Un-synced` --> `Synced`).  
    **b. Colculation** : In `pressimism`, when every etcd-input trigged by DM-Workers is captured, if `remian of Lock >0`,which means there are at least one source who hasn't received the DDL from MySQL Binlog, the "OperationPut - LockUnSyncedError" will be added,[details at here](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L525). if the DDL lock has synced ,first it will be marked as done and try to remove the operation for the source, meanwhile, if the delete failed, a "OperationPut - RemoveLockError" will be added, [more detail](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L538). In `pressimism`,

## task

1. **task state**  
    **a. Meaning** :The current state of the subtask in the instance  
    **b. Colculation** :  

## load dump files

1. **load progress**  
    **a. Meaning** : The data import process percentage of Loader. The value range is 0% ~ 100%.
    **b. Colculation** :

2. **data file size**  
    **a. Meaning** : The total size of the data files in the full data imported by Loader (including the `INSERT INTO` statement).
    **b. Colculation** :

3. **dump process exits with error**  
    **a. Meaning** : Dumper encounters an error within the DM-worker and exits.
    **b. Colculation** :

4. **load process exits with error**  
    **a. Meaning** : Loader encounters an error within the DM-worker and exits.
    **b. Colculation** :

5. **table count**  
    **a. Meaning** : The total number of tables in the full data imported by Loader.
    **b. Colculation** :

6. **data file count**  
    **a. Meaning** : The total number of data files in the full data imported by Loader (including the `INSERT INTO` statement).
    **b. Colculation** :

7. **transaction execution latency**  
    **a. Meaning** : The duration that Loader executes a transaction (in seconds).
    **b. Colculation** :

8. **statement execution latency - 90**  
    **a. Meaning** : The time it takes loader to execute every statement to the downstream (in seconds).
    **b. Colculation** :

## binlog replication

1. **remaining time to sync**  
    **a. Meaning** :  
    **b. Colculation** : it's calculated by expr below:  

    ```yaml
                        remainingSize =
    remainingSeconds = ---------------------------------------------------------------
                        bytesPerSec  =  (totalBinlogSize - lastBinlogSize) / seconds
    ```

2. **replicate lag**  
    **a. Meaning** : The latency time it takes to replicate the binlog from master to Syncer (in seconds)  
    **b. Colculation** : In this [func updateReplicationLagMetric](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L890), the metric is updated by ticking per 100ms. the `lag` is calculated in an expression of `time.Now().Unix() - s.tsOffset.Load() - headerTS`. which `tsOffset` represents time range between upstream and syncer, DM's timestamp - MySQL's timestamp, and `headerTS` is minior timestamp,which is binlog `EventHeader Timestamp` parsed by [go-mysql-org/go-mysql/replication](https://github.com/go-mysql-org/go-mysql/tree/master/replication), of every DM worker MySQL.  

3. **process exits with error**  
    **a. Meaning** : The binlog replication unit process encounters an error within the DM-worker and exits  
    **b. Colculation** : 1

4. **binlog file gap between master and syncer**  
    **a. Meaning** : The number of binlog files in binlog replication unit that are behind the master.  
    **b. Colculation** : **For `master`**,

5. **binlog file gap between relay and syncer**  

6. **binlog event QPS**  

7. **skipped binlog event QPS**  

8. **read binlog event duration**  

9. **transform binlog event duration**  
    **a. Meaning** : The time it takes binlog replication unit to parse and transform the binlog into SQL statements (in seconds)  
    **b. Colculation** : At [func successFunc](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L1504), every job will have calculated the duration in DDLWorker and DMLWorker executing [func executeBatchJobs](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/dml_worker.go#L200), since raw binlog had tranformed into Syncer dealing loop function. And It has 90%, 95% and 99% quantile curve.  

10. **dispatch binlog event duration**  

11. **transaction execution latency**  

12. **binlog event size**  
    **a. Meaning** : The size of a single binlog event that the binlog replication unit reads from relay log or upstream master.  
    **b. Colculation** : At [here](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/syncer.go#L2159), Syncer'll record every binlog event_size in event header from [binlogstream](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/binlogstream/streamer_controller.go#L131). So, in grafana, DM uses a type of histogram to draw a quantile curve, including 90%, 95%, 99%.

13. **DML queue remain length**  
    **a. Meaning** : The remain length of DML job queues, which have `causality_input`, `compactor_input`, `dml_worker_input`, `q_number`,number is calculated in `queueID%defaultBucketCount`.  
    **b. Colculation** : **For `causality_input`** : Causality provides a simple mechanism to improve the concurrency of SQLs execution under the premise of ensuring correctness, which groups sqls that maybe contain causal relationships, and syncer executes them linearly, [more details](https://github.com/pingcap/tiflow/blob/211e6e7d5fa0944d1f5e0ad585cb8549d5604395/dm/docs/RFCS/20211012_async_checkpoint_flush.md#causality-optimization). So, it records the number of causality component is keeping about rows.  **For `dml_worker_input`** : which means how many jobs were sent to DMWorker. **For `compactor_input`** : it'll equal to the function of causality_input if you config [this feature](https://docs.pingcap.com/zh/tidb/v6.6/dm-dml-replication-logic#compactor). **For `q_number`** : all DMLs at [here](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/dml_worker.go#L100) will be distributed into different queues(default 8) and when they are executed in [DMLWorker's executeJobs](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/dml_worker.go#L159), it'll be recorded by the queue name.  

14. **total SQL jobs**  
    **a. Meaning** : Is waiting shard DDL lock to be resolved, >0 means waiting.  
    **b. Colculation** :  

15. **finished SQL jobs**  
    **a. Meaning** : The number of finished jobs per unit of time.  
    **b. Colculation** :  

16. **statement execution latency - 90**  
    **a. Meaning** : The time it takes binlog replication unit to execute every statement to the downstream (in seconds).  
    **b. Colculation** :  

17. **add job duration**  
    **a. Meaning** : The time it takes binlog replication unit to add a job to the queue (in seconds).  
    **b. Colculation** :  

18. **DML conflict detect duration**  
    **a. Meaning** : The time it takes binlog replication unit to detect conflicts between DMLs (in seconds).  
    **b. Colculation** :  

19. **skip event duration**  
    **a. Meaning** : The time it takes binlog replication unit to skip a binlog event (in seconds).  
    **b. Colculation** :  

20. **unsynced tables**  
    **a. Meaning** : The number of unsynced tables in the subtask.  
    **b. Colculation** : Also at [here](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/ddl.go#L567), It shows that after the `ShardingGroupKeeper's TrySync` function, if it's related to sharding group tables repliation, the metrics'll be update only when you use pessmistic strategy.  

21. **shard lock resolving**  
    **a. Meaning** : Is waiting shard DDL lock to be resolved, >0 means waiting.  
    **b. Colculation** : This metrics is meaningful only when DM uses pessmistic shard strategy to sync a group of tables into one. At [here](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/ddl.go#L632), the Guage'll plus one which means the worker is blocking and waitting for DDL lock to be synced. And there'll create another goroutine to watch the `PUT` operation. I mean the stage of resolving is gonna be closed(actually It does the minus operation in the Guage).  

22. **heartbeat update error**  
    **a. Meaning** : Number of error happens when update heartbeat.  
    **b. Colculation** :  

## relay log

1. **storage capacity**  
    **a. Meaning** : The storage capacity of the disk occupied by the relay log.  
    **b. Colculation** :  

2. **storage remain**  
    **a. Meaning** : The remaining storage capacity of the disk occupied by the relay log.  
    **b. Colculation** :  

3. **process exits with error**  
    **a. Meaning** : The relay log encounters an error within the DM-worker and exits.  
    **b. Colculation** :  

4. **relay log data corruption**  
    **a. Meaning** : The number of corrupted relay log files.  
    **b. Colculation** :  

5. **fail to read binlog from master**  
    **a. Meaning** : The number of errors encountered when the relay log reads the binlog from the upstream MySQL.  
    **b. Colculation** :  

6. **fail to write relay log**  
    **a. Meaning** : The number of errors encountered when the relay log writes the binlog to disks.  
    **b. Colculation** :  

7. **write relay log duration**  
    **a. Meaning** : The duration that the relay log writes binlog event into the disks each time (in seconds).  
    **b. Colculation** :  

8. **binlog file gap between master and relay**  
    **a. Meaning** : The number of binlog files in the relay log that are behind the upstream master.  
    **b. Colculation** :  

9. **binlog pos**  
    **a. Meaning** : The write offset of the latest relay log file.  
    **b. Colculation** :  

10. **read binlog event duration**  
    **a. Meaning** : The duration that the relay log reads binlog event from the upstream MySQL (in seconds).  
    **b. Colculation** :  

11. **binlog event size**  
    **a. Meaning** : The size of a single binlog event that the relay log writes into the disks.  
    **b. Colculation** :  
