const checkbox = document.querySelector("input[type='checkbox']")
const checked = document.querySelector("._checked")

checkbox.addEventListener("change", (e) => {
   e.preventDefault()
   checked.toggleAttribute("hidden")
})
