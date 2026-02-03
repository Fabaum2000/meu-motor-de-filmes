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
        // 1. Pega a página do filme
        const resp1 = await axios.get(urlOriginal, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $1 = cheerio.load(resp1.data);
        
        // 2. Acha o link do iframe do player
        let iframeUrl = $1('iframe').attr('src');
        if (iframeUrl && iframeUrl.startsWith('//')) iframeUrl = 'https:' + iframeUrl;

        if (!iframeUrl) return res.status(404).json({ success: false, message: "Player não encontrado" });

        // 3. ENTRANDO NO IFRAME (A mágica acontece aqui)
        // Vamos tentar ler o código de dentro do player para achar o arquivo de vídeo
        const resp2 = await axios.get(iframeUrl, { headers: { 'Referer': urlOriginal, 'User-Agent': 'Mozilla/5.0' } });
        
        // Procuramos por links que terminam em .mp4 ou .m3u8 no código fonte
        const regexVideo = /file":"(.*?)"/g; 
        const match = regexVideo.exec(resp2.data);
        
        let videoDireto = match ? match[1].replace(/\\/g, '') : null;

        if (videoDireto) {
            res.json({
                success: true,
                url: videoDireto,
                type: videoDireto.includes('m3u8') ? 'hls' : 'mp4',
                note: "Link direto extraído com sucesso!"
            });
        } else {
            // Se não achamos o MP4 puro, devolvemos o iframe mas avisamos
            res.json({
                success: true,
                url: iframeUrl,
                note: "Não foi possível limpar 100%, retornando player padrão."
            });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "Erro na extração profunda." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor de extração limpa pronto!"));
