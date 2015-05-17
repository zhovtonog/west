//localStore4Minimap.minimapData.job_groups[5];
//Character.position
//

function getDistance(from, to){
    var distance = Math.sqrt(Math.pow(from.x - to.x,2) + Math.pow(from.y - to.y,2));

    return distance;
    /*console.log(distance);
     console.log(to.x);
     console.log(to.y);*/
}

$.each(localStore4Minimap.minimapData.job_groups[5] , function(key,data){



    //console.log(data);
    var to = {};
    to.x = data[0];
    to.y = data[1];

    var qq = getDistance(Character.position, to);

    console.log(qq);

});