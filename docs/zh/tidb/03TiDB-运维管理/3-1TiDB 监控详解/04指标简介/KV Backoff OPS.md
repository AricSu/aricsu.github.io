# KV Backoff OPS


[123](https://github.com/tikv/client-go/blob/6beede6998b6b23aee8e816f95f293d4d0363704/metrics/metrics.go#L156-L164)




类型：
1. tikvRPC, tiflashRPC

send tiflash request error, send tikv request error, tikv server timeout, tiflash server timeout


2. pdRPC
RegionCache

failed to decode region range key, key
loadRegion from PD failed, key:
region not found for key
receive Region with no available peer

failed to decode region range key, regionID: 
loadRegion from PD failed, regionID:
region not found for regionID
receive Region with no available peer

scanregion
failed to decode region range key, limit:
scanRegion from PD failed, limit: 
PD returned no region, limit:
PD returned regions have gaps, limit:

batchscan
failed to decode region range key, range num:
batchScanRegion from PD failed, range num:

TiDB --> KV Request --> Load Region Duration --> get_region_when_miss

StoreCache
loadStore from PD failed, id


get timestamp failed: 
get minimum timestamp failed: 

scatterRegion 
batch split regions complete
start scatter region --> backoff
batch split regions, scatter region complete
batch split regions, scatter region failed



3. tikvLockFast -> resolve lock timeout --> https://docs.pingcap.com/zh/tidb/v8.4/system-variables#tidb_backoff_lock_fast
backoffer.maxSleep %dms is exceeded, errors:
total-backoff-times: %v, backoff-detail: %v, maxBackoffTimeExceeded: %v, maxExcludedTimeExceeded:
longest sleep type: %s, time: %dms"


4. txnLock --> resolve lock timeout

    1. "remain locks: " --》 https://docs.pingcap.com/tidb/stable/garbage-collection-overview#resolve-locks
    2. "[pipelined dml] flush lockedKeys: ", "[pipelined dml] backoff failed during flush"
    3. "2PC prewrite lockedKeys:"

5. regionMiss
regionScheduling
serverBusy
tikvDiskFull
regionRecoveryInProgress
staleCommand
dataNotReady
isWitness
...