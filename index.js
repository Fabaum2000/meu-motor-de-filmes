const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send("<h1>Motor Superflix Online</h1><p>Use /filme/ID para buscar.</p>");
});

app.get('/filme/:id', async (req, res) => {
    const id = req.params.id;
    const urlOriginal = `https://superflixapi.cv/filme/${id}`;

    try {
        const { data } = await axios.get(urlOriginal, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        let playerUrl = "";

        // No Superflix, o player geralmente está no primeiro iframe ou em um botão de play
        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && !src.includes('facebook') && !src.includes('google')) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            return res.json({
                success: true,
                url: playerUrl,
                origem: "Superflix"
            });
        }

        res.status(404).json({ success: false, message: "Player nao encontrado." });

    } catch (e) {
        res.status(500).json({ 
            success: false, 
            message: "O site bloqueou o servidor da Render.",
            status: e.response ? e.response.status : "Erro de Conexão"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor Superflix Rodando!"));
