// CRUD functionality

// mkdir api-project
// cd api-project
// npm init 
// npm install express --save
// npm install mongodb --save
// npm install ejs --save
// npm install dotenv --save

const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8000
require('dotenv').config()

app.use(cors())
let url

app.use(express.static(__dirname + "/public"));

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'Comparo'                

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
.then(client => {
    console.log(`Connected to ${dbName} Database`)
    db = client.db(dbName)
})
.catch( error => console.error(error))

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/',(request, response)=>{
    db.collection('Comparo').find().toArray()
    .then(data => {
        response.render('index.ejs', { info: data })
    })
    .catch(error => console.error(error))
})

app.post('/postURL', (request, response) => {
    db.collection('Comparo').insertOne({url:request.body.url, urlExists:"true"})
    .then(result => {
        console.log('URL Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/updateURL', (request, response) => {
    db.collection('Comparo').updateOne({urlexists:"true"},{
        $set: {
            url:`${request.body.url}`
          }
    })
    .then(result => {
        console.log('Updated medicine status')
        response.json('status updated')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteMed', (request, response) => {
    db.collection('Comparo').deleteOne({medName: request.body.medName, medTiming: request.body.medTiming})
    .then(result => {
        console.log('Med Deleted')
        response.json('Med Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})

// web scraping 

app.get('/results', (req, res) => {

    let urlReal = []

    async function urlGetter(){
        url = await db.collection("Comparo").find({urlExists:"true"})
        await url.forEach(x => urlReal.push(x.url))
        console.log(`These are the links in the database currently: ${urlReal}`)

        axios(`${urlReal[urlReal.length-1]}`)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const articles = []
            $('#productTitle', html).each(function () { //<-- cannot be a function expression
                const title = $(this).text()
                articles.push({
                    title
                })
            })

            $('.a-price a-text-price a-size-medium apexPriceToPay', html).each(function () { //<-- cannot be a function expression
                const price = $(this).text()
                articles.push({
                    price
                })
            })
            res.json(articles)
        }).catch(err => console.log(err))
    }
    
    
    urlGetter()
    console.log(`HELLO THIS IS ${urlReal}`)

        
    }
)