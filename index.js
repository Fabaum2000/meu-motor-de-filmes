const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send("<h1>Motor Pobreflix Online</h1>");
});

app.get('/filme/:slug', async (req, res) => {
    const slug = req.params.slug;
    const urlOriginal = `https://pobreflixdublado.lat/filme/${slug}`;

    try {
        const { data } = await axios.get(urlOriginal, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' 
            }
        });

        const $ = cheerio.load(data);
        let playerUrl = "";

        // O Pobreflix geralmente coloca o link em iframes ou atributos data-src
        $('iframe, div[data-src]').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            
            if (src && !src.includes('facebook') && !src.includes('google')) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            return res.json({
                success: true,
                url: playerUrl,
                origem: "Pobreflix"
            });
        }

        res.status(404).json({ success: false, message: "Player nao encontrado no Pobreflix." });

    } catch (e) {
        res.status(500).json({ success: false, message: "Erro ao acessar o site.", erro: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando!"));
