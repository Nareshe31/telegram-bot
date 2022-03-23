const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const { TELEGRAM_BOT_TOKEN, SERVER_URL,TORRENT_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const URI = `/webhook/${TELEGRAM_BOT_TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;
const TORRENT_SEARCH_URL=TORRENT_URL+"/api/v2/torrent/movie"

const app = express();
app.use(bodyParser.json());

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
};

app.post(URI, async (req, res) => {
    try {
        const chatId = req.body.message.chat.id;
        const text = req.body.message.text;
        const username = req.body.message.from.first_name;
        const messageId = req.body.message.message_id;
        // console.log(req.body);
        if (text == "/start") {
            
            const res1 = await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text:`✨Hi ${username}, I am Yts Torrent Search Bot and I can help you to search and explore torrents in Yts.

Send any movie name along with release year to search for torrents.

Eg: <pre>Batman Begins 2005</pre>`,
                protect_content: true,
                parse_mode:"HTML"
                
            });
            return res.send();
        }
        else{
            const res1 = await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text:`🔎Searching torrents for <pre>${text}</pre>`,
                parse_mode:"HTML"
            })
            const res2 = await axios.get(`${TORRENT_SEARCH_URL}/${text}`)
            const results=res2.data.results
            var msg="";
            for (let i = 0; i < results.length; i++) {
                const item=results[i]
                const link=SERVER_URL+"/redirect?url=magnet:?xt=urn:btih:"+String(item.link).slice(-40)+"&amp;dn="+item.title+"&amp;tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&amp;tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&amp;tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&amp;tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337"
                if (i>5) {
                    break
                }
                msg=msg+`${i+1}. ${item.title}

💾${item.size}  🟢${item.seeds}  🔴${item.peers} 

🧲<a href="${link}">Download</a>


`
            }
            msg=Number(results.length)>0?msg+`Total results: ${results.length}`:"No results found"
            const res3 = await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text:msg,
                parse_mode:"HTML"
            })
            return res.send();
        }

    } catch (error) {
        console.log(error.message);
        const chatId = req.body.message.chat.id;
        const errorRes = await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text:"Something went wrong😥. Search again",
        })
        return res.send()
    }
});

app.get('/redirect',(req,res)=>{
    let {url}=req.query
    res.redirect(url)
})

app.get("/", (req, res) => {
    res.json({
        message: "This is the new api for telegram bot",
        url: WEBHOOK_URL,
    });
});

app.listen(PORT, async () => {
    console.log(`🚀 app is running on port ${PORT}`);
    await init();
});


// reply_markup: {
//     inline_keyboard: [
//         [
//             {
//                 text: "Yes",
//                 callback_data: "yes"
//             },
//         ],
//         [
//             {
//                 text: "No",
//                 callback_data: "no"
//             },
//         ],
//     ],
// }

// const {Telegraf} = require('telegraf') // import telegram lib

// const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN) // get the token from envirenment variable
// bot.start((ctx) => ctx.reply('Welcome')) // display Welcome text when we start bot
// bot.hears('hi', (ctx) => ctx.reply('Hey there')) // listen and handle when user type hi text
// bot.command('hipster', Telegraf.reply('λ'))
// bot.launch() // start
