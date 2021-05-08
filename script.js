var requesting = false;
var countRequests = 0;
var shutdownRequests = false;

const startButton = document.getElementById('startBtn');
const stopButton = document.getElementById('stopBtn');
const clearButton = document.getElementById('clearBtn');

startButton.addEventListener('click', startControl);
stopButton.addEventListener('click', stopControl);
clearButton.addEventListener('click', clearLogs);

function standardizeToTwoDigits(number = 0) {
  return number >= 10 ? number : `0${number}`;
}

function getInstant() {
  const dateObj = new Date();
  const year = dateObj.getUTCFullYear();
  const month = standardizeToTwoDigits(dateObj.getUTCMonth());
  const date = standardizeToTwoDigits(dateObj.getUTCDate());
  const hours = standardizeToTwoDigits(dateObj.getUTCHours());
  const minutes = standardizeToTwoDigits(dateObj.getUTCMinutes());
  const seconds = standardizeToTwoDigits(dateObj.getUTCSeconds());

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

function saveLog(logText = '') {
  if (!!logText) {
    const logger = document.getElementById('logger');
    const log = document.createElement('p');

    log.textContent = `[${getInstant()}] - ${logText}`;
    logger.appendChild(log);
  }
}

function clearLogs() {
  const logger = document.getElementById('logger');

  logger.innerHTML = '';
}


function makeRequest(requestFunction = null, prevResponse = null) {
  if (!requestFunction)
    return null;

  if (!!prevResponse)
    saveLog(prevResponse);

  requesting = true;

  return new Promise(async (resolve, reject) => {

    if (shutdownRequests) {
      saveLog('shutdown!');
      resolve('shutdown');
    }
    else {
      const response = await requestFunction();

      if (response === 'stop')
        resolve('Ok, you don\'t need to make another request');
      else
        reject(response);
    }
  })
    .then((response) => (response))
    .catch((response) => makeRequest(
      response !== 'shutdown' ? requestFunction : null,
      response
    ));
}

function anyFunction() {
  const requestLimit = 15;
  const requestTimeout = 800;

  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(
        countRequests++ < requestLimit
          ? `Hey! This is only your #${countRequests}. Keep requesting...`
          : 'stop'
      );
    }, requestTimeout);
  });
}

function resetConfigurations() {
  requesting = false;
  countRequests = 0;
  shutdownRequests = false;
}

async function startControl() {
  if (!requesting) {
    const result = await makeRequest(anyFunction);

    saveLog(`Final result: ${result}`);
    resetConfigurations();
  }
  else
    saveLog('Cool down... you already requested a loop ;)');
}

function stopControl() {
  shutdownRequests = true;
}
