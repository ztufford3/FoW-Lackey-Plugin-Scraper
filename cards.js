var page = require('webpage').create();
var webpages = ['http://db.fowtcg.us/index.php?p=spoiler'];
var index = 0;
var entries = [];

function handle_page(url) {
		page.open(url, function(status) {
		if(status === "success") {
			if(index==0) {
				//find each card and place them in an array
				var code = page.evaluate(function() {

					var cards = document.getElementsByClassName('card pointer');
					var tempcodes = [];

					var i;
					for(i = 0; i < cards.length; i++) {
						tempcodes.push(cards[i].children[0].children[0].getAttribute('data-code'));
					}

					return tempcodes;
				}, 'code');

				//remove duplicate codes because we don't want to duplicate j/rulers
				code = code.filter(function(item, pos) {
    				return code.indexOf(item) == pos;
				});

				var j;
				for(j = 0; j < code.length; j++) {
					webpages.push('http://db.fowtcg.us/index.php?p=card&code=' + code[j].split(' ').join('+'));
				}

				index++;
				next_page();
			} else {
				//extract field names and values from page
				var fieldsTemp = page.evaluate(function() {
					var f1 = document.getElementsByClassName('col-xs-3 col-sm-3 prop-label');
					var f2 = document.getElementsByClassName('col-xs-9 col-sm-9 prop-value');
					var fieldOut = [];
					var dataOut = [];
					var l;
					for(l = 0; l < f1.length; l++) {
						fieldOut[l] = f1[l].innerHTML;
						dataOut[l] = f2[l].innerHTML;
					}
					return [fieldOut,dataOut];
				}, 'fieldsTemp');

				var fields = [[],[]];

				//replace html tags with appropriate words or remove them and create a key/value pair for fields & values
				//we want to enable recursion later on to handle combining ruler and jruler data, so we have an array
				//containing 2 arrays so we can always pass one object to the formatting function, but we can pass
				//the ruler and jruler data already separated if the card is a ruler
				var k;
				var rulerFlag = 0;
				var splitJFlag = 0;
				//for the sake of readability
				var fieldInfo = fieldsTemp[0];
				var fieldData = fieldsTemp[1];
				var splitPoint = 0;
				for(k = 0; k < fieldInfo.length; k++) {
					rulerFlag = (fieldData[k].localeCompare("Ruler") == 0) || rulerFlag;
					fieldInfo[k] = replaceImages(fieldInfo[k]);
					fieldData[k] = replaceImages(fieldData[k]);
					//0 if not splitJFlag, otherwise accesses inner array 1
					fields[+(splitJFlag)][fieldInfo[k]] = fieldData[k];
					splitJFlag = (splitJFlag || (rulerFlag && fieldInfo[k].localeCompare("Flavor Text") == 0));
					splitPoint = (splitPoint == 0 && splitJFlag)?k:splitPoint;
				}
				
				var st = formatCard(fields);
				
				var stT = "";

				st.forEach(function(item, ind, arr) {stT += item;});

				var path = "/Users/zacharytufford/Downloads/LackeyCCG/plugins/ForceOfWill/sets/setimages/";

				var imgCoords = page.evaluate(function() {
					var imgs = Array.prototype.slice.apply(document.getElementsByTagName('img'));
					var t;
					var out = [];
					for(t = 0; t < imgs.length; t++) {
						if(imgs[t].src.search(/cards\/.*\/\d\d\dj?\.jpg/) != -1)
							out.push(imgs[t].getBoundingClientRect());
					}
					return out;
				});

				page.clipRect = {
					top: imgCoords[0].top,
					left: imgCoords[0].left,
					width: imgCoords[0].width,
					height: imgCoords[0].height
				}

				var setnum = st[2].substring(0,st[2].length-1);

				page.render(path + st[1].substring(0,st[1].length-1).replace(" ", "") + '/' + setnum.replace(/,.*/, "").replace(" ","") + '.jpg');				
				
				if(imgCoords[1]) {
					page.clipRect = {
						top: imgCoords[1].top,
						left: imgCoords[1].left,
						width: imgCoords[1].width,
						height: imgCoords[1].height
					}
					page.render(path + st[1].substring(0,st[1].length-1).replace(" ", "") + '/' + setnum.replace(/.*,/, "").replace(" ","") + '.jpg');				
				}

				entries.push(stT);
				index++;
				next_page();

			}
		}
	});
}

function formatCard(field) {
	//0 Name 1 Set 2 Set-Number/Card-Image 
	//3 Card-Type 4 Race/Subtype 5 Cost 
	//6 Total-Cost 7 ATK 8 DEF 
	//9 Attribute 10 Rarity 11 Text
	var cardEntry = [];
	
	cardEntry[0] = (field[0]["Name"])?field[0]["Name"] + "\t":"\t";
	cardEntry[1] = (field[0]["Code"])?(field[0]["Code"].split("-"))[0] + "\t":"\t";
	cardEntry[2] = (field[0]["Code"])?field[0]["Code"].substring(0,field[0]["Code"].length-2) + "\t":"\t";
	cardEntry[3] = (field[0]["Type"])?field[0]["Type"] + "\t":"\t";
	cardEntry[4] = (field[0]["Race"])?field[0]["Race"] + "\t":"\t";
	cardEntry[5] = (field[0]["Cost"])?field[0]["Cost"] + "\t":"\t";
	cardEntry[6] = (field[0]["Total Cost"])?field[0]["Total Cost"] + "\t":"\t";
	cardEntry[7] = (field[0]["ATK/DEF"] && (cardEntry[3].localeCompare("Resonator\t") == 0
										|| cardEntry[3].localeCompare("J-Ruler\t") == 0))?
										field[0]["ATK/DEF"].split(" / ")[0] + "\t":"\t";
	cardEntry[8] = (field[0]["ATK/DEF"] && (cardEntry[3].localeCompare("Resonator\t") == 0
										|| cardEntry[3].localeCompare("J-Ruler\t") == 0))?
										field[0]["ATK/DEF"].split(" / ")[1] + "\t":"\t";
	cardEntry[9] = (field[0]["Attribute"])?field[0]["Attribute"] + "\t":"\t";
	cardEntry[10] = (field[0]["Rarity"])?field[0]["Rarity"] + "\t":"\t";
	cardEntry[11] = (field[0]["Text"])?field[0]["Text"] + "\t":"\t";
	if(cardEntry[3].localeCompare("Ruler\t") == 0) {
		var jruler = formatCard([field[1]]);
		cardEntry[0] = cardEntry[0].substring(0,cardEntry[0].length-1) + " // " + jruler[0];
		cardEntry[2] = cardEntry[2].substring(0,cardEntry[2].length-1) + "-r," + 
					   jruler[2].substring(0,jruler[2].length-1) + "-j\t";
		cardEntry[7] = "0//" + jruler[7];
		cardEntry[8] = "0//" + jruler[8];
		cardEntry[11] = cardEntry[11].substring(0,cardEntry[11].length-1) + " // " + jruler[11];
	}
	
	return cardEntry;
}


function replaceImages(textIn) {
	
	var text = String(textIn);
	//replace free or colored cost in effect text
	text = text.replace(/<img class=\"mark\" src=\"_images\/icons\/(free)?(\d*|[bgruwx])\.png\">/g, '{$2}');
	//replace colored cost in cost info
	text = text.replace(/<img class=\"mark\" src=\"_images\/icons\/([bgruwx])\.png\" alt=\"\w+\">/g, '[$1]');
	//replace free cost in cost info
	text = text.replace(/<img class=\"costicons\" src=\"_images\/icons\/free(\d*|x)\.png\">/g, '[$1]');
	text = text.replace(/<br>/g, '\n');
	text = text.replace('<span class="mark_skills">Energize', 'Energize: ');
	text = text.replace('<span class="mark_skills">Judgment', 'Judgment: ');
	text = text.replace(/<img class=\"mark\" src=\"_images\/icons\/rest.png\">/g, 'Rest');
	text = text.replace(/&amp;rArr:/g, "=>");
	//remove the extra tags
	text = text.replace(/<(.*?)>/g,"");

	return text;
}

function next_page() {
	var url = webpages[index];
	if(!url) {
		entries.forEach(function(card, index, array) {
			console.log(card);
		});
		phantom.exit();
	}
	handle_page(url);
}

next_page();
