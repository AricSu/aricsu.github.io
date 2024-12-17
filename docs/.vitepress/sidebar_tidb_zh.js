export const tidbDocZhSideBar = [
    {text: "TiDB-原理总结", items: [
            { text: "论文阅读", items: [
                { text: "Percolator 分布式事务", link: "/zh/tidb/01TiDB-原理总结/1-1论文阅读/01Percolator 分布式事务.md"},
                { text: "PaperPaxos 论文简读", link: "/zh/tidb/01TiDB-原理总结/1-1论文阅读/02PaperPaxos 论文简读.md"},
                { text: "Spanner 分布式事务", link: "/zh/tidb/01TiDB-原理总结/1-1论文阅读/03Spanner 分布式事务.md"},
                { text: "LSMTree 存储笔记", link: "/zh/tidb/01TiDB-原理总结/1-1论文阅读/04LSMTree 存储笔记.md"},
                { text: "数据库的隔离级别", link: "/zh/tidb/01TiDB-原理总结/1-1论文阅读/05数据库的隔离级别.md"},
            ] },
            { text: "TiDB Optimizer", items: [
                { text: "Logical Optimizing in TiDB", link: "/zh/tidb/01TiDB-原理总结/1-2TiDB Optimizer/01Logical Optimizing in TiDB.md"},
                { text: "Physical Optimizing in TiDB", link: "/zh/tidb/01TiDB-原理总结/1-2TiDB Optimizer/02Physical Optimizing in TiDB.md"},
            ] },
    ] },
    {text: "TIDB-部署实践", items: [
            { text: "Ansible 部署实践", items: [
                { text: "Ansible 部署与扩缩容", link: "/zh/tidb/02TIDB-部署实践/2-1Ansible 部署实践/01Ansible 部署与扩缩容.md"},
                { text: "Ansible 修改集群配置", link: "/zh/tidb/02TIDB-部署实践/2-1Ansible 部署实践/02Ansible 修改集群配置.md"},
            ] },
            { text: "TiUP 部署实践", items: [
                { text: "TiUP 离线部署 TiDB", link: "/zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/01TiUP 离线部署 TiDB.md"},
                { text: "TiUP 扩缩容主要组件", link: "/zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/02TiUP 扩缩容主要组件.md"},
                { text: "TiUP 滚动升级 TiDB", link: "/zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/03TiUP 滚动升级 TiDB.md"},
                { text: "TiUP 单机混部多实例", link: "/zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/04TiUP 单机混部多实例.md"},
                { text: "TiUP 部署 TiSpark", link: "/zh/tidb/02TIDB-部署实践/2-2TiUP 部署实践/05TiUP 部署 TiSpark.md"},
            ] },
    ] },
    {text: "TiDB-运维管理", items: [
            { text: "TiDB 监控详解", items: [
                { text: "TLS 原理与应用", link: "/zh/tidb/03TiDB-运维管理/3-1TiDB 监控详解/01TLS 原理与应用.md"},
                { text: "TiDB 的 Prometheus", link: "/zh/tidb/03TiDB-运维管理/3-1TiDB 监控详解/02TiDB 的 Prometheus.md"},
                { text: "TiKV Details 详解", link: "/zh/tidb/03TiDB-运维管理/3-1TiDB 监控详解/03TiKV Details 详解.md"},
            ] },
            { text: "TiKV 监控详解", items: [
                { text: "TIKV 监控面板 - Allocator Stats", link: "/zh/tidb/03TiDB-运维管理/3-2TiKV 监控详解/01TIKV 监控面板 - Allocator Stats.md"},
            ] },
            { text: "非常规恢复", items: [
                { text: "重建PD", link: "/zh/tidb/03TiDB-运维管理/3-4非常规恢复/01重建PD.md"},
            ] },
    ] },
    {text: "TiDB-调优实践", items: [
            { text: "生产案例总结", items: [
                { text: "磁盘抖动导致 Duration 抖动", link: "/zh/tidb/04TiDB-调优实践/4-1生产案例总结/01磁盘抖动导致 Duration 抖动.md"},
                { text: "网卡打满导致 Duration 升高", link: "/zh/tidb/04TiDB-调优实践/4-1生产案例总结/02网卡打满导致 Duration 升高.md"},
            ] },
    ] },
    {text: "TiDB-生态工具", items: [
            { text: "TiCDC", items: [
                { text: "简述使用背景", link: "/zh/tidb/05TiDB-生态工具/5-1TiCDC/01简述使用背景.md"},
                { text: "剖析架构模型", link: "/zh/tidb/05TiDB-生态工具/5-1TiCDC/02剖析架构模型.md"},
                { text: "CDC组件解析", link: "/zh/tidb/05TiDB-生态工具/5-1TiCDC/03CDC组件解析.md"},
                { text: "监控原理解析", link: "/zh/tidb/05TiDB-生态工具/5-1TiCDC/04监控原理解析.md"},
            ] },
            { text: "Dumpling", items: [
                { text: "Dumpling 快速使用", link: "/zh/tidb/05TiDB-生态工具/5-3Dumpling/01Dumpling 快速使用.md"},
                { text: "Dumpling 架构原理", link: "/zh/tidb/05TiDB-生态工具/5-3Dumpling/02Dumpling 架构原理.md"},
            ] },
            { text: "DM", items: [
                { text: "TiDB-DM 架构总览", link: "/zh/tidb/05TiDB-生态工具/5-4DM/01TiDB-DM 架构总览.md"},
                { text: "TiDB-DM 快速使用", link: "/zh/tidb/05TiDB-生态工具/5-4DM/02TiDB-DM 快速使用.md"},
                { text: "TiDB-DM Master", link: "/zh/tidb/05TiDB-生态工具/5-4DM/03TiDB-DM Master.md"},
                { text: "TiDB-DM Worker", link: "/zh/tidb/05TiDB-生态工具/5-4DM/04TiDB-DM Worker.md"},
                { text: "TiDB-DM syncer", link: "/zh/tidb/05TiDB-生态工具/5-4DM/05TiDB-DM syncer.md"},
                { text: "TiDB-DM Metrics", link: "/zh/tidb/05TiDB-生态工具/5-4DM/06TiDB-DM Metrics.md"},
            ] },
            { text: "Binlog", items: [
                { text: "Binlog及Reparo原理与使用", link: "/zh/tidb/05TiDB-生态工具/5-6Binlog/01Binlog及Reparo原理与使用.md"},
            ] },
    ] },
    {text: "TiDB-解决方案", items: [
            { text: "迁移MyCat至TiDB方案", items: [
                { text: "TiChange脚本转换csv文件适配tidb-lightning", link: "/zh/tidb/06TiDB-解决方案/6-1迁移MyCat至TiDB方案/01TiChange脚本转换csv文件适配tidb-lightning.md"},
            ] },
            { text: "迁移Oracle至TiDB方案", items: [
                { text: "Oracle到TiDB的OGG部署方案", link: "/zh/tidb/06TiDB-解决方案/6-2迁移Oracle至TiDB方案/01Oracle到TiDB的OGG部署方案.md"},
            ] },
    ] },
    {text: "TiDB-源码阅读", items: [
            { text: "TiDB", items: [
                { text: "TiDB run and debug on M1", link: "/zh/tidb/07TiDB-源码阅读/7-1TiDB/01TiDB run and debug on M1.md"},
                { text: "TiDB Point_Get 点查的一生", link: "/zh/tidb/07TiDB-源码阅读/7-1TiDB/02TiDB Point_Get 点查的一生.md"},
                { text: "TIDB how to get init time", link: "/zh/tidb/07TiDB-源码阅读/7-1TiDB/03TIDB how to get init time.md"},
            ] },
    ] },
    {text: "TiDB-Cloud-K8S", items: [
            { text: "TiDB-应用实践", items: [
                { text: "TiDB-Operator 部署 TiDB", link: "/zh/tidb/08TiDB-Cloud-K8S/8-1TiDB-应用实践/01TiDB-Operator 部署 TiDB.md"},
                { text: "TiDB-Operator 部署 DM", link: "/zh/tidb/08TiDB-Cloud-K8S/8-1TiDB-应用实践/02TiDB-Operator 部署 DM.md"},
                { text: "TiDB-Operator 部署 Lightning", link: "/zh/tidb/08TiDB-Cloud-K8S/8-1TiDB-应用实践/03TiDB-Operator 部署 Lightning.md"},
                { text: "TiDB-Operator 部署 TICDC", link: "/zh/tidb/08TiDB-Cloud-K8S/8-1TiDB-应用实践/04TiDB-Operator 部署 TICDC.md"},
            ] },
    ] }
]
