import WaveCanvas from '../components/WaveCanvas';
import NavBar, { Location } from '../components/NavBar';

import logo from '../assets/profile.jpeg';
import githubLogo from '../assets/github-logo.svg';
import linkedinLogo from '../assets/linkedin-logo.svg';
import xLogo from '../assets/x-logo.svg';

import styles from './Home.module.css';

const Home = () => {
  return (
    <div class={styles.Home}>
      <NavBar loc={Location.Header} links={[
        { text: 'About', href: '/about' },
        { text: 'Work', href: '/work' },
        { text: 'Contact', href: '/contact' }
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
        { text: <img src={xLogo} alt="twitter logo" style={styles.social} />, href: 'https://x.com/collinmurch' },
        { text: <img src={githubLogo} alt="github logo" style={styles.social} />, href: 'https://github.com/collinmurch' },
        { text: <img src={linkedinLogo} alt="linkedin logo" style={styles.social} />, href: 'https://linkedin.com/in/collinmurch' },
      ]} />
      <WaveCanvas style={styles.waveCanvas} />
    </div>
  );
}

export default Home;
