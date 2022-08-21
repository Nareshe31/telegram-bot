const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const { TELEGRAM_BOT_TOKEN, SERVER_URL, TORRENT_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const URI = `/webhook/${TELEGRAM_BOT_TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;
const TORRENT_SEARCH_URL = TORRENT_URL + "/api/v2/torrent/movie";

const app = express();
app.use(bodyParser.json());

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
};

// console.log(Buffer.byteLength(JSON.stringify({t:"file",link:"DDAB484CF84E5FC67BA4B8BD86527050A4844B51"})));

function generateTorrentButtons(totalResults,slicedResults,query,page) {
    try {
        
        var inilineKeyboards = [];
        var id=0;
        for (const torrent of slicedResults) {
            const link=SERVER_URL+"/redirect?url=magnet:?xt=urn:btih:"+String(torrent.link).slice(-40)+"&amp;dn="+torrent.title+"&amp;tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&amp;tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&amp;tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&amp;tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337"
            id++;
            inilineKeyboards.push([
                {
                    text: `${torrent.title}`,
                    callback_data:JSON.stringify({t:"magnet",q:query,p:page,id}),
                    // callback_data: JSON.stringify({ type:"send_file",torrent_link:torrent.link}),
                    // url:link
                },
            ]);
        }

        if (page == 1) {
            if (totalResults>10) {
                inilineKeyboards.push([
                    // {
                    //     text: `🗓️${page}/${Math.ceil(Number(totalResults / 10))}`,
                    //     callback_data: JSON.stringify({t:"do_nothing" }),
                    // },
                    { text: "Next⏭️", callback_data: JSON.stringify({ query, page: Number(page) + 1,t:"message_update" }) },
                ]);
            } else {
                // inilineKeyboards.push([
                //     {
                //         text: `🗓️${page}/${Math.ceil(Number(totalResults / 10))}`,
                //         callback_data: JSON.stringify({t:"do_nothing" }),
                //     }
                // ]);
            }
            
        } else if (Number(page) * 10 < totalResults) {
            inilineKeyboards.push([
                {
                    text: "Prev⏮️",
                    callback_data: JSON.stringify({ query, page: Number(page) - 1,t:"message_update" }),
                },
                // {
                //     text: `🗓️${page}/${Math.ceil(Number(totalResults / 10))}`,
                //     callback_data: JSON.stringify({t:"do_nothing"}),
                // },
                {
                    text: "Next⏭️",
                    callback_data: JSON.stringify({ query, page: Number(page) + 1,t:"message_update" }),
                },
            ]);
        } else {
            inilineKeyboards.push([
                {
                    text: "Prev⏮️",
                    callback_data: JSON.stringify({ query, page: Number(page) - 1 ,t:"message_update"}),
                },
                // {
                //     text: `🗓️${page}/${Math.ceil(Number(totalResults / 10))}`,
                //     callback_data: JSON.stringify({t:"do_nothing" }),
                // }
            ]);
        }
        return inilineKeyboards;
        
    } catch (error) {
        throw error
    }
}

async function updateMessageText(callback_query, callback) {
    try {
        const chatId = callback_query.message.chat.id;
        const text = callback_query.message.text;
        const messageId = callback_query.message.message_id;
        // console.log(JSON.parse(callback_query.data));
        const { page, query } = JSON.parse(callback_query.data);
        const res2 = await axios.get(`${TORRENT_SEARCH_URL}/${query}`);
        const results = res2.data.result;

        var resultsSliced = results?.length?results.slice((page - 1) * 10, page * 10):[];
        var inilineKeyboards = generateTorrentButtons(results?.length??0,resultsSliced,query,page);

        const resPhoto = await axios.post(`${TELEGRAM_API}/editMessageText`, {
            chat_id: chatId,
            message_id: messageId,
            text: `Total results: ${results?.length} 
Page:${page}/${Math.ceil(results?.length/10)}`,
            // photo:"https://www.themoviedb.org/t/p/w600_and_h900_bestv2/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg"
            reply_markup: {
                inline_keyboard: inilineKeyboards,
            },
        });
        callback();
    } catch (error) {
        throw error;
    }
}

async function sendTorrentFile(callback_query,callback) {
    try {
        console.log("inn file");
        const chatId = callback_query.message.chat.id;
        const text = callback_query.message.text;
        const messageId = callback_query.message.message_id;
        const { q,p,id } = JSON.parse(callback_query.data);
        // console.log(link);
        // console.log({document});
        const res2 = await axios.get(`${TORRENT_SEARCH_URL}/${q}`);
        const results = res2.data.result;
        const torrent=results[((p-1)*10)+(id-1)]
        const torrent_link=SERVER_URL+"/redirect?url=https://yts.unblockit.bet/torrent/download/"+String(torrent.link).slice(32);

        const link="magnet:?xt=urn:btih:"+String(torrent.link).slice(-40)+"&amp;dn="+torrent.title+"&amp;tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&amp;tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&amp;tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&amp;tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337"
        const message=`✨${torrent.title}

💾 ${torrent.size}   🟢 ${torrent.seeds}   🔴 ${torrent.peers}   <a href="${torrent_link}">⬇️Download</a>

<code>${link}</code>
        `
        const resFile = await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text:message,
            parse_mode:"HTML"
        });
        
        callback();
    } catch (error) {
        throw error;
    }
}

async function sendWelcomeMessage(data,callback) {
    try {
        const chatId = data.message.chat.id;
        const text = data.message.text;
        const username = data.message.from.first_name;
        const messageId = data.message.message_id;
        const res1 = await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text:`✨Hi ${username}, I am YTS Torrent Search Bot and I can help you to search and explore torrents in YTS.

Send any movie name or imdb id to search torrents.

Note: While searching with movie name add release year for better results

Example: 
Batman Begins 2005
tt0372784`,
            protect_content: true,
            parse_mode:"HTML"

        });
        callback()
    } catch (error) {
        throw error
    }
}
async function sendMessage(data, callback) {
    try {
        const chatId = data.message.chat.id;
        const text = data.message.text;
        const username = data.message.from.first_name;
        const messageId = data.message.message_id;

        const res1 = await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: `🔎Searching torrents for <strong>${text}</strong>`,
            parse_mode: "HTML",
        });

        const res2 = await axios.get(`${TORRENT_SEARCH_URL}/${text}`);
        const results = res2.data.result;
        var resultsSliced = results?.length?results.slice(0, 10):[];

        var inilineKeyboards = resultsSliced.length?generateTorrentButtons(results?.length??0,resultsSliced,text,1):[];
        
        const res3 = await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: results?.length?`Total results: ${results.length}  
Page:1/${Math.ceil(results?.length/10)}`:"No results found😥",
            // photo:"https://www.themoviedb.org/t/p/w600_and_h900_bestv2/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg"
            reply_markup: {
                inline_keyboard:inilineKeyboards,
            },
        });
        callback();
    } catch (error) {
        throw error;
    }
}
app.post(URI, async (req, res) => {
    try {
        const {callback_query}=req.body
        if (callback_query) {
            const {t}=JSON.parse(callback_query.data)
            const callback= () => {
                return res.send();
            }
            if (t==="message_update") {
                updateMessageText(callback_query,callback)
            }
            else if (t!=="do_nothing") {
                sendTorrentFile(callback_query,callback);
            }
        } else {
            const text = req.body.message.text;
            if (text==="/start") {
                sendWelcomeMessage(req.body, () => {
                    return res.send();
                });
            }
            else{
                sendMessage(req.body, () => {
                    return res.send();
                });
            }
            
        }
    } catch (error) {
        console.log(error.message);
        // const chatId = req.body.message.chat.id;
        // const errorRes = await axios.post(`${TELEGRAM_API}/sendMessage`, {
        //     chat_id: chatId,
        //     text: "Something went wrong😥. Search again",
        // });
        return res.send();
    }
});
app.get("/redirect", (req, res) => {
    let { url } = req.query;
    res.redirect(url);
});

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
