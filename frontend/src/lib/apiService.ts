import axios from 'axios';

const apiService = axios.create({
    baseURL: 'http://localhost:3005/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to set the Bearer token in the request header
export const setAuthToken = (token: string) => {
    if (token) {
        console.log('set storage token to header')
        apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        //remove properly the token from the header if the token is not valid
        delete apiService.defaults.headers.common['Authorization'];
    }
};

setTimeout(() => {
    console.log('Try to connect API');

    apiService.get('/auth/index').then((res) => {
        console.log(res.data);
    }).catch((err) => {
        console.log(err);
    });
}, 1000);

export default apiService;  