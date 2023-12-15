// Middleware pour ajouter la liste de sockets à chaque requête
const socketMiddleware = (uid_to_socket,  socket_id_to_uid) => (req, res, next) => {
    req.uid_to_socket = uid_to_socket;
    req.socket_id_to_uid = socket_id_to_uid;
    next();
  };
  
  // Exportez le middleware
  module.exports = socketMiddleware;
  