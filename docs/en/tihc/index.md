# TiHC (TiDB Health Checker)


TiHC is a command-line toolkit designed by [Aric](../about.md) specifically for TiDB distributed database, aiming to simplify daily operations, problem diagnosis, and performance analysis of TiDB. As a professional database health check tool, TiHC helps DBAs and developers quickly identify and resolve potential issues in TiDB clusters.

## 🚀 Key Features

- **Lightweight**: The software itself is lightweight, non-intrusive to the database, and can run safely in any environment
- **Ease of Use**: Quickly locate and solve common problems through the command-line interface without complex configuration

## 💡 Use Cases

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
   - macOS: `tihc-darwin-amd64.tar.gz`

3. Extract the downloaded file:
```bash
tar -xvf tihc-darwin-amd64.tar.gz
chmod +x tihc
./tihc --help
```


### Quick Install (macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/AricSu/tihc/master/scripts/install.sh | bash
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
