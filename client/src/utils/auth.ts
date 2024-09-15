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
        cookies.remove('token_auth');
        return document.location.href = '/';
    }

    getToken() {
        return cookies.get('token_auth') || undefined;
    }

    getTokenId() {
        
        const decoded: any = jwtDecode(cookies.get('token_auth'))
        return decoded.id
    }

    checkExpiration() {
        const token: string | undefined = this.getToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                if (Date.now() >= decoded.exp * 1000) {
                    this.logout();
                    console.log('Token expired, logging out');
                    return undefined
                } else {
                    console.log('Token is valid');
                    return true
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                this.logout();
            }
        } else {
            console.log('No token found');
            return undefined
        }
    }
}

export default new CookieAuth();