import "../styles/page.css";
import "../styles/table.css";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await API.get("books/");
      setBooks(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div className="page">
      <div className="page-content">
        <div className="card">
          <h2>Book Details</h2>

          <div className="table-wrapper">
            <table className="table fancy-table">
              <thead>
                <tr>
                  <th>Book ID</th>
                  <th>Book Name</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Price (₹)</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.price}</td>
                    <td>{book.quantity}</td>
                    <td className="action">👁️</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (UI only for now) */}
          <div className="pagination">
            <button>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}