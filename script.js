Element.prototype.removeChildren = function(){while(this.firstChild)this.removeChild(this.firstChild)}

function tcm__findParentById(node, id)
{
	let cNode = node;
	while (cNode)
	{
		if (id == cNode.id)
			break;
		cNode = cNode.parentNode;
	}
	return cNode;
}

function tcm__findParentByClass(node, string)
{
	let cNode = node;
	while (cNode)
	{
		if (cNode.classList && cNode.classList.contains(string))
			break;
		cNode = cNode.parentNode;
	}
	return cNode;
}

function tcm__encodeTreePath(charName)
{
	let encodedString = '';
	let binaryString = '';
	for (let i=0; i<36; i++)
	{
		if (i>0 && i%6==0)
		{
			encodedString += numToLetter(parseInt(binaryString, 2));
			binaryString = '';
		}
		if (window.tcm__temp.charData[charName].routeHistory.includes(i))
			binaryString += '1';
		else
			binaryString += '0';
	}
	return encodedString;
}

function tcm__decodeTreePath(string)
{
	let indexes = [];
	let binaryString = '';
	for (let i=0; i<string.length; i++)
		binaryString += numToBinary(letterToNum(string[i]));
	for (let i=0; i<binaryString.length; i++)
		if (binaryString[i]=='1')
			indexes.push(i);
	return indexes;
}

function tcm__encodePerkSelections(charName)
{
	let string = '';
	for (let i=0; i<3; i++)
		string += idToLetters(window.tcm__temp.charData[charName].perkChoices[i]);
	return string;
}

function tcm__decodePerkSelections(string)
{
	let id = 0;
	let choices = [];
	for (let i=0; i<3; i++)
	{
		id = Number(string.slice(i*2, (i*2)+2).split('').map((x)=>letterToNum(x)).join(''));
		choices.push(id);
	}
	return choices;
}

function tcm__encodeAttributeSpending(charName)
{
	let string = '';
	for (let i=1; i<window.tcm__temp.charData[charName].attributePoints.length; i++)
		string += numToLetter(window.tcm__temp.charData[charName].attributePoints[i]);
	return string;
}

function tcm__decodeAttributeSpending(string)
{
	let spending = [];
	for (let i=0; i<string.length; i++)
		spending.push(letterToNum(string[i]));
	return spending;
}

function tcm__encodeStarSelections(charName)
{
	let string = '';
	if (Array.isArray(window.tcm__temp.charData[charName].starChoices))
	{
		for (let i=0; i<3; i++)
			string += window.tcm__temp.charData[charName].starChoices.slice(3*i,3*(i+1)).concat([0,0,0]).slice(0,3).indexOf(1) + 1;
	} else {
		return '000';
	}
	return string;
}

function tcm__decodeStarSelections(string)
{
	let choiceArr = [0,0,0,0,0,0,0,0,0];
	let selArr = String(string).replaceAll(/\D/g,'').slice(0,3).split('').concat([0,0,0]).slice(0,3).map(a=>Number(a)>3?3:Number(a));
	for (let i=0; i<3; i++)
		if (selArr[i]>0)
			choiceArr[selArr[i]-1+(i*3)] = 1;
	return choiceArr;
}

function idToLetters(n){if (n<100){return String(n)}else if (n>99&&n<640){return `${numToLetter(String(n).slice(0,2))}${numToLetter(String(n).slice(2,3))}`}return '00';}

function numToLetter(n){n=Number(n);if(isNaN(n)){return '0'}else if(n==37){return '_'}else if(n==10){return '-'}else if(n>37){return String.fromCharCode(n+27)}else if(n>10){return String.fromCharCode(n+86)}return String.fromCharCode(n+48)}

function letterToNum(l){let n=String(l).charCodeAt(0);if(n==95){return 37}else if(n==45){return 10}else if(n>96){return n-86}else if(n>64){return n-27}return n-48}

function numToBinary(n){let b=parseInt(n).toString(2);while(b.length<6){b='0'+b}return b}

function tcm__encodeBuildString(charName)
{
	return `${tcm__encodeTreePath(charName)}${tcm__encodePerkSelections(charName)}${tcm__encodeAttributeSpending(charName)}${tcm__encodeStarSelections(charName)}`;
}

function tcm__decodeBuildString(charName, string)
{
	let buildPath = tcm__decodeTreePath(string.slice(0, 5));
	let buildPerks = tcm__decodePerkSelections(string.slice(5,11));
	let buildAttributes = tcm__decodeAttributeSpending(string.slice(11,16));
	window.tcm__temp.selectedNodes[charName] = [];
	for (let i=0; i<buildPath.length; i++)
		if (tcm__selectableNodes[charName].length >= buildPath[i])
			tcm__selectNode(tcm__selectableNodes[charName][buildPath[i]][0], tcm__selectableNodes[charName][buildPath[i]][1]);
	for (let i=0; i<3; i++)
	{
		window.tcm__temp.charData[charName].perkChoices[i] = 0;
		if (tcm__canAddPerk(charName, buildPerks[i]))
			window.tcm__temp.charData[charName].perkChoices[i] = buildPerks[i];
	}
	for (let i=0; i<buildAttributes.length; i++)
	{
		while (buildAttributes[i] > 0)
		{
			if (g__victimNames.includes(charName))
				tcm__adjustAttribute(charName, g__victimAttributes[i], 1);
			else
				tcm__adjustAttribute(charName, g__familyAttributes[i], 1);
			buildAttributes[i]--;
		}
	}
	window.tcm__temp.charData[charName].starChoices = tcm__decodeStarSelections(string.slice(11,16));
	tcm__updateStarSelections(charName);
}

function tcm__toggleEditLoadout()
{
	let editing = document.body.classList.toggle('edit');
	if (!editing)
		if (tcm__findParentById(g__elem__floatingTarget, 'loadout-window'))
			g__elem__floatingWindow.classList.remove('show');
}
function tcm__showShareString()
{
	let unhidden = g__shareInput.parentNode.classList.toggle('unhide');
	if (unhidden)
		tcm__updateShareString(window.tcm__temp.selectedChar);
}

function tcm__updateShareString(charName) {
  const base =
    (typeof g__shareBase === "string" && g__shareBase.trim().length)
      ? g__shareBase.trim().replace(/\/+$/, "")            // explicit override, no trailing slash
      : (location.origin + location.pathname).replace(/\/+$/, ""); // current page origin+path

  const build = tcm__encodeBuildString(charName);
  const url = `${base}?char=${encodeURIComponent(charName)}&build=${build}`;
  g__shareInput.value = url;
}


function tcm__undoChoice()
{
	let charName = window.tcm__temp.selectedChar;
	if (charName != undefined)
	{
		let sM = window.tcm__temp.selectedMatrix[charName]; // selection matrix
		if (window.tcm__temp.charData[charName].routeHistory.length > 1)
		{
			let pathIndex = Number(window.tcm__temp.charData[charName].routeHistory.pop());
			if (pathIndex != undefined)
			{
				for (let i=0; i<sM.length; i++)
					if (sM[i] == window.tcm__temp.charData[charName].choiceHistory.length)
						sM[i] = 0;

				let copiedSelections = window.tcm__temp.selectedNodes[charName].concat([]);
				window.tcm__temp.selectedNodes[charName] = [];
				for (let i=0; i<copiedSelections.length; i++)
				{
					if (tcm__selectableNodes[charName][pathIndex][2].includes(copiedSelections[i][4]))
					{
						if (copiedSelections[i][3] == 1)
							tcm__reduceUnspentAttributes(charName);
					}
					else
					{
						window.tcm__temp.selectedNodes[charName].push(copiedSelections[i]);
					}
				}
				window.tcm__temp.nextChoices[charName] = window.tcm__temp.charData[charName].choiceHistory.pop();
				tcm__validatePerkSelections(charName);
				tcm__updatePerkSelections(charName);
				tcm__updateAttributePoints(charName);
				tcm__highlightNodes(charName);
				tcm__updateUnlockedPerks(charName);
				createTreeBranches(charName);
				tcm__loadPerkDescription(window.tcm__temp.loadedPerk, true);
				tcm__updateShareString(charName);
			}
		}
	}
}


function tcm__resetSelections()
{
	let charName = window.tcm__temp.selectedChar;
	if (charName != undefined)
	{
		let treeArray = tcm__treeData[charName];
		if (treeArray != undefined)
		{
			for (let i=1; i<window.tcm__temp.selectedMatrix[charName].length; i++)
				window.tcm__temp.selectedMatrix[charName][i] = 0;
			window.tcm__temp.selectedNodes[charName] = [];
			window.tcm__temp.charData[charName].routeHistory = [];
			window.tcm__temp.charData[charName].choiceHistory = [];
			window.tcm__temp.nextChoices[charName] = [];
			window.tcm__temp.nextChoices[charName].push([treeArray[0][0], treeArray[0][1]]);
			window.tcm__temp.charData[charName].attributePoints = window.tcm__temp.charData[charName].attributePoints.map(x => 0);
			tcm__validatePerkSelections(charName);
			tcm__selectNode(treeArray[0][0], treeArray[0][1]);
			tcm__updatePerkSelections(charName);
			tcm__updateShareString(charName);
		}
	}
}

function tcm__buttonHandler(e)
{
	if (e.target && e.target.parentNode)
	{
		if (e.target.id == 'reset-tree' || e.target.parentNode.id == 'reset-tree')
		{
			tcm__resetSelections();
			tcm__resetTreePosition();
		}
		else if (e.target.id == 'undo-choice' || e.target.parentNode.id == 'undo-choice')
			tcm__undoChoice();
		else if (e.target.id == 'center-tree' || e.target.parentNode.id == 'center-tree')
			tcm__resetTreePosition();
		else if (e.target.id == 'share-build' || e.target.parentNode.id == 'share-build')
			tcm__showShareString();
	}
}

function tcm__shortcutHandler(e)
{
	if (document.activeElement.nodeName != 'INPUT')
	{
		if (window.tcm__temp.keyReleased)
		{
			window.tcm__temp.keyReleased = false;
			if (e.keyCode)
			{
				if ((!e.shiftKey || !e.altKey) && (e.keyCode > 48 && e.keyCode < 52))
				{
					let charName = window.tcm__temp.selectedChar;
					if (charName != undefined && window.tcm__temp.nextChoices[charName] != undefined)
					{
						let cS = window.tcm__temp.nextChoices[charName].sort((a,b)=>a[0]-b[0]);
						if (cS.length > e.keyCode - 49)
						{
							tcm__selectNode(cS[e.keyCode - 49][0], cS[e.keyCode - 49][1]);
							tcm__updateShareString(charName);
						}
					}
				}

				if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey)
				{
					if ((e.keyCode > 36 && e.keyCode < 41) || (31916820%e.keyCode==0))
					{
						g__nodeMap.parentNode.classList.add('moving');
						g__nodeMap.classList.add('moving');
						if (e.keyCode == 37 || e.keyCode == 65)
						{
							if (document.activeElement == document.body)
								tcm__setMapOffset(g__nodeMap.offsetLeft + (100 * window.tcm__temp.zoomScalar), g__nodeMap.offsetTop);
						}
						else if (e.keyCode == 38 || e.keyCode == 87)
						{
							if (document.activeElement == document.body)
								tcm__setMapOffset(g__nodeMap.offsetLeft, g__nodeMap.offsetTop + (100 * window.tcm__temp.zoomScalar));
						}
						else if (e.keyCode == 39 || e.keyCode == 68)
						{
							if (document.activeElement == document.body)
								tcm__setMapOffset(g__nodeMap.offsetLeft - (100 * window.tcm__temp.zoomScalar), g__nodeMap.offsetTop);
						}
						else if (e.keyCode == 40 || e.keyCode == 83)
						{
							if (document.activeElement == document.body)
								tcm__setMapOffset(g__nodeMap.offsetLeft, g__nodeMap.offsetTop - (100 * window.tcm__temp.zoomScalar));
						}
						repositionFloatingWindow();
					}
					else if (e.keyCode == 82)
					{
						tcm__resetSelections();
						tcm__resetTreePosition();
					}
					else if (e.keyCode == 69)
						tcm__undoChoice();
					else if (e.keyCode == 61 || e.keyCode == 187)
						tcm__zoomHandler(e);
					else if (e.keyCode == 173 || e.keyCode == 189)
						tcm__zoomHandler(e);
					else if (e.keyCode == 67)
						tcm__resetTreePosition();
					else if (e.keyCode == 70)
						tcm__toggleEditLoadout();
					else if (e.keyCode == 86)
						tcm__showShareString();
				}
			}
		}
		
		if (e.shiftKey || e.altKey)
		{
			if (e.keyCode > 48 && e.keyCode < 54)
			{
				e.preventDefault();
				let charName = window.tcm__temp.selectedChar;
				let attributeNames = g__victimAttributes;
				if (g__familyNames.includes(charName))
					attributeNames = g__familyAttributes;
				if (e.shiftKey)
					tcm__adjustAttribute(charName, attributeNames[e.keyCode - 49], 1);
				if (e.altKey)
					tcm__adjustAttribute(charName, attributeNames[e.keyCode - 49], -1);
				tcm__updateAttributePoints(charName);
				tcm__updateShareString(charName);
			}
		}
	}
}



function tcm__dragHandler(e)
{
	if ((e.type == 'mousedown' || e.type == 'touchstart') && (e.button?e.button!=2:true))
	{
		if (e.type == 'mousedown')
		{
			contactPoints.s1.x = contactPoints.e1.x = e.clientX;
			contactPoints.s1.y = contactPoints.e1.y = e.clientY;
			if (tcm__findParentById(e.target, 'node-window'))
				window.tcm__temp.mmDragElem = g__nodeMap;
			// window.tcm__temp.mmDragElem = tcm__findParentById(e.target, 'node-map');
		}
		else if (e.type == 'touchstart')
		{
			contactPoints.s1.x = contactPoints.e1.x = Math.floor(e.touches[0].clientX);
			contactPoints.s1.y = contactPoints.e1.y = Math.floor(e.touches[0].clientY);
			if (e.touches.length == 1)
			{
				if (tcm__findParentById(e.target, 'node-window'))
					window.tcm__temp.mmDragElem = g__nodeMap;
				// window.tcm__temp.mmDragElem = tcm__findParentById(e.target, 'node-map');
			}
			else if (e.touches.length == 2)
			{
				initialMapScale = Number(window.tcm__temp.zoomScalar);
				contactPoints.s2.x = contactPoints.e2.x = Math.floor(e.touches[1].clientX);
				contactPoints.s2.y = contactPoints.e2.y = Math.floor(e.touches[1].clientY);
				startPointDist = Math.floor(Math.sqrt((contactPoints.s1.x - contactPoints.s2.x)**2 + (contactPoints.s1.y - contactPoints.s2.y)**2));
			}
		}
		if (window.tcm__temp.mmDragElem)
		{
			initialMapOffset.x = window.tcm__temp.mmDragElem.offsetLeft;
			initialMapOffset.y = window.tcm__temp.mmDragElem.offsetTop;
		}
	}
	else if (e.type == 'mousemove' || e.type == 'touchmove')
	{
		if (window.tcm__temp.mmDragElem)
		{
			let trueX = initialMapOffset.x;
			let trueY = initialMapOffset.y;
			if (e.type == 'mousemove')
			{
				trueX = initialMapOffset.x + (e.clientX - contactPoints.s1.x);
				trueY = initialMapOffset.y + (e.clientY - contactPoints.s1.y);
			}
			else if (e.type == 'touchmove')
			{
				contactPoints.e1.x = Math.floor(e.touches[0].clientX);
				contactPoints.e1.y = Math.floor(e.touches[0].clientY);

				trueX = initialMapOffset.x + (contactPoints.e1.x - contactPoints.s1.x);
				trueY = initialMapOffset.y + (contactPoints.e1.y - contactPoints.s1.y);

				if (e.touches.length == 2)
				{
					contactPoints.e2.x = Math.floor(e.touches[1].clientX);
					contactPoints.e2.y = Math.floor(e.touches[1].clientY);
					endPointDist = Math.floor(Math.sqrt((contactPoints.e1.x - contactPoints.e2.x)**2 + (contactPoints.e1.y - contactPoints.e2.y)**2));
					window.tcm__temp.zoomScalar = Math.min(g__maxZoom, Math.max(g__minZoom, initialMapScale - ((startPointDist-endPointDist)/startPointDist)));
					g__nodeMap.style.transform = `scale(${window.tcm__temp.zoomScalar})`;
					let sm = {x: contactPoints.s1.x + ((contactPoints.s2.x - contactPoints.s1.x)/2), y: contactPoints.s1.y + ((contactPoints.s2.y - contactPoints.s1.y)/2)};
					let em = {x: contactPoints.e1.x + ((contactPoints.e2.x - contactPoints.e1.x)/2), y: contactPoints.e1.y + ((contactPoints.e2.y - contactPoints.e1.y)/2)};
					trueX = initialMapOffset.x - ((initialMapOffset.x + (g__nodeMap.clientWidth/2) - sm.x) - (((initialMapOffset.x + (g__nodeMap.clientWidth/2) - sm.x) / ((g__nodeMap.clientWidth*initialMapScale)/2)) * ((g__nodeMap.clientWidth*window.tcm__temp.zoomScalar)/2))) + (em.x - sm.x);
					trueY = initialMapOffset.y - ((initialMapOffset.y + (g__nodeMap.clientHeight/2) - sm.y) - (((initialMapOffset.y + (g__nodeMap.clientHeight/2) - sm.y) / ((g__nodeMap.clientHeight*initialMapScale)/2)) * ((g__nodeMap.clientHeight*window.tcm__temp.zoomScalar)/2))) + (em.y - sm.y);
				}
			}
			tcm__setMapOffset(trueX, trueY);
			g__nodeMap.parentNode.classList.add('grabbing');
			g__nodeMap.classList.add('grabbing');
			g__nodeMap.parentNode.classList.add('moving');
			g__nodeMap.classList.add('moving');
			e.preventDefault();
		}
	}
	else if (e.type == 'mouseup' || e.type == 'touchend' || e.type == 'touchcancel')
	{
		if (window.tcm__temp.mmDragElem)
		{
			if (e.type == 'touchend')
			{
				if (e.touches.length > 0)
				{
					initialMapOffset.x = window.tcm__temp.mmDragElem.offsetLeft;
					initialMapOffset.y = window.tcm__temp.mmDragElem.offsetTop;
					contactPoints.s1.x = contactPoints.e1.x = Math.floor(e.touches[0].clientX);
					contactPoints.s1.y = contactPoints.e1.y = Math.floor(e.touches[0].clientY);
				}
				else
				{
					g__nodeMap.parentNode.classList.remove('moving');
					g__nodeMap.classList.remove('moving');
					window.tcm__temp.mmDragElem = null;
				}
			}
			else if (e.touches == undefined || e.touches.length == 0)
			{
				g__nodeMap.parentNode.classList.remove('moving');
				g__nodeMap.classList.remove('moving');
				window.tcm__temp.mmDragElem = null;
			}
			g__nodeMap.parentNode.classList.remove('grabbing');
			g__nodeMap.classList.remove('grabbing');
		}
	}
}

function tcm__perkNodeHandler(e)
{
	if (true && !(e.type == 'mouseup' && e.button == 2))
	{
		let nodeMap = document.getElementById('node-map');
		let perkId;
		let iconElem = e.target;
		if (e.target.classList.contains('node'))
			iconElem = e.target.querySelector('.icon');
		if (iconElem != null)
			perkId = Number(iconElem.getAttribute('data-id'));
		if (!isNaN(perkId))
		{
			if (e.button == 2)
			{
				e.preventDefault();
				if (window.tcm__temp.charData[window.tcm__temp.selectedChar].perkChoices.includes(perkId))
				{
					tcm__removePerk(window.tcm__temp.selectedChar, perkId);
					if (iconElem.parentNode.classList.contains('slot-holder'))
						g__elem__floatingWindow.classList.remove('show');
				}
				tcm__updatePerkSelections(window.tcm__temp.selectedChar);
				tcm__updateAttributePoints(window.tcm__temp.selectedChar);
				tcm__updateShareString(window.tcm__temp.selectedChar);
			}
			else if (iconElem.parentNode)
			{
				if (e.ctrlKey || e.altKey)
				{
					e.preventDefault();
					let perkElem = nodeMap.querySelector(`div[data-id="${perkId}"]`);
					if (perkElem != undefined)
						tcm__centerMapOnPos(perkElem.parentNode.getAttribute('data-x'), perkElem.parentNode.getAttribute('data-y'), 0, 0);
				}
				else
				{
					if (!g__touchStyle)
					{
						if (g__nodeMap && g__nodeMap.classList && !g__nodeMap.parentNode.classList.contains('moving'))
						{
							tcm__addPerk(window.tcm__temp.selectedChar, perkId);
							tcm__updatePerkSelections(window.tcm__temp.selectedChar);
							tcm__updateAttributePoints(window.tcm__temp.selectedChar);
							tcm__updateShareString(window.tcm__temp.selectedChar);
						}
					}
				}
			}
		}
	}
}

function tcm__getNodeElem(x, y, charName)
{
	let arr = window.tcm__temp.elemIndexes[charName];
	for (let i=0; i<arr.length; i++)
	{
		if (arr[i][0] == x && arr[i][1] == y)
			return arr[i][2];
	}
	return undefined;
}

function createTreeBranches(name)
{
	let canvasElem = document.getElementById('tree-branches');
	let nodeSize = g__nodeSize;
	let treeArray = tcm__treeData[name];
	let limitW = Math.max(...treeArray.map(a => a[0]));
	let limitH = Math.max(...treeArray.map(a => a[1]));
	canvasElem.width = (g__mapTrim * 2) + (nodeSize * (limitW + 1));
	canvasElem.height = (g__mapTrim * 2) + (nodeSize * (limitH + 1));
	let cS = 0.75; // curve start (percentage) 0.5 < x < 1
	let cR = 1-cS; // curve radius (percentage)
	let hN = nodeSize/2; // half node
	let cso = nodeSize*cR;  // curve start offset
	let ceo = nodeSize*cS;  // curve end offset
	let ctx = canvasElem.getContext('2d');
	ctx.clearRect(0,0,canvasElem.width,canvasElem.height);
	if (treeArray != undefined)
	{
		let x,y,mI,lmn,rmn;
		treeArray.forEach(
			(treeNode) => {
				x = g__mapTrim + (treeNode[0] * nodeSize);
				y = g__mapTrim + ((limitH * nodeSize) - (treeNode[1] * nodeSize));
				
				ctx.beginPath();
				ctx.lineWidth = g__branchThickness;
				ctx.strokeStyle = g__branchColor;
				
				if (treeNode[2] == '1001')
				{
					ctx.moveTo(x + hN, y);
					ctx.lineTo(x + hN, y + cso);
					ctx.arc(x + cso, y + cso, cso, 0, .5*Math.PI);
					ctx.lineTo(x, y + hN);
					ctx.stroke();
				}
				else if (treeNode[2] == '1100')
				{
					ctx.moveTo(x + nodeSize, y + hN);
					ctx.lineTo(x + ceo, y + hN);
					ctx.arc(x + ceo, y + cso, cso, .5*Math.PI, Math.PI);
					ctx.lineTo(x + hN, y);
					ctx.stroke();
				}
				else if (treeNode[2] == '0110')
				{
					ctx.moveTo(x + hN, y + nodeSize);
					ctx.lineTo(x + hN, y + ceo);
					ctx.arc(x + ceo, y + ceo, cso, Math.PI, 1.5*Math.PI);
					ctx.lineTo(x + nodeSize, y + hN);
					ctx.stroke();
				}
				else if (treeNode[2] == '0011')
				{
					ctx.moveTo(x, y + hN);
					ctx.lineTo(x + cso, y + hN);
					ctx.arc(x + cso, y + ceo, cso, 1.5*Math.PI, 2*Math.PI);
					ctx.lineTo(x + hN, y + nodeSize);
					ctx.stroke();
				}
				else
				{
					ctx.moveTo(treeNode[2][3]=='1'?x:x+nodeSize/2, y + nodeSize/2);
					ctx.lineTo(treeNode[2][1]=='1'?x+nodeSize:x+nodeSize/2, y + nodeSize/2);
					ctx.stroke();
					ctx.moveTo(x + nodeSize/2, treeNode[2][0]=='1'?y:y+nodeSize/2);
					ctx.lineTo(x + nodeSize/2, treeNode[2][2]=='1'?y+nodeSize:y+nodeSize/2);
					ctx.stroke();
				}

				mI = Number(treeNode[0]) + (window.tcm__temp.selectedMatrix[name][0] * Number(treeNode[1])) + 1;
				if (window.tcm__temp.selectedMatrix[name].length >= mI && window.tcm__temp.selectedMatrix[name][mI] > 0)
				{
					ctx.lineWidth = g__branchThickness;
					ctx.strokeStyle = '#000';
					ctx.stroke();
					ctx.lineWidth = g__branchHighlightThickness;
					ctx.strokeStyle = g__branchHighlightColor;
					ctx.stroke();
				}
			}
		);
	}
}


function tcm__loadPerkTree(name)
{

	document.title = `TTCSM Skill Tree - ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
	document.getElementById('character-name').innerText = name;
	document.getElementById('share-string').classList.remove('unhide');

	let characterPortrait = document.getElementById('character-portrait');
	if (characterPortrait != undefined)
	{
		characterPortrait.setAttribute('src', `char/${name}.webp`);
		characterPortrait.setAttribute('alt', `Character portrait for ${name.charAt(0).toUpperCase()}${name.slice(1)}.`)
	}

	tcm__updatePerkSelections(name);
	tcm__updateAttributePoints(name);

	window.tcm__temp.selectedChar = name;
	if (window.tcm__temp.selectedMatrix[name] == undefined)
		window.tcm__temp.selectedMatrix[name] = [];
	if (window.tcm__temp.selectedNodes[name] == undefined)
		window.tcm__temp.selectedNodes[name] = [];
	if (window.tcm__temp.nextChoices[name] == undefined)
		window.tcm__temp.nextChoices[name] = [];

	//clear old tree
	let maxH = 0;
	let maxW = 0;
	let nodeMap = document.getElementById('node-map');
	nodeMap.removeChildren();
	let branchCanvas = document.createElement('canvas');
	branchCanvas.id = 'tree-branches';
	nodeMap.appendChild(branchCanvas);
	window.tcm__temp.elemIndexes[name] = [];

	//usable perks
	tcm__loadPerks(name);

	let treeArray = tcm__treeData[name];
	if (treeArray != undefined)
	{
		let mC = Math.max(...treeArray.map(a => a[0])) + 1; // max columns
		let mR = Math.max(...treeArray.map(a => a[1])) + 1; // max rows
		let mP = mC * mR; // matrix points
		if (window.tcm__temp.selectedMatrix[name].length == 0)
		{
			window.tcm__temp.selectedMatrix[name].push(mC);
			while (mP > 0)
			{
				window.tcm__temp.selectedMatrix[name].push(0);
				mP--;
			}
		}

		tcm__loadPerkDescription(treeArray[0][3]);
		treeArray.forEach(function(aNode){
			let nodeElem = document.createElement('div');
			nodeElem.classList.add('node');
			nodeElem.setAttribute('data-x', aNode[0]);
			nodeElem.setAttribute('data-y', aNode[1]);
			let nodeIcon = tcm__addNodeIcon('div', nodeElem, aNode[3]);
			if (nodeIcon != undefined)
			{
				nodeIcon.style.margin = `${(g__nodeSize-(aNode[3]==2?g__pathIconSize:aNode[3]>599?g__grandpaIconSize:aNode[3]>399?g__abilityIconSize:g__iconSize))/2}px`;
				if (nodeIcon.classList.contains('fork'))
					nodeIcon.classList.add(aNode[2]=='1111'?'triple':'double');
			}
			if (aNode[3] == 1 || aNode[3] == 3 || aNode[3] > 9)
				nodeElem.classList.add('entity');
			//node pos
			nodeElem.style.left = `${g__mapTrim + (aNode[0] * g__nodeSize)}px`;
			nodeElem.style.bottom = `${g__mapTrim + (aNode[1] * g__nodeSize)}px`;
			nodeElem.style.width = `${g__nodeSize}px`;
			nodeElem.style.height = `${g__nodeSize}px`;
			//
			nodeMap.appendChild(nodeElem);
			window.tcm__temp.elemIndexes[name].push([aNode[0], aNode[1], nodeElem]);
		});

		//update map size
		nodeMap.style.width = `${(g__mapTrim * 2) + (g__nodeSize * mC)}px`;
		nodeMap.style.height = `${(g__mapTrim * 2) + (g__nodeSize * mR)}px`;

		//select ability node
		if (window.tcm__temp.selectedNodes[name].length == 0)
		{
			window.tcm__temp.nextChoices[name].push([treeArray[0][0], treeArray[0][1]]);
			tcm__selectNode(treeArray[0][0], treeArray[0][1]);
		}
		else
		{
			createTreeBranches(name);
		}

		//highlight nodes
		tcm__highlightNodes(name);
		tcm__updateUnlockedPerks(name);
		tcm__updateTreeZoom();
		tcm__updateShareString(name);

		//center map position
		tcm__resetTreePosition();
	}
}

function tcm__centerMapOnPos(x, y, offsetX, offsetY)
{
	g__nodeMap.parentNode.classList.remove('moving');
	g__nodeMap.classList.remove('moving');
	tcm__setMapOffset(((Math.min(document.documentElement.clientWidth,window.innerWidth||0)/2)-((g__mapTrim+(Number(x)*g__nodeSize)+(g__nodeSize/2))*window.tcm__temp.zoomScalar)-((g__nodeMap.clientWidth-(g__nodeMap.clientWidth*window.tcm__temp.zoomScalar))/2))+offsetX, ((Math.min(document.documentElement.clientHeight,window.innerHeight||0))/2)-(((g__nodeMap.clientHeight-g__mapTrim)-(Number(y)*g__nodeSize)+(g__nodeSize/2))*window.tcm__temp.zoomScalar)-((g__nodeMap.clientHeight-(g__nodeMap.clientHeight*window.tcm__temp.zoomScalar))/2)+offsetY);
}

function tcm__setMapOffset(x, y)
{
	if (x + ((g__nodeMap.clientWidth/2)-((g__nodeMap.clientWidth*window.tcm__temp.zoomScalar)/2)) > g__windowSize.w/2)
		x = 0 - ((g__nodeMap.clientWidth-(g__nodeMap.clientWidth*window.tcm__temp.zoomScalar))/2) + g__windowSize.w/2;
	else if (x + ((g__nodeMap.clientWidth/2)+((g__nodeMap.clientWidth*window.tcm__temp.zoomScalar)/2)) < g__windowSize.w/2)
		x = 0 - (g__nodeMap.clientWidth/2) - ((g__nodeMap.clientWidth*window.tcm__temp.zoomScalar)/2) + g__windowSize.w/2;
	if (y + ((g__nodeMap.clientHeight/2)-((g__nodeMap.clientHeight*window.tcm__temp.zoomScalar)/2)) > g__windowSize.h/2)
		y = 0 - ((g__nodeMap.clientHeight-(g__nodeMap.clientHeight*window.tcm__temp.zoomScalar))/2) + g__windowSize.h/2;
	else if (y + ((g__nodeMap.clientHeight/2)+((g__nodeMap.clientHeight*window.tcm__temp.zoomScalar)/2)) < g__windowSize.h/2)
		y = 0 - (g__nodeMap.clientHeight/2) - ((g__nodeMap.clientHeight*window.tcm__temp.zoomScalar)/2) + g__windowSize.h/2;
	g__nodeMap.style.left = x;
	g__nodeMap.style.top = y;
}

function tcm__resetTreePosition()
{
	g__elem__floatingWindow.classList.remove('show');
	let nodeArray = tcm__treeData[window.tcm__temp.selectedChar];
	if (nodeArray != undefined)
		tcm__centerMapOnPos(nodeArray[0][0], nodeArray[0][1], 0, (Math.min(document.documentElement.clientHeight,window.innerHeight||0)/2) - 120);
	else
		tcm__centerMapOnPos(0, 0, 0, 0);
}

function tcm__zoomHandler(e)
{
	let x = document.body.clientWidth/2;
	let y = document.body.clientHeight/2;
	let initialMapScale = Number(window.tcm__temp.zoomScalar);
	let increment = 0;
	if (e.type == 'keydown')
	{
		if (e.keyCode == 61 || e.keyCode == 187)
			increment = 0.06;
		else
			increment = 0 - 0.06;
	}
	else if (e.type == 'wheel')
	{
		x = e.clientX;
		y = e.clientY;
		increment -= e.deltaY/10;
		if (g__deviceType == 'mac')
			increment /= 20;
	}

	window.tcm__temp.zoomScalar += increment;
	if (window.tcm__temp.zoomScalar > g__maxZoom)
		window.tcm__temp.zoomScalar = g__maxZoom;
	else if (window.tcm__temp.zoomScalar < g__minZoom)
		window.tcm__temp.zoomScalar = g__minZoom;
	g__nodeMap.classList.add('moving');

	let offsetRatioX = (x - (g__nodeMap.offsetLeft + g__nodeMap.clientWidth/2)) / ((g__nodeMap.clientWidth * initialMapScale) / 2);
	let offsetRatioY = (y - (g__nodeMap.offsetTop + g__nodeMap.clientHeight/2)) / ((g__nodeMap.clientHeight * initialMapScale) / 2);
	let addLeft = (((g__nodeMap.clientWidth * (window.tcm__temp.zoomScalar)) - (g__nodeMap.clientWidth * initialMapScale))/2) * offsetRatioX;
	let addTop = (((g__nodeMap.clientHeight * (window.tcm__temp.zoomScalar)) - (g__nodeMap.clientHeight * initialMapScale))/2) * offsetRatioY;

	g__nodeMap.style.transform = `scale(${window.tcm__temp.zoomScalar})`;
	tcm__setMapOffset(g__nodeMap.offsetLeft - addLeft, g__nodeMap.offsetTop - addTop);
}

function tcm__updateTreeZoom()
{
	let nodeMap = document.getElementById('node-map');
	if (nodeMap != undefined)
		nodeMap.style.transform = `scale(${window.tcm__temp.zoomScalar})`;
}

function tcm__addFilterOption(elem, value)
{
	let option = document.createElement('option');
	option.value = value;
	option.innerText = value;
	if (value=='blood-harvest')
		option.innerText = 'harvesting';
	elem.appendChild(option);
}

function tcm__loadPerks(charName)
{
	let perkFilter = document.getElementById('perk-filter');
	let lastValue = String(perkFilter.value);
	perkFilter.removeChildren();
	tcm__addFilterOption(perkFilter, 'all');
	tcm__addFilterOption(perkFilter, 'default');
	tcm__addFilterOption(perkFilter, 'unlocked');

	let perkList = document.getElementById('perk-list');
	perkList.removeChildren();

	if (g__victimNames.indexOf(charName) > -1)
	{
		g__victimFilterOrder.forEach(function(name){tcm__addFilterOption(perkFilter, name)});
		tcm__victimGeneralPerks.forEach(function(perkId){tcm__addNodeIcon('li', perkList, perkId).classList.add('default');});
	}
	else
	{
		g__familyFilterOrder.forEach(function(name){tcm__addFilterOption(perkFilter, name)});
		tcm__familyGeneralPerks.forEach(function(perkId){tcm__addNodeIcon('li', perkList, perkId).classList.add('default');});
	}

	for (let i=0; i<tcm__treeData[charName].length; i++)
		if (tcm__treeData[charName][i][3] > 9 && (tcm__treeData[charName][i][3] < 400 || tcm__treeData[charName][i][3] > 599))
			tcm__addNodeIcon('li', perkList, tcm__treeData[charName][i][3]);

	let isVictim = g__victimNames.includes(charName);
	if(lastValue==undefined||lastValue.length==0){lastValue='all'}
	if (lastValue != undefined && lastValue.length > 0 && lastValue != 'all')
	{
		if (isVictim)
		{
			if (lastValue=='blood-harvest'){lastValue='proficiency'}
			else if (lastValue=='savagery'){lastValue='strength'}
			else if (!g__victimFilterOrder.includes(lastValue) && g__familyFilterOrder.includes(lastValue)){lastValue='all'}
		}
		else
		{
			if (lastValue=='proficiency'){lastValue='blood-harvest'}
			else if (lastValue=='strength'){lastValue='savagery'}
			else if (!g__familyFilterOrder.includes(lastValue) && g__victimFilterOrder.includes(lastValue)){lastValue='all'}
		}
	}
	perkFilter.value = lastValue;
	perkList.className = lastValue;
}

function tcm__updateUnlockedPerks(charName)
{
	let perkId = 0;
	let listHolder = document.getElementById('available-perks');
	let perkList = document.getElementById('perk-list');
	let idList = window.tcm__temp.selectedNodes[charName].map(x => x[3]).filter(y => y>1);
	if (window.tcm__temp.selectedMatrix[charName].some((n,i)=>i>0&&n>1))
		listHolder.classList.add('made-selection');
	else
		listHolder.classList.remove('made-selection');

	for (let i=0; i<perkList.children.length; i++)
	{
		perkId = Number(perkList.children[i].getAttribute('data-id'));
		if (g__victimNames.includes(charName) && tcm__victimGeneralPerks.includes(perkId))
			perkList.children[i].classList.add('unlocked');
		else if (g__familyNames.includes(charName) && tcm__familyGeneralPerks.includes(perkId))
			perkList.children[i].classList.add('unlocked');
		else if (idList.includes(perkId))
			perkList.children[i].classList.add('unlocked');
		else
			perkList.children[i].classList.remove('unlocked');
	}
}

function tcm__nodeArrayNodeIndex(x, y, nodeArray)
{
	for (let i=0; i<nodeArray.length; i++)
		if (nodeArray[i][0] == x && nodeArray[i][1] == y) { return i; break; }
	return -1;
}

const g__choiceClasses = ['first','second','third'];
function tcm__highlightNodes(charName)
{
	let nodeArray = window.tcm__temp.selectedNodes[charName];
	let cS = window.tcm__temp.nextChoices[charName].sort((a,b)=>a[0]-b[0]);

	let nodeMap = document.getElementById('node-map');
	if (nodeMap != undefined)
	{
		let l = window.tcm__temp.selectedMatrix[charName][0];
		let x,y,p;
		for (let i=0; i<nodeMap.children.length; i++)
		{
			x = Number(nodeMap.children[i].getAttribute('data-x'));
			y = Number(nodeMap.children[i].getAttribute('data-y'));

			nodeMap.children[i].classList.remove('selectable');
			if (nodeArray.length > 6)
				nodeMap.children[i].classList.add('unselected');
			else
			{
				nodeMap.children[i].classList.remove('unselected');
				nodeMap.children[i].style.transitionDelay = null;
			}
		
			if (!isNaN(x) && !isNaN(y))
			{
				if (window.tcm__temp.selectedMatrix[charName][1 + Number(x) + (Number(y) * l)] > 0)
				{
					nodeMap.children[i].classList.add('highlighted');
					nodeMap.children[i].classList.remove('unselected');
				}
				else
				{
					nodeMap.children[i].classList.remove('highlighted');
				}
			}
		}
		let nodeElem;
		for (let i=0; i<cS.length; i++)
		{
			nodeElem = tcm__getNodeElem(cS[i][0], cS[i][1], charName);
			if (nodeElem != undefined)
			{
				nodeElem.classList.remove('first');
				nodeElem.classList.remove('second');
				nodeElem.classList.remove('third');
				nodeElem.classList.add(g__choiceClasses[i]);
				nodeElem.classList.add('selectable');
				nodeElem.classList.remove('unselected');
			}
		}
	}
}

function tcm__addNodeIcon(nodeType, parentElem, perkId) {
  let iconElem;
  const perkObject = tcm__getPerkObject(perkId);
  if (!perkObject) return undefined;

  iconElem = document.createElement(nodeType);
  iconElem.classList.add('icon');

  // Make these apply to ALL icons (IDs 1, 2, abilities, grandpa, etc.)
  if (nodeType === 'li') iconElem.setAttribute('tabindex', 0);
  iconElem.classList.add(perkObject[2]);           // e.g., 'strength', 'ability', 'grandpa', etc.
  iconElem.setAttribute('data-id', perkObject[0]); // needed for handlers/tooltips

  // Defaults assume victim perk sheet
  let columns      = g__victimPerksColumns;
  let rows         = g__victimPerksRows;
  let iconSize     = g__iconSize;
  let borderRadius = g__iconSize / 2;

  // Size / sheet selection by id-range
  if (perkObject[0] < 10) {
    if (perkObject[0] === 1) {
      // Attribute point: treat as victim-styled circle
      iconElem.classList.add('victim');
    } else if (perkObject[0] === 2) {
      // Path / fork: special size and class
      columns = 1;
      rows = 1;
      iconElem.classList.add('fork');
      iconSize = g__pathIconSize;
      borderRadius = g__pathIconSize / 2;
    }
  } else {
    if (perkObject[0] < 200) {               // victim perks
      iconElem.classList.add('victim');
    } else if (perkObject[0] < 400) {        // family perks
      iconElem.classList.add('family');
      columns = g__familyPerksColumns;
      rows = g__familyPerksRows;
    } else if (perkObject[0] < 600) {        // abilities
      columns = g__abilityIconColumns;
      rows = g__abilityIconRows;
      iconSize = g__abilityIconSize;
      borderRadius = iconSize / 2;
    } else {                                  // grandpa
      iconSize = g__grandpaIconSize;
      columns = g__grandpaIconColumns;
      rows = g__grandpaIconRows;
      borderRadius = 0;
    }
  }

  // Size and rounding
  iconElem.style.width        = `${iconSize}px`;
  iconElem.style.height       = `${iconSize}px`;
  iconElem.style.borderRadius = `${borderRadius}px`;

  // === Special-case images for IDs 1 & 2 (skip sprite sheet) ===
  if (perkObject[0] === 1) {
    // Random attribute / attribute point
    iconElem.style.backgroundImage    = 'url("perkimages/attribute_point.webp")';
    iconElem.style.backgroundRepeat   = 'no-repeat';
    iconElem.style.backgroundPosition = 'center';
    iconElem.style.backgroundSize     = 'contain';
  } else if (perkObject[0] === 2) {
    // Path / fork node
    iconElem.style.backgroundImage    = 'url("perkimages/path.webp")';
    iconElem.style.backgroundRepeat   = 'no-repeat';
    iconElem.style.backgroundPosition = 'center';
    iconElem.style.backgroundSize     = 'contain';
  } else {
    // Normal sprite-sheet positioning
    iconElem.style.backgroundPosition =
      `${(perkObject[4][0]) * (100 / (columns - 1))}% ${(perkObject[4][1]) * (100 / (rows - 1))}%`;
    iconElem.style.backgroundSize = `${iconSize * columns}px ${iconSize * rows}px`;
  }

  // Event wiring (same behavior as before)
  if (parentElem.classList.contains('node')) {
    parentElem.addEventListener('mouseup', tcm__perkNodeHandler);
    parentElem.addEventListener('contextmenu', tcm__perkNodeHandler);
  } else {
    iconElem.addEventListener('contextmenu', tcm__perkNodeHandler);
    iconElem.addEventListener('mouseup', tcm__perkNodeHandler);
  }

  parentElem.appendChild(iconElem);
  return iconElem;
}

function tcm__parsePerkText(perkObject)
{
	let finalText = '';
	let textArr = perkObject[3].split('|');
	for (let i=0; i<textArr.length; i++)
	{
		if (perkObject[0] > 9 && perkObject[0] < 400)
			finalText += `<h4>Level ${3-i}:</h4>`;
		finalText += `${textArr[i].replace(/(\s*[x]*\d+)(\.\d+)*([%mhp]*\s*)/gi,"<i>$1$2$3</i>").replace(regexKeywords, '<b>$1</b>')}`;
		// finalText += `<p>${textArr[i].replace(/(\s*\d+[%mhp]*\s*)/gi,"<i>$1</i>").replace(regexKeywords, '<b>$1</b>')}</p>`;
	}
	return finalText;
}

function tcm__getPerkIndex(id)
{
	for (let i=0; i<tcm__perkData.length; i++)
		if (tcm__perkData[i][0] == id)
			return i;
	return -1;
}

function tcm__getPerkObject(id)
{
	if (id != undefined)
	{
		for (let i=0; i<tcm__perkData.length; i++)
			if (tcm__perkData[i][0] == id)
				return tcm__perkData[i];
	}
	return undefined;
}

function tcm__loadPerkDescription(id, force=false)
{
	let wasOpen = g__elem__floatingWindow.classList.contains('show');
	if (id != undefined)
	{
		let perkObject = tcm__getPerkObject(id);
		if (perkObject != undefined)
		{
			let nodeMap = document.getElementById('node-map');
			let focusNode = nodeMap.querySelector(`div[data-id="${id}"]`);

			if (window.tcm__temp.loadedPerk != id || force)
			{
				tcm__familyGeneralPerks
				let highlighted = false;
				if (focusNode != undefined)
					highlighted = focusNode.parentNode.classList.contains('highlighted');
				let status = perkObject[0]<400?(window.tcm__temp.charData[window.tcm__temp.selectedChar].perkChoices.includes(perkObject[0])?'unequip':((highlighted||tcm__victimGeneralPerks.includes(perkObject[0])||tcm__familyGeneralPerks.includes(perkObject[0]))?'equip':'')):'';
				g__elem__floatingWindow.className = `perk-window ${status} ${focusNode?'on-map':''} ${perkObject[2]}`;
				if (wasOpen) { g__elem__floatingWindow.classList.add('show'); }
				g__elem__floatingWindowTitle.innerText = perkObject[1];
				g__elem__floatingWindowSubtitle.innerText = perkObject[2].replace('blood-harvest','harvesting');
				g__elem__floatingWindowBody.innerHTML = tcm__parsePerkText(perkObject);
				
				let unfocusNode = nodeMap.querySelector(`div[data-id="${window.tcm__temp.loadedPerk}"]`);
				if (unfocusNode != undefined && unfocusNode.parentNode != undefined)
					unfocusNode.parentNode.classList.remove('focus');
				if (focusNode != undefined && focusNode.parentNode != undefined)
					focusNode.parentNode.classList.add('focus');
				window.tcm__temp.loadedPerk = id;
			}
		}
	}
}

function tcm__canAddPerk(charName, id)
{
	if (isNaN(id)) { return false; }
	else if (id > 399) { return false; }
	if (window.tcm__temp.charData[charName].perkChoices.includes(id)) { return false; }
	if (g__victimNames.includes(charName) && tcm__victimGeneralPerks.includes(id)) { return true; }
	else if (g__familyNames.includes(charName) && tcm__familyGeneralPerks.includes(id)) { return true; }
	let nodeSelections = window.tcm__temp.selectedNodes[charName];
	for (let i=0; i<nodeSelections.length; i++) { if (nodeSelections[i][3] == id) { return true; } }
	return false;
}

function tcm__addPerk(charName, id)
{
	if (tcm__canAddPerk(charName, id))
	{
		for (let i=0; i<3; i++)
		{
			if (window.tcm__temp.charData[charName].perkChoices[i] == 0)
			{
				window.tcm__temp.charData[charName].perkChoices[i] = id;
				for (let j=0; j<tcm__attributePerks.length; j++)
					if (tcm__attributePerks[j][0] == id)
						for (let k=0; k<tcm__attributePerks[j][2]; k++)
							tcm__adjustAttribute(charName, tcm__attributePerks[j][1], -1);
				tcm__loadPerkDescription(window.tcm__temp.loadedPerk, true);
				break;
			}
		}
	}
}

function tcm__removePerk(charName, id)
{
	for (let i=0; i<3; i++)
	{
		if (window.tcm__temp.charData[charName].perkChoices[i] == id)
		{
			window.tcm__temp.charData[charName].perkChoices[i] = 0;
			tcm__loadPerkDescription(window.tcm__temp.loadedPerk, true);
		}
	}
}

function tcm__validatePerkSelections(charName)
{
	let copiedPerks = window.tcm__temp.charData[charName].perkChoices.concat([]);
	window.tcm__temp.charData[charName].perkChoices = [0,0,0];
	for (let i=0; i<3; i++)
		tcm__addPerk(charName, copiedPerks[i]);
}

function tcm__updatePerkSelections(charName)
{
	let perkSlot;
	for (let i=0; i<3; i++)
	{
		perkSlot = document.body.querySelector(`#slot-${i+1} .slot-holder`);
		if (perkSlot != undefined)
		{
			perkSlot.removeChildren();
			tcm__addNodeIcon('div', perkSlot, window.tcm__temp.charData[charName].perkChoices[i]);
		}
	}
}

function tcm__updateStarSelections(charName)
{

}

function tcm__adjustAttribute(charName, attribute, value)
{
	let aIndex = g__victimAttributes.indexOf(attribute);
	if (g__familyNames.indexOf(charName) > -1)
		aIndex = g__familyAttributes.indexOf(attribute);
	if (aIndex > -1)
	{
		let attributeValues = tcm__getAttributeValues(charName, attribute);
		if (value > 0)
		{
			//not using unavailable points
			if (window.tcm__temp.charData[charName].attributePoints[0] >= value)
			{
				//not going above 50
				if (attributeValues.reduce((a,b) => a+b) + value <= 50)
				{
					window.tcm__temp.charData[charName].attributePoints[0] -= value;
					window.tcm__temp.charData[charName].attributePoints[aIndex+1] += value;
				}
			}
		}
		else if (value < 0)
		{
			//not going below 0
			if (window.tcm__temp.charData[charName].attributePoints[aIndex+1] + value >= 0)
			{
				window.tcm__temp.charData[charName].attributePoints[0] -= value;
				window.tcm__temp.charData[charName].attributePoints[aIndex+1] += value;
			}
		}
	}
}

function tcm__reduceUnspentAttributes(charName)
{
	if (window.tcm__temp.charData[charName].attributePoints[0] > 0)
	{
		window.tcm__temp.charData[charName].attributePoints[0]--;
	}
	else
	{
		for (let i=1; i<window.tcm__temp.charData[charName].attributePoints.length; i++)
		{
			if (window.tcm__temp.charData[charName].attributePoints[i] > 0)
			{
				window.tcm__temp.charData[charName].attributePoints[i]--;
				break;
			}
		}
	}
}

function tcm__getAttributeValues(charName, attribute)
{
	let values = [0,0,0];
	let attributeNames = g__victimAttributes;
	if (g__familyNames.includes(charName))
		attributeNames = g__familyAttributes;
	for (let i=0; i<attributeNames.length; i++)
	{
		if (attributeNames[i] == attribute)
		{
			values[0] = tcm__attributes[charName][i] || 0;
			values[1] = window.tcm__temp.charData[charName].attributePoints[i+1];
		}
	}
	for (let i=0; i<tcm__attributePerks.length; i++)
		if (tcm__attributePerks[i][1] == attribute && window.tcm__temp.charData[charName].perkChoices.includes(tcm__attributePerks[i][0]))
			values[2] = tcm__attributePerks[i][2];
	return values;
}

function tcm__updateAttributePoints(charName)
{
	let remPnt = document.getElementById("remaining-points");
	let attributesElem = document.getElementById("character-attributes");
	if (null != attributesElem)
	{
		let maxPnt = window.tcm__temp.charData[charName].attributePoints.reduce((a,b)=>a+b);
		let attributeNames = g__victimAttributes;
		attributesElem.classList.remove("family");
		attributesElem.classList.add("victim");
		if (g__familyNames.indexOf(charName)>-1)
		{
			attributeNames = g__familyAttributes;
			attributesElem.classList.add("family");
			attributesElem.classList.remove("victim");
		}
		for (let c=0; c<attributeNames.length; c++)
		{
			let i = tcm__getAttributeValues(charName, attributeNames[c]);
			let o = Math.ceil((i[0]+i[2])/(50/window.tcm__temp.settings.attSegs))-1;
			let d = Math.ceil((i[0]+i[1]+i[2])/(50/window.tcm__temp.settings.attSegs))-1;
			attributesElem.querySelector(`.${attributeNames[c]} .base`).style.width=(i[0]+i[2])/50*(100-window.tcm__temp.settings.segSep*(window.tcm__temp.settings.attSegs-1))+o*window.tcm__temp.settings.segSep+"%"
			attributesElem.querySelector(`.${attributeNames[c]} .spent`).style.width=i[1]/50*(100-window.tcm__temp.settings.segSep*(window.tcm__temp.settings.attSegs-1))+d*window.tcm__temp.settings.segSep-o*window.tcm__temp.settings.segSep+"%";
			
			let valueElem = attributesElem.querySelector(`.${attributeNames[c]} .value`);
			valueElem.innerText = i.reduce((a,b)=>a+b);
			

			
			if (i[1] > 0)
				valueElem.classList.add("modified");
			else
				valueElem.classList.remove("modified");
		}

		remPnt.innerText = `${window.tcm__temp.charData[charName].attributePoints[0]} / ${maxPnt}`;
	}
}

function tcm__attributeAdjustHandler(e)
{
	if (e.target.className == 'adjust add')
		tcm__adjustAttribute(window.tcm__temp.selectedChar, e.target.parentNode.classList[1], 1);
	else if (e.target.className == 'adjust subtract')
		tcm__adjustAttribute(window.tcm__temp.selectedChar, e.target.parentNode.classList[1], -1);
	tcm__updateAttributePoints(window.tcm__temp.selectedChar);
	tcm__updateShareString(window.tcm__temp.selectedChar)
}

// Main logic for selecting nodes using an A* search algorithm
function tcm__selectNode(x, y)
{
	// get character and perk tree
	let charName = window.tcm__temp.selectedChar;
	let perkTree = tcm__treeData[charName];

	let mI = Number(x) + (window.tcm__temp.selectedMatrix[charName][0] * Number(y)) + 1; // matrix index
	let isSelected = window.tcm__temp.selectedMatrix[charName].length>=mI?window.tcm__temp.selectedMatrix[charName][mI]>0:false;

	let alreadySelected = false;
	for (let i=0; i<window.tcm__temp.selectedNodes[charName].length; i++)
	{
		if (window.tcm__temp.selectedNodes[charName][i][0] == x && window.tcm__temp.selectedNodes[charName][i][1] == y)
		{
			alreadySelected = true;
			break;
		}
	}

	if (!alreadySelected)
	{
		// get node object
		let nodeObjectIndex = tcm__nodeArrayNodeIndex(x, y, perkTree);
		if (nodeObjectIndex > -1)
		{
			let nodeObject = perkTree[nodeObjectIndex];

			// connected paths
			let dirFrom = 2;
			let selectableNodes = tcm__selectableNodes[charName];
			if (selectableNodes != undefined)
			{
				let pathRules = undefined;
				for (let i=0; i<selectableNodes.length; i++)
				{
					if (nodeObject[0] == selectableNodes[i][0] && nodeObject[1] == selectableNodes[i][1])
					{
						// add to history
						window.tcm__temp.charData[charName].routeHistory.push(i);

						pathRules = selectableNodes[i];
						break;
					}
				}
				
				if (pathRules != undefined)
				{
					window.tcm__temp.charData[charName].choiceHistory.push(window.tcm__temp.nextChoices[charName].concat([]));
					window.tcm__temp.nextChoices[charName] = [];
					let checkedNodes = [];
					let nodesLeft = [[nodeObject[0], nodeObject[1], pathRules[3]]];
					let nextNode = undefined;
					let currNodeElem = undefined;
					let distanceTravelled = 0;
					while (nodesLeft.length > 0)
					{
						nextNode = nodesLeft.shift();
						currNodeElem = window.tcm__temp.elemIndexes[charName].filter(x => x[0]==nextNode[0]&&x[1]==nextNode[1])[0][2];
						nodeObjectIndex = tcm__nodeArrayNodeIndex(nextNode[0], nextNode[1], perkTree);

						// real index
						if (nodeObjectIndex > -1 && perkTree.length > nodeObjectIndex)
						{
							//
							nodeObject = perkTree[nodeObjectIndex];

							// this node hasn't already been checked
							if (!checkedNodes.includes(nodeObject))
							{
								// if selectable
								for (let i=0; i<selectableNodes.length; i++)
								{
									if (pathRules[0] == selectableNodes[i][0] && pathRules[1] == selectableNodes[i][1])
										continue;

									if (selectableNodes[i][0] == nodeObject[0] && selectableNodes[i][1] == nodeObject[1])
									{
										// needs to come from an expected direction
										if ((typeof selectableNodes[i][3] === "object" && selectableNodes[i][3].includes(nextNode[2])) || selectableNodes[i][3] == nextNode[2])
										{
											window.tcm__temp.nextChoices[charName].push([nodeObject[0], nodeObject[1]]);
											break;
										}
									}
								}

								// this node is on the path
								if (pathRules[2].includes(nodeObject[4]))
								{
									distanceTravelled++;
									currNodeElem.style.transitionDelay = `${distanceTravelled/40}s`;

									// node will be selected afterwards
									window.tcm__temp.selectedNodes[charName].push(nodeObject);

									mI = Number(nodeObject[0]) + (window.tcm__temp.selectedMatrix[charName][0] * Number(nodeObject[1])) + 1;
									if (window.tcm__temp.selectedMatrix[charName].length >= mI)
										window.tcm__temp.selectedMatrix[charName][mI] = window.tcm__temp.charData[charName].choiceHistory.length;

									if (nodeObject[3] == 1)
										window.tcm__temp.charData[charName].attributePoints[0]++;

									// branch out
									for (let i=0; i<4; i++)
									{
										// don't branch where you came from, and only where the are branches
										if (((typeof nextNode[2] === "object" && !nextNode[2].includes(i)) || i != nextNode[2]) && nodeObject[2][i] == '1')
										{
											if (i == 0)
												nodesLeft.push([nodeObject[0], nodeObject[1]+1, 2]);
											else if (i == 1)
												nodesLeft.push([nodeObject[0]+1, nodeObject[1], 3]);
											else if (i == 2)
												nodesLeft.push([nodeObject[0], nodeObject[1]-1, 0]);
											else
												nodesLeft.push([nodeObject[0]-1, nodeObject[1], 1]);
										}
									}
								}

								// this node has been checked
								checkedNodes.push(nodeObject);
							}
						}
					}

					//
					tcm__updateAttributePoints(charName);
					tcm__highlightNodes(charName);
					tcm__updateUnlockedPerks(charName);
					createTreeBranches(charName);
					tcm__loadPerkDescription(window.tcm__temp.loadedPerk, true);
				}
			}
		}
	}
}

function tcm__loadAttributeBarMasks()
{
	let attributesElem=document.getElementById("character-attributes");
	if(null!=attributesElem)
	{
		let e = g__victimAttributes.concat(g__familyAttributes).filter(((t,e,n)=>n.indexOf(t)===e));
		for (let n=0; n<e.length; n++)
		{
			let maskElem = attributesElem.querySelector(`.${e[n]} .mask`);
			if(null != maskElem)
			{
				maskElem.removeChildren();
				for (let t=0; t<window.tcm__temp.settings.attSegs-1; t++)
				{
					let segmentElem = document.createElement("div");
					segmentElem.classList.add("mask-segment");
					segmentElem.style.left = (t+1)*(100/window.tcm__temp.settings.attSegs-window.tcm__temp.settings.segSep)+t*window.tcm__temp.settings.segSep+window.tcm__temp.settings.segSep/2+"%";
					segmentElem.style.width = `${window.tcm__temp.settings.segSep}%`;
					maskElem.appendChild(segmentElem);
				}
			}
		}
	}
}

// TODO Reduce re-used code
function repositionFloatingWindow()
{
	let nodeMap = document.getElementById('node-map');
	let footer = document.querySelector('footer');
	let perkSlots = document.getElementById('perk-slots');
	let perkList = document.getElementById('perk-list');
	let dataId = '';
	let targetX = 0;
	let targetY = 0;

	if (g__elem__floatingTarget != null && g__elem__floatingTarget != document)
	{
		dataId = g__elem__floatingTarget.getAttribute('data-id');
		if (dataId != null)
		{
			tcm__loadPerkDescription(dataId);
			if (!g__touchNodeSelected)
			{
				g__elem__floatingWindow.classList.add('show');
			}
			if (g__elem__floatingTarget.parentNode.className == 'slot-holder')
			{
				targetX = g__elem__floatingTarget.parentNode.parentNode.offsetLeft + perkSlots.offsetLeft;
				targetY = g__elem__floatingTarget.parentNode.parentNode.offsetTop + perkSlots.offsetTop;

				if (targetX + g__elem__floatingWindow.clientWidth > g__windowSize.w)
					targetX = targetX - (g__elem__floatingWindow.clientWidth + 5);
				if (targetY + g__elem__floatingWindow.clientHeight + footer.clientHeight + 20 > g__windowSize.h)
					targetY = targetY - (g__elem__floatingWindow.clientHeight + 5);	
			}
			else if (g__elem__floatingTarget.parentNode.id == 'perk-list')
			{
				targetX = g__elem__floatingTarget.clientWidth + g__elem__floatingTarget.offsetLeft + perkList.parentNode.parentNode.offsetLeft - 200 + 5;
				targetY = g__elem__floatingTarget.offsetTop + perkList.parentNode.parentNode.offsetTop - perkList.parentNode.scrollTop;

				if (targetX + g__elem__floatingWindow.clientWidth > g__windowSize.w)
					targetX = targetX - (g__elem__floatingWindow.clientWidth) - g__elem__floatingTarget.clientWidth - 10;
				if (targetY + g__elem__floatingWindow.clientHeight + footer.clientHeight + 20 > g__windowSize.h)
					targetY = targetY - (g__elem__floatingWindow.clientHeight) + g__elem__floatingTarget.clientHeight + 5;	
			}
			else
			{
				targetX = Math.floor(nodeMap.offsetLeft + ((nodeMap.clientWidth - (nodeMap.clientWidth*window.tcm__temp.zoomScalar))/2) + ((g__elem__floatingTarget.parentNode.offsetLeft + g__elem__floatingTarget.parentNode.clientWidth)*window.tcm__temp.zoomScalar));
				targetY = Math.floor(nodeMap.offsetTop + ((nodeMap.clientHeight - (nodeMap.clientHeight*window.tcm__temp.zoomScalar))/2) + ((g__elem__floatingTarget.parentNode.offsetTop)*window.tcm__temp.zoomScalar));

				if (targetX + g__elem__floatingWindow.clientWidth > g__windowSize.w)
					targetX = targetX - (g__elem__floatingWindow.clientWidth + 5) - (g__elem__floatingTarget.parentNode.clientWidth*window.tcm__temp.zoomScalar);
				if (targetY + g__elem__floatingWindow.clientHeight + footer.clientHeight + 20 > g__windowSize.h)
					targetY = targetY - (g__elem__floatingWindow.clientHeight + 5) + (g__elem__floatingTarget.parentNode.clientHeight*window.tcm__temp.zoomScalar);	
			}
			g__elem__floatingWindow.style.top = targetY;
			g__elem__floatingWindow.style.left = targetX;
		}
	}
}

// Fixes issues with phone browsers 'oversizing' the page, to avoid scrollbars
// Tested to work in chrome/firefox
// Tested to NOT work in duckduckgo
function updateViewportStyles()
{
	g__windowSize.h = window.innerHeight;
	g__windowSize.w = window.innerWidth;
	g__elem__floatingWindow.classList.remove('show');
	document.documentElement.style.setProperty('--vh', `${window.innerHeight}`);
	document.documentElement.style.setProperty('--vh-minus-footer', `${window.innerHeight-200}`);
}

function detectMac()
{
	return /(Mac)/i.test(navigator.platform);
}

function tcm__startApp()
{
	g__nodeMap = document.getElementById('node-map');
	g__nodePos = document.getElementById('node-pos');
	g__shareInput = document.getElementById('share-input');
	g__elem__floatingWindow = document.getElementById('floating-window');
	g__elem__floatingWindowTitle = document.getElementById('floating-window-title');
	g__elem__floatingWindowSubtitle = document.getElementById('floating-window-subtitle');
	g__elem__floatingWindowBody = document.getElementById('floating-window-body');
	
	updateViewportStyles();
	
	let floatingWindowClose = document.getElementById('floating-window-close');
	if (floatingWindowClose != undefined){floatingWindowClose.addEventListener('click',function(e){g__elem__floatingWindow.classList.remove('show');})}
	let editLoadout = document.getElementById('edit-loadout');
	if (editLoadout != undefined){editLoadout.addEventListener('click',function(e){document.body.classList.toggle('edit');})}

	if (window.tcm__temp == undefined)
	{
		window.tcm__temp =
		{
			settings: { attSegs:5, segSep:2 },
			loadedPerk: '',
			selectedChar: 'connie',
			charData: {},
			selectedNodes: {},
			selectedMatrix: {},
			nextChoices: {},
			elemIndexes: {},
			zoomScalar: 0.6,
			mmDragElem: undefined,
			keyReleased: true
		};
		g__victimNames.forEach(function(name){window.tcm__temp.charData[name] = {attributePoints:[0,0,0,0,0,0],perkChoices:[15,17,18],routeHistory:[],choiceHistory:[],starChoices:[0,0,0,0,0,0,0,0,0]}});
		g__familyNames.forEach(function(name){window.tcm__temp.charData[name] = {attributePoints:[0,0,0,0],perkChoices:[210,225,228],routeHistory:[],choiceHistory:[],starChoices:[0,0,0,0,0,0,0,0,0]}});
		window.addEventListener('pointerdown',function(e){
			if (e.pointerType === 'touch')
				g__touchStyle = true;
			else
				g__touchStyle = false;
		});
		let touchEquip = document.body.querySelector('button.option-touch-equip');
		if (touchEquip != undefined)
		{
			touchEquip.addEventListener(
				'touchend',
				function(e)
				{
					tcm__addPerk(window.tcm__temp.selectedChar, Number(window.tcm__temp.loadedPerk));
					tcm__updatePerkSelections(window.tcm__temp.selectedChar);
					tcm__updateAttributePoints(window.tcm__temp.selectedChar);
					tcm__updateShareString(window.tcm__temp.selectedChar);
					g__elem__floatingWindow.classList.remove('show');
				}
			)
		};
		let touchUnequip = document.body.querySelector('button.option-touch-unequip');
		if (touchUnequip != undefined)
		{
			touchUnequip.addEventListener(
				'touchend',
				function(e)
				{
					tcm__removePerk(window.tcm__temp.selectedChar, Number(window.tcm__temp.loadedPerk));
					tcm__updatePerkSelections(window.tcm__temp.selectedChar);
					tcm__updateAttributePoints(window.tcm__temp.selectedChar);
					tcm__updateShareString(window.tcm__temp.selectedChar);
					g__elem__floatingWindow.classList.remove('show');
				}
			)
		};
		let touchGoTo = document.body.querySelector('button.option-touch-go-to');
		if (touchGoTo != undefined)
		{
			touchGoTo.addEventListener(
				'touchend',
				function(e)
				{
					let perkElem = g__nodeMap.querySelector(`div[data-id="${window.tcm__temp.loadedPerk}"]`);
					if (perkElem != undefined)
					{
						tcm__centerMapOnPos(perkElem.parentNode.getAttribute('data-x'), perkElem.parentNode.getAttribute('data-y'), 0, 0);
						document.body.classList.remove('edit');
					}
				}
			)
		};
		window.addEventListener('resize', function(){updateViewportStyles();tcm__setMapOffset(g__nodeMap.offsetLeft, g__nodeMap.offsetTop);});
		window.addEventListener('keydown', tcm__shortcutHandler);
		window.addEventListener('keyup',function(e){if(!e.shiftKey && !e.altKey){window.tcm__temp.keyReleased=true;}});
		document.body.querySelectorAll('div.btn-combo').forEach(function(elem){elem.addEventListener('click',tcm__buttonHandler)});
		// Making image elements draggable
		window.addEventListener('mousedown',tcm__dragHandler);
		window.addEventListener('mousemove',tcm__dragHandler);
		window.addEventListener('mouseup',
			function(e)
			{
				if (g__nodeMap && g__nodeMap.classList && !g__nodeMap.parentNode.classList.contains('moving'))
				{
					let nodeElem = tcm__findParentByClass(e.target, 'node');
					if (nodeElem != undefined && nodeElem.classList && nodeElem.classList.contains('selectable'))
					{
						tcm__selectNode(nodeElem.getAttribute('data-x'), nodeElem.getAttribute('data-y'));
						tcm__updateShareString(window.tcm__temp.selectedChar);
					}
				}
				tcm__dragHandler(e);
			}
		);
		window.addEventListener('touchstart',function(e){g__touchNodeSelected=false;});
		window.addEventListener('touchstart',tcm__dragHandler);
		window.addEventListener('touchmove',tcm__dragHandler, {passive:false});
		window.addEventListener('touchend',
			function(e)
			{
				if (g__nodeMap && g__nodeMap.classList && !g__nodeMap.parentNode.classList.contains('moving'))
				{
					let nodeElem = tcm__findParentByClass(e.target, 'node');
					if (nodeElem != undefined && nodeElem.classList && nodeElem.classList.contains('selectable'))
					{
						tcm__selectNode(nodeElem.getAttribute('data-x'), nodeElem.getAttribute('data-y'));
						tcm__updateShareString(window.tcm__temp.selectedChar);
						g__touchNodeSelected = true;
					}
				}
				tcm__dragHandler(e);
			}
		);

		document.querySelectorAll('button.adjust').forEach(function(elem){elem.addEventListener('click', tcm__attributeAdjustHandler)});

		let characterSelect = document.getElementById('character-select');
		characterSelect.addEventListener('input',function(e){tcm__loadPerkTree(e.target.value);});

		let perkFilter = document.getElementById('perk-filter');
		perkFilter.addEventListener('input',
			function(e)
			{
				let perkList = document.getElementById('perk-list');
				if (perkList != undefined)
				{
					perkList.className = e.target.value;
				}
			}
		);

		window.addEventListener('mousemove',
			function(e)
			{
				let nodeObj = tcm__findParentByClass(e.target, 'node');
				let floatingWindow = tcm__findParentById(e.target, 'floating-window');
				if (!g__touchStyle || (floatingWindow == undefined && (nodeObj == undefined || (g__touchStyle && nodeObj.getAttribute('data-id') == undefined))))
					g__elem__floatingWindow.classList.remove('show');
				g__elem__floatingTarget = e.target;
				if (nodeObj != undefined)
				{
					g__elem__floatingTarget = nodeObj.firstChild;
					if (g__devEnabled)
					{
						let x = nodeObj.getAttribute('data-x');
						let y = nodeObj.getAttribute('data-y');
						let nodeObject = tcm__treeData[window.tcm__temp.selectedChar][tcm__nodeArrayNodeIndex(x, y, tcm__treeData[window.tcm__temp.selectedChar])];
						g__nodePos.innerText = `${x}, ${y} [${nodeObject?(nodeObject[4]!=undefined?nodeObject[4]:'?'):'*'}]`;
					}
				}
				repositionFloatingWindow();
			}
		);

		window.addEventListener('wheel', function(e){
			repositionFloatingWindow();
			if (tcm__findParentById(e.target, 'node-window'))
				tcm__zoomHandler(e);
			else if (!g__touchStyle && tcm__findParentById(e.target, 'loadout-window'))
				g__elem__floatingWindow.classList.remove('show');
			
		}, { passive: false });

		let searchParams = new URLSearchParams(window.location.search);
		let charParam = searchParams.get('char');
		if (charParam != undefined)
		{
			characterSelect.value = charParam;
			if (characterSelect.value.length == 0)
				characterSelect.value = 'connie';
		}
		else
		{
			characterSelect.value = 'connie';
		}
		tcm__loadPerkTree(characterSelect.value);

		let buildParam = searchParams.get('build');
		if (buildParam != undefined)
		{
			//unpack data to binary string
			if (buildParam.length > 0)
			{
				tcm__decodeBuildString(characterSelect.value, buildParam);
			}
		}

		tcm__updatePerkSelections(characterSelect.value);
		tcm__updateStarSelections(characterSelect.value);
		tcm__updateAttributePoints(characterSelect.value);
		tcm__loadAttributeBarMasks();
		tcm__updateShareString(characterSelect.value);
		
		if (detectMac())
		{
			g__deviceType = 'mac';
			document.body.querySelectorAll('.key-combo').forEach((elem) => {elem.innerText = elem.innerText.replace(/(Ctrl)|(Alt)/,'Opt')})
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
	tcm__startApp();
});


/*
The Texas Chainsaw Massacre and all related characters, places, names and other indicia are trademarks of Vortex, Inc./Kim Henkel/Tobe Hooper. © 1974. All rights reserved.

tcmperks.com?char=johnny&build=D0404l9m3j7j0-
tcmperks.com?char=cook&build=_0ff0k6l9m30o2
tcmperks.com?char=leatherface&build=K2080j2k7j4-6e
*/



/*
NEEDS FIXING

- floating window does not bound to top below 0

YES

- color blind modes https://www.toptal.com/designers/colorfilter
- add languages
- add settings to change themes/fonts

MAYBE

- de-activate the "undo" button if it doesn't do anything (it only undoes path selections, which might be confusing)
- show all possible paths to a node
- show a summary of path directions/choices (left,up,right)

DONE

26/05
- adjusted scroll wheel functionality with perk description window
- perks added while moving map around by holding down on unlocked perk node, or mousing up on unlocked perked node in loadout

25/05
- changed general perk indicators
- added perk filter animation
- fixed showing correct cursor when grabbing/releasing the perk tree
- fixed share string not coming back after deletion when re-opened
- fixed shortcuts working inside input elements
- added encoding/decoding for star sign selections
- updated perks changed in may 22nd patch
- added open dyslexic 3 to be used as a font option when settings are introduced

6/05
- changed positioning of perk type in perk description
- added shadows to skill nodes
- changed color/spacing of button elements
- changed position of shortcut keys
- changed color of nodes before/after a selection for visibility
- changed color of tree branches for visibility
- changed web file structure

- fixed tcm__decodePerkSelections bug that incorrectly parsed negative numbers

- changed up,down,left,right keys to move immediately instead of smoothly to prevent jumpy movements
- fix text overflow on descriptions
- stop right click from starting drag

- fix zoom so that it centers on your mouse/last tap location
- fix share element so it works on small screens
- add missing ability icons

- use canvas to display branches
- fix mac "ctrl key" shortcuts
- change 1,2,3 shortcuts so paths are selected more logically (choices going from left to right, 1 selects the first choice on the left, 3 is the last choice on the right)

- touch pad zooms in too fast
- redesign how perk descriptions are shown (possible hovering, like links between wikipedia pages or twitter profiles)
- simplify perk selection and removal
- revert perk descriptions back to as in-game



BINNED

- char portrait changes opacity on mouse-over for visibility
- scale branches with nodes when unselected/highlighted
- perk description window needs to consider low resolutions that aren't phones and have a continuous 'mousemove' meaning the window doesn't open/close on 'clicking' but rather stays closed unless moused over the perk





*/