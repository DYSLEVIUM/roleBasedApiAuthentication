const cors = require('cors');
const express = require('express');
const { connect } = require('mongoose');
const passport = require('passport');

//  constants
const { DB, PORT } = require('./config');
const port = PORT || 80;

//  initialize app
const app = express();

//  middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

require('./middlewares/passport')(passport);

//  routes
app.use('/api/users', require('./routes/users'));

const startApp = async () => {
  try {
    //  connection to database
    await connect(DB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: true,
    })
      .then(() => console.log('Connected to database'))
      .catch((error) =>
        console.log('Error occurred while connecting to database')
      );

    app.listen(port, () => console.log(`Server running at port ${port}`));
  } catch (error) {
    console.log('Error occurred while starting server');
    startApp();
  }
};

startApp();
