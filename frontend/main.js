const checkbox = document.querySelector("input[type='checkbox']")
const checked = document.querySelector("._checked")
const result = document.querySelector(".result")

checkbox.addEventListener("change", (e) => {
   e.preventDefault()
   checked.toggleAttribute("hidden")
})

// const link = document.getElementById("_link")
// link.addEventListener("submit", (e) => {
//    console.log(true)
// })

// const submit = document.getElementById("_submit")
// submit.addEventListener("click", (e) =>  {
//    e.preventDefault()
//    if (result.getAttribute("hidden") === "true") {
//       result.toggleAttribute("hidden")
//    }
// })

document.getElementById('_submit').addEventListener('click', async (e) => {
   const link = document.querySelector('#_link').value;
   console.log(link)
   // const watched = document.getElementById('watchedVideosInput').value;
   e.preventDefault()
   playlistId = "PLGjplNEQ1it8-0CmoljS5yeV-GlKSUEt0"

   fetch(`http://localhost:3000/data?id=${playlistId}`)
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
