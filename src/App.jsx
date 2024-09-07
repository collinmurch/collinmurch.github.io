import WaveCanvas from './components/WaveCanvas';
import NavBar, { Location } from './components/NavBar';

import logo from './assets/profile.jpeg';
import githubLogo from './assets/github-logo.svg';
import linkedinLogo from './assets/linkedin-logo.svg';
import xLogo from './assets/x-logo.svg';

import styles from './App.module.css';

function App() {

  return (
    <div class={styles.App}>
      <NavBar loc={Location.Header} links={[
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

      <NavBar loc={Location.Footer} links={[
        { text: <img src={xLogo} alt="twitter logo" width="25vmin" />, href: 'https://x.com/collinmurch' },
        { text: <img src={githubLogo} alt="github logo" width="25vmin" />, href: 'https://github.com/collinmurch' },
        { text: <img src={linkedinLogo} alt="linkedin logo" width="25vmin" />, href: 'https://linkedin.com/in/collinmurch' },
      ]} />
      <WaveCanvas style={styles.waveCanvas} />
    </div>
  );
}

export default App;
