import axios from 'axios';
import jwt_decode from 'jwt-decode';

export const axiosInstance = axios.create({
    baseURL: 'https://dashboard-jwt-mongodb.onrender.com',
});

const refreshToken = async () => {
    try {
        const res = await axiosInstance.post('/auth/refresh', {
            withCredentials: true,
        });
        return res.data;
    } catch (err) {
        console.log(err);
    }
};

export const createAxios = (user, dispatch, stateSuccess) => {
    const newInstance = axios.create({
        baseURL: 'https://dashboard-jwt-mongodb.onrender.com',
    });
    newInstance.interceptors.request.use(
        async (config) => {
            let date = new Date();
            const decodedToken = jwt_decode(user?.accessToken);
            if (decodedToken.exp < date.getTime() / 1000) {
                const data = await refreshToken();
                const refreshUser = {
                    ...user,
                    accessToken: data.accessToken,
                };
                dispatch(stateSuccess(refreshUser));
                config.headers['token'] = 'Bearer ' + data.accessToken;
            }
            return config;
        },
        (err) => {
            return Promise.reject(err);
        },
    );
    return newInstance;
};
