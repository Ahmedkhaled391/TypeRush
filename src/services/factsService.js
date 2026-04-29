import axios from "axios"

const API_KEY = import.meta.env.VITE_FACTS_API_KEY
const BASE_URL = "https://api.api-ninjas.com/v1/facts"

/**
 * Fetches random facts to use as typing lesson text.
 * @param {number} count - Number of facts to fetch (1–30).
 * @returns {Promise<string[]>} Array of fact strings.
 */

export async function fetchFacts(count = 1) {
    console.log("Fetching facts with key:", API_KEY, "count:", count);
    
    try {
        const response = await axios.get(BASE_URL, {
            params: { limit: count },
            headers: { "X-Api-Key": API_KEY },
        })
        console.log("Facts API Response:", response.data);
        return response.data.map((item) => item.fact)
    } catch (error) {
        console.error("Facts API Error:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: error.config,
            message: error.message
        });
        throw error;
    }
}
