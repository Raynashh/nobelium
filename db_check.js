// quick db check
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ddbrother9999_db_user:TUBMIHk4QQxoVRVO@nobelium-prod.comvbsg.mongodb.net/?appName=nobelium-prod')
.then(async () => {
  const Article = require('./src/models/Article.js').default;
  const articles = await Article.find().sort({createdAt: -1}).limit(1);
  articles.forEach(a => console.log(a.slug, a.imageBank));
  process.exit();
});
