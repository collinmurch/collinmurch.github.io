import WaveCanvas from './components/WaveCanvas';
import NavBar, { NavType } from './components/NavBar';

import logo from './assets/profile.jpeg';
import styles from './App.module.css';

function App() {
  return (
    <div class={styles.App}>
      <WaveCanvas />
      <NavBar type={NavType.Header} links={[
        { text: 'About', href: '/' },
        { text: 'Work', href: '/' },
        { text: 'Contact', href: '/' }
      ]} />

      <div class={styles.intro}>
        <img src={logo} class={styles.logo} alt="logo" />
        <h1 class={styles.name}>
          [Under Development]
        </h1>
        <p class={styles.about}>
          Full stack software engineer.
        </p>
      </div>

      <NavBar type={NavType.Footer} links={[
        { text: 'Twitter', href: 'https://x.com/collinmurch' },
        { text: 'GitHub', href: 'https://github.com/collinmurch' },
        { text: 'LinkedIn', href: 'https://linkedin.com/in/collinmurch' },
      ]} />
    </div>
  );
}

export default App;
