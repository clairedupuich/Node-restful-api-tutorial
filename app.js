const express = require('express');
const app = express();
const itemRoutes = require('./routes'); // 导入 routes.js

// Middleware pour parser le JSON envoyé dans le corps des requêtes
// 中间件：用于解析请求体中的 JSON 数据
app.use(express.json());

// Lier les routes /items à notre routeur
// 将 /items 路径交由我们定义的路由器处理
app.use('/items', itemRoutes);

// Route par défaut 
// 默认路由（当没有匹配路径时）
app.use((req, res, next) => {
  res.status(404).json({
    message: 'It works! (但该路径未定义)',
  });
});

module.exports = app;
