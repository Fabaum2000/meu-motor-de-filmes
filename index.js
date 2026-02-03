const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/movie/:slug', async (req, res) => {
    const slug = req.params.slug;
    const urlOriginal = `https://assistir.biz/filme/${slug}`;
    
    // Abre o navegador invisível
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        let videoLink = null;

        // "Escuta" as requisições de rede (Igual o Video DownloadHelper)
        page.on('request', request => {
            const url = request.url();
            // Se achar um link de vídeo, salva ele
            if (url.includes('.m3u8') || url.includes('.mp4')) {
                videoLink = url;
            }
        });

        // Entra no site e espera o player carregar
        await page.goto(urlOriginal, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Espera um pouco para o script do player gerar o link
        await new Promise(r => setTimeout(r, 5000));

        await browser.close();

        if (videoLink) {
            res.json({ success: true, url: videoLink, type: "direct_file" });
        } else {
            res.status(404).json({ success: false, message: "Não foi possível farejar o link direto." });
        }
    } catch (e) {
        await browser.close();
        res.status(500).json({ success: false, message: "Erro no servidor de farejamento." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sniffer Profissional Online!"));
