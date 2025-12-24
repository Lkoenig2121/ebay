// Saved items endpoints to add to server/index.ts
// Add these after the cart routes and before the orders routes

// Saved items storage: userId -> itemId[]
const savedItems: Record<string, string[]> = {};

// Saved items routes
app.post('/api/saved/add', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  const item = items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (!savedItems[userId]) {
    savedItems[userId] = [];
  }

  if (!savedItems[userId].includes(itemId)) {
    savedItems[userId].push(itemId);
  }

  res.json({ message: 'Item saved', savedItems: savedItems[userId] });
});

app.post('/api/saved/remove', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  if (!savedItems[userId]) {
    return res.status(404).json({ error: 'No saved items found' });
  }

  savedItems[userId] = savedItems[userId].filter(id => id !== itemId);

  res.json({ message: 'Item removed from saved', savedItems: savedItems[userId] });
});

app.post('/api/saved/check', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: 'Item ID is required' });
  }

  const isSaved = savedItems[userId]?.includes(itemId) || false;
  res.json({ isSaved });
});

app.get('/api/saved', authenticateToken, (req, res) => {
  const userId = (req as any).user.userId;
  const userSavedItemIds = savedItems[userId] || [];
  const savedItemsList = userSavedItemIds
    .map(itemId => items.find(item => item.id === itemId))
    .filter(item => item !== undefined);
  res.json(savedItemsList);
});


