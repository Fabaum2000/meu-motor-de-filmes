const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Página inicial simples
app.get('/', (req, res) => {
    res.send("<h1>Cine SoulLyricsBR Online</h1><p>Digite /filme/ID na URL para assistir.</p>");
});

// Rota que SOBE o player visualmente
app.get('/filme/:id', (req, res) => {
    const id = req.params.id;

    // Aqui está o seu iframe personalizado com o ID dinâmico
    const htmlPlayer = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assistindo Filme ${id}</title>
        <style>
            body { background-color: #000; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; color: white; font-family: sans-serif; }
            .container { width: 90%; max-width: 1000px; text-align: center; }
            iframe { width: 100%; aspect-ratio: 16/9; border: 0; border-radius: 12px; box-shadow: 0 0 20px rgba(255,0,0,0.5); }
            h2 { margin-bottom: 20px; color: #ff0000; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>SoulLyricsBR - Cinema v1.0</h2>
            <iframe 
                src="https://superflixapi.cv/filme/${id}" 
                allow="autoplay; encrypted-media; picture-in-picture" 
                allowfullscreen 
                frameborder="0" 
                scrolling="no">
            </iframe>
            <p>Se o filme não carregar, verifique o ID: ${id}</p>
        </div>
    </body>
    </html>
    `;

    // Envia o HTML pronto para o navegador
    res.send(htmlPlayer);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Player Visual Online!"));
