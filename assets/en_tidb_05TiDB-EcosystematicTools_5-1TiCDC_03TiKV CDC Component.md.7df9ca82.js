import{_ as s,c as n,o as a,N as o}from"./chunks/framework.0799945b.js";const A=JSON.parse('{"title":"CDC Component in TiKV","description":"","frontmatter":{},"headers":[],"relativePath":"en/tidb/05TiDB-EcosystematicTools/5-1TiCDC/03TiKV CDC Component.md"}'),l={name:"en/tidb/05TiDB-EcosystematicTools/5-1TiCDC/03TiKV CDC Component.md"},p=o(`<h1 id="cdc-component-in-tikv" tabindex="-1">CDC Component in TiKV <a class="header-anchor" href="#cdc-component-in-tikv" aria-label="Permalink to &quot;CDC Component in TiKV&quot;">​</a></h1><h2 id="lazy-worker-of-cdc-component" tabindex="-1">Lazy worker of cdc component <a class="header-anchor" href="#lazy-worker-of-cdc-component" aria-label="Permalink to &quot;Lazy worker of cdc component&quot;">​</a></h2><ol><li>lazy_build 为什么是 lazy_build? lazy_worker 源自于调用 worker 的 lazy_build，表示延迟执行。延迟表示仅 spwan 一个 task，由其自身调度机制决定何时运行。</li><li>tikv_util 中的 Worker 是什么？ 从其结构体中可以看出，封装了 yatp 线程池，及相关控制参数、面板数据。 a. pool 及 Remote 表示 yatp 中的任务及队列类型； b. pending_capacity 表示最多可以产生多少 task，该限制是软限制，如果超过打印报错，但还是会生成 task；</li><li>counter 表示 task 的计数，每当 task 被调度(schedule_force)的时候会增加，反之亦然；</li><li>stop 表示是否停止当前 worker 的状态值；</li><li>thread_count 表示 worker 可使用的线程数量，用于与 counter 中数量比较，防止过载；</li></ol><div class="language-go"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">pub </span><span style="color:#89DDFF;">struct</span><span style="color:#A6ACCD;"> Worker </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    pool</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> Arc</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">Mutex</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">Option</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">ThreadPool</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">yatp</span><span style="color:#89DDFF;">::</span><span style="color:#A6ACCD;">task</span><span style="color:#89DDFF;">::</span><span style="color:#A6ACCD;">future</span><span style="color:#89DDFF;">::</span><span style="color:#A6ACCD;">TaskCell</span><span style="color:#89DDFF;">&gt;&gt;&gt;&gt;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    remote</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> Remote</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">yatp</span><span style="color:#89DDFF;">::</span><span style="color:#A6ACCD;">task</span><span style="color:#89DDFF;">::</span><span style="color:#A6ACCD;">future</span><span style="color:#89DDFF;">::</span><span style="color:#A6ACCD;">TaskCell</span><span style="color:#89DDFF;">&gt;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    pending_capacity</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> usize</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    counter</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> Arc</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">AtomicUsize</span><span style="color:#89DDFF;">&gt;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    stop</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> Arc</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">AtomicBool</span><span style="color:#89DDFF;">&gt;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    thread_count</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> usize</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="what-is-lazy-worker" tabindex="-1">What is lazy_worker <a class="header-anchor" href="#what-is-lazy-worker" aria-label="Permalink to &quot;What is lazy_worker&quot;">​</a></h2><ol><li>什么是 lazy worker 从结构体可以看出，首先，lazy_worker 是一个封装了 worker 结构的 worker。 scheduler 表示 封装了 channel sender 的调度器； receiver 表示 封装了 channel receiver 的接收器，接受来自 scheduler 的 Msg，向下调用处理； metrics_pending_task_count 表示 pending task 计数，用于监控信息；</li></ol><div class="language-go"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">pub </span><span style="color:#89DDFF;">struct</span><span style="color:#A6ACCD;"> LazyWorker</span><span style="color:#89DDFF;">&lt;</span><span style="color:#A6ACCD;">T</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> Display </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> Send </span><span style="color:#89DDFF;">+</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">static&gt; {</span></span>
<span class="line"><span style="color:#C3E88D;">    scheduler: Scheduler&lt;T&gt;,</span></span>
<span class="line"><span style="color:#C3E88D;">    worker: Worker,</span></span>
<span class="line"><span style="color:#C3E88D;">    receiver: Option&lt;UnboundedReceiver&lt;Msg&lt;T&gt;&gt;&gt;,</span></span>
<span class="line"><span style="color:#C3E88D;">    metrics_pending_task_count: IntGauge,</span></span>
<span class="line"><span style="color:#C3E88D;">}</span></span>
<span class="line"></span></code></pre></div><h2 id="what-is-task-homework-in-cdc-endpoint" tabindex="-1">What is task(homework) in cdc endpoint <a class="header-anchor" href="#what-is-task-homework-in-cdc-endpoint" aria-label="Permalink to &quot;What is task(homework) in cdc endpoint&quot;">​</a></h2><ol><li><p>在 <a href="https://github.com/tikv/tikv/blob/7861f56f6249ea6b4cc19a6b2ba7d7dbd2a63c25/components/server/src/server.rs#L1077" target="_blank" rel="noreferrer">https://github.com/tikv/tikv/blob/7861f56f6249ea6b4cc19a6b2ba7d7dbd2a63c25/components/server/src/server.rs#L1077</a> 启动一个 cdc worker，并调用 fn start_with_timer 一直（层层封装）传递到 tikv_util worker 的 fn start_with_timer；</p></li><li><p>Receiver 从 channel 中接收 task，handle.inner.run(task) 会调用对应的 inner（即：对应 worker 的 runner（cdc_worker 在这里就是 inner），内部封装了自己的方法处理；</p></li><li><p>Cdc endpoint 的 Runnable trait impl 在这里 <a href="https://github.com/tikv/tikv/blob/7861f56f6249ea6b4cc19a6b2ba7d7dbd2a63c25/components/cdc/src/endpoint.rs#L1289" target="_blank" rel="noreferrer">https://github.com/tikv/tikv/blob/7861f56f6249ea6b4cc19a6b2ba7d7dbd2a63c25/components/cdc/src/endpoint.rs#L1289</a> ，CDC 中所有的 Task 类型都在如下代码块： a. RegionUpdated ：对比 observer 检察的 region 和发来的 region 的 version，相同说明是 peer change 导致，无需 DeRegister； b. RegionDestroyed ：对应 RegionDestroyed event，先对比 Region Epoch 正确后，再进行 destroy; c. RegisterRegion：注册对应 region_id 至 map，并针对该 region 的 spawn_task 到线程池； c. DeRegisterRegion：RegisterRegion 的反向操作； d. RegisterAdvanceEvent ：以 advance_ts_interval 为周期推进所有 region 的 ResolvedTs； e. AdvanceResolvedTs : 迭代 region map 中所有 region，通过 Resolver 检测 Region 状态，ready 表示是 leader，再扫 LockCF 中的信息推进该 Region 的 minTs； f. ChangeLog ：表示获取 CmdBatch 中的 Region 的 change log； g. ScanLocks ：扫描 Region 中指定 apply_index 位置，对应 entries 的锁信息； h. ChangeConfig：处理动态配置的信息；</p><div class="language-rust"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#F78C6C;">pub</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">enum</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Task</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">S</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Snapshot</span><span style="color:#89DDFF;">&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#82AAFF;">RegionUpdated</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">Region</span><span style="color:#89DDFF;">),</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#82AAFF;">RegionDestroyed</span><span style="color:#89DDFF;">(</span><span style="color:#FFCB6B;">Region</span><span style="color:#89DDFF;">),</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">RegisterRegion</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        region</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Region</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">DeRegisterRegion</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        region_id</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">u64</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">ReRegisterRegion</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        region_id</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">u64</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        observe_id</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">ObserveID</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        cause</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">String</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">RegisterAdvanceEvent</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        cfg_version</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">usize</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">AdvanceResolvedTs</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        regions</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Vec</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">u64</span><span style="color:#89DDFF;">&gt;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        ts</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">TimeStamp</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">ChangeLog</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        cmd_batch</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Vec</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">CmdBatch</span><span style="color:#89DDFF;">&gt;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        snapshot</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Option</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">RegionSnapshot</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">S</span><span style="color:#89DDFF;">&gt;&gt;,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">ScanLocks</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        region_id</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">u64</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        observe_id</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">ObserveID</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">        entries</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Vec</span><span style="color:#89DDFF;">&lt;</span><span style="color:#FFCB6B;">ScanEntry</span><span style="color:#89DDFF;">&gt;,</span></span>
<span class="line"><span style="color:#A6ACCD;">        apply_index</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">u64</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#FFCB6B;">ChangeConfig</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">        change</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">ConfigChange</span><span style="color:#89DDFF;">,</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#89DDFF;">},</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div></li></ol><p>Qs:</p><ol><li>看到 lazy_worker 的 impl，既有 start fn 又有 start_with_timer fn，如何区分我想看的部分使用的是哪个？ 看他的上下文调用有时候看不出来怎么办？ 我选的方法是，直接全文搜索每个看一遍，然后在 server.rs 中看到 cdc_worker 有个 start_with_timer 实现，才确定与本问题相关，但这种方法在其实靠运气和猜测，有更好的方法吗？</li><li>有的时候 “vscode 语言助手 rust-analyzer” 只能看到一部分引用，比如： <code>counter arc&lt;automic&gt;</code>，只能看到 load，看不到 store 和 fetch_add，只能全局搜有的时候 “vscode 语言助手 rust-analyzer” 只能看到一部分引用，比如： <code>counter arc&lt;automic&gt;</code>，只能看到 load，看不到 store 和 fetch_add，只能全局搜索吗，全文搜索我得先知道有 fetch_add，才能全文搜索 <code>counter.fetch_add</code> 关键字？还是我打开的方法不对？因为我只有看到这个值什么时候改变，才能知道他的作用，也更利于排查问题。索吗，全文搜索我得先知道有 fetch_add，才能全文搜索 <code>counter.fetch_add</code> 关键字？还是我打开的方法不对？因为我只有看到这个值什么时候改变，才能知道他的作用，也更利于排查问题。</li><li>Rust Clone 和 Copy 的区别（认识对吗？）：<br> a. 默认 rust 能 Copy 的其实就是 “内存浅拷贝，即：只移动栈指针，指向堆空间地址，堆不动”。<br> b. Clone 功能与 Copy 相同，但存在一些限制，主要作用是为了弥补无默认实现 Copy 类型的地方。具体是深拷贝还是浅拷贝依赖于具体类型，需要 developer 手动实现。</li></ol>`,11),e=[p];function t(c,r,D,i,C,y){return a(),n("div",null,e)}const d=s(l,[["render",t]]);export{A as __pageData,d as default};