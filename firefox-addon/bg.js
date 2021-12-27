function notify(message, sender) {
    if(sender.tab.audible){
        sendData(message.title, message.artist, message.time, message.url);
    }
}

async function sendData(titleString, artistString, timeString, urlString){
    console.log('attempting to send' + titleString);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8000', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        title: titleString,
        artist: artistString,
        time: timeString,
        url: urlString
    }));
}

browser.runtime.onMessage.addListener(notify);
