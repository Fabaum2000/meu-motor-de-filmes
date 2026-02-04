const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/movie/:slug', async (req, res) => {
    const slug = req.params.slug;
    const url = `https://assistir.biz/filme/${slug}`;

    try {
        const { data } = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(data);
        let playerUrl = "";

        // Procura todos os iframes e descarta redes sociais
        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && !src.includes('facebook.com') && !src.includes('google.com') && !src.includes('twitter.com')) {
                playerUrl = src;
            }
        });

        // Se ainda não achou, tenta pegar o link de botões específicos
        if (!playerUrl) {
            playerUrl = $('.do-play-button').attr('data-url') || $('.player-option').attr('data-url');
        }

        if (playerUrl) {
            if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
            res.json({ success: true, url: playerUrl });
        } else {
            res.status(404).json({ success: false, message: "Não encontrei o player de vídeo." });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "Erro ao acessar o site." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor recalibrado!"));
