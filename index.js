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
        
        let playerUrl = "";

        // Analisa todos os iframes e descarta Facebook, Google e redes sociais
        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && !src.includes('facebook.com') && !src.includes('google.com') && !src.includes('twitter.com')) {
                playerUrl = src;
            }
        });

        if (playerUrl) {
            if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
            
            // Tenta extrair o vídeo real de dentro do iframe encontrado
            const resp2 = await axios.get(playerUrl, { headers: { 'Referer': urlOriginal } });
            const regex = /(https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)/i;
            const match = resp2.data.match(regex);
            
            if (match) {
                // Se achou o arquivo bruto (.mp4 ou .m3u8), entrega o link limpo
                return res.json({ success: true, url: match[1], type: "direct" });
            }

            // Se não achou o bruto, entrega pelo menos o link do player sem o Facebook
            res.json({ success: true, url: playerUrl, type: "iframe" });
        } else {
            res.status(404).json({ success: false, message: "Vídeo não encontrado." });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "Erro de conexão." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor recalibrado para links limpos"));
