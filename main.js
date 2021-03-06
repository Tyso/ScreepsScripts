var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleMiner = require('role.miner');
var roleMiner2 = require('role.miner2');
var misc = require('misc');

var Type =
{
	WORKER:
	{
		name: "Worker",
		role: "harvester",
		modules: [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]//[WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]
	},
	BUILDER:
	{
		name: "Builder",
		role: "builder",
		modules: [WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE]
	},
	UPGRADER:
	{
		name: "Upgrader",
		role: "upgrader",
		modules: [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE]
	},
	REPAIRER:
	{
		name: "Repairer",
		role: "repairer",
		modules: [WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
	},
	MINER:
	{
	    name: "Miner",
	    role: "miner",
	    modules: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE]
	},
	MINER2:
	{
	    name: "Miner2",
	    role: "miner2",
	    modules: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE]
	}
}

function GetErrorCodeString (error_code)
{
	return error_code_strings[-error_code];
}

var error_code_strings =
{
	0: "OK",
	1: "ERR_NOT_OWNER",
	2: "ERR_NO_PATH",
	3: "ERR_NAME_EXISTS",
	4: "ERR_BUSY",
	5: "ERR_NOT_FOUND",
	6: "ERR_NOT_ENOUGH_ENERGY | ERR_NOT_ENOUGH_RESOURCES | ERR_NOT_ENOUGH_EXTENSIONS",
	7: "ERR_INVALID_TARGET",
	8: "ERR_FULL",
	9: "ERR_NOT_IN_RANGE",
	10: "ERR_INVALID_ARGS",
	11: "ERR_TIRED",
	12: "ERR_NO_BODYPART",
	14: "ERR_RCL_NOT_ENOUGH",
	15: "ERR_GCL_NOT_ENOUGH"
}

function Create (type)
{
	var result = Game.spawns['Spawn1'].createCreep(type.modules, undefined, {role: type.role});
	// TODO: Check if we have the required energy to build the bot
	
	if (result != ERR_BUSY && result != -6)
		console.log ("Creating " + type.name + ", cost: " + misc.GetCost(type.modules));
	
	if (result < 0 && result != -6)
	{
		console.log ("Unable to create bot: " + GetErrorCodeString(result));
		return false;
	}
	else
	{
		return true;
	}
}


module.exports.loop = function () 
{
    /*var ExtNum = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
        });
    console.log("Number of Extensions: " + ExtNum.length); */ //Just using up cpu currently.
    
    /*var level; //Level By Extension Numbers
    
    if (ExtNum.length >= 0 && ExtNum.length <= 4)
    {
        level = 1;
    }
    else if (ExtNum.length >= 5 && ExtNum.length <= 9)
    {
        level = 2;
    }
    else if (ExtNum.length >= 10 && ExtNum.length <= 14)
    {
        level = 3;
    }
    else if (ExtNum.length >= 15 && ExtNum.length <= 19)
    {
        level = 4;
    }
    else if (ExtNum.length >= 20 && ExtNum.length <= 29)
    {
        level = 5;
    }
    else if (ExtNum.length >= 30 && ExtNum.length <= 39)
    {
        level = 6;
    }
    else if (ExtNum.length >= 40 && ExtNum.length <= 49)
    {
        level = 7;
    }
    else if (ExtNum.length >= 50 && ExtNum.length <= 59)
    {
        level = 8;
    }
    else if (ExtNum.length >= 60 && ExtNum.length <= 69) //69 For Memes
    {
        level = 9;
    }
    
     console.log("Current Level: " + level);*/
    
	var tower = Game.getObjectById('TOWER_ID');
	if(tower) 
	{
	    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if(closestHostile) 
		{
			tower.attack(closestHostile);
		}
		
		
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (structure) => structure.hits < structure.hitsMax});
			
		if(closestDamagedStructure) 
		{
			tower.repair(closestDamagedStructure);
		}
	}
	
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
	var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
	var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
	var repairers  = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
	var miner = _.filter(Game.creeps, (creep) => creep.memory.role == "miner");
	var miner2 = _.filter(Game.creeps, (creep) => creep.memory.role == "miner2");
	
	if(harvesters.length < 3)
	{
		Create (Type.WORKER);
	}
	else
	if(miner.length < 1)
	{
	    Create (Type.MINER);
	}
	else
	if(miner2.length < 1)
	{
	    Create (Type.MINER2);
	}
	else
	if(builders.length < 4)
	{
		Create (Type.BUILDER);
	}
	else
	if(upgraders.length < 2) //8
	{
		Create (Type.UPGRADER);
	}
	else
	if(repairers.length < 2)
	{
		Create (Type.REPAIRER);
	}
	
	
	for(var name in Game.creeps) 
	{
		var creep = Game.creeps[name];
		if(creep.memory.role == 'harvester') {
			roleHarvester.run(creep);
		}
		if(creep.memory.role == 'upgrader') {
			roleUpgrader.run(creep);
		}
		if(creep.memory.role == 'builder') {
			roleBuilder.run(creep);
		}
		if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if(creep.memory.role == 'miner2') {
            roleMiner2.run(creep);
        }
	}
	
}
