import axios from 'axios';

console.log("Minha API URL:", process.env.EXPO_PUBLIC_API_URL);

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL
})

export {api}