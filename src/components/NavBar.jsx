import styles from './NavLinks.module.css';

export const NavType = {
    Header: 'header',
    Hooter: 'footer'
}

const NavBar = ({ type, links }) => {
    return (
        <div class={type === 'header' ? styles.Header : styles.Footer}>
            {links.map((link, _) => (
                <a href={link.href}>{link.text}</a>
            ))}
        </div>
    );
};

export default NavBar;