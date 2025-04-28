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

document.getElementById('_submit').addEventListener('click', async (e) => {
   e.preventDefault()
   const link = document.querySelector('#_link').value;
   const watched = document.querySelector('#_videos').value;
   const playlistId = getPlaylistId(link)
   var reqLink = `http://localhost:3000/data?id=${playlistId}`
   if (watched) {
      reqLink += `&watched=${watched}`
   }

   fetch(reqLink)
      .then(response => response.json())
      .then(data => {
         document.querySelector('._playlistTitle').innerText = data.playlistName;
         document.querySelector('._thumbnail').setAttribute("src", data.thumbnail)
         document.querySelector('._total_videos').innerText = data.totalVideos;
         document.querySelector('._length').innerText = `${data.duration.hours}h ${data.duration.minutes}m ${data.duration.seconds}s`;
         result.toggleAttribute("hidden")
      })
      .catch(e => console.log(`Error: ${e}`))
});
