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

const submit = document.getElementById("_submit")
submit.addEventListener("click", (e) =>  {
   e.preventDefault()
   if (result.getAttribute("hidden") === "true") {
      result.toggleAttribute("hidden")
   }
})
