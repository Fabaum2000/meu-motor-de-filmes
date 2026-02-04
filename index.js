const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send("<h1>Motor de Filmes Profissional</h1>");
});

app.get('/filme/:id', (req, res) => {
    const id = req.params.id;

    // Em vez de raspar, geramos os links oficiais de embed que esses sites usam
    // O Superflix e o VidSrc aceitam o ID direto na URL
    const links = {
        superflix: `https://superflixapi.cv/api/movie/${id}`,
        vidsrc: `https://vidsrc.to/embed/movie/${id}`,
        embedplay: `https://embedplay.click/embed/movie/${id}`
    };

    res.json({
        success: true,
        id: id,
        urls: links,
        instrucao: "Escolha um dos links acima e coloque no src do seu iframe."
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Motor de Links Diretos Online!"));
