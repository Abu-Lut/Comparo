const feedDisplay = document.querySelector('#feed')

console.log("hellow or")

fetch('http://localhost:8000/results')
    .then(response => {
         console.log(response.json())
    })
    .then(data => {
        data.forEach(article => {
            const articleItem = '<h3>' + article.title + '</h3>'
            feedDisplay.insertAdjacentHTML("beforeend", articleItem)
        })
    })
    .catch(err => console.log(err))