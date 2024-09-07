import styles from './NavLinks.module.css';

export const Location = {
    Header: 1,
    Footer: 2
}

const NavBar = ({ loc, links }) => {
    return (
        <div class={loc === Location.Header ? styles.Header : styles.Footer}>
            {links.map((link, _) => (
                <a href={link.href}> {link.text} </a>
            ))}
        </div>
    );
};

export default NavBar;