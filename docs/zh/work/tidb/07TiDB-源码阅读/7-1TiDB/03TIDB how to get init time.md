# 如果获取 TiDB 集群初始化时间

## 一、前言

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;很久没写文章了，今天在同事的提示的情况下，处理了一个 TiDB 获取集群创建时间的问题，觉得有必要记录一下防止遗忘，也分享给大家。

## 二、探索

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;首先，翻遍 TiDB 官方文档也没有找到能够查询 TiDB 集群初始化时间的方法。所有监控信息（Dashboard、Grafana）都只能仅查询各组件的 Startup Time，查询表的 Create Time 也不准确。  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;其次，之前知道在集群初始化的时候 PD 会初始化一个 ClusterID 并持久化。即然，TiDB 官方没有提供查询接口，那能够分别集群的也许只有这一个信息了。最开始，一直在尝试使用 pd-ctl 的 `tiup ctl:v5.2.3 pd tso 1571036791` 直接转译 TSO ，但始终没有成功。  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最后在一位同事的提醒下，翻了下 PD 在初始化 Cluster_ID 时的源码,才成功解决问题。详情见 **三、解决** 部分。

## 三、解决

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;看了下 PD 代码，在这个 [initOrGetClusterID](https://github.com/tikv/pd/blob/88409b75418f0de46b62b7121627c23359b571b3/server/util.go#L86-L93) 函数中，Cluster ID 是取当前时间的 Unix 时间戳左移 32 位，再加一个随机数获得。因此直接转译是无法获得正确时间的。

![03code_cluster_id](../../../../../images/tidb/07TiDB-CodeReading/03code_cluster_id.jpeg)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;做了一些小改动，逆着代码思路取出的时间基本符合要求，能确保年月日级别的准确性。大家也可以直接点击 [代码链接](http://www.dooccn.com/go/#id/7cdec42e1b4f7825c26d8a5343555b5a ) 直接修改其中 Cluster ID 值获取结果。

![04code_cluster_id_translate](../../../../../images/tidb/07TiDB-CodeReading/04code_cluster_id_translate.png)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;其实，之后尝试过右移 32 位再用 pd-ctl tso 转译还是不成功的。估计是因为 TiDB 的 TSO 由 “物理时间+逻辑时间” 组成，而 Cluster ID 的计算由 “物理时间+随机数” 组成吧，本身就不是一个东西吧。

## 四、代码逻辑

```go
package main

import ("fmt"
  "time")

func main() {

 //Get from pd.log (cat {{/path/to}}/pd.log|grep "init cluster id")
 //  [2019/10/14 10:35:38.880 +00:00] [INFO] [server.go:212] ["init cluster id"] [cluster-id=6747551640615446306]
 history_ts := uint64(6747551640615446306)
 sub_history_ts := history_ts >> 32
 ret := time.Unix(int64(sub_history_ts),0)
 fmt.Println(ret)
 fmt.Println("And the direct >>32 cluster-id is : ", sub_history_ts ,",you can try it by pd-ctl,but not correct!!!")
 //Although there is random number, but the year/month/day is still accurate 
 // --> 2019/10/14 vs 2019-10-14
}
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;希望对大家有帮助！同时，我也把改文章分享在 [AskTUG-TiDB 如何获取集群创建时间](https://asktug.com/t/topic/542865) 欢迎交流。
