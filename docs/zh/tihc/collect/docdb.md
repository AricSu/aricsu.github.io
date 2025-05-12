# DocDB 数据收集

使用 `tihc collect docdb` 命令收集存储在 TiDB 集群 Docdb 中 TOPSQL 的 DocDB 相关数据。

## 快速开始

```bash
# 收集最近5分钟的 TopSQL 数据
tihc collect docdb --instance 127.0.0.1:10080 --storage topsql.json

# 指定时间范围收集数据
tihc collect docdb \
    --instance 127.0.0.1:10080 \
    --start 1744195176 \
    --end 1744195476 \
    --storage custom_topsql.json
```

## 主要选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--instance <INSTANCE>` | 实例地址，格式为 ip:port | 127.0.0.1:10080 |
| `--ngurl <NGURL>` | NG Monitor 地址 | 127.0.0.1:12020 |
| `--start <START>` | 开始时间戳 | 1744195176 |
| `--end <END>` | 结束时间戳 | 1744195476 |
| `--window <WINDOW>` | 时间窗口大小 | 2s |
| `--top <TOP>` | 返回结果数量限制 | 10000 |
| `--storage <STORAGE>` | 数据存储文件路径 | topsql.json |
| `-l, --log-file <LOG_FILE>` | 日志文件路径 | tihc_started_at_20250409_184436.log |
| `-L, --log-level <LOG_LEVEL>` | 日志级别（trace、debug、info、warn、error） | info |
