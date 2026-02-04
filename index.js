const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

// Agora a rota aceita o ID do IMDB (ex: tt1201607)
app.get('/filme/:imdbId', async (req, res) => {
    const imdbId = req.params.imdbId;
    const urlOriginal = `https://embedplay.click/filme/${imdbId}`;

    try {
        const response = await axios.get(urlOriginal, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Referer': 'https://embedplay.click/'
            }
        });

        const $ = cheerio.load(response.data);
        
        // No EmbedPlay, o player geralmente está em um iframe ou em um botão de embed
        let playerUrl = "";

        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            // Filtramos para pegar o link que realmente contém o player de vídeo
            if (src && !src.includes('facebook') && !src.includes('google')) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            return res.json({
                success: true,
                url: playerUrl,
                imdb: imdbId
            });
        }

        // Se não achou iframe, o link pode estar no próprio botão do site
        res.status(404).json({ success: false, message: "Player não encontrado nesta página." });

    } catch (e) {
        res.status(500).json({ 
            success: false, 
            message: "Erro ao acessar o EmbedPlay.",
            error: e.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor EmbedPlay Online!"));
