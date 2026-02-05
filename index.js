const express = require('express');
const app = express();

// Rota para Harry Potter ou qualquer outro filme do assistir.biz
app.get('/player/:slug', (req, res) => {
    const slug = req.params.slug;
    const playerNum = req.query.p || '1'; // Padrão é player 1
    
    // Monta a URL baseada no que você me mandou
    const finalUrl = `https://assistir.biz/iframe/${slug}?player=${playerNum}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Player Fullscreen - SoulLyricsBR</title>
            <style>
                /* Remove todos os espaços e margens da tela */
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body, html { 
                    width: 100%; 
                    height: 100%; 
                    overflow: hidden; 
                    background-color: #000; 
                }

                /* Faz o iframe ocupar 100% da visão do usuário */
                iframe { 
                    width: 100vw; 
                    height: 100vh; 
                    border: none;
                    display: block;
                }
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
app.listen(PORT, () => console.log("Player Fullscreen Online!"));
