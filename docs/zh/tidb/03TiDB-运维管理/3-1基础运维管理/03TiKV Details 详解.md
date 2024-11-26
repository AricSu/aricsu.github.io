# TiKV Details 监控详解

# Server

## Approximate region size

tikv_raftstore_region_size_bucket

region_size = (Mem Size + CF Storage Size)["default", "lock", "write"]

there're 2 ways, TiKV gets RegionSize(accurate scan/approximate estimate), but, only one scenario has used "accurate scan" which's [after split command executing and checking](https://github.com/tikv/tikv/blob/0e3806935c11be6bf9a75d8666a183520d3c4556/components/raftstore/src/store/fsm/peer.rs#L6185), or, there's [no splitKey from pd](https://github.com/tikv/tikv/blob/0e3806935c11be6bf9a75d8666a183520d3c4556/components/raftstore/src/store/worker/pd.rs#L1998):
1. [CheckPolicy::Scan](https://github.com/tikv/tikv/blob/0e3806935c11be6bf9a75d8666a183520d3c4556/components/raftstore/src/store/worker/split_check.rs#L631) -->  [router.update_approximate_size](https://github.com/tikv/tikv/blob/0e3806935c11be6bf9a75d8666a183520d3c4556/components/raftstore/src/store/worker/split_check.rs#L852) --> [SplitCheckTrigger](https://github.com/tikv/tikv/blob/0e3806935c11be6bf9a75d8666a183520d3c4556/components/raftstore/src/store/fsm/peer.rs#L6276)
2. [CheckPolicy::Approximate](https://github.com/tikv/tikv/blob/0e3806935c11be6bf9a75d8666a183520d3c4556/components/raftstore/src/store/worker/split_check.rs#L653)  _ _ _ _ _ _ _ _ $\uparrow$

Tracking List:
1. [Thoughts of improving region approximate size accuracy and efficiency](https://github.com/tikv/tikv/issues/6161)  
2. https://github.com/tikv/tikv/issues/12025  
3. 


