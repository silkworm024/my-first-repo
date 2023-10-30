//server
const http = require("http"),
  fs = require("fs");
const port = 3456;
const file = "chat_room.html";
const server = http.createServer(function (req, res) {
  fs.readFile(file, function (err, data) {
    if (err) {
      return res.writeHead(500);
    }
    res.writeHead(200);
    res.end(data);
  });
});
server.listen(port);
console.log("Server running at http://localhost:3456/");

let user = {};
let rooms = {};
let words = ["fuck", "shit", "faggot", "slut"];

const socketio = require("socket.io")(http, {
  wsEngine: "ws",
});

const io = socketio.listen(server);

io.sockets.on("connection", function (socket) {
  socket.on("get_rooms_request", function () {
    if (Object.keys(rooms).length == 0) {
      io.sockets.emit("get_rooms", { success: false });
    } else {
      console.log(rooms);
      io.sockets.emit("get_rooms", { success: true, rooms: rooms });
    }
  });

  socket.on("login", function (data) {
    for (let key in user) {
      if (user[key] == data["name"]) {
        socket.emit("login_back", { success: false });
        return;
      }
    }
    user[socket.id] = data["name"];
    socket.emit("login_back", { success: true });
  });
  socket.on("logout", function (data) {
    delete user[socket.id];
  });
  socket.on("message_to_server", function (data) {
    console.log("message: " + data["message"]);
    let message = data["message"];
    for (let i = 0; i < words.length; i++) {
      while (message.toLowerCase().indexOf(words[i].toLowerCase()) >= 0) {
        let index = message.toLowerCase().indexOf(words[i].toLowerCase());
        let replacement = "";
        const length = words[i].length;
        for (let i = 0; i < length; i++) {
          replacement += "*";
        }
        if (length == message.length) {
          message = replacement;
        } else if (index == 0) {
          message = replacement + message.substring(length, message.length);
        } else if (index + length == message.length - 1) {
          message = message.substring(0, index) + replacement;
        } else {
          message =
            message.substring(0, index) +
            replacement +
            message.substring(index + length, message.length);
        }
      }
    }
    io.sockets.emit("message_to_client", {
      message: message,
      name: data["name"],
    });
  });

  socket.on("create_room", function (data) {
    if (data["name"] in rooms) {
      socket.emit("create_room_back", { success: false });
    } else {
      let users = [];
      users.push(user[socket.id]);
      if (data["password"]) {
        rooms[data["name"]] = {
          users: users,
          owner_id: socket.id,
          password: data["password"],
          banned: [],
        };
      } else {
        rooms[data["name"]] = { users: users, owner_id: socket.id, banned: [] };
      }
      socket.join(data["name"]);
      socket.emit("create_room_back", { success: true });
      io.to(data["name"]).emit("get_users", {
        users: rooms[data["name"]].users,
      });
      if (Object.keys(rooms).length == 0) {
        io.sockets.emit("get_rooms", { success: false });
      } else {
        io.sockets.emit("get_rooms", { success: true, rooms: rooms });
      }
    }
  });

  socket.on("room_message", function (data) {
    let message = data["message"];
    for (let i = 0; i < words.length; i++) {
      while (message.toLowerCase().indexOf(words[i].toLowerCase()) >= 0) {
        let index = message.toLowerCase().indexOf(words[i].toLowerCase());
        let replacement = "";
        const length = words[i].length;
        for (let i = 0; i < length; i++) {
          replacement += "*";
        }
        if (length == message.length) {
          message = replacement;
        } else if (index == 0) {
          message = replacement + message.substring(length, message.length);
        } else if (index + length == message.length - 1) {
          message = message.substring(0, index) + replacement;
        } else {
          message =
            message.substring(0, index) +
            replacement +
            message.substring(index + length, message.length);
        }
      }
    }
    io.to(data["room"]).emit("room_message_back", {
      name: data["name"],
      message: message,
    });
  });

  socket.on("leave_room", function (data) {
    const index = rooms[data["room"]].users.indexOf(user[socket.id]);
    rooms[data["room"]].users.splice(index, 1);
    socket.leave(data["room"]);
    io.to(data["room"]).emit("get_users", { users: rooms[data["room"]].users });
    if (Object.keys(rooms).length == 0) {
      io.sockets.emit("get_rooms", { success: false });
    } else {
      io.sockets.emit("get_rooms", { success: true, rooms: rooms });
    }
  });

  socket.on("check_owner", function (data) {
    if (rooms[data["room"]].owner_id == socket.id) {
      socket.emit("check_owner_back", { success: true });
    } else {
      socket.emit("check_owner_back", { success: false });
    }
  });

  socket.on("kick_user", function (data) {
    if (
      rooms[data["room"]].users.indexOf(data["name"]) < 0 ||
      data["name"] == user[socket.id]
    ) {
      socket.emit("kick_user_fail");
      return;
    }
    let id;
    for (const key in user) {
      if (user[key] == data["name"]) {
        id = key;
        break;
      }
    }
    io.to(id).emit("kick_out_message", { room: data["room"] });
  });

  socket.on("ban_user", function (data) {
    let found = false;
    let id;
    for (const key in user) {
      if (user[key] == data["name"]) {
        found = true;
        id = key;
        break;
      }
    }
    if (data["name"] == user[socket.id] || found == false) {
      console.log(found);
      console.log(user[socket.id]);
      console.log(data["name"]);
      socket.emit("ban_user_fail");
      return;
    }
    rooms[data["room"]].banned.push(id);
    if (rooms[data["room"]].users.indexOf(data["name"]) >= 0) {
      io.to(id).emit("ban_message", { room: data["room"] });
    }
  });

  socket.on("add_word", function (data) {
    for (let i = 0; i < words.length; i++) {
      if (words[i].toLowerCase() == data["word"].toLowerCase()) {
        socket.emit("add_word_back");
        return;
      }
    }
    words.push(data["word"]);
  });

  socket.on("private_message", function (data) {
    if (data["user"] == user[socket.id]) {
      socket.emit("private_message_back", { message: "1" });
      return;
    }
    if (rooms[data["room"]].users.indexOf(data["user"]) >= 0) {
      let id;
      for (const key in user) {
        if (user[key] == data["user"]) {
          id = key;
          break;
        }
      }
      let message = data["message"];
      for (let i = 0; i < words.length; i++) {
        while (message.toLowerCase().indexOf(words[i].toLowerCase()) >= 0) {
          let index = message.toLowerCase().indexOf(words[i].toLowerCase());
          let replacement = "";
          const length = words[i].length;
          for (let i = 0; i < length; i++) {
            replacement += "*";
          }
          if (length == message.length) {
            message = replacement;
          } else if (index == 0) {
            message = replacement + message.substring(length, message.length);
          } else if (index + length == message.length - 1) {
            message = message.substring(0, index) + replacement;
          } else {
            message =
              message.substring(0, index) +
              replacement +
              message.substring(index + length, message.length);
          }
        }
      }
      io.to(id).emit("get_private_message", {
        from: user[socket.id],
        message: message,
      });
    } else {
      socket.emit("private_message_back", { message: "2" });
      return;
    }
  });

  socket.on("join_room", function (data) {
    console.log(rooms[data["room"]].banned.indexOf(socket.id));
    if (rooms[data["room"]].banned.indexOf(socket.id) >= 0) {
      socket.emit("join_room_fail");
      return;
    }
    if (rooms[data["room"]].password != null) {
      socket.emit("private_room", { success: true });
    } else {
      if (rooms[data["room"]].users.indexOf(user[socket.id]) < 0) {
        rooms[data["room"]].users.push(user[socket.id]);
        socket.join(data["room"]);
        socket.emit("private_room", { success: false });
        console.log(rooms[data["room"]].users);
        io.to(data["room"]).emit("get_users", {
          users: rooms[data["room"]].users,
        });
        if (Object.keys(rooms).length == 0) {
          io.sockets.emit("get_rooms", { success: false });
        } else {
          io.sockets.emit("get_rooms", { success: true, rooms: rooms });
        }
      }
    }
  });

  socket.on("join_password_room", function (data) {
    if (data["password"] == rooms[data["room"]].password) {
      rooms[data["room"]].users.push(user[socket.id]);
      socket.join(data["room"]);
      socket.emit("password_back", { success: true });
      io.to(data["room"]).emit("get_users", {
        users: rooms[data["room"]].users,
      });
      if (Object.keys(rooms).length == 0) {
        io.sockets.emit("get_rooms", { success: false });
      } else {
        console.log(rooms);
        io.sockets.emit("get_rooms", { success: true, rooms: rooms });
      }
    } else {
      socket.emit("password_back", { success: false });
    }
  });

  socket.on("invite_user", function (data) {
    if (rooms[data["room"]].users.indexOf(data["user"]) >= 0) {
      socket.emit("invite_back", { success: false });
      return;
    }
    for (const key in user) {
      if (user[key] == data["user"]) {
        io.to(key).emit("invite_message", {
          from: user[socket.id],
          room: data["room"],
        });
        return;
      }
    }
    socket.emit("invite_back", { success: false });
  });

  socket.on("accept_invite", function (data) {
    for (const key in rooms) {
      for (let i = 0; i < rooms[key].users.length; i++) {
        if (rooms[key].users[i] == user[socket.id]) {
          socket.emit("accept_invite_back", {
            success: true,
            room: data["room"],
            leave: key,
          });
          return;
        }
      }
      socket.emit("accept_invite_back", { success: false, room: data["room"] });
    }
  });

  socket.on("disconnect", function () {
    if (user[socket.id]) {
      for (const key in rooms) {
        if (rooms[key].users.indexOf(user[socket.id]) >= 0) {
          const index = rooms[key].users.indexOf(user[socket.id]);
          rooms[key].users.splice(index, 1);
          io.to(key).emit("get_users", { users: rooms[key].users });
          if (Object.keys(rooms).length == 0) {
            io.sockets.emit("get_rooms", { success: false });
          } else {
            console.log(rooms);
            io.sockets.emit("get_rooms", { success: true, rooms: rooms });
          }
        }
      }
      delete user[socket.id];
    }
  });
});
