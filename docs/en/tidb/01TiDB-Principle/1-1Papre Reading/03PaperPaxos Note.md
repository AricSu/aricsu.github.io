# What problem does Paxos reslove

Paxos算法常被引用于分布式相关文章，借助针对希腊城邦议会立法的场景，主要探讨在人员不断变化等不确定性因素的前提下如何基于一定的规则达成共识方法。作者借用对场景的探讨隐喻分布式计算机系统的解决办法，以较易于理解的形式阐述、并验证了该算法的正确性。

## 《Paxos Made Simple》简述

* **文章由来**

Paxos算法的Paper原文为《The Part-Time Parliament》，但因作者lamport采用隐喻的方式表达及算法本身的复杂性，使得该算法难以被学习者接受。因此，作者推出了《Paxos Made Simple》帮助学习者们理解和学习改算法。

* **文章结构**

《Paxos Made Simple》文章大致分为Introduction、The Consensus Algorithm、The Implementation三个部分，一致性算法部分可谓中重工之重。该部分，主要讲解了存在的问题、传播被promise的值，处理、具体的实现。

* **拜占庭容错共识算法的两个指标**

 安全性(safety)：safety means nothing bad happens.
（安全性意味着多状态机的最终一致性。）
 活性(liveness)：liveness means that something good eventually happens.
（活性意味着message可以延迟到达，但绝不能丢失。）

为确保安全性，还需满足如下要求：
（1） 每次propose，仅1个值被propose；
（2） 每次propose，仅1个值被promise；
（3） 每次propose，进程从不promise比自己小的值，除非等于自己的值；

为确保活性，还需满足如下要求：

2312312312312

作者理论的前提是，不出现拜占庭容错误，既：不丢失活性；

* **Proposal的过程**

P1条件：acceptor必须接受第一次被propose的值；

P2条件：如果accepter已promise过的value，那个被promise的更大number的proposal携带的value是同一个。

P2a条件：如果accepter已promise过的value，那个被promise的更大number的proposal携带的value是同一个，且被所有acceptor所promise。（在满足P1和P2的前提下推导出P2a）

P2b条件：如果accepter已promise过的value，那个被promise的更大number的proposal携带的value是同一个，proposer不会发送比当前number小的proposal。（在既满足进展性，又满足P1条件的前提时，会出现活锁问题违背P2a条件，通过增强P2a的方式解决解决。）

P2c条件：对于任意的v和n，如果有value为v且number为n的proposal被分发，因为acceptor是所有acceptor中的大多数（简称：S），则可推断出当前的S中的values值，要么没有promise过任何小于n的value，要么当前S所promise过的是proposal中的最大number所携带的值。

**此处要插入时序图**

```
Phase 1. (a) A proposer selects a proposal number n and sends a prepare
request with number n to a majority of acceptors.
(b) If an acceptor receives a prepare request with number n greater
than that of any prepare request to which it has already responded,
then it responds to the request with a promise not to accept any more
proposals numbered less than n and with the highest-numbered proposal (if any) that it has accepted.
5
Phase 2. (a) If the proposer receives a response to its prepare requests
(numbered n) from a majority of acceptors, then it sends an accept
request to each of those acceptors for a proposal numbered n with a
value v, where v is the value of the highest-numbered proposal among
the responses, or is any value if the responses reported no proposals.
(b) If an acceptor receives an accept request for a proposal numbered
n, it accepts the proposal unless it has already responded to a prepare
request having a number greater than n.
```

### 活锁问题理解与处理

### 《The Part-Time Parliament》简述

### 参考文章

[***Leslie Lamport博客***](http://lamport.azurewebsites.net/pubs/pubs.html)
[***The Part-Time Parliament原文***](https://courses.cs.washington.edu/courses/csep590/04wi/papers/lamport-part-time-parliament.pdf)
[***Paxos Made Simple原文***](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)
[***The Part-Time Parliament译文***](https://www.cnblogs.com/hzmark/p/The_Part-Time_Parliament.html)
[***Re-visiting of Paxos Made Simple译文***](https://www.jianshu.com/p/67dd80555ba2)
[***简书-孙如绿叶的拜占庭算法理解***](https://www.jianshu.com/p/21785016f412)
[***知乎-潇湘夜雨理解两阶段提交***](https://zhuanlan.zhihu.com/p/111304281)
[***知乎-牛吃草raft协议理解***](https://zhuanlan.zhihu.com/p/91288179)
[***itpub-Oracle行锁及mvcc实现原理***](http://blog.itpub.net/9683969/viewspace-672920/)
[***知乎-祥光的文章(1)Paxos、Raft分布式一致性算法应用场景***](https://zhuanlan.zhihu.com/p/31727291)
[***知乎-祥光的文章(2)Paxos算法详解***](https://zhuanlan.zhihu.com/p/31780743)
[***博客园-杭州.Mark的文章***](https://www.cnblogs.com/hzmark/p/The_Part-Time_Parliament.html)
