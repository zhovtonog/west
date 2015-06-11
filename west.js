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




    function printStat(){


        console.log('print stat');
		var curTask = ''
		
		if('sleep' == TaskQueue.queue[0].type){
			curTask = 'sleep  yet ' + (TaskQueue.queue[0].data.date_done - Date.now()) / 1000 /60 + ' minutes';
		
		} else if('job' == TaskQueue.queue[0].type){
			curTask = 'job = '+ TaskQueue.queue[0].data.job.shortname +' yet ' + (TaskQueue.queue[0].data.date_done - Date.now()) / 1000 /60 + ' minutes';
		}
		
		console.log('--------------------------------------------------------------------------------');
		
        console.log("char = " + conf.user + " Healthy = " + Character.health/Character.maxHealth + " EN = " + Character.energy);
		console.log(curTask);
		console.log('Free stat == ' + CharacterSkills.freeAttrPoints + ' Free skills == ' + CharacterSkills.freeSkillPoints +  ' gold == ' + Character.money);
		console.log('=================================================================================');
		
    }

    setInterval(function(){printStat();}, 60000);
    
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

    function getBotCookie(name) {
        console.log(name);
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
    
    var conf = {user: getBotCookie('user'),
                pass: getBotCookie('pass'),
                loginStep : 'notLogin',
				   sortedWork: 'notInit',
				   workType: getBotCookie('workType'),
					workList : getBotCookie('workList'),
					statUp: getBotCookie('statUp'),
					skillUp: getBotCookie('skillUp'),
                    maxDanger: 20,
                    jobID: 0,
                    xp: 0,
			   		jobsList:[]};

    //xp || gold || best
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
        
        //console.log('tik');
        //console.log(location.href);
        function initData(){
            JobsWindow.toggleOpen();
            MinimapWindow.open();
            wman.closeAll();

        }
		
		function isSleep_(){
            if(TaskQueue.queue[0] && 'sleep' == TaskQueue.queue[0].type){
                //console.log('char energy == ' +  Character.energy + 'char healthy == ' + Character.health/Character.maxHealth);
                return true;
            } else {
                return false;
            }
			//console.log('isSleep_');
		}

        function wekeUp(){
            $.each(TaskQueue.queue, function(key,val){
                TaskQueue.cancel(key);
            });
			layOutMoney();
        }
		
		function goSleep(){
            console.log('try sleep');
            TaskQueue.add(new TaskSleep(Character.homeTown.town_id, 'luxurious_apartment'));
		}
		
		function layOutMoney(){
			console.log('LayOutMoney');
			if(Character.money > 0 ){
				Ajax.remoteCall("building_bank", "deposit", {town_id: Character.getCapital(), amount: Character.money});
			}
		}
		
		function getBestDuration(danger, dmg){
            if(Character.health / danger < 10) {
                return 3600;
            } else if(Character.health / danger < 20){
                return 600;
            } else {
                return 15;
            }
        }
		

        function getMinDist(job){
            //var job = JobsModel.searchJobsByPattern(work)[0];
            var minDist = '99999999999';
            var x = 0;
            var y = 0;

            var cord = {};

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
		
		function initJobs(callbeck){
			
			jQuery.ajax({
                url : "/game.php?window=work&mode=index",
                type : "POST",
                dataType : "json",
                async: "false",
                success : function (data) {
					
					
					$.each(data.jobs, function(key,val){
						if(!JobsModel.getById(key).isVisible){
                            return;
                        }
						conf.jobsList.push({id: key, xp:val.durations[0].xp, money: val.durations[0].money});
					})
				
					//jobsList.sort(best);
                    //console.log(data);
                    //363
                }
            });
		
		
		}
		
		function sortJobsByType(type){
			if('xp' == type ){
				function xp(a,b) {
					  if (a.xp > b.xp)
						return -1;
					  if (a.xp < b.xp)
						return 1;
					  return 0;
				}
				
				conf.jobsList.sort(xp);
			
			} else if('money' == type){
				function money(a,b) {
					  if (a.money > b.money)
						return -1;
					  if (a.money < b.money)
						return 1;
					  return 0;
					}
				
				conf.jobsList.sort(money);
			
			} else if('best' == type){
				function best(a,b) {
					  if (a.money/2 + a.xp > b.money/2 + b.xp)
						return -1;
					  if (a.money/2 + a.xp < b.money/2 + b.xp)
						return 1;
					  return 0;
					}
				conf.jobsList.sort(best);
			
			}
					
		}

		
		function startBestWorkByType(){
            //return;  MinimapWindow.open();
			console.log('startBestWorkByType');
			//console.log(JobsModel.Jobs[0]);
			//initData.workType;
            if(0 == JobsModel.Jobs.length){
                JobsWindow.toggleOpen();
                wman.closeAll();

            } else {

                if(0 == conf.jobsList.length){
					initJobs();
                    
                } else{
					sortJobsByType(conf.workType);

 					$.each(conf.jobsList, function(key, val){
                        if("undefined" == typeof(val.danger) || val.danger < conf.maxDanger){
                            var bestJob = JobsModel.getById(val.id);

                            var cord = getMinDist(bestJob);

                            var jobCord = {jobId: bestJob.id, x: cord.x, y: cord.y};
                            //console.log(cord);

                            jQuery.ajax({
                                url : "/game.php?window=job&mode=job",
                                type : "POST",
                                dataType : "json",
                                async: "false",
                                data : jobCord,
                                success : function (data) {
                                    //console.log(data);
                                    var duration = getBestDuration(data.danger, data.maxdmg);

                                    if(data.durations[0].xp == val.xp){
                                        if('undefined' == val.danger){
                                            val.danger = data.danger;

                                        }

                                        if(Character.health/Character.maxHealth < 0.3){
                                            goSleep();

                                        } else if(15 == duration && Character.energy < 1 ||
                                            600 == duration && Character.energy < 5 ||
                                            3600 == duration && Character.energy < 12){
                                            goSleep();
                                        } else {
                                            console.log('start work id == ' + bestJob.id + 'char energy == ' +  Character.energy + ' HP == ' + Character.health);
											
											console.log(data.id + '||' + jobCord.x + '||' + jobCord.y + '||' + duration);
                                            JobWindow.startJob(data.id, jobCord.x, jobCord.y, duration);
                                            return false;
                                        }
                                    } else {
                                        val.xp = data.durations[0].xp;
                                        val.money = data.durations[0].money;
                                        val.danger = data.danger;
                                        sortJobsByType(conf.workType);
                                        return false;
                                        //conf.xp = 0;
                                    }
                                }
                            });
                            return false;
                        } else {


                        }
					});

					



                }


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
		
		function findBestWorkByType(type, callbeck){
            jQuery.ajax({
                url : "/game.php?window=work&mode=index",
                type : "POST",
                dataType : "json",
                async: "false",
                success : function (data) {
                    //console.log(data);
                    var point = 0;
                    var xp = 0;
                    var id = 0;

                    $.each(data.jobs, function(key, val){
                        if(conf.maxDanger > val.danger){
                            //console.log('to danger');
                            return;
                        }
                        if(!JobsModel.getById(key).isVisible){
                            return;
                        }
                        if('xp' == type){
                            if(point < val.durations[0].xp){
                                point = val.durations[0].xp;
                                id = key;
                                xp = val.durations[0].xp;

                            }
                        } else if('money' == type){
                            if(point < val.durations[0].money){
                                point = val.durations[0].money;
                                id = key;
                                xp = val.durations[0].xp;

                            }

                        } else if ('best' == type){
                            if(point < val.durations[0].money/2 + val.durations[0].xp){
                                point = val.durations[0].money/2 + val.durations[0].xp;
                                id = key;
                                xp = val.durations[0].xp;
                            }
                        }


                    })

                    var res = {id:id, xp:xp};
                    callbeck(res);
                }
            });
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
		
		function setSkills(){
			if(CharacterSkills.freeAttrPoints > 0 || CharacterSkills.freeSkillPoints > 0){
				Ajax.remoteCall('skill', 'save_skill_changes', {
					'modifier': 'add',
					"data": JSON.stringify({
						"attribute_modifications": {"charisma":1},
						"skill_modifications": {"leadership":1},
						"attribute_points_used": 1,
						"skill_points_used": 1
					})
				});
				
			}
		}
		
		function loginAccount(){
            console.log('login');
            var self = this;

            if('notLogin' == conf.loginStep){
				console.log('notLogin' + conf.user + conf.pass);
                conf.loginStep = 'loginStart';
                $('#inputUsername .loginUsername').val(conf.user);
                $('#inputPassword .loginPassword').val(conf.pass);
                $('#loginButton').trigger('click');

                /*setTimeout(function(){
                    console.log(self.loginStep);
                    console.log('qedasdsad');
                    self.loginStep = 'loginProcess';
                }, 3000);*/

            } else if('loginStart' == conf.loginStep){
				console.log('loginProcess' + conf.user + conf.pass);
                conf.loginStep = 'loginProcess';
                setTimeout(function(){
                    conf.loginStep = 'loginComplite';
                }, 3000);
               /* Auth.login('14');
                setTimeout(function(){

                    console.log('zzzzzzzz');
                    self.loginStep = 'notLogin';
                }, 3000);*/
            } else if('loginComplite' == conf.loginStep){
				console.log('enter 14 world' + conf.user + conf.pass);
                Auth.login('14');
                setTimeout(function(){
                    conf.loginStep = 'notLogin';
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
			loginAccount();
			//ждать загрузки или пытатся залогинится
		} else {
            if(0 == JobsModel.Jobs.length || "undefined" == typeof(localStore4Minimap.minimapData)){
                initData();

            }
            if(jQuery('.tw2gui_dialog.loginbonus').length){
                jQuery('.tw2gui_button.collect-btn').click();
                console.log('get login bonus');
                return false;


            } else if(jQuery('.quest_reward_button.normal').length){
                jQuery('.quest_reward_button.normal').click();
                console.log('click revard');
                return false;

            }



			if(isSleep_() && Character.energy/Character.maxEnergy < 0.95 && Character.health/Character.maxHealth < 0.6 && 0 == Character.money){
			   // ничего не делать, или проверить сколько ещо спать и забить
			   
			} else if(isSleep_() && Character.energy/Character.maxEnergy < 0.95 && Character.health/Character.maxHealth < 0.6 && 0 < Character.money){
				//выложить деньги   
			} else if(isSleep_() && Character.energy/Character.maxEnergy > 0.95 && Character.health/Character.maxHealth > 0.6){
                console.log('weke up');
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
    },2000);
    
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



//			jQuery.ajax({
//                url : "/game.php?window=work&mode=index",
//                type : "POST",
//                dataType : "json",
//                async: "false",
//                success : function (data) {
//					var jobsList = [];
//					
//					$.each(data.jobs, function(key,val){
//						if(!JobsModel.getById(key).isVisible){
//                            return;
//                        }
//						jobsList.push({id: key, xp:val.durations[2].xp, money: val.durations[2].money})
//					})
//					
//					function xp(a,b) {
//					  if (a.xp > b.xp)
//						return -1;
//					  if (a.xp < b.xp)
//						return 1;
//					  return 0;
//					}
//					
//					function money(a,b) {
//					  if (a.money > b.money)
//						return -1;
//					  if (a.money < b.money)
//						return 1;
//					  return 0;
//					}
//					
//					function best(a,b) {
//					  if (a.money/2 + a.xp > b.money/2 + b.xp)
//						return -1;
//					  if (a.money/2 + a.xp < b.money/2 + b.xp)
//						return 1;
//					  return 0;
//					}
//				
//					jobsList.sort(best);
//					console.log(jobsList);
//                    //console.log(data);
//                    //363
//                }
//            });

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
