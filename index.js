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
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        let playerUrl = $('iframe').attr('src');
        if (playerUrl && playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;

        res.json({ success: true, url: playerUrl });
    } catch (e) {
        res.status(500).json({ success: false, message: "Erro ao buscar link." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor pronto!"));
