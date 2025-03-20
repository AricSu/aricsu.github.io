# Collect Pprof

Use the `tihc collect pprof` command to collect pprof information from various components in a TiDB cluster.

## Quick Start

```bash
tihc collect pprof -a IP_ADDRESS:2379 \
    -c pd \
    -t goroutine \
    -o /tmp/pd_goroutine
```

## Main Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `-a, --address <IP:PORT>` | Instance address (required for tidb/tikv/pd components), format is ip:port, e.g.: 127.0.0.1:2379 | - |
| `-c, --component <COMPONENT>` | Component to collect from, available values: tidb, tikv, pd, br | - |
| `-t, --collection-type <COLLECTION_TYPE>` | Collection type, available values: config, profile, mutex, heap, goroutine | - |
| `-o, --output <OUTPUT>` | Path to store collected data (optional for goroutine collection) | - |
| `-P, --processid <PROCESSID>` | Process ID (required for br component) | - |
| `-s, --seconds <SECONDS>` | Duration of profiling in seconds | 60 |
| `-l, --log-file <LOG_FILE>` | Log file path | tihc_started_at_20250320_143949.log |
| `-L, --log-level <LOG_LEVEL>` | Log level (trace, debug, info, warn, error) | info |
