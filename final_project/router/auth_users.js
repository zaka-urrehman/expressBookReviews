const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});



// Add a book review

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }

  // Check if the user is authenticated
  if (!req.session.authorization || !req.session.authorization.username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  const username = req.session.authorization.username;

  // Target the book directly using the ISBN as the key
  const targetBook = books[isbn];

  if (targetBook) {
    // Check if the user has already reviewed this book
    const existingReview = targetBook.reviews[username];

    if (existingReview) {
      // If the user has already reviewed the book, modify the existing review
      targetBook.reviews[username] = review;
    } else {
      // If the user hasn't reviewed the book, add a new review
      targetBook.reviews[username] = review;
    }

    return res.status(200).json({ message: "Review added/modified successfully" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});



// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Check if the user is authenticated
  if (!req.session.authorization || !req.session.authorization.username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  const username = req.session.authorization.username;

  // Target the book directly using the ISBN as the key
  const targetBook = books[isbn];

  if (targetBook) {
    // Check if the user has a review for this book
    if (targetBook.reviews.hasOwnProperty(username)) {
      // Delete the user's review for this book
      delete targetBook.reviews[username];
      
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "User has no review for this book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});





module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
