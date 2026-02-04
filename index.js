const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

// Se você acessar o link puro, tem que aparecer isso:
app.get('/', (req, res) => {
    res.send("<h1>API Conectada com Sucesso!</h1>");
});

app.get('/filme/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const { data } = await axios.get(`https://embedplay.click/filme/${id}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const playerUrl = $('iframe').first().attr('src');

        if (playerUrl) {
            res.json({ success: true, url: playerUrl.startsWith('//') ? 'https:' + playerUrl : playerUrl });
        } else {
            res.json({ success: false, message: "Não achei o player" });
        }
    } catch (e) {
        res.json({ success: false, message: "Erro na busca" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Ligado!"));
