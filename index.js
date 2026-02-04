const express = require('express');
const app = express();

// Rota de Embed Universal
app.get('/embed/:id', (req, res) => {
    const id = req.params.id;
    // Permitir escolher o servidor via ?s=superflix ou ?s=vidsrc
    const servidor = req.query.s || 'superflix'; 

    let finalUrl = "";

    // Lógica para decidir qual iframe carregar
    if (servidor === 'vidsrc') {
        finalUrl = `https://vidsrc.to/embed/movie/${id}`;
    } else if (servidor === 'embedplay') {
        finalUrl = `https://embedplay.click/embed/movie/${id}`;
    } else {
        // Padrão: Superflix
        finalUrl = `https://superflixapi.cv/filme/${id}`;
    }

    // Retorna APENAS o player, ocupando 100% da tela
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor de Embed Online!"));
