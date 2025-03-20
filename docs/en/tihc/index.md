# TiHC (TiDB Health Checker)


TiHC is a command-line toolkit designed by [Aric](../about.md) specifically for TiDB distributed database, aiming to simplify daily operations, problem diagnosis, and performance analysis of TiDB. As a professional database health check tool, TiHC helps DBAs and developers quickly identify and resolve potential issues in TiDB clusters.

## 🚀 Key Features

- **Lightweight**: The software itself is lightweight, non-intrusive to the database, and can run safely in any environment
- **Ease of Use**: Quickly locate and solve common problems through the command-line interface without complex configuration
- **Comprehensive Checks**: Covers comprehensive health checks for TiDB, TiKV, PD, and other components
- **Intelligent Analysis**: Automatically analyzes potential problems based on best practices and provides optimization suggestions

## 💡 Use Cases

### Data Collection
Comprehensively collect metrics and status information from TiDB clusters to provide data support for subsequent analysis:
- Automatically collect operational status of various components
- Gather system resource usage information
- Export key configuration information
- Support scheduled collection and historical data comparison

### Inspection Reports[Preparing]
Generate regular inspection reports to ensure the stability and performance of TiDB clusters. TiHC can help you:
- Monitor key performance indicators
- Detect configuration deviations
- Provide early warnings for potential risks

### Troubleshooting[Preparing]
Quickly locate and resolve issues in TiDB clusters. When the cluster experiences anomalies, TiHC can:
- Collect critical diagnostic information
- Analyze error logs
- Provide targeted solutions

### Performance Analysis[Preparing]
Analyze performance bottlenecks in TiDB clusters and optimize system performance. TiHC provides:
- SQL execution plan analysis
- Resource usage monitoring
- Performance tuning recommendations

## 📦 Installation and Usage

### Building from Source

```bash
# Clone the repository
git clone https://github.com/AricSu/tihc.git

# Compile
cd tihc
make

# Run
./tihc --help
```

### Binary Download

Download pre-compiled binary files from the GitHub release page:

1. Visit the [TiHC Releases](https://github.com/aricsu/tihc/releases) page
2. Download the binary file for your operating system:
   - Linux: `tihc-linux-amd64.tar.gz`
   - macOS: `tihc-darwin-amd64.tar.gz`
   - Windows: `tihc-windows-amd64.zip`

3. Extract the downloaded file:
```bash
tar -xvf tihc-linux-amd64.tar.gz
chmod +x tihc
./tihc --help
```

## 🔍 User Guide

### Basic Usage

```bash
# View help information
./tihc --help

# Output
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

## 🤝 Contribution and Support

- Issue Feedback: [GitHub Issues](https://github.com/aricsu/tihc/issues)
- Documentation: [Complete Documentation](https://www.askaric.com/en/tihc)
- Contact the Author: ask.aric.su@gmail.com

## 📜 License

TiHC is open-sourced under the [Apache 2.0 License](https://github.com/aricsu/tihc/blob/main/LICENSE).