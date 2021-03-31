import cors from 'cors';
import express from 'express';
import {sequelize} from './sequelize';

import {IndexRouter} from './controllers/v0/index.router';

import bodyParser from 'body-parser';
import {config} from './config/config';
import {V0_USER_MODELS} from './controllers/v0/model.index';


(async () => {
  sequelize.addModels(V0_USER_MODELS);
  await sequelize.sync()

  const app = express();
  const port = process.env.PORT || 8080;

  app.use(bodyParser.json());

  app.use(cors({
    allowedHeaders: [
      'Origin', 'X-Requested-With',
      'Content-Type', 'Accept',
      'X-Access-Token', 'Authorization',
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: config.url,
  }));

  // Use this when server is behind proxy
  app.use('/v0/', IndexRouter);

  app.get("/health", (req, res, next) => {
    res.status(200).send("Hello!");
  });

  // Use this when server is not behind proxy
  // app.use('/api/v0/users', IndexRouter);

  // Root URI call
  app.get( '/', async ( req, res ) => {
    res.send( '/v0/' );
  } );


  // Start the Server
  app.listen( port, () => {
    console.log( `server running on port ${port}` );
    console.log( `press CTRL+C to stop server` );
  } );
})();
