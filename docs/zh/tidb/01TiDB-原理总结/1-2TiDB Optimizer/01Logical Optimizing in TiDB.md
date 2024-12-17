# What's Logical Optimizing in TiDB

## First of all

Actually, every logical rule struct has a method named `optimize()`

## rules of logical

From [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/optimizer.go#L597), we can see logical optimizing items will be applied on by one.  

```go
var optRuleList = []logicalOptRule{
 &gcSubstituter{},
 &columnPruner{},
 &resultReorder{},
 &buildKeySolver{},
 &decorrelateSolver{},
 &semiJoinRewriter{},
 &aggregationEliminator{},
 &skewDistinctAggRewriter{},
 &projectionEliminator{},
 &maxMinEliminator{},
 &ppdSolver{},
 &outerJoinEliminator{},
 &partitionProcessor{},
 &collectPredicateColumnsPoint{},
 &aggregationPushDownSolver{},
 &pushDownTopNOptimizer{},
 &syncWaitStatsLoadPoint{},
 &joinReOrderSolver{},
 &columnPruner{}, // column pruning again at last, note it will mess up the results of buildKeySolver
}
```

## gcSubstituter

By [mysql reference](https://dev.mysql.com/doc/refman/8.0/en/generated-column-index-optimizations.html) of `Generated Column(in short: gc)`, we can see what the function of gc is. And from [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/rule_generate_column_substitute.go#L97), you can figure out how tidb implment `gc` in period of logical plan. There are four parts of operands, (Selection, Projection, Sort, Aggregation), will subtitute gc as index.

1. LogicalSelection:  

    LogicalSelection represents a where or having predicate.
    firstly, in generated column function, index wouldn't none. Because of every calculating is based on index expression.
    secondly, when predicate operands are `=`, `>`, `>=`, `<`, `<=`, `like`, `or`, `and`, `not`. TiDB'll deal with it using generated column.  However, when predicate is `in`, there is a limition that all of scalars are the same type.  

2. LogicalProjection:

    LogicalProjection represents a select fields plan and TiDB'll loop every field(selected colums from SQL) and try subsitiuting generated column.  

3. LogicalSort:  

    LogicalSort stands for the order by plan. if there are any `sort` item in a query.

4. LogicalAggregation:

    LogicalAggregation represents an aggregate plan. And all agg functions are [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/parser/ast/functions.go#L701). if there any field could be subtitiuted into one genereated colum, it'd be done.

    ```go
    // AggFuncCount is the name of Count function.
    AggFuncCount = "count"
    // AggFuncSum is the name of Sum function.
    AggFuncSum = "sum"
    // AggFuncAvg is the name of Avg function.
    AggFuncAvg = "avg"
    // AggFuncFirstRow is the name of FirstRowColumn function.
    AggFuncFirstRow = "firstrow"
    // AggFuncMax is the name of max function.
    AggFuncMax = "max"
    // AggFuncMin is the name of min function.
    AggFuncMin = "min"
    // AggFuncGroupConcat is the name of group_concat function.
    AggFuncGroupConcat = "group_concat"
    // AggFuncBitOr is the name of bit_or function.
    AggFuncBitOr = "bit_or"
    // AggFuncBitXor is the name of bit_xor function.
    AggFuncBitXor = "bit_xor"
    // AggFuncBitAnd is the name of bit_and function.
    AggFuncBitAnd = "bit_and"
    // AggFuncVarPop is the name of var_pop function
    AggFuncVarPop = "var_pop"
    // AggFuncVarSamp is the name of var_samp function
    AggFuncVarSamp = "var_samp"
    // AggFuncStddevPop is the name of stddev_pop/std/stddev function
    AggFuncStddevPop = "stddev_pop"
    // AggFuncStddevSamp is the name of stddev_samp function
    AggFuncStddevSamp = "stddev_samp"
    // AggFuncJsonArrayagg is the name of json_arrayagg function
    AggFuncJsonArrayagg = "json_arrayagg"
    // AggFuncJsonObjectAgg is the name of json_objectagg function
    AggFuncJsonObjectAgg = "json_objectagg"
    // AggFuncApproxCountDistinct is the name of approx_count_distinct function.
    AggFuncApproxCountDistinct = "approx_count_distinct"
    // AggFuncApproxPercentile is the name of approx_percentile function.
    AggFuncApproxPercentile = "approx_percentile"
    ```

## columnPruner

1. Actually, there are too many operands implmented `pruneCoumns`, you can PTAL at [it's interface](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan.go#L258). After parsing AST, TiDB has already had a basic logic plan and column info without any tuning, when we step in here. I'll choose `LogicalSelection` which is one of the easiest to take a look deeply.  
2. That just deals with every column selected in sql or filterd in predicate and prunes part of columns which don't need. In `LogicalSelection`, as result of `func filter` is nil, so result is equal to columns selected plus predicate for filtering.

    ```go
    func extractColumns(result []*Column, expr Expression, filter func(*Column) bool) []*Column {
     switch v := expr.(type) {
     case *Column:
      if filter == nil || filter(v) {
       result = append(result, v)
      }
     case *ScalarFunction:
      for _, arg := range v.GetArgs() {
       result = extractColumns(result, arg, filter)
      }
     }
     return result
    }
    ```

## resultReorder

1. ResultReorder reorder query results, which is not a common rule for all queries, it's specially implemented for a few customers. And here is a short comment in code place.  

    ```go
    /*
    Results of some queries are not ordered, for example:

        create table t (a int); insert into t values (1), (2); select a from t;

    In the case above, the result can be `1 2` or `2 1`, which is not ordered.
    This rule reorders results by modifying or injecting a Sort operator:
     1. iterate the plan from the root, and ignore all input-order operators (Sel/Proj/Limit);
     2. when meeting the first non-input-order operator,
        2.1. if it's a Sort, update it by appending all output columns into its order-by list,
        2.2. otherwise, inject a new Sort upon this operator.
    */
    ```

2. At [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/rule_result_reorder.go#L43), based on the such clear comment, TiDB'll do `1`, `2.1` and `2.2` by `func completeSort` and `func injectSort`. PTAL at [#pr](https://github.com/pingcap/tidb/pull/25971) for details.

## buildKeyInfo

BuildKeyInfo as their name will collect the information of unique keys into schema(`selfSchema` and `childSchema`) and check keys of schema from query input coule be used. in addition, that to check if a query returns no more than one row is also an important action inside of this step. [more details](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/plan.go#L274)

## decorrelateSolver

1. what's apply? from comments, `LogicalApply` gets one row from outer executor and gets one row from inner executor according to outer row.  
2. which means, there wouldn't have optimization without `Apply` operand logic.
3. if `innerPlan` is `LogicalSelection`, action is set new apply-plan children and reoptimize it using the same `decorrelateSolver` rule, you can see [here](https://github.com/pingcap/tidb/blob/17fac8bc2883dd287481a60f019beae948191a47/planner/core/rule_decorrelate.go#L150).
4. if `innerPlan` is `LogicalMaxOneRow`, action is the same as `LogicalSelection`.
5. if `innerPlan` is `LogicalProjection` and `JoinType` is `LeftOuterJoin`, action is it doesn't have optimization, because of below comments, every comparation will return 1 since the projection is evaluated after the join. And when an `Apply` is `apply.JoinType != SemiJoin && apply.JoinType != LeftOuterSemiJoin && apply.JoinType != AntiSemiJoin && apply.JoinType != AntiLeftOuterSemiJoin`, it'll step to next step and try to substitute the all the schema with new expressions which maybe have been optimized by `columnPruner`, which mainly it does is substitued all expressions or columns like `gcSubstitute`.
6. if `innerPlan` is `LogicalAggregation`,

    ```sql
    select (select 1 from t1 where t1.a=t2.a) from t2;
    -- when t1.a=t2.a is false, the result should be null
    -- after decorrelateSolver, it'll be a format below
    select t1.* from t2 left outer join (select distinct(t1.a) as a from t1) as sub on t2.a = sub.a;
    -- | t2.a |      | t1.a |        | t2.a | t1.a | join result |      | join result |
    -- |   1  | join |  0   |  -->   |   1  |   0  |     nll     | -->  | 1 | 1 |  1  |
    -- |   2  |      |  1   |        |   1  |   1  |      1      |
    --                               |   2  |   1  |     null    |
    --                               |   2  |   1  |     null    |
    ```

7. if `innerPlan` is `LogicalLimit` and `apply.JoinType != SemiJoin && apply.JoinType != LeftOuterSemiJoin && apply.JoinType != AntiSemiJoin && apply.JoinType != AntiLeftOuterSemiJoin`, that means if `LogicalLimit` is not SemiJoin, the output of it might be expanded even though we are `limit 1`. because of function of `semi join` below, if we did expanding, we'd get `semi join` the result of limit number of rows.

    ```sql
    select * from sale_detail;
    --返回结果。
    +------------+-------------+-------------+------------+------------+
    | shop_name  | customer_id | total_price | sale_date  | region     |
    +------------+-------------+-------------+------------+------------+
    | s1         | c1          | 100.1       | 2013       | china      |
    | s2         | c2          | 100.2       | 2013       | china      |
    | s3         | c3          | 100.3       | 2013       | china      |
    +------------+-------------+-------------+------------+------------+
    select * from sale_detail_sj;
    --返回结果。
    +------------+-------------+-------------+------------+------------+
    | shop_name  | customer_id | total_price | sale_date  | region     |
    +------------+-------------+-------------+------------+------------+
    | s1         | c1          | 100.1       | 2013       | china      |
    | s2         | c2          | 100.2       | 2013       | china      |
    | s5         | c2          | 100.2       | 2013       | china      |
    | s2         | c2          | 100.2       | 2013       | china      |
    +------------+-------------+-------------+------------+------------+

    select * from sale_detail a left semi join sale_detail_sj b on a.total_price=b.total_price;

    +------------+-------------+-------------+------------+------------+
    | shop_name  | customer_id | total_price | sale_date  | region     |
    +------------+-------------+-------------+------------+------------+
    | s2         | c2          | 100.2       | 2013       | china      |
    | s1         | c1          | 100.1       | 2013       | china      |
    +------------+-------------+-------------+------------+------------+

    [right result]  select count(*) from test t1 where exists (select value from test t2 where t1.id = t2.id limit 1);  
    [wrong result]  select count(*) from test t1 a semi join test t2 where t1.id = t2.id limit 1;  
    ```

8. if `innerPlan` is `LogicalAggregation`, It'll check if `Apply` can be pulled up and an aggregation can be pulled up, then, do related actions like add `sum` flag.

9. if `innerPlan` is `LogicalSort`, Since TiDB only pull up Selection, Projection, Aggregation, MaxOneRow, so there just setp in childen optimization.

[The text](https://zhuanlan.zhihu.com/p/52138596) may help you understand it easily.

## semiJoinRewriter
