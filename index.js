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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'pt-BR,pt;q=0.9'
            }
        });
        
        const $ = cheerio.load(data);
        
        // Tentativa 1: Iframe padrão
        let playerUrl = $('iframe').attr('src') || $('iframe').attr('data-src');
        
        // Tentativa 2: Procurar dentro de botões de player (comum nesse site)
        if (!playerUrl || playerUrl.includes('about:blank')) {
            playerUrl = $('.do-play-button').attr('data-url') || $('.player-option').attr('data-url');
        }

        if (playerUrl) {
            if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;
            
            // Se o link for um redirecionamento interno do site, avisamos
            res.json({ 
                success: true, 
                url: playerUrl,
                note: "Link capturado com sucesso." 
            });
        } else {
            res.status(404).json({ success: false, message: "O site mudou a estrutura do player." });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "Não consegui acessar o site de origem." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor atualizado!"));
