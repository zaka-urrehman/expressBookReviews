const express = require('express');
// let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



// async books data fetching using axios
const fetchBooks = async () => {
  try {
    const response = await axios.get('./booksdb.js'); // Replace 'http://your-api-url/books' with the actual endpoint URL
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error.message);
    throw error;
  }
};

module.exports = fetchBooks




const doesExist = (username) => {
  let usersWithSameName = users.filter((user) => user.username === username )
  if (usersWithSameName.length > 0) {
    return true;
  } else {
    return false;
  }
}


public_users.post("/register", (req, res) => {

  const { username, password } = req.body;
  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"},);
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});




// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  //Write your code here
  const books = await fetchBooks();
  res.status(200).json({ books: (books) });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;
  const books = await fetchBooks();
  res.status(200).json(books[isbn]);

});

// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const books = await fetchBooks();
  const requestedAuthor = req.params.author;
  const bookIds = Object.keys(books);
  const matchingBooks = bookIds
    .map(id => books[id])
    .filter(book => book.author === requestedAuthor);

  if (matchingBooks.length > 0) {
    res.status(200).json({ books: matchingBooks });
  } else {
    res.status(404).json({ message: 'Books by the author not found' });
  }

});



public_users.get('/title/:title',async function (req, res) {
  const books = await fetchBooks();
  const requestedTitle = normalizeTitle(req.params.title); // Normalize the requested title
  const bookIds = Object.keys(books);

  // Normalize each book title before comparison
  const matchingBooks = bookIds
    .map(id => books[id])
    .filter(book => normalizeTitle(book.title) === requestedTitle);

  if (matchingBooks.length > 0) {
    res.status(200).json({ books: matchingBooks });
  } else {
    res.status(404).json({ message: 'Books by the title not found' });
  }
});


// Function to normalize a title (convert to lowercase and remove non-alphanumeric characters)
function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}



//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const requestedReview = req.params.isbn
  //Write your code here
  return res.status(200).json(books[requestedReview]["reviews"]);
});

module.exports.general = public_users;
