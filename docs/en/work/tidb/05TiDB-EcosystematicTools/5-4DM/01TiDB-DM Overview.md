# DM Architecture Overview

## What's DM

1. I think you are already familiar with DM if find out my doc first time. Without that, I think you can take a look at the [DM offical website](https://docs.pingcap.com/zh/tidb/stable/dm-arch).

2. As we can see the architecture below, in short, it used to countinuously migrate date from MySQL single instance or sharding MySQL cluster into TiDB Cluster. And DM-worker has a  1  to 1 relationship to the number of MySQL instance, what DM actually does is reading the MySQL binlog and transfering all of them into DML(types of insert, update, delete) and DDL queries at the journey of replication in TiDB Cluster.

    ![architecture](https://download.pingcap.com/images/docs-cn/dm/dm-architecture-2.0.png)

## The purpose

1. Based on pages of `Master`, `Worker`, `Syncer` and `SourceWorker`, I wanna give a brief introduction for DM. So, after reading all of them, you could know how DM works and what each critical component means and are responsible for.

2. For the page of `Metrics`, It seems to be more useful when a critical bug happens or something goes wrong in a production environment. Which includes every introduction of metrics, how they are calculated and when they are triggered to do the calculation.

## What I've done

1. For the DM tool, as an supporter role, fistly I'm highly gree with that you should've learned the aritechture of a tool when you're trying to fix or investigate some problem. All because product env is such important to your customer's application. And a main idea or knowledge about how the tool runs is something seriously important with troubleshooting. In that way, you could be able to fix it ASAP which's bigger and faster than normal.

2. And, also, I tried spilting some main steps about how DM's running into just one picture, which's useful when you're learning daily life, or directly search the function name in source code dir when you're troubleshooting. In relevent pages, I'm gonna explain more details on each component I've carved in the picture which are [`DM master`](./03TiDB-DM%20Master.md), [`DM Worker`](./04TiDB-DM%20Worker.md) and [`DM Syncer`](./05TiDB-DM%20syncer.md).

    ![ALL_DM_Components](../../../../../images/tidb/05TiDB-EcosystematicTools/5-4DM/01-ALL_DM_Components.jpeg)

3. At the end of this series of DM pages, I wroted meaning of metrics and the way they are calculated of every metrics. Which would be useful for your investigating.

## Keys inside Etcd

[The Code location](https://github.com/pingcap/tiflow/blob/c65e2b72198de10319008b31dcf13d51509ccfde/dm/common/common.go#L26), I' think it'd be useful when you wanna get info deeply which you couldn't get easily using OpenAPI or dm-ctl. Like `ClusterIDKey = "/dm-cluster/id"` and `StageSubTaskKeyAdapter KeyAdapter = keyHexEncoderDecoder("/dm-master/stage/subtask/")` ...
