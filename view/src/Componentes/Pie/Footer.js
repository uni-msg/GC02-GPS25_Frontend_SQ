import './Footer.css'; 
import logo from './../../Recursos/iconoFooter.png';
import { Link } from "react-router-dom";

function footer() {
    return (
        <footer id="pie" className=" bg-primary-subtle">
            <hr id="lineaPie"/>
            <div id="infoPie">
                <div id="iconoPie">
                    <img src={logo} className="" alt="" />
                </div>
                <div id="pieTexto1">
                    <h3 className="text-morado fst-italic m-0 mb-2">UnderSound</h3>
                    <Link to="/soporte#contacto"> <h5 className='m-0'> Contáctanos </h5></Link>
                </div>
                <div id="pieTexto2">
                    <Link to="/soporte#soporte-container"> <h5 className='mt-3'>FAQ</h5></Link>
                    <div id="otrosContactos" className="d-flex mt-3">
                        <div>
                            <a href="https://x.com/home?lang=es" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-square-x-twitter fa-5x"></i>
                            </a>
                        </div>
                        <div>
                            <a href="https://discord.com/" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-discord fa-5x"></i>
                            </a>
                        </div>
                        <div>
                            <a href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-linkedin fa-5x"></i>
                            </a>
                        </div>
                        <div>
                            <a href="https://www.tiktok.com/@tiktok_es?lang=es" target="_blank" rel="noopener noreferrer">
                                <i className="fa-brands fa-tiktok fa-5x"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default footer;