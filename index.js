const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/movie/:slug', async (req, res) => {
    const slug = req.params.slug;
    const urlOriginal = `https://assistir.biz/filme/${slug}`;
    
    // Lista de proxies para tentar furar o bloqueio 404 da Render
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlOriginal)}`;

    try {
        // Fazemos a requisição via Proxy (allOrigins)
        const response = await axios.get(proxyUrl);
        const html = response.data.contents; // O conteúdo vem dentro de 'contents'
        
        const $ = cheerio.load(html);
        let playerUrl = "";

        $('iframe').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            // Filtro rigoroso: precisa ser do domínio assistir.biz e não ser Facebook
            if (src && src.includes('biz/iframe') && !src.includes('facebook')) {
                playerUrl = src.startsWith('//') ? 'https:' + src : src;
            }
        });

        if (playerUrl) {
            return res.json({
                success: true,
                url: playerUrl,
                info: "Acessado via Proxy para evitar bloqueio 404"
            });
        }

        res.status(404).json({ success: false, message: "Página aberta, mas player não encontrado." });

    } catch (e) {
        res.status(500).json({ 
            success: false, 
            message: "O site continua bloqueando mesmo via Proxy.",
            error: e.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor com Proxy Ativado!"));
