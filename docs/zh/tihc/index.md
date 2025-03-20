# TiHC (TiDB Health Checker)


TiHC 是 [Aric](../about.md) 专为 TiDB 分布式数据库设计的命令行工具集，旨在简化 TiDB 的日常运维、问题诊断和性能分析工作。作为一款专业的数据库健康检查工具，TiHC 能够帮助 DBA 和开发人员快速发现并解决 TiDB 集群中的潜在问题。

## 🚀 主要特性

- **轻量化**: 软件本身轻量，对数据库无侵入，可在任何环境中安全运行
- **易用性**: 仅通过命令行界面快速定位和解决常见问题，无需复杂配置
- **全面检查**: 覆盖 TiDB、TiKV、PD 等组件的全面健康检查
- **智能分析**: 基于最佳实践自动分析潜在问题并提供优化建议

## 💡 使用场景

### 数据收集
全面收集 TiDB 集群的各项指标和状态信息，为后续分析提供数据支持：
- 自动采集各组件运行状态
- 收集系统资源使用情况
- 导出关键配置信息

### 巡检报告[准备中]
定期生成巡检报告，确保 TiDB 集群的稳定性和性能。TiHC 可以帮助您：
- 监控关键性能指标
- 检测配置偏差
- 预警潜在风险

### 故障诊断[准备中]
快速定位和解决 TiDB 集群中的问题。当集群出现异常时，TiHC 能够：
- 收集关键诊断信息
- 分析错误日志
- 提供针对性解决方案

### 性能分析[准备中]
分析 TiDB 集群的性能瓶颈，优化系统性能。TiHC 提供：
- SQL 执行计划分析
- 资源使用情况监控
- 性能调优建议



## 📦 安装和使用

### 源码构建

```bash
# 克隆代码库
git clone https://github.com/AricSu/tihc.git

# 编译
cd tihc
make

# 运行
./tihc --help
```

### 二进制下载

从 GitHub 发布页下载预编译的二进制文件：

1. 访问 [TiHC Releases](https://github.com/aricsu/tihc/releases) 页面
2. 下载对应操作系统的二进制文件：
   - Linux: `tihc-linux-amd64.tar.gz`
   - macOS: `tihc-darwin-amd64.tar.gz`
   - Windows: `tihc-windows-amd64.zip`

3. 解压下载的文件：
```bash
tar -xvf tihc-linux-amd64.tar.gz
chmod +x tihc
./tihc --help
```

### 一键安装（Linux/macOS）

```bash
curl -fsSL https://raw.githubusercontent.com/aricsu/tihc/main/install.sh | bash
```

## 🔍 使用指南

### 基本用法

```bash
# 查看帮助信息
./tihc --help

# 输出
tihc 1.0.0
Author: Aric
TiHC CLI Tool
Email: askaric@gmail.com
Doc: https://www.askaric.com/en/tihc

USAGE:
    tihc [OPTIONS] <SUBCOMMAND>

OPTIONS:
    -h, --help                     Print help information
    -l, --log-file <LOG_FILE>      Log file path [default: tihc_started_at_20250320_142358.log]
    -L, --log-level <LOG_LEVEL>    Log level (trace, debug, info, warn, error) [default: info]
    -V, --version                  Print version information

SUBCOMMANDS:
    collect    Collect info from TiDB components (tidb, tikv, pd, br)
    help       Print this message or the help of the given subcommand(s)
```

## 🤝 贡献与支持

- 问题反馈：[GitHub Issues](https://github.com/aricsu/tihc/issues)
- 文档：[完整文档](https://www.askaric.com/zh/tihc)
- 联系作者：ask.aric.su@gmail.com

## 📜 许可证

TiHC 基于 [Apache 2.0 许可证](https://github.com/aricsu/tihc/blob/main/LICENSE) 开源。