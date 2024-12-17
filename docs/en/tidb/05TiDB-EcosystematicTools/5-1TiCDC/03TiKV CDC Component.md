# CDC Component in TiKV

## Lazy worker of cdc component

1. lazy_build 为什么是 lazy_build?
lazy_worker 源自于调用 worker 的 lazy_build，表示延迟执行。延迟表示仅 spwan 一个 task，由其自身调度机制决定何时运行。
2. tikv_util 中的 Worker 是什么？
  从其结构体中可以看出，封装了 yatp 线程池，及相关控制参数、面板数据。
a. pool 及 Remote 表示 yatp 中的任务及队列类型；
b. pending_capacity 表示最多可以产生多少 task，该限制是软限制，如果超过打印报错，但还是会生成 task；
3. counter 表示 task 的计数，每当 task 被调度(schedule_force)的时候会增加，反之亦然；
4. stop 表示是否停止当前 worker 的状态值；
5. thread_count 表示 worker 可使用的线程数量，用于与 counter 中数量比较，防止过载；

```go
pub struct Worker {
    pool: Arc<Mutex<Option<ThreadPool<yatp::task::future::TaskCell>>>>,
    remote: Remote<yatp::task::future::TaskCell>,
    pending_capacity: usize,
    counter: Arc<AtomicUsize>,
    stop: Arc<AtomicBool>,
    thread_count: usize,
}
```

## What is lazy_worker

1. 什么是 lazy worker
  从结构体可以看出，首先，lazy_worker 是一个封装了 worker 结构的 worker。
  scheduler 表示 封装了 channel sender 的调度器；
  receiver 表示 封装了 channel receiver 的接收器，接受来自 scheduler 的 Msg，向下调用处理；
  metrics_pending_task_count 表示 pending task 计数，用于监控信息；

```go
pub struct LazyWorker<T: Display + Send + 'static> {
    scheduler: Scheduler<T>,
    worker: Worker,
    receiver: Option<UnboundedReceiver<Msg<T>>>,
    metrics_pending_task_count: IntGauge,
}
```

## What is task(homework) in cdc endpoint

1. 在 <https://github.com/tikv/tikv/blob/7861f56f6249ea6b4cc19a6b2ba7d7dbd2a63c25/components/server/src/server.rs#L1077> 启动一个 cdc worker，并调用 fn start_with_timer 一直（层层封装）传递到 tikv_util worker 的 fn start_with_timer；
2. Receiver 从 channel 中接收 task，handle.inner.run(task) 会调用对应的 inner（即：对应 worker 的 runner（cdc_worker 在这里就是 inner），内部封装了自己的方法处理；
3. Cdc endpoint 的 Runnable trait impl 在这里 <https://github.com/tikv/tikv/blob/7861f56f6249ea6b4cc19a6b2ba7d7dbd2a63c25/components/cdc/src/endpoint.rs#L1289> ，CDC 中所有的 Task 类型都在如下代码块：
a. RegionUpdated ：对比 observer 检察的 region 和发来的 region 的 version，相同说明是 peer change 导致，无需 DeRegister；
b. RegionDestroyed ：对应 RegionDestroyed event，先对比 Region Epoch 正确后，再进行 destroy;
c. RegisterRegion：注册对应 region_id 至 map，并针对该 region 的 spawn_task 到线程池；
c. DeRegisterRegion：RegisterRegion 的反向操作；
d. RegisterAdvanceEvent ：以 advance_ts_interval 为周期推进所有 region 的 ResolvedTs；
e. AdvanceResolvedTs : 迭代 region map 中所有 region，通过 Resolver 检测 Region 状态，ready 表示是 leader，再扫 LockCF 中的信息推进该 Region 的 minTs；
f. ChangeLog ：表示获取 CmdBatch 中的 Region 的 change log；
g. ScanLocks ：扫描 Region 中指定 apply_index 位置，对应 entries 的锁信息；
h. ChangeConfig：处理动态配置的信息；

    ```rust
    pub enum Task<S: Snapshot> {
        RegionUpdated(Region),
        RegionDestroyed(Region),
        RegisterRegion {
            region: Region,
        },
        DeRegisterRegion {
            region_id: u64,
        },
        ReRegisterRegion {
            region_id: u64,
            observe_id: ObserveID,
            cause: String,
        },
        RegisterAdvanceEvent {
            cfg_version: usize,
        },
        AdvanceResolvedTs {
            regions: Vec<u64>,
            ts: TimeStamp,
        },
        ChangeLog {
            cmd_batch: Vec<CmdBatch>,
            snapshot: Option<RegionSnapshot<S>>,
        },
        ScanLocks {
            region_id: u64,
            observe_id: ObserveID,
            entries: Vec<ScanEntry>,
            apply_index: u64,
        },
        ChangeConfig {
            change: ConfigChange,
        },
    }
    ```

Qs:

1. 看到 lazy_worker 的 impl，既有 start fn 又有 start_with_timer fn，如何区分我想看的部分使用的是哪个？ 看他的上下文调用有时候看不出来怎么办？
我选的方法是，直接全文搜索每个看一遍，然后在 server.rs 中看到 cdc_worker 有个 start_with_timer 实现，才确定与本问题相关，但这种方法在其实靠运气和猜测，有更好的方法吗？
2. 有的时候 “vscode 语言助手 rust-analyzer” 只能看到一部分引用，比如： ```counter arc<automic>```，只能看到 load，看不到 store 和 fetch_add，只能全局搜有的时候 “vscode 语言助手 rust-analyzer” 只能看到一部分引用，比如： ```counter arc<automic>```，只能看到 load，看不到 store 和 fetch_add，只能全局搜索吗，全文搜索我得先知道有 fetch_add，才能全文搜索 `counter.fetch_add` 关键字？还是我打开的方法不对？因为我只有看到这个值什么时候改变，才能知道他的作用，也更利于排查问题。索吗，全文搜索我得先知道有 fetch_add，才能全文搜索 `counter.fetch_add` 关键字？还是我打开的方法不对？因为我只有看到这个值什么时候改变，才能知道他的作用，也更利于排查问题。
3. Rust Clone 和 Copy 的区别（认识对吗？）：  
    a. 默认 rust 能 Copy 的其实就是 “内存浅拷贝，即：只移动栈指针，指向堆空间地址，堆不动”。  
    b. Clone 功能与 Copy 相同，但存在一些限制，主要作用是为了弥补无默认实现 Copy 类型的地方。具体是深拷贝还是浅拷贝依赖于具体类型，需要 developer 手动实现。  
