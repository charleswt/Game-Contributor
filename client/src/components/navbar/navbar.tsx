import '../../../public/css/style.css'
import CookieAuth from '../../utils/auth'
if(CookieAuth.getToken()){

}
export default function Navbar(): any{
    return (
        <header>
            <ul>
                <li>Logo</li>
                <li onClick={()=>window.location.href = '/main'}>Home</li>
                <input type="text"/>
                <li onClick={()=>
                    CookieAuth.getToken()?
                    window.location.href = '/me':
                    window.location.href = '/login'
                    }>Me</li>
                <li>Settings icon</li>
            </ul>
        </header>
    )
}