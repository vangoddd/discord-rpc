const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {

    console.log(document);

    let title = document.getElementById('songTitle');
    let artist = document.getElementById('songArtist');
    let duration = document.getElementById('songDuration');
    
    console.log(title);
    console.log(artist);
    console.log(duration);

    ipcRenderer.on('title', (event, arg) => {
        if(!arg) return;
        title.innerHTML = arg.title;
        artist.innerHTML = arg.artist;
        duration.innerHTML = arg.time;
    
        console.log(arg) 
    });
    
    setInterval(function(){ 
        ipcRenderer.send('title', 'getTitle');
    }, 5000);
  
  });





