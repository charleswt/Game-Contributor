import Cookies from 'universal-cookie'
import {jwtDecode} from 'jwt-decode';

const cookies = new Cookies()

type CookieAuthenticate = {
    login: (tokenId: string)=>void;
    getToken: ()=>string;
}

class CookieAuth implements CookieAuthenticate {
    login(tokenId: string) {
        cookies.set('token_auth', tokenId);
        window.location.reload();
    }
    logout(){
        cookies.remove('auth_token');
        window.location.reload();
    }
    getToken(){
        return cookies.get('token_auth')
    }
    checkExpiration() {
        const token: string | undefined = cookies.get('token_auth');
        if (token) {
            const decoded: any = jwtDecode(token);
            if (Date.now() >= decoded.exp * 1000) {
                this.logout();
            }
        }
    }
}


export default new CookieAuth()