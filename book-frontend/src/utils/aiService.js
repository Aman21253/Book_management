import API from "../api/axios";

/**
 * Generate a book summary using AI service
 * @param {string} title - Book title
 * @param {string} author - Book author
 * @returns {Promise<string>} - The generated summary
 */
export async function generateBookSummary(title, author) {
    try {
        const response = await API.post("books/generate_summary/", {
            title,
            author,
        });
        return response.data.summary;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error(error.response?.data?.error || "Failed to generate summary");
    }
}
