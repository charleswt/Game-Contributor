import Cookies from 'universal-cookie';
import {jwtDecode} from 'jwt-decode';

const cookies = new Cookies();

type CookieAuthenticate = {
    login: (tokenId: string) => void;
    getToken: () => string | undefined;
    logout: () => void;
    checkExpiration: () => void;
}

class CookieAuth implements CookieAuthenticate {
    login(tokenId: string) {
        cookies.set('token_auth', tokenId, { path: '/' });
    }

    logout() {
        cookies.remove('token_auth', { path: '/' });
    }

    getToken() {
        return cookies.get('token_auth');
    }

    checkExpiration() {
        const token: string | undefined = this.getToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                if (Date.now() >= decoded.exp * 1000) {
                    this.logout();
                    console.log('Token expired, logging out');
                } else {
                    console.log('Token is valid');
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                this.logout();
            }
        } else {
            console.log('No token found');
        }
    }
}

export default new CookieAuth();