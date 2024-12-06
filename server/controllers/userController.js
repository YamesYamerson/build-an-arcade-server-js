const users = []; // Temporary in-memory storage for users

// Create a new user
function createUser(req, res) {
    const { username, email } = req.body;
    if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required.' });
    }

    const user = { id: users.length + 1, username, email };
    users.push(user);
    res.status(201).json({ message: 'User created successfully.', user });
}

// Get all users
function getAllUsers(req, res) {
    res.json(users);
}

// Get a specific user by ID
function getUserById(req, res) {
    const { id } = req.params;
    const user = users.find((u) => u.id === parseInt(id, 10));
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
}

module.exports = { createUser, getAllUsers, getUserById };
