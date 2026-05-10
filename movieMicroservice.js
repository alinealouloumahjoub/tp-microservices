const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const movieProtoPath = 'movie.proto';

const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;

const movies = [
  {
    id: '1',
    title: 'Inception',
    description: 'Science fiction movie'
  },
  {
    id: '2',
    title: 'Interstellar',
    description: 'Space exploration movie'
  }
];

const movieService = {
  getMovie: (call, callback) => {
    const movie = movies.find(
      m => m.id === call.request.movie_id
    );

    callback(null, { movie });
  },

  searchMovies: (call, callback) => {
    callback(null, { movies });
  }
};

const server = new grpc.Server();

server.addService(
  movieProto.MovieService.service,
  movieService
);

const port = 50051;

server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`Movie microservice running on port ${port}`);
  }
);