

## First of all

first of all, in psysical period, [preparePossibleProperties](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/optimizer.go#L624) will get all possible order properties(column fields), which is only used for join and aggregation. Like group by a,b,c, into one slice from different level childs.  


## How to calculate physical plan 
1. [DoOptimize](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/optimizer.go#L269) is the core connection from logicalOptimize to physicalOptimize, which optimizes a logical plan to a physical plan.    
2. Function findBestTask ,in [physicalOptimize](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/optimizer.go#L619), will find out the best tasks from logical plan, and converts the logical plan to the physical plan, which's a new interface.   
3. Until 2022-11-30 TiDB master branch, TiDB optizmizer gets plan cost in the order of `DoOptimize` -> `getPlanCost` -> `getPlanCostVer1/getPlanCostVer2`.Actually, the method [getPlanCostVer1/getPlanCostVer2](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan.go#L337) of interface PhysicalPlan is use get psysical every operand cost. I mean, by their different implentation, you could figure out how it's calculated.      
4. In [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L39), you'll get that It figures out child cost one by one.  
 

## Why go PlanCostVer1 to PlanCostVer2   

This [PR](https://github.com/pingcap/tidb/pull/35378) indeciates sometimes optimizer cannot discern which is the best datasource,  so a new cost formular for `Selection/TableScan/IndexScan` has been merged. which are here below:  
1. Selection : rows*num-filters*cpu-factor, which Tiflash has a specific cpu-factor 
2. TableScan : rows*log(row-size)*scan-factor, which Tiflash has a specific cpu-factor   
3. indexScan : rows*log(row-size)*scan-factor  

## Formula map of operand cost
1. In the map below, you'll find a lot of factor and can get them on [Formula map of different factors](## Formula map of different factors ). 

| TaskType | version | cost calculated expression | code addr |
| - | - | - | - |
| PhysicalSelection | 2 | cost = child-cost + filter-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L62) |
| PhysicalProjection | 2 | cost = (child-cost + (proj-cost = rows \* len(expressions) \* cpu-factor)) / projection-concurrency  | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L85) |
| PhysicalIndexScan | 2 | cost = rows * log2(row-size) * scan-factor | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L109) |
| PhysicalTableScan | 2 | cost = rows * log2(row-size) * scan-factor | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L126) |
| PhysicalIndexReader | 2 |  cost = (child-cost + net-cost + seek-cost) / concurrency | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L150) |
| PhysicalTableReader | 2 | cost = (child-cost + (rows * row-size * net-factor) + (num-tasks * seek-factor)) / concurrency | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L178) |
| PhysicalIndexLookUpReader | 2 | cost = index-side-cost + (table-side-cost + double-read-cost) / double-read-concurrency | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L217) |
| PhysicalIndexMergeReader | 2 | cost = cost = table-side-cost + sum(index-side-cost) | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L269) |
| PhysicalSort | 2 | cost = child-cost + sort-cpu-cost + sort-mem-cost + sort-disk-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L322) |
| PhysicalTopN | 2 | cost = child-cost + topn-cpu-cost + topn-mem-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L372) |
| PhysicalStreamAgg | 2 | cost = child-cost + agg-cost + group-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L402) |
| PhysicalHashAgg | 2 | child-cost + (agg-cost + group-cost + hash-build-cost + hash-probe-cost) / concurrency | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L425) |
| PhysicalMergeJoin | 2 | cost = left-child-cost + right-child-cost + filter-cost + group-cost |   |
| PhysicalHashJoin | 2 | cost = build-child-cost + probe-child-cost + build-hash-cost + build-filter-cost + (probe-filter-cost + probe-hash-cost) / concurrency | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L486) |
| PhysicalIndexJoin | 2 | cost = build-child-cost + build-filter-cost + (probe-cost + probe-filter-cost) / concurrency probe-cost = probe-child-cost * build-rows / batchRatio | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L530) |
| PhysicalIndexHashJoin | 2 | until 2022-11-30, It's the same as PhysicalIndexJoin | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L566) |
| PhysicalIndexMergeJoin | 2 | until 2022-11-30, It's the same as IndexJoin | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L571) |
| PhysicalApply | 2 | cost = uild-child-cost + build-filter-cost + probe-cost + probe-filter-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L579) |
| PhysicalUnionAll | 2 | cost = sum(child-cost) / concurrency | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L609) |
| PhysicalExchangeReceiver | 2 | cost = child-cost + net-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L630) |
| PointGetPlan | 2 | cost = child-cost + net-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L652) |
| PointGetPlan | 2 | cost = child-cost + net-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L652) |
| BatchPointGetPlan | 2 | cost = seek-cost + net-cost | [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan_cost_ver2.go#L676) |


## Formula map of different factors 

| function name | name | factor name |
| - | - | - |
| TiDBTemp | tidb_temp_table_factor | 0 |
| TiKVScan:     | tikv_scan_factor | 100 |
| TiKVDescScan: | tikv_desc_scan_factor | 150 |
| TiFlashScan:  | tiflash_scan_factor | 5 |
| TiDBCPU:      | tidb_cpu_factor | 30 |
| TiKVCPU:      | tikv_cpu_factor | 30 |
| TiFlashCPU:   | tiflash_cpu_factor | 5 |
| TiDB2KVNet:   | tidb_kv_net_factor | 8 |
| TiDB2FlashNet:| tidb_flash_net_factor | 4 |
| TiFlashMPPNet:| tiflash_mpp_net_factor | 4 |
| TiDBMem:      | tidb_mem_factor | 1 |
| TiKVMem:      | tikv_mem_factor | 1 |
| TiFlashMem:   | tiflash_mem_factor | 1 |
| TiDBDisk:     | tidb_disk_factor | 1000 |
| TiDBRequest:  | tidb_request_factor | 9500000 |


## PhysicalSelection 

1. If row-size belongs to the type of PointGet, the row-size is 1. And row-size of BatchPointGet will come from stats.  
2. And filter-cost indicates cost of this step which uses to calculate and filter the result, which is `row-size * float64(len(filters)) * (tidb_cpu_factor or tikv_cpu_factor or TiFlashCPU)`. 

```
plan-cost =  child-cost + filter-cost(row-size * float64(len(filters)) * (tidb_cpu_factor or tikv_cpu_factor or TiFlashCPU)) 
```

## PhysicalProjection 

1. projection-concurrency can be modified by [tidb_executor_concurrency](https://docs.pingcap.com/zh/tidb/stable/system-variables#tidb_executor_concurrency-%E4%BB%8E-v50-%E7%89%88%E6%9C%AC%E5%BC%80%E5%A7%8B%E5%BC%95%E5%85%A5)    
2. proj-cost is equal to `row-size * len(expressions) * cpu-factor)`, which expressions is the number of column this step.

```
                 child-cost + row-size * len(expressions) * cpu-factor
plan-cost =   ------------------------------------------------------------
                          projection-concurrency

```
## PhysicalIndexScan 
1. rowSize(row-size) = AvgRowSize + [tablePrefix(1) + tableID(8) + indexPrefix(2) + indexID(8)] = AvgRowSize + 19.      
2. BTW, the calculation of `AvgRowSize` is really complicated. if you wanna figure out how the result value is computed, please explore the code logic. And,[here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/statistics/table.go#L1289) are the code addr.  

```
cost = rows * log2(row-size) * scan-factor
```

## PhysicalTableScan
1. rows is the Cardinality generated by stats;   
2. The expression is equal to PhysicalIndexScan.   

```
cost = rows * log2(row-size) * scan-factor
```


## PhysicalIndexReader
1. Actually, the concurrency of this step is distSQLScanConcurrency(default 15) in system varliable, and can be changed by [tidb_distsql_scan_concurrency](https://docs.pingcap.com/zh/tidb/dev/system-variables#tidb_distsql_scan_concurrency).      

```
           child-cost + rows * row-size * net-factor + num-tasks * seek-factor
cost =  -------------------------------------------------------------------------
                          tidb_distsql_scan_concurrency
```

## PhysicalTableReader
1. equal to PhysicalIndexReader

```
           child-cost + rows * row-size * net-factor + num-tasks * seek-factor
cost =  -------------------------------------------------------------------------
                          tidb_distsql_scan_concurrency
```

## PhysicalIndexLookUpReader

1. How to change the concurrency is [tidb_index_lookup_concurrency](https://docs.pingcap.com/zh/tidb/dev/system-variables#tidb_executor_concurrency-%E4%BB%8E-v50-%E7%89%88%E6%9C%AC%E5%BC%80%E5%A7%8B%E5%BC%95%E5%85%A5) and now which named tidb_executor_concurrency.   
2. index-side-cost = (index-child-cost + index-net-cost + index-seek-cost) / dist-concurrency, which is same with IndexReader 
3. table-side-cost = (table-child-cost + table-net-cost + table-seek-cost) / dist-concurrency, which is same with TableReader
4. double-read-cost = double-read-seek-cost + double-read-cpu-cost
5. double-read-seek-cost = double-read-tasks * seek-factor
6. double-read-cpu-cost = index-rows * cpu-factor
7. double-read-tasks = index-rows / batch-size * task-per-batch ,and task-per-batch is a magic number 40 now 
```
                   (index-child-cost + index-net-cost + index-seek-cost) +                          -> index-side-cost
                    (table-child-cost + table-net-cost + table-seek-cost +                          -> table-side-cost
          ((index-rows / batch-size * task-per-batch(40)) * seek-factor + index-rows * cpu-factor)) -> double-read-cost
          -----------------------------------------------------------------------------------------
cost =                               dist-concurrency
      -------------------------------------------------------------------------------------------------
                                  double-read-concurrency
```

## PhysicalIndexMergeReader 

1. The cost is made up of index-side-cost and table-side-cost, and the formar's equal to IndexReader, and the latter's the same as TableReader.  
2. 

``` 
          (table-child-cost + table-net-cost + table-seek-cost) + (index-child-cost + index-net-cost + index-seek-cost)
cost =  ----------------------------------------------------------------------------------------------------------------
                                                dist-concurrency 
```

## PhysicalSort 
1. cost = child-cost + sort-cpu-cost + sort-mem-cost + sort-disk-cost   
2. The Spill means that you're just going to have to use oomUseTmpStorage to save enough TiDB memor, When sort action happens.   
    a. if no spill, `sort-mem-cost` will be `rows * row-size * mem-factor` and, `sort-disk-cost` is 0;     
    b. if spill, `sort-mem-cost is` `mem-quota * mem-factor` and, `sort-disk-cost` is `rows * row-size * disk-factor`;      
3. So, It's clear that when spill happend, `sort-mem-cost` and `sort-disk-cost` will change in an appropriate way.  

```
cost = child-cost + (rows * log2(rows) * len(sort-items) * cpu-factor) + sort-mem-cost + sort-disk-cost
```


## PhysicalTopN 
1. child-cost + topn-cpu-cost + topn-mem-cost

```
cost = child-cost + (rows * log2(N) * len(sort-items) * cpu-factor) + (N * row-size * mem-factor)
```


## PhysicalStreamAgg 

```
cost = child-cost + agg-cost + group-cost
```



## PhysicalHashAgg
1. Default value of [tidb_opt_concurrency_factor](https://docs.pingcap.com/zh/tidb/dev/system-variables#tidb_opt_concurrency_factor) is 5.
```
           child-cost + (agg-cost + group-cost + hash-build-cost + hash-probe-cost)
cost =    --------------------------------------------------------------------------------
                                tidb_opt_concurrency_factor
```



## PhysicalMergeJoin


```
cost = left-child-cost + right-child-cost + filter-cost + group-cost
```

## PhysicalHashJoin


```
            build-child-cost + probe-child-cost + build-hash-cost + 
cost =  build-filter-cost + (probe-filter-cost + probe-hash-cost) / concurrency
```

## PhysicalIndexJoin & PhysicalIndexHashJoin & PhysicalIndexMergeJoin
1. They are equal to IndexJoin. 


```
cost =  build-child-cost + build-filter-cost +                                     
       (probe-child-cost * build-rows / batchRatio + probe-filter-cost) / concurrency

```

## PhysicalApply

```
cost = build-child-cost + build-filter-cost + probe-child-cost * build-rows + probe-filter-cost
```

## PhysicalUnionAll 
1. [tidb_opt_concurrency_factor](https://docs.pingcap.com/zh/tidb/dev/system-variables#tidb_opt_concurrency_factor) is the denominator below.

```
cost = sum(child-cost) / concurrency
```


## PhysicalExchangeReceiver & PointGetPlan & PointGetPlan & BatchPointGetPlan

```
cost = child-cost + net-cost
```