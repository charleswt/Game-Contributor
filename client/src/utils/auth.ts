import Cookies from 'universal-cookie';
import {jwtDecode} from 'jwt-decode';

const cookies = new Cookies();

type CookieAuthenticate = {
    login: (tokenId: string) => void;
    getToken: () => string | null;
    logout: () => void;
    getTokenId: () => number | null
    checkExpiration: () => boolean | null | Error
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
        return cookies.get('token_auth') || null;
    }

    getTokenId() {
        const token = cookies.get('token_auth')
        if(!token) return null;
        const decoded: any = jwtDecode(token)
        return decoded.id || null
    }

    checkExpiration() {
        const token: string | undefined = this.getToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                if (Date.now() >= decoded.exp * 1000) {
                    this.logout();
                    console.log('Token expired, logging out');
                    return null
                } else {
                    console.log('Token is valid');
                    return true
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                this.logout();
                return new Error("Unable to decode token:")
            }
        } else {
            console.log('No token found');
            return null
        }
    }
}

export default new CookieAuth();