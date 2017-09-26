---
layout: post
title: 'hadoop之自定义InputFormat'
subtitle: '偏移量与自定义mapreduce的map读取方式'
date: 2017-09-26
categories: mapreduce
cover: 'https://yourkkc.github.io/assets/img/source/2017-09-26-inputformat_banner'
tags: hadoop mapreduce 代码 KEYIN
---
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;前几天在看mapreduce的时候，发现了map的keyin必须是LongWritable，一直觉得很新奇，网上解释说是偏移量，但是并没解释清楚，觉得有必要写个博客搞一下。   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;简简单单的写了一个wordcount，打印输出keyin和valuein，结果是这样的:


    System.out.println(key.get()+","+value.toString());
    0,java
    6,eclisep
    15,java
    21,java
    27,java
    33,java
    39,java
    45,sdf
    50,sfs
    55,sdfasd
    63,sdfsdd
    
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;可以发现，假如第一行的j 我们定义为索引0，那么第一行数据为  java\r\n 到了第二行的时候，e所占的索引是6，
这里我们就发现了所谓的偏移量是每行的第一个字符所占的当前分片的索引位，通常我们的分片数据量很大的话，IntWritable不能承受，所以官方使用了LongWritable进行标记。
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;到了这里我们知道了偏移量的概念，也知道了MapReduce的map读入方式为LongWritable和Text，想必有的同学也知道有一种
KeyValueTextInputFormat格式是按照键值对的模式进行读取，其实底层的源码是将数据通过\t进行分割，我们看一下KeyValueTextInputFormat的源码：

    
    public class KeyValueTextInputFormat extends FileInputFormat<Text, Text> {
    
    @Override
    protected boolean isSplitable(JobContext context, Path file) {
    final CompressionCodec codec =
      new CompressionCodecFactory(context.getConfiguration()).getCodec(file);
    if (null == codec) {
      return true;
    }
    return codec instanceof SplittableCompressionCodec;
    }
    public RecordReader<Text, Text> createRecordReader(InputSpli genericSplit,
      TaskAttemptContext context) throws IOException {
      context.setStatus(genericSplit.toString());
      //这里返回了一个KeyValueLineRecordReader 
      //我们可以发现其实这个Reader才是读取方式的关键--我们继续查看这个类把
      return new KeyValueLineRecordReader(context.getConfiguration());
     }
    }
    
    
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;KeyValueLineRecordReader的源码：
    
    //这个类继承了RecordReader 后面的泛型是map的KEYIN和VALUEIN
    public class KeyValueLineRecordReader extends RecordReader<Text, Text> {
        public static final String KEY_VALUE_SEPERATOR = 
            "mapreduce.input.keyvaluelinerecordreader.key.value.separator";
        //这里使用了mr的读行流
        private final LineRecordReader lineRecordReader;
        //我们发现了这里的分割符是\t
        private byte separator = (byte) '\t';

        private Text innerValue;

        private Text key;
  
        private Text value;
  
        public Class getKeyClass() { return Text.class; }
  
        public KeyValueLineRecordReader(Configuration conf)
            throws IOException {
    
            lineRecordReader = new LineRecordReader();
            String sepStr = conf.get(KEY_VALUE_SEPERATOR, "\t");
            this.separator = (byte) sepStr.charAt(0);
        }

        public void initialize(InputSplit genericSplit,
            TaskAttemptContext context) throws IOException {
                lineRecordReader.initialize(genericSplit, context);
         }
  
        public static int findSeparator(byte[] utf, int start, int length, 
            byte sep) {
            for (int i = start; i < (start + length); i++) {
                if (utf[i] == sep) {
                    return i;
                }
            }
            return -1;
        }

        public static void setKeyValue(Text key, Text value, byte[] line,
            int lineLen, int pos) {
            if (pos == -1) {
                key.set(line, 0, lineLen);
                value.set("");
            } else {
                key.set(line, 0, pos);
                value.set(line, pos + 1, lineLen - pos - 1);
            }
        }
        /** Read key/value pair in a line. */
        public synchronized boolean nextKeyValue()
            throws IOException {
            byte[] line = null;
            int lineLen = -1;
            if (lineRecordReader.nextKeyValue()) {
                innerValue = lineRecordReader.getCurrentValue();
                line = innerValue.getBytes();
                lineLen = innerValue.getLength();
            } else {
                return false;
            }
            if (line == null)
                return false;
            if (key == null) {
                key = new Text();
            }
            if (value == null) {
                value = new Text();
            }
            int pos = findSeparator(line, 0, lineLen, this.separator);
            setKeyValue(key, value, line, lineLen, pos);
            return true;
        }
  
        public Text getCurrentKey() {
            return key;
        }

        public Text getCurrentValue() {
            return value;
        }

        public float getProgress() throws IOException {
            return lineRecordReader.getProgress();
        }
  
        public synchronized void close() throws IOException { 
            lineRecordReader.close();
        }
    }

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;感觉看着很蒙，我们自己来写一个Reader来继承RecordReader看一下：
    
	import java.io.IOException;
	import org.apache.hadoop.io.Text;
	import org.apache.hadoop.mapreduce.InputSplit;
	import org.apache.hadoop.mapreduce.RecordReader;
	import org.apache.hadoop.mapreduce.TaskAttemptContext;
	//我们自定义了一个Reader 实现了下面的几个方法
	public class MyReader extends RecordReader<Text,Text>{
	    /**
	    Reader初始化的方法，也就是说在Reader正式工作之前，会执行
	    这个方法,发现传入了一个分片，传入了一个上下文对象
	    */
		@Override
		public void initialize(InputSplit split, TaskAttemptContext context) throws IOException, InterruptedException {
			// TODO Auto-generated method stub
		}
	    /**
	    查询是否还有下一条元素-如果有的话就从getCurrentKey和getCurrentValue中取值，这个方法类似于cursor的hasNext()方法--我们需要自定义什么时候有下一条元素
	    */
		@Override
		public boolean nextKeyValue() throws IOException, InterruptedException {
			// TODO Auto-generated method stub
			return false;
		}
	    /**
	    获得当前的key
	    */
		@Override
		public Text getCurrentKey() throws IOException, InterruptedException {
			// TODO Auto-generated method stub
			return null;
		}
	    /**
	    获得当前的Value
	    */
		@Override
		public Text getCurrentValue() throws IOException, InterruptedException {
			// TODO Auto-generated method stub
			return null;
		}
	    /**
	    获得当前的文档读取进度 值在0-1之间
	    */
		@Override
		public float getProgress() throws IOException, InterruptedException {
			// TODO Auto-generated method stub
			return 0;
		}
	    /**
	    当前流工作完成的时候执行的方法-我们常在这个方法中关闭流数据
	    */
		@Override
		public void close() throws IOException {
			// TODO Auto-generated method stub
			
		}
	
	}

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;根据上面的KeyValueLineRecordReader我们模仿一下写一个以空格分割的map读入：代码如下


	import java.io.IOException;
	import org.apache.hadoop.conf.Configuration;
	import org.apache.hadoop.fs.FSDataInputStream;
	import org.apache.hadoop.fs.FileSystem;
	import org.apache.hadoop.fs.Path;
	import org.apache.hadoop.io.LongWritable;
	import org.apache.hadoop.io.Text;
	import org.apache.hadoop.mapreduce.InputSplit;
	import org.apache.hadoop.mapreduce.RecordReader;
	import org.apache.hadoop.mapreduce.TaskAttemptContext;
	import org.apache.hadoop.mapreduce.lib.input.FileSplit;
	import org.apache.hadoop.util.LineReader;
	
	public class MyRecodeReader extends RecordReader<Text,LongWritable>{
		//这个流会读一行数据
		private LineReader reader;
		//起始位置的索引
		private long start;
		//结束位置的索引
		private long end;
		//当前位置索引
		private long pos;
		//文本分片信息
		private FileSplit split;
		//配置文件
		private Configuration conf;
		//定义一个全局的Text
		private Text content;
		
		
		//定义  每一行通过 空格分割之后的 当前输出单词的位置
		private int currentPos;
		//定义一个全局的字符串数组
		private String[] data;
		
	
		/**
		 * initialize---init
		 * 初始化----当一个类的一些功能即将开始的时候--需要做准备
		 * 
		 */
		@Override
		public void initialize(InputSplit split, TaskAttemptContext context) throws IOException, InterruptedException {
			
			//获得这个文件----怎么获得一个文件---获得文件路径--获得分片
			this.split = (FileSplit) split; 
			//获得路径
			Path path = this.split.getPath();
			//获得配置
			this.conf = context.getConfiguration();
			//使用流去读取---用文件系统FileSystem
			FileSystem fs = path.getFileSystem(conf);
			//FSDataInputStream 这个是HADOOP的输入流
			FSDataInputStream open = fs.open(path);
			//得到了一个读行的流
			this.reader = new LineReader(open,conf);
			
			
			this.start = this.split.getStart();
			this.end = this.start+this.split.getLength()-1;
			this.pos = this.start;
			
			this.content = new Text();
			
		}
		/**
		 * 检测是否还有下一个key	value
		 * 
		 */
		@Override
		public boolean nextKeyValue() throws IOException, InterruptedException {
			
			//假设现在我的String[] data有数据   
			if(this.data!=null&&this.currentPos<this.data.length-1){
				this.currentPos++;
				return true;
			}else{
				if(this.pos<this.end){//没有读到结尾---接着读
					// return the number of bytes read including the newline
					//返回当前行的长度
					this.pos += this.reader.readLine(this.content);
					this.data = this.content.toString().split(" ");
					this.currentPos = 0;
					return true;
				}else{//结尾了  没法读了
					return false;
				}
				
			}
			
			
		}
		/**
		 * 返回当前的key--返回到map里面
		 */
		@Override
		public Text getCurrentKey() throws IOException, InterruptedException {
			
			
			return new Text(this.data[this.currentPos]);
		}
		/**
		 * 返回当前的value--返回到map里面
		 */
		@Override
		public LongWritable getCurrentValue() throws IOException, InterruptedException {
			//这一行的内容读到了  content里面
	//		String str = this.content.toString();//这行数据有了
			return new LongWritable(1);
		}
		/**
		 * 得到当前读取数据的进程--进度   0-1   读取到哪里？
		 */
		@Override
		public float getProgress() throws IOException, InterruptedException {
			
			float res = 0;
			if(this.end!=this.start){
				res = (this.pos-this.start)*1.0f/(this.end-this.start);//超过1
				res = Math.min(1.0f, res);//防止值超过1
			}
			return res;
		}
		/**
		 * 关闭这个流的方法
		 */
		@Override
		public void close() throws IOException {
			this.reader.close();
		}
	
	}

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;好了，至此自定义InputFormat就结束了。