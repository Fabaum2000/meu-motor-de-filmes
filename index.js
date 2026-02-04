const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/movie/:slug', async (req, res) => {
    const slug = req.params.slug;
    
    // Tentamos o link padrão que você usou
    const urlOriginal = `https://assistir.biz/filme/${slug}`;

    try {
        const response = await axios.get(urlOriginal, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Referer': 'https://www.google.com/', // Engana o servidor do site
                'Accept-Language': 'pt-BR,pt;q=0.9'
            },
            timeout: 10000 // Espera no máximo 10 segundos
        });

        const $ = cheerio.load(response.data);
        let playerUrl = "";

        // Busca profunda por iframes que não sejam lixo
        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && !src.includes('facebook') && !src.includes('google') && (src.includes('player') || src.includes('iframe') || src.includes('biz'))) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            return res.json({ success: true, url: playerUrl });
        }

        res.status(404).json({ success: false, message: "Página carregou, mas o player sumiu." });

    } catch (e) {
        res.status(500).json({ 
            success: false, 
            message: "O site bloqueou o servidor da Render.",
            status: e.response ? e.response.status : "Timeout"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor recalibrado!"));
