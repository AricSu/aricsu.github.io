import{_ as s}from"./chunks/02-DM_Master_Components.189c6555.js";import{_ as e,c as n,o as a,N as o}from"./chunks/framework.0799945b.js";const u=JSON.parse('{"title":"DM Master","description":"","frontmatter":{},"headers":[],"relativePath":"en/tidb/05TiDB-EcosystematicTools/5-4DM/03TiDB-DM Master.md"}'),t={name:"en/tidb/05TiDB-EcosystematicTools/5-4DM/03TiDB-DM Master.md"},l=o('<h1 id="dm-master" tabindex="-1">DM Master <a class="header-anchor" href="#dm-master" aria-label="Permalink to &quot;DM Master&quot;">​</a></h1><h2 id="what-s-dm-master" tabindex="-1">What&#39;s DM Master <a class="header-anchor" href="#what-s-dm-master" aria-label="Permalink to &quot;What&#39;s DM Master&quot;">​</a></h2><p><img src="'+s+`" alt="DM_Master_Components"></p><h2 id="etcd" tabindex="-1">Etcd <a class="header-anchor" href="#etcd" aria-label="Permalink to &quot;Etcd&quot;">​</a></h2><p><strong>How does DM Master high availability work.</strong> Mostly, It&#39;s due to the avaliable characteristics of ectd, which&#39;s stored all persist data in DM Cluster. Meanwhile, by <a href="#election">the Election</a>, only the leader of DM Master is able to start working components and work with etcd,and the leader also periodically, checks if there&#39;s something seriously wrong with DM. Do the recover action right now at the right time.</p><h2 id="openapihandles" tabindex="-1">OpenapiHandles <a class="header-anchor" href="#openapihandles" aria-label="Permalink to &quot;OpenapiHandles&quot;">​</a></h2><p>DM provids <a href="https://docs.pingcap.com/tidb/stable/dm-open-api" target="_blank" rel="noreferrer">OpenAPI</a> to operate/create tasks, sources, etc. Just like you use it in dm-ctl commands. Mainly it&#39;s implmented by OpenapiHandler encapsulated in DM Master. And it works when the DM Master leader started. At the same time, DM Worker peer will redirect request to the leader to deal with if the one receives OpenAPI requests.</p><h2 id="agentpool" tabindex="-1">AgentPool <a class="header-anchor" href="#agentpool" aria-label="Permalink to &quot;AgentPool&quot;">​</a></h2><ol><li><p>This component was added dut to <a href="https://github.com/pingcap/dm/pull/157" target="_blank" rel="noreferrer">this PR</a>, mainly looking forward to add rate limit and rpc client manage in dm-master. Though, it&#39;s the key component in the entire DM Master components, Why I decided to introducte the one is all because it appears inside the <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/server.go#L127" target="_blank" rel="noreferrer">Server</a> struct.</p></li><li><p>And the way it was implmented is just encapsulate the package of <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/agent_pool.go#L60" target="_blank" rel="noreferrer">golang rate.Limit</a> to filter.</p></li></ol><h2 id="election" tabindex="-1">Election <a class="header-anchor" href="#election" aria-label="Permalink to &quot;Election&quot;">​</a></h2><ol><li><strong>First</strong>, It&#39;s a comman package encapsulated to implment functionality of leader election based on etcd.</li><li><strong>Second</strong>, The function <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/pkg/election/election.go#L200" target="_blank" rel="noreferrer">compaignLoop</a> is the key to understand how the logical concept is continuously running. Periodically, it&#39;ll recampaign leader of DM master instances and <strong>the leader&#39;ll start</strong> some components including <code>Scheduler</code>, <code>Pessimist</code> and <code>Optimist</code>. The followers don&#39;t care about how to run the ones.</li><li><strong>Third,</strong> It also splits task into subtasks which represents only one source(or on worker) in one migration subtask(<strong>The conceptal fomuler : 1 worker VS 1 source VS 1 subtask</strong>).</li></ol><h2 id="scheduler" tabindex="-1">Scheduler <a class="header-anchor" href="#scheduler" aria-label="Permalink to &quot;Scheduler&quot;">​</a></h2><ol><li><strong>First</strong>, Scheduler is part of Master, which&#39;s responsible for tasks of DM worker, such as <code>register/unregister</code>, <code>observe the online/offline</code>, <code>observe add/remove source config</code>, <code>schedule upstream sources</code>, <code>schedule data migration subtask</code> and so forth, more details at <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/scheduler/scheduler.go#L44" target="_blank" rel="noreferrer">here</a>.</li><li><strong>Second</strong>, what scheduler actully does is that, on the one hand, some background gorountines are countinuous running after starting the master instance like <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/scheduler/scheduler.go#L2081" target="_blank" rel="noreferrer"><code>observeWorkerEvent</code></a> is going to reveive the keepalive status triggerd by DM Worker, on the other hand, the others will be triggered when dmctl or openAPI sends some operations, like: <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/scheduler/scheduler.go#L441" target="_blank" rel="noreferrer"><code>RemoveSourceCfg</code></a>. Mostly, the functions were embended in GRPC defining.</li><li><strong>Third</strong>, It also generates subTasks from one replication task and persist them on etcd.</li></ol><h2 id="pessimist" tabindex="-1">Pessimist <a class="header-anchor" href="#pessimist" aria-label="Permalink to &quot;Pessimist&quot;">​</a></h2><ol><li><p>First, we can see pessmist is come up with two parts of <code>DM Master</code> and <code>syncer</code> from the picture above. This part will focus on what the DM Master does inside. From <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L464" target="_blank" rel="noreferrer">the function handleInfoPut of DM Master</a>, we can make sure the one Info is handled by DM Master when the it receives enough Infos from etcd. Actually, dm-ctl also can generate operations ,like something seriously worng with DDL Lock, when you use <code>unlock-ddl-lock</code> inside using the logic of <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L343" target="_blank" rel="noreferrer"><code>waitOwnerToBeDone</code></a>. From code, <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/syncer/ddl.go#L641" target="_blank" rel="noreferrer">shardOp.Exec</a> will be true when it&#39;s the owner of shard DDL Lock and written by <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L605" target="_blank" rel="noreferrer">putOpForOwner</a> of DM master leader. What I mean is that this&#39;s the logic to implment actually the owner to execute the only one DDL to downstream. And in the <code>Syncer</code> of worker, what DM-worker does is just put info to etcd of DM-Master when <code>the HandleDDL function</code> receives any DDL MySQL binlog event, meanwhile, if it&#39;s the owner or first worker meets the DDL , it&#39;s also responsible for executing.</p></li><li><p>Second, PTAL at the conceptal logic of <a href="https://docs.pingcap.com/zh/tidb-data-migration/v5.3/feature-shard-merge-pessimistic#%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86" target="_blank" rel="noreferrer">shard-merge-pessimistic</a>. The <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/pkg/shardddl/pessimism/doc.go" target="_blank" rel="noreferrer">implement detail</a>. In short, what it actually does is keeping every DML in a DM Cluster before a specific DDL timestamp which hasn&#39;t been synced, till the end of the DDL finished. In short, if there is DDL replication in a sharding group(multi MySQL sharding tables into one TiDB table), the worker which&#39;s the first thing to meet the DDL query will notify DM-Master to generate a lock then block related DDL and DML queries. Till all the DDL of sources have been reported to DM-Master, the one worker which&#39;s already been chose as owner starts to execute the DDL. if the DDL was executed successfully, it&#39;ll replay the DDL and DML queries blocked and replay replication as usual.</p><p><img src="https://download.pingcap.com/images/tidb-data-migration/shard-ddl-flow.png" alt="pessimism"></p></li><li><p><code>LockKeeper</code> which encapsulates <code>Lock</code> used to keep and handle DDL lock conveniently, and lock has a 1 on 1 relationship with DDL at a specific time in a replication task. Both also don&#39;t need to be presistent. Because it can be re-constructed from the shard DDL info which were persisited in to etcd of DM-Master by DM-Worker. And, this strcut has a key founction named <code>TrySync</code>, which&#39;s to sync the lock <strong>by increasing the number of remain</strong>, which number is equal to the number of sources(related workers) if it&#39;s received the DDL event from MySQL Binlog.</p><div class="language-go"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">type</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Lock</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">struct</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">mu sync</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">RWMutex</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">ID     </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// lock&#39;s ID</span></span>
<span class="line"><span style="color:#A6ACCD;">Task   </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// lock&#39;s corresponding task name</span></span>
<span class="line"><span style="color:#A6ACCD;">Owner  </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// Owner&#39;s source ID (not DM-worker&#39;s name)</span></span>
<span class="line"><span style="color:#A6ACCD;">DDLs   </span><span style="color:#89DDFF;">[]</span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;font-style:italic;">// DDL statements</span></span>
<span class="line"><span style="color:#A6ACCD;">remain </span><span style="color:#C792EA;">int</span><span style="color:#A6ACCD;">      </span><span style="color:#676E95;font-style:italic;">// remain count of sources needed to receive DDL info</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// whether the DDL info received from the source.</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// if all of them have been ready, then we call the lock \`synced\`.</span></span>
<span class="line"><span style="color:#A6ACCD;">ready </span><span style="color:#89DDFF;">map[</span><span style="color:#C792EA;">string</span><span style="color:#89DDFF;">]</span><span style="color:#C792EA;">bool</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// whether the operations have done (exec/skip the shard DDL).</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// if all of them have done, then we call the lock \`resolved\`.</span></span>
<span class="line"><span style="color:#A6ACCD;">done </span><span style="color:#89DDFF;">map[</span><span style="color:#C792EA;">string</span><span style="color:#89DDFF;">]</span><span style="color:#C792EA;">bool</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">type</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">LockKeeper</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">struct</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">mu    sync</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">RWMutex</span></span>
<span class="line"><span style="color:#A6ACCD;">locks </span><span style="color:#89DDFF;">map[</span><span style="color:#C792EA;">string</span><span style="color:#89DDFF;">]*</span><span style="color:#A6ACCD;">Lock </span><span style="color:#676E95;font-style:italic;">// lockID -&gt; Lock</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div></li><li><p><code>Info</code> represents the shard DDL information and <code>Operation</code> represents a shard DDL coordinate operation ,which all of information should be persistent in etcd. Another key defference between <code>Info</code> and <code>Operation</code> we have to know is something that the DM Worker just sends the Lock or DDL Info to the DM Master, and watch Operations from etcd of the one. So, DM Master will use <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/master/shardddl/pessimist.go#L601" target="_blank" rel="noreferrer"><code>func putOpForOwner</code></a> to put operation into etcd to executed the DDL.</p><div class="language-go"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;">type</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Info</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">struct</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    Task   </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;task&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// data migration task name</span></span>
<span class="line"><span style="color:#A6ACCD;">    Source </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;source&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;font-style:italic;">// upstream source ID</span></span>
<span class="line"><span style="color:#A6ACCD;">    Schema </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;schema&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;font-style:italic;">// schema name of the DDL</span></span>
<span class="line"><span style="color:#A6ACCD;">    Table  </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;table&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">  </span><span style="color:#676E95;font-style:italic;">// table name of the DDL</span></span>
<span class="line"><span style="color:#A6ACCD;">    DDLs   </span><span style="color:#89DDFF;">[]</span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;ddls&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// DDL statements</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">type</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Operation</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">struct</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">    ID     </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;id&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">     </span><span style="color:#676E95;font-style:italic;">// the corresponding DDL lock ID</span></span>
<span class="line"><span style="color:#A6ACCD;">    Task   </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;task&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// data migration task name</span></span>
<span class="line"><span style="color:#A6ACCD;">    Source </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;source&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;font-style:italic;">// upstream source ID</span></span>
<span class="line"><span style="color:#A6ACCD;">    DDLs   </span><span style="color:#89DDFF;">[]</span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;ddls&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// DDL statements</span></span>
<span class="line"><span style="color:#A6ACCD;">    Exec   </span><span style="color:#C792EA;">bool</span><span style="color:#A6ACCD;">     </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;exec&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// execute or skip the DDL statements</span></span>
<span class="line"><span style="color:#A6ACCD;">    Done   </span><span style="color:#C792EA;">bool</span><span style="color:#A6ACCD;">     </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;done&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// whether the \`Exec\` operation has done</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#676E95;font-style:italic;">// only used to report to the caller of the watcher, do not marsh it.</span></span>
<span class="line"><span style="color:#A6ACCD;">    </span><span style="color:#676E95;font-style:italic;">// if it&#39;s true, it means the Operation has been deleted in etcd.</span></span>
<span class="line"><span style="color:#A6ACCD;">    IsDeleted </span><span style="color:#C792EA;">bool</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;-&quot;</span><span style="color:#89DDFF;">\`</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div></li><li><p>At the end, I wanna claim here there&#39;re lots of key functions relevent to persist data like <code>handleInfoPut</code>, <code>handleOperationPut</code> and so forth. All of them are acting with the etcd of DM Master. But, in my main-step-pic, all didn&#39;t be carved clearly.</p></li><li><p>If you wanna more details, I recommand you to read this <a href="https://tidb.net/blog/ebc3d5e6" target="_blank" rel="noreferrer">content</a>, which describes more info about how Lock is resolved, and how DMLs are resynced(I mentioned above the concept is block, actually it&#39;s ignored) at <a href="https://tidb.net/blog/80c41c9d" target="_blank" rel="noreferrer">here</a>. These content don&#39;t have english version, please use other translating tools to solve that problem.</p></li></ol><h2 id="optimist" tabindex="-1">Optimist <a class="header-anchor" href="#optimist" aria-label="Permalink to &quot;Optimist&quot;">​</a></h2><ol><li><p>There&#39;a also an important <a href="https://docs.pingcap.com/zh/tidb-data-migration/v5.3/feature-shard-merge-optimistic#%E5%8E%9F%E7%90%86" target="_blank" rel="noreferrer">conceptal logic</a> you have to know fist. I&#39;ll also take a summarize for the mode, the key tuning is that DDL doesn&#39;t blocking DML replication comparing with pessmistic mode.</p></li><li><p>LockKeeper and Lock are used to keep and handle DDL lock conveniently. The conceptally logical function is equal to Lock in pessimism. This&#39;s highly equal to part of pessmist.</p></li><li><p>And also there&#39;s a <a href="https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/pkg/shardddl/optimism/doc.go#L16" target="_blank" rel="noreferrer">doc</a> just simply saying different from pessmist. Actually I think you could read this page which&#39;s equal to the one or even more info you can get <a href="https://docs.pingcap.com/tidb-data-migration/v5.3/feature-shard-merge-optimistic#restrictions" target="_blank" rel="noreferrer">here</a>. Let&#39;s get started to look what the DM Master does about sharding DDL replication in optimistic.</p><p><img src="https://download.pingcap.com/images/tidb-data-migration/optimistic-ddl-flow.png" alt="optimistic"></p></li><li><p>We can simply get that the Info and the Operation differ from pessmist by their structs. The info operatied by optimist includes many more things than pessmist like <code>TableInfoBefore</code>, <code>TableInfosAfter</code>, <code>DownTable</code> and so on, which are used to calculate how DDL should be converted.</p><div class="language-go"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki material-theme-palenight has-diff"><code><span class="line"><span style="color:#89DDFF;">type</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Info</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">struct</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">Task       </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;task&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">        </span><span style="color:#676E95;font-style:italic;">// data migration task name</span></span>
<span class="line"><span style="color:#A6ACCD;">Source     </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;source&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">      </span><span style="color:#676E95;font-style:italic;">// upstream source ID</span></span>
<span class="line"><span style="color:#A6ACCD;">UpSchema   </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;up-schema&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// upstream/source schema name, different sources can have the same schema name</span></span>
<span class="line"><span style="color:#A6ACCD;">UpTable    </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;up-table&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">    </span><span style="color:#676E95;font-style:italic;">// upstream/source table name, different sources can have the same table name</span></span>
<span class="line"><span style="color:#A6ACCD;">DownSchema </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;down-schema&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;font-style:italic;">// downstream/target schema name</span></span>
<span class="line"><span style="color:#A6ACCD;">DownTable  </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;down-table&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">  </span><span style="color:#676E95;font-style:italic;">// downstream/target table name</span></span>
<span class="line"><span style="color:#A6ACCD;">DDLs       </span><span style="color:#89DDFF;">[]</span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;ddls&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">        </span><span style="color:#676E95;font-style:italic;">// DDL statements</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">TableInfoBefore </span><span style="color:#89DDFF;">*</span><span style="color:#A6ACCD;">model</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">TableInfo   </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;table-info-before&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;font-style:italic;">// the tracked table schema before applying the DDLs</span></span>
<span class="line"><span style="color:#A6ACCD;">TableInfosAfter </span><span style="color:#89DDFF;">[]*</span><span style="color:#A6ACCD;">model</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">TableInfo </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;table-info-after&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">  </span><span style="color:#676E95;font-style:italic;">// the tracked table schema after applying the DDLs</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// only used to report to the caller of the watcher, do not marsh it.</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// if it&#39;s true, it means the Info has been deleted in etcd.</span></span>
<span class="line"><span style="color:#A6ACCD;">IsDeleted </span><span style="color:#C792EA;">bool</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;-&quot;</span><span style="color:#89DDFF;">\`</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// only set it when get/watch from etcd</span></span>
<span class="line"><span style="color:#A6ACCD;">Version </span><span style="color:#C792EA;">int64</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;-&quot;</span><span style="color:#89DDFF;">\`</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// only set it when get from etcd</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// use for sort infos in recoverlock</span></span>
<span class="line"><span style="color:#A6ACCD;">Revision </span><span style="color:#C792EA;">int64</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;-&quot;</span><span style="color:#89DDFF;">\`</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// use to resolve conflict</span></span>
<span class="line"><span style="color:#A6ACCD;">IgnoreConflict </span><span style="color:#C792EA;">bool</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;ignore-conflict&quot;</span><span style="color:#89DDFF;">\`</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="color:#89DDFF;">type</span><span style="color:#A6ACCD;"> </span><span style="color:#FFCB6B;">Operation</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">struct</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">ID            </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;id&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">               </span><span style="color:#676E95;font-style:italic;">// the corresponding DDL lock ID</span></span>
<span class="line"><span style="color:#A6ACCD;">Task          </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;task&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">             </span><span style="color:#676E95;font-style:italic;">// data migration task name</span></span>
<span class="line"><span style="color:#A6ACCD;">Source        </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;source&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">           </span><span style="color:#676E95;font-style:italic;">// upstream source ID</span></span>
<span class="line"><span style="color:#A6ACCD;">UpSchema      </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;up-schema&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">        </span><span style="color:#676E95;font-style:italic;">// upstream/source schema name, different sources can have the same schema name</span></span>
<span class="line"><span style="color:#A6ACCD;">UpTable       </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;up-table&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">         </span><span style="color:#676E95;font-style:italic;">// upstream/source table name, different sources can have the same table name</span></span>
<span class="line"><span style="color:#A6ACCD;">DDLs          </span><span style="color:#89DDFF;">[]</span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">      </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;ddls&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">             </span><span style="color:#676E95;font-style:italic;">// DDL statements need to apply to the downstream.</span></span>
<span class="line"><span style="color:#A6ACCD;">ConflictStage ConflictStage </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;conflict-stage&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">   </span><span style="color:#676E95;font-style:italic;">// current conflict stage.</span></span>
<span class="line"><span style="color:#A6ACCD;">ConflictMsg   </span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">        </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;conflict-message&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;"> </span><span style="color:#676E95;font-style:italic;">// current conflict message</span></span>
<span class="line"><span style="color:#A6ACCD;">Done          </span><span style="color:#C792EA;">bool</span><span style="color:#A6ACCD;">          </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;done&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">             </span><span style="color:#676E95;font-style:italic;">// whether the operation has done</span></span>
<span class="line"><span style="color:#A6ACCD;">Cols          </span><span style="color:#89DDFF;">[]</span><span style="color:#C792EA;">string</span><span style="color:#A6ACCD;">      </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;cols&quot;</span><span style="color:#89DDFF;">\`</span><span style="color:#A6ACCD;">             </span><span style="color:#676E95;font-style:italic;">// drop columns&#39; name</span></span>
<span class="line"></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// only set it when get from etcd</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;">// use for sort infos in recovering locks</span></span>
<span class="line"><span style="color:#A6ACCD;">Revision </span><span style="color:#C792EA;">int64</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">\`</span><span style="color:#C3E88D;">json:&quot;-&quot;</span><span style="color:#89DDFF;">\`</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span></code></pre></div></li><li><p><strong>How DM Master converts DDL info or schema info</strong> is just trying to detect if there&#39;s any DDL conflict and allow every DML sync to downstream ASAP. And if there&#39;s an error or conflict, it&#39;ll be reported.</p></li></ol>`,17),p=[l];function r(c,i,D,y,d,h){return a(),n("div",null,p)}const m=e(t,[["render",r]]);export{u as __pageData,m as default};