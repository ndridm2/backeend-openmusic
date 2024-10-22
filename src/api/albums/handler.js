const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      message: 'Albums added successfully!',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsByAlbumId(id);

    const response = h.response({
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);
    const response = h.response({
      status: 'success',
      message: 'Albums updated successfully!',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    const response = h.response({
      status: 'success',
      message: 'Albums successfully deleted!',
    });
    response.code(200);
    return response;
  }

  async postAlbumLikesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.verifyAlbumLikes(albumId, credentialId);
    await this._service.addAlbumLikes(albumId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'You like this albums.',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { likes, dataSource } = await this._service.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(likes, 10),
      },
    });
    response.header('X-Data-Source', dataSource);
    return response;
  }

  async deleteAlbumLikesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.deleteAlbumLikes(albumId, credentialId);
    return {
      status: 'success',
      message: 'Unlike the albums.',
    };
  }
}

module.exports = AlbumsHandler;
