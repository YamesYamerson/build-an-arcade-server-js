// Example game data
const games = [
    { id: '1', name: 'Tic Tac Toe' },
    { id: '2', name: 'Pong' },
  ];
  
  // Get all games
  exports.getAllGames = (req, res) => {
    res.json(games);
  };
  
  // Get a specific game by ID
  exports.getGameById = (req, res) => {
    const game = games.find((g) => g.id === req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  };
  