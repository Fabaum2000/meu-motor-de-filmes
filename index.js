const express = require('express');
const app = express();

// Rota de Embed Direto do Superflix
app.get('/embed/:id', (req, res) => {
    const id = req.params.id;
    const finalUrl = `https://superflixapi.cv/filme/${id}`;

    // Retorna a página com o player ocupando a tela inteira
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Player Superflix - SoulLyricsBR</title>
            <style>
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #000; }
                iframe { width: 100%; height: 100%; border: 0; }
            </style>
        </head>
        <body>
            <iframe 
                src="${finalUrl}" 
                allow="autoplay; encrypted-media; picture-in-picture" 
                allowfullscreen 
                frameborder="0" 
                scrolling="no">
            </iframe>
        </body>
        </html>
    `);
});

// Página inicial de status
app.get('/', (req, res) => {
    res.send("<h1>Motor Superflix Online</h1><p>Use /embed/ID para gerar o player.</p>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor Superflix rodando na porta " + PORT));
