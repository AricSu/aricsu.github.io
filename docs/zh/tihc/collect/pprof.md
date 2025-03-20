# Collect Pprof

实用 tihc collect pprof 命令，收集 TiDB 集群中各组件的 pprof 信息。

## 快速开始

```bash
tihc collect pprof -a IP_ADDRESS:2379 \
    -c pd \
    -t goroutine \
    -o /tmp/pd_goroutine
```


## 主要选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `-a, --address <IP:PORT>` | 实例地址（tidb/tikv/pd 组件必需），格式为 ip:port，例如：127.0.0.1:2379 | - |
| `-c, --component <COMPONENT>` | 要收集的组件，可选值：tidb、tikv、pd、br | - |
| `-t, --collection-type <COLLECTION_TYPE>` | 收集类型，可选值：config、profile、mutex、heap、goroutine | - |
| `-o, --output <OUTPUT>` | 收集数据的存储路径（goroutine 收集可选） | - |
| `-P, --processid <PROCESSID>` | 进程 ID（br 组件必需） | - |
| `-s, --seconds <SECONDS>` | 性能分析持续时间（秒） | 60 |
| `-l, --log-file <LOG_FILE>` | 日志文件路径 | tihc_started_at_20250320_143949.log |
| `-L, --log-level <LOG_LEVEL>` | 日志级别（trace、debug、info、warn、error） | info |
