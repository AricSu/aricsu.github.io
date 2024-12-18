# How to build logical plan

## 1. One SQL'll be translated into AST

![overview-tidb-architecture](https://pic4.zhimg.com/80/v2-ada27a924bb54e304da9811094eacacf_1440w.webp)
note : pic from PingCAP website

From the pic above, SQL operateing processing can be seen as **"SQL(Client) --> AST(Parser) --> Logical Plan(Logical Optimzier) --> Physical Plan(Physical Optimzier) --> Execution(Executior) --> Data(TiDB server return)"**. This part'll foucs on **"AST --> Logical Plan"**.

So, [PlanBuilder](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/planner/core/planbuilder.go#L489) builds Plan from an ast.Node, the one is partal of Logical Plan and different type of SQLs are dealed in different paths at [func Build](https://github.com/pingcap/tidb/blob/eb35c773b512e4e00c42caf7f04ea7397d00c127/planner/core/planbuilder.go#L779).

## 2. 123
