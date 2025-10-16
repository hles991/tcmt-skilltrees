const g__devEnabled = false; /* Does nothing currently */

// Simplified number/text highlighting
const regexKeywords = new RegExp(/(victim'*s*|family'*s*)/, 'gi');
// Complicated number/text highlighting
// const regexKeywords = new RegExp(/(victim'*s*|family'*s*|heal[edthings]*|stamina|bone\scharms*|windows*|wells*|crawl\sspaces*|[un]*detect[ionabled]*|gather[ing]*|gaps*|hiding\sspots*|basement|lockpick[ing]*|minigames*|shadows*|button\staps*|close\sencounters*|sneak\sattack[sing]*|barg[eding]*|bone\sscrap|throwing\skni[vfes]*|healing\sitems*|death|stun[inged]*|bleed[ing]*|toxic|poison[eding]*|abilit[yies]*|sonar|reveal[seding]*|noises*|injured*|damaged*|unlock\stools*|barricades*|obstacles*|doors*|gates*|exits*\s|\.|tamper[ed]*|bell|barbed\swire|electric\straps*|powder|clouds*|sweet-talk[inged]*|cattle\sgrids*|generator|car\sbattery|valve|fuse\s*box|fuses*|chickens*|highlight[ingsed]*|first)/, 'gi');

// Case sensative, used to fetch perk tree data, order changeable
const g__victimNames = ['connie','leland','ana','sonny','julie','danny','virginia','maria','wyatt'];
const g__familyNames = ['leatherface','cook','hitchhiker','sissy','johnny','nancy','hands','bones'];

// 
const g__victimFilterOrder = ['proficiency','stealth','strength','toughness','endurance','unique'];
const g__familyFilterOrder = ['savagery','blood-harvest','endurance','unique','grandpa'];
const g__victimAttributes = ['toughness','endurance','strength','proficiency','stealth'];
const g__familyAttributes = ['savagery','blood-harvest','endurance'];

//
const tcm__victimGeneralPerks = [15,17,18,24];
const tcm__familyGeneralPerks = [210,225,228];

//
const tcm__attributes = {'connie': [20,25,15,35,30],'leland': [20,30,40,25,10],'ana': [35,25,30,20,20],'sonny': [15,35,35,25,15],'julie': [25,30,15,20,35],'danny': [30,25,15,35,25],'virginia': [30,32,15,30,18],'maria': [35,25,30,20,20],'wyatt': [35,25,35,25,5],'leatherface': [40,13,35],'cook': [35,25,10],'hitchhiker': [15,22,28],'johnny': [30,16,30],'sissy': [10,38,23],'nancy': [20,33,15],'hands': [38,22,15],'bones': [30,15,25]};
const tcm__attributePerks = [[16,'proficiency',7],[37,'stealth',7],[42,'strength',7],[58,'toughness',7],[72,'endurance',7],[203,'savagery',7],[214,'blood-harvest',7],[233,'endurance',7]];

// Set sizes of grids used for various images
const g__victimPerksRows = 12;
const g__victimPerksColumns = 10;
const g__familyPerksRows = 12;
const g__familyPerksColumns = 10;
const g__abilityIconRows = 5;
const g__abilityIconColumns = 5;
const g__grandpaIconRows = 5;
const g__grandpaIconColumns = 5;

// Set sizes of tree nodes and images
const g__pathIconSize = 45;
const g__nodeSize = 80;
const g__iconSize = 50;
const g__abilityIconSize = 60;
const g__grandpaIconSize = 50;

// Set branch styles
const g__branchColor = '#666';
const g__branchHighlightColor = '#d1a402';
const g__branchThickness = 10;
const g__branchHighlightThickness = 4;

// Set 'map' styles
const g__mapTrim = 150;
const g__maxZoom = 1.2;
const g__minZoom = 0.3;

// Various tracking
var g__deviceType = 'pc';
var g__touchStyle = false;
var g__touchNodeSelected = false;
var g__nodeMap;
var g__nodePos;
var g__shareInput;
var g__elem__floatingWindow;
var g__elem__floatingTarget;
var g__windowSize = {w:0,h:0};
var initialMapOffset = {x:0,y:0};
var initialMapScale = 1;
var startPointDist = 0;
var endPointDist = 0;
var contactPoints = {s1:{x:0,y:0},s2:{x:0,y:0},e1:{x:0,y:0},e2:{x:0,y:0}};
