---
layout: post
title: 'hadoop之mapreduce流程简谈'
subtitle: 'mapreduce的流程顺序'
date: 2017-09-27
categories: mapreduce
cover: 'https://yourkkc.github.io/assets/img/source/2017-09-26-inputformat_banner.jpg'
tags: hadoop mapreduce 代码
---


我们先来看一下一个完整的mapreduce执行过程


```
//新建配置文件org.apache.hadoop.conf.Configuration
Configuration conf = new Configuration();
//创建job进行提交 org.apache.hadoop.mapreduce.Job
Job job = Job.getInstance(conf);
//设置分片信息读取到map的方式是哪一种  这里是keyvalue的方式   org.apache.hadoop.mapreduce.lib.input.KeyValueTextInputFormat
job.setInputFormatClass(KeyValueTextInputFormat.class);
//设置JarClass--这里不设置会寻找默认的，设置当前工程的Class即可
job.setJarByClass(Test.class);
//设置Mapper的类  ---自定义的Mapper类
job.setMapperClass(TheMapper.class);
//设置Combiner的类---自定义的Reducer类 --在reduce之前先执行一次Reduce--减缓reduce的压力
job.setCombinerClass(TheReducer.class);
//设置Reducer的类---自定义的Reducer
job.setReducerClass(TheReducer.class);
//设置Mapper输出的key类型  org.apache.hadoop.io.Text
job.setMapOutputKeyClass(Text.class);
//设置Mapper输出的value类型  org.apache.hadoop.io.Text
job.setMapOutputValueClass(Text.class);
//设置Reducer输出的key类型  org.apache.hadoop.io.Text
job.setOutputKeyClass(Text.class);
//设置Reducer输出的value类型  org.apache.hadoop.io.Text
job.setOutputValueClass(Text.class);
//添加该job工程读取的文件路径	org.apache.hadoop.mapreduce.lib.input.FileInputFormat
FileInputFormat.addInputPath(job, new Path("hdfs://localhost:9000/input/page.txt"));
//设置该job工程写出的文件路径（必须要不存在）org.apache.hadoop.mapreduce.lib.output.FileOutputFormat
FileOutputFormat.setOutputPath(job, new Path("hdfs://localhost:9000/output1/"));
//等待该job执行完成---返回值为boolean
job.waitForCompletion(true);
```

如果看不懂过程的，我们接下来根据这些代码，看下面这张图

![image](https://yourkkc.github.io/assets/img/source/2017-09-27-mapreduce.jpg)

这张解释了刚刚的job工程的流程，下面这张图解释了mapreduce的过程
用一个简单的wordcount解释

![image](https://yourkkc.github.io/assets/img/source/2017-09-27-mapreduce2.jpg)

上图是一个简单的wordcount，具体的中间的shuffle以后再聊

拜拜
---
> 残影梦半，雨落阑珊，佳期难期人缠怨。
> 缺月枫寒，风起渐晚，相识易逝独凭栏。————小小草