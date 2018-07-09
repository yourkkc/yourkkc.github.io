var c = document.getElementById('canvas');
var ctx = c.getContext('2d');
var w = c.width =  window.innerWidth;
var h = c.height = window.innerHeight;
var mouseX;
var mouseY;

document.onmousemove = function(e){
	 mouseX = e.pageX;
	 mouseY = e.pageY;
}

var tree = new Tree();


function anim(){
	ctx.fillStyle = 'black';
    ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='white'
    tree.draw();
    
    if(mouseX<w){
    	mouseX+=1
    }else{
    	mouseX=1;
    }
	requestAnimationFrame(anim);
}
anim();

function Tree(){
	this.bottomX = w/2;
	this.bottomY = h;
	this.baseHeight = h/3;
	this.draw = function(){
		var dicty = this.drawTrunk(this.baseHeight);
		this.drawY(dicty);
	}
	
	this.drawY = function(dicty){
		if(dicty==null)
			return null;
		var temp = this.drawLine(dicty)
		if(temp!=null){
			if(this.drawY(temp[0])==null){
				if(this.drawY(temp[1])==null){
					return null;
				}
			}
		}
	}
	
	this.drawTrunk = function(length){

		var stopX = this.bottomX;
		var stopY = this.bottomY-length;
		
		ctx.beginPath()
		ctx.moveTo(this.bottomX,this.bottomY);
		ctx.lineTo(stopX,stopY);
		ctx.stroke();
		return {'startX':stopX,'startY':stopY,'length':length*3/5,'degree':Math.PI*mouseX/w};
	}
	this.drawLine = function(dicty){
		var degree = dicty['degree']
		var startX = dicty['startX']
		var startY = dicty['startY']
		var length = dicty['length']
		
		var temp = Math.PI*mouseX/w;
		
		var stopLeftY = startY-length*Math.cos(degree)
		var stopLeftX = startX - length*Math.sin(degree)
		var stopRightX = startX - length*Math.sin(degree-2*temp)
		var stopRightY = startY-length*Math.cos(degree-2*temp)
		
		ctx.beginPath()
		ctx.moveTo(startX,startY);
		ctx.lineTo(stopLeftX,stopLeftY);
		ctx.stroke();
		
		ctx.beginPath()
		ctx.moveTo(startX,startY);
		ctx.lineTo(stopRightX,stopRightY);
		ctx.stroke();
		
		var res = [];
		
		if(length>1){
			res.push({'startX':stopLeftX,'startY':stopLeftY,'length':length*3/5,'degree':degree+temp})
			res.push({'startX':stopRightX,'startY':stopRightY,'length':length*3/5,'degree':degree-temp});
			return res;
		}else{
			return null;
		}
	}
	
}