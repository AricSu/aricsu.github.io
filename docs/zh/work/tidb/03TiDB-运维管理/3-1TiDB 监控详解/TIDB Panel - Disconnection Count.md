1. 面板简介
   该面板统计 APP <--> TiDB 之间断开连接的数量及分类。
2. 面板位置
Cluster-TiDB --> Server --> Disconnection Count
图片
3. 面板详情
   主要由 3 类构成
error
ok
undetermined

   ok : 此类型指标只有在接到 APP 主动断联请求后才会增长。
图片
   error : 此类指标通常指向网络异常，引发的意外断联，主要由下述 3 类情况构成。
       a. 如图kill query/session 引发的断联，可在 tidb.log 看到关键字 “read packet timeout because of killed connection” 或 “read packet timeout, close this connection”。
图片
       b. 超过参数 max_allowed_packet 限制，引发断联，可在 tidb.log 中发现关键字 “Got a packet bigger than 'max_allowed_packet' bytes”。
       c. 链接被中间件或位置组建杀掉（既不是 APP 又不是 TiDB），依照经验看通常是由于 Haproxy/Nginx/F5 等中间件配置导致，如：未配置探活参数定期杀不活跃链接。在 tidb.log 中会发现关键字 “use of closed network connection” 或 “read packet failed, close this connection”。
   undetermined : 此类指标指 tidb-server 无法确定事务是否已成功提交时报错至最上层，即：没收到 TXN Primary key 的请求的响应，需要结合上下文进一步分析。在 tidb.log 中可以看到 “result undetermined, close this connection”。
图片

4. 参考文献
refine errors for undetermined result : https://github.com/pingcap/tidb/pull/3423
tidb 官方文档 : https://docs.pingcap.com/zh/tidb/v7.5/grafana-tidb-dashboard#server
