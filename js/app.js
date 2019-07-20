/*
 * Copyright (c) 2019
 * word clock
 * made by Roy Sharoni
 */

'use strict'

const body = document.querySelector('body');
const clockEl = document.querySelector('.clock');
const allWords = document.querySelectorAll('.clock span');
const boxes = document.querySelectorAll('.boxes .min-box');
const alarmClock = document.querySelector('#clock input[type="time"]');
const switchOnAlarm = document.querySelector('.alarm input[name="switch-on"]');
const alarmPreview = document.querySelector('.alarm-preview');
let audio = new Audio();

let clockDefault = {
    userTextMainColor: { color: 'ffffff', alpha: 0.6 },
    userTextHighlightColor: { color: 'aff9ff', alpha: 1 },
    userClockBgColor: { color: 'ffffff', alpha: 0 },
    userClockBorder: { color: 'ffffff', alpha: 0.5, width: 1 },
    userPageBg: { color: 'ffffff', imageUrl: 'https://source.unsplash.com/2KXEb_8G5vo/1600x900', random: false, showUserImage: true },
    speakerInterval: { interval: 0 },
    alarm: { on: false, previewMode: false, time: '00:00', sounds: ['cant_stop_the_feeling', 'escape', 'the_shire', 'i_want_you_back', 'mr_blue_sky', 'relaxing'], alarmSound: 'the_shire' },
    showTextGlow: true,
    showClockShadow: true,
};

//get the clock object from local storage or make copy of the default clock object
let clock = JSON.parse(localStorage.getItem('clock')) || JSON.parse(JSON.stringify(clockDefault));

// this object stores the classes value according to the key - minute 
const minutesClass = {
    '0': ['.oclock'],
    '5': ['.m-5', '.minutes'],
    '10': ['.m-10', '.minutes'],
    '15': ['.m-15'],
    '20': ['.m-20', '.minutes'],
    '25': ['.m-20', '.m-5', '.minutes'],
    '30': ['.m-30']
}



// =========================================================================
// init page
// =========================================================================
function init() {
    const sideBar = document.querySelector('.sidebar');

    // menu button - open close sidebar
    const menuBtn = document.querySelector('.menu-btn');
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle("change");
        sideBar.classList.toggle("open");
    });

    // reset colors button
    let resetDesignBtn = document.querySelector('#reset-design');
    resetDesignBtn.addEventListener("click", function () {
        updateClock('userTextMainColor', { ...clockDefault.userTextMainColor });
        updateClock('userTextHighlightColor', { ...clockDefault.userTextHighlightColor });
        updateClock('userClockBgColor', { ...clockDefault.userClockBgColor });
        updateClock('userClockBorder', { ...clockDefault.userClockBorder });

        updateClock('showTextGlow', clockDefault.showTextGlow);
        updateClock('showClockShadow', clockDefault.showClockShadow);

        let textMainColor = clock.userTextMainColor.color;
        changeTextMainColor(textMainColor);
        mainCp.source.value = '#' + textMainColor;
        mainAlphaSlider.value = clock.userTextMainColor.alpha;

        let textHighlightColor = clock.userTextHighlightColor.color;
        changeTextHiglightColor(textHighlightColor);
        highlightCp.source.value = '#' + textHighlightColor;
        highlightAlphaSlider.value = clock.userTextHighlightColor.alpha;

        glowCb.checked = clock.showTextGlow;

        let clockBg = clock.userClockBgColor.color;
        changeClockBgColor();
        clockBgCp.source.value = '#' + clockBg;
        clockBgAlphaSlider.value = clock.userClockBgColor.alpha;

        clockShadowCb.checked = clock.showClockShadow;
        toggleClockBgShadow();

        let clockBorder = clock.userClockBorder.color;
        changeClockBorderColor();
        clockBorderCp.source.value = '#' + clockBorder;
        clockBorderWidthSlider.value = clock.userClockBorder.alpha;
        clockBorderAlphaSlider.value = clock.userClockBorder.alpha;
    });

    // reset image button
    let resetImgBtn = document.querySelector('#reset-image');
    resetImgBtn.addEventListener("click", function () {
        updateClock('userPageBg', { ...clockDefault.userPageBg });
        pageBgImageCp.source.value = '#' + clock.userPageBg.color;
        changePageBg();

        pageImageRandom.checked = clock.userPageBg.random;
        pageShowImg.checked = clock.userPageBg.showUserImage;
        pageImageInputUrl.value = clock.userPageBg.imageUrl;
        toggleImgEditUrl(clock.userPageBg.random);
    });


    // =========================================================================
    // text main color picker
    // =========================================================================
    let mainCpSource = document.querySelector('.main-color input[type="color"]'),
        mainCp = new CP(mainCpSource),
        mainAlphaSlider = document.querySelector('.main-color input[type="range"]');

    mainAlphaSlider.value = clock.userTextMainColor.alpha;
    mainAlphaSlider.oninput = function () {
        updateClock('userTextMainColor', { alpha: this.value });
        changeTextMainColor();
    }

    mainCp.set('#' + clock.userTextMainColor.color);
    // prevent showing native color picker panel
    mainCpSource.onclick = function (e) {
        e.preventDefault();
    };
    mainCp.on("change", function (color) {
        updateClock('userTextMainColor', { color: color });
        this.source.value = '#' + color;
        changeTextMainColor();
    });


    // =========================================================================
    // text higlight color picker
    // =========================================================================
    let highlightCpSource = document.querySelector('.highlight-color input[type="color"]'),
        highlightCp = new CP(highlightCpSource),
        highlightAlphaSlider = document.querySelector('.highlight-color input[type="range"]');

    highlightAlphaSlider.value = clock.userTextHighlightColor.alpha;
    highlightAlphaSlider.oninput = function () {
        updateClock('userTextHighlightColor', { alpha: this.value });
        changeTextHiglightColor();
    }

    highlightCp.set('#' + clock.userTextHighlightColor.color);
    // prevent showing native color picker panel
    highlightCpSource.onclick = function (e) {
        e.preventDefault();
    };
    highlightCp.on("change", function (color) {
        updateClock('userTextHighlightColor', { color: color });
        this.source.value = '#' + color;
        changeTextHiglightColor();
    });


    // =========================================================================
    // glow checkbox
    // =========================================================================
    const glowCb = document.querySelector('input[name="glow"]');
    glowCb.checked = clock.showTextGlow;
    glowCb.addEventListener('change', function () {
        console.log(glowCb.checked);
        updateClock('showTextGlow', glowCb.checked);
    });


    // =========================================================================
    // clock bg color picker
    // =========================================================================
    let clockBgCpSource = document.querySelector('.clock-bg-color input[type="color"]'),
        clockBgCp = new CP(clockBgCpSource),
        clockBgAlphaSlider = document.querySelector('.clock-bg-color input[type="range"]');

    clockBgAlphaSlider.value = clock.userClockBgColor.alpha;
    clockBgAlphaSlider.oninput = function () {
        updateClock('userClockBgColor', { alpha: this.value });
        changeClockBgColor();
    }

    clockBgCp.set('#' + clock.userClockBgColor.color);
    // prevent showing native color picker panel
    clockBgCpSource.onclick = function (e) {
        e.preventDefault();
    };
    clockBgCp.on("change", function (color) {
        updateClock('userClockBgColor', { color: color });
        this.source.value = '#' + color;
        changeClockBgColor();
    });


    // =========================================================================
    // clock shadow checlbox
    // =========================================================================
    const clockShadowCb = document.querySelector('input[name="clock-shadow"]');
    clockShadowCb.checked = clock.showClockShadow;
    clockShadowCb.addEventListener('change', function () {
        updateClock('showClockShadow', clockShadowCb.checked);
        toggleClockBgShadow();
    });


    // =========================================================================
    // clock border
    // =========================================================================
    let clockBorderCpSource = document.querySelector('.clock-border input[type="color"]'),
        clockBorderCp = new CP(clockBorderCpSource),
        clockBorderAlphaSlider = document.querySelector('.clock-border input[type="range"]'),
        clockBorderWidthSlider = document.querySelector('.clock-border input[type="number"]');

    clockBorderWidthSlider.value = clock.userClockBorder.width;
    clockBorderWidthSlider.oninput = function () {
        updateClock('userClockBorder', { width: this.value });
        changeClockBorderColor();
    }

    clockBorderAlphaSlider.value = clock.userClockBorder.alpha;
    clockBorderAlphaSlider.oninput = function () {
        updateClock('userClockBorder', { alpha: this.value });
        changeClockBorderColor();
    }

    clockBorderCp.set('#' + clock.userClockBorder.color);
    // prevent showing native color picker panel
    clockBorderCpSource.onclick = function (e) {
        e.preventDefault();
    };
    clockBorderCp.on("change", function (color) {
        updateClock('userClockBorder', { color: color });
        this.source.value = '#' + color;
        changeClockBorderColor();
    });


    // =========================================================================
    // page background image or color
    // =========================================================================
    let pageBgImageCpSource = document.querySelector('#page input[type="color"]'),
        pageBgImageCp = new CP(pageBgImageCpSource),
        pageImageInputUrl = document.querySelector('#page .edit-url'),
        pageImageEdit = document.querySelector('#page .new-img-edit'),
        pageShowImg = document.querySelector('#page .toggle-show-img');

    pageBgImageCp.set('#' + clock.userPageBg.color);

    // prevent showing native color picker panel
    pageBgImageCpSource.onclick = function (e) {
        e.preventDefault();
    };
    pageBgImageCp.on("change", function (color) {
        updateClock('userPageBg', { color: color });
        this.source.value = '#' + color;
        changePageBg();
    });

    // input url for user image 
    pageImageInputUrl.value = clock.userPageBg.imageUrl;
    pageImageInputUrl.oninput = function () {
        updateClock('userPageBg', { imageUrl: this.value });
        changePageBg();
    };

    // page radom image checkbox
    const pageImageRandom = document.querySelector("#page input[type='checkbox']");
    pageImageRandom.checked = clock.userPageBg.random;
    pageImageRandom.addEventListener('change', function () {
        updateClock('userPageBg', { random: pageImageRandom.checked });
        changePageBg();
        toggleImgEditUrl(pageImageRandom.checked);
    });

    // show user image checkbox
    pageShowImg.checked = clock.userPageBg.showUserImage;
    pageShowImg.addEventListener('change', function () {
        updateClock('userPageBg', { showUserImage: pageShowImg.checked });
        changePageBg();
    });

    // show or hide user image 
    function toggleImgEditUrl(bool) {
        (bool) ? pageImageEdit.classList.add('bg-disable') : pageImageEdit.classList.remove('bg-disable');
        pageImageInputUrl.disabled = bool;
        pageShowImg.disabled = bool;
    }


    // =========================================================================
    // alarm clock 
    // =========================================================================
    function updateAlarmClock(bool) {
        switchOnAlarm.checked = bool;
        updateClock('alarm', { on: bool });

        // alarm is on
        if (bool) {
            alarmClock.classList.add('text-info');
            updateClock('alarm', { time: alarmClock.value });

        }
        // off - stop alarm when not in preview sound mode
        if (!clock.alarm.previewMode && !bool) {
            stopAlarm();
            alarmClock.classList.remove('text-info');
        }

        enableAllPreviewAlarmBtns();
        animateAlarmPreview(false);
    }

    // switch on / off alarm
    switchOnAlarm.addEventListener('click', () => {
        updateAlarmClock(switchOnAlarm.checked);
    });

    // build the sound list in alarm clock
    function buildSoundsList() {
        let list = '';
        clock.alarm.sounds.forEach(sound => {
            var name = sound.replace(/_/g, " ");
            if (name.length > 20) name = `${name.substring(0, 20)}...`;

            list += `<li class="toggle" data-name="${sound}">
                        <span class="title"> ${name} </span>
                        <label class="switch">
                            <input type="radio" name="switch-sound">
                            <span class="slider round"></span>
                        </label>
                     </li>`;
        });
        document.querySelector('.sound-list').innerHTML = list;

        document.querySelectorAll('.sound-list > li.toggle').forEach(item => {
            item.addEventListener('click', function (e) {
                // prevents the click of the switch button
                if (e.currentTarget !== e.target) return;

                if (this.classList.contains('previewSound')) {
                    // stop current sound
                    this.classList.remove('previewSound');
                    stopAlarm();
                    updateClock('alarm', { previewMode: false });
                } else {
                    // stop all sounds and play current one
                    stopAllPreviewAlarmSounds();
                    this.classList.add('previewSound');
                    playAlarm(this.dataset.name);
                    updateClock('alarm', { previewMode: true });
                }
            });
        });

        document.querySelectorAll('.sound-list > li.toggle .switch').forEach(item => {
            let itemSoundName = item.parentNode.dataset.name;
            if (itemSoundName === clock.alarm.alarmSound) {
                console.log('itemSoundName', itemSoundName)
                item.querySelector('input').checked = true;
            }

            item.addEventListener('click', function (e) {
                updateClock('alarm', { alarmSound: itemSoundName });
            });
        });
    }

    // call when sound is ended
    audio.addEventListener("ended", function () {
        if (clock.alarm.previewMode) {
            stopAllPreviewAlarmSounds();
            updateClock('alarm', { previewMode: false });
            return;
        }
        updateAlarmClock(false);
    });


    // =========================================================================
    // speaker tab 
    // =========================================================================
    const speakBtn = document.querySelector('#speak');
    speakBtn.addEventListener('click', () => speak(getSpeakerMsg()));

    let speakerSlider = document.querySelector('.clock-sound input[type="range"]'),
        intervalText = document.querySelector('#interval-text'),
        intervalTextMin = document.querySelector('#interval-text + span');

    intervalText.textContent = clock.speakerInterval.interval;
    speakerSlider.value = clock.speakerInterval.interval;
    speakerSlider.oninput = function () {
        updateClock('speakerInterval', { interval: this.value });
        intervalText.textContent = this.value;
        let minutesText = 'minute';
        if (this.value > 9) minutesText = 'minutes';
        intervalTextMin.textContent = minutesText;
    }

    // click anyware on the body = stops alarm clock if working
    body.addEventListener('click', (e) => {
        //stop alarm clock
        if (e.currentTarget === e.target)
            updateAlarmClock(false);
    });


    alarmClock.value = clock.alarm.time || `${getCurrTimeFormated().h}:${getCurrTimeFormated().m}`;
    buildSoundsList();
    updateAlarmClock(clock.alarm.on);
    changePageBg();
    toggleClockBgShadow();
    openTab({ currentTarget: document.querySelector('.tab > button:nth-child(1)') }, 'text');
    toggleImgEditUrl(clock.userPageBg.random);

    // start the clock interval
    setInterval(setDate, 1000);
}


document.addEventListener("DOMContentLoaded", init);







function setDate() {
    //get time
    const now = new Date();
    const mins = now.getMinutes();
    const hour = now.getHours();
    const seconds = now.getSeconds();
    const hour12Clock = hour % 12; // 12 hour clock  
    //minutes of every 5 minutes 
    let minute5Int = mins - mins % 5;

    // variables for classes string
    let hourClass = '.h-';
    let minuteClass;
    let toOrPast = '.past';

    if (minute5Int > 30) {
        minuteClass = minutesClass[60 - minute5Int].join(',');
        toOrPast = '.to';
        hourClass += hour12Clock % 12 + 1;
    } else {
        minuteClass = minutesClass[minute5Int].join(',');
        (hour12Clock % 12 === 0) ? hourClass += 12 : hourClass += hour12Clock % 12;
    }

    //if full hour show nothing in the variable
    if (minute5Int === 0) toOrPast = '';

    //total class is every word class to highlight 
    let totalClass = `.it-is, ${minuteClass}, ${hourClass}`;
    if (toOrPast) {
        totalClass += `, ${toOrPast}`;
    }

    // boxNum - current minute output the delta
    let boxNum = mins % 5; //minuteLastDigit - minute5LastDigit;
    (boxNum > 0 && boxNum < 5) ? addBoxLight(boxNum) : removeBoxLight();

    addtextMainColor();
    // adds word light
    addWordLight(totalClass);

    // speaker sound read clock time
    if (mins % +clock.speakerInterval.interval === 0 && +clock.speakerInterval.interval !== 0 && seconds === 0) {
        speak(getSpeakerMsg());
    }

    // if alarm clock is on and is the right time
    if (alarmClock.value === `${getCurrTimeFormated().h}:${getCurrTimeFormated().m}` && clock.alarm.on) {
        if (audio && audio.currentTime > 0
            && !audio.paused
            && !audio.ended
            && audio.readyState > 2) return;
        stopAllPreviewAlarmSounds();
        playAlarm(clock.alarm.alarmSound);
        disableAllPreviewAlarmBtns();
        updateClock('alarm', { previewMode: false });
        animateAlarmPreview(true);
    };
}


// update the clock object
function updateClock(itemKey, value) {
    if (typeof value === "boolean") {
        clock[itemKey] = value;
    } else {
        clock[itemKey] = { ...clock[itemKey], ...value };
    }

    localStorage.setItem('clock', JSON.stringify(clock));
}









// =========================================================================
// speaker
// =========================================================================
const speakerMsg = new SpeechSynthesisUtterance();

function speak(msg) {
    speechSynthesis.cancel();
    speakerMsg.text = msg;
    speechSynthesis.speak(speakerMsg);
}

function getSpeakerMsg() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();

    let msg = '';
    let ampm = 'pm';
    if (h >= '00' && h < '12') ampm = 'am';
    msg = `it is ${h} ${m} ${ampm}`;
    return msg;
};




// =========================================================================
// color text
// =========================================================================
function changeTextMainColor() {
    allWords.forEach(word => {
        if (!word.hasAttribute("data-highlight")) {
            word.style.color = `rgba(${CP.HEX2RGB(clock.userTextMainColor.color).join()}, ${clock.userTextMainColor.alpha})`;

        }
    });
}
function changeTextHiglightColor() {
    allWords.forEach(word => {
        if (word.hasAttribute("data-highlight")) {
            word.style.color = `rgba(${CP.HEX2RGB(clock.userTextHighlightColor.color).join()}, ${clock.userTextHighlightColor.alpha})`;
        }
    });
}


// =========================================================================
// clock design - background shadow, bg color, border color
// =========================================================================
function toggleClockBgShadow() {
    if (clock.showClockShadow) {
        clockEl.style.boxShadow = `0 0 20px rgba(1, 1, 1, 0.5), 0 0 35px rgba(3, 3, 3, 0.3)`;
    } else {
        clockEl.style.boxShadow = 'none';
    }
}
function changeClockBgColor(color) {
    clockEl.style.backgroundColor = `rgba(${CP.HEX2RGB(clock.userClockBgColor.color).join()}, ${clock.userClockBgColor.alpha})`;
}
function changeClockBorderColor() {
    clockEl.style.border = `${clock.userClockBorder.width}px
                            solid
                            rgba(${CP.HEX2RGB(clock.userClockBorder.color).join()}, ${clock.userClockBorder.alpha})`;
}

// =========================================================================
// page design - background image
// =========================================================================
function changePageBg() {
    console.log('changePagebg')
    let url = clock.userPageBg.imageUrl;
    if (!clock.userPageBg.showUserImage) url = '';
    if (clock.userPageBg.random) url = 'https://source.unsplash.com/1600x900/?nature,sky,galaxy';

    // if no url show only bg color
    if (!url) {
        body.style.background = `#${clock.userPageBg.color} url('${url}')`;
        return;
    }
    // if url - load image and show 
    let img = new Image();
    img.onload = function () {
        body.style.background = `#${clock.userPageBg.color} url('${url}')`;
        body.style.backgroundPosition = "center";
        body.style.backgroundOrigin = "center";
        body.style.backgroundRepeat = "no-repeat";
        body.style.backgroundSize = "cover";
        img = null;
    };

    img.src = url;
}



// =========================================================================
// tabs in sidebar
// =========================================================================
function openTab(evt, tabName) {
    console.log(evt.currentTarget)
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}



// =========================================================================
// clock word text functions
// =========================================================================

function addtextMainColor() {
    allWords.forEach(word => {
        word.removeAttribute('data-highlight');
        word.style.color = `rgba(${CP.HEX2RGB(clock.userTextMainColor.color).join()}, ${clock.userTextMainColor.alpha})`;
        word.style.textShadow = 'none';
    });
}
// word highlight
function addWordLight(str) {
    const wordsClasses = document.querySelectorAll(str);
    wordsClasses.forEach(word => {
        word.setAttribute('data-highlight', 'true');
        word.style.color = `rgba(${CP.HEX2RGB(clock.userTextHighlightColor.color).join()}, ${clock.userTextHighlightColor.alpha})`;
        if (clock.showTextGlow) {
            word.style.textShadow = `0 0 15px rgba(${CP.HEX2RGB(clock.userTextHighlightColor.color).join()}, ${clock.userTextHighlightColor.alpha}),
                                 0 0 25px rgba(${CP.HEX2RGB(clock.userTextHighlightColor.color).join()},${clock.userTextHighlightColor.alpha})`;
        }

    });
}
// box highlight - the square minutes below
function addBoxLight(num) {
    for (let i = 0; i < num; i++) {
        if (!boxes[i].classList.contains("blue-light-hi")) boxes[i].classList.add("blue-light-hi");
    }
}
function removeBoxLight() {
    boxes.forEach(box => box.classList.remove("blue-light-hi"));
}


// =========================================================================
// sound functions
// =========================================================================
function stopAllPreviewAlarmSounds() {
    document.querySelectorAll('.sound-list > li.toggle.previewSound').forEach(item => {
        item.classList.remove('previewSound');
        stopAlarm();
    });
}
function disableAllPreviewAlarmBtns() {
    document.querySelectorAll('.sound-list > li.toggle').forEach(item => {
        removePointerEvents(item);
    });
}
function enableAllPreviewAlarmBtns() {
    document.querySelectorAll('.sound-list > li.toggle').forEach(item => {
        addPointerEvents(item);
    });
}
function animateAlarmPreview(mode) {
    (mode) ? alarmPreview.classList.add('fade-in-slide-top') : alarmPreview.classList.remove('fade-in-slide-top');
}

function playAlarm(name) {
    if (audio && audio.currentTime > 0
        && !audio.paused
        && !audio.ended
        && audio.readyState > 2) return;
    audio.src = `sound/${name}.mp3`;
    audio.play();
}
function stopAlarm() {
    if (audio.src === '') return;
    audio.pause();
    audio.src = '';
}
function pauseAlarm() {
    if (audio.src === '') return;
    audio.pause();
}


// =========================================================================
// utils functions
// =========================================================================

function getCurrTimeFormated() {
    var d = new Date();
    return { h: addZero(d.getHours()), m: addZero(d.getMinutes()), s: addZero(d.getSeconds()) }
}
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
function removePointerEvents(item) {
    item.style.pointerEvents = "none";
}
function addPointerEvents(item) {
    item.style.pointerEvents = "auto";
}
