class User {
  constructor(id, username) {
    this.id = id;
    this.username = username;
  }

  // User storage
  static users = [];

  // Fetch user by ID
  static findById(id) {
    return this.users.find(user => user.id === id);
  }

  // Create new user
  static create(data) {
    const id = this.users.length > 0 ? this.users[this.users.length - 1].id + 1 : 1;
    const user = new User(id, data.username);
    this.users.push(user);
    return user;
  }

  // Update existing user
  static update(id, data) {
    const user = this.findById(id);
    if (user) {
      Object.assign(user, data);
      return user;
    }
  }

  // Delete user
  static delete(id) {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex > -1) {
      this.users.splice(userIndex, 1);
    }
  }
}

module.exports = User;