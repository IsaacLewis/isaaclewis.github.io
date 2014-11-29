var newCity = function(id, name) {
    return {
	"id":id,
	"name":name,
	"population":10,
	"huts":3,
	"living-space":"cramped",
	"food":10,
	"wood":0,
	"spears":0,
	"gatherers":20,
	"hunters":0,
	"wood-gatherers":0,
	"spear-crafters":0,
	"builders":0,
	"warriors":0
    }
}

var cities = [newCity(0, "Rome"), newCity(1, "Carthage")];
var job_rows = ["warriors","hunters","wood-gatherers","spear-crafters","builders"];

var loop = function() {
    tick();
    draw();
    setTimeout(function() {loop();}, 1000);
}

var tick = function() {
    for(var i = 0; i < cities.length; i++) {
	var city = cities[i];
	tickCity(city)
    }
}

var tickCity = function(city) {
    // check living space
    var crowdedness = city.population / Math.floor(city.huts);
    if(crowdedness <= 3) {
	city['living-space'] = "spacious";
    } else if(crowdedness <= 6) {
	city['living-space'] = "cosy";
    } else if(crowdedness <= 9) {
	city['living-space'] = "cramped";
    } else {
	city['living-space'] = "crowded";
    }

    // Grow population
    if(city.food <= 0) {
	city.food = 0;
	city.population = Math.floor(city.population * 0.97);
	for(var i in job_rows) {
	    var job = job_rows[i];
	    city[job] = Math.floor(city[job] * 0.9);
	}
    } else {
	var baseGrowth = 0.01;
	baseGrowth *= (5 / crowdedness);
	baseGrowth *= (city.food / city.population);
	city.population = (city.population * (1 + baseGrowth));
    }

    // gatherers
    var numGatherers = Math.floor(city.population);
    for(i in job_rows) {
	var job = job_rows[i];
	numGatherers -= city[job];
    }
    city.gatherers = numGatherers;
    city.food = city.food + (Math.min(150,city.gatherers) * 0.11);

    // wood-gatherers
    city.wood = city.wood + (city["wood-gatherers"] * 0.3);

    // spear-crafters
    if(city.wood > 1) {
	city.wood -= city["spear-crafters"] * 0.05;
	city.spears += city["spear-crafters"] * 0.2;
    }

    //builders
    if(city.wood > 10) {
	city.wood -= city.builders * 0.1;
	city.huts += city.builders * 0.05;
    }

    // hunters
    var usefulHunters = Math.min(Math.floor(city.spears), city.hunters);
    city.food += usefulHunters * 0.13;
    city.spears -= usefulHunters * 0.025;

    city.food -= city.population * 0.1;
}

var draw = function() {
    for(var i = 0; i < cities.length; i++) {
	var city = cities[i];
	drawCity(city)
    }
}

var drawCity = function(city) {
    var table = $("#city-"+city.id);

    for(k in city) {
	var val = city[k];
	if(typeof(val) == "number") {
	    val = Math.floor(val)
	}
	table.find("."+k).html(val);
    }

    /*
    var attacking = city.attacking !== null ? cities[city.attacking].name : "No-one";
    table.find(".attacking").html(attacking);a
    */
}


var changeProduction = function(city) {
    if(city.producing === "weapons") {
	city.producing = "farming_tools";
    } else if(city.producing === "farming_tools") {
	city.producing = "crafting_tools";
    } else if(city.producing === "crafting_tools") {
	city.producing = "weapons";
    }
}

var upJob = function(city, job) {
    if(city.gatherers > 0) {
	if(city[job] < 20) {
	    diff = 1;
	} else if(city[job] < 50) {
	    diff = 2;
	} else if(city[job] < 100) {
	    diff = 5;
	} else {
	    diff = 10;
	}
	city[job] += diff;
	city.gatherers -= diff;
    }

    drawCity(city);
}

var downJob = function(city, job) {
    if(city[job] > 0) {
	if(city[job] < 20) {
	    diff = 1;
	} else if(city[job] < 50) {
	    diff = 2;
	} else if(city[job] < 100) {
	    diff = 5;
	} else {
	    diff = 10;
	}
	city[job] -= diff;
	city.gatherers += diff;
    }

    drawCity(city);
}

$(cities).each(function(i) {
    var city = cities[i];
    var table = document.createElement("table");
    table.id = "city-"+city.id;

    $("body").append(table);

    for(k in city) {
	var row = document.createElement("tr");
	var htmlStr = "<td><b>"+k+"</b></td>"+
	    "<td class='"+k+"'></td>";

	if(job_rows.indexOf(k) !== -1) {
	    console.log(k);
	   htmlStr += "<td class='down-btn down-"+k+"'>-</td>"+
	    "<td class='up-btn up-"+k+"'>+</td>"
	}
	row.innerHTML = htmlStr;

	$(table).append(row);
    }

    $(table).find(".producing").click(function(e) {
	changeProduction(city);
    });

    $(job_rows).each(function(i) {
	var job = job_rows[i];
	$(table).find(".up-"+job).click(function(e) {upJob(city, job);});

	$(table).find(".down-"+job).click(function(e) {downJob(city, job);});
    });
});

loop();
