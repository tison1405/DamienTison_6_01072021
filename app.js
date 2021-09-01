const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const path = require('path');
const Thing = require('./models/Sauces');

const app = express();

mongoose.connect('mongodb+srv://dam1405:come0801@cluster0.epw2s.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


app.use(bodyParser.json());


app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.post('/api/sauces/:id/like',(req, res, next) =>{
  Thing.findOne({
    _id: req.params.id
  })
  .then(thing => {
    
    if(req.body.like===1){
      if(!thing.usersLiked.includes(req.body.userId)){
        thing.usersLiked.push(req.body.userId);
        thing.likes += 1;
        thing.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch(error => res.status(400).json({ error }));
    }}
     if(req.body.like===-1){
       if(!thing.usersDisliked.includes(req.body.userId)){
         thing.usersDisliked.push(req.body.userId);
         thing.dislikes += 1;
         thing.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
      }}
      if(req.body.like===0){
        for (let usersLiked of  thing.usersLiked){
          if (usersLiked === req.body.userId){
            thing.likes -= 1;
            thing.usersLiked.pull(req.body.userId);
            thing.save()
              .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
              .catch(error => res.status(400).json({ error }));
            }}
        for (let usersDisliked of thing.usersDisliked){
          if (usersDisliked === req.body.userId){
            thing.dislikes -= 1;
            thing.usersDisliked.pull(req.body.userId);
            thing.save()
            .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
            .catch(error => res.status(400).json({ error }));
          }}
        }
      })
  .catch(
    (error) => {
      res.status(404).json({
        error: error
      })
    })
});
 
module.exports = app;