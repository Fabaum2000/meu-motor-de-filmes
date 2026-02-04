const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

// Esta função ajuda a API a "mentir" para o site original
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

app.get('/movie/:slug', async (req, res) => {
    const slug = req.params.slug;
    const urlOriginal = `https://assistir.biz/filme/${slug}`;

    try {
        // Tenta pegar a página com o disfarce de navegador
        const resp1 = await axios.get(urlOriginal, { headers });
        const $ = cheerio.load(resp1.data);
        
        let playerUrl = "";
        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && src.includes('assistir.biz/iframe')) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            // Se achou o player, tenta entrar nele usando o filme como "Referer"
            const resp2 = await axios.get(playerUrl, { 
                headers: { ...headers, 'Referer': urlOriginal } 
            });
            
            const regexVideo = /(https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)/i;
            const match = resp2.data.match(regexVideo);

            if (match) {
                return res.json({ success: true, url: match[1], type: "direct" });
            }
            
            return res.json({ success: true, url: playerUrl, type: "iframe" });
        }
        
        res.status(404).json({ success: false, message: "URL do player não encontrada." });
    } catch (e) {
        // Se der erro, vamos ver o que o site respondeu exatamente
        res.status(500).json({ 
            success: false, 
            message: "Bloqueio de segurança do site original.",
            error: e.response ? e.response.status : "Offline"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor camuflado online!"));
