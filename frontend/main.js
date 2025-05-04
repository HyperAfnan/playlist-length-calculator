const checkbox = document.querySelector("input[type='checkbox']")
const checked = document.querySelector(".checked")
const result_card = document.querySelector(".resultCard")

checkbox.addEventListener("change", (e) => {
   e.preventDefault()
   checked.toggleAttribute("hidden")
})

function sendNotification(message) {
   const div = document.createElement("div")
   const mainDiv = document.querySelector(".mainDiv")
   div.className = "notification"
   div.classList.add("slideIn")

   if (document.querySelector(".notification")) return 0

   const h1 = document.createElement("span")
   h1.className = "notificationHeader"
   h1.innerHTML = message

   div.appendChild(h1)

   mainDiv.appendChild(div)
   setTimeout(() => {
      div.classList.remove("slideIn")
      div.classList.add("slideOut")
      setTimeout(() => {
         div.remove()
      }, 1000);
   }, 3000)
}

function getPlaylistId(url) {
   const listPosition = url.search("list=");
   if (listPosition === -1) null;
   const idStart = listPosition + 5;
   const nextAmpersand = url.indexOf("&", idStart);
   const idEnd = nextAmpersand !== -1 ? nextAmpersand : url.length;
   const playlistId = url.substring(idStart, idEnd);
   return playlistId;
}


// BUG: secondsnot being calculated correctly
function averageTime(videos, days, hours, minutes, seconds) {
   let averageDays = days / videos
   let averageHours = hours / videos
   let averageMin = minutes / videos
   let averageSec = seconds / videos

   if (averageDays != Math.floor(averageDays)) {
      let diff = averageDays - Math.floor(averageDays)
      averageDays -= diff
      diff *= 24;
      averageHours += diff
   }

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

   // if (averageSec != Math.floor(averageSec)) {
   //    let diff = averageSec - Math.floor(averageSec)
   // }

   return { adays: averageDays, ahours: averageHours, amin: averageMin, asec: averageSec }
}


document.getElementById('submit').addEventListener('click', async (e) => {
   e.preventDefault()

   const link = document.querySelector('#linkInput').value;
   const watched = document.querySelector('#videos').value;
   const videosLeft = document.querySelector(".videosLeft")
   const videosLeftValue = document.querySelector('.videosLeftValue')
   const playlistId = getPlaylistId(link)
   var reqLink = `/api/data?id=${playlistId}`
   var ok = true

   if (link === "" || link === null || link === undefined || link === " " || !isNaN(link) || !link.includes("list=")) {
      ok = false
      return sendNotification("Please enter a valid link")
   }

   if (watched) {
      if (watched === "" || watched === null || watched === undefined || watched === " " || isNaN(watched)) {
         ok = false
         return sendNotification("Please enter a valid number")
      }
      else {
         reqLink += `&watched=${watched}`
         videosLeft.removeAttribute("hidden")
         videosLeftValue.removeAttribute("hidden")
         result_card.style.height = "36rem"
      }
   }
   if (ok) {
      fetch(reqLink)
         .then(response => { response.json() })
         .then(data => {
            if (data.error) { return sendNotification(data.error) }
            const average = averageTime(data.totalVideos, data.duration.days, data.duration.hours, data.duration.minutes, data.duration.seconds)
            document.querySelector('.playlistTitle').innerText = data.playlistName;
            document.querySelector('.videosLeftValue').innerText = data.videosLeft;
            document.querySelector('.thumbnail').setAttribute("src", data.thumbnail)
            document.querySelector('.totalVideos').innerText = data.totalVideos;
            document.querySelector('.length').innerText = `${data.duration.days}d ${data.duration.hours}h ${data.duration.minutes}m ${data.duration.seconds}s`;
            document.querySelector('.average').innerText = `${average.adays}d ${average.ahours}h ${average.amin}m ${average.asec}s`;
            if (result_card.hasAttribute("hidden")) {
               result_card.removeAttribute("hidden")
            }
         })
         .catch(e => console.log(`Error: ${e}`))
   }
});
