const express=require("express")
const axios=require("axios")
const bodyParser=require("body-parser")
require("dotenv").config()

const PORT=process.env.PORT || 5000
const {TELEGRAM_BOT_TOKEN,SERVER_URL}=process.env
const TELEGRAM_API=`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
const URI=`/webhook/${TELEGRAM_BOT_TOKEN}`
const WEBHOOK_URL=SERVER_URL+URI

const app=express()
app.use(bodyParser.json())

const init=async()=>{
    const res=await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
}

app.post(URI,async(req,res)=>{
    const chatId=req.body.message.chat.id
    const text=req.body.message.text
    const res1=await axios.post(`${TELEGRAM_API}/sendMessage`,{
        chat_id:chatId,
        text:text
    })
})

app.get('/',(req,res)=>{
    res.json({message:"This is the new api for telegram bot"})
})

app.listen(PORT,async()=>{
    console.log(`🚀 app is running on port ${PORT}`);
    await init()
})

// const {Telegraf} = require('telegraf') // import telegram lib

// const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN) // get the token from envirenment variable
// bot.start((ctx) => ctx.reply('Welcome')) // display Welcome text when we start bot
// bot.hears('hi', (ctx) => ctx.reply('Hey there')) // listen and handle when user type hi text
// bot.command('hipster', Telegraf.reply('λ'))
// bot.launch() // start
