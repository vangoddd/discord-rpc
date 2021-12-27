setInterval(() => {
    var title = document.querySelector('yt-formatted-string.title.style-scope.ytmusic-player-bar').innerHTML;
    var artist = document.querySelector('yt-formatted-string.byline.style-scope.ytmusic-player-bar.complex-string').querySelector('a.yt-simple-endpoint.style-scope.yt-formatted-string').innerHTML;
    var time = document.querySelector('span.time-info.style-scope.ytmusic-player-bar').innerHTML;
    var url = document.URL;
    browser.runtime.sendMessage({"title": title, "artist":artist, "time":time, "url":url});
}, 15000);




