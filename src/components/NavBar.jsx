import styles from './NavLinks.module.css';

export const Location = {
    Header: 1,
    Footer: 2
}

const NavBar = ({ loc, links }) => {
    return (
        <div class={loc === Location.Footer ? styles.Footer : styles.Header}>
            {links.map((link, _) => (
                <a href={link.href}>{link.text}</a>
            ))}
        </div>
    );
};

export default NavBar;