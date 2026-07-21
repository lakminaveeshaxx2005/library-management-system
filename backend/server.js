const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); // Import the database connection

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// CRUD ROUTES FOR BOOKS
// ==========================================

// 1. GET ALL BOOKS
app.get('/api/books', (req, res) => {
    const sql = 'SELECT * FROM books ORDER BY book_id DESC';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.json(results);
    });
});

// 2. ADD A NEW BOOK
app.post('/api/books', (req, res) => {
    const { title, author, category, isbn, quantity } = req.body;

    // Validate required fields
    if (!title || !author) {
        return res.status(400).json({
            error: 'Title and Author are required'
        });
    }

    if (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
        return res.status(400).json({ error: 'Quantity must be a non-negative whole number' });
    }

    const sql = `
        INSERT INTO books (title, author, category, isbn, quantity)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, author, category, isbn, quantity ?? 1],
        (err, result) => {
            if (err) {
                console.error('Error inserting book:', err);
                return res.status(500).json({
                    error: 'Failed to add book'
                });
            }

            res.status(201).json({
                message: 'Book added successfully',
                bookId: result.insertId
            });
        }
    );
});

// 3. UPDATE A BOOK
app.put('/api/books/:id', (req, res) => {
    const bookId = req.params.id;
    const { title, author, category, isbn, quantity } = req.body;

    if (!title || !author || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
        return res.status(400).json({ error: 'Title, author, and a non-negative whole quantity are required' });
    }

    const sql = `
        UPDATE books
        SET title = ?, author = ?, category = ?, isbn = ?, quantity = ?
        WHERE book_id = ?
    `;

    db.query(
        sql,
        [title, author, category, isbn, quantity, bookId],
        (err, result) => {
            if (err) {
                console.error('Error updating book:', err);
                return res.status(500).json({
                    error: 'Failed to update book'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            res.json({
                message: 'Book updated successfully'
            });
        }
    );
});

// 4. DELETE A BOOK
app.delete('/api/books/:id', (req, res) => {
    const bookId = req.params.id;

    const sql = 'DELETE FROM books WHERE book_id = ?';

    db.query(sql, [bookId], (err, result) => {
        if (err) {
            console.error('Error deleting book:', err);
            return res.status(500).json({
                error: 'Failed to delete book'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.json({
            message: 'Book deleted successfully'
        });
    });
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});