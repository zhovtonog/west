//localStore4Minimap.minimapData.job_groups[5];
//Character.position
//

 botGetJobs = function(callback){
    jQuery.ajax({
        url : "/game.php?window=map&ajax=get_minimap",
        type : "POST",
        dataType : "json",
        async: "false",
        success : function (data) {
            callback(data);
            //console.log(data);
                //return data;
        }
    });

}




$( document ).ready(function() {
    console.log( "document ready!" );
    
    botGetJobs = function(callback){
        jQuery.ajax({
            url : "/game.php?window=map&ajax=get_minimap",
            type : "POST",
            dataType : "json",
            async: "false",
            success : function (data) {
                callback(data);
                //console.log(data);
                    //return data;
            }
        });

    }
    
    var initData = {loginStep : 'notLogin',
				   sortedWork: 'notInit',
				   workType: 'experience'};
    //botGetJobs(function(data){console.log(data);});
    
    
    
        /*jQuery.ajax({
        url : "http://ru14.the-west.ru/game.php?window=map&ajax=get_minimap",
        type : "POST",
        dataType : "json",
        success : function (data) {
                console.log(data);
        },
        error : function () {
            alert("Failed to submit the order.");
        }
    });*/

    //console.log(TaskQueue.queue);
    
    
    
    _botStartBot = function(){

        //this.loginStep = 'notLogin';
        var botNS = this;
        
        console.log('tik');
       /* this.jobList;
        self = this; 
        //console.log(typeof(this.jobList));
        if(!this.jobList){
            console.log('get jobs');
            botGetJobs(function(data){
               self.jobList = data;
            });
        }*/
        //console.log(jobList);

        function initData(){
            JobsWindow.toggleOpen();
            MinimapWindow.open();
            wman.closeAll();

        }
		
		function isSleep_(){
            if(TaskQueue.queue[0] && 'sleep' == TaskQueue.queue[0].type){
                console.log('isSleep_ true');
            } else {
                console.log('isSleep_ false');
            }
			//console.log('isSleep_');
		}

        function wekeUp(){
            $.each(TaskQueue.queue, function(key,val){
                TaskQueue.cancel(key);
            });
        }
		
		function lowHp(){
            console.log('isSleep_');
		}
		
		function lowEn(){
            console.log('isSleep_');
		}
		
		function isMoneyInBag(){
            console.log('isSleep_');
		
		}
        function getMinDist(job){
            //var job = JobsModel.searchJobsByPattern(work)[0];
            var minDist = '99999999999';
            var x = 0;
            var y = 0;

            var cord = {};

            /*charPos = Character.position;
             charPos.x = charPos.x + 1;
             charPos.y = charPos.y + 1;*/

            $.each(localStore4Minimap.minimapData.job_groups[job.jobObj.groupid] , function(key,data){
                var to = {};
                to.x = data[0];
                to.y = data[1];

                var qq = getDistance(Character.position, to);
                if(minDist > qq){
                    minDist = qq;
                    x = to.x;
                    y = to.y;
                }
            });
            cord.x = x;
            cord.y = y;
            //console.log(minDist);
            //console.log(x);
            //console.log(y);
            return cord;
        }

		
		function startBestWorkByType(){
            //return;  MinimapWindow.open();
			console.log('start findasdsadasd');
			//console.log(JobsModel.Jobs[0]);
			//initData.workType;
            if(0 == JobsModel.Jobs.length){
                JobsWindow.toggleOpen();
                wman.closeAll();

            } else {
                JobsModel.sortJobs('experience', null, 'desc');
                var i = 0;
                var bestJob = JobsModel.Jobs[i];
                while (!JobsModel.Jobs[i].isVisible) {
                    i++;
                }

                var cord = getMinDist(bestJob);
                console.log(cord);
            }
			/*if(1 == JobsModel.Jobs[0].id && 21 == JobsModel.Jobs[20].id){
				console.log('sorted jobs');
                JobsModel.sortJobs('experience', null, 'desc');
                console.log(JobsModel.Jobs[0]);
				//initData.sortedWork = 'inited'
				//JobsModel.sortJobs('experience', null, 'desc');
				//initData.sortedWork = 'inited';
			} else if('inited' == initData.sortedWork){
                console.log('sorted jobs');
				//initData.sortedWork = 'sorted';
			
			} else {
				var job;
				JobsModel.sortJobs('experience', null, 'desc');
				//console.log(JobsModel.Jobs);
				$.each(JobsModel.Jobs, function(key, val){
					if(val.isVisible){
                        job = val;
						//console.log(val);
						return;
					}
						//isVisible: true
				});

                console.log(job)
				
			}*/
            console.log('isSleep_');
		}
		
		function getBestPeriod(){
            console.log('isSleep_');
		}
		
		function getBestLocation(){
            console.log('isSleep_');
        }
		
		function startWork(){
            console.log('isSleep_');
		}
		
		function gamePage(){
			if('ru14.the-west.ru' == document.location.host){
				return true;
			} else {
				return false;
			}
		}
		
		function tasks(){
			if(0 == TaskQueue.queue.length){
				return false;
			} else {
				return true;
			}
		}
		
		function startCollect(){
		
		}
		
		function loginAccount(){
            var self = this;

            if('notLogin' == initData.loginStep){
                initData.loginStep = 'loginStart';
                $('#inputUsername .loginUsername').val('Mokerok');
                $('#inputPassword .loginPassword').val('master333');
                $('#loginButton').trigger('click');

                /*setTimeout(function(){
                    console.log(self.loginStep);
                    console.log('qedasdsad');
                    self.loginStep = 'loginProcess';
                }, 3000);*/

            } else if('loginStart' == initData.loginStep){
                initData.loginStep = 'loginProcess';
                setTimeout(function(){
                    initData.loginStep = 'loginComplite';
                }, 3000);
               /* Auth.login('14');
                setTimeout(function(){

                    console.log('zzzzzzzz');
                    self.loginStep = 'notLogin';
                }, 3000);*/
            } else if('loginComplite' == initData.loginStep){
                Auth.login('14');
                setTimeout(function(){
                    initData.loginStep = 'notLogin';
                }, 3000);

            }
			//$('#inputUsername .loginUsername').val('Mokerok');
			//$('#inputPassword .loginPassword').val('master333');
			//$('#loginButton').trigger('click');
			
			//Auth.login('14');
			//var data = {name:'Yellow7',password:'yellow333'};
			
			/*jQuery.ajax({
				url : "http://www.the-west.ru/index.php?ajax=check_login",
				type : "POST",
				dataType : "json",
				async: false,
				data: data,
				success : function (data) {
					//setTimeout(function(){
							//Auth.checkLogin();
						//},1000);
					
					
					//if(!Auth.checkLogin()){
						/*setTimeout(function(){
							Auth.login('14');
						},3000);
					//}
					//setTimeout(function(){
					//	Auth.login('14');
					//},1000);
						//nsole.log(data);
				},
				error : function () {
					alert("Failed to submit the order.");
				}
			});*/
		
		}
		
		if(!gamePage()){
			//loginAccount();
			//ждать загрузки или пытатся залогинится
		} else {

            if(0 == JobsModel.Jobs.length || "undefined" == typeof(localStore4Minimap.minimapData)){
                initData();

            }



			if(isSleep_() && Character.energy/Character.maxEnergy < 0.95 && Character.health/Character.maxHealth < 0.6 && 0 == Character.money){
			   // ничего не делать, или проверить сколько ещо спать и забить
			   
			} else if(isSleep_() && Character.energy/Character.maxEnergy < 0.95 && Character.health/Character.maxHealth < 0.6 && 0 < Character.money){
				//выложить деньги   
			} else if(isSleep_() && Character.energy/Character.maxEnergy < 0.95 && Character.health/Character.maxHealth > 0.6){
                wekeUp();
			} else if(!isSleep_() && !tasks()){
				console.log('working');
				if(true){
					console.log('startBestWorkByType');
					startBestWorkByType();
				} else {
					startCollect();
				}
			   //var bestWork = findBestWork();
			   /*var period = getBestPeriod(bestWork);
			   var location = getBestLocation(bestWork);
			   startWork(bestWork, location, period);*/
			}
		}
        
    }
    
    
    setInterval(function(){
        _botStartBot();
    },5000);
    
});


//http://ru14.the-west.ru/game.php?window=work&mode=index

/*jQuery.ajax({
        url : "http://ru14.the-west.ru/game.php?window=work&mode=index",
        type : "POST",
        dataType : "json",
        success : function (data) {
                console.log(data);
        },
        error : function () {
            alert("Failed to submit the order.");
        }
    });*/


getDistance = function(from, to){
    var distance = Math.sqrt(Math.pow(from.x - to.x,2) + Math.pow(from.y - to.y,2));

    return distance;
    //console.log(distance);
    //console.log(to.x);
    //console.log(to.y);
}
/*
$.each(localStore4Minimap.minimapData.job_groups[5] , function(key,data){



    //console.log(data);
    var to = {};
    to.x = data[0];
    to.y = data[1];

    var qq = getDistance(Character.position, to);

    console.log(qq);

});
*/
getMinDist = function (work){
    var job = JobsModel.searchJobsByPattern(work)[0];
    var minDist = '99999999999';
    var x = 0;
    var y = 0;
    
    /*charPos = Character.position;
    charPos.x = charPos.x + 1;
    charPos.y = charPos.y + 1;*/
    
    $.each(localStore4Minimap.minimapData.job_groups[job.jobObj.groupid] , function(key,data){
        var to = {};
        to.x = data[0];
        to.y = data[1];

        var qq = getDistance(Character.position, to);
        if(minDist > qq){
            minDist = qq;
            x = to.x;
            y = to.y;
        }
    });
    console.log(minDist);
    console.log(x);
    console.log(y);
}

/*
tasks[3][jobId]:9
tasks[3][x]:27343
tasks[3][y]:8118


*/
/*JobsWindow.toggleOpen();
wman.closeAll();
JobsModel.sortJobs('experience', null, 'desc');
JobsModel.Jobs; 
isVisible: true*/
