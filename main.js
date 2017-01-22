var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var misc = require('misc');

var Type =
{
	WORKER:
	{
		name: "Worker",
		role: "harvester",
		modules: [WORK,CARRY,CARRY,MOVE,MOVE]
	},
	BUILDER:
	{
		name: "Builder",
		role: "builder",
		modules: [WORK,WORK,CARRY,MOVE]
	},
	UPGRADER:
	{
		name: "Upgrader",
		role: "upgrader",
		modules: [WORK,CARRY,MOVE,MOVE,MOVE]
	},
	REPAIRER:
	{
		name: "Repairer",
		role: "repairer",
		modules: [WORK,CARRY,MOVE,MOVE,MOVE]
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

	var tower = Game.getObjectById('TOWER_ID');
	if(tower) 
	{
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (structure) => structure.hits < structure.hitsMax});
			
		if(closestDamagedStructure) 
		{
			tower.repair(closestDamagedStructure);
		}

		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if(closestHostile) 
		{
			tower.attack(closestHostile);
		}
	}
	
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
	var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
	var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
	var repairers  = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
	
	if(harvesters.length < 4)
	{
		Create (Type.WORKER);
	}
	else
	if(upgraders.length < 3)
	{
		Create (Type.UPGRADER);
	}
	else
	if(builders.length < 6)
	{
		Create (Type.BUILDER);
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
	}
	
}
