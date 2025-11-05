
// 本文件负责处理所有与 “items” 相关的 REST 路由。

const express = require('express');
const { nanoid } = require('nanoid'); // Importer nanoid / 导入 nanoid
const router = express.Router();


//  为了简单起见，这里使用一个本地数组模拟数据库。

let items = [
  { id: nanoid(), name: 'Stylo', description: 'Stylo bleu', price: 2.5 },
  { id: nanoid(), name: 'Cahier', description: 'Cahier A4', price: 4.0 },
];



//  Récupérer la liste complète de tous les items./获取所有项目的完整列表。

router.get('/', (req, res) => {
  res.status(200).json(items);
});


// Récupérer un item spécifique par son identifiant./ 根据ID获取特定项目。

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const item = items.find(i => i.id === id);
  if (item) {
    res.status(200).json(item);
  } else {
    res.status(404).json({ message: 'Item non trouvé ' });
  }
});


// 🇫🇷 Créer un nouvel item ./ 创建一个新项目（包含名称、描述、价格）。

router.post('/', (req, res) => {
  const newItem = {
    id: nanoid(),
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  };
  items.push(newItem);
  res.status(201).json({
    message: 'Item créé avec succès / 成功创建项目',
    createdItem: newItem,
  });
});


// Mettre à jour un item existant./ 更新一个现有的项目。

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const index = items.findIndex(i => i.id === id);

  if (index !== -1) {
    items[index] = {
      id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
    };
    res.status(200).json({
      message: 'Item mis à jour ',
      updatedItem: items[index],
    });
  } else {
    res.status(404).json({ message: 'Item non trouvé' });
  }
});


// Supprimer un item existant par ID./ 根据ID删除现有项目。

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const index = items.findIndex(i => i.id === id);

  if (index !== -1) {
    items.splice(index, 1);
    res.status(204).send(); //  Pas de contenu /  无内容返回
  } else {
    res.status(404).json({ message: 'Item non trouvé / 未找到该项目' });
  }
});

module.exports = router;
