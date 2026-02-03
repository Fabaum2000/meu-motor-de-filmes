const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/movie/:slug', async (req, res) => {
    const slug = req.params.slug;
    const urlOriginal = `https://assistir.biz/filme/${slug}`;

    try {
        // Passo 1: Pegar o HTML do site
        const { data: htmlPrincipal } = await axios.get(urlOriginal, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Passo 2: Achar o link do player (iframe)
        const regexIframe = /<iframe.*?src=["'](.*?)["']/;
        const matchIframe = htmlPrincipal.match(regexIframe);
        let playerUrl = matchIframe ? matchIframe[1] : null;

        if (playerUrl) {
            if (playerUrl.startsWith('//')) playerUrl = 'https:' + playerUrl;

            // Passo 3: Entrar no Player e "farejar" o arquivo de vídeo (o Sniffer)
            const { data: htmlPlayer } = await axios.get(playerUrl, {
                headers: { 'Referer': urlOriginal, 'User-Agent': 'Mozilla/5.0' }
            });

            // Procuramos por links .m3u8 ou .mp4 (igual o Video DownloadHelper faz)
            const regexVideo = /(https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)/i;
            const matchVideo = htmlPlayer.match(regexVideo);

            if (matchVideo) {
                return res.json({
                    success: true,
                    url: matchVideo[1],
                    type: matchVideo[1].includes('m3u8') ? 'hls' : 'mp4',
                    method: 'sniffer_active'
                });
            }
        }

        res.status(404).json({ success: false, message: "Vídeo não detectado." });
    } catch (e) {
        res.status(500).json({ success: false, message: "Erro ao farejar vídeo." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sniffer Online!"));
