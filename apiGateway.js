const express = require('express');
const cors = require('cors');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const resolvers = require('./resolvers');

const typeDefs = require('fs').readFileSync(
  './schema.gql',
  'utf8'
);

const app = express();

const protoLoaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const movieProtoDefinition = protoLoader.loadSync(
  'movie.proto',
  protoLoaderOptions
);
const tvShowProtoDefinition = protoLoader.loadSync(
  'tvShow.proto',
  protoLoaderOptions
);

const movieProto =
  grpc.loadPackageDefinition(movieProtoDefinition).movie;

const tvShowProto =
  grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

const server = new ApolloServer({
  typeDefs,
  resolvers
});

async function startServer() {

  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server)
  );

  app.get('/movies', (req, res) => {

    const client = new movieProto.MovieService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );

    client.searchMovies({}, (err, response) => {
      if (err) res.status(500).send(err);
      else res.json(response.movies);
    });
  });

  app.get('/movies/:id', (req, res) => {

    const client = new movieProto.MovieService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );

    client.getMovie(
      { movie_id: req.params.id },
      (err, response) => {
        if (err) res.status(500).send(err);
        else res.json(response.movie);
      }
    );
  });

  app.get('/tvshows', (req, res) => {

    const client = new tvShowProto.TVShowService(
      'localhost:50052',
      grpc.credentials.createInsecure()
    );

    client.searchTvshows({}, (err, response) => {
      if (err) res.status(500).send(err);
      else res.json(response.tv_shows);
    });
  });

  app.get('/tvshows/:id', (req, res) => {

    const client = new tvShowProto.TVShowService(
      'localhost:50052',
      grpc.credentials.createInsecure()
    );

    client.getTvshow(
      { tv_show_id: req.params.id },
      (err, response) => {
        if (err) res.status(500).send(err);
        else res.json(response.tv_show);
      }
    );
  });

  app.listen(3000, () => {
    console.log('API Gateway running on port 3000');
  });
}

startServer();
