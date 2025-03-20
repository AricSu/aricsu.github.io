# TiHC Collect

TiHC Collect 是一个用于采集 TiDB 组件 Profile 的工具。它可以采集 TiDB 组件的 Profile，并将其保存到本地文件中。

## 安装

使用以下命令安装 TiHC Collect：

```bash
go install github.com/aricSu/TiHC-Collect@latest
```

## 使用

要使用 TiHC Collect，请运行以下命令：

```bash
tihc-collect --config config.yaml
```

## 采集 TiDB 组件的 Profile

TiHC Collect 可以采集 TiDB 组件的 Profile 信息，帮助您进行性能分析和问题诊断。

## TiHC Collect Pprof 主要选项表

| 选项       | 描述           |
|------------|----------------|
| `--help`   | 显示帮助信息   |
| `--version`| 显示版本信息   |
| `--config` | 指定配置文件路径 |
| `--log-level` | 指定日志级别 |
```

### 优化说明：

1. **标题格式**：确保每个标题都使用适当的 Markdown 语法，以便更好地组织内容。
2. **安装和使用说明**：增加了简要的说明，以便用户更容易理解如何安装和使用该工具。
3. **选项表格式**：使用反引号包裹选项名称，使其在文档中更明显。
4. **内容结构**：调整了内容结构，使其更具逻辑性和连贯性。
