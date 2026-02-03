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
        // 1. Pega a página principal do filme
        const resp1 = await axios.get(urlOriginal, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $1 = cheerio.load(resp1.data);
        
        // 2. Localiza o iframe do player
        let iframeUrl = $1('iframe').attr('src');
        if (iframeUrl && iframeUrl.startsWith('//')) iframeUrl = 'https:' + iframeUrl;

        if (!iframeUrl) return res.status(404).json({ success: false, message: "Player não encontrado" });

        // 3. EXTRAÇÃO PROFUNDA: Entra no Iframe para buscar o MP4/M3U8
        // Usamos o 'Referer' para o site não nos bloquear
        const resp2 = await axios.get(iframeUrl, { 
            headers: { 
                'Referer': urlOriginal, 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
            } 
        });
        
        // Procuramos por padrões comuns de arquivos de vídeo no código (file: "...", etc)
        const regexVideo = /file\s*:\s*["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/i;
        const match = resp2.data.match(regexVideo);
        
        let videoDireto = match ? match[1] : null;

        if (videoDireto) {
            res.json({
                success: true,
                url: videoDireto,
                type: videoDireto.includes('m3u8') ? 'hls' : 'mp4',
                origin: "Link Direto Extraído"
            });
        } else {
            // Se não conseguimos extrair o arquivo puro, devolvemos o iframe limpo
            res.json({
                success: true,
                url: iframeUrl,
                origin: "Iframe (Extração direta falhou)"
            });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "Erro na conexão com o servidor de vídeo." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor de limpeza profunda ativo!"));
