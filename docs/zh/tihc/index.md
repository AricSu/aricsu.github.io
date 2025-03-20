# TiHC CLI 工具

TiHC 是一个命令行工具，用于从 TiDB 组件（如 tidb、tikv、pd、br）中收集信息。

## 作者信息

- **作者**: Aric
- **邮箱**: askaric@gmail.com
- **文档**: [https://www.askaric.com/zh/](https://www.askaric.com/zh/)

## 使用方法

```bash
tihc [OPTIONS] <SUBCOMMAND>
```

### 选项

- `-h, --help`：打印帮助信息。
- `-l, --log-file <LOG_FILE>`：指定日志文件路径（默认：`tihc_started_at_20250319_235522.log`）。
- `-L, --log-level <LOG_LEVEL>`：指定日志级别（可选值：trace, debug, info, warn, error，默认：info）。
- `-V, --version`：打印版本信息。

### 子命令

- `collect`：从 TiDB 组件（tidb, tikv, pd, br）中收集信息。
- `help`：打印此消息或给定子命令的帮助信息。

## 示例

以下是如何使用 `tihc` 工具的示例：

```bash
# 显示帮助信息
tihc --help

# 收集 TiDB 组件的信息
tihc collect

# 指定日志文件和日志级别
tihc --log-file my_log.log --log-level debug collect
```

希望这篇文档能帮助您更好地使用 TiHC 工具。
```