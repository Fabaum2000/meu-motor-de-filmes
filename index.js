const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

// Esta rota agora aceita TANTO /filme/ quanto /movie/
app.get(['/filme/:id', '/movie/:id'], async (req, res) => {
    const id = req.params.id;
    const urlOriginal = `https://embedplay.click/filme/${id}`;

    try {
        const response = await axios.get(urlOriginal, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Referer': 'https://embedplay.click/'
            }
        });

        const $ = cheerio.load(response.data);
        let playerUrl = "";

        // Procura por iframes ou links de player
        $('iframe, a, source').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('href');
            if (src && !src.includes('facebook') && !src.includes('google') && (src.includes('embed') || src.includes('player'))) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            return res.json({
                success: true,
                url: playerUrl,
                id: id
            });
        }

        res.status(404).json({ success: false, message: "Player não encontrado." });

    } catch (e) {
        res.status(500).json({ 
            success: false, 
            message: "Erro na conexão com EmbedPlay.",
            error: e.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor Universal Online!"));
