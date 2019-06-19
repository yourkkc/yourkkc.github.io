(function($) {      
    $.fn.swiper = function(options) {   
    	this.pagesId = options.pagesId;
    	this.transition = ['slide' ,'rotate' , 'flip' , 'card' , 'fade'];
    	this.list = [];
    	this.swiper = null;
    	this.init = function(){
    		
    		for(var i in this.pagesId){
    			let i1 = i;
    			var direction = $("#"+this.pagesId[i1]).attr("data-t-direction");
    			var duration = $("#"+this.pagesId[i1]).attr("data-t-duration");
    			var name = $("#"+this.pagesId[i1]).attr("data-t-name");
    			
    			if(name=='random'){
    				name = this.transition[Math.floor(Math.random()*this.transition.length)];
    			}
    			
    			var content = $("#"+this.pagesId[i1]).html();
    			this.list.push({
    				content :content,
    				transition : {
    					name : name,
    					duration :duration,
    					direction:direction
    				}
    			});
    		}
    		 this.swiper = new Swiper({
    				container : this[0],
    				data : this.list,
    				isLoop : true,
    				comCallBack:function(){
    					$(".current div div img").each(function(i){
    						$(this).attr("src",$(this).attr("datasrc"))
    					});
    					$(".current").next().children('div').children('div').children('img').each(function(i){
    						$(this).attr("src",$(this).attr("datasrc"))
    					});
    				}
    			});
    		 
    		 $(window).click( function() {console.log('--') } );
    		 
    		 
    	}
    	this.init();
    };     
})(jQuery); 
