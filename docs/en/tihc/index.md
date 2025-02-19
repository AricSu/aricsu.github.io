# TiHC

TiHC (TiDB Healthy Check) 是基于 Rust 构建的 TiDB 巡检、收集、诊断工具，旨在缩短问题解决时间，提高交付效率。

## TiHC 的作用
1. 对于 TiDB DBA 角色，节约 TiDB 巡检过程中大量可模版化工作。
2. 对于 Others DBA 角色，提供一套针对 TIDB 健康检查的简单方法。

**Tips**：TiHC 不期望探究所有性能细节，仅关注 TiDB 读写请求流中较为常见、重要的组件监控进行采集与分析。详细的根因分析还是需 Grafana 各组件配合分析、定论。

## Features
- **采集 Grafana 监控面板**：调用 grafana-image-render 插件，获取指定时间段内的监控信息。
- **生成 Docx 巡检文档**：TiHC 将收集的统计数据排版、生成 Office Word 文档模版，仅需少量修改便可直接交付客户。
- **轻量化巡检采集操作**：TiHC 只需初次巡检时，配置 Grafana-image-render。此后，仅需要可执行文件便可完成全部巡检。

## Quick start

### 1. TiHC 使用简介
TiHC 遵循 terminal cli 使用风格，可使用 `--help` 或 `-h` 查看使用方法。
```shell
aric@AricdeMacBook-Pro-2 tihc % ./bin/tihc 
tihc 1.0
Author: Aric
TiHC CLI Tool
Email: askaric@gmail.com
Doc: https://www.askaric.com/zh/

USAGE:
    tihc <SUBCOMMAND>

OPTIONS:
    -h, --help       Print help information
    -V, --version    Print version information

SUBCOMMANDS:
    collect    
    help       Print this message or the help of the given subcommand(s)
    report     
    tools      
```