const express = require('express');
const app = express();
const fs = require('fs').promises;
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DATA_FILE = './data.json';
let data = { nextId: 2, nodes: [{ id: 1, name: 'Root', type: 'folder', parentId: null }] };

async function loadData() {
  try {
    const s = await fs.readFile(DATA_FILE, 'utf8');
    data = JSON.parse(s);
  } catch (err) {
    // файл не найден или ошибка — создадим начальные данные
    await saveData();
  }
}
async function saveData() {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Преобразуем плоский список в дерево
function toTree(list) {
  const map = new Map();
  list.forEach(n => map.set(n.id, { id: n.id, name: n.name, type: n.type, parentId: n.parentId, children: [] }));
  const roots = [];
  list.forEach(n => {
    const node = map.get(n.id);
    if (n.parentId == null) {
      roots.push(node);
    } else {
      const p = map.get(n.parentId);
      if (p) p.children.push(node);
    }
  });
  return roots;
}

// Получить дерево
app.get('/tree', (req, res) => {
  res.json(toTree(data.nodes));
});

// Создать новый узел
app.post('/nodes', async (req, res) => {
  const { name, type, parentId } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name и type обязательны' });
  if (!['folder','item'].includes(type)) return res.status(400).json({ error: 'invalid type' });

  // проверка родителя (если указан)
  if (parentId != null && !data.nodes.find(n => n.id === parentId)) {
    return res.status(400).json({ error: 'Parent not found' });
  }

  const node = { id: data.nextId++, name, type, parentId: parentId ?? null };
  data.nodes.push(node);
  await saveData();
  res.status(201).json(node);
});

// Запуск сервера
loadData().then(() => {
  app.listen(PORT, () => console.log(`API минимальный JSON running at http://localhost:${PORT}`));
});