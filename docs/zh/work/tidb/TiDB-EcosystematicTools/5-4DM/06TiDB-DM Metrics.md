# Metrics

## Overview

## operate error

## HA

1. **每分钟dm-master启动领导组件的数量**  
    **a. 含义** : 每分钟dm-master尝试启动leader组件的个数
    **b. 计算** :

## task

## load dump files

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

## relay log
