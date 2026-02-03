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
        const resp1 = await axios.get(urlOriginal, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
        });
        const $ = cheerio.load(resp1.data);
        
        // Buscamos o iframe, mas agora olhamos também o 'data-src'
        let playerUrl = $('iframe').attr('src') || $('iframe').attr('data-src');

        // Se o link for interno do site, tentamos entrar nele
        if (playerUrl && playerUrl.includes('assistir.biz/iframe')) {
            if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
            
            const resp2 = await axios.get(playerUrl, { headers: { 'Referer': urlOriginal } });
            
            // Procuramos por links de servidores de vídeo comuns (.mp4 ou .m3u8)
            const regex = /(https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)/i;
            const match = resp2.data.match(regex);
            
            if (match) {
                return res.json({ success: true, url: match[1], type: "direct" });
            }
        }

        if (playerUrl) {
            if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
            res.json({ success: true, url: playerUrl, type: "iframe" });
        } else {
            res.status(404).json({ success: false, message: "Não foi possível limpar o vídeo." });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "Erro de conexão." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor recalibrado"));
