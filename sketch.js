
function preload() {
	keyList = [LEFT_ARROW, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, ' ', 'W', 'A', 'S', 'D', 'F', 'G'];

	pitchPresets = [
		{name:'major (high)', pitches:[60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77]},
		{name:'major (low)', pitches:[48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65]},
		{name:'minor pentatonic', pitches:[48, 51, 53, 55, 58, 60, 63, 65, 67, 70, 72]},
		{name:'major pentatonic', pitches:[48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72]},
		{name:'whole tone', pitches:[48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68]},
		{name:'major triads', pitches:[48, 52, 55, 60, 64, 67, 72, 76, 79, 83, 84]},
	];
	
	samplePresets = [
		{name:'vibraphone', filename:'vibraphone'},
		{name:'whistle', filename:'whistle'},
		{name:'splurt', filename:'splurt'},
		{name:'ooh', filename:'ooh'},
		{name:'mouth rhythm', filename:'mouth-rhythm'}, 
		{name:'acoustic bass', filename:'acoustic-bass'} 
	];
	
	keySymbols = ['\u2190', '\u2191','\u2193','\u2192','sp'];
	noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
	keyColors = ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black',
		'white', 'black', 'white'];
	
	samplePresetAudio = [];
	for (var i=0; i<samplePresets.length; i++) {
		samplePresetAudio[i] = loadSound('sounds/' + samplePresets[i].filename + '.wav');
	}
	
	audioSamples = [];
	audioSamples[0] = loadSound('sounds/vibraphone.wav');
			
	numPeaks = 390;	
	
	mouseIsPressedOnPianoKeyNum = -1;
	
	outlineDiv = createElement('div');
	outlineDiv.addClass('outlineBox');
	
	titlesDiv = createElement('div');
	titlesDiv.addClass('titles');
	titlesDiv.parent(outlineDiv);
	
	titleDiv = createElement('div');
	titleDiv.addClass('title');
	titleDiv.parent(titlesDiv);
	titleDiv.html('MK-1');
	
	subtitleDiv = createElement('div');
	subtitleDiv.addClass('subtitle');
	subtitleDiv.parent(titlesDiv);
	subtitleDiv.html('sampling keyboard for makey makey');

	logoLink = createElement('a');
	logoLink.attribute('href', 'http://makeymakey.com');
	logoLink.attribute('target', '_blank');
	logoLink.parent(outlineDiv);
	logo = createImg('images/makey-makey-logo8.png');
	logo.parent(logoLink);
	logo.addClass('logo');

	controlsDiv = createElement('div');
	controlsDiv.addClass('controls');
	controlsDiv.parent(outlineDiv);
	    
    recControls = createElement('div');
    recControls.parent(controlsDiv);
    recControls.addClass('recControls');
    
    recBtn = createElement('div');
    recBtn.parent(recControls);
    recBtn.addClass('recButton');
    recBtn.mousePressed(startRecording);
    
    recBtnLabel = createElement('div');
    recBtnLabel.parent(recBtn);
    recBtnLabel.html('REC');
    recBtnLabel.addClass('recButtonLabel');
    
    recStatus = createElement('div');
    recStatus.parent(recControls);
    recStatus.addClass('recStatus');
    
    recordingNow = false;
    recStartTime = 0;
    
    waveFormDiv = createElement('div');
    waveFormDiv.addClass('waveForm');
    waveFormDiv.parent(controlsDiv);
    
	canvas = createCanvas(numPeaks, 150);
	canvas.parent(waveFormDiv);
	canvas.mousePressed(setStartTimeClick);
	
	createPresetButtons('key maps', pitchPresets, setKeyPreset);
	createPresetButtons('samples', samplePresets, loadSamplePreset);
    
	createPianoElements();

	createKeyObjects(pitchPresets[0].pitches);
	setPianoLabels();
	createPlayHeads();
}

function loadDefaultSamples() {
	for (var i=1; i<keyList.length; i++) {
		audioSamples[i] =  jQuery.extend(true, {}, audioSamples[0]);
	}
}

function createPresetButtons(headingTitle, presetList, pressFunction) {
    presetsBox = createElement('div');
    presetsBox.addClass('presetsBox');
    presetsBox.parent(controlsDiv);

	title = createElement('div');
	title.addClass('presetTitle');
	title.html(headingTitle);
	title.parent(presetsBox);

	btns = [];
	groupName = headingTitle;
	for (var i=0; i<presetList.length; i++) {
		btns[i] = createPresetButton(presetList[i].name, i, groupName, pressFunction);
	}
	
	btns[0].attribute('checked','');

}

function createPresetButton(name, index, group, pressFunction) {
	presetButtonContainer = createElement('div');
	presetButtonContainer.addClass('presetButton');
	presetButtonContainer.parent(presetsBox);
	
	presetButton = createElement('input');
	presetButton.attribute('type', 'radio');
	presetButton.attribute('name', group);
	presetButton.attribute('id', name);
	presetButton.parent(presetButtonContainer);
	
	presetButtonLabel = createElement('label');
	presetButtonLabel.attribute('for', name);
	presetButtonLabel.html(name);
	presetButtonLabel.mousePressed(pressFunction.bind(null, index));
	presetButtonLabel.parent(presetButtonContainer);
	
	return(presetButton);
}


function setKeyPreset(index) {
	createKeyObjects(pitchPresets[index].pitches);
	setPianoLabels();
}

function loadSamplePreset(index) {
	//audioSamples = [];
	audioSamples[0] = samplePresetAudio[index];
	analyzeNewSample();
}

function createKeyObjects(pitches){
	keyObjects = [];
	numKeyObjects = keyList.length;
	for (var i = 0; i<numKeyObjects; i++) {
		keyObjects[i] = new Object();
		keyObjects[i].keyName = keyList[i];
  		keyObjects[i].pitch = pitches[i];
  		keyObjects[i].rate = ratioForPitch(keyObjects[i].pitch);
  		keyObjects[i].noteName = noteNames[keyObjects[i].pitch % noteNames.length];
  		  		
  		keyObjects[i].isPressed = false;

  		if (i<5) {
	  		keyObjects[i].keySymbol = keySymbols[i];
	  	} else {
	  		keyObjects[i].keySymbol = keyList[i];
	  	}
	  	
	  	keyObjects[i].pianoKeyNum = keyObjects[i].pitch - 48;
	  	
		hue = (i / numKeyObjects) * 255; 
		colorMode(HSB, 255);
		c = color(hue, 100, 200);
		keyObjects[i].color = c;
  	}
}

function createPlayHeads() {
	playHeads = [];	
	for (var i=0; i<keyObjects.length; i++) {
		playHeads[i] = createElement('div');
		playHeads[i].addClass('playHead');
		c = keyObjects[i].color;
		playHeads[i].style('background',c.colorString);
		playHeads[i].parent(waveFormDiv);
	}
}

function createPianoElements() {

	pianoDiv = createElement('div');
	pianoDiv.parent(outlineDiv);

  	pianoElt = createElement('ul');
  	pianoElt.class('piano');
  	pianoElt.parent(pianoDiv);

  	pianoKeyElts = [];
  	for (var i=0; i<37; i++) {
  		pianoKeyElts[i] = createElement('li');
  		pianoKeyElts[i].parent(pianoElt);
  		c = keyColors[i%(keyColors.length)];
	  	pianoKeyElts[i].class(c);
	  	pianoKeyElts[i].attribute('color', c);
  		pianoKeyElts[i].attribute("num", i);
  		
  		pianoKeyElts[i].mousePressed(function(num){mouseIsPressedOnPianoKeyNum = num;}.bind(this,i));  		
  		pianoKeyElts[i].mouseReleased(function(){mouseIsPressedOnPianoKeyNum = -1;});  		
  	}  	
}

function setPianoLabels() {
	
	labels = getElements('keyLabel');
	for (var i=0; i<labels.length; i++) {
		labels[i].remove();
	}
	
	for (var i=0; i<keyObjects.length; i++) {
		label = createElement('div');
		label.html(keyObjects[i].keySymbol);
		keyNum = keyObjects[i].pianoKeyNum;
		label.parent(pianoKeyElts[keyNum]);
		label.addClass('keyLabel');
		if (pianoKeyElts[keyNum].attribute('color') == 'black') {
			label.addClass('blackKeyLabel');
		}
	}
}

function setup() {
	mic = new p5.AudioIn();
	recorder = new p5.SoundRecorder();
    recorder.setInput(mic);
    recordingDuration = 2;
	
  	setStartTimeAt(0);

  	waveBox = {x:0, y:0, w:numPeaks, h:150 };
	analyzeNewSample();
}

function startNote(num, pitch) {
	audioSamples[num].rate(ratioForPitch(pitch));
	audioSamples[num].loop(undefined, 1.0, startTimeSec, recordingDuration);
	playHeads[num].startTime = millis() / 1000;
}

function draw() {

	for (var i=0; i<playHeads.length; i++) {
		// this is a horrible hack because the p5 audio does not report the correct
		// times. this sort of works, but it drifts after a few loops
		if (audioSamples[i].isPlaying()) {
			timeSinceStart = (millis() / 1000) - playHeads[i].startTime;
			scaledDuration = (audioSamples[i].duration() - startTimeSec) / keyObjects[i].rate;
			position = (timeSinceStart % scaledDuration) * keyObjects[i].rate;
			normalizedPosition = position / audioSamples[i].duration();
			xPos = (normalizedPosition * numPeaks) + startTimePx;
			playHeads[i].style('left', xPos);
			playHeads[i].style('visibility', 'visible');
			level = audioSamples[i].getLevel(0.5);
			level = map(level,0,1,1,20);
			playHeads[i].style('width',level);
			

		} else {
			playHeads[i].style('left', 0);
			playHeads[i].style('visibility', 'hidden');
		}
	}

	if (recordingNow) {
		partDone =  (millis() - recStartTime) / (recordingDuration * 1000);
		barLength = partDone * numPeaks;
		level = mic.getLevel(.5);
		level = map(level, 0, 1, 0, 1000);
		level = constrain(level,0,90);
		colorMode(HSB, 100)
		fill(0,level+10,100);
		noStroke();
		rect(0,0,barLength,waveBox.h);
	}
	
	if (mic.enabled) {
		recStatus.style('visibility', 'hidden');
	} else {
		recStatus.style('visibility', 'visible');
	}
}

function drawWaveForm() {	
	fill(255);
	noStroke();
	rect(waveBox.x, waveBox.y, waveBox.w, waveBox.h);
    
    var middle = waveBox.y + waveBox.h/2;
    
    stroke(0);
    for (var i=0; i<numPeaks; i++) {
		val = peaks[i] * waveBox.h/2;
		line(waveBox.x + i, middle + val, waveBox.x +  i, middle - val);
	}
	
	//stroke(255,0,0);
	//line(waveBox.x + startTimePx, waveBox.y, waveBox.x + startTimePx, waveBox.y + waveBox.h);	
	colorMode(RGB,255);
	fill(100,100,100,50);
	noStroke();
	rect(waveBox.x, waveBox.y, startTimePx, waveBox.h);	
}

function setStartTimeClick() {
	if(hitTest(waveBox)) {
		setStartTimeAt(mouseX - waveBox.x);
		drawWaveForm();
	}
}

function setStartTimeAt(px) {
	startTimePx = px;
	startTimeSec = (startTimePx / numPeaks) * recordingDuration;
}

function startRecording() {
		if (!mic.enabled) {
			mic.start();
			recStatus.html('please allow mic access');
			return;
		}
		
		if (!recordingNow) {
  		 	recorder.record(audioSamples[0], recordingDuration, finishedRecording);
		    recordingNow = true;
		    recStartTime = millis();
		    recBtn.addClass('recording');
	  	}
}

function finishedRecording() {
	analyzeNewSample();
	recordingNow = false;
	recBtn.removeClass('recording');
	
}

function analyzeNewSample() {
	peaks = audioSamples[0].getPeaks(numPeaks);
	
	for (var i=1; i<keyObjects.length; i++) {
		audioSamples[i] =  jQuery.extend(true, {}, audioSamples[0]);
	}
	
	setStartTimeAt(0);

	mean = 0;
	sum = 0;
	for (var i=0; i<peaks.length; i++) {
		sum += peaks[i];
	}
	mean = sum / peaks.length;
		
	for (var i=0; i<peaks.length; i++) {
		if (peaks[i] > (mean)) {
			loc = (i / peaks.length) * waveBox.w;
			setStartTimeAt(loc);
			break;
		}
	}
		
	drawWaveForm();
}

function hitTest(rect) {
	if (mouseX > rect.x && mouseX < rect.x + rect.w) {
		if (mouseY > rect.y && mouseY < rect.y + rect.h) {
			return true;
		}
	}
	return false;
}

function ratioForPitch(num) {
	return (midiToFreq(num) / midiToFreq(60));
}

function keyPressed() {
	for (var i = 0; i < numKeyObjects; i++) {
		if (key == keyObjects[i].keyName || keyCode == keyObjects[i].keyName) {
			if (!keyObjects[i].isPressed) {
  				startNote(i, keyObjects[i].pitch);
  				keyObjects[i].isPressed = true;
 				pianoKeyNum = keyObjects[i].pianoKeyNum;
 				setPianoKeyState(pianoKeyNum, true, keyObjects[i].color.colorString);
  			}
		}
	}
	
	// remapping
	if (mouseIsPressedOnPianoKeyNum != -1) {
		for (var i = 0; i < numKeyObjects; i++) {
			if (key == keyObjects[i].keyName || keyCode == keyObjects[i].keyName) {
				setPianoKeyState(keyObjects[i].pianoKeyNum, false);
				keyObjects[i].pianoKeyNum = mouseIsPressedOnPianoKeyNum;
				setPianoLabels();
				keyObjects[i].pitch = mouseIsPressedOnPianoKeyNum + 48;
		  		keyObjects[i].rate = ratioForPitch(keyObjects[i].pitch);
  				keyObjects[i].noteName = noteNames[keyObjects[i].pitch % noteNames.length];

			}
		}
	}
	
}

function keyReleased() {
	for (var i = 0; i < keyObjects.length; i++) {
		if (key == keyObjects[i].keyName || keyCode == keyObjects[i].keyName) {
			audioSamples[i].stop();
			keyObjects[i].isPressed = false;
			setPianoKeyState(keyObjects[i].pianoKeyNum, false, '');
		}
	}
	
	// save your audio sample as a wav file!
	if (key == 'Z') {
		filename = "sample" + millis() + ".wav";
		saveSound(audioSamples[0], filename);
	}
}

function setPianoKeyState(num, state, color) {
	if (state) {
		pianoKeyElts[num].style('background', color);
	} else {
	  	c = pianoKeyElts[num].attribute('color');
		if (c == 'black') {
			pianoKeyElts[num].style('background', '#000000');
		} else {
			pianoKeyElts[num].style('background', '#ffffff');
		}
	}
}