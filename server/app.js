// importação de dependência(s)
import express from 'express';
import fs from 'fs';

// variáveis globais deste módulo
const PORT = 3000;
const jogadoresFile = fs.readFileSync('./server/data/jogadores.json');
const db = JSON.parse(jogadoresFile);

const app = express();

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
app.set('view engine', 'hbs');
app.set('views', './server/views');

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)

app.get('/', (req, res) => {
  res.render('index', db);
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código

app.get('/jogador/:numero_identificador/', (req, res) => {
  const steamid = req.params.numero_identificador;
  const player = db.players.find((p) => p.steamid === steamid);
  if (!player) return res.status(404);

  fs.readFile('./server/data/jogosPorJogador.json', (err, data) => {
    if (err) return res.status(400);
    const gamesPerPlayers = JSON.parse(data);
    if (!gamesPerPlayers) return res.status(404);
    const playerGames = gamesPerPlayers[steamid];

    const playerInfos = {
      ...player,
      gamesCount: playerGames.game_count,
      notPlayedGamesCount: Array.from(
        playerGames.games.filter((g) => g.playtime_forever === 0)
      ).length,
    };

    const mostPlayedGames = playerGames.games
      .sort((g1, g2) => g2.playtime_forever - g1.playtime_forever)
      .slice(0, 5)
      .map((g) => ({
        ...g,
        playtime_forever: (g.playtime_forever / 60).toFixed(0),
      }));

    res.render('jogador', {
      playerInfos,
      games: mostPlayedGames,
      favoriteGame: mostPlayedGames[0],
    });
  });
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
app.use(express.static('./client/'));

// abrir servidor na porta 3000 (constante PORT)
app.listen(PORT, () => {
  console.log(`Escutando em: http://localhost:${PORT}`);
});
