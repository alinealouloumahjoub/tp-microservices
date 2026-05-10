const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const movieProtoPath = 'movie.proto';
const tvShowProtoPath = 'tvShow.proto';

const protoLoaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const movieProtoDefinition = protoLoader.loadSync(
  movieProtoPath,
  protoLoaderOptions
);
const tvShowProtoDefinition = protoLoader.loadSync(
  tvShowProtoPath,
  protoLoaderOptions
);

const movieProto =
  grpc.loadPackageDefinition(movieProtoDefinition).movie;

const tvShowProto =
  grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

const resolvers = {
  Query: {
    movie: (_, { id }) => {
      const client = new movieProto.MovieService(
        'localhost:50051',
        grpc.credentials.createInsecure()
      );

      return new Promise((resolve, reject) => {
        client.getMovie(
          { movie_id: id },
          (err, response) => {
            if (err) reject(err);
            else resolve(response.movie);
          }
        );
      });
    },

    movies: () => {
      const client = new movieProto.MovieService(
        'localhost:50051',
        grpc.credentials.createInsecure()
      );

      return new Promise((resolve, reject) => {
        client.searchMovies({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.movies);
        });
      });
    },

    tvShow: (_, { id }) => {
      const client = new tvShowProto.TVShowService(
        'localhost:50052',
        grpc.credentials.createInsecure()
      );

      return new Promise((resolve, reject) => {
        client.getTvshow(
          { tv_show_id: id },
          (err, response) => {
            if (err) reject(err);
            else resolve(response.tv_show);
          }
        );
      });
    },

    tvShows: () => {
      const client = new tvShowProto.TVShowService(
        'localhost:50052',
        grpc.credentials.createInsecure()
      );

      return new Promise((resolve, reject) => {
        client.searchTvshows({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.tv_shows);
        });
      });
    }
  }
};

module.exports = resolvers;
