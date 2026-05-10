const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const tvShowProtoPath = 'tvShow.proto';

const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

const tvShows = [
  {
    id: '1',
    title: 'Breaking Bad',
    description: 'Crime drama TV series'
  },
  {
    id: '2',
    title: 'Dark',
    description: 'German science fiction series'
  }
];

const tvShowService = {
  getTvshow: (call, callback) => {
    const tv_show = tvShows.find(
      tv => tv.id === call.request.tv_show_id
    );

    callback(null, { tv_show });
  },

  searchTvshows: (call, callback) => {
    callback(null, { tv_shows: tvShows });
  }
};

const server = new grpc.Server();

server.addService(
  tvShowProto.TVShowService.service,
  tvShowService
);

const port = 50052;

server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`TV Show microservice running on port ${port}`);
  }
);