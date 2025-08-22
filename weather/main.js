//find my elements
const appBody = document.querySelector("body");
const tempInput = document.querySelector("#tempInput");
const tempReturnText = document.querySelector("#tempReturn");

function interpretTemp() {
  console.log(tempInput.value);
  let inputTemp = tempInput.value;
  if (inputTemp < 10) {
    tempReturnText.textContent = "it's freezing;";
    appBody.style.backgroundColor = "skyblue";
  } else if (inputTemp < 18) {
    tempReturnText.textContent = "it's cold";
    appBody.style.backgroundColor = "blue";
  } else if (inputTemp < 26) {
    tempReturnText.textContent = "it's mild";
    appBody.style.backgroundColor = "yellow";
  } else if (inputTemp < 30) {
    tempReturnText.textContent = "it's warm";
    appBody.style.backgroundColor = "tomato";
  } else {
    tempReturnText.textContent = "it's hot!!!!";
    appBody.style.backgroundColor = "red";
  }
  //temp 0-10 : freezing
  //temp 10-18 : cold
  //temp 18-26 : mid
  //temp 26-30 : warm
  //temp 30+ : hot
}

//this is a function call
