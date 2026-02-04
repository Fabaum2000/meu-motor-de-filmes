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
        // Busca a página do filme
        const resp1 = await axios.get(urlOriginal, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(resp1.data);
        
        let playerUrl = "";
        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            // Pega apenas o link do player interno
            if (src && src.includes('assistir.biz/iframe')) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            // Agora entramos no player e buscamos o link do vídeo puro (.mp4 ou .m3u8)
            const resp2 = await axios.get(playerUrl, { headers: { 'Referer': urlOriginal } });
            
            // Regex para capturar links de vídeo em scripts
            const regexVideo = /(https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)/i;
            const match = resp2.data.match(regexVideo);

            if (match) {
                return res.json({ 
                    success: true, 
                    url: match[1], 
                    type: match[1].includes('m3u8') ? "hls" : "mp4" 
                });
            }
            
            // Se o link direto estiver muito escondido, devolvemos o iframe mas sem o lixo em volta
            return res.json({ success: true, url: playerUrl, type: "iframe_clean" });
        }
        
        res.status(404).json({ success: false, message: "Filme não encontrado no site original." });
    } catch (e) {
        res.status(500).json({ success: false, message: "O motor falhou ao tentar buscar o vídeo." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sniffer Leve Online!"));
