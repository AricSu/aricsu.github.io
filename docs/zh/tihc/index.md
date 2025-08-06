# TiHC (TiDB Health Checker)


TiHC 是 [Aric](../about.md) 专为 TiDB 分布式数据库设计的命令行工具集，旨在简化 TiDB 的日常运维、问题诊断和性能分析工作。作为一款专业的数据库健康检查工具，TiHC 能够帮助 DBA 和开发人员快速发现并解决 TiDB 集群中的潜在问题。

## 🚀 主要特性

- **轻量化**: 软件本身轻量，对数据库无侵入，可在任何环境中安全运行
- **易用性**: 仅通过命令行界面快速定位和解决常见问题，无需复杂配置

## 💡 使用场景


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
   - macOS: `tihc-darwin-amd64.tar.gz`

3. 解压下载的文件：
```bash
tar -xvf tihc-darwin-amd64.tar.gz
chmod +x tihc
./tihc --help
```

### 一键安装（macOS）

```bash
curl -fsSL https://raw.githubusercontent.com/AricSu/tihc/main/scripts/install.sh | bash
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
