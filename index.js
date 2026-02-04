const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

// ROTA DE TESTE: Acesse apenas https://seu-app.onrender.com/
app.get('/', (req, res) => {
    res.send("<h1>API Online!</h1><p>Use /filme/ID_DO_IMDB para buscar.</p>");
});

// ROTA DO FILME
app.get('/filme/:id', async (req, res) => {
    const id = req.params.id;
    const urlOriginal = `https://embedplay.click/filme/${id}`;

    try {
        const response = await axios.get(urlOriginal, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        let playerUrl = "";

        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && !src.includes('facebook')) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            return res.json({ success: true, url: playerUrl });
        }
        res.status(404).json({ success: false, message: "Player não encontrado." });
    } catch (e) {
        res.status(500).json({ success: false, message: "Erro na conexão." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando!"));
