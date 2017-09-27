//JQuery函数
$(document).ready(function() {
	var screenWidth =document.body.clientWidth;
	var screenHeight =document.body.clientHeight;
	//是否中断
	var isShutDown = false;
	//鼠标是否按下
	var isDown = false;
	//鼠标按下点位置
	var startX ;
	var startY;
	//面板最后位置;
	var tableX;
	var tableY;
	$("body").append("<div id='operatorTable'></div>");
	$("#operatorTable").append("<input id='count' type='text' value=3 />&nbsp;<input type='button' id='countSubmit' value='修改自行车数量' />&nbsp;&nbsp;&nbsp;<input type='button' id='move' value='移动' /><br/><br/>");
	//车的数量		
	var	carCount;
	///每辆车的大小
	var	 carSize;
	flush($("#count").val());

	
	
		//获得input数组数据
		function getArray() {
			var array = new Array();
			$(".order").each(function(index, domEle) {
				array[index] = $(domEle).val();
			});
			return array;
		}
		//随机获得一组数
		function getRanArray() {
			var array = new Array();
			
			for(var i=0;i<carCount;i++){
				array[i] = i+1;
			}
			for(var i=0;i<carCount;i++){
				var randomIndex = Math.floor(Math.random()*(carCount-i));
				var temp = array[randomIndex];
				array[randomIndex] = array[carCount-i-1];
				array[carCount-i-1] = temp;
			}
			return array;
		}
		/**
		 * 车跑的函数
		 * @param car 车对象
		 * @param speed 速度数组 值之和为4
		 * @param index 速度数组遍历索引当前值
		 * @param x 车偏移量
		 * @param no 名次
		 * @return
		 */
		function carRun(car, speed, index, x, no) {
			var color = new Array("red", "blue", "green");
			var i = 0;
			//定时任务  每1毫秒执行一次
			var interval = window.setInterval(function() {
				if(isShutDown){
					window.clearInterval(interval);
				}
				i = i + 1;
				x = x + speed[index];
				$(car).css("right", x);
				//当执行250次之后也就是250毫秒后执行下一个任务  250
					if (i == 250) {
						window.clearInterval(interval);
						index = index + 1;
						if (index < speed.length) {
							carRun(car, speed, index, x, no);
						}
						if (index >= speed.length) {//结束
							if (no <= 3) {
								var str = "<font id=" + no
										+ " class='fontHint'>第" + no
										+ "名</font>"
								$(car).after(str);
								var position = $(car).position();

								$("#" + no).css("z-index", 3);
								$("#" + no).css("font-size", carSize * 0.2);
								$("#" + no).css("position", "absolute");
								$("#" + no)
										.css("left", position.left + carSize);
								$("#" + no).css("top",
										position.top + carSize / 2);
								$("#" + no).css("color", color[no - 1]);
							}
							$(car).attr("src", "image/car_stop.png");
						}

					}
				}, 1);
		}

		function carSpeedArray(second) {

			var array = new Array();

			var index = -1;
			var sum = 4*(document.body.clientWidth-carSize);

			if (second % 2 != 0) {
				var num = 0;
				do {
					num = Math.floor(Math.random() * 2000);
					num = (sum - num) % (Math.floor(second / 2)) + num;
				} while (num >= sum);
				sum = sum - num;
				index = index + 1;
				array[index] = num / 1000;
			}

			var couples = Math.floor(second / 2);

			var yu = sum % couples;

			sum = sum - yu;
			var perCouNo = new Array();

			for ( var i = 0; i < couples; i++) {

				perCouNo[i] = sum / couples;
				if (i == 0) {
					perCouNo[i] = perCouNo[i] + yu;
				}

				var num = Math.floor(Math.random() * perCouNo[i]);
				var num1 = perCouNo[i] - num;
				index = index + 1;
				array[index] = num1 / 1000;
				index = index + 1;
				array[index] = num / 1000;
			}
			return array;
		}

	function flush(count){
		//车的数量		
		carCount = $("#count").val();
		///每辆车的大小
		carSize = screenHeight / carCount ;
		
		for(var i=0;i<carCount;i++){
			$("body").append("<img src='image/car_stop.png'   class='car' />");
			$("#operatorTable").append("<input class='order' type='text' />");
		}
		$("#operatorTable").append("<input type='button' id='go' value='开始' /><input type='button' id='ran' value='随机' /><input type='button' id='stop' value='停止' />");
		
		
		
		
			//遍历初始化每个小车的css样式
			$(".car").each(function(index, domEle) {
				$(domEle).css("position", "absolute");
				$(domEle).css("z-index", "2");
				$(domEle).css("right", "0px");
				$(domEle).css("width", carSize + "px");
				$(domEle).css("height", carSize + "px");
				$(domEle).css("top", (2*carSize * index / 3) + "px");
			});
			
			$(".order").each(function(index, domEle) {
				$(domEle).css("height", screenHeight/20+"px");
				$(domEle).css("width", screenHeight/20 + "px");
				$(domEle).css("text-align", "center");
				$(domEle).css("margin", "10px");

			});

				$("#count").css("height", screenHeight/20+"px");
				$("#count").css("width", screenHeight/20 + "px");
				$("#count").css("text-align", "center");
				$("#count").css("margin", "10px");
			
			
				$("#operatorTable").css("position", "absolute");
				$("#operatorTable").css("z-index", "4");
				$("#operatorTable").css("left", "0px");
				$("#operatorTable").css("top", "0px");
				$("#operatorTable").css("margin", "40px");
				$("#operatorTable").css("background-color", "gray");
				$("#operatorTable").css("padding", "10px");
				$("#operatorTable").css("left",tableX);
				$("#operatorTable").css("top",tableY);
			
			//每一个输入框字符限制
			$(".order").each(function(index, domEle) {
				//失去焦点事件
					$(domEle).blur(function() {
						if (isNaN($(domEle).val())) {
							alert("请输入数字");
							$(domEle).val("");
						}else if ($(domEle).val().length>0&&new Number($(domEle).val()) > new Number(carCount)) {
							alert("数字应小于等于" + carCount);
							$(domEle).val("");
						}else if ($(domEle).val().length>0&&new Number($(domEle).val()) < 1) {
							alert("数字应大于0");
							$(domEle).val("");
						}
						var array = getArray();
						for ( var i = 0; i < array.length; i++) {
							if (array[i].length > 0) {
								if (array[i] == $(domEle).val() && i != index) {
									alert("该值已存在");
									$(domEle).val("");
								}
							}
						}

					});
				});
			$("#move").mousedown(function(e){
					$(this).val("确认");
					startX = e.pageX;
					startY = e.pageY;
					isDown = true;
			});
			$(document).mousemove(function(e){
				if(isDown){
					var table = $("#operatorTable");
					var tp = table.position();
					var tp_left = tp.left;
					var tp_top = tp.top;
					
					var distanceX =e.pageX-startX;
					var distanceY =e.pageY-startY;
					startX = e.pageX;
					startY = e.pageY;
					tableX = tp_left+distanceX;
					tableY = tp_top+distanceY;
					table.css("left",tableX);
					table.css("top",tableY);
				}
			});
			
			$("#move").mouseup(function(e){
				$(this).val("移动");
				isDown = false;
			});
			
			//开始按钮点击事件
			$("#go").click(function() {
				isShutDown = false;
				//车跑的图片
					$(".car").attr("src", "image/car.gif");
					//移除所有多余的字体
					$("font").remove();
					var orderArray = getArray();
					//循环遍历跑车
					for ( var index = 0; index < carCount; index++) {

						//车号，速度数组，速度索引，偏移量,名次
						carRun($($(".car").get(orderArray[index] - 1)),
								carSpeedArray(4 + index), 0, 0, index + 1)
					}
				});
			//开始按钮点击事件
			$("#ran").click(function() {
				isShutDown = false;
				//车跑的图片
				$(".car").attr("src", "image/car.gif");
				//移除所有多余的字体
				$("font").remove();
				var orderArray = getRanArray();
				//循环遍历跑车
				for ( var index = 0; index < carCount; index++) {

					//车号，速度数组，速度索引，偏移量,名次
					carRun($($(".car").get(orderArray[index] - 1)),
							carSpeedArray(4 + index), 0, 0, index + 1)
				}
				});
			//停止按钮点击事件
			$("#stop").click(function() {
				isShutDown = true;
				$("img").remove();
				$(".order").remove();
				$("#go").remove();
				$("#stop").remove();
				$("#ran").remove();
				$("font").remove();
				flush($("#count").val());
				});
			$("#countSubmit").click(function() {
				if (isNaN($("#count").val())) {
					alert("请输入数字");
					return false;
				}
				if ($("#count").val().length>0&&new Number($("#count").val()) < 1) {
					alert("数字应大于0");
					return false;
				}
				
				$("img").remove();
				$(".order").remove();
				$("#go").remove();
				$("#ran").remove();
				$("#stop").remove();
				$("font").remove();
				flush($("#count").val());
			});
		
		
	}	
		
		
	});
