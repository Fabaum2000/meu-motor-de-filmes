const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/movie/:slug', async (req, res) => {
    const slug = req.params.slug;
    const urlOriginal = `https://assistir.biz/filme/${slug}`;

    try {
        // 1. Pega a página com um disfarce de navegador (User-Agent)
        const { data } = await axios.get(urlOriginal, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' 
            }
        });

        const $ = cheerio.load(data);
        let playerUrl = "";

        // 2. Procura todos os iframes da página
        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            
            // SÓ PEGA se o link tiver "player" ou "iframe" e NÃO tiver "facebook"
            if (src && (src.includes('player') || src.includes('iframe')) && !src.includes('facebook')) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            res.json({
                success: true,
                url: playerUrl,
                type: "iframe"
            });
        } else {
            res.status(404).json({ success: false, message: "Link do player não encontrado na página." });
        }

    } catch (e) {
        res.status(500).json({ 
            success: false, 
            message: "Erro ao acessar o site original. Verifique o slug.",
            details: e.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor de Iframe Online!"));
