# BR Overview

## What's BR

## How does it work

1. The part that can be tuned --> <https://github.com/tikv/tikv/blob/b5262299604df88711d9ed4b84d43e9c507749a2/src/config.rs#L2217>
  a. num_threads : 在事件驱动 pool 的 worker 数量，也就是备份并发度；
  b. spawn_backup_worker : 去备份数据；
  c. save_backup_file_worker ： 调用 external storage 去保存数据 ；
2. save_backup_file_worker 是按照 region 去 backup --> <https://github.com/tikv/tikv/blob/b5262299604df88711d9ed4b84d43e9c507749a2/components/backup/src/endpoint.rs#L836>
  a. batch_size 就是一次备份多少个 region；
3. brange.backup 用 tokio future 扫 region 并落到磁盘上--> <https://github.com/tikv/tikv/blob/b5262299604df88711d9ed4b84d43e9c507749a2/components/backup/src/endpoint.rs#L891>
  a. 文件名应该遵循的是 format!("{}_{}_{}_{}_{}",store_id,region.get_id(),region.get_region_epoch().get_version(),k,since_the_epoch.as_millis()) 格式保存 --> <https://github.com/tikv/tikv/blob/b5262299604df88711d9ed4b84d43e9c507749a2/components/backup/src/endpoint.rs#L862>
4. 用 rust 写了个 mbr 用于模仿 br 的一些功能 --> <https://github.com/jansu-dev/mbr>
  a. 目前可以翻译部分 backupmeta
  b. 手动指定 backupRange 构造 backupRequest 可让 tikv 备份 sst 文件
  c. 但 restore 需要读取 backupmeta，rust 这块缺少可用现成库，如：parser.table_info、parser.schema_info 等信息，暂时还无法实现。（陆续实现中...）

## what's the repo of yatp

2. How does it work:
  1. yatp encapsulates the repo of crossbeam-deque which is used to construct scheduler using deque structure and looks simple.
  2. Here are some important concepts about yatp
    1. TaskInjector:it's a global queue for new tasks . When a new task is injected into yatp,firstly, it will past the prepare_before_push to adjust the priority level. Secondly, push task into that level queue.
    2. thread::Builder::new().name(name) will construct the thread number of local_queues in LazyBuilder::build.
    3. 

LazyWorker --> Worker --> Builder --> YatpPoolBuilder --> yatp::Builder(build_single_level_pool)
init_servers --> unified_read_pool --> build_yatp_read_pool --> build_multi_level_pool 


In TiKV :
1. We can see Worker::create is used to create a yatp thread pool,and Worker::lazy_build is to build some worker aiming for a specific function,like backup-endpoint ,which is a very important gate to see more details about the backup worker.

1. Worker : A worker that can schedule time consuming tasks, including some functions like new, start, start_with_timer, lazy_build ...
  1. Builder : the main function is to init some yapt threads and return a struct of Worker.
  2. Function start and start_with_timer:  the main functions are to init different schedulers with different functions,like timer or tick(ping).in short,it's used to add channel to communicate and exchange messages.
  3. Function start_impl and start_with_timer_impl` : they are the actual actions to spawn a thread and commit tasks into it.
  4. There's an important trait named Runnable for Endpoint and one of functions named Run() representing how to run a task for a specific worker.