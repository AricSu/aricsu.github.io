import{_ as s,c as n,o as a,N as l}from"./chunks/framework.0799945b.js";const d=JSON.parse('{"title":"事务的隔离级别","description":"","frontmatter":{},"headers":[],"relativePath":"zh/tidb/01TiDB-原理总结/1-1论文阅读/05数据库的隔离级别.md"}'),p={name:"zh/tidb/01TiDB-原理总结/1-1论文阅读/05数据库的隔离级别.md"},e=l(`<h1 id="事务的隔离级别" tabindex="-1">事务的隔离级别 <a class="header-anchor" href="#事务的隔离级别" aria-label="Permalink to &quot;事务的隔离级别&quot;">​</a></h1><p>时间：2021-01-14</p><h2 id="隔离级别理论简介" tabindex="-1">隔离级别理论简介 <a class="header-anchor" href="#隔离级别理论简介" aria-label="Permalink to &quot;隔离级别理论简介&quot;">​</a></h2><table><thead><tr><th>事务隔离级别</th><th>脏读</th><th>不可重复读</th><th>幻读</th><th>备注</th></tr></thead><tbody><tr><td>读未提交（read-uncommitted）</td><td>是</td><td>是</td><td>是</td><td>read-uncommitted 即会出现脏读，也会出现不可重复读、幻读;</td></tr><tr><td>不可重复读（read-committed）</td><td>否</td><td>是</td><td>是</td><td>read-committed 会出现幻读和不可重复读;</td></tr><tr><td>可重复读（repeatable-read）</td><td>否</td><td>否</td><td>是</td><td>repeatable-read 不会出现不可重复读，会出现幻读;</td></tr><tr><td>串行化（serializable）</td><td>否</td><td>否</td><td>否</td><td>serializable 以上三者均不会出现;</td></tr></tbody></table><p>Read Uncommitted（读取未提交内容） 在该隔离级别，所有事务都可以看到其他未提交事务的执行结果。本隔离级别很少用于实际应用，因为它的性能也不比其他级别好多少。读取未提交的数据，也被称之为脏读（Dirty Read）。</p><p>Read Committed（读取提交内容） 这是大多数数据库系统的默认隔离级别（但不是MySQL默认的）。它满足了隔离的简单定义：一个事务只能看见已经提交事务所做的改变。这种隔离级别 也支持所谓的不可重复读（Nonrepeatable Read），因为同一事务的其他实例在该实例处理其间可能会有新的commit，所以同一select可能返回不同结果。</p><p>Repeatable Read（可重读） 这是MySQL的默认事务隔离级别，它确保同一事务的多个实例在并发读取数据时，会看到同样的数据行。不过理论上，这会导致另一个棘手的问题：幻读 （Phantom Read）。简单的说，幻读指当用户读取某一范围的数据行时，另一个事务又在该范围内插入了新行，当用户再读取该范围的数据行时，会发现有新的“幻影” 行。InnoDB和Falcon存储引擎通过多版本并发控制（MVCC，Multiversion Concurrency Control）机制解决了该问题。</p><p>Serializable（序列化） 这是最高的隔离级别，它通过强制事务排序，使之不可能相互冲突，从而解决幻读问题。简言之，它是在每个读的数据行上加上共享锁。在这个级别，可能导致大量的超时现象和锁竞争。</p><p>由MVCC实现的可重复读</p><ul><li><p>快照读：</p></li><li><p>当前读：</p></li></ul><h2 id="postgresql事务隔离级别实验" tabindex="-1">PostgreSQL事务隔离级别实验 <a class="header-anchor" href="#postgresql事务隔离级别实验" aria-label="Permalink to &quot;PostgreSQL事务隔离级别实验&quot;">​</a></h2><p>本次实验采用postgreSQL</p><ul><li>构造实验数据集</li></ul><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# create table jan_isolation_test(id int primary key,name varchar(20),age int);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# insert into jan_isolation_test values (1,&#39;jan_1&#39;,21),(2,&#39;jan_2&#39;,22);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h4 id="read-uncommitted读已经提交case实验" tabindex="-1">READ-UNCOMMITTED读已经提交CASE实验 <a class="header-anchor" href="#read-uncommitted读已经提交case实验" aria-label="Permalink to &quot;READ-UNCOMMITTED读已经提交CASE实验&quot;">​</a></h4><h4 id="read-committed读已经提交case实验" tabindex="-1">READ-COMMITTED读已经提交CASE实验 <a class="header-anchor" href="#read-committed读已经提交case实验" aria-label="Permalink to &quot;READ-COMMITTED读已经提交CASE实验&quot;">​</a></h4><p>更改两个session的隔离级别</p><ul><li>读已提交出现幻读<br> session 1 在同一个事务期间的两次查询，因为 session 2 在另一个已提交事务中进行的 insert 和 delete 操作，而前后三次查出不同的结果，因此产生幻读。</li></ul><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# set default_transaction_isolation=&#39;READ COMMITTED&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# show transaction_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;"> transaction_isolation </span></span>
<span class="line"><span style="color:#A6ACCD;">-----------------------</span></span>
<span class="line"><span style="color:#A6ACCD;"> read committed</span></span>
<span class="line"><span style="color:#A6ACCD;">(1 row)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# set default_transaction_isolation=&#39;READ COMMITTED&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# show transaction_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;"> transaction_isolation </span></span>
<span class="line"><span style="color:#A6ACCD;">-----------------------</span></span>
<span class="line"><span style="color:#A6ACCD;"> read committed</span></span>
<span class="line"><span style="color:#A6ACCD;">(1 row)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# begin;</span></span>
<span class="line"><span style="color:#A6ACCD;">BEGIN</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  23</span></span>
<span class="line"><span style="color:#A6ACCD;">(2 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=#  begin;</span></span>
<span class="line"><span style="color:#A6ACCD;">BEGIN</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  23</span></span>
<span class="line"><span style="color:#A6ACCD;">(2 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# update jan_isolation_test set age=55;</span></span>
<span class="line"><span style="color:#A6ACCD;">UPDATE 2</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">(2 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  23</span></span>
<span class="line"><span style="color:#A6ACCD;">(2 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# insert into jan_isolation_test values(3,&#39;jan_3&#39;,23);</span></span>
<span class="line"><span style="color:#A6ACCD;">INSERT 0 1</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">  3 | jan_3 |  23</span></span>
<span class="line"><span style="color:#A6ACCD;">(3 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">(2 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# commit;</span></span>
<span class="line"><span style="color:#A6ACCD;">COMMIT</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">  3 | jan_3 |  23</span></span>
<span class="line"><span style="color:#A6ACCD;">(3 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# begin;</span></span>
<span class="line"><span style="color:#A6ACCD;">BEGIN</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# delete from jan_isolation_test where id=3;</span></span>
<span class="line"><span style="color:#A6ACCD;">DELETE 1</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# commit;</span></span>
<span class="line"><span style="color:#A6ACCD;">COMMIT</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  55</span></span>
<span class="line"><span style="color:#A6ACCD;">(2 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# rollback;</span></span>
<span class="line"><span style="color:#A6ACCD;">ROLLBACK</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;">(2 rows)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><ul><li>读已提交出现不可重复读<br> session 1 在同一个事务中的两次查询，因为 session 2 在另一个提交事务的修改得到了不同的结果，产生了不可重复读。</li></ul><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# set default_transaction_isolation=&#39;READ COMMITTED&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;">SET</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# show transaction_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;"> transaction_isolation </span></span>
<span class="line"><span style="color:#A6ACCD;">-----------------------</span></span>
<span class="line"><span style="color:#A6ACCD;"> read committed</span></span>
<span class="line"><span style="color:#A6ACCD;">(1 row)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# set default_transaction_isolation=&#39;READ COMMITTED&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;">SET</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# show transaction_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;"> transaction_isolation </span></span>
<span class="line"><span style="color:#A6ACCD;">-----------------------</span></span>
<span class="line"><span style="color:#A6ACCD;"> read committed</span></span>
<span class="line"><span style="color:#A6ACCD;">(1 row)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# begin;</span></span>
<span class="line"><span style="color:#A6ACCD;">BEGIN</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# begin;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# update jan_isolation_test set age=66;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;"># postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  66</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  66</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h4 id="repeatable-read可重复读case实验" tabindex="-1">REPEATABLE-READ可重复读CASE实验 <a class="header-anchor" href="#repeatable-read可重复读case实验" aria-label="Permalink to &quot;REPEATABLE-READ可重复读CASE实验&quot;">​</a></h4><p>改变两个session的隔离级别</p><ul><li>REPEATABLE—READ不会出现幻读</li></ul><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# set default_transaction_isolation=&#39;repeatable read&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;">SET</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=#  show transaction_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;"> transaction_isolation </span></span>
<span class="line"><span style="color:#A6ACCD;">-----------------------</span></span>
<span class="line"><span style="color:#A6ACCD;"> repeatable read</span></span>
<span class="line"><span style="color:#A6ACCD;">(1 row)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# set default_transaction_isolation=&#39;repeatable read&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;">SET</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=#  show transaction_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;"> transaction_isolation </span></span>
<span class="line"><span style="color:#A6ACCD;">-----------------------</span></span>
<span class="line"><span style="color:#A6ACCD;"> repeatable read</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# begin;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# begin;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# insert into jan_isolation_test values (3,&#39;jan_3&#39;,23);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# delete from jan_isolation_test where id=3;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# begin;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# begin;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# insert into jan_isolation_test values(3,&#39;jan_3&#39;,23);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;"># postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  22</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  21</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# update jan_isolation_test set age = 66;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"> id | name  | age </span></span>
<span class="line"><span style="color:#A6ACCD;">----+-------+-----</span></span>
<span class="line"><span style="color:#A6ACCD;">  3 | jan_3 |  23</span></span>
<span class="line"><span style="color:#A6ACCD;">  2 | jan_2 |  66</span></span>
<span class="line"><span style="color:#A6ACCD;">  1 | jan_1 |  66</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><ul><li>出现不可重复读</li></ul><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# set default_transaction_isolation=&#39;READ COMMITTED&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# show transaction_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;"> transaction_isolation </span></span>
<span class="line"><span style="color:#A6ACCD;">-----------------------</span></span>
<span class="line"><span style="color:#A6ACCD;"> read committed</span></span>
<span class="line"><span style="color:#A6ACCD;">(1 row)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# set default_transaction_isolation=&#39;READ COMMITTED&#39;;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">postgres=# show transaction_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;"> transaction_isolation </span></span>
<span class="line"><span style="color:#A6ACCD;">-----------------------</span></span>
<span class="line"><span style="color:#A6ACCD;"> read committed</span></span>
<span class="line"><span style="color:#A6ACCD;">(1 row)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><h4 id="serializable序列化case实验" tabindex="-1">SERIALIZABLE序列化CASE实验 <a class="header-anchor" href="#serializable序列化case实验" aria-label="Permalink to &quot;SERIALIZABLE序列化CASE实验&quot;">​</a></h4><h2 id="mysql验证repeatable-read" tabindex="-1">MySQL验证REPEATABLE-READ <a class="header-anchor" href="#mysql验证repeatable-read" aria-label="Permalink to &quot;MySQL验证REPEATABLE-READ&quot;">​</a></h2><p><img src="http://cdn.lifemini.cn/dbblog/20210114/2ea5088487414a6fa0af0a73c4973d5f.png" alt="image.png"></p><p>版本信息与构造实验数据</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;">mysql&gt; select @@tx_isolation;</span></span>
<span class="line"><span style="color:#A6ACCD;">+-----------------+</span></span>
<span class="line"><span style="color:#A6ACCD;">| @@tx_isolation  |</span></span>
<span class="line"><span style="color:#A6ACCD;">+-----------------+</span></span>
<span class="line"><span style="color:#A6ACCD;">| REPEATABLE-READ |</span></span>
<span class="line"><span style="color:#A6ACCD;">+-----------------+</span></span>
<span class="line"><span style="color:#A6ACCD;">1 row in set, 1 warning (0.00 sec)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; select version();</span></span>
<span class="line"><span style="color:#A6ACCD;">+------------+</span></span>
<span class="line"><span style="color:#A6ACCD;">| version()  |</span></span>
<span class="line"><span style="color:#A6ACCD;">+------------+</span></span>
<span class="line"><span style="color:#A6ACCD;">| 5.7.32-log |</span></span>
<span class="line"><span style="color:#A6ACCD;">+------------+</span></span>
<span class="line"><span style="color:#A6ACCD;">1 row in set (0.00 sec)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;">+----+-------+------+</span></span>
<span class="line"><span style="color:#A6ACCD;">| id | name  | age  |</span></span>
<span class="line"><span style="color:#A6ACCD;">+----+-------+------+</span></span>
<span class="line"><span style="color:#A6ACCD;">|  1 | jan_1 |   21 |</span></span>
<span class="line"><span style="color:#A6ACCD;">|  2 | jan_2 |   22 |</span></span>
<span class="line"><span style="color:#A6ACCD;">+----+-------+------+</span></span>
<span class="line"><span style="color:#A6ACCD;">2 rows in set (0.00 sec)</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; begin;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; begin;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; insert into jan_isolation_test values(3,&#39;jan_3&#39;,23);</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 2</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; update jan_isolation_test set age=55;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; commit;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span>
<span class="line"><span style="color:#A6ACCD;"># session 1</span></span>
<span class="line"><span style="color:#A6ACCD;">mysql&gt; select * from jan_isolation_test;</span></span>
<span class="line"><span style="color:#A6ACCD;"></span></span></code></pre></div>`,34),o=[e];function t(c,i,C,A,r,y){return a(),n("div",null,o)}const _=s(p,[["render",t]]);export{d as __pageData,_ as default};
