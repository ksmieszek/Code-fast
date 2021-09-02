//Variables
const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.querySelector(".overlay");
const appWrapper = document.querySelector(".app__wrapper");
const scoreValues = document.querySelector(".score__values");
const drawOutWordsPanel = document.querySelector(".app__output");
const textField = document.querySelector(".app__input");
const spanCollection = drawOutWordsPanel.getElementsByTagName("span"); //"getElementsByTagName"-to receive live collection
const timeLeftSlider = document.querySelector("#time__left--slider");
const languagesForm = document.querySelector("form.languages");
const timeForm = document.querySelector(".timer__block");
//dimensions
let TextIndentPosition = drawOutWordsPanel.offsetWidth * 0.4; //start position of text indent
let letterWidth;
let appPanelWidth;
let timerWidthUnion;
let timerWidthUnionAfterPointSum;
//counters
let correctLetters;
let mistypedButErasedLetters;
let totalMistypedLetters;
let totalTypedLetters;
//time variables
let startTime;
let timeLeft;
let measureTime; //setInterval function
//words containers
let drawOutWords;
let wordsToDrawFrom;
let CopyOfWordsToDrawFrom; //holds words that have not been draw out

//Functions
function prepareToDrawWords() {
  drawOutWords = "";
  const activeLanguages = returnActiveLanguages();
  wordsToDrawFrom = [];
  wordsToDrawFrom = wordsToDrawFrom.concat(programmingWords); //always add this words
  for (let i = 0; i < activeLanguages.length; i++) {
    if (activeLanguages[i].name == "html") wordsToDrawFrom = wordsToDrawFrom.concat(htmlWords);
    if (activeLanguages[i].name == "css") wordsToDrawFrom = wordsToDrawFrom.concat(cssWords);
    if (activeLanguages[i].name == "js") wordsToDrawFrom = wordsToDrawFrom.concat(jsWords);
    if (activeLanguages[i].name == "php") wordsToDrawFrom = wordsToDrawFrom.concat(phpWords);
    if (activeLanguages[i].name == "cSharp") wordsToDrawFrom = wordsToDrawFrom.concat(cSharpWords);
    if (activeLanguages[i].name == "java") wordsToDrawFrom = wordsToDrawFrom.concat(javaWords);
  }
  CopyOfWordsToDrawFrom = Array.from(wordsToDrawFrom);
  drawWordsAndAdd();
}

function drawWordsAndAdd() {
  //at what index add more letters
  const index = drawOutWords.length;
  //draw words
  for (let i = 0; i < 50; i++) {
    if (CopyOfWordsToDrawFrom.length == 0) CopyOfWordsToDrawFrom = wordsToDrawFrom; //if all of the words were draw out from table then reset table
    const drawNumber = Math.floor(Math.random() * CopyOfWordsToDrawFrom.length);
    drawOutWords = drawOutWords + CopyOfWordsToDrawFrom[drawNumber] + " ";
    CopyOfWordsToDrawFrom = CopyOfWordsToDrawFrom.slice(0, drawNumber).concat(CopyOfWordsToDrawFrom.slice(drawNumber + 1)); //delete draw out value so it wont repeat
  }
  //add letters to drawOutWordsPanel
  let fragment = new DocumentFragment();
  for (let j = index; j < drawOutWords.length; j++) {
    const createSpan = document.createElement("span");
    const passedValue = document.createTextNode(drawOutWords[j]);
    createSpan.appendChild(passedValue);
    fragment.appendChild(createSpan);
  }
  drawOutWordsPanel.appendChild(fragment);
  letterWidth = spanCollection[0].offsetWidth;
}

function userStartTyping() {
  startTime = new Date().getTime();
  timeLeft = startTime + localStorage.getItem("timer") * 60 - startTime;
  setProgressBarDimensions();
  timeLeftSlider.style.opacity = 1;
  timeLeft--;

  measureTime = setInterval(() => {
    updateLiveScore();
    setProgressBarDimensions();
    //if there is less then 50 letters draw more words
    if (drawOutWords.length - textField.value.length < 50) drawWordsAndAdd();
    //if time runs out
    if (timeLeft == 0) {
      clearInterval(measureTime);
      timeLeftSlider.style.width = 0;
      showFinalScore();
      textField.blur();
      textField.disabled = true;
      //add score to local storage
      const date = new Date();
      const chartData = localStorage.getItem("chartData") == null ? {} : JSON.parse(localStorage.getItem("chartData"));
      const index = chartData == null ? 0 : Object.keys(chartData).length;
      chartData[`${index}`] = {
        date: `${date.getMonth()}, ${date.getDate()}, ${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
        wpm: parseFloat(wpm()).toFixed(1),
        accuracy: parseFloat(accuracy()).toFixed(1),
        result: (Math.round(parseFloat(wpm())) * (parseFloat(accuracy()) / 140)).toFixed(1),
        timeTyped: localStorage.getItem("timer"),
      };
      localStorage.setItem("chartData", JSON.stringify(chartData));
    }
    timeLeft--;
  }, 1000);
}

//compare user input with draw out words
function compareLetters(keyName) {
  let valueOfInput = textField.value;
  for (let i = valueOfInput.length; i < valueOfInput.length + 1; i++) {
    if (drawOutWords[i] != keyName) {
      //if wrong on spacebar then mark mistake with underscore
      if (drawOutWords[i] == " ") {
        document.getElementsByTagName("span")[i].innerHTML = "_";
      }
      let span = spanCollection[i];
      span.classList.add("lightWrongLetter");
      mistypedButErasedLetters++;
      totalMistypedLetters++;
      totalTypedLetters++;
    } else {
      correctLetters++;
      totalTypedLetters++;
    }
  }
  changeTextIndentPosition(true);
}

const accuracy = () => (100 - 100 * (totalMistypedLetters / totalTypedLetters)).toFixed(2);

const wpm = () =>
  (
    (totalTypedLetters * ((parseInt(localStorage.getItem("timer")) * 60) / (parseInt(localStorage.getItem("timer")) * 60 - timeLeft))) /
    5 /
    parseInt(localStorage.getItem("timer"))
  ).toFixed(2); //5 because the average word length in English language is 4.7 characters

function updateLiveScore() {
  document.querySelector(".liveStats__accuracy").innerHTML = `Accuracy ${accuracy()}%`;
  document.querySelector(".liveStats__wpm").innerHTML = `WPM ${wpm()}`;
}

function showFinalScore() {
  scoreValues.querySelector(".typed").innerHTML = `<b>${totalTypedLetters}</b> typed`;
  scoreValues.querySelector(".wpm").innerHTML = `<b>${wpm()}</b>`;
  scoreValues.querySelector(".mistyped").innerHTML = `<b>${totalMistypedLetters}</b> / <b>${
    totalMistypedLetters - mistypedButErasedLetters
  }</b> corrected`;
  scoreValues.querySelector(".accuracy").innerHTML = `<b>${accuracy()}</b> %`;
  document.querySelector(".summary").classList.add("active");
  window.scrollTo(0, document.querySelector(".summary").offsetTop - window.innerHeight / 2 + document.querySelector(".summary").offsetHeight / 2);
}

function setOriginTextIndent() {
  TextIndentPosition = drawOutWordsPanel.offsetWidth * 0.4 - textField.value.length * letterWidth;
  drawOutWordsPanel.style.textIndent = TextIndentPosition + "px";
}

//updates Text Indent Position in drawOutWordsPanel after wrote or erased letter
function changeTextIndentPosition(bool) {
  TextIndentPosition = bool == true ? TextIndentPosition * 1 - letterWidth : TextIndentPosition * 1 + letterWidth;
  drawOutWordsPanel.style.textIndent = TextIndentPosition + "px";
}

//always placing caret at the end and to avoid selecting and deleting text
function setCaretPosition() {
  textField.selectionStart = textField.selectionEnd = textField.value.length;
}

function setProgressBarDimensions() {
  appPanelWidth = appWrapper.offsetWidth;
  timerWidthUnion = appPanelWidth / (localStorage.getItem("timer") * 60);
  timerWidthUnionAfterPointSum = (timerWidthUnion % 1) * timeLeft;
  timeLeftSlider.style.width = Math.floor(timerWidthUnion) * timeLeft + Math.floor(timerWidthUnionAfterPointSum) + `px`;
  timerWidthUnionAfterPointSum -= Math.floor(timerWidthUnionAfterPointSum);
}

function resetCountingVariables() {
  correctLetters = 0;
  mistypedButErasedLetters = 0;
  totalMistypedLetters = 0;
  totalTypedLetters = 0;
  timerWidthUnionAfterPointSum = 0;
  startTime = null;
  timeLeft = null;
  clearInterval(measureTime);
  timeLeftSlider.style.width = 0;
}

function restartApp() {
  textField.disabled = false;
  textField.value = "";
  drawOutWordsPanel.innerHTML = ""; //delete draw out words
  document.querySelector(".summary").classList.remove("active");
  document.querySelector(".liveStats__accuracy").innerHTML = `Accuracy 0.00%`;
  document.querySelector(".liveStats__wpm").innerHTML = `WPM 0.00`;
  resetCountingVariables();
  prepareToDrawWords();
  setOriginTextIndent();
  textField.focus();
  //scrolls to writing panel
  window.scrollTo(
    0,
    document.querySelector(".app__wrapper").offsetTop - window.innerHeight / 2 + document.querySelector(".app__wrapper").offsetHeight / 2
  );
}

function returnActiveLanguages() {
  const activeLanguages = [];
  for (let i = 1; i <= localStorage.length; i++) {
    const languageFromLocalStorage = JSON.parse(localStorage.getItem(`language_${i}`));
    if (languageFromLocalStorage == null) break;
    if (languageFromLocalStorage.active) activeLanguages.push(languageFromLocalStorage);
  }
  return activeLanguages;
}

//on modal opening read data to display
function updateUISettings() {
  const timeSet = localStorage.getItem("timer");
  document.querySelector("#timer__slider").value = timeSet;
  timeForm.innerHTML = `Time to write in minutes: <b>${timeSet}</b>`;
  //first unchecked all checkboxes then check checkboxes which should be checked
  languagesForm.querySelectorAll(`input[type="checkbox"]`).forEach((item) => (item.checked = false));
  returnActiveLanguages().forEach((item) => (languagesForm.querySelector(`input#${item.name}`).checked = true));
}

function openModal(modal) {
  if (modal == null) return;
  updateUISettings();
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

function handleKeyPress(e) {
  if (textField.value.length == 0 && startTime == null) {
    resetCountingVariables();
    userStartTyping();
  }
  // ignoring enter, ctrl + enter i ctrl + z
  if (e.keyCode != 13 && e.keyCode != 10 && e.keyCode != 26) {
    compareLetters(e.key);
  }
}

function handleKeyDown(e) {
  const keyCode = e.keyCode;
  setCaretPosition();
  //emoticons
  if (keyCode == 91 || keyCode == 92) {
    textField.blur();
  }
  //ignoring arrow keys, home key, ctrl + z, ctrl + y
  if (keyCode == 36 || keyCode == 37 || keyCode == 38 || keyCode == 39 || (e.ctrlKey && keyCode == 90) || (e.ctrlKey && keyCode == 89)) {
    let textFieldValue = textField.value;
    textField.value = "";
    setTimeout(function () {
      textField.value = textFieldValue;
    }, 1);
  }
  //on backspace
  if (keyCode == 8) {
    const span = spanCollection[textField.value.length - 1];
    if (span == undefined) return;
    if (span.classList.contains("lightWrongLetter")) {
      span.classList.remove("lightWrongLetter");
      mistypedButErasedLetters--;
    } else {
      correctLetters--;
    }
    //delete "underscore" sign
    if (span.innerHTML == "_") {
      span.innerHTML = " ";
    }
    changeTextIndentPosition(false);
  }
}

//Event listeners
textField.addEventListener("keydown", handleKeyDown);
textField.addEventListener("keypress", handleKeyPress);
textField.addEventListener("touchstart", handleKeyDown);
textField.addEventListener("touchstart", handleKeyPress);
textField.addEventListener("copy", (e) => e.preventDefault());
textField.addEventListener("cut", (e) => e.preventDefault());
textField.addEventListener("paste", (e) => e.preventDefault());
textField.addEventListener("drop", (e) => e.preventDefault());
textField.addEventListener("click", setCaretPosition);
textField.addEventListener("focus", setCaretPosition);
window.addEventListener("resize", () => {
  setOriginTextIndent();
});
document.querySelector(".restart--sign").addEventListener("click", restartApp);

//dealing with modals
overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((item) => {
    closeModal(item);
  });
});

openModalButtons.forEach((item) => {
  item.addEventListener("click", () => {
    const modal = document.querySelector(item.dataset.modalTarget);
    openModal(modal);
  });
});
closeModalButtons.forEach((item) => {
  item.addEventListener("click", () => {
    const modal = item.closest(".modal");
    closeModal(modal);
  });
});

//dealing with forms
//save picked time to local storage
document.querySelector(".timer__button--save").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.setItem("timer", document.querySelector("#timer__slider").value);
  closeModal(this.closest(".modal"));
  restartApp();
});
//save picked languages to local storage
document.querySelector(".button--save").addEventListener("click", function (e) {
  e.preventDefault();
  const allLanguages = languagesForm.querySelectorAll("input");
  //if no language picked
  if (Array.from(allLanguages).every((item) => (item.checked ? false : true))) {
    alert("Pick at least one language");
    return;
  }
  for (let i = 0; i < allLanguages.length; i++) {
    if (allLanguages[i].type != "checkbox") break;
    const obj = {
      name: allLanguages[i].id,
      active: allLanguages[i].checked ? true : false,
    };
    localStorage.setItem(`language_${i + 1}`, JSON.stringify(obj));
  }
  closeModal(this.closest(".modal"));
  restartApp();
});

document.querySelector("#timer__slider").addEventListener("mousemove", function () {
  timeForm.innerHTML = `Time to write in minutes: <b>${this.value}</b>`;
});

//first user entrance on website
if (localStorage.length == 0) {
  localStorage.setItem("language_1", JSON.stringify({ name: "html", active: false }));
  localStorage.setItem("language_2", JSON.stringify({ name: "css", active: true }));
  localStorage.setItem("language_3", JSON.stringify({ name: "js", active: true }));
  localStorage.setItem("language_4", JSON.stringify({ name: "php", active: false }));
  localStorage.setItem("language_5", JSON.stringify({ name: "cSharp", active: false }));
  localStorage.setItem("language_6", JSON.stringify({ name: "java", active: false }));
  localStorage.setItem("timer", 1);
}
//entrance on website
prepareToDrawWords();
