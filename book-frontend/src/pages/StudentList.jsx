import "../styles/page.css";
import "../styles/table.css";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        setLoading(true);
        try {
          const res = await API.get("students/");
          const data = res.data || res.data.results;
          setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
          console.log("Fetch students error:", error.response?.data || error.message);
          alert("Error fetching students. Please try again.");
          setStudents([]);
        }finally{
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStudents();
    },[]);
    if (loading) return <p style={{padding:40}}>Loading students...</p>;

    return (
        <div className="page">
            <div className="page-content">
                <div className="card-8">
                    <h3>Student List</h3>

                    <div className="table-wrapper">
                        <table className="table fancy-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.name}</td>
                                            <td>{student.email}</td>
                                            <td>{student.phone}</td>
                                            <td>{student.address}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                            No students available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

