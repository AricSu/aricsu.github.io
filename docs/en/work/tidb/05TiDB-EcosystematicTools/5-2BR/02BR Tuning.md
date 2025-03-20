# BR tuning

4.1 Parameter ratelimit can't limit the effect on TiKV
    1. Appearance ： Both SQL duration and Txn duration will increase when
    2. Ticket : TICKET-367 br 备份过程中有报错产生  Resolved
    3. Why can't ratelimt of parameter control the impact on SQL duration?
      1. From here(ratelimit encapsulated in reader), we know that ratelimit limits speed of writing sst file from Mem into Disk. So, the backup tasks in TiKV wouldn't be limited, that means a lot of backup tasks could still be running and the scan-options will cost resources. And web doc also comments function and theory of ratelimt.
    4. What's auto_tune feature in TiKV and how can it  fix this problem?
      1. Feature from : BR: allow backup to restrict itself when cluster is in use by YuJuncen · Pull Request #11132 · tikv/
      2. How it was created : From SoftLimitInner, we can see SoftLimit is a token controller expostulated Semaphore of tokio.
      3. Why is it useful? : in this model, just task(concurrency) which has got token can be execute.
[Image]
    5. Why can num-threads control the impact?
      1. backup.num-threads controls the size of the backup thread pool.
      2. From here, we see TiKV'll create the number of backup threads of num_threads(tokio::task) value for backup.
      3. By num-threads,we can directly decrease concurrency of ScanValue.

4.2 what's the difference between concurrency and num-threads ?
    1. Appearance : appear fetch pending tso requests error out of backup log.
    2. Ticket : TICKET-367 br 备份过程中有报错产生  Resolved
    3. About BR backup principle :
      1. BR is written by GO(BR backup client) and Rust(backup component in TiKV).
      2. Their relationship is that BR-go is responsible for sending backup ranges of tables, and BR-Rust are the receivers which receive table ranges,  and doers(many stores) which scan tables and save the sst_files into external storage,like local, S3, etc.
      3. What's concurrency?
        1. From here, Web Doc tells us to add this number without TiKV bottleneck. And in code, we know that concurrency parameter is the  goroutine number to send backup task or backup ranges ,which are the table ranges(such as 8-concurrency == 8-range == 8 table), to TiKV. So it represents the concurrency of BR-go(or BR client).
      4. What's num-threads?
        1. From here, we know that num-threads parameter is the backup pool size in spawn_backup_worker function.So it's the concurrency in TiKV side.
4.3 what kind of impact does backup no leader have on BR backup and why?

  1. Appearance : [BR:Backup:ErrBackupNoLeader]backup no leader”]
  2. Ticket : TICKET-679 Asktug - v5.1.4 - br备份报ErrBackupNoLeader]backup no leader的错误   Resolved
  3. About the Error:
    1. From here, we can see the first step in function handleFineGrained,which is responsible for sending incomplete backup range of tables to retry backup tasks, is function findRegionLeader aiming for getting region leader.if it'has tried 5 times and still failed,this error will appear.
    2. Why BR has function handleFineGrained?
      1. Normal status, BR-go will send table backup range,which encode table_prefix and infinite range, to TiKV in the concurrency parameter value.  
      2. abnormal status. Sometimes, BR or TiKV will appear recoverable errors,which will crash backup tasks in TiKV side. So handleFineGrained is used to get the incomplete range from resend them to TiKV.

    3. Because of handleFineGrained mechanism, and it will get region leader. So, backup no leader will appear.
    4. In short, if this error didn't cause an error or crash,it would be OK.
4.4 what's checksum of BR and what's checksum-concurrency?

  1. Appearance : appear "[pd] failed updateLeader" and "[tikv:9002]TiKV server timeout" out of nowhere.
  2. Ticket : TICKET-768 华泰证券 - v4.0.14 - BR备份报错  Resolved
  3. What mechanism is checksum of BR?
    1. The checksum is equal to TiDB checksum for every backup table. and finally, the checksum values returned by TiKV will be stored in backup_metafile.
    2. From here, we know every backup file also has a checksum value,but it's not the same as checksum of BR backup patameter. Every BACKUP_BATCH_LIMIT(1024 entry), which's also the size of sst_file entries ,will calculate a crc64 value and return to BR-go.
  4. What's checksum-concurrency?
    1. Default checksum-concurrency : 15 (equal to DistSQLScanConcurrency)
    2. It's the concurrency of TiDB checksum of all backup tables.
  5. Why appear TiKV server timeout and failed updateLeader?
    1. Because one store arrived at threashould of unifiedReadPool upper bound when tikv was doing checksum computing.
4.5 Just a bug
  1. TICKET-254 AskTUG--v5.4.0--BR 恢复报错Error: [kv:1062]Duplicate entry  Resolved
  2. <https://github.com/pingcap/br/issues/1471>
