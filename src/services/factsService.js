import axios from "axios"

const API_KEY = import.meta.env.VITE_FACTS_API_KEY
const BASE_URL = import.meta.env.VITE_FACTS_API_URL || "https://api.api-ninjas.com/v1/facts"

/**
 * Fetches random facts to use as typing lesson text.
 * @param {number} count - Number of facts to fetch (1–30).
 * @returns {Promise<string[]>} Array of fact strings.
 */

export async function fetchFacts(count = 1) {
    try {
        const response = await axios.get(BASE_URL, {
            params: { limit: count },
            headers: { "X-Api-Key": API_KEY },
        })
        return response.data.map((item) => item.fact)
    } catch (error) {
        throw error;
    }
}
