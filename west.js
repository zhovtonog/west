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
		
		function isSleep_(){
			console.log();
		}
		
		function lowHp(){
		
		}
		
		function lowEn(){
		
		}
		
		function isMoneyInBag(){
		
		
		}
		
		function findBestWork(){
		
		}
		
		function getBestPeriod(){
		
		}
		
		function getBestLocation(){
		
		}
		
		function startWork(){
		
		}
		
		function gamePage(){
			if('ru14.the-west.ru' == location.host){
				return true;
			} else {
				return false;
			}
		}
		
		function loginAccount(){
			
			//$('#inputUsername .loginUsername').val('Mokerok');
			//$('#inputPassword .loginPassword').val('master333');
			//$('#loginButton').trigger('click');
			
			//Auth.login('14');
			var data = {name:'Mokerok',password:'master333'};
			
			jQuery.ajax({
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
						},3000);*/
					//}
					//setTimeout(function(){
					//	Auth.login('14');
					//},1000);
						//nsole.log(data);
				},
				error : function () {
					alert("Failed to submit the order.");
				}
			});
		
		}
		
		if(!gamePage()){
			//loginAccount();
			//ждать загрузки или пытатся залогинится
		} /*else {
		
			if(isSleep?() && lowStat() && !moneyInBag()){
			   // ничего не делать, или проверить сколько ещо спать и забить
			   
			} else if(isSleep?() && lowStat() && moneyInBag()){
				//выложить деньги   
			} else if(isSleep?() && !lowStat()){
				   //проснутся
			} else if(!isSleep?()){
			   var bestWork = findBestWork(type);
			   var period = getBestPeriod(bestWork);
			   var location = getBestLocation(bestWork);
			   startWork(bestWork, location, period);
			}
		}*/
        
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
    //console.log(data);
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

//JobsModel.sortJobs('experience', null, 'desc');
//JobsModel.Jobs 
//isVisible: true
