import styles from './NavLinks.module.css';

export const NavType = {
    Header: 1,
    Hooter: 2
}

const NavBar = ({ type, links }) => {
    return (
        <div class={type === NavType.Header ? styles.Header : styles.Footer}>
            {links.map((link, _) => (
                <a href={link.href}> {link.text} </a>
            ))}
        </div>
    );
};

export default NavBar;