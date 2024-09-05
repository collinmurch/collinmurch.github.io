import WaveCanvas from './components/WaveCanvas';
import NavBar, { NavType } from './components/NavBar';

import logo from './assets/profile.jpeg';
import styles from './App.module.css';

function App() {

  return (
    <div class={styles.App}>
      <NavBar class={styles.nav} type={NavType.Header} links={[
        { text: 'About', href: '/' },
        { text: 'Work', href: '/' },
        { text: 'Contact', href: '/' }
      ]} />

      <div class={styles.intro}>
        <h1 class={styles.name}>
          Collin Murch
        </h1>
        <p class={styles.about}>
          Full stack software engineer.
        </p>
      </div>
      <img src={logo} class={styles.logo} alt="logo" />

      <NavBar type={NavType.Footer} links={[
        { text: 'Twitter', href: 'https://x.com/collinmurch' },
        { text: 'GitHub', href: 'https://github.com/collinmurch' },
        { text: 'LinkedIn', href: 'https://linkedin.com/in/collinmurch' },
      ]} />
      <WaveCanvas style={styles.waveCanvas} />
    </div>
  );
}

export default App;
