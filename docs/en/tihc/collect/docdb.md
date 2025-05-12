# docdb

Use the `tihc collect docdb` command to collect TOPSQL storaged in DocDB of TiDB cluster.

## Quick Start

```bash
# Collect TopSQL data for the last 5 minutes
tihc collect docdb --instance 127.0.0.1:10080 --storage topsql.json

# Collect data for a specific time range
tihc collect docdb \
    --instance 127.0.0.1:10080 \
    --start 1744195176 \
    --end 1744195476 \
    --storage custom_topsql.json
```

## Main Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `--instance <INSTANCE>` | Instance address, format is ip:port | 127.0.0.1:10080 |
| `--ngurl <NGURL>` | NG Monitor address | 127.0.0.1:12020 |
| `--start <START>` | Start timestamp | 1744195176 |
| `--end <END>` | End timestamp | 1744195476 |
| `--window <WINDOW>` | Time window size | 2s |
| `--top <TOP>` | Limit of returned results | 10000 |
| `--storage <STORAGE>` | Data storage file path | topsql.json |
