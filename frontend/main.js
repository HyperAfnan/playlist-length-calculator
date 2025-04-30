const checkbox = document.querySelector("input[type='checkbox']")
const checked = document.querySelector("._checked")
const result = document.querySelector(".result")

checkbox.addEventListener("change", (e) => {
   e.preventDefault()
   checked.toggleAttribute("hidden")
})

function getPlaylistId(url) {
   const listPosition = url.search("list=");
   if (listPosition === -1) null;
   const idStart = listPosition + 5;
   const nextAmpersand = url.indexOf("&", idStart);
   const idEnd = nextAmpersand !== -1 ? nextAmpersand : url.length;
   const playlistId = url.substring(idStart, idEnd);
   return playlistId;
}

function averageTime(videos, hours, minutes, seconds) {
   let averageHours = hours / videos
   let averageMin = minutes / videos
   let averageSec = seconds / videos

   if (averageHours != Math.floor(averageHours)) {
      let diff = averageHours - Math.floor(averageHours)
      averageHours -= diff
      diff *= 60;
      averageMin += diff
   }

   if (averageMin != Math.floor(averageMin)) {
      let diff = averageMin - Math.floor(averageMin)
      averageMin -= diff
      diff *= 60;
      averageSec += diff
      averageSec = Math.floor(averageSec)
   }
   return { ahours: averageHours, amin: averageMin, asec: averageSec }
}

document.getElementById('_submit').addEventListener('click', async (e) => {
   e.preventDefault()
   const link = document.querySelector('#_link').value;
   const watched = document.querySelector('#_videos').value;
   const videosLeft = document.querySelector("._videos_left")
   const videosLeftValue = document.querySelector('._videos_left_value')
   const playlistId = getPlaylistId(link)
   var reqLink = `http://192.168.58.190:3000/data?id=${playlistId}`
   if (watched) {
      reqLink += `&watched=${watched}`
      videosLeft.removeAttribute("hidden")
      videosLeftValue.removeAttribute("hidden")
   }
   fetch(reqLink)
      .then(response => response.json())
      .then(data => { 
         const average = averageTime(data.totalVideos, data.duration.hours, data.duration.minutes, data.duration.seconds)
         document.querySelector('._playlistTitle').innerText = data.playlistName;
         document.querySelector('._videos_left_value').innerText = data.videosLeft; 
         document.querySelector('._thumbnail').setAttribute("src", data.thumbnail)
         document.querySelector('._total_videos').innerText = data.totalVideos;
         document.querySelector('._length').innerText = `${data.duration.hours}h ${data.duration.minutes}m ${data.duration.seconds}s`;
         document.querySelector('._average').innerText = `${average.ahours}h ${average.amin}m ${average.asec}s`;
         if (result.hasAttribute("hidden")) {
            result.removeAttribute("hidden")
         } 
      })
      .catch(e => console.log(`Error: ${e}`))
});
