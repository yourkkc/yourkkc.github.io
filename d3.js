var c = document.getElementById('canvas');
var ctx = c.getContext('2d');
var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;

var preStatus = null;
var speed;
var mouseX;
var mouseY;
document.onmousemove = function(e){
	 mouseX = e.pageX;
	 mouseY = e.pageY;
	 var time = new Date().getTime();
	 var data = {'x':mouseX,'y':mouseY,'time':time}
	 if(preStatus){
		 var pt = preStatus['time'];
		 var px = preStatus['x'];
		 var py = preStatus['y'];
		 var speedX = Math.abs(px-mouseX)/(time-pt)
		 var speedY = Math.abs(py-mouseY)/(time-pt)
		 if(speedX>speedY)
			 speed = speedX
		else
			 speed = speedY
	 }else{
		 speed = 0.1;
	 }
	 preStatus = data;
	 speed = speed*10;
}


var d3  = new D3();
d3.init();
function anim(){
	ctx.clearRect(0,0,w,h)
	d3.draw();
	requestAnimationFrame(anim)
}
anim();
var flag = true;
function D3(){
	
	this.centerX = w/2;
	this.centerY = h/2;
	this.bigArray = [];
	this.array = [];
	this.scale = 15;
	this.currentProgress = 0;
	this.timer = 5;
	this.currentTimer = this.timer ;
	this.random = function(max){
		return Math.floor(Math.random()*max);
	}
	this.init = function(){
		this.array = [];
		for(var i=0;i<360;i++){
			var t = Math.PI*i/180;
			var array = this.initPoint(t);
			this.array.push(array['data']);
			if(i%5==0&&i!=0){
				this.bigArray.push(array['bigData']);
			}
		}
	}
	this.initPoint = function(t){
		var x = 16*Math.sin(t)*Math.sin(t)*Math.sin(t)
		var y = 13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)
		var data = {'x':x,'y':(-1*y)};
		
		var red = this.random(256);
		var green = this.random(256);
		var blue = this.random(256);
		var alpha = this.random(101)/100;
		
		var bigData = {'x':this.centerX+this.scale*x,'y':this.centerY+this.scale*(-1*y),'red':red,'green':green,'blue':blue,'alpha':alpha};
		return {'data':data,'bigData':bigData};
	}
	
	this.drawHeart = function(array,color,offsetX,offsetY){
		ctx.beginPath();
		
		ctx.moveTo(offsetX+array[0]['x'],offsetY+array[0]['y']);
		for(var i=1;i<array.length;i++){
			ctx.lineTo(offsetX+array[i]['x'],offsetY+array[i]['y']);
		}
		ctx.fillStyle=color
		ctx.fill();
	}
	this.drawText = function(){
		var text = "姜小月~~~何汇玉";
		ctx.font="30px 华文行楷";
		var textWidth = ctx.measureText(text)
		ctx.fillText(text,this.centerX-textWidth['width']/2,this.centerY);
		
	}
	
	this.draw = function(){
		
		this.drawBigHeart();
		this.drawText();
		
	}
	this.drawBigHeart = function(){
		if(this.currentTimer<=0){
			this.currentProgress += 1;
			this.currentTimer = this.timer ;
		}
		this.currentTimer -= 1;
		if(this.currentProgress<=this.bigArray.length){
			for(var i=0;i<this.currentProgress;i++){
				var temp = this.bigArray[i]
				var color = 'rgba('+temp['red']+','+temp['green']+','+temp['blue']+','+temp['alpha']+')'
				this.drawHeart(this.array,color,temp['x'],temp['y'])
				if(temp['alpha']<0){
					temp['red']= this.random(256);
					temp['green']= this.random(256);
					temp['blue'] = this.random(256);
					temp['alpha'] = this.random(101)/100;
				}else{
					temp['alpha'] -=0.01;
				}
			}
			
		}else{
			this.currentProgress = 0;
		}
	}
	
}